import { NextResponse } from "next/server";
import { unsubscribeSubscriber } from "@/lib/supabase-admin";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  let token = "";

  try {
    const body = (await request.json()) as { token?: unknown };
    token = typeof body.token === "string" ? body.token.trim() : "";
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!UUID_PATTERN.test(token)) {
    return NextResponse.json({ error: "Invalid unsubscribe link." }, { status: 400 });
  }

  try {
    const found = await unsubscribeSubscriber(token);

    if (!found) {
      return NextResponse.json({ error: "Unsubscribe link not found." }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Could not unsubscribe email.", error);
    return NextResponse.json({ error: "Could not unsubscribe email." }, { status: 502 });
  }
}
