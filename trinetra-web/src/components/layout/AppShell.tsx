"use client";

import * as React from "react";
import { Sidebar, type SidebarProps } from "./Sidebar";
import { TopBar, type TopBarProps } from "./TopBar";

export interface AppShellProps {
  /** Page content rendered inside main */
  children: React.ReactNode;
  /** Active path override for Sidebar navigation */
  activePath?: string;
  /** TopBar props */
  topBarProps?: TopBarProps;
  /** Sidebar props overrides */
  sidebarProps?: Partial<SidebarProps>;
  /** Restrict content area max width (default: 1440px max width container) */
  maxWidthClass?: string;
}

export function AppShell({
  children,
  activePath,
  topBarProps,
  sidebarProps,
  maxWidthClass = "max-w-[1440px]",
}: AppShellProps) {
  // Collapse state for desktop sidebar
  const [collapsed, setCollapsed] = React.useState(false);
  // Mobile drawer state
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const toggleCollapse = React.useCallback(() => {
    setCollapsed((prev) => !prev);
  }, []);

  const openMobileMenu = React.useCallback(() => {
    setMobileOpen(true);
  }, []);

  const closeMobileMenu = React.useCallback(() => {
    setMobileOpen(false);
  }, []);

  return (
    <div className="min-h-screen bg-surface-app flex flex-col antialiased font-sans text-text-primary">
      {/* Sidebar Navigation */}
      <Sidebar
        activePath={activePath}
        collapsed={collapsed}
        onToggleCollapse={toggleCollapse}
        mobileOpen={mobileOpen}
        onCloseMobile={closeMobileMenu}
        {...sidebarProps}
      />

      {/* Main Layout Area — Offset by desktop sidebar width */}
      <div
        className={[
          "flex-1 flex flex-col transition-all duration-200 ease-in-out",
          collapsed ? "lg:pl-16" : "lg:pl-60",
        ].join(" ")}
      >
        {/* TopBar */}
        <TopBar
          onOpenMobileMenu={openMobileMenu}
          {...topBarProps}
        />

        {/* Main Content Area */}
        <main id="main-content" className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className={["mx-auto w-full flex flex-col gap-6", maxWidthClass].join(" ")}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
