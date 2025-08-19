# Next.js 14 AI Starter (Cursor-Optimized)

This is a full-stack template to build AI-powered apps with Next.js 14 (App Router), TailwindCSS, Firebase, and the Vercel AI SDK.

## Quickstart (Cursor)
- Open this repo in Cursor.
- Create a `.env.local` from `env.example` and set your API keys.
- Install deps and run dev:
  - `npm install`
  - `npm run dev`
- Start building in `src/app/page.tsx` and `src/components/*`.

## Recommended Editor Settings
- Enable Format on Save
- Default formatter: Prettier
- Use workspace TypeScript SDK

## Available AI APIs
- OpenAI: `src/app/api/openai/chat/route.ts`
- Anthropic: `src/app/api/anthropic/chat/route.ts`
- Replicate (image generation): `src/app/api/replicate/generate-image/route.ts`
- Deepgram (realtime transcription): `src/app/api/deepgram/route.ts`

## Firebase
All Firebase config is under `src/lib/firebase` with context/hooks in `src/lib/contexts` and `src/lib/hooks`.

## Scripts
- `npm run dev` – Start Next dev server
- `npm run build` – Build for production
- `npm start` – Start production server
- `npm run lint` – Lint using ESLint
- `npm run lint:fix` – Lint and auto-fix
- `npm run typecheck` – TypeScript type-check
- `npm run format` – Format with Prettier

## Notes
- No external API rewrites are configured; local routes under `src/app/api/*` handle requests.
- Use Node runtime for routes that need filesystem access (e.g. audio transcription). Edge is used where suitable.