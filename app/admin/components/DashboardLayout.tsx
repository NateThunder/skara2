import type { ReactNode } from "react";

type DashboardLayoutProps = {
  sidebar: ReactNode;
  header: ReactNode;
  children: ReactNode;
};

export function DashboardLayout({ sidebar, header, children }: DashboardLayoutProps) {
  return (
    <div className="dash-shell">
      {sidebar}
      <div className="dash-main">
        <header className="dash-header">{header}</header>
        <main className="dash-content">{children}</main>
      </div>
    </div>
  );
}
