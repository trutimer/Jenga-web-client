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

      <!-- Quick Sale Primary Button -->
      <button 
        v-if="userRole !== 'CASHIER'"
        @click="router.push('/checkout')"
        class="hidden sm:flex items-center px-4 h-10 rounded-full bg-primary text-on-primary font-semibold text-xs hover:bg-opacity-90 active:scale-95 transition-all cursor-pointer gap-2 shadow-sm"
      >
        <Zap class="w-4 h-4 text-on-primary-container fill-on-primary-container" />
        <span>Quick Sale</span>
      </button>

      <!-- Cash Movements Button -->
      <button 
        v-if="currentView === 'checkout'"
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
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { 
  Search, 
  Cloud, 
  Key, 
  User, 
  AlertTriangle, 
  Zap,
  Menu,
  LogOut,
  Coins
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
