import { NextResponse } from "next/server";
import { sendWelcomeEmailOnce } from "@/lib/email/send-welcome";
import { EMAIL_PATTERN } from "@/lib/subscription";
import { upsertSubscriber } from "@/lib/supabase-admin";

type SubscribeRequestBody = {
  email?: unknown;
  source?: unknown;
};

function normalizeEmail(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function normalizeSource(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : "homepage";
}

export async function POST(request: Request) {
  let body: SubscribeRequestBody;

  try {
    body = (await request.json()) as SubscribeRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const email = normalizeEmail(body.email);

  if (!email) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }

  if (!EMAIL_PATTERN.test(email)) {
    return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
  }

  const source = normalizeSource(body.source);
  const now = new Date().toISOString();
  const unsubscribeToken = crypto.randomUUID();

  try {
    const subscriber = await upsertSubscriber({
      email,
      source,
      unsubscribeToken,
      updatedAt: now
    });
    const welcomeEmail = await sendWelcomeEmailOnce(subscriber);

    return NextResponse.json({ ok: true, welcomeEmail });
  } catch (error) {
    console.error("Could not subscribe email.", error);
    return NextResponse.json({ error: "Could not subscribe email." }, { status: 502 });
  }
}
