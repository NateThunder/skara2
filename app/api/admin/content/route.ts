import { NextResponse } from "next/server";
import { getSiteContent, saveSiteContent } from "@/app/lib/site-content";

export async function GET() {
  const content = await getSiteContent();
  return NextResponse.json({ content });
}

export async function PUT(request: Request) {
  try {
    const payload = (await request.json()) as unknown;
    const content = await saveSiteContent(payload);
    return NextResponse.json({ content });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body. Please submit valid JSON content." },
      { status: 400 }
    );
  }
}

