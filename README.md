# Skara Ceilidh Band Website

This repository powers the public `skaraceilidh.com` website and its authenticated `/admin` analytics area. It is a Next.js App Router project built for two jobs:

1. Present Skara Ceilidh Band as a bookable live act for weddings, parties, and events.
2. Give the team a protected analytics workspace for traffic, page, campaign, and button-click reporting.

The public site is designed to work even when some back-office services are missing. Supabase-backed homepage content falls back to safe in-code defaults, and the booking form can fall back to a prefilled email draft if server-side email delivery is not configured.

## Product Summary

### Public site

- Full-screen hero with video, CTA buttons, and section-based navigation
- Homepage sections for The Band, Media, Services, Reviews, FAQs, and Contact
- Booking enquiry form with validation and server-side submission
- Automatic `mailto:` fallback when the enquiry email service is unavailable
- Cookie consent banner that gates optional analytics tracking
- YouTube-powered media section when API credentials are present

### Admin area

- Supabase-authenticated `/login` and `/admin`
- GA4 dashboard with KPI cards, charts, and reporting tables
- Date range presets for 7, 28, 90, and custom-day windows
- Reporting for top pages, acquisition, campaigns, and `button_click_*` events
- Public navigation layout toggle between `full` and `hamburger`
- Admin idle-session expiry after 20 minutes of inactivity

## How Content Works

This repo uses two content layers.

- Most homepage copy is static and lives in `app/lib/homepage-content.ts`.
- Runtime homepage content in `app/lib/site-content.ts` stores the About block, mentions, and nav layout mode in Supabase.

If Supabase public reads fail or the Supabase environment variables are missing, the site does not hard-fail. It falls back to in-code defaults for that runtime content and continues rendering the public homepage.

## Tech Stack

- Next.js 16 with App Router
- React 19
- TypeScript
- Tailwind CSS 4 plus project-specific global CSS
- Supabase SSR and Supabase Auth
- Google Analytics 4 Data API
- Zoho Mail API for enquiry delivery
- OpenNext for Cloudflare Workers deployment
- Cloudflare Workers, R2 incremental cache, and image optimization bindings
- Vitest and Playwright for testing

## Main Routes

| Route | Purpose |
| --- | --- |
| `/` | Public marketing site |
| `/login` | Admin sign-in page |
| `/admin` | Authenticated GA4 analytics dashboard |
| `/api/enquiries` | Booking enquiry submission endpoint |
| `/api/admin/analytics/*` | Widget-level GA4 data endpoints |
| `/api/admin/nav-layout` | Read and update homepage nav layout mode |
| `/api/admin/content` | Admin content API for Supabase-backed homepage content |

## Important Files

- `app/page.tsx`: homepage composition
- `app/components/*`: public marketing components, booking form, consent UI, click tracking
- `app/admin/*`: admin dashboard UI
- `app/api/enquiries/route.ts`: booking form email delivery
- `app/api/admin/analytics/*`: GA4 widget endpoints
- `app/lib/homepage-content.ts`: static homepage content
- `app/lib/site-content.ts`: Supabase-backed site content and fallbacks
- `app/lib/admin/auth.ts`: admin session protection and idle-timeout logic
- `supabase/content-schema.sql`: Supabase schema and RLS policies
- `wrangler.jsonc`: Cloudflare Worker bindings and deployment config
- `open-next.config.ts`: OpenNext Cloudflare config

## Local Development

### Prerequisites

- Node.js 20 or newer
- npm
- A Supabase project if you want working admin login and runtime content storage
- GA4 credentials if you want the analytics dashboard to return live data
- Zoho Mail credentials if you want the booking form to send email server-side

### Install

```bash
npm install
```

### Run the app

```bash
npm run dev
```

Open `http://localhost:3000` for the public site.

Open `http://localhost:3000/login` for admin sign-in.

## Environment Variables

Put local variables in `.env.local`.

| Variable | Required | Used for | Notes |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Required for admin login and runtime site content | Supabase | Public project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Required for admin login and runtime site content | Supabase | Public anon key |
| `GOOGLE_ANALYTICS_PROPERTY_ID` | Required for live `/admin` analytics | GA4 | GA4 property ID |
| `GOOGLE_APPLICATION_CREDENTIALS` | Optional alternative | GA4 | Path to service-account JSON |
| `GOOGLE_CLIENT_EMAIL` | Optional alternative | GA4 | Use with `GOOGLE_PRIVATE_KEY` |
| `GOOGLE_PRIVATE_KEY` | Optional alternative | GA4 | Use with `GOOGLE_CLIENT_EMAIL` |
| `GA4_KEY_EVENTS` | Optional | GA4 | Comma-separated key event names |
| `ZOHO_CLIENT_ID` | Required for server-side enquiry delivery | Zoho Mail | OAuth client ID |
| `ZOHO_CLIENT_SECRET` | Required for server-side enquiry delivery | Zoho Mail | OAuth client secret |
| `ZOHO_REFRESH_TOKEN` | Required for server-side enquiry delivery | Zoho Mail | Refresh token |
| `ZOHO_ACCOUNT_ID` | Required for server-side enquiry delivery | Zoho Mail | Mail account ID |
| `BOOKING_EMAIL_TO` | Required for server-side enquiry delivery | Zoho Mail | Destination inbox |
| `ZOHO_FROM_EMAIL` | Optional | Zoho Mail | Defaults to `BOOKING_EMAIL_TO` |
| `NEXT_PUBLIC_HERO_VIDEO_URL` | Optional | Public site | Overrides the default hosted hero video |
| `YOUTUBE_API_KEY` | Optional | Public site | Enables YouTube media fetches |
| `YOUTUBE_CHANNEL_HANDLE` | Optional | Public site | Channel handle, with or without `@` |

### Minimal `.env.local` example

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

GOOGLE_ANALYTICS_PROPERTY_ID=123456789
GOOGLE_CLIENT_EMAIL=service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GA4_KEY_EVENTS=purchase,generate_lead,form_submit

ZOHO_CLIENT_ID=...
ZOHO_CLIENT_SECRET=...
ZOHO_REFRESH_TOKEN=...
ZOHO_ACCOUNT_ID=...
BOOKING_EMAIL_TO=info@skaraceilidh.com

NEXT_PUBLIC_HERO_VIDEO_URL=https://example.com/hero.mp4
YOUTUBE_API_KEY=...
YOUTUBE_CHANNEL_HANDLE=@skaraceilidhband2929
```

## Supabase Setup

The public site can render without Supabase, but admin login and runtime content storage require it.

1. Create a Supabase project.
2. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Run the SQL in `supabase/content-schema.sql` in the Supabase SQL Editor.
4. Create at least one email/password user in Supabase Auth.
5. Sign in through `/login`.

The SQL script creates:

- `site_content`
- `site_mentions`
- update triggers for `updated_at` and `updated_by`
- public read policies for homepage rendering
- authenticated write policies for admin-side updates

## Analytics Setup

The `/admin` dashboard reads live data from the GA4 Data API. If GA4 is not configured, the dashboard shows a configuration message instead of failing silently.

Current widget coverage includes:

- users
- new users
- sessions
- engagement rate
- average engagement time
- conversions
- revenue
- top pages
- acquisition channels
- campaigns
- navigation and CTA click events

Tracked button labels are mapped into GA4 `button_click_*` events after cookie consent is accepted.

## Booking Form Behaviour

The contact form posts to `/api/enquiries`.

- If Zoho Mail is configured, the server sends an HTML enquiry email through the Zoho Mail API.
- If Zoho Mail is not configured, the API returns a temporary configuration response and the client opens a prefilled `mailto:` draft instead.
- Honeypot submissions are accepted and ignored to reduce bot noise.

## Testing

### Unit and integration tests

```bash
npm test
```

Vitest covers:

- booking enquiry validation and email workflow
- admin auth helpers and idle-session handling
- analytics date-range and event-mapping logic
- admin route input validation
- site-content normalization

### End-to-end tests

```bash
npm run test:e2e
```

Playwright runs against a local Next.js dev server and currently checks homepage structure, responsive contact/FAQ layout, and admin auth failure flows.

## Build and Deploy

### Local production build

```bash
npm run build
npm run start
```

### Cloudflare preview

```bash
npm run preview
```

### Cloudflare deploy

```bash
npm run deploy
```

This project uses OpenNext for Cloudflare. The Worker configuration in `wrangler.jsonc` includes:

- `WORKER_SELF_REFERENCE` service binding
- `NEXT_INC_CACHE_R2_BUCKET` for incremental cache storage
- `IMAGES` binding for image optimization

Before the first deploy, create the R2 bucket referenced in `wrangler.jsonc`, or update the config to use your preferred bucket name.

If you deploy to Cloudflare Workers, add the same secret values there with `wrangler secret put`.

## Deployment Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Start the Next.js development server |
| `npm run build` | Create a production Next.js build |
| `npm run start` | Start the production server locally |
| `npm run test` | Run Vitest |
| `npm run test:e2e` | Run Playwright |
| `npm run preview` | Build with OpenNext and preview locally for Cloudflare |
| `npm run deploy` | Build with OpenNext and deploy to Cloudflare |
| `npm run upload` | Build with OpenNext and upload assets |
| `npm run cf-typegen` | Generate Cloudflare binding types |

## Operational Notes

- The public site is the priority path and degrades gracefully when optional services are absent.
- The current `/admin` page is primarily an analytics dashboard, not a full CMS.
- Runtime homepage content is small by design: About copy, mentions, and nav layout mode.
- Cookie consent is required before optional analytics tracking is enabled on the public site.
