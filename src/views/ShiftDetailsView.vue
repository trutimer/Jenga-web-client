<template>
  <div class="flex flex-col gap-6 font-sans pb-16">
    <!-- Header with Back Button -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div class="flex items-center gap-4">
        <button 
          @click="goBack"
          class="w-10 h-10 bg-surface-container-low border border-outline-variant rounded-xl flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface transition-colors cursor-pointer shadow-sm"
        >
          <ArrowLeft class="w-5 h-5" />
        </button>
        <div>
          <div class="flex items-center gap-2.5">
            <h1 class="text-2xl font-black text-on-surface tracking-tight">Shift Summary & Overview</h1>
            <span 
              v-if="detail?.shift"
              class="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border"
              :class="detail.shift.status === 'OPEN' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-surface-container-high text-on-surface-variant border-outline-variant'"
            >
              {{ detail.shift.status }}
            </span>
          </div>
          <p v-if="detail?.summary" class="text-sm text-on-surface-variant mt-1">
            Cashier: <strong class="text-on-surface">{{ detail.summary.cashierName || 'N/A' }}</strong> &bull; 
            Branch: <strong class="text-on-surface">{{ detail.summary.branchName || 'N/A' }}</strong>
          </p>
        </div>
      </div>

      <div v-if="detail?.shift" class="flex items-center gap-3 bg-surface border border-outline-variant px-4 py-2.5 rounded-2xl shadow-sm">
        <Clock class="w-4 h-4 text-primary shrink-0" />
        <div class="flex flex-col text-xs font-mono">
          <span class="text-on-surface-variant">Opened: {{ formatDate(detail.shift.openedAt) }}</span>
          <span class="text-on-surface font-semibold">Closed: {{ detail.shift.closedAt ? formatDate(detail.shift.closedAt) : 'Still Active' }}</span>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="py-20 flex justify-center">
      <div class="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>

    <div v-else-if="detail" class="flex flex-col gap-8 animate-fade-in">
      
      <!-- KPI Summary Overview Cards Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <!-- Opening Cash -->
        <div class="bg-surface rounded-2xl border border-outline-variant p-4 shadow-sm flex flex-col justify-between">
          <span class="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Opening Cash</span>
          <span class="text-xl font-black text-on-surface font-mono mt-2">{{ formatCurrency(detail.summary.openingCash) }}</span>
        </div>

        <!-- Total Sales -->
        <div class="bg-surface rounded-2xl border border-outline-variant p-4 shadow-sm flex flex-col justify-between">
          <div class="flex justify-between items-start">
            <span class="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Total Sales</span>
            <span class="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">{{ detail.summary.totalTransactions }} sales</span>
          </div>
          <span class="text-xl font-black text-primary font-mono mt-2">{{ formatCurrency(detail.summary.totalSales) }}</span>
        </div>

        <!-- Gross Profit -->
        <div class="bg-surface rounded-2xl border border-outline-variant p-4 shadow-sm flex flex-col justify-between">
          <span class="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Gross Profit</span>
          <span class="text-xl font-black text-emerald-600 font-mono mt-2">{{ formatCurrency(detail.summary.grossProfit) }}</span>
        </div>

        <!-- Expected Cash -->
        <div class="bg-surface rounded-2xl border border-outline-variant p-4 shadow-sm flex flex-col justify-between">
          <span class="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Expected Cash</span>
          <span class="text-xl font-black text-on-surface font-mono mt-2">{{ formatCurrency(detail.summary.expectedCash) }}</span>
        </div>

        <!-- Actual Cash -->
        <div class="bg-surface rounded-2xl border border-outline-variant p-4 shadow-sm flex flex-col justify-between">
          <span class="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Actual Cash</span>
          <span class="text-xl font-black font-mono mt-2" :class="detail.summary.actualCash != null ? 'text-on-surface' : 'text-on-surface-variant/40'">
            {{ detail.summary.actualCash != null ? formatCurrency(detail.summary.actualCash) : '-' }}
          </span>
        </div>

        <!-- Net Discrepancy -->
        <div class="bg-surface rounded-2xl border border-outline-variant p-4 shadow-sm flex flex-col justify-between">
          <span class="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Discrepancy</span>
          <span 
            class="text-xl font-black font-mono mt-2"
            :class="detail.summary.totalDiscrepancy === 0 ? 'text-success' : detail.summary.totalDiscrepancy < 0 ? 'text-error' : 'text-warning'"
          >
            {{ formatCurrency(detail.summary.totalDiscrepancy) }}
          </span>
        </div>
      </div>

      <!-- Charts & Visual Analytics Section -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- Payment Methods Breakdown Chart -->
        <div class="bg-surface rounded-2xl border border-outline-variant p-6 shadow-sm flex flex-col gap-4">
          <h3 class="text-base font-bold text-on-surface flex items-center gap-2">
            <PieChart class="w-5 h-5 text-primary" />
            <span>Payment Breakdown</span>
          </h3>

          <div class="flex-1 flex flex-col items-center justify-center py-4">
            <!-- Payment Method Progress Bar Stack -->
            <div class="w-full h-4 bg-surface-container-high rounded-full overflow-hidden flex shadow-inner mb-6">
              <div 
                v-if="paymentStats.cashPct > 0"
                class="bg-emerald-500 h-full transition-all duration-500" 
                :style="{ width: `${paymentStats.cashPct}%` }"
                :title="`Cash: ${paymentStats.cashPct.toFixed(1)}%`"
              ></div>
              <div 
                v-if="paymentStats.cardPct > 0"
                class="bg-blue-500 h-full transition-all duration-500" 
                :style="{ width: `${paymentStats.cardPct}%` }"
                :title="`Card: ${paymentStats.cardPct.toFixed(1)}%`"
              ></div>
              <div 
                v-if="paymentStats.mobilePct > 0"
                class="bg-purple-500 h-full transition-all duration-500" 
                :style="{ width: `${paymentStats.mobilePct}%` }"
                :title="`Mobile: ${paymentStats.mobilePct.toFixed(1)}%`"
              ></div>
            </div>

            <!-- Legend List -->
            <div class="w-full flex flex-col gap-3">
              <div class="flex items-center justify-between p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/50">
                <div class="flex items-center gap-2">
                  <div class="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <Banknote class="w-4 h-4 text-emerald-600" />
                  <span class="text-sm font-semibold text-on-surface">Cash Sales</span>
                </div>
                <div class="flex flex-col text-right font-mono">
                  <span class="text-sm font-bold text-on-surface">{{ formatCurrency(paymentStats.cashAmount) }}</span>
                  <span class="text-[11px] text-on-surface-variant">{{ paymentStats.cashPct.toFixed(1) }}%</span>
                </div>
              </div>

              <div class="flex items-center justify-between p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/50">
                <div class="flex items-center gap-2">
                  <div class="w-3 h-3 rounded-full bg-blue-500"></div>
                  <CreditCard class="w-4 h-4 text-blue-600" />
                  <span class="text-sm font-semibold text-on-surface">Card Sales</span>
                </div>
                <div class="flex flex-col text-right font-mono">
                  <span class="text-sm font-bold text-on-surface">{{ formatCurrency(paymentStats.cardAmount) }}</span>
                  <span class="text-[11px] text-on-surface-variant">{{ paymentStats.cardPct.toFixed(1) }}%</span>
                </div>
              </div>

              <div class="flex items-center justify-between p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/50">
                <div class="flex items-center gap-2">
                  <div class="w-3 h-3 rounded-full bg-purple-500"></div>
                  <Smartphone class="w-4 h-4 text-purple-600" />
                  <span class="text-sm font-semibold text-on-surface">Mobile Sales</span>
                </div>
                <div class="flex flex-col text-right font-mono">
                  <span class="text-sm font-bold text-on-surface">{{ formatCurrency(paymentStats.mobileAmount) }}</span>
                  <span class="text-[11px] text-on-surface-variant">{{ paymentStats.mobilePct.toFixed(1) }}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sales Timeline Chart -->
        <div class="lg:col-span-2 bg-surface rounded-2xl border border-outline-variant p-6 shadow-sm flex flex-col gap-4">
          <div class="flex items-center justify-between">
            <h3 class="text-base font-bold text-on-surface flex items-center gap-2">
              <TrendingUp class="w-5 h-5 text-primary" />
              <span>Shift Sales Timeline</span>
            </h3>
            <span class="text-xs font-mono text-on-surface-variant">Sales Progression over Shift Hours</span>
          </div>

          <div class="flex-1 min-h-[220px] flex flex-col justify-end relative pt-6">
            <div v-if="salesChartData.points.length > 0" class="w-full h-48 relative">
              <svg 
                class="w-full h-full overflow-visible" 
                preserveAspectRatio="none" 
                viewBox="0 0 100 100"
              >
                <defs>
                  <linearGradient id="shiftChartGrad" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stop-color="#F4511E" stop-opacity="0.3"></stop>
                    <stop offset="100%" stop-color="#FF7A1A" stop-opacity="0.0"></stop>
                  </linearGradient>
                </defs>

                <!-- Grid lines -->
                <line x1="0" y1="25" x2="100" y2="25" stroke="currentColor" class="text-outline-variant/30" stroke-width="0.5" stroke-dasharray="2" />
                <line x1="0" y1="50" x2="100" y2="50" stroke="currentColor" class="text-outline-variant/30" stroke-width="0.5" stroke-dasharray="2" />
                <line x1="0" y1="75" x2="100" y2="75" stroke="currentColor" class="text-outline-variant/30" stroke-width="0.5" stroke-dasharray="2" />

                <!-- Area Fill -->
                <path fill="url(#shiftChartGrad)" :d="salesChartData.areaPath"></path>

                <!-- SVG Line -->
                <path 
                  fill="none" 
                  :d="salesChartData.linePath" 
                  class="stroke-primary stroke-[2.5px] stroke-linecap-round stroke-linejoin-round"
                ></path>
              </svg>

              <!-- Dots -->
              <div 
                v-for="(pt, idx) in salesChartData.points" 
                :key="idx"
                class="absolute w-3 h-3 rounded-full bg-surface border-2 border-primary -translate-x-1/2 -translate-y-1/2 shadow-sm"
                :style="{ left: `${pt.x}%`, top: `${pt.y}%` }"
                :title="`${pt.label}: ${formatCurrency(pt.amount)}`"
              ></div>
            </div>

            <div v-else class="flex-1 flex flex-col items-center justify-center text-center p-8 text-on-surface-variant italic">
              No sales data recorded to plot timeline chart.
            </div>

            <!-- X Axis Labels -->
            <div v-if="salesChartData.points.length > 0" class="flex justify-between text-[11px] font-mono text-on-surface-variant pt-3 border-t border-outline-variant/40">
              <span v-for="(pt, idx) in salesChartData.points" :key="idx">{{ pt.label }}</span>
            </div>
          </div>
        </div>

      </div>

      <!-- Detailed Sales Report Section -->
      <div class="bg-surface rounded-2xl border border-outline-variant shadow-sm flex flex-col overflow-hidden">
        <div class="p-6 border-b border-outline-variant flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-container-low">
          <div>
            <h3 class="text-lg font-black text-on-surface flex items-center gap-2">
              <Receipt class="w-5 h-5 text-primary" />
              <span>Shift Sales Report</span>
            </h3>
            <p class="text-xs text-on-surface-variant mt-0.5">Itemized transaction log for this cashier shift</p>
          </div>

          <div class="flex items-center gap-3">
            <div class="relative w-full sm:w-64">
              <Search class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
              <input 
                v-model="saleSearchQuery"
                type="text" 
                placeholder="Search receipt ID..."
                class="w-full bg-surface-container-lowest border border-outline-variant rounded-xl pl-9 pr-3 py-1.5 text-xs text-on-surface focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm whitespace-nowrap">
            <thead class="bg-surface-container-low text-xs uppercase text-on-surface-variant font-mono tracking-wider border-b border-outline-variant">
              <tr>
                <th class="px-5 py-4">Time</th>
                <th class="px-5 py-4">Receipt No</th>
                <th class="px-5 py-4 text-center">Items</th>
                <th class="px-5 py-4 text-center">Payment Method</th>
                <th class="px-5 py-4 text-center">Status</th>
                <th class="px-5 py-4 text-right">Total Amount</th>
                <th class="px-5 py-4 text-right">Receipt Details</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-outline-variant bg-surface-container-lowest">
              <tr v-if="filteredSales.length === 0">
                <td colspan="7" class="px-5 py-12 text-center text-on-surface-variant text-sm italic">
                  No sales recorded for this shift.
                </td>
              </tr>
              <tr v-for="sale in filteredSales" :key="sale.id" class="hover:bg-surface-container/30 transition-colors">
                <td class="px-5 py-4 font-mono text-xs text-on-surface-variant">
                  {{ formatTime(sale.createdAt) }}
                </td>
                <td class="px-5 py-4 font-mono font-bold text-on-surface text-xs">
                  #{{ sale.id.substring(0, 8).toUpperCase() }}
                </td>
                <td class="px-5 py-4 text-center">
                  <span class="px-2.5 py-1 bg-surface-container rounded-md font-mono text-xs font-bold text-on-surface">
                    {{ sale.items ? sale.items.length : 0 }} items
                  </span>
                </td>
                <td class="px-5 py-4 text-center">
                  <div class="flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wider text-on-surface">
                    <Banknote v-if="sale.paymentMethod === 'CASH'" class="w-3.5 h-3.5 text-emerald-600" />
                    <CreditCard v-else-if="sale.paymentMethod === 'CARD'" class="w-3.5 h-3.5 text-blue-600" />
                    <Smartphone v-else-if="sale.paymentMethod === 'MOBILE'" class="w-3.5 h-3.5 text-purple-600" />
                    <span>{{ sale.paymentMethod }}</span>
                  </div>
                </td>
                <td class="px-5 py-4 text-center">
                  <span 
                    class="px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider"
                    :class="sale.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-error-container text-on-error-container'"
                  >
                    {{ sale.status }}
                  </span>
                </td>
                <td class="px-5 py-4 text-right font-mono font-black text-primary text-xs" :class="sale.status === 'VOID' ? 'line-through opacity-50' : ''">
                  {{ formatCurrency(sale.totalAmount) }}
                </td>
                <td class="px-5 py-4 text-right">
                  <button 
                    @click="selectedSale = sale"
                    class="px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 font-bold text-xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Eye class="w-3.5 h-3.5" />
                    <span>View Items</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Cash Movements Log (if any) -->
      <div v-if="detail.cashMovements && detail.cashMovements.length > 0" class="bg-surface rounded-2xl border border-outline-variant shadow-sm flex flex-col overflow-hidden">
        <div class="p-5 border-b border-outline-variant bg-surface-container-low">
          <h3 class="text-base font-bold text-on-surface flex items-center gap-2">
            <ArrowDownRight class="w-5 h-5 text-primary" />
            <span>Cash Movements Audit Log</span>
          </h3>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm whitespace-nowrap">
            <thead class="bg-surface-container-low text-xs uppercase text-on-surface-variant font-mono tracking-wider border-b border-outline-variant">
              <tr>
                <th class="px-5 py-3.5">Time</th>
                <th class="px-5 py-3.5">Type</th>
                <th class="px-5 py-3.5">Reason</th>
                <th class="px-5 py-3.5 text-right">Amount</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-outline-variant bg-surface-container-lowest">
              <tr v-for="mv in detail.cashMovements" :key="mv.id" class="hover:bg-surface-container/30 transition-colors">
                <td class="px-5 py-3.5 font-mono text-xs text-on-surface-variant">{{ formatDate(mv.createdAt) }}</td>
                <td class="px-5 py-3.5">
                  <span 
                    class="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider"
                    :class="mv.type === 'CASH_IN' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'"
                  >
                    {{ mv.type }}
                  </span>
                </td>
                <td class="px-5 py-3.5 text-on-surface text-xs font-medium">{{ mv.reason }}</td>
                <td class="px-5 py-3.5 text-right font-mono font-bold text-xs" :class="mv.type === 'CASH_IN' ? 'text-emerald-600' : 'text-amber-600'">
                  {{ mv.type === 'CASH_IN' ? '+' : '-' }}{{ formatCurrency(mv.amount) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>

    <!-- Sale Item Modal -->
    <Modal 
      :isOpen="selectedSale !== null" 
      :title="selectedSale ? `Sale Receipt #${selectedSale.id.substring(0, 8).toUpperCase()}` : 'Sale Receipt'" 
      :onClose="() => selectedSale = null"
      maxWidth="max-w-2xl"
    >
      <div v-if="selectedSale" class="flex flex-col gap-6">
        <div class="flex justify-between items-start bg-surface-container-lowest p-4 rounded-xl border border-outline-variant">
          <div class="flex flex-col gap-1">
            <span class="text-xs font-mono font-bold text-on-surface-variant uppercase">Time</span>
            <span class="text-sm font-mono text-on-surface">{{ formatDate(selectedSale.createdAt) }}</span>
          </div>
          <div class="flex flex-col gap-1 text-right">
            <span class="text-xs font-mono font-bold text-on-surface-variant uppercase">Payment Method</span>
            <span class="text-sm font-bold text-on-surface">{{ selectedSale.paymentMethod }}</span>
          </div>
        </div>

        <div class="overflow-x-auto rounded-xl border border-outline-variant bg-surface-container-lowest">
          <table class="w-full text-left text-sm whitespace-nowrap">
            <thead class="bg-surface-container-low text-xs uppercase text-on-surface-variant font-mono tracking-wider border-b border-outline-variant">
              <tr>
                <th class="px-4 py-3">Item</th>
                <th class="px-4 py-3 text-right">Qty</th>
                <th class="px-4 py-3 text-right">Price</th>
                <th class="px-4 py-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-outline-variant">
              <tr v-for="item in selectedSale.items" :key="item.id" class="hover:bg-surface-container/30 transition-colors">
                <td class="px-4 py-3 font-semibold text-on-surface truncate max-w-[200px]">{{ item.productName || 'Product Item' }}</td>
                <td class="px-4 py-3 text-right font-mono">{{ item.quantity }}</td>
                <td class="px-4 py-3 text-right font-mono text-on-surface-variant">{{ formatCurrency(item.unitPrice) }}</td>
                <td class="px-4 py-3 text-right font-mono font-bold text-primary">{{ formatCurrency(item.subtotal || (item.quantity * item.unitPrice)) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="flex justify-between items-center px-4 py-3 bg-primary-container/20 rounded-xl border border-primary/20">
          <span class="font-black text-on-surface uppercase tracking-wider text-sm">Grand Total</span>
          <span class="font-black font-mono text-xl text-primary">{{ formatCurrency(selectedSale.totalAmount) }}</span>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { 
  ArrowLeft, Clock, Banknote, CreditCard, Smartphone, 
  TrendingUp, PieChart, Receipt, Search, Eye, ArrowDownRight 
} from 'lucide-vue-next';
import { useUserViewModel } from '../viewmodels/useUserViewModel';
import type { ShiftDetail } from '../models/types';
import { formatCurrency } from '../models/mockData';
import Modal from '../components/common/Modal.vue';

const route = useRoute();
const router = useRouter();
const { fetchShiftDetails, isLoading } = useUserViewModel();

const shiftId = computed(() => route.params.id as string);
const detail = ref<ShiftDetail | null>(null);
const selectedSale = ref<any | null>(null);
const saleSearchQuery = ref('');

onMounted(async () => {
  if (shiftId.value) {
    const res = await fetchShiftDetails(shiftId.value);
    if (res) {
      detail.value = res;
    }
  }
});

const goBack = () => {
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push('/users');
  }
};

const paymentStats = computed(() => {
  if (!detail.value || !detail.value.sales) {
    return { cashAmount: 0, cardAmount: 0, mobileAmount: 0, total: 0, cashPct: 0, cardPct: 0, mobilePct: 0 };
  }
  let cashAmount = 0;
  let cardAmount = 0;
  let mobileAmount = 0;

  for (const s of detail.value.sales) {
    if (s.status === 'PAID') {
      if (s.paymentMethod === 'CASH') cashAmount += s.totalAmount || 0;
      else if (s.paymentMethod === 'CARD') cardAmount += s.totalAmount || 0;
      else if (s.paymentMethod === 'MOBILE') mobileAmount += s.totalAmount || 0;
    }
  }
  const total = cashAmount + cardAmount + mobileAmount;
  return {
    cashAmount,
    cardAmount,
    mobileAmount,
    total,
    cashPct: total > 0 ? (cashAmount / total) * 100 : 0,
    cardPct: total > 0 ? (cardAmount / total) * 100 : 0,
    mobilePct: total > 0 ? (mobileAmount / total) * 100 : 0,
  };
});

const salesChartData = computed(() => {
  if (!detail.value || !detail.value.sales || detail.value.sales.length === 0) {
    return { points: [], linePath: '', areaPath: '' };
  }

  const sorted = [...detail.value.sales]
    .filter(s => s.status === 'PAID')
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  if (sorted.length === 0) {
    return { points: [], linePath: '', areaPath: '' };
  }

  // Bucket sales by interval / index
  const count = Math.min(sorted.length, 6);
  const step = Math.ceil(sorted.length / count);
  const sample = [];
  for (let i = 0; i < sorted.length; i += step) {
    sample.push(sorted[i]);
  }
  if (sorted.length > 0 && !sample.includes(sorted[sorted.length - 1])) {
    sample.push(sorted[sorted.length - 1]);
  }

  const maxVal = Math.max(...sample.map(s => s.totalAmount || 0), 100);

  const points = sample.map((s, idx) => {
    const x = sample.length === 1 ? 50 : (idx / (sample.length - 1)) * 100;
    const y = 90 - (((s.totalAmount || 0) / maxVal) * 75);
    const d = new Date(s.createdAt);
    const label = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return { x, y, label, amount: s.totalAmount };
  });

  if (points.length === 1) {
    return {
      points,
      linePath: `M 0 50 L 100 50`,
      areaPath: `M 0 50 L 100 50 L 100 100 L 0 100 Z`
    };
  }

  const firstPt = points[0];
  const lastPt = points[points.length - 1];
  if (!firstPt || !lastPt) {
    return { points: [], linePath: '', areaPath: '' };
  }

  let linePath = `M ${firstPt.x} ${firstPt.y}`;
  for (let i = 1; i < points.length; i++) {
    const pt = points[i];
    if (pt) {
      linePath += ` L ${pt.x} ${pt.y}`;
    }
  }

  const areaPath = `${linePath} L ${lastPt.x} 100 L ${firstPt.x} 100 Z`;

  return { points, linePath, areaPath };
});

const filteredSales = computed(() => {
  if (!detail.value || !detail.value.sales) return [];
  if (!saleSearchQuery.value.trim()) return detail.value.sales;
  const q = saleSearchQuery.value.toLowerCase().trim();
  return detail.value.sales.filter((s: any) => s.id.toLowerCase().includes(q));
});

const formatDate = (isoString: string) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date);
};

const formatTime = (isoString: string) => {
  if (!isoString) return '';
  const d = new Date(isoString);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};
</script>
