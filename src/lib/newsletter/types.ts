export type NewsletterSourceLink = {
  label: string;
  url: string;
  publishedAt?: string;
};

export type NewsletterNewsItem = {
  title: string;
  paragraphs: readonly string[];
  sourceLinks: readonly NewsletterSourceLink[];
};

export type NewsletterIllustration = {
  cid: string;
  filename: string;
  alt: string;
  theme?: string;
  coreIdea?: string;
  composition?: string;
  labels?: readonly string[];
};

export type NewsletterIssue = {
  issueId: string;
  date: string;
  subject: string;
  preheader: string;
  eyebrow: string;
  opening: readonly string[];
  news: readonly NewsletterNewsItem[];
  pmView: {
    title: string;
    paragraphs: readonly string[];
    note: string;
  };
  practical: {
    title: string;
    intro: string;
    prompt: string;
    note: string;
    source: NewsletterSourceLink;
  };
  fieldNote: {
    title: string;
    paragraphs: readonly string[];
    source: NewsletterSourceLink;
  };
  closing: readonly string[];
  illustrations: readonly NewsletterIllustration[];
  provenance: {
    generatedAt: string;
    feedGeneratedAt: string | null;
    feedSource: string;
    sourceCount: number;
  };
};

export type GeneratedNewsletterContent = Omit<
  NewsletterIssue,
  "issueId" | "date" | "eyebrow" | "illustrations" | "provenance"
> & {
  illustrations: Array<{
    alt: string;
    theme: string;
    coreIdea: string;
    composition: string;
    labels: string[];
  }>;
};

export type NewsletterImageAsset = {
  cid: string;
  filename: string;
  content: Buffer;
  contentType: "image/png";
  width: number;
  height: number;
};

export type NewsletterRunResult = {
  ok: boolean;
  status: "dry-run" | "sent" | "duplicate" | "no-subscribers";
  issueId: string;
  sourceCount?: number;
  attempted?: number;
  sent?: number;
  failed?: number;
  skipped?: number;
};
