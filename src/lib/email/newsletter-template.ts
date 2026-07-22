import { dailyNewsletterPreview } from "@/content/newsletters/daily-2026-07-21-preview-v1";
import type { NewsletterIssue } from "@/lib/newsletter/types";

const siteUrl = "https://xushure.asia";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderParagraphs(paragraphs: readonly string[]) {
  return paragraphs
    .map(
      (paragraph) =>
        `<p style="font-size:16px;line-height:1.85;color:#4f493f;margin:0 0 16px;">${escapeHtml(paragraph)}</p>`
    )
    .join("");
}

function renderSourceLinks(
  links: readonly { readonly label: string; readonly url: string }[]
) {
  return links
    .map(
      ({ label, url }) =>
        `<a href="${escapeHtml(url)}" style="color:#8a5b45;text-decoration:underline;text-underline-offset:3px;">${escapeHtml(label)} ↗</a>`
    )
    .join("<br>");
}

function createPlainText(issue: NewsletterIssue, unsubscribeUrl: string) {
  const news = issue.news
    .map(
      (item, index) => `${String(index + 1).padStart(2, "0")} · ${item.title}

${item.paragraphs.join("\n\n")}

来源：
${item.sourceLinks.map((source) => `${source.label}\n${source.url}`).join("\n")}`
    )
    .join("\n\n");

  return `${issue.eyebrow}

${issue.subject}

${issue.opening.join("\n\n")}

今日要闻

${news}

PM 视角｜${issue.pmView.title}

${issue.pmView.paragraphs.join("\n\n")}

${issue.pmView.note}

${issue.practical.title}

${issue.practical.intro}

${issue.practical.prompt}

${issue.practical.note}

来源：${issue.practical.source.label}
${issue.practical.source.url}

${issue.fieldNote.title}

${issue.fieldNote.paragraphs.join("\n\n")}

来源：${issue.fieldNote.source.label}
${issue.fieldNote.source.url}

${issue.closing.join("\n\n")}

内容 feed：${issue.provenance.feedSource}
退订：${unsubscribeUrl}

open letters`;
}

export function createNewsletterEmail(
  issue: NewsletterIssue,
  unsubscribeToken: string
) {
  const unsubscribeUrl = `${siteUrl}/unsubscribe?token=${encodeURIComponent(unsubscribeToken)}`;
  const hero = issue.illustrations[0];
  const secondary = issue.illustrations[1];

  if (!hero || !secondary) {
    throw new Error("Newsletter requires two illustrations.");
  }

  const newsHtml = issue.news
    .map(
      (item, index) => `<tr>
        <td style="padding:0 40px 34px;">
          <div style="font-size:11px;letter-spacing:.14em;color:#b45335;margin-bottom:10px;">${String(index + 1).padStart(2, "0")} · TODAY</div>
          <h2 style="font-size:22px;line-height:1.45;font-weight:600;color:#252018;margin:0 0 16px;">${escapeHtml(item.title)}</h2>
          ${renderParagraphs(item.paragraphs)}
          <p style="font-size:12px;line-height:1.75;color:#8a8175;margin:4px 0 0;">来源：${renderSourceLinks(item.sourceLinks)}</p>
        </td>
      </tr>`
    )
    .join("");

  return {
    issueId: issue.issueId,
    subject: issue.subject,
    text: createPlainText(issue, unsubscribeUrl),
    html: `<!doctype html>
<html lang="zh-CN">
  <body style="margin:0;background:#f2ede3;color:#252018;font-family:Arial,'PingFang SC','Microsoft YaHei',sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(issue.preheader)}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f2ede3;border-collapse:collapse;">
      <tr>
        <td align="center" style="padding:36px 14px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:680px;background:#fffdf8;border:1px solid #d9d0c1;border-collapse:collapse;">
            <tr>
              <td style="padding:30px 40px 18px;border-bottom:1px solid #e5ddd0;">
                <div style="font-size:14px;letter-spacing:.16em;text-transform:lowercase;">open letters <span style="color:#c65a3a;">.</span></div>
              </td>
            </tr>
            <tr>
              <td style="padding:40px 40px 24px;">
                <div style="font-size:11px;letter-spacing:.14em;color:#8a5b45;margin-bottom:16px;">${escapeHtml(issue.eyebrow)}</div>
                <h1 style="font-size:31px;line-height:1.36;font-weight:500;margin:0 0 22px;color:#252018;">${escapeHtml(issue.subject)}</h1>
                ${renderParagraphs(issue.opening)}
              </td>
            </tr>
            <tr>
              <td style="padding:0 24px 38px;">
                <img src="cid:${hero.cid}" alt="${escapeHtml(hero.alt)}" width="632" style="display:block;width:100%;height:auto;border:0;" />
              </td>
            </tr>
            <tr>
              <td style="padding:0 40px 30px;">
                <div style="font-size:12px;letter-spacing:.14em;color:#8a5b45;padding-top:26px;border-top:1px solid #ded5c8;">今日要闻</div>
              </td>
            </tr>
            ${newsHtml}
            <tr>
              <td style="padding:4px 40px 38px;">
                <div style="background:#f5efe5;border-left:4px solid #c65a3a;padding:26px 25px 22px;">
                  <div style="font-size:11px;letter-spacing:.14em;color:#8a5b45;margin-bottom:12px;">PM 视角</div>
                  <h2 style="font-size:22px;line-height:1.45;font-weight:600;margin:0 0 16px;">${escapeHtml(issue.pmView.title)}</h2>
                  ${renderParagraphs(issue.pmView.paragraphs)}
                  <p style="font-size:12px;line-height:1.7;color:#8a8175;margin:5px 0 0;">${escapeHtml(issue.pmView.note)}</p>
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:0 40px 18px;">
                <div style="font-size:12px;letter-spacing:.14em;color:#8a5b45;padding-top:28px;border-top:1px solid #ded5c8;">可用的东西</div>
                <h2 style="font-size:22px;line-height:1.45;font-weight:600;margin:14px 0 16px;">${escapeHtml(issue.practical.title)}</h2>
                ${renderParagraphs([issue.practical.intro])}
                <div style="background:#252018;color:#fffdf8;padding:24px 23px;margin:18px 0 18px;white-space:pre-wrap;font-family:Consolas,'SFMono-Regular',monospace;font-size:13px;line-height:1.75;">${escapeHtml(issue.practical.prompt)}</div>
                <p style="font-size:14px;line-height:1.75;color:#6d655a;margin:0 0 12px;">${escapeHtml(issue.practical.note)}</p>
                <p style="font-size:12px;line-height:1.7;color:#8a8175;margin:0;">来源：${renderSourceLinks([issue.practical.source])}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 24px 26px;">
                <img src="cid:${secondary.cid}" alt="${escapeHtml(secondary.alt)}" width="632" style="display:block;width:100%;height:auto;border:0;" />
              </td>
            </tr>
            <tr>
              <td style="padding:0 40px 34px;">
                <h2 style="font-size:22px;line-height:1.45;font-weight:600;margin:0 0 16px;">${escapeHtml(issue.fieldNote.title)}</h2>
                ${renderParagraphs(issue.fieldNote.paragraphs)}
                <p style="font-size:12px;line-height:1.7;color:#8a8175;margin:0;">来源：${renderSourceLinks([issue.fieldNote.source])}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:4px 40px 42px;">
                <div style="border-top:1px solid #ded5c8;padding-top:28px;">
                  ${renderParagraphs(issue.closing)}
                  <p style="font-size:14px;line-height:1.7;color:#6d655a;margin:26px 0 0;">明早见。<br>open letters</p>
                </div>
              </td>
            </tr>
            <tr>
              <td style="background:#ede6da;padding:24px 40px 28px;">
                <p style="font-size:11px;line-height:1.75;color:#7d7468;margin:0 0 8px;">资讯由 <a href="${escapeHtml(issue.provenance.feedSource)}" style="color:#6d655a;">Follow Builders</a> feed 获取，编辑与判断由 open letters 完成。</p>
                <p style="font-size:11px;line-height:1.75;color:#7d7468;margin:0;">你收到这封邮件，是因为你订阅了 open letters。<a href="${unsubscribeUrl}" style="color:#6d655a;">退订</a></p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`,
    unsubscribeUrl
  };
}

export function createDailyNewsletterPreviewEmail(unsubscribeToken: string) {
  return createNewsletterEmail(
    dailyNewsletterPreview as NewsletterIssue,
    unsubscribeToken
  );
}
