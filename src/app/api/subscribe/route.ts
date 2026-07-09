import { NextResponse } from "next/server";
import { EMAIL_PATTERN } from "@/lib/subscription";

type SubscribeRequestBody = {
  email?: unknown;
  source?: unknown;
};

const SUPABASE_URL =
  process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

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

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json(
      { error: "Subscription service is not configured." },
      { status: 500 }
    );
  }

  const source = normalizeSource(body.source);
  const now = new Date().toISOString();
  const unsubscribeToken = crypto.randomUUID();
  const endpoint = `${SUPABASE_URL.replace(/\/$/, "")}/rest/v1/subscribers?on_conflict=email`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=representation"
    },
    body: JSON.stringify({
      email,
      status: "active",
      source,
      unsubscribe_token: unsubscribeToken,
      updated_at: now
    })
  });

  if (!response.ok) {
    const details = await response.text();

    return NextResponse.json(
      { error: "Could not subscribe email.", details },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
