<template>
  <div class="min-h-screen w-full flex bg-surface-container-lowest antialiased font-sans">
    
    <!-- Left Section: Image Showcase (Hidden on smaller screens) -->
    <div class="hidden lg:flex lg:w-1/2 xl:w-[55%] relative overflow-hidden bg-primary-container">
      <img src="/login-bg.jpg" alt="Store Atmosphere" class="absolute inset-0 w-full h-full object-cover animate-fade-in" />
      
      <!-- Gradient Overlay for text legibility -->
      <div class="absolute inset-0 bg-gradient-to-t from-[#122131]/90 via-[#122131]/40 to-transparent pointer-events-none"></div>
      
      <!-- Content Overlay -->
      <div class="absolute bottom-0 left-0 p-12 xl:p-16 text-white max-w-xl animate-slide-up">
        <h2 class="text-4xl xl:text-5xl font-bold leading-tight mb-4 text-on-primary">
          {{ $t('auth.heroTitle') }}
        </h2>
        <p class="text-lg text-white/80 font-medium">
          {{ $t('auth.heroDescription') }}
        </p>
      </div>
    </div>

    <!-- Right Section: Login Form -->
    <div class="w-full lg:w-1/2 xl:w-[45%] flex flex-col justify-center items-center p-8 lg:p-16 relative bg-surface-container-lowest overflow-y-auto">
      
      <!-- Top Right: Language Option Switcher -->
      <div class="absolute top-6 right-6 z-20">
        <LanguageSelector variant="buttons" />
      </div>

      <!-- Decorative ambient background gradient -->
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,_#f1f5f9_0%,_transparent_60%)] pointer-events-none" />

      <main class="w-full max-w-[400px] flex flex-col gap-8 relative z-10 animate-fade-up min-h-[460px] pt-8 lg:pt-0">
        <!-- Jenga Logo Loading Visual Overlay during authentication -->
        <JengaLoader 
          v-if="isLoggingIn" 
          overlay 
          size="lg" 
          :label="showTwoFactorStep ? 'Verifying 2FA Code...' : $t('auth.authenticatingTerminal')" 
          :sublabel="showTwoFactorStep ? 'Connecting with Authenticator' : $t('auth.verifyingCredentials')" 
        />
        
        <!-- Header / Branding -->
        <header class="flex flex-col items-center gap-4 text-center">
          <div class="w-16 h-16 flex items-center justify-center drop-shadow-sm mb-2">
            <img src="/logo.svg" alt="Jenga Logo" class="w-full h-full object-contain" />
          </div>
          <div>
            <h1 class="text-3xl font-bold text-on-surface tracking-tight">
              {{ showTwoFactorStep ? 'Two-Factor Authentication' : $t('auth.welcomeBack') }}
            </h1>
            <p class="text-sm font-semibold text-on-surface-variant mt-2">
              {{ showTwoFactorStep ? 'Enter the 6-digit code from Google Authenticator' : $t('auth.signInSubtitle') }}
            </p>
          </div>
        </header>

        <!-- 2FA Step Form -->
        <form v-if="showTwoFactorStep" @submit.prevent="handleTwoFactorSubmit" class="flex flex-col gap-5">
          <div v-if="error" class="p-3 bg-error-container text-on-error-container rounded-lg text-sm font-medium border border-error/10 flex items-center gap-2">
            <span class="font-bold flex-shrink-0">!</span>
            <span>{{ error }}</span>
          </div>

          <div class="p-4 bg-primary-container/10 border border-primary/20 rounded-2xl flex items-center gap-3 text-xs text-on-surface-variant font-medium">
            <ShieldCheck class="w-6 h-6 text-primary shrink-0" />
            <div>
              <div class="font-bold text-on-surface">Protected Account</div>
              <div>Google Authenticator 2FA is active on this account.</div>
            </div>
          </div>

          <div class="flex flex-col gap-2">
            <label class="text-xs font-mono font-bold uppercase tracking-wider text-outline" for="totpCode">
              6-Digit Authenticator Code
            </label>
            <div class="relative flex items-center group">
              <KeyRound class="absolute left-4 text-outline w-5 h-5 group-focus-within:text-primary transition-colors" />
              <input 
                id="totpCode"
                name="totpCode"
                type="text"
                v-model="totpCode"
                maxlength="6"
                placeholder="000000"
                autofocus
                class="w-full h-14 pl-12 pr-4 bg-surface-container-low border border-outline-variant rounded-xl text-xl font-mono tracking-widest text-center text-on-surface focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-outline-variant/60"
                required
              />
            </div>
          </div>

          <!-- Actions -->
          <button 
            type="submit"
            :disabled="isLoggingIn || totpCode.length < 6"
            class="w-full h-14 bg-primary text-on-primary rounded-xl font-bold hover:bg-opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-2 shadow-md shadow-primary/20 cursor-pointer disabled:opacity-50"
          >
            <RotateCw v-if="isLoggingIn" class="w-5 h-5 animate-spin text-white" />
            <span>{{ isLoggingIn ? 'Verifying...' : 'Verify & Sign In' }}</span>
            <ArrowRight v-if="!isLoggingIn" class="w-5 h-5" />
          </button>

          <button 
            type="button"
            @click="cancelTwoFactorStep"
            class="w-full h-11 bg-transparent hover:bg-surface-container text-on-surface-variant text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            Cancel and try another account
          </button>
        </form>

        <!-- Standard Login Form -->
        <form v-else @submit.prevent="handleSubmit" class="flex flex-col gap-5">
          
          <div v-if="error" class="p-3 bg-error-container text-on-error-container rounded-lg text-sm font-medium border border-error/10 flex items-center gap-2">
            <span class="font-bold flex-shrink-0">!</span>
            <span>{{ error }}</span>
          </div>

          <!-- Phone Number Input -->
          <div class="flex flex-col gap-2">
            <label class="text-xs font-mono font-bold uppercase tracking-wider text-outline" for="phone">
              {{ $t('auth.phoneLabel') }}
            </label>
            <div class="relative flex items-center group">
              <Phone class="absolute left-4 text-outline w-5 h-5 group-focus-within:text-primary transition-colors" />
              <input 
                id="phone"
                name="phone"
                type="tel"
                v-model="phone"
                :placeholder="$t('auth.phonePlaceholder')"
                class="w-full h-14 pl-12 pr-4 bg-surface-container-low border border-outline-variant rounded-xl text-md font-sans text-on-surface focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-outline-variant/60"
                required
              />
            </div>
          </div>

          <!-- Password Input -->
          <div class="flex flex-col gap-2">
            <div class="flex justify-between items-end">
              <label class="text-xs font-mono font-bold uppercase tracking-wider text-outline" for="password">
                {{ $t('auth.passwordLabel') }}
              </label>
              <button 
                type="button"
                @click="alertForgot"
                class="text-xs font-mono font-semibold text-primary hover:text-primary-container transition-colors cursor-pointer"
              >
                {{ $t('auth.forgotPassword') }}
              </button>
            </div>
            <div class="relative flex items-center group">
              <Lock class="absolute left-4 text-outline w-5 h-5 group-focus-within:text-primary transition-colors" />
              <input 
                id="password"
                name="password"
                :type="showPassword ? 'text' : 'password'"
                v-model="password"
                :placeholder="$t('auth.passwordPlaceholder')"
                class="w-full h-14 pl-12 pr-12 bg-surface-container-low border border-outline-variant rounded-xl text-md font-sans text-on-surface focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-outline-variant/60"
                required
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-4 text-outline hover:text-on-surface transition-colors cursor-pointer flex items-center justify-center p-1 rounded-md"
              >
                <component :is="showPassword ? EyeOff : Eye" class="w-5 h-5" />
              </button>
            </div>
          </div>

          <!-- Options Row -->
          <div class="flex items-center gap-3 mt-1">
            <input 
              id="remember"
              name="remember"
              type="checkbox"
              v-model="remember"
              class="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary/20 bg-surface-container-low cursor-pointer accent-primary"
            />
            <label class="text-sm font-semibold text-on-surface-variant cursor-pointer select-none" for="remember">
              {{ $t('auth.rememberTerminal') }}
            </label>
          </div>

          <!-- Submit Action -->
          <button 
            type="submit"
            :disabled="isLoggingIn"
            class="w-full h-14 bg-primary text-on-primary rounded-xl font-bold hover:bg-opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-2 shadow-md shadow-primary/20 cursor-pointer disabled:opacity-50"
          >
            <RotateCw v-if="isLoggingIn" class="w-5 h-5 animate-spin text-white" />
            <span>{{ isLoggingIn ? $t('auth.authenticating') : $t('auth.signInButton') }}</span>
            <ArrowRight v-if="!isLoggingIn" class="w-5 h-5" />
          </button>

          <!-- Cloudflare Turnstile Bot Defense Widget -->
          <div class="w-full my-1">
            <TurnstileWidget 
              ref="turnstileRef"
              action="login"
              @success="handleTurnstileSuccess"
              @expire="handleTurnstileExpire"
            />
          </div>
        </form>

        <!-- Footer Status Indicators -->
        <footer class="mt-4 pt-6 flex justify-center lg:justify-start items-center gap-4 text-xs font-mono text-outline border-t border-outline-variant/30">
          <div class="flex items-center gap-1.5 font-medium text-primary">
            <ShieldCheck class="w-4 h-4" />
            <span>{{ $t('auth.enterpriseEdition') }}</span>
          </div>
          <div class="w-1 h-1 rounded-full bg-outline-variant" />
          <div class="flex items-center gap-1.5">
            <span>{{ appVersion }}</span>
          </div>
        </footer>
        
      </main>
    </div>

    <!-- Password Reset Flow Modal -->
    <div v-if="showForgotModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#122131]/60 backdrop-blur-sm">
      <div class="bg-surface-container-lowest rounded-2xl w-full max-w-md p-6 shadow-xl border border-outline-variant flex flex-col gap-4 animate-fade-up">
        <div class="flex justify-between items-center">
          <h3 class="text-lg font-bold text-on-surface">
            {{ resetStep === 'REQUEST' ? $t('auth.passwordResetTitle') : 'Confirm Password Reset' }}
          </h3>
          <button @click="closeForgotModal" class="text-outline hover:text-on-surface transition-colors cursor-pointer">
            <X class="w-5 h-5" />
          </button>
        </div>

        <div v-if="resetMessage" class="p-3 bg-primary-container/20 text-primary border border-primary/20 rounded-xl text-xs font-semibold">
          {{ resetMessage }}
        </div>

        <div v-if="resetError" class="p-3 bg-error-container text-on-error-container border border-error/20 rounded-xl text-xs font-semibold">
          {{ resetError }}
        </div>

        <!-- Step 1: Request Reset Code -->
        <form v-if="resetStep === 'REQUEST'" @submit.prevent="handleRequestReset" class="flex flex-col gap-4">
          <p class="text-xs text-on-surface-variant leading-relaxed">
            Enter your registered Phone Number or Email address to receive a 6-digit password reset verification code.
          </p>

          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-mono font-bold uppercase text-outline">Phone / Email</label>
            <input 
              type="text"
              v-model="resetIdentifier"
              placeholder="e.g. 255700000000 or user@dukapro.tz"
              class="w-full h-12 px-4 bg-surface-container-low border border-outline-variant rounded-xl text-sm text-on-surface focus:outline-none focus:border-primary"
              required
            />
          </div>

          <TurnstileWidget 
            ref="resetTurnstileRef"
            action="password_reset_request"
            @success="token => resetTurnstileToken = token"
            @expire="resetTurnstileToken = ''"
          />

          <div class="flex gap-2 mt-2">
            <button 
              type="button" 
              @click="closeForgotModal" 
              class="flex-1 h-11 bg-surface-container-high text-on-surface rounded-xl font-bold hover:bg-outline-variant/20 transition-all cursor-pointer text-xs"
            >
              {{ $t('common.cancel') }}
            </button>
            <button 
              type="submit" 
              :disabled="isResetting" 
              class="flex-1 h-11 bg-primary text-on-primary rounded-xl font-bold hover:bg-opacity-95 transition-all cursor-pointer text-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <RotateCw v-if="isResetting" class="w-4 h-4 animate-spin" />
              <span>Send Code</span>
            </button>
          </div>
        </form>

        <!-- Step 2: Confirm Reset Code & Set New Password -->
        <form v-else-if="resetStep === 'CONFIRM'" @submit.prevent="handleConfirmReset" class="flex flex-col gap-4">
          <p class="text-xs text-on-surface-variant leading-relaxed">
            Enter the 6-digit code sent to your email and your new password.
          </p>

          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-mono font-bold uppercase text-outline">6-Digit Code</label>
            <input 
              type="text"
              v-model="resetOtpCode"
              placeholder="e.g. 123456"
              maxlength="6"
              class="w-full h-12 px-4 bg-surface-container-low border border-outline-variant rounded-xl text-sm font-mono tracking-widest text-center text-on-surface focus:outline-none focus:border-primary"
              required
            />
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-mono font-bold uppercase text-outline">New Password</label>
            <input 
              type="password"
              v-model="resetNewPassword"
              placeholder="Minimum 6 characters"
              class="w-full h-12 px-4 bg-surface-container-low border border-outline-variant rounded-xl text-sm text-on-surface focus:outline-none focus:border-primary"
              required
            />
          </div>

          <TurnstileWidget 
            ref="confirmTurnstileRef"
            action="password_reset_confirm"
            @success="token => confirmTurnstileToken = token"
            @expire="confirmTurnstileToken = ''"
          />

          <div class="flex gap-2 mt-2">
            <button 
              type="button" 
              @click="resetStep = 'REQUEST'" 
              class="flex-1 h-11 bg-surface-container-high text-on-surface rounded-xl font-bold hover:bg-outline-variant/20 transition-all cursor-pointer text-xs"
            >
              Back
            </button>
            <button 
              type="submit" 
              :disabled="isResetting" 
              class="flex-1 h-11 bg-primary text-on-primary rounded-xl font-bold hover:bg-opacity-95 transition-all cursor-pointer text-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <RotateCw v-if="isResetting" class="w-4 h-4 animate-spin" />
              <span>Reset Password</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- License Error Modal -->
    <div v-if="showLicenseModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#122131]/70 backdrop-blur-md">
      <div class="bg-surface-container-lowest rounded-3xl w-full max-w-md p-8 shadow-2xl border border-outline-variant flex flex-col gap-5 animate-fade-up relative overflow-hidden">
        <!-- Accent top bar -->
        <div class="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-blue-500 to-purple-500"></div>
        
        <div class="flex justify-between items-start mt-2">
          <div class="w-12 h-12 rounded-2xl bg-error/10 text-error flex items-center justify-center shadow-inner">
            <ShieldAlert class="w-6 h-6 stroke-[2.5px]" />
          </div>
          <button @click="showLicenseModal = false" class="text-outline hover:text-on-surface transition-colors cursor-pointer bg-surface-container p-2 rounded-full">
            <X class="w-5 h-5" />
          </button>
        </div>
        
        <div>
          <h3 class="text-xl font-black text-on-surface tracking-tight mb-2">{{ $t('auth.licenseFailedTitle') }}</h3>
          <p class="text-sm text-on-surface-variant leading-relaxed font-medium">
            {{ $t('auth.licenseFailedMessage') }}
          </p>
        </div>
        
        <div class="mt-4 flex flex-col gap-3">
          <a 
            href="https://sintax.tz/pricing" 
            target="_blank"
            class="w-full h-12 bg-primary text-white rounded-xl font-bold hover:bg-opacity-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/25 cursor-pointer no-underline"
          >
            <span>{{ $t('auth.buyLicense') }}</span>
            <ExternalLink class="w-4 h-4" />
          </a>
          <button 
            @click="showLicenseModal = false" 
            class="w-full h-12 bg-transparent border border-outline-variant text-on-surface-variant rounded-xl font-bold hover:bg-surface-container transition-all cursor-pointer"
          >
            {{ $t('common.close') }}
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAppViewModel } from '../viewmodels/useAppViewModel';
import { api } from '../services/api';
import { isElectron } from '../services/offlineSalesService';
import { t } from '../i18n';
import LanguageSelector from '../components/common/LanguageSelector.vue';
import JengaLoader from '../components/common/JengaLoader.vue';
import TurnstileWidget from '../components/common/TurnstileWidget.vue';
import { 
  Phone, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ShieldCheck, 
  ShieldAlert, 
  ExternalLink, 
  X, 
  RotateCw,
  KeyRound
} from 'lucide-vue-next';

const vm = useAppViewModel();

const appVersion = typeof __APP_VERSION__ !== 'undefined' ? `v${__APP_VERSION__}` : 'v2.5.0';

const phone = ref(localStorage.getItem('lastPhone') || '');
const password = ref('');
const showPassword = ref(false);
const remember = ref(true);
const error = ref('');
const isLoggingIn = ref(false);

const showTwoFactorStep = ref(false);
const totpCode = ref('');
const pendingTwoFactorToken = ref('');

const turnstileRef = ref<any>(null);
const turnstileToken = ref('');

// Password Reset Modal State
const showForgotModal = ref(false);
const resetStep = ref<'REQUEST' | 'CONFIRM'>('REQUEST');
const resetIdentifier = ref('');
const resetOtpCode = ref('');
const resetNewPassword = ref('');
const resetTurnstileToken = ref('');
const confirmTurnstileToken = ref('');
const isResetting = ref(false);
const resetMessage = ref('');
const resetError = ref('');
const resetTurnstileRef = ref<any>(null);
const confirmTurnstileRef = ref<any>(null);

const showLicenseModal = ref(false);

const handleTurnstileSuccess = (token: string) => {
  turnstileToken.value = token;
};

const handleTurnstileExpire = () => {
  turnstileToken.value = '';
};

const getDeviceFingerprint = async () => {
  if ((window as any).ipcRenderer) {
    try {
      return await (window as any).ipcRenderer.invoke('get-fingerprint');
    } catch (e) {
      console.error('Failed to get hardware fingerprint', e);
      return null;
    }
  }
  return null;
};

const processSuccessfulLogin = async (res: any) => {
  if (isElectron() && (res.user?.role === 'SUPER_ADMIN' || res.user?.role === 'ADMIN')) {
    isLoggingIn.value = false;
    localStorage.clear();
    error.value = t('auth.desktopSuperAdminError');
    return;
  }

  if (res.user && res.user.role === 'SUPER_ADMIN') {
    isLoggingIn.value = false;
    localStorage.clear();
    error.value = t('auth.superAdminTerminalError');
    return;
  }

  localStorage.setItem('accessToken', res.accessToken);

  if (res.user) {
    localStorage.setItem('twoFactorEnabled', String(!!res.user.twoFactorEnabled));
    if (res.user.twoFactorRemindAt) {
      localStorage.setItem('twoFactorRemindAt', res.user.twoFactorRemindAt);
    } else {
      localStorage.removeItem('twoFactorRemindAt');
    }
    if (res.user.twoFactorPrompt || (!res.user.twoFactorEnabled && !res.user.twoFactorRemindAt)) {
      sessionStorage.setItem('pending2FaPrompt', 'true');
    }
  }

  if (res.user.role === 'ADMIN') {
    localStorage.setItem('cashierId', res.user.id);
    localStorage.setItem('storeId', res.user.storeId || '');
    localStorage.setItem('cashierName', res.user.fullName);
    localStorage.setItem('cashierRole', res.user.role || 'ADMIN');
    localStorage.removeItem('branchId');

    if (remember.value) {
      localStorage.setItem('lastPhone', phone.value);
    } else {
      localStorage.removeItem('lastPhone');
    }

    isLoggingIn.value = false;
    vm.handleLogin(res.user.fullName, null);
    return;
  }

  let storeId = res.user.storeId;
  let branchId = res.user.branchId;

  if (!storeId) {
    try {
      const stores = await api.get('/api/stores');
      if (stores && stores.length > 0) {
        const firstStore = stores[0];
        storeId = firstStore.id;
        if (firstStore.branches && firstStore.branches.length > 0) {
          branchId = firstStore.branches[0].id;
        }
      }
    } catch (err) {
      console.error('Failed to resolve store/branch:', err);
    }
  } else if (!branchId) {
    try {
      const storeData = await api.get(`/api/stores/${storeId}`);
      if (storeData && storeData.branches && storeData.branches.length > 0) {
        branchId = storeData.branches[0].id;
      }
    } catch (err) {
      console.error('Failed to resolve branch:', err);
    }
  }

  localStorage.setItem('cashierId', res.user.id);
  localStorage.setItem('storeId', storeId || '');
  localStorage.setItem('branchId', branchId || '');
  localStorage.setItem('cashierName', res.user.fullName);
  localStorage.setItem('cashierRole', res.user.role || '');

  if (remember.value) {
    localStorage.setItem('lastPhone', phone.value);
  } else {
    localStorage.removeItem('lastPhone');
  }
  isLoggingIn.value = false;
  vm.handleLogin(res.user.fullName, branchId || '');
};

const handleSubmit = async () => {
  if (!phone.value.trim()) {
    error.value = t('auth.enterPhoneError');
    return;
  }
  if (!password.value) {
    error.value = t('auth.enterPasswordError');
    return;
  }

  isLoggingIn.value = true;
  error.value = '';

  try {
    const deviceFingerprint = await getDeviceFingerprint();
    const res = await api.post('/api/auth/login', { 
      phone: phone.value, 
      password: password.value, 
      deviceFingerprint,
      turnstileToken: turnstileToken.value 
    });

    if (res.twoFactorRequired) {
      isLoggingIn.value = false;
      showTwoFactorStep.value = true;
      pendingTwoFactorToken.value = res.twoFactorToken || '';
      totpCode.value = '';
      error.value = '';
      return;
    }
    
    await processSuccessfulLogin(res);
  } catch (err: any) {
    isLoggingIn.value = false;
    turnstileRef.value?.reset();
    turnstileToken.value = '';

    const msg = err.message || t('auth.invalidCredentials');
    if (typeof msg === 'string' && msg.toLowerCase().includes('license')) {
      showLicenseModal.value = true;
    } else {
      error.value = msg;
    }
  }
};

const handleTwoFactorSubmit = async () => {
  if (!totpCode.value || totpCode.value.trim().length < 6) {
    error.value = 'Please enter your 6-digit verification code';
    return;
  }

  isLoggingIn.value = true;
  error.value = '';

  try {
    const deviceFingerprint = await getDeviceFingerprint();
    const res = await api.post('/api/auth/2fa/verify-login', { 
      twoFactorToken: pendingTwoFactorToken.value,
      totpCode: totpCode.value.trim(),
      deviceFingerprint
    });

    await processSuccessfulLogin(res);
  } catch (err: any) {
    isLoggingIn.value = false;
    const msg = err.message || 'Invalid verification code. Please check your Google Authenticator app.';
    error.value = msg;
  }
};

const cancelTwoFactorStep = () => {
  showTwoFactorStep.value = false;
  pendingTwoFactorToken.value = '';
  totpCode.value = '';
  error.value = '';
  turnstileRef.value?.reset();
  turnstileToken.value = '';
};

const alertForgot = () => {
  showForgotModal.value = true;
  resetStep.value = 'REQUEST';
  resetIdentifier.value = phone.value || '';
  resetMessage.value = '';
  resetError.value = '';
};

const closeForgotModal = () => {
  showForgotModal.value = false;
  resetStep.value = 'REQUEST';
  resetMessage.value = '';
  resetError.value = '';
};

const handleRequestReset = async () => {
  if (!resetIdentifier.value.trim()) {
    resetError.value = 'Please enter your phone number or email';
    return;
  }
  isResetting.value = true;
  resetError.value = '';
  resetMessage.value = '';

  try {
    const res = await api.post('/api/auth/password-reset/request', {
      identifier: resetIdentifier.value.trim(),
      turnstileToken: resetTurnstileToken.value,
    });
    resetMessage.value = res.message || 'Reset code sent if account exists.';
    resetStep.value = 'CONFIRM';
  } catch (err: any) {
    resetTurnstileRef.value?.reset();
    resetTurnstileToken.value = '';
    resetError.value = err.message || 'Failed to request password reset code';
  } finally {
    isResetting.value = false;
  }
};

const handleConfirmReset = async () => {
  if (!resetOtpCode.value || resetOtpCode.value.length < 6) {
    resetError.value = 'Please enter a valid 6-digit code';
    return;
  }
  if (!resetNewPassword.value || resetNewPassword.value.length < 6) {
    resetError.value = 'Password must be at least 6 characters';
    return;
  }

  isResetting.value = true;
  resetError.value = '';
  resetMessage.value = '';

  try {
    const res = await api.post('/api/auth/password-reset/confirm', {
      token: resetOtpCode.value.trim(),
      newPassword: resetNewPassword.value,
      turnstileToken: confirmTurnstileToken.value,
    });
    alert(res.message || 'Password has been reset successfully! Please sign in.');
    closeForgotModal();
  } catch (err: any) {
    confirmTurnstileRef.value?.reset();
    confirmTurnstileToken.value = '';
    resetError.value = err.message || 'Failed to reset password';
  } finally {
    isResetting.value = false;
  }
};
</script>
