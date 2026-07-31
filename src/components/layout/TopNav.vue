<template>
  <header class="bg-surface border-b border-outline-variant flex justify-between items-center w-full px-margin-page h-16 z-30 sticky top-0 shrink-0 font-sans">
    <div class="flex items-center gap-4">
      <button 
        v-if="userRole !== 'CASHIER'"
        @click="$emit('mobileMenuToggle')"
        class="md:hidden text-on-surface-variant hover:bg-surface-container rounded-full p-2 transition-colors cursor-pointer"
      >
        <Menu class="w-5 h-5" />
      </button>

      <!-- Brand/Logo -->
      <div 
        @click="userRole === 'CASHIER' ? router.push('/checkout') : router.push('/dashboard')"
        class="flex items-center cursor-pointer select-none"
      >
        <h1 class="text-xl font-black text-primary tracking-tight">{{ brandName }}</h1>
      </div>
    </div>

    <!-- Trailing Actions -->
    <div class="flex items-center gap-4 ml-auto">
      <!-- License Expiry Display Button (Replaces Low Stock) -->
      <button 
        @click="handleExpiryClick"
        class="hidden lg:flex items-center px-4 h-10 rounded-full border text-xs font-semibold transition-all cursor-pointer gap-2 shadow-xs"
        :class="isWithin3Months 
          ? 'border-error text-error bg-error-container/20 hover:bg-error-container/30 animate-zoom-pulse shadow-error/10' 
          : 'border-outline-variant text-on-surface hover:bg-surface-container'"
        :title="isWithin1Month ? 'Urgent: License expiring soon! Click for renewal info.' : 'View license expiry & details'"
      >
        <Clock class="w-4 h-4" :class="isWithin3Months ? 'text-error' : 'text-primary'" />
        <span>
          {{ daysUntilExpiry !== null && daysUntilExpiry <= 30 ? `Expires in ${daysUntilExpiry} days` : `Expires: ${formattedExpiryDate}` }}
        </span>
      </button>

      <!-- Shift Sales Button -->
      <button 
        v-if="userRole === 'CASHIER'"
        @click="router.push('/shift-sales')"
        class="hidden sm:flex items-center px-4 h-10 rounded-full bg-primary text-on-primary font-semibold text-xs hover:bg-opacity-90 active:scale-95 transition-all cursor-pointer gap-2 shadow-sm"
      >
        <List class="w-4 h-4" />
        <span>Shift sales</span>
      </button>

      <!-- Switch Branch Button (ADMIN only) -->
      <button 
        v-if="isAdmin"
        @click="router.push('/select-branch')"
        class="hidden sm:flex items-center px-4 h-10 rounded-full bg-primary-container/30 border border-primary/30 text-primary font-bold text-xs hover:bg-primary-container/50 active:scale-95 transition-all cursor-pointer gap-2 shadow-sm"
        title="Switch Active Branch"
      >
        <Building2 class="w-4 h-4" />
        <span>Switch Branch</span>
      </button>

      <!-- Download Desktop App (Web only) -->
      <button 
        v-if="!isElectron"
        @click="showDownloadModal = true"
        class="hidden sm:flex items-center px-4 h-10 rounded-full bg-surface-container border border-outline-variant/60 text-on-surface font-bold text-xs hover:bg-surface-container-high active:scale-95 transition-all cursor-pointer gap-2 shadow-xs"
        title="Download Desktop Application"
      >
        <Download class="w-4 h-4 text-primary" />
        <span>Desktop App</span>
      </button>

      <!-- Cash Movements Button -->
      <button 
        v-if="userRole === 'CASHIER' && currentView === 'checkout'"
        @click="router.push('/cash-movements')"
        class="hidden sm:flex items-center px-4 h-10 rounded-full bg-surface-container text-on-surface font-semibold text-xs hover:bg-surface-variant active:scale-95 transition-all cursor-pointer gap-2 border border-outline-variant"
      >
        <Coins class="w-4 h-4 text-primary" />
        <span>Cash Movements</span>
      </button>

      <!-- Status Actions -->
      <div class="flex items-center gap-1 text-on-surface-variant">
        <!-- Cloud Sync -->
        <button 
          @click="alertSync"
          class="p-2 hover:bg-surface-container rounded-full transition-colors flex items-center justify-center cursor-pointer"
          title="System Synced (Active Cloud Run connection)"
        >
          <Cloud class="w-5 h-5 text-primary stroke-[2px]" />
        </button>

        <!-- Account/User profile -->
        <button 
          @click="router.push('/profile')"
          class="p-2 hover:bg-surface-container rounded-full transition-colors flex items-center justify-center cursor-pointer"
          :class="currentView === 'profile' ? 'text-primary bg-primary-container/30' : ''"
          title="My Account Profile & Password"
        >
          <User class="w-5 h-5 stroke-[2px]" />
        </button>

        <!-- Logout for Cashier (since they don't have sidebar) -->
        <button 
          v-if="userRole === 'CASHIER'"
          @click="$emit('logout')"
          class="p-2 hover:bg-error-container rounded-full transition-colors flex items-center justify-center cursor-pointer text-error"
          title="Logout"
        >
          <LogOut class="w-5 h-5 stroke-[2px]" />
        </button>
      </div>
    </div>

    <!-- Download Desktop App Modal -->
    <Modal 
      :isOpen="showDownloadModal" 
      title="Download Desktop App" 
      :onClose="() => showDownloadModal = false"
      maxWidth="max-w-md"
    >
      <div class="flex flex-col items-center text-center gap-4 py-4">
        <div class="w-16 h-16 bg-primary-container/20 rounded-full flex items-center justify-center mb-2">
          <Download class="w-8 h-8 text-primary" />
        </div>
        <h3 class="text-xl font-black text-on-surface">Experience the Full Power</h3>
        <p class="text-sm text-on-surface-variant leading-relaxed">
          Get the ultimate point-of-sale experience with our dedicated Desktop Application. Enjoy enhanced performance, hardware integration (barcode scanners, receipt printers), and offline resilience.
        </p>
        
        <div class="bg-surface-container-low w-full rounded-xl p-4 mt-2 border border-outline-variant/50">
          <div class="flex justify-between items-center text-sm font-mono">
            <span class="text-on-surface-variant uppercase font-bold text-xs">Current Version</span>
            <span class="text-primary font-bold">Latest Release</span>
          </div>
          <div class="flex justify-between items-center text-sm font-mono mt-2 pt-2 border-t border-outline-variant/30">
            <span class="text-on-surface-variant uppercase font-bold text-xs">Platform</span>
            <span class="text-on-surface font-bold">Windows (x64)</span>
          </div>
        </div>

        <a 
          href="/Jenga-Setup-Latest.exe"
          download="Jenga-Setup-Latest.exe"
          @click="showDownloadModal = false"
          class="w-full mt-4 bg-primary text-on-primary py-3.5 rounded-xl font-bold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
        >
          <Download class="w-5 h-5" />
          <span>Download .exe Installer</span>
        </a>
      </div>
    </Modal>

    <!-- License Information Modal -->
    <LicenseModal 
      :isOpen="showLicenseModal"
      :onClose="() => showLicenseModal = false"
    />

    <!-- License Expiry Renewal Alert Modal Popup -->
    <LicenseExpiryAlertModal 
      :isOpen="showExpiryAlertModal"
      :daysLeft="daysUntilExpiry || 0"
      :expiresAt="licenseData?.expiresAt"
      :onClose="closeExpiryAlertModal"
      :onViewDetails="openFullLicenseFromAlert"
    />
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import Modal from '../common/Modal.vue';
import LicenseModal from '../common/LicenseModal.vue';
import LicenseExpiryAlertModal from '../common/LicenseExpiryAlertModal.vue';
import { api } from '../../services/api';
import { useAppViewModel } from '../../viewmodels/useAppViewModel';
import { 
  Search, 
  Cloud, 
  User, 
  AlertTriangle, 
  Menu,
  LogOut,
  Coins,
  List,
  Download,
  Building2,
  Clock
} from 'lucide-vue-next';

const props = defineProps<{
  brandName: string;
  lowStockCount: number;
  searchQuery: string;
  userRole?: string | null;
}>();

defineEmits<{
  (e: 'update:searchQuery', val: string): void;
  (e: 'mobileMenuToggle'): void;
  (e: 'logout'): void;
}>();

const router = useRouter();
const route = useRoute();
const { activeBranchId } = useAppViewModel();

const showDownloadModal = ref(false);
const showLicenseModal = ref(false);
const showExpiryAlertModal = ref(false);

const licenseData = ref<any>(null);

const fetchLicenseInfo = async () => {
  const branchId = activeBranchId.value || localStorage.getItem('branchId');
  if (!branchId || branchId === 'null' || branchId === 'undefined') return;

  try {
    const res = await api.get(`/api/stores/branches/${branchId}/license`, { suppressToast: true });
    if (res) {
      licenseData.value = res;
      if (daysUntilExpiry.value !== null && daysUntilExpiry.value <= 30 && !sessionStorage.getItem('license_alert_dismissed')) {
        showExpiryAlertModal.value = true;
      }
    }
  } catch (err) {
    console.warn('License info fetch in TopNav failed:', err);
  }
};

onMounted(() => {
  fetchLicenseInfo();
});

watch(() => activeBranchId.value, () => {
  fetchLicenseInfo();
});

const daysUntilExpiry = computed(() => {
  if (!licenseData.value?.expiresAt) return null;
  const exp = new Date(licenseData.value.expiresAt).getTime();
  const now = new Date().getTime();
  return Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
});

const isWithin3Months = computed(() => {
  if (daysUntilExpiry.value === null) return false;
  return daysUntilExpiry.value <= 90;
});

const isWithin1Month = computed(() => {
  if (daysUntilExpiry.value === null) return false;
  return daysUntilExpiry.value <= 30;
});

const formattedExpiryDate = computed(() => {
  if (!licenseData.value?.expiresAt) return 'Active';
  try {
    const d = new Date(licenseData.value.expiresAt);
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return licenseData.value.expiresAt;
  }
});

const handleExpiryClick = () => {
  if (isWithin1Month.value) {
    showExpiryAlertModal.value = true;
  } else {
    showLicenseModal.value = true;
  }
};

const closeExpiryAlertModal = () => {
  showExpiryAlertModal.value = false;
  sessionStorage.setItem('license_alert_dismissed', 'true');
};

const openFullLicenseFromAlert = () => {
  showExpiryAlertModal.value = false;
  sessionStorage.setItem('license_alert_dismissed', 'true');
  showLicenseModal.value = true;
};

const isElectron = computed(() => {
  return typeof navigator !== 'undefined' && navigator.userAgent.toLowerCase().includes(' electron/');
});

const isAdmin = computed(() => {
  const role = props.userRole || localStorage.getItem('cashierRole');
  return role === 'ADMIN';
});

const currentView = computed(() => {
  return route.path.substring(1) || 'dashboard';
});

const searchPlaceholder = computed(() => {
  if (currentView.value === 'checkout') return 'Scan barcode or type name...';
  if (currentView.value === 'inventory') return 'Search product or category...';
  return 'Search catalog, tickets, reports...';
});

const alertSync = () => {
  alert("Terminal database is currently synchronized client-side with full persistence.");
};
</script>
