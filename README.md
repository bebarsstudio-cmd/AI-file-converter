# 1devv

> **1.0 BETA** — the first beta release 🎉

A free, AI-powered workshop that turns projects from one language into another
— and builds small new ones from a description.

**Convert** — drop in your source files (HTML, CSS, JS, TS, JSON, Markdown,
and many more), choose a target language (JavaScript, C++, Java or TypeScript)
or one of the 50 preset recipes, and the AI rewrites your project while
preserving its behavior and structure as closely as it can.

**Create** — describe an app in plain language, the AI writes a complete
single-file web app, preview it live in the browser, then download it or
transform it into another language.

Everything is open source, and it is designed to run on free AI tiers.

## How it works

| Piece | What it does |
| --- | --- |
| `app/` | Next.js App Router pages + the `app/api/ai/*` route handlers |
| `lib/ai/` | The provider layer: one OpenAI-compatible adapter + presets for Groq, OpenRouter, Mistral, OpenAI, **Nova** (SourceAI's own AI, running on your computer), or any custom endpoint |
| `components/` | The whole UI — glass cards, animated backdrop, preset strip, previews |
| `presets/` | 50 conversion recipes — pure data, easy to extend |
| `lib/firebase/` | Accounts and profiles (Firebase Auth + Firestore) |
| `tests/` | Unit + integration suites (built-in `node:test` runner) |

The AI key lives **only** on the server: the browser talks to
`/api/ai/create` and `/api/ai/chat`, and those route handlers talk to the
provider. Swapping AI providers is a config change, not a code change.

The chat assistant always presents itself as **created by SourceAI**
(`lib/ai/persona.ts`) — whichever provider or model is configured, and however
the question is phrased.

## Getting started

Requirements: Node.js 20+ and a free AI provider key
([Groq](https://console.groq.com/keys) is the default and takes a minute).

```bash
npm install
cp .env.example .env.local   # then fill in your keys (see below)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

At minimum, set `AI_API_KEY` in `.env.local`. Firebase values are only needed
for accounts (login / signup); the converter works without them.

### Run it on Nova ⭐ (optional)

**Nova** is SourceAI's own AI. If she's running on the same computer
(`./start.sh` in her folder), 1devv can use her as its brain:

```bash
AI_PROVIDER=nova
AI_API_KEY=b1-…        # create one in Nova's console: http://127.0.0.1:8077/apikey
AI_MODEL=nova          # or a cloud model id from Nova's 🧠 switch (gpt-oss:120b, …)
```

No cloud bill, no external key — just Nova, right there on `127.0.0.1:8077`.

## Configuration

All variables live in `.env.local` (gitignored). `.env.example` documents them
too.

| Variable | Default | What it does |
| --- | --- | --- |
| `AI_PROVIDER` | `groq` | `groq`, `openrouter`, `mistral`, `openai`, `nova` or `custom` |
| `AI_API_KEY` | — | The provider's key. **Never** `NEXT_PUBLIC_`. |
| `AI_MODEL` | preset default | Model id, e.g. a Groq model |
| `AI_BASE_URL` | — | Only for `custom`: any OpenAI-compatible endpoint |
| `AI_REQUIRE_AUTH` | `0` | `1` = only signed-in users may call the AI routes |
| `AI_RATE_LIMIT_PER_MINUTE` | `30` | Per-IP request budget for the AI routes |
| `AI_MAX_BODY_KB` | `1024` | Reject AI request bodies larger than this |
| `AI_MAX_OUTPUT_TOKENS` | `4096` | Hard cap for client-requested output length |
| `NEXT_PUBLIC_FIREBASE_*` | — | Firebase web config (accounts only) |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | Public URL of the app |

> Tip: the free tiers are limited, so `lib/ai/openai.ts` retries rate limits
> transparently and asks the model to *continue* when output is cut off — long
> conversions come back complete instead of truncated.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server on port 3000 |
| `npm run build` / `npm start` | Production build + serve |
| `npm run lint` | ESLint |
| `npm test` | Unit tests + integration tests (integration quietly skips when no server is running on port 3000) |

## Status & roadmap

Working today:

- Single-pass conversion of uploaded text files to JS / C++ / Java / TypeScript
- App creation from a description, with a live sandboxed preview
- 50 preset recipes, accounts with Firestore profiles
- Free-tier hardening: rate-limit retries, output continuation, request guards
- The chat assistant credits its creator — **SourceAI** — on every provider

Coming next:

- ZIP uploads and folder mode (a whole folder in, a bundle out)
- The full pipeline: analyzer → converter → **builder** (compile) → **repairer**
  (auto-fix compiler errors) — so results are verified, not just generated
- The workspace dashboard (`/workspace`) and conversion flow pages
  (`/convert/*`) are placeholders for this pipeline

## Security notes

- The AI key is server-side only and `.env*` is gitignored.
- The AI routes ship with request-size caps and a per-IP rate limit, and can be
  restricted to signed-in users with `AI_REQUIRE_AUTH=1` (Firebase ID tokens are
  verified server-side). Before exposing the app publicly, turn that on and
  tighten your Firestore rules.
- Found something? Open an issue.

## Links

- GitHub: [bebarsstudio-cmd/AI-file-converter](https://github.com/bebarsstudio-cmd/AI-file-converter)
- Built in public, one release at a time.
