import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s — TRINETRA Portal",
    default: "TRINETRA Portal",
  },
  description: "TRINETRA authenticated portal — analysis logs, API keys, webhooks, and usage.",
};

// The portal layout passes children straight through — AppShell is composed
// per-page so each page can pass its own topBarProps (title/breadcrumbs).
export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
