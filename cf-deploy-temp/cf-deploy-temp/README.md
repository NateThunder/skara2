# GA4 Analytics Dashboard (Next.js + React + TypeScript)

This project includes a Wix-style analytics dashboard at `/admin` backed by the Google Analytics 4 (GA4) Data API.

## Features

- Desktop-first, responsive dashboard layout with:
  - left sidebar navigation
  - top header with search + date range controls
  - card-based KPI, chart, and table widgets
- Date range selector:
  - Last 7 days (`preset=7d`)
  - Last 28 days (`preset=28d`)
  - Last 90 days (`preset=90d`)
  - Custom (`preset=custom&startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`)
- KPI cards with period-over-period change:
  - Users
  - New users
  - Sessions
  - Engagement rate
  - Average engagement time
  - Conversions (GA4 key events)
  - Total revenue
- Charts:
  - Users vs Sessions line chart (daily)
  - Top pages/screens bar chart
  - Traffic acquisition donut chart (default channel group)
- Tables:
  - Top navigation items (from navbar clicks)
  - Top campaigns
- Per-widget loading, empty-state, and error-state UI.
- Caching by widget + date range on both client and server to reduce API calls.

## Component Structure

- `app/admin/components/DashboardLayout.tsx`
- `app/admin/components/SidebarNav.tsx`
- `app/admin/components/DashboardHeader.tsx`
- `app/admin/components/KPIGrid.tsx`
- `app/admin/components/UsersSessionsChart.tsx`
- `app/admin/components/TopPagesChart.tsx`
- `app/admin/components/AcquisitionDonutChart.tsx`
- `app/admin/components/LandingPagesTable.tsx`
- `app/admin/components/CampaignsTable.tsx`
- `app/admin/components/WidgetPanel.tsx`
- `app/admin/components/SetupPanel.tsx`

## GA4 API Layer

- `app/lib/analytics/ga4-client.ts`
- `app/lib/analytics/date-range.ts`
- `app/lib/analytics/queries.ts`
- `app/lib/analytics/cache.ts`
- `app/lib/analytics/contracts.ts`

Each widget has its own query function in `queries.ts` and its own API endpoint:

- `/api/admin/analytics/kpis`
- `/api/admin/analytics/timeseries`
- `/api/admin/analytics/top-pages`
- `/api/admin/analytics/acquisition`
- `/api/admin/analytics/landing-pages`
- `/api/admin/analytics/campaigns`

## Required Environment Variables (Placeholders)

Set these values in your environment:

- `GOOGLE_ANALYTICS_PROPERTY_ID` (required)
- `GOOGLE_APPLICATION_CREDENTIALS` (service account JSON path), or:
  - `GOOGLE_CLIENT_EMAIL`
  - `GOOGLE_PRIVATE_KEY`
- `GA4_KEY_EVENTS` (optional comma-separated list for display context)

Example:

```env
GOOGLE_ANALYTICS_PROPERTY_ID=123456789
GOOGLE_APPLICATION_CREDENTIALS=C:\keys\ga4-service-account.json
GA4_KEY_EVENTS=purchase,generate_lead,form_submit
```

## Example GA4 `runReport` Payloads

### KPI Summary (Current Period)

```json
{
  "dateRanges": [{ "startDate": "2026-02-04", "endDate": "2026-03-03" }],
  "metrics": [
    { "name": "totalUsers" },
    { "name": "newUsers" },
    { "name": "sessions" },
    { "name": "engagementRate" },
    { "name": "averageSessionDuration" },
    { "name": "keyEvents" },
    { "name": "totalRevenue" }
  ]
}
```

### Users/Sessions Trend

```json
{
  "dateRanges": [{ "startDate": "2026-02-04", "endDate": "2026-03-03" }],
  "dimensions": [{ "name": "date" }],
  "metrics": [{ "name": "totalUsers" }, { "name": "sessions" }],
  "orderBys": [{ "dimension": { "dimensionName": "date" } }]
}
```

### Top Pages by Views

```json
{
  "dateRanges": [{ "startDate": "2026-02-04", "endDate": "2026-03-03" }],
  "dimensions": [{ "name": "pagePath" }],
  "metrics": [{ "name": "screenPageViews" }],
  "orderBys": [{ "metric": { "metricName": "screenPageViews" }, "desc": true }],
  "limit": 8
}
```

### Acquisition by Channel Group

```json
{
  "dateRanges": [{ "startDate": "2026-02-04", "endDate": "2026-03-03" }],
  "dimensions": [{ "name": "sessionDefaultChannelGroup" }],
  "metrics": [{ "name": "sessions" }],
  "orderBys": [{ "metric": { "metricName": "sessions" }, "desc": true }],
  "limit": 8
}
```

### Top Navigation Items Table

```json
{
  "dateRanges": [{ "startDate": "2026-02-04", "endDate": "2026-03-03" }],
  "dimensions": [{ "name": "eventName" }],
  "metrics": [{ "name": "eventCount" }, { "name": "totalUsers" }],
  "dimensionFilter": {
    "filter": {
      "fieldName": "eventName",
      "inListFilter": {
        "values": [
          "button_click_home",
          "button_click_about",
          "button_click_media",
          "button_click_mentions",
          "button_click_book_now",
          "button_click_contact"
        ]
      }
    }
  },
  "orderBys": [{ "metric": { "metricName": "eventCount" }, "desc": true }],
  "limit": 10
}
```

### Top Campaigns Table

```json
{
  "dateRanges": [{ "startDate": "2026-02-04", "endDate": "2026-03-03" }],
  "dimensions": [{ "name": "sessionCampaignName" }],
  "metrics": [
    { "name": "totalUsers" },
    { "name": "sessions" },
    { "name": "keyEvents" }
  ],
  "orderBys": [{ "metric": { "metricName": "sessions" }, "desc": true }],
  "limit": 10
}
```

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000/admin`.

## Booking Enquiry Form Setup

The `/api/enquiries` route sends booking emails through Zoho Mail.

Set these server-side variables before using the enquiry form:

```env
ZOHO_CLIENT_ID=...
ZOHO_CLIENT_SECRET=...
ZOHO_REFRESH_TOKEN=...
ZOHO_ACCOUNT_ID=...
BOOKING_EMAIL_TO=info@skaraceilidh.com
```

Optional:

```env
ZOHO_FROM_EMAIL=info@skaraceilidh.com
```

If `ZOHO_FROM_EMAIL` is not set, the app uses `BOOKING_EMAIL_TO` as the sender address.

For Cloudflare Workers deployments, add them as Worker secrets before deploy:

```bash
npx wrangler secret put ZOHO_CLIENT_ID
npx wrangler secret put ZOHO_CLIENT_SECRET
npx wrangler secret put ZOHO_REFRESH_TOKEN
npx wrangler secret put ZOHO_ACCOUNT_ID
npx wrangler secret put BOOKING_EMAIL_TO
```

If these values are missing, the site falls back to opening the visitor's email client with a prefilled enquiry draft.

## Supabase Login (Admin Protection)

This project now protects:

- `/admin`
- `/api/admin/*`

Unauthenticated users are redirected to `/login` (or receive `401` for admin APIs).

Add these environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

Create at least one user in Supabase Authentication (email/password), then sign in at:

- `http://localhost:3000/login`
