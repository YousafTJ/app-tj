"use client";

import { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Principle = {
  emoji: string;
  heading: string;
  body: string;
  example?: string;
  examples?: string[];
};

type Objection = {
  type: string;
  emoji: string;
  scripts: string[];
};

type ExampleQuestion = { q: string; note: string };

type Topic = {
  id: string;
  emoji: string;
  title: string;
  tagline: string;
  color: string;
  desc: string;
  principles: Principle[];
  model: { name: string; items: string[] };
  quote?: string;
  objections?: Objection[];
  exampleQuestions?: ExampleQuestion[];
};

// ─── Data ─────────────────────────────────────────────────────────────────────

const TOPICS: Topic[] = [
  {
    id: "mindset",
    emoji: "🧠",
    title: "Sælger-mindset",
    tagline: "Det rigtige mindset er fundamentet alt andet bygger på",
    color: "#a78bfa",
    quote: "\"Folk hader at blive solgt til. De elsker at blive hjulpet til at tage en god beslutning.\"",
    desc: "Før teknik, scripts og closing-tricks — start med at forstå hvad der faktisk driver et salg. Disse principper er ikke fancy teorier. De er de enkleste sandheder i salg, og dem der glemmes oftest.",
    principles: [
      {
        emoji: "😄",
        heading: "Kunder køber af folk de kan lide",
        body: "Det er ikke altid det bedste produkt der vinder. Det er den sælger kunden stoler på og er tryg ved. Smil mere, vær nærværende, skab en reel relation — inden du overhovedet begynder at sælge.",
        examples: [
          "Husk noget personligt fra sidst og nævn det: \"Fik du set kampen i weekenden?\" slår enhver salgspitch som åbner. Folk køber af folk de kan lide.",
          "Kunden venter på dig i lobbyen. Frem for at gå direkte til boardroomet: stil et ægte spørgsmål, smil, og brug 2 minutter på dem som mennesker. Det sætter tonen for hele mødet.",
        ],
      },
      {
        emoji: "🤝",
        heading: "Vær et menneske — ikke en robot",
        body: "Sælgere der følger et script lyder som robotter. Kunder mærker det med det samme og lukker af. Jo mere du ligner en ven der giver et godt råd, desto nemmere bliver salget. Joke lidt, smil lidt, vis at du er til stede.",
        examples: [
          "Kunden siger noget sjovt — grin af det. Kunden virker stresset — spørg til det. Reaktioner der viser du faktisk lytter slår enhver planlagt sætning.",
          "Du tabte tråden midt i en sætning? Sig det: \"Undskyld, jeg mistede tråden — det du sagde om X var interessant, kan du uddybe?\" Ærlighed og humor gør dig menneskelig.",
        ],
      },
      {
        emoji: "🗣️",
        heading: "Folk tror mere på det de selv siger",
        body: "Hvis du siger at dit produkt er godt, er det salgssnak. Hvis kunden selv siger det — er det sandt. Stil spørgsmål der fører kunden mod den konklusion du vil have. Lad dem sige det.",
        examples: [
          "\"Hvad ville det betyde for dig, hvis det her problem bare forsvandt?\" → Kunden beskriver nu selv din løsnings værdi med egne ord — og tror på det fordi de sagde det selv.",
          "\"Hvilke konsekvenser har det for jer, at det ikke er løst endnu?\" → Kunden opregner selv problemet og smerten. Du behøver aldrig sige et ord om dit produkt — de har allerede solgt sig selv.",
        ],
      },
      {
        emoji: "🔍",
        heading: "Det er nemmere at sælge når du ved ALT om din kunde",
        body: "Jo mere du forstår om kundens situation, behov og problemer — jo mere præcist kan du ramme dem. Stil spørgsmål, og stil spørgsmål til dine spørgsmål. Lyt mere end du taler.",
        examples: [
          "\"Hvad er den største udfordring I har med det i dag?\" → \"Og hvad er konsekvensen af det?\" → \"Hvad har I prøvet hidtil?\" Tre spørgsmål giver dig mere end ti minutter med et pitch.",
          "Inden mødet: research kunden på LinkedIn, hjemmeside og nyheder. Nævn noget specifikt: \"Jeg så I netop lancerede X — hvordan påvirker det jeres behov for Y?\" Det viser du har gjort dit hjemmearbejde og skaber øjeblikkeligt tillid.",
        ],
      },
      {
        emoji: "🎯",
        heading: "Fremhæv problemet — før du præsenterer løsningen",
        body: "Få kunden til at forstå og mærke deres problem fuldt ud. Spørg hvad det koster dem, hvad det stopper dem i, hvad de mister. Derefter spørg hvad det ville betyde at få det løst. Kontrasten sælger — ikke dit pitch.",
        examples: [
          "\"Hvad koster det jer i tid om ugen?\" → \"Og hvad ville I bruge den tid på, hvis det var løst?\" — Nu ejer kunden selv billedet af problemet OG løsningen.",
          "\"Beskriv for mig hvad jeres hverdag ser ud som nu på det her område\" → lad dem male det → \"Og hvad ville den ideelle situation se ud om 12 måneder?\" → Nu sælger kontrasten sig selv.",
        ],
      },
      {
        emoji: "💪",
        heading: "Vær ikke bange for at udfordre din kunde",
        body: "Sælgere siger altid ja. Rådgivere udfordrer. Når du respektfuldt stiller spørgsmålstegn ved en antagelse kunden har, viser du at du genuint prøver at hjælpe. Det er her den rigtige tillid opstår.",
        examples: [
          "\"Jeg er ikke sikker på jeg er enig i det — må jeg udfordre dig lidt?\" Det kræver mod. Men kunden husker den sælger der var ærlig frem for dem der bare nikkede med.",
          "Kunden siger: \"Vi behøver ikke noget nyt system, vi mangler bare mere træning.\" Du: \"Det er interessant — hvad nu hvis træningsproblemet faktisk er et symptom på systemet? Hvad sker der efter træning i dag?\" Du udfordrer antagelsen, ikke personen.",
        ],
      },
      {
        emoji: "⚡",
        heading: "Skab urgency gennem pain — ikke pres",
        body: "Kunstige deadlines og 'tilbuddet gælder kun i dag' er gennemskuelige og ødelægger tillid. Reel urgency opstår når kunden forstår hvad det koster dem IKKE at handle nu. Smerten ved status quo skaber beslutningsvilje.",
        examples: [
          "\"Hvad koster det jer per måned at fortsætte som I gør nu?\" → Lad kunden selv sætte tal på problemet. Når de siger 50.000 kr. om måneden, har du ikke brug for en deadline.",
          "\"Jeres konkurrent i samme branche løste det her for 8 måneder siden. Hvad tror du det har betydet for dem?\" — Fear of future pain: ikke hvad der sker ved at købe, men hvad der sker ved IKKE at købe.",
        ],
      },
      {
        emoji: "💰",
        heading: "MMM — Gør store priser små",
        body: "Make Money Minimal: bryd prisen ned til den mindste meningsfulde enhed og stil den altid op mod konkret værdi. 2.000 kr. mere lyder dyrt. 33 kr. om måneden for dobbelt så god en oplevelse er et no-brainer.",
        examples: [
          "\"Computeren koster 2.000 kr. mere — men den bruges i 5 år. Det svarer til 33 kr. ekstra om måneden for en computer der leverer dobbelt så god en oplevelse. Synes du 33 kr. om måneden er en dårlig idé?\"",
          "\"Vores løsning koster 18.000 kr. om året — det er 1.500 kr. om måneden, eller 50 kr. om dagen. I bruger i dag 8 timer om ugen på det manuelt til en timepris på 400 kr. Det er 13.000 kr. om måneden. Vil du bruge 1.500 kr. for at spare 13.000 kr.?\"",
        ],
      },
      {
        emoji: "🔥",
        heading: "Vær engageret over dit produkt — begejstring smitter",
        body: "Hvis du snakker om dit produkt som om det er ligegyldigt, kan kunden ligeså godt spørge ChatGPT. Men hvis du er oprigtigt begejstret og engageret over hvad dit produkt kan — så smitter det. Kunder begynder at se det på samme måde som du gør.",
        examples: [
          "\"Det her er faktisk noget jeg synes er virkelig fedt ved det her produkt\" [og mén det] — ægte begejstring er ikke til at kopiere, og kunden mærker forskel på en der reciterer og en der faktisk tror på det de siger.",
          "Inden mødet: mind dig selv om de bedste resultater dit produkt har skabt. Gå ind med det frisk i tankerne. Energien sidder i forberedelsen — ikke i scriptet.",
        ],
      },
    ],
    model: { name: "Mindset-hierarkiet", items: ["Rådgiver, ikke sælger — hjælp frem for at sælge", "Menneskelig kontakt — relation slår teknik", "Spørgsmål over svar — lyt og forstå", "Pain over pitch — problemet sælger, ikke produktet", "Begejstring — din energi sætter kundens energi"] },
  },
  {
    id: "aktiv-lytning",
    emoji: "👂",
    title: "Aktiv lytning",
    tagline: "De bedste sælgere lytter mere end de taler",
    color: "#818cf8",
    desc: "Aktiv lytning er en disciplin. Det handler ikke kun om at høre ordene — men om at forstå det der ligger bag, og vise kunden at de bliver hørt. De fleste sælgere lytter for at svare. De bedste lytter for at forstå.",
    principles: [
      { emoji: "📊", heading: "Tal 30% — lyt 70%", body: "Hvis du taler mere end kunden, stiller du ikke nok spørgsmål.", example: "Tæl dine sætninger i næste samtale. Er du over 50%? Stil et spørgsmål i stedet." },
      { emoji: "🔄", heading: "Omformuler og bekræft", body: "Gentag kundens pointe med egne ord. Det viser forståelse og skaber tillid.", example: "\"Så det du egentlig siger er at X er problemet — er det rigtigt forstået?\"" },
      { emoji: "🤐", heading: "Forbered ikke dit svar mens kunden taler", body: "Kunderne mærker det. Vær fuldt til stede i det de siger.", example: "Læg pennen, luk laptopen, og lyt med hele kroppen — øjenkontakt og fremoverlænet." },
      { emoji: "🔕", heading: "Bemærk pauser og tøven", body: "Der gemmer sig ofte vigtig information i det der IKKE bliver sagt.", example: "Kunden pauser efter spørgsmålet om pris? Stil ikke et nyt spørgsmål — vent og lad dem tale." },
      { emoji: "🗨️", heading: "Stil opklarende spørgsmål", body: "Antag ikke at du forstår. Spørg præcis hvad de mener.", example: "\"Hvad mener du præcist med at det er for komplekst?\"" },
      { emoji: "🙆", heading: "Lyt med hele kroppen — ikke kun ørerne", body: "Nik med hovedet, læn dig frem, lav bekræftende lyde som 'hmm, giver mening' og 'ja, okay'. Det viser kunden at du er mentalt til stede — og det får dem til at åbne sig mere.", example: "Prøv bevidst i næste samtale: nik tre gange mere end normalt og si 'mmh' efter kundens pointer. Du vil mærke at de taler mere og åbner op hurtigere." },
      { emoji: "🔗", heading: "Aktiv lytning er også at spørge ind", body: "Rigtig lytning stopper ikke ved at modtage information — det er at vise interesse ved at grave dybere. 'Arh okay, hvad var årsagen til det?' er aktiv lytning i praksis.", example: "Kunden: \"Vi skiftede system for et år siden.\" Du: \"Arh okay — hvad var årsagen til at I skiftede?\" → Det viser du lytter og giver dig guld-information." },
      { emoji: "🎭", heading: "Lyt til personlige interesser og værdier", body: "Bag ethvert forretningsmøde er der et menneske med egne værdier, interesser og måder at tænke på. Opfang signalerne — det giver dig en relation og en bedre forståelse af hvad der faktisk motiverer dem.", example: "Kunden nævner at de sætter stor pris på ærlighed og transparens. Du noterer det mentalt og spejler det: \"Jeg vil gerne være helt ærlig med dig om...\" — pludselig taler I samme sprog." },
    ],
    model: { name: "Lytteniveauer (stigende)", items: ["Indre monolog — du tænker på dit svar (undgå)", "Registrere ord — du hører men forstår ikke konteksten", "Forstå mening — du forstår hvad de siger og hvorfor", "Empatisk lytning — du forstår følelserne bag ordene"] },
  },
  {
    id: "indvendinger",
    emoji: "🛡️",
    title: "Indvendingshåndtering",
    tagline: "Gør modstand til mulighed",
    color: "#f59e0b",
    quote: "\"En indvending er et tegn på interesse. En ligegyldig kunde siger ingenting.\"",
    desc: "En indvending er sjældent et endeligt nej — det er et signal om at kunden har et ubesvaret spørgsmål eller en utryghed, der endnu ikke er adresseret. Den sælger der frygter indvendinger, mister salget. Lær at bruge de rigtige frameworks og teknikker — så bliver modstand til åbninger.",
    principles: [
      {
        emoji: "👂",
        heading: "L — Lyt (LAER-modellen)",
        body: "Giv fuld opmærksomhed. Brug stilhed som et redskab. Afbryd ikke. Lyt ikke bare til ordene — men til det der IKKE bliver sagt. Pauser, tøven og tone afslører den reelle bekymring.",
        example: "Kunden pauser efter at have nævnt prisen. Afbryd ikke — vent. Det der kommer i den pause er vigtigere end svaret du forberedte.",
      },
      {
        emoji: "✋",
        heading: "A — Anerkend + vis empati (LAER-modellen)",
        body: "Gentag det du hørte og vis at du forstår følelsen bag. Anerkendelse + empati i én bevægelse sænker temperaturen og viser kunden at de er både hørt og forstået. Ingen forsvar, ingen forklaring — bare anerkendelse af både ord og følelse.",
        examples: [
          "\"Jeg forstår at du synes det er en lidt større investering end du havde regnet med — og det er en helt naturlig reaktion.\" → Ord anerkendt, følelse anerkendt. Kunden falder ned.",
          "\"Det forstår jeg godt — og det er faktisk en ret normal bekymring at have på det her tidspunkt.\" → Du validerer uden at gå i forsvar. Kunden føler sig set.",
        ],
      },
      {
        emoji: "🔎",
        heading: "E — Efterforsk (LAER-modellen)",
        body: "Henvis tilbage til noget kunden selv fortalte dig var vigtigt. Du graver ikke efter ny information — du spejler det de allerede sagde, og kobler det til situationen nu. Det viser du lyttede, og det bygger bro til R.",
        examples: [
          "\"Du fortalte mig også at kvaliteten af TV-billedet var særligt vigtig for dig — at det ligesom skulle give hele familien en rigtig biografoplevelse hjemme. Det var vigtigt for dig, ik?\" → Kunden siger ja — og nu er du klar til R.",
          "\"Du nævnte tidligere at det her med [X] var noget af det vigtigste for dig i den her beslutning, ik?\" → En bekræftelse fra dem er alt hvad du har brug for.",
        ],
      },
      {
        emoji: "💬",
        heading: "R — Reager (LAER-modellen)",
        body: "Kobl løsningen direkte til det kunden bekræftede i E. Brug 'derfor' som bindeleddet mellem deres behov og prisen eller beslutningen. Afslut med at vende spørgsmålet tilbage til dem — lad dem selv konkludere.",
        examples: [
          "\"Og derfor er det en lidt større investering — fordi du får de her ekstra fordele som du ikke har i dag. Det synes jeg selv personligt er investeringen værd. Men hvad synes du? Synes du selv at de ekstra fordele ikke er investeringen værd?\"",
          "\"Og derfor betaler du lidt mere — fordi du præcis får det [X] du selv sagde var vigtigt. Det giver jo god mening, ik?\" → Kunden bekræfter — de har nu solgt sig selv.",
        ],
      },
      {
        emoji: "🪞",
        heading: "Spejling — få kunden til at uddybe frivilligt",
        body: "Gentag kundens sidste 2-3 ord i en spørgende tone. Det omgår modstand og får kunden til selv at grave dybere — uden at du behøver stille et direkte spørgsmål.",
        example: "Kunde: \"Vi vil gerne tilmelde os, men jeres produkt er lidt uden for vores budget.\" Sælger: \"Uden for jeres budget?\" → Kunden uddyber frivilligt hvad budget faktisk betyder for dem.",
      },
      {
        emoji: "🏷️",
        heading: "Labeling — sæt ord på følelsen",
        body: "Sæt ord på den emotion du observerer hos kunden. Det omgår den analytiske del af hjernen og fremkalder ufiltrerede, ægte svar — fordi kunden føler sig forstået på et dybere niveau.",
        example: "\"Det lyder som om integrationen bekymrer dig.\" → Kunden: \"Ja, faktisk — vi har haft problemer med det tidligere.\" Nu ved du den reelle indvending.",
      },
      {
        emoji: "🎯",
        heading: "Accusation Audit — afvæbn bekymringer proaktivt",
        body: "Tag proaktivt fat på alt det negative kunden måske tænker — inden de siger det. Det afvæbner spændinger før de opstår og positionerer dig som ærlig og selvbevidst.",
        example: "\"Du tænker sikkert at det her lyder dyrt, og at dit team allerede har for mange værktøjer at lære.\" → Kunden: \"Nej, faktisk...\" — Du har vendt bevisbyrden.",
      },
      {
        emoji: "🤝",
        heading: "Feel-Felt-Found — tre trin med social bevisførelse",
        body: "Validér kundens følelse → brug social proof fra andre kunder → præsentér det konkrete positive resultat. Teknikken normaliserer indvendingen og peger naturligt mod løsningen.",
        examples: [
          "\"Jeg forstår hvordan du har det med prisen...\" (validerer — kunden føler sig hørt)",
          "\"Mange af vores kunder følte det på samme måde i starten...\" (social proof — kunden er ikke alene)",
          "\"Det de fandt ud af var at ROI'en langt oversteg den initielle investering og sparede dem 35% i det første år.\" (positivt resultat — kunden ser vejen frem)",
        ],
      },
      {
        emoji: "🧠",
        heading: "Prisen er sjældent det reelle problem",
        body: "Prisindsigelse er ofte en proxy for noget andet — manglende tillid, usikkerhed om value, forkert timing. Test det med ét enkelt spørgsmål.",
        example: "\"Hvis prisen ikke var et problem — ville du så købe det?\" Siger de nej, er der en anden indvending. Nu kan du finde den reelle årsag.",
      },
      {
        emoji: "📋",
        heading: "Forbered svar på dine 5-7 mest hyppige indvendinger",
        body: "Du møder de samme indvendinger igen og igen. Kend dem udenad og vær klar med dit svar — rolig, præcis og uden at gå i panik.",
        example: "Skriv en liste over de 5 indvendinger du møder oftest. Øv svaret til du kan det i søvne. Selvtillid i svaret signalerer ekspertise.",
      },
      {
        emoji: "🎪",
        heading: "Tag et nej og gør dem nysgerrige",
        body: "Når kunden siger nej, er din opgave ikke at argumentere mod dem. Din opgave er at forvandle nejet til nysgerrighed. Vis dem med din viden og tryghed at der er noget de mangler at vide — og det er spændende, ikke truende. Et nej er et ubesvaret spørgsmål.",
        examples: [
          "\"Det forstår jeg godt — og jeg er faktisk glad for at du siger det direkte. Må jeg stille dig et enkelt spørgsmål?\" [Ja] → Nu er du tilbage i samtalen med fuld opmærksomhed.",
          "Nej = ubesvaret spørgsmål. Find ud af hvad kunden ikke ved endnu, og sørg for at de får at vide det — ikke som pres, men som viden der ændrer billedet.",
        ],
      },
      {
        emoji: "💙",
        heading: "Vis at du går mere op i dem end de selv gør",
        body: "Den stærkeste position i et salg er at ville kundens resultat mere end de selv gør — og vise det. Ikke med ord, men med handlinger: sæt dig ind i deres situation, stil spørgsmål ingen andre stiller, og hav modet til at udfordre dem på deres egne vegne.",
        examples: [
          "\"Jeg vil ikke have at du træffer en beslutning du fortryder. Lad os gå det her igennem en gang til — for din skyld.\" Du er nu den der kæmper for dem.",
          "Kunden nøler. Du: \"Hvad er din egentlige bekymring her? Jeg vil hellere vi taler om det nu end at du sidder og tænker på det bagefter.\" Det viser at du vil mere for dem end for salget.",
        ],
      },
      {
        emoji: "⏸️",
        heading: "\"Udover pris — hvad er vigtigt for dig?\"",
        body: "Når kunden nævner pris, stil ét spørgsmål og vent. 3 sekunders pause efter 'må jeg lige spørge' — og derefter: 'udover pris selvfølgelig, hvad er vigtigt for dig?' Det flytter samtalen væk fra pris og tilbage til behov og værdier. Kunden begynder nu at sælge sig selv på det der faktisk betyder noget for dem.",
        examples: [
          "Kunden: \"Det er lidt dyrt.\" Du: \"Må jeg lige spørge...\" [3 sekunders pause] \"...udover pris selvfølgelig — hvad er vigtigt for dig?\" → Kunden fortæller om kvalitet, garanti, support eller noget andet der betyder noget for dem. Nu handler samtalen ikke om pris.",
          "Pausen er ikke ubehagelig — den er magtfuld. Den viser ro, selvtillid og at du tager dem seriøst. Kunden udfylder stilheden med det der egentlig betyder noget for dem.",
        ],
      },
      {
        emoji: "🔄",
        heading: "Fra pris til resultat — flyt kundens fokus",
        body: "Kunder der tænker prisbaseret ('hvad koster det?') handler ikke. Kunder der tænker resultatorienteret ('hvad får jeg ud af det?') handler. Dit job er at flytte dem fra den ene til den anden tankegang gennem spørgsmål og god indvendingshåndtering.",
        examples: [
          "Kunden: \"Det er dyrt.\" → Du: \"Hvad ville det betyde for dig, hvis det her problem bare var løst?\" → \"Hvad taber du per måned på at det ikke er løst?\" → Kunden sætter selv tal på gevinsten — og prisen ser pludselig anderledes ud.",
          "Spørg: \"Hvad er vigtigt for dig — at spare penge nu, eller at få det resultat du har brug for?\" Præsentér derefter værdien i kr. og timer. Kontrasten mellem pris og resultat lukker handlen.",
        ],
      },
      {
        emoji: "🔁",
        heading: "Anerkend — redirect til ideen — kobl til behov",
        body: "Når kunden rejser en indvending, anerkend dem kort og redirect straks til om selve ideen giver mening. Når de bekræfter ideen, kobl det direkte til det de selv har sagt: du får præcis det du beskrev.",
        examples: [
          "\"Jeg hører hvad du siger, og kan godt forstå dig — men hurtigt spørgsmål: giver ideen her mening? Kan du lide ideen?\" [Ja, det er det vel] → \"Præcis — fordi det du sagde med [X] er jo præcis det du får. Du får X, Y og Z, og dit problem med X bliver løst med Y, og det giver dig Z.\"",
          "Teknikken virker fordi kunden allerede har valideret ideen med deres eget ja. Resten er bare at minde dem om at løsningen leverer præcis det de selv beskrev som vigtigt.",
        ],
      },
      {
        emoji: "🏋️",
        heading: "Træn indvendinger aktivt med LAER-modellen",
        body: "Skriv alle indvendinger du møder ned og lav konkrete øvelseseksempler med LAER (Lyt → Anerkend + empati → Efterforsk → Reager). Toppræsterende sælgere øver indvendingshåndtering til de kan det i søvne. Træning er ikke noget der sker én gang.",
        examples: [
          "Indvending: \"Det er for dyrt.\" → L: Lyt uden at afbryde → A: \"Jeg forstår godt at det føles som en større investering\" → E: \"Du fortalte mig jo også at [X] var særligt vigtigt for dig, ik?\" → R: \"Og derfor betaler du lidt mere — fordi du præcis får [X]. Hvad synes du selv?\"",
          "Træningsøvelse: Skriv dine 5 mest hyppige indvendinger. Lav et fuldt LAER-svar til hver med E som et 'du fortalte mig også...' spørgsmål og R der vender det tilbage til kunden. Øv med en kollega ugentligt.",
        ],
      },
    ],
    model: { name: "LAER-modellen", items: ["L — Lyt: giv fuld opmærksomhed, brug stilhed, afbryd ikke", "A — Anerkend + empati: gentag det du hørte og vis forståelse for følelsen bag", "E — Efterforsk: 'du fortalte mig også at X var særligt vigtigt for dig, ik?'", "R — Reager: 'og derfor betaler du lidt mere — fordi du får de ekstra fordele du ikke har i dag. Hvad synes du?'"] },
    objections: [
      {
        type: "For høj pris",
        emoji: "💸",
        scripts: [
          "Må jeg lige spørge... [3 sekunders pause] ...udover pris selvfølgelig — hvad er vigtigt for dig?",
          "Det forstår jeg godt. Og det er en lidt tungere investering i dag — men hvad tror du egentlig ville være konsekvensen ved at gå med det billigere valg? Hvad tror du du ville misse ud på?",
          "Ja, det er lidt dyrere i dag. Men grunden til at det er dyrere er [list de særlige fordele for kunden]. Så du kan sagtens gå med det andet valg, det er dit kald i sidste ende. Men de her ekstra fordele vi gennemgik — er det noget som vil betyde noget for dig? [Ja] — Er det så ikke noget som vil være værd at give lidt ekstra for?",
          "Det er korrekt. Men du sagde at dette er et køb som skal dække dig i 5 år — vil det være fair at sige at det er et langtidskøb? [Ja] — Okay fedt. Så det at du giver lidt ekstra i dag, på længere sigt vil du få mere ud af din [fx computer]. Om 1-2 år ville du takke dig selv for det. Siden det er et langtidskøb — synes du det er bedre at tænke kortsigtet eller langsigtet? [Langsigtet] — Okay, så på længere sigt: hvilken løsning ville gavne dig mest?",
          "Jeres løsning koster 20% mere end Konkurrent X. De 20% inkluderer dedikeret account management og vores analytiske platform — funktioner der hjalp [Kunde Y] med at reducere salgscyklussen med 35%. Da de så på de samlede ejeromkostninger over 12 måneder inklusive support og integration, sparede de faktisk penge. Ville det være nyttigt at lave en lignende analyse for jeres situation?",
        ],
      },
      {
        type: "Skal tænke over det / ikke lige nu",
        emoji: "🤔",
        scripts: [
          "Ja selvfølgelig, det skal virke som en rar følelse. Bare lige hurtigt — lad os sige du tager hjem og bruger resten af ugen på at tænke det her igennem: hvad ville du bruge mest tid på at tænke igennem? Hvad ville være din største bekymring?",
          "Ja, selvfølgelig — hvis det hjælper dig med at tage den bedste beslutning. Lad os antage du tog dig tid til at mærke efter: hvad ville være din største bekymring? Hvilke ting vil du bruge mest tid på at tænke igennem?",
          "Det forstår jeg fuldt ud — timing er vigtigt. Må jeg spørge, hvad jeres største prioritet er lige nu? [Lytter] Det er interessant — faktisk fortalte flere af vores kunder os det samme, men de fandt ud af at implementering i deres travleste periode faktisk hjalp dem med at håndtere arbejdsbyrden. Ville det hjælpe hvis jeg viste dig hvordan [Virksomhed X] onboardede på bare to uger uden at forstyrre driften?",
        ],
      },
      {
        type: "Skal snakke med min chef / partner / far",
        emoji: "👥",
        scripts: [
          "Ja selvfølgelig, det er vigtigt at have sit bagland med. Lad os antage at din partner/far siger god for det — hvor står du så selv? Er det noget du vil føle dig klar til at gå videre med?",
          "Giver god mening, det skal helst ikke skabe problemer. Men lad os antage at din partner/chef giver thumbs up — ville du så føle dig komfortabel med at gå videre? [Nej] — Nå okay, hvad er det du føler du mangler for at kunne træffe en beslutning? Hvad bekymrer dig mest? [Ja] — Hvad tror du ville være deres største bekymring?",
          "Det giver fuldstændig mening — en beslutning som denne bør involvere de rette interessenter. Ville det hjælpe hvis jeg udarbejdede en kort one-pager med de vigtigste fordele og ROI specifikt til din VP? Eller endnu bedre — hvad hvis vi satte et kort 15-minutters opkald op, hvor jeg kan svare på vedkommendes specifikke spørgsmål direkte? Hvad ville være vigtigst for ham eller hende?",
        ],
      },
      {
        type: "Jeg er ikke interesseret",
        emoji: "🚫",
        scripts: [
          "Nej, det forstår jeg godt — og jeg er slet ikke nået til det punkt endnu. For at se om det overhovedet giver mening, har jeg brug for at vide lidt mere om [xyz]. Så bare lige for at forstå din situation: hvad … [stil dit spørgsmål — og du er tilbage i snakken]",
          "Nej nej, bare rolig — jeg ved ikke engang om jeg kan hjælpe dig endnu. [smil] Jeg har brug for at vide mere om [xyz] for at se om det giver mening, så til at starte med: hvad … [stil dit spørgsmål — og du er tilbage i snakken]",
        ],
      },
      {
        type: "Vi klarer os fint / har ikke brug for det",
        emoji: "😌",
        scripts: [
          "Det er godt at høre — og ærligt talt ville jeg ikke ønske at fikse noget der ikke er i stykker. Bare af nysgerrighed: hvis du kunne ændre, modificere eller forbedre bare én ting ved jeres nuværende proces, hvad ville det så være? [Lytter] Det er interessant. En af vores kunder i jeres branche fortalte mig præcis det samme. De var ikke klar over at de tabte 15 timer om ugen, før vi kørte en hurtig analyse. Ville du være åben for en kort gennemgang — helt uforpligtende — bare for at se om der er en mulighed I måske overser?",
        ],
      },
      {
        type: "Vi bruger allerede en konkurrent",
        emoji: "⚔️",
        scripts: [
          "[Konkurrent] er en solid løsning, og jeg ville aldrig foreslå at skifte hvis den virkelig dækker alle jeres behov. Bare nysgerrig — hvis du kunne ændre eller forbedre bare én ting ved jeres nuværende setup, hvad ville det så være? [Lytter] Det er præcis dér vi typisk skaber mest værdi. [Kunde Z] var i præcis samme position — tilfreds med deres udbyder overordnet — men de fandt ud af at vores [specifikke differentiator] sparede dem yderligere 22% i produktivitet.",
        ],
      },
      {
        type: "Jeg har aldrig hørt om jer",
        emoji: "🤷",
        scripts: [
          "Det er helt fair — og jeg sætter pris på ærligheden. Vi er faktisk betroet af [kendte kunder] og har hjulpet [X antal] virksomheder i jeres branche med at opnå [specifikt resultat]. Vores kunde [Navn] var i en lignende position — de kendte os heller ikke — men efter et pilotprojekt oplevede de en 40% forbedring i [målepunkt] inden for 90 dage. Ville et pilotprojekt give mening for at reducere risikoen på jeres side?",
        ],
      },
      {
        type: "Jeg har haft dårlige oplevelser med det før",
        emoji: "😤",
        scripts: [
          "Okay, giver mening. Må jeg dele en holdning? [Ja] — Lad os sige du kører bil og der sker en ulykke. Ville du så aldrig træde ind i en bil igen? [Jo, selvfølgelig ville jeg det] — Ja, præcis. Det ville du, men du ville sørge for at lære af din fejl så det ikke sker igen. Det der skete før, det skete fordi [årsagen]. Det skal ikke stoppe dig fra at gøre noget fornuftigt — men sikre at du gør det på den rette måde denne gang.",
          "Hvis du har haft en dårlig oplevelse, forstår jeg det godt. Men hvad synes du er vigtigst — at lade oplevelsen skræmme dig fra at træffe fornuftige beslutninger for evigt, eller at lære af den fejl og forstå hvorfor det gik galt, så du næste gang kun får gode resultater?",
        ],
      },
    ],
  },
  {
    id: "relationsopbygning",
    emoji: "🤝",
    title: "Relationsopbygning",
    tagline: "Folk køber af folk de kan lide — ikke af den bedste pitch",
    color: "#fb923c",
    quote: "\"Folk husker ikke hvad du sagde. De husker hvordan du fik dem til at føle sig.\"",
    desc: "En stærk relation er det fundament alt andet bygger på. Kunder der kan lide dig, lytter mere, indvender mindre og lukker nemmere. Det handler ikke om at være sælger — det handler om at være et ægte menneske der vil noget godt for dem.",
    principles: [
      {
        emoji: "🗣️",
        heading: "Tal som om du har kendt dem i 10+ år",
        body: "Gør sproget mere simpelt og bekendt. Sælgere taler professionelt og stift. Venner taler naturligt og direkte. Jo mere du lyder som én de har kendt i lang tid, desto hurtigere sænker de paraderne. Kortere sætninger, mindre jargon, mere 'dig og mig'.",
        examples: [
          "I stedet for: \"Vi har et produkt der potentielt kunne optimere jeres nuværende infrastruktur\" → \"Hør her — det du har nu, det kan vi gøre markant bedre. Lad mig vise dig.\"",
          "Brug fornavn fra første sekund. Sig 'dig' i stedet for 'jer'. Sig 'vi' i stedet for 'vores virksomhed'. Sproget er bindeleddet — og simpelt sprog er stærkere.",
        ],
      },
      {
        emoji: "😄",
        heading: "Smil — så smiler de tilbage",
        body: "Et ægte smil smitter. Det sænker temperaturen, åbner samtalen og gør dig øjeblikkeligt mere sympatisk. Det koster ingenting og ændrer alt.",
        examples: [
          "Start hvert møde med et smil og et ægte 'hvordan går det?' inden du overhovedet nævner produktet. Tonen for hele samtalen sættes i de første 30 sekunder.",
          "Kunden virker anspændt eller stresset? Smil og sig: \"Det lyder som en travl dag — skal vi tage det lidt stille?\" Det viser empati og skaber ro.",
        ],
      },
      {
        emoji: "🎯",
        heading: "Virkelig ville hjælpe — ikke sælge",
        body: "Folk mærker forskel på en sælger der vil have ordren og en rådgiver der vil løse deres problem. Gå ind i samtalen med ét mål: forstå hvad de har brug for og hjælp dem. Salget følger af sig selv.",
        examples: [
          "\"Jeg er ikke sikker på om det her er det rigtige for dig endnu — lad mig stille dig et par spørgsmål så vi kan finde ud af det.\" Det er rådgiveren der taler, ikke sælgeren.",
          "Hvis løsningen ikke er den rigtige: sig det. \"Jeg tror faktisk ikke det her er det I har brug for på nuværende tidspunkt.\" Den ærlighed bygger mere tillid end noget salg.",
        ],
      },
      {
        emoji: "💬",
        heading: "Spørg ind til deres interesser — folk elsker at snakke om sig selv",
        body: "Folk åbner sig når de taler om det der betyder noget for dem. Spørg ind til interesser, hobbyer, hvad de er stolte af. Det er ikke smalltalk — det er relationsopbygning.",
        examples: [
          "Du ser et billede af en båd på væggen: \"Er du sejler? Hvor sejler du henne?\" → 10 minutter senere er I venner. Produktet kan vente.",
          "\"Hvad laver du uden for arbejdet?\" — og lyt genuint. Husk det til næste gang. Det viser at du ser dem som et menneske, ikke et lead.",
        ],
      },
      {
        emoji: "🔗",
        heading: "Find fælles interesser og skab en reel relation",
        body: "Fælles interesser skaber tilknytning. Når du og kunden har noget til fælles — en hobby, et hold, en oplevelse — rykker du fra fremmed til bekendt. Det ændrer hele dynamikken.",
        examples: [
          "Kunden nævner at de løber. Du løber også: \"Fedt, hvad distance kører du?\" → I de næste 5 minutter er I ikke sælger og kunde — I er to løbere der snakker. Den relation er guld.",
          "Ingen fælles interesse? Skab en fælles reference: \"Jeg hørte en podcast om netop det her problem I har — skal jeg sende dig linket?\" Du er nu den der husker og giver.",
        ],
      },
      {
        emoji: "😂",
        heading: "Opfør dig som en ven — grin og joke lidt",
        body: "Sælgere er stive. Venner er afslappede. Jo mere du opfører dig som en ven der giver et ærligt råd, desto mere sænker kunden paraderne. Humor er ikke uprofessionelt — det er menneskelig kontakt.",
        examples: [
          "Kunden siger: \"Det lyder næsten for godt til at være sandt.\" Du: \"Ja, det siger min chef også om mine budgetter.\" [smil] → Spændingen er væk, I griner begge — og samtalen kører videre.",
          "Du lavede en fejl i præsentationen? Grin af det: \"Okay, den slide var åbenbart ikke min bedste dag.\" Selvbevidst humor viser selvtillid og gør dig menneskelig.",
        ],
      },
      {
        emoji: "👂",
        heading: "Aktiv lytning — lyt til deres problemer som om det er dit eget",
        body: "Folk mærker hvornår de bliver hørt og hvornår du bare venter på din tur. Lyt aktivt med kroppen, stil opklarende spørgsmål og vis at du tager det de siger seriøst. Det er den mest undervurderede form for relationsopbygning.",
        examples: [
          "Kunden fortæller om et problem der frustrerer dem. Du stopper op: \"Det lyder virkelig frustrerende — har det påvirket jer meget?\" Det viser empati og får dem til at åbne sig endnu mere.",
          "Nik, læn dig frem, og lav bekræftende lyde: \"Mmh, giver mening\", \"Ja, okay\". Det signalerer at du er mentalt til stede — ikke bare venter på at tale.",
        ],
      },
      {
        emoji: "🌟",
        heading: "Spørg ind til kunden — behov, situation og drømmescenarie",
        body: "Den der spørger, viser at de vil hjælpe. Spørg ind til kundens situation, hvad der påvirker dem, hvad de kæmper med — og hvad deres drømmescenarie er. Det er ikke et forhør. Det er ægte interesse.",
        examples: [
          "\"Hvad er det der påvirker jer mest i dag ift. [problem]?\" → \"Og hvordan påvirker det dig personligt?\" → \"Hvis du kunne male det perfekte scenarie — hvad ville det se ud som?\" Tre spørgsmål der åbner hele verden.",
          "\"Hvad ville det betyde for dig og dit team, hvis det her problem bare var væk?\" → Kunden beskriver deres drømmescenarie. Nu ved du præcis hvad du skal sælge — og de føler sig forstået.",
        ],
      },
      {
        emoji: "🧩",
        heading: "Forstå problemet bedre end kunden selv",
        body: "Hvis du kan sætte ord på kundens problem mere præcist end de selv kan, sker der noget magisk — de ser dig automatisk som løsningen. Det kræver at du virkelig graver dig ned i deres situation og taler deres sprog.",
        examples: [
          "Kunden beskriver et rodet problem. Du opsummerer det skarpt: \"Så det du egentlig siger er at I mister tid fordi [X], og det koster jer [Y], og ingen har taget ejerskab på det endnu?\" — De siger: \"Præcis!\" Nu er du eksperten.",
          "Forbered dig inden mødet: research branchen, forstå de typiske udfordringer. Når du nævner noget de genkender men ikke selv har sagt — \"det er et klassisk problem i jeres branche\" — så stoler de på at du forstår dem.",
        ],
      },
      {
        emoji: "🤐",
        heading: "Shut up og lyt — kunden skal føle sig som den mest interessante person",
        body: "At lytte er at bygge en relation. Vent ikke på at kunden holder op med at tale så du kan sige dit. Lyt for at forstå — ikke for at svare. Få kunden til at føle sig som den mest interessante person i rummet.",
        examples: [
          "Kunden fortæller en lang historie om deres udfordring. Modstå trangen til at afbryde med løsningen. Lad dem tale færdigt, nik og spørg: \"Og hvad gjorde I så?\" — De åbner sig endnu mere, og du lærer endnu mere.",
          "Øvelse: hold 3 sekunders pause efter kunden holder op med at tale inden du siger noget. Det føles akavet, men det viser at du tog det ind — ikke bare ventede på din tur.",
        ],
      },
      {
        emoji: "🔄",
        heading: "Del en grund til IKKE at handle med dig — det skaber tillid",
        body: "Det er paradoksalt, men det virker: hvis du frivilligt nævner en ulempe eller en situation hvor dit produkt ikke er det rigtige, viser du at du ikke kun tænker på dig selv. Det opbygger en tillid der er stærkere end enhver salgspitch.",
        examples: [
          "\"Jeg vil være ærlig — hvis du primært har brug for [X], er vi nok ikke det bedste match. Men hvis [Y] er vigtigere, er vi til gengæld de bedste.\" Den ærlighed er guld.",
          "\"Du kan sagtens finde det billigere hos andre. Grunden til at kunder alligevel vælger os er [konkret fordel]. Men hvis pris er det eneste der tæller, skal jeg ikke holde dig her.\" → Kunden respekterer det og spørger ind til fordelen.",
        ],
      },
      {
        emoji: "💪",
        heading: "Vær 100% confident — usikkerhed smitter",
        body: "Alt hvad du siger skal siges med selvtillid. Ikke arrogance — men ro og autoritet. Kunder køber ikke fra folk der virker usikre på det de siger. Tvivl smitter. Selvtillid smitter mere.",
        examples: [
          "Undgå: \"Jeg tror måske at...\" og \"Det er jeg ikke helt sikker på, men...\". Sig i stedet: \"Det her er [X]\" og \"Det du får ud af det er [Y].\" Præcision og ro signalerer ekspertise.",
          "Hvis du ikke kender svaret: \"Det finder jeg ud af til dig inden i morgen\" sagt med ro og selvtillid er langt stærkere end et usikkert gæt. Kunden stoler på den der ved sine grænser.",
        ],
      },
      {
        emoji: "🤣",
        heading: "Få dem til at smile — grin og joke lidt",
        body: "Et smil og et grin er den korteste vej til sympati. Folk husker hvordan du fik dem til at føle sig — ikke hvad du sagde. Humor behøver ikke være spektakulær. Et lille glimt i øjet er nok.",
        examples: [
          "Kunden er skeptisk: \"Det her lyder jo næsten for godt.\" Du: \"Ja, det tænker jeg selv ind i mellem — men tallene lyver heldigvis ikke.\" [smil] → Spændingen er brudt og samtalen ruller videre.",
          "Find en naturlig åbning til en let joke tidligt i mødet. Det sætter tonen: dette er ikke et stift salgsmøde — det er en god samtale mellem to mennesker.",
        ],
      },
      {
        emoji: "🤝",
        heading: "Lav en service promise — en aftale der viser at du vil",
        body: "En service promise er en konkret udtalelse om hvad du vil gøre for kunden — uanset om de handler hos dig eller ej. Det viser at du er der for dem, ikke for provisionen. Det er et af de stærkeste tillidsbyggende værktøjer der findes.",
        examples: [
          "\"Jeg skal nok sørge for at vi finder den bedste computer til dine behov og gøre alt hvad jeg kan for at presse prisen helt ned for dig.\"",
          "\"Lad os kigge på det vi har — jeg skal nok finde den bedste løsning til dig og presse prisen ned så det er fornuftigt. Og hvis vi ikke finder det rigtige her, skal jeg nok retlede dig til hvor du kan finde det.\" [Det sidste sætter dig som rådgiver, ikke sælger — og bygger massiv tillid.]",
        ],
      },
    ],
    model: { name: "Tillidstrappen", items: ["Sympati — de kan lide dig som person", "Troværdighed — de tror på dine ord og intentioner", "Tillid — de stoler på dine anbefalinger", "Loyalitet — de vælger dig igen og anbefaler dig videre"] },
  },
  {
    id: "kundebehov",
    emoji: "🎯",
    title: "Kundebehov & værdiskabelse",
    tagline: "Forstå kunden dybere end kunden forstår sig selv",
    color: "#38bdf8",
    quote: "\"Den der stiller de bedste spørgsmål, kontrollerer samtalen.\"",
    desc: "63% af tabte handler mistes allerede før behovsafdækningen — fordi sælgeren ikke kvalificerede ordentligt fra starten. Toppræsterende sælgere stiller 40% flere spørgsmål og har 76% længere discovery-samtaler end gennemsnittet. Behovsafdækning er den mest højt gearede forbedring enhver sælger kan lave.",
    principles: [
      {
        emoji: "❓",
        heading: "Udfordr kunden med det første spørgsmål",
        body: "Spørg ikke bare hvad de har brug for — spørg hvorfor de overhovedet leder. Det udfordrer kunden konstruktivt og bygger tillid, fordi du viser at du tænker dybere end salgssituationen. Det første spørgsmål sætter dig som rådgiver, ikke sælger.",
        examples: [
          "\"Kan du hjælpe mig med at forstå — hvad er årsagen til at du overhovedet er på udkig efter det her?\"",
          "\"Hvad var det der fik dig til at tænke at det her kunne være en prioritet lige nu?\" — det er et spørgsmål ingen andre sælgere stiller.",
        ],
      },
      {
        emoji: "🙋",
        heading: "Brug ordet 'hjælp' — det bygger alliance",
        body: "Når du siger 'kan du hjælpe mig med at forstå', lyder du ikke som en sælger der graver information. Du lyder som én der genuint vil forstå. Det lille ord ændrer hele dynamikken og positionerer dig som én på kundens side.",
        examples: [
          "\"Kan du hjælpe mig med at forstå hvad årsagen er til at du stadig er med Telenor i dag? Deres priser er jo noget af det højeste i hele DK.\"",
          "\"Kan du hjælpe mig med at forstå hvad det er der har holdt jer fra at løse det her tidligere?\"",
        ],
      },
      {
        emoji: "📝",
        heading: "Opsummér — vis at du lyttede og vær eksperten",
        body: "Opsummér hvad du hørte og bekræft med kunden. Det viser at du lyttede og forstod — og det positionerer dig automatisk som den der forstår problemet bedst. Det er et af de stærkeste ekspertsignaler der findes.",
        examples: [
          "\"Har jeg forstået det korrekt, at det primære problem er [X], og at det koster jer [Y]?\" — Kunden bekræfter: nu er du eksperten.",
          "\"Lad mig se om jeg har forstået det rigtigt...\" → opsummér med egne ord → \"Er det korrekt?\" → Kunden siger ja og stoler endnu mere på dig.",
        ],
      },
      {
        emoji: "🔎",
        heading: "Uddybende spørgsmål — grav under overfladen",
        body: "Når kunden siger noget generelt, spørg altid ind til hvad de specifikt mener. Det er forskellen på at forstå problemet og virkelig forstå det.",
        examples: [
          "Kunden: \"Vi er egentlig tilfredse med vores nuværende leverandør.\" Du: \"Når du siger tilfreds — kan du prøve at uddybe hvad du specifikt mener? Hvad er det der har gjort at du er glad for dem?\"",
          "Kunden: \"Det er for dyrt.\" Du: \"Kan du hjælpe mig med at forstå hvad du mener med for dyrt? I forhold til hvad?\" — De graver sig selv ned i svaret.",
        ],
      },
      {
        emoji: "🎧",
        heading: "Stil spørgsmål du ikke kender svaret på — og lyt intensivt",
        body: "Stil spørgsmål om ting du genuint ikke kender svaret på. Det giver dig uvurderlig information og signalerer ægte nysgerrighed. Lyt derefter med al din opmærksomhed — det du hører her er guldminen.",
        examples: [
          "\"Hvad har du egentlig prøvet hidtil for at løse det her?\" — Ægte nysgerrighed, ægte information.",
          "\"Hvordan tænker du selv om det?\" — Et simpelt spørgsmål der åbner for de mest overraskende svar. Lyt uden at forberede dit næste spørgsmål.",
        ],
      },
      {
        emoji: "↔️",
        heading: "Gap Selling — gør gabet synligt",
        body: "Kortlæg tre elementer: kundens nuværende tilstand (problemer, miljø, konsekvenser), den ønskede fremtidige tilstand (mål, drømme) og gabet imellem dem. Ingen køber medmindre deres nuværende situation føles uholdbar. Gør gabet så stort og tydeligt som muligt.",
        examples: [
          "\"Beskriv for mig hvad jeres hverdag ser ud som nu på det her område.\" → Lad dem male det → \"Og hvad ville den ideelle situation se ud om 12 måneder?\" → Nu sælger kontrasten sig selv.",
          "\"Hvad koster det jer per måned at fortsætte som I gør nu?\" → Lad kunden sætte tal på. Når de siger 50.000 kr., har du ikke brug for en deadline — gabet er urgency nok.",
        ],
      },
      {
        emoji: "🏆",
        heading: "MEDDIC — kvalificér enterprise-handler",
        body: "Det mest brugte enterprise-kvalificeringsframework: Metrics (kvantificerbare mål), Economic Buyer (personen med budgetautoritet), Decision Criteria (faktorer der påvirker valget), Decision Process (trinene til beslutning), Identify Pain (kerneudfordringer), Champion (intern fortaler). Toppræsterende sælgere der bruger MEDDIC opretholder 80%+ stage progression.",
        example: "\"Hvem er det der i sidste ende godkender en investering på dette niveau?\" (Economic Buyer) → \"Hvilke kriterier evaluerer I typisk på, når I vælger en løsning som denne?\" (Decision Criteria)",
      },
      {
        emoji: "💼",
        heading: "BANT — klassisk kvalificering",
        body: "Det klassiske IBM-framework: Budget (har de midler?), Authority (taler du med beslutningstageren?), Need (er der et reelt behov?), Timeline (hvornår vil de handle?). Simpelt og hurtigt — ideelt til at kvalificere leads tidligt i processen.",
        example: "\"Har I afsat budget til at løse det her problem i år?\" (Budget) → \"Hvornår ville det ideelt være på plads?\" (Timeline) → Hurtigt overblik over om det er værd at investere tid i.",
      },
      {
        emoji: "🔧",
        heading: "Jobs-to-Be-Done — kunder ansætter løsninger",
        body: "Kunder køber ikke produkter — de 'ansætter' dem til at få et job gjort. Forstå hvilket job kunden ansætter din løsning til, og du kan positionere dig præcist. Jobformatet: 'Når [situation], vil jeg gerne [fremskridt], så jeg kan [resultat].'",
        example: "\"Hvad er det egentlige job du ansætter et CRM-system til at gøre for jer?\" → \"Når vi mister overblikket over pipeline, vil vi gerne have total synlighed, så vi aldrig mister et salg pga. manglende opfølgning.\" — Det er jobbet. Sælg det.",
      },
      {
        emoji: "🌊",
        heading: "Tragtmodellen — bred til smal",
        body: "Start med brede, åbne spørgsmål og snævr progressivt ind mod specifikke behov. Brug hv-spørgsmål (hvad, hvem, hvor, hvornår, hvorfor) der ikke kan besvares med ja/nej. Cirkulære spørgsmål graver dybere inden for ét emne — lineære spørgsmål skifter til nye.",
        examples: [
          "Bredt: \"Hvad er jeres største udfordring på salgsområdet i dag?\" → Cirkulært: \"Hvad er årsagen til det?\" → \"Og hvad sker der, når det opstår?\" → Smalt: \"Hvad ville det betyde at løse præcis den del?\"",
          "\"Hvad synes du om jeres nuværende situation?\" (holdningsspørgsmål) → \"Hvilke specifikke funktioner er vigtigst for jer?\" (produktspørgsmål) — Progressionen afslører behov du aldrig ville opdage med et direkte spørgsmål.",
        ],
      },
      {
        emoji: "✅",
        heading: "Tjek og tolk — bekræft altid din forståelse",
        body: "Aldrig antag at du forstod rigtigt. Opsummér hvad du hørte og bekræft med kunden. Det viser at du lyttede, reducerer misforståelser og giver kunden mulighed for at korrigere — eller bekræfte med et kraftfuldt 'ja, præcis!'",
        example: "\"Så det jeg hører er at jeres største udfordring er X, og det koster jer cirka Y per kvartal. Fanger jeg det rigtigt?\" → Kunden: \"Præcis!\" — Nu er du eksperten der forstår dem bedre end de forstår sig selv.",
      },
      {
        emoji: "🎓",
        heading: "Challenger-tilgangen — undervis kunden om deres eget problem",
        body: "Den mest avancerede form for behovsafdækning: præsentér et indsigt kunden ikke vidste de manglede, og vis dem et problem de ikke var klar over de havde. Kunden er ikke bevidst om det reelle problem — du er eksperten der afslører det.",
        examples: [
          "\"De fleste HR-direktører tror at deres største udfordring er rekruttering. Men vores data viser at det reelle problem oftere er fastholdelse de første 12 måneder.\"",
          "\"I jeres branche koster det typisk 1,5 gange en årsløn at erstatte en medarbejder. Med 200 ansatte og 10% der forlader det første år, taler vi om en skjult omkostning på 4-5 millioner kroner. Har I kigget på det på den måde?\"",
        ],
      },
      { emoji: "📊", heading: "Brug 1-10 skalaen til at åbne dem op", body: "Selv tilfredse kunder har ting de savner. Spørg: 'Hvor tilfreds er du med din nuværende løsning, fra 1-10?' De siger måske 8. Spørg så: 'Hvad mangler du for at ramme en 10?' — Nu fortæller de dig selv hvad de vil have.", example: "Kunden: \"Jeg giver det en 7.\" Du: \"Okay, hvad er det der gør at det ikke er en 10 for dig?\" → De åbner op om præcis hvad de mangler." },
      { emoji: "🤔", heading: "Brug 'So what?'-testen", body: "For hver feature du nævner: hvad betyder det konkret for kundens hverdag? Oversæt altid features til fordele.", example: "Feature: \"Systemet opdaterer i realtid.\" So what: \"Det betyder at I aldrig sender et tilbud baseret på forældede priser.\"" },
      { emoji: "📈", heading: "Kvantificér værdien — tal er stærkere end ord", body: "Omregn altid fordele til kr., timer eller procenter. Konkrete tal er uomtvistelige og gør værdien håndgribelig.", example: "\"Det sparer jer ca. 4 timer om ugen — det er 200 timer om året, svarende til ca. 100.000 kr. i lønomkostninger.\"" },
      { emoji: "👥", heading: "Forstå beslutningsprocessen", body: "Den du taler med er ikke altid den der beslutter. Find ud af hvem der er — og involvér dem tidligt.", example: "\"Hvem er det typisk der tager den endelige beslutning på løsninger som den her?\"" },
      { emoji: "📣", heading: "Brug cases der matcher", body: "Social proof virker bedst når kunden kan genkende sig selv i historien.", example: "\"Vi har en kunde i samme branche — de oplevede præcis det her problem og løste det ved at...\"" },
    ],
    model: { name: "Tristan Tate — 5 Behovsspørgsmål (Årsag → Status → Effekt → Forbedringer → Alternativ)", items: ["Årsag — \"Kan du hjælpe mig med at forstå hvad årsagen er til det her problem?\"", "Status — \"Hvad gør du/I lige nu for at løse eller håndtere det?\"", "Effekt — \"Hvad føler du går godt med det du gør i dag?\"", "Forbedringer/Udfordringer — \"Hvilke udfordringer har du haft — og hvad føler du kunne forbedre sig?\"", "Alternativ — \"Hvis du skulle gå med en anden udbyder — hvad skulle den udbyder have for at det er interessant?\""] },
    exampleQuestions: [
      { q: "Kan du hjælpe mig med at forstå — hvad er årsagen til at du overhovedet er på udkig efter det her?", note: "Årsag — udfordrer kunden konstruktivt og bygger tillid. Ingen andre sælgere stiller dette spørgsmål." },
      { q: "Hvad gør du/I lige nu for at løse eller håndtere det?", note: "Status — forstå hvad de gør i dag og om det virker. Kunden begynder at sætte ord på problemet selv." },
      { q: "Hvad føler du går godt med det du gør i dag?", note: "Effekt — lad dem selv fortælle hvad der virker. Det giver dig kontrast til forbedringerne." },
      { q: "Hvilke udfordringer har du haft — og hvad føler du kunne forbedre sig?", note: "Forbedringer/Udfordringer — nu åbner de op om problemerne med egne ord." },
      { q: "Hvis du skulle gå med en anden udbyder end dem du har i dag — hvad skulle den udbyder have for at det er interessant for dig?", note: "Alternativ — de maler selv den ideelle løsning for dig. Det er præcis hvad du sælger dem." },
      { q: "Har jeg forstået det korrekt, at det primære problem er [X] og at det koster jer [Y]?", note: "Opsummering — viser du lyttede, positionerer dig som ekspert og giver kunden mulighed for at bekræfte." },
    ],
  },
  {
    id: "bala",
    emoji: "🔁",
    title: "BALA-modellen",
    tagline: "Behov → Accept → Løsning → Accept — den komplette salgssamtale i fire trin",
    color: "#10b981",
    quote: "\"Den der opsummerer rigtigt, ejer samtalen.\"",
    desc: "BALA er en struktureret samtalemetode der sikrer at du aldrig hopper til løsningen før kunden er klar. De fire trin — Behov, Accept, Løsning, Accept — skaber en naturlig samtale der ikke føles som et salg, men som en beslutning kunden selv tog.",
    principles: [
      {
        emoji: "🔍",
        heading: "B — Behov: forstå hvad de ønsker, frygter og vægter",
        body: "Brug åbne HV-spørgsmål (hvad, hvem, hvor, hvornår, hvorfor) til at danne et komplet billede af kunden: hvad ønsker de at opnå, hvad vil de undgå, hvad vægter de højt, og hvad har de i dag kontra hvad de drømmer om. Jo bredere og dybere du graver her, desto stærkere bliver resten af samtalen.",
        examples: [
          "\"Hvad er det vigtigst for dig at en ny løsning giver dig — hvad skal den gøre for dig?\" → Hvad de ønsker.",
          "\"Hvad har du oplevet ikke fungerer godt nok i dag?\" → Hvad de vil undgå.",
          "\"Hvis du skulle prioritere — hvad er mest afgørende for dig: pris, kvalitet, eller at det er nemt at bruge?\" → Hvad de vægter.",
          "\"Hvad har du i dag, og hvad ville det ideelle se ud som for dig?\" → Nu og fremtid — gabet der sælger løsningen.",
        ],
      },
      {
        emoji: "✅",
        heading: "A — Accept: opsummér og bekræft din forståelse",
        body: "Når du har afdækket behovet, opsummerer du hvad du hørte — præcist og i kundens eget sprog. Stil det som et spørgsmål der inviterer til bekræftelse. Det viser at du lyttede, skaber alignment, og får kunden til at sige 'ja' første gang — det første lille ja der baner vejen for det store.",
        examples: [
          "\"Så det jeg forstår er at du gerne vil have [X], at [Y] er vigtigt for dig, og at du vil undgå [Z] — er det korrekt forstået?\"",
          "\"Lad mig opsummere hvad du har fortalt mig: du har [situationen i dag], du ønsker [den fremtidige tilstand], og det der er allervigtigst for dig er [topprioritet]. Har jeg fat i det?\"",
        ],
      },
      {
        emoji: "💡",
        heading: "L — Løsning: præsentér en løsning der svarer på deres egne ord",
        body: "Nu præsenterer du en løsning — men ikke din standard-pitch. Du kobler løsningen direkte til de behov kunden selv formulerede i B og bekræftede i A. Brug kundens egne ord og prioriteter til at forklare hvorfor din løsning er det rigtige match. Det føles som om løsningen er skræddersyet — fordi den er.",
        examples: [
          "\"Du fortalte mig at [X] er vigtigst for dig og at du vil undgå [Z]. Den løsning jeg vil anbefale er [løsning] — fordi den giver dig præcis [X] og sikrer at [Z] ikke sker.\"",
          "\"Baseret på hvad du har fortalt mig — at du vægter [prioritet] højest — ville jeg foreslå [løsning]. Det giver dig [fordel 1], [fordel 2] og [fordel 3]. Det passer præcis til det du beskrev.\"",
        ],
      },
      {
        emoji: "🤝",
        heading: "A — Accept: gennemgå løsningen og hent det andet ja",
        body: "Afslut med at gennemgå løsningen konkret og spørge ind til kundens reaktion. Det er ikke closing-pres — det er en naturlig invitation til at kunden selv vurderer om det giver mening. Du henter det andet ja, der bekræfter at kunden er klar til at gå videre.",
        examples: [
          "\"Nu vil jeg gerne gennemgå løsningen med dig — du får [element 1] som vil give dig [fordel 1], du får [element 2] som løser [problem], og du får [element 3] som du sagde var vigtigt. Hvad tænker du om den løsning?\"",
          "\"Så lad mig sammenfatte hvad du får: [punkt 1], [punkt 2] og [punkt 3]. Det svarer præcis til det du beskrev i starten. Synes du det giver mening for dig?\"",
        ],
      },
      {
        emoji: "🌀",
        heading: "BALA er en cirkulær samtale — ikke et script",
        body: "BALA er ikke et fast script der køres fra start til slut. Det er en struktur du vender tilbage til. Hvis kunden rejser en ny bekymring under L, går du kortvarigt tilbage til B og spørger ind — og kører A og L igen. Det vigtige er at hvert skridt er gennemført, inden du går videre.",
        examples: [
          "Kunden reagerer på løsningen med en ny bekymring? Gå kortvarigt tilbage: \"Det er interessant — hvad er det præcist der bekymrer dig ved det?\" (B) → opsummér (A) → juster løsningen (L) → hent nyt accept (A).",
          "Brug BALA til at strukturere hele samtalen — men lad det lyde naturligt. Kunden må aldrig opleve at du følger en model. De skal opleve at du lytter og hjælper.",
        ],
      },
      {
        emoji: "🎯",
        heading: "B-fasen: spørg til hvad de IKKE vil — det er ofte vigtigere",
        body: "Mange sælgere fokuserer på hvad kunden vil have. De bedste finder ud af hvad kunden vil undgå — frygt, dårlige erfaringer, risici. Det er ofte det der reelt driver beslutningen. Spørg direkte: hvad er det vigtigste for dig at undgå?",
        examples: [
          "\"Hvad har du prøvet hidtil der ikke virkede — hvad vil du absolut undgå denne gang?\" → Kunden afslører sin egentlige frygt. Nu kan du adressere den direkte i løsningen.",
          "\"Hvad ville en dårlig beslutning se ud som for dig her?\" → Et kraftfuldt spørgsmål der afslører det kunden i virkeligheden er bange for.",
        ],
      },
      {
        emoji: "📋",
        heading: "A-fasen: brug kundens egne ord — ikke dine",
        body: "Når du opsummerer i A, brug præcis de ord kunden brugte — ikke din omformulering. Kunder reagerer stærkere på egne ord fordi de genkender dem som sande. Det er spejling i opsummeringsform.",
        examples: [
          "Kunden siger: \"Jeg vil gerne have noget der er nemt at bruge uden at jeg skal bruge dage på at lære det.\" Du i A: \"Så det vigtigste for dig er at det er nemt at bruge uden oplæring der tager lang tid — er det rigtigt forstået?\" → Kunden hører sine egne ord og bekræfter.",
          "Undgå at parafrasere for meget. \"Du vil gerne have en brugervenlig løsning\" er svagere end \"du vil gerne have noget nemt at bruge uden at bruge dage på det\" — brug kundens formulering.",
        ],
      },
    ],
    model: { name: "BALA-modellen", items: ["B — Behov: kortlæg hvad de ønsker, hvad de vil undgå, hvad de vægter og gabet mellem nu og drøm", "A — Accept: 'Så du gerne vil have X, Y og Z — er det korrekt forstået?'", "L — Løsning: præsentér en løsning koblet direkte til de behov de selv formulerede", "A — Accept: 'Lad mig gennemgå løsningen med dig — du får X og det giver dig Y. Hvad tænker du om den løsning?'"] },
    exampleQuestions: [
      { q: "Hvad er det vigtigst for dig at en ny løsning giver dig?", note: "B — ønsker: hvad de vil opnå. Åbent HV-spørgsmål." },
      { q: "Hvad har du oplevet ikke fungerer godt nok i dag?", note: "B — undgå: hvad de frygter eller har dårlige erfaringer med." },
      { q: "Hvad ville en dårlig beslutning se ud som for dig her?", note: "B — undgå (avanceret): afslører den egentlige frygt bag beslutningen." },
      { q: "Hvis du skulle prioritere — hvad er mest afgørende: pris, kvalitet eller brugervenlighed?", note: "B — vægter: finder deres topprioritet som du kobler løsningen til." },
      { q: "Hvad har du i dag, og hvad ville det ideelle se ud som for dig?", note: "B — nu vs. drøm: kortlægger gabet der sælger løsningen." },
      { q: "Så det jeg forstår er at du gerne vil have X, at Y er vigtigt for dig og at du vil undgå Z — er det korrekt forstået?", note: "A (1. accept): opsummering i kundens egne ord der inviterer det første bekræftende ja." },
      { q: "Nu vil jeg gennemgå løsningen med dig — du får X som giver dig Y, og Z som løser det du nævnte. Hvad tænker du om den løsning?", note: "A (2. accept): løsningsgennemgang der inviterer til kundens reaktion frem for at presse på lukning." },
    ],
  },
  {
    id: "afslutning",
    emoji: "✅",
    title: "Afslutning & closing",
    tagline: "Den gode close er en naturlig konsekvens af alt det der kom inden",
    color: "#f87171",
    quote: "\"Den bedste close er den, kunden ikke bemærker — fordi svaret allerede var åbenlyst.\"",
    desc: "Closing er ikke et trick du trækker frem til sidst. Det er et naturligt næste skridt når du har lyttet, forstået og skabt reel værdi. Disse teknikker er ikke til at presse — de er til at afklare og hjælpe kunden tage en god beslutning.",
    principles: [
      {
        emoji: "⚖️",
        heading: "Best case vs. worst case — og er worst case bedre end nu?",
        body: "Hjælp kunden se begge scenarier konkret. Hvad sker der i bedste fald hvis de handler? Og hvad er det værst tænkelige der kan ske? Stil derefter det afgørende spørgsmål: er det worst case stadig bedre end det de har nu?",
        examples: [
          "\"Lad os tage det bedste scenarie: det virker præcis som vi håber — hvad ville det betyde for jer?\" → \"Okay, og hvad er det værst tænkelige der kan ske?\" → \"Er selv det worst case bedre end det I sidder med i dag?\"",
          "Kunden er bange for at skifte CRM-system. Du: \"Hvad er det bedste der kan ske?\" → \"Og hvad er det allerværste?\" → \"Okay — er det allerværste stadig bedre end de problemer I har med jeres nuværende system?\" Næsten altid: ja.",
        ],
      },
      {
        emoji: "🗺️",
        heading: "Hvad er din plan B?",
        body: "Hvis I ikke indgår et samarbejde i dag — hvad er så kundens plan? Det er ikke et pres. Det er et ægte spørgsmål der hjælper kunden tænke over hvad alternativet faktisk er. Ofte er der ingen reel plan B.",
        examples: [
          "\"Det er selvfølgelig okay at vi ikke starter noget i dag — men hvis vi to ikke indgår et samarbejde, hvad er så din plan B? Jeg vil bare gerne forstå den del.\"",
          "Kunden siger de vil tænke over det. Du: \"Absolut, det respekterer jeg. Bare lige for at forstå — hvad er planen hvis I ikke gør noget ved det her? Hvad gør I så i stedet?\" → Tavsheden fortæller dig meget.",
        ],
      },
      {
        emoji: "🤝",
        heading: "Jeg vil det her mere end jer — og det må ikke ske",
        body: "Hvis du vil salget mere end kunden vil have løsningen, er der noget galt. Brug denne teknik til at sætte bolden hos kunden og signalere at du er der for at hjælpe — ikke for at sælge for enhver pris.",
        examples: [
          "\"Jeg vil virkelig gerne hjælpe jer med [xyz] — men det må ikke være sådan at jeg vil det her mere end at I selv vil. Så er det okay med jer at vi gør alt hvad vi kan for at sikre at I opnår [xyz]?\"",
          "\"Jeg kan mærke at det her giver mening for dig, men jeg vil aldrig sælge noget til nogen der ikke selv er overbevist. Føler du at det her er noget du vil have — eller vil du have mere tid til at tænke?\"",
        ],
      },
      {
        emoji: "🔍",
        heading: "Mit job er ikke at presse — men at sikre 100%",
        body: "Positionér dig som rådgiver, ikke sælger. Dit job er at sikre at kunden har den bedste løsning. Hvis der er bare 1% tvivl tilbage, vil du gerne høre hvad det er — så I kan få det dækket.",
        examples: [
          "\"Mit job er ikke at presse dig eller tage en beslutning for dig — men at sørge for at du har den bedste løsning. Hvis du ikke er helt 100%, og der bare er 1% du mangler, vil jeg rigtig gerne høre hvad det er, så vi kan få den del dækket.\"",
          "\"Er der noget der holder dig igen? Selv den mindste ting — jeg vil hellere have vi taler om det nu end at du sidder og tænker på det bagefter.\"",
        ],
      },
      {
        emoji: "✅",
        heading: "Giver det mening? → Kan det hjælpe dig? → Skal vi gå videre?",
        body: "En trinvis close der bekræfter forståelse og oplevelse af værdi, inden du beder om beslutningen. Hvert ja er et lille commitment der gør det næste ja mere naturligt.",
        examples: [
          "\"Ud fra det vi har set — føler du at det giver mening?\" [Ja] → \"Super. Og alt det vi gennemgik — er det noget du føler vil kunne hjælpe dig også?\" [Ja] → \"Fedt — skal vi så ikke gå videre i processen?\"",
          "Brug det som en naturlig tjekliste: mening ✓ → kan hjælpe ✓ → videre ✓. Hvert svar bekræfter det næste. Ingen føler sig presset fordi de selv sagde ja hele vejen.",
        ],
      },
      {
        emoji: "🧠",
        heading: "Ville det være en dum idé?",
        body: "En reframet close der gør det svært at sige nej. Hvis kunden allerede har bekræftet at løsningen giver mening og kan hjælpe dem — er det så en dum idé at gå videre? Det er næsten umuligt at svare ja til.",
        examples: [
          "\"Hvis du synes alt det vi gennemgik gav mening for dig, og du føler at denne løsning kan hjælpe dig med det du har brug for — ville det så være en dum idé at gå videre med det her?\"",
          "\"Du sagde selv at det her løser [problem]. Du sagde det giver mening. Og du sagde du mangler netop det her. Givet alt det — ville det så give mening at lade være?\"",
        ],
      },
      {
        emoji: "🎤",
        heading: "Lad kunden sælge produktet til sig selv",
        body: "Den stærkeste close er den hvor kunden begynder at forklare dig hvorfor det giver mening for dem. Stil spørgsmålet, og lyt. De sælger selv — og det de selv siger, tror de på.",
        examples: [
          "\"Føler du ud fra det jeg har vist, at det her kunne give mening for jer?\" [Ja] → \"Okay fedt — hvad er det der specifikt fik dig til at tænke at det her ville kunne hjælpe dig?\"  → Nu forklarer de dig præcis hvad de synes skaber værdi. De sælger produktet til sig selv.",
          "Efter kundens svar: lyt aktivt, nik og gentag det vigtigste tilbage: \"Så det der resonerede mest med dig var [X] — forstår jeg rigtigt?\" → De bekræfter, og du har nu deres eget argument for at købe.",
        ],
      },
      {
        emoji: "📅",
        heading: "Antagende closing — antag at beslutningen er taget",
        body: "Brug den når købssignalerne er stærke. Du antager trygt at salget er aftalt og diskuterer næste skridt — implementering, levering, onboarding — som om beslutningen allerede er taget. Det er ikke manipulation; det er at hjælpe kunden over den sidste mentale barriere.",
        examples: [
          "\"Godt, så kan vi starte installationen mandag — eller ville onsdag passe bedre?\"",
          "\"Hvem på dit team skal vi involvere i onboarding-processen?\" → Du er allerede i gang med implementeringen i samtalen. Kunden følger naturligt med.",
        ],
      },
      {
        emoji: "🔀",
        heading: "Alternativ-closing — giv valget mellem to ja'er",
        body: "Tilbyd to muligheder der begge fører til et salg, i stedet for et ja/nej-spørgsmål. Valget mellem to positive muligheder eliminerer ja/nej-binæret og reducerer beslutningstræthed — kunden fokuserer på hvilken version, ikke om.",
        examples: [
          "\"Foretrækker du den kvartalsvise eller den årlige plan?\"",
          "\"Vil du starte med den fulde pakke, eller vil du begynde med basis og bygge op?\" → Begge svar er et ja. Kunden vælger — og køber.",
        ],
      },
      {
        emoji: "📋",
        heading: "Opsummerings-closing — gennemgå alt det aftalte",
        body: "Ideel til komplekse B2B-salg med lange cykler. Gennemgå alle nøglefordele og aftalte punkter, og bed derefter om forpligtelse. Opsummeringen minder kunden om alt det de har sagt ja til undervejs — og gør det endelige ja til det logiske næste skridt.",
        examples: [
          "\"Lad mig opsummere hvad vi har diskuteret: I får enterprise-planen med 24/7 support, tilpassede integrationer og dedikeret onboarding — alt til den pris vi aftalte. Skal jeg sende kontrakten?\"",
          "\"Vi er enige om at [problem], vi er enige om at [løsning] adresserer det, og vi er enige om at [ROI]. Er der noget der holder dig igen fra at gå videre nu?\"",
        ],
      },
      {
        emoji: "🌡️",
        heading: "Trial-closing — temperaturcheck undervejs",
        body: "Bruges løbende i samtalen — ikke kun til sidst — til at måle kundens parathed. Positive svar bekræfter at du er på rette spor. Negative svar giver dig rum til at adressere bekymringer inden de vokser sig store.",
        examples: [
          "\"Hvordan lyder det indtil videre?\" → Positivt svar: fortsæt mod closing. Negativt svar: du har stadig rum til at justere.",
          "\"På en skala fra 1-10 — hvor tæt er vi på at komme videre?\" → De siger 7: \"Hvad mangler for at det er en 10?\" → De afslører præcis hvad der holder dem igen.",
        ],
      },
      {
        emoji: "❤️",
        heading: "Føler du at det her er det rette for dig?",
        body: "En empatisk close der inviterer kunden til selv at sætte ord på værdien. Kombinér pause, årsagsspørgsmål og specifikhedsspørgsmål — og lad kunden lande naturligt på beslutningen.",
        examples: [
          "\"Føler du at det her kunne være…\" [pause] \"…det rette for dig — svaret for dig?\" [Ja] → \"Okay fedt, hvad får dig til at sige det?\" [Kunden fortæller] → \"Hvilke specifikke aspekter af alt det vi har gennemgået, føler du, vil hjælpe dig mest?\" [Kunden svarer] → \"Jamen jeg har egentlig ikke mere at sige — det lyder som om du kan lide ideen og synes den er fornuftig. Vil det så være passende at vi går videre?\"",
          "Pausen efter 'kunne være' er afgørende — den giver kunden rum til at mærke efter. Når de svarer, graver du dybere med årsagsspørgsmålet, og til sidst fremstår closing som en logisk konsekvens af det de selv sagde.",
        ],
      },
      {
        emoji: "💡",
        heading: "Giver det mening? → Kan du lide ideen? → Er prisen fornuftig? → Skal vi gå videre?",
        body: "En tre-trins close der bygger sammenhængende ja'er: forståelse → lyst → pris → beslutning. Hvert skridt bekræfter det forrige og gør det endelige ja til det eneste logiske svar.",
        examples: [
          "\"Ift. det vi har gennemgået og det jeg har vist dig — giver det nogenlunde mening?\" [Ja] → \"Fedt, og hvad dine tanker — kan du lide ideen?\" [Ja] → \"Super, det er jo det vigtigste. Og du synes også at prisen er fornuftig?\" [Ja] → \"Jamen det virker som om alting er på plads — er det okay med dig at vi går videre?\"",
          "Sekvensen er designet så hvert ja naturligt leder til det næste. Kunden sætter ikke spørgsmålstegn ved closing fordi de allerede har bekræftet alle tre forudsætninger.",
        ],
      },
      {
        emoji: "⚖️",
        heading: "A eller B — hvilken læner du dig imod?",
        body: "Tilbyd to konkrete muligheder og spørg hvilken kunden læner sig imod. Det eliminerer ja/nej og giver kunden ejerskab over valget — begge svarer er et ja.",
        examples: [
          "\"Hvilken en læner du dig helst imod? Vil du hellere gå med PC1 til 7.500 kr. eller PC2 til 10.000 kr.?\" → Uanset svar har kunden valgt — og valgt at købe.",
          "Brug altid konkrete navne og priser. Jo mere specifikt valget er, desto mere reelt føles det for kunden — og desto lettere er det at svare.",
        ],
      },
      {
        emoji: "✔️",
        heading: "Det dækker dine behov og virker fornuftigt — er det korrekt forstået?",
        body: "Opsummer hele samtalen i ét spørgsmål, få en bekræftelse, og gør derefter closing til en logisk konklusion: hvis alt er på plads, ville det så give mening IKKE at gå videre?",
        examples: [
          "\"Men det virker som om alt det vi har gennemgået dækker dine behov — og at du synes det er fornuftigt til en god pris. Er det korrekt forstået?\" [Ja] → \"Super, jamen — vil det være en dum idé hvis vi gik videre?\"",
          "Formuleringen 'vil det være en dum idé' er bevidst. Kunden har netop bekræftet at alt giver mening og prisen er fornuftig — det er næsten umuligt at sige ja til at det er en dum idé.",
        ],
      },
    ],
    model: { name: "Closing-trappen", items: ["Skab forståelse — giver det mening?", "Bekræft værdi — kan det hjælpe dig?", "Afdæk tvivl — er der noget der holder dig igen?", "Bed om beslutningen — naturligt og uden pres"] },
  },
];

// ─── Quiz data ────────────────────────────────────────────────────────────────

type QuizQuestion = {
  topic: string;
  q: string;
  options: string[];
  correct: number;
  explanation: string;
};

const QUIZ: QuizQuestion[] = [
  // ── Sælger-mindset (10 spørgsmål) ──
  { topic: "Sælger-mindset", q: "Hvad er MMM (Make Money Minimal)?", options: ["En teknik til at sætte prisen op", "At bryde prisen ned til mindste enhed og sætte den op mod konkret værdi", "At give rabat til alle kunder", "En model for at undgå prisforhandling"], correct: 1, explanation: "MMM handler om at gøre store priser små ved at dele dem ned — fx 33 kr./md. i stedet for 2.000 kr. — og altid sætte prisen op mod den konkrete værdi kunden får." },
  { topic: "Sælger-mindset", q: "Hvad sker der når du er oprigtigt engageret og begejstret over dit produkt?", options: ["Kunden bliver skeptisk", "Det smitter og kunden begynder at se produktet på samme måde", "Kunden føler sig presset", "Ingenting — kunder er kun interesserede i prisen"], correct: 1, explanation: "Begejstring smitter. Hvis du snakker om dit produkt som om det er ligegyldigt, kan kunden ligeså godt spørge ChatGPT. Ægte entusiasme er ikke til at kopiere." },
  { topic: "Sælger-mindset", q: "Hvad er reel urgency skabt af?", options: ["Kunstige deadlines som 'tilbuddet gælder kun i dag'", "Fear of missing out på et godt tilbud", "Smerten ved status quo — hvad det koster kunden IKKE at handle", "At fortælle kunden at andre er ved at købe"], correct: 2, explanation: "Kunstig urgency ødelægger tillid. Reel urgency opstår når kunden fuldt ud forstår hvad det koster dem at fortsætte som de gør nu." },
  { topic: "Sælger-mindset", q: "Hvad er kernen i 'rådgiver frem for sælger'-princippet?", options: ["At give kunden gratis rådgivning uden at sælge", "At hjælpe kunden finde den bedste løsning — selv om det ikke er dit produkt", "At undgå at nævne prisen", "At tale mindre og skrive mere"], correct: 1, explanation: "Det øjeblik du lyder som en sælger, sætter kunden skjoldet op. En rådgiver er villig til at sige 'det her er ikke det rigtige for dig' — og den ærlighed bygger massiv tillid." },
  { topic: "Sælger-mindset", q: "Hvad er princippet 'folk tror mere på det de selv siger' et udtryk for?", options: ["At du ikke skal tale om produktet overhovedet", "At du skal stille spørgsmål der leder kunden til selv at konkludere løsningens værdi", "At kunden altid har ret", "At du skal lytte og ikke sige noget"], correct: 1, explanation: "Hvis du siger at dit produkt er godt, er det salgssnak. Hvis kunden selv siger det — er det sandt. Stil spørgsmål der fører dem mod konklusionen, og lad dem sige det selv." },
  { topic: "Sælger-mindset", q: "Hvad er formålet med at 'fremhæve problemet inden du præsenterer løsningen'?", options: ["At forsinke salget bevidst", "At få kunden til at forstå og mærke smerten ved status quo — kontrasten sælger", "At undgå at nævne dit produkt for tidligt", "At gøre kunden utryg med vilje"], correct: 1, explanation: "Få kunden til at forstå og mærke problemet fuldt ud: hvad koster det, hvad stopper det dem i, hvad mister de? Derefter spørg hvad det ville betyde at løse det. Kontrasten sælger." },
  { topic: "Sælger-mindset", q: "Hvad sker der hvis du bruger fraseringer som 'jeg tror måske' eller 'det er jeg ikke helt sikker på'?", options: ["Det gør dig mere sympatisk og menneskelig", "Det undergraver din troværdighed — usikkerhed smitter", "Det viser at du er ærlig", "Det giver kunden mere tillid til dig"], correct: 1, explanation: "Usikkerhed i sprogbrug signalerer manglende ekspertise. Kunder køber ikke fra folk der virker usikre. Præcision og ro signalerer autoritet — og det smitter." },
  { topic: "Sælger-mindset", q: "Hvad er den bedste måde at forberede sig til et salgsmøde på?", options: ["Øve sit standard-pitch mange gange", "Researche kunden på LinkedIn, hjemmeside og nyheder og nævne noget specifikt", "Forberede en stor rabat i baglommen", "Huske alle produktets features udenad"], correct: 1, explanation: "Jo mere du ved om kundens situation, behov og problemer, desto mere præcist kan du ramme dem. Research skaber troværdighed og tillid fra start." },
  { topic: "Sælger-mindset", q: "Hvad betyder det at 'udfordre kunden' i en salgskontekst?", options: ["At argumentere imod alt kunden siger", "Respektfuldt stille spørgsmålstegn ved kundens antagelser for at vise at du genuint hjælper", "At provokere kunden for at få en reaktion", "At sige at kunden tager fejl"], correct: 1, explanation: "Sælgere siger altid ja. Rådgivere udfordrer. Når du respektfuldt udfordrer en antagelse, viser du at du genuint prøver at hjælpe — og det er her reel tillid opstår." },
  { topic: "Sælger-mindset", q: "Et produkt koster 18.000 kr./år. Kunden bruger i dag 8 timer/uge manuelt à 400 kr./time. Hvad er den korrekte MMM-fremstilling?", options: ["'Det koster kun 18.000 kr. — det er ikke så meget'", "'Det er 1.500 kr./md. — vs. 13.000 kr./md. i manuelle omkostninger. Vil du bruge 1.500 for at spare 13.000?'", "'Vi giver dig 10% rabat hvis du køber i dag'", "'Det er billigere end vores konkurrenter'"], correct: 1, explanation: "MMM: bryd prisen ned (18.000 → 1.500/md.) og stil den op mod den konkrete værdi (8t × 400 kr. × 4 uger = 12.800 kr./md.). Kontrasten gør beslutningen indlysende." },

  // ── Aktiv lytning (10 spørgsmål) ──
  { topic: "Aktiv lytning", q: "Hvad er den ideelle taleratio for en sælger?", options: ["70% sælger, 30% kunde", "50/50", "30% sælger, 70% kunde", "80% sælger, 20% kunde"], correct: 2, explanation: "Sælgeren skal tale 30% — kunden 70%. Hvis du taler mere end kunden, stiller du ikke nok spørgsmål og lærer ikke nok om deres situation." },
  { topic: "Aktiv lytning", q: "Hvad indebærer aktiv lytning ud over at høre ordene?", options: ["At tage noter mens kunden taler", "At lytte med kroppen — nikke, lave bekræftende lyde, vise du er mentalt til stede", "At gentage alt kunden siger ord for ord", "At afbryde med relevante spørgsmål løbende"], correct: 1, explanation: "Aktiv lytning er at lytte med hele kroppen. Nik med hovedet, lav lyde som 'hmm, giver mening' og vis kunden at du er mentalt til stede — ikke bare venter på din tur." },
  { topic: "Aktiv lytning", q: "Hvad er lytteniveauernes laveste niveau (som du skal undgå)?", options: ["Registrere ord", "Empatisk lytning", "Indre monolog — du tænker på dit eget svar", "Forstå mening og kontekst"], correct: 2, explanation: "Indre monolog er det laveste niveau — du 'lytter' men tænker reelt på hvad du selv vil sige. Kunden mærker det, og det ødelægger relationen." },
  { topic: "Aktiv lytning", q: "Hvad signalerer aktiv lytning ifølge princippet om at 'spørge ind'?", options: ["At du forbereder dit næste argument", "At du er interesseret og vil forstå dybere", "At du ikke forstod hvad kunden sagde", "At du er usikker på dit produkt"], correct: 1, explanation: "'Arh okay, hvad var årsagen til det?' er aktiv lytning i praksis. Det viser kunden at du ikke bare modtager information — du er genuint interesseret i at forstå." },
  { topic: "Aktiv lytning", q: "Hvad skal du gøre når kunden pauser efter du har stillet et spørgsmål om pris?", options: ["Stille et nyt spørgsmål for at hjælpe dem videre", "Tilbyde en rabat med det samme", "Vente og lade dem tale — pausen indeholder vigtig information", "Gentage spørgsmålet"], correct: 2, explanation: "Der gemmer sig tit vigtig information i pauser og tøven. Kunden pauser efter prisemnet? Vent og lad dem tale. Det du lærer i den pause er mere værd end dit næste argument." },
  { topic: "Aktiv lytning", q: "Hvad er det korrekte svar på kundens udsagn: 'Vi skiftede system for et år siden'?", options: ["'Det er rigtig godt — vores system er endnu bedre'", "'Arh okay — hvad var årsagen til at I skiftede?'", "'Hvornår udløber jeres kontrakt?'", "'Det lyder som om I er åbne for forandringer'"], correct: 1, explanation: "Det er aktiv lytning i praksis: spørge ind frem for at svare. Du viser interesse og graver dybere — og får guld-information om hvad der driver deres beslutninger." },
  { topic: "Aktiv lytning", q: "Hvad er teknikken 'omformuler og bekræft' beregnet til?", options: ["At vise at du er klogere end kunden", "At vise forståelse og skabe tillid ved at gentage kundens pointe med egne ord", "At korrigere hvad kunden sagde forkert", "At fylde tavshed i samtalen"], correct: 1, explanation: "'Så det du egentlig siger er at X er problemet — er det rigtigt forstået?' Det viser kunden at du forstår dem og skaber øjeblikkelig tillid." },
  { topic: "Aktiv lytning", q: "Hvad bør du gøre fysisk for at signalere aktiv lytning?", options: ["Sidde afslappet med armene over kors", "Kigge ned i dine noter mens kunden taler", "Lægge pennen, lukke laptopen og lytte med hele kroppen — øjenkontakt og fremoverlænet", "Stå op for at vise energi"], correct: 2, explanation: "Fysisk tilstedeværelse signalerer mental tilstedeværelse. Øjenkontakt og fremoverlænet kropssprog viser kunden at du er fuldt til stede." },
  { topic: "Aktiv lytning", q: "Hvad sker der ifølge princippet om personlige interesser, når kunden nævner at de sætter pris på ærlighed?", options: ["Du skal skifte emne og tale om produktet", "Du noterer det og spejler det i din kommunikation: 'Jeg vil gerne være helt ærlig med dig om...'", "Du lover dem en god aftale", "Du fortæller dem om din virksomheds værdier"], correct: 1, explanation: "Bag ethvert forretningsmøde er et menneske med egne værdier. Opfang signalerne og spejl dem — pludselig taler I samme sprog, og tilliden opstår naturligt." },
  { topic: "Aktiv lytning", q: "Hvad er det øverste lytteniveau (som du bør stræbe efter)?", options: ["Registrere ord", "Forstå mening", "Empatisk lytning — forstå følelserne bag ordene", "Indre monolog"], correct: 2, explanation: "Empatisk lytning er det højeste niveau: du forstår ikke bare hvad kunden siger og hvorfor — du forstår de følelser der driver det. Det er her reel forbindelse opstår." },

  // ── Indvendingshåndtering (10 spørgsmål) ──
  { topic: "Indvendingshåndtering", q: "Hvad står LAER-modellen for?", options: ["Lær, Analyser, Evaluér, Resultat", "Lyt, Anerkend + empati, Efterforsk, Reager", "Lyt, Argumentér, Evaluér, Reager", "Led, Anerkend, Effektivér, Reaktion"], correct: 1, explanation: "LAER: Lyt → Anerkend + vis empati → Efterforsk ('du fortalte mig også at X var vigtigt, ik?') → Reager ('og derfor betaler du lidt mere — fordi du præcis får de fordele du sagde var vigtige. Hvad synes du selv?'). Rækkefølgen er afgørende — ingen reaktion før du har lyttet og forstået." },
  { topic: "Indvendingshåndtering", q: "Hvad er Spejlings-teknikken?", options: ["At kopiere kundens kropssprog", "At gentage kundens sidste 2-3 ord i en spørgende tone så de uddyber frivilligt", "At vise kunden et spejl af deres problem", "At reflektere kundens egne ord direkte tilbage"], correct: 1, explanation: "Kunde: 'Vi vil gerne tilmelde os, men jeres produkt er lidt uden for vores budget.' Sælger: 'Uden for jeres budget?' → Kunden uddyber frivilligt hvad budget faktisk betyder for dem." },
  { topic: "Indvendingshåndtering", q: "Hvad er Labeling-teknikken i indvendingshåndtering?", options: ["At sætte en etikette på produktets fordele", "At sætte ord på den emotion du observerer hos kunden — det fremkalder ufiltrerede svar", "At kategorisere indvendingstypen inden du svarer", "At navngive den type kunde du har med at gøre"], correct: 1, explanation: "'Det lyder som om integrationen bekymrer dig.' → Kunden: 'Ja, faktisk — vi har haft problemer med det tidligere.' Labeling omgår den analytiske del af hjernen og fremkalder ægte svar." },
  { topic: "Indvendingshåndtering", q: "Hvad er Accusation Audit?", options: ["En gennemgang af kundens tidligere leverandørproblemer", "At proaktivt tage fat på alt det negative kunden måske tænker — inden de siger det", "En teknik til at finde kundens budget", "At stille kunden til ansvar for en fejlbeslutning"], correct: 1, explanation: "'Du tænker sikkert at det her lyder dyrt, og at dit team allerede har for mange værktøjer at lære.' Kunden siger: 'Nej, faktisk...' — du afvæbner spændinger før de opstår og vender bevisbyrden." },
  { topic: "Indvendingshåndtering", q: "Hvad er de tre trin i Feel-Felt-Found-teknikken i den rigtige rækkefølge?", options: ["Social proof → Validér → Positivt resultat", "Validér følelsen → Social proof fra andre kunder → Positivt resultat", "Positivt resultat → Validér → Social proof", "Social proof → Positivt resultat → Validér"], correct: 1, explanation: "1) 'Jeg forstår hvordan du har det med prisen...' (validerer) → 2) 'Mange kunder følte det på samme måde...' (social proof) → 3) 'Det de fandt ud af var at ROI oversteg investeringen med 35%.' (resultat)" },
  { topic: "Indvendingshåndtering", q: "Kunden siger 'det er for dyrt'. Du spørger: 'Hvis prisen ikke var et problem, ville du så købe?' — og de svarer NEJ. Hvad betyder det?", options: ["Du skal give en stor rabat", "Der er en anden og dybere indvending bag prisindsigelsen", "Salget er tabt", "Du skal præsentere et billigere alternativ"], correct: 1, explanation: "Prisen er sjældent det reelle problem. Når kunden svarer nej på det spørgsmål, er der en anden indvending — manglende tillid, usikkerhed om value eller forkert timing." },
  { topic: "Indvendingshåndtering", q: "Kunden siger: 'Vi klarer os fint med vores nuværende løsning.' Hvad er den bedste åbning?", options: ["'Vores løsning er klart bedre — lad mig vise dig hvorfor'", "'Hvad ville du ændre eller forbedre ved jeres nuværende process, hvis du kunne?'", "'Hvornår udløber jeres nuværende kontrakt?'", "'Hvem er jeres nuværende leverandør?'"], correct: 1, explanation: "Udforsk nysgerrigt frem for at angribe. 'Bare af nysgerrighed — hvis du kunne forbedre bare én ting...' Svaret afslører det åbne behov kunden selv ikke vidste de havde." },
  { topic: "Indvendingshåndtering", q: "Kunden siger 'Jeg har aldrig hørt om jer'. Hvad er den stærkeste respons?", options: ["'Vi er et nyt firma men vokser hurtigt'", "'Vil du se vores hjemmeside?'", "Anerkend det, nævn kendte kunder og foreslå et pilotprojekt for at reducere risikoen", "'Jeg kan give dig en god introduktionspris'"], correct: 2, explanation: "'Vi er betroet af [kendte kunder]. [Navn] kendte os heller ikke — men efter et pilotprojekt oplevede de 40% forbedring inden for 90 dage. Ville et pilotprojekt give mening for at reducere risikoen?' Et pilot sænker barrieren markant." },
  { topic: "Indvendingshåndtering", q: "Kunden siger 'Jeg skal snakke med min chef'. Hvad er den mest proaktive tilgang?", options: ["Accepter det og vent på at de ringer tilbage", "Spørg hvornår du kan ringe igen", "Tilbyd at udarbejde en one-pager til chefen eller foreslå et kort fælles opkald hvor du besvarer chefens spørgsmål direkte", "Send en detaljeret mail med alle produktets features"], correct: 2, explanation: "Identificér altid beslutningsprocessen tidligt. Når kunden nævner chefen, så grib initiativet: 'Ville det hjælpe hvis vi satte et 15-minutters opkald op? Hvad ville være vigtigst for vedkommende?'" },
  { topic: "Indvendingshåndtering", q: "Hvad er det vigtigste princip i 'L' (Lyt) i LAER-modellen?", options: ["At tage detaljerede noter af alt kunden siger", "At give fuld opmærksomhed, bruge stilhed som redskab og afbryde ikke", "At lytte efter prissignaler", "At forberede dit næste spørgsmål mens kunden taler"], correct: 1, explanation: "Lyt ikke bare til ordene — lyt til det der IKKE bliver sagt. Pauser, tøven og tone afslører den reelle bekymring. Brug stilhed aktivt: afbryd ikke, og vent til kunden er færdig." },

  // ── Relationsopbygning (10 spørgsmål) ──
  { topic: "Relationsopbygning", q: "Hvad er en 'service promise'?", options: ["En garanti skrevet i kontrakten", "En konkret udtalelse om hvad du vil gøre for kunden — uanset om de handler eller ej", "Et løfte om at ringe tilbage inden for 24 timer", "En rabat du giver til loyale kunder"], correct: 1, explanation: "'Jeg skal nok sørge for at finde den bedste løsning til dig — og hvis vi ikke har det rigtige, retleder jeg dig til hvor du kan finde det.' Den ærlighed er et af de stærkeste tillidsbyggende værktøjer." },
  { topic: "Relationsopbygning", q: "Hvorfor kan det styrke tilliden at nævne en grund til IKKE at handle med dig?", options: ["Det er aldrig en fordel i salg", "Det viser at du ikke kun tænker på dig selv — og opbygger paradoksal tillid", "Det sænker prisen automatisk", "Det giver kunden tid til at tænke over det"], correct: 1, explanation: "Frivilligt at nævne en ulempe viser ærlighed og at du er der for kundens bedste — ikke for din provision. Det er det modsatte af hvad kunden forventer og skaber stærk tillid." },
  { topic: "Relationsopbygning", q: "Hvad sker der hvis du kan beskrive kundens problem bedre end de selv kan?", options: ["Kunden bliver defensiv og lukker af", "De ser dig automatisk som løsningen til problemet", "De vil forhandle hårdere på prisen", "Ingenting — det har ingen effekt"], correct: 1, explanation: "Hvis du sætter præcise ord på kundens problem bedre end de selv kan, sker der magi: de stoler øjeblikkeligt på at du forstår dem og ser dig som den der kan løse det." },
  { topic: "Relationsopbygning", q: "Hvad er det vigtigste ved at være 100% confident i dit sprog?", options: ["Det gør dig bedre til at forhandle pris", "Det viser autoritet og sikkerhed — og usikkerhed smitter begge veje", "Det intimiderer kunden til at sige ja", "Det gør dig immun over for indvendinger"], correct: 1, explanation: "Kunder køber ikke fra folk der virker usikre. 'Jeg tror måske at...' undergraver din troværdighed. Ro og præcision signalerer ekspertise — og det smitter." },
  { topic: "Relationsopbygning", q: "Hvad er det øverste trin i Tillidstrappen?", options: ["Sympati", "Troværdighed", "Tillid", "Loyalitet — de vælger dig igen og anbefaler dig videre"], correct: 3, explanation: "Tillidstrappen: Sympati → Troværdighed → Tillid → Loyalitet. Loyalitet er toppen — kunder der aktivt anbefaler dig videre er resultatet af en fuldt udviklet relation." },
  { topic: "Relationsopbygning", q: "Du ser et billede af en båd på væggen hos kunden. Hvad er den bedste åbning?", options: ["'Lad mig præsentere jer vores produkt'", "'Er du sejler? Hvor sejler du henne?' — og lyt genuint i de næste 10 minutter", "'Nydelig kontor I har'", "'Lad os komme i gang — jeg ved din tid er kostbar'"], correct: 1, explanation: "Folk åbner sig når de taler om det der betyder noget for dem. 10 minutter om sejlads skaber en relation der overgår enhver salgspitch. Produktet kan vente." },
  { topic: "Relationsopbygning", q: "Hvad er fælles interessers rolle i relationsopbygning?", options: ["Det er irrelevant i B2B-salg", "Fælles interesser rykker dig fra fremmed til bekendt og ændrer hele samtaledynamikken", "Det er kun nyttigt ved første møde", "Det bruges til at aflede fra prisen"], correct: 1, explanation: "Kunden nævner at de løber. Du løber også. I de næste 5 minutter er I ikke sælger og kunde — I er to løbere. Den relation er guld og oversætter sig direkte til tillid." },
  { topic: "Relationsopbygning", q: "Hvad sker der når du stopper op og spørger: 'Det lyder virkelig frustrerende — har det påvirket jer meget?'", options: ["Kunden bliver irriteret over at du ikke fokuserer på løsningen", "Det viser empati og får kunden til at åbne sig endnu mere", "Du mister kontrollen over samtalen", "Kunden vil have lavere pris som kompensation"], correct: 1, explanation: "Folk mærker hvornår de bliver hørt. Empati og aktiv lytning er den mest undervurderede form for relationsopbygning — det åbner kunden og skaber dyb tillid." },
  { topic: "Relationsopbygning", q: "Hvad er princippet 'grin og joke lidt' baseret på?", options: ["At humor altid lukker et salg", "At afslappethed og humor viser at du er menneskelig — og sænker kundens parader", "At kunden glemmer at evaluere produktet kritisk", "At en joke altid er det bedste icebreaker"], correct: 1, explanation: "Sælgere er stive. Venner er afslappede. Jo mere du opfører dig som en ven der giver et ærligt råd, desto mere sænker kunden paraderne. Humor er menneskelig kontakt." },
  { topic: "Relationsopbygning", q: "Hvad er formålet med at virkelig ville hjælpe frem for at ville sælge?", options: ["At undgå at få ordren", "At folk mærker forskel og åbner sig — salget følger naturligt af ægte hjælpsomhed", "At du giver mere gratis rådgivning", "At undgå at nævne prisen for tidligt"], correct: 1, explanation: "'Jeg er ikke sikker på om det her er det rigtige for dig endnu.' Den sætning fra en rådgiver skaber mere tillid end 10 salgspitches. Salget følger af sig selv." },

  // ── Kundebehov & værdiskabelse (10 spørgsmål) ──
  { topic: "Kundebehov & værdiskabelse", q: "Hvad er SPIN-modellens 'I' — og hvorfor er det det mest kraftfulde trin?", options: ["Introduktion af dit produkt — det starter salget", "Implikationsspørgsmål — forstørrer konsekvenserne og skaber naturlig urgency", "Interessentspørgsmål — kortlægger hvem der beslutter", "Information — indsamling af data om kunden"], correct: 1, explanation: "Implikationsspørgsmål er de sværeste at stille godt, men de mest værdifulde: 'Hvad koster det jeres organisation, når den proces tager tre dage i stedet for tre timer?' Kunden erkender selv hvad det koster dem ikke at handle." },
  { topic: "Kundebehov & værdiskabelse", q: "Hvad er formålet med SPIN's Need-Payoff-spørgsmål?", options: ["At fortælle kunden om dit produkts pris", "At hjælpe kunden selv artikulere værdien af en løsning med egne ord", "At bekræfte at kunden har budget", "At sammenligne dit produkt med konkurrenten"], correct: 1, explanation: "'Hvis I kunne automatisere det trin og spare 10 timer om ugen — hvad ville dit team fokusere på i stedet?' Kunden beskriver med egne ord hvad løsningen vil betyde — og det de selv siger, tror de på." },
  { topic: "Kundebehov & værdiskabelse", q: "Hvad er kernen i Gap Selling-frameworket?", options: ["At sælge hurtigst muligt ved at minimere spørgsmål", "At kortlægge nuværende tilstand, ønsket fremtid og gapet — og gøre gabet så synligt og stort som muligt", "At undgå at tale om problemer og fokusere på løsninger", "At sammenligne kunden med konkurrenter"], correct: 1, explanation: "Ingen køber medmindre deres nuværende situation føles uholdbar. Gapet er urgency. 'Beskriv hverdagen nu' → 'Beskriv det ideelle om 12 måneder' → kontrasten sælger sig selv." },
  { topic: "Kundebehov & værdiskabelse", q: "Hvad er MEDDIC-frameworkets 'Economic Buyer'?", options: ["Den person der bruger produktet dagligt", "Personen med budgetautoritet — den der kan sige endeligt ja", "Den der evaluerer de tekniske kriterier", "Den interne fortaler for din løsning"], correct: 1, explanation: "Economic Buyer er personen med budgetautoritet. Taler du ikke med dem, risikerer du at miste salget i et møde du ikke var med til. 'Hvem er det der i sidste ende godkender en investering på dette niveau?'" },
  { topic: "Kundebehov & værdiskabelse", q: "Hvad er Jobs-to-Be-Done-perspektivets kerneindsigt?", options: ["Kunder køber produkter baseret på features og pris", "Kunder 'ansætter' produkter til at få et job gjort — forstå jobbet og du forstår behovet", "Kunder køber baseret på brand og tillid alene", "Kunder køber det billigste produkt der løser problemet"], correct: 1, explanation: "Jobformatet: 'Når [situation], vil jeg gerne [fremskridt], så jeg kan [resultat].' Forstår du præcis hvilket job kunden ansætter din løsning til, kan du positionere dig præcist og uomtvisteligt." },
  { topic: "Kundebehov & værdiskabelse", q: "Hvad er Challenger-tilgangens centrale teknik?", options: ["At udfordre kunden på prisen", "At præsentere en indsigt kunden ikke vidste de manglede — og vise dem et problem de ikke vidste de havde", "At udfordre konkurrenternes løsning", "At stille svære spørgsmål for at teste kunden"], correct: 1, explanation: "'De fleste HR-direktører tror det handler om rekruttering. Vores data viser at det reelle problem er fastholdelse de første 12 måneder.' Du er eksperten der afslører det skjulte problem — kunden ser dig straks som løsningen." },
  { topic: "Kundebehov & værdiskabelse", q: "Hvad er 'tjek og tolk'-princippet?", options: ["En teknik til at tjekke om kunden har læst tilbuddet", "At opsummere hvad du hørte og bekræfte forståelsen med kunden", "At tolke kundens kropssprog og reagere derefter", "At tjekke om kunden er klar til closing"], correct: 1, explanation: "'Så det jeg hører er at jeres største udfordring er X og det koster jer Y per kvartal. Fanger jeg det rigtigt?' → Kunden: 'Præcis!' — Nu er du eksperten der forstår dem bedre end de forstår sig selv." },
  { topic: "Kundebehov & værdiskabelse", q: "Hvad er formålet med BANT-frameworket?", options: ["At afdække dybe psykologiske behov", "At kvalificere leads hurtigt på Budget, Authority, Need og Timeline", "At kortlægge alle interessenter i enterprise-salg", "At identificere konkurrenternes svagheder"], correct: 1, explanation: "BANT (IBM) er klassisk hurtig kvalificering: har de budget? taler du med beslutningstageren? er der et reelt behov? hvornår handler de? Ideelt til at sortere leads tidligt uden at spilde tid." },
  { topic: "Kundebehov & værdiskabelse", q: "Hvad er 'So what?'-testen?", options: ["En test af om kunden er interesseret nok til at fortsætte", "At oversætte enhver feature til en konkret fordel for kundens hverdag", "At spørge kunden direkte om de vil købe", "En metode til at analysere konkurrenter"], correct: 1, explanation: "For hver feature: 'So what — hvad betyder det for kunden?' Feature: systemet opdaterer i realtid. So what: I sender aldrig et tilbud med forældede priser. Features sælger ikke — fordele og resultater gør." },
  { topic: "Kundebehov & værdiskabelse", q: "Toppræsterende sælgere stiller 40% flere spørgsmål end gennemsnitssælgere. Hvad er den vigtigste konsekvens?", options: ["De bruger mere tid på hvert møde", "De har 76% længere discovery-samtaler og opnår langt bedre indsigt i kundens reelle situation", "De lytter mindre og taler mere", "De lukker hurtigere fordi de kender alle svarene"], correct: 1, explanation: "63% af tabte handler mistes allerede i behovsafdækningen. Toppræsterende sælgere er bedre til at afdække det reelle behov fordi de stiller flere og dybere spørgsmål — og lytter mere end de taler." },

  // ── Afslutning & closing (10 spørgsmål) ──
  { topic: "Afslutning & closing", q: "Hvad er den Antagende closing, og hvornår bruges den?", options: ["Du antager at kunden siger nej og forbereder et tilbud", "Du antager at salget er aftalt og diskuterer næste skridt — brug den når købssignalerne er stærke", "Du antager at prisen er for høj og tilbyder rabat", "Du antager at kunden vil tænke over det og sætter et nyt møde"], correct: 1, explanation: "'Godt, så kan vi starte installationen mandag — eller ville onsdag passe bedre?' Du er allerede i implementeringen i samtalen. Det er ikke manipulation — det er at hjælpe kunden over den sidste mentale barriere." },
  { topic: "Afslutning & closing", q: "Hvad er psykologien bag Alternativ-closingen?", options: ["At forvirre kunden med for mange valg", "At give valget mellem to muligheder der begge fører til et salg — eliminerer ja/nej-binæret", "At give kunden tid til at tænke over det", "At vise at du har flere produkter de kan vælge imellem"], correct: 1, explanation: "'Foretrækker du den kvartalsvise eller den årlige plan?' Begge svar er et ja. Kunden fokuserer på hvilken version — ikke om. Det reducerer beslutningstræthed og gør closing naturlig." },
  { topic: "Afslutning & closing", q: "Hvornår er Opsummerings-closingen særligt effektiv?", options: ["Til hurtige B2C-handler", "I komplekse B2B-salg med lange cykler — gennemgå alle aftalte punkter og bed om forpligtelse", "Når kunden endnu ikke kender produktet godt nok", "Kun når du giver en stor rabat"], correct: 1, explanation: "'Lad mig opsummere: enterprise-plan, 24/7 support, tilpassede integrationer og dedikeret onboarding — alt til den aftalte pris. Skal jeg sende kontrakten?' Opsummeringen minder kunden om alt de har sagt ja til undervejs." },
  { topic: "Afslutning & closing", q: "Hvad er Trial-closingen, og hvad gør du hvis svaret er negativt?", options: ["En endelig close — et negativt svar betyder salget er tabt", "Et temperaturcheck undervejs — et negativt svar giver dig rum til at adressere bekymringer inden de vokser", "En closing-teknik du kun bruger til sidst i mødet", "En måde at teste om kunden har budget"], correct: 1, explanation: "'På en skala fra 1-10 — hvor tæt er vi på at komme videre?' De siger 7: 'Hvad mangler for at det er en 10?' → De afslører præcis hvad der holder dem igen. Du har stadig rum til at justere." },
  { topic: "Afslutning & closing", q: "Hvad er 'plan B'-closet designet til?", options: ["At give kunden et billigere alternativt produkt", "At blotlægge at kunden sjældent har en reel plan hvis de ikke handler", "At sætte et nyt møde til næste uge", "At sende et skriftligt tilbud pr. mail"], correct: 1, explanation: "'Hvis vi ikke indgår et samarbejde — hvad er din plan B?' Ofte er der ingen plan. Spørgsmålet hjælper kunden indse at status quo ikke er et neutralt valg — det er bare default." },
  { topic: "Afslutning & closing", q: "Hvad sker der når du spørger: 'Hvad er det specifikt der fik dig til at tænke at det her ville hjælpe dig?'", options: ["Kunden begynder at tvivle og trækker sig", "Kunden sælger produktet til sig selv med egne ord — og det de selv siger, tror de på", "Kunden vil have lavere pris", "Kunden vil tænke over det hjemme"], correct: 1, explanation: "Den stærkeste close. Kunden forklarer med egne ord hvorfor løsningen giver mening. Du lytter og gentager det vigtigste tilbage: 'Så det der resonerede mest med dig var [X] — forstår jeg rigtigt?'" },
  { topic: "Afslutning & closing", q: "Hvad er den korrekte rækkefølge i Closing-trappen?", options: ["Bed om beslutning → Bekræft værdi → Skab forståelse → Afdæk tvivl", "Afdæk tvivl → Skab forståelse → Bekræft værdi → Bed om beslutning", "Skab forståelse → Bekræft værdi → Afdæk tvivl → Bed om beslutningen", "Bekræft værdi → Afdæk tvivl → Skab forståelse → Bed om beslutning"], correct: 2, explanation: "Skab forståelse (giver det mening?) → Bekræft værdi (kan det hjælpe?) → Afdæk tvivl (er der noget der holder dig igen?) → Bed om beslutningen. Rækkefølgen er afgørende." },
  { topic: "Afslutning & closing", q: "Hvad er formålet med 'best case vs. worst case'-close?", options: ["At skræmme kunden til at handle", "At hjælpe kunden se begge scenarier og spørge om worst case stadig er bedre end status quo", "At bevise at dit produkt ikke har nogen risici", "At undgå at tale om worst case"], correct: 1, explanation: "'Hvad er det bedste der kan ske?' → 'Hvad er det allerværste?' → 'Er det allerværste stadig bedre end det I sidder med i dag?' Næsten altid: ja. Kontrasten åbner naturligt for beslutningen." },
  { topic: "Afslutning & closing", q: "Hvad er formålet med 'Ville det være en dum idé?'-close?", options: ["At provokere kunden til at reagere", "At reframe spørgsmålet så det er næsten umuligt at sige nej når kunden allerede har bekræftet værdien", "At give kunden en undskyldning til at sige nej", "At afslutte mødet hurtigt"], correct: 1, explanation: "'Du sagde selv det løser [problem], det giver mening og du mangler netop det her. Ville det så være en dum idé at gå videre?' Det er næsten umuligt at svare ja til. Kunden sælger sig selv." },
  { topic: "Afslutning & closing", q: "Hvornår er den bedste close allerede sket?", options: ["Når du fremsætter dit bedste tilbud", "Når kunden ikke bemærker den — fordi svaret var åbenlyst ud fra alt det der kom inden", "Når du bruger en specifik closing-teknik", "Når mødet nærmer sig sin afslutning"], correct: 1, explanation: "Den bedste close er den kunden ikke bemærker. Closing er ikke et trick — det er den naturlige konsekvens af at du har lyttet, forstået og skabt reel værdi gennem hele samtalen." },
];

// ─── Fun moments (interspersed in topic content) ─────────────────────────────

type FunMoment = { emoji: string; question: string; answer: string; afterPrinciple: number };

const FUN_MOMENTS: Record<string, FunMoment[]> = {
  mindset: [
    { emoji: "🤔", question: "Du møder en ny kunde og de siger 'Jeg er ikke på udkig'. Hvad siger du IKKE?", answer: "'Vi har præcis det du mangler!' — Det er sælgersproget. Rådgiveren siger: 'Det forstår jeg godt — jeg ved faktisk ikke engang om jeg kan hjælpe dig endnu.' Så vender dynamikken.", afterPrinciple: 1 },
    { emoji: "💸", question: "Kunden siger prisen er for høj. Du giver 10% rabat med det samme. Hvad fortæller det kunden?", answer: "At din pris var forkert fra starten — OG at du forhandler under pres. Test altid først: 'Hvis prisen ikke var et problem, ville du så købe?' Siger de nej, er der en anden indvending.", afterPrinciple: 6 },
  ],
  "aktiv-lytning": [
    { emoji: "🎧", question: "Kunden taler i 3 minutter om sit problem. Hvad er den STØRSTE fejl du kan lave?", answer: "Afbryde med løsningen! 'Åh ja, vi har præcis det du har brug for...' — Du har aflyttet, ikke lyttet. Den der afbryder signalerer at de lytter for at svare, ikke for at forstå.", afterPrinciple: 2 },
    { emoji: "🤫", question: "Kunden stopper med at tale og kigger på dig. Du har et godt svar klar. Hvad er det rigtige?", answer: "VEN T3 sekunder! Det føles akavet — men kunden uddyber næsten altid noget vigtigt i den pause. Strategisk stilhed er et af de mest undervurderede salgsværktøjer der findes.", afterPrinciple: 5 },
  ],
  indvendinger: [
    { emoji: "😅", question: "Kunden siger 'Det er for dyrt'. Du tager det bogstaveligt og giver rabat. Hvad gik galt?", answer: "Du antog at prisen var det reelle problem — men prisindsigelsen er næsten altid en proxy for noget andet. Manglende tillid, usikkerhed om value, forkert timing. Test det: 'Hvis prisen ikke var et problem...'", afterPrinciple: 3 },
    { emoji: "🎯", question: "Hvad er den mest afvæbnende ting du kan sige til en skeptisk kunde der siger de ikke er interesserede?", answer: "'Nej nej, bare rolig — jeg ved ikke engang om jeg kan hjælpe dig endnu.' Det er det modsatte af hvad kunden forventer og skyder salgs-alarmen fuldstændig ned.", afterPrinciple: 7 },
  ],
  relationsopbygning: [
    { emoji: "🏆", question: "Du har 30 sekunder i lobbyen inden et møde. Hvad er den bedste investering?", answer: "Et ægte spørgsmål om noget ANDET end forretning. 'Er du sejler? Jeg så en båd på billedet.' 10 minutter om sejlads er mere værd end 10 minutter pitch. Relationen sættes i de første 30 sekunder.", afterPrinciple: 2 },
    { emoji: "😂", question: "Hvornår bør du IKKE bruge humor i et møde?", answer: "Når det er planlagt og forceret. 'Nu siger jeg noget sjovt...' — det er ikke humor, det er performance. Ægte humor er spontan og reaktiv. Naturlige øjeblikke slår planlagte vittigheder alle dage.", afterPrinciple: 6 },
  ],
  kundebehov: [
    { emoji: "🕵️", question: "Du har 60 sekunder til at forberede et salgsmøde. Hvad googler du?", answer: "KUNDEN — ikke produktet! LinkedIn, seneste nyheder, branchens udfordringer. Én specifik reference fra din research er mere værd end 20 minutters pitch: 'Jeg så I netop lancerede X — hvad betyder det for jeres behov?'", afterPrinciple: 3 },
    { emoji: "🧠", question: "Hvad er den vigtigste forskel på Situation- og Implikationsspørgsmål i SPIN?", answer: "Situationsspørgsmål samler info (pas på — for mange signalerer manglende forberedelse). Implikationsspørgsmål forstørrer konsekvenserne: 'Hvad koster det jer per kvartal?' — kunden sætter selv tallene på smerten. Det skaber urgency ingen pitch kan matche.", afterPrinciple: 6 },
  ],
  afslutning: [
    { emoji: "🎬", question: "Kunden har sagt ja til alt — men siger 'jeg skal tænke over det'. Hvad skjuler sig bag det?", answer: "En uafdækket bekymring! Brug: 'Hvad er det specifikt du vil tænke over?' — ikke for at presse, men for at finde den ENE ting der holder dem igen. Tænke-over-det er aldrig hele historien.", afterPrinciple: 2 },
    { emoji: "🚀", question: "Hvad er den sætning du ALDRIG bør sige i closing?", answer: "'Hvad skal der til for at du køber i dag?' — Det er åbenlyst salgsorienteret og skaber forsvarsposition øjeblikkeligt. Brug i stedet trinvist: 'Giver det mening?' → 'Kan det hjælpe dig?' → 'Skal vi gå videre?' — hvert lille ja bygger det næste.", afterPrinciple: 6 },
  ],
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function SalgTab() {
  const [activeId, setActiveId]       = useState<string>(TOPICS[0].id);
  const [quizMode, setQuizMode]       = useState(false);
  const [quizIdx, setQuizIdx]         = useState(0);
  const [selected, setSelected]       = useState<number | null>(null);
  const [answers, setAnswers]         = useState<boolean[]>([]);
  const [quizDone, setQuizDone]       = useState(false);
  const [filterTopic, setFilterTopic] = useState<string>("Alle");
  const [funRevealed, setFunRevealed] = useState<Set<string>>(new Set());

  function toggleFun(key: string) {
    setFunRevealed(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  }

  const topic = TOPICS.find(t => t.id === activeId) ?? TOPICS[0];
  const idx   = TOPICS.findIndex(t => t.id === activeId);

  const quizTopics  = ["Alle", ...Array.from(new Set(QUIZ.map(q => q.topic)))];
  const activeQuiz  = filterTopic === "Alle" ? QUIZ : QUIZ.filter(q => q.topic === filterTopic);
  const currentQ    = activeQuiz[quizIdx];
  const isCorrect   = selected === currentQ?.correct;
  const score       = answers.filter(Boolean).length;

  function startQuiz() {
    setQuizIdx(0); setSelected(null); setAnswers([]); setQuizDone(false);
  }
  function handleAnswer(i: number) {
    if (selected !== null) return;
    setSelected(i);
    setAnswers(prev => [...prev, i === currentQ.correct]);
  }
  function nextQuestion() {
    if (quizIdx + 1 >= activeQuiz.length) { setQuizDone(true); return; }
    setQuizIdx(q => q + 1);
    setSelected(null);
  }

  return (
    <div className="salg-root" style={{ maxWidth: 940, margin: "0 auto", fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif" }}>

      {/* ── Page header ── */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 13, flexShrink: 0,
            background: "linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
          }}>💼</div>
          <div>
            <h1 className="salg-page-title" style={{ fontSize: 28, fontWeight: 900, color: "#1c1917", margin: 0, letterSpacing: "-0.5px" }}>
              Salgskompetencer
            </h1>
            <p style={{ fontSize: 14, color: "#57534e", margin: 0, fontWeight: 500 }}>
              {TOPICS.length} emner — fra mindset til closing
            </p>
          </div>
        </div>

        {/* Topic tabs + quiz button */}
        <div
          className="salg-topic-grid"
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${TOPICS.length}, 1fr) 1.2fr`,
            gap: 6,
          }}
        >
          {TOPICS.map(t => (
            <button
              key={t.id}
              onClick={() => { setActiveId(t.id); setQuizMode(false); }}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                gap: 5, padding: "12px 6px", borderRadius: 12, cursor: "pointer",
                fontWeight: !quizMode && activeId === t.id ? 700 : 400,
                background: !quizMode && activeId === t.id ? `${t.color}18` : "#f5f4f2",
                border: `2px solid ${!quizMode && activeId === t.id ? t.color : "#d6d3d1"}`,
                color: !quizMode && activeId === t.id ? t.color : "#57534e",
                transition: "all 0.15s",
              }}
            >
              <span style={{ fontSize: 20 }}>{t.emoji}</span>
              <span style={{ fontSize: 12, textAlign: "center", lineHeight: 1.3, fontWeight: "inherit" }}>{t.title}</span>
            </button>
          ))}
          {/* Quiz tab */}
          <button
            className="salg-quiz-btn"
            onClick={() => { setQuizMode(true); startQuiz(); }}
            style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              gap: 5, padding: "12px 6px", borderRadius: 12, cursor: "pointer",
              fontWeight: quizMode ? 700 : 400,
              background: quizMode ? "#fef9c3" : "#f5f4f2",
              border: `2px solid ${quizMode ? "#fbbf24" : "#d6d3d1"}`,
              color: quizMode ? "#92400e" : "#57534e",
              transition: "all 0.15s",
            }}
          >
            <span style={{ fontSize: 20 }}>🎯</span>
            <span style={{ fontSize: 12, textAlign: "center", lineHeight: 1.3 }}>Salgs Quiz</span>
          </button>
        </div>
      </div>

      {/* ── Quiz mode ── */}
      {quizMode && (
        <div style={{ background: "#ffffff", borderRadius: 16, padding: "24px", border: "1px solid #e5e2df" }}>
          {/* Topic filter */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 24 }}>
            {quizTopics.map(t => (
              <button key={t} onClick={() => { setFilterTopic(t); startQuiz(); }} style={{
                padding: "6px 14px", borderRadius: 99, fontSize: 12, cursor: "pointer",
                fontWeight: filterTopic === t ? 700 : 400,
                background: filterTopic === t ? "#fef9c3" : "#f5f4f2",
                border: `1.5px solid ${filterTopic === t ? "#fbbf24" : "#e5e2df"}`,
                color: filterTopic === t ? "#92400e" : "#78716c",
              }}>{t}</button>
            ))}
          </div>

          {quizDone ? (
            /* ── Results ── */
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>
                {score === activeQuiz.length ? "🏆" : score >= activeQuiz.length * 0.7 ? "🎉" : score >= activeQuiz.length * 0.5 ? "💪" : "📚"}
              </div>
              <h2 style={{ fontSize: 28, fontWeight: 800, color: "#1c1917", margin: "0 0 8px" }}>
                {score} / {activeQuiz.length} rigtige
              </h2>
              <p style={{ fontSize: 15, color: "#78716c", margin: "0 0 32px" }}>
                {score === activeQuiz.length ? "Perfekt score! Du har styr på det hele." :
                 score >= activeQuiz.length * 0.7 ? "Rigtig flot — næsten styr på det hele." :
                 score >= activeQuiz.length * 0.5 ? "Godt gået — gå de svage emner igennem igen." :
                 "Gå emnerne igennem og prøv igen — du har det i dig."}
              </p>
              {/* Score breakdown by topic */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 420, margin: "0 auto 32px" }}>
                {Array.from(new Set(activeQuiz.map(q => q.topic))).map(tp => {
                  const tpQ  = activeQuiz.filter(q => q.topic === tp);
                  const tpOk = tpQ.filter((q, i) => answers[activeQuiz.indexOf(q)] === true).length;
                  const pct  = Math.round((tpOk / tpQ.length) * 100);
                  const col  = TOPICS.find(t => t.title === tp)?.color ?? "#fbbf24";
                  return (
                    <div key={tp} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span className="salg-score-label" style={{ fontSize: 12, color: "#78716c", width: 160, textAlign: "left", flexShrink: 0 }}>{tp}</span>
                      <div style={{ flex: 1, height: 8, borderRadius: 99, background: "#f0ede9", overflow: "hidden" }}>
                        <div style={{ width: `${pct}%`, height: "100%", borderRadius: 99, background: col, transition: "width 0.5s" }} />
                      </div>
                      <span style={{ fontSize: 12, color: col, fontWeight: 700, width: 40, textAlign: "right" }}>{tpOk}/{tpQ.length}</span>
                    </div>
                  );
                })}
              </div>
              <button onClick={startQuiz} style={{
                padding: "12px 32px", borderRadius: 12, cursor: "pointer", fontSize: 14, fontWeight: 700,
                background: "#fef9c3", border: "1.5px solid #fbbf24", color: "#92400e",
              }}>
                🔄 Prøv igen
              </button>
            </div>
          ) : currentQ ? (
            /* ── Active question ── */
            <div>
              {/* Progress */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                <div style={{ flex: 1, height: 6, borderRadius: 99, background: "#f0ede9", overflow: "hidden" }}>
                  <div style={{ width: `${((quizIdx) / activeQuiz.length) * 100}%`, height: "100%", borderRadius: 99, background: "#fbbf24", transition: "width 0.3s" }} />
                </div>
                <span style={{ fontSize: 12, color: "#78716c", flexShrink: 0 }}>{quizIdx + 1} / {activeQuiz.length}</span>
              </div>

              {/* Topic badge */}
              <div style={{ marginBottom: 14 }}>
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 99,
                  background: `${TOPICS.find(t => t.title === currentQ.topic)?.color ?? "#fbbf24"}18`,
                  color: TOPICS.find(t => t.title === currentQ.topic)?.color ?? "#92400e",
                  border: `1px solid ${TOPICS.find(t => t.title === currentQ.topic)?.color ?? "#fbbf24"}40`,
                  textTransform: "uppercase", letterSpacing: "0.06em",
                }}>{currentQ.topic}</span>
              </div>

              {/* Question */}
              <div style={{ padding: "22px 24px", borderRadius: 14, background: "#fafaf9", border: "1px solid #e5e2df", marginBottom: 16 }}>
                <p style={{ fontSize: 18, fontWeight: 800, color: "#1c1917", margin: 0, lineHeight: 1.5 }}>{currentQ.q}</p>
              </div>

              {/* Options */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
                {currentQ.options.map((opt, i) => {
                  const isSelected = selected === i;
                  const correct    = i === currentQ.correct;
                  let bg = "#fafaf9";
                  let border = "#e5e2df";
                  let color  = "#44403c";
                  if (selected !== null) {
                    if (correct)    { bg = "#f0fdf4"; border = "#22c55e"; color = "#166534"; }
                    else if (isSelected) { bg = "#fef2f2"; border = "#ef4444"; color = "#991b1b"; }
                  }
                  return (
                    <button key={i} onClick={() => handleAnswer(i)} disabled={selected !== null} className="salg-quiz-option" style={{
                      display: "flex", alignItems: "flex-start", gap: 14,
                      padding: "14px 18px", borderRadius: 12, cursor: selected !== null ? "default" : "pointer",
                      background: bg, border: `1.5px solid ${border}`, textAlign: "left", transition: "all 0.15s",
                    }}>
                      <div style={{
                        width: 26, height: 26, borderRadius: 99, flexShrink: 0,
                        background: selected !== null && correct ? "#22c55e" : selected !== null && isSelected ? "#ef4444" : "#f0ede9",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 12, fontWeight: 800,
                        color: selected !== null && (correct || isSelected) ? "#ffffff" : "#78716c",
                      }}>
                        {selected !== null && correct ? "✓" : selected !== null && isSelected ? "✗" : String.fromCharCode(65 + i)}
                      </div>
                      <p style={{ fontSize: 15, color, margin: 0, lineHeight: 1.55, fontWeight: isSelected || (selected !== null && correct) ? 700 : 400 }}>{opt}</p>
                    </button>
                  );
                })}
              </div>

              {/* Explanation + next */}
              {selected !== null && (
                <div>
                  <div style={{
                    padding: "16px 20px", borderRadius: 12, marginBottom: 16,
                    background: isCorrect ? "#f0fdf4" : "#fef2f2",
                    border: `1px solid ${isCorrect ? "#22c55e40" : "#ef444440"}`,
                  }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: isCorrect ? "#166534" : "#991b1b", margin: "0 0 6px" }}>
                      {isCorrect ? "✓ Korrekt!" : "✗ Ikke helt rigtigt"}
                    </p>
                    <p style={{ fontSize: 14, color: "#292524", margin: 0, lineHeight: 1.7 }}>{currentQ.explanation}</p>
                  </div>
                  <button onClick={nextQuestion} style={{
                    width: "100%", padding: "13px", borderRadius: 12, cursor: "pointer", fontSize: 14, fontWeight: 700,
                    background: "#fef9c3", border: "1.5px solid #fbbf24", color: "#92400e",
                  }}>
                    {quizIdx + 1 >= activeQuiz.length ? "Se resultat →" : "Næste spørgsmål →"}
                  </button>
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}

      {/* Progress bar — topic mode only */}
      {!quizMode && <div style={{ height: 3, borderRadius: 99, background: "#f0ede9", marginBottom: 28, overflow: "hidden" }}>
        <div style={{
          height: "100%", borderRadius: 99, background: topic.color,
          width: `${(1 / TOPICS.length) * 100}%`,
          marginLeft: `${(idx / TOPICS.length) * 100}%`,
          transition: "margin-left 0.2s ease, background 0.2s",
        }} />
      </div>}

      {/* ── Topic content ── */}
      {!quizMode && (<div key={topic.id}>

        {/* Heading */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 20 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16, flexShrink: 0,
            background: `${topic.color}18`, border: `2px solid ${topic.color}40`,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28,
          }}>{topic.emoji}</div>
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 900, color: "#1c1917", margin: "0 0 6px", letterSpacing: "-0.3px" }}>
              {topic.title}
            </h2>
            <p style={{ fontSize: 14, color: topic.color, margin: 0, fontWeight: 700 }}>{topic.tagline}</p>
          </div>
        </div>

        {/* Quote */}
        {topic.quote && (
          <div style={{
            marginBottom: 20, padding: "14px 20px",
            borderLeft: `3px solid ${topic.color}`,
            background: `${topic.color}10`, borderRadius: "0 12px 12px 0",
          }}>
            <p style={{ fontSize: 15, color: "#292524", margin: 0, fontStyle: "italic", lineHeight: 1.7, fontWeight: 500 }}>
              {topic.quote}
            </p>
          </div>
        )}

        {/* Description */}
        <p style={{
          fontSize: 15, color: "#292524", lineHeight: 1.85, fontWeight: 400,
          margin: "0 0 28px", paddingBottom: 24,
          borderBottom: "2px solid #e5e2df",
        }}>
          {topic.desc}
        </p>

        {/* Principles — single column */}
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 12, fontWeight: 800, color: topic.color, margin: "0 0 16px", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            Principper
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {topic.principles.flatMap((p, i) => {
              const exList = p.examples ?? (p.example ? [p.example] : []);
              const funs   = (FUN_MOMENTS[topic.id] ?? []).filter(f => f.afterPrinciple === i);

              const items = [
                <div key={`p-${i}`} style={{
                  borderRadius: 16, overflow: "hidden",
                  border: `2px solid ${topic.color}40`,
                  background: "#ffffff",
                  display: "flex", flexDirection: "column",
                }}>
                  {/* Top accent bar */}
                  <div style={{ height: 5, background: topic.color }} />
                  {/* Principle body */}
                  <div style={{ padding: "20px 24px 18px" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 12 }}>
                      <div style={{
                        width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                        background: `${topic.color}15`, border: `2px solid ${topic.color}`,
                        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 21,
                      }}>{p.emoji}</div>
                      <p style={{ fontSize: 16, fontWeight: 800, color: "#1c1917", margin: 0, lineHeight: 1.3, paddingTop: 5 }}>{p.heading}</p>
                    </div>
                    <p style={{ fontSize: 15, color: "#292524", margin: 0, lineHeight: 1.8 }}>{p.body}</p>
                  </div>
                  {/* Example(s) at bottom */}
                  {exList.length > 0 && (
                    <div style={{ padding: "16px 24px", background: "#fffbeb", borderTop: "2px solid #fbbf24" }}>
                      {exList.map((ex, j) => (
                        <div key={j} style={{ marginBottom: j < exList.length - 1 ? 14 : 0 }}>
                          <p style={{ fontSize: 11, fontWeight: 800, color: "#92400e", margin: "0 0 5px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                            {exList.length > 1 ? `Eksempel ${j + 1}` : "Eksempel"}
                          </p>
                          <p style={{ fontSize: 14, color: "#44403c", margin: 0, lineHeight: 1.75, fontStyle: "italic" }}>{ex}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>,
              ];

              // Fun moments — teal/sky color, distinct from yellow
              funs.forEach((fun, fi) => {
                const fKey = `${topic.id}-${i}-${fi}`;
                const revealed = funRevealed.has(fKey);
                items.push(
                  <div key={fKey} style={{
                    borderRadius: 14, overflow: "hidden",
                    border: "2.5px solid #38bdf8",
                  }}>
                    <div style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "16px 22px",
                      background: "#e0f2fe",
                      borderBottom: revealed ? "2px solid #7dd3fc" : "none",
                      gap: 16,
                    }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 14, flex: 1, minWidth: 0 }}>
                        <span style={{ fontSize: 26, flexShrink: 0 }}>{fun.emoji}</span>
                        <div>
                          <p style={{ fontSize: 11, fontWeight: 800, color: "#0c4a6e", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.1em" }}>⚡ Hurtig test</p>
                          <p style={{ fontSize: 15, fontWeight: 700, color: "#082f49", margin: 0, lineHeight: 1.5 }}>{fun.question}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleFun(fKey)}
                        style={{
                          padding: "10px 22px", borderRadius: 10, cursor: "pointer",
                          fontSize: 13, fontWeight: 800,
                          background: revealed ? "#0ea5e9" : "#ffffff",
                          border: "2px solid #38bdf8",
                          color: revealed ? "#ffffff" : "#0c4a6e",
                          flexShrink: 0,
                        }}
                      >
                        {revealed ? "Skjul ↑" : "Vis svar →"}
                      </button>
                    </div>
                    {revealed && (
                      <div style={{ padding: "16px 22px", background: "#f0f9ff" }}>
                        <p style={{ fontSize: 14, color: "#0c4a6e", margin: 0, lineHeight: 1.8 }}>{fun.answer}</p>
                      </div>
                    )}
                  </div>
                );
              });

              return items;
            })}
          </div>
        </div>

        {/* Model — numbered steps */}
        <div style={{ marginBottom: topic.objections ? 32 : topic.exampleQuestions ? 32 : 36 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <div style={{ height: 3, flex: 1, background: "#fbbf24", borderRadius: 99 }} />
            <p style={{ fontSize: 12, fontWeight: 800, color: "#92400e", margin: 0, textTransform: "uppercase", letterSpacing: "0.1em", whiteSpace: "nowrap" }}>
              ⭐ {topic.model.name}
            </p>
            <div style={{ height: 3, flex: 1, background: "#fbbf24", borderRadius: 99 }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {topic.model.items.map((item, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "flex-start", gap: 16,
                padding: "16px 20px", borderRadius: 14,
                background: "#fffbeb", border: "2px solid #fbbf24",
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 99, flexShrink: 0,
                  background: topic.color,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 15, fontWeight: 800, color: "#ffffff",
                }}>{i + 1}</div>
                <p style={{ fontSize: 15, color: "#292524", margin: 0, lineHeight: 1.65, fontWeight: 500, paddingTop: 4 }}>{item}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Example questions */}
        {topic.exampleQuestions && (
          <div style={{ marginBottom: 32 }}>
            <p style={{ fontSize: 12, fontWeight: 800, color: topic.color, margin: "0 0 14px", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Eksempelspørgsmål — stil dem i denne rækkefølge
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {topic.exampleQuestions.map((eq, i) => (
                <div key={i} style={{
                  borderRadius: 14, overflow: "hidden",
                  border: `2px solid ${topic.color}50`,
                  background: "#ffffff",
                  display: "flex", flexDirection: "column",
                }}>
                  <div style={{ height: 4, background: topic.color }} />
                  <div style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: "16px 20px" }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 99, flexShrink: 0,
                      background: topic.color,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 13, fontWeight: 800, color: "#ffffff",
                    }}>{i + 1}</div>
                    <p style={{ fontSize: 15, fontWeight: 700, color: "#1c1917", margin: 0, lineHeight: 1.6, paddingTop: 2 }}>
                      &ldquo;{eq.q}&rdquo;
                    </p>
                  </div>
                  <div style={{ padding: "14px 20px", background: "#fffbeb", borderTop: "2px solid #fbbf24" }}>
                    <p style={{ fontSize: 14, color: "#44403c", margin: 0, lineHeight: 1.65 }}>{eq.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Objection scripts */}
        {topic.objections && (
          <div style={{ marginBottom: 32 }}>
            <p style={{ fontSize: 12, fontWeight: 800, color: topic.color, margin: "0 0 14px", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Scripts — hvad siger du når kunden siger...
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {topic.objections.map((obj, oi) => (
                <div key={oi} style={{ borderRadius: 14, overflow: "hidden", border: `2px solid ${topic.color}50`, background: "#ffffff", display: "flex", flexDirection: "column" }}>
                  {/* Top bar + header */}
                  <div style={{ height: 4, background: topic.color }} />
                  <div style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "14px 20px",
                    background: `${topic.color}10`,
                    borderBottom: `2px solid ${topic.color}30`,
                  }}>
                    <span style={{ fontSize: 22 }}>{obj.emoji}</span>
                    <p style={{ fontSize: 15, fontWeight: 800, color: "#1c1917", margin: 0 }}>
                      &ldquo;{obj.type}&rdquo;
                    </p>
                  </div>
                  {/* Scripts */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                    {obj.scripts.map((script, si) => (
                      <div key={si} style={{
                        display: "flex", gap: 16, padding: "16px 20px",
                        borderTop: si > 0 ? "1px solid #f0ede9" : "none",
                        background: si % 2 === 0 ? "#fafaf9" : "#ffffff",
                      }}>
                        <div style={{
                          width: 24, height: 24, borderRadius: 99, flexShrink: 0, marginTop: 1,
                          background: `${topic.color}15`, border: `2px solid ${topic.color}`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 12, fontWeight: 800, color: topic.color,
                        }}>{si + 1}</div>
                        <p style={{ fontSize: 14, color: "#292524", margin: 0, lineHeight: 1.85 }}>
                          {script}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Bottom nav ── */}
        <div className="salg-bottom-nav" style={{ display: "flex", justifyContent: "space-between", paddingTop: 20, borderTop: "1px solid #e5e2df" }}>
          <div>
            {idx > 0 && (
              <button
                onClick={() => setActiveId(TOPICS[idx - 1].id)}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "10px 18px", borderRadius: 10, cursor: "pointer", fontSize: 13,
                  background: "#f5f4f2", border: "1px solid #e5e2df",
                  color: "#57534e",
                }}
              >
                ← {TOPICS[idx - 1].emoji} {TOPICS[idx - 1].title}
              </button>
            )}
          </div>
          <div>
            {idx < TOPICS.length - 1 && (
              <button
                onClick={() => setActiveId(TOPICS[idx + 1].id)}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "10px 18px", borderRadius: 10, cursor: "pointer", fontSize: 13,
                  background: `${TOPICS[idx + 1].color}15`, border: `1.5px solid ${TOPICS[idx + 1].color}45`,
                  color: TOPICS[idx + 1].color, fontWeight: 600,
                }}
              >
                {TOPICS[idx + 1].emoji} {TOPICS[idx + 1].title} →
              </button>
            )}
          </div>
        </div>
      </div>
      )}

    </div>
  );
}
