// app.jsx — adapted from IR-NETWATCH prototype. Real API fetch, no mock data.

const { useState, useEffect, useMemo, useRef } = React;

function useTehranClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}
function fmtTehran(d) {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Tehran', hour12: false,
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  }).format(d);
}
function fmtUtc(d) {
  const h = String(d.getUTCHours()).padStart(2,'0');
  const m = String(d.getUTCMinutes()).padStart(2,'0');
  const s = String(d.getUTCSeconds()).padStart(2,'0');
  return `${h}:${m}:${s} UTC`;
}

function Header({ lang, setLang, theme, setTheme, route, setRoute, polling }) {
  const t = useT(lang);
  const now = useTehranClock();
  const secondsIntoFive = (Math.floor(Date.now() / 1000) % 300);
  const lastPollAgo = secondsIntoFive;
  const nextPollIn = 300 - secondsIntoFive;
  const fmtAgo = (s) => `${Math.floor(s/60)}m ${s%60}s`;
  const fmtIn  = (s) => `${Math.floor(s/60)}m ${String(s%60).padStart(2,'0')}s`;
  return (
    <header className="hdr">
      <div className="viewport">
        <div className="hdr-row">
          <div className="brand">
            <span className="brand-mark">IR</span>
            <span>{t('brand')}</span>
            <span className="brand-tag">// {t('tagline')}</span>
          </div>
          <div className="hdr-meta">
            <div className="item">
              <span className="k">{t('region')}</span>
              <span className="v">{t('region_value')}</span>
            </div>
            <div className="item">
              <span className="k">{t('local_time')}</span>
              <span className="v">{fmtTehran(now)} · {fmtUtc(now)}</span>
            </div>
            <div className="item">
              <span className="k">{t('last_check')} / {t('next_check')}</span>
              <span className="v">−{fmtAgo(lastPollAgo)} · +{fmtIn(nextPollIn)}</span>
            </div>
          </div>
          <div className="poll-pill">
            <span className="poll-dot"></span>
            <span>{polling ? t('polling_active') : t('polling_idle')}</span>
          </div>
          <div className="hdr-ctrls">
            <button className={'hdr-btn ' + (lang==='en'?'active':'')} onClick={() => setLang('en')}>EN</button>
            <button className={'hdr-btn ' + (lang==='fa'?'active':'')} onClick={() => setLang('fa')}>فا</button>
            <button className="hdr-btn" onClick={() => setTheme(theme==='dark'?'light':'dark')} title="Toggle theme" style={{padding:'4px 9px',display:'inline-flex',alignItems:'center'}}>
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
                {theme === 'dark'
                  ? <path d="M13 9.5A5 5 0 0 1 6.5 3a5 5 0 1 0 6.5 6.5Z" fill="currentColor"/>
                  : <g><circle cx="8" cy="8" r="3.2" fill="currentColor"/><g stroke="currentColor"><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3 3l1.4 1.4M11.6 11.6 13 13M3 13l1.4-1.4M11.6 4.4 13 3"/></g></g>}
              </svg>
            </button>
            <button className="hdr-btn" title="Settings"
              onClick={() => window.postMessage({ type: '__activate_edit_mode' }, '*')}
              style={{padding:'4px 9px',display:'inline-flex',alignItems:'center'}}>
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
                <circle cx="8" cy="8" r="2.5"/>
                <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.1 3.1l1.4 1.4M11.5 11.5l1.4 1.4M3.1 12.9l1.4-1.4M11.5 4.5l1.4-1.4"/>
              </svg>
            </button>
          </div>
        </div>
        <nav className="subnav">
          <a className={route.name==='status'?'active':''} onClick={() => setRoute({name:'status'})}>{t('nav_status')}</a>
          <a className={route.name==='history'?'active':''} onClick={() => setRoute({name:'history'})}>{t('nav_history')}</a>
          <a className={route.name==='about'?'active':''} onClick={() => setRoute({name:'about'})}>{t('nav_about')}</a>
        </nav>
      </div>
    </header>
  );
}

function Banner({ summary, scenarioObj, lang }) {
  const t = useT(lang);
  const state = summary.down > 0 ? 'down' : summary.degraded > 0 ? 'degraded' : 'up';
  const glyph = state === 'up' ? '◆' : state === 'degraded' ? '▲' : '✕';
  const label = state === 'up' ? t('operational') : state === 'degraded' ? t('degraded') : t('down');
  return (
    <div className={'banner ' + state}>
      <div className="banner-glyph">{glyph}</div>
      <div className="banner-text">
        <div className="banner-label">{label}</div>
        <div className="banner-headline">{scenarioObj.label[lang] || scenarioObj.label.en}</div>
        <div className="banner-sub">{scenarioObj.summary[lang] || scenarioObj.summary.en}</div>
      </div>
      <div className="banner-count">
        <div className="big">{summary.up}/{summary.total}</div>
        <div className="small">{t('endpoints_up')}</div>
      </div>
    </div>
  );
}

function Stats({ dataset, lang }) {
  const t = useT(lang);
  const reach = dataset.filter(d => d.response_time_ms != null && d.response_time_ms > 0);
  const avg = Math.round(reach.reduce((s, d) => s + d.response_time_ms, 0) / Math.max(reach.length, 1));
  const sorted = [...reach].map(d => d.response_time_ms).sort((a, b) => a - b);
  const p95 = sorted[Math.floor(sorted.length * 0.95)] || 0;
  const overall = (dataset.reduce((s, d) => s + (d.uptime_pct || 0), 0) / Math.max(dataset.length, 1)).toFixed(2);
  const checks = dataset.length * 288;
  return (
    <div className="stats">
      <div className="stat">
        <div className="stat-label">{t('sec_overall')} {t('sec_uptime').toLowerCase()}</div>
        <div className="stat-value">{overall}<span className="unit">%</span></div>
        <div className="stat-trend">90-day average</div>
      </div>
      <div className="stat">
        <div className="stat-label">{t('avg_latency')}</div>
        <div className="stat-value">{avg}<span className="unit">ms</span></div>
        <div className="stat-trend">p95 · {p95}ms</div>
      </div>
      <div className="stat">
        <div className="stat-label">{t('total_endpoints')}</div>
        <div className="stat-value">{dataset.length}</div>
        <div className="stat-trend">7 categories</div>
      </div>
      <div className="stat">
        <div className="stat-label">{t('checks_today')}</div>
        <div className="stat-value">{checks.toLocaleString()}</div>
        <div className="stat-trend">288 polls / endpoint / day</div>
      </div>
    </div>
  );
}

function Filters({ dataset, filter, setFilter, query, setQuery, lang }) {
  const t = useT(lang);
  const counts = useMemo(() => {
    const c = { ALL: dataset.length };
    for (const k of Object.keys(CATEGORIES)) c[k] = dataset.filter(d => d.cat === k).length;
    return c;
  }, [dataset]);
  return (
    <div className="filters">
      <span className="filter-label">{t('category')}</span>
      <button className={'filter '+(filter==='ALL'?'active':'')} onClick={() => setFilter('ALL')}>
        {t('filter_all')}<span className="filter-count">{counts.ALL}</span>
      </button>
      {Object.values(CATEGORIES).map(c => (
        <button key={c.id} className={'filter '+(filter===c.id?'active':'')} onClick={() => setFilter(c.id)}>
          {t('cat_'+c.id)}<span className="filter-count">{counts[c.id]||0}</span>
        </button>
      ))}
      <div className="search-box">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="7" cy="7" r="5"/><path d="m11 11 4 4"/></svg>
        <input type="text" placeholder={lang==='fa'?'جست‌وجو…':'search hosts…'} value={query} onChange={e => setQuery(e.target.value)} />
      </div>
    </div>
  );
}

function EndpointRow({ ep, lang, onOpen }) {
  const t = useT(lang);
  const lbl = ep.status==='up' ? t('status_up') : ep.status==='degraded' ? t('status_degraded') : t('status_down');
  return (
    <div className={'row '+ep.status} onClick={() => onOpen(ep.id)}>
      <span className="dot" />
      <div className="name-col">
        <div className="name">
          {ep.name}
          {lang==='fa' && ep.fa && <span className="name-fa">{ep.fa}</span>}
        </div>
        <div className="meta">
          <span><span className="k">host:</span><span className="v">{ep.host||ep.id}</span></span>
          {ep.asn && <span><span className="k">asn:</span><span className="v">{ep.asn}</span></span>}
        </div>
      </div>
      <div className="grid-col">
        <HistoryGrid history={ep.history||[]} lang={lang} />
      </div>
      <div className="status-col">
        <div className="pct">{(ep.uptime_pct||ep.uptime90||0).toFixed(2)}%</div>
        <div className="lbl">{lbl}</div>
      </div>
    </div>
  );
}

function HistoryGrid({ history, lang }) {
  const t = useT(lang);
  return (
    <div className="hgrid">
      {history.map((d, i) => {
        const label = d.day === 0 ? t('today') : `${d.day}${t('days_ago')}`;
        const tip = `${label} · ${d.uptime}% · ${d.status==='up'?t('legend_up'):d.status==='degraded'?t('legend_degraded'):t('legend_down')}`;
        return <span key={i} className={'hcell '+(d.status||'empty')} data-tip={tip}></span>;
      })}
    </div>
  );
}

function Legend({ lang }) {
  const t = useT(lang);
  return (
    <div className="legend">
      <span className="swatch up"><i></i>{t('legend_up')}</span>
      <span className="swatch degraded"><i></i>{t('legend_degraded')}</span>
      <span className="swatch down"><i></i>{t('legend_down')}</span>
      <span className="axis">
        <span>90 {lang==='fa'?'روز پیش':'days ago'}</span>
        <span className="line"></span>
        <span>{t('today')}</span>
      </span>
    </div>
  );
}

function StatusBoard({ dataset, scenarioObj, lang, openDetail }) {
  const t = useT(lang);
  const [filter, setFilter] = useState('ALL');
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => dataset.filter(d => {
    if (filter !== 'ALL' && d.cat !== filter) return false;
    if (query && !(d.name.toLowerCase().includes(query.toLowerCase()))) return false;
    return true;
  }), [dataset, filter, query]);
  const summary = summarize(dataset);
  const groups = useMemo(() => {
    const order = ['ISP','GOV','DOM','INT'];
    const allCats = [...new Set(dataset.map(d => d.cat))];
    const ordered = [...order.filter(c => allCats.includes(c)), ...allCats.filter(c => !order.includes(c))];
    return ordered.map(catId => ({
      cat: CATEGORIES[catId] || { id: catId, en: catId, fa: catId, short: catId },
      items: filtered.filter(d => d.cat === catId),
    })).filter(g => g.items.length > 0);
  }, [filtered]);
  return (
    <div className="viewport">
      <Banner summary={summary} scenarioObj={scenarioObj} lang={lang} />
      <Stats dataset={dataset} lang={lang} />
      <Filters dataset={dataset} filter={filter} setFilter={setFilter} query={query} setQuery={setQuery} lang={lang} />
      <Legend lang={lang} />
      {groups.map(g => (
        <div className="cat-group" key={g.cat.id}>
          <div className="cat-head">
            <span className="cat-id">{g.cat.short||g.cat.id}</span>
            <span className="cat-name">{t('cat_'+g.cat.id)||g.cat.en||g.cat.id}</span>
            <span className="cat-meta">{g.items.length} {lang==='fa'?'سرویس':'endpoints'} · {(g.items.reduce((s,d)=>s+(d.uptime_pct||0),0)/g.items.length).toFixed(2)}% {t('sec_uptime').toLowerCase()}</span>
          </div>
          <div className="rows">
            {g.items.map(ep => <EndpointRow key={ep.id} ep={ep} lang={lang} onOpen={openDetail} />)}
          </div>
        </div>
      ))}
    </div>
  );
}

Object.assign(window, { Header, StatusBoard, useTehranClock, fmtTehran, fmtUtc });
