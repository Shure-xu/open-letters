import { sendNewsletterIssue } from "@/lib/email/send-newsletter";
import { archiveNewsletterIssue } from "@/lib/newsletter/archive";
import { generateNewsletterImage } from "@/lib/newsletter/ai-client";
import { createEditedNewsletterContent } from "@/lib/newsletter/editorial";
import { prepareFollowBuildersFeed } from "@/lib/newsletter/feeds";
import { createNewsletterMarkdown } from "@/lib/newsletter/markdown";
import type {
  NewsletterIllustration,
  NewsletterIssue,
  NewsletterRunResult
} from "@/lib/newsletter/types";
import {
  getActiveSubscribers,
  hasSuccessfulEmailSend
} from "@/lib/supabase-admin";

function chinaDateParts(now: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(now);
  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value])
  );

  return {
    date: `${values.year}-${values.month}-${values.day}`,
    eyebrow: `${values.year}.${values.month}.${values.day} · DAILY LETTER`
  };
}

function createIllustrations(
  specs: Array<{
    alt: string;
    theme: string;
    coreIdea: string;
    composition: string;
    labels: string[];
  }>
): NewsletterIllustration[] {
  return specs.map((spec, index) => ({
    ...spec,
    cid: `daily-illustration-${index + 1}@openletters`,
    filename: `${String(index + 1).padStart(2, "0")}-${
      index === 0 ? "hero" : "field-note"
    }.png`
  }));
}

export async function runDailyNewsletterWorkflow(input?: {
  dryRun?: boolean;
  now?: Date;
}): Promise<NewsletterRunResult> {
  const dryRun = input?.dryRun ?? false;
  const now = input?.now ?? new Date();
  const { date, eyebrow } = chinaDateParts(now);
  const issueId = `daily-${date}-v1`;

  if (!dryRun && (await hasSuccessfulEmailSend(issueId))) {
    return { ok: true, status: "duplicate", issueId };
  }

  const feed = await prepareFollowBuildersFeed(now);
  const content = await createEditedNewsletterContent(date, feed);
  const illustrations = createIllustrations(content.illustrations);
  const issue: NewsletterIssue = {
    issueId,
    date,
    subject: content.subject,
    preheader: content.preheader,
    eyebrow,
    opening: content.opening,
    news: content.news,
    pmView: content.pmView,
    practical: content.practical,
    fieldNote: content.fieldNote,
    closing: content.closing,
    illustrations,
    provenance: {
      generatedAt: new Date().toISOString(),
      feedGeneratedAt: feed.feedGeneratedAt,
      feedSource: feed.feedSource,
      sourceCount: feed.candidates.length
    }
  };
  const images = await Promise.all(
    illustrations.map((illustration) =>
      generateNewsletterImage(illustration, issue.subject)
    )
  );
  const markdown = createNewsletterMarkdown(issue);

  await archiveNewsletterIssue({
    issue,
    markdown,
    images,
    status: dryRun ? "dry-run" : "generated"
  });

  if (dryRun) {
    return {
      ok: true,
      status: "dry-run",
      issueId,
      sourceCount: feed.candidates.length
    };
  }

  const subscribers = await getActiveSubscribers();

  if (subscribers.length === 0) {
    await archiveNewsletterIssue({
      issue,
      markdown,
      images,
      status: "no-subscribers"
    });

    return {
      ok: true,
      status: "no-subscribers",
      issueId,
      sourceCount: feed.candidates.length,
      attempted: 0,
      sent: 0,
      failed: 0,
      skipped: 0
    };
  }

  const sendResult = await sendNewsletterIssue(issue, subscribers, images);

  await archiveNewsletterIssue({
    issue,
    markdown,
    images,
    status: sendResult.failed === 0 ? "sent" : "partially-failed",
    sendResult
  });

  return {
    ok: sendResult.failed === 0,
    status: "sent",
    issueId,
    sourceCount: feed.candidates.length,
    ...sendResult
  };
}
