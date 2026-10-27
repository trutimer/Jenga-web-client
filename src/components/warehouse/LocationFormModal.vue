<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
    <div class="bg-surface rounded-2xl border border-outline-variant shadow-2xl w-full max-w-xl overflow-hidden animate-scale-up">
      <!-- Modal Header -->
      <div class="px-6 py-4.5 border-b border-outline-variant flex items-center justify-between bg-surface-container-low">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Warehouse class="w-5 h-5" />
          </div>
          <div>
            <h3 class="text-base font-black text-on-surface">
              {{ isEditing ? $t('warehouses.editLocation') : $t('warehouses.addLocationBtn') }}
            </h3>
            <p class="text-xs text-on-surface-variant font-medium">
              {{ isEditing ? location?.name : 'Configure a standalone distribution warehouse or branch backroom' }}
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

        <!-- Location Type Selector (Only on create) -->
        <div v-if="!isEditing" class="space-y-1.5">
          <label class="text-xs font-bold text-on-surface uppercase tracking-wider block">Location Type</label>
          <div class="grid grid-cols-2 gap-3">
            <button
              type="button"
              @click="formData.locationType = 'WAREHOUSE'"
              class="p-3 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer"
              :class="formData.locationType === 'WAREHOUSE' 
                ? 'border-primary bg-primary/5 text-primary shadow-xs ring-1 ring-primary' 
                : 'border-outline-variant hover:border-outline text-on-surface bg-surface-container-lowest'"
            >
              <div class="flex items-center justify-between">
                <span class="font-bold text-xs flex items-center gap-1.5">
                  <Warehouse class="w-4 h-4" />
                  Central Warehouse
                </span>
                <span v-if="formData.locationType === 'WAREHOUSE'" class="w-2 h-2 rounded-full bg-primary"></span>
              </div>
              <span class="text-[11px] text-on-surface-variant font-normal leading-tight">
                Standalone hub for bulk storage and multi-branch distribution
              </span>
            </button>

            <button
              type="button"
              @click="formData.locationType = 'BRANCH_WAREHOUSE'"
              class="p-3 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer"
              :class="formData.locationType === 'BRANCH_WAREHOUSE' 
                ? 'border-primary bg-primary/5 text-primary shadow-xs ring-1 ring-primary' 
                : 'border-outline-variant hover:border-outline text-on-surface bg-surface-container-lowest'"
            >
              <div class="flex items-center justify-between">
                <span class="font-bold text-xs flex items-center gap-1.5">
                  <Store class="w-4 h-4" />
                  Branch Storeroom
                </span>
                <span v-if="formData.locationType === 'BRANCH_WAREHOUSE'" class="w-2 h-2 rounded-full bg-primary"></span>
              </div>
              <span class="text-[11px] text-on-surface-variant font-normal leading-tight">
                Dedicated secondary storage / backroom for a specific retail branch
              </span>
            </button>
          </div>
        </div>

        <!-- If Branch Storeroom: Branch Selector -->
        <div v-if="formData.locationType === 'BRANCH_WAREHOUSE' && !isEditing" class="space-y-1.5">
          <label class="text-xs font-bold text-on-surface uppercase tracking-wider block">
            Associated Store Branch <span class="text-error">*</span>
          </label>
          <select 
            v-model="formData.storeBranchId"
            required
            class="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface text-xs font-semibold focus:border-primary focus:ring-1 focus:ring-primary outline-none"
          >
            <option value="" disabled>-- Select Branch --</option>
            <option v-for="b in branches" :key="b.id" :value="b.id">
              {{ b.name }} {{ b.isMain ? '(Main Branch)' : '' }}
            </option>
          </select>
        </div>

        <!-- Location Name & System Code -->
        <div class="space-y-1.5">
          <div class="flex items-center justify-between">
            <label class="text-xs font-bold text-on-surface uppercase tracking-wider block">
              Location Name <span class="text-error">*</span>
            </label>
            <span v-if="isEditing && formData.code" class="text-[11px] font-mono font-bold text-outline bg-surface-container-high px-2 py-0.5 rounded-md">
              Code: {{ formData.code }}
            </span>
            <span v-else class="text-[11px] font-mono text-outline flex items-center gap-1">
              <span>System Code:</span>
              <span class="text-primary font-semibold">Auto-generated</span>
            </span>
          </div>
          <input 
            type="text"
            v-model="formData.name"
            required
            :placeholder="formData.locationType === 'WAREHOUSE' ? 'e.g. Central Distribution Hub' : 'e.g. Backroom Storeroom'"
            class="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface text-xs font-semibold focus:border-primary focus:ring-1 focus:ring-primary outline-none"
          />
        </div>

        <!-- Physical Address -->
        <div class="space-y-1.5">
          <label class="text-xs font-bold text-on-surface uppercase tracking-wider block">
            Physical Address / Street / Zone
          </label>
          <input 
            type="text"
            v-model="formData.address"
            placeholder="e.g. Nyerere Road, Industrial Area, Plot 14"
            class="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface text-xs font-semibold focus:border-primary focus:ring-1 focus:ring-primary outline-none"
          />
        </div>

        <!-- Served Branches Policy (For Standalone Warehouses) -->
        <div v-if="formData.locationType === 'WAREHOUSE'" class="space-y-3 pt-2 border-t border-outline-variant/60">
          <div class="flex items-center justify-between">
            <div>
              <span class="text-xs font-bold text-on-surface block">Branch Distribution Scope</span>
              <span class="text-[11px] text-on-surface-variant font-medium">Which retail outlets can receive stock from this warehouse?</span>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                v-model="formData.servesAllBranches" 
                class="sr-only peer"
              />
              <div class="w-10 h-5 bg-surface-container-high peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div v-if="formData.servesAllBranches" class="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-xs flex items-center gap-2">
            <CheckCircle2 class="w-4 h-4 shrink-0" />
            <span>This warehouse is authorized to supply <strong>all current and future store branches</strong>.</span>
          </div>

          <div v-else class="space-y-2 p-3 rounded-xl bg-surface-container-low border border-outline-variant">
            <span class="text-[11px] font-bold text-on-surface block uppercase tracking-wider">Select Authorized Branches:</span>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <label 
                v-for="b in branches" 
                :key="b.id"
                class="flex items-center gap-2 text-xs text-on-surface cursor-pointer p-1.5 rounded-lg hover:bg-surface-container transition-colors"
              >
                <input 
                  type="checkbox"
                  :value="b.id"
                  v-model="formData.servedBranchIds"
                  class="rounded text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                />
                <span class="truncate font-semibold">{{ b.name }}</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Active Toggle (On Edit) -->
        <div v-if="isEditing" class="flex items-center justify-between pt-2 border-t border-outline-variant/60">
          <div>
            <span class="text-xs font-bold text-on-surface block">Location Status</span>
            <span class="text-[11px] text-on-surface-variant font-medium">Inactive locations cannot receive or dispatch stock</span>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              v-model="formData.isActive" 
              class="sr-only peer"
            />
            <div class="w-10 h-5 bg-surface-container-high peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>

        <!-- Actions -->
        <div class="flex items-center justify-end gap-2.5 pt-4 border-t border-outline-variant">
          <button
            type="button"
            @click="$emit('close')"
            class="px-4 py-2 rounded-xl border border-outline-variant text-on-surface hover:bg-surface-container font-semibold text-xs cursor-pointer transition-all bg-transparent"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="isSubmitting"
            class="px-5 py-2 rounded-xl bg-primary text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm hover:opacity-95 disabled:opacity-50 transition-all border-0"
          >
            <Loader2 v-if="isSubmitting" class="w-4 h-4 animate-spin" />
            <Save v-else class="w-4 h-4" />
            <span>{{ isEditing ? 'Save Changes' : 'Create Location' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { 
  Warehouse, 
  Store, 
  X, 
  Save, 
  AlertCircle, 
  CheckCircle2, 
  Loader2 
} from 'lucide-vue-next';
import type { 
  InventoryLocation, 
  LocationType, 
  StoreBranchInfo 
} from '../../models/types';
import { warehouseService } from '../../services/warehouseService';

const props = defineProps<{
  isOpen: boolean;
  location?: InventoryLocation | null;
  branches: StoreBranchInfo[];
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'saved', location: InventoryLocation): void;
}>();

const isEditing = ref(false);
const isSubmitting = ref(false);
const errorMessage = ref<string | null>(null);

const formData = ref<{
  name: string;
  code: string;
  locationType: LocationType;
  storeBranchId: string;
  servesAllBranches: boolean;
  address: string;
  servedBranchIds: string[];
  isActive: boolean;
}>({
  name: '',
  code: '',
  locationType: 'WAREHOUSE',
  storeBranchId: '',
  servesAllBranches: true,
  address: '',
  servedBranchIds: [],
  isActive: true
});

watch(() => props.isOpen, (open) => {
  if (open) {
    errorMessage.value = null;
    if (props.location) {
      isEditing.value = true;
      formData.value = {
        name: props.location.name,
        code: props.location.code || '',
        locationType: props.location.locationType,
        storeBranchId: props.location.storeBranchId || '',
        servesAllBranches: props.location.servesAllBranches,
        address: props.location.address || '',
        servedBranchIds: props.location.servedBranchIds || [],
        isActive: props.location.isActive
      };
    } else {
      isEditing.value = false;
      formData.value = {
        name: '',
        code: '',
        locationType: 'WAREHOUSE',
        storeBranchId: props.branches[0]?.id || '',
        servesAllBranches: true,
        address: '',
        servedBranchIds: [],
        isActive: true
      };
    }
  }
}, { immediate: true });

const handleSubmit = async () => {
  if (!formData.value.name.trim()) {
    errorMessage.value = 'Location name is required';
    return;
  }

  isSubmitting.value = true;
  errorMessage.value = null;

  try {
    if (isEditing.value && props.location) {
      const updated = await warehouseService.updateLocation(props.location.id, {
        name: formData.value.name,
        code: formData.value.code || undefined,
        servesAllBranches: formData.value.servesAllBranches,
        address: formData.value.address || undefined,
        isActive: formData.value.isActive
      });
      // If served branches updated on standalone warehouse
      if (formData.value.locationType === 'WAREHOUSE' && !formData.value.servesAllBranches) {
        await warehouseService.updateServedBranches(props.location.id, formData.value.servedBranchIds);
      }
      emit('saved', updated);
    } else {
      const created = await warehouseService.createLocation({
        name: formData.value.name,
        code: formData.value.code || undefined,
        locationType: formData.value.locationType,
        storeBranchId: formData.value.locationType === 'BRANCH_WAREHOUSE' ? formData.value.storeBranchId : undefined,
        servesAllBranches: formData.value.servesAllBranches,
        address: formData.value.address || undefined,
        servedBranchIds: formData.value.servesAllBranches ? undefined : formData.value.servedBranchIds
      });
      emit('saved', created);
    }
    emit('close');
  } catch (err: any) {
    errorMessage.value = err.message || 'Failed to save location';
  } finally {
    isSubmitting.value = false;
  }
};
</script>
