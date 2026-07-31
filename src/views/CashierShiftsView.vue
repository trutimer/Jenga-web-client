<template>
  <div class="flex flex-col gap-6 font-sans pb-12">
    <!-- Header with Back Button -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <button 
          @click="goBack"
          class="w-10 h-10 bg-surface-container-low border border-outline-variant rounded-xl flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface transition-colors cursor-pointer shadow-sm"
        >
          <ArrowLeft class="w-5 h-5" />
        </button>
        <div>
          <h1 class="text-2xl font-black text-on-surface tracking-tight flex items-center gap-2">
            <span>Cashier Shifts</span>
            <span v-if="cashier" class="text-base font-normal text-on-surface-variant">({{ cashier.fullName }})</span>
          </h1>
          <p class="text-sm text-on-surface-variant mt-0.5">Historical register shifts and reconciliation records</p>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="py-16 flex justify-center">
      <div class="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>

    <div v-else class="flex flex-col gap-6">
      
      <!-- Summary KPIs Banner -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div class="bg-surface rounded-2xl border border-outline-variant p-5 shadow-sm flex flex-col gap-1">
          <span class="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Total Shifts</span>
          <span class="text-2xl font-black text-on-surface font-mono">{{ shifts.length }}</span>
        </div>
        <div class="bg-surface rounded-2xl border border-outline-variant p-5 shadow-sm flex flex-col gap-1">
          <span class="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Active Shift</span>
          <span class="text-xl font-bold font-mono flex items-center gap-2" :class="activeShift ? 'text-emerald-600' : 'text-on-surface-variant'">
            <span class="w-2.5 h-2.5 rounded-full" :class="activeShift ? 'bg-emerald-500 animate-pulse' : 'bg-outline-variant'"></span>
            {{ activeShift ? 'OPEN NOW' : 'None Open' }}
          </span>
        </div>
        <div class="bg-surface rounded-2xl border border-outline-variant p-5 shadow-sm flex flex-col gap-1">
          <span class="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Cumulative Sales</span>
          <span class="text-2xl font-black text-primary font-mono">{{ formatCurrency(totalSalesSum) }}</span>
        </div>
        <div class="bg-surface rounded-2xl border border-outline-variant p-5 shadow-sm flex flex-col gap-1">
          <span class="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Net Discrepancies</span>
          <span 
            class="text-2xl font-black font-mono"
            :class="totalDiscrepancySum === 0 ? 'text-success' : totalDiscrepancySum < 0 ? 'text-error' : 'text-warning'"
          >
            {{ formatCurrency(totalDiscrepancySum) }}
          </span>
        </div>
      </div>

      <!-- Filters & Controls -->
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4 bg-surface rounded-2xl border border-outline-variant p-4 shadow-sm">
        <div class="relative w-full sm:w-80">
          <Search class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant" />
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Search by Shift ID or date..."
            class="w-full bg-surface-container-lowest border border-outline-variant rounded-xl pl-10 pr-4 py-2 text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        <div class="flex items-center gap-2 w-full sm:w-auto">
          <span class="text-xs font-bold text-on-surface-variant uppercase tracking-wider whitespace-nowrap">Filter Status:</span>
          <select 
            v-model="statusFilter"
            class="bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-2 text-sm font-medium text-on-surface focus:outline-none focus:border-primary transition-colors cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="OPEN">Open Only</option>
            <option value="CLOSED">Closed Only</option>
          </select>
        </div>
      </div>

      <!-- Shifts Table -->
      <div class="bg-surface rounded-2xl border border-outline-variant shadow-sm overflow-hidden flex flex-col">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm whitespace-nowrap">
            <thead class="bg-surface-container-low text-xs uppercase text-on-surface-variant font-mono tracking-wider border-b border-outline-variant">
              <tr>
                <th class="px-5 py-4">Shift ID</th>
                <th class="px-5 py-4">Opened At</th>
                <th class="px-5 py-4">Closed At</th>
                <th class="px-5 py-4 text-center">Status</th>
                <th class="px-5 py-4 text-right">Opening Cash</th>
                <th class="px-5 py-4 text-right">Total Sales</th>
                <th class="px-5 py-4 text-right">Actual Cash</th>
                <th class="px-5 py-4 text-right">Discrepancy</th>
                <th class="px-5 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-outline-variant bg-surface-container-lowest">
              <tr v-if="filteredShifts.length === 0">
                <td colspan="9" class="px-5 py-12 text-center text-on-surface-variant text-sm italic">
                  No shifts found matching your criteria.
                </td>
              </tr>
              <tr 
                v-for="shift in filteredShifts" 
                :key="shift.id" 
                @click="router.push(`/shifts/${shift.id}`)"
                class="hover:bg-primary-container/10 transition-colors cursor-pointer group"
              >
                <td class="px-5 py-4 font-mono text-xs font-bold text-on-surface group-hover:text-primary transition-colors">
                  #{{ shift.id.substring(0, 8).toUpperCase() }}
                </td>
                <td class="px-5 py-4 font-mono text-xs text-on-surface">
                  {{ formatDate(shift.openedAt) }}
                </td>
                <td class="px-5 py-4 font-mono text-xs text-on-surface-variant">
                  {{ shift.closedAt ? formatDate(shift.closedAt) : 'Still Active' }}
                </td>
                <td class="px-5 py-4 text-center">
                  <span 
                    class="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border"
                    :class="shift.status === 'OPEN' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-surface-container-high text-on-surface-variant border-outline-variant'"
                  >
                    {{ shift.status }}
                  </span>
                </td>
                <td class="px-5 py-4 text-right font-mono text-xs text-on-surface-variant">
                  {{ formatCurrency(shift.openingCash) }}
                </td>
                <td class="px-5 py-4 text-right font-mono text-xs font-bold text-primary">
                  {{ formatCurrency(shift.totalSales) }}
                </td>
                <td class="px-5 py-4 text-right font-mono text-xs font-semibold text-on-surface">
                  {{ shift.actualCash != null ? formatCurrency(shift.actualCash) : '-' }}
                </td>
                <td class="px-5 py-4 text-right font-mono text-xs font-bold">
                  <span v-if="shift.discrepancy != null" :class="shift.discrepancy === 0 ? 'text-success' : shift.discrepancy < 0 ? 'text-error' : 'text-warning'">
                    {{ formatCurrency(shift.discrepancy) }}
                  </span>
                  <span v-else class="text-on-surface-variant/40">-</span>
                </td>
                <td class="px-5 py-4 text-right">
                  <button 
                    @click.stop="router.push(`/shifts/${shift.id}`)"
                    class="px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 font-bold text-xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Eye class="w-3.5 h-3.5" />
                    <span>View Overview</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ArrowLeft, Clock, Search, Eye, Filter } from 'lucide-vue-next';
import { useUserViewModel } from '../viewmodels/useUserViewModel';
import type { AppUser, CashierShift } from '../models/types';
import { formatCurrency } from '../models/mockData';

const route = useRoute();
const router = useRouter();
const { fetchUserById, fetchShiftsByCashier, isLoading } = useUserViewModel();

const cashierId = computed(() => route.params.id as string);
const cashier = ref<AppUser | null>(null);
const shifts = ref<CashierShift[]>([]);
const searchQuery = ref('');
const statusFilter = ref<'ALL' | 'OPEN' | 'CLOSED'>('ALL');

onMounted(async () => {
  if (cashierId.value) {
    const userRes = await fetchUserById(cashierId.value);
    if (userRes) {
      cashier.value = userRes;
    }
    const shiftsRes = await fetchShiftsByCashier(cashierId.value);
    shifts.value = shiftsRes;
  }
});

const goBack = () => {
  if (cashierId.value) {
    router.push(`/users/${cashierId.value}`);
  } else {
    router.push('/users');
  }
};

const activeShift = computed(() => {
  return shifts.value.find(s => s.status === 'OPEN') || null;
});

const totalSalesSum = computed(() => {
  return shifts.value.reduce((sum, s) => sum + (s.totalSales || 0), 0);
});

const totalDiscrepancySum = computed(() => {
  return shifts.value.reduce((sum, s) => sum + (s.discrepancy || 0), 0);
});

const filteredShifts = computed(() => {
  return shifts.value.filter(shift => {
    // Status filter
    if (statusFilter.value !== 'ALL' && shift.status !== statusFilter.value) {
      return false;
    }
    // Search query
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase().trim();
      const idMatch = shift.id.toLowerCase().includes(q);
      const dateMatch = formatDate(shift.openedAt).toLowerCase().includes(q);
      const notesMatch = shift.notes ? shift.notes.toLowerCase().includes(q) : false;
      return idMatch || dateMatch || notesMatch;
    }
    return true;
  });
});

const formatDate = (isoString: string) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date);
};
</script>
