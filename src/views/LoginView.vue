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
          Empower Your Business Growth
        </h2>
        <p class="text-lg text-white/80 font-medium">
          Experience seamless, efficient, and reliable point-of-sale operations with Jenga POS. Designed for modern retail and services.
        </p>
      </div>
    </div>

    <!-- Right Section: Login Form -->
    <div class="w-full lg:w-1/2 xl:w-[45%] flex flex-col justify-center items-center p-8 lg:p-16 relative bg-surface-container-lowest overflow-y-auto">
      
      <!-- Decorative ambient background gradient -->
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,_#f1f5f9_0%,_transparent_60%)] pointer-events-none" />

      <main class="w-full max-w-[400px] flex flex-col gap-10 relative z-10 animate-fade-up">
        
        <!-- Header / Branding -->
        <header class="flex flex-col items-center gap-4 text-center">
          <div class="w-16 h-16 flex items-center justify-center drop-shadow-sm mb-2">
            <img src="/logo.svg" alt="Jenga Logo" class="w-full h-full object-contain" />
          </div>
          <div>
            <h1 class="text-3xl font-bold text-on-surface tracking-tight">Welcome Back</h1>
            <p class="text-sm font-semibold text-on-surface-variant mt-2">Sign in to your Jenga POS terminal</p>
          </div>
        </header>

        <!-- Login Form -->
        <form @submit.prevent="handleSubmit" class="flex flex-col gap-6">
          
          <div v-if="error" class="p-3 bg-error-container text-on-error-container rounded-lg text-sm font-medium border border-error/10 flex items-center gap-2">
            <span class="font-bold flex-shrink-0">!</span>
            <span>{{ error }}</span>
          </div>

          <!-- Phone Number Input -->
          <div class="flex flex-col gap-2">
            <label class="text-xs font-mono font-bold uppercase tracking-wider text-outline" for="phone">
              Phone Number
            </label>
            <div class="relative flex items-center group">
              <Phone class="absolute left-4 text-outline w-5 h-5 group-focus-within:text-primary transition-colors" />
              <input 
                id="phone"
                name="phone"
                type="tel"
                v-model="phone"
                placeholder="e.g. +255 712 345 678"
                class="w-full h-14 pl-12 pr-4 bg-surface-container-low border border-outline-variant rounded-xl text-md font-sans text-on-surface focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-outline-variant/60"
                required
              />
            </div>
          </div>

          <!-- Password Input -->
          <div class="flex flex-col gap-2">
            <div class="flex justify-between items-end">
              <label class="text-xs font-mono font-bold uppercase tracking-wider text-outline" for="password">
                Password
              </label>
              <button 
                type="button"
                @click="alertForgot"
                class="text-xs font-mono font-semibold text-primary hover:text-primary-container transition-colors cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>
            <div class="relative flex items-center group">
              <Lock class="absolute left-4 text-outline w-5 h-5 group-focus-within:text-primary transition-colors" />
              <input 
                id="password"
                name="password"
                :type="showPassword ? 'text' : 'password'"
                v-model="password"
                placeholder="Enter your password"
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
          <div class="flex items-center gap-3 mt-2">
            <input 
              id="remember"
              name="remember"
              type="checkbox"
              v-model="remember"
              class="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary/20 bg-surface-container-low cursor-pointer accent-primary"
            />
            <label class="text-sm font-semibold text-on-surface-variant cursor-pointer select-none" for="remember">
              Remember this terminal
            </label>
          </div>

          <!-- Submit Action -->
          <button 
            type="submit"
            :disabled="isLoggingIn"
            class="w-full h-14 bg-primary text-on-primary rounded-xl font-bold hover:bg-opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4 shadow-md shadow-primary/20 cursor-pointer disabled:opacity-50"
          >
            <span>{{ isLoggingIn ? 'Authenticating...' : 'Sign In' }}</span>
            <ArrowRight v-if="!isLoggingIn" class="w-5 h-5" />
          </button>
        </form>

        <!-- Footer Status Indicators -->
        <footer class="mt-8 pt-8 flex justify-center lg:justify-start items-center gap-4 text-xs font-mono text-outline border-t border-outline-variant/30">
          <div class="flex items-center gap-1.5 font-medium text-primary">
            <ShieldCheck class="w-4 h-4" />
            <span>Enterprise Edition</span>
          </div>
          <div class="w-1 h-1 rounded-full bg-outline-variant" />
          <div class="flex items-center gap-1.5">
            <span>v1.0.5</span>
          </div>
        </footer>
        
      </main>
    </div>
    <!-- Forgot Password Modal -->
    <div v-if="showForgotModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#122131]/60 backdrop-blur-sm">
      <div class="bg-surface-container-lowest rounded-2xl w-full max-w-sm p-6 shadow-xl border border-outline-variant flex flex-col gap-4 animate-fade-up">
        <div class="flex justify-between items-center">
          <h3 class="text-lg font-bold text-on-surface">Password Reset</h3>
          <button @click="showForgotModal = false" class="text-outline hover:text-on-surface transition-colors cursor-pointer">
            <X class="w-5 h-5" />
          </button>
        </div>
        <p class="text-sm text-on-surface-variant leading-relaxed">
          Please contact the system administrator to verify your identity and reset your password.
        </p>
        <button @click="showForgotModal = false" class="mt-2 w-full h-12 bg-surface-container-high text-on-surface rounded-xl font-bold hover:bg-outline-variant/20 transition-all cursor-pointer">
          Close
        </button>
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
          <h3 class="text-xl font-black text-on-surface tracking-tight mb-2">License Verification Failed</h3>
          <p class="text-sm text-on-surface-variant leading-relaxed font-medium">
            Your terminal does not have a valid license or it has expired. To continue using Jenga POS, please purchase or renew your license.
          </p>
        </div>
        
        <div class="mt-4 flex flex-col gap-3">
          <a 
            href="https://sintax.tz/pricing" 
            target="_blank"
            class="w-full h-12 bg-primary text-white rounded-xl font-bold hover:bg-opacity-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/25 cursor-pointer no-underline"
          >
            <span>Buy License</span>
            <ExternalLink class="w-4 h-4" />
          </a>
          <button 
            @click="showLicenseModal = false" 
            class="w-full h-12 bg-transparent border border-outline-variant text-on-surface-variant rounded-xl font-bold hover:bg-surface-container transition-all cursor-pointer"
          >
            Close
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
import { 
  Phone, 
  Lock, 
  Eye,
  EyeOff,
  ArrowRight, 
  ShieldCheck, 
  ShieldAlert,
  ExternalLink,
  Store,
  X
} from 'lucide-vue-next';

const vm = useAppViewModel();

const phone = ref(localStorage.getItem('lastPhone') || '');
const password = ref('');
const showPassword = ref(false);
const remember = ref(true);
const error = ref('');
const isLoggingIn = ref(false);
const showForgotModal = ref(false);
const showLicenseModal = ref(false);

const getDeviceFingerprint = async () => {
  if ((window as any).ipcRenderer) {
    try {
      return await (window as any).ipcRenderer.invoke('get-fingerprint');
    } catch (e) {
      console.error('Failed to get hardware fingerprint', e);
      return null;
    }
  }
  // Standard web browser
  return null;
};

const handleSubmit = async () => {
  if (!phone.value.trim()) {
    error.value = 'Please enter phone number';
    return;
  }
  if (!password.value) {
    error.value = 'Please enter password';
    return;
  }

  isLoggingIn.value = true;
  error.value = '';

  try {
    const deviceFingerprint = await getDeviceFingerprint();
    const res = await api.post('/api/auth/login', { phone: phone.value, password: password.value, deviceFingerprint });
    
    if (res.user && res.user.role === 'SUPER_ADMIN') {
      isLoggingIn.value = false;
      error.value = 'Super admins are not allowed to log into the terminal.';
      return;
    }

    // Temporarily save accessToken to localStorage so API requests can be authenticated
    localStorage.setItem('accessToken', res.accessToken);

    let storeId = res.user.storeId;
    let branchId = res.user.branchId;

    if (!storeId) {
      // Fetch all stores (for SUPER_ADMIN)
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
        console.error('Failed to resolve store/branch for super admin:', err);
      }
    } else if (!branchId) {
      // Fetch store's branches (for ADMIN with missing branchId)
      try {
        const storeData = await api.get(`/api/stores/${storeId}`);
        if (storeData && storeData.branches && storeData.branches.length > 0) {
          branchId = storeData.branches[0].id;
        }
      } catch (err) {
        console.error('Failed to resolve branch for admin:', err);
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
  } catch (err: any) {
    isLoggingIn.value = false;
    const msg = err.message || 'Invalid phone number or password';
    if (msg.toLowerCase().includes('license')) {
      showLicenseModal.value = true;
    } else {
      error.value = msg;
    }
  }
};

const alertForgot = () => {
  showForgotModal.value = true;
};
</script>
