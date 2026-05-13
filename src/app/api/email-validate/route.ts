import { NextRequest, NextResponse } from "next/server";

const DISPOSABLE = new Set([
  "mailinator.com","guerrillamail.com","tempmail.com","throwaway.email",
  "sharklasers.com","guerrillamailblock.com","grr.la","guerrillamail.info",
  "spam4.me","trashmail.com","trashmail.net","trashmail.at","yopmail.com",
  "getairmail.com","fakeinbox.com","maildrop.cc","dispostable.com",
  "mailnull.com","spamgourmet.com","10minutemail.com","minutemail.com",
  "discard.email","spambob.com","spam.la","spamfree24.org","spamspot.com",
  "yopmail.fr","cool.fr.nf","jetable.fr.nf","nospam.ze.tc","nomail.xl.cx",
  "mega.zik.dj","speed.1s.fr","courriel.fr.nf","moncourrier.fr.nf",
  "tempinbox.com","tempr.email","tmail.com","dispostable.com","mailtemp.info",
  "fakemailgenerator.com","mailismagic.com","spamgap.com","trashmail.io",
  "throwam.com","spamevader.com","binkmail.com","bob.email","clrmail.com",
]);

function checkFormat(email: string): { ok: boolean; reason?: string } {
  if (!email.includes("@"))           return { ok: false, reason: "Mangler @-tegn" };
  const [local, ...rest] = email.split("@");
  const domain = rest.join("@");
  if (rest.length > 1)               return { ok: false, reason: "For mange @-tegn" };
  if (!local || local.length > 64)   return { ok: false, reason: "Ugyldig lokal del (for lang eller tom)" };
  if (!domain || !domain.includes(".")) return { ok: false, reason: "Ugyldigt domæne (mangler punktum)" };
  if (domain.length > 253)           return { ok: false, reason: "Domæne for langt" };
  if (!/^[a-zA-Z0-9._%+\-!#$&'*/=?^`{|}~]+$/.test(local))
    return { ok: false, reason: "Ugyldige tegn i lokal del" };
  if (!/^[a-zA-Z0-9.\-]+$/.test(domain))
    return { ok: false, reason: "Ugyldige tegn i domæne" };
  if (local.startsWith(".") || local.endsWith("."))
    return { ok: false, reason: "Lokal del må ikke starte/slutte med punktum" };
  if (local.includes(".."))
    return { ok: false, reason: "Dobbelt punktum i lokal del" };
  return { ok: true };
}

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email")?.trim() ?? "";
  if (!email) return NextResponse.json({ error: "Mangler email" }, { status: 400 });

  const fmt = checkFormat(email);
  if (!fmt.ok) {
    return NextResponse.json({
      email, valid: false, score: 0,
      format: false, formatReason: fmt.reason,
      hasMx: false, mxRecords: [], disposable: false, domain: "",
    });
  }

  const domain = email.split("@")[1].toLowerCase();
  const isDisposable = DISPOSABLE.has(domain);

  let hasMx = false;
  let mxRecords: string[] = [];
  try {
    const res = await fetch(
      `https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=MX`,
      { signal: AbortSignal.timeout(5000) },
    );
    if (res.ok) {
      const data = await res.json();
      if (data.Status === 0 && Array.isArray(data.Answer) && data.Answer.length > 0) {
        hasMx = true;
        mxRecords = (data.Answer as { data: string }[]).map(a => a.data).filter(Boolean);
      }
    }
  } catch { /* dns timeout — treat as unknown */ }

  const score = Number(fmt.ok) + Number(hasMx) + Number(!isDisposable);

  return NextResponse.json({
    email,
    domain,
    valid: fmt.ok && hasMx && !isDisposable,
    score,
    format: true,
    hasMx,
    mxRecords,
    disposable: isDisposable,
  });
}
