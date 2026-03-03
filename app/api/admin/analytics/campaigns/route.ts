import { createWidgetHandlerResponse } from "@/app/api/admin/analytics/_shared";
import { queryTopCampaigns } from "@/app/lib/analytics/queries";

export async function GET(request: Request) {
  return createWidgetHandlerResponse(request, "campaigns", queryTopCampaigns);
}
