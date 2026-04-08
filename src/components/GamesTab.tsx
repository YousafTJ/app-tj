"use client";

import { useState, useRef, useCallback, useEffect } from "react";

// ─── Shared styles ──────────────────────────────────────────────────────────

const gradBtn = {
  padding: "10px 28px",
  borderRadius: 99,
  background: "linear-gradient(144deg, #AF40FF, #5B42F3 50%, #00DDEB)",
  border: "none",
  color: "#fff",
  fontWeight: 600,
  fontSize: 14,
  cursor: "pointer",
} as const;

// ─── Tic-Tac-Toe ────────────────────────────────────────────────────────────

type Cell = "X" | "O" | null;

function checkWinner(board: Cell[]): Cell | "draw" | null {
  const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  for (const [a,b,c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
  }
  return board.every(c => c !== null) ? "draw" : null;
}

function TicTacToe() {
  const [board, setBoard] = useState<Cell[]>(Array(9).fill(null));
  const [isX, setIsX] = useState(true);
  const [scores, setScores] = useState({ X: 0, O: 0 });
  const winner = checkWinner(board);

  function handleClick(i: number) {
    if (board[i] || winner) return;
    const next = [...board];
    next[i] = isX ? "X" : "O";
    setBoard(next);
    const w = checkWinner(next);
    if (w && w !== "draw") setScores(s => ({ ...s, [w]: s[w as "X"|"O"] + 1 }));
    setIsX(!isX);
  }

  function reset() { setBoard(Array(9).fill(null)); setIsX(true); }
  function resetAll() { reset(); setScores({ X: 0, O: 0 }); }

  const status = winner
    ? winner === "draw" ? "Uafgjort! 🤝" : `${winner} vinder! 🎉`
    : `${isX ? "X" : "O"}'s tur`;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 28 }}>
      {/* Scoreboard */}
      <div style={{ display: "flex", gap: 32, width: "100%", justifyContent: "center" }}>
        {(["X", "O"] as const).map(p => (
          <div key={p} style={{
            textAlign: "center",
            padding: "12px 32px",
            borderRadius: 12,
            background: isX === (p === "X") && !winner ? "rgba(91,66,243,0.15)" : "rgba(255,255,255,0.03)",
            border: `1.5px solid ${isX === (p === "X") && !winner ? "rgba(91,66,243,0.4)" : "rgba(255,255,255,0.08)"}`,
            transition: "all 0.2s",
          }}>
            <p style={{ fontSize: 28, fontWeight: 800, color: p === "X" ? "#AF40FF" : "#00DDEB", margin: 0 }}>{p}</p>
            <p style={{ fontSize: 32, fontWeight: 900, color: "#1c1917", margin: "4px 0 0" }}>{scores[p]}</p>
          </div>
        ))}
      </div>

      <p style={{ fontSize: 16, color: "#a8a29e", fontWeight: 500, margin: 0 }}>{status}</p>

      {/* Board */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 120px)", gap: 10 }}>
        {board.map((cell, i) => (
          <button key={i} onClick={() => handleClick(i)} style={{
            width: 120, height: 120,
            fontSize: 42, fontWeight: 900,
            borderRadius: 16,
            background: cell ? "rgba(91,66,243,0.12)" : "rgba(255,255,255,0.03)",
            border: `2px solid ${cell ? "rgba(91,66,243,0.35)" : "rgba(255,255,255,0.07)"}`,
            color: cell === "X" ? "#AF40FF" : "#00DDEB",
            cursor: board[i] || winner ? "default" : "pointer",
            transition: "all 0.15s",
          }}>
            {cell}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        {winner && <button onClick={reset} style={gradBtn}>Næste runde</button>}
        <button onClick={resetAll} style={{ ...gradBtn, background: "rgba(255,255,255,0.06)", border: "1.5px solid rgba(255,255,255,0.1)" }}>
          Nulstil alt
        </button>
      </div>
    </div>
  );
}

// ─── Typing Speed Game ──────────────────────────────────────────────────────

const TYPING_CATEGORIES: Record<string, string[]> = {
  "💻 Tech": [
    "JavaScript er et dynamisk sprog der kører i browseren og på serveren med Node.js.",
    "TypeScript tilføjer statisk typning til JavaScript og gør koden mere robust og vedligeholdelsesvenlig.",
    "React er et bibliotek til at bygge brugergrænseflader med genanvendelige komponenter.",
    "Next.js er et framework bygget ovenpå React med server-side rendering og statisk generering.",
    "En god programmør skriver kode som et menneske kan læse, ikke kun en maskine.",
  ],
  "🌍 Fakta": [
    "Jordens atmosfære består primært af nitrogen og ilt, med mindre mængder af andre gasser.",
    "Det menneskelige hjerne indeholder ca. 86 milliarder neuroner der kommunikerer med hinanden.",
    "Lyset bruger ca. 8 minutter og 20 sekunder på at rejse fra solen til jorden.",
    "Den dybeste del af havet er Marianergraven med en dybde på næsten 11 kilometer.",
    "DNA-molekylet i én enkelt menneskecelle er ca. to meter langt når det rulles helt ud.",
  ],
  "💪 Motivation": [
    "Succes er ikke endeligt og fiasko er ikke fatal. Det er modet til at fortsætte der tæller.",
    "Øvelse gør mester. Jo mere du træner din færdighed, jo bedre bliver du med tiden.",
    "Hvert ekspert var engang en begynder. Det vigtigste er at tage det første skridt fremad.",
    "De bedste resultater kommer til dem der ikke giver op, selv når det er svært.",
    "Din største konkurrent er den du var i går. Fokuser på din egen fremgang hver dag.",
  ],
  "🇩🇰 Dansk": [
    "Danmark er et konstitutionelt monarki med dronning Margrethe den Anden som statsoverhoved.",
    "Det danske sprog tilhører den nordgermanske sproggruppe og tales af ca. seks millioner mennesker.",
    "Legoklodsen blev opfundet i Danmark af Ole Kirk Christiansen i byen Billund i år 1958.",
    "Hygge er et dansk og norsk ord der beskriver en følelse af komfort og velvære i selskab.",
    "Danmark er verdens ældste kongerige med en sammenhængende kongerække siden år 940 e.Kr.",
  ],
};

function TypingGame() {
  const [category, setCategory] = useState("💻 Tech");
  const [text, setText] = useState(() => TYPING_CATEGORIES["💻 Tech"][0]);
  const [input, setInput] = useState("");
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  function pickText(cat: string) {
    const texts = TYPING_CATEGORIES[cat];
    return texts[Math.floor(Math.random() * texts.length)];
  }

  const restart = useCallback((cat?: string) => {
    const c = cat ?? category;
    setText(pickText(c));
    setInput(""); setStarted(false); setFinished(false); setWpm(0); setAccuracy(0);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [category]);

  function changeCategory(cat: string) {
    setCategory(cat);
    restart(cat);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    if (!started && val.length > 0) { setStarted(true); setStartTime(Date.now()); }
    setInput(val);
    if (val === text) {
      const elapsed = (Date.now() - startTime) / 60000;
      const words = text.split(" ").length;
      let correct = 0;
      for (let i = 0; i < val.length; i++) if (val[i] === text[i]) correct++;
      setWpm(Math.round(words / elapsed));
      setAccuracy(Math.round((correct / text.length) * 100));
      setFinished(true);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Kategori */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {Object.keys(TYPING_CATEGORIES).map(cat => (
          <button key={cat} onClick={() => changeCategory(cat)} style={{
            padding: "6px 14px", borderRadius: 99, fontSize: 13, fontWeight: 600, cursor: "pointer",
            background: category === cat ? "rgba(91,66,243,0.2)" : "rgba(255,255,255,0.04)",
            border: `1.5px solid ${category === cat ? "#5B42F3" : "rgba(255,255,255,0.08)"}`,
            color: category === cat ? "#a78bfa" : "#a8a29e",
          }}>{cat}</button>
        ))}
      </div>

      {/* Tekst */}
      <div style={{
        padding: 28, borderRadius: 14,
        background: "rgba(255,255,255,0.03)",
        border: "1.5px solid rgba(91,66,243,0.15)",
        fontSize: 20, lineHeight: 1.8, fontFamily: "monospace",
      }}>
        {text.split("").map((char, i) => {
          let color = "#3d3a36";
          if (i < input.length) color = input[i] === char ? "#a3e635" : "#f87171";
          else if (i === input.length) color = "#1c1917";
          return <span key={i} style={{ color }}>{char}</span>;
        })}
      </div>

      {!finished ? (
        <input
          ref={inputRef}
          value={input}
          onChange={handleChange}
          placeholder="Begynd at skrive her..."
          autoFocus
          style={{
            padding: "16px 20px", borderRadius: 12, fontSize: 17, fontFamily: "monospace",
            background: "rgba(255,255,255,0.04)", border: "1.5px solid rgba(91,66,243,0.3)",
            color: "#1c1917", outline: "none", width: "100%", boxSizing: "border-box",
          }}
        />
      ) : (
        <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
          {[{ label: "WPM", value: wpm, color: "#AF40FF" }, { label: "Nøjagtighed", value: `${accuracy}%`, color: "#00DDEB" }].map(s => (
            <div key={s.label} className="uv-card-1" style={{ flex: 1, minWidth: 120 }}>
              <div className="uv-card-1-inner" style={{ padding: "20px", textAlign: "center" }}>
                <p style={{ fontSize: 36, fontWeight: 900, color: s.color, margin: 0 }}>{s.value}</p>
                <p style={{ fontSize: 13, color: "#a8a29e", margin: "6px 0 0" }}>{s.label}</p>
              </div>
            </div>
          ))}
          <button onClick={() => restart()} style={gradBtn}>Prøv igen</button>
        </div>
      )}

      {started && !finished && (
        <p style={{ fontSize: 13, color: "#57534e", margin: 0 }}>{input.length} / {text.length} tegn</p>
      )}
    </div>
  );
}

// ─── Trivia Game ─────────────────────────────────────────────────────────────

interface TriviaCategory { id: number; name: string; }
interface TriviaQuestion {
  question: string; correct_answer: string;
  incorrect_answers: string[]; difficulty: string; category: string;
}

function decodeHtml(html: string) {
  if (typeof document === "undefined") return html;
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

const diffColors: Record<string, string> = { easy: "#a3e635", medium: "#facc15", hard: "#f87171" };
type TriviaState = "idle" | "loading" | "playing" | "done";

function TriviaGame() {
  const [categories, setCategories] = useState<TriviaCategory[]>([]);
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [state, setState] = useState<TriviaState>("idle");
  const [questions, setQuestions] = useState<TriviaQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [options, setOptions] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("https://opentdb.com/api_category.php")
      .then(r => r.json())
      .then(d => setCategories(d.trivia_categories ?? []))
      .catch(() => {});
  }, []);

  async function startGame() {
    setState("loading"); setError(""); setScore(0); setIndex(0);
    try {
      const catParam = categoryId !== "" ? `&category=${categoryId}` : "";
      const res = await fetch(`https://opentdb.com/api.php?amount=5&difficulty=${difficulty}&type=multiple${catParam}`);
      const data = await res.json();
      if (data.response_code !== 0) throw new Error();
      setQuestions(data.results);
      setOptions(shuffle([data.results[0].correct_answer, ...data.results[0].incorrect_answers]));
      setSelected(null);
      setState("playing");
    } catch {
      setError("Kunne ikke hente spørgsmål. Prøv igen."); setState("idle");
    }
  }

  function answer(opt: string) {
    if (selected) return;
    setSelected(opt);
    if (opt === questions[index].correct_answer) setScore(s => s + 1);
  }

  function next() {
    const ni = index + 1;
    if (ni >= questions.length) { setState("done"); return; }
    setIndex(ni);
    setOptions(shuffle([questions[ni].correct_answer, ...questions[ni].incorrect_answers]));
    setSelected(null);
  }

  if (state === "idle" || state === "loading") return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Kategori dropdown */}
      <div>
        <p style={{ fontSize: 13, color: "#a8a29e", marginBottom: 8 }}>Emne</p>
        <select
          value={categoryId}
          onChange={e => setCategoryId(e.target.value === "" ? "" : Number(e.target.value))}
          style={{
            width: "100%", padding: "12px 16px", borderRadius: 10, fontSize: 14,
            background: "rgba(255,255,255,0.05)", border: "1.5px solid rgba(91,66,243,0.3)",
            color: "#1c1917", outline: "none", cursor: "pointer",
          }}
        >
          <option value="">🎲 Random (alle emner)</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {/* Sværhedsgrad */}
      <div>
        <p style={{ fontSize: 13, color: "#a8a29e", marginBottom: 8 }}>Sværhedsgrad</p>
        <div style={{ display: "flex", gap: 8 }}>
          {(["easy", "medium", "hard"] as const).map(d => (
            <button key={d} onClick={() => setDifficulty(d)} style={{
              padding: "8px 20px", borderRadius: 99, fontWeight: 600, fontSize: 13, cursor: "pointer",
              border: `1.5px solid ${difficulty === d ? diffColors[d] : "rgba(255,255,255,0.1)"}`,
              background: difficulty === d ? `${diffColors[d]}22` : "transparent",
              color: difficulty === d ? diffColors[d] : "#a8a29e",
            }}>
              {d === "easy" ? "Let" : d === "medium" ? "Medium" : "Svær"}
            </button>
          ))}
        </div>
      </div>

      {error && <p style={{ color: "#f87171", fontSize: 13, margin: 0 }}>{error}</p>}
      <button onClick={startGame} disabled={state === "loading"} style={{ ...gradBtn, opacity: state === "loading" ? 0.7 : 1 }}>
        {state === "loading" ? "Henter spørgsmål..." : "Start quiz"}
      </button>
    </div>
  );

  if (state === "done") {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
        <p style={{ fontSize: 64, margin: 0 }}>{pct === 100 ? "🏆" : pct >= 60 ? "🎉" : "💪"}</p>
        <p style={{ fontSize: 36, fontWeight: 900, color: "#AF40FF", margin: 0 }}>{score} / {questions.length}</p>
        <p style={{ color: "#a8a29e", margin: 0 }}>{pct}% korrekt</p>
        <button onClick={startGame} style={gradBtn}>Spil igen</button>
        <button onClick={() => setState("idle")} style={{ ...gradBtn, background: "rgba(255,255,255,0.06)", border: "1.5px solid rgba(255,255,255,0.1)" }}>
          Skift indstillinger
        </button>
      </div>
    );
  }

  const q = questions[index];
  const correct = q.correct_answer;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Progress */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 13, color: "#57534e" }}>Spørgsmål {index + 1} / {questions.length}</span>
        <span style={{
          fontSize: 12, fontWeight: 700, padding: "3px 12px", borderRadius: 99,
          background: `${diffColors[q.difficulty]}22`, color: diffColors[q.difficulty],
        }}>
          {q.difficulty}
        </span>
      </div>
      <div style={{ height: 4, borderRadius: 99, background: "rgba(255,255,255,0.06)" }}>
        <div style={{ height: 4, borderRadius: 99, background: "linear-gradient(90deg, #AF40FF, #00DDEB)", width: `${((index + 1) / questions.length) * 100}%`, transition: "width 0.3s" }} />
      </div>

      <p style={{ fontSize: 12, color: "#57534e", margin: 0 }}>{decodeHtml(q.category)}</p>
      <p style={{ fontSize: 18, fontWeight: 600, color: "#1c1917", lineHeight: 1.6, margin: 0 }}>
        {decodeHtml(q.question)}
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {options.map(opt => {
          let bg = "rgba(255,255,255,0.04)", border = "rgba(91,66,243,0.2)", color = "#1c1917";
          if (selected) {
            if (opt === correct) { bg = "rgba(163,230,53,0.12)"; border = "#a3e635"; color = "#a3e635"; }
            else if (opt === selected) { bg = "rgba(248,113,113,0.12)"; border = "#f87171"; color = "#f87171"; }
          }
          return (
            <button key={opt} onClick={() => answer(opt)} style={{
              padding: "14px 18px", borderRadius: 12,
              background: bg, border: `1.5px solid ${border}`, color,
              fontWeight: 500, fontSize: 15, textAlign: "left",
              cursor: selected ? "default" : "pointer", transition: "all 0.15s",
            }}>
              {decodeHtml(opt)}
            </button>
          );
        })}
      </div>

      {selected && (
        <button onClick={next} style={{ ...gradBtn, alignSelf: "flex-end" }}>
          {index + 1 === questions.length ? "Se resultat" : "Næste →"}
        </button>
      )}
    </div>
  );
}

// ─── Higher or Lower ─────────────────────────────────────────────────────────

type HolCategory = "population" | "area";

interface HolCountry {
  name: { common: string };
  flags: { png: string };
  population: number;
  area: number;
  cca2: string;
}

const HOL_LABELS: Record<HolCategory, { label: string; unit: string; format: (n: number) => string }> = {
  population: {
    label: "Befolkning",
    unit: "indbyggere",
    format: (n) => n >= 1_000_000
      ? `${(n / 1_000_000).toFixed(1)}M`
      : n >= 1_000 ? `${(n / 1_000).toFixed(0)}K` : `${n}`,
  },
  area: {
    label: "Areal",
    unit: "km²",
    format: (n) => n >= 1_000_000
      ? `${(n / 1_000_000).toFixed(2)}M km²`
      : `${n.toLocaleString()} km²`,
  },
};

function HigherOrLower() {
  const [countries, setCountries] = useState<HolCountry[]>([]);
  const [category, setCategory] = useState<HolCategory>("population");
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [left, setLeft] = useState<HolCountry | null>(null);
  const [right, setRight] = useState<HolCountry | null>(null);
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const usedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    setLoading(true);
    fetch("https://restcountries.com/v3.1/all?fields=name,flags,population,area,cca2")
      .then(r => r.json())
      .then((d: HolCountry[]) => {
        setCountries(d.filter(c => c.population > 0 && c.area > 0));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function pickTwo(used: Set<string>, pool: HolCountry[]): [HolCountry, HolCountry] | null {
    const avail = pool.filter(c => !used.has(c.cca2));
    if (avail.length < 2) return null;
    const a = avail[Math.floor(Math.random() * avail.length)];
    const rest = avail.filter(c => c.cca2 !== a.cca2);
    const b = rest[Math.floor(Math.random() * rest.length)];
    return [a, b];
  }

  function startGame() {
    usedRef.current = new Set();
    const pair = pickTwo(usedRef.current, countries);
    if (!pair) return;
    usedRef.current.add(pair[0].cca2);
    usedRef.current.add(pair[1].cca2);
    setLeft(pair[0]); setRight(pair[1]);
    setStreak(0); setResult(null); setGameOver(false); setStarted(true);
  }

  function guess(higher: boolean) {
    if (!left || !right || result) return;
    const leftVal = left[category];
    const rightVal = right[category];
    const correct = higher ? rightVal >= leftVal : rightVal <= leftVal;
    setResult(correct ? "correct" : "wrong");

    setTimeout(() => {
      if (!correct) {
        setGameOver(true);
        return;
      }
      const newStreak = streak + 1;
      setStreak(newStreak);
      setBest(b => Math.max(b, newStreak));

      // Slide: right becomes new left, pick new right
      const newUsed = new Set(usedRef.current);
      newUsed.add(right.cca2);
      usedRef.current = newUsed;
      const avail = countries.filter(c => !newUsed.has(c.cca2));
      if (avail.length === 0) { setGameOver(true); return; }
      const newRight = avail[Math.floor(Math.random() * avail.length)];
      usedRef.current.add(newRight.cca2);
      setLeft(right);
      setRight(newRight);
      setResult(null);
    }, 1200);
  }

  const meta = HOL_LABELS[category];

  if (loading) return <p style={{ color: "#a8a29e" }}>Henter landedata...</p>;

  if (!started || gameOver) return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {gameOver && (
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: 52, margin: 0 }}>{streak >= 10 ? "🏆" : streak >= 5 ? "🎉" : "💪"}</p>
          <p style={{ fontSize: 32, fontWeight: 900, color: "#AF40FF", margin: "8px 0 4px" }}>{streak} i træk</p>
          <p style={{ color: "#a8a29e" }}>Bedste: {best}</p>
        </div>
      )}
      <div>
        <p style={{ fontSize: 13, color: "#a8a29e", marginBottom: 10 }}>Sammenlign</p>
        <div style={{ display: "flex", gap: 8 }}>
          {(Object.keys(HOL_LABELS) as HolCategory[]).map(c => (
            <button key={c} onClick={() => setCategory(c)} style={{
              padding: "8px 20px", borderRadius: 99, fontSize: 14, fontWeight: 600, cursor: "pointer",
              background: category === c ? "rgba(91,66,243,0.2)" : "rgba(255,255,255,0.04)",
              border: `1.5px solid ${category === c ? "#5B42F3" : "rgba(255,255,255,0.08)"}`,
              color: category === c ? "#a78bfa" : "#a8a29e",
            }}>{HOL_LABELS[c].label}</button>
          ))}
        </div>
      </div>
      <button onClick={startGame} style={gradBtn}>{gameOver ? "Spil igen" : "Start spil"}</button>
    </div>
  );

  const leftVal = left![category];
  const rightVal = right![category];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Streak */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontSize: 13, color: "#57534e" }}>Bedste: <b style={{ color: "#a8a29e" }}>{best}</b></span>
        <span style={{ fontSize: 18, fontWeight: 800, color: "#AF40FF" }}>🔥 {streak} i træk</span>
      </div>

      {/* Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 16, alignItems: "center" }}>
        {/* Left — revealed */}
        <div style={{
          padding: 24, borderRadius: 16, textAlign: "center",
          background: "rgba(255,255,255,0.04)", border: "1.5px solid rgba(255,255,255,0.08)",
        }}>
          <img src={left!.flags.png} alt="" style={{ width: 80, borderRadius: 6, marginBottom: 12, boxShadow: "0 2px 12px rgba(0,0,0,0.4)" }} />
          <p style={{ fontSize: 16, fontWeight: 700, color: "#1c1917", margin: "0 0 8px" }}>{left!.name.common}</p>
          <p style={{ fontSize: 28, fontWeight: 900, color: "#AF40FF", margin: 0 }}>{meta.format(leftVal)}</p>
          <p style={{ fontSize: 12, color: "#57534e", margin: "4px 0 0" }}>{meta.label}</p>
        </div>

        {/* VS */}
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: 18, fontWeight: 900, color: "#57534e", margin: 0 }}>VS</p>
        </div>

        {/* Right — hidden until guessed */}
        <div style={{
          padding: 24, borderRadius: 16, textAlign: "center",
          background: result === "correct" ? "rgba(163,230,53,0.08)" : result === "wrong" ? "rgba(248,113,113,0.08)" : "rgba(255,255,255,0.04)",
          border: `1.5px solid ${result === "correct" ? "#a3e635" : result === "wrong" ? "#f87171" : "rgba(255,255,255,0.08)"}`,
          transition: "all 0.3s",
        }}>
          <img src={right!.flags.png} alt="" style={{ width: 80, borderRadius: 6, marginBottom: 12, boxShadow: "0 2px 12px rgba(0,0,0,0.4)" }} />
          <p style={{ fontSize: 16, fontWeight: 700, color: "#1c1917", margin: "0 0 8px" }}>{right!.name.common}</p>
          {result ? (
            <>
              <p style={{ fontSize: 28, fontWeight: 900, color: result === "correct" ? "#a3e635" : "#f87171", margin: 0 }}>
                {meta.format(rightVal)}
              </p>
              <p style={{ fontSize: 12, color: "#57534e", margin: "4px 0 0" }}>{meta.label}</p>
            </>
          ) : (
            <p style={{ fontSize: 14, color: "#57534e", margin: 0 }}>Højere eller lavere?</p>
          )}
        </div>
      </div>

      {/* Buttons */}
      {!result && (
        <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
          <button onClick={() => guess(true)} style={{ ...gradBtn, fontSize: 18, padding: "14px 40px" }}>
            ↑ Højere
          </button>
          <button onClick={() => guess(false)} style={{ ...gradBtn, fontSize: 18, padding: "14px 40px", background: "rgba(255,255,255,0.08)", border: "1.5px solid rgba(255,255,255,0.15)" }}>
            ↓ Lavere
          </button>
        </div>
      )}

      {result && (
        <p style={{ textAlign: "center", fontSize: 18, fontWeight: 700, color: result === "correct" ? "#a3e635" : "#f87171", margin: 0 }}>
          {result === "correct" ? "✓ Korrekt!" : "✗ Forkert — game over!"}
        </p>
      )}
    </div>
  );
}

// ─── Spin The Wheel ──────────────────────────────────────────────────────────

const WHEEL_COLORS = [
  "#AF40FF", "#5B42F3", "#00DDEB", "#f59e0b", "#10b981",
  "#f43f5e", "#3b82f6", "#a3e635", "#e879f9", "#fb923c",
];

function SpinWheel() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [options, setOptions] = useState(["Pizza", "Burger", "Sushi", "Tacos", "Pasta"]);
  const [input, setInput] = useState("");
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const angleRef = useRef(0);
  const animRef = useRef<number>(0);

  useEffect(() => {
    drawWheel(angleRef.current);
  }, [options]);

  function drawWheel(rotation: number) {
    const canvas = canvasRef.current;
    if (!canvas || options.length === 0) return;
    const ctx = canvas.getContext("2d")!;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const r = cx - 8;
    const slice = (2 * Math.PI) / options.length;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    options.forEach((opt, i) => {
      const start = rotation + i * slice;
      const end = start + slice;

      // Segment
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, start, end);
      ctx.closePath();
      ctx.fillStyle = WHEEL_COLORS[i % WHEEL_COLORS.length];
      ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,0.3)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Text
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(start + slice / 2);
      ctx.textAlign = "right";
      ctx.fillStyle = "#fff";
      ctx.font = `bold ${Math.min(16, 200 / options.length)}px sans-serif`;
      ctx.shadowColor = "rgba(0,0,0,0.5)";
      ctx.shadowBlur = 3;
      const label = opt.length > 14 ? opt.slice(0, 13) + "…" : opt;
      ctx.fillText(label, r - 12, 5);
      ctx.restore();
    });

    // Center circle
    ctx.beginPath();
    ctx.arc(cx, cy, 18, 0, 2 * Math.PI);
    ctx.fillStyle = "#f5f4f2";
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.15)";
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  function spin() {
    if (spinning || options.length < 2) return;
    setSpinning(true);
    setWinner(null);

    const totalRotation = (Math.PI * 2 * 8) + Math.random() * Math.PI * 2;
    const duration = 4000;
    const start = performance.now();
    const startAngle = angleRef.current;

    function animate(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = startAngle + totalRotation * eased;
      angleRef.current = current;
      drawWheel(current);

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        angleRef.current = current % (Math.PI * 2);
        // Find winner: pointer is at top (–π/2), calculate which slice it lands on
        const slice = (2 * Math.PI) / options.length;
        const normalized = (((-angleRef.current % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2));
        const idx = Math.floor(normalized / slice) % options.length;
        setWinner(options[idx]);
        setSpinning(false);
      }
    }
    animRef.current = requestAnimationFrame(animate);
  }

  function addOption() {
    const val = input.trim();
    if (!val || options.includes(val) || options.length >= 10) return;
    setOptions(o => [...o, val]);
    setInput("");
    setWinner(null);
  }

  function removeOption(i: number) {
    setOptions(o => o.filter((_, idx) => idx !== i));
    setWinner(null);
  }

  return (
    <div style={{ display: "flex", gap: 40, flexWrap: "wrap", alignItems: "flex-start" }}>
      {/* Wheel */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, flex: "0 0 auto" }}>
        {/* Pointer */}
        <div style={{ position: "relative" }}>
          <div style={{
            position: "absolute", top: -16, left: "50%", transform: "translateX(-50%)",
            width: 0, height: 0,
            borderLeft: "12px solid transparent",
            borderRight: "12px solid transparent",
            borderTop: "24px solid #f4f1ee",
            zIndex: 10,
            filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))",
          }} />
          <canvas
            ref={canvasRef}
            width={340}
            height={340}
            style={{ borderRadius: "50%", display: "block", boxShadow: "0 0 40px rgba(91,66,243,0.3)" }}
          />
        </div>

        <button
          onClick={spin}
          disabled={spinning || options.length < 2}
          style={{
            ...gradBtn,
            fontSize: 18, padding: "14px 48px",
            opacity: spinning || options.length < 2 ? 0.5 : 1,
            cursor: spinning || options.length < 2 ? "default" : "pointer",
          }}
        >
          {spinning ? "Spinner..." : "🎡 Spin!"}
        </button>

        {winner && (
          <div style={{
            padding: "16px 32px", borderRadius: 14, textAlign: "center",
            background: "rgba(163,230,53,0.12)", border: "1.5px solid #a3e635",
            animation: "fadeIn 0.3s ease",
          }}>
            <p style={{ fontSize: 12, color: "#a3e635", fontWeight: 700, letterSpacing: 1, margin: "0 0 4px", textTransform: "uppercase" }}>Vinder</p>
            <p style={{ fontSize: 24, fontWeight: 900, color: "#1c1917", margin: 0 }}>{winner} 🎉</p>
          </div>
        )}
      </div>

      {/* Options */}
      <div style={{ flex: 1, minWidth: 240, display: "flex", flexDirection: "column", gap: 16 }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: "#a8a29e", margin: 0 }}>
          Valgmuligheder ({options.length}/10)
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {options.map((opt, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 14px", borderRadius: 10,
              background: "rgba(255,255,255,0.03)",
              border: "1.5px solid rgba(255,255,255,0.07)",
            }}>
              <div style={{
                width: 14, height: 14, borderRadius: "50%", flexShrink: 0,
                background: WHEEL_COLORS[i % WHEEL_COLORS.length],
              }} />
              <span style={{ flex: 1, fontSize: 14, color: "#1c1917" }}>{opt}</span>
              <button onClick={() => removeOption(i)} style={{
                background: "none", border: "none", color: "#57534e",
                cursor: "pointer", fontSize: 18, lineHeight: 1, padding: "0 2px",
              }}>×</button>
            </div>
          ))}
        </div>

        <form onSubmit={e => { e.preventDefault(); addOption(); }} style={{ display: "flex", gap: 8 }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Tilføj mulighed..."
            maxLength={30}
            disabled={options.length >= 10}
            style={{
              flex: 1, padding: "10px 14px", borderRadius: 10, fontSize: 14,
              background: "rgba(255,255,255,0.04)", border: "1.5px solid rgba(91,66,243,0.3)",
              color: "#1c1917", outline: "none",
            }}
          />
          <button type="submit" disabled={options.length >= 10} style={{ ...gradBtn, padding: "10px 18px" }}>+</button>
        </form>

        {options.length < 2 && (
          <p style={{ fontSize: 13, color: "#f87171", margin: 0 }}>Tilføj mindst 2 muligheder for at spinde</p>
        )}
      </div>
    </div>
  );
}

// ─── Guess the Flag ──────────────────────────────────────────────────────────

type Country = {
  name: { common: string };
  cca2: string;
  flags: { png: string; alt?: string };
  region: string;
};

const REGIONS = ["All", "Africa", "Americas", "Asia", "Europe", "Oceania"];
const ROUNDS = 10;

function GuessTheFlag() {
  const [allCountries, setAllCountries] = useState<Country[]>([]);
  const [pool, setPool] = useState<Country[]>([]);
  const [region, setRegion] = useState("All");
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [current, setCurrent] = useState<Country | null>(null);
  const [choices, setChoices] = useState<Country[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch("https://restcountries.com/v3.1/all?fields=name,flags,cca2,region")
      .then(r => r.json())
      .then((data: Country[]) => { setAllCountries(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  function buildPool(reg: string) {
    return reg === "All" ? allCountries : allCountries.filter(c => c.region === reg);
  }

  function pickQuestion(countries: Country[], usedIdxs: Set<number>) {
    const available = countries.filter((_, i) => !usedIdxs.has(i));
    if (available.length < 4) return null;
    const correct = available[Math.floor(Math.random() * available.length)];
    const wrongs = shuffle(countries.filter(c => c.cca2 !== correct.cca2)).slice(0, 3);
    return { correct, choices: shuffle([correct, ...wrongs]) };
  }

  function startGame() {
    const p = buildPool(region);
    if (p.length < 4) return;
    setPool(p);
    setRound(0); setScore(0); setDone(false); setSelected(null);
    const q = pickQuestion(p, new Set());
    if (!q) return;
    setCurrent(q.correct);
    setChoices(q.choices);
    setImgLoaded(false);
    setStarted(true);
  }

  function answer(cca2: string) {
    if (selected || !current) return;
    setSelected(cca2);
    if (cca2 === current.cca2) setScore(s => s + 1);
  }

  function nextRound() {
    const nextRound = round + 1;
    if (nextRound >= ROUNDS) { setDone(true); return; }
    const q = pickQuestion(pool, new Set());
    if (!q) { setDone(true); return; }
    setRound(nextRound);
    setCurrent(q.correct);
    setChoices(q.choices);
    setSelected(null);
    setImgLoaded(false);
  }

  if (loading) return <p style={{ color: "#a8a29e" }}>Henter lande...</p>;

  if (!started || done) return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {done && (
        <div style={{ textAlign: "center", paddingBottom: 8 }}>
          <p style={{ fontSize: 56, margin: 0 }}>{score >= 8 ? "🏆" : score >= 5 ? "🎉" : "💪"}</p>
          <p style={{ fontSize: 32, fontWeight: 900, color: "#AF40FF", margin: "8px 0 4px" }}>{score} / {ROUNDS}</p>
          <p style={{ color: "#a8a29e" }}>{Math.round((score / ROUNDS) * 100)}% korrekt</p>
        </div>
      )}

      <div>
        <p style={{ fontSize: 13, color: "#a8a29e", marginBottom: 10 }}>Vælg region</p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {REGIONS.map(r => (
            <button key={r} onClick={() => setRegion(r)} style={{
              padding: "7px 16px", borderRadius: 99, fontSize: 13, fontWeight: 600, cursor: "pointer",
              background: region === r ? "rgba(91,66,243,0.2)" : "rgba(255,255,255,0.04)",
              border: `1.5px solid ${region === r ? "#5B42F3" : "rgba(255,255,255,0.08)"}`,
              color: region === r ? "#a78bfa" : "#a8a29e",
            }}>{r === "All" ? "🌍 Alle" : r}</button>
          ))}
        </div>
      </div>

      <button onClick={startGame} style={gradBtn}>
        {done ? "Spil igen" : "Start spil"}
      </button>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Progress */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 13, color: "#57534e" }}>Runde {round + 1} / {ROUNDS}</span>
        <span style={{ fontSize: 16, fontWeight: 800, color: "#AF40FF" }}>⭐ {score}</span>
      </div>
      <div style={{ height: 4, borderRadius: 99, background: "rgba(255,255,255,0.06)" }}>
        <div style={{ height: 4, borderRadius: 99, background: "linear-gradient(90deg, #AF40FF, #00DDEB)", width: `${((round) / ROUNDS) * 100}%`, transition: "width 0.4s" }} />
      </div>

      {/* Flag */}
      <div style={{ display: "flex", justifyContent: "center", padding: "16px 0" }}>
        <div style={{
          borderRadius: 16, overflow: "hidden",
          boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
          border: "2px solid rgba(255,255,255,0.08)",
          background: "rgba(255,255,255,0.03)",
          minHeight: 180, display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {!imgLoaded && <p style={{ color: "#57534e", padding: "40px 80px" }}>...</p>}
          {current && (
            <img
              src={current.flags.png}
              alt={current.flags.alt || `Flag`}
              onLoad={() => setImgLoaded(true)}
              style={{ display: imgLoaded ? "block" : "none", maxWidth: 320, maxHeight: 200, objectFit: "contain" }}
            />
          )}
        </div>
      </div>

      {/* Choices */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {choices.map(c => {
          let bg = "rgba(255,255,255,0.04)", border = "rgba(91,66,243,0.2)", color = "#1c1917";
          if (selected) {
            if (c.cca2 === current?.cca2) { bg = "rgba(163,230,53,0.12)"; border = "#a3e635"; color = "#a3e635"; }
            else if (c.cca2 === selected) { bg = "rgba(248,113,113,0.12)"; border = "#f87171"; color = "#f87171"; }
          }
          return (
            <button key={c.cca2} onClick={() => answer(c.cca2)} style={{
              padding: "14px 12px", borderRadius: 12, fontSize: 15, fontWeight: 600,
              background: bg, border: `1.5px solid ${border}`, color,
              cursor: selected ? "default" : "pointer", transition: "all 0.15s",
            }}>
              {c.name.common}
            </button>
          );
        })}
      </div>

      {selected && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <p style={{ margin: 0, fontSize: 14, color: selected === current?.cca2 ? "#a3e635" : "#f87171", fontWeight: 600 }}>
            {selected === current?.cca2 ? "✓ Korrekt!" : `✗ Det var ${current?.name.common}`}
          </p>
          <button onClick={nextRound} style={gradBtn}>
            {round + 1 >= ROUNDS ? "Se resultat" : "Næste →"}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Main GamesTab ──────────────────────────────────────────────────────────

export default function GamesTab() {
  return (
    <div>
      <h2 style={{ fontSize: 24, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>Spil</h2>
      <p style={{ color: "var(--text-2)", marginBottom: 40 }}>Tre spil til at slappe af med</p>

      <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>

        {/* Guess the Flag */}
        <div className="uv-card-1">
          <div className="uv-card-1-inner" style={{ padding: 40 }}>
            <div style={{ marginBottom: 28 }}>
              <h3 style={{ fontSize: 22, fontWeight: 700, color: "#1c1917", margin: 0 }}>🏳️ Guess the Flag</h3>
              <p style={{ fontSize: 14, color: "#a8a29e", margin: "6px 0 0" }}>
                Vælg region og gæt hvilket land flaget tilhører — {ROUNDS} runder
              </p>
            </div>
            <GuessTheFlag />
          </div>
        </div>

        {/* Spin the Wheel */}
        <div className="uv-card-1">
          <div className="uv-card-1-inner" style={{ padding: 40 }}>
            <div style={{ marginBottom: 28 }}>
              <h3 style={{ fontSize: 22, fontWeight: 700, color: "#1c1917", margin: 0 }}>🎡 Spin the Wheel</h3>
              <p style={{ fontSize: 14, color: "#a8a29e", margin: "6px 0 0" }}>
                Tilføj dine egne valgmuligheder og lad hjulet bestemme
              </p>
            </div>
            <SpinWheel />
          </div>
        </div>

        {/* Higher or Lower */}
        <div className="uv-card-1">
          <div className="uv-card-1-inner" style={{ padding: 40 }}>
            <div style={{ marginBottom: 28 }}>
              <h3 style={{ fontSize: 22, fontWeight: 700, color: "#1c1917", margin: 0 }}>📊 Higher or Lower</h3>
              <p style={{ fontSize: 14, color: "#a8a29e", margin: "6px 0 0" }}>
                Har det næste land højere eller lavere befolkning/areal? Data fra REST Countries API
              </p>
            </div>
            <HigherOrLower />
          </div>
        </div>

        {/* Trivia */}
        <div className="uv-card-1">
          <div className="uv-card-1-inner" style={{ padding: 40 }}>
            <div style={{ marginBottom: 28 }}>
              <h3 style={{ fontSize: 22, fontWeight: 700, color: "#1c1917", margin: 0 }}>🧠 Trivia Quiz</h3>
              <p style={{ fontSize: 14, color: "#a8a29e", margin: "6px 0 0" }}>
                Vælg emne og sværhedsgrad — 5 random multiple choice spørgsmål fra Open Trivia DB
              </p>
            </div>
            <TriviaGame />
          </div>
        </div>

        {/* Typing */}
        <div className="uv-card-1">
          <div className="uv-card-1-inner" style={{ padding: 40 }}>
            <div style={{ marginBottom: 28 }}>
              <h3 style={{ fontSize: 22, fontWeight: 700, color: "#1c1917", margin: 0 }}>⌨️ Typing Speed</h3>
              <p style={{ fontSize: 14, color: "#a8a29e", margin: "6px 0 0" }}>
                Vælg et emne og tast teksten så hurtigt og præcist som muligt
              </p>
            </div>
            <TypingGame />
          </div>
        </div>

        {/* Kryds og bolle */}
        <div className="uv-card-1">
          <div className="uv-card-1-inner" style={{ padding: 40 }}>
            <div style={{ marginBottom: 28 }}>
              <h3 style={{ fontSize: 22, fontWeight: 700, color: "#1c1917", margin: 0 }}>❌ Kryds og bolle</h3>
              <p style={{ fontSize: 14, color: "#a8a29e", margin: "6px 0 0" }}>
                To spillere skiftes — første til 3 vinder runden
              </p>
            </div>
            <TicTacToe />
          </div>
        </div>

      </div>
    </div>
  );
}
