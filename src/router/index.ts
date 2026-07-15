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
    path: '/suppliers',
    name: 'suppliers',
    component: () => import('../views/SuppliersView.vue'),
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
    path: '/',
    redirect: () => {
      return localStorage.getItem('cashierRole') === 'CASHIER' ? '/checkout' : '/dashboard';
    }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: () => {
      return localStorage.getItem('cashierRole') === 'CASHIER' ? '/checkout' : '/dashboard';
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
  
  const isAuthenticated = !!token && 
                          !!storeId && storeId !== 'null' && storeId !== 'undefined';

  if (to.meta.requiresAuth && !isAuthenticated) {
    if (token) {
      localStorage.clear();
      sessionStorage.clear();
    }
    next({ name: 'login' });
  } else if (to.meta.guestOnly && isAuthenticated) {
    next({ name: localStorage.getItem('cashierRole') === 'CASHIER' ? 'checkout' : 'dashboard' });
  } else if (isAuthenticated && localStorage.getItem('cashierRole') === 'CASHIER' && to.name !== 'checkout' && to.name !== 'receipt' && to.name !== 'cash-movements' && to.name !== 'shift-sales') {
    // Restrict CASHIER to only checkout, receipt, cash movements, and shift sales pages
    next({ name: 'checkout' });
  } else {
    next();
  }
});

export default router;
