<template>
  <!-- Guest Layout (Login Screen) -->
  <div v-if="!user" class="min-h-screen w-full bg-surface-container-high">
    <router-view />
  </div>

  <!-- No Branch Assigned Layout -->
  <div v-else-if="!hasBranch" class="min-h-screen w-full flex flex-col justify-center items-center p-6 bg-surface-container-high text-on-surface antialiased font-sans relative overflow-hidden">
    <!-- Ambient background gradient -->
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,_#f7faf6_0%,_transparent_60%)] pointer-events-none" />
    
    <main class="w-full max-w-[480px] bg-surface-container-lowest rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-outline-variant p-8 md:p-10 flex flex-col items-center text-center gap-6 relative z-10 animate-fade-up">
      <div class="w-16 h-16 bg-error/10 text-error rounded-xl flex items-center justify-center shadow-inner">
        <Store class="w-8 h-8 stroke-[2px]" />
      </div>
      
      <div class="space-y-3">
        <h1 class="text-2xl font-black text-on-surface tracking-tight">No Branch Assigned</h1>
        <p class="text-sm text-on-surface-variant leading-relaxed">
          Your account is not assigned to any store branch. Please ask your respective store administrator to assign a branch to your profile.
        </p>
      </div>

      <button 
        @click="confirmLogout"
        class="w-full h-12 py-3 bg-error text-on-error hover:bg-opacity-95 rounded-lg font-bold hover:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-2 shadow-md shadow-error/15 cursor-pointer border-0 text-white"
      >
        <LogOut class="w-4 h-4" />
        <span>Logout cashier</span>
      </button>
    </main>
  </div>

  <!-- Authenticated Layout -->
  <div v-else class="flex h-screen w-full bg-background text-on-background overflow-hidden relative font-sans antialiased">
    <!-- Desktop Sidebar -->
    <Sidebar v-if="userRole !== 'CASHIER'" :onLogout="triggerLogoutConfirm" :branchName="settings.name" />

    <!-- Mobile Drawer Overlay -->
    <div v-if="mobileMenuOpen && userRole !== 'CASHIER'" class="fixed inset-0 z-40 flex md:hidden font-sans">
      <div 
        @click="mobileMenuOpen = false"
        class="fixed inset-0 bg-on-background/40 backdrop-blur-sm"
      ></div>
      
      <div class="relative flex-1 flex flex-col max-w-xs w-full bg-surface-container-low border-r border-outline-variant p-5">
        <div class="flex items-center gap-3 pb-5 border-b border-outline-variant mb-4">
          <Store class="text-primary w-6 h-6" />
          <h2 class="text-lg font-black text-primary">{{ settings.name }}</h2>
        </div>

        <div class="flex-1 flex flex-col gap-2">
          <button 
            v-for="item in menuItems"
            :key="item.id"
            @click="navigate(item.id)"
            class="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold text-left cursor-pointer transition-colors"
            :class="isActive(item.id) ? 'bg-primary-container text-on-primary-container' : 'text-on-surface-variant hover:bg-surface-variant/40'"
          >
            <component :is="item.icon" class="w-5 h-5" />
            <span>{{ item.label }}</span>
          </button>
        </div>

        <button 
          @click="triggerLogoutConfirm"
          class="mt-auto flex items-center gap-3 px-4 py-4 rounded-lg text-sm font-bold text-error text-left border-t border-outline-variant/50 hover:bg-error-container/20 cursor-pointer"
        >
          <LogOut class="w-5 h-5" />
          <span>Logout cashier</span>
        </button>
      </div>
    </div>

    <!-- Core Workspace Frame (Right) -->
    <div class="flex-1 flex flex-col h-full overflow-hidden relative">
      <TopNav 
        brandName="Jenga POS"
        :lowStockCount="lowStockCount"
        :searchQuery="searchQuery"
        :userRole="userRole"
        @update:searchQuery="val => searchQuery = val"
        @mobileMenuToggle="mobileMenuOpen = true"
        @logout="triggerLogoutConfirm"
        @openCashMovements="showCashMovementsModal = true"
      />

      <main class="flex-1 overflow-y-auto p-6 md:p-8 pb-24 relative bg-surface">
        <router-view />
      </main>
    </div>
  </div>

  <!-- Logout Confirmation Modal -->
  <Modal 
    :isOpen="showLogoutModal" 
    title="End Session" 
    :onClose="() => showLogoutModal = false"
    maxWidth="max-w-md"
  >
    <div class="flex flex-col items-center text-center p-2 space-y-4">
      <div class="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center text-error animate-pulse">
        <LogOut class="w-8 h-8 stroke-[2px]" />
      </div>
      
      <div class="space-y-2">
        <h4 class="text-md font-bold text-on-surface">Are you sure you want to logout?</h4>
        <p class="text-xs text-on-surface-variant leading-relaxed">
          Ending your cashier session will clear all active register states, local cache, and access tokens. You will be redirected to the login portal.
        </p>
      </div>
    </div>
    
    <template #footer>
      <button 
        @click="showLogoutModal = false" 
        class="flex-1 py-3 text-xs font-bold text-on-surface-variant hover:bg-surface-container rounded-xl transition-all border border-outline-variant bg-transparent cursor-pointer"
      >
        Keep Session Active
      </button>
      <button 
        @click="confirmLogout" 
        class="flex-1 py-3 bg-error text-on-error hover:bg-opacity-95 rounded-xl transition-all font-bold text-xs cursor-pointer text-white border-0 shadow-md shadow-error/15"
      >
        Yes, Logout
      </button>
    </template>
  </Modal>

  <!-- Close Shift Modal for Cashiers -->
  <Modal 
    :isOpen="showCloseShiftModal" 
    title="End Register Shift" 
    :onClose="() => showCloseShiftModal = false"
    maxWidth="max-w-md"
  >
    <div class="flex flex-col space-y-4">
      <div class="space-y-2 text-center pb-2 border-b border-outline-variant">
        <h4 class="text-md font-bold text-on-surface">Declare Cash Drawer</h4>
        <p class="text-xs text-on-surface-variant leading-relaxed">
          Please count the physical cash in your drawer and enter it below to finalize your shift.
        </p>
      </div>

      <div class="flex justify-between items-center bg-surface-container p-3 rounded-lg border border-outline-variant/50">
        <span class="text-xs font-semibold text-on-surface-variant">System Expected Cash:</span>
        <span class="font-mono text-sm font-bold text-on-surface">{{ currentShift ? currentShift.expectedCash.toLocaleString() : '0' }} {{ settings.currency }}</span>
      </div>

      <div class="space-y-2">
        <label class="text-[11px] font-mono font-bold text-on-surface-variant uppercase tracking-wider">Actual Cash Count ({{ settings.currency }})</label>
        <input 
          type="number" 
          v-model="actualCashInput"
          placeholder="Enter counted amount..."
          class="w-full bg-surface-container border border-outline-variant rounded-lg p-3.5 text-lg text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-mono text-center font-black shadow-inner"
        />
      </div>

      <div class="space-y-2">
        <label class="text-[11px] font-mono font-bold text-on-surface-variant uppercase tracking-wider">Notes (Optional)</label>
        <textarea 
          v-model="shiftNotesInput"
          placeholder="Reason for discrepancy if any..."
          class="w-full bg-surface-container border border-outline-variant rounded-lg p-3 text-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none h-20"
        ></textarea>
      </div>
    </div>
    
    <template #footer>
      <button 
        @click="showCloseShiftModal = false" 
        class="flex-1 py-3.5 text-xs font-bold text-on-surface-variant hover:bg-surface-container rounded-xl transition-all border border-outline-variant bg-transparent cursor-pointer"
      >
        Cancel
      </button>
      <button 
        @click="handleCloseShift" 
        :disabled="isClosingShift || !actualCashInput"
        class="flex-1 py-3.5 bg-error text-on-error hover:bg-opacity-95 rounded-xl transition-all font-bold text-sm cursor-pointer text-white border-0 shadow-lg shadow-error/20 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ isClosingShift ? 'Closing...' : 'Close & Logout' }}
      </button>
    </template>
  </Modal>

  <!-- Cash Movements Modal -->
  <CashMovementsModal />

  <!-- Global Toast Notification -->
  <Toast 
    v-if="toastMessage"
    :message="toastMessage"
    :type="toastType"
    :onClose="clearToast"
  />
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue';
import Toast from './components/common/Toast.vue';
import { toastMessage, toastType, clearToast, showToast } from './services/toastService';
import { useAppViewModel } from './viewmodels/useAppViewModel';
import { useRouter, useRoute } from 'vue-router';
import Sidebar from './components/layout/Sidebar.vue';
import TopNav from './components/layout/TopNav.vue';
import Modal from './components/common/Modal.vue';
import CashMovementsModal from './components/cash/CashMovementsModal.vue';
import { Store, LogOut, LayoutDashboard, CreditCard, Package, BarChart3, Settings as SettingsIcon, Truck, UserCog } from 'lucide-vue-next';

const {
  user,
  userRole,
  activeBranchId,
  settings,
  mobileMenuOpen,
  sidebarCollapsed,
  lowStockCount,
  searchQuery,
  currentShift,
  handleLogout: performLogout,
  closeShift,
  fetchCurrentShift,
  showCashMovementsModal
} = useAppViewModel();

const router = useRouter();
const route = useRoute();

const hasBranch = computed(() => {
  return !!activeBranchId.value && activeBranchId.value !== 'null' && activeBranchId.value !== 'undefined' && activeBranchId.value !== '';
});

watch(
  () => route.path,
  (newPath) => {
    if (newPath === '/login') {
      user.value = null;
    }
    if (newPath === '/checkout') {
      sidebarCollapsed.value = true;
    }
  }
);

onMounted(() => {
  if (userRole.value === 'CASHIER') {
    fetchCurrentShift();
  }
});

const showLogoutModal = ref(false);
const showCloseShiftModal = ref(false);
const actualCashInput = ref('');
const shiftNotesInput = ref('');
const isClosingShift = ref(false);

const triggerLogoutConfirm = async () => {
  if (userRole.value === 'CASHIER') {
    await fetchCurrentShift();
    if (currentShift.value !== null) {
      showCloseShiftModal.value = true;
    } else {
      showLogoutModal.value = true;
    }
  } else {
    showLogoutModal.value = true;
  }
};

const handleCloseShift = async () => {
  const amount = parseFloat(actualCashInput.value);
  if (isNaN(amount) || amount < 0) {
    showToast('Please enter a valid actual cash amount', 'error');
    return;
  }
  isClosingShift.value = true;
  const success = await closeShift(amount, shiftNotesInput.value);
  isClosingShift.value = false;
  if (success) {
    showCloseShiftModal.value = false;
    actualCashInput.value = '';
    shiftNotesInput.value = '';
    performLogout();
  }
};

const confirmLogout = () => {
  showLogoutModal.value = false;
  performLogout();
};

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'checkout', label: 'POS Checkout', icon: CreditCard },
  { id: 'inventory', label: 'Inventory Ops', icon: Package },
  { id: 'suppliers', label: 'Suppliers', icon: Truck },
  { id: 'users', label: 'User Management', icon: UserCog },
  { id: 'reports', label: 'Reports Center', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: SettingsIcon }
];

const isActive = (view: string) => {
  return route.path.startsWith('/' + view);
};

const navigate = (view: string) => {
  router.push('/' + view);
  mobileMenuOpen.value = false;
};
</script>
