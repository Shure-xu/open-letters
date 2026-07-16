const siteUrl = "https://xushure.asia";

export function createWelcomeEmail(unsubscribeToken: string) {
  const unsubscribeUrl = `${siteUrl}/unsubscribe?token=${encodeURIComponent(unsubscribeToken)}`;

  return {
    subject: "欢迎加入 open letters｜明早 8 点见",
    text: `欢迎加入 open letters。

从现在开始，我们会在每天早上 8:00 为你送上一封关于 AI 的信。

每封信包含：
1. 今日要闻：筛选真正值得关注的模型、产品和行业动态。
2. PM 视角：解释一条关键新闻对产品意味着什么。
3. 可用的东西：一个当天就能使用的工具、提示词或数据点。

阅读指南：整封信约 5 分钟读完；如果暂时没有看到邮件，请检查垃圾邮件或推广分类，并把 newsletter@mail.xushure.asia 加入联系人。

访问 open letters：${siteUrl}

如果不想继续收到邮件，可以退订：${unsubscribeUrl}

感谢订阅，我们明早见。
open letters`,
    html: `<!doctype html>
<html lang="zh-CN">
  <body style="margin:0;background:#f2ede3;color:#252018;font-family:Arial,'PingFang SC','Microsoft YaHei',sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">欢迎加入 open letters，每天早上 8:00，一封关于 AI 的信。</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f2ede3;border-collapse:collapse;">
      <tr>
        <td align="center" style="padding:40px 16px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#fffdf8;border:1px solid #d9d0c1;border-collapse:collapse;">
            <tr>
              <td style="padding:34px 40px 18px;border-bottom:1px solid #e5ddd0;">
                <div style="font-size:14px;letter-spacing:.16em;text-transform:lowercase;">open letters <span style="color:#c65a3a;">.</span></div>
              </td>
            </tr>
            <tr>
              <td style="padding:44px 40px 20px;">
                <div style="font-size:12px;letter-spacing:.12em;color:#8a5b45;margin-bottom:16px;">WELCOME LETTER</div>
                <h1 style="font-size:32px;line-height:1.35;font-weight:500;margin:0 0 20px;">欢迎加入，明早 8 点见</h1>
                <p style="font-size:16px;line-height:1.85;margin:0;color:#4f493f;">从现在开始，我们会在每天早上 8:00 为你送上一封关于 AI 的信。信息不缺，我们更在意筛选、判断，以及它对产品意味着什么。</p>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 40px 8px;">
                <div style="border-top:1px solid #ded5c8;padding-top:28px;">
                  <h2 style="font-size:19px;font-weight:600;margin:0 0 18px;">每封信里有什么</h2>
                  <p style="font-size:15px;line-height:1.8;margin:0 0 13px;"><strong>01 · 今日要闻</strong><br><span style="color:#6d655a;">筛选真正值得关注的模型、产品和行业动态。</span></p>
                  <p style="font-size:15px;line-height:1.8;margin:0 0 13px;"><strong>02 · PM 视角</strong><br><span style="color:#6d655a;">解释一条关键新闻对产品意味着什么。</span></p>
                  <p style="font-size:15px;line-height:1.8;margin:0;"><strong>03 · 可用的东西</strong><br><span style="color:#6d655a;">一个当天就能使用的工具、提示词或数据点。</span></p>
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:30px 40px 18px;">
                <div style="background:#f5efe5;padding:22px 24px;">
                  <h2 style="font-size:17px;font-weight:600;margin:0 0 10px;">阅读指南</h2>
                  <p style="font-size:14px;line-height:1.75;color:#625b51;margin:0;">整封信约 5 分钟读完。如果暂时没有看到邮件，请检查垃圾邮件或推广分类，并把 <strong>newsletter@mail.xushure.asia</strong> 加入联系人。</p>
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 40px 42px;">
                <a href="${siteUrl}" style="display:inline-block;background:#252018;color:#fffdf8;text-decoration:none;font-size:14px;padding:13px 20px;">访问 open letters</a>
                <p style="font-size:14px;line-height:1.7;color:#6d655a;margin:28px 0 0;">感谢订阅，我们明早见。<br>open letters</p>
                <p style="font-size:12px;line-height:1.7;color:#8a8175;margin:28px 0 0;">你收到这封邮件，是因为你在 open letters 主动提交了邮箱。如果不想继续收到邮件，可以<a href="${unsubscribeUrl}" style="color:#6d655a;">在这里退订</a>。</p>
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
