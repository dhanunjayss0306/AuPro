# AuPro

Campus app for Andhra University College of Engineering: feed, applications, chatbot, campus map and profile.

## Structure

```
apps/web/              Next.js 14 app (the only application)
  app/                 Routes only: layout.tsx, page.tsx, not-found.tsx, globals.css, api/
  app/api/             Server routes (auth, feed, accounts, activity, applications, places, faq, health)
  app/components/      UI components (MomentCard, ThreadsComposer, IntroCinematic, CampusPhoto, Glyph, ...)
  app/lib/             Logic with no UI (auth, content moderation, vector search, campus photo data)
  app/styles/          theme.css: the one theme (tokens, components, motion, touch sizes)
  public/              Static files (robots, sitemap, llms.txt, campus photos)
  tests/               node --test suites (API, UI requirements, security gates)
backend/               Supabase migrations and Cloudflare notes (not wired to the web app yet)
docs/                  Product, API and design notes
```

## Run

```
cd apps/web
npm install
npm test
npm run dev
```

## Design rules

One theme, defined in `apps/web/app/styles/theme.css`. Four colours with one job each: cobalt (actions),
gold (identity), coral (problems), green (verified). Flat surfaces only: no gradients, glow, glass blur,
emoji icons or fake numbers. Icons come from `components/Glyph.tsx`. Photos are real only
(see `apps/web/public/campus/README.md`).
