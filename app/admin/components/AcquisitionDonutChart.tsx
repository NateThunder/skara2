import type { AnalyticsWidgetState } from "@/app/admin/lib/use-analytics-widget";
import { formatInteger } from "@/app/admin/lib/formatters";
import type { AcquisitionWidgetData } from "@/app/lib/analytics/contracts";
import { WidgetPanel } from "@/app/admin/components/WidgetPanel";

const donutColors = [
  "#0f9f8f",
  "#14b08a",
  "#4ecdc4",
  "#2f80ed",
  "#5cc98a",
  "#f4b04f",
  "#f97363",
  "#5f7f7a",
];

type AcquisitionDonutChartProps = {
  state: AnalyticsWidgetState<AcquisitionWidgetData>;
};

export function AcquisitionDonutChart({ state }: AcquisitionDonutChartProps) {
  const rows = state.data?.rows ?? [];
  const totalSessions = rows.reduce((sum, row) => sum + row.sessions, 0);

  const radius = 74;
  const circumference = 2 * Math.PI * radius;
  const arcs = rows.reduce<{
    offset: number;
    items: Array<{
      channel: string;
      sessions: number;
      color: string;
      dashArray: string;
      dashOffset: number;
      percent: number;
    }>;
  }>(
    (accumulator, row, index) => {
      const size = totalSessions > 0 ? (row.sessions / totalSessions) * circumference : 0;
      const item = {
        channel: row.channel,
        sessions: row.sessions,
        color: donutColors[index % donutColors.length],
        dashArray: `${size} ${circumference}`,
        dashOffset: -accumulator.offset,
        percent: totalSessions > 0 ? (row.sessions / totalSessions) * 100 : 0,
      };

      return {
        offset: accumulator.offset + size,
        items: [...accumulator.items, item],
      };
    },
    { offset: 0, items: [] }
  ).items;

  return (
    <WidgetPanel
      title="Traffic acquisition"
      subtitle="Sessions by default channel group"
      loading={state.loading}
      error={state.error}
      empty={rows.length === 0}
      emptyMessage="No acquisition data returned for this range."
      className="dash-widget--donut"
    >
      <div className="dash-donut-wrap">
        <svg viewBox="0 0 220 220" className="dash-donut" role="img" aria-label="Traffic acquisition donut chart">
          <circle cx="110" cy="110" r={radius} className="dash-donut__base" />
          {arcs.map((arc) => (
            <circle
              key={arc.channel}
              cx="110"
              cy="110"
              r={radius}
              className="dash-donut__arc"
              stroke={arc.color}
              strokeDasharray={arc.dashArray}
              strokeDashoffset={arc.dashOffset}
            >
              <title>
                {arc.channel}: {formatInteger(arc.sessions)} sessions ({arc.percent.toFixed(1)}%)
              </title>
            </circle>
          ))}
          <text x="110" y="100" textAnchor="middle" className="dash-donut__total-label">
            Sessions
          </text>
          <text x="110" y="122" textAnchor="middle" className="dash-donut__total-value">
            {formatInteger(totalSessions)}
          </text>
        </svg>

        <ul className="dash-donut-legend">
          {arcs.map((arc) => (
            <li key={`legend-${arc.channel}`}>
              <span className="dash-donut-legend__label">
                <i style={{ backgroundColor: arc.color }} aria-hidden="true" />
                {arc.channel}
              </span>
              <span className="dash-donut-legend__value">{arc.percent.toFixed(1)}%</span>
            </li>
          ))}
        </ul>
      </div>
    </WidgetPanel>
  );
}
