import type { AnalyticsWidgetState } from "@/app/admin/lib/use-analytics-widget";
import { formatInteger } from "@/app/admin/lib/formatters";
import type { CampaignsWidgetData } from "@/app/lib/analytics/contracts";
import { WidgetPanel } from "@/app/admin/components/WidgetPanel";

type CampaignsTableProps = {
  state: AnalyticsWidgetState<CampaignsWidgetData>;
};

export function CampaignsTable({ state }: CampaignsTableProps) {
  const rows = state.data?.rows ?? [];

  return (
    <WidgetPanel
      title="Top campaigns"
      subtitle="Users, sessions, and conversions"
      loading={state.loading}
      error={state.error}
      empty={rows.length === 0}
      emptyMessage="No campaign data returned for this range."
      className="dash-widget--table"
    >
      <div className="dash-table-wrap">
        <table className="dash-table">
          <thead>
            <tr>
              <th scope="col">Campaign</th>
              <th scope="col">Users</th>
              <th scope="col">Sessions</th>
              <th scope="col">Conversions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={`${row.campaign}-${row.sessions}`}>
                <th scope="row">{row.campaign}</th>
                <td>{formatInteger(row.users)}</td>
                <td>{formatInteger(row.sessions)}</td>
                <td>{formatInteger(row.conversions)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </WidgetPanel>
  );
}