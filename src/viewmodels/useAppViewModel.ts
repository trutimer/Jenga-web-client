import { ref, computed, watch, nextTick } from 'vue';
import type { Product, StoreSettings, Transaction, Supplier, CashierShift } from '../models/types';
import { INITIAL_PRODUCTS, INITIAL_STORE_SETTINGS, INITIAL_SUPPLIERS } from '../models/mockData';
import { api } from '../services/api';
import { showToast } from '../services/toastService';
import { isElectron } from '../services/offlineSalesService';
import router from '../router';


const formatDateForInput = (dateStr?: string | null): string => {
  if (!dateStr) return '';
  const str = String(dateStr).trim();
  if (!str) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
  const d = new Date(str);
  if (isNaN(d.getTime())) return str.slice(0, 10);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

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
const isFetchingProducts = ref(false);
const isFetchingSales = ref(false);
const isFetchingSuppliers = ref(false);
const settings = ref<StoreSettings>(INITIAL_STORE_SETTINGS);
const transactionsHistory = ref<Transaction[]>([]);
const lastTransaction = ref<Transaction | null>(null);
const suppliers = ref<Supplier[]>(INITIAL_SUPPLIERS);
const searchQuery = ref('');
const currentShift = ref<CashierShift | null>(null);
const cashMovementAnalytics = ref<any>(null);
const shiftSales = ref<any[]>([]);
const userPermissions = ref<string[]>(
  JSON.parse(localStorage.getItem('userPermissions') || '[]')
);

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
      const settingsData: any = await api.get(`/api/stores/${storeId}`);
      if (settingsData) {
        settings.value = {
          name: settingsData.name,
          tin: settingsData.tin || '',
          physicalAddress: settingsData.physicalAddress || '',
          phone: settingsData.phone || '',
          email: settingsData.email || '',
          currency: (settingsData.currency || 'TZS') as 'TZS' | 'USD' | 'EUR',
          timezone: settingsData.timezone || 'Africa/Dar_es_Salaam',
          enablePerpetualCogs: !!settingsData.enablePerpetualCogs,
        };
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    }
  };

  const fetchProducts = async () => {
    const branchId = localStorage.getItem('branchId');
    if (!branchId || branchId === 'null' || branchId === 'undefined') return;

    isFetchingProducts.value = true;
    try {
      const productsData = await api.get<any>(`/api/products?storeBranchId=${branchId}`);
      const productsList: any[] = Array.isArray(productsData) ? productsData : (productsData?.content || []);

      if (productsList && Array.isArray(productsList)) {
        const mappedProducts: Product[] = productsList.map((p) => {

          let statusType: 'In Stock' | 'Low Stock' | 'Out of Stock' | 'Soon to expire' | 'Expired' = 'In Stock';
          const stockNum = Number(p.stock) || 0;
          const formattedExpiry = formatDateForInput(p.expiryDate);
          if (formattedExpiry) {
            const exp = new Date(formattedExpiry);
            const now = new Date();
            now.setHours(0, 0, 0, 0);
            const diffMs = exp.getTime() - now.getTime();
            const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
            if (diffDays <= 0) {
              statusType = 'Expired';
            } else if (diffDays <= 90) {
              statusType = 'Soon to expire';
            }
          }
          if (statusType === 'In Stock') {
            if (stockNum === 0) {
              statusType = 'Out of Stock';
            } else if (stockNum <= (p.reorderLevel || 10)) {
              statusType = 'Low Stock';
            }
          }
          return {
            id: p.id,
            name: p.name,
            barcode: p.barcode || '',
            category: p.categoryName || p.category || 'General',
            cost: Number(p.costPrice || p.cost) || 0,
            price: Number(p.sellingPrice || p.price) || 0,
            stock: stockNum,
            minStock: p.reorderLevel || 10,
            status: statusType,
            supplier: p.supplierName || p.supplier || '',
            sku: p.sku || '',
            wholesalePrice: p.wholesalePrice ? Number(p.wholesalePrice) : undefined,
            unitOfMeasure: p.unitOfMeasure || p.UnitOfMeasure || undefined,
            expiryDate: formattedExpiry || undefined,
            wholesaleBarcode: p.wholesaleBarcode || undefined,
            conversionFactor: p.conversionFactor ? Number(p.conversionFactor) : undefined,
            categoryName: p.categoryName || p.category || 'General',
            supplierName: p.supplierName || p.supplier || '',
          };
        });
        products.value = mappedProducts;
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      isFetchingProducts.value = false;
    }
  };


  const fetchSuppliers = async () => {
    const storeId = localStorage.getItem('storeId');
    if (!storeId || storeId === 'null' || storeId === 'undefined') return;
    isFetchingSuppliers.value = true;
    try {
      const suppliersData = await api.get<any>(`/api/suppliers?storeId=${storeId}&size=1000`);
      const suppliersList: any[] = Array.isArray(suppliersData) ? suppliersData : (suppliersData?.content || []);
      if (suppliersList && Array.isArray(suppliersList)) {
        const mappedSuppliers: Supplier[] = suppliersList.map((s) => ({
          id: s.id,
          code: s.code || (s.id ? s.id.slice(0, 6).toUpperCase() : 'SUP'),
          name: s.name,
          contactPerson: s.contactPerson || s.contact_person || '',
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
    } finally {
      isFetchingSuppliers.value = false;
    }
  };


  const fetchSalesHistory = async (startDate?: string, endDate?: string) => {
    isFetchingSales.value = true;
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
          const totalVal = Number(s.totalAmount) || 0;
          let method = 'Cash';
          if (s.paymentMethod === 'MOBILE' || s.paymentMethod === 'MOBILE_MONEY') {
            method = 'M-Pesa';
          } else if (s.paymentMethod === 'CARD') {
            method = 'Card';
          } else if (s.paymentMethod === 'CREDIT' || s.paymentMethod === 'ON_CREDIT') {
            method = 'CREDIT';
          } else if (s.paymentMethod) {
            method = s.paymentMethod;
          }

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
                cost: Number(item.costPrice || item.cost || item.unitCost) || 0,
                price: Number(item.unitPrice) || 0,
                stock: 0,
                minStock: 10,
                status: 'In Stock' as const,
                supplier: '',
              },
              quantity: Number(item.quantity) || 1,
              discount: Number(item.discountPercent) || 0,
            })),
            subtotal: Number(s.subtotal) || totalVal,
            discount: 0,
            tax: Number(s.taxAmount) || (totalVal * 0.18) / 1.18 || 0,
            total: totalVal,
            paymentMethod: method,
            amountReceived: totalVal,
            changeDue: 0,
            refCode: s.customerCode || (s.id ? s.id.substring(0, 8).toUpperCase() : ''),
            cashierId: s.cashierId || undefined,
            cashierName: s.cashierName || undefined,
            customerId: s.customerId || undefined,
            customerName: s.customerName || undefined,
            customerCode: s.customerCode || undefined,
            reversedById: s.reversedById || null,
            status: s.status || (s.reversedById ? 'VOID' : 'PAID'),
          };
        });
        transactionsHistory.value = mappedSales;
      }
    } catch (err) {
      console.error('Failed to fetch sales history:', err);
    } finally {
      isFetchingSales.value = false;
    }
  };

  const fetchCurrentShift = async () => {
    if (userRole.value !== 'CASHIER') return;
    const branchId = localStorage.getItem('branchId') || '';
    const cashierId = localStorage.getItem('cashierId') || localStorage.getItem('userId') || '';
    try {
      const shift = await api.get<CashierShift>('/api/shifts/open');
      if (shift && shift.status === 'OPEN') {
        currentShift.value = shift;
        if (isElectron() && branchId) {
          try { await (window as any).ipcRenderer.invoke('db:save-shift', { shift }); } catch (e) {}
        }
      } else {
        currentShift.value = null;
        if (isElectron() && branchId && cashierId) {
          try { await (window as any).ipcRenderer.invoke('db:clear-active-shifts', { branchId, cashierId }); } catch (e) {}
        }
      }
    } catch (err: any) {
      console.log('No open shift found or error fetching shift:', err);
      if (!currentShift.value) {
        currentShift.value = null;
      }
    }
  };

  const openShift = async (openingCash: number) => {
    try {
      const shift = await api.post<CashierShift>('/api/shifts/open', { openingCash });
      currentShift.value = shift;
      const branchId = localStorage.getItem('branchId') || '';
      if (isElectron() && branchId && shift) {
        try { await (window as any).ipcRenderer.invoke('db:save-shift', { shift }); } catch (e) {}
      }
      showToast('Shift opened successfully', 'success');
      return true;
    } catch (err: any) {
      showToast(err.message || 'Failed to open shift', 'error');
      return false;
    }
  };

  const closeShift = async (actualCash: number, notes?: string) => {
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      showToast('Internet connection is required to close register shift and log out. Please connect to the internet.', 'error');
      return false;
    }
    try {
      const shift = await api.post<CashierShift>('/api/shifts/close', { actualCash, notes });
      currentShift.value = null;
      const branchId = localStorage.getItem('branchId') || '';
      const cashierId = localStorage.getItem('cashierId') || localStorage.getItem('userId') || '';
      if (isElectron() && branchId && cashierId) {
        try { await (window as any).ipcRenderer.invoke('db:clear-active-shifts', { branchId, cashierId }); } catch (e) {}
      }
      showToast('Shift closed successfully. Discrepancy: ' + (shift?.discrepancy || 0), 'success');
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

  const setActiveBranch = async (branchId: string) => {
    localStorage.setItem('branchId', branchId);
    activeBranchId.value = branchId;
    await fetchSettings();
    await fetchProducts();
  };

  const fetchCurrentUserPermissions = async () => {
    const currentUserId = userId.value || localStorage.getItem('cashierId');
    if (!currentUserId) return;
    try {
      const res = await api.get<any>(`/api/users/${currentUserId}/permissions`);
      if (res && res.permissions) {
        userPermissions.value = res.permissions;
        localStorage.setItem('userPermissions', JSON.stringify(res.permissions));
      }
    } catch (err) {
      console.error('Failed to fetch current user permissions:', err);
    }
  };

  const hasPermission = (code: string): boolean => {
    if (userRole.value === 'SUPER_ADMIN' || userRole.value === 'ADMIN') {
      return true;
    }
    if (userRole.value === 'CASHIER' && code === 'pos:checkout') {
      return true;
    }
    return userPermissions.value.includes(code);
  };

  const hasCategoryAccess = (category: string): boolean => {
    if (userRole.value === 'SUPER_ADMIN' || userRole.value === 'ADMIN') {
      return true;
    }
    const cat = category.toLowerCase();
    if (cat === 'pos' || cat === 'checkout') {
      return hasPermission('pos:checkout');
    }
    return userPermissions.value.some((p) => p.toLowerCase().startsWith(cat + ':'));
  };

  const handleLogin = (name: string, resolvedBranchId: string | null) => {
    activeBranchId.value = resolvedBranchId;
    user.value = name;
    userRole.value = localStorage.getItem('cashierRole') || 'CASHIER';
    userId.value = localStorage.getItem('cashierId');
    fetchCurrentUserPermissions();
    if (userRole.value === 'CASHIER') {
      fetchCurrentShift();
    }
    nextTick(() => {
      if (userRole.value === 'ADMIN' && (!resolvedBranchId || resolvedBranchId === '')) {
        router.push('/select-branch');
      } else if (userRole.value === 'CASHIER') {
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
    userPermissions.value = [];
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
        enablePerpetualCogs: newSettings.enablePerpetualCogs,
      });
    } catch (err) {
      console.error('Failed to update store settings in backend:', err);
      throw err;
    }
  };

  const toggleCogs = async (enabled?: boolean) => {
    const storeId = localStorage.getItem('storeId');
    if (!storeId) return;
    try {
      const url = enabled !== undefined 
        ? `/api/stores/${storeId}/cogs-toggle?enabled=${enabled}` 
        : `/api/stores/${storeId}/cogs-toggle`;
      const res: any = await api.patch(url, {});
      if (res && res.enablePerpetualCogs !== undefined) {
        settings.value = {
          ...settings.value,
          enablePerpetualCogs: res.enablePerpetualCogs,
        };
      }
      return res;
    } catch (err) {
      console.error('Failed to toggle COGS in backend:', err);
      throw err;
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

    let pm: 'CASH' | 'CARD' | 'MOBILE' | 'CREDIT' = 'CASH';
    if (txn.paymentMethod === 'Card') pm = 'CARD';
    else if (txn.paymentMethod === 'M-Pesa') pm = 'MOBILE';
    else if (txn.paymentMethod === 'On Credit' || txn.paymentMethod === 'CREDIT') pm = 'CREDIT';

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
      const createdSale = await api.post<any>('/api/sales', {
        storeBranchId: branchId,
        cashierId,
        paymentMethod: pm,
        customerId: txn.customerId || undefined,
        items,
      });

      // Non-blocking background refetches (allows 1ms UI response)
      fetchProducts().catch(() => {});
      fetchSalesHistory().catch(() => {});
      fetchCurrentShift().catch(() => {});


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
    isFetchingProducts,
    isFetchingSales,
    isFetchingSuppliers,
    settings,
    transactionsHistory,
    lastTransaction,
    suppliers,
    searchQuery,
    lowStockCount,
    currentShift,
    setActiveBranch,
    handleLogin,
    handleLogout,
    updateSettings: handleUpdateSettings,
    toggleCogs,
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
    userPermissions,
    fetchCurrentUserPermissions,
    hasPermission,
    hasCategoryAccess,
    reverseTransaction,
  };
}
