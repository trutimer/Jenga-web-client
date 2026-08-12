<template>
  <div class="max-w-7xl mx-auto space-y-6 pb-20 animate-fade-up font-sans">
    <!-- Header with Back Button and Date Filter -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline-variant/60 pb-5">
      <div>
        <button 
          @click="router.push('/dashboard')"
          class="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary/80 transition-colors mb-2 cursor-pointer bg-transparent border-0 p-0"
        >
          <ArrowLeft class="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>
        <h2 class="text-3xl font-black text-on-background tracking-tight flex items-center gap-2.5">
          <Trophy class="w-7 h-7 text-amber-500" />
          <span>Top Selling Products Leaderboard</span>
        </h2>
        <p class="text-sm font-semibold text-on-surface-variant mt-1">
          Real-time rank and volume sales performance across your store branch catalog.
        </p>
      </div>

      <!-- Date Filter Controls -->
      <div class="flex flex-wrap items-center gap-2.5 bg-surface-container-lowest p-2.5 rounded-xl border border-outline-variant shadow-xs">
        <div class="flex items-center gap-2 bg-surface-container-low px-3 py-1.5 rounded-lg border border-outline-variant">
          <Calendar class="w-4 h-4 text-primary shrink-0" />
          <input 
            type="date"
            v-model="selectedDate"
            @change="fetchTopSelling"
            class="bg-transparent text-xs font-mono font-bold text-on-surface outline-none cursor-pointer"
          />
        </div>

        <button
          @click="setToday"
          class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border-0"
          :class="selectedDate === todayStr ? 'bg-primary text-on-primary shadow-xs' : 'bg-surface-container-low hover:bg-surface-container-high text-on-surface-variant'"
        >
          Today
        </button>

        <button
          @click="setYesterday"
          class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border-0"
          :class="selectedDate === yesterdayStr ? 'bg-primary text-on-primary shadow-xs' : 'bg-surface-container-low hover:bg-surface-container-high text-on-surface-variant'"
        >
          Yesterday
        </button>

        <button
          @click="clearDateFilter"
          class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border-0"
          :class="!selectedDate ? 'bg-primary text-on-primary shadow-xs' : 'bg-surface-container-low hover:bg-surface-container-high text-on-surface-variant'"
          title="Fetch top sellers across default period"
        >
          All-Time / Default
        </button>

        <button 
          @click="fetchTopSelling"
          class="p-2 rounded-lg bg-surface-container-low hover:bg-surface-container-high text-on-surface-variant transition-colors cursor-pointer border-0"
          title="Refresh Data"
        >
          <RotateCcw class="w-4 h-4" :class="{ 'animate-spin': isLoading }" />
        </button>
      </div>
    </div>

    <!-- Bento KPI Summary Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      
      <!-- Top 1 Product KPI -->
      <div class="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant shadow-sm relative overflow-hidden flex flex-col justify-between group hover:border-amber-500/50 transition-all">
        <div class="absolute -right-4 -top-4 w-16 h-16 bg-amber-500/10 rounded-full group-hover:scale-125 transition-transform"></div>
        <div class="flex justify-between items-start mb-3 relative z-10">
          <span class="text-[10px] font-mono font-bold uppercase tracking-widest text-on-surface-variant">#1 Top Seller</span>
          <span class="p-1.5 rounded-lg bg-amber-500/15 text-amber-600 font-bold text-xs flex items-center gap-1">
            <Crown class="w-4 h-4 fill-amber-500" />
            <span>Leader</span>
          </span>
        </div>
        <div class="relative z-10">
          <p class="text-lg font-black text-on-surface truncate">{{ topProduct?.name || 'No Sales Yet' }}</p>
          <div class="flex items-center justify-between text-xs mt-2 font-mono">
            <span class="text-amber-600 font-bold">{{ topProduct ? topProduct.totalSold + ' Units Sold' : '-' }}</span>
            <span class="text-on-surface-variant font-semibold">{{ topProduct ? formatCurrency(topProductRevenue, currency) : '-' }}</span>
          </div>
        </div>
      </div>

      <!-- Total Units Sold KPI -->
      <div class="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant shadow-sm flex flex-col justify-between">
        <div class="flex justify-between items-start mb-3">
          <span class="text-[10px] font-mono font-bold uppercase tracking-widest text-on-surface-variant">Total Volume Sold</span>
          <span class="p-1.5 rounded-lg bg-primary-container/30 text-primary">
            <Package class="w-4 h-4" />
          </span>
        </div>
        <div>
          <div class="text-3xl font-black font-mono text-on-surface leading-tight">{{ totalUnitsSold }}</div>
          <p class="text-xs text-on-surface-variant font-medium mt-1">Cumulative units across leaderboard</p>
        </div>
      </div>

      <!-- Total Revenue KPI -->
      <div class="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant shadow-sm flex flex-col justify-between">
        <div class="flex justify-between items-start mb-3">
          <span class="text-[10px] font-mono font-bold uppercase tracking-widest text-on-surface-variant">Top Sales Revenue</span>
          <span class="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-600">
            <TrendingUp class="w-4 h-4" />
          </span>
        </div>
        <div>
          <div class="text-3xl font-black font-mono text-emerald-600 leading-tight">{{ formatCurrency(totalRevenue, currency) }}</div>
          <p class="text-xs text-on-surface-variant font-medium mt-1">Generated sales revenue</p>
        </div>
      </div>

      <!-- Active Catalog Share -->
      <div class="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant shadow-sm flex flex-col justify-between">
        <div class="flex justify-between items-start mb-3">
          <span class="text-[10px] font-mono font-bold uppercase tracking-widest text-on-surface-variant">Ranked Products</span>
          <span class="p-1.5 rounded-lg bg-surface-container-high text-on-surface-variant">
            <ShoppingBag class="w-4 h-4" />
          </span>
        </div>
        <div>
          <div class="text-3xl font-black font-mono text-on-surface leading-tight">{{ topSellingProducts.length }}</div>
          <p class="text-xs text-on-surface-variant font-medium mt-1">High-velocity catalog items</p>
        </div>
      </div>

    </div>

    <!-- Top 3 Champions Podium Cards -->
    <div v-if="topSellingProducts.length >= 1" class="space-y-3 select-none">
      <h3 class="text-sm font-mono font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-2">
        <Sparkles class="w-4 h-4 text-amber-500" />
        <span>Top 3 Sales Champions</span>
      </h3>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div 
          v-for="(product, idx) in top3Products" 
          :key="product.id"
          class="bg-surface-container-lowest rounded-2xl p-6 border shadow-sm relative overflow-hidden flex flex-col justify-between transition-all hover:shadow-md"
          :class="getPodiumCardBorder(idx)"
        >
          <!-- Rank Badge Tag -->
          <div class="flex items-center justify-between mb-4">
            <span 
              class="px-3 py-1 rounded-full text-xs font-mono font-black flex items-center gap-1.5 border shadow-2xs"
              :class="getPodiumBadgeClass(idx)"
            >
              <span>{{ getPodiumRankIcon(idx) }}</span>
              <span>RANK #{{ idx + 1 }}</span>
            </span>

            <span 
              class="px-2.5 py-0.5 rounded-full text-[10px] font-bold border"
              :class="getStockBadgeClass(product)"
            >
              {{ getStockStatusText(product) }}
            </span>
          </div>

          <!-- Product Details -->
          <div>
            <h4 class="text-base font-black text-on-surface leading-snug line-clamp-1">{{ product.name }}</h4>
            <div class="flex items-center gap-2 text-xs text-on-surface-variant font-mono mt-1">
              <span>Category: {{ product.categoryName || 'General' }}</span>
              <span v-if="product.barcode">• {{ product.barcode }}</span>
            </div>
          </div>

          <!-- Metrics Row -->
          <div class="mt-6 pt-4 border-t border-outline-variant/50 flex justify-between items-end">
            <div>
              <span class="text-[10px] font-mono font-bold uppercase text-on-surface-variant block">Volume Sold</span>
              <span class="text-xl font-black font-mono text-primary">{{ product.totalSold }} {{ product.unitOfMeasure || 'PCS' }}</span>
            </div>
            <div class="text-right">
              <span class="text-[10px] font-mono font-bold uppercase text-on-surface-variant block">Revenue</span>
              <span class="text-sm font-black font-mono text-emerald-600">{{ formatCurrency((product.totalSold || 0) * (product.sellingPrice || 0), currency) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Table Container -->
    <div class="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-sm overflow-hidden flex flex-col">
      <!-- Table Header Bar -->
      <div class="p-4 bg-surface-container-low border-b border-outline-variant flex flex-col sm:flex-row justify-between items-center gap-4">
        <div class="flex items-center gap-2">
          <span class="text-xs font-mono font-bold uppercase tracking-wider text-on-surface-variant">Complete Top Sellers Table</span>
          <span class="text-[11px] font-mono text-outline font-semibold bg-surface-container-high px-2 py-0.5 rounded-full">
            {{ filteredList.length }} Items
          </span>
        </div>

        <!-- Search Bar & Export Button -->
        <div class="flex items-center gap-3 w-full sm:w-auto">
          <div class="relative flex-1 sm:w-64">
            <Search class="w-4 h-4 absolute left-3 top-2.5 text-on-surface-variant" />
            <input 
              type="text"
              v-model="searchQuery"
              placeholder="Search product, barcode..."
              class="w-full bg-surface-container-lowest border border-outline-variant rounded-lg pl-9 pr-3 py-2 text-xs font-semibold outline-none focus:border-primary text-on-surface"
            />
          </div>

          <button
            @click="exportCsv"
            class="px-3.5 py-2 rounded-lg bg-primary text-on-primary text-xs font-bold hover:bg-primary/95 transition-all cursor-pointer border-0 shadow-2xs flex items-center gap-1.5"
          >
            <Download class="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      <!-- Table Body -->
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs select-none">
          <thead class="bg-[#f0f3f0] text-[10px] font-mono uppercase font-bold text-on-surface-variant border-b border-outline-variant">
            <tr>
              <th class="p-4 pl-6 text-center w-16">Rank</th>
              <th class="p-4">Product Details</th>
              <th class="p-4">Category</th>
              <th class="p-4 text-center">Units Sold</th>
              <th class="p-4 text-right">Selling Price</th>
              <th class="p-4 text-right">Total Revenue</th>
              <th class="p-4 text-center">Stock Level</th>
              <th class="p-4 text-center">Stock Status</th>
              <th class="p-4 text-center pr-6">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-surface-variant">
            <template v-if="isLoading">
              <tr v-for="i in 5" :key="i" class="animate-pulse">
                <td colspan="9" class="p-4">
                  <div class="h-4 bg-surface-container-high rounded w-full"></div>
                </td>
              </tr>
            </template>

            <template v-else-if="filteredList.length > 0">
              <tr 
                v-for="(p, index) in filteredList" 
                :key="p.id"
                class="hover:bg-surface-container-high/50 transition-colors font-sans text-sm"
              >
                <!-- Rank -->
                <td class="p-4 pl-6 text-center">
                  <span 
                    class="w-7 h-7 rounded-full inline-flex items-center justify-center font-mono font-black text-xs border"
                    :class="getRankTableBadgeClass(index)"
                  >
                    #{{ index + 1 }}
                  </span>
                </td>

                <!-- Product Details -->
                <td class="p-4">
                  <span class="font-bold text-on-surface block">{{ p.name }}</span>
                  <span class="font-mono text-[10px] text-on-surface-variant/60 block mt-0.5">
                    {{ p.barcode || 'NO BARCODE' }} {{ p.sku ? '• SKU: ' + p.sku : '' }}
                  </span>
                </td>

                <!-- Category -->
                <td class="p-4 font-semibold text-on-surface-variant">
                  {{ p.categoryName || 'General' }}
                </td>

                <!-- Units Sold -->
                <td class="p-4 text-center font-mono font-black text-primary text-base">
                  {{ p.totalSold }} <span class="text-[10px] font-normal text-on-surface-variant">{{ p.unitOfMeasure || 'PCS' }}</span>
                </td>

                <!-- Selling Price -->
                <td class="p-4 text-right font-mono text-on-surface-variant">
                  {{ formatCurrency(p.sellingPrice || 0, currency) }}
                </td>

                <!-- Revenue -->
                <td class="p-4 text-right font-mono font-black text-emerald-600">
                  {{ formatCurrency((p.totalSold || 0) * (p.sellingPrice || 0), currency) }}
                </td>

                <!-- Stock Level -->
                <td class="p-4 text-center font-mono font-bold" :class="(p.stock || 0) <= (p.reorderLevel || 10) ? 'text-tertiary' : 'text-on-surface'">
                  {{ p.stock || 0 }} <span class="text-[10px] text-outline font-normal">/ {{ p.reorderLevel || 10 }}</span>
                </td>

                <!-- Stock Status -->
                <td class="p-4 text-center">
                  <span 
                    class="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-bold rounded-full border"
                    :class="getStockBadgeClass(p)"
                  >
                    {{ getStockStatusText(p) }}
                  </span>
                </td>

                <!-- Action Button -->
                <td class="p-4 text-center pr-6 whitespace-nowrap">
                  <button 
                    @click="router.push('/inventory')"
                    class="p-1.5 hover:bg-surface-container rounded-lg text-primary hover:text-primary/80 transition-colors cursor-pointer border-0 bg-transparent"
                    title="View in Inventory"
                  >
                    <ExternalLink class="w-4.5 h-4.5" />
                  </button>
                </td>
              </tr>
            </template>

            <!-- Empty State -->
            <template v-else>
              <tr>
                <td colspan="9" class="p-12 text-center select-none text-on-surface-variant">
                  <ShoppingBag class="w-10 h-10 mx-auto text-outline-variant mb-3 stroke-[1.5px]" />
                  <p class="font-bold text-base text-on-surface">No Top Selling Products Found</p>
                  <p class="text-xs text-outline mt-1">No product sales recorded for {{ selectedDate ? selectedDate : 'the selected period' }}.</p>
                  <button 
                    @click="clearDateFilter"
                    class="text-xs font-bold underline mt-3 cursor-pointer bg-transparent border-0 text-primary"
                  >
                    Reset date filter
                  </button>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAppViewModel } from '../viewmodels/useAppViewModel';
import { formatCurrency } from '../models/mockData';
import { showToast } from '../services/toastService';
import { api } from '../services/api';
import type { TopSellingProduct } from '../models/types';
import { 
  ArrowLeft, 
  Trophy, 
  Calendar, 
  RotateCcw, 
  Crown, 
  Package, 
  TrendingUp, 
  ShoppingBag, 
  Sparkles, 
  Search, 
  Download, 
  ExternalLink 
} from 'lucide-vue-next';

const router = useRouter();
const vm = useAppViewModel();

const getTodayString = () => new Date().toISOString().split('T')[0]!;
const getYesterdayString = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0]!;
};

const todayStr = getTodayString();
const yesterdayStr = getYesterdayString();

const selectedDate = ref<string>(todayStr);
const searchQuery = ref<string>('');
const isLoading = ref<boolean>(false);
const topSellingProducts = ref<TopSellingProduct[]>([]);

const currency = computed(() => vm.settings.value.currency);

const fetchTopSelling = async () => {
  isLoading.value = true;
  try {
    const branchId = localStorage.getItem('branchId');
    let url = `/api/products/top-selling?page=0&size=10`;
    if (branchId && branchId !== 'null' && branchId !== 'undefined') {
      url += `&storeBranchId=${encodeURIComponent(branchId)}`;
    }
    if (selectedDate.value) {
      url += `&date=${encodeURIComponent(selectedDate.value)}`;
    }

    const res = await api.get<any>(url);
    if (res && Array.isArray(res.content)) {
      topSellingProducts.value = res.content;
    } else if (Array.isArray(res)) {
      topSellingProducts.value = res;
    } else {
      topSellingProducts.value = [];
    }
  } catch (err: any) {
    console.error('Failed to fetch top selling products:', err);
    showToast(err.message || 'Failed to fetch top selling products', 'error');
    topSellingProducts.value = [];
  } finally {
    isLoading.value = false;
  }
};

const setToday = () => {
  selectedDate.value = todayStr;
  fetchTopSelling();
};

const setYesterday = () => {
  selectedDate.value = yesterdayStr;
  fetchTopSelling();
};

const clearDateFilter = () => {
  selectedDate.value = '';
  fetchTopSelling();
};

const filteredList = computed(() => {
  if (!searchQuery.value.trim()) return topSellingProducts.value;
  const q = searchQuery.value.toLowerCase().trim();
  return topSellingProducts.value.filter(p => 
    p.name.toLowerCase().includes(q) ||
    (p.barcode && p.barcode.toLowerCase().includes(q)) ||
    (p.categoryName && p.categoryName.toLowerCase().includes(q))
  );
});

const top3Products = computed(() => topSellingProducts.value.slice(0, 3));
const topProduct = computed(() => topSellingProducts.value[0] || null);

const topProductRevenue = computed(() => {
  if (!topProduct.value) return 0;
  return (topProduct.value.totalSold || 0) * (topProduct.value.sellingPrice || 0);
});

const totalUnitsSold = computed(() => {
  return topSellingProducts.value.reduce((sum, p) => sum + (p.totalSold || 0), 0);
});

const totalRevenue = computed(() => {
  return topSellingProducts.value.reduce((sum, p) => sum + ((p.totalSold || 0) * (p.sellingPrice || 0)), 0);
});

const getPodiumCardBorder = (idx: number) => {
  if (idx === 0) return 'border-amber-500/40 bg-gradient-to-b from-amber-500/5 to-transparent';
  if (idx === 1) return 'border-slate-400/40 bg-gradient-to-b from-slate-400/5 to-transparent';
  if (idx === 2) return 'border-amber-700/40 bg-gradient-to-b from-amber-700/5 to-transparent';
  return 'border-outline-variant';
};

const getPodiumBadgeClass = (idx: number) => {
  if (idx === 0) return 'bg-amber-500/20 text-amber-700 border-amber-500/40';
  if (idx === 1) return 'bg-slate-400/20 text-slate-700 border-slate-400/40';
  if (idx === 2) return 'bg-amber-800/20 text-amber-900 border-amber-800/40';
  return 'bg-surface-container-high text-on-surface';
};

const getPodiumRankIcon = (idx: number) => {
  if (idx === 0) return '🥇';
  if (idx === 1) return '🥈';
  if (idx === 2) return '🥉';
  return `#${idx + 1}`;
};

const getRankTableBadgeClass = (idx: number) => {
  if (idx === 0) return 'bg-amber-500/20 text-amber-700 border-amber-500/40 font-bold';
  if (idx === 1) return 'bg-slate-300/30 text-slate-700 border-slate-400/40 font-bold';
  if (idx === 2) return 'bg-amber-800/20 text-amber-900 border-amber-800/40 font-bold';
  return 'bg-surface-container-low text-on-surface-variant border-outline-variant';
};

const getStockStatusText = (p: TopSellingProduct) => {
  const stock = p.stock || 0;
  const minStock = p.reorderLevel || 10;
  if (stock === 0) return 'OUT OF STOCK';
  if (stock <= minStock) return 'LOW STOCK';
  return 'IN STOCK';
};

const getStockBadgeClass = (p: TopSellingProduct) => {
  const stock = p.stock || 0;
  const minStock = p.reorderLevel || 10;
  if (stock === 0) return 'bg-tertiary/10 text-tertiary border-tertiary/20';
  if (stock <= minStock) return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
  return 'bg-primary-container/25 text-primary border-primary/20';
};

const exportCsv = () => {
  if (topSellingProducts.value.length === 0) {
    showToast('No data available to export', 'error');
    return;
  }

  const headers = ['Rank', 'Product Name', 'Barcode', 'SKU', 'Category', 'Units Sold', 'Selling Price', 'Total Revenue', 'Current Stock', 'Status'];
  const rows = filteredList.value.map((p, index) => [
    `#${index + 1}`,
    `"${(p.name || '').replace(/"/g, '""')}"`,
    `"${p.barcode || ''}"`,
    `"${p.sku || ''}"`,
    `"${p.categoryName || ''}"`,
    p.totalSold || 0,
    p.sellingPrice || 0,
    (p.totalSold || 0) * (p.sellingPrice || 0),
    p.stock || 0,
    getStockStatusText(p)
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `TOP-SELLING-PRODUCTS-${selectedDate.value || 'DEFAULT'}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast('Exported CSV successfully', 'success');
};

onMounted(() => {
  fetchTopSelling();
});
</script>
