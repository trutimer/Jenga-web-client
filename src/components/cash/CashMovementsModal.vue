<template>
  <Modal 
    :isOpen="vm.showCashMovementsModal.value" 
    title="Cash Movements" 
    :onClose="handleClose"
    maxWidth="max-w-4xl"
  >
    <div class="flex flex-col gap-6 font-sans">
      
      <!-- Top header with actions -->
      <div class="flex justify-between items-center border-b border-outline-variant pb-4">
        <h2 class="text-lg font-black text-on-surface">Analytics & History</h2>
        <button 
          v-if="!isAdding"
          @click="isAdding = true"
          class="bg-primary text-on-primary px-4 py-2 rounded-lg font-bold text-sm hover:bg-opacity-90 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
        >
          <Plus class="w-4 h-4" />
          <span>Add New Movement</span>
        </button>
        <button 
          v-else
          @click="isAdding = false"
          class="bg-surface-container text-on-surface px-4 py-2 rounded-lg font-bold text-sm hover:bg-surface-variant transition-all flex items-center gap-2 border border-outline-variant cursor-pointer"
        >
          <ArrowLeft class="w-4 h-4" />
          <span>Back to Analytics</span>
        </button>
      </div>

      <!-- ADD MOVEMENT FORM -->
      <div v-if="isAdding" class="flex flex-col gap-4 max-w-md mx-auto w-full py-4 animate-fade-up">
        <h3 class="text-md font-bold text-on-surface mb-2">Record Cash Movement</h3>
        
        <div class="space-y-2">
          <label class="text-[11px] font-mono font-bold text-on-surface-variant uppercase tracking-wider">Movement Type</label>
          <select 
            v-model="newMovement.type"
            class="w-full bg-surface-container border border-outline-variant rounded-lg p-3 text-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none"
          >
            <option value="PAY_IN">Pay In (Add Cash)</option>
            <option value="PAY_OUT">Pay Out (Remove Cash)</option>
            <option value="CASH_DROP">Cash Drop (Safe Deposit)</option>
          </select>
        </div>

        <div class="space-y-2">
          <label class="text-[11px] font-mono font-bold text-on-surface-variant uppercase tracking-wider">Amount ({{ settings.currency }})</label>
          <input 
            type="number"
            v-model="newMovement.amount"
            placeholder="0.00"
            class="w-full bg-surface-container border border-outline-variant rounded-lg p-3 text-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none font-mono"
          />
        </div>

        <div class="space-y-2">
          <label class="text-[11px] font-mono font-bold text-on-surface-variant uppercase tracking-wider">Reason</label>
          <textarea 
            v-model="newMovement.reason"
            placeholder="e.g. Paid for water, Change from safe..."
            class="w-full bg-surface-container border border-outline-variant rounded-lg p-3 text-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none h-24"
          ></textarea>
        </div>

        <button 
          @click="submitMovement"
          :disabled="isSubmitting || !newMovement.amount || !newMovement.reason"
          class="w-full py-3 mt-2 bg-primary text-on-primary hover:bg-opacity-95 rounded-xl transition-all font-bold text-sm shadow-md shadow-primary/20 disabled:opacity-50 cursor-pointer"
        >
          {{ isSubmitting ? 'Recording...' : 'Submit Movement' }}
        </button>
      </div>

      <!-- ANALYTICS & TABLE -->
      <div v-else class="flex flex-col gap-6 animate-fade-in">
        
        <!-- Summary Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4" v-if="vm.cashMovementAnalytics.value">
          <div v-for="(stat, period) in periods" :key="period" class="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant shadow-sm flex flex-col gap-2">
            <span class="text-[11px] font-mono font-bold text-on-surface-variant uppercase tracking-wider">{{ period }}</span>
            <span class="text-2xl font-black font-mono text-primary truncate" :class="stat.summary.netMovement < 0 ? 'text-error' : 'text-primary'">
              {{ formatCurrency(stat.summary.netMovement, settings.currency) }}
            </span>
            <div class="flex justify-between text-[10px] text-on-surface-variant mt-2 border-t border-outline-variant/50 pt-2 font-mono">
              <span class="text-emerald-600">IN: {{ stat.summary.totalPayIn }}</span>
              <span class="text-amber-600">OUT: {{ stat.summary.totalPayOut }}</span>
            </div>
            <div class="text-[10px] text-on-surface-variant text-right font-mono text-error">
              DROP: {{ stat.summary.totalCashDrop }}
            </div>
          </div>
        </div>

        <div v-else class="flex justify-center py-8">
          <span class="animate-pulse text-on-surface-variant text-sm font-semibold">Loading Analytics...</span>
        </div>

        <!-- Today's Movements Table -->
        <div class="flex flex-col gap-3 mt-2">
          <h3 class="text-sm font-bold text-on-surface border-b border-outline-variant pb-2">Recent Shift Movements</h3>
          
          <div class="overflow-x-auto rounded-xl border border-outline-variant">
            <table class="w-full text-left text-sm whitespace-nowrap">
              <thead class="bg-surface-container-low text-xs uppercase text-on-surface-variant font-mono tracking-wider border-b border-outline-variant">
                <tr>
                  <th class="px-4 py-3">Time</th>
                  <th class="px-4 py-3">Type</th>
                  <th class="px-4 py-3">Amount</th>
                  <th class="px-4 py-3">Reason</th>
                  <th class="px-4 py-3">Authorized By</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-outline-variant bg-surface-container-lowest">
                <tr v-if="!recentMovements.length">
                  <td colspan="5" class="px-4 py-8 text-center text-on-surface-variant text-xs italic">
                    No cash movements recorded during this shift.
                  </td>
                </tr>
                <tr v-for="m in recentMovements" :key="m.id" class="hover:bg-surface-container/30 transition-colors">
                  <td class="px-4 py-3 font-mono text-xs">{{ formatTime(m.createdAt) }}</td>
                  <td class="px-4 py-3">
                    <span 
                      class="px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                      :class="m.type === 'PAY_IN' ? 'bg-emerald-100 text-emerald-800' : m.type === 'PAY_OUT' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'"
                    >
                      {{ m.type.replace('_', ' ') }}
                    </span>
                  </td>
                  <td class="px-4 py-3 font-mono font-black" :class="m.type === 'PAY_IN' ? 'text-emerald-600' : 'text-rose-600'">
                    {{ m.type === 'PAY_IN' ? '+' : '-' }}{{ formatCurrency(m.amount, settings.currency) }}
                  </td>
                  <td class="px-4 py-3 text-xs text-on-surface-variant truncate max-w-[200px]" :title="m.reason">{{ m.reason }}</td>
                  <td class="px-4 py-3 text-xs text-on-surface">{{ m.authorizedByName || 'N/A' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useAppViewModel } from '../../viewmodels/useAppViewModel';
import { formatCurrency } from '../../models/mockData';
import Modal from '../common/Modal.vue';
import { Plus, ArrowLeft } from 'lucide-vue-next';

const vm = useAppViewModel();
const settings = computed(() => vm.settings.value);

const isAdding = ref(false);
const isSubmitting = ref(false);
const newMovement = ref({
  type: 'PAY_IN',
  amount: '',
  reason: ''
});

watch(() => vm.showCashMovementsModal.value, (isOpen) => {
  if (isOpen) {
    isAdding.value = false;
    vm.fetchCashMovementAnalytics();
  }
});

const handleClose = () => {
  vm.showCashMovementsModal.value = false;
  isAdding.value = false;
};

const periods = computed(() => {
  if (!vm.cashMovementAnalytics.value) return {};
  return {
    'Today': vm.cashMovementAnalytics.value.today,
    'This Week': vm.cashMovementAnalytics.value.week,
    'This Month': vm.cashMovementAnalytics.value.month,
    'This Year': vm.cashMovementAnalytics.value.year
  };
});

const recentMovements = computed(() => {
  if (!vm.cashMovementAnalytics.value?.today?.movements) return [];
  return vm.cashMovementAnalytics.value.today.movements;
});

const formatTime = (isoString: string) => {
  if (!isoString) return '';
  const d = new Date(isoString);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const submitMovement = async () => {
  isSubmitting.value = true;
  const success = await vm.createCashMovement(
    newMovement.value.type, 
    parseFloat(newMovement.value.amount), 
    newMovement.value.reason
  );
  isSubmitting.value = false;
  
  if (success) {
    isAdding.value = false;
    newMovement.value = { type: 'PAY_IN', amount: '', reason: '' };
  }
};
</script>
