"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type {
  AnalyticsPlaceholders,
  DateRangeInput,
  DateRangePreset,
  WidgetResponse,
} from "@/app/lib/analytics/contracts";

export type AnalyticsWidgetState<TData> = {
  loading: boolean;
  configured: boolean;
  error: string | null;
  data: TData | null;
  keyEvents: string[];
  rangeLabel: string;
  examplePayloads: Record<string, unknown> | null;
  placeholders: AnalyticsPlaceholders | null;
};

type RequestState<TData> = {
  key: string;
  response: WidgetResponse<TData> | null;
  error: string | null;
};

const clientCache = new Map<string, WidgetResponse<unknown>>();

function isPreset(value: string): value is DateRangePreset {
  return value === "7d" || value === "28d" || value === "90d" || value === "custom";
}

export type DashboardDateRange = {
  preset: DateRangePreset;
  startDate?: string;
  endDate?: string;
};

const FALLBACK_RANGE: DashboardDateRange = {
  preset: "28d",
};

export function parseDashboardDateRangeFromQuery(search: string): DashboardDateRange {
  const params = new URLSearchParams(search);
  const presetValue = params.get("preset") ?? FALLBACK_RANGE.preset;
  const preset = isPreset(presetValue) ? presetValue : FALLBACK_RANGE.preset;

  if (preset !== "custom") {
    return { preset };
  }

  return {
    preset,
    startDate: params.get("startDate") ?? undefined,
    endDate: params.get("endDate") ?? undefined,
  };
}

export function toRangeParams(range: DateRangeInput): URLSearchParams {
  const params = new URLSearchParams({ preset: range.preset });
  if (range.preset === "custom" && range.startDate && range.endDate) {
    params.set("startDate", range.startDate);
    params.set("endDate", range.endDate);
  }
  return params;
}

function makeCacheKey(endpoint: string, range: DateRangeInput): string {
  return `${endpoint}?${toRangeParams(range).toString()}`;
}

function toLoadedState<TData>(response: WidgetResponse<TData>): AnalyticsWidgetState<TData> {
  if (!response.configured) {
    return {
      loading: false,
      configured: false,
      error: response.error,
      data: null,
      keyEvents: [],
      rangeLabel: "",
      examplePayloads: null,
      placeholders: response.placeholders,
    };
  }

  return {
    loading: false,
    configured: true,
    error: null,
    data: response.data,
    keyEvents: response.keyEvents,
    rangeLabel: response.range.label,
    examplePayloads: response.examplePayloads,
    placeholders: null,
  };
}

function loadingState<TData>(): AnalyticsWidgetState<TData> {
  return {
    loading: true,
    configured: true,
    error: null,
    data: null,
    keyEvents: [],
    rangeLabel: "",
    examplePayloads: null,
    placeholders: null,
  };
}

export function clearAnalyticsClientCache(): void {
  clientCache.clear();
}

function parseResponseBody(
  responseText: string
): WidgetResponse<unknown> | null {
  if (!responseText.trim()) {
    return null;
  }

  try {
    return JSON.parse(responseText) as WidgetResponse<unknown>;
  } catch {
    return null;
  }
}

export function useAnalyticsWidget<TData>(
  endpoint: string,
  range: DateRangeInput,
  refreshNonce: number
): AnalyticsWidgetState<TData> {
  const router = useRouter();
  const cacheKey = useMemo(() => makeCacheKey(endpoint, range), [endpoint, range]);

  const [requestState, setRequestState] = useState<RequestState<TData>>(() => {
    const cached = clientCache.get(cacheKey) as WidgetResponse<TData> | undefined;
    return {
      key: cacheKey,
      response: cached ?? null,
      error: null,
    };
  });

  const cachedResponse = clientCache.get(cacheKey) as WidgetResponse<TData> | undefined;
  const responseForKey = cachedResponse ?? (requestState.key === cacheKey ? requestState.response : null);
  const errorForKey = requestState.key === cacheKey ? requestState.error : null;

  useEffect(() => {
    const cacheHit = clientCache.get(cacheKey) as WidgetResponse<TData> | undefined;
    if (cacheHit) {
      return;
    }

    let isActive = true;
    const controller = new AbortController();

    fetch(cacheKey, { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        if (response.status === 401) {
          router.push("/login?redirectTo=/admin&error=session-expired");
          return;
        }

        const responseText = await response.text();
        const parsed = parseResponseBody(responseText) as WidgetResponse<TData> | null;

        if (!parsed) {
          const summary = responseText.trim();
          const details = summary ? ` ${summary.slice(0, 240)}` : "";
          throw new Error(`Analytics API ${response.status} ${response.statusText}.${details}`);
        }

        if (!response.ok && parsed.configured) {
          throw new Error("Unexpected analytics response shape.");
        }

        clientCache.set(cacheKey, parsed as WidgetResponse<unknown>);
        if (isActive) {
          setRequestState({
            key: cacheKey,
            response: parsed,
            error: null,
          });
        }
      })
      .catch((error) => {
        if (!isActive || controller.signal.aborted) {
          return;
        }

        const message = error instanceof Error ? error.message : "Failed to load widget.";
        setRequestState({
          key: cacheKey,
          response: null,
          error: message,
        });
      });

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [cacheKey, refreshNonce, router]);

  if (responseForKey) {
    return toLoadedState(responseForKey);
  }

  if (errorForKey) {
    return {
      loading: false,
      configured: false,
      error: errorForKey,
      data: null,
      keyEvents: [],
      rangeLabel: "",
      examplePayloads: null,
      placeholders: null,
    };
  }

  return loadingState<TData>();
}
