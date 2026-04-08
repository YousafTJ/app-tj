"use client";

import { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type PracticeScenario = {
  setup: string;
  customerLine: string;
  task: string;
  modelAnswer: string;
  tip: string;
};

type Technique = {
  number: number;
  emoji: string;
  title: string;
  tagline: string;
  color: string;
  colorLight: string;
  what: string;
  how: string;
  scripts: string[];
  watchOut: string;
  practiceScenarios: PracticeScenario[];
};

// ─── Data ─────────────────────────────────────────────────────────────────────

const TECHNIQUES: Technique[] = [
  {
    number: 1,
    emoji: "🗺️",
    title: "Forstå situationen",
    tagline: "Kortlæg nuværende situation præcist",
    color: "#f59e0b",
    colorLight: "#fffbeb",
    what: "Stil konkrete faktaspørgsmål om kundens nuværende setup, processer og kontekst — INDEN du taler om din løsning. Det viser forberedelse og giver dig det fundament, du behøver for at tale relevant.",
    how: "Brug åbne spørgsmål der starter med 'Hvordan', 'Hvad', 'Hvem' og 'Hvor mange'. Undgå ja/nej-spørgsmål. Tag noter og vis du lytter. Afbryd ikke. Lad der komme stilhed — kunden fylder den selv.",
    scripts: [
      "\"Hvordan håndterer I det i dag?\"",
      "\"Hvem er involveret i den beslutning?\"",
      "\"Hvad bruger I allerede på det område?\"",
      "\"Hvor mange i teamet arbejder med det her dagligt?\"",
      "\"Hvornår sidst revurderede I det her setup?\"",
    ],
    watchOut: "Sælgere der hopper direkte til løsningen mister troværdighed øjeblikkeligt. Kunden tænker: 'De forstår ikke min situation.' Brug minimum 10 min på at kortlægge — det er ikke spildtid, det er investering.",
    practiceScenarios: [
      {
        setup: "Du sælger et HR-system. Kunden er HR-chef i en virksomhed med 120 ansatte. Mødet starter.",
        customerLine: "\"Jamen fortæl mig lidt om jeres system — hvad kan det?\"",
        task: "Kunden vil gerne høre din pitch. Men du bør kortlægge situationen FØRST. Hvad siger du?",
        modelAnswer: "\"Jeg vil rigtig gerne vise jer det hele — og for at give jer det mest relevante billede, må jeg godt stille et par spørgsmål først? Hvordan håndterer I onboarding og medarbejderdata i dag?\"",
        tip: "Vend den — brug kundens nysgerrighed til at købe dig tid til at kortlægge. Du leverer mere relevant pitch bagefter.",
      },
      {
        setup: "Du sælger softwareløsning til en mellemstor regnskabsvirksomhed. Du er til introduktionsmøde.",
        customerLine: "\"Vi har brugt vores nuværende system i 7 år. Det virker fint.\"",
        task: "Kunden signalerer status quo. Kortlæg situationen uden at angribe deres valg.",
        modelAnswer: "\"7 år er lang tid — I kender det godt. Hvad bruger I det primært til dag til dag? Og hvem sidder typisk i det systemet?\"",
        tip: "Anerkend det positive, stil derefter et fakta-spørgsmål der åbner for nuancer. Du angriber ikke — du undersøger.",
      },
      {
        setup: "Du sælger forsikring til en selvstændig tømrer. Han har ringet ind af interesse.",
        customerLine: "\"Jeg vil bare høre om prisen — hvad koster det?\"",
        task: "Kunden vil direkte til pris. Du har brug for at forstå situationen inden du kan give en relevant pris. Hvad siger du?",
        modelAnswer: "\"Det kan jeg give dig et tal på — og for at det giver mening, må jeg godt spørge: hvad er du dækket af i dag? Har du erhvervsforsikring, eller kører du uden?\"",
        tip: "Svar aldrig pris uden kontekst. Prisen giver ingen mening for kunden, medmindre du har skabt en ramme for hvad de sammenligner med.",
      },
    ],
  },
  {
    number: 2,
    emoji: "🪞",
    title: "Vis du forstår — bekræft det højt",
    tagline: "Opsummér og tjek forståelsen",
    color: "#8b5cf6",
    colorLight: "#f5f3ff",
    what: "Opsummér det du har hørt med kundens egne ord og spørg om du har forstået rigtigt. Det er den stærkeste måde at vise forståelse på — og det afslører øjeblikkeligt, hvis du har misforstået noget.",
    how: "Brug sætninger som 'Så det jeg hører er...' og slut ALTID med 'Er det rigtigt forstået?' — og vent på bekræftelsen. Brug kundens egne ord, ikke dit eget sprog. Det er et spejl, ikke en parafrase.",
    scripts: [
      "\"Så det jeg hører er: jeres største problem er X, det koster jer Y per kvartal, og det påvirker Z i organisationen. Er det rigtigt forstået?\"",
      "\"Lad mig se om jeg har forstået det rigtigt...\" [opsummer] \"...passer det?\"",
      "\"Hvis jeg skal prøve at sætte ord på det, du beskriver... [gentag med kundens ord]. Ramte jeg noget?\"",
      "\"Det lyder som om [kerneproblem]. Kan du bekræfte det?\"",
    ],
    watchOut: "Mange sælgere opsummerer IKKE — de er allerede i gang med at formulere svar. Det er den dyreste fejl i salg. Kunden opdager det, og tilliden falder. Stop. Opsummer. Vent. Bekræft.",
    practiceScenarios: [
      {
        setup: "Kunden har talt i 4 minutter om sine udfordringer med leverandørstyring. Mange detaljer. Du vil gerne vise at du har hørt det.",
        customerLine: "\"...og så er der jo også det med dokumentationen — det er bare en stor rodet bunke. Men det er nok svært at gøre noget ved.\"",
        task: "Opsummér det kunden har sagt og tjek din forståelse. Vis at du har lyttet — ikke at du er klar med svar.",
        modelAnswer: "\"Lad mig se om jeg har forstået det rigtigt: jeres største smertepunkt er, at leverandørstyringen er fragmenteret — det koster jer tid på tværs af teamet, og dokumentationen er svær at holde styr på. Og det sætter bremserne på, hver gang der er en ny leverandør. Er det rigtigt forstået?\"",
        tip: "Brug kundens egne ord ('rodet bunke', 'fragmenteret'). Afslut med et lukket bekræftelsesspørgsmål — det inviterer kunden til enten at bekræfte eller korrigere dig, og begge dele er guld.",
      },
      {
        setup: "Du har haft et godt møde med en dagligleder i en butikskæde. Han har fortalt om udfordringer med vagtplanlægning og medarbejderomsætning.",
        customerLine: "\"Ja, det er ikke simpelt. Der er mange ting der spiller ind.\"",
        task: "Han er lidt uklar. Opsummér det du har hørt og giv ham chance for at korrigere eller uddybe.",
        modelAnswer: "\"Det forstår jeg godt. Hvis jeg skal prøve at samle det: det handler primært om to ting — vagtplanlægningen tager for lang tid, og fordi folk stopper, starter I næsten forfra hver 3. måned. Og det hænger sammen, ikke? Rammer jeg rigtigt?\"",
        tip: "Forbind de to ting og lad kunden bekræfte sammenhængen. Det viser analytisk forståelse — du ser mønstre, ikke bare facts.",
      },
      {
        setup: "Kunden har fortalt om en konkurrent de brugte, som skuffede dem. De er skeptiske.",
        customerLine: "\"Vi prøvede det en gang og det fungerede ikke. Så vi er lidt forsigtige nu.\"",
        task: "Vis at du har hørt skepticismen — og forstår den. Brug opsummering til at validere, ikke til at sælge.",
        modelAnswer: "\"Jeg hørte det. Og jeg tror jeg forstår: I investerede tid og penge i noget der ikke leverede, og nu er der naturligt en 'vis mig det, tro det ikke'-stemning. Er det rimeligt sagt?\"",
        tip: "Når kunden er skeptisk, er det fristende at argumentere. Gør det modsatte: opsummér skepticismen med respekt. Det aflader modstand hurtigere end noget andet.",
      },
    ],
  },
  {
    number: 3,
    emoji: "❤️",
    title: "Find den personlige motivation",
    tagline: "Spørg hvad det betyder for kunden personligt",
    color: "#ef4444",
    colorLight: "#fef2f2",
    what: "Virksomheder køber ikke — mennesker køber. Find ud af hvad det her betyder for kunden personligt: karriere, stress, anerkendelse, tryghed. Den information forandrer hele din tilgang.",
    how: "Stil spørgsmål der bevæger sig fra det forretningsmæssige til det personlige. Brug 'hvad betyder det for dig' og 'hvad sker der for dig/dit team'. Vær nysgerrig, ikke manipulerende — folk mærker forskel.",
    scripts: [
      "\"Hvad betyder det for dig personligt, hvis I lykkes med det her?\"",
      "\"Hvad sker der for dit team, hvis det her ikke bliver løst inden Q3?\"",
      "\"Hvis du løste det her på et år — hvad ville det ændre for dig?\"",
      "\"Hvem holder øje med om det her lykkes — internt?\"",
      "\"Hvad er din største bekymring i det her projekt?\"",
    ],
    watchOut: "Mange sælgere finder kun den forretningsmæssige motivation. Den personlige motivation er dog det der reelt driver beslutningen. En direktør der kan se karrierefremgang i en investering er langt mere motiveret end en direktør der kun ser ROI.",
    practiceScenarios: [
      {
        setup: "Du sælger en digital læringsplatform til en uddannelseschef. Hun har fortalt at de kæmper med at onboarde nye medarbejdere.",
        customerLine: "\"Ja, onboarding er et problem. Det tager for lang tid og vi bruger for mange resurser på det.\"",
        task: "Du har den forretningsmæssige smerte. Nu vil du finde den personlige motivation. Hvad spørger du?",
        modelAnswer: "\"Jeg forstår det godt. Og hvad betyder det for dig personligt — når onboarding kræver den her tid og energi fra dig og dit team, hvad påvirker det så i din hverdag?\"",
        tip: "Bevæg dig fra 'vi' til 'dig'. Fra det organisatoriske til det personlige. Folk beslutter med hjertet og retfærdiggør med logik.",
      },
      {
        setup: "Du sælger regnskabssoftware. Kunden er CFO i en vækstvirksomhed. De skalerer hurtigt og har problemer med overblik.",
        customerLine: "\"Vi har simpelthen ikke overblik over vores cashflow i realtid. Det er et problem.\"",
        task: "Find den personlige konsekvens af det manglende overblik — ikke bare den forretningsmæssige.",
        modelAnswer: "\"Det lyder stressende. Hvad sker der for dig som CFO, når du ikke har det overblik — er der situationer hvor du sidder med beslutninger du ikke rigtig kan tage, fordi tallene ikke er der?\"",
        tip: "Gå til det personlige ved at spørge om konkrete situationer. 'Hvad sker der for dig' er mere åbent og indbydende end 'hvad er konsekvensen'.",
      },
      {
        setup: "Du sælger til en marketingdirektør. Han har fortalt at ledelsen presser på for mere ROI-dokumentation.",
        customerLine: "\"Ja, vi skal bevise vores værd hele tiden nu. Det er en ny ting.\"",
        task: "Forstå hvad presset fra ledelsen betyder for ham personligt og professionelt.",
        modelAnswer: "\"Det er et skift mange er i. Hvad gør det ved dig og dit team, det her pres for at dokumentere? Er det noget du bekymrer dig om — eller er det bare støj?\"",
        tip: "Giv kunden mulighed for at åbne op — 'er det noget du bekymrer dig om, eller bare støj?' er en non-judgmental åbning der inviterer til ærlighed.",
      },
    ],
  },
  {
    number: 4,
    emoji: "💡",
    title: "Hjælp dem tænke, ikke bare vælge",
    tagline: "Stil det spørgsmål de ikke har stillet sig selv",
    color: "#0ea5e9",
    colorLight: "#f0f9ff",
    what: "Den bedste måde at hjælpe en kunde beslutte er at bringe en vinkel, de ikke selv har tænkt over. Det positionerer dig som rådgiver, ikke sælger — og skaber reelt, differentieret værdibidrag.",
    how: "Brug din erfaring fra andre kunder til at løfte mønstre og blinde vinkler. Intro med 'De fleste i jeres situation...' eller 'Noget vi ser igen og igen er...' Præsentér indsigten og LYT til reaktionen — tving den ikke ned over dem.",
    scripts: [
      "\"De fleste i jeres situation fokuserer på [X] — men vores erfaring viser, at den skjulte omkostning faktisk er [Y]. Har I kigget på det?\"",
      "\"Det er interessant — for det meste vi ser fra virksomheder som jeres, er det faktisk [indsigt] der er den reelle flaskehals. Genkender I det?\"",
      "\"Jeg vil godt dele en vinkel med jer, som I måske ikke har overvejet...\" [indsigt] \"...hvad tænker I om det?\"",
      "\"De virksomheder vi arbejder med der ligner jer mest — de troede det handlede om [X], men da vi gravede ned, var det faktisk [Y]. Ligner det noget I genkender?\"",
    ],
    watchOut: "Indsigten skal være reel — ikke bare en hook til at sælge. Kunder er meget dygtige til at mærke, om du bringer ægte viden eller bare siger noget smart for at virke klog. Brug kun indsigter du kan understøtte med eksempler.",
    practiceScenarios: [
      {
        setup: "Du sælger logistikoptimering. Kunden fokuserer udelukkende på at sænke fragttakster.",
        customerLine: "\"Vi er primært ude efter at reducere vores fragttakster — det er det der koster os mest.\"",
        task: "Du ved fra erfaring at lagerbinding er en større skjult omkostning end fragt. Bring den indsigt på en måde der positionerer dig som rådgiver.",
        modelAnswer: "\"Det er helt forståeligt — fragt er det synlige tal. Det vi dog typisk ser hos virksomheder som jeres, er at lagerbindingen faktisk udgør det dobbelte af fragten, den er bare ikke synlig på samme måde. Har I nogensinde lavet den beregning?\"",
        tip: "Sæt spørgsmålet i slutningen — 'Har I nogensinde...' inviterer kunden til at reflektere frem for at forsvare sig. Du giver indsigt, ikke kritik.",
      },
      {
        setup: "Du sælger HR-platform. Kunden vil primært have et system til at håndtere dokumentation og compliance.",
        customerLine: "\"Vi har brug for noget der kan holde styr på vores dokumentation — det er et lovkrav.\"",
        task: "Du ved at compliance-fokus ofte dækker over en langt dyrere problemstilling: medarbejderomsætning der skyldes dårlig onboarding. Bring det frem.",
        modelAnswer: "\"Compliance er smart at have styr på. Det vi ser igen og igen — og det er måske ikke hvad I forventer at høre — er at virksomheder med compliance-udfordringer ofte har en skjult medarbejderomsætning på 20-30% de første 6 måneder. Genkender I det billede?\"",
        tip: "'Det er måske ikke hvad I forventer at høre' er en god intro-linje — den signalerer at du bringer ægte indsigt, ikke bare salgstale.",
      },
      {
        setup: "Du sælger CRM til en salgsdirektør. Han vil have et system der kan tracke pipeline og forecast.",
        customerLine: "\"Vi har simpelthen brug for bedre forecasting — vi kan ikke forudsige vores pipeline.\"",
        task: "Du ved at dårlig forecasting næsten altid skyldes manglende disciplin i datainput, ikke systemet. Bring indsigten uden at fornærme.",
        modelAnswer: "\"Forecasting er vigtig. En ting vi konsekvent ser — og det er ikke en kritik, det er et mønster — er at forecasting-problemer sjældent løses af et nyt system alene. Det handler mest om datakvaliteten i systemet. Hvad er jeres oplevelse: er sælgerne gode til at opdatere CRM-data løbende?\"",
        tip: "'Det er ikke en kritik, det er et mønster' tager brodd af indsigten. Du positionerer dig som erfaren og ærlig, ikke som dommer.",
      },
    ],
  },
  {
    number: 5,
    emoji: "🛡️",
    title: "Fjern risikoen for dem",
    tagline: "Adressér den uudtalte frygt",
    color: "#10b981",
    colorLight: "#f0fdf4",
    what: "Bag næsten enhver tøven gemmer der sig en frygt for at træffe den forkerte beslutning. Navngiv den direkte — det er mere effektivt end at argumentere for din løsning. Kunden føler sig forstået og bevogtningen sænkes.",
    how: "Lyt efter tøven, pauser og vage svar — de er signaler om uudtalt frygt. Navngiv frygten præcis og direkte, og tilbyd derefter en konkret plan for 'hvad sker der, hvis det ikke virker'. Fjern usikkerhed med konkrete garantier eller trin.",
    scripts: [
      "\"Du tænker sikkert: hvad nu hvis vi investerer i det her og det ikke leverer? Det er en helt fornuftig bekymring. Lad mig fortælle dig præcis, hvad der sker, hvis det ikke virker for jer...\"",
      "\"Jeg kan mærke der er en tøven — er det risikoen for at det ikke virker? Eller er det noget andet?\"",
      "\"Den bekymring hører vi tit — og den er fornuftig. Lad mig fortælle hvad vi gør, hvis I ikke er tilfredse efter [periode].\"",
      "\"Hvad skal der til, for at du kan sige til din chef: vi prøver det her?\"",
      "\"Hvad er dit worst case scenarie, hvis I starter?\"",
    ],
    watchOut: "De fleste sælgere prøver at overdøve frygten med fordele og features. Det virker modsat — kunden går mere i defensiv. Navngiv frygten i stedet. Det viser mod og forståelse, og det aflader modstand hurtigere end nogen salgspitch.",
    practiceScenarios: [
      {
        setup: "Du har haft et godt møde. Kunden virker interesseret men tøvende. Beslutningen involverer 200.000 kr.",
        customerLine: "\"Det lyder godt... vi skal bare lige tænke over det. Jeg vender tilbage.\"",
        task: "Det klassiske 'vi tænker over det'. Find og navngiv den uudtalte frygt direkte.",
        modelAnswer: "\"Jeg hører det. Og jeg tror jeg ved hvad du tænker — hvad sker der, hvis vi bruger de 200k og det ikke leverer som lovet? Er det den bekymring? For det er en helt fornuftig tanke.\"",
        tip: "'Jeg tror jeg ved hvad du tænker' er en stærk åbner — den viser empati og mod. Kunden enten bekræfter, eller fortæller dig hvad den reelle barriere er. Begge dele er bedre end 'send mig et tilbud'.",
      },
      {
        setup: "Du sælger til en IT-chef der skal implementere et nyt system. Implementering er kompleks og kræver engagement fra hans team.",
        customerLine: "\"Vi har simpelthen ikke ressourcer til et stort implementeringsprojekt lige nu.\"",
        task: "Ressource-indvendingen dækker sandsynligvis over frygt for kaos og fejl. Navngiv det og fjern risikoen.",
        modelAnswer: "\"Det forstår jeg godt. Og bag den bekymring hører jeg: hvad nu hvis vi sætter det i gang og det ender som endnu et halvfærdigt IT-projekt der suger ressourcer? Er det reelt det, der holder jer tilbage?\"",
        tip: "Gå bag indsigelsen til den reelle frygt. 'Endnu et halvfærdigt IT-projekt' er specifikt og relaterbart — det viser du kender virkeligheden i store organisationer.",
      },
      {
        setup: "Du sælger til en lille virksomhedsejer. Han er interesseret men usikker på om han kan retfærdiggøre prisen overfor sig selv.",
        customerLine: "\"Det er mange penge for en virksomhed på vores størrelse...\"",
        task: "Frygten handler om at tage fejl — at investere og ikke se afkast. Navngiv det og giv ham en konkret udvej.",
        modelAnswer: "\"Det forstår jeg. Du tænker: hvad nu hvis det ikke betaler sig? Hvad siger jeg til mig selv bagefter? Det er en helt ærlig bekymring. Så lad mig fortælle dig præcis hvad der sker, hvis I ikke er tilfredse efter 3 måneder — [konkret garanti/tilbagebetalingsbetingelse].\"",
        tip: "'Hvad siger jeg til mig selv bagefter' rammer den personlige frygt — ikke den forretningsmæssige. Lille virksomhedsejere bærer fejlbeslutninger personligt. Vis at du forstår det.",
      },
    ],
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function KundeforståelseTab() {
  const [activeTechnique, setActiveTechnique] = useState<number>(0);
  const [practiceMode, setPracticeMode] = useState(false);
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [userAnswer, setUserAnswer] = useState("");

  const tech = TECHNIQUES[activeTechnique];
  const scenario = tech.practiceScenarios[scenarioIndex];

  function startPractice() {
    setPracticeMode(true);
    setScenarioIndex(0);
    setRevealed(false);
    setUserAnswer("");
  }

  function nextScenario() {
    const next = scenarioIndex + 1;
    if (next < tech.practiceScenarios.length) {
      setScenarioIndex(next);
      setRevealed(false);
      setUserAnswer("");
    } else {
      setPracticeMode(false);
      setScenarioIndex(0);
      setRevealed(false);
      setUserAnswer("");
    }
  }

  function switchTechnique(idx: number) {
    setActiveTechnique(idx);
    setPracticeMode(false);
    setScenarioIndex(0);
    setRevealed(false);
    setUserAnswer("");
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <span style={{ fontSize: 28 }}>🧠</span>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "#1c1917", margin: 0, letterSpacing: "-0.5px" }}>
            Top 5: Forstå kunden
          </h1>
        </div>
        <p style={{ color: "#78716c", fontSize: 15, margin: 0, maxWidth: 600 }}>
          De 5 stærkeste måder at forstå kunden — og hjælpe dem beslutte. Lær teknikken, se scripts, øv dig på scenarier.
        </p>
      </div>

      {/* ── Technique selector ──────────────────────────────────────────────── */}
      <div style={{ display: "flex", gap: 8, marginBottom: 28, flexWrap: "wrap" }}>
        {TECHNIQUES.map((t, i) => (
          <button
            key={t.number}
            onClick={() => switchTechnique(i)}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "8px 14px", borderRadius: 10, cursor: "pointer",
              border: `2px solid ${activeTechnique === i ? t.color : "#e8e5e1"}`,
              background: activeTechnique === i ? t.colorLight : "#ffffff",
              color: activeTechnique === i ? "#1c1917" : "#78716c",
              fontWeight: activeTechnique === i ? 700 : 500,
              fontSize: 13, transition: "all 0.15s",
            }}
          >
            <span style={{
              width: 22, height: 22, borderRadius: "50%",
              background: activeTechnique === i ? t.color : "#f5f4f2",
              color: activeTechnique === i ? "#ffffff" : "#78716c",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, fontWeight: 800, flexShrink: 0,
            }}>
              {t.number}
            </span>
            <span className="hide-mobile">{t.emoji} {t.title}</span>
            <span className="hide-desktop">{t.emoji}</span>
          </button>
        ))}
      </div>

      {/* ── Main panel ──────────────────────────────────────────────────────── */}
      {!practiceMode ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Title card */}
          <div style={{
            background: tech.colorLight,
            border: `2px solid ${tech.color}40`,
            borderLeft: `5px solid ${tech.color}`,
            borderRadius: 14, padding: "20px 24px",
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
              <span style={{
                width: 44, height: 44, borderRadius: 12,
                background: tech.color, color: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 20, flexShrink: 0,
              }}>{tech.emoji}</span>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                  <span style={{
                    fontSize: 11, fontWeight: 800, letterSpacing: "0.5px",
                    color: tech.color, textTransform: "uppercase",
                  }}>Teknik {tech.number} af 5</span>
                </div>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: "#1c1917", margin: "0 0 4px" }}>
                  {tech.title}
                </h2>
                <p style={{ color: "#57534e", fontSize: 14, margin: 0, fontStyle: "italic" }}>
                  {tech.tagline}
                </p>
              </div>
            </div>
          </div>

          {/* What + How */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={{
              background: "#ffffff", border: "2px solid #e8e5e1",
              borderRadius: 12, padding: "18px 20px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <span style={{
                  width: 24, height: 24, borderRadius: 6,
                  background: "#f5f4f2", fontSize: 13,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>📌</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#1c1917" }}>Hvad er det?</span>
              </div>
              <p style={{ color: "#57534e", fontSize: 14, lineHeight: 1.7, margin: 0 }}>{tech.what}</p>
            </div>
            <div style={{
              background: "#ffffff", border: "2px solid #e8e5e1",
              borderRadius: 12, padding: "18px 20px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <span style={{
                  width: 24, height: 24, borderRadius: 6,
                  background: "#f5f4f2", fontSize: 13,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>⚙️</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#1c1917" }}>Sådan gør du det</span>
              </div>
              <p style={{ color: "#57534e", fontSize: 14, lineHeight: 1.7, margin: 0 }}>{tech.how}</p>
            </div>
          </div>

          {/* Scripts */}
          <div style={{
            background: "#ffffff", border: "2px solid #e8e5e1",
            borderRadius: 12, padding: "18px 20px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <span style={{
                width: 24, height: 24, borderRadius: 6,
                background: tech.colorLight, fontSize: 13,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>💬</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#1c1917" }}>Konkrete scripts du kan bruge</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {tech.scripts.map((script, i) => (
                <div key={i} style={{
                  padding: "12px 16px",
                  background: tech.colorLight,
                  border: `1.5px solid ${tech.color}30`,
                  borderLeft: `4px solid ${tech.color}`,
                  borderRadius: 8,
                }}>
                  <p style={{
                    color: "#1c1917", fontSize: 14, lineHeight: 1.6,
                    margin: 0, fontStyle: "italic",
                  }}>{script}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Watch out */}
          <div style={{
            background: "#fffbeb", border: "1.5px solid rgba(245,158,11,0.35)",
            borderLeft: "4px solid #f59e0b",
            borderRadius: 12, padding: "14px 18px",
            display: "flex", gap: 12, alignItems: "flex-start",
          }}>
            <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>⚠️</span>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#92400e", margin: "0 0 4px" }}>
                Typisk fejl at undgå
              </p>
              <p style={{ color: "#78350f", fontSize: 14, lineHeight: 1.6, margin: 0 }}>
                {tech.watchOut}
              </p>
            </div>
          </div>

          {/* Practice CTA */}
          <div style={{
            background: "#ffffff",
            border: `2px solid ${tech.color}50`,
            borderRadius: 14, padding: "20px 24px",
            display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
          }}>
            <div>
              <p style={{ fontSize: 15, fontWeight: 700, color: "#1c1917", margin: "0 0 4px" }}>
                Klar til at øve dig?
              </p>
              <p style={{ color: "#78716c", fontSize: 13, margin: 0 }}>
                {tech.practiceScenarios.length} realistiske scenarier — skriv dit svar og sammenlign med modelsvaret
              </p>
            </div>
            <button
              onClick={startPractice}
              style={{
                padding: "10px 20px", borderRadius: 10,
                background: tech.color, color: "#ffffff",
                border: "none", cursor: "pointer",
                fontSize: 14, fontWeight: 700,
                whiteSpace: "nowrap", flexShrink: 0,
              }}
            >
              Start øvelse →
            </button>
          </div>

          {/* Navigation */}
          <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 4 }}>
            <button
              onClick={() => switchTechnique(Math.max(0, activeTechnique - 1))}
              disabled={activeTechnique === 0}
              style={{
                padding: "8px 16px", borderRadius: 9, cursor: activeTechnique === 0 ? "default" : "pointer",
                background: activeTechnique === 0 ? "#f5f4f2" : "#ffffff",
                border: "1.5px solid #e8e5e1",
                color: activeTechnique === 0 ? "#c4bfb8" : "#57534e",
                fontSize: 13, fontWeight: 600,
              }}
            >← Forrige</button>
            <span style={{ color: "#a8a29e", fontSize: 13, alignSelf: "center" }}>
              {activeTechnique + 1} / {TECHNIQUES.length}
            </span>
            <button
              onClick={() => switchTechnique(Math.min(TECHNIQUES.length - 1, activeTechnique + 1))}
              disabled={activeTechnique === TECHNIQUES.length - 1}
              style={{
                padding: "8px 16px", borderRadius: 9,
                cursor: activeTechnique === TECHNIQUES.length - 1 ? "default" : "pointer",
                background: activeTechnique === TECHNIQUES.length - 1 ? "#f5f4f2" : "#ffffff",
                border: "1.5px solid #e8e5e1",
                color: activeTechnique === TECHNIQUES.length - 1 ? "#c4bfb8" : "#57534e",
                fontSize: 13, fontWeight: 600,
              }}
            >Næste →</button>
          </div>
        </div>

      ) : (

        /* ── Practice mode ─────────────────────────────────────────────────── */
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Practice header */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            background: tech.colorLight, border: `2px solid ${tech.color}40`,
            borderRadius: 12, padding: "14px 18px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 18 }}>{tech.emoji}</span>
              <div>
                <p style={{ fontSize: 13, fontWeight: 800, color: tech.color, margin: 0, textTransform: "uppercase", letterSpacing: "0.4px" }}>
                  Øvelse — {tech.title}
                </p>
                <p style={{ fontSize: 12, color: "#78716c", margin: 0 }}>
                  Scenarie {scenarioIndex + 1} af {tech.practiceScenarios.length}
                </p>
              </div>
            </div>
            <button
              onClick={() => setPracticeMode(false)}
              style={{
                padding: "6px 12px", borderRadius: 8, cursor: "pointer",
                background: "#ffffff", border: "1.5px solid #e8e5e1",
                color: "#78716c", fontSize: 12, fontWeight: 600,
              }}
            >✕ Afslut</button>
          </div>

          {/* Progress dots */}
          <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
            {tech.practiceScenarios.map((_, i) => (
              <div key={i} style={{
                width: i === scenarioIndex ? 24 : 8, height: 8, borderRadius: 4,
                background: i < scenarioIndex ? tech.color : i === scenarioIndex ? tech.color : "#e8e5e1",
                opacity: i < scenarioIndex ? 0.5 : 1,
                transition: "all 0.2s",
              }} />
            ))}
          </div>

          {/* Setup */}
          <div style={{
            background: "#ffffff", border: "2px solid #e8e5e1",
            borderRadius: 12, padding: "18px 20px",
          }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#a8a29e", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 10px" }}>
              Situation
            </p>
            <p style={{ color: "#57534e", fontSize: 14, lineHeight: 1.7, margin: 0 }}>
              {scenario.setup}
            </p>
          </div>

          {/* Customer line */}
          <div style={{
            background: "#f5f4f2", border: "2px solid #e8e5e1",
            borderRadius: 12, padding: "16px 20px",
            display: "flex", gap: 12, alignItems: "flex-start",
          }}>
            <span style={{
              width: 32, height: 32, borderRadius: "50%",
              background: "#e8e5e1", color: "#78716c",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14, flexShrink: 0,
            }}>👤</span>
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, color: "#a8a29e", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 6px" }}>
                Kunden siger
              </p>
              <p style={{ color: "#1c1917", fontSize: 15, lineHeight: 1.6, margin: 0, fontStyle: "italic", fontWeight: 500 }}>
                {scenario.customerLine}
              </p>
            </div>
          </div>

          {/* Task */}
          <div style={{
            background: tech.colorLight, border: `1.5px solid ${tech.color}40`,
            borderLeft: `4px solid ${tech.color}`,
            borderRadius: 10, padding: "14px 18px",
          }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: tech.color, textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 6px" }}>
              Din opgave
            </p>
            <p style={{ color: "#1c1917", fontSize: 14, lineHeight: 1.6, margin: 0, fontWeight: 500 }}>
              {scenario.task}
            </p>
          </div>

          {/* Answer input */}
          {!revealed && (
            <div style={{
              background: "#ffffff", border: "2px solid #e8e5e1",
              borderRadius: 12, padding: "18px 20px",
            }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#1c1917", margin: "0 0 10px" }}>
                Hvad siger du? Skriv dit svar:
              </p>
              <textarea
                value={userAnswer}
                onChange={e => setUserAnswer(e.target.value)}
                placeholder="Skriv dit svar her..."
                rows={4}
                style={{
                  width: "100%", padding: "12px 14px", borderRadius: 8,
                  border: "1.5px solid #e8e5e1", background: "#fafaf9",
                  color: "#1c1917", fontSize: 14, lineHeight: 1.6,
                  resize: "vertical", fontFamily: "inherit",
                  boxSizing: "border-box", outline: "none",
                }}
              />
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
                <button
                  onClick={() => setRevealed(true)}
                  style={{
                    padding: "10px 20px", borderRadius: 9,
                    background: tech.color, color: "#ffffff",
                    border: "none", cursor: "pointer",
                    fontSize: 14, fontWeight: 700,
                  }}
                >
                  Vis modelsvar →
                </button>
              </div>
            </div>
          )}

          {/* Revealed answer */}
          {revealed && (
            <>
              {/* User's answer */}
              {userAnswer.trim() && (
                <div style={{
                  background: "#ffffff", border: "2px solid #e8e5e1",
                  borderRadius: 12, padding: "16px 20px",
                }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: "#a8a29e", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 8px" }}>
                    Dit svar
                  </p>
                  <p style={{ color: "#57534e", fontSize: 14, lineHeight: 1.7, margin: 0, fontStyle: "italic" }}>
                    {userAnswer}
                  </p>
                </div>
              )}

              {/* Model answer */}
              <div style={{
                background: "#f0fdf4", border: "2px solid #86efac",
                borderLeft: "5px solid #16a34a",
                borderRadius: 12, padding: "18px 20px",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <span style={{
                    width: 24, height: 24, borderRadius: 6,
                    background: "#16a34a", color: "#fff",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 13,
                  }}>✓</span>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "#15803d", margin: 0 }}>
                    Modelsvar
                  </p>
                </div>
                <p style={{ color: "#1c1917", fontSize: 15, lineHeight: 1.7, margin: "0 0 14px", fontStyle: "italic" }}>
                  {scenario.modelAnswer}
                </p>
                <div style={{
                  paddingTop: 12, borderTop: "1px solid #86efac40",
                  display: "flex", gap: 8, alignItems: "flex-start",
                }}>
                  <span style={{ fontSize: 14, flexShrink: 0 }}>💡</span>
                  <p style={{ color: "#166534", fontSize: 13, lineHeight: 1.6, margin: 0 }}>
                    <strong>Tip:</strong> {scenario.tip}
                  </p>
                </div>
              </div>

              {/* Next */}
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  onClick={nextScenario}
                  style={{
                    padding: "11px 24px", borderRadius: 10,
                    background: scenarioIndex < tech.practiceScenarios.length - 1 ? tech.color : "#16a34a",
                    color: "#ffffff", border: "none", cursor: "pointer",
                    fontSize: 14, fontWeight: 700,
                  }}
                >
                  {scenarioIndex < tech.practiceScenarios.length - 1
                    ? "Næste scenarie →"
                    : "✓ Afslut øvelse"}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
