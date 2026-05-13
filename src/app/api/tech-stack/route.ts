import { NextRequest, NextResponse } from "next/server";

interface Tech {
  name: string;
  category: string;
  icon: string;
  confidence: "definite" | "likely";
}

const PATTERNS: { name: string; category: string; icon: string; test: (h: Record<string, string>, html: string) => boolean }[] = [
  // CMS
  { name: "WordPress",    category: "CMS",       icon: "W",  test: (h, html) => /wp-content\/|wp-includes\/|\/xmlrpc\.php|<link[^>]+https:\/\/api\.w\.org/.test(html) || h["x-powered-by"]?.includes("WP Engine") === true },
  { name: "Shopify",      category: "E-handel",  icon: "S",  test: (_, html) => /Shopify\.theme|cdn\.shopify\.com|shopify-checkout/.test(html) },
  { name: "Squarespace",  category: "CMS",       icon: "Sq", test: (_, html) => /squarespace\.com|squarespace-cdn/.test(html) },
  { name: "Wix",          category: "CMS",       icon: "Wx", test: (_, html) => /static\.wixstatic\.com|wix\.com\/dplugins/.test(html) },
  { name: "Webflow",      category: "CMS",       icon: "Wf", test: (_, html) => /webflow\.com|Webflow\.require/.test(html) },
  { name: "Joomla",       category: "CMS",       icon: "J",  test: (_, html) => /\/media\/jui\/|Joomla!/.test(html) },
  { name: "Drupal",       category: "CMS",       icon: "D",  test: (_, html) => /drupal\.js|Drupal\.settings|sites\/default\/files/.test(html) },
  { name: "Ghost",        category: "CMS",       icon: "G",  test: (h, html) => h["x-ghost-cache-status"] !== undefined || /ghost\.io|content\.ghost\.org/.test(html) },
  { name: "HubSpot CMS",  category: "CMS",       icon: "H",  test: (_, html) => /hs-analytics|js\.hs-scripts\.com|\.hubspot\.com/.test(html) },
  // JS Frameworks
  { name: "Next.js",      category: "Framework", icon: "N",  test: (_, html) => /__NEXT_DATA__|_next\/static|next\/dist/.test(html) },
  { name: "Nuxt.js",      category: "Framework", icon: "Nu", test: (_, html) => /__nuxt|_nuxt\/|nuxtjs\.org/.test(html) },
  { name: "Gatsby",       category: "Framework", icon: "Gb", test: (_, html) => /gatsby-focus-wrapper|gatsby-chunk/.test(html) },
  { name: "React",        category: "Framework", icon: "Re", test: (_, html) => /data-reactroot|__reactFiber|react-root/.test(html) },
  { name: "Vue.js",       category: "Framework", icon: "Vu", test: (_, html) => /vue\.runtime|__vue_app__|id="app"[^>]*data-v-/.test(html) },
  { name: "Angular",      category: "Framework", icon: "An", test: (_, html) => /ng-version=|angular\.min\.js|<app-root/.test(html) },
  { name: "Svelte",       category: "Framework", icon: "Sv", test: (_, html) => /svelte-[a-z0-9]+\.js|class="svelte-/.test(html) },
  // E-commerce
  { name: "WooCommerce",  category: "E-handel",  icon: "Wc", test: (_, html) => /woocommerce|wc-ajax/.test(html) },
  { name: "Magento",      category: "E-handel",  icon: "M",  test: (_, html) => /Mage\.Cookies|mage\/cookies|\/skin\/frontend/.test(html) },
  { name: "PrestaShop",   category: "E-handel",  icon: "P",  test: (_, html) => /prestashop|addons\.prestashop/.test(html) },
  // Analytics
  { name: "Google Analytics",   category: "Analytics",  icon: "GA", test: (_, html) => /gtag\(|google-analytics\.com\/analytics\.js|UA-\d|G-[A-Z0-9]+/.test(html) },
  { name: "Google Tag Manager", category: "Analytics",  icon: "GT", test: (_, html) => /GTM-[A-Z0-9]+|googletagmanager\.com/.test(html) },
  { name: "Hotjar",             category: "Analytics",  icon: "Hj", test: (_, html) => /hotjar\.com|hjSetting/.test(html) },
  { name: "Matomo",             category: "Analytics",  icon: "Ma", test: (_, html) => /matomo\.js|piwik\.js/.test(html) },
  { name: "Plausible",          category: "Analytics",  icon: "Pl", test: (_, html) => /plausible\.io/.test(html) },
  { name: "Facebook Pixel",     category: "Analytics",  icon: "Fb", test: (_, html) => /connect\.facebook\.net\/[a-z_A-Z]+\/fbevents\.js|fbq\(/.test(html) },
  // Hosting / CDN
  { name: "Cloudflare",         category: "Hosting",    icon: "CF", test: (h) => h["cf-ray"] !== undefined || h["server"] === "cloudflare" },
  { name: "Vercel",             category: "Hosting",    icon: "V",  test: (h) => h["x-vercel-id"] !== undefined || h["server"] === "Vercel" },
  { name: "Netlify",            category: "Hosting",    icon: "Ne", test: (h) => h["x-nf-request-id"] !== undefined || h["server"] === "Netlify" },
  { name: "AWS / CloudFront",   category: "Hosting",    icon: "AW", test: (h) => h["x-amz-cf-id"] !== undefined || h["via"]?.includes("CloudFront") === true },
  { name: "Fastly",             category: "Hosting",    icon: "Fa", test: (h) => h["x-served-by"]?.includes("cache") === true || h["x-fastly-request-id"] !== undefined },
  // Server
  { name: "nginx",              category: "Server",     icon: "Nx", test: (h) => (h["server"] ?? "").toLowerCase().startsWith("nginx") },
  { name: "Apache",             category: "Server",     icon: "Ap", test: (h) => (h["server"] ?? "").toLowerCase().startsWith("apache") },
  { name: "IIS",                category: "Server",     icon: "II", test: (h) => (h["server"] ?? "").toLowerCase().includes("iis") || (h["server"] ?? "").toLowerCase().includes("microsoft") },
  { name: "LiteSpeed",          category: "Server",     icon: "LS", test: (h) => (h["server"] ?? "").toLowerCase().includes("litespeed") },
  // Language / runtime
  { name: "PHP",                category: "Backend",    icon: "Ph", test: (h) => (h["x-powered-by"] ?? "").toLowerCase().includes("php") || h["set-cookie"]?.includes("PHPSESSID") === true },
  { name: "Node.js / Express",  category: "Backend",    icon: "No", test: (h) => (h["x-powered-by"] ?? "").toLowerCase().includes("express") },
  { name: "ASP.NET",            category: "Backend",    icon: "As", test: (h) => (h["x-powered-by"] ?? "").toLowerCase().includes("asp.net") || h["x-aspnet-version"] !== undefined },
  { name: "Ruby on Rails",      category: "Backend",    icon: "Rb", test: (h) => (h["x-powered-by"] ?? "").toLowerCase().includes("phusion passenger") || h["x-runtime"] !== undefined },
  // CSS Frameworks
  { name: "Bootstrap",          category: "CSS",        icon: "Bs", test: (_, html) => /bootstrap\.min\.css|bootstrap\.css/.test(html) },
  { name: "Tailwind CSS",       category: "CSS",        icon: "Tw", test: (_, html) => /tailwindcss|tailwind\.min\.css/.test(html) },
  { name: "Font Awesome",       category: "CSS",        icon: "Fa", test: (_, html) => /font-awesome|fontawesome/.test(html) },
  // CRM / Chat / Marketing
  { name: "Intercom",           category: "Chat / CRM", icon: "In", test: (_, html) => /intercomSettings|widget\.intercom\.io/.test(html) },
  { name: "Zendesk",            category: "Chat / CRM", icon: "Ze", test: (_, html) => /zendesk\.com\/embeddable|zopim/.test(html) },
  { name: "HubSpot",            category: "Chat / CRM", icon: "Hs", test: (_, html) => /js\.hs-scripts\.com|hs-analytics|hubspot\.com/.test(html) },
  { name: "Crisp",              category: "Chat / CRM", icon: "Cr", test: (_, html) => /crisp\.chat|window\.\$crisp/.test(html) },
  { name: "Drift",              category: "Chat / CRM", icon: "Dr", test: (_, html) => /drift\.com\/drift\.js/.test(html) },
  // Payments
  { name: "Stripe",             category: "Betaling",   icon: "St", test: (_, html) => /js\.stripe\.com/.test(html) },
  { name: "PayPal",             category: "Betaling",   icon: "Pp", test: (_, html) => /paypal\.com\/sdk|paypalobjects\.com/.test(html) },
  // JS Libs
  { name: "jQuery",             category: "Bibliotek",  icon: "jQ", test: (_, html) => /jquery\.min\.js|jquery\.js|jquery-/.test(html) },
  { name: "GSAP",               category: "Bibliotek",  icon: "Gs", test: (_, html) => /gsap\.min\.js|TweenMax|gsap\.com/.test(html) },
];

export async function GET(req: NextRequest) {
  let url = req.nextUrl.searchParams.get("url") ?? "";
  if (!url) return NextResponse.json({ error: "Mangler URL" }, { status: 400 });
  if (!/^https?:\/\//i.test(url)) url = `https://${url}`;

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; TechStackBot/1.0)" },
      signal: AbortSignal.timeout(12000),
      redirect: "follow",
    });

    const headers: Record<string, string> = {};
    res.headers.forEach((v, k) => { headers[k.toLowerCase()] = v.toLowerCase(); });

    const contentType = headers["content-type"] ?? "";
    let html = "";
    if (contentType.includes("text/html")) {
      const text = await res.text();
      html = text.slice(0, 300_000); // max 300 KB
    }

    const detected: Tech[] = [];
    for (const p of PATTERNS) {
      try {
        if (p.test(headers, html)) {
          const isDefinite = p.test(headers, html);
          detected.push({ name: p.name, category: p.category, icon: p.icon, confidence: isDefinite ? "definite" : "likely" });
        }
      } catch { /* skip bad patterns */ }
    }

    const finalUrl = res.url ?? url;
    const status   = res.status;
    const server   = headers["server"] ?? null;
    const powered  = headers["x-powered-by"] ?? null;

    return NextResponse.json({ url: finalUrl, status, server, powered, detected });
  } catch (e: unknown) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Scanning fejlede" },
      { status: 500 },
    );
  }
}
