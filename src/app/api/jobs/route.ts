import { NextRequest, NextResponse } from "next/server";

interface RemoteOKJob {
  id: number | string;
  epoch: number;
  date: string;
  url: string;
  title: string;
  company: string;
  company_logo?: string;
  location?: string;
  tags?: string[];
  description?: string;
  salary_min?: number;
  salary_max?: number;
  slug?: string;
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q");
  if (!q) return NextResponse.json({ error: "Mangler søgeord" }, { status: 400 });

  const tag = q.trim().toLowerCase().replace(/\s+/g, "-");

  try {
    const res = await fetch(
      `https://remoteok.com/api?tag=${encodeURIComponent(tag)}`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; TJHUBApp/1.0)",
          Accept: "application/json",
        },
        signal: AbortSignal.timeout(12000),
      },
    );
    if (!res.ok) throw new Error(`RemoteOK svarede ${res.status}`);
    const raw = await res.json();

    // First element is always a legal notice object — skip it
    const jobs: RemoteOKJob[] = Array.isArray(raw)
      ? (raw as RemoteOKJob[]).filter(j => j && typeof j.id !== "undefined" && j.title)
      : [];

    const mapped = jobs.slice(0, 25).map(j => ({
      id:          j.id,
      title:       j.title,
      company:     j.company,
      company_logo: j.company_logo ?? null,
      location:    j.location ?? "Worldwide",
      tags:        j.tags ?? [],
      url:         j.url ?? `https://remoteok.com/remote-jobs/${j.slug ?? j.id}`,
      date:        j.date ?? new Date(j.epoch * 1000).toISOString(),
      salary_min:  j.salary_min ?? null,
      salary_max:  j.salary_max ?? null,
      description: j.description ?? "",
    }));

    return NextResponse.json({ jobs: mapped, count: mapped.length, query: q });
  } catch (e: unknown) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Søgning fejlede" },
      { status: 500 },
    );
  }
}
