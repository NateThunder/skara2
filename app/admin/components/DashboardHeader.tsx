import Link from "next/link";
import type { DashboardDateRange } from "@/app/admin/lib/use-analytics-widget";
import type { DateRangePreset } from "@/app/lib/analytics/contracts";

const presetOptions: Array<{ value: DateRangePreset; label: string }> = [
  { value: "7d", label: "Last 7 days" },
  { value: "28d", label: "Last 28 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "custom", label: "Custom" },
];

type DashboardHeaderProps = {
  controls: DashboardDateRange;
  onPresetChange: (preset: DateRangePreset) => void;
  onCustomDateChange: (field: "startDate" | "endDate", value: string) => void;
  onApplyCustom: () => void;
  onRefresh: () => void;
  loading: boolean;
  customError: string | null;
  activeRangeLabel: string;
};

export function DashboardHeader({
  controls,
  onPresetChange,
  onCustomDateChange,
  onApplyCustom,
  onRefresh,
  loading,
  customError,
  activeRangeLabel,
}: DashboardHeaderProps) {
  return (
    <div className="dash-header__grid">
      <div className="dash-header__title-wrap">
        <h1 className="dash-header__title">Performance dashboard</h1>
        <p className="dash-header__subtitle">
          Explore user growth, engagement, acquisition channels, landing pages, and campaign impact.
        </p>
      </div>

      <div className="dash-header__actions">
        <div className="dash-header__quick-actions">
          <button
            type="button"
            className="dash-btn dash-btn--ghost"
            onClick={onRefresh}
            disabled={loading}
            aria-label="Refresh all analytics widgets"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" width="14" height="14">
              <path
                d="M20 12a8 8 0 1 1-2.34-5.66"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M20 4v6h-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>{loading ? "Refreshing..." : "Refresh Page"}</span>
          </button>
          <Link href="/" className="dash-btn dash-btn--ghost">
            <svg aria-hidden="true" viewBox="0 0 24 24" width="14" height="14">
              <path
                d="M3 11.5L12 4l9 7.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M6 10v10h12V10"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>Back to Website</span>
          </Link>
        </div>

        <div className="dash-range" role="group" aria-label="Select date range">
          <div className="dash-range__presets">
            {presetOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`dash-range__preset${controls.preset === option.value ? " is-active" : ""}`}
                onClick={() => onPresetChange(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>

          {controls.preset === "custom" ? (
            <div className="dash-range__custom">
              <label>
                <span>Start</span>
                <input
                  type="date"
                  value={controls.startDate ?? ""}
                  onChange={(event) => onCustomDateChange("startDate", event.target.value)}
                />
              </label>
              <label>
                <span>End</span>
                <input
                  type="date"
                  value={controls.endDate ?? ""}
                  onChange={(event) => onCustomDateChange("endDate", event.target.value)}
                />
              </label>
              <button type="button" className="dash-btn dash-btn--primary" onClick={onApplyCustom}>
                Apply
              </button>
            </div>
          ) : null}

          {customError ? <p className="dash-range__error">{customError}</p> : null}
          <p className="dash-range__meta">Active range: {activeRangeLabel}</p>
        </div>
      </div>
    </div>
  );
}
