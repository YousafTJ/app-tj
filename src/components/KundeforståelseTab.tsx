"use client";

import { useState, useEffect, useRef } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type ExerciseType = "skriv" | "spot" | "udfyld" | "valg" | "spin" | "roleplay";

type RoleplayTurn = {
  customerLine: string;
  context: string;
  techHint: string;
  goodResponse: string;
  feedback: string;
  redFlag: string;
};

type RoleplayScenario = {
  id: string;
  title: string;
  description: string;
  customer: { name: string; role: string; company: string };
  product: string;
  goal: string;
  difficulty: "Let" | "Medium" | "Svær";
  color: string;
  colorLight: string;
  turns: RoleplayTurn[];
};

type WriteScenario = {
  techId: number;
  setup: string;
  customerLine: string;
  task: string;
  modelAnswer: string;
  tip: string;
};

type SpotFejlExercise = {
  techId: number;
  title: string;
  conversation: { role: "salg" | "kunde"; line: string }[];
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

type UdfyldExercise = {
  techId: number;
  intro: string;
  setup: string;
  parts: { text: string; isGap: boolean; answer?: string }[];
  hint: string;
  explanation: string;
};

type HurtigValgExercise = {
  techId: number;
  situation: string;
  customerLine: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  whyWrong: (string | null)[];
};

type SpinExercise = {
  situation: string;
  customer: string;
  product: string;
  model: { S: string; P: string; I: string; N: string };
  tips: { S: string; P: string; I: string; N: string };
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
};

// ─── Technique definitions ─────────────────────────────────────────────────────

const TECHNIQUES: Technique[] = [
  {
    number: 1, emoji: "🗺️", title: "Forstå situationen", tagline: "Kortlæg nuværende situation præcist",
    color: "#f59e0b", colorLight: "#fffbeb",
    what: "Stil konkrete faktaspørgsmål om kundens nuværende setup, processer og kontekst — INDEN du taler om din løsning. Det viser forberedelse og giver dig det fundament du behøver for at tale relevant.",
    how: "Brug åbne spørgsmål der starter med 'Hvordan', 'Hvad', 'Hvem' og 'Hvor mange'. Undgå ja/nej-spørgsmål. Tag noter og vis du lytter. Lad der komme stilhed — kunden fylder den selv.",
    scripts: [
      "\"Hvordan håndterer I det i dag?\"",
      "\"Hvem er involveret i den beslutning?\"",
      "\"Hvad bruger I allerede på det område?\"",
      "\"Hvornår sidst revurderede I jeres nuværende setup?\"",
      "\"Hvor mange i teamet arbejder med det her dagligt?\"",
    ],
    watchOut: "Sælgere der hopper direkte til løsningen mister troværdighed øjeblikkeligt. Brug minimum 10 min på at kortlægge — det er ikke spildtid, det er investering.",
  },
  {
    number: 2, emoji: "🪞", title: "Vis du forstår — bekræft det højt", tagline: "Opsummér og tjek forståelsen",
    color: "#8b5cf6", colorLight: "#f5f3ff",
    what: "Opsummér det du har hørt med kundens egne ord og spørg om du har forstået rigtigt. Det er den stærkeste måde at vise forståelse på — og det afslører øjeblikkeligt hvis du har misforstået.",
    how: "Brug 'Så det jeg hører er...' og slut ALTID med 'Er det rigtigt forstået?' — og vent på bekræftelsen. Brug kundens egne ord, ikke dit eget fagsprog.",
    scripts: [
      "\"Så det jeg hører er: jeres største problem er X, det koster jer Y, og det påvirker Z. Er det rigtigt forstået?\"",
      "\"Lad mig se om jeg har forstået det rigtigt...\" [opsummer] \"...passer det?\"",
      "\"Hvis jeg skal prøve at sætte ord på det du beskriver... Ramte jeg noget?\"",
      "\"Det lyder som om [kerneproblem]. Kan du bekræfte det?\"",
    ],
    watchOut: "Mange sælgere opsummerer IKKE — de er allerede i gang med at formulere svar. Stop. Opsummer. Vent. Bekræft.",
  },
  {
    number: 3, emoji: "❤️", title: "Find den personlige motivation", tagline: "Spørg hvad det betyder for kunden personligt",
    color: "#ef4444", colorLight: "#fef2f2",
    what: "Virksomheder køber ikke — mennesker køber. Find ud af hvad det her betyder for kunden personligt: karriere, stress, anerkendelse, tryghed. Den information forandrer hele din tilgang.",
    how: "Bevæg dig fra det forretningsmæssige til det personlige. Brug 'hvad betyder det for dig' og 'hvad sker der for dig/dit team'. Vær nysgerrig, ikke manipulerende.",
    scripts: [
      "\"Hvad betyder det for dig personligt, hvis I lykkes med det her?\"",
      "\"Hvad sker der for dit team, hvis det her ikke bliver løst inden Q3?\"",
      "\"Hvis du løste det her på et år — hvad ville det ændre for dig?\"",
      "\"Hvem holder øje med om det her lykkes — internt?\"",
    ],
    watchOut: "Mange sælgere finder kun den forretningsmæssige motivation. Den personlige er det der reelt driver beslutningen.",
  },
  {
    number: 4, emoji: "💡", title: "Hjælp dem tænke, ikke bare vælge", tagline: "Stil det spørgsmål de ikke har stillet sig selv",
    color: "#0ea5e9", colorLight: "#f0f9ff",
    what: "Den bedste måde at hjælpe en kunde beslutte er at bringe en vinkel de ikke selv har tænkt over. Det positionerer dig som rådgiver, ikke sælger.",
    how: "Brug din erfaring fra andre kunder til at løfte mønstre og blinde vinkler. Intro med 'De fleste i jeres situation...' Præsentér indsigten og LYT til reaktionen.",
    scripts: [
      "\"De fleste i jeres situation fokuserer på X — men vores erfaring viser at den skjulte omkostning er Y. Har I kigget på det?\"",
      "\"Det vi typisk ser fra virksomheder som jeres er at Y faktisk er den reelle flaskehals. Genkender I det?\"",
      "\"Jeg vil godt dele en vinkel I måske ikke har overvejet...\" [indsigt] \"...hvad tænker I?\"",
    ],
    watchOut: "Indsigten skal være reel. Kunder mærker øjeblikkeligt om du bringer ægte viden eller bare siger noget smart.",
  },
  {
    number: 5, emoji: "🛡️", title: "Fjern risikoen for dem", tagline: "Adressér den uudtalte frygt",
    color: "#10b981", colorLight: "#f0fdf4",
    what: "Bag næsten enhver tøven gemmer der sig en frygt for at træffe den forkerte beslutning. Navngiv den direkte — det er mere effektivt end at argumentere for din løsning.",
    how: "Lyt efter tøven, pauser og vage svar. Navngiv frygten præcis og direkte, og tilbyd derefter en konkret plan for 'hvad sker der, hvis det ikke virker'.",
    scripts: [
      "\"Du tænker sikkert: hvad nu hvis vi investerer og det ikke leverer? Det er en fornuftig bekymring. Lad mig fortælle hvad der sker hvis det ikke virker...\"",
      "\"Jeg kan mærke der er en tøven — er det risikoen? Eller er det noget andet?\"",
      "\"Hvad skal der til for at du kan sige til din chef: vi prøver det her?\"",
      "\"Hvad er dit worst case scenarie, hvis I starter?\"",
    ],
    watchOut: "De fleste sælgere prøver at overdøve frygten med features. Det virker modsat. Navngiv frygten i stedet.",
  },
];

// ─── Write scenarios ──────────────────────────────────────────────────────────

const WRITE_SCENARIOS: WriteScenario[] = [
  // Teknik 1
  {
    techId: 1,
    setup: "Du sælger HR-system. Kunden er HR-chef med 120 ansatte. Mødet starter.",
    customerLine: "\"Jamen fortæl mig lidt om jeres system — hvad kan det?\"",
    task: "Kunden vil høre din pitch — men du bør kortlægge situationen FØRST. Hvad siger du?",
    modelAnswer: "\"Jeg vil rigtig gerne vise jer det hele — og for at give jer det mest relevante billede, må jeg godt stille et par spørgsmål først? Hvordan håndterer I onboarding og medarbejderdata i dag?\"",
    tip: "Vend den. Brug kundens nysgerrighed til at købe dig tid til at kortlægge. Din pitch bliver langt mere relevant bagefter.",
  },
  {
    techId: 1,
    setup: "Du sælger regnskabssoftware. Kunden bruger samme system i 7 år.",
    customerLine: "\"Vi har brugt vores nuværende system i 7 år. Det virker fint.\"",
    task: "Kunden signalerer status quo. Kortlæg situationen uden at angribe deres valg.",
    modelAnswer: "\"7 år er lang tid — I kender det godt. Hvad bruger I det primært til dag til dag? Og hvem sidder typisk i systemet?\"",
    tip: "Anerkend det positive, stil derefter et faktaspørgsmål der åbner for nuancer. Du angriber ikke — du undersøger.",
  },
  {
    techId: 1,
    setup: "Du sælger forsikring til en selvstændig tømrer. Han ringer ind om interesse.",
    customerLine: "\"Jeg vil bare høre om prisen — hvad koster det?\"",
    task: "Kunden vil direkte til pris. Du har brug for kontekst inden du kan give en relevant pris.",
    modelAnswer: "\"Det kan jeg give dig et tal på — og for at det giver mening, må jeg godt spørge: hvad er du dækket af i dag? Kører du med erhvervsforsikring, eller er du uden?\"",
    tip: "Svar aldrig pris uden kontekst. Prisen giver ingen mening for kunden medmindre du har skabt en sammenligningsramme.",
  },
  // Teknik 2
  {
    techId: 2,
    setup: "Kunden har talt i 4 min om leverandørstyring. Du vil vise at du har hørt det.",
    customerLine: "\"...og dokumentationen er bare en stor rodet bunke. Men det er nok svært at gøre noget ved.\"",
    task: "Opsummér det kunden har sagt og tjek din forståelse. Vis du har lyttet — ikke at du er klar med svar.",
    modelAnswer: "\"Lad mig se om jeg har forstået det rigtigt: jeres største smertepunkt er at leverandørstyringen er fragmenteret — det koster tid på tværs af teamet, og dokumentationen er svær at holde styr på. Er det rigtigt forstået?\"",
    tip: "Brug kundens egne ord ('rodet bunke'). Afslut med et bekræftelsesspørgsmål — kunden bekræfter eller korrigerer, og begge dele er guld.",
  },
  {
    techId: 2,
    setup: "Møde med dagligleder om vagtplanlægning og medarbejderomsætning.",
    customerLine: "\"Ja, det er ikke simpelt. Der er mange ting der spiller ind.\"",
    task: "Han er uklar. Opsummér det du har hørt og giv ham chance for at korrigere.",
    modelAnswer: "\"Hvis jeg skal samle det: det handler om to ting — vagtplanlægningen tager for lang tid, og fordi folk stopper, starter I næsten forfra hver 3. måned. De hænger sammen, ikke? Rammer jeg rigtigt?\"",
    tip: "Forbind de to ting og lad kunden bekræfte sammenhængen. Det viser analytisk forståelse — du ser mønstre, ikke bare fakta.",
  },
  // Teknik 3
  {
    techId: 3,
    setup: "Du sælger læringsplatform til uddannelseschef. Onboarding er et problem.",
    customerLine: "\"Ja, onboarding tager for lang tid og vi bruger for mange ressourcer på det.\"",
    task: "Du har den forretningsmæssige smerte. Nu vil du finde den personlige motivation.",
    modelAnswer: "\"Jeg forstår det godt. Og hvad betyder det for dig personligt — når onboarding kræver den her tid og energi, hvad påvirker det så i din hverdag?\"",
    tip: "Bevæg dig fra 'vi' til 'dig'. Fra det organisatoriske til det personlige. Folk beslutter med hjertet og retfærdiggør med logik.",
  },
  {
    techId: 3,
    setup: "Du sælger til en marketingdirektør. Ledelsen presser på for ROI-dokumentation.",
    customerLine: "\"Vi skal bevise vores værd hele tiden nu. Det er en ny ting.\"",
    task: "Find hvad presset fra ledelsen betyder for ham personligt og professionelt.",
    modelAnswer: "\"Det forstår jeg godt. Hvad gør det ved dig og dit team, det her pres? Er det noget du bekymrer dig om — eller er det mest støj?\"",
    tip: "'Er det noget du bekymrer dig om, eller mest støj?' er en non-judgmental åbning der inviterer til ærlighed.",
  },
  // Teknik 4
  {
    techId: 4,
    setup: "Du sælger logistikoptimering. Kunden fokuserer udelukkende på fragttakster.",
    customerLine: "\"Vi er primært ude efter at reducere vores fragttakster.\"",
    task: "Du ved at lagerbinding er en større skjult omkostning end fragt. Bring indsigten som rådgiver.",
    modelAnswer: "\"Det er det synlige tal. Det vi typisk ser hos virksomheder som jeres er at lagerbindingen udgør det dobbelte af fragten — den er bare ikke synlig på samme måde. Har I nogensinde lavet den beregning?\"",
    tip: "'Har I nogensinde...' inviterer kunden til at reflektere frem for at forsvare sig. Du giver indsigt, ikke kritik.",
  },
  {
    techId: 4,
    setup: "Du sælger CRM. Salgsdirektøren vil have bedre forecasting.",
    customerLine: "\"Vi kan simpelthen ikke forudsige vores pipeline. Vi har brug for bedre forecasting.\"",
    task: "Du ved at dårlig forecasting næsten altid skyldes datadisciplin, ikke systemet. Bring indsigten.",
    modelAnswer: "\"Forecasting er vigtig. Noget vi konsekvent ser — det er ikke en kritik, det er et mønster — er at forecasting-problemer sjældent løses af et nyt system alene. Det handler mest om datakvaliteten i systemet. Hvad er jeres oplevelse: er sælgerne gode til at opdatere CRM-data?\"",
    tip: "'Det er ikke en kritik, det er et mønster' tager brodden af indsigten. Du positionerer dig som erfaren og ærlig.",
  },
  // Teknik 5
  {
    techId: 5,
    setup: "Godt møde. Kunden virker interesseret men tøvende. 200.000 kr investering.",
    customerLine: "\"Det lyder godt... vi skal bare lige tænke over det. Jeg vender tilbage.\"",
    task: "Det klassiske 'vi tænker over det'. Find og navngiv den uudtalte frygt direkte.",
    modelAnswer: "\"Jeg hører det. Og jeg tror jeg ved hvad du tænker — hvad sker der, hvis vi bruger de 200k og det ikke leverer som lovet? Er det den bekymring? For det er en helt fornuftig tanke.\"",
    tip: "'Jeg tror jeg ved hvad du tænker' viser empati og mod. Kunden bekræfter eller fortæller hvad den reelle barriere er. Begge er bedre end 'send mig et tilbud'.",
  },
  {
    techId: 5,
    setup: "Du sælger til IT-chef. Implementering er kompleks og kræver engagement fra hans team.",
    customerLine: "\"Vi har simpelthen ikke ressourcer til et stort implementeringsprojekt lige nu.\"",
    task: "Ressource-indvendingen dækker sandsynligvis over frygt for kaos og fejl. Navngiv det.",
    modelAnswer: "\"Det forstår jeg godt. Og bag den bekymring hører jeg: hvad nu hvis vi sætter det i gang og det ender som endnu et halvfærdigt IT-projekt der suger ressourcer? Er det reelt det der holder jer tilbage?\"",
    tip: "'Endnu et halvfærdigt IT-projekt' er specifikt og relaterbart — det viser du kender virkeligheden i store organisationer.",
  },
];

// ─── Spot fejlen ──────────────────────────────────────────────────────────────

const SPOT_EXERCISES: SpotFejlExercise[] = [
  {
    techId: 1,
    title: "CRM-sælgeren der springer over kortlægning",
    conversation: [
      { role: "kunde", line: "Hej, vi er interesserede i at høre mere om jeres CRM-system." },
      { role: "salg", line: "Perfekt! Vores CRM er markedets bedste — det har AI-integration, automatisk pipeline-tracking og 200+ integrationer. Jeg kan vise jer en demo nu?" },
      { role: "kunde", line: "Øhm... ja, det lyder fint nok." },
    ],
    question: "Hvad er den største fejl sælgeren laver?",
    options: [
      "Han tilbyder demo for hurtigt",
      "Han pitcher produktet uden at have stillet et eneste spørgsmål om kundens situation",
      "Han roser sit eget produkt for meget",
      "Han bruger for teknisk sprog",
    ],
    correctIndex: 1,
    explanation: "Sælgeren har nul viden om kundens nuværende setup, størrelse, behov eller problemer — men pitcher alligevel fuldt ud. Det er en klassisk fejl der signalerer at du er ude for at sælge, ikke hjælpe. Start altid med 3-5 situationsspørgsmål inden du viser noget som helst.",
  },
  {
    techId: 2,
    title: "Sælgeren der 'opsummerer' med sine egne ord",
    conversation: [
      { role: "kunde", line: "Det er lidt svært at forklare... vi har ligesom et flow-problem i vores produktion. Det skaber forsinkelser og folk bliver frustrerede." },
      { role: "salg", line: "Jeg forstår det — I har ineffektiv produktionsplanlægning og dårlig ressourceallokering. Vi har løsningen." },
      { role: "kunde", line: "Ja... ja, noget i den retning." },
    ],
    question: "Hvad gør sælgeren forkert i sin opsummering?",
    options: [
      "Han opsummerer for hurtigt",
      "Han bruger sit eget fagsprog i stedet for kundens ord og springer til løsning uden at tjekke forståelsen",
      "Han stiller ikke nok spørgsmål",
      "Han er for enig med kunden",
    ],
    correctIndex: 1,
    explanation: "Kunden brugte 'flow-problem' og 'folk bliver frustrerede' — sælgeren erstatter det med 'ineffektiv produktionsplanlægning og dårlig ressourceallokering'. Det er sælgerens sprog, ikke kundens. Og han springer direkte til løsning uden at spørge 'Er det rigtigt forstået?' Resultatet: kunden siger 'ja' men føler sig ikke rigtig forstået.",
  },
  {
    techId: 3,
    title: "Sælgeren der stopper ved det forretningsmæssige",
    conversation: [
      { role: "kunde", line: "Vi mister mange kunder i onboarding-fasen. Det koster os virkelig meget." },
      { role: "salg", line: "Okay, så det er churn i onboarding der er problemet. Hvor mange mister I per kvartal, og hvad er jeres CAC?" },
      { role: "kunde", line: "Ja, det varierer. Men det er et problem." },
    ],
    question: "Hvad mangler sælgeren at spørge om?",
    options: [
      "Han burde spørge til konkurrenterne",
      "Han burde spørge hvad det betyder for kunden personligt — ikke kun de forretningsmæssige tal",
      "Han burde have spurgt til prisen tidligere",
      "Han stiller for mange spørgsmål",
    ],
    correctIndex: 1,
    explanation: "Sælgeren går direkte til de forretningsmæssige metrics (CAC, churn-rate) men springer over det vigtigste: hvad betyder det for personen foran dig? En simpel 'Hvad sker der for dig, hvis I ikke løser det her?' ville afsløre den personlige motivation — stress, karrierepres, anerkendelse fra ledelsen — som reelt driver beslutningen.",
  },
  {
    techId: 4,
    title: "Den svage 'indsigt' der egentlig bare er salgstale",
    conversation: [
      { role: "kunde", line: "Vi vil gerne have styr på vores data." },
      { role: "salg", line: "De fleste virksomheder vi taler med tror de har styr på det — men vores system viser de faktisk ikke har det. Det er derfor vores løsning er så vigtig." },
      { role: "kunde", line: "Okay..." },
    ],
    question: "Hvad er problemet med sælgerens 'indsigt'?",
    options: [
      "Han er for direkte",
      "Indsigten er generisk og ender i en salgspitch — den bringer ikke reel, specifik viden om kundens situation",
      "Han taler for hurtigt",
      "Han burde have spurgt om prisen",
    ],
    correctIndex: 1,
    explanation: "En reel indsigt er specifik og er baseret på virkelig erfaring: 'Virksomheder på jeres størrelse tror som regel at X er problemet — men vi ser igen og igen at Y er den skjulte flaskehals, fordi [specifik årsag].' Det der bliver sagt her er vagt og ender som reklame. Kunden mærker det — og tilliden falder.",
  },
  {
    techId: 5,
    title: "Sælgeren der overdøver frygten med features",
    conversation: [
      { role: "kunde", line: "Det er mange penge... vi er ikke sikre på om det er det rigtige tidspunkt." },
      { role: "salg", line: "Jeg forstår det godt — men se bare hvad I får: AI-integration, 24/7 support, 200 brugere inkluderet, og vi har en NPS-score på 72. I vil ikke fortryde det!" },
      { role: "kunde", line: "Ja... vi vender tilbage." },
    ],
    question: "Hvad burde sælgeren have gjort i stedet?",
    options: [
      "Givet en rabat med det samme",
      "Navngivet den uudtalte frygt direkte frem for at overvælde kunden med fordele",
      "Afsluttet mødet og fulgt op næste dag",
      "Spurgt til konkurrenternes pris",
    ],
    correctIndex: 1,
    explanation: "'Det er mange penge, vi er ikke sikre...' er et signal om frygt for at tage fejl. Sælgeren overdøver frygten med features og tal — det virker modsat, kunden går mere i defensiv. Det rigtige svar: 'Jeg hører en tøven — er bekymringen at I investerer og det ikke leverer? For det er en helt fornuftig tanke.' Navngiv frygten, og den mister kraft.",
  },
  {
    techId: 1,
    title: "Sælgeren der antager frem for at spørge",
    conversation: [
      { role: "salg", line: "Godt — jeg kan se I er i growth-fasen, så I har sikkert brug for noget der skalerer hurtigt og kan håndtere 50+ brugere?" },
      { role: "kunde", line: "Vi er faktisk kun 8 personer..." },
      { role: "salg", line: "Nå, okay — men I vokser vel snart?" },
    ],
    question: "Hvad er den grundlæggende fejl her?",
    options: [
      "Sælgeren er for optimistisk",
      "Sælgeren antager kundens situation frem for at kortlægge den med spørgsmål",
      "Sælgeren præsenterer for tidligt",
      "Sælgeren burde have researched virksomheden bedre",
    ],
    correctIndex: 1,
    explanation: "Sælgeren 'ved' allerede hvad kunden har brug for — uden at have spurgt. Det er farligt af to grunde: det er ofte forkert, og kunden mærker at du ikke lytter men bare sælger. Spørg altid: 'Hvad er jeres nuværende setup?' og 'Hvor mange bruger det i dag?' — lad kunden fortælle dig, ikke omvendt.",
  },
];

// ─── Udfyld hullet ────────────────────────────────────────────────────────────

const UDFYLD_EXERCISES: UdfyldExercise[] = [
  {
    techId: 2,
    intro: "Opsummering-teknikken",
    setup: "Kunden har forklaret at de bruger for meget tid på manuel rapportering og at ledelsen er frustreret over manglende overblik.",
    parts: [
      { text: "\"Lad mig se om jeg har forstået det rigtigt — jeres største udfordring er ", isGap: false },
      { text: "manuel rapportering der tager for lang tid", isGap: true, answer: "manuel rapportering der tager for lang tid" },
      { text: ", og konsekvensen er at ", isGap: false },
      { text: "ledelsen mangler overblik", isGap: true, answer: "ledelsen mangler overblik" },
      { text: ". ", isGap: false },
      { text: "Er det rigtigt forstået?", isGap: true, answer: "Er det rigtigt forstået?" },
      { text: "\"", isGap: false },
    ],
    hint: "Brug de tre kerneelementer: problemet → konsekvensen → bekræftelsesspørgsmålet",
    explanation: "En god opsummering har tre dele: (1) kundens problem med deres egne ord, (2) konsekvensen det skaber, (3) et lukket bekræftelsesspørgsmål der inviterer kunden til at korrigere hvis du har misforstået.",
  },
  {
    techId: 1,
    intro: "Situationsspørgsmål — fra pitch til kortlægning",
    setup: "Kunden siger: 'Vi er interesserede i jeres løsning.' Du vil kortlægge situationen inden du pitcher.",
    parts: [
      { text: "\"Det er dejligt at høre. For at give jer det mest relevante billede, må jeg godt stille ", isGap: false },
      { text: "et par spørgsmål", isGap: true, answer: "et par spørgsmål" },
      { text: " først? ", isGap: false },
      { text: "Hvordan håndterer I det i dag", isGap: true, answer: "Hvordan håndterer I det i dag" },
      { text: ", og ", isGap: false },
      { text: "hvem er involveret i beslutningen", isGap: true, answer: "hvem er involveret i beslutningen" },
      { text: "?\"", isGap: false },
    ],
    hint: "Du skal: bede om lov til at spørge, stille et situationsspørgsmål om nuværende setup, og et spørgsmål om beslutningsprocessen.",
    explanation: "At bede om lov ('må jeg godt stille et par spørgsmål?') er en lille men vigtig sætning — den signalerer respekt og sætter forventningen. Kunden siger næsten altid ja.",
  },
  {
    techId: 5,
    intro: "Navngiv den uudtalte frygt",
    setup: "Kunden siger: 'Det lyder fint... vi vender nok tilbage.' Du ved de er tæt på at sige ja men er bange for at tage fejl.",
    parts: [
      { text: "\"Jeg hører det. Og jeg tror jeg ved hvad du tænker — hvad nu hvis vi ", isGap: false },
      { text: "investerer og det ikke leverer", isGap: true, answer: "investerer og det ikke leverer" },
      { text: "? Det er en ", isGap: false },
      { text: "helt fornuftig bekymring", isGap: true, answer: "helt fornuftig bekymring" },
      { text: ". Lad mig fortælle dig præcis ", isGap: false },
      { text: "hvad der sker hvis det ikke virker for jer", isGap: true, answer: "hvad der sker hvis det ikke virker for jer" },
      { text: "...\"", isGap: false },
    ],
    hint: "Tre dele: navngiv frygten direkte → valider den som fornuftig → tilbyd en konkret plan for worst case.",
    explanation: "Det effektive ved at navngive frygten er at den mister kraft. Kunden føler sig forstået, og bevogtningen falder. Du viser mod — og det opbygger tillid hurtigere end nogen salgspitch.",
  },
  {
    techId: 3,
    intro: "Fra forretning til person",
    setup: "Kunden har forklaret en forretningsmæssig udfordring. Du vil nu bevæge dig til den personlige motivation.",
    parts: [
      { text: "\"Det forstår jeg godt. Og hvad betyder det for ", isGap: false },
      { text: "dig personligt", isGap: true, answer: "dig personligt" },
      { text: " — hvis I ", isGap: false },
      { text: "ikke løser det her inden årets udgang", isGap: true, answer: "ikke løser det her inden årets udgang" },
      { text: ", ", isGap: false },
      { text: "hvad sker der så for dig og dit team?", isGap: true, answer: "hvad sker der så for dig og dit team?" },
      { text: "\"", isGap: false },
    ],
    hint: "Bevæg dig fra virksomhedens problem til personens situation: 'dig personligt', 'dit team', konkret tidsramme.",
    explanation: "De tre nøgleord er 'dig personligt', 'dit team' og en konkret tidsramme ('inden årets udgang'). Det giver kunden mulighed for at dele karrieremæssig eller personlig bekymring — den reelle driver bag beslutningen.",
  },
  {
    techId: 4,
    intro: "Challeng­er-indsigt — brug mønsteret",
    setup: "Du sælger lageroptimering. Kunden fokuserer på at reducere fragtomkostninger.",
    parts: [
      { text: "\"De fleste i jeres situation fokuserer på ", isGap: false },
      { text: "fragten", isGap: true, answer: "fragten" },
      { text: " — og det giver mening. Men vores erfaring viser at ", isGap: false },
      { text: "lagerbindingen faktisk er den dobbelt så store skjulte omkostning", isGap: true, answer: "lagerbindingen faktisk er den dobbelt så store skjulte omkostning" },
      { text: ". ", isGap: false },
      { text: "Har I nogensinde lavet den beregning?", isGap: true, answer: "Har I nogensinde lavet den beregning?" },
      { text: "\"", isGap: false },
    ],
    hint: "Mønsteret: 'De fleste fokuserer på X' → 'men den skjulte omkostning er Y' → 'har I kigget på det?'",
    explanation: "Challenger-indsigten følger et fast mønster: (1) anerkend det kunden fokuserer på, (2) introducer den overraskende indsigt, (3) afslut med et spørgsmål der inviterer kunden til at reflektere. Aldrig bare en påstand — altid med et spørgsmål.",
  },
];

// ─── Hurtig valg (multiple choice) ───────────────────────────────────────────

const VALG_EXERCISES: HurtigValgExercise[] = [
  {
    techId: 1,
    situation: "Du er til introduktionsmøde med en potentiel kunde.",
    customerLine: "\"Vi har hørt meget om jer. Hvad er det I kan tilbyde os?\"",
    options: [
      "\"Fantastisk! Vi tilbyder markedets bedste løsning med AI-integration og automatisk rapportering — lad mig vise jer en demo!\"",
      "\"Inden jeg fortæller om os — hvad er jeres situation i dag? Hvad bruger I allerede?\"",
      "\"Vi har mange løsninger. Hvad er jeres budget?\"",
      "\"Vores løsning passer til alle virksomheder. Lad mig tage jer igennem vores standardpræsentation.\"",
    ],
    correctIndex: 1,
    explanation: "B er det rigtige. Kunden er klar til at lytte — brug det til at kortlægge situationen INDEN du pitcher. Din præsentation bliver 3x mere relevant, fordi du kan ramme præcis det de kæmper med.",
    whyWrong: [
      "Pitcher direkte uden nogen viden om kundens situation. Du ved ikke hvad der er relevant for dem.",
      null,
      "Spørger til budget som første spørgsmål — det er for tidligt og signalerer at du kun er interesseret i pengene.",
      "Standardpræsentation viser nul interesse for kundens specifikke situation.",
    ],
  },
  {
    techId: 2,
    situation: "Kunden har forklaret et problem i 3 minutter. Det er nu din tur.",
    customerLine: "\"Ja, så det er egentlig det. Der er mange ting der er svære at navigere.\"",
    options: [
      "\"Perfekt — det er præcis det vi løser. Lad mig vise jer vores produkt.\"",
      "\"Interessant. Har I overvejet at outsource det?\"",
      "\"Lad mig se om jeg har forstået det rigtigt: [opsummer] — passer det?\"",
      "\"Hvad er jeres tidslinje for at løse det?\"",
    ],
    correctIndex: 2,
    explanation: "C er det rigtige. Efter kunden har delt en kompleks situation er det stærkeste du kan gøre at opsummere det du har hørt og tjekke din forståelse. Det viser du har lyttet, og det afslører hvis du har misforstået noget.",
    whyWrong: [
      "Hopper direkte til løsning — kunden har ikke fået bekræftet at du forstår situationen.",
      "Et outsourcing-spørgsmål er irrelevant og virker som om du ikke lyttede.",
      null,
      "Tidslinje er relevant — men EFTER du har bekræftet forståelsen, ikke i stedet for.",
    ],
  },
  {
    techId: 5,
    situation: "Sent i et møde. Kunden er interesseret men tøver.",
    customerLine: "\"Vi skal nok tænke over det... det er en stor beslutning.\"",
    options: [
      "\"Selvfølgelig! Tag den tid I har brug for. Jeg sender et tilbud.\"",
      "\"Hvad er det præcist der gør det til en stor beslutning for jer?\"",
      "\"Vi har andre kunder der er interesserede — tilbuddet løber kun til fredag.\"",
      "\"Lad mig fortælle jer mere om vores success cases — I vil ikke fortryde det.\"",
    ],
    correctIndex: 1,
    explanation: "B er det rigtige. 'Det er en stor beslutning' gemmer en uudtalt frygt. Spørg åbent hvad der gør det til en stor beslutning — det lader kunden fortælle dig hvad barrieren er. Derefter kan du adressere den direkte.",
    whyWrong: [
      "Giver op for let — du sender et tilbud der sandsynligvis aldrig bliver fulgt op.",
      null,
      "Kunstig scarcity er gennemskuelig og skader tilliden.",
      "Overdøver frygten med success cases — kunden går mere i defensiv.",
    ],
  },
  {
    techId: 3,
    situation: "Du taler med en indkøbschef om et nyt logistiksystem. Han er fagligt interesseret.",
    customerLine: "\"Det ville spare os 15% i transportomkostninger ifølge vores beregning.\"",
    options: [
      "\"Ja! Og med vores system kan I faktisk spare endnu mere — op til 22%!\"",
      "\"Det er et flot tal. Hvad betyder det for dig personligt, hvis I lykkes med det her?\"",
      "\"Har I regnet på ROI over 3 år?\"",
      "\"Hvad siger ledelsen til de tal?\"",
    ],
    correctIndex: 1,
    explanation: "B er det rigtige. Du har den forretningsmæssige case (15% besparelse). Nu er det tid til at finde den personlige motivation. 'Hvad betyder det for dig personligt' bevæger samtalen fra et tal til et menneske — og det er der beslutningen lever.",
    whyWrong: [
      "One-upping kunden med 22% er irriterende og utroverværdigt. Det handler ikke om dit tal.",
      null,
      "ROI-beregning er nyttigt, men du ved allerede hvad han vil spare — nu handler det om den personlige driver.",
      "Ledelsens mening er relevant, men ikke det vigtigste at spørge om nu.",
    ],
  },
  {
    techId: 4,
    situation: "Kunden er CFO og vil primært reducere IT-omkostninger.",
    customerLine: "\"Vi vil gerne skære i vores IT-budget. Det er ledelsens prioritet.\"",
    options: [
      "\"Perfekt — vores løsning er meget billigere end alternativerne.\"",
      "\"Det forstår jeg godt. Hvad bruger I mest på i dag?\"",
      "\"Interessant — de CFO'er vi typisk arbejder med, de tror det handler om IT-budgettet, men den største skjulte omkostning er faktisk produktivitetstabet fra ineffektive systemer. Har I kigget på det?\"",
      "\"Vi kan give jer en god pris. Hvad er jeres nuværende budget?\"",
    ],
    correctIndex: 2,
    explanation: "C er det rigtige. Det er en Challenger-indsigt: anerkend hvad kunden fokuserer på, introducer den overraskende vinkel (produktivitetstab vs. IT-budget), afslut med et spørgsmål. Det positionerer dig som rådgiver frem for leverandør.",
    whyWrong: [
      "Konkurrerer på pris — det er det dårligste sted at stå.",
      "Kortlæggings-spørgsmål er godt, men du har en reel indsigt du bør dele her.",
      null,
      "Beder om budget som næste skridt — du springer til transaktionen for tidligt.",
    ],
  },
  {
    techId: 1,
    situation: "Du er halvvejs inde i en demo. Kunden virker uengageret.",
    customerLine: "\"Ja... det ser fint ud.\"",
    options: [
      "\"Godt! Lad mig bare vise jer de næste features...\"",
      "\"'Fint ud' — hvad tænker du præcis? Er der noget der ikke rammer jeres behov?\"",
      "\"Det er faktisk vores mest populære feature. Alle vores kunder bruger det.\"",
      "\"Vi kan tilpasse alt efter jeres ønsker — hvad vil I gerne have anderledes?\"",
    ],
    correctIndex: 1,
    explanation: "B er det rigtige. 'Det ser fint ud' er et tegn på uengagement — måske er demoen ikke relevant nok. Stop op og undersøg. 'Hvad tænker du præcis?' åbner for ærlig feedback og giver dig mulighed for at justere kursen.",
    whyWrong: [
      "Fortsætter blindt — du kaster features efter en uinteresseret kunde.",
      null,
      "Social proof er ikke svaret på uengagement.",
      "For bredt — beder kunden om at designe løsningen, hvilket er din opgave.",
    ],
  },
  {
    techId: 2,
    situation: "Kunden har forklaret noget komplekst og du er lidt usikker på om du forstod.",
    customerLine: "\"Det er en kombination af mange ting... svært at forklare præcist.\"",
    options: [
      "\"Ja, det lyder komplekst. Vores løsning er fleksibel nok til at håndtere det.\"",
      "\"Lad mig prøve: er det primært [X] der er udfordringen, eller er det mere [Y]?\"",
      "\"Kan du sende mig et dokument der beskriver situationen?\"",
      "\"Hvornår opstod problemet første gang?\"",
    ],
    correctIndex: 1,
    explanation: "B er det rigtige. Når kunden har svært ved at forklare, hjælp dem ved at opstille to muligheder. Det er en form for opsummering der lader dem vælge eller korrigere. Det er langt mere produktivt end at vente på at de selv finder ordene.",
    whyWrong: [
      "Springer til løsning uden at forstå problemet.",
      null,
      "Udsætter forståelsen — du sidder med kunden nu, brug øjeblikket.",
      "Historikspørgsmål hjælper ikke med at kortlægge det nuværende problem.",
    ],
  },
  {
    techId: 5,
    situation: "Du er ved at afslutte et møde. Der er interesse men ingen klar beslutning.",
    customerLine: "\"Vi har brug for at drøfte det internt. Der er mange stakeholders involveret.\"",
    options: [
      "\"Selvfølgelig! Hvornår passer det at jeg følger op?\"",
      "\"Det forstår jeg. Hvad er jeres bekymring — handler det om prisen, implementeringen, eller noget helt andet?\"",
      "\"Kan I ikke bare prøve det i 30 dage? Så er der ingen risiko.\"",
      "\"Vi har hjulpet mange virksomheder med mange stakeholders — det er vi vant til.\"",
    ],
    correctIndex: 1,
    explanation: "B er det rigtige. 'Mange stakeholders' er sandsynligvis ikke den reelle barriere — det er et politsvar. Spørg direkte til bekymringen: pris, implementering, eller noget tredje. Det giver dig noget konkret at arbejde med.",
    whyWrong: [
      "Accepterer svaret og planlægger follow-up — men hvad følger du op på? Du ved ikke hvad barrieren er.",
      null,
      "30-dages trial løser ikke en uidentificeret bekymring.",
      "Irrelevant — social proof virker ikke her.",
    ],
  },
];

// ─── SPIN Builder ─────────────────────────────────────────────────────────────

const SPIN_EXERCISES: SpinExercise[] = [
  {
    situation: "Du sælger projektledelsessoftware til en operations-chef i en byggevirksomhed med 80 ansatte.",
    customer: "Maria, Operations-chef, har 4 projektledere under sig",
    product: "Projektledelsessoftware — task-tracking, ressourceoverblik, rapportering",
    model: {
      S: "\"Hvordan koordinerer I projekter på tværs af jeres 4 projektledere i dag? Bruger I et fælles system eller kører de uafhængigt?\"",
      P: "\"Hvad er den største frustration I oplever med den nuværende måde at koordinere på?\"",
      I: "\"Når der er manglende koordinering — hvad sker der konkret? Koster det jer forsinkelser, overworked folk, eller noget tredje?\"",
      N: "\"Hvad ville det betyde for dig og dine projektledere, hvis I havde fuldt overblik over alle ressourcer og status i realtid?\"",
    },
    tips: {
      S: "SITUATION: Faktaspørgsmål om nuværende setup. 'Hvordan gør I det i dag?' og 'Hvem er involveret?' Ingen evaluering endnu.",
      P: "PROBLEM: Gå efter den specifikke frustration. Undgå 'har I problemer?' (for let at sige nej). Brug 'hvad er den største frustration' i stedet.",
      I: "IMPLIKATION: Uddyb konsekvensen. Hvad KOSTER problemet dem — tid, penge, stress, kundetilfredshed? Det er her problemet vokser i størrelse.",
      N: "NEED-PAYOFF: Lad kunden selv formulere værdien af løsningen. 'Hvad ville det betyde...' er kraftfuldt fordi kunden siger fordelen med egne ord.",
    },
  },
  {
    situation: "Du sælger regnskabssoftware til en lille revisionsvirksomhed med 12 ansatte.",
    customer: "Thomas, partner og daglig leder, revisionsvirksomhed",
    product: "Cloud-baseret regnskabssoftware med automatisk bogføring og klientportal",
    model: {
      S: "\"Hvordan håndterer I klienternes bogføring i dag — bruger I et standardsystem, eller er det forskelligt fra klient til klient?\"",
      P: "\"Hvad er det mest tidskrævende ved jeres nuværende arbejdsproces?\"",
      I: "\"Når den manuelle bogføring tager lang tid — mærker I at det begrænser hvor mange klienter I kan håndtere? Og hvad koster det jer i omsætning?\"",
      N: "\"Hvis bogføringen kørte automatisk og I kunne se alt i realtid — hvad ville I bruge den frigjorte tid på?\"",
    },
    tips: {
      S: "Start med setup-spørgsmål der ikke presser. 'Bruger I et standardsystem?' er neutralt og åbner for en detaljeret beskrivelse.",
      P: "Spørg til tidsforbrug — det er det mest sårbare punkt i revisions-workflow. Undgå 'er I tilfredse?' brug 'hvad er mest tidskrævende?'",
      I: "Forbind tidsproblemet til en forretningsmæssig konsekvens: kapacitet → omsætning. Gør problemet konkret og målbart.",
      N: "Afslut med at lade kunden visualisere et bedre liv. 'Hvad ville I bruge den frigjorte tid på?' er kraftfuldt — de sælger løsningen til sig selv.",
    },
  },
  {
    situation: "Du sælger rekrutteringsplatform til HR-chef i en tech-virksomhed der skalerer.",
    customer: "Sofie, HR-chef, tech-virksomhed — vokser fra 50 til 150 ansatte over næste år",
    product: "Rekrutteringsplatform med ATS, jobannoncering og kandidat-tracking",
    model: {
      S: "\"Hvordan ser jeres rekrutteringsproces ud i dag — bruger I et dedikeret system, eller kører det i mails og regneark?\"",
      P: "\"Hvad er den del af rekrutteringsprocessen der skaber mest stress eller fejl for dig og dit team?\"",
      I: "\"Når I ansætter 5-10 personer på én gang — hvad sker der med de kandidater der falder i kløfterne? Mister I gode folk fordi processen ikke er hurtig nok?\"",
      N: "\"Hvis jeres rekrutteringsproces kørte strømlinet — hvad ville det frigøre for dig personligt?\"",
    },
    tips: {
      S: "'Mails og regneark' er et konkret, relaterbart alternativ du kan nævne — det er ikke kritik, det er en åbner der viser du kender branchen.",
      P: "Spørg til stress og fejl, ikke til 'problemer'. Folk siger nej til 'har I problemer' men svarer ærligt på 'hvad skaber stress'.",
      I: "Gå efter den konkrete konsekvens ved skaleringsudfordringen: mistede kandidater = tabt tid og tabt talentpotentiale. Det er reelt.",
      N: "Personliggør need-payoff ved at spørge hvad DET frigør for hende — ikke virksomheden. Personlig motivation driver beslutningen.",
    },
  },
  {
    situation: "Du sælger CRM til en salgsdirektør i en B2B-virksomhed med 15 sælgere.",
    customer: "Rasmus, Sales Director, B2B software-virksomhed",
    product: "CRM med pipeline-management, forecasting og salgscoaching-funktioner",
    model: {
      S: "\"Hvilken løsning bruger sælgerne i dag til at tracke deres leads og pipeline — er der et fælles CRM, eller kører de med egne systemer?\"",
      P: "\"Hvad er dit største problem med at have overblik over salgspipeline i dag?\"",
      I: "\"Når I ikke har præcist overblik over pipeline — hvad betyder det for din evne til at forecaste til ledelsen? Og hvad sker der, når forecast ikke holder?\"",
      N: "\"Hvis du kunne se din fulde pipeline i realtid og give ledelsen et præcist forecast — hvad ville det ændre for dig som Sales Director?\"",
    },
    tips: {
      S: "Kortlæg nuværende setup neutralt. 'Er der et fælles CRM, eller kører de med egne systemer?' giver to muligheder og signalerer at du kender virkeligheden.",
      P: "Spørg specifikt til pipeline-overblik — det er Sales Directors primære smertepunkt. Undgå det generelle 'hvad er jeres problem med CRM?'",
      I: "Gå til konsekvensen af dårlig forecasting: det påvirker Sales Directors troværdighed over for ledelsen. Det er personlig og professionel smerte.",
      N: "Afslut med at kunden selv formulerer værdien. 'Hvad ville det ændre for dig som Sales Director?' er meget mere kraftfuldt end 'vores CRM hjælper dig med...'",
    },
  },
];

// ─── Roleplay Scenarios ───────────────────────────────────────────────────────

const ROLEPLAY_SCENARIOS: RoleplayScenario[] = [
  {
    id: "saas-foerste-moede",
    title: "IT-løsning — første møde",
    description: "Koldt B2B-møde med en IT-chef der kender problemet men ikke løsningen. 6 vendinger.",
    customer: { name: "Mikael Jensen", role: "IT-chef", company: "Buildware (45 ansatte)" },
    product: "Projektledelsesplatform",
    goal: "Kortlæg situationen, opbyg forståelse og adressér implementeringsfrygt",
    difficulty: "Medium",
    color: "#f59e0b",
    colorLight: "#fffbeb",
    turns: [
      {
        customerLine: "Hej, velkommen. Hvad er det I egentlig sælger?",
        context: "Åbningsspørgsmålet. Kunden er nysgerrig — brug det til at kortlægge, ikke til at pitche.",
        techHint: "Teknik 1 — Forstå situationen",
        goodResponse: "\"Tak fordi du tager dig tid. Inden jeg fortæller om os — hvad er jeres nuværende setup til projektstyring? Bruger I et fælles system, eller kører folk med egne løsninger?\"",
        feedback: "Det stærkeste åbningssvar er et kortlæggingsspørgsmål. Kunden er klar til at lytte — brug det til at forstå situationen inden du siger et ord om produktet. Din pitch bliver 3x mere relevant.",
        redFlag: "Hvis du begynder med at pitche produktet, mister du troværdighed inden mødet er kommet i gang.",
      },
      {
        customerLine: "Vi bruger Trello og Teams. Det virker okay, men det kan godt blive rodet når mange projekter kører parallelt.",
        context: "Kunden har afsløret et smertepunkt ('rodet'). Grav dybere — find konsekvensen.",
        techHint: "Teknik 1 + SPIN Implication",
        goodResponse: "\"'Rodet' er interessant — hvad sker der konkret, når det bliver rodet? Mister I overblik, opstår der fejl, eller er det mere at folk ikke ved hvad andre laver?\"",
        feedback: "Når kunden bruger vage ord som 'rodet', 'svært' eller 'ikke optimalt' — grav dybere. Det er der problemet og den reelle smerte gemmer sig. Stil et konkret opfølgningsspørgsmål.",
        redFlag: "Spring ikke direkte til løsningen nu. Du mangler stadig den fulde forståelse af konsekvensen.",
      },
      {
        customerLine: "Det er mest at folk ikke ved hvad andre laver. Vi har mistet et par deadlines pga. det.",
        context: "Konkret problem + konkret konsekvens. Opsummér og bekræft forståelsen.",
        techHint: "Teknik 2 — Vis du forstår",
        goodResponse: "\"Lad mig se om jeg har forstået det rigtigt: udfordringen er manglende synlighed på tværs af teamet — og det har allerede kostet jer tabte deadlines. Er det rigtigt forstået?\"",
        feedback: "Nu er det tid til Teknik 2. Opsummeringen viser at du har lyttet og giver kunden mulighed for at korrigere. Brug kundens egne ord: 'folk ved ikke hvad andre laver' og 'tabte deadlines'.",
        redFlag: "Opsummer ikke med dit eget fagsprog. Brug kundens ord — det er et spejl, ikke en parafrase.",
      },
      {
        customerLine: "Ja, præcist. Det er ret frustrerende — vi er et lille team men det føles som vi arbejder i siloer.",
        context: "Kunden bekræftede + sagde 'frustrerende'. Det er en invitation til det personlige niveau.",
        techHint: "Teknik 3 — Find den personlige motivation",
        goodResponse: "\"Jeg kan godt høre det. Hvad betyder det for dig personligt, når teamet arbejder i siloer — er det mest tidsspildet, eller er det mere frustrationen ved ikke at vide hvad der foregår?\"",
        feedback: "Kunden brugte ordet 'frustrerende' — det er din invitation til Teknik 3. 'Hvad betyder det for dig personligt' bevæger samtalen fra problem til person, og det er der beslutningen lever.",
        redFlag: "Pitch ikke løsningen endnu. Du er ved at bygge den personlige forbindelse der reelt driver beslutningen.",
      },
      {
        customerLine: "Det er begge dele. Og ledelsen begynder at spørge til vores leveringstid. Det er ubehageligt.",
        context: "Ledelsespres afsløret. Bring en indsigt kunden ikke har tænkt på.",
        techHint: "Teknik 4 — Hjælp dem tænke",
        goodResponse: "\"Det forstår jeg godt. Noget vi ser igen og igen hos teams som jeres — og det er måske ikke det I forventer — er at problemet sjældent er disciplin eller motivation. Det er manglende synlighed. Når folk ikke kan se hinandens arbejde, opstår der automatisk overlap og huller. Genkender I det?\"",
        feedback: "Challenger-momentet. Du bringer en indsigt om årsagen til problemet (synlighed, ikke disciplin) der positionerer dig som rådgiver. Afslut altid Challenger-indsigten med et spørgsmål — aldrig bare en påstand.",
        redFlag: "Indsigten skal være specifik og baseret på erfaring. 'Mange virksomheder oplever...' virker vagt og svækker troværdigheden.",
      },
      {
        customerLine: "Det lyder rigtigt... men vi har prøvet nyt software før, og teamet brugte det aldrig. Det mislykkedes.",
        context: "Implementeringsfrygt. Det klassiske 'vi har prøvet det og det virkede ikke'.",
        techHint: "Teknik 5 — Fjern risikoen",
        goodResponse: "\"Det hører vi tit — og det er en helt fornuftig bekymring. I har investeret tid og energi i noget der ikke blev brugt. Frygten er: hvad nu hvis det sker igen? Lad mig fortælle præcis hvad vi gør for at undgå det — og hvad der sker, hvis det alligevel ikke virker for jer...\"",
        feedback: "Navngiv frygten præcist ('hvad nu hvis det sker igen?') og tilbyd derefter en konkret plan for worst case. Det fjerner usikkerheden mere effektivt end nogen feature-pitch. Kunden føler sig forstået.",
        redFlag: "Overdøv ikke frygten med fordele og features. Kunden vil gå mere i defensiv — det virker modsat.",
      },
    ],
  },
  {
    id: "forsikring-kold-opkald",
    title: "Forsikring — koldt telefonopkald",
    description: "B2C-opkald til en selvstændig der aldrig har tænkt over erhvervsforsikring. 5 vendinger.",
    customer: { name: "Lene Sørensen", role: "Selvstændig grafiker", company: "Freelance, 5 år i business" },
    product: "Erhvervsforsikring + sygeforsikring",
    goal: "Skab interesse, kortlæg situationen og adressér prisbekymringen",
    difficulty: "Let",
    color: "#ef4444",
    colorLight: "#fef2f2",
    turns: [
      {
        customerLine: "Ja hej... I ringede jo tidligere. Hvad handler det om?",
        context: "Kold opringning. Du har max 20 sekunder til at skabe interesse uden at skræmme af.",
        techHint: "Teknik 1 — Forstå situationen",
        goodResponse: "\"Hej Lene, tak fordi du tager igen. Jeg ringer fordi vi hjælper selvstændige med at sikre sig — og jeg ville høre: har du erhvervsforsikring i dag, eller er det noget du har haft på to-do-listen?\"",
        feedback: "Åbn med et kortlæggingsspørgsmål, ikke en pitch. 'Har du det i dag, eller på to-do-listen?' er non-threatening og inviterer til et ærligt svar. Det viser interesse for hende, ikke for salget.",
        redFlag: "Start aldrig med 'vi har en fantastisk forsikring til dig'. Det lukker folk med det samme — de mærker salgsmodusset.",
      },
      {
        customerLine: "Jeg har en privat sygeforsikring... men erhvervsforsikring — det ved jeg faktisk ikke helt hvad er.",
        context: "Uvidende, men ikke uinteresseret. Kortlæg erhvervssituationen inden du forklarer.",
        techHint: "Teknik 1 — Forstå situationen",
        goodResponse: "\"Det er faktisk rigtig normalt for selvstændige. Hvad laver du i din forretning? Og arbejder du alene eller har du ansatte?\"",
        feedback: "Kunden er åben. Nu er det tid til at kortlægge situationen: hvad laver hun, og hvilken risiko er hun eksponeret for? Forklar IKKE hvad erhvervsforsikring er endnu — kortlæg situationen først, ellers forklarer du noget der måske ikke er relevant.",
        redFlag: "Forklar ikke produktet endnu. Du ved stadig ikke hvad hendes konkrete situation og risikoprofil er.",
      },
      {
        customerLine: "Jeg er freelance grafiker — kun mig selv hjemmefra. Har gjort det i 5 år.",
        context: "Situationen er kortlagt. Stil et implikationsspørgsmål om konsekvensen ved manglende dækning.",
        techHint: "SPIN Implication + Teknik 3",
        goodResponse: "\"Fem år, det er flot. Og hvad sker der med din forretning — og din indkomst — hvis du pludselig ikke kan arbejde i to-tre måneder? Har du tænkt over det scenarie?\"",
        feedback: "'Hvad sker der med din indkomst' er langt mere kraftfuldt end 'du burde have erhvervsforsikring'. Lad kunden selv sige konsekvensen højt — det er mere overbevisende end alt du kan sige. Stil spørgsmålet nysgerrigt, ikke alarmistisk.",
        redFlag: "Vær ikke skræmmende. Stil spørgsmålet med oprigtig nysgerrighed — kunden skal komme til erkendelsen selv.",
      },
      {
        customerLine: "Øh... det har jeg faktisk ikke tænkt over. Det ville stoppe helt. Det er lidt skræmmende at tænke på.",
        context: "Kunden har selv sagt konsekvensen. Vis at du hørte det — opsummér og bekræft.",
        techHint: "Teknik 2 + Teknik 3",
        goodResponse: "\"Det lyder som om du har en forretning der udelukkende hviler på dig — og hvis du falder ud, er der ingen buffer. Er det ret præcist sagt?\"",
        feedback: "Perfekt øjeblik til Teknik 2: opsummér det kunden selv sagde og giv dem mulighed for at bekræfte. Kunden har åbnet op personligt ('skræmmende') — vis at du hørte det ved at spejle det.",
        redFlag: "Start ikke på løsningen endnu. Kunden er ved at indse et behov — lad det lande inden du introducerer produktet.",
      },
      {
        customerLine: "Ja... det er præcist sådan. Jeg tror godt jeg burde se på det. Men det er sikkert dyrt?",
        context: "Kunden er på vej til ja. Pris-bekymringen gemmer en dybere frygt — navngiv og adressér den.",
        techHint: "Teknik 5 — Fjern risikoen",
        goodResponse: "\"Prisbekymringen er helt fair — og den gemmer en dybere tanke: hvad nu hvis jeg betaler for noget jeg aldrig bruger? Det er en fornuftig tanke. Lad mig give dig et konkret tal, og så kan du selv vurdere om det giver mening set i forhold til hvad du tjener pr. måned.\"",
        feedback: "Navngiv frygten bag prisspørgsmålet ('hvad nu hvis jeg betaler for noget jeg aldrig bruger?') og tilbyd derefter en konkret sammenligning. Value-framing FØR prisen. Det er langt mere overbevisende end 'det er faktisk billigt'.",
        redFlag: "Svar aldrig bare med en pris. Kunden sammenligner prisen med en ukendt reference — du skal give dem en god referenceramme.",
      },
    ],
  },
  {
    id: "rekruttering-varm-lead",
    title: "HR-platform — varm lead",
    description: "B2B-møde med HR-direktør i vækstvirksomhed. Kunden er åben men har en dårlig oplevelse fra fortiden. 6 vendinger.",
    customer: { name: "Sofie Christensen", role: "HR-direktør", company: "Scalio Tech (vokser 40 → 120 ansatte)" },
    product: "Rekrutteringsplatform med ATS og kandidat-tracking",
    goal: "Kortlæg situationen, find personlig motivation og fjern implementeringsfrygten proaktivt",
    difficulty: "Svær",
    color: "#8b5cf6",
    colorLight: "#f5f3ff",
    turns: [
      {
        customerLine: "Vi fik jeres navn fra en kollega. Fortæl hvad I kan tilbyde.",
        context: "Warm lead — kunden er åben. Men kortlæg situationen FØR du pitcher. Det betaler sig.",
        techHint: "Teknik 1 — Forstå situationen",
        goodResponse: "\"Tak — vi samarbejder med mange HR-teams i growth-fase, og vi er glade for I rakte ud. For at give jer det mest relevante billede: hvordan ser jeres rekrutteringsproces ud i dag? Bruger I et dedikeret system?\"",
        feedback: "Selv med et warm lead skal du kortlægge situationen. 'For at give jer det mest relevante billede' er en god forklaring på HVORFOR du stiller spørgsmål i stedet for at pitche — kunden forstår det og accepterer det.",
        redFlag: "Et warm lead er ikke en invitation til at pitche direkte. Kunden er åben — det er din chance for at kortlægge grundigt og levere en præcis pitch bagefter.",
      },
      {
        customerLine: "Vi bruger mest email og et regneark. Det er ikke smart, men det har virket.",
        context: "Kunden anerkender at det ikke er smart. Find problemet og konsekvensen.",
        techHint: "SPIN Problem + Implication",
        goodResponse: "\"'Ikke smart men virket' — hvad er den del der virker mindst godt? Og hvad sker der med de kandidater der falder i kløfterne, mens processen kører langsomt?\"",
        feedback: "To kraftfulde spørgsmål i ét: hvad er det svageste punkt (Problem), og hvad koster det jer i tabte kandidater (Implication). Kunden har allerede indset begrænsningen — hjælp dem at se konsekvensen af det.",
        redFlag: "Sig ikke 'jeres system er gammeldags'. Lad kunden komme til den konklusion selv — det er langt mere effektivt.",
      },
      {
        customerLine: "Vi mister faktisk kandidater — de bedste har mange tilbud og vi er for langsomme til at reagere.",
        context: "Konkret konsekvens bekræftet. Opsummér + find den personlige motivation.",
        techHint: "Teknik 2 + Teknik 3",
        goodResponse: "\"Lad mig spejle det: I mister de stærkeste kandidater netop fordi de har mange muligheder og I ikke kan reagere hurtigt nok. Det er en dobbelt frustration — I prøver at vokse, men rekrutteringen holder jer tilbage. Er det rigtigt forstået? Og hvad sker der for dig, hvis I ikke løser det i år?\"",
        feedback: "Kombiner Teknik 2 (opsummering) med Teknik 3 (personlig motivation) i samme svar. 'Hvad sker der for dig, hvis I ikke løser det i år?' åbner for den personlige konsekvens — karrierepres, stress, ledelsens forventninger.",
        redFlag: "Undgå 'det forstår jeg godt' uden at vise at du forstår. Opsummeringen er selve beviset for at du lyttede.",
      },
      {
        customerLine: "For mig personligt er det meget frustrerende. Ledelsen forventer at vi tredobler teamet. Det her system holder os ikke.",
        context: "Stærk personlig motivation afsløret. Brug Challenger-indsigten nu.",
        techHint: "Teknik 4 — Hjælp dem tænke",
        goodResponse: "\"Det giver rigtig god mening. Noget vi ser hos HR-teams i vækst — og det er måske ikke overraskende — er at virksomheder i jeres fase tror problemet er kapacitet: 'vi skal bare ansætte hurtigere'. Men den skjulte udfordring er synlighed og koordinering: ingen ved hvem der interviewes, hvem der er afvist, hvem der er på vej. Det skaber forvirring og forsinker alt. Genkender I det?\"",
        feedback: "Challenger-indsigt: kunden tror problemet er kapacitet — du bringer en dybere årsag (synlighed og koordinering). Det positionerer dig som én der forstår HR i vækstfaser. Afslut altid med et spørgsmål.",
        redFlag: "Indsigten skal afsluttes med et spørgsmål der inviterer kunden til at bekræfte eller korrigere. En påstand uden spørgsmål lukker samtalen.",
      },
      {
        customerLine: "Ja... vi har faktisk total kaos i kommunikation om kandidater. Det er præcist det.",
        context: "Kunden er helt med. Adressér implementeringsfrygten PROAKTIVT — inden de nævner den.",
        techHint: "Teknik 5 — Fjern risikoen proaktivt",
        goodResponse: "\"Godt. Og jeg ved hvad du sandsynligvis tænker nu: 'vi har prøvet systemer før og det er altid en kæmpe implementering der suger energi og ikke bliver brugt.' Det er en reel bekymring. Lad mig fortælle præcis hvad der sker i de første 30 dage — og hvad vi gør, hvis I ikke er tilfredse efter 60.\"",
        feedback: "Proaktiv frygtfjernelse er langt mere effektiv end at vente på at kunden rejser indvendingen. Du viser at du kender branchen, og du tager ansvaret for at fjerne risikoen. Det opbygger tillid hurtigere end noget andet.",
        redFlag: "Vent ikke på at kunden spørger til garanti eller risiko. Adressér det proaktivt. Det er det modigste og mest effektive træk i salg.",
      },
      {
        customerLine: "Det lyder faktisk fornuftigt. Hvad sker der, hvis vi ikke er tilfredse?",
        context: "Kunden beder om konkret garanti. Giv et specifikt, troværdigt svar — ikke en vag 'vi løser det'.",
        techHint: "Teknik 5 — Konkret garanti",
        goodResponse: "\"Konkret: de første 30 dage er vi med jer hver uge. Hvis I efter 60 dage ikke har set X i jeres rekrutteringstid, taler vi om fuld refusion eller en tilpasset plan. Ingen bindingsperiode de første 3 måneder — I kan stoppe hvis det ikke virker. Det er vores garanti.\"",
        feedback: "En konkret garanti har tre dele: (1) hvad I gør i starten (onboarding), (2) hvad sker der hvis det ikke virker (refusion/plan), (3) konkret tidsramme. Det fjerner den resterende usikkerhed og giver kunden mod til at sige ja.",
        redFlag: "En vag garanti som 'vi løser altid problemer' er ikke troværdig. Vær specifik — det er specificiteten der skaber tillid.",
      },
    ],
  },
  {
    id: "upsell-eksisterende-kunde",
    title: "Upsell — eksisterende kunde",
    description: "B2B upsell til en tilfreds kunde der ikke bruger hele systemet. 5 vendinger.",
    customer: { name: "Kasper Nielsen", role: "Marketingdirektør", company: "GrowNow (basic plan, 8 måneder)" },
    product: "Premium upgrade med automatisk rapportering",
    goal: "Find uudnyttet potentiale, skab indsigt og frame prisen med value",
    difficulty: "Medium",
    color: "#10b981",
    colorLight: "#f0fdf4",
    turns: [
      {
        customerLine: "Hej igen! Hvad er det du vil have fat på mig for?",
        context: "Eksisterende kunde. Kortlæg hvad de faktisk bruger — og hvad de IKKE bruger.",
        techHint: "Teknik 1 — Forstå situationen",
        goodResponse: "\"Hej Kasper! Jeg ville høre hvordan det går med systemet — hvad bruger I det mest til nu, og er der dele af det I aldrig rigtig fik sat op?\"",
        feedback: "For en upsell skal du kortlægge bruget: hvad bruger de, hvad bruger de ikke, og er der noget de løser manuelt som systemet kan klare? Det er fundamentet for en relevant upsell — ikke 'vi har noget nyt til jer'.",
        redFlag: "Start aldrig med 'jeg har noget spændende til jer'. Det signalerer salgsmodus, ikke rådgivermodus — og det svækker relationen.",
      },
      {
        customerLine: "Vi bruger det primært til kampagnetracking. Fungerer fint. Rapporteringsdelen har vi ikke rigtig rørt.",
        context: "Kunden bruger ikke rapportering — og laver det sandsynligvis manuelt. Grav dybere.",
        techHint: "Teknik 1 + Teknik 4",
        goodResponse: "\"Interessant — så rapporteringen kører et andet sted? Bruger I Excel eller noget andet, og hvem sidder typisk og samler data?\"",
        feedback: "Du har fundet åbningen: de bruger ikke rapporteringen, men de laver det et andet sted. Find ud af hvor, hvem, og hvor meget tid det tager. Det er fundamentet for din indsigt om den skjulte tidskost.",
        redFlag: "Sig ikke 'I bruger jo ikke det I betaler for'. Det er defensivt og skader relationen med den eksisterende kunde.",
      },
      {
        customerLine: "Ja, vi laver det manuelt i Excel. Vores analytiker bruger nok 4-5 timer om ugen på det.",
        context: "Konkret tidstab identificeret. Bring indsigten om den skjulte omkostning.",
        techHint: "Teknik 4 — Hjælp dem tænke",
        goodResponse: "\"4-5 timer om ugen — det er over 200 timer om året. Og jeg er rimelig sikker på at den tid kunne bruges langt bedre end at copy-paste data i Excel. Det I allerede betaler for kan faktisk generere de her rapporter automatisk. Har I kigget på den del af systemet?\"",
        feedback: "Transformer timeantallet til en årsberegning (200 timer) — det gør den skjulte omkostning konkret og synlig. Tilbyd derefter at det der allerede er betalt for løser det. Det er en ægte indsigt, ikke et salgstrick.",
        redFlag: "Sig ikke 'I spild jer penge' eller 'I burde bruge systemet bedre'. Det er kritik forklædt som indsigt — kunden lukker ned.",
      },
      {
        customerLine: "Nej... vi vidste faktisk ikke det var muligt. Det lyder som om vi har betalt for noget vi ikke bruger.",
        context: "Kunden er lidt skuffet over sig selv. Redirect hurtigt fra negativitet til mulighed.",
        techHint: "Teknik 3 — Find den personlige motivation",
        goodResponse: "\"Det er faktisk meget normalt — systemer har mange features der aldrig bliver sat op i starten. Det vigtige er: hvad ville det betyde for dit team og din analytiker, hvis de pludselig havde 5 timer om ugen fri til andet?\"",
        feedback: "Redirect fra negativitet ('vi har spildt penge') til mulighed ('hvad ville 5 timer fri betyde?'). Lad kunden selv formulere værdien — det er SPIN Need-Payoff og Teknik 3 kombineret.",
        redFlag: "Bekræft ikke at de har 'spildt penge'. Redirect hurtigt til fremtiden og muligheden — fortiden er ikke interessant.",
      },
      {
        customerLine: "Det ville betyde meget. Han er altid overbelastet. Hvad koster det at opgradere?",
        context: "Kunden spørger til pris — de er tæt på et ja. Frame værdien FØR du nævner prisen.",
        techHint: "Teknik 5 — Fjern risikoen + value framing",
        goodResponse: "\"Lad mig sætte det i perspektiv: en analytiker der bruger 200 timer om året på manuel rapportering — hvad koster det jer i løn? Det er sandsynligvis 5-8x mere end opgraderingen. Prisen er X om måneden. Og hvis I prøver det i 60 dage og ikke synes det er det værd — så ruller vi tilbage. Ingen risiko.\"",
        feedback: "Value-framing: sæt prisen i relation til den eksisterende kendte omkostning (løntimer) inden du nævner tallet. Afslut med en konkret, risikofri garanti. Det er Teknik 5 — fjern risikoen for at tage den forkerte beslutning.",
        redFlag: "Nævn aldrig prisen uden at have skabt en referenceramme. Kunden sammenligner med noget ukendt — det er dit job at sætte sammenligningen.",
      },
    ],
  },
];

// ─── Component helpers ────────────────────────────────────────────────────────

function TechBadge({ tech, small }: { tech: Technique; small?: boolean }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: small ? "2px 8px" : "4px 10px",
      borderRadius: 99, fontSize: small ? 11 : 12, fontWeight: 700,
      background: tech.colorLight, color: tech.color,
      border: `1.5px solid ${tech.color}40`,
    }}>
      {tech.emoji} Teknik {tech.number}
    </span>
  );
}

function ProgressBar({ current, total, color }: { current: number; total: number; color: string }) {
  return (
    <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          height: 6, borderRadius: 3, flex: 1,
          background: i < current ? color : i === current ? `${color}60` : "#e8e5e1",
          transition: "all 0.2s",
        }} />
      ))}
      <span style={{ fontSize: 11, color: "#a8a29e", marginLeft: 4, whiteSpace: "nowrap" }}>
        {current}/{total}
      </span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function KundeforståelseTab() {
  const [mode, setMode] = useState<"learn" | "exercises">("learn");
  const [activeTech, setActiveTech] = useState(0);
  const [exerciseType, setExerciseType] = useState<ExerciseType>("valg");
  const [filterTech, setFilterTech] = useState<number | null>(null);

  // Exercise state
  const [idx, setIdx] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [userText, setUserText] = useState("");
  const [gapAnswers, setGapAnswers] = useState<string[]>([]);
  const [spinAnswers, setSpinAnswers] = useState({ S: "", P: "", I: "", N: "" });
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Roleplay state
  const [rpScenario, setRpScenario] = useState<number | null>(null);
  const [rpTurn, setRpTurn] = useState(0);
  const [rpHistory, setRpHistory] = useState<{ userText: string; selfScore: "good" | "ok" | "miss" | null }[]>([]);
  const [rpUserText, setRpUserText] = useState("");
  const [rpRevealed, setRpRevealed] = useState(false);
  const [rpSelfScore, setRpSelfScore] = useState<"good" | "ok" | "miss" | null>(null);
  const [rpDone, setRpDone] = useState(false);

  function startRoleplay(idx: number) {
    setRpScenario(idx); setRpTurn(0); setRpHistory([]);
    setRpUserText(""); setRpRevealed(false); setRpSelfScore(null); setRpDone(false);
  }

  function submitRpTurn() { if (rpUserText.trim()) setRpRevealed(true); }

  function continueRp() {
    const sc = ROLEPLAY_SCENARIOS[rpScenario!];
    const entry = { userText: rpUserText, selfScore: rpSelfScore };
    const newHistory = [...rpHistory, entry];
    setRpHistory(newHistory);
    if (rpTurn + 1 >= sc.turns.length) {
      setRpDone(true);
    } else {
      setRpTurn(t => t + 1);
      setRpUserText(""); setRpRevealed(false); setRpSelfScore(null);
    }
  }

  const tech = TECHNIQUES[activeTech];

  // Filtered exercise lists
  const writeList = filterTech != null
    ? WRITE_SCENARIOS.filter(e => e.techId === filterTech + 1)
    : WRITE_SCENARIOS;
  const spotList = filterTech != null
    ? SPOT_EXERCISES.filter(e => e.techId === filterTech + 1)
    : SPOT_EXERCISES;
  const udfyldList = filterTech != null
    ? UDFYLD_EXERCISES.filter(e => e.techId === filterTech + 1)
    : UDFYLD_EXERCISES;
  const valgList = filterTech != null
    ? VALG_EXERCISES.filter(e => e.techId === filterTech + 1)
    : VALG_EXERCISES;

  const currentList = exerciseType === "skriv" ? writeList
    : exerciseType === "spot" ? spotList
    : exerciseType === "udfyld" ? udfyldList
    : exerciseType === "valg" ? valgList
    : SPIN_EXERCISES;
  const total = currentList.length;

  function resetExercise() {
    setIdx(0); setChosen(null); setRevealed(false);
    setUserText(""); setGapAnswers([]); setSpinAnswers({ S: "", P: "", I: "", N: "" });
    setScore(0); setDone(false);
  }

  function switchExerciseType(t: ExerciseType) {
    setExerciseType(t); resetExercise();
  }

  function switchFilter(f: number | null) {
    setFilterTech(f); resetExercise();
  }

  function next(correct?: boolean) {
    if (correct !== undefined && correct) setScore(s => s + 1);
    if (idx + 1 >= total) { setDone(true); return; }
    setIdx(i => i + 1);
    setChosen(null); setRevealed(false);
    setUserText(""); setGapAnswers([]); setSpinAnswers({ S: "", P: "", I: "", N: "" });
  }

  // Init gap answers when exercise changes
  useEffect(() => {
    if (exerciseType === "udfyld" && udfyldList[idx]) {
      const gaps = udfyldList[idx].parts.filter(p => p.isGap);
      setGapAnswers(Array(gaps.length).fill(""));
    }
  }, [idx, exerciseType, filterTech]);

  // ── RENDER ────────────────────────────────────────────────────────────────

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <span style={{ fontSize: 26 }}>🧠</span>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#1c1917", margin: 0, letterSpacing: "-0.5px" }}>
            Forstå kunden — Top 5 teknikker
          </h1>
        </div>
        <p style={{ color: "#78716c", fontSize: 14, margin: 0 }}>
          Lær de 5 stærkeste teknikker og øv dem med 5 forskellige øvelsestyper
        </p>
      </div>

      {/* Mode toggle */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {[
          { id: "learn" as const, label: "📖 Lær teknikken", desc: "5 metoder med scripts" },
          { id: "exercises" as const, label: "🎯 Øvelser", desc: "5 øvelsestyper" },
        ].map(m => (
          <button key={m.id} onClick={() => setMode(m.id)} style={{
            padding: "10px 18px", borderRadius: 10, cursor: "pointer",
            background: mode === m.id ? "#1c1917" : "#ffffff",
            border: `2px solid ${mode === m.id ? "#1c1917" : "#e8e5e1"}`,
            color: mode === m.id ? "#ffffff" : "#78716c",
            fontSize: 14, fontWeight: 700,
          }}>
            {m.label}
            <span style={{ fontSize: 11, opacity: 0.7, marginLeft: 6 }}>{m.desc}</span>
          </button>
        ))}
      </div>

      {/* ── LEARN MODE ──────────────────────────────────────────────────────── */}
      {mode === "learn" && (
        <div>
          {/* Technique tabs */}
          <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
            {TECHNIQUES.map((t, i) => (
              <button key={t.number} onClick={() => setActiveTech(i)} style={{
                display: "flex", alignItems: "center", gap: 7,
                padding: "7px 13px", borderRadius: 9, cursor: "pointer",
                border: `2px solid ${activeTech === i ? t.color : "#e8e5e1"}`,
                background: activeTech === i ? t.colorLight : "#ffffff",
                color: activeTech === i ? "#1c1917" : "#78716c",
                fontWeight: activeTech === i ? 700 : 500, fontSize: 13,
              }}>
                <span style={{
                  width: 20, height: 20, borderRadius: "50%",
                  background: activeTech === i ? t.color : "#f5f4f2",
                  color: activeTech === i ? "#fff" : "#a8a29e",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 800, flexShrink: 0,
                }}>{t.number}</span>
                <span>{t.emoji} {t.title}</span>
              </button>
            ))}
          </div>

          {/* Technique card */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{
              background: tech.colorLight, border: `2px solid ${tech.color}40`,
              borderLeft: `5px solid ${tech.color}`, borderRadius: 14, padding: "20px 24px",
            }}>
              <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <span style={{
                  width: 42, height: 42, borderRadius: 10, background: tech.color, color: "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0,
                }}>{tech.emoji}</span>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: tech.color, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 3 }}>
                    Teknik {tech.number} af 5
                  </div>
                  <h2 style={{ fontSize: 20, fontWeight: 800, color: "#1c1917", margin: "0 0 3px" }}>{tech.title}</h2>
                  <p style={{ color: "#57534e", fontSize: 13, margin: 0, fontStyle: "italic" }}>{tech.tagline}</p>
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {[
                { icon: "📌", label: "Hvad er det?", text: tech.what },
                { icon: "⚙️", label: "Sådan gør du det", text: tech.how },
              ].map(card => (
                <div key={card.label} style={{
                  background: "#fff", border: "2px solid #e8e5e1", borderRadius: 12, padding: "16px 18px",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }}>
                    <span style={{
                      width: 22, height: 22, borderRadius: 5, background: "#f5f4f2",
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12,
                    }}>{card.icon}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#1c1917" }}>{card.label}</span>
                  </div>
                  <p style={{ color: "#57534e", fontSize: 13, lineHeight: 1.7, margin: 0 }}>{card.text}</p>
                </div>
              ))}
            </div>

            <div style={{ background: "#fff", border: "2px solid #e8e5e1", borderRadius: 12, padding: "16px 18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 12 }}>
                <span style={{
                  width: 22, height: 22, borderRadius: 5, background: tech.colorLight,
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12,
                }}>💬</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#1c1917" }}>Konkrete scripts</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {tech.scripts.map((s, i) => (
                  <div key={i} style={{
                    padding: "10px 14px", background: tech.colorLight,
                    border: `1.5px solid ${tech.color}25`, borderLeft: `4px solid ${tech.color}`,
                    borderRadius: 7,
                  }}>
                    <p style={{ color: "#1c1917", fontSize: 13, lineHeight: 1.6, margin: 0, fontStyle: "italic" }}>{s}</p>
                  </div>
                ))}
              </div>
            </div>

            <div style={{
              background: "#fffbeb", border: "1.5px solid rgba(245,158,11,0.35)",
              borderLeft: "4px solid #f59e0b", borderRadius: 10, padding: "12px 16px",
              display: "flex", gap: 10, alignItems: "flex-start",
            }}>
              <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>⚠️</span>
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, color: "#92400e", margin: "0 0 3px" }}>Typisk fejl</p>
                <p style={{ color: "#78350f", fontSize: 13, lineHeight: 1.6, margin: 0 }}>{tech.watchOut}</p>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <button onClick={() => setActiveTech(Math.max(0, activeTech - 1))} disabled={activeTech === 0}
                style={{
                  padding: "7px 14px", borderRadius: 8, cursor: activeTech === 0 ? "default" : "pointer",
                  background: "#fff", border: "1.5px solid #e8e5e1",
                  color: activeTech === 0 ? "#c4bfb8" : "#57534e", fontSize: 13, fontWeight: 600,
                }}>← Forrige</button>
              <span style={{ fontSize: 12, color: "#a8a29e" }}>{activeTech + 1} / {TECHNIQUES.length}</span>
              <button onClick={() => setActiveTech(Math.min(TECHNIQUES.length - 1, activeTech + 1))}
                disabled={activeTech === TECHNIQUES.length - 1}
                style={{
                  padding: "7px 14px", borderRadius: 8,
                  cursor: activeTech === TECHNIQUES.length - 1 ? "default" : "pointer",
                  background: "#fff", border: "1.5px solid #e8e5e1",
                  color: activeTech === TECHNIQUES.length - 1 ? "#c4bfb8" : "#57534e", fontSize: 13, fontWeight: 600,
                }}>Næste →</button>
            </div>
          </div>
        </div>
      )}

      {/* ── EXERCISE MODE ────────────────────────────────────────────────────── */}
      {mode === "exercises" && (
        <div>
          {/* Exercise type selector */}
          <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
            {([
              { id: "valg" as ExerciseType, label: "⚡ Hurtig valg", sub: "Multiple choice" },
              { id: "spot" as ExerciseType, label: "🔍 Spot fejlen", sub: "Find hvad der går galt" },
              { id: "udfyld" as ExerciseType, label: "✏️ Udfyld hullet", sub: "Færdiggør scriptet" },
              { id: "skriv" as ExerciseType, label: "✍️ Skriv dit svar", sub: "Frit svar + modelsvar" },
              { id: "spin" as ExerciseType, label: "🌀 SPIN Builder", sub: "Byg dine spørgsmål" },
              { id: "roleplay" as ExerciseType, label: "🎭 Rolespil", sub: "Spil sælgeren live" },
            ] as { id: ExerciseType; label: string; sub: string }[]).map(t => (
              <button key={t.id} onClick={() => switchExerciseType(t.id)} style={{
                padding: "8px 13px", borderRadius: 9, cursor: "pointer",
                background: exerciseType === t.id ? "#1c1917" : "#ffffff",
                border: `2px solid ${exerciseType === t.id ? "#1c1917" : "#e8e5e1"}`,
                color: exerciseType === t.id ? "#ffffff" : "#78716c",
                fontSize: 13, fontWeight: exerciseType === t.id ? 700 : 500,
                textAlign: "left",
              }}>
                <div>{t.label}</div>
                <div style={{ fontSize: 10, opacity: 0.65, marginTop: 1 }}>{t.sub}</div>
              </button>
            ))}
          </div>

          {/* Technique filter */}
          {exerciseType !== "spin" && exerciseType !== "roleplay" && (
            <div style={{ display: "flex", gap: 5, marginBottom: 18, flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ fontSize: 12, color: "#a8a29e", marginRight: 2 }}>Filter:</span>
              <button onClick={() => switchFilter(null)} style={{
                padding: "4px 10px", borderRadius: 7, cursor: "pointer", fontSize: 12,
                background: filterTech === null ? "#f59e0b" : "#ffffff",
                border: `1.5px solid ${filterTech === null ? "#f59e0b" : "#e8e5e1"}`,
                color: filterTech === null ? "#fff" : "#78716c", fontWeight: 600,
              }}>Alle</button>
              {TECHNIQUES.map((t, i) => (
                <button key={t.number} onClick={() => switchFilter(i)} style={{
                  padding: "4px 10px", borderRadius: 7, cursor: "pointer", fontSize: 12,
                  background: filterTech === i ? t.color : "#ffffff",
                  border: `1.5px solid ${filterTech === i ? t.color : "#e8e5e1"}`,
                  color: filterTech === i ? "#fff" : "#78716c", fontWeight: 600,
                }}>{t.emoji} T{t.number}</button>
              ))}
            </div>
          )}

          {/* Progress */}
          {exerciseType !== "roleplay" && !done && total > 0 && (
            <div style={{ marginBottom: 16 }}>
              <ProgressBar current={idx} total={total} color="#f59e0b" />
            </div>
          )}

          {/* ── DONE screen ── */}
          {exerciseType !== "roleplay" && done && (
            <div style={{
              background: "#f0fdf4", border: "2px solid #86efac",
              borderRadius: 14, padding: "32px 24px", textAlign: "center",
            }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🎉</div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: "#15803d", margin: "0 0 8px" }}>
                Øvelse gennemført!
              </h2>
              {exerciseType === "valg" && (
                <p style={{ color: "#166534", fontSize: 15, margin: "0 0 20px" }}>
                  Du svarede rigtigt på <strong>{score} ud af {total}</strong> spørgsmål
                </p>
              )}
              <button onClick={resetExercise} style={{
                padding: "10px 24px", borderRadius: 10, cursor: "pointer",
                background: "#16a34a", color: "#fff", border: "none",
                fontSize: 14, fontWeight: 700,
              }}>↩ Prøv igen</button>
            </div>
          )}

          {/* ── HURTIG VALG ── */}
          {!done && exerciseType === "valg" && valgList[idx] && (() => {
            const ex = valgList[idx];
            const techData = TECHNIQUES.find(t => t.number === ex.techId)!;
            return (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{
                  background: "#fff", border: "2px solid #e8e5e1",
                  borderRadius: 12, padding: "16px 20px",
                }}>
                  <TechBadge tech={techData} small />
                  <p style={{ color: "#57534e", fontSize: 13, margin: "10px 0 0", lineHeight: 1.6 }}>{ex.situation}</p>
                </div>
                <div style={{
                  background: "#f5f4f2", border: "2px solid #e8e5e1",
                  borderRadius: 10, padding: "14px 18px",
                  display: "flex", gap: 10, alignItems: "flex-start",
                }}>
                  <span style={{
                    width: 30, height: 30, borderRadius: "50%", background: "#e8e5e1",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0,
                  }}>👤</span>
                  <p style={{ color: "#1c1917", fontSize: 14, margin: 0, fontStyle: "italic", fontWeight: 500, lineHeight: 1.6 }}>
                    {ex.customerLine}
                  </p>
                </div>
                <p style={{ fontSize: 13, fontWeight: 700, color: "#57534e", margin: 0 }}>Hvad er det bedste svar?</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {ex.options.map((opt, i) => {
                    const isCorrect = i === ex.correctIndex;
                    const isChosen = i === chosen;
                    let bg = "#fff", border = "#e8e5e1", color = "#1c1917";
                    if (revealed) {
                      if (isCorrect) { bg = "#f0fdf4"; border = "#16a34a"; color = "#15803d"; }
                      else if (isChosen && !isCorrect) { bg = "#fef2f2"; border = "#ef4444"; color = "#dc2626"; }
                    } else if (isChosen) { bg = "#fffbeb"; border = "#f59e0b"; color = "#92400e"; }
                    return (
                      <button key={i} onClick={() => { if (!revealed) { setChosen(i); } }} style={{
                        padding: "12px 16px", borderRadius: 9, cursor: revealed ? "default" : "pointer",
                        background: bg, border: `2px solid ${border}`, color,
                        textAlign: "left", fontSize: 13, lineHeight: 1.6, fontWeight: isChosen || (revealed && isCorrect) ? 600 : 400,
                        display: "flex", gap: 10, alignItems: "flex-start",
                      }}>
                        <span style={{
                          width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                          background: revealed && isCorrect ? "#16a34a" : revealed && isChosen ? "#ef4444" : "#f5f4f2",
                          color: revealed && (isCorrect || isChosen) ? "#fff" : "#a8a29e",
                          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800,
                        }}>{revealed && isCorrect ? "✓" : revealed && isChosen && !isCorrect ? "✕" : String.fromCharCode(65 + i)}</span>
                        <span>{opt}</span>
                      </button>
                    );
                  })}
                </div>
                {chosen !== null && !revealed && (
                  <button onClick={() => setRevealed(true)} style={{
                    alignSelf: "flex-end", padding: "9px 20px", borderRadius: 9, cursor: "pointer",
                    background: "#f59e0b", color: "#fff", border: "none", fontSize: 13, fontWeight: 700,
                  }}>Tjek svar →</button>
                )}
                {revealed && (
                  <div style={{
                    background: chosen === ex.correctIndex ? "#f0fdf4" : "#fef2f2",
                    border: `2px solid ${chosen === ex.correctIndex ? "#86efac" : "#fca5a5"}`,
                    borderRadius: 12, padding: "14px 18px",
                  }}>
                    <p style={{ fontSize: 13, fontWeight: 800, color: chosen === ex.correctIndex ? "#15803d" : "#dc2626", margin: "0 0 6px" }}>
                      {chosen === ex.correctIndex ? "✓ Korrekt!" : "✕ Ikke helt — se forklaringen"}
                    </p>
                    <p style={{ color: "#374151", fontSize: 13, lineHeight: 1.7, margin: "0 0 10px" }}>{ex.explanation}</p>
                    {revealed && ex.whyWrong.some(w => w !== null) && (
                      <div style={{ paddingTop: 8, borderTop: "1px solid #e8e5e1" }}>
                        <p style={{ fontSize: 11, fontWeight: 700, color: "#a8a29e", textTransform: "uppercase", margin: "0 0 6px" }}>Hvorfor de andre er forkerte:</p>
                        {ex.options.map((opt, i) => ex.whyWrong[i] && (
                          <div key={i} style={{ display: "flex", gap: 8, marginBottom: 4 }}>
                            <span style={{ fontSize: 12, color: "#a8a29e", flexShrink: 0 }}>{String.fromCharCode(65 + i)}:</span>
                            <span style={{ fontSize: 12, color: "#78716c" }}>{ex.whyWrong[i]}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <button onClick={() => next(chosen === ex.correctIndex)} style={{
                      marginTop: 12, padding: "9px 20px", borderRadius: 9, cursor: "pointer",
                      background: "#1c1917", color: "#fff", border: "none", fontSize: 13, fontWeight: 700,
                    }}>{idx + 1 < total ? "Næste →" : "Se resultat"}</button>
                  </div>
                )}
              </div>
            );
          })()}

          {/* ── SPOT FEJLEN ── */}
          {!done && exerciseType === "spot" && spotList[idx] && (() => {
            const ex = spotList[idx];
            const techData = TECHNIQUES.find(t => t.number === ex.techId)!;
            return (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{
                  background: "#fff", border: "2px solid #e8e5e1",
                  borderRadius: 12, padding: "16px 20px",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <TechBadge tech={techData} small />
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#1c1917" }}>{ex.title}</span>
                  </div>
                  <p style={{ fontSize: 12, fontWeight: 700, color: "#a8a29e", textTransform: "uppercase", margin: "0 0 10px" }}>Samtale</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {ex.conversation.map((line, i) => (
                      <div key={i} style={{
                        display: "flex", gap: 10, alignItems: "flex-start",
                        flexDirection: line.role === "salg" ? "row-reverse" : "row",
                      }}>
                        <span style={{
                          width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                          background: line.role === "salg" ? "#f59e0b" : "#e8e5e1",
                          color: line.role === "salg" ? "#fff" : "#78716c",
                          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12,
                        }}>{line.role === "salg" ? "💼" : "👤"}</span>
                        <div style={{
                          padding: "10px 14px", borderRadius: 9, maxWidth: "80%",
                          background: line.role === "salg" ? "#fffbeb" : "#f5f4f2",
                          border: `1.5px solid ${line.role === "salg" ? "rgba(245,158,11,0.3)" : "#e8e5e1"}`,
                        }}>
                          <p style={{ fontSize: 12, fontWeight: 700, color: line.role === "salg" ? "#92400e" : "#78716c", margin: "0 0 3px" }}>
                            {line.role === "salg" ? "Sælger" : "Kunde"}
                          </p>
                          <p style={{ color: "#1c1917", fontSize: 13, margin: 0, lineHeight: 1.5 }}>{line.line}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <p style={{ fontSize: 13, fontWeight: 700, color: "#1c1917", margin: 0 }}>{ex.question}</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  {ex.options.map((opt, i) => {
                    const isCorrect = i === ex.correctIndex;
                    const isChosen = i === chosen;
                    let bg = "#fff", border = "#e8e5e1", color = "#1c1917";
                    if (revealed) {
                      if (isCorrect) { bg = "#f0fdf4"; border = "#16a34a"; color = "#15803d"; }
                      else if (isChosen && !isCorrect) { bg = "#fef2f2"; border = "#ef4444"; color = "#dc2626"; }
                    } else if (isChosen) { bg = "#fffbeb"; border = "#f59e0b"; color = "#92400e"; }
                    return (
                      <button key={i} onClick={() => { if (!revealed) setChosen(i); }} style={{
                        padding: "11px 15px", borderRadius: 8, cursor: revealed ? "default" : "pointer",
                        background: bg, border: `2px solid ${border}`, color,
                        textAlign: "left", fontSize: 13, lineHeight: 1.5, fontWeight: isChosen || (revealed && isCorrect) ? 600 : 400,
                        display: "flex", gap: 9, alignItems: "center",
                      }}>
                        <span style={{
                          width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
                          background: revealed && isCorrect ? "#16a34a" : revealed && isChosen ? "#ef4444" : "#f5f4f2",
                          color: revealed && (isCorrect || isChosen) ? "#fff" : "#a8a29e",
                          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800,
                        }}>{revealed && isCorrect ? "✓" : revealed && isChosen && !isCorrect ? "✕" : String.fromCharCode(65 + i)}</span>
                        {opt}
                      </button>
                    );
                  })}
                </div>
                {chosen !== null && !revealed && (
                  <button onClick={() => setRevealed(true)} style={{
                    alignSelf: "flex-end", padding: "9px 20px", borderRadius: 9, cursor: "pointer",
                    background: "#f59e0b", color: "#fff", border: "none", fontSize: 13, fontWeight: 700,
                  }}>Tjek svar →</button>
                )}
                {revealed && (
                  <div style={{
                    background: "#f0fdf4", border: "2px solid #86efac",
                    borderLeft: "5px solid #16a34a", borderRadius: 12, padding: "14px 18px",
                  }}>
                    <p style={{ fontSize: 13, fontWeight: 800, color: "#15803d", margin: "0 0 6px" }}>💡 Forklaring</p>
                    <p style={{ color: "#374151", fontSize: 13, lineHeight: 1.7, margin: "0 0 10px" }}>{ex.explanation}</p>
                    <button onClick={() => next(chosen === ex.correctIndex)} style={{
                      padding: "8px 18px", borderRadius: 8, cursor: "pointer",
                      background: "#16a34a", color: "#fff", border: "none", fontSize: 13, fontWeight: 700,
                    }}>{idx + 1 < total ? "Næste →" : "Se resultat"}</button>
                  </div>
                )}
              </div>
            );
          })()}

          {/* ── UDFYLD HULLET ── */}
          {!done && exerciseType === "udfyld" && udfyldList[idx] && (() => {
            const ex = udfyldList[idx];
            const techData = TECHNIQUES.find(t => t.number === ex.techId)!;
            const gapParts = ex.parts.filter(p => p.isGap);
            const gapCount = gapParts.length;
            const allFilled = gapAnswers.length === gapCount && gapAnswers.every(g => g.trim().length > 0);
            let gapIdx = 0;
            return (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{
                  background: "#fff", border: "2px solid #e8e5e1", borderRadius: 12, padding: "16px 20px",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <TechBadge tech={techData} small />
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#1c1917" }}>{ex.intro}</span>
                  </div>
                  <div style={{
                    background: techData.colorLight, border: `1.5px solid ${techData.color}30`,
                    borderLeft: `4px solid ${techData.color}`, borderRadius: 8, padding: "10px 14px",
                  }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: techData.color, margin: "0 0 4px", textTransform: "uppercase" }}>Situation</p>
                    <p style={{ color: "#57534e", fontSize: 13, lineHeight: 1.6, margin: 0 }}>{ex.setup}</p>
                  </div>
                </div>

                <div style={{ background: "#fff", border: "2px solid #e8e5e1", borderRadius: 12, padding: "18px 20px" }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: "#a8a29e", textTransform: "uppercase", margin: "0 0 12px" }}>
                    Udfyld de manglende dele i scriptet:
                  </p>
                  <div style={{ fontSize: 14, lineHeight: 2.2, color: "#1c1917" }}>
                    {ex.parts.map((part, i) => {
                      if (!part.isGap) return <span key={i}>{part.text}</span>;
                      const gi = gapIdx++;
                      const isRevealed = revealed;
                      const userVal = gapAnswers[gi] || "";
                      return (
                        <span key={i} style={{ position: "relative", display: "inline-block", verticalAlign: "middle", margin: "0 2px" }}>
                          {!isRevealed ? (
                            <input
                              ref={el => { inputRefs.current[gi] = el; }}
                              value={userVal}
                              onChange={e => {
                                const newArr = [...gapAnswers];
                                newArr[gi] = e.target.value;
                                setGapAnswers(newArr);
                              }}
                              placeholder="..."
                              style={{
                                padding: "3px 8px", borderRadius: 5, fontSize: 13,
                                border: `2px solid ${techData.color}60`,
                                background: techData.colorLight,
                                color: "#1c1917", minWidth: 140,
                                fontFamily: "inherit", outline: "none",
                              }}
                            />
                          ) : (
                            <span style={{
                              padding: "2px 10px", borderRadius: 5, fontSize: 13, fontWeight: 700,
                              background: "#f0fdf4", border: "2px solid #86efac", color: "#15803d",
                            }}>{part.answer}</span>
                          )}
                        </span>
                      );
                    })}
                  </div>
                  {!revealed && (
                    <p style={{ fontSize: 12, color: "#a8a29e", margin: "12px 0 0", fontStyle: "italic" }}>
                      💡 Hint: {ex.hint}
                    </p>
                  )}
                </div>

                {!revealed && (
                  <button onClick={() => setRevealed(true)} disabled={!allFilled} style={{
                    alignSelf: "flex-end", padding: "9px 20px", borderRadius: 9,
                    cursor: allFilled ? "pointer" : "default",
                    background: allFilled ? "#f59e0b" : "#f5f4f2",
                    color: allFilled ? "#fff" : "#a8a29e",
                    border: "none", fontSize: 13, fontWeight: 700,
                  }}>Vis svar →</button>
                )}
                {revealed && (
                  <div style={{
                    background: "#f0fdf4", border: "2px solid #86efac",
                    borderLeft: "5px solid #16a34a", borderRadius: 12, padding: "14px 18px",
                  }}>
                    <p style={{ fontSize: 13, fontWeight: 800, color: "#15803d", margin: "0 0 6px" }}>💡 Forklaring</p>
                    <p style={{ color: "#374151", fontSize: 13, lineHeight: 1.7, margin: "0 0 10px" }}>{ex.explanation}</p>
                    <button onClick={() => next()} style={{
                      padding: "8px 18px", borderRadius: 8, cursor: "pointer",
                      background: "#16a34a", color: "#fff", border: "none", fontSize: 13, fontWeight: 700,
                    }}>{idx + 1 < total ? "Næste →" : "Afslut"}</button>
                  </div>
                )}
              </div>
            );
          })()}

          {/* ── SKRIV DIT SVAR ── */}
          {!done && exerciseType === "skriv" && writeList[idx] && (() => {
            const ex = writeList[idx];
            const techData = TECHNIQUES.find(t => t.number === ex.techId)!;
            return (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ background: "#fff", border: "2px solid #e8e5e1", borderRadius: 12, padding: "16px 20px" }}>
                  <TechBadge tech={techData} small />
                  <p style={{ color: "#57534e", fontSize: 13, lineHeight: 1.6, margin: "10px 0 0" }}>{ex.setup}</p>
                </div>
                <div style={{
                  background: "#f5f4f2", border: "2px solid #e8e5e1", borderRadius: 10, padding: "14px 18px",
                  display: "flex", gap: 10, alignItems: "flex-start",
                }}>
                  <span style={{
                    width: 30, height: 30, borderRadius: "50%", background: "#e8e5e1",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0,
                  }}>👤</span>
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 700, color: "#a8a29e", textTransform: "uppercase", margin: "0 0 4px" }}>Kunden siger</p>
                    <p style={{ color: "#1c1917", fontSize: 14, margin: 0, fontStyle: "italic", fontWeight: 500, lineHeight: 1.6 }}>{ex.customerLine}</p>
                  </div>
                </div>
                <div style={{
                  background: techData.colorLight, border: `1.5px solid ${techData.color}40`,
                  borderLeft: `4px solid ${techData.color}`, borderRadius: 9, padding: "12px 16px",
                }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: techData.color, textTransform: "uppercase", margin: "0 0 4px" }}>Din opgave</p>
                  <p style={{ color: "#1c1917", fontSize: 13, lineHeight: 1.6, margin: 0, fontWeight: 500 }}>{ex.task}</p>
                </div>
                {!revealed ? (
                  <div style={{ background: "#fff", border: "2px solid #e8e5e1", borderRadius: 12, padding: "16px 18px" }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "#1c1917", margin: "0 0 8px" }}>Hvad siger du?</p>
                    <textarea
                      value={userText} onChange={e => setUserText(e.target.value)}
                      placeholder="Skriv dit svar her..." rows={4}
                      style={{
                        width: "100%", padding: "10px 12px", borderRadius: 7,
                        border: "1.5px solid #e8e5e1", background: "#fafaf9",
                        color: "#1c1917", fontSize: 13, lineHeight: 1.6,
                        resize: "vertical", fontFamily: "inherit",
                        boxSizing: "border-box", outline: "none",
                      }}
                    />
                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
                      <button onClick={() => setRevealed(true)} style={{
                        padding: "9px 18px", borderRadius: 8, cursor: "pointer",
                        background: techData.color, color: "#fff", border: "none", fontSize: 13, fontWeight: 700,
                      }}>Vis modelsvar →</button>
                    </div>
                  </div>
                ) : (
                  <>
                    {userText.trim() && (
                      <div style={{ background: "#fff", border: "2px solid #e8e5e1", borderRadius: 10, padding: "14px 16px" }}>
                        <p style={{ fontSize: 11, fontWeight: 700, color: "#a8a29e", textTransform: "uppercase", margin: "0 0 6px" }}>Dit svar</p>
                        <p style={{ color: "#57534e", fontSize: 13, lineHeight: 1.6, margin: 0, fontStyle: "italic" }}>{userText}</p>
                      </div>
                    )}
                    <div style={{
                      background: "#f0fdf4", border: "2px solid #86efac",
                      borderLeft: "5px solid #16a34a", borderRadius: 12, padding: "16px 18px",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }}>
                        <span style={{ width: 22, height: 22, borderRadius: 5, background: "#16a34a", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>✓</span>
                        <p style={{ fontSize: 13, fontWeight: 700, color: "#15803d", margin: 0 }}>Modelsvar</p>
                      </div>
                      <p style={{ color: "#1c1917", fontSize: 14, lineHeight: 1.7, margin: "0 0 12px", fontStyle: "italic" }}>{ex.modelAnswer}</p>
                      <div style={{ paddingTop: 10, borderTop: "1px solid #86efac40", display: "flex", gap: 7, alignItems: "flex-start" }}>
                        <span style={{ fontSize: 13, flexShrink: 0 }}>💡</span>
                        <p style={{ color: "#166534", fontSize: 12, lineHeight: 1.6, margin: 0 }}><strong>Tip:</strong> {ex.tip}</p>
                      </div>
                      <button onClick={() => next()} style={{
                        marginTop: 12, padding: "8px 18px", borderRadius: 8, cursor: "pointer",
                        background: "#16a34a", color: "#fff", border: "none", fontSize: 13, fontWeight: 700,
                      }}>{idx + 1 < total ? "Næste →" : "Afslut"}</button>
                    </div>
                  </>
                )}
              </div>
            );
          })()}

          {/* ── SPIN BUILDER ── */}
          {!done && exerciseType === "spin" && SPIN_EXERCISES[idx] && (() => {
            const ex = SPIN_EXERCISES[idx];
            const spinKeys: (keyof typeof spinAnswers)[] = ["S", "P", "I", "N"];
            const spinLabels = {
              S: { label: "Situation", color: "#f59e0b", desc: "Kortlæg nuværende fakta og setup" },
              P: { label: "Problem", color: "#ef4444", desc: "Find den specifikke frustration eller udfordring" },
              I: { label: "Implication", color: "#8b5cf6", desc: "Uddyb konsekvensen — hvad koster problemet dem?" },
              N: { label: "Need-Payoff", color: "#10b981", desc: "Lad kunden selv formulere værdien af løsningen" },
            };
            const allSpinFilled = spinKeys.every(k => spinAnswers[k].trim().length > 0);
            return (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{
                  background: "#fff", border: "2px solid #e8e5e1", borderRadius: 12, padding: "16px 20px",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <span style={{
                      padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 800,
                      background: "#eff6ff", color: "#1d4ed8", border: "1.5px solid #bfdbfe",
                    }}>🌀 SPIN Selling</span>
                  </div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "#57534e", margin: "0 0 6px" }}>Situation:</p>
                  <p style={{ color: "#1c1917", fontSize: 14, lineHeight: 1.6, margin: "0 0 10px" }}>{ex.situation}</p>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    <div style={{ background: "#f5f4f2", borderRadius: 7, padding: "8px 12px", flex: 1, minWidth: 140 }}>
                      <p style={{ fontSize: 11, fontWeight: 700, color: "#78716c", margin: "0 0 2px" }}>Kunde</p>
                      <p style={{ fontSize: 13, color: "#1c1917", margin: 0 }}>{ex.customer}</p>
                    </div>
                    <div style={{ background: "#f5f4f2", borderRadius: 7, padding: "8px 12px", flex: 1, minWidth: 140 }}>
                      <p style={{ fontSize: 11, fontWeight: 700, color: "#78716c", margin: "0 0 2px" }}>Produkt</p>
                      <p style={{ fontSize: 13, color: "#1c1917", margin: 0 }}>{ex.product}</p>
                    </div>
                  </div>
                </div>

                <p style={{ fontSize: 13, fontWeight: 700, color: "#1c1917", margin: 0 }}>
                  Skriv dit bedste SPIN-spørgsmål for hvert trin:
                </p>

                {spinKeys.map(key => {
                  const meta = spinLabels[key];
                  return (
                    <div key={key} style={{
                      background: "#fff", border: "2px solid #e8e5e1", borderRadius: 11,
                      borderLeft: `5px solid ${meta.color}`, overflow: "hidden",
                    }}>
                      <div style={{
                        padding: "10px 16px", borderBottom: "1px solid #f0ede9",
                        background: `${meta.color}10`,
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{
                            width: 22, height: 22, borderRadius: 5, background: meta.color, color: "#fff",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 11, fontWeight: 800,
                          }}>{key}</span>
                          <span style={{ fontSize: 13, fontWeight: 700, color: "#1c1917" }}>{meta.label}</span>
                        </div>
                        <span style={{ fontSize: 11, color: "#78716c" }}>{meta.desc}</span>
                      </div>
                      <div style={{ padding: "12px 16px" }}>
                        {!revealed ? (
                          <textarea
                            value={spinAnswers[key]}
                            onChange={e => setSpinAnswers(prev => ({ ...prev, [key]: e.target.value }))}
                            placeholder={`Skriv dit ${meta.label}-spørgsmål...`}
                            rows={2}
                            style={{
                              width: "100%", padding: "8px 10px", borderRadius: 7,
                              border: `1.5px solid ${spinAnswers[key].trim() ? meta.color + "60" : "#e8e5e1"}`,
                              background: spinAnswers[key].trim() ? `${meta.color}08` : "#fafaf9",
                              color: "#1c1917", fontSize: 13, lineHeight: 1.5,
                              resize: "vertical", fontFamily: "inherit",
                              boxSizing: "border-box", outline: "none",
                            }}
                          />
                        ) : (
                          <div>
                            {spinAnswers[key].trim() && (
                              <div style={{
                                marginBottom: 8, padding: "8px 12px", borderRadius: 7,
                                background: "#f5f4f2", border: "1.5px solid #e8e5e1",
                              }}>
                                <p style={{ fontSize: 11, fontWeight: 700, color: "#a8a29e", margin: "0 0 3px" }}>Dit svar</p>
                                <p style={{ color: "#57534e", fontSize: 13, margin: 0, fontStyle: "italic" }}>{spinAnswers[key]}</p>
                              </div>
                            )}
                            <div style={{
                              padding: "10px 12px", borderRadius: 7,
                              background: `${meta.color}10`, border: `1.5px solid ${meta.color}40`,
                            }}>
                              <p style={{ fontSize: 11, fontWeight: 700, color: meta.color, margin: "0 0 3px" }}>Modelsvar</p>
                              <p style={{ color: "#1c1917", fontSize: 13, lineHeight: 1.6, margin: "0 0 6px", fontStyle: "italic" }}>
                                {ex.model[key]}
                              </p>
                              <p style={{ fontSize: 11, color: "#78716c", margin: 0 }}>
                                💡 {ex.tips[key]}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {!revealed ? (
                  <button onClick={() => setRevealed(true)} disabled={!allSpinFilled} style={{
                    alignSelf: "flex-end", padding: "10px 20px", borderRadius: 9,
                    cursor: allSpinFilled ? "pointer" : "default",
                    background: allSpinFilled ? "#f59e0b" : "#f5f4f2",
                    color: allSpinFilled ? "#fff" : "#a8a29e",
                    border: "none", fontSize: 13, fontWeight: 700,
                  }}>Vis modelsvar →</button>
                ) : (
                  <button onClick={() => next()} style={{
                    alignSelf: "flex-end", padding: "10px 20px", borderRadius: 9, cursor: "pointer",
                    background: "#1c1917", color: "#fff", border: "none", fontSize: 13, fontWeight: 700,
                  }}>{idx + 1 < total ? "Næste SPIN →" : "Afslut"}</button>
                )}
              </div>
            );
          })()}

          {/* ── ROLEPLAY ── */}
          {exerciseType === "roleplay" && (() => {
            const diffColor = { "Let": "#16a34a", "Medium": "#f59e0b", "Svær": "#ef4444" };

            // Scenario selection screen
            if (rpScenario === null) return (
              <div>
                <p style={{ fontSize: 14, color: "#57534e", marginBottom: 16, lineHeight: 1.6 }}>
                  Vælg et scenarie og spil sælgeren. Du skriver dine svar, modtager feedback efter hvert trin og vurderer dig selv. Der er ingen rigtige eller forkerte svar — kun læring.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {ROLEPLAY_SCENARIOS.map((sc, i) => (
                    <button key={sc.id} onClick={() => startRoleplay(i)} style={{
                      background: "#fff", border: "2px solid #e8e5e1",
                      borderLeft: `5px solid ${sc.color}`,
                      borderRadius: 12, padding: "18px 20px", cursor: "pointer", textAlign: "left",
                      transition: "border-color 0.15s",
                    }}
                      onMouseEnter={e => (e.currentTarget.style.borderColor = sc.color)}
                      onMouseLeave={e => (e.currentTarget.style.borderColor = "#e8e5e1")}
                    >
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 8 }}>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                            <span style={{ fontSize: 15, fontWeight: 800, color: "#1c1917" }}>{sc.title}</span>
                            <span style={{
                              fontSize: 10, fontWeight: 800, padding: "2px 7px", borderRadius: 99,
                              background: `${diffColor[sc.difficulty]}15`,
                              color: diffColor[sc.difficulty],
                              border: `1.5px solid ${diffColor[sc.difficulty]}40`,
                            }}>{sc.difficulty}</span>
                          </div>
                          <p style={{ color: "#78716c", fontSize: 13, margin: 0 }}>{sc.description}</p>
                        </div>
                        <span style={{
                          background: sc.colorLight, color: sc.color,
                          border: `1.5px solid ${sc.color}40`,
                          borderRadius: 8, padding: "6px 12px",
                          fontSize: 13, fontWeight: 700, whiteSpace: "nowrap", flexShrink: 0,
                        }}>Start →</span>
                      </div>
                      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 12, color: "#a8a29e" }}>👤 {sc.customer.name}, {sc.customer.role}</span>
                        <span style={{ fontSize: 12, color: "#a8a29e" }}>🏢 {sc.customer.company}</span>
                        <span style={{ fontSize: 12, color: "#a8a29e" }}>📦 {sc.product}</span>
                        <span style={{ fontSize: 12, color: "#a8a29e" }}>🎯 {sc.turns.length} vendinger</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            );

            const sc = ROLEPLAY_SCENARIOS[rpScenario];
            const currentTurn = sc.turns[rpTurn];

            // Done screen
            if (rpDone) {
              const goodCount = rpHistory.filter(h => h.selfScore === "good").length;
              const okCount = rpHistory.filter(h => h.selfScore === "ok").length;
              return (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div style={{
                    background: sc.colorLight, border: `2px solid ${sc.color}40`,
                    borderRadius: 12, padding: "20px 24px", textAlign: "center",
                  }}>
                    <div style={{ fontSize: 36, marginBottom: 8 }}>🎭</div>
                    <h2 style={{ fontSize: 18, fontWeight: 800, color: "#1c1917", margin: "0 0 6px" }}>
                      Scenarie afsluttet!
                    </h2>
                    <p style={{ color: "#57534e", fontSize: 13, margin: "0 0 14px" }}>
                      {sc.title} — {sc.customer.name}
                    </p>
                    <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                      <span style={{ padding: "6px 14px", borderRadius: 99, background: "#f0fdf4", color: "#15803d", fontSize: 13, fontWeight: 700, border: "1.5px solid #86efac" }}>
                        ✓ Ramte det: {goodCount}
                      </span>
                      <span style={{ padding: "6px 14px", borderRadius: 99, background: "#fffbeb", color: "#92400e", fontSize: 13, fontWeight: 700, border: "1.5px solid rgba(245,158,11,0.4)" }}>
                        ~ Nogenlunde: {okCount}
                      </span>
                      <span style={{ padding: "6px 14px", borderRadius: 99, background: "#fef2f2", color: "#dc2626", fontSize: 13, fontWeight: 700, border: "1.5px solid #fca5a5" }}>
                        ✕ Missede: {rpHistory.filter(h => h.selfScore === "miss").length}
                      </span>
                    </div>
                  </div>

                  {/* Full transcript */}
                  <div style={{ background: "#fff", border: "2px solid #e8e5e1", borderRadius: 12, padding: "18px 20px" }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "#1c1917", margin: "0 0 14px" }}>Hele samtalen:</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                      {sc.turns.map((turn, i) => {
                        const hist = rpHistory[i];
                        const scoreColor = hist?.selfScore === "good" ? "#16a34a" : hist?.selfScore === "ok" ? "#f59e0b" : "#ef4444";
                        const scoreBg = hist?.selfScore === "good" ? "#f0fdf4" : hist?.selfScore === "ok" ? "#fffbeb" : "#fef2f2";
                        const scoreLabel = hist?.selfScore === "good" ? "✓ Ramte det" : hist?.selfScore === "ok" ? "~ Nogenlunde" : "✕ Missede";
                        return (
                          <div key={i} style={{ borderBottom: i < sc.turns.length - 1 ? "1px solid #f0ede9" : "none", paddingBottom: i < sc.turns.length - 1 ? 14 : 0 }}>
                            <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                              <span style={{ width: 24, height: 24, borderRadius: "50%", background: "#e8e5e1", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, flexShrink: 0 }}>👤</span>
                              <p style={{ color: "#57534e", fontSize: 13, fontStyle: "italic", margin: 0, lineHeight: 1.5 }}>{turn.customerLine}</p>
                            </div>
                            {hist && (
                              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginBottom: 6 }}>
                                <div style={{ display: "flex", gap: 6, alignItems: "flex-start", maxWidth: "80%" }}>
                                  {hist.selfScore && (
                                    <span style={{ padding: "2px 8px", borderRadius: 99, fontSize: 10, fontWeight: 800, background: scoreBg, color: scoreColor, border: `1.5px solid ${scoreColor}40`, flexShrink: 0, alignSelf: "center" }}>{scoreLabel}</span>
                                  )}
                                  <div style={{ background: "#fffbeb", border: "1.5px solid rgba(245,158,11,0.3)", borderRadius: 9, padding: "8px 12px" }}>
                                    <p style={{ color: "#1c1917", fontSize: 13, margin: 0, lineHeight: 1.5, fontStyle: "italic" }}>{hist.userText || "(intet svar skrevet)"}</p>
                                  </div>
                                  <span style={{ width: 24, height: 24, borderRadius: "50%", background: "#f59e0b", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, flexShrink: 0 }}>💼</span>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 10 }}>
                    <button onClick={() => startRoleplay(rpScenario)} style={{
                      flex: 1, padding: "10px", borderRadius: 9, cursor: "pointer",
                      background: sc.color, color: "#fff", border: "none", fontSize: 13, fontWeight: 700,
                    }}>↩ Prøv igen</button>
                    <button onClick={() => setRpScenario(null)} style={{
                      flex: 1, padding: "10px", borderRadius: 9, cursor: "pointer",
                      background: "#fff", border: "2px solid #e8e5e1", color: "#57534e", fontSize: 13, fontWeight: 600,
                    }}>← Vælg andet scenarie</button>
                  </div>
                </div>
              );
            }

            // Active conversation
            return (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

                {/* Scenario header */}
                <div style={{
                  background: sc.colorLight, border: `2px solid ${sc.color}40`,
                  borderRadius: 11, padding: "12px 16px",
                  display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
                }}>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 800, color: sc.color, margin: "0 0 2px" }}>{sc.title}</p>
                    <p style={{ fontSize: 12, color: "#78716c", margin: 0 }}>
                      {sc.customer.name} · {sc.customer.role} · {sc.customer.company}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <span style={{ fontSize: 12, color: "#a8a29e" }}>Vending {rpTurn + 1}/{sc.turns.length}</span>
                    <button onClick={() => setRpScenario(null)} style={{
                      padding: "5px 10px", borderRadius: 7, cursor: "pointer",
                      background: "#fff", border: "1.5px solid #e8e5e1", color: "#78716c", fontSize: 11, fontWeight: 600,
                    }}>✕</button>
                  </div>
                </div>

                {/* Progress */}
                <div style={{ display: "flex", gap: 4 }}>
                  {sc.turns.map((_, i) => (
                    <div key={i} style={{
                      height: 5, flex: 1, borderRadius: 3,
                      background: i < rpTurn ? sc.color : i === rpTurn ? `${sc.color}60` : "#e8e5e1",
                    }} />
                  ))}
                </div>

                {/* Conversation history */}
                {rpHistory.length > 0 && (
                  <div style={{
                    background: "#fafaf9", border: "1.5px solid #e8e5e1",
                    borderRadius: 10, padding: "14px 16px",
                    display: "flex", flexDirection: "column", gap: 10,
                    maxHeight: 260, overflowY: "auto",
                  }}>
                    {rpHistory.map((hist, i) => {
                      const prevTurn = sc.turns[i];
                      return (
                        <div key={i} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                          {/* Customer bubble */}
                          <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                            <span style={{ width: 26, height: 26, borderRadius: "50%", background: "#e8e5e1", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, flexShrink: 0 }}>👤</span>
                            <div style={{ background: "#fff", border: "1.5px solid #e8e5e1", borderRadius: 9, padding: "8px 12px", maxWidth: "80%" }}>
                              <p style={{ color: "#57534e", fontSize: 12, margin: 0, fontStyle: "italic", lineHeight: 1.5 }}>{prevTurn.customerLine}</p>
                            </div>
                          </div>
                          {/* Salesperson bubble */}
                          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", alignItems: "flex-start" }}>
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, maxWidth: "78%" }}>
                              {hist.selfScore && (
                                <span style={{
                                  fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 99,
                                  background: hist.selfScore === "good" ? "#f0fdf4" : hist.selfScore === "ok" ? "#fffbeb" : "#fef2f2",
                                  color: hist.selfScore === "good" ? "#15803d" : hist.selfScore === "ok" ? "#92400e" : "#dc2626",
                                  border: `1.5px solid ${hist.selfScore === "good" ? "#86efac" : hist.selfScore === "ok" ? "rgba(245,158,11,0.4)" : "#fca5a5"}`,
                                }}>
                                  {hist.selfScore === "good" ? "✓ Ramte det" : hist.selfScore === "ok" ? "~ Nogenlunde" : "✕ Missede"}
                                </span>
                              )}
                              <div style={{ background: "#fffbeb", border: "1.5px solid rgba(245,158,11,0.35)", borderRadius: 9, padding: "8px 12px" }}>
                                <p style={{ color: "#1c1917", fontSize: 12, margin: 0, lineHeight: 1.5, fontStyle: "italic" }}>
                                  {hist.userText || <span style={{ color: "#a8a29e" }}>(intet skrevet)</span>}
                                </p>
                              </div>
                            </div>
                            <span style={{ width: 26, height: 26, borderRadius: "50%", background: "#f59e0b", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, flexShrink: 0 }}>💼</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Current customer line */}
                <div style={{
                  background: "#f5f4f2", border: "2px solid #e8e5e1",
                  borderRadius: 11, padding: "14px 16px",
                  display: "flex", gap: 10, alignItems: "flex-start",
                }}>
                  <span style={{ width: 32, height: 32, borderRadius: "50%", background: "#e8e5e1", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>👤</span>
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 700, color: "#a8a29e", textTransform: "uppercase", margin: "0 0 5px" }}>{sc.customer.name}</p>
                    <p style={{ color: "#1c1917", fontSize: 14, fontStyle: "italic", fontWeight: 500, margin: 0, lineHeight: 1.6 }}>
                      {currentTurn.customerLine}
                    </p>
                  </div>
                </div>

                {/* Tech hint */}
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 11, color: "#a8a29e" }}>Hint:</span>
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: "2px 9px", borderRadius: 99,
                    background: sc.colorLight, color: sc.color, border: `1.5px solid ${sc.color}40`,
                  }}>{currentTurn.techHint}</span>
                  <span style={{ fontSize: 12, color: "#a8a29e" }}>— {currentTurn.context}</span>
                </div>

                {/* Input area */}
                {!rpRevealed ? (
                  <div style={{ background: "#fff", border: "2px solid #e8e5e1", borderRadius: 11, padding: "14px 16px" }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 10 }}>
                      <span style={{ width: 32, height: 32, borderRadius: "50%", background: "#f59e0b", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>💼</span>
                      <p style={{ fontSize: 12, fontWeight: 700, color: "#92400e", margin: 0, alignSelf: "center" }}>Dit svar som sælger:</p>
                    </div>
                    <textarea
                      value={rpUserText}
                      onChange={e => setRpUserText(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter" && e.ctrlKey) submitRpTurn(); }}
                      placeholder="Skriv hvad du ville sige... (Ctrl+Enter for at indsende)"
                      rows={4}
                      style={{
                        width: "100%", padding: "10px 12px", borderRadius: 8,
                        border: "1.5px solid #e8e5e1", background: "#fafaf9",
                        color: "#1c1917", fontSize: 13, lineHeight: 1.6,
                        resize: "vertical", fontFamily: "inherit",
                        boxSizing: "border-box", outline: "none",
                      }}
                    />
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                      <span style={{ fontSize: 11, color: "#a8a29e" }}>Ctrl+Enter for at indsende</span>
                      <button onClick={submitRpTurn} disabled={!rpUserText.trim()} style={{
                        padding: "9px 18px", borderRadius: 8, cursor: rpUserText.trim() ? "pointer" : "default",
                        background: rpUserText.trim() ? sc.color : "#f5f4f2",
                        color: rpUserText.trim() ? "#fff" : "#a8a29e",
                        border: "none", fontSize: 13, fontWeight: 700,
                      }}>Se feedback →</button>
                    </div>
                  </div>
                ) : (
                  /* Feedback panel */
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

                    {/* User's answer */}
                    <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", alignItems: "flex-start" }}>
                      <div style={{ background: "#fffbeb", border: "1.5px solid rgba(245,158,11,0.4)", borderRadius: 9, padding: "10px 14px", maxWidth: "82%" }}>
                        <p style={{ fontSize: 11, fontWeight: 700, color: "#92400e", margin: "0 0 4px" }}>Dit svar</p>
                        <p style={{ color: "#1c1917", fontSize: 13, margin: 0, lineHeight: 1.5, fontStyle: "italic" }}>{rpUserText || "(intet skrevet)"}</p>
                      </div>
                      <span style={{ width: 32, height: 32, borderRadius: "50%", background: "#f59e0b", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>💼</span>
                    </div>

                    {/* Feedback */}
                    <div style={{ background: "#f0fdf4", border: "2px solid #86efac", borderLeft: "5px solid #16a34a", borderRadius: 11, padding: "14px 18px" }}>
                      <p style={{ fontSize: 12, fontWeight: 800, color: "#15803d", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.3px" }}>Hvad var ideelt her</p>
                      <p style={{ color: "#374151", fontSize: 13, lineHeight: 1.7, margin: "0 0 10px" }}>{currentTurn.feedback}</p>
                      <div style={{ background: "#fffbeb", border: "1.5px solid rgba(245,158,11,0.4)", borderLeft: "3px solid #f59e0b", borderRadius: 8, padding: "10px 14px", marginBottom: 10 }}>
                        <p style={{ fontSize: 11, fontWeight: 700, color: "#92400e", margin: "0 0 4px" }}>Modelsvar</p>
                        <p style={{ color: "#1c1917", fontSize: 13, lineHeight: 1.6, margin: 0, fontStyle: "italic" }}>{currentTurn.goodResponse}</p>
                      </div>
                      <div style={{ background: "#fef2f2", border: "1.5px solid #fca5a5", borderLeft: "3px solid #ef4444", borderRadius: 8, padding: "9px 12px" }}>
                        <p style={{ fontSize: 11, fontWeight: 700, color: "#dc2626", margin: "0 0 3px" }}>⚠️ Undgå</p>
                        <p style={{ color: "#7f1d1d", fontSize: 12, margin: 0, lineHeight: 1.5 }}>{currentTurn.redFlag}</p>
                      </div>
                    </div>

                    {/* Self-assessment */}
                    <div style={{ background: "#fff", border: "2px solid #e8e5e1", borderRadius: 10, padding: "14px 16px" }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: "#1c1917", margin: "0 0 10px" }}>Hvordan gik dit svar?</p>
                      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                        {([
                          { id: "good" as const, label: "✓ Ramte det", bg: "#f0fdf4", border: "#86efac", color: "#15803d" },
                          { id: "ok" as const, label: "~ Nogenlunde", bg: "#fffbeb", border: "rgba(245,158,11,0.5)", color: "#92400e" },
                          { id: "miss" as const, label: "✕ Missede det", bg: "#fef2f2", border: "#fca5a5", color: "#dc2626" },
                        ]).map(opt => (
                          <button key={opt.id} onClick={() => setRpSelfScore(opt.id)} style={{
                            flex: 1, padding: "9px 8px", borderRadius: 8, cursor: "pointer",
                            background: rpSelfScore === opt.id ? opt.bg : "#f5f4f2",
                            border: `2px solid ${rpSelfScore === opt.id ? opt.border : "#e8e5e1"}`,
                            color: rpSelfScore === opt.id ? opt.color : "#78716c",
                            fontSize: 12, fontWeight: rpSelfScore === opt.id ? 700 : 500,
                          }}>{opt.label}</button>
                        ))}
                      </div>
                      <button onClick={continueRp} disabled={rpSelfScore === null} style={{
                        width: "100%", padding: "10px", borderRadius: 9,
                        cursor: rpSelfScore !== null ? "pointer" : "default",
                        background: rpSelfScore !== null ? "#1c1917" : "#f5f4f2",
                        color: rpSelfScore !== null ? "#fff" : "#a8a29e",
                        border: "none", fontSize: 13, fontWeight: 700,
                      }}>{rpTurn + 1 < sc.turns.length ? "Fortsæt samtalen →" : "Se opsummering"}</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Empty state */}
          {exerciseType !== "roleplay" && !done && currentList.length === 0 && (
            <div style={{
              background: "#fff", border: "2px solid #e8e5e1", borderRadius: 12,
              padding: "32px 24px", textAlign: "center",
            }}>
              <p style={{ color: "#a8a29e", fontSize: 14 }}>
                Ingen øvelser for den valgte teknik og type. Vælg 'Alle' i filteret.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
