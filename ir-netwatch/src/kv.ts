export type Status = 'up' | 'degraded' | 'down' | 'unknown';

export interface ServiceResult {
  id: string;
  name: string;
  check_type: string;
  status: Status;
  message: string;
  value: number;
  response_time_ms: number;
  uptime_pct: number;
  last_check: string;
  last_check_epoch: number;
  prev_status: string;
}

export interface Incident {
  severity: 'degraded' | 'down';
  label: string;
  durationMin: number;
}

export interface DayEntry {
  day: number;    // 0 = today, 89 = 90 days ago
  status: Status;
  uptime: number; // 0-100
  incidents: Incident[];
}

export interface ServiceWithHistory extends ServiceResult {
  history: DayEntry[];
  cat: string;
}

export interface Summary {
  overall_status: string;
  last_check: string;
  last_check_epoch: number;
  total_services: number;
  up: number;
  degraded: number;
  down: number;
  unknown: number;
}

export interface CategoryInfo {
  name: string;
  icon: string;
  service_ids: string[];
}

export interface StatusChange {
  id: string;
  name: string;
  prevStatus: string;
  newStatus: string;
  message: string;
  responseTimeMs: number;
  timestamp: string;
}

export interface PageData {
  generated: string;
  services: ServiceWithHistory[];
  summary: Summary;
  categories: CategoryInfo[];
}

interface HistoryCsvRow {
  timestamp: string;
  status: Status;
  value: number;
  response_time_ms: number;
  http_code: number;
}

const MAX_HISTORY_ROWS = 8640;

export function parseHistoryCsv(csv: string): HistoryCsvRow[] {
  return csv
    .split('\n')
    .filter(line => line.trim().length > 0)
    .map(line => {
      const parts = line.split(',');
      return {
        timestamp: parts[0] ?? '',
        status: (parts[1] as Status) || 'unknown',
        value: parseFloat(parts[2] ?? '0') || 0,
        response_time_ms: parseInt(parts[3] ?? '0') || 0,
        http_code: parseInt(parts[4] ?? '0') || 0,
      };
    });
}

export function appendHistoryRow(
  existing: string,
  nowISO: string,
  status: Status,
  value: number,
  responseTime: number,
  httpCode: number,
): string {
  const newRow = `${nowISO},${status},${Math.round(value)},${responseTime},${httpCode}`;
  const lines = existing ? existing.split('\n').filter(l => l.trim()) : [];
  lines.push(newRow);
  const trimmed = lines.length > MAX_HISTORY_ROWS
    ? lines.slice(lines.length - MAX_HISTORY_ROWS)
    : lines;
  return trimmed.join('\n') + '\n';
}

export function computeUptimePct(csv: string): number {
  const rows = parseHistoryCsv(csv);
  if (rows.length === 0) return 100;
  const upCount = rows.filter(r => r.status === 'up').length;
  return Math.round((upCount / rows.length) * 100 * 100) / 100;
}

export function historyCSVToDayEntries(csv: string, now: Date): DayEntry[] {
  const rows = parseHistoryCsv(csv);
  const todayMidnight = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());

  const byDay = new Map<number, HistoryCsvRow[]>();
  for (const row of rows) {
    const d = new Date(row.timestamp);
    const rowMidnight = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
    const dayOffset = Math.round((todayMidnight - rowMidnight) / 86_400_000);
    if (dayOffset < 0 || dayOffset > 89) continue;
    if (!byDay.has(dayOffset)) byDay.set(dayOffset, []);
    byDay.get(dayOffset)!.push(row);
  }

  const entries: DayEntry[] = [];
  for (let day = 89; day >= 0; day--) {
    const dayRows = byDay.get(day) ?? [];
    if (dayRows.length === 0) {
      entries.push({ day, status: 'unknown', uptime: 0, incidents: [] });
      continue;
    }
    const upCount = dayRows.filter(r => r.status === 'up').length;
    const uptime = Math.round((upCount / dayRows.length) * 100);
    const worstStatus = dayRows.reduce<Status>((worst, r) => {
      if (worst === 'down') return 'down';
      if (r.status === 'down') return 'down';
      if (worst === 'degraded' || r.status === 'degraded') return 'degraded';
      return worst === 'unknown' ? r.status : worst;
    }, 'up');
    const incidents = synthesizeIncidents(dayRows);
    entries.push({ day, status: worstStatus, uptime, incidents });
  }
  return entries;
}

function synthesizeIncidents(rows: HistoryCsvRow[]): Incident[] {
  const incidents: Incident[] = [];
  let runStart: number | null = null;
  let runSeverity: 'degraded' | 'down' = 'degraded';
  let runLastTs = 0;

  const flush = () => {
    if (runStart === null) return;
    incidents.push({
      severity: runSeverity,
      label: runSeverity === 'down'
        ? 'Endpoint unreachable from EU edge'
        : 'Elevated latency / partial loss',
      durationMin: Math.round((runLastTs - runStart) / 60_000) + 5,
    });
    runStart = null;
  };

  for (const row of rows) {
    if (row.status === 'up' || row.status === 'unknown') {
      flush();
    } else {
      const ts = new Date(row.timestamp).getTime();
      if (runStart === null) {
        runStart = ts;
        runSeverity = row.status === 'down' ? 'down' : 'degraded';
      } else if (row.status === 'down') {
        runSeverity = 'down';
      }
      runLastTs = ts;
    }
  }
  flush();
  return incidents;
}

export function buildSummary(services: Pick<ServiceResult, 'status'>[], now: Date): Summary {
  const up = services.filter(s => s.status === 'up').length;
  const degraded = services.filter(s => s.status === 'degraded').length;
  const down = services.filter(s => s.status === 'down').length;
  const unknown = services.filter(s => s.status === 'unknown').length;
  const overall = down > 0 ? 'major_outage'
    : degraded > 2 ? 'partial_outage'
    : degraded > 0 ? 'degraded'
    : 'up';
  return {
    overall_status: overall,
    last_check: now.toISOString(),
    last_check_epoch: Math.floor(now.getTime() / 1000),
    total_services: services.length,
    up, degraded, down, unknown,
  };
}
