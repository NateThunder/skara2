import type { DateRangePreset, ResolvedDateRange } from "@/app/lib/analytics/contracts";

const PRESET_DAY_COUNTS: Record<Exclude<DateRangePreset, "custom">, number> = {
  "7d": 7,
  "28d": 28,
  "90d": 90,
};

function startOfUtcDay(date: Date): Date {
  const next = new Date(date);
  next.setUTCHours(0, 0, 0, 0);
  return next;
}

function addUtcDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function parseIsoDate(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const parsed = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  if (formatDate(parsed) !== value) {
    return null;
  }

  return parsed;
}

function daysBetweenInclusive(start: Date, end: Date): number {
  const millis = end.getTime() - start.getTime();
  return Math.floor(millis / 86_400_000) + 1;
}

function isPreset(value: string | null): value is DateRangePreset {
  return value === "7d" || value === "28d" || value === "90d" || value === "custom";
}

export function resolveDateRange(searchParams: URLSearchParams): ResolvedDateRange {
  const today = startOfUtcDay(new Date());
  const requestedPreset = searchParams.get("preset");
  const preset: DateRangePreset = isPreset(requestedPreset) ? requestedPreset : "28d";

  let currentStart: Date;
  let currentEnd: Date;
  let label: string;
  let days: number;

  if (preset === "custom") {
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!startDate || !endDate) {
      throw new Error("Custom date range requires startDate and endDate in YYYY-MM-DD format.");
    }

    const parsedStart = parseIsoDate(startDate);
    const parsedEnd = parseIsoDate(endDate);

    if (!parsedStart || !parsedEnd) {
      throw new Error("Invalid custom dates. Use YYYY-MM-DD format.");
    }

    if (parsedEnd < parsedStart) {
      throw new Error("Custom endDate must be on or after startDate.");
    }

    if (parsedEnd > today) {
      throw new Error("Custom endDate cannot be in the future.");
    }

    days = daysBetweenInclusive(parsedStart, parsedEnd);
    if (days > 366) {
      throw new Error("Custom range is too large. Please use 366 days or fewer.");
    }

    currentStart = parsedStart;
    currentEnd = parsedEnd;
    label = `${formatDate(parsedStart)} to ${formatDate(parsedEnd)}`;
  } else {
    days = PRESET_DAY_COUNTS[preset];
    currentEnd = today;
    currentStart = addUtcDays(today, -(days - 1));
    label = `Last ${days} days`;
  }

  const previousEnd = addUtcDays(currentStart, -1);
  const previousStart = addUtcDays(previousEnd, -(days - 1));

  return {
    preset,
    label,
    days,
    current: {
      startDate: formatDate(currentStart),
      endDate: formatDate(currentEnd),
    },
    previous: {
      startDate: formatDate(previousStart),
      endDate: formatDate(previousEnd),
    },
    cacheKey: `${preset}:${formatDate(currentStart)}:${formatDate(currentEnd)}`,
  };
}
