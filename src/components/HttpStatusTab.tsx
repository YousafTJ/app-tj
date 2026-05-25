"use client";

import { useState, useMemo } from "react";

interface StatusCode {
  code: number;
  title: string;
  group: string;
  color: string;
  desc: string;
  when: string;
  fix: string;
}

const STATUS_CODES: StatusCode[] = [
  {
    code: 100,
    title: "Continue",
    group: "1xx",
    color: "#94a3b8",
    desc: "Serveren har modtaget anmodningens headers og klienten bør fortsætte med at sende body.",
    when: "Bruges ved store uploads hvor klienten sender 'Expect: 100-continue' først.",
    fix: "Fortsæt med at sende request body.",
  },
  {
    code: 101,
    title: "Switching Protocols",
    group: "1xx",
    color: "#94a3b8",
    desc: "Serveren skifter til den protokol som klienten bad om.",
    when: "Bruges f.eks. ved opgradering fra HTTP til WebSocket.",
    fix: "Skift til den angivne protokol i svaret.",
  },
  {
    code: 200,
    title: "OK",
    group: "2xx",
    color: "#22c55e",
    desc: "Anmodningen lykkedes. Standard svar for vellykkede HTTP-forespørgsler.",
    when: "Vises ved alle succesfulde GET, POST, PUT, DELETE osv.",
    fix: "Ingen handling nødvendig — alt er i orden.",
  },
  {
    code: 201,
    title: "Created",
    group: "2xx",
    color: "#22c55e",
    desc: "En ny ressource er blevet oprettet som følge af anmodningen.",
    when: "Returneres typisk efter en POST-anmodning der opretter en ny ressource.",
    fix: "Ingen handling nødvendig — ressourcen er oprettet.",
  },
  {
    code: 204,
    title: "No Content",
    group: "2xx",
    color: "#22c55e",
    desc: "Anmodningen lykkedes, men der er intet indhold at returnere.",
    when: "Bruges ofte ved DELETE-anmodninger eller PUT uden svar-body.",
    fix: "Ingen handling nødvendig — operationen gennemført uden indhold i svar.",
  },
  {
    code: 301,
    title: "Moved Permanently",
    group: "3xx",
    color: "#60a5fa",
    desc: "Ressourcen er permanent flyttet til en ny URL angivet i Location-headeren.",
    when: "Bruges når en side er permanent omdirigeret til en ny adresse.",
    fix: "Opdater links og bookmarks til den nye URL.",
  },
  {
    code: 302,
    title: "Found",
    group: "3xx",
    color: "#60a5fa",
    desc: "Ressourcen er midlertidigt placeret på en anden URL.",
    when: "Bruges ved midlertidige omdirigeringer, f.eks. under vedligeholdelse.",
    fix: "Følg den angivne Location-URL midlertidigt.",
  },
  {
    code: 304,
    title: "Not Modified",
    group: "3xx",
    color: "#60a5fa",
    desc: "Ressourcen er ikke ændret siden sidst — klienten kan bruge sin cache.",
    when: "Vises ved betingede GET-anmodninger med If-Modified-Since eller If-None-Match.",
    fix: "Brug den cachede version af ressourcen.",
  },
  {
    code: 307,
    title: "Temporary Redirect",
    group: "3xx",
    color: "#60a5fa",
    desc: "Ressourcen er midlertidigt på en anden URL. Metode og body bevares.",
    when: "Ligesom 302, men garanterer at HTTP-metoden ikke ændres ved omdirigering.",
    fix: "Gentag anmodningen til den nye URL med samme metode.",
  },
  {
    code: 308,
    title: "Permanent Redirect",
    group: "3xx",
    color: "#60a5fa",
    desc: "Ressourcen er permanent flyttet. Metode og body bevares.",
    when: "Ligesom 301, men garanterer at HTTP-metoden ikke ændres.",
    fix: "Opdater links til den nye URL og brug samme HTTP-metode.",
  },
  {
    code: 400,
    title: "Bad Request",
    group: "4xx",
    color: "#f59e0b",
    desc: "Serveren kan ikke behandle anmodningen på grund af ugyldig syntaks.",
    when: "Opstår ved forkert formateret JSON, manglende påkrævede felter eller ugyldig data.",
    fix: "Tjek request body og headers for fejl, ret syntaksen og prøv igen.",
  },
  {
    code: 401,
    title: "Unauthorized",
    group: "4xx",
    color: "#f59e0b",
    desc: "Anmodningen kræver autentificering — klienten er ikke logget ind.",
    when: "Vises når et API-kald mangler et gyldigt token eller login-session er udløbet.",
    fix: "Log ind igen eller send gyldige credentials/token med anmodningen.",
  },
  {
    code: 403,
    title: "Forbidden",
    group: "4xx",
    color: "#f59e0b",
    desc: "Serveren forstår anmodningen, men nægter at udføre den. Ingen adgang.",
    when: "Opstår når en autentificeret bruger forsøger at tilgå en ressource de ikke har rettigheder til.",
    fix: "Kontakt administrator for de nødvendige rettigheder.",
  },
  {
    code: 404,
    title: "Not Found",
    group: "4xx",
    color: "#f59e0b",
    desc: "Den ønskede ressource blev ikke fundet på serveren.",
    when: "Vises når en URL ikke eksisterer, en side er slettet eller en ressource mangler.",
    fix: "Tjek URL'en for stavefejl, eller ressourcen er måske slettet/flyttet.",
  },
  {
    code: 405,
    title: "Method Not Allowed",
    group: "4xx",
    color: "#f59e0b",
    desc: "HTTP-metoden er ikke tilladt for den angivne ressource.",
    when: "Opstår f.eks. når man sender POST til et endpoint der kun accepterer GET.",
    fix: "Tjek Allow-headeren i svaret og brug den korrekte HTTP-metode.",
  },
  {
    code: 408,
    title: "Request Timeout",
    group: "4xx",
    color: "#f59e0b",
    desc: "Serveren tidsudløb mens den ventede på anmodningen.",
    when: "Opstår når en klient er for langsom til at sende en komplet anmodning.",
    fix: "Tjek din internetforbindelse og prøv igen. Overvej at optimere request størrelsen.",
  },
  {
    code: 409,
    title: "Conflict",
    group: "4xx",
    color: "#f59e0b",
    desc: "Anmodningen kan ikke behandles pga. en konflikt med ressourcens nuværende tilstand.",
    when: "Opstår f.eks. ved forsøg på at oprette en ressource der allerede eksisterer.",
    fix: "Løs konflikten ved at opdatere eller slette den eksisterende ressource først.",
  },
  {
    code: 413,
    title: "Content Too Large",
    group: "4xx",
    color: "#f59e0b",
    desc: "Request body er større end serveren er villig til at behandle.",
    when: "Opstår ved upload af for store filer eller for store JSON-payloads.",
    fix: "Reducer størrelsen af dataene der sendes, eller opdel i mindre requests.",
  },
  {
    code: 415,
    title: "Unsupported Media Type",
    group: "4xx",
    color: "#f59e0b",
    desc: "Servereren understøtter ikke det medieformat som klienten har sendt.",
    when: "Opstår når Content-Type headeren ikke matcher hvad serveren forventer.",
    fix: "Sæt korrekt Content-Type header, f.eks. 'application/json'.",
  },
  {
    code: 422,
    title: "Unprocessable Entity",
    group: "4xx",
    color: "#f59e0b",
    desc: "Anmodningen er velformet, men kan ikke behandles pga. semantiske fejl.",
    when: "Bruges i REST API'er når valideringsregler fejler, f.eks. ugyldig e-mailadresse.",
    fix: "Ret de angivne valideringsfejl i request body.",
  },
  {
    code: 429,
    title: "Too Many Requests",
    group: "4xx",
    color: "#f59e0b",
    desc: "Klienten har sendt for mange anmodninger på kort tid (rate limiting).",
    when: "Vises når API rate limits er overskredet.",
    fix: "Vent og prøv igen. Tjek Retry-After headeren for ventetid.",
  },
  {
    code: 500,
    title: "Internal Server Error",
    group: "5xx",
    color: "#f87171",
    desc: "En generel fejl på serveren. Noget gik galt, men serveren ved ikke hvad.",
    when: "Opstår ved ubehandlede exceptions, konfigurationsfejl eller bugs i server-kode.",
    fix: "Kontakt server-administrator. Tjek server logs for detaljer.",
  },
  {
    code: 502,
    title: "Bad Gateway",
    group: "5xx",
    color: "#f87171",
    desc: "En gateway eller proxy modtog et ugyldigt svar fra en upstream-server.",
    when: "Opstår når en reverse proxy (f.eks. Nginx) ikke kan nå backend-serveren.",
    fix: "Tjek om backend-serveren kører og er tilgængelig fra proxy-serveren.",
  },
  {
    code: 503,
    title: "Service Unavailable",
    group: "5xx",
    color: "#f87171",
    desc: "Serveren er midlertidigt utilgængelig — overbelastet eller nede for vedligeholdelse.",
    when: "Opstår ved planlagt nedetid, servere der er overbelastede eller crashede.",
    fix: "Prøv igen om lidt. Tjek Retry-After headeren hvis den er til stede.",
  },
  {
    code: 504,
    title: "Gateway Timeout",
    group: "5xx",
    color: "#f87171",
    desc: "En gateway eller proxy fik ikke svar fra upstream-serveren i tide.",
    when: "Opstår når backend-serveren er for langsom til at svare inden timeout.",
    fix: "Tjek backend-serverens ydeevne og øg eventuelt timeout-værdier.",
  },
];

const GROUP_LABELS: Record<string, string> = {
  "1xx": "1xx Informational",
  "2xx": "2xx Success",
  "3xx": "3xx Redirection",
  "4xx": "4xx Client Error",
  "5xx": "5xx Server Error",
};

export default function HttpStatusTab() {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return STATUS_CODES;
    return STATUS_CODES.filter(
      (s) =>
        String(s.code).includes(q) ||
        s.title.toLowerCase().includes(q) ||
        s.desc.toLowerCase().includes(q) ||
        s.when.toLowerCase().includes(q) ||
        s.fix.toLowerCase().includes(q)
    );
  }, [search]);

  const groups = useMemo(() => {
    const map = new Map<string, StatusCode[]>();
    for (const code of filtered) {
      const arr = map.get(code.group) ?? [];
      arr.push(code);
      map.set(code.group, arr);
    }
    return map;
  }, [filtered]);

  const groupOrder = ["1xx", "2xx", "3xx", "4xx", "5xx"];

  return (
    <div style={{ padding: "24px", maxWidth: 900, margin: "0 auto" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 24,
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: 22,
            fontWeight: 700,
            color: "var(--text)",
          }}
        >
          HTTP Statuskoder
        </h2>
        <span
          style={{
            fontSize: 13,
            color: "var(--text-3)",
            background: "#f9f8f6",
            border: "1px solid #e8e5e1",
            borderRadius: 20,
            padding: "3px 12px",
          }}
        >
          {filtered.length} kode{filtered.length !== 1 ? "r" : ""} vist
        </span>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 28 }}>
        <input
          className="uv-input"
          type="text"
          placeholder="Søg efter kode (f.eks. 502) eller tekst (f.eks. timeout, redirect)…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: "10px 14px",
            fontSize: 15,
            border: "1px solid #e8e5e1",
            borderRadius: 8,
            background: "#fff",
            color: "var(--text)",
            outline: "none",
          }}
        />
      </div>

      {/* Groups */}
      {filtered.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            color: "var(--text-3)",
            padding: "48px 0",
            fontSize: 15,
          }}
        >
          Ingen koder matcher din søgning.
        </div>
      ) : (
        groupOrder.map((group) => {
          const codes = groups.get(group);
          if (!codes || codes.length === 0) return null;
          const groupColor = codes[0].color;
          return (
            <div key={group} style={{ marginBottom: 32 }}>
              {/* Section header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 14,
                }}
              >
                <div
                  style={{
                    width: 4,
                    height: 22,
                    borderRadius: 2,
                    background: groupColor,
                    flexShrink: 0,
                  }}
                />
                <h3
                  style={{
                    margin: 0,
                    fontSize: 16,
                    fontWeight: 700,
                    color: groupColor,
                    letterSpacing: "0.02em",
                  }}
                >
                  {GROUP_LABELS[group]}
                </h3>
              </div>

              {/* Cards */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))",
                  gap: 14,
                }}
              >
                {codes.map((s) => (
                  <div
                    key={s.code}
                    className="uv-card-1"
                    style={{
                      background: "#fff",
                      border: "1px solid #e8e5e1",
                      borderRadius: 10,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      className="uv-card-1-inner"
                      style={{ padding: "16px 18px" }}
                    >
                      {/* Code + Title */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "baseline",
                          gap: 10,
                          marginBottom: 8,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 28,
                            fontWeight: 800,
                            color: groupColor,
                            lineHeight: 1,
                            fontVariantNumeric: "tabular-nums",
                            letterSpacing: "-0.02em",
                          }}
                        >
                          {s.code}
                        </span>
                        <span
                          style={{
                            fontSize: 15,
                            fontWeight: 600,
                            color: "var(--text)",
                          }}
                        >
                          {s.title}
                        </span>
                      </div>

                      {/* Description */}
                      <p
                        style={{
                          margin: "0 0 10px 0",
                          fontSize: 13.5,
                          color: "var(--text-2)",
                          lineHeight: 1.55,
                        }}
                      >
                        {s.desc}
                      </p>

                      {/* When */}
                      <div
                        style={{
                          background: "#f9f8f6",
                          borderRadius: 6,
                          padding: "8px 10px",
                          marginBottom: 8,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: "var(--text-3)",
                            textTransform: "uppercase",
                            letterSpacing: "0.06em",
                            display: "block",
                            marginBottom: 3,
                          }}
                        >
                          Hvornår opstår det
                        </span>
                        <span
                          style={{
                            fontSize: 13,
                            color: "var(--text-2)",
                            lineHeight: 1.45,
                          }}
                        >
                          {s.when}
                        </span>
                      </div>

                      {/* Fix */}
                      <div
                        style={{
                          background: "#f9f8f6",
                          borderRadius: 6,
                          padding: "8px 10px",
                          borderLeft: `3px solid ${groupColor}`,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: "var(--text-3)",
                            textTransform: "uppercase",
                            letterSpacing: "0.06em",
                            display: "block",
                            marginBottom: 3,
                          }}
                        >
                          Hvad gør man
                        </span>
                        <span
                          style={{
                            fontSize: 13,
                            color: "var(--text-2)",
                            lineHeight: 1.45,
                          }}
                        >
                          {s.fix}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
