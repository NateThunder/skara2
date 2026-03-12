import type { AnalyticsWidgetState } from "@/app/admin/lib/use-analytics-widget";
import { formatChangePercent, formatMetricValue } from "@/app/admin/lib/formatters";
import type { KpisWidgetData } from "@/app/lib/analytics/contracts";
import { WidgetPanel } from "@/app/admin/components/WidgetPanel";

type KPIGridProps = {
  state: AnalyticsWidgetState<KpisWidgetData>;
};

function changeClassName(changePercent: number | null): string {
  if (changePercent === null || changePercent === 0) {
    return "dash-kpi__change";
  }

  return changePercent > 0 ? "dash-kpi__change is-positive" : "dash-kpi__change is-negative";
}

export function KPIGrid({ state }: KPIGridProps) {
  const isEmpty = Boolean(state.configured && state.data && state.data.metrics.length === 0);

  return (
    <WidgetPanel
      title="Key performance indicators"
      subtitle="Compared with the previous equivalent period"
      loading={state.loading}
      error={state.error}
      empty={isEmpty}
      emptyMessage="No KPI metrics returned for the selected range."
      meta={
        state.keyEvents.length > 0 ? (
          <span className="dash-note">Key events: {state.keyEvents.join(", ")}</span>
        ) : (
          <span className="dash-note">Conversions are GA4 key events configured in your property.</span>
        )
      }
    >
      {!state.data ? null : (
        <div className="dash-kpi-grid" id="kpis">
          {state.data.metrics.map((metric) => (
            <article key={metric.id} className="dash-kpi" tabIndex={0}>
              <p className="dash-kpi__label">{metric.label}</p>
              <p className="dash-kpi__value">{formatMetricValue(metric.currentValue, metric.format)}</p>
              <p className={changeClassName(metric.changePercent)}>
                {formatChangePercent(metric.changePercent)} vs previous period
              </p>
            </article>
          ))}
        </div>
      )}
    </WidgetPanel>
  );
}
