"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, User, Shield, ChevronLeft, ChevronRight, X } from "lucide-react";
import { PORTAL_NAV, PORTAL_BOTTOM_NAV, type NavItem } from "./nav-config";
import { Tooltip } from "@/components/ui/Tooltip";

export interface SidebarProps {
  /** Active page route or current path override for testing */
  activePath?: string;
  /** Collapsed icon-only state for desktop */
  collapsed?: boolean;
  /** Callback to toggle collapse state */
  onToggleCollapse?: () => void;
  /** Mobile open state */
  mobileOpen?: boolean;
  /** Callback to close mobile sidebar overlay */
  onCloseMobile?: () => void;
  /** Company or account name */
  companyName?: string;
  /** User identifier / email */
  userEmail?: string;
}

export function Sidebar({
  activePath: activePathProp,
  collapsed = false,
  onToggleCollapse,
  mobileOpen = false,
  onCloseMobile,
  companyName = "Acme Corp",
  userEmail = "dev@acmecorp.com",
}: SidebarProps) {
  const pathname = usePathname();
  const currentPath = activePathProp ?? pathname ?? "/portal";

  const renderNavItem = (item: NavItem, isCollapsed: boolean) => {
    const isActive = currentPath === item.href || (item.href !== "/portal" && currentPath.startsWith(item.href));
    const Icon = item.icon;

    const content = (
      <Link
        key={item.id}
        href={item.href}
        onClick={onCloseMobile}
        aria-current={isActive ? "page" : undefined}
        className={[
          "group relative flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded transition-colors duration-75 select-none focus-visible:outline-2 focus-visible:outline-brand-500 focus-visible:outline-offset-2",
          isActive
            ? "bg-brand-50 text-brand-600 font-semibold"
            : "text-text-secondary hover:bg-surface-subtle hover:text-text-primary",
          isCollapsed ? "justify-center px-2" : "",
        ].join(" ")}
      >
        {/* Active left indicator bar */}
        {isActive && (
          <span
            className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r bg-brand-500"
            aria-hidden="true"
          />
        )}

        <Icon
          className={[
            "size-4 shrink-0 transition-colors",
            isActive ? "text-brand-600" : "text-text-tertiary group-hover:text-text-secondary",
          ].join(" ")}
          aria-hidden="true"
        />

        {!isCollapsed && (
          <span className="truncate flex-1">{item.label}</span>
        )}

        {!isCollapsed && item.badge !== undefined && item.badge > 0 && (
          <span className="ml-auto font-mono text-[11px] font-semibold text-brand-600 bg-brand-100 px-1.5 py-0.5 rounded-sm">
            {item.badge}
          </span>
        )}
      </Link>
    );

    if (isCollapsed) {
      return (
        <Tooltip key={item.id} content={item.label} side="right">
          {content}
        </Tooltip>
      );
    }

    return content;
  };

  const sidebarContent = (isCollapsed: boolean) => (
    <div className="flex flex-col h-full bg-surface-base text-text-primary select-none border-r border-border-default">
      {/* Brand Header */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-border-default shrink-0">
        <Link
          href="/portal"
          onClick={onCloseMobile}
          className="flex items-center gap-2.5 focus-visible:outline-2 focus-visible:outline-brand-500 focus-visible:outline-offset-2 rounded"
        >
          <div className="size-7 rounded bg-text-primary text-text-inverse flex items-center justify-center font-mono font-bold text-xs shrink-0 tracking-wider">
            T3
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="font-semibold text-sm tracking-tight text-text-primary leading-tight font-sans">
                TRINETRA
              </span>
              <span className="font-mono text-[10px] text-text-tertiary uppercase tracking-wider leading-none">
                Verification Infra
              </span>
            </div>
          )}
        </Link>

        {/* Desktop collapse toggle button */}
        {onToggleCollapse && !mobileOpen && (
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="hidden lg:flex items-center justify-center size-7 rounded text-text-tertiary hover:bg-surface-subtle hover:text-text-primary transition-colors focus-visible:outline-2 focus-visible:outline-brand-500"
          >
            {isCollapsed ? (
              <ChevronRight className="size-4" aria-hidden="true" />
            ) : (
              <ChevronLeft className="size-4" aria-hidden="true" />
            )}
          </button>
        )}

        {/* Mobile close button */}
        {onCloseMobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Close menu"
            className="lg:hidden flex items-center justify-center size-8 rounded text-text-secondary hover:bg-surface-subtle hover:text-text-primary focus-visible:outline-2 focus-visible:outline-brand-500"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Navigation items list */}
      <div className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-5">
        {PORTAL_NAV.map((section) => (
          <nav
            key={section.label}
            aria-label={section.label}
            className="flex flex-col gap-1"
          >
            {!isCollapsed && (
              <div className="px-3 mb-1 text-[11px] font-mono font-semibold uppercase tracking-wider text-text-tertiary">
                {section.label}
              </div>
            )}
            {section.items.map((item) => renderNavItem(item, isCollapsed))}
          </nav>
        ))}
      </div>

      {/* Bottom Nav & User Info */}
      <div className="p-3 border-t border-border-default flex flex-col gap-3 shrink-0 bg-surface-base">
        {/* Bottom Nav items e.g. Settings */}
        <nav aria-label="Utility navigation" className="flex flex-col gap-1">
          {PORTAL_BOTTOM_NAV.map((item) => renderNavItem(item, isCollapsed))}
        </nav>

        {/* Divider */}
        <div className="h-px bg-border-default w-full" aria-hidden="true" />

        {/* User / Org card */}
        {!isCollapsed ? (
          <div className="flex items-center justify-between gap-2 px-2 py-1.5 rounded hover:bg-surface-subtle transition-colors group">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="size-7 rounded-full bg-surface-raised border border-border-strong flex items-center justify-center text-text-secondary font-mono text-xs font-semibold shrink-0">
                <User className="size-4 text-text-secondary" aria-hidden="true" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-medium text-text-primary truncate leading-tight">
                  {companyName}
                </span>
                <span className="font-mono text-[11px] text-text-tertiary truncate leading-tight">
                  {userEmail}
                </span>
              </div>
            </div>
            <Tooltip content="Sign Out" side="top">
              <button
                type="button"
                aria-label="Sign out"
                className="size-7 rounded flex items-center justify-center text-text-tertiary hover:text-risk-critical hover:bg-risk-critical-bg transition-colors focus-visible:outline-2 focus-visible:outline-brand-500"
              >
                <LogOut className="size-3.5" aria-hidden="true" />
              </button>
            </Tooltip>
          </div>
        ) : (
          <Tooltip content={`${companyName} (${userEmail})`} side="right">
            <div className="flex justify-center py-1">
              <div className="size-7 rounded-full bg-surface-raised border border-border-strong flex items-center justify-center text-text-secondary font-mono text-xs font-semibold shrink-0">
                <Shield className="size-3.5 text-text-secondary" aria-hidden="true" />
              </div>
            </div>
          </Tooltip>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={[
          "hidden lg:block fixed top-0 bottom-0 left-0 z-30 transition-all duration-200 ease-in-out",
          collapsed ? "w-16" : "w-60",
        ].join(" ")}
      >
        {sidebarContent(collapsed)}
      </aside>

      {/* Mobile Sidebar Overlay Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-text-primary/40 backdrop-blur-none transition-opacity"
            onClick={onCloseMobile}
            aria-hidden="true"
          />

          {/* Drawer panel */}
          <div className="relative w-64 max-w-[80vw] h-full shadow-lg">
            {sidebarContent(false)}
          </div>
        </div>
      )}
    </>
  );
}
