// data.jsx — endpoint catalog + API fetch. No mock data.

const CATEGORIES = {
  ISP: { id: 'ISP', en: 'ISPs', fa: 'سرویس‌دهنده‌ها', short: 'ISP' },
  GOV: { id: 'GOV', en: 'Government & Registry', fa: 'دولتی و ثبت دامنه', short: 'GOV' },
  DOM: { id: 'DOM', en: 'Domestic platforms', fa: 'پلتفرم‌های داخلی', short: 'DOM' },
  INT: { id: 'INT', en: 'International benchmarks', fa: 'معیارهای بین‌المللی', short: 'INT' },
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
