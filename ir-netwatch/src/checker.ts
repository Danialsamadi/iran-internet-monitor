import type { Status } from './kv.ts';

export interface CheckResult {
  status: Status;
  message: string;
  value: number;
  response_time_ms: number;
  http_code: number;
}

export interface ServiceConfig {
  id: string;
  name: string;
  url: string;
  type: string;
  interval: number;
  threshold_warn?: number;
  threshold_crit?: number;
}

export function expandURL(url: string, now: Date): string {
  const nowUnix = Math.floor(now.getTime() / 1000);
  const ago7d = nowUnix - 7 * 86_400;
  const ago24h = nowUnix - 86_400;
  const ago30d = nowUnix - 30 * 86_400;
  const today = now.toISOString().slice(0, 10);
  const ago7dDate = new Date(ago7d * 1000).toISOString().slice(0, 10);
  const ago30dDate = new Date(ago30d * 1000).toISOString().slice(0, 10);
  return url
    .replace(/__NOW__/g, String(nowUnix))
    .replace(/__7D_AGO__/g, String(ago7d))
    .replace(/__24H_AGO__/g, String(ago24h))
    .replace(/__30D_AGO__/g, String(ago30d))
    .replace(/__TODAY__/g, today)
    .replace(/__7D_AGO_DATE__/g, ago7dDate)
    .replace(/__30D_AGO_DATE__/g, ago30dDate);
}

export function evalIODASignal(
  raw: unknown,
  threshWarn: number,
  threshCrit: number,
): [Status, number, string] {
  const data = raw as { data?: unknown[] } | null;
  if (!data?.data?.length) return ['unknown', 0, 'No data available'];
  const first = data.data[0];
  let values: number[] = [];
  if (Array.isArray(first) && first.length > 0) {
    const m = first[0] as { values?: unknown[] };
    if (Array.isArray(m?.values))
      values = m.values.filter((x): x is number => typeof x === 'number');
  } else if (typeof first === 'object' && first !== null) {
    const m = first as { values?: unknown[] };
    if (Array.isArray(m.values))
      values = m.values.filter((x): x is number => typeof x === 'number');
  }
  if (!values.length) return ['unknown', 0, 'No signal data'];
  const latest = values[values.length - 1];
  const maxVal = Math.max(...values);
  if (maxVal <= 0) return ['unknown', 0, 'No signal data'];
  const pct = (latest / maxVal) * 100;
  if (pct < threshCrit) return ['down', pct, `Critical — signal at ${Math.round(pct)}% of normal`];
  if (pct < threshWarn) return ['degraded', pct, `Degraded — signal at ${Math.round(pct)}% of normal`];
  return ['up', pct, `Healthy — signal at ${Math.round(pct)}% of normal`];
}

export function evalIODAAlerts(raw: unknown): [Status, number, string] {
  const data = raw as { data?: unknown[] } | null;
  const count = data?.data?.length ?? 0;
  if (count > 0) return ['degraded', count, `${count} active alert(s)`];
  return ['up', 0, 'No active outage alerts'];
}

export function evalOONI(raw: unknown): [Status, number, string] {
  const resp = raw as { result?: unknown } | null;
  if (!resp?.result) return ['unknown', 0, 'No measurement data'];
  let anomalyCount = 0, okCount = 0;
  const r = resp.result;
  if (Array.isArray(r)) {
    for (const item of r) {
      const m = item as { anomaly_count?: number; ok_count?: number };
      anomalyCount += m.anomaly_count ?? 0;
      okCount += m.ok_count ?? 0;
    }
  } else if (typeof r === 'object' && r !== null) {
    const m = r as { anomaly_count?: number; ok_count?: number };
    anomalyCount = m.anomaly_count ?? 0;
    okCount = m.ok_count ?? 0;
  }
  const total = anomalyCount + okCount;
  if (total <= 0) return ['unknown', 0, 'No measurement data'];
  const pct = (anomalyCount / total) * 100;
  if (pct > 80) return ['down', pct, `Blocked — ${Math.round(pct)}% anomaly rate`];
  if (pct > 30) return ['degraded', pct, `Partially blocked — ${Math.round(pct)}% anomaly rate`];
  return ['up', pct, `Accessible — ${Math.round(pct)}% anomaly rate`];
}

export function evalIrinter(
  raw: unknown,
  threshWarn: number,
  threshCrit: number,
): [Status, number, string] {
  const data = raw as { data?: { value: number }[] } | null;
  if (!data?.data?.length) return ['unknown', 0, 'No score data'];
  const score = data.data[data.data.length - 1].value;
  if (score < threshCrit) return ['down', score, `Poor — network score ${Math.round(score)}/100`];
  if (score < threshWarn) return ['degraded', score, `Fair — network score ${Math.round(score)}/100`];
  return ['up', score, `Good — network score ${Math.round(score)}/100`];
}

export function evalRIPEProbes(raw: unknown): [Status, number, string] {
  const data = raw as { count?: number } | null;
  const count = data?.count ?? 0;
  return ['up', count, `${count} probes`];
}

export function evalPsiphon(raw: unknown): [Status, number, string] {
  const m = raw as Record<string, unknown> | null;
  if (!m) return ['unknown', 0, 'Could not parse stats'];
  if (typeof m.total_stations === 'number')
    return ['up', m.total_stations, `${m.total_stations} active stations`];
  if (Array.isArray(m.daily_stats) && m.daily_stats.length > 0) {
    const last = m.daily_stats[m.daily_stats.length - 1] as { daily_unique_users?: number };
    if (typeof last.daily_unique_users === 'number')
      return ['up', last.daily_unique_users, `${last.daily_unique_users} daily unique users`];
  }
  return ['unknown', 0, 'Could not parse stats'];
}

export function evalTorCSV(raw: string): [Status, number, string] {
  const lines = raw.split('\n').filter(l => /^\d{4}-\d{2}-\d{2}/.test(l));
  if (!lines.length) return ['unknown', 0, 'No data available'];
  const parts = lines[lines.length - 1].split(',');
  const last = parts[parts.length - 1].replace(/\D/g, '');
  const v = parseFloat(last);
  if (!v) return ['unknown', 0, 'No user data'];
  return ['up', v, `${Math.round(v)} estimated users`];
}

export function evalRIPEstat(raw: unknown): [Status, number, string] {
  const data = raw as { status?: string } | null;
  if (data?.status === 'ok') return ['up', 100, 'Data available'];
  return ['unknown', 0, `API returned: ${data?.status ?? 'unknown'}`];
}

export function evalGeneric(httpCode: number): [Status, number, string] {
  if (httpCode >= 200 && httpCode < 300) return ['up', 100, `HTTP ${httpCode}`];
  if (httpCode >= 400) return ['down', 0, `HTTP ${httpCode}`];
  return ['down', 0, `HTTP ${httpCode}`];
}

export function evaluate(
  serviceType: string,
  raw: unknown,
  httpCode: number,
  threshWarn: number,
  threshCrit: number,
  isText: boolean,
): [Status, number, string] {
  if (httpCode === 0) return ['down', 0, 'Connection failed (timeout or unreachable)'];
  const tw = threshWarn || 80;
  const tc = threshCrit || 50;
  switch (serviceType) {
    case 'ioda_signal':       return evalIODASignal(raw, tw, tc);
    case 'ioda_alerts':       return evalIODAAlerts(raw);
    case 'ooni_aggregation':  return evalOONI(raw);
    case 'irinter_score':     return evalIrinter(raw, tw, tc);
    case 'ripe_probes':       return evalRIPEProbes(raw);
    case 'psiphon_stats':     return evalPsiphon(raw);
    case 'tor_csv':           return evalTorCSV(isText ? String(raw) : '');
    case 'ripestat':          return evalRIPEstat(raw);
    default:                  return evalGeneric(httpCode);
  }
}

export async function checkOne(service: ServiceConfig, now: Date): Promise<CheckResult> {
  const url = expandURL(service.url, now);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10_000);
  const start = Date.now();
  let httpCode = 0;
  let rawText = '';
  let rawJson: unknown = null;
  try {
    const resp = await fetch(url, { signal: controller.signal });
    httpCode = resp.status;
    rawText = await resp.text();
    clearTimeout(timer);
    try { rawJson = JSON.parse(rawText); } catch { /* non-JSON body */ }
  } catch {
    clearTimeout(timer);
  }
  const elapsed = Date.now() - start;
  const isText = service.type === 'tor_csv';
  const raw = isText ? rawText : rawJson;
  const [status, value, message] = evaluate(
    service.type, raw, httpCode,
    service.threshold_warn ?? 80,
    service.threshold_crit ?? 50,
    isText,
  );
  return { status, message, value, response_time_ms: elapsed, http_code: httpCode };
}
