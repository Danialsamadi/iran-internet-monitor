# Persian Analysis Template — Iran Internet Monitor

This file defines the exact Persian style, terminology, and structure for all analysis output.

---

## 1. Terminology Mapping (Mandatory)

| English | Persian | Notes |
|---------|---------|-------|
| probe / pings | پرب | singular & plural same |
| monitoring pass | دور پایش / دور | "دهمین دور" |
| vantage point | نقطه دید | |
| reachability | دسترس‌پذیری | |
| connection refused | رد اتصال | TCP RST |
| timeout / timed out | تایم‌اوت | |
| unreachable | نا‌دسترس | |
| redirect loop | حلقه ریدایرکت | |
| circumvention tools | ابزار عبور | Tor, Snowflake, Psiphon (سایفون), VPNs |
| filtering / censorship | فیلترینگ | use for active policy filtering |
| degradation / degraded | تخریب / تخریب‌یافته | latency increase, partial failure |
| severity | شدت | |
| minor | خفیف | |
| major | شدید | |
| critical | بحرانی | |
| operational | عامل / عادی | |
| baseline | خط پایه | |
| anti-monitoring posture | موضع ضد پایش | |
| stealth blackout | قطعی مخفی | BGP intact, filtering at gateway |
| tiered access / selective internet | اینترنت گزینشی / دسترسی لایه‌ای | "white SIM" model |
| escalation | ارتقای سطح | |
| cadence | کادنس / فواصل زمانی | |
| gateway | گیت‌وی | industry standard |
| Deep Packet Inspection (DPI) | DPI / بازرسی عمیق بسته | |
| protocol whitelisting | وایت‌لیست پروتکل | |
| DNS poisoning / spoofing | مسموم‌سازی DNS | |
| block page IP | آی‌پی صفحه بلاک | 10.10.34.34 |
| SHAHKAR / HAMTA | شاهکار / همتا | identity databases for tiered access |
| NIN / SHOMA | NIN / شُما | National Information Network |
| **DNS poisoning / spoofing** | **مسموم‌سازی DNS / اسپوفینگ DNS** | fake IPs (e.g., 10.10.34.34) |
| **SHAHKAR / HAMTA identity databases** | **پایگاه‌های هویتی شاهکار/همتا** | user-tier enforcement |
| **block page IP (10.10.34.34)** | **IP صفحه بلاک (۱۰.۱۰.۳۴.۳۴)** | injected block page target |
| **stealth blackout (2025+ model)** | **قطعی مخفی (مدل ۲۰۲۵+)** | BGP intact + centralized filtering |
| **SNI spoofing** | **اسپیوفینگ SNI** | evasion technique |
| **active probing** | **پروبینگ فعال** | censors testing bridge/VPN IPs |

---

## 2. Verbs — Varied, Never Repeating

| English Concept | Persian Options (cycle through) |
|-----------------|----------------------------------|
| confirms / verifies | تأیید می‌کند، تایید می‌کند، مصداق دارد |
| shows / indicates | نشان می‌دهد، مشخص می‌کند، آشکار می‌سازد |
| suggests / implies | دال است، دلالت دارد، احساس می‌دهد |
| points to | اشاره دارد، روی ... متمرکز است |
| is consistent with | با ... سازگار است، هماهنگ است |
| matches / aligns with | مطابق است با، مطابقت دارد |
| demonstrates | демонстрация می‌کند، برهان می‌آورد |
| reveals | فاش می‌کند، پرده برمی‌دارد |

---

## 3. Structure — Fixed Order

Every analysis must follow this exact structure:

```
HEADLINE (one sentence, em-dash between cause and evidence)
↓
علل احتمالی (3-7 bullets, each: cause — evidence — implication)
↓
سرویس‌های تحت تأثیر (grouped by category)
↓
شدت: [خفیف/شدید/بحرانی]
↓
خلاصه عمومی (2-3 sentences)
↓
بصیرت (one sharp analytical sentence)
↓
توصیه (one concrete action)
```

---

## 4. Headline Formula

**Pattern:** `[Pass count]مین دور پایش متوالی و یکسان، [key finding] — [evidence]`

**Examples:**
- `دهمین دور پایش متوالی و یکسان، خط پایه تثبیت‌شده را تأیید می‌کند — تمام ۴ درگاه ISP از خارج به‌طور یکپارچه مسدود`
- `ششمین دور پایش، تشدید فیلترینگ را نشان می‌دهد — دسترس‌پذیری بازه‌های IP از ۳.۸٪ به ۱.۲٪ کاهش یافته`
- `دومین دور پایش، بازیابی جزئی را مشخص می‌کند — درگاه TIC ۲.۱۸۷.۱.۱ پاسخگوی TCP شده`

---

## 5. Cause Bullet Formula

**Pattern:** `[Cause] — [Evidence] — [Implication]`

**Examples:**
- `فیلترینگ سیاستی در لایه درگاه بین‌المللی — تمام ۴ درگاه (TIC دوگانه، ایرانسل، آسیاتک) TCP رد/تایم‌اوت — خرابی زیرساختی نیست، فیلترینگ فعال`
- `موقف ضد پایش مداوم — فقط ۳.۸٪ بازه IP (۱۳/۳۴۵) از خارج پاسخگویند — اپراتورهای آموزشی/دولتی/ابری مجاز، ترافیک عمومی فیلتر`
- `اختلال ترکیبی آسیاتک در تمام ابعاد — درگاه تایم‌اوت، وب تایم‌اوت، بازه‌های IP تاریک — بدترین ISP در ۱۰ دور، احتمالاً تخریب زیرساختی یا فشار هدفمند`

---

## 6. Affected Services — Grouped Format

Group by category with Persian headers:

```
دروازه‌های ISP (ISP Gateways):
• TIC 2.187.1.1 — رد اتصال
• TIC 78.38.112.1 — تایم‌اوت
• ایرانسل 5.232.0.1 — تایم‌اوت
• آسیاتک 94.182.0.1 — تایم‌اوت

ISPها (ISPs):
• آسیاتک — ۳ بعد مختل: درگاه، وب، بازه‌های IP

بازه‌های IP (IP Ranges):
• ۳۳۲ از ۳۴۵ بازه نا‌دسترس — MCI (AS197207)، ایرانسل (AS44244)، شاتل (AS31549) تاریک

DNS:
• الکترو — نا‌دسترس (۱۰ دور متوالی)
• شکن — تخریب‌یافته (۵۲۲۸ms)

سرویس‌های داخلی (Domestic Services):
• اسنپ — حلقه ریدایرکت
• شاپرک — تایم‌اوت
• بانک سامان — تخریب‌یافته (~۳۲۴۶ms)
```

---

## 7. Severity Line

**Format:** `شدت: [خفیف/شدید/بحرانی]`

Never write "MINOR" or "MAJOR" in English. Always Persian.

---

## 8. Public Summary (2-3 Sentences)

**Pattern:**
1. Overall state + censorship model name.
2. Foreign platforms / circumvention / domestic services split.
3. Notable ISP or service anomalies.

**Example:**
> اینترنت ایران در حالت «اینترنت گزینشی» (selective internet) پایدار است. تمام پلتفرم‌های خارجی (گوگل، تلگرام، یوتیوب، گیت‌هاب) و ابزارهای عبور (تور، اسنوفلک، سایفون) از خارج کاملاً در دسترس‌اند. تمام درگاه‌های اصلی ISP از خارج مسدودند؛ فقط ۳.۸٪ بازه‌های IP پاسخ می‌دهند — سازگار با مدل دسترسی لایه‌ای که در آن SIMهای سازمانی/دولتی اینترنت باز دارند. آسیاتک بدترین اپراتور است.

---

## 9. Insight (بصیرت) — One Sharp Sentence

**Formula:** `[Pattern over N passes] — [What it proves about architecture vs event] — [Cross-reference to documented model]`

**Example:**
> ده دور متوالی اثر انگشت یکسان (صفر درگاه دسترس‌پذیر، ۳-۴٪ بازه IP، همه پلتفرم‌های خارجی و ابزارهای عبور بالا، سرویس‌های داخلی عادی) معماری «اینترنت گزینشی» را به‌عنوان مبنای عملیاتی ثابت تأیید می‌کند — نه رویداد قطعی، بلکه طراحی سانسور شبکه دوگانه که Filterwatch، Schneier، و گروه میآن مستند کرده‌اند.

---

## 10. Recommendation (توصیه) — One Concrete Action

**Formula:** `[Cadence adjustment if baseline stable] + [Alert thresholds with specific numbers] + [New monitoring signals if any]`

**Example:**
> کادنس ۱۰ دقیقه‌ای حفظ شود. با ۱۰ دور یکسان که خط پایه ثابت می‌سازند، در دوره‌های بدون رویداد به ۱۵ یا ۲۰ دقیقه افزایش یابد. آستانه هشدار: هر افت کیفیت پلتفرم خارجی، خرابی ابزار عبور، نرخ خرابی سرویس داخلی >۱۵٪، یا تغییر دسترس‌پذیری بازه IP >۵٪. پایش روند تاخیر رسپینا و سلامت API RIPEstat به‌عنوان سیگنال‌های زودرس نوظهور اضافه شود.

---

## 11. Formatting Rules

- Persian digits: `۰۱۲۳۴۵۶۷۸۹`
- Percent: `۳.۸٪` (not 3.8%)
- Em-dash `—` between cause and evidence
- Bold technical terms: `**فیلترینگ سیاستی در لایه درگاه بین‌المللی**`
- Proper names: Latin (Filterwatch, Schneier, Miaan Group, TIC, DCI, IODA, OONI, RIPEstat, AS12880)
- Iranian entities: Persian (`ایرانسل`، `شاتل`، `الکترو`، `شکن`، `مخابرات ایران`، `آسیاتک`، `رسپینا`)
- ASNs: `AS197207` (Latin), mention Persian name once
- No markdown in JSON output
- No emojis

---

## 12. Complete Example Output (JSON)

```json
{
  "overall_status": "degraded",
  "severity": "minor",
  "suspected_causes": [
    "فیلترینگ سیاستی در لایه درگاه بین‌المللی — تمام ۴ درگاه (TIC دوگانه، ایرانسل، آسیاتک) TCP رد/تایم‌اوت — خرابی زیرساختی نیست",
    "موقف ضد پایش مداوم — فقط ۳.۸٪ بازه IP (۱۳/۳۴۵) از خارج پاسخگویند — اپراتورهای آموزشی/دولتی/ابری مجاز",
    "اختلال ترکیبی آسیاتک در تمام ابعاد — درگاه تایم‌اوت، وب تایم‌اوت، بازه‌های IP تاریک — بدترین ISP در ۱۰ دور"
  ],
  "suspected_causes_fa": [
    "فیلترینگ سیاستی در لایه درگاه بین‌المللی — تمام ۴ درگاه (TIC دوگانه، ایرانسل، آسیاتک) TCP رد/تایم‌اوت — خرابی زیرساختی نیست",
    "موقف ضد پایش مداوم — فقط ۳.۸٪ بازه IP (۱۳/۳۴۵) از خارج پاسخگویند — اپراتورهای آموزشی/دولتی/ابری مجاز",
    "اختلال ترکیبی آسیاتک در تمام ابعاد — درگاه تایم‌اوت، وب تایم‌اوت، بازه‌های IP تاریک — بدترین ISP در ۱۰ دور"
  ],
  "affected_services": [
    "All ISP management gateways (TIC x2, Irancell, Asiatech) — inbound TCP uniformly blocked",
    "Asiatech — all 3 dimensions impaired: gateway timeout, web timeout, IP ranges dark",
    "332 of 345 Iranian IP ranges unreachable from outside — MCI, Irancell, Shatel dark",
    "Electro DNS — unreachable (10th consecutive pass)",
    "Shecan DNS — degraded at 5228ms",
    "Snapp — redirect loop",
    "Shaparak — timeout",
    "Saman Bank — degraded at ~3246ms"
  ],
  "affected_services_fa": [
    "دروازه‌های ISP: TIC 2.187.1.1 (رد اتصال)، TIC 78.38.112.1 (تایم‌اوت)، ایرانسل 5.232.0.1 (تایم‌اوت)، آسیاتک 94.182.0.1 (تایم‌اوت)",
    "آسیاتک — ۳ بعد مختل: درگاه، وب، بازه‌های IP",
    "۳۳۲ از ۳۴۵ بازه IP نا‌دسترس — MCI، ایرانسل، شاتل تاریک",
    "الکترو DNS — نا‌دسترس (دهمین دور متوالی)",
    "شکن DNS — تخریب‌یافته (۵۲۲۸ms)",
    "اسنپ — حلقه ریدایرکت",
    "شاپرک — تایم‌اوت",
    "بانک سامان — تخریب‌یافته (~۳۲۴۶ms)"
  ],
  "public_summary": "اینترنت ایران در حالت «اینترنت گزینشی» پایدار است. تمام پلتفرم‌های خارجی و ابزارهای عبور از خارج در دسترس‌اند. تمام درگاه‌های ISP از خارج مسدودند؛ فقط ۳.۸٪ بازه IP پاسخ می‌دهند. آسیاتک بدترین اپراتور است.",
  "public_summary_fa": "اینترنت ایران در حالت «اینترنت گزینشی» پایدار است. تمام پلتفرم‌های خارجی (گوگل، تلگرام، یوتیوب، گیت‌هاب) و ابزارهای عبور (تور، اسنوفلک، سایفون) از خارج کاملاً در دسترس‌اند. تمام درگاه‌های اصلی ISP از خارج مسدودند؛ فقط ۳.۸٪ بازه‌های IP پاسخ می‌دهند — سازگار با مدل دسترسی لایه‌ای که در آن SIMهای سازمانی/دولتی اینترنت باز دارند. آسیاتک بدترین اپراتور است.",
  "insight": "ده دور متوالی اثر انگشت یکسان معماری «اینترنت گزینشی» را به‌عنوان مبنای عملیاتی ثابت تأیید می‌کند — نه رویداد قطعی، بلکه طراحی سانسور شبکه دوگانه.",
  "insight_fa": "ده دور متوالی اثر انگشت یکسان (صفر درگاه دسترس‌پذیر، ۳-۴٪ بازه IP، همه پلتفرم‌های خارجی و ابزارهای عبور بالا، سرویس‌های داخلی عادی) معماری «اینترنت گزینشی» را به‌عنوان مبنای عملیاتی ثابت تأیید می‌کند — نه رویداد قطعی، بلکه طراحی سانسور شبکه دوگانه که Filterwatch، Schneier، و گروه میآن مستند کرده‌اند.",
  "recommendation": "کادنس ۱۰ دقیقه حفظ شود. با ۱۰ دور یکسان در دوره‌های بدون رویداد به ۱۵ یا ۲۰ دقیقه افزایش یابد. آستانه هشدار: پلتفرم خارجی، ابزار عبور، سرویس داخلی >۱۵٪، بازه IP >۵٪. روند تاخیر رسپینا و API RIPEstat پایش شود.",
  "recommendation_fa": "کادنس ۱۰ دقیقه‌ای حفظ شود. با ۱۰ دور یکسان که خط پایه ثابت می‌سازند، در دوره‌های بدون رویداد خاص، فواصل زمانی به ۱۵ یا ۲۰ دقیقه افزایش یابد. آستانه‌های هشدار: هر افت کیفیت پلتفرم خارجی، خرابی ابزار عبور، نرخ خرابی سرویس داخلی بیش از ۱۵٪، یا تغییر دسترس‌پذیری بازه IP بیش از ۵٪. پایش روند تاخیر رسپینا و سلامت API RIPEstat به‌عنوان سیگنال‌های زودرس نوظهور اضافه شود."
}
```