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
          <div v-if="selectedSale.status !== 'VOID'" class="flex justify-end pt-4 border-t border-outline-variant mt-2">
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
                    <CreditCard v-else-if="sale.paymentMethod === 'CARD'" class="w-3.5 h-3.5 text-blue-600" />
                    <Smartphone v-else-if="sale.paymentMethod === 'MOBILE'" class="w-3.5 h-3.5 text-purple-600" />
                    <span>{{ sale.paymentMethod }}</span>
                  </div>
                </td>
                <td class="px-5 py-4">
                  <span 
                    class="px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider"
                    :class="sale.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : 'bg-error-container text-on-error-container'"
                  >
                    {{ sale.status }}
                  </span>
                </td>
                <td class="px-5 py-4 text-right font-mono font-black text-primary" :class="sale.status === 'VOID' ? 'line-through opacity-50' : ''">
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
import { X, Eye, Banknote, CreditCard, Smartphone, RotateCcw, AlertCircle } from 'lucide-vue-next';

const router = useRouter();
const vm = useAppViewModel();
const settings = computed(() => vm.settings.value);
const shiftSales = computed(() => vm.shiftSales.value);

const selectedSale = ref<any | null>(null);
const isReversing = ref(false);

onMounted(() => {
  vm.fetchShiftSales();
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
