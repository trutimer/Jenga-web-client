<template>
  <nav 
    class="hidden md:flex flex-col h-full bg-surface-container-low border-r border-outline-variant/60 shrink-0 relative z-20 font-sans transition-all duration-300 ease-in-out select-none" 
    :class="sidebarCollapsed ? 'w-20' : 'w-64'"
  >
    <!-- Branch & Store Header -->
    <div 
      class="h-16 px-3.5 border-b border-outline-variant/60 flex items-center relative bg-surface-container-low shrink-0 transition-all duration-300"
      :class="sidebarCollapsed ? 'justify-center' : 'justify-between gap-2.5'"
    >
      <!-- When Expanded -->
      <template v-if="!sidebarCollapsed">
        <div class="flex items-center gap-2.5 min-w-0 flex-1">
          <!-- Jenga Brand Logo -->
          <div class="w-9 h-9 rounded-xl bg-white border border-outline-variant/60 flex items-center justify-center p-1.5 shrink-0 shadow-2xs">
            <img src="/logo.svg" alt="Jenga Logo" class="w-full h-full object-contain" />
          </div>

          <!-- Store name (line 1) & Branch name (line 2) -->
          <div 
            class="min-w-0 flex-1 py-1 px-1.5 -mx-1 rounded-lg transition-colors"
            :class="canSwitchContext ? 'cursor-pointer hover:bg-surface-container-high/60 group/store' : ''"
            @click="canSwitchContext ? router.push('/select-branch') : null"
            :title="canSwitchContext ? ($t('topNav.switchBranchTooltip') || 'Switch Store or Branch') : displayStoreName"
          >
            <div class="flex items-center gap-1 min-w-0">
              <h2 class="text-xs font-black text-on-surface truncate leading-tight uppercase tracking-wider group-hover/store:text-primary transition-colors" :title="displayStoreName">
                {{ displayStoreName }}
              </h2>
              <ChevronsUpDown v-if="canSwitchContext" class="w-3 h-3 text-outline group-hover/store:text-primary shrink-0 transition-colors" />
            </div>
            <p class="text-[11px] font-bold text-primary truncate leading-tight mt-0.5" :title="displayBranchName">
              {{ displayBranchName }}
            </p>
          </div>
        </div>

        <!-- Collapse Toggle Button -->
        <button 
          @click="sidebarCollapsed = !sidebarCollapsed"
          class="w-8 h-8 rounded-lg flex items-center justify-center text-outline hover:text-primary hover:bg-surface-container-high transition-colors cursor-pointer shrink-0"
          :title="$t('sidebar.collapse') || 'Collapse sidebar'"
          aria-label="Collapse sidebar"
        >
          <PanelLeftClose class="w-4.5 h-4.5" />
        </button>
      </template>

      <!-- When Collapsed -->
      <template v-else>
        <button 
          @click="sidebarCollapsed = !sidebarCollapsed"
          class="w-9 h-9 rounded-xl bg-surface-container-high/80 hover:bg-primary/10 hover:text-primary text-on-surface-variant flex items-center justify-center transition-all cursor-pointer shadow-2xs group"
          :title="`${displayBranchName} (${$t('sidebar.expand') || 'Expand sidebar'})`"
          aria-label="Expand sidebar"
        >
          <PanelLeftOpen class="w-4.5 h-4.5 group-hover:scale-110 transition-transform" />
        </button>
      </template>
    </div>

    <!-- Main Navigation Sections -->
    <div 
      class="flex-1 overflow-y-auto overflow-x-hidden py-3 flex flex-col custom-scrollbar" 
      :class="sidebarCollapsed ? 'px-2 gap-3' : 'px-3 gap-3.5'"
    >
      <div 
        v-for="(section, sIndex) in menuSections" 
        :key="section.id" 
        class="flex flex-col gap-1"
      >
        <!-- Section Title (Expanded) or Divider (Collapsed) -->
        <div v-if="!sidebarCollapsed" class="px-2.5 mb-1" :class="sIndex > 0 ? 'pt-2.5 border-t border-outline-variant/30' : ''">
          <p class="text-[10px] font-bold text-outline/75 uppercase tracking-widest select-none">
            {{ section.label }}
          </p>
        </div>
        <div v-else-if="sIndex > 0" class="border-t border-outline-variant/30 mx-2 my-0.5"></div>

        <!-- Section Menu Items -->
        <template v-for="item in section.items" :key="item.id">
          <!-- Disabled / Mock Item -->
          <div 
            v-if="item.disabled"
            class="h-10 flex items-center rounded-xl cursor-not-allowed select-none transition-all duration-150 relative"
            :class="sidebarCollapsed ? 'justify-center px-0' : 'gap-3 px-3 text-on-surface-variant/40'"
            :title="`${item.label} (Simulated feature)`"
          >
            <component :is="item.icon" class="w-4.5 h-4.5 shrink-0 text-on-surface-variant/40" />
            <span v-if="!sidebarCollapsed" class="text-xs font-medium text-on-surface-variant/40 truncate">{{ item.label }}</span>
            <span v-if="!sidebarCollapsed" class="ml-auto text-[9px] font-mono border border-outline-variant/30 px-1 py-0.5 rounded text-outline bg-surface-container-high scale-90 origin-right">MOCK</span>
          </div>

          <!-- Expandable Parent Menu Item (with Children) -->
          <div v-else-if="item.children && item.children.length > 0" class="flex flex-col">
            <button
              @click="handleParentClick(item)"
              class="h-10 flex items-center justify-between rounded-xl transition-all duration-150 text-left cursor-pointer group relative"
              :title="sidebarCollapsed ? item.label : ''"
              :class="[
                sidebarCollapsed ? 'justify-center px-0 w-full' : 'px-3',
                isParentActive(item) 
                  ? 'bg-primary/10 text-primary font-semibold shadow-2xs' 
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/60 font-medium'
              ]"
            >
              <!-- Left active indicator pill -->
              <span 
                v-if="isParentActive(item)" 
                class="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-primary"
              ></span>

              <div class="flex items-center gap-3 min-w-0" :class="sidebarCollapsed ? 'justify-center' : ''">
                <component 
                  :is="item.icon" 
                  class="w-4.5 h-4.5 shrink-0 transition-transform duration-200 group-hover:scale-105" 
                  :class="isParentActive(item) ? 'stroke-[2.2px] text-primary' : 'text-on-surface-variant group-hover:text-on-surface'" 
                />
                <span v-if="!sidebarCollapsed" class="text-xs truncate">{{ item.label }}</span>
              </div>

              <!-- Chevron with smooth rotation -->
              <ChevronDown 
                v-if="!sidebarCollapsed" 
                class="w-3.5 h-3.5 transition-transform duration-200 shrink-0"
                :class="[
                  expandedMenus[item.id] ? 'rotate-180 text-primary' : 'text-outline group-hover:text-on-surface'
                ]"
              />
            </button>

            <!-- Nested Submenu Items (Expanded Only) -->
            <div 
              v-if="!sidebarCollapsed && expandedMenus[item.id]" 
              class="flex flex-col gap-0.5 ml-4.5 pl-2.5 my-1 border-l border-outline-variant/50 transition-all duration-200 animate-fade-in"
            >
              <button
                v-for="sub in item.children"
                :key="sub.path || sub.tab || sub.section"
                @click="navigateToSubmenu(item, sub)"
                class="h-8.5 px-2.5 flex items-center justify-between gap-2 rounded-lg text-xs transition-all text-left cursor-pointer group"
                :class="isSubmenuActive(item, sub)
                  ? 'bg-primary/15 text-primary font-bold shadow-2xs'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/60 font-medium'"
              >
                <div class="flex items-center gap-2 min-w-0">
                  <span 
                    class="w-1.5 h-1.5 rounded-full shrink-0 transition-all"
                    :class="isSubmenuActive(item, sub) ? 'bg-primary scale-110' : 'bg-outline-variant/80 group-hover:bg-outline'"
                  ></span>
                  <component 
                    :is="sub.icon" 
                    class="w-3.5 h-3.5 shrink-0 transition-colors" 
                    :class="isSubmenuActive(item, sub) ? 'text-primary' : 'text-outline group-hover:text-on-surface'" 
                  />
                  <span class="truncate">{{ sub.label }}</span>
                </div>
                <span 
                  v-if="sub.badge" 
                  class="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded leading-none shrink-0 tracking-wider"
                  :class="isSubmenuActive(item, sub) ? 'bg-primary/20 text-primary' : 'bg-surface-container-highest text-outline border border-outline-variant/40'"
                >
                  {{ sub.badge }}
                </span>
              </button>
            </div>
          </div>

          <!-- Normal Single Menu Item -->
          <button
            v-else
            @click="router.push('/' + item.id)"
            class="h-10 flex items-center rounded-xl transition-all duration-150 text-left cursor-pointer group relative"
            :title="sidebarCollapsed ? item.label : ''"
            :class="[
              sidebarCollapsed ? 'justify-center px-0 w-full' : 'gap-3 px-3',
              isActive(item.id) 
                ? 'bg-primary/10 text-primary font-semibold shadow-2xs' 
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/60 font-medium'
            ]"
          >
            <!-- Left active indicator pill -->
            <span 
              v-if="isActive(item.id)" 
              class="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-primary"
            ></span>

            <component 
              :is="item.icon" 
              class="w-4.5 h-4.5 shrink-0 transition-transform duration-200 group-hover:scale-105" 
              :class="isActive(item.id) ? 'stroke-[2.2px] text-primary' : 'text-on-surface-variant group-hover:text-on-surface'" 
            />
            <span v-if="!sidebarCollapsed" class="text-xs truncate">{{ item.label }}</span>
          </button>
        </template>
      </div>
    </div>

    <!-- Grounded Minimal Status Footer -->
    <div 
      class="border-t border-outline-variant/60 shrink-0 bg-surface-container-low transition-all"
      :class="sidebarCollapsed ? 'p-3 flex justify-center' : 'px-4 py-3'"
    >
      <div v-if="!sidebarCollapsed" class="flex items-center justify-between text-xs">
        <div class="flex items-center gap-2 min-w-0">
          <span class="relative flex h-2 w-2 shrink-0">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span class="text-[11px] font-medium text-on-surface-variant truncate" :title="displayBranchName">
            {{ displayBranchName }}
          </span>
        </div>
        <span class="text-[10px] font-mono text-outline shrink-0 ml-2">v4.2</span>
      </div>

      <div v-else class="relative group cursor-pointer" :title="`Online • ${displayBranchName}`">
        <span class="relative flex h-2 w-2">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
      </div>
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
  Store, 
  PanelLeftClose,
  PanelLeftOpen,
  ChevronDown, 
  ShoppingBag, 
  ShieldCheck, 
  QrCode, 
  User, 
  RefreshCw, 
  Warehouse, 
  ArrowLeftRight, 
  ScrollText, 
  UtensilsCrossed, 
  ChevronsUpDown 
} from 'lucide-vue-next';
import { useAppViewModel } from '../../viewmodels/useAppViewModel';
import { t } from '../../i18n';

const props = withDefaults(defineProps<{
  onLogout?: () => void;
  onLock?: () => void;
  branchName?: string;
  storeName?: string;
}>(), {
  branchName: '',
  storeName: ''
});

const vm = useAppViewModel();
const { sidebarCollapsed, userRole } = vm;

const displayStoreName = computed(() => {
  return props.storeName || vm.settings.value?.name || 'Jenga Store';
});

const displayBranchName = computed(() => {
  return props.branchName || vm.activeBranchName?.value || localStorage.getItem('branchName') || 'Main Branch';
});

const canSwitchContext = computed(() => {
  const role = vm.userRole.value || localStorage.getItem('cashierRole');
  if (role === 'ADMIN' || role === 'SUPER_ADMIN') return true;
  if (vm.userStores.value && vm.userStores.value.length > 1) return true;
  if (vm.userBranches.value && vm.userBranches.value.length > 1) return true;
  const currentStore = vm.userStores.value?.find(s => s.id === vm.activeStoreId.value);
  if (currentStore && currentStore.branches && currentStore.branches.length > 1) return true;
  return false;
});

const isElectronApp = ref(typeof window !== 'undefined' && (window as any).ipcRenderer !== undefined);

const router = useRouter();
const route = useRoute();

interface SubMenuItem {
  tab?: string;
  section?: string;
  path?: string;
  label: string;
  icon: any;
  badge?: string;
}

interface MenuItem {
  id: string;
  label: string;
  icon: any;
  disabled?: boolean;
  adminOnly?: boolean;
  children?: SubMenuItem[];
}

interface MenuSection {
  id: string;
  label: string;
  items: MenuItem[];
}

const expandedMenus = ref<Record<string, boolean>>({
  inventory_group: false,
  warehouses: false,
  finance: false,
  settings: false
});

watch(() => route.path, (newPath) => {
  if (newPath.startsWith('/warehouses')) {
    expandedMenus.value.warehouses = true;
  } else {
    expandedMenus.value.warehouses = false;
  }
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
  if (newPath.startsWith('/settings')) {
    expandedMenus.value.settings = true;
  } else {
    expandedMenus.value.settings = false;
  }
}, { immediate: true });

const canAccessInventory = computed(() => 
  userRole.value === 'ADMIN' || userRole.value === 'SUPER_ADMIN' || vm.hasPermission('inventory:view')
);

const canAccessPurchases = computed(() => 
  userRole.value === 'ADMIN' || userRole.value === 'SUPER_ADMIN' || vm.hasPermission('purchase_order:view') || vm.hasPermission('purchase_order:create')
);

const canAccessWarehouses = computed(() => 
  userRole.value === 'ADMIN' || userRole.value === 'SUPER_ADMIN' || 
  vm.hasPermission('location:view') || vm.hasPermission('stock_transfer:view')
);

const canAccessMakerChecker = computed(() => 
  userRole.value === 'ADMIN' || userRole.value === 'SUPER_ADMIN' || 
  vm.hasPermission('maker_checker:view') || 
  vm.hasPermission('maker_checker:approve') || 
  vm.hasPermission('maker_checker:manage_policies')
);

const menuItems = computed<MenuItem[]>(() => {
  const inventoryChildren: SubMenuItem[] = [];
  if (canAccessInventory.value) {
    inventoryChildren.push({ path: '/inventory', label: t('sidebar.inventory'), icon: Package });
  }
  if (canAccessPurchases.value) {
    inventoryChildren.push({ path: '/purchases', label: t('sidebar.purchases'), icon: ShoppingBag });
  }

  const warehouseChildren: SubMenuItem[] = [
    { tab: 'locations', label: t('sidebar.warehousesLocations'), icon: Warehouse },
    { tab: 'transfers', label: t('sidebar.stockTransfers'), icon: ArrowLeftRight },
    { tab: 'ledger', label: t('sidebar.movementLedger'), icon: ScrollText },
    { tab: 'consumption', label: t('sidebar.internalConsumption'), icon: UtensilsCrossed },
  ];

  const settingsChildren: SubMenuItem[] = [
    { section: 'profile', label: t('settings.storeProfile'), icon: Store },
    ...(canAccessMakerChecker.value ? [{ section: 'maker-checker', label: t('settings.makerCheckerConfig'), icon: ShieldCheck }] : []),
    { section: 'hardware', label: t('settings.hardwareBarcode'), icon: QrCode },
    { section: 'account', label: t('settings.accountProfile'), icon: User },
    ...(isElectronApp.value ? [{ section: 'updates', label: t('settings.appUpdates'), icon: RefreshCw }] : [])
  ];

  const raw: MenuItem[] = [
    { id: 'dashboard', label: t('sidebar.dashboard'), icon: LayoutDashboard },
    { id: 'checkout', label: t('sidebar.checkout'), icon: CreditCard },
    { 
      id: 'inventory_group', 
      label: t('sidebar.inventoryPurchases'), 
      icon: Package, 
      children: inventoryChildren
    },
    { 
      id: 'warehouses', 
      label: t('sidebar.warehouses'), 
      icon: Warehouse, 
      children: warehouseChildren
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
    { 
      id: 'settings', 
      label: t('sidebar.settings'), 
      icon: Settings,
      children: settingsChildren
    },
  ];

  return raw.filter(item => {
    if (item.id === 'inventory_group') {
      return (canAccessInventory.value || canAccessPurchases.value) && inventoryChildren.length > 0;
    }
    if (item.id === 'warehouses') {
      return userRole.value !== 'CASHIER' && canAccessWarehouses.value;
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

const menuSections = computed<MenuSection[]>(() => {
  const all = menuItems.value;
  const mainIds = ['dashboard', 'checkout'];
  const opIds = ['inventory_group', 'warehouses', 'suppliers', 'customers'];
  const mgmtIds = ['users', 'reports', 'finance', 'settings'];

  const sections: MenuSection[] = [];

  const mainItems = all.filter(i => mainIds.includes(i.id));
  if (mainItems.length > 0) {
    sections.push({
      id: 'main',
      label: t('sidebar.sectionMain') || 'Overview',
      items: mainItems
    });
  }

  const opItems = all.filter(i => opIds.includes(i.id));
  if (opItems.length > 0) {
    sections.push({
      id: 'operations',
      label: t('sidebar.sectionOperations') || 'Operations',
      items: opItems
    });
  }

  const mgmtItems = all.filter(i => mgmtIds.includes(i.id));
  if (mgmtItems.length > 0) {
    sections.push({
      id: 'management',
      label: t('sidebar.sectionManagement') || 'Administration',
      items: mgmtItems
    });
  }

  const otherItems = all.filter(i => !mainIds.includes(i.id) && !opIds.includes(i.id) && !mgmtIds.includes(i.id));
  if (otherItems.length > 0) {
    sections.push({
      id: 'other',
      label: 'Other',
      items: otherItems
    });
  }

  return sections;
});

const isActive = (view: string) => {
  const currentView = route.path.substring(1) || 'dashboard';
  return currentView === view;
};

const isParentActive = (item: MenuItem) => {
  if (item.children && item.children.some(c => c.path)) {
    return item.children.some(c => c.path && (route.path === c.path || route.path.startsWith(c.path + '/')));
  }
  const currentView = route.path.substring(1) || 'dashboard';
  return currentView.startsWith(item.id);
};

const isSubmenuActive = (item: MenuItem, sub: SubMenuItem) => {
  if (sub.path) {
    return route.path === sub.path || route.path.startsWith(sub.path + '/');
  }
  const currentView = route.path.substring(1) || 'dashboard';
  if (!currentView.startsWith(item.id)) return false;
  if (item.id === 'settings') {
    const currentSection = (route.query.section as string) || 'profile';
    return currentSection === (sub.section || 'profile');
  }
  const defaultTab = item.id === 'warehouses' ? 'locations' : 'statements';
  const currentTab = (route.query.tab as string) || defaultTab;
  return currentTab === sub.tab;
};

const handleParentClick = (item: MenuItem) => {
  if (sidebarCollapsed.value) {
    sidebarCollapsed.value = false;
    expandedMenus.value[item.id] = true;
    if (item.children && item.children[0]?.path) {
      router.push(item.children[0].path);
    } else if (item.children && item.children[0]?.section) {
      router.push({ path: '/' + item.id, query: { section: item.children[0].section } });
    } else if (item.children && item.children[0]?.tab) {
      router.push({ path: '/' + item.id, query: { tab: item.children[0].tab } });
    } else {
      router.push('/' + item.id);
    }
    return;
  }
  expandedMenus.value[item.id] = !expandedMenus.value[item.id];
  if (!isParentActive(item)) {
    if (item.children && item.children[0]?.path) {
      router.push(item.children[0].path);
    } else if (item.children && item.children[0]?.section) {
      router.push({ path: '/' + item.id, query: { section: item.children[0].section } });
    } else if (item.children && item.children[0]?.tab) {
      router.push({ path: '/' + item.id, query: { tab: item.children[0].tab } });
    } else {
      router.push('/' + item.id);
    }
  }
};

const navigateToSubmenu = (item: MenuItem, sub: SubMenuItem) => {
  if (sub.path) {
    router.push(sub.path);
  } else if (sub.section) {
    router.push({ path: '/' + item.id, query: { section: sub.section } });
  } else {
    router.push({ path: '/' + item.id, query: { tab: sub.tab } });
  }
};
</script>
