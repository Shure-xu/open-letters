import type {
  NewsletterImageAsset,
  NewsletterIssue
} from "@/lib/newsletter/types";

const BUCKET_ID = "newsletter-issues";

function getStorageConfig() {
  const baseUrl = (
    process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
  )?.replace(/\/$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!baseUrl || !key) {
    throw new Error("Supabase Storage access is not configured.");
  }

  return {
    baseUrl,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`
    }
  };
}

export async function ensureNewsletterArchiveBucket() {
  const { baseUrl, headers } = getStorageConfig();
  let verification = await fetch(
    `${baseUrl}/storage/v1/bucket/${BUCKET_ID}`,
    {
      headers,
      cache: "no-store"
    }
  );

  if (verification.status === 404) {
    const response = await fetch(`${baseUrl}/storage/v1/bucket`, {
      method: "POST",
      headers: {
        ...headers,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        id: BUCKET_ID,
        name: BUCKET_ID,
        public: false,
        file_size_limit: 10_485_760,
        allowed_mime_types: ["text/markdown", "application/json", "image/png"]
      }),
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(
        `Could not create newsletter archive bucket (${response.status}).`
      );
    }

    verification = await fetch(
      `${baseUrl}/storage/v1/bucket/${BUCKET_ID}`,
      { headers, cache: "no-store" }
    );
  }

  if (!verification.ok) {
    throw new Error(
      `Newsletter archive bucket verification failed (${verification.status}).`
    );
  }

  const bucket = (await verification.json()) as {
    id: string;
    name: string;
    public: boolean;
  };

  if (bucket.public) {
    throw new Error("Newsletter archive bucket must remain private.");
  }

  return bucket;
}

async function uploadObject(
  path: string,
  content: string | Buffer,
  contentType: string
) {
  const { baseUrl, headers } = getStorageConfig();
  const response = await fetch(
    `${baseUrl}/storage/v1/object/${BUCKET_ID}/${path}`,
    {
      method: "POST",
      headers: {
        ...headers,
        "Content-Type": contentType,
        "x-upsert": "true"
      },
      body:
        typeof content === "string"
          ? content
          : Uint8Array.from(content).buffer,
      cache: "no-store"
    }
  );

  if (!response.ok) {
    throw new Error(`Could not archive newsletter object (${response.status}): ${path}`);
  }
}

async function verifyArchivedObjects(folder: string, filenames: string[]) {
  const { baseUrl, headers } = getStorageConfig();
  const response = await fetch(
    `${baseUrl}/storage/v1/object/list/${BUCKET_ID}`,
    {
      method: "POST",
      headers: {
        ...headers,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        prefix: folder,
        limit: 100,
        offset: 0,
        sortBy: { column: "name", order: "asc" }
      }),
      cache: "no-store"
    }
  );

  if (!response.ok) {
    throw new Error(
      `Could not verify newsletter archive objects (${response.status}).`
    );
  }

  const objects = (await response.json()) as Array<{ name: string }>;
  const archivedNames = new Set(
    objects.map((object) => object.name.split("/").at(-1) ?? object.name)
  );
  const missing = filenames.filter((filename) => !archivedNames.has(filename));

  if (missing.length > 0) {
    throw new Error(`Newsletter archive is incomplete: ${missing.join(", ")}`);
  }
}

function issueFolder(issue: NewsletterIssue) {
  const [year, month, day] = issue.date.split("-");

  return `${year}/${month}/${day}/${issue.issueId}`;
}

export async function archiveNewsletterIssue(input: {
  issue: NewsletterIssue;
  markdown: string;
  images: NewsletterImageAsset[];
  status: string;
  sendResult?: unknown;
}) {
  await ensureNewsletterArchiveBucket();
  const folder = issueFolder(input.issue);
  const metadata = {
    status: input.status,
    updatedAt: new Date().toISOString(),
    issue: input.issue,
    images: input.images.map((image) => ({
      filename: image.filename,
      width: image.width,
      height: image.height,
      bytes: image.content.length
    })),
    sendResult: input.sendResult ?? null
  };

  await Promise.all([
    uploadObject(`${folder}/issue.md`, input.markdown, "text/markdown"),
    uploadObject(
      `${folder}/issue.json`,
      JSON.stringify(metadata, null, 2),
      "application/json"
    ),
    ...input.images.map((image) =>
      uploadObject(
        `${folder}/${image.filename}`,
        image.content,
        image.contentType
      )
    )
  ]);

  await verifyArchivedObjects(folder, [
    "issue.md",
    "issue.json",
    ...input.images.map((image) => image.filename)
  ]);

  return { bucket: BUCKET_ID, folder };
}
