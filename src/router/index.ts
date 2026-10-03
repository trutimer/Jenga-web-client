import { createRouter, createWebHistory } from 'vue-router';
import { websocketService } from '../services/websocketService';
import { clearAuthStorage } from '../services/deviceService';
import { isJwtExpired, handleSessionExpired } from '../services/authSession';

const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/LoginView.vue'),
    meta: { guestOnly: true }
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('../views/DashboardView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/dashboard2',
    redirect: '/dashboard'
  },
  {
    path: '/checkout',
    name: 'checkout',
    component: () => import('../views/CheckoutView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/inventory',
    name: 'inventory',
    component: () => import('../views/InventoryView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/inventory/:id',
    name: 'product-details',
    component: () => import('../views/ProductDetailsView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/purchases',
    name: 'purchases',
    component: () => import('../views/PurchasesView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/purchases/cart',
    name: 'purchase-order-cart',
    component: () => import('../views/PurchaseOrderCartView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/purchases/orders/:id',
    name: 'purchase-order-details',
    component: () => import('../views/PurchaseOrderDetailsView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/top-selling-products',
    name: 'top-selling-products',
    component: () => import('../views/TopSellingProductsView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/suppliers',
    name: 'suppliers',
    component: () => import('../views/SuppliersView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/customers',
    name: 'customers',
    component: () => import('../views/CustomersView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/reports',
    name: 'reports',
    component: () => import('../views/ReportsView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/finance',
    name: 'finance',
    component: () => import('../views/FinanceView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('../views/SettingsView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/pending-approvals',
    redirect: { path: '/settings', query: { section: 'maker-checker', tab: 'pending' } }
  },
  {
    path: '/approvals',
    redirect: { path: '/settings', query: { section: 'maker-checker', tab: 'pending' } }
  },
  {
    path: '/receipt',
    name: 'receipt',
    component: () => import('../views/ReceiptView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/users',
    name: 'users',
    component: () => import('../views/UsersView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/users/:id',
    name: 'user-details',
    component: () => import('../views/UserDetailsView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/users/:id/shifts',
    name: 'cashier-shifts',
    component: () => import('../views/CashierShiftsView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/shifts/:id',
    name: 'shift-details',
    component: () => import('../views/ShiftDetailsView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/cash-movements',
    name: 'cash-movements',
    component: () => import('../views/CashMovementsView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/shift-sales',
    name: 'shift-sales',
    component: () => import('../views/ShiftSalesView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/select-branch',
    name: 'select-branch',
    component: () => import('../views/SelectBranchView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('../views/ProfileView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/help',
    name: 'help',
    component: () => import('../views/HelpView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/',
    redirect: () => {
      const role = localStorage.getItem('cashierRole');
      const branchId = localStorage.getItem('branchId');
      if (role === 'ADMIN' && (!branchId || branchId === 'null' || branchId === 'undefined')) {
        return '/select-branch';
      }
      return role === 'CASHIER' ? '/checkout' : '/dashboard';
    }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: () => {
      const role = localStorage.getItem('cashierRole');
      const branchId = localStorage.getItem('branchId');
      if (role === 'ADMIN' && (!branchId || branchId === 'null' || branchId === 'undefined')) {
        return '/select-branch';
      }
      return role === 'CASHIER' ? '/checkout' : '/dashboard';
    }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

function hasUserPermission(userPermissions: string[], perm: string): boolean {
  if (userPermissions.includes('*')) return true;
  if (userPermissions.includes(perm)) return true;
  const prefix = perm.includes(':') ? perm.split(':')[0] + ':*' : '';
  return !prefix ? false : userPermissions.includes(prefix);
}

function hasAnyUserPermission(userPermissions: string[], ...perms: string[]): boolean {
  if (userPermissions.includes('*')) return true;
  for (const p of perms) {
    if (hasUserPermission(userPermissions, p)) return true;
  }
  return false;
}

// Navigation Guard
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('accessToken');
  const branchId = localStorage.getItem('branchId');
  const storeId = localStorage.getItem('storeId');
  const role = localStorage.getItem('cashierRole');
  
  const tokenExpired = token ? isJwtExpired(token) : false;

  if (to.meta.requiresAuth && token && tokenExpired) {
    handleSessionExpired();
    return next({ name: 'login' });
  }

  const isAuthenticated = !tokenExpired && !!token && 
                          !!storeId && storeId !== 'null' && storeId !== 'undefined';

  if (to.meta.requiresAuth && !isAuthenticated) {
    websocketService.disconnect();
    if (token) {
      clearAuthStorage();
    }
    next({ name: 'login' });
  } else if (to.meta.adminOnly && role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
    // Strictly restrict adminOnly modules (Finance & Accounting) to Store Owner / Admin
    next({ name: role === 'CASHIER' ? 'checkout' : 'dashboard' });
  } else if (to.name === 'select-branch' && role !== 'ADMIN') {
    // Branch selection is strictly restricted to ADMIN role only
    next({ name: role === 'CASHIER' ? 'checkout' : 'dashboard' });
  } else if (to.meta.guestOnly && isAuthenticated) {
    if (role === 'ADMIN' && (!branchId || branchId === 'null' || branchId === 'undefined')) {
      next({ name: 'select-branch' });
    } else {
      next({ name: role === 'CASHIER' ? 'checkout' : 'dashboard' });
    }
  } else if (isAuthenticated && role === 'ADMIN' && (!branchId || branchId === 'null' || branchId === 'undefined') && to.name !== 'select-branch') {
    next({ name: 'select-branch' });
  } else {
    const isOwnerOrAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN';
    const userPermissions: string[] = JSON.parse(localStorage.getItem('userPermissions') || '[]');

    // Enforce PO and Maker-Checker permissions for all non-admin users
    if (isAuthenticated && !isOwnerOrAdmin) {
      if (to.name === 'purchase-order-cart') {
        if (!hasAnyUserPermission(userPermissions, 'purchase_order:create', 'purchase_order:view')) {
          return next({ name: role === 'CASHIER' ? 'checkout' : 'dashboard' });
        }
      }
      if (to.name === 'purchase-order-details') {
        if (!hasAnyUserPermission(userPermissions, 'purchase_order:view', 'purchase_order:create')) {
          return next({ name: role === 'CASHIER' ? 'checkout' : 'dashboard' });
        }
      }
      if (to.name === 'purchases') {
        if (!hasAnyUserPermission(userPermissions, 'inventory:view', 'purchase_order:view', 'purchase_order:create')) {
          return next({ name: role === 'CASHIER' ? 'checkout' : 'dashboard' });
        }
      }
      if (to.name === 'settings' && to.query.section === 'maker-checker') {
        if (!hasAnyUserPermission(userPermissions, 'maker_checker:view', 'maker_checker:approve', 'maker_checker:manage_policies')) {
          return next({ path: '/settings', query: { section: 'profile' } });
        }
      }
    }

    if (isAuthenticated && role === 'CASHIER') {
      const routeName = String(to.name || '');
      const cashierAlwaysAllowed = [
        'checkout', 'receipt', 'cash-movements', 'shift-sales', 'shift-details', 
        'cashier-shifts', 'profile', 'help', 'purchase-order-cart', 'purchase-order-details', 'purchases'
      ];
      if (cashierAlwaysAllowed.includes(routeName)) {
        next();
      } else {
        const routePermissions: Record<string, string> = {
          'inventory': 'inventory:view',
          'product-details': 'inventory:view',
          'top-selling-products': 'inventory:view',
          'customers': 'customers:view',
          'suppliers': 'suppliers:view',
          'reports': 'reports:view',
          'users': 'users:view',
          'finance': 'finance:view',
          'dashboard': 'dashboard:view'
        };
        const requiredPerm = routePermissions[routeName];
        if (requiredPerm && hasUserPermission(userPermissions, requiredPerm)) {
          next();
        } else {
          next({ name: 'checkout' });
        }
      }
    } else if (to.name === 'finance' && !isOwnerOrAdmin) {
      if (hasUserPermission(userPermissions, 'finance:view')) {
        next();
      } else {
        next({ name: role === 'CASHIER' ? 'checkout' : 'dashboard' });
      }
    } else {
      next();
    }
  }
});

export default router;
