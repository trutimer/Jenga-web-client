<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#122131]/75 backdrop-blur-md animate-fade-in font-sans">
    <div class="bg-surface-container-lowest rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-2xl border border-outline-variant flex flex-col gap-5 animate-fade-up relative overflow-hidden">
      <!-- Top Decorative Accent -->
      <div class="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-emerald-500 to-cyan-500"></div>

      <!-- Close Button -->
      <button 
        @click="dismiss" 
        class="absolute top-5 right-5 text-outline hover:text-on-surface p-1.5 rounded-full hover:bg-surface-container transition-colors cursor-pointer"
      >
        <X class="w-5 h-5" />
      </button>

      <!-- STEP 1: INITIAL PROMPT -->
      <div v-if="step === 'PROMPT'" class="space-y-5">
        <div class="flex items-center gap-3.5">
          <div class="w-12 h-12 rounded-2xl bg-primary-container/20 text-primary flex items-center justify-center shadow-inner shrink-0">
            <ShieldAlert class="w-6 h-6 stroke-[2.5px]" />
          </div>
          <div>
            <h3 class="text-xl font-black text-on-surface tracking-tight">Protect Your Account</h3>
            <p class="text-xs text-on-surface-variant font-medium mt-0.5">Two-Factor Authentication (2FA) is recommended</p>
          </div>
        </div>

        <p class="text-xs text-on-surface-variant leading-relaxed font-normal">
          Secure your store, cash register, and financial ledger data with <strong>Google Authenticator</strong>. 2FA is optional, but helps ensure only authorized personnel can access your account.
        </p>

        <div class="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/50 space-y-2.5 text-xs">
          <div class="flex items-center gap-2.5 text-on-surface font-semibold">
            <CheckCircle2 class="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Stops unauthorized logins even if someone knows your password</span>
          </div>
          <div class="flex items-center gap-2.5 text-on-surface font-semibold">
            <CheckCircle2 class="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Works with Google Authenticator or Microsoft Authenticator</span>
          </div>
          <div class="flex items-center gap-2.5 text-on-surface font-semibold">
            <CheckCircle2 class="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Takes less than 1 minute to setup</span>
          </div>
        </div>

        <div class="flex flex-col gap-2.5 pt-2">
          <button 
            type="button" 
            @click="startSetup"
            class="w-full h-12 bg-primary text-on-primary font-bold text-xs rounded-xl hover:bg-opacity-95 active:scale-[0.98] transition-all cursor-pointer shadow-md shadow-primary/20 flex items-center justify-center gap-2"
          >
            <KeyRound class="w-4 h-4" />
            <span>Enable Google Authenticator Now</span>
          </button>

          <button 
            type="button" 
            @click="step = 'REMIND'"
            class="w-full h-11 bg-surface-container-low hover:bg-surface-container-high border border-outline-variant text-on-surface font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Clock class="w-4 h-4 text-on-surface-variant" />
            <span>Remind Me Later</span>
          </button>

          <button 
            type="button" 
            @click="dismiss"
            class="w-full h-9 bg-transparent hover:bg-surface-container text-outline hover:text-on-surface-variant text-[11px] font-bold rounded-lg transition-all cursor-pointer"
          >
            Skip for now
          </button>
        </div>
      </div>

      <!-- STEP 2: REMIND ME LATER -->
      <div v-else-if="step === 'REMIND'" class="space-y-5">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 flex items-center justify-center shrink-0">
            <Clock class="w-5 h-5" />
          </div>
          <div>
            <h3 class="text-lg font-black text-on-surface">When would you like to be reminded?</h3>
            <p class="text-xs text-on-surface-variant">We'll alert you via email & in-app notification</p>
          </div>
        </div>

        <p class="text-xs text-on-surface-variant leading-relaxed">
          Select a reminder window. When due, Jenga will generate a <strong>HIGH-priority notification</strong> and dispatch a <strong>security alert email</strong> with direct instructions.
        </p>

        <div class="grid grid-cols-3 gap-2.5">
          <button 
            type="button" 
            @click="reminderDays = 7"
            class="py-3 px-2 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center"
            :class="reminderDays === 7 ? 'bg-primary text-on-primary border-primary shadow-sm' : 'bg-surface-container-low border-outline-variant text-on-surface hover:bg-surface-container'"
          >
            7 Days
          </button>
          <button 
            type="button" 
            @click="reminderDays = 14"
            class="py-3 px-2 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center"
            :class="reminderDays === 14 ? 'bg-primary text-on-primary border-primary shadow-sm' : 'bg-surface-container-low border-outline-variant text-on-surface hover:bg-surface-container'"
          >
            14 Days
          </button>
          <button 
            type="button" 
            @click="reminderDays = 30"
            class="py-3 px-2 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center"
            :class="reminderDays === 30 ? 'bg-primary text-on-primary border-primary shadow-sm' : 'bg-surface-container-low border-outline-variant text-on-surface hover:bg-surface-container'"
          >
            30 Days
          </button>
        </div>

        <div class="flex gap-2.5 pt-2">
          <button 
            type="button" 
            @click="step = 'PROMPT'"
            class="flex-1 h-11 bg-surface-container-high text-on-surface font-bold rounded-xl transition-all cursor-pointer text-xs"
          >
            Back
          </button>
          <button 
            type="button" 
            @click="submitReminder"
            :disabled="isScheduling"
            class="flex-1 h-11 bg-primary text-on-primary font-bold rounded-xl hover:bg-opacity-95 transition-all cursor-pointer text-xs flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Loader2 v-if="isScheduling" class="w-4 h-4 animate-spin" />
            <span>Set Reminder</span>
          </button>
        </div>
      </div>

      <!-- STEP 3: SETUP FLOW (QR & 6-Digit Code) -->
      <div v-else-if="step === 'SETUP'" class="space-y-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-primary-container/20 text-primary flex items-center justify-center shrink-0">
            <KeyRound class="w-5 h-5" />
          </div>
          <div>
            <h3 class="text-lg font-black text-on-surface">Setup Google Authenticator</h3>
            <p class="text-xs text-on-surface-variant">Scan QR or enter key manually</p>
          </div>
        </div>

        <div v-if="setupLoading" class="py-12 flex flex-col items-center justify-center gap-3">
          <Loader2 class="w-8 h-8 text-primary animate-spin" />
          <p class="text-xs text-on-surface-variant font-medium">Generating secure 2FA keys...</p>
        </div>

        <div v-else class="space-y-4 text-xs text-on-surface-variant">
          <!-- QR Code Preview -->
          <div class="flex justify-center p-3.5 bg-white rounded-2xl border border-outline-variant/60 shadow-inner w-fit mx-auto">
            <img v-if="qrCodeDataUrl" :src="qrCodeDataUrl" alt="2FA QR Code" class="w-44 h-44" />
            <div v-else class="w-44 h-44 flex items-center justify-center text-xs text-slate-400">Loading QR...</div>
          </div>

          <!-- Secret Key Display -->
          <div class="bg-surface-container-low p-3 rounded-xl border border-outline-variant/40 flex justify-between items-center">
            <div class="min-w-0 pr-2">
              <span class="text-[10px] uppercase font-bold text-on-surface-variant block">Manual Key</span>
              <span class="font-mono text-xs font-bold text-on-surface select-all truncate block">{{ setupSecret }}</span>
            </div>
            <button 
              type="button" 
              @click="copyKey" 
              class="text-primary font-bold text-xs hover:underline shrink-0 cursor-pointer flex items-center gap-1"
            >
              <Copy class="w-3.5 h-3.5" />
              <span>{{ copied ? 'Copied' : 'Copy' }}</span>
            </button>
          </div>

          <!-- 6-digit Code Input -->
          <form @submit.prevent="submitEnable" class="space-y-3">
            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-on-surface">Enter 6-digit code to activate:</label>
              <input 
                v-model="verificationCode"
                type="text"
                maxlength="6"
                placeholder="000000"
                class="w-full h-12 bg-surface-container-low border border-outline-variant rounded-xl text-center text-lg font-mono tracking-widest text-on-surface focus:outline-none focus:border-primary"
                required
              />
            </div>

            <div v-if="setupError" class="p-2.5 bg-error-container text-on-error-container rounded-xl text-xs font-semibold">
              {{ setupError }}
            </div>

            <div class="flex gap-2.5 pt-1">
              <button 
                type="button" 
                @click="step = 'PROMPT'"
                class="flex-1 h-11 bg-surface-container-high text-on-surface font-bold rounded-xl transition-all cursor-pointer text-xs"
              >
                Back
              </button>
              <button 
                type="submit"
                :disabled="isActivating || verificationCode.length < 6"
                class="flex-1 h-11 bg-primary text-on-primary font-bold rounded-xl hover:bg-opacity-95 transition-all cursor-pointer text-xs flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Loader2 v-if="isActivating" class="w-4 h-4 animate-spin" />
                <span>Activate 2FA</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import QRCode from 'qrcode';
import { api } from '../../services/api';
import { showToast } from '../../services/toastService';
import { 
  ShieldAlert, 
  KeyRound, 
  Clock, 
  X, 
  CheckCircle2, 
  Loader2, 
  Copy 
} from 'lucide-vue-next';

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'updated'): void;
}>();

const step = ref<'PROMPT' | 'REMIND' | 'SETUP'>('PROMPT');
const reminderDays = ref(7);
const isScheduling = ref(false);

const setupLoading = ref(false);
const setupSecret = ref('');
const qrCodeDataUrl = ref('');
const verificationCode = ref('');
const setupError = ref('');
const isActivating = ref(false);
const copied = ref(false);

const dismiss = () => {
  sessionStorage.setItem('dismissed2FaPrompt', 'true');
  emit('close');
};

const startSetup = async () => {
  step.value = 'SETUP';
  setupLoading.value = true;
  setupError.value = '';
  verificationCode.value = '';
  copied.value = false;

  try {
    const res = await api.get('/api/auth/2fa/setup', { suppressToast: true });
    setupSecret.value = res.secret;
    qrCodeDataUrl.value = await QRCode.toDataURL(res.otpAuthUri, {
      width: 220,
      margin: 2,
      color: { dark: '#122131', light: '#FFFFFF' }
    });
  } catch (err: any) {
    setupError.value = err.message || 'Failed to initialize 2FA setup.';
  } finally {
    setupLoading.value = false;
  }
};

const copyKey = async () => {
  try {
    await navigator.clipboard.writeText(setupSecret.value);
    copied.value = true;
    setTimeout(() => { copied.value = false; }, 3000);
  } catch {}
};

const submitEnable = async () => {
  if (!verificationCode.value || verificationCode.value.length < 6) return;
  isActivating.value = true;
  setupError.value = '';

  try {
    const res = await api.post('/api/auth/2fa/enable', {
      totpCode: verificationCode.value.trim()
    }, { suppressToast: true });

    showToast(res.message || 'Two-Factor Authentication enabled successfully!', 'success');
    localStorage.setItem('twoFactorEnabled', 'true');
    localStorage.removeItem('twoFactorRemindAt');
    emit('updated');
    emit('close');
  } catch (err: any) {
    setupError.value = err.message || 'Invalid verification code. Please check Google Authenticator.';
  } finally {
    isActivating.value = false;
  }
};

const submitReminder = async () => {
  isScheduling.value = true;
  try {
    const res = await api.post('/api/auth/2fa/remind', {
      days: reminderDays.value
    }, { suppressToast: true });

    showToast(res.message || '2FA reminder scheduled! High-priority notification & email dispatched.', 'success');
    if (res.remindAt) {
      localStorage.setItem('twoFactorRemindAt', res.remindAt);
    }
    emit('updated');
    emit('close');
  } catch (err: any) {
    showToast(err.message || 'Failed to schedule 2FA reminder.', 'error');
  } finally {
    isScheduling.value = false;
  }
};
</script>
