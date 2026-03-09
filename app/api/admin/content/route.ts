import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSiteContent, saveSiteContent } from "@/app/lib/site-content";

export async function GET() {
  try {
    const content = await getSiteContent();
    return NextResponse.json({ content });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load site content.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  let payload: unknown;

  try {
    payload = (await request.json()) as unknown;
  } catch {
    return NextResponse.json(
      { error: "Invalid request body. Please submit valid JSON content." },
      { status: 400 }
    );
  }

  try {
    const content = await saveSiteContent(payload);
    revalidatePath("/");
    return NextResponse.json({ content });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save content to Supabase.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

