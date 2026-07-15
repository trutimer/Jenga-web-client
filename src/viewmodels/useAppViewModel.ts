import { ref, computed, watch, nextTick } from 'vue';
import type { Product, StoreSettings, Transaction, Supplier, CashierShift } from '../models/types';
import { INITIAL_PRODUCTS, INITIAL_STORE_SETTINGS, INITIAL_SUPPLIERS } from '../models/mockData';
import { api } from '../services/api';
import { showToast } from '../services/toastService';
import router from '../router';

// Global shared reactive states
const user = ref<string | null>(
  localStorage.getItem('accessToken') && localStorage.getItem('storeId')
    ? (localStorage.getItem('cashierName') || 'Sarah K.')
    : null
);
const userRole = ref<string | null>(
  localStorage.getItem('accessToken') && localStorage.getItem('storeId')
    ? (localStorage.getItem('cashierRole') || 'CASHIER')
    : null
);
const userId = ref<string | null>(localStorage.getItem('cashierId'));
const activeBranchId = ref<string | null>(localStorage.getItem('branchId'));
const mobileMenuOpen = ref(false);
const sidebarCollapsed = ref(false);
const products = ref<Product[]>(INITIAL_PRODUCTS);
const settings = ref<StoreSettings>(INITIAL_STORE_SETTINGS);
const transactionsHistory = ref<Transaction[]>([]);
const lastTransaction = ref<Transaction | null>(null);
const suppliers = ref<Supplier[]>(INITIAL_SUPPLIERS);
const searchQuery = ref('');
const currentShift = ref<CashierShift | null>(null);
const cashMovementAnalytics = ref<any>(null);
const shiftSales = ref<any[]>([]);

// Inactivity lockout timer
let timeoutId: any = null;
const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

const resetInactivityTimeout = () => {
  if (timeoutId) clearTimeout(timeoutId);
  timeoutId = setTimeout(() => {
    user.value = null;
    activeBranchId.value = null;
    mobileMenuOpen.value = false;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('cashierId');
    localStorage.removeItem('storeId');
    localStorage.removeItem('branchId');
    localStorage.removeItem('cashierName');
    localStorage.removeItem('cashierRole');
    router.push('/login');
  }, 5 * 60 * 1000); // 5 minutes
};

const handleActivity = () => {
  if (user.value) {
    resetInactivityTimeout();
  }
};

watch(
  user,
  (newUser) => {
    if (newUser) {
      resetInactivityTimeout();
      activityEvents.forEach((event) => {
        window.addEventListener(event, handleActivity);
      });
    } else {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      activityEvents.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
    }
  },
  { immediate: true }
);

export function useAppViewModel() {
  const lowStockCount = computed(() => {
    return products.value.filter((p) => p.stock > 0 && p.stock <= p.minStock).length;
  });

  const fetchSettings = async () => {
    const storeId = localStorage.getItem('storeId');
    if (!storeId) return;
    try {
      const settingsData = await api.get(`/api/stores/${storeId}`);
      if (settingsData) {
        settings.value = {
          name: settingsData.name,
          tin: settingsData.tin || '',
          physicalAddress: settingsData.physicalAddress || '',
          phone: settingsData.phone || '',
          email: settingsData.email || '',
          currency: (settingsData.currency || 'TZS') as 'TZS' | 'USD' | 'EUR',
          timezone: settingsData.timezone || 'Africa/Dar_es_Salaam',
        };
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    }
  };

  const fetchProducts = async () => {
    const branchId = localStorage.getItem('branchId');
    if (!branchId || branchId === 'null' || branchId === 'undefined') return;
    try {
      const productsData = await api.get<any[]>(`/api/products?storeBranchId=${branchId}`);
      if (productsData) {
        const mappedProducts: Product[] = productsData.map((p) => {
          let statusType: 'In Stock' | 'Low Stock' | 'Out of Stock' = 'In Stock';
          const stockNum = Number(p.stock) || 0;
          if (stockNum === 0) {
            statusType = 'Out of Stock';
          } else if (stockNum <= p.reorderLevel) {
            statusType = 'Low Stock';
          }
          return {
            id: p.id,
            name: p.name,
            barcode: p.barcode || '',
            category: p.categoryName || 'General',
            cost: Number(p.costPrice) || 0,
            price: Number(p.sellingPrice) || 0,
            stock: stockNum,
            minStock: p.reorderLevel || 10,
            status: statusType,
            supplier: 'Bakhresa Group',
            sku: p.sku || '',
            wholesalePrice: p.wholesalePrice ? Number(p.wholesalePrice) : undefined,
            unitOfMeasure: p.unitOfMeasure || p.UnitOfMeasure || undefined,
          };
        });
        products.value = mappedProducts;
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
    }
  };

  const fetchSuppliers = async () => {
    const storeId = localStorage.getItem('storeId');
    if (!storeId || storeId === 'null' || storeId === 'undefined') return;
    try {
      const suppliersData = await api.get<any[]>(`/api/suppliers?storeId=${storeId}`);
      if (suppliersData) {
        const mappedSuppliers: Supplier[] = suppliersData.map((s) => ({
          id: s.id,
          code: s.code,
          name: s.name,
          contactPerson: s.contactPerson || '',
          phone: s.phone || '',
          email: s.email || '',
          category: s.category || 'Wholesale',
          balance: Number(s.balance) || 0,
          status: (s.status || 'Active') as 'Active' | 'Inactive',
        }));
        suppliers.value = mappedSuppliers;
      }
    } catch (err) {
      console.error('Failed to fetch suppliers:', err);
    }
  };

  const fetchSalesHistory = async (startDate?: string, endDate?: string) => {
    try {
      let url = '/api/sales';
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      params.append('size', '1000');
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      const response = await api.get<any>(url);
      const salesData = response?.content || [];
      if (salesData) {
        const mappedSales: Transaction[] = salesData.map((s: any) => {
          return {
            id: s.id,
            date: (s.createdAt
              ? (() => {
                  const d = new Date(s.createdAt);
                  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                })()
              : (() => {
                  const d = new Date();
                  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                })()) ?? '',
            items: (s.items || []).map((item: any) => ({
              product: {
                id: item.productId,
                name: item.productName || 'Product',
                barcode: item.productBarcode || '',
                category: 'General',
                cost: 0,
                price: Number(item.unitPrice) || 0,
                stock: 0,
                minStock: 0,
                status: 'In Stock' as const,
                supplier: '',
              },
              quantity: Number(item.quantity) || 0,
              discount: Number(item.discountPercent) || 0,
            })),
            subtotal: Number(s.totalAmount) || 0,
            discount: 0,
            tax: (Number(s.totalAmount) * 0.18) / 1.18 || 0,
            total: Number(s.totalAmount) || 0,
            paymentMethod: (s.paymentMethod === 'MOBILE'
              ? 'M-Pesa'
              : s.paymentMethod === 'CARD'
              ? 'Card'
              : 'Cash') as 'Cash' | 'Card' | 'M-Pesa',
            amountReceived: Number(s.totalAmount) || 0,
            changeDue: 0,
          };
        });
        transactionsHistory.value = mappedSales;
      }
    } catch (err) {
      console.error('Failed to fetch sales history:', err);
    }
  };

  const fetchCurrentShift = async () => {
    if (userRole.value !== 'CASHIER') return;
    try {
      const shift = await api.get<CashierShift>('/api/shifts/open');
      currentShift.value = shift;
    } catch (err: any) {
      console.log('No open shift found or error fetching shift:', err);
      currentShift.value = null;
    }
  };

  const openShift = async (openingCash: number) => {
    try {
      const shift = await api.post<CashierShift>('/api/shifts/open', { openingCash });
      currentShift.value = shift;
      showToast('Shift opened successfully', 'success');
      return true;
    } catch (err: any) {
      showToast(err.message || 'Failed to open shift', 'error');
      return false;
    }
  };

  const closeShift = async (actualCash: number, notes?: string) => {
    try {
      const shift = await api.post<CashierShift>('/api/shifts/close', { actualCash, notes });
      currentShift.value = null;
      showToast('Shift closed successfully. Discrepancy: ' + shift.discrepancy, 'success');
      return true;
    } catch (err: any) {
      showToast(err.message || 'Failed to close shift', 'error');
      return false;
    }
  };

  const fetchCashMovementAnalytics = async (date?: string) => {
    if (userRole.value !== 'CASHIER') return;
    try {
      const url = date ? `/api/cash-movements/analytics?date=${date}` : '/api/cash-movements/analytics';
      const data = await api.get<any>(url);
      cashMovementAnalytics.value = data;
    } catch (err: any) {
      console.error('Failed to fetch cash movement analytics:', err);
    }
  };

  const createCashMovement = async (type: string, amount: number, reason: string) => {
    try {
      await api.post('/api/cash-movements', { type, amount, reason });
      showToast('Cash movement recorded successfully', 'success');
      await fetchCashMovementAnalytics(); // Refresh analytics
      return { success: true };
    } catch (err: any) {
      showToast(err.message || 'Failed to record cash movement', 'error');
      return { success: false, error: err.message || 'Failed to record cash movement' };
    }
  };

  const updateCashMovement = async (id: string, type: string, amount: number, reason: string) => {
    try {
      await api.put(`/api/cash-movements/${id}`, { type, amount, reason });
      showToast('Cash movement updated successfully', 'success');
      await fetchCashMovementAnalytics(); // Refresh analytics
      return { success: true };
    } catch (err: any) {
      showToast(err.message || 'Failed to update cash movement', 'error');
      return { success: false, error: err.message || 'Failed to update cash movement' };
    }
  };

  const deleteCashMovement = async (id: string) => {
    try {
      await api.delete(`/api/cash-movements/${id}`);
      showToast('Cash movement deleted successfully', 'success');
      await fetchCashMovementAnalytics(); // Refresh analytics
      return true;
    } catch (err: any) {
      showToast(err.message || 'Failed to delete cash movement', 'error');
      return false;
    }
  };

  const fetchShiftSales = async () => {
    if (userRole.value !== 'CASHIER') return;
    try {
      const data = await api.get<any[]>('/api/cashier/sales');
      shiftSales.value = data || [];
    } catch (err: any) {
      console.error('Failed to fetch shift sales:', err);
    }
  };

  const reverseTransaction = async (id: string) => {
    try {
      const response = await api.post(`/api/cashier/sales/${id}/reverse`);
      showToast(response.message || 'Transaction reversed successfully', 'success');
      await fetchShiftSales(); // Refresh the list
      await fetchCurrentShift(); // Refresh shift balances
      return true;
    } catch (err: any) {
      showToast(err.message || 'Failed to reverse transaction', 'error');
      return false;
    }
  };

  const handleLogin = (name: string, resolvedBranchId: string | null) => {
    activeBranchId.value = resolvedBranchId;
    user.value = name;
    userRole.value = localStorage.getItem('cashierRole') || 'CASHIER';
    userId.value = localStorage.getItem('cashierId');
    if (userRole.value === 'CASHIER') {
      fetchCurrentShift();
    }
    nextTick(() => {
      if (userRole.value === 'CASHIER') {
        router.push('/checkout');
      } else {
        router.push('/dashboard');
      }
    });
  };

  const handleLogout = () => {
    user.value = null;
    activeBranchId.value = null;
    mobileMenuOpen.value = false;
    currentShift.value = null;
    localStorage.clear();
    sessionStorage.clear();
    router.push('/login');
  };

  const handleUpdateSettings = async (newSettings: StoreSettings) => {
    settings.value = newSettings;
    const storeId = localStorage.getItem('storeId');
    if (!storeId) return;

    try {
      await api.put(`/api/stores/${storeId}`, {
        name: newSettings.name,
        tin: newSettings.tin,
        physicalAddress: newSettings.physicalAddress,
        phone: newSettings.phone,
        email: newSettings.email,
        currency: newSettings.currency,
        timezone: newSettings.timezone,
      });
    } catch (err) {
      console.error('Failed to update store settings in backend:', err);
    }
  };

  const handleTransactionCompleted = async (txn: Transaction) => {
    const storeId = localStorage.getItem('storeId');
    const cashierId = localStorage.getItem('cashierId');
    const branchId = localStorage.getItem('branchId');

    if (!storeId || !cashierId || !branchId) {
      showToast('Error: Active session credentials not found. Please log in again.', 'error');
      return;
    }

    if (userRole.value === 'CASHIER' && !currentShift.value) {
      showToast('Error: You must have an active open shift to process sales.', 'error');
      return;
    }

    let pm: 'CASH' | 'CARD' | 'MOBILE' = 'CASH';
    if (txn.paymentMethod === 'Card') pm = 'CARD';
    else if (txn.paymentMethod === 'M-Pesa') pm = 'MOBILE';

    const items = txn.items.map((item) => {
      const discountPercent =
        item.product.price > 0 ? ((item.discount || 0) / item.product.price) * 100 : 0;
      return {
        productId: item.product.id,
        quantity: item.quantity,
        unitPrice: item.product.price,
        discountPercent: Number(discountPercent.toFixed(2)),
      };
    });

    try {
      const createdSale = await api.post('/api/sales', {
        storeBranchId: branchId,
        cashierId,
        paymentMethod: pm,
        items,
      });

      await fetchProducts();
      await fetchSalesHistory();
      await fetchCurrentShift();

      const receiptTxn: Transaction = {
        id: createdSale.id,
        date: createdSale.createdAt
          ? new Date(createdSale.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })
          : txn.date,
        items: txn.items,
        subtotal: Number(createdSale.totalAmount) || txn.subtotal,
        discount: txn.discount,
        tax: (Number(createdSale.totalAmount) * 0.18) / 1.18 || txn.tax,
        total: Number(createdSale.totalAmount) || txn.total,
        paymentMethod: txn.paymentMethod,
        amountReceived: txn.amountReceived,
        changeDue: txn.changeDue,
        refCode: txn.refCode || createdSale.id.slice(0, 8).toUpperCase(),
      };

      lastTransaction.value = receiptTxn;
      router.push('/receipt');
    } catch (err: any) {
      showToast('Failed to save transaction to backend: ' + (err.message || err), 'error');
    }
  };

  return {
    user,
    userRole,
    userId,
    activeBranchId,
    mobileMenuOpen,
    sidebarCollapsed,
    products,
    settings,
    transactionsHistory,
    lastTransaction,
    suppliers,
    searchQuery,
    lowStockCount,
    currentShift,
    handleLogin,
    handleLogout,
    updateSettings: handleUpdateSettings,
    handleTransactionCompleted,
    fetchSettings,
    fetchProducts,
    fetchSuppliers,
    fetchSalesHistory,
    fetchCurrentShift,
    openShift,
    closeShift,
    cashMovementAnalytics,
    fetchCashMovementAnalytics,
    createCashMovement,
    updateCashMovement,
    deleteCashMovement,
    shiftSales,
    fetchShiftSales,
    reverseTransaction,
  };
}
