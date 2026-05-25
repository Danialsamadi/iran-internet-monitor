import { describe, it, expect } from 'vitest';
import {
  expandURL,
  evalIODASignal,
  evalIODAAlerts,
  evalOONI,
  evalIrinter,
  evalRIPEProbes,
  evalPsiphon,
  evalTorCSV,
  evalRIPEstat,
  evalGeneric,
} from '../checker.ts';

const NOW = new Date('2026-05-25T12:00:00Z');

describe('expandURL', () => {
  it('replaces __NOW__', () => {
    const result = expandURL('https://api.example.com?until=__NOW__', NOW);
    expect(result).toBe('https://api.example.com?until=1779710400');
  });

  it('replaces __TODAY__', () => {
    const result = expandURL('since=__TODAY__', NOW);
    expect(result).toBe('since=2026-05-25');
  });

  it('replaces __7D_AGO__', () => {
    const result = expandURL('from=__7D_AGO__', NOW);
    expect(result).toBe('from=1779105600');
  });

  it('replaces __7D_AGO_DATE__', () => {
    const result = expandURL('since=__7D_AGO_DATE__', NOW);
    expect(result).toBe('since=2026-05-18');
  });
});

describe('evalIODASignal', () => {
  const makeData = (values: number[]) => ({ data: [[{ values }]] });

  it('returns up when at 100% of normal', () => {
    const [status] = evalIODASignal(makeData([100, 100, 100]), 80, 50);
    expect(status).toBe('up');
  });

  it('returns degraded when below warn threshold', () => {
    const [status] = evalIODASignal(makeData([100, 100, 70]), 80, 50);
    expect(status).toBe('degraded');
  });

  it('returns down when below crit threshold', () => {
    const [status] = evalIODASignal(makeData([100, 100, 40]), 80, 50);
    expect(status).toBe('down');
  });

  it('returns unknown for empty data', () => {
    const [status] = evalIODASignal({ data: [] }, 80, 50);
    expect(status).toBe('unknown');
  });
});

describe('evalIODAAlerts', () => {
  it('returns degraded when alerts present', () => {
    const [status, value] = evalIODAAlerts({ data: [{}, {}] });
    expect(status).toBe('degraded');
    expect(value).toBe(2);
  });

  it('returns up when no alerts', () => {
    const [status] = evalIODAAlerts({ data: [] });
    expect(status).toBe('up');
  });
});

describe('evalOONI', () => {
  const makeResult = (anomaly: number, ok: number) => ({ result: { anomaly_count: anomaly, ok_count: ok } });

  it('returns down when >80% anomaly', () => {
    const [status] = evalOONI(makeResult(90, 10));
    expect(status).toBe('down');
  });

  it('returns degraded when >30% anomaly', () => {
    const [status] = evalOONI(makeResult(40, 60));
    expect(status).toBe('degraded');
  });

  it('returns up when <=30% anomaly', () => {
    const [status] = evalOONI(makeResult(10, 90));
    expect(status).toBe('up');
  });

  it('returns unknown when no data', () => {
    const [status] = evalOONI({ result: { anomaly_count: 0, ok_count: 0 } });
    expect(status).toBe('unknown');
  });
});

describe('evalIrinter', () => {
  it('returns down below crit threshold', () => {
    const [status] = evalIrinter({ data: [{ value: 40 }] }, 70, 50);
    expect(status).toBe('down');
  });

  it('returns degraded below warn threshold', () => {
    const [status] = evalIrinter({ data: [{ value: 60 }] }, 70, 50);
    expect(status).toBe('degraded');
  });

  it('returns up at or above warn threshold', () => {
    const [status] = evalIrinter({ data: [{ value: 80 }] }, 70, 50);
    expect(status).toBe('up');
  });
});

describe('evalRIPEProbes', () => {
  it('always returns up with count as value', () => {
    const [status, value, msg] = evalRIPEProbes({ count: 42 });
    expect(status).toBe('up');
    expect(value).toBe(42);
    expect(msg).toBe('42 probes');
  });
});

describe('evalPsiphon', () => {
  it('parses total_stations', () => {
    const [status, value] = evalPsiphon({ total_stations: 150 });
    expect(status).toBe('up');
    expect(value).toBe(150);
  });

  it('parses daily_unique_users', () => {
    const [status, value] = evalPsiphon({ daily_stats: [{ daily_unique_users: 5000 }] });
    expect(status).toBe('up');
    expect(value).toBe(5000);
  });

  it('returns unknown when unparseable', () => {
    const [status] = evalPsiphon({});
    expect(status).toBe('unknown');
  });
});

describe('evalTorCSV', () => {
  it('parses the last data line', () => {
    const csv = `# comment\n2026-05-24,1000\n2026-05-25,1200\n`;
    const [status, value] = evalTorCSV(csv);
    expect(status).toBe('up');
    expect(value).toBe(1200);
  });

  it('returns unknown for no data lines', () => {
    const [status] = evalTorCSV('# only comments\n');
    expect(status).toBe('unknown');
  });
});

describe('evalRIPEstat', () => {
  it('returns up when status is ok', () => {
    const [status] = evalRIPEstat({ status: 'ok' });
    expect(status).toBe('up');
  });

  it('returns unknown otherwise', () => {
    const [status] = evalRIPEstat({ status: 'error' });
    expect(status).toBe('unknown');
  });
});

describe('evalGeneric', () => {
  it('returns up for 2xx', () => {
    expect(evalGeneric(200)[0]).toBe('up');
    expect(evalGeneric(204)[0]).toBe('up');
  });

  it('returns down for 4xx/5xx', () => {
    expect(evalGeneric(404)[0]).toBe('down');
    expect(evalGeneric(500)[0]).toBe('down');
  });

  it('returns down for 0 (connection failed)', () => {
    expect(evalGeneric(0)[0]).toBe('down');
  });
});
