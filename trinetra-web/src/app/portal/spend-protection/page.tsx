import type { Metadata } from "next";
import { SpendProtectionPage } from "./SpendProtectionPage";

export const metadata: Metadata = { title: "Spend Protection" };

export default function SpendProtectionRoute() {
  return <SpendProtectionPage />;
}
