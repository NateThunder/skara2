import { NextResponse } from "next/server";
import { withAdminApiAuth } from "@/app/lib/admin/auth";
import { ANALYTICS_PLACEHOLDERS } from "@/app/lib/analytics/contracts";
import { createGa4Client } from "@/app/lib/analytics/ga4-client";

const widgetEndpoints = [
  "/api/admin/analytics/kpis",
  "/api/admin/analytics/timeseries",
  "/api/admin/analytics/top-pages",
  "/api/admin/analytics/acquisition",
  "/api/admin/analytics/landing-pages",
  "/api/admin/analytics/campaigns",
  "/api/admin/analytics/top-clicks",
];

export async function GET(request: Request) {
  return withAdminApiAuth(request, async () => {
    const clientResult = await createGa4Client();

    if (!clientResult.configured) {
      return NextResponse.json(
        {
          ...clientResult,
          widgets: widgetEndpoints,
        },
        { status: 503 }
      );
    }

    return NextResponse.json({
      configured: true,
      propertyId: clientResult.client.propertyId,
      keyEvents: clientResult.client.keyEvents,
      placeholders: ANALYTICS_PLACEHOLDERS,
      widgets: widgetEndpoints,
    });
  });
}
