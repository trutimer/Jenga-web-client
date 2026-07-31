<template>
  <div class="min-h-screen w-full bg-surface-container-high text-on-surface font-sans antialiased relative overflow-x-hidden flex flex-col justify-between selection:bg-primary selection:text-on-primary">
    <!-- Ambient Background Gradients -->
    <div class="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))] pointer-events-none" />
    <div class="absolute -top-40 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
    <div class="absolute -bottom-40 -right-40 w-96 h-96 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />

    <!-- Top Navigation / Header -->
    <header class="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-primary-container text-primary rounded-xl flex items-center justify-center shadow-sm">
          <Store class="w-6 h-6 stroke-[2px]" />
        </div>
        <div>
          <h1 class="text-xl font-black text-primary tracking-tight">Jenga POS</h1>
          <p class="text-xs font-semibold text-on-surface-variant font-mono uppercase tracking-wider">Store Administration</p>
        </div>
      </div>

      <button 
        @click="handleLogout"
        class="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container-lowest border border-outline-variant hover:bg-error-container/20 hover:border-error/30 hover:text-error text-on-surface-variant text-xs font-bold transition-all cursor-pointer shadow-sm"
        title="Sign Out"
      >
        <LogOut class="w-4 h-4" />
        <span>Logout</span>
      </button>
    </header>

    <!-- Main Content Container -->
    <main class="relative z-10 w-full max-w-6xl mx-auto px-6 py-8 flex-1 flex flex-col justify-center">
      <!-- Title & Greeting Section -->
      <div class="text-center max-w-2xl mx-auto space-y-3 mb-10 animate-fade-down">
        <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-container/30 border border-primary/20 text-primary text-xs font-bold font-mono uppercase tracking-widest mb-1">
          <Building2 class="w-3.5 h-3.5" />
          <span>Branch Selection</span>
        </div>
        <h2 class="text-3xl md:text-4xl font-black text-on-surface tracking-tight leading-tight">
          Welcome, {{ adminName || 'Admin' }} 👋
        </h2>
        <p class="text-sm text-on-surface-variant leading-relaxed">
          Please choose which store branch you would like to view and manage for this session. You can switch branches anytime from your dashboard.
        </p>

        <!-- Branch Search Bar (shown if multiple branches) -->
        <div v-if="branches.length > 2" class="pt-4 max-w-md mx-auto">
          <div class="relative flex items-center">
            <Search class="w-4 h-4 text-on-surface-variant absolute left-4 pointer-events-none" />
            <input 
              v-model="searchQuery"
              type="text" 
              placeholder="Search branch name or location..." 
              class="w-full h-11 pl-11 pr-4 bg-surface-container-lowest border border-outline-variant rounded-xl text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-medium"
            />
          </div>
        </div>
      </div>

      <!-- Loading State Skeleton -->
      <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto w-full">
        <div v-for="i in 3" :key="i" class="h-56 bg-surface-container-lowest/60 border border-outline-variant/50 rounded-2xl p-6 animate-pulse flex flex-col justify-between">
          <div class="space-y-3">
            <div class="w-12 h-12 bg-surface-container-high rounded-xl" />
            <div class="w-2/3 h-5 bg-surface-container-high rounded" />
            <div class="w-1/2 h-4 bg-surface-container-high rounded" />
          </div>
          <div class="w-full h-10 bg-surface-container-high rounded-xl mt-4" />
        </div>
      </div>

      <!-- Branch List Grid -->
      <div v-else-if="filteredBranches.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto w-full animate-fade-up">
        <div 
          v-for="b in filteredBranches" 
          :key="b.id"
          @click="selectBranch(b)"
          class="group bg-surface-container-lowest hover:bg-surface-container-lowest border border-outline-variant hover:border-primary/50 rounded-2xl p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between cursor-pointer relative overflow-hidden"
          :class="activeBranchId === b.id ? 'ring-2 ring-primary border-primary bg-primary-container/10' : ''"
        >
          <!-- Active Indicator Badge -->
          <div v-if="activeBranchId === b.id" class="absolute top-4 right-4 bg-primary text-on-primary text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
            <CheckCircle2 class="w-3 h-3" />
            <span>Current</span>
          </div>

          <div>
            <!-- Branch Icon & Status Header -->
            <div class="flex items-center justify-between mb-5">
              <div class="w-12 h-12 rounded-xl bg-primary-container/20 text-primary flex items-center justify-center group-hover:scale-110 group-hover:bg-primary group-hover:text-on-primary transition-all duration-300 shadow-inner">
                <Building2 class="w-6 h-6 stroke-[2px]" />
              </div>
              <span 
                v-if="activeBranchId !== b.id"
                class="text-[11px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
                :class="b.status === 'Active' || !b.status ? 'bg-success-container/30 text-success' : 'bg-surface-container-high text-on-surface-variant'"
              >
                {{ b.status || 'Active' }}
              </span>
            </div>

            <!-- Branch Main Info -->
            <h3 class="text-xl font-extrabold text-on-surface group-hover:text-primary transition-colors leading-tight mb-2">
              {{ b.name }}
            </h3>

            <div class="space-y-1.5 text-xs text-on-surface-variant font-medium">
              <div class="flex items-center gap-2">
                <MapPin class="w-3.5 h-3.5 text-primary shrink-0" />
                <span class="truncate">{{ b.location || 'Main Premises' }}</span>
              </div>
              <div v-if="b.phone" class="flex items-center gap-2">
                <Phone class="w-3.5 h-3.5 text-on-surface-variant/70 shrink-0" />
                <span>{{ b.phone }}</span>
              </div>
              <div v-if="b.email" class="flex items-center gap-2">
                <Mail class="w-3.5 h-3.5 text-on-surface-variant/70 shrink-0" />
                <span class="truncate">{{ b.email }}</span>
              </div>
            </div>
          </div>

          <!-- Select Button Footer -->
          <div class="mt-6 pt-4 border-t border-outline-variant/40 flex items-center justify-between">
            <span class="text-xs font-bold text-primary group-hover:underline">
              {{ activeBranchId === b.id ? 'Already Selected' : 'Select this Branch' }}
            </span>
            <div class="w-8 h-8 rounded-full bg-surface-container group-hover:bg-primary group-hover:text-on-primary flex items-center justify-center text-on-surface-variant transition-all group-hover:translate-x-1">
              <ArrowRight class="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-12 px-6 bg-surface-container-lowest border border-outline-variant rounded-2xl max-w-md mx-auto shadow-sm space-y-4">
        <div class="w-14 h-14 bg-error-container/30 text-error rounded-full flex items-center justify-center mx-auto">
          <Building2 class="w-7 h-7" />
        </div>
        <div>
          <h3 class="text-lg font-bold text-on-surface">No Branches Found</h3>
          <p class="text-xs text-on-surface-variant mt-1">
            {{ searchQuery ? 'No branch matching your search term.' : 'Your store does not have any branches setup yet.' }}
          </p>
        </div>
        <button 
          @click="loadBranches" 
          class="px-4 py-2 bg-primary text-on-primary rounded-xl text-xs font-bold hover:bg-primary/90 transition-all cursor-pointer"
        >
          Refresh List
        </button>
      </div>
    </main>

    <!-- Footer -->
    <footer class="relative z-10 w-full py-4 text-center text-xs text-on-surface-variant/70 font-mono">
      Jenga POS Management • Admin Control Portal
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { api } from '../services/api';
import { useAppViewModel } from '../viewmodels/useAppViewModel';
import type { StoreBranch } from '../models/types';
import { 
  Store, 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  ArrowRight, 
  LogOut, 
  Search,
  CheckCircle2
} from 'lucide-vue-next';

const router = useRouter();
const { activeBranchId, setActiveBranch, handleLogout: performLogout } = useAppViewModel();

const adminName = ref(localStorage.getItem('cashierName') || 'Admin');
const branches = ref<StoreBranch[]>([]);
const isLoading = ref(true);
const searchQuery = ref('');

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
    // Try primary branch list endpoint
    let res = await api.get<StoreBranch[]>(`/api/stores/${storeId}/branches`);
    if (!res || !Array.isArray(res) || res.length === 0) {
      // Fallback to fetching store object which includes branches array
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

const selectBranch = async (b: StoreBranch) => {
  await setActiveBranch(b.id);
  router.push('/dashboard');
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
