import { readFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";
import { dailyNewsletterPreview } from "@/content/newsletters/daily-2026-07-21-preview-v1";
import { archiveNewsletterIssue } from "@/lib/newsletter/archive";
import { createNewsletterMarkdown } from "@/lib/newsletter/markdown";
import type {
  NewsletterImageAsset,
  NewsletterIssue
} from "@/lib/newsletter/types";

export async function archiveApprovedNewsletterPreview() {
  const issue = dailyNewsletterPreview as NewsletterIssue;
  const images: NewsletterImageAsset[] = await Promise.all(
    issue.illustrations.map(async (illustration) => {
      const content = await readFile(
        join(
          process.cwd(),
          "public",
          "newsletters",
          issue.issueId,
          illustration.filename
        )
      );
      const metadata = await sharp(content).metadata();

      if (!metadata.width || !metadata.height) {
        throw new Error(`Could not inspect ${illustration.filename}.`);
      }

      return {
        cid: illustration.cid,
        filename: illustration.filename,
        content,
        contentType: "image/png" as const,
        width: metadata.width,
        height: metadata.height
      };
    })
  );
  const markdown = createNewsletterMarkdown(issue);

  return archiveNewsletterIssue({
    issue,
    markdown,
    images,
    status: "approved-preview-sent",
    sendResult: {
      attempted: 1,
      sent: 1,
      failed: 0,
      skipped: 0
    }
  });
}
