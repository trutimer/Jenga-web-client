<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
    <div class="bg-surface rounded-2xl border border-outline-variant shadow-2xl w-full max-w-lg overflow-hidden animate-scale-up">
      <!-- Modal Header -->
      <div class="px-6 py-4.5 border-b border-outline-variant flex items-center justify-between bg-surface-container-low shrink-0">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <UtensilsCrossed class="w-5 h-5" />
          </div>
          <div>
            <h3 class="text-base font-black text-on-surface">
              {{ $t('warehouses.recordConsumptionTitle') }}
            </h3>
            <p class="text-xs text-on-surface-variant font-medium">
              {{ $t('warehouses.recordConsumptionDesc') }}
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

      <!-- Modal Body -->
      <form @submit.prevent="handleSubmit" class="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
        <!-- Error Alert -->
        <div v-if="errorMessage" class="p-3 rounded-xl bg-error/10 border border-error/20 text-error text-xs flex items-center gap-2">
          <AlertCircle class="w-4 h-4 shrink-0" />
          <span>{{ errorMessage }}</span>
        </div>

        <!-- Location Selector -->
        <div class="space-y-1.5">
          <label class="text-xs font-bold text-on-surface uppercase tracking-wider block">
            Drawing Location (Source Stock) <span class="text-error">*</span>
          </label>
          <select 
            v-model="locationId"
            required
            class="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface text-xs font-semibold focus:border-primary focus:ring-1 focus:ring-primary outline-none"
          >
            <option value="" disabled>-- Select Storage Location --</option>
            <option v-for="loc in locations" :key="loc.id" :value="loc.id">
              {{ loc.name }} ({{ loc.locationType }})
            </option>
          </select>
        </div>

        <!-- Product Selector -->
        <div class="space-y-1.5">
          <label class="text-xs font-bold text-on-surface uppercase tracking-wider block">
            Product Item <span class="text-error">*</span>
          </label>
          <div class="relative">
            <Search class="w-4 h-4 text-outline absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input 
              type="text"
              v-model="productSearch"
              placeholder="Search product to consume..."
              class="w-full bg-surface-container-low pl-9 pr-4 py-2.5 border border-outline-variant rounded-xl text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-semibold text-on-surface"
            />

            <!-- Selected Product Pill -->
            <div 
              v-if="selectedProduct" 
              class="mt-2 p-2.5 rounded-xl bg-primary/5 border border-primary/20 flex items-center justify-between text-xs font-bold"
            >
              <div>
                <span class="text-primary block">{{ selectedProduct.name }}</span>
                <span class="text-[10px] font-mono text-on-surface-variant font-medium">
                  On-Hand: {{ selectedStockAvailable }} {{ selectedProduct.unitOfMeasure || 'PCS' }}
                </span>
              </div>
              <button 
                type="button" 
                @click="selectedProduct = null; productSearch = ''" 
                class="text-outline hover:text-error cursor-pointer border-0 bg-transparent p-1"
              >
                <X class="w-4 h-4" />
              </button>
            </div>

            <!-- Search Dropdown -->
            <div 
              v-else-if="productSearch.trim() && searchResults.length > 0"
              class="absolute left-0 right-0 top-full mt-1.5 bg-surface rounded-xl border border-outline-variant shadow-xl z-20 max-h-48 overflow-y-auto divide-y divide-outline-variant/60"
            >
              <button
                type="button"
                v-for="p in searchResults"
                :key="p.id"
                @click="selectProduct(p)"
                class="w-full p-2.5 text-left hover:bg-primary/5 flex items-center justify-between text-xs transition-colors cursor-pointer border-0 bg-transparent"
              >
                <div>
                  <span class="font-bold text-on-surface block truncate">{{ p.name }}</span>
                  <span v-if="p.purpose === 'INTERNAL_USE'" class="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
                    Internal Use Item
                  </span>
                </div>
                <span class="text-[10px] font-mono text-outline shrink-0">
                  {{ p.category || 'General' }}
                </span>
              </button>
            </div>
          </div>
        </div>

        <!-- Quantity Input -->
        <div class="space-y-1.5">
          <label class="text-xs font-bold text-on-surface uppercase tracking-wider block">
            Quantity Consumed <span class="text-error">*</span>
          </label>
          <div class="relative">
            <input 
              type="number"
              min="0.01"
              step="any"
              v-model.number="quantity"
              required
              placeholder="e.g. 2.5"
              class="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface text-xs font-mono font-bold focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            />
            <span class="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-outline">
              {{ selectedProduct?.unitOfMeasure || 'PCS' }}
            </span>
          </div>
        </div>

        <!-- Reason Presets -->
        <div class="space-y-1.5">
          <label class="text-xs font-bold text-on-surface uppercase tracking-wider block">
            Operational Reason / Category <span class="text-error">*</span>
          </label>
          <div class="grid grid-cols-2 gap-2">
            <button
              type="button"
              v-for="r in reasonOptions"
              :key="r.key"
              @click="reason = r.label"
              class="p-2 rounded-lg border text-left text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
              :class="reason === r.label 
                ? 'border-primary bg-primary/10 text-primary' 
                : 'border-outline-variant bg-surface-container-lowest text-on-surface hover:bg-surface-container-low'"
            >
              <span>{{ r.label }}</span>
            </button>
          </div>
        </div>

        <!-- Detailed Notes -->
        <div class="space-y-1.5">
          <label class="text-xs font-bold text-on-surface uppercase tracking-wider block">
            Additional Notes
          </label>
          <input 
            type="text"
            v-model="notes"
            placeholder="e.g. Prepared 40 lunch portions for weekend event"
            class="w-full px-3.5 py-2 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface text-xs font-medium focus:border-primary focus:ring-1 focus:ring-primary outline-none"
          />
        </div>

        <!-- GL Expense Notice -->
        <div class="p-3 rounded-xl bg-surface-container-low border border-outline-variant/60 text-[11px] text-on-surface-variant flex items-center gap-2">
          <CheckCircle2 class="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Deducts inventory stock and immediately posts <strong>DR Kitchen/Operating Expense</strong> in General Ledger.</span>
        </div>

        <!-- Modal Actions -->
        <div class="flex items-center justify-end gap-2.5 pt-3 border-t border-outline-variant">
          <button
            type="button"
            @click="$emit('close')"
            class="px-4 py-2 rounded-xl border border-outline-variant text-on-surface hover:bg-surface-container font-semibold text-xs cursor-pointer transition-all bg-transparent"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="isSubmitting || !selectedProduct || !quantity"
            class="px-5 py-2 rounded-xl bg-primary text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm hover:opacity-95 disabled:opacity-50 transition-all border-0"
          >
            <Loader2 v-if="isSubmitting" class="w-4 h-4 animate-spin" />
            <UtensilsCrossed v-else class="w-4 h-4" />
            <span>Record Consumption</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { 
  UtensilsCrossed, 
  X, 
  Search, 
  AlertCircle, 
  CheckCircle2, 
  Loader2 
} from 'lucide-vue-next';
import type { 
  InventoryLocation, 
  Product, 
  InternalConsumptionResponse 
} from '../../models/types';
import { warehouseService } from '../../services/warehouseService';

const props = defineProps<{
  isOpen: boolean;
  locations: InventoryLocation[];
  allProducts: Product[];
  initialLocationId?: string;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'consumed', res: InternalConsumptionResponse): void;
}>();

const locationId = ref('');
const productSearch = ref('');
const selectedProduct = ref<Product | null>(null);
const quantity = ref<number | null>(null);
const reason = ref('🍳 Kitchen / Recipe Preparation');
const notes = ref('');
const isSubmitting = ref(false);
const errorMessage = ref<string | null>(null);
const selectedStockAvailable = ref<number>(0);

const reasonOptions = [
  { key: 'kitchen', label: '🍳 Kitchen Recipe Prep' },
  { key: 'packaging', label: '🛍️ Packaging & Bags' },
  { key: 'staff', label: '☕ Staff Refreshment' },
  { key: 'cleaning', label: '🧹 Cleaning Supplies' },
  { key: 'testing', label: '🔬 Quality Testing' },
  { key: 'other', label: '📝 Other Operational' },
];

watch(() => props.isOpen, (open) => {
  if (open) {
    errorMessage.value = null;
    selectedProduct.value = null;
    quantity.value = null;
    notes.value = '';
    productSearch.value = '';
    locationId.value = props.initialLocationId || props.locations[0]?.id || '';
  }
}, { immediate: true });

const searchResults = computed(() => {
  if (!productSearch.value.trim()) return [];
  const q = productSearch.value.toLowerCase().trim();
  return props.allProducts
    .filter(p => 
      p.name.toLowerCase().includes(q) ||
      (p.barcode && p.barcode.toLowerCase().includes(q)) ||
      (p.sku && p.sku.toLowerCase().includes(q))
    )
    .slice(0, 8);
});

const selectProduct = (p: Product) => {
  selectedProduct.value = p;
  productSearch.value = p.name;
  selectedStockAvailable.value = p.stock || 0;
};

const handleSubmit = async () => {
  if (!locationId.value || !selectedProduct.value || !quantity.value || quantity.value <= 0) {
    errorMessage.value = 'Please fill all required fields';
    return;
  }

  isSubmitting.value = true;
  errorMessage.value = null;

  try {
    const payload = {
      locationId: locationId.value,
      productId: selectedProduct.value.id,
      quantity: quantity.value,
      reason: reason.value,
      notes: notes.value.trim() || undefined
    };

    const res = await warehouseService.recordConsumption(payload);
    emit('consumed', res);
    emit('close');
  } catch (err: any) {
    errorMessage.value = err.message || 'Failed to record internal consumption';
  } finally {
    isSubmitting.value = false;
  }
};
</script>
