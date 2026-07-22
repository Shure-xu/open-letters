# open letters Next.js migration

This project is a faithful Next.js App Router migration of the provided Open Design `index.html`.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Build

```bash
npm run build
```

## Deploy to Vercel

Import this `next-project` directory in Vercel and use the default Next.js settings.

Required environment variables:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ALIYUN_SMTP_HOST`
- `ALIYUN_SMTP_PORT`
- `ALIYUN_SMTP_SECURE`
- `ALIYUN_SMTP_USER`
- `ALIYUN_SMTP_PASSWORD`
- `NEWSLETTER_FROM_NAME`
- `EMAIL_TEST_SECRET`
- `NEWSLETTER_PREVIEW_SECRET`
- `CRON_SECRET`
- `AI_API_BASE_URL`
- `AI_API_KEY`
- `AI_TEXT_MODEL`
- `AI_IMAGE_MODEL`
- `AI_IMAGE_QUALITY`

Before accepting subscribers, run the SQL in `supabase/schema.sql` in the
Supabase project.

After a subscriber is stored successfully, `POST /api/subscribe` immediately
sends the local `welcome-v1` email template through Aliyun Direct Mail and
records the result in `email_sends`. The `(subscriber_id, issue_id)` unique
index prevents duplicate welcome messages when the same address is submitted
again.

The protected `POST /api/email/test` endpoint verifies the Aliyun Direct Mail
SMTP connection and sends one clearly labeled test email to active subscribers.
It rejects requests without `Authorization: Bearer <EMAIL_TEST_SECRET>` and
refuses to send when more than five active subscribers exist.

## Daily newsletter workflow

Vercel Cron calls `GET /api/cron/daily-newsletter` every day at `00:00` UTC,
which is `08:00` in Asia/Shanghai. The route fetches the Follow Builders feeds,
generates and humanizes the Chinese issue, creates two illustrations, applies
quality gates, archives the issue, and then sends it to active subscribers.

Each issue is archived before email delivery in the private Supabase Storage
bucket `newsletter-issues`. The archive path is:

```text
YYYY/MM/DD/<issue-id>/
  issue.md
  issue.json
  01-hero.png
  02-field-note.png
```

If source, text, image, or archive validation fails, the route stops before
sending. `email_sends` continues to provide per-subscriber idempotency and
delivery status.

## Source notes

- Original source files are in `../.source`.
- The source archive contains no external assets, images, fonts, videos, or audio.
- The original subscription JavaScript was migrated to a small React Client Component. A successful subscription is shared between both forms for the current page view and resets after a refresh.
