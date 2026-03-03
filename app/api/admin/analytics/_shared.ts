import { NextResponse } from "next/server";
import type {
  ResolvedDateRange,
  WidgetErrorResponse,
  WidgetSuccessResponse,
} from "@/app/lib/analytics/contracts";
import { resolveDateRange } from "@/app/lib/analytics/date-range";
import { createGa4Client, toWidgetErrorResponse, type Ga4Client } from "@/app/lib/analytics/ga4-client";
import { withAnalyticsCache } from "@/app/lib/analytics/cache";

type QueryResult<TData> = {
  data: TData;
  examplePayloads: Record<string, unknown>;
};

type QueryHandler<TData> = (client: Ga4Client, range: ResolvedDateRange) => Promise<QueryResult<TData>>;

function withRangeSummary(range: ResolvedDateRange): WidgetSuccessResponse<unknown>["range"] {
  return {
    preset: range.preset,
    label: range.label,
    days: range.days,
    current: range.current,
    previous: range.previous,
  };
}

export async function createWidgetHandlerResponse<TData>(
  request: Request,
  widgetId: string,
  query: QueryHandler<TData>
): Promise<NextResponse<WidgetSuccessResponse<TData> | WidgetErrorResponse>> {
  let range: ResolvedDateRange;

  try {
    const url = new URL(request.url);
    range = resolveDateRange(url.searchParams);
  } catch (error) {
    const response = toWidgetErrorResponse(error);
    return NextResponse.json(response, { status: 400 });
  }

  const clientResult = await createGa4Client();
  if (!clientResult.configured) {
    return NextResponse.json(clientResult, { status: 503 });
  }

  const cacheKey = `${widgetId}:${range.cacheKey}`;

  try {
    const payload = await withAnalyticsCache(cacheKey, () => query(clientResult.client, range));

    return NextResponse.json({
      configured: true,
      range: withRangeSummary(range),
      keyEvents: clientResult.client.keyEvents,
      data: payload.data,
      examplePayloads: payload.examplePayloads,
    });
  } catch (error) {
    const response = toWidgetErrorResponse(error);
    return NextResponse.json(response, { status: 500 });
  }
}
