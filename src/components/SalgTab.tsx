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

type ObjectionStrategy = {
  title: string;
  emoji: string;
  desc: string;
  scripts: string[];
};

type Objection = {
  type: string;
  emoji: string;
  scripts: string[];
  strategies?: ObjectionStrategy[];
};

type CloseMethod = {
  id: string;
  emoji: string;
  title: string;
  tagline: string;
  desc: string;
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
  closeMethods?: CloseMethod[];
};

// ─── Data ─────────────────────────────────────────────────────────────────────

const TOPICS: Topic[] = [
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
        heading: "L — Lyt (LAIR-modellen)",
        body: "Giv fuld opmærksomhed. Brug stilhed som et redskab. Afbryd ikke. Lyt ikke bare til ordene — men til det der IKKE bliver sagt. Pauser, tøven og tone afslører den reelle bekymring.",
        example: "Kunden pauser efter at have nævnt prisen. Afbryd ikke — vent. Det der kommer i den pause er vigtigere end svaret du forberedte.",
      },
      {
        emoji: "✋",
        heading: "A — Anerkend + vis empati (LAIR-modellen)",
        body: "Gentag det du hørte og vis at du forstår følelsen bag. Anerkendelse + empati i én bevægelse sænker temperaturen og viser kunden at de er både hørt og forstået. Ingen forsvar, ingen forklaring — bare anerkendelse af både ord og følelse.",
        examples: [
          "\"Jeg forstår at du synes det er en lidt større investering end du havde regnet med — og det er en helt naturlig reaktion.\" → Ord anerkendt, følelse anerkendt. Kunden falder ned.",
          "\"Det forstår jeg godt — og det er faktisk en ret normal bekymring at have på det her tidspunkt.\" → Du validerer uden at gå i forsvar. Kunden føler sig set.",
        ],
      },
      {
        emoji: "🔎",
        heading: "I — Isoler den ægte indvending (LAIR-modellen)",
        body: "Isoleringstrinnet er det afgørende — det er her du finder den ægte modstand. Spørg direkte: er det den ENESTE ting der holder dem igen, eller er der noget andet? Mange prisindsigelser er cashflow-problemer — ikke prisproblemer.",
        examples: [
          "\"Lad mig spørge dig direkte: hvis vi løser [den specifikke bekymring] — er det så den eneste ting der holder dig igen, eller er der noget andet?\"",
          "\"Ser du værdien i det her — ja eller nej?\" [Ja] → \"Så handler det faktisk ikke om pris — det handler om cashflow, ik? Lad os kigge på det.\"",
        ],
      },
      {
        emoji: "💬",
        heading: "R — Reager (LAIR-modellen)",
        body: "Kobl løsningen direkte til det kunden bekræftede i Isolér. Brug 'derfor' som bindeleddet. Afslut med at vende spørgsmålet tilbage til dem — lad dem selv konkludere.",
        examples: [
          "\"Og derfor er det en lidt større investering — fordi du får de her ekstra fordele som du ikke har i dag. Det synes jeg selv personligt er investeringen værd. Men hvad synes du? Synes du selv at de ekstra fordele ikke er investeringen værd?\"",
          "\"Og derfor betaler du lidt mere — fordi du præcis får det [X] du selv sagde var vigtigt. Det giver jo god mening, ik?\" → Kunden bekræfter — de har nu solgt sig selv.",
        ],
      },
      {
        emoji: "🎭",
        heading: "Røgslør & Objection Hopping — find den ægte indvending",
        body: "En indvending er sjældent det rigtige problem. Kunder bruger røgslørindvendinger — 'lad mig tænke over det', 'jeg er ikke interesseret' — som flugtmuligheder. Objection hopping er når du overvinder én indvending, og de straks springer til en ny. Symptom: du har ikke fat i den ÆGTE modstand endnu.",
        examples: [
          "Du overvinder prisindvendingen → de siger pludselig 'vi er ikke klar tidsmæssigt'. Det er objection hopping. Stop op og isoler: \"Lad os antage vi løser timing-problemet — er det så kun det der holder dig igen, eller er der noget andet?\"",
          "Røgslørteknik: Ignorer 'lad mig tænke over det' — spørg i stedet: \"Jeg forstår det, men hurtigt spørgsmål: giver selve ideen mening for dig?\" Siger de ja — er du tilbage på linjen med en åben dør.",
        ],
      },
      {
        emoji: "🎚️",
        heading: "Handlingstærskel — høj vs. lav tærskel",
        body: "Enhver prospect har en 'action threshold' — et modstandsniveau der skal overskrides for at de handler. Høj tærskel: kræver mange argumenter, meget tid, meget sikkerhed. Din opgave er dobbelt: øg lysten (ønsket om resultatet) og sænk tærsklen (reducer risikopercipering og uvished).",
        examples: [
          "Høj-tærskel-prospect nøler trods gode argumenter? De mangler certainty. Byg certainty i tre lag: produktet (sociale beviser, cases), dig selv (ekspertise, rapport) og virksomheden (track record, garanti). Alle tre skal op på 10 for at handlingstærsklen nås.",
          "Lav tærsklen ved at fjerne risikooplevelsen: 'Vi starter med en 30-dages gratis pilot' sænker tærsklen mere end nogen rabat. En lavrisiko-indgang får folk med høj tærskel over linjen.",
        ],
      },
      {
        emoji: "🔄",
        heading: "Loop-teknikken (Belfort) — deflektion + genopbyg",
        body: "Looping er Belforts kerneteknik til at navigere modstand. I stedet for at argumentere direkte mod indvendingen: afled roligt, valider kortvarigt, og genopbyg certaintyen i produkt, dig selv og virksomheden — og luk igen. Hvert loop skaber mere certainty.",
        examples: [
          "Prospect: 'Det er for dyrt.' Loop: 1) Afled: 'Jeg forstår det, og det er en fair tanke' 2) Genopbyg produkt: 'Husk på at hvad du får her er X, Y og Z som ingen andre tilbyder' 3) Sælg dig selv: 'Og du ved jeg ikke ville anbefale noget jeg ikke selv stod inde for' 4) Future pacing: 'Forestil dig om 6 måneder — problem løst, [resultat opnået]' → Luk igen.",
          "Loop 2+ (dobbeltangreb): Første loop løste det ikke? Gå dybere. 'Jeg mærker der stadig er noget der holder dig igen — hvad er det præcist?' Find den ÆGTE bekymring og byg en specifik bro til den. Hvert loop = mere certainty, lavere tærskel.",
        ],
      },
      {
        emoji: "🎯",
        heading: "Jordan Belfort Straight Line System — 3 × 10'ere",
        body: "Belfort's system handler om at flytte prospectet til 10/10 certainty på tre dimensioner: 1) Produktet/ideen (er det et godt produkt?), 2) Dig som sælger (er du til at stole på?), 3) Virksomheden (er det en troværdig virksomhed?). Alle tre skal op på 10 inden closing. En indvending = én af de tre er for lav.",
        examples: [
          "Start med at etablere autoritet på 4 sekunder: tonalitet, tempo og energi sender et signal om kompetence. Kunden beslutter inden du siger andet om du er værd at lytte til. Tal langsomt, sikkert og præcist — sving ALDRIG op i salgstone.",
          "10 tonaliteter Belfort bruger: Absolut certainty (jeg ved dette virker), Nysgerrighed (hvad er dit problem egentlig?), Scarcity (det her kan ikke vente), Empati (jeg er på din side), Forundring (det er virkelig imponerende). Kend 3-4 og brug dem aktivt — tonalitet afleverer 80% af budskabet.",
        ],
      },
      {
        emoji: "🦁",
        heading: "Daniel G — Løven vs. Lammet: sælg fra styrke",
        body: "Lammet tigger om salget. Det justerer pitch-en tyve gange og sænker prisen ved mindste modstand. Løven sælger fra overflod. Den ved sit produkt er godt, stiller hårde spørgsmål fra starten, kvalificerer aktivt og vil hellere miste et dårligt salg end tigge. Den stærkeste attraktion i salg er at virke som om du IKKE behøver dette salg.",
        examples: [
          "Graven dybt på første opkald: Spørg ikke om de er interesserede — spørg om problemet: 'Hvad sker der for din forretning hvis det her problem eksisterer om 12 måneder?' Kunden der svarer ægte = en køber.",
          "3-trins demo-teknik: 1) 'Hvad ellers?' — pres dem for at afsløre ALLE problemer 2) Smile + nødudgang: 'Hør, det er muligvis ikke noget for dig' — stresser dem og viser du ikke behøver dem 3) Prospecting mode: 'Lad mig stille dig et par spørgsmål' — tag styringen.",
        ],
      },
      {
        emoji: "👑",
        heading: "Perciperet autoritet + \"Måske\"-mentaliteten",
        body: "Din perciperede autoritet — hvad kunden tror du er — bestemmer direkte hvor hårdt de indvender. 'Måske'-mentaliteten er at gå ind i samtalen neutral til outcome: du ønsker at hjælpe dem, ikke at lave salget. Det projicerer alfa-adfærd og gør dig upushable.",
        examples: [
          "Byg perciperet autoritet inden mødet: social proof (logoer, cases), præcise branchetal, en professionel profil. Og i samtalen: tal som en ekspert, ikke en sælger. 'Det er en klassisk fejl i jeres branche' siger mere end hundrede pitches.",
          "'Måske'-mentaliteten i praksis: Gå ind med: 'Måske passer det her til dig, måske ikke. Lad mig stille dig et par spørgsmål.' Du er ikke desperat. Du er konsulterende. Det skaber tiltrækning og reducerer indvendingspresset markant.",
        ],
      },
      {
        emoji: "💰",
        heading: "Cost of Inaction — hvad koster det at undlade?",
        body: "Den mest undervurderede urgency-skaber: vis hvad det koster at INTET gøre. Omregn status quo til penge per måned/år. Kunden tænker 'hvad koster det at købe?' — dit job er at flippe det til 'hvad koster det dig IKKE at købe?'. Det er den stærkeste kontrast i salg.",
        examples: [
          "Formel: (Nuværende problem-pris) × 12 = Årlig cost of inaction. Eks: 'Du siger du mister 8 timer om ugen × 400 kr./time = 3.200 kr./uge × 52 uger = 166.400 kr. om året. Det er hvad det koster dig at gøre ingenting. Vores løsning koster 24.000 kr. Det er en ROI på 6:1 fra dag ét.'",
          "Cost of Saying No (closing version): 'Lad os sige du siger nej i dag og revisiterer det om et år. Hvad er sket i din virksomhed i mellemtiden? [X problem] er stadig der. Det har nu kostet dig [Y kr.]. Er den ekstra 12 måneder med [problem] prisen for at udskyde beslutningen?' — kunden sætter selv tallene på.",
        ],
      },
      {
        emoji: "🔬",
        heading: "LAIR — Isoler den ægte indvending",
        body: "LAIR er en fire-trins indvendingsmodel der sikrer du aldrig reagerer på en røgslørindvending: Lyt (uden at dømme), Anerkend (validér følelsen), Isoler (er det den ENESTE ting?), Reager (målrettet løsning på den isolerede bekymring). Isoleringstrinnet er det afgørende.",
        examples: [
          "L: Lad dem tale helt ud uden afbrydelse — pause 3 sekunder → A: 'Jeg forstår det fuldstændig, og det er en naturlig bekymring' → I: 'Lad mig spørge dig direkte: hvis vi løser [den specifikke bekymring] — er det så den eneste ting der holder dig igen, eller er der noget andet?' → R: Reaktion kun på det isolerede problem.",
          "Isolering: Værdi vs. Cashflow. Mange prisindsigelser er IKKE pris — de er cashflow. Test: 'Ser du værdien i det her — ja eller nej?' Siger de ja: 'Så handler det ikke om pris — det handler om cashflow, ik?' Nu kan du løse det korrekte problem.",
        ],
      },
    ],
    model: { name: "LAIR-modellen", items: ["L — Lyt: giv fuld opmærksomhed, brug stilhed, afbryd ikke", "A — Anerkend + empati: gentag det du hørte og vis forståelse for følelsen bag", "I — Isoler: 'Er det den eneste ting der holder dig igen, eller er der noget andet?'", "R — Reager: 'Og derfor betaler du lidt mere — fordi du får præcis de ekstra fordele du sagde var vigtige. Hvad synes du?'"] },
    objections: [
      {
        type: "For høj pris",
        emoji: "💸",
        strategies: [
          {
            title: "LAIR — Isoler og reager præcist",
            emoji: "🔬",
            desc: "Lyt fuldt ud → anerkend følelsen → isoler: er det prisen eller cashflow? → reager på det korrekte problem.",
            scripts: [
              "\"Jeg forstår det fuldstændig.\" [Pause 3 sek.] \"Lad mig spørge dig direkte: Ser du værdien i det her — ja eller nej?\" [Ja] → \"Så handler det faktisk ikke om pris — det handler om cashflow, ik? Lad os kigge på det.\"",
              "\"Må jeg lige spørge...\" [3 sekunders pause] \"...udover pris selvfølgelig — hvad er vigtigt for dig?\" → Kunden skifter fokus fra pris til det der faktisk betyder noget for dem.",
              "\"Hvis prisen ikke var et problem — ville du så købe?\" [Nej] → Der er en anden indvending bag. [Ja] → \"Godt — så lad os finde ud af om vi kan løse prisdelen.\"",
              "\"Jeg hører hvad du siger — og det er en fair tanke. Lad mig spørge: hvad er det præcis du sammenligner med, når du siger det er dyrt? I forhold til hvad?\" → Kunden sætter ord på referencen.",
              "\"Det forstår jeg godt. Er din bekymring selve prisen — eller er det mere et spørgsmål om timing og likviditet?\" [Timing] → Nu løser du det korrekte problem.",
            ],
          },
          {
            title: "MMM — Gør prisen lille og sæt den op mod tab",
            emoji: "💡",
            desc: "Bryd prisen ned til mindste enhed — og sæt den altid op mod den konkrete månedlige/årlige cost of inaction.",
            scripts: [
              "\"Computeren koster 2.000 kr. mere — men bruges i 5 år. Det er 33 kr./md. ekstra for dobbelt så god oplevelse. Synes du 33 kr./md. er en dårlig idé?\"",
              "\"Vores løsning koster 18.000 kr./år — det er 1.500 kr./md. I bruger i dag 8 timer/uge manuelt à 400 kr. Det er 13.000 kr./md. Vil du bruge 1.500 for at spare 13.000?\"",
              "\"Jeres løsning koster 20% mere end Konkurrent X. De 20% inkluderer dedikeret account management og vores platform — som hjalp [Kunde Y] reducere salgscyklussen 35%. Da de så de samlede omkostninger over 12 måneder, sparede de faktisk penge. Lad mig lave den analyse for jer.\"",
              "\"Du mister [X kr./md.] på dette problem. Over 12 måneder er det [Y kr.]. Vores investering er [Z kr.]. Det er ikke et spørgsmål om pris — det er et spørgsmål om hvornår du vil begynde at spare.\"",
              "\"Lad os sætte tallene på bordet: du bruger i dag [X timer/uge] på [problemet] × [din timepris] = [Y kr./md.]. Det er [Y × 12] kr./år du allerede bruger på problemet — bare uden at få noget ud af det.\"",
            ],
          },
          {
            title: "Langtidsperspektiv + Cost of Inaction",
            emoji: "📅",
            desc: "Flip spørgsmålet: det er ikke hvad det koster at købe — det er hvad det koster IKKE at købe.",
            scripts: [
              "\"Det er korrekt, det er lidt dyrere. Men du sagde dette er et 5-års køb. Vil det være fair at sige det er et langtidskøb? [Ja] — Så på længere sigt: om 1-2 år, hvilken løsning ville du have takket dig selv for?\"",
              "\"Hvad tror du egentlig ville ske, hvis du gik med det billigere valg om 18 måneder? Hvad ville du misse?\" → Kunden sætter selv ord på den fremtidige smerte.",
              "\"Du mister [X kr./md.] på dette problem. Over 12 måneder er det [Y kr.]. Vores investering er [Z kr.]. Det er ikke et spørgsmål om pris — det er et spørgsmål om hvornår du vil begynde at spare.\"",
              "\"Lad os prøve et tankeeksperiment: du siger nej i dag og revisiterer om 12 måneder. Hvad er der sket i din virksomhed i mellemtiden? Problemet er stadig der. Det har kostet dig [Y kr.] yderligere. Er de 12 måneder med [problem] prisen for at udskyde?\"",
              "\"Grunden til at det er dyrere er [list de særlige fordele for kunden]. Du kan sagtens gå med det billigere alternativ — det er dit kald. Men de ekstra fordele vi gennemgik — er det ikke noget der vil betyde noget for dig? [Ja] — Er det så ikke værd at give lidt ekstra for?\"",
            ],
          },
        ],
        scripts: [],
      },
      {
        type: "Skal tænke over det / ikke lige nu",
        emoji: "🤔",
        strategies: [
          {
            title: "Røgslør-teknikken — ignorer og spørg om ideen",
            emoji: "🎭",
            desc: "\"Lad mig tænke\" er næsten altid et røgslør. Ignorer det og spørg om selve ideen giver mening — det er din vej tilbage i samtalen.",
            scripts: [
              "\"Jeg hører hvad du siger, og kan godt forstå dig — men hurtigt spørgsmål: giver ideen her mening? Kan du lide ideen?\" [Ja, det er det vel] → \"Præcis — fordi det du sagde med [X] er jo præcis det du får. Du får X og dit problem løses med Y.\"",
              "\"Selvfølgelig, det er fair. Men lad mig spørge dig noget inden du tager af sted: er der noget der har gjort dig utryg i dag — noget vi ikke har fået snakket om?\" → Afslører den skjulte bekymring.",
              "\"Ja, tag endelig den tid du har brug for. Men lad mig sikre at du har alt hvad du skal bruge: hvad er det præcist du vil tænke igennem?\" → De afslører den reelle bekymring frivilligt.",
              "\"Klart — og for at gøre det nemt for dig: hvis du skulle pege på det ENE der giver dig tøven, hvad ville det så være?\" → Isoler og løs.",
              "\"Det respekterer jeg. Jeg vil bare lige spørge — hvad er alternativet til at løse det her nu? Hvad gør I i stedet?\" → De confronter at der ikke er en god plan B.",
            ],
          },
          {
            title: "Isoler den ægte bekymring",
            emoji: "🔬",
            desc: "Der er altid EN specifik ting de vil tænke over. Find den — og løs den nu frem for at miste samtalen.",
            scripts: [
              "\"Ja selvfølgelig. Bare lige hurtigt — hvad er det præcist du vil tænke over? Hvad er din største bekymring?\" → Lyt fuldt ud. Det de siger nu er den reelle indvending.",
              "\"Lad os antage du tager hjem og bruger ugen på det: hvad bruger du mest tid på at overveje? Hvad ville stoppe dig fra at sige ja?\" → De tegner selv billedet af det du skal løse.",
              "\"Hvad ville gøre det nemmere for dig at sige ja i dag — hvad mangler du?\" → Direkte og respektfuldt.",
              "\"Er det [A], [B] eller [C] der er det du vil tænke over?\" → Give dem valgmuligheder hjælper dem italesætte bekymringen.",
              "\"Det forstår jeg godt — timing er vigtigt. Hvad er jeres største prioritet lige nu?\" [Lytter] → \"Det er interessant — for det er præcis det her løser. Hvad koster det jer per måned at problemet stadig er der om 3 måneder?\"",
            ],
          },
          {
            title: "Cost of Inaction — hvad koster yderligere forsinkelse?",
            emoji: "💰",
            desc: "Vis konkret hvad det koster dem per uge/måned at udskyde beslutningen.",
            scripts: [
              "\"Selvfølgelig. Men jeg vil gerne sikre at du tager en god beslutning. Hvad er alternativet til at løse det her nu — hvad gør I i stedet?\" → De confronter at der ikke er et reelt alternativ.",
              "\"Hvad koster det jer per måned at problemet stadig er der om 3 måneder?\" → Lad dem sætte tal på. Urgency opstår naturligt.",
              "\"Lad os sige du venter 6 måneder — hvad sker der med [problem] i mellemtiden? Og hvad koster det?\" → Future projection skaber urgency uden pres.",
              "\"Er der noget der gør at det her er mere akut nu end om 3 måneder — eller er det omvendt?\" → Du kortlægger om der er en vinduesperiode.",
              "\"Hvad er det du skal have på plads inden du kan sige ja? Kan vi hjælpe med det — fx en prøveperiode eller en trinvis opstart?\" → Sænk barrieren.",
            ],
          },
          {
            title: "Feel-Felt-Found — du er ikke alene om den tvivl",
            emoji: "🤝",
            desc: "Normalisér tvivlen, giv dem et case der minder om deres situation — og lad dem høre hvad andre fandt ud af.",
            scripts: [
              "\"Jeg forstår du vil tænke over det — det ville jeg også. Men ved du hvad? Mange af dem jeg taler med siger præcis det samme. Dem der tog sig tid til at undersøge det lidt dybere, fandt ud af at det faktisk løste et problem de ikke vidste de havde. Er du åben for at tage 5 minutter mere på netop det?\"",
              "\"Det giver mening — det er en vigtig beslutning. Andre kunder har følt præcis det samme. De fandt ud af at det de egentlig var bange for, aldrig gik galt. Hvad er det DU er mest i tvivl om?\" → Lyt fuldt ud. Det de siger er den reelle bekymring.",
              "\"Mange der siger de vil tænke over det, finder ud af de allerede har svaret — de er bare ikke helt klar til at sige det højt endnu. Hvad er det du sidder med?\"",
              "\"Jeg forstår du føler at du har brug for lidt tid. Mange har følt det samme på det her tidspunkt. Det de fandt ud af var, at den eneste ting der holdt dem igen, faktisk var noget vi nemt kunne løse. Hvad er det der giver dig tøven?\"",
              "\"Det respekterer jeg. Bare ét spørgsmål: er det at du vil tænke over DET HER — eller er der et ubesvaret spørgsmål der giver dig tøven? For i andet tilfælde kan vi faktisk løse det nu.\"",
            ],
          },
          {
            title: "Daniel G — hvad koster hver uges forsinkelse?",
            emoji: "🦁",
            desc: "Sælg fra styrke. Giv dem nødudgangen og stil det direkte spørgsmål: hvad koster det dem per uge at vente?",
            scripts: [
              "\"Hør — det er muligvis ikke det rigtige for dig, og det er helt fint. Men inden vi lukker samtalen: hvad koster det dig per uge at problemet stadig er der? Sæt et tal på det.\" → [Pause] → Urgency opstår naturligt.",
              "\"Okay, du vil tænke over det. Det er fair. Men lad mig stille dig det ærlige spørgsmål: hvad er der anderledes om 3 uger? Hvad ændrer sig i din situation, så beslutningen er nemmere da?\" → De confronter at der sjældent er et godt svar.",
              "\"Ja, tag den tid du har brug for. Bare af nysgerrighed: hvad er den største risiko ved at sige ja nu — hvad er du egentlig bange for?\" → De formulerer den reelle bekymring og du kan løse den.",
              "\"Det forstår jeg. Og det er muligvis slet ikke noget for dig. Men bare hurtigt: hvad er alternativet til at løse det her problem? Hvad er plan B?\" → De confronter at der ikke er et reelt alternativ.",
              "\"Klart. Men inden vi siger farvel — forestil dig om 6 måneder: hvad sker der med [problemet] hvis du ikke løser det nu? Er status quo en bevidst strategi, eller er det bare udsætning?\" → Direkte og respektfuldt.",
            ],
          },
        ],
        scripts: [],
      },
      {
        type: "Skal snakke med min chef / partner",
        emoji: "👥",
        strategies: [
          {
            title: "Test om det er reel indvending eller forsinkelsesstrategi",
            emoji: "🔬",
            desc: "Spørg om DE SELV er klar, forudsat at den anden person siger ja. Det afslører om \"chef\" er den ægte årsag eller et røgslør.",
            scripts: [
              "\"Ja selvfølgelig, det er vigtigt at have sit bagland med. Lad os antage at din chef/partner giver thumbs up — ville du selv føle dig klar til at gå videre?\" [Nej] → \"Hvad mangler du selv for at kunne sige ja?\" [Ja] → \"Fedt, hvad tror du ville være deres største bekymring?\"",
              "\"Giver god mening. Hvad tror du vedkommendes største spørgsmål vil være? Lad os sørge for at du har svaret klar inden I snakker.\" → Du hjælper dem sælge det internt.",
              "\"Er det reelt chefen der er forhindringen — eller er der noget du selv stadig er i tvivl om?\" → Ærlig og respektfuld isolation.",
              "\"Hvem er det der i sidste ende godkender en investering som denne? Ville det give mening at inkludere dem i en kort fælles snak?\"",
              "\"Hvad er det du tror din chef vil spørge om? Lad os gennemgå det nu så du er forberedt.\" → Du positionerer dig som hjælpsom og ekspert.",
            ],
          },
          {
            title: "Hjælp dem sælge det internt",
            emoji: "📋",
            desc: "Giv dem det ammunition de behøver for at overtale beslutningstageren — en one-pager, et fælles opkald, eller en ROI-udregning.",
            scripts: [
              "\"Det giver fuldstændig mening. Ville det hjælpe hvis jeg lavede en kort one-pager med de vigtigste fordele og ROI specifikt til din VP? Hvad ville være vigtigst for dem?\"",
              "\"Hvad hvis vi satte et 15-minutters opkald op — så din chef kan stille sine egne spørgsmål direkte til mig? Det er nemmere end at du skal videresende information frem og tilbage.\"",
              "\"Lad mig lave en specifik ROI-beregning til din organisation — noget konkret din chef kan tage stilling til. Hvad er jeres primære KPI'er på det her område?\"",
              "\"Kan vi sætte et fælles møde op om 3-4 dage? Så har du tid til at forberede dig, og vi sikrer at alle spørgsmål besvares direkte.\"",
              "\"Hvad er den ene ting din chef oftest stiller spørgsmål om ved beslutninger som denne? Lad os sikre at du har det svar klar.\"",
            ],
          },
          {
            title: "Tal direkte med beslutningstageren",
            emoji: "🎯",
            desc: "Det bedste er altid at have beslutningstageren i samtalen. Foreslå det som en service.",
            scripts: [
              "\"Hvem er det der i sidste ende godkender en investering som denne? Ville det give mening at inkludere dem i en kort fælles snak — så alle spørgsmål kan besvares direkte?\"",
              "\"Jeg vil gøre det nemt for dig: lad os sætte et 20-minutters møde op med jer begge. Du slipper for at sælge internt, og vi sikrer at alle har samme billede. Hvornår passer det?\"",
              "\"Vil du introducere mig til din chef? Jeg lover at holde det kortere end 20 minutter og fokusere på præcis de forretningsspørgsmål der er relevante for dem.\"",
              "\"Hvad er den hurtigste måde at komme til at tale med beslutningstageren — et opkald, et fælles møde eller noget skriftligt?\"",
              "\"Jeg hørte du nævnte [chefens navn] — ville det hjælpe om jeg sendte en kort executive summary direkte til dem, så du ikke behøver at 'sælge' det internt alene?\"",
            ],
          },
          {
            title: "Feel-Felt-Found — giv dem de rigtige ord til intern pitch",
            emoji: "💬",
            desc: "Normalisér situationen og brug det til at forberede dem til at sælge det internt. Giv dem et konkret script de kan bruge.",
            scripts: [
              "\"Mange i din situation siger præcis det samme — og det er fornuftigt at have sit bagland med. Lad mig hjælpe dig: hvad er de to ting din chef/partner oftest er bekymret for ved en beslutning som denne? Lad os forberede dig.\"",
              "\"Det forstår jeg godt — og det viser du er en ansvarlig beslutningstager. En kunde jeg talte med forrige uge stod i præcis samme situation. Det der hjalp dem var et klart svar på de tre spørgsmål chefen ville stille. Vil du have jeg hjælper dig med dem?\"",
              "\"Det er klogt. Og for at gøre det nemmere for dig: de fleste chefer fokuserer på ROI og risiko. Vil du have at jeg laver en kort ROI-beregning — noget konkret du kan lægge på bordet?\"",
              "\"Typisk er det enten ROI, risiko eller timing din chef vil fokusere på. Hvad er det du tror er vigtigst for dem? Lad os tage det med det samme.\"",
              "\"Hvad ville din chef/partner sige, hvis du fortalte dem at det koster jer [X kr./måned] at problemet stadig eksisterer — og her er en løsning der koster [Y kr./måned]? Er det en nem intern salgspitch?\"",
            ],
          },
          {
            title: "Belfort Loop — byg certainty og loop til handling",
            emoji: "🔄",
            desc: "Loop-teknikken brugt på 'chef'-indvendingen: validér, byg certainty om produkt, dig og virksomhed — og loop til et konkret næste skridt.",
            scripts: [
              "\"Selvfølgelig, det er den rigtige ting at gøre.\" [Afled] → \"Men lad mig spørge dig: hvad ville du selv sige, hvis chefen spurgte om din mening? Er du selv overbevist?\" [Byg certainty hos kontakten] → \"Godt — for det er dit engagement der sælger det internt.\"",
              "\"Husk på at hvad I får her er [X, Y og Z].\" [Genopbyg produktværdi] → \"Og jeg ville ikke anbefale det hvis jeg ikke var 100% sikker på at det er det rigtige for jer.\" [Sælg dig selv] → \"Hvad er det du tror vil give din chef mest tøven?\"",
              "\"Forestil dig at du sidder til mødet med din chef og præsenterer det her. Hvad siger du? [Lytter] → Godt — du har faktisk allerede solgt det internt. Det eneste der mangler er at få dem med på opkaldet.\"",
              "\"Jo hurtigere I kommer i gang, jo hurtigere ser din chef resultaterne. Det er faktisk den stærkeste salgspitch du kan give dem.\"",
              "\"Hvad er den ene ting din chef/partner vil spørge om? [Svar] → Perfekt. Her er svaret: [besvarer præcist]. Nu er du forberedt. Kan vi sætte et opfølgningsmøde med jer begge inden ugen er omme?\"",
            ],
          },
        ],
        scripts: [],
      },
      {
        type: "Jeg er ikke interesseret",
        emoji: "🚫",
        strategies: [
          {
            title: "Løven — sælg fra overflod, ikke desperation",
            emoji: "🦁",
            desc: "Svar ikke defensivt. Acceptér roligt og spørg nysgerrigt. Du behøver ikke dette salg — og det viser sig i din tone.",
            scripts: [
              "\"Nej nej, bare rolig — jeg ved ikke engang om jeg kan hjælpe dig endnu. [smil] Jeg har brug for at vide lidt mere om [xyz] for at se om det giver mening. Hvad...\" [stil dit spørgsmål — du er tilbage i samtalen]",
              "\"Det forstår jeg godt — og jeg er faktisk slet ikke nået til det punkt endnu. For at se om det overhovedet giver mening, skal jeg forstå din situation lidt bedre. Hvad er jeres største udfordring med [område] i dag?\"",
              "\"Ingen problem — det er faktisk rart at du siger det direkte. Må jeg stille dig et enkelt spørgsmål? [Ja] Hvad er det der gør det uinteressant for dig — er det timingen, budgettet eller noget med hvad vi tilbyder?\"",
              "\"Det respekterer jeg. Lad os se om det giver mening overhovedet — jeg har kun brug for 2 minutter: hvad er din største frustration med [area] i dag?\" → Prospect mode aktiveret.",
              "\"Fair nok. Og det kunne sagtens være at det ikke er noget for dig. Men inden vi konkluderer: hvad er egentlig din største udfordring med [X] i dag?\"",
            ],
          },
          {
            title: "Daniel G nødudgang + prospecting mode",
            emoji: "🎯",
            desc: "Giv dem en nødudgang med det samme — og skift straks til at stille kvalificerende spørgsmål. Det afruster dem.",
            scripts: [
              "\"Det er fair — og det kunne sagtens være at det ikke er noget for dig. Men inden vi konkluderer: hvad er egentlig din største udfordring med [X] i dag?\" → Prospect-mode er aktiveret.",
              "\"Ingen problem. Men kan du hjælpe mig med at forstå: hvad er det der gør at det ikke er interessant? Er det timingen, budgettet, eller er det noget med hvad vi tilbyder?\" → Find det reelle.",
              "\"Det forstår jeg godt — og jeg ville sige det samme i din position. Er det ikke fordi [branchens typiske problem] er noget I kæmper med?\" → Vis branchekendskab og skab genkendelse.",
              "\"Okay. Bare af nysgerrighed: hvad bruger I i dag til at løse [problem] — og hvad er den største frustration med det?\" → Nysgerrig, ikke sælgende.",
              "\"Klart. Og jeg vil ikke holde dig her. Bare hurtigt — hvad ville få det her til at være interessant for jer? Hvad skulle der til?\"",
            ],
          },
          {
            title: "Feel-Felt-Found — normalisér og åbn",
            emoji: "🤝",
            desc: "Anerkend at mange siger præcis det samme — og brug det til at åbne en nysgerrig samtale om hvad der faktisk ville være interessant for dem.",
            scripts: [
              "\"Det er fair. Mange af mine bedste kunder sagde præcis det samme første gang vi talte. Det der ændrede billedet for dem? De opdagede at [problemet] kostede mere end de troede. Er det noget du genkender?\"",
              "\"Det forstår jeg godt — og det ville jeg sige i din position. Bare af nysgerrighed: hvad er det der gør at det ikke er relevant? Er det timingen, budgettet, eller er det noget med hvad vi tilbyder?\"",
              "\"Nej, bare rolig — og det er en fair reaktion. Mange af dem jeg taler med siger det samme i starten. Det de fandt ud af var at [problem] kostede dem mere end de troede. Hvad er din største udfordring med [X] i dag?\"",
              "\"Jeg forstår du føler at det ikke er relevant. Andre har følt det samme. De fandt ud af at det faktisk adresserede et problem de havde normaliseret. Hvad bruger I i dag til at løse [problem]?\"",
              "\"Klart. Og lad mig respektere det. Men hurtigt: hvad er det I faktisk gør i dag for at løse [problemet]? Bare for min forståelse.\" → Spørger, ikke sælger. De åbner sig alligevel.",
            ],
          },
          {
            title: "Belfort 3×10 — identificér hvilken akse der er lav",
            emoji: "🎯",
            desc: "Identificér om 'ikke interesseret' handler om tvivl på produktet, dig som sælger eller virksomheden bag — og adressér præcis den rigtige.",
            scripts: [
              "\"Forstår jeg det rigtigt at det ikke er relevant for jer — eller er det mere at du ikke kender os godt nok til at vurdere det endnu?\" → Spørger direkte om det er tvivl på virksomheden.",
              "\"Jeg vil gerne forstå: er det selve ideen der ikke er interessant — eller er det mere at du er usikker på om vi er de rigtige til at levere det?\" → Identificér om det er produkt- eller virksomhedstvivl.",
              "\"Er der noget jeg har sagt der har givet dig det indtryk? Eller er det mere at timing er forkert?\" → Åbn for at det handler om dig eller tidspunktet, ikke produktet.",
              "\"Hvad ville gøre det interessant — er det mere data, et case fra jeres branche eller en demonstration?\" → Byg certainty på produktaksen specifikt.",
              "\"'Ikke interesseret' dækker tit over ét af tre ting: man tror ikke på produktet, på mig eller på virksomheden. Er det okay jeg spørger hvilken det er for dig?\" → Direkte, professionel, respektfuld.",
            ],
          },
          {
            title: "Cost of Inaction — hvad koster det at ignorere problemet?",
            emoji: "💰",
            desc: "Vis hvad det koster at fortsætte som nu. Omregn 'ikke interesseret' til konkrete tabte ressourcer og mistet mulighed.",
            scripts: [
              "\"Det forstår jeg godt. Men bare hurtigt: hvad er det der tager mest tid/koster mest for dig med [problemet] i dag? Hvad bruger du flest ressourcer på?\" → De sætter selv tallene på cost of inaction.",
              "\"Hvad ville der ske for dig personligt, hvis [problemet] stadig var der om 12 måneder? Hvad ville du have mistet?\" → Future projection der gør cost of inaction personlig.",
              "\"Forstår jeg det rigtigt at [problemet] ikke er en prioritet — eller er det mere at du ikke ser løsningen her som svaret?\" → Skelner mellem interesseniveau og produktfit.",
              "\"Mange der siger de ikke er interesserede, finder ud af at de allerede bruger [X kr./md.] på problemet — de har bare normaliseret det. Ville du være åben for at vi lavede en hurtig analyse?\"",
              "\"Hvad er den ENESTE ting der ville have gjort dig interesseret? Det er ikke et salgsspørgsmål — det er et ægte spørgsmål. Jeg vil gerne forstå hvad jeg overser.\"",
            ],
          },
        ],
        scripts: [],
      },
      {
        type: "Vi klarer os fint",
        emoji: "😌",
        strategies: [
          {
            title: "Challenger — afslør det skjulte problem",
            emoji: "🔭",
            desc: "Tilfredse kunder har altid noget de savner. Din opgave er at finde det ene forbedringspunkt — og åbne en nysgerrighed.",
            scripts: [
              "\"Det er godt at høre — og ærligt talt ville jeg ikke ønske at fikse noget der ikke er i stykker. Bare af nysgerrighed: hvis du kunne ændre bare én ting ved jeres nuværende proces, hvad ville det så være?\" → Lyt. Det de siger er guldminen.",
              "\"Okay, det forstår jeg. Men lad mig stille dig et spørgsmål: én af vores kunder i jeres branche sagde præcis det samme. De var ikke klar over at de tabte 15 timer/uge på [X]. Ville du være åben for en 20-minutters gennemgang — bare for at se om der er noget I overser?\"",
              "\"Dejligt at høre. Og det er faktisk ikke et argument mod det — tværtimod. Ville du give det her en 8, 9 eller 10 ud af 10?\" → [Hvad end de svarer] → \"Hvad mangler for at komme til 10?\"",
              "\"Godt. Hvad er det der fungerer bedst? Og hvad er det ene der stadig irriterer dig lidt?\" → Den anden del er din indgang.",
              "\"Hvad ville det betyde for jer, hvis [specifik forbedring] bare var på plads? Hvad ville I gøre med den tid/de penge?\" → Kunden tegner selv billedet af gevinsten.",
            ],
          },
          {
            title: "Cost of Inaction — hvad koster status quo?",
            emoji: "💰",
            desc: "Sæt tal på hvad det koster at fortsætte som nu. Tilfredse kunder er ikke tilfredse — de er vante.",
            scripts: [
              "\"Hvad koster jeres nuværende proces jer per måned i tid og fejl? Har I nogen ide om det tal?\" → Hjælp dem kvantificere det de normaliserede.",
              "\"Det er forståeligt — mange af vores bedste kunder sagde det samme inden de skiftede. Hvad var det der ændrede billedet for dem? De opdagede at [typisk skjult cost]. Kunne det passe på jer?\"",
              "\"Hvis jeres konkurrent i samme branche er 20% hurtigere/billigere på det her område — hvad betyder det for jer over 12 måneder?\"",
              "\"Hvornår evaluerede I sidst jeres nuværende løsning kritisk mod alternativerne? Markedet har ændret sig en del.\"",
              "\"Det er klart. Ville det give mening at lave en hurtig 20-minutters analyse af hvad jeres nuværende opsætning koster vs. en alternativ tilgang? Ingen forpligtelse — bare et klart billede.\"",
            ],
          },
          {
            title: "Future pacing — er 'fint' godt nok om 12 måneder?",
            emoji: "🔮",
            desc: "Hjælp kunden se fremad. Er den nuværende situation holdbar? Hvad koster det at acceptere 'fint' i stedet for 'fremragende'?",
            scripts: [
              "\"Det er godt at høre. Lad mig stille dig et spørgsmål: om 12 måneder — er 'fint' stadig godt nok? Eller er det et mål at det er bedre end fint?\" → Åbn for ambition om forbedring.",
              "\"Fantastisk. Og hvad er jeres plan for at gå fra 'fint' til 'stærkt' det næste år? Hvad er det ene I ville ønske I var bedre til?\" → De afslører selvmotiveret forbedringsønske.",
              "\"Det er klart. Men hvad sker der i jeres branche de næste 12 måneder? Holder 'fint' step med konkurrenterne, eller er der nogen der løber fra jer?\" → Kompetitiv urgency.",
              "\"Det lyder godt. Hvad er det præcis der gør det 'fint' — og hvad mangler for at det var 'fremragende'?\" → De fortæller dig præcis hvad der mangler.",
              "\"Det respekterer jeg. De virksomheder der klarer sig fremragende, er dem der løbende forbedrer én ting ad gangen. Hvad er jeres næste forbedringspunkt?\"",
            ],
          },
          {
            title: "Feel-Felt-Found — fra 'det virker fint' til eksponentiel forbedring",
            emoji: "🤝",
            desc: "Normalisér situationen og brug social proof til at vise hvad andre der 'klarede sig fint' opdagede da de kiggede nærmere.",
            scripts: [
              "\"Jeg forstår det — og det er faktisk det de fleste siger. Mange af dem der i dag er vores bedste kunder, sagde præcis det samme. De fandt ud af at 'fint' kostede dem mere end de troede i tabt tid og mistet konkurrencefordel. Er det noget der resonerer?\"",
              "\"Rigtig mange virksomheder i jeres branche siger det. Det de opdagede da de kiggede nærmere, var at der var ét specifikt område der kostede dem 15-20% i produktivitet. De vidste det ikke fordi de aldrig målte det. Er du nysgerrig på hvad det er hos jer?\"",
              "\"Det er godt — og det er præcis det 'fint' ser ud fra udefra. Men de bedste virksomheder i jeres branche er ikke tilfredse med 'fint'. De leder altid efter den næste marginalforbedring. Hvad er jeres?\"",
              "\"En af vores kunder klarede sig 'fint' for 18 måneder siden — i dag er de 30% mere effektive. Det startede med det her spørgsmål: hvad er det ENE I ville ønske I var bedre til?\"",
              "\"Det er godt at høre. Jeg vil bare spørge — hvad ville det betyde for jer, hvis I gik fra 'fint' til 'rigtig godt' på det her område? Hvad ville I bruge den ekstra kapacitet til?\"",
            ],
          },
          {
            title: "Sænk tærsklen — et lille skridt uden risiko",
            emoji: "🚪",
            desc: "For kunder der 'klarer sig fint' er tærsklen høj fordi der ikke er en brændende platform. Reducer risikoen til et minimum.",
            scripts: [
              "\"Perfekt — og det er præcis den type kunder vi hjælper bedst, fordi I allerede har fundamentet. Det eneste vi foreslår er en 20-minutters analyse af ét specifikt område. Ingen forpligtelse — bare et klart billede.\"",
              "\"Det er klart. Ville det give mening at vi lavede en gratis benchmark-analyse — bare for at se om der er noget I overser? Mange opdager at de er i top 20% på de fleste ting, men bottom 20% på ét specifikt område. Det er det ene, vi finder.\"",
              "\"Vi arbejder typisk med virksomheder der 'klarer sig fint' — det vigtigste vi giver dem er et klart billede af præcis hvad de IKKE ser. Ville det give mening med en 15-minutters gennemgang?\"",
              "\"I klarer jer fint. Det betyder at en lille investering i at optimere det ene svage punkt har en enorm effekt. Er I åbne for at finde det svage punkt?\"",
              "\"Det er muligvis slet ikke noget for jer. Men ville I give det 30 minutter bare for at have fakta? Det er den hurtigste måde at bekræfte at I klarer jer fint — eller finde det der giver jer et ekstra gear.\"",
            ],
          },
        ],
        scripts: [],
      },
      {
        type: "Vi bruger allerede en konkurrent",
        emoji: "⚔️",
        strategies: [
          {
            title: "Nysgerrig ikke sælgende — find det ene savnede punkt",
            emoji: "🔍",
            desc: "Angrib ikke konkurrenten. Spørg nysgerrigt om hvad de savner. Det åbner dem uden at de føler sig trængt op i en krog.",
            scripts: [
              "\"[Konkurrent] er en solid løsning — jeg ville aldrig foreslå at skifte hvis den virkelig dækker alle jeres behov. Bare nysgerrig: hvis du kunne ændre bare én ting ved jeres setup, hvad ville det så være?\" → Lyt. Det de siger er åbningen.",
              "\"Okay, det forstår jeg godt. Hvad er det bedste ved [Konkurrent]?\" [Lytter] → \"Og hvad er den ene ting der frustrerer jer mest?\" → Du har nu din indgang.",
              "\"Vi prøver ikke at erstatte alt hvad I har — vi vil bare vise jer ét specifikt område hvor vi typisk skaber en markant forskel. Ville et 20-minutters proof of concept give mening?\"",
              "\"Hvornår udløber jeres kontrakt med dem? Og hvad ville få jer til at evaluere alternativerne på det tidspunkt?\"",
              "\"Hvad synes I er [konkurrentens] svageste punkt? Det er det vi typisk ser folk skifte for.\" → Bliv i spørgemodus.",
            ],
          },
          {
            title: "Specifik differentiering + social proof",
            emoji: "🏆",
            desc: "Vis præcis hvad I giver dem som konkurrenten ikke giver — med en konkret case fra samme branche.",
            scripts: [
              "\"[Kunde Z] var i præcis samme position — tilfreds med sin udbyder overordnet. Men de fandt ud af at vores [specifikke differentiator] sparede dem 22% i produktivitet. Det er præcis det område du nævnte. Ville det give mening at kigge på det?\"",
              "\"Det ene område hvor vi konsekvent ser folk skifte er [X]. Oplever I det problem også — eller er det ikke relevant for jer?\"",
              "\"Vores kunder der skiftede fra [Konkurrent] fremhæver typisk [differentiator 1] og [differentiator 2] som afgørende. Er det noget der er vigtigt for jer?\"",
              "\"Ville det give mening at starte med en sammenligning på det ene område der er vigtigst for jer? Ingen forpligtelse — bare en fair evaluering.\"",
              "\"Hvad skal der til for at I ville overveje at skifte? Hvad er de vigtigste kriterier?\" → Prospecting — du kortlægger vinduet.",
            ],
          },
          {
            title: "Feel-Felt-Found — hvad skifteren fandt ud af",
            emoji: "🤝",
            desc: "Normalisér at bruge en konkurrent og fortæl historien om en lignende kunde der var i præcis samme situation.",
            scripts: [
              "\"Det er der mange der gør — og [Konkurrent] er en solid løsning til mange ting. En af mine kunder brugte dem i 3 år og var tilfreds. Det der ændrede billedet var ét specifikt område hvor [Konkurrent] ikke skalerede med dem. Er det noget I oplever?\"",
              "\"Ja, det giver god mening. Mange af vores kunder kom fra [Konkurrent] — og de fleste var tilfredse. Det de fandt ud af var at der var ét specifikt område vi var markant bedre til. Det ene område kostede dem [X] per måned. Er I åbne for at se om det er relevant?\"",
              "\"Fuldstændig forståeligt. Vi arbejder faktisk med mange kunder der stadig bruger [Konkurrent] til visse ting. Det er ikke et valg mellem det ene eller det andet — det handler om hvad der passer bedst til hvad. Hvad er jeres primære use case med dem?\"",
              "\"Mange af vores bedste kunder startede med at bruge [Konkurrent]. Da de kiggede nærmere, fandt de ud af at vores [specifikke funktion] sparede dem [X timer/uge]. Ville det give mening at se om det er relevant her?\"",
              "\"Det forstår jeg godt — og jeg ville sige det samme i din position. Bare nysgerrig: hvad er det der fungerer bedst ved [Konkurrent] for jer? Og hvad ville du ønske var anderledes?\" → De afslører åbningen selv.",
            ],
          },
          {
            title: "Belfort Loop — afled og find ét forbedringspunkt",
            emoji: "🔄",
            desc: "Angrib ikke konkurrenten. Loop roligt forbi indvendingen og find præcis ét område at bygge certainty på.",
            scripts: [
              "\"Det forstår jeg — og [Konkurrent] er et godt valg til mange ting.\" [Afled] → \"Husk på at hvad vi tilbyder er [specifik differentiator] som I ikke har i dag.\" [Genopbyg] → \"Det eneste jeg beder om er 20 minutter til at vise jer præcis det ene område. Kan vi det?\"",
              "\"Og det er en fair pointe — I har allerede investeret i en løsning.\" [Valider] → \"Men forestil dig om 6 måneder: [Konkurrent] klarer stadig det samme, men markedet har bevæget sig. Vil I være bagud på [specifikt område]?\"",
              "\"Det er forventeligt — og vi respekterer jeres valg.\" [Afled] → \"Men spørgsmålet er: hvad er den ene ting [Konkurrent] ikke giver jer, som I faktisk savner?\" → De afslører åbningen selv.",
              "\"Lad mig spørge dig direkte: hvis vi kan vise jer at ét specifikt område giver jer 15% bedre [resultat] end I har nu, er det så værd at kigge på?\"",
              "\"Fantastisk. Vi ønsker slet ikke at erstatte alt hvad I har. Vi vil bare vise jer ét område. Og hvis det ikke giver mening, respekterer vi det 100%. Er det fair?\"",
            ],
          },
          {
            title: "Cost of staying — hvad koster det at blive?",
            emoji: "💰",
            desc: "Flip spørgsmålet: det er ikke hvad det koster at skifte — det er hvad det koster IKKE at skifte. Kvantificér cost of staying.",
            scripts: [
              "\"Hvad koster det jer per måned at [problemet med konkurrenten] stadig er der? Ikke skiftekostnad — men hvad koster status quo per måned?\" → De kvantificerer themselves cost of staying.",
              "\"Hvornår udløber jeres kontrakt med dem? Og hvad ville I bruge den tid på, hvis I begyndte at evaluere alternativer nu — så I er klar til at handle til den dato?\"",
              "\"Lad os sætte tal på det: I bruger [Konkurrent] til [X]. Det koster [Y/md.]. Hvad leverer de faktisk tilbage i resultater? Har I nogen ide om jeres ROI?\"",
              "\"Hvad sker der med jeres konkurrenceposition, hvis konkurrenter i branchen bruger en bedre løsning og I fortsætter med [Konkurrent]? Hvad er cost of staying i et konkurrenceperspektiv?\"",
              "\"Ville det give mening at lave en direkte sammenligning — samme metrik, samme tidsperiode, jeres nuværende løsning vs. os? Det eneste formål er at give jer fakta til at træffe en informeret beslutning.\"",
            ],
          },
        ],
        scripts: [],
      },
      {
        type: "Jeg har aldrig hørt om jer",
        emoji: "🤷",
        strategies: [
          {
            title: "Byg troværdighed hurtigt med social proof",
            emoji: "🏅",
            desc: "Normaliser situationen, præsentér konkrete kendte referencer, og reducer risikoen med en lavrisiko-indgang.",
            scripts: [
              "\"Det er helt fair — og jeg sætter pris på ærligheden. Vi er betroet af [kendte kunder] og har hjulpet [X antal] virksomheder i jeres branche med at opnå [specifikt resultat]. [Navn] kendte os heller ikke — efter et pilot oplevede de 40% forbedring inden for 90 dage.\"",
              "\"Det forstår jeg godt. Ville et pilotprojekt give mening for at reducere risikoen på jeres side? I behøver ikke committe til noget stort — lad resultaterne tale for sig selv.\"",
              "\"Vi er specialiserede i jeres branche — her er tre kunder I måske kender: [referencer]. De var alle i jeres situation. Vil du have 10 minutter med én af dem som reference?\"",
              "\"Forståeligt nok. Ville du have 20 minutter til en demonstration? Det er den hurtigste måde at se om det giver mening — uden nogen forpligtelse.\"",
              "\"Vi er ikke den mest kendte løsning — men vi er den der typisk giver det bedste resultat i jeres specifikke branche. Hvorfor det? [Kort pitch om niche-ekspertise].\"",
            ],
          },
          {
            title: "Perciperet autoritet — vis ekspertise inden salg",
            emoji: "👑",
            desc: "Demonstrér din viden om deres branche og typiske problemer. Ekspertise bygger troværdighed hurtigere end referencer.",
            scripts: [
              "\"Forståeligt nok. Lad mig stille dig et spørgsmål: hvad er jeres største udfordring med [X] i dag?\" → Svar med indsigt der viser branchekendskab. Eksperten behøver ikke pitche.",
              "\"Vi er faktisk specialiserede i jeres branche. En typisk udfordring vi ser er [specifik branche-smerte] — er det noget I også kæmper med?\" → Genkendelse skaber troværdighed.",
              "\"Det er forventeligt — vi er ikke den store brand. Men vi har [X sociale beviser]. Lad mig vise dig tre konkrete resultater fra virksomheder i din størrelse i din branche.\"",
              "\"Hvad ville der skulle til for at du følte dig tryg nok til en indledende snak?\" → Direkte spørgsmål der åbner for hvad der mangler.",
              "\"Mange af vores bedste kunder vidste heller ikke hvem vi var inden vi talte. De er glade for at de sagde ja til 20 minutter. Hvad er det du har på den næste halve time?\"",
            ],
          },
          {
            title: "Feel-Felt-Found — mange kendte os ikke, de er glade nu",
            emoji: "🤝",
            desc: "Normalisér situationen og giv konkrete eksempler på kunder der var i præcis samme position og nu er loyale.",
            scripts: [
              "\"Det er der mange der siger — og det forstår jeg godt. Mange af vores bedste kunder kendte heller ikke os inden vi talte. De var skeptiske i starten. Det de fandt ud af var at vores [specifikke fordel] svarede præcis til det de manglede. Er du åben for 20 minutter?\"",
              "\"Forståeligt nok — vi er ikke den mest synlige løsning på markedet. Men [Kunde A], [Kunde B] og [Kunde C] kendte os heller ikke. I dag er de vores mest loyale kunder. Hvad giver dig mest tøven — vores størrelse, erfaring eller noget andet?\"",
              "\"Mange der i dag er vores bedste kunder sagde præcis det. De fandt ud af at det vi giver dem er [specifik styrke] — og at det mere end opvejer at vi ikke er den største brand. Hvad er vigtigst for dig: brand eller resultat?\"",
              "\"Det er faktisk rart at høre — fordi det giver mig mulighed for at vise dig præcis hvem vi er fra bunden. [2 sætninger om jer] + [2 konkrete resultater]. Er der noget der fanger din opmærksomhed?\"",
              "\"Vi er ikke den dyre brand-løsning. Vi er den løsning der leverer. Her er tre resultater fra virksomheder der ligner jer: [case 1, case 2, case 3]. Kan du se relevansen?\"",
            ],
          },
          {
            title: "Labeling — navngiv usikkerheden og giv den luft",
            emoji: "🏷️",
            desc: "Brug labeling til at navngive det der bekymrer dem ved at handle med en ukendt leverandør — og adressér det direkte.",
            scripts: [
              "\"Det lyder som om du er usikker på om vi er solide nok til at stole på i det lange løb — er det rigtigt?\" → [Ja/Delvist] → \"Det forstår jeg. Lad mig vise dig præcis hvad vi er bygget på: [social proof + track record].\"",
              "\"Det lyder som om du er bekymret for risikoen ved at vælge en løsning du ikke kender — er det korrekt forstået?\" → [Ja] → \"Det er en fornuftig bekymring. Hvad skal der til for at du føler dig tryg nok til i hvert fald at evaluere os?\"",
              "\"Det lyder som om manglende kendskab skaber usikkerhed for dig — er det fair sagt?\" → [Ja] → \"Godt. Hvad er det der mangler for at du har nok information til at tage stilling?\"",
              "\"Det lyder som om du er skeptisk fordi du ikke ved hvem vi er — og det er en fair reaktion. Hvad ville reducere den skepsis? Er det referencer, en demo eller et pilot?\"",
              "\"Det lyder som om 'ikke hørt om jer' egentlig handler om tillid — og tillid kræver bevis. Hvad ville bevise for dig at vi er troværdige? Hvad er dit benchmark?\"",
            ],
          },
          {
            title: "Belfort — byg certainty systematisk på virksomhedsaksen",
            emoji: "🏆",
            desc: "Når 'aldrig hørt om jer' handler om lav certainty på virksomhedsaksen, byg den op med sociale beviser, track record og en klar garanti.",
            scripts: [
              "\"Lad mig give dig tre grunde til at vi er troværdige: 1) Vi har hjulpet [X antal] virksomheder i [branche]. 2) Vi har [Y år] erfaring. 3) Vi giver [garanti/pilot]. Hvad er vigtigst for dig at vide mere om?\"",
              "\"Husk på at hvad du får er ikke bare et produkt — du får [vores specifikke styrke]. Og du ved jeg ikke ville anbefale os, hvis jeg ikke var sikker på vi kan levere.\" → \"Hvad er din største bekymring?\"",
              "\"Forestil dig om 6 måneder: I har brugt vores løsning og [resultat] er opnået. Den manglende brand-kendskab er glemt — resultaterne taler for sig selv. Er det en fremtid I er åbne for at undersøge?\"",
              "\"Jeg forstår skepsis overfor en ny leverandør — det er sund forretningssans. Lad os reducere risikoen: hvad ville du have brug for at se/høre for at det var trygt at give os 20 minutter?\"",
              "\"Vi er faktisk mere interesserede i at opbygge et langsigtet partnerskab end at lave ét salg. Det er derfor vi ikke er den mest synlige løsning — vi bruger ressourcerne på at levere resultater. Kan vi vise dig det i praksis?\"",
            ],
          },
        ],
        scripts: [],
      },
      {
        type: "Det er dårlig timing",
        emoji: "📅",
        strategies: [
          {
            title: "Daniel G — Grav dybere: hvad er 'dårlig timing' egentlig?",
            emoji: "🦁",
            desc: "Timing er næsten altid et røgslør for en anden bekymring. Løven graver dybere og presser kunden til at specificere præcis hvad der gør timingen dårlig — og hvornår den er god.",
            scripts: [
              "\"Det forstår jeg godt. Bare af nysgerrighed — hvad er det præcist der gør timingen dårlig lige nu?\" [Lytter] → \"Og hvornår ville timingen være god? Hvad skal der til?\" → De afslører den reelle barriere.",
              "\"Okay, timing er vigtig. Men lad mig spørge dig om noget: hvad sker der med [problem] i de næste 3 måneder, mens I venter? Løser det sig af sig selv?\" → De confronter at problemet ikke går væk.",
              "\"Hvad er den største prioritet for jer i det her kvartal?\" [Svar] → \"Interessant — det er faktisk præcis det her adresserer. Kan timingen egentlig retfærdiggøres, når I arbejder på det alligevel?\"",
              "\"Hvornår ville det IKKE være dårlig timing? Hvad er den perfekte dato?\" [De nævner en dato] → \"Fedt — hvad kan vi gøre nu for at forberede jer til at starte til [dato]?\"",
              "\"Ville det give mening at starte småt — en pilot der koster [lavere pris] og ikke kræver fuld commitment — så I ikke behøver at starte 'rigtig' endnu?\" → Sænk handlingstærsklen til at det passer i den 'dårlige' timing.",
            ],
          },
          {
            title: "Belfort Loop — afled, byg certainty, loop tilbage",
            emoji: "🔄",
            desc: "Timing-indvendingen er perfekt til Belfort looping. Afled roligt, byg certainty om at løsningen er den rigtige uanset timing — og loop til closing. Anden loop: find den konkrete timing-barriere og byg en bro.",
            scripts: [
              "\"Jeg hører hvad du siger — og det er en fair tanke.\" [Afled] → \"Men husk: det her problem koster jer [X kr./md.] mens I venter. Det er [X × 3] kr. over de næste 3 måneder. Det er timingen der koster jer.\" [Cost certainty] → \"Giver det mening at starte nu?\"",
              "\"Timing er vigtigt — og jeg respekterer det.\" [Validér] → \"Men spørgsmålet er: hvornår er der ALDRIG andet på dagsordenen? For de fleste virksomheder er det aldrig.\" [Realitetscjek] → \"Hvad er det der konkret blokerer i dag?\"",
              "\"Og det er en fair pointe.\" [Afled] → \"Jeg vil bare dele at [tilsvarende kunde] sagde præcis det samme. De ventede 4 måneder. Da de endelig startede, sagde de 'vi burde have gjort det for 4 måneder siden'. [Social proof] → \"Er du villig til at tage den risiko?\"",
              "Loop 2: \"Okay — lad mig spørge dig direkte: hvad er det ENE der gør timingen dårlig? Er det budget, ressourcer, intern godkendelse eller noget andet?\" → Find det præcise og løs det specifikt.",
              "\"Future pacing: Forestil dig at I har haft det her på plads i 6 måneder. Det der var dårlig timing er glemt, [problem] er løst, og I høster [resultat]. Hvad ville det betyde for jer?\" → De projicerer sig til en bedre fremtid. Timing fylder mindre.",
            ],
          },
          {
            title: "Feel-Felt-Found — timing er aldrig perfekt",
            emoji: "🤝",
            desc: "Normalisér timing-indvendingen og brug social proof til at vise at de der ventede på 'perfekt timing', fortrød det.",
            scripts: [
              "\"Det forstår jeg godt — og det er den mest normale ting i verden at sige. De fleste der siger 'dårlig timing' og alligevel starter, fortæller mig bagefter at de er glade for de ikke ventede. Hvad er det konkrete der gør timingen dårlig?\"",
              "\"Mange siger præcis det samme — og det er en fair betragtning. Men en af mine kunder sagde det for 4 måneder siden. De ventede. Da de endelig startede, sagde de 'vi ville ønske vi havde startet dengang'. Hvad ville der være anderledes for dig, hvis du startede nu?\"",
              "\"Jeg forstår du føler at timingen ikke er den bedste. Andre har følt præcis det samme. Det de fandt ud af var at der aldrig er perfekt timing — men der er altid en pris for at vente. Hvad er prisen per måned for dig, at problemet stadig er der?\"",
              "\"De virksomheder der forbedrer sig hurtigst, er dem der aldrig venter på 'perfekt timing'. De starter nu og tilpasser undervejs. Ville det give mening?\"",
              "\"Rigtig mange tænker det. De der startede alligevel, fandt ud af at timingen faktisk aldrig ville have været perfect — og at ventetiden kostede dem [X kr.]. Er du tryg med at betale den pris for at vente?\"",
            ],
          },
          {
            title: "Cost of Inaction — hvad koster det at vente?",
            emoji: "💰",
            desc: "Gør ventetiden konkret. Hvad koster det per uge/måned at problemet stadig er der? Urgency skabes af fakta, ikke pres.",
            scripts: [
              "\"Det er fair — timing er vigtig. Men lad os sætte tal på: hvad koster det jer per måned at problemet stadig er der? [Lytter] Godt — det er hvad ventetiden koster jer. Over [X måneder] er det [total]. Er den investering i 'at vente' den rigtige?\"",
              "\"Hvad er det præcist der er dårlig timing? [Lytter] Okay — og hvad koster det jer i mellemtiden? Er prisen for at vente lavere end prisen for at starte nu?\"",
              "\"Lad os prøve et regnestykke: problemet koster jer [X kr./md.]. I overvejer at vente 3 måneder. Det er [3 × X] i tabt cost of inaction. Er det et regnestykke der giver mening?\"",
              "\"Timing er vigtig — og jeg respekterer det. Men hvad er den konkrete forskel om 3 måneder? Hvad ændrer sig i jeres situation? Jeg spørger oprigtigt — ikke for at presse.\" → De confronter at der sjældent er en god grund.",
              "\"Hvad hvis vi deler investeringen op så den passer ind i den 'dårlige timing'? Mange problemer med timing handler om cashflow — ikke om selve beslutningen. Er det noget vi kan løse?\"",
            ],
          },
          {
            title: "Daniel G — giv nødudgangen og stil det skarpe spørgsmål",
            emoji: "🦁",
            desc: "Sælg fra styrke. Tag presset af og stil det direkte spørgsmål: hvad skal der ændre sig for at timingen er god?",
            scripts: [
              "\"Hør — det er muligvis ikke det rigtige tidspunkt for jer, og det er helt okay. Men lad mig stille dig et ærligt spørgsmål: hvornår er det den rigtige timing? Hvad skal der til?\" → [Lytter] → Nu ved du præcis hvad der blokerer.",
              "\"Det er fair — og jeg vil ikke presse dig. Men lad mig spørge: hvad sker der for din forretning, hvis [problemet] eksisterer om 12 måneder? Hvad er konsekvensen? [Pause] Er den konsekvens okay for dig?\"",
              "\"Okay, timing er forkert. Det forstår jeg. Og det er muligvis slet ikke noget for jer nu. Men bare én ting: hvad er den vigtigste prioritet for jer i det næste kvartal? [Lytter] Interessant — for det er præcis det vi hjælper med.\"",
              "\"Det er en fair pointe — og jeg presser aldrig nogen. Men lad os se det igennem: hvad er den konkrete barriere for at timingen er forkert? Er det budget, ressourcer, intern godkendelse eller noget andet?\" → Find den reelle barriere og løs den specifikt.",
              "\"Klart. Og hvad ville gøre det til god timing? Hvad er den ene ting der skulle ændre sig? [Lytter] Godt — og hvad kan vi gøre NU for at hjælpe jer hen mod det mål, så I er klar til at handle til den tid?\"",
            ],
          },
        ],
        scripts: [],
      },
      {
        type: "Send mig en email",
        emoji: "📩",
        strategies: [
          {
            title: "Daniel G — Nødudgang + sænk paraderne",
            emoji: "🦁",
            desc: "\"Send en email\" er den klassiske høflige flugt. Løven giver dem nødudgangen og bruger den til at åbne samtalen igen. Målet er ikke at undgå emailen — men at finde den reelle indvending bag den.",
            scripts: [
              "\"Selvfølgelig — det er helt fair. Jeg sender dig gerne noget. Men inden jeg gør det: hvad ville du gerne have mere information om? Hvad er det du vil tage stilling til, når du har læst det?\" → De afslører den reelle bekymring.",
              "\"Nej nej, bare rolig — jeg sender intet spam.\" [smil] \"Men hurtigt inden vi slutter: er der noget bestemt ved det her der fik dig til at tænke 'det vil jeg gerne vide mere om'?\" → Nysgerrig, ikke sælgende.",
              "\"Klart — og hvad ville du primært kigge efter i den email? Er det prisen, produktdetaljer, referencer eller noget andet?\" → De specificerer hvad der mangler — og du har nu den reelle indvending.",
              "\"Selvfølgelig. Jeg vil bare sikre at emailen er relevant for dig: hvad er den vigtigste ting du mangler for at kunne tage en beslutning?\" → Du designer emailen til at løse den reelle barriere.",
              "\"Okay — og vil du egentlig have en email, eller er det mere at du gerne vil have tid til at tænke over det?\" [Ærlig] → Hvis tænke: \"Hvad er det du vil tænke igennem?\" → Du er tilbage med den reelle indvending.",
            ],
          },
          {
            title: "Belfort Loop — afled og find den skjulte barriere",
            emoji: "🔄",
            desc: "\"Send mig en email\" er næsten aldrig om informationsbehovet — det er om certainty. Første loop: validér og byg certainty. Andet loop: find den præcise barriere og luk specifikt.",
            scripts: [
              "\"Selvfølgelig, det sender jeg gerne.\" [Afled] → \"Men lad mig spørge dig — udover informationen: er der noget der giver dig tøven? Noget du er usikker på?\" [Certainty-probe] → \"Fordi den bedste email i verden løser ikke det, hvis det er noget vi ikke har fået snakket om.\"",
              "\"Det giver jeg dig.\" [Afled] → \"Men en ting til: jeg vil gerne forstå hvad det er du leder efter i emailen. Er det mere detaljer om [X], referencer fra andre kunder, eller er det noget med prisen?\" [Find barrieren] → \"Fordi det kan jeg faktisk besvare nu — så du slipper for at vente.\"",
              "Loop 2: \"Hvad nu hvis vi bare tog 5 minutter nu — og jeg besvarer de spørgsmål du ville have stillet efter at have læst emailen? Det sparer jer begge tid.\" → Du fjerner ventetiden og addresserer barrieren direkte.",
              "\"Det sender jeg naturligvis. Og hvornår er et godt tidspunkt at snakke efter du har kigget på det?\" → Du lukker på et opfølgningsaftale. Det er nemmere end et 'nej' og holder samtalen i live.",
              "Future pacing: \"Forestil dig at du læser den email i morgen. Hvad er det der får dig til at sige 'ja, det her vil jeg gerne starte med'?\" → De tegner selv billedet af hvad der skal til for et ja.",
            ],
          },
          {
            title: "LAER — lyt, anerkend, udforsk og responder specifikt",
            emoji: "🔍",
            desc: "LAER: Lyt fuldt ud → Anerkend helt → Udforsk hvad der er bag emailanmodningen → Responder direkte på den reelle barriere. Emailen er symptom — ikke årsag.",
            scripts: [
              "L: \"Send mig en email — det lyder godt.\" [Lyt, afbryd ikke] → A: \"Selvfølgelig, det er fair.\" → U: \"Hvad er den vigtigste ting du gerne vil have afklaret inden du tager en beslutning?\" → R: \"Det kan jeg besvare nu, så du slipper for at vente på emailen.\"",
              "L+A: \"Naturligvis sender jeg det.\" → U: \"Hvad vil du egentlig overveje, når du læser den? Hvad er det du vil tage stilling til?\" → De afslører den reelle indvending — og du har nu noget konkret at adressere i stedet for at sende til ingenting.",
              "A: \"Det giver jeg dig med glæde.\" → U: \"Er der én ting der mangler for at du kan sige ja nu — eller handler det mere om at du vil tænke det igennem?\" → To vidt forskellige scenarier — det ene kræver information, det andet kræver en samtale.",
              "\"Inden jeg sender: hvad er det du mangler at vide? Hvis du havde alt det i emailen, ville det så være nok til at tage en beslutning?\" → Du tester om emailen er den reelle barriere — eller om der er noget andet.",
              "R: \"Du ved hvad — i stedet for at du skal læse en lang email, hvad hvis jeg besvarer de 2-3 vigtigste spørgsmål nu på 3 minutter? Så har du det hurtigere end emailen. Hvad er det vigtigste?\" → Du fjerner friktionen og holder samtalen i live.",
            ],
          },
          {
            title: "Feel-Felt-Found — samtalen er hurtigere end emailen",
            emoji: "🤝",
            desc: "Normalisér emailanmodningen. Brug social proof til at vise at de der valgte at snakke nu, fik svar hurtigere og uden misforståelser.",
            scripts: [
              "\"Det forstår jeg godt — og det er en naturlig ting at sige. Mange andre har bedt om en email. Det de fandt ud af var at selve samtalen gav dem svar i løbet af 5 minutter — frem for at vente på en email og derefter stadig have spørgsmål. Hvad er din vigtigste bekymring?\"",
              "\"Mange siger præcis det — og det giver god mening. Det de fleste fandt ud af var at emailen gav dem information, men samtalen gav dem svar. Er der én ting jeg kan besvare for dig nu — så du har det bedste fra begge verdener?\"",
              "\"Jeg forstår du vil have noget på skrift. Andre har følt det samme. Det de fandt ud af var at den vigtigste beslutning allerede var taget i samtalen — og emailen var bare bekræftelse. Hvad er det du vil overveje efter du har fået emailen?\"",
              "\"Du er ikke den første der siger det. Og de fleste der beder om en email, gør det fordi de mangler noget konkret. Hvad er det ENE spørgsmål du vil have svar på? Lad mig besvare det nu.\"",
              "\"Det sender jeg naturligvis. Og for at gøre den så relevant som mulig: hvad er den situation du sidder i, som gør at det her kunne være interessant? Det hjælper mig lave en email der faktisk giver dig noget.\" → Du åbner samtalen igen ved at samle kontekst.",
            ],
          },
          {
            title: "Cost of Inaction — emailen er et bekvemt udskud",
            emoji: "💰",
            desc: "\"Send en email\" er ofte et høfligt udskud. Gør ventetiden konkret: hvad koster det at problemet stadig er der, mens du venter på at læse — og svare — og booke et opfølgningsmøde?",
            scripts: [
              "\"Det sender jeg gerne. Men lad mig spørge: hvad koster det jer per uge at [problemet] stadig er der? [Lytter] Godt — for når du har fået emailen, læst den, og vi booker en opfølgning, er der gået mindst 2 uger. Det er [2 × X kr.] i venteomkostning. Er den email det værd?\"",
              "\"Selvfølgelig. Og hvornår forestiller du dig at du vil have tid til at læse den og handle på den? [Lytter] Okay — og hvad koster problemet jer i den periode? Jeg spørger fordi mange gange er 10 minutter nu billigere end 3 ugers ventetid.\"",
              "\"Det giver jeg dig. Og bare for at sætte det i perspektiv: hvad ville det betyde for jer, hvis I løste [problemet] allerede denne uge? Hvad ville I spare eller vinde? [Lytter] Kan vi gøre det nu i stedet?\"",
              "\"Klart — det sender jeg. Og hvad vil du prioritere når du har læst den? Det hjælper mig forstå hvad der er mest relevant at inkludere.\" → [De afslører hvad der stopper dem] → \"Det kan jeg faktisk besvare nu — og så sparer vi begge tid.\"",
              "\"Mange siger emailen er til for at kunne tænke i ro. Men hvad er det du skal tænke igennem? Er det prisen, sikkerheden, interne godkendelser, eller noget andet?\" → Find den reelle barriere → \"Det løser vi ikke med en email — det løser vi med en samtale. Kan vi tage den nu?\"",
            ],
          },
        ],
        scripts: [],
      },
      {
        type: "Jeg har haft dårlige oplevelser",
        emoji: "😤",
        strategies: [
          {
            title: "Empati + reframe med analogi",
            emoji: "🔄",
            desc: "Validér smerten fuldt ud — og brug en stærk analogi til at vise at dårlige oplevelser ikke er en grund til at undgå kloge beslutninger.",
            scripts: [
              "\"Okay, giver mening. Må jeg dele en holdning? [Ja] — Lad os sige du kører bil og der sker en ulykke. Ville du aldrig træde ind i en bil igen? [Jo] — Præcis. Du ville lære af det og sikre at det ikke sker igen. Hvad skete der dengang — hvad gik galt?\"",
              "\"Jeg forstår det godt — og det giver fuldstændig mening at du er på vagt. Hvad er det du er mest bekymret for gentager sig?\" → Lad dem specificere. Det er det du skal løse.",
              "\"Det lyder som om [oplevelse] var virkelig frustrerende. Hvad var det præcis der gik galt? Det hjælper mig forstå hvad vi skal sikre er anderledes denne gang.\"",
              "\"Hvad vil du sige var den primære årsag til at det gik galt — var det leverandøren, implementeringen, eller noget internt?\" → Du starter med at forstå, ikke forsvare.",
              "\"Hvad synes du er vigtigst: at lade den oplevelse stoppe dig fra at træffe fornuftige beslutninger fremover, eller at lære hvad der gik galt og sikre at det kun sker én gang?\"",
            ],
          },
          {
            title: "Hvad er anderledes denne gang?",
            emoji: "🆕",
            desc: "Hjælp dem se konkret hvad der er anderledes nu — og lad dem selv konkludere at det giver mening at prøve igen.",
            scripts: [
              "\"Hvad tror du var årsagen til at det gik galt sidst? [Lytter] Det giver god mening. Hvad nu hvis jeg viste dig præcis hvordan vi håndterer netop det anderledes — ville det ændre noget?\"",
              "\"De tre ting der gik galt for dig sidst — lad os gennemgå dem én for én og jeg viser dig præcis hvad vi gør anderledes.\"",
              "\"Vil du have at jeg laver en direkte sammenligning: 'Hvad gik galt dengang' vs. 'Hvad er vores tilgang nu'? Det er den mest ærlige ting jeg kan gøre for dig.\"",
              "\"Kan du sætte mig i kontakt med 2-3 af dine kolleger i branchen der har haft lignende oplevelser? Lad dem fortælle dig hvad de synes om vores tilgang.\"",
              "\"Hvad ville en 30-dages pilot betyde for dig — ville det give dig nok tillid til at evaluere os på egne præmisser?\"",
            ],
          },
          {
            title: "Feel-Felt-Found — fra skepsis til tillid via andres rejse",
            emoji: "🤝",
            desc: "Normalisér skepsissen fuldt ud — og brug social proof fra kunder med samme baggrund til at vise at tillid er genopbyggeligt, når man ved hvad man leder efter.",
            scripts: [
              "\"Det forstår jeg virkelig godt — og jeg vil ikke sige at din skepsis ikke er berettiget. Mange af vores bedste kunder kom til os med præcis samme bagage. Det de fandt ud af var at en transparent onboarding + et konkret pilotforløb tog skepsissen ud af ligningen. Hvad ville det kræve for at du kunne evaluere os fair?\"",
              "\"Mange siger præcis det — og de har ret i at være forsigtige. Dem der alligevel valgte at prøve igen, fandt ud af at den dårlige oplevelse faktisk var en gave: de vidste præcis hvad de skulle kigge efter, og hvad de ikke ville finde hos os. Hvad var det der gik mest galt sidst?\"",
              "\"Jeg forstår du har været brændt. Andre har følt præcis det samme. Det de fandt ud af var at den bedste måde at beskytte sig selv på, er ikke at undgå beslutningen — men at vide nøjagtigt hvad man vil have dokumenteret, garanteret og målt. Hvad ville du kræve for at føle dig tryg?\"",
              "\"Det giver fuldstændig mening. Skepsis er fornuft — ikke svaghed. Andre i din situation fandt ud af at transparens i processen var nøglen: vi viser dig alt hvad du vil se, inden du beslutter noget. Hvad vil du gerne have fuld indsigt i?\"",
              "\"De kunder der har haft dårlige oplevelser og prøvede igen, er faktisk vores mest loyale. Fordi de vidste hvad de kiggede efter. Vil du have at vi gennemgår præcis hvad vi gør anderledes — punkt for punkt — mod det du oplevede sidst?\"",
            ],
          },
          {
            title: "Labeling — navngiv skaden og giv den plads",
            emoji: "🏷️",
            desc: "FBI-teknik: navngiv følelsen eksplicit og lad den udfolde sig. Skaden fra en dårlig oplevelse sidder stadig — giv den luft, og du bevæger dig fra forsvar til åbenhed.",
            scripts: [
              "\"Det lyder som om den oplevelse stadig sidder i dig — og det giver god mening.\" [Pause] → De vil naturligt uddybe. Lad dem. Spørg ikke endnu — lyt fuldt ud. Når de er færdige: \"Hvad var det der gik mest galt?\"",
              "\"Det lyder som om du mistede noget ud over pengene — tillid, tid, måske lidt tro på at det overhovedet kan virke.\" [Pause] → De nikker eller uddyber. Nu er du i samtalen som en allieret — ikke en sælger.",
              "\"Det lyder som om du er forsigtig — og det er en fornuftig reaktion.\" [Validér] → \"Hvad er den ene ting der ville gøre dig tryg nok til at evaluere noget nyt? Bare én ting.\"",
              "\"Det lyder som om det ikke bare var et dårligt produkt — det var en dårlig oplevelse som helhed. Kan du fortælle mig mere om hvad der gik galt? Jeg spørger fordi jeg vil forstå, ikke fordi jeg vil forsvare os.\"",
              "\"Det lyder som om du er træt af at høre salgstalker fra folk der ikke forstår din situation.\" [Pause] → \"Det respekterer jeg. Hvad ville du have at vi gør anderledes — fra første minut — for at du ville tage det her seriøst?\"",
            ],
          },
          {
            title: "Cost of Inaction — hvad koster vedvarende skepsis?",
            emoji: "💰",
            desc: "Den dårlige oplevelse var dyr. Men permanent skepsis og stilstand kan koste endnu mere. Hjælp dem se prisen for aldrig at prøve igen — uden at bagatellisere hvad der skete.",
            scripts: [
              "\"Det er fuldstændig forståeligt — og den oplevelse var reel. Men lad mig stille et ærligt spørgsmål: hvad koster det jer, at [problemet] stadig eksisterer i dag? Ikke fordi du skal købe noget af mig — men fordi stilstand har en pris, ligesom dårlige oplevelser har det.\"",
              "\"Hvad har I gjort i stedet siden den gang? [Lytter] Og løste det problemet? [Lytter] Hvad koster det jer per måned at problemet stadig er der?\" → Du synliggør at ingen beslutning er den dyreste beslutning af alle.",
              "\"Jeg forstår din forsigtighed — og den er berettiget. Men hvad ville det betyde for jeres forretning, hvis I løste [problemet] inden udgangen af dette kvartal? Hvad ville I vinde? [Lytter] Er den gevinst værd at kigge nærmere på det — selv med din skepsis i baghovedet?\"",
              "\"Hvad er den største konsekvens af at problemet stadig eksisterer om 12 måneder? Ikke for mig — for jer. [Lytter] Er den konsekvens okay?\" → De konfronterer hvad stilstand reelt koster dem.",
              "\"Jeg vil ikke bede dig om at stole på os nu. Men jeg vil bede dig om at svare ærligt: hvad er prisen for at vente, sammenlignet med prisen for at finde ud af om vi faktisk er anderledes? Vi kan starte med noget lille — ingen risiko, fuld indsigt.\"",
            ],
          },
        ],
        scripts: [],
      },
      {
        type: "Det er for kompliceret",
        emoji: "⚡",
        strategies: [
          {
            title: "Labeling — navngiv kompleksitetsfrygten og tag luften ud",
            emoji: "🏷️",
            desc: "\"Det er for kompliceret\" er sjældent om faktisk kompleksitet — det handler om frygt for forandring og usikkerhed. Navngiv det, lad det udfolde sig, og find hvad 'kompliceret' konkret betyder for dem.",
            scripts: [
              "\"Det lyder som om du er bekymret for at det kræver mere end I har tid og ressourcer til.\" [Pause] → De uddyber hvad der virker uoverkommeligt. Nu ved du hvad du skal løse.",
              "\"Det lyder som om du har set produkter der lovede meget og leverede noget der krævede et helt IT-team.\" [Pause] → \"Hvad har du set som det mest komplicerede ved den her type løsning?\"",
              "\"Det lyder som om 'kompliceret' betyder noget specifikt for jer — er det implementeringen, integrationen, oplæringen af medarbejdere eller noget andet?\" → Du bryder kompleksiteten op i konkrete dele der kan løses én for én.",
              "\"Det lyder som om du har prøvet noget lignende og er kommet til at eje et problem der aldrig rigtig virkede.\" [Pause] → \"Hvad er den ting du frygter mest ved 'kompliceret'?\" → Find den præcise frygt.",
              "\"Hvad gør det kompliceret? Lad os tage det punkt for punkt — for de fleste ting der virker komplicerede udefra, er faktisk løselige når man kigger nærmere.\" → Du tager frygten ud ved at konkretisere.",
            ],
          },
          {
            title: "Feel-Felt-Found — kompliceret er en illusion vi afmonterer",
            emoji: "🤝",
            desc: "Mange kunder følte præcis det samme — og fandt ud af at det var mere enkelt end forventet, når de gik i gang. Social proof fra dem der 'frygtede kompleksitet' og fandt det modsatte.",
            scripts: [
              "\"Det forstår jeg godt — og det er en meget normal tanke. Mange af vores kunder sagde præcis det samme inden start. Det de fandt ud af var at vi håndterer den tekniske del for dem, og de var i gang inden for [X dage/timer]. Hvad er det konkret du frygter er kompliceret?\"",
              "\"Mange siger præcis det — og de har ret i at spørge. Dem der kom i gang, fandt ud af at det tog [X tid] fra beslutning til brug — og at hele IT-integrationen var vores ansvar, ikke jeres. Hvad ville gøre det enkelt nok for dig?\"",
              "\"Jeg forstår du er bekymret for kompleksiteten. Andre har følt det samme. Det de fandt ud af var at 90% af det de frygtede, aldrig materialiserede sig — og det resterende 10% løste vi sammen. Hvad er din vigtigste frygt?\"",
              "\"Du er ikke den første der siger det. Og de fleste der alligevel prøvede, fortryder ikke — de spørger bare 'hvorfor troede vi det var kompliceret?'. Vil du have at vi gennemgår de konkrete trin for implementering? Det er typisk 3 steps.\"",
              "\"Hvad er den del der virker mest kompliceret for jer? Lad os tage det isoleret. Fordi det er min erfaring at de dele der virker sværest i teorien, er dem vi har mest erfaring med at gøre nemme i praksis.\"",
            ],
          },
          {
            title: "Daniel G — forenkl og sæt det i perspektiv",
            emoji: "🦁",
            desc: "Sælg fra styrke. Afvis ikke indvendingen — men udfordr antagelsen om at kompleksitet er et absolut faktum. Stil det skarpe spørgsmål der reframer hvad 'kompliceret' betyder.",
            scripts: [
              "\"Hvad er det konkret der virker kompliceret? Lad os tage det nu — for min erfaring er at de ting der virker komplicerede i starten, er dem vi er eksperter i at simplificere. Hvad er det første punkt?\"",
              "\"Hør — det er muligvis ikke det rigtige for jer, hvis kompleksiteten er for stor. Det er okay. Men lad mig stille dig et ærligt spørgsmål: hvad ville det kræve at gøre det enkelt nok? Hvad er det ENE du vil have simplificeret?\"",
              "\"Kompliceret for hvem? For jer? For jeres IT-afdeling? For jeres medarbejdere?\" → Find hvem der konkret oplever kompleksiteten → \"Hvad nu hvis vi håndterer [den del] for jer — ville det fjerne blokeringen?\"",
              "\"Okay — og hvad ville der ske, hvis [problemet det løser] blev 20% bedre næste måned? Ville det være kompliceret nok til at sige nej til?\" → Du sætter kompleksitet op mod gevinst.",
              "\"Lad os bruge 10 minutter på at gennemgå implementeringsplanen. Jeg viser dig hvad I faktisk skal gøre — ikke hvad I kan frygte. Og så beslutter du om det er kompliceret.\" → Du giver fakta frem for at argumentere mod en frygt.",
            ],
          },
          {
            title: "LAER — hvad er det konkret der virker kompliceret?",
            emoji: "🔍",
            desc: "LAER: Lyt til kompleksitetsklagen → Anerkend at kompleksitet er et reelt problem → Udforsk hvad der præcist gør det svært → Responder på det konkrete punkt.",
            scripts: [
              "L+A: \"Det giver mening at du siger det — og jeg respekterer det.\" → U: \"Hvad er det der konkret virker kompliceret? Er det implementeringen, integrationen, brugervenlighed eller noget ved jeres interne processer?\" → R: Adressér det specifikke punkt med konkret svar.",
              "A: \"Selvfølgelig — kompleksitet er et reelt problem, og det skal vi tage seriøst.\" → U: \"Hvad er den del der er vigtigst for jer at ikke er kompliceret?\" → R: \"Det er præcis det vi har designet mod. Lad mig vise dig.\"",
              "U: \"Hvad betyder 'kompliceret' for dig i denne kontekst? Er det tid, teknisk viden, antal involverede parter eller noget andet?\" → Du bryder antagelsen op i konkrete kategorier og løser dem systematisk.",
              "\"Jeg hørte 'kompliceret'. Hvad er det første skridt i implementeringen hos jer der ville give modstand?\" → Find det konkrete punkt → \"Godt — det er det vi håndterer for jer. Hvad er næste punkt?\"",
              "R: \"Kan vi gøre det til en test? I de næste 20 minutter gennemgår vi hele opsætningsprocessen live. Hvis det stadig virker kompliceret bagefter, er det fair nok. Er du med?\" → Du viser frem for at forklare.",
            ],
          },
          {
            title: "Future pacing — en uge inde er kompleksiteten glemt",
            emoji: "🔮",
            desc: "Projicér dem fremad til et tidspunkt, hvor kompleksiteten er overstået og gevinsten er synlig. De fleste beslutninger virker sværere inden man starter end bagefter.",
            scripts: [
              "\"Forestil dig at I har haft det her kørende i 3 uger. Onboardingen er overstået, jeres team bruger det naturligt, og [problemet] er løst. Hvad ville det betyde for jer? [Pause] Er det scenarie kompleksiteten værd?\"",
              "\"De fleste af vores kunder siger at de første 48 timer var de hårdeste — og at det bagefter var intuitivt. Forestil dig at du er på dag 7. Hvad er det du gerne vil have op at køre, som du ikke kan i dag?\"",
              "\"Hvad ville du sige til dig selv om 6 måneder, hvis du ikke starter nu fordi det virkede kompliceret? Hvad koster den beslutning jer?\" → De ser konsekvensen af at lade kompleksitetsfrygt styre.",
              "\"Forestil dig at din konkurrent starter i næste uge og er i gang om en måned. Du venter på 'enklere'. Hvad sker der med jeres position i mellemtiden?\" → Du skaber urgency uden at presse.",
              "\"Hvad ville det betyde for dig personligt — ikke for virksomheden, men for din dag — hvis [problemet] var løst? Ville kompleksiteten i etableringsfasen have været det værd?\" → De projicerer frem og svarer sig selv.",
            ],
          },
        ],
        scripts: [],
      },
      {
        type: "Vi har ikke budget lige nu",
        emoji: "💼",
        strategies: [
          {
            title: "Belfort Loop — er det budget eller prioritet?",
            emoji: "🔄",
            desc: "\"Intet budget\" er sjældent et faktuelt loft — det er en prioriteringsbeslutning. Første loop: validér og udforsk. Andet loop: bind det til ROI og prioritet. Mål: afdæk om det er et ressourceproblem eller et certainty-problem.",
            scripts: [
              "\"Det forstår jeg — og budget er et reelt hensyn.\" [Afled] → \"Men lad mig spørge: hvis løsningen betalte sig selv 3× inden for et år, ville det så stadig være et spørgsmål om budget — eller om prioritet?\" [Certainty-probe] → Find om det er penge eller beslutningslyst der mangler.",
              "\"Selvfølgelig — timing og budget hænger sammen.\" [Validér] → \"Hvad er budgetcyklussen hos jer? Hvornår genåbner muligheden for at kigge på det her?\" → Du laver en opfølgningsplan i stedet for et nej.",
              "Loop 2: \"Hvad nu hvis jeg viste dig at [løsningen] betaler sig selv på [X måneder]? Ville det ændre budgetsamtalen internt hos jer?\" → Du giver dem argumentet til den interne godkendelse.",
              "\"Hvad er den investering I har lavet det seneste år der gav mest afkast? [Lytter] Hvad ville det betyde, hvis denne løsning gav et lignende afkast?\" → Du reframer budget fra cost til investering.",
              "\"Budget er altid relativt til prioritet. Hvad er jeres vigtigste prioritet dette kvartal? [Lytter] Og hvad koster det jer, at [problemet] ikke er løst inden da?\" → De ser selv at prioriteten burde matche budgettet.",
            ],
          },
          {
            title: "Cost of Inaction — hvad koster 'intet budget' i virkeligheden?",
            emoji: "💰",
            desc: "Fraværet af budget er ikke gratis. Gør venteomkostningen synlig og konkret: hvad koster det per måned at problemet stadig er der, mens budgettet 'ikke er der'?",
            scripts: [
              "\"Det er fair — og jeg respekterer det. Men lad os lave regnestykket: hvad koster [problemet] jer per måned? [Lytter] Godt. Og hvornår er budget klar? [Lytter] Det er [X × måneder] kr. I betaler for at vente. Er den investering i 'intet budget' fornuftig?\"",
              "\"Hvad koster det jer at problemet stadig eksisterer om 6 måneder? Ikke hvad løsningen koster — hvad koster ingen løsning?\" → De ser venteomkostningen frem for investeringen.",
              "\"Lad mig spørge anderledes: hvad ville I bruge pengene på i stedet? Og giver det mere afkast end at løse [problemet] nu?\" → Du stiller dem over for et valg frem for et loft.",
              "\"Hvad ville jeres regnskab se ud, hvis [problemet] var løst fra 1. januar? Hvad er den forskel i kroner?\" → De beregner selv ROI og ser om 'intet budget' stadig giver mening.",
              "\"Mange virksomheder siger 'intet budget' — og mener 'vi har ikke godkendt budget til det her'. Det er to vidt forskellige ting. Hvad er det hos jer?\" → Du finder om det er procesblokering eller faktisk ressourcemangel.",
            ],
          },
          {
            title: "Feel-Felt-Found — fra 'intet budget' til ROI-samtale",
            emoji: "🤝",
            desc: "Normalisér budgetindvendingen og brug social proof fra kunder der var i præcis samme situation — og fandt at samtalen om ROI ændrede budgetbeslutningen internt.",
            scripts: [
              "\"Det forstår jeg godt — og det er en reel bekymring. Mange af de virksomheder vi arbejder med i dag, sagde præcis det samme i starten. Det de fandt ud af var at ROI-samtalen ændrede budgetdiskussionen internt. Hvad ville et positivt ROI-estimat betyde for jer?\"",
              "\"Mange siger præcis det. Dem der alligevel valgte at kigge på tallene, fandt ud af at 'intet budget' faktisk var 'ingen ROI-beregning endnu'. Vil du have at vi laver den beregning nu — 10 minutter — så du kan tage den med intern?\"",
              "\"Jeg forstår at budget er en reel barriere. Andre har følt præcis det samme. Det de fandt ud af var at de fleste budgetafgørelser kan tilsidesættes, hvis ROI er klar nok. Hvad skal ROI-casen vise for at det er en intern godkendelse værd?\"",
              "\"Du er ikke den første der siger det — og de fleste der sagde det, fandt en vej. Enten via anden budgetpost, pilotmodel eller trinvis implementering. Hvad ville passe bedst i jeres situation?\"",
              "\"Hvad ville din chef sige, hvis du kom og sagde 'jeg har fundet en løsning der giver [X] afkast på [Y måneder], og den passer inden for vores øvrige budget'? Ville det ændre samtalen?\" → De tager selv stilling til intern godkendelse.",
            ],
          },
          {
            title: "Daniel G — skab urgency via konsekvens, ikke pres",
            emoji: "🦁",
            desc: "Sælg fra styrke. Giv dem nødudgangen — og stil det skarpe spørgsmål der konfronterer hvad 'intet budget nu' faktisk koster dem.",
            scripts: [
              "\"Hør — hvis budget er en reel barriere, så er det okay. Det er muligvis ikke det rigtige tidspunkt. Men lad mig stille dig et ærligt spørgsmål: hvad sker der for din forretning, hvis [problemet] stadig eksisterer om 12 måneder? Er det en konsekvens du er okay med?\"",
              "\"Det er en fair pointe — og jeg presser aldrig nogen. Men én ting: hvad vil der ske med jeres konkurrenter i den periode, mens I venter på budget? Hvad er konsekvensen af at stå stille?\"",
              "\"Okay, intet budget nu. Hvornår er der budget?\" [Direkte] → [De svarer] → \"Hvad sker der fra nu til da — for problemet forsvinder ikke, fordi budgettet ikke er der endnu. Hvad koster de [X måneder]?\"",
              "\"Hvad er den vigtigste investering I laver i år? [Lytter] Og hvad er den forventede ROI på den? [Lytter] Vil du lave den samme beregning på dette — og se hvad tallene siger?\" → Du stiller dem over for et valg baseret på fakta.",
              "\"Klart. Og hvad ville der skulle til for at det her kom ind i budgettet — enten som en prioritetsomfordeling eller som et pilotforløb der beviser sig selv? Hvad er den rigtige indgang?\" → Du hjælper dem finde vejen frem i stedet for at acceptere et endeligt nej.",
            ],
          },
          {
            title: "LAER — udforsk hvad 'intet budget' egentlig dækker over",
            emoji: "🔍",
            desc: "LAER: Lyt til budgetindvendingen → Anerkend den som reel → Udforsk hvad der konkret blokerer → Responder på det faktiske problem, ikke antagelsen om budget.",
            scripts: [
              "L+A: \"Selvfølgelig — det er et reelt hensyn.\" → U: \"Hvad er det konkret der gør at budgettet ikke er der? Er det et loft, en intern godkendelsesproces, en budgetcyklus eller noget andet?\" → R: Adressér den konkrete bloker med en specifik løsning.",
              "A: \"Det respekterer jeg fuldt ud.\" → U: \"Hvad ville der skulle ske, for at det her kunne finansieres? Er det en anden budgetpost, en pilotmodel, en ROI-beregning til intern godkendelse, eller en aftale vi splitter over to kvartaler?\" → Find den rette vej frem.",
              "U: \"Hvad betyder 'intet budget' hos jer — er det 'budgettet er brugt', 'ikke godkendt endnu' eller 'vi prioriterer det ikke'?\" → De tre scenarier har tre forskellige løsninger.",
              "\"Hvornår har I næste budgetgennemgang? [Lytter] Godt — hvad skal der ligge klar, så det kan prioriteres der? Hvem er det der godkender?\" → Du laver en konkret handlingsplan til næste beslutningsvindue.",
              "R: \"Hvad ville en pilotmodel med begrænset initial investering betyde for jer? Ville det gøre det muligt at starte nu og vise resultater inden næste budget-review?\" → Du sænker tærsklen og fjerner den reelle barriere.",
            ],
          },
        ],
        scripts: [],
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
        heading: "Smil og vær nærværende — det sætter tonen",
        body: "Et ægte smil smitter. Det sænker temperaturen, åbner samtalen og gør dig øjeblikkeligt mere sympatisk. Start hvert møde med at vise du er til stede som menneske — inden du nævner produktet.",
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
        emoji: "😂",
        heading: "Opfør dig som en ven — grin og joke lidt",
        body: "Sælgere er stive. Venner er afslappede. Jo mere du opfører dig som en ven der giver et ærligt råd, desto mere sænker kunden paraderne. Humor er ikke uprofessionelt — det er menneskelig kontakt. Et lille glimt i øjet slår enhver planlagt sætning.",
        examples: [
          "Kunden siger: \"Det lyder næsten for godt til at være sandt.\" Du: \"Ja, det siger min chef også om mine budgetter.\" [smil] → Spændingen er væk, I griner begge — og samtalen kører videre.",
          "Du lavede en fejl i præsentationen? Grin af det: \"Okay, den slide var åbenbart ikke min bedste dag.\" Selvbevidst humor viser selvtillid og gør dig menneskelig.",
        ],
      },
      {
        emoji: "💬",
        heading: "Spørg ind til interesser — folk elsker at snakke om sig selv",
        body: "Folk åbner sig når de taler om det der betyder noget for dem. Spørg ind til interesser, hobbyer, hvad de er stolte af. Det er ikke smalltalk — det er relationsopbygning.",
        examples: [
          "Du ser et billede af en båd på væggen: \"Er du sejler? Hvor sejler du henne?\" → 10 minutter senere er I venner. Produktet kan vente.",
          "\"Hvad laver du uden for arbejdet?\" — og lyt genuint. Husk det til næste gang. Det viser at du ser dem som et menneske, ikke et lead.",
        ],
      },
      {
        emoji: "🤝",
        heading: "Lav en service promise — vis at du er der for dem",
        body: "En service promise er en konkret udtalelse om hvad du vil gøre for kunden — uanset om de handler hos dig eller ej. Det viser at du er der for dem, ikke for provisionen. Det er et af de stærkeste tillidsbyggende værktøjer der findes.",
        examples: [
          "\"Jeg skal nok sørge for at vi finder den bedste løsning til dine behov og gøre alt hvad jeg kan for at det er fornuftigt for dig.\"",
          "\"Og hvis vi ikke finder det rigtige her, skal jeg nok retlede dig til hvor du kan finde det.\" [Det sætter dig som rådgiver, ikke sælger — og bygger massiv tillid.]",
        ],
      },
      {
        emoji: "💪",
        heading: "Vær 100% confident — usikkerhed smitter",
        body: "Alt hvad du siger skal siges med selvtillid. Ikke arrogance — men ro og autoritet. Kunder køber ikke fra folk der virker usikre på det de siger. Tvivl smitter. Selvtillid smitter mere.",
        examples: [
          "Undgå: \"Jeg tror måske at...\" og \"Det er jeg ikke helt sikker på, men...\". Sig i stedet: \"Det her er [X]\" og \"Det du får ud af det er [Y].\" Præcision og ro signalerer ekspertise.",
          "Hvis du ikke kender svaret: \"Det finder jeg ud af til dig inden i morgen\" sagt med ro og selvtillid er langt stærkere end et usikkert gæt.",
        ],
      },
    ],
    model: {
      name: "Toneleje — vær menneskelig, ikke robotagtig",
      items: [
        "Nysgerrig & varm: \"Det lyder interessant — kan du fortælle mig lidt mere?\" [langsom, venlig, fremoverlænet]",
        "Direkte & confident: \"Lad mig være ærlig med dig — det her er hvad jeg ville gøre i din situation.\" [fast, klar, ingen tøven]",
        "Empatisk & forstående: \"Det giver fuldstændig mening at du er usikker — det er en stor beslutning.\" [blød, rolig, validerende]",
        "Let & humoristisk: \"Ja, det er en god pointe — og min chef ville sige det samme.\" [smil i stemmen, afspændt]",
        "Autoritet & ekspert: \"I jeres branche ser vi typisk at... \" [rolig ekspert, ikke sælger, taler som en der ved det]",
      ],
    },
  },
  {
    id: "kundebehov",
    emoji: "🎯",
    title: "Behovsafdækning",
    tagline: "Stil de rigtige spørgsmål — kunden fortæller dig hvad de vil have",
    color: "#38bdf8",
    desc: "God behovsafdækning handler ikke om at stille mange spørgsmål — det handler om at stille de RIGTIGE spørgsmål og lytte præcist. HV-spørgsmål åbner samtalen. Del-accepter holder dig på linje med kunden undervejs. En god opsummering viser at du forstår og positionerer dig som eksperten.",
    principles: [
      {
        emoji: "❓",
        heading: "HV-spørgsmål — åbne spørgsmål der ikke kan besvares med ja/nej",
        body: "HV-spørgsmål (Hvad, Hvem, Hvornår, Hvorfor, Hvordan, Hvilke) tvinger kunden til at fortælle og uddybe. De er grundstenen i behovsafdækning — brug dem til at kortlægge problem, situation og ønsket fremtid. Stil ét spørgsmål ad gangen og lyt fuldt ud.",
        examples: [
          "\"Hvad er din største udfordring med det her i dag?\" → Kunden kortlægger selv problemet med egne ord.",
          "\"Hvad har du prøvet hidtil for at løse det?\" → Du forstår hvad de allerede ved ikke virker — og hvad der er anderledes ved din løsning.",
          "\"Hvornår vil du gerne have det løst?\" → Tidslinje og urgency uden at du behøver at skabe den kunstigt.",
          "\"Hvad er konsekvensen, hvis det ikke er løst om 6 måneder?\" → Cost of inaction — kunden sætter selv tallene på smerten.",
          "\"Hvem er påvirket af det her, og hvad betyder det for dem?\" → Kortlæg stakeholdere og den menneskelige konsekvens.",
        ],
      },
      {
        emoji: "✋",
        heading: "Del-accepter — mini-bekræftelser undervejs",
        body: "Del-accepter er korte bekræftelsesspørgsmål du stiller løbende i samtalen — ikke bare til sidst. De sikrer at du og kunden er på samme linje hele vejen, og de vænner kunden til at sige ja i det små. Et mini-ja gør det næste ja nemmere.",
        examples: [
          "\"Giver det mening indtil videre?\" — efter du har opsummeret en pointe.",
          "\"Forstår jeg det rigtigt at [X] er det vigtigste for dig?\" — bekræfter din forståelse og viser du lytter.",
          "\"Er det vigtigt for dig at løsningen gør [Y]?\" — verificerer prioriteter undervejs.",
          "\"Er vi enige om at det er det her der er kerneproblemet?\" — alignment før du præsenterer løsning.",
          "\"Det lyder som om [X] er frustrerende — er det korrekt?\" — labeling + del-accept kombineret.",
        ],
      },
      {
        emoji: "📝",
        heading: "Opsummering — vis at du forstår bedre end de selv gør",
        body: "Afslut behovsafdækningen med en præcis opsummering i kundens egne ord. Når du kan sætte ord på deres problem mere præcist end de selv kan — stoler de automatisk på at du er eksperten. Det er det stærkeste signal om kompetence der findes.",
        examples: [
          "\"Lad mig se om jeg har forstået det rigtigt: I har [situation], det koster jer [konsekvens], og det vigtigste for dig er [topprioritet] — er det korrekt?\"",
          "\"Så det jeg hører er: [problem], [årsag], [konsekvens] — forstår jeg det rigtigt?\" → Kunden siger 'præcis!' — og nu er du eksperten.",
          "\"Baseret på det du har fortalt mig, lyder det som om [kernebehov] er det der betyder mest. Giver det mening?\" → Kunden bekræfter, og du er klar til at præsentere løsningen.",
        ],
      },
    ],
    model: { name: "Behovsafdækning i 3 trin", items: ["HV-spørgsmål — åbn samtalen med Hvad, Hvem, Hvornår, Hvorfor, Hvordan, Hvilke", "Del-accepter — hold alignment undervejs: 'Giver det mening?' / 'Forstår jeg rigtigt at...?'", "Opsummering — 'Lad mig se om jeg har forstået det rigtigt: [problem] + [konsekvens] + [topprioritet] — er det korrekt?'"] },
    exampleQuestions: [
      { q: "Hvad er din største udfordring med det her i dag?", note: "Åbner samtalen bredt — kunden kortlægger selv problemet med egne ord." },
      { q: "Hvad har du prøvet hidtil for at løse det?", note: "Forstå hvad de allerede ved ikke virker — og hvad der er anderledes ved din løsning." },
      { q: "Hvornår vil du gerne have det løst?", note: "Afdækker tidslinje og urgency naturligt — uden at du behøver skabe den kunstigt." },
      { q: "Hvad er konsekvensen, hvis det ikke er løst om 6 måneder?", note: "Cost of inaction — kunden sætter selv tal på smerten. Det skaber naturlig urgency." },
      { q: "Hvem er påvirket af det her, og hvad betyder det for dem?", note: "Kortlæg stakeholdere og den menneskelige konsekvens — ikke bare den forretningsmæssige." },
      { q: "Lad mig se om jeg har forstået det rigtigt: du har [X], det koster jer [Y], og det vigtigste for dig er [Z] — er det korrekt?", note: "Opsummering — positionerer dig som eksperten og åbner naturligt for løsningspræsentation." },
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
          "Kunden er bange for at skifte CRM-system. Du: \"Hvad er det allerværste?\" → \"Okay — er det allerværste stadig bedre end de problemer I har med jeres nuværende system?\" Næsten altid: ja.",
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
        body: "En reframet close der gør det svært at sige nej. Hvis kunden allerede har bekræftet at løsningen giver mening og kan hjælpe dem — er det så en dum idé at gå videre?",
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
          "\"Føler du ud fra det jeg har vist, at det her kunne give mening for jer?\" [Ja] → \"Okay fedt — hvad er det der specifikt fik dig til at tænke at det her ville kunne hjælpe dig?\" → Nu forklarer de dig præcis hvad de synes skaber værdi.",
          "Efter kundens svar: lyt aktivt, nik og gentag det vigtigste tilbage: \"Så det der resonerede mest med dig var [X] — forstår jeg rigtigt?\" → De bekræfter, og du har nu deres eget argument for at købe.",
        ],
      },
      {
        emoji: "📅",
        heading: "Antagende closing — antag at beslutningen er taget",
        body: "Brug den når købssignalerne er stærke. Du antager trygt at salget er aftalt og diskuterer næste skridt — som om beslutningen allerede er taget. Det er ikke manipulation; det er at hjælpe kunden over den sidste mentale barriere.",
        examples: [
          "\"Godt, så kan vi starte installationen mandag — eller ville onsdag passe bedre?\"",
          "\"Hvem på dit team skal vi involvere i onboarding-processen?\" → Du er allerede i gang med implementeringen i samtalen. Kunden følger naturligt med.",
        ],
      },
      {
        emoji: "🔀",
        heading: "Alternativ-closing — giv valget mellem to ja'er",
        body: "Tilbyd to muligheder der begge fører til et salg. Valget mellem to positive muligheder eliminerer ja/nej-binæret — kunden fokuserer på hvilken version, ikke om.",
        examples: [
          "\"Foretrækker du den kvartalsvise eller den årlige plan?\"",
          "\"Vil du starte med den fulde pakke, eller vil du begynde med basis og bygge op?\" → Begge svar er et ja. Kunden vælger — og køber.",
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
    ],
    model: { name: "Closing-trappen", items: ["Skab forståelse — giver det mening?", "Bekræft værdi — kan det hjælpe dig?", "Afdæk tvivl — er der noget der holder dig igen?", "Bed om beslutningen — naturligt og uden pres"] },
    closeMethods: [
      {
        id: "mmm",
        emoji: "💰",
        title: "MMM — Gør store priser små",
        tagline: "Bryd prisen ned til mindste enhed — sæt den op mod konkret værdi",
        desc: "MMM (Make Monthly Manageable) handler om at gøre en stor pris lille ved at dele den op i den mindste meningsfulde enhed — og altid sætte den op mod den konkrete månedlige eller daglige cost of inaction. Kunden sammenligner 33 kr./dag med det de mister — ikke 12.000 kr./år mod intet.",
        scripts: [
          "\"Computeren koster 2.000 kr. mere — men bruges i 5 år. Det er 33 kr. ekstra per måned for dobbelt så god oplevelse. Synes du 33 kr./md. er en dårlig idé?\"",
          "\"Vores løsning koster 18.000 kr./år — det er 1.500 kr./md., altså 50 kr. om dagen. I mister i dag 8 timer/uge manuelt à 400 kr. Det er 12.800 kr./md. Vil du bruge 50 kr./dag for at spare 427 kr./dag?\"",
          "\"Hvad er en arbejdstime værd hos jer? [Svar] — Godt. Problemet koster jer X timer/uge. Det er [Y kr./uge × 52] om året. Vores løsning er [Z kr.] — det er [Z/12] kr./md. Vi taler om en return på [Y × 52 / Z] × fra dag ét. Hvornår giver det ikke mening?\"",
          "\"Det er [X kr.] pr. måned. Det er [X / 30] kr./dag. Hvad er det du fik til din seneste frokost ude? [Svar] — Præcis. For det beløb eliminerer vi [problem]. Er det en god handel?\"",
          "\"Lad os gøre det helt konkret: [X kr./år] for det her problem der koster dig [Y kr./år]. Opdelt per dag er investeringen [X/365] kr. — og gevinsten [Y/365] kr. Du vinder [Y-X] kr. dagligt. Hvornår stopper den investering med at give mening?\"",
        ],
      },
      {
        id: "a-eller-b",
        emoji: "⚖️",
        title: "A eller B — hvilken læner du dig imod?",
        tagline: "To konkrete muligheder — begge er et ja",
        desc: "Alternativ-closing i sin reneste form. Du tilbyder to konkrete muligheder der begge fører til et salg, og spørger hvilken de hælder mest til. Kunden fokuserer på valget mellem A og B — ikke på om de vil købe. Det eliminerer ja/nej-binæret og aktiverer beslutningstagen.",
        scripts: [
          "\"Hvilken af de to løsninger hælder du mest til — den med [A-fordele] eller den med [B-fordele]?\" → Kunden vælger. Begge svar er et ja.",
          "\"Vi har to pakker der passer til jeres situation: [Pakke A] til [pris A] og [Pakke B] til [pris B]. Hvilken af dem læner du dig mest imod?\" → Du er allerede i gang med at levere — valget er bare hvilken version.",
          "\"Vil du starte med basisversionen og skalere op, eller vil du gå direkte med den fulde pakke?\" → Begge svar bekræfter en start. Kunden vælger tempo, ikke om.",
          "\"Vi kan gøre det på to måder: vi starter om [2 uger] og får det implementeret inden [dato], eller vi venter til [ny dato] og starter derefter. Hvad passer bedst til jer?\" → Valget er 'hvornår', ikke 'om'.",
          "\"Foretrækker du at betale kvartalsvis eller gå med den årlige plan — der er en besparelse på 15%?\" → Kunden sammenligner de to muligheder, og du er allerede i lukkefasen.",
        ],
      },
      {
        id: "det-daekker-dine-behov",
        emoji: "✔️",
        title: "Det dækker dine behov — er det korrekt forstået?",
        tagline: "Opsummer, bekræft og luk med kundens egne ord",
        desc: "Du opsummerer præcist hvad kunden har sagt de har brug for — og bekræfter at løsningen dækker det. Kunden har nu bekræftet at løsningen passer til behovet. Det eneste logiske næste skridt er at gå videre. Afslut med 'Ville det være en dum idé?' som det naturlige knæk.",
        scripts: [
          "\"Du sagde at det vigtigste for dig var [X], [Y] og [Z]. Vi har gennemgået at vores løsning dækker [X] ved [hvad], [Y] ved [hvad] og [Z] ved [hvad]. Har jeg forstået det rigtigt?\" [Ja] → \"Ville det så være en dum idé at gå videre?\"",
          "\"Lad mig opsummere: du har [problem], det koster jer [konsekvens], og det vigtigste for dig er at [topprioritet]. Vi løser præcis det her. Passer det med din forståelse?\" [Ja] → \"Jamen — hvad stopper os så?\"",
          "\"Du nævnte selv at [kundens egne ord om problem]. Og det her løser netop det. Det virker fornuftigt — er det korrekt forstået?\" [Ja] → \"Okay, lad os komme i gang.\" [Antag salget]",
          "\"Hvis du skulle sætte ord på de tre ting der er vigtigst for dig i den her beslutning — hvad ville de tre ting være?\" [Svar] → \"Fedt. De tre ting er præcis det vi leverer. Er vi enige om det?\" [Ja] → \"Ville det så være en dum idé at sige ja?\"",
          "\"Det her dækker alt det du sagde var vigtigt. Jeg vil ikke presse dig — men stille dig det ærlige spørgsmål: givet hvad du ved nu, ville det være en dum idé at gå videre?\" [Lad dem svare — stilheden er din ven]",
        ],
      },
      {
        id: "foeler-du-det-er-rette",
        emoji: "❤️",
        title: "Føler du at det her er det rette for dig?",
        tagline: "Den empatiske close — giv dem rum og spørg direkte",
        desc: "En blød, menneskelig close der virker fordi den respekterer kunden og giver dem rum. Du spørger direkte om de følelsesmæssigt er på board — og hvis de er det, kan du spørge hvad der ellers holder dem igen. Stilheden efter spørgsmålet er afgørende — lad dem svare.",
        scripts: [
          "\"Ud fra alt hvad vi har snakket om — føler du at det her er det rette for dig?\" [Pause — lad dem svare fuldt ud] → Hvis ja: \"Hvad er det der giver dig den følelse?\" → De sælger nu selv.",
          "\"Og ser du ud fra alt det her — at det her faktisk vil kunne hjælpe dig?\" [Ja] → \"Hvad er det konkret du ser som den største gevinst?\" → Kunden formulerer selv værdien. Det er den stærkeste close der findes.",
          "\"Jeg vil gerne stille dig et direkte spørgsmål — og tag den tid du har brug for: føler du at det her er det rigtige valg for dig og din virksomhed?\" [Pause] → Uanset svaret: lyt og adressér det de siger.",
          "\"Du har nu set alt hvad vi kan tilbyde. Mit eneste spørgsmål er: kan du mærke at det her er noget der ville gøre en forskel for dig?\" [Ja] → \"Hvad er den ene ting der stadig giver dig tøven — er der noget?\" → Find det og løs det.",
          "\"Er der noget der holder dig igen fra at sige ja i dag — noget konkret?\" [Pause — stilhed er powerful] → Kunden nævner den reelle bekymring → Løs den → \"Og givet at vi netop løste det — er du klar nu?\"",
        ],
      },
      {
        id: "tre-ja-sekvens",
        emoji: "💡",
        title: "Giver det mening? → Kan du lide ideen? → Prisen fornuftig? → Videre?",
        tagline: "Byg momentum med 3 mini-ja'er inden den store beslutning",
        desc: "En fire-trins trinvis close der bygger ubrydelig logik. Hvert lille ja er et commitment der gør det næste ja mere naturligt. Når kunden har sagt ja til at det giver mening, at de kan lide ideen og at prisen er fornuftig — er der ingen logisk grund til ikke at gå videre. Sekvensen virker fordi kunden SELV har sat forudsætningerne.",
        scripts: [
          "\"Giver det mening?\" [Ja] → \"Kan du lide ideen?\" [Ja] → \"Synes du prisen er fornuftig?\" [Ja] → \"Jamen — vil det så være en dum idé at gå videre med det her?\"",
          "\"Ud fra alt det vi har set — giver det nogenlunde mening for dig?\" [Ja] → \"Og hvad dine tanker — kan du lide ideen?\" [Ja] → \"Super, det er det vigtigste. Og prisen — er den fornuftig?\" [Ja] → \"Jamen det virker som om alting er på plads. Er det okay at vi går videre?\"",
          "\"Tre hurtige spørgsmål: ét — giver det her mening for jer? [Ja] Godt. To — kan I lide ideen om at [løsning]? [Ja] Fedt. Tre — er prisen noget I kan arbejde med? [Ja] — Perfekt. Så er vi enige om at gå videre?\"",
          "\"Lad mig stille dig de fire spørgsmål: Giver det mening? [Ja] → Kan du lide ideen? [Ja] → Er prisen fornuftig? [Ja] → Skal vi gå videre? [Pause] — du har jo sagt ja til de tre første. Hvad mangler?\"",
          "\"Du sagde det giver mening. Du sagde du kan lide ideen. Du sagde prisen er i orden. Det eneste der er tilbage er beslutningen. Hvad holder dig igen?\" [Stilhed + lyt] → Adressér det der dukker op.",
        ],
      },
      {
        id: "alternativ-closing",
        emoji: "🔀",
        title: "Alternativ-closing",
        tagline: "To veje — begge fører til salget",
        desc: "Den klassiske alternativ-close i fuld form. Du præsenterer aldrig spørgsmålet som 'vil du købe?' men altid som 'hvilken variant passer bedst?'. Kunden bruger mental energi på at vælge mellem mulighed A og B — og begge er et ja. Bruges bedst når kunden allerede er varm og kun mangler det endelige knæk.",
        scripts: [
          "\"Foretrækker du at vi starter onboarding i næste uge, eller vil du vente til over det nye år?\" → Valget er 'hvornår' — begge svar starter samarbejdet.",
          "\"Vil du have den standard pakke, eller vil du have den premium med [ekstra fordele]?\" → Kunden tænker pakke — ikke om.",
          "\"Betaler I typisk kvartalsvis eller er det nemmest med en samlet årsaftale — der er 12% billigere?\" → Finansieringsvalg = bekræftelse af køb.",
          "\"Hvem skal vi involvere i onboardingen — er det dig alene eller skal din kollega [navn] med fra start?\" → Du er allerede i implementeringen. De følger naturligt med.",
          "\"Vi kan sende kontrakten i dag eller i starten af næste uge — hvad passer bedst med jeres kalender?\" → Timing-valget bekræfter at beslutningen er taget.",
        ],
      },
      {
        id: "dum-idee",
        emoji: "🧠",
        title: "Ville det være en dum idé?",
        tagline: "Reframet close der gør det svært at sige nej logisk",
        desc: "En af de mest effektive closes i Belfort-systemet. Spørgsmålet 'ville det være en dum idé?' er næsten umuligt at svare ja til, når kunden netop har bekræftet at løsningen giver mening og kan hjælpe dem. Det vender bevisbyrden om — kunden skal nu argumentere IMOD at handle. Brug det efter du har fået mindst ét ja på at løsningen giver mening.",
        scripts: [
          "\"Givet alt hvad vi har gennemgået — og at du selv sagde det her giver mening og vil kunne hjælpe jer — ville det så være en dum idé at gå videre?\" [Lyt — de fleste siger 'nej, det ville det ikke']",
          "\"Du sagde det løser [problem X]. Du sagde det giver mening. Du sagde prisen er okay. Givet alt det — ville det EGENTLIG være en dum idé at sige ja?\" → Kunden ser selv logikken.",
          "\"Jeg vil stille dig et direkte spørgsmål: du har problem X. Vi løser problem X. Du synes prisen er fair. Ville det da være en dum idé at handle på det her i dag?\" [Stilhed — lad dem svare]",
          "\"Hvad ville din chef/partner sige, hvis du fortalte dem at du løser [problem] for [pris]? Ville de sige det var en dum idé?\" → Social proof + logikken vender mod dem.",
          "\"Lad os se på det fra den modsatte side: hvad er grunden til IKKE at gå videre? [Lyt] — Og er den grund stærkere end alle de grunde du nævnte for at det giver mening?\" → De afvejer selv og konkluderer.",
        ],
      },
      {
        id: "spending-money",
        emoji: "💸",
        title: "Penge-allokerings-lukningen",
        tagline: "Du bruger allerede pengene — spørgsmålet er bare på hvad",
        desc: "Du minder kunden om, at de allerede bruger penge på problemet — i form af spildt tid, tabte ressourcer og mistet omsætning. Du foreslår blot at de omallokerer de samme penge mod en løsning der rent faktisk virker. Det handler ikke om at bruge mere — det handler om at bruge det samme klogere.",
        scripts: [
          "\"Du bruger allerede [X kr./md.] på dette problem — i form af [tabte timer, fejl, mistet omsætning]. Jeg foreslår ikke at du bruger mere. Jeg foreslår at du bruger de samme penge på noget der rent faktisk løser det.\"",
          "\"Hvad koster det jer i dag at problemet stadig eksisterer? [Lyt] — Præcis. De penge bruger I allerede. Vi taler blot om at flytte dem fra at tabe dem til at investere dem.\"",
          "\"Du betaler allerede prisen — bare uden at få noget ud af det. Vores løsning koster [X]. Problemet koster jer [Y/md.]. Det er ikke et spørgsmål om at bruge penge. Det er et spørgsmål om at stoppe med at spilde dem.\"",
          "\"Tænk på det sådan: I dag er [X timer/uge] spildt på [problemet]. Det er [X × timepris] pr. uge. Det er allerede brugt. Hvad nu hvis de timer i stedet producerede [resultat]? Det er hvad vi tilbyder — for [pris].\"",
          "\"Det er ikke en ny udgift. Det er en omallokering. I dag betaler I for problemet. Vi tilbyder jer at betale for løsningen i stedet — og spare resten. Giver det mening?\"",
        ],
      },
      {
        id: "plan-b",
        emoji: "🗺️",
        title: "Plan B-lukningen",
        tagline: "Vi er her fordi plan A ikke virker — hvad er plan B?",
        desc: "Du spørger kunden hvad deres 'Plan B' er, hvis de ikke takker ja i dag. Du påpeger at I har denne samtale fordi deres nuværende plan er ødelagt. Valget står nu mellem at fortsætte med en ødelagt plan eller starte en ny plan der bringer dem tættere på deres mål. Der er sjældent et reelt alternativ — og det ved kunden godt.",
        scripts: [
          "\"Det er selvfølgelig okay at du siger nej i dag. Men lad mig spørge dig: hvad er din plan B? Hvad gør I i stedet?\" [Pause — lad dem svare] → Tavsheden fortæller dig alt.",
          "\"Vi har denne samtale fordi jeres nuværende løsning ikke slår til. Det er plan A. Den virker ikke. Hvad er plan B — hvad er alternativet til at løse det her?\" → De confronter at der ikke er et reelt alternativ.",
          "\"Lad os antage du siger nej i dag og revisiterer om 6 måneder. Hvad er der sket i mellemtiden? Er problemet løst af sig selv — eller er det stadig der, og koster jer det samme?\" → Future projection skaber urgency uden pres.",
          "\"Jeg forstår du ikke er klar i dag. Men hvad er planen for [problemet] imens? Hvad gør I konkret for at løse det?\" [Lytter] → Der er sjældent en god plan. Det er din åbning.",
          "\"Valget er enkelt: fortsæt med den nuværende plan — som I er uenige med — eller start en ny. Hvad bringer jer tættere på det mål I nævnte tidligere?\" → Kunden sætter selv tallene på valget.",
        ],
      },
      {
        id: "cost-of-saying-no",
        emoji: "⏳",
        title: "Prisen for at sige nej-lukningen",
        tagline: "Hvad koster det at sige nej — om et år?",
        desc: "Du synliggør konsekvensen ved at sige nej. Du beder kunden forestille sig at se tilbage om et år og stadig stå med de nøjagtigt samme udfordringer. Du spørger dem direkte om de er komfortable med at udskyde deres mål i endnu et år. De fleste er det ikke — og det er det øjeblik de beslutter sig.",
        scripts: [
          "\"Forestil dig at det er om præcis et år. Du sidder med de samme tal, de samme problemer, det samme team der kæmper med [problem]. Føler du dig tilpas med at vide at du kunne have løst det i dag?\"",
          "\"Hvad koster det dig at sige nej? Ikke nu — men om 12 måneder. [X problem] er stadig der. Det har kostet jer yderligere [Y kr.]. Er den pris lavere end det vi taler om i dag?\"",
          "\"Du kan sagtens sige nej i dag. Men lad mig stille dig det ærlige spørgsmål: er du okay med at dine mål stadig er de samme om et år — fordi du valgte at vente?\" [Pause — lad dem svare]",
          "\"Lad os sige ja koster [X]. Og nej koster [Y/md. × 12 måneder]. Hvad er prisen for at sige nej? [Lyt] — Præcis. Nej er ikke gratis. Det har en pris — den er bare skjult.\"",
          "\"Om et år ser du tilbage på denne samtale. Enten siger du 'det var den bedste beslutning vi tog' — eller 'jeg ønsker at vi havde handlet dengang'. Hvilken af de to samtaler vil du helst have med dig selv?\"",
        ],
      },
      {
        id: "simple-2-step-close",
        emoji: "2️⃣",
        title: "Simple 2 Step Close",
        tagline: "Lad kunden sælge sig selv — luk med et omvendt spørgsmål",
        desc: "To trin. Trin 1: lad kunden sætte ord på hvad de selv er mest kompatible med — de sælger derved produktet til sig selv. Trin 2: opsummér det de sagde og luk med et omvendt spørgsmål ('Er du imod det?'). Det omvendte spørgsmål gør det psykologisk svært at sige nej — kunden skal aktivt modsige sig selv.",
        scripts: [
          "Trin 1: \"Hey [Navn], hvad føler du egentlig, du er mest kompatibel med efter alt det, jeg lige har vist dig — og hvorfor?\" [Lyt fuldt ud — lad dem tale] → Trin 2: \"Det lyder som om du er klar til at komme i gang. Her er de næste skridt til at få [det resultat de nævnte]. Er du imod det?\" [Stilhed — lad dem svare]",
          "Trin 1: \"Ud fra alt det vi har gennemgået — hvad er det du egentlig synes passer bedst til jer, og hvad er det ved det der tiltaler dig mest?\" [De sælger nu til sig selv] → Trin 2: \"Perfekt — det lyder som om du er klar. Her er hvad vi gør nu: [næste skridt]. Er du imod det?\"",
          "Trin 1: \"Jeg vil gerne høre det fra dig: hvad er det ved det her du synes giver mest mening for din situation — og hvorfor?\" [Lyt aktivt, afbryd ikke] → Kunden uddyber og forankrer sig selv i beslutningen → Trin 2: \"Det du selv beskrev — det er præcis det du får. Næste skridt er [X]. Er du imod det?\"",
          "Trin 1: \"Hvad er det konkret du er mest kompatibel med her — er det [A], [B] eller noget andet?\" [De specificerer hvad der tiltaler dem] → Trin 2: \"Godt. Det lyder som om vi er enige om hvad der giver mening for dig. Næste skridt for at komme i gang er [X]. Er der noget der taler imod at vi gør det nu?\"",
          "Trin 1: [Efter demo/præsentation] \"Bare af nysgerrighed — hvad er det du synes passer bedst til jer, og hvad er det der gør det attraktivt?\" [Lytter — de siger det højt og forankrer det i sig selv] → Trin 2: \"Det lyder som om du kan se dig selv med det her. Næste skridt er at [onboarding/aftale/levering]. Er du imod det?\" [Stilhed — lad det lande]",
        ],
      },
    ],
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function SalgTab() {
  const [activeId, setActiveId]               = useState<string>(TOPICS[0].id);
  const [selectedObjIdx, setSelectedObjIdx]   = useState(-1);
  const [selectedCloseIdx, setSelectedCloseIdx] = useState(-1);

  const topic = TOPICS.find(t => t.id === activeId) ?? TOPICS[0];
  const idx   = TOPICS.findIndex(t => t.id === activeId);
  const hasInteractiveDropdown = !!(topic.objections || topic.closeMethods);
  const curDropdownIdx = topic.objections ? selectedObjIdx : selectedCloseIdx;
  const showKnowledge  = !hasInteractiveDropdown || curDropdownIdx === -1;

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
              {TOPICS.length} emner — indvendinger, behovsafdækning, relationer og closing
            </p>
          </div>
        </div>

        {/* Topic tabs */}
        <div
          className="salg-topic-grid"
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${TOPICS.length}, 1fr)`,
            gap: 6,
          }}
        >
          {TOPICS.map(t => (
            <button
              key={t.id}
              onClick={() => { setActiveId(t.id); setSelectedObjIdx(-1); setSelectedCloseIdx(-1); }}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                gap: 5, padding: "12px 6px", borderRadius: 12, cursor: "pointer",
                fontWeight: activeId === t.id ? 700 : 400,
                background: activeId === t.id ? `${t.color}18` : "#f5f4f2",
                border: `2px solid ${activeId === t.id ? t.color : "#d6d3d1"}`,
                color: activeId === t.id ? t.color : "#57534e",
                transition: "all 0.15s",
              }}
            >
              <span style={{ fontSize: 20 }}>{t.emoji}</span>
              <span style={{ fontSize: 12, textAlign: "center", lineHeight: 1.3, fontWeight: "inherit" }}>{t.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 3, borderRadius: 99, background: "#f0ede9", marginBottom: 28, overflow: "hidden" }}>
        <div style={{
          height: "100%", borderRadius: 99, background: topic.color,
          width: `${(1 / TOPICS.length) * 100}%`,
          marginLeft: `${(idx / TOPICS.length) * 100}%`,
          transition: "margin-left 0.2s ease, background 0.2s",
        }} />
      </div>

      {/* ── Topic content ── */}
      <div key={topic.id}>

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

        {/* ── Unified dropdown (top) for topics with objections / close methods ── */}
        {hasInteractiveDropdown && (
          <div style={{ marginBottom: 24 }}>
            <select
              value={curDropdownIdx}
              onChange={e => {
                const v = Number(e.target.value);
                topic.objections ? setSelectedObjIdx(v) : setSelectedCloseIdx(v);
              }}
              style={{
                width: "100%", padding: "12px 16px", borderRadius: 12,
                border: `2px solid ${topic.color}`, background: "#fff",
                color: "#1c1917", fontSize: 15, fontWeight: 600,
                cursor: "pointer", outline: "none", fontFamily: "inherit", appearance: "auto",
              }}
            >
              <option value={-1}>📚 Knowledge — teori &amp; principper</option>
              {topic.objections && topic.objections.map((o, oi) => (
                <option key={oi} value={oi}>{o.emoji}  {o.type}</option>
              ))}
              {topic.closeMethods && topic.closeMethods.map((c, ci) => (
                <option key={ci} value={ci}>{c.emoji}  {c.title}</option>
              ))}
            </select>
          </div>
        )}

        {/* ── Knowledge view: theory, principles, model ── */}
        {showKnowledge && (
          <>
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

            <p style={{
              fontSize: 15, color: "#292524", lineHeight: 1.85, fontWeight: 400,
              margin: "0 0 28px", paddingBottom: 24,
              borderBottom: "2px solid #e5e2df",
            }}>
              {topic.desc}
            </p>

            <div style={{ marginBottom: 32 }}>
              <p style={{ fontSize: 12, fontWeight: 800, color: topic.color, margin: "0 0 16px", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                Principper
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {topic.principles.map((p, i) => {
                  const exList = p.examples ?? (p.example ? [p.example] : []);
                  return (
                    <div key={i} style={{
                      borderRadius: 16, overflow: "hidden",
                      border: `2px solid ${topic.color}40`,
                      background: "#ffffff",
                      display: "flex", flexDirection: "column",
                    }}>
                      <div style={{ height: 5, background: topic.color }} />
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
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ marginBottom: topic.exampleQuestions ? 32 : 36 }}>
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
          </>
        )}

        {/* ── Objection item view ── */}
        {!showKnowledge && topic.objections && selectedObjIdx >= 0 && (() => {
          const obj = topic.objections![selectedObjIdx] ?? topic.objections![0];
          return (
            <div style={{ marginBottom: 32 }}>
              <div style={{ borderRadius: 16, overflow: "hidden", border: `2px solid ${topic.color}50`, background: "#ffffff", display: "flex", flexDirection: "column" }}>
                <div style={{ height: 4, background: topic.color }} />
                <div style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "14px 20px",
                  background: `${topic.color}10`,
                  borderBottom: `2px solid ${topic.color}30`,
                }}>
                  <span style={{ fontSize: 24 }}>{obj.emoji}</span>
                  <p style={{ fontSize: 16, fontWeight: 800, color: "#1c1917", margin: 0 }}>
                    &ldquo;{obj.type}&rdquo;
                  </p>
                </div>
                {obj.strategies && obj.strategies.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                    {obj.strategies.map((strat, si) => (
                      <div key={si} style={{
                        borderTop: si > 0 ? `2px solid ${topic.color}20` : "none",
                        padding: "20px 24px",
                        background: si % 2 === 0 ? "#fafaf9" : "#ffffff",
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                          <div style={{
                            width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                            background: `${topic.color}15`, border: `2px solid ${topic.color}40`,
                            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
                          }}>{strat.emoji}</div>
                          <div>
                            <p style={{ fontSize: 13, fontWeight: 800, color: topic.color, margin: 0, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                              Strategi {si + 1}
                            </p>
                            <p style={{ fontSize: 15, fontWeight: 800, color: "#1c1917", margin: 0 }}>{strat.title}</p>
                          </div>
                        </div>
                        <p style={{ fontSize: 14, color: "#57534e", margin: "0 0 14px", lineHeight: 1.65 }}>{strat.desc}</p>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          {strat.scripts.map((script, ssi) => (
                            <div key={ssi} style={{
                              display: "flex", gap: 14, padding: "14px 16px",
                              background: "#fffbeb", borderRadius: 10, border: "1.5px solid #fbbf2430",
                            }}>
                              <div style={{
                                width: 22, height: 22, borderRadius: 99, flexShrink: 0, marginTop: 1,
                                background: `${topic.color}15`, border: `2px solid ${topic.color}`,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: 11, fontWeight: 800, color: topic.color,
                              }}>{ssi + 1}</div>
                              <p style={{ fontSize: 14, color: "#292524", margin: 0, lineHeight: 1.85 }}>{script}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
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
                        <p style={{ fontSize: 14, color: "#292524", margin: 0, lineHeight: 1.85 }}>{script}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* ── Close method item view ── */}
        {!showKnowledge && topic.closeMethods && selectedCloseIdx >= 0 && (() => {
          const cm = topic.closeMethods![selectedCloseIdx] ?? topic.closeMethods![0];
          return (
            <div style={{ marginBottom: 32 }}>
              <div style={{ borderRadius: 16, overflow: "hidden", border: `2px solid ${topic.color}50`, background: "#ffffff", display: "flex", flexDirection: "column" }}>
                <div style={{ height: 4, background: topic.color }} />
                <div style={{
                  display: "flex", alignItems: "flex-start", gap: 14,
                  padding: "18px 22px",
                  background: `${topic.color}08`,
                  borderBottom: `2px solid ${topic.color}25`,
                }}>
                  <div style={{
                    width: 46, height: 46, borderRadius: 13, flexShrink: 0,
                    background: `${topic.color}15`, border: `2px solid ${topic.color}40`,
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24,
                  }}>{cm.emoji}</div>
                  <div>
                    <p style={{ fontSize: 17, fontWeight: 800, color: "#1c1917", margin: "0 0 4px" }}>{cm.title}</p>
                    <p style={{ fontSize: 13, color: topic.color, fontWeight: 700, margin: 0 }}>{cm.tagline}</p>
                  </div>
                </div>
                <div style={{ padding: "16px 22px", borderBottom: `1px solid #f0ede9` }}>
                  <p style={{ fontSize: 15, color: "#292524", margin: 0, lineHeight: 1.8 }}>{cm.desc}</p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                  {cm.scripts.map((script, si) => (
                    <div key={si} style={{
                      display: "flex", gap: 14, padding: "18px 22px",
                      borderTop: si > 0 ? "1px solid #f0ede9" : "none",
                      background: si % 2 === 0 ? "#fffbeb" : "#ffffff",
                    }}>
                      <div style={{
                        width: 26, height: 26, borderRadius: 99, flexShrink: 0, marginTop: 1,
                        background: `${topic.color}15`, border: `2px solid ${topic.color}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 12, fontWeight: 800, color: topic.color,
                      }}>{si + 1}</div>
                      <p style={{ fontSize: 14, color: "#292524", margin: 0, lineHeight: 1.9 }}>{script}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}

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

    </div>
  );
}
