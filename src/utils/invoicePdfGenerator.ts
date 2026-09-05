import type { Invoice, Customer, StoreSettings } from '../models/types';
import { formatCurrency } from '../models/mockData';

export function escapeHtml(str: unknown): string {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function generateInvoicePdf(invoice: Invoice, customer?: Customer | null, settings?: StoreSettings | null) {
  const storeName = escapeHtml(settings?.name || 'Jenga Store');
  const storeTin = escapeHtml(settings?.tin || '100-200-300');
  const storeAddress = escapeHtml(settings?.physicalAddress || 'Dar es Salaam, Tanzania');
  const storePhone = escapeHtml(settings?.phone || '+255 700 000 000');
  const storeEmail = escapeHtml(settings?.email || 'info@dukapro.tz');

  const customerName = escapeHtml(customer?.displayName || customer?.companyName || `${customer?.firstName || ''} ${customer?.lastName || ''}`.trim() || invoice.customerName || 'Valued Customer');
  const customerCode = escapeHtml(customer?.code || invoice.customerCode || 'N/A');
  const customerTin = escapeHtml(customer?.tinNumber || 'N/A');
  const customerPhone = escapeHtml(customer?.phone || 'N/A');
  const customerEmail = escapeHtml(customer?.email || 'N/A');
  const customerAddress = escapeHtml(customer?.address || 'N/A');

  const dateIssued = escapeHtml(invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : new Date().toLocaleDateString());
  const dueDate = escapeHtml(invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'On Receipt');

  let statusColor = '#059669'; // Emerald for Paid
  let statusBg = '#d1fae5';
  if (invoice.status === 'PARTIALLY_PAID') {
    statusColor = '#d97706'; // Amber
    statusBg = '#fef3c7';
  } else if (invoice.status === 'UNPAID' || invoice.status === 'OVERDUE') {
    statusColor = '#dc2626'; // Red
    statusBg = '#fee2e2';
  }

  const primaryColor = '#f4511e'; // Jenga Primary Brand Color (#f4511e)

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Invoice_${invoice.invoiceNumber}</title>
      <style>
        @page {
          size: A4 portrait;
          margin: 12mm;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          color: #0f172a;
          margin: 0;
          padding: 0;
          background: #ffffff;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .invoice-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 24px;
          box-sizing: border-box;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 2px solid ${primaryColor}20;
          padding-bottom: 20px;
          margin-bottom: 24px;
        }
        .brand-logo-text {
          font-size: 28px;
          font-weight: 900;
          color: ${primaryColor};
          margin: 0 0 4px 0;
          letter-spacing: -0.5px;
        }
        .brand-info {
          font-size: 12px;
          color: #64748b;
          margin: 3px 0;
        }
        .invoice-title-box {
          text-align: right;
        }
        .invoice-badge {
          font-size: 26px;
          font-weight: 900;
          color: ${primaryColor};
          text-transform: uppercase;
          letter-spacing: 1px;
          margin: 0 0 4px 0;
        }
        .invoice-number {
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: 14px;
          font-weight: 700;
          color: ${primaryColor};
        }
        .status-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 9999px;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-top: 8px;
        }
        .meta-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 28px;
        }
        .info-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 16px;
        }
        .info-card-title {
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: ${primaryColor};
          margin-bottom: 8px;
        }
        .info-card-name {
          font-size: 16px;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 6px;
        }
        .info-card-text {
          font-size: 12px;
          color: #475569;
          margin: 2px 0;
        }
        .primary-highlight {
          color: ${primaryColor};
          font-weight: 700;
        }
        .table-container {
          margin-bottom: 28px;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          overflow: hidden;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th {
          background: ${primaryColor};
          color: #ffffff;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          padding: 12px 16px;
          text-align: left;
        }
        th.text-right { text-align: right; }
        td {
          padding: 16px;
          border-bottom: 1px solid #f1f5f9;
          font-size: 13px;
          color: #1e293b;
        }
        td.text-right { text-align: right; }
        .font-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
        .font-bold { font-weight: 700; }
        .summary-box {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 28px;
        }
        .summary-table {
          width: 320px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 16px;
        }
        .summary-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 6px 0;
          font-size: 13px;
          color: #475569;
        }
        .summary-row.total-due {
          font-size: 15px;
          font-weight: 800;
          color: #0f172a;
          border-top: 2px solid #e2e8f0;
          padding-top: 10px;
          margin-top: 6px;
        }
        .notes-section {
          background: #fff5f2;
          border-left: 4px solid ${primaryColor};
          border-radius: 0 12px 12px 0;
          padding: 14px 18px;
          margin-bottom: 36px;
        }
        .notes-title {
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          color: ${primaryColor};
          margin-bottom: 4px;
        }
        .notes-text {
          font-size: 12px;
          color: #1e293b;
          line-height: 1.5;
        }
        .footer {
          border-top: 1px solid #e2e8f0;
          padding-top: 20px;
          text-align: center;
        }
        .footer-copyright {
          font-size: 12px;
          font-weight: 700;
          color: #475569;
          margin-bottom: 4px;
        }
        .footer-powered {
          font-size: 11px;
          font-weight: 700;
          color: ${primaryColor};
        }
        @media print {
          body { background: white; }
          .invoice-container { max-width: 100%; padding: 0; }
        }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        <!-- HEADER -->
        <div class="header">
          <div>
            <h1 class="brand-logo-text">${storeName}</h1>
            <p class="brand-info"><strong>TIN:</strong> <span class="primary-highlight">${storeTin}</span></p>
            <p class="brand-info">${storeAddress}</p>
            <p class="brand-info">Phone: ${storePhone} | Email: ${storeEmail}</p>
          </div>
          <div class="invoice-title-box">
            <div class="invoice-badge">INVOICE</div>
            <div class="invoice-number">${invoice.invoiceNumber}</div>
            <span class="status-badge" style="background-color: ${statusBg}; color: ${statusColor}; font-weight: 800;">
              ${invoice.status.replace('_', ' ')}
            </span>
          </div>
        </div>

        <!-- DETAILS GRID -->
        <div class="meta-grid">
          <!-- BILLED TO -->
          <div class="info-card">
            <div class="info-card-title">Billed To</div>
            <div class="info-card-name">${customerName}</div>
            <div class="info-card-text">Code: <strong class="primary-highlight">${customerCode}</strong></div>
            <div class="info-card-text">TIN / VRN: <strong class="primary-highlight">${customerTin}</strong></div>
            <div class="info-card-text">Phone: ${customerPhone}</div>
            <div class="info-card-text">Email: ${customerEmail}</div>
            <div class="info-card-text">Address: ${customerAddress}</div>
          </div>

          <!-- INVOICE INFO -->
          <div class="info-card">
            <div class="info-card-title">Invoice Details</div>
            <div class="info-card-text">Invoice #: <strong class="font-mono primary-highlight">${escapeHtml(invoice.invoiceNumber)}</strong></div>
            <div class="info-card-text">Date Issued: <strong class="primary-highlight">${dateIssued}</strong></div>
            <div class="info-card-text">Due Date: <strong class="primary-highlight">${dueDate}</strong></div>
            <div class="info-card-text">Branch: <strong class="primary-highlight">${escapeHtml(invoice.branchName || 'Main Branch')}</strong></div>
          </div>
        </div>

        <!-- LINE ITEMS TABLE -->
        <div class="table-container">
          ${invoice.items && invoice.items.length > 0 ? `
            <table>
              <thead>
                <tr>
                  <th style="width: 40%;">Item / Product Name</th>
                  <th class="text-right">Qty</th>
                  <th class="text-right">Unit Price</th>
                  <th class="text-right">Discount</th>
                  <th class="text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${invoice.items.map(item => `
                  <tr>
                    <td>
                      <strong style="font-size: 13px; color: #0f172a;">${escapeHtml(item.productName || 'Product')}</strong>
                      ${item.productBarcode ? `<br><span style="font-size: 10px; color: #64748b; font-family: ui-monospace, monospace;">Barcode: ${escapeHtml(item.productBarcode)}</span>` : ''}
                    </td>
                    <td class="text-right font-mono font-bold">${item.quantity}</td>
                    <td class="text-right font-mono">${formatCurrency(item.unitPrice)}</td>
                    <td class="text-right font-mono" style="color: #d97706;">${item.discountPercent ? `${item.discountPercent}%` : '-'}</td>
                    <td class="text-right font-mono font-bold" style="color: #0f172a;">${formatCurrency(item.subtotal)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          ` : `
            <table>
              <thead>
                <tr>
                  <th>Description</th>
                  <th class="text-right">Total Amount</th>
                  <th class="text-right">Paid Amount</th>
                  <th class="text-right">Balance Due</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong style="font-size: 14px; color: #0f172a;">${escapeHtml(invoice.notes || `Sales Invoice #${invoice.invoiceNumber}`)}</strong><br>
                    <span style="font-size: 11px; color: #64748b;">Ref Code: ${escapeHtml(invoice.saleId || invoice.invoiceNumber)}</span>
                  </td>
                  <td class="text-right font-mono font-bold">${formatCurrency(invoice.totalAmount)}</td>
                  <td class="text-right font-mono font-bold" style="color: #059669;">${formatCurrency(invoice.paidAmount)}</td>
                  <td class="text-right font-mono font-bold" style="color: ${invoice.dueAmount > 0 ? '#dc2626' : '#059669'};">
                    ${formatCurrency(invoice.dueAmount)}
                  </td>
                </tr>
              </tbody>
            </table>
          `}
        </div>

        <!-- FINANCIAL SUMMARY -->
        <div class="summary-box">
          <div class="summary-table">
            <div class="summary-row">
              <span>Total Invoice Amount:</span>
              <span class="font-mono font-bold">${formatCurrency(invoice.totalAmount)}</span>
            </div>
            <div class="summary-row">
              <span>Total Paid:</span>
              <span class="font-mono font-bold" style="color: #059669;">${formatCurrency(invoice.paidAmount)}</span>
            </div>
            <div class="summary-row total-due">
              <span>Balance Due:</span>
              <span class="font-mono" style="color: ${invoice.dueAmount > 0 ? '#dc2626' : '#059669'};">
                ${formatCurrency(invoice.dueAmount)}
              </span>
            </div>
          </div>
        </div>

        <!-- TERMS & NOTES -->
        <div class="notes-section">
          <div class="notes-title">Payment Terms & Instructions</div>
          <div class="notes-text">
            ${escapeHtml(invoice.notes || 'Please settle the balance due by the specified due date. Payments can be made via Cash, Bank Transfer, Card, or Mobile Money.')}
          </div>
        </div>

        <!-- FOOTER WITH JENGA COPYRIGHT -->
        <div class="footer">
          <div class="footer-copyright">&copy; 2026 Jenga. All rights reserved.</div>
          <div class="footer-powered">Powered by Jenga POS</div>
        </div>
      </div>
    </body>
    </html>
  `;

  const printWindow = window.open('', '_blank', 'width=850,height=900');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 350);
  }
}
