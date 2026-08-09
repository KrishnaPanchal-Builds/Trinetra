import React from "react";
import { Waves, Shield, FileSearch, Scan } from "lucide-react";

const MODULES = [
  {
    id: "MOD_01",
    name: "Detection",
    icon: Scan,
    description:
      "Identifies artifacts and statistical patterns associated with generative models across video frames, static images, and audio tracks. Runs multiple specialized detectors in parallel and fuses their outputs into a single probability score.",
    signals: ["GAN artifacts", "Temporal inconsistency", "Audio synthesis traces", "Facial boundary anomalies"],
  },
  {
    id: "MOD_02",
    name: "Provenance & C2PA",
    icon: Shield,
    description:
      "Validates cryptographic manifests embedded by generative tools and traces the origin of media assets where provenance data is present. Detects stripped or unsigned manifests and flags assets that claim organic origins without supporting cryptographic evidence.",
    signals: ["C2PA manifest parsing", "Tool signature extraction", "Manifest integrity check", "Unsigned content flagging"],
  },
  {
    id: "MOD_03",
    name: "Metadata",
    icon: FileSearch,
    description:
      "Analyzes file structure, EXIF data, and container metadata for signs of tampering, selective stripping, or internal inconsistency. Discrepancies between reported capture conditions and physical sensor data are surfaced as verification signals.",
    signals: ["EXIF field analysis", "Container structure check", "Capture condition verification", "Metadata stripping detection"],
  },
  {
    id: "MOD_04",
    name: "Forensic Signals",
    icon: Waves,
    description:
      "Examines lower-level signal properties including sensor noise profiles, compression artifacts, spectral anomalies, and re-encoding traces. These signals are typically invisible to the human eye but detectable through forensic analysis.",
    signals: ["Camera noise analysis", "Compression artifact tracing", "Spectral anomaly detection", "Re-encoding fingerprinting"],
  },
];

export function ForensicModules() {
  return (
    <section
      className="bg-surface-app border-b border-border-default"
      aria-labelledby="modules-heading"
    >
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="mb-12">
          <span className="font-mono text-[11px] font-semibold text-text-tertiary uppercase tracking-widest">
            Verification Engines
          </span>
          <h2 id="modules-heading" className="mt-3 text-2xl lg:text-3xl font-bold text-text-primary tracking-tight max-w-2xl">
            Comprehensive forensic analysis.
          </h2>
          <p className="mt-3 text-base text-text-secondary max-w-2xl leading-relaxed">
            Four independent verification engines working in parallel to secure your platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {MODULES.map((mod) => {
            const Icon = mod.icon;
            return (
              <div
                key={mod.id}
                className="bg-surface-base border border-border-default rounded-md p-6 flex flex-col gap-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="size-9 rounded border border-border-default bg-surface-subtle flex items-center justify-center shrink-0">
                      <Icon className="size-4 text-text-secondary" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="font-mono text-[10px] font-semibold text-text-tertiary uppercase tracking-widest">
                        {mod.id}
                      </p>
                      <p className="text-base font-semibold text-text-primary">{mod.name}</p>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-text-secondary leading-relaxed">{mod.description}</p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {mod.signals.map((sig) => (
                    <span
                      key={sig}
                      className="px-2 py-0.5 font-mono text-[10px] text-text-tertiary border border-border-default rounded-sm bg-surface-subtle"
                    >
                      {sig}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
