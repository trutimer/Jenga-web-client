<template>
  <div class="h-full flex flex-col">
    <!-- Header -->
    <header class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-black text-on-surface">Cash Movements</h1>
        <p class="text-sm text-on-surface-variant mt-1">Analytics and history for your current shift</p>
      </div>
      <div class="flex gap-3">
        <button 
          @click="openAddModal"
          class="bg-primary text-on-primary px-4 py-2 rounded-lg font-bold text-sm hover:bg-opacity-90 active:scale-95 transition-all flex items-center gap-2 cursor-pointer shadow-sm"
        >
          <Plus class="w-4 h-4" />
          <span>Add New Movement</span>
        </button>
        
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
      <!-- ADD/EDIT MOVEMENT FORM MODAL -->
      <Modal 
        :isOpen="isAdding" 
        :title="isEditing ? 'Edit Cash Movement' : 'Record Cash Movement'" 
        :onClose="() => { isAdding = false; isEditing = false; editingId = null; validationError = null; }"
        maxWidth="max-w-md"
      >
        <div class="flex flex-col gap-4">
        
        <!-- Validation Error Message -->
        <div v-if="validationError" class="bg-error-container text-on-error-container p-4 rounded-xl border border-error/20 flex items-start gap-3">
          <AlertCircle class="w-5 h-5 text-error mt-0.5 shrink-0" />
          <p class="text-sm font-medium leading-relaxed">{{ validationError }}</p>
        </div>

        <div class="space-y-2">
          <label class="text-xs font-mono font-bold text-on-surface-variant uppercase tracking-wider">Movement Type</label>
          <select 
            v-model="newMovement.type"
            class="w-full bg-surface-container border border-outline-variant rounded-xl p-3.5 text-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none"
          >
            <option value="PAY_IN">Pay In (Add Cash)</option>
            <option value="PAY_OUT">Pay Out (Remove Cash)</option>
            <option value="CASH_DROP">Cash Drop (Safe Deposit)</option>
          </select>
        </div>

        <div class="space-y-2">
          <label class="text-xs font-mono font-bold text-on-surface-variant uppercase tracking-wider">Amount ({{ settings.currency }})</label>
          <input 
            type="number"
            v-model="newMovement.amount"
            placeholder="0.00"
            class="w-full bg-surface-container border border-outline-variant rounded-xl p-3.5 text-lg text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none font-mono"
          />
        </div>

        <div class="space-y-2">
          <label class="text-xs font-mono font-bold text-on-surface-variant uppercase tracking-wider">Reason</label>
          <textarea 
            v-model="newMovement.reason"
            placeholder="e.g. Paid for water, Change from safe..."
            class="w-full bg-surface-container border border-outline-variant rounded-xl p-3.5 text-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none h-24"
          ></textarea>
        </div>

        <button 
          @click="submitMovement"
          :disabled="isSubmitting || !newMovement.amount || !newMovement.reason"
          class="w-full py-4 mt-2 bg-primary text-on-primary hover:bg-opacity-95 rounded-xl transition-all font-bold text-sm shadow-md shadow-primary/20 disabled:opacity-50 cursor-pointer"
        >
          {{ isSubmitting ? 'Saving...' : (isEditing ? 'Save Changes' : 'Submit Movement') }}
        </button>
        </div>
      </Modal>

      <!-- ANALYTICS & TABLE -->
      <div class="flex flex-col gap-8 animate-fade-in mt-2">
        
        <!-- Summary Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4" v-if="vm.cashMovementAnalytics.value">
          <div v-for="(stat, period) in periods" :key="period" class="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant shadow-sm flex flex-col gap-3">
            <span class="text-xs font-mono font-bold text-on-surface-variant uppercase tracking-wider">{{ period }}</span>
            <span class="text-3xl font-black font-mono text-primary truncate" :class="stat.summary.netMovement < 0 ? 'text-error' : 'text-primary'">
              {{ formatCurrency(stat.summary.netMovement, settings.currency) }}
            </span>
            <div class="flex justify-between text-xs text-on-surface-variant mt-2 border-t border-outline-variant/50 pt-3 font-mono">
              <span class="text-emerald-600 font-bold">IN: {{ stat.summary.totalPayIn }}</span>
              <span class="text-amber-600 font-bold">OUT: {{ stat.summary.totalPayOut }}</span>
            </div>
            <div class="text-xs text-on-surface-variant text-right font-mono text-error font-bold mt-1">
              DROP: {{ stat.summary.totalCashDrop }}
            </div>
          </div>
        </div>

        <div v-else class="flex justify-center py-12">
          <span class="animate-pulse text-on-surface-variant text-base font-semibold">Loading Analytics...</span>
        </div>

        <!-- Today's Movements Table -->
        <div class="flex flex-col gap-4">
          <h3 class="text-lg font-bold text-on-surface border-b border-outline-variant pb-3">Recent Shift Movements</h3>
          
          <div class="overflow-x-auto rounded-2xl border border-outline-variant bg-surface-container-lowest shadow-sm">
            <table class="w-full text-left text-sm whitespace-nowrap">
              <thead class="bg-surface-container-low text-xs uppercase text-on-surface-variant font-mono tracking-wider border-b border-outline-variant">
                <tr>
                  <th class="px-5 py-4">Time</th>
                  <th class="px-5 py-4">Type</th>
                  <th class="px-5 py-4">Amount</th>
                  <th class="px-5 py-4">Reason</th>
                  <th class="px-5 py-4">Authorized By</th>
                  <th class="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-outline-variant bg-surface-container-lowest">
                <tr v-if="!recentMovements.length">
                  <td colspan="6" class="px-5 py-12 text-center text-on-surface-variant text-sm italic">
                    No cash movements recorded during this shift.
                  </td>
                </tr>
                <tr v-for="m in recentMovements" :key="m.id" class="hover:bg-surface-container/30 transition-colors">
                  <td class="px-5 py-4 font-mono text-sm">{{ formatTime(m.createdAt) }}</td>
                  <td class="px-5 py-4">
                    <span 
                      class="px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider"
                      :class="m.type === 'PAY_IN' ? 'bg-emerald-100 text-emerald-800' : m.type === 'PAY_OUT' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'"
                    >
                      {{ m.type.replace('_', ' ') }}
                    </span>
                  </td>
                  <td class="px-5 py-4 font-mono font-black text-sm" :class="m.type === 'PAY_IN' ? 'text-emerald-600' : 'text-rose-600'">
                    {{ m.type === 'PAY_IN' ? '+' : '-' }}{{ formatCurrency(m.amount, settings.currency) }}
                  </td>
                  <td class="px-5 py-4 text-sm text-on-surface-variant truncate max-w-[300px]" :title="m.reason">{{ m.reason }}</td>
                  <td class="px-5 py-4 text-sm text-on-surface">{{ m.authorizedByName || 'N/A' }}</td>
                  <td class="px-5 py-4 text-right space-x-2">
                    <button 
                      @click="editMovement(m)"
                      class="p-1.5 rounded-lg hover:bg-primary-container text-primary transition-colors cursor-pointer"
                      title="Edit Movement"
                    >
                      <Edit2 class="w-4 h-4" />
                    </button>
                    <button 
                      @click="confirmDelete(m.id)"
                      class="p-1.5 rounded-lg hover:bg-error-container text-error transition-colors cursor-pointer"
                      title="Delete Movement"
                    >
                      <Trash2 class="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
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
import { Plus, X, AlertCircle, Edit2, Trash2 } from 'lucide-vue-next';

const router = useRouter();
const vm = useAppViewModel();
const settings = computed(() => vm.settings.value);

const isAdding = ref(false);
const isEditing = ref(false);
const editingId = ref<string | null>(null);
const isSubmitting = ref(false);
const validationError = ref<string | null>(null);
const newMovement = ref({
  type: 'PAY_IN',
  amount: '',
  reason: ''
});

onMounted(() => {
  vm.fetchCashMovementAnalytics();
});

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

const openAddModal = () => {
  newMovement.value = { type: 'PAY_IN', amount: '', reason: '' };
  editingId.value = null;
  validationError.value = null;
  isEditing.value = false;
  isAdding.value = true;
};

const editMovement = (movement: any) => {
  newMovement.value = {
    type: movement.type,
    amount: movement.amount,
    reason: movement.reason
  };
  editingId.value = movement.id;
  validationError.value = null;
  isEditing.value = true;
  isAdding.value = true;
};

const confirmDelete = async (id: string) => {
  if (window.confirm('Are you sure you want to delete this cash movement? This will adjust your expected cash.')) {
    await vm.deleteCashMovement(id);
  }
};

const submitMovement = async () => {
  validationError.value = null;
  isSubmitting.value = true;
  
  let result;
  if (isEditing.value && editingId.value) {
    result = await vm.updateCashMovement(
      editingId.value,
      newMovement.value.type, 
      parseFloat(newMovement.value.amount), 
      newMovement.value.reason
    );
  } else {
    result = await vm.createCashMovement(
      newMovement.value.type, 
      parseFloat(newMovement.value.amount), 
      newMovement.value.reason
    );
  }
  
  isSubmitting.value = false;
  
  if (result.success) {
    isAdding.value = false;
    isEditing.value = false;
    editingId.value = null;
    newMovement.value = { type: 'PAY_IN', amount: '', reason: '' };
  } else {
    validationError.value = result.error || 'An unexpected error occurred.';
  }
};
</script>
