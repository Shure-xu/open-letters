import { callAiJson } from "@/lib/newsletter/ai-client";
import type { FeedCandidate, PreparedFeed } from "@/lib/newsletter/feeds";
import type { GeneratedNewsletterContent } from "@/lib/newsletter/types";
import { validateGeneratedContent } from "@/lib/newsletter/quality";

function sourceBundle(candidates: FeedCandidate[]) {
  return candidates.map((candidate, index) => ({
    sourceId: `S${String(index + 1).padStart(2, "0")}`,
    ...candidate
  }));
}

function generationPrompt(date: string, candidates: FeedCandidate[]) {
  return `你是 open letters 的中文 newsletter 主编。请从下方唯一允许使用的来源中，生成一期写给 AI 产品经理、创业者和认真做产品的人的每日邮件。

日期：${date}

编辑原则：
1. 只使用来源 JSON 中明确出现的事实、数字、身份、观点和 URL。不得调用常识补背景，不得发明产品功能、引语或发布日期。
2. 选择 3-4 条最值得产品人关注的内容，优先原始判断、具体数字、真实工作流和反直觉观点。跳过个人闲聊、赛事、宣传和无实质内容的动态。
3. 来源事实与 open letters 的编辑判断必须分开。新闻段先说来源事实，再写编辑观察。
4. 全文手机阅读约 5 分钟。中文直接、自然，有一点编辑个人声音，不写新闻稿。
5. 保留 AI、LLM、API、token、prompt、agent、inference、benchmark 等行业常用英文词。
6. 每一个事实段都必须挂来源 JSON 中原样 URL。没有 URL 的内容不能使用。
7. “可用的东西”必须给出今天就能尝试的具体方法或 prompt，并写清权限和失败边界，不能承诺效果。
8. fieldNote 是一条较轻但实用的旁支观察，同样必须来自允许来源。
9. 配图生成两个原创隐喻。每张只讲一个意思，小黑必须承担核心动作。避开传送带、漏斗、拉判断杆、鱼、盖章、三层信息源和正式流程图。
10. 输出严格 JSON，不要 Markdown 代码块，不要解释。

JSON 结构：
{
  "subject": "不超过 48 字",
  "preheader": "不超过 100 字",
  "opening": ["段落一", "段落二"],
  "news": [
    {
      "title": "具体标题",
      "paragraphs": ["来源事实", "编辑观察"],
      "sourceLinks": [{"label":"人物与身份", "url":"来源中的原样 URL", "publishedAt":"来源日期"}]
    }
  ],
  "pmView": {
    "title": "明确但不过度概括的判断",
    "paragraphs": ["两到四段分析"],
    "note": "以上是 open letters 的编辑判断，不是任何单一来源的原话。"
  },
  "practical": {
    "title": "可执行标题",
    "intro": "使用场景和前提",
    "prompt": "不少于 80 字的可复制 prompt",
    "note": "权限、确认或失败边界",
    "source": {"label":"灵感来源", "url":"来源中的原样 URL", "publishedAt":"来源日期"}
  },
  "fieldNote": {
    "title": "一条旁支观察",
    "paragraphs": ["来源事实", "如何使用或如何判断"],
    "source": {"label":"来源", "url":"来源中的原样 URL", "publishedAt":"来源日期"}
  },
  "closing": ["具体问题或观察", "自然收尾"],
  "illustrations": [
    {
      "alt":"图片替代文本",
      "theme":"配图主题",
      "coreIdea":"一个核心意思",
      "composition":"小黑在哪里、做什么、主要物件和信息如何移动",
      "labels":["2-8 字", "2-8 字"]
    }
  ]
}

允许使用的来源 JSON：
${JSON.stringify(sourceBundle(candidates))}`;
}

function humanizerPrompt(
  draft: GeneratedNewsletterContent,
  candidates: FeedCandidate[]
) {
  return `你是 open letters 的中文终审编辑。请对下面的 newsletter JSON 做一次严格去 AI 味编辑，仍然只输出完整合法 JSON。

必须保留：
- 所有事实、数字、人物身份和 URL 的含义。
- JSON 字段和数组结构。
- 3-4 条 news、两个 illustrations。
- 来源 URL 必须逐字来自允许来源列表。

编辑规则：
- 删除填充式开场、宣传腔、模糊归因和通用乐观结尾。
- 避免三段式机械总结、连续相同句长和可摘抄式金句。
- 禁止“至关重要、赋能、重塑格局、综上所述、值得注意的是、这不仅、不仅仅是”。
- 不使用中文破折号“—”。
- 少用“真正、意味着、关键、此外”。可以直接用“是、有、会”。
- 句子长短要变化。适当使用“我更在意的是”“我会先看”，但不要每段都用。
- 编辑判断要明确标成编辑判断，不得写成来源作者原话。
- 不得添加任何来源 JSON 中没有的新事实。
- 最终中文字符约 1000-2800 字。

允许来源：
${JSON.stringify(sourceBundle(candidates))}

待编辑 JSON：
${JSON.stringify(draft)}`;
}

function repairPrompt(
  content: GeneratedNewsletterContent,
  candidates: FeedCandidate[],
  validationError: string
) {
  return `修复下面 newsletter JSON，使其通过质量检查。只输出完整 JSON，不要解释。

检查错误：${validationError}

要求：
- 不增加允许来源之外的事实或 URL。
- 保持自然中文和既有栏目。
- source URL 必须原样取自允许来源。
- 两张配图，每张 labels 为 2-5 个、每个不超过 8 个字。
- 不使用“至关重要、赋能、重塑格局、综上所述、值得注意的是、这不仅、不仅仅是”或中文破折号。

允许来源：
${JSON.stringify(sourceBundle(candidates))}

待修复 JSON：
${JSON.stringify(content)}`;
}

export async function createEditedNewsletterContent(
  date: string,
  feed: PreparedFeed
) {
  const draft = (await callAiJson([
    {
      role: "system",
      content:
        "You are a careful newsletter editor. Never invent facts or URLs. Return JSON only."
    },
    { role: "user", content: generationPrompt(date, feed.candidates) }
  ])) as GeneratedNewsletterContent;
  const edited = (await callAiJson([
    {
      role: "system",
      content:
        "You are a Chinese human editor. Preserve facts and URLs. Return JSON only."
    },
    { role: "user", content: humanizerPrompt(draft, feed.candidates) }
  ])) as GeneratedNewsletterContent;

  try {
    validateGeneratedContent(edited, feed.allowedUrls);
    return edited;
  } catch (error) {
    const repaired = (await callAiJson([
      {
        role: "system",
        content:
          "Repair the supplied JSON without inventing facts. Return JSON only."
      },
      {
        role: "user",
        content: repairPrompt(
          edited,
          feed.candidates,
          error instanceof Error ? error.message : "Unknown validation error"
        )
      }
    ])) as GeneratedNewsletterContent;

    validateGeneratedContent(repaired, feed.allowedUrls);
    return repaired;
  }
}
