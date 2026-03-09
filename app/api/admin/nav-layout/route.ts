import { NextResponse } from "next/server";
import {
  getSiteNavLayoutMode,
  saveSiteNavLayoutMode,
  type NavLayoutMode,
} from "@/app/lib/site-content";

function isNavLayoutMode(value: unknown): value is NavLayoutMode {
  return value === "full" || value === "hamburger";
}

export async function GET() {
  try {
    const mode = await getSiteNavLayoutMode();
    return NextResponse.json({ mode });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load navigation mode.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  let payload: unknown;

  try {
    payload = (await request.json()) as unknown;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const mode = (payload as { mode?: unknown } | null)?.mode;
  if (!isNavLayoutMode(mode)) {
    return NextResponse.json(
      { error: "Invalid mode. Expected 'full' or 'hamburger'." },
      { status: 400 }
    );
  }

  try {
    const savedMode = await saveSiteNavLayoutMode(mode);
    return NextResponse.json({ mode: savedMode });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save navigation mode.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
