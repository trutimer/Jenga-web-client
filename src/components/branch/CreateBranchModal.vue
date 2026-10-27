<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in font-sans">
    <div class="bg-surface rounded-2xl border border-outline-variant shadow-2xl w-full max-w-lg overflow-hidden animate-scale-up">
      <!-- Modal Header -->
      <div class="px-6 py-5 border-b border-outline-variant flex items-center justify-between bg-surface-container-low">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Store class="w-5 h-5 stroke-[2.2px]" />
          </div>
          <div>
            <h3 class="text-base font-black text-on-surface">
              {{ $t('selectBranch.addNewBranch') }}
            </h3>
            <p class="text-xs text-on-surface-variant font-medium">
              {{ $t('selectBranch.createBranchSubtitle') }}
            </p>
          </div>
        </div>
        <button 
          type="button"
          @click="handleClose" 
          class="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors cursor-pointer border-0 bg-transparent"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Modal Body -->
      <form @submit.prevent="handleSubmit" class="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
        <!-- Error Alert -->
        <div v-if="errorMessage" class="p-3.5 rounded-xl bg-error/10 border border-error/20 text-error text-xs flex items-start gap-2.5">
          <AlertCircle class="w-4 h-4 shrink-0 mt-0.5" />
          <span class="leading-relaxed font-medium">{{ errorMessage }}</span>
        </div>

        <!-- Branch Name Field (Required) -->
        <div class="space-y-1.5">
          <label class="text-xs font-bold text-on-surface uppercase tracking-wider block">
            {{ $t('selectBranch.branchNameLabel') }} <span class="text-error">*</span>
          </label>
          <div class="relative">
            <Store class="w-4 h-4 text-outline absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              v-model="formData.name"
              type="text"
              required
              :placeholder="$t('selectBranch.branchNamePlaceholder')"
              class="w-full h-11 pl-10 pr-4 bg-surface-container-lowest border border-outline-variant rounded-xl text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all font-medium text-on-surface placeholder:text-outline"
            />
          </div>
        </div>

        <!-- Physical Location / Address Field -->
        <div class="space-y-1.5">
          <label class="text-xs font-bold text-on-surface uppercase tracking-wider block">
            {{ $t('selectBranch.branchLocationLabel') }}
          </label>
          <div class="relative">
            <MapPin class="w-4 h-4 text-outline absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              v-model="formData.location"
              type="text"
              :placeholder="$t('selectBranch.branchLocationPlaceholder')"
              class="w-full h-11 pl-10 pr-4 bg-surface-container-lowest border border-outline-variant rounded-xl text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all font-medium text-on-surface placeholder:text-outline"
            />
          </div>
        </div>

        <!-- Two Columns: Phone and Email -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- Phone Field -->
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-on-surface uppercase tracking-wider block">
              {{ $t('selectBranch.branchPhoneLabel') }}
            </label>
            <div class="relative">
              <Phone class="w-4 h-4 text-outline absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                v-model="formData.phone"
                type="tel"
                :placeholder="$t('selectBranch.branchPhonePlaceholder')"
                class="w-full h-11 pl-10 pr-4 bg-surface-container-lowest border border-outline-variant rounded-xl text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all font-medium text-on-surface placeholder:text-outline"
              />
            </div>
          </div>

          <!-- Email Field -->
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-on-surface uppercase tracking-wider block">
              {{ $t('selectBranch.branchEmailLabel') }}
            </label>
            <div class="relative">
              <Mail class="w-4 h-4 text-outline absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                v-model="formData.email"
                type="email"
                :placeholder="$t('selectBranch.branchEmailPlaceholder')"
                class="w-full h-11 pl-10 pr-4 bg-surface-container-lowest border border-outline-variant rounded-xl text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all font-medium text-on-surface placeholder:text-outline"
              />
            </div>
          </div>
        </div>

        <!-- Info Note regarding auto-generated default warehouse/storeroom -->
        <div class="p-3.5 bg-surface-container-low rounded-xl border border-outline-variant/60 flex items-start gap-2.5 text-xs text-on-surface-variant">
          <Building2 class="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <p class="leading-relaxed">
            Creating a branch automatically provisions its primary inventory storage location and assigns initial operational credentials.
          </p>
        </div>

        <!-- Modal Footer Actions -->
        <div class="pt-4 border-t border-outline-variant flex items-center justify-end gap-3">
          <button
            type="button"
            @click="handleClose"
            class="px-4 py-2.5 text-xs font-bold text-on-surface-variant hover:bg-surface-container rounded-xl transition-all cursor-pointer"
          >
            {{ $t('common.cancel') }}
          </button>
          <button
            type="submit"
            :disabled="isSubmitting || !formData.name.trim()"
            class="px-5 py-2.5 bg-primary text-on-primary rounded-xl text-xs font-bold hover:bg-primary/90 flex items-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Loader2 v-if="isSubmitting" class="w-4 h-4 animate-spin" />
            <Plus v-else class="w-4 h-4 stroke-[2.5px]" />
            <span>{{ isSubmitting ? $t('common.processing') : $t('selectBranch.createBranchBtn') }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue';
import { api } from '../../services/api';
import { showToast } from '../../services/toastService';
import { t } from '../../i18n';
import type { StoreBranch } from '../../models/types';
import {
  Store,
  MapPin,
  Phone,
  Mail,
  Building2,
  X,
  AlertCircle,
  Loader2,
  Plus
} from 'lucide-vue-next';

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'created', branch: StoreBranch): void;
}>();

const isSubmitting = ref(false);
const errorMessage = ref('');

const formData = reactive({
  name: '',
  location: '',
  phone: '',
  email: ''
});

const resetForm = () => {
  formData.name = '';
  formData.location = '';
  formData.phone = '';
  formData.email = '';
  errorMessage.value = '';
};

watch(() => props.isOpen, (val) => {
  if (val) {
    resetForm();
  }
});

const handleClose = () => {
  resetForm();
  emit('close');
};

const handleSubmit = async () => {
  if (!formData.name.trim()) {
    errorMessage.value = t('selectBranch.branchNameRequired');
    return;
  }

  isSubmitting.value = true;
  errorMessage.value = '';

  try {
    const storeId = localStorage.getItem('storeId');
    const payload: Record<string, any> = {
      name: formData.name.trim(),
      status: 'ACTIVE'
    };
    if (formData.location.trim()) payload.location = formData.location.trim();
    if (formData.phone.trim()) payload.phone = formData.phone.trim();
    if (formData.email.trim()) payload.email = formData.email.trim();
    if (storeId && storeId !== 'null' && storeId !== 'undefined') {
      payload.storeId = storeId;
    }

    const res = await api.post<StoreBranch>('/api/branches', payload, { suppressToast: true });
    showToast(t('selectBranch.createBranchSuccessToast', { name: res?.name || payload.name }), 'success');
    emit('created', res);
    handleClose();
  } catch (err: any) {
    console.error('Failed to create branch:', err);
    const serverMsg = err?.data?.error || err?.response?.error || err?.message;
    errorMessage.value = serverMsg || 'Failed to create branch. Please check your connection and try again.';
  } finally {
    isSubmitting.value = false;
  }
};
</script>
