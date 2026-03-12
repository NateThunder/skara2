import type { AnalyticsWidgetState } from "@/app/admin/lib/use-analytics-widget";
import { formatInteger, formatShortDate } from "@/app/admin/lib/formatters";
import type { TimeSeriesWidgetData } from "@/app/lib/analytics/contracts";
import { WidgetPanel } from "@/app/admin/components/WidgetPanel";

type UsersSessionsChartProps = {
  state: AnalyticsWidgetState<TimeSeriesWidgetData>;
};

type ChartPoint = {
  x: number;
  y: number;
};

function toPolyline(points: ChartPoint[]): string {
  return points.map((point) => `${point.x},${point.y}`).join(" ");
}

export function UsersSessionsChart({ state }: UsersSessionsChartProps) {
  const series = state.data?.points ?? [];
  const hasData = series.length > 0;
  const width = 840;
  const height = 320;
  const paddingTop = 24;
  const paddingRight = 24;
  const paddingBottom = 46;
  const paddingLeft = 52;

  const maxValue = Math.max(
    1,
    ...series.flatMap((point) => [point.users, point.sessions])
  );

  const innerWidth = width - paddingLeft - paddingRight;
  const innerHeight = height - paddingTop - paddingBottom;

  const usersPoints = series.map((point, index) => {
    const denominator = Math.max(series.length - 1, 1);
    const x = paddingLeft + (index / denominator) * innerWidth;
    const y = paddingTop + (1 - point.users / maxValue) * innerHeight;
    return { x, y };
  });

  const sessionsPoints = series.map((point, index) => {
    const denominator = Math.max(series.length - 1, 1);
    const x = paddingLeft + (index / denominator) * innerWidth;
    const y = paddingTop + (1 - point.sessions / maxValue) * innerHeight;
    return { x, y };
  });

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((ratio) => {
    const value = Math.round(maxValue * (1 - ratio));
    return {
      y: paddingTop + ratio * innerHeight,
      value,
    };
  });

  const xTickIndexes = Array.from(
    new Set([0, Math.floor((series.length - 1) / 3), Math.floor(((series.length - 1) * 2) / 3), series.length - 1])
  ).filter((index) => index >= 0);

  return (
    <WidgetPanel
      title="Users vs sessions over time"
      subtitle="Daily granularity"
      loading={state.loading}
      error={state.error}
      empty={!hasData}
      emptyMessage="No users or sessions data for this range."
      className="dash-widget--line"
    >
      {hasData ? (
        <div className="dash-line-chart-wrap" id="charts">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="dash-line-chart"
            role="img"
            aria-label="Line chart of users and sessions over time"
          >
            {yTicks.map((tick) => (
              <g key={`tick-${tick.y}`}>
                <line
                  x1={paddingLeft}
                  x2={width - paddingRight}
                  y1={tick.y}
                  y2={tick.y}
                  className="dash-line-chart__grid"
                />
                <text x={paddingLeft - 10} y={tick.y + 4} className="dash-line-chart__label">
                  {formatInteger(tick.value)}
                </text>
              </g>
            ))}

            <polyline
              fill="none"
              points={toPolyline(usersPoints)}
              className="dash-line-chart__line dash-line-chart__line--users"
            />
            <polyline
              fill="none"
              points={toPolyline(sessionsPoints)}
              className="dash-line-chart__line dash-line-chart__line--sessions"
            />

            {usersPoints.map((point, index) => (
              <circle key={`users-${index}`} cx={point.x} cy={point.y} r={3} className="dash-line-chart__dot dash-line-chart__dot--users">
                <title>
                  {formatShortDate(series[index].date)} users: {formatInteger(series[index].users)}
                </title>
              </circle>
            ))}
            {sessionsPoints.map((point, index) => (
              <circle
                key={`sessions-${index}`}
                cx={point.x}
                cy={point.y}
                r={3}
                className="dash-line-chart__dot dash-line-chart__dot--sessions"
              >
                <title>
                  {formatShortDate(series[index].date)} sessions: {formatInteger(series[index].sessions)}
                </title>
              </circle>
            ))}

            {xTickIndexes.map((index) => {
              const denominator = Math.max(series.length - 1, 1);
              const x = paddingLeft + (index / denominator) * innerWidth;
              return (
                <text key={`x-tick-${index}`} x={x} y={height - 14} className="dash-line-chart__label" textAnchor="middle">
                  {formatShortDate(series[index].date)}
                </text>
              );
            })}
          </svg>

          <div className="dash-legend">
            <span>
              <i className="dash-legend__swatch dash-legend__swatch--users" aria-hidden="true" /> Users
            </span>
            <span>
              <i className="dash-legend__swatch dash-legend__swatch--sessions" aria-hidden="true" /> Sessions
            </span>
          </div>
        </div>
      ) : null}
    </WidgetPanel>
  );
}
