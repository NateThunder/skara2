import type { AnalyticsWidgetState } from "@/app/admin/lib/use-analytics-widget";
import { formatInteger } from "@/app/admin/lib/formatters";
import type { LandingPagesWidgetData } from "@/app/lib/analytics/contracts";
import { WidgetPanel } from "@/app/admin/components/WidgetPanel";

type LandingPagesTableProps = {
  state: AnalyticsWidgetState<LandingPagesWidgetData>;
};

export function LandingPagesTable({ state }: LandingPagesTableProps) {
  const rows = state.data?.rows ?? [];

  return (
    <WidgetPanel
      title="Top navigation items"
      subtitle="Header and menu clicks from GA4 button_click_* events"
      loading={state.loading}
      error={state.error}
      empty={rows.length === 0}
      emptyMessage="No navigation click data returned for this range."
      className="dash-widget--table"
    >
      <div className="dash-table-wrap" id="tables">
        <table className="dash-table">
          <thead>
            <tr>
              <th scope="col">Navigation item</th>
              <th scope="col">Clicks</th>
              <th scope="col">Users</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={`${row.target}-${row.clicks}-${index}`}>
                <th scope="row">{row.target}</th>
                <td data-label="Clicks">{formatInteger(row.clicks)}</td>
                <td data-label="Users">{formatInteger(row.users)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </WidgetPanel>
  );
}
