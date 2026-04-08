import { NextRequest, NextResponse } from "next/server";
import { promises as dns } from "dns";

// ─── Phone extractor ─────────────────────────────────────────────────────────

const PHONE_RE = /(?:\+45[\s\-]?)?(?:\d{2}[\s\-]?){3}\d{2}(?!\d)/g;

// Common Danish/English job titles
const TITLE_RE = /\b(Adm\.?\s*direktør|CEO|CTO|CFO|COO|CMO|CCO|CSO|CIO|direktør|underdirektør|afdelingsleder|teamleder|leder|chef|manager|konsulent|seniorkonsulent|rådgiver|ingeniør|koordinator|partner|advokat|revisor|bogholder|økonom|salgschef|salgskonsulent|marketing(?:chef|koordinator|konsulent)?|projektleder|projektkoordinator|developer|udvikler|softwareudvikler|designer|grafiker|UX[-\s]designer|webudvikler|analytiker|analyst|HR[-\s]?(?:chef|konsulent|koordinator|medarbejder)?|it[-\s]?(?:chef|konsulent|tekniker|supporter)|tekniker|supporter|kundeservicemedarbejder|receptionist|sekretær|assistent|praktikant|elev|ejer|medejer|indehaver|stifter|grundlægger|founder|co[-\s]?founder)\b/i;

interface ContactEntry {
  phone: string;
  name?: string;
  title?: string;
}

function extractContacts(html: string): ContactEntry[] {
  const entries: ContactEntry[] = [];
  const seen = new Set<string>();

  // Strip scripts, styles and tags — keep text only
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ");

  let m: RegExpExecArray | null;
  const re = new RegExp(PHONE_RE.source, "g");
  while ((m = re.exec(text)) !== null) {
    const raw = m[0].trim();
    const normalized = raw.replace(/\D/g, "");
    if (normalized.length < 8 || seen.has(normalized)) continue;
    seen.add(normalized);

    // Grab 300 chars before + 100 chars after the phone number
    const start = Math.max(0, m.index - 300);
    const end   = Math.min(text.length, m.index + raw.length + 100);
    const chunk = text.slice(start, end).replace(/\s+/g, " ").trim();

    // Name: 2–3 capitalized Danish words immediately before or after the phone
    const nameMatch = chunk.match(/\b([A-ZÆØÅ][a-zæøå]{1,25})\s([A-ZÆØÅ][a-zæøå]{1,25})(?:\s[A-ZÆØÅ][a-zæøå]{1,25})?\b/);

    // Title: any job title in the surrounding text
    const titleMatch = TITLE_RE.exec(chunk);

    entries.push({
      phone: raw.replace(/\s/g, "\u00a0").trim(),
      name:  nameMatch?.[0],
      title: titleMatch?.[0],
    });
  }

  return entries.slice(0, 30);
}

// ─── Tech stack detection ─────────────────────────────────────────────────────

export interface TechStack {
  hosting?: string;
  server?: string;
  cms?: string;
  plugins?: string[];
  frameworks?: string[];
  analytics?: string[];
}

function detectTech(html: string, headers: Record<string, string>): TechStack {
  const tech: TechStack = {};

  // ── Hosting ──────────────────────────────────────────────────────────────
  if (headers["cf-ray"]) {
    tech.hosting = "Cloudflare";
  } else if (headers["x-vercel-id"]) {
    tech.hosting = "Vercel";
  } else if (headers["x-netlify-id"] || headers["x-nf-request-id"]) {
    tech.hosting = "Netlify";
  } else if (headers["x-amz-cf-id"]) {
    tech.hosting = "AWS CloudFront";
  } else if (headers["x-azure-ref"]) {
    tech.hosting = "Azure";
  } else if (headers["x-github-request-id"]) {
    tech.hosting = "GitHub Pages";
  } else if (headers["x-wix-request-id"] || /wix\.com/i.test(headers["server"] ?? "")) {
    tech.hosting = "Wix";
  }

  // ── Server ───────────────────────────────────────────────────────────────
  const serverHeader = headers["server"] ?? "";
  if (serverHeader) {
    const sl = serverHeader.toLowerCase();
    if (sl.includes("nginx")) tech.server = "nginx";
    else if (sl.includes("apache")) tech.server = "Apache";
    else if (sl.includes("microsoft-iis") || sl.includes("iis")) tech.server = "IIS";
    else if (sl.includes("litespeed")) tech.server = "LiteSpeed";
    else if (sl.includes("cloudflare")) tech.server = "Cloudflare";
    else if (sl.includes("openresty")) tech.server = "OpenResty";
    else tech.server = serverHeader;
  }

  // ── CMS ──────────────────────────────────────────────────────────────────
  if (/wp-content|wp-includes/i.test(html)) {
    tech.cms = "WordPress";

    // Detect plugins
    const pluginRe = /\/wp-content\/plugins\/([a-z0-9_-]+)\//gi;
    const pluginNames = new Set<string>();
    let pm: RegExpExecArray | null;
    while ((pm = pluginRe.exec(html)) !== null) {
      pluginNames.add(pm[1].toLowerCase());
      if (pluginNames.size >= 6) break;
    }
    if (pluginNames.size > 0) {
      tech.plugins = Array.from(pluginNames);
    }
  } else if (/cdn\.shopify\.com|shopify\.com\/s\//i.test(html)) {
    tech.cms = "Shopify";
  } else if (/squarespace\.com|static\.squarespace/i.test(html)) {
    tech.cms = "Squarespace";
  } else if (/webflow\.com|assets\.website-files\.com/i.test(html)) {
    tech.cms = "Webflow";
  } else if (/wix\.com|static\.wixstatic/i.test(html)) {
    tech.cms = "Wix";
  } else if (/drupal\.org|\/sites\/default\/files\//i.test(html)) {
    tech.cms = "Drupal";
  } else if (/joomla/i.test(html)) {
    tech.cms = "Joomla";
  } else if (/typo3/i.test(html)) {
    tech.cms = "TYPO3";
  } else if (/ghost\.org|content\.ghost\.io/i.test(html)) {
    tech.cms = "Ghost";
  } else if (/umbraco/i.test(html)) {
    tech.cms = "Umbraco";
  } else if (/optimizely|sitecore/i.test(html)) {
    tech.cms = /optimizely/i.test(html) ? "Optimizely" : "Sitecore";
  }

  // ── Frameworks & libraries ────────────────────────────────────────────────
  const frameworks: string[] = [];

  // x-powered-by header
  const xpb = (headers["x-powered-by"] ?? "").toLowerCase();
  if (/php\s*[\d.]*/i.test(xpb)) {
    const phpVersion = xpb.match(/php[\s/]*([\d.]+)/i);
    frameworks.push(phpVersion ? `PHP ${phpVersion[1]}` : "PHP");
  }
  if (xpb.includes("asp.net")) frameworks.push("ASP.NET");
  if (xpb.includes("express")) frameworks.push("Express");
  if (xpb.includes("next.js")) frameworks.push("Next.js");

  // HTML signals
  if (/__NEXT_DATA__/i.test(html) && !frameworks.includes("Next.js")) frameworks.push("Next.js");
  if (/vue(?:\.min)?\.js|data-v-[a-f0-9]+/i.test(html)) frameworks.push("Vue.js");
  if (/angular(?:\.min)?\.js|ng-version=/i.test(html)) frameworks.push("Angular");
  if (/react(?:\.min)?\.js|__react/i.test(html)) frameworks.push("React");
  if (/jquery(?:\.min)?\.js|jQuery\s*\(/i.test(html)) frameworks.push("jQuery");
  if (/bootstrap(?:\.min)?\.(?:js|css)/i.test(html)) frameworks.push("Bootstrap");
  if (/tailwind(?:css)?(?:\.min)?\.css|class="[^"]*\b(?:text-\w+-\d+|bg-\w+-\d+|flex\s|grid\s)/i.test(html)) frameworks.push("Tailwind CSS");
  if (/svelte/i.test(html)) frameworks.push("Svelte");
  if (/astro-/i.test(html) || /astro\.build/i.test(html)) frameworks.push("Astro");
  if (/nuxt/i.test(html)) frameworks.push("Nuxt.js");
  if (/gatsby/i.test(html)) frameworks.push("Gatsby");

  if (frameworks.length > 0) tech.frameworks = frameworks;

  // ── Analytics & tracking ──────────────────────────────────────────────────
  const analytics: string[] = [];

  if (/google-analytics\.com\/analytics\.js|gtag\s*\(|googletagmanager\.com\/gtag/i.test(html)) analytics.push("Google Analytics");
  if (/googletagmanager\.com\/gtm\.js/i.test(html)) analytics.push("Google Tag Manager");
  if (/static\.hotjar\.com|hotjar\.com\/c\//i.test(html)) analytics.push("Hotjar");
  if (/fbevents\.js|connect\.facebook\.net/i.test(html)) analytics.push("Facebook Pixel");
  if (/clarity\.ms/i.test(html)) analytics.push("Microsoft Clarity");
  if (/matomo\.js|piwik\.js|\/matomo\/|\/piwik\//i.test(html)) analytics.push("Matomo");
  if (/plausible\.io/i.test(html)) analytics.push("Plausible");
  if (/segment\.io|segment\.com\/analytics/i.test(html)) analytics.push("Segment");

  if (analytics.length > 0) tech.analytics = analytics;

  return tech;
}

// ─── DNS lookup ───────────────────────────────────────────────────────────────

export interface DnsInfo {
  ip?: string;
  ipGeo?: { country?: string; city?: string; org?: string; isp?: string };
  nameservers?: string[];
  mx?: string[];
  txt?: string[];
  spf?: string;
  dmarc?: string;
  ssl?: { valid: boolean; issuer?: string; expires?: string };
}

async function lookupDnsInfo(hostname: string): Promise<DnsInfo> {
  const info: DnsInfo = {};

  // A record → IP address
  await dns.lookup(hostname).then(async ({ address }) => {
    info.ip = address;
    // IP geolocation (ip-api.com — free, no key needed)
    try {
      const geo = await fetch(`http://ip-api.com/json/${address}?fields=country,city,org,isp`, {
        signal: AbortSignal.timeout(5000),
      });
      if (geo.ok) info.ipGeo = await geo.json();
    } catch { /* geo is optional */ }
  }).catch(() => { /* no A record */ });

  // Nameservers
  await dns.resolveNs(hostname).then(ns => {
    info.nameservers = ns.sort();
  }).catch(() => { /* no NS */ });

  // MX records
  await dns.resolveMx(hostname).then(mx => {
    if (mx.length > 0) {
      info.mx = mx
        .sort((a, b) => a.priority - b.priority)
        .map(r => `${r.exchange} (prio ${r.priority})`);
    }
  }).catch(() => { /* no MX */ });

  // TXT records — filter for interesting ones
  await dns.resolveTxt(hostname).then(records => {
    const all = records.map(r => r.join(""));
    info.spf  = all.find(r => r.startsWith("v=spf1"));
    const interesting = all.filter(r =>
      r.includes("google-site-verification") ||
      r.includes("MS=ms") ||
      r.includes("atlassian-domain-verification") ||
      r.includes("facebook-domain-verification") ||
      r.includes("apple-domain-verification")
    ).slice(0, 5);
    if (interesting.length > 0) info.txt = interesting;
  }).catch(() => { /* no TXT */ });

  // DMARC record
  await dns.resolveTxt(`_dmarc.${hostname}`).then(records => {
    const dmarc = records.map(r => r.join("")).find(r => r.startsWith("v=DMARC1"));
    if (dmarc) info.dmarc = dmarc;
  }).catch(() => { /* no DMARC */ });

  return info;
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  let url = req.nextUrl.searchParams.get("url") ?? "";
  if (!url) return NextResponse.json({ error: "Mangler URL" }, { status: 400 });

  if (!/^https?:\/\//i.test(url)) url = "https://" + url;

  let hostname: string;
  try {
    hostname = new URL(url).hostname;
  } catch {
    return NextResponse.json({ error: "Ugyldig URL" }, { status: 400 });
  }

  // Run DNS lookup and HTML fetch in parallel
  const [dnsInfo, fetchResult] = await Promise.all([
    lookupDnsInfo(hostname),
    (async () => {
      try {
        const res = await fetch(url, {
          headers: { "User-Agent": "Mozilla/5.0 (compatible; TJHUBBot/1.0)" },
          redirect: "follow",
          signal: AbortSignal.timeout(10000),
        });
        const html = await res.text();
        const responseHeaders: Record<string, string> = {};
        res.headers.forEach((v, k) => { responseHeaders[k.toLowerCase()] = v; });
        return { html, responseHeaders, finalUrl: res.url, statusCode: res.status };
      } catch {
        return null;
      }
    })(),
  ]);

  if (!fetchResult) {
    return NextResponse.json({ error: "Kunne ikke hente siden. Er URL'en korrekt?" }, { status: 422 });
  }

  const { html, responseHeaders, finalUrl, statusCode } = fetchResult;

  const contacts = extractContacts(html);
  const tech     = detectTech(html, responseHeaders);

  // SSL: if HSTS header present the site enforces HTTPS
  if (responseHeaders["strict-transport-security"]) {
    dnsInfo.ssl = { valid: true };
  }

  return NextResponse.json({
    url: finalUrl,
    hostname,
    statusCode,
    contacts,
    tech,
    dnsInfo,
  });
}
