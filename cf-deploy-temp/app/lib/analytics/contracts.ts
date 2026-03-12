export type DateRangePreset = "7d" | "28d" | "90d" | "custom";

export type DateRangeInput = {
  preset: DateRangePreset;
  startDate?: string;
  endDate?: string;
};

export type DateRangeWindow = {
  startDate: string;
  endDate: string;
};

export type ResolvedDateRange = {
  preset: DateRangePreset;
  label: string;
  days: number;
  current: DateRangeWindow;
  previous: DateRangeWindow;
  cacheKey: string;
};

export type AnalyticsPlaceholders = {
  propertyIdEnv: "GOOGLE_ANALYTICS_PROPERTY_ID";
  credentialsEnvs: ["GOOGLE_APPLICATION_CREDENTIALS", "GOOGLE_CLIENT_EMAIL", "GOOGLE_PRIVATE_KEY"];
  keyEventsEnv: "GA4_KEY_EVENTS";
};

export const ANALYTICS_PLACEHOLDERS: AnalyticsPlaceholders = {
  propertyIdEnv: "GOOGLE_ANALYTICS_PROPERTY_ID",
  credentialsEnvs: [
    "GOOGLE_APPLICATION_CREDENTIALS",
    "GOOGLE_CLIENT_EMAIL",
    "GOOGLE_PRIVATE_KEY",
  ],
  keyEventsEnv: "GA4_KEY_EVENTS",
};

export type WidgetErrorResponse = {
  configured: false;
  error: string;
  placeholders: AnalyticsPlaceholders;
};

export type MetricFormat = "number" | "percent" | "duration" | "currency";

export type KpiMetricId =
  | "users"
  | "newUsers"
  | "sessions"
  | "engagementRate"
  | "averageEngagementTime"
  | "conversions"
  | "revenue";

export type KpiMetric = {
  id: KpiMetricId;
  label: string;
  currentValue: number;
  previousValue: number;
  changePercent: number | null;
  format: MetricFormat;
};

export type KpisWidgetData = {
  metrics: KpiMetric[];
};

export type TimeSeriesPoint = {
  date: string;
  users: number;
  sessions: number;
};

export type TimeSeriesWidgetData = {
  points: TimeSeriesPoint[];
};

export type TopPageRow = {
  page: string;
  views: number;
};

export type TopPagesWidgetData = {
  rows: TopPageRow[];
};

export type AcquisitionRow = {
  channel: string;
  sessions: number;
};

export type AcquisitionWidgetData = {
  rows: AcquisitionRow[];
};

export type LandingPageRow = {
  target: string;
  clicks: number;
  users: number;
};

export type LandingPagesWidgetData = {
  rows: LandingPageRow[];
};

export type TopClickRow = {
  target: string;
  clicks: number;
  users: number;
};

export type TopClicksWidgetData = {
  rows: TopClickRow[];
};

export type CampaignRow = {
  campaign: string;
  users: number;
  sessions: number;
  conversions: number;
};

export type CampaignsWidgetData = {
  rows: CampaignRow[];
};

export type WidgetSuccessResponse<TData> = {
  configured: true;
  range: Pick<ResolvedDateRange, "preset" | "label" | "days" | "current" | "previous">;
  keyEvents: string[];
  data: TData;
  examplePayloads: Record<string, unknown>;
};

export type WidgetResponse<TData> = WidgetSuccessResponse<TData> | WidgetErrorResponse;
