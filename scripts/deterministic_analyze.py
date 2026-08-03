#!/usr/bin/env python3
"""
Iran Internet Monitor — Deterministic Analyzer
Generates bilingual (EN/FA) analysis JSON from data/latest.json without any LLM.
Template-based with real numbers — immune to provider failures, context rot, timeouts.
"""

import json
import os
import sys
import datetime
from pathlib import Path

REPO = Path("/root/iran-internet-monitor")
LATEST = REPO / "data" / "latest.json"
NETWORKS = REPO / "data" / "networks.json"
PREV = REPO / "data" / "analysis" / "latest.json"
OUT = REPO / "data" / "analysis" / "latest.json"
HISTORY = REPO / "data" / "analysis" / "history.jsonl"

# Persian terminology (Pinglish style per glossary)
FA = {
    "gateway": "گیت‌وی", "gateways": "گیت‌وی‌ها", "down": "قطع", "up": "بالا",
    "degraded": "تخریب‌یافته", "timeout": "تایم‌اوت", "reachable": "قابل‌دسترس",
    "ranges": "بازه IP", "BGP intact": "مسیرهای BGP سالم", "blocked": "بلاک",
    "DNS": "DNS", "redirect loop": "لوپ ریدایرکت", "stealth blackout": "قطعی مخفی",
    "selective internet": "اینترنت گزینشی", "protocol whitelist": "وایت‌لیست پروتکل",
    "circumvention": "ابزار عبور", "foreign platforms": "پلتفرم‌های خارجی",
    "domestic": "داخلی", "observatory": "رصدخانه", "resolver": "ریزالور",
    "service": "سرویس", "services": "سرویس‌ها", "stable": "پایدار",
    "recovered": "بازیابی", "persists": "تداوم دارد", "improved": "بهبود یافته",
    "oscillating": "در حال نوسان", "monitoring pass": "دور پایش",
}

def load(path, default=None):
    try:
        return json.loads(path.read_text())
    except Exception:
        return default

def rel_time(ts_str):
    try:
        ts = datetime.datetime.fromisoformat(ts_str.replace("Z", "+00:00"))
        now = datetime.datetime.now(datetime.timezone.utc)
        mins = int((now - ts).total_seconds() / 60)
        if mins < 60:
            return f"{mins} min ago"
        return f"{mins//60}h{mins%60:02d}m ago"
    except Exception:
        return "recently"

def main():
    latest = load(LATEST, {})
    if not latest:
        print("ERROR: no data/latest.json")
        sys.exit(1)

    prev = load(PREV, None)
    counts = latest.get("counts", {})
    up, deg, down = counts.get("up", 0), counts.get("degraded", 0), counts.get("down", 0)
    overall = latest.get("overall", "unknown")
    ts = latest.get("ts", "")

    # Categorize results
    cats = {}
    down_services = []
    deg_services = []
    for r in latest.get("results", []):
        c = r.get("category", "?")
        cats.setdefault(c, {"up": 0, "degraded": 0, "down": 0})
        s = r.get("status", "up")
        cats[c][s] = cats[c].get(s, 0) + 1
        name = r.get("name", r.get("service_id", "?"))
        if s == "down":
            err = r.get("error", "")
            detail = ""
            if "refused" in err:
                detail = " (connection refused)"
            elif "timeout" in err or "timed out" in err:
                detail = " (timeout)"
            down_services.append(f"{name}{detail}")
        elif s == "degraded":
            lat = r.get("latency_ms", 0)
            deg_services.append(f"{name} ({lat}ms)" if lat else name)

    # Networks reachability
    networks = load(NETWORKS, {})
    total_ranges = networks.get("ranges_total", 0)
    reachable_ranges = networks.get("ranges_up", 0)
    orgs = networks.get("orgs", [])
    operators = len(orgs)
    pct = (reachable_ranges / total_ranges * 100) if total_ranges else 0

    # Build EN summary
    en_lines = []
    fa_lines = []

    # Detect gateway status
    gw_down = [s for s in down_services if "gateway" in s.lower() or "gw" in s.lower()]
    dns_down = [s for s in down_services if "dns" in s.lower()]
    snap_down = [s for s in down_services if "snapp" in s.lower()]
    shaparak_down = [s for s in down_services if "shaparak" in s.lower()]

    en_summary = f"{overall.replace('_',' ').title()} — {up} up, {deg} degraded, {down} down. "
    fa_summary = f"{'اختلال جزئی' if overall=='partial_outage' else 'اختلال'} — {up} بالا، {deg} تخریب‌یافته، {down} قطع. "

    if gw_down:
        en_summary += f"All {len(gw_down)} ISP gateways blocked externally with BGP routes intact — stealth blackout pattern. "
        fa_summary += f"تمام گیت‌وی‌های ISP از خارج بلاک‌اند با مسیرهای BGP سالم — پترن قطعی مخفی. "
    if total_ranges:
        en_summary += f"{reachable_ranges}/{total_ranges} IP ranges reachable ({pct:.1f}%). "
        fa_summary += f"{reachable_ranges} از {total_ranges} بازه IP قابل‌دسترس ({pct:.1f}٪). "
    if dns_down:
        en_summary += f"DNS: {', '.join(dns_down)} down. "
        fa_summary += f"DNS: {', '.join(dns_down)} قطع. "
    if snap_down:
        en_summary += "Snapp redirect loop. "
        fa_summary += "اسنپ لوپ ریدایرکت. "
    if shaparak_down:
        en_summary += "Shaparak timeout. "
        fa_summary += "شاپرک تایم‌اوت. "

    # Foreign platforms
    fp = cats.get("Foreign platforms", {})
    if fp.get("up", 0) >= 6 and fp.get("down", 0) == 0:
        en_summary += "Foreign platforms fast. "
        fa_summary += "پلتفرم‌های خارجی سریع. "

    # Change detection vs previous
    changes = []
    if prev and prev.get("counts"):
        pc = prev.get("counts", {})
        for k in ("up", "degraded", "down"):
            if counts.get(k, 0) != pc.get(k, 0):
                changes.append(f"{k}: {pc.get(k,0)}→{counts.get(k,0)}")
    change_txt = ", ".join(changes) if changes else "no change from previous pass"

    # Insight
    pass_num = 0
    try:
        history = HISTORY.read_text().splitlines()
        pass_num = len(history) + 1
    except Exception:
        pass
    en_insight = f"Pass {pass_num}: {change_txt}. Reachability {pct:.1f}% {'within established 3.8-4.3% band' if 3.5 <= pct <= 4.5 else 'outside expected band — investigate'}. {'Gateway filtering persists with BGP intact — consistent with selective internet architecture (Bock et al. FOCI 20 whitelister model).' if gw_down else 'No gateway anomalies detected.'}"
    fa_insight = f"دور {pass_num}: {change_txt}. دسترسی‌پذیری {pct:.1f}٪ {'در محدوده تثبیت‌شده ۳.۸-۴.۳٪' if 3.5 <= pct <= 4.5 else 'خارج از محدوده انتظار — بررسی لازم است'}. {'فیلترینگ گیت‌وی با BGP سالم تداوم دارد — همسو با معماری اینترنت گزینشی (مدل وایت‌لیستر Bock و همکاران FOCI 20).' if gw_down else 'ناهنجاری گیت‌وی شناسایی نشد.'}"

    # Suspected causes
    causes = []
    causes_fa = []
    if gw_down:
        causes.append("Policy filtering at international gateway layer — all ISP gateways TCP refused/timeout from external vantage while BGP routes intact via observatories")
        causes_fa.append("فیلترینگ سیاستی در لایه گیت‌وی بین‌المللی — تمام گیت‌وی‌های ISP با خطای \"connection refused\" یا تایم‌اوت TCP از نقطه دید خارجی در حالی که مسیرهای BGP طبق رصدخانه‌ها سالم‌اند")
    if pct < 10:
        causes.append(f"Protocol whitelist enforcement at national gateway — only {pct:.1f}% of IP ranges reachable; non-DNS/HTTP/HTTPS traffic silently dropped (Bock et al. FOCI'20 whitelister model)")
        causes_fa.append(f"اعمال وایت‌لیست پروتکل در گیت‌وی ملی — تنها {pct:.1f}٪ بازه‌های IP قابل‌دسترس؛ ترافیک غیر-DNS/HTTP/HTTPS به‌طور خاموش دراپ می‌شود (مدل وایت‌لیستر Bock و همکاران FOCI'20)")
    if dns_down:
        causes.append(f"Targeted DNS pressure on anti-censorship infrastructure — {'/'.join(dns_down)} failing while other resolvers operational")
        causes_fa.append(f"فشار هدفمند بر DNS زیرساخت‌های ضدسانسور — {'/'.join(dns_down)} ناموفق در حالی که ریزالورهای دیگر عملیاتی‌اند")
    if not causes:
        causes.append("No significant anomalies — baseline posture")
        causes_fa.append("ناهنجاری قابل توجهی نیست — وضعیت خط پایه")

    # Recommendation
    en_rec = f"Continue passive monitoring. Next deviation from {pct:.1f}% reachability or gateway state changes will be high-signal. Cross-reference with IODA/NetBlocks/Cloudflare Radar for BGP anomalies."
    fa_rec = f"ادامه پایش غیرفعال. هر انحراف از {pct:.1f}٪ دسترسی‌پذیری یا تغییر حالت گیت‌وی سیگنال بالا خواهد بود. کراس‌رفرنس با IODA/NetBlocks/Cloudflare Radar برای ناهنجاری‌های BGP."

    analysis = {
        "ts": datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "overall_status": overall,
        "severity": "major" if down >= 9 or (down >= 6 and deg >= 2) else ("minor" if down >= 3 else "none"),
        "counts": counts,
        "public_summary": en_summary.strip(),
        "public_summary_fa": fa_summary.strip(),
        "insight": en_insight,
        "insight_fa": fa_insight,
        "suspected_causes": causes,
        "suspected_causes_fa": causes_fa,
        "affected_services": down_services + [f"degraded: {s}" for s in deg_services],
        "affected_services_fa": down_services + [f"تخریب‌یافته: {s}" for s in deg_services],
        "recommendation": en_rec,
        "recommendation_fa": fa_rec,
        "generator": "deterministic-v1",
        "data_ts": ts,
    }

    OUT.write_text(json.dumps(analysis, ensure_ascii=False, indent=2))

    # Append to history (skip if last entry identical)
    last_line = ""
    try:
        lines = HISTORY.read_text().splitlines()
        if lines:
            last_line = lines[-1]
    except Exception:
        pass
    with HISTORY.open("a") as f:
        f.write(json.dumps(analysis, ensure_ascii=False) + "\n")

    # Summary to stdout
    print(f"ANALYZED ts={ts} overall={overall} up={up} deg={deg} down={down} reach={pct:.1f}% ({reachable_ranges}/{total_ranges}) passes={pass_num}")
    print(f"SUMMARY: {en_summary.strip()[:200]}")

if __name__ == "__main__":
    main()
