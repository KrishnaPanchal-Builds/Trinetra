import type { Metadata } from "next";
import { UsagePage } from "./UsagePage";

export const metadata: Metadata = { title: "Usage & Credits" };

export default function UsageRoute() {
  return <UsagePage />;
}
