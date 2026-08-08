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
  unitOfMeasure?: 'PCS' | 'KG' | 'LTR';
  expiryDate?: string;
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
}

export type ViewType = 'login' | 'select-branch' | 'dashboard' | 'checkout' | 'inventory' | 'reports' | 'settings' | 'receipt' | 'stock-in' | 'suppliers' | 'users' | 'profile' | 'customers';

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

export type StockMovementType = 'PURCHASE' | 'ADJUSTMENT' | 'SALE' | 'TRANSFER' | 'RETURN' | string;

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
