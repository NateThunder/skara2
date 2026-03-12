export function formatInteger(value: number): string {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);
}

export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

export function formatChangePercent(value: number | null): string {
  if (value === null) {
    return "--";
  }

  const prefix = value > 0 ? "+" : "";
  return `${prefix}${value.toFixed(1)}%`;
}

export function formatDurationSeconds(value: number): string {
  const safeSeconds = Math.max(0, Math.round(value));
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;

  if (minutes === 0) {
    return `${seconds}s`;
  }

  return `${minutes}m ${seconds}s`;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatShortDate(isoDate: string): string {
  const parsed = new Date(`${isoDate}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) {
    return isoDate;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(parsed);
}

export function formatMetricValue(value: number, format: "number" | "percent" | "duration" | "currency"): string {
  if (format === "percent") {
    return formatPercent(value);
  }

  if (format === "duration") {
    return formatDurationSeconds(value);
  }

  if (format === "currency") {
    return formatCurrency(value);
  }

  return formatInteger(value);
}
