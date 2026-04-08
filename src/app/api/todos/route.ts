import { NextRequest, NextResponse } from "next/server";
import { getContainer } from "@/lib/cosmos";

export interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: "low" | "medium" | "high";
  createdAt: string;
  updatedAt: string;
}

export async function GET() {
  try {
    const container = await getContainer();
    const { resources } = await container.items
      .query<Todo>("SELECT * FROM c ORDER BY c.createdAt DESC")
      .fetchAll();
    return NextResponse.json(resources);
  } catch (err) {
    console.error("GET /api/todos error:", err);
    return NextResponse.json({ error: "Kunne ikke hente to-do liste" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.title?.trim()) {
      return NextResponse.json({ error: "Titel er påkrævet" }, { status: 400 });
    }
    const now = new Date().toISOString();
    const todo: Todo = {
      id: crypto.randomUUID(),
      title: body.title.trim(),
      description: body.description?.trim() || undefined,
      completed: false,
      priority: body.priority ?? "medium",
      createdAt: now,
      updatedAt: now,
    };
    const container = await getContainer();
    const { resource } = await container.items.create(todo);
    return NextResponse.json(resource, { status: 201 });
  } catch (err) {
    console.error("POST /api/todos error:", err);
    return NextResponse.json({ error: "Kunne ikke oprette to-do" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;
    if (!id) return NextResponse.json({ error: "Mangler id" }, { status: 400 });

    const container = await getContainer();
    const { resource: existing } = await container.item(id, id).read<Todo>();
    if (!existing) return NextResponse.json({ error: "Ikke fundet" }, { status: 404 });

    const updated: Todo = {
      ...existing,
      ...updates,
      id,
      updatedAt: new Date().toISOString(),
    };
    const { resource } = await container.item(id, id).replace(updated);
    return NextResponse.json(resource);
  } catch (err) {
    console.error("PUT /api/todos error:", err);
    return NextResponse.json({ error: "Kunne ikke opdatere to-do" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Mangler id" }, { status: 400 });

    const container = await getContainer();
    await container.item(id, id).delete();
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/todos error:", err);
    return NextResponse.json({ error: "Kunne ikke slette to-do" }, { status: 500 });
  }
}
