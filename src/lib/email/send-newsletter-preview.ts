import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { dailyNewsletterPreview } from "@/content/newsletters/daily-2026-07-21-preview-v1";
import type { Subscriber } from "@/lib/supabase-admin";
import { sendNewsletterIssue } from "@/lib/email/send-newsletter";
import type { NewsletterIssue } from "@/lib/newsletter/types";

async function createInlineAttachments() {
  const illustrations = dailyNewsletterPreview.illustrations;

  return Promise.all(
    illustrations.map(async (illustration) => ({
      filename: illustration.filename,
      content: await readFile(
        join(
          process.cwd(),
          "public",
          "newsletters",
          dailyNewsletterPreview.issueId,
          illustration.filename
        )
      ),
      contentType: "image/png" as const,
      cid: illustration.cid,
      width: 1_672,
      height: 941
    }))
  );
}

export async function sendDailyNewsletterPreview(subscribers: Subscriber[]) {
  const attachments = await createInlineAttachments();
  const result = await sendNewsletterIssue(
    dailyNewsletterPreview as NewsletterIssue,
    subscribers,
    attachments
  );

  return {
    issueId: dailyNewsletterPreview.issueId,
    ...result
  };
}
