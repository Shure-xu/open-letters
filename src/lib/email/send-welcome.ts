import { createAliyunTransport, getNewsletterSender } from "@/lib/email/aliyun";
import { createWelcomeEmail } from "@/lib/email/welcome-template";
import {
  reserveEmailSend,
  type Subscriber,
  updateEmailSend
} from "@/lib/supabase-admin";

const WELCOME_ISSUE_ID = "welcome-v1";

export async function sendWelcomeEmailOnce(subscriber: Subscriber) {
  const reservation = await reserveEmailSend(subscriber.id, WELCOME_ISSUE_ID);

  if (reservation === "existing") return "already-sent" as const;

  try {
    const transport = createAliyunTransport();
    const template = createWelcomeEmail(subscriber.unsubscribe_token);
    const info = await transport.sendMail({
      from: getNewsletterSender(),
      to: subscriber.email,
      subject: template.subject,
      text: template.text,
      html: template.html,
      headers: {
        "List-Unsubscribe": `<${template.unsubscribeUrl}>`
      }
    });
    const sentAt = new Date().toISOString();

    await updateEmailSend(subscriber.id, WELCOME_ISSUE_ID, {
      status: "sent",
      providerMessageId: info.messageId,
      sentAt
    });

    return "sent" as const;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    try {
      await updateEmailSend(subscriber.id, WELCOME_ISSUE_ID, {
        status: "failed",
        errorMessage
      });
    } catch (logError) {
      console.error("Could not record welcome email failure.", logError);
    }

    console.error("Could not send welcome email.", error);
    return "failed" as const;
  }
}
