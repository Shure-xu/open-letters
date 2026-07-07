# Migration Notes

## Project structure

```txt
next-project/
  package.json
  package-lock.json
  next.config.ts
  tsconfig.json
  eslint.config.mjs
  .env.example
  public/
    fonts/
    images/
  src/
    app/
      globals.css
      layout.tsx
      page.tsx
    assets/
    components/
      Brand.tsx
      CtaSection.tsx
      Footer.tsx
      Header.tsx
      Hero.tsx
      InsideSection.tsx
      IssuesSection.tsx
      RhythmSection.tsx
      SubscriptionForm.tsx
    data/
      page-content.ts
    lib/
      subscription.ts
    styles/
```

## Commands

```bash
npm install
npm run dev
npm run lint
npm run build
```

## Vercel deployment

Deploy the `next-project` directory with Vercel's default Next.js settings.
No environment variables are required; `.env.example` is included for clarity.

## Missing resources

None. The Open Design archive only contained `index.html`, `DESIGN-HANDOFF.md`,
and `DESIGN-MANIFEST.json`; no images, SVGs, fonts, video, audio, or favicon
assets were provided.

## Necessary adjustments

- The original inline CSS was migrated into `src/app/globals.css` to preserve
  the exported visual tokens, layout, breakpoints, animation timing, and states.
- Repeated content was moved to `src/data/page-content.ts`.
- The original subscription script was migrated to `SubscriptionForm.tsx` as a
  Client Component because it uses form events and `localStorage`.
- `npm run build` uses `next build --webpack`. In this Windows workspace,
  Next 16's default Turbopack build repeatedly hit `EPERM` while renaming
  generated manifest files. Webpack builds successfully and remains compatible
  with Vercel through the package script.
