import type { Metadata } from "next";
import { SandboxPage } from "./SandboxPage";

export const metadata: Metadata = { title: "Sandbox" };

export default function SandboxRoute() {
  return <SandboxPage />;
}
