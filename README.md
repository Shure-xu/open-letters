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

Import this `next-project` directory in Vercel and use the default Next.js settings. No environment variables are required.

## Source notes

- Original source files are in `../.source`.
- The source archive contains no external assets, images, fonts, videos, or audio.
- The original subscription JavaScript was migrated to a small React Client Component because it uses form events and `localStorage`.
