"""
reports/pdf_generator.py
------------------------
Phase 7: PDF audit report generation using ReportLab.

Every report includes:
  - Authenticity Evidence Score (AES) with risk level
  - Per-model result breakdown table
  - Model weight version hashes (for legal reproducibility)
  - Anomaly timestamps (if available)
  - Uploader declaration vs. result mismatch flag

Reports are saved to the REPORTS_DIR and served via the gateway.
"""

from __future__ import annotations

import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm, mm
from reportlab.platypus import (
    HRFlowable,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

REPORTS_DIR = Path(os.environ.get("REPORTS_DIR", "/tmp/trinetra/reports"))
REPORTS_DIR.mkdir(parents=True, exist_ok=True)

# ─────────────────────────────────────────────────────────────────────────────
# Colour palette
# ─────────────────────────────────────────────────────────────────────────────
TRINETRA_NAVY    = colors.HexColor("#0B1D3A")
TRINETRA_BLUE    = colors.HexColor("#1A56DB")
RISK_RED         = colors.HexColor("#DC2626")
RISK_ORANGE      = colors.HexColor("#D97706")
RISK_YELLOW      = colors.HexColor("#CA8A04")
RISK_GREEN       = colors.HexColor("#16A34A")
TABLE_HEADER_BG  = colors.HexColor("#1E3A5F")
TABLE_ALT_BG     = colors.HexColor("#F0F4FF")
PAGE_BG          = colors.white


def _risk_colour(risk: str) -> Any:
    return {
        "CONFIRMED_SYNTHETIC": RISK_RED,
        "HIGH_RISK":           RISK_RED,
        "MEDIUM_RISK":         RISK_ORANGE,
        "LOW_RISK":            RISK_GREEN,
    }.get(risk, RISK_ORANGE)


def generate_pdf_report(
    task_id: str,
    aes: int,
    risk: str,
    confidence: str,
    modalities_scanned: List[str],
    model_results: Dict[str, Optional[Dict[str, Any]]],
    weight_versions: Dict[str, str],
    primary_anomaly: str,
    uploader_declaration: str = "",
    anomaly_timestamps: Optional[List[Dict[str, str]]] = None,
) -> Path:
    """
    Generate a PDF audit report and save it to REPORTS_DIR.

    Returns the path to the generated PDF file.
    """
    out_path = REPORTS_DIR / f"{task_id}.pdf"
    doc = SimpleDocTemplate(
        str(out_path),
        pagesize=A4,
        rightMargin=2 * cm,
        leftMargin=2 * cm,
        topMargin=2 * cm,
        bottomMargin=2 * cm,
    )

    styles = getSampleStyleSheet()
    story = []

    # ── Header ────────────────────────────────────────────────────────────────
    header_style = ParagraphStyle(
        "Header",
        parent=styles["Title"],
        textColor=TRINETRA_NAVY,
        fontSize=22,
        spaceAfter=4 * mm,
        alignment=TA_CENTER,
    )
    sub_style = ParagraphStyle(
        "Sub",
        parent=styles["Normal"],
        textColor=colors.grey,
        fontSize=9,
        alignment=TA_CENTER,
        spaceAfter=6 * mm,
    )

    story.append(Paragraph("TRINETRA — Deepfake Audit Report", header_style))
    story.append(Paragraph(
        f"Task ID: <b>{task_id}</b> &nbsp;|&nbsp; "
        f"Generated: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC')}",
        sub_style,
    ))
    story.append(HRFlowable(width="100%", thickness=1, color=TRINETRA_NAVY))
    story.append(Spacer(1, 5 * mm))

    # ── AES Score Banner ──────────────────────────────────────────────────────
    aes_style = ParagraphStyle(
        "AES",
        parent=styles["Heading1"],
        textColor=_risk_colour(risk),
        fontSize=36,
        alignment=TA_CENTER,
        spaceAfter=2 * mm,
    )
    risk_style = ParagraphStyle(
        "Risk",
        parent=styles["Heading2"],
        textColor=_risk_colour(risk),
        fontSize=14,
        alignment=TA_CENTER,
        spaceAfter=6 * mm,
    )

    story.append(Paragraph(f"AES: {aes}/100", aes_style))
    story.append(Paragraph(
        f"{risk.replace('_', ' ')} — Confidence: {confidence}", risk_style
    ))
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.lightgrey))
    story.append(Spacer(1, 4 * mm))

    # ── Summary Table ─────────────────────────────────────────────────────────
    label_style = ParagraphStyle("Lbl", parent=styles["Normal"], fontSize=9,
                                 textColor=colors.grey)
    value_style = ParagraphStyle("Val", parent=styles["Normal"], fontSize=10,
                                 fontName="Helvetica-Bold")

    summary_data = [
        ["Primary Anomaly", primary_anomaly.replace("_", " ")],
        ["Modalities Scanned", ", ".join(modalities_scanned) or "—"],
        ["Uploader Declaration",
         f'"{uploader_declaration}"' if uploader_declaration else "Not provided"],
        ["Action Recommendation", _action_from_risk(risk).replace("_", " ")],
    ]

    summary_table = Table(summary_data, colWidths=[5 * cm, 12 * cm])
    summary_table.setStyle(TableStyle([
        ("FONTNAME",   (0, 0), (-1, -1), "Helvetica"),
        ("FONTSIZE",   (0, 0), (-1, -1), 9),
        ("TEXTCOLOR",  (0, 0), (0, -1), colors.grey),
        ("FONTNAME",   (1, 0), (1, -1), "Helvetica-Bold"),
        ("ROWBACKGROUNDS", (0, 0), (-1, -1), [colors.white, TABLE_ALT_BG]),
        ("BOX",        (0, 0), (-1, -1), 0.25, colors.lightgrey),
        ("INNERGRID",  (0, 0), (-1, -1), 0.25, colors.lightgrey),
        ("LEFTPADDING",  (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING",   (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING",(0, 0), (-1, -1), 4),
    ]))
    story.append(summary_table)
    story.append(Spacer(1, 6 * mm))

    # ── Per-Model Results Table ───────────────────────────────────────────────
    story.append(Paragraph("Per-Model Forensic Results", styles["Heading2"]))
    story.append(Spacer(1, 2 * mm))

    model_header = ["Model", "Probability (Fake)", "Classification", "Weight Version"]
    model_rows = [model_header]
    for model_name, result in model_results.items():
        if result is None:
            row = [model_name, "N/A (container offline)", "—", "—"]
        else:
            prob = result.get("probability", 0.5)
            cls  = result.get("class", "unknown")
            ver  = weight_versions.get(model_name, "—")
            row = [model_name, f"{prob:.4f}", cls, ver]
        model_rows.append(row)

    if len(model_rows) > 1:
        model_table = Table(model_rows, colWidths=[4 * cm, 4.5 * cm, 4 * cm, 4.5 * cm])
        model_style = TableStyle([
            # Header row
            ("BACKGROUND",   (0, 0), (-1, 0), TABLE_HEADER_BG),
            ("TEXTCOLOR",    (0, 0), (-1, 0), colors.white),
            ("FONTNAME",     (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE",     (0, 0), (-1, 0), 9),
            ("ALIGN",        (0, 0), (-1, 0), "CENTER"),
            # Data rows
            ("FONTNAME",     (0, 1), (-1, -1), "Helvetica"),
            ("FONTSIZE",     (0, 1), (-1, -1), 9),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, TABLE_ALT_BG]),
            ("BOX",          (0, 0), (-1, -1), 0.5, TRINETRA_NAVY),
            ("INNERGRID",    (0, 0), (-1, -1), 0.25, colors.lightgrey),
            ("LEFTPADDING",  (0, 0), (-1, -1), 6),
            ("RIGHTPADDING", (0, 0), (-1, -1), 6),
            ("TOPPADDING",   (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING",(0, 0), (-1, -1), 4),
        ])
        # Colour-code the classification column
        for i, (_, result) in enumerate(model_results.items(), start=1):
            if result:
                cls = result.get("class", "")
                if cls == "synthetic":
                    model_style.add("TEXTCOLOR", (2, i), (2, i), RISK_RED)
                    model_style.add("FONTNAME",  (2, i), (2, i), "Helvetica-Bold")

        model_table.setStyle(model_style)
        story.append(model_table)
    else:
        story.append(Paragraph("No model results available.", styles["Normal"]))

    story.append(Spacer(1, 6 * mm))

    # ── Anomaly Timestamps ────────────────────────────────────────────────────
    if anomaly_timestamps:
        story.append(Paragraph("Anomaly Timestamps", styles["Heading2"]))
        story.append(Spacer(1, 2 * mm))
        ts_data = [["Start", "End"]] + [
            [ts.get("start", "—"), ts.get("end", "—")] for ts in anomaly_timestamps
        ]
        ts_table = Table(ts_data, colWidths=[8 * cm, 8 * cm])
        ts_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), TABLE_HEADER_BG),
            ("TEXTCOLOR",  (0, 0), (-1, 0), colors.white),
            ("FONTNAME",   (0, 0), (-1, 0), "Helvetica-Bold"),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, TABLE_ALT_BG]),
            ("BOX",        (0, 0), (-1, -1), 0.5, TRINETRA_NAVY),
            ("INNERGRID",  (0, 0), (-1, -1), 0.25, colors.lightgrey),
        ]))
        story.append(ts_table)
        story.append(Spacer(1, 6 * mm))

    # ── Legal Disclaimer ──────────────────────────────────────────────────────
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.lightgrey))
    story.append(Spacer(1, 3 * mm))
    disclaimer_style = ParagraphStyle("Disc", parent=styles["Normal"], fontSize=7,
                                      textColor=colors.grey, alignment=TA_LEFT)
    story.append(Paragraph(
        "<b>Legal Disclaimer:</b> This report is generated by an automated AI system "
        "and is intended as a decision-support tool for human reviewers. It does not "
        "constitute legal advice or a definitive determination of authenticity. "
        "TRINETRA liability is capped at amounts specified in the governing Terms of Service. "
        "All model weight versions referenced above are logged for audit reproducibility.",
        disclaimer_style,
    ))

    # ── Build PDF ─────────────────────────────────────────────────────────────
    doc.build(story)
    return out_path


def _action_from_risk(risk: str) -> str:
    return {
        "CONFIRMED_SYNTHETIC": "AUTO_TAKEDOWN",
        "HIGH_RISK":           "AUTO_HOLD_FOR_HUMAN_TRIAGE",
        "MEDIUM_RISK":         "REVIEW_RECOMMENDED",
        "LOW_RISK":            "AUTHENTIC",
    }.get(risk, "REVIEW_RECOMMENDED")
