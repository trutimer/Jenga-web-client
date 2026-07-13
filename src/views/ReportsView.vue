<template>
  <div class="max-w-7xl mx-auto space-y-6 pb-20 animate-fade-up font-sans select-none">
    
    <!-- Header element -->
    <div class="flex flex-col sm:flex-row justify-between sm:items-end mb-2">
      <div>
        <h2 class="text-3xl font-black text-on-background tracking-tight">Reports Center</h2>
        <p class="text-sm font-semibold text-on-surface-variant mt-1">Acquire and export analytical store accounts, payment logs audits, and general ledgers.</p>
      </div>

      <div class="flex gap-2.5 mt-4 sm:mt-0">
        <button
          @click="handleExportReport"
          class="px-4 py-2.5 bg-primary text-on-primary font-bold text-xs rounded-lg hover:bg-opacity-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow shadow-primary/10 border-0"
        >
          <Download class="w-4 h-4" />
          <span>Export report</span>
        </button>
      </div>
    </div>

    <!-- Filters Panel -->
    <div class="bg-surface-container-lowest border border-outline-variant shadow-sm rounded-xl p-5 select-none">
      <span class="block text-[11px] font-mono font-bold text-on-surface-variant uppercase tracking-wider mb-3 px-1">Report Filters</span>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
        <!-- 1. Report Category -->
        <div class="flex flex-col gap-1.5">
          <label class="text-[10px] font-mono font-bold text-on-surface-variant uppercase tracking-wider">Report Category</label>
          <select 
            v-model="reportCategory"
            class="w-full bg-surface-container-low border border-outline-variant text-xs font-bold text-on-surface hover:bg-surface-container-high transition-colors rounded-lg px-3 py-2.5 outline-none cursor-pointer"
          >
            <option value="sales">Sales & Profits</option>
            <option value="inventory">Inventory Status</option>
            <option value="suppliers">Suppliers Overview</option>
          </select>
        </div>

        <!-- 2. Export Format -->
        <div class="flex flex-col gap-1.5">
          <label class="text-[10px] font-mono font-bold text-on-surface-variant uppercase tracking-wider">Export Format</label>
          <select 
            v-model="exportFormat"
            class="w-full bg-surface-container-low border border-outline-variant text-xs font-bold text-on-surface hover:bg-surface-container-high transition-colors rounded-lg px-3 py-2.5 outline-none cursor-pointer"
          >
            <option value="PDF">PDF Document (.pdf)</option>
            <option value="EXCEL">Excel Spreadsheet (.xlsx)</option>
            <option value="CSV">CSV Data File (.csv)</option>
          </select>
        </div>

        <!-- 3. Transaction Dates (From) -->
        <div class="flex flex-col gap-1.5">
          <label class="text-[10px] font-mono font-bold text-on-surface-variant uppercase tracking-wider">From Date</label>
          <input 
            type="date"
            v-model="fromDate"
            :disabled="reportCategory !== 'sales'"
            class="w-full bg-surface-container-low border border-outline-variant text-xs font-bold text-on-surface hover:bg-surface-container-high disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-lg px-3 py-2 outline-none"
          />
        </div>

        <!-- 4. Transaction Dates (To) -->
        <div class="flex flex-col gap-1.5">
          <label class="text-[10px] font-mono font-bold text-on-surface-variant uppercase tracking-wider">To Date</label>
          <input 
            type="date"
            v-model="toDate"
            :disabled="reportCategory !== 'sales'"
            class="w-full bg-surface-container-low border border-outline-variant text-xs font-bold text-on-surface hover:bg-surface-container-high disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-lg px-3 py-2 outline-none"
          />
        </div>

        <!-- 5. Submit Filter Button -->
        <div class="flex flex-col gap-1.5">
          <label class="hidden md:block text-[10px] font-mono font-bold text-transparent select-none uppercase tracking-wider">Submit</label>
          <button 
            @click="applyFilters"
            class="w-full py-2.5 bg-primary text-on-primary font-bold text-xs rounded-lg hover:bg-opacity-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow border-0 text-white"
          >
            <Activity class="w-4 h-4" />
            <span>Apply Filters</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Reports sidebar taxonomy selection and KPI grids -->
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
      
      <!-- Left Column Sidebar Selector (Only for Sales Category) -->
      <div 
        v-if="reportCategory === 'sales'" 
        class="bg-surface-container-lowest border border-outline-variant shadow-md rounded-xl p-5 md:p-6 flex flex-col gap-3 md:col-span-1 select-none"
      >
        <span class="block text-[11px] font-mono font-bold text-on-surface-variant uppercase tracking-wider mb-2 px-2.5">Sales Section</span>
        
        <button 
          @click="reportType = 'sales'"
          class="text-left text-sm px-4.5 py-3 h-11 rounded-lg flex items-center gap-3 transition-all cursor-pointer font-bold border-0"
          :class="reportType === 'sales' 
            ? 'bg-primary-container text-on-primary-container translate-x-1 shadow-xs' 
            : 'text-on-surface-variant hover:bg-surface-container bg-transparent'"
        >
          <TrendingUp class="w-5 h-5 shrink-0" />
          <span>Sales & Profits</span>
        </button>

        <button 
          @click="reportType = 'payments'"
          class="text-left text-sm px-4.5 py-3 h-11 rounded-lg flex items-center gap-3 transition-all cursor-pointer font-bold border-0"
          :class="reportType === 'payments' 
            ? 'bg-primary-container text-on-primary-container translate-x-1 shadow-xs' 
            : 'text-on-surface-variant hover:bg-surface-container bg-transparent'"
        >
          <Coins class="w-5 h-5 shrink-0" />
          <span>Payment Channels</span>
        </button>

        <button 
          @click="reportType = 'audit'"
          class="text-left text-sm px-4.5 py-3 h-11 rounded-lg flex items-center gap-3 transition-all cursor-pointer font-bold border-0"
          :class="reportType === 'audit' 
            ? 'bg-primary-container text-on-primary-container translate-x-1 shadow-xs' 
            : 'text-on-surface-variant hover:bg-surface-container bg-transparent'"
        >
          <Activity class="w-5 h-5 shrink-0" />
          <span>Audit Trail Logs</span>
        </button>
      </div>

      <!-- Right Main Container (KPIs + list) -->
      <div 
        :class="reportCategory === 'sales' ? 'lg:col-span-3' : 'lg:col-span-4'" 
        class="space-y-6"
      >
        
        <!-- SALES REPORT CATEGORY CONTENT -->
        <template v-if="reportCategory === 'sales'">
          <!-- Quick Metrics (3 columns) -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
            
            <div class="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant shadow-sm select-none relative overflow-hidden">
              <div class="flex justify-between items-start">
                <div>
                  <span class="text-[10px] font-mono font-bold uppercase tracking-widest text-on-surface-variant">Aggregate Invoice Revenue</span>
                  <p class="text-2xl font-black font-mono text-primary leading-tight mt-1">{{ formatCurrency(totalInvoiced, currency) }}</p>
                </div>
                <Coins class="w-5 h-5 text-primary/70 shrink-0" />
              </div>
              <div class="text-[10px] text-on-surface-variant/80 font-semibold mt-2">Before store concessions and loyalty awards</div>
            </div>

            <div class="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant shadow-sm select-none relative overflow-hidden">
              <div class="flex justify-between items-start">
                <div>
                  <span class="text-[10px] font-mono font-bold uppercase tracking-widest text-on-surface-variant">Concessions (Discounts)</span>
                  <p class="text-2xl font-black font-mono text-tertiary leading-tight mt-1">-{{ formatCurrency(totalDiscount, currency) }}</p>
                </div>
                <Sparkles class="w-5 h-5 text-tertiary/70 shrink-0" />
              </div>
              <div class="text-[10px] text-tertiary/90 font-semibold mt-2">Consolidated active retail discount codes</div>
            </div>

            <div class="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant shadow-sm select-none relative overflow-hidden">
              <div class="flex justify-between items-start">
                <div>
                  <span class="text-[10px] font-mono font-bold uppercase tracking-widest text-on-surface-variant">Tax Liability (18% VAT)</span>
                  <p class="text-2xl font-black font-mono text-on-surface leading-tight mt-1">{{ formatCurrency(totalTax, currency) }}</p>
                </div>
                <FileText class="w-5 h-5 text-outline/70 shrink-0" />
              </div>
              <div class="text-[10px] text-on-surface-variant/80 font-semibold mt-2">E-Invoicing VAT returns liability ledger</div>
            </div>

          </div>

          <!-- MAIN GRAPH/TABLE LEDGER FOR SALES -->
          <div v-if="reportType === 'sales'" class="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm flex flex-col overflow-hidden">
            <div class="p-4 bg-surface-container-low border-b border-outline-variant select-none">
              <span class="text-xs font-mono font-bold uppercase tracking-wide text-on-surface-variant">
                Timeframe: {{ fromDate || 'Start' }} to {{ toDate || 'Today' }} / Closed Registers Ledger
              </span>
            </div>

            <!-- Transactions History Table -->
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs select-none">
                <thead class="bg-[#f0f3f0] text-[10px] font-mono uppercase font-bold text-on-surface-variant border-b border-outline-variant select-none">
                  <tr>
                    <th class="p-4 pl-6">Reference No.</th>
                    <th class="p-4">Timestamp</th>
                    <th class="p-4">Payment Method</th>
                    <th class="p-4 text-right">Invoice Sum</th>
                    <th class="p-4 text-right">Tax VAT</th>
                    <th class="p-4 text-right">Discount</th>
                    <th class="p-4">Ref Code</th>
                    <th class="p-4 text-center pr-6">Status</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-surface-variant">
                  <tr 
                    v-for="txn in resolvedHistory" 
                    :key="txn.id" 
                    @click="handleRowClick(txn)"
                    class="hover:bg-surface-container-high/60 transition-all font-sans text-sm cursor-pointer"
                  >
                    <td class="p-4 pl-6 select-all font-bold text-on-surface">{{ txn.id }}</td>
                    <td class="p-4 font-mono text-xs text-on-surface-variant">{{ txn.date }}</td>
                    <td class="p-4 font-semibold text-on-surface">{{ txn.paymentMethod }}</td>
                    <td class="p-4 text-right font-mono font-black text-primary">{{ formatCurrency(txn.total, currency) }}</td>
                    <td class="p-4 text-right font-mono text-on-surface-variant">{{ formatCurrency(txn.tax, currency) }}</td>
                    <td class="p-4 text-right font-mono text-tertiary">-{{ formatCurrency(txn.discount, currency) }}</td>
                    <td class="p-4 font-mono text-xs text-outline select-all">{{ txn.refCode || 'N/A' }}</td>
                    <td class="p-4 text-center pr-6">
                      <span class="inline-flex items-center gap-1.5 px-2 bg-primary-container/25 text-primary text-[10px] font-bold rounded-full border border-primary/20">
                        <span class="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                        SUCCESS
                      </span>
                    </td>
                  </tr>
                  <tr v-if="resolvedHistory.length === 0">
                    <td colspan="8" class="p-8 text-center text-on-surface-variant font-medium">
                      No sales transactions found for this date range.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- PAYMENT CHANNELS REPORT -->
          <div v-else-if="reportType === 'payments'" class="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-6 space-y-6">
            <h3 class="text-md font-bold text-on-surface">Invoice collections by Gateway</h3>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 select-none">
              <!-- Cash totals -->
              <div class="bg-surface-container p-4 rounded-xl border border-outline-variant">
                <div class="flex justify-between items-center mb-2">
                  <span class="text-xs font-mono font-semibold text-on-surface-variant uppercase">Cash register drawer</span>
                  <Coins class="w-5 h-5 text-primary" />
                </div>
                <p class="text-xl font-bold font-mono text-on-surface">
                  {{ formatCurrency(totalByMethod('Cash'), currency) }}
                </p>
                <p class="text-[10px] text-outline mt-1 font-semibold">Verified drawer reconciliation</p>
              </div>

              <!-- M-PESA totals -->
              <div class="bg-surface-container p-4 rounded-xl border border-outline-variant">
                <div class="flex justify-between items-center mb-2">
                  <span class="text-xs font-mono font-semibold text-on-surface-variant uppercase">M-Pesa Mobile money</span>
                  <Sparkles class="w-5 h-5 text-primary" />
                </div>
                <p class="text-xl font-bold font-mono text-on-surface">
                  {{ formatCurrency(totalByMethod('M-Pesa'), currency) }}
                </p>
                <p class="text-[10px] text-outline mt-1 font-semibold">Secured automated webhook confirmation</p>
              </div>

              <!-- Card terminal -->
              <div class="bg-surface-container p-4 rounded-xl border border-outline-variant">
                <div class="flex justify-between items-center mb-2">
                  <span class="text-xs font-mono font-semibold text-on-surface-variant uppercase">Integrated POS Card</span>
                  <DollarSign class="w-5 h-5 text-primary" />
                </div>
                <p class="text-xl font-bold font-mono text-on-surface">
                  {{ formatCurrency(totalByMethod('Card'), currency) }}
                </p>
                <p class="text-[10px] text-outline mt-1 font-semibold">Consolidated VISA/Mastercard terminal</p>
              </div>
            </div>
          </div>

          <!-- AUDIT TRAIL DATA -->
          <div v-else-if="reportType === 'audit'" class="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-6 select-none leading-relaxed">
            <h3 class="text-md font-bold text-on-surface mb-4">Secured Audit Log Trail</h3>
            
            <div class="p-8 text-center text-on-surface-variant font-medium text-sm flex flex-col items-center justify-center">
              <FileText class="w-8 h-8 text-outline-variant mb-2 animate-pulse" />
              <p>Audit trail logs are recorded securely in the database.</p>
              <p class="text-xs text-outline mt-1">Contact your system administrator for complete audit history exports.</p>
            </div>
          </div>
        </template>

        <!-- INVENTORY REPORT CATEGORY CONTENT -->
        <template v-else-if="reportCategory === 'inventory'">
          <!-- Quick Metrics (3 columns) -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
            
            <div class="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant shadow-sm select-none relative overflow-hidden">
              <div class="flex justify-between items-start">
                <div>
                  <span class="text-[10px] font-mono font-bold uppercase tracking-widest text-on-surface-variant">Total Stock Units</span>
                  <p class="text-2xl font-black font-mono text-primary leading-tight mt-1">{{ totalInventoryItems }}</p>
                </div>
                <Package class="w-5 h-5 text-primary/70 shrink-0" />
              </div>
              <div class="text-[10px] text-on-surface-variant/80 font-semibold mt-2">Total quantity of products across all categories</div>
            </div>

            <div class="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant shadow-sm select-none relative overflow-hidden">
              <div class="flex justify-between items-start">
                <div>
                  <span class="text-[10px] font-mono font-bold uppercase tracking-widest text-on-surface-variant">Low Stock items</span>
                  <p class="text-2xl font-black font-mono text-tertiary leading-tight mt-1">{{ lowStockItemsCount }}</p>
                </div>
                <AlertTriangle class="w-5 h-5 text-tertiary/70 shrink-0" />
              </div>
              <div class="text-[10px] text-tertiary/90 font-semibold mt-2">Products below safety or reorder threshold</div>
            </div>

            <div class="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant shadow-sm select-none relative overflow-hidden">
              <div class="flex justify-between items-start">
                <div>
                  <span class="text-[10px] font-mono font-bold uppercase tracking-widest text-on-surface-variant">Inventory Valuation</span>
                  <p class="text-2xl font-black font-mono text-on-surface leading-tight mt-1">{{ formatCurrency(totalInventoryValuation, currency) }}</p>
                </div>
                <TrendingUp class="w-5 h-5 text-outline/70 shrink-0" />
              </div>
              <div class="text-[10px] text-on-surface-variant/80 font-semibold mt-2">Total value based on retail selling price</div>
            </div>

          </div>

          <!-- Inventory Table -->
          <div class="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm flex flex-col overflow-hidden">
            <div class="p-4 bg-surface-container-low border-b border-outline-variant select-none">
              <span class="text-xs font-mono font-bold uppercase tracking-wide text-on-surface-variant">Current Inventory Valuation Ledger</span>
            </div>
            
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs select-none">
                <thead class="bg-[#f0f3f0] text-[10px] font-mono uppercase font-bold text-on-surface-variant border-b border-outline-variant select-none">
                  <tr>
                    <th class="p-4 pl-6">Product Details</th>
                    <th class="p-4">Category</th>
                    <th class="p-4 text-center">Stock Level</th>
                    <th class="p-4 text-right">Cost Price</th>
                    <th class="p-4 text-right">Selling Price</th>
                    <th class="p-4 text-right">Stock Value</th>
                    <th class="p-4 text-center pr-6">Status</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-surface-variant">
                  <tr 
                    v-for="p in productsList" 
                    :key="p.id" 
                    class="hover:bg-surface-container-high/60 transition-all font-sans text-sm"
                  >
                    <td class="p-4 pl-6">
                      <span class="font-bold text-on-surface block">{{ p.name }}</span>
                      <span class="font-mono text-[10px] text-on-surface-variant/60 block mt-0.5">{{ p.barcode || 'NO BARCODE' }}</span>
                    </td>
                    <td class="p-4 font-semibold text-on-surface-variant">{{ p.category }}</td>
                    <td class="p-4 text-center font-mono font-bold" :class="p.stock <= p.minStock ? 'text-tertiary' : 'text-on-surface'">
                      {{ p.stock }} <span class="text-[10px] text-outline font-normal">/ {{ p.minStock }}</span>
                    </td>
                    <td class="p-4 text-right font-mono">{{ formatCurrency(p.cost, currency) }}</td>
                    <td class="p-4 text-right font-mono font-black text-primary">{{ formatCurrency(p.price, currency) }}</td>
                    <td class="p-4 text-right font-mono font-bold text-on-surface">{{ formatCurrency(p.stock * p.price, currency) }}</td>
                    <td class="p-4 text-center pr-6">
                      <span 
                        v-if="p.stock === 0"
                        class="inline-flex items-center gap-1.5 px-2 bg-tertiary/10 text-tertiary text-[10px] font-bold rounded-full border border-tertiary/20"
                      >
                        OUT OF STOCK
                      </span>
                      <span 
                        v-else-if="p.stock <= p.minStock"
                        class="inline-flex items-center gap-1.5 px-2 bg-amber-500/10 text-amber-600 text-[10px] font-bold rounded-full border border-amber-500/20"
                      >
                        LOW STOCK
                      </span>
                      <span 
                        v-else
                        class="inline-flex items-center gap-1.5 px-2 bg-primary-container/25 text-primary text-[10px] font-bold rounded-full border border-primary/20"
                      >
                        IN STOCK
                      </span>
                    </td>
                  </tr>
                  <tr v-if="productsList.length === 0">
                    <td colspan="7" class="p-8 text-center text-on-surface-variant font-medium">
                      No products found in the catalog.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </template>

        <!-- SUPPLIERS REPORT CATEGORY CONTENT -->
        <template v-else-if="reportCategory === 'suppliers'">
          <!-- Quick Metrics (3 columns) -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
            
            <div class="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant shadow-sm select-none relative overflow-hidden">
              <div class="flex justify-between items-start">
                <div>
                  <span class="text-[10px] font-mono font-bold uppercase tracking-widest text-on-surface-variant">Total Suppliers</span>
                  <p class="text-2xl font-black font-mono text-primary leading-tight mt-1">{{ totalSuppliers }}</p>
                </div>
                <Users class="w-5 h-5 text-primary/70 shrink-0" />
              </div>
              <div class="text-[10px] text-on-surface-variant/80 font-semibold mt-2">Total registered merchant profiles</div>
            </div>

            <div class="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant shadow-sm select-none relative overflow-hidden">
              <div class="flex justify-between items-start">
                <div>
                  <span class="text-[10px] font-mono font-bold uppercase tracking-widest text-on-surface-variant">Active Accounts</span>
                  <p class="text-2xl font-black font-mono text-primary leading-tight mt-1">{{ activeSuppliers }}</p>
                </div>
                <UserCheck class="w-5 h-5 text-primary/70 shrink-0" />
              </div>
              <div class="text-[10px] text-primary/80 font-semibold mt-2">Active vendor supply channels</div>
            </div>

            <div class="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant shadow-sm select-none relative overflow-hidden">
              <div class="flex justify-between items-start">
                <div>
                  <span class="text-[10px] font-mono font-bold uppercase tracking-widest text-on-surface-variant">Outstanding Liabilities</span>
                  <p class="text-2xl font-black font-mono text-tertiary leading-tight mt-1">{{ formatCurrency(totalOutstandingBalance, currency) }}</p>
                </div>
                <CreditCard class="w-5 h-5 text-tertiary/70 shrink-0" />
              </div>
              <div class="text-[10px] text-tertiary/95 font-semibold mt-2">Total payables accrued due to supplier orders</div>
            </div>

          </div>

          <!-- Suppliers Table -->
          <div class="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm flex flex-col overflow-hidden">
            <div class="p-4 bg-surface-container-low border-b border-outline-variant select-none">
              <span class="text-xs font-mono font-bold uppercase tracking-wide text-on-surface-variant">Consolidated Supplier Payables Ledger</span>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs select-none">
                <thead class="bg-[#f0f3f0] text-[10px] font-mono uppercase font-bold text-on-surface-variant border-b border-outline-variant select-none">
                  <tr>
                    <th class="p-4 pl-6">Supplier Details</th>
                    <th class="p-4">Contact Person</th>
                    <th class="p-4">Contact Details</th>
                    <th class="p-4">Category</th>
                    <th class="p-4 text-right">Outstanding Balance</th>
                    <th class="p-4 text-center pr-6">Status</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-surface-variant">
                  <tr 
                    v-for="s in suppliersList" 
                    :key="s.id" 
                    class="hover:bg-surface-container-high/60 transition-all font-sans text-sm"
                  >
                    <td class="p-4 pl-6">
                      <span class="font-bold text-on-surface block">{{ s.name }}</span>
                      <span class="font-mono text-[10px] text-on-surface-variant/60 block mt-0.5">{{ s.code }}</span>
                    </td>
                    <td class="p-4 font-semibold text-on-surface">{{ s.contactPerson }}</td>
                    <td class="p-4">
                      <p class="font-semibold text-on-surface font-mono text-xs">{{ s.phone }}</p>
                      <p class="text-[11px] text-on-surface-variant/70 mt-0.5 font-mono">{{ s.email }}</p>
                    </td>
                    <td class="p-4">
                      <span class="inline-flex items-center px-2 py-0.5 bg-surface-container-high text-on-surface text-[10px] font-bold rounded-full border border-outline-variant">
                        {{ s.category }}
                      </span>
                    </td>
                    <td class="p-4 text-right font-mono font-black" :class="s.balance > 0 ? 'text-tertiary' : 'text-on-surface'">
                      {{ formatCurrency(s.balance, currency) }}
                    </td>
                    <td class="p-4 text-center pr-6">
                      <span 
                        v-if="s.status === 'Active'"
                        class="inline-flex items-center gap-1.5 px-2 bg-primary-container/25 text-primary text-[10px] font-bold rounded-full border border-primary/20"
                      >
                        <span class="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                        ACTIVE
                      </span>
                      <span 
                        v-else
                        class="inline-flex items-center gap-1.5 px-2 bg-surface-container-high text-on-surface-variant text-[10px] font-bold rounded-full border border-outline-variant"
                      >
                        INACTIVE
                      </span>
                    </td>
                  </tr>
                  <tr v-if="suppliersList.length === 0">
                    <td colspan="6" class="p-8 text-center text-on-surface-variant font-medium">
                      No suppliers found in registry.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </template>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAppViewModel } from '../viewmodels/useAppViewModel';
import { formatCurrency } from '../models/mockData';
import { showToast } from '../services/toastService';
import type { Transaction } from '../models/types';
import { 
  TrendingUp, 
  Activity, 
  Download, 
  Coins,
  Sparkles,
  DollarSign,
  FileText,
  Package,
  AlertTriangle,
  Users,
  UserCheck,
  CreditCard
} from 'lucide-vue-next';

const vm = useAppViewModel();
const router = useRouter();

const getTodayString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatSoldItems = (txn: Transaction) => {
  if (!txn.items || txn.items.length === 0) return 'No items';
  return txn.items.map(item => `${item.product?.name || 'Product'} (x${item.quantity})`).join(', ');
};

// Active Filters state
const reportCategory = ref<'sales' | 'inventory' | 'suppliers'>('sales');
const exportFormat = ref<'PDF' | 'EXCEL' | 'CSV'>('PDF');
const fromDate = ref(getTodayString());
const toDate = ref(getTodayString());

// Sidebar layout state for Sales
const reportType = ref<'sales' | 'payments' | 'audit'>('sales');

const transactionsHistory = computed(() => vm.transactionsHistory.value);
const currency = computed(() => vm.settings.value.currency);

const applyFilters = () => {
  if (reportCategory.value === 'sales') {
    vm.fetchSalesHistory(fromDate.value, toDate.value);
  } else if (reportCategory.value === 'inventory') {
    vm.fetchProducts();
  } else if (reportCategory.value === 'suppliers') {
    vm.fetchSuppliers();
  }
};

onMounted(() => {
  applyFilters();
});

watch(reportCategory, () => {
  applyFilters();
});

// Dynamic filtering for Sales report
const filteredTransactions = computed(() => {
  let list = transactionsHistory.value;
  if (fromDate.value) {
    list = list.filter(t => t.date >= fromDate.value);
  }
  if (toDate.value) {
    list = list.filter(t => t.date <= toDate.value);
  }
  return list;
});

const resolvedHistory = computed(() => {
  return filteredTransactions.value;
});

// Sales quick metrics recalculation
const totalInvoiced = computed(() => {
  return filteredTransactions.value.reduce((acc, t) => acc + t.total, 0);
});

const totalDiscount = computed(() => {
  return filteredTransactions.value.reduce((acc, t) => acc + t.discount, 0);
});

const totalTax = computed(() => {
  return filteredTransactions.value.reduce((acc, t) => acc + t.tax, 0);
});

const totalByMethod = (method: 'Cash' | 'Card' | 'M-Pesa') => {
  return filteredTransactions.value
    .filter(t => t.paymentMethod === method)
    .reduce((acc, t) => acc + t.total, 0);
};

// Inventory report computed fields
const productsList = computed(() => vm.products.value);

const totalInventoryItems = computed(() => {
  return productsList.value.reduce((acc, p) => acc + p.stock, 0);
});

const lowStockItemsCount = computed(() => {
  return productsList.value.filter(p => p.stock > 0 && p.stock <= p.minStock).length;
});

const totalInventoryValuation = computed(() => {
  return productsList.value.reduce((acc, p) => acc + (p.stock * p.price), 0);
});

// Suppliers report computed fields
const suppliersList = computed(() => vm.suppliers.value);

const totalSuppliers = computed(() => suppliersList.value.length);

const activeSuppliers = computed(() => {
  return suppliersList.value.filter(s => s.status === 'Active').length;
});

const totalOutstandingBalance = computed(() => {
  return suppliersList.value.reduce((acc, s) => acc + s.balance, 0);
});

// Refactored Export Report Trigger
const exportToCSV = (headers: string[], rows: any[][], filename: string) => {
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
};

const exportToExcelHtml = (title: string, metadata: string, kpis: { label: string, value: string }[], headers: string[], rows: any[][], filename: string) => {
  const kpisHtml = kpis.map(k => `
    <td colspan="2" style="background-color: #f8fafc; border: 1px solid #cbd5e1; padding: 10px; text-align: center;">
      <span style="font-size: 9px; color: #64748b; text-transform: uppercase; font-weight: bold; display: block;">${k.label}</span><br>
      <span style="font-size: 14px; font-weight: bold; color: #0f172a; font-family: monospace;">${k.value}</span>
    </td>
  `).join('<td style="width: 20px; border: none;"></td>'); // spacers

  const tableHeadersHtml = headers.map(h => `
    <th style="background-color: #f1f5f9; color: #475569; font-weight: bold; border: 1px solid #cbd5e1; padding: 8px; text-transform: uppercase; font-size: 10px; text-align: left;">${h}</th>
  `).join('');

  const tableRowsHtml = rows.map((row, idx) => `
    <tr style="background-color: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'}">
      ${row.map(val => `
        <td style="border: 1px solid #e2e8f0; padding: 8px; font-size: 10px; color: #334155;">${val}</td>
      `).join('')}
    </tr>
  `).join('');

  const html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: sans-serif; }
      </style>
    <\/head>
    <body>
      <table style="border: none;">
        <tr>
          <td colspan="4" style="font-size: 18px; font-weight: bold; color: #F4511E;">Jenga Store Analytics</td>
        </tr>
        <tr>
          <td colspan="4" style="font-size: 10px; color: #64748b;">
            Store: ${vm.settings.value.name} | TIN: ${vm.settings.value.tin || 'N/A'}<br>
            Address: ${vm.settings.value.physicalAddress || 'N/A'}
          </td>
        </tr>
        <tr style="height: 20px;"><td colspan="4"></td></tr>
        <tr>
          <td colspan="4" style="font-size: 14px; font-weight: bold; color: #0f172a;">${title}</td>
        </tr>
        <tr>
          <td colspan="4" style="font-size: 10px; color: #64748b;">${metadata}</td>
        </tr>
        <tr style="height: 20px;"><td colspan="4"></td></tr>
      </table>

      <!-- KPIs Summary -->
      <table style="border: none; margin-bottom: 20px;">
        <tr>
          ${kpisHtml}
        </tr>
      </table>

      <table style="border-collapse: collapse; width: 100%;">
        <thead>
          <tr>${tableHeadersHtml}</tr>
        </thead>
        <tbody>
          ${tableRowsHtml}
        </tbody>
      </table>

      <br>
      <span style="font-size: 8px; color: #94a3b8;">Generated via Jenga Analytical reporting on ${new Date().toLocaleString()}</span>
    <\/body>
    <\/html>
  `;

  const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
};

const exportToPDF = (title: string, metadata: string, kpis: { label: string, value: string }[], headers: string[], rows: any[][]) => {
  // Create a hidden iframe for printing
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const kpisHtml = kpis.map(k => `
    <div class="kpi-card">
      <div class="kpi-label">${k.label}</div>
      <div class="kpi-value">${k.value}</div>
    </div>
  `).join('');

  const tableHeadersHtml = headers.map(h => `<th>${h}</th>`).join('');
  const tableRowsHtml = rows.map(row => `
    <tr>
      ${row.map(val => `<td>${val}</td>`).join('')}
    </tr>
  `).join('');

  const html = `
    <html>
      <head>
        <title>${title}</title>
        <style>
          @page { size: A4; margin: 15mm; }
          body { font-family: 'Inter', system-ui, -apple-system, sans-serif; color: #1e293b; margin: 0; padding: 0; font-size: 11px; line-height: 1.5; }
          .header-container { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #e2e8f0; padding-bottom: 15px; margin-bottom: 20px; }
          .logo-area { font-weight: 900; font-size: 18px; color: #F4511E; letter-spacing: -0.5px; }
          .store-info { text-align: right; font-size: 10px; color: #64748b; line-height: 1.4; }
          .report-title { font-size: 16px; font-weight: 800; text-transform: uppercase; color: #0f172a; margin-top: 0; margin-bottom: 5px; }
          .report-meta { font-size: 10px; color: #64748b; margin-bottom: 25px; }
          
          .kpi-container { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 25px; }
          .kpi-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; }
          .kpi-label { font-size: 9px; font-weight: bold; text-transform: uppercase; color: #64748b; margin-bottom: 4px; letter-spacing: 0.5px; }
          .kpi-value { font-size: 15px; font-weight: 800; color: #0f172a; font-family: monospace; }
          
          table { width: 100%; border-collapse: collapse; margin-top: 10px; page-break-inside: auto; }
          tr { page-break-inside: avoid; page-break-after: auto; }
          th { background: #f1f5f9; text-align: left; font-weight: bold; color: #475569; border-bottom: 2px solid #cbd5e1; padding: 8px 10px; font-size: 9px; text-transform: uppercase; }
          td { border-bottom: 1px solid #e2e8f0; padding: 8px 10px; font-size: 10px; color: #334155; }
          tr:nth-child(even) { background-color: #f8fafc; }
          
          .text-right { text-align: right; }
          .text-center { text-align: center; }
          .font-mono { font-family: monospace; }
          .font-bold { font-weight: bold; }
          
          .footer { position: fixed; bottom: 0; left: 0; right: 0; border-top: 1px solid #e2e8f0; padding-top: 10px; font-size: 8px; color: #94a3b8; display: flex; justify-content: space-between; }
        </style>
      <\/head>
      <body>
        <div class="header-container">
          <div>
            <div class="logo-area">Jenga POS</div>
            <div class="store-info" style="text-align: left; margin-top: 5px;">
              TIN: ${vm.settings.value.tin || 'N/A'}<br>
              Tel: ${vm.settings.value.phone || 'N/A'}
            </div>
          </div>
          <div class="store-info">
            <strong>${vm.settings.value.name}</strong><br>
            ${vm.settings.value.physicalAddress || 'N/A'}<br>
            ${vm.settings.value.email || 'N/A'}
          </div>
        </div>

        <h1 class="report-title">${title}</h1>
        <div class="report-meta">${metadata}</div>

        <div class="kpi-container">
          ${kpisHtml}
        </div>

        <table>
          <thead>
            <tr>${tableHeadersHtml}</tr>
          </thead>
          <tbody>
            ${tableRowsHtml}
          </tbody>
        </table>

        <div class="footer">
          <span>Generated via Jenga Analytical Reporting on ${new Date().toLocaleString()}</span>
          <span>Page 1 of 1</span>
        </div>
      <\/body>
    <\/html>
  `;

  const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!iframeDoc) {
    showToast('Failed to initialize print frame.', 'error');
    document.body.removeChild(iframe);
    return;
  }

  iframeDoc.write(html);
  iframeDoc.close();

  // Wait a short moment to ensure styling/rendering completes in the iframe
  setTimeout(() => {
    if (iframe.contentWindow) {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    }
    // Clean up frame
    document.body.removeChild(iframe);
  }, 300);
};

const handleExportReport = () => {
  let title = '';
  let metadata = '';
  let filename = '';
  
  let headers: string[] = [];
  let rows: any[][] = [];
  let kpis: { label: string, value: string }[] = [];

  const dateStr = new Date().toISOString().split('T')[0];

  if (reportCategory.value === 'sales') {
    title = 'Sales & Profits Report';
    const dateRangeStr = (fromDate.value || toDate.value) 
      ? `Date Range: ${fromDate.value || 'Start'} to ${toDate.value || 'Today'}` 
      : 'All Time';
    metadata = `${dateRangeStr} | Generated by Sarah K.`;
    filename = `JENGA-SALES-REPORT-${dateStr}`;

    headers = ['Sold Items', 'Timestamp', 'Payment Method', 'Invoice Sum', 'Tax VAT', 'Discount', 'Ref Code', 'Status'];
    rows = resolvedHistory.value.map(t => [
      formatSoldItems(t),
      t.date,
      t.paymentMethod,
      formatCurrency(t.total, currency.value),
      formatCurrency(t.tax, currency.value),
      `-${formatCurrency(t.discount, currency.value)}`,
      t.refCode || 'N/A',
      'SUCCESS'
    ]);

    kpis = [
      { label: 'Aggregate Invoice Revenue', value: formatCurrency(totalInvoiced.value, currency.value) },
      { label: 'Concessions (Discounts)', value: `-${formatCurrency(totalDiscount.value, currency.value)}` },
      { label: 'Tax Liability (18% VAT)', value: formatCurrency(totalTax.value, currency.value) }
    ];

  } else if (reportCategory.value === 'inventory') {
    title = 'Inventory Valuation Status Report';
    metadata = `Current Catalog Snapshot | Generated by Sarah K.`;
    filename = `JENGA-INVENTORY-REPORT-${dateStr}`;

    headers = ['Barcode', 'Product Name', 'Category', 'Stock Level', 'Min Reorder Level', 'Cost Price', 'Selling Price', 'Valuation', 'Status'];
    rows = productsList.value.map(p => [
      p.barcode || 'N/A',
      p.name,
      p.category,
      p.stock,
      p.minStock,
      formatCurrency(p.cost, currency.value),
      formatCurrency(p.price, currency.value),
      formatCurrency(p.stock * p.price, currency.value),
      p.stock === 0 ? 'OUT OF STOCK' : (p.stock <= p.minStock ? 'LOW STOCK' : 'IN STOCK')
    ]);

    kpis = [
      { label: 'Total Stock Units', value: String(totalInventoryItems.value) },
      { label: 'Low Stock Items', value: String(lowStockItemsCount.value) },
      { label: 'Inventory Valuation', value: formatCurrency(totalInventoryValuation.value, currency.value) }
    ];

  } else if (reportCategory.value === 'suppliers') {
    title = 'Supplier Payables Ledger Report';
    metadata = `Active Vendor Accounts Snapshot | Generated by Sarah K.`;
    filename = `JENGA-SUPPLIERS-REPORT-${dateStr}`;

    headers = ['Supplier Code', 'Name', 'Contact Person', 'Phone', 'Email', 'Category', 'Outstanding Balance', 'Status'];
    rows = suppliersList.value.map(s => [
      s.code,
      s.name,
      s.contactPerson,
      s.phone,
      s.email,
      s.category,
      formatCurrency(s.balance, currency.value),
      s.status.toUpperCase()
    ]);

    kpis = [
      { label: 'Total Suppliers', value: String(totalSuppliers.value) },
      { label: 'Active Accounts', value: String(activeSuppliers.value) },
      { label: 'Outstanding Liabilities', value: formatCurrency(totalOutstandingBalance.value, currency.value) }
    ];
  }

  const format = exportFormat.value;
  if (format === 'PDF') {
    exportToPDF(title, metadata, kpis, headers, rows);
  } else if (format === 'EXCEL') {
    exportToExcelHtml(title, metadata, kpis, headers, rows, `${filename}.xls`);
  } else if (format === 'CSV') {
    exportToCSV(headers, rows, `${filename}.csv`);
  }
};

const handleRowClick = (txn: any) => {
  console.log('ReportsView - Row clicked. txn:', txn);
  vm.lastTransaction.value = txn;
  console.log('ReportsView - vm.lastTransaction.value set to:', vm.lastTransaction.value);
  router.push('/receipt');
};
</script>
