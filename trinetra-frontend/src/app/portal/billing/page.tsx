import type { Metadata } from "next";
import { BillingPage } from "./BillingPage";

export const metadata: Metadata = { title: "Billing" };

export default function BillingRoute() {
  return <BillingPage />;
}
