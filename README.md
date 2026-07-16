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

Before accepting subscribers, run the SQL in `supabase/schema.sql` in the
Supabase project.

The protected `POST /api/email/test` endpoint verifies the Aliyun Direct Mail
SMTP connection and sends one clearly labeled test email to active subscribers.
It rejects requests without `Authorization: Bearer <EMAIL_TEST_SECRET>` and
refuses to send when more than five active subscribers exist.

## Source notes

- Original source files are in `../.source`.
- The source archive contains no external assets, images, fonts, videos, or audio.
- The original subscription JavaScript was migrated to a small React Client Component. A successful subscription is shared between both forms for the current page view and resets after a refresh.
