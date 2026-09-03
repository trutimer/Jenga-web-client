<template>
  <div class="min-h-screen bg-surface font-sans text-on-surface p-4 md:p-8 space-y-8 animate-fade-in max-w-6xl mx-auto">
    <!-- Top Header Bar -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/50 pb-5">
      <div class="flex items-center gap-3">
        <button 
          @click="goBack"
          class="p-2.5 rounded-xl bg-surface-container-low hover:bg-surface-container-high border border-outline-variant/60 text-on-surface-variant transition-all cursor-pointer shadow-xs"
          :title="$t('common.back')"
        >
          <ArrowLeft class="w-5 h-5" />
        </button>
        <div>
          <h1 class="text-2xl font-black text-on-surface tracking-tight">{{ $t('profile.title') }}</h1>
          <p class="text-xs text-on-surface-variant mt-0.5 font-medium">
            {{ $t('profile.subtitle') }}
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
                {{ $t('profile.activeSession') }}
              </span>
              <span 
                v-if="twoFactorEnabled" 
                class="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-primary-container/30 text-primary border border-primary/30 flex items-center gap-1 uppercase"
              >
                <ShieldCheck class="w-3 h-3" />
                2FA Enabled
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
              <span>{{ formInfo.phone || $t('profile.noPhone') }}</span>
            </div>
            <div v-if="formInfo.email" class="flex items-center gap-1.5 bg-surface-container-low px-3 py-1.5 rounded-xl border border-outline-variant/40">
              <Mail class="w-3.5 h-3.5 text-primary" />
              <span>{{ formInfo.email }}</span>
            </div>
            <div class="flex items-center gap-1.5 bg-surface-container-low px-3 py-1.5 rounded-xl border border-outline-variant/40">
              <Building2 class="w-3.5 h-3.5 text-primary" />
              <span>{{ $t('topNav.branch') }}: {{ currentBranchName }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Security & 2FA Spotlight Banner -->
    <div class="bg-gradient-to-r from-surface-container-lowest via-surface-container-lowest to-primary-container/10 border border-outline-variant/70 rounded-3xl p-6 sm:p-7 shadow-sm">
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div class="flex items-start gap-4">
          <div 
            class="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
            :class="twoFactorEnabled ? 'bg-success-container/30 text-success' : (twoFactorRemindAt ? 'bg-amber-500/10 text-amber-600' : 'bg-primary-container/20 text-primary')"
          >
            <ShieldCheck v-if="twoFactorEnabled" class="w-6 h-6 stroke-[2.5px]" />
            <Clock v-else-if="twoFactorRemindAt" class="w-6 h-6 stroke-[2.5px]" />
            <ShieldAlert v-else class="w-6 h-6 stroke-[2.5px]" />
          </div>

          <div class="space-y-1">
            <div class="flex items-center gap-2.5">
              <h3 class="text-base font-black text-on-surface">Google Authenticator Two-Factor Authentication (2FA)</h3>
              <span 
                v-if="twoFactorEnabled"
                class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-success-container text-success border border-success/30"
              >
                ACTIVE
              </span>
              <span 
                v-else-if="twoFactorRemindAt"
                class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-700 border border-amber-500/30"
              >
                REMINDER SCHEDULED
              </span>
              <span 
                v-else
                class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-surface-container-high text-on-surface-variant border border-outline-variant"
              >
                OPTIONAL - RECOMMENDED
              </span>
            </div>
            <p class="text-xs text-on-surface-variant max-w-2xl leading-relaxed">
              Add an extra layer of protection to your store and financial ledgers. When active, signing in requires a 6-digit TOTP code generated by Google Authenticator on your phone.
            </p>
            <p v-if="twoFactorRemindAt && !twoFactorEnabled" class="text-xs text-amber-700 font-semibold pt-1 flex items-center gap-1.5">
              <Bell class="w-3.5 h-3.5 shrink-0" />
              <span>Next reminder scheduled for {{ formatReminderDate(twoFactorRemindAt) }}</span>
            </p>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-3 shrink-0">
          <template v-if="!twoFactorEnabled">
            <button 
              @click="openSetupModal" 
              class="h-11 px-5 bg-primary text-on-primary font-bold text-xs rounded-xl hover:bg-opacity-95 transition-all cursor-pointer shadow-sm flex items-center gap-2"
            >
              <KeyRound class="w-4 h-4" />
              <span>Setup Google Authenticator</span>
            </button>
            <button 
              @click="openReminderModal" 
              class="h-11 px-4 bg-surface-container-low hover:bg-surface-container-high border border-outline-variant text-on-surface font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-2"
            >
              <Clock class="w-4 h-4 text-on-surface-variant" />
              <span>Remind Me Later</span>
            </button>
          </template>
          <template v-else>
            <button 
              @click="openDisableModal" 
              class="h-11 px-4 bg-error-container/20 hover:bg-error-container/40 border border-error/30 text-error font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-2"
            >
              <Lock class="w-4 h-4" />
              <span>Disable 2FA</span>
            </button>
          </template>
        </div>
      </div>
    </div>

    <!-- Forms Grid: Personal Details & Password Form -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      
      <!-- FORM 1: Personal Details Configuration -->
      <div class="bg-surface-container-lowest border border-outline-variant/70 rounded-3xl p-6 sm:p-7 shadow-sm flex flex-col justify-between space-y-6">
        <div>
          <div class="flex items-center gap-3 border-b border-outline-variant/40 pb-4 mb-5">
            <div class="w-10 h-10 rounded-xl bg-primary-container/20 text-primary flex items-center justify-center shrink-0">
              <User class="w-5 h-5 stroke-[2px]" />
            </div>
            <div>
              <h3 class="text-base font-black text-on-surface">{{ $t('settings.personalInfo') }}</h3>
              <p class="text-xs text-on-surface-variant">{{ $t('profile.personalInfoDesc') }}</p>
            </div>
          </div>

          <form @submit.prevent="savePersonalInfo" class="space-y-4 font-sans">
            <!-- Full Name -->
            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-on-surface uppercase tracking-wider">
                {{ $t('users.fullName') }} <span class="text-error">*</span>
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
                {{ $t('users.phone') }} <span class="text-error">*</span>
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

            <!-- Email Address -->
            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-on-surface uppercase tracking-wider">
                {{ $t('users.email') }}
              </label>
              <div class="relative">
                <input 
                  v-model="formInfo.email"
                  @input="infoErrors.email = undefined"
                  type="email"
                  placeholder="user@dukapro.tz"
                  class="w-full h-11 px-4 bg-surface-container-low border rounded-xl text-sm text-on-surface focus:outline-none transition-all"
                  :class="infoErrors.email ? 'border-error text-error bg-error-container/10 focus:border-error focus:ring-1 focus:ring-error' : 'border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary'"
                />
              </div>
              <p v-if="infoErrors.email" class="text-xs font-semibold text-error mt-1 flex items-center gap-1">
                <AlertCircle class="w-3.5 h-3.5 shrink-0" />
                <span>{{ infoErrors.email }}</span>
              </p>
            </div>

            <div class="pt-2">
              <button 
                type="submit"
                :disabled="isSavingInfo"
                class="w-full h-11 bg-primary text-on-primary font-bold text-xs rounded-xl hover:bg-opacity-95 transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Loader2 v-if="isSavingInfo" class="w-4 h-4 animate-spin" />
                <Save v-else class="w-4 h-4" />
                <span>{{ isSavingInfo ? $t('common.loading') : $t('profile.saveChanges') }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- FORM 2: Standalone Password Configuration -->
      <div class="bg-surface-container-lowest border border-outline-variant/70 rounded-3xl p-6 sm:p-7 shadow-sm flex flex-col justify-between space-y-6">
        <div>
          <div class="flex items-center gap-3 border-b border-outline-variant/40 pb-4 mb-5">
            <div class="w-10 h-10 rounded-xl bg-primary-container/20 text-primary flex items-center justify-center shrink-0">
              <Lock class="w-5 h-5 stroke-[2px]" />
            </div>
            <div>
              <h3 class="text-base font-black text-on-surface">{{ $t('settings.changePassword') }}</h3>
              <p class="text-xs text-on-surface-variant">{{ $t('profile.securityDesc') }}</p>
            </div>
          </div>

          <form @submit.prevent="updatePassword" class="space-y-4 font-sans">
            <!-- Current Password -->
            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-on-surface uppercase tracking-wider">
                {{ $t('settings.currentPassword') }} <span class="text-error">*</span>
              </label>
              <div class="relative">
                <input 
                  v-model="passwordForm.oldPassword"
                  @input="passwordErrors.oldPassword = undefined"
                  :type="showOldPass ? 'text' : 'password'"
                  :placeholder="$t('settings.enterCurrentPassword')"
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
                {{ $t('settings.newPassword') }} <span class="text-error">*</span>
              </label>
              <div class="relative">
                <input 
                  v-model="passwordForm.newPassword"
                  @input="passwordErrors.newPassword = undefined"
                  :type="showNewPass ? 'text' : 'password'"
                  :placeholder="$t('settings.enterNewPassword')"
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
                {{ $t('settings.confirmPassword') }} <span class="text-error">*</span>
              </label>
              <div class="relative">
                <input 
                  v-model="passwordForm.confirmPassword"
                  @input="passwordErrors.confirmPassword = undefined"
                  :type="showConfirmPass ? 'text' : 'password'"
                  :placeholder="$t('settings.retypeNewPassword')"
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
                {{ $t('settings.passwordRequirementsTitle') }}
              </div>
              <div class="flex items-center gap-2" :class="passwordForm.newPassword.length >= 6 ? 'text-success font-bold' : 'text-on-surface-variant'">
                <CheckCircle2 v-if="passwordForm.newPassword.length >= 6" class="w-3.5 h-3.5 shrink-0" />
                <AlertCircle v-else class="w-3.5 h-3.5 shrink-0" />
                <span>{{ $t('settings.passwordMinLength') }}</span>
              </div>
              <div class="flex items-center gap-2" :class="passwordsMatch ? 'text-success font-bold' : 'text-on-surface-variant'">
                <CheckCircle2 v-if="passwordsMatch" class="w-3.5 h-3.5 shrink-0" />
                <AlertCircle v-else class="w-3.5 h-3.5 shrink-0" />
                <span>{{ $t('settings.passwordsMatch') }}</span>
              </div>
            </div>

            <!-- Cloudflare Turnstile Bot Defense -->
            <div class="py-1">
              <TurnstileWidget 
                ref="profileTurnstileRef"
                action="change_password"
                @success="token => changePassTurnstileToken = token"
                @expire="changePassTurnstileToken = ''"
              />
            </div>

            <div class="pt-2">
              <button 
                type="submit"
                :disabled="isUpdatingPassword || !isPasswordFormValid"
                class="w-full h-11 bg-error text-on-primary font-bold text-xs rounded-xl hover:bg-error/90 transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Loader2 v-if="isUpdatingPassword" class="w-4 h-4 animate-spin" />
                <KeyRound v-else class="w-4 h-4" />
                <span>{{ isUpdatingPassword ? $t('common.loading') : $t('settings.updatePassword') }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

    </div>

    <!-- 2FA SETUP MODAL -->
    <div v-if="showSetupModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#122131]/70 backdrop-blur-sm">
      <div class="bg-surface-container-lowest rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-2xl border border-outline-variant flex flex-col gap-5 animate-fade-up max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center pb-3 border-b border-outline-variant/40">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl bg-primary-container/20 text-primary flex items-center justify-center">
              <KeyRound class="w-5 h-5" />
            </div>
            <div>
              <h3 class="text-lg font-black text-on-surface">Setup Google Authenticator</h3>
              <p class="text-xs text-on-surface-variant">Step-by-step 2FA activation</p>
            </div>
          </div>
          <button @click="showSetupModal = false" class="text-outline hover:text-on-surface p-1.5 rounded-full hover:bg-surface-container transition-colors cursor-pointer">
            <X class="w-5 h-5" />
          </button>
        </div>

        <div v-if="setupLoading" class="py-12 flex flex-col items-center justify-center gap-3">
          <Loader2 class="w-8 h-8 text-primary animate-spin" />
          <p class="text-xs text-on-surface-variant font-medium">Generating secure 2FA keys...</p>
        </div>

        <div v-else class="space-y-5 text-xs text-on-surface-variant">
          <!-- Step 1: Scan QR Code -->
          <div class="space-y-2">
            <div class="font-bold text-on-surface text-sm flex items-center gap-1.5">
              <span class="w-5 h-5 rounded-full bg-primary text-on-primary text-xs flex items-center justify-center">1</span>
              <span>Scan QR Code in Google Authenticator</span>
            </div>
            <p class="text-xs text-on-surface-variant">
              Open <strong>Google Authenticator</strong> or any TOTP app, tap <strong>+</strong>, and scan the QR code below.
            </p>
            <div class="flex justify-center p-4 bg-white rounded-2xl border border-outline-variant/60 shadow-inner w-fit mx-auto">
              <img v-if="qrCodeDataUrl" :src="qrCodeDataUrl" alt="2FA QR Code" class="w-48 h-48" />
              <div v-else class="w-48 h-48 flex items-center justify-center text-xs text-slate-400">Loading QR...</div>
            </div>
          </div>

          <!-- Step 2: Manual Key Option -->
          <div class="space-y-1.5 bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/40">
            <div class="flex justify-between items-center">
              <span class="font-bold text-on-surface">Or enter key manually:</span>
              <button 
                type="button" 
                @click="copySecretKey" 
                class="text-primary font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Copy class="w-3.5 h-3.5" />
                <span>{{ copiedSecret ? 'Copied!' : 'Copy Key' }}</span>
              </button>
            </div>
            <div class="font-mono text-sm font-bold tracking-widest text-on-surface select-all break-all">
              {{ setupSecret }}
            </div>
          </div>

          <!-- Step 3: Enter 6-digit Code to Activate -->
          <form @submit.prevent="enableTwoFactor" class="space-y-3 pt-2">
            <div class="space-y-1.5">
              <div class="font-bold text-on-surface text-sm flex items-center gap-1.5">
                <span class="w-5 h-5 rounded-full bg-primary text-on-primary text-xs flex items-center justify-center">2</span>
                <span>Enter 6-Digit Verification Code</span>
              </div>
              <input 
                v-model="setupVerificationCode" 
                type="text"
                maxlength="6"
                placeholder="000000"
                class="w-full h-12 bg-surface-container-low border border-outline-variant rounded-xl text-center text-lg font-mono tracking-widest text-on-surface focus:outline-none focus:border-primary"
                required
              />
            </div>

            <div v-if="setupError" class="p-3 bg-error-container text-on-error-container rounded-xl text-xs font-semibold">
              {{ setupError }}
            </div>

            <div class="flex gap-2.5 pt-2">
              <button 
                type="button" 
                @click="showSetupModal = false"
                class="flex-1 h-11 bg-surface-container-high text-on-surface font-bold rounded-xl transition-all cursor-pointer"
              >
                {{ $t('common.cancel') }}
              </button>
              <button 
                type="submit"
                :disabled="isActivating2FA || setupVerificationCode.length < 6"
                class="flex-1 h-11 bg-primary text-on-primary font-bold rounded-xl hover:bg-opacity-95 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Loader2 v-if="isActivating2FA" class="w-4 h-4 animate-spin" />
                <span>Activate 2FA</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- 2FA REMINDER MODAL -->
    <div v-if="showReminderModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#122131]/70 backdrop-blur-sm">
      <div class="bg-surface-container-lowest rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl border border-outline-variant flex flex-col gap-5 animate-fade-up">
        <div class="flex justify-between items-center pb-3 border-b border-outline-variant/40">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-600 flex items-center justify-center">
              <Clock class="w-5 h-5" />
            </div>
            <div>
              <h3 class="text-lg font-black text-on-surface">Schedule 2FA Reminder</h3>
              <p class="text-xs text-on-surface-variant">Postpone 2FA setup with notification</p>
            </div>
          </div>
          <button @click="showReminderModal = false" class="text-outline hover:text-on-surface p-1.5 rounded-full hover:bg-surface-container transition-colors cursor-pointer">
            <X class="w-5 h-5" />
          </button>
        </div>

        <p class="text-xs text-on-surface-variant leading-relaxed">
          Choose when you would like to be reminded. When the reminder triggers, Jenga will automatically create a <strong>HIGH priority in-app notification</strong> and dispatch a <strong>security alert email</strong>.
        </p>

        <form @submit.prevent="scheduleReminder" class="space-y-4">
          <div class="grid grid-cols-3 gap-2">
            <button 
              type="button" 
              @click="reminderDays = 7"
              class="p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center"
              :class="reminderDays === 7 ? 'bg-primary text-on-primary border-primary' : 'bg-surface-container-low border-outline-variant text-on-surface'"
            >
              7 Days
            </button>
            <button 
              type="button" 
              @click="reminderDays = 14"
              class="p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center"
              :class="reminderDays === 14 ? 'bg-primary text-on-primary border-primary' : 'bg-surface-container-low border-outline-variant text-on-surface'"
            >
              14 Days
            </button>
            <button 
              type="button" 
              @click="reminderDays = 30"
              class="p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center"
              :class="reminderDays === 30 ? 'bg-primary text-on-primary border-primary' : 'bg-surface-container-low border-outline-variant text-on-surface'"
            >
              30 Days
            </button>
          </div>

          <div class="flex gap-2.5 pt-2">
            <button 
              type="button" 
              @click="showReminderModal = false"
              class="flex-1 h-11 bg-surface-container-high text-on-surface font-bold rounded-xl transition-all cursor-pointer text-xs"
            >
              {{ $t('common.cancel') }}
            </button>
            <button 
              type="submit"
              :disabled="isSchedulingReminder"
              class="flex-1 h-11 bg-primary text-on-primary font-bold rounded-xl hover:bg-opacity-95 transition-all cursor-pointer text-xs flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Loader2 v-if="isSchedulingReminder" class="w-4 h-4 animate-spin" />
              <span>Set Reminder</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- 2FA DISABLE MODAL -->
    <div v-if="showDisableModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#122131]/70 backdrop-blur-sm">
      <div class="bg-surface-container-lowest rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl border border-outline-variant flex flex-col gap-5 animate-fade-up">
        <div class="flex justify-between items-center pb-3 border-b border-outline-variant/40">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl bg-error-container/20 text-error flex items-center justify-center">
              <ShieldAlert class="w-5 h-5" />
            </div>
            <div>
              <h3 class="text-lg font-black text-on-surface">Disable 2FA</h3>
              <p class="text-xs text-on-surface-variant">Confirm your password to turn off 2FA</p>
            </div>
          </div>
          <button @click="showDisableModal = false" class="text-outline hover:text-on-surface p-1.5 rounded-full hover:bg-surface-container transition-colors cursor-pointer">
            <X class="w-5 h-5" />
          </button>
        </div>

        <p class="text-xs text-error leading-relaxed font-medium">
          Warning: Disabling Two-Factor Authentication reduces your account security. Anyone with your password will be able to access your account.
        </p>

        <form @submit.prevent="disableTwoFactor" class="space-y-4">
          <div class="space-y-1.5">
            <label class="text-xs font-mono font-bold uppercase text-outline">Confirm Password</label>
            <input 
              v-model="disablePassword"
              type="password"
              placeholder="Enter your account password"
              class="w-full h-11 px-4 bg-surface-container-low border border-outline-variant rounded-xl text-sm text-on-surface focus:outline-none focus:border-error"
              required
            />
          </div>

          <div v-if="disableError" class="p-3 bg-error-container text-on-error-container rounded-xl text-xs font-semibold">
            {{ disableError }}
          </div>

          <div class="flex gap-2.5 pt-2">
            <button 
              type="button" 
              @click="showDisableModal = false"
              class="flex-1 h-11 bg-surface-container-high text-on-surface font-bold rounded-xl transition-all cursor-pointer text-xs"
            >
              {{ $t('common.cancel') }}
            </button>
            <button 
              type="submit"
              :disabled="isDisabling2FA || !disablePassword"
              class="flex-1 h-11 bg-error text-on-primary font-bold rounded-xl hover:bg-opacity-95 transition-all cursor-pointer text-xs flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Loader2 v-if="isDisabling2FA" class="w-4 h-4 animate-spin" />
              <span>Disable 2FA</span>
            </button>
          </div>
        </form>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import QRCode from 'qrcode';
import { api } from '../services/api';
import { showToast } from '../services/toastService';
import { useAppViewModel } from '../viewmodels/useAppViewModel';
import TurnstileWidget from '../components/common/TurnstileWidget.vue';
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
  AlertCircle,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Bell,
  X,
  Copy
} from 'lucide-vue-next';

const router = useRouter();
const { userId, userRole, activeBranchId } = useAppViewModel();

const profileTurnstileRef = ref<any>(null);
const changePassTurnstileToken = ref('');

const twoFactorEnabled = ref(false);
const twoFactorRemindAt = ref<string | null>(null);

// 2FA Setup Modal State
const showSetupModal = ref(false);
const setupLoading = ref(false);
const setupSecret = ref('');
const setupOtpAuthUri = ref('');
const qrCodeDataUrl = ref('');
const setupVerificationCode = ref('');
const setupError = ref('');
const isActivating2FA = ref(false);
const copiedSecret = ref(false);

// 2FA Reminder Modal State
const showReminderModal = ref(false);
const reminderDays = ref(7);
const isSchedulingReminder = ref(false);

// 2FA Disable Modal State
const showDisableModal = ref(false);
const disablePassword = ref('');
const disableError = ref('');
const isDisabling2FA = ref(false);

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

const formatReminderDate = (dateStr: string) => {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return dateStr;
  }
};

const goBack = () => {
  if (userRole.value === 'CASHIER') {
    router.push('/checkout');
  } else {
    router.push('/settings');
  }
};

const fetchUserProfile = async () => {
  const id = userId.value || localStorage.getItem('userId') || localStorage.getItem('cashierId');
  if (!id) return;

  try {
    const userObj = await api.get(`/api/users/${id}`, { suppressToast: true });
    if (userObj) {
      formInfo.value.fullName = userObj.fullName || localStorage.getItem('cashierName') || '';
      formInfo.value.phone = userObj.phone || '';
      formInfo.value.email = userObj.email || '';
      twoFactorEnabled.value = !!userObj.twoFactorEnabled;
      twoFactorRemindAt.value = userObj.twoFactorRemindAt || null;
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

const openSetupModal = async () => {
  showSetupModal.value = true;
  setupLoading.value = true;
  setupError.value = '';
  setupVerificationCode.value = '';
  copiedSecret.value = false;

  try {
    const res = await api.get('/api/auth/2fa/setup', { suppressToast: true });
    setupSecret.value = res.secret;
    setupOtpAuthUri.value = res.otpAuthUri;
    
    qrCodeDataUrl.value = await QRCode.toDataURL(res.otpAuthUri, {
      width: 240,
      margin: 2,
      color: {
        dark: '#122131',
        light: '#FFFFFF'
      }
    });
  } catch (err: any) {
    setupError.value = err.message || 'Failed to initialize 2FA setup.';
  } finally {
    setupLoading.value = false;
  }
};

const copySecretKey = async () => {
  try {
    await navigator.clipboard.writeText(setupSecret.value);
    copiedSecret.value = true;
    setTimeout(() => { copiedSecret.value = false; }, 3000);
  } catch {
    // fallback
  }
};

const enableTwoFactor = async () => {
  if (!setupVerificationCode.value || setupVerificationCode.value.length < 6) {
    setupError.value = 'Please enter a 6-digit verification code.';
    return;
  }

  isActivating2FA.value = true;
  setupError.value = '';

  try {
    const res = await api.post('/api/auth/2fa/enable', {
      totpCode: setupVerificationCode.value.trim()
    }, { suppressToast: true });

    showToast(res.message || 'Two-Factor Authentication enabled successfully!', 'success');
    twoFactorEnabled.value = true;
    twoFactorRemindAt.value = null;
    showSetupModal.value = false;
  } catch (err: any) {
    setupError.value = err.message || 'Invalid verification code. Please try again.';
  } finally {
    isActivating2FA.value = false;
  }
};

const openReminderModal = () => {
  showReminderModal.value = true;
  reminderDays.value = 7;
};

const scheduleReminder = async () => {
  isSchedulingReminder.value = true;
  try {
    const res = await api.post('/api/auth/2fa/remind', {
      days: reminderDays.value
    }, { suppressToast: true });

    showToast(res.message || '2FA reminder scheduled successfully!', 'success');
    if (res.remindAt) {
      twoFactorRemindAt.value = res.remindAt;
    }
    showReminderModal.value = false;
  } catch (err: any) {
    showToast(err.message || 'Failed to schedule 2FA reminder.', 'error');
  } finally {
    isSchedulingReminder.value = false;
  }
};

const openDisableModal = () => {
  showDisableModal.value = true;
  disablePassword.value = '';
  disableError.value = '';
};

const disableTwoFactor = async () => {
  if (!disablePassword.value) {
    disableError.value = 'Please enter your password.';
    return;
  }

  isDisabling2FA.value = true;
  disableError.value = '';

  try {
    const res = await api.post('/api/auth/2fa/disable', {
      password: disablePassword.value
    }, { suppressToast: true });

    showToast(res.message || 'Two-Factor Authentication has been disabled.', 'info');
    twoFactorEnabled.value = false;
    showDisableModal.value = false;
  } catch (err: any) {
    disableError.value = err.message || 'Incorrect account password.';
  } finally {
    isDisabling2FA.value = false;
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

  const id = userId.value || localStorage.getItem('userId') || localStorage.getItem('cashierId');
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

  const id = userId.value || localStorage.getItem('userId') || localStorage.getItem('cashierId');

  if (!id) {
    showToast('User session ID not found.', 'error');
    return;
  }

  isUpdatingPassword.value = true;
  try {
    const payload = {
      oldPassword: passwordForm.value.oldPassword,
      newPassword: passwordForm.value.newPassword,
      turnstileToken: changePassTurnstileToken.value
    };

    await api.post('/api/auth/change-password', payload, { suppressToast: true });
    showToast('Account password updated successfully!', 'success');
    passwordForm.value.oldPassword = '';
    passwordForm.value.newPassword = '';
    passwordForm.value.confirmPassword = '';
    profileTurnstileRef.value?.reset();
    changePassTurnstileToken.value = '';
  } catch (err: any) {
    profileTurnstileRef.value?.reset();
    changePassTurnstileToken.value = '';

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
