import type { Metadata } from "next";
import { PortalOverviewPage } from "./CommandCenterPage";

export const metadata: Metadata = {
  title: "Overview",
};

export default function PortalPage() {
  return <PortalOverviewPage />;
}
