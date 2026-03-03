import type {
  AcquisitionWidgetData,
  CampaignsWidgetData,
  KpiMetric,
  KpisWidgetData,
  LandingPagesWidgetData,
  ResolvedDateRange,
  TimeSeriesWidgetData,
  TopClicksWidgetData,
  TopPagesWidgetData,
} from "@/app/lib/analytics/contracts";
import type { Ga4Client, RunReportRequest, RunReportResponse } from "@/app/lib/analytics/ga4-client";

function toNumber(value: string | undefined): number {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function metricMap(report: RunReportResponse): Record<string, number> {
  const row = report.rows?.[0];
  const values = row?.metricValues ?? [];
  const headers = report.metricHeaders ?? [];

  return headers.reduce<Record<string, number>>((accumulator, header, index) => {
    const metricName = header.name;
    if (!metricName) {
      return accumulator;
    }

    accumulator[metricName] = toNumber(values[index]?.value);
    return accumulator;
  }, {});
}

function calculateChangePercent(current: number, previous: number): number | null {
  if (previous === 0) {
    return current === 0 ? 0 : null;
  }

  return ((current - previous) / Math.abs(previous)) * 100;
}

function normalizeGaDate(dateValue: string): string {
  if (!/^\d{8}$/.test(dateValue)) {
    return dateValue;
  }

  return `${dateValue.slice(0, 4)}-${dateValue.slice(4, 6)}-${dateValue.slice(6, 8)}`;
}

const EXCLUDED_PATH_PREFIXES = ["/admin", "/api", "/_next", "/favicon.ico"];

const NAV_EVENT_LABELS: Record<string, string> = {
  button_click_home: "Home",
  button_click_about: "About",
  button_click_media: "Media",
  button_click_mentions: "Mentions",
  button_click_book_now: "Book now",
  button_click_contact: "Contact",
};

const NAV_EVENT_NAMES = Object.keys(NAV_EVENT_LABELS);

function normalizePath(pathValue: string): string {
  if (!pathValue) {
    return "/";
  }

  const [pathOnly] = pathValue.split("?");
  return pathOnly || "/";
}

function isInternalPath(pathValue: string): boolean {
  const normalized = normalizePath(pathValue).toLowerCase();
  return EXCLUDED_PATH_PREFIXES.some((prefix) => normalized.startsWith(prefix));
}

function buildBaseRangePayload(range: ResolvedDateRange): Pick<RunReportRequest, "dateRanges"> {
  return {
    dateRanges: [
      {
        startDate: range.current.startDate,
        endDate: range.current.endDate,
      },
    ],
  };
}

export async function queryKpis(client: Ga4Client, range: ResolvedDateRange): Promise<{
  data: KpisWidgetData;
  examplePayloads: Record<string, unknown>;
}> {
  const metrics = [
    { name: "totalUsers" },
    { name: "newUsers" },
    { name: "sessions" },
    { name: "engagementRate" },
    { name: "averageSessionDuration" },
    { name: "keyEvents" },
    { name: "totalRevenue" },
  ];

  const currentPayload: RunReportRequest = {
    dateRanges: [range.current],
    metrics,
  };

  const previousPayload: RunReportRequest = {
    dateRanges: [range.previous],
    metrics,
  };

  const [currentReport, previousReport] = await Promise.all([
    client.runReport(currentPayload),
    client.runReport(previousPayload),
  ]);

  const current = metricMap(currentReport);
  const previous = metricMap(previousReport);

  const metricRows: KpiMetric[] = [
    {
      id: "users",
      label: "Users",
      currentValue: current.totalUsers ?? 0,
      previousValue: previous.totalUsers ?? 0,
      changePercent: calculateChangePercent(current.totalUsers ?? 0, previous.totalUsers ?? 0),
      format: "number",
    },
    {
      id: "newUsers",
      label: "New users",
      currentValue: current.newUsers ?? 0,
      previousValue: previous.newUsers ?? 0,
      changePercent: calculateChangePercent(current.newUsers ?? 0, previous.newUsers ?? 0),
      format: "number",
    },
    {
      id: "sessions",
      label: "Sessions",
      currentValue: current.sessions ?? 0,
      previousValue: previous.sessions ?? 0,
      changePercent: calculateChangePercent(current.sessions ?? 0, previous.sessions ?? 0),
      format: "number",
    },
    {
      id: "engagementRate",
      label: "Engagement rate",
      currentValue: current.engagementRate ?? 0,
      previousValue: previous.engagementRate ?? 0,
      changePercent: calculateChangePercent(
        current.engagementRate ?? 0,
        previous.engagementRate ?? 0
      ),
      format: "percent",
    },
    {
      id: "averageEngagementTime",
      label: "Average engagement time",
      currentValue: current.averageSessionDuration ?? 0,
      previousValue: previous.averageSessionDuration ?? 0,
      changePercent: calculateChangePercent(
        current.averageSessionDuration ?? 0,
        previous.averageSessionDuration ?? 0
      ),
      format: "duration",
    },
    {
      id: "conversions",
      label: "Conversions",
      currentValue: current.keyEvents ?? 0,
      previousValue: previous.keyEvents ?? 0,
      changePercent: calculateChangePercent(current.keyEvents ?? 0, previous.keyEvents ?? 0),
      format: "number",
    },
    {
      id: "revenue",
      label: "Total revenue",
      currentValue: current.totalRevenue ?? 0,
      previousValue: previous.totalRevenue ?? 0,
      changePercent: calculateChangePercent(current.totalRevenue ?? 0, previous.totalRevenue ?? 0),
      format: "currency",
    },
  ];

  return {
    data: { metrics: metricRows },
    examplePayloads: {
      currentPeriod: currentPayload,
      previousPeriod: previousPayload,
    },
  };
}

export async function queryUsersSessionsTrend(
  client: Ga4Client,
  range: ResolvedDateRange
): Promise<{ data: TimeSeriesWidgetData; examplePayloads: Record<string, unknown> }> {
  const payload: RunReportRequest = {
    ...buildBaseRangePayload(range),
    dimensions: [{ name: "date" }],
    metrics: [{ name: "totalUsers" }, { name: "sessions" }],
    orderBys: [{ dimension: { dimensionName: "date" } }],
  };

  const report = await client.runReport(payload);
  const points =
    report.rows?.map((row) => ({
      date: normalizeGaDate(row.dimensionValues?.[0]?.value ?? ""),
      users: toNumber(row.metricValues?.[0]?.value),
      sessions: toNumber(row.metricValues?.[1]?.value),
    })) ?? [];

  return {
    data: { points },
    examplePayloads: {
      runReport: payload,
    },
  };
}

export async function queryTopPages(
  client: Ga4Client,
  range: ResolvedDateRange
): Promise<{ data: TopPagesWidgetData; examplePayloads: Record<string, unknown> }> {
  const payload: RunReportRequest = {
    ...buildBaseRangePayload(range),
    dimensions: [{ name: "pagePath" }],
    metrics: [{ name: "screenPageViews" }],
    orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
    limit: 8,
  };

  const report = await client.runReport(payload);
  const rows =
    report.rows
      ?.map((row) => ({
        page: row.dimensionValues?.[0]?.value || "/",
        views: toNumber(row.metricValues?.[0]?.value),
      }))
      .filter((row) => !isInternalPath(row.page))
      .slice(0, 8) ?? [];

  return {
    data: { rows },
    examplePayloads: {
      runReport: payload,
    },
  };
}

export async function queryAcquisitionByChannel(
  client: Ga4Client,
  range: ResolvedDateRange
): Promise<{ data: AcquisitionWidgetData; examplePayloads: Record<string, unknown> }> {
  const payload: RunReportRequest = {
    ...buildBaseRangePayload(range),
    dimensions: [{ name: "sessionDefaultChannelGroup" }],
    metrics: [{ name: "sessions" }],
    orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
    limit: 8,
  };

  const report = await client.runReport(payload);
  const rows =
    report.rows?.map((row) => ({
      channel: row.dimensionValues?.[0]?.value || "Unassigned",
      sessions: toNumber(row.metricValues?.[0]?.value),
    })) ?? [];

  return {
    data: { rows },
    examplePayloads: {
      runReport: payload,
    },
  };
}

export async function queryTopLandingPages(
  client: Ga4Client,
  range: ResolvedDateRange
): Promise<{ data: LandingPagesWidgetData; examplePayloads: Record<string, unknown> }> {
  const payload: RunReportRequest = {
    ...buildBaseRangePayload(range),
    dimensions: [{ name: "eventName" }],
    metrics: [{ name: "eventCount" }, { name: "totalUsers" }],
    dimensionFilter: {
      filter: {
        fieldName: "eventName",
        inListFilter: {
          values: NAV_EVENT_NAMES,
        },
      },
    },
    orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
    limit: 10,
  };

  const report = await client.runReport(payload);
  const rows =
    report.rows?.map((row) => ({
      target:
        NAV_EVENT_LABELS[row.dimensionValues?.[0]?.value ?? ""] ??
        (row.dimensionValues?.[0]?.value || "Unknown"),
      clicks: toNumber(row.metricValues?.[0]?.value),
      users: toNumber(row.metricValues?.[1]?.value),
    })) ?? [];

  return {
    data: { rows },
    examplePayloads: {
      runReport: payload,
    },
  };
}

export async function queryTopCampaigns(
  client: Ga4Client,
  range: ResolvedDateRange
): Promise<{ data: CampaignsWidgetData; examplePayloads: Record<string, unknown> }> {
  const payload: RunReportRequest = {
    ...buildBaseRangePayload(range),
    dimensions: [{ name: "sessionCampaignName" }],
    metrics: [{ name: "totalUsers" }, { name: "sessions" }, { name: "keyEvents" }],
    orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
    limit: 10,
  };

  const report = await client.runReport(payload);
  const rows =
    report.rows?.map((row) => ({
      campaign: row.dimensionValues?.[0]?.value || "(not set)",
      users: toNumber(row.metricValues?.[0]?.value),
      sessions: toNumber(row.metricValues?.[1]?.value),
      conversions: toNumber(row.metricValues?.[2]?.value),
    })) ?? [];

  return {
    data: { rows },
    examplePayloads: {
      runReport: payload,
    },
  };
}

export async function queryTopClicks(
  client: Ga4Client,
  range: ResolvedDateRange
): Promise<{ data: TopClicksWidgetData; examplePayloads: Record<string, unknown> }> {
  const payload: RunReportRequest = {
    ...buildBaseRangePayload(range),
    dimensions: [{ name: "eventName" }],
    metrics: [{ name: "eventCount" }, { name: "totalUsers" }],
    dimensionFilter: {
      filter: {
        fieldName: "eventName",
        stringFilter: {
          value: "^button_click_.*",
          matchType: "FULL_REGEXP",
        },
      },
    },
    orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
    limit: 10,
  };

  const report = await client.runReport(payload);
  const rows =
    report.rows?.map((row) => ({
      target: (row.dimensionValues?.[0]?.value || "button_click_unknown")
        .replace(/^button_click_/, "")
        .replace(/_/g, " "),
      clicks: toNumber(row.metricValues?.[0]?.value),
      users: toNumber(row.metricValues?.[1]?.value),
    })) ?? [];

  return {
    data: { rows },
    examplePayloads: {
      runReport: payload,
    },
  };
}
