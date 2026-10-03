<template>
  <!-- Guest Layout & Select Branch Screen -->
  <div v-if="!user || route.path === '/select-branch'" class="min-h-screen w-full bg-surface-container-high">
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
        <h1 class="text-2xl font-black text-on-surface tracking-tight">{{ $t('auth.noBranchAssignedTitle') }}</h1>
        <p class="text-sm text-on-surface-variant leading-relaxed">
          {{ $t('auth.noBranchAssignedDesc') }}
        </p>
      </div>

      <button 
        @click="confirmLogout"
        class="w-full h-12 py-3 bg-error text-on-error hover:bg-opacity-95 rounded-lg font-bold hover:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-2 shadow-md shadow-error/15 cursor-pointer border-0 text-white"
      >
        <LogOut class="w-4 h-4" />
        <span>{{ $t('auth.logoutCashier') }}</span>
      </button>
    </main>
  </div>

  <!-- Authenticated Layout -->
  <div v-else class="flex h-screen w-full bg-background text-on-background overflow-hidden relative font-sans antialiased">
    <!-- Desktop Sidebar -->
    <Sidebar v-if="userRole !== 'CASHIER'" :onLogout="triggerLogoutConfirm" :onLock="handleLockScreen" :branchName="settings.name" />

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

        <div class="mt-auto flex flex-col gap-1 pt-2 border-t border-outline-variant/50">
          <button 
            @click="handleLockScreen"
            class="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold text-on-surface-variant hover:bg-surface-variant/40 cursor-pointer"
          >
            <Lock class="w-5 h-5 text-primary" />
            <span>{{ $t('auth.lockScreen') }}</span>
          </button>
          <button 
            @click="triggerLogoutConfirm"
            class="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold text-error text-left hover:bg-error-container/20 cursor-pointer"
          >
            <LogOut class="w-5 h-5" />
            <span>{{ $t('auth.logoutCashier') }}</span>
          </button>
        </div>
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
        @lock="handleLockScreen"
      />

      <main class="flex-1 overflow-y-auto p-4 sm:p-5 md:px-5 md:py-6 pb-24 relative bg-surface">
        <router-view />
      </main>
    </div>
  </div>

  <!-- Logout Confirmation Modal -->
  <Modal 
    :isOpen="showLogoutModal" 
    :title="$t('auth.endSessionTitle')" 
    :onClose="() => showLogoutModal = false"
    maxWidth="max-w-md"
  >
    <div class="flex flex-col items-center text-center p-2 space-y-4">
      <div class="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center text-error animate-pulse">
        <LogOut class="w-8 h-8 stroke-[2px]" />
      </div>
      
      <div class="space-y-2">
        <h4 class="text-md font-bold text-on-surface">{{ $t('auth.logoutConfirmTitle') }}</h4>
        <p class="text-xs text-on-surface-variant leading-relaxed">
          {{ $t('auth.logoutConfirmDesc') }}
        </p>
      </div>
    </div>
    
    <template #footer>
      <div class="flex flex-col sm:flex-row gap-2 w-full">
        <button 
          @click="showLogoutModal = false" 
          class="flex-1 py-3 text-xs font-bold text-on-surface-variant hover:bg-surface-container rounded-xl transition-all border border-outline-variant bg-transparent cursor-pointer"
        >
          {{ $t('auth.keepSessionActive') }}
        </button>
        <button 
          type="button"
          @click="handleLockScreen" 
          class="flex-1 py-3 bg-surface-container-high hover:bg-surface-container-highest text-primary border border-primary/30 rounded-xl transition-all font-bold text-xs cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
        >
          <Lock class="w-3.5 h-3.5" />
          <span>{{ $t('auth.lockScreen') }}</span>
        </button>
        <button 
          @click="confirmLogout" 
          class="flex-1 py-3 bg-error text-on-error hover:bg-opacity-95 rounded-xl transition-all font-bold text-xs cursor-pointer text-white border-0 shadow-md shadow-error/15"
        >
          {{ $t('auth.yesLogout') }}
        </button>
      </div>
    </template>
  </Modal>

  <!-- Close Shift Modal for Cashiers -->
  <Modal 
    :isOpen="showCloseShiftModal" 
    :title="$t('checkout.endRegisterShift')" 
    :onClose="() => showCloseShiftModal = false"
    maxWidth="max-w-md"
  >
    <div class="flex flex-col space-y-4">
      <!-- Stepping Away / Quick Lock Screen Banner -->
      <div class="p-3.5 bg-primary/5 border border-primary/20 rounded-2xl flex items-center justify-between gap-3">
        <div class="flex items-center gap-2.5 min-w-0">
          <div class="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <Lock class="w-4.5 h-4.5 stroke-[2.2px]" />
          </div>
          <div class="text-left min-w-0">
            <div class="text-xs font-bold text-on-surface truncate">{{ $t('auth.justSteppingAway') }}</div>
            <div class="text-[11px] text-on-surface-variant leading-tight">{{ $t('auth.lockScreenDesc') }}</div>
          </div>
        </div>
        <button 
          type="button"
          @click="handleLockScreen"
          class="px-3 py-2 bg-primary text-on-primary hover:bg-opacity-95 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0 shadow-sm shadow-primary/20"
        >
          <Lock class="w-3.5 h-3.5" />
          <span>{{ $t('auth.lockScreen') }}</span>
        </button>
      </div>

      <div class="space-y-2 text-center pb-2 border-b border-outline-variant">
        <h4 class="text-md font-bold text-on-surface">{{ $t('checkout.declareCashDrawer') }}</h4>
        <p class="text-xs text-on-surface-variant leading-relaxed">
          {{ $t('checkout.declareCashDrawerDesc') }}
        </p>
      </div>

      <div class="flex justify-between items-center bg-surface-container p-3 rounded-lg border border-outline-variant/50">
        <span class="text-xs font-semibold text-on-surface-variant">{{ $t('checkout.systemExpectedCash') }}</span>
        <span class="font-mono text-sm font-bold text-on-surface">{{ currentShift ? currentShift.expectedCash.toLocaleString() : '0' }} {{ settings.currency }}</span>
      </div>

      <div class="space-y-2">
        <label class="text-[11px] font-mono font-bold text-on-surface-variant uppercase tracking-wider">{{ $t('checkout.actualCashCount', { currency: settings.currency }) }}</label>
        <input 
          type="number" 
          v-model="actualCashInput"
          :placeholder="$t('checkout.enterCountedAmount')"
          class="w-full bg-surface-container border border-outline-variant rounded-lg p-3.5 text-lg text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-mono text-center font-black shadow-inner"
        />
      </div>

      <div class="space-y-2">
        <label class="text-[11px] font-mono font-bold text-on-surface-variant uppercase tracking-wider">{{ $t('checkout.notesOptional') }}</label>
        <textarea 
          v-model="shiftNotesInput"
          :placeholder="$t('checkout.reasonDiscrepancyPlaceholder')"
          class="w-full bg-surface-container border border-outline-variant rounded-lg p-3 text-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none h-20"
        ></textarea>
      </div>
    </div>
    
    <template #footer>
      <div class="flex flex-col sm:flex-row gap-2 w-full">
        <button 
          @click="showCloseShiftModal = false" 
          class="flex-1 py-3 text-xs font-bold text-on-surface-variant hover:bg-surface-container rounded-xl transition-all border border-outline-variant bg-transparent cursor-pointer"
        >
          {{ $t('common.cancel') }}
        </button>
        <button 
          type="button"
          @click="handleLockScreen" 
          class="flex-1 py-3 bg-surface-container-high hover:bg-surface-container-highest text-primary border border-primary/30 rounded-xl transition-all font-bold text-xs cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
        >
          <Lock class="w-3.5 h-3.5" />
          <span>{{ $t('auth.lockScreen') }}</span>
        </button>
        <button 
          @click="handleCloseShift" 
          :disabled="isClosingShift || !actualCashInput"
          class="flex-1 py-3 bg-error text-on-error hover:bg-opacity-95 rounded-xl transition-all font-bold text-xs cursor-pointer text-white border-0 shadow-md shadow-error/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ isClosingShift ? $t('checkout.closingShiftBtn') : $t('checkout.closeAndLogout') }}
        </button>
      </div>
    </template>
  </Modal>

  <!-- Post-Login 2FA Security Prompt Modal -->
  <TwoFactorPromptModal
    :isOpen="show2FaPrompt"
    @close="show2FaPrompt = false"
    @updated="handle2FaUpdated"
  />

  <!-- Interactive Guided Tour for Admins & Managers -->
  <AppTourOverlay />

  <!-- Global Toast Notification -->
  <Toast 
    v-if="toastMessage"
    :message="toastMessage"
    :type="toastType"
    :onClose="clearToast"
  />
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted, onUnmounted } from 'vue';
import Toast from './components/common/Toast.vue';
import AppTourOverlay from './components/common/AppTourOverlay.vue';
import { toastMessage, toastType, clearToast, showToast } from './services/toastService';
import { useAppViewModel } from './viewmodels/useAppViewModel';
import { websocketService } from './services/websocketService';
import { isJwtExpired, handleSessionExpired } from './services/authSession';
import { useRouter, useRoute } from 'vue-router';
import Sidebar from './components/layout/Sidebar.vue';
import TopNav from './components/layout/TopNav.vue';
import Modal from './components/common/Modal.vue';
import TwoFactorPromptModal from './components/common/TwoFactorPromptModal.vue';
import { t } from './i18n';
import { Store, LogOut, Lock, LayoutDashboard, CreditCard, Package, BarChart3, Settings as SettingsIcon, Truck, UserCog } from 'lucide-vue-next';

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
  lockScreen,
  closeShift,
  fetchCurrentShift
} = useAppViewModel();

const router = useRouter();
const route = useRoute();

const show2FaPrompt = ref(false);

const check2FaPrompt = () => {
  const is2FaEnabled = localStorage.getItem('twoFactorEnabled') === 'true';
  const hasPending = sessionStorage.getItem('pending2FaPrompt') === 'true';
  const isDismissed = sessionStorage.getItem('dismissed2FaPrompt') === 'true';

  if (!is2FaEnabled && hasPending && !isDismissed && user.value) {
    show2FaPrompt.value = true;
  }
};

const handle2FaUpdated = () => {
  sessionStorage.removeItem('pending2FaPrompt');
  show2FaPrompt.value = false;
};

const hasBranch = computed(() => {
  if (userRole.value === 'ADMIN') return true;
  return !!activeBranchId.value && activeBranchId.value !== 'null' && activeBranchId.value !== 'undefined' && activeBranchId.value !== '';
});

watch(
  () => route.path,
  (newPath) => {
    if (newPath === '/login') {
      websocketService.disconnect();
      user.value = null;
    }
    if (newPath === '/checkout') {
      sidebarCollapsed.value = true;
    }
    check2FaPrompt();
  }
);

watch(user, (val) => {
  if (val) {
    check2FaPrompt();
  }
});

const checkSessionStatus = () => {
  const token = localStorage.getItem('accessToken');
  if (token && isJwtExpired(token)) {
    handleSessionExpired();
  }
};

onMounted(() => {
  checkSessionStatus();

  window.addEventListener('focus', checkSessionStatus);
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      checkSessionStatus();
    }
  };
  document.addEventListener('visibilitychange', handleVisibilityChange);

  const heartbeatTimer = setInterval(checkSessionStatus, 30000);

  onUnmounted(() => {
    window.removeEventListener('focus', checkSessionStatus);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    clearInterval(heartbeatTimer);
  });

  if (userRole.value === 'CASHIER') {
    fetchCurrentShift();
  }
  check2FaPrompt();
});

const showLogoutModal = ref(false);
const showCloseShiftModal = ref(false);
const actualCashInput = ref('');
const shiftNotesInput = ref('');
const isClosingShift = ref(false);

const triggerLogoutConfirm = async () => {
  if (userRole.value === 'CASHIER') {
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      showToast(t('checkout.shiftRequiredError'), 'error');
      return;
    }
    await fetchCurrentShift();
    if (currentShift.value !== null && currentShift.value.status === 'OPEN') {
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
    showToast(t('checkout.enterValidActualCash'), 'error');
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

const handleLockScreen = () => {
  showLogoutModal.value = false;
  showCloseShiftModal.value = false;
  actualCashInput.value = '';
  shiftNotesInput.value = '';
  lockScreen();
};

const menuItems = computed(() => [
  { id: 'dashboard', label: t('sidebar.dashboard'), icon: LayoutDashboard },
  { id: 'checkout', label: t('sidebar.checkout'), icon: CreditCard },
  { id: 'inventory', label: t('sidebar.inventory'), icon: Package },
  { id: 'suppliers', label: t('sidebar.suppliers'), icon: Truck },
  { id: 'users', label: t('sidebar.users'), icon: UserCog },
  { id: 'reports', label: t('sidebar.reports'), icon: BarChart3 },
  { id: 'settings', label: t('sidebar.settings'), icon: SettingsIcon }
]);

const isActive = (view: string) => {
  return route.path.startsWith('/' + view);
};

const navigate = (view: string) => {
  router.push('/' + view);
  mobileMenuOpen.value = false;
};
</script>
