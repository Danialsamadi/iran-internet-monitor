// data.jsx — endpoint catalog + API fetch. No mock data.

const CATEGORIES = {
  IODA: { id: 'IODA', en: 'Outage Detection',     fa: 'تشخیص قطعی',      short: 'IODA' },
  OONI: { id: 'OONI', en: 'Censorship Detection', fa: 'سانسور‌سنجی',      short: 'OONI' },
  NET:  { id: 'NET',  en: 'Network Quality',       fa: 'کیفیت شبکه',       short: 'NET'  },
  ISP:  { id: 'ISP',  en: 'ISP Monitoring',        fa: 'سرویس‌دهنده‌ها',   short: 'ISP'  },
  VPN:  { id: 'VPN',  en: 'Circumvention',         fa: 'ابزارهای عبور',    short: 'VPN'  },
  BGP:  { id: 'BGP',  en: 'BGP & Routing',         fa: 'مسیریابی BGP',     short: 'BGP'  },
  IR:   { id: 'IR',   en: 'Iran Direct',           fa: 'دسترسی مستقیم',    short: 'IR'   },
};

function summarize(dataset) {
  const total = dataset.length;
  const down = dataset.filter(d => d.status === 'down').length;
  const degraded = dataset.filter(d => d.status === 'degraded').length;
  const up = total - down - degraded;
  return { total, up, down, degraded };
}

async function fetchStatus() {
  const resp = await fetch('/api/status');
  if (!resp.ok) throw new Error(`API ${resp.status}`);
  return resp.json();
}

function buildScenarioFromSummary(summary) {
  const labels = {
    up:             { en: 'All systems operational',   fa: 'تمامی سرویس‌ها برقرار' },
    degraded:       { en: 'Minor degradation',          fa: 'اختلال جزئی' },
    partial_outage: { en: 'Partial outage',             fa: 'اختلال موضعی' },
    major_outage:   { en: 'Major outage — widespread disruption', fa: 'قطعی گسترده' },
  };
  const label = labels[summary.overall_status] || { en: summary.overall_status, fa: summary.overall_status };
  const subEn = `${summary.up} of ${summary.total_services} endpoints reachable`;
  const subFa = `${summary.up} از ${summary.total_services} سرویس در دسترس`;
  return { label, summary: { en: subEn, fa: subFa } };
}

Object.assign(window, { CATEGORIES, summarize, fetchStatus, buildScenarioFromSummary });
