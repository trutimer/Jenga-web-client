import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

docs_dir = r"d:\VueJS\DukaPro\public\docs"
os.makedirs(docs_dir, exist_ok=True)

# Define Brand Colors
ORANGE = colors.HexColor("#F4511E")
DARK_NAVY = colors.HexColor("#122131")
LIGHT_BG = colors.HexColor("#FFF7ED")
DARK_GRAY = colors.HexColor("#334155")
BORDER_COLOR = colors.HexColor("#CBD5E1")

styles = getSampleStyleSheet()

title_style = ParagraphStyle(
    'DocTitle',
    parent=styles['Normal'],
    fontName='Helvetica-Bold',
    fontSize=18,
    leading=22,
    textColor=DARK_NAVY,
    spaceAfter=6
)

subtitle_style = ParagraphStyle(
    'DocSubTitle',
    parent=styles['Normal'],
    fontName='Helvetica-Bold',
    fontSize=10,
    leading=12,
    textColor=ORANGE,
    spaceAfter=12
)

body_style = ParagraphStyle(
    'DocBody',
    parent=styles['Normal'],
    fontName='Helvetica',
    fontSize=9.5,
    leading=14,
    textColor=DARK_GRAY,
    spaceAfter=8
)

h2_style = ParagraphStyle(
    'DocH2',
    parent=styles['Normal'],
    fontName='Helvetica-Bold',
    fontSize=12,
    leading=15,
    textColor=ORANGE,
    spaceBefore=10,
    spaceAfter=6
)

code_box_style = ParagraphStyle(
    'DocFormula',
    parent=styles['Normal'],
    fontName='Helvetica-Bold',
    fontSize=9.5,
    leading=13,
    textColor=colors.white,
    spaceAfter=4,
    alignment=1
)

def create_shift_discrepancy_pdf():
    filename = os.path.join(docs_dir, "JENGA_POS_Shift_Discrepancy_SOP.pdf")
    doc = SimpleDocTemplate(filename, pagesize=letter, leftMargin=36, rightMargin=36, topMargin=36, bottomMargin=36)
    story = []

    # Header
    story.append(Paragraph("JENGA POS PLATFORM", subtitle_style))
    story.append(Paragraph("Cashier Shift Reconciliation & Discrepancy SOP", title_style))
    story.append(HRFlowable(width="100%", thickness=2, color=ORANGE, spaceAfter=12))

    # Meta Table
    meta_data = [
        [Paragraph("<b>Document ID:</b> SOP-POS-001", body_style), Paragraph("<b>Effective Date:</b> August 2026", body_style)],
        [Paragraph("<b>Target Audience:</b> Store Owners & Managers", body_style), Paragraph("<b>Version:</b> JENGA POS v2.3.0", body_style)]
    ]
    t_meta = Table(meta_data, colWidths=[270, 270])
    t_meta.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), LIGHT_BG),
        ('PADDING', (0,0), (-1,-1), 6),
        ('BOX', (0,0), (-1,-1), 1, ORANGE)
    ]))
    story.append(t_meta)
    story.append(Spacer(1, 10))

    # Section 1: Purpose
    story.append(Paragraph("1. Purpose & Objectives", h2_style))
    story.append(Paragraph("This Standard Operating Procedure (SOP) provides store owners and branch managers with a step-by-step methodology to investigate, audit, and resolve cashier shift cash discrepancies (overages or shortages) recorded during shift closure in JENGA POS.", body_style))

    # Section 2: Formula
    story.append(Paragraph("2. Core Cash Reconciliation Formula", h2_style))
    formula_text = Paragraph("Expected Cash = Opening Cash + Cash Sales + Customer Debt Cash Payments - Cash Refunds + Total PAY_IN - Total PAY_OUT - Total CASH_DROP", code_box_style)
    t_form = Table([[formula_text]], colWidths=[540])
    t_form.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), DARK_NAVY),
        ('PADDING', (0,0), (-1,-1), 10),
        ('ALIGN', (0,0), (-1,-1), 'CENTER')
    ]))
    story.append(t_form)
    story.append(Spacer(1, 10))

    # Section 3: Causes Matrix
    story.append(Paragraph("3. Operational Discrepancy Causes", h2_style))
    matrix_data = [
        [Paragraph("<b>Operational Event</b>", body_style), Paragraph("<b>Drawer Cash</b>", body_style), Paragraph("<b>Result</b>", body_style), Paragraph("<b>Action</b>", body_style)],
        [Paragraph("Customer paid M-Pesa, Cashier selected CASH", body_style), Paragraph("Unchanged", body_style), Paragraph("<font color='#991B1B'><b>Shortage</b></font>", body_style), Paragraph("Check M-Pesa SMS statements", body_style)],
        [Paragraph("Customer paid CASH, Cashier selected M-Pesa/Card", body_style), Paragraph("Increased", body_style), Paragraph("<font color='#166534'><b>Overage</b></font>", body_style), Paragraph("Audit digital sales log", body_style)],
        [Paragraph("Unrecorded Petty Cash Payout (Expense)", body_style), Paragraph("Decreased", body_style), Paragraph("<font color='#991B1B'><b>Shortage</b></font>", body_style), Paragraph("Search drawer for signed vouchers", body_style)],
        [Paragraph("Unrecorded Safe Cash Drop to Manager Safe", body_style), Paragraph("Decreased", body_style), Paragraph("<font color='#991B1B'><b>Shortage</b></font>", body_style), Paragraph("Cross-check safe deposit log", body_style)],
        [Paragraph("Unrecorded Float Top-Up (PAY_IN)", body_style), Paragraph("Increased", body_style), Paragraph("<font color='#166534'><b>Overage</b></font>", body_style), Paragraph("Verify manager float topup", body_style)],
    ]
    t_mat = Table(matrix_data, colWidths=[180, 80, 80, 200])
    t_mat.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), ORANGE),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('PADDING', (0,0), (-1,-1), 6)
    ]))
    story.append(t_mat)
    story.append(Spacer(1, 12))

    # Footer notice
    story.append(HRFlowable(width="100%", thickness=1, color=BORDER_COLOR, spaceAfter=8))
    story.append(Paragraph("Copyright © 2026 JENGA POS Platform™. All Rights Reserved.", ParagraphStyle('Footer', parent=styles['Normal'], fontSize=8, textColor=DARK_GRAY, alignment=1)))

    doc.build(story)
    print("Generated:", filename)

def create_eod_guide_pdf():
    filename = os.path.join(docs_dir, "JENGA_POS_End_of_Day_Reconciliation_Guide.pdf")
    doc = SimpleDocTemplate(filename, pagesize=letter, leftMargin=36, rightMargin=36, topMargin=36, bottomMargin=36)
    story = []

    story.append(Paragraph("JENGA POS PLATFORM", subtitle_style))
    story.append(Paragraph("End-of-Day (EOD) Financial Closing & Ledger Guide", title_style))
    story.append(HRFlowable(width="100%", thickness=2, color=ORANGE, spaceAfter=12))

    story.append(Paragraph("1. EOD Closing Procedure", h2_style))
    story.append(Paragraph("At the end of every business operating day, store owners must consolidate all active register shifts, perform cash drawer reconciliations, and lock the daily financial ledger.", body_style))

    story.append(Paragraph("2. Steps for Daily Financial Consolidation", h2_style))
    steps = [
        "<b>Step 1:</b> Ensure all cashiers have ended active shifts and declared actual cash drawer counts.",
        "<b>Step 2:</b> Navigate to <i>Dashboard -> Financial Command Center -> Consolidate EOD Financials</i>.",
        "<b>Step 3:</b> Verify realized gross profit margins, cost of goods sold (COGS), and net tax liabilities.",
        "<b>Step 4:</b> Export daily ledger summary CSV / PDF report for store accounting archives."
    ]
    for step in steps:
        story.append(Paragraph(f"• {step}", body_style))

    story.append(Spacer(1, 15))
    story.append(HRFlowable(width="100%", thickness=1, color=BORDER_COLOR, spaceAfter=8))
    story.append(Paragraph("Copyright © 2026 JENGA POS Platform™. All Rights Reserved.", ParagraphStyle('Footer', parent=styles['Normal'], fontSize=8, textColor=DARK_GRAY, alignment=1)))

    doc.build(story)
    print("Generated:", filename)

def create_inventory_sop_pdf():
    filename = os.path.join(docs_dir, "JENGA_POS_Inventory_and_Stock_Control_SOP.pdf")
    doc = SimpleDocTemplate(filename, pagesize=letter, leftMargin=36, rightMargin=36, topMargin=36, bottomMargin=36)
    story = []

    story.append(Paragraph("JENGA POS PLATFORM", subtitle_style))
    story.append(Paragraph("Inventory Management & Stock Control SOP", title_style))
    story.append(HRFlowable(width="100%", thickness=2, color=ORANGE, spaceAfter=12))

    story.append(Paragraph("1. Stock Governance Overview", h2_style))
    story.append(Paragraph("Proper inventory control ensures accurate stock valuation, eliminates shrinkage, and alerts store managers to reorder low-stock items before stockouts occur.", body_style))

    story.append(Paragraph("2. Standard Operating Rules", h2_style))
    rules = [
        "<b>Receiving Stock:</b> All incoming shipments must be received via <i>Purchases -> Receive Stock</i> with supplier invoice attached.",
        "<b>Barcode Labeling:</b> Ensure all items have scannable barcodes or quick-browse tiles assigned.",
        "<b>Stock Count Recounts:</b> Perform weekly spot counts on high-velocity items and monthly full catalog inventory audits.",
        "<b>Damaged Stock Write-offs:</b> Record damaged or expired stock under <i>Inventory -> Stock Adjustments -> Damaged</i> to post proper loss entries."
    ]
    for rule in rules:
        story.append(Paragraph(f"• {rule}", body_style))

    story.append(Spacer(1, 15))
    story.append(HRFlowable(width="100%", thickness=1, color=BORDER_COLOR, spaceAfter=8))
    story.append(Paragraph("Copyright © 2026 JENGA POS Platform™. All Rights Reserved.", ParagraphStyle('Footer', parent=styles['Normal'], fontSize=8, textColor=DARK_GRAY, alignment=1)))

    doc.build(story)
    print("Generated:", filename)

def create_user_manual_pdf():
    filename = os.path.join(docs_dir, "JENGA_POS_User_Manual_and_Quick_Start.pdf")
    doc = SimpleDocTemplate(filename, pagesize=letter, leftMargin=36, rightMargin=36, topMargin=36, bottomMargin=36)
    story = []

    story.append(Paragraph("JENGA POS PLATFORM", subtitle_style))
    story.append(Paragraph("Cashier & Store Manager Quick Start Manual", title_style))
    story.append(HRFlowable(width="100%", thickness=2, color=ORANGE, spaceAfter=12))

    story.append(Paragraph("1. Welcome to Jenga POS", h2_style))
    story.append(Paragraph("Jenga POS is a modern point-of-sale system designed for fast cashier checkouts, real-time stock tracking, and automated financial accounting.", body_style))

    story.append(Paragraph("2. Quick Start Guide for Cashiers", h2_style))
    guide = [
        "<b>Starting Shift:</b> Log in with your phone number & password. Open shift by declaring starting cash float.",
        "<b>Processing Sales:</b> Scan item barcodes or click catalog tiles. Select payment method (Cash, M-Pesa, Card, Credit).",
        "<b>Printing Receipts:</b> Receipts auto-print upon checkout completion. You can also reprint from <i>Receipt Preview</i>.",
        "<b>Ending Shift:</b> Click <i>End Register Shift</i>, physically count cash drawer, and input counted total."
    ]
    for g in guide:
        story.append(Paragraph(f"• {g}", body_style))

    story.append(Spacer(1, 15))
    story.append(HRFlowable(width="100%", thickness=1, color=BORDER_COLOR, spaceAfter=8))
    story.append(Paragraph("Copyright © 2026 JENGA POS Platform™. All Rights Reserved.", ParagraphStyle('Footer', parent=styles['Normal'], fontSize=8, textColor=DARK_GRAY, alignment=1)))

    doc.build(story)
    print("Generated:", filename)

if __name__ == "__main__":
    create_shift_discrepancy_pdf()
    create_eod_guide_pdf()
    create_inventory_sop_pdf()
    create_user_manual_pdf()
