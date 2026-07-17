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

    <!-- Global Search Bar (Visible except on login page) -->
    <div class="flex-1 max-w-sm ml-8 hidden sm:flex items-center bg-surface-container-high rounded-full px-4 h-10 border border-transparent focus-within:border-primary transition-colors">
      <Search class="w-4 h-4 text-on-surface-variant mr-2" />
      <input 
        type="text"
        :value="searchQuery"
        @input="$emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
        :placeholder="searchPlaceholder"
        class="bg-transparent border-none outline-none w-full text-sm text-on-surface placeholder:text-on-surface-variant/70 focus:ring-0 px-0 h-full"
      />
      <button 
        v-if="searchQuery"
        type="button" 
        @click="$emit('update:searchQuery', '')"
        class="text-xs text-on-surface-variant hover:text-on-surface cursor-pointer font-bold px-1"
      >
        Clear
      </button>
    </div>

    <!-- Trailing Actions -->
    <div class="flex items-center gap-4 ml-auto">
      <!-- Low Stock Warning Button -->
      <button 
        @click="router.push('/inventory')"
        class="hidden lg:flex items-center px-4 h-10 rounded-full border border-outline text-on-surface font-semibold text-xs transition-colors cursor-pointer gap-2"
        :class="lowStockCount > 0 
          ? 'border-error text-error bg-error-container/10 hover:bg-error-container/20' 
          : 'hover:bg-surface-container'"
      >
        <AlertTriangle class="w-4 h-4" :class="lowStockCount > 0 ? 'text-error' : 'text-on-surface-variant'" />
        <span>Low Stock ({{ lowStockCount }})</span>
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

      <!-- Download Desktop App (Web only) -->
      <button 
        v-if="!isElectron"
        @click="showDownloadModal = true"
        class="hidden sm:flex items-center px-4 h-10 rounded-full bg-surface-container text-on-surface font-semibold text-xs hover:bg-surface-variant active:scale-95 transition-all cursor-pointer gap-2 border border-outline-variant"
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
        
        <!-- Key Simulation -->
        <button 
          @click="alertKey"
          class="p-2 hover:bg-surface-container rounded-full transition-colors flex items-center justify-center cursor-pointer"
          title="Licensing validation keys"
        >
          <Key class="w-5 h-5 text-on-surface-variant stroke-[2px]" />
        </button>

        <!-- Account/User profile -->
        <button 
          v-if="userRole !== 'CASHIER'"
          @click="router.push('/settings')"
          class="p-2 hover:bg-surface-container rounded-full transition-colors flex items-center justify-center cursor-pointer"
          :class="currentView === 'settings' ? 'text-primary bg-primary-container/30' : ''"
          title="Settings & Profile"
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
  </header>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import Modal from '../common/Modal.vue';
import { 
  Search, 
  Cloud, 
  Key, 
  User, 
  AlertTriangle, 
  Menu,
  LogOut,
  Coins,
  List,
  Download
} from 'lucide-vue-next';

defineProps<{
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

const showDownloadModal = ref(false);

const isElectron = computed(() => {
  return typeof navigator !== 'undefined' && navigator.userAgent.toLowerCase().includes(' electron/');
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

const alertKey = () => {
  alert("Enterprise Key validated. Build 8912 certified.");
};
</script>
