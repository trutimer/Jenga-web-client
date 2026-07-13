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
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  supplier: string;
  sku?: string;
  wholesalePrice?: number;
  unitOfMeasure?: 'PCS' | 'KG' | 'LTR';
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
  paymentMethod: 'Cash' | 'Card' | 'M-Pesa';
  amountReceived: number;
  changeDue: number;
  refCode?: string;
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

export type ViewType = 'login' | 'dashboard' | 'checkout' | 'inventory' | 'reports' | 'settings' | 'receipt' | 'stock-in' | 'suppliers' | 'users';

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

export interface AppUser {
  id: string;
  storeId: string;
  branchId: string;
  fullName: string;
  phone: string;
  role: UserRole;
  active: boolean;
  lastLoginAt: string;
  createdAt: string;
}

export interface UserCreateRequest {
  storeId?: string;
  branchId?: string;
  fullName: string;
  phone: string;
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
