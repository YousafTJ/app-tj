"use client";
import { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Speaker = "sælger" | "kunde" | "scene";

type Line = {
  speaker: Speaker;
  text: string;
  badge?: string;
  badgeColor?: string;
};

type Phase = {
  id: string;
  emoji: string;
  title: string;
  context: string;
  lines: Line[];
  insights: string[];
};

type Scenario = {
  id: string;
  emoji: string;
  title: string;
  subtitle: string;
  color: string;
  customer: string;
  product: string;
  phases: Phase[];
};

// ─── Data ────────────────────────────────────────────────────────────────────

const SCENARIOS: Scenario[] = [
  // ── SCENARIO 1: DYR COMPUTER ──────────────────────────────────────────────
  {
    id: "computer",
    emoji: "💻",
    title: "Den dyre computer",
    subtitle: "B2C butikssalg — MacBook Pro M3 Max, 24.999 kr.",
    color: "#a78bfa",
    customer: "Maria, 34 år, freelance grafisk designer",
    product: "MacBook Pro M3 Max — 36 GB RAM, 1 TB SSD",
    phases: [
      {
        id: "moede",
        emoji: "🤝",
        title: "Mødet & åbningen",
        context: "Maria er gået ind i elektronikbutikken. Hun kigger på de dyre laptops og virker som om hun ved hvad hun leder efter. Du har observeret hende i 2 minutter og kan se hun gentagne gange kigger på MacBook Pro-modellerne. Gå hen til hende — MEN start ikke med 'kan jeg hjælpe dig?'",
        lines: [
          { speaker: "scene", text: "Maria ser på en MacBook Pro display-model. Du nærmer dig med et smil." },
          { speaker: "sælger", text: "Hej! Hvordan går det?", badge: "Menneskelig åbning", badgeColor: "#a78bfa" },
          { speaker: "kunde", text: "Jo tak, bare kigger lidt rundt" },
          { speaker: "sælger", text: "Selvfølgelig. Vi har fået en del nye modeller ind. Er det til arbejde eller privat du kigger?", badge: "Qualifier — åbent spørgsmål", badgeColor: "#a78bfa" },
          { speaker: "kunde", text: "Til arbejdet faktisk. Min gamle er ved at give op" },
          { speaker: "sælger", text: "Arh okay — hvad laver du til daglig, hvis jeg må spørge?", badge: "Genuint interesse", badgeColor: "#a78bfa" },
          { speaker: "kunde", text: "Jeg er grafisk designer, freelance" },
          { speaker: "sælger", text: "Fedt arbejde! Hvad slags projekter arbejder du typisk med?", badge: "Graver dybere", badgeColor: "#a78bfa" },
          { speaker: "kunde", text: "Alt fra logo og branding til videoanimation — Photoshop, After Effects, Premiere" },
          { speaker: "sælger", text: "After Effects og Premiere — så er du ude i noget tungt renderingsarbejde?", badge: "Demonstrerer faglig viden", badgeColor: "#a78bfa" },
          { speaker: "kunde", text: "Ja, præcis. Det er faktisk en af de ting der frustrerer mig mest ved min nuværende" },
          { speaker: "scene", text: "Du har netop åbnet samtalen perfekt — ingen salgspres, genuint spørgsmål, og kunden åbnede selv op om sit problem. Produktet nævnes endnu ikke." },
        ],
        insights: [
          "'Kan jeg hjælpe dig?' inviterer til et automatisk 'nej tak'. Start med et personligt spørgsmål.",
          "Lad kunden tale om sig selv — folk elsker det, og du får uvurderlig information.",
          "Nævn ALDRIG produktet i åbningsfasen. Din eneste opgave er at forstå hvem de er.",
        ],
      },
      {
        id: "lytning",
        emoji: "👂",
        title: "Aktiv lytning",
        context: "Maria nævnte rendering som problem. Nu er din opgave at lytte dybt — ikke for at svare, men for at forstå fuldt ud. Brug kroppen. Hold øjenkontakt. Lad der komme pauser. Brug spejling og labeling til at få hende til at åbne sig mere.",
        lines: [
          { speaker: "sælger", text: "Renderingstid... hvad sker der præcist?", badge: "Aktiv lytning — spørg ind", badgeColor: "#818cf8" },
          { speaker: "kunde", text: "Den er bare evig langsom. En 2-minutters video tager 45 minutter at rende" },
          { speaker: "sælger", text: "45 minutter...?", badge: "Spejling — gentag de sidste ord", badgeColor: "#818cf8" },
          { speaker: "kunde", text: "Ja, bogstaveligt talt. Og det sker hver dag næsten" },
          { speaker: "scene", text: "[Du nikker langsomt, læner dig lidt frem, holder 3 sekunders pause]" },
          { speaker: "sælger", text: "Mmh... og hvad gør du mens den renderer?", badge: "Lyt til hvad de IKKE siger", badgeColor: "#818cf8" },
          { speaker: "kunde", text: "Sidder og venter. Jeg kan ikke gøre andet, den render-app låser næsten hele maskinen" },
          { speaker: "sælger", text: "Det lyder virkelig frustrerende", badge: "Labeling — sæt ord på følelsen", badgeColor: "#818cf8" },
          { speaker: "kunde", text: "Det er det! Og bagefter overheater den og bliver endnu langsommere i 20 minutter" },
          { speaker: "sælger", text: "Overheater... [nikker] Er det kun under rendering det sker?", badge: "Spørg ind til tøven", badgeColor: "#818cf8" },
          { speaker: "kunde", text: "Nej, faktisk også bare med Photoshop åbent. Batteriet holder heller ikke — 2 timer max nu" },
          { speaker: "sælger", text: "Kun 2 timer? Arbejder du meget ude af kontoret?", badge: "Fang alt", badgeColor: "#818cf8" },
          { speaker: "kunde", text: "Ja, hos kunder og på caféer. Det er faktisk et kæmpe problem" },
          { speaker: "scene", text: "Du har ikke sagt et ord om produktet. Alligevel har kunden nu fortalt dig ALLE de problemer du kan løse. Det er aktiv lytning i praksis." },
        ],
        insights: [
          "Spejling: gentag de 2-3 sidste ord i let spørgende tone. Kunden uddyber altid frivilligt.",
          "Labeling: 'Det lyder frustrerende' — kunden siger JA og uddyber. Du behøver ikke gætte, bare navngive hvad du ser.",
          "3-sekunders pausen: vent altid 3 sekunder efter kunden holder op. De tilføjer næsten altid noget vigtigt.",
          "70/30-reglen: Maria har talt 70% af samtalen. Perfekt.",
        ],
      },
      {
        id: "behov",
        emoji: "🎯",
        title: "Behovsafdækning — SPIN",
        context: "Nu bruger du SPIN systematisk til at grave dybere og gøre smerten synlig. Situationsspørgsmål hurtigt overstået (du ved allerede meget), problemspørgsmål for at bekræfte, og derefter implikationsspørgsmål — der er GULD. Afslut med need-payoff så kunden selv beskriver løsningens værdi.",
        lines: [
          { speaker: "scene", text: "SPIN-S: Situationsspørgsmål — forstå konteksten hurtigt" },
          { speaker: "sælger", text: "Hvilken model har du i dag, og hvornår er den fra?", badge: "SPIN-S: Situation", badgeColor: "#38bdf8" },
          { speaker: "kunde", text: "MacBook Pro 2019, den har 16 GB RAM" },
          { speaker: "sælger", text: "Og hvilke programmer er åbne typisk på en arbejdsdag?", badge: "SPIN-S: Kontekst", badgeColor: "#38bdf8" },
          { speaker: "kunde", text: "Photoshop, Illustrator, Premiere, After Effects — og Chrome med 20 tabs" },
          { speaker: "scene", text: "SPIN-P: Problemspørgsmål — bekræft og udvid problemerne" },
          { speaker: "sælger", text: "Hvad er den absolut største frustration du har med den computer i dag?", badge: "SPIN-P: Problem", badgeColor: "#f59e0b" },
          { speaker: "kunde", text: "Rendering-tid, overheatingen, og det dårlige batteri" },
          { speaker: "sælger", text: "Er der tidspunkter hvor computeren simpelthen siger stop og du ikke kan arbejde?", badge: "SPIN-P: Forstørr problemet", badgeColor: "#f59e0b" },
          { speaker: "kunde", text: "Ja! Forleden sad jeg hos en kunde og den slukkede fordi batteriet var fladt — super pinligt" },
          { speaker: "scene", text: "SPIN-I: Implikationsspørgsmål — gør konsekvenserne synlige og konkrete" },
          { speaker: "sælger", text: "Okay — hvad anslår du at du i alt mister af arbejdstid om dagen på grund af alt dette?", badge: "SPIN-I: Kvantificér tabet", badgeColor: "#f87171" },
          { speaker: "kunde", text: "Uff... nok halvanden til to timer" },
          { speaker: "sælger", text: "1,5-2 timer om dagen. Som freelancer — hvad ville du bruge den tid på?", badge: "SPIN-I: Forstør implikationen", badgeColor: "#f87171" },
          { speaker: "kunde", text: "Tage et ekstra projekt ind om måneden. Nemt." },
          { speaker: "sælger", text: "Hvad tjener du typisk på et projekt?", badge: "SPIN-I: Sæt kroner på", badgeColor: "#f87171" },
          { speaker: "kunde", text: "Varierer — men 8-15.000 kroner gennemsnitligt" },
          { speaker: "sælger", text: "Så computeren koster dig reelt 8-15.000 kroner om måneden i tabt omsætning?", badge: "SPIN-I: Kunden regner selv ud", badgeColor: "#f87171" },
          { speaker: "kunde", text: "Wow... ja, hvis man ser det sådan. Det har jeg faktisk aldrig regnet på" },
          { speaker: "scene", text: "SPIN-N: Need-Payoff — lad kunden male løsningens værdi med egne ord" },
          { speaker: "sælger", text: "Hvad ville det betyde for dig og din forretning, hvis rendering-problemer bare ikke eksisterede?", badge: "SPIN-N: Kunden beskriver løsningen", badgeColor: "#4ade80" },
          { speaker: "kunde", text: "Jeg kunne levere samme dag til kunder, tage flere projekter ind, og arbejde fra hvorsomhelst" },
          { speaker: "sælger", text: "Så i bund og grund — du ville have en konkurrencefordel over andre designere?", badge: "SPIN-N: Forstærk værdien", badgeColor: "#4ade80" },
          { speaker: "kunde", text: "Præcis! Det er faktisk en ret stor ting for mig" },
          { speaker: "scene", text: "Kunden har netop solgt produktet til sig selv. Du har ikke nævnt en eneste løsning endnu." },
        ],
        insights: [
          "SPIN-S: Brug kun 2-3 situationsspørgsmål. For mange signalerer manglende forberedelse.",
          "SPIN-I er magien: 'Hvad koster det dig i kroner?' Kunden siger selv 8-15.000 kr./md. Du behøver aldrig argumentere for prisen igen.",
          "SPIN-N: Lad dem male drømmescenariet. Det de selv siger, tror de på 100%.",
          "Tjek og tolk: 'Så computeren koster dig 8-15.000/md. i tabt omsætning' — bekræft din forståelse.",
        ],
      },
      {
        id: "relation",
        emoji: "💬",
        title: "Relationsopbygning",
        context: "Relationen bygges IGENNEM hele samtalen — ikke som et separat trin. Men her er et eksempel på et naturligt øjeblik der opstod undervejs, og en service promise der cementerer tilliden.",
        lines: [
          { speaker: "scene", text: "Du ser en nøglering med en golden retriever. Tøv ikke — spørg til den." },
          { speaker: "sælger", text: "Undskyld — er det en Golden Retriever på din nøglering?", badge: "Find fælles interesser", badgeColor: "#fb923c" },
          { speaker: "kunde", text: "Ja! Det er min hund Felix, han er 3 år" },
          { speaker: "sælger", text: "For en sød fyr! Jeg har selv en Labrador derhjemme — de er bare det bedste selskab", badge: "Fælles grundlag — relation skabt", badgeColor: "#fb923c" },
          { speaker: "kunde", text: "Er du hundeperson? [smiler og slapper af]" },
          { speaker: "sælger", text: "Total hundeperson. Felix lyder som en god arbejdsmakker på hjemmekontoret?" },
          { speaker: "kunde", text: "[griner] Han forstyrrer mere end han hjælper" },
          { speaker: "sælger", text: "[griner med] Det tror jeg på. Men lad os komme tilbage til din situation — jeg har faktisk lyst til at vise dig noget specifikt.", badge: "Naturlig overgang", badgeColor: "#fb923c" },
          { speaker: "scene", text: "Senere i samtalen — service promise der bygger massiv tillid" },
          { speaker: "sælger", text: "Jeg vil gerne være helt ærlig med dig om noget, Maria", badge: "Accusation Audit — afvæbn tvivl", badgeColor: "#fb923c" },
          { speaker: "kunde", text: "Okay?" },
          { speaker: "sælger", text: "Du kan sagtens finde billigere computere end det jeg er ved at vise dig — og det er okay, de er fine. Men ud fra det du har fortalt mig om din hverdag og hvad den tabt tid koster dig, er der én computer der giver mening for netop dig. Og du bestemmer selv om det giver mening bagefter.", badge: "Service promise — rådgiver ikke sælger", badgeColor: "#fb923c" },
          { speaker: "kunde", text: "Det sætter jeg pris på. Vis mig den." },
          { speaker: "scene", text: "Kunden er åben, afslappet og klar til at lytte. Tilliden er etableret." },
        ],
        insights: [
          "Detaljer som nøgleringe, billeder og kommentarer åbner samtaler. Vær nysgerrig og spontan.",
          "Humor er korteste vej til sympati — én naturlig joke gør dig menneskelig.",
          "Service promise: 'Jeg skal nok finde den bedste løsning til dig' — sagt med overbevisning. Det er guld.",
          "Accusation Audit: nævn selv det kunden måske frygter (billigere alternativer). Det afvæbner skepsis.",
        ],
      },
      {
        id: "pitch",
        emoji: "💡",
        title: "Pitch & præsentation",
        context: "Nu — og kun nu — præsenterer du produktet. Ikke features. Fordele der løser de specifikke problemer Maria selv nævnte. Afslut med MMM (Make Money Minimal) der gør prisen ubetydelig sammenlignet med værdien.",
        lines: [
          { speaker: "scene", text: "Du fører Maria hen til MacBook Pro M3 Max." },
          { speaker: "sælger", text: "Ud fra alt du har fortalt mig, er der én maskine der rammer præcis det du har brug for: MacBook Pro M3 Max med 36 GB unified memory.", badge: "Pitch baseret på behovet", badgeColor: "#a78bfa" },
          { speaker: "sælger", text: "M3 Max-chippen gør After Effects renders op til 8-10 gange hurtigere end din nuværende 2019-model. Den 2-minutters video der tager 45 minutter? Det er 4-6 minutter.", badge: "Feature → konkret benefit", badgeColor: "#a78bfa" },
          { speaker: "kunde", text: "Seriøst? 4-6 minutter?" },
          { speaker: "sælger", text: "Ja. Og unified memory betyder at Photoshop, Illustrator, Premiere og After Effects alle kører fuldt ud SAMTIDIG — ingen throttling, ingen overheating. Den varmer ikke op under normale arbejdsforhold.", badge: "Adressér specifikt problem: overheating", badgeColor: "#a78bfa" },
          { speaker: "sælger", text: "Batteri: 22 timers batteritid. Du kan sidde hos en kunde hele dagen og arbejde i After Effects uden at tænke på strøm.", badge: "Adressér specifikt problem: batteri", badgeColor: "#a78bfa" },
          { speaker: "kunde", text: "Det lyder faktisk for godt til at være sandt..." },
          { speaker: "sælger", text: "Jeg forstår det godt — men tallene lyver heldigvis ikke. [smiler] Og faktisk — jeg hjalp en designer for 3 måneder siden, Maria ligesom dig, freelancer. Hun fortalte mig efter 2 uger at hun allerede havde taget 2 ekstra projekter ind fordi hun pludselig HAD tid til det.", badge: "Social proof — matchende kundeprofil", badgeColor: "#a78bfa" },
          { speaker: "scene", text: "Nu: MMM — gør den store pris lille" },
          { speaker: "sælger", text: "Prisen er 24.999 kroner. Det lyder som meget på én gang — men lad os sætte det i perspektiv.", badge: "MMM — Make Money Minimal", badgeColor: "#a78bfa" },
          { speaker: "sælger", text: "Du sagde selv computeren koster dig 8-15.000 i tabt omsætning om måneden. Lad os være konservative og sige 8.000.", badge: "Brug kundens egne tal", badgeColor: "#a78bfa" },
          { speaker: "sælger", text: "Computeren er en investering over 5 år — det er 417 kroner om måneden. Versus 8.000 i tabt omsætning om måneden. Det vil sige den betaler sig selv 19 gange om måneden.", badge: "Regnestykket: 417 kr. vs. 8.000 kr.", badgeColor: "#a78bfa" },
          { speaker: "sælger", text: "Ville det være en dårlig forretningsbeslutning at betale 417 kr. om måneden for at tjene 8.000 ekstra?", badge: "Ville det være en dum idé?", badgeColor: "#a78bfa" },
          { speaker: "kunde", text: "Nej... nej det ville det ikke" },
        ],
        insights: [
          "Pitch ALTID behovsorienteret: 'Du sagde X er et problem — her er præcis hvorfor dette løser X.'",
          "MMM: bryd prisen ned til månedspris (417 kr.) og still den op mod tab de selv kvantificerede (8.000 kr.).",
          "Social proof virker bedst når kunden kan genkende sig selv: 'En designer ligesom dig...'",
          "Stil spørgsmål der bekræfter: 'Ville det være en dårlig beslutning?' — næsten umuligt at sige ja til.",
        ],
      },
      {
        id: "indvendinger",
        emoji: "🛡️",
        title: "Indvendingshåndtering",
        context: "Maria giver to klassiske indvendinger: pris og tænke-over-det. Begge håndteres med LAER + Feel-Felt-Found. Husk: prisen er sjældent det reelle problem.",
        lines: [
          { speaker: "scene", text: "Indvending 1: Prisen" },
          { speaker: "kunde", text: "25.000 kroner er bare mange penge på én gang" },
          { speaker: "sælger", text: "Jeg forstår at det er en stor sum på én gang.", badge: "LAER-L: Lyt og LAER-A: Anerkend", badgeColor: "#f59e0b" },
          { speaker: "sælger", text: "Det er en investering der mærkes — det er naturligt at pause ved den.", badge: "LAER-E: Empati", badgeColor: "#f59e0b" },
          { speaker: "sælger", text: "Hvad er det ved prisen der giver dig tøven — er det den samlede sum, eller er du usikker på om du faktisk får det regnestykke vi snakkede om?", badge: "LAER-E: Udforsk den reelle årsag", badgeColor: "#f59e0b" },
          { speaker: "kunde", text: "Mest den samlede sum — likviditeten lige nu" },
          { speaker: "sælger", text: "Det giver mening. Mange af mine kunder der arbejder freelance har det samme udfordring med likviditet. Det de fandt ud af, var at vores 0%-finansiering over 12 måneder løste det fuldstændigt — 2.083 kroner om måneden, nul rente.", badge: "Feel-Felt-Found + løsning", badgeColor: "#f59e0b" },
          { speaker: "sælger", text: "Og du sagde selv du kan tjene 8.000 ekstra om måneden. Så du er i plus fra dag ét — selv om du betaler 2.083.", badge: "LAER-R: Reager med løsning", badgeColor: "#f59e0b" },
          { speaker: "kunde", text: "Hmm... 0% rente? Det vidste jeg ikke I tilbød" },
          { speaker: "scene", text: "Indvending 2: Skal tænke over det" },
          { speaker: "kunde", text: "Jeg tænker jeg tager hjem og sover på det" },
          { speaker: "sælger", text: "Selvfølgelig — det er en god størrelse beslutning. Bare lige hurtigt, hvad er det specifikt du vil tænke over?", badge: "Find den REELLE indvending", badgeColor: "#f59e0b" },
          { speaker: "kunde", text: "Egentlig... om det er det rigtige tidspunkt" },
          { speaker: "sælger", text: "Forstår det. Hvad er dit næste store projekt, og hvornår er deadline?", badge: "Urgency gennem pain, ikke pres", badgeColor: "#f59e0b" },
          { speaker: "kunde", text: "Jeg har faktisk en stor kampagne der skal leveres om 3 uger" },
          { speaker: "sælger", text: "Og du ville bruge den på din nuværende computer der tager 45 minutter per render?", badge: "Status quo er ikke neutral", badgeColor: "#f59e0b" },
          { speaker: "kunde", text: "[pause] ...god pointe" },
          { speaker: "sælger", text: "Jeg vil ikke presse dig. Men hvad nu hvis du starter kampagnen og computeren giver op på dag 3? Hvad er din plan B?", badge: "Plan B-close", badgeColor: "#f59e0b" },
          { speaker: "kunde", text: "Jeg har ingen plan B. Det har du ret i." },
        ],
        insights: [
          "LAER: Anerkend ALTID før du argumenterer. Aldrig gå direkte i forsvar.",
          "'Hvad er det specifikt du vil tænke over?' — aldrig lad tænk-over-det stå uudforsket.",
          "Urgency: nævn det kommende projekt. Kunden skaber selv urgency når de indser plan B ikke eksisterer.",
          "Prisen er sjældent det reelle problem: her var det likviditet — løst med finansiering.",
        ],
      },
      {
        id: "closing",
        emoji: "✅",
        title: "Closing",
        context: "Kunden er klar. Brug trinvis close (giver det mening → kan det hjælpe → skal vi gå videre), alternativ close på betaling, og lad aldrig stilheden fyldes med overflødige ord.",
        lines: [
          { speaker: "scene", text: "Trial close — temperaturcheck" },
          { speaker: "sælger", text: "Ud fra alt vi har snakket om — føler du at den her computer giver mening for det du laver?", badge: "Trial close", badgeColor: "#4ade80" },
          { speaker: "kunde", text: "Ja, det synes jeg faktisk" },
          { speaker: "sælger", text: "Og alt det vi gennemgik — rendering, batteriet, projekterne — er det noget du tror vil gøre en reel forskel for dig dagligt?", badge: "Bekræft værdien", badgeColor: "#4ade80" },
          { speaker: "kunde", text: "Ja, absolut" },
          { speaker: "scene", text: "Trinvis close — tre ja'er leder naturligt til det fjerde" },
          { speaker: "sælger", text: "Fedt. Og givet at du har den der kampagne om 3 uger — giver det mening at sikre sig den rigtige maskine nu?", badge: "Urgency naturligt indlejret", badgeColor: "#4ade80" },
          { speaker: "kunde", text: "Ja, det giver egentlig meget god mening" },
          { speaker: "scene", text: "Alternativ close — giv valget mellem to ja'er" },
          { speaker: "sælger", text: "Perfekt. Vil du betale på én gang, eller vil du bruge den 12-måneders 0%-finansiering vi snakkede om?", badge: "Alternativ close — begge er ja", badgeColor: "#4ade80" },
          { speaker: "kunde", text: "Finansieringen giver mest mening for mig" },
          { speaker: "sælger", text: "Godt valg — så finder vi papirerne. Og mens vi gør det: er der noget tilbehør du vil have kigget på? Vi har et godt cover til den, og en USB-C hub der er designet til den model.", badge: "Upsell naturligt", badgeColor: "#4ade80" },
          { speaker: "kunde", text: "Ja vis mig gerne det" },
          { speaker: "scene", text: "Salget er lukket. Maria forlader butikken med en MacBook Pro M3 Max, USB-C hub og cover. Du løste hendes problemer — du solgte aldrig en computer." },
        ],
        insights: [
          "Trinvis close: tre ja'er (mening → hjælper → videre) gør det fjerde ja til det logiske næste skridt.",
          "Alternativ close: 'Betaler du på én gang eller med finansiering?' — begge svar er et ja. Ingen ja/nej.",
          "Upsell ALTID naturligt efter close. Kunden er i købs-mode og åben for relaterede løsninger.",
          "Den bedste close er den kunden ikke mærker — fordi svaret var åbenlyst fra begyndelsen.",
        ],
      },
    ],
  },

  // ── SCENARIO 2: ABONNEMENT-SKIFTE ─────────────────────────────────────────
  {
    id: "abonnement",
    emoji: "📧",
    title: "Abonnements-skifte",
    subtitle: "B2B opkald — skifte fra basis newsletter til marketing automation",
    color: "#38bdf8",
    customer: "Thomas, 41 år, marketing manager, 80-personers virksomhed",
    product: "Marketing automation platform — 4.900 kr./md.",
    phases: [
      {
        id: "moede",
        emoji: "🤝",
        title: "Åbningen — cold call",
        context: "Du ringer til Thomas der er marketing manager. Han bruger et billigt newsletter-system til 299 kr./md. Han forventer et salgspitch og er på vagt. Din opgave: nedlæg salgsvagten HURTIGT og positionér dig som nysgerrig rådgiver, ikke sælger.",
        lines: [
          { speaker: "scene", text: "Thomas tager telefonen. Han lyder lidt kortfattet." },
          { speaker: "sælger", text: "Hej Thomas, det er Mikkel fra MarketFlow. Jeg ringer fordi vi arbejder med en del marketingteams i din branche — og jeg vil ikke bruge mere end 5 minutter af din tid, for jeg ved faktisk ikke om det giver mening for jer endnu.", badge: "Nedlæg salgsvagten", badgeColor: "#38bdf8" },
          { speaker: "kunde", text: "Okay... hvad drejer det sig om?" },
          { speaker: "sælger", text: "Det drejer det sig om: de fleste marketingteams i jeres størrelse bruger 3-4 separate værktøjer der ikke snakker sammen — newsletter her, analytics der, lead tracking et andet sted. Genkender du det billede?", badge: "Challenger — præsentér indsigt", badgeColor: "#38bdf8" },
          { speaker: "kunde", text: "Hmm... ja, det er faktisk lidt tilfældet hos os" },
          { speaker: "sælger", text: "Jeg tænkte det. Må jeg stille dig et enkelt spørgsmål?", badge: "Bed om tilladelse — respektfuldt", badgeColor: "#38bdf8" },
          { speaker: "kunde", text: "Ja, det må du gerne" },
          { speaker: "sælger", text: "Hvad er den ting i jeres marketing setup der giver dig mest hovedpine i øjeblikket?", badge: "Åbent spørgsmål — lad dem åbne op", badgeColor: "#38bdf8" },
          { speaker: "kunde", text: "Ærlig talt... vi kan ikke se hvem der konverterer fra vores emails til faktiske salg. Det er et sort hul." },
          { speaker: "sælger", text: "Et sort hul — det er præcis det jeg hørte fra de fleste jeg snakkede med. Jeg tror vi har noget at snakke om. Har du 20 minutter næste uge til en kort samtale?", badge: "Afslut med konkret næste skridt", badgeColor: "#38bdf8" },
          { speaker: "kunde", text: "Ja, torsdag morgen fungerer" },
        ],
        insights: [
          "'Jeg ved faktisk ikke om det giver mening for jer endnu' — dette sænker temperaturen øjeblikkeligt.",
          "Challenger-åbning: præsentér en indsigt kunden genkender. De føler sig forstået, ikke solgt til.",
          "Bed aldrig om et møde for at 'præsentere din løsning'. Bed om at 'se om I kan hjælpe'.",
          "Mål for cold call: et møde, ikke et salg.",
        ],
      },
      {
        id: "lytning",
        emoji: "👂",
        title: "Aktiv lytning — mødet",
        context: "Torsdag. Du sidder til møde med Thomas. Lad ham tale. Du har forberedt dig — du kender branchen og hans virksomhed fra LinkedIn og hjemmeside. Brug det til at stille skarpe spørgsmål.",
        lines: [
          { speaker: "scene", text: "I starter mødet. Du har lavet research: Thomas' virksomhed solgte 12% mere end sidste år, de annoncerede en ny produktlinje forrige måned." },
          { speaker: "sælger", text: "Thomas, jeg så I lancerede en ny produktlinje i marts. Spændende — hvad er marketingstrategien bag den?", badge: "Demonstrér research", badgeColor: "#818cf8" },
          { speaker: "kunde", text: "Vi prøver at nå en yngre målgruppe, så vi har lavet en hel emailkampagne. Men det er svært at se om det virker." },
          { speaker: "sælger", text: "Svært at se om det virker...?", badge: "Spejling", badgeColor: "#818cf8" },
          { speaker: "kunde", text: "Ja, vi kan se at folk åbner og klikker, men om de faktisk ender med at købe — det ved vi ikke." },
          { speaker: "sælger", text: "Mmh. [pause] Og hvad gør I i dag for at prøve at koble det?", badge: "Spørg ind — lyt til løsningen de prøver", badgeColor: "#818cf8" },
          { speaker: "kunde", text: "Vi downloader eksportdata manuelt fra newsletter-systemet og prøver at matche det med vores salgsdata i Excel. Det er tidskrævende og upræcist." },
          { speaker: "sælger", text: "Det lyder frustrerende at arbejde i blinde på den måde — når man ved at pengene er brugt men ikke om de arbejder.", badge: "Labeling", badgeColor: "#818cf8" },
          { speaker: "kunde", text: "Præcis. Og chefen begynder at stille spørgsmål til vores marketing-budget." },
          { speaker: "scene", text: "Guldoplysning: chefen sætter spørgsmålstegn ved budgettet. Nu ved du hvad der reelt driver behovet: Thomas skal bevise sin ROI." },
          { speaker: "sælger", text: "Forstår det godt. Hvad sker der hvis I ikke kan dokumentere ROI af marketingkronerne næste kvartal?", badge: "Lyt til hvad der ikke siges", badgeColor: "#818cf8" },
          { speaker: "kunde", text: "...budgettet bliver sandsynligvis skåret" },
        ],
        insights: [
          "Research skaber øjeblikkelig troværdighed — 'Jeg så I lancerede...' åbner samtalen.",
          "Lyt efter den skjulte driver: Thomas' reelle problem er ikke email-tracking, det er at bevise sin ROI over for chefen.",
          "Labeling virker dobbelt: det validerer følelsen OG afslører dybere motivationer.",
        ],
      },
      {
        id: "behov",
        emoji: "🎯",
        title: "Behovsafdækning — SPIN + MEDDIC",
        context: "Nu graver du systematisk med SPIN og kvalificerer med MEDDIC. Du skal forstå: hvem beslutter? hvad er budgettet? hvad er tidslinjen? og hvad er de præcise kriterier?",
        lines: [
          { speaker: "scene", text: "SPIN — Situation" },
          { speaker: "sælger", text: "Hvad bruger I i dag af marketing-værktøjer, og hvad koster de samlet?", badge: "SPIN-S + Budget hint", badgeColor: "#38bdf8" },
          { speaker: "kunde", text: "MailChimp til 299 kr., Google Analytics gratis, og vi bruger Hubspot til lead-tracking til 1.800 kr. I alt 2.100 kr. om måneden" },
          { speaker: "scene", text: "SPIN — Problem" },
          { speaker: "sælger", text: "Hvad er den største tekniske frustration med det setup i dag?", badge: "SPIN-P", badgeColor: "#f59e0b" },
          { speaker: "kunde", text: "Ingenting snakker sammen. Tre systemer, ingen integration, manuel eksport hele vejen" },
          { speaker: "scene", text: "SPIN — Implication" },
          { speaker: "sælger", text: "Hvad koster det jer i timer om måneden at holde det her manuelt oppe at køre?", badge: "SPIN-I: Kvantificér", badgeColor: "#f87171" },
          { speaker: "kunde", text: "Hm... mig og min kollega bruger nok 6-8 timer hver om måneden bare på at lave de der Excel-rapporter" },
          { speaker: "sælger", text: "Og hvad koster en time af jer to?", badge: "SPIN-I: Sæt kroner på", badgeColor: "#f87171" },
          { speaker: "kunde", text: "Lad os sige 400 kroner timen" },
          { speaker: "sælger", text: "Så I bruger 4.800-6.400 kroner om måneden på noget der ikke engang giver præcise data?", badge: "SPIN-I: Kunden ser selv", badgeColor: "#f87171" },
          { speaker: "kunde", text: "...det havde jeg ikke regnet på. Det er jo faktisk dyrt." },
          { speaker: "scene", text: "MEDDIC — Economic Buyer og Decision Process" },
          { speaker: "sælger", text: "Hvem er det der i sidste ende godkender en investering som denne her?", badge: "MEDDIC: Economic Buyer", badgeColor: "#a78bfa" },
          { speaker: "kunde", text: "Det er min chef, CMO'en. Men han lytter til mig." },
          { speaker: "sælger", text: "Og hvad er det vigtigste for ham — ROI-dokumentation, eller at systemet er nemt at bruge?", badge: "MEDDIC: Decision Criteria", badgeColor: "#a78bfa" },
          { speaker: "kunde", text: "ROI, klart. Han vil se at marketingkronerne arbejder" },
          { speaker: "sælger", text: "Hvornår skal I typisk have beslutninger som denne godkendt — er der et budget-review forude?", badge: "MEDDIC: Timeline", badgeColor: "#a78bfa" },
          { speaker: "kunde", text: "Faktisk ja — vi har Q3-review om 6 uger. Og der skal jeg præsentere marketingplan" },
          { speaker: "scene", text: "Du har nu MEDDIC-billedet: Thomas er champion, CMO er Economic Buyer, ROI er kriteriet, Q3-review er deadline." },
        ],
        insights: [
          "SPIN-I: Manuel Excel-arbejde = 4.800-6.400 kr./md. Det er større end dit produkt (4.900 kr.). Prisen er allerede vundet.",
          "MEDDIC: Find altid Economic Buyer tidligt. Thomas siger 'han lytter til mig' — du har en champion.",
          "Timeline-spørgsmål afslører naturlig urgency: Q3-review om 6 uger er et deadline der ikke kommer fra dig.",
        ],
      },
      {
        id: "relation",
        emoji: "💬",
        title: "Relationsopbygning — Champion-strategi",
        context: "Thomas er din champion — han skal sælge løsningen internt til CMO'en. Din opgave er at hjælpe Thomas se sig selv som løsningens helt, ikke bare en bruger. Giv ham ammunition til den interne samtale.",
        lines: [
          { speaker: "sælger", text: "Thomas, jeg vil gerne stille dig et direkte spørgsmål.", badge: "Direkte og ærlig", badgeColor: "#38bdf8" },
          { speaker: "kunde", text: "Ja, bare spørg" },
          { speaker: "sælger", text: "Hvis du kunne gå ind til Q3-review og vise chefen præcis hvilke emails der genererede hvilke salg — ned til krone og produkt — hvad ville det betyde for dig?", badge: "SPIN-N: Kunden maler sin drøm", badgeColor: "#38bdf8" },
          { speaker: "kunde", text: "[tænker] Det ville ændre hele samtalen. Fra at forsvare budgettet til at vise at marketing er en forretningsdriver" },
          { speaker: "sælger", text: "Fra at forsvare til at bevise. Det er faktisk en ret stor forskel for din position, ikke?", badge: "Forstærk kundens vision", badgeColor: "#38bdf8" },
          { speaker: "kunde", text: "Ja... det er det faktisk" },
          { speaker: "sælger", text: "Og en anden ting jeg vil være ærlig om: vi er ikke billigst på markedet. Der er nok noget til 1.500 kroner. Men det har ikke den tracking-integration du har brug for. Vil du se hvad den konkrete forskel er?", badge: "Nævn alternativet selv — Accusation Audit", badgeColor: "#38bdf8" },
          { speaker: "kunde", text: "Ja, vis mig hvad I kan der ikke er der" },
          { speaker: "scene", text: "Du har nu Thomas som aktiv partner, ikke passiv lytter. Han vil hjælpe med at sælge det internt." },
        ],
        insights: [
          "Champion-strategi: hjælp Thomas se sig selv som helten der bringer en forretningsdriver til chefen.",
          "Nævn selv konkurrenten — det viser du er ærlig og ved at du kan levere det der skiller sig ud.",
          "SPIN-N til champion: 'Hvad ville det betyde for DIG?' — gør det personligt relevant.",
        ],
      },
      {
        id: "pitch",
        emoji: "💡",
        title: "Pitch & demo",
        context: "Pitchen er kort og skarpt. Maksimalt 3 fordele der matcher de 3 problemer du afdækkede. Vis en demo der direkte adresserer 'sort hullet'. Forbered Thomas til CMO-mødet.",
        lines: [
          { speaker: "sælger", text: "Det I mangler er ét system der kobler email-adfærd direkte til salgsdata i realtid. Det er præcis hvad MarketFlow gør.", badge: "Start med problemet, ikke featuren", badgeColor: "#38bdf8" },
          { speaker: "sælger", text: "Konkret: du sender en emailkampagne. En modtager klikker på produkt X. 3 dage senere køber de det. MarketFlow viser dig: email nummer 2 i sekvensen genererede 47 køb til en samlet omsætning på 94.000 kroner. I realtid.", badge: "Konkret usecase — jeres situation", badgeColor: "#38bdf8" },
          { speaker: "kunde", text: "Det er præcis hvad jeg ikke kan se i dag" },
          { speaker: "sælger", text: "Og i stedet for 3 systemer der ikke taler sammen, er det ét dashboard. De 6-8 timer du bruger på Excel om måneden, er de nede på 30 minutter.", badge: "Adressér konkret tidstab", badgeColor: "#38bdf8" },
          { speaker: "sælger", text: "Prisen er 4.900 kroner om måneden. Men du betaler i dag 2.100 kr. i systemer PLUS 4.800-6.400 kr. i mandetimer. Det er 6.900-8.500 kr. samlet — for et system der ikke virker. Vi er billigere end det du har i dag.", badge: "Total cost of ownership — ikke sticker price", badgeColor: "#38bdf8" },
          { speaker: "kunde", text: "Okay, det argument forstår jeg" },
          { speaker: "sælger", text: "Og til dit Q3-review: jeg kan give dig en rapport-template der viser CHO præcis hvilke kanaler der driver omsætning. Det er præcis det argument du har brug for.", badge: "Giv champion ammunition", badgeColor: "#38bdf8" },
          { speaker: "kunde", text: "Det ville faktisk være sindssygt nyttigt" },
        ],
        insights: [
          "Pitch aldrig mere end 3 pointer. Alt andet støj.",
          "Total cost of ownership: 4.900 kr. vs. 6.900-8.500 kr. (nuværende setup inkl. mandetimer). Du er billigst.",
          "Giv champion ammunition: rapport-template er ikke salgstrick — det hjælper Thomas vinde internt.",
        ],
      },
      {
        id: "indvendinger",
        emoji: "🛡️",
        title: "Indvendingshåndtering",
        context: "Thomas har to indvendinger: 'vi bruger allerede en løsning' og 'jeg skal have chefen med'. Begge er klassiske — og begge er håndterbare med de rigtige teknikker.",
        lines: [
          { speaker: "scene", text: "Indvending 1: Vi har allerede en løsning" },
          { speaker: "kunde", text: "Vi er egentlig okay med det vi har — det har bare fungeret i 2 år" },
          { speaker: "sælger", text: "MailChimp er et solidt system til det det er designet til. Og jeg ville ikke foreslå at skifte hvis det dækkede jeres behov. [pause] Men du nævnte selv at det sort hul — email til salg — er en kæmpe frustration. Har I fundet en måde at løse den på med det nuværende setup?", badge: "Anerkend konkurrenten, gå til åbent sår", badgeColor: "#f59e0b" },
          { speaker: "kunde", text: "Nej, det er vi aldrig kommet tæt på" },
          { speaker: "sælger", text: "Og det er præcis det den her løsning er bygget til — ikke at erstatte det der virker, men at lukke det hul der koster jer 4.800 kr. om måneden og holder jer fra at bevise jeres ROI.", badge: "Repositionér som tillæg, ikke replacement", badgeColor: "#f59e0b" },
          { speaker: "scene", text: "Indvending 2: Jeg skal have chefen med" },
          { speaker: "kunde", text: "Det lyder godt, men jeg skal have min CMO med i beslutningen" },
          { speaker: "sælger", text: "Selvfølgelig — og det er præcis det rigtige at gøre. Hvad tror du er den største bekymring CMO'en vil have?", badge: "Find chefens indvending i forvejen", badgeColor: "#f59e0b" },
          { speaker: "kunde", text: "Sandsynligvis om det faktisk kan kobles til vores salgsdata — om integrationen virker" },
          { speaker: "sælger", text: "Godt at vide. Hvad hvis vi sætter et 20-minutters opkald op med dig og din CMO, hvor jeg specifikt viser den Shopify/salgsintegration? Jeg sørger for at svare præcis på det han vil spørge til.", badge: "Proaktiv three-way", badgeColor: "#f59e0b" },
          { speaker: "kunde", text: "Det ville faktisk gøre det lettere. Han har meget lidt tid så 20 minutter passer." },
        ],
        insights: [
          "Anerkend altid konkurrenten. 'MailChimp er et godt system' — og gå derefter direkte til det det IKKE kan.",
          "'Jeg skal have chefen med' er ikke en afvisning — det er en invitation. Tilbyd at deltage i samtalen.",
          "Find chefens indvending i forvejen via Thomas. Kom forberedt til det møde.",
        ],
      },
      {
        id: "closing",
        emoji: "✅",
        title: "Closing — Opsummerings-close",
        context: "B2B kræver opsummerings-close — der er mange punkter aftalt undervejs. Opsummér alt, bekræft, og bed om næste konkrete skridt. Sæt datoer — altid.",
        lines: [
          { speaker: "sælger", text: "Lad mig opsummere hvad vi har aftalt, Thomas.", badge: "Opsummerings-close", badgeColor: "#4ade80" },
          { speaker: "sælger", text: "Vi er enige om at jeres nuværende setup koster jer 6.900-8.500 kr. om måneden i systemer og mandetimer — og ikke giver jer det overblik I har brug for.", badge: "Bekræft problem", badgeColor: "#4ade80" },
          { speaker: "sælger", text: "Vi er enige om at du har et Q3-review om 6 uger hvor du skal bevise marketing-ROI over for din CMO.", badge: "Bekræft urgency", badgeColor: "#4ade80" },
          { speaker: "sælger", text: "Og vi er enige om at MarketFlow løser præcis det problem til en total cost der er lavere end hvad I betaler i dag.", badge: "Bekræft løsning + økonomi", badgeColor: "#4ade80" },
          { speaker: "sælger", text: "Er der noget i den opsummering der ikke stemmer?", badge: "Giv chance for korrektion", badgeColor: "#4ade80" },
          { speaker: "kunde", text: "Nej, det fanger du rigtigt" },
          { speaker: "sælger", text: "Fedt. Så foreslår jeg: vi sætter CMO-mødet til næste onsdag — 20 minutter — og hvis det giver mening, kan I starte en 30-dages gratis pilot til Q3-review. Hvornår passer din CMO bedst?", badge: "Konkret næste skridt + pilot som low-risk entry", badgeColor: "#4ade80" },
          { speaker: "kunde", text: "Onsdag eftermiddag fungerer sandsynligvis. Jeg vender tilbage i morgen med en tid." },
          { speaker: "sælger", text: "Perfekt. Jeg sender dig en kalender-invite med agenda og den demo-rapport-template vi snakkede om — så I begge er klar.", badge: "Luk med konkret action", badgeColor: "#4ade80" },
          { speaker: "scene", text: "CMO-mødet er sat. 30-dages pilot er aftalt som næste skridt. Thomas har ammunition til intern salg. Salget er 80% lukket." },
        ],
        insights: [
          "Opsummerings-close virker bedst i B2B: list alt aftalt, bekræft, og bed om næste handling — ikke en underskrift endnu.",
          "Pilot/gratis trial: fjerner risikoen og giver Thomas et konkret, lavt-stakes forslag til CMO.",
          "Afslut ALTID med en konkret handling og dato — aldrig 'vi taler ved'.",
          "Sæt agendaen for næste møde nu — du kontrollerer framing af CMO-samtalen.",
        ],
      },
    ],
  },

  // ── SCENARIO 3: SOFTWARE CRM ──────────────────────────────────────────────
  {
    id: "software",
    emoji: "🖥️",
    title: "CRM-software system",
    subtitle: "Enterprise B2B møde — CRM til salgsteam, 45 sælgere",
    color: "#fb923c",
    customer: "Lene, 48 år, salgsdirektør, 45 sælgere, ingen CRM i dag",
    product: "SalesPulse CRM — 18.000 kr./md. for hele teamet",
    phases: [
      {
        id: "moede",
        emoji: "🤝",
        title: "Mødet — Challenger-åbning",
        context: "Du møder Lene til et formelt B2B-møde. Hun har 45 sælgere og ingen CRM — de bruger Excel og email. Du ved fra research at de voksede 30% sidste år og er ved at ansætte 15 nye sælgere. Åbn med en indsigt de ikke vidste de manglede.",
        lines: [
          { speaker: "scene", text: "Du sidder over for Lene i et mødelokale. Inden mødet læste du deres årsrapport, pressemeddelelse om vækst og LinkedIn-opslag fra salgsteamet." },
          { speaker: "sælger", text: "Lene, tak fordi du tog mødet. Inden vi starter — jeg vil gerne dele noget data jeg synes er interessant for din situation, og derefter er det op til dig om det er relevant.", badge: "Challenger — sæt forventning", badgeColor: "#fb923c" },
          { speaker: "kunde", text: "Ja, gerne" },
          { speaker: "sælger", text: "Vi analyserede 200 salgsteams der voksede fra 30-50 sælgere. De virksomheder der ikke implementerede et struktureret CRM i den periode, oplevede i gennemsnit 23% lavere vækstrate — ikke fordi de ikke var dygtige, men fordi kordinationskostnaderne skalerer kvadratisk med teamstørrelse.", badge: "Challenger — præsentér ukendt indsigt", badgeColor: "#fb923c" },
          { speaker: "kunde", text: "23%... det er en interessant observation" },
          { speaker: "sælger", text: "I er vokset 30% og ansætter 15 nye. Det er præcis den fase vi ser det her mønster opstå. Hvad er din fornemmelse — kan jeres nuværende setup skalere til 60 sælgere?", badge: "Vend til dem — relevant og provokerende", badgeColor: "#fb923c" },
          { speaker: "kunde", text: "[pause] Det er faktisk et spørgsmål vi har diskuteret internt. Ærlig talt: jeg tror ikke Excel kan klare det" },
          { speaker: "scene", text: "Lene er engageret. Du har placeret dig som ekspert der forstår hendes situation — ikke sælger der vil have ordren." },
        ],
        insights: [
          "Challenger-åbning: præsentér data de ikke kendte, men straks genkender. Det positionerer dig som ekspert.",
          "'Op til dig om det er relevant' — giver Lene kontrol og sænker forsvaret.",
          "Branchespecifik indsigt ('200 teams analyseret') er 10 gange mere troværdig end generiske påstande.",
        ],
      },
      {
        id: "lytning",
        emoji: "👂",
        title: "Aktiv lytning — find den reelle smerte",
        context: "Lene ved godt at Excel ikke skalerer. Men hvad er den REELLE smerte? Er det Lenes personlige ansvar? Er det tab af deals? Er det ledelsens synlighed? Lyt dybt og brug labeling og spejling til at afdække det.",
        lines: [
          { speaker: "sælger", text: "Hvad er de konkrete situationer i dag hvor I mærker at Excel ikke rækker?", badge: "Åbent, inviterende spørgsmål", badgeColor: "#818cf8" },
          { speaker: "kunde", text: "Vi mister overblikket over hvilke leads der er varme og kold. Sælgerne opdaterer ikke Excel regelmæssigt, og jeg kan ikke se status på nogen deals" },
          { speaker: "sælger", text: "I kan ikke se deal-status...", badge: "Spejling", badgeColor: "#818cf8" },
          { speaker: "kunde", text: "Nej. Jeg skal manuelt spørge 45 sælgere for at lave en pipeline-oversigt til ledelsen." },
          { speaker: "sælger", text: "Manuelt til ledelsen... [nikker] Hvor tit sker det?", badge: "Spørg ind til tøven", badgeColor: "#818cf8" },
          { speaker: "kunde", text: "Hver fredag. Det tager mig 3-4 timer bare at samle det" },
          { speaker: "sælger", text: "Det lyder som om du bruger din fredag som data-koordinator frem for salgsleder", badge: "Labeling — ram det præcist", badgeColor: "#818cf8" },
          { speaker: "kunde", text: "...ja. Det er faktisk frustrerende at sige højt, men det er præcis hvad der sker" },
          { speaker: "sælger", text: "Mmh. Og hvad sker der med de deals der falder igennem fordi ingen fulgte op?", badge: "Grav dybere", badgeColor: "#818cf8" },
          { speaker: "kunde", text: "Det er det vi ikke ved. Og det er der problemet ligger — vi taber sandsynligvis deals vi ikke engang ved vi taber." },
          { speaker: "scene", text: "Guldoplysning: usynlige tabte deals. Det er den reelle smerte. Ikke Excel — usynlighed." },
        ],
        insights: [
          "Labeling: 'Du bruger fredagen som data-koordinator frem for salgsleder' — Lene sagde det var præcis. Dermed ejede hun erkendelsen.",
          "Grave efter skjult smerte: 'deals vi ikke ved vi taber' er mere motiverende end 'Excel er besværligt'.",
          "Stilhed er et redskab: efter labeling, vent. Lene uddybede selv den personlige frustration.",
        ],
      },
      {
        id: "behov",
        emoji: "🎯",
        title: "Behovsafdækning — SPIN + MEDDIC",
        context: "Enterprise-salg kræver fuld MEDDIC-kvalificering. Du skal vide hvem der beslutter, hvad budgettet er, hvornår og hvad kriterierne er — ellers risikerer du at tabe i et møde du ikke var med til.",
        lines: [
          { speaker: "scene", text: "SPIN — dybere problemer og konsekvenser" },
          { speaker: "sælger", text: "Hvad er det dyreste der sker, når et varmt lead ikke følges op fordi det forsvandt i Excel?", badge: "SPIN-I: Forstørr", badgeColor: "#f87171" },
          { speaker: "kunde", text: "Vi tabte en aftale til 380.000 kroner for 3 måneder siden. Kunden ringede os faktisk bagefter og fortalte os de var klar til at skrive under — men ingen ringede" },
          { speaker: "sælger", text: "380.000 kroner. [pause] Og I ved at det sandsynligvis ikke er den eneste?", badge: "SPIN-I: Gør det reelt", badgeColor: "#f87171" },
          { speaker: "kunde", text: "Nej... det er bare den vi KENDER til" },
          { speaker: "sælger", text: "Hvad vil du anslå I taber månedligt i deals der er forsvundet i processet? Konservativt estimat?", badge: "SPIN-I: Sæt tal på", badgeColor: "#f87171" },
          { speaker: "kunde", text: "...2-3 mistede deals om måneden. Gennemsnitlig deal-størrelse er 85.000 kroner. Det er... 170-255.000 kroner om måneden." },
          { speaker: "sælger", text: "Hvad ville det betyde for jer at halvere det tab?", badge: "SPIN-N", badgeColor: "#4ade80" },
          { speaker: "kunde", text: "Det ville betyde 1-1,5 million ekstra om året. Nemt." },
          { speaker: "scene", text: "MEDDIC — kvalificering" },
          { speaker: "sælger", text: "Lene, hvem er det der skal godkende en investering som denne her?", badge: "MEDDIC: Economic Buyer", badgeColor: "#a78bfa" },
          { speaker: "kunde", text: "Det er mig og CEO'en i fællesskab. Jeg har mandat op til 200.000 — over det skal han med." },
          { speaker: "sælger", text: "Hvad er de vigtigste kriterier I vil evaluere på?", badge: "MEDDIC: Decision Criteria", badgeColor: "#a78bfa" },
          { speaker: "kunde", text: "Brugervenlighedt for sælgerne, integration til vores ERP og rapporteringsmulighederne" },
          { speaker: "sælger", text: "Hvornår vil I ideelt have noget på plads — er der en intern deadline?", badge: "MEDDIC: Timeline", badgeColor: "#a78bfa" },
          { speaker: "kunde", text: "Vi starter onboarding af de 15 nye om 8 uger. Det ville give mening at have CRM klar inden da." },
          { speaker: "scene", text: "MEDDIC komplet: Lene er champion + delvis Economic Buyer, CEO skal med over 200k, kriterier klare, deadline 8 uger." },
        ],
        insights: [
          "380.000 kr. tabt deal + 170-255.000 kr./md. estimat: Lene har nu sat tal på sin smerte. Du behøver aldrig argumentere for prisen.",
          "MEDDIC Economic Buyer: du ved nu at CEO'en skal med. Forbered to pitches — én til Lene, én til CEO.",
          "Timeline: 8 uger til onboarding er en naturlig deadline. Du brugte den ikke — Lene nævnte den selv.",
        ],
      },
      {
        id: "relation",
        emoji: "💬",
        title: "Relationsopbygning — Lene som partner",
        context: "Lene er erfaren og skeptisk over for sælgere der lover for meget. Byg tillid ved at vise du forstår hendes verden, anerkende udfordringerne ved implementering ærligt, og positionére dig som rådgiver.",
        lines: [
          { speaker: "sælger", text: "Lene, jeg vil gerne sige noget der måske er usædvanligt fra en sælger.", badge: "Kontra-intuitiv åbning", badgeColor: "#fb923c" },
          { speaker: "kunde", text: "Okay?" },
          { speaker: "sælger", text: "Implementering af et CRM til 45 sælgere er ikke nemt. Det kræver change management. Nogen sælgere vil modstå det. Og de første 4-6 uger vil data-kvaliteten sandsynligvis ikke være perfekt.", badge: "Accusation Audit — adressér frygten", badgeColor: "#fb923c" },
          { speaker: "kunde", text: "Det er godt at du siger det. Det er præcis hvad jeg er nervøs for." },
          { speaker: "sælger", text: "Og det er en reel bekymring. Men lad mig sige hvad vi har lært: de teams der lykkes bedst er dem der har en stærk intern champion — en salgsleder der sætter standarden selv. Og hvad jeg hørte fra dig i dag, er at du vil have overblik og dine sælgere fokuseret. Det er det rigtige mindset til at lykkes.", badge: "Byg Lene op som helten", badgeColor: "#fb923c" },
          { speaker: "kunde", text: "Hmm... det er faktisk en god måde at se det på" },
          { speaker: "sælger", text: "Og vi har en dedikeret onboarding-konsulent de første 90 dage. Ikke for at sælge mere — men fordi vi ved at implementeringen er der det hele enten lykkes eller falder fra hinanden.", badge: "Service promise", badgeColor: "#fb923c" },
        ],
        insights: [
          "Ærlig om implementerings-udfordringer = massiv troværdighed. Gør det selv frem for at Lene bringer det op.",
          "Byg Lene op som helten: hendes lederskab er nøglen til succesen. Det er sandt — og det motiverer.",
          "Service promise på onboarding: fjerner den største risikoopfattelse ved enterprise-køb.",
        ],
      },
      {
        id: "pitch",
        emoji: "💡",
        title: "Pitch — skræddersyet til Lene og CEO",
        context: "To pitches kræves: én til Lene (operationel ROI, pipeline synlighed, let for sælgerne) og én til CEO (finansiel ROI, strategisk skalerbarhed). Du pitcher til Lene nu og forbereder hende til CEO-mødet.",
        lines: [
          { speaker: "sælger", text: "Ud fra alt hvad du har fortalt mig — her er hvad SalesPulse konkret løser for dig.", badge: "Knyt pitch til behovet", badgeColor: "#fb923c" },
          { speaker: "sælger", text: "Problem 1: Du bruger 3-4 timer hver fredag på at samle pipeline-status. Med SalesPulse har du live-dashboard på skærmen til enhver tid. Fredagen er din igen.", badge: "Løs Lenes personlige smerte først", badgeColor: "#fb923c" },
          { speaker: "sælger", text: "Problem 2: Deals falder igennem fordi ingen følger op. SalesPulse sender automatiske påmindelser til sælgeren OG dig, når et lead er inaktivt i mere end X dage. Den 380.000-krone-aftale ville have fået et alert 5 dage inden.", badge: "Adressér den specifikke tabt deal", badgeColor: "#fb923c" },
          { speaker: "kunde", text: "Det ville have ændret det scenarie fuldstændigt" },
          { speaker: "sælger", text: "Problem 3: De 15 nye sælgere der starter om 8 uger. Med CRM fra dag ét lærer de den rigtige adfærd fra starten. Det er langt lettere end at omskole folk der har lært Excel-vanerne.", badge: "Vendepunkt for timing", badgeColor: "#fb923c" },
          { speaker: "sælger", text: "Prisen: 18.000 kroner om måneden for hele teamet. Det er 400 kroner per sælger per måned. Du estimerede selv 170-255.000 i mistede deals om måneden — vi taler om at betale 400 kroner per sælger for at holde igen på tab der er 10-15 gange større.", badge: "MMM — 400 kr./sælger vs. 170-255.000 kr. tab", badgeColor: "#fb923c" },
          { speaker: "kunde", text: "Sat op på den måde..." },
          { speaker: "sælger", text: "Og til din CEO: den ROI-beregning vi lavede — 1-1,5 million ekstra om året ved at halvere de mistede deals — det er den samtale du fører med ham. Vil du have at jeg hjælper dig forberede den?", badge: "Champion-ammunition til CEO", badgeColor: "#fb923c" },
          { speaker: "kunde", text: "Ja, det vil jeg faktisk gerne have hjælp til" },
        ],
        insights: [
          "Pitch i rækkefølge af smerte: Lenes personlige tidstab → tabte deals → de nye sælgere. Størst smerte først.",
          "MMM: 400 kr./sælger/md. er ikke 18.000 kr. — og sat op mod 170-255.000 kr. tab er det et no-brainer.",
          "Forbered champion til CEO-mødet. Du er Lenes business case-partner nu.",
        ],
      },
      {
        id: "indvendinger",
        emoji: "🛡️",
        title: "Indvendingshåndtering",
        context: "Lene har to indvendinger: 'sælgerne vil ikke bruge det' og 'vi har brug for ERP-integration'. Begge er reelle — begge har svar.",
        lines: [
          { speaker: "scene", text: "Indvending 1: Sælgerne vil ikke bruge det" },
          { speaker: "kunde", text: "Jeg er nervøs for at sælgerne simpelthen ikke opdaterer CRM'et. Så er vi lige vidt." },
          { speaker: "sælger", text: "Det er den indvending jeg hører mest — og det er en reel risiko. Må jeg dele hvad vi har lært virker?", badge: "LAER-E: Empati + Udforsk", badgeColor: "#f59e0b" },
          { speaker: "kunde", text: "Ja, gerne" },
          { speaker: "sælger", text: "De teams der lykkes bedst gør to ting: lederen bruger selv CRM'et aktivt fra dag ét — det sætter normen. Og man giver sælgerne noget de SELV vil have: automatiske påmindelser om hvornår et lead er varmt, så de aldrig mister en timing. Det er ikke et kontrol-system — det er et performance-system for dem.", badge: "LAER-R: Reager med konkret løsning", badgeColor: "#f59e0b" },
          { speaker: "sælger", text: "Derudover: vores onboarding-proces er bygget til at minimere friktion. 90% af vores kunder er fuldt onboardet inden for 3 uger — og i den periode holder vi ugentlige 30-minutters sessioner med team leads.", badge: "Feel-Felt-Found underliggende", badgeColor: "#f59e0b" },
          { speaker: "scene", text: "Indvending 2: ERP-integration" },
          { speaker: "kunde", text: "Vi bruger Navision som ERP. Fungerer det med jer?" },
          { speaker: "sælger", text: "Ja — vi har en native Dynamics NAV/Navision-integration. Kundedata, ordrehistorik og fakturering synkroniserer direkte. Vil du have en teknisk demo af præcis den integration?", badge: "Direkte svar + konkret næste skridt", badgeColor: "#f59e0b" },
          { speaker: "kunde", text: "Det ville jeg faktisk gerne se" },
          { speaker: "sælger", text: "Så foreslår jeg: vi sætter et teknisk møde med din IT-chef og jeg medbringer vores tekniske konsulent. Halvanden time, fuld Navision-demo. Hvornår passer det?", badge: "Identificér næste blocker og løs den proaktivt", badgeColor: "#f59e0b" },
        ],
        insights: [
          "Adoption-bekymring: adressér den med adfærdsdesign ('performance-system, ikke kontrol') og lederadfærd.",
          "Integration-indvending: svar direkte og konkret. Aldrig vag. 'Ja — vi har native integration' + tilbyd demo.",
          "Identificér proaktivt den næste blocker (IT-chef, teknisk validering) og fjern den med et møde.",
        ],
      },
      {
        id: "closing",
        emoji: "✅",
        title: "Closing — Trinvis + CEO-forberedelse",
        context: "Enterprise-salg lukkes sjældent i ét møde. Men du kan styre processen præcist. Luk dette møde med et klart næste skridt, en dato og Lenes aktive commitment.",
        lines: [
          { speaker: "scene", text: "Trinvis close — bekræft hvert lag" },
          { speaker: "sælger", text: "Lene, ud fra alt vi har snakket om — føler du at SalesPulse adresserer de tre problemer vi identificerede?", badge: "Trial close 1", badgeColor: "#4ade80" },
          { speaker: "kunde", text: "Ja, det gør det" },
          { speaker: "sælger", text: "Og regnestykket — 400 kr. per sælger per måned for at beskytte mod 170-255.000 i mistede deals — giver det mening som en forretningsbeslutning?", badge: "Trial close 2 — ROI", badgeColor: "#4ade80" },
          { speaker: "kunde", text: "Ja, logikken er klar" },
          { speaker: "sælger", text: "Godt. Og med 15 nye sælgere om 8 uger — er timing i princippet rigtig nu?", badge: "Trial close 3 — timing", badgeColor: "#4ade80" },
          { speaker: "kunde", text: "Det er det. Men jeg skal have CEO'en med." },
          { speaker: "sælger", text: "Præcis. Og det sætter vi op. Hvad jeg foreslår er tre konkrete næste skridt:", badge: "Opsummerings-close", badgeColor: "#4ade80" },
          { speaker: "sælger", text: "Ét: Teknisk demo med din IT-chef næste uge — Navision-integration. To: Jeg sender dig en business case-skabelon til CEO-mødet inden fredag. Tre: CEO-møde i uge 3 — 30 minutter, jeg præsenterer ROI-casen direkte.", badge: "Konkrete tre skridt med datoer", badgeColor: "#4ade80" },
          { speaker: "kunde", text: "Det lyder som en plan" },
          { speaker: "sælger", text: "Mit job er ikke at presse dig til noget der ikke giver mening. Men givet hvad du fortalte mig om de mistede deals og de 15 nye sælgere — ville det være en dårlig beslutning at bruge de næste 3 uger på at kvalificere det her ordentligt?", badge: "Ville det være en dum idé?", badgeColor: "#4ade80" },
          { speaker: "kunde", text: "Nej, det ville det ikke. Lad os gøre det." },
          { speaker: "scene", text: "Tre næste skridt aftalt. Datoer sat. Lene er aktiv partner i salgsprocessen. CEO-mødet er struktureret. Salget lukkes i uge 3." },
        ],
        insights: [
          "Enterprise-closing handler om at eje processen: tre konkrete skridt med datoer giver dig kontrol.",
          "'Ville det være en dum idé at bruge 3 uger på at kvalificere det her?' — næsten umuligt at sige ja til.",
          "Send business case INDEN CEO-mødet. Du skriver narrativet, ikke Lene. Det er afgørende.",
          "Den bedste sælger i en enterprise-deal er din champion. Rustén Lene til at vinde internt.",
        ],
      },
    ],
  },

  // ── SCENARIO 4: FORSIKRING (B2C) ─────────────────────────────────────────
  {
    id: "forsikring",
    emoji: "🛡️",
    title: "Forsikringsskifte",
    subtitle: "B2C telefonopkald — inbound lead, hjemforsikring",
    color: "#34d399",
    customer: "Jakob, 38 år, gift, to børn, hus i Aarhus",
    product: "Komplet husforsikring + indboforsikring — 5.200 kr./år",
    phases: [
      {
        id: "moede",
        emoji: "🤝",
        title: "Åbningen — inbound opkald",
        context: "Jakob ringer ind fordi han fik et brev om at hans nuværende forsikring stiger 18% næste år. Han er irriteret og leder aktivt efter alternativer. Din opgave: afkøl frustrationen, byg forbindelsen, og positionér dig som rådgiver der kigger på det samlede billede — ikke kun prisen.",
        lines: [
          { speaker: "scene", text: "Jakob ringer ind. Han lyder lidt oprevet." },
          { speaker: "sælger", text: "Hej, det er Sofie fra ForsikringsDirekte — hvad kan jeg hjælpe dig med i dag?", badge: "Varm og åben åbning", badgeColor: "#34d399" },
          { speaker: "kunde", text: "Ja hej, jeg har fået brev om at min forsikring stiger med 18% næste år og det synes jeg er for meget. Jeg vil høre hvad I kan tilbyde." },
          { speaker: "sælger", text: "Det kan jeg godt forstå du reagerer på — 18% er en stor stigning. Tak fordi du ringede. Jeg vil rigtig gerne kigge på det med dig.", badge: "Anerkend følelsen", badgeColor: "#34d399" },
          { speaker: "sælger", text: "For at sikre at jeg finder den bedste løsning til netop dig — må jeg spørge lidt til din situation?", badge: "Sæt forventning til processen", badgeColor: "#34d399" },
          { speaker: "kunde", text: "Ja, det er fint" },
          { speaker: "sælger", text: "Perfekt. Hvad dækker din forsikring i dag — hus og indbo, eller har du andre forsikringer med?", badge: "Åbn for det samlede billede", badgeColor: "#34d399" },
          { speaker: "kunde", text: "Hus, indbo og vi har to biler. Dem er vi også dækket hos dem, men bilerne kigger jeg ikke på nu." },
          { speaker: "sælger", text: "Godt at vide. Og er du tilfreds med selve dækningen, eller er det mest prisen der driller?", badge: "Qualifier — pris vs. dækning", badgeColor: "#34d399" },
          { speaker: "kunde", text: "Prisen. Vi har aldrig haft problemer, så vi bruger den jo næsten ikke." },
          { speaker: "scene", text: "Vigtig indsigt: Jakob oplever forsikringen som en ren udgift — ikke en tryghed. Det er din angle." },
        ],
        insights: [
          "Anerkend frustrationen straks — 'Jeg forstår du reagerer på det.' Kunden føler sig hørt og falder ned.",
          "Bed om tilladelse til at stille spørgsmål. Det positionerer dig som rådgiver, ikke et call-center script.",
          "Find den reelle driver: pris eller dækning? Det bestemmer hele din pitch-strategi.",
        ],
      },
      {
        id: "lytning",
        emoji: "👂",
        title: "Aktiv lytning",
        context: "Jakob siger han 'næsten ikke bruger' forsikringen. Det er en faresignal — han undervurderer risikoen og fokuserer kun på pris. Din opgave: lyt dig ind til hvad huset og familien repræsenterer for ham, og vend perspektivet blidt.",
        lines: [
          { speaker: "sælger", text: "Heldigvis har I aldrig haft brug for den. Men hvad beskytter forsikringen for jer — er det huset selv, indboet, eller er det noget bredere?", badge: "Åbent spørgsmål om vigtighed", badgeColor: "#818cf8" },
          { speaker: "kunde", text: "Det er jo huset. Det er det vi har arbejdet for. Indboet er egentlig ikke så vigtigt." },
          { speaker: "sælger", text: "Huset er det I har arbejdet for...", badge: "Spejling", badgeColor: "#818cf8" },
          { speaker: "kunde", text: "Ja, vi fik det for 4 år siden. Det er ligesom basen for det hele — børnene, familien." },
          { speaker: "sælger", text: "Basen for det hele. [pause] Hvad ville det betyde for familien, hvis der skete noget — brand, vandskade — noget der satte huset ud af drift i 3 måneder?", badge: "Lyt til hvad der IKKE siges", badgeColor: "#818cf8" },
          { speaker: "kunde", text: "Det ville være kaos. To børn, vi er nødt til at have et sted at bo. Det ville kræve alt vi har." },
          { speaker: "sælger", text: "Alt I har — det lyder ikke som en situation man vil stå i.", badge: "Labeling", badgeColor: "#818cf8" },
          { speaker: "kunde", text: "Nej, præcis. Jeg har bare ikke haft det i tankerne på den måde." },
          { speaker: "scene", text: "Skiftet er sket: Jakob ser ikke længere forsikringen som en udgift — han ser den som familiens sikkerhedsnet. Det er din fundament for resten af samtalen." },
        ],
        insights: [
          "Spejl 'basen for det hele' — et hjem er aldrig bare mursten, det er familiens identitet.",
          "Hypotetisk scenarie ('hvad hvis brand...') gør den abstrakte risiko konkret og personlig. Ikke skræmsel — virkelighed.",
          "Lad kunden selv konkludere: 'Det har jeg ikke haft i tankerne på den måde.' Erkendelsen er hans, ikke din.",
        ],
      },
      {
        id: "behov",
        emoji: "🎯",
        title: "Behovsafdækning — SPIN",
        context: "Nu afdækker du systematisk hvad Jakob faktisk har i dag, hvad der mangler, og hvad det kan koste. Særligt vigtigt: afdæk om hans nuværende dækning har huller han ikke er klar over.",
        lines: [
          { speaker: "scene", text: "SPIN-S: Situationsspørgsmål" },
          { speaker: "sælger", text: "Hvad er huset forsikret for i dag — ved du om det er nyværdi eller dagsværdi?", badge: "SPIN-S: Dækningstype", badgeColor: "#38bdf8" },
          { speaker: "kunde", text: "Æh... det ved jeg faktisk ikke. Det stod i papirerne, men jeg har ikke kigget på det i årevis." },
          { speaker: "sælger", text: "Det er faktisk ret normalt — de fleste ved det ikke. Og har I tilvalgt svamp og råd-dækning?", badge: "SPIN-S: Kritisk tillæg", badgeColor: "#38bdf8" },
          { speaker: "kunde", text: "Det ved jeg heller ikke... er det noget man bør have?" },
          { speaker: "scene", text: "SPIN-P: Problemspørgsmål" },
          { speaker: "sælger", text: "Det afhænger af huset. Hvornår er det bygget, og er det mursten eller træ?", badge: "SPIN-P: Identificér risikoprofil", badgeColor: "#f59e0b" },
          { speaker: "kunde", text: "1972, mursten. Men vi har kælder." },
          { speaker: "sælger", text: "Kælder i et 1972-hus... har I oplevet fugt dernede?", badge: "SPIN-P: Afslør potentielt hul", badgeColor: "#f59e0b" },
          { speaker: "kunde", text: "Ja faktisk, vi har haft det lidt i et hjørne. Vi har bare malerbehandlet det." },
          { speaker: "scene", text: "SPIN-I: Implikationsspørgsmål" },
          { speaker: "sælger", text: "Det er godt I har håndteret det. Men ved du hvad en skjult svampeskade koster at udbedre, hvis den har siddet der i 5-10 år?", badge: "SPIN-I: Gør risikoen synlig", badgeColor: "#f87171" },
          { speaker: "kunde", text: "Nej, ikke rigtig..." },
          { speaker: "sælger", text: "Det kan let løbe op i 80.000-200.000 kroner afhængigt af omfang. Og hvis din nuværende forsikring ikke dækker svamp, står du med hele regningen selv.", badge: "SPIN-I: Kvantificér", badgeColor: "#f87171" },
          { speaker: "kunde", text: "Det vidste jeg virkelig ikke... det er ret alvorligt" },
          { speaker: "scene", text: "SPIN-N: Need-Payoff" },
          { speaker: "sælger", text: "Hvad ville det betyde for din ro i maven at vide at I er korrekt dækket på alle de her punkter?", badge: "SPIN-N: Kunden maler tryghed", badgeColor: "#4ade80" },
          { speaker: "kunde", text: "Det ville betyde meget, faktisk. Det er jo basen for hele familielivet som jeg sagde." },
        ],
        insights: [
          "Dagsværdi vs. nyværdi og svamp/råd-dækning: de fleste kunder ved ikke de mangler det. Du hjælper — du sælger ikke.",
          "SPIN-I med konkret sum: '80.000-200.000 kr.' er ikke skræmsel, det er realitet. Jakob kan forholde sig til det.",
          "Brug kundens egne ord: 'basen for hele familielivet' — det er SPIN-N-svaret. Du gentog hans metafor.",
        ],
      },
      {
        id: "relation",
        emoji: "💬",
        title: "Relationsopbygning",
        context: "Jakob er mere åben nu. Byg tillid ved at vise du er på hans side — ikke bare sælger en polisse. Vær konkret om hvad du finder, og adressér det han sandsynligvis er skeptisk over.",
        lines: [
          { speaker: "sælger", text: "Jakob, jeg vil gerne sige noget direkte.", badge: "Accusation Audit starter", badgeColor: "#34d399" },
          { speaker: "kunde", text: "Okay?" },
          { speaker: "sælger", text: "Mange forsikringsselskaber giver en rigtig god pris i starten og hæver så hvert år. Og mange kunder opdager for sent at de ikke har den dækning de regnede med. Jeg vil gerne sikre at du ved præcis hvad du betaler for — og om det dækker det der faktisk er vigtigt for jer.", badge: "Adressér skepsis direkte", badgeColor: "#34d399" },
          { speaker: "kunde", text: "Det sætter jeg faktisk pris på at du siger" },
          { speaker: "sælger", text: "Og jeg vil ikke sælge dig noget du ikke har brug for. Kan du sende mig din nuværende police på email, så kigger jeg den igennem og kan fortælle dig præcis hvad du har — og hvad eventuelle huller er?", badge: "Service promise — rådgiver", badgeColor: "#34d399" },
          { speaker: "kunde", text: "Ja, det kan jeg godt. Det er rart at have nogen der faktisk kigger på det." },
          { speaker: "sælger", text: "Det er min opgave. Og hvis din nuværende faktisk dækker det du har brug for til en fornuftig pris, skal jeg sige det til dig.", badge: "Ærlig og tryg — trust-builder", badgeColor: "#34d399" },
          { speaker: "scene", text: "Jakob har nu sendt policen og er i aktiv dialog. Han stoler på Sofie." },
        ],
        insights: [
          "Accusation Audit: nævn selv det kunden er skeptisk over ('mange selskaber giver god pris og hæver så'). Det er afvæbnende.",
          "'Hvis din nuværende dækker behovet, siger jeg det' — denne sætning er guld. Den gør dig troværdig.",
          "Police-review er et naturligt næste skridt der giver dig al den info du mangler og forankrer relationen.",
        ],
      },
      {
        id: "pitch",
        emoji: "💡",
        title: "Pitch & præsentation",
        context: "Du har gennemgået Jakobs police og fundet to konkrete huller: dagsværdi (ikke nyværdi) og ingen svamp/råd-dækning. Nu pitcher du løsningen — men framer det som 'her er hvad jeg fandt' ikke 'køb dette'.",
        lines: [
          { speaker: "scene", text: "Opfølgningsopkald næste dag, efter police-review." },
          { speaker: "sælger", text: "Jakob, tak for policen. Jeg har kigget den grundigt igennem, og der er to ting jeg vil gøre dig opmærksom på.", badge: "Review-framing — rådgiver", badgeColor: "#34d399" },
          { speaker: "kunde", text: "Okay, hvad fandt du?" },
          { speaker: "sælger", text: "Det første: din husforsikring dækker på dagsværdi — det vil sige hvad huset var værd da det blev bygget minus alder. Hvis der sker et totaltab, vil du sandsynligvis ikke få nok til at genopbygge til nuværende priser. Nyværdi-dækning giver dig det fulde beløb til nybyg.", badge: "Fund 1: konkret og forklaret", badgeColor: "#34d399" },
          { speaker: "kunde", text: "Det var da ikke godt..." },
          { speaker: "sælger", text: "Det andet: du har ikke svamp og råd-tillæg. Givet at du nævnte fugt i kælderen — det er præcis den risiko der ikke er dækket. Og du sagde selv at huset er 'basen for det hele'.", badge: "Fund 2: knyt til deres egne ord", badgeColor: "#34d399" },
          { speaker: "sælger", text: "Med vores komplet-dækning — nyværdi, svamp og råd, vandskade inkl. kælder, ansvar og brand — er du fuldt dækket. Prisen er 5.200 kroner om året. Det er 233 kroner mindre end du betaler i dag — og du får faktisk mere dækning.", badge: "Sammenligning: bedre dækning, lavere pris", badgeColor: "#34d399" },
          { speaker: "kunde", text: "Vent — billigere OG bedre dækning?" },
          { speaker: "sælger", text: "Ja. Din nuværende stiger til 7.344 kroner med den 18% stigning. Vores er 5.200 — det er 2.144 kroner om året du sparer, med dækning du faktisk har brug for.", badge: "MMM — prisforskel kvantificeret", badgeColor: "#34d399" },
        ],
        insights: [
          "Police-review giver dig autoritet til pitchen: 'Her er hvad jeg fandt' er uendelig stærkere end 'vi tilbyder X'.",
          "Knyt fund til kundens egne ord: 'Du sagde huset er basen for det hele' — han ejede den sætning.",
          "MMM: 2.144 kr. billigere OM ÅRET med bedre dækning. Tal altid i årsbesparelse, ikke månedlig forskel.",
        ],
      },
      {
        id: "indvendinger",
        emoji: "🛡️",
        title: "Indvendingshåndtering",
        context: "Jakob har to indvendinger: 'det er besværligt at skifte' og 'jeg vil gerne snakke med min kone'. Begge er forventelige og begge håndteres elegant.",
        lines: [
          { speaker: "scene", text: "Indvending 1: Det er besværligt at skifte" },
          { speaker: "kunde", text: "Det lyder godt, men det er bare altid så besværligt at skifte forsikring... al det paperwork" },
          { speaker: "sælger", text: "Jeg forstår det — og det plejer at være sådan. Men hos os er det faktisk anderledes.", badge: "LAER-A+E", badgeColor: "#f59e0b" },
          { speaker: "sælger", text: "Du giver mig opsigelsesdatoen og din nuværende police, og vi ordner hele skiftet for dig — inkl. opsigelse af den gamle. Du skriver under digitalt på 3 minutter. Det er det eneste du laver.", badge: "LAER-R: Fjern friktionen konkret", badgeColor: "#f59e0b" },
          { speaker: "kunde", text: "Seriøst? I sender opsigelsen for mig?" },
          { speaker: "sælger", text: "Ja, det er en del af vores service. Mange vælger os netop af den grund.", badge: "Social proof", badgeColor: "#f59e0b" },
          { speaker: "scene", text: "Indvending 2: Skal snakke med konen" },
          { speaker: "kunde", text: "Jeg vil gerne snakke med min kone om det inden jeg beslutter noget" },
          { speaker: "sælger", text: "Det er jeg glad for du siger — det er en fælles beslutning. Hvad tror du din kones største spørgsmål vil være?", badge: "Find den reelle bekymring", badgeColor: "#f59e0b" },
          { speaker: "kunde", text: "Hun vil sandsynligvis spørge om vi er fuldt dækket og om selskabet er troværdigt" },
          { speaker: "sælger", text: "Gode spørgsmål. Vil du have at jeg sender jer begge en mail med en oversigt — hvad I har i dag, hvad vi tilbyder, prisforskellen og hvad vores dækning inkluderer? Så kan I kigge på det sammen.", badge: "Giv champion ammunition", badgeColor: "#f59e0b" },
          { speaker: "kunde", text: "Ja, det ville gøre det nemmere at tage samtalen hjemme" },
        ],
        insights: [
          "Opsigelsesservice: fjern den konkrete friktionsårsag i stedet for at argumentere imod den.",
          "'Hvad tror du din kones bekymring vil være?' — du afdækker indvendingen FØR den dukker op i en samtale du ikke er med i.",
          "Send ammunition til den interne samtale — du skriver narrativet, ikke Jakob.",
        ],
      },
      {
        id: "closing",
        emoji: "✅",
        title: "Closing",
        context: "Jakob er tæt på. Brug assumptive close + alternativ close. Skab tryghed om det næste skridt og gør processen ENKEL.",
        lines: [
          { speaker: "scene", text: "Opfølgningsopkald to dage senere — Jakob og konen har set mailen." },
          { speaker: "sælger", text: "Hej Jakob — havde du mulighed for at kigge på materialet med din kone?", badge: "Naturlig opfølgning", badgeColor: "#4ade80" },
          { speaker: "kunde", text: "Ja, vi er begge enige om at det giver mening. Dækningen er klart bedre og prisen er lavere." },
          { speaker: "sælger", text: "Fedt — og I har begge kigget på det og er komfortable. Hvornår vil du have den nye forsikring til at starte?", badge: "Assumptive close — 'hvornår', ikke 'om'", badgeColor: "#4ade80" },
          { speaker: "kunde", text: "Helst pr. 1. maj, når den nuværende udløber" },
          { speaker: "sælger", text: "Perfekt. Jeg sørger for at den starter præcis 1. maj. Vil du have mig til at sende opsigelsen af den gamle i dag eller vente til vi nærmer os datoen?", badge: "Alternativ close — begge er ja", badgeColor: "#4ade80" },
          { speaker: "kunde", text: "Send den gerne i dag, så er det overstået" },
          { speaker: "sælger", text: "Godt. Jeg sender dig signeringslinket nu — det er tre klik. Så er du dækket fra 1. maj og vi ordner resten.", badge: "Gør close så let som muligt", badgeColor: "#4ade80" },
          { speaker: "scene", text: "Jakob signerer digitalt inden for 5 minutter. Forsikringen er skiftet. Han sparede 2.144 kr. og fik bedre dækning. Han lavede bogstaveligt talt ingenting ud over at klikke tre gange." },
        ],
        insights: [
          "Assumptive close: 'Hvornår vil du have den til at starte?' — springer over ja/nej og går direkte til detaljen.",
          "Alternativ close på opsigelse: 'I dag eller næste uge?' — begge er et ja til at skifte.",
          "Gør signeringen så enkel som muligt. Friktion er din fjende i closing-fasen.",
          "Følg altid op to dage efter at sende materiale — aldrig tre uger. Momentum forsvinder.",
        ],
      },
    ],
  },

  // ── SCENARIO 5: REKRUTTERING ──────────────────────────────────────────────
  {
    id: "rekruttering",
    emoji: "🧑‍💼",
    title: "Rekrutteringsydelse",
    subtitle: "B2B outbound møde — executive search til tech-virksomhed",
    color: "#f472b6",
    customer: "Anders, 44 år, CEO, 60-personers SaaS-virksomhed",
    product: "Executive search — Senior Head of Product, 95.000 kr. fast fee",
    phases: [
      {
        id: "moede",
        emoji: "🤝",
        title: "Mødet — Challenger-åbning",
        context: "Anders har netop tabt sin Head of Product der stoppede og startede hos en konkurrent. Han er under pres. Du har fundet frem til ham via LinkedIn og fået et møde på 30 minutter. Start med en indsigt han ikke forventer.",
        lines: [
          { speaker: "scene", text: "Du sidder over for Anders på hans kontor. Han virker travl og lidt stresset." },
          { speaker: "sælger", text: "Anders, tak for at du fandt tid. Jeg ved du har meget i gang — lad mig springe direkte til noget jeg fandt interessant.", badge: "Respektér hans tid", badgeColor: "#f472b6" },
          { speaker: "kunde", text: "Ja, vi er i gang. Hvad har du?" },
          { speaker: "sælger", text: "Vi har lavet en analyse af tech-virksomheder i din størrelse der mistede en senior produktleder. Gennemsnitstiden fra stillingsopslag til ansat kandidat er 5,2 måneder via LinkedIn-opslag. Og 60% af de virksomheder rapporterede at produktroadmap og vigtige launches blev forsinket med 4+ måneder.", badge: "Challenger — data der rammer hjemme", badgeColor: "#f472b6" },
          { speaker: "kunde", text: "5,2 måneder... [pause] Det er faktisk tæt på den tidslinje vi selv budgetterer med" },
          { speaker: "sælger", text: "Og hvad sker der med jeres Q3-launch i den periode?", badge: "Vend til ham — gør det personligt", badgeColor: "#f472b6" },
          { speaker: "kunde", text: "Det er faktisk præcis det problem vi sidder med. Vi har en stor produktlaunch planlagt til oktober og ingen Head of Product til at drive det." },
          { speaker: "scene", text: "Perfekt Challenger-åbning: du bragte data, han relaterede det til sin situation selv, og hans problem kom frem naturligt." },
        ],
        insights: [
          "Brug industri-data som åbner: '5,2 måneder' er et tal Anders kan forholde sig til og sammenligne med sin situation.",
          "Stil det vendende spørgsmål: 'Hvad sker der med jeres launch?' — det er ham der forbinder prikker, ikke dig.",
          "Tid er den knappeste ressource i rekruttering — brug det som primær pain-driver.",
        ],
      },
      {
        id: "lytning",
        emoji: "👂",
        title: "Aktiv lytning",
        context: "Anders har et teknisk problem (mangler en Head of Product) men det virkelige problem er noget bredere: tillid til at finde den rigtige person, frygt for endnu et fejlansættelse, og presset fra bestyrelsen. Lyt dig ind til det.",
        lines: [
          { speaker: "sælger", text: "Hvad skete der med den tidligere Head of Product, hvis det er okay at spørge?", badge: "Åbent, nysgerrigt spørgsmål", badgeColor: "#818cf8" },
          { speaker: "kunde", text: "Hun fik et tilbud fra en konkurrent med 40% mere i løn. Vi kunne ikke matche det." },
          { speaker: "sælger", text: "40% mere... og hvad tog hun med sig af ting der var svære at erstatte?", badge: "Spørg ind til det bløde tab", badgeColor: "#818cf8" },
          { speaker: "kunde", text: "Relationer til kunder, viden om vores roadmap, og to år med kontekst om vores platform. Det er ikke noget man bare ansætter ind." },
          { speaker: "sælger", text: "To år med kontekst... [nikker] Hvad er det vigtigste du kigger efter i den næste person?", badge: "Spejling → åbent spørgsmål", badgeColor: "#818cf8" },
          { speaker: "kunde", text: "Nogen der forstår B2B SaaS dybt, kan tale med ingeniørerne og med kunderne, og som ikke forlader os igen om 2 år." },
          { speaker: "sælger", text: "Det lyder som om retention er ligeså vigtigt for dig som selve kandidaten.", badge: "Labeling", badgeColor: "#818cf8" },
          { speaker: "kunde", text: "...ja. Vi har haft det her problem to gange nu. Det begynder at koste os mere end penge." },
          { speaker: "scene", text: "Guldoplysning: anden gang med problemet. Retention og kulturmatch er den reelle smerte — ikke bare en ledig stilling." },
        ],
        insights: [
          "Spørg til det personlige tab ved exit: 'Hvad tog hun med sig?' Svaret afslører hvad Anders reelt frygter at miste igen.",
          "Labeling: 'retention er ligeså vigtigt som kandidaten' — Anders sagde JA og uddybede med sin egentlige smerte.",
          "Anden gang med problemet = eskaleret smerte. Det er din stærkeste motivator.",
        ],
      },
      {
        id: "behov",
        emoji: "🎯",
        title: "Behovsafdækning — SPIN + MEDDIC",
        context: "Nu afdækker du den fulde kvalificering: hvad søger de præcis, hvem beslutter, hvad er budgettet, og hvad er tidslinjen. Plus: hvad har de prøvet og hvorfor virker det ikke?",
        lines: [
          { speaker: "scene", text: "SPIN — Situation & Problem" },
          { speaker: "sælger", text: "Hvad har I gjort indtil videre for at finde en kandidat?", badge: "SPIN-S: Nuværende tiltag", badgeColor: "#38bdf8" },
          { speaker: "kunde", text: "Vi har sat et LinkedIn-opslag op for 3 uger siden. Vi har fået 60 ansøgninger, men ingen der er tæt på det vi søger." },
          { speaker: "sælger", text: "60 ansøgninger og ingen match — hvad mangler de typisk?", badge: "SPIN-P", badgeColor: "#f59e0b" },
          { speaker: "kunde", text: "Enten SaaS-erfaring, B2B-erfaring, eller de er teknisk svage. Nogen passer på to men ikke alle tre." },
          { speaker: "scene", text: "SPIN — Implication" },
          { speaker: "sælger", text: "Hvad betyder det konkret for Q3-launch, hvis I ikke har en Head of Product ansat inden udgangen af juni?", badge: "SPIN-I: Konkrete konsekvenser", badgeColor: "#f87171" },
          { speaker: "kunde", text: "Vi skubber sandsynligvis launch til Q4. Det koster os i hvert fald 3-4 planlagte enterprise-kontrakter der forventer featuren i Q3." },
          { speaker: "sælger", text: "Hvad er de enterprise-kontrakter typisk værd?", badge: "SPIN-I: Sæt tal på", badgeColor: "#f87171" },
          { speaker: "kunde", text: "300-500.000 kroner per styk. Tre styk... det er 1-1,5 millioner i risiko." },
          { speaker: "scene", text: "MEDDIC" },
          { speaker: "sælger", text: "Hvem er det ud over dig der er involveret i beslutningen?", badge: "MEDDIC: Decision Process", badgeColor: "#a78bfa" },
          { speaker: "kunde", text: "Mig og vores investorer — de har én bestyrelsesplads og skal godkende ansættelser over 90.000 kr. i årsløn." },
          { speaker: "sælger", text: "Og hvad er det vigtigste kriterie for dem?", badge: "MEDDIC: Criteria", badgeColor: "#a78bfa" },
          { speaker: "kunde", text: "Track record og retention. De spørger altid 'hvad er sandsynligheden for at han/hun er her om 3 år?'" },
          { speaker: "sælger", text: "Hvornår skal du senest have nogen ansat for at redde Q3-launch?", badge: "MEDDIC: Timeline", badgeColor: "#a78bfa" },
          { speaker: "kunde", text: "Udgangen af juni — det er 10 uger. Det er urealistisk med et LinkedIn-opslag." },
        ],
        insights: [
          "1-1,5 million i enterprise-risiko: nu er fee på 95.000 kr. ubetydelig. Aldrig argumentér for prisen — lad kunden sætte tallene.",
          "MEDDIC: investorerne vil se retention. Det er præcis det du leverer — notér det til pitchen.",
          "10 uger er urealistisk via LinkedIn — kunden siger det selv. Du behøver ikke sige det.",
        ],
      },
      {
        id: "relation",
        emoji: "💬",
        title: "Relationsopbygning",
        context: "Anders har haft dårlige oplevelser med rekrutteringsbureauer der sender mange profiler af lav kvalitet og tager et stort fee. Adressér den skepsis direkte.",
        lines: [
          { speaker: "sælger", text: "Anders, jeg vil gerne adressere noget direkte — for det er noget jeg hører ofte fra CEOs i din situation.", badge: "Accusation Audit starter", badgeColor: "#f472b6" },
          { speaker: "kunde", text: "Hvad?" },
          { speaker: "sælger", text: "At rekrutteringsbureauer sender en masse CV'er der ikke matcher, tager et stort fee, og forsvinder hvis kandidaten stopper igen efter 6 måneder. Og at processen tager ligeså lang tid som at gøre det selv.", badge: "Nævn frygten selv", badgeColor: "#f472b6" },
          { speaker: "kunde", text: "[griner let] ...ja, det er faktisk præcis mine erfaringer" },
          { speaker: "sælger", text: "Det er ærgerligt og det sker for meget. Her er hvad vi gør anderledes: vi præsenterer maksimalt 4 kandidater — ikke 40. Alle er aktivt screenet og kulturmatched. Og vi har 12-måneders garantiperiode: hvis kandidaten forlader inden 12 måneder, finder vi en ny gratis.", badge: "Differentier med konkrete modsvar", badgeColor: "#f472b6" },
          { speaker: "kunde", text: "12-måneders garanti? Det har jeg aldrig hørt om" },
          { speaker: "sælger", text: "Det er fordi vi er selektive om hvilke opgaver vi tager. Jeg vil ikke påtage mig din opgave medmindre jeg er sikker på at vi kan levere inden for 10 uger og med den rigtige profil. Vil du have at jeg fortæller dig præcis hvad vi kigger efter?", badge: "Sæt standard — dit bureau er ekspert", badgeColor: "#f472b6" },
        ],
        insights: [
          "Accusation Audit med konkret modsvar: nævn frygten, anerkend at den er reel, og levér den specifikke modvægt.",
          "12-måneders garanti løser Anders' retention-frygt direkte — og adresserer bestyrelsens kriterie.",
          "'Vi er selektive om hvilke opgaver vi tager' er et eksklusivitetssignal — det øger din troværdighed.",
        ],
      },
      {
        id: "pitch",
        emoji: "💡",
        title: "Pitch — processen og ROI",
        context: "Pitch processen, ikke ydelsen. Anders køber ikke et CV — han køber et løst problem. Vis ham tidslinjen, metodikken og det der skiller dig fra LinkedIn.",
        lines: [
          { speaker: "sælger", text: "Lad mig vise dig hvad vi konkret gør de næste 10 uger.", badge: "Pitch processen", badgeColor: "#f472b6" },
          { speaker: "sælger", text: "Uge 1-2: vi kortlægger den præcise kandidatprofil med dig. B2B SaaS, teknisk fundament, ledererfaring og kulturmatch til jeres team. Vi bygger en longlist på 80-120 kandidater fra vores netværk og aktiv headhunting — ikke kun dem der aktivt søger jobs.", badge: "Differentiering: passiv kandidatpulje", badgeColor: "#f472b6" },
          { speaker: "sælger", text: "Uge 3-5: vi screener ned til 8-10 kandidater og gennemfører dybdegående interviews. Du modtager 4 finalkandidater med fuld profil, reference og vores anbefaling.", badge: "Maks 4 — kvalitet over kvantitet", badgeColor: "#f472b6" },
          { speaker: "sælger", text: "Uge 6-8: du gennemfører interviews med vores facilitering. Vi hjælper med lønforhandling og afslutningstilbud — baseret på markedsdata for præcis den profil.", badge: "Facilitering der lukker gaps", badgeColor: "#f472b6" },
          { speaker: "sælger", text: "Uge 8-10: onboarding-plan og kulturintroduktion. Vi er med i de første 90 dage for at sikre fastholdelse.", badge: "Retention fra dag ét", badgeColor: "#f472b6" },
          { speaker: "kunde", text: "Det er meget mere struktureret end hvad jeg har set fra andre bureauer" },
          { speaker: "sælger", text: "Feeet er 95.000 kroner. Du har selv beregnet at en forsinket Q3-launch risikerer 1-1,5 million. 95.000 er 6-9% af det tal — og med 12-måneders garanti er risikoen minimal.", badge: "MMM: 95.000 vs. 1-1,5 mio.", badgeColor: "#f472b6" },
        ],
        insights: [
          "Pitch processen med tidslinje: det giver tryghed og differentierer fra 'vi sender CV'er til dig'.",
          "Passiv kandidatpulje: 80-120 profiler der ikke er på LinkedIn. Det er ægte differentiering.",
          "MMM: 95.000 kr. = 6-9% af den risiko kunden selv kvantificerede. Lav det regnestykket for ham.",
        ],
      },
      {
        id: "indvendinger",
        emoji: "🛡️",
        title: "Indvendingshåndtering",
        context: "Anders har to indvendinger: 'prisen er høj' og 'vi vil prøve LinkedIn lidt endnu'. Begge er håndterbare med LAER og de tal I allerede har etableret.",
        lines: [
          { speaker: "scene", text: "Indvending 1: Prisen er høj" },
          { speaker: "kunde", text: "95.000 kroner er alligevel mange penge for en rekruttering" },
          { speaker: "sælger", text: "Det er en fair observation — det er ikke et lille beløb.", badge: "LAER-A: Anerkend", badgeColor: "#f59e0b" },
          { speaker: "sælger", text: "Hvad er din alternative plan hvis I bruger de næste 10 uger på LinkedIn og stadig ikke har nogen?", badge: "Plan B-close", badgeColor: "#f59e0b" },
          { speaker: "kunde", text: "...det er et godt spørgsmål" },
          { speaker: "sælger", text: "Du sagde selv Q3-launch risikerer 1-1,5 million. Vi taler om 95.000 kroner med 12-måneders garanti for at fjerne den risiko. Er det en dårlig forretningsbeslutning?", badge: "LAER-R: Brug kundens egne tal", badgeColor: "#f59e0b" },
          { speaker: "scene", text: "Indvending 2: Vil prøve LinkedIn lidt endnu" },
          { speaker: "kunde", text: "Vi har kun haft opslaget oppe i 3 uger — måske skal vi give det lidt mere tid" },
          { speaker: "sælger", text: "Det giver god mening at udnytte et opslag man allerede har kørt. Hvornår er din mentale deadline for hvornår det ikke virker?", badge: "Find tærskelværdien", badgeColor: "#f59e0b" },
          { speaker: "kunde", text: "Nok 2-3 uger til" },
          { speaker: "sælger", text: "Så er du i uge 6 af 10. Med 5-6 uger tilbage er den faktiske ansættelses-tidslinje ikke til stede. Vil du have at vi starter profileringen nu, parallelt med dit LinkedIn-opslag — så du har et net under dig?", badge: "Parallelt forløb — fjern enten/eller", badgeColor: "#f59e0b" },
          { speaker: "kunde", text: "...det er faktisk smart. Ja, det vil jeg gerne høre mere om." },
        ],
        insights: [
          "Plan B-close: 'Hvad er din alternative plan?' er et stærkt redskab når kunden vil vente. Lad dem male konsekvensen selv.",
          "Find tærskelværdien: 'Hvornår beslutter du at LinkedIn ikke virker?' Det giver dig en konkret dato at arbejde med.",
          "Parallelt forløb fjerner enten/eller: 'Start profileringen nu mens LinkedIn kører' eliminerer friktionen ved at skifte.",
        ],
      },
      {
        id: "closing",
        emoji: "✅",
        title: "Closing",
        context: "Anders er overbevist men har brug for den rette framing over for bestyrelsen. Luk med opsummerings-close, giv ham ammunition til bestyrelsesgodkendelsen, og sæt næste skridt.",
        lines: [
          { speaker: "sælger", text: "Anders, lad mig opsummere hvad vi er enige om.", badge: "Opsummerings-close", badgeColor: "#4ade80" },
          { speaker: "sælger", text: "Vi er enige om at 10-ugers tidslinjen er kritisk for Q3-launch og at LinkedIn-vejen sandsynligvis ikke når det.", badge: "Bekræft urgency", badgeColor: "#4ade80" },
          { speaker: "sælger", text: "Vi er enige om at 12-måneders garanti og en struktureret 4-kandidat-proces adresserer bestyrelsens retention-krav.", badge: "Bekræft beslutningskriterier", badgeColor: "#4ade80" },
          { speaker: "sælger", text: "Og vi er enige om at 95.000 kr. er en fornuftig investering for at beskytte 1-1,5 million i Q3-risiko.", badge: "Bekræft økonomi", badgeColor: "#4ade80" },
          { speaker: "sælger", text: "Er der noget i den opsummering der ikke stemmer?", badge: "Giv chance for korrektion", badgeColor: "#4ade80" },
          { speaker: "kunde", text: "Nej, det er fair opsummeret" },
          { speaker: "sælger", text: "Godt. Hvad har du brug for for at tage det til bestyrelsen?", badge: "Find næste blocker proaktivt", badgeColor: "#4ade80" },
          { speaker: "kunde", text: "En ROI-beregning og en opsummering af garantibetingelserne" },
          { speaker: "sælger", text: "Det sender jeg dig inden fredag — én side, med tallene vi gennemgik og garantivilkårene. Og hvornår er dit næste bestyrelsesmøde?", badge: "Konkret deadline", badgeColor: "#4ade80" },
          { speaker: "kunde", text: "Om 10 dage" },
          { speaker: "sælger", text: "Perfekt timing. Jeg foreslår vi sætter et 30-minutters opkald dagen inden mødet — så jeg kan svare på eventuelle spørgsmål bestyrelsen har. Hvad siger du?", badge: "Sikr bestyrelsesmødet", badgeColor: "#4ade80" },
          { speaker: "kunde", text: "Det er en god idé. Lad os gøre det." },
          { speaker: "scene", text: "Bestyrelsespræsentationen er sikret. Du kontrollerer narrativet. Sandsynligheden for godkendelse er 90%+." },
        ],
        insights: [
          "Opsummerings-close i B2B er uundgåelig — der er for mange aftaler til at huske. Fold dem ud og bekræft.",
          "Spørg proaktivt hvad der kræves til bestyrelsesgodkendelse. Du skriver dokumentet — ikke Anders.",
          "Opkald inden bestyrelsesmødet: du er nu i rummet uden at være i rummet. Uundgåeligt.",
        ],
      },
    ],
  },

  // ── SCENARIO 6: BILSALG ──────────────────────────────────────────────────
  {
    id: "bil",
    emoji: "🚗",
    title: "Bilsalg — nyt køretøj",
    subtitle: "B2C showroom — familie skifter til elbil, 499.000 kr.",
    color: "#22d3ee",
    customer: "Peter og Mette, 40/38 år, to børn, skifter benzin-SUV til elbil",
    product: "Volvo EX90 Twin Motor AWD — 499.000 kr. inkl. elbilstilskud",
    phases: [
      {
        id: "moede",
        emoji: "🤝",
        title: "Mødet i showroomet",
        context: "Peter og Mette er kommet ind og kigger på EX90'eren. De har booket en testkørsel via hjemmesiden — de er interesserede men ikke besluttet. Åbn med nysgerrighed, ikke produktfakta. Lad dem lede dig.",
        lines: [
          { speaker: "scene", text: "Peter og Mette kigger på en mørkeblå EX90 i showroomet. Du nærmer dig." },
          { speaker: "sælger", text: "Hej begge to! Velkommen. Hvad bringer jer ind i dag?", badge: "Åben og inviterende", badgeColor: "#22d3ee" },
          { speaker: "kunde", text: "Vi har booket en testkørsel på EX90'eren. Vi overvejer at skifte vores RAV4 ud." },
          { speaker: "sælger", text: "Fedt — den er faktisk her lige bag jer. Hvad er det der gør at I overvejer at skifte nu?", badge: "Åbent — lad dem fortælle historien", badgeColor: "#22d3ee" },
          { speaker: "kunde", text: "Benzinprisen er irriterende, og vi vil gerne prøve elbil. Og vi har snakket om at opgradere til noget lidt større." },
          { speaker: "sælger", text: "Og hvad bruger I bilen mest til — er det hverdagskørsel til skole og arbejde, eller er der noget ferie-kørsel involveret?", badge: "Forstå use-case", badgeColor: "#22d3ee" },
          { speaker: "kunde", text: "Begge dele. Vi har to børn, 8 og 11 år. Og vi kører til Sverige om sommeren." },
          { speaker: "sælger", text: "Sverige med to børn — det er en tur! Kender I allerede meget til elbiler, eller er det nyt territorium?", badge: "Kalibrér videnniveau", badgeColor: "#22d3ee" },
          { speaker: "kunde", text: "Vi har ikke prøvet det. Peter er ret fascineret, jeg er lidt mere skeptisk med tanke på rækkevidden." },
          { speaker: "scene", text: "Perfekt åbning: du kender nu familiesammensætning, use-case (hverdagskørsel + Sverige), og det vigtigste: Mette er skeptisk på rækkevidde. Det er din nøgleindvending at løse." },
        ],
        insights: [
          "Lad dem fortælle historien selv: 'Hvad bringer jer ind?' — ikke 'kan jeg hjælpe?'",
          "Kalibrér videnniveau tidligt: Peter er entusiast, Mette er skeptiker. Sælg til begge.",
          "Noterér primær use-case: Sverige om sommeren = langturstest. Forbered rækkeviddedemo.",
        ],
      },
      {
        id: "lytning",
        emoji: "👂",
        title: "Aktiv lytning",
        context: "Mettes rækkevide-skepsis er den reelle barriere. Peter er allerede overbevist — men Mette bestemmer sikkert ligeså meget. Din opgave: giv Mettes bekymring den fulde opmærksomhed. Vis du tager den seriøst.",
        lines: [
          { speaker: "sælger", text: "Mette, rækkevidden — hvad er den konkrete bekymring? Er det den daglige kørsel, eller er det Sverige-turen?", badge: "Adressér skeptikeren direkte", badgeColor: "#818cf8" },
          { speaker: "kunde", text: "Begge. Hvad sker der hvis vi er midt i Sverige og batteriet er næsten tomt?" },
          { speaker: "sælger", text: "Det er en reel bekymring og den fortjener et ærligt svar — ikke bare et flot reklametal.", badge: "Anerkend og respektér skepsisen", badgeColor: "#818cf8" },
          { speaker: "sælger", text: "Må jeg stille et spørgsmål? Hvad er den typiske daglige kørsel — pr. dag samlet for jer begge?", badge: "Forstå den faktiske use-case", badgeColor: "#818cf8" },
          { speaker: "kunde", text: "Vi bor 14 km fra Peters arbejde og 9 km fra mit. Og børnenes skole. Nok 50-60 km samlet om dagen." },
          { speaker: "sælger", text: "50-60 km om dagen... [nikker] Og hvornår lader I typisk bilen op nu — er det natteopladning eller tankstation på vejen?", badge: "Forstå ladning-adfærd", badgeColor: "#818cf8" },
          { speaker: "kunde", text: "Tanker altid på vej hjem. Aldrig om natten." },
          { speaker: "sælger", text: "Forstår det. Det er faktisk en vigtig ting at tale om — ladeadfærd ændrer sig med elbil og det er ikke altid nok folk forbereder sig på.", badge: "Labeling — vis du hører det der ikke siges", badgeColor: "#818cf8" },
          { speaker: "scene", text: "Du har nu den information du behøver: 50-60 km/dag, ingen hjemmelader endnu, og Sverige om sommeren. Det er alle de konkrete datapoints du skal bruge til din pitch." },
        ],
        insights: [
          "Adressér altid skeptikeren direkte — ikke via entusiasten. Mettes tillid er afgørende.",
          "'Det fortjener et ærligt svar' er en stærk sætning der bygger troværdighed øjeblikkeligt.",
          "Ladeadfærd er et blinde spot de fleste førstegangskøbere ikke har tænkt over. Du hjælper dem.",
        ],
      },
      {
        id: "behov",
        emoji: "🎯",
        title: "Behovsafdækning",
        context: "Nu afdækker du systematisk hvad de prioriterer ud over rækkevidden: sikkerhed for børnene, udseende, teknologi, økonomi over tid. Og vigtigst: hvad er dealbreakerne?",
        lines: [
          { speaker: "sælger", text: "Ud over rækkevidden — hvad er de tre ting I absolut skal have i den næste bil?", badge: "SPIN-S: Prioriteringer", badgeColor: "#38bdf8" },
          { speaker: "kunde", text: "Plads til fire plus bagage, sikkerhed, og god lyd i bilen. Vi hører meget podcasts og musik." },
          { speaker: "sælger", text: "Sikkerhed med to børn i bilen — hvad er det vigtigste for jer der?", badge: "SPIN-P: Uddyb", badgeColor: "#f59e0b" },
          { speaker: "kunde", text: "Mette er bekymret for lyden elbiler ikke laver. At andre ikke hører os." },
          { speaker: "sælger", text: "Pedestrian warning-systemet — I ønsker at andre kan høre bilen i byerne?", badge: "SPIN-P: Bekræft", badgeColor: "#f59e0b" },
          { speaker: "kunde", text: "Ja, det er meget det" },
          { speaker: "sælger", text: "Og økonomi — kigger I på den samlede eje-omkostning over 5 år, eller er det indkøbsprisen der driver mest?", badge: "SPIN-S: Finansiel driver", badgeColor: "#38bdf8" },
          { speaker: "kunde", text: "Begge, men vi er nok villige til at betale mere nu hvis det giver besparelse over tid" },
          { speaker: "sælger", text: "Hvad koster I i benzin om måneden i dag nogenlunde?", badge: "SPIN-I setup", badgeColor: "#f87171" },
          { speaker: "kunde", text: "Peter tanker ca. 800 kr. om ugen. Mette nok 500. I alt 5.200 kr. om måneden." },
          { speaker: "sælger", text: "5.200 om måneden. Og hvad tror I strøm ville koste til samme kørsel?", badge: "SPIN-I: Lad dem gætte", badgeColor: "#f87171" },
          { speaker: "kunde", text: "Vi har egentlig ikke regnet på det. Måske 1.000?" },
          { speaker: "sælger", text: "Tæt. Hjemmeopladning koster med jeres kørsel ca. 700-900 kr. om måneden. Besparelsen er 4.200-4.500 om måneden — det er over 50.000 kr. om året.", badge: "SPIN-I: Kvantificér", badgeColor: "#f87171" },
          { speaker: "kunde", text: "50.000 om ÅRET?! Det vidste vi virkelig ikke" },
        ],
        insights: [
          "Lad dem gætte på elbil-udgiften: 'Hvad tror I?' — svaret er altid højere end virkeligheden. Effekten er stærkere.",
          "50.000 kr./år i besparelse: på 10 år er det 500.000 kr. EX90'eren betaler sig selv. Nævn det i pitchen.",
          "Pedestrian warning var en skjult bekymring — du fandt den kun fordi du gravede i 'sikkerhed'.",
        ],
      },
      {
        id: "relation",
        emoji: "💬",
        title: "Relationsopbygning",
        context: "En bilkøbsbeslutning er højt involveret og emotionel. Du handler ikke bilsalg — du hjælper en familie med at tage den rigtige beslutning for de næste 8-10 år. Vær ærlig om begrænsninger og byg en egentlig relation.",
        lines: [
          { speaker: "sælger", text: "Jeg vil gerne sige noget ærligt, inden vi går ud og prøvekører.", badge: "Introducer ærlighed proaktivt", badgeColor: "#22d3ee" },
          { speaker: "kunde", text: "Ja?" },
          { speaker: "sælger", text: "EX90'eren er ikke perfekt til alle. Hvis I ikke kan installere hjemmeoplader eller bor i lejlighed, er den ikke den rigtige løsning. Og til Sverige gælder det om at planlægge ladestop — ligesom man tanker benzin, bare planlagt anderledes.", badge: "Accusation Audit — adressér begrænsningerne selv", badgeColor: "#22d3ee" },
          { speaker: "kunde", text: "Det er godt at du siger det. Vi har faktisk carport og kan installere oplader." },
          { speaker: "sælger", text: "Perfekt — så er det faktisk den ideelle situation. Og Sverige-turen: der er to hurtigladestop på ruten til Göteborg — 20 minutters opladning mens I spiser på en rasteplads. I praksis er det ikke anderledes end en benzinstopp.", badge: "Konkret og ærlig om planlægning", badgeColor: "#22d3ee" },
          { speaker: "sælger", text: "Og her er det der gør EX90 særligt for netop jer: det er den sikreste SUV Volvo nogensinde har lavet. 5-stjernet Euro NCAP 2024 — og den har et acoustisk pedestrian-warningssystem allerede som standard.", badge: "Løs skjult bekymring — Mettes sikkerhed", badgeColor: "#22d3ee" },
          { speaker: "kunde", text: "Pedestrian warning er standard? Det var jeg ikke klar over" },
          { speaker: "scene", text: "Mette smiler første gang i samtalen. Hendes bekymring er løst — ikke af dig, men af fakta du præsenterede ærligt." },
        ],
        insights: [
          "Nævn begrænsningerne selv: lejlighed og manglende oplader. Dem der ikke er i situationen falder fra — dem der er, stoler på dig.",
          "20-minutters ladestop = rasteplads med mad. Omdann bekymringen til en ny vane, ikke et problem.",
          "Mettes skjulte bekymring (pedestrian warning) løses ærligt og konkret. Det er det der vinder hende.",
        ],
      },
      {
        id: "pitch",
        emoji: "💡",
        title: "Pitch — efter testkørslen",
        context: "De har kørt bilen. Peter er solgt. Mette er positivt overrasket. Nu pitcher du EX90 direkte mod de ting de nævnte — plads, sikkerhed, lyd, rækkevidde og økonomi. Alt linkes tilbage til det de sagde.",
        lines: [
          { speaker: "scene", text: "De er kommet tilbage fra testkørslen. Begge smiler." },
          { speaker: "sælger", text: "Hvad synes I? Første reaktion?", badge: "Lad dem sælge til hinanden", badgeColor: "#22d3ee" },
          { speaker: "kunde", text: "Mette: det er faktisk virkelig stille og komfortabelt. Og kæmpe stor. Peter: det er en helt anden oplevelse end RAV4'en" },
          { speaker: "sælger", text: "I nævnte plads til familien og bagageplads til Sverige — bagagerummet er 310 liter normalt og 1.400 liter med sæderne nede. Det er markant mere end jeres RAV4.", badge: "Feature → specifikt benefit", badgeColor: "#22d3ee" },
          { speaker: "sælger", text: "Lydsystem: dette er Bowers & Wilkins audio med 19 højttalere. I sagde I hører meget podcasts og musik.", badge: "Adressér direkte ønskede feature", badgeColor: "#22d3ee" },
          { speaker: "sælger", text: "Og rækkevidde: 580 km WLTP. Med jeres 50-60 km om dagen lader I bilen en gang om ugen — ikke engang. Og det gøres om natten på hjemmeoplader, så den altid er fuld om morgenen.", badge: "Rækkevide løst med brugs-data", badgeColor: "#22d3ee" },
          { speaker: "sælger", text: "Og økonomi: prisen er 499.000 kr. I sparer 50.000 kr. om året i benzin. Det svarer til at bilen betaler sig selv på 10 år bare på brændstofbesparelse — og det er inden vi tager vedligehold med, som er markant lavere for elbiler.", badge: "MMM — total cost of ownership", badgeColor: "#22d3ee" },
          { speaker: "kunde", text: "Lagt op på den måde er det faktisk en investering, ikke en udgift" },
          { speaker: "sælger", text: "Præcis. Og vi har laderpakke til hjemmet inkluderet — Zaptec-hjemmeoplader, installation inkluderet. Det er typisk 12.000-15.000 kr. andre steder — inkluderet hos os.", badge: "Add-on som value, ikke upsell", badgeColor: "#22d3ee" },
        ],
        insights: [
          "Lad dem sælge til hinanden efter testkørslen: 'Hvad synes I?' er den stærkeste pitch du kan give.",
          "Kobl altid feature til deres egne ord: 'I sagde I hører meget podcasts' → Bowers & Wilkins.",
          "Inkluderet hjemmeoplader er en konkret, kvantificerbar value add (12-15.000 kr.) — ikke et salg.",
        ],
      },
      {
        id: "indvendinger",
        emoji: "🛡️",
        title: "Indvendingshåndtering",
        context: "Peter og Mette har to indvendinger: 'vi skal tænke over det' og 'vi har set en Tesla Model Y til 100.000 kr. mindre'. Begge håndteres med respekt og fakta.",
        lines: [
          { speaker: "scene", text: "Indvending 1: Tesla er billigere" },
          { speaker: "kunde", text: "Vi kiggede også på Tesla Model Y — den er 100.000 kr. billigere. Hvad gør EX90 til de penge ekstra?" },
          { speaker: "sælger", text: "Det er et helt fair spørgsmål — Model Y er en god bil. Her er den ærlige forskel.", badge: "Anerkend konkurrenten", badgeColor: "#f59e0b" },
          { speaker: "sælger", text: "Størrelse: Model Y er en kompakt SUV. EX90 er en 7-personers stor SUV med markant mere bagageplads — det er ikke samme segement. Sikkerhed: EX90 er den sikreste i klassen, Euro NCAP 5 stjerner 2024. Og I nævnte sikkerhed var vigtigt for jer.", badge: "Differentier objektivt, ikke defensivt", badgeColor: "#f59e0b" },
          { speaker: "sælger", text: "Lydsystem: Bowers & Wilkins vs. Teslas standardsystem — stor forskel for folk der hører meget. Og Volvo-designet er en personlig sag, men I er her og ikke hos Tesla.", badge: "Faktabaseret, let ironi til sidst", badgeColor: "#f59e0b" },
          { speaker: "kunde", text: "[griner] Det er rigtigt nok" },
          { speaker: "scene", text: "Indvending 2: Skal tænke over det" },
          { speaker: "kunde", text: "Vi vil gerne tænke lidt over det inden vi beslutter" },
          { speaker: "sælger", text: "Selvfølgelig — det er den næststørste investering de fleste familier laver. Det ville være mærkeligt ikke at sove på det.", badge: "Normaliser beslutningspausen", badgeColor: "#f59e0b" },
          { speaker: "sælger", text: "Hvad er det konkret I vil tænke over — er der noget I er usikre på som I gerne vil have besvaret inden da?", badge: "Find den reelle barriere", badgeColor: "#f59e0b" },
          { speaker: "kunde", text: "Egentlig mest finansieringen og hvad vi kan få for RAV4'en i bytte" },
          { speaker: "sælger", text: "Det kan jeg give jer et svar på nu. Vil du have at vi laver en byttepriskalkulation og en finansieringsplan inden I går?", badge: "Fjern barrieren med det samme", badgeColor: "#f59e0b" },
          { speaker: "kunde", text: "Ja, det ville faktisk gøre det nemmere at beslutte" },
        ],
        insights: [
          "Anerkend konkurrenten og differentier objektivt. 'Model Y er en god bil' + 'men det er ikke samme segment' er faktuelt og stærkt.",
          "'I er her og ikke hos Tesla' — let og selvsikker. Det fungerer kun hvis du siger det med et smil.",
          "Fjern barrieren straks: 'Vil du have finansieringsplan inden I går?' Ventetid dræber momentum.",
        ],
      },
      {
        id: "closing",
        emoji: "✅",
        title: "Closing",
        context: "Bytteprisen og finansieringsplanen er klar. Peter og Mette har nu alle oplysninger de manglede. Brug alternativ close, giv dem en konkret grunden til at beslutte i dag, og gør processen enkel.",
        lines: [
          { speaker: "scene", text: "Du har lavet byttepriskalkulation: RAV4 vurderes til 195.000 kr. Finansiering over 84 måneder: 4.900 kr./md." },
          { speaker: "sælger", text: "Her er tallene: jeres RAV4 er vurderet til 195.000 kr. i bytte. Det betyder reelt 304.000 kr. finansieret over 7 år — det er 4.900 kr. om måneden.", badge: "Konkrete tal på bordet", badgeColor: "#4ade80" },
          { speaker: "sælger", text: "I sparer 5.200 kr. om måneden i benzin. Det svarer til at bilen finansierer sig selv — I er faktisk netto plus fra dag ét.", badge: "Netto-beregning: positiv cashflow", badgeColor: "#4ade80" },
          { speaker: "kunde", text: "Vent... vi betaler 4.900 kr. om måneden men sparer 5.200 på benzin? Det er gratis?" },
          { speaker: "sælger", text: "Næsten. Strøm koster ca. 800 kr. om måneden, men ja — den finansierer sig selv i praksis.", badge: "Ærlig præcision", badgeColor: "#4ade80" },
          { speaker: "scene", text: "Alternativ close" },
          { speaker: "sælger", text: "Vil I have den i den mørkeblå I har set, eller er I åbne for en af de andre farver i vores ordre-system — der er en sølv-grå tilgængelig til levering 3 uger tidligere?", badge: "Alternativ close — farve/leveringstid", badgeColor: "#4ade80" },
          { speaker: "kunde", text: "Peter: jeg synes mørkeblå er den flotteste. Mette: 3 uger tidligere lyder fristende..." },
          { speaker: "sælger", text: "I kan naturligvis tage den med hjem og beslutte i aften. Men den sølv-grå er den eneste på lager til den leveringstid — og den nuværende rentemarginal på vores finansieringsmodel er tidsbegrænset til udgangen af denne måned.", badge: "Naturlig urgency — ikke presset", badgeColor: "#4ade80" },
          { speaker: "kunde", text: "Hvad siger du Mette? Jeg synes vi skal gå efter mørkeblå — vi kan vente 3 uger mere." },
          { speaker: "kunde", text: "...ja. Jeg synes faktisk vi skal gøre det." },
          { speaker: "sælger", text: "Perfekt valg. Så starter vi papirerne. Jeg sørger for at hjemmeopladerpakken er koordineret med jeres carport-installation — vi har en elektriker I kan kontakte direkte.", badge: "Luk med service og næste skridt", badgeColor: "#4ade80" },
          { speaker: "scene", text: "Salget er lukket. Netto-cashflow-argumentet vandt. Peter og Mette forlader showroomet med en mørkeblå Volvo EX90 på vej og en plan for hjemmeoplader." },
        ],
        insights: [
          "Netto-cashflow-close: 'I sparer 5.200, betaler 4.900 — bilen finansierer sig selv' er det stærkeste argument i elbilsalg.",
          "Alternativ close på farve/leveringstid: begge svar er et ja. Beslutningen er 'hvilken' ikke 'om'.",
          "Naturlig urgency: 'finansieringsmarginal gælder til månedsskifte' er ægte — og det fremskynder beslutningen.",
          "Luk altid med næste konkrete service: hjemmeopladerpakke og elektriker-kontakt giver tryghed efter købet.",
        ],
      },
    ],
  },

  // ── SCENARIO 7: IT / CLOUD-SERVICES B2B ──────────────────────────────────
  {
    id: "cloud",
    emoji: "☁️",
    title: "Cloud IT-services",
    subtitle: "B2B outbound — Microsoft 365 + IT-sikkerhed, 120-personers virksomhed",
    color: "#60a5fa",
    customer: "Kasper, 46 år, IT-chef, produktionsvirksomhed, 120 ansatte",
    product: "Microsoft 365 Business Premium + managed IT-sikkerhed — 62.000 kr./år",
    phases: [
      {
        id: "moede",
        emoji: "🤝",
        title: "Åbningen — telefonisk møde",
        context: "Du ringer til Kasper der er IT-chef i en produktionsvirksomhed. Han bruger Office 2016 (ikke Microsoft 365) og ingen managed IT-sikkerhed. Du har fundet frem til ham via LinkedIn. Han forventer et salgspitch og er klar til at afkorte samtalen. Brug Challenger-åbning til at åbne med noget der OVERRASKER ham.",
        lines: [
          { speaker: "scene", text: "Kasper tager telefonen. Han lyder rolig men travl." },
          { speaker: "sælger", text: "Hej Kasper, det er Rasmus fra CloudSolutions. Jeg ringer fordi vi har lavet en analyse af produktionsvirksomheder i jeres størrelse — og der er én ting der går igen der overrasker de fleste IT-chefer. Har du 3 minutter?", badge: "Challenger-åbning — skab nysgerrighed", badgeColor: "#60a5fa" },
          { speaker: "kunde", text: "Tre minutter har jeg. Hvad er det?" },
          { speaker: "sælger", text: "62% af virksomheder i din størrelse oplever mindst ét phishing-angreb der rammer en medarbejder inden for 12 måneder. Og 80% af dem bruger ikke multi-faktor-godkendelse. Konsekvensen: gennemsnitlig nedetid på 4 dage og direkte omkostning på 380.000 kr. pr. hændelse.", badge: "Data der skaber urgency", badgeColor: "#60a5fa" },
          { speaker: "kunde", text: "Hmm. Vi har haft et forsøg for 3 måneder siden. Klarede det." },
          { speaker: "sælger", text: "'Klarede det' — hvad skete der præcis?", badge: "Spejling — grav i episoden", badgeColor: "#60a5fa" },
          { speaker: "kunde", text: "En medarbejder klikkede på et link. Vi fik det stoppet inden der skete noget alvorligt." },
          { speaker: "sælger", text: "Godt at det blev stoppet. Hvad brugte I for at opdage det?", badge: "Afdæk hvad de HAR", badgeColor: "#60a5fa" },
          { speaker: "kunde", text: "Vores antivirusprogram fangede det i tide. Held og lykke, ville jeg sige." },
          { speaker: "sælger", text: "Held og lykke — det er faktisk den sætning der bekymrer mig mest. Har du 20 minutter næste uge til at kigge på hvad I faktisk er eksponerede for?", badge: "Konkret næste skridt", badgeColor: "#60a5fa" },
          { speaker: "kunde", text: "Torsdag eftermiddag fungerer." },
        ],
        insights: [
          "Tal i industri-data og konkrete tal — '62%' og '380.000 kr.' er langt stærkere end 'mange virksomheder'.",
          "Spejl 'klarede det' og grind episoden frem. Held og lykke er en reel sikkerhedsrisiko.",
          "Mål for cold call: et møde og curiosity — ikke et salg.",
        ],
      },
      {
        id: "lytning",
        emoji: "👂",
        title: "Aktiv lytning — den virkelige tilstand",
        context: "Kasper er teknisk kompetent og skeptisk. Han ved hvad han har, men ved han hvad han mangler? Din opgave er dyb aktiv lytning: spejl, label, stil graveende spørgsmål om det aktuelle setup og find den skjulte smerte han ikke har formuleret endnu. Pauser er vigtige — lad dem komme.",
        lines: [
          { speaker: "scene", text: "Torsdag mødet. Du starter med en åben gennemgang af deres nuværende setup." },
          { speaker: "sælger", text: "Kasper, inden vi ser på noget specifikt — hvad bruger I i dag af IT-systemer? Start fra bunden.", badge: "Åbent situationsspørgsmål", badgeColor: "#818cf8" },
          { speaker: "kunde", text: "Office 2016 on-prem, lokal Exchange-server, Windows 10/11 på maskinerne og Kaspersky antivirus." },
          { speaker: "sælger", text: "Office 2016... og er I tilfredse med det setup, eller er der ting der irriterer?", badge: "Er du glad for det?", badgeColor: "#818cf8" },
          { speaker: "kunde", text: "Det virker. Men opdateringer er en evig kamp, og Exchange-serveren driller indimellem." },
          { speaker: "sælger", text: "Exchange driller indimellem...", badge: "Spejling — bliv i hans sætning", badgeColor: "#818cf8" },
          { speaker: "kunde", text: "Vi har haft tre nedbrud på 18 måneder. To af dem var i produktionstid — det stoppede faktisk linjen i 4 timer det ene tilfælde." },
          { speaker: "scene", text: "[Du holder en 3-sekunders pause og nikker — giv Kasper plads til at uddybe]" },
          { speaker: "sælger", text: "Produktionslinjen stoppede i 4 timer pga. IT... hvad kostede det?", badge: "Lyt til det der ikke siges — sæt tal på", badgeColor: "#818cf8" },
          { speaker: "kunde", text: "Det vil vi helst ikke tænke på. Nok 150-200.000 kr. i tabt produktion og overtid." },
          { speaker: "sælger", text: "Det lyder som om IT-infrastrukturen er blevet forretningskritisk på en måde der ikke altid var tilfældet.", badge: "Labeling — ram det præcist", badgeColor: "#818cf8" },
          { speaker: "kunde", text: "...ja. Det er en god måde at sige det på. Vi er vokset, og IT er ikke vokset med." },
          { speaker: "sælger", text: "IT er ikke vokset med. [pause] Hvad er den ene ting i dit nuværende setup du ville kunne gøre bedre, hvis du skulle pege på noget?", badge: "Gap-spørgsmål: hvad ville du gøre bedre", badgeColor: "#818cf8" },
          { speaker: "kunde", text: "Ærlig talt? Sikkerheden. Jeg sover ikke altid godt om natten med det vi har." },
          { speaker: "scene", text: "Guldoplysning: Kasper sover ikke godt om natten. Det er den reelle smerte — ikke opdateringer, men ansvar og frygt for det næste nedbrud." },
        ],
        insights: [
          "'Er du tilfreds med det, eller er der noget der irriterer?' — det åbne både/og-spørgsmål giver altid information.",
          "3-sekunders pause efter 'Exchange driller indimellem' gav dig 150.000 kr.-oplysningen.",
          "'Hvad er én ting du ville gøre bedre?' er et af de stærkeste gap-spørgsmål. Kunden definerer selv forbedringen.",
          "Labeling 'IT er ikke vokset med' — Kasper ejede erkendelsen. Det er stærkere end at du siger det.",
        ],
      },
      {
        id: "behov",
        emoji: "🎯",
        title: "Behovsafdækning — SPIN + dyberegående spørgsmål",
        context: "Nu graver du systematisk med SPIN og bruger skaleringssspørgsmål til at kvantificere tilfredsheden. 'Fra 1-10, hvor tryg er du?' og 'Hvad skulle til for at du var 9 i stedet for 6?' er guld til at afdække gaps. Afdæk også beslutningsprocessen.",
        lines: [
          { speaker: "scene", text: "SPIN — Situationsspørgsmål: forstå det tekniske grundlag" },
          { speaker: "sælger", text: "Hvornår er Exchange-serveren fra, og hvem supporterer den?", badge: "SPIN-S", badgeColor: "#38bdf8" },
          { speaker: "kunde", text: "Den er fra 2017, og vi har et eksternt IT-firma der supporterer på timebasis." },
          { speaker: "sælger", text: "Timebasis — hvad bruger I typisk om måneden?", badge: "SPIN-S: Kvantificér support", badgeColor: "#38bdf8" },
          { speaker: "kunde", text: "10-15 timer månedligt. Det er nok 12-15.000 kr. om måneden." },
          { speaker: "scene", text: "SPIN — Problemspørgsmål" },
          { speaker: "sælger", text: "Hvad er den situation du frygter mest set fra et IT-sikkerhedssynspunkt?", badge: "SPIN-P: Frygten", badgeColor: "#f59e0b" },
          { speaker: "kunde", text: "Ransomware. Vi har set det ramme andre i branchen. Det stopper hele produktionen og det tager uger at komme sig." },
          { speaker: "sælger", text: "Fra 1 til 10 — hvor tryg er du på at jeres nuværende setup ville stoppe et ransomware-angreb?", badge: "Skaleringssspørgsmål — kvantificér trygheden", badgeColor: "#f59e0b" },
          { speaker: "kunde", text: "Ærlig talt? En 4. Måske 5." },
          { speaker: "sælger", text: "En 4 ud af 10. Hvad skulle der til for at du var en 8 eller 9?", badge: "Gap-spørgsmål: hvad skal til?", badgeColor: "#f59e0b" },
          { speaker: "kunde", text: "Multi-faktor-godkendelse på alle konti, ordentlig e-mail-filtering, og at nogen aktivt overvåger trusler — ikke bare reagerer." },
          { speaker: "scene", text: "Kasper har nu beskrevet præcis hvad Microsoft 365 Business Premium + managed sikkerhed leverer. Du behøver ikke sige det — det er hans egne ord." },
          { speaker: "scene", text: "SPIN — Implikationsspørgsmål" },
          { speaker: "sælger", text: "Hvad ville det betyde for forretningen, hvis et ransomware-angreb ramte jer på en tirsdag morgen?", badge: "SPIN-I: Konkretisér scenariet", badgeColor: "#f87171" },
          { speaker: "kunde", text: "Produktionen stopper. Alle systemer er nede. Vi estimerer 5-7 dages nedetid og 1-2 millioner i tab minimum." },
          { speaker: "sælger", text: "1-2 millioner. [pause] Og det er udover hvad I betaler det IT-firma for at rydde op?", badge: "SPIN-I: Totalbeløbet", badgeColor: "#f87171" },
          { speaker: "kunde", text: "Ja, incident response koster isoleret 200-400.000 kr. mere. Vi kender branchen." },
          { speaker: "scene", text: "MEDDIC — Beslutningsproces" },
          { speaker: "sælger", text: "Hvem er det der skal godkende en investering som denne hos jer?", badge: "MEDDIC: Economic Buyer", badgeColor: "#a78bfa" },
          { speaker: "kunde", text: "Mig og CFO'en. Over 50.000 kr. om året skal CFO med." },
          { speaker: "sælger", text: "Hvad er det vigtigste for din CFO — ROI, compliance, eller pris per bruger?", badge: "MEDDIC: Criteria", badgeColor: "#a78bfa" },
          { speaker: "kunde", text: "Han tænker i ROI og GDPR-compliance. Vi er i gang med en ISO 27001-certificering." },
          { speaker: "sælger", text: "ISO 27001 — hvornår er jeres audit?", badge: "MEDDIC: Timeline via compliance", badgeColor: "#a78bfa" },
          { speaker: "kunde", text: "Om 5 måneder. Og vi mangler to kontroller der kræver MFA og mail-gateway." },
        ],
        insights: [
          "Skaleringssspørgsmål '1-10 hvor tryg?': '4 ud af 10' er stærkere end enhver frygtsætning du kan sige.",
          "'Hvad skal til for at du er 8 i stedet for 4?' — Kasper definerede præcis produktets features med sine egne ord.",
          "ISO 27001-audit om 5 måneder er en ekstern deadline du ikke skabte. Den drives af compliance, ikke dig.",
        ],
      },
      {
        id: "relation",
        emoji: "💬",
        title: "Relationsopbygning — tillid på teknisk niveau",
        context: "Kasper er skeptisk over for IT-sælgere der lover for meget og leverer for lidt. Han har hørt pitchen om 'alt-i-én-løsning' mange gange. Din opgave: vis at du forstår hans verden teknisk, anerkend kompleksiteten ærligt, og positionér dig som rådgiver der taler med ham — ikke til ham.",
        lines: [
          { speaker: "sælger", text: "Kasper, jeg vil gerne sige noget som mange IT-sælgere ikke siger.", badge: "Accusation Audit", badgeColor: "#60a5fa" },
          { speaker: "kunde", text: "Nu er jeg nysgerrig" },
          { speaker: "sælger", text: "Migration fra on-prem Office og Exchange til 365 er ikke trivielt. Det kræver migrering af maildata, opsætning af Entra ID, og omtræning af brugerne. De første 4-6 uger vil der opstå spørgsmål og gnidninger. Det lover jeg.", badge: "Ærlig om implementation", badgeColor: "#60a5fa" },
          { speaker: "kunde", text: "Ja, det er præcis hvad jeg er bekymret for. Vores produktionsmedarbejdere er ikke teknisk stærke." },
          { speaker: "sælger", text: "Og det er den rigtige bekymring. Hvad har du gjort tidligere for at minimere friktion ved IT-ændringer?", badge: "Spørg ind til hans erfaring og ekspertise", badgeColor: "#60a5fa" },
          { speaker: "kunde", text: "Vi bruger altid super-brugere i produktionen som 'ambassadører'. Det har virket godt." },
          { speaker: "sælger", text: "Super-bruger-modellen er præcis hvad vi anbefaler — og vi har et onboarding-program der er bygget til det. Vi uddanner dine super-brugere først, og de driver resten. Din rolle er mere at facilitere end at supportere.", badge: "Byg Kaspers løsning ind i din plan", badgeColor: "#60a5fa" },
          { speaker: "kunde", text: "Det lyder faktisk gennemtænkt" },
          { speaker: "sælger", text: "Og hvad var grunden til at I valgte det nuværende setup i sin tid — Office 2016 og lokal Exchange?", badge: "Hvad var grunden til at du valgte det?", badgeColor: "#60a5fa" },
          { speaker: "kunde", text: "Kontrol. Vi ville have data lokalt og ikke i skyen. Det var 2016 — cloud var nyt og ukendt." },
          { speaker: "sælger", text: "Det er en forståelig beslutning for 2016. Hvad er din holdning til cloud nu — er det stadig en bekymring eller har noget ændret sig?", badge: "Brug fortiden til at åbne en ny holdning", badgeColor: "#60a5fa" },
          { speaker: "kunde", text: "Verdenen er ændret sig. Vi bruger allerede Teams og SharePoint. Kontrolargumentet holder ikke længere." },
        ],
        insights: [
          "Spørg 'hvad var grunden til at du valgte det i sin tid?' — det afslører den historiske barriere og åbner for om den stadig er reel.",
          "Brug super-bruger-modellen: inkorporer kundens egen best practice i din plan. Det er ikke din løsning — det er ham der har lavet den.",
          "Accusation Audit om implementation: Kasper er ikke overrasket. Han respekterer ærlighed.",
        ],
      },
      {
        id: "pitch",
        emoji: "💡",
        title: "Pitch — ROI, compliance og tryghed",
        context: "Nu pitcher du tre ting: operationel ROI (billigere end nuværende setup + risiko), ISO 27001-compliance (konkrete kontroller der mangler), og implementationsplan (trygheden ved processen).",
        lines: [
          { speaker: "sælger", text: "Kasper, lad mig sætte det op konkret.", badge: "Start med problem, ikke produkt", badgeColor: "#60a5fa" },
          { speaker: "sælger", text: "I betaler i dag 12-15.000 kr./md. til eksternt IT-firma på timebasis — det er 144-180.000 kr./år. Dertil Exchange-server vedligehold og licenser: ca. 25.000 kr. det er 170-200.000 kr./år samlet for et setup der scorede 4/10 på sikkerhedstryghed.", badge: "Total cost of ownership — nuværende setup", badgeColor: "#60a5fa" },
          { speaker: "sælger", text: "Microsoft 365 Business Premium inkl. Intune, Defender og managed sikkerhed: 62.000 kr. om året for 120 brugere. Det er 108.000-138.000 kr. billigere — og det er inden vi tager en potentiel ransomware-hændelse med.", badge: "Pris og besparelse", badgeColor: "#60a5fa" },
          { speaker: "sælger", text: "Til ISO 27001: MFA er standard i 365, og vores mail-gateway dækker præcis de to kontroller du nævnte mangler. Jeg kan give dig compliance-rapporten fra day one.", badge: "Løs compliance-huller direkte", badgeColor: "#60a5fa" },
          { speaker: "sælger", text: "Og til din CFO: 62.000 kr. om året versus 170-200.000 kr. nuværende setup — plus eliminering af risikoen for 1-2 millioner i ransomware-tab. Det er ikke en IT-udgift. Det er en forsikring der betaler sig selv.", badge: "CFO-pitchen: MMM", badgeColor: "#60a5fa" },
          { speaker: "kunde", text: "Sat op sådan — det er svært at argumentere imod" },
        ],
        insights: [
          "Total cost of ownership er afgørende i IT-salg: licenser + support + risiko. Vind på den samlede sum, ikke på produktprisen.",
          "Compliance-gap som pitch: 'Jeg kan give dig compliance-rapporten fra day one' er en konkret, tidsbunden leverance.",
          "CFO-pitch: ramme det som forsikring, ikke IT-udgift. Det ændrer samtalen i budgetmødet.",
        ],
      },
      {
        id: "indvendinger",
        emoji: "🛡️",
        title: "Indvendingshåndtering — 4 indvendinger",
        context: "Kasper rejser fire indvendinger: 'vi har det fint som det er', 'det er dyrt at flytte data', 'mine medarbejdere er ikke klar til cloud', og 'vi er bekymrede for GDPR i Microsoft-cloud'. Alle er håndterbare med LAER og fakta.",
        lines: [
          { speaker: "scene", text: "Indvending 1: Vi har det fint som det er" },
          { speaker: "kunde", text: "Vi klarer os jo egentlig fint — det er ikke som om det brænder på" },
          { speaker: "sælger", text: "Det er rigtigt at det ikke brænder på i dag. Og det er præcis det øjeblik man bør kigge på det — ikke bagefter.", badge: "LAER-A: Anerkend", badgeColor: "#f59e0b" },
          { speaker: "sælger", text: "Du nævnte selv at du giver sikkerheden en 4 ud af 10 og at du sover dårligt om natten. Er det 'fint' nok, givet at ISO 27001-audit er om 5 måneder?", badge: "Brug deres egne ord mod indvendingen", badgeColor: "#f59e0b" },
          { speaker: "kunde", text: "...nej, det er det nok ikke" },
          { speaker: "scene", text: "Indvending 2: Det er dyrt at flytte data" },
          { speaker: "kunde", text: "Migrering af al vores Exchange-data lyder dyrt og besværligt" },
          { speaker: "sælger", text: "Det er en legitim bekymring — migrationer kan gå galt. Hvad er din konkrete frygt — datatab, nedetid, eller tid?", badge: "LAER-E: Udforsk den præcise frygt", badgeColor: "#f59e0b" },
          { speaker: "kunde", text: "Nedetid. Produktionen kan ikke vente på at en migration er færdig." },
          { speaker: "sælger", text: "Vi kører altid hybrid migration: ny mail kører i 365 parallelt med Exchange i 4-6 uger. Der er nul nedetid. Exchange slukkes først når alt er valideret. Det er standardproceduren for produktionsvirksomheder.", badge: "LAER-R: Konkret teknisk svar", badgeColor: "#f59e0b" },
          { speaker: "scene", text: "Indvending 3: Medarbejderne er ikke klar til cloud" },
          { speaker: "kunde", text: "Mine folk i produktionen er ikke tech-savvy. De vil ikke kunne finde ud af det" },
          { speaker: "sælger", text: "Det hørte jeg fra dig tidligere — og det er præcis derfor vi bruger super-bruger-modellen du beskrev. De to mest IT-kompetente i hvert team. De er klar inden alle andre starter.", badge: "Brug kundens egen model", badgeColor: "#f59e0b" },
          { speaker: "sælger", text: "Og Office 365 ser fra brugerperspektiv næsten identisk ud med Office 2016. Det er ikke en revolution for dem — det er en opdatering.", badge: "Minimér forandringen i brugernes øjne", badgeColor: "#f59e0b" },
          { speaker: "scene", text: "Indvending 4: GDPR og Microsoft-cloud" },
          { speaker: "kunde", text: "Vi er bekymrede for om vores data er sikre i Microsofts cloud ifm. GDPR" },
          { speaker: "sælger", text: "Det er et godt spørgsmål og én jeg hører tit. Her er det faktuelle svar: Microsoft 365 kan konfigureres til at opbevare alle data i EU — vi sætter Data Residency til specifikt EU North og EU West. Derudover er Microsoft ISO 27001-certificeret og opfylder alle GDPR-krav under Datatilsynets vejledning.", badge: "Faktabaseret, konkret svar", badgeColor: "#f59e0b" },
          { speaker: "sælger", text: "Vil du have at jeg sender dig Microsofts GDPR-compliance-dokumentation og Data Processing Agreement? Det er præcis det din DPO har brug for.", badge: "Proaktiv — fjern den tekniske barriere", badgeColor: "#f59e0b" },
          { speaker: "kunde", text: "Ja tak, det ville min DPO faktisk sætte pris på" },
        ],
        insights: [
          "Brug altid kundens egne ord: '4/10 sikkerhed og dårlig nattesøvn' afvæbner 'vi har det fint'-indvendingen øjeblikkeligt.",
          "Hybrid migration eliminerer nedetid-bekymringen teknisk. Hav svaret klar — det signalerer ekspertise.",
          "Minimér forandringen for slutbrugere: 'ser næsten identisk ud med 2016' fjerner change-frygten.",
          "GDPR: send dokumentation proaktivt. Det giver troværdighed og fjerner en bloker inden den bliver stor.",
        ],
      },
      {
        id: "closing",
        emoji: "✅",
        title: "Closing — opsummering og CEO-forberedelse",
        context: "Kasper er overbevist. Men CFO'en skal med. Luk dette møde med et konkret næste skridt, en opsummering der giver Kasper ammunition, og en dato for CFO-mødet.",
        lines: [
          { speaker: "sælger", text: "Kasper, lad mig opsummere det vi er nået frem til.", badge: "Opsummerings-close", badgeColor: "#4ade80" },
          { speaker: "sælger", text: "Vi er enige om at jeres nuværende setup koster 170-200.000 kr./år og giver dig en sikkerhedstryghed på 4/10.", badge: "Bekræft nuværende smerte", badgeColor: "#4ade80" },
          { speaker: "sælger", text: "Vi er enige om at ISO 27001-audit om 5 måneder kræver MFA og mail-gateway — og at de mangler i dag.", badge: "Bekræft compliance-urgency", badgeColor: "#4ade80" },
          { speaker: "sælger", text: "Og vi er enige om at 62.000 kr./år giver bedre dækning, eliminerer 12-15.000 kr./md. i supporthonorarer og dækker de manglende kontroller.", badge: "Bekræft ROI", badgeColor: "#4ade80" },
          { speaker: "sælger", text: "Er der noget i den opsummering der ikke er præcis?", badge: "Åbn for korrektion", badgeColor: "#4ade80" },
          { speaker: "kunde", text: "Nej, det er rimeligt opsummeret" },
          { speaker: "sælger", text: "Hvad har du brug for fra mig for at du kan tage det til din CFO?", badge: "Find CFO-blokeren", badgeColor: "#4ade80" },
          { speaker: "kunde", text: "En opsummering med ROI-tal, GDPR-dokumentationen, og hvad implementationen koster i nedtid" },
          { speaker: "sælger", text: "Det har du inden fredag — én side til CFO, GDPR-pakke til DPO, og nedetid-analyse. Hvornår er dit næste CFO-møde?", badge: "Konkret levering + dato", badgeColor: "#4ade80" },
          { speaker: "kunde", text: "Mandag om 2 uger" },
          { speaker: "sælger", text: "Perfekt. Jeg foreslår vi sætter 30 minutter torsdag inden CFO-mødet — så du er fuldt forberedt på de spørgsmål han vil stille. Hvad siger du?", badge: "Sikr CFO-mødet", badgeColor: "#4ade80" },
          { speaker: "kunde", text: "Det er en god ide. Booker vi det nu?" },
          { speaker: "scene", text: "CFO-mødet er sikret. Du skriver ROI-narrativet. Kasper er champion med ammunition. Sandsynlighed for godkendelse: 85%+" },
        ],
        insights: [
          "Opsummeringsclose i IT-salg: list nuværende cost, compliance-gap og ROI — hold det præcist og kortfattet.",
          "Tre leverancer inden fredag: ROI-opsummering, GDPR-pakke, nedetid-analyse. Sæt det i kalender nu.",
          "Torsdag inden CFO-mødet: du er med i samtalen uden at være til stede. Det er afgørende i B2B.",
        ],
      },
    ],
  },

  // ── SCENARIO 8: LIVSFORSIKRING / PENSION B2C ──────────────────────────────
  {
    id: "pension",
    emoji: "🔐",
    title: "Livsforsikring & pension",
    subtitle: "B2C rådgivningsmøde — familieforsørger, 42 år, mangler dækning",
    color: "#a3e635",
    customer: "Mikkel, 42 år, gift, tre børn (9, 12, 15 år), seniorkonsulent",
    product: "Livsforsikring + kritisk sygdom + pensionssupplement — 1.840 kr./md.",
    phases: [
      {
        id: "moede",
        emoji: "🤝",
        title: "Åbningen — indledende samtale",
        context: "Mikkel har booket et møde via banken fordi han lige har fået et nyt job og gerne vil gennemgå sin økonomi. Han tænker ikke aktivt på forsikring. Din opgave: find ud af hvad der er vigtigt for ham, lad ham fortælle om familien og livet — og lade ham føre dig til emnet selv.",
        lines: [
          { speaker: "scene", text: "Møde hos banken. Mikkel er afslappet — han forventer primært en snak om investering." },
          { speaker: "sælger", text: "Mikkel, godt at mødes. Tillykke med det nye job — det lyder som en stor ændring. Hvad er det der gør det rigtigt at kigge på økonomien nu?", badge: "Åbn med det personlige", badgeColor: "#a3e635" },
          { speaker: "kunde", text: "Ny løn, nyt firmaordning — vi vil bare sikre at alt er sat ordenligt op. Det har vi ikke kigget på i årevis." },
          { speaker: "sælger", text: "Smart. Hvad er det vigtigste for dig og familien rent finansielt de næste 5-10 år?", badge: "Åbent fremadskuende spørgsmål", badgeColor: "#a3e635" },
          { speaker: "kunde", text: "At vi har frihed til at vælge. Vi drømmer om at afdrage hurtigere på huset, og måske at min kone kan gå ned i tid." },
          { speaker: "sælger", text: "Friheden til at vælge — det er et godt mål. Og hvad er de ting der ville forhindre den frihed, hvis de gik galt?", badge: "Åbn for risikosiden naturligt", badgeColor: "#a3e635" },
          { speaker: "kunde", text: "Uf, hvis jeg mister jobbet... eller hvis noget sker med min helbred." },
          { speaker: "sælger", text: "Noget sker med helbredet... du siger det selv. Er det noget du har tænkt konkret over?", badge: "Lad kunden åbne emnet selv", badgeColor: "#a3e635" },
          { speaker: "kunde", text: "Ikke rigtig. Min kone er hjemmegående halvtid med børnene. Hvis jeg ikke kan arbejde, er det katastrofe." },
          { speaker: "scene", text: "Mikkel åbnede selv for forsikringssamtalen. Du behøvede ikke styre derhen — han bragte det op via de rigtige spørgsmål." },
        ],
        insights: [
          "'Hvad er de ting der ville forhindre den frihed?' — det er et elegant spørgsmål der åbner risikosiden naturligt.",
          "Lad kunden sige ordet selv: 'Hvis noget sker med mit helbred' er langt mere kraftfuldt end 'hvad nu hvis du bliver syg'.",
          "Det nye job er anledning til et holistisk tjek — brug det som ramme, ikke kun forsikring.",
        ],
      },
      {
        id: "lytning",
        emoji: "👂",
        title: "Aktiv lytning — familiens afhængighed",
        context: "Mikkel er familieforsørger. Konen arbejder halvtid. Tre børn. Huset. Drømmene. Din opgave er at hjælpe Mikkel se sin reelle eksponering — ikke ved at skræmme, men ved at lytte dig ind til hvad der VIRKELIG er på spil, og spejle det klart tilbage.",
        lines: [
          { speaker: "sælger", text: "Mikkel, du sagde 'katastrofe' — hvad mener du præcist?", badge: "Udforsk ordet de bruger", badgeColor: "#818cf8" },
          { speaker: "kunde", text: "Vi har et huslån på 2,4 millioner. Vores udgifter er høje med tre børn. Hvis jeg ikke kan arbejde, er der ikke råd til noget. Vi ville sandsynligvis miste huset." },
          { speaker: "sælger", text: "I ville miste huset... [pause] Har I snakket om det?", badge: "Spejling + pause", badgeColor: "#818cf8" },
          { speaker: "kunde", text: "Nej, egentlig ikke direkte. Det er ubehageligt at snakke om." },
          { speaker: "sælger", text: "Det er ubehageligt — men det er præcis det der gør det vigtigt.", badge: "Labeling — anerkend og fremhæv", badgeColor: "#818cf8" },
          { speaker: "sælger", text: "Hvad har du i dag af dækning — ved du hvad din arbejdsgiver dækker hvis du bliver alvorligt syg?", badge: "Hvad har du i dag?", badgeColor: "#818cf8" },
          { speaker: "kunde", text: "Jeg ved at de har en eller anden pension og jeg tror der er gruppelivsforsikring... men jeg kender ikke beløbene." },
          { speaker: "sælger", text: "Du ved det ikke. [nikker] Er du tilfreds med at det er der, men du ikke ved hvad det dækker?", badge: "Er du glad/tilfreds spørgsmål", badgeColor: "#818cf8" },
          { speaker: "kunde", text: "...nej, egentlig ikke. Jeg burde vide det." },
          { speaker: "sælger", text: "Fra 1 til 10 — hvor tryg er du på at din familie er økonomisk beskyttet, hvis du i morgen fik en alvorlig diagnose?", badge: "Skaleringssspørgsmål", badgeColor: "#818cf8" },
          { speaker: "kunde", text: "[tænker] ...5. Måske 4." },
          { speaker: "sælger", text: "En 4. Hvad skulle der til for at du var en 8 eller 9?", badge: "Gap-spørgsmål", badgeColor: "#818cf8" },
          { speaker: "kunde", text: "At vide at huset er betalt og at min kone ikke behøver stresse over regninger i mindst 5-7 år." },
          { speaker: "scene", text: "Mikkel har med egne ord defineret dækningskravet: huset betalt + familien forsørget i 5-7 år. Det er din pitch i hans ord." },
        ],
        insights: [
          "Spørg 'er du tilfreds med at det er der, men du ikke kender beløbene?' — det afslører en blinde plet kunden accepterede uden at tænke over.",
          "Skaleringssspørgsmål 1-10: '4 ud af 10' er en stærkere erkendelse end en lang forklaring fra dig.",
          "Gap-spørgsmål: Mikkel definerede præcis hvad han har brug for — huset betalt + 5-7 år. Det er dit pitch-fundament.",
          "Labeling 'ubehageligt at snakke om — men det er præcis det der gør det vigtigt': det er ærligt og skaber respekt.",
        ],
      },
      {
        id: "behov",
        emoji: "🎯",
        title: "Behovsafdækning — SPIN og hvad I har i dag",
        context: "Nu kortlægger du systematisk hvad de faktisk HAR, hvad der MANGLER, og kvantificerer risikoen. Spørg til det konkrete: hvad dækker arbejdsgiver? Hvad har de selv? Hvad er gabet? Og hvad koster gabet?",
        lines: [
          { speaker: "scene", text: "SPIN-S: Gennemgang af eksisterende dækning" },
          { speaker: "sælger", text: "Lad os kortlægge hvad I har præcist. Hvad er jeres husstand månedlige udgifter?", badge: "SPIN-S: Basis for dækning", badgeColor: "#38bdf8" },
          { speaker: "kunde", text: "Huslån 14.500, bil og forsikringer nok 6.000, mat og forbrug 12.000 og aktiviteter til børn. I alt ca. 40.000 om måneden." },
          { speaker: "sælger", text: "40.000 om måneden. Og din kones arbejdsindkomst, hvad er den?", badge: "SPIN-S: Dækning af gap", badgeColor: "#38bdf8" },
          { speaker: "kunde", text: "Hun er halv tid — netto ca. 14.000 kr." },
          { speaker: "sælger", text: "Så hvis du ikke kan arbejde, er der et månedligt gab på 26.000 kroner som ikke er dækket.", badge: "SPIN-P: Gabet er konkret", badgeColor: "#f59e0b" },
          { speaker: "kunde", text: "...ja, det er jeg faktisk aldrig kommet ned og regnet. Det er mange penge." },
          { speaker: "scene", text: "SPIN-I: Konsekvenser over tid" },
          { speaker: "sælger", text: "Hvad tror du der ville ske med huset og familien, hvis det gab var der i 12 måneder?", badge: "SPIN-I: Tidslinje", badgeColor: "#f87171" },
          { speaker: "kunde", text: "Vi ville sælge bilen først, skære alt ned — men huset... det kan vi nok ikke redde et år uden min indkomst." },
          { speaker: "sælger", text: "Og din kone ville stå med tre børn, et hus der skal sælges, og én indkomst. Hvad ville det gøre ved hende?", badge: "SPIN-I: Menneskelig konsekvens", badgeColor: "#f87171" },
          { speaker: "kunde", text: "[pause] ...det vil jeg slet ikke tænke på. Hun ville knække sammen." },
          { speaker: "sælger", text: "Det er en svar der viser at det ikke handler om penge — det handler om at beskytte hende.", badge: "Labeling — nå kernen", badgeColor: "#f87171" },
          { speaker: "kunde", text: "Ja. Det er præcis det." },
          { speaker: "scene", text: "SPIN-N: Need-Payoff" },
          { speaker: "sælger", text: "Du sagde du ville have huset betalt og familien forsørget i 5-7 år. Hvad ville det betyde for dig at vide at det er sikret — uanset hvad der sker?", badge: "SPIN-N: Kunden maler tryghed", badgeColor: "#4ade80" },
          { speaker: "kunde", text: "Det ville give ro. Jeg tror det er noget jeg ikke har tilladt mig selv at tænke på som reelt muligt." },
        ],
        insights: [
          "Gabet er konkret: 40.000 - 14.000 = 26.000 kr./md. Kunden regnede selv ud. Det er stærkere end enhver statistik.",
          "SPIN-I på den menneskelige konsekvens: 'hun ville knække sammen' er sagt af kunden — ikke dig. Det er kraftfuldt.",
          "Labeling: 'det handler ikke om penge — det handler om at beskytte hende.' Mikkel sagde JA og ejede det.",
        ],
      },
      {
        id: "relation",
        emoji: "💬",
        title: "Relationsopbygning",
        context: "Mikkel er åben og emotionelt engageret. Nu er relationen afgørende: vær ærlig om hvad han faktisk har (sikkert lidt) og hvad der mangler, og vis at du er på hans side — ikke på salgets side. Brug hans egne ord.",
        lines: [
          { speaker: "sælger", text: "Mikkel, jeg har haft mange samtaler som denne. Og det er altid den samme ting der overrasker folk — ikke at de ingen dækning har, men at de har delvis dækning og tror de er dækket.", badge: "Normalize — du er ikke unik, og det er okay", badgeColor: "#a3e635" },
          { speaker: "kunde", text: "Det er præcis det jeg sidder med nu" },
          { speaker: "sælger", text: "Og det er faktisk godt at vi sidder her. For nu kan vi rette det. Det der er ærgerligt er folk der sidder i den situation og aldrig finder ud af det.", badge: "Vend det til positivt — du handler", badgeColor: "#a3e635" },
          { speaker: "sælger", text: "Jeg vil gerne sige en ting direkte: du kan sikkert finde billigere forsikringer end det jeg vil foreslå — og det er okay. Men jeg er ikke ude på at sælge dig den billigste. Jeg er ude på at finde den dækning der faktisk dækker det du har brug for.", badge: "Accusation Audit — prisfokus", badgeColor: "#a3e635" },
          { speaker: "kunde", text: "Det sætter jeg pris på. Jeg er ikke ude efter det billigste. Jeg vil have at det virker." },
          { speaker: "sælger", text: "Det er det rigtige mindset. Og hvad var grunden til at I aldrig har gennemgået jeres forsikringer ordentligt tidligere?", badge: "Hvad var grunden til at...?", badgeColor: "#a3e635" },
          { speaker: "kunde", text: "Det er aldrig blevet presserende. Vi har klaret os godt, og man tænker ikke på det mens alt er godt." },
          { speaker: "sælger", text: "Det er menneskeligt. De fleste handler først når noget sker — og det er for sent.", badge: "Labeling — forklare adfærd uden at dømme", badgeColor: "#a3e635" },
          { speaker: "scene", text: "Mikkel er engageret og tillidsfuld. Du er rådgiver, ikke sælger." },
        ],
        insights: [
          "'Det er altid den samme ting der overrasker folk' — normaliser situationen. Det fjerner skam og åbner op.",
          "'Hvad var grunden til at I aldrig har gennemgået det?' — åbner op for selvrefleksion og styrker motivation til at handle nu.",
          "Accusation Audit om pris: 'Du kan finde billigere — og det er okay' er udladet for manipulation og skaber massiv tillid.",
        ],
      },
      {
        id: "pitch",
        emoji: "💡",
        title: "Pitch — tre lag af beskyttelse",
        context: "Pitch tre konkrete produkter der tilsammen dækker Mikkels eget krav: huset betalt + 5-7 år forsørgelse. Brug hans egne ord og tal. Ingen jargon.",
        lines: [
          { speaker: "sælger", text: "Ud fra hvad du har fortalt mig, handler løsningen om tre ting.", badge: "Tre lag — struktureret pitch", badgeColor: "#a3e635" },
          { speaker: "sælger", text: "Én: livsforsikring på 2,5 millioner. Du sagde huset skal betales og familien forsørges. 2,5 millioner dækker restgælden og giver din kone et pusterum på 5-7 år. Månedlig præmie: 580 kr.", badge: "Lag 1: livsforsikring", badgeColor: "#a3e635" },
          { speaker: "sælger", text: "To: kritisk sygdomsforsikring på 1 million. De fleste tror de dør — men sandsynligheden for at overleve kræft, blodprop eller apopleksi er steget markant. Den forsikring udbetaler ved diagnosen — ikke ved død. Det giver jer likviditet til behandling og til at omstille hverdagen.", badge: "Lag 2: kritisk sygdom", badgeColor: "#a3e635" },
          { speaker: "kunde", text: "Det vidste jeg faktisk ikke man kunne forsikre. Det er interessant." },
          { speaker: "sælger", text: "Tre: pensionssupplement på 2.000 kr./md. oveni din firmapension. Du nævnte frihed til at vælge — det her er frihed til at gå af i tide.", badge: "Lag 3: pension", badgeColor: "#a3e635" },
          { speaker: "sælger", text: "Samlet månedlig udgift: 1.840 kr. Det er ca. det I bruger på takeaway om måneden — men det køber noget din kone kan sove på.", badge: "MMM — sammenlign med noget konkret", badgeColor: "#a3e635" },
          { speaker: "kunde", text: "1.840 for at fjerne det der bekymrer mig. Sat på den måde..." },
        ],
        insights: [
          "Tre lag giver struktur og forhindrer at kunden overvældes. Liv → kritisk sygdom → pension.",
          "Kritisk sygdom er det overraskende produkt — de fleste kender det ikke. Det åbner interesse.",
          "MMM: sammenlign med noget hverdagsligt. '1.840 kr. er ca. det I bruger på takeaway' er konkret og let at forholde sig til.",
        ],
      },
      {
        id: "indvendinger",
        emoji: "🛡️",
        title: "Indvendingshåndtering — 4 indvendinger",
        context: "Mikkel rejser fire klassiske indvendinger: 'det er mange penge om måneden', 'min firmaordning dækker vel?', 'vi lever sundt, det sker nok ikke for os', og 'skal snakke med min kone'. Alle håndteres med LAER og respekt.",
        lines: [
          { speaker: "scene", text: "Indvending 1: Det er mange penge om måneden" },
          { speaker: "kunde", text: "1.840 kroner om måneden er alligevel en del at tilføje oven på det vi betaler i dag" },
          { speaker: "sælger", text: "Det er en reel udgift — og det er fair at reagere på.", badge: "LAER-A", badgeColor: "#f59e0b" },
          { speaker: "sælger", text: "Men lad mig vende det om: du sagde gabet er 26.000 kr. om måneden. Hvad er 1.840 kr. om måneden som procent af det gab?", badge: "LAER-R: Proportionen", badgeColor: "#f59e0b" },
          { speaker: "kunde", text: "...7%. Det er faktisk ikke meget" },
          { speaker: "sælger", text: "7% for at beskytte de resterende 93% og din families fundament.", badge: "Bekræft proportionen", badgeColor: "#f59e0b" },
          { speaker: "scene", text: "Indvending 2: Firma-ordningen dækker vel" },
          { speaker: "kunde", text: "Min nye arbejdsgiver har vel en ordning der dækker noget af det?" },
          { speaker: "sælger", text: "Godt spørgsmål — og det tjekker vi. Typisk dækker firmapensioner 5-8 gange årsløn i gruppelivsforsikring. Hvad er din årsløn?", badge: "Tjek fakta — vær præcis", badgeColor: "#f59e0b" },
          { speaker: "kunde", text: "950.000 kr." },
          { speaker: "sælger", text: "Så firmadækningen er typisk 4,7-7,6 millioner — men husk: det er før skat. Netto reelt 3-5 millioner. Og kritisk sygdom? Det er næsten aldrig dækket af firmapensioner.", badge: "Afdæk gabet i firma-ordningen", badgeColor: "#f59e0b" },
          { speaker: "scene", text: "Indvending 3: Vi lever sundt, det sker nok ikke for os" },
          { speaker: "kunde", text: "Vi lever sundt, løber og spiser ordentligt. Det er vel ikke os der rammes" },
          { speaker: "sælger", text: "Det er godt I gør det — det reducerer risikoen. Hvornår er den sidst du hørte om nogen der fik en uventet kræftdiagnose i 40'erne, på trods af at leve sundt?", badge: "Brug nærmiljøet som reference", badgeColor: "#f59e0b" },
          { speaker: "kunde", text: "[pause] ...min kollega faktisk. Han var 44, løbede 4 gange om ugen." },
          { speaker: "sælger", text: "Jeg ønsker intet ondt for din kollega. Men det er præcis det der sker — statistikken kender ikke sundhed. Kræft rammer 1 ud af 3 danskere. Det er ikke en scræmsetaktik — det er tal.", badge: "Fakta uden manipulationsangreb", badgeColor: "#f59e0b" },
          { speaker: "scene", text: "Indvending 4: Skal snakke med min kone" },
          { speaker: "kunde", text: "Det er noget vi bør beslutte sammen, min kone og jeg" },
          { speaker: "sælger", text: "Selvfølgelig — det er den rigtige beslutning at tage sammen.", badge: "Normaliser", badgeColor: "#f59e0b" },
          { speaker: "sælger", text: "Hvad tror du er det vigtigste spørgsmål hun vil have svar på?", badge: "Find den reelle bekymring", badgeColor: "#f59e0b" },
          { speaker: "kunde", text: "Sandsynligvis om vi kan råd til det, og om vi er ordentligt dækkede" },
          { speaker: "sælger", text: "Vil du have at jeg laver en oversigt der viser netto-dækning, månedlig udgift, og hvad der sker med huset og familien med vs. uden — som I kan kigge på hjemme?", badge: "Ammunition til den interne samtale", badgeColor: "#f59e0b" },
          { speaker: "kunde", text: "Ja, det ville gøre samtalen meget lettere" },
        ],
        insights: [
          "Proportionsargument: '1.840 kr. er 7% af det gab du selv regnede ud.' Kunden laver matematikken og overbevisningen er hans.",
          "Firma-ordningen: tjek altid — og find hullerne (kritisk sygdom er sjældent dækket). Det er rådgiverens rolle.",
          "Nærmiljø-reference: 'kollegaen der løbede 4 gange om ugen' er Mikkels eget eksempel, ikke dit. Det rammer anderledes.",
          "Ammunition til konen: send oversigten. Du skriver narrativet til den interne samtale — ikke Mikkel.",
        ],
      },
      {
        id: "closing",
        emoji: "✅",
        title: "Closing",
        context: "Mikkel er klar. Brug assumptive close + alternativ close på startdato. Giv ham en konkret anbefaling og gør processen enkel. Luk med en sætning der giver hans kone ro.",
        lines: [
          { speaker: "scene", text: "Opfølgningsmøde med Mikkel og konen. De har begge set oversigten." },
          { speaker: "sælger", text: "Hvad siger I begge til det I har set?", badge: "Åbn — lad dem bekræfte hinanden", badgeColor: "#4ade80" },
          { speaker: "kunde", text: "Vi er enige om at vi har sovet i timen. Det giver mening at gøre noget nu." },
          { speaker: "sælger", text: "Jeg er glad for at høre det — og det er den rigtige prioritering. Hvornår vil I have det på plads?", badge: "Assumptive close — hvornår, ikke om", badgeColor: "#4ade80" },
          { speaker: "kunde", text: "Helst hurtigst muligt. Er der en fordel ved at starte nu?" },
          { speaker: "sælger", text: "Ja — prisen afhænger af din alder og helbredstilstand. Hvert år du venter, stiger præmien lidt. Og du er i perfekt sundhed nu, så du vil slippe for helbredsundersøgelse. Det er det bedste udgangspunkt.", badge: "Naturlig urgency — din alder og helbred", badgeColor: "#4ade80" },
          { speaker: "sælger", text: "Vil I starte alle tre produkter pr. den 1. eller er der ét I gerne vil starte med?", badge: "Alternativ close — samlet eller ét ad gangen", badgeColor: "#4ade80" },
          { speaker: "kunde", text: "Lad os starte med livet og kritisk sygdom nu — pensionen kan vi gøre klar inden årsafslutningen." },
          { speaker: "sælger", text: "Perfekt plan. Livsforsikring og kritisk sygdom starter pr. den 1. Jeg sender ansøgningsformularen nu — det er digitalt underskrevet, tager 5 minutter. Pension sætter vi op i november.", badge: "Konkret, let og handlingsrettet", badgeColor: "#4ade80" },
          { speaker: "scene", text: "Mikkel og konen underskriver digitalt inden for 10 minutter. Familien er beskyttet. Mikkels kone sov godt den nat." },
        ],
        insights: [
          "Lad kunden og konen bekræfte hinanden: 'vi har sovet i timen' er stærkere end hvad du kan sige.",
          "Assumptive close på hvornår: 'Hvornår vil I have det på plads?' bypasser ja/nej.",
          "Urgency via alder og helbred er sand og etisk: prisen stiger hver år, og han er sund nu. Det er fakta.",
          "Alternativ close: 'alle tre nu eller ét ad gangen?' — begge er ja. Kunden bestemte tempo selv.",
        ],
      },
    ],
  },

  // ── SCENARIO 9: TV UPSELL ─────────────────────────────────────────────────
  {
    id: "tv",
    emoji: "📺",
    title: "TV-upsell i butik",
    subtitle: "B2C upsell — kunden kom ind for en 55\" 4K til 7.999 kr.",
    color: "#fb7185",
    customer: "Søren, 47 år, ny stue efter renovering, keder sig over billed-kvalitet",
    product: "Samsung OLED S90D 65\" + Sonos soundbar — 23.500 kr. samlet",
    phases: [
      {
        id: "moede",
        emoji: "🤝",
        title: "Mødet i showroomet",
        context: "Søren er gået ind og stillet sig foran hylden med mellemklasse-TV. Han kigger på en 55\" 4K til 7.999 kr. Han virker bestemt — han har gjort sig tanker. Din opgave: vær nysgerrig, ikke pressende. Forstå konteksten bag købet inden du gør noget.",
        lines: [
          { speaker: "scene", text: "Søren kigger på en 55\" 4K TV i hylderne. Du nærmer dig." },
          { speaker: "sælger", text: "Hej! Den der er faktisk et rigtig godt valg til prisen. Hvad er det til — stue, soveværelse, eller noget helt tredje?", badge: "Start med nysgerrighed, ikke pitch", badgeColor: "#fb7185" },
          { speaker: "kunde", text: "Stuen. Vi har netop renoveret og trænger til en ny TV." },
          { speaker: "sælger", text: "Nyrenouveret stue — fedt! Hvad er stuen cirka — er det en stor stue eller et lidt smallere rum?", badge: "Afdæk kontekst", badgeColor: "#fb7185" },
          { speaker: "kunde", text: "Det er rimelig stor — vi har 42 m². Åben plan med stue og spisestue i ét." },
          { speaker: "sælger", text: "42 m² åben plan. Og hvad bruger I TV'et til? Film og Netflix, sport, gaming, eller er det mest baggrundstøj?", badge: "Forstå use-case", badgeColor: "#fb7185" },
          { speaker: "kunde", text: "Vi ser en del film og serier. Og jeg er glad for sport — fodbold særligt." },
          { speaker: "sælger", text: "Fodbold og film. Og er du selv typen der lægger mærke til billedkvalitet — eller er det bare 'det skal virke'?", badge: "Kalibrér engagement niveau", badgeColor: "#fb7185" },
          { speaker: "kunde", text: "Jeg lægger mærke til det. Min nuværende irriterer mig faktisk konstant." },
          { speaker: "scene", text: "Guldoplysning: Søren lægger mærke til billedkvalitet og er IRRITERET over sin nuværende. Det er din åbning." },
        ],
        insights: [
          "Start ALDRIG med at snakke om produktet. Find ud af hvem kunden er og hvad de laver med det.",
          "42 m² åben plan + fodbold: allerede nu ved du at 55\" er for lille og at bevægelseshastighed (OLED) er vigtigt.",
          "'Irriterer dig konstant' er stærkere end 'du er utilfreds'. Notér det til labeling senere.",
        ],
      },
      {
        id: "lytning",
        emoji: "👂",
        title: "Aktiv lytning — hvad irriterer præcist",
        context: "Søren er irriteret over sit nuværende TV. Det er din vigtigste åbning. Lyt dig ind til HVAD der irriterer — motion blur på fodbold? dårlig kontrast? lyden? — og brug spejling og labeling til at kortlægge det præcist. Og find ud af hvad hans kone synes.",
        lines: [
          { speaker: "sælger", text: "Din nuværende irriterer dig... hvad er det præcist?", badge: "Graving — hvad er det?", badgeColor: "#818cf8" },
          { speaker: "kunde", text: "Billedet er sløret når der er hurtige bevægelser — fodbold er nærmest umuligt at se ordenligt." },
          { speaker: "sælger", text: "Sløret ved hurtige bevægelser...", badge: "Spejling", badgeColor: "#818cf8" },
          { speaker: "kunde", text: "Ja, og kontrasten er dårlig. Mørke scener i serier er bare grå. Det dræber oplevelsen." },
          { speaker: "sælger", text: "Grå mørke scener og sløret fodbold — det lyder som om TV'et du har i dag stjæler glæden fra det du faktisk gerne vil nyde.", badge: "Labeling — sæt ord på frustration", badgeColor: "#818cf8" },
          { speaker: "kunde", text: "Præcis det. Jeg sidder og tænker på det i stedet for at slappe af." },
          { speaker: "sælger", text: "Er det kun dig der lægger mærke til det, eller er din kone enig?", badge: "Find medkøberen", badgeColor: "#818cf8" },
          { speaker: "kunde", text: "Begge. Hun klagede over lyden senest i går. 'Det lyder som at se film i en boks', sagde hun." },
          { speaker: "sælger", text: "'Film i en boks' — er der ikke et godt lydsystem til?", badge: "Åbn for lydbehovet", badgeColor: "#818cf8" },
          { speaker: "kunde", text: "Nej, det er bare TV-højttalerne. Vi har aldrig fået det taget hul på." },
          { speaker: "scene", text: "Nu har du kortlagt begge problemer: billedkvalitet (OLED) og lyd (soundbar). Og konen er med — det er et fælles projekt." },
        ],
        insights: [
          "Motion blur og dårlig kontrast: det er præcis det OLED løser. Brug de konkrete ord fra kunden i pitchen.",
          "Labeling 'TV'et stjæler glæden': stærk sætning fordi den vender det fra 'teknisk problem' til 'emotionelt tab'.",
          "Konen er medkøber: 'Film i en boks' er hendes sætning. Brug den i pitchen — hun er din second advocate.",
        ],
      },
      {
        id: "behov",
        emoji: "🎯",
        title: "Behovsafdækning",
        context: "Nu afdækker du stuerummet, seervanerne og hvad de faktisk vil have ud af det nye setup. Brug spørgsmål om brugsfrekvens, størrelse og hvad de er utilfredse med — og stil skaleringssspørgsmål.",
        lines: [
          { speaker: "sælger", text: "Søren, hvad er din nuværende TV — størrelse og alder?", badge: "Hvad har du i dag?", badgeColor: "#38bdf8" },
          { speaker: "kunde", text: "55 tommer, 6 år gammel Samsung LCD." },
          { speaker: "sælger", text: "6 år gammel LCD. Fra 1 til 10 — hvor tilfreds er du med det?", badge: "Skaleringssspørgsmål", badgeColor: "#38bdf8" },
          { speaker: "kunde", text: "En 3. Måske en 4 på en god dag." },
          { speaker: "sælger", text: "En 3. Hvad skulle der til for at det var en 9?", badge: "Gap-spørgsmål", badgeColor: "#38bdf8" },
          { speaker: "kunde", text: "Ordenlig kontrast. Ingen motion blur. God lyd. Og måske en smule større — stuen er jo større nu." },
          { speaker: "sælger", text: "Og nu har I en 42 m² stue. Hvad tror du selv — er 55 tommer rigtigt til den størrelse rum?", badge: "Lad dem vurdere størrelsen selv", badgeColor: "#38bdf8" },
          { speaker: "kunde", text: "Ærlig talt... det føles måske lidt lille nu når vi sidder 3,5-4 meter fra skærmen." },
          { speaker: "sælger", text: "Det er en god observation. Tommelfingerreglen er at man bør sidde i 1,5 gange skærmstørrelsen. Med 4 meter afstand er det en 65\" der passer optimalt.", badge: "Giv faglig viden", badgeColor: "#38bdf8" },
          { speaker: "sælger", text: "Hvad er det vigtigste for dig: billedet, lyden, eller størrelsen?", badge: "Prioritering", badgeColor: "#38bdf8" },
          { speaker: "kunde", text: "Billedet er nummer ét. Men konen vil have lyden løst — ellers hører vi ikke rigtig om det." },
          { speaker: "sælger", text: "[griner] Det forstår jeg godt. Hvad er jeres budget?", badge: "Budget direkte", badgeColor: "#38bdf8" },
          { speaker: "kunde", text: "Vi ville sige 8-10.000 til TV'et. Soundbar ikke medregnet." },
          { speaker: "sælger", text: "Okay. Vil du have at jeg viser dig forskellen på en 55\" LCD til 7.999 og en 65\" OLED — og du beslutter om forskellen er pengene værd?", badge: "Invitér til at se og vurdere selv", badgeColor: "#fb7185" },
          { speaker: "kunde", text: "Ja, det vil jeg faktisk gerne se" },
        ],
        insights: [
          "'En 3 ud af 10' — kunden er dybt utilfreds. Gap-spørgsmålet afslørede præcis hvad han vil have.",
          "Tommelfingerreglen for størrelse: faglig viden der legitimerer det større TV. Du hjælper, du sælger ikke.",
          "'Konen vil have lyden løst — ellers hører vi ikke rigtig om det': lyden er en intern driver, ikke din ide.",
        ],
      },
      {
        id: "relation",
        emoji: "💬",
        title: "Relationsopbygning — demo og ærlighed",
        context: "Du fører Søren hen til en OLED-demo ved siden af en LCD. Lad billedet tale. Vær ærlig om hvornår OLED giver mening og hvornår det ikke gør — det bygger troværdighed.",
        lines: [
          { speaker: "scene", text: "I går hen til en 65\" Samsung OLED S90D der kører side om side med en 55\" 4K LCD med identisk indhold — en fodboldkamp." },
          { speaker: "sælger", text: "Lad mig bare lade dem tale. Se på den hurtige bold.", badge: "Demo — lad produktet sælge", badgeColor: "#fb7185" },
          { speaker: "scene", text: "[Søren ser på begge TV i 15 sekunder. Lydløst.] " },
          { speaker: "kunde", text: "...det er jo ikke til at sammenligne. OLED'en er skarp på bevægelsen. LCD'en er bare sløret." },
          { speaker: "sælger", text: "Præcis. Det er den forskel du beskrev hjemme — og det er teknologien der skaber den. OLED har ingen backlight — hvert pixel lyser for sig. Det eliminerer motion blur og giver ægte sort.", badge: "Teknisk forklaring på kundens oplevelse", badgeColor: "#fb7185" },
          { speaker: "sælger", text: "Vil du have jeg er helt ærlig?", badge: "Sæt forventning til ærlighed", badgeColor: "#fb7185" },
          { speaker: "kunde", text: "Ja, gerne" },
          { speaker: "sælger", text: "Hvis du primært så CNN og nyhedsprogrammer i dagslys, ville jeg ikke anbefale dig at betale for OLED — det er ikke pengene værd til den use-case. Men fodbold, film og serier i aftenstimerne i en stor stue — der er OLED det rigtige valg.", badge: "Ærlig om hvornår det IKKE giver mening", badgeColor: "#fb7185" },
          { speaker: "kunde", text: "Det sætter jeg pris på at du siger det. Det er præcis vores use-case." },
          { speaker: "sælger", text: "Og hvad siger din kone til billedkvaliteten, tror du?", badge: "Inddragne medkøberen", badgeColor: "#fb7185" },
          { speaker: "kunde", text: "Hun ville elske det. Men hun vil spørge til prisen og lyden." },
        ],
        insights: [
          "Demo vinder over pitch: '15 sekunders visning af siden om siden' overbevisning er stærkere end 10 minutters forklaring.",
          "Ærlig om hvornår OLED IKKE giver mening: det er den stærkeste troværdighedsskaber i hele samtalen.",
          "Inddrag medkøberen proaktivt: 'hvad siger din kone?' — du sætter Søren i champion-rollen.",
        ],
      },
      {
        id: "pitch",
        emoji: "💡",
        title: "Pitch — billede + lyd som samlet oplevelse",
        context: "Nu pitcher du OLED'en og Sonos soundbar som et samlet oplevelsesopgradering — ikke to separate produkter. Brug Sørens egne ord og hans kones sætning om 'film i en boks'.",
        lines: [
          { speaker: "sælger", text: "Søren, lad mig sætte det samlede billede op.", badge: "Samlet pitch", badgeColor: "#fb7185" },
          { speaker: "sælger", text: "Du sagde sløret fodbold og dårlig kontrast. Samsung OLED S90D 65\" løser begge dele direkte — det er præcis den teknologi der eliminerer motion blur og giver ægte sort på mørke scener. Det du så lige nu.", badge: "Brug hans ord — sløret og kontrast", badgeColor: "#fb7185" },
          { speaker: "sælger", text: "Din kone sagde 'film i en boks'. Sonos Ray soundbar ændrer lydbilledet fuldstændigt — den udfylder et 42 m² rum og giver filmoplevelse frem for TV-lyd. Det er den kommentar hun holder op med at give.", badge: "Brug koens egne ord", badgeColor: "#fb7185" },
          { speaker: "kunde", text: "[griner] Det er faktisk et godt argument" },
          { speaker: "sælger", text: "Prisen: 65\" Samsung OLED S90D er 19.999 kr. Sonos Ray soundbar er 3.500 kr. Samlet 23.500 kr. — det er 15.500 mere end den 55\" I kom ind for.", badge: "Pris transparent", badgeColor: "#fb7185" },
          { speaker: "sælger", text: "Men lad os sætte det i kontekst: du sagde I lige har renoveret stuen. Hvad kostede renoveringen nogenlunde?", badge: "MMM — ankre prisen til det store køb", badgeColor: "#fb7185" },
          { speaker: "kunde", text: "Vi brugte 180.000 kr. på renoveringen" },
          { speaker: "sælger", text: "180.000 kr. på stuen. TV og lyd er den del du rent faktisk kigger på og bruger hver dag. 23.500 er 13% af renoveringsbudgettet — for den oplevelse der fuldfører stuen.", badge: "MMM: TV er 13% af det samlede projekt", badgeColor: "#fb7185" },
          { speaker: "kunde", text: "...sat op mod renoveringen er det jo ikke vildt meget" },
        ],
        insights: [
          "Brug kundens og koens egne ord direkte i pitchen: sløret, kontrast, 'film i en boks'. Det skaber genkendelighed.",
          "Anker til renoveringen: 23.500 kr. er 13% af 180.000 kr. Det er ikke 'dyrt' — det er resten af projektet.",
          "Pitch som samlet oplevelse, ikke to produkter: 'billede + lyd = fuldendt stue' er stærkere end 'OLED + soundbar'.",
        ],
      },
      {
        id: "indvendinger",
        emoji: "🛡️",
        title: "Indvendingshåndtering — 4 indvendinger",
        context: "Søren rejser fire indvendinger: 'det er over budget', 'jeg vil kigge rundt', 'min kone skal med at beslutte', og 'kan I ikke gøre noget ved prisen'. Alle håndteres med respekt og konkrete svar.",
        lines: [
          { speaker: "scene", text: "Indvending 1: Det er over budget" },
          { speaker: "kunde", text: "Vi sagde 8-10.000 til TV'et — det her er næsten det tredobbelte" },
          { speaker: "sælger", text: "Det er en stor forskel fra jeres udgangspunkt — og det er rimeligt at reagere på.", badge: "LAER-A: Anerkend", badgeColor: "#f59e0b" },
          { speaker: "sælger", text: "Men hvad valgte I at renovere stuen for — hvad var målet med det?", badge: "LAER-E: Find den dybere motivation", badgeColor: "#f59e0b" },
          { speaker: "kunde", text: "At have et godt rum vi kan slappe af i og nyde." },
          { speaker: "sælger", text: "Et godt rum at slappe af og nyde. Er det muligt med et TV der giver dig en 3 ud af 10?", badge: "Brug skaleringssvaret", badgeColor: "#f59e0b" },
          { speaker: "kunde", text: "...nej, det er det egentlig ikke" },
          { speaker: "scene", text: "Indvending 2: Vil kigge rundt" },
          { speaker: "kunde", text: "Vi kigger hos Elgiganten og Pricerunner — de har sikkert noget billigere" },
          { speaker: "sælger", text: "Det er klogt at kigge rundt — og det opfordrer jeg dig faktisk til at gøre.", badge: "Anerkend — det overrasker kunden", badgeColor: "#f59e0b" },
          { speaker: "sælger", text: "Det du kigger efter på Pricerunner er en 65\" Samsung OLED S90D til under 19.999 kr. Skriv det ned — du vil se at vores pris er markedets bedste. Og Sonos Ray til 3.500 er officiel vejledende pris, den varierer ikke.", badge: "Giv dem det eksakte produkt at søge", badgeColor: "#f59e0b" },
          { speaker: "sælger", text: "Ring til mig hvis du finder en lavere pris — vi matcher det.", badge: "Prisgaranti", badgeColor: "#f59e0b" },
          { speaker: "scene", text: "Indvending 3: Konen skal med" },
          { speaker: "kunde", text: "Min kone vil gerne se det inden vi beslutter" },
          { speaker: "sælger", text: "Det er helt oplagt. Hvornår kan I komme ind sammen?", badge: "Konverter til besøg", badgeColor: "#f59e0b" },
          { speaker: "kunde", text: "Vi kan sandsynligvis lørdag" },
          { speaker: "sælger", text: "Perfekt. Jeg booker en demonstration til jer lørdag og sørger for at den her model er tændt med indhold I kan bruge. Og jeg kan fortælle dig at 95% af de kunder der ser den med partneren beslutter sig der.", badge: "Urgency via statistik", badgeColor: "#f59e0b" },
          { speaker: "scene", text: "Indvending 4: Kan I ikke gøre noget ved prisen" },
          { speaker: "kunde", text: "Kan der ikke godt laves noget ved prisen?" },
          { speaker: "sælger", text: "Vores TVer er på officiel vejledende pris — jeg kan ikke gå ned på dem. Det jeg KAN gøre er at inkludere montering og HDMI-kabler normalt til 800 kr., og 2 års extended garanti til 1.200 kr. — i alt 2.000 kr. ekstra service for intet.", badge: "Giv value, ikke rabat", badgeColor: "#f59e0b" },
          { speaker: "kunde", text: "Montering inkluderet? Okay, det er faktisk en god deal — vi havde frygtet det ekstra." },
        ],
        insights: [
          "Kig rundt-opfordring overrasker kunden og bygger tillid. Giv dem det nøjagtige produkt at søge — du ved du vinder.",
          "Prisgaranti fjerner frygt for at købe for tidligt. Det lukker 'kig rundt'-indvendingen elegant.",
          "Lørdag-demo med konen: konverter indvendingen til et konkret møde med en dato.",
          "Giv value frem for rabat: montering + garanti til 2.000 kr. er konkret og håndfastbar. Rabat eroder margin og troværdighed.",
        ],
      },
      {
        id: "closing",
        emoji: "✅",
        title: "Closing — demo med konen lørdag",
        context: "Lørdag. Søren er kommet med sin kone Sara. Hun ser TV'et og reagerer. Nu er det naturlig closing-tid. Brug alternativ close, inkludér konen aktivt, og gør processen enkel.",
        lines: [
          { speaker: "scene", text: "Lørdag. Søren og Sara er i butikken. Du sætter demoen op med Netflix og en fodbold-klip parallelt med LCD'en." },
          { speaker: "sælger", text: "Sara, Søren fortalte mig du sagde 'film i en boks' om jeres nuværende. Se begge i 20 sekunder.", badge: "Involver konen direkte med hendes egne ord", badgeColor: "#4ade80" },
          { speaker: "scene", text: "[Sara ser fra den ene skærm til den anden. Pause.]" },
          { speaker: "kunde", text: "Sara: Wow. Det er jo slet ikke til at sammenligne. Og er det bare TV-højttalerne? Det er virkelig meget bedre." },
          { speaker: "sælger", text: "Det er Sonos Ray soundbar koblet til OLED'en. Det er hvad Søren beskrev som 'film i en boks' løst.", badge: "Svar på hendes bekymring med demo", badgeColor: "#4ade80" },
          { speaker: "kunde", text: "Sara: Det skal vi have. Søren, det er slet ikke til at diskutere." },
          { speaker: "scene", text: "Konen har solgt det. Din opgave nu er at lukke hurtigt og enkelt." },
          { speaker: "sælger", text: "Vil I have den leveret og monteret til næste weekend, eller er det bedre med ugen efter?", badge: "Alternativ close — leveringstid", badgeColor: "#4ade80" },
          { speaker: "kunde", text: "Søren: næste weekend, hvis muligt" },
          { speaker: "sælger", text: "Perfekt — lørdag er åbent. Montering og opsætning er inkluderet som aftalt. Vil I betale kontant eller kort?", badge: "Naturlig næste skridt", badgeColor: "#4ade80" },
          { speaker: "scene", text: "Salget er lukket. 23.500 kr. Søren kom ind med 8.000 kr. i tankerne. Sara solgte ham det i 20 sekunder med hendes egne øjne." },
        ],
        insights: [
          "Demo sælger for dig: Saras reaktion er stærkere end alt du kunne sige. Sæt scenen og lad den tale.",
          "Brug koens egne ord direkte fra første møde: 'film i en boks' — hun husker sin sætning og den virker.",
          "Konen er den bedste lukke-hjælp: 'Det skal vi have' er ikke dit salgspres — det er hendes beslutning.",
          "Alternativ close på leveringstid: det fjerner fokus fra om og sætter det på hvornår. Enkelt og naturligt.",
        ],
      },
    ],
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function DetPerfekteSalgTab() {
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [phaseIdx, setPhaseIdx]       = useState(0);

  const scenario = SCENARIOS[scenarioIdx];
  const phase    = scenario.phases[phaseIdx];

  function selectScenario(i: number) {
    setScenarioIdx(i);
    setPhaseIdx(0);
  }

  const speakerStyle = (speaker: Speaker, color: string) => {
    if (speaker === "scene") return {
      background: "#f5f4f2", border: "1px solid #e5e2df",
      borderRadius: 10, padding: "10px 16px",
      fontSize: 13, color: "#57534e",
      fontStyle: "italic" as const, lineHeight: 1.6,
    };
    if (speaker === "sælger") return {
      background: "#ffffff", border: `2px solid ${color}40`,
      borderLeft: `4px solid ${color}`,
      borderRadius: 12, padding: "14px 18px",
      fontSize: 15, color: "#1c1917", lineHeight: 1.75,
    };
    return {
      background: "#f0f9ff", border: "2px solid #bae6fd",
      borderLeft: "4px solid #38bdf8",
      borderRadius: 12, padding: "14px 18px",
      fontSize: 15, color: "#0c4a6e", lineHeight: 1.75,
    };
  };

  return (
    <div style={{
      maxWidth: 860, margin: "0 auto",
      fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
    }}>
      {/* ── Header ── */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 13, flexShrink: 0,
            background: "linear-gradient(135deg, #fb923c 0%, #f59e0b 100%)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
          }}>🏆</div>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 900, color: "#1c1917", margin: 0, letterSpacing: "-0.5px" }}>
              Det perfekte salg
            </h1>
            <p style={{ fontSize: 14, color: "#57534e", margin: 0, fontWeight: 500 }}>
              9 realistiske scenarier — alle salgsråd i praksis
            </p>
          </div>
        </div>
      </div>

      {/* ── Scenario selector ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 28 }}>
        {SCENARIOS.map((s, i) => (
          <button key={s.id} onClick={() => selectScenario(i)} style={{
            borderRadius: 16, overflow: "hidden",
            border: `2.5px solid ${scenarioIdx === i ? s.color : "#e5e2df"}`,
            background: scenarioIdx === i ? `${s.color}12` : "#ffffff",
            cursor: "pointer", textAlign: "left", padding: 0,
            transition: "all 0.15s",
          }}>
            <div style={{ height: 5, background: scenarioIdx === i ? s.color : "#e5e2df" }} />
            <div style={{ padding: "14px 16px" }}>
              <div style={{ fontSize: 26, marginBottom: 6 }}>{s.emoji}</div>
              <p style={{ fontSize: 14, fontWeight: 800, color: "#1c1917", margin: "0 0 4px", lineHeight: 1.3 }}>{s.title}</p>
              <p style={{ fontSize: 12, color: "#78716c", margin: "0 0 8px", lineHeight: 1.4 }}>{s.subtitle}</p>
              <div style={{
                display: "inline-block", fontSize: 11, fontWeight: 700,
                color: scenarioIdx === i ? s.color : "#78716c",
                background: scenarioIdx === i ? `${s.color}15` : "#f5f4f2",
                padding: "3px 10px", borderRadius: 99,
                border: `1.5px solid ${scenarioIdx === i ? s.color + "40" : "#e5e2df"}`,
              }}>
                {s.customer.split(",")[0]}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* ── Product + customer context ── */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24,
      }}>
        <div style={{ padding: "12px 16px", borderRadius: 12, background: "#fffbeb", border: "2px solid #fbbf24" }}>
          <p style={{ fontSize: 11, fontWeight: 800, color: "#92400e", margin: "0 0 3px", textTransform: "uppercase", letterSpacing: "0.08em" }}>Produkt</p>
          <p style={{ fontSize: 14, fontWeight: 600, color: "#1c1917", margin: 0 }}>{scenario.product}</p>
        </div>
        <div style={{ padding: "12px 16px", borderRadius: 12, background: `${scenario.color}10`, border: `2px solid ${scenario.color}40` }}>
          <p style={{ fontSize: 11, fontWeight: 800, color: scenario.color, margin: "0 0 3px", textTransform: "uppercase", letterSpacing: "0.08em" }}>Kunde</p>
          <p style={{ fontSize: 14, fontWeight: 600, color: "#1c1917", margin: 0 }}>{scenario.customer}</p>
        </div>
      </div>

      {/* ── Phase stepper ── */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {scenario.phases.map((ph, i) => (
            <button key={ph.id} onClick={() => setPhaseIdx(i)} style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "8px 14px", borderRadius: 10, cursor: "pointer",
              fontSize: 13, fontWeight: phaseIdx === i ? 800 : 500,
              background: phaseIdx === i ? `${scenario.color}15` : "#f5f4f2",
              border: `2px solid ${phaseIdx === i ? scenario.color : "#e5e2df"}`,
              color: phaseIdx === i ? scenario.color : "#57534e",
              transition: "all 0.15s",
            }}>
              <span>{ph.emoji}</span>
              <span>{ph.title}</span>
            </button>
          ))}
        </div>
        {/* Progress bar */}
        <div style={{ height: 4, borderRadius: 99, background: "#f0ede9", marginTop: 12, overflow: "hidden" }}>
          <div style={{
            height: "100%", borderRadius: 99, background: scenario.color,
            width: `${((phaseIdx + 1) / scenario.phases.length) * 100}%`,
            transition: "width 0.3s ease",
          }} />
        </div>
      </div>

      {/* ── Phase content ── */}
      <div key={`${scenarioIdx}-${phaseIdx}`}>

        {/* Phase heading */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12, flexShrink: 0,
            background: `${scenario.color}15`, border: `2px solid ${scenario.color}`,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
          }}>{phase.emoji}</div>
          <div>
            <p style={{ fontSize: 11, fontWeight: 800, color: scenario.color, margin: "0 0 2px", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Fase {phaseIdx + 1} af {scenario.phases.length}
            </p>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: "#1c1917", margin: 0 }}>{phase.title}</h2>
          </div>
        </div>

        {/* Context */}
        <div style={{
          padding: "16px 20px", borderRadius: 14,
          background: "#f5f4f2", border: "2px solid #e5e2df",
          marginBottom: 20,
        }}>
          <p style={{ fontSize: 14, color: "#292524", margin: 0, lineHeight: 1.8 }}>{phase.context}</p>
        </div>

        {/* Dialogue */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
          {phase.lines.map((line, i) => (
            <div key={i}>
              {line.speaker !== "scene" && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 99, flexShrink: 0,
                    background: line.speaker === "sælger" ? scenario.color : "#38bdf8",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 14,
                  }}>
                    {line.speaker === "sælger" ? "🧑" : "👤"}
                  </div>
                  <span style={{
                    fontSize: 12, fontWeight: 800, color: line.speaker === "sælger" ? scenario.color : "#0ea5e9",
                    textTransform: "uppercase", letterSpacing: "0.08em",
                  }}>
                    {line.speaker === "sælger" ? "Sælger" : "Kunde"}
                  </span>
                  {line.badge && (
                    <span style={{
                      fontSize: 11, fontWeight: 700,
                      background: `${line.badgeColor ?? "#fbbf24"}15`,
                      color: line.badgeColor ?? "#92400e",
                      border: `1.5px solid ${line.badgeColor ?? "#fbbf24"}40`,
                      padding: "2px 10px", borderRadius: 99,
                    }}>{line.badge}</span>
                  )}
                </div>
              )}
              <div style={speakerStyle(line.speaker, scenario.color)}>
                {line.speaker === "scene" && <span style={{ fontWeight: 700, color: "#44403c" }}>📍 </span>}
                {line.text}
              </div>
            </div>
          ))}
        </div>

        {/* Key insights */}
        <div style={{
          borderRadius: 16, overflow: "hidden",
          border: "2.5px solid #fbbf24",
        }}>
          <div style={{ height: 5, background: "#fbbf24" }} />
          <div style={{ padding: "18px 22px", background: "#fffbeb" }}>
            <p style={{ fontSize: 12, fontWeight: 800, color: "#92400e", margin: "0 0 12px", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              💡 Nøgle-indsigter fra denne fase
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {phase.insights.map((tip, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: 99, flexShrink: 0,
                    background: scenario.color, color: "#ffffff",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, fontWeight: 800, marginTop: 2,
                  }}>{i + 1}</div>
                  <p style={{ fontSize: 14, color: "#292524", margin: 0, lineHeight: 1.7 }}>{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 24, marginTop: 24, borderTop: "2px solid #e5e2df" }}>
          <div>
            {phaseIdx > 0 && (
              <button onClick={() => setPhaseIdx(p => p - 1)} style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "10px 18px", borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 600,
                background: "#f5f4f2", border: "2px solid #e5e2df", color: "#57534e",
              }}>
                ← {scenario.phases[phaseIdx - 1].emoji} {scenario.phases[phaseIdx - 1].title}
              </button>
            )}
          </div>
          <div>
            {phaseIdx < scenario.phases.length - 1 && (
              <button onClick={() => setPhaseIdx(p => p + 1)} style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "10px 18px", borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 700,
                background: `${scenario.color}15`, border: `2px solid ${scenario.color}50`,
                color: scenario.color,
              }}>
                {scenario.phases[phaseIdx + 1].emoji} {scenario.phases[phaseIdx + 1].title} →
              </button>
            )}
            {phaseIdx === scenario.phases.length - 1 && scenarioIdx < SCENARIOS.length - 1 && (
              <button onClick={() => selectScenario(scenarioIdx + 1)} style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "10px 20px", borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 800,
                background: "#fffbeb", border: "2px solid #fbbf24", color: "#92400e",
              }}>
                Næste scenarie: {SCENARIOS[scenarioIdx + 1].emoji} {SCENARIOS[scenarioIdx + 1].title} →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
