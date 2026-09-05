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
          <p class="text-xs text-on-surface-variant font-mono truncate uppercase tracking-widest mt-0.5">{{ $t('sidebar.activeSession') }}</p>
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

    <!-- Main Nav Links -->
    <div class="flex-1 overflow-y-auto py-4 flex flex-col gap-1.5" :class="sidebarCollapsed ? 'px-2' : 'px-3'">
      <template v-for="item in menuItems" :key="item.id">
        <div 
          v-if="item.disabled"
          class="py-3 flex items-center rounded-xl cursor-not-allowed select-none transition-all duration-200"
          :class="sidebarCollapsed ? 'justify-center px-0' : 'gap-3.5 px-3 text-on-surface-variant/40'"
          :title="`${item.label} (Simulated feature)`"
        >
          <component :is="item.icon" class="w-5 h-5 shrink-0 text-on-surface-variant/40" />
          <span v-if="!sidebarCollapsed" class="text-sm font-medium text-on-surface-variant/40">{{ item.label }}</span>
          <span v-if="!sidebarCollapsed" class="ml-auto text-[10px] font-mono border border-outline-variant/30 px-1.5 py-0.2 rounded text-outline bg-surface-container-high scale-[0.85] origin-right">MOCK</span>
        </div>

        <!-- Expandable Parent Menu Item (with Children) -->
        <div v-else-if="item.children && item.children.length > 0" class="flex flex-col">
          <button
            @click="handleParentClick(item)"
            class="py-3 flex items-center justify-between rounded-xl transition-all duration-200 text-left font-sans cursor-pointer group"
            :title="sidebarCollapsed ? item.label : ''"
            :class="[
              sidebarCollapsed ? 'justify-center px-0' : 'px-3',
              isParentActive(item) 
                ? 'bg-primary-container text-on-primary-container font-bold shadow-xs' 
                : 'text-on-surface-variant hover:bg-surface-variant/40'
            ]"
          >
            <div class="flex items-center gap-3.5 min-w-0">
              <component :is="item.icon" class="w-5 h-5 shrink-0" :class="isParentActive(item) ? 'stroke-[2.5px]' : ''" />
              <span v-if="!sidebarCollapsed" class="text-sm font-semibold truncate">{{ item.label }}</span>
            </div>
            <ChevronDown 
              v-if="!sidebarCollapsed" 
              class="w-4 h-4 text-on-surface-variant transition-transform duration-200 shrink-0"
              :class="expandedMenus[item.id] ? 'rotate-180 text-primary' : ''"
            />
          </button>

          <!-- Nested Submenu Items -->
          <div 
            v-if="!sidebarCollapsed && expandedMenus[item.id]" 
            class="flex flex-col gap-1 pl-3 mt-1.5 mb-1 ml-4 border-l-2 border-outline-variant/60 animate-fade-in"
          >
            <button
              v-for="sub in item.children"
              :key="sub.path || sub.tab"
              @click="navigateToSubmenu(item, sub)"
              class="py-2 px-2.5 flex items-center gap-2.5 rounded-lg text-xs font-semibold transition-all text-left cursor-pointer"
              :class="isSubmenuActive(item, sub)
                ? 'bg-primary text-on-primary font-bold shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'"
            >
              <component :is="sub.icon" class="w-3.5 h-3.5 shrink-0" :class="isSubmenuActive(item, sub) ? 'text-on-primary' : 'text-on-surface-variant'" />
              <span class="truncate">{{ sub.label }}</span>
            </button>
          </div>
        </div>

        <!-- Normal Single Menu Item -->
        <button
          v-else
          @click="router.push('/' + item.id)"
          class="py-3 flex items-center rounded-xl transition-all duration-200 text-left font-sans cursor-pointer"
          :title="sidebarCollapsed ? item.label : ''"
          :class="[
            sidebarCollapsed ? 'justify-center px-0' : 'gap-3.5 px-3',
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
        :title="sidebarCollapsed ? $t('sidebar.help') : ''"
      >
        <HelpCircle class="w-5 h-5 text-on-surface-variant" />
        <span v-if="!sidebarCollapsed" class="text-sm font-semibold">{{ $t('sidebar.help') }}</span>
      </a>
      <button 
        @click="onLogout"
        class="py-3 flex items-center text-error hover:bg-error-container/50 rounded-xl transition-all duration-200 cursor-pointer text-left"
        :class="sidebarCollapsed ? 'justify-center mx-1.5 px-0' : 'gap-3.5 px-4.5 mx-1.5'"
        :title="sidebarCollapsed ? $t('sidebar.logout') : ''"
      >
        <LogOut class="w-5 h-5 stroke-[2px]" />
        <span v-if="!sidebarCollapsed" class="text-sm font-semibold">{{ $t('sidebar.logout') }}</span>
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { 
  LayoutDashboard, 
  CreditCard, 
  Package, 
  Truck, 
  Users,
  UserCog, 
  BarChart3, 
  Landmark,
  FileSpreadsheet,
  Layers,
  BookOpen,
  Search,
  CalendarCheck,
  Settings, 
  HelpCircle, 
  LogOut, 
  Store, 
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ShoppingBag
} from 'lucide-vue-next';
import { useAppViewModel } from '../../viewmodels/useAppViewModel';
import { t } from '../../i18n';

defineProps<{
  onLogout: () => void;
  branchName: string;
}>();

const vm = useAppViewModel();
const { sidebarCollapsed, userRole } = vm;

const router = useRouter();
const route = useRoute();

interface SubMenuItem {
  tab?: string;
  path?: string;
  label: string;
  icon: any;
}

interface MenuItem {
  id: string;
  label: string;
  icon: any;
  disabled?: boolean;
  adminOnly?: boolean;
  children?: SubMenuItem[];
}

const expandedMenus = ref<Record<string, boolean>>({
  inventory_group: false,
  finance: false
});

watch(() => route.path, (newPath) => {
  if (newPath.startsWith('/finance')) {
    expandedMenus.value.finance = true;
  } else {
    expandedMenus.value.finance = false;
  }
  if (newPath.startsWith('/inventory') || newPath.startsWith('/purchases')) {
    expandedMenus.value.inventory_group = true;
  } else {
    expandedMenus.value.inventory_group = false;
  }
}, { immediate: true });

const menuItems = computed<MenuItem[]>(() => {
  const raw: MenuItem[] = [
    { id: 'dashboard', label: t('sidebar.dashboard'), icon: LayoutDashboard },
    { id: 'checkout', label: t('sidebar.checkout'), icon: CreditCard },
    { 
      id: 'inventory_group', 
      label: 'Inventory & purchases', 
      icon: Package, 
      children: [
        { path: '/inventory', label: 'Inventory', icon: Package },
        { path: '/purchases', label: 'Purchases', icon: ShoppingBag },
      ]
    },
    { id: 'suppliers', label: t('sidebar.suppliers'), icon: Truck },
    { id: 'customers', label: t('sidebar.customers'), icon: Users },
    { id: 'users', label: t('sidebar.users'), icon: UserCog },
    { id: 'reports', label: t('sidebar.reports'), icon: BarChart3 },
    { 
      id: 'finance', 
      label: t('sidebar.finance'), 
      icon: Landmark, 
      children: [
        { tab: 'statements', label: t('sidebar.financialStatements'), icon: FileSpreadsheet },
        { tab: 'accounts', label: t('sidebar.chartOfAccounts'), icon: Layers },
        { tab: 'journal', label: t('sidebar.generalLedger'), icon: BookOpen },
        { tab: 'ledger', label: t('sidebar.accountStatement'), icon: Search },
        { tab: 'periods', label: t('sidebar.fiscalPeriods'), icon: CalendarCheck },
      ]
    },
    { id: 'settings', label: t('sidebar.settings'), icon: Settings },
  ];

  return raw.filter(item => {
    if (item.id === 'inventory_group') {
      return userRole.value === 'ADMIN' || userRole.value === 'SUPER_ADMIN' || vm.hasPermission('inventory:view');
    }
    if (item.id === 'finance') {
      return userRole.value === 'ADMIN' || userRole.value === 'SUPER_ADMIN' || vm.hasPermission('finance:view');
    }
    if (item.adminOnly) {
      return userRole.value === 'ADMIN' || userRole.value === 'SUPER_ADMIN';
    }
    return true;
  });
});

const isActive = (view: string) => {
  const currentView = route.path.substring(1) || 'dashboard';
  return currentView === view;
};

const isParentActive = (item: MenuItem) => {
  if (item.children && item.children.some(c => c.path)) {
    return item.children.some(c => c.path && route.path.startsWith(c.path));
  }
  const currentView = route.path.substring(1) || 'dashboard';
  return currentView.startsWith(item.id);
};

const isSubmenuActive = (item: MenuItem, sub: SubMenuItem) => {
  if (sub.path) {
    return route.path.startsWith(sub.path);
  }
  const currentView = route.path.substring(1) || 'dashboard';
  if (!currentView.startsWith(item.id)) return false;
  const currentTab = (route.query.tab as string) || 'statements';
  return currentTab === sub.tab;
};

const handleParentClick = (item: MenuItem) => {
  if (sidebarCollapsed.value) {
    sidebarCollapsed.value = false;
    expandedMenus.value[item.id] = true;
    if (item.children && item.children[0]?.path) {
      router.push(item.children[0].path);
    } else {
      router.push('/' + item.id);
    }
    return;
  }
  expandedMenus.value[item.id] = !expandedMenus.value[item.id];
  if (!isParentActive(item)) {
    if (item.children && item.children[0]?.path) {
      router.push(item.children[0].path);
    } else {
      router.push('/' + item.id);
    }
  }
};

const navigateToSubmenu = (item: MenuItem, sub: SubMenuItem) => {
  if (sub.path) {
    router.push(sub.path);
  } else {
    router.push({ path: '/' + item.id, query: { tab: sub.tab } });
  }
};

const alertHelp = () => {
  alert(t('sidebar.helpAlert'));
};
</script>
