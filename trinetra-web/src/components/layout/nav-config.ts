import {
  LayoutDashboard,
  ScrollText,
  FlaskConical,
  KeyRound,
  Webhook,
  BarChart2,
  CreditCard,
  ShieldAlert,
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface NavItem {
  /** Unique identifier — used for aria-current */
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  /** Optional badge count (e.g. unread alerts) */
  badge?: number;
}

export interface NavSection {
  /** Section label shown as a small uppercase divider */
  label: string;
  items: NavItem[];
}

// ─── Navigation definitions ───────────────────────────────────────────────────
// Kept here so Sidebar is pure presentation — swap nav data without touching layout.
// Sections mirror Phase 1E spec: Overview / Sandbox / Development / Observability / Organization
// Role-aware: Owner sees all sections. Architect for future RBAC filtering.

export const PORTAL_NAV: NavSection[] = [
  {
    label: "Overview",
    items: [
      {
        id: "overview",
        label: "Overview",
        href: "/portal",
        icon: LayoutDashboard,
      },
      {
        id: "sandbox",
        label: "Sandbox",
        href: "/portal/sandbox",
        icon: FlaskConical,
      },
    ],
  },
  {
    label: "Development",
    items: [
      {
        id: "api-keys",
        label: "API Keys",
        href: "/portal/api-keys",
        icon: KeyRound,
      },
      {
        id: "webhooks",
        label: "Webhooks",
        href: "/portal/webhooks",
        icon: Webhook,
      },
    ],
  },
  {
    label: "Observability",
    items: [
      {
        id: "usage",
        label: "Usage",
        href: "/portal/usage",
        icon: BarChart2,
      },
      {
        id: "logs",
        label: "Logs",
        href: "/portal/logs",
        icon: ScrollText,
      },
    ],
  },
  {
    label: "Organization",
    items: [
      {
        id: "team",
        label: "Team",
        href: "/portal/team",
        icon: Users,
      },
      {
        id: "billing",
        label: "Billing",
        href: "/portal/billing",
        icon: CreditCard,
      },
      {
        id: "spend-protection",
        label: "Spend Protection",
        href: "/portal/spend-protection",
        icon: ShieldAlert,
      },
    ],
  },
];

export const PORTAL_BOTTOM_NAV: NavItem[] = [
  {
    id: "settings",
    label: "Settings",
    href: "/portal/settings",
    icon: Settings,
  },
];
