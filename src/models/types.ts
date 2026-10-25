export type ProductPurpose = 'FOR_SALE' | 'INTERNAL_USE' | 'BOTH';
export type ProductCatalogScope = 'STORE_SHARED' | 'BRANCH_EXCLUSIVE';

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
  purpose?: ProductPurpose;
  catalogScope?: ProductCatalogScope;
  totalStoreStock?: number;
  locationStock?: number;
  initialLocationId?: string;
  storeBranchId?: string;
  storeId?: string;
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
  hasTakenTour?: boolean;
  has_taken_tour?: boolean;
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
  cashierName?: string;
  terminalId?: string;
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

export type StockMovementType =
  | 'PURCHASE'
  | 'ADJUSTMENT'
  | 'ADJUSTMENT_IN'
  | 'SALE'
  | 'TRANSFER'
  | 'TRANSFER_OUT'
  | 'TRANSFER_IN'
  | 'INTERNAL_USE'
  | 'RETURN'
  | 'PURCHASE_RETURN'
  | 'DAMAGED'
  | string;

export interface StockMovement {
  id: string;
  storeId?: string;
  branchId?: string;
  branchName?: string;
  locationId?: string;
  locationName?: string;
  counterpartLocationId?: string;
  counterpartLocationName?: string;
  transferId?: string;
  transferNumber?: string;
  productId?: string;
  productName?: string;
  barcode?: string;
  sku?: string;
  costPrice?: number;
  sellingPrice?: number;
  unitCost?: number;
  type: StockMovementType;
  quantity: number;
  balanceBefore?: number;
  balanceAfter?: number;
  referenceId?: string;
  actorId?: string;
  createdById?: string;
  createdByName?: string;
  createdAt?: string;
}

// ==========================================
// WAREHOUSE & MULTI-LOCATION MODULE TYPES
// ==========================================

export type LocationType = 'BRANCH_DEFAULT' | 'BRANCH_WAREHOUSE' | 'WAREHOUSE';

export interface InventoryLocation {
  id: string;
  storeId: string;
  storeBranchId?: string | null;
  storeBranchName?: string | null;
  name: string;
  code?: string | null;
  locationType: LocationType;
  servesAllBranches: boolean;
  address?: string | null;
  isActive: boolean;
  createdAt?: string;
  servedBranchIds?: string[];
}

export interface LocationStock {
  id: string;
  locationId: string;
  locationName: string;
  locationType: LocationType;
  storeBranchId?: string | null;
  storeBranchName?: string | null;
  productId: string;
  productName: string;
  barcode?: string | null;
  sku?: string | null;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  reorderLevel?: number | null;
  effectiveReorderLevel?: number | null;
  costPrice: number;
  totalValuation: number;
}

export interface InventoryLocationCreateRequest {
  name: string;
  code?: string;
  locationType: LocationType;
  storeBranchId?: string;
  servesAllBranches?: boolean;
  address?: string;
  servedBranchIds?: string[];
}

export interface InventoryLocationUpdateRequest {
  name: string;
  code?: string;
  servesAllBranches?: boolean;
  address?: string;
  isActive?: boolean;
}

export type StockTransferStatus =
  | 'INITIATED'
  | 'PENDING_APPROVAL'
  | 'IN_TRANSIT'
  | 'COMPLETED'
  | 'REJECTED'
  | 'CANCELLED';

export interface StockTransferItem {
  id?: string;
  productId: string;
  productName?: string;
  barcode?: string;
  sku?: string;
  requestedQuantity: number;
  dispatchedQuantity?: number;
  receivedQuantity?: number;
  unitCost: number;
  notes?: string;
}

export interface StockTransfer {
  id: string;
  storeId: string;
  transferNumber: string;
  sourceLocationId: string;
  sourceLocationName: string;
  sourceBranchId?: string | null;
  sourceBranchName?: string | null;
  destinationLocationId: string;
  destinationLocationName: string;
  destinationBranchId?: string | null;
  destinationBranchName?: string | null;
  status: StockTransferStatus;
  totalCostValue: number;
  autoConfirm: boolean;
  notes?: string;
  initiatedById: string;
  initiatedByName: string;
  approvedById?: string;
  approvedByName?: string;
  dispatchedById?: string;
  dispatchedByName?: string;
  receivedById?: string;
  receivedByName?: string;
  cancelledById?: string;
  cancelledByName?: string;
  makerCheckerRequestId?: string;
  dispatchedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  rejectionReason?: string;
  createdAt: string;
  items: StockTransferItem[];
}

export interface StockTransferItemRequest {
  productId: string;
  quantity: number;
  notes?: string;
}

export interface StockTransferCreateRequest {
  sourceLocationId?: string;
  sourceBranchId?: string;
  destinationLocationId?: string;
  destinationBranchId?: string;
  autoConfirm?: boolean;
  notes?: string;
  items: StockTransferItemRequest[];
}

export interface StockTransferConfirmRequest {
  notes?: string;
  receivedItems?: {
    productId: string;
    receivedQuantity: number;
    notes?: string;
  }[];
}

export interface InternalConsumptionRequest {
  locationId?: string;
  storeBranchId?: string;
  productId: string;
  quantity: number;
  reason?: string;
  notes?: string;
}

export interface InternalConsumptionResponse {
  movementId: string;
  productId: string;
  productName: string;
  locationId: string;
  locationName: string;
  consumedQuantity: number;
  balanceBefore: number;
  balanceAfter: number;
  unitCost: number;
  totalCostValuation: number;
  reason?: string;
  recordedByName: string;
  createdAt: string;
}

export interface StoreBranchInfo {
  id: string;
  storeId: string;
  name: string;
  code?: string;
  phone?: string;
  email?: string;
  address?: string;
  isMain?: boolean;
  status?: string;
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
  | 'MAKER_CHECKER'
  | 'APPROVAL'
  | 'APPROVAL_REQUEST'
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

// ==========================================
// CASHFLOW & DASHBOARD V2 TYPES
// ==========================================

export interface PaymentChannelDetail {
  amount: number;
  count: number;
}

export interface DebtorSummaryItem {
  id: string;
  name: string;
  code: string;
  phone: string;
  outstandingBalance: number;
  creditLimit: number;
}

export interface CreditorSummaryItem {
  id: string;
  name: string;
  code: string;
  contactPerson: string;
  phone: string;
  category: string;
  balance: number;
}

export interface CashflowVelocityTrendPoint {
  label: string;
  date: string;
  salesRevenue: number;
  profit?: number;
  debtCollections?: number;
  pettyExpenses: number;
  netCashflow: number;
}

export interface CashflowOverview {
  period: string;
  netCashflow: number;
  netCashflowStatus: 'SURPLUS' | 'DEFICIT';
  cashOnHand: number;
  activeShiftsCount: number;
  activeRegisters: Array<{
    shiftId: string;
    terminalId: string;
    cashierName: string;
    openedAt: string;
    expectedCash: number;
  }>;
  sales: {
    totalSales: number;
    todaySales: number;
    transactionsCount: number;
    avgTicket: number;
    grossProfit: number;
    grossMarginPercent?: number;
    cogs?: number;
  };
  paymentBreakdown: {
    cash: PaymentChannelDetail;
    mobile: PaymentChannelDetail;
    card: PaymentChannelDetail;
    credit: PaymentChannelDetail;
  };
  debtors: {
    totalOutstanding: number;
    totalCreditLimit: number;
    debtorsCount: number;
    collectedInPeriod: number;
    overdueCount: number;
    topDebtors: DebtorSummaryItem[];
  };
  creditors: {
    totalPayables: number;
    creditorsCount: number;
    purchasesInPeriod: number;
    netTradeGap: number;
    topCreditors: CreditorSummaryItem[];
  };
  cashMovements: {
    payIn: number;
    payOut: number;
    cashDrop: number;
    netMovement: number;
  };
  velocityTrends: CashflowVelocityTrendPoint[];
  topSellingProducts: Array<{
    name: string;
    quantity: number;
    revenue: number;
  }>;
  inventoryAlerts: {
    lowStockCount: number;
    outOfStockCount: number;
    soonToExpireCount: number;
  };
  collection?: CollectionIntelligence;
  inventoryValuation?: InventoryValuationIntelligence;
  tillDiscrepancies?: TillDiscrepancyOverview;
}

export interface ShiftAuditItem {
  shiftId: string;
  terminalId: string;
  cashierName: string;
  openedAt: string;
  closedAt: string;
  openingCash: number;
  expectedCash: number;
  actualCash: number;
  discrepancy: number;
  totalSales: number;
  notes?: string;
}

export interface TillDiscrepancyOverview {
  netDiscrepancy: number;
  totalShortages: number;
  totalOverages: number;
  shortagesCount: number;
  overagesCount: number;
  balancedCount: number;
  closedShiftsCount: number;
  status: 'BALANCED' | 'SHORTAGE' | 'OVERAGE';
  recentShifts: ShiftAuditItem[];
}

export interface RiskDebtorItem {
  customerId: string;
  customerName: string;
  phone: string;
  amount: number;
  daysOverdue: number;
  oldestDueDate: string;
}

export interface AgingBucket {
  amount: number;
  count: number;
}

export interface MoneyToCollectBreakdown {
  total: number;
  dueToday: number;
  dueThisWeek: number;
  overdue: number;
  debtorsCount: number;
}

export interface MoneyOwedSuppliersBreakdown {
  total: number;
  dueToday: number;
  dueThisWeek: number;
  overdue: number;
  creditorsCount: number;
  topCreditors: CreditorSummaryItem[];
}

export interface CollectionIntelligence {
  collectionRate: number;
  amountCollected: number;
  amountDue: number;
  moneyToCollect: MoneyToCollectBreakdown;
  debtAging: {
    current: AgingBucket;
    days8to30: AgingBucket;
    days31to60: AgingBucket;
    days60plus: AgingBucket;
    riskAmount: number;
    highRiskAmount: number;
  };
  riskDebtors: RiskDebtorItem[];
  moneyOwedSuppliers: MoneyOwedSuppliersBreakdown;
}

export interface DeadStockProductItem {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  category: string;
  quantity: number;
  costPrice: number;
  sellingPrice: number;
  capitalTiedUp: number;
  daysDormant: number;
}

export interface StockVelocityBucket {
  capital: number;
  count: number;
  percent: number;
  productIds?: string[];
}

export interface InventoryValuationIntelligence {
  totalCapital: number;
  potentialRevenue: number;
  unrealizedProfit: number;
  inStockCount: number;
  stockRunwayDays?: number;
  dailyCogs?: number;
  runwayStatus?: 'CRITICAL_LOW' | 'OPTIMAL_LEAN' | 'HEALTHY_BALANCED' | 'OVERSTOCKED' | 'STAGNANT';
  fastMoving: StockVelocityBucket;
  slowMoving: StockVelocityBucket;
  deadStock: StockVelocityBucket;
  newArrivals?: StockVelocityBucket;
  fastMovingProductIds?: string[];
  slowMovingProductIds?: string[];
  newArrivalProductIds?: string[];
  deadStockProductIds?: string[];
  deadStockProducts: DeadStockProductItem[];
  recommendations: string[];
}

// ==========================================
// PURCHASE ORDERS & PROCUREMENT MODULE TYPES
// ==========================================

export type PurchaseOrderStatus = 
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'PARTIALLY_RECEIVED'
  | 'RECEIVED'
  | 'CANCELLED';

export interface PurchaseOrderItem {
  id?: string;
  productId: string;
  productName: string;
  sku?: string;
  barcode?: string;
  quantityOrdered: number;
  quantityReceived: number;
  remainingQuantity: number;
  unitCost: number;
  totalCost: number;
  isWholesale?: boolean;
  conversionFactor?: number;
  notes?: string;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  storeId?: string;
  storeName?: string;
  branchId: string;
  branchName?: string;
  destinationLocationId?: string;
  destinationLocationName?: string;
  supplierId?: string;
  supplierName?: string;
  status: PurchaseOrderStatus;
  paymentType: PurchasePaymentType;
  totalEstimatedCost: number;
  totalActualCost?: number;
  expectedDeliveryDate?: string;
  notes?: string;
  createdById?: string;
  createdByName?: string;
  approvedById?: string;
  approvedByName?: string;
  cashierShiftId?: string;
  createdAt: string;
  updatedAt?: string;
  items: PurchaseOrderItem[];
}

export interface PurchaseOrderItemInputRequest {
  productId: string;
  quantity: number;
  unitCost: number;
  isWholesale?: boolean;
  wholesale?: boolean;
  notes?: string;
}

export interface PurchaseOrderCreateRequest {
  storeBranchId?: string;
  destinationLocationId?: string;
  supplierId?: string;
  paymentType?: PurchasePaymentType;
  expectedDeliveryDate?: string;
  notes?: string;
  cashierShiftId?: string;
  items: PurchaseOrderItemInputRequest[];
}

export interface PurchaseOrderUpdateRequest {
  supplierId?: string;
  paymentType?: PurchasePaymentType;
  expectedDeliveryDate?: string;
  notes?: string;
  items: PurchaseOrderItemInputRequest[];
}

export interface PurchaseOrderReceiveItem {
  productId: string;
  receivedQuantity: number;
}

export interface PurchaseOrderReceiveRequest {
  items: PurchaseOrderReceiveItem[];
}

export interface PurchaseOrderCartItem {
  product: Product;
  quantity: number;
  unitCost: number;
  isWholesale: boolean;
  notes?: string;
}

// ==========================================
// MAKER-CHECKER (DUAL-AUTHORIZATION) TYPES
// ==========================================

export type MakerCheckerAction =
  | 'PURCHASE_ORDER'
  | 'PURCHASE_RETURN'
  | 'SALE_REVERSAL'
  | 'CREDIT_SALE'
  | 'EXPENSE_PAYOUT'
  | 'STOCK_ADJUSTMENT';

export type MakerCheckerStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface StoreApprovalPolicy {
  id?: string;
  storeId?: string;
  actionType: MakerCheckerAction;
  isEnabled: boolean;
  minAmountThreshold: number;
  allowedCheckerRole: UserRole;
  enforceDistinctChecker: boolean;
  allowOwnerSelfApproval: boolean;
  updatedAt?: string;
}

export interface StoreApprovalPolicyUpdateRequest {
  isEnabled: boolean;
  minAmountThreshold: number;
  allowedCheckerRole: UserRole;
  enforceDistinctChecker: boolean;
  allowOwnerSelfApproval: boolean;
}

export interface MakerCheckerRequest {
  id: string;
  requestNumber: string;
  storeId?: string;
  storeName?: string;
  branchId?: string;
  branchName?: string;
  actionType: MakerCheckerAction;
  entityName?: string;
  entityId?: string;
  title: string;
  description?: string;
  amount?: number;
  payloadSnapshot?: string;
  status: MakerCheckerStatus;
  makerId?: string;
  makerName?: string;
  checkerId?: string;
  checkerName?: string;
  actionedAt?: string;
  rejectionReason?: string;
  approvalNotes?: string;
  createdAt: string;
}

export interface MakerCheckerDecisionRequest {
  reason?: string;
  notes?: string;
}
