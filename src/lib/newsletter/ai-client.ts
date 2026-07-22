import sharp from "sharp";
import type {
  GeneratedNewsletterContent,
  NewsletterImageAsset,
  NewsletterIllustration
} from "@/lib/newsletter/types";

type ChatMessage = {
  role: "system" | "user";
  content: string;
};

function requireEnv(name: string) {
  const value = process.env[name];

  if (!value) throw new Error(`${name} is not configured.`);

  return value;
}

function getApiUrl(path: string) {
  const baseUrl = (process.env.AI_API_BASE_URL ?? "https://ai.mdldm.club/v1")
    .replace(/\/$/, "");

  return `${baseUrl}/${path.replace(/^\//, "")}`;
}

function extractJson(value: string) {
  const trimmed = value.trim().replace(/^```(?:json)?\s*/i, "").replace(/```$/, "");
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");

  if (start === -1 || end <= start) {
    throw new Error("AI response did not contain a JSON object.");
  }

  return JSON.parse(trimmed.slice(start, end + 1)) as unknown;
}

export async function callAiJson(
  messages: ChatMessage[]
): Promise<unknown> {
  const response = await fetch(getApiUrl("chat/completions"), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${requireEnv("AI_API_KEY")}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: process.env.AI_TEXT_MODEL ?? "gpt-5.4-mini",
      messages
    }),
    signal: AbortSignal.timeout(240_000),
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`AI text request failed (${response.status}).`);
  }

  const result = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = result.choices?.[0]?.message?.content;

  if (!content) throw new Error("AI text response was empty.");

  return extractJson(content);
}

function createIllustrationPrompt(
  illustration: NewsletterIllustration,
  issueSubject: string
) {
  const labels = (illustration.labels ?? []).slice(0, 5);

  return `Generate one standalone Chinese article illustration for the newsletter “${issueSubject}”.

The image API may return a square canvas. Compose every important subject and every label inside a centered horizontal 16:9 safe band. Keep the top and bottom mostly pure white so the server can crop the center to 16:9 without losing content.

Visual DNA:
Pure white background. Minimalist black hand-drawn line art. Slightly wobbly pen lines. Lots of empty white space. Sparse red, orange, and blue handwritten Chinese annotations. Clean absurd product-sketch feeling. No gradients, shadows, paper texture, noise, complex background, commercial vector style, PPT infographic, course slide, cute mascot poster, children's illustration, or realistic UI.

Recurring character:
小黑 is a small solid-black absurd creature with white dot eyes, tiny thin legs, a blank serious expression, and a slightly uneven hand-drawn body. 小黑 must perform the core conceptual action, not stand nearby as decoration. Deadpan and serious, not cute.

Theme: ${illustration.theme ?? issueSubject}
Core idea: ${illustration.coreIdea ?? illustration.alt}
Composition: ${illustration.composition ?? illustration.alt}
Chinese handwritten labels, verbatim: ${labels.map((label) => `“${label}”`).join(" / ") || "no labels"}

Color use:
Black for the main line art and 小黑. Orange only for the main path or action. Red only for a warning, confirmation, or result. Blue only for feedback or a secondary system state.

Constraints:
One image explains one idea. Main subject occupies 40%-55% of the final horizontal safe band. Preserve at least 35% blank white space. No title in the top-left. Do not write a diagram type. Use at most five short Chinese labels. No watermark. Do not reuse conveyor-belt, funnel, judgment-lever, fish, stamp, multi-source, or generic flowchart compositions.`;
}

export async function generateNewsletterImage(
  illustration: NewsletterIllustration,
  issueSubject: string
): Promise<NewsletterImageAsset> {
  const response = await fetch(getApiUrl("images/generations"), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${requireEnv("AI_API_KEY")}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: process.env.AI_IMAGE_MODEL ?? "gpt-image-2",
      prompt: createIllustrationPrompt(illustration, issueSubject),
      size: "1536x1024",
      quality: process.env.AI_IMAGE_QUALITY ?? "medium",
      n: 1
    }),
    signal: AbortSignal.timeout(300_000),
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`AI image request failed (${response.status}).`);
  }

  const result = (await response.json()) as {
    data?: Array<{ b64_json?: string; url?: string }>;
  };
  const item = result.data?.[0];
  let source: Buffer;

  if (item?.b64_json) {
    const base64 = item.b64_json.replace(/^data:image\/\w+;base64,/, "");
    source = Buffer.from(base64, "base64");
  } else if (item?.url) {
    const imageResponse = await fetch(item.url, {
      signal: AbortSignal.timeout(120_000),
      cache: "no-store"
    });

    if (!imageResponse.ok) {
      throw new Error(`AI image download failed (${imageResponse.status}).`);
    }

    source = Buffer.from(await imageResponse.arrayBuffer());
  } else {
    throw new Error("AI image response did not contain image data.");
  }

  const content = await sharp(source)
    .resize(1_440, 810, {
      fit: "cover",
      position: "centre",
      background: "#ffffff"
    })
    .flatten({ background: "#ffffff" })
    .png({ compressionLevel: 9, quality: 92 })
    .toBuffer();
  const metadata = await sharp(content).metadata();

  if (
    content.length < 80_000 ||
    metadata.width !== 1_440 ||
    metadata.height !== 810
  ) {
    throw new Error("Generated illustration failed the image quality gate.");
  }

  return {
    cid: illustration.cid,
    filename: illustration.filename,
    content,
    contentType: "image/png",
    width: metadata.width,
    height: metadata.height
  };
}

export function asGeneratedContent(
  value: unknown
): GeneratedNewsletterContent {
  return value as GeneratedNewsletterContent;
}
