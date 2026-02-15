# Iran Internet Monitoring & Testing — API Reference

All external APIs, data sources, and endpoints for monitoring Iran's internet health, censorship, connectivity, and circumvention tools. Includes APIs already used in `conduit.sh` and additional sources that can be integrated.

---

## Currently Used in conduit.sh

### 1. Psiphon Network Stats (menu `n`)

**Function:** `show_psiphon_stats()` (line 12347) — **Cache:** 6 hours

| # | API URL | Purpose |
|---|---------|---------|
| 1 | `https://stats.psianalytics.live/conduitStats` | Conduit station counts, daily connections by region |
| 2 | `https://stats.psianalytics.live/psiphonStats` | Daily unique Psiphon users, daily data transferred (TB) |
| 3 | `https://psix.ca/api/datasources/proxy/uid/000000001/query?db=psix&q=SELECT sum("rounded_count") FROM "connections-extrapolate-daily" WHERE "client_region" = 'IR' AND time > now() - 10d GROUP BY time(1d) fill(null)&epoch=s` | Daily unique users from Iran (InfluxDB via psix.ca/Grafana) |

---

### 2. Iran Connectivity Status (menu `e`)

**Function:** `show_iran_connectivity()` (line 10647) — **Cache:** 5 minutes

#### IODA (Internet Outage Detection & Analysis)

| # | API URL | Purpose |
|---|---------|---------|
| 1 | `https://api.ioda.inetintel.cc.gatech.edu/v2/signals/raw/country/IR?from={7d_ago}&until={now}&datasource=bgp&maxPoints=7` | BGP route visibility (7-day) |
| 2 | `https://api.ioda.inetintel.cc.gatech.edu/v2/signals/raw/country/IR?from={7d_ago}&until={now}&datasource=ping-slash24&maxPoints=7` | Active probing / ping reachability (7-day) |
| 3 | `https://api.ioda.inetintel.cc.gatech.edu/v2/signals/raw/country/IR?from={7d_ago}&until={now}&datasource=merit-nt&maxPoints=7` | MERIT network telescope data |
| 4 | `https://api.ioda.inetintel.cc.gatech.edu/v2/signals/raw/country/IR?from={7d_ago}&until={now}&datasource=gtr&maxPoints=7` | Google Transparency Report traffic |
| 5 | `https://api.ioda.inetintel.cc.gatech.edu/v2/signals/raw/country/IR?from={7d_ago}&until={now}&datasource=ping-slash24-latency&maxPoints=1` | Latency data |
| 6 | `https://api.ioda.inetintel.cc.gatech.edu/v2/signals/raw/country/IR?from={7d_ago}&until={now}&datasource=ping-slash24-loss&maxPoints=1` | Packet loss data |
| 7 | `https://api.ioda.inetintel.cc.gatech.edu/v2/outages/alerts?entityType=country&entityCode=IR&from={7d_ago}&until={now}&limit=10` | Outage alerts for Iran |

#### OONI (Open Observatory of Network Interference)

| # | API URL | Purpose |
|---|---------|---------|
| 8 | `https://api.ooni.io/api/v1/aggregation?probe_cc=IR&test_name=web_connectivity&since={7d_ago}&until={today}&axis_x=measurement_start_day` | Web censorship anomaly rate |
| 9 | `https://api.ooni.io/api/v1/aggregation?probe_cc=IR&test_name=telegram&since={7d_ago}&until={today}` | Telegram blocking status |
| 10 | `https://api.ooni.io/api/v1/aggregation?probe_cc=IR&test_name=whatsapp&since={7d_ago}&until={today}` | WhatsApp blocking status |
| 11 | `https://api.ooni.io/api/v1/aggregation?probe_cc=IR&test_name=signal&since={7d_ago}&until={today}` | Signal blocking status |
| 12 | `https://api.ooni.io/api/v1/aggregation?probe_cc=IR&test_name=facebook_messenger&since={7d_ago}&until={today}` | Facebook Messenger blocking status |

#### irinter.net

| # | API URL | Purpose |
|---|---------|---------|
| 13 | `https://irinter.net/api/data/network-score?from={7d_ago}&until={now}` | Iran network quality score (7-day) |

#### RIPE Atlas

| # | API URL | Purpose |
|---|---------|---------|
| 14 | `https://atlas.ripe.net/api/v2/probes/?country_code=IR&status=1&page_size=1` | Active RIPE probes in Iran |
| 15 | `https://atlas.ripe.net/api/v2/probes/?country_code=IR&status=2&page_size=1` | Disconnected RIPE probes in Iran |

---

### 3. Iran Connectivity Test (menu `t`)

**Function:** `show_iran_test()` (line 12284) — **Cache:** none (live tests)

This feature runs live network tests (`ping`, `curl`, `traceroute`, `mtr`) against ~50 hardcoded Iranian servers (line 11335). No external APIs.

#### Test Server List (88 servers)

| IP | Name | City | ASN | Provider | Domain |
|----|------|------|-----|----------|--------|
| 178.22.122.100 | Shecan DNS | Tehran | 43754 | Asiatech | shecan.ir |
| 217.218.155.155 | TIC DNS 1 | Tehran | 12880 | DCI | |
| 217.218.127.127 | TIC DNS 2 | Tehran | 12880 | DCI | |
| 85.15.1.14 | Shatel | Tehran | 31549 | Shatel | shatel.ir |
| 212.33.192.1 | Asiatech | Tehran | 43754 | Asiatech | asiatech.ir |
| 2.144.0.1 | Irancell | Tehran | 44244 | Irancell | irancell.ir |
| 188.213.72.1 | Mobinnet | Tehran | 50810 | Mobinnet | mobinnet.ir |
| 212.16.74.1 | ZapISP | Tehran | 44889 | ZapISP | |
| 31.25.104.1 | Zi-Tel | Tehran | 206065 | Zi-Tel | |
| 185.143.233.1 | ArvanCloud | Tehran | 205585 | ArvanCloud | arvancloud.ir |
| 77.104.64.1 | Respina | Tehran | 42337 | Respina | respina.net |
| 185.188.104.10 | Digikala | Tehran | 43211 | Digikala | digikala.com |
| 185.147.178.23 | Filimo | Tehran | 44932 | IDPS | filimo.com |
| 185.147.179.11 | Aparat | Tehran | 44932 | IDPS | aparat.com |
| 81.12.31.29 | Torob | Tehran | 51026 | Mobinhost | torob.com |
| 212.33.194.190 | Tap30 | Tehran | 43754 | Asiatech | tapsi.ir |
| 94.182.176.33 | Namava | Tehran | 31549 | Shatel | namava.ir |
| 2.189.68.126 | Bale Messenger | Tehran | 48159 | TIC-IR | bale.ai |
| 5.106.8.151 | Rubika | Tehran | 197207 | MCI | rubika.ir |
| 185.143.235.201 | Varzesh3 | Tehran | 205585 | ArvanCloud | varzesh3.com |
| 185.143.234.1 | Eitaa | Tehran | 205585 | ArvanCloud | eitaa.com |
| 185.60.137.26 | Soroush | Tehran | 21341 | Soroush-Rasanheh | splus.ir |
| 185.143.233.120 | Snapp | Tehran | 205585 | ArvanCloud | snapp.ir |
| 185.165.205.129 | Telewebion | Tehran | 64422 | Sima-Rayan | telewebion.com |
| 86.104.40.185 | CafeBazaar | Tehran | 25184 | Afranet | cafebazaar.ir |
| 45.89.201.10 | Alibaba.ir | Tehran | 34947 | Alibaba-Travel | alibaba.ir |
| 92.114.18.116 | Taaghche | Tehran | 47330 | MobinNet | taaghche.com |
| 185.143.232.253 | Anten.ir | Tehran | 205585 | ArvanCloud | anten.ir |
| 185.143.234.235 | Jobinja | Tehran | 205585 | ArvanCloud | jobinja.ir |
| 185.143.233.235 | Nobitex | Tehran | 205585 | ArvanCloud | nobitex.ir |
| 45.89.137.20 | ZarinPal | Tehran | 208675 | Hamrah-Pardaz | zarinpal.com |
| 185.167.73.34 | Shaparak | Tehran | 49796 | Shaparak | shaparak.ir |
| 185.143.232.201 | Pasargad Bank | Tehran | 205585 | ArvanCloud | bpi.ir |
| 193.8.139.22 | Saman Bank | Tehran | 31182 | Saman-Bank | sb24.ir |
| 152.89.13.54 | Sharif Univ | Tehran | 12660 | SUT | sharif.edu |
| 185.211.88.131 | Amirkabir Univ | Tehran | 59794 | AUT | aut.ac.ir |
| 194.225.0.10 | IPM Research | Tehran | 6736 | IPM | ipm.ir |
| 185.147.176.1 | Faraso | Tehran | 44932 | IDPS | faraso.org |
| 185.86.180.1 | NetPitch | Tehran | 48551 | Sindad | |
| 185.213.164.1 | Noavaran | Tehran | 61173 | GreenWeb | |
| 185.215.228.1 | DadehNegar | Tehran | 42337 | Respina | |
| 185.228.236.11 | ArvanCloud CDN | Tehran | 202468 | ArvanCDN | arvancloud.ir |
| 78.38.112.1 | TIC Karaj | Karaj | 58224 | TIC | |
| 37.255.0.1 | TIC Isfahan | Isfahan | 58224 | TIC | |
| 37.254.0.1 | TIC Isfahan 2 | Isfahan | 58224 | TIC | |
| 5.232.0.1 | TIC Mashhad | Mashhad | 58224 | TIC | |
| 5.235.0.1 | TIC Tabriz | Tabriz | 58224 | TIC | |
| 2.186.32.1 | TIC Tabriz 2 | Tabriz | 58224 | TIC | |
| 94.74.176.1 | Pishgaman Shiraz | Shiraz | 44208 | Pishgaman | pishgaman.net |
| 78.39.240.1 | TIC Shiraz | Shiraz | 58224 | TIC | |
| 185.236.36.1 | Shiraz DC | Shiraz | 48551 | Sindad | |
| 2.182.96.1 | TIC BandarAbbas | BandarAbbas | 58224 | TIC | |
| 85.185.161.1 | TIC Yazd | Yazd | 58224 | TIC | |
| 78.39.246.1 | TIC Kermanshah | Kermanshah | 58224 | TIC | |
| 85.185.248.1 | TIC Sanandaj | Sanandaj | 58224 | TIC | |
| 94.182.0.1 | Shatel Ahvaz | Ahvaz | 31549 | Shatel | shatel.ir |
| 2.187.1.1 | TIC Rasht | Rasht | 58224 | TIC | |
| 2.185.128.2 | TIC Hamadan | Hamadan | 58224 | TIC | |
| 2.187.192.1 | TIC Qazvin | Qazvin | 58224 | TIC | |
| 80.191.161.1 | TIC Kerman | Kerman | 58224 | TIC | |
| 2.187.32.2 | TIC Urmia | Urmia | 58224 | TIC | |
| 78.38.168.1 | TIC Arak | Arak | 58224 | TIC | |
| 80.191.250.2 | TIC Gorgan | Gorgan | 58224 | TIC | |
| 217.219.166.1 | TIC Sari | Sari | 58224 | TIC | |
| 80.191.174.1 | TIC Zahedan | Zahedan | 58224 | TIC | |
| 5.234.192.2 | TIC Zanjan | Zanjan | 58224 | TIC | |
| 2.183.0.1 | TIC Bushehr | Bushehr | 58224 | TIC | |
| 2.185.192.1 | TIC Khorramabad | Khorramabad | 58224 | TIC | |
| 92.42.50.130 | Irancell.ir | Tehran | 44244 | Irancell | irancell.ir |
| 188.213.72.112 | Mobinnet.ir | Tehran | 50810 | Mobinnet | mobinnet.ir |
| 80.75.12.17 | Afranet.com | Tehran | 25184 | Afranet | afranet.com |
| 77.104.74.208 | Respina.net | Tehran | 42337 | Respina | respina.net |
| 77.36.149.173 | IRIB | Tehran | 42586 | IRIB | irib.ir |
| 45.157.244.26 | Fars News | Tehran | 62229 | FarsNews | farsnews.ir |
| 185.53.142.188 | SibApp | Tehran | 51026 | Mobinhost | sibapp.com |
| 185.126.18.154 | Pishgaman DC | Tehran | 49100 | Pishgaman | pishgaman.net |
| 85.15.17.13 | Shatel.ir | Tehran | 31549 | Shatel | shatel.ir |
| 185.98.112.170 | Asiatech.ir | Tehran | 43754 | Asiatech | asiatech.ir |
| 185.120.222.22 | Myket | Tehran | 43754 | Asiatech | myket.ir |
| 78.157.43.1 | Electro Net | Tehran | 62442 | Samane-Fanava | |
| 185.188.104.1 | Digikala DC | Tehran | 43211 | Digikala | digikala.com |
| 185.188.105.1 | Digikala DC 2 | Tehran | 43211 | Digikala | |
| 92.114.18.1 | MobinNet DC | Tehran | 47330 | MobinNet | |
| 185.60.136.1 | Soroush DC | Tehran | 21341 | Soroush-Rasanheh | |
| 94.74.177.1 | Pishgaman Shiraz 2 | Shiraz | 44208 | Pishgaman | |
| 185.53.143.1 | Mobinhost DC | Tehran | 51026 | Mobinhost | |
| 185.236.37.1 | Sindad DC | Shiraz | 48551 | Sindad | |
| 94.74.179.1 | Pishgaman Shiraz 3 | Shiraz | 44208 | Pishgaman | |

#### Test Types

| Option | Test | Method |
|--------|------|--------|
| a | Quick Test | HTTPS + ICMP ping combined |
| b | Stability Test | 20 pings — measures loss & jitter |
| c | Test by City | Select a city, test its servers |
| d | Test by ASN | Select a network provider, test its servers |
| e | Traceroute | Trace network path to selected server |
| f | MTR Analysis | Traceroute + ping statistics combined |
| g | MTU Discovery | Path MTU to Iranian servers |
| h | Full Report | Complete test with quality scores |

---
---

## Additional APIs for Integration

APIs not yet used in `conduit.sh` that can be added for deeper Iran internet monitoring.

---

### 4. Cloudflare Radar

Cloudflare sees ~20% of global HTTP traffic. Their Radar API provides near-real-time internet quality data.

**Auth:** free API token required (Cloudflare account > API Tokens > Radar:Read permission).
**Docs:** https://developers.cloudflare.com/radar/

#### Traffic & Anomalies

| # | API URL | Purpose | Auth |
|---|---------|---------|------|
| 1 | `https://api.cloudflare.com/client/v4/radar/traffic_anomalies/locations?location=IR&dateRange=7d&limit=10` | Traffic anomalies detected in Iran (last 7 days) | Token |
| 2 | `https://api.cloudflare.com/client/v4/radar/annotations/outages?location=IR&dateRange=7d` | Internet outage events in Iran | Token |
| 3 | `https://api.cloudflare.com/client/v4/radar/http/timeseries?location=IR&dateRange=7d&aggInterval=1d` | HTTP traffic timeseries for Iran | Token |
| 4 | `https://api.cloudflare.com/client/v4/radar/http/summary/device_type?location=IR&dateRange=7d` | Device type breakdown (mobile vs desktop) | Token |
| 5 | `https://api.cloudflare.com/client/v4/radar/http/summary/ip_version?location=IR&dateRange=7d` | IPv4 vs IPv6 adoption in Iran | Token |
| 6 | `https://api.cloudflare.com/client/v4/radar/http/summary/http_protocol?location=IR&dateRange=7d` | HTTP/1.1 vs HTTP/2 vs HTTP/3 usage | Token |
| 7 | `https://api.cloudflare.com/client/v4/radar/http/summary/tls_version?location=IR&dateRange=7d` | TLS version distribution | Token |

#### Connection Quality & Speed

| # | API URL | Purpose | Auth |
|---|---------|---------|------|
| 8 | `https://api.cloudflare.com/client/v4/radar/quality/speed/summary?location=IR&dateRange=7d` | Internet speed summary (download, upload, latency, jitter) | Token |
| 9 | `https://api.cloudflare.com/client/v4/radar/quality/iqi/summary?location=IR&dateRange=7d` | Internet Quality Index (IQI) for Iran | Token |
| 10 | `https://api.cloudflare.com/client/v4/radar/quality/iqi/timeseries?location=IR&dateRange=7d&aggInterval=1d` | IQI over time | Token |

#### BGP & Routing

| # | API URL | Purpose | Auth |
|---|---------|---------|------|
| 11 | `https://api.cloudflare.com/client/v4/radar/bgp/routes/stats?location=IR` | BGP route statistics (prefixes, origins) for Iran | Token |
| 12 | `https://api.cloudflare.com/client/v4/radar/bgp/leaks/events?involvedCountry=IR&dateRange=7d` | BGP leak events involving Iran | Token |
| 13 | `https://api.cloudflare.com/client/v4/radar/bgp/hijacks/events?involvedCountry=IR&dateRange=7d` | BGP hijack events involving Iran | Token |

---

### 5. OONI — Additional Tests

More OONI test types beyond what `conduit.sh` already uses. All are free, no auth required.

**Docs:** https://api.ooni.io/apidocs/

#### Circumvention Tool Tests

| # | API URL | Purpose |
|---|---------|---------|
| 1 | `https://api.ooni.io/api/v1/aggregation?probe_cc=IR&test_name=psiphon&since={7d_ago}&until={today}` | Psiphon reachability from Iran |
| 2 | `https://api.ooni.io/api/v1/aggregation?probe_cc=IR&test_name=tor&since={7d_ago}&until={today}` | Tor reachability from Iran |
| 3 | `https://api.ooni.io/api/v1/aggregation?probe_cc=IR&test_name=torsf&since={7d_ago}&until={today}` | Tor Snowflake reachability |
| 4 | `https://api.ooni.io/api/v1/aggregation?probe_cc=IR&test_name=vanilla_tor&since={7d_ago}&until={today}` | Vanilla Tor (direct) reachability |
| 5 | `https://api.ooni.io/api/v1/aggregation?probe_cc=IR&test_name=tor_bridge_reachability&since={7d_ago}&until={today}` | Tor bridge reachability |

#### DNS & Network Interference

| # | API URL | Purpose |
|---|---------|---------|
| 6 | `https://api.ooni.io/api/v1/aggregation?probe_cc=IR&test_name=dns_consistency&since={7d_ago}&until={today}` | DNS tampering detection |
| 7 | `https://api.ooni.io/api/v1/aggregation?probe_cc=IR&test_name=http_invalid_request_line&since={7d_ago}&until={today}` | Middle-box (DPI) detection |
| 8 | `https://api.ooni.io/api/v1/aggregation?probe_cc=IR&test_name=http_header_field_manipulation&since={7d_ago}&until={today}` | HTTP header manipulation detection |
| 9 | `https://api.ooni.io/api/v1/aggregation?probe_cc=IR&test_name=ndt&since={7d_ago}&until={today}` | Network speed/performance (NDT) |
| 10 | `https://api.ooni.io/api/v1/aggregation?probe_cc=IR&test_name=dash&since={7d_ago}&until={today}` | Video streaming quality (DASH) |

#### Measurements Search

| # | API URL | Purpose |
|---|---------|---------|
| 11 | `https://api.ooni.io/api/v1/measurements?probe_cc=IR&since={7d_ago}&until={today}&limit=100&order_by=test_start_time&order=desc` | Latest raw measurements from Iran |
| 12 | `https://api.ooni.io/api/v1/measurements?probe_cc=IR&test_name=web_connectivity&anomaly=true&since={7d_ago}&limit=50` | Anomalous web measurements only |

---

### 6. IODA — Additional Endpoints

More IODA endpoints beyond what's already used. Free, no auth.

**Docs:** https://api.ioda.inetintel.cc.gatech.edu/v2

#### Per-ASN Signals (specific Iranian ISPs)

| # | API URL | Purpose |
|---|---------|---------|
| 1 | `https://api.ioda.inetintel.cc.gatech.edu/v2/signals/raw/asn/44244?from={7d_ago}&until={now}&datasource=bgp&maxPoints=7` | Irancell (AS44244) BGP visibility |
| 2 | `https://api.ioda.inetintel.cc.gatech.edu/v2/signals/raw/asn/197207?from={7d_ago}&until={now}&datasource=bgp&maxPoints=7` | MCI / Hamrah-e-Aval (AS197207) BGP |
| 3 | `https://api.ioda.inetintel.cc.gatech.edu/v2/signals/raw/asn/12880?from={7d_ago}&until={now}&datasource=bgp&maxPoints=7` | DCI / TIC (AS12880) BGP |
| 4 | `https://api.ioda.inetintel.cc.gatech.edu/v2/signals/raw/asn/31549?from={7d_ago}&until={now}&datasource=bgp&maxPoints=7` | Shatel (AS31549) BGP |
| 5 | `https://api.ioda.inetintel.cc.gatech.edu/v2/signals/raw/asn/43754?from={7d_ago}&until={now}&datasource=bgp&maxPoints=7` | Asiatech (AS43754) BGP |
| 6 | `https://api.ioda.inetintel.cc.gatech.edu/v2/signals/raw/asn/58224?from={7d_ago}&until={now}&datasource=bgp&maxPoints=7` | TIC regional (AS58224) BGP |
| 7 | `https://api.ioda.inetintel.cc.gatech.edu/v2/signals/raw/asn/50810?from={7d_ago}&until={now}&datasource=bgp&maxPoints=7` | Mobinnet (AS50810) BGP |
| 8 | `https://api.ioda.inetintel.cc.gatech.edu/v2/signals/raw/asn/205585?from={7d_ago}&until={now}&datasource=bgp&maxPoints=7` | ArvanCloud (AS205585) BGP |

#### Outage Entity Search

| # | API URL | Purpose |
|---|---------|---------|
| 9 | `https://api.ioda.inetintel.cc.gatech.edu/v2/entities/query?search=iran&limit=20` | Search IODA entities related to Iran |
| 10 | `https://api.ioda.inetintel.cc.gatech.edu/v2/outages/overall?entityType=country&entityCode=IR&from={7d_ago}&until={now}` | Overall outage severity score |

---

### 7. RIPE Atlas — Additional Endpoints

Deeper probe and measurement data. Free for reads, no auth for public endpoints.

**Docs:** https://atlas.ripe.net/docs/apis/

| # | API URL | Purpose |
|---|---------|---------|
| 1 | `https://atlas.ripe.net/api/v2/probes/?country_code=IR&status=1&page_size=100` | All active probes in Iran (full list with metadata) |
| 2 | `https://atlas.ripe.net/api/v2/probes/?country_code=IR&page_size=1` | Total probe count in Iran |
| 3 | `https://atlas.ripe.net/api/v2/probes/?country_code=IR&status_name=Abandoned&page_size=1` | Abandoned/unreachable probes |
| 4 | `https://atlas.ripe.net/api/v2/measurements/?target_ip=178.22.122.100&type=ping&status=2&page_size=5` | Active ping measurements targeting Iran IPs |
| 5 | `https://atlas.ripe.net/api/v2/measurements/?target_ip=178.22.122.100&type=traceroute&status=2&page_size=5` | Active traceroute measurements targeting Iran IPs |
| 6 | `https://stat.ripe.net/data/country-resource-stats/data.json?resource=IR` | Iran's allocated IP prefixes and ASNs |
| 7 | `https://stat.ripe.net/data/country-resource-list/data.json?resource=IR&v4_format=prefix` | Full list of Iran's IPv4 prefixes |
| 8 | `https://stat.ripe.net/data/routing-status/data.json?resource=AS44244` | Routing status for Irancell (example ASN) |

---

### 8. RIPEstat — BGP & Routing Analytics

RIPEstat provides detailed routing analytics. Free, no auth.

**Docs:** https://stat.ripe.net/docs/02.data-api/

| # | API URL | Purpose |
|---|---------|---------|
| 1 | `https://stat.ripe.net/data/announced-prefixes/data.json?resource=AS12880` | Prefixes announced by DCI/TIC |
| 2 | `https://stat.ripe.net/data/announced-prefixes/data.json?resource=AS44244` | Prefixes announced by Irancell |
| 3 | `https://stat.ripe.net/data/bgp-state/data.json?resource=AS197207` | BGP state for MCI |
| 4 | `https://stat.ripe.net/data/asn-neighbours/data.json?resource=AS12880` | Upstream/downstream peers for TIC |
| 5 | `https://stat.ripe.net/data/country-asns/data.json?resource=IR&lod=1` | All ASNs registered in Iran |
| 6 | `https://stat.ripe.net/data/network-info/data.json?resource=178.22.122.100` | ASN/prefix for a given Iran IP |
| 7 | `https://stat.ripe.net/data/visibility/data.json?resource=AS44244` | Global visibility of Irancell routes |
| 8 | `https://stat.ripe.net/data/bgp-updates/data.json?resource=AS12880&starttime={7d_ago}&endtime={now}` | BGP update activity (route changes) for TIC |

---

### 9. Tor Metrics — Onionoo API

Tor user and bridge statistics for Iran. Free, no auth.

**Docs:** https://metrics.torproject.org/onionoo.html

| # | API URL | Purpose |
|---|---------|---------|
| 1 | `https://onionoo.torproject.org/clients?lookup=country:ir` | Estimated Tor users in Iran |
| 2 | `https://metrics.torproject.org/userstats-bridge-country.csv?start={30d_ago}&end={today}&country=ir` | Daily bridge users from Iran (CSV) |
| 3 | `https://metrics.torproject.org/userstats-relay-country.csv?start={30d_ago}&end={today}&country=ir` | Daily relay users from Iran (CSV) |
| 4 | `https://metrics.torproject.org/userstats-bridge-transport.csv?start={30d_ago}&end={today}&country=ir` | Bridge users by transport (obfs4, snowflake, etc.) from Iran |
| 5 | `https://onionoo.torproject.org/summary?search=country:ir&running=true&type=relay` | Active Tor relays in Iran |
| 6 | `https://onionoo.torproject.org/summary?search=country:ir&running=true&type=bridge` | Active Tor bridges in Iran |

---

### 10. Internet Society Pulse

Tracks internet shutdowns worldwide with economic impact data.

**Auth:** free API key required (register at https://pulse.internetsociety.org/en/api).
**Docs:** https://pulse-api.internetsociety.org/

| # | Endpoint | Purpose |
|---|----------|---------|
| 1 | `GET /api/v1/shutdowns?country=IR&start_date={year_ago}&end_date={today}` | Iran shutdown events (dates, duration, scope) |
| 2 | `GET /api/v1/shutdowns/stats?country=IR` | Shutdown statistics (total hours, count) |
| 3 | `GET /api/v1/resilience?country=IR` | Internet resilience score for Iran |

---

### 11. Censored Planet

DNS censorship and network interference measurement data from University of Michigan. Free.

**Docs:** https://docs.censoredplanet.org/
**Dashboard:** https://dashboard.censoredplanet.org/

| # | Endpoint | Purpose |
|---|----------|---------|
| 1 | `https://data.censoredplanet.org/` (GraphQL) | Query censorship measurements by country, domain, date |
| 2 | `https://data.censoredplanet.org/raw` | Download raw Satellite (DNS) and Hyperquack (HTTP/HTTPS) data |
| 3 | Dashboard filter: `country=IR` | Visual DNS/HTTP censorship trends in Iran |

**Measurement types:**
- **Satellite** — remote DNS censorship detection (~10,000 resolvers, 170 countries)
- **Hyperquack** — remote HTTP/HTTPS censorship detection
- **Augur** — TCP/IP layer interference detection

---

### 12. M-Lab (Measurement Lab)

Open internet speed and quality measurements. Free, no auth for BigQuery.

**Docs:** https://measurementlab.net/

| # | Endpoint | Purpose |
|---|----------|---------|
| 1 | BigQuery: `measurement-lab.ndt.unified_uploads` | NDT upload speed tests (filter `client.Geo.CountryCode = 'IR'`) |
| 2 | BigQuery: `measurement-lab.ndt.unified_downloads` | NDT download speed tests from Iran |
| 3 | `https://speed.measurementlab.net/` | Run a speed test using M-Lab NDT |

**BigQuery example:**
```sql
SELECT
  DATE(test_date) AS day,
  ROUND(AVG(a.MeanThroughputMbps), 2) AS avg_download_mbps,
  ROUND(AVG(a.MinRTT), 2) AS avg_latency_ms
FROM `measurement-lab.ndt.unified_downloads`
WHERE client.Geo.CountryCode = 'IR'
  AND test_date > DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)
GROUP BY day ORDER BY day
```

---

### 13. Google Transparency Report

Google product traffic per country — drops indicate shutdowns. No API (web scraping or manual).

**URL:** https://transparencyreport.google.com/traffic/overview

| # | URL | Purpose |
|---|-----|---------|
| 1 | `https://transparencyreport.google.com/traffic/overview?hl=en&fraction_traffic=start:{start_ms};end:{end_ms};product:19;region:IR` | Google Search traffic from Iran |
| 2 | `https://transparencyreport.google.com/traffic/overview?hl=en&fraction_traffic=start:{start_ms};end:{end_ms};product:21;region:IR` | YouTube traffic from Iran |

Note: Google does not provide a public REST API for this data. The IODA `gtr` datasource (already used in conduit.sh) is the best programmatic proxy for this.

---

## Quick Reference — All API Providers

| Provider | Auth | Free | Real-time | What it measures |
|----------|------|------|-----------|------------------|
| Psiphon (psianalytics.live) | None | Yes | ~daily | Conduit stations, user counts, traffic |
| psix.ca | None | Yes | ~daily | Psiphon regional user metrics |
| IODA (Georgia Tech) | None | Yes | ~5 min | BGP, active probing, outage alerts |
| OONI | None | Yes | ~hourly | Censorship, app blocking, DPI detection |
| irinter.net | None | Yes | ~5 min | Iran network quality score |
| RIPE Atlas | None | Yes | varies | Probe status, measurements, routing |
| RIPEstat | None | Yes | ~15 min | BGP analytics, prefix visibility |
| Cloudflare Radar | Token | Yes | ~15 min | Traffic, speed, IQI, outages, BGP |
| Tor Metrics / Onionoo | None | Yes | ~daily | Tor/bridge users, relays |
| Internet Society Pulse | API key | Yes | ~daily | Shutdown tracking, resilience scores |
| Censored Planet | None | Yes | ~weekly | DNS/HTTP censorship measurements |
| M-Lab | None | Yes | ~daily | Speed tests (NDT), latency |
| Google Transparency | None | Yes | ~daily | Google product traffic per country |
