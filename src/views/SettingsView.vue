<template>
  <div class="max-w-7xl mx-auto space-y-6 pb-20 animate-fade-up font-sans select-none">
    
    <!-- Header section -->
    <div class="mb-2">
      <h2 class="text-3xl font-black text-on-background tracking-tight">{{ $t('settings.title') }}</h2>
      <p class="text-sm font-semibold text-on-surface-variant mt-1">{{ $t('settings.subtitle') }}</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
      
      <!-- Left column sidebar (Category Switcher) -->
      <div class="bg-surface-container-lowest border border-outline-variant shadow-sm rounded-xl p-4 flex flex-col gap-1.5 select-none shrink-0 md:col-span-1">
        <span class="block text-[11px] font-mono font-bold text-on-surface-variant uppercase tracking-wider mb-2 px-2">{{ $t('settings.storeConfig') }}</span>
        
        <button 
          type="button"
          @click="activeSection = 'profile'"
          class="text-left text-xs px-4 py-3 h-11 rounded-lg flex items-center gap-2.5 transition-all cursor-pointer font-semibold border-0"
          :class="activeSection === 'profile' 
            ? 'bg-primary-container text-on-primary-container font-extrabold translate-x-1' 
            : 'text-on-surface-variant hover:bg-surface-container bg-transparent'"
        >
          <Store class="w-4.5 h-4.5" />
          <span>{{ $t('settings.storeProfile') }}</span>
        </button>

        <button 
          type="button"
          @click="activeSection = 'defaults'"
          class="text-left text-xs px-4 py-3 h-11 rounded-lg flex items-center gap-2.5 transition-all cursor-pointer font-semibold border-0"
          :class="activeSection === 'defaults' 
            ? 'bg-primary-container text-on-primary-container font-extrabold translate-x-1' 
            : 'text-on-surface-variant hover:bg-surface-container bg-transparent'"
        >
          <Sliders class="w-4.5 h-4.5" />
          <span>{{ $t('settings.regionalDefaults') }}</span>
        </button>

        <button 
          type="button"
          @click="activeSection = 'finance'"
          class="text-left text-xs px-4 py-3 h-11 rounded-lg flex items-center gap-2.5 transition-all cursor-pointer font-semibold border-0"
          :class="activeSection === 'finance' 
            ? 'bg-primary-container text-on-primary-container font-extrabold translate-x-1' 
            : 'text-on-surface-variant hover:bg-surface-container bg-transparent'"
        >
          <Landmark class="w-4.5 h-4.5" />
          <span>{{ $t('settings.financeAccounts') }}</span>
        </button>

        <button 
          type="button"
          @click="activeSection = 'hardware'"
          class="text-left text-xs px-4 py-3 h-11 rounded-lg flex items-center gap-2.5 transition-all cursor-pointer font-semibold border-0"
          :class="activeSection === 'hardware' 
            ? 'bg-primary-container text-on-primary-container font-extrabold translate-x-1' 
            : 'text-on-surface-variant hover:bg-surface-container bg-transparent'"
        >
          <QrCode class="w-4.5 h-4.5" />
          <span>{{ $t('settings.hardwareBarcode') }}</span>
        </button>

        <div class="border-t border-outline-variant/50 my-1"></div>

        <button 
          type="button"
          @click="activeSection = 'account'"
          class="text-left text-xs px-4 py-3 h-11 rounded-lg flex items-center gap-2.5 transition-all cursor-pointer font-semibold border-0"
          :class="activeSection === 'account' 
            ? 'bg-primary-container text-on-primary-container font-extrabold translate-x-1' 
            : 'text-on-surface-variant hover:bg-surface-container bg-transparent'"
        >
          <User class="w-4.5 h-4.5" />
          <span>{{ $t('settings.accountProfile') }}</span>
        </button>
      </div>

      <!-- Right column Form Panel (3 columns) -->
      <div class="md:col-span-3 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div class="flex flex-col gap-6 p-6">
          
          <!-- Header titles of section -->
          <div class="pb-4 border-b border-outline-variant/60">
            <h3 class="text-lg font-bold text-on-surface uppercase tracking-tight">
              <span v-if="activeSection === 'profile'">{{ $t('settings.storeProfile') }}</span>
              <span v-else-if="activeSection === 'defaults'">{{ $t('settings.regionalDefaults') }}</span>
              <span v-else-if="activeSection === 'finance'">{{ $t('settings.financeAccounts') }}</span>
              <span v-else-if="activeSection === 'hardware'">{{ $t('settings.hardwareBarcode') }}</span>
              <span v-else-if="activeSection === 'account'">{{ $t('settings.accountProfile') }}</span>
            </h3>
            <p class="text-xs text-on-surface-variant font-semibold mt-1">
              <span v-if="activeSection === 'profile'">{{ $t('settings.storeProfileDesc') }}</span>
              <span v-else-if="activeSection === 'defaults'">{{ $t('settings.regionalDefaultsDesc') }}</span>
              <span v-else-if="activeSection === 'finance'">{{ $t('settings.financeGlDesc') }}</span>
              <span v-else-if="activeSection === 'hardware'">{{ $t('settings.hardwareDesc') }}</span>
              <span v-else-if="activeSection === 'account'">{{ $t('settings.accountProfileDesc') }}</span>
            </p>
          </div>

          <!-- SECTION 1: PROFILE SETUP -->
          <div v-if="activeSection === 'profile'" class="space-y-4">
            <!-- Store Name & registration TIN -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-mono font-bold uppercase tracking-wider text-on-surface-variant">{{ $t('settings.storeName') }}</label>
                <div class="relative flex items-center">
                  <Store class="w-4 h-4 text-on-surface-variant absolute left-3.5 pointer-events-none" />
                  <input 
                    type="text" 
                    required
                    v-model="storeName"
                    placeholder="Ex. Main Branch Nairobi"
                    class="w-full bg-surface-container border border-outline-variant text-sm font-semibold rounded-lg pl-10 pr-3.5 py-2.5 outline-none focus:border-primary text-on-surface"
                  />
                </div>
              </div>

              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-mono font-bold uppercase tracking-wider text-on-surface-variant">{{ $t('settings.tinCode') }}</label>
                <div class="relative flex items-center">
                  <FileText class="w-4 h-4 text-on-surface-variant absolute left-3.5 pointer-events-none" />
                  <input 
                    type="text" 
                    required
                    v-model="storeTin"
                    placeholder="Ex. P0001234567X"
                    class="w-full bg-surface-container border border-outline-variant text-sm font-mono rounded-lg pl-10 pr-3.5 py-2.5 outline-none focus:border-primary text-on-surface"
                  />
                </div>
              </div>
            </div>

            <!-- Contact email & phone -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-mono font-bold uppercase tracking-wider text-on-surface-variant">{{ $t('settings.supportPhone') }}</label>
                <div class="relative flex items-center">
                  <Phone class="w-4 h-4 text-on-surface-variant absolute left-3.5 pointer-events-none" />
                  <input 
                    type="tel" 
                    required
                    v-model="storePhone"
                    placeholder="+254 700 000 000"
                    class="w-full bg-surface-container pl-10 pr-3.5 py-2.5 border border-outline-variant text-sm font-semibold rounded-lg outline-none focus:border-primary text-on-surface"
                  />
                </div>
              </div>

              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-mono font-bold uppercase tracking-wider text-on-surface-variant">{{ $t('settings.storeEmail') }}</label>
                <div class="relative flex items-center">
                  <Mail class="w-4 h-4 text-on-surface-variant absolute left-3.5 pointer-events-none" />
                  <input 
                    type="email" 
                    required
                    v-model="storeEmail"
                    placeholder="billing@dukapor.co"
                    class="w-full bg-surface-container pl-10 pr-3.5 py-2.5 border border-outline-variant text-sm font-semibold rounded-lg outline-none focus:border-primary text-on-surface"
                  />
                </div>
              </div>
            </div>

            <!-- Store physical address -->
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-mono font-bold uppercase tracking-wider text-on-surface-variant">{{ $t('settings.storeAddress') }}</label>
              <div class="relative">
                <MapPin class="w-4 h-4 text-on-surface-variant absolute left-3.5 top-3 pointer-events-none" />
                <textarea 
                  required
                  rows="3"
                  v-model="storeAddress"
                  placeholder="123 Market Street, Nairobi, Kenya"
                  class="w-full bg-surface-container pl-10 pr-3.5 py-2.5 border border-outline-variant text-sm font-semibold rounded-lg outline-none focus:border-primary text-on-surface resize-none"
                />
              </div>
            </div>
          </div>

          <!-- SECTION 2: GLOBAL DEFAULT VARIABLES -->
          <div v-else-if="activeSection === 'defaults'" class="space-y-6">
            <!-- Language Selector Card -->
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-mono font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1">
                <Globe class="w-3.5 h-3.5 text-primary" />
                <span>{{ $t('settings.languageLabel') }}</span>
              </label>
              <div class="p-4 bg-surface-container border border-outline-variant rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h5 class="text-xs font-bold text-on-surface">{{ $t('settings.selectLanguage') }}</h5>
                  <p class="text-[11px] text-on-surface-variant font-medium mt-0.5">{{ $t('settings.languageDesc') }}</p>
                </div>
                <LanguageSelector variant="buttons" />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Select Base Currency -->
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-mono font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1">
                  <Coins class="w-3.5 h-3.5 text-primary" />
                  <span>{{ $t('settings.baseCurrency') }}</span>
                </label>
                <select 
                  v-model="storeCurrency"
                  class="w-full bg-surface-container border border-outline-variant text-sm font-semibold rounded-lg px-3.5 py-3 cursor-pointer outline-none focus:ring-1 focus:ring-primary text-on-surface"
                >
                  <option value="TZS">{{ $t('settings.tzsOption') }}</option>
                  <option value="USD">{{ $t('settings.usdOption') }}</option>
                  <option value="EUR">{{ $t('settings.eurOption') }}</option>
                </select>
              </div>

              <!-- Store timezone dropdown -->
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-mono font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1">
                  <Globe class="w-3.5 h-3.5 text-primary" />
                  <span>{{ $t('settings.timezone') }}</span>
                </label>
                <select 
                  v-model="storeTimezone"
                  class="w-full bg-surface-container border border-outline-variant text-sm font-semibold rounded-lg px-3.5 py-3 cursor-pointer outline-none focus:ring-1 focus:ring-primary text-on-surface"
                >
                  <option value="Africa/Nairobi">Africa / Nairobi (UTC+3 - East African Time)</option>
                  <option value="UTC">UTC / Coordinated Universal Time</option>
                  <option value="Europe/London">Europe / London</option>
                </select>
              </div>
            </div>
          </div>

          <!-- SECTION 3: FINANCE & ACCOUNTS CONFIGURATION -->
          <div v-else-if="activeSection === 'finance'" class="space-y-6">
            
            <!-- COGS Perpetual Accounting Toggle Card -->
            <div class="p-6 bg-surface-container-low border border-outline-variant rounded-2xl space-y-5">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-outline-variant/60">
                <div class="flex items-start sm:items-center gap-3.5">
                  <div class="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                    <Calculator class="w-5 h-5" />
                  </div>
                  <div>
                    <div class="flex items-center gap-2.5 flex-wrap">
                      <h4 class="text-base font-bold text-on-surface">{{ $t('settings.cogsAutomation') }}</h4>
                      <span 
                        class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold"
                        :class="enablePerpetualCogs 
                          ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/20' 
                          : 'bg-surface-container-high text-on-surface-variant border border-outline-variant'"
                      >
                        <span class="w-1.5 h-1.5 rounded-full" :class="enablePerpetualCogs ? 'bg-emerald-500 animate-pulse' : 'bg-on-surface-variant/60'"></span>
                        {{ enablePerpetualCogs ? $t('settings.perpetualInventory') : $t('settings.periodicInventory') }}
                      </span>
                    </div>
                    <p class="text-xs text-on-surface-variant font-medium mt-0.5">
                      Choose whether checkout sales automatically book inventory cost deductions and real-time gross margin into the General Ledger.
                    </p>
                  </div>
                </div>

                <!-- Interactive Switch Toggle -->
                <div class="flex items-center gap-3 shrink-0 self-end sm:self-center">
                  <button 
                    type="button" 
                    @click="enablePerpetualCogs = !enablePerpetualCogs"
                    class="relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
                    :class="enablePerpetualCogs ? 'bg-primary' : 'bg-surface-container-highest'"
                    role="switch" 
                    :aria-checked="enablePerpetualCogs"
                  >
                    <span 
                      class="pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out"
                      :class="enablePerpetualCogs ? 'translate-x-6' : 'translate-x-0'"
                    />
                  </button>
                </div>
              </div>

              <!-- Accounting Method Comparison & Implications -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <!-- Option 1: When ON (Perpetual Inventory) -->
                <div 
                  class="p-4 rounded-xl border transition-all space-y-3"
                  :class="enablePerpetualCogs 
                    ? 'bg-primary/5 border-primary/30 ring-1 ring-primary/20' 
                    : 'bg-surface-container-lowest border-outline-variant/60 opacity-70'"
                >
                  <div class="flex items-center justify-between">
                    <span class="font-bold text-xs flex items-center gap-1.5" :class="enablePerpetualCogs ? 'text-primary' : 'text-on-surface'">
                      <CheckCircle2 v-if="enablePerpetualCogs" class="w-4 h-4 text-primary" />
                      <span>{{ $t('settings.cogsOptionOn') }}</span>
                    </span>
                    <span class="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-primary/10 text-primary">
                      {{ $t('settings.perpetualMethod') }}
                    </span>
                  </div>

                  <p class="text-xs text-on-surface-variant font-medium leading-relaxed">
                    {{ $t('settings.cogsOnDesc') }}
                  </p>

                  <div class="space-y-1.5 font-mono text-[11px] bg-surface-container-lowest/80 p-3 rounded-lg border border-outline-variant/40">
                    <div class="text-emerald-700 flex justify-between">
                      <span>{{ $t('settings.drCashBank') }}</span>
                      <span>{{ $t('settings.sellingPriceLabel') }}</span>
                    </div>
                    <div class="text-emerald-700 flex justify-between pl-4">
                      <span>{{ $t('settings.crSalesRevenue') }}</span>
                      <span>{{ $t('settings.sellingPriceLabel') }}</span>
                    </div>
                    <div class="border-t border-outline-variant/30 my-1"></div>
                    <div class="text-indigo-700 flex justify-between">
                      <span>{{ $t('settings.drCogs') }}</span>
                      <span>{{ $t('settings.costPriceQtyLabel') }}</span>
                    </div>
                    <div class="text-indigo-700 flex justify-between pl-4">
                      <span>{{ $t('settings.crStockOnHand') }}</span>
                      <span>{{ $t('settings.costPriceQtyLabel') }}</span>
                    </div>
                  </div>

                  <ul class="text-[11px] text-on-surface-variant space-y-1 list-disc list-inside font-medium">
                    <li>{{ $t('settings.cogsRealtimeProfit') }}</li>
                    <li>{{ $t('settings.cogsContinuousAsset') }}</li>
                    <li>{{ $t('settings.cogsRequirement') }}</li>
                  </ul>
                </div>

                <!-- Option 2: When OFF (Periodic Inventory) -->
                <div 
                  class="p-4 rounded-xl border transition-all space-y-3"
                  :class="!enablePerpetualCogs 
                    ? 'bg-amber-500/5 border-amber-500/30 ring-1 ring-amber-500/20' 
                    : 'bg-surface-container-lowest border-outline-variant/60 opacity-70'"
                >
                  <div class="flex items-center justify-between">
                    <span class="font-bold text-xs flex items-center gap-1.5" :class="!enablePerpetualCogs ? 'text-amber-800' : 'text-on-surface'">
                      <CheckCircle2 v-if="!enablePerpetualCogs" class="w-4 h-4 text-amber-600" />
                      <span>{{ $t('settings.cogsOptionOff') }}</span>
                    </span>
                    <span class="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-amber-500/10 text-amber-700">
                      {{ $t('settings.periodicMethod') }}
                    </span>
                  </div>

                  <p class="text-xs text-on-surface-variant font-medium leading-relaxed">
                    {{ $t('settings.cogsOffDesc') }}
                  </p>

                  <div class="space-y-1.5 font-mono text-[11px] bg-surface-container-lowest/80 p-3 rounded-lg border border-outline-variant/40">
                    <div class="text-emerald-700 flex justify-between">
                      <span>{{ $t('settings.drCashBank') }}</span>
                      <span>{{ $t('settings.sellingPriceLabel') }}</span>
                    </div>
                    <div class="text-emerald-700 flex justify-between pl-4">
                      <span>{{ $t('settings.crSalesRevenue') }}</span>
                      <span>{{ $t('settings.sellingPriceLabel') }}</span>
                    </div>
                    <div class="border-t border-outline-variant/30 my-1"></div>
                    <div class="text-on-surface-variant italic flex justify-between">
                      <span>{{ $t('settings.noCogsEntry') }}</span>
                      <span>(-)</span>
                    </div>
                  </div>

                  <ul class="text-[11px] text-on-surface-variant space-y-1 list-disc list-inside font-medium">
                    <li>{{ $t('settings.cogsSimplerCheckout') }}</li>
                    <li>{{ $t('settings.cogsPeriodicAdjustment') }}</li>
                    <li>{{ $t('settings.cogsRecommendedFor') }}</li>
                  </ul>
                </div>

              </div>

              <!-- Important Note Banner -->
              <div class="p-3.5 bg-surface-container rounded-xl border border-outline-variant/70 flex items-start gap-3">
                <Info class="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div class="text-xs text-on-surface-variant leading-relaxed">
                  <span class="font-bold text-on-surface">{{ $t('settings.storePolicyNote') }}</span>
                  {{ $t('settings.storePolicyDesc') }}
                </div>
              </div>
            </div>

          </div>

          <!-- SECTION 4: HARDWARE & BARCODE SCANNER -->
          <div v-else-if="activeSection === 'hardware'" class="space-y-6">
            <!-- Hardware scanner overview card -->
            <div class="p-5 bg-surface-container border border-outline-variant rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                  <QrCode class="w-6 h-6" />
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <h4 class="text-base font-bold text-on-surface">2D Barcode Scanner (USB HID Engine)</h4>
                    <span 
                      v-if="lastScannedBarcode"
                      class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                    >
                      <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      {{ $t('settings.scannerActiveVerified') }}
                    </span>
                    <span 
                      v-else
                      class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20"
                    >
                      <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                      {{ $t('settings.scannerListening') }}
                    </span>
                  </div>
                  <p class="text-xs text-on-surface-variant font-medium mt-1">
                    {{ $t('settings.scannerMode') }} • 
                    {{ $t('settings.tableStatus') }}: <span class="font-mono font-bold" :class="lastScannedBarcode ? 'text-emerald-600' : 'text-amber-600'">{{ lastScannedBarcode ? $t('settings.scannerLastScanned', { code: lastScannedBarcode }) : $t('settings.scannerScanToVerify') }}</span>
                  </p>
                </div>
              </div>
              <div class="flex gap-2 shrink-0">
                <button 
                  type="button" 
                  @click="playPOSSound('success')"
                  class="px-3.5 py-2 bg-surface-container-high hover:bg-surface-container-highest text-xs font-bold rounded-lg border border-outline-variant transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Volume2 class="w-3.5 h-3.5 text-primary" />
                  <span>{{ $t('settings.testBeep') }}</span>
                </button>
                <button 
                  type="button" 
                  @click="playPOSSound('error')"
                  class="px-3.5 py-2 bg-surface-container-high hover:bg-surface-container-highest text-xs font-bold rounded-lg border border-outline-variant transition-colors flex items-center gap-1.5 cursor-pointer text-error"
                >
                  <VolumeX class="w-3.5 h-3.5 text-error" />
                  <span>{{ $t('settings.testError') }}</span>
                </button>
              </div>
            </div>

            <!-- Live Barcode Scanner Test Bench -->
            <div class="p-5 bg-surface-container-low border border-outline-variant rounded-xl flex flex-col gap-4">
              <div class="flex justify-between items-center pb-3 border-b border-outline-variant/60">
                <div>
                  <h4 class="text-sm font-bold text-on-surface uppercase tracking-tight flex items-center gap-2">
                    <Activity class="w-4 h-4 text-primary" />
                    <span>{{ $t('settings.scannerBenchTitle') }}</span>
                  </h4>
                  <p class="text-xs text-on-surface-variant font-medium mt-0.5">{{ $t('settings.scannerBenchDesc') }}</p>
                </div>
                <span class="text-xs font-mono font-bold text-primary px-3 py-1 bg-primary/10 rounded-md border border-primary/20">
                  {{ $t('settings.readyToScan') }}
                </span>
              </div>

              <!-- Scanner result indicator box -->
              <div class="p-4 bg-surface rounded-xl border border-outline-variant/80 flex flex-col md:flex-row justify-between items-center gap-4 min-h-[72px]">
                <div>
                  <span class="text-[11px] font-mono font-bold text-on-surface-variant uppercase tracking-wider block mb-0.5">{{ $t('settings.lastScannedValue') }}</span>
                  <p class="text-lg font-mono font-black text-primary tracking-wide">
                    {{ lastScannedBarcode || $t('settings.scanPlaceholderBarcode') }}
                  </p>
                </div>

                <div v-if="scanStats.lastScanDuration > 0" class="flex gap-4 shrink-0 text-right">
                  <div>
                    <span class="text-[10px] font-mono text-on-surface-variant block uppercase">{{ $t('settings.latency') }}</span>
                    <span class="text-xs font-mono font-bold text-emerald-600">{{ scanStats.lastScanDuration }} ms</span>
                  </div>
                  <div>
                    <span class="text-[10px] font-mono text-on-surface-variant block uppercase">{{ $t('settings.length') }}</span>
                    <span class="text-xs font-mono font-bold text-on-surface">{{ $t('settings.charsCount', { count: scanStats.characterCount }) }}</span>
                  </div>
                  <div>
                    <span class="text-[10px] font-mono text-on-surface-variant block uppercase">{{ $t('settings.deviceType') }}</span>
                    <span class="text-xs font-mono font-bold text-primary">{{ $t('settings.hardwareHid') }}</span>
                  </div>
                </div>
              </div>

              <!-- Recent Scan History Log Table -->
              <div v-if="scanHistory.length > 0" class="mt-2">
                <span class="text-[11px] font-mono font-bold text-on-surface-variant uppercase tracking-wider block mb-2">{{ $t('settings.scanSessionLog') }}</span>
                <div class="max-h-40 overflow-y-auto border border-outline-variant/60 rounded-lg divide-y divide-outline-variant/40 bg-surface">
                  <div 
                    v-for="(item, idx) in scanHistory" 
                    :key="idx"
                    class="p-2.5 px-4 flex justify-between items-center text-xs hover:bg-surface-container/30 transition-colors"
                  >
                    <span class="font-mono font-bold text-on-surface">{{ item.barcode }}</span>
                    <div class="flex items-center gap-4 text-on-surface-variant font-medium text-[11px]">
                      <span>{{ $t('settings.msBurst', { speed: item.speedMs }) }}</span>
                      <span>{{ new Date(item.timestamp).toLocaleTimeString() }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Hardware behavior options -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="p-4 bg-surface-container-low border border-outline-variant rounded-xl flex items-center justify-between">
                <div>
                  <h5 class="text-xs font-bold text-on-surface">{{ $t('settings.autoAddOnScan') }}</h5>
                  <p class="text-[11px] text-on-surface-variant font-medium mt-0.5">{{ $t('settings.autoAddOnScanDesc') }}</p>
                </div>
                <input type="checkbox" checked class="w-4 h-4 accent-primary cursor-pointer" />
              </div>

              <div class="p-4 bg-surface-container-low border border-outline-variant rounded-xl flex items-center justify-between">
                <div>
                  <h5 class="text-xs font-bold text-on-surface">{{ $t('settings.audioFeedback') }}</h5>
                  <p class="text-[11px] text-on-surface-variant font-medium mt-0.5">{{ $t('settings.audioFeedbackDesc') }}</p>
                </div>
                <input type="checkbox" checked class="w-4 h-4 accent-primary cursor-pointer" />
              </div>
            </div>
          </div>

          <!-- SECTION 5: ACCOUNT & PROFILE -->
          <div v-else-if="activeSection === 'account'" class="space-y-6">
            <!-- Subview Switcher Pills -->
            <div class="flex flex-wrap items-center gap-2 pb-4 border-b border-outline-variant/60">
              <button
                type="button"
                @click="accountSubView = 'overview'"
                class="px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 border-0"
                :class="accountSubView === 'overview' 
                  ? 'bg-primary text-on-primary shadow-xs' 
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container hover:text-on-surface'"
              >
                <User class="w-4 h-4" />
                <span>{{ $t('profile.accountOverview') }}</span>
              </button>

              <button
                type="button"
                @click="accountSubView = 'identity'"
                class="px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 border-0"
                :class="accountSubView === 'identity' 
                  ? 'bg-primary text-on-primary shadow-xs' 
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container hover:text-on-surface'"
              >
                <UserCog class="w-4 h-4" />
                <span>{{ $t('settings.editIdentity') }}</span>
              </button>

              <button
                type="button"
                @click="accountSubView = 'password'"
                class="px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 border-0"
                :class="accountSubView === 'password' 
                  ? 'bg-primary text-on-primary shadow-xs' 
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container hover:text-on-surface'"
              >
                <Lock class="w-4 h-4" />
                <span>{{ $t('settings.changePassword') }}</span>
              </button>

              <button
                type="button"
                @click="goToTwoFactorSubView"
                class="px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 border-0"
                :class="accountSubView === 'two-factor' 
                  ? 'bg-primary text-on-primary shadow-xs' 
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container hover:text-on-surface'"
              >
                <ShieldCheck class="w-4 h-4" />
                <span>Two-Factor Auth (2FA)</span>
              </button>
            </div>

            <!-- SUBVIEW 1: OVERVIEW -->
            <div v-if="accountSubView === 'overview'" class="space-y-6 animate-fade-in">
              <!-- Account Hero / Summary Card -->
              <div class="p-6 bg-gradient-to-br from-surface-container-low to-surface-container-lowest border border-outline-variant rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-sm">
                <div class="flex items-center gap-4">
                  <div class="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary to-primary-container text-on-primary font-black text-xl flex items-center justify-center shadow-md uppercase tracking-wider shrink-0 border-2 border-white/20">
                    {{ userInitials }}
                  </div>
                  <div class="space-y-1">
                    <div class="flex items-center gap-2 flex-wrap">
                      <h4 class="text-lg font-black text-on-surface">{{ formInfo.fullName || userName }}</h4>
                      <span class="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-primary-container/30 text-primary border border-primary/30 uppercase">
                        {{ userRole || 'ADMIN' }}
                      </span>
                    </div>
                    <p class="text-xs text-on-surface-variant font-medium">
                      User ID: <span class="font-mono text-on-surface font-semibold select-all">{{ userId || 'N/A' }}</span> • {{ $t('topNav.branch') }}: <span class="font-semibold text-on-surface">{{ currentBranchName }}</span>
                    </p>
                  </div>
                </div>
              </div>

              <!-- Quick Info Badges -->
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div class="p-3.5 bg-surface-container-low rounded-xl border border-outline-variant/60 flex items-center gap-3">
                  <div class="w-8 h-8 rounded-lg bg-primary-container/30 text-primary flex items-center justify-center shrink-0">
                    <Phone class="w-4 h-4" />
                  </div>
                  <div class="min-w-0">
                    <span class="text-[10px] font-bold text-on-surface-variant block uppercase">{{ $t('customers.phone') }}</span>
                    <span class="font-mono font-semibold text-on-surface truncate block">{{ formInfo.phone || 'No phone set' }}</span>
                  </div>
                </div>

                <div class="p-3.5 bg-surface-container-low rounded-xl border border-outline-variant/60 flex items-center gap-3">
                  <div class="w-8 h-8 rounded-lg bg-primary-container/30 text-primary flex items-center justify-center shrink-0">
                    <Mail class="w-4 h-4" />
                  </div>
                  <div class="min-w-0">
                    <span class="text-[10px] font-bold text-on-surface-variant block uppercase">{{ $t('customers.email') }}</span>
                    <span class="font-semibold text-on-surface truncate block">{{ formInfo.email || 'No email set' }}</span>
                  </div>
                </div>

                <div class="p-3.5 bg-surface-container-low rounded-xl border border-outline-variant/60 flex items-center gap-3">
                  <div class="w-8 h-8 rounded-lg bg-primary-container/30 text-primary flex items-center justify-center shrink-0">
                    <Building2 class="w-4 h-4" />
                  </div>
                  <div class="min-w-0">
                    <span class="text-[10px] font-bold text-on-surface-variant block uppercase">{{ $t('topNav.branch') }}</span>
                    <span class="font-semibold text-on-surface truncate block">{{ currentBranchName }}</span>
                  </div>
                </div>
              </div>

              <!-- Profile Sections Quick Grid -->
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <!-- Personal Info Card -->
                <div class="p-5 bg-surface-container-low border border-outline-variant rounded-xl flex flex-col justify-between space-y-4 hover:border-primary/50 transition-colors">
                  <div class="space-y-2">
                    <div class="flex items-center gap-2 text-on-surface">
                      <div class="w-8 h-8 rounded-lg bg-primary-container/30 text-primary flex items-center justify-center">
                        <User class="w-4 h-4" />
                      </div>
                      <h5 class="text-sm font-bold">{{ $t('settings.personalInfo') }}</h5>
                    </div>
                    <p class="text-xs text-on-surface-variant font-medium leading-relaxed">
                      Update your display name, contact phone number, and support email address used across invoices and registers.
                    </p>
                  </div>
                  <button
                    type="button"
                    @click="accountSubView = 'identity'"
                    class="px-4 py-2.5 bg-primary text-on-primary text-xs font-bold rounded-lg hover:bg-primary/90 transition-all flex items-center gap-1.5 cursor-pointer self-start shadow-xs"
                  >
                    <span>{{ $t('settings.editIdentity') }}</span>
                    <ArrowRight class="w-3.5 h-3.5" />
                  </button>
                </div>

                <!-- Security & Password Card -->
                <div class="p-5 bg-surface-container-low border border-outline-variant rounded-xl flex flex-col justify-between space-y-4 hover:border-error/50 transition-colors">
                  <div class="space-y-2">
                    <div class="flex items-center gap-2 text-on-surface">
                      <div class="w-8 h-8 rounded-lg bg-error-container/30 text-error flex items-center justify-center">
                        <Lock class="w-4 h-4" />
                      </div>
                      <h5 class="text-sm font-bold">{{ $t('settings.securityPassword') }}</h5>
                    </div>
                    <p class="text-xs text-on-surface-variant font-medium leading-relaxed">
                      Modify your account login credentials, reset old security passcodes, and keep your terminal access protected.
                    </p>
                  </div>
                  <button
                    type="button"
                    @click="accountSubView = 'password'"
                    class="px-4 py-2.5 bg-error text-on-error text-xs font-bold rounded-lg hover:bg-error/90 transition-all flex items-center gap-1.5 cursor-pointer self-start shadow-xs text-white"
                  >
                    <span>{{ $t('settings.changePassword') }}</span>
                    <ArrowRight class="w-3.5 h-3.5" />
                  </button>
                </div>

                <!-- Two-Factor Authentication (2FA) Card -->
                <div class="p-5 bg-surface-container-low border border-outline-variant rounded-xl flex flex-col justify-between space-y-4 hover:border-emerald-500/50 transition-colors">
                  <div class="space-y-2">
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-2 text-on-surface">
                        <div class="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-600 flex items-center justify-center">
                          <ShieldCheck class="w-4 h-4" />
                        </div>
                        <h5 class="text-sm font-bold">2FA Security</h5>
                      </div>
                      <span 
                        v-if="twoFactorEnabled"
                        class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-700 border border-emerald-500/30"
                      >
                        ACTIVE
                      </span>
                      <span 
                        v-else-if="twoFactorRemindAt"
                        class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-700 border border-amber-500/30"
                      >
                        REMINDER SET
                      </span>
                      <span 
                        v-else
                        class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-surface-container text-on-surface-variant border border-outline-variant"
                      >
                        OFF
                      </span>
                    </div>
                    <p class="text-xs text-on-surface-variant font-medium leading-relaxed">
                      Google Authenticator Two-Factor Authentication. Requires a 6-digit TOTP code on login.
                    </p>
                  </div>
                  <button
                    type="button"
                    @click="goToTwoFactorSubView"
                    class="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer self-start shadow-xs"
                  >
                    <span>Configure 2FA</span>
                    <ArrowRight class="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            <!-- SUBVIEW 2: EDIT IDENTITY & CONTACT (ONLY THIS FORM) -->
            <div v-else-if="accountSubView === 'identity'" class="space-y-6 animate-fade-in">
              <div class="flex items-center justify-between pb-3 border-b border-outline-variant/60">
                <div class="flex items-center gap-2.5">
                  <button
                    type="button"
                    @click="accountSubView = 'overview'"
                    class="p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant transition-colors cursor-pointer"
                    title="Back to Overview"
                  >
                    <ArrowLeft class="w-4 h-4" />
                  </button>
                  <div>
                    <h4 class="text-sm font-bold text-on-surface">{{ $t('settings.personalInfo') }}</h4>
                    <p class="text-xs text-on-surface-variant">Update your account name, telephone number, and email address</p>
                  </div>
                </div>
                <button
                  type="button"
                  @click="accountSubView = 'overview'"
                  class="text-xs text-on-surface-variant hover:text-primary font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <span>{{ $t('common.cancel') }}</span>
                </button>
              </div>

              <form @submit.prevent="savePersonalInfo" class="space-y-4 max-w-xl">
                <!-- Full Name -->
                <div class="space-y-1.5">
                  <label class="block text-xs font-mono font-bold uppercase tracking-wider text-on-surface-variant">
                    {{ $t('users.fullName') }} <span class="text-error">*</span>
                  </label>
                  <div class="relative flex items-center">
                    <User class="w-4 h-4 text-on-surface-variant absolute left-3.5 pointer-events-none" />
                    <input 
                      v-model="formInfo.fullName"
                      @input="infoErrors.fullName = undefined"
                      type="text"
                      required
                      placeholder="Enter your full name"
                      class="w-full bg-surface-container border text-sm font-semibold rounded-lg pl-10 pr-3.5 py-2.5 outline-none focus:border-primary text-on-surface"
                      :class="infoErrors.fullName ? 'border-error text-error bg-error-container/10' : 'border-outline-variant'"
                    />
                  </div>
                  <p v-if="infoErrors.fullName" class="text-xs font-semibold text-error mt-1 flex items-center gap-1">
                    <AlertCircle class="w-3.5 h-3.5 shrink-0" />
                    <span>{{ infoErrors.fullName }}</span>
                  </p>
                </div>

                <!-- Phone Number -->
                <div class="space-y-1.5">
                  <label class="block text-xs font-mono font-bold uppercase tracking-wider text-on-surface-variant">
                    {{ $t('users.phone') }} <span class="text-error">*</span>
                  </label>
                  <div class="relative flex items-center">
                    <Phone class="w-4 h-4 text-on-surface-variant absolute left-3.5 pointer-events-none" />
                    <input 
                      v-model="formInfo.phone"
                      @input="infoErrors.phone = undefined"
                      type="text"
                      required
                      placeholder="e.g. 255711111111"
                      class="w-full bg-surface-container border text-sm font-mono rounded-lg pl-10 pr-3.5 py-2.5 outline-none focus:border-primary text-on-surface"
                      :class="infoErrors.phone ? 'border-error text-error bg-error-container/10' : 'border-outline-variant'"
                    />
                  </div>
                  <p v-if="infoErrors.phone" class="text-xs font-semibold text-error mt-1 flex items-center gap-1">
                    <AlertCircle class="w-3.5 h-3.5 shrink-0" />
                    <span>{{ infoErrors.phone }}</span>
                  </p>
                </div>

                <!-- Email Address (Optional) -->
                <div class="space-y-1.5">
                  <label class="block text-xs font-mono font-bold uppercase tracking-wider text-on-surface-variant">
                    {{ $t('users.email') }} <span class="text-on-surface-variant/60 font-normal lowercase">({{ $t('customers.optional') }})</span>
                  </label>
                  <div class="relative flex items-center">
                    <Mail class="w-4 h-4 text-on-surface-variant absolute left-3.5 pointer-events-none" />
                    <input 
                      v-model="formInfo.email"
                      @input="infoErrors.email = undefined"
                      type="email"
                      placeholder="user@dukapro.co.tz"
                      class="w-full bg-surface-container border text-sm font-semibold rounded-lg pl-10 pr-3.5 py-2.5 outline-none focus:border-primary text-on-surface"
                      :class="infoErrors.email ? 'border-error text-error bg-error-container/10' : 'border-outline-variant'"
                    />
                  </div>
                  <p v-if="infoErrors.email" class="text-xs font-semibold text-error mt-1 flex items-center gap-1">
                    <AlertCircle class="w-3.5 h-3.5 shrink-0" />
                    <span>{{ infoErrors.email }}</span>
                  </p>
                </div>

                <!-- Role (Read-only) -->
                <div class="space-y-1.5">
                  <label class="block text-xs font-mono font-bold uppercase tracking-wider text-on-surface-variant">
                    {{ $t('users.role') }}
                  </label>
                  <input 
                    :value="userRole || 'USER'"
                    type="text"
                    disabled
                    class="w-full bg-surface-container-high/60 border border-outline-variant/40 rounded-lg px-3.5 py-2.5 text-sm font-bold text-on-surface-variant cursor-not-allowed uppercase font-mono"
                  />
                </div>

                <div class="pt-4 flex items-center gap-3">
                  <button 
                    type="submit"
                    :disabled="isSavingInfo"
                    class="px-6 py-2.5 bg-primary text-on-primary font-bold text-xs rounded-lg hover:bg-primary/90 transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 border-0"
                  >
                    <Loader2 v-if="isSavingInfo" class="w-4 h-4 animate-spin" />
                    <Save v-else class="w-4 h-4" />
                    <span>{{ isSavingInfo ? $t('common.loading') : $t('settings.savePersonalDetails') }}</span>
                  </button>

                  <button
                    type="button"
                    @click="accountSubView = 'overview'"
                    class="px-4 py-2.5 bg-surface-container hover:bg-surface-container-high text-on-surface-variant font-bold text-xs rounded-lg transition-all cursor-pointer border border-outline-variant/60"
                  >
                    {{ $t('common.cancel') }}
                  </button>
                </div>
              </form>
            </div>

            <!-- SUBVIEW 3: CHANGE PASSWORD (ONLY THIS FORM) -->
            <div v-else-if="accountSubView === 'password'" class="space-y-6 animate-fade-in">
              <div class="flex items-center justify-between pb-3 border-b border-outline-variant/60">
                <div class="flex items-center gap-2.5">
                  <button
                    type="button"
                    @click="accountSubView = 'overview'"
                    class="p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant transition-colors cursor-pointer"
                    title="Back to Overview"
                  >
                    <ArrowLeft class="w-4 h-4" />
                  </button>
                  <div>
                    <h4 class="text-sm font-bold text-on-surface">{{ $t('settings.changePassword') }}</h4>
                    <p class="text-xs text-on-surface-variant">Update your security credentials independently</p>
                  </div>
                </div>
                <button
                  type="button"
                  @click="accountSubView = 'overview'"
                  class="text-xs text-on-surface-variant hover:text-primary font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <span>{{ $t('common.cancel') }}</span>
                </button>
              </div>

              <form @submit.prevent="updatePassword" class="space-y-4 max-w-xl">
                <!-- Current / Old Password -->
                <div class="space-y-1.5">
                  <label class="block text-xs font-mono font-bold uppercase tracking-wider text-on-surface-variant">
                    {{ $t('settings.currentPassword') }} <span class="text-error">*</span>
                  </label>
                  <div class="relative flex items-center">
                    <Lock class="w-4 h-4 text-on-surface-variant absolute left-3.5 pointer-events-none" />
                    <input 
                      v-model="passwordForm.oldPassword"
                      @input="passwordErrors.oldPassword = undefined"
                      :type="showOldPass ? 'text' : 'password'"
                      placeholder="Enter your current password"
                      class="w-full bg-surface-container border text-sm font-mono rounded-lg pl-10 pr-11 py-2.5 outline-none focus:border-primary text-on-surface"
                      :class="passwordErrors.oldPassword ? 'border-error text-error bg-error-container/10' : 'border-outline-variant'"
                    />
                    <button 
                      type="button"
                      @click="showOldPass = !showOldPass"
                      class="absolute right-3 p-1.5 text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
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
                  <label class="block text-xs font-mono font-bold uppercase tracking-wider text-on-surface-variant">
                    {{ $t('settings.newPassword') }} <span class="text-error">*</span>
                  </label>
                  <div class="relative flex items-center">
                    <KeyRound class="w-4 h-4 text-on-surface-variant absolute left-3.5 pointer-events-none" />
                    <input 
                      v-model="passwordForm.newPassword"
                      @input="passwordErrors.newPassword = undefined"
                      :type="showNewPass ? 'text' : 'password'"
                      placeholder="Minimum 6 characters"
                      class="w-full bg-surface-container border text-sm font-mono rounded-lg pl-10 pr-11 py-2.5 outline-none focus:border-primary text-on-surface"
                      :class="passwordErrors.newPassword ? 'border-error text-error bg-error-container/10' : 'border-outline-variant'"
                    />
                    <button 
                      type="button"
                      @click="showNewPass = !showNewPass"
                      class="absolute right-3 p-1.5 text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
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
                  <label class="block text-xs font-mono font-bold uppercase tracking-wider text-on-surface-variant">
                    {{ $t('settings.confirmPassword') }} <span class="text-error">*</span>
                  </label>
                  <div class="relative flex items-center">
                    <KeyRound class="w-4 h-4 text-on-surface-variant absolute left-3.5 pointer-events-none" />
                    <input 
                      v-model="passwordForm.confirmPassword"
                      @input="passwordErrors.confirmPassword = undefined"
                      :type="showConfirmPass ? 'text' : 'password'"
                      placeholder="Re-type new password"
                      class="w-full bg-surface-container border text-sm font-mono rounded-lg pl-10 pr-11 py-2.5 outline-none focus:border-primary text-on-surface"
                      :class="passwordErrors.confirmPassword ? 'border-error text-error bg-error-container/10' : 'border-outline-variant'"
                    />
                    <button 
                      type="button"
                      @click="showConfirmPass = !showConfirmPass"
                      class="absolute right-3 p-1.5 text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
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
                <div class="bg-surface-container-low rounded-xl p-3.5 border border-outline-variant/60 space-y-2 text-xs">
                  <div class="font-mono font-bold text-on-surface-variant uppercase text-[10px] tracking-wider">
                    {{ $t('settings.passwordRequirementsTitle') }}
                  </div>
                  <div class="flex items-center gap-2" :class="passwordForm.newPassword.length >= 6 ? 'text-emerald-700 font-bold' : 'text-on-surface-variant'">
                    <CheckCircle2 v-if="passwordForm.newPassword.length >= 6" class="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                    <AlertCircle v-else class="w-3.5 h-3.5 shrink-0" />
                    <span>{{ $t('settings.passwordMinLength') }}</span>
                  </div>
                  <div class="flex items-center gap-2" :class="passwordsMatch ? 'text-emerald-700 font-bold' : 'text-on-surface-variant'">
                    <CheckCircle2 v-if="passwordsMatch" class="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                    <AlertCircle v-else class="w-3.5 h-3.5 shrink-0" />
                    <span>{{ $t('settings.passwordsMatch') }}</span>
                  </div>
                </div>

                <div class="pt-4 flex items-center gap-3">
                  <button 
                    type="submit"
                    :disabled="isUpdatingPassword || !isPasswordFormValid"
                    class="px-6 py-2.5 bg-error text-on-error font-bold text-xs rounded-lg hover:bg-error/90 transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 border-0 text-white"
                  >
                    <Loader2 v-if="isUpdatingPassword" class="w-4 h-4 animate-spin" />
                    <KeyRound v-else class="w-4 h-4" />
                    <span>{{ isUpdatingPassword ? $t('common.loading') : $t('settings.updatePassword') }}</span>
                  </button>

                  <button
                    type="button"
                    @click="accountSubView = 'overview'"
                    class="px-4 py-2.5 bg-surface-container hover:bg-surface-container-high text-on-surface-variant font-bold text-xs rounded-lg transition-all cursor-pointer border border-outline-variant/60"
                  >
                    {{ $t('common.cancel') }}
                  </button>
                </div>
              </form>
            </div>

            <!-- SUBVIEW 4: TWO-FACTOR AUTHENTICATION (2FA) -->
            <div v-else-if="accountSubView === 'two-factor'" class="space-y-6 animate-fade-in">
              <div class="flex items-center justify-between pb-3 border-b border-outline-variant/60">
                <div class="flex items-center gap-2.5">
                  <button
                    type="button"
                    @click="accountSubView = 'overview'"
                    class="p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant transition-colors cursor-pointer"
                    title="Back to Overview"
                  >
                    <ArrowLeft class="w-4 h-4" />
                  </button>
                  <div>
                    <h4 class="text-sm font-bold text-on-surface">Two-Factor Authentication (2FA)</h4>
                    <p class="text-xs text-on-surface-variant">Protect your account and financial data with Google Authenticator</p>
                  </div>
                </div>
                <button
                  type="button"
                  @click="accountSubView = 'overview'"
                  class="text-xs text-on-surface-variant hover:text-primary font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <span>{{ $t('common.cancel') }}</span>
                </button>
              </div>

              <!-- Status Banner -->
              <div 
                class="p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                :class="twoFactorEnabled ? 'bg-emerald-500/10 border-emerald-500/30' : (twoFactorRemindAt ? 'bg-amber-500/10 border-amber-500/30' : 'bg-surface-container-low border-outline-variant')"
              >
                <div class="flex items-start gap-3.5">
                  <div 
                    class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    :class="twoFactorEnabled ? 'bg-emerald-500/20 text-emerald-600' : (twoFactorRemindAt ? 'bg-amber-500/20 text-amber-600' : 'bg-primary-container/30 text-primary')"
                  >
                    <ShieldCheck v-if="twoFactorEnabled" class="w-5 h-5 stroke-[2.5px]" />
                    <Clock v-else-if="twoFactorRemindAt" class="w-5 h-5 stroke-[2.5px]" />
                    <ShieldAlert v-else class="w-5 h-5 stroke-[2.5px]" />
                  </div>
                  <div class="space-y-1">
                    <div class="flex items-center gap-2">
                      <h5 class="text-sm font-black text-on-surface">
                        {{ twoFactorEnabled ? '2FA Protection is Active' : (twoFactorRemindAt ? '2FA Reminder Scheduled' : '2FA is Not Configured') }}
                      </h5>
                      <span 
                        class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold"
                        :class="twoFactorEnabled ? 'bg-emerald-500/20 text-emerald-700' : (twoFactorRemindAt ? 'bg-amber-500/20 text-amber-700' : 'bg-surface-container-high text-on-surface-variant')"
                      >
                        {{ twoFactorEnabled ? 'PROTECTED' : (twoFactorRemindAt ? 'PENDING' : 'OPTIONAL') }}
                      </span>
                    </div>
                    <p class="text-xs text-on-surface-variant">
                      <span v-if="twoFactorEnabled">Your account requires a 6-digit TOTP code from Google Authenticator on every sign-in.</span>
                      <span v-else-if="twoFactorRemindAt">You scheduled a reminder for <strong>{{ formatReminderDate(twoFactorRemindAt) }}</strong>. High-priority notification and email will trigger.</span>
                      <span v-else>Two-Factor Authentication is optional. You can enable it now or schedule a reminder.</span>
                    </p>
                  </div>
                </div>

                <div v-if="twoFactorEnabled">
                  <button 
                    type="button" 
                    @click="showDisable2FaModal = true"
                    class="px-4 py-2 bg-error-container/20 hover:bg-error-container/40 border border-error/30 text-error text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Lock class="w-3.5 h-3.5" />
                    <span>Disable 2FA</span>
                  </button>
                </div>
              </div>

              <!-- When NOT enabled: Setup and Remind Sections -->
              <div v-if="!twoFactorEnabled" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- SETUP GOOGLE AUTHENTICATOR -->
                <div class="p-6 bg-surface-container-low border border-outline-variant rounded-2xl space-y-4">
                  <div class="flex items-center gap-2.5 pb-2 border-b border-outline-variant/60">
                    <KeyRound class="w-4 h-4 text-primary" />
                    <h5 class="text-sm font-bold text-on-surface">Enable Google Authenticator</h5>
                  </div>

                  <div v-if="twoFactorLoading" class="py-8 flex flex-col items-center justify-center gap-2">
                    <Loader2 class="w-6 h-6 text-primary animate-spin" />
                    <span class="text-xs text-on-surface-variant">Generating setup keys...</span>
                  </div>

                  <div v-else class="space-y-4 text-xs text-on-surface-variant">
                    <p>1. Scan the QR code below in <strong>Google Authenticator</strong>:</p>
                    <div class="flex justify-center p-3 bg-white rounded-xl border border-outline-variant/50 shadow-inner w-fit mx-auto">
                      <img v-if="twoFactorQrCodeUrl" :src="twoFactorQrCodeUrl" alt="2FA QR Code" class="w-40 h-40" />
                      <div v-else class="w-40 h-40 flex items-center justify-center text-slate-400">Loading QR...</div>
                    </div>

                    <div class="bg-surface-container p-2.5 rounded-lg border border-outline-variant/50 flex justify-between items-center">
                      <div class="min-w-0 pr-2">
                        <span class="text-[10px] uppercase font-bold text-on-surface-variant block">Manual Key</span>
                        <span class="font-mono text-xs font-bold text-on-surface select-all truncate block">{{ twoFactorSecret }}</span>
                      </div>
                      <button 
                        type="button" 
                        @click="copyTwoFactorKey" 
                        class="text-primary font-bold hover:underline shrink-0 cursor-pointer flex items-center gap-1"
                      >
                        <Copy class="w-3.5 h-3.5" />
                        <span>{{ twoFactorCopied ? 'Copied' : 'Copy' }}</span>
                      </button>
                    </div>

                    <form @submit.prevent="enable2Fa" class="space-y-3 pt-1">
                      <label class="block text-xs font-bold text-on-surface">2. Enter the 6-digit code to activate:</label>
                      <input 
                        v-model="twoFactorVerifyCode"
                        type="text"
                        maxlength="6"
                        placeholder="000000"
                        class="w-full bg-surface-container border border-outline-variant text-center font-mono text-lg tracking-widest rounded-lg py-2 text-on-surface outline-none focus:border-primary"
                        required
                      />

                      <div v-if="twoFactorError" class="p-2 bg-error-container text-on-error-container rounded-lg text-xs font-semibold">
                        {{ twoFactorError }}
                      </div>

                      <button 
                        type="submit"
                        :disabled="isActivating2FA || twoFactorVerifyCode.length < 6"
                        class="w-full py-2.5 bg-primary text-on-primary font-bold text-xs rounded-lg hover:bg-primary/90 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <Loader2 v-if="isActivating2FA" class="w-4 h-4 animate-spin" />
                        <span>Verify & Activate 2FA</span>
                      </button>
                    </form>
                  </div>
                </div>

                <!-- REMIND ME LATER -->
                <div class="p-6 bg-surface-container-low border border-outline-variant rounded-2xl flex flex-col justify-between space-y-4">
                  <div class="space-y-3">
                    <div class="flex items-center gap-2.5 pb-2 border-b border-outline-variant/60">
                      <Clock class="w-4 h-4 text-amber-600" />
                      <h5 class="text-sm font-bold text-on-surface">Postpone & Remind Me Later</h5>
                    </div>

                    <p class="text-xs text-on-surface-variant leading-relaxed">
                      If you do not wish to enable 2FA right now, you can schedule a reminder. When the reminder triggers:
                    </p>

                    <div class="bg-surface-container p-3.5 rounded-xl border border-outline-variant/50 space-y-2 text-xs text-on-surface-variant">
                      <div class="flex items-center gap-2 text-on-surface font-semibold">
                        <CheckCircle2 class="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>A HIGH-priority in-app notification will be added to your account</span>
                      </div>
                      <div class="flex items-center gap-2 text-on-surface font-semibold">
                        <CheckCircle2 class="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>A security alert email will be sent to your registered address</span>
                      </div>
                    </div>

                    <label class="block text-xs font-bold text-on-surface pt-1">Select reminder timeframe:</label>
                    <div class="grid grid-cols-3 gap-2">
                      <button 
                        type="button" 
                        @click="reminderDays = 7"
                        class="py-2.5 px-2 rounded-lg border text-xs font-bold transition-all cursor-pointer text-center"
                        :class="reminderDays === 7 ? 'bg-primary text-on-primary border-primary shadow-xs' : 'bg-surface-container border-outline-variant text-on-surface'"
                      >
                        7 Days
                      </button>
                      <button 
                        type="button" 
                        @click="reminderDays = 14"
                        class="py-2.5 px-2 rounded-lg border text-xs font-bold transition-all cursor-pointer text-center"
                        :class="reminderDays === 14 ? 'bg-primary text-on-primary border-primary shadow-xs' : 'bg-surface-container border-outline-variant text-on-surface'"
                      >
                        14 Days
                      </button>
                      <button 
                        type="button" 
                        @click="reminderDays = 30"
                        class="py-2.5 px-2 rounded-lg border text-xs font-bold transition-all cursor-pointer text-center"
                        :class="reminderDays === 30 ? 'bg-primary text-on-primary border-primary shadow-xs' : 'bg-surface-container border-outline-variant text-on-surface'"
                      >
                        30 Days
                      </button>
                    </div>
                  </div>

                  <button 
                    type="button" 
                    @click="schedule2FaReminder"
                    :disabled="isSchedulingReminder"
                    class="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Loader2 v-if="isSchedulingReminder" class="w-4 h-4 animate-spin" />
                    <Clock v-else class="w-4 h-4" />
                    <span>Set Reminder & Notify Me</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Disable 2FA Modal -->
            <Modal 
              :isOpen="showDisable2FaModal" 
              title="Disable Two-Factor Authentication" 
              :onClose="() => showDisable2FaModal = false"
              maxWidth="max-w-md"
            >
              <div class="space-y-4">
                <p class="text-xs text-error font-medium leading-relaxed">
                  Warning: Disabling 2FA leaves your store account protected by password only.
                </p>
                <div class="space-y-1.5">
                  <label class="text-xs font-mono font-bold uppercase text-on-surface-variant">Confirm Password</label>
                  <input 
                    v-model="disable2FaPassword"
                    type="password"
                    placeholder="Enter your account password"
                    class="w-full bg-surface-container border border-outline-variant rounded-lg p-2.5 text-sm text-on-surface outline-none focus:border-error font-mono"
                  />
                </div>
                <div v-if="disable2FaError" class="p-2 bg-error-container text-on-error-container rounded-lg text-xs font-semibold">
                  {{ disable2FaError }}
                </div>
              </div>
              <template #footer>
                <button 
                  type="button" 
                  @click="showDisable2FaModal = false" 
                  class="flex-1 py-2.5 text-xs font-bold text-on-surface-variant hover:bg-surface-container rounded-lg border border-outline-variant bg-transparent cursor-pointer"
                >
                  {{ $t('common.cancel') }}
                </button>
                <button 
                  type="button" 
                  @click="disable2Fa" 
                  :disabled="isDisabling2FA || !disable2FaPassword"
                  class="flex-1 py-2.5 bg-error text-white font-bold text-xs rounded-lg hover:bg-error/90 cursor-pointer border-0 flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <Loader2 v-if="isDisabling2FA" class="w-4 h-4 animate-spin" />
                  <span>Disable 2FA</span>
                </button>
              </template>
            </Modal>

          </div>

          <!-- Form actions footer -->
          <div v-if="activeSection !== 'hardware' && activeSection !== 'account'" class="flex justify-end gap-3.5 pt-6 border-t border-outline-variant mt-2">
            <button 
              type="button"
              @click="handleSave"
              class="px-6 py-3 bg-primary hover:bg-opacity-95 text-on-primary font-bold text-sm rounded-lg shadow-sm shadow-primary/10 transition-colors flex items-center justify-center gap-1.5 cursor-pointer border-0"
            >
              <CheckCircle class="w-4 h-4" />
              <span>{{ $t('settings.saveChanges') }}</span>
            </button>
          </div>

        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { api } from '../services/api';
import { useAppViewModel } from '../viewmodels/useAppViewModel';
import { useBarcodeScanner, playPOSSound } from '../composables/useBarcodeScanner';
import { showToast } from '../services/toastService';
import { t } from '../i18n';
import LanguageSelector from '../components/common/LanguageSelector.vue';
import Modal from '../components/common/Modal.vue';
import QRCode from 'qrcode';
import { 
  Sliders, 
  Store, 
  Landmark, 
  Calculator, 
  CheckCircle, 
  CheckCircle2, 
  QrCode, 
  Volume2, 
  VolumeX, 
  Activity, 
  Phone, 
  Mail, 
  MapPin, 
  Coins, 
  Globe, 
  Info, 
  FileText,
  User,
  Lock,
  UserCog,
  ArrowRight,
  ArrowLeft,
  Building2,
  Save,
  KeyRound,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Copy
} from 'lucide-vue-next';

const router = useRouter();
const vm = useAppViewModel();
const { userRole, userId, activeBranchId } = vm;

const activeSection = ref<'profile' | 'defaults' | 'finance' | 'hardware' | 'account'>('profile');
const accountSubView = ref<'overview' | 'identity' | 'password' | 'two-factor'>('overview');

// 2FA Reactive States
const twoFactorEnabled = ref(false);
const twoFactorRemindAt = ref<string | null>(null);
const twoFactorLoading = ref(false);
const twoFactorSecret = ref('');
const twoFactorOtpAuthUri = ref('');
const twoFactorQrCodeUrl = ref('');
const twoFactorVerifyCode = ref('');
const twoFactorError = ref('');
const twoFactorCopied = ref(false);
const isActivating2FA = ref(false);
const reminderDays = ref(7);
const isSchedulingReminder = ref(false);
const showDisable2FaModal = ref(false);
const disable2FaPassword = ref('');
const disable2FaError = ref('');
const isDisabling2FA = ref(false);

const userName = computed(() => {
  return localStorage.getItem('cashierName') || 'Store Administrator';
});

const currentStoreId = computed(() => {
  return localStorage.getItem('storeId');
});

const userInitials = computed(() => {
  const name = (formInfo.value.fullName || userName.value).trim();
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length >= 2 && parts[0] && parts[1]) {
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
});

// Account & Profile Form States
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

const passwordsMatch = computed(() => {
  if (!passwordForm.value.newPassword || !passwordForm.value.confirmPassword) return false;
  return passwordForm.value.newPassword === passwordForm.value.confirmPassword;
});

const isPasswordFormValid = computed(() => {
  return passwordForm.value.oldPassword.trim().length > 0 &&
         passwordForm.value.newPassword.length >= 6 && 
         passwordsMatch.value;
});

const fetchUserProfile = async () => {
  const id = userId.value || localStorage.getItem('userId');
  if (!id) return;

  try {
    const userObj = await api.get<any>(`/api/users/${id}`, { suppressToast: true });
    if (userObj) {
      formInfo.value.fullName = userObj.fullName || localStorage.getItem('cashierName') || '';
      formInfo.value.phone = userObj.phone || '';
      formInfo.value.email = userObj.email || '';
      twoFactorEnabled.value = !!userObj.twoFactorEnabled;
      twoFactorRemindAt.value = userObj.twoFactorRemindAt || null;
    }
  } catch (err) {
    console.warn('Could not fetch user profile in settings, using session values:', err);
  }

  const branchId = activeBranchId.value || localStorage.getItem('branchId');
  const storeId = localStorage.getItem('storeId');
  if (branchId && storeId) {
    try {
      const branches = await api.get<any>(`/api/stores/${storeId}/branches`, { suppressToast: true });
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

    const updated = await api.put<any>(`/api/users/${id}`, payload, { suppressToast: true });
    if (updated) {
      if (updated.fullName) {
        localStorage.setItem('cashierName', updated.fullName);
      }
      showToast('Personal details updated successfully!', 'success');
      accountSubView.value = 'overview';
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
    accountSubView.value = 'overview';
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

const formatReminderDate = (dateStr: string) => {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return dateStr;
  }
};

const goToTwoFactorSubView = () => {
  accountSubView.value = 'two-factor';
  if (!twoFactorEnabled.value && !twoFactorSecret.value) {
    init2FaSetup();
  }
};

const init2FaSetup = async () => {
  twoFactorLoading.value = true;
  twoFactorError.value = '';
  twoFactorVerifyCode.value = '';
  twoFactorCopied.value = false;

  try {
    const res = await api.get<any>('/api/auth/2fa/setup', { suppressToast: true });
    twoFactorSecret.value = res.secret;
    twoFactorOtpAuthUri.value = res.otpAuthUri;
    twoFactorQrCodeUrl.value = await QRCode.toDataURL(res.otpAuthUri, {
      width: 200,
      margin: 2,
      color: { dark: '#122131', light: '#FFFFFF' }
    });
  } catch (err: any) {
    twoFactorError.value = err.message || 'Failed to initialize 2FA setup.';
  } finally {
    twoFactorLoading.value = false;
  }
};

const copyTwoFactorKey = async () => {
  try {
    await navigator.clipboard.writeText(twoFactorSecret.value);
    twoFactorCopied.value = true;
    setTimeout(() => { twoFactorCopied.value = false; }, 3000);
  } catch {}
};

const enable2Fa = async () => {
  if (!twoFactorVerifyCode.value || twoFactorVerifyCode.value.length < 6) return;
  isActivating2FA.value = true;
  twoFactorError.value = '';

  try {
    const res = await api.post<any>('/api/auth/2fa/enable', {
      totpCode: twoFactorVerifyCode.value.trim()
    }, { suppressToast: true });

    showToast(res.message || 'Two-Factor Authentication activated successfully!', 'success');
    twoFactorEnabled.value = true;
    twoFactorRemindAt.value = null;
    localStorage.setItem('twoFactorEnabled', 'true');
    localStorage.removeItem('twoFactorRemindAt');
    sessionStorage.removeItem('pending2FaPrompt');
  } catch (err: any) {
    twoFactorError.value = err.message || 'Invalid verification code. Please check Google Authenticator.';
  } finally {
    isActivating2FA.value = false;
  }
};

const schedule2FaReminder = async () => {
  isSchedulingReminder.value = true;
  try {
    const res = await api.post<any>('/api/auth/2fa/remind', {
      days: reminderDays.value
    }, { suppressToast: true });

    showToast(res.message || '2FA reminder scheduled! High-priority notification & email dispatched.', 'success');
    if (res.remindAt) {
      twoFactorRemindAt.value = res.remindAt;
      localStorage.setItem('twoFactorRemindAt', res.remindAt);
    }
    sessionStorage.removeItem('pending2FaPrompt');
  } catch (err: any) {
    showToast(err.message || 'Failed to schedule 2FA reminder.', 'error');
  } finally {
    isSchedulingReminder.value = false;
  }
};

const disable2Fa = async () => {
  if (!disable2FaPassword.value) {
    disable2FaError.value = 'Please enter your password.';
    return;
  }

  isDisabling2FA.value = true;
  disable2FaError.value = '';

  try {
    const res = await api.post<any>('/api/auth/2fa/disable', {
      password: disable2FaPassword.value
    }, { suppressToast: true });

    showToast(res.message || 'Two-Factor Authentication has been disabled.', 'info');
    twoFactorEnabled.value = false;
    showDisable2FaModal.value = false;
    disable2FaPassword.value = '';
    localStorage.setItem('twoFactorEnabled', 'false');
    init2FaSetup();
  } catch (err: any) {
    disable2FaError.value = err.message || 'Incorrect password.';
  } finally {
    isDisabling2FA.value = false;
  }
};

// Hardware Barcode Scanner integration
const { lastScannedBarcode, scanHistory, scanStats } = useBarcodeScanner({
  onScan: (scannedCode) => {
    console.log('[Settings Hardware Test] Scanned code:', scannedCode);
  },
  enableAudioFeedback: true,
});

// Input states
const storeName = ref('');
const storeTin = ref('');
const storeAddress = ref('');
const storePhone = ref('');
const storeEmail = ref('');
const storeCurrency = ref<'TZS' | 'USD' | 'EUR'>('TZS');
const storeTimezone = ref('');
const enablePerpetualCogs = ref(false);

onMounted(async () => {
  await vm.fetchSettings();
  await fetchUserProfile();
  
  // Sync inputs
  storeName.value = vm.settings.value.name;
  storeTin.value = vm.settings.value.tin;
  storeAddress.value = vm.settings.value.physicalAddress;
  storePhone.value = vm.settings.value.phone;
  storeEmail.value = vm.settings.value.email;
  storeCurrency.value = vm.settings.value.currency;
  storeTimezone.value = vm.settings.value.timezone;
  enablePerpetualCogs.value = !!vm.settings.value.enablePerpetualCogs;
});

const handleSave = async () => {
  try {
    if (activeSection.value === 'finance') {
      await vm.toggleCogs(enablePerpetualCogs.value);
      showToast(
        `Cost of Goods Sold (COGS) is now ${enablePerpetualCogs.value ? 'ENABLED (Perpetual Inventory)' : 'DISABLED (Periodic Inventory)'}`, 
        'success'
      );
      return;
    }

    await vm.updateSettings({
      name: storeName.value,
      tin: storeTin.value,
      physicalAddress: storeAddress.value,
      phone: storePhone.value,
      email: storeEmail.value,
      currency: storeCurrency.value,
      timezone: storeTimezone.value,
      enablePerpetualCogs: enablePerpetualCogs.value
    });

    showToast('Store settings updated and applied successfully', 'success');
  } catch (err: any) {
    showToast(err.message || 'Failed to update store settings', 'error');
  }
};
</script>
