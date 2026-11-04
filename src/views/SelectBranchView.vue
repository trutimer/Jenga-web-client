<template>
  <div class="min-h-screen w-full bg-surface-container-high text-on-surface font-sans antialiased relative overflow-x-hidden flex flex-col justify-between selection:bg-primary selection:text-on-primary">
    <!-- Ambient Background Gradients -->
    <div class="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))] pointer-events-none" />
    <div class="absolute -top-40 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
    <div class="absolute -bottom-40 -right-40 w-96 h-96 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />

    <!-- Top Navigation / Header -->
    <header class="relative z-10 w-full max-w-7xl mx-auto px-6 py-4 sm:py-5 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 sm:w-11 sm:h-11 bg-white rounded-xl shadow-xs border border-outline-variant/60 flex items-center justify-center p-2 shrink-0">
          <img src="/logo.svg" alt="DukaPro Logo" class="w-full h-full object-contain" />
        </div>
        <div>
          <h1 class="text-base sm:text-lg md:text-xl font-black text-on-surface tracking-tight leading-tight">
            {{ timeGreeting }}, {{ userName }}
          </h1>
          <p class="text-[11px] sm:text-xs font-semibold text-on-surface-variant font-mono uppercase tracking-wider">
            {{ userStores.length > 1 ? $t('selectBranch.title') : $t('selectBranch.title') }}
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2.5 sm:gap-3">
        <!-- Return to app button if user already has an active session -->
        <button 
          v-if="activeBranchId"
          @click="handleReturnToApp"
          class="hidden sm:flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-surface-container-lowest border border-outline-variant hover:bg-surface-container-high text-on-surface text-xs font-bold transition-all cursor-pointer shadow-xs"
        >
          <ArrowLeft class="w-3.5 h-3.5 text-primary" />
          <span>{{ userRole === 'CASHIER' ? $t('topNav.checkoutPos') : $t('sidebar.dashboard') }}</span>
        </button>

        <LanguageSelector variant="dropdown" />
        <button 
          @click="handleLogout"
          class="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-surface-container-lowest border border-outline-variant hover:bg-error-container/20 hover:border-error/30 hover:text-error text-on-surface-variant text-xs font-bold transition-all cursor-pointer shadow-xs"
          :title="$t('sidebar.logout')"
        >
          <LogOut class="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>{{ $t('sidebar.logout') }}</span>
        </button>
      </div>
    </header>

    <!-- Main Content Container -->
    <main class="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6 flex-1 flex flex-col justify-center">
      <!-- Title & Search Section -->
      <div class="text-center max-w-2xl mx-auto space-y-2 mb-4 sm:mb-6 animate-fade-down flex flex-col items-center w-full">
        <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-container/30 border border-primary/20 text-primary text-xs font-bold font-mono uppercase tracking-widest">
          <Building2 class="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          <span>{{ userStores.length > 1 ? $t('selectBranch.title') : $t('selectBranch.title') }}</span>
        </div>

        <!-- Store Selector Tabs/Cards (Visible when user has > 1 store) -->
        <div v-if="userStores.length > 1" class="w-full pt-2">
          <div class="flex items-center justify-between text-xs font-mono font-bold uppercase tracking-wider text-on-surface-variant mb-2 px-1">
            <span class="flex items-center gap-1.5">
              <Store class="w-3.5 h-3.5 text-primary" />
              <span>{{ $t('selectBranch.selectStore') }} ({{ userStores.length }})</span>
            </span>
            <span v-if="selectedStore" class="text-[11px] text-primary lowercase font-sans">
              {{ $t('selectBranch.currentStore') }}: <strong class="uppercase font-mono">{{ selectedStore.name }}</strong>
            </span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full">
            <button
              v-for="st in userStores"
              :key="st.id"
              type="button"
              @click="onSelectStore(st.id)"
              class="p-3 rounded-2xl border text-left transition-all duration-200 relative overflow-hidden flex items-center justify-between gap-3 cursor-pointer group shadow-2xs"
              :class="selectedStoreId === st.id 
                ? 'bg-primary-container/20 border-primary ring-2 ring-primary/30 shadow-xs' 
                : 'bg-surface-container-lowest border-outline-variant hover:border-primary/50 hover:bg-surface-container-lowest/90'"
            >
              <div class="flex items-center gap-3 min-w-0">
                <div 
                  class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors"
                  :class="selectedStoreId === st.id ? 'bg-primary text-on-primary' : 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-on-primary'"
                >
                  <Building2 class="w-4.5 h-4.5 stroke-[2px]" />
                </div>
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-1.5">
                    <h4 class="text-sm font-black text-on-surface truncate group-hover:text-primary transition-colors">
                      {{ st.name }}
                    </h4>
                    <span 
                      v-if="selectedStoreId === st.id" 
                      class="w-2 h-2 rounded-full bg-primary shrink-0" 
                    />
                  </div>
                  <div class="flex items-center gap-1.5 mt-0.5 text-[11px] text-on-surface-variant font-medium">
                    <span class="font-mono text-outline text-[11px]">{{ formatStoreBranchCount(getStoreBranchCount(st)) }}</span>
                  </div>
                </div>
              </div>

              <!-- Selected check icon -->
              <div 
                v-if="selectedStoreId === st.id" 
                class="w-5.5 h-5.5 rounded-full bg-primary text-on-primary flex items-center justify-center shrink-0 shadow-xs"
              >
                <CheckCircle2 class="w-3.5 h-3.5 stroke-[2.5px]" />
              </div>
            </button>
          </div>
        </div>

        <!-- Branch Search Bar of reasonable width -->
        <div v-if="branches.length > 1 || searchQuery" class="w-full max-w-md pt-1.5">
          <div class="relative flex items-center shadow-xs">
            <Search class="w-4 h-4 text-on-surface-variant absolute left-3.5 pointer-events-none" />
            <input 
              v-model="searchQuery"
              type="text" 
              :placeholder="$t('selectBranch.searchPlaceholder')" 
              class="w-full h-9 sm:h-10 pl-9 pr-4 bg-surface-container-lowest border border-outline-variant rounded-xl text-xs sm:text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all font-medium placeholder:text-outline shadow-xs"
            />
          </div>
        </div>
      </div>

      <!-- Loading State Skeleton -->
      <div 
        v-if="isLoading" 
        class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-3.5 max-w-[830px] mx-auto w-full justify-center"
      >
        <div v-for="i in 3" :key="i" class="h-36 sm:h-38 bg-surface-container-lowest/60 border border-outline-variant/50 rounded-xl p-3 sm:p-3.5 animate-pulse flex flex-col justify-between">
          <div class="space-y-2">
            <div class="w-8 h-8 bg-surface-container-high rounded-lg" />
            <div class="w-2/3 h-3.5 bg-surface-container-high rounded" />
            <div class="w-1/2 h-2.5 bg-surface-container-high rounded" />
          </div>
          <div class="w-full h-6 bg-surface-container-high rounded-lg mt-2" />
        </div>
      </div>

      <!-- Branch List Grid: Simple Modern Storefront Cards (Sized compact & responsive) -->
      <div 
        v-else-if="filteredBranches.length > 0 || (!searchQuery && branches.length === 0)" 
        class="grid gap-3 sm:gap-3.5 mx-auto w-full animate-fade-up justify-center"
        :class="branchGridClass"
      >
        <!-- Branch Cards -->
        <div 
          v-for="b in filteredBranches" 
          :key="b.id"
          @click="selectBranch(b)"
          class="group bg-surface-container-lowest hover:bg-surface-container-lowest border border-outline-variant hover:border-primary/60 rounded-xl sm:rounded-2xl shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between cursor-pointer relative overflow-hidden"
          :class="isCurrentBranch(b) ? 'ring-2 ring-primary border-primary bg-primary-container/10' : ''"
        >
          <!-- Top Clean 2D Shop Canopy / Awning -->
          <div class="relative w-full">
            <div class="h-2 w-full flex">
              <div v-for="s in 8" :key="s" class="flex-1" :class="s % 2 === 0 ? 'bg-primary' : 'bg-primary/20'"></div>
            </div>
            <div class="flex w-full -mt-0.5">
              <div 
                v-for="s in 8" 
                :key="s" 
                class="flex-1 h-1 rounded-b-full shadow-2xs" 
                :class="s % 2 === 0 ? 'bg-primary' : 'bg-primary/20'"
              ></div>
            </div>
          </div>

          <!-- Card Content Body -->
          <div class="p-3 sm:p-3.5 flex-1 flex flex-col justify-between">
            <div>
              <!-- Store Icon & Badges Header -->
              <div class="flex items-start justify-between gap-2 mb-2">
                <div class="w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-200 shadow-2xs shrink-0">
                  <Store class="w-4 h-4 stroke-[2px]" />
                </div>

                <div class="flex items-center gap-1 flex-wrap justify-end">
                  <!-- Active Indicator Badge -->
                  <span 
                    v-if="isCurrentBranch(b)" 
                    class="bg-primary text-on-primary text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs"
                  >
                    <CheckCircle2 class="w-2.5 h-2.5" />
                    <span>{{ $t('selectBranch.currentBadge') }}</span>
                  </span>

                  <!-- Status Badge -->
                  <span 
                    v-else
                    class="text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full"
                    :class="b.status === 'Active' || !b.status ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/20' : 'bg-surface-container-high text-on-surface-variant'"
                  >
                    {{ b.status || $t('common.active') }}
                  </span>
                </div>
              </div>

              <!-- Branch Name -->
              <h3 class="text-sm sm:text-base font-black text-on-surface group-hover:text-primary transition-colors leading-tight mb-1.5 truncate" :title="b.name">
                {{ b.name }}
              </h3>

              <!-- Branch Details -->
              <div class="space-y-1 text-[11px] text-on-surface-variant font-medium">
                <div class="flex items-start gap-1.5">
                  <MapPin class="w-3 h-3 text-primary shrink-0 mt-0.5" />
                  <span class="leading-snug truncate" :title="b.location || $t('selectBranch.mainPremises')">{{ b.location || $t('selectBranch.mainPremises') }}</span>
                </div>
                <div v-if="b.phone" class="flex items-center gap-1.5">
                  <Phone class="w-3 h-3 text-outline shrink-0" />
                  <span class="truncate">{{ b.phone }}</span>
                </div>
                <div v-if="b.email" class="flex items-center gap-1.5">
                  <Mail class="w-3 h-3 text-outline shrink-0" />
                  <span class="truncate">{{ b.email }}</span>
                </div>
              </div>
            </div>

            <!-- Select Button Footer -->
            <div class="mt-2.5 pt-2 border-t border-outline-variant/50 flex items-center justify-between">
              <span class="text-[10px] sm:text-[11px] font-bold text-primary group-hover:underline">
                <template v-if="selectingBranchId === b.id">
                  {{ $t('selectBranch.switchingContext') }}
                </template>
                <template v-else-if="isCurrentBranch(b)">
                  {{ $t('selectBranch.alreadySelected') }}
                </template>
                <template v-else>
                  {{ $t('selectBranch.selectThisBranch') }}
                </template>
              </span>
              <div 
                class="w-6 h-6 rounded-full flex items-center justify-center transition-all group-hover:translate-x-0.5 shadow-2xs"
                :class="isCurrentBranch(b) ? 'bg-primary text-white' : 'bg-surface-container text-on-surface-variant group-hover:bg-primary group-hover:text-white'"
              >
                <Loader2 v-if="selectingBranchId === b.id" class="w-3 h-3 animate-spin" />
                <ArrowRight v-else class="w-3 h-3" />
              </div>
            </div>
          </div>
        </div>

        <!-- Add New Branch Card (Visible to ADMIN or SUPER_ADMIN) -->
        <div 
          v-if="canCreateBranch"
          @click="showCreateBranchModal = true"
          class="group bg-surface-container-lowest hover:bg-surface-container-lowest border-2 border-dashed border-outline-variant hover:border-primary rounded-xl sm:rounded-2xl shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between cursor-pointer relative overflow-hidden"
        >
          <!-- Top Clean 2D Shop Canopy / Awning -->
          <div class="relative w-full">
            <div class="h-2 w-full flex">
              <div v-for="s in 8" :key="s" class="flex-1" :class="s % 2 === 0 ? 'bg-primary/40' : 'bg-primary/15'"></div>
            </div>
            <div class="flex w-full -mt-0.5">
              <div 
                v-for="s in 8" 
                :key="s" 
                class="flex-1 h-1 rounded-b-full shadow-2xs" 
                :class="s % 2 === 0 ? 'bg-primary/40' : 'bg-primary/15'"
              ></div>
            </div>
          </div>

          <!-- Card Content Body -->
          <div class="p-3 sm:p-3.5 flex-1 flex flex-col justify-between">
            <div>
              <!-- Plus Icon & New Badge Header -->
              <div class="flex items-start justify-between gap-2 mb-2">
                <div class="w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-200 shadow-2xs shrink-0">
                  <Plus class="w-4 h-4 stroke-[2.5px]" />
                </div>

                <span class="text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  + New
                </span>
              </div>

              <!-- Title -->
              <h3 class="text-sm sm:text-base font-black text-on-surface group-hover:text-primary transition-colors leading-tight mb-1.5">
                {{ $t('selectBranch.addNewBranch') }}
              </h3>

              <!-- Description -->
              <div class="space-y-1 text-[11px] text-on-surface-variant font-medium">
                <p class="leading-relaxed line-clamp-2">
                  {{ $t('selectBranch.addNewBranchDesc') }}
                </p>
              </div>
            </div>

            <!-- Footer Action Button -->
            <div class="mt-2.5 pt-2 border-t border-outline-variant/50 flex items-center justify-between">
              <span class="text-[10px] sm:text-[11px] font-bold text-primary group-hover:underline">
                {{ $t('selectBranch.addNewBranch') }}
              </span>
              <div class="w-6 h-6 rounded-full flex items-center justify-center transition-all group-hover:rotate-90 bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white shadow-2xs">
                <Plus class="w-3 h-3 stroke-[2.5px]" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-10 px-6 bg-surface-container-lowest border border-outline-variant rounded-2xl max-w-md mx-auto shadow-sm space-y-4">
        <div class="w-12 h-12 bg-error-container/30 text-error rounded-full flex items-center justify-center mx-auto">
          <Building2 class="w-6 h-6" />
        </div>
        <div>
          <h3 class="text-base sm:text-lg font-bold text-on-surface">{{ $t('selectBranch.noBranchesFound') }}</h3>
          <p class="text-xs text-on-surface-variant mt-1">
            {{ searchQuery ? $t('selectBranch.noBranchesMatchQuery') : $t('selectBranch.noBranchesSetup') }}
          </p>
        </div>
        <div class="flex items-center justify-center gap-2.5">
          <button 
            @click="loadBranches" 
            class="px-3.5 py-2 bg-surface-container border border-outline-variant text-on-surface rounded-xl text-xs font-bold hover:bg-surface-container-high transition-all cursor-pointer"
          >
            {{ $t('selectBranch.refreshList') }}
          </button>
          <button 
            v-if="canCreateBranch"
            @click="showCreateBranchModal = true" 
            class="px-3.5 py-2 bg-primary text-on-primary rounded-xl text-xs font-bold hover:bg-primary/90 transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <Plus class="w-3.5 h-3.5 stroke-[2.5px]" />
            <span>{{ $t('selectBranch.addNewBranch') }}</span>
          </button>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="relative z-10 w-full py-4 text-center text-xs text-on-surface-variant/70 font-mono">
      {{ $t('selectBranch.portalFooter') }}
    </footer>

    <!-- License Information Modal Popup -->
    <LicenseModal 
      :isOpen="showLicenseModal" 
      :branchId="modalBranchId" 
      :onClose="() => showLicenseModal = false" 
    />

    <!-- Add New Branch Modal -->
    <CreateBranchModal
      :isOpen="showCreateBranchModal"
      @close="showCreateBranchModal = false"
      @created="handleBranchCreated"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { api } from '../services/api';
import { showToast } from '../services/toastService';
import { useAppViewModel } from '../viewmodels/useAppViewModel';
import LicenseModal from '../components/common/LicenseModal.vue';
import CreateBranchModal from '../components/branch/CreateBranchModal.vue';
import LanguageSelector from '../components/common/LanguageSelector.vue';
import type { StoreBranch, StoreResponse } from '../models/types';
import { t, currentLocale } from '../i18n';
import { 
  Store, 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  ArrowRight, 
  ArrowLeft,
  LogOut, 
  Search,
  CheckCircle2,
  Loader2,
  Plus
} from 'lucide-vue-next';

const router = useRouter();
const vm = useAppViewModel();
const { 
  activeBranchId, 
  activeStoreId, 
  userStores, 
  userRole, 
  refreshUserStores,
  switchContext, 
  handleLogout: performLogout 
} = vm;

const userName = ref(localStorage.getItem('cashierName') || 'User');
const selectedStoreId = ref<string>(activeStoreId.value || localStorage.getItem('storeId') || '');

const selectedStore = computed(() => {
  return userStores.value.find(s => s.id === selectedStoreId.value) || null;
});

const canCreateBranch = computed(() => {
  // 1. If the selected store defines an explicit membership role for this user, inspect it
  const currentStore = userStores.value.find(s => s.id === selectedStoreId.value);
  const storeRole = (currentStore?.role || '').toUpperCase();
  if (storeRole === 'MANAGER' || storeRole === 'CASHIER') {
    return false;
  }
  if (storeRole === 'ADMIN' || storeRole === 'SUPER_ADMIN') {
    return true;
  }

  // 2. Fall back to active session userRole
  const role = (userRole.value || localStorage.getItem('cashierRole') || '').toUpperCase();
  if (role === 'MANAGER' || role === 'CASHIER') {
    return false;
  }
  return role === 'ADMIN' || role === 'SUPER_ADMIN';
});

const isCurrentBranch = (b: StoreBranch): boolean => {
  return activeBranchId.value === b.id && (!selectedStoreId.value || activeStoreId.value === selectedStoreId.value);
};

const timeGreeting = computed(() => {
  const _ = currentLocale.value;
  const hour = new Date().getHours();
  if (hour < 12) {
    return t('selectBranch.goodMorning');
  } else if (hour < 17) {
    return t('selectBranch.goodAfternoon');
  } else {
    return t('selectBranch.goodEvening');
  }
});

const storeBranchCounts = ref<Record<string, number>>({});

const getStoreBranchCount = (st: StoreResponse): number => {
  if (storeBranchCounts.value[st.id] !== undefined) {
    return storeBranchCounts.value[st.id] ?? 0;
  }
  return st.branches && Array.isArray(st.branches) ? st.branches.length : 0;
};

const formatStoreBranchCount = (count: number) => {
  const _ = currentLocale.value; // reactivity trigger on locale change
  if (count === 1) {
    return t('selectBranch.storeBranchSingle');
  }
  return t('selectBranch.storeBranchesCount', { count });
};

const branches = ref<StoreBranch[]>([]);
const isLoading = ref(true);
const selectingBranchId = ref<string | null>(null);
const searchQuery = ref('');

const showLicenseModal = ref(false);
const modalBranchId = ref<string | null>(null);
const showCreateBranchModal = ref(false);

const filteredBranches = computed(() => {
  if (!searchQuery.value.trim()) return branches.value;
  const q = searchQuery.value.toLowerCase();
  return branches.value.filter(b => 
    b.name.toLowerCase().includes(q) || 
    (b.location && b.location.toLowerCase().includes(q))
  );
});

const branchGridClass = computed(() => {
  const count = filteredBranches.value.length + (canCreateBranch.value ? 1 : 0);
  if (count <= 1) {
    return 'grid-cols-1 max-w-[290px]';
  } else if (count === 2) {
    return 'grid-cols-1 sm:grid-cols-2 max-w-[560px]';
  } else if (count === 3) {
    return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 max-w-[830px]';
  } else {
    return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 max-w-5xl';
  }
});

const onSelectStore = async (storeId: string) => {
  if (selectedStoreId.value === storeId) return;
  selectedStoreId.value = storeId;
  await loadBranches();
};

const refreshAllStoreBranchCounts = async () => {
  if (!userStores.value || userStores.value.length === 0) return;
  const role = (userRole.value || localStorage.getItem('cashierRole') || '').toUpperCase();
  const isGlobalAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN';

  await Promise.allSettled(
    userStores.value.map(async (st) => {
      if (st.branches && st.branches.length > 0) {
        storeBranchCounts.value[st.id] = st.branches.length;
      }
      const stRole = (st.role || role).toUpperCase();
      // Only query all store branches if user has admin privileges for this store.
      // Cashiers and Managers must never be given store-wide branches.
      if (isGlobalAdmin || stRole === 'ADMIN' || stRole === 'SUPER_ADMIN') {
        try {
          const res = await api.get<StoreBranch[]>(`/api/stores/${st.id}/branches`);
          if (Array.isArray(res)) {
            st.branches = res;
            storeBranchCounts.value[st.id] = res.length;
          }
        } catch (e) {
          console.warn(`Failed to fetch branches for store ${st.name}:`, e);
        }
      }
    })
  );
  try {
    localStorage.setItem('userStores', JSON.stringify(userStores.value));
  } catch (_) {}
};

const loadBranches = async () => {
  isLoading.value = true;
  const targetStoreId = selectedStoreId.value || activeStoreId.value || localStorage.getItem('storeId');
  if (!targetStoreId) {
    isLoading.value = false;
    return;
  }

  const role = (userRole.value || localStorage.getItem('cashierRole') || '').toUpperCase();
  const isGlobalAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN';
  const st = userStores.value.find(s => s.id === targetStoreId);
  const stRole = (st?.role || role).toUpperCase();
  const isAdminForStore = isGlobalAdmin || stRole === 'ADMIN' || stRole === 'SUPER_ADMIN';

  // For non-admins (CASHIER or MANAGER), strictly use assigned branches
  if (!isAdminForStore) {
    const assignedBranches = (st && st.branches && st.branches.length > 0)
      ? st.branches
      : (vm.userBranches.value || []);
    branches.value = assignedBranches;
    storeBranchCounts.value[targetStoreId] = assignedBranches.length;
    isLoading.value = false;
    return;
  }

  // First check if the store in userStores already has pre-populated branches
  if (st && st.branches && st.branches.length > 0) {
    branches.value = st.branches;
    storeBranchCounts.value[targetStoreId] = st.branches.length;
    isLoading.value = false;
    return;
  }

  try {
    let res = await api.get<StoreBranch[]>(`/api/stores/${targetStoreId}/branches`);
    if (!res || !Array.isArray(res) || res.length === 0) {
      const storeObj = await api.get<any>(`/api/stores/${targetStoreId}`);
      if (storeObj && storeObj.branches) {
        res = storeObj.branches;
      }
    }
    const branchList = Array.isArray(res) ? res : [];
    branches.value = branchList;
    storeBranchCounts.value[targetStoreId] = branchList.length;
    if (st) {
      st.branches = branchList;
    }
  } catch (err) {
    console.error('Error loading branches:', err);
    branches.value = [];
  } finally {
    isLoading.value = false;
  }
};

const handleBranchCreated = async (newBranch: StoreBranch) => {
  if (selectedStoreId.value) {
    storeBranchCounts.value[selectedStoreId.value] = (storeBranchCounts.value[selectedStoreId.value] || 0) + 1;
    const st = userStores.value.find(s => s.id === selectedStoreId.value);
    if (st) {
      st.branches = [...(st.branches || []), newBranch];
    }
  }
  await loadBranches();
};

const selectBranch = async (b: StoreBranch) => {
  if (selectingBranchId.value) return;
  selectingBranchId.value = b.id;

  try {
    const targetStoreId = selectedStoreId.value || b.storeId || localStorage.getItem('storeId') || '';
    if (targetStoreId) {
      try {
        await switchContext(targetStoreId, b.id);
      } catch (switchErr: any) {
        console.warn('Server switchContext encountered error, applying local branch selection:', switchErr);
        localStorage.setItem('storeId', targetStoreId);
        localStorage.setItem('branchId', b.id);
        localStorage.setItem('branchName', b.name);
        vm.activeStoreId.value = targetStoreId;
        vm.activeBranchId.value = b.id;
        vm.activeBranchName.value = b.name;
      }
    } else {
      localStorage.setItem('branchId', b.id);
      localStorage.setItem('branchName', b.name);
      vm.activeBranchId.value = b.id;
      vm.activeBranchName.value = b.name;
    }

    showToast(t('selectBranch.branchVerifiedToast', { name: b.name }), 'success');

    const currentRole = (userRole.value || localStorage.getItem('cashierRole') || '').toUpperCase();
    if (currentRole === 'CASHIER') {
      router.push('/checkout');
    } else {
      router.push('/dashboard');
    }
  } catch (err: any) {
    console.error('Failed to select branch:', err);
    showToast(err.message || 'Failed to select branch', 'error');
  } finally {
    selectingBranchId.value = null;
  }
};

const handleReturnToApp = () => {
  const currentRole = (userRole.value || localStorage.getItem('cashierRole') || '').toUpperCase();
  if (currentRole === 'CASHIER') {
    router.push('/checkout');
  } else {
    router.push('/dashboard');
  }
};

const handleLogout = () => {
  performLogout();
};

onMounted(async () => {
  // Re-hydrate / refresh user stores immediately
  await refreshUserStores();

  // Ensure selectedStoreId is valid
  if (!selectedStoreId.value && userStores.value.length > 0 && userStores.value[0]?.id) {
    selectedStoreId.value = userStores.value[0].id;
  }

  // Proactively refresh real branch counts for all user stores in parallel
  refreshAllStoreBranchCounts();

  await loadBranches();
});
</script>