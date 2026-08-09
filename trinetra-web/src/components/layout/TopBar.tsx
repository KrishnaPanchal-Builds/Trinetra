"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, Bell, BookOpen, ExternalLink, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Tooltip } from "@/components/ui/Tooltip";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface TopBarProps {
  /** Page title or current breadcrumb hierarchy */
  title?: string;
  breadcrumbs?: BreadcrumbItem[];
  /** Environment indicator string e.g. "Sandbox" | "Live API" */
  environment?: "sandbox" | "production";
  /** Mobile menu toggle handler */
  onOpenMobileMenu?: () => void;
  /** Right-hand utility slot overrides or additions */
  actions?: React.ReactNode;
}

export function TopBar({
  title = "Command Center",
  breadcrumbs,
  environment = "sandbox",
  onOpenMobileMenu,
  actions,
}: TopBarProps) {
  return (
    <header className="h-14 bg-surface-base border-b border-border-default px-4 lg:px-6 flex items-center justify-between sticky top-0 z-20 select-none">
      {/* Left section: Mobile toggle + Breadcrumb / Title */}
      <div className="flex items-center gap-3 min-w-0">
        {onOpenMobileMenu && (
          <button
            type="button"
            onClick={onOpenMobileMenu}
            aria-label="Open navigation menu"
            className="lg:hidden p-1.5 rounded text-text-secondary hover:bg-surface-subtle hover:text-text-primary focus-visible:outline-2 focus-visible:outline-brand-500"
          >
            <Menu className="size-5" aria-hidden="true" />
          </button>
        )}

        <div className="flex items-center gap-2 min-w-0">
          {breadcrumbs && breadcrumbs.length > 0 ? (
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-text-tertiary truncate">
              {breadcrumbs.map((item, idx) => {
                const isLast = idx === breadcrumbs.length - 1;
                return (
                  <React.Fragment key={idx}>
                    {idx > 0 && <span className="text-text-tertiary select-none">/</span>}
                    {item.href && !isLast ? (
                      <Link
                        href={item.href}
                        className="hover:text-text-primary transition-colors truncate"
                      >
                        {item.label}
                      </Link>
                    ) : (
                      <span className={isLast ? "font-semibold text-text-primary text-sm truncate" : "truncate"}>
                        {item.label}
                      </span>
                    )}
                  </React.Fragment>
                );
              })}
            </nav>
          ) : (
            <h1 className="text-base font-semibold text-text-primary tracking-tight truncate">
              {title}
            </h1>
          )}
        </div>
      </div>

      {/* Right section: Environment badge + Actions */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Environment Badge */}
        <Badge variant={environment === "production" ? "production" : "sandbox"}>
          <ShieldCheck className="size-3 mr-0.5 inline" aria-hidden="true" />
          {environment === "production" ? "LIVE API" : "SANDBOX"}
        </Badge>

        {/* Custom Actions or default utilities */}
        {actions ? (
          actions
        ) : (
          <div className="flex items-center gap-1.5">
            {/* Documentation Link */}
            <Tooltip content="API Documentation" side="bottom">
              <Link
                href="/developers"
                target="_blank"
                rel="noreferrer"
                aria-label="API Documentation"
                className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-surface-subtle rounded transition-colors focus-visible:outline-2 focus-visible:outline-brand-500"
              >
                <BookOpen className="size-3.5" aria-hidden="true" />
                <span>Docs</span>
                <ExternalLink className="size-3 text-text-tertiary" aria-hidden="true" />
              </Link>
            </Tooltip>

            {/* Notification Indicator */}
            <Tooltip content="Notifications & System Health" side="bottom">
              <button
                type="button"
                aria-label="Notifications"
                className="relative p-1.5 rounded text-text-secondary hover:bg-surface-subtle hover:text-text-primary transition-colors focus-visible:outline-2 focus-visible:outline-brand-500"
              >
                <Bell className="size-4" aria-hidden="true" />
                <span className="absolute top-1 right-1 size-1.5 rounded-full bg-brand-500" aria-hidden="true" />
              </button>
            </Tooltip>
          </div>
        )}
      </div>
    </header>
  );
}
