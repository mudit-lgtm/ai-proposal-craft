# AI Proposal Craft

> **The free AI-powered business proposal generator for digital marketing agencies.**
> Generate, customise, share, and track professional proposals — all in one place.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20Site-teal?style=for-the-badge)](https://ai-proposal-craft.replit.app)
[![Built with React](https://img.shields.io/badge/React-18-blue?style=flat-square&logo=react)](https://react.dev)
[![OpenAI GPT](https://img.shields.io/badge/AI-GPT--5.2-green?style=flat-square&logo=openai)](https://openai.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=flat-square&logo=typescript)](https://typescriptlang.org)

---

## What Is It?

AI Proposal Craft lets digital marketing agencies generate complete, professional business proposals in under 2 minutes using AI. Instead of spending hours writing proposals from scratch, you fill in a short form and the AI writes a full 7-section proposal tailored to your client and service type.

No design skills needed. No expensive proposal tools. Just fill in the details and get a polished, client-ready proposal instantly.

---

## Screenshots

| Home Page | Generate Wizard | Proposal View |
|-----------|----------------|---------------|
| Hero with 15 service types | 4-step wizard with colorful cards | 6 professional templates |

---

## Features

### Core Proposal Generation
- **AI writes everything** — 7 complete sections: Executive Summary, Client Analysis, Proposed Strategy, Deliverables & Timeline, Team & Expertise, Pricing & Packages, Terms & Conditions
- **15 digital marketing service types** — SEO, Social Media, Google/Meta Ads, Website Design, Email Marketing, Content Marketing, Video Marketing, Influencer Marketing, PPC, E-Commerce, Analytics, App Marketing, ORM, Lead Generation, Branding
- **6 professional templates** — Linear, Stripe, Agency Dark, Editorial, Orbit, Corporate
- **30+ world currencies** — USD, EUR, GBP, INR, AED, AUD, CAD, SGD, JPY, BRL, MXN, ZAR, and more — budget ranges adapt automatically
- **26 industry categories** — Technology, Healthcare, Real Estate, Finance, E-Commerce, Education, Hospitality, and more
- **Multi-language generation** — 12 languages: English, Spanish, French, German, Portuguese, Italian, Dutch, Japanese, Chinese, Arabic, Hindi, Russian
- **AI tone selector** — Formal, Balanced, or Conversational — the AI adapts its writing style
- **Proposal validity dates** — Set 7 / 14 / 30 / 45 / 60 / 90 day expiry dates

### Editing & Customisation
- **Inline section editing** — Click any section to edit it directly in the browser
- **Section-level AI regeneration** — Hover any section → click Regenerate to get fresh AI content for just that part, without touching the rest
- **6 visual templates** — Switch with one click; see real previews on the landing page
- **PDF export** — Download a print-ready PDF in one click

### Agency Workflow
- **Agency profile persistence** — Save your agency name, contact, logo URL, and website once. They auto-fill every new proposal you create
- **Proposal dashboard** — See all your proposals in one place with status tracking
- **Proposal duplication** — Clone any proposal and adapt it for a new client
- **Status pipeline** — Track proposals through Draft → Sent → Accepted / Declined
- **Dashboard analytics** — Total proposals, sent count, accepted count, and close rate

### Client Sharing
- **Shareable read-only links** — Share `/view/:id` directly with clients — no login or PDF attachment needed
- **Follow-up email generator** — One click generates a follow-up email subject and body; copy to clipboard

### Free to Start
- **3 proposals free** — No credit card required
- **Pro plan coming soon** — Unlimited proposals, priority AI, custom branding

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS, shadcn/ui |
| **Backend** | Node.js, Express 5, TypeScript |
| **AI** | OpenAI GPT-5.2 via Replit AI Integrations |
| **API Contract** | OpenAPI 3.1, Orval (auto-generated React Query hooks + Zod schemas) |
| **PDF** | jsPDF + html2canvas |
| **Animations** | Framer Motion |
| **State/Storage** | localStorage (client-side) |
| **Monorepo** | pnpm workspaces |
| **Build** | esbuild (API), Vite (frontend) |

---

## Project Structure

```
ai-proposal-craft/
├── artifacts/
│   ├── proposal-craft/          # React + Vite frontend
│   │   └── src/
│   │       ├── pages/
│   │       │   ├── home.tsx         # Landing page
│   │       │   ├── generate.tsx     # 4-step proposal wizard
│   │       │   ├── proposal.tsx     # Proposal view + editing
│   │       │   ├── dashboard.tsx    # Proposal management
│   │       │   ├── profile.tsx      # Agency profile settings
│   │       │   └── view.tsx         # Read-only shareable view
│   │       ├── components/
│   │       │   ├── layout/          # Navbar, layout wrapper
│   │       │   └── ui/              # shadcn/ui components
│   │       └── lib/
│   │           └── store.ts         # localStorage management
│   └── api-server/              # Express 5 API server
│       └── src/
│           └── routes/
│               └── proposals.ts     # AI endpoints
├── lib/
│   ├── api-spec/
│   │   └── openapi.yaml         # API contract (source of truth)
│   └── api-client-react/        # Auto-generated React Query hooks
└── scripts/
    └── post-merge.sh
```

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/proposals/generate` | Generate a full 7-section proposal |
| `POST` | `/api/proposals/regenerate-section` | Regenerate one section of an existing proposal |
| `POST` | `/api/proposals/follow-up-email` | Generate a follow-up email for a proposal |
| `GET` | `/api/healthz` | Health check |

### POST `/api/proposals/generate`

**Request body:**
```json
{
  "serviceType": "seo",
  "agencyName": "Acme Marketing",
  "agencyContact": "hello@acme.com",
  "agencyLogoUrl": "https://acme.com/logo.png",
  "clientName": "Jane Doe",
  "clientCompany": "Globex Corp",
  "clientIndustry": "Technology & Software",
  "clientGoals": "Increase organic traffic by 3x within 6 months",
  "budget": "$2,500–$5,000/month",
  "language": "English",
  "tone": "balanced",
  "validityDays": 30
}
```

**Response:**
```json
{
  "executiveSummary": "...",
  "clientAnalysis": "...",
  "proposedStrategy": "...",
  "deliverablesAndTimeline": "...",
  "teamAndExpertise": "...",
  "pricingAndPackages": "...",
  "termsAndConditions": "..."
}
```

---

## Supported Service Types

| ID | Label |
|----|-------|
| `seo` | Search Engine Optimization |
| `website` | Website Design & Development |
| `social-media` | Social Media Marketing |
| `google-ads` | Google & Meta Ads |
| `email-marketing` | Email Marketing |
| `content-marketing` | Content Marketing |
| `video-marketing` | Video Marketing |
| `influencer-marketing` | Influencer Marketing |
| `ppc` | Pay-Per-Click (PPC) Ads |
| `e-commerce` | E-Commerce Marketing |
| `analytics` | Analytics & Reporting |
| `app-marketing` | App Store Optimization |
| `orm` | Online Reputation Management |
| `lead-generation` | Lead Generation |
| `branding` | Branding & Creative Services |

---

## Getting Started (Local Development)

### Prerequisites

- Node.js 24+
- pnpm 10+

### Installation

```bash
# Clone the repository
git clone https://github.com/mudit-lgtm/ai-proposal-craft.git
cd ai-proposal-craft

# Install dependencies
pnpm install
```

### Environment Variables

You need an OpenAI API key. Create a `.env` file in `artifacts/api-server/`:

```env
OPENAI_API_KEY=your-openai-api-key
PORT=8080
```

> **Note:** This project is designed to run on Replit and uses Replit AI Integrations which provide the OpenAI key automatically. If running locally, you'll need to supply your own key.

### Running the Development Server

```bash
# Start the API server (port 8080)
pnpm --filter @workspace/api-server run dev

# In a separate terminal, start the frontend (port 3000)
pnpm --filter @workspace/proposal-craft run dev
```

Then open `http://localhost:3000` in your browser.

### Building for Production

```bash
# Build everything (typecheck + build all packages)
pnpm run build
```

### API Code Generation

The API client is auto-generated from the OpenAPI spec. After modifying `lib/api-spec/openapi.yaml`:

```bash
# Regenerate React Query hooks and Zod schemas
pnpm --filter @workspace/api-spec run codegen

# Rebuild the type declarations
cd lib/api-client-react && npx tsc -p tsconfig.json
```

---

## localStorage Keys

| Key | Contents |
|-----|----------|
| `proposalcraft_proposals` | Array of all saved proposals |
| `proposalcraft_agency_profile` | Saved agency profile (name, contact, logo, website) |
| `proposalcraft_admin_session` | Admin session flag (bypasses free tier limit) |

---

## Roadmap

- [ ] Pro plan — unlimited proposals, priority AI
- [ ] Custom branding / white-label PDF export
- [ ] Team collaboration (shared workspace)
- [ ] Proposal analytics (client view time, section engagement)
- [ ] CRM integrations (HubSpot, Pipedrive)
- [ ] E-signature integration
- [ ] Proposal version history

---

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'feat: add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## License

MIT — see [LICENSE](LICENSE) for details.

---

<p align="center">
  Built with ❤️ for digital marketing agencies everywhere.<br/>
  <a href="https://ai-proposal-craft.replit.app">Try it free →</a>
</p>
