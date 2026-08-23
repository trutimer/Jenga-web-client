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
          <Store class="w-4.5 h-4.5" />
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
          <Sliders class="w-4.5 h-4.5" />
          <span>Regional Defaults</span>
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
          <span>Finance & Accounts</span>
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
          <span>Hardware & Barcode</span>
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
          <span>Account & Profile</span>
        </button>
      </div>

      <!-- Right column Form Panel (3 columns) -->
      <div class="md:col-span-3 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div class="flex flex-col gap-6 p-6">
          
          <!-- Header titles of section -->
          <div class="pb-4 border-b border-outline-variant/60">
            <h3 class="text-lg font-bold text-on-surface uppercase tracking-tight">
              <span v-if="activeSection === 'profile'">Corporate Store Profile</span>
              <span v-else-if="activeSection === 'defaults'">Base Regional Settings</span>
              <span v-else-if="activeSection === 'finance'">Finance & General Ledger Policies</span>
              <span v-else-if="activeSection === 'hardware'">Hardware Peripherals & 2D Barcode Scanner</span>
              <span v-else-if="activeSection === 'account'">Account & Personal Profile</span>
            </h3>
            <p class="text-xs text-on-surface-variant font-semibold mt-1">
              <span v-if="activeSection === 'profile'">Configure custom storefront descriptors rendering on physical thermal invoices.</span>
              <span v-else-if="activeSection === 'defaults'">Choose global currency types and temporal zones for data tracking.</span>
              <span v-else-if="activeSection === 'finance'">Configure automated double-entry postings, perpetual inventory valuation, and Cost of Goods Sold (COGS) accounting rules.</span>
              <span v-else-if="activeSection === 'hardware'">Monitor connected USB hardware, test Model X11 2D Barcode scanner inputs, and manage POS sound alerts.</span>
              <span v-else-if="activeSection === 'account'">Manage your personal account credentials, identity, contact information, and security password.</span>
            </p>
          </div>

          <!-- SECTION 1: PROFILE SETUP -->
          <div v-if="activeSection === 'profile'" class="space-y-4">
            <!-- Store Name & registration TIN -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-mono font-bold uppercase tracking-wider text-on-surface-variant">Store / Branch Name</label>
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
                <label class="text-xs font-mono font-bold uppercase tracking-wider text-on-surface-variant">VAT KRA / TIN registration Code</label>
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
                <label class="text-xs font-mono font-bold uppercase tracking-wider text-on-surface-variant">Support Helpline</label>
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
                <label class="text-xs font-mono font-bold uppercase tracking-wider text-on-surface-variant">Store Email Address</label>
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
              <label class="text-xs font-mono font-bold uppercase tracking-wider text-on-surface-variant">Store Physical Address</label>
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
          <div v-else-if="activeSection === 'defaults'" class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Select Base Currency -->
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-mono font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1">
                <Coins class="w-3.5 h-3.5 text-primary" />
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
                <Globe class="w-3.5 h-3.5 text-primary" />
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
                      <h4 class="text-base font-bold text-on-surface">Cost of Goods Sold (COGS) Automation</h4>
                      <span 
                        class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold"
                        :class="enablePerpetualCogs 
                          ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/20' 
                          : 'bg-surface-container-high text-on-surface-variant border border-outline-variant'"
                      >
                        <span class="w-1.5 h-1.5 rounded-full" :class="enablePerpetualCogs ? 'bg-emerald-500 animate-pulse' : 'bg-on-surface-variant/60'"></span>
                        {{ enablePerpetualCogs ? 'PERPETUAL INVENTORY (REAL-TIME)' : 'PERIODIC INVENTORY (MANUAL)' }}
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
                      <span>When COGS is Enabled (ON)</span>
                    </span>
                    <span class="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-primary/10 text-primary">
                      Perpetual Method
                    </span>
                  </div>

                  <p class="text-xs text-on-surface-variant font-medium leading-relaxed">
                    Every sale completed at checkout automatically creates <strong>2 paired double-entry journal movements</strong>:
                  </p>

                  <div class="space-y-1.5 font-mono text-[11px] bg-surface-container-lowest/80 p-3 rounded-lg border border-outline-variant/40">
                    <div class="text-emerald-700 flex justify-between">
                      <span>DR 1010/1020 Cash / Bank</span>
                      <span>(Selling Price)</span>
                    </div>
                    <div class="text-emerald-700 flex justify-between pl-4">
                      <span>CR 4010 Sales Revenue</span>
                      <span>(Selling Price)</span>
                    </div>
                    <div class="border-t border-outline-variant/30 my-1"></div>
                    <div class="text-indigo-700 flex justify-between">
                      <span>DR 5010 Cost of Goods Sold</span>
                      <span>(Cost Price × Qty)</span>
                    </div>
                    <div class="text-indigo-700 flex justify-between pl-4">
                      <span>CR 1040 Stock on Hand</span>
                      <span>(Cost Price × Qty)</span>
                    </div>
                  </div>

                  <ul class="text-[11px] text-on-surface-variant space-y-1 list-disc list-inside font-medium">
                    <li><strong>Real-time Gross Profit:</strong> Live profit & margins rendered instantly on the Profit & Loss statement.</li>
                    <li><strong>Continuous Balance Sheet Asset:</strong> Inventory valuation updates instantly without waiting for stock counts.</li>
                    <li><strong>Requirement:</strong> Ensure all inventory items have accurate cost prices configured.</li>
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
                      <span>When COGS is Disabled (OFF)</span>
                    </span>
                    <span class="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-amber-500/10 text-amber-700">
                      Periodic Method
                    </span>
                  </div>

                  <p class="text-xs text-on-surface-variant font-medium leading-relaxed">
                    Sales record revenue at checkout, while inventory and COGS are adjusted periodically via manual stock counts:
                  </p>

                  <div class="space-y-1.5 font-mono text-[11px] bg-surface-container-lowest/80 p-3 rounded-lg border border-outline-variant/40">
                    <div class="text-emerald-700 flex justify-between">
                      <span>DR 1010/1020 Cash / Bank</span>
                      <span>(Selling Price)</span>
                    </div>
                    <div class="text-emerald-700 flex justify-between pl-4">
                      <span>CR 4010 Sales Revenue</span>
                      <span>(Selling Price)</span>
                    </div>
                    <div class="border-t border-outline-variant/30 my-1"></div>
                    <div class="text-on-surface-variant italic flex justify-between">
                      <span>No COGS or Inventory entry</span>
                      <span>(-)</span>
                    </div>
                  </div>

                  <ul class="text-[11px] text-on-surface-variant space-y-1 list-disc list-inside font-medium">
                    <li><strong>Simpler Checkout:</strong> No dependency on per-item cost price data during point-of-sale checkout.</li>
                    <li><strong>Periodic Adjustment:</strong> Total COGS is calculated at month-end: <span class="font-mono text-[10px] bg-surface-container px-1 rounded">Beginning Inv + Purchases - Ending Inv</span>.</li>
                    <li><strong>Recommended for:</strong> Small kiosks, flat-margin retailers, or stores conducting regular manual audits.</li>
                  </ul>
                </div>

              </div>

              <!-- Important Note Banner -->
              <div class="p-3.5 bg-surface-container rounded-xl border border-outline-variant/70 flex items-start gap-3">
                <Info class="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div class="text-xs text-on-surface-variant leading-relaxed">
                  <span class="font-bold text-on-surface">Store Policy Note:</span>
                  Changing this setting takes effect immediately on all subsequent sales transactions. Existing posted journal entries remain immutable for fiscal audit compliance.
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
                <span>Account Overview</span>
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
                <span>Edit Identity & Contact</span>
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
                <span>Change Password</span>
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
                      User ID: <span class="font-mono text-on-surface font-semibold select-all">{{ userId || 'N/A' }}</span> • Branch: <span class="font-semibold text-on-surface">{{ currentBranchName }}</span>
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
                    <span class="text-[10px] font-bold text-on-surface-variant block uppercase">Phone</span>
                    <span class="font-mono font-semibold text-on-surface truncate block">{{ formInfo.phone || 'No phone set' }}</span>
                  </div>
                </div>

                <div class="p-3.5 bg-surface-container-low rounded-xl border border-outline-variant/60 flex items-center gap-3">
                  <div class="w-8 h-8 rounded-lg bg-primary-container/30 text-primary flex items-center justify-center shrink-0">
                    <Mail class="w-4 h-4" />
                  </div>
                  <div class="min-w-0">
                    <span class="text-[10px] font-bold text-on-surface-variant block uppercase">Email</span>
                    <span class="font-semibold text-on-surface truncate block">{{ formInfo.email || 'No email set' }}</span>
                  </div>
                </div>

                <div class="p-3.5 bg-surface-container-low rounded-xl border border-outline-variant/60 flex items-center gap-3">
                  <div class="w-8 h-8 rounded-lg bg-primary-container/30 text-primary flex items-center justify-center shrink-0">
                    <Building2 class="w-4 h-4" />
                  </div>
                  <div class="min-w-0">
                    <span class="text-[10px] font-bold text-on-surface-variant block uppercase">Branch</span>
                    <span class="font-semibold text-on-surface truncate block">{{ currentBranchName }}</span>
                  </div>
                </div>
              </div>

              <!-- Profile Sections Quick Grid -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- Personal Info Card -->
                <div class="p-5 bg-surface-container-low border border-outline-variant rounded-xl flex flex-col justify-between space-y-4 hover:border-primary/50 transition-colors">
                  <div class="space-y-2">
                    <div class="flex items-center gap-2 text-on-surface">
                      <div class="w-8 h-8 rounded-lg bg-primary-container/30 text-primary flex items-center justify-center">
                        <User class="w-4 h-4" />
                      </div>
                      <h5 class="text-sm font-bold">Personal Information</h5>
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
                    <span>Edit Identity & Contact</span>
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
                      <h5 class="text-sm font-bold">Security & Password</h5>
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
                    <span>Change Account Password</span>
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
                    <h4 class="text-sm font-bold text-on-surface">Personal Information & Contact Details</h4>
                    <p class="text-xs text-on-surface-variant">Update your account name, telephone number, and email address</p>
                  </div>
                </div>
                <button
                  type="button"
                  @click="accountSubView = 'overview'"
                  class="text-xs text-on-surface-variant hover:text-primary font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <span>Cancel</span>
                </button>
              </div>

              <form @submit.prevent="savePersonalInfo" class="space-y-4 max-w-xl">
                <!-- Full Name -->
                <div class="space-y-1.5">
                  <label class="block text-xs font-mono font-bold uppercase tracking-wider text-on-surface-variant">
                    Full Name <span class="text-error">*</span>
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
                    Phone Number <span class="text-error">*</span>
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
                    Email Address <span class="text-on-surface-variant/60 font-normal lowercase">(optional)</span>
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
                    Account Role
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
                    <span>{{ isSavingInfo ? 'Saving Changes...' : 'Save Personal Details' }}</span>
                  </button>

                  <button
                    type="button"
                    @click="accountSubView = 'overview'"
                    class="px-4 py-2.5 bg-surface-container hover:bg-surface-container-high text-on-surface-variant font-bold text-xs rounded-lg transition-all cursor-pointer border border-outline-variant/60"
                  >
                    Cancel
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
                    <h4 class="text-sm font-bold text-on-surface">Change Account Password</h4>
                    <p class="text-xs text-on-surface-variant">Update your security credentials independently</p>
                  </div>
                </div>
                <button
                  type="button"
                  @click="accountSubView = 'overview'"
                  class="text-xs text-on-surface-variant hover:text-primary font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <span>Cancel</span>
                </button>
              </div>

              <form @submit.prevent="updatePassword" class="space-y-4 max-w-xl">
                <!-- Current / Old Password -->
                <div class="space-y-1.5">
                  <label class="block text-xs font-mono font-bold uppercase tracking-wider text-on-surface-variant">
                    Current (Old) Password <span class="text-error">*</span>
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
                    New Password <span class="text-error">*</span>
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
                    Confirm New Password <span class="text-error">*</span>
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
                    Password Requirements:
                  </div>
                  <div class="flex items-center gap-2" :class="passwordForm.newPassword.length >= 6 ? 'text-emerald-700 font-bold' : 'text-on-surface-variant'">
                    <CheckCircle2 v-if="passwordForm.newPassword.length >= 6" class="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                    <AlertCircle v-else class="w-3.5 h-3.5 shrink-0" />
                    <span>At least 6 characters long</span>
                  </div>
                  <div class="flex items-center gap-2" :class="passwordsMatch ? 'text-emerald-700 font-bold' : 'text-on-surface-variant'">
                    <CheckCircle2 v-if="passwordsMatch" class="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                    <AlertCircle v-else class="w-3.5 h-3.5 shrink-0" />
                    <span>Passwords match</span>
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
                    <span>{{ isUpdatingPassword ? 'Updating Password...' : 'Update Account Password' }}</span>
                  </button>

                  <button
                    type="button"
                    @click="accountSubView = 'overview'"
                    class="px-4 py-2.5 bg-surface-container hover:bg-surface-container-high text-on-surface-variant font-bold text-xs rounded-lg transition-all cursor-pointer border border-outline-variant/60"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>

          </div>

          <!-- Form actions footer -->
          <div v-if="activeSection !== 'hardware' && activeSection !== 'account'" class="flex justify-end gap-3.5 pt-6 border-t border-outline-variant mt-2">
            <button 
              type="button"
              @click="handleSave"
              class="px-6 py-3 bg-primary hover:bg-opacity-95 text-on-primary font-bold text-sm rounded-lg shadow-sm shadow-primary/10 transition-colors flex items-center justify-center gap-1.5 cursor-pointer border-0"
            >
              <CheckCircle class="w-4 h-4" />
              <span>Save Configuration Changes</span>
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
  AlertCircle
} from 'lucide-vue-next';

const router = useRouter();
const vm = useAppViewModel();
const { userRole, userId, activeBranchId } = vm;

const activeSection = ref<'profile' | 'defaults' | 'finance' | 'hardware' | 'account'>('profile');
const accountSubView = ref<'overview' | 'identity' | 'password'>('overview');

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
