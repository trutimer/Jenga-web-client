<template>
  <div class="max-w-7xl mx-auto space-y-6 pb-20 animate-fade-up font-sans">
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row sm:items-end justify-between mb-2">
      <div>
        <h2 class="text-3xl font-black text-on-background tracking-tight">Dashboard Overview</h2>
        <p class="text-sm font-semibold text-on-surface-variant mt-1">Welcome back. Here is your store's performance today.</p>
      </div>
      <div class="mt-4 sm:mt-0 flex items-center text-xs font-semibold font-mono text-on-surface-variant bg-surface-container-low px-4 py-2.5 rounded-lg border border-outline-variant shadow-sm gap-2">
        <Calendar class="w-4 h-4 text-primary" />
        <span>Today, {{ formattedDate }}</span>
      </div>
    </div>

    <!-- Bento Grid for KPIs -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <!-- KPI 1: Today's Sales -->
      <div class="bg-surface-container-lowest rounded-xl p-6 md:p-7 border border-outline-variant shadow-md flex flex-col justify-between relative overflow-hidden group hover:border-primary transition-all duration-300 cursor-default">
        <div class="absolute -right-6 -top-6 w-20 h-20 bg-primary-container rounded-full opacity-20 group-hover:scale-110 transition-transform duration-350"></div>
        <div class="flex justify-between items-start mb-4 relative z-10">
          <span class="text-xs font-mono font-bold uppercase tracking-widest text-on-surface-variant">Today's Sales</span>
          <span class="p-1.5 rounded-lg bg-primary-container/30 text-primary">
            <Coins class="w-5 h-5 stroke-[2px]" />
          </span>
        </div>
        <div class="relative z-10">
          <div class="text-3xl font-black text-on-surface tracking-tight">{{ formatCurrency(todaySales, currency) }}</div>
          <div class="flex items-center text-primary text-xs mt-1.5 font-bold gap-1">
            <TrendingUp class="w-3.5 h-3.5" />
            <span>Real-time POS activity</span>
          </div>
        </div>
      </div>

      <!-- KPI 2: Transaction Count -->
      <div class="bg-surface-container-lowest rounded-xl p-6 md:p-7 border border-outline-variant shadow-md flex flex-col justify-between hover:border-primary transition-all duration-300 cursor-default">
        <div class="flex justify-between items-start mb-4">
          <span class="text-xs font-mono font-bold uppercase tracking-widest text-on-surface-variant">Today's Transactions</span>
          <span class="p-1.5 rounded-lg bg-secondary-container text-on-secondary-container">
            <Receipt class="w-5 h-5 stroke-[2px]" />
          </span>
        </div>
        <div>
          <div class="text-3xl font-black text-on-surface tracking-tight">{{ todayTransactionsCount }}</div>
          <div class="text-xs text-on-surface-variant font-medium mt-1.5">
            Avg. Ticket: {{ formatCurrency(avgTicket, currency) }}
          </div>
        </div>
      </div>

      <!-- KPI 3: Weekly Sales -->
      <div class="bg-surface-container-lowest rounded-xl p-6 md:p-7 border border-outline-variant shadow-md flex flex-col justify-between hover:border-primary transition-all duration-300 cursor-default">
        <div class="flex justify-between items-start mb-4">
          <span class="text-xs font-mono font-bold uppercase tracking-widest text-on-surface-variant">Weekly Revenue</span>
          <span class="p-1.5 rounded-lg bg-primary-container/25 text-primary">
            <ShoppingBag class="w-5 h-5 stroke-[2px]" />
          </span>
        </div>
        <div>
          <div class="text-3xl font-black text-on-surface tracking-tight">{{ formatCurrency(weeklyRevenue, currency) }}</div>
          <div class="flex items-center text-primary text-xs mt-1.5 font-bold gap-1">
            <TrendingUp class="w-3.5 h-3.5" />
            <span>Rolling 7 Days</span>
          </div>
        </div>
      </div>

      <!-- KPI 4: Gross Profit -->
      <div class="bg-surface-container-lowest rounded-xl p-6 md:p-7 border border-outline-variant shadow-md flex flex-col justify-between hover:border-primary transition-all duration-300 cursor-default">
        <div class="flex justify-between items-start mb-4">
          <span class="text-xs font-mono font-bold uppercase tracking-widest text-on-surface-variant">Gross Profit (WTD)</span>
          <span class="p-1.5 rounded-lg bg-surface-container-high text-on-surface-variant">
            <TrendingUp class="w-5 h-5 stroke-[2px]" />
          </span>
        </div>
        <div>
          <div class="text-3xl font-black text-on-surface tracking-tight">{{ formatCurrency(weeklyGrossProfit, currency) }}</div>
          <div class="text-xs text-on-surface-variant font-medium mt-1.5">
            {{ weeklyMarginPercent }}% Store Margin
          </div>
        </div>
      </div>
    </div>

    <!-- Inventory alerts -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Low Stock alert banner -->
      <button 
        @click="router.push('/inventory')"
        class="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant shadow-sm flex items-center justify-between hover:border-[#f59e0b] hover:bg-[#fffbeb] transition-all duration-200 cursor-pointer group text-left w-full"
      >
        <div class="flex items-center">
          <div class="w-12 h-12 rounded-full bg-[#fef3c7] text-[#d97706] flex items-center justify-center mr-4 shadow-inner">
            <AlertTriangle class="w-6 h-6 animate-bounce" />
          </div>
          <div>
            <div class="text-xs font-mono font-bold text-on-surface-variant tracking-wider uppercase mb-0.5">Low Stock Items</div>
            <div class="text-2xl font-black text-on-surface group-hover:text-[#d97706] transition-colors leading-none">{{ lowStockCount }}</div>
          </div>
        </div>
        <ChevronRight class="text-outline-variant group-hover:text-on-surface transition-colors w-5 h-5" />
      </button>

      <!-- Out of Stock banner -->
      <button 
        @click="router.push('/inventory')"
        class="bg-error-container/20 rounded-xl p-4 border border-error-container shadow-sm flex items-center justify-between hover:border-error hover:bg-error-container/30 transition-all duration-200 cursor-pointer group text-left w-full"
      >
        <div class="flex items-center">
          <div class="w-12 h-12 rounded-full bg-error text-on-error flex items-center justify-center mr-4">
            <AlertTriangle class="w-6 h-6" />
          </div>
          <div>
            <div class="text-xs font-mono font-bold text-on-surface-variant tracking-wider uppercase mb-0.5">Out of Stock Warnings</div>
            <div class="text-2xl font-black text-error leading-none">{{ outOfStockCount }}</div>
          </div>
        </div>
        <ChevronRight class="text-outline-variant group-hover:text-error transition-colors w-5 h-5" />
      </button>
    </div>

    <!-- Complex Layout: Sales charts and Lists -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- SVG Sales Trend graph -->
      <div class="lg:col-span-2 bg-surface-container-lowest rounded-xl border border-outline-variant shadow-md p-6 md:p-7 flex flex-col">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-lg font-bold text-on-surface">Revenue Trend</h3>
          <select 
            v-model="trendPeriod"
            class="bg-surface-container-low border border-outline-variant text-on-surface font-mono text-xs font-bold rounded-lg px-3 py-1.5 focus:ring-1 focus:ring-primary outline-none cursor-pointer"
          >
            <option value="Last 7 Days">Last 7 Days</option>
            <option value="This Month">This Month</option>
            <option value="This Year">This Year</option>
          </select>
        </div>

        <div class="flex-1 relative min-h-[250px] w-full flex items-end">
          <!-- Y Axis labels -->
          <div class="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-[10px] font-mono text-on-surface-variant pb-2 z-10 select-none">
            <span v-for="(label, idx) in yAxisLabels" :key="idx">
              {{ formatCurrency(label, currency) }}
            </span>
          </div>

          <!-- Grid & Chart Line -->
          <div class="ml-16 flex-1 h-full relative">
            <!-- Grid Lines -->
            <div class="absolute inset-0 flex flex-col justify-between pb-6 select-none opacity-40">
              <div class="w-full border-t border-outline-variant/30 h-0"></div>
              <div class="w-full border-t border-outline-variant/30 h-0"></div>
              <div class="w-full border-t border-outline-variant/30 h-0"></div>
              <div class="w-full border-t border-outline-variant/30 h-0"></div>
              <div class="w-full border-t border-outline h-0"></div>
            </div>

            <!-- SVG Line chart -->
            <svg 
              class="absolute inset-0 w-full h-[calc(100%-24px)] overflow-visible cursor-crosshair" 
              preserveAspectRatio="none" 
              viewBox="0 0 100 100"
              @mousemove="handleMouseMove"
              @mouseleave="handleMouseLeave"
            >
              <defs>
                <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stop-color="#F4511E" stop-opacity="0.35"></stop>
                  <stop offset="50%" stop-color="#FFB347" stop-opacity="0.15"></stop>
                  <stop offset="100%" stop-color="#FF7A1A" stop-opacity="0.00"></stop>
                </linearGradient>
              </defs>

              <!-- Hover Vertical Guide Line -->
              <line
                v-if="activePoint"
                :x1="activePoint.x"
                y1="0"
                :x2="activePoint.x"
                y2="100"
                stroke="currentColor"
                class="text-outline-variant/40"
                stroke-width="1.5"
                stroke-dasharray="4"
              />

              <!-- Area under line -->
              <path fill="url(#chartGradient)" :d="areaPath"></path>

              <!-- Styled Line -->
              <path 
                fill="none" 
                :d="linePathD" 
                class="stroke-primary stroke-[2.5px] stroke-linecap-round stroke-linejoin-round"
              ></path>
            </svg>

            <!-- Data Point Circles on Graph -->
            <div class="absolute inset-0 w-full h-[calc(100%-24px)] overflow-visible pointer-events-none">
              <div 
                v-for="(dot, idx) in chartPoints" 
                :key="idx" 
                class="absolute transition-all duration-200" 
                :style="{ 
                  left: `${dot.x}%`, 
                  top: `${dot.y}%`, 
                  transform: 'translate(-50%, -50%)' 
                }"
              >
                <!-- Highlight outer ring on active hover -->
                <div 
                  class="rounded-full bg-surface border-2 border-primary transition-all duration-150 shadow-md flex items-center justify-center"
                  :class="[
                    activeDotIndex === idx 
                      ? 'w-5 h-5 bg-primary-container border-primary scale-110' 
                      : 'w-3.5 h-3.5 border-primary/80'
                  ]"
                >
                  <div 
                    v-if="activeDotIndex === idx" 
                    class="w-2 h-2 rounded-full bg-primary"
                  ></div>
                </div>
              </div>
            </div>

            <!-- Floating Tooltip -->
            <div
              v-if="activePoint"
              class="absolute bg-inverse-surface text-inverse-on-surface text-xs rounded-xl p-3 shadow-xl border border-outline-variant pointer-events-none z-40 flex flex-col gap-1 transition-all duration-75"
              :style="{
                left: `${activePoint.x}%`,
                top: `${activePoint.y - 12}%`,
                transform: 'translate(-50%, -100%)'
              }"
            >
              <span class="font-bold text-[10px] text-on-surface-variant/80 uppercase tracking-wider leading-none">{{ activePoint.label }}</span>
              <span class="font-black text-sm font-mono text-primary-container leading-none mt-1">{{ formatCurrency(activePoint.val, currency) }}</span>
              <!-- Arrow triangle -->
              <div class="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-inverse-surface"></div>
            </div>

            <!-- X Axis indicators -->
            <div class="absolute bottom-0 left-0 right-0 flex justify-between text-[10px] font-mono text-on-surface-variant transform translate-y-full pt-1.5 select-none font-bold">
              <span v-for="(dot, idx) in chartPoints" :key="idx">
                {{ dot.label }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right column: Methods and parameters breakdown -->
      <div class="flex flex-col gap-6">
        <div class="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-md p-6 md:p-7 flex flex-col justify-between flex-1">
          <div>
            <h3 class="text-md font-bold text-on-surface mb-4">Payment Breakdown</h3>
            <div class="space-y-4">
              <!-- Cash -->
              <div>
                <div class="flex justify-between text-xs font-semibold mb-1">
                  <span class="text-on-surface flex items-center font-bold">
                    <span class="w-2.5 h-2.5 rounded-full bg-[#F4511E] mr-2"></span>
                    Cash (Register)
                  </span>
                  <span class="font-mono text-on-surface-variant font-bold">{{ paymentPercentages.cash }}%</span>
                </div>
                <div class="w-full bg-surface-container-high rounded-full h-2">
                  <div class="bg-[#F4511E] h-2 rounded-full" :style="{ width: `${paymentPercentages.cash}%` }"></div>
                </div>
              </div>

              <!-- Mobile Money -->
              <div>
                <div class="flex justify-between text-xs font-semibold mb-1">
                  <span class="text-on-surface flex items-center font-bold">
                    <span class="w-2.5 h-2.5 rounded-full bg-[#3b82f6] mr-2"></span>
                    M-Pesa (Mobile)
                  </span>
                  <span class="font-mono text-on-surface-variant font-bold">{{ paymentPercentages.mobile }}%</span>
                </div>
                <div class="w-full bg-surface-container-high rounded-full h-2">
                  <div class="bg-[#3b82f6] h-2 rounded-full" :style="{ width: `${paymentPercentages.mobile}%` }"></div>
                </div>
              </div>

              <!-- Card -->
              <div>
                <div class="flex justify-between text-xs font-semibold mb-1">
                  <span class="text-on-surface flex items-center font-bold">
                    <span class="w-2.5 h-2.5 rounded-full bg-[#8b5cf6] mr-2"></span>
                    Card Terminal
                  </span>
                  <span class="font-mono text-on-surface-variant font-bold">{{ paymentPercentages.card }}%</span>
                </div>
                <div class="w-full bg-surface-container-high rounded-full h-2">
                  <div class="bg-[#8b5cf6] h-2 rounded-full" :style="{ width: `${paymentPercentages.card}%` }"></div>
                </div>
              </div>
            </div>
          </div>

          <div class="border-t border-outline-variant pt-4 mt-6">
            <div class="text-xs text-on-surface-variant flex items-center justify-between font-mono">
              <span>Verified End-of-Day Ledger</span>
              <span class="text-primary font-bold">ONLINE</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Section: Top Products list & Quick actions block -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <!-- Top Products section (takes 2 columns) -->
      <div class="lg:col-span-2 bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden flex flex-col">
        <div class="p-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
          <h3 class="text-md font-bold text-on-surface">Top Selling Products Today</h3>
          <button 
            @click="router.push('/inventory')"
            class="text-primary text-xs font-bold hover:underline cursor-pointer"
          >
            View Full Catalog
          </button>
        </div>

        <div class="divide-y divide-outline-variant">
          <template v-if="topSellingProducts.length > 0">
            <div 
              v-for="(item, idx) in topSellingProducts" 
              :key="idx"
              class="p-4 flex items-center hover:bg-surface-container-low/50 transition-colors group"
            >
              <div class="w-12 h-12 bg-surface-container-high rounded-lg mr-4 flex-shrink-0 flex items-center justify-center overflow-hidden border border-outline-variant text-primary">
                <Coffee class="w-6 h-6" />
              </div>
              <div class="flex-1 min-w-0 mr-4">
                <p class="text-sm font-bold text-on-surface truncate">{{ item.name }}</p>
                <p class="text-xs text-on-surface-variant truncate font-mono">
                  Category: Top Seller
                </p>
              </div>
              <div class="text-right">
                <p class="text-sm font-mono font-black text-on-surface">{{ item.quantity }} Units Sold</p>
                <p class="text-primary text-xs font-bold font-mono">{{ formatCurrency(item.revenue, currency) }}</p>
              </div>
            </div>
          </template>
          <template v-else>
            <div class="p-8 text-center text-on-surface-variant font-medium text-sm flex flex-col items-center justify-center">
              <ShoppingBag class="w-8 h-8 text-outline-variant mb-2 animate-bounce" />
              <p>No sales recorded today.</p>
              <p class="text-xs text-outline mt-1">Check out items to register sales activity.</p>
            </div>
          </template>
        </div>
      </div>

      <!-- Quick Actions tile -->
      <div class="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-md p-6 md:p-7 flex flex-col justify-between">
        <div>
          <h3 class="text-md font-bold text-on-surface mb-4">Quick Shortcuts</h3>
          <div class="grid grid-cols-2 gap-3">
            <!-- Action: New Sale -->
            <button 
              @click="router.push('/checkout')"
              class="bg-surface-container-low hover:bg-primary-container/20 border border-outline-variant rounded-xl p-4 flex flex-col items-center justify-center text-center transition-colors group cursor-pointer"
            >
              <ShoppingBag class="w-6 h-6 text-primary mb-2 group-hover:scale-110 transition-transform" />
              <span class="text-xs font-bold text-on-surface">New Sale</span>
            </button>

            <!-- Action: Add Product -->
            <button 
              @click="router.push('/inventory')"
              class="bg-surface-container-low hover:bg-primary-container/20 border border-outline-variant rounded-xl p-4 flex flex-col items-center justify-center text-center transition-colors group cursor-pointer"
            >
              <PlusSquare class="w-6 h-6 text-primary mb-2 group-hover:scale-110 transition-transform" />
              <span class="text-xs font-bold text-on-surface">Inventory List</span>
            </button>

            <!-- Action: Receive Stock -->
            <button 
              @click="router.push('/inventory')"
              class="bg-surface-container-low hover:bg-primary-container/20 border border-outline-variant rounded-xl p-4 flex flex-col items-center justify-center text-center transition-colors group cursor-pointer"
            >
              <Package class="w-6 h-6 text-primary mb-2 group-hover:scale-110 transition-transform" />
              <span class="text-xs font-bold text-on-surface">Receive Stock</span>
            </button>

            <!-- Action: Customers info -->
            <button 
              @click="alertCustomers"
              class="bg-surface-container-low hover:bg-primary-container/20 border border-outline-variant rounded-xl p-4 flex flex-col items-center justify-center text-center transition-colors group cursor-pointer"
            >
              <Users class="w-6 h-6 text-primary mb-2 group-hover:scale-110 transition-transform" />
              <span class="text-xs font-bold text-on-surface">Customers</span>
            </button>

            <!-- EOD report builder -->
            <button 
              @click="handleEodReport"
              class="bg-surface-container-low hover:bg-primary text-on-surface hover:text-on-primary border border-outline-variant rounded-xl p-3 flex flex-col items-center justify-center text-center transition-all duration-200 group cursor-pointer col-span-2"
            >
              <FileSpreadsheet class="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
              <span class="text-xs font-bold">Compile End of Day Ledger</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { 
  Calendar, 
  TrendingUp, 
  ShoppingBag, 
  Receipt, 
  Coins, 
  AlertTriangle,
  ChevronRight,
  PlusSquare,
  Package,
  FileSpreadsheet,
  Users,
  Coffee,
  GlassWater,
  Sparkles
} from 'lucide-vue-next';
import { useAppViewModel } from '../viewmodels/useAppViewModel';
import { formatCurrency } from '../models/mockData';
import { api } from '../services/api';

const vm = useAppViewModel();
const router = useRouter();

const trendPeriod = ref('Last 7 Days');
const stats = ref<{
  todaySales: number;
  todayTransactions: number;
  weeklyRevenue: number;
  grossProfit: number;
  lowStockCount: number;
  outOfStockCount: number;
  paymentBreakdown: {
    Cash: number;
    Card: number;
    'M-Pesa': number;
  };
  topSellingProducts: Array<{
    name: string;
    quantity: number;
    revenue: number;
  }>;
} | null>(null);

const trendsData = ref<Array<{ label: string; revenue: number }>>([]);

const currency = computed(() => vm.settings.value.currency);

onMounted(() => {
  vm.fetchSettings();
  fetchStats();
  fetchTrends();
});

const fetchStats = async () => {
  try {
    const data = await api.get<any>('/api/analytics/summary');
    if (data) {
      stats.value = {
        todaySales: Number(data.todaySales) || 0,
        todayTransactions: Number(data.todayTransactions) || 0,
        weeklyRevenue: Number(data.weeklyRevenue) || 0,
        grossProfit: Number(data.grossProfit) || 0,
        lowStockCount: Number(data.lowStockCount) || 0,
        outOfStockCount: Number(data.outOfStockCount) || 0,
        paymentBreakdown: {
          Cash: Number(data.paymentBreakdown?.Cash) || 0,
          Card: Number(data.paymentBreakdown?.Card) || 0,
          'M-Pesa': Number(data.paymentBreakdown?.['M-Pesa']) || 0,
        },
        topSellingProducts: (data.topSellingProducts || []).map((p: any) => ({
          name: p.name || 'Product',
          quantity: Number(p.quantity) || 0,
          revenue: Number(p.revenue) || 0
        }))
      };
    }
  } catch (err) {
    console.error('Failed to load dashboard analytics:', err);
  }
};

const fetchTrends = async () => {
  let periodParam = 'daily';
  if (trendPeriod.value === 'This Month') periodParam = 'weekly';
  else if (trendPeriod.value === 'This Year') periodParam = 'yearly';
  
  try {
    const data = await api.get<Array<{ label: string; revenue: any }>>(`/api/analytics/trends?period=${periodParam}`);
    if (data) {
      trendsData.value = data.map(item => ({
        label: item.label || '',
        revenue: Number(item.revenue) || 0
      }));
    }
  } catch (err) {
    console.error('Failed to load analytics trends:', err);
  }
};

watch(trendPeriod, () => {
  fetchTrends();
});

const todaySales = computed(() => stats.value ? stats.value.todaySales : 0);
const todayTransactionsCount = computed(() => stats.value ? stats.value.todayTransactions : 0);
const avgTicket = computed(() => todayTransactionsCount.value > 0 ? todaySales.value / todayTransactionsCount.value : 0);
const weeklyRevenue = computed(() => stats.value ? stats.value.weeklyRevenue : 0);
const weeklyGrossProfit = computed(() => stats.value ? stats.value.grossProfit : 0);
const weeklyMarginPercent = computed(() => weeklyRevenue.value > 0 ? Math.round((weeklyGrossProfit.value / weeklyRevenue.value) * 100) : 0);
const lowStockCount = computed(() => stats.value ? stats.value.lowStockCount : 0);
const outOfStockCount = computed(() => stats.value ? stats.value.outOfStockCount : 0);
const topSellingProducts = computed(() => stats.value ? stats.value.topSellingProducts : []);

const paymentPercentages = computed(() => {
  if (!stats.value) {
    return { cash: 0, mobile: 0, card: 0 };
  }
  const cash = stats.value.paymentBreakdown.Cash || 0;
  const card = stats.value.paymentBreakdown.Card || 0;
  const mobile = stats.value.paymentBreakdown['M-Pesa'] || 0;
  const total = cash + card + mobile;
  if (total === 0) return { cash: 0, mobile: 0, card: 0 };
  return {
    cash: Math.round((cash / total) * 100),
    card: Math.round((card / total) * 100),
    mobile: Math.round((mobile / total) * 100),
  };
});

const chartData = computed(() => {
  return {
    labels: trendsData.value.map(d => d.label),
    values: trendsData.value.map(d => d.revenue)
  };
});

const chartMax = computed(() => {
  const vals = chartData.value.values;
  const max = Math.max(...vals, 1000);
  if (max <= 1000) return 1000;
  const order = Math.pow(10, Math.floor(Math.log10(max)));
  const normalized = max / order;
  let ceilNormalized = 10;
  if (normalized <= 1.2) ceilNormalized = 1.2;
  else if (normalized <= 1.5) ceilNormalized = 1.5;
  else if (normalized <= 2) ceilNormalized = 2;
  else if (normalized <= 3) ceilNormalized = 3;
  else if (normalized <= 4) ceilNormalized = 4;
  else if (normalized <= 5) ceilNormalized = 5;
  else if (normalized <= 6) ceilNormalized = 6;
  else if (normalized <= 8) ceilNormalized = 8;
  else ceilNormalized = 10;
  return ceilNormalized * order;
});

const yAxisLabels = computed(() => {
  const max = chartMax.value;
  return [
    max,
    max * 0.75,
    max * 0.5,
    max * 0.25,
    0
  ];
});

const chartPoints = computed(() => {
  const { labels, values } = chartData.value;
  const max = chartMax.value;
  const N = values.length;
  return values.map((val, i) => {
    const x = N > 1 ? (i / (N - 1)) * 100 : 50;
    const y = 100 - (val / max) * 75 - 12; // Keep y between 13% and 88%
    return {
      x,
      y,
      label: labels[i] || '',
      val
    };
  });
});

const linePathD = computed(() => {
  const pts = chartPoints.value;
  if (pts.length === 0) return '';
  return pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
});

const areaPath = computed(() => {
  const pts = chartPoints.value;
  if (pts.length === 0) return '';
  const line = linePathD.value;
  return `${line} L 100 100 L 0 100 Z`;
});

const activeDotIndex = ref<number | null>(null);

const activePoint = computed(() => {
  if (activeDotIndex.value === null) return null;
  return chartPoints.value[activeDotIndex.value] || null;
});

const handleMouseMove = (event: MouseEvent) => {
  const svg = event.currentTarget as SVGSVGElement;
  if (!svg) return;
  const rect = svg.getBoundingClientRect();
  const mouseX = ((event.clientX - rect.left) / rect.width) * 100;
  
  const pts = chartPoints.value;
  let closestIdx = 0;
  let minDiff = Infinity;
  pts.forEach((pt, idx) => {
    const diff = Math.abs(pt.x - mouseX);
    if (diff < minDiff) {
      minDiff = diff;
      closestIdx = idx;
    }
  });
  activeDotIndex.value = closestIdx;
};

const handleMouseLeave = () => {
  activeDotIndex.value = null;
};

const formattedDate = computed(() => {
  return new Date().toLocaleDateString('en-US', { 
    weekday: 'short', 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
});

const handleEodReport = () => {
  alert(`EOD Report successfully compiled!\n- Today's Store Revenue: ${formatCurrency(todaySales.value, currency.value)}\n- Today's Transactions: ${todayTransactionsCount.value}\n- Gross margins consolidated: ${weeklyMarginPercent.value}%\nFile downloaded as "JENGA-EOD-REPORT.csv" (simulated)`);
};

const alertCustomers = () => {
  alert("Customers list: Managed securely. Authenticated access needed.");
};
</script>
