import { describe, it, expect } from 'vitest';
import {
  parseHistoryCsv,
  appendHistoryRow,
  computeUptimePct,
  historyCSVToDayEntries,
  buildSummary,
} from '../kv.ts';

describe('parseHistoryCsv', () => {
  it('parses a valid CSV row', () => {
    const rows = parseHistoryCsv('2026-05-25T14:22:00Z,up,100,243,200\n');
    expect(rows).toHaveLength(1);
    expect(rows[0]).toEqual({
      timestamp: '2026-05-25T14:22:00Z',
      status: 'up',
      value: 100,
      response_time_ms: 243,
      http_code: 200,
    });
  });

  it('skips blank lines', () => {
    const rows = parseHistoryCsv('2026-05-25T14:22:00Z,up,100,243,200\n\n');
    expect(rows).toHaveLength(1);
  });
});

describe('appendHistoryRow', () => {
  it('appends a new row', () => {
    const result = appendHistoryRow('', '2026-05-25T14:22:00Z', 'up', 100, 243, 200);
    expect(result.trim()).toBe('2026-05-25T14:22:00Z,up,100,243,200');
  });

  it('trims to 8640 rows when exceeded', () => {
    const rows = Array.from({ length: 8640 }, (_, i) =>
      `2026-01-01T00:${String(i % 60).padStart(2, '0')}:00Z,up,100,100,200`
    ).join('\n') + '\n';
    const result = appendHistoryRow(rows, '2026-05-25T14:22:00Z', 'down', 0, 0, 0);
    const lines = result.split('\n').filter(l => l.trim());
    expect(lines).toHaveLength(8640);
    expect(lines[lines.length - 1]).toContain('down');
  });
});

describe('computeUptimePct', () => {
  it('returns 100 for empty CSV', () => {
    expect(computeUptimePct('')).toBe(100);
  });

  it('returns correct percentage', () => {
    const csv = [
      '2026-05-25T14:00:00Z,up,100,100,200',
      '2026-05-25T14:05:00Z,down,0,0,0',
      '2026-05-25T14:10:00Z,up,100,100,200',
      '2026-05-25T14:15:00Z,up,100,100,200',
    ].join('\n') + '\n';
    expect(computeUptimePct(csv)).toBe(75);
  });
});

describe('historyCSVToDayEntries', () => {
  it('returns 90 entries', () => {
    const entries = historyCSVToDayEntries('', new Date('2026-05-25T12:00:00Z'));
    expect(entries).toHaveLength(90);
  });

  it('maps today (day=0) correctly', () => {
    const now = new Date('2026-05-25T12:00:00Z');
    const csv = '2026-05-25T10:00:00Z,down,0,0,0\n';
    const entries = historyCSVToDayEntries(csv, now);
    const today = entries.find(e => e.day === 0);
    expect(today?.status).toBe('down');
    expect(today?.uptime).toBe(0);
    expect(today?.incidents).toHaveLength(1);
    expect(today?.incidents[0].severity).toBe('down');
  });

  it('assigns unknown for days with no data', () => {
    const entries = historyCSVToDayEntries('', new Date('2026-05-25T12:00:00Z'));
    expect(entries.every(e => e.status === 'unknown')).toBe(true);
  });

  it('computes uptime% from row ratio', () => {
    const now = new Date('2026-05-25T12:00:00Z');
    const csv = [
      '2026-05-25T10:00:00Z,up,100,100,200',
      '2026-05-25T10:05:00Z,up,100,100,200',
      '2026-05-25T10:10:00Z,down,0,0,0',
      '2026-05-25T10:15:00Z,up,100,100,200',
    ].join('\n') + '\n';
    const entries = historyCSVToDayEntries(csv, now);
    const today = entries.find(e => e.day === 0)!;
    expect(today.uptime).toBe(75);
  });
});

describe('buildSummary', () => {
  it('sets major_outage when any service is down', () => {
    const services = [
      { status: 'up' }, { status: 'down' }, { status: 'up' },
    ] as any[];
    const s = buildSummary(services, new Date());
    expect(s.overall_status).toBe('major_outage');
    expect(s.up).toBe(2);
    expect(s.down).toBe(1);
  });

  it('sets partial_outage for 3+ degraded, no down', () => {
    const services = [
      { status: 'degraded' }, { status: 'degraded' }, { status: 'degraded' }, { status: 'up' },
    ] as any[];
    const s = buildSummary(services, new Date());
    expect(s.overall_status).toBe('partial_outage');
  });

  it('sets up when all operational', () => {
    const services = [{ status: 'up' }, { status: 'up' }] as any[];
    const s = buildSummary(services, new Date());
    expect(s.overall_status).toBe('up');
  });
});
