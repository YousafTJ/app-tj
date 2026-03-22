export interface JeopardyClue {
  points: number;
  clue: string;
  answer: string;
}

export interface JeopardyCategory {
  name: string;
  icon: string;
  clues: JeopardyClue[];
}

export const JEOPARDY_CATEGORIES: JeopardyCategory[] = [
  {
    name: "Use Cases",
    icon: "📋",
    clues: [
      { points: 100, clue: "Den korteste form for use case — bruges tidligt i processen til en hurtig opsummering", answer: "Hvad er Brief?" },
      { points: 200, clue: "Den vigtigste bruger der starter interaktionen med systemet", answer: "Hvad er Primary Actor?" },
      { points: 300, clue: "Scenarier der stadig leder til succes, men afviger fra normalforløbet", answer: "Hvad er Alternative Flows?" },
      { points: 400, clue: "En aktør der ikke deltager direkte, men har en interesse i resultatet af use casen", answer: "Hvad er en Offstage Actor?" },
      { points: 500, clue: "Den mest detaljerede use case-format med preconditions, main flow, alternative flows og postconditions", answer: "Hvad er Fully Dressed?" },
    ],
  },
  {
    name: "Scrum",
    icon: "🔄",
    clues: [
      { points: 100, clue: "Det 15-minutters daglige møde i Scrum", answer: "Hvad er Daily Scrum?" },
      { points: 200, clue: "Estimeringsteknik i Scrum hvor teamet bruger nummererede kort til at vurdere kompleksitet", answer: "Hvad er Planning Poker?" },
      { points: 300, clue: "Kvalitetsstandarder som hvert inkrement skal opfylde før det betragtes som færdigt", answer: "Hvad er Definition of Done?" },
      { points: 400, clue: "Sprint-mødet der gennemgår det færdige arbejde med interessenter — ikke det interne retrospective", answer: "Hvad er Sprint Review?" },
      { points: 500, clue: "De 5 Scrum-værdier der guider teamets daglige arbejde og samspil", answer: "Hvad er Commitment, Focus, Openness, Respect og Courage?" },
    ],
  },
  {
    name: "CI/CD & Cloud",
    icon: "☁️",
    clues: [
      { points: 100, clue: "CI/CD-tjeneste der automatiserer workflows direkte fra GitHub", answer: "Hvad er GitHub Actions?" },
      { points: 200, clue: "Konfigurationsformat brugt i CI/CD pipelines — understøtter kommentarer og er menneskelæsbart", answer: "Hvad er YAML?" },
      { points: 300, clue: "Den npm-kommando der anbefales i CI miljøer fremfor npm install — bruger package-lock.json", answer: "Hvad er npm ci?" },
      { points: 400, clue: "PaaS-løsning i Azure til at køre webapplikationer uden at administrere underliggende infrastruktur", answer: "Hvad er Azure App Service?" },
      { points: 500, clue: "Type af cloud-tjeneste hvor du betaler per funktion-kørsel og ikke administrerer servere — fx Azure Functions", answer: "Hvad er Serverless (FaaS)?" },
    ],
  },
  {
    name: "Netværk",
    icon: "🌐",
    clues: [
      { points: 100, clue: "Protokol der oversætter domænenavne som google.com til IP-adresser", answer: "Hvad er DNS?" },
      { points: 200, clue: "Protokol der tildeler automatisk IP-adresser til enheder på et netværk", answer: "Hvad er DHCP?" },
      { points: 300, clue: "Transportprotokol der er hurtig men uden garanti for levering — bruges fx til video-streaming", answer: "Hvad er UDP?" },
      { points: 400, clue: "Kommandolinjeværktøj der bruges til at scanne netværk og finde åbne porte", answer: "Hvad er Nmap?" },
      { points: 500, clue: "En unik hardware-adresse på 48 bit der identificerer en netværksenhed på layer 2", answer: "Hvad er en MAC-adresse?" },
    ],
  },
  {
    name: "Domain & GRASP",
    icon: "🧩",
    clues: [
      { points: 100, clue: "GRASP-princip hvor responsibility gives til klassen der allerede har de nødvendige data", answer: "Hvad er Information Expert?" },
      { points: 200, clue: "Princip om at en klasse skal fokusere på ét ansvar — modsat klasser der laver alt muligt", answer: "Hvad er High Cohesion?" },
      { points: 300, clue: "Princip om at klasser skal have færrest mulige afhængigheder til hinanden", answer: "Hvad er Low Coupling?" },
      { points: 400, clue: "GRASP-mønster hvor en kunstig klasse oprettes for at opfylde et ansvar uden at bryde design-principper", answer: "Hvad er Pure Fabrication?" },
      { points: 500, clue: "GRASP-princip der afgør hvem der har ansvaret for at oprette en instans af klasse A", answer: "Hvad er Creator?" },
    ],
  },
  {
    name: "Hardware",
    icon: "💻",
    clues: [
      { points: 100, clue: "Korttidshukommelse der slettes når computeren slukkes", answer: "Hvad er RAM?" },
      { points: 200, clue: "CPU-hastighed måles i denne enhed", answer: "Hvad er GHz (gigahertz)?" },
      { points: 300, clue: "Forskellen på HDD og SSD — HDD er mekanisk og _________, SSD er hurtigere og mere pålidelig", answer: "Hvad er billigere (men langsommere)?" },
      { points: 400, clue: "Komponenten der forbinder alle dele af computeren så de kan kommunikere", answer: "Hvad er bundkortet?" },
      { points: 500, clue: "Specialiseret processor der håndterer parallelle beregninger — brugt til grafik, AI og machine learning", answer: "Hvad er en GPU?" },
    ],
  },
  {
    name: "Frameworks & API",
    icon: "⚙️",
    clues: [
      { points: 100, clue: "HTTP-metode der bruges til at hente data fra et REST API", answer: "Hvad er GET?" },
      { points: 200, clue: "Java-framework til hurtigt at bygge produktionsklar backend og REST API'er", answer: "Hvad er Spring Boot?" },
      { points: 300, clue: "Java Persistence API — abstraktion over database-operationer uden rå SQL", answer: "Hvad er JPA?" },
      { points: 400, clue: "Arkitektur hvor en applikation er opdelt i små selvstændige services der kommunikerer via API'er", answer: "Hvad er Microservices?" },
      { points: 500, clue: "Relationelt databasesystem med open-source licens der bruger SQL og ejes af Oracle", answer: "Hvad er MySQL?" },
    ],
  },
  {
    name: "Cybersecurity",
    icon: "🔐",
    clues: [
      { points: 100, clue: "Angreb der indsætter ondsindet SQL-kode i et inputfelt for at manipulere en database", answer: "Hvad er SQL Injection?" },
      { points: 200, clue: "Linux-distribution designet til penetration testing med mange built-in hackerværktøjer", answer: "Hvad er Kali Linux?" },
      { points: 300, clue: "Framework til penetration testing der gør det nemt at udnytte kendte sikkerhedssårbarheder", answer: "Hvad er Metasploit?" },
      { points: 400, clue: "Microsofts system til at administrere brugere, computere og rettigheder i et Windows-netværk", answer: "Hvad er Active Directory?" },
      { points: 500, clue: "Governance, Risk and Compliance — rammerne for risikostyring og lovoverholdelse i en organisation", answer: "Hvad er GRC?" },
    ],
  },
  {
    name: "Azure & Cloud",
    icon: "🖥️",
    clues: [
      { points: 100, clue: "Microsofts cloud-platform til at hoste applikationer, databaser og virtuelle maskiner", answer: "Hvad er Microsoft Azure?" },
      { points: 200, clue: "Infrastructure as Code-værktøj der opretter cloud-ressourcer via konfigurationsfiler", answer: "Hvad er Terraform?" },
      { points: 300, clue: "Microsofts cloud-baserede SIEM-løsning til overvågning og respons på sikkerhedshændelser", answer: "Hvad er Microsoft Sentinel?" },
      { points: 400, clue: "Forespørgselssprog brugt i Azure og Microsoft Sentinel til at analysere store mænger logdata", answer: "Hvad er KQL (Kusto Query Language)?" },
      { points: 500, clue: "Kommandolinjeværktøj og scriptingsprog fra Microsoft til automatisering og serveradministration", answer: "Hvad er PowerShell?" },
    ],
  },
  {
    name: "AI & Automation",
    icon: "🤖",
    clues: [
      { points: 100, clue: "Stort sprogmodel trænet på enorme mænger tekst — fx ChatGPT eller Claude", answer: "Hvad er et LLM?" },
      { points: 200, clue: "Teknik hvor en AI-model henter relevant information fra en vidensbase inden den svarer", answer: "Hvad er RAG?" },
      { points: 300, clue: "Standardiseret protokol der lader AI-modeller kommunikere med eksterne værktøjer og systemer", answer: "Hvad er MCP (Model Context Protocol)?" },
      { points: 400, clue: "Automatisering af serverside-processer uden manuel indgriben — fx sende notifikationer eller kalde API'er", answer: "Hvad er Back-end Automation?" },
      { points: 500, clue: "En kæde af automatiserede trin hvor AI behandler input, tager beslutninger og producerer output", answer: "Hvad er et AI Workflow?" },
    ],
  },
];
