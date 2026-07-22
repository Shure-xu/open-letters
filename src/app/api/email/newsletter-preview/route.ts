import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { sendDailyNewsletterPreview } from "@/lib/email/send-newsletter-preview";
import { getActiveSubscribers } from "@/lib/supabase-admin";

export const runtime = "nodejs";

function isAuthorized(request: Request) {
  const expected = process.env.NEWSLETTER_PREVIEW_SECRET;
  const received = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

  if (!expected || !received) return false;

  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(received);

  return (
    expectedBuffer.length === receivedBuffer.length &&
    timingSafeEqual(expectedBuffer, receivedBuffer)
  );
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const subscribers = await getActiveSubscribers();

    if (subscribers.length === 0) {
      return NextResponse.json(
        { error: "No active subscribers." },
        { status: 409 }
      );
    }

    if (subscribers.length > 5) {
      return NextResponse.json(
        {
          error:
            "Safety limit exceeded; preview route sends to at most 5 recipients."
        },
        { status: 409 }
      );
    }

    const result = await sendDailyNewsletterPreview(subscribers);

    return NextResponse.json({ ok: result.failed === 0, ...result });
  } catch (error) {
    console.error("Could not send newsletter preview.", error);
    return NextResponse.json(
      { error: "Could not send newsletter preview." },
      { status: 500 }
    );
  }
}
