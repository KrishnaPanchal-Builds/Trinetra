import type { Metadata } from "next";
import { WebhooksPage } from "./WebhooksPage";

export const metadata: Metadata = { title: "Webhooks" };

export default function WebhooksRoute() {
  return <WebhooksPage />;
}
