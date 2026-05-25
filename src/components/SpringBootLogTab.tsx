"use client";

import React, { useState, useMemo } from "react";

type LogLevel = "TRACE" | "DEBUG" | "INFO" | "WARN" | "ERROR" | "FATAL";
type TabMode = "A" | "B";

const LEVEL_COLOR: Record<LogLevel, string> = {
  TRACE: "#94a3b8",
  DEBUG: "#60a5fa",
  INFO:  "#34d399",
  WARN:  "#fbbf24",
  ERROR: "#f87171",
  FATAL: "#e879f9",
};

const LEVEL_BG: Record<LogLevel, string> = {
  TRACE: "rgba(148,163,184,0.08)",
  DEBUG: "rgba(96,165,250,0.08)",
  INFO:  "rgba(52,211,153,0.08)",
  WARN:  "rgba(251,191,36,0.08)",
  ERROR: "rgba(248,113,113,0.1)",
  FATAL: "rgba(232,121,249,0.1)",
};

interface ExceptionDef {
  pattern: RegExp;
  name: string;
  desc: string;
  cause: string;
  fix: string;
}

const EXCEPTION_DB: ExceptionDef[] = [
  {
    pattern: /NullPointerException/,
    name: "NullPointerException",
    desc: "Et objekt der forventedes at have en værdi er null.",
    cause: "Manglende null-tjek, ikke-initialiseret felt, eller metode returnerer null uventet.",
    fix: "Tilføj null-tjek (Objects.requireNonNull), brug Optional<T>, eller initialiser feltet korrekt.",
  },
  {
    pattern: /IllegalArgumentException/,
    name: "IllegalArgumentException",
    desc: "En metode modtog et ulovligt eller upassende argument.",
    cause: "Ugyldig input-validering — f.eks. negativt tal til en metode der kræver positivt.",
    fix: "Validér input før kald. Tilføj @Valid annotation i Spring controllers.",
  },
  {
    pattern: /IllegalStateException/,
    name: "IllegalStateException",
    desc: "Metoden er kaldt på et objekt i en upassende tilstand.",
    cause: "Kald til en metode i forkert rækkefølge, eller objekt ikke korrekt initialiseret.",
    fix: "Tjek objektets state før kald. Evt. race condition i concurrent kode.",
  },
  {
    pattern: /ClassCastException/,
    name: "ClassCastException",
    desc: "Forsøg på at caste et objekt til en type det ikke er.",
    cause: "Generics type erasure, forkert objekt i collection, eller deserialiseringsfejl.",
    fix: "Brug instanceof tjek. Gennemgå generics kode og type-parametre.",
  },
  {
    pattern: /ArrayIndexOutOfBoundsException|IndexOutOfBoundsException|StringIndexOutOfBoundsException/,
    name: "IndexOutOfBoundsException",
    desc: "Adgang til et indeks der er uden for array/listens grænser.",
    cause: "Off-by-one fejl, liste er kortere end forventet, eller tom liste.",
    fix: "Tjek array/listens størrelse før adgang. Brug .isEmpty() og .size() checks.",
  },
  {
    pattern: /StackOverflowError/,
    name: "StackOverflowError",
    desc: "Rekursion er gået uendeligt dybt og udtømt call stack.",
    cause: "Uendelig rekursion, cirkulære objektreferencer ved serialisering, eller for dyb rekursion.",
    fix: "Find rekursionens base case. Brug @JsonManagedReference/@JsonBackReference ved cirkulære relationer.",
  },
  {
    pattern: /OutOfMemoryError/,
    name: "OutOfMemoryError",
    desc: "JVM heap har ikke mere ledig hukommelse.",
    cause: "Memory leak, for stor datamængde i RAM, eller for lille heap.",
    fix: "Øg heap (-Xmx). Brug profiler (VisualVM). Tjek for collection leaks og unbounded caches.",
  },
  {
    pattern: /ClassNotFoundException|NoClassDefFoundError/,
    name: "ClassNotFoundException",
    desc: "En klasse kan ikke findes i classpath.",
    cause: "Manglende dependency i pom.xml/build.gradle, forkert package-navn, eller deployment-fejl.",
    fix: "Tilføj manglende dependency. Kør 'mvn dependency:resolve'. Tjek classpath.",
  },
  {
    pattern: /DataIntegrityViolationException/,
    name: "DataIntegrityViolationException",
    desc: "Database constraint er overtrådt.",
    cause: "Unique constraint violation, foreign key constraint, eller NOT NULL violation.",
    fix: "Tjek SQL schema constraints. Valider data før persistering. Se den indpakkede cause.",
  },
  {
    pattern: /EntityNotFoundException|NoSuchElementException/,
    name: "EntityNotFoundException",
    desc: "En forventet entitet/element eksisterer ikke.",
    cause: "ID ikke fundet i database, race condition ved sletning, eller forkert søgekriterie.",
    fix: "Brug Optional<T> fra repository. Tjek om entity eksisterer med .existsById() før findById().",
  },
  {
    pattern: /TransactionRequiredException|TransactionException/,
    name: "TransactionException",
    desc: "En transaktion mangler eller er i fejltilstand.",
    cause: "Manglende @Transactional, kald til repository uden aktiv transaktion, eller lazy loading.",
    fix: "Tilføj @Transactional på service-metoden. Brug fetch joins til at undgå LazyInitializationException.",
  },
  {
    pattern: /LazyInitializationException/,
    name: "LazyInitializationException",
    desc: "Forsøg på at tilgå et lazy-loaded felt uden for en Hibernate session.",
    cause: "Entity er loadet, session lukket, og derefter tilgås en lazy collection.",
    fix: "Brug @Transactional, fetch joins (JOIN FETCH), @EntityGraph, eller konvertér til EAGER loading.",
  },
  {
    pattern: /ConnectException|ConnectionRefusedException/,
    name: "ConnectException",
    desc: "Netværksforbindelsen blev nægtet.",
    cause: "Målservice er nede, forkert host/port, eller firewall blokerer.",
    fix: "Tjek om target-service kører. Validér host/port konfiguration. Test med curl/telnet.",
  },
  {
    pattern: /SocketTimeoutException|TimeoutException|ReadTimeoutException/,
    name: "TimeoutException",
    desc: "Forbindelsen/operationen tog for lang tid.",
    cause: "Langsom database/ekstern service, for kort timeout konfigureret, eller netværksforsinkelse.",
    fix: "Øg timeout-konfiguration. Optimer databaseforespørgsler. Implementer circuit breaker (Resilience4j).",
  },
  {
    pattern: /HttpClientErrorException|HttpServerErrorException|WebClientResponseException/,
    name: "HttpClientErrorException",
    desc: "HTTP klient modtog en fejlrespons (4xx/5xx).",
    cause: "API-kald returnerede fejl, ugyldig authentication, eller forkert request format.",
    fix: "Log response body. Tjek API dokumentation. Verificér authentication tokens og request format.",
  },
  {
    pattern: /UnsatisfiedDependencyException|BeanCreationException|NoSuchBeanDefinitionException/,
    name: "BeanCreationException",
    desc: "Spring IoC container kan ikke oprette eller finde en bean.",
    cause: "Manglende @Component/@Service/@Repository, cirkulær dependency, eller konfigurationsfejl.",
    fix: "Tjek annotations og component scan path. Brug @Lazy for cirkulære dependencies. Se caused by chain.",
  },
  {
    pattern: /PropertyValueException|BindException|MethodArgumentNotValidException/,
    name: "ValidationException",
    desc: "Input-validering fejlede.",
    cause: "Request body eller parametre opfylder ikke @Valid constraints.",
    fix: "Tjek @NotNull, @Size, @Email mv. Tilføj global ExceptionHandler for bedre fejlbeskeder.",
  },
  {
    pattern: /AccessDeniedException|AuthenticationException|InsufficientAuthenticationException/,
    name: "AccessDeniedException",
    desc: "Brugeren mangler tilladelse til ressourcen.",
    cause: "Forkert rolle/autorisation, ugyldig JWT token, eller manglende Spring Security konfiguration.",
    fix: "Tjek @PreAuthorize annotations og SecurityFilterChain konfiguration. Valider JWT expiry.",
  },
  {
    pattern: /MalformedURLException|URISyntaxException/,
    name: "MalformedURLException",
    desc: "En URL er syntaktisk ugyldig.",
    cause: "Forkert URL-format, ulovlige tegn, eller manglende scheme.",
    fix: "Brug URI.create() med try/catch. Encode URL-parametre korrekt med URLEncoder.",
  },
  {
    pattern: /JsonParseException|JsonMappingException|DeserializationException/,
    name: "JsonParseException",
    desc: "JSON kan ikke parses eller mappes til objekt.",
    cause: "Ugyldig JSON-syntax, type mismatch, eller manglende constructor.",
    fix: "Valider JSON input. Tjek felt-navne og typer matcher Java klassen. Tilføj @JsonIgnoreProperties(ignoreUnknown = true).",
  },
  {
    pattern: /SQLException|JdbcSQLException|DataAccessException/,
    name: "SQLException",
    desc: "Generel database SQL-fejl.",
    cause: "Ugyldig SQL syntax, forbindelsesfejl, eller databaseserver nede.",
    fix: "Log SQL statement og parametre. Tjek databaseforbindelsen. Se root cause for specifik fejlkode.",
  },
  {
    pattern: /NumberFormatException/,
    name: "NumberFormatException",
    desc: "En streng kan ikke konverteres til et tal.",
    cause: "Uventet format f.eks. komma istedet for punktum, bogstaver i talstreng, eller null.",
    fix: "Validér input. Brug try/catch eller apache NumberUtils.isCreatable() før konvertering.",
  },
  {
    pattern: /FileNotFoundException|NoSuchFileException/,
    name: "FileNotFoundException",
    desc: "En forventet fil kan ikke findes.",
    cause: "Forkert filsti, manglende ressource i classpath, eller deployment-fejl.",
    fix: "Brug ClassPathResource eller getClass().getResourceAsStream(). Tjek filstien med absolut path.",
  },
  {
    pattern: /IOException|UncheckedIOException/,
    name: "IOException",
    desc: "Generel I/O fejl ved fil- eller netværksoperation.",
    cause: "Netværk nede, disk fuld, manglende tilladelser, eller ødelagt stream.",
    fix: "Brug try-with-resources. Tjek resource tilgængelighed. Log den specifikke IO fejlmeddelelse.",
  },
  {
    pattern: /ConcurrentModificationException/,
    name: "ConcurrentModificationException",
    desc: "Collection modificeret under iteration.",
    cause: "Fjernelse/tilføjelse af elementer under for-each loop.",
    fix: "Brug Iterator.remove(), CopyOnWriteArrayList, eller saml items til sletning og fjern efterfølgende.",
  },
];

function lookupException(text: string): ExceptionDef | undefined {
  return EXCEPTION_DB.find(e => e.pattern.test(text));
}

interface ParsedLine {
  raw: string;
  level?: LogLevel;
  timestamp?: string;
  thread?: string;
  logger?: string;
  message: string;
  isStackTrace?: boolean;
  isCausedBy?: boolean;
  exception?: ExceptionDef;
}

const SPRING_LEVEL_RE = /\b(TRACE|DEBUG|INFO|WARN|ERROR|FATAL)\b/;
const SPRING_TS_RE = /(\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}(?:[.,]\d+)?)/;
const SPRING_THREAD_RE = /\[([^\]]{1,60})\]/;
const SPRING_LOGGER_RE = /(?:INFO|DEBUG|WARN|ERROR|TRACE|FATAL)\s+(\S+)\s*(?:---|\s*:)/;
const CAUSED_BY_RE = /^\s*(?:Caused by:|caused by:)/;
const AT_LINE_RE = /^\s+at /;

function parseSBLine(line: string): ParsedLine {
  const levelMatch = SPRING_LEVEL_RE.exec(line);
  const tsMatch = SPRING_TS_RE.exec(line);
  const threadMatch = SPRING_THREAD_RE.exec(line);
  const loggerMatch = SPRING_LOGGER_RE.exec(line);
  const isCausedBy = CAUSED_BY_RE.test(line);
  const isStackTrace = AT_LINE_RE.test(line);
  const exDef = (!isStackTrace || isCausedBy) ? lookupException(line) : undefined;

  return {
    raw: line,
    level: levelMatch ? levelMatch[1] as LogLevel : undefined,
    timestamp: tsMatch ? tsMatch[1] : undefined,
    thread: threadMatch ? threadMatch[1] : undefined,
    logger: loggerMatch ? loggerMatch[1] : undefined,
    message: line.trim(),
    isStackTrace,
    isCausedBy,
    exception: exDef,
  };
}

function parseFullLog(text: string): ParsedLine[] {
  return text.split(/\r?\n/).filter(l => l.length > 0).map(parseSBLine);
}

interface LevelSummary {
  level: LogLevel;
  count: number;
}

const SAMPLE_STACKTRACE = `2024-03-15 10:23:44.521 ERROR 12345 --- [nio-8080-exec-1] c.example.api.UserController             : Failed to load user

org.springframework.dao.DataIntegrityViolationException: could not execute statement
\tat org.hibernate.engine.jdbc.spi.SqlExceptionHelper.convert(SqlExceptionHelper.java:147)
\tat org.hibernate.engine.jdbc.spi.SqlExceptionHelper.convert(SqlExceptionHelper.java:122)
\tat org.springframework.orm.jpa.JpaTransactionManager.doCommit(JpaTransactionManager.java:541)
\tat org.springframework.transaction.support.AbstractPlatformTransactionManager.processCommit(AbstractPlatformTransactionManager.java:743)
\tat com.example.service.UserService.saveUser(UserService.java:87)
\tat com.example.api.UserController.createUser(UserController.java:45)
Caused by: org.hibernate.exception.ConstraintViolationException: could not execute statement
\tat org.hibernate.exception.internal.SQLStateConversionDelegate.convert(SQLStateConversionDelegate.java:96)
\tat org.hibernate.exception.internal.StandardSQLExceptionConverter.convert(StandardSQLExceptionConverter.java:42)
Caused by: java.sql.SQLIntegrityConstraintViolationException: Duplicate entry 'admin@example.com' for key 'users.UK_email'
\tat com.mysql.cj.jdbc.exceptions.SQLError.createSQLException(SQLError.java:117)
\tat com.mysql.cj.jdbc.exceptions.SQLExceptionsMapping.translateException(SQLExceptionsMapping.java:122)`;

const SAMPLE_FULL_LOG = `2024-03-15 09:00:01.001 INFO  12345 --- [main] c.example.Application                    : Starting Application using Java 17
2024-03-15 09:00:02.123 INFO  12345 --- [main] o.s.b.w.embedded.tomcat.TomcatServer     : Tomcat started on port(s): 8080
2024-03-15 09:00:02.500 INFO  12345 --- [main] c.example.Application                    : Started Application in 1.499 seconds
2024-03-15 09:00:15.200 DEBUG 12345 --- [nio-8080-exec-1] c.example.api.UserController             : GET /api/users/123
2024-03-15 09:00:15.450 INFO  12345 --- [nio-8080-exec-1] c.example.service.UserService            : Loading user 123
2024-03-15 09:00:15.500 INFO  12345 --- [nio-8080-exec-1] c.example.api.UserController             : Response 200 OK (300ms)
2024-03-15 09:01:00.000 WARN  12345 --- [scheduler-1] c.example.task.CleanupTask               : Cleanup took 2100ms — consider optimizing
2024-03-15 09:02:30.100 ERROR 12345 --- [nio-8080-exec-3] c.example.api.PaymentController          : Payment processing failed
2024-03-15 09:02:30.101 ERROR 12345 --- [nio-8080-exec-3] c.example.api.PaymentController          : java.net.ConnectException: Connection refused to payment-gateway:443
2024-03-15 09:02:30.102 INFO  12345 --- [nio-8080-exec-3] c.example.api.PaymentController          : Retrying payment (1/3)
2024-03-15 09:03:00.000 ERROR 12345 --- [nio-8080-exec-4] c.example.service.AuthService            : AccessDeniedException: Access is denied for user role VIEWER
2024-03-15 09:04:15.000 INFO  12345 --- [scheduler-1] c.example.task.MetricsTask               : Published metrics to Prometheus
2024-03-15 09:05:00.000 DEBUG 12345 --- [nio-8080-exec-5] c.example.api.SearchController           : Executing query with 3 filters
2024-03-15 09:05:00.500 WARN  12345 --- [nio-8080-exec-5] c.example.repository.SearchRepository   : Slow query (1250ms): SELECT * FROM products WHERE...`;

export default function SpringBootLogTab() {
  const [mode, setMode] = useState<TabMode>("A");
  const [inputA, setInputA] = useState("");
  const [inputB, setInputB] = useState("");
  const [keyword, setKeyword] = useState("");
  const [enabledLevels, setEnabledLevels] = useState<Set<LogLevel>>(
    new Set(["TRACE","DEBUG","INFO","WARN","ERROR","FATAL"])
  );
  const [expandedEx, setExpandedEx] = useState<string | null>(null);

  // Mode A: stacktrace parsing
  const parsedA = useMemo(() => {
    if (!inputA.trim()) return [];
    return inputA.split(/\r?\n/).filter(l => l.length > 0).map(parseSBLine);
  }, [inputA]);

  const mainException = useMemo(() => {
    for (const l of parsedA) {
      if (l.exception) return l.exception;
    }
    return null;
  }, [parsedA]);

  const causedByChain = useMemo(() => {
    return parsedA.filter(l => l.isCausedBy && l.exception);
  }, [parsedA]);

  // Mode B: full log
  const parsedB = useMemo(() => parseFullLog(inputB), [inputB]);

  const levelSummary: LevelSummary[] = useMemo(() => {
    const counts: Record<LogLevel, number> = { TRACE:0, DEBUG:0, INFO:0, WARN:0, ERROR:0, FATAL:0 };
    for (const l of parsedB) if (l.level) counts[l.level]++;
    return (Object.keys(counts) as LogLevel[])
      .map(level => ({ level, count: counts[level] }))
      .filter(s => s.count > 0);
  }, [parsedB]);

  const maxCount = useMemo(() => Math.max(...levelSummary.map(s => s.count), 1), [levelSummary]);

  const filteredB = useMemo(() => {
    return parsedB.filter(l => {
      if (l.level && !enabledLevels.has(l.level)) return false;
      if (!l.level && !enabledLevels.has("INFO")) return false;
      if (keyword.trim()) return l.raw.toLowerCase().includes(keyword.toLowerCase());
      return true;
    });
  }, [parsedB, enabledLevels, keyword]);

  const toggleLevel = (level: LogLevel) => {
    setEnabledLevels(prev => {
      const next = new Set(prev);
      if (next.has(level)) next.delete(level);
      else next.add(level);
      return next;
    });
  };

  const highlight = (text: string, kw: string) => {
    if (!kw.trim()) return <>{text}</>;
    const lower = text.toLowerCase();
    const kwLower = kw.toLowerCase();
    const parts: React.ReactNode[] = [];
    let cursor = 0;
    let idx = lower.indexOf(kwLower, cursor);
    while (idx !== -1) {
      if (idx > cursor) parts.push(text.slice(cursor, idx));
      parts.push(
        <mark key={idx} style={{ background: "rgba(251,191,36,0.35)", color: "inherit", borderRadius: 2 }}>
          {text.slice(idx, idx + kw.length)}
        </mark>
      );
      cursor = idx + kw.length;
      idx = lower.indexOf(kwLower, cursor);
    }
    if (cursor < text.length) parts.push(text.slice(cursor));
    return <>{parts}</>;
  };

  return (
    <div style={{ padding: "24px 0", maxWidth: 960, margin: "0 auto" }}>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>
        📋 Spring Boot Log Parser
      </h2>
      <p style={{ color: "var(--text-2)", marginBottom: 6, fontSize: 14, lineHeight: 1.65 }}>
        Analysér Spring Boot logs og stacktraces i to tilstande:
      </p>
      <div style={{ display: "flex", gap: 14, marginBottom: 20, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13, color: "var(--text-2)" }}>
          <span style={{ background: "rgba(96,165,250,0.2)", color: "#60a5fa", borderRadius: 5, padding: "1px 7px", fontWeight: 700, flexShrink: 0 }}>A</span>
          <span><strong style={{ color: "var(--text)" }}>Stacktrace-analyse</strong> — identificerer exception-type, forklarer årsag, foreslår fix og viser Caused-by kæden</span>
        </div>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13, color: "var(--text-2)" }}>
          <span style={{ background: "rgba(96,165,250,0.2)", color: "#60a5fa", borderRadius: 5, padding: "1px 7px", fontWeight: 700, flexShrink: 0 }}>B</span>
          <span><strong style={{ color: "var(--text)" }}>Fuld logfil</strong> — farvekoder alle niveauer, viser frekvensfordeling og giver søgning + filtrering</span>
        </div>
      </div>

      {/* Mode tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
        {(["A", "B"] as TabMode[]).map(m => (
          <button
            key={m}
            className="uv-btn"
            onClick={() => setMode(m)}
            style={{
              padding: "8px 20px",
              background: mode === m ? "rgba(96,165,250,0.25)" : undefined,
              color: mode === m ? "#60a5fa" : undefined,
              border: mode === m ? "1px solid rgba(96,165,250,0.4)" : undefined,
              fontWeight: mode === m ? 700 : 400,
            }}
          >
            {m === "A" ? "🔍 Mode A — Stacktrace-analyse" : "📄 Mode B — Fuld logfil"}
          </button>
        ))}
      </div>

      {/* ===== MODE A ===== */}
      {mode === "A" && (
        <div>
          <div className="uv-card-1" style={{ marginBottom: 16 }}>
            <div className="uv-card-1-inner" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: 600, color: "var(--text)", fontSize: 14 }}>Stacktrace</span>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="uv-btn" style={{ fontSize: 12, padding: "4px 10px" }}
                    onClick={() => setInputA(SAMPLE_STACKTRACE)}>
                    Eksempel
                  </button>
                  {inputA && (
                    <button className="uv-btn" style={{ fontSize: 12, padding: "4px 10px", background: "rgba(248,113,113,0.15)", color: "#f87171" }}
                      onClick={() => setInputA("")}>
                      Ryd
                    </button>
                  )}
                </div>
              </div>
              <textarea
                className="uv-input"
                value={inputA}
                onChange={e => setInputA(e.target.value)}
                placeholder={"Indsæt Spring Boot stacktrace her...\n\njava.lang.NullPointerException: Cannot invoke method...\n\tat com.example.Service.doSomething(Service.java:42)\nCaused by: ..."}
                style={{ minHeight: 180, fontFamily: "monospace", fontSize: 12, resize: "vertical" }}
              />
            </div>
          </div>

          {parsedA.length > 0 && (
            <>
              {/* Exception info card */}
              {mainException && (
                <div className="uv-card-1" style={{ marginBottom: 16, border: "1px solid rgba(248,113,113,0.35)" }}>
                  <div className="uv-card-1-inner">
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
                      <span style={{ fontSize: 22 }}>🔴</span>
                      <div>
                        <p style={{ fontSize: 15, fontWeight: 700, color: "#f87171", margin: 0 }}>
                          {mainException.name}
                        </p>
                        <p style={{ fontSize: 13, color: "var(--text-2)", margin: "4px 0 0" }}>
                          {mainException.desc}
                        </p>
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      <div style={{ background: "rgba(248,113,113,0.08)", borderRadius: 8, padding: "10px 14px" }}>
                        <p style={{ fontSize: 11, fontWeight: 700, color: "#f87171", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>Årsag</p>
                        <p style={{ fontSize: 12, color: "var(--text-2)", margin: 0 }}>{mainException.cause}</p>
                      </div>
                      <div style={{ background: "rgba(52,211,153,0.08)", borderRadius: 8, padding: "10px 14px" }}>
                        <p style={{ fontSize: 11, fontWeight: 700, color: "#34d399", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>Fix</p>
                        <p style={{ fontSize: 12, color: "var(--text-2)", margin: 0 }}>{mainException.fix}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Caused by chain */}
              {causedByChain.length > 0 && (
                <div className="uv-card-1" style={{ marginBottom: 16 }}>
                  <div className="uv-card-1-inner">
                    <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 10 }}>
                      🔗 Caused-by kæde ({causedByChain.length} led)
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {causedByChain.map((l, i) => (
                        <div key={i} style={{
                          padding: "10px 14px", borderRadius: 8,
                          background: "rgba(96,165,250,0.08)",
                          border: "1px solid rgba(96,165,250,0.2)",
                        }}>
                          <p style={{ fontSize: 12, color: "#60a5fa", fontWeight: 600, marginBottom: 2 }}>
                            ← Forårsaget af: {l.exception?.name || "Ukendt"}
                          </p>
                          <p style={{ fontSize: 11, color: "var(--text-3)", margin: 0, fontFamily: "monospace" }}>
                            {l.message}
                          </p>
                          {l.exception && (
                            <p style={{ fontSize: 11, color: "var(--text-2)", marginTop: 4 }}>
                              💡 {l.exception.fix}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Colored stacktrace */}
              <div className="uv-card-1">
                <div className="uv-card-1-inner" style={{ padding: 0 }}>
                  <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>Farvekodet stacktrace</span>
                    <div style={{ display: "flex", gap: 12, fontSize: 11, color: "var(--text-3)" }}>
                      <span><span style={{ color: "#f87171" }}>■</span> ERROR-linje</span>
                      <span><span style={{ color: "#fbbf24" }}>■</span> Caused by</span>
                      <span><span style={{ color: "#a78bfa" }}>■</span> Din kode</span>
                      <span><span style={{ color: "var(--text-3)" }}>■</span> Frameworks</span>
                    </div>
                  </div>
                  <div style={{ maxHeight: 440, overflowY: "auto", padding: "6px 0" }}>
                    {parsedA.map((l, i) => {
                      const isUserCode = /at com\.|at org\.example|at io\.example/.test(l.raw);
                      return (
                        <div key={i} style={{
                          padding: "4px 16px",
                          fontFamily: "monospace",
                          fontSize: 12,
                          lineHeight: 1.6,
                          color: l.isCausedBy ? "#fbbf24"
                            : l.isStackTrace ? (isUserCode ? "#a78bfa" : "var(--text-3)")
                            : l.level ? LEVEL_COLOR[l.level] : "var(--text-2)",
                          borderLeft: l.isCausedBy ? "4px solid #fbbf24"
                            : l.level ? `4px solid ${LEVEL_COLOR[l.level]}` : "4px solid transparent",
                          background: l.level ? LEVEL_BG[l.level]
                            : l.isCausedBy ? "rgba(251,191,36,0.06)" : "transparent",
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-all",
                        }}>
                          {l.raw}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Exception DB reference */}
              <div className="uv-card-1" style={{ marginTop: 16 }}>
                <div className="uv-card-1-inner">
                  <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>
                    📚 Exception-database ({EXCEPTION_DB.length} kendte typer)
                  </p>
                  <p style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 10 }}>
                    Klik på en exception-type for at se årsag og fix-forslag.
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {EXCEPTION_DB.map(ex => (
                      <div
                        key={ex.name}
                        onClick={() => setExpandedEx(expandedEx === ex.name ? null : ex.name)}
                        style={{
                          borderRadius: 8, overflow: "hidden", cursor: "pointer",
                          border: `1px solid ${expandedEx === ex.name ? "rgba(96,165,250,0.4)" : "rgba(255,255,255,0.06)"}`,
                          background: expandedEx === ex.name ? "rgba(96,165,250,0.08)" : "rgba(255,255,255,0.02)",
                          transition: "all 0.15s",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px" }}>
                          <span style={{ fontSize: 12, fontWeight: 600, color: "#60a5fa", flex: 1, fontFamily: "monospace" }}>
                            {ex.name}
                          </span>
                          <span style={{ fontSize: 11, color: "var(--text-3)" }}>
                            {expandedEx === ex.name ? "▲" : "▼"}
                          </span>
                        </div>
                        {expandedEx === ex.name && (
                          <div style={{ padding: "0 12px 12px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                            <p style={{ fontSize: 12, color: "var(--text-2)", marginTop: 8, marginBottom: 6 }}>{ex.desc}</p>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                              <div style={{ background: "rgba(248,113,113,0.08)", borderRadius: 6, padding: "8px 10px" }}>
                                <p style={{ fontSize: 10, fontWeight: 700, color: "#f87171", marginBottom: 3 }}>ÅRSAG</p>
                                <p style={{ fontSize: 11, color: "var(--text-2)", margin: 0 }}>{ex.cause}</p>
                              </div>
                              <div style={{ background: "rgba(52,211,153,0.08)", borderRadius: 6, padding: "8px 10px" }}>
                                <p style={{ fontSize: 10, fontWeight: 700, color: "#34d399", marginBottom: 3 }}>FIX</p>
                                <p style={{ fontSize: 11, color: "var(--text-2)", margin: 0 }}>{ex.fix}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ===== MODE B ===== */}
      {mode === "B" && (
        <div>
          <div className="uv-card-1" style={{ marginBottom: 16 }}>
            <div className="uv-card-1-inner" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: 600, color: "var(--text)", fontSize: 14 }}>Fuld log</span>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="uv-btn" style={{ fontSize: 12, padding: "4px 10px" }}
                    onClick={() => setInputB(SAMPLE_FULL_LOG)}>
                    Eksempel
                  </button>
                  {inputB && (
                    <button className="uv-btn" style={{ fontSize: 12, padding: "4px 10px", background: "rgba(248,113,113,0.15)", color: "#f87171" }}
                      onClick={() => setInputB("")}>
                      Ryd
                    </button>
                  )}
                </div>
              </div>
              <textarea
                className="uv-input"
                value={inputB}
                onChange={e => setInputB(e.target.value)}
                placeholder={"Indsæt Spring Boot log output...\n\n2024-03-15 09:00:01 INFO  --- [main] c.example.App : Starting..."}
                style={{ minHeight: 180, fontFamily: "monospace", fontSize: 12, resize: "vertical" }}
              />
            </div>
          </div>

          {parsedB.length > 0 && (
            <>
              {/* Level summary */}
              <div className="uv-card-1" style={{ marginBottom: 14 }}>
                <div className="uv-card-1-inner">
                  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 10, flexWrap: "wrap", gap: 4 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", margin: 0 }}>
                      Log-oversigt — <span style={{ color: "var(--text-2)", fontWeight: 400 }}>{parsedB.length} linjer parset</span>
                    </p>
                    <span style={{ fontSize: 11, color: "var(--text-3)" }}>Klik på et niveau for at filtrere visningen</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {levelSummary.map(({ level, count }) => (
                      <div
                        key={level}
                        onClick={() => toggleLevel(level)}
                        style={{
                          cursor: "pointer", display: "flex", alignItems: "center", gap: 10,
                          padding: "8px 12px", borderRadius: 8,
                          background: enabledLevels.has(level) ? LEVEL_BG[level] : "transparent",
                          border: `1px solid ${enabledLevels.has(level) ? LEVEL_COLOR[level] + "50" : "rgba(255,255,255,0.06)"}`,
                          opacity: enabledLevels.has(level) ? 1 : 0.4,
                          transition: "all 0.15s",
                        }}
                      >
                        <span style={{
                          minWidth: 58, fontSize: 10, fontWeight: 800, color: LEVEL_COLOR[level],
                          fontFamily: "monospace", textAlign: "center", letterSpacing: "0.05em",
                          background: `${LEVEL_COLOR[level]}20`, borderRadius: 4, padding: "2px 6px",
                        }}>
                          {level}
                        </span>
                        <div style={{ flex: 1, height: 10, background: "rgba(255,255,255,0.06)", borderRadius: 5, overflow: "hidden" }}>
                          <div style={{ width: `${(count / maxCount) * 100}%`, height: "100%", background: LEVEL_COLOR[level], borderRadius: 5 }} />
                        </div>
                        <span style={{ minWidth: 28, fontSize: 12, fontWeight: 600, color: LEVEL_COLOR[level], textAlign: "right" }}>{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Filters */}
              <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
                <input
                  className="uv-input"
                  value={keyword}
                  onChange={e => setKeyword(e.target.value)}
                  placeholder="🔍 Søg i log..."
                  style={{ flex: 1, minWidth: 200, fontSize: 13 }}
                />
                <button className="uv-btn" style={{ fontSize: 12 }}
                  onClick={() => setEnabledLevels(new Set(["TRACE","DEBUG","INFO","WARN","ERROR","FATAL"]))}>
                  Vis alle
                </button>
                <button className="uv-btn" style={{ fontSize: 12 }}
                  onClick={() => setEnabledLevels(new Set(["WARN","ERROR","FATAL"]))}>
                  Kun fejl
                </button>
              </div>

              {/* Log lines */}
              <div className="uv-card-1">
                <div className="uv-card-1-inner" style={{ padding: 0 }}>
                  <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 13, color: "var(--text-2)" }}>
                      Viser <strong style={{ color: "var(--text)" }}>{filteredB.length}</strong> af {parsedB.length} linjer
                    </span>
                    {keyword && (
                      <span style={{ fontSize: 11, color: "#fbbf24", background: "rgba(251,191,36,0.12)", borderRadius: 4, padding: "2px 8px" }}>
                        søger: &quot;{keyword}&quot;
                      </span>
                    )}
                  </div>
                  <div style={{ maxHeight: 520, overflowY: "auto" }}>
                    {filteredB.length === 0 ? (
                      <div style={{ padding: 32, textAlign: "center", color: "var(--text-3)" }}>
                        Ingen linjer matcher filteret
                      </div>
                    ) : filteredB.map((l, i) => {
                      const color = l.level ? LEVEL_COLOR[l.level] : "var(--text-3)";
                      const bg = l.level ? LEVEL_BG[l.level] : "transparent";
                      return (
                        <div key={i} style={{
                          display: "flex", gap: 10, padding: "8px 16px",
                          borderBottom: "1px solid rgba(255,255,255,0.05)",
                          borderLeft: `4px solid ${l.level ? LEVEL_COLOR[l.level] : "transparent"}`,
                          background: bg, alignItems: "flex-start",
                        }}>
                          {l.level && (
                            <span style={{
                              fontSize: 10, fontWeight: 800, color, fontFamily: "monospace",
                              background: `${color}22`, borderRadius: 4, padding: "2px 6px",
                              minWidth: 50, textAlign: "center", letterSpacing: "0.04em", flexShrink: 0,
                            }}>
                              {l.level}
                            </span>
                          )}
                          {l.timestamp && (
                            <span style={{ fontSize: 11, color: "var(--text-3)", fontFamily: "monospace", paddingTop: 3, minWidth: 90, whiteSpace: "nowrap", flexShrink: 0 }}>
                              {l.timestamp.slice(11)}
                            </span>
                          )}
                          <span style={{ fontSize: 12.5, color: "var(--text-2)", fontFamily: "monospace", wordBreak: "break-all", flex: 1, lineHeight: 1.55 }}>
                            {highlight(l.message, keyword)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
