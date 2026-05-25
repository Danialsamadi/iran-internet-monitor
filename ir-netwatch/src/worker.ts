import { CATEGORIES } from './config.ts';
import { checkOne } from './checker.ts';
import {
  appendHistoryRow,
  computeUptimePct,
  historyCSVToDayEntries,
  buildSummary,
  type PageData,
  type ServiceWithHistory,
  type StatusChange,
} from './kv.ts';
import { sendTelegramNotification } from './telegram.ts';

export interface Env {
  IR_NETWATCH: KVNamespace;
  ASSETS: Fetcher;
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_CHAT_ID?: string;
}

const JSON_HEADERS = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store',
  'Access-Control-Allow-Origin': '*',
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { pathname } = new URL(request.url);

    if (pathname === '/api/status') {
      const raw = await env.IR_NETWATCH.get('page-data');
      if (!raw) {
        return new Response('{"error":"no data yet — first cron run pending"}', {
          status: 503,
          headers: JSON_HEADERS,
        });
      }
      return new Response(raw, { headers: JSON_HEADERS });
    }

    if (pathname.startsWith('/api/status/')) {
      const id = pathname.slice('/api/status/'.length);
      const raw = await env.IR_NETWATCH.get(`status:${id}`);
      if (!raw) {
        return new Response('{"error":"not found"}', { status: 404, headers: JSON_HEADERS });
      }
      return new Response(raw, { headers: JSON_HEADERS });
    }

    return env.ASSETS.fetch(request);
  },

  async scheduled(_event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    ctx.waitUntil(runChecks(env));
  },
};

async function runChecks(env: Env): Promise<void> {
  const now = new Date();
  const nowISO = now.toISOString();
  const nowUnix = Math.floor(now.getTime() / 1000);

  const prevByID = new Map<string, ServiceWithHistory>();
  const existingRaw = await env.IR_NETWATCH.get('page-data');
  if (existingRaw) {
    try {
      const pd = JSON.parse(existingRaw) as PageData;
      for (const s of pd.services) prevByID.set(s.id, s);
    } catch { /* corrupt KV entry — start fresh */ }
  }

  const serviceIdToCat = new Map<string, string>();
  for (const cat of CATEGORIES) {
    for (const s of cat.services) serviceIdToCat.set(s.id, cat.cat_id);
  }

  const allServices = CATEGORIES.flatMap(c => c.services);

  const toCheck = allServices.filter(s => {
    const prev = prevByID.get(s.id);
    if (!prev) return true;
    return (nowUnix - prev.last_check_epoch) >= (s.interval || 300);
  });

  const CONCURRENCY = 20;
  const notifications: StatusChange[] = [];
  const updatedByID = new Map<string, ServiceWithHistory>(prevByID);

  for (let i = 0; i < toCheck.length; i += CONCURRENCY) {
    const batch = toCheck.slice(i, i + CONCURRENCY);
    const settled = await Promise.allSettled(
      batch.map(async s => {
        const cr = await checkOne(s, now);
        const prev = prevByID.get(s.id);
        const prevStatus = prev?.status ?? 'unknown';

        const histKey = `history:${s.id}`;
        const existingHist = (await env.IR_NETWATCH.get(histKey)) ?? '';
        const newHist = appendHistoryRow(
          existingHist, nowISO, cr.status, cr.value, cr.response_time_ms, cr.http_code,
        );
        await env.IR_NETWATCH.put(histKey, newHist);

        const result: ServiceWithHistory = {
          id: s.id,
          name: s.name,
          check_type: s.type,
          status: cr.status,
          message: cr.message,
          value: cr.value,
          response_time_ms: cr.response_time_ms,
          uptime_pct: computeUptimePct(newHist),
          last_check: nowISO,
          last_check_epoch: nowUnix,
          prev_status: prevStatus,
          history: historyCSVToDayEntries(newHist, now),
          cat: serviceIdToCat.get(s.id) ?? 'OTHER',
        };

        await env.IR_NETWATCH.put(`status:${s.id}`, JSON.stringify(result));

        if (prevStatus !== 'unknown' && prevStatus !== cr.status) {
          notifications.push({
            id: s.id,
            name: s.name,
            prevStatus,
            newStatus: cr.status,
            message: cr.message,
            responseTimeMs: cr.response_time_ms,
            timestamp: nowISO.replace('T', ' ').slice(0, 19),
          });
        }

        return { id: s.id, result };
      }),
    );

    for (const r of settled) {
      if (r.status === 'fulfilled') updatedByID.set(r.value.id, r.value.result);
    }
  }

  for (const s of allServices) {
    const r = updatedByID.get(s.id);
    if (r && !r.history) {
      const hist = (await env.IR_NETWATCH.get(`history:${s.id}`)) ?? '';
      r.history = historyCSVToDayEntries(hist, now);
    }
  }

  const services = allServices
    .map(s => updatedByID.get(s.id))
    .filter((s): s is ServiceWithHistory => s !== undefined);

  const categories = CATEGORIES.map(c => ({
    name: c.name,
    icon: c.icon,
    service_ids: c.services.map(s => s.id),
  }));

  const pageData: PageData = {
    generated: nowISO,
    services,
    summary: buildSummary(services, now),
    categories,
  };

  await env.IR_NETWATCH.put('page-data', JSON.stringify(pageData));

  for (const n of notifications) {
    await sendTelegramNotification(n, env);
  }
}
