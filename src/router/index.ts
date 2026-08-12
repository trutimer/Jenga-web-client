import { createRouter, createWebHistory } from 'vue-router';

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
    path: '/settings',
    name: 'settings',
    component: () => import('../views/SettingsView.vue'),
    meta: { requiresAuth: true }
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

// Navigation Guard
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('accessToken');
  const branchId = localStorage.getItem('branchId');
  const storeId = localStorage.getItem('storeId');
  const role = localStorage.getItem('cashierRole');
  
  const isAuthenticated = !!token && 
                          !!storeId && storeId !== 'null' && storeId !== 'undefined';

  if (to.meta.requiresAuth && !isAuthenticated) {
    if (token) {
      localStorage.clear();
      sessionStorage.clear();
    }
    next({ name: 'login' });
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
  } else if (isAuthenticated && role === 'CASHIER') {
    const routeName = String(to.name || '');
    const cashierAlwaysAllowed = ['checkout', 'receipt', 'cash-movements', 'shift-sales', 'shift-details', 'cashier-shifts', 'profile'];
    if (cashierAlwaysAllowed.includes(routeName)) {
      next();
    } else {
      const routePermissions: Record<string, string> = {
        'inventory': 'inventory:view',
        'top-selling-products': 'inventory:view',
        'customers': 'customers:view',
        'suppliers': 'suppliers:view',
        'reports': 'reports:view',
        'users': 'users:view',
        'dashboard': 'dashboard:view'
      };
      const requiredPerm = routePermissions[routeName];
      const userPermissions: string[] = JSON.parse(localStorage.getItem('userPermissions') || '[]');
      if (requiredPerm && userPermissions.includes(requiredPerm)) {
        next();
      } else {
        next({ name: 'checkout' });
      }
    }
  } else {
    next();
  }
});

export default router;
