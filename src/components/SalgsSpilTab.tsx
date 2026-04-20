"use client";

import { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Quality = "great" | "ok" | "poor";

type Choice = {
  text: string;
  quality: Quality;
  points: number;
  customerResponse: string;
  feedback: string;
};

type Round = {
  customerLine: string;
  hint: string;
  hintTechnique: string;
  choices: Choice[];
};

type Scenario = {
  id: string;
  title: string;
  subtitle: string;
  emoji: string;
  color: string;
  colorLight: string;
  difficulty: "Let" | "Mellem" | "Svær";
  setup: string;
  goal: string;
  rounds: Round[];
};

// ─── Scenarios ────────────────────────────────────────────────────────────────

const SCENARIOS: Scenario[] = [
  {
    id: "computer",
    title: "Sælg Computer",
    subtitle: "B2C Opsalg — Elektronik",
    emoji: "💻",
    color: "#6366f1",
    colorLight: "#eef2ff",
    difficulty: "Let",
    setup: "Kunden er gået ind i butikken og kigger på en Lenovo IdeaPad 5 til 7.499 kr. Du arbejder i butikken.",
    goal: "Forstå kundens reelle behov — og hjælp dem til den løsning der passer dem bedst (muligvis Lenovo Yoga med Core Ultra 7 / 32GB / 1TB SSD / OLED til 10.999 kr.).",
    rounds: [
      {
        customerLine: "Hej, jeg kigger lidt på den her Lenovo IdeaPad. Hvad koster den?",
        hint: "Første kontakt",
        hintTechnique: "Årsag-spørgsmål",
        choices: [
          {
            text: "Den koster 7.499 kr. — men inden vi kigger på prisen: kan du hjælpe mig med at forstå hvad der fik dig til at tænke Lenovo IdeaPad var noget for dig?",
            quality: "great",
            points: 2,
            customerResponse: "Ja, god pointe! Jeg har haft en gammel Windows-laptop i 5 år, den er begyndt at crashe konstant. Tænkte det var tid til noget nyt.",
            feedback: "Perfekt. Du bruger 'hjælp mig at forstå' og udfordrer motivationen frem for blot at svare på prisen. Du positionerer dig som rådgiver fra første sekund — og kunden åbner sig.",
          },
          {
            text: "Den koster 7.499 kr. Hvad skal du bruge computeren til?",
            quality: "ok",
            points: 1,
            customerResponse: "Til arbejde, lidt Netflix og noget billedredigering.",
            feedback: "Rimeligt spørgsmål — du stiller et behovsspørgsmål. Men du springer direkte til anvendelse og spørger ikke til HVORFOR de kigger eller hvad der driver dem. Du mister et vigtigt lag.",
          },
          {
            text: "Den koster 7.499 kr. Det er faktisk vores bestseller — rigtig godt valg!",
            quality: "poor",
            points: 0,
            customerResponse: "Okay... og hvad giver den mig så for de penge?",
            feedback: "Du bekræfter kunden uden at vide om det er det rigtige valg. Tom ros uden viden om kundens behov. Kunden stiller nu et spørgsmål der sætter dig i forsvarsposition.",
          },
          {
            text: "Den koster 7.499 kr. Vi har faktisk en Lenovo Yoga til 10.999 kr. som er meget hurtigere med OLED-skærm.",
            quality: "poor",
            points: 0,
            customerResponse: "Nej tak, jeg vil bare gerne have det billigste.",
            feedback: "Du pitcher opsalg uden at kende behovet. Kunden lukker af og vil nu kun have det billigste. Du har skabt en prisskanse i stedet for en dialog.",
          },
        ],
      },
      {
        customerLine: "Ja, min gamle laptop er begyndt at crashe hele tiden. Var på tide med noget nyt.",
        hint: "Status — hvad gør de i dag?",
        hintTechnique: "Status-spørgsmål",
        choices: [
          {
            text: "Okay. Hvad bruger du mest computeren til? Hvad ville du savne mest, hvis den forsvandt i morgen?",
            quality: "great",
            points: 2,
            customerResponse: "Hmm, godt spørgsmål. Primært arbejde — Word, Excel, videomøder. Og privat er det Netflix og en del billedredigering faktisk.",
            feedback: "Det andet spørgsmål — 'hvad ville du savne mest' — er stærkt. Det tvinger kunden til at rangere hvad der er vigtigt og afslører hvad der faktisk betyder noget for dem.",
          },
          {
            text: "Okay, og hvad bruger du den til?",
            quality: "ok",
            points: 1,
            customerResponse: "Arbejde primært. Word, Excel og lidt foto.",
            feedback: "Fornuftigt opfølgningsspørgsmål, men ret generisk. Du får et ok svar — men du graver ikke dybt nok til at afdække hvad der virkelig er vigtigt.",
          },
          {
            text: "Lenovo IdeaPad er super stabil og hurtig — du vil ikke opleve de crashproblemer igen.",
            quality: "poor",
            points: 0,
            customerResponse: "Det lyder godt. Hvad koster den?",
            feedback: "Du pitcher løsningen inden du kender behovet. Nu er samtalen tilbage ved pris, og du har mistet chancen for at forstå om IdeaPad faktisk er det rigtige valg.",
          },
          {
            text: "Har du overvejet om du måske skulle have en Windows-computer i stedet?",
            quality: "poor",
            points: 0,
            customerResponse: "Nej... jeg tror jeg vil prøve Mac. Hvad koster den igen?",
            feedback: "Irrelevant spørgsmål der sender kunden tilbage i udgangspunktet. Du mister momentum og skaber forvirring i stedet for at grave dybere.",
          },
        ],
      },
      {
        customerLine: "Primært arbejde — Word, Excel, videomøder. Og privat er det Netflix og en del billedredigering.",
        hint: "Uddybende spørgsmål — grav under overfladen",
        hintTechnique: "Uddybende spørgsmål",
        choices: [
          {
            text: "Billedredigering — interessant. Kan du hjælpe mig med at forstå lidt mere om det? Hvad slags billeder redigerer du, og hvilke programmer bruger du?",
            quality: "great",
            points: 2,
            customerResponse: "Jeg rejser meget og tager rigtig mange billeder. Bruger Lightroom — det er vigtigt for mig at det kører hurtigt.",
            feedback: "Du graver dybere på det præcis rigtige punkt. Lightroom er krævende software — og det er her du vil opdage om IdeaPad faktisk er nok. Perfekt uddybende spørgsmål.",
          },
          {
            text: "Okay, og er du tilfreds med det setup du har i dag — udover at den crasher?",
            quality: "ok",
            points: 1,
            customerResponse: "Ja, nogenlunde. Bortset fra at den er langsom til billedredigering.",
            feedback: "Rimeligt opfølgningsspørgsmål. Du finder ud af at billedredigering er et problem — men du graver ikke dybt nok til at forstå omfanget. Du snubler over guld uden at samle det op.",
          },
          {
            text: "Lenovo IdeaPad kan sagtens klare alt det der. Vil du se specifikationerne?",
            quality: "poor",
            points: 0,
            customerResponse: "Okay... ja, vis mig dem.",
            feedback: "Du konkluderer for hurtigt. Du ved ikke om IdeaPad faktisk er nok til Lightroom. Ved at pitche specifikationer mister du muligheden for at afdække den reelle smerte.",
          },
          {
            text: "Netflix og billedredigering kræver ikke så meget. Lenovo IdeaPad er klart nok til det.",
            quality: "poor",
            points: 0,
            customerResponse: "Hmm, okay. Ja, den ser god ud.",
            feedback: "Stor fejl. Lightroom kræver faktisk en del processorkraft. Du lukker en dør du ikke engang ved er åben. Kunden ender med en computer der ikke dækker behovet.",
          },
        ],
      },
      {
        customerLine: "Jeg rejser meget og tager rigtig mange billeder. Bruger Lightroom — det er vigtigt for mig at det kører hurtigt.",
        hint: "Forbedringer og udfordringer",
        hintTechnique: "Forbedringer/Udfordringer",
        choices: [
          {
            text: "Lightroom kræver faktisk en del. Hvad er din oplevelse med din nuværende computer når du redigerer? Går den i stå?",
            quality: "great",
            points: 2,
            customerResponse: "Ja! Den fryser næsten altid. Og eksport af en batch billeder tager op til 20 minutter. Det er sindssygt frustrerende.",
            feedback: "Du grave præcis ind i smerten. 20 minutters eksporttid er et konkret problem med konkret tid på. Det er den information der gør det muligt at sælge løsningen — ikke produktet.",
          },
          {
            text: "Okay, Lightroom kræver lidt mere kraft. Har du tænkt på hvor meget RAM du har brug for?",
            quality: "ok",
            points: 1,
            customerResponse: "Æh, ikke rigtig. Min nuværende computer er bare langsom til det.",
            feedback: "Rimeligt — du anerkender at Lightroom kræver noget. Men teknisk jargon om RAM skaber afstand. Spørg hellere til selve oplevelsen og frustrationen.",
          },
          {
            text: "Lenovo IdeaPad kan godt klare Lightroom. Den er fin til det.",
            quality: "poor",
            points: 0,
            customerResponse: "Okay, godt. Hvad koster den?",
            feedback: "Teknisk set kan IdeaPad godt køre Lightroom — men det er ikke det samme som at den gør det godt. Du lukker for tidligt og misser chancen for at afdække den reelle smerte og det reelle behov.",
          },
          {
            text: "Du bør nok have Lenovo Yoga til Lightroom. Den koster 10.999 kr.",
            quality: "poor",
            points: 0,
            customerResponse: "10.999? Nej, det er for dyrt. Jeg vil bare have den billigste.",
            feedback: "Du pitcher Yoga uden at kunden forstår hvorfor. Uden at have afdækket smerten er prisskansen for stor. Kunden afviser og vil nu kun have det billigste.",
          },
        ],
      },
      {
        customerLine: "Ja, den fryser hele tiden ved redigering. Eksport af en batch billeder tager op til 20 minutter. Det er frustrerende.",
        hint: "Forstør konsekvensen — lad kunden sætte tid på",
        hintTechnique: "Implikationsspørgsmål",
        choices: [
          {
            text: "20 minutter per batch — hvor mange batches laver du typisk om ugen? Og hvad gør du imens — sidder du bare og venter?",
            quality: "great",
            points: 2,
            customerResponse: "Ja... 3-4 batches om ugen. Og ja, jeg sidder bare og venter eller prøver at lave noget andet. Det er sikkert 1-1,5 time spildt om ugen.",
            feedback: "Kunden sætter selv tal på problemet: 1-1,5 time per uge. Det er guld. Det er ikke dig der siger 'Yoga er bedre' — det er kunden der beskriver sin egen smerte i timer. Det sælger løsningen.",
          },
          {
            text: "Det lyder virkelig frustrerende. Lenovo Yoga med Core Ultra 7 kan reducere den eksporttid drastisk — faktisk ned til under 2 minutter.",
            quality: "ok",
            points: 1,
            customerResponse: "Okay, det lyder godt. Men der er vel en del prisforskel?",
            feedback: "Du anerkender frustrationen og præsenterer løsningen. Men du lader ikke kunden selv sætte tal på problemet — og det giver dem en svagere følelse af urgency. Du sælger for tidligt.",
          },
          {
            text: "Okay, det er klart at din computer er for gammel. Du har brug for noget nyt.",
            quality: "poor",
            points: 0,
            customerResponse: "Ja... men Lenovo IdeaPad er vel nok?",
            feedback: "Du konstaterer problemet uden at fordybe det. Kunden forbliver i 'IdeaPad er nok'-tankegangen fordi du ikke har givet dem grund til at tænke anderledes.",
          },
          {
            text: "Lenovo IdeaPad er hurtigere end din nuværende computer — den vil helt sikkert hjælpe med det.",
            quality: "poor",
            points: 0,
            customerResponse: "Okay fedt, lad os tage den.",
            feedback: "Du rammer målet om et salg — men du sælger en computer der stadig ikke løser Lightroom-problemet ordentligt. IdeaPad er hurtigere, men Yoga med Core Ultra 7 er markant bedre til tung billedredigering. Kunden vil blive skuffet.",
          },
        ],
      },
      {
        customerLine: "Ja, det er nok 1-1,5 time spildt om ugen bare på at vente på eksport. Det er irriterende.",
        hint: "Alternativ-spørgsmål — lad dem male den ideelle løsning",
        hintTechnique: "Alternativ-spørgsmål",
        choices: [
          {
            text: "Okay. Hvis du skulle have en computer der var perfekt til Lightroom og rejsefoto — hvad ville være vigtigst for dig: hastighed, lav eksporttid, eller at den er let at have med?",
            quality: "great",
            points: 2,
            customerResponse: "Hastighed og eksporttid er vigtigst. Jeg er ligeglad med et par kilo ekstra. Jeg vil bare ikke sidde og vente.",
            feedback: "Du lader kunden selv definere kriteriet for den ideelle løsning. De siger selv: 'hastighed og eksporttid er vigtigst'. Nu kan du præsentere Lenovo Yoga som løsningen på PRÆCIS det de sagde — ikke noget du fandt på.",
          },
          {
            text: "Baseret på det du har fortalt, tror jeg Lenovo Yoga vil passe dig bedre. Core Ultra 7 og 32GB RAM er markant stærkere til Lightroom.",
            quality: "ok",
            points: 1,
            customerResponse: "Okay... men der er vel en del prisforskel?",
            feedback: "Du præsenterer løsningen korrekt — men du har ikke ladet kunden selv sætte ord på hvad der er vigtigst. Anbefalingen er rigtig, men fundamentet er lidt svagt. Prisindvendingen er næsten uundgåelig nu.",
          },
          {
            text: "Lenovo IdeaPad er lettere og billigere. Den vil nok gøre det bedre end din nuværende computer.",
            quality: "poor",
            points: 0,
            customerResponse: "Ja okay, lad mig tage IdeaPad så.",
            feedback: "Du sælger den forkerte computer. Kunden har netop fortalt dig at de spildt 1-1,5 time om ugen på eksport. IdeaPad vil ikke løse det tilstrækkeligt. Dit job er at hjælpe dem — ikke at sælge det billigste.",
          },
          {
            text: "Du skal nok bare tage Yoga — den er bedst. 10.999 kr.",
            quality: "poor",
            points: 0,
            customerResponse: "10.999? Det er mange penge. Jeg vil hellere have den billige.",
            feedback: "Uden at kunden selv har afdækket behovet lyder Yoga som et overdrevent opsalg. Prisdiskussionen dominerer nu — og du har ingen fundament at stå på.",
          },
        ],
      },
      {
        customerLine: "Hastighed og eksporttid er vigtigst. Jeg er ligeglad med et par kilo ekstra — jeg vil bare ikke sidde og vente.",
        hint: "Prisindsigelse — MMM (gør store priser små)",
        hintTechnique: "Make Money Minimal",
        choices: [
          {
            text: "Perfekt. Du sagde 1-1,5 time spildt om ugen. Hvis din tid er 200 kr. i timen, er det 10.000-15.000 kr. om året. Yoga'en holder 5-6 år — det er ca. 700 kr. ekstra om året for at spare al den tid. Er det en dårlig deal?",
            quality: "great",
            points: 2,
            customerResponse: "Hmm... nej, det er faktisk ikke en dårlig deal når jeg tænker over det sådan. Okay, lad os kigge nærmere på Yoga.",
            feedback: "Dette er MMM i praksis. Du bryder prisdifferencen (3.500 kr.) ned til kr. per år og holder den op mod kundens egne tal. Det er ikke dig der siger Yoga er bedre — det er et regnestykke baseret på hvad KUNDEN sagde.",
          },
          {
            text: "Lenovo Yoga koster 10.999 kr. — 3.500 kr. mere end IdeaPad. Men Core Ultra 7 og 32GB RAM reducerer eksporttid fra 20 minutter til under 2 minutter. Det er en stor forskel.",
            quality: "ok",
            points: 1,
            customerResponse: "Det er mange penge... men okay, det lyder jo meget bedre.",
            feedback: "Du præsenterer fordelen klart med specifikationerne. Men du bruger ikke kundens egne tal (tid per uge, spildt tid) til at bygge argumentet. Det ville gøre det meget mere overbevisende.",
          },
          {
            text: "Ja, der er 3.500 kr. forskel. Det er en investering, men den er det værd.",
            quality: "poor",
            points: 0,
            customerResponse: "3.500 kr. er mange penge... det må jeg tænke over.",
            feedback: "Tom sætning uden substans. 'Det er det værd' er ikke et argument — det er en påstand. Kunden har ingen grund til at tro dig, og du mister dem til 'tænke over det'.",
          },
          {
            text: "Vi kan faktisk give dig 300 kr. i rabat på IdeaPad, hvis du tager den i dag.",
            quality: "poor",
            points: 0,
            customerResponse: "Okay fedt, det tager jeg!",
            feedback: "Du sælger den forkerte computer med rabat. Kunden ender med IdeaPad — som ikke løser Lightroom-problemet. Du har givet rabat på et problem du burde have løst med den rigtige anbefaling.",
          },
        ],
      },
    ],
  },
  {
    id: "teleabonnement",
    title: "Sælg Teleabonnement",
    subtitle: "B2C — Inbound kald",
    emoji: "📱",
    color: "#0ea5e9",
    colorLight: "#f0f9ff",
    difficulty: "Mellem",
    setup: "En kunde ringer ind og spørger om jeres billigste mobilabonnement til 99 kr./md.",
    goal: "Forstå kundens faktiske forbrug og behov — og hjælp dem til det abonnement der passer dem (muligvis Smart 15 til 149 kr.).",
    rounds: [
      {
        customerLine: "Hej, jeg vil gerne høre om jeres billigste mobilabonnement. Jeg har set I har noget til 99 kr.?",
        hint: "Kunden er i prisbaseret tankegang — flyt fokus",
        hintTechnique: "Årsag-spørgsmål",
        choices: [
          {
            text: "Hej! Ja det har vi. Kan du hjælpe mig med at forstå hvad årsagen er til at du er på udkig efter nyt abonnement — hvad har du i dag?",
            quality: "great",
            points: 2,
            customerResponse: "Jo, jeg er med Telenor nu, men de er bare for dyre. Betaler næsten 250 kr. om måneden.",
            feedback: "Du bruger 'hjælp mig med at forstå' og årsag-spørgsmålet. Du svarer på deres spørgsmål (ja vi har det) men skifter med det samme fokus fra pris til situation. Kunden åbner sig om den reelle driver.",
          },
          {
            text: "Hej! Ja, Basic til 99 kr. inkluderer 5 GB data og fri tale. Hvad bruger du mest — data, opkald eller begge dele?",
            quality: "ok",
            points: 1,
            customerResponse: "Primært data og opkald. Jeg bruger ret meget data.",
            feedback: "Du stiller et behovsspørgsmål — det er godt. Men du præsenterer produktet (5 GB) første — nu tænker kunden allerede i produktet og ikke i behovet.",
          },
          {
            text: "Hej! Ja, Basic til 99 kr. — inkluderer 5 GB data og fri tale til alle net. Vil du have den?",
            quality: "poor",
            points: 0,
            customerResponse: "Hmm, 5 GB... er det nok? Og hvad koster det med mere data?",
            feedback: "Du forsøger at lukke inden du kender behovet. Kunden begynder nu at sammenligne og tænke i data-mængder — du har tabt kontrollen over samtalen.",
          },
          {
            text: "Hej! 99 kr. er rigtig fint. Men vores mest populære er faktisk til 199 kr. — meget bedre deal!",
            quality: "poor",
            points: 0,
            customerResponse: "Nej tak, jeg vil gerne have det billigste.",
            feedback: "Du forsøger opsalg uden at kende behovet. Kunden lukker af og vil nu kun have 99 kr.-abonnementet — du har gjort dit eget job sværere.",
          },
        ],
      },
      {
        customerLine: "Jeg er med Telenor nu, men jeg synes de er for dyre.",
        hint: "Brug 'hjælp' og udfordr — hvorfor er de stadig der?",
        hintTechnique: "Hjælp-spørgsmål",
        choices: [
          {
            text: "Kan du hjælpe mig med at forstå hvad årsagen er til at du stadig er med Telenor? Deres priser er jo noget af det højeste i DK.",
            quality: "great",
            points: 2,
            customerResponse: "Haha, god pointe. Jeg har bare aldrig fået skiftet — det er mest inerti mere end noget andet.",
            feedback: "Du udfordrer kunden på en rar måde — og du viser at du kender markedet. Svaret afslører at der ikke er en reel loyalitet, kun træghed. Det er vigtig information.",
          },
          {
            text: "Hvad betaler du til Telenor om måneden?",
            quality: "ok",
            points: 1,
            customerResponse: "249 kr. om måneden. Har 20 GB data.",
            feedback: "Godt opfølgningsspørgsmål — du finder ud af prisen og datamængden. Men du udfordrer ikke kunden på hvorfor de stadig er der, og du mister en chance for at skabe differentiering.",
          },
          {
            text: "Ja, Telenor er meget dyre. Vi er klart billigere!",
            quality: "poor",
            points: 0,
            customerResponse: "Okay, hvad koster jeres abonnementer?",
            feedback: "Du bekræfter kunden uden at grave dybere. Og nu er du i en pris-vs-pris-diskussion som du ikke kan vinde med et 99 kr. abonnement alene.",
          },
          {
            text: "Okay, hvad har du brug for af data per måned?",
            quality: "poor",
            points: 0,
            customerResponse: "Jeg ved ikke helt... måske 10 GB?",
            feedback: "For direkte til data uden at forstå situationen. Kunden gætter et tal frem for at du hjælper dem til at forstå hvad de faktisk bruger.",
          },
        ],
      },
      {
        customerLine: "Haha, det er ren inerti. Jeg har bare aldrig fået skiftet. Betaler 249 kr. for 20 GB.",
        hint: "Effekt — hvad bruger de egentlig?",
        hintTechnique: "Effekt-spørgsmål",
        choices: [
          {
            text: "Okay, 20 GB. Kan du hjælpe mig med at forstå — bruger du faktisk de 20 GB, eller er det mest for at have ro i maven?",
            quality: "great",
            points: 2,
            customerResponse: "Ærlig talt? Jeg bruger nok 8-10 GB. Men jeg er bange for at løbe tør.",
            feedback: "Præcist det rigtige spørgsmål. Du afdækker at kunden betaler for 20 GB men bruger 8-10 GB — og at driveren er frygt, ikke reelt behov. Det er guld til resten af samtalen.",
          },
          {
            text: "Bruger du typisk de 20 GB, eller er det for meget?",
            quality: "ok",
            points: 1,
            customerResponse: "Hmm, jeg tror ikke altid. Måske 10-12 GB?",
            feedback: "Rimeligt spørgsmål som afslører at de ikke bruger alle 20 GB. Men du graver ikke ind i HVORFOR de har 20 GB — og frygt-aspektet forbliver skjult.",
          },
          {
            text: "Vores 99 kr. abonnement har 5 GB — det burde passe dig fint.",
            quality: "poor",
            points: 0,
            customerResponse: "5 GB? Det er ikke meget... det er sikkert for lidt.",
            feedback: "Du konkluderer at 5 GB er nok uden at kende forbruget. Kunden reagerer skeptisk — og du har nu sat dig selv i en vanskelig position.",
          },
          {
            text: "20 GB er rigtig meget. Hvad bruger du din telefon til?",
            quality: "poor",
            points: 0,
            customerResponse: "Opkald, lidt streaming og Maps mest.",
            feedback: "Spørgsmålet er okay, men den indledende kommentar ('rigtig meget') er en vurdering der kan irritere kunden. Spørg neutralt og nysgerrigt.",
          },
        ],
      },
      {
        customerLine: "Ærlig talt? Jeg bruger nok 8-10 GB. Men jeg er bange for at løbe tør.",
        hint: "Udfordr frygten — hvad sker der egentlig?",
        hintTechnique: "Uddybende spørgsmål",
        choices: [
          {
            text: "Frygten for at løbe tør — det er interessant. Hvad er det der sker i praksis, når du er på farten? Er du meget uden WiFi, eller er det mest en ro-i-maven-ting?",
            quality: "great",
            points: 2,
            customerResponse: "Det er mest ro-i-maven. Jeg streamer musik på arbejdsvejen og bruger Maps meget. Det er de store synkunder.",
            feedback: "Du graver ned i frygten og afdækker hvad den egentlig dækker over. Nu ved du præcist hvad data bruges til: musik og navigation. Det er konkrete use cases du kan præsentere en løsning op imod.",
          },
          {
            text: "Okay, 8-10 GB bruger du. Vi har et 15 GB abonnement til 149 kr. — det giver dig lidt buffer.",
            quality: "ok",
            points: 1,
            customerResponse: "Hmm, okay. Hvad inkluderer det?",
            feedback: "Du præsenterer en fornuftig løsning baseret på forbruget. Men du springer over frygten og bruger ikke de konkrete use cases — løsningspræsentationen er svagere end den behøver at være.",
          },
          {
            text: "Vores 99 kr. har 5 GB. Men du kan altid købe ekstra data hvis du løber tør.",
            quality: "poor",
            points: 0,
            customerResponse: "Det lyder besværligt... og sandsynligvis dyrt.",
            feedback: "Du præsenterer en løsning der bekræfter kundens frygt. 'Køb ekstra data' er det modsatte af ro i maven. Du har misforstået hvad kunden har brug for.",
          },
          {
            text: "Så du har brug for ca. 10 GB. Lad os kigge på vores mellemabonnement.",
            quality: "poor",
            points: 0,
            customerResponse: "Okay, hvad koster det?",
            feedback: "Du konkluderer for hurtigt og hopper til produktet. Du ved endnu ikke hvad data bruges til — og du har ikke afdækket om frygt er den reelle driver.",
          },
        ],
      },
      {
        customerLine: "Det er mest ro-i-maven. Jeg streamer musik på arbejdsvejen og bruger Maps meget.",
        hint: "Opsummering — vis at du lyttede og positionér dig som ekspert",
        hintTechnique: "Opsummering",
        choices: [
          {
            text: "Okay, lad mig se om jeg har forstået det korrekt: du betaler 249 kr. i dag, bruger 8-10 GB, og det vigtigste er at have nok til musik og navigation — og slippe for at bekymre dig om at løbe tør. Er det rigtigt forstået?",
            quality: "great",
            points: 2,
            customerResponse: "Ja, præcis! Det er nøjagtigt det.",
            feedback: "Opsummeringen viser at du lyttede intensivt og forstod hele billedet. Kunden siger 'præcis' — og nu er du den ekspert der forstår dem bedre end de selv gør. Det er fundamentet for en stærk anbefaling.",
          },
          {
            text: "Musik og Maps kræver ikke så meget. 10-12 GB burde dække det fint med god margin.",
            quality: "ok",
            points: 1,
            customerResponse: "Ja, det lyder rigtigt.",
            feedback: "Rimeligt svar der viser forståelse. Men du springer opsummeringen over — og mister muligheden for at vise at du hørte hele billedet og sætte dig som den der virkelig forstår dem.",
          },
          {
            text: "Okay, så 99 kr.-abonnementet med 5 GB er nok lidt for lidt. Du skal nok have noget større.",
            quality: "poor",
            points: 0,
            customerResponse: "Ja, hvad har I så?",
            feedback: "Løst svar der ikke viser at du lyttede til det specifikke. Du taber den tillid du har opbygget og begynder blot at præsentere produkter.",
          },
          {
            text: "Vi har flere abonnementer. Lad mig gennemgå dem alle for dig.",
            quality: "poor",
            points: 0,
            customerResponse: "Åh... ja, okay.",
            feedback: "At gennemgå alle abonnementer er det modsatte af rådgivning. Du dumper produkter på kunden i stedet for at bruge den viden du har opbygget til at give én præcis anbefaling.",
          },
        ],
      },
      {
        customerLine: "Ja, præcis! Det er nøjagtigt det.",
        hint: "Præsentér løsningen med fokus på resultat — ikke produkt",
        hintTechnique: "Resultatorienteret præsentation",
        choices: [
          {
            text: "Perfekt. Baseret på det du har fortalt, vil jeg anbefale Smart 15 til 149 kr. — du sparer 100 kr. om måneden vs. Telenor, har 15 GB så du aldrig løber tør med musik og Maps, og dækning på samme netværk. Det er ikke det billigste, men det er præcis det du beskrev. Giver det mening?",
            quality: "great",
            points: 2,
            customerResponse: "Det lyder faktisk rigtig godt. Og jeg sparer 100 kr. om måneden?",
            feedback: "Du linker anbefalingen direkte til hvad kunden sagde ('aldrig løbe tør med musik og Maps') og du nævner besparelsen vs. nuværende. Det er ikke et produkt du sælger — det er en løsning på det problem de definerede selv.",
          },
          {
            text: "Okay, jeg vil anbefale Smart 15 til 149 kr. — 15 GB, gratis opkald, og du sparer 100 kr. om måneden vs. Telenor.",
            quality: "ok",
            points: 1,
            customerResponse: "Det lyder godt. Men 149 kr. er lidt mere end de 99 kr. jeg kiggede på.",
            feedback: "Fin anbefaling med de vigtigste fordele. Men du linker ikke direkte til kundens egne ord og behov — anbefalingen lyder lidt som en liste frem for en løsning.",
          },
          {
            text: "Vi har Basic til 99 kr., Smart 15 til 149 kr., og Premium til 199 kr. Hvad lyder bedst for dig?",
            quality: "poor",
            points: 0,
            customerResponse: "Hmm... hvad er forskellen på dem?",
            feedback: "Du giver kunden valget i stedet for at anbefale. Det er det modsatte af rådgivning — og nu skal du forklare tre produkter til en kunde der bare vil have hjælp til at vælge.",
          },
          {
            text: "Smart 15 til 149 kr. er et godt valg. Det er hvad de fleste kunder tager.",
            quality: "poor",
            points: 0,
            customerResponse: "Okay... men er det det rigtige for mig?",
            feedback: "'De fleste kunder' er ikke et argument for DENNE kunde. Kunden spørger eksplicit om det er det rigtige for dem — og du har ikke koblet anbefalingen til deres konkrete situation.",
          },
        ],
      },
      {
        customerLine: "Det lyder godt. Men 149 kr. er 50 kr. mere end de 99 kr. jeg egentlig kiggede på...",
        hint: "Fra pris til resultat — flyt fokus til konsekvens",
        hintTechnique: "Fra pris til resultat",
        choices: [
          {
            text: "Det forstår jeg godt — 50 kr. mere. Men du sagde selv du bruger 8-10 GB og er bange for at løbe tør. Basic har kun 5 GB — du løber tør næsten hver måned. Smart 15 giver dig ro i maven OG du sparer stadig 100 kr. om måneden vs. Telenor. Er 50 kr. en god pris for aldrig at bekymre dig om data igen?",
            quality: "great",
            points: 2,
            customerResponse: "Ja, når du siger det sådan... du har ret. Lad os tage Smart 15.",
            feedback: "Du bruger kundens egne ord ('bange for at løbe tør') og viser konsekvensen af det billige valg. Og du holder det op mod den totale besparelse vs. Telenor. Kunden beslutter selv — du argumenterer ikke, du viser billedet.",
          },
          {
            text: "Ja, der er 50 kr. forskel. Men Basic med 5 GB vil give dig problemer — du bruger det dobbelte. 149 kr. er stadig 100 kr. billigere end Telenor.",
            quality: "ok",
            points: 1,
            customerResponse: "Hmm, ja det er sandt. Okay, det giver mening.",
            feedback: "Godt argument med sammenligningen til Telenor. Men du bruger ikke kundens egne ord og frygt — argumentet er korrekt men mangler den personlige kobling der gør det uimodståeligt.",
          },
          {
            text: "Ja, det er 50 kr. dyrere. Det er desværre den laveste pris vi kan tilbyde på 15 GB.",
            quality: "poor",
            points: 0,
            customerResponse: "Okay, så tager jeg bare Basic til 99 kr. så.",
            feedback: "Du giver op på indvendingen og accepterer defeat. Kunden ender med Basic — som du selv ved ikke dækker behovet. Du har ikke forsvaret anbefalingen med substans.",
          },
          {
            text: "Jeg kan give dig Basic til 99 kr. hvis du foretrækker det.",
            quality: "poor",
            points: 0,
            customerResponse: "Okay, det tager jeg.",
            feedback: "Du sælger den forkerte løsning uden at kæmpe for kunden. De ender med 5 GB når de bruger 8-10 GB. Din opgave er at hjælpe dem — ikke at give dem det de siger, men det de har brug for.",
          },
        ],
      },
    ],
  },
  {
    id: "livsforsikring",
    title: "Sælg Livsforsikring",
    subtitle: "B2C — Inbound lead",
    emoji: "🛡️",
    color: "#16a34a",
    colorLight: "#f0fdf4",
    difficulty: "Svær",
    setup: "En 38-årig mand har udfyldt en formular online. Han ringer ind. Han er gift, har to børn (5 og 8 år), ejer et hus med lån på 3 mio. Hans kone arbejder deltid.",
    goal: "Hjælp kunden til at se det reelle behov for livsforsikring — gennem spørgsmål, ikke pres — og få en klar anbefaling på plads.",
    rounds: [
      {
        customerLine: "Hej, ja jeg udfyldte noget online... men ærlig talt er jeg ikke helt sikker på om jeg har brug for det her.",
        hint: "Kunden er skeptisk — udfordr med nysgerrighed, ikke pres",
        hintTechnique: "Årsag-spørgsmål",
        choices: [
          {
            text: "Det forstår jeg godt — og jeg er glad for at du siger det direkte. Kan du hjælpe mig med at forstå: hvad var det der fik dig til at udfylde formularen i første omgang?",
            quality: "great",
            points: 2,
            customerResponse: "Hmm... vi fik for nylig et andet barn og min kone begyndte at spørge om vi var godt dækket ind. Det fik mig til at tænke over det.",
            feedback: "Du respekterer skepticismen og bruger årsag-spørgsmålet. Nu ved du at motivationen er familiemæssig og konen er med i billedet. Det er afgørende information der sætter hele samtalen.",
          },
          {
            text: "Det er fint — kan jeg spørge, hvad er din situation? Har du familie?",
            quality: "ok",
            points: 1,
            customerResponse: "Ja, gift og to børn.",
            feedback: "Rimeligt åbent spørgsmål, men du afspejler ikke skepticismen og graver ikke i hvad der drev dem til at udfylde formularen. Du starter med situation frem for motivation.",
          },
          {
            text: "Okay, men lad mig bare fortælle lidt om hvad vi tilbyder, så kan du beslutte bagefter.",
            quality: "poor",
            points: 0,
            customerResponse: "Øh... okay.",
            feedback: "Du ignorerer skepticismen og pitcher videre. Kunden er allerede ufokuseret og du har ikke givet dem en grund til at lytte. Samtalen starter skidt.",
          },
          {
            text: "De fleste tænker det — helt indtil det er for sent.",
            quality: "poor",
            points: 0,
            customerResponse: "Ja okay, men det er lidt skræmmende at sige det sådan...",
            feedback: "Fear-taktik er gennemsigtig og usympatisk. Kunden lukker af. Du skaber ubehag frem for tillid — det er det modsatte af hvad du har brug for.",
          },
        ],
      },
      {
        customerLine: "Vi fik netop et andet barn og min kone begyndte at spørge om vi var godt dækket. Det fik mig til at tænke.",
        hint: "Forstå familiens reelle eksponering",
        hintTechnique: "Konsekvens-spørgsmål",
        choices: [
          {
            text: "Det er et vigtigt spørgsmål din kone stiller. Kan du hjælpe mig med at forstå — hvad ville situationen se ud for din kone og børnene, hvis du som eksempel ikke var der i morgen?",
            quality: "great",
            points: 2,
            customerResponse: "Det... ja, det ville være svært. Vi har jo hus med lån, og hun arbejder kun deltid for at være mere hjemme med børnene.",
            feedback: "Et direkte men nødvendigt spørgsmål. Kunden begynder nu at mærke konsekvensen med sine egne ord. Det er ikke manipulation — det er at hjælpe dem se virkeligheden, som er præcis hvad en rådgiver gør.",
          },
          {
            text: "Godt at du tænker over det. Hvad tjener I tilsammen omtrent?",
            quality: "ok",
            points: 1,
            customerResponse: "Jeg tjener ca. 60.000 om måneden, min kone 20.000 deltid.",
            feedback: "Du finder de finansielle tal — det er nyttigt. Men du springer konsekvensspørgsmålet over og kommer direkte til økonomi, inden kunden har mærket behovet.",
          },
          {
            text: "Livsforsikring er faktisk billigere end folk tror. Lad mig vise jer priserne.",
            quality: "poor",
            points: 0,
            customerResponse: "Okay... hvad koster det så?",
            feedback: "Du pitcher produkt og pris inden kunden overhovedet har forstået behovet. Nu er samtalen styret af pris og kunden vurderer dig som sælger — ikke rådgiver.",
          },
          {
            text: "Ja, det er en god idé. Hvornår har du tid til et møde denne uge?",
            quality: "poor",
            points: 0,
            customerResponse: "Hvad? Vi har vel ikke besluttet noget endnu...",
            feedback: "Du forsøger at booke møde inden kunden er med. De reagerer med forvirring og mistillid. Du er løbet længere end kunden.",
          },
        ],
      },
      {
        customerLine: "Vi har jo hus med lån, og min kone arbejder deltid. Jeg er nok den primære forsørger.",
        hint: "Forstå den finansielle eksponering",
        hintTechnique: "Status-spørgsmål",
        choices: [
          {
            text: "Kan du hjælpe mig med at forstå — hvad er omtrent størrelsen på jeres boliglån? Og hvad er din månedlige indkomst? Jeg vil gerne forstå hvad der faktisk er på spil.",
            quality: "great",
            points: 2,
            customerResponse: "Vi har et lån på ca. 3 millioner. Jeg tjener ca. 60.000 om måneden.",
            feedback: "Du stiller det direkte spørgsmål ingen andre tør stille. Det er afgørende tal for at give en reel anbefaling — og kunden giver dem fordi du signalerer at det er for deres skyld.",
          },
          {
            text: "Okay, og har I nogen opsparing eller andre sikkerhedsnet?",
            quality: "ok",
            points: 1,
            customerResponse: "Hmm, lidt opsparing. Ikke voldsomt meget.",
            feedback: "Rimeligt spørgsmål der afdækker en del af billedet. Men du undgår de konkrete lån og indkomsttal der er afgørende for at kvantificere eksponeringen.",
          },
          {
            text: "Det er typisk netop i den situation folk tager en livsforsikring. Vi har en god løsning til jer.",
            quality: "poor",
            points: 0,
            customerResponse: "Okay, hvad tilbyder I?",
            feedback: "Du pitcher løsning uden at kunden har mærket problemet. De vil nu lytte som forbrugere der shopper — ikke som forældre der beskytter familien.",
          },
          {
            text: "Okay, og har I allerede nogen forsikringer i dag?",
            quality: "poor",
            points: 0,
            customerResponse: "Jo, vi har husejerforsikring og bilforsikring.",
            feedback: "Du stiller et produkt-spørgsmål frem for at fortsætte med at forstå eksponeringen. Du mister momentum og flyver ikke dybere ned i hvad der faktisk er på spil.",
          },
        ],
      },
      {
        customerLine: "Vi har lån på ca. 3 millioner. Jeg tjener ca. 60.000 om måneden, min kone 20.000 deltid.",
        hint: "Afdæk hvad de har i dag — og hvad der mangler",
        hintTechnique: "Forbedringer/Udfordringer",
        choices: [
          {
            text: "Okay. Og hvad har I i dag af livsdækning — privat eller via arbejde? Og hvad var årsagen til at I ikke har kigget på det tidligere?",
            quality: "great",
            points: 2,
            customerResponse: "Via arbejde har jeg sikkert noget — men jeg ved faktisk ikke præcis hvad. Vi har bare aldrig fået sat os ned med det.",
            feedback: "Du afdækker huller i dækningen OG udfordrer inerti. 'Hvad var årsagen til at I ikke har kigget på det' er et Tristan Tate-spørgsmål der afslører at det er inerti, ikke en aktiv beslutning. Det er afgørende indsigt.",
          },
          {
            text: "Okay, og har I nogen forsikringer i forvejen?",
            quality: "ok",
            points: 1,
            customerResponse: "Jo, husejerforsikring og bilforsikring.",
            feedback: "Du finder ud af at de har andre forsikringer — men du spørger ikke til livsdækning specifikt eller til arbejdsforsikringen. Du misser det centrale hul.",
          },
          {
            text: "Med det lån er I meget eksponerede. I bør have en livsforsikring.",
            quality: "poor",
            points: 0,
            customerResponse: "Øh... okay. Det lyder som om I prøver at sælge mig noget.",
            feedback: "Du konkluderer og presser frem for at stille spørgsmål. Kunden mærker salgspresset og lukker af. Du er tabte tillid du havde opbygget.",
          },
          {
            text: "Okay, lad mig gennemgå hvad en standard livsforsikring dækker.",
            quality: "poor",
            points: 0,
            customerResponse: "Okay, hvad dækker den?",
            feedback: "Du præsenterer generisk produktinfo frem for at grave dybere i kundens specifikke situation. Du mister rådgiver-positionen og lyder som en brochure.",
          },
        ],
      },
      {
        customerLine: "Via arbejde har jeg sikkert noget — men jeg aner faktisk ikke præcis hvad. Vi har bare aldrig fået kigget på det.",
        hint: "Forstør konsekvensen — hvad sker der hvis hullet er stort?",
        hintTechnique: "Implikationsspørgsmål",
        choices: [
          {
            text: "Det er meget normalt — men det er her det bliver vigtigt. Arbejdsforsikringer dækker typisk 1-2 gange årsløn. I har et lån på 3 millioner. Hvad ville der ske med huset og din familie, hvis dækningen ikke er nok?",
            quality: "great",
            points: 2,
            customerResponse: "Hmm... hun ville ikke kunne beholde huset alene med deltidslønnen. Det er faktisk en ret skræmmende tanke.",
            feedback: "Du præsenterer et faktum (arbejdsforsikring dækker typisk ikke 3 mio.) og lader kunden selv trække konsekvensen. Det er information der ændrer billedet — ikke pres. Kunden indrømmer 'det er skræmmende', og du har nu et fundament for løsningen.",
          },
          {
            text: "Arbejdsforsikringer er tit utilstrækkelige. I bør tjekke præcist hvad I er dækket for.",
            quality: "ok",
            points: 1,
            customerResponse: "Ja, det burde jeg nok gøre.",
            feedback: "Du peger i den rigtige retning men lader ikke kunden mærke konsekvensen med egne ord. Kunden er passiv — de nikker frem for at bekymre sig.",
          },
          {
            text: "Uden privat livsforsikring er I for dårligt dækket. Det er et kæmpe problem.",
            quality: "poor",
            points: 0,
            customerResponse: "Okay... men det er vel ikke sikkert at det sker.",
            feedback: "Du presser med frygt frem for at lade kunden nå konklusionen selv. Kunden forsvarer sig. Det modsatte af hvad du vil have.",
          },
          {
            text: "Vores forsikring dækker op til 5 millioner. Den passer perfekt til jer.",
            quality: "poor",
            points: 0,
            customerResponse: "Okay, hvad koster det?",
            feedback: "Du springer til produktet og lader ikke kunden mærke behovet fuldt ud. Nu er det bare en prisdiskussion — og du har ikke bygget den tillid der gør at de tror på anbefalingen.",
          },
        ],
      },
      {
        customerLine: "Ja... hun ville ikke kunne beholde huset alene med deltidslønnen. Det er faktisk ret skræmmende.",
        hint: "Linker løsningen direkte til hvad kunden sagde",
        hintTechnique: "Resultatorienteret præsentation",
        choices: [
          {
            text: "Ja, og det er præcis det en livsforsikring løser — ikke som et abstrakt produkt, men som sikkerhed for at huset er betalt og din kone og børnene har ro, uanset hvad der sker. Baseret på jeres lån vil jeg anbefale en dækning på mindst 4 millioner. Giver det mening?",
            quality: "great",
            points: 2,
            customerResponse: "Ja, det giver faktisk meget god mening. Og hvad koster det månedligt?",
            feedback: "Du linker løsningen direkte til det kunden sagde ('huset er betalt, ro til at finde ud af det'). Det er ikke forsikring du sælger — det er sikkerhed for familien med egne ord. Kunden er klar til at høre prisen.",
          },
          {
            text: "En livsforsikring på 4 millioner vil sikre huset er betalt og din kone har en buffer. Det koster ca. 400-600 kr. om måneden.",
            quality: "ok",
            points: 1,
            customerResponse: "Det er mange penge... er det nødvendigt med 4 millioner?",
            feedback: "Du præsenterer løsning og pris i én sætning. Men du linker ikke til kundens egne ord — og du introducerer pris for tidligt, inden kunden har bedt om det.",
          },
          {
            text: "Vi har en god standardpakke til familier med børn. Den koster 490 kr. om måneden.",
            quality: "poor",
            points: 0,
            customerResponse: "Hmm... 490 kr. er det meget?",
            feedback: "Standardpakke lyder generisk — kunden sidestepper deres personlige situation og vurderer nu kun prisen. Du har tabt den personlige kobling.",
          },
          {
            text: "Lad mig sende jer et tilbud I kan kigge på i ro og mag.",
            quality: "poor",
            points: 0,
            customerResponse: "Ja, send det. Jeg vender tilbage.",
            feedback: "Du giver kunden en nem vej ud. 99% af sådanne tilbud resulterer ikke i salg. Du har opbygget interesse og kaster den væk ved at outsource beslutningen til et email-tilbud.",
          },
        ],
      },
      {
        customerLine: "Ja det giver god mening. Og hvad koster det månedligt omtrent?",
        hint: "MMM — gør prisen lille i forhold til hvad den sikrer",
        hintTechnique: "Make Money Minimal",
        choices: [
          {
            text: "Dækning på 4 millioner koster ca. 450-550 kr. om måneden — det er 15-18 kr. om dagen. Du tjener 60.000 om måneden, det er under 1% af din indkomst for at sikre at din familie beholder huset uanset hvad der sker. Er det en dårlig deal for det?",
            quality: "great",
            points: 2,
            customerResponse: "Nej, når du sætter det sådan er det faktisk ret lidt. Lad os gå videre med det.",
            feedback: "MMM i perfekt form. Du bryder prisen ned til kr./dag, holder den op mod indkomsten (<1%) og mod hvad den sikrer (hus + familiens ro). Kunden beslutter selv — du argumenterer ikke, du viser billedet.",
          },
          {
            text: "Det koster ca. 450-550 kr. om måneden. Til sammenligning med hvad I skylder på huset er det ret lidt.",
            quality: "ok",
            points: 1,
            customerResponse: "Ja, det er måske ikke så meget...",
            feedback: "Du laver en sammenligning — det er godt. Men du bryder ikke prisen ned til kr./dag og bruger ikke kundens indkomst som reference. Argumentet er svagere end det behøver at være.",
          },
          {
            text: "Det koster 490 kr. om måneden. Det er vores standardpris.",
            quality: "poor",
            points: 0,
            customerResponse: "Hmm, 490 kr. er faktisk lidt mange penge...",
            feedback: "Du siger bare prisen uden kontekst. 490 kr. lyder af meget uden sammenligning. Du mister momentum lige ved mållinen.",
          },
          {
            text: "Prisen varierer lidt. Lad mig sende dig et formelt tilbud du kan se på.",
            quality: "poor",
            points: 0,
            customerResponse: "Okay, send det. Jeg vender nok tilbage.",
            feedback: "Du outsourcer beslutningen til et tilbud. Kunden var klar til at gå videre — og du sætter en barriere ind. Det er et undgåeligt tab af et salg du havde i hånden.",
          },
        ],
      },
    ],
  },
  {
    id: "saas-leads",
    title: "Sælg SaaS Lead-system",
    subtitle: "B2B — Outbound kald",
    emoji: "📊",
    color: "#7c3aed",
    colorLight: "#f5f3ff",
    difficulty: "Svær",
    setup: "Du ringer ud (outbound) til en salgschef hos en mellemstor virksomhed med 20 sælgere. De bruger Excel og mail til leads. Du sælger LeadFlow — et CRM og lead management system.",
    goal: "Afdæk smerten ved nuværende setup og book et demo — eller sælg en prøveperiode.",
    rounds: [
      {
        customerLine: "Hej, hvem er det?",
        hint: "Cold call — skab nysgerrighed, ikke pitch",
        hintTechnique: "Åbningsstruktur",
        choices: [
          {
            text: "Hej! Jeg ringer ikke for at pitch dig noget — jeg vil bare stille dig et hurtigt spørgsmål: hvad bruger dit salgsteam i dag til at håndtere jeres leads og pipeline?",
            quality: "great",
            points: 2,
            customerResponse: "Vi bruger en kombination af Excel og vores mail-system. Lidt kaotisk ærlig talt.",
            feedback: "Du afvæbner med 'jeg pitcher ikke' og stiller straks et åbent behovsspørgsmål. Svaret 'lidt kaotisk' er et frivilligt smertetegn — kunden har åbnet en dør på eget initiativ. Det er et perfekt fundament.",
          },
          {
            text: "Hej, jeg ringer fra LeadFlow — vi laver CRM-systemer til salgsteams. Har du 2 minutter?",
            quality: "ok",
            points: 1,
            customerResponse: "Ja okay, hvad handler det om?",
            feedback: "Standard cold call åbning. Du introducerer produktet med det samme, men kunden siger ja og lytter. Det er ikke optimalt, men acceptabelt.",
          },
          {
            text: "Hej! Jeg ringer fra LeadFlow — vi har et system der kan øge jeres salg med 40%. Har du tid?",
            quality: "poor",
            points: 0,
            customerResponse: "Vi er ikke interesserede, tak.",
            feedback: "Overkill-pitch med tal ('40%') du ikke kan stå inde for endnu. Kunden mærker det er salg fra første sekund og afviser. Du har ikke skabt en grund til at lytte.",
          },
          {
            text: "Hej, er du salgschefen? Godt. Jeg vil gerne have et møde med dig denne uge.",
            quality: "poor",
            points: 0,
            customerResponse: "Nej, vi har ikke brug for møder. Tak.",
            feedback: "For direkte og antagende. Du beder om et møde uden at have givet kunden en eneste grund til at mødes. Det er respektløst over for kundens tid.",
          },
        ],
      },
      {
        customerLine: "Vi bruger Excel og mail. Det er ærlig talt lidt kaotisk.",
        hint: "Grav under 'kaotisk' — hvad sker der konkret?",
        hintTechnique: "Uddybende spørgsmål",
        choices: [
          {
            text: "Kaotisk — kan du hjælpe mig med at forstå hvad du specifikt mener? Hvad sker der rent konkret?",
            quality: "great",
            points: 2,
            customerResponse: "Vi taber leads hele tiden. Sælgerne ved ikke hvem der har kontaktet hvem, ingen opfølgningsstruktur, og jeg ved aldrig hvad der er i pipeline.",
            feedback: "Du bruger det uddybende spørgsmål præcist rigtigt på 'kaotisk'. Kunden painter nu selv problemet i konkrete termer: tabte leads, ingen struktur, manglende overblik. Det er tre separate smerter — og du har dem alle.",
          },
          {
            text: "Okay, og hvor mange sælgere er I i teamet?",
            quality: "ok",
            points: 1,
            customerResponse: "Vi er 20 sælgere.",
            feedback: "Tal er nyttige, men du hopper over 'kaotisk' uden at grave i det. Du finder størrelsen men ikke smerten — og smerten er det der sælger.",
          },
          {
            text: "Ja, Excel er ikke optimalt til lead management. Vi kan hjælpe jer med det.",
            quality: "poor",
            points: 0,
            customerResponse: "Hvad tilbyder I så?",
            feedback: "Du bekræfter problemet og pitcher straks løsningen. Kunden er nu i produktmodus frem for smertemodus. Du har mistet muligheden for at forstå omfanget — og for at lade dem sige det selv.",
          },
          {
            text: "Det hører vi tit. Vores system løser præcis det.",
            quality: "poor",
            points: 0,
            customerResponse: "Ja, det siger alle.",
            feedback: "'Det hører vi tit' er et klodset salgssignal. Kunden siger 'det siger alle' — og har ret. Du har skabt modstand i stedet for interesse.",
          },
        ],
      },
      {
        customerLine: "Vi taber leads, sælgerne ved ikke hvem der har kontaktet hvem, og jeg har intet overblik over pipeline.",
        hint: "Kvantificér smerten — hvad koster det konkret?",
        hintTechnique: "Implikationsspørgsmål",
        choices: [
          {
            text: "Okay. Og hvad estimerer du at det koster jer — hvad er en gennemsnitlig deal-størrelse for jer?",
            quality: "great",
            points: 2,
            customerResponse: "Vores gennemsnitlige deal er nok 80-100.000 kr. Og ja, vi taber sikkert nogle. Svært at sige præcist.",
            feedback: "Du lader kunden sætte penge på problemet selv. 80-100.000 kr. per deal × tabte leads = enorm skjult omkostning. Det er urgency fra kundens egne tal — ikke fra dig.",
          },
          {
            text: "Okay, og hvad tror du det koster jer at tabe leads?",
            quality: "ok",
            points: 1,
            customerResponse: "Svært at sige... en del.",
            feedback: "Godt spørgsmål, men for vagt. Kunden svarer med 'en del' og du får ingen konkrete tal. Spørg til deal-størrelse i stedet — det er noget de kender.",
          },
          {
            text: "Det er et klassisk problem. LeadFlow giver dig fuld pipeline-overblik i realtid.",
            quality: "poor",
            points: 0,
            customerResponse: "Okay, og hvad koster det?",
            feedback: "Du springer over smertens omfang og pitcher funktioner. Nu er samtalen ved pris, og du har ingen stærk argumentation for prisen.",
          },
          {
            text: "Med LeadFlow kan I spore alle leads og aldrig tabe et igen. Det er det I har brug for.",
            quality: "poor",
            points: 0,
            customerResponse: "Det lyder som en god pitch. Hvad koster det?",
            feedback: "Feature-sælg uden kontekst. 'Spore alle leads' er et middel, ikke et mål. Kunden spørger straks til pris — og du er ikke klar til at forsvare den endnu.",
          },
        ],
      },
      {
        customerLine: "Gennemsnitlig deal er 80-100.000 kr. Vi taber sikkert nogle — svært at sige præcist.",
        hint: "Forbedringer/udfordringer — hvad har de prøvet?",
        hintTechnique: "Forbedringer/Udfordringer",
        choices: [
          {
            text: "Hvad har I gjort hidtil for at prøve at løse det? Og hvad er årsagen til at I ikke har taget et CRM-system i brug?",
            quality: "great",
            points: 2,
            customerResponse: "Vi har kigget på Salesforce og HubSpot — men det virker overdrevet og dyrt. Og implementering... der er bare ikke tid til det.",
            feedback: "Du afdækker at de kender løsningskategorien men er blokeret af kompleksitet og tid. Det er præcis de indvendinger du nu kan adressere direkte — og du vidste det inden de sagde det.",
          },
          {
            text: "Okay, har I kigget på CRM-systemer tidligere?",
            quality: "ok",
            points: 1,
            customerResponse: "Ja, vi har kigget lidt på Salesforce. Det virkede for komplekst.",
            feedback: "Du finder ud af at de har kigget på alternativet. Men 'hvad er årsagen til at I ikke valgte det' er det afgørende spørgsmål du springer over.",
          },
          {
            text: "Salesforce og HubSpot er jo begge stærke systemer. Hvad stoppede jer?",
            quality: "poor",
            points: 0,
            customerResponse: "For komplekst og dyrt.",
            feedback: "Du nævner konkurrenterne frivilligt og validerer dem. Det er en fejl — du inviterer kunden til at sammenligne alle tre, og du er den ukendte.",
          },
          {
            text: "Vi er meget nemmere at implementere end Salesforce. Lad mig vise jer en demo.",
            quality: "poor",
            points: 0,
            customerResponse: "Vi har ikke tid til et demo lige nu.",
            feedback: "Du sammenligner med Salesforce uden kunden har nævnt det — og beder om demo for tidligt. Kunden siger nej fordi du ikke har givet dem nok grund til at prioritere tid til det.",
          },
        ],
      },
      {
        customerLine: "Vi kigget på Salesforce og HubSpot — virker overdrevet, dyrt og implementeringen er for besværlig.",
        hint: "Opsummering + kvantificér problemet",
        hintTechnique: "Opsummering",
        choices: [
          {
            text: "Lad mig se om jeg har forstået det korrekt: I taber leads og har intet pipeline-overblik, I kender til CRM men er skræmt af kompleksitet og implementering — og med 80-100k per deal taber I sandsynligvis 300-500.000 kr. om måneden. Er det rigtigt forstået?",
            quality: "great",
            points: 2,
            customerResponse: "Ja... når du sætter det sådan er det nok lidt større end jeg tænker over. Det er ret skarpt.",
            feedback: "Opsummeringen viser du lyttede og bruger kundens egne tal til at kvantificere problemet. Kunden indrømmer det er 'større end jeg tænker over' — nu er du eksperten der forstår dem bedre end de forstår sig selv.",
          },
          {
            text: "Okay, det giver god mening. Mange af vores kunder har haft præcis det problem.",
            quality: "ok",
            points: 1,
            customerResponse: "Ja, det tror jeg godt.",
            feedback: "Du anerkender men bruger ikke kundens egne tal til at bygge momentum. Social proof er svag her — kunden er ikke imponeret af at andre har haft samme problem.",
          },
          {
            text: "Det forstår jeg. LeadFlow er den enkle løsning — let at implementere og halv prisen af Salesforce.",
            quality: "poor",
            points: 0,
            customerResponse: "Halvt hvad? Hvad koster I?",
            feedback: "Du springer til pitch uden opsummering. Nu er samtalen styret af pris-sammenligning og du har givet slip på rådgiver-positionen.",
          },
          {
            text: "Okay, I er klar til LeadFlow. Hvornår har du tid til et demo?",
            quality: "poor",
            points: 0,
            customerResponse: "Vi er ikke 'klar' til noget endnu...",
            feedback: "Antagende og for aggressivt. Kunden er ikke klar — de har haft en god samtale, men du har ikke bygget nok foundation til at bede om møde endnu.",
          },
        ],
      },
      {
        customerLine: "Ja, det er nok lidt større end jeg tænker over. 300-500.000 kr. i tabte deals er ikke småting.",
        hint: "Alternativ — lad dem definere hvad der skal til",
        hintTechnique: "Alternativ-spørgsmål",
        choices: [
          {
            text: "Ja, præcis. Og hvad er dit nr. 1 kriterie, hvis du skulle vælge en løsning? Nem implementering, pipeline-overblik, sælger-adoption — hvad er vigtigst?",
            quality: "great",
            points: 2,
            customerResponse: "Adoption er nøglen. Hvis sælgerne ikke bruger det, er det ligegyldigt hvor godt systemet er. Det er det der altid slår fejl.",
            feedback: "Du lader kunden sætte nr. 1 kriterie — og finder ud af at adoption er det afgørende. Nu kan du præsentere LeadFlow specifikt på adoption og brugervenlighed frem for pris eller features.",
          },
          {
            text: "Okay, hvad er vigtigst for dig — overblik, implementering eller pris?",
            quality: "ok",
            points: 1,
            customerResponse: "Implementeringstid er nok den største bekymring.",
            feedback: "Du stiller spørgsmålet rigtigt, men adoption nævner du ikke som option. Kunden vælger implementering frem for at nævne adoption — og du misser den virkelige driver.",
          },
          {
            text: "Vi har en gratis 14-dages trial. Vil du prøve det?",
            quality: "poor",
            points: 0,
            customerResponse: "Hmm... måske. Hvad indebærer det?",
            feedback: "Du hopper til et konkret tilbud uden at forstå hvad der er vigtigt for kunden. Trialanmodningen er for tidlig og du risikerer at de prøver det med forkerte forventninger.",
          },
          {
            text: "LeadFlow er designet til præcis de krav. Lad os booke et demo.",
            quality: "poor",
            points: 0,
            customerResponse: "Okay, men hvornår og hvad indebærer det?",
            feedback: "Du springer over hvad der er vigtigt for kunden og beder om demo. Kunden siger ja, men uden at vide hvorfor LeadFlow er det rigtige valg for dem specifikt.",
          },
        ],
      },
      {
        customerLine: "Adoption er nøglen. Sælgerne bruger ikke systemer der er besværlige. Det er det der altid slår fejl.",
        hint: "Resultatorienteret præsentation + book næste skridt",
        hintTechnique: "Resultatorienteret closing",
        choices: [
          {
            text: "Det er præcis hvad vi hører fra alle salgschefer — og det er det LeadFlow er bygget på. Adoptionsrate er 87% efter 30 dage vs. 34% for Salesforce, og implementeringstid er 3 dage. Baseret på det du har fortalt vil jeg gerne vise dig det i et 20-minutters demo med dit teams setup. Hvornår passer det?",
            quality: "great",
            points: 2,
            customerResponse: "87% adoptionsrate? Ja, det vil jeg faktisk gerne se. Hvornår kan det lade sig gøre?",
            feedback: "Du linker direkte til det kunden sagde (adoption) med konkrete tal der er svære at ignorere. Du beder om et lille skridt (demo) — ikke salget med det samme. Det er den korrekte B2B-closing.",
          },
          {
            text: "LeadFlow er designet til nem adoption — gennemsnitlig implementering er 3 dage. Vil du booke et demo?",
            quality: "ok",
            points: 1,
            customerResponse: "Ja, det lyder interessant. Send mig en tid.",
            feedback: "Du nævner implementering men ikke adoptionsrate — som var det kunden sagde var nøglen. Du booker demo, men ikke på det stærkest mulige fundament.",
          },
          {
            text: "Perfekt. Lad mig sende dig vores informationsmateriale, og du kan ringe tilbage når du er klar.",
            quality: "poor",
            points: 0,
            customerResponse: "Okay, send det. Jeg vender tilbage.",
            feedback: "Du giver kunden en nem vej ud. Informationsmateriale der 'sendes' resulterer sjældent i opfølgning. Du har haft en perfekt samtale og kaster resultatet væk.",
          },
          {
            text: "Vi koster 12.500 kr. om måneden for op til 25 brugere. Er det interessant?",
            quality: "poor",
            points: 0,
            customerResponse: "12.500 kr.? Det er mange penge...",
            feedback: "Du introducerer pris uden at have demonstreret værdien. 12.500 kr. lyder af meget når kunden ikke ved hvad de får. Du har skabt en prisindsigelse du ikke var klar til at håndtere.",
          },
        ],
      },
    ],
  },
  {
    id: "tv-stroem",
    title: "TV og Strøm — Fasthold kunden",
    subtitle: "B2C — Inbound opsigelse",
    emoji: "⚡",
    color: "#dc2626",
    colorLight: "#fef2f2",
    difficulty: "Mellem",
    setup: "En kunde ringer ind og vil opsige deres elaftale hos OK — de har fundet noget billigere online. Du skal behandle opkaldet.",
    goal: "Forstå hvad der driver opsigelsen, afdæk det fulde billede af hvad kunden faktisk betaler, og fasthold dem — evt. med en bundlet TV + strøm aftale.",
    rounds: [
      {
        customerLine: "Hej, jeg vil gerne opsige min elaftale. Jeg har fundet noget billigere online.",
        hint: "Opsigelse — stop ikke, forstå hvad de sammenligner med",
        hintTechnique: "Årsag-spørgsmål",
        choices: [
          {
            text: "Hej! Selvfølgelig hjælper jeg dig med det. Men inden jeg behandler det — kan du hjælpe mig med at forstå hvad det er du har fundet? Hvad er prisen du sammenligner med?",
            quality: "great",
            points: 2,
            customerResponse: "Det er en aftale til 1,80 kr./kWh uden abonnementspris. I koster jo 2,10 kr./kWh.",
            feedback: "Du stopper ikke opsigelsen — du siger at du vil hjælpe. Og du finder ud af præcis hvad de sammenligner med. Nu ved du at det er 0,30 kr./kWh forskel — og du ved endnu ikke om sammenligningen er fair.",
          },
          {
            text: "Hej! Selvfølgelig. Hvad er det for en aftale du har fundet?",
            quality: "ok",
            points: 1,
            customerResponse: "En aftale til 1,80 kr./kWh. Ingen abonnementspris.",
            feedback: "Rimeligt spørgsmål der finder produktet. Men du signalerer ikke at du vil hjælpe dem — du ligner bare én der stiller spørgsmål inden du behandler opsigelsen.",
          },
          {
            text: "Hej! Av, det vil vi gerne undgå. Hvad kan vi gøre for at beholde dig?",
            quality: "poor",
            points: 0,
            customerResponse: "Altså... kan I matche prisen?",
            feedback: "Desperat åbning der viser at du vil have salget mere end du vil hjælpe kunden. Kunden spørger straks om prismatching — og du er i defensiven fra start.",
          },
          {
            text: "Hej! Ja, vi kan behandle opsigelsen. Hvad er dit kundenummer?",
            quality: "poor",
            points: 0,
            customerResponse: "Det er 45623. Kan I ikke gøre noget for at beholde mig?",
            feedback: "Du accepterer opsigelsen uden at stille et eneste spørgsmål. Ironisk nok er det kunden der nu spørger om de kan holdes — men du har allerede mistet momentum.",
          },
        ],
      },
      {
        customerLine: "Det er en aftale til 1,80 kr./kWh uden abonnementspris. I koster 2,10 kr./kWh.",
        hint: "Afdæk det fulde billede — er sammenligningen reel?",
        hintTechnique: "Hjælp-spørgsmål",
        choices: [
          {
            text: "Kan du hjælpe mig med at forstå — er det en fastprisaftale eller spotpris? Og er der et gebyr tilknyttet?",
            quality: "great",
            points: 2,
            customerResponse: "Det er... hmm, det er faktisk spotpris. Og der er et gebyr på 39 kr./md. Det stod i det fine print.",
            feedback: "Du stiller det spørgsmål kunden ikke selv tænkte på. Nu har kunden opdaget at sammenligningen ikke er reel — spotpris + gebyr gør det langt mere komplekst. Du positionerer dig som den der hjælper dem forstå det fulde billede.",
          },
          {
            text: "Er det en fastprisaftale?",
            quality: "ok",
            points: 1,
            customerResponse: "Det tror jeg... jeg er ikke helt sikker faktisk.",
            feedback: "Godt spørgsmål der afdækker usikkerhed. Men du finder ikke ud af gebyret, og kunden er stadig uklar på hvad de har fundet. Du kan grave dybere.",
          },
          {
            text: "Ja, men vores aftale inkluderer meget mere service end prissammenligningstjenester viser.",
            quality: "poor",
            points: 0,
            customerResponse: "Hvad mener du?",
            feedback: "Vagt defensivt argument. 'Meget mere service' er ikke et konkret argument — det er en salgssvars-kliché. Kunden forstår ikke hvad du mener og er ikke overbevist.",
          },
          {
            text: "Vi kan ikke matche den pris, men vores service er bedre.",
            quality: "poor",
            points: 0,
            customerResponse: "Hvad er forskellen i praksis?",
            feedback: "Du opgiver prisargumentet og hopper til 'service er bedre' uden at vide hvad der er vigtigt for kunden. Og du ved endnu ikke om sammenligningen er reel.",
          },
        ],
      },
      {
        customerLine: "Det er spotpris med 39 kr./md. i gebyr. Det stod i det fine print.",
        hint: "Effekt — hvad har de egentlig sat pris på hos jer?",
        hintTechnique: "Effekt-spørgsmål",
        choices: [
          {
            text: "Okay, det er vigtigt at have med i regnestykket. Og hvad er din oplevelse med os det seneste år — er der noget du har sat pris på?",
            quality: "great",
            points: 2,
            customerResponse: "Ja, jeg har ikke haft problemer. Jeg har faktisk jeres TV-pakke oveni — det har fungeret rigtig godt.",
            feedback: "Du spørger om det gode — og opdager at de har en bundlet løsning. Nu ved du at opsigelse af strøm sandsynligvis påvirker TV-pakken. Det er afgørende information.",
          },
          {
            text: "Okay. Bruger du kun strøm hos os, eller har du andre aftaler?",
            quality: "ok",
            points: 1,
            customerResponse: "Jo, jeg har jeres TV-pakke også.",
            feedback: "Du finder TV-pakken, men du finder ikke ud af om kunden faktisk er tilfreds med den. Du mangler det emotionelle lag.",
          },
          {
            text: "Det gebyr gør jo at de ikke er billigere end os alligevel. Det kan du se.",
            quality: "poor",
            points: 0,
            customerResponse: "Hmm, det er jo ikke nødvendigvis rigtigt...",
            feedback: "Du konkluderer for kunden og lyder defensiv. Kunden modargumenterer — og du har mistet noget af den tillid du havde opbygget.",
          },
          {
            text: "Okay, men med spotpris risikerer du at betale meget mere om vinteren.",
            quality: "poor",
            points: 0,
            customerResponse: "Ja, det er en risiko.",
            feedback: "Fejlfortalt frygtargument. Kunden anerkender risikoen men er ikke overbevist. Du mangler at finde ud af den totale pakke-situation inden du argumenterer.",
          },
        ],
      },
      {
        customerLine: "Jeg har ikke haft problemer. Og jeg har faktisk jeres TV-pakke oveni — det har fungeret rigtig godt.",
        hint: "Afdæk bundlet konsekvens — hvad mister de?",
        hintTechnique: "Implikationsspørgsmål",
        choices: [
          {
            text: "Godt at høre. Det er faktisk vigtigt — hvis du opsiger strøm, mister du bundlerabatten på TV-pakken. Kan du hjælpe mig med at forstå: hvad betaler du for TV-pakken i dag, og hvad inkluderer den?",
            quality: "great",
            points: 2,
            customerResponse: "175 kr. om måneden. Den inkluderer 70 kanaler og HBO Nordic. Det er faktisk ikke dårlig pris...",
            feedback: "Du afslører en konsekvens kunden ikke kendte (tab af bundlerabat) og lader dem selv fortælle hvad TV-pakken er værd. Nu er billedet meget mere komplekst end bare 0,30 kr. forskel på strøm.",
          },
          {
            text: "Okay, og ved du at bundlerabatten på TV forsvinder hvis du skifter strøm?",
            quality: "ok",
            points: 1,
            customerResponse: "Nej, det vidste jeg ikke. Hvad betyder det?",
            feedback: "Du nævner bundlerabatten — det er korrekt. Men du spørger ikke til hvad TV-pakken koster og indeholder, og du lader ikke kunden sætte prisen selv.",
          },
          {
            text: "Godt at høre. Se, hvis du opsiger mister du en god deal. Det er ikke fornuftigt.",
            quality: "poor",
            points: 0,
            customerResponse: "Det er jo min beslutning...",
            feedback: "Du fortæller kunden hvad de skal mene. Det er ikke rådgivning — det er pres. Kunden forsvarer sin autonomi og du mister tillidsvægt.",
          },
          {
            text: "Vi har faktisk en kampagne netop nu. Lad mig se hvad vi kan gøre for at beholde dig.",
            quality: "poor",
            points: 0,
            customerResponse: "Hvad er kampagnen?",
            feedback: "Du springer til en 'kampagne' du ikke engang kender detaljerne på. Det lyder desperat og du har stadig ikke afdækket det totale billede. Kunden er nu i transaktionsmodus.",
          },
        ],
      },
      {
        customerLine: "TV-pakken er 175 kr./md. med 70 kanaler og HBO Nordic. Det er faktisk ikke dårlig pris...",
        hint: "Opsummering — sæt det hele i perspektiv med tal",
        hintTechnique: "Opsummering",
        choices: [
          {
            text: "Lad mig prøve at sætte det hele op for dig: den nye aftale er spotpris der svinger plus 39 kr./md. i gebyr, og du mister bundlerabatten på TV der sandsynligvis koster dig 80-100 kr./md. ekstra. Har jeg forstået billedet korrekt?",
            quality: "great",
            points: 2,
            customerResponse: "Hold da op... når du sætter det sådan er det faktisk ikke en klar besparelse.",
            feedback: "Du opsummerer hele regnestykket med konkrete tal fra samtalen. Du argumenterer ikke — du viser billedet. Kunden konkluderer selv at det ikke er en oplagt besparelse. Det er perfekt rådgivning.",
          },
          {
            text: "Ja, bundlerabatten er 80-100 kr./md. Det skal du lægge oven i besparelsen på strøm.",
            quality: "ok",
            points: 1,
            customerResponse: "Okay, det havde jeg ikke tænkt på.",
            feedback: "Du peger i den rigtige retning. Men du bruger ikke den fulde opsummeringsstruktur og giver ikke kunden mulighed for at bekræfte at du har forstået billedet korrekt.",
          },
          {
            text: "Så du kan se at det ikke kan betale sig at skifte.",
            quality: "poor",
            points: 0,
            customerResponse: "Hmm, det er vel ikke helt klart...",
            feedback: "Du konkluderer for kunden. De modargumenterer — og det er fordi ingen kan lide at høre at de har taget en dårlig beslutning. Lad dem selv konkludere.",
          },
          {
            text: "Det er lidt komplekst. Vil du have mig til at sende en beregning på mail?",
            quality: "poor",
            points: 0,
            customerResponse: "Ja, send gerne det.",
            feedback: "Du outsourcer konklusionen til en mail. Kunden vil sandsynligvis ikke åbne den — og du mister det momentum du har bygget op. Opsummeringen skal ske nu, mens kunden er i samtalen.",
          },
        ],
      },
      {
        customerLine: "Okay, det er faktisk ikke en klar besparelse. Men jeg vil stadig gerne betale lidt mindre...",
        hint: "Alternativ — hvad er vigtigst for dem egentlig?",
        hintTechnique: "Alternativ-spørgsmål",
        choices: [
          {
            text: "Det forstår jeg godt. Hvad er vigtigst for dig — at betale absolut mindst muligt, eller at have fast pris med ro i maven og ingen ubehagelige overraskelser om vinteren?",
            quality: "great",
            points: 2,
            customerResponse: "Ro i maven faktisk. Jeg kan ikke lide at prisen svinger wildly.",
            feedback: "Du hjælper kunden med at definere hvad de egentlig vil have. 'Ro i maven' er nu det kriterie løsningen præsenteres på — og du vidste det ikke da samtalen startede.",
          },
          {
            text: "Vi har faktisk en ny fastprisaftale til 1,95 kr./kWh som er lidt billigere end din nuværende.",
            quality: "ok",
            points: 1,
            customerResponse: "Okay, hvad er forskellen fra det jeg har nu?",
            feedback: "Du præsenterer en løsning der er billigere — det er godt. Men du spørger ikke hvad der er vigtigst for kunden, og anbefalingen lander ikke på et personligt fundament.",
          },
          {
            text: "Okay, jeg kan give dig en lille rabat på din nuværende aftale.",
            quality: "poor",
            points: 0,
            customerResponse: "Hvad slags rabat?",
            feedback: "Rabat som første reaktion signalerer at I har plads i prisen — og åbner en forhandling du ikke behøvede at starte. Du har gode argumenter; brug dem.",
          },
          {
            text: "Vi kan ikke matche den billigste aftale desværre, men vores service er bedre.",
            quality: "poor",
            points: 0,
            customerResponse: "Hvad er bedre? Strøm er strøm...",
            feedback: "'Strøm er strøm' er en klassisk reaktion. Du har ikke defineret hvad 'bedre service' betyder for kunden — og kunden er enig i at det lyder som en tom sælgersætning.",
          },
        ],
      },
      {
        customerLine: "Ro i maven er vigtigst. Jeg kan ikke lide at prisen svinger.",
        hint: "Resultatorienteret closing — sæt det op mod hvad de sagde",
        hintTechnique: "Resultatorienteret closing",
        choices: [
          {
            text: "Perfekt. Vi har en fastprisaftale til 1,95 kr./kWh — lidt billigere end nu, ingen svingende priser, og du beholder bundlerabatten på TV. Samlet sparer du ca. 100-150 kr./md. versus at skifte — med den ro i maven du selv sagde var vigtigst. Giver det mening?",
            quality: "great",
            points: 2,
            customerResponse: "Ja, det lyder faktisk fornuftigt. Lad os gøre det.",
            feedback: "Du præsenterer løsningen på præcis det kunden definerede som vigtigst ('ro i maven'), kvantificerer besparelsen og undgår den usikkerhed de frygtede. Det er ikke et salgspitch — det er en konklusion på hvad kunden selv sagde.",
          },
          {
            text: "Okay, jeg kan oprette dig på vores fastprisaftale til 1,95 kr./kWh. Du beholder bundlerabatten og ved hvad du betaler.",
            quality: "ok",
            points: 1,
            customerResponse: "Ja, det lyder fornuftigt.",
            feedback: "Korrekt anbefaling med de vigtigste fordele. Men du linker ikke til 'ro i maven' som var det kunden selv sagde — og du kvantificerer ikke den totale besparelse. Anbefalingen er svagere end den behøver at være.",
          },
          {
            text: "Fedt. Vil du have mig til at sende et tilbud som du kan tænke over?",
            quality: "poor",
            points: 0,
            customerResponse: "Ja, send det. Jeg vender tilbage.",
            feedback: "Kunden var klar — og du sender dem hjem med et tilbud. Det er en opsigelse i slow motion. Alle tilbud der 'sendes til overvejelse' fører sjældent til salg.",
          },
          {
            text: "Okay, jeg registrerer opsigelsen og sender dig en ny aftale til gennemsyn.",
            quality: "poor",
            points: 0,
            customerResponse: "Okay tak.",
            feedback: "Du registrerer opsigelsen og håber på at kunden vender tilbage. Det gør de ikke. Du havde alle kortene i hånden og spillede dem ikke.",
          },
        ],
      },
    ],
  },
  {
    id: "kaffemaskine",
    title: "Sælg Kaffemaskine",
    subtitle: "B2C Opsalg — Diverse produkter",
    emoji: "☕",
    color: "#b45309",
    colorLight: "#fffbeb",
    difficulty: "Let",
    setup: "Kunden er i butikken og kigger på en simpel filterkaffemaskine til 399 kr. Du arbejder i butikken.",
    goal: "Forstå kundens kaffevaner og behov — og anbefal den løsning der faktisk passer dem (evt. espressomaskine til 1.999 kr. eller kapselkaffemaskine til 1.299 kr.).",
    rounds: [
      {
        customerLine: "Hej, jeg vil gerne have en kaffemaskine. Den der til 399 kr. ser fin ud.",
        hint: "Åbning — forstå motivation og vaner",
        hintTechnique: "Årsag-spørgsmål",
        choices: [
          {
            text: "Hej! Ja, den er populær. Kan du hjælpe mig med at forstå — hvad er årsagen til at du er på udkig efter ny kaffemaskine? Hvad bruger du i dag?",
            quality: "great",
            points: 2,
            customerResponse: "Min gamle er gået i stykker. Den var en almindelig filterkaffe. Har haft den i 10 år.",
            feedback: "Du bruger årsag-spørgsmålet og finder ud af at de er i 'erstatnings-mode'. Det åbner mulighed for at spørge ind til om de er tilfredse med filterkaffe — eller om der er noget de savnede.",
          },
          {
            text: "Hej! Ja, den er god. Hvad slags kaffe drikker du normalt?",
            quality: "ok",
            points: 1,
            customerResponse: "Filterkaffe mest. En kop om morgenen.",
            feedback: "Fornuftigt behovsspørgsmål. Du finder forbrug — men du spørger ikke til motivation (hvorfor de kigger) og mangler det første lag.",
          },
          {
            text: "Hej! God valg, den er vores bedste til prisen. Vil du have en pose kaffe med?",
            quality: "poor",
            points: 0,
            customerResponse: "Hmm... nej, bare maskinen.",
            feedback: "Du bekræfter valget og forsøger straks opsalg på kaffe inden du kender behovet. Kunden afviser og er nu mere afvisende overfor eventuelle forslag.",
          },
          {
            text: "Hej! Vi har faktisk en bedre model til 1.999 kr. — meget bedre kaffe.",
            quality: "poor",
            points: 0,
            customerResponse: "Nej tak, 399 kr. er fint.",
            feedback: "Du pitcher opsalg uden at kende behovet. Kunden afviser og vil nu kun have den billigste. Du har gjort dit eget job sværere.",
          },
        ],
      },
      {
        customerLine: "Min gamle filterkaffe gik i stykker. Den var 10 år gammel.",
        hint: "Status — hvad virker og hvad virker ikke?",
        hintTechnique: "Effekt-spørgsmål",
        choices: [
          {
            text: "Okay. Og hvad var du tilfreds med ved den gamle, og hvad ville du gerne have anderledes?",
            quality: "great",
            points: 2,
            customerResponse: "Den var enkel og nem. Men kaffen var faktisk lidt tam. Jeg har altid drømt om rigtig espresso, men tænkte det var for besværligt.",
            feedback: "Du finder både det gode (enkel, nem) og det kunden savnede (espresso). Den drøm om espresso er afgørende information — og du ville aldrig have fundet den uden dette spørgsmål.",
          },
          {
            text: "Okay, og hvad er det du primært bruger kaffe til — morgen, gæster, eller løbende?",
            quality: "ok",
            points: 1,
            customerResponse: "Morgenkaffe mest — en eller to kopper om dagen.",
            feedback: "Godt forbrugsspørgsmål. Men du finder ikke ud af hvad de var tilfredse med og hvad de savnede — og du misser den drøm om espresso.",
          },
          {
            text: "Filterkaffemaskiner er rigtig gode. Den til 399 kr. er solid og nem at bruge.",
            quality: "poor",
            points: 0,
            customerResponse: "Ja, det lyder godt. Den tager jeg.",
            feedback: "Du bekræfter valget uden at grave i behovet. Kunden køber filterkaffemaskinen — men du ved ikke om det er det rigtige for dem. Du ender muligvis med at sælge en skuffelse.",
          },
          {
            text: "Okay, og hvad er din budget?",
            quality: "poor",
            points: 0,
            customerResponse: "Helst ikke for meget. Måske 500-600 kr.",
            feedback: "Budget-spørgsmålet tidligt sætter en prisramme der låser dig. Nu er du begrænset til filterkaffe-segmentet inden du ved hvad kunden egentlig har brug for.",
          },
        ],
      },
      {
        customerLine: "Den var enkel og nem. Men kaffen var faktisk lidt tam. Jeg har altid drømt om rigtig espresso, men tænkte det var for besværligt.",
        hint: "Grav ned i drømmen — hvad er egentlig besværligt?",
        hintTechnique: "Uddybende spørgsmål",
        choices: [
          {
            text: "Espresso — det er interessant. Kan du hjælpe mig med at forstå hvad du mener med besværligt? Hvad er det du forestiller dig?",
            quality: "great",
            points: 2,
            customerResponse: "Jeg tror det er den der maler kaffe og damp og sådan noget. Det virker som en hel videnskab.",
            feedback: "Du graver ned i barrieren og finder ud af at det er et visuelt billede af kompleksitet — ikke reel erfaring. Det åbner mulighed for at vise at kapselmaskiner er enkle og giver espresso-kvalitet.",
          },
          {
            text: "Okay, og har du prøvet espresso hjemme hos nogen?",
            quality: "ok",
            points: 1,
            customerResponse: "Ja, hos min søster. Det smager fantastisk.",
            feedback: "Du finder at de har smagt og elsker espresso. Men du graver ikke i barrieren (hvad de tror er besværligt) — og det er der nøglen til løsningen sidder.",
          },
          {
            text: "Espressomaskiner er faktisk ikke svære. Vores til 1.999 kr. er meget nem.",
            quality: "poor",
            points: 0,
            customerResponse: "Hmm, 1.999 kr. er mange penge for en kaffemaskine...",
            feedback: "Du præsenterer produkt og pris uden at have afdækket hvad 'besværligt' betyder for kunden. Prisen skræmmer dem og du har ikke et fundament at stå på.",
          },
          {
            text: "Filterkaffe er nemmere. En espressomaskine kræver mere tid og vedligeholdelse.",
            quality: "poor",
            points: 0,
            customerResponse: "Okay, så filterkaffe er nok bedst for mig.",
            feedback: "Du sælger imod det kunden drømmer om. Du bekræfter kundens barriere i stedet for at udforske om den er reel. Kunden ender med filterkaffe og en uopfyldt drøm.",
          },
        ],
      },
      {
        customerLine: "Jeg tror det er den der maler kaffe og damp og alt det der. Det virker som en hel videnskab.",
        hint: "Afdæk om barrieren er reel — og vis løsningen",
        hintTechnique: "Forbedringer/Udfordringer",
        choices: [
          {
            text: "Okay — det er det klassiske billede folk har. Men hvad nu hvis du kunne få espresso-kvalitet ved at trykke på én knap? Det er faktisk hvad kapselmaskiner giver. Har du prøvet dem?",
            quality: "great",
            points: 2,
            customerResponse: "Nej, ikke rigtig. Det lyder faktisk meget nemmere end jeg troede.",
            feedback: "Du udfordrer den falske barriere med et konkret alternativ og et opklarende spørgsmål. Kunden opdager at det er nemmere end de troede — og barrieren falder. Nu er du klar til at præsentere kapselkaffemaskinen.",
          },
          {
            text: "Okay, det er faktisk lettere end det ser ud. Vi kan vise dig det.",
            quality: "ok",
            points: 1,
            customerResponse: "Ja, okay.",
            feedback: "Du angriber barrieren, men ikke med et konkret alternativ. Kunden siger ja passivt — men du har ikke givet dem en god grund til at skifte opfattelse.",
          },
          {
            text: "Ja, en rigtig espressomaskine kræver lidt oplæring. Men resultaterne er fantastiske.",
            quality: "poor",
            points: 0,
            customerResponse: "Ja, det er nok for meget for mig.",
            feedback: "Du bekræfter barrieren og mister kunden. De ender med filterkaffe fordi du ikke præsenterede kapselmaskin-alternativet som en nem mellemvej.",
          },
          {
            text: "Vores Nespresso-maskiner er nemme og giver god espresso. De koster fra 999 kr.",
            quality: "poor",
            points: 0,
            customerResponse: "999 kr. er mere end jeg ville bruge...",
            feedback: "Du introducerer pris uden at have nedbrudt barrieren. Kunden reagerer på prisen fordi de ikke endnu ser værdien. Sæt prisen til sidst — ikke til sidst.",
          },
        ],
      },
      {
        customerLine: "Det lyder faktisk meget nemmere end jeg troede. Kaffe på én knap?",
        hint: "Byg nysgerrigheden — lad dem forestille sig løsningen",
        hintTechnique: "Need-Payoff spørgsmål",
        choices: [
          {
            text: "Ja, præcis. Og hvad ville det betyde for din morgenrutine, hvis du hver morgen kunne have en rigtig god espresso — ligesom på café — på under et minut?",
            quality: "great",
            points: 2,
            customerResponse: "Det ville faktisk være ret fedt. Jeg bruger tit for meget tid i morges på at finde kaffe der smager ordentligt.",
            feedback: "Du lader kunden selv male værdien. De sætter tid og morgenroutine på det — og det er noget de selv sagde. Nu sælger de sig selv på løsningen.",
          },
          {
            text: "Ja, det er virkelig nemt. Lad mig vise dig en kapselmaskine.",
            quality: "ok",
            points: 1,
            customerResponse: "Ja, det vil jeg gerne se.",
            feedback: "Rimeligt — du peger kunden hen mod løsningen. Men du lader dem ikke mærke hvad det vil betyde for dem, og motivationen er svagere.",
          },
          {
            text: "Ja! Og vi har mange smagsvarianter. Det er rigtig hyggeligt.",
            quality: "poor",
            points: 0,
            customerResponse: "Ja, det lyder hyggeligt.",
            feedback: "'Hyggelig' er ikke et stærkt salgsargument. Du pitcher smagsvariation frem for at hjælpe kunden forestille sig den personlige fordel. Kunden er passivt enig, ikke aktivt motiveret.",
          },
          {
            text: "Præcis! Vores bedste model er Nespresso Vertuo til 1.199 kr. Den kan vi give 100 kr. i rabat på i dag.",
            quality: "poor",
            points: 0,
            customerResponse: "1.199 kr.? Det er meget mere end 399 kr.",
            feedback: "Du pitcher pris og rabat inden kunden har mærket værdien. Prisforskellen (800 kr.) dominerer nu samtalen. Lad dem mærke behovet — præsenter derefter prisen.",
          },
        ],
      },
      {
        customerLine: "Det ville være ret fedt. Jeg bruger tit for meget tid på kaffe der smager tam om morgenen.",
        hint: "Præsenter løsningen linket til hvad de sagde",
        hintTechnique: "Resultatorienteret præsentation",
        choices: [
          {
            text: "Perfekt. Baseret på det du har fortalt — du vil have det nemt og du vil have kaffe der faktisk smager godt — vil jeg anbefale vores Nespresso Vertuo til 1.199 kr. Du trykker på én knap og får café-kvalitet espresso hver morgen. Giver det mening?",
            quality: "great",
            points: 2,
            customerResponse: "Ja, det lyder faktisk som præcis hvad jeg har brug for. Hvad er prisen igen?",
            feedback: "Du linker direkte til hvad kunden sagde ('nemt + god smag') og præsenterer løsningen som svaret på netop det. Det er ikke opsalg — det er en anbefaling baseret på hvad de definerede som vigtigt.",
          },
          {
            text: "Vi har Nespresso Vertuo til 1.199 kr. — super nem og laver rigtig god espresso.",
            quality: "ok",
            points: 1,
            customerResponse: "Okay, hvad er forskellen på den og filterkaffe?",
            feedback: "Fornuftig præsentation. Men du linker ikke til kundens egne ord og behov. Kunden spørger til forskellen — de er ikke overbevist endnu.",
          },
          {
            text: "Vi har Nespresso til 1.199 kr., De'Longhi til 1.699 kr., og Sage til 3.499 kr. Hvad lyder bedst?",
            quality: "poor",
            points: 0,
            customerResponse: "Åh... det er mange muligheder. Jeg ved ikke hvad jeg skal vælge.",
            feedback: "For mange valg skaber beslutningslammelse. Kunden er nu overvældet — og du har kastet den tillid væk du opbyggede ved at forstå deres behov.",
          },
          {
            text: "Okay, filterkaffe til 399 kr. er nok det rigtige for dig. Det er nemmere.",
            quality: "poor",
            points: 0,
            customerResponse: "Ja... okay, den tager jeg.",
            feedback: "Du sender kunden tilbage til startpunktet med et produkt der ikke lever op til det de sagde de drømte om. De vil blive skuffet — og du har ikke hjulpet dem.",
          },
        ],
      },
      {
        customerLine: "1.199 kr. er lidt mere end jeg tænkte... der er 800 kr. forskel fra den til 399 kr.",
        hint: "MMM — gør prisdifferencen lille i forhold til daglig glæde",
        hintTechnique: "Make Money Minimal",
        choices: [
          {
            text: "800 kr. forskel — men du sagde du drikker kaffe hver morgen. Det er 800 kr. delt med 365 dage = 2,20 kr. ekstra om dagen for kaffe du faktisk nyder fremfor kaffe der smager tam. Er 2 kr. om dagen en dårlig investering i din morgenrutine?",
            quality: "great",
            points: 2,
            customerResponse: "Haha, 2 kr. om dagen sætter det i et andet lys. Nej, det er faktisk fint. Lad os tage Nespresso.",
            feedback: "MMM præcist brugt. Du bryder prisdifferencen ned til kr./dag og holder den op mod hvad kunden selv sagde (kaffe der smager tam vs. godt). 2 kr. om dagen er ikke en prisindsigelse — det er et no-brainer.",
          },
          {
            text: "Ja, der er en prisforskel. Men kvaliteten og oplevelsen er markant bedre.",
            quality: "ok",
            points: 1,
            customerResponse: "Ja, men 800 kr. er stadig mange penge...",
            feedback: "Du peger på kvaliteten — det er korrekt. Men du bryder ikke prisen ned og kunden forbliver fast på den samlede sum. MMM ville have løst det.",
          },
          {
            text: "Ja, det er dyrere. Men vi kan give dig 150 kr. i rabat i dag.",
            quality: "poor",
            points: 0,
            customerResponse: "Okay, 150 kr. hjælper lidt. Hmm...",
            feedback: "Rabat signalerer at der er plads i prisen — og kunden forbliver i prisforhandling-mode. Du havde et stærkt argument (kr./dag), brug det.",
          },
          {
            text: "Okay, filterkaffe til 399 kr. er også et godt valg. Det er din beslutning.",
            quality: "poor",
            points: 0,
            customerResponse: "Ja, jeg tager filterkaffe. Tak.",
            feedback: "Du giver op ved den første prisindsigelse og sender kunden til et produkt du ved ikke løser det de drømmer om. Du hjælper dem ikke — du undgår bare konflikten.",
          },
        ],
      },
    ],
  },
  {
    id: "tv-opsalg",
    title: "TV Opsalg",
    subtitle: "B2C Opsalg — LED til Mini LED/QNED",
    emoji: "📺",
    color: "#0ea5e9",
    colorLight: "#f0f9ff",
    difficulty: "Mellem" as const,
    setup: "Kunden kigger på en 55\" Samsung Crystal UHD LED-TV til 2.999 kr. Du arbejder i butikken og vil høre mere om, hvad de egentlig har brug for.",
    goal: "Forstå kundens seervaner og behov — og anbefal den løsning der passer (evt. Samsung Neo QLED 65\" Mini LED til 5.999 kr.).",
    rounds: [
      {
        customerLine: "Jeg kigger bare lidt... det der 55-tommer til 2.999 kr. ser jo fin ud.",
        hint: "Åbn samtalen — vis nysgerrighed, ikke salgspres.",
        hintTechnique: "Åben relation",
        choices: [
          {
            text: "Ja, den er populær! Hvad skal det nye TV primært bruges til — film, sport, gaming?",
            quality: "great" as const,
            points: 2,
            customerResponse: "Mest film og fodbold i stuen med familien.",
            feedback: "Perfekt åbning — du spørger om brugen og skaber en naturlig samtale uden pres.",
          },
          {
            text: "Den er god nok — vi har også nogle lidt dyrere, men den her er fin.",
            quality: "ok" as const,
            points: 1,
            customerResponse: "Okay... hvad er forskellen egentlig?",
            feedback: "Du nævner at der er dyrere, men springer direkte til sammenligning uden at kende behovet.",
          },
          {
            text: "Det er vores billigste model. Skal du bare have noget der virker?",
            quality: "poor" as const,
            points: 0,
            customerResponse: "Ja, bare noget der fungerer.",
            feedback: "Du placerer kunden i 'billigst muligt'-kategorien fra start — du har allerede tabt muligheden for et opsalg.",
          },
          {
            text: "Den er på tilbud lige nu, så det er godt timing at købe.",
            quality: "poor" as const,
            points: 0,
            customerResponse: "Okay, så tager jeg den.",
            feedback: "Du lukker salget med det samme uden at forstå behovet — kunden går måske hjem med noget der ikke er det rigtige.",
          },
        ],
      },
      {
        customerLine: "Mest film og fodbold i stuen med familien.",
        hint: "Find ud af hvad de har i dag og hvad de synes om det.",
        hintTechnique: "Status (Tristan Tate)",
        choices: [
          {
            text: "Fedt — og hvad har I for TV i dag, og hvad synes I om det?",
            quality: "great" as const,
            points: 2,
            customerResponse: "Vi har et gammelt 42-tommer LCD fra 2014. Billedet er lidt mudret, men det virker.",
            feedback: "Du bruger statusspørgsmålet perfekt — du finder ud af hvad de har og lægger grunden for at vise forbedring.",
          },
          {
            text: "Okay, fodbold er rigtig godt på et stort TV. Vil du se 55 eller 65 tommer?",
            quality: "ok" as const,
            points: 1,
            customerResponse: "55 er nok fint.",
            feedback: "Du hopper direkte til størrelse uden at forstå hvad de vil forbedre fra deres nuværende TV.",
          },
          {
            text: "Så er den her perfekt til jer!",
            quality: "poor" as const,
            points: 0,
            customerResponse: "Ja, okay.",
            feedback: "Du konkluderer for hurtigt — du ved slet ikke hvad de har i dag eller hvad de vil forbedre.",
          },
          {
            text: "Film og fodbold kræver god lyd — har du overvejet at tilføje en soundbar?",
            quality: "poor" as const,
            points: 0,
            customerResponse: "Nej, jeg vil bare have et TV.",
            feedback: "Du hopper til mersalg på soundbar allerede nu — kunden er ikke engang landet på TV-valget endnu.",
          },
        ],
      },
      {
        customerLine: "Vi har et gammelt 42-tommer LCD fra 2014. Billedet er lidt mudret, men det virker.",
        hint: "Forstå hvad de oplever som godt og hvad de ønsker sig anderledes.",
        hintTechnique: "Effekt + Forbedringer (Tristan Tate)",
        choices: [
          {
            text: "Og hvad er det med billedet der generer dig mest — er det skarphed, farver eller noget andet?",
            quality: "great" as const,
            points: 2,
            customerResponse: "Det er mest at farverne er flade og sort-hvid-kontrasten er dårlig. Fodbold ser nærmest grå ud.",
            feedback: "Perfekt — du graver ind i den specifikke smerte og får kunden til at formulere problemet selv.",
          },
          {
            text: "12 år er lang tid — du fortjener noget ordentligt!",
            quality: "ok" as const,
            points: 1,
            customerResponse: "Ja, det tænkte jeg også.",
            feedback: "Du validerer behovet, men du er ikke konkret nok om hvad der er galt — du mister chancen for at grave dybere.",
          },
          {
            text: "Så er det helt sikkert tid til en opgradering. Den her 55-tommer er meget bedre.",
            quality: "poor" as const,
            points: 0,
            customerResponse: "Okay... hvad er bedre ved den?",
            feedback: "Du hopper til løsningen uden at vide hvad kunden vil forbedre — du sælger et svar på et spørgsmål ingen har stillet.",
          },
          {
            text: "LCD er fint til daglig brug. Måske du ikke har brug for mere?",
            quality: "poor" as const,
            points: 0,
            customerResponse: "Ja, måske...",
            feedback: "Du undergraver dig selv og kundens eget ønske om at opgradere — du sælger mod dig selv.",
          },
        ],
      },
      {
        customerLine: "Det er mest at farverne er flade og sort-hvid-kontrasten er dårlig. Fodbold ser nærmest grå ud.",
        hint: "Mål vigtigheden — og find ud af om familien er med i beslutningen.",
        hintTechnique: "Alternativ + Relation",
        choices: [
          {
            text: "Okay — og er det bare dig der bruger TV'et, eller er det hele familien der ser fodbold og film?",
            quality: "great" as const,
            points: 2,
            customerResponse: "Ja, vi er tre hjemme — min kone og to børn. Vi har hygge-aftner på sofaen.",
            feedback: "Fremragende — du udvider perspektivet til hele familien og sætter scenen for at tale om en oplevelse frem for en skærm.",
          },
          {
            text: "Det lyder som om du har brug for bedre kontrast. Skal vi se på OLED?",
            quality: "ok" as const,
            points: 1,
            customerResponse: "Hvad er OLED?",
            feedback: "Du springer til teknisk løsning for hurtigt — du ved ikke nok om konteksten endnu.",
          },
          {
            text: "Ja, det lyder ikke godt. Hvad er dit budget?",
            quality: "poor" as const,
            points: 0,
            customerResponse: "Helst ikke for meget...",
            feedback: "Du spørger om budget for tidligt og sender kunden i defensiv prismodus — undgå dette indtil du har skabt værdi.",
          },
          {
            text: "Det er der mange der siger om LCD. Den her er LED og burde være bedre.",
            quality: "poor" as const,
            points: 0,
            customerResponse: "Okay... er LED meget bedre?",
            feedback: "Du begynder at tale teknologi uden at have kortlagt behovet fuldt ud.",
          },
        ],
      },
      {
        customerLine: "Ja, vi er tre hjemme — min kone og to børn. Vi har hygge-aftner på sofaen.",
        hint: "Mal det ideelle billede — få dem til at drømme om oplevelsen.",
        hintTechnique: "Visualisering + Gap Selling",
        choices: [
          {
            text: "Så forestil dig: Champions League på en stor, skarp skærm — sort sort, farver der popper — og hele familien på sofaen med en rigtig biograffølelse. Det er det I egentlig er ude efter, ik?",
            quality: "great" as const,
            points: 2,
            customerResponse: "Ja! Det lyder faktisk rigtig fedt.",
            feedback: "Perfekt visualisering — du sælger følelsen og oplevelsen, ikke en skærm. Kunden er nu emotionelt investeret.",
          },
          {
            text: "Okay, så I er en familie der bruger TV'et meget. Det giver mening at investere lidt.",
            quality: "ok" as const,
            points: 1,
            customerResponse: "Ja, vi bruger det ret meget.",
            feedback: "Du validerer brugen, men du maler ikke billedet — kunden har ikke forestillet sig den bedre oplevelse endnu.",
          },
          {
            text: "Så skal I have noget der er stor nok. 65 tommer måske?",
            quality: "poor" as const,
            points: 0,
            customerResponse: "Ja, 65 er måske lidt stort...",
            feedback: "Du hopper til størrelse uden at have skabt det emotionelle behov — kunden tænker nu i logistik, ikke drøm.",
          },
          {
            text: "Børn elsker store TV! Skal vi se på et 75-tommer?",
            quality: "poor" as const,
            points: 0,
            customerResponse: "Nej nej, det er for stort til vores stue.",
            feedback: "Du overskyder og mister troværdighed — kunden lukker nu ned fremfor at åbne op.",
          },
        ],
      },
      {
        customerLine: "Ja! Det lyder faktisk rigtig fedt.",
        hint: "Præsentér løsningen med fordele koblet til det de har sagt — ikke specs.",
        hintTechnique: "Løsning koblet til behov",
        choices: [
          {
            text: "Så vil jeg anbefale dig Samsung Neo QLED 65\" Mini LED til 5.999 kr. Mini LED giver dig præcis det: dybe sorte toner, eksplosive farver, og et billede der er skarpt nok til at se forskellen på græsset på en fodboldbane. Det er den her familieaften du beskrev.",
            quality: "great" as const,
            points: 2,
            customerResponse: "Wow, det lyder godt. Men 5.999 kr. er lidt mere end jeg havde tænkt...",
            feedback: "Perfekt — du kobler produktet direkte til det kunden drømte om. Prisindsigelsen er et naturligt næste skridt — og du er klar til det.",
          },
          {
            text: "Samsung Neo QLED 65\" Mini LED er vores bedste TV. Den er på 5.999 kr.",
            quality: "ok" as const,
            points: 1,
            customerResponse: "5.999 kr.? Det er dyrt.",
            feedback: "Du præsenterer produktet men uden at koble det til det kunden fortalte dig — du sælger specs, ikke en oplevelse.",
          },
          {
            text: "Jeg kan anbefale den her 55-tommer LED til 2.999 kr. Det er et godt tilbud.",
            quality: "poor" as const,
            points: 0,
            customerResponse: "Okay, det tager jeg.",
            feedback: "Du giver op på opsalget og anbefaler den originale model — kunden får ikke det de egentlig drømmede om.",
          },
          {
            text: "Vi har mange modeller — OLED, QLED, Mini LED. Vil du se dem alle?",
            quality: "poor" as const,
            points: 0,
            customerResponse: "Hmm... det er mange muligheder. Måske jeg tænker lidt mere over det.",
            feedback: "For mange muligheder skaber forvirring og decision paralysis — kunden går hjem uden at købe noget.",
          },
        ],
      },
      {
        customerLine: "Wow, det lyder godt. Men 5.999 kr. er lidt mere end jeg havde tænkt...",
        hint: "Brug LAER — Lyt, Anerkend + Empati, Efterforsk (reference det de sagde om familien og biografoplevelsen), Reager med 'og derfor'.",
        hintTechnique: "LAER — Prisindsigelse",
        choices: [
          {
            text: "Det forstår jeg godt — og det er fair at tænke over prisen. Du fortalte mig at kvaliteten af billedet og kontrasten var særligt vigtigt — og at det var hele familiens hyggeaftner det handler om. Det var vigtigt for dig, ik? ... Og derfor er det en lidt større investering — fordi du præcis får det skarpe fodbold og den dybe kontrast din nuværende TV ikke kan give. Det synes jeg personligt er pengene værd. Men hvad synes du selv?",
            quality: "great" as const,
            points: 2,
            customerResponse: "Ja... når du siger det sådan, er det jo egentlig fornuftigt. Okay, jeg tager den.",
            feedback: "Perfekt LAER: du lyttede, anerkendte + viste empati, efterforskede ved at referere det de selv sagde om familien og oplevelsen, og reagerede med 'og derfor'. Kunden lukkede sig selv.",
          },
          {
            text: "Jeg forstår — men tænk på hvad du sparer på lang sigt. Et godt TV holder 10 år.",
            quality: "ok" as const,
            points: 1,
            customerResponse: "Ja, det er sandt. Okay, måske.",
            feedback: "Du bruger et logisk argument, men du refererer ikke til det kunden selv sagde — LAER-E mangler og svaret er derfor svagere.",
          },
          {
            text: "Okay, vi kan se på 55-tommer versionen til 4.499 kr. i stedet?",
            quality: "poor" as const,
            points: 0,
            customerResponse: "Ja, det er bedre.",
            feedback: "Du giver op og downseller ved første prisindsigelse — du har ikke forsøgt at forsvare værdien du netop præsenterede.",
          },
          {
            text: "Det er en god pris for det du får. Skal jeg pakke den ind?",
            quality: "poor" as const,
            points: 0,
            customerResponse: "Ej, jeg tror jeg venter lidt.",
            feedback: "Du ignorerer indsigelsen og presser på — kunden lukker ned og går. Prisindsigelse skal håndteres, ikke ignoreres.",
          },
        ],
      },
    ],
  },
  {
    id: "ok-stroem",
    title: "OK Strøm",
    subtitle: "B2C — Fasthold & sælg el-aftale",
    emoji: "⚡",
    color: "#f59e0b",
    colorLight: "#fffbeb",
    difficulty: "Let" as const,
    setup: "En kunde ringer ind — de betaler for meget for strøm hos Ørsted og overvejer at skifte til OK. De er lidt usikre på om det er besværligt at skifte.",
    goal: "Forstå kundens forbrug og behov — og luk en OK Fast-aftale med en tryg overgang.",
    rounds: [
      {
        customerLine: "Hej, jeg overvejer at skifte fra Ørsted. Jeg synes jeg betaler for meget.",
        hint: "Åbn trygt og vis at du er på deres side — ikke i salgsmodus.",
        hintTechnique: "Åben relation",
        choices: [
          {
            text: "Det er en rigtig god grund til at ringe — mange af vores kunder siger præcis det samme. Må jeg spørge — betaler du en fast eller variabel pris for strøm hos Ørsted i dag?",
            quality: "great" as const,
            points: 2,
            customerResponse: "Jeg tror det er variabel — prisen svinger lidt.",
            feedback: "Perfekt åbning — du validerer kunden og stiller straks et konkret spørgsmål der afslører hvad de egentlig har og om vi kan hjælpe.",
          },
          {
            text: "Ja, Ørsted er dyre. Vi er billigere — vil du høre om vores priser?",
            quality: "ok" as const,
            points: 1,
            customerResponse: "Ja, hvad koster det?",
            feedback: "Du bevæger dig for hurtigt til pris — du ved endnu ikke hvad kunden har i dag, og risikerer at sammenligne æbler og pærer.",
          },
          {
            text: "Velkommen til OK! Hvad er dit CPR-nummer så jeg kan oprette dig?",
            quality: "poor" as const,
            points: 0,
            customerResponse: "Vent — jeg har ikke besluttet mig endnu.",
            feedback: "Du hopper til oprettelse uden at kunden har sagt ja — det skaber ubehag og mistillid fra start.",
          },
          {
            text: "Okay, kan du sende en kopi af din elregning til os?",
            quality: "poor" as const,
            points: 0,
            customerResponse: "Nej... kan I ikke bare fortælle mig hvad I tilbyder?",
            feedback: "Du lægger arbejdet over på kunden og bremser samtalen — du mister momentum og viser ikke at du er klar til at hjælpe nu.",
          },
        ],
      },
      {
        customerLine: "Jeg tror det er variabel — prisen svinger lidt.",
        hint: "Find ud af hvad de bruger og hvad det koster dem i dag.",
        hintTechnique: "Status (Tristan Tate)",
        choices: [
          {
            text: "Okay — og ved du omtrent hvad du betaler per kWh nu, eller hvad din månedlige regning er?",
            quality: "great" as const,
            points: 2,
            customerResponse: "Jeg betaler nok 1.800-2.000 kr. om måneden. Husstandens forbrug er sikkert 4.000-5.000 kWh om året.",
            feedback: "Du får konkrete tal at arbejde med — det giver dig mulighed for at lave en reel sammenligning og vise besparelsen.",
          },
          {
            text: "Variabel er risikabelt. Vi har en fast aftale — det er meget bedre.",
            quality: "ok" as const,
            points: 1,
            customerResponse: "Okay — hvad koster jeres faste aftale?",
            feedback: "Du introducerer fast pris som argument, men du har ikke hørt om kundens forbrug — du kan ikke sætte det i kontekst endnu.",
          },
          {
            text: "Ja, variabel svinger. Men markedet er faldet — måske du sparer penge hos Ørsted alligevel?",
            quality: "poor" as const,
            points: 0,
            customerResponse: "Hmm... måske du har ret. Jeg ringer måske tilbage.",
            feedback: "Du argumenterer mod dig selv og mister kunden — aldrig forklar en kunde at de måske ikke behøver at skifte.",
          },
          {
            text: "Okay. Vi har mange gode aftaler — fast, variabel, grøn strøm. Hvad lyder bedst?",
            quality: "poor" as const,
            points: 0,
            customerResponse: "Jeg ved det ikke... hvad anbefaler du?",
            feedback: "For mange muligheder for tidligt skaber forvirring — du har ikke nok information til at anbefale noget endnu.",
          },
        ],
      },
      {
        customerLine: "Jeg betaler nok 1.800-2.000 kr. om måneden. Husstandens forbrug er sikkert 4.000-5.000 kWh om året.",
        hint: "Vis at du har lyttet og spørg ind til hvad der er vigtigt for dem.",
        hintTechnique: "Effekt + Forbedringer (Tristan Tate)",
        choices: [
          {
            text: "Okay, 4-5.000 kWh — det er et normalt hjem. Hvad er vigtigst for dig i en ny elaftale — at prisen er fast og forudsigelig, eller at den er lavest mulig selv om den svinger?",
            quality: "great" as const,
            points: 2,
            customerResponse: "Helst en fast pris — jeg vil ikke bekymre mig om det svinger op og ned.",
            feedback: "Perfekt — du finder kundens prioritet (forudsigelighed vs. lavest mulig pris) som er afgørende for hvilken aftale du anbefaler.",
          },
          {
            text: "Ja, 1.800-2.000 kr. om måneden er meget. Vi kan spare dig penge.",
            quality: "ok" as const,
            points: 1,
            customerResponse: "Ja? Hvor meget?",
            feedback: "Du lover besparelse uden at vide nok om kundens aftale endnu — vær forsigtig med at love noget du ikke kan garantere.",
          },
          {
            text: "Okay, lad mig se hvad vores priser er... vores spot-aftale er pt. 1,23 kr./kWh.",
            quality: "poor" as const,
            points: 0,
            customerResponse: "Er det billigere end Ørsted?",
            feedback: "Du dykker ned i priser og teknikaliteter uden at have forstået hvad kunden prioriterer — du risikerer at miste dem i detaljer.",
          },
          {
            text: "Det lyder dyrt. Hvad betaler din nabo?",
            quality: "poor" as const,
            points: 0,
            customerResponse: "Hvad...? Det ved jeg ikke.",
            feedback: "Irrelevant spørgsmål der forvirrer kunden og signalerer at du ikke ved hvad du taler om.",
          },
        ],
      },
      {
        customerLine: "Helst en fast pris — jeg vil ikke bekymre mig om det svinger op og ned.",
        hint: "Vis at du forstår dem — og find den egentlige frustration.",
        hintTechnique: "Årsag (Tristan Tate)",
        choices: [
          {
            text: "Det giver mening — kan du hjælpe mig med at forstå hvad der egentlig generer dig mest: er det at du ikke ved hvad du skal betale næste måned, eller at du føler du betaler for meget og ikke kan stole på prisen?",
            quality: "great" as const,
            points: 2,
            customerResponse: "Det er begge dele egentlig — men mest at jeg aldrig rigtig ved hvad jeg skal budgettere med.",
            feedback: "Perfekt årsagsspørgsmål — du finder den dybere frustration: manglende forudsigelighed i budgettet. Det er din salgsmulighed.",
          },
          {
            text: "Det forstår jeg. Fast pris er tryggere. Vil du have vores Fast-aftale?",
            quality: "ok" as const,
            points: 1,
            customerResponse: "Hvad koster den?",
            feedback: "Du bevæger dig mod løsningen, men du har sprunget ét lag over — hvad er den egentlige frustration? Du ved det ikke endnu.",
          },
          {
            text: "Ja, fast pris er godt. Vores Fast-aftale er 1,49 kr./kWh inkl. moms.",
            quality: "poor" as const,
            points: 0,
            customerResponse: "Er det billigt?",
            feedback: "Du dykker i pris uden at have skabt kontekst — kunden kan ikke vurdere om det er godt uden at forstå hvad de får.",
          },
          {
            text: "Ja, variabel strøm er risikabelt i disse tider. Markedet er usikkert.",
            quality: "poor" as const,
            points: 0,
            customerResponse: "Ja... er markedet virkelig så dårligt?",
            feedback: "Du skaber frygt i stedet for tryghed — det er ikke den følelse du vil sætte i gang hos kunden.",
          },
        ],
      },
      {
        customerLine: "Det er begge dele egentlig — men mest at jeg aldrig rigtig ved hvad jeg skal budgettere med.",
        hint: "Opsummer hvad du har hørt — og lad kunden bekræfte.",
        hintTechnique: "Opsummering + Mirroring",
        choices: [
          {
            text: "Så lad mig opsummere hvad jeg forstår: du bruger ca. 4-5.000 kWh om året, du betaler variabel pris hos Ørsted — og det der frustrerer dig mest er at du aldrig ved hvad du skal budgettere med til strøm. Rammer det nogenlunde?",
            quality: "great" as const,
            points: 2,
            customerResponse: "Ja, præcis. Det er irriterende ikke at vide hvad regningen bliver.",
            feedback: "Perfekt opsummering — kunden bekræfter og du har nu et solidt fundament for at præsentere løsningen. Du har vist at du har lyttet.",
          },
          {
            text: "Okay, så du vil gerne have fast pris. Det har vi!",
            quality: "ok" as const,
            points: 1,
            customerResponse: "Ja — hvad koster det?",
            feedback: "Du hopper til løsningen uden at opsummere — du mister den opbygning der gør kunden klar til at sige ja.",
          },
          {
            text: "Det forstår jeg godt. Kan jeg spørge — har du bolig eller erhverv?",
            quality: "poor" as const,
            points: 0,
            customerResponse: "Bolig. Men hvornår kommer vi til sagen?",
            feedback: "Unødvendigt spørgsmål der forsinker samtalen — du har allerede informationen du behøver for at gå videre.",
          },
          {
            text: "Okay, så du er bare træt af Ørsted generelt?",
            quality: "poor" as const,
            points: 0,
            customerResponse: "Ja... men det handler mere om prisen.",
            feedback: "For løs opsummering — du mister de vigtige nuancer og kunden korrigerer dig, hvilket svækker din autoritet.",
          },
        ],
      },
      {
        customerLine: "Ja, præcis. Det er irriterende ikke at vide hvad regningen bliver.",
        hint: "Præsentér løsningen koblet til det de sagde — forudsigelighed og budgetsikkerhed.",
        hintTechnique: "Løsning koblet til behov",
        choices: [
          {
            text: "Så er OK Fast-aftalen lavet til dig. Du får en fast pris per kWh i 12 måneder — du ved præcis hvad du betaler, uanset hvad markedet gør. Baseret på dit forbrug på 4-5.000 kWh sparer du sandsynligvis 200-400 kr. om måneden sammenlignet med en dyr variabel aftale. Og så tager vi os af hele skiftet — du behøver ikke gøre noget.",
            quality: "great" as const,
            points: 2,
            customerResponse: "Det lyder faktisk rigtig godt. Men er det ikke besværligt at skifte?",
            feedback: "Perfekt præsentation: du kobler fast pris direkte til frustrationen om budgetsikkerhed, estimerer besparelse, og fjerner proaktivt bekymringen om besværet.",
          },
          {
            text: "OK Fast giver dig fast pris i 12 måneder til 1,49 kr./kWh inkl. moms og afgifter.",
            quality: "ok" as const,
            points: 1,
            customerResponse: "Okay... og hvad er det sammenlignet med hvad jeg betaler nu?",
            feedback: "Du præsenterer produktet, men med specs — ikke koblet til kundens konkrete frustration om budgetforudsigelighed.",
          },
          {
            text: "Vi har OK Fast, OK Variabel og OK Grøn. Hvilken lyder bedst?",
            quality: "poor" as const,
            points: 0,
            customerResponse: "Grøn lyder godt... men hvad koster det?",
            feedback: "Du introducerer valgmuligheder igen efter at have forstået behovet — du ved at kunden vil have fast pris.",
          },
          {
            text: "Okay, prisen er god. Kan jeg tage dine oplysninger?",
            quality: "poor" as const,
            points: 0,
            customerResponse: "Hvad? Jeg har ikke sagt ja endnu.",
            feedback: "Du forsøger at lukke salget uden at have præsenteret løsningen ordentligt — kunden føler sig presset og trækker sig.",
          },
        ],
      },
      {
        customerLine: "Det lyder faktisk rigtig godt. Men er det ikke besværligt at skifte?",
        hint: "Brug LAER — anerkend bekymringen, efterforsk hvad de er bange for (reference det de sagde om ikke at ville bekymre sig), reager med 'og derfor tager vi os af det'.",
        hintTechnique: "LAER — Praktisk bekymring",
        choices: [
          {
            text: "Det er en helt normal bekymring — og jeg forstår godt du ikke vil bruge tid på det. Du fortalte mig at du ikke vil bekymre dig om strøm — at det bare skal virke uden du skal tænke over det. Det var vigtigt for dig, ik? ... Og derfor tager vi os præcis af det: vi melder dit skift til Ørsted, sørger for overgangsperioden og du har strøm hele vejen. Du skal intet gøre. Synes du det lyder som noget der er investeringen værd?",
            quality: "great" as const,
            points: 2,
            customerResponse: "Ja, det lyder faktisk rigtig nemt. Okay, så vil jeg gerne skifte.",
            feedback: "Perfekt LAER: du anerkendte + viste empati, efterforskede ved at referere det de sagde om ikke at ville bekymre sig, og reagerede med 'og derfor tager vi os af det'. Kunden lukkede sig selv.",
          },
          {
            text: "Det er slet ikke besværligt — vi tager os af alt. Skal vi gå videre?",
            quality: "ok" as const,
            points: 1,
            customerResponse: "Okay... men hvad sker der med min nuværende aftale hos Ørsted?",
            feedback: "Du afviser bekymringen i stedet for at anerkende den — kunden er ikke tryg og vil gerne vide mere. LAER-A mangler.",
          },
          {
            text: "Du skal bare give os dit CPR-nummer og vi opretter dig. Det tager 2 minutter.",
            quality: "poor" as const,
            points: 0,
            customerResponse: "Vent, jeg vil gerne vide mere om hvad der sker med min Ørsted-aftale.",
            feedback: "Du presser på afslutning uden at have håndteret bekymringen — kunden er ikke tryg og bremser processen.",
          },
          {
            text: "Ja, det kan godt være lidt besværligt. Men det er det værd.",
            quality: "poor" as const,
            points: 0,
            customerResponse: "Hmm... måske jeg undersøger det lidt mere selv.",
            feedback: "Du bekræfter at det er besværligt og tilbyder ingen løsning — kunden mister tryghed og vil tænke over det.",
          },
        ],
      },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function qualityLabel(q: Quality) {
  if (q === "great") return "Perfekt";
  if (q === "ok")    return "Nogenlunde";
  return "Misset";
}

function qualityColors(q: Quality) {
  if (q === "great") return { bg: "#f0fdf4", border: "#86efac", color: "#15803d" };
  if (q === "ok")    return { bg: "#fffbeb", border: "rgba(245,158,11,0.5)", color: "#92400e" };
  return                    { bg: "#fef2f2", border: "#fca5a5", color: "#dc2626" };
}

function starRating(score: number, max: number) {
  const pct = score / max;
  if (pct >= 0.93) return 5;
  if (pct >= 0.71) return 4;
  if (pct >= 0.50) return 3;
  if (pct >= 0.29) return 2;
  return 1;
}

function ratingLabel(stars: number) {
  if (stars === 5) return { label: "Mester-sælger!", color: "#15803d" };
  if (stars === 4) return { label: "Stærk indsats!", color: "#0369a1" };
  if (stars === 3) return { label: "Godt på vej", color: "#92400e" };
  if (stars === 2) return { label: "Mere træning", color: "#c2410c" };
  return                 { label: "Prøv igen", color: "#dc2626" };
}

// ─── Component ────────────────────────────────────────────────────────────────

type Screen = "select" | "playing" | "summary";

type RoundResult = {
  choiceIndex: number;
  quality: Quality;
  points: number;
  bestChoiceIndex: number;
};

export default function SalgsSpilTab() {
  const [screen, setScreen]         = useState<Screen>("select");
  const [scenario, setScenario]     = useState<Scenario | null>(null);
  const [round, setRound]           = useState(0);
  const [picked, setPicked]         = useState<number | null>(null);
  const [results, setResults]       = useState<RoundResult[]>([]);
  const [totalScore, setTotalScore] = useState(0);

  function startScenario(s: Scenario) {
    setScenario(s);
    setRound(0);
    setPicked(null);
    setResults([]);
    setTotalScore(0);
    setScreen("playing");
  }

  function pickChoice(idx: number) {
    if (picked !== null || !scenario) return;
    setPicked(idx);
    const c = scenario.rounds[round].choices[idx];
    const bestIdx = scenario.rounds[round].choices.findIndex(ch => ch.quality === "great");
    setResults(prev => [...prev, {
      choiceIndex: idx,
      quality: c.quality,
      points: c.points,
      bestChoiceIndex: bestIdx,
    }]);
    setTotalScore(prev => prev + c.points);
  }

  function nextRound() {
    if (!scenario) return;
    if (round + 1 >= scenario.rounds.length) {
      setScreen("summary");
    } else {
      setRound(r => r + 1);
      setPicked(null);
    }
  }

  function reset() {
    setScreen("select");
    setScenario(null);
    setPicked(null);
    setResults([]);
    setTotalScore(0);
    setRound(0);
  }

  if (screen === "select") return <SelectScreen onStart={startScenario} />;
  if (screen === "playing" && scenario) {
    return (
      <PlayScreen
        scenario={scenario}
        round={round}
        picked={picked}
        totalScore={totalScore}
        onPick={pickChoice}
        onNext={nextRound}
        onExit={reset}
      />
    );
  }
  if (screen === "summary" && scenario) {
    return (
      <SummaryScreen
        scenario={scenario}
        results={results}
        totalScore={totalScore}
        onRetry={() => startScenario(scenario)}
        onBack={reset}
      />
    );
  }
  return null;
}

// ─── Select Screen ────────────────────────────────────────────────────────────

function SelectScreen({ onStart }: { onStart: (s: Scenario) => void }) {
  return (
    <div style={{ maxWidth: 700, margin: "0 auto" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#1c1917", margin: "0 0 6px" }}>
          🎮 Salgs-spillet
        </h1>
        <p style={{ color: "#78716c", fontSize: 15, margin: 0, lineHeight: 1.6 }}>
          Vælg et scenarie, tag de rigtige beslutninger i samtalen — og se hvor god en sælger du er.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {SCENARIOS.map(s => (
          <button
            key={s.id}
            onClick={() => onStart(s)}
            style={{
              background: "#fff", border: `2px solid ${s.color}40`,
              borderRadius: 16, padding: "20px 22px", cursor: "pointer",
              textAlign: "left", transition: "all 0.15s",
              display: "flex", alignItems: "center", gap: 18,
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = s.color;
              (e.currentTarget as HTMLButtonElement).style.background = s.colorLight;
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = `${s.color}40`;
              (e.currentTarget as HTMLButtonElement).style.background = "#fff";
            }}
          >
            <div style={{
              width: 56, height: 56, borderRadius: 14, flexShrink: 0,
              background: `${s.color}18`, display: "flex",
              alignItems: "center", justifyContent: "center", fontSize: 26,
            }}>{s.emoji}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                <p style={{ fontSize: 17, fontWeight: 800, color: "#1c1917", margin: 0 }}>{s.title}</p>
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 99,
                  background: `${s.color}18`, color: s.color, border: `1.5px solid ${s.color}40`,
                }}>{s.subtitle}</span>
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 99,
                  background: s.difficulty === "Let" ? "#f0fdf4" : s.difficulty === "Mellem" ? "#fffbeb" : "#fef2f2",
                  color: s.difficulty === "Let" ? "#15803d" : s.difficulty === "Mellem" ? "#92400e" : "#dc2626",
                  border: `1.5px solid ${s.difficulty === "Let" ? "#86efac" : s.difficulty === "Mellem" ? "rgba(245,158,11,0.5)" : "#fca5a5"}`,
                }}>{s.difficulty}</span>
              </div>
              <p style={{ fontSize: 13, color: "#78716c", margin: "0 0 4px", lineHeight: 1.5 }}>{s.setup}</p>
              <p style={{ fontSize: 12, fontWeight: 600, color: s.color, margin: 0 }}>
                Mål: {s.goal}
              </p>
            </div>
            <div style={{ fontSize: 20, color: s.color, flexShrink: 0 }}>→</div>
          </button>
        ))}
      </div>

      <div style={{
        marginTop: 20, padding: "14px 18px", borderRadius: 12,
        background: "#fffbeb", border: "1.5px solid rgba(245,158,11,0.4)",
      }}>
        <p style={{ fontSize: 13, color: "#92400e", margin: 0, lineHeight: 1.6 }}>
          <strong>Sådan virker det:</strong> Du ser hvad kunden siger, vælger mellem 4 svar, og får feedback på hvert valg. Til sidst ser du en samlet score og en gennemgang af alle dine beslutninger.
        </p>
      </div>
    </div>
  );
}

// ─── Play Screen ──────────────────────────────────────────────────────────────

function PlayScreen({
  scenario, round, picked, totalScore,
  onPick, onNext, onExit,
}: {
  scenario: Scenario;
  round: number;
  picked: number | null;
  totalScore: number;
  onPick: (i: number) => void;
  onNext: () => void;
  onExit: () => void;
}) {
  const r = scenario.rounds[round];
  const maxSoFar = (round + (picked !== null ? 1 : 0)) * 2;
  const choiceLabels = ["A", "B", "C", "D"];

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", display: "flex", flexDirection: "column", gap: 14 }}>

      {/* Header */}
      <div style={{
        background: "#fff", border: `2px solid ${scenario.color}40`,
        borderRadius: 14, padding: "14px 18px",
        display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
      }}>
        <span style={{ fontSize: 22 }}>{scenario.emoji}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 14, fontWeight: 800, color: "#1c1917", margin: 0 }}>{scenario.title}</p>
          <p style={{ fontSize: 12, color: "#78716c", margin: 0 }}>Runde {round + 1} / {scenario.rounds.length}</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: 11, color: "#a8a29e", margin: 0 }}>Score</p>
            <p style={{ fontSize: 16, fontWeight: 800, color: scenario.color, margin: 0 }}>
              {totalScore} / {maxSoFar}
            </p>
          </div>
          <button onClick={onExit} style={{
            padding: "6px 12px", borderRadius: 8, cursor: "pointer",
            background: "#f5f4f2", border: "1.5px solid #e8e5e1",
            color: "#78716c", fontSize: 12, fontWeight: 600,
          }}>✕ Afslut</button>
        </div>
      </div>

      {/* Progress */}
      <div style={{ display: "flex", gap: 4 }}>
        {scenario.rounds.map((_, i) => (
          <div key={i} style={{
            height: 5, flex: 1, borderRadius: 3,
            background: i < round ? scenario.color : i === round ? `${scenario.color}55` : "#e8e5e1",
            transition: "background 0.3s",
          }} />
        ))}
      </div>

      {/* Customer bubble */}
      <div style={{
        background: "#f5f4f2", border: "2px solid #e8e5e1",
        borderRadius: 14, padding: "16px 18px",
        display: "flex", gap: 12, alignItems: "flex-start",
      }}>
        <span style={{
          width: 36, height: 36, borderRadius: "50%", background: "#e8e5e1",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 16, flexShrink: 0,
        }}>👤</span>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#a8a29e", textTransform: "uppercase", margin: "0 0 6px" }}>
            Kunden siger
          </p>
          <p style={{ color: "#1c1917", fontSize: 15, fontStyle: "italic", fontWeight: 500, margin: 0, lineHeight: 1.65 }}>
            &ldquo;{r.customerLine}&rdquo;
          </p>
        </div>
      </div>

      {/* Technique hint */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 12, color: "#a8a29e" }}>Teknik her:</span>
        <span style={{
          fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 99,
          background: `${scenario.color}15`, color: scenario.color,
          border: `1.5px solid ${scenario.color}40`,
        }}>{r.hintTechnique}</span>
        <span style={{ fontSize: 12, color: "#78716c" }}>— {r.hint}</span>
      </div>

      {/* Choices */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {r.choices.map((c, i) => {
          const isSelected = picked === i;
          const revealed = picked !== null;
          const qc = qualityColors(c.quality);

          let borderColor = "#e8e5e1";
          let bgColor = "#fff";
          if (revealed) {
            if (isSelected) {
              borderColor = qc.border;
              bgColor = qc.bg;
            } else if (c.quality === "great") {
              borderColor = "#86efac";
              bgColor = "#f0fdf4";
            }
          }

          return (
            <button
              key={i}
              onClick={() => onPick(i)}
              disabled={revealed}
              style={{
                background: bgColor, border: `2px solid ${borderColor}`,
                borderRadius: 12, padding: "14px 16px", cursor: revealed ? "default" : "pointer",
                textAlign: "left", transition: "all 0.15s",
                display: "flex", gap: 12, alignItems: "flex-start",
              }}
              onMouseEnter={e => {
                if (!revealed) {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = scenario.color;
                  (e.currentTarget as HTMLButtonElement).style.background = scenario.colorLight;
                }
              }}
              onMouseLeave={e => {
                if (!revealed) {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "#e8e5e1";
                  (e.currentTarget as HTMLButtonElement).style.background = "#fff";
                }
              }}
            >
              <span style={{
                width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
                background: revealed
                  ? (isSelected ? qc.color : c.quality === "great" ? "#15803d" : "#e8e5e1")
                  : scenario.color,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: 800,
                color: (revealed && !isSelected && c.quality !== "great") ? "#78716c" : "#fff",
              }}>{choiceLabels[i]}</span>
              <div style={{ flex: 1 }}>
                <p style={{
                  fontSize: 14, color: "#1c1917", margin: 0, lineHeight: 1.6,
                  fontStyle: "italic", fontWeight: 500,
                  opacity: revealed && !isSelected && c.quality !== "great" ? 0.6 : 1,
                }}>
                  &ldquo;{c.text}&rdquo;
                </p>
                {revealed && isSelected && (
                  <span style={{
                    display: "inline-block", marginTop: 6,
                    fontSize: 11, fontWeight: 800, padding: "2px 8px", borderRadius: 99,
                    background: qc.bg, color: qc.color, border: `1.5px solid ${qc.border}`,
                  }}>
                    {c.points === 2 ? "✓" : c.points === 1 ? "~" : "✕"} {qualityLabel(c.quality)} · {c.points} point
                  </span>
                )}
                {revealed && !isSelected && c.quality === "great" && (
                  <span style={{
                    display: "inline-block", marginTop: 6,
                    fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 99,
                    background: "#f0fdf4", color: "#15803d", border: "1.5px solid #86efac",
                  }}>
                    ← Optimalt svar
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Feedback panel after selection */}
      {picked !== null && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

          {/* Customer response */}
          <div style={{
            background: "#fff", border: "2px solid #e8e5e1",
            borderRadius: 12, padding: "14px 16px",
            display: "flex", gap: 10, alignItems: "flex-start",
          }}>
            <span style={{
              width: 32, height: 32, borderRadius: "50%", background: "#e8e5e1",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14, flexShrink: 0,
            }}>👤</span>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#a8a29e", textTransform: "uppercase", margin: "0 0 5px" }}>
                Kunden svarer
              </p>
              <p style={{ color: "#1c1917", fontSize: 14, fontStyle: "italic", fontWeight: 500, margin: 0, lineHeight: 1.65 }}>
                &ldquo;{r.choices[picked].customerResponse}&rdquo;
              </p>
            </div>
          </div>

          {/* Feedback */}
          <div style={{
            background: "#fafaf9", border: "2px solid #e8e5e1",
            borderLeft: `5px solid ${qualityColors(r.choices[picked].quality).color}`,
            borderRadius: 12, padding: "14px 18px",
          }}>
            <p style={{
              fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.3px",
              color: qualityColors(r.choices[picked].quality).color, margin: "0 0 6px",
            }}>
              {r.choices[picked].quality === "great" ? "✓ Hvorfor dette var det optimale svar" :
               r.choices[picked].quality === "ok" ? "~ Hvad der var godt og hvad der manglede" :
               "✕ Hvad der gik galt her"}
            </p>
            <p style={{ color: "#374151", fontSize: 14, lineHeight: 1.7, margin: 0 }}>
              {r.choices[picked].feedback}
            </p>
          </div>

          {/* Continue button */}
          <button onClick={onNext} style={{
            width: "100%", padding: "13px", borderRadius: 11,
            cursor: "pointer", background: scenario.color,
            color: "#fff", border: "none", fontSize: 14, fontWeight: 800,
          }}>
            {round + 1 < scenario.rounds.length ? `Runde ${round + 2} →` : "Se din score"}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Summary Screen ───────────────────────────────────────────────────────────

function SummaryScreen({
  scenario, results, totalScore,
  onRetry, onBack,
}: {
  scenario: Scenario;
  results: RoundResult[];
  totalScore: number;
  onRetry: () => void;
  onBack: () => void;
}) {
  const maxScore = scenario.rounds.length * 2;
  const stars = starRating(totalScore, maxScore);
  const rl = ratingLabel(stars);

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Score card */}
      <div style={{
        background: "#fff", border: `2px solid ${scenario.color}50`,
        borderRadius: 18, padding: "28px 24px", textAlign: "center",
      }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: scenario.color, margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.2px" }}>
          {scenario.emoji} {scenario.title} — Gennemført!
        </p>
        <div style={{ fontSize: 40, margin: "12px 0 8px" }}>
          {"★".repeat(stars)}{"☆".repeat(5 - stars)}
        </div>
        <p style={{ fontSize: 28, fontWeight: 900, color: rl.color, margin: "0 0 4px" }}>
          {totalScore} / {maxScore} point
        </p>
        <p style={{ fontSize: 16, fontWeight: 700, color: rl.color, margin: "0 0 16px" }}>
          {rl.label}
        </p>

        {/* Quick stats */}
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          {[
            { label: "Perfekte svar", count: results.filter(r => r.quality === "great").length, col: "#15803d", bg: "#f0fdf4", border: "#86efac" },
            { label: "Nogenlunde", count: results.filter(r => r.quality === "ok").length, col: "#92400e", bg: "#fffbeb", border: "rgba(245,158,11,0.5)" },
            { label: "Missede", count: results.filter(r => r.quality === "poor").length, col: "#dc2626", bg: "#fef2f2", border: "#fca5a5" },
          ].map(s => (
            <div key={s.label} style={{
              padding: "8px 16px", borderRadius: 10,
              background: s.bg, border: `1.5px solid ${s.border}`,
            }}>
              <p style={{ fontSize: 20, fontWeight: 900, color: s.col, margin: 0, lineHeight: 1 }}>{s.count}</p>
              <p style={{ fontSize: 11, fontWeight: 600, color: s.col, margin: "3px 0 0" }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Round breakdown */}
      <p style={{ fontSize: 13, fontWeight: 800, color: "#1c1917", margin: "4px 0 0", textTransform: "uppercase", letterSpacing: "0.1em" }}>
        Gennemgang — runde for runde
      </p>

      {results.map((res, i) => {
        const r = scenario.rounds[i];
        const picked = r.choices[res.choiceIndex];
        const best = r.choices[res.bestChoiceIndex];
        const qc = qualityColors(res.quality);
        const isPerfect = res.quality === "great";

        return (
          <div key={i} style={{
            background: "#fff", border: `2px solid ${isPerfect ? "#86efac" : "#e8e5e1"}`,
            borderRadius: 14, overflow: "hidden",
          }}>
            {/* Round header */}
            <div style={{
              background: isPerfect ? "#f0fdf4" : "#fafaf9",
              borderBottom: `1.5px solid ${isPerfect ? "#86efac" : "#e8e5e1"}`,
              padding: "12px 16px",
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{
                  width: 24, height: 24, borderRadius: "50%",
                  background: scenario.color, color: "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 800, flexShrink: 0,
                }}>{i + 1}</span>
                <p style={{ fontSize: 13, color: "#78716c", margin: 0, fontStyle: "italic" }}>
                  &ldquo;{r.customerLine.length > 70 ? r.customerLine.slice(0, 70) + "…" : r.customerLine}&rdquo;
                </p>
              </div>
              <span style={{
                fontSize: 11, fontWeight: 800, padding: "3px 10px", borderRadius: 99,
                background: qc.bg, color: qc.color, border: `1.5px solid ${qc.border}`,
              }}>
                {res.points === 2 ? "✓" : res.points === 1 ? "~" : "✕"} {qualityLabel(res.quality)} · {res.points}/2 point
              </span>
            </div>

            <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
              {/* What you said */}
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: "#a8a29e", textTransform: "uppercase", margin: "0 0 5px" }}>Du sagde</p>
                <p style={{
                  fontSize: 13, color: "#1c1917", margin: 0, lineHeight: 1.6,
                  fontStyle: "italic", fontWeight: 500,
                  padding: "10px 12px", borderRadius: 9,
                  background: qc.bg, border: `1.5px solid ${qc.border}`,
                }}>
                  &ldquo;{picked.text}&rdquo;
                </p>
              </div>

              {/* Feedback */}
              <p style={{ fontSize: 13, color: "#374151", margin: 0, lineHeight: 1.65 }}>
                {picked.feedback}
              </p>

              {/* Best answer if not perfect */}
              {!isPerfect && (
                <div style={{
                  background: "#f0fdf4", border: "1.5px solid #86efac",
                  borderRadius: 10, padding: "10px 14px",
                }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "#15803d", margin: "0 0 5px", textTransform: "uppercase" }}>
                    Optimalt svar her
                  </p>
                  <p style={{ fontSize: 13, color: "#1c1917", margin: 0, lineHeight: 1.6, fontStyle: "italic", fontWeight: 500 }}>
                    &ldquo;{best.text}&rdquo;
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Action buttons */}
      <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
        <button onClick={onRetry} style={{
          flex: 1, padding: "12px", borderRadius: 11, cursor: "pointer",
          background: scenario.color, color: "#fff", border: "none",
          fontSize: 14, fontWeight: 700,
        }}>↩ Prøv igen</button>
        <button onClick={onBack} style={{
          flex: 1, padding: "12px", borderRadius: 11, cursor: "pointer",
          background: "#fff", color: "#57534e",
          border: "2px solid #e8e5e1", fontSize: 14, fontWeight: 600,
        }}>← Vælg nyt scenarie</button>
      </div>
    </div>
  );
}
