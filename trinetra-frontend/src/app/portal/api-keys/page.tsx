import type { Metadata } from "next";
import { APIKeysPage } from "./APIKeysPage";

export const metadata: Metadata = { title: "API Keys" };

export default function APIKeysRoute() {
  return <APIKeysPage />;
}
