import type { ReactNode } from "react";

type WidgetPanelProps = {
  title: string;
  subtitle?: string;
  loading: boolean;
  error?: string | null;
  empty?: boolean;
  emptyMessage?: string;
  children?: ReactNode;
  className?: string;
  meta?: ReactNode;
};

export function WidgetPanel({
  title,
  subtitle,
  loading,
  error,
  empty,
  emptyMessage,
  children,
  className,
  meta,
}: WidgetPanelProps) {
  return (
    <section className={`dash-widget ${className ?? ""}`.trim()} aria-live="polite">
      <header className="dash-widget__head">
        <div>
          <h2 className="dash-widget__title">{title}</h2>
          {subtitle ? <p className="dash-widget__subtitle">{subtitle}</p> : null}
        </div>
        {meta ? <div className="dash-widget__meta">{meta}</div> : null}
      </header>

      {loading ? <p className="dash-widget__state">Loading...</p> : null}

      {!loading && error ? <p className="dash-widget__state dash-widget__state--error">{error}</p> : null}

      {!loading && !error && empty ? (
        <p className="dash-widget__state">{emptyMessage ?? "No data available for this range."}</p>
      ) : null}

      {!loading && !error && !empty ? <div className="dash-widget__body">{children}</div> : null}
    </section>
  );
}
