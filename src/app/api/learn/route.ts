import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const topic = req.nextUrl.searchParams.get("topic")?.trim() ?? "";
  if (!topic) return NextResponse.json({ error: "Mangler emne" }, { status: 400 });

  // ── 1. Fetch Wikipedia (Danish first, then English) ──────────────────────
  let wikiText = "";
  let wikiTitle = topic;
  let wikiImage = "";

  const encoded = encodeURIComponent(topic);

  const tryWiki = async (lang: string) => {
    const res = await fetch(
      `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encoded}`,
      { headers: { "User-Agent": "TJHUBBot/1.0" }, signal: AbortSignal.timeout(6000) }
    );
    if (!res.ok) return;
    const d = await res.json();
    if (d.extract && d.extract.length > 80) {
      wikiText  = d.extract;
      wikiTitle = d.title ?? topic;
      wikiImage = d.thumbnail?.source ?? "";
    }
  };

  try { await tryWiki("da"); } catch {}
  if (!wikiText) { try { await tryWiki("en"); } catch {} }

  // Fallback: search
  if (!wikiText) {
    try {
      const sr = await fetch(
        `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encoded}&format=json&origin=*`,
        { signal: AbortSignal.timeout(5000) }
      );
      const sd = await sr.json();
      const first = sd.query?.search?.[0];
      if (first) {
        await tryWiki("en");
        if (!wikiText) wikiTitle = first.title;
      }
    } catch {}
  }

  if (!wikiText) {
    return NextResponse.json({ error: `Ingen Wikipedia-artikel fundet for "${topic}".` }, { status: 404 });
  }

  // ── 2. AI: generate quiz + flashcards ────────────────────────────────────
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY er ikke sat i .env.local" },
      { status: 500 }
    );
  }

  const prompt = `Du er en pædagogisk assistent. Baseret på teksten nedenfor om "${wikiTitle}", generer indhold PÅ DANSK.

TEKST:
${wikiText.slice(0, 3500)}

Returner KUN valid JSON (ingen markdown-blokke), i præcis dette format:
{
  "what": "1-2 sætninger: hvad er ${wikiTitle}?",
  "why": "1-2 sætninger: hvorfor er det vigtigt/interessant?",
  "facts": ["kort fact 1", "kort fact 2", "kort fact 3"],
  "quiz": [
    { "question": "spørgsmål?", "options": ["A","B","C","D"], "correct": 0, "explanation": "kort forklaring" }
  ],
  "flashcards": [
    { "front": "begreb eller spørgsmål", "back": "svar eller definition" }
  ]
}

REGLER:
- Præcis 5 quiz-spørgsmål og 5 flashcards
- Quiz: 4 svarmuligheder, "correct" er 0-baseret index
- Baser det udelukkende på teksten
- Svar udelukkende på dansk`;

  try {
    const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.6,
        max_tokens: 2000,
        response_format: { type: "json_object" },
      }),
      signal: AbortSignal.timeout(30000),
    });

    if (!aiRes.ok) {
      const err = await aiRes.json();
      throw new Error(err.error?.message ?? `OpenAI ${aiRes.status}`);
    }

    const aiData = await aiRes.json();
    const generated = JSON.parse(aiData.choices[0].message.content);

    return NextResponse.json({
      title: wikiTitle,
      image: wikiImage,
      excerpt: wikiText.slice(0, 400) + (wikiText.length > 400 ? "…" : ""),
      ...generated,
    });
  } catch (e: unknown) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "AI-fejl" },
      { status: 500 }
    );
  }
}
