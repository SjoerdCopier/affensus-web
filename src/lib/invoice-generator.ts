/**
 * Invoice Generation Utilities
 * Handles sequential invoice numbering and invoice record creation
 */

// Database interface for CloudFlare D1
interface D1Database {
  prepare(query: string): D1PreparedStatement
}

interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement
  first(): Promise<Record<string, unknown>>
  all(): Promise<{ results: Record<string, unknown>[] }>
  run(): Promise<{ success: boolean; meta: Record<string, unknown> }>
}

interface BillingAddress {
  line1: string
  line2?: string
  city: string
  state: string
  postalCode: string
  country: string
  addressType?: 'personal' | 'company'
  companyName?: string
  taxIdType?: string
  taxIdNumber?: string
}

interface InvoiceData {
  userId: number
  userEmail: string
  userName: string
  stripeCustomerId: string
  stripeInvoiceId: string
  amountPaid: number
  currency: string
  description: string
  billingAddress: BillingAddress
  invoiceType?: 'invoice' | 'credit_note'
  creditNoteForInvoiceId?: number
}

interface InvoiceRecord {
  id: number
  invoiceNumber: string
  invoiceType: 'invoice' | 'credit_note'
  userId: number
  stripeInvoiceId: string
  stripeCustomerId: string
  amountPaid: number
  currency: string
  status: string
  description: string
  billingName: string
  billingEmail: string
  billingAddressLine1: string
  billingAddressLine2?: string
  billingCity: string
  billingState: string
  billingPostalCode: string
  billingCountry: string
  taxRate: number
  taxAmount: number
  taxDescription: string
  subtotalAmount: number
  totalAmount: number
  invoiceDate: string
  dueDate: string
  creditNoteForInvoiceId?: number
  createdAt: string
}

/**
 * Generates the next sequential invoice number
 */
export async function generateInvoiceNumber(db: D1Database): Promise<string> {
  const currentYear = new Date().getFullYear()
  
  // Atomic increment of sequence number
  const result = await db.prepare(`
    INSERT INTO invoice_sequence (year, sequence_number) 
    VALUES (?, 1)
    ON CONFLICT(year) DO UPDATE SET 
      sequence_number = sequence_number + 1,
      last_updated = datetime('now')
    RETURNING sequence_number
  `).bind(currentYear).first()
  
  const sequenceNumber = result?.sequence_number as number
  
  // Format: INV-2025-001
  return `INV-${currentYear}-${sequenceNumber.toString().padStart(3, '0')}`
}

/**
 * Calculates tax based on billing address and Hong Kong regulations
 */
export function calculateTax(amount: number, billingAddress: BillingAddress): {
  taxRate: number
  taxAmount: number
  taxDescription: string
  subtotalAmount: number
  totalAmount: number
} {
  // Hong Kong tax logic
  // For now, 0% tax on all transactions (foreign income exemption)
  // Future: Could add logic for HK residents or different jurisdictions
  
  const taxRate = 0.00
  const taxAmount = 0
  const taxDescription = billingAddress.country === 'HK' 
    ? 'No tax applicable (Hong Kong)' 
    : 'No tax applicable (Hong Kong - Foreign Income)'
  
  const subtotalAmount = amount
  const totalAmount = subtotalAmount + taxAmount
  
  return {
    taxRate,
    taxAmount,
    taxDescription,
    subtotalAmount,
    totalAmount
  }
}

/**
 * Creates a complete invoice record in the database
 */
export async function createInvoiceRecord(db: D1Database, invoiceData: InvoiceData): Promise<InvoiceRecord> {
  const invoiceNumber = await generateInvoiceNumber(db)
  const invoiceDate = new Date().toISOString()
  const dueDate = new Date().toISOString() // Immediate payment for one-time purchases
  
  // Calculate tax
  const taxCalc = calculateTax(invoiceData.amountPaid, invoiceData.billingAddress)
  
  // Format billing name
  const billingName = invoiceData.billingAddress.addressType === 'company' && invoiceData.billingAddress.companyName
    ? invoiceData.billingAddress.companyName
    : invoiceData.userName
  
  // Insert invoice record
  const invoiceRecord = await db.prepare(`
    INSERT INTO stripe_invoices (
      invoice_number,
      invoice_type,
      user_id,
      stripe_invoice_id,
      stripe_customer_id,
      amount_paid,
      currency,
      status,
      description,
      billing_name,
      billing_email,
      billing_address_line1,
      billing_address_line2,
      billing_city,
      billing_state,
      billing_postal_code,
      billing_country,
      tax_rate,
      tax_amount,
      tax_description,
      subtotal_amount,
      total_amount,
      invoice_date,
      due_date,
      credit_note_for_invoice_id,
      created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    RETURNING *
  `).bind(
    invoiceNumber,
    invoiceData.invoiceType || 'invoice',
    invoiceData.userId,
    invoiceData.stripeInvoiceId,
    invoiceData.stripeCustomerId,
    invoiceData.amountPaid,
    invoiceData.currency,
    'paid', // Default status for new invoices
    invoiceData.description,
    billingName,
    invoiceData.userEmail,
    invoiceData.billingAddress.line1,
    invoiceData.billingAddress.line2 || null,
    invoiceData.billingAddress.city,
    invoiceData.billingAddress.state,
    invoiceData.billingAddress.postalCode,
    invoiceData.billingAddress.country,
    taxCalc.taxRate,
    taxCalc.taxAmount,
    taxCalc.taxDescription,
    taxCalc.subtotalAmount,
    taxCalc.totalAmount,
    invoiceDate,
    dueDate,
    invoiceData.creditNoteForInvoiceId || null
  ).first() as unknown as InvoiceRecord
  
  console.log(`Generated invoice: ${invoiceNumber} for user ${invoiceData.userId}`)
  
  return invoiceRecord
}

/**
 * Creates a credit note for a refund
 */
export async function createCreditNote(db: D1Database, originalInvoiceId: number, refundReason: string): Promise<InvoiceRecord> {
  // Get original invoice data
  const originalInvoice = await db.prepare(`
    SELECT * FROM stripe_invoices WHERE id = ?
  `).bind(originalInvoiceId).first() as unknown as InvoiceRecord
  
  if (!originalInvoice) {
    throw new Error('Original invoice not found')
  }
  
  // Create credit note with negative amounts
  const creditNoteData: InvoiceData = {
    userId: originalInvoice.userId,
    userEmail: originalInvoice.billingEmail,
    userName: originalInvoice.billingName,
    stripeCustomerId: originalInvoice.stripeCustomerId,
    stripeInvoiceId: `refund_${originalInvoice.stripeInvoiceId}`,
    amountPaid: -Math.abs(originalInvoice.amountPaid), // Negative amount for credit
    currency: originalInvoice.currency,
    description: `Credit Note - ${refundReason}`,
    billingAddress: {
      line1: originalInvoice.billingAddressLine1,
      line2: originalInvoice.billingAddressLine2,
      city: originalInvoice.billingCity,
      state: originalInvoice.billingState,
      postalCode: originalInvoice.billingPostalCode,
      country: originalInvoice.billingCountry
    },
    invoiceType: 'credit_note',
    creditNoteForInvoiceId: originalInvoiceId
  }
  
  return await createInvoiceRecord(db, creditNoteData)
}

/**
 * Gets user's billing address from the database
 */
export async function getUserBillingAddress(db: D1Database, userId: number): Promise<BillingAddress | null> {
  const address = await db.prepare(`
    SELECT * FROM user_billing_addresses WHERE user_id = ?
  `).bind(userId).first()
  
  if (!address) {
    return null
  }
  
  return {
    line1: address.line1 as string,
    line2: address.line2 as string | undefined,
    city: address.city as string,
    state: address.state as string,
    postalCode: address.postal_code as string,
    country: address.country as string,
    addressType: address.address_type as 'personal' | 'company' | undefined,
    companyName: address.company_name as string | undefined,
    taxIdType: address.tax_id_type as string | undefined,
    taxIdNumber: address.tax_id_number as string | undefined
  }
}

/**
 * Processes pending payments after user completes billing address
 */
export async function processPendingInvoices(db: D1Database, userId: number, userEmail: string): Promise<InvoiceRecord[]> {
  // Get user's billing address
  const billingAddress = await getUserBillingAddress(db, userId)
  if (!billingAddress) {
    throw new Error('Billing address not found')
  }
  
  // Get user's name
  const user = await db.prepare(`
    SELECT first_name, last_name FROM users WHERE id = ?
  `).bind(userId).first()
  
  const userName = user ? `${user.first_name as string} ${user.last_name as string}`.trim() : 'Customer'
  
  // Get pending payments for this user
  const pendingPayments = await db.prepare(`
    SELECT * FROM pending_payments WHERE email = ? ORDER BY created_at ASC
  `).bind(userEmail.toLowerCase()).all()
  
  const createdInvoices: InvoiceRecord[] = []
  
  for (const payment of pendingPayments.results || []) {
    const invoiceData: InvoiceData = {
      userId,
      userEmail,
      userName,
      stripeCustomerId: (payment.stripe_customer_id as string) || 'pending',
      stripeInvoiceId: payment.session_id as string,
      amountPaid: payment.amount_total as number,
      currency: payment.currency as string,
      description: `${(payment.customer_name as string) || 'Premium Plan'} - Processed Payment`,
      billingAddress
    }
    
    const invoice = await createInvoiceRecord(db, invoiceData)
    createdInvoices.push(invoice)
    
    // Remove from pending payments
    await db.prepare(`
      DELETE FROM pending_payments WHERE id = ?
    `).bind(payment.id as number).run()
  }
  
  console.log(`Processed ${createdInvoices.length} pending invoices for user ${userId}`)
  
  return createdInvoices
}

export type { InvoiceData, InvoiceRecord, BillingAddress }
