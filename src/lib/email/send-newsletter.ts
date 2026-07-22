import { createAliyunTransport, getNewsletterSender } from "@/lib/email/aliyun";
import { createNewsletterEmail } from "@/lib/email/newsletter-template";
import type {
  NewsletterImageAsset,
  NewsletterIssue
} from "@/lib/newsletter/types";
import {
  markSubscriberLastSent,
  reserveEmailSend,
  type Subscriber,
  updateEmailSend
} from "@/lib/supabase-admin";

export async function sendNewsletterIssue(
  issue: NewsletterIssue,
  subscribers: Subscriber[],
  images: NewsletterImageAsset[]
) {
  const transport = createAliyunTransport();
  await transport.verify();
  const attachments = images.map((image) => ({
    filename: image.filename,
    content: image.content,
    contentType: image.contentType,
    contentDisposition: "inline" as const,
    cid: image.cid
  }));
  let sent = 0;
  let failed = 0;
  let skipped = 0;

  for (const subscriber of subscribers) {
    const reservation = await reserveEmailSend(subscriber.id, issue.issueId);

    if (reservation === "existing") {
      skipped += 1;
      continue;
    }

    const template = createNewsletterEmail(issue, subscriber.unsubscribe_token);

    try {
      const info = await transport.sendMail({
        from: getNewsletterSender(),
        to: subscriber.email,
        subject: template.subject,
        text: template.text,
        html: template.html,
        attachments,
        headers: {
          "List-Unsubscribe": `<${template.unsubscribeUrl}>`
        }
      });
      const sentAt = new Date().toISOString();

      await updateEmailSend(subscriber.id, issue.issueId, {
        status: "sent",
        providerMessageId: info.messageId,
        sentAt
      });
      await markSubscriberLastSent(subscriber.id);
      sent += 1;
    } catch (error) {
      await updateEmailSend(subscriber.id, issue.issueId, {
        status: "failed",
        errorMessage: error instanceof Error ? error.message : "Unknown error"
      });
      failed += 1;
    }
  }

  return { attempted: subscribers.length, sent, failed, skipped };
}
