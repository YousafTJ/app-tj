import { NextRequest, NextResponse } from "next/server";

const FIELDS = "status,message,country,countryCode,regionName,city,zip,lat,lon,timezone,isp,org,as,asname,query,proxy,hosting,mobile";

export async function GET(req: NextRequest) {
  let ip = req.nextUrl.searchParams.get("ip")?.trim() ?? "";

  // Validate: IPv4, IPv6, or empty (for "my IP")
  if (ip && !/^[\d.:a-fA-F]+$/.test(ip)) {
    return NextResponse.json({ error: "Ugyldig IP-adresse" }, { status: 400 });
  }

  const target = ip || "";

  try {
    // ip-api.com free tier is HTTP-only — fine from server-side
    const url = `http://ip-api.com/json/${encodeURIComponent(target)}?fields=${FIELDS}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) throw new Error(`ip-api.com svarede ${res.status}`);
    const data = await res.json();

    if (data.status === "fail") {
      throw new Error(data.message ?? "Ukendt fejl fra ip-api.com");
    }

    return NextResponse.json(data);
  } catch (e: unknown) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Geolocation fejlede" },
      { status: 500 },
    );
  }
}
