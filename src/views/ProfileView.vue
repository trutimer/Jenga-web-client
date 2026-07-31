<template>
  <div class="min-h-screen bg-surface font-sans text-on-surface p-4 md:p-8 space-y-8 animate-fade-in max-w-6xl mx-auto">
    <!-- Top Header Bar -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/50 pb-5">
      <div class="flex items-center gap-3">
        <button 
          @click="goBack"
          class="p-2.5 rounded-xl bg-surface-container-low hover:bg-surface-container-high border border-outline-variant/60 text-on-surface-variant transition-all cursor-pointer shadow-xs"
          title="Go Back"
        >
          <ArrowLeft class="w-5 h-5" />
        </button>
        <div>
          <h1 class="text-2xl font-black text-on-surface tracking-tight">Account & Profile</h1>
          <p class="text-xs text-on-surface-variant mt-0.5 font-medium">
            Manage your personal identity, contact details, and account password
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <span class="text-xs font-mono font-bold px-3 py-1.5 rounded-full bg-primary-container/20 text-primary border border-primary/30 uppercase tracking-wider">
          {{ userRole || 'USER' }}
        </span>
      </div>
    </div>

    <!-- User Profile Hero Card -->
    <div class="relative bg-gradient-to-br from-surface-container-lowest via-surface-container-lowest to-surface-container-low border border-outline-variant/80 rounded-3xl p-6 sm:p-8 shadow-sm overflow-hidden">
      <div class="absolute -right-10 -bottom-10 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      <div class="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
        <!-- Avatar Circle -->
        <div class="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-primary to-primary-container text-on-primary font-black text-2xl sm:text-3xl flex items-center justify-center shadow-lg uppercase tracking-wider shrink-0 border-2 border-white/20">
          {{ avatarInitials }}
        </div>

        <div class="space-y-3 text-center sm:text-left flex-1">
          <div>
            <div class="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 mb-1">
              <h2 class="text-2xl font-black text-on-surface tracking-tight">{{ formInfo.fullName || 'User Account' }}</h2>
              <span class="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-success-container/30 text-success border border-success/30 uppercase">
                Active Session
              </span>
            </div>
            <p class="text-xs text-on-surface-variant font-mono">
              User ID: <span class="text-on-surface font-semibold select-all">{{ userId || 'N/A' }}</span>
            </p>
          </div>

          <!-- Metadata Badges -->
          <div class="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-on-surface-variant font-medium pt-1">
            <div class="flex items-center gap-1.5 bg-surface-container-low px-3 py-1.5 rounded-xl border border-outline-variant/40">
              <Phone class="w-3.5 h-3.5 text-primary" />
              <span>{{ formInfo.phone || 'No Phone' }}</span>
            </div>
            <div v-if="formInfo.email" class="flex items-center gap-1.5 bg-surface-container-low px-3 py-1.5 rounded-xl border border-outline-variant/40">
              <Mail class="w-3.5 h-3.5 text-primary" />
              <span>{{ formInfo.email }}</span>
            </div>
            <div class="flex items-center gap-1.5 bg-surface-container-low px-3 py-1.5 rounded-xl border border-outline-variant/40">
              <Building2 class="w-3.5 h-3.5 text-primary" />
              <span>Branch: {{ currentBranchName }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Forms Grid: Personal Details & Standalone Password Form -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      
      <!-- FORM 1: Personal Details Configuration -->
      <div class="bg-surface-container-lowest border border-outline-variant/70 rounded-3xl p-6 sm:p-7 shadow-sm flex flex-col justify-between space-y-6">
        <div>
          <div class="flex items-center gap-3 border-b border-outline-variant/40 pb-4 mb-5">
            <div class="w-10 h-10 rounded-xl bg-primary-container/20 text-primary flex items-center justify-center shrink-0">
              <User class="w-5 h-5 stroke-[2px]" />
            </div>
            <div>
              <h3 class="text-base font-black text-on-surface">Personal Information</h3>
              <p class="text-xs text-on-surface-variant">Update your display name, contact phone, and email address</p>
            </div>
          </div>

          <form @submit.prevent="savePersonalInfo" class="space-y-4 font-sans">
            <!-- Full Name -->
            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-on-surface uppercase tracking-wider">
                Full Name <span class="text-error">*</span>
              </label>
              <div class="relative">
                <input 
                  v-model="formInfo.fullName"
                  @input="infoErrors.fullName = undefined"
                  type="text"
                  placeholder="Enter your full name"
                  class="w-full h-11 px-4 bg-surface-container-low border rounded-xl text-sm text-on-surface focus:outline-none transition-all"
                  :class="infoErrors.fullName ? 'border-error text-error bg-error-container/10 focus:border-error focus:ring-1 focus:ring-error' : 'border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary'"
                />
              </div>
              <p v-if="infoErrors.fullName" class="text-xs font-semibold text-error mt-1 flex items-center gap-1">
                <AlertCircle class="w-3.5 h-3.5 shrink-0" />
                <span>{{ infoErrors.fullName }}</span>
              </p>
            </div>

            <!-- Phone Number -->
            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-on-surface uppercase tracking-wider">
                Phone Number <span class="text-error">*</span>
              </label>
              <div class="relative">
                <input 
                  v-model="formInfo.phone"
                  @input="infoErrors.phone = undefined"
                  type="text"
                  placeholder="e.g. 255711111111"
                  class="w-full h-11 px-4 bg-surface-container-low border rounded-xl text-sm text-on-surface focus:outline-none transition-all font-mono"
                  :class="infoErrors.phone ? 'border-error text-error bg-error-container/10 focus:border-error focus:ring-1 focus:ring-error' : 'border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary'"
                />
              </div>
              <p v-if="infoErrors.phone" class="text-xs font-semibold text-error mt-1 flex items-center gap-1">
                <AlertCircle class="w-3.5 h-3.5 shrink-0" />
                <span>{{ infoErrors.phone }}</span>
              </p>
            </div>

            <!-- Email Address (Optional) -->
            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-on-surface uppercase tracking-wider">
                Email Address <span class="text-on-surface-variant/60 font-normal">(Optional)</span>
              </label>
              <div class="relative">
                <input 
                  v-model="formInfo.email"
                  @input="infoErrors.email = undefined"
                  type="email"
                  placeholder="user@dukapro.co.tz"
                  class="w-full h-11 px-4 bg-surface-container-low border rounded-xl text-sm text-on-surface focus:outline-none transition-all"
                  :class="infoErrors.email ? 'border-error text-error bg-error-container/10 focus:border-error focus:ring-1 focus:ring-error' : 'border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary'"
                />
              </div>
              <p v-if="infoErrors.email" class="text-xs font-semibold text-error mt-1 flex items-center gap-1">
                <AlertCircle class="w-3.5 h-3.5 shrink-0" />
                <span>{{ infoErrors.email }}</span>
              </p>
            </div>

            <!-- Role (Read-only) -->
            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                Account Role
              </label>
              <input 
                :value="userRole || 'USER'"
                type="text"
                disabled
                class="w-full h-11 px-4 bg-surface-container-high/50 border border-outline-variant/40 rounded-xl text-sm font-bold text-on-surface-variant cursor-not-allowed uppercase font-mono"
              />
            </div>

            <div class="pt-3">
              <button 
                type="submit"
                :disabled="isSavingInfo"
                class="w-full h-11 bg-primary text-on-primary font-bold text-xs rounded-xl hover:bg-primary/90 transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Loader2 v-if="isSavingInfo" class="w-4 h-4 animate-spin" />
                <Save v-else class="w-4 h-4" />
                <span>{{ isSavingInfo ? 'Saving Changes...' : 'Save Personal Details' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- FORM 2: Standalone Change Password Form -->
      <div class="bg-surface-container-lowest border border-outline-variant/70 rounded-3xl p-6 sm:p-7 shadow-sm flex flex-col justify-between space-y-6 relative overflow-hidden">
        <div class="absolute top-0 right-0 w-28 h-28 bg-primary/5 rounded-bl-full pointer-events-none" />

        <div>
          <div class="flex items-center gap-3 border-b border-outline-variant/40 pb-4 mb-5 relative z-10">
            <div class="w-10 h-10 rounded-xl bg-error-container/20 text-error flex items-center justify-center shrink-0">
              <Lock class="w-5 h-5 stroke-[2px]" />
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-base font-black text-on-surface">Change Account Password</h3>
                <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-surface-container-high text-on-surface-variant uppercase">
                  Standalone Form
                </span>
              </div>
              <p class="text-xs text-on-surface-variant">Update your security credentials independently</p>
            </div>
          </div>

          <form @submit.prevent="updatePassword" class="space-y-4 font-sans relative z-10">
            <!-- Current / Old Password -->
            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-on-surface uppercase tracking-wider">
                Current (Old) Password <span class="text-error">*</span>
              </label>
              <div class="relative">
                <input 
                  v-model="passwordForm.oldPassword"
                  @input="passwordErrors.oldPassword = undefined"
                  :type="showOldPass ? 'text' : 'password'"
                  placeholder="Enter your current password"
                  class="w-full h-11 pl-4 pr-11 bg-surface-container-low border rounded-xl text-sm text-on-surface focus:outline-none transition-all font-mono"
                  :class="passwordErrors.oldPassword ? 'border-error text-error bg-error-container/10 focus:border-error focus:ring-1 focus:ring-error' : 'border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary'"
                />
                <button 
                  type="button"
                  @click="showOldPass = !showOldPass"
                  class="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
                >
                  <EyeOff v-if="showOldPass" class="w-4 h-4" />
                  <Eye v-else class="w-4 h-4" />
                </button>
              </div>
              <p v-if="passwordErrors.oldPassword" class="text-xs font-semibold text-error mt-1 flex items-center gap-1">
                <AlertCircle class="w-3.5 h-3.5 shrink-0" />
                <span>{{ passwordErrors.oldPassword }}</span>
              </p>
            </div>

            <!-- New Password -->
            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-on-surface uppercase tracking-wider">
                New Password <span class="text-error">*</span>
              </label>
              <div class="relative">
                <input 
                  v-model="passwordForm.newPassword"
                  @input="passwordErrors.newPassword = undefined"
                  :type="showNewPass ? 'text' : 'password'"
                  placeholder="Minimum 6 characters"
                  class="w-full h-11 pl-4 pr-11 bg-surface-container-low border rounded-xl text-sm text-on-surface focus:outline-none transition-all font-mono"
                  :class="passwordErrors.newPassword ? 'border-error text-error bg-error-container/10 focus:border-error focus:ring-1 focus:ring-error' : 'border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary'"
                />
                <button 
                  type="button"
                  @click="showNewPass = !showNewPass"
                  class="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
                >
                  <EyeOff v-if="showNewPass" class="w-4 h-4" />
                  <Eye v-else class="w-4 h-4" />
                </button>
              </div>
              <p v-if="passwordErrors.newPassword" class="text-xs font-semibold text-error mt-1 flex items-center gap-1">
                <AlertCircle class="w-3.5 h-3.5 shrink-0" />
                <span>{{ passwordErrors.newPassword }}</span>
              </p>
            </div>

            <!-- Confirm New Password -->
            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-on-surface uppercase tracking-wider">
                Confirm New Password <span class="text-error">*</span>
              </label>
              <div class="relative">
                <input 
                  v-model="passwordForm.confirmPassword"
                  @input="passwordErrors.confirmPassword = undefined"
                  :type="showConfirmPass ? 'text' : 'password'"
                  placeholder="Re-type new password"
                  class="w-full h-11 pl-4 pr-11 bg-surface-container-low border rounded-xl text-sm text-on-surface focus:outline-none transition-all font-mono"
                  :class="passwordErrors.confirmPassword ? 'border-error text-error bg-error-container/10 focus:border-error focus:ring-1 focus:ring-error' : 'border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary'"
                />
                <button 
                  type="button"
                  @click="showConfirmPass = !showConfirmPass"
                  class="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
                >
                  <EyeOff v-if="showConfirmPass" class="w-4 h-4" />
                  <Eye v-else class="w-4 h-4" />
                </button>
              </div>
              <p v-if="passwordErrors.confirmPassword" class="text-xs font-semibold text-error mt-1 flex items-center gap-1">
                <AlertCircle class="w-3.5 h-3.5 shrink-0" />
                <span>{{ passwordErrors.confirmPassword }}</span>
              </p>
            </div>

            <!-- Password Validation Rules Indicator -->
            <div class="bg-surface-container-low rounded-xl p-3.5 border border-outline-variant/40 space-y-2 text-xs">
              <div class="font-mono font-bold text-on-surface-variant uppercase text-[10px] tracking-wider">
                Password Requirements:
              </div>
              <div class="flex items-center gap-2" :class="passwordForm.newPassword.length >= 6 ? 'text-success font-bold' : 'text-on-surface-variant'">
                <CheckCircle2 v-if="passwordForm.newPassword.length >= 6" class="w-3.5 h-3.5 shrink-0" />
                <AlertCircle v-else class="w-3.5 h-3.5 shrink-0" />
                <span>At least 6 characters long</span>
              </div>
              <div class="flex items-center gap-2" :class="passwordsMatch ? 'text-success font-bold' : 'text-on-surface-variant'">
                <CheckCircle2 v-if="passwordsMatch" class="w-3.5 h-3.5 shrink-0" />
                <AlertCircle v-else class="w-3.5 h-3.5 shrink-0" />
                <span>Passwords match</span>
              </div>
            </div>

            <div class="pt-3">
              <button 
                type="submit"
                :disabled="isUpdatingPassword || !isPasswordFormValid"
                class="w-full h-11 bg-error text-on-primary font-bold text-xs rounded-xl hover:bg-error/90 transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Loader2 v-if="isUpdatingPassword" class="w-4 h-4 animate-spin" />
                <KeyRound v-else class="w-4 h-4" />
                <span>{{ isUpdatingPassword ? 'Updating Password...' : 'Update Account Password' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { api } from '../services/api';
import { showToast } from '../services/toastService';
import { useAppViewModel } from '../viewmodels/useAppViewModel';
import { 
  User, 
  Lock, 
  ArrowLeft, 
  Phone, 
  Mail, 
  Building2, 
  Save, 
  KeyRound, 
  Eye, 
  EyeOff, 
  Loader2, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-vue-next';

const router = useRouter();
const { userId, userRole, activeBranchId } = useAppViewModel();

const formInfo = ref({
  fullName: localStorage.getItem('cashierName') || '',
  phone: '',
  email: ''
});

const passwordForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
});

const showOldPass = ref(false);
const showNewPass = ref(false);
const showConfirmPass = ref(false);

const infoErrors = ref<{
  fullName?: string;
  phone?: string;
  email?: string;
}>({});

const passwordErrors = ref<{
  oldPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}>({});

const isSavingInfo = ref(false);
const isUpdatingPassword = ref(false);
const currentBranchName = ref('Main Store');

const avatarInitials = computed(() => {
  const name = (formInfo.value.fullName || 'User Account').trim();
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length >= 2 && parts[0] && parts[1]) {
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
});

const passwordsMatch = computed(() => {
  if (!passwordForm.value.newPassword || !passwordForm.value.confirmPassword) return false;
  return passwordForm.value.newPassword === passwordForm.value.confirmPassword;
});

const isPasswordFormValid = computed(() => {
  return passwordForm.value.oldPassword.trim().length > 0 &&
         passwordForm.value.newPassword.length >= 6 && 
         passwordsMatch.value;
});

const goBack = () => {
  if (userRole.value === 'CASHIER') {
    router.push('/checkout');
  } else {
    router.push('/dashboard');
  }
};

const fetchUserProfile = async () => {
  const id = userId.value || localStorage.getItem('userId');
  if (!id) return;

  try {
    const userObj = await api.get(`/api/users/${id}`, { suppressToast: true });
    if (userObj) {
      formInfo.value.fullName = userObj.fullName || localStorage.getItem('cashierName') || '';
      formInfo.value.phone = userObj.phone || '';
      formInfo.value.email = userObj.email || '';
    }
  } catch (err) {
    console.warn('Could not fetch user profile details, using session values:', err);
  }

  const branchId = activeBranchId.value || localStorage.getItem('branchId');
  const storeId = localStorage.getItem('storeId');
  if (branchId && storeId) {
    try {
      const branches = await api.get(`/api/stores/${storeId}/branches`, { suppressToast: true });
      if (Array.isArray(branches)) {
        const found = branches.find((b: any) => b.id === branchId);
        if (found) currentBranchName.value = found.name;
      }
    } catch {
      // fallback
    }
  }
};

const savePersonalInfo = async () => {
  infoErrors.value = {};

  if (!formInfo.value.fullName.trim()) {
    infoErrors.value.fullName = 'Full name is required';
    return;
  }
  if (!formInfo.value.phone.trim()) {
    infoErrors.value.phone = 'Phone number is required';
    return;
  }

  const id = userId.value || localStorage.getItem('userId');
  const storeId = localStorage.getItem('storeId');
  const branchId = activeBranchId.value || localStorage.getItem('branchId');

  if (!id) {
    showToast('User session ID not found.', 'error');
    return;
  }

  isSavingInfo.value = true;
  try {
    const payload = {
      storeId: storeId || undefined,
      branchId: branchId || undefined,
      fullName: formInfo.value.fullName,
      phone: formInfo.value.phone,
      email: formInfo.value.email || undefined,
      role: userRole.value || localStorage.getItem('cashierRole') || 'ADMIN'
    };

    const updated = await api.put(`/api/users/${id}`, payload, { suppressToast: true });
    if (updated) {
      if (updated.fullName) {
        localStorage.setItem('cashierName', updated.fullName);
      }
      showToast('Personal details updated successfully!', 'success');
    }
  } catch (err: any) {
    const serverError = err.message || 'Failed to update personal details.';
    const lower = serverError.toLowerCase();
    if (lower.includes('phone')) {
      infoErrors.value.phone = serverError;
    } else if (lower.includes('email')) {
      infoErrors.value.email = serverError;
    } else if (lower.includes('full name') || lower.includes('name')) {
      infoErrors.value.fullName = serverError;
    } else {
      infoErrors.value.fullName = serverError;
    }
  } finally {
    isSavingInfo.value = false;
  }
};

const updatePassword = async () => {
  passwordErrors.value = {};

  let hasErr = false;
  if (!passwordForm.value.oldPassword.trim()) {
    passwordErrors.value.oldPassword = 'Current (old) password is required';
    hasErr = true;
  }
  if (!passwordForm.value.newPassword) {
    passwordErrors.value.newPassword = 'New password is required';
    hasErr = true;
  } else if (passwordForm.value.newPassword.length < 6) {
    passwordErrors.value.newPassword = 'Password must be at least 6 characters';
    hasErr = true;
  }
  if (!passwordForm.value.confirmPassword) {
    passwordErrors.value.confirmPassword = 'Please confirm your new password';
    hasErr = true;
  } else if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    passwordErrors.value.confirmPassword = 'Passwords do not match';
    hasErr = true;
  }

  if (hasErr) return;

  const id = userId.value || localStorage.getItem('userId');
  const storeId = localStorage.getItem('storeId');
  const branchId = activeBranchId.value || localStorage.getItem('branchId');

  if (!id) {
    showToast('User session ID not found.', 'error');
    return;
  }

  isUpdatingPassword.value = true;
  try {
    const payload = {
      storeId: storeId || undefined,
      branchId: branchId || undefined,
      fullName: formInfo.value.fullName,
      phone: formInfo.value.phone,
      email: formInfo.value.email || undefined,
      role: userRole.value || localStorage.getItem('cashierRole') || 'ADMIN',
      password: passwordForm.value.newPassword,
      oldPassword: passwordForm.value.oldPassword
    };

    await api.put(`/api/users/${id}`, payload, { suppressToast: true });
    showToast('Account password updated successfully!', 'success');
    passwordForm.value.oldPassword = '';
    passwordForm.value.newPassword = '';
    passwordForm.value.confirmPassword = '';
  } catch (err: any) {
    const serverError = err.message || 'Failed to update account password.';
    const lower = serverError.toLowerCase();
    
    if (lower.includes('old password') || lower.includes('current') || lower.includes('incorrect') || lower.includes('wrong') || lower.includes('invalid') || lower.includes('required')) {
      passwordErrors.value.oldPassword = serverError;
    } else if (lower.includes('at least 6 characters') || lower.includes('new password')) {
      passwordErrors.value.newPassword = serverError;
    } else {
      passwordErrors.value.oldPassword = serverError;
    }
  } finally {
    isUpdatingPassword.value = false;
  }
};

onMounted(() => {
  fetchUserProfile();
});
</script>
