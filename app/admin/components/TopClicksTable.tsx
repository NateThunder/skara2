import type { AnalyticsWidgetState } from "@/app/admin/lib/use-analytics-widget";
import { formatInteger } from "@/app/admin/lib/formatters";
import type { TopClicksWidgetData } from "@/app/lib/analytics/contracts";
import { WidgetPanel } from "@/app/admin/components/WidgetPanel";

type TopClicksTableProps = {
  state: AnalyticsWidgetState<TopClicksWidgetData>;
};

export function TopClicksTable({ state }: TopClicksTableProps) {
  const rows = state.data?.rows ?? [];

  return (
    <WidgetPanel
      title="Most clicked buttons"
      subtitle="GA4 button_click_* events (eventCount and users)"
      loading={state.loading}
      error={state.error}
      empty={rows.length === 0}
      emptyMessage="No click event data returned for this range."
      className="dash-widget--table"
    >
      <div className="dash-table-wrap">
        <table className="dash-table">
          <thead>
            <tr>
              <th scope="col">Button</th>
              <th scope="col">Clicks</th>
              <th scope="col">Users</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={`${row.target}-${row.clicks}-${index}`}>
                <th scope="row" title={row.target}>
                  {row.target}
                </th>
                <td>{formatInteger(row.clicks)}</td>
                <td>{formatInteger(row.users)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </WidgetPanel>
  );
}