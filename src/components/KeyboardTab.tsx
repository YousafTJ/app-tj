"use client";

import { useState, useMemo } from "react";

// ─── Keyboard layout ──────────────────────────────────────────────────────────

type Key = { label: string; display?: string; w?: number };

const ROWS: Key[][] = [
  [
    { label: "Esc", w: 1 },
    { label: "F1" }, { label: "F2" }, { label: "F3" }, { label: "F4" },
    { label: "F5" }, { label: "F6" }, { label: "F7" }, { label: "F8" },
    { label: "F9" }, { label: "F10" }, { label: "F11" }, { label: "F12" },
  ],
  [
    { label: "`" },
    { label: "1" }, { label: "2" }, { label: "3" }, { label: "4" },
    { label: "5" }, { label: "6" }, { label: "7" }, { label: "8" },
    { label: "9" }, { label: "0" }, { label: "-" }, { label: "=" },
    { label: "Backspace", display: "⌫", w: 2 },
  ],
  [
    { label: "Tab", w: 1.5 },
    { label: "Q" }, { label: "W" }, { label: "E" }, { label: "R" },
    { label: "T" }, { label: "Y" }, { label: "U" }, { label: "I" },
    { label: "O" }, { label: "P" }, { label: "[" }, { label: "]" },
    { label: "\\", w: 1.5 },
  ],
  [
    { label: "Caps", w: 1.75 },
    { label: "A" }, { label: "S" }, { label: "D" }, { label: "F" },
    { label: "G" }, { label: "H" }, { label: "J" }, { label: "K" },
    { label: "L" }, { label: ";" }, { label: "'" },
    { label: "Enter", w: 2.25 },
  ],
  [
    { label: "Shift", w: 2.25 },
    { label: "Z" }, { label: "X" }, { label: "C" }, { label: "V" },
    { label: "B" }, { label: "N" }, { label: "M" }, { label: "," },
    { label: "." }, { label: "/" },
    { label: "Shift", w: 2.75 },
  ],
  [
    { label: "Ctrl", w: 1.4 },
    { label: "Win", w: 1.2 },
    { label: "Alt", w: 1.2 },
    { label: "Space", w: 6.4 },
    { label: "Alt", w: 1.2 },
    { label: "Ctrl", w: 1.4 },
  ],
];

// ─── Types ────────────────────────────────────────────────────────────────────

type Shortcut = {
  label: string;
  keys: string[];        // Windows keys (used for keyboard highlight)
  keysMac?: string[];    // Mac keys — if present, renders table view
  description: string;
};

type SectionId  = "shortcuts" | "linux" | "powershell" | "kubernetes" | "docker" | "viden" | "git";

type Command = {
  label: string;
  command: string;
  description: string;
  topic: string;
};

// ─── General shortcuts ────────────────────────────────────────────────────────

const GENERAL_SHORTCUTS: Shortcut[] = [
  { label: "Kopier",           keys: ["Ctrl", "C"],            description: "Kopier markeret tekst eller element" },
  { label: "Indsæt",           keys: ["Ctrl", "V"],            description: "Indsæt fra udklipsholderen" },
  { label: "Klip",             keys: ["Ctrl", "X"],            description: "Klip markeret tekst eller element" },
  { label: "Fortryd",          keys: ["Ctrl", "Z"],            description: "Fortryd seneste handling" },
  { label: "Gentag (Redo)",    keys: ["Ctrl", "Y"],            description: "Gentag fortryd" },
  { label: "Vælg alt",         keys: ["Ctrl", "A"],            description: "Markér alt indhold" },
  { label: "Gem",              keys: ["Ctrl", "S"],            description: "Gem den aktuelle fil eller side" },
  { label: "Find",             keys: ["Ctrl", "F"],            description: "Åbn søgefunktionen" },
  { label: "Print",            keys: ["Ctrl", "P"],            description: "Åbn print-dialog" },
  { label: "Ny",               keys: ["Ctrl", "N"],            description: "Opret ny fil, fane eller vindue" },
  { label: "Luk fane/vindue",  keys: ["Ctrl", "W"],            description: "Luk aktuel fane eller vindue" },
  { label: "Ny fane",          keys: ["Ctrl", "T"],            description: "Åbn ny fane" },
  { label: "Genåbn fane",      keys: ["Ctrl", "Shift", "T"],  description: "Genåbn sidst lukkede fane" },
  { label: "Næste fane",       keys: ["Ctrl", "Tab"],          description: "Skift til næste fane" },
  { label: "Luk program",      keys: ["Alt", "F4"],            description: "Luk det aktive program" },
  { label: "Skift program",    keys: ["Alt", "Tab"],           description: "Skift mellem åbne programmer" },
  { label: "Lås computer",     keys: ["Win", "L"],             description: "Lås skærmen/computeren" },
  { label: "Skrivebord",       keys: ["Win", "D"],             description: "Vis/skjul skrivebordet" },
  { label: "Stifinder",        keys: ["Win", "E"],             description: "Åbn File Explorer" },
  { label: "Screenshot",       keys: ["Win", "Shift", "S"],   description: "Tag skærmbillede af valgt område" },
  { label: "Jobliste",         keys: ["Ctrl", "Shift", "Esc"],description: "Åbn Jobliste direkte" },
  { label: "Kør-dialog",       keys: ["Win", "R"],             description: "Åbn Kør-dialogboksen" },
  { label: "Gå til toppen",    keys: ["Ctrl", "Home"],         description: "Gå til starten af dokument/side" },
  { label: "Gå til bunden",    keys: ["Ctrl", "End"],          description: "Gå til slutningen af dokument/side" },
  { label: "Omdøb",            keys: ["F2"],                   description: "Omdøb markeret fil eller element" },
  { label: "Opdater side",     keys: ["F5"],                   description: "Genindlæs/opdater siden" },
  { label: "Fuld skærm",       keys: ["F11"],                  description: "Skift til fuldskærmstilstand" },
  { label: "Udklipsholder",    keys: ["Win", "V"],             description: "Åbn udklipsholderhistorik" },
  { label: "Zoom ind",         keys: ["Ctrl", "="],            description: "Zoom ind" },
  { label: "Zoom ud",          keys: ["Ctrl", "-"],            description: "Zoom ud" },
];

// ─── Command data ─────────────────────────────────────────────────────────────

const LINUX_COMMANDS: Command[] = [
  // Ports
  { label: "Vis åbne porte",         command: "ss -tlnp",                                    description: "Vis alle porte der lytter (TCP)",        topic: "Porte" },
  { label: "Vis alle porte (netstat)",command: "netstat -tlnp",                               description: "List TCP-porte med procesinfo",           topic: "Porte" },
  { label: "Find process på port",   command: "lsof -i :3000",                               description: "Find hvilken proces der bruger port 3000",topic: "Porte" },
  { label: "Dræb port (lsof)",       command: "kill $(lsof -t -i:3000)",                     description: "Dræb processen der bruger port 3000",     topic: "Porte" },
  { label: "Dræb port (fuser)",      command: "fuser -k 3000/tcp",                           description: "Frigiv port 3000 med fuser",              topic: "Porte" },
  { label: "Scan porte (nmap)",      command: "nmap -p 1-65535 localhost",                   description: "Scan alle porte på localhost",            topic: "Porte" },
  // Netværk
  { label: "Vis IP-adresser",        command: "ip addr show",                                description: "Vis alle netværksinterfaces og IP-adresser",topic: "Netværk" },
  { label: "Kortere IP-oversigt",    command: "ip -br addr",                                 description: "Kompakt visning af interfaces og IPs",    topic: "Netværk" },
  { label: "Offentlig IP",           command: "curl -s ifconfig.me",                         description: "Find din offentlige IP-adresse",          topic: "Netværk" },
  { label: "Offentlig IP (v2)",      command: "curl -s icanhazip.com",                       description: "Alternativt site til offentlig IP",       topic: "Netværk" },
  { label: "Ping host",              command: "ping -c 4 google.com",                        description: "Ping en host 4 gange",                    topic: "Netværk" },
  { label: "Traceroute",             command: "traceroute google.com",                       description: "Vis ruten pakker tager til destinationen", topic: "Netværk" },
  { label: "DNS-opslag",             command: "dig google.com",                              description: "Slå DNS-poster op for et domæne",         topic: "Netværk" },
  { label: "Reverse DNS",            command: "dig -x 8.8.8.8",                             description: "Reverse DNS-opslag fra IP til hostname",   topic: "Netværk" },
  { label: "nslookup",               command: "nslookup google.com",                         description: "DNS-opslag (alternativ til dig)",         topic: "Netværk" },
  { label: "Whois",                  command: "whois google.com",                            description: "Domæneregistreringsinfo",                 topic: "Netværk" },
  { label: "HTTP-anmodning",         command: "curl -I https://google.com",                  description: "Vis HTTP-headers for et website",         topic: "Netværk" },
  { label: "Download fil",           command: "wget https://example.com/file.zip",           description: "Download en fil fra internettet",         topic: "Netværk" },
  { label: "Netværksforbindelser",   command: "ss -s",                                       description: "Sammenfatning af socket-statistikker",    topic: "Netværk" },
  { label: "Routingtabel",           command: "ip route show",                               description: "Vis netværksroutingtabellen",             topic: "Netværk" },
  // Processer
  { label: "Alle processer",         command: "ps aux",                                      description: "List alle kørende processer",             topic: "Processer" },
  { label: "Find proces (grep)",     command: "ps aux | grep nginx",                         description: "Søg efter specifik proces",               topic: "Processer" },
  { label: "Find PID",               command: "pgrep nginx",                                 description: "Find PID for en navngivet proces",        topic: "Processer" },
  { label: "Interaktiv procesoversigt", command: "top",                                      description: "Realtids procesovervågning",              topic: "Processer" },
  { label: "Bedre procesoversigt",   command: "htop",                                        description: "Forbedret interaktiv procesvisning (install htop)", topic: "Processer" },
  { label: "Dræb proces (PID)",      command: "kill 1234",                                   description: "Send SIGTERM til PID 1234",                topic: "Processer" },
  { label: "Tving drab (PID)",       command: "kill -9 1234",                                description: "Send SIGKILL (tvungen afslutning)",        topic: "Processer" },
  { label: "Dræb ved navn",          command: "killall nginx",                               description: "Dræb alle processer med dette navn",      topic: "Processer" },
  { label: "Dræb ved mønster",       command: "pkill -f 'node server'",                     description: "Dræb processer der matcher et mønster",   topic: "Processer" },
  { label: "Kør med lav prioritet",  command: "nice -n 10 ./script.sh",                     description: "Start kommando med lavere CPU-prioritet (nice 10)", topic: "Processer" },
  { label: "Baggrundsproces",        command: "nohup ./script.sh &",                         description: "Kør script i baggrunden uden at stoppe ved logout", topic: "Processer" },
  { label: "Send til baggrund",      command: "bg %1",                                       description: "Fortsæt stoppet job i baggrunden",        topic: "Processer" },
  { label: "Bring til forgrund",     command: "fg %1",                                       description: "Bring baggrundsjob til forgrunden",       topic: "Processer" },
  { label: "Vis baggrundsjobbene",   command: "jobs",                                        description: "List alle aktive baggrundsjobs i shell",  topic: "Processer" },
  // Filer & mapper
  { label: "List filer",             command: "ls -la",                                      description: "List alle filer med detaljer og skjulte filer", topic: "Filer" },
  { label: "Nuværende mappe",        command: "pwd",                                         description: "Vis nuværende arbejdsmappe",              topic: "Filer" },
  { label: "Søg filer (find)",       command: "find /home -name '*.log'",                   description: "Find .log-filer under /home",             topic: "Filer" },
  { label: "Søg i filer (grep)",     command: "grep -r 'søgeord' /var/log/",                description: "Søg rekursivt efter tekst i mapper",      topic: "Filer" },
  { label: "Vis fil",                command: "cat /etc/hosts",                              description: "Vis indholdet af en fil",                 topic: "Filer" },
  { label: "Sideopdelt visning",     command: "less /var/log/syslog",                        description: "Scroll igennem stor fil",                 topic: "Filer" },
  { label: "Vis hale af fil",        command: "tail -f /var/log/nginx/access.log",           description: "Vis sidst tilføjede linjer i realtid",    topic: "Filer" },
  { label: "Diskforbrug (mappe)",    command: "du -sh /var/log/",                            description: "Vis diskforbrug for en mappe",            topic: "Filer" },
  { label: "Diskforbrug (system)",   command: "df -h",                                       description: "Vis diskplads for alle filsystemer",      topic: "Filer" },
  { label: "Kopiér fil",             command: "cp kilde.txt destination.txt",                description: "Kopiér en fil",                           topic: "Filer" },
  { label: "Flyt/omdøb fil",         command: "mv gammel.txt ny.txt",                        description: "Flyt eller omdøb en fil",                 topic: "Filer" },
  { label: "Slet fil",               command: "rm -rf /sti/til/mappe",                       description: "Slet mappe og alt indhold (forsigtig!)",  topic: "Filer" },
  { label: "Opret mappe",            command: "mkdir -p /sti/til/mappe",                     description: "Opret mappe og alle overordnede mapper",  topic: "Filer" },
  { label: "Ændr rettigheder",       command: "chmod 755 script.sh",                         description: "Sæt filrettigheder",                      topic: "Filer" },
  { label: "Ændr ejer",              command: "chown user:group fil.txt",                    description: "Ændr fil-ejer og gruppe",                 topic: "Filer" },
  { label: "Pak ind (tar.gz)",       command: "tar -czf arkiv.tar.gz /sti/mappe/",           description: "Komprimer mappe til tar.gz-arkiv",        topic: "Filer" },
  { label: "Pak ud (tar.gz)",        command: "tar -xzf arkiv.tar.gz",                       description: "Udpak tar.gz-arkiv",                      topic: "Filer" },
  { label: "Zip mappe",              command: "zip -r arkiv.zip /sti/mappe/",                description: "Pak mappe ind i zip-fil",                 topic: "Filer" },
  { label: "Unzip arkiv",            command: "unzip arkiv.zip",                             description: "Udpak zip-fil",                           topic: "Filer" },
  { label: "Erstat i fil (sed)",     command: "sed -i 's/gammel/ny/g' fil.txt",             description: "Erstat alle forekomster af tekst i fil",  topic: "Filer" },
  { label: "Udskriv kolonner (awk)", command: "awk '{print $1, $3}' fil.txt",               description: "Udskriv bestemte kolonner fra fil",       topic: "Filer" },
  // System
  { label: "Systeminfo",             command: "uname -a",                                    description: "Vis kernelversion og systeminfo",         topic: "System" },
  { label: "Hukommelsesbrug",        command: "free -h",                                     description: "Vis RAM-forbrug (human-readable)",        topic: "System" },
  { label: "CPU-info",               command: "lscpu",                                       description: "Vis detaljeret CPU-information",          topic: "System" },
  { label: "Systembelastning",       command: "uptime",                                      description: "Vis oppetid og load average",             topic: "System" },
  { label: "Aktuel bruger",          command: "whoami",                                      description: "Vis det aktuelle brugernavn",             topic: "System" },
  { label: "Logget ind brugere",     command: "who",                                         description: "Vis hvem der er logget ind",              topic: "System" },
  { label: "Kommandohistorik",       command: "history | tail -20",                          description: "Vis de seneste 20 kommandoer",            topic: "System" },
  { label: "Miljøvariabler",         command: "env",                                         description: "List alle miljøvariabler",                topic: "System" },
  { label: "Optime ydelse (nice)",   command: "nice -n 10 ./script.sh",                      description: "Kør kommando med lavere CPU-prioritet",   topic: "System" },
  { label: "Systemlog",              command: "journalctl -xe",                              description: "Vis seneste systemlog-poster",            topic: "System" },
  { label: "Service status",         command: "systemctl status nginx",                      description: "Tjek status for en systemtjeneste",       topic: "System" },
  { label: "Genstart service",       command: "systemctl restart nginx",                     description: "Genstart en systemtjeneste",              topic: "System" },
  // SSH & fjernadgang
  { label: "Opret SSH-forbindelse",  command: "ssh bruger@192.168.1.10",                    description: "Forbind til fjernserver via SSH",         topic: "SSH" },
  { label: "SSH med nøgle",          command: "ssh -i ~/.ssh/id_rsa bruger@server.dk",      description: "SSH med privat nøglefil",                 topic: "SSH" },
  { label: "Generer SSH-nøgle",      command: "ssh-keygen -t ed25519 -C 'email@example.dk'",description: "Opret nyt SSH-nøglepar",                  topic: "SSH" },
  { label: "Kopiér SSH-nøgle",       command: "ssh-copy-id bruger@server.dk",               description: "Kopiér offentlig nøgle til server",       topic: "SSH" },
  { label: "SCP upload",             command: "scp fil.txt bruger@server:/sti/",             description: "Kopiér fil til fjernserver via SSH",      topic: "SSH" },
  { label: "SCP download",           command: "scp bruger@server:/sti/fil.txt .",            description: "Kopiér fil fra fjernserver",              topic: "SSH" },
  // Brugere
  { label: "Opret bruger",           command: "useradd -m -s /bin/bash jens",               description: "Opret ny bruger med hjemmappe og shell",  topic: "Brugere" },
  { label: "Slet bruger",            command: "userdel -r jens",                             description: "Slet bruger og hjemmappe",                topic: "Brugere" },
  { label: "Ændr bruger",            command: "usermod -aG sudo jens",                       description: "Tilføj bruger til sudo-gruppen",           topic: "Brugere" },
  { label: "Skift adgangskode",      command: "passwd jens",                                 description: "Skift adgangskode for en bruger",         topic: "Brugere" },
  { label: "Vis bruger-ID",          command: "id jens",                                     description: "Vis UID, GID og gruppemedlemskaber",       topic: "Brugere" },
  { label: "Logget ind brugere",     command: "who",                                         description: "Vis hvem der er logget ind nu",            topic: "Brugere" },
  { label: "Detaljeret logininfo",   command: "w",                                           description: "Vis logininfo og hvad brugerne laver",    topic: "Brugere" },
  { label: "Skift ejer (rekursivt)", command: "chown -R www-data:www-data /var/www/",       description: "Ændr ejer rekursivt på mappe",            topic: "Brugere" },
  { label: "Skift til bruger",       command: "su - jens",                                   description: "Log ind som en anden bruger",             topic: "Brugere" },
  { label: "Kør som root",           command: "sudo -i",                                     description: "Åbn root-shell via sudo",                 topic: "Brugere" },
  { label: "Vis grupper for bruger", command: "groups jens",                                 description: "List alle grupper brugeren tilhører",     topic: "Brugere" },
  { label: "Alle brugere",           command: "getent passwd",                               description: "List alle brugere på systemet",           topic: "Brugere" },
  // Grupper
  { label: "Opret gruppe",           command: "groupadd udviklere",                          description: "Opret en ny brugergruppe",                topic: "Grupper" },
  { label: "Slet gruppe",            command: "groupdel udviklere",                          description: "Slet en eksisterende gruppe",             topic: "Grupper" },
  { label: "Omdøb gruppe",           command: "groupmod -n nyt_navn gammelt_navn",           description: "Omdøb en gruppe",                         topic: "Grupper" },
  { label: "Tilføj bruger til gruppe",command: "gpasswd -a jens udviklere",                 description: "Tilføj en bruger til en gruppe",          topic: "Grupper" },
  { label: "Fjern bruger fra gruppe",command: "gpasswd -d jens udviklere",                  description: "Fjern en bruger fra en gruppe",           topic: "Grupper" },
  { label: "Alle grupper",           command: "getent group",                                description: "List alle grupper på systemet",           topic: "Grupper" },
  { label: "Skift til gruppe",       command: "newgrp udviklere",                            description: "Start ny shell-session med gruppe som primær", topic: "Grupper" },
  // Services
  { label: "Start service",          command: "systemctl start nginx",                       description: "Start en systemtjeneste",                 topic: "Services" },
  { label: "Stop service",           command: "systemctl stop nginx",                        description: "Stop en systemtjeneste",                  topic: "Services" },
  { label: "Genstart service",       command: "systemctl restart nginx",                     description: "Genstart en systemtjeneste",              topic: "Services" },
  { label: "Aktiver ved opstart",    command: "systemctl enable nginx",                      description: "Start service automatisk ved opstart",    topic: "Services" },
  { label: "Deaktiver ved opstart",  command: "systemctl disable nginx",                     description: "Forhindre service i at starte ved opstart",topic: "Services" },
  { label: "Service status",         command: "systemctl status nginx",                      description: "Vis status for en service",               topic: "Services" },
  { label: "Alle services",          command: "service --status-all",                        description: "List alle services og deres status",      topic: "Services" },
  { label: "Service-log (journalctl)",command: "journalctl -u nginx -f",                    description: "Vis live log for en bestemt service",     topic: "Services" },
  { label: "Seneste fejl (journal)", command: "journalctl -u nginx --since today",          description: "Vis service-log fra i dag",               topic: "Services" },
  // Disk
  { label: "Diskforbrug (filsystem)", command: "df -h",                                     description: "Vis ledig og brugt plads pr. filsystem",  topic: "Disk" },
  { label: "Mappestørrelse",         command: "du -sh /var/log/",                            description: "Vis samlet størrelse for en mappe",       topic: "Disk" },
  { label: "Top 10 store mapper",    command: "du -h --max-depth=1 / | sort -rh | head -10",description: "Find de 10 største mapper i roden",       topic: "Disk" },
  { label: "Vis blokenheder",        command: "lsblk",                                       description: "List alle diske og partitioner (træstruktur)", topic: "Disk" },
  { label: "Mount filsystem",        command: "mount /dev/sdb1 /mnt/data",                  description: "Montér en partition til et mountpoint",   topic: "Disk" },
  { label: "Umount filsystem",       command: "umount /mnt/data",                            description: "Afmontér et filsystem",                   topic: "Disk" },
  { label: "Vis partitionstabel",    command: "fdisk -l",                                    description: "List alle diske og partitionsinfo",       topic: "Disk" },
  { label: "Interaktiv disk-brug",   command: "ncdu /",                                      description: "Interaktiv visning af diskforbrug (install ncdu)", topic: "Disk" },
];

const POWERSHELL_COMMANDS: Command[] = [
  // Porte
  { label: "Vis aktive forbindelser",  command: "netstat -ano",                                            description: "List alle forbindelser med PID",            topic: "Porte" },
  { label: "Find process på port",     command: 'netstat -ano | findstr ":3000"',                          description: "Find PID for processen på port 3000",       topic: "Porte" },
  { label: "Åbne TCP-porte",           command: "Get-NetTCPConnection -State Listen",                      description: "List alle TCP-porte der lytter",            topic: "Porte" },
  { label: "Port 3000 info",           command: "Get-NetTCPConnection -LocalPort 3000",                    description: "Find info om port 3000",                    topic: "Porte" },
  { label: "Dræb port (PID fra netstat)", command: 'Stop-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess -Force', description: "Dræb processen på port 3000", topic: "Porte" },
  { label: "Test port tilgængelighed", command: "Test-NetConnection -ComputerName google.com -Port 443",   description: "Test om en port er åben på en host",        topic: "Porte" },
  // Netværk
  { label: "Vis IP-konfiguration",     command: "ipconfig",                                                description: "Vis netværkskonfiguration",                 topic: "Netværk" },
  { label: "Detaljeret IP-info",       command: "ipconfig /all",                                           description: "Vis alle netværksdetaljer inkl. MAC",       topic: "Netværk" },
  { label: "Ryd DNS-cache",            command: "ipconfig /flushdns",                                      description: "Tøm den lokale DNS-cache",                  topic: "Netværk" },
  { label: "Offentlig IP",             command: "(Invoke-WebRequest -Uri 'https://ifconfig.me').Content",  description: "Find din offentlige IP-adresse",            topic: "Netværk" },
  { label: "Ping host",                command: "ping -n 4 google.com",                                    description: "Ping en host 4 gange",                      topic: "Netværk" },
  { label: "Traceroute",               command: "tracert google.com",                                      description: "Vis netværksrute til destination",          topic: "Netværk" },
  { label: "DNS-opslag",               command: "Resolve-DnsName google.com",                              description: "Slå DNS-poster op",                         topic: "Netværk" },
  { label: "nslookup",                 command: "nslookup google.com",                                     description: "Klassisk DNS-opslag",                       topic: "Netværk" },
  { label: "Netværksadaptere",         command: "Get-NetAdapter",                                          description: "List alle netværksadaptere",                topic: "Netværk" },
  { label: "Routingtabel",             command: "Get-NetRoute",                                             description: "Vis IP-routingtabellen",                    topic: "Netværk" },
  { label: "HTTP-anmodning (header)",  command: "(Invoke-WebRequest 'https://google.com').Headers",        description: "Hent HTTP-headers fra et website",          topic: "Netværk" },
  // Processer
  { label: "Alle processer",           command: "Get-Process",                                             description: "List alle kørende processer",               topic: "Processer" },
  { label: "Find proces ved navn",     command: "Get-Process -Name chrome",                                description: "Find processer med dette navn",             topic: "Processer" },
  { label: "Dræb proces ved navn",     command: "Stop-Process -Name chrome -Force",                        description: "Dræb alle processer med dette navn",        topic: "Processer" },
  { label: "Dræb proces ved PID",      command: "Stop-Process -Id 1234 -Force",                            description: "Dræb en specifik proces via PID",           topic: "Processer" },
  { label: "Taskliste (klassisk)",     command: "tasklist",                                                description: "Klassisk kommandolinje processvisning",     topic: "Processer" },
  { label: "Dræb via taskkill",        command: "taskkill /PID 1234 /F",                                   description: "Tvangsafslut proces via klassisk kommando", topic: "Processer" },
  { label: "Topcpu-processer",         command: "Get-Process | Sort-Object CPU -Descending | Select-Object -First 10", description: "Top 10 processer efter CPU-forbrug", topic: "Processer" },
  // Filer & mapper
  { label: "List filer",               command: "Get-ChildItem -Force",                                    description: "List alle filer inkl. skjulte",             topic: "Filer" },
  { label: "Rekursivt søg",            command: 'Get-ChildItem -Recurse -Filter "*.log"',                  description: "Find .log-filer rekursivt",                 topic: "Filer" },
  { label: "Søg i filer",              command: 'Select-String -Path "C:\\logs\\*" -Pattern "ERROR"',      description: "Søg efter tekst i filer",                   topic: "Filer" },
  { label: "Vis fil",                  command: "Get-Content C:\\Windows\\System32\\drivers\\etc\\hosts",  description: "Vis indholdet af en fil",                   topic: "Filer" },
  { label: "Hale af fil (live)",       command: "Get-Content C:\\log.txt -Wait",                           description: "Vis nye linjer efterhånden som de tilføjes", topic: "Filer" },
  { label: "Kopiér fil",               command: "Copy-Item kilde.txt destination.txt",                     description: "Kopiér en fil",                             topic: "Filer" },
  { label: "Flyt/omdøb fil",           command: "Move-Item gammel.txt ny.txt",                             description: "Flyt eller omdøb en fil",                   topic: "Filer" },
  { label: "Slet fil",                 command: "Remove-Item -Path C:\\temp -Recurse -Force",              description: "Slet mappe og alt indhold",                 topic: "Filer" },
  { label: "Opret mappe",              command: "New-Item -ItemType Directory -Path C:\\nymappe",          description: "Opret en ny mappe",                         topic: "Filer" },
  { label: "Diskforbrug",              command: "Get-PSDrive C",                                           description: "Vis ledig og brugt plads på C-drevet",     topic: "Filer" },
  { label: "Stor filer-finder",        command: 'Get-ChildItem C:\\ -Recurse | Sort-Object Length -Descending | Select-Object -First 10', description: "Find de 10 største filer på C", topic: "Filer" },
  // System
  { label: "Computerinfo",             command: "Get-ComputerInfo",                                        description: "Vis detaljeret systeminfo",                 topic: "System" },
  { label: "OS-version",               command: "winver",                                                  description: "Vis Windows-version (grafisk)",             topic: "System" },
  { label: "Hukommelsesinfo",          command: "Get-CimInstance Win32_PhysicalMemory",                    description: "Vis RAM-modulers detaljer",                 topic: "System" },
  { label: "CPU-info",                 command: "Get-CimInstance Win32_Processor",                         description: "Vis CPU-detaljer",                          topic: "System" },
  { label: "Systemdato",               command: "Get-Date",                                                description: "Vis aktuel dato og tid",                    topic: "System" },
  { label: "Miljøvariabler",           command: "Get-ChildItem Env:",                                      description: "List alle miljøvariabler",                  topic: "System" },
  { label: "Set miljøvariabel",        command: '$env:MYVARIABLE = "value"',                               description: "Sæt en miljøvariabel midlertidigt",         topic: "System" },
  { label: "Aktuel bruger",            command: "$env:USERNAME",                                           description: "Vis det aktuelle brugernavn",               topic: "System" },
  { label: "Services oversigt",        command: "Get-Service",                                             description: "List alle Windows-tjenester",               topic: "System" },
  { label: "Service status",           command: "Get-Service -Name 'wuauserv'",                            description: "Tjek status for Windows Update-tjeneste",   topic: "System" },
  { label: "Genstart service",         command: "Restart-Service -Name 'wuauserv'",                        description: "Genstart en Windows-tjeneste",              topic: "System" },
  { label: "Systemlog (fejl)",         command: "Get-EventLog -LogName System -EntryType Error -Newest 20",description: "Vis de 20 nyeste systemfejl",               topic: "System" },
  { label: "Installerede programmer",  command: "Get-Package",                                             description: "List installerede pakker/programmer",       topic: "System" },
  { label: "Execution Policy",         command: "Set-ExecutionPolicy RemoteSigned -Scope CurrentUser",     description: "Tillad kørsel af lokale scripts",           topic: "System" },
  // Brugere
  { label: "List lokale brugere",       command: "Get-LocalUser",                                                           description: "List alle lokale brugerkonti",               topic: "Brugere" },
  { label: "Opret lokal bruger",        command: 'New-LocalUser -Name "jens" -Password (Read-Host -AsSecureString)',        description: "Opret en ny lokal brugerkonto",              topic: "Brugere" },
  { label: "Slet lokal bruger",         command: "Remove-LocalUser -Name jens",                                             description: "Slet en lokal brugerkonto",                  topic: "Brugere" },
  { label: "Ændr lokal bruger",         command: 'Set-LocalUser -Name jens -Description "Udvikler"',                       description: "Opdater egenskaber for en lokal bruger",     topic: "Brugere" },
  { label: "Aktiver bruger",            command: "Enable-LocalUser -Name jens",                                             description: "Aktiver en deaktiveret brugerkonto",         topic: "Brugere" },
  { label: "Deaktiver bruger",          command: "Disable-LocalUser -Name jens",                                            description: "Deaktiver en brugerkonto",                   topic: "Brugere" },
  { label: "List lokale grupper",       command: "Get-LocalGroup",                                                          description: "List alle lokale grupper",                   topic: "Brugere" },
  { label: "Tilføj bruger til gruppe",  command: "Add-LocalGroupMember -Group Administrators -Member jens",                 description: "Tilføj bruger til en lokal gruppe",          topic: "Brugere" },
  // Grupper
  { label: "Opret lokal gruppe",        command: 'New-LocalGroup -Name "Udviklere" -Description "Dev team"',               description: "Opret en ny lokal gruppe",                   topic: "Grupper" },
  { label: "Slet lokal gruppe",         command: "Remove-LocalGroup -Name Udviklere",                                       description: "Slet en lokal gruppe",                       topic: "Grupper" },
  { label: "Vis gruppemedlemmer",       command: "Get-LocalGroupMember -Group Administrators",                              description: "List alle medlemmer af en gruppe",           topic: "Grupper" },
  { label: "Tilføj medlem til gruppe",  command: "Add-LocalGroupMember -Group Udviklere -Member jens",                     description: "Tilføj bruger eller gruppe som medlem",      topic: "Grupper" },
  { label: "Fjern medlem fra gruppe",   command: "Remove-LocalGroupMember -Group Udviklere -Member jens",                  description: "Fjern et medlem fra en gruppe",              topic: "Grupper" },
  // Services
  { label: "List alle services",        command: "Get-Service",                                                             description: "List alle Windows-tjenester",                topic: "Services" },
  { label: "Start service",             command: "Start-Service -Name wuauserv",                                            description: "Start en Windows-tjeneste",                  topic: "Services" },
  { label: "Stop service",              command: "Stop-Service -Name wuauserv",                                             description: "Stop en Windows-tjeneste",                   topic: "Services" },
  { label: "Genstart service",          command: "Restart-Service -Name wuauserv",                                          description: "Genstart en Windows-tjeneste",               topic: "Services" },
  { label: "Ændr opstarttype",          command: "Set-Service -Name wuauserv -StartupType Automatic",                      description: "Sæt service til automatisk opstart",         topic: "Services" },
  { label: "Opret ny service",          command: 'New-Service -Name MinSvc -BinaryPathName "C:\\svc.exe"',                 description: "Registrer en ny Windows-service",            topic: "Services" },
  { label: "Kørende services",          command: "Get-Service | Where-Object {$_.Status -eq 'Running'}",                   description: "Vis kun services der kører lige nu",         topic: "Services" },
  // Netværk (udvidede)
  { label: "Vis netværksadaptere",      command: "Get-NetAdapter",                                                          description: "List alle netværksadaptere og deres status", topic: "Netværk" },
  { label: "Vis IP-adresser (PS)",      command: "Get-NetIPAddress",                                                        description: "List alle IP-adresser på alle interfaces",   topic: "Netværk" },
  { label: "Test forbindelse",          command: "Test-Connection -ComputerName google.com -Count 4",                       description: "Ping en host via PowerShell cmdlet",         topic: "Netværk" },
  { label: "DNS-opslag (PS)",           command: "Resolve-DnsName google.com",                                              description: "Slå DNS-poster op med PS-cmdlet",            topic: "Netværk" },
  { label: "HTTP-anmodning (PS)",       command: "Invoke-WebRequest -Uri https://google.com -UseBasicParsing",             description: "Udfør HTTP GET-anmodning",                   topic: "Netværk" },
  { label: "Vis routingtabel (PS)",     command: "Get-NetRoute",                                                            description: "Vis IP-routingtabellen via PS-cmdlet",       topic: "Netværk" },
  // Porte (udvidede)
  { label: "Alle TCP-forbindelser (PS)", command: "Get-NetTCPConnection",                                                   description: "List alle aktive TCP-forbindelser",          topic: "Porte" },
  { label: "Test port (PS)",            command: "Test-NetConnection -ComputerName localhost -Port 3000",                   description: "Test om en bestemt port er åben",            topic: "Porte" },
  { label: "Find vindue-proces",        command: 'Get-Process | Where-Object {$_.MainWindowTitle -ne ""}',                 description: "List processer der har et aktivt vindue",    topic: "Porte" },
  // Processer (udvidede)
  { label: "Start ny proces",           command: "Start-Process notepad.exe",                                               description: "Start et nyt program via PowerShell",        topic: "Processer" },
  { label: "Vent på proces",            command: "Wait-Process -Name notepad",                                              description: "Vent til en proces afslutter",               topic: "Processer" },
  { label: "Top CPU-processer (PS)",    command: "Get-Process | Sort-Object CPU -Descending | Select-Object -First 10",    description: "Top 10 processer sorteret efter CPU-brug",   topic: "Processer" },
];

const KUBERNETES_COMMANDS: Command[] = [
  // Overblik
  { label: "Se alle pods",              command: "kubectl get pods",                                                    description: "List alle kørende pods i namespace",         topic: "Overblik" },
  { label: "Se alle services",          command: "kubectl get services",                                                description: "List alle services",                         topic: "Overblik" },
  { label: "Se alle deployments",       command: "kubectl get deployments",                                             description: "List alle deployments",                      topic: "Overblik" },
  { label: "Se alt",                    command: "kubectl get all",                                                     description: "Vis pods, services, deployments og mere",    topic: "Overblik" },
  { label: "Se pods (alle namespaces)", command: "kubectl get pods --all-namespaces",                                   description: "Vis pods på tværs af alle namespaces",       topic: "Overblik" },
  { label: "Se nodes",                  command: "kubectl get nodes",                                                   description: "List alle cluster-noder",                    topic: "Overblik" },
  { label: "Se namespaces",             command: "kubectl get namespaces",                                              description: "List alle namespaces",                       topic: "Overblik" },
  { label: "Se config maps",            command: "kubectl get configmaps",                                              description: "List alle ConfigMaps",                       topic: "Overblik" },
  { label: "Se secrets",                command: "kubectl get secrets",                                                 description: "List alle Secrets",                          topic: "Overblik" },
  // Deploy
  { label: "Anvend deployment",         command: "kubectl apply -f k8s/deployment.yaml",                               description: "Opret eller opdater deployment fra YAML",    topic: "Deploy" },
  { label: "Anvend service",            command: "kubectl apply -f k8s/service.yaml",                                  description: "Opret eller opdater service fra YAML",       topic: "Deploy" },
  { label: "Anvend hel mappe",          command: "kubectl apply -f k8s/",                                              description: "Anvend alle YAML-filer i k8s/-mappen",       topic: "Deploy" },
  { label: "Tør kør (dry-run)",         command: "kubectl apply -f k8s/deployment.yaml --dry-run=client",              description: "Valider YAML uden at anvende ændringer",     topic: "Deploy" },
  { label: "Slet fra YAML",             command: "kubectl delete -f k8s/deployment.yaml",                              description: "Slet ressource defineret i YAML-fil",        topic: "Deploy" },
  { label: "Slet service fra YAML",     command: "kubectl delete -f k8s/service.yaml",                                 description: "Slet service defineret i YAML-fil",          topic: "Deploy" },
  // Skalering
  { label: "Skalér op (4 replicas)",    command: "kubectl scale deployment financial-api --replicas=4",                description: "Skalér deployment op til 4 pods",            topic: "Skalering" },
  { label: "Skalér ned (2 replicas)",   command: "kubectl scale deployment financial-api --replicas=2",                description: "Skalér deployment ned til 2 pods",           topic: "Skalering" },
  { label: "Auto-skaler",               command: "kubectl autoscale deployment financial-api --min=2 --max=6 --cpu-percent=70", description: "Opsæt Horizontal Pod Autoscaler",    topic: "Skalering" },
  { label: "Se HPA",                    command: "kubectl get hpa",                                                     description: "Vis Horizontal Pod Autoscalers",             topic: "Skalering" },
  // Tilgå appen
  { label: "Port-forward service",      command: "kubectl port-forward service/financial-api 9090:80",                 description: "Tilgå appen på http://localhost:9090",       topic: "Adgang" },
  { label: "Port-forward pod",          command: "kubectl port-forward pod/<pod-navn> 8080:8080",                      description: "Direkte port-forward til specifik pod",      topic: "Adgang" },
  { label: "Åbn i browser (minikube)",  command: "minikube service financial-api",                                     description: "Åbn minikube-service direkte i browser",     topic: "Adgang" },
  { label: "Hent service URL",          command: "minikube service financial-api --url",                               description: "Vis URL for minikube-service",               topic: "Adgang" },
  // Logs
  { label: "Logs (label-selektor)",     command: "kubectl logs -l app=financial-api",                                  description: "Vis logs for pods med label app=financial-api", topic: "Logs" },
  { label: "Live logs",                 command: "kubectl logs -l app=financial-api -f",                               description: "Stream logs i realtid",                      topic: "Logs" },
  { label: "Logs (specifik pod)",       command: "kubectl logs <pod-navn>",                                            description: "Vis logs for en specifik pod",               topic: "Logs" },
  { label: "Tidligere logs (crashed)",  command: "kubectl logs <pod-navn> --previous",                                 description: "Vis logs fra den forrige (nedstyrtede) container", topic: "Logs" },
  { label: "Logs (siden 1 time)",       command: "kubectl logs <pod-navn> --since=1h",                                 description: "Vis logs fra de seneste 60 minutter",        topic: "Logs" },
  // Fejlsøgning
  { label: "Beskriv pod",               command: "kubectl describe pod <pod-navn>",                                    description: "Detaljeret info om en pod inkl. events",     topic: "Fejlsøgning" },
  { label: "Beskriv deployment",        command: "kubectl describe deployment financial-api",                          description: "Detaljeret info om deployment",              topic: "Fejlsøgning" },
  { label: "Beskriv service",           command: "kubectl describe service financial-api",                             description: "Detaljeret info om service",                 topic: "Fejlsøgning" },
  { label: "Shell i pod",               command: "kubectl exec -it <pod-navn> -- /bin/bash",                           description: "Åbn interaktiv shell i kørende pod",         topic: "Fejlsøgning" },
  { label: "Kør kommando i pod",        command: "kubectl exec <pod-navn> -- env",                                     description: "Kør en enkelt kommando i pod",               topic: "Fejlsøgning" },
  { label: "Se events",                 command: "kubectl get events --sort-by=.metadata.creationTimestamp",           description: "Vis cluster-events sorteret efter tid",      topic: "Fejlsøgning" },
  { label: "Top pods (CPU/RAM)",        command: "kubectl top pods",                                                   description: "Vis CPU og RAM forbrug for alle pods",       topic: "Fejlsøgning" },
  { label: "Top nodes",                 command: "kubectl top nodes",                                                  description: "Vis CPU og RAM forbrug for alle noder",      topic: "Fejlsøgning" },
  // Opdater image
  { label: "Opdater image",             command: "kubectl set image deployment/financial-api financial-api=yousaftj04/financial-api:latest", description: "Skift container-image i deployment", topic: "Image" },
  { label: "Rollout status",            command: "kubectl rollout status deployment/financial-api",                    description: "Overvåg deployment-fremgangen",              topic: "Image" },
  { label: "Rollout historik",          command: "kubectl rollout history deployment/financial-api",                   description: "Vis alle deployment-revisioner",             topic: "Image" },
  { label: "Rul tilbage",               command: "kubectl rollout undo deployment/financial-api",                      description: "Rul deployment tilbage til forrige version", topic: "Image" },
  { label: "Rul tilbage til revision",  command: "kubectl rollout undo deployment/financial-api --to-revision=2",     description: "Rul til specifik revision",                  topic: "Image" },
  // Minikube
  { label: "Start minikube",            command: '& "C:\\Program Files\\Kubernetes\\Minikube\\minikube.exe" start',   description: "Start minikube-cluster (Windows)",           topic: "Minikube" },
  { label: "Stop minikube",             command: '& "C:\\Program Files\\Kubernetes\\Minikube\\minikube.exe" stop',    description: "Stop minikube-cluster",                      topic: "Minikube" },
  { label: "Minikube status",           command: '& "C:\\Program Files\\Kubernetes\\Minikube\\minikube.exe" status',  description: "Vis minikube-status",                        topic: "Minikube" },
  { label: "Minikube dashboard",        command: '& "C:\\Program Files\\Kubernetes\\Minikube\\minikube.exe" dashboard',"description": "Åbn Kubernetes-dashboard i browser",     topic: "Minikube" },
  { label: "Minikube IP",               command: '& "C:\\Program Files\\Kubernetes\\Minikube\\minikube.exe" ip',      description: "Vis minikube-clusterets IP-adresse",         topic: "Minikube" },
  { label: "Aktiver addon",             command: '& "C:\\Program Files\\Kubernetes\\Minikube\\minikube.exe" addons enable ingress', description: "Aktiver en minikube addon (f.eks. ingress)", topic: "Minikube" },
];

const DOCKER_COMMANDS: Command[] = [
  // Containers
  { label: "Vis kørende containers",    command: "docker ps",                                                           description: "List alle aktive containers",                                  topic: "Containers" },
  { label: "Vis alle containers",       command: "docker ps -a",                                                        description: "Alle containers inkl. stoppede",                               topic: "Containers" },
  { label: "Start container",           command: "docker start <navn|id>",                                              description: "Start en eksisterende (stoppet) container",                    topic: "Containers" },
  { label: "Stop container",            command: "docker stop <navn|id>",                                               description: "Stop en kørende container",                                    topic: "Containers" },
  { label: "Slet container",            command: "docker rm <navn|id>",                                                 description: "Slet en stoppet container",                                    topic: "Containers" },
  { label: "Vis logs",                  command: "docker logs <navn|id>",                                               description: "Hent logs fra en container",                                   topic: "Containers" },
  { label: "Kør kommando i container",  command: "docker exec -it <container_id> <kommando>",                           description: "Kør en kommando i en kørende container (-it = interaktiv)",    topic: "Containers" },
  // Images
  { label: "Vis lokale images",         command: "docker images",                                                       description: "List alle lokale Docker-images",                               topic: "Images" },
  { label: "Pull image",                command: "docker pull <image>:<tag>",                                           description: "Download et image fra Docker Hub",                             topic: "Images" },
  { label: "Slet image",                command: "docker rmi <navn|id>",                                                description: "Fjern et lokalt image",                                        topic: "Images" },
  { label: "Byg image fra Dockerfile",  command: "docker build -t <navn:tag> .",                                        description: "Byg et image fra Dockerfile i aktuel mappe (-t = navn+tag)",   topic: "Images" },
  // Kør
  { label: "Kør container",             command: "docker run <image>:<tag>",                                            description: "Kør en container fra et image (henter fra Hub hvis ikke lokal)", topic: "Kør" },
  { label: "Kør i baggrunden",          command: "docker run -d <image>:<tag>",                                         description: "Detached mode — overtager ikke din terminal",                  topic: "Kør" },
  { label: "Kør med port-binding",      command: "docker run -d -p <lokalport>:<containerport> <image>:<tag>",          description: "Bind lokal port til containerens port",                        topic: "Kør" },
  { label: "Kør med navn + port",       command: "docker run --name <navn> -d -p <lokalport>:<containerport> <image>:<tag>", description: "Start navngiven container i baggrunden med port-binding", topic: "Kør" },
  // Dockerfile
  { label: "FROM",                      command: "FROM <image>:<tag>",                                                  description: "Sætter basis-image. Dockerfile skal starte med FROM",         topic: "Dockerfile" },
  { label: "COPY",                      command: "COPY <src> <dest>/",                                                  description: "Kopiér filer/mapper ind i containeren (trailing / = opret mappe)", topic: "Dockerfile" },
  { label: "WORKDIR",                   command: "WORKDIR /app",                                                        description: "Sætter arbejdsmappe for RUN, CMD, COPY m.fl.",                 topic: "Dockerfile" },
  { label: "RUN",                       command: "RUN <kommando>",                                                      description: "Kør kommando i containermiljøet — tilføjer nyt image-lag",    topic: "Dockerfile" },
  { label: "CMD",                       command: 'CMD ["executable","param1","param2"]',                                 description: "Standardkommando når containeren startes",                     topic: "Dockerfile" },
  { label: "ENTRYPOINT",                command: 'ENTRYPOINT ["executable","param1"]',                                  description: "Konfigurér container som eksekverbar",                         topic: "Dockerfile" },
  { label: "ADD",                       command: "ADD <src> <dest>",                                                    description: "Som COPY, men understøtter også URL og tar-udtræk",            topic: "Dockerfile" },
  { label: "EXPOSE",                    command: "EXPOSE <port>",                                                       description: "Dokumentér hvilken port containeren lytter på",                topic: "Dockerfile" },
  { label: "ENV",                       command: 'ENV <nøgle>="<værdi>"',                                               description: "Sæt miljøvariabel — tilgængelig i alle efterfølgende lag",     topic: "Dockerfile" },
  { label: "VOLUME",                    command: "VOLUME /myvol",                                                       description: "Opret mount point til eksternt volumen",                       topic: "Dockerfile" },
  { label: "ARG",                       command: "ARG VERSION=latest",                                                  description: "Variabel der kan sættes ved build-time med --build-arg",      topic: "Dockerfile" },
  { label: "USER",                      command: "USER <brugernavn>",                                                   description: "Sæt bruger for RUN, CMD og ENTRYPOINT",                        topic: "Dockerfile" },
  // Compose
  { label: "Start alle services",       command: "docker-compose up",                                                   description: "Start alle services defineret i docker-compose.yml",          topic: "Compose" },
  { label: "Stop alle services",        command: "docker-compose down",                                                  description: "Stop og fjern alle services fra docker-compose.yml",          topic: "Compose" },
];

// ─── Git commands ─────────────────────────────────────────────────────────────

const GIT_COMMANDS: Command[] = [
  // Opsætning
  { label: "Sæt brugernavn",        command: 'git config --global user.name "Dit Navn"',              description: "Sæt globalt brugernavn til commits",              topic: "Opsætning" },
  { label: "Sæt email",             command: 'git config --global user.email "email@example.com"',    description: "Sæt global email til commits",                    topic: "Opsætning" },
  { label: "Vis konfiguration",     command: "git config --list",                                      description: "Vis alle Git-indstillinger",                       topic: "Opsætning" },
  { label: "Sæt standard editor",   command: 'git config --global core.editor "code --wait"',         description: "Brug VS Code som commit-editor",                   topic: "Opsætning" },
  { label: "Sæt standard branch",   command: "git config --global init.defaultBranch main",           description: "Brug 'main' som standard branchnavn",              topic: "Opsætning" },
  { label: "Initialiser repo",      command: "git init",                                               description: "Opret nyt Git-repository i aktuel mappe",         topic: "Opsætning" },
  { label: "Klon repository",       command: "git clone https://github.com/user/repo.git",            description: "Klon et eksternt repository lokalt",              topic: "Opsætning" },
  { label: "Klon til mappe",        command: "git clone https://github.com/user/repo.git min-mappe",  description: "Klon til specifik mappe",                         topic: "Opsætning" },
  { label: "Tilføj remote",         command: "git remote add origin https://github.com/user/repo.git",description: "Tilknyt remote repository kaldet 'origin'",        topic: "Opsætning" },
  { label: "Vis remotes",           command: "git remote -v",                                          description: "Vis alle konfigurerede remote-adresser",           topic: "Opsætning" },
  { label: "Skift remote URL",      command: "git remote set-url origin https://github.com/user/repo.git", description: "Opdater URL til origin-remote",               topic: "Opsætning" },
  // Status & log
  { label: "Status",                command: "git status",                                             description: "Vis ændrede og unstagede filer",                   topic: "Status & Log" },
  { label: "Kort status",           command: "git status -s",                                          description: "Kompakt statusvisning",                           topic: "Status & Log" },
  { label: "Log",                   command: "git log",                                                description: "Vis commit-historik",                             topic: "Status & Log" },
  { label: "Log (kompakt)",         command: "git log --oneline",                                      description: "Ét commit pr. linje",                             topic: "Status & Log" },
  { label: "Log med graf",          command: "git log --oneline --graph --all",                        description: "Branching-historik som ASCII-graf",               topic: "Status & Log" },
  { label: "Log for fil",           command: "git log --follow -- fil.txt",                            description: "Vis historik kun for én fil",                     topic: "Status & Log" },
  { label: "Vis ændringer",         command: "git diff",                                               description: "Vis alle ikke-stagede ændringer",                 topic: "Status & Log" },
  { label: "Staged diff",           command: "git diff --staged",                                      description: "Vis ændringer der er klar til commit",            topic: "Status & Log" },
  { label: "Diff to branches",      command: "git diff main..feature",                                 description: "Sammenlign to branches",                          topic: "Status & Log" },
  { label: "Vis commit",            command: "git show abc1234",                                       description: "Vis indhold af et specifikt commit",              topic: "Status & Log" },
  { label: "Blame",                 command: "git blame fil.txt",                                      description: "Vis hvem der sidst ændrede hver linje",           topic: "Status & Log" },
  // Staging & commits
  { label: "Stage fil",             command: "git add fil.txt",                                        description: "Tilføj specifik fil til staging",                 topic: "Commits" },
  { label: "Stage alle",            command: "git add .",                                              description: "Stage alle ændringer i arbejdsmappe",             topic: "Commits" },
  { label: "Stage interaktivt",     command: "git add -p",                                             description: "Vælg præcis hvilke ændringer der stages (hunk for hunk)", topic: "Commits" },
  { label: "Unstage fil",           command: "git restore --staged fil.txt",                           description: "Fjern fil fra staging uden at miste ændringer",   topic: "Commits" },
  { label: "Commit",                command: 'git commit -m "din besked"',                             description: "Opret commit med besked",                         topic: "Commits" },
  { label: "Commit alle ændringer", command: 'git commit -am "din besked"',                            description: "Stage og commit alle trackede filer på én gang",  topic: "Commits" },
  { label: "Amend commit",          command: 'git commit --amend -m "ny besked"',                      description: "Ret seneste commit-besked (kun upushed commits!)", topic: "Commits" },
  { label: "Amend uden besked",     command: "git commit --amend --no-edit",                           description: "Tilføj ændringer til seneste commit uden ny besked", topic: "Commits" },
  { label: "Tom commit",            command: 'git commit --allow-empty -m "trigger CI"',               description: "Opret commit uden ændringer — fx til at trigge CI", topic: "Commits" },
  { label: "Fortryd commit (soft)", command: "git reset --soft HEAD~1",                                description: "Fortryd seneste commit men behold ændringer stagede", topic: "Commits" },
  { label: "Fortryd commit (mixed)",command: "git reset HEAD~1",                                       description: "Fortryd commit — ændringer bevares men unstages",  topic: "Commits" },
  { label: "Revert commit",         command: "git revert abc1234",                                     description: "Lav nyt commit der ophæver et specifikt commit (sikkert)", topic: "Commits" },
  { label: "Cherry-pick",           command: "git cherry-pick abc1234",                                description: "Kopiér ét specifikt commit til aktuel branch",    topic: "Commits" },
  // Branches
  { label: "Vis branches",          command: "git branch",                                             description: "List alle lokale branches",                       topic: "Branches" },
  { label: "Vis alle branches",     command: "git branch -a",                                          description: "List lokale og remote branches",                  topic: "Branches" },
  { label: "Opret branch",          command: "git branch feature/ny-funktion",                         description: "Opret ny branch uden at skifte til den",          topic: "Branches" },
  { label: "Skift branch",          command: "git checkout feature/ny-funktion",                       description: "Skift til en eksisterende branch",                topic: "Branches" },
  { label: "Opret og skift",        command: "git checkout -b feature/ny-funktion",                    description: "Opret ny branch og skift til den med det samme",  topic: "Branches" },
  { label: "Opret og skift (ny)",   command: "git switch -c feature/ny-funktion",                      description: "Moderne alternativ til checkout -b",              topic: "Branches" },
  { label: "Omdøb branch",          command: "git branch -m gammelt-navn nyt-navn",                    description: "Omdøb en lokal branch",                           topic: "Branches" },
  { label: "Slet branch (lokal)",   command: "git branch -d feature/faerdig",                          description: "Slet merget lokal branch",                        topic: "Branches" },
  { label: "Tving slet branch",     command: "git branch -D feature/faerdig",                          description: "Slet branch uanset om den er merget",             topic: "Branches" },
  { label: "Slet remote branch",    command: "git push origin --delete feature/faerdig",               description: "Slet en branch på remote",                        topic: "Branches" },
  { label: "Spor remote branch",    command: "git branch --set-upstream-to=origin/main main",          description: "Kæd lokal branch til remote branch",              topic: "Branches" },
  // Merge & rebase
  { label: "Merge branch",          command: "git merge feature/ny-funktion",                          description: "Merge specifik branch ind i aktuel branch",       topic: "Merge & Rebase" },
  { label: "Merge (no fast-forward)",command: "git merge --no-ff feature/ny-funktion",                 description: "Merge med merge-commit selvom fast-forward er mulig", topic: "Merge & Rebase" },
  { label: "Merge squash",          command: "git merge --squash feature/ny-funktion",                 description: "Kombiner alle commits fra branch til ét commit",  topic: "Merge & Rebase" },
  { label: "Abort merge",           command: "git merge --abort",                                      description: "Annuller igangværende merge ved konflikt",         topic: "Merge & Rebase" },
  { label: "Rebase på main",        command: "git rebase main",                                        description: "Genspil din branch oven på main",                 topic: "Merge & Rebase" },
  { label: "Interaktiv rebase",     command: "git rebase -i HEAD~3",                                   description: "Rediger, squash eller omarranger de sidste 3 commits", topic: "Merge & Rebase" },
  { label: "Abort rebase",          command: "git rebase --abort",                                     description: "Annuller igangværende rebase",                     topic: "Merge & Rebase" },
  { label: "Fortsæt rebase",        command: "git rebase --continue",                                  description: "Fortsæt rebase efter konflikter er løst",         topic: "Merge & Rebase" },
  // Push & Pull
  { label: "Push",                  command: "git push",                                               description: "Push aktuel branch til remote",                   topic: "Push & Pull" },
  { label: "Push og sæt upstream",  command: "git push -u origin feature/ny-funktion",                 description: "Push ny branch og kæd den til remote",            topic: "Push & Pull" },
  { label: "Force push (forsigtig)",command: "git push --force-with-lease",                            description: "Force push — men fejl hvis andre har pushet",     topic: "Push & Pull" },
  { label: "Pull",                  command: "git pull",                                               description: "Hent og merge ændringer fra remote",              topic: "Push & Pull" },
  { label: "Pull med rebase",       command: "git pull --rebase",                                      description: "Hent remote og rebase lokale commits ovenpå",     topic: "Push & Pull" },
  { label: "Fetch",                 command: "git fetch",                                              description: "Hent remote-ændringer uden at merge",             topic: "Push & Pull" },
  { label: "Fetch alle",            command: "git fetch --all",                                        description: "Hent fra alle remotes",                           topic: "Push & Pull" },
  { label: "Fetch og prune",        command: "git fetch --prune",                                      description: "Hent og ryd op i slettede remote branches",       topic: "Push & Pull" },
  { label: "Pull specific branch",  command: "git pull origin main",                                   description: "Pull specifik remote branch",                     topic: "Push & Pull" },
  // Stash
  { label: "Gem stash",             command: "git stash",                                              description: "Gem midlertidigt alle ændringer i stash",         topic: "Stash" },
  { label: "Stash med besked",      command: 'git stash save "WIP: arbejder på login"',                description: "Gem stash med beskrivende navn",                   topic: "Stash" },
  { label: "Vis stash-liste",       command: "git stash list",                                         description: "List alle gemte stashes",                         topic: "Stash" },
  { label: "Gendan stash",          command: "git stash pop",                                          description: "Gendan seneste stash og slet den fra listen",     topic: "Stash" },
  { label: "Anvend stash",          command: "git stash apply stash@{2}",                              description: "Anvend specifik stash uden at slette den",        topic: "Stash" },
  { label: "Slet stash",            command: "git stash drop stash@{0}",                               description: "Slet en specifik stash",                          topic: "Stash" },
  { label: "Ryd alle stashes",      command: "git stash clear",                                        description: "Slet alle gemte stashes",                         topic: "Stash" },
  // Tags
  { label: "Vis tags",              command: "git tag",                                                description: "List alle tags i repositoryet",                   topic: "Tags" },
  { label: "Opret tag",             command: "git tag v1.0.0",                                         description: "Opret letvægts-tag på aktuelt commit",            topic: "Tags" },
  { label: "Annoteret tag",         command: 'git tag -a v1.0.0 -m "Release 1.0.0"',                  description: "Opret annoteret tag med besked",                  topic: "Tags" },
  { label: "Push tags",             command: "git push origin --tags",                                 description: "Push alle lokale tags til remote",                topic: "Tags" },
  { label: "Push ét tag",           command: "git push origin v1.0.0",                                 description: "Push specifikt tag til remote",                   topic: "Tags" },
  { label: "Slet lokalt tag",       command: "git tag -d v1.0.0",                                      description: "Slet et lokalt tag",                              topic: "Tags" },
  { label: "Slet remote tag",       command: "git push origin --delete v1.0.0",                        description: "Slet tag på remote",                              topic: "Tags" },
  // Fejlsøgning & reparation
  { label: "Bisect start",          command: "git bisect start",                                       description: "Start binær søgning efter hvilken commit introducerede en bug", topic: "Fejlsøgning" },
  { label: "Bisect bad",            command: "git bisect bad",                                         description: "Markér aktuelt commit som fejlbehæftet",          topic: "Fejlsøgning" },
  { label: "Bisect good",           command: "git bisect good v2.0",                                   description: "Markér et commit som fungerende",                 topic: "Fejlsøgning" },
  { label: "Reflog",                command: "git reflog",                                             description: "Vis al lokal Git-aktivitet — find tabte commits", topic: "Fejlsøgning" },
  { label: "Gendan tabt commit",    command: "git checkout abc1234",                                   description: "Gå til et commit fundet via reflog",              topic: "Fejlsøgning" },
  { label: "Ryd utrackede filer",   command: "git clean -fd",                                          description: "Slet alle utrackede filer og mapper",             topic: "Fejlsøgning" },
  { label: "Nulstil til remote",    command: "git reset --hard origin/main",                           description: "Kassér ALLE lokale ændringer — match remote main (destruktivt!)", topic: "Fejlsøgning" },
  { label: "Vis mistet data",       command: "git fsck --lost-found",                                  description: "Find forældreløse commits og blobs",              topic: "Fejlsøgning" },
  // .gitignore
  { label: "Vis ignorerede filer",  command: "git ls-files --ignored --exclude-standard",              description: "List alle filer ignoreret af .gitignore",         topic: ".gitignore" },
  { label: "Stop tracking fil",     command: "git rm --cached fil.txt",                                description: "Fjern fil fra Git tracking (bevar på disk)",      topic: ".gitignore" },
  { label: "Stop tracking mappe",   command: "git rm -r --cached node_modules/",                       description: "Fjern mappe fra tracking — brug .gitignore bagefter", topic: ".gitignore" },
  { label: "Tjek om fil ignoreres", command: "git check-ignore -v fil.txt",                            description: "Vis hvilken .gitignore-regel der ignorerer filen", topic: ".gitignore" },
];

// ─── Networking knowledge ─────────────────────────────────────────────────────

type KnowledgeTopic = "Grundlæggende" | "Protokoller" | "Cloud & Docker" | "Sikkerhed" | "IoT & Avanceret";
type KnowledgeItem = { term: string; explanation: string; topic: KnowledgeTopic; };

const NETWORKING_KNOWLEDGE: KnowledgeItem[] = [
  { term: "IP-adresse",             topic: "Grundlæggende",   explanation: "Unik numerisk identifikator (fx 203.0.113.10) der gør det muligt for enheder at finde hinanden på netværket." },
  { term: "DNS",                    topic: "Grundlæggende",   explanation: "Oversætter domænenavne til IP-adresser. Du skriver google.com, DNS finder IP'en bag." },
  { term: "Port",                   topic: "Grundlæggende",   explanation: "Nummereret kanal (1-65535) på en server. Hver applikation lytter på sin egen port så trafik havner det rigtige sted." },
  { term: "Port 80/443/3306",       topic: "Grundlæggende",   explanation: "80 er HTTP, 443 er HTTPS, 3306 er MySQL. Standardporte alle systemer kender." },
  { term: "Subnet",                 topic: "Grundlæggende",   explanation: "En opdeling af netværket i separate sektioner. Frontend i ét subnet, database i et andet, for sikkerhed og isolation." },
  { term: "Routing",                topic: "Grundlæggende",   explanation: "Bestemmer stien data skal tage mellem subnets. Fungerer som GPS for netværkspakker." },
  { term: "NAT",                    topic: "Grundlæggende",   explanation: "Lader mange private servere dele én offentlig IP-adresse når de tilgår internettet." },
  { term: "HTTP/HTTPS",             topic: "Protokoller",     explanation: "HTTP sender data i klartekst. HTTPS krypterer med SSL/TLS. Al sensitiv trafik skal bruge HTTPS." },
  { term: "TCP/IP",                 topic: "Protokoller",     explanation: "TCP sikrer pålidelig levering af pakker i korrekt rækkefølge. IP finder ruten derhen." },
  { term: "DHCP",                   topic: "Protokoller",     explanation: "Tildeler automatisk IP-adresser til enheder der forbinder til et netværk. Uden det skulle du gøre det manuelt." },
  { term: "SSH",                    topic: "Protokoller",     explanation: "Krypteret fjernlogin til servere. Erstatter Telnet der sendte alt i klartekst." },
  { term: "FTP/SFTP",               topic: "Protokoller",     explanation: "FTP overfører filer i klartekst. SFTP krypterer alt via SSH. Brug altid SFTP." },
  { term: "IPSec/VPN",              topic: "Protokoller",     explanation: "IPSec krypterer al netværkstrafik på pakkeniveau. Bruges i VPN så din internetudbyder ikke kan se hvad du sender." },
  { term: "BGP",                    topic: "Protokoller",     explanation: "Internettets trafikstyringssystem. Fortæller routere verden over hvilke veje der fører til hvilke netværk. En fejl kan tage store tjenester offline." },
  { term: "QUIC",                   topic: "IoT & Avanceret", explanation: "Nyere protokol der erstatter TCP. Reducerer latency ved at minimere handshake-processen. Bruges til streaming og gaming." },
  { term: "MQTT",                   topic: "IoT & Avanceret", explanation: "Letvægtsprotokol til IoT-enheder som smarte termostater og sensorer. Bruger minimal strøm og båndbredde." },
  { term: "VPC",                    topic: "Cloud & Docker",  explanation: "Dit eget isolerede afsnit af cloud-udbyderens netværk. Samme koncepter som fysisk netværk, bare som managed service." },
  { term: "Internet Gateway",       topic: "Cloud & Docker",  explanation: "Forbinder dine offentlige subnets i en VPC med internettet. Hoveddøren ud." },
  { term: "Docker bridge network",  topic: "Cloud & Docker",  explanation: "Privat netværk kun på én server. Containere på samme host kan tale med hinanden via containernavne." },
  { term: "Port mapping",           topic: "Cloud & Docker",  explanation: "Binder en port på host-serveren til en port inde i containeren så ekstern trafik kan nå applikationen." },
  { term: "Docker overlay network", topic: "Cloud & Docker",  explanation: "Virtuelt netværk der spænder over flere servere så containere på forskellige hosts kan kommunikere." },
  { term: "Kubernetes pod",         topic: "Cloud & Docker",  explanation: "Mindste enhed i Kubernetes. En eller flere containere der deler samme IP. Er midlertidig — kan slettes og genskabes når som helst." },
  { term: "Kubernetes Service",     topic: "Cloud & Docker",  explanation: "Giver en stabil IP og DNS-navn foran pods. Pods kan udskiftes i baggrunden uden at forbindelser bryder." },
  { term: "Kubernetes Ingress",     topic: "Cloud & Docker",  explanation: "Ruter ekstern trafik til de rigtige interne services baseret på URL-sti eller domæne." },
  { term: "Host firewall",          topic: "Sikkerhed",       explanation: "Sidder på den enkelte server og filtrerer trafik ind/ud af den specifikke maskine." },
  { term: "Network firewall",       topic: "Sikkerhed",       explanation: "Sidder mellem subnets og filtrerer trafik på netværksniveau før det overhovedet når serverene." },
  { term: "DNS spoofing",           topic: "Sikkerhed",       explanation: "Angreb hvor DNS-poster manipuleres så brugere sendes til falske websites i stedet for de rigtige." },
  { term: "SMB",                    topic: "Sikkerhed",       explanation: "Windows-protokol til intern fildeling. Udnyttet af WannaCry-ransomwaren i 2017." },
  { term: "RDP",                    topic: "Sikkerhed",       explanation: "Fjernadgang til Windows-skrivebord. Svage kodeord og åbne porte er en klassisk indgangsvektor for angribere." },
  { term: "WPA2/WPA3",              topic: "Sikkerhed",       explanation: "Krypteringsprotokoller til Wi-Fi. WPA3 er nyere og langt mere modstandsdygtig over for brute-force angreb." },
];

// ─── Viden data & component ───────────────────────────────────────────────────

type VidenCategoryId = "netværk" | "it-sikkerhed" | "cloud";

const VIDEN_DATA: {
  id: VidenCategoryId; label: string; icon: string; color: string; tagline: string;
  know: { text: string; note?: string }[];
  learn: { text: string; note?: string }[];
}[] = [
  {
    id: "netværk", label: "Netværk", icon: "🌐", color: "#60a5fa",
    tagline: "IP, DNS, HTTP, SSH, firewalls og alt imellem",
    know: [
      { text: "IP-adresser og DNS — A, AAAA, CNAME, MX records" },
      { text: "HTTP vs HTTPS — TLS/SSL kryptering" },
      { text: "SSH-forbindelser og nøglebaseret login" },
      { text: "Porte — 80 (HTTP), 443 (HTTPS), 22 (SSH), 3306 (MySQL)" },
      { text: "ping, traceroute, curl til netværksfejlsøgning" },
      { text: "TCP vs UDP — hvad er forskellen?" },
      { text: "VPN — krypterer og tunneler din trafik" },
      { text: "Firewalls — filtrerer trafik baseret på regler" },
    ],
    learn: [
      { text: "Subnetting og CIDR-notation", note: "fx 192.168.1.0/24 = 254 hosts" },
      { text: "Load balancers — round-robin, health checks, sticky sessions" },
      { text: "CDN (Content Delivery Network) — caching på kanten tæt på brugeren" },
      { text: "Reverse proxy vs forward proxy", note: "Nginx, HAProxy" },
      { text: "TLS-certifikater — Let's Encrypt, cert-manager i Kubernetes" },
      { text: "DNS-zoner, SOA-records, propagation delay" },
      { text: "Netværksfejlsøgning med ss, tcpdump, netstat" },
      { text: "BGP og routing på internetniveau" },
    ],
  },
  {
    id: "it-sikkerhed", label: "IT-Sikkerhed", icon: "🔐", color: "#f87171",
    tagline: "OWASP, kryptering, secrets og forsvar mod angreb",
    know: [
      { text: "HTTPS krypterer al trafik med TLS/SSL" },
      { text: "SSH-nøgler er langt sikrere end passwords" },
      { text: "2-faktor autentificering (2FA/MFA)" },
      { text: "Stærke, unikke kodeord + password manager" },
      { text: "Regelmæssige softwareopdateringer lukker kendte sårbarheder" },
      { text: "Genkend phishing og social engineering forsøg" },
      { text: "Firewalls og hvad de beskytter mod" },
    ],
    learn: [
      { text: "OWASP Top 10", note: "XSS, SQL Injection, CSRF, IDOR, Broken Auth..." },
      { text: "JWT-tokens — struktur (header.payload.signature), validering, expiry" },
      { text: "Hashing (bcrypt, Argon2) vs kryptering (AES) — hvornår bruges hvad?" },
      { text: "Secret management", note: "HashiCorp Vault, env vars, aldrig secrets i git" },
      { text: "Security headers", note: "HSTS, CSP, X-Frame-Options, Referrer-Policy" },
      { text: "Penetration testing basics", note: "Nmap, Burp Suite, OWASP ZAP" },
      { text: "Principle of least privilege — giv kun adgang til det nødvendige" },
      { text: "Audit logging og incident response" },
    ],
  },
  {
    id: "cloud", label: "Cloud / Infrastruktur", icon: "☁️", color: "#a78bfa",
    tagline: "Cloud providers, IaC, CI/CD og observability",
    know: [
      { text: "Docker — Dockerfile, images, containers, volumes" },
      { text: "Kubernetes basics — pods, services, deployments, namespaces" },
      { text: "Vercel / Netlify til frontend-deploy" },
      { text: "CI/CD pipelines med GitHub Actions" },
      { text: "Environment variables og secrets til konfiguration" },
      { text: "Git workflows — branches, PRs, merge strategier" },
      { text: "Grundlæggende cloud-koncepter (IaaS, PaaS, SaaS)" },
    ],
    learn: [
      { text: "Infrastructure as Code", note: "Terraform, Pulumi — infrastruktur som kode" },
      { text: "Cloud providers — AWS (EC2, S3, RDS, Lambda), Azure, GCP" },
      { text: "Managed databases vs self-hosted", note: "RDS, Cloud SQL, Aurora" },
      { text: "Autoscaling — HPA i Kubernetes, cloud auto-scaling groups" },
      { text: "Observability — metrics (Prometheus), logs (Loki), tracing (Jaeger)" },
      { text: "GitOps", note: "ArgoCD, Flux — deklarativ infrastruktur fra Git" },
      { text: "Service mesh", note: "Istio, Linkerd — mTLS og traffic management" },
      { text: "Cost optimization — spot instances, reserved capacity, rightsizing" },
    ],
  },
];

const LEARNING_PATH = [
  { step: 1, tag: "🐳 Containers",   title: "Docker + Kubernetes",         detail: "Containerisering er fundamentet i moderne IT-infrastruktur. Du er allerede igang — fortsæt med at bygge og deploye rigtige applikationer." },
  { step: 2, tag: "☁️ Cloud",         title: "Cloud basics (AWS/Azure/GCP)", detail: "Produktionssystemer kører i cloud. Lær de vigtigste services: compute (EC2/VMs), storage (S3/Blob), databaser (RDS) og networking (VPC)." },
  { step: 3, tag: "🔐 Sikkerhed",     title: "IT-Sikkerhed basics",          detail: "OWASP Top 10, JWT, secret management og sikre deployments. Kritisk for at arbejde professionelt med systemer i produktion." },
  { step: 4, tag: "🏗️ IaC",           title: "Infrastructure as Code",       detail: "Terraform eller Pulumi — automatiser oprettelse og vedligeholdelse af infrastruktur som versionsstyret kode." },
  { step: 5, tag: "📊 Observability", title: "Prometheus + Grafana + Loki",  detail: "Forstå hvad der sker i dine systemer i produktion. Metrics, dashboards og log-aggregation er uundværlige til fejlsøgning." },
];

function VidenSection() {
  const [openId, setOpenId] = useState<VidenCategoryId | null>("netværk");
  const [glossFilter, setGlossFilter] = useState<string>("Alle");
  const [glossSearch, setGlossSearch] = useState("");
  const glossTopics = ["Alle", "Grundlæggende", "Protokoller", "Cloud & Docker", "Sikkerhed", "IoT & Avanceret"];
  const topicColors: Record<string, string> = {
    "Grundlæggende":  "#60a5fa",
    "Protokoller":    "#34d399",
    "Cloud & Docker": "#a78bfa",
    "Sikkerhed":      "#f87171",
    "IoT & Avanceret":"#fbbf24",
  };
  const filteredGloss = NETWORKING_KNOWLEDGE.filter(item => {
    const matchTopic = glossFilter === "Alle" || item.topic === glossFilter;
    const q = glossSearch.toLowerCase();
    return matchTopic && (!q || item.term.toLowerCase().includes(q) || item.explanation.toLowerCase().includes(q));
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

      {/* ── Expandable category cards ── */}
      {VIDEN_DATA.map(cat => {
        const isOpen = openId === cat.id;
        return (
          <div key={cat.id} style={{ borderRadius: 14, overflow: "hidden", border: `2px solid ${isOpen ? cat.color + "55" : "#e8e5e1"}`, transition: "border-color 0.2s" }}>
            <button onClick={() => setOpenId(isOpen ? null : cat.id)} style={{
              width: "100%", display: "flex", alignItems: "center", gap: 14,
              padding: "16px 20px", cursor: "pointer", textAlign: "left",
              background: isOpen ? `${cat.color}08` : "#ffffff", border: "none",
              borderBottom: isOpen ? `2px solid ${cat.color}25` : "none",
            }}>
              <span style={{ fontSize: 24 }}>{cat.icon}</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 16, fontWeight: 800, color: isOpen ? cat.color : "#1c1917", margin: "0 0 3px" }}>{cat.label}</p>
                <p style={{ fontSize: 12, color: "#78716c", margin: 0 }}>{cat.tagline}</p>
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <span style={{ fontSize: 11, color: "#a8a29e" }}>{cat.know.length + cat.learn.length} punkter</span>
                <span style={{ fontSize: 14, color: isOpen ? cat.color : "#a8a29e", display: "inline-block", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>▼</span>
              </div>
            </button>
            {isOpen && (
              <div style={{ padding: "20px", background: "#ffffff", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 800, color: "#22c55e", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 10px" }}>✅ Hvad du har styr på</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {cat.know.map((item, i) => (
                      <div key={i} style={{ display: "flex", gap: 10, padding: "8px 12px", borderRadius: 8, background: "rgba(34,197,94,0.05)", border: "1.5px solid rgba(34,197,94,0.15)" }}>
                        <span style={{ color: "#22c55e", flexShrink: 0 }}>✓</span>
                        <div>
                          <p style={{ fontSize: 13, color: "#1c1917", margin: 0, fontWeight: 500 }}>{item.text}</p>
                          {item.note && <p style={{ fontSize: 11, color: "#78716c", margin: "2px 0 0" }}>{item.note}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 800, color: cat.color, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 10px" }}>📚 Hvad du bør lære</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {cat.learn.map((item, i) => (
                      <div key={i} style={{ display: "flex", gap: 10, padding: "8px 12px", borderRadius: 8, background: `${cat.color}06`, border: `1.5px solid ${cat.color}22` }}>
                        <span style={{ color: cat.color, flexShrink: 0 }}>→</span>
                        <div>
                          <p style={{ fontSize: 13, color: "#1c1917", margin: 0, fontWeight: 500 }}>{item.text}</p>
                          {item.note && <p style={{ fontSize: 11, color: "#78716c", margin: "2px 0 0" }}>{item.note}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* ── Learning path ── */}
      <div style={{ borderRadius: 14, overflow: "hidden", border: "2px solid #e8e5e1" }}>
        <div style={{ padding: "14px 20px", background: "rgba(245,158,11,0.08)", borderBottom: "2px solid rgba(245,158,11,0.2)" }}>
          <p style={{ fontSize: 14, fontWeight: 800, color: "#92400e", margin: 0 }}>🎯 Prioriteret læringsrækkefølge til dit job</p>
        </div>
        <div style={{ background: "#ffffff" }}>
          {LEARNING_PATH.map((step, i) => (
            <div key={i} style={{ display: "flex", gap: 16, padding: "14px 20px", borderBottom: i < LEARNING_PATH.length - 1 ? "1px solid #f0ede9" : "none" }}>
              <div style={{ width: 28, height: 28, borderRadius: 99, background: "#f59e0b", color: "#78350f", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, flexShrink: 0 }}>{step.step}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 4 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#1c1917", margin: 0 }}>{step.title}</p>
                  <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 99, background: "rgba(245,158,11,0.12)", color: "#92400e", border: "1px solid rgba(245,158,11,0.25)" }}>{step.tag}</span>
                </div>
                <p style={{ fontSize: 12, color: "#57534e", margin: 0, lineHeight: 1.55 }}>{step.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Networking glossary ── */}
      <div style={{ borderRadius: 14, overflow: "hidden", border: "2px solid #e8e5e1" }}>
        <div style={{ padding: "14px 20px", background: "rgba(96,165,250,0.08)", borderBottom: "2px solid rgba(96,165,250,0.2)" }}>
          <p style={{ fontSize: 14, fontWeight: 800, color: "#1d4ed8", margin: 0 }}>📖 Begrebsleksikon — Netværk & Cloud ({NETWORKING_KNOWLEDGE.length} begreber)</p>
        </div>
        <div style={{ padding: "16px 18px" }}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginBottom: 14 }}>
            <input value={glossSearch} onChange={e => setGlossSearch(e.target.value)} placeholder="Søg begreber..."
              style={{ flex: "1 1 180px", padding: "8px 14px", borderRadius: 10, fontSize: 13, background: "#ffffff", border: "1.5px solid #e8e5e1", color: "var(--text)", outline: "none" }} />
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {glossTopics.map(t => {
                const color = t === "Alle" ? "#f59e0b" : topicColors[t];
                return (
                  <button key={t} onClick={() => setGlossFilter(t)} style={{
                    padding: "6px 12px", borderRadius: 99, fontSize: 12, fontWeight: glossFilter === t ? 700 : 400, cursor: "pointer",
                    background: glossFilter === t ? `${color}18` : "#ffffff",
                    border: `1.5px solid ${glossFilter === t ? `${color}55` : "#e8e5e1"}`,
                    color: glossFilter === t ? color : "#78716c",
                  }}>{t}</button>
                );
              })}
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 10 }}>
            {filteredGloss.map((item, i) => {
              const color = topicColors[item.topic] ?? "#f59e0b";
              return (
                <div key={i} style={{ padding: "16px 18px", borderRadius: 12, background: "#ffffff", border: "2px solid #e8e5e1", borderLeft: `4px solid ${color}` }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 8 }}>
                    <p style={{ fontSize: 15, fontWeight: 800, color: "#1c1917", margin: 0 }}>{item.term}</p>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 99, whiteSpace: "nowrap", flexShrink: 0, background: `${color}15`, color, border: `1.5px solid ${color}35` }}>{item.topic}</span>
                  </div>
                  <p style={{ fontSize: 13, color: "#57534e", margin: 0, lineHeight: 1.65 }}>{item.explanation}</p>
                </div>
              );
            })}
            {filteredGloss.length === 0 && <p style={{ color: "var(--text-3)", fontSize: 13, padding: "20px 0" }}>Ingen begreber matcher søgningen</p>}
          </div>
        </div>
      </div>

    </div>
  );
}

// ─── Visual keyboard ──────────────────────────────────────────────────────────

function Keyboard({ highlighted }: { highlighted: string[] }) {
  const hl = new Set(highlighted.map(k => k.toLowerCase()));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5, userSelect: "none" }}>
      {ROWS.map((row, ri) => (
        <div key={ri} style={{ display: "flex", gap: 5 }}>
          {row.map((key, ki) => {
            const isActive = hl.has(key.label.toLowerCase());
            return (
              <div
                key={ki}
                style={{
                  flex: key.w ?? 1,
                  height: 38,
                  borderRadius: 7,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: key.label.length > 4 ? 9 : 11,
                  fontWeight: isActive ? 800 : 500,
                  transition: "all 0.15s",
                  background: isActive
                    ? "linear-gradient(135deg, #f59e0b, #fbbf24)"
                    : "#ffffff",
                  border: isActive
                    ? "2px solid #f59e0b"
                    : "1.5px solid #e8e5e1",
                  color: isActive ? "#78350f" : "#78716c",
                  boxShadow: isActive
                    ? "0 0 14px rgba(245,158,11,0.35), 0 2px 4px rgba(0,0,0,0.06)"
                    : "0 1px 3px rgba(0,0,0,0.05)",
                }}
              >
                {key.display ?? key.label}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// ─── Key badge ────────────────────────────────────────────────────────────────

function KeyBadge({ k, active }: { k: string; active?: boolean }) {
  return (
    <span style={{
      padding: "3px 8px", borderRadius: 6, fontSize: 10, fontWeight: 700,
      background: active ? "#fffbeb" : "#f5f4f2",
      border: `1.5px solid ${active ? "rgba(245,158,11,0.5)" : "#e8e5e1"}`,
      color: active ? "#92400e" : "#78716c",
      whiteSpace: "nowrap",
      boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
    }}>{k}</span>
  );
}

// ─── Command section (Linux / PowerShell) ─────────────────────────────────────

// ─── ExtraSection (flags + examples) ─────────────────────────────────────────

function ExtraSection({ accentColor, flags, examples }: {
  accentColor: string;
  flags: { flag: string; desc: string }[];
  examples: { cmd: string; desc: string }[];
}) {
  return (
    <>
      {/* Flags */}
      <div style={{ borderRadius: 14, overflow: "hidden", border: "2px solid #e8e5e1" }}>
        <div style={{
          padding: "10px 18px",
          background: `${accentColor}12`,
          borderBottom: `2px solid ${accentColor}30`,
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <span style={{ fontSize: 13, fontWeight: 800, color: accentColor }}>🏳️ Flag & options forklaret</span>
          <span style={{ fontSize: 11, color: "#a8a29e", marginLeft: "auto" }}>{flags.length} flag</span>
        </div>
        <div style={{ padding: "16px 18px", background: "#ffffff", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 8 }}>
          {flags.map(f => (
            <div key={f.flag} style={{
              padding: "10px 14px", borderRadius: 10,
              background: "#fafaf9", border: `1.5px solid ${accentColor}25`,
              borderLeft: `3px solid ${accentColor}`,
            }}>
              <code style={{ display: "block", fontSize: 12, fontWeight: 700, color: accentColor, fontFamily: "monospace", marginBottom: 5 }}>{f.flag}</code>
              <p style={{ fontSize: 12, color: "#57534e", margin: 0, lineHeight: 1.5 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Examples */}
      <div style={{ borderRadius: 14, overflow: "hidden", border: "2px solid #e8e5e1" }}>
        <div style={{
          padding: "10px 18px",
          background: "#fffbeb",
          borderBottom: "2px solid rgba(251,191,36,0.3)",
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <span style={{ fontSize: 13, fontWeight: 800, color: "#92400e" }}>💡 Real-world eksempler</span>
          <span style={{ fontSize: 11, color: "#a8a29e", marginLeft: "auto" }}>{examples.length} eksempler</span>
        </div>
        <div style={{ background: "#ffffff" }}>
          {examples.map((ex, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "flex-start", gap: 14,
              padding: "13px 18px",
              borderBottom: i < examples.length - 1 ? "1px solid #f0ede9" : "none",
            }}>
              <div style={{
                width: 22, height: 22, borderRadius: 99, flexShrink: 0,
                background: "#fbbf24", color: "#78350f",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 10, fontWeight: 800, marginTop: 3,
              }}>{i + 1}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <code style={{ display: "block", fontSize: 12, color: "#5b42f3", fontFamily: "monospace", wordBreak: "break-all", marginBottom: 4, fontWeight: 600 }}>{ex.cmd}</code>
                <p style={{ fontSize: 12, color: "#78716c", margin: 0, lineHeight: 1.5 }}>{ex.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// ─── CommandSection ───────────────────────────────────────────────────────────

function CommandSection({ commands, accentColor }: { commands: Command[]; accentColor: string }) {
  const [topic, setTopic]   = useState<string>("Alle");
  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const topics = useMemo(() => {
    const s = new Set(commands.map(c => c.topic));
    return ["Alle", ...Array.from(s)];
  }, [commands]);

  const filtered = useMemo(() => {
    return commands.filter(c => {
      const matchTopic  = topic === "Alle" || c.topic === topic;
      const q = search.toLowerCase();
      const matchSearch = !q || c.label.toLowerCase().includes(q) || c.command.toLowerCase().includes(q) || c.description.toLowerCase().includes(q);
      return matchTopic && matchSearch;
    });
  }, [commands, topic, search]);

  const grouped = useMemo(() => {
    const g: Record<string, Command[]> = {};
    filtered.forEach(c => { if (!g[c.topic]) g[c.topic] = []; g[c.topic].push(c); });
    return g;
  }, [filtered]);

  function copy(cmd: string) {
    navigator.clipboard.writeText(cmd).catch(() => {});
    setCopied(cmd);
    setTimeout(() => setCopied(null), 1500);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Search + topic filter */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Søg kommandoer..."
          style={{
            flex: "1 1 180px",
            padding: "8px 14px", borderRadius: 10, fontSize: 13,
            background: "#ffffff", border: "1.5px solid #e8e5e1",
            color: "var(--text)", outline: "none",
          }}
        />
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {topics.map(t => (
            <button key={t} onClick={() => setTopic(t)} style={{
              padding: "6px 12px", borderRadius: 99, fontSize: 12, fontWeight: topic === t ? 700 : 400,
              cursor: "pointer",
              background: topic === t ? `${accentColor}18` : "#ffffff",
              border: `1.5px solid ${topic === t ? `${accentColor}55` : "#e8e5e1"}`,
              color: topic === t ? accentColor : "#78716c",
            }}>{t}</button>
          ))}
        </div>
      </div>

      {/* Commands grouped by topic */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {filtered.length === 0 && (
          <p style={{ color: "var(--text-3)", fontSize: 13, padding: "20px 0", textAlign: "center" }}>
            Ingen kommandoer matcher søgningen
          </p>
        )}
        {Object.entries(grouped).map(([topicName, cmds]) => (
          <div key={topicName} style={{
            borderRadius: 14, overflow: "hidden",
            border: "2px solid #e8e5e1",
            background: "#ffffff",
          }}>
            {/* Topic header */}
            <div style={{
              padding: "10px 16px",
              background: `${accentColor}10`,
              borderBottom: `2px solid ${accentColor}25`,
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <div style={{ width: 8, height: 8, borderRadius: 99, background: accentColor, flexShrink: 0 }} />
              <span style={{ fontSize: 12, fontWeight: 800, color: accentColor, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                {topicName}
              </span>
              <span style={{ fontSize: 11, color: "#a8a29e", marginLeft: "auto" }}>
                {cmds.length} kommandoer — klik for at kopiere
              </span>
            </div>
            {/* Command rows */}
            <div style={{ display: "flex", flexDirection: "column" }}>
              {cmds.map((cmd, i) => {
                const isCopied = copied === cmd.command;
                return (
                  <button key={i} onClick={() => copy(cmd.command)} style={{
                    display: "flex", alignItems: "center", gap: 14,
                    padding: "11px 16px", cursor: "pointer", textAlign: "left",
                    background: isCopied ? `${accentColor}08` : "#ffffff",
                    border: "none",
                    borderBottom: i < cmds.length - 1 ? "1px solid #f0ede9" : "none",
                    borderLeft: `3px solid ${isCopied ? accentColor : "transparent"}`,
                    transition: "all 0.1s",
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "#1c1917", margin: "0 0 2px" }}>{cmd.label}</p>
                      <p style={{ fontSize: 11, color: "#a8a29e", margin: 0, lineHeight: 1.4 }}>{cmd.description}</p>
                    </div>
                    <code style={{
                      fontSize: 11, fontFamily: "monospace",
                      padding: "5px 12px", borderRadius: 7,
                      background: isCopied ? `${accentColor}15` : "#f5f4f2",
                      border: `1.5px solid ${isCopied ? `${accentColor}45` : "#e8e5e1"}`,
                      color: isCopied ? accentColor : "#57534e",
                      whiteSpace: "nowrap", maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis",
                      flexShrink: 0, transition: "all 0.1s",
                    }}>{isCopied ? "✓ Kopieret!" : cmd.command}</code>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function KeyboardTab() {
  const [section,  setSection]  = useState<SectionId>("shortcuts");
  const [selected, setSelected] = useState<Shortcut | null>(null);
  const highlighted = selected?.keys ?? [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--text)", margin: "0 0 6px" }}>Genveje & Kommandoer</h1>
        <p style={{ fontSize: 15, color: "var(--text-2)", margin: 0 }}>Tastatur-genveje, Linux-kommandoer og PowerShell</p>
      </div>

      {/* Section selector */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {([
          { id: "shortcuts"  as SectionId, label: "⌨️ Genvejstaster" },
          { id: "linux"      as SectionId, label: "🐧 Linux" },
          { id: "powershell" as SectionId, label: "🟦 PowerShell" },
          { id: "kubernetes" as SectionId, label: "☸️ Kubernetes" },
          { id: "docker"     as SectionId, label: "🐳 Docker" },
          { id: "git"        as SectionId, label: "🔀 Git" },
          { id: "viden"      as SectionId, label: "🌐 Viden" },
        ]).map(s => (
          <button
            key={s.id}
            onClick={() => { setSection(s.id); setSelected(null); }}
            style={{
              padding: "8px 18px", borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: section === s.id ? 700 : 500,
              background: section === s.id ? "#fffbeb" : "#ffffff",
              border: `2px solid ${section === s.id ? "rgba(245,158,11,0.55)" : "#e8e5e1"}`,
              color: section === s.id ? "#92400e" : "#57534e",
            }}
          >{s.label}</button>
        ))}
      </div>

      {/* ── Shortcuts section ───────────────────────────────────────────────── */}
      {section === "shortcuts" && (
        <>
          {/* Keyboard */}
          <div style={{ borderRadius: 14, border: "2px solid #e8e5e1", background: "#f9f8f6", padding: "20px 22px" }}>
            <Keyboard highlighted={highlighted} />
          </div>

          {/* Shortcut grid */}
          <div className="uv-card-1">
            <div className="uv-card-1-inner" style={{ padding: "16px 18px" }}>
              <p style={{ fontSize: 13, color: "var(--text-3)", margin: "0 0 12px" }}>
                {GENERAL_SHORTCUTS.length} generelle genveje — klik for at fremhæve på tastaturet
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 6 }}>
                {GENERAL_SHORTCUTS.map((s, i) => {
                  const isSelected = selected?.label === s.label;
                  return (
                    <button
                      key={i}
                      onClick={() => setSelected(isSelected ? null : s)}
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10,
                        padding: "10px 14px", borderRadius: 10, cursor: "pointer", textAlign: "left",
                        background: isSelected ? "rgba(91,66,243,0.15)" : "#ffffff",
                        border: `1.5px solid ${isSelected ? "rgba(91,66,243,0.45)" : "#e8e5e1"}`,
                        transition: "all 0.15s",
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: isSelected ? "#a78bfa" : "#1c1917", margin: "0 0 2px" }}>
                          {s.label}
                        </p>
                        <p style={{ fontSize: 11, color: "var(--text-3)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {s.description}
                        </p>
                      </div>
                      <div style={{ display: "flex", gap: 3, alignItems: "center", flexShrink: 0 }}>
                        {s.keys.map((k, ki) => (
                          <span key={ki} style={{ display: "flex", alignItems: "center", gap: 3 }}>
                            <KeyBadge k={k} active={isSelected} />
                            {ki < s.keys.length - 1 && <span style={{ fontSize: 9, color: "var(--text-3)" }}>+</span>}
                          </span>
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Linux section ───────────────────────────────────────────────────── */}
      {section === "linux" && (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderRadius: 12, background: "rgba(132,204,22,0.08)", border: "1.5px solid rgba(132,204,22,0.2)" }}>
            <span style={{ fontSize: 20 }}>🐧</span>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: "#a3e635", margin: 0 }}>Linux / Bash kommandoer</p>
              <p style={{ fontSize: 12, color: "var(--text-3)", margin: 0 }}>{LINUX_COMMANDS.length} kommandoer + flag-reference og eksempler</p>
            </div>
          </div>
          <ExtraSection accentColor="#a3e635" flags={[
            { flag: "-r / -R",    desc: "Rekursiv — gælder undermapper (cp -r, rm -r, chmod -R)" },
            { flag: "-f",         desc: "Force — ingen bekræftelse, overskriv uden spørgsmål" },
            { flag: "-v",         desc: "Verbose — vis præcis hvad der sker trin for trin" },
            { flag: "-i",         desc: "Interaktiv — bekræft hver handling / case-insensitiv (grep -i)" },
            { flag: "-a",         desc: "All — inkludér skjulte filer (ls -a)" },
            { flag: "-l",         desc: "Long format — vis rettigheder, ejer og størrelse (ls -l)" },
            { flag: "-h",         desc: "Human-readable — vis størrelser som KB/MB/GB (ls -lh, du -h)" },
            { flag: "-n <antal>", desc: "Antal linjer — begræns output (head -n 20, tail -n 50)" },
            { flag: "|",          desc: "Pipe — send output fra én kommando som input til den næste" },
            { flag: ">",          desc: "Redirect — skriv output til fil (overskriv eksisterende)" },
            { flag: ">>",         desc: "Append — tilføj output til eksisterende fil" },
            { flag: "&&",         desc: "AND — kør næste kommando kun hvis den forrige lykkedes" },
            { flag: "||",         desc: "OR — kør næste kommando kun hvis den forrige fejlede" },
          ]} examples={[
            { cmd: "man ls",                                               desc: "Åbn manualen for 'ls' — tryk Q for at lukke. Virker på næsten alle kommandoer: man grep, man chmod..." },
            { cmd: "grep 'hej' fil.txt",                                   desc: "Søg efter ordet 'hej' i fil.txt — viser alle linjer der indeholder det" },
            { cmd: "grep -i 'hej' fil.txt",                                desc: "Samme, men case-insensitiv — finder 'Hej', 'HEJ', 'hej' osv." },
            { cmd: "grep -r 'TODO' ./src",                                 desc: "Søg rekursivt efter 'TODO' i alle filer under ./src" },
            { cmd: "ls -la",                                               desc: "Vis alle filer inkl. skjulte (.fil) med rettigheder og størrelse" },
            { cmd: "mkdir mit-projekt && cd mit-projekt",                  desc: "Opret en ny mappe og gå ind i den" },
            { cmd: "cat fil.txt",                                          desc: "Udskriv indholdet af fil.txt i terminalen" },
            { cmd: "cat fil.txt | grep 'fejl'",                            desc: "Udskriv fil.txt og filtrer kun linjer med 'fejl' (pipe-eksempel)" },
          ]} />
          <CommandSection commands={LINUX_COMMANDS} accentColor="#a3e635" />
        </>
      )}

      {/* ── PowerShell section ──────────────────────────────────────────────── */}
      {section === "powershell" && (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderRadius: 12, background: "rgba(56,189,248,0.08)", border: "1.5px solid rgba(56,189,248,0.2)" }}>
            <span style={{ fontSize: 20 }}>🟦</span>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: "#38bdf8", margin: 0 }}>PowerShell kommandoer</p>
              <p style={{ fontSize: 12, color: "var(--text-3)", margin: 0 }}>{POWERSHELL_COMMANDS.length} kommandoer + flag-reference og eksempler</p>
            </div>
          </div>
          <ExtraSection accentColor="#38bdf8" flags={[
            { flag: "-Recurse",                    desc: "Rekursiv — gælder alle undermapper (Get-ChildItem -Recurse)" },
            { flag: "-Force",                      desc: "Tving handling — inkl. skjulte/read-only filer" },
            { flag: "-Verbose",                    desc: "Vis detaljeret output for hvert trin" },
            { flag: "-WhatIf",                     desc: "Simulér kommandoen uden at udføre den — se hvad der ville ske" },
            { flag: "-ErrorAction SilentlyContinue", desc: "Ignorér fejl og fortsæt scriptet" },
            { flag: "-Filter '*.txt'",             desc: "Filtrer output — hurtigere end Where-Object til filnavne" },
            { flag: "-ComputerName <navn>",        desc: "Udfør kommando på en fjerncomputer" },
            { flag: "|",                           desc: "Pipe — sender .NET-objekter (ikke bare tekst) videre" },
            { flag: ">",                           desc: "Redirect output til fil (overskriver)" },
            { flag: "-Path",                       desc: "Angiv sti til fil eller mappe" },
          ]} examples={[
            { cmd: "Get-ChildItem -Recurse -Filter '*.log'",                                       desc: "Find alle .log-filer rekursivt fra aktuel mappe" },
            { cmd: "Get-Process | Where-Object { $_.CPU -gt 100 } | Sort-Object CPU -Descending",  desc: "Find CPU-intensive processer sorteret fra højest" },
            { cmd: "Get-Content app.log | Select-String 'ERROR'",                                  desc: "Søg efter 'ERROR' i en logfil" },
            { cmd: "New-Item -ItemType Directory -Path 'C:\\ny-mappe' -Force",                     desc: "Opret ny mappe (fejl ikke hvis den eksisterer)" },
            { cmd: "Get-Service | Where-Object { $_.Status -eq 'Stopped' }",                       desc: "Vis alle stoppede Windows-services" },
            { cmd: "Set-ExecutionPolicy RemoteSigned -Scope CurrentUser",                          desc: "Tillad lokale scripts — kræves én gang pr. bruger" },
            { cmd: "Invoke-WebRequest -Uri 'https://example.com' -OutFile 'side.html'",            desc: "Download en webside og gem den lokalt" },
            { cmd: "Get-EventLog -LogName Application -Newest 50 -EntryType Error",                desc: "Vis de 50 seneste fejl i Windows Event Log" },
          ]} />
          <CommandSection commands={POWERSHELL_COMMANDS} accentColor="#38bdf8" />
        </>
      )}

      {/* ── Kubernetes section ───────────────────────────────────────────────── */}
      {section === "kubernetes" && (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderRadius: 12, background: "rgba(50,159,230,0.08)", border: "1.5px solid rgba(50,159,230,0.25)" }}>
            <span style={{ fontSize: 20 }}>☸️</span>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: "#5ba4e5", margin: 0 }}>Kubernetes (kubectl)</p>
              <p style={{ fontSize: 12, color: "var(--text-3)", margin: 0 }}>{KUBERNETES_COMMANDS.length} kommandoer + flag-reference og eksempler</p>
            </div>
          </div>
          <ExtraSection accentColor="#5ba4e5" flags={[
            { flag: "-n <namespace>",      desc: "Specificér namespace — udelades det bruges 'default'" },
            { flag: "-A / --all-namespaces", desc: "Vis ressourcer på tværs af alle namespaces" },
            { flag: "-o wide",             desc: "Ekstra kolonner: IP-adresse, node-navn m.m." },
            { flag: "-o yaml",             desc: "Output ressourcedefinition som YAML" },
            { flag: "-o json",             desc: "Output ressourcedefinition som JSON" },
            { flag: "-l <label=value>",    desc: "Filtrer på label (app=nginx, env=prod)" },
            { flag: "-f <fil.yaml>",       desc: "Anvend/slet ressource fra YAML-fil" },
            { flag: "--dry-run=client",    desc: "Simulér — vis hvad der ville blive oprettet/ændret" },
            { flag: "-w / --watch",        desc: "Hold øje med ændringer i realtid" },
            { flag: "--tail=<n>",          desc: "Vis kun de seneste n linjer af logs" },
            { flag: "-f (logs)",           desc: "Stream logs i realtid (follow)" },
            { flag: "--force",             desc: "Tving sletning (bypasser graceful termination)" },
          ]} examples={[
            { cmd: "kubectl get pods",                                             desc: "Se alle pods der kører — STATUS viser om de er Running, Pending eller fejlet" },
            { cmd: "kubectl get all",                                              desc: "Vis alt: pods, services, deployments og replicasets på én gang" },
            { cmd: "kubectl apply -f deployment.yaml",                             desc: "Anvend en YAML-fil — opretter ressourcen hvis den ikke findes, opdaterer hvis den gør" },
            { cmd: "kubectl describe pod <pod-navn>",                              desc: "Se detaljeret info om en pod: events, image, status og fejlbeskeder" },
            { cmd: "kubectl logs <pod-navn>",                                      desc: "Vis logoutput fra en pod — tilsæt -f for at følge live" },
            { cmd: "kubectl get pods -w",                                          desc: "Følg pods i realtid — se status ændre sig fra Pending → Running" },
            { cmd: "kubectl delete -f deployment.yaml",                            desc: "Slet de ressourcer der er defineret i YAML-filen" },
            { cmd: "kubectl get pods -o wide",                                     desc: "Vis pods med ekstra info: hvilken node de kører på og deres IP-adresse" },
          ]} />
          {/* ── Kubernetes YAML eksempler ──────────────────────────────────── */}
          <div className="uv-card-1">
            <div className="uv-card-1-inner" style={{ padding: "18px 20px" }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#5ba4e5", margin: "0 0 14px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                📄 Standard Kubernetes YAML-filer
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 12 }}>
                {([
                  {
                    title: "Pod — simpel definition",
                    emoji: "🫙",
                    lines: [
                      { t: "comment", v: "# pod.yaml" },
                      { t: "key", k: "apiVersion", v: "v1" },
                      { t: "key", k: "kind",       v: "Pod" },
                      { t: "key", k: "metadata",   v: "" },
                      { t: "indent", k: "  name",  v: "nginx-pod" },
                      { t: "key", k: "spec",        v: "" },
                      { t: "indent", k: "  containers", v: "" },
                      { t: "indent", k: "    - name",   v: "nginx" },
                      { t: "indent", k: "      image",  v: "nginx:1.25" },
                      { t: "indent", k: "      ports",  v: "" },
                      { t: "indent", k: "        - containerPort", v: "80" },
                    ],
                  },
                  {
                    title: "Deployment — 3 replicas",
                    emoji: "🚀",
                    lines: [
                      { t: "comment", v: "# deployment.yaml" },
                      { t: "key", k: "apiVersion", v: "apps/v1" },
                      { t: "key", k: "kind",       v: "Deployment" },
                      { t: "key", k: "metadata",   v: "" },
                      { t: "indent", k: "  name",  v: "nginx-deploy" },
                      { t: "key", k: "spec",        v: "" },
                      { t: "indent", k: "  replicas", v: "3" },
                      { t: "indent", k: "  selector", v: "" },
                      { t: "indent", k: "    matchLabels", v: "" },
                      { t: "indent", k: "      app", v: "nginx" },
                      { t: "indent", k: "  template", v: "" },
                      { t: "indent", k: "    metadata", v: "" },
                      { t: "indent", k: "      labels", v: "" },
                      { t: "indent", k: "        app", v: "nginx" },
                      { t: "indent", k: "    spec", v: "" },
                      { t: "indent", k: "      containers", v: "" },
                      { t: "indent", k: "        - name",  v: "nginx" },
                      { t: "indent", k: "          image", v: "nginx:1.25" },
                      { t: "indent", k: "          ports", v: "" },
                      { t: "indent", k: "            - containerPort", v: "80" },
                    ],
                  },
                  {
                    title: "Service — eksponér deployment",
                    emoji: "🌐",
                    lines: [
                      { t: "comment", v: "# service.yaml" },
                      { t: "key", k: "apiVersion", v: "v1" },
                      { t: "key", k: "kind",       v: "Service" },
                      { t: "key", k: "metadata",   v: "" },
                      { t: "indent", k: "  name",  v: "nginx-svc" },
                      { t: "key", k: "spec",        v: "" },
                      { t: "indent", k: "  type",   v: "LoadBalancer" },
                      { t: "indent", k: "  selector", v: "" },
                      { t: "indent", k: "    app",  v: "nginx" },
                      { t: "indent", k: "  ports",  v: "" },
                      { t: "indent", k: "    - port",       v: "80" },
                      { t: "indent", k: "      targetPort", v: "80" },
                      { t: "indent", k: "      protocol",   v: "TCP" },
                    ],
                  },
                  {
                    title: "HPA — auto-skalering på CPU",
                    emoji: "📈",
                    lines: [
                      { t: "comment", v: "# hpa.yaml" },
                      { t: "key", k: "apiVersion", v: "autoscaling/v2" },
                      { t: "key", k: "kind",       v: "HorizontalPodAutoscaler" },
                      { t: "key", k: "metadata",   v: "" },
                      { t: "indent", k: "  name",  v: "nginx-hpa" },
                      { t: "key", k: "spec",        v: "" },
                      { t: "indent", k: "  scaleTargetRef", v: "" },
                      { t: "indent", k: "    apiVersion", v: "apps/v1" },
                      { t: "indent", k: "    kind",       v: "Deployment" },
                      { t: "indent", k: "    name",       v: "nginx-deploy" },
                      { t: "indent", k: "  minReplicas",  v: "2" },
                      { t: "indent", k: "  maxReplicas",  v: "10" },
                      { t: "indent", k: "  metrics",      v: "" },
                      { t: "indent", k: "    - type",     v: "Resource" },
                      { t: "indent", k: "      resource", v: "" },
                      { t: "indent", k: "        name",   v: "cpu" },
                      { t: "indent", k: "        target", v: "" },
                      { t: "indent", k: "          type", v: "Utilization" },
                      { t: "indent", k: "          averageUtilization", v: "70" },
                    ],
                  },
                  {
                    title: "ConfigMap — miljøkonfiguration",
                    emoji: "⚙️",
                    lines: [
                      { t: "comment", v: "# configmap.yaml" },
                      { t: "key", k: "apiVersion", v: "v1" },
                      { t: "key", k: "kind",       v: "ConfigMap" },
                      { t: "key", k: "metadata",   v: "" },
                      { t: "indent", k: "  name",  v: "app-config" },
                      { t: "key", k: "data",        v: "" },
                      { t: "indent", k: "  NODE_ENV",   v: "production" },
                      { t: "indent", k: "  APP_PORT",   v: '"3000"' },
                      { t: "indent", k: "  LOG_LEVEL",  v: "info" },
                      { t: "comment", v: "# Brug i pod: envFrom → configMapRef" },
                    ],
                  },
                  {
                    title: "Secret — følsomme data (base64)",
                    emoji: "🔐",
                    lines: [
                      { t: "comment", v: "# secret.yaml" },
                      { t: "key", k: "apiVersion", v: "v1" },
                      { t: "key", k: "kind",       v: "Secret" },
                      { t: "key", k: "metadata",   v: "" },
                      { t: "indent", k: "  name",  v: "app-secret" },
                      { t: "key", k: "type",        v: "Opaque" },
                      { t: "key", k: "data",        v: "" },
                      { t: "comment", v: "# Værdier er base64-kodede" },
                      { t: "indent", k: "  DB_USER",     v: "YWRtaW4=" },
                      { t: "indent", k: "  DB_PASSWORD", v: "c2VjcmV0MTIz" },
                      { t: "comment", v: "# echo -n 'admin' | base64" },
                    ],
                  },
                ] as { title: string; emoji: string; lines: { t: string; k?: string; v: string }[] }[]).map(ex => (
                  <div key={ex.title} style={{ borderRadius: 10, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <div style={{ padding: "8px 14px", background: "rgba(91,164,229,0.12)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#1c1917" }}>{ex.emoji} {ex.title}</span>
                    </div>
                    <div style={{ padding: "12px 14px", background: "rgba(0,0,0,0.25)", fontFamily: "monospace", fontSize: 12, lineHeight: 1.8 }}>
                      {ex.lines.map((l, i) =>
                        l.t === "comment"
                          ? <div key={i} style={{ color: "#57534e" }}>{l.v}</div>
                          : <div key={i}>
                              <span style={{ color: "#5ba4e5" }}>{l.k}:</span>
                              {l.v ? <span style={{ color: "#d4d0ca" }}>{" "}{l.v}</span> : null}
                            </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <CommandSection commands={KUBERNETES_COMMANDS} accentColor="#5ba4e5" />
        </>
      )}

      {/* ── Docker section ───────────────────────────────────────────────────── */}
      {section === "docker" && (
        <>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderRadius: 12, background: "rgba(30,160,210,0.08)", border: "1.5px solid rgba(30,160,210,0.25)" }}>
            <span style={{ fontSize: 20 }}>🐳</span>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: "#1ea0d2", margin: 0 }}>Docker kommandoer</p>
              <p style={{ fontSize: 12, color: "var(--text-3)", margin: 0 }}>{DOCKER_COMMANDS.length} kommandoer + flag-reference, Dockerfile-eksempler og real-world kommandoer</p>
            </div>
          </div>

          {/* ── Flag reference ─────────────────────────────────────────────── */}
          <div className="uv-card-1">
            <div className="uv-card-1-inner" style={{ padding: "18px 20px" }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#1ea0d2", margin: "0 0 14px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                🏳️ Flag & options forklaret
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 8 }}>
                {([
                  { flag: "-d",               full: "--detach",        desc: "Kør i baggrunden — overtager ikke terminalen" },
                  { flag: "-p 8080:80",        full: "--publish",       desc: "Bind lokal port 8080 til containerens port 80" },
                  { flag: "-it",               full: "-i -t",           desc: "-i holder stdin åben, -t giver pseudo-terminal (bruges med exec/run bash)" },
                  { flag: "--name <navn>",      full: "--name",          desc: "Giv containeren et læsbart navn i stedet for random ID" },
                  { flag: "-v /lokal:/sti",     full: "--volume",        desc: "Montér lokal mappe som volumen inde i containeren" },
                  { flag: "-e KEY=VAL",         full: "--env",           desc: "Send én miljøvariabel til containeren" },
                  { flag: "--env-file .env",    full: "--env-file",      desc: "Indlæs alle miljøvariabler fra en .env-fil" },
                  { flag: "--rm",              full: "--rm",            desc: "Slet containeren automatisk når den stopper" },
                  { flag: "--restart always",   full: "--restart",       desc: "Genstart containeren automatisk ved nedbrud (always / unless-stopped / on-failure)" },
                  { flag: "--network <net>",    full: "--network",       desc: "Tilslut containeren til et specifikt Docker-netværk" },
                  { flag: "-t <navn:tag>",      full: "--tag (build)",   desc: "Navngiv og tag et image ved docker build" },
                  { flag: "--no-cache",         full: "--no-cache",      desc: "Byg image helt forfra uden at bruge build-cache" },
                ] as { flag: string; full: string; desc: string }[]).map(f => (
                  <div key={f.flag} style={{ padding: "10px 13px", borderRadius: 9, background: "rgba(30,160,210,0.05)", border: "1px solid rgba(30,160,210,0.15)" }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 4 }}>
                      <code style={{ fontSize: 13, fontWeight: 700, color: "#1ea0d2", fontFamily: "monospace", background: "rgba(30,160,210,0.12)", padding: "1px 7px", borderRadius: 5 }}>{f.flag}</code>
                      <span style={{ fontSize: 11, color: "var(--text-3)", fontFamily: "monospace" }}>{f.full}</span>
                    </div>
                    <p style={{ fontSize: 12, color: "var(--text-2)", margin: 0, lineHeight: 1.5 }}>{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Dockerfile eksempler ───────────────────────────────────────── */}
          <div className="uv-card-1">
            <div className="uv-card-1-inner" style={{ padding: "18px 20px" }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#1ea0d2", margin: "0 0 16px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                📄 Dockerfile eksempler
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 14 }}>
                {([
                  {
                    title: "Node.js app",
                    emoji: "🟩",
                    lines: [
                      { t: "comment", v: "# Brug officielt Node.js base-image" },
                      { t: "instr",   v: "FROM",    arg: "node:18-alpine" },
                      { t: "comment", v: "# Sæt arbejdsmappe i containeren" },
                      { t: "instr",   v: "WORKDIR", arg: "/app" },
                      { t: "comment", v: "# Kopiér package.json og installér afhængigheder" },
                      { t: "instr",   v: "COPY",    arg: "package.json /app/" },
                      { t: "instr",   v: "RUN",     arg: "npm install" },
                      { t: "comment", v: "# Kopiér resten af kildekoden" },
                      { t: "instr",   v: "COPY",    arg: "src /app/" },
                      { t: "comment", v: "# Dokumentér at appen lytter på port 3000" },
                      { t: "instr",   v: "EXPOSE",  arg: "3000" },
                      { t: "comment", v: "# Startkommando" },
                      { t: "instr",   v: "CMD",     arg: '["node", "server.js"]' },
                    ],
                  },
                  {
                    title: "Python app",
                    emoji: "🐍",
                    lines: [
                      { t: "comment", v: "# Slank Python 3.11 base" },
                      { t: "instr",   v: "FROM",    arg: "python:3.11-slim" },
                      { t: "instr",   v: "WORKDIR", arg: "/app" },
                      { t: "comment", v: "# Installér afhængigheder" },
                      { t: "instr",   v: "COPY",    arg: "requirements.txt /app/" },
                      { t: "instr",   v: "RUN",     arg: "pip install -r requirements.txt" },
                      { t: "comment", v: "# Kopiér kildekod" },
                      { t: "instr",   v: "COPY",    arg: ". /app" },
                      { t: "instr",   v: "EXPOSE",  arg: "8000" },
                      { t: "instr",   v: "CMD",     arg: '["python", "app.py"]' },
                    ],
                  },
                  {
                    title: "Med ARG + ENV + USER",
                    emoji: "⚙️",
                    lines: [
                      { t: "comment", v: "# ARG kan sættes ved build-time" },
                      { t: "instr",   v: "ARG",     arg: "VERSION=latest" },
                      { t: "instr",   v: "FROM",    arg: "node:${VERSION}-alpine" },
                      { t: "comment", v: "# ENV er tilgængeligt runtime" },
                      { t: "instr",   v: "ENV",     arg: 'NODE_ENV="production"' },
                      { t: "instr",   v: "WORKDIR", arg: "/app" },
                      { t: "instr",   v: "COPY",    arg: ". /app" },
                      { t: "instr",   v: "RUN",     arg: "npm ci --only=production" },
                      { t: "comment", v: "# Kør som ikke-root bruger" },
                      { t: "instr",   v: "USER",    arg: "node" },
                      { t: "instr",   v: "EXPOSE",  arg: "3000" },
                      { t: "instr",   v: "ENTRYPOINT", arg: '["node", "index.js"]' },
                    ],
                  },
                ] as { title: string; emoji: string; lines: { t: string; v: string; arg?: string }[] }[]).map(ex => (
                  <div key={ex.title} style={{ borderRadius: 10, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <div style={{ padding: "8px 14px", background: "rgba(30,160,210,0.12)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#1c1917" }}>{ex.emoji} {ex.title}</span>
                    </div>
                    <div style={{ padding: "12px 14px", background: "rgba(0,0,0,0.25)", fontFamily: "monospace", fontSize: 12, lineHeight: 1.8 }}>
                      {ex.lines.map((l, i) =>
                        l.t === "comment"
                          ? <div key={i} style={{ color: "#57534e" }}>{l.v}</div>
                          : <div key={i}>
                              <span style={{ color: "#1ea0d2", fontWeight: 700 }}>{l.v}</span>
                              {" "}
                              <span style={{ color: "#d4d0ca" }}>{l.arg}</span>
                            </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Real-world eksempler ───────────────────────────────────────── */}
          <div className="uv-card-1">
            <div className="uv-card-1-inner" style={{ padding: "18px 20px" }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#1ea0d2", margin: "0 0 14px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                💡 Real-world eksempler
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {([
                  { cmd: "docker run --name web -d -p 8080:80 nginx:latest",                       desc: "Start nginx i baggrunden, tilgængelig på localhost:8080" },
                  { cmd: "docker run -it ubuntu /bin/bash",                                        desc: "Åbn interaktiv bash-shell i en Ubuntu container" },
                  { cmd: "docker run --rm -it python:3.11 python",                                 desc: "Kør Python REPL — containeren slettes automatisk bagefter" },
                  { cmd: "docker build -t my-app:v1.0 .",                                          desc: "Byg image fra Dockerfile i aktuel mappe med tag v1.0" },
                  { cmd: "docker run -d --name api -p 3000:3000 --env-file .env my-app:v1.0",      desc: "Start din app med .env-fil og navngiven container" },
                  { cmd: "docker exec -it web /bin/bash",                                          desc: "Hop ind i den kørende nginx-container med bash" },
                  { cmd: "docker stop web && docker rm web",                                       desc: "Stop og slet containeren 'web'" },
                  { cmd: "docker build -t my-app:v1.0 . && docker run -d -p 3000:3000 my-app:v1.0", desc: "Byg og kør i én linje" },
                ] as { cmd: string; desc: string }[]).map((ex, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "10px 14px", borderRadius: 9, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <span style={{ fontSize: 11, color: "var(--text-3)", fontWeight: 700, flexShrink: 0, marginTop: 2, minWidth: 16, textAlign: "right" }}>{i + 1}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <code style={{ display: "block", fontSize: 12, color: "#1ea0d2", fontFamily: "monospace", wordBreak: "break-all", marginBottom: 3 }}>{ex.cmd}</code>
                      <p style={{ fontSize: 12, color: "var(--text-3)", margin: 0 }}>{ex.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Commands ──────────────────────────────────────────────────── */}
          <CommandSection commands={DOCKER_COMMANDS} accentColor="#1ea0d2" />
        </>
      )}

      {/* ── Git section ─────────────────────────────────────────────────────── */}
      {section === "git" && (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderRadius: 12, background: "rgba(251,146,60,0.08)", border: "1.5px solid rgba(251,146,60,0.2)" }}>
            <span style={{ fontSize: 20 }}>🔀</span>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: "#fb923c", margin: 0 }}>Git kommandoer</p>
              <p style={{ fontSize: 12, color: "var(--text-3)", margin: 0 }}>{GIT_COMMANDS.length} kommandoer + flag-reference og eksempler</p>
            </div>
          </div>
          <ExtraSection accentColor="#fb923c" flags={[
            { flag: "--global",        desc: "Gælder alle repos på maskinen (bruges med git config)" },
            { flag: "-m 'besked'",     desc: "Commit-besked direkte i kommandoen" },
            { flag: "-a",             desc: "Stage alle ændrede tracked filer automatisk ved commit" },
            { flag: "--amend",         desc: "Ret seneste commit (besked eller indhold) — brug ikke på pushed commits" },
            { flag: "-b",             desc: "Opret ny branch og skift til den (git checkout -b / git switch -c)" },
            { flag: "--rebase",        desc: "Rebase i stedet for merge ved git pull (ingen merge-commits)" },
            { flag: "-f / --force",    desc: "Tving push — overskriver remote historik (farligt ved delte branches)" },
            { flag: "--staged",        desc: "Vis kun stagede ændringer (git diff --staged)" },
            { flag: "--oneline",       desc: "Ét commit pr. linje i log-output" },
            { flag: "--graph",         desc: "Vis branch-struktur som ASCII-graf i log" },
            { flag: "-n <antal>",      desc: "Begræns antal resultater (git log -n 10)" },
            { flag: "--no-ff",         desc: "Opret altid en merge-commit, selv ved fast-forward muligt" },
            { flag: "--soft",          desc: "Reset — flyt HEAD, men behold staged ændringer" },
            { flag: "--hard",          desc: "Reset — flyt HEAD og kassér alle ændringer (irreversibelt!)" },
          ]} examples={[
            { cmd: "git init",                                                     desc: "Opret et nyt tomt Git-repository i den mappe du står i" },
            { cmd: "git init && git add . && git commit -m 'første commit'",       desc: "Komplet workflow: initialiser repo, stage alle filer og lav første commit" },
            { cmd: "git clone https://github.com/bruger/repo.git",                desc: "Hent et eksisterende repository ned lokalt fra GitHub" },
            { cmd: "git add .",                                                    desc: "Stage alle ændrede filer — klar til commit. Brug 'git add fil.txt' for én fil" },
            { cmd: "git commit -m 'tilføj login-side'",                            desc: "Gem de stagede ændringer med en beskrivende besked" },
            { cmd: "git push origin main",                                         desc: "Upload dine commits til GitHub (origin = fjernserver, main = branch)" },
            { cmd: "git pull",                                                     desc: "Hent og merge seneste ændringer fra GitHub ind i din lokale branch" },
            { cmd: "git status",                                                   desc: "Se hvilke filer der er ændret, staged eller ikke-trackede" },
          ]} />
          <CommandSection commands={GIT_COMMANDS} accentColor="#fb923c" />
        </>
      )}

      {/* ── Viden section ────────────────────────────────────────────────────── */}
      {section === "viden" && (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderRadius: 12, background: "rgba(96,165,250,0.08)", border: "1.5px solid rgba(96,165,250,0.2)" }}>
            <span style={{ fontSize: 20 }}>🌐</span>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: "#60a5fa", margin: 0 }}>IT-Viden — Netværk, Sikkerhed & Cloud</p>
              <p style={{ fontSize: 12, color: "var(--text-3)", margin: 0 }}>Klik på en kategori for at se hvad du har styr på + hvad du bør lære</p>
            </div>
          </div>
          <VidenSection />
        </>
      )}

    </div>
  );
}
