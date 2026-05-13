import { NextRequest, NextResponse } from "next/server";
import tls from "tls";

function checkSSL(hostname: string): Promise<Record<string, unknown>> {
  return new Promise((resolve) => {
    const socket = tls.connect(443, hostname, { servername: hostname, rejectUnauthorized: false });

    const timeout = setTimeout(() => {
      socket.destroy();
      resolve({ valid: false, error: "Timeout — host svarede ikke" });
    }, 9000);

    socket.on("secureConnect", () => {
      clearTimeout(timeout);
      try {
        const cert  = socket.getPeerCertificate();
        const proto = socket.getProtocol();
        socket.destroy();

        if (!cert?.valid_to) {
          resolve({ valid: false, error: "Intet certifikat returneret" });
          return;
        }

        const validTo  = new Date(cert.valid_to);
        const validFrom = new Date(cert.valid_from);
        const daysLeft = Math.floor((validTo.getTime() - Date.now()) / 86400000);

        resolve({
          valid:       daysLeft > 0 && !socket.authorizationError,
          daysLeft,
          issuer:      (cert.issuer as Record<string,string>)?.O  ?? (cert.issuer as Record<string,string>)?.CN ?? "Ukendt",
          issuerCN:    (cert.issuer as Record<string,string>)?.CN ?? null,
          subject:     (cert.subject as Record<string,string>)?.CN ?? hostname,
          validFrom:   validFrom.toISOString().slice(0, 10),
          validTo:     validTo.toISOString().slice(0, 10),
          protocol:    proto ?? null,
          fingerprint: cert.fingerprint ?? null,
          serialNumber: cert.serialNumber ?? null,
          authError:   socket.authorizationError ?? null,
        });
      } catch (e) {
        resolve({ valid: false, error: String(e) });
      }
    });

    socket.on("error", (err) => {
      clearTimeout(timeout);
      resolve({ valid: false, error: err.message });
    });
  });
}

export async function GET(req: NextRequest) {
  let domain = req.nextUrl.searchParams.get("domain") ?? "";
  if (!domain) return NextResponse.json({ error: "Mangler domæne" }, { status: 400 });
  domain = domain.replace(/^https?:\/\//i, "").split("/")[0];
  const result = await checkSSL(domain);
  return NextResponse.json(result);
}
