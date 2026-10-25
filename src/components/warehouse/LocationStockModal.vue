<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
    <div class="bg-surface rounded-2xl border border-outline-variant shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-scale-up">
      <!-- Modal Header -->
      <div class="px-6 py-4.5 border-b border-outline-variant flex items-center justify-between bg-surface-container-low shrink-0">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Boxes class="w-5 h-5" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h3 class="text-base font-black text-on-surface">
                {{ location?.name || 'Location Stock' }}
              </h3>
              <span 
                v-if="location"
                class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border"
                :class="getLocationTypeBadgeClass(location.locationType)"
              >
                {{ getLocationTypeLabel(location.locationType) }}
              </span>
            </div>
            <p class="text-xs text-on-surface-variant font-medium mt-0.5">
              {{ location?.address || 'Physical inventory on-hand, reserved quantities and reorder thresholds' }}
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

      <!-- KPI Overview Bar -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-surface-container-lowest border-b border-outline-variant shrink-0">
        <div class="p-3 rounded-xl bg-surface-container-low border border-outline-variant/60">
          <span class="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">SKUs Stored</span>
          <span class="text-lg font-black font-mono text-on-surface mt-0.5 block">
            {{ stockItems.length }}
          </span>
        </div>
        <div class="p-3 rounded-xl bg-surface-container-low border border-outline-variant/60">
          <span class="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">Total Units</span>
          <span class="text-lg font-black font-mono text-primary mt-0.5 block">
            {{ formatUnits(totalUnits) }}
          </span>
        </div>
        <div class="p-3 rounded-xl bg-surface-container-low border border-outline-variant/60">
          <span class="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">Reserved (In-Transit)</span>
          <span class="text-lg font-black font-mono text-amber-600 mt-0.5 block">
            {{ formatUnits(totalReserved) }}
          </span>
        </div>
        <div class="p-3 rounded-xl bg-surface-container-low border border-outline-variant/60">
          <span class="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">Asset Valuation</span>
          <span class="text-lg font-black font-mono text-emerald-600 mt-0.5 block truncate">
            {{ formatMoney(totalValuation) }}
          </span>
        </div>
      </div>

      <!-- Search & Filters Toolbar -->
      <div class="p-4 border-b border-outline-variant/60 flex items-center justify-between gap-3 bg-surface shrink-0">
        <div class="relative flex-1 max-w-md">
          <Search class="w-4 h-4 text-outline absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input 
            type="text"
            v-model="searchQuery"
            placeholder="Search product name, barcode or SKU..."
            class="w-full bg-surface-container-low pl-9 pr-8 py-2 border border-outline-variant rounded-xl text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-semibold text-on-surface"
          />
          <button 
            v-if="searchQuery"
            @click="searchQuery = ''"
            class="absolute right-2.5 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface cursor-pointer bg-transparent border-0 p-1"
          >
            <X class="w-3.5 h-3.5" />
          </button>
        </div>

        <button
          v-if="location"
          @click="$emit('transfer', location)"
          class="h-9 px-3.5 rounded-xl bg-primary text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs hover:opacity-95 border-0 shrink-0"
        >
          <ArrowLeftRight class="w-3.5 h-3.5" />
          <span class="hidden sm:inline">Transfer From Here</span>
        </button>
      </div>

      <!-- Stock Table / List -->
      <div class="flex-1 overflow-y-auto p-4">
        <div v-if="isLoading" class="py-16 flex flex-col items-center justify-center text-on-surface-variant">
          <Loader2 class="w-8 h-8 animate-spin text-primary mb-2" />
          <span class="text-xs font-semibold">Loading location inventory...</span>
        </div>

        <div v-else-if="filteredItems.length === 0" class="py-16 text-center text-on-surface-variant">
          <Boxes class="w-12 h-12 mx-auto text-outline mb-2 stroke-[1.5]" />
          <p class="text-sm font-bold text-on-surface">No stock records found</p>
          <p class="text-xs mt-1">This location currently holds no stock matching your filter.</p>
        </div>

        <div v-else class="overflow-x-auto border border-outline-variant/80 rounded-xl bg-surface-container-lowest">
          <table class="w-full text-left border-collapse text-xs">
            <thead>
              <tr class="bg-surface-container-low border-b border-outline-variant/80 text-[10px] font-mono font-bold uppercase tracking-wider text-on-surface-variant">
                <th class="py-3 px-4">Product Details</th>
                <th class="py-3 px-3 text-right">On-Hand</th>
                <th class="py-3 px-3 text-right">Reserved</th>
                <th class="py-3 px-3 text-right">Available</th>
                <th class="py-3 px-3 text-right">Unit Cost</th>
                <th class="py-3 px-3 text-right">Total Valuation</th>
                <th class="py-3 px-4 text-center">Reorder Level</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-outline-variant/50 font-medium">
              <tr v-for="item in filteredItems" :key="item.id" class="hover:bg-surface-container-low/50 transition-colors">
                <td class="py-3 px-4">
                  <span class="font-bold text-on-surface block truncate max-w-[240px]">{{ item.productName }}</span>
                  <div class="flex items-center gap-2 mt-0.5 text-[11px] font-mono text-on-surface-variant">
                    <span v-if="item.sku">SKU: {{ item.sku }}</span>
                    <span v-if="item.barcode">BAR: {{ item.barcode }}</span>
                  </div>
                </td>
                <td class="py-3 px-3 text-right font-mono font-bold text-on-surface">
                  {{ item.quantity }}
                </td>
                <td class="py-3 px-3 text-right font-mono font-bold" :class="item.reservedQuantity > 0 ? 'text-amber-600' : 'text-on-surface-variant/40'">
                  {{ item.reservedQuantity > 0 ? item.reservedQuantity : '-' }}
                </td>
                <td class="py-3 px-3 text-right font-mono font-bold text-primary">
                  {{ item.availableQuantity }}
                </td>
                <td class="py-3 px-3 text-right font-mono text-on-surface-variant">
                  {{ formatMoney(item.costPrice) }}
                </td>
                <td class="py-3 px-3 text-right font-mono font-bold text-emerald-600">
                  {{ formatMoney(item.totalValuation) }}
                </td>
                <td class="py-3 px-4 text-center">
                  <div class="inline-flex items-center gap-1.5">
                    <input 
                      type="number"
                      min="0"
                      v-model.number="item.reorderLevel"
                      @change="handleUpdateReorderLevel(item)"
                      placeholder="Default"
                      class="w-16 px-2 py-1 rounded-lg border border-outline-variant bg-surface text-center font-mono text-xs font-bold focus:border-primary outline-none"
                    />
                    <span v-if="item.effectiveReorderLevel !== null && item.reorderLevel === null" class="text-[10px] font-mono text-outline" title="Inherited from product default">
                      ({{ item.effectiveReorderLevel }})
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Footer -->
      <div class="px-6 py-3.5 border-t border-outline-variant flex items-center justify-between bg-surface-container-low shrink-0 text-xs">
        <span class="text-on-surface-variant font-medium">
          Showing {{ filteredItems.length }} of {{ stockItems.length }} products
        </span>
        <button
          type="button"
          @click="$emit('close')"
          class="px-4 py-2 rounded-xl bg-surface-container-high hover:bg-surface-container-highest font-bold text-on-surface transition-colors cursor-pointer border-0"
        >
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { 
  Boxes, 
  X, 
  Search, 
  ArrowLeftRight, 
  Loader2 
} from 'lucide-vue-next';
import type { 
  InventoryLocation, 
  LocationStock, 
  LocationType 
} from '../../models/types';
import { warehouseService } from '../../services/warehouseService';

const props = defineProps<{
  isOpen: boolean;
  location?: InventoryLocation | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'transfer', location: InventoryLocation): void;
}>();

const isLoading = ref(false);
const stockItems = ref<LocationStock[]>([]);
const searchQuery = ref('');

watch(() => props.isOpen, async (open) => {
  if (open && props.location) {
    searchQuery.value = '';
    isLoading.value = true;
    try {
      stockItems.value = await warehouseService.getLocationStock(props.location.id);
    } catch (err) {
      console.error('Failed to load location stock:', err);
      stockItems.value = [];
    } finally {
      isLoading.value = false;
    }
  }
}, { immediate: true });

const filteredItems = computed(() => {
  if (!searchQuery.value.trim()) return stockItems.value;
  const q = searchQuery.value.toLowerCase().trim();
  return stockItems.value.filter(item => 
    item.productName.toLowerCase().includes(q) ||
    (item.sku && item.sku.toLowerCase().includes(q)) ||
    (item.barcode && item.barcode.toLowerCase().includes(q))
  );
});

const totalUnits = computed(() => 
  stockItems.value.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0)
);

const totalReserved = computed(() => 
  stockItems.value.reduce((sum, item) => sum + (Number(item.reservedQuantity) || 0), 0)
);

const totalValuation = computed(() => 
  stockItems.value.reduce((sum, item) => sum + (Number(item.totalValuation) || 0), 0)
);

const handleUpdateReorderLevel = async (item: LocationStock) => {
  if (!props.location) return;
  try {
    const val = item.reorderLevel !== undefined && item.reorderLevel !== null && !isNaN(item.reorderLevel)
      ? Number(item.reorderLevel)
      : 0;
    await warehouseService.updateReorderLevel(props.location.id, item.productId, val);
  } catch (err) {
    console.error('Failed to update reorder level:', err);
  }
};

const getLocationTypeLabel = (type?: LocationType) => {
  switch (type) {
    case 'WAREHOUSE': return 'Central Warehouse';
    case 'BRANCH_DEFAULT': return 'Branch Floor Stock';
    case 'BRANCH_WAREHOUSE': return 'Branch Storeroom';
    default: return 'Location';
  }
};

const getLocationTypeBadgeClass = (type?: LocationType) => {
  switch (type) {
    case 'WAREHOUSE': return 'bg-indigo-500/10 text-indigo-700 border-indigo-500/30';
    case 'BRANCH_DEFAULT': return 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30';
    case 'BRANCH_WAREHOUSE': return 'bg-amber-500/10 text-amber-700 border-amber-500/30';
    default: return 'bg-surface-container text-on-surface-variant border-outline-variant';
  }
};

const formatUnits = (num: number) => num.toLocaleString();
const formatMoney = (amount: number) => `TZS ${Math.round(amount).toLocaleString()}`;
</script>
