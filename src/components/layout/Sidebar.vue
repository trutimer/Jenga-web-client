<template>
  <nav class="hidden md:flex flex-col h-full bg-surface-container-low border-r border-outline-variant shrink-0 relative z-10 font-sans transition-all duration-300" :class="sidebarCollapsed ? 'w-20' : 'w-64'">
    <!-- Branch Header -->
    <div class="p-5 border-b border-outline-variant flex items-center justify-between gap-3 relative">
      <div class="flex items-center gap-3 w-full" :class="sidebarCollapsed ? 'justify-center' : ''">
        <div class="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center shrink-0">
          <Store class="text-on-primary-container w-5 h-5" />
        </div>
        <div class="min-w-0" v-if="!sidebarCollapsed">
          <h2 class="text-base font-bold text-primary truncate leading-tight">{{ branchName }}</h2>
          <p class="text-xs text-on-surface-variant font-mono truncate uppercase tracking-widest mt-0.5">Active Session</p>
        </div>
      </div>
      <!-- Toggle button -->
      <button 
        @click="sidebarCollapsed = !sidebarCollapsed"
        class="absolute -right-3 top-6 w-6 h-6 bg-surface-container-high border border-outline-variant rounded-full flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface transition-colors z-20 cursor-pointer shadow-sm"
      >
        <ChevronRight v-if="sidebarCollapsed" class="w-4 h-4" />
        <ChevronLeft v-else class="w-4 h-4" />
      </button>
    </div>

    <!-- CTA Button -->
    <div class="p-5" :class="sidebarCollapsed ? 'px-3' : ''">
      <button 
        @click="router.push('/checkout')"
        class="w-full h-12 bg-primary text-on-primary rounded-xl flex items-center justify-center font-semibold text-sm hover:bg-opacity-90 active:scale-[0.98] transition-all duration-200 cursor-pointer shadow-sm"
        :class="sidebarCollapsed ? 'px-0' : 'py-3 gap-2'"
        :title="sidebarCollapsed ? 'New Transaction' : ''"
      >
        <PlusCircle class="w-5 h-5" />
        <span v-if="!sidebarCollapsed">New Transaction</span>
      </button>
    </div>

    <!-- Main Nav Links -->
    <div class="flex-1 overflow-y-auto py-4 flex flex-col gap-2.5">
      <template v-for="item in menuItems" :key="item.label">
        <div 
          v-if="item.disabled"
          class="py-3 flex items-center rounded-xl cursor-not-allowed select-none transition-all duration-200"
          :class="sidebarCollapsed ? 'justify-center mx-2 px-0' : 'gap-3.5 px-4.5 mx-3 text-on-surface-variant/40'"
          :title="`${item.label} (Simulated feature)`"
        >
          <component :is="item.icon" class="w-5 h-5 shrink-0 text-on-surface-variant/40" />
          <span v-if="!sidebarCollapsed" class="text-sm font-medium text-on-surface-variant/40">{{ item.label }}</span>
          <span v-if="!sidebarCollapsed" class="ml-auto text-[10px] font-mono border border-outline-variant/30 px-1.5 py-0.2 rounded text-outline bg-surface-container-high scale-[0.85] origin-right">MOCK</span>
        </div>

        <button
          v-else
          @click="router.push('/' + item.id)"
          class="py-3 flex items-center rounded-xl transition-all duration-200 text-left font-sans cursor-pointer"
          :title="sidebarCollapsed ? item.label : ''"
          :class="[
            sidebarCollapsed ? 'justify-center mx-2 px-0' : 'gap-3.5 px-4.5 mx-3',
            isActive(item.id) 
              ? 'bg-primary-container text-on-primary-container font-bold translate-x-1 shadow-xs' 
              : 'text-on-surface-variant hover:bg-surface-variant/40'
          ]"
        >
          <component :is="item.icon" class="w-5 h-5 shrink-0" :class="isActive(item.id) ? 'stroke-[2.5px]' : ''" />
          <span v-if="!sidebarCollapsed" class="text-sm font-semibold whitespace-nowrap">{{ item.label }}</span>
        </button>
      </template>
    </div>

    <!-- Footer Nav Links -->
    <div class="mt-auto border-t border-outline-variant p-3.5 flex flex-col gap-2">
      <a 
        href="#help"
        @click.prevent="alertHelp"
        class="py-3 flex items-center hover:bg-surface-variant/50 rounded-xl transition-all duration-200"
        :class="sidebarCollapsed ? 'justify-center mx-1.5 px-0' : 'gap-3.5 px-4.5 mx-1.5 text-on-surface-variant'"
        :title="sidebarCollapsed ? 'Help' : ''"
      >
        <HelpCircle class="w-5 h-5 text-on-surface-variant" />
        <span v-if="!sidebarCollapsed" class="text-sm font-semibold">Help</span>
      </a>
      <button 
        @click="onLogout"
        class="py-3 flex items-center text-error hover:bg-error-container/50 rounded-xl transition-all duration-200 cursor-pointer text-left"
        :class="sidebarCollapsed ? 'justify-center mx-1.5 px-0' : 'gap-3.5 px-4.5 mx-1.5'"
        :title="sidebarCollapsed ? 'Logout' : ''"
      >
        <LogOut class="w-5 h-5 stroke-[2px]" />
        <span v-if="!sidebarCollapsed" class="text-sm font-semibold">Logout</span>
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router';
import { 
  LayoutDashboard, 
  CreditCard, 
  Package, 
  Truck, 
  UserCog, 
  BarChart3, 
  Settings, 
  HelpCircle, 
  LogOut, 
  Store,
  PlusCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-vue-next';
import { useAppViewModel } from '../../viewmodels/useAppViewModel';

defineProps<{
  onLogout: () => void;
  branchName: string;
}>();

const { sidebarCollapsed } = useAppViewModel();

const router = useRouter();
const route = useRoute();

interface MenuItem {
  id: string;
  label: string;
  icon: any;
  disabled?: boolean;
}

const menuItems: MenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'checkout', label: 'POS Checkout', icon: CreditCard },
  { id: 'inventory', label: 'Inventory', icon: Package },
  { id: 'suppliers', label: 'Suppliers', icon: Truck },
  { id: 'users', label: 'User Management', icon: UserCog },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const isActive = (view: string) => {
  const currentView = route.path.substring(1) || 'dashboard';
  return currentView === view || (view === 'inventory' && currentView === 'stock-in');
};

const alertHelp = () => {
  alert("Help & Documentation center: Email support@mainbranch.co or refer to user guidelines.");
};
</script>
