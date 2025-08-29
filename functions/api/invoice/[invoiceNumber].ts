import { verifyJwt } from '../../../src/lib/jwt'

export async function onRequestOptions() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}

export async function onRequestGet(context: any) {
  try {
    const { request, env, params } = context
    const invoiceNumber = params.invoiceNumber
    
    // Get JWT token from cookie
    const cookieHeader = request.headers.get('Cookie')
    let token: string | null = null
    
    if (cookieHeader) {
      const cookies = cookieHeader.split('; ')
      const authCookie = cookies.find((c: string) => c.startsWith('auth-token='))
      if (authCookie) {
        // Handle URL encoding like in /api/user
        const encodedToken = authCookie.split('=')[1]
        token = decodeURIComponent(encodedToken)
      }
    }

    if (!token) {
      return new Response(JSON.stringify({ error: 'No authentication token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const jwtSecret = env.JWT_SECRET
    if (!jwtSecret) {
      return new Response(JSON.stringify({ error: 'JWT secret not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    try {
      const payload = await verifyJwt(token, jwtSecret)
      if (!payload) {
        return new Response(JSON.stringify({ error: 'Invalid token' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      const db = env.DB
      if (!db) {
        return new Response(JSON.stringify({ error: 'Database not available' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      // Get invoice by number and verify user ownership
      const invoice = await db.prepare(`
        SELECT * FROM stripe_invoices 
        WHERE invoice_number = ? AND user_id = ?
      `).bind(invoiceNumber, payload.sub).first()

      if (!invoice) {
        return new Response(JSON.stringify({ error: 'Invoice not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      // Get URL parameters to determine response format
      const url = new URL(request.url)
      const format = url.searchParams.get('format') || 'json'

      if (format === 'pdf') {
        // Generate HTML content for PDF conversion
        const htmlContent = generateInvoiceHTML(invoice)
        
        // For now, we'll return the HTML with PDF headers to trigger browser PDF generation
        // In production, you might want to use a PDF generation service like Puppeteer or jsPDF
        return new Response(htmlContent, {
          status: 200,
          headers: {
            'Content-Type': 'text/html',
            'Content-Disposition': `inline; filename="${invoice.invoice_number}.html"`
          }
        })
      } else {
        // Return invoice data as JSON
        return new Response(JSON.stringify({
          invoice: {
            invoiceNumber: invoice.invoice_number,
            invoiceType: invoice.invoice_type,
            invoiceDate: invoice.invoice_date,
            dueDate: invoice.due_date,
            status: invoice.status,
            description: invoice.description,
            billingName: invoice.billing_name,
            billingEmail: invoice.billing_email,
            billingAddress: {
              line1: invoice.billing_address_line1,
              line2: invoice.billing_address_line2,
              city: invoice.billing_city,
              state: invoice.billing_state,
              postalCode: invoice.billing_postal_code,
              country: invoice.billing_country
            },
            amounts: {
              subtotal: invoice.subtotal_amount,
              taxRate: invoice.tax_rate,
              taxAmount: invoice.tax_amount,
              taxDescription: invoice.tax_description,
              total: invoice.total_amount,
              currency: invoice.currency
            },
            creditNoteForInvoiceId: invoice.credit_note_for_invoice_id,
            createdAt: invoice.created_at
          }
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })
      }

    } catch (jwtError) {
      return new Response(JSON.stringify({ error: 'Invalid or expired token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

  } catch (error) {
    console.error('Error retrieving invoice:', error)
    return new Response(JSON.stringify({ 
      error: "Internal server error" 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

/**
 * Generates a professional HTML invoice for Affensus Limited / MorseXpress
 * This HTML is designed to be easily convertible to PDF via browser print or PDF services
 */
function generateInvoiceHTML(invoice: any): string {
  const isCredit = invoice.invoice_type === 'credit_note'
  const amountPrefix = isCredit ? '-' : ''
  const documentTitle = isCredit ? 'CREDIT NOTE' : 'INVOICE'
  
  // Format amounts with proper currency display
  const formatAmount = (amount: number) => {
    const formatted = Math.abs(amount / 100).toFixed(2)
    return `${amountPrefix}$${formatted} ${(invoice.currency || 'USD').toUpperCase()}`
  }
  
  const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>${documentTitle} ${invoice.invoice_number}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        * { box-sizing: border-box; }
        
        body { 
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
            margin: 0; 
            padding: 40px; 
            color: #1a1a1a;
            line-height: 1.6;
            font-size: 14px;
        }
        
        .invoice-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
        }
        
        /* Header Section */
        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            padding-bottom: 30px;
            border-bottom: 3px solid #2563eb;
            margin-bottom: 40px;
        }
        
        .company-info {
            flex: 1;
        }
        
        .company-logo {
            display: flex;
            align-items: center;
            margin-bottom: 20px;
        }
        
        .company-name {
            font-size: 28px;
            font-weight: 700;
            color: #2563eb;
            margin-bottom: 8px;
        }
        
        .company-tagline {
            font-size: 16px;
            color: #6b7280;
            font-weight: 500;
            margin-bottom: 20px;
        }
        
        .company-details {
            font-size: 13px;
            color: #374151;
            line-height: 1.8;
        }
        
        .company-details strong {
            font-weight: 600;
            color: #1f2937;
        }
        
        .document-info {
            text-align: right;
            flex-shrink: 0;
            margin-left: 40px;
        }
        
        .document-title {
            font-size: 36px;
            font-weight: 700;
            color: ${isCredit ? '#dc2626' : '#2563eb'};
            margin-bottom: 10px;
            letter-spacing: -0.5px;
        }
        
        .document-subtitle {
            font-size: 14px;
            color: #6b7280;
            margin-bottom: 20px;
        }
        
        .document-meta {
            background: ${isCredit ? '#fef2f2' : '#eff6ff'};
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid ${isCredit ? '#dc2626' : '#2563eb'};
        }
        
        .document-meta-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
        }
        
        .document-meta-row:last-child {
            margin-bottom: 0;
        }
        
        .meta-label {
            font-weight: 500;
            color: #374151;
        }
        
        .meta-value {
            font-weight: 600;
            color: #1f2937;
        }
        
        /* Billing Section */
        .billing-section {
            display: flex;
            justify-content: space-between;
            margin: 40px 0;
            gap: 40px;
        }
        
        .billing-from, .billing-to {
            flex: 1;
        }
        
        .billing-header {
            font-size: 16px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 15px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .billing-details {
            background: #f9fafb;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
        }
        
        .billing-name {
            font-weight: 600;
            color: #1f2937;
            font-size: 16px;
            margin-bottom: 8px;
        }
        
        .billing-address {
            color: #374151;
            line-height: 1.7;
        }
        
        /* Line Items */
        .line-items {
            margin: 40px 0;
        }
        
        .line-items-header {
            font-size: 18px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 20px;
        }
        
        .items-table {
            width: 100%;
            border-collapse: collapse;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .items-table th {
            background: #f9fafb;
            padding: 16px;
            text-align: left;
            font-weight: 600;
            color: #374151;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-size: 12px;
            border-bottom: 1px solid #e5e7eb;
        }
        
        .items-table td {
            padding: 16px;
            border-bottom: 1px solid #e5e7eb;
            color: #1f2937;
        }
        
        .items-table .amount-cell {
            text-align: right;
            font-weight: 600;
            font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
        }
        
        .credit-amount {
            color: #dc2626;
        }
        
        /* Totals Section */
        .totals-section {
            margin-top: 40px;
            display: flex;
            justify-content: flex-end;
        }
        
        .totals-table {
            width: 350px;
        }
        
        .total-row {
            display: flex;
            justify-content: space-between;
            padding: 12px 0;
            border-bottom: 1px solid #e5e7eb;
        }
        
        .total-row:last-child {
            border-bottom: none;
            border-top: 3px solid #2563eb;
            padding-top: 16px;
            margin-top: 8px;
            font-weight: 700;
            font-size: 18px;
        }
        
        .total-label {
            color: #374151;
        }
        
        .total-amount {
            font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
            font-weight: 600;
            color: #1f2937;
        }
        
        .final-total .total-amount {
            color: ${isCredit ? '#dc2626' : '#2563eb'};
        }
        
        /* Footer */
        .footer {
            margin-top: 60px;
            padding-top: 30px;
            border-top: 2px solid #e5e7eb;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
        }
        
        .footer-left {
            flex: 1;
        }
        
        .footer-note {
            font-size: 14px;
            color: #6b7280;
            line-height: 1.6;
            margin-bottom: 20px;
        }
        
        .footer-legal {
            font-size: 11px;
            color: #9ca3af;
            line-height: 1.5;
        }
        
        .footer-right {
            text-align: right;
            margin-left: 40px;
        }
        
        .signature-section {
            margin-bottom: 20px;
        }
        
        .signature-label {
            font-size: 12px;
            color: #6b7280;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .signature-placeholder {
            width: 200px;
            height: 60px;
            border-bottom: 1px solid #d1d5db;
            position: relative;
        }
        
        .authorized-signature {
            font-size: 11px;
            color: #9ca3af;
            margin-top: 5px;
        }
        
        /* Print Styles */
        @media print {
            body { margin: 0; padding: 20px; }
            .invoice-container { box-shadow: none; }
            .print-controls { display: none !important; }
            .header { border-bottom: 2px solid #000 !important; }
            .document-title { color: #000 !important; }
            .company-name { color: #000 !important; }
        }
        
        /* Print Controls */
        .print-controls {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1000;
            background: white;
            padding: 15px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            border: 1px solid #e5e7eb;
        }
        
        .print-button {
            background: #2563eb;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            font-weight: 600;
            cursor: pointer;
            margin-right: 10px;
            font-family: inherit;
        }
        
        .print-button:hover {
            background: #1d4ed8;
        }
        
        .close-button {
            background: #6b7280;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            font-weight: 600;
            cursor: pointer;
            font-family: inherit;
        }
        
        .close-button:hover {
            background: #4b5563;
        }
        
        /* Credit Note Specific Styles */
        .credit-notice {
            background: #fef2f2;
            border: 1px solid #fecaca;
            border-radius: 8px;
            padding: 16px;
            margin: 30px 0;
            color: #991b1b;
            font-weight: 500;
        }
    </style>
</head>
<body>
    <!-- Print Controls -->
    <div class="print-controls">
        <button class="print-button" onclick="window.print()">Print / Save as PDF</button>
        <button class="close-button" onclick="window.close()">Close</button>
    </div>
    
    <div class="invoice-container">
        <!-- Header -->
        <div class="header">
            <div class="company-info">
                <div class="company-logo">
                    <!-- Logo would go here -->
                </div>
                <div class="company-name">MorseXpress</div>
                <div class="company-tagline">Master Morse Code Faster</div>
                <div class="company-details">
                    <strong>Affensus Limited</strong><br>
                    UNIT B, 3/F., KAI WAN HOUSE,<br>
                    146 TUNG CHOI STREET,<br>
                    MONGKOK, KLN<br>
                    Hong Kong<br><br>
                    <strong>Company Registration:</strong> 76782638-000-07-24-4
                </div>
            </div>
            
            <div class="document-info">
                <div class="document-title">${documentTitle}</div>
                <div class="document-subtitle">${isCredit ? 'Refund Credit Note' : 'Payment Invoice'}</div>
                <div class="document-meta">
                    <div class="document-meta-row">
                        <span class="meta-label">${documentTitle} #:</span>
                        <span class="meta-value">${invoice.invoice_number}</span>
                    </div>
                    <div class="document-meta-row">
                        <span class="meta-label">Date:</span>
                        <span class="meta-value">${new Date(invoice.invoice_date || invoice.created_at).toLocaleDateString('en-US', { 
                          year: 'numeric', month: 'long', day: 'numeric' 
                        })}</span>
                    </div>
                    <div class="document-meta-row">
                        <span class="meta-label">Due Date:</span>
                        <span class="meta-value">${new Date(invoice.due_date || invoice.created_at).toLocaleDateString('en-US', { 
                          year: 'numeric', month: 'long', day: 'numeric' 
                        })}</span>
                    </div>
                    <div class="document-meta-row">
                        <span class="meta-label">Status:</span>
                        <span class="meta-value">${(invoice.status || 'PAID').toUpperCase()}</span>
                    </div>
                </div>
            </div>
        </div>
        
        ${isCredit ? `
        <div class="credit-notice">
            <strong>⚠️ Credit Note Notice:</strong> This document represents a refund issued for your original purchase. 
            The refund amount will be credited back to your original payment method within 3-5 business days.
        </div>
        ` : ''}
        
        <!-- Billing Information -->
        <div class="billing-section">
            <div class="billing-from">
                <div class="billing-header">From</div>
                <div class="billing-details">
                    <div class="billing-name">Affensus Limited</div>
                    <div class="billing-address">
                        UNIT B, 3/F., KAI WAN HOUSE<br>
                        146 TUNG CHOI STREET<br>
                        MONGKOK, KLN<br>
                        Hong Kong<br><br>
                        <strong>Registration:</strong> 76782638-000-07-24-4<br>
                        <strong>Contact:</strong> support@morsexpress.com
                    </div>
                </div>
            </div>
            
            <div class="billing-to">
                <div class="billing-header">Bill To</div>
                <div class="billing-details">
                    <div class="billing-name">${invoice.billing_name || 'Customer'}</div>
                    <div class="billing-address">
                        ${invoice.billing_email || ''}<br>
                        ${invoice.billing_address_line1 || ''}<br>
                        ${invoice.billing_address_line2 ? invoice.billing_address_line2 + '<br>' : ''}
                        ${invoice.billing_city || ''}, ${invoice.billing_state || ''} ${invoice.billing_postal_code || ''}<br>
                        ${invoice.billing_country || ''}
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Line Items -->
        <div class="line-items">
            <div class="line-items-header">Items & Services</div>
            <table class="items-table">
                <thead>
                    <tr>
                        <th style="width: 70%;">Description</th>
                        <th style="width: 30%;" class="amount-cell">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>
                            <strong>${invoice.description || 'MorseXpress Premium Subscription'}</strong><br>
                            <span style="color: #6b7280; font-size: 13px;">
                                ${isCredit ? 'Refund for premium subscription purchase' : 'One-time payment for premium features and content'}
                            </span>
                        </td>
                        <td class="amount-cell ${isCredit ? 'credit-amount' : ''}">
                            ${formatAmount(invoice.subtotal_amount || invoice.total_amount || invoice.amount_paid)}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <!-- Totals -->
        <div class="totals-section">
            <div class="totals-table">
                <div class="total-row">
                    <span class="total-label">Subtotal:</span>
                    <span class="total-amount ${isCredit ? 'credit-amount' : ''}">
                        ${formatAmount(invoice.subtotal_amount || invoice.total_amount || invoice.amount_paid)}
                    </span>
                </div>
                <div class="total-row">
                    <span class="total-label">Tax (${(invoice.tax_rate || 0)}%):</span>
                    <span class="total-amount ${isCredit ? 'credit-amount' : ''}">
                        ${formatAmount(invoice.tax_amount || 0)}
                    </span>
                </div>
                ${invoice.tax_description ? `
                <div class="total-row" style="border: none; padding: 4px 0; font-size: 12px;">
                    <span class="total-label" style="color: #6b7280;">${invoice.tax_description}</span>
                    <span></span>
                </div>
                ` : ''}
                <div class="total-row final-total">
                    <span class="total-label">Total:</span>
                    <span class="total-amount ${isCredit ? 'credit-amount' : ''}">
                        ${formatAmount(invoice.total_amount || invoice.amount_paid)}
                    </span>
                </div>
            </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <div class="footer-left">
                <div class="footer-note">
                    ${isCredit ? 
                      `<strong>Refund processed successfully.</strong> We're sorry to see you go! Your refund will be credited back to your original payment method within 3-5 business days.` :
                      `Thank you for choosing MorseXpress! Your payment enables us to continue providing quality Morse code education and tools.`
                    }
                </div>
                <div class="footer-legal">
                    This ${documentTitle.toLowerCase()} was generated on ${new Date().toLocaleDateString('en-US', { 
                      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                    })}.<br>
                    ${isCredit ? 'This is an official credit note for refund processing.' : 'This is an official invoice for services rendered.'}<br>
                    Affensus Limited • Hong Kong Company Registration: 76782638-000-07-24-4
                </div>
            </div>
            
            <div class="footer-right">
                <div class="signature-section">
                    <div class="signature-label">Authorized Signature</div>
                    <div class="signature-placeholder"></div>
                    <div class="authorized-signature">Affensus Limited</div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>`
  
  return html
}
