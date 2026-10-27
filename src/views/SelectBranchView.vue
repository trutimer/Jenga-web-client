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
          <img src="/logo.svg" alt="Jenga Logo" class="w-full h-full object-contain" />
        </div>
        <div>
          <h1 class="text-base sm:text-lg md:text-xl font-black text-on-surface tracking-tight leading-tight">
            {{ timeGreeting }}, {{ adminName }}
          </h1>
          <p class="text-[11px] sm:text-xs font-semibold text-on-surface-variant font-mono uppercase tracking-wider">
            {{ $t('selectBranch.title') }}
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2.5 sm:gap-3">
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
      <div class="text-center max-w-2xl mx-auto space-y-3 mb-6 sm:mb-8 animate-fade-down flex flex-col items-center w-full">
        <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-container/30 border border-primary/20 text-primary text-xs font-bold font-mono uppercase tracking-widest">
          <Building2 class="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          <span>{{ $t('selectBranch.title') }}</span>
        </div>

        <!-- Branch Search Bar (shown if multiple branches) of reasonable width -->
        <div v-if="branches.length > 1" class="w-full max-w-md pt-1">
          <div class="relative flex items-center shadow-xs">
            <Search class="w-4 h-4 text-on-surface-variant absolute left-3.5 pointer-events-none" />
            <input 
              v-model="searchQuery"
              type="text" 
              :placeholder="$t('selectBranch.searchPlaceholder')" 
              class="w-full h-10 sm:h-11 pl-10 pr-4 bg-surface-container-lowest border border-outline-variant rounded-xl text-xs sm:text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all font-medium placeholder:text-outline shadow-xs"
            />
          </div>
        </div>
      </div>

      <!-- Loading State Skeleton -->
      <div 
        v-if="isLoading" 
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 max-w-4xl mx-auto w-full"
      >
        <div v-for="i in 3" :key="i" class="h-44 sm:h-48 bg-surface-container-lowest/60 border border-outline-variant/50 rounded-2xl p-4 sm:p-5 animate-pulse flex flex-col justify-between">
          <div class="space-y-2.5">
            <div class="w-9 h-9 sm:w-10 sm:h-10 bg-surface-container-high rounded-xl" />
            <div class="w-2/3 h-4 bg-surface-container-high rounded" />
            <div class="w-1/2 h-3 bg-surface-container-high rounded" />
          </div>
          <div class="w-full h-8 bg-surface-container-high rounded-xl mt-3" />
        </div>
      </div>

      <!-- Branch List Grid: Simple Modern Storefront Cards (Sized compact & responsive) -->
      <div 
        v-else-if="filteredBranches.length > 0 || (!searchQuery && branches.length === 0)" 
        class="grid gap-4 sm:gap-5 mx-auto w-full animate-fade-up"
        :class="[
          filteredBranches.length >= 3 
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 max-w-6xl' 
            : filteredBranches.length === 2 
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl' 
              : 'grid-cols-1 sm:grid-cols-2 max-w-2xl'
        ]"
      >
        <!-- Branch Cards -->
        <div 
          v-for="b in filteredBranches" 
          :key="b.id"
          @click="selectBranch(b)"
          class="group bg-surface-container-lowest hover:bg-surface-container-lowest border border-outline-variant hover:border-primary/60 rounded-xl sm:rounded-2xl shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between cursor-pointer relative overflow-hidden"
          :class="activeBranchId === b.id ? 'ring-2 ring-primary border-primary bg-primary-container/10' : ''"
        >
          <!-- Top Clean 2D Shop Canopy / Awning -->
          <div class="relative w-full">
            <div class="h-2.5 w-full flex">
              <div v-for="s in 8" :key="s" class="flex-1" :class="s % 2 === 0 ? 'bg-primary' : 'bg-primary/20'"></div>
            </div>
            <div class="flex w-full -mt-0.5">
              <div 
                v-for="s in 8" 
                :key="s" 
                class="flex-1 h-1.5 rounded-b-full shadow-2xs" 
                :class="s % 2 === 0 ? 'bg-primary' : 'bg-primary/20'"
              ></div>
            </div>
          </div>

          <!-- Card Content Body -->
          <div class="p-4 sm:p-5 flex-1 flex flex-col justify-between">
            <div>
              <!-- Store Icon & Badges Header -->
              <div class="flex items-start justify-between gap-2.5 mb-3">
                <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-2xs shrink-0">
                  <Store class="w-4.5 h-4.5 sm:w-5 sm:h-5 stroke-[2px]" />
                </div>

                <div class="flex items-center gap-1.5 flex-wrap justify-end">
                  <!-- Active Indicator Badge -->
                  <span 
                    v-if="activeBranchId === b.id" 
                    class="bg-primary text-on-primary text-[9px] sm:text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs"
                  >
                    <CheckCircle2 class="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    <span>{{ $t('selectBranch.currentBadge') }}</span>
                  </span>

                  <!-- Status Badge -->
                  <span 
                    v-else
                    class="text-[9px] sm:text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                    :class="b.status === 'Active' || !b.status ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/20' : 'bg-surface-container-high text-on-surface-variant'"
                  >
                    {{ b.status || $t('common.active') }}
                  </span>
                </div>
              </div>

              <!-- Branch Name -->
              <h3 class="text-base sm:text-lg font-black text-on-surface group-hover:text-primary transition-colors leading-tight mb-2 sm:mb-2.5">
                {{ b.name }}
              </h3>

              <!-- Branch Details -->
              <div class="space-y-1.5 text-[11px] sm:text-xs text-on-surface-variant font-medium">
                <div class="flex items-start gap-1.5">
                  <MapPin class="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                  <span class="leading-relaxed">{{ b.location || $t('selectBranch.mainPremises') }}</span>
                </div>
                <div v-if="b.phone" class="flex items-center gap-1.5">
                  <Phone class="w-3.5 h-3.5 text-outline shrink-0" />
                  <span>{{ b.phone }}</span>
                </div>
                <div v-if="b.email" class="flex items-center gap-1.5">
                  <Mail class="w-3.5 h-3.5 text-outline shrink-0" />
                  <span class="truncate">{{ b.email }}</span>
                </div>
              </div>
            </div>

            <!-- Select Button Footer -->
            <div class="mt-4 pt-3 border-t border-outline-variant/50 flex items-center justify-between">
              <span class="text-[11px] sm:text-xs font-bold text-primary group-hover:underline">
                <template v-if="selectingBranchId === b.id">
                  {{ $t('selectBranch.verifyingLicense') }}
                </template>
                <template v-else-if="activeBranchId === b.id">
                  {{ $t('selectBranch.alreadySelected') }}
                </template>
                <template v-else>
                  {{ $t('selectBranch.selectThisBranch') }}
                </template>
              </span>
              <div 
                class="w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-full flex items-center justify-center transition-all group-hover:translate-x-0.5 shadow-2xs"
                :class="activeBranchId === b.id ? 'bg-primary text-white' : 'bg-surface-container text-on-surface-variant group-hover:bg-primary group-hover:text-white'"
              >
                <Loader2 v-if="selectingBranchId === b.id" class="w-3.5 h-3.5 animate-spin" />
                <ArrowRight v-else class="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>

        <!-- Add New Branch Card -->
        <div 
          @click="showCreateBranchModal = true"
          class="group bg-surface-container-lowest hover:bg-surface-container-lowest border-2 border-dashed border-outline-variant hover:border-primary rounded-xl sm:rounded-2xl shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between cursor-pointer relative overflow-hidden"
        >
          <!-- Top Clean 2D Shop Canopy / Awning -->
          <div class="relative w-full">
            <div class="h-2.5 w-full flex">
              <div v-for="s in 8" :key="s" class="flex-1" :class="s % 2 === 0 ? 'bg-primary/40' : 'bg-primary/15'"></div>
            </div>
            <div class="flex w-full -mt-0.5">
              <div 
                v-for="s in 8" 
                :key="s" 
                class="flex-1 h-1.5 rounded-b-full shadow-2xs" 
                :class="s % 2 === 0 ? 'bg-primary/40' : 'bg-primary/15'"
              ></div>
            </div>
          </div>

          <!-- Card Content Body -->
          <div class="p-4 sm:p-5 flex-1 flex flex-col justify-between">
            <div>
              <!-- Plus Icon & New Badge Header -->
              <div class="flex items-start justify-between gap-2.5 mb-3">
                <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-2xs shrink-0">
                  <Plus class="w-4.5 h-4.5 sm:w-5 sm:h-5 stroke-[2.5px]" />
                </div>

                <span class="text-[9px] sm:text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  + New
                </span>
              </div>

              <!-- Title -->
              <h3 class="text-base sm:text-lg font-black text-on-surface group-hover:text-primary transition-colors leading-tight mb-2 sm:mb-2.5">
                {{ $t('selectBranch.addNewBranch') }}
              </h3>

              <!-- Description -->
              <div class="space-y-1.5 text-[11px] sm:text-xs text-on-surface-variant font-medium">
                <p class="leading-relaxed">
                  {{ $t('selectBranch.addNewBranchDesc') }}
                </p>
              </div>
            </div>

            <!-- Footer Action Button -->
            <div class="mt-4 pt-3 border-t border-outline-variant/50 flex items-center justify-between">
              <span class="text-[11px] sm:text-xs font-bold text-primary group-hover:underline">
                {{ $t('selectBranch.addNewBranch') }}
              </span>
              <div class="w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-full flex items-center justify-center transition-all group-hover:rotate-90 bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white shadow-2xs">
                <Plus class="w-3.5 h-3.5 stroke-[2.5px]" />
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
import type { StoreBranch } from '../models/types';
import { t, currentLocale } from '../i18n';
import { 
  Store, 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  ArrowRight, 
  LogOut, 
  Search,
  CheckCircle2,
  Loader2,
  Plus
} from 'lucide-vue-next';

const router = useRouter();
const { activeBranchId, setActiveBranch, handleLogout: performLogout } = useAppViewModel();

const adminName = ref(localStorage.getItem('cashierName') || 'Admin');

const timeGreeting = computed(() => {
  // Access currentLocale.value to trigger reactivity on language change
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

const loadBranches = async () => {
  isLoading.value = true;
  const storeId = localStorage.getItem('storeId');
  if (!storeId) {
    isLoading.value = false;
    return;
  }

  try {
    let res = await api.get<StoreBranch[]>(`/api/stores/${storeId}/branches`);
    if (!res || !Array.isArray(res) || res.length === 0) {
      const storeObj = await api.get<any>(`/api/stores/${storeId}`);
      if (storeObj && storeObj.branches) {
        res = storeObj.branches;
      }
    }
    branches.value = Array.isArray(res) ? res : [];
  } catch (err) {
    console.error('Error loading admin branches:', err);
    branches.value = [];
  } finally {
    isLoading.value = false;
  }
};

const handleBranchCreated = async (newBranch: StoreBranch) => {
  await loadBranches();
};

const selectBranch = async (b: StoreBranch) => {
  if (selectingBranchId.value) return;
  selectingBranchId.value = b.id;

  try {
    const license = await api.get(`/api/stores/branches/${b.id}/license`, { suppressToast: true });
    const status = (license?.status || '').toUpperCase();

    if (!license || status !== 'ACTIVE') {
      modalBranchId.value = b.id;
      showLicenseModal.value = true;
      selectingBranchId.value = null;
      return;
    }

    showToast(t('selectBranch.branchVerifiedToast', { name: b.name }), 'success');
    localStorage.setItem('branchName', b.name);
    await setActiveBranch(b.id, b.name);
    router.push('/dashboard');
  } catch (err: any) {
    modalBranchId.value = b.id;
    showLicenseModal.value = true;
  } finally {
    selectingBranchId.value = null;
  }
};

const handleLogout = () => {
  performLogout();
};

onMounted(() => {
  const role = localStorage.getItem('cashierRole');
  if (role !== 'ADMIN') {
    router.replace(role === 'CASHIER' ? '/checkout' : '/dashboard');
    return;
  }
  loadBranches();
});
</script>
