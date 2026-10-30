<template>
  <div v-if="isOpen && transfer" class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
    <div class="bg-surface rounded-2xl border border-outline-variant shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden animate-scale-up">
      <!-- Modal Header -->
      <div class="px-6 py-4 border-b border-outline-variant flex items-center justify-between bg-surface-container-low shrink-0">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Truck class="w-5 h-5" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h3 class="text-base font-black text-on-surface">
                Transfer {{ transfer.transferNumber }}
              </h3>
              <span 
                class="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border"
                :class="getStatusBadgeClass(transfer.status)"
              >
                {{ formatStatus(transfer.status) }}
              </span>
            </div>
            <p class="text-xs text-on-surface-variant font-medium mt-0.5">
              Initiated by {{ transfer.initiatedByName }} on {{ formatDate(transfer.createdAt) }}
            </p>
          </div>
        </div>
        <button 
          @click="$emit('close')" 
          class="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors cursor-pointer border-0 bg-transparent"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Route Banner -->
      <div class="p-4 bg-surface-container-lowest border-b border-outline-variant/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div class="flex items-center gap-3 text-xs">
          <div class="flex items-center gap-1.5 font-bold text-on-surface">
            <Warehouse class="w-4 h-4 text-primary" />
            <span>{{ transfer.sourceLocationName }}</span>
          </div>
          <ArrowRight class="w-4 h-4 text-outline" />
          <div class="flex items-center gap-1.5 font-bold text-on-surface">
            <Store class="w-4 h-4 text-emerald-600" />
            <span>{{ transfer.destinationLocationName }}</span>
          </div>
        </div>

        <div class="text-right text-xs">
          <span class="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">Total Transfer Valuation</span>
          <span class="font-mono font-black text-primary text-sm">
            TZS {{ transfer.totalCostValue?.toLocaleString() || 0 }}
          </span>
          <span
            v-if="transfer.status === 'PARTIALLY_RECEIVED' && transfer.remainingCostValue !== undefined"
            class="text-[10px] font-mono font-bold text-purple-600 block mt-0.5"
          >
            TZS {{ transfer.remainingCostValue.toLocaleString() }} still in transit
          </span>
        </div>
      </div>

      <!-- Modal Body -->
      <div class="flex-1 overflow-y-auto p-6 space-y-5">
        <!-- Inline Action Error Banner -->
        <div v-if="errorMessage" class="p-3 rounded-xl bg-error/10 border border-error/20 text-error text-xs flex items-center gap-2">
          <AlertCircle class="w-4 h-4 shrink-0" />
          <span>{{ errorMessage }}</span>
        </div>

        <!-- Discrepancy or Rejection Notice -->
        <div v-if="transfer.rejectionReason" class="p-3 rounded-xl bg-error/10 border border-error/20 text-error text-xs flex items-center gap-2">
          <AlertCircle class="w-4 h-4 shrink-0" />
          <span><strong>Reason:</strong> {{ transfer.rejectionReason }}</span>
        </div>

        <!-- Transfer Items Table -->
        <div class="space-y-2">
          <span class="text-xs font-bold text-on-surface uppercase tracking-wider block">
            Manifest Line Items ({{ transfer.items?.length || 0 }})
          </span>
          <div class="overflow-x-auto border border-outline-variant rounded-xl bg-surface-container-lowest">
            <table class="w-full text-left text-xs border-collapse">
              <thead>
                <tr class="bg-surface-container-low border-b border-outline-variant text-[10px] font-mono font-bold uppercase tracking-wider text-on-surface-variant">
                  <th class="py-2.5 px-3">Product Name</th>
                  <th class="py-2.5 px-2 text-right">Requested</th>
                  <th class="py-2.5 px-2 text-right">Dispatched</th>
                  <th class="py-2.5 px-2 text-right">Received</th>
                  <th class="py-2.5 px-3 text-right">Unit Cost</th>
                  <th class="py-2.5 px-3 text-right">Line Total</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-outline-variant/50 font-medium">
                <tr v-for="it in transfer.items" :key="it.productId" class="hover:bg-surface-container-low/40">
                  <td class="py-2.5 px-3">
                    <span class="font-bold text-on-surface block truncate max-w-[200px]">{{ it.productName }}</span>
                    <span class="text-[10px] font-mono text-outline block">{{ it.productSku || it.sku || it.productBarcode || it.barcode || '' }}</span>
                  </td>
                  <td class="py-2.5 px-2 text-right font-mono font-bold text-on-surface">
                    {{ it.requestedQuantity }}
                  </td>
                  <td class="py-2.5 px-2 text-right font-mono text-amber-600 font-bold">
                    {{ it.dispatchedQuantity ?? it.requestedQuantity }}
                  </td>
                  <td class="py-2.5 px-2 text-right font-mono font-bold">
                    <span :class="(it.receivedQuantity ?? 0) > 0 || transfer.status === 'COMPLETED' ? 'text-emerald-600' : 'text-outline'">
                      {{ it.receivedQuantity !== undefined && it.receivedQuantity !== null ? it.receivedQuantity : '-' }}
                    </span>
                    <span
                      v-if="transfer.status === 'PARTIALLY_RECEIVED' && getItemRemaining(it) > 0"
                      class="text-[10px] font-mono text-purple-600 block"
                    >
                      {{ getItemRemaining(it) }} in transit
                    </span>
                    <span
                      v-if="(it.returnedQuantity ?? 0) > 0"
                      class="text-[10px] font-mono text-blue-600 block"
                    >
                      {{ it.returnedQuantity }} returned
                    </span>
                    <span
                      v-if="(it.damagedQuantity ?? 0) > 0"
                      class="text-[10px] font-mono text-error block"
                    >
                      {{ it.damagedQuantity }} shrinkage
                    </span>
                  </td>
                  <td class="py-2.5 px-3 text-right font-mono text-on-surface-variant">
                    TZS {{ it.unitCost?.toLocaleString() || 0 }}
                  </td>
                  <td class="py-2.5 px-3 text-right font-mono font-bold text-primary">
                    TZS {{ ((it.requestedQuantity || 0) * (it.unitCost || 0)).toLocaleString() }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Notes & Audit Trail -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- Notes -->
          <div class="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/60 text-xs space-y-1">
            <span class="font-bold text-on-surface block uppercase tracking-wider text-[10px]">Dispatch & Transport Notes</span>
            <p class="text-on-surface-variant font-medium whitespace-pre-line">
              {{ transfer.notes || 'No special transport instructions provided.' }}
            </p>
          </div>

          <!-- Audit Timeline -->
          <div class="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/60 text-xs space-y-1.5">
            <span class="font-bold text-on-surface block uppercase tracking-wider text-[10px]">Audit Trail</span>
            <div class="space-y-1 text-[11px] font-medium text-on-surface-variant">
              <div v-if="transfer.dispatchedByName" class="flex justify-between">
                <span>Dispatched:</span>
                <span class="font-bold text-on-surface">{{ transfer.dispatchedByName }} ({{ formatDate(transfer.dispatchedAt) }})</span>
              </div>
              <div v-if="transfer.receivedByName" class="flex justify-between">
                <span>{{ transfer.status === 'PARTIALLY_RECEIVED' ? 'Last Received:' : 'Received:' }}</span>
                <span class="font-bold text-emerald-600">{{ transfer.receivedByName }}<template v-if="transfer.completedAt"> ({{ formatDate(transfer.completedAt) }})</template></span>
              </div>
              <div v-if="transfer.cancelledByName" class="flex justify-between">
                <span>Cancelled:</span>
                <span class="font-bold text-error">{{ transfer.cancelledByName }} ({{ formatDate(transfer.cancelledAt) }})</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Confirm Receipt Form (When Action Active) -->
        <div v-if="isConfirming" class="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-3.5 animate-fade-in">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 class="w-4 h-4" />
              {{ transfer.status === 'PARTIALLY_RECEIVED' ? 'Receive Remaining In-Transit Stock' : 'Confirm Receipt of Stock' }}
            </span>
            <span class="text-[11px] text-on-surface-variant">Enter actual quantities received now</span>
          </div>

          <div class="space-y-2">
            <div 
              v-for="it in receiptForm.items" 
              :key="it.productId"
              class="flex items-center justify-between gap-3 p-2.5 bg-surface rounded-lg border border-outline-variant text-xs"
            >
              <div class="min-w-0 flex-1">
                <span class="font-bold text-on-surface truncate block">{{ it.productName }}</span>
                <span class="text-[10px] font-mono text-on-surface-variant">
                  In transit: <strong>{{ it.maxReceivable }}</strong>
                  <template v-if="it.alreadyReceived > 0"> • Already received: {{ it.alreadyReceived }}</template>
                </span>
              </div>
              <div class="flex items-center gap-1.5 shrink-0">
                <span class="text-[11px] text-outline">Receive now:</span>
                <input 
                  type="number"
                  min="0"
                  :max="it.maxReceivable"
                  step="any"
                  v-model.number="it.receivedQuantity"
                  class="w-20 px-2 py-1 rounded border border-outline-variant text-center font-mono font-bold text-xs outline-none focus:border-primary"
                />
                <span class="text-[11px] font-mono text-on-surface-variant">/ {{ it.maxReceivable }}</span>
              </div>
            </div>
          </div>

          <!-- Partial Receive / Shortfall Resolution Selector -->
          <div
            v-if="hasShortfall"
            class="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2.5 animate-fade-in"
          >
            <div class="flex items-center justify-between gap-2">
              <span class="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
                Partial Receipt Detected ({{ totalShortfallUnits }} unreceived) — How should the remainder be handled?
              </span>
            </div>

            <div class="grid grid-cols-1 gap-2">
              <label
                class="flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-colors bg-surface text-xs"
                :class="receiptForm.discrepancyAction === 'KEEP_IN_TRANSIT' ? 'border-primary ring-1 ring-primary/30' : 'border-outline-variant'"
              >
                <input
                  type="radio"
                  value="KEEP_IN_TRANSIT"
                  v-model="receiptForm.discrepancyAction"
                  class="mt-0.5 accent-primary"
                />
                <div>
                  <span class="font-bold text-on-surface block">Still In Transit (Partial Receive)</span>
                  <span class="text-[11px] text-on-surface-variant">
                    Credit received items now and keep the remaining {{ totalShortfallUnits }} unit(s) in transit to receive later.
                  </span>
                </div>
              </label>

              <label
                class="flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-colors bg-surface text-xs"
                :class="receiptForm.discrepancyAction === 'RETURN_TO_SOURCE' ? 'border-primary ring-1 ring-primary/30' : 'border-outline-variant'"
              >
                <input
                  type="radio"
                  value="RETURN_TO_SOURCE"
                  v-model="receiptForm.discrepancyAction"
                  class="mt-0.5 accent-primary"
                />
                <div>
                  <span class="font-bold text-on-surface block">Return Remainder to {{ transfer.sourceLocationName }}</span>
                  <span class="text-[11px] text-on-surface-variant">
                    Credit received items here, restore unreceived {{ totalShortfallUnits }} unit(s) back to origin stock, and close transfer.
                  </span>
                </div>
              </label>

              <label
                class="flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-colors bg-surface text-xs"
                :class="receiptForm.discrepancyAction === 'WRITE_OFF_SHRINKAGE' ? 'border-error ring-1 ring-error/30' : 'border-outline-variant'"
              >
                <input
                  type="radio"
                  value="WRITE_OFF_SHRINKAGE"
                  v-model="receiptForm.discrepancyAction"
                  class="mt-0.5 accent-red-600"
                />
                <div>
                  <span class="font-bold text-error block">Lost / Damaged in Transit (Write Off Shrinkage)</span>
                  <span class="text-[11px] text-on-surface-variant">
                    Credit received items here, expense {{ totalShortfallUnits }} unit(s) to Stock Wastage &amp; Shrinkage, and close transfer.
                  </span>
                </div>
              </label>
            </div>
          </div>

          <div class="space-y-1">
            <label class="text-[11px] font-bold text-on-surface uppercase tracking-wider block">
              Receipt / Discrepancy Notes
              <span v-if="hasShortfall && receiptForm.discrepancyAction === 'WRITE_OFF_SHRINKAGE'" class="text-error">*</span>
              <span v-else class="text-outline font-normal lowercase">(optional)</span>
            </label>
            <input 
              type="text"
              v-model="receiptForm.notes"
              :placeholder="hasShortfall ? 'Explain partial delivery, returned units, or transit damage...' : 'e.g. All items received intact without damage'"
              class="w-full px-3 py-1.5 rounded-lg border border-outline-variant bg-surface text-xs outline-none focus:border-primary"
            />
          </div>

          <div class="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              @click="isConfirming = false; errorMessage = ''"
              class="px-3 py-1.5 rounded-lg border border-outline-variant text-xs font-bold text-on-surface hover:bg-surface-container bg-transparent cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              :disabled="isSubmitting"
              @click="handleExecuteConfirm"
              class="px-4 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors flex items-center gap-1.5 cursor-pointer border-0 disabled:opacity-50"
            >
              <Loader2 v-if="isSubmitting" class="w-3.5 h-3.5 animate-spin" />
              <CheckCircle2 v-else class="w-3.5 h-3.5" />
              <span>{{ hasShortfall && receiptForm.discrepancyAction === 'KEEP_IN_TRANSIT' ? 'Confirm Partial Receipt' : 'Submit Receipt Confirmation' }}</span>
            </button>
          </div>
        </div>

        <!-- Cancel Prompt Form -->
        <div v-if="isCancelling" class="p-4 rounded-xl bg-error/5 border border-error/20 space-y-3 animate-fade-in">
          <span class="text-xs font-bold text-error uppercase tracking-wider block">
            Reason for Cancelling Transfer
          </span>
          <input 
            type="text"
            v-model="cancelReason"
            placeholder="e.g. Wrong items selected / transfer no longer needed"
            class="w-full px-3 py-2 rounded-lg border border-error/30 bg-surface text-xs outline-none focus:border-error"
          />
          <div class="flex items-center justify-end gap-2">
            <button
              type="button"
              @click="isCancelling = false; errorMessage = ''"
              class="px-3 py-1.5 rounded-lg border border-outline-variant text-xs font-bold text-on-surface hover:bg-surface-container bg-transparent cursor-pointer"
            >
              Dismiss
            </button>
            <button
              type="button"
              :disabled="isSubmitting || !cancelReason.trim()"
              @click="handleExecuteCancel"
              class="px-4 py-1.5 rounded-lg bg-error text-white text-xs font-bold hover:opacity-95 transition-opacity flex items-center gap-1.5 cursor-pointer border-0"
            >
              <Loader2 v-if="isSubmitting" class="w-3.5 h-3.5 animate-spin" />
              <span>Confirm Cancellation</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="px-6 py-3.5 border-t border-outline-variant flex items-center justify-between bg-surface-container-low shrink-0 text-xs">
        <button
          type="button"
          @click="handlePrintGatePass"
          class="h-9 px-3.5 rounded-xl border border-outline-variant text-on-surface hover:bg-surface-container font-semibold flex items-center gap-1.5 cursor-pointer transition-all bg-surface"
        >
          <Printer class="w-4 h-4 text-outline" />
          <span>Print Gate Pass</span>
        </button>

        <div class="flex items-center gap-2">
          <!-- Cancel Transfer Button -->
          <button
            v-if="(transfer.status === 'IN_TRANSIT' || transfer.status === 'PENDING_APPROVAL') && !isConfirming && !isCancelling"
            type="button"
            @click="isCancelling = true; errorMessage = ''"
            class="h-9 px-3.5 rounded-xl border border-error/30 text-error hover:bg-error/10 font-bold flex items-center gap-1.5 cursor-pointer transition-all bg-transparent"
          >
            <Ban class="w-4 h-4" />
            <span>Cancel Transfer</span>
          </button>

          <!-- Confirm Receipt Button -->
          <button
            v-if="(transfer.status === 'IN_TRANSIT' || transfer.status === 'PARTIALLY_RECEIVED') && !isConfirming && !isCancelling"
            type="button"
            @click="initiateReceiptConfirmation"
            class="h-9 px-4 rounded-xl bg-emerald-600 text-white font-bold flex items-center gap-1.5 cursor-pointer shadow-xs hover:bg-emerald-700 transition-colors border-0"
          >
            <CheckCircle2 class="w-4 h-4" />
            <span>{{ transfer.status === 'PARTIALLY_RECEIVED' ? 'Receive Remaining' : 'Confirm Receipt' }}</span>
          </button>

          <button
            type="button"
            @click="$emit('close')"
            class="h-9 px-4 rounded-xl bg-surface-container-high hover:bg-surface-container-highest font-bold text-on-surface transition-colors cursor-pointer border-0"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue';
import { 
  Truck, 
  Warehouse, 
  Store, 
  ArrowRight, 
  X, 
  Printer, 
  CheckCircle2, 
  Ban, 
  AlertCircle, 
  Loader2 
} from 'lucide-vue-next';
import type {
  StockTransfer,
  StockTransferItem,
  StockTransferStatus,
  StockTransferDiscrepancyAction
} from '../../models/types';
import { warehouseService } from '../../services/warehouseService';

const props = defineProps<{
  isOpen: boolean;
  transfer?: StockTransfer | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'updated', transfer: StockTransfer): void;
}>();

const isConfirming = ref(false);
const isCancelling = ref(false);
const isSubmitting = ref(false);
const cancelReason = ref('');
const errorMessage = ref('');

interface ReceiptItemInput {
  productId: string;
  productName: string;
  maxReceivable: number;
  alreadyReceived: number;
  receivedQuantity: number;
}

const receiptForm = reactive<{
  notes: string;
  discrepancyAction: StockTransferDiscrepancyAction;
  items: ReceiptItemInput[];
}>({
  notes: '',
  discrepancyAction: 'KEEP_IN_TRANSIT',
  items: []
});

watch(
  () => [props.isOpen, props.transfer?.id],
  () => {
    isConfirming.value = false;
    isCancelling.value = false;
    errorMessage.value = '';
    cancelReason.value = '';
  }
);

const getItemRemaining = (it: StockTransferItem): number => {
  if (it.remainingQuantity !== undefined && it.remainingQuantity !== null) {
    return Math.max(0, Number(it.remainingQuantity));
  }
  const dispatched = Number(it.dispatchedQuantity ?? it.requestedQuantity ?? 0);
  const received = Number(it.receivedQuantity ?? 0);
  const returned = Number(it.returnedQuantity ?? 0);
  const damaged = Number(it.damagedQuantity ?? 0);
  return Math.max(0, Number((dispatched - received - returned - damaged).toFixed(2)));
};

const hasShortfall = computed(() =>
  receiptForm.items.some(it => Number(it.receivedQuantity ?? 0) < it.maxReceivable)
);

const totalShortfallUnits = computed(() =>
  Number(
    receiptForm.items
      .reduce((sum, it) => sum + Math.max(0, it.maxReceivable - Number(it.receivedQuantity ?? 0)), 0)
      .toFixed(2)
  )
);

const initiateReceiptConfirmation = () => {
  if (!props.transfer) return;
  errorMessage.value = '';
  isConfirming.value = true;
  isCancelling.value = false;
  receiptForm.notes = '';
  receiptForm.discrepancyAction = 'KEEP_IN_TRANSIT';
  receiptForm.items = (props.transfer.items || [])
    .map(it => {
      const maxReceivable = getItemRemaining(it);
      return {
        productId: it.productId,
        productName: it.productName || 'Product',
        maxReceivable,
        alreadyReceived: Number(it.receivedQuantity ?? 0),
        receivedQuantity: maxReceivable
      };
    })
    .filter(it => it.maxReceivable > 0);
};

const handleExecuteConfirm = async () => {
  if (!props.transfer) return;
  errorMessage.value = '';

  for (const it of receiptForm.items) {
    const qty = Number(it.receivedQuantity);
    if (!Number.isFinite(qty) || qty < 0) {
      errorMessage.value = `Invalid received quantity for ${it.productName}. Quantity cannot be negative.`;
      return;
    }
    if (qty > it.maxReceivable) {
      errorMessage.value = `Received quantity (${qty}) for ${it.productName} cannot exceed remaining in-transit stock (${it.maxReceivable}).`;
      return;
    }
  }

  const totalReceivingNow = receiptForm.items.reduce((sum, it) => sum + Number(it.receivedQuantity || 0), 0);
  if (hasShortfall.value && receiptForm.discrepancyAction === 'KEEP_IN_TRANSIT' && totalReceivingNow <= 0) {
    errorMessage.value = 'Enter at least 1 received item for a partial receipt, or choose Return / Write Off to resolve unreceived stock.';
    return;
  }

  if (hasShortfall.value && receiptForm.discrepancyAction === 'WRITE_OFF_SHRINKAGE' && !receiptForm.notes.trim()) {
    errorMessage.value = 'Please provide discrepancy notes explaining the transit loss or damage before writing off shrinkage.';
    return;
  }

  isSubmitting.value = true;
  try {
    const payload = {
      notes: receiptForm.notes.trim() || undefined,
      discrepancyAction: hasShortfall.value ? receiptForm.discrepancyAction : undefined,
      receivedItems: receiptForm.items.map(it => ({
        productId: it.productId,
        receivedQuantity: Number(it.receivedQuantity)
      }))
    };
    const updated = await warehouseService.confirmTransfer(props.transfer.id, payload);
    emit('updated', updated);
    emit('close');
    isConfirming.value = false;
  } catch (err: any) {
    errorMessage.value = err.message || 'Failed to confirm receipt';
  } finally {
    isSubmitting.value = false;
  }
};

const handleExecuteCancel = async () => {
  if (!props.transfer) return;
  errorMessage.value = '';
  isSubmitting.value = true;
  try {
    const updated = await warehouseService.cancelTransfer(props.transfer.id, cancelReason.value);
    emit('updated', updated);
    isCancelling.value = false;
    emit('close');
  } catch (err: any) {
    errorMessage.value = err.message || 'Failed to cancel transfer';
  } finally {
    isSubmitting.value = false;
  }
};

const handlePrintGatePass = () => {
  window.print();
};

const formatStatus = (status: StockTransferStatus) => {
  switch (status) {
    case 'IN_TRANSIT': return 'In Transit';
    case 'PARTIALLY_RECEIVED': return 'Partially Received';
    case 'PENDING_APPROVAL': return 'Pending Approval';
    case 'COMPLETED': return 'Completed';
    case 'CANCELLED': return 'Cancelled';
    case 'REJECTED': return 'Rejected';
    default: return status;
  }
};

const getStatusBadgeClass = (status: StockTransferStatus) => {
  switch (status) {
    case 'IN_TRANSIT': return 'bg-amber-500/10 text-amber-700 border-amber-500/30';
    case 'PARTIALLY_RECEIVED': return 'bg-purple-500/10 text-purple-700 border-purple-500/30';
    case 'PENDING_APPROVAL': return 'bg-blue-500/10 text-blue-700 border-blue-500/30';
    case 'COMPLETED': return 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30';
    case 'CANCELLED': return 'bg-error/10 text-error border-error/30';
    case 'REJECTED': return 'bg-error/10 text-error border-error/30';
    default: return 'bg-surface-container text-on-surface-variant border-outline-variant';
  }
};

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleString();
};
</script>
