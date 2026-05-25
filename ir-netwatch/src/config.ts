export interface ServiceConfig {
  id: string;
  name: string;
  url: string;
  type: string;
  interval: number;
  threshold_warn?: number;
  threshold_crit?: number;
}

export interface CategoryConfig {
  name: string;
  icon: string;
  cat_id: string;
  services: ServiceConfig[];
}

export const CATEGORIES: CategoryConfig[] = [
  {
    name: 'Outage Detection (IODA)',
    icon: '🔴',
    cat_id: 'IODA',
    services: [
      { id: 'ioda-bgp', name: 'IODA BGP Visibility', url: 'https://api.ioda.inetintel.cc.gatech.edu/v2/signals/raw/country/IR?from=__7D_AGO__&until=__NOW__&datasource=bgp&maxPoints=1', type: 'ioda_signal', interval: 300, threshold_warn: 80, threshold_crit: 50 },
      { id: 'ioda-ping', name: 'IODA Active Probing', url: 'https://api.ioda.inetintel.cc.gatech.edu/v2/signals/raw/country/IR?from=__7D_AGO__&until=__NOW__&datasource=ping-slash24&maxPoints=1', type: 'ioda_signal', interval: 300, threshold_warn: 80, threshold_crit: 50 },
      { id: 'ioda-merit', name: 'IODA MERIT Telescope', url: 'https://api.ioda.inetintel.cc.gatech.edu/v2/signals/raw/country/IR?from=__7D_AGO__&until=__NOW__&datasource=merit-nt&maxPoints=1', type: 'ioda_signal', interval: 300, threshold_warn: 80, threshold_crit: 50 },
      { id: 'ioda-gtr', name: 'IODA Google Traffic', url: 'https://api.ioda.inetintel.cc.gatech.edu/v2/signals/raw/country/IR?from=__7D_AGO__&until=__NOW__&datasource=gtr&maxPoints=1', type: 'ioda_signal', interval: 300, threshold_warn: 80, threshold_crit: 50 },
      { id: 'ioda-alerts', name: 'IODA Outage Alerts', url: 'https://api.ioda.inetintel.cc.gatech.edu/v2/outages/alerts?entityType=country&entityCode=IR&from=__24H_AGO__&until=__NOW__&limit=5', type: 'ioda_alerts', interval: 300 },
      { id: 'ioda-latency', name: 'IODA Latency', url: 'https://api.ioda.inetintel.cc.gatech.edu/v2/signals/raw/country/IR?from=__7D_AGO__&until=__NOW__&datasource=ping-slash24-latency&maxPoints=1', type: 'ioda_signal', interval: 600, threshold_warn: 80, threshold_crit: 50 },
      { id: 'ioda-loss', name: 'IODA Packet Loss', url: 'https://api.ioda.inetintel.cc.gatech.edu/v2/signals/raw/country/IR?from=__7D_AGO__&until=__NOW__&datasource=ping-slash24-loss&maxPoints=1', type: 'ioda_signal', interval: 600, threshold_warn: 80, threshold_crit: 50 },
    ],
  },
  {
    name: 'Censorship Detection (OONI)',
    icon: '🔒',
    cat_id: 'OONI',
    services: [
      { id: 'ooni-web', name: 'Web Censorship', url: 'https://api.ooni.io/api/v1/aggregation?probe_cc=IR&test_name=web_connectivity&since=__7D_AGO_DATE__&until=__TODAY__&axis_x=measurement_start_day', type: 'ooni_aggregation', interval: 900 },
      { id: 'ooni-telegram', name: 'Telegram Blocking', url: 'https://api.ooni.io/api/v1/aggregation?probe_cc=IR&test_name=telegram&since=__7D_AGO_DATE__&until=__TODAY__', type: 'ooni_aggregation', interval: 900 },
      { id: 'ooni-whatsapp', name: 'WhatsApp Blocking', url: 'https://api.ooni.io/api/v1/aggregation?probe_cc=IR&test_name=whatsapp&since=__7D_AGO_DATE__&until=__TODAY__', type: 'ooni_aggregation', interval: 900 },
      { id: 'ooni-signal', name: 'Signal Blocking', url: 'https://api.ooni.io/api/v1/aggregation?probe_cc=IR&test_name=signal&since=__7D_AGO_DATE__&until=__TODAY__', type: 'ooni_aggregation', interval: 900 },
      { id: 'ooni-facebook', name: 'Facebook Blocking', url: 'https://api.ooni.io/api/v1/aggregation?probe_cc=IR&test_name=facebook_messenger&since=__7D_AGO_DATE__&until=__TODAY__', type: 'ooni_aggregation', interval: 900 },
      { id: 'ooni-psiphon', name: 'Psiphon Reachability', url: 'https://api.ooni.io/api/v1/aggregation?probe_cc=IR&test_name=psiphon&since=__7D_AGO_DATE__&until=__TODAY__', type: 'ooni_aggregation', interval: 900 },
      { id: 'ooni-tor', name: 'Tor Reachability', url: 'https://api.ooni.io/api/v1/aggregation?probe_cc=IR&test_name=tor&since=__7D_AGO_DATE__&until=__TODAY__', type: 'ooni_aggregation', interval: 900 },
      { id: 'ooni-torsf', name: 'Tor Snowflake', url: 'https://api.ooni.io/api/v1/aggregation?probe_cc=IR&test_name=torsf&since=__7D_AGO_DATE__&until=__TODAY__', type: 'ooni_aggregation', interval: 900 },
      { id: 'ooni-dpi', name: 'DPI / Middlebox', url: 'https://api.ooni.io/api/v1/aggregation?probe_cc=IR&test_name=http_invalid_request_line&since=__7D_AGO_DATE__&until=__TODAY__', type: 'ooni_aggregation', interval: 1800 },
      { id: 'ooni-dns', name: 'DNS Tampering', url: 'https://api.ooni.io/api/v1/aggregation?probe_cc=IR&test_name=dns_consistency&since=__7D_AGO_DATE__&until=__TODAY__', type: 'ooni_aggregation', interval: 1800 },
    ],
  },
  {
    name: 'Network Quality',
    icon: '📡',
    cat_id: 'NET',
    services: [
      { id: 'irinter-score', name: 'irinter.net Score', url: 'https://irinter.net/api/data/network-score?from=__24H_AGO__&until=__NOW__', type: 'irinter_score', interval: 300, threshold_warn: 70, threshold_crit: 50 },
      { id: 'ripe-probes-up', name: 'RIPE Probes Active', url: 'https://atlas.ripe.net/api/v2/probes/?country_code=IR&status=1&page_size=1', type: 'ripe_probes', interval: 600 },
      { id: 'ripe-probes-down', name: 'RIPE Probes Disconnected', url: 'https://atlas.ripe.net/api/v2/probes/?country_code=IR&status=2&page_size=1', type: 'ripe_probes', interval: 600 },
    ],
  },
  {
    name: 'ISP Monitoring (IODA per-ASN)',
    icon: '🏢',
    cat_id: 'ISP',
    services: [
      { id: 'isp-irancell', name: 'Irancell (AS44244)', url: 'https://api.ioda.inetintel.cc.gatech.edu/v2/signals/raw/asn/44244?from=__7D_AGO__&until=__NOW__&datasource=bgp&maxPoints=1', type: 'ioda_signal', interval: 600, threshold_warn: 80, threshold_crit: 50 },
      { id: 'isp-mci', name: 'MCI / Hamrah-e-Aval (AS197207)', url: 'https://api.ioda.inetintel.cc.gatech.edu/v2/signals/raw/asn/197207?from=__7D_AGO__&until=__NOW__&datasource=bgp&maxPoints=1', type: 'ioda_signal', interval: 600, threshold_warn: 80, threshold_crit: 50 },
      { id: 'isp-tic', name: 'DCI / TIC (AS12880)', url: 'https://api.ioda.inetintel.cc.gatech.edu/v2/signals/raw/asn/12880?from=__7D_AGO__&until=__NOW__&datasource=bgp&maxPoints=1', type: 'ioda_signal', interval: 600, threshold_warn: 80, threshold_crit: 50 },
      { id: 'isp-shatel', name: 'Shatel (AS31549)', url: 'https://api.ioda.inetintel.cc.gatech.edu/v2/signals/raw/asn/31549?from=__7D_AGO__&until=__NOW__&datasource=bgp&maxPoints=1', type: 'ioda_signal', interval: 600, threshold_warn: 80, threshold_crit: 50 },
      { id: 'isp-asiatech', name: 'Asiatech (AS43754)', url: 'https://api.ioda.inetintel.cc.gatech.edu/v2/signals/raw/asn/43754?from=__7D_AGO__&until=__NOW__&datasource=bgp&maxPoints=1', type: 'ioda_signal', interval: 600, threshold_warn: 80, threshold_crit: 50 },
      { id: 'isp-mobinnet', name: 'Mobinnet (AS50810)', url: 'https://api.ioda.inetintel.cc.gatech.edu/v2/signals/raw/asn/50810?from=__7D_AGO__&until=__NOW__&datasource=bgp&maxPoints=1', type: 'ioda_signal', interval: 600, threshold_warn: 80, threshold_crit: 50 },
      { id: 'isp-arvancloud', name: 'ArvanCloud (AS205585)', url: 'https://api.ioda.inetintel.cc.gatech.edu/v2/signals/raw/asn/205585?from=__7D_AGO__&until=__NOW__&datasource=bgp&maxPoints=1', type: 'ioda_signal', interval: 600, threshold_warn: 80, threshold_crit: 50 },
      { id: 'isp-tic-regional', name: 'TIC Regional (AS58224)', url: 'https://api.ioda.inetintel.cc.gatech.edu/v2/signals/raw/asn/58224?from=__7D_AGO__&until=__NOW__&datasource=bgp&maxPoints=1', type: 'ioda_signal', interval: 600, threshold_warn: 80, threshold_crit: 50 },
      { id: 'isp-respina', name: 'Respina (AS42337)', url: 'https://api.ioda.inetintel.cc.gatech.edu/v2/signals/raw/asn/42337?from=__7D_AGO__&until=__NOW__&datasource=bgp&maxPoints=1', type: 'ioda_signal', interval: 600, threshold_warn: 80, threshold_crit: 50 },
      { id: 'isp-pishgaman', name: 'Pishgaman (AS44208)', url: 'https://api.ioda.inetintel.cc.gatech.edu/v2/signals/raw/asn/44208?from=__7D_AGO__&until=__NOW__&datasource=bgp&maxPoints=1', type: 'ioda_signal', interval: 600, threshold_warn: 80, threshold_crit: 50 },
    ],
  },
  {
    name: 'Circumvention & Anonymity',
    icon: '🛡️',
    cat_id: 'VPN',
    services: [
      { id: 'psiphon-conduit', name: 'Psiphon Conduit Stats', url: 'https://stats.psianalytics.live/conduitStats', type: 'psiphon_stats', interval: 3600 },
      { id: 'psiphon-global', name: 'Psiphon Global Stats', url: 'https://stats.psianalytics.live/psiphonStats', type: 'psiphon_stats', interval: 3600 },
      { id: 'tor-bridge-users', name: 'Tor Bridge Users (Iran)', url: 'https://metrics.torproject.org/userstats-bridge-country.csv?start=__30D_AGO_DATE__&end=__TODAY__&country=ir', type: 'tor_csv', interval: 3600 },
      { id: 'tor-relay-users', name: 'Tor Relay Users (Iran)', url: 'https://metrics.torproject.org/userstats-relay-country.csv?start=__30D_AGO_DATE__&end=__TODAY__&country=ir', type: 'tor_csv', interval: 3600 },
    ],
  },
  {
    name: 'BGP & Routing (RIPEstat)',
    icon: '🌐',
    cat_id: 'BGP',
    services: [
      { id: 'ripestat-country-asns', name: 'Iran ASN Count', url: 'https://stat.ripe.net/data/country-asns/data.json?resource=IR&lod=1', type: 'ripestat', interval: 21600 },
      { id: 'ripestat-tic-prefixes', name: 'TIC Announced Prefixes', url: 'https://stat.ripe.net/data/announced-prefixes/data.json?resource=AS12880', type: 'ripestat', interval: 3600 },
      { id: 'ripestat-irancell-visibility', name: 'Irancell Route Visibility', url: 'https://stat.ripe.net/data/visibility/data.json?resource=AS44244', type: 'ripestat', interval: 3600 },
    ],
  },
  {
    name: 'Iran Direct Connectivity',
    icon: '🇮🇷',
    cat_id: 'IR',
    services: [
      { id: 'ir-dns-shecan', name: 'Shecan DNS', url: 'https://shecan.ir/', type: 'http', interval: 300 },
      { id: 'ir-isp-shatel', name: 'Shatel', url: 'https://shatel.ir/', type: 'http', interval: 300 },
      { id: 'ir-isp-asiatech', name: 'Asiatech', url: 'https://asiatech.ir/', type: 'http', interval: 300 },
      { id: 'ir-isp-irancell', name: 'Irancell', url: 'https://irancell.ir/', type: 'http', interval: 300 },
      { id: 'ir-isp-mobinnet', name: 'Mobinnet', url: 'https://mobinnet.ir/', type: 'http', interval: 300 },
      { id: 'ir-isp-respina', name: 'Respina', url: 'https://respina.net/', type: 'http', interval: 300 },
      { id: 'ir-service-digikala', name: 'Digikala', url: 'https://digikala.com/', type: 'http', interval: 300 },
      { id: 'ir-service-filimo', name: 'Filimo', url: 'https://filimo.com/', type: 'http', interval: 300 },
      { id: 'ir-service-aparat', name: 'Aparat', url: 'https://aparat.com/', type: 'http', interval: 300 },
      { id: 'ir-service-snapp', name: 'Snapp', url: 'https://snapp.ir/', type: 'http', interval: 300 },
      { id: 'ir-service-tapsi', name: 'Tapsi', url: 'https://tapsi.ir/', type: 'http', interval: 300 },
      { id: 'ir-service-cafebazaar', name: 'CafeBazaar', url: 'https://cafebazaar.ir/', type: 'http', interval: 300 },
      { id: 'ir-messaging-bale', name: 'Bale Messenger', url: 'https://bale.ai/', type: 'http', interval: 300 },
      { id: 'ir-messaging-rubika', name: 'Rubika', url: 'https://rubika.ir/', type: 'http', interval: 300 },
      { id: 'ir-messaging-eitaa', name: 'Eitaa', url: 'https://eitaa.com/', type: 'http', interval: 300 },
      { id: 'ir-messaging-soroush', name: 'Soroush', url: 'https://splus.ir/', type: 'http', interval: 300 },
      { id: 'ir-bank-pasargad', name: 'Pasargad Bank', url: 'https://bpi.ir/', type: 'http', interval: 300 },
      { id: 'ir-bank-saman', name: 'Saman Bank', url: 'https://sb24.ir/', type: 'http', interval: 300 },
      { id: 'ir-bank-shaparak', name: 'Shaparak', url: 'https://shaparak.ir/', type: 'http', interval: 300 },
      { id: 'ir-university-sharif', name: 'Sharif University', url: 'https://sharif.edu/', type: 'http', interval: 300 },
      { id: 'ir-university-amirkabir', name: 'Amirkabir University', url: 'https://aut.ac.ir/', type: 'http', interval: 300 },
      { id: 'ir-university-ipm', name: 'IPM Research', url: 'https://ipm.ir/', type: 'http', interval: 300 },
      { id: 'ir-cdn-arvancloud', name: 'ArvanCloud', url: 'https://arvancloud.ir/', type: 'http', interval: 300 },
      { id: 'ir-regional-pishgaman-shiraz', name: 'Pishgaman Shiraz', url: 'https://pishgaman.net/', type: 'http', interval: 300 },
    ],
  },
];
