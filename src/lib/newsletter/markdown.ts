import type { NewsletterIssue } from "@/lib/newsletter/types";

function sourceMarkdown(label: string, url: string) {
  return `[${label}](${url})`;
}

export function createNewsletterMarkdown(issue: NewsletterIssue) {
  const news = issue.news
    .map(
      (item) => `### ${item.title}

${item.paragraphs.join("\n\n")}

来源：${item.sourceLinks
        .map((source) => sourceMarkdown(source.label, source.url))
        .join("、")}`
    )
    .join("\n\n");

  return `---
issueId: ${JSON.stringify(issue.issueId)}
status: "generated"
date: ${JSON.stringify(issue.date)}
subject: ${JSON.stringify(issue.subject)}
preheader: ${JSON.stringify(issue.preheader)}
generatedAt: ${JSON.stringify(issue.provenance.generatedAt)}
feedGeneratedAt: ${JSON.stringify(issue.provenance.feedGeneratedAt)}
sourceCount: ${issue.provenance.sourceCount}
---

# ${issue.subject}

${issue.opening.join("\n\n")}

![${issue.illustrations[0].alt}](./${issue.illustrations[0].filename})

## 今日要闻

${news}

## PM 视角

### ${issue.pmView.title}

${issue.pmView.paragraphs.join("\n\n")}

> ${issue.pmView.note}

## 可用的东西

### ${issue.practical.title}

${issue.practical.intro}

\`\`\`text
${issue.practical.prompt}
\`\`\`

${issue.practical.note}

来源：${sourceMarkdown(
    issue.practical.source.label,
    issue.practical.source.url
  )}

![${issue.illustrations[1].alt}](./${issue.illustrations[1].filename})

## ${issue.fieldNote.title}

${issue.fieldNote.paragraphs.join("\n\n")}

来源：${sourceMarkdown(
    issue.fieldNote.source.label,
    issue.fieldNote.source.url
  )}

## 结尾

${issue.closing.join("\n\n")}

---

资讯 feed：[Follow Builders](${issue.provenance.feedSource})
`;
}
