import type { AnalyticsWidgetState } from "@/app/admin/lib/use-analytics-widget";
import { formatInteger } from "@/app/admin/lib/formatters";
import type { TopPagesWidgetData } from "@/app/lib/analytics/contracts";
import { WidgetPanel } from "@/app/admin/components/WidgetPanel";

type TopPagesChartProps = {
  state: AnalyticsWidgetState<TopPagesWidgetData>;
};

export function TopPagesChart({ state }: TopPagesChartProps) {
  const rows = state.data?.rows ?? [];
  const maxViews = Math.max(1, ...rows.map((row) => row.views));

  return (
    <WidgetPanel
      title="Top pages/screens by views"
      subtitle="Ordered by screenPageViews"
      loading={state.loading}
      error={state.error}
      empty={rows.length === 0}
      emptyMessage="No page-level data returned for this range."
      className="dash-widget--bar"
    >
      <div className="dash-bars" aria-label="Top pages bar chart">
        {rows.map((row) => (
          <div className="dash-bars__row" key={`${row.page}-${row.views}`}>
            <div className="dash-bars__labels">
              <span className="dash-bars__name" title={row.page}>
                {row.page}
              </span>
              <span className="dash-bars__value">{formatInteger(row.views)}</span>
            </div>
            <div className="dash-bars__track" aria-hidden="true">
              <div className="dash-bars__fill" style={{ width: `${(row.views / maxViews) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </WidgetPanel>
  );
}