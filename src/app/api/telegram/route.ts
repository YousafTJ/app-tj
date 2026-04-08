import { NextRequest, NextResponse } from "next/server";

const TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? "";
const BASE  = `https://api.telegram.org/bot${TOKEN}`;

export async function GET(req: NextRequest) {
  if (!TOKEN) return NextResponse.json({ error: "TELEGRAM_BOT_TOKEN ikke sat" }, { status: 503 });

  const action = req.nextUrl.searchParams.get("action");

  if (action === "setup") {
    // Fetch latest updates to find chat_id
    try {
      const res  = await fetch(`${BASE}/getUpdates?limit=10&offset=-10`);
      const data = await res.json();
      if (!data.ok) return NextResponse.json({ error: "Telegram fejl: " + data.description }, { status: 502 });

      // Find the most recent message
      const updates: Array<{ message?: { chat: { id: number; first_name?: string } } }> = data.result;
      for (let i = updates.length - 1; i >= 0; i--) {
        const msg = updates[i]?.message;
        if (msg?.chat?.id) {
          return NextResponse.json({ chat_id: msg.chat.id, name: msg.chat.first_name ?? "" });
        }
      }
      return NextResponse.json({ error: "Ingen beskeder fundet — send /start til @TJ_app_bot og prøv igen" }, { status: 404 });
    } catch {
      return NextResponse.json({ error: "Kunne ikke kontakte Telegram" }, { status: 502 });
    }
  }

  return NextResponse.json({ error: "Ukendt action" }, { status: 400 });
}

export async function POST(req: NextRequest) {
  if (!TOKEN) return NextResponse.json({ error: "TELEGRAM_BOT_TOKEN ikke sat" }, { status: 503 });

  let body: { chat_id: number | string; message: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ugyldigt JSON" }, { status: 400 });
  }

  const { chat_id, message } = body;
  if (!chat_id || !message) return NextResponse.json({ error: "Mangler chat_id eller message" }, { status: 400 });

  try {
    const res = await fetch(`${BASE}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id, text: message, parse_mode: "Markdown" }),
    });
    const data = await res.json();
    if (!data.ok) return NextResponse.json({ error: "Telegram: " + data.description }, { status: 502 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Kunne ikke sende besked" }, { status: 502 });
  }
}
