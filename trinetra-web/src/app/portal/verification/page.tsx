import type { Metadata } from "next";
import { VerificationPage } from "./VerificationPage";

export const metadata: Metadata = {
  title: "Verification",
};

export default function PortalVerificationPage() {
  return <VerificationPage />;
}
