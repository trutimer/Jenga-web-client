<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
    <div class="bg-surface rounded-2xl border border-outline-variant shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-scale-up">
      <!-- Modal Header -->
      <div class="px-6 py-4 border-b border-outline-variant flex items-center justify-between bg-surface-container-low shrink-0">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <ArrowLeftRight class="w-5 h-5" />
          </div>
          <div>
            <h3 class="text-base font-black text-on-surface">
              {{ $t('warehouses.newTransferTitle') }}
            </h3>
            <p class="text-xs text-on-surface-variant font-medium">
              {{ $t('warehouses.newTransferSubtitle') }}
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

      <!-- Stepper Progress Header -->
      <div class="px-6 py-2.5 bg-surface-container-lowest border-b border-outline-variant/60 flex items-center justify-between text-xs font-bold shrink-0">
        <button 
          @click="currentStep = 1" 
          class="flex items-center gap-2 cursor-pointer transition-colors border-0 bg-transparent"
          :class="currentStep === 1 ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'"
        >
          <span class="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold"
            :class="currentStep === 1 ? 'bg-primary text-white' : 'bg-surface-container text-on-surface-variant'">
            1
          </span>
          <span>Route & Mode</span>
        </button>
        <ChevronRight class="w-3.5 h-3.5 text-outline" />

        <button 
          @click="canProceedToStep2 ? currentStep = 2 : null" 
          class="flex items-center gap-2 cursor-pointer transition-colors border-0 bg-transparent"
          :class="currentStep === 2 ? 'text-primary' : (canProceedToStep2 ? 'text-on-surface-variant hover:text-on-surface' : 'text-outline/50 cursor-not-allowed')"
        >
          <span class="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold"
            :class="currentStep === 2 ? 'bg-primary text-white' : 'bg-surface-container text-on-surface-variant'">
            2
          </span>
          <span>Transfer Items ({{ items.length }})</span>
        </button>
        <ChevronRight class="w-3.5 h-3.5 text-outline" />

        <button 
          @click="canProceedToStep3 ? currentStep = 3 : null" 
          class="flex items-center gap-2 cursor-pointer transition-colors border-0 bg-transparent"
          :class="currentStep === 3 ? 'text-primary' : (canProceedToStep3 ? 'text-on-surface-variant hover:text-on-surface' : 'text-outline/50 cursor-not-allowed')"
        >
          <span class="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold"
            :class="currentStep === 3 ? 'bg-primary text-white' : 'bg-surface-container text-on-surface-variant'">
            3
          </span>
          <span>Dispatch</span>
        </button>
      </div>

      <!-- Modal Body -->
      <div class="flex-1 overflow-y-auto p-6 space-y-5">
        <!-- Error Banner -->
        <div v-if="errorMessage" class="p-3 rounded-xl bg-error/10 border border-error/20 text-error text-xs flex items-center gap-2">
          <AlertCircle class="w-4 h-4 shrink-0" />
          <span>{{ errorMessage }}</span>
        </div>

        <!-- ========================================== -->
        <!-- STEP 1: ROUTING & TRANSFER MODE -->
        <!-- ========================================== -->
        <div v-if="currentStep === 1" class="space-y-4 animate-fade-in">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Source Location -->
            <div class="space-y-1.5">
              <label class="text-xs font-bold text-on-surface uppercase tracking-wider block">
                Source Location (From) <span class="text-error">*</span>
              </label>
              <select 
                v-model="sourceLocationId"
                class="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface text-xs font-semibold focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              >
                <option value="" disabled>-- Select Source Location --</option>
                <option v-for="loc in locations" :key="loc.id" :value="loc.id">
                  {{ loc.name }} ({{ getLocationTypeShort(loc.locationType) }})
                </option>
              </select>
              <span v-if="sourceLocation" class="text-[11px] text-on-surface-variant block font-medium">
                {{ sourceLocation.address || 'Active physical storage node' }}
              </span>
            </div>

            <!-- Destination Location -->
            <div class="space-y-1.5">
              <label class="text-xs font-bold text-on-surface uppercase tracking-wider block">
                Destination Location (To) <span class="text-error">*</span>
              </label>
              <select 
                v-model="destinationLocationId"
                class="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface text-xs font-semibold focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              >
                <option value="" disabled>-- Select Destination Location --</option>
                <option 
                  v-for="loc in permittedDestinations" 
                  :key="loc.id" 
                  :value="loc.id"
                >
                  {{ loc.name }} ({{ getLocationTypeShort(loc.locationType) }})
                </option>
              </select>
              <span v-if="destinationLocation" class="text-[11px] text-on-surface-variant block font-medium">
                {{ destinationLocation.address || 'Receiving location' }}
              </span>
            </div>
          </div>

          <!-- Transfer Mode Options -->
          <div class="space-y-2 pt-2 border-t border-outline-variant/60">
            <label class="text-xs font-bold text-on-surface uppercase tracking-wider block">
              Transfer Workflow Mode
            </label>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                @click="autoConfirm = false"
                class="p-3.5 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer"
                :class="!autoConfirm 
                  ? 'border-primary bg-primary/5 text-primary shadow-xs ring-1 ring-primary' 
                  : 'border-outline-variant hover:border-outline text-on-surface bg-surface-container-lowest'"
              >
                <div class="flex items-center justify-between">
                  <span class="font-bold text-xs flex items-center gap-1.5">
                    <Truck class="w-4 h-4" />
                    Standard 2-Step (In-Transit)
                  </span>
                  <span v-if="!autoConfirm" class="w-2 h-2 rounded-full bg-primary"></span>
                </div>
                <span class="text-[11px] text-on-surface-variant font-normal leading-tight">
                  Stock is dispatched and marked in-transit until destination manager physically verifies and confirms receipt.
                </span>
              </button>

              <button
                type="button"
                @click="autoConfirm = true"
                class="p-3.5 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer"
                :class="autoConfirm 
                  ? 'border-primary bg-primary/5 text-primary shadow-xs ring-1 ring-primary' 
                  : 'border-outline-variant hover:border-outline text-on-surface bg-surface-container-lowest'"
              >
                <div class="flex items-center justify-between">
                  <span class="font-bold text-xs flex items-center gap-1.5">
                    <Zap class="w-4 h-4" />
                    Direct Transfer (Instant)
                  </span>
                  <span v-if="autoConfirm" class="w-2 h-2 rounded-full bg-primary"></span>
                </div>
                <span class="text-[11px] text-on-surface-variant font-normal leading-tight">
                  Immediate 1-step stock relocation from source directly into destination without an in-transit holding phase.
                </span>
              </button>
            </div>
          </div>
        </div>

        <!-- ========================================== -->
        <!-- STEP 2: SELECT TRANSFER ITEMS -->
        <!-- ========================================== -->
        <div v-else-if="currentStep === 2" class="space-y-4 animate-fade-in">
          <!-- Search Product to Add -->
          <div class="space-y-2">
            <label class="text-xs font-bold text-on-surface uppercase tracking-wider block">
              Search & Add Products from Catalogue
            </label>
            <div class="relative">
              <Search class="w-4 h-4 text-outline absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input 
                type="text"
                v-model="productSearch"
                placeholder="Type product name, barcode or SKU..."
                class="w-full bg-surface-container-low pl-9 pr-4 py-2.5 border border-outline-variant rounded-xl text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-semibold text-on-surface"
              />

              <!-- Search Results Dropdown -->
              <div 
                v-if="productSearch.trim() && searchResults.length > 0"
                class="absolute left-0 right-0 top-full mt-1.5 bg-surface rounded-xl border border-outline-variant shadow-xl z-20 max-h-56 overflow-y-auto divide-y divide-outline-variant/60"
              >
                <button
                  type="button"
                  v-for="p in searchResults"
                  :key="p.id"
                  @click="addItem(p)"
                  class="w-full p-2.5 text-left hover:bg-primary/5 flex items-center justify-between text-xs transition-colors cursor-pointer border-0 bg-transparent"
                >
                  <div>
                    <span class="font-bold text-on-surface block truncate">{{ p.name }}</span>
                    <span class="text-[10px] font-mono text-on-surface-variant">
                      {{ p.barcode ? `BAR: ${p.barcode}` : (p.sku ? `SKU: ${p.sku}` : '') }}
                    </span>
                  </div>
                  <div class="text-right shrink-0">
                    <span class="font-bold text-primary font-mono block">
                      Avail: {{ getAvailableSourceQty(p.id) }} {{ p.unitOfMeasure || 'PCS' }}
                    </span>
                    <span class="text-[10px] font-mono text-outline">
                      Cost: TZS {{ p.cost?.toLocaleString() || 0 }}
                    </span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          <!-- Items Table -->
          <div v-if="items.length === 0" class="p-8 text-center bg-surface-container-low rounded-xl border border-dashed border-outline-variant">
            <PackagePlus class="w-8 h-8 mx-auto text-outline mb-1.5 stroke-[1.5]" />
            <p class="text-xs font-bold text-on-surface">No products added to this transfer yet</p>
            <p class="text-[11px] text-on-surface-variant mt-0.5">Search products above to add items to the transfer manifest.</p>
          </div>

          <div v-else class="space-y-2">
            <div class="overflow-x-auto border border-outline-variant rounded-xl bg-surface-container-lowest">
              <table class="w-full text-left text-xs border-collapse">
                <thead>
                  <tr class="bg-surface-container-low border-b border-outline-variant text-[10px] font-mono font-bold uppercase tracking-wider text-on-surface-variant">
                    <th class="py-2.5 px-3">Product</th>
                    <th class="py-2.5 px-2 text-right">Available</th>
                    <th class="py-2.5 px-3 text-center">Transfer Qty</th>
                    <th class="py-2.5 px-2 text-right">Unit Cost</th>
                    <th class="py-2.5 px-2 text-right">Total</th>
                    <th class="py-2.5 px-2 text-center w-8"></th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-outline-variant/50">
                  <tr v-for="(it, idx) in items" :key="it.productId" class="hover:bg-surface-container-low/40">
                    <td class="py-2.5 px-3">
                      <span class="font-bold text-on-surface block truncate max-w-[160px]">{{ it.productName }}</span>
                      <span class="text-[10px] font-mono text-outline block">{{ it.barcode || it.sku || '' }}</span>
                    </td>
                    <td class="py-2.5 px-2 text-right font-mono font-bold text-on-surface-variant">
                      {{ getAvailableSourceQty(it.productId) }}
                    </td>
                    <td class="py-2.5 px-3 text-center">
                      <input 
                        type="number"
                        min="0.01"
                        step="any"
                        v-model.number="it.requestedQuantity"
                        class="w-20 px-2 py-1 rounded-lg border text-center font-mono text-xs font-bold focus:border-primary outline-none"
                        :class="it.requestedQuantity > getAvailableSourceQty(it.productId) 
                          ? 'border-error bg-error/10 text-error' 
                          : 'border-outline-variant bg-surface text-on-surface'"
                      />
                    </td>
                    <td class="py-2.5 px-2 text-right font-mono text-on-surface-variant">
                      TZS {{ it.unitCost.toLocaleString() }}
                    </td>
                    <td class="py-2.5 px-2 text-right font-mono font-bold text-primary">
                      TZS {{ (it.requestedQuantity * it.unitCost).toLocaleString() }}
                    </td>
                    <td class="py-2.5 px-2 text-center">
                      <button
                        type="button"
                        @click="removeItem(idx)"
                        class="p-1 rounded text-outline hover:text-error hover:bg-error/10 transition-colors cursor-pointer border-0 bg-transparent"
                      >
                        <Trash2 class="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Items Valuation Summary -->
            <div class="p-3 rounded-xl bg-surface-container-low border border-outline-variant flex items-center justify-between text-xs font-bold">
              <span class="text-on-surface-variant">
                Total Manifest: {{ items.length }} Items ({{ totalTransferUnits }} Units)
              </span>
              <span class="text-primary font-mono text-sm">
                TZS {{ totalTransferValue.toLocaleString() }}
              </span>
            </div>
          </div>
        </div>

        <!-- ========================================== -->
        <!-- STEP 3: DISPATCH NOTES & REVIEW -->
        <!-- ========================================== -->
        <div v-else-if="currentStep === 3" class="space-y-4 animate-fade-in">
          <!-- Route Recap Card -->
          <div class="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant space-y-2">
            <span class="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">Transfer Route Summary</span>
            <div class="flex items-center justify-between text-xs font-bold">
              <div class="flex items-center gap-2">
                <Warehouse class="w-4 h-4 text-primary" />
                <span>{{ sourceLocation?.name }}</span>
              </div>
              <ArrowRight class="w-4 h-4 text-outline" />
              <div class="flex items-center gap-2">
                <Store class="w-4 h-4 text-emerald-600" />
                <span>{{ destinationLocation?.name }}</span>
              </div>
            </div>
            <div class="pt-2 border-t border-outline-variant/60 flex items-center justify-between text-xs text-on-surface-variant font-medium">
              <span>Workflow Mode:</span>
              <span class="font-bold text-primary">
                {{ autoConfirm ? 'Direct Instant Transfer' : 'Standard 2-Step In-Transit' }}
              </span>
            </div>
          </div>

          <!-- Transport / Dispatch Notes -->
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-on-surface uppercase tracking-wider block">
              Transport Notes & Delivery Instructions
            </label>
            <textarea 
              v-model="notes"
              rows="3"
              placeholder="e.g. Assigned to driver Rashidi, vehicle T 842 DKB. Required urgently for weekend peak sales."
              class="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface text-xs font-medium focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none"
            ></textarea>
          </div>

          <!-- Maker-Checker Info Box -->
          <div class="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 text-xs flex items-center gap-2">
            <ShieldCheck class="w-4 h-4 shrink-0" />
            <span>
              Transfers are tracked in the immutable inventory movement ledger with snapshot unit costs and audit stamps.
            </span>
          </div>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="px-6 py-3.5 border-t border-outline-variant flex items-center justify-between bg-surface-container-low shrink-0">
        <button
          type="button"
          @click="currentStep > 1 ? currentStep-- : $emit('close')"
          class="px-4 py-2 rounded-xl border border-outline-variant text-on-surface hover:bg-surface-container font-semibold text-xs cursor-pointer transition-all bg-transparent"
        >
          {{ currentStep > 1 ? 'Back' : 'Cancel' }}
        </button>

        <div class="flex items-center gap-2">
          <button
            v-if="currentStep < 3"
            type="button"
            :disabled="currentStep === 1 ? !canProceedToStep2 : !canProceedToStep3"
            @click="currentStep++"
            class="px-5 py-2 rounded-xl bg-primary text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm hover:opacity-95 disabled:opacity-50 transition-all border-0"
          >
            <span>Continue</span>
            <ChevronRight class="w-4 h-4" />
          </button>

          <button
            v-else
            type="button"
            :disabled="isSubmitting || items.length === 0"
            @click="handleSubmitTransfer"
            class="px-5 py-2 rounded-xl bg-primary text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm hover:opacity-95 disabled:opacity-50 transition-all border-0"
          >
            <Loader2 v-if="isSubmitting" class="w-4 h-4 animate-spin" />
            <Truck v-else class="w-4 h-4" />
            <span>{{ autoConfirm ? 'Execute Direct Transfer' : 'Dispatch Stock Transfer' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { 
  ArrowLeftRight, 
  Warehouse, 
  Store, 
  Truck, 
  Zap, 
  X, 
  ChevronRight, 
  Search, 
  Trash2, 
  PackagePlus, 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle, 
  Loader2 
} from 'lucide-vue-next';
import type { 
  InventoryLocation, 
  LocationStock, 
  Product, 
  StockTransfer, 
  LocationType 
} from '../../models/types';
import { warehouseService } from '../../services/warehouseService';

const props = defineProps<{
  isOpen: boolean;
  locations: InventoryLocation[];
  allProducts: Product[];
  initialSourceLocation?: InventoryLocation | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'created', transfer: StockTransfer): void;
}>();

const currentStep = ref(1);
const sourceLocationId = ref('');
const destinationLocationId = ref('');
const autoConfirm = ref(false);
const notes = ref('');
const productSearch = ref('');
const isSubmitting = ref(false);
const errorMessage = ref<string | null>(null);

interface TransferDraftItem {
  productId: string;
  productName: string;
  barcode?: string;
  sku?: string;
  requestedQuantity: number;
  unitCost: number;
}

const items = ref<TransferDraftItem[]>([]);
const sourceStockMap = ref<Record<string, LocationStock>>({});

watch(() => props.isOpen, async (open) => {
  if (open) {
    currentStep.value = 1;
    errorMessage.value = null;
    items.value = [];
    notes.value = '';
    autoConfirm.value = false;
    productSearch.value = '';

    if (props.initialSourceLocation) {
      sourceLocationId.value = props.initialSourceLocation.id;
    } else if (props.locations.length > 0 && props.locations[0]) {
      sourceLocationId.value = props.locations[0].id;
    }
  }
}, { immediate: true });

// Load source stock whenever source location changes
watch(sourceLocationId, async (newId) => {
  if (newId) {
    destinationLocationId.value = '';
    try {
      const stock = await warehouseService.getLocationStock(newId);
      const map: Record<string, LocationStock> = {};
      stock.forEach(s => {
        map[s.productId] = s;
      });
      sourceStockMap.value = map;
    } catch (err) {
      console.error('Failed to load source stock:', err);
      sourceStockMap.value = {};
    }
  }
});

const sourceLocation = computed(() => 
  props.locations.find(l => l.id === sourceLocationId.value)
);

const destinationLocation = computed(() => 
  props.locations.find(l => l.id === destinationLocationId.value)
);

// Permitted destinations based on served branches rules
const permittedDestinations = computed(() => {
  if (!sourceLocationId.value) return [];
  return props.locations.filter(loc => {
    if (loc.id === sourceLocationId.value) return false;
    // If source is a warehouse with restricted branch access
    if (sourceLocation.value?.locationType === 'WAREHOUSE' && !sourceLocation.value.servesAllBranches) {
      if (loc.storeBranchId && sourceLocation.value.servedBranchIds) {
        return sourceLocation.value.servedBranchIds.includes(loc.storeBranchId);
      }
    }
    return true;
  });
});

const canProceedToStep2 = computed(() => 
  !!sourceLocationId.value && !!destinationLocationId.value && sourceLocationId.value !== destinationLocationId.value
);

const canProceedToStep3 = computed(() => 
  canProceedToStep2.value && items.value.length > 0 && items.value.every(it => it.requestedQuantity > 0)
);

const searchResults = computed(() => {
  if (!productSearch.value.trim()) return [];
  const q = productSearch.value.toLowerCase().trim();
  const existingIds = new Set(items.value.map(it => it.productId));
  return props.allProducts
    .filter(p => !existingIds.has(p.id))
    .filter(p => 
      p.name.toLowerCase().includes(q) ||
      (p.barcode && p.barcode.toLowerCase().includes(q)) ||
      (p.sku && p.sku.toLowerCase().includes(q))
    )
    .slice(0, 10);
});

const getAvailableSourceQty = (productId: string): number => {
  const stockItem = sourceStockMap.value[productId];
  if (!stockItem) return 0;
  return Number(stockItem.availableQuantity) || 0;
};

const addItem = (product: Product) => {
  const available = getAvailableSourceQty(product.id);
  items.value.push({
    productId: product.id,
    productName: product.name,
    barcode: product.barcode,
    sku: product.sku,
    requestedQuantity: available > 0 ? 1 : 1,
    unitCost: product.cost || 0
  });
  productSearch.value = '';
};

const removeItem = (index: number) => {
  items.value.splice(index, 1);
};

const totalTransferUnits = computed(() => 
  items.value.reduce((sum, it) => sum + (Number(it.requestedQuantity) || 0), 0)
);

const totalTransferValue = computed(() => 
  items.value.reduce((sum, it) => sum + ((Number(it.requestedQuantity) || 0) * (Number(it.unitCost) || 0)), 0)
);

const getLocationTypeShort = (type?: LocationType) => {
  switch (type) {
    case 'WAREHOUSE': return 'Central WH';
    case 'BRANCH_DEFAULT': return 'Branch Stock';
    case 'BRANCH_WAREHOUSE': return 'Storeroom';
    default: return 'Location';
  }
};

const handleSubmitTransfer = async () => {
  if (items.value.length === 0) {
    errorMessage.value = 'Please add at least one product item to transfer';
    return;
  }

  isSubmitting.value = true;
  errorMessage.value = null;

  try {
    const payload = {
      sourceLocationId: sourceLocationId.value,
      destinationLocationId: destinationLocationId.value,
      autoConfirm: autoConfirm.value,
      notes: notes.value.trim() || undefined,
      items: items.value.map(it => ({
        productId: it.productId,
        quantity: it.requestedQuantity,
        notes: undefined
      }))
    };

    const created = await warehouseService.createTransfer(payload);
    emit('created', created);
    emit('close');
  } catch (err: any) {
    errorMessage.value = err.message || 'Failed to create stock transfer';
  } finally {
    isSubmitting.value = false;
  }
};
</script>
