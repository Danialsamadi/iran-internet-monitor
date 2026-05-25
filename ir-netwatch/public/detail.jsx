// detail.jsx — Detail screen + History matrix + About

const { useMemo: useMemo2 } = React;

// ─── Latency sparkline (24h synth) ──────────────────────────────────────
function Sparkline({ ep, lang }) {
  const t = useT(lang);
  // Build 48 points (24h × 30min) — seeded from endpoint id
  const points = useMemo2(() => {
    let s = 0; for (let i = 0; i < ep.id.length; i++) s = (s * 31 + ep.id.charCodeAt(i)) | 0;
    const rnd = (() => { let x = s; return () => { x = (x * 1664525 + 1013904223) | 0; return ((x >>> 0) % 10000) / 10000; }; })();
    const base = ep.latencyMs ?? 200;
    return Array.from({length: 48}, (_, i) => {
      const wobble = (Math.sin(i / 5 + s) + 1) * 30;
      const spike = ep.current !== 'up' && i > 36 ? rnd() * 250 : 0;
      const noise = (rnd() - 0.5) * 40;
      return Math.max(20, base + wobble + spike + noise);
    });
  }, [ep.id, ep.current, ep.latencyMs]);

  const W = 100, H = 60, PAD = 4;
  const max = Math.max(...points) * 1.1;
  const min = Math.min(...points) * 0.9;
  const xs = (i) => PAD + (i / (points.length - 1)) * (W - PAD * 2);
  const ys = (v) => H - PAD - ((v - min) / (max - min)) * (H - PAD * 2);
  const pathD = points.map((v, i) => `${i===0?'M':'L'}${xs(i).toFixed(2)},${ys(v).toFixed(2)}`).join(' ');
  const areaD = pathD + ` L${xs(points.length-1)},${H-PAD} L${xs(0)},${H-PAD} Z`;

  return (
    <div className="spark-wrap">
      <svg className="spark" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
        <g className="spark-grid">
          <line x1="0" x2={W} y1={H*0.25} y2={H*0.25}/>
          <line x1="0" x2={W} y1={H*0.5}  y2={H*0.5} />
          <line x1="0" x2={W} y1={H*0.75} y2={H*0.75}/>
        </g>
        <path className="spark-area" d={areaD} />
        <path className="spark-line" d={pathD} />
        <circle className="spark-dot" cx={xs(points.length-1)} cy={ys(points[points.length-1])} r="1.4"/>
      </svg>
      <div className="spark-axis">
        <span>−24h</span>
        <span>−18h</span>
        <span>−12h</span>
        <span>−6h</span>
        <span>{t('today')}</span>
      </div>
    </div>
  );
}

// ─── Big 90-day grid for detail screen ──────────────────────────────────
function BigHistory({ ep, lang }) {
  const t = useT(lang);
  return (
    <div>
      <div className="bigrid">
        {ep.history.map((d, i) => {
          const tip = `${d.day===0?t('today'):d.day+t('days_ago')} · ${d.uptime}%`;
          return <div key={i} className={'bicell ' + d.status} title={tip}></div>;
        })}
      </div>
      <div className="bigrid-axis">
        <span>−90d</span>
        <span>−60d</span>
        <span>−30d</span>
        <span>{t('today')}</span>
      </div>
    </div>
  );
}

// ─── Incident log ───────────────────────────────────────────────────────
function IncidentLog({ ep, lang }) {
  const t = useT(lang);
  // Flatten history → incidents (most recent first)
  const incidents = useMemo2(() => {
    const out = [];
    for (const d of ep.history) {
      for (const inc of d.incidents) {
        out.push({
          day: d.day,
          severity: inc.severity,
          label: inc.severity === 'down' ? t('incident_down') : t('incident_degraded'),
          duration: inc.durationMin,
        });
      }
    }
    return out.sort((a, b) => a.day - b.day).slice(0, 16);
  }, [ep, lang]);

  if (!incidents.length) {
    return <div className="empty-state">{t('no_incidents')}</div>;
  }
  return (
    <div className="incidents">
      {incidents.map((i, idx) => {
        const when = i.day === 0 ? t('today') : `−${i.day}${t('days_ago')}`;
        const dur = i.duration >= 60
          ? `${Math.floor(i.duration/60)}h ${i.duration%60}m`
          : `${i.duration} ${t('minutes')}`;
        return (
          <div className={'incident ' + i.severity} key={idx}>
            <span className="when">{when}</span>
            <span className="sev"></span>
            <span className="desc">
              <span className="tag">{i.severity === 'down' ? t('status_down') : t('status_degraded')}</span>
              {i.label}
            </span>
            <span className="dur">{dur}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Detail screen ──────────────────────────────────────────────────────
function DetailScreen({ ep, lang, onBack }) {
  const t = useT(lang);
  const lbl = ep.current==='up' ? t('status_up')
            : ep.current==='degraded' ? t('status_degraded')
            : t('status_down');
  return (
    <div className="viewport">
      <div className="detail-head">
        <button className="detail-back" onClick={onBack}>← {t('back')}</button>
      </div>
      <div className={'detail-title-row ' + ep.current}>
        <span className="dot"></span>
        <div className="detail-title">
          {ep.name}
          {lang==='fa' && <span className="fa">{ep.fa}</span>}
        </div>
        <span className="detail-status">{lbl}</span>
      </div>

      <div className="detail-grid">
        <div className="card">
          <div className="card-head">
            {t('sec_history_matrix')}
            <span className="meta">90d · {ep.uptime90.toFixed(2)}% {t('uptime').toLowerCase()}</span>
          </div>
          <div className="card-body">
            <BigHistory ep={ep} lang={lang} />
          </div>
        </div>

        <div className="card">
          <div className="card-head">{t('sec_telemetry')}</div>
          <div className="card-body">
            <dl className="kv">
              <dt>{t('host')}</dt><dd>{ep.host}</dd>
              <dt>{t('operator')}</dt><dd>{ep.asn}</dd>
              <dt>{t('category')}</dt><dd>{t('cat_'+ep.cat)}</dd>
              <dt>{t('check_method')}</dt><dd>{t('method_value')}</dd>
              <dt>{t('avg_latency')}</dt><dd>{ep.latencyMs!=null ? ep.latencyMs + ' ms' : '—'}</dd>
              <dt>{t('sec_uptime')}</dt><dd>{ep.uptime90.toFixed(3)}%</dd>
              <dt>{lang==='fa'?'یادداشت':'Notes'}</dt><dd style={{color:'var(--text-dim)'}}>{ep.notes}</dd>
            </dl>
          </div>
        </div>

        <div className="card">
          <div className="card-head">{t('sec_latency')}</div>
          <div className="card-body">
            <Sparkline ep={ep} lang={lang} />
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            {t('sec_incident_log')}
            <span className="meta">{lang==='fa'?'۹۰ روز اخیر':'last 90 days'}</span>
          </div>
          <div className="card-body">
            <IncidentLog ep={ep} lang={lang} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── History matrix (all endpoints, all 90 days) ───────────────────────
function HistoryMatrix({ dataset, lang, openDetail }) {
  const t = useT(lang);
  const order = ['ISP', 'GOV', 'DOM', 'INT'];
  return (
    <div className="viewport">
      <div className="detail-head" style={{justifyContent:'space-between'}}>
        <div className="detail-title" style={{fontSize:22}}>{t('sec_history_matrix')}</div>
      </div>
      <Legend lang={lang} />
      <div className="matrix-wrap">
        <div className="matrix">
          {order.map(catId => {
            const items = dataset.filter(d => d.cat === catId);
            return (
              <React.Fragment key={catId}>
                <div className="matrix-section-head">{t('cat_'+catId)} <span style={{color:'var(--text-faint)',fontWeight:400,marginInlineStart:10}}>· {items.length}</span></div>
                {items.map(ep => (
                  <div key={ep.id} className={'matrix-row ' + ep.current}>
                    <div className="matrix-name" onClick={() => openDetail(ep.id)}>
                      <span className="dot"></span>
                      <span style={{overflow:'hidden',textOverflow:'ellipsis'}}>{ep.name}</span>
                      <span style={{marginInlineStart:'auto',color:'var(--text-faint)',fontSize:10.5,fontVariantNumeric:'tabular-nums'}}>{ep.uptime90.toFixed(1)}%</span>
                    </div>
                    <div className="matrix-cells">
                      {ep.history.map((d,i) => <div key={i} className={'c ' + d.status} title={`−${d.day}d · ${d.uptime}%`}></div>)}
                    </div>
                  </div>
                ))}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── About ──────────────────────────────────────────────────────────────
function AboutScreen({ lang }) {
  const t = useT(lang);
  const isFa = lang === 'fa';
  return (
    <div className="viewport">
      <div className="detail-head">
        <div className="detail-title" style={{fontSize:22}}>{t('nav_about')}</div>
      </div>
      <div className="about-section">
        <div className="about-card">
          <h3>{isFa ? 'این پروژه چیست؟' : 'What is this?'}</h3>
          <p>{isFa
            ? 'این یک سامانهٔ پایش بیرونی برای زیرساخت اینترنت ایران است که از لبه‌های جهانی Cloudflare اجرا می‌شود.'
            : 'Open, public uptime monitoring of Iranian internet infrastructure — ISPs, government services, domestic platforms, and international benchmarks — observed from outside Iran via Cloudflare’s global edge.'}</p>
          <p>{isFa
            ? 'هر ۵ دقیقه یک Cloudflare Worker فهرستی از نقاط پایانی را پایش می‌کند و نتیجه را در KV ذخیره می‌کند. تغییر وضعیت بلافاصله از طریق ربات تلگرام اعلام می‌شود.'
            : 'Every 5 minutes a Cloudflare Worker pings the endpoint list and writes results to Cloudflare KV. State changes are pushed to a Telegram bot in real time.'}</p>
        </div>

        <div className="about-card">
          <h3>{isFa ? 'چرا اهمیت دارد؟' : 'Why it matters'}</h3>
          <p>{isFa
            ? 'ایران به‌طور مکرر با اختلال اینترنت روبه‌روست — قطعی، کندسازی، فیلترینگ گزینشی و خاموشی کامل. این ابزار یک سند مستقل از قابلیت دسترسی فراهم می‌کند.'
            : 'Iran experiences frequent internet disruptions — outages, throttling, selective blocking, and full shutdowns. This page gives journalists, researchers, and the diaspora a transparent, time-stamped record.'}</p>
          <p style={{color:'var(--text-faint)',fontSize:11.5}}>
            {isFa ? 'تمامی اندازه‌گیری‌ها از خارج ایران انجام می‌شود.' : 'All measurements are taken from outside Iran. Endpoints that are reachable internationally may still be filtered or blocked domestically — this page measures external reachability only.'}
          </p>
        </div>

        <div className="about-card">
          <h3>{isFa ? 'پشتهٔ فناوری' : 'Tech stack'}</h3>
          <p style={{color:'var(--text-dim)',fontSize:12}}>{isFa ? 'متن‌باز، رایگان برای میزبانی شخصی.' : 'Open source · self-hostable on a free Cloudflare account.'}</p>
          <div className="about-stack">
            <span>Cloudflare Workers</span>
            <span>Cloudflare KV</span>
            <span>CRON Triggers</span>
            <span>React</span>
            <span>Telegram Bot</span>
            <span>GitHub Actions</span>
          </div>
          <p style={{marginTop:14,fontSize:11,color:'var(--text-faint)'}}>
            {isFa ? 'بر پایهٔ ' : 'Based on '}<code>eidam/cf-workers-status-page</code>
          </p>
        </div>

        <div className="about-card">
          <h3>{isFa ? 'روش پایش' : 'Methodology'}</h3>
          <p>{t('method_value')}.</p>
          <p>{isFa
            ? 'هر سرویس از ۴ نقطهٔ اروپایی پایش می‌شود. اگر ۳ نقطه از ۴ پاسخ ندهند، وضعیت «قطع» علامت‌گذاری می‌شود.'
            : 'Each endpoint is checked from 4 European PoPs. If 3 of 4 fail to receive a 2xx response within 10s, the endpoint is marked down. Latency above 2× the trailing 7-day median marks it degraded.'}</p>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { DetailScreen, HistoryMatrix, AboutScreen, Sparkline });
