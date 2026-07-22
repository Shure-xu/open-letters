const FOLLOW_BUILDERS_REPO =
  "https://github.com/zarazhangrui/follow-builders";
const FEED_BASE =
  "https://raw.githubusercontent.com/zarazhangrui/follow-builders/main";

type Tweet = {
  text?: string;
  createdAt?: string;
  url?: string;
  likes?: number;
  retweets?: number;
  replies?: number;
};

type Builder = {
  name?: string;
  bio?: string;
  tweets?: Tweet[];
};

type XFeed = {
  generatedAt?: string;
  x?: Builder[];
};

type BlogPost = {
  name?: string;
  title?: string;
  author?: string;
  url?: string;
  publishedAt?: string;
  description?: string;
  content?: string;
};

type BlogFeed = {
  generatedAt?: string;
  blogs?: BlogPost[];
};

type PodcastEpisode = {
  name?: string;
  title?: string;
  url?: string;
  publishedAt?: string;
  transcript?: string;
};

type PodcastFeed = {
  generatedAt?: string;
  podcasts?: PodcastEpisode[];
};

export type FeedCandidate = {
  kind: "x" | "blog" | "podcast";
  author: string;
  role: string;
  title?: string;
  text: string;
  url: string;
  publishedAt: string;
  engagement?: number;
};

export type PreparedFeed = {
  candidates: FeedCandidate[];
  allowedUrls: Set<string>;
  feedGeneratedAt: string | null;
  feedSource: string;
};

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(`${FEED_BASE}/${path}`, {
    cache: "no-store",
    signal: AbortSignal.timeout(30_000)
  });

  if (!response.ok) {
    throw new Error(`Follow Builders feed failed (${response.status}): ${path}`);
  }

  return (await response.json()) as T;
}

function isFresh(value: string | undefined, cutoff: Date) {
  if (!value) return false;
  const date = new Date(value);

  return !Number.isNaN(date.valueOf()) && date >= cutoff;
}

function clean(value: string | undefined, maxLength: number) {
  return (value ?? "").replace(/\u0000/g, "").trim().slice(0, maxLength);
}

function isSubstantiveTweet(tweet: Tweet) {
  const text = clean(tweet.text, 4_000);
  const withoutLinks = text.replace(/https?:\/\/\S+/g, "").trim();

  return withoutLinks.length >= 80;
}

export async function prepareFollowBuildersFeed(
  now = new Date()
): Promise<PreparedFeed> {
  const [xFeed, blogFeed, podcastFeed] = await Promise.all([
    fetchJson<XFeed>("feed-x.json"),
    fetchJson<BlogFeed>("feed-blogs.json"),
    fetchJson<PodcastFeed>("feed-podcasts.json")
  ]);
  const tweetCutoff = new Date(now.getTime() - 72 * 60 * 60 * 1_000);
  const longFormCutoff = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1_000);
  const tweets: FeedCandidate[] = [];

  for (const builder of xFeed.x ?? []) {
    for (const tweet of builder.tweets ?? []) {
      if (
        !isSubstantiveTweet(tweet) ||
        !isFresh(tweet.createdAt, tweetCutoff) ||
        !tweet.url
      ) {
        continue;
      }

      tweets.push({
        kind: "x",
        author: clean(builder.name, 120),
        role: clean(builder.bio, 400),
        text: clean(tweet.text, 4_000),
        url: tweet.url,
        publishedAt: tweet.createdAt ?? now.toISOString(),
        engagement:
          (tweet.likes ?? 0) +
          2 * (tweet.retweets ?? 0) +
          (tweet.replies ?? 0)
      });
    }
  }

  tweets.sort(
    (left, right) =>
      (right.engagement ?? 0) - (left.engagement ?? 0) ||
      new Date(right.publishedAt).valueOf() -
        new Date(left.publishedAt).valueOf()
  );

  const blogs: FeedCandidate[] = (blogFeed.blogs ?? [])
    .filter(
      (post) =>
        Boolean(post.url) &&
        isFresh(post.publishedAt ?? blogFeed.generatedAt, longFormCutoff)
    )
    .slice(0, 4)
    .map((post) => ({
      kind: "blog" as const,
      author: clean(post.author || post.name, 120),
      role: clean(post.name, 180),
      title: clean(post.title, 300),
      text: clean(post.content || post.description, 12_000),
      url: post.url ?? "",
      publishedAt:
        post.publishedAt ?? blogFeed.generatedAt ?? now.toISOString()
    }))
    .filter((post) => post.text.length >= 120);

  const podcasts: FeedCandidate[] = (podcastFeed.podcasts ?? [])
    .filter(
      (episode) =>
        Boolean(episode.url?.match(/youtube\.com\/watch|youtu\.be\//)) &&
        isFresh(episode.publishedAt, longFormCutoff)
    )
    .slice(0, 1)
    .map((episode) => ({
      kind: "podcast" as const,
      author: clean(episode.name, 160),
      role: "podcast",
      title: clean(episode.title, 300),
      text: clean(episode.transcript, 18_000),
      url: episode.url ?? "",
      publishedAt: episode.publishedAt ?? now.toISOString()
    }))
    .filter((episode) => episode.text.length >= 500);

  const candidates = [...tweets.slice(0, 18), ...blogs, ...podcasts];

  if (candidates.length < 3) {
    throw new Error(
      `Not enough fresh, substantive sources (${candidates.length}).`
    );
  }

  const generatedValues = [
    xFeed.generatedAt,
    blogFeed.generatedAt,
    podcastFeed.generatedAt
  ].filter((value): value is string => Boolean(value));
  const feedGeneratedAt = generatedValues.sort().at(-1) ?? null;

  return {
    candidates,
    allowedUrls: new Set(candidates.map((candidate) => candidate.url)),
    feedGeneratedAt,
    feedSource: FOLLOW_BUILDERS_REPO
  };
}
