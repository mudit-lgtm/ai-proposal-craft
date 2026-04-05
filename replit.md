# Workspace

## Overview

AI Proposal Craft — a working copy of https://aiproposalcraft.vercel.app/. An AI-powered business proposal generator for digital marketing agencies. Users fill in their details and client info, AI generates a full proposal, and they can download it as PDF.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Frontend**: React + Vite (at `/`)
- **AI**: OpenAI via Replit AI Integrations (no API key needed from user)
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **PDF**: jsPDF + html2canvas
- **Proposal storage**: localStorage (client-side)

## Features

- Landing page with hero, how-it-works, service types, templates, pricing, testimonials, FAQ
- 3-step proposal generation form (service type, agency info, client details)
- AI-generated proposals via OpenAI gpt-5.2 (all 7 sections)
- 6 visual templates (Linear, Stripe, Agency Dark, Editorial, Orbit, Corporate)
- Inline editing of any proposal section
- PDF download
- Proposal dashboard (stored in localStorage)
- Free tier: 3 proposals max; Pro tier: UI-only

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Key Files

- `artifacts/proposal-craft/src/` — React frontend
  - `pages/home.tsx` — landing page
  - `pages/generate.tsx` — proposal generation form
  - `pages/proposal.tsx` — proposal preview with templates + PDF download
  - `pages/dashboard.tsx` — saved proposals list
  - `lib/store.ts` — localStorage management
- `artifacts/api-server/src/routes/proposals.ts` — POST /api/proposals/generate (AI generation endpoint)
- `lib/api-spec/openapi.yaml` — API contract
