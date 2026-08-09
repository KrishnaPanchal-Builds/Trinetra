import type { Metadata } from "next";
import { AnalysisLogsPage } from "./AnalysisLogsPage";

export const metadata: Metadata = {
  title: "Analysis Logs",
};

export default function LogsPage() {
  return <AnalysisLogsPage />;
}
