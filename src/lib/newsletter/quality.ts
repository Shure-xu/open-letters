import type {
  GeneratedNewsletterContent,
  NewsletterSourceLink
} from "@/lib/newsletter/types";

const BANNED_PATTERNS = [
  "至关重要",
  "赋能",
  "重塑格局",
  "综上所述",
  "值得注意的是",
  "这不仅",
  "不仅仅是",
  "—"
];

function assertString(value: unknown, label: string, minLength = 1) {
  if (typeof value !== "string" || value.trim().length < minLength) {
    throw new Error(`${label} is invalid.`);
  }
}

function assertStringArray(
  value: unknown,
  label: string,
  minItems: number,
  maxItems: number
) {
  if (
    !Array.isArray(value) ||
    value.length < minItems ||
    value.length > maxItems
  ) {
    throw new Error(`${label} must contain ${minItems}-${maxItems} items.`);
  }

  value.forEach((item, index) =>
    assertString(item, `${label}[${index}]`, 8)
  );
}

function assertSource(
  source: NewsletterSourceLink,
  label: string,
  allowedUrls: Set<string>
) {
  assertString(source?.label, `${label}.label`, 2);
  assertString(source?.url, `${label}.url`, 10);

  if (!allowedUrls.has(source.url)) {
    throw new Error(`${label} uses a URL that is not in the source feed.`);
  }
}

function collectText(content: GeneratedNewsletterContent) {
  return [
    content.subject,
    content.preheader,
    ...content.opening,
    ...content.news.flatMap((item) => [item.title, ...item.paragraphs]),
    content.pmView.title,
    ...content.pmView.paragraphs,
    content.pmView.note,
    content.practical.title,
    content.practical.intro,
    content.practical.prompt,
    content.practical.note,
    content.fieldNote.title,
    ...content.fieldNote.paragraphs,
    ...content.closing
  ].join("\n");
}

export function validateGeneratedContent(
  value: unknown,
  allowedUrls: Set<string>
): asserts value is GeneratedNewsletterContent {
  if (!value || typeof value !== "object") {
    throw new Error("Generated issue is not an object.");
  }

  const content = value as GeneratedNewsletterContent;
  assertString(content.subject, "subject", 8);
  assertString(content.preheader, "preheader", 12);

  if (content.subject.length > 48 || content.preheader.length > 100) {
    throw new Error("Subject or preheader is too long.");
  }

  assertStringArray(content.opening, "opening", 2, 2);

  if (!Array.isArray(content.news) || content.news.length < 3 || content.news.length > 4) {
    throw new Error("news must contain 3-4 items.");
  }

  content.news.forEach((item, itemIndex) => {
    assertString(item.title, `news[${itemIndex}].title`, 6);
    assertStringArray(
      item.paragraphs,
      `news[${itemIndex}].paragraphs`,
      2,
      3
    );

    if (!Array.isArray(item.sourceLinks) || item.sourceLinks.length < 1) {
      throw new Error(`news[${itemIndex}].sourceLinks is empty.`);
    }

    item.sourceLinks.forEach((source: NewsletterSourceLink, sourceIndex: number) =>
      assertSource(
        source,
        `news[${itemIndex}].sourceLinks[${sourceIndex}]`,
        allowedUrls
      )
    );
  });

  assertString(content.pmView?.title, "pmView.title", 6);
  assertStringArray(content.pmView?.paragraphs, "pmView.paragraphs", 2, 4);
  assertString(content.pmView?.note, "pmView.note", 8);
  assertString(content.practical?.title, "practical.title", 6);
  assertString(content.practical?.intro, "practical.intro", 12);
  assertString(content.practical?.prompt, "practical.prompt", 80);
  assertString(content.practical?.note, "practical.note", 8);
  assertSource(content.practical?.source, "practical.source", allowedUrls);
  assertString(content.fieldNote?.title, "fieldNote.title", 6);
  assertStringArray(
    content.fieldNote?.paragraphs,
    "fieldNote.paragraphs",
    2,
    3
  );
  assertSource(content.fieldNote?.source, "fieldNote.source", allowedUrls);
  assertStringArray(content.closing, "closing", 2, 2);

  if (!Array.isArray(content.illustrations) || content.illustrations.length !== 2) {
    throw new Error("illustrations must contain exactly 2 items.");
  }

  content.illustrations.forEach((illustration, index) => {
    assertString(illustration.alt, `illustrations[${index}].alt`, 8);
    assertString(illustration.theme, `illustrations[${index}].theme`, 6);
    assertString(illustration.coreIdea, `illustrations[${index}].coreIdea`, 10);
    assertString(
      illustration.composition,
      `illustrations[${index}].composition`,
      20
    );

    if (
      !Array.isArray(illustration.labels) ||
      illustration.labels.length < 2 ||
      illustration.labels.length > 5 ||
      illustration.labels.some(
        (label: string) => typeof label !== "string" || label.length > 8
      )
    ) {
      throw new Error(`illustrations[${index}].labels is invalid.`);
    }
  });

  const allText = collectText(content);
  const chineseCharacters = allText.match(/[\u3400-\u9fff]/g)?.length ?? 0;

  if (chineseCharacters < 1_000 || chineseCharacters > 2_800) {
    throw new Error(
      `Newsletter length is outside the quality range (${chineseCharacters}).`
    );
  }

  const banned = BANNED_PATTERNS.find((pattern) => allText.includes(pattern));

  if (banned) {
    throw new Error(`Newsletter contains banned AI-writing pattern: ${banned}`);
  }
}
