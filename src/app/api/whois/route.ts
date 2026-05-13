import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  let domain = req.nextUrl.searchParams.get("domain") ?? "";
  if (!domain) return NextResponse.json({ error: "Mangler domæne" }, { status: 400 });
  domain = domain.replace(/^https?:\/\//i, "").split("/")[0].toLowerCase().trim();

  try {
    const res = await fetch(`https://rdap.org/domain/${encodeURIComponent(domain)}`, {
      headers: { Accept: "application/rdap+json" },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new Error(`RDAP svarede ${res.status}`);
    const data = await res.json();

    const events: Record<string, string> = {};
    for (const ev of (data.events ?? []) as { eventAction: string; eventDate: string }[]) {
      events[ev.eventAction] = ev.eventDate;
    }

    const nameservers: string[] = ((data.nameservers ?? []) as { ldhName?: string }[])
      .map(ns => ns.ldhName?.toLowerCase() ?? "")
      .filter(Boolean);

    let registrar: string | null = null;
    for (const entity of (data.entities ?? []) as { roles?: string[]; vcardArray?: unknown[][] }[]) {
      if (entity.roles?.includes("registrar")) {
        const vcard = entity.vcardArray?.[1] as string[][] | undefined;
        registrar = vcard?.find(v => v[0] === "fn")?.[3] ?? null;
        break;
      }
    }

    const registered = events["registration"] ? new Date(events["registration"]) : null;
    const expires    = events["expiration"]   ? new Date(events["expiration"])   : null;
    const updated    = events["last changed"] ? new Date(events["last changed"]) : null;

    const ageDays          = registered ? Math.floor((Date.now() - registered.getTime()) / 86400000) : null;
    const daysUntilExpiry  = expires    ? Math.floor((expires.getTime() - Date.now())    / 86400000) : null;

    return NextResponse.json({
      domain,
      registered:       registered?.toISOString().slice(0, 10) ?? null,
      expires:          expires?.toISOString().slice(0, 10)    ?? null,
      updated:          updated?.toISOString().slice(0, 10)    ?? null,
      ageDays,
      daysUntilExpiry,
      registrar,
      nameservers,
      status: (data.status ?? []) as string[],
    });
  } catch (e: unknown) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "WHOIS fejlede" },
      { status: 500 },
    );
  }
}
