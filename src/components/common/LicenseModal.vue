<template>
  <Modal 
    :isOpen="isOpen" 
    :title="$t('license.title')" 
    :subtitle="$t('license.subtitle')"
    :onClose="onClose"
    maxWidth="max-w-2xl"
  >
    <!-- Loading State -->
    <div v-if="isLoading" class="py-12 flex flex-col items-center justify-center space-y-4">
      <div class="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      <p class="text-xs font-mono font-bold text-on-surface-variant uppercase tracking-wider animate-pulse">
        {{ $t('license.validating') }}
      </p>
    </div>

    <!-- Error / No License State -->
    <div v-else-if="error" class="py-8 text-center space-y-4 font-sans">
      <div class="w-16 h-16 bg-error-container/30 text-error rounded-full flex items-center justify-center mx-auto shadow-inner">
        <ShieldAlert class="w-8 h-8 stroke-[2px]" />
      </div>
      <div class="space-y-1.5 max-w-md mx-auto">
        <h4 class="text-lg font-bold text-on-surface">{{ $t('license.noLicenseFound') }}</h4>
        <p class="text-xs text-on-surface-variant font-mono leading-relaxed bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/50 select-all">
          {{ error }}
        </p>
      </div>
      <div class="pt-2 flex items-center justify-center gap-3">
        <button 
          @click="fetchLicense"
          class="px-4 py-2 bg-primary text-on-primary text-xs font-bold rounded-xl hover:bg-primary/90 transition-all cursor-pointer shadow-sm"
        >
          {{ $t('license.retryValidation') }}
        </button>
      </div>
    </div>

    <!-- License Content View -->
    <div v-else-if="license" class="space-y-6 font-sans">
      <!-- License Key Hero Banner -->
      <div class="relative bg-gradient-to-br from-surface-container-high to-surface-container-lowest border border-outline-variant rounded-2xl p-5 md:p-6 overflow-hidden shadow-sm">
        <div class="absolute -right-6 -bottom-6 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />

        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div class="flex items-center gap-3.5">
            <div class="w-12 h-12 rounded-xl bg-primary-container text-primary flex items-center justify-center shrink-0 shadow-inner">
              <ShieldCheck class="w-6.5 h-6.5 stroke-[2px]" />
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="text-xs font-mono font-bold text-primary uppercase tracking-widest">
                  {{ license.licenseTypeName || 'ENTERPRISE EDITION' }}
                </span>
                <span 
                  class="px-2 py-0.5 rounded-full text-[10px] font-mono font-extrabold uppercase tracking-wider"
                  :class="license.status === 'ACTIVE' || !license.status ? 'bg-success-container/40 text-success' : 'bg-error-container/40 text-error'"
                >
                  {{ license.status || 'ACTIVE' }}
                </span>
              </div>
              <h3 class="text-lg font-black text-on-surface tracking-tight mt-0.5">
                {{ license.storeName || 'Jenga Enterprise Customer' }}
              </h3>
            </div>
          </div>

          <!-- License Key Copy Container -->
          <div class="flex items-center gap-2 bg-surface-container-lowest border border-outline-variant rounded-xl p-2 px-3 shadow-inner">
            <div class="text-xs font-mono font-bold text-on-surface select-all tracking-wider">
              {{ formattedKey }}
            </div>
            <button 
              @click="copyKey"
              class="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-primary transition-all cursor-pointer"
              :title="copied ? 'Copied!' : 'Copy License Key'"
            >
              <Check v-if="copied" class="w-4 h-4 text-success" />
              <Copy v-else class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <!-- Specs Grid -->
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
        <!-- Max Terminals -->
        <div class="bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-3.5 flex flex-col justify-between">
          <div class="flex items-center gap-2 text-on-surface-variant mb-1">
            <Smartphone class="w-4 h-4 text-primary" />
            <span class="text-[11px] font-mono font-bold uppercase tracking-wider">{{ $t('license.deviceLimit') }}</span>
          </div>
          <div class="text-base font-extrabold text-on-surface">
            {{ $t('license.maxTerminals', { count: license.maxDevices || 10 }) }}
          </div>
        </div>

        <!-- Issue Date -->
        <div class="bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-3.5 flex flex-col justify-between">
          <div class="flex items-center gap-2 text-on-surface-variant mb-1">
            <Calendar class="w-4 h-4 text-primary" />
            <span class="text-[11px] font-mono font-bold uppercase tracking-wider">{{ $t('license.issuedDate') }}</span>
          </div>
          <div class="text-base font-extrabold text-on-surface">
            {{ formatDate(license.issuedAt || license.startsAt) }}
          </div>
        </div>

        <!-- Expiration Date -->
        <div class="bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-3.5 flex flex-col justify-between col-span-2 sm:col-span-1">
          <div class="flex items-center gap-2 text-on-surface-variant mb-1">
            <Clock class="w-4 h-4 text-primary" />
            <span class="text-[11px] font-mono font-bold uppercase tracking-wider">{{ $t('license.validUntil') }}</span>
          </div>
          <div class="text-base font-extrabold text-on-surface">
            {{ formatDate(license.expiresAt) }}
          </div>
        </div>
      </div>

      <!-- Features & Upgrades -->
      <div v-if="license.features && license.features.length > 0" class="space-y-2">
        <h4 class="text-xs font-mono font-bold text-on-surface-variant uppercase tracking-widest">
          {{ $t('license.activeFeatures') }}
        </h4>
        <div class="flex flex-wrap gap-2">
          <div 
            v-for="feat in license.features" 
            :key="feat.id || feat.featureCode"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-low border border-outline-variant/50 text-xs font-semibold text-on-surface"
          >
            <CheckCircle2 class="w-3.5 h-3.5 text-success shrink-0" />
            <span>{{ formatFeatureCode(feat.featureCode) }}</span>
          </div>
        </div>
      </div>

      <!-- Registered Devices / Terminals -->
      <div v-if="license.devices && license.devices.length > 0" class="space-y-2">
        <div class="flex items-center justify-between">
          <h4 class="text-xs font-mono font-bold text-on-surface-variant uppercase tracking-widest">
            {{ $t('license.registeredTerminals', { count: license.devices.length }) }}
          </h4>
          <span class="text-[11px] font-mono text-outline">{{ $t('license.hardwareFingerprints') }}</span>
        </div>
        <div class="bg-surface-container-lowest border border-outline-variant/60 rounded-xl divide-y divide-outline-variant/30 max-h-36 overflow-y-auto">
          <div 
            v-for="dev in license.devices" 
            :key="dev.id"
            class="p-3 flex items-center justify-between text-xs"
          >
            <div class="flex items-center gap-2.5">
              <Laptop class="w-4 h-4 text-primary" />
              <div>
                <div class="font-bold text-on-surface">{{ dev.deviceName || 'POS Terminal' }}</div>
                <div class="font-mono text-[10px] text-outline truncate max-w-[200px] sm:max-w-xs">{{ dev.fingerprint }}</div>
              </div>
            </div>
            <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-success-container/20 text-success">
              {{ dev.status || 'ACTIVE' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Validation Guarantee Footer Bar -->
      <div class="bg-surface-container-low rounded-xl p-3.5 border border-outline-variant/50 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-on-surface-variant gap-2">
        <div class="flex items-center gap-2 font-mono">
          <Lock class="w-4 h-4 text-primary shrink-0" />
          <span>{{ $t('license.validatedTimes', { count: license.validationCount || 1 }) }}</span>
        </div>
        <div class="font-mono text-[11px] text-outline">
          {{ $t('license.lastCheck', { date: formatDate(license.lastValidationAt) }) }}
        </div>
      </div>
    </div>

    <!-- Footer Action Slot -->
    <template #footer>
      <button 
        @click="onClose"
        class="w-full sm:w-auto px-6 py-2.5 bg-primary text-on-primary font-bold text-xs rounded-xl hover:bg-primary/90 transition-all cursor-pointer shadow-sm"
      >
        {{ $t('license.closeLicenseInfo') }}
      </button>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import Modal from './Modal.vue';
import { api } from '../../services/api';
import { useAppViewModel } from '../../viewmodels/useAppViewModel';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Copy, 
  Check, 
  Calendar, 
  Clock, 
  Smartphone, 
  CheckCircle2, 
  Lock, 
  Laptop 
} from 'lucide-vue-next';

const props = defineProps<{
  isOpen: boolean;
  onClose: () => void;
  branchId?: string | null;
}>();

const { activeBranchId } = useAppViewModel();

const license = ref<any>(null);
const isLoading = ref(false);
const error = ref<string | null>(null);
const copied = ref(false);

const formattedKey = computed(() => {
  if (!license.value?.licenseKey) return 'JENG-XXXX-XXXX-XXXX';
  const key = license.value.licenseKey;
  if (key.length > 14) {
    return key.substring(0, 9) + '••••-••••';
  }
  return key;
});

const copyKey = () => {
  if (license.value?.licenseKey) {
    navigator.clipboard.writeText(license.value.licenseKey);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  }
};

const formatDate = (isoStr?: string) => {
  if (!isoStr) return 'N/A';
  try {
    const d = new Date(isoStr);
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return isoStr;
  }
};

const formatFeatureCode = (code: string) => {
  if (!code) return 'Feature Module';
  return code
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, l => l.toUpperCase());
};

const fetchLicense = async () => {
  isLoading.value = true;
  error.value = null;
  license.value = null;

  const targetBranchId = props.branchId || activeBranchId.value || localStorage.getItem('branchId');

  if (!targetBranchId || targetBranchId === 'null' || targetBranchId === 'undefined' || targetBranchId.trim() === '') {
    error.value = 'No active branch selected. Please select a branch to view its license.';
    isLoading.value = false;
    return;
  }

  try {
    const data = await api.get(`/api/stores/branches/${targetBranchId}/license`, { suppressToast: true });
    if (data) {
      license.value = data;
    } else {
      error.value = `No license assigned to branch ID: ${targetBranchId}`;
    }
  } catch (err: any) {
    license.value = null;
    error.value = err.message || `No license assigned to branch ID: ${targetBranchId}`;
  } finally {
    isLoading.value = false;
  }
};

watch(() => [props.isOpen, props.branchId], ([newOpen]) => {
  if (newOpen) {
    fetchLicense();
  }
});
</script>
