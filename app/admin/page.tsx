"use client";

import { useEffect, useMemo, useState } from "react";
import { AcquisitionDonutChart } from "@/app/admin/components/AcquisitionDonutChart";
import { CampaignsTable } from "@/app/admin/components/CampaignsTable";
import { DashboardHeader } from "@/app/admin/components/DashboardHeader";
import { DashboardLayout } from "@/app/admin/components/DashboardLayout";
import { KPIGrid } from "@/app/admin/components/KPIGrid";
import { LandingPagesTable } from "@/app/admin/components/LandingPagesTable";
import { SetupPanel } from "@/app/admin/components/SetupPanel";
import { SidebarNav } from "@/app/admin/components/SidebarNav";
import { TopClicksTable } from "@/app/admin/components/TopClicksTable";
import { TopPagesChart } from "@/app/admin/components/TopPagesChart";
import { UsersSessionsChart } from "@/app/admin/components/UsersSessionsChart";
import {
  clearAnalyticsClientCache,
  type DashboardDateRange,
  useAnalyticsWidget,
} from "@/app/admin/lib/use-analytics-widget";
import type {
  AcquisitionWidgetData,
  CampaignsWidgetData,
  DateRangePreset,
  KpisWidgetData,
  LandingPagesWidgetData,
  TimeSeriesWidgetData,
  TopClicksWidgetData,
  TopPagesWidgetData,
} from "@/app/lib/analytics/contracts";
import type { NavLayoutMode } from "@/app/lib/site-content";

function dateToIso(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function addUtcDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function getDefaultCustomRange(): Pick<DashboardDateRange, "startDate" | "endDate"> {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  return {
    startDate: dateToIso(addUtcDays(today, -27)),
    endDate: dateToIso(today),
  };
}

function parseIsoDate(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const parsed = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
}

function getRangeLabel(range: DashboardDateRange): string {
  if (range.preset === "7d") {
    return "Last 7 days";
  }

  if (range.preset === "90d") {
    return "Last 90 days";
  }

  if (range.preset === "custom") {
    return `${range.startDate ?? "-"} to ${range.endDate ?? "-"}`;
  }

  return "Last 28 days";
}

export default function AdminPage() {
  const customDefaults = useMemo(() => getDefaultCustomRange(), []);

  const [refreshNonce, setRefreshNonce] = useState(0);
  const [customError, setCustomError] = useState<string | null>(null);
  const [navLayoutMode, setNavLayoutMode] = useState<NavLayoutMode>("hamburger");
  const [controls, setControls] = useState<DashboardDateRange>({
    preset: "28d",
    startDate: customDefaults.startDate,
    endDate: customDefaults.endDate,
  });
  const [activeRange, setActiveRange] = useState<DashboardDateRange>({
    preset: "28d",
  });

  const kpiState = useAnalyticsWidget<KpisWidgetData>(
    "/api/admin/analytics/kpis",
    activeRange,
    refreshNonce
  );
  const trendState = useAnalyticsWidget<TimeSeriesWidgetData>(
    "/api/admin/analytics/timeseries",
    activeRange,
    refreshNonce
  );
  const topPagesState = useAnalyticsWidget<TopPagesWidgetData>(
    "/api/admin/analytics/top-pages",
    activeRange,
    refreshNonce
  );
  const acquisitionState = useAnalyticsWidget<AcquisitionWidgetData>(
    "/api/admin/analytics/acquisition",
    activeRange,
    refreshNonce
  );
  const landingPagesState = useAnalyticsWidget<LandingPagesWidgetData>(
    "/api/admin/analytics/landing-pages",
    activeRange,
    refreshNonce
  );
  const campaignsState = useAnalyticsWidget<CampaignsWidgetData>(
    "/api/admin/analytics/campaigns",
    activeRange,
    refreshNonce
  );
  const topClicksState = useAnalyticsWidget<TopClicksWidgetData>(
    "/api/admin/analytics/top-clicks",
    activeRange,
    refreshNonce
  );

  const allStates = [
    kpiState,
    trendState,
    topPagesState,
    acquisitionState,
    landingPagesState,
    campaignsState,
    topClicksState,
  ];

  const isLoadingAny = allStates.some((state) => state.loading);
  const activeRangeLabel =
    allStates.find((state) => state.rangeLabel)?.rangeLabel || getRangeLabel(activeRange);
  const keyEvents = allStates.find((state) => state.keyEvents.length > 0)?.keyEvents ?? [];

  const configurationError = allStates.find((state) => !state.loading && !state.configured)?.error;

  useEffect(() => {
    let active = true;

    const loadNavLayoutMode = async () => {
      try {
        const response = await fetch("/api/admin/nav-layout", { cache: "no-store" });
        const json = (await response.json()) as { mode?: string; error?: string };

        if (!response.ok) {
          throw new Error(json.error ?? "Failed to load navigation mode.");
        }

        if (active && (json.mode === "full" || json.mode === "hamburger")) {
          setNavLayoutMode(json.mode);
        }
      } catch (error) {
        console.error("Failed to load global nav layout mode:", error);
      }
    };

    void loadNavLayoutMode();

    return () => {
      active = false;
    };
  }, []);

  const applyPreset = (preset: DateRangePreset) => {
    setControls((current) => ({ ...current, preset }));
    setCustomError(null);

    if (preset !== "custom") {
      setActiveRange({ preset });
    }
  };

  const applyCustomRange = () => {
    const startDate = controls.startDate ?? "";
    const endDate = controls.endDate ?? "";

    const start = parseIsoDate(startDate);
    const end = parseIsoDate(endDate);
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    if (!start || !end) {
      setCustomError("Custom range requires valid start and end dates.");
      return;
    }

    if (start > end) {
      setCustomError("Start date cannot be after end date.");
      return;
    }

    if (end > today) {
      setCustomError("End date cannot be in the future.");
      return;
    }

    setCustomError(null);
    setActiveRange({
      preset: "custom",
      startDate,
      endDate,
    });
  };

  const handleRefresh = () => {
    clearAnalyticsClientCache();
    setRefreshNonce((value) => value + 1);
  };

  const handleNavLayoutChange = (nextMode: NavLayoutMode) => {
    if (nextMode === navLayoutMode) {
      return;
    }

    const previousMode = navLayoutMode;
    setNavLayoutMode(nextMode);

    void (async () => {
      try {
        const response = await fetch("/api/admin/nav-layout", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ mode: nextMode }),
        });
        const json = (await response.json()) as { mode?: string; error?: string };

        if (!response.ok || (json.mode !== "full" && json.mode !== "hamburger")) {
          throw new Error(json.error ?? "Failed to update navigation mode.");
        }

        setNavLayoutMode(json.mode);
      } catch (error) {
        console.error("Failed to save global nav layout mode:", error);
        setNavLayoutMode(previousMode);
      }
    })();
  };

  const setupExamples = [
    { id: "kpis", title: "KPI cards", payloads: kpiState.examplePayloads },
    { id: "timeseries", title: "Users and sessions trend", payloads: trendState.examplePayloads },
    { id: "top-pages", title: "Top pages chart", payloads: topPagesState.examplePayloads },
    {
      id: "acquisition",
      title: "Acquisition donut",
      payloads: acquisitionState.examplePayloads,
    },
    {
      id: "landing-pages",
      title: "Navigation items table",
      payloads: landingPagesState.examplePayloads,
    },
    { id: "campaigns", title: "Campaigns table", payloads: campaignsState.examplePayloads },
    { id: "top-clicks", title: "Top clicks table", payloads: topClicksState.examplePayloads },
  ];

  return (
    <div className="dash-page">
      <DashboardLayout
        sidebar={<SidebarNav />}
        header={
          <DashboardHeader
            controls={controls}
            onPresetChange={applyPreset}
            onCustomDateChange={(field, value) =>
              setControls((current) => ({
                ...current,
                [field]: value,
              }))
            }
            onApplyCustom={applyCustomRange}
            onRefresh={handleRefresh}
            loading={isLoadingAny}
            customError={customError}
            activeRangeLabel={activeRangeLabel}
            isFullNavEnabled={navLayoutMode === "full"}
            onNavLayoutChange={handleNavLayoutChange}
          />
        }
      >
        {configurationError ? (
          <section className="dash-alert" role="status">
            <h2>GA4 configuration required</h2>
            <p>{configurationError}</p>
          </section>
        ) : null}

        <section className="dash-section">
          <KPIGrid state={kpiState} />
        </section>

        <section className="dash-grid dash-grid--charts">
          <UsersSessionsChart state={trendState} />
          <TopPagesChart state={topPagesState} />
          <AcquisitionDonutChart state={acquisitionState} />
        </section>

        <section className="dash-grid dash-grid--tables">
          <LandingPagesTable state={landingPagesState} />
          <CampaignsTable state={campaignsState} />
          <TopClicksTable state={topClicksState} />
        </section>

        <SetupPanel keyEvents={keyEvents} examples={setupExamples} />
      </DashboardLayout>
    </div>
  );
}
