export interface Product {
  id: string;
  name: string;
  barcode: string;
  category: string;
  cost: number;
  price: number;
  stock: number;
  minStock: number;
  image?: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock' | 'Soon to expire' | 'Expired';
  supplier: string;
  sku?: string;
  wholesalePrice?: number;
  wholesaleBarcode?: string;
  conversionFactor?: number;
  unitOfMeasure?: 'PCS' | 'KG' | 'LTR';
  expiryDate?: string;
  isActive?: boolean;
  categoryName?: string;
  supplierName?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  discount: number; // in currency units
}

export interface Transaction {
  id: string;
  date: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: 'Cash' | 'Card' | 'M-Pesa' | 'On Credit' | 'CREDIT' | string;
  amountReceived: number;
  changeDue: number;
  refCode?: string;
  cashierId?: string;
  cashierName?: string;
  customerId?: string;
  customerName?: string;
  customerCode?: string;
  reversedById?: string | null;
  status?: 'PAID' | 'UNPAID' | 'VOID' | 'PARTIALLY_PAID' | 'SUCCESS' | string;
}

export type PurchaseStatus = 'COMPLETED' | 'PARTIALLY_RETURNED' | 'REVERSED';
export type PurchasePaymentType = 'CASH' | 'TRANSFER' | 'CREDIT';

export interface PurchaseItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitCost: number;
  currentStock: number;
  maxReturnableQuantity: number;
  isWholesale?: boolean;
}

export interface Purchase {
  id: string;
  branchId: string;
  branchName?: string;
  supplierId?: string;
  supplierName?: string;
  totalCost: number;
  paymentType: PurchasePaymentType;
  status: PurchaseStatus;
  returnedQuantity?: number;
  returnedAmount?: number;
  reversedAt?: string;
  reversedById?: string;
  reversedByName?: string;
  reversalReason?: string;
  createdAt: string;
  items: PurchaseItem[];
}

export interface Supplier {
  id: string;
  code: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  category: string;
  balance: number;
  status: 'Active' | 'Inactive';
}

export interface StoreSettings {
  logo?: string;
  name: string;
  tin: string;
  physicalAddress: string;
  phone: string;
  email: string;
  currency: 'TZS' | 'USD' | 'EUR';
  timezone: string;
  enablePerpetualCogs?: boolean;
}

export type ViewType = 'login' | 'select-branch' | 'dashboard' | 'checkout' | 'inventory' | 'reports' | 'settings' | 'receipt' | 'stock-in' | 'suppliers' | 'users' | 'profile' | 'customers' | 'finance';

export type CustomerType = 'PERSON' | 'COMPANY';
export type CustomerStatus = 'ACTIVE' | 'INACTIVE';
export type InvoiceStatus = 'DRAFT' | 'UNPAID' | 'PARTIALLY_PAID' | 'PAID' | 'CANCELLED' | 'OVERDUE';
export type PaymentMethod = 'CASH' | 'CARD' | 'MOBILE_MONEY' | 'BANK_TRANSFER' | 'CHEQUE';

export interface CustomerContactPerson {
  id?: string;
  customerId?: string;
  fullName: string;
  designation?: string;
  phone?: string;
  email?: string;
  primary: boolean;
  createdAt?: string;
}

export interface Customer {
  id?: string;
  storeId?: string;
  storeName?: string;
  registeredBranchId?: string;
  registeredBranchName?: string;
  customerType: CustomerType;
  code?: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  displayName?: string;
  tinNumber?: string;
  vrnNumber?: string;
  phone?: string;
  email?: string;
  address?: string;
  creditLimit?: number;
  outstandingBalance?: number;
  arAccountId?: string;
  status: CustomerStatus;
  createdById?: string;
  createdByName?: string;
  contactPersons?: CustomerContactPerson[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CustomerPayment {
  id?: string;
  paymentNumber?: string;
  customerId: string;
  customerName?: string;
  customerCode?: string;
  invoiceId?: string;
  invoiceNumber?: string;
  branchId?: string;
  branchName?: string;
  receivedById?: string;
  receivedByName?: string;
  amount: number;
  paymentMethod: PaymentMethod;
  referenceNumber?: string;
  postedToGl?: boolean;
  postedAt?: string;
  financialPeriodId?: string;
  notes?: string;
  paymentDate?: string;
}

export interface RecordPaymentRequest {
  customerId: string;
  invoiceId?: string;
  branchId?: string;
  storeBranchId?: string;
  amount: number;
  paymentMethod: PaymentMethod;
  referenceNumber?: string;
  notes?: string;
}

export interface InvoiceItem {
  id?: string;
  productId?: string;
  productName?: string;
  productBarcode?: string;
  discountPercent?: number;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  saleId?: string;
  customerId: string;
  customerName?: string;
  customerCode?: string;
  storeId?: string;
  storeName?: string;
  branchId?: string;
  branchName?: string;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  dueDate?: string;
  status: InvoiceStatus;
  postedToGl?: boolean;
  postedAt?: string;
  financialPeriodId?: string;
  notes?: string;
  items?: InvoiceItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CustomerStatement {
  customer: Customer;
  totalBilled: number;
  totalPaid: number;
  outstandingBalance: number;
  invoices: Invoice[];
  payments: CustomerPayment[];
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'CASHIER';

export interface StoreBranch {
  id: string;
  storeId: string;
  name: string;
  location: string;
  status: string;
  phone: string;
  email: string;
}

export interface Permission {
  id?: string;
  code: string;
  name: string;
  category: string;
  description?: string;
}

export interface UserPermissionsResponse {
  userId: string;
  permissions: string[];
}

export interface AppUser {
  id: string;
  storeId: string;
  branchId: string;
  fullName: string;
  phone: string;
  role: UserRole;
  active: boolean;
  email?: string;
  lastLoginAt: string;
  createdAt: string;
  shifts?: CashierShift[];
  permissions?: string[];
  twoFactorEnabled?: boolean;
  twoFactorRemindAt?: string;
  twoFactorPrompt?: boolean;
}

export interface TwoFactorSetupResponse {
  secret: string;
  otpAuthUri: string;
  accountIdentifier: string;
  issuer: string;
}

export interface TwoFactorVerifyRequest {
  totpCode: string;
}

export interface TwoFactorDisableRequest {
  password: string;
  totpCode?: string;
}

export interface TwoFactorReminderRequest {
  remindAt?: string;
  days?: number;
}

export interface UserCreateRequest {
  storeId?: string;
  branchId?: string;
  fullName: string;
  phone: string;
  email?: string;
  role: UserRole;
}

export interface CashierShift {
  id: string;
  storeId: string;
  branchId: string;
  cashierId: string;
  status: 'OPEN' | 'CLOSED';
  openedAt: string;
  closedAt?: string;
  openingCash: number;
  expectedCash: number;
  actualCash?: number;
  discrepancy?: number;
  totalSales: number;
  notes?: string;
}

export interface CashMovement {
  id: string;
  storeId?: string;
  branchId?: string;
  shiftId?: string;
  type: 'CASH_IN' | 'CASH_OUT';
  amount: number;
  reason: string;
  performedById?: string;
  createdAt: string;
}

export interface ShiftSummary {
  shiftId: string;
  cashierId: string;
  cashierName: string;
  branchId: string;
  branchName: string;
  status: string;
  openedAt: string;
  closedAt?: string;
  openingCash: number;
  expectedCash: number;
  actualCash?: number;
  totalSales: number;
  totalCostOfGoodsSold: number;
  grossProfit: number;
  totalDiscrepancy: number;
  netProfitLoss: number;
  profitLossMarginPercentage: number;
  totalTransactions: number;
}

export interface ShiftDetail {
  shift: CashierShift;
  summary: ShiftSummary;
  sales: any[];
  cashMovements: CashMovement[];
}

export type StockMovementType = 'PURCHASE' | 'ADJUSTMENT' | 'SALE' | 'TRANSFER' | 'RETURN' | 'DAMAGED' | string;

export interface StockMovement {
  id: string;
  branchId?: string;
  branchName?: string;
  productId?: string;
  productName?: string;
  costPrice?: number;
  sellingPrice?: number;
  type: StockMovementType;
  quantity: number;
  referenceId?: string;
  createdById?: string;
  createdByName?: string;
  createdAt?: string;
}

export interface TopSellingProduct {
  id: string;
  name: string;
  barcode?: string;
  sku?: string;
  categoryName?: string;
  costPrice?: number;
  sellingPrice?: number;
  reorderLevel?: number;
  stock?: number;
  totalSold: number;
  unitOfMeasure?: 'PCS' | 'KG' | 'LTR' | string;
}

// ==========================================
// FINANCE & ACCOUNTING MODULE TYPES
// ==========================================

export type AccountType = 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';

export type AccountCategory =
  | 'CURRENT_ASSET'
  | 'NON_CURRENT_ASSET'
  | 'CURRENT_LIABILITY'
  | 'NON_CURRENT_LIABILITY'
  | 'EQUITY'
  | 'OPERATING_REVENUE'
  | 'OTHER_INCOME'
  | 'COST_OF_GOODS_SOLD'
  | 'OPERATING_EXPENSE'
  | 'TAX_EXPENSE'
  | 'OTHER_EXPENSE';

export interface ChartOfAccount {
  id: string;
  storeId?: string;
  code: string;
  name: string;
  accountType: AccountType;
  accountCategory?: AccountCategory;
  parentId?: string | null;
  parentName?: string | null;
  active: boolean;
  system: boolean;
  currencyCode?: string;
  description?: string;
}

export interface CreateChartOfAccountRequest {
  name: string;
  accountType: AccountType;
  accountCategory?: AccountCategory;
  description?: string;
}

export type PeriodStatus = 'OPEN' | 'CLOSED' | 'LOCKED';

export interface FinancialPeriod {
  id: string;
  storeId?: string;
  name: string;
  startDate: string;
  endDate: string;
  status: PeriodStatus;
  closedAt?: string;
  closedByName?: string;
  createdAt?: string;
}

export type JournalStatus = 'DRAFT' | 'POSTED' | 'REVERSED' | 'VOID';

export interface JournalLine {
  id?: string;
  accountId: string;
  accountCode?: string;
  accountName?: string;
  accountType?: string;
  branchId?: string;
  branchName?: string;
  debit: number;
  credit: number;
  description?: string;
  createdAt?: string;
}

export interface JournalEntry {
  id: string;
  storeId?: string;
  branchId?: string;
  branchName?: string;
  entryNumber: string;
  referenceType: string;
  referenceId?: string;
  description: string;
  entryDate: string;
  periodId?: string;
  periodName?: string;
  status: JournalStatus;
  postedAt?: string;
  postedByName?: string;
  currencyCode?: string;
  reversalOfId?: string | null;
  reversedById?: string | null;
  totalDebit: number;
  totalCredit: number;
  lines: JournalLine[];
  createdAt?: string;
}

export interface JournalLineItemRequest {
  accountId: string;
  branchId?: string;
  debit?: number;
  credit?: number;
  description?: string;
}

export interface CreateJournalEntryRequest {
  storeBranchId?: string;
  description: string;
  entryDate?: string;
  referenceType?: string;
  referenceId?: string;
  lines: JournalLineItemRequest[];
}

export interface TrialBalanceLineItem {
  accountId: string;
  accountCode: string;
  accountName: string;
  accountType: AccountType;
  accountCategory?: AccountCategory;
  totalDebit: number;
  totalCredit: number;
  netDebit: number;
  netCredit: number;
}

export interface TrialBalanceReport {
  storeId: string;
  asOfDate: string;
  currency: string;
  totalDebit: number;
  totalCredit: number;
  balanced: boolean;
  accounts: TrialBalanceLineItem[];
}

export interface IncomeStatementLine {
  accountCode: string;
  accountName: string;
  amount: number;
}

export interface IncomeStatementReport {
  storeId: string;
  startDate: string;
  endDate: string;
  currency: string;
  operatingRevenueLines: IncomeStatementLine[];
  grossRevenue: number;
  salesDiscounts: number;
  netRevenue: number;
  cogsLines: IncomeStatementLine[];
  costOfGoodsSold: number;
  grossProfit: number;
  expenseLines: IncomeStatementLine[];
  totalExpenses: number;
  otherIncome: number;
  otherExpenses: number;
  netIncome: number;
}

export interface BalanceSheetLine {
  accountCode: string;
  accountName: string;
  balance: number;
}

export interface BalanceSheetReport {
  storeId: string;
  asOfDate: string;
  currency: string;
  currentAssets: BalanceSheetLine[];
  totalCurrentAssets: number;
  nonCurrentAssets: BalanceSheetLine[];
  totalNonCurrentAssets: number;
  totalAssets: number;
  currentLiabilities: BalanceSheetLine[];
  totalCurrentLiabilities: number;
  nonCurrentLiabilities: BalanceSheetLine[];
  totalNonCurrentLiabilities: number;
  totalLiabilities: number;
  equityLines: BalanceSheetLine[];
  retainedEarnings: number;
  currentPeriodNetIncome: number;
  totalEquity: number;
  totalLiabilitiesAndEquity: number;
  balanced: boolean;
}

export interface LedgerTransactionLine {
  entryDate: string;
  entryNumber: string;
  referenceType: string;
  referenceId?: string;
  description: string;
  branchName?: string;
  debit: number;
  credit: number;
  runningBalance: number;
}

export interface AccountLedgerStatementReport {
  accountId: string;
  accountCode: string;
  accountName: string;
  accountType: AccountType;
  startDate: string;
  endDate: string;
  currency: string;
  openingBalance: number;
  totalDebit: number;
  totalCredit: number;
  closingBalance: number;
  transactions: LedgerTransactionLine[];
}

// ==========================================
// NOTIFICATIONS MODULE TYPES
// ==========================================

export type NotificationType =
  | 'SYSTEM_UPDATE'
  | 'LICENSE_EXPIRATION'
  | 'FRAUD_ALERT'
  | 'CASHIER_ACTIVITY'
  | 'GENERAL_ANNOUNCEMENT'
  | string;

export type NotificationPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';

export interface NotificationInboxItem {
  recipientId: string;
  notificationId: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  actionUrl?: string;
  metadata?: Record<string, any>;
  isRead: boolean;
  read?: boolean;
  readAt?: string;
  createdAt: string;
  storeId?: string;
  branchId?: string;
  branchName?: string;
}

export interface UnreadCountResponse {
  unreadCount: number;
}

