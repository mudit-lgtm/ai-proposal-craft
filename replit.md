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

### Core
- Landing page with hero, How It Works, 15 services (colorful icons), 6 template previews, Why Us comparison table, features, pricing, testimonials, FAQ
- 4-step proposal generation wizard: service type, agency info, client details, AI options (language/tone/validity)
- AI-generated proposals via OpenAI gpt-5.2 (7 sections)
- 6 visual templates (Linear, Stripe, Agency Dark, Editorial, Orbit, Corporate) with real visual previews on landing page
- Inline editing of any proposal section
- PDF download (html2canvas + jsPDF)
- Proposal dashboard stored in localStorage
- Free tier: 3 proposals; Pro tier: Coming Soon

### New Features (Phase 2)
1. **Agency Profile Persistence** — save agency name/contact/logo/website once at /profile; auto-populates on generate form
2. **Section-Level AI Regeneration** — hover any section → click Regenerate to get fresh AI content for just that section
3. **Proposal Duplication** — Copy icon in dashboard clones any proposal as a new Draft
4. **Status Pipeline** — Draft → Sent → Accepted / Declined, managed via dropdown in dashboard
5. **Shareable Read-Only Link** — /view/:id route shows proposal to clients; copy link button in proposal toolbar
6. **Proposal Validity Dates** — set 7/14/30/45/60/90 day validity; displayed on proposal and dashboard
7. **Multi-Language Generation** — 12 languages: English, Spanish, French, German, Portuguese, Italian, Dutch, Japanese, Chinese, Arabic, Hindi, Russian
8. **AI Tone Selector** — Formal / Balanced / Conversational; passed to AI prompt
9. **Dashboard Analytics** — Total / Sent / Accepted / Close Rate cards at the top of the dashboard
10. **Follow-Up Email Generator** — mail icon in proposal toolbar → AI generates subject + body; copy to clipboard
11. **Logo URL on Proposal** — agencyLogoUrl field passed through to AI prompt for inclusion

### Service Types (15)
seo, website, google-ads, social-media, orm, lead-generation, branding, email-marketing, content-marketing, video-marketing, influencer-marketing, ppc, e-commerce, analytics, app-marketing

### API Endpoints
- POST /api/proposals/generate — full proposal (with language/tone/validityDays)
- POST /api/proposals/regenerate-section — single section regeneration
- POST /api/proposals/follow-up-email — email subject + body

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `cd lib/api-client-react && npx tsc -p tsconfig.json` — rebuild dist declarations after codegen
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Key Files

- `artifacts/proposal-craft/src/` — React frontend
  - `pages/home.tsx` — landing page (services, template previews, comparison table)
  - `pages/generate.tsx` — 4-step proposal wizard
  - `pages/proposal.tsx` — proposal view/edit + regenerate/share/email/status
  - `pages/dashboard.tsx` — saved proposals + analytics + duplicate/status
  - `pages/profile.tsx` — agency profile settings (NEW)
  - `pages/view.tsx` — read-only shareable proposal view (NEW)
  - `lib/store.ts` — localStorage management (proposals + agency profile)
- `artifacts/api-server/src/routes/proposals.ts` — all 3 AI endpoints
- `lib/api-spec/openapi.yaml` — API contract (regenerate-section + follow-up-email added)
