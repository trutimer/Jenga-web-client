<template>
  <div class="h-full flex flex-col">
    <!-- Header -->
    <header class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-black text-on-surface">Shift Sales</h1>
        <p class="text-sm text-on-surface-variant mt-1">Transactions completed during your current active shift</p>
      </div>
      <div class="flex gap-3">
        <button 
          @click="router.push('/checkout')"
          class="bg-surface-container text-on-surface px-4 py-2 rounded-lg font-bold text-sm hover:bg-surface-variant transition-all flex items-center gap-2 border border-outline-variant cursor-pointer"
        >
          <X class="w-4 h-4" />
          <span>Close</span>
        </button>
      </div>
    </header>

    <div class="flex-1 overflow-y-auto pr-2 pb-8">

      <!-- SHIFT SALES SUMMARY BANNER -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <!-- 1. Total Shift Sales Card -->
        <div class="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2.5">
              <div class="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
                <ShoppingBag class="w-5 h-5" />
              </div>
              <div>
                <span class="text-xs font-bold text-on-surface-variant uppercase tracking-wider block">Total Shift Revenue</span>
                <span class="text-[11px] font-medium text-on-surface-variant/70">Completed Sales</span>
              </div>
            </div>
            <span class="px-2.5 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary font-mono">
              {{ totalActiveTransactionsCount }} Txns
            </span>
          </div>
          <div class="mt-2">
            <div class="text-2xl font-black font-mono text-primary tracking-tight">
              {{ formatCurrency(totalActiveSalesAmount, settings.currency) }}
            </div>
          </div>
        </div>

        <!-- 2. Payment Method Breakdown Card -->
        <div class="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-2.5">
              <div class="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold shrink-0">
                <PieChart class="w-5 h-5" />
              </div>
              <div>
                <span class="text-xs font-bold text-on-surface-variant uppercase tracking-wider block">Payment Breakdown</span>
                <span class="text-[11px] font-medium text-on-surface-variant/70">By Payment Channel</span>
              </div>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-2 mt-1">
            <!-- Cash -->
            <div class="p-2 rounded-xl bg-surface-container-low border border-outline-variant/60 flex items-center justify-between">
              <div class="flex items-center gap-1.5 min-w-0">
                <Banknote class="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span class="text-xs font-bold text-on-surface truncate">Cash</span>
              </div>
              <span class="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 pl-1 truncate">
                {{ formatCurrency(paymentBreakdown.cash, settings.currency) }}
              </span>
            </div>
            <!-- Mobile -->
            <div class="p-2 rounded-xl bg-surface-container-low border border-outline-variant/60 flex items-center justify-between">
              <div class="flex items-center gap-1.5 min-w-0">
                <Smartphone class="w-3.5 h-3.5 text-purple-600 shrink-0" />
                <span class="text-xs font-bold text-on-surface truncate">Mobile</span>
              </div>
              <span class="text-xs font-mono font-bold text-purple-700 dark:text-purple-400 pl-1 truncate">
                {{ formatCurrency(paymentBreakdown.mobile, settings.currency) }}
              </span>
            </div>
            <!-- Card / Bank -->
            <div class="p-2 rounded-xl bg-surface-container-low border border-outline-variant/60 flex items-center justify-between">
              <div class="flex items-center gap-1.5 min-w-0">
                <CreditCard class="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span class="text-xs font-bold text-on-surface truncate">Card/Bank</span>
              </div>
              <span class="text-xs font-mono font-bold text-blue-700 dark:text-blue-400 pl-1 truncate">
                {{ formatCurrency(paymentBreakdown.card, settings.currency) }}
              </span>
            </div>
            <!-- Credit -->
            <div class="p-2 rounded-xl bg-surface-container-low border border-outline-variant/60 flex items-center justify-between">
              <div class="flex items-center gap-1.5 min-w-0">
                <Receipt class="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span class="text-xs font-bold text-on-surface truncate">Credit</span>
              </div>
              <span class="text-xs font-mono font-bold text-amber-700 dark:text-amber-400 pl-1 truncate">
                {{ formatCurrency(paymentBreakdown.credit, settings.currency) }}
              </span>
            </div>
          </div>
        </div>

        <!-- 3. Reversed / Void Sales Card -->
        <div class="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2.5">
              <div class="w-10 h-10 rounded-xl bg-error/10 text-error flex items-center justify-center font-bold shrink-0">
                <RotateCcw class="w-5 h-5" />
              </div>
              <div>
                <span class="text-xs font-bold text-on-surface-variant uppercase tracking-wider block">Reversed Sales</span>
                <span class="text-[11px] font-medium text-on-surface-variant/70">Voided Transactions</span>
              </div>
            </div>
            <span class="px-2.5 py-1 rounded-full text-xs font-bold bg-error/10 text-error font-mono">
              {{ totalReversedCount }} Voids
            </span>
          </div>
          <div class="mt-2">
            <div class="text-2xl font-black font-mono text-error tracking-tight">
              {{ formatCurrency(totalReversedSalesAmount, settings.currency) }}
            </div>
          </div>
        </div>
      </div>

      <!-- ITEMS MODAL -->
      <Modal 
        :isOpen="selectedSale !== null" 
        :title="selectedSale ? `Sale Receipt ${selectedSale.id.substring(0, 8).toUpperCase()}` : 'Sale Details'" 
        :onClose="closeModal"
        maxWidth="max-w-2xl"
      >
        <div v-if="selectedSale" class="flex flex-col gap-6">
          
          <div class="flex justify-between items-start bg-surface-container-lowest p-4 rounded-xl border border-outline-variant">
            <div class="flex flex-col gap-1">
              <span class="text-xs font-mono font-bold text-on-surface-variant uppercase">Time</span>
              <span class="text-sm font-mono text-on-surface">{{ formatTime(selectedSale.createdAt) }}</span>
            </div>
            <div class="flex flex-col gap-1 text-right">
              <span class="text-xs font-mono font-bold text-on-surface-variant uppercase">Payment</span>
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
                  <td class="px-4 py-3 font-semibold text-on-surface truncate max-w-[200px]" :title="item.productName">{{ item.productName }}</td>
                  <td class="px-4 py-3 text-right font-mono">{{ item.quantity }}</td>
                  <td class="px-4 py-3 text-right font-mono text-on-surface-variant">{{ formatCurrency(item.unitPrice, settings.currency) }}</td>
                  <td class="px-4 py-3 text-right font-mono font-bold text-primary">{{ formatCurrency(item.subtotal, settings.currency) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="flex justify-between items-center px-4 py-3 bg-primary-container/20 rounded-xl border border-primary/20">
            <span class="font-black text-on-surface uppercase tracking-wider text-sm">Grand Total</span>
            <span class="font-black font-mono text-xl text-primary">{{ formatCurrency(selectedSale.totalAmount, settings.currency) }}</span>
          </div>

          <!-- Actions -->
          <div v-if="selectedSale.status !== 'VOID' && selectedSale.status !== 'REFUNDED'" class="flex justify-end pt-4 border-t border-outline-variant mt-2">
            <button 
              @click="confirmReverse(selectedSale.id)"
              :disabled="isReversing"
              class="px-5 py-2.5 bg-error/10 text-error hover:bg-error hover:text-on-error border border-error/20 rounded-xl font-bold text-sm transition-all flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
            >
              <RotateCcw class="w-4 h-4" />
              <span>{{ isReversing ? 'Reversing...' : 'Reverse Transaction' }}</span>
            </button>
          </div>
          <div v-else class="flex justify-center pt-4 border-t border-outline-variant mt-2">
            <span class="text-error font-black uppercase tracking-widest text-sm flex items-center gap-2">
              <AlertCircle class="w-5 h-5" />
              This transaction is voided
            </span>
          </div>

        </div>
      </Modal>

      <!-- TABLE -->
      <div class="flex flex-col gap-4 animate-fade-in">
        <div class="overflow-x-auto rounded-2xl border border-outline-variant bg-surface-container-lowest shadow-sm">
          <table class="w-full text-left text-sm whitespace-nowrap">
            <thead class="bg-surface-container-low text-xs uppercase text-on-surface-variant font-mono tracking-wider border-b border-outline-variant">
              <tr>
                <th class="px-5 py-4">Time</th>
                <th class="px-5 py-4">Receipt No</th>
                <th class="px-5 py-4 text-center">Items</th>
                <th class="px-5 py-4 text-center">Payment</th>
                <th class="px-5 py-4">Status</th>
                <th class="px-5 py-4 text-right">Amount</th>
                <th class="px-5 py-4 text-right">Options</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-outline-variant bg-surface-container-lowest">
              <tr v-if="!shiftSales.length">
                <td colspan="7" class="px-5 py-12 text-center text-on-surface-variant text-sm italic">
                  No sales recorded during this shift.
                </td>
              </tr>
              <tr v-for="sale in shiftSales" :key="sale.id" class="hover:bg-surface-container/30 transition-colors">
                <td class="px-5 py-4 font-mono text-sm text-on-surface-variant">{{ formatTime(sale.createdAt) }}</td>
                <td class="px-5 py-4 font-mono font-bold text-on-surface">{{ sale.id.substring(0, 8).toUpperCase() }}</td>
                <td class="px-5 py-4 text-center">
                  <span class="px-2 py-1 bg-surface-container rounded-md font-mono text-xs font-bold text-on-surface">
                    {{ sale.items ? sale.items.length : 0 }}
                  </span>
                </td>
                <td class="px-5 py-4 text-center">
                  <div class="flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wider text-on-surface">
                    <Banknote v-if="sale.paymentMethod === 'CASH'" class="w-3.5 h-3.5 text-emerald-600" />
                    <CreditCard v-else-if="sale.paymentMethod === 'CARD' || sale.paymentMethod === 'BANK_TRANSFER'" class="w-3.5 h-3.5 text-blue-600" />
                    <Smartphone v-else-if="sale.paymentMethod === 'MOBILE' || sale.paymentMethod === 'MOBILE_TRANSFER'" class="w-3.5 h-3.5 text-purple-600" />
                    <Receipt v-else-if="sale.paymentMethod === 'CREDIT' || sale.paymentMethod === 'ONCREDIT' || sale.paymentMethod === 'ON_CREDIT'" class="w-3.5 h-3.5 text-amber-600" />
                    <span>{{ sale.paymentMethod }}</span>
                  </div>
                </td>
                <td class="px-5 py-4">
                  <span 
                    class="px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider"
                    :class="(sale.status === 'COMPLETED' || sale.status === 'PAID') ? 'bg-emerald-100 text-emerald-800' : 'bg-error-container text-on-error-container'"
                  >
                    {{ sale.status }}
                  </span>
                </td>
                <td class="px-5 py-4 text-right font-mono font-black text-primary" :class="(sale.status === 'VOID' || sale.status === 'REFUNDED') ? 'line-through opacity-50' : ''">
                  {{ formatCurrency(sale.totalAmount, settings.currency) }}
                </td>
                <td class="px-5 py-4 text-right">
                  <button 
                    @click="openModal(sale)"
                    class="px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5 ml-auto"
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

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAppViewModel } from '../viewmodels/useAppViewModel';
import { formatCurrency } from '../models/mockData';
import Modal from '../components/common/Modal.vue';
import { 
  X, 
  Eye, 
  Banknote, 
  CreditCard, 
  Smartphone, 
  RotateCcw, 
  AlertCircle,
  ShoppingBag,
  PieChart,
  Receipt
} from 'lucide-vue-next';

const router = useRouter();
const vm = useAppViewModel();
const settings = computed(() => vm.settings.value);
const shiftSales = computed(() => vm.shiftSales.value);

const selectedSale = ref<any | null>(null);
const isReversing = ref(false);

onMounted(() => {
  vm.fetchShiftSales();
});

// Computed Metrics for Summary Cards
const totalActiveSalesAmount = computed(() => {
  return shiftSales.value
    .filter((s: any) => s.status === 'PAID' || s.status === 'COMPLETED')
    .reduce((sum: number, s: any) => sum + (Number(s.totalAmount) || 0), 0);
});

const totalActiveTransactionsCount = computed(() => {
  return shiftSales.value.filter((s: any) => s.status === 'PAID' || s.status === 'COMPLETED').length;
});

const totalReversedSalesAmount = computed(() => {
  return shiftSales.value
    .filter((s: any) => s.status === 'VOID' || s.status === 'REFUNDED')
    .reduce((sum: number, s: any) => sum + (Number(s.totalAmount) || 0), 0);
});

const totalReversedCount = computed(() => {
  return shiftSales.value.filter((s: any) => s.status === 'VOID' || s.status === 'REFUNDED').length;
});

const paymentBreakdown = computed(() => {
  const activeSales = shiftSales.value.filter((s: any) => s.status === 'PAID' || s.status === 'COMPLETED');
  
  let cash = 0, card = 0, mobile = 0, credit = 0, other = 0;

  for (const s of activeSales) {
    const amt = Number(s.totalAmount) || 0;
    const method = String(s.paymentMethod || '').toUpperCase();
    if (method === 'CASH') {
      cash += amt;
    } else if (method === 'CARD' || method === 'BANK_TRANSFER' || method === 'TRANSFER') {
      card += amt;
    } else if (method === 'MOBILE' || method === 'MOBILE_TRANSFER') {
      mobile += amt;
    } else if (method === 'CREDIT' || method === 'ONCREDIT' || method === 'ON_CREDIT') {
      credit += amt;
    } else {
      other += amt;
    }
  }

  return { cash, card, mobile, credit, other };
});

const formatTime = (isoString: string) => {
  if (!isoString) return '';
  const d = new Date(isoString);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const openModal = (sale: any) => {
  selectedSale.value = sale;
};

const closeModal = () => {
  selectedSale.value = null;
};

const confirmReverse = async (id: string) => {
  if (window.confirm('Are you absolutely sure you want to reverse this transaction? This action will void the sale, adjust the expected cash, and return items to inventory.')) {
    isReversing.value = true;
    const success = await vm.reverseTransaction(id);
    isReversing.value = false;
    if (success) {
      closeModal();
    }
  }
};
</script>
