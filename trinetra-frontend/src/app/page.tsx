import type { Metadata } from "next";
import {
  Header,
  Hero,
  VerificationProblem,
  ArchitectureDiagram,
  ForensicModules,
  VerificationWorkflow,
  DeveloperIntegration,
  ActionableData,
  Pricing,
  FinalCTA,
  Footer,
} from "@/components/marketing";

export const metadata: Metadata = {
  title: "TRINETRA — Synthetic Media Verification Infrastructure",
  description:
    "A forensic verification API for detecting AI-generated content, deepfakes, provenance issues, and metadata tampering. Built for platforms that need reliable, auditable signal at scale.",
};

export default function HomePage() {
  return (
    <>
      {/* 1. Header — persistent public navigation */}
      <Header />

      <main id="main-content">
        {/* 2. Hero */}
        <Hero />

        {/* 3. Verification problem / risk section */}
        <VerificationProblem />

        {/* 4. One API. Multiple verification signals. */}
        <ArchitectureDiagram />

        {/* 5. Comprehensive forensic analysis. */}
        <ForensicModules />

        {/* 6. From media upload to verification decision. */}
        <VerificationWorkflow />

        {/* 7. Built for developers. Designed for integration. */}
        <DeveloperIntegration />

        {/* 8. Actionable verification data. */}
        <ActionableData />

        {/* 9. Simple, usage-based verification. (Pricing) */}
        <Pricing />

        {/* 10. Final CTA */}
        <FinalCTA />
      </main>

      {/* 11. Footer */}
      <Footer />
    </>
  );
}
