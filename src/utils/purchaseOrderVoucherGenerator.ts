import type { PurchaseOrder, Supplier, StoreSettings } from '../models/types';
import { formatCurrency, formatCurrencyWithoutSymbol } from '../models/mockData';

export function escapeHtml(str: unknown): string {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function generatePurchaseOrderVoucherHtml(
  po: PurchaseOrder, 
  supplier?: Supplier | null, 
  settings?: StoreSettings | null
): string {
  const currency = settings?.currency || 'TZS';
  
  // Safe resolution of store and branch name (avoids "Loading Branch..." placeholder)
  const rawSettingsName = settings?.name && settings.name !== 'Loading Branch...' ? settings.name : '';
  const storeName = escapeHtml(
    po.storeName || 
    rawSettingsName || 
    localStorage.getItem('storeName') || 
    'Jenga Store'
  );

  const branchName = escapeHtml(
    po.branchName || 
    localStorage.getItem('branchName') || 
    rawSettingsName || 
    'Main Store Branch'
  );

  const storeTin = escapeHtml(settings?.tin || '100-200-300');
  const storeAddress = escapeHtml(settings?.physicalAddress || 'Dar es Salaam, Tanzania');
  const storePhone = escapeHtml(settings?.phone || '+255 700 000 000');
  const storeEmail = escapeHtml(settings?.email || 'procurement@jengapos.com');

  // Supplier Details
  const supName = escapeHtml(supplier?.name || po.supplierName || 'General Vendor');
  const supCategory = escapeHtml(supplier?.category || 'General Merchandise');
  const supPhone = escapeHtml(supplier?.phone || 'N/A');
  const supEmail = escapeHtml(supplier?.email || 'N/A');
  const supAddress = escapeHtml((supplier as any)?.address || (supplier as any)?.physicalAddress || 'N/A');

  // Dates
  const createdDate = po.createdAt 
    ? new Date(po.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) 
    : new Date().toLocaleDateString('en-GB');
  
  const expectedDelivery = po.expectedDeliveryDate
    ? new Date(po.expectedDeliveryDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : 'Not Specified';

  // Jenga Signature Brand Colors
  const jengaOrange = '#f4511e'; // Signature Jenga Orange
  const jengaOrangeDark = '#d84315';
  const jengaOrangeLight = '#fff3e0';

  // Status Badge Colors
  let statusColor = '#059669'; // Emerald
  let statusBg = '#d1fae5';
  let statusBorder = '#6ee7b7';
  if (po.status === 'DRAFT') {
    statusColor = '#000000';
    statusBg = '#f1f5f9';
    statusBorder = '#cbd5e1';
  } else if (po.status === 'PENDING_APPROVAL') {
    statusColor = '#b45309';
    statusBg = '#fef3c7';
    statusBorder = '#fcd34d';
  } else if (po.status === 'REJECTED' || po.status === 'CANCELLED') {
    statusColor = '#dc2626';
    statusBg = '#fee2e2';
    statusBorder = '#fca5a5';
  } else if (po.status === 'PARTIALLY_RECEIVED') {
    statusColor = '#7c3aed';
    statusBg = '#ede9fe';
    statusBorder = '#c4b5fd';
  }

  const items = po.items || [];
  const totalUnits = items.reduce((sum, item) => sum + (Number(item.quantityOrdered) || 0), 0);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>PO_Voucher_${escapeHtml(po.poNumber)}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 10mm 14mm 12mm 14mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #000000;
      background: #ffffff;
      margin: 0;
      padding: 0;
      font-size: 11.5px;
      line-height: 1.45;
    }
    .voucher-wrapper {
      width: 100%;
      max-width: 100%;
      margin: 0 auto;
    }

    /* TOP CORPORATE HEADER */
    .header-bar {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 3px solid ${jengaOrange};
      padding-bottom: 14px;
      margin-bottom: 16px;
    }
    .brand-section {
      max-width: 58%;
    }
    .jenga-tag {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-size: 9px;
      font-weight: 800;
      letter-spacing: 1px;
      text-transform: uppercase;
      color: ${jengaOrange};
      margin-bottom: 4px;
    }
    .store-title {
      font-size: 22px;
      font-weight: 900;
      color: ${jengaOrange};
      letter-spacing: -0.5px;
      margin: 0 0 4px 0;
      line-height: 1.15;
    }
    .store-details {
      font-size: 11px;
      color: #000000;
      line-height: 1.45;
      margin: 0;
    }
    .store-details strong {
      color: #000000;
      font-weight: 700;
    }

    .doc-section {
      text-align: right;
    }
    .doc-badge {
      display: inline-block;
      font-size: 9px;
      font-weight: 800;
      letter-spacing: 1.2px;
      text-transform: uppercase;
      color: #ffffff;
      background: ${jengaOrange};
      padding: 3px 8px;
      border-radius: 4px;
      margin-bottom: 5px;
    }
    .doc-heading {
      font-size: 20px;
      font-weight: 900;
      color: ${jengaOrange};
      margin: 0 0 2px 0;
      letter-spacing: -0.3px;
    }
    .po-code {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 13.5px;
      font-weight: 800;
      color: #000000;
      margin-bottom: 5px;
    }
    .status-pill {
      display: inline-block;
      font-size: 9.5px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 2.5px 8px;
      border-radius: 4px;
      border: 1px solid ${statusBorder};
      background: ${statusBg};
      color: ${statusColor};
    }

    /* 2-COLUMN PARTIES CARDS */
    .parties-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
      margin-bottom: 14px;
    }
    .party-card {
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 10px 12px;
      background: #fafafa;
    }
    .party-card-title {
      font-size: 9px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: ${jengaOrange};
      margin-bottom: 6px;
      border-bottom: 1.5px solid ${jengaOrange};
      padding-bottom: 3px;
    }
    .party-name {
      font-size: 13.5px;
      font-weight: 800;
      color: #000000;
      margin-bottom: 4px;
    }
    .party-line {
      font-size: 11px;
      color: #000000;
      margin: 2px 0;
      line-height: 1.4;
    }
    .party-line strong {
      color: #000000;
      font-weight: 700;
    }

    /* ORDER ATTRIBUTES BAR */
    .order-meta-bar {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      background: #fff8f5;
      border: 1.5px solid ${jengaOrange};
      border-radius: 6px;
      padding: 8px 12px;
      margin-bottom: 16px;
    }
    .meta-col {
      font-size: 11px;
    }
    .meta-label {
      font-size: 8.5px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: ${jengaOrange};
      margin-bottom: 2px;
    }
    .meta-value {
      font-weight: 800;
      color: #000000;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    }

    /* ITEMS TABLE */
    .table-container {
      margin-bottom: 16px;
      border: 1px solid ${jengaOrange};
      border-radius: 6px;
      overflow: hidden;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11px;
    }
    thead {
      background: ${jengaOrange};
      color: #ffffff;
    }
    th {
      font-weight: 800;
      text-transform: uppercase;
      font-size: 9px;
      letter-spacing: 0.6px;
      padding: 8px 10px;
      text-align: left;
      color: #ffffff;
    }
    th.text-center { text-align: center; }
    th.text-right { text-align: right; }
    tbody tr {
      border-bottom: 1px solid #e2e8f0;
      page-break-inside: avoid;
    }
    tbody tr:nth-child(even) {
      background: #fafafa;
    }
    td {
      padding: 8px 10px;
      vertical-align: middle;
      color: #000000;
    }
    td.text-center { text-align: center; }
    td.text-right { text-align: right; }
    .item-name {
      font-weight: 800;
      color: #000000;
      display: block;
    }
    .item-sub {
      font-size: 10px;
      color: #000000;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      margin-top: 1px;
    }
    .font-mono {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    }

    /* TOTALS & NOTES ROW */
    .summary-section {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;
      page-break-inside: avoid;
    }
    .notes-box {
      width: 56%;
      border: 1px solid #cbd5e1;
      border-left: 3.5px solid ${jengaOrange};
      border-radius: 5px;
      padding: 9px 12px;
      background: #fafafa;
    }
    .notes-title {
      font-size: 9px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      color: ${jengaOrange};
      margin-bottom: 3px;
    }
    .notes-content {
      font-size: 11px;
      color: #000000;
      line-height: 1.45;
    }
    .totals-box {
      width: 40%;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      background: #fafafa;
      overflow: hidden;
    }
    .totals-row {
      display: flex;
      justify-content: space-between;
      padding: 7px 12px;
      font-size: 11px;
      color: #000000;
      border-bottom: 1px solid #e2e8f0;
    }
    .totals-row.grand-total {
      font-size: 13.5px;
      font-weight: 900;
      color: #000000;
      background: #fff3e0;
      border-top: 2px solid ${jengaOrange};
      border-bottom: none;
      padding: 9px 12px;
    }
    .totals-row.grand-total .amount {
      color: ${jengaOrange};
      font-weight: 900;
    }

    /* MAKER-CHECKER DUAL SIGNATURE BOXES */
    .sign-section {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin-bottom: 20px;
      page-break-inside: avoid;
    }
    .sign-box {
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 10px 12px;
      background: #ffffff;
      min-height: 90px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .sign-title {
      font-size: 9px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      color: ${jengaOrange};
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 3px;
    }
    .sign-space {
      height: 32px;
      border-bottom: 1px dashed #64748b;
      margin-bottom: 4px;
    }
    .sign-footer-text {
      font-size: 10px;
      font-weight: 700;
      color: #000000;
      display: flex;
      justify-content: space-between;
    }
    .sign-date {
      font-size: 9px;
      color: #000000;
      font-weight: normal;
    }

    /* FOOTER WITH JENGA BRANDING */
    .footer {
      border-top: 1.5px solid ${jengaOrange};
      padding-top: 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 9.5px;
      color: #000000;
      page-break-inside: avoid;
    }
    .footer-left {
      line-height: 1.4;
      color: #000000;
    }
    .footer-brand {
      text-align: right;
      font-weight: 800;
      color: #000000;
    }
    .footer-brand span {
      color: ${jengaOrange};
      font-weight: 900;
    }
  </style>
</head>
<body>
  <div class="voucher-wrapper">
    
    <!-- 1. CORPORATE HEADER -->
    <div class="header-bar">
      <div class="brand-section">
        <div class="jenga-tag">
          <span>●</span>
          <span>Official Procurement Voucher</span>
        </div>
        <h1 class="store-title">${storeName}</h1>
        <p class="store-details">
          <strong>TIN:</strong> ${storeTin} &nbsp;•&nbsp; <strong>Branch:</strong> ${branchName}<br>
          ${storeAddress}<br>
          Phone: ${storePhone} &nbsp;•&nbsp; Email: ${storeEmail}
        </p>
      </div>

      <div class="doc-section">
        <div class="doc-badge">PURCHASE ORDER</div>
        <div class="doc-heading">PO VOUCHER</div>
        <div class="po-code">${escapeHtml(po.poNumber || ('#' + po.id.slice(0, 8)))}</div>
        <div class="status-pill">${escapeHtml(po.status.replace(/_/g, ' '))}</div>
      </div>
    </div>

    <!-- 2. PARTIES GRID -->
    <div class="parties-grid">
      <!-- VENDOR / SUPPLIER -->
      <div class="party-card">
        <div class="party-card-title">Vendor / Supplier Information</div>
        <div class="party-name">${supName}</div>
        <div class="party-line">Category: <strong>${supCategory}</strong></div>
        <div class="party-line">Phone: <strong>${supPhone}</strong></div>
        <div class="party-line">Email: ${supEmail}</div>
        <div class="party-line">Address: ${supAddress}</div>
      </div>

      <!-- DELIVERY & RECEIVING DESTINATION -->
      <div class="party-card">
        <div class="party-card-title">Receiving Branch & Destination</div>
        <div class="party-name">${branchName}</div>
        <div class="party-line">Store: <strong>${storeName}</strong></div>
        <div class="party-line">Delivery Location: ${storeAddress}</div>
        <div class="party-line">Expected Date: <strong>${expectedDelivery}</strong></div>
        <div class="party-line">Payment Method: <strong>${escapeHtml(po.paymentType || 'CREDIT')}</strong></div>
      </div>
    </div>

    <!-- 3. ORDER ATTRIBUTES BAR -->
    <div class="order-meta-bar">
      <div class="meta-col">
        <div class="meta-label">Order Date</div>
        <div class="meta-value">${createdDate}</div>
      </div>
      <div class="meta-col">
        <div class="meta-label">Expected Delivery</div>
        <div class="meta-value">${expectedDelivery}</div>
      </div>
      <div class="meta-col">
        <div class="meta-label">Payment Terms</div>
        <div class="meta-value">${escapeHtml(po.paymentType || 'CREDIT')}</div>
      </div>
      <div class="meta-col">
        <div class="meta-label">Total Ordered Units</div>
        <div class="meta-value">${totalUnits} pcs</div>
      </div>
    </div>

    <!-- 4. ITEMS TABLE -->
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th style="width: 34px;" class="text-center">#</th>
            <th>Item Description / Code</th>
            <th class="text-center" style="width: 85px;">Qty Ordered</th>
            <th class="text-right" style="width: 110px;">Unit Cost (${currency})</th>
            <th class="text-right" style="width: 120px;">Line Total (${currency})</th>
          </tr>
        </thead>
        <tbody>
          ${items.map((item, idx) => `
            <tr>
              <td class="text-center font-mono" style="color: #000000; font-weight: 700;">${idx + 1}</td>
              <td>
                <span class="item-name">${escapeHtml(item.productName)}</span>
                <div class="item-sub">
                  ${escapeHtml(item.barcode || item.sku || 'No SKU')}
                  ${item.isWholesale ? ` • Wholesale${(item.conversionFactor || 1) > 1 ? ` (x${item.conversionFactor})` : ''}` : ''}
                  ${item.notes ? ` • Note: ${escapeHtml(item.notes)}` : ''}
                </div>
              </td>
              <td class="text-center font-mono" style="font-weight: 800; color: #000000;">
                ${item.quantityOrdered} ${item.isWholesale && (item.conversionFactor || 1) > 1 ? `packs (${item.quantityOrdered * (item.conversionFactor || 1)} pcs)` : 'pcs'}
              </td>
              <td class="text-right font-mono" style="color: #000000;">${formatCurrencyWithoutSymbol(item.unitCost, currency)}</td>
              <td class="text-right font-mono" style="font-weight: 800; color: #000000;">${formatCurrencyWithoutSymbol(item.totalCost || (item.quantityOrdered * item.unitCost), currency)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <!-- 5. FINANCIAL TOTALS & TERMS -->
    <div class="summary-section">
      <div class="notes-box">
        <div class="notes-title">Instructions & Terms</div>
        <div class="notes-content">
          ${escapeHtml(po.notes || 'Please reference this Purchase Order number on all delivery notes and commercial invoices. Goods supplied must strictly match agreed specifications.')}
        </div>
      </div>

      <div class="totals-box">
        <div class="totals-row">
          <span>Items Ordered:</span>
          <span class="font-mono" style="font-weight: 800; color: #000000;">${items.length} line items</span>
        </div>
        <div class="totals-row">
          <span>Total Quantities:</span>
          <span class="font-mono" style="font-weight: 800; color: #000000;">${totalUnits} units</span>
        </div>
        <div class="totals-row grand-total">
          <span style="font-weight: 800;">Estimated Total:</span>
          <span class="font-mono amount">${formatCurrency(po.totalEstimatedCost, currency)}</span>
        </div>
      </div>
    </div>

    <!-- 6. MAKER-CHECKER & AUDIT AUTHORIZATION -->
    <div class="sign-section">
      <!-- Maker -->
      <div class="sign-box">
        <div class="sign-title">Prepared By (Maker)</div>
        <div class="sign-space"></div>
        <div class="sign-footer-text">
          <span>${escapeHtml(po.createdByName || 'Procurement Officer')}</span>
          <span class="sign-date">${createdDate}</span>
        </div>
      </div>

      <!-- Checker -->
      <div class="sign-box">
        <div class="sign-title">Authorized By (Checker)</div>
        <div class="sign-space"></div>
        <div class="sign-footer-text">
          <span>${escapeHtml(po.approvedByName || (po.status === 'APPROVED' || po.status === 'RECEIVED' ? 'Authorized Manager' : 'Pending Authorization'))}</span>
          <span class="sign-date">${po.status === 'APPROVED' || po.status === 'RECEIVED' ? 'Approved' : 'Sign & Stamp'}</span>
        </div>
      </div>

      <!-- Receiver -->
      <div class="sign-box">
        <div class="sign-title">Received At Store</div>
        <div class="sign-space"></div>
        <div class="sign-footer-text">
          <span>Store Receiver</span>
          <span class="sign-date">Date: ____________</span>
        </div>
      </div>
    </div>

    <!-- 7. FOOTER WITH JENGA BRANDING -->
    <div class="footer">
      <div class="footer-left">
        PO Reference ID: #${escapeHtml(po.id)} &nbsp;•&nbsp; Generated on: ${new Date().toLocaleString('en-GB')}<br>
        This document serves as an official commercial procurement authorization.
      </div>
      <div class="footer-brand">
        Powered by <span>Jenga</span> Enterprise POS
      </div>
    </div>

  </div>
</body>
</html>`;
}

/**
 * Print the Purchase Order Voucher in an isolated print window or hidden iframe
 */
export function printPurchaseOrderVoucher(
  po: PurchaseOrder, 
  supplier?: Supplier | null, 
  settings?: StoreSettings | null
) {
  const html = generatePurchaseOrderVoucherHtml(po, supplier, settings);

  const printWindow = window.open('', '_blank', 'width=900,height=950');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 350);
    return;
  }

  // Fallback if popup is blocked
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document || iframe.contentDocument;
  if (doc) {
    doc.open();
    doc.write(html);
    doc.close();
    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    }, 350);
  }
}
