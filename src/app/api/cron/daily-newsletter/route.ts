import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { ensureNewsletterArchiveBucket } from "@/lib/newsletter/archive";
import { archiveApprovedNewsletterPreview } from "@/lib/newsletter/archive-approved-preview";
import { runDailyNewsletterWorkflow } from "@/lib/newsletter/workflow";

export const runtime = "nodejs";
export const maxDuration = 300;

function matchesBearer(request: Request, expected: string | undefined) {
  const received = request.headers
    .get("authorization")
    ?.replace(/^Bearer\s+/i, "");

  if (!expected || !received) return false;

  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(received);

  return (
    expectedBuffer.length === receivedBuffer.length &&
    timingSafeEqual(expectedBuffer, receivedBuffer)
  );
}

async function run(dryRun: boolean) {
  try {
    const result = await runDailyNewsletterWorkflow({ dryRun });

    return NextResponse.json(result, { status: result.ok ? 200 : 500 });
  } catch (error) {
    console.error("Daily newsletter workflow failed.", error);
    return NextResponse.json(
      {
        ok: false,
        error: "Daily newsletter workflow failed. No email was sent."
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  if (!matchesBearer(request, process.env.CRON_SECRET)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  return run(false);
}

export async function POST(request: Request) {
  if (!matchesBearer(request, process.env.NEWSLETTER_PREVIEW_SECRET)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    dryRun?: boolean;
    ensureArchiveOnly?: boolean;
    archiveApprovedPreviewOnly?: boolean;
  };

  if (body.ensureArchiveOnly) {
    try {
      const bucket = await ensureNewsletterArchiveBucket();
      return NextResponse.json({
        ok: true,
        status: "archive-ready",
        bucket: {
          id: bucket.id,
          name: bucket.name,
          public: bucket.public
        }
      });
    } catch (error) {
      console.error("Could not initialize newsletter archive.", error);
      return NextResponse.json(
        { ok: false, error: "Could not initialize newsletter archive." },
        { status: 500 }
      );
    }
  }

  if (body.archiveApprovedPreviewOnly) {
    try {
      const archive = await archiveApprovedNewsletterPreview();
      return NextResponse.json({
        ok: true,
        status: "approved-preview-archived",
        ...archive
      });
    } catch (error) {
      console.error("Could not archive the approved newsletter preview.", error);
      return NextResponse.json(
        { ok: false, error: "Could not archive approved newsletter preview." },
        { status: 500 }
      );
    }
  }

  return run(body.dryRun ?? true);
}
