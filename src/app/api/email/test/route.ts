import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { createAliyunTransport, getNewsletterSender } from "@/lib/email/aliyun";
import {
  createEmailSendLog,
  getActiveSubscribers
} from "@/lib/supabase-admin";

export const runtime = "nodejs";

function isAuthorized(request: Request) {
  const expected = process.env.EMAIL_TEST_SECRET;
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

  const subscribers = await getActiveSubscribers();

  if (subscribers.length === 0) {
    return NextResponse.json({ error: "No active subscribers." }, { status: 409 });
  }

  if (subscribers.length > 5) {
    return NextResponse.json(
      { error: "Safety limit exceeded; test route sends to at most 5 recipients." },
      { status: 409 }
    );
  }

  const transport = createAliyunTransport();
  await transport.verify();

  const issueId = `smtp-test-${new Date().toISOString()}`;
  let sent = 0;
  let failed = 0;

  for (const subscriber of subscribers) {
    try {
      const info = await transport.sendMail({
        from: getNewsletterSender(),
        to: subscriber.email,
        subject: "[测试] open letters 邮件推送已连接",
        text:
          "这是一封 open letters 的阿里云邮件推送测试邮件。你收到这封邮件，说明订阅邮箱、Supabase、Vercel 与阿里云 SMTP 的发送链路已经连通。",
        html: `<!doctype html><html lang="zh-CN"><body style="margin:0;background:#f5f1e8;color:#201d18;font-family:Arial,'PingFang SC','Microsoft YaHei',sans-serif"><div style="max-width:620px;margin:0 auto;padding:48px 24px"><div style="font-size:14px;letter-spacing:.12em">open letters .</div><h1 style="font-size:30px;line-height:1.3;margin:32px 0 16px">邮件推送连接成功</h1><p style="font-size:16px;line-height:1.8;margin:0 0 18px">这是一封阿里云邮件推送测试邮件。</p><p style="font-size:16px;line-height:1.8;margin:0">你收到这封邮件，说明订阅邮箱、Supabase、Vercel 与阿里云 SMTP 的发送链路已经连通。</p><p style="font-size:13px;color:#71695d;margin-top:40px">这不是正式 newsletter，无需操作。</p></div></body></html>`
      });
      const sentAt = new Date().toISOString();

      await createEmailSendLog({
        subscriberId: subscriber.id,
        issueId,
        status: "sent",
        providerMessageId: info.messageId,
        sentAt
      });
      sent += 1;
    } catch (error) {
      await createEmailSendLog({
        subscriberId: subscriber.id,
        issueId,
        status: "failed",
        errorMessage: error instanceof Error ? error.message : "Unknown error"
      });
      failed += 1;
    }
  }

  return NextResponse.json({ ok: failed === 0, attempted: subscribers.length, sent, failed });
}
