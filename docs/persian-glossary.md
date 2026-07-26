# Persian Technical Glossary for Iran Internet Monitor

Comprehensive English → Persian glossary for network infrastructure, censorship, measurement, BGP, TLS, circumvention, and status terms.

---

## Translation Principles (Golden Rules)

**1. Embrace Pinglish/Finglish for everyday jargon** — Iranian IT professionals use transliterated English terms. Write them as they sound in Persian letters:
- Ping → **پینگ** (not «پیام احتسابی»)
- Latency / RTT → **لیتنسی** (not «تأخیر» alone)
- Router → **روتر**
- Gateway → **گیت‌وی** (not «دروازه»)
- Loop → **لوپ**
- Throughput → **ثروپوت** or **دبی**
- Jitter → **جیتتر**

**2. Keep acronyms in English alphabet** — Do not transliterate standard networking acronyms:
- QoS → **QoS** (not «کیو او اس»)
- ASN → **ASN**
- IXP → **IXP**
- BGP → **BGP**
- TCP/UDP → **TCP** / **UDP**
- TLS/SSL → **TLS** / **SSL**
- SNI → **SNI**
- DNS/HTTP/HTTPS → **DNS** / **HTTP** / **HTTPS**

**3. Use established industry translations for concepts** — Some terms have standard Persian equivalents:
- Congestion → **تراکم** (not «شلوغی»)
- Infrastructure → **زیرساخت**
- Application-layer → **لایه اپلیکیشن** (not «لایه کاربرد»)
- Packet loss → **پکت‑لاس** (Pinglish) or **از دست رفتن بسته**
- Throughput → **ثروپوت** or **دبی**

**4. Maintain Persian SOV syntax** — Verb at the end, even with mixed English terms:
> "Respina latency spike to 3.8s suggests QoS discrimination"  
> → «افزایش لیتنسی رسپینا به ۳.۸ ثانیه نشان‌دهنده تبعیض QoS است»

**5. Vendor/ISP names** — Company names in Persian script; node codes in English:
- MCI → **همراه اول**
- Irancell → **ایرانسل**
- Mobinnet → **مبین‌نت**
- TBZIX / SHIX / AHWIX → **TBZIX / SHIX / AHWIX** (keep English)

**6. Don't over-translate error messages** — Keep exact English strings in quotes, explain in Persian:
> "connection refused" → **«connection refused» (رد اتصال)**

**7. Server-room coffee test** — Read aloud. If it sounds like two sysadmins talking in a Tehran server room, it's right.

---

## 📡 Network Infrastructure / زیرساخت شبکه

| English Term | Persian Term | Transliteration | Notes |
|--------------|--------------|-----------------|-------|
| International gateway | **گیت‌وی بین‌المللی** / دروازه بین‌المللی | *gateway-e beyn-ol-melali* | TIC/DCI |
| National gateway | **گیت‌وی ملی** / دروازه ملی | *gateway-e melli* | NIN |
| International bandwidth | پهنای باند بین‌المللی | pahnā-ye bānd-e beyn-ol-melali | — |
| Domestic traffic | ترافیک داخلی | terāfik-e dākheli | Inside NIN |
| International traffic | ترافیک بین‌المللی | terāfik-e beyn-ol-melali | Crosses gateways |
| Transit provider | ارائه‌دهنده ترانزیت | arāye-dehande-ye trānzit | TIC, DCI |
| Peering | پیرینگ / هم‌مرتبه‌سازی | peering / ham-martabe-sāzi | Settlement-free |
| IXP | نقطه تبادل اینترنت | noqte-ye tabādol-e internet | Tehran-IX |
| Backbone | بک‌بون | backbone | Core network |
| Last mile | آخرین مایل | ākharin māyel | Access network |
| ISP | ارائه‌دهنده دسترسی / ISP | arāye-dehande-ye dastresi | MCI, Shatel… |
| Mobile network operator | اپراتور موبایل | operātor-e mobāyel | MCI, Irancell |
| Fixed broadband | پهنای باند ثابت | pahnā-ye bānd-e sābet | ADSL, Fiber |
| NIN / SHOMA | شبکه اطلاعات ملی / شُما | Shabake-ye Ettelā'āt-e Melli | National network |

## 🔒 Censorship & Filtering / سانسور و فیلترینگ

| English Term | Persian Term | Transliteration | Notes |
|--------------|--------------|-----------------|-------|
| Filtering | فیلترینگ | filtering | Universal |
| Content filtering | فیلترینگ محتوا | filtering-e mohtavā | URL/DPI |
| Protocol filtering | فیلترینگ پروتکل | filtering-e protokol | Whitelisting |
| SNI-based filtering | فیلترینگ مبتنی بر SNI | filtering-e mabni bar SNI | TLS |
| DPI | DPI / بازرسی عمیق بسته | DPI | Layer 7 |
| DNS poisoning | مسموم‌سازی DNS | masmum-sāzi-ye DNS | — |
| DNS hijacking | هایجک DNS | hijack-e DNS | — |
| TCP Reset / RST injection | تزریق RST | tazriq-e RST | — |
| Packet dropping | دراپ بسته | drop-e baste | Silent drop |
| Throttling | تروتلینگ / محدودیت سرعت | throttling | QoS |
| Protocol whitelisting | لیست مجاز پروتکل‌ها | list-e mojāz-e protokol-hā | Bock et al. FOCI'20 |
| Block page | صفحه فیلتر | safhe-ye filter | — |
| White SIM | سیم‌کارت سفید | sim-kārt-e sefid | Unfiltered |
| Exam shutdown | قطع امتحانی | ghate'-e emtehāni | — |
| Protest shutdown | قطع اعتراضی | ghate'-e eterāzi | — |
| Stealth blackout | قطعی مخفی | ghate'-e mokhfi | BGP intact |

## 📊 Measurement & Monitoring / پایش و اندازه‌گیری

| English Term | Persian Term | Transliteration | Notes |
|--------------|--------------|-----------------|-------|
| Reachability | دسترس‌پذیری | dastres-paziri | — |
| Latency | تأخیر / لتنسی | tā'khir / latency | RTT |
| Packet loss | از دست رفتن بسته | az dast raftan-e baste | % |
| Throughput | دبی / نرخ انتقال | débit / narkh-e enteqāl | Mbps |
| Jitter | جیتتر | jitter | — |
| DNS resolution | رزولوشن DNS | resolution-e DNS | — |
| TCP handshake | هندشیک TCP | handshake-e TCP | — |
| TLS handshake | هندشیک TLS | handshake-e TLS | — |
| Vantage point | نقطه دید | noqte-ye did | Probe location |
| Probe | پرب | probe | — |
| Time series | سری زمانی | seri-ye zamāni | — |
| Baseline | خط پایه | khatt-e pāye | — |
| Anomaly | ناهنجاری | nāhanjāri | — |

## 🌐 BGP & Routing

| English Term | Persian Term | Transliteration |
|--------------|--------------|-----------------|
| BGP withdrawal | برداشتن پیشوند BGP | bardāshtan-e pishvand |
| Prefix announcement | اعلام پیشوند | elām-e pishvand |
| Route leak | نشت مسیر / لیک مسیر | nasht-e masir |
| Route hijack | هایجک مسیر | hijack-e masir |
| Upstream | آپ‌استریم | upstream |
| Blackholing | بلک‌هولینگ | blackholing |
| RPKI / ROA | RPKI / ROA | RPKI / ROA |

## 🔐 TLS & Certificate

| English Term | Persian Term | Transliteration |
|--------------|--------------|-----------------|
| SNI | SNI | SNI |
| ClientHello / ServerHello | ClientHello / ServerHello | — |
| Certificate chain | زنجیره گواهی | zanjire-ye goāhi |
| Root CA | روت CA | root CA |
| MitM | MITM | MITM |
| ECH | ECH | Encrypted Client Hello |

## 🛡️ Circumvention Tools

| English Term | Persian Term |
|--------------|--------------|
| VPN | وی‌پی‌ان |
| WireGuard | وایرگارد |
| Shadowsocks | شادوساکس |
| V2Ray / Xray | وی‌تو‌ری / ایکس‌ری |
| Trojan | تروجان |
| Hysteria | هیستریا |
| Tor | تور |
| Tor Bridge | پل تور |
| obfs4 / Snowflake | او‌بی‌اف‌اس۴ / اسنوفلک |
| Psiphon | سایفون |
| Domain Fronting | دامنه‌فرانتینگ |

## 📈 Status & Verdict Terms

| English | Persian |
|---------|---------|
| Up | بالا / در دسترس |
| Down | قطع / پایین |
| Degraded | مختل / کند |
| Partial outage | قطعی جزئی |
| Total shutdown | قطعی کامل |
| Timeout | تایم‌اوت |
| Connection reset | ریست اتصال |
| Connection refused | رد اتصال |
| DNS failure | خطای DNS |
| Redirect loop | حلقه ریدایرکت |
| Major outage | قطعی شدید / گسترده |
| Operational | عامل / فعال / عادی |
