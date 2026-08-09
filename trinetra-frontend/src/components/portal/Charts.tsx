"use client";

import React from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BarChartDataPoint {
  label: string;      // x-axis label (e.g. "Aug 8")
  value: number;      // primary bar value
  value2?: number;    // optional secondary/comparison bar
  highlight?: boolean; // flag today or peak
}

export interface InlineBarChartProps {
  data: BarChartDataPoint[];
  height?: number;
  barColor?: string;
  bar2Color?: string;
  formatY?: (v: number) => string;
  formatTooltip?: (point: BarChartDataPoint) => string;
  showXLabels?: boolean;
  /** Show every N-th x label to avoid crowding (default: 1) */
  xLabelInterval?: number;
  className?: string;
  "aria-label"?: string;
}

// ─── Bar Chart (pure SVG, no external deps) ───────────────────────────────────
// Renders a simple column chart using SVG. Respects design tokens via CSS vars.

export function InlineBarChart({
  data,
  height = 140,
  barColor = "var(--color-brand-500)",
  bar2Color = "var(--color-surface-raised)",
  formatY,
  formatTooltip,
  showXLabels = true,
  xLabelInterval = 1,
  className = "",
  "aria-label": ariaLabel,
}: InlineBarChartProps) {
  const [hovered, setHovered] = React.useState<number | null>(null);

  const PADDING = { top: 8, right: 4, bottom: showXLabels ? 28 : 8, left: 40 };
  const maxVal = Math.max(...data.map((d) => Math.max(d.value, d.value2 ?? 0)), 1);
  const chartW = 100; // percent — SVG viewBox uses 100 units wide
  const chartH = height;
  const plotW = chartW - PADDING.left - PADDING.right;
  const plotH = chartH - PADDING.top - PADDING.bottom;

  const n = data.length;
  const totalGap = n > 1 ? n - 1 : 0;
  const barW = (plotW - totalGap * 1.5) / n;

  const yTickCount = 4;
  const yStep = maxVal / yTickCount;

  return (
    <div className={["relative w-full overflow-hidden", className].join(" ")}>
      <svg
        viewBox={`0 0 100 ${chartH}`}
        preserveAspectRatio="none"
        className="w-full"
        style={{ height: `${chartH}px` }}
        role="img"
        aria-label={ariaLabel ?? "Bar chart"}
      >
        {/* Y-axis gridlines */}
        {Array.from({ length: yTickCount + 1 }).map((_, i) => {
          const y = PADDING.top + plotH - (i / yTickCount) * plotH;
          const val = i * yStep;
          return (
            <g key={i}>
              <line
                x1={PADDING.left}
                y1={y}
                x2={PADDING.left + plotW}
                y2={y}
                stroke="var(--color-border-default)"
                strokeWidth={0.25}
              />
              <text
                x={PADDING.left - 1.5}
                y={y + 1}
                textAnchor="end"
                fontSize={4.5}
                fill="var(--color-text-tertiary)"
                fontFamily="var(--font-mono)"
              >
                {formatY ? formatY(val) : Math.round(val).toLocaleString()}
              </text>
            </g>
          );
        })}

        {/* Bars */}
        {data.map((point, i) => {
          const x = PADDING.left + i * (barW + 1.5);
          const barH = (point.value / maxVal) * plotH;
          const bar2H = point.value2 ? (point.value2 / maxVal) * plotH : 0;
          const isHovered = hovered === i;
          const isHighlight = point.highlight;

          return (
            <g
              key={i}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor: "default" }}
            >
              {/* Hover zone */}
              <rect
                x={x - 0.5}
                y={PADDING.top}
                width={barW + 1}
                height={plotH}
                fill={isHovered ? "var(--color-surface-subtle)" : "transparent"}
                rx={1}
              />

              {/* Secondary bar (behind) */}
              {point.value2 !== undefined && (
                <rect
                  x={x}
                  y={PADDING.top + plotH - bar2H}
                  width={barW}
                  height={bar2H}
                  fill={bar2Color}
                  rx={0.5}
                />
              )}

              {/* Primary bar */}
              <rect
                x={x}
                y={PADDING.top + plotH - barH}
                width={barW}
                height={Math.max(barH, 0.5)}
                fill={isHighlight ? "var(--color-brand-400)" : barColor}
                opacity={isHovered ? 1 : 0.85}
                rx={0.5}
              />

              {/* X label */}
              {showXLabels && i % xLabelInterval === 0 && (
                <text
                  x={x + barW / 2}
                  y={chartH - 2}
                  textAnchor="middle"
                  fontSize={4}
                  fill="var(--color-text-tertiary)"
                  fontFamily="var(--font-mono)"
                >
                  {point.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Tooltip (positioned absolute over chart) */}
      {hovered !== null && data[hovered] && (
        <div
          className="pointer-events-none absolute top-1 px-2 py-1 bg-text-primary text-text-inverse text-[10px] font-mono rounded shadow-tooltip whitespace-nowrap z-10"
          style={{
            left: `${(hovered / data.length) * 100}%`,
            transform: "translateX(-50%)",
          }}
          role="tooltip"
        >
          {formatTooltip
            ? formatTooltip(data[hovered])
            : `${data[hovered].label}: ${data[hovered].value.toLocaleString()}`}
        </div>
      )}
    </div>
  );
}

// ─── Horizontal proportion bar (for breakdowns) ───────────────────────────────

export interface ProportionSegment {
  label: string;
  value: number;
  color: string; // CSS color value
}

export interface ProportionBarProps {
  segments: ProportionSegment[];
  total?: number; // if omitted, sums segments
  className?: string;
}

export function ProportionBar({ segments, total, className = "" }: ProportionBarProps) {
  const sum = total ?? segments.reduce((a, s) => a + s.value, 0);

  return (
    <div className={["flex flex-col gap-2", className].join(" ")}>
      {/* Bar track */}
      <div className="flex h-2 w-full overflow-hidden rounded-full bg-surface-raised" role="presentation">
        {segments.map((seg) => {
          const pct = sum > 0 ? (seg.value / sum) * 100 : 0;
          return (
            <div
              key={seg.label}
              style={{ width: `${pct}%`, backgroundColor: seg.color }}
              title={`${seg.label}: ${seg.value.toLocaleString()} (${pct.toFixed(1)}%)`}
            />
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5">
        {segments.map((seg) => {
          const pct = sum > 0 ? (seg.value / sum) * 100 : 0;
          return (
            <div key={seg.label} className="flex items-center gap-1.5">
              <span
                className="size-2 rounded-sm shrink-0"
                style={{ backgroundColor: seg.color }}
                aria-hidden="true"
              />
              <span className="text-xs text-text-secondary">{seg.label}</span>
              <span className="font-mono text-xs text-text-tertiary">
                {seg.value.toLocaleString()} ({pct.toFixed(1)}%)
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
