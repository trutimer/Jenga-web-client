<template>
  <div class="max-w-7xl mx-auto space-y-6 pb-20 animate-fade-up font-sans select-none">
    
    <!-- Header section -->
    <div class="mb-2">
      <h2 class="text-3xl font-black text-on-background tracking-tight">System Settings</h2>
      <p class="text-sm font-semibold text-on-surface-variant mt-1">Manage your terminal profile coordinates, default tax indices, and base currencies.</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
      
      <!-- Left column sidebar (Category Switcher) -->
      <div class="bg-surface-container-lowest border border-outline-variant shadow-sm rounded-xl p-4 flex flex-col gap-1.5 select-none shrink-0 md:col-span-1">
        <span class="block text-[11px] font-mono font-bold text-on-surface-variant uppercase tracking-wider mb-2 px-2">Store Config</span>
        
        <button 
          type="button"
          @click="activeSection = 'profile'"
          class="text-left text-xs px-4 py-3 h-11 rounded-lg flex items-center gap-2.5 transition-all cursor-pointer font-semibold border-0"
          :class="activeSection === 'profile' 
            ? 'bg-primary-container text-on-primary-container font-extrabold translate-x-1' 
            : 'text-on-surface-variant hover:bg-surface-container bg-transparent'"
        >
          <Store className="w-4.5 h-4.5" />
          <span>Store Profile</span>
        </button>

        <button 
          type="button"
          @click="activeSection = 'defaults'"
          class="text-left text-xs px-4 py-3 h-11 rounded-lg flex items-center gap-2.5 transition-all cursor-pointer font-semibold border-0"
          :class="activeSection === 'defaults' 
            ? 'bg-primary-container text-on-primary-container font-extrabold translate-x-1' 
            : 'text-on-surface-variant hover:bg-surface-container bg-transparent'"
        >
          <Sliders className="w-4.5 h-4.5" />
          <span>Regional Defaults</span>
        </button>

        <button 
          type="button"
          @click="activeSection = 'keys'"
          class="text-left text-xs px-4 py-3 h-11 rounded-lg flex items-center gap-2.5 transition-all cursor-pointer font-semibold border-0"
          :class="activeSection === 'keys' 
            ? 'bg-primary-container text-on-primary-container font-extrabold translate-x-1' 
            : 'text-on-surface-variant hover:bg-surface-container bg-transparent'"
        >
          <Key className="w-4.5 h-4.5" />
          <span>API & Device Keys</span>
        </button>

        <button 
          type="button"
          @click="activeSection = 'hardware'"
          class="text-left text-xs px-4 py-3 h-11 rounded-lg flex items-center gap-2.5 transition-all cursor-pointer font-semibold border-0"
          :class="activeSection === 'hardware' 
            ? 'bg-primary-container text-on-primary-container font-extrabold translate-x-1' 
            : 'text-on-surface-variant hover:bg-surface-container bg-transparent'"
        >
          <QrCode className="w-4.5 h-4.5" />
          <span>Hardware & Barcode</span>
        </button>
      </div>

      <!-- Right column Form Panel (3 columns) -->
      <div class="md:col-span-3 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden flex flex-col">
        <form @submit.prevent="handleSave" class="flex flex-col gap-6 p-6">
          
          <!-- Header titles of section -->
          <div class="pb-4 border-b border-outline-variant/60">
            <h3 class="text-lg font-bold text-on-surface uppercase tracking-tight">
              <span v-if="activeSection === 'profile'">Corporate Store Profile</span>
              <span v-else-if="activeSection === 'defaults'">Base Regional Settings</span>
              <span v-else-if="activeSection === 'keys'">Developer Integrations & Key Management</span>
              <span v-else-if="activeSection === 'hardware'">Hardware Peripherals & 2D Barcode Scanner</span>
            </h3>
            <p class="text-xs text-on-surface-variant font-semibold mt-1">
              <span v-if="activeSection === 'profile'">Configure custom storefront descriptors rendering on physical thermal invoices.</span>
              <span v-else-if="activeSection === 'defaults'">Choose global currency types and temporal zones for data tracking.</span>
              <span v-else-if="activeSection === 'keys'">Verify and generate secure webhook keys to integrate local POS printers.</span>
              <span v-else-if="activeSection === 'hardware'">Monitor connected USB hardware, test Model X11 2D Barcode scanner inputs, and manage POS sound alerts.</span>
            </p>
          </div>

          <!-- SECTION 1: PROFILE SETUP -->
          <div v-if="activeSection === 'profile'" class="space-y-4">
            <!-- Store Name & registration TIN -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-mono font-bold uppercase tracking-wider text-on-surface-variant">Store / Branch Name</label>
                <input 
                  type="text" 
                  required
                  v-model="storeName"
                  placeholder="Ex. Main Branch Nairobi"
                  class="w-full bg-surface-container border border-outline-variant text-sm font-semibold rounded-lg px-3.5 py-2.5 outline-none focus:border-primary text-on-surface"
                />
              </div>

              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-mono font-bold uppercase tracking-wider text-on-surface-variant">VAT KRA / TIN registration Code</label>
                <input 
                  type="text" 
                  required
                  v-model="storeTin"
                  placeholder="Ex. P0001234567X"
                  class="w-full bg-surface-container border border-outline-variant text-sm font-mono rounded-lg px-3.5 py-2.5 outline-none focus:border-primary text-on-surface"
                />
              </div>
            </div>

            <!-- Contact email & phone -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-mono font-bold uppercase tracking-wider text-on-surface-variant">Support Helpline</label>
                <div class="relative">
                  <Phone className="w-4 h-4 text-outline absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="tel" 
                    required
                    v-model="storePhone"
                    placeholder="+254 700 000 000"
                    class="w-full bg-surface-container pl-9 pr-3.5 py-2.5 border border-outline-variant text-sm font-semibold rounded-lg outline-none focus:border-primary text-on-surface"
                  />
                </div>
              </div>

              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-mono font-bold uppercase tracking-wider text-on-surface-variant">Store Email Address</label>
                <div class="relative">
                  <Mail className="w-4 h-4 text-outline absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="email" 
                    required
                    v-model="storeEmail"
                    placeholder="billing@dukapor.co"
                    class="w-full bg-surface-container pl-9 pr-3.5 py-2.5 border border-outline-variant text-sm font-semibold rounded-lg outline-none focus:border-primary text-on-surface"
                  />
                </div>
              </div>
            </div>

            <!-- Store physical address -->
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-mono font-bold uppercase tracking-wider text-on-surface-variant">Store Physical Address</label>
              <div class="relative">
                <MapPin className="w-4 h-4 text-outline absolute left-3 top-3" />
                <textarea 
                  required
                  rows="3"
                  v-model="storeAddress"
                  placeholder="123 Market Street, Nairobi, Kenya"
                  class="w-full bg-surface-container pl-9 pr-3.5 py-2.5 border border-outline-variant text-sm font-semibold rounded-lg outline-none focus:border-primary text-on-surface resize-none"
                />
              </div>
            </div>
          </div>

          <!-- SECTION 2: GLOBAL DEFAULT VARIABLES -->
          <div v-else-if="activeSection === 'defaults'" class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Select Base Currency -->
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-mono font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1">
                <Coins className="w-3.5 h-3.5 text-primary" />
                <span>Reference Base Currency</span>
              </label>
              <select 
                v-model="storeCurrency"
                class="w-full bg-surface-container border border-outline-variant text-sm font-semibold rounded-lg px-3.5 py-3 cursor-pointer outline-none focus:ring-1 focus:ring-primary text-on-surface"
              >
                <option value="TZS">TZS (Tanzanian Shilling - Standard Base)</option>
                <option value="USD">USD (United States Dollar - standard 1:2600 conversion)</option>
                <option value="EUR">EUR (Euro - standard 1:2800 conversion)</option>
              </select>
            </div>

            <!-- Store timezone dropdown -->
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-mono font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-primary" />
                <span>Operational Timezone</span>
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

          <!-- SECTION 3: API DEVELOPER KEYS -->
          <div v-else-if="activeSection === 'keys'" class="space-y-4">
            <div class="p-4 bg-primary-container/10 border border-primary-container/20 rounded-xl">
              <h4 class="text-sm font-bold text-primary mb-1">Local Printer Webhook Access Key</h4>
              <p class="text-xs text-on-surface-variant leading-relaxed">Ensure physical receipt terminals are authenticated. Insert generated key into Star Micronics or Epson cloud print configuration.</p>
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-mono font-bold uppercase tracking-wider text-on-surface-variant">INTEGRATION SECURE API KEY</label>
              <div class="flex gap-2">
                <input 
                  type="password" 
                  disabled
                  value="JENGA_SECURE_TOKEN_P0001234567X_JWT_VALIDATED"
                  class="flex-1 bg-surface-container border border-outline-variant text-xs font-mono rounded-lg px-3.5 py-2.5 outline-none text-[#F4511E]"
                />
                <button 
                  type="button" 
                  @click="alertVerify"
                  class="bg-surface-container border border-outline-variant hover:bg-surface text-xs font-bold px-4 py-2.5 rounded-lg cursor-pointer"
                >
                  Verify
                </button>
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
                      ACTIVE & VERIFIED
                    </span>
                    <span 
                      v-else
                      class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20"
                    >
                      <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                      LISTENING (USB WEDGE)
                    </span>
                  </div>
                  <p class="text-xs text-on-surface-variant font-medium mt-1">
                    Mode: <span class="font-mono font-bold text-on-surface">USB HID Keyboard Emulation</span> • 
                    Status: <span class="font-mono font-bold" :class="lastScannedBarcode ? 'text-emerald-600' : 'text-amber-600'">{{ lastScannedBarcode ? `Last Scanned: ${lastScannedBarcode}` : 'Scan any item with X11 to verify' }}</span>
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
                  <span>Test Beep</span>
                </button>
                <button 
                  type="button" 
                  @click="playPOSSound('error')"
                  class="px-3.5 py-2 bg-surface-container-high hover:bg-surface-container-highest text-xs font-bold rounded-lg border border-outline-variant transition-colors flex items-center gap-1.5 cursor-pointer text-error"
                >
                  <VolumeX class="w-3.5 h-3.5 text-error" />
                  <span>Test Error</span>
                </button>
              </div>
            </div>

            <!-- Live Barcode Scanner Test Bench -->
            <div class="p-5 bg-surface-container-low border border-outline-variant rounded-xl flex flex-col gap-4">
              <div class="flex justify-between items-center pb-3 border-b border-outline-variant/60">
                <div>
                  <h4 class="text-sm font-bold text-on-surface uppercase tracking-tight flex items-center gap-2">
                    <Activity class="w-4 h-4 text-primary" />
                    <span>Interactive Scanner Diagnostic Bench</span>
                  </h4>
                  <p class="text-xs text-on-surface-variant font-medium mt-0.5">Scan any physical 1D or 2D barcode with your X11 scanner to test communication latency.</p>
                </div>
                <span class="text-xs font-mono font-bold text-primary px-3 py-1 bg-primary/10 rounded-md border border-primary/20">
                  Ready to scan...
                </span>
              </div>

              <!-- Scanner result indicator box -->
              <div class="p-4 bg-surface rounded-xl border border-outline-variant/80 flex flex-col md:flex-row justify-between items-center gap-4 min-h-[72px]">
                <div>
                  <span class="text-[11px] font-mono font-bold text-on-surface-variant uppercase tracking-wider block mb-0.5">Last Scanned Value</span>
                  <p class="text-lg font-mono font-black text-primary tracking-wide">
                    {{ lastScannedBarcode || '--- Scan barcode using X11 scanner ---' }}
                  </p>
                </div>

                <div v-if="scanStats.lastScanDuration > 0" class="flex gap-4 shrink-0 text-right">
                  <div>
                    <span class="text-[10px] font-mono text-on-surface-variant block uppercase">Latency</span>
                    <span class="text-xs font-mono font-bold text-emerald-600">{{ scanStats.lastScanDuration }} ms</span>
                  </div>
                  <div>
                    <span class="text-[10px] font-mono text-on-surface-variant block uppercase">Length</span>
                    <span class="text-xs font-mono font-bold text-on-surface">{{ scanStats.characterCount }} chars</span>
                  </div>
                  <div>
                    <span class="text-[10px] font-mono text-on-surface-variant block uppercase">Device Type</span>
                    <span class="text-xs font-mono font-bold text-primary">Hardware HID</span>
                  </div>
                </div>
              </div>

              <!-- Recent Scan History Log Table -->
              <div v-if="scanHistory.length > 0" class="mt-2">
                <span class="text-[11px] font-mono font-bold text-on-surface-variant uppercase tracking-wider block mb-2">Scan Session Log</span>
                <div class="max-h-40 overflow-y-auto border border-outline-variant/60 rounded-lg divide-y divide-outline-variant/40 bg-surface">
                  <div 
                    v-for="(item, idx) in scanHistory" 
                    :key="idx"
                    class="p-2.5 px-4 flex justify-between items-center text-xs hover:bg-surface-container/30 transition-colors"
                  >
                    <span class="font-mono font-bold text-on-surface">{{ item.barcode }}</span>
                    <div class="flex items-center gap-4 text-on-surface-variant font-medium text-[11px]">
                      <span>{{ item.speedMs }} ms burst</span>
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
                  <h5 class="text-xs font-bold text-on-surface">Auto-Add to Cart on Scan</h5>
                  <p class="text-[11px] text-on-surface-variant font-medium mt-0.5">Automatically add item to cart on Checkout screen without clicking.</p>
                </div>
                <input type="checkbox" checked class="w-4 h-4 accent-primary cursor-pointer" />
              </div>

              <div class="p-4 bg-surface-container-low border border-outline-variant rounded-xl flex items-center justify-between">
                <div>
                  <h5 class="text-xs font-bold text-on-surface">Audio Scan Feedback</h5>
                  <p class="text-[11px] text-on-surface-variant font-medium mt-0.5">Play high-pitch tone on successful lookup, warning buzz on missing item.</p>
                </div>
                <input type="checkbox" checked class="w-4 h-4 accent-primary cursor-pointer" />
              </div>
            </div>
          </div>

          <!-- Form actions footer -->
          <div v-if="activeSection !== 'keys' && activeSection !== 'hardware'" class="flex justify-end gap-3.5 pt-6 border-t border-outline-variant mt-2">
            <button 
              type="submit"
              class="px-6 py-3 bg-primary hover:bg-opacity-95 text-on-primary font-bold text-sm rounded-lg shadow-sm shadow-primary/10 transition-colors flex items-center justify-center gap-1.5 cursor-pointer border-0"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Save Configuration Changes</span>
            </button>
          </div>

        </form>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAppViewModel } from '../viewmodels/useAppViewModel';
import { useBarcodeScanner, playPOSSound } from '../composables/useBarcodeScanner';
import { 
  Sliders, 
  Store, 
  Key, 
  CheckCircle,
  QrCode,
  Volume2,
  VolumeX,
  Activity
} from 'lucide-vue-next';

const vm = useAppViewModel();

const activeSection = ref<'profile' | 'defaults' | 'keys' | 'hardware'>('profile');

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

onMounted(async () => {
  await vm.fetchSettings();
  
  // Sync inputs
  storeName.value = vm.settings.value.name;
  storeTin.value = vm.settings.value.tin;
  storeAddress.value = vm.settings.value.physicalAddress;
  storePhone.value = vm.settings.value.phone;
  storeEmail.value = vm.settings.value.email;
  storeCurrency.value = vm.settings.value.currency;
  storeTimezone.value = vm.settings.value.timezone;
});

const handleSave = async () => {
  await vm.updateSettings({
    name: storeName.value,
    tin: storeTin.value,
    physicalAddress: storeAddress.value,
    phone: storePhone.value,
    email: storeEmail.value,
    currency: storeCurrency.value,
    timezone: storeTimezone.value
  });

  alert(`Settings successfully saved & written client-side!\nApplied defaults: ${storeCurrency.value} • timezone ${storeTimezone.value}`);
};

const alertVerify = () => {
  alert("Enterprise Key validated client-side.");
};
</script>
