# Subterra Nexus — PRD

## Problem statement
Premium corporate website for **Subterra Nexus Pvt Ltd.** — an international commodity trading company (founded 2025, Hyderabad, India). Lead-generation focused, Trafigura-style premium aesthetic, covering petrochemicals, food commodities, metals, and ores across Asia, MENA, LATAM, UAE, Brazil, Ecuador, USA.

- Tagline: *Global Commodities. Trusted Networks. Timely Delivery.*
- Contact: info@subterranexus.com · +91 92461 55100
- Address: Plot No 33, Phase-1 Sancharpuri Colony, New Bowenpally, Hyderabad 500011

## User personas
- **B2B buyer / manufacturer** — submits an inquiry for a specific commodity and quantity.
- **B2G procurement officer** — evaluates the company's credibility and reaches the trade desk.
- **Global supplier** — explores commodities served and offers supply.

## Architecture
- **Frontend**: React 19 + React Router 7 + Tailwind 3 + Shadcn UI + Lucide icons + Sonner toasts.
- **Backend**: FastAPI + Motor (MongoDB) with `/api` router prefix.
- **Inquiry pipeline**: `POST /api/inquiries` → persist to Mongo → (optional) SMTP email via background task. SMTP is gated behind env vars (SMTP_HOST/PORT/USER/PASSWORD/FROM_EMAIL/TO_EMAIL); **currently not configured** — inquiries persist to DB, `email_sent=false`.

## Implemented (Dec 2025)
- 7 routes: Home, About, Services, Commodities, Markets, Insights (list + detail), Contact.
- Hero with dual CTAs ("Explore Commodities", "Send Trade Inquiry") and trust stats strip.
- Commodities grid with 4 categories + full item list — **every item has a Send Inquiry CTA + WhatsApp shortcut**.
- Services grid (6 corporate services) with "Contact Trade Desk" CTAs.
- Markets section (Asia, MENA, LATAM, North America) — **no interactive map** (per brief).
- Insights: 4 seeded articles with detail pages (static, hardcoded).
- About: story, Mission, Vision, sustainability, future plans.
- Sustainability + Future Plans sections.
- Contact page with 9-field inquiry form + success state + WhatsApp deep link.
- **Floating WhatsApp button on every page** (wa.me/919246155100, pre-filled "Hello Subterra Nexus…").
- Reusable `InquiryDialog` launched from header, hero, commodity cards, CTA strip.
- Sticky glass header, deep navy footer.
- Google Fonts: Outfit (display) + IBM Plex Sans (body). Brand palette: #0A192F / #2563EB / white / slate.
- IntersectionObserver-driven reveal animations.

## Backend endpoints
- `GET  /api/health` → health + `smtp_configured` boolean
- `POST /api/inquiries` → create lead (9 fields + source)
- `GET  /api/inquiries?limit=100` → list leads (most recent first, no _id leaked)

## Tested (iteration_1.json)
- Backend: **100%** (8/8 pytest)
- Frontend: **97%** initially — 1 UX bug (insight cards not clickable) — **fixed** by wrapping cards in `<Link>`.
- Manually verified: insight navigation, broken article image swapped.

## Backlog / Next
- **P1**: Wire SMTP (ask user for creds) so `/api/inquiries` emails `info@subterranexus.com` in real time. Current fallback already persists every lead; switching is env-only.
- **P1**: `/admin/inquiries` protected dashboard for the trade desk (table view, export CSV, status: new/contacted/won).
- **P2**: Per-commodity detail pages with SEO meta (improves organic lead flow).
- **P2**: Downloadable company profile PDF, newsletter opt-in, testimonials.
- **P2**: Analytics event tracking on every inquiry CTA (Google Analytics / Mixpanel).
- **P3**: i18n (EN / AR / ES / PT) for MENA and LATAM corridors.
- **P3**: Dynamic Insights via MongoDB so the team can publish articles without redeploys.
