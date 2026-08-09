import type { Metadata } from "next";
import { MOCK_ANALYSES } from "@/lib/mock/analyses";
import { AnalysisDetailPage } from "./AnalysisDetailPage";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return { title: `Analysis ${id}` };
}

export default async function AnalysisDetailRoute({ params }: Props) {
  const { id } = await params;
  const entry = MOCK_ANALYSES.find((a) => a.task_id === id);
  if (!entry) notFound();
  return <AnalysisDetailPage entry={entry} />;
}
