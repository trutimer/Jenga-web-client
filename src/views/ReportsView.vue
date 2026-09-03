<template>
  <div class="max-w-7xl mx-auto space-y-6 pb-20 animate-fade-up font-sans select-none">
    
    <!-- Header element -->
    <div class="flex flex-col sm:flex-row justify-between sm:items-end mb-2">
      <div>
        <h2 class="text-3xl font-black text-on-background tracking-tight">{{ $t('reports.title') }}</h2>
        <p class="text-sm font-semibold text-on-surface-variant mt-1">{{ $t('reports.subtitle') }}</p>
      </div>

      <div class="flex gap-2.5 mt-4 sm:mt-0">
        <button
          v-if="vm.hasPermission('reports:export')"
          @click="handleExportReport"
          class="px-4 py-2.5 bg-primary text-on-primary font-bold text-xs rounded-lg hover:bg-opacity-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow shadow-primary/10 border-0"
        >
          <Download class="w-4 h-4" />
          <span>{{ $t('reports.exportReport') }}</span>
        </button>
      </div>
    </div>

    <!-- Filters Panel -->
    <div class="bg-surface-container-lowest border border-outline-variant shadow-sm rounded-xl p-5 select-none">
      <span class="block text-[11px] font-mono font-bold text-on-surface-variant uppercase tracking-wider mb-3 px-1">{{ $t('reports.reportFilters') }}</span>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-4">
        <!-- 1. Report Category -->
        <div class="flex flex-col gap-1.5">
          <label class="text-[10px] font-mono font-bold text-on-surface-variant uppercase tracking-wider">{{ $t('reports.reportCategory') }}</label>
          <select 
            v-model="reportCategory"
            class="w-full bg-surface-container-low border border-outline-variant text-xs font-bold text-on-surface hover:bg-surface-container-high transition-colors rounded-lg px-3 py-2.5 outline-none cursor-pointer"
          >
            <option value="sales">{{ $t('reports.salesOperations') }}</option>
            <option value="inventory">{{ $t('reports.inventoryStatus') }}</option>
            <option value="suppliers">{{ $t('reports.suppliersOverview') }}</option>
          </select>
        </div>

        <!-- 2. Export Format -->
        <div class="flex flex-col gap-1.5">
          <label class="text-[10px] font-mono font-bold text-on-surface-variant uppercase tracking-wider">{{ $t('reports.exportFormat') }}</label>
          <select 
            v-model="exportFormat"
            class="w-full bg-surface-container-low border border-outline-variant text-xs font-bold text-on-surface hover:bg-surface-container-high transition-colors rounded-lg px-3 py-2.5 outline-none cursor-pointer"
          >
            <option value="PDF">{{ $t('reports.pdfDocument') }}</option>
            <option value="EXCEL">{{ $t('reports.excelSpreadsheet') }}</option>
            <option value="CSV">{{ $t('reports.csvDataFile') }}</option>
          </select>
        </div>

        <!-- 3. Transaction Dates (From) -->
        <div class="flex flex-col gap-1.5">
          <label class="text-[10px] font-mono font-bold text-on-surface-variant uppercase tracking-wider">{{ $t('reports.fromDate') }}</label>
          <input 
            type="date"
            v-model="fromDate"
            :disabled="reportCategory !== 'sales' && !(reportCategory === 'inventory' && inventoryReportType === 'restock')"
            class="w-full bg-surface-container-low border border-outline-variant text-xs font-bold text-on-surface hover:bg-surface-container-high disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-lg px-3 py-2 outline-none"
          />
        </div>

        <!-- 4. Transaction Dates (To) -->
        <div class="flex flex-col gap-1.5">
          <label class="text-[10px] font-mono font-bold text-on-surface-variant uppercase tracking-wider">{{ $t('reports.toDate') }}</label>
          <input 
            type="date"
            v-model="toDate"
            :disabled="reportCategory !== 'sales' && !(reportCategory === 'inventory' && inventoryReportType === 'restock')"
            class="w-full bg-surface-container-low border border-outline-variant text-xs font-bold text-on-surface hover:bg-surface-container-high disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-lg px-3 py-2 outline-none"
          />
        </div>

        <!-- 5a. Sale Status Filter (Sales category only) -->
        <div class="flex flex-col gap-1.5" v-if="reportCategory === 'sales'">
          <label class="text-[10px] font-mono font-bold text-on-surface-variant uppercase tracking-wider">{{ $t('reports.saleStatus') }}</label>
          <select 
            v-model="statusFilter"
            class="w-full bg-surface-container-low border border-outline-variant text-xs font-bold text-on-surface hover:bg-surface-container-high transition-colors rounded-lg px-3 py-2.5 outline-none cursor-pointer"
          >
            <option value="ALL">{{ $t('customers.allStatus') }}</option>
            <option value="PAID">{{ $t('checkout.paid') }}</option>
            <option value="UNPAID">{{ $t('checkout.unpaid') }}</option>
            <option value="VOID">{{ $t('reports.voided') }}</option>
            <option value="PARTIALLY_PAID">{{ $t('reports.partiallyPaid') }}</option>
          </select>
        </div>

        <!-- 5b. Stock Movement Type Filter (Restock inventory category only) -->
        <div class="flex flex-col gap-1.5" v-if="reportCategory === 'inventory' && inventoryReportType === 'restock'">
          <label class="text-[10px] font-mono font-bold text-on-surface-variant uppercase tracking-wider">{{ $t('reports.movementType') }}</label>
          <select 
            v-model="movementTypeFilter"
            class="w-full bg-surface-container-low border border-outline-variant text-xs font-bold text-on-surface hover:bg-surface-container-high transition-colors rounded-lg px-3 py-2.5 outline-none cursor-pointer"
          >
            <option value="ALL">{{ $t('reports.allMovements') }}</option>
            <option value="PURCHASE">{{ $t('reports.movementPurchase') }}</option>
            <option value="ADJUSTMENT">{{ $t('reports.movementAdjustment') }}</option>
            <option value="SALE">{{ $t('reports.movementSale') }}</option>
            <option value="TRANSFER">{{ $t('reports.movementTransfer') }}</option>
            <option value="RETURN">{{ $t('reports.movementReturn') }}</option>
          </select>
        </div>

        <!-- 6. Submit Filter Button -->
        <div class="flex flex-col gap-1.5" :class="reportCategory === 'sales' ? '' : 'sm:col-span-2 md:col-span-1'">
          <label class="hidden md:block text-[10px] font-mono font-bold text-transparent select-none uppercase tracking-wider">Submit</label>
          <button 
            @click="applyFilters"
            :disabled="isReportLoading"
            class="w-full py-2.5 bg-primary text-on-primary font-bold text-xs rounded-lg hover:bg-opacity-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow border-0 text-white disabled:opacity-60"
          >
            <RotateCw v-if="isReportLoading" class="w-4 h-4 animate-spin text-white" />
            <Activity v-else class="w-4 h-4" />
            <span>{{ isReportLoading ? $t('reports.applying') : $t('reports.applyFilters') }}</span>
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
        <span class="block text-[11px] font-mono font-bold text-on-surface-variant uppercase tracking-wider mb-2 px-2.5">{{ $t('reports.salesSection') }}</span>
        
        <button 
          @click="reportType = 'sales'"
          class="text-left text-sm px-4.5 py-3 h-11 rounded-lg flex items-center gap-3 transition-all cursor-pointer font-bold border-0"
          :class="reportType === 'sales' 
            ? 'bg-primary-container text-on-primary-container translate-x-1 shadow-xs' 
            : 'text-on-surface-variant hover:bg-surface-container bg-transparent'"
        >
          <TrendingUp class="w-5 h-5 shrink-0" />
          <span>{{ $t('reports.salesOperations') }}</span>
        </button>

        <button 
          @click="reportType = 'payments'"
          class="text-left text-sm px-4.5 py-3 h-11 rounded-lg flex items-center gap-3 transition-all cursor-pointer font-bold border-0"
          :class="reportType === 'payments' 
            ? 'bg-primary-container text-on-primary-container translate-x-1 shadow-xs' 
            : 'text-on-surface-variant hover:bg-surface-container bg-transparent'"
        >
          <Coins class="w-5 h-5 shrink-0" />
          <span>{{ $t('reports.paymentChannels') }}</span>
        </button>

        <button 
          @click="reportType = 'audit'"
          class="text-left text-sm px-4.5 py-3 h-11 rounded-lg flex items-center gap-3 transition-all cursor-pointer font-bold border-0"
          :class="reportType === 'audit' 
            ? 'bg-primary-container text-on-primary-container translate-x-1 shadow-xs' 
            : 'text-on-surface-variant hover:bg-surface-container bg-transparent'"
        >
          <Activity class="w-5 h-5 shrink-0" />
          <span>{{ $t('reports.auditTrailLogs') }}</span>
        </button>
      </div>

      <!-- Right Main Container (KPIs + list) -->
      <div 
        :class="reportCategory === 'sales' ? 'lg:col-span-3' : 'lg:col-span-4'" 
        class="space-y-6 relative min-h-[420px]"
      >
        <!-- Jenga Logo Loading Visual Overlay for Reports -->
        <JengaLoader 
          v-if="isReportLoading" 
          overlay 
          size="xl" 
          :label="loadingLabel" 
          :sublabel="loadingSublabel" 
        />
        
        <!-- SALES REPORT CATEGORY CONTENT -->
        <template v-if="reportCategory === 'sales'">
          <!-- Quick Metrics (4 columns for Sales & Profits) -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <!-- Revenue (PAID & PARTIAL) -->
            <div class="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant shadow-sm select-none relative overflow-hidden">
              <div class="flex justify-between items-start">
                <div>
                  <span class="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">{{ $t('reports.paidRevenue') }}</span>
                  <p class="text-xl font-black font-mono text-emerald-600 leading-tight mt-1">{{ formatCurrency(totalInvoiced, currency) }}</p>
                </div>
                <Coins class="w-5 h-5 text-emerald-600/70 shrink-0" />
              </div>
              <div class="text-[10px] text-on-surface-variant/80 font-semibold mt-2">{{ $t('reports.realizedIncomeDesc') }}</div>
            </div>

            <!-- Unpaid Receivables -->
            <div class="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant shadow-sm select-none relative overflow-hidden">
              <div class="flex justify-between items-start">
                <div>
                  <span class="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400">{{ $t('reports.unpaidReceivables') }}</span>
                  <p class="text-xl font-black font-mono text-amber-600 leading-tight mt-1">{{ formatCurrency(totalUnpaid, currency) }}</p>
                </div>
                <Clock class="w-5 h-5 text-amber-600/70 shrink-0" />
              </div>
              <div class="text-[10px] text-amber-700/80 font-semibold mt-2">{{ $t('reports.outstandingCreditDesc') }}</div>
            </div>

            <!-- Voided / Reversed Sales -->
            <div class="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant shadow-sm select-none relative overflow-hidden">
              <div class="flex justify-between items-start">
                <div>
                  <span class="text-[10px] font-mono font-bold uppercase tracking-widest text-rose-700 dark:text-rose-400">{{ $t('reports.voidedReversed') }}</span>
                  <p class="text-xl font-black font-mono text-rose-600 leading-tight mt-1">{{ formatCurrency(totalVoided, currency) }}</p>
                </div>
                <Ban class="w-5 h-5 text-rose-600/70 shrink-0" />
              </div>
              <div class="text-[10px] text-rose-700/80 font-semibold mt-2">{{ $t('reports.cancelledTotalsDesc') }}</div>
            </div>

            <!-- Profit / Loss Card -->
            <div class="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant shadow-sm select-none relative overflow-hidden">
              <div class="flex justify-between items-start">
                <div>
                  <span class="text-[10px] font-mono font-bold uppercase tracking-widest text-on-surface-variant">{{ $t('reports.profitLoss') }}</span>
                  <p 
                    class="text-xl font-black font-mono leading-tight mt-1"
                    :class="totalProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'"
                  >
                    {{ totalProfit >= 0 ? '+' : '' }}{{ formatCurrency(totalProfit, currency) }}
                  </p>
                </div>
                <TrendingUp class="w-5 h-5 shrink-0" :class="totalProfit >= 0 ? 'text-emerald-600/70' : 'text-rose-600/70'" />
              </div>
              <div class="text-[10px] text-on-surface-variant/80 font-semibold mt-2">{{ $t('reports.netProfitDesc') }}</div>
            </div>

          </div>

          <!-- MAIN GRAPH/TABLE LEDGER FOR SALES -->
          <div v-if="reportType === 'sales'" class="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm flex flex-col overflow-hidden">
            <div class="p-4 bg-surface-container-low border-b border-outline-variant select-none flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <span class="text-xs font-mono font-bold uppercase tracking-wide text-on-surface-variant">
                {{ $t('reports.timeframeHeader', {
                  from: fromDate || 'Start',
                  to: toDate || 'Today',
                  count: resolvedHistory.length
                }) }}
              </span>

              <!-- Search Input -->
              <div class="relative w-full sm:w-64">
                <Search class="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60" />
                <input 
                  type="text"
                  v-model="searchQuery"
                  :placeholder="$t('reports.searchPlaceholder')"
                  class="w-full bg-surface-container-lowest border border-outline-variant text-xs rounded-lg pl-8 pr-3 py-1.5 outline-none font-medium focus:border-primary"
                />
              </div>
            </div>

            <!-- Transactions History Table -->
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs select-none">
                <thead class="bg-[#f0f3f0] text-[10px] font-mono uppercase font-bold text-on-surface-variant border-b border-outline-variant select-none">
                  <tr>
                    <th class="p-4 pl-6">{{ $t('reports.referenceDetails') }}</th>
                    <th class="p-4">{{ $t('reports.timestamp') }}</th>
                    <th class="p-4">{{ $t('checkout.selectMethod') }}</th>
                    <th class="p-4 text-right">{{ $t('reports.invoiceSum') }}</th>
                    <th class="p-4 text-right">{{ $t('reports.profitLoss') }}</th>
                    <th class="p-4 text-right">{{ $t('checkout.discount') }}</th>
                    <th class="p-4">{{ $t('reports.refCode') }}</th>
                    <th class="p-4 text-center pr-6">{{ $t('customers.tableStatus') }}</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-surface-variant">
                  <tr 
                    v-for="txn in resolvedHistory" 
                    :key="txn.id" 
                    @click="handleRowClick(txn)"
                    class="hover:bg-surface-container-high/60 transition-all font-sans text-sm cursor-pointer"
                  >
                    <td class="p-4 pl-6 select-all font-bold text-on-surface">
                      <div class="font-mono text-xs">{{ txn.id }}</div>
                      <div class="text-[10px] text-on-surface-variant font-normal mt-0.5 flex flex-wrap gap-x-2">
                        <span v-if="txn.cashierName">{{ $t('receipt.cashier') }}: <strong class="font-semibold text-on-surface">{{ txn.cashierName }}</strong></span>
                        <span v-if="txn.customerName">{{ $t('receipt.customer') }}: <strong class="font-semibold text-primary">{{ txn.customerName }}</strong> <span v-if="txn.customerCode" class="text-[9px] font-mono opacity-80">({{ txn.customerCode }})</span></span>
                      </div>
                    </td>
                    <td class="p-4 font-mono text-xs text-on-surface-variant">{{ txn.date }}</td>
                    <td class="p-4 font-semibold text-on-surface">{{ txn.paymentMethod }}</td>
                    <td class="p-4 text-right font-mono font-black" :class="(txn.status || '').toUpperCase() === 'VOID' || txn.total < 0 ? 'text-rose-600 line-through' : 'text-primary'">
                      {{ formatCurrency(txn.total, currency) }}
                    </td>
                    <td 
                      class="p-4 text-right font-mono font-bold" 
                      :class="(txn.status || '').toUpperCase() === 'VOID' ? 'text-outline line-through' : (getTransactionProfit(txn) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600')"
                    >
                      {{ (txn.status || '').toUpperCase() === 'VOID' ? formatCurrency(0, currency) : ((getTransactionProfit(txn) >= 0 ? '+' : '') + formatCurrency(getTransactionProfit(txn), currency)) }}
                    </td>
                    <td class="p-4 text-right font-mono text-tertiary">-{{ formatCurrency(txn.discount, currency) }}</td>
                    <td class="p-4 font-mono text-xs text-outline select-all">{{ txn.refCode || 'N/A' }}</td>
                    <td class="p-4 text-center pr-6">
                      <!-- Dynamic status pill -->
                      <span 
                        v-if="(txn.status || 'PAID').toUpperCase() === 'PAID' || (txn.status || '').toUpperCase() === 'SUCCESS' || (txn.status || '').toUpperCase() === 'COMPLETED'"
                        class="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold rounded-full border border-emerald-500/20"
                      >
                        <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        PAID
                      </span>
                      <span 
                        v-else-if="(txn.status || '').toUpperCase() === 'UNPAID'"
                        class="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-amber-500/10 text-amber-700 dark:text-amber-400 text-[10px] font-bold rounded-full border border-amber-500/20"
                      >
                        <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                        UNPAID
                      </span>
                      <span 
                        v-else-if="(txn.status || '').toUpperCase() === 'VOID' || (txn.status || '').toUpperCase() === 'REVERSED'"
                        class="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-rose-500/10 text-rose-700 dark:text-rose-400 text-[10px] font-bold rounded-full border border-rose-500/20"
                      >
                        <span class="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                        VOID
                      </span>
                      <span 
                        v-else-if="(txn.status || '').toUpperCase() === 'PARTIALLY_PAID' || (txn.status || '').toUpperCase() === 'PARTIAL'"
                        class="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-blue-500/10 text-blue-700 dark:text-blue-400 text-[10px] font-bold rounded-full border border-blue-500/20"
                      >
                        <span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                        PARTIAL
                      </span>
                      <span 
                        v-else
                        class="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-gray-500/10 text-gray-700 text-[10px] font-bold rounded-full border border-gray-500/20"
                      >
                        {{ txn.status }}
                      </span>
                    </td>
                  </tr>
                  <tr v-if="resolvedHistory.length === 0">
                    <td colspan="8" class="p-8 text-center text-on-surface-variant font-medium">
                      {{ $t('reports.noSalesTransactions') }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- PAYMENT CHANNELS REPORT -->
          <div v-else-if="reportType === 'payments'" class="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-6 space-y-6">
            <h3 class="text-md font-bold text-on-surface">{{ $t('reports.gatewayCollectionsTitle') }}</h3>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 select-none">
              <!-- Cash totals -->
              <div class="bg-surface-container p-4 rounded-xl border border-outline-variant">
                <div class="flex justify-between items-center mb-2">
                  <span class="text-xs font-mono font-semibold text-on-surface-variant uppercase">{{ $t('reports.cashDrawerTitle') }}</span>
                  <Coins class="w-5 h-5 text-primary" />
                </div>
                <p class="text-xl font-bold font-mono text-on-surface">
                  {{ formatCurrency(totalByMethod('Cash'), currency) }}
                </p>
                <p class="text-[10px] text-outline mt-1 font-semibold">{{ $t('reports.verifiedDrawerReconciliation') }}</p>
              </div>

              <!-- M-PESA totals -->
              <div class="bg-surface-container p-4 rounded-xl border border-outline-variant">
                <div class="flex justify-between items-center mb-2">
                  <span class="text-xs font-mono font-semibold text-on-surface-variant uppercase">{{ $t('reports.mpesaTitle') }}</span>
                  <Sparkles class="w-5 h-5 text-primary" />
                </div>
                <p class="text-xl font-bold font-mono text-on-surface">
                  {{ formatCurrency(totalByMethod('M-Pesa'), currency) }}
                </p>
                <p class="text-[10px] text-outline mt-1 font-semibold">{{ $t('reports.securedWebhookConfirmation') }}</p>
              </div>

              <!-- Card terminal -->
              <div class="bg-surface-container p-4 rounded-xl border border-outline-variant">
                <div class="flex justify-between items-center mb-2">
                  <span class="text-xs font-mono font-semibold text-on-surface-variant uppercase">{{ $t('reports.cardTerminalTitle') }}</span>
                  <DollarSign class="w-5 h-5 text-primary" />
                </div>
                <p class="text-xl font-bold font-mono text-on-surface">
                  {{ formatCurrency(totalByMethod('Card'), currency) }}
                </p>
                <p class="text-[10px] text-outline mt-1 font-semibold">{{ $t('reports.consolidatedCardTerminal') }}</p>
              </div>
            </div>
          </div>

          <!-- AUDIT TRAIL DATA -->
          <div v-else-if="reportType === 'audit'" class="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-6 select-none leading-relaxed">
            <h3 class="text-md font-bold text-on-surface mb-4">{{ $t('reports.auditTrailTitle') }}</h3>
            
            <div class="p-8 text-center text-on-surface-variant font-medium text-sm flex flex-col items-center justify-center">
              <FileText class="w-8 h-8 text-outline-variant mb-2 animate-pulse" />
              <p>{{ $t('reports.auditTrailNotice') }}</p>
              <p class="text-xs text-outline mt-1">{{ $t('reports.auditTrailContactAdmin') }}</p>
            </div>
          </div>
        </template>

        <!-- INVENTORY REPORT CATEGORY CONTENT -->
        <template v-else-if="reportCategory === 'inventory'">
          <!-- Sub-Report Type Toggle Bar -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-container-lowest p-4 rounded-xl border border-outline-variant shadow-sm select-none">
            <div>
              <h3 class="text-base font-black text-on-surface">{{ $t('reports.inventoryStatusTitle') }}</h3>
              <p class="text-xs text-on-surface-variant font-semibold mt-0.5">
                {{ inventoryReportType === 'all' ? $t('reports.inventoryAllDesc') : $t('reports.inventoryRestockDesc') }}
              </p>
            </div>
            <div class="flex items-center gap-2 bg-surface-container-low p-1.5 rounded-xl border border-outline-variant shrink-0">
              <button
                @click="inventoryReportType = 'all'"
                class="px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer border-0 flex items-center gap-2"
                :class="inventoryReportType === 'all' ? 'bg-primary text-on-primary shadow-xs' : 'text-on-surface-variant hover:bg-surface-container-high bg-transparent'"
              >
                <Package class="w-4 h-4" />
                <span>{{ $t('reports.allStockReport') }}</span>
              </button>
              <button
                @click="inventoryReportType = 'restock'"
                class="px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer border-0 flex items-center gap-2"
                :class="inventoryReportType === 'restock' ? 'bg-primary text-on-primary shadow-xs' : 'text-on-surface-variant hover:bg-surface-container-high bg-transparent'"
              >
                <RefreshCw class="w-4 h-4" />
                <span>{{ $t('reports.restockReport') }}</span>
              </button>
            </div>
          </div>

          <!-- OPTION A: ALL STOCK REPORT -->
          <template v-if="inventoryReportType === 'all'">
            <!-- Quick Metrics (3 columns) -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
              
              <div class="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant shadow-sm select-none relative overflow-hidden">
                <div class="flex justify-between items-start">
                  <div>
                    <span class="text-[10px] font-mono font-bold uppercase tracking-widest text-on-surface-variant">{{ $t('reports.totalStockUnits') }}</span>
                    <p class="text-2xl font-black font-mono text-primary leading-tight mt-1">{{ totalInventoryItems }}</p>
                  </div>
                  <Package class="w-5 h-5 text-primary/70 shrink-0" />
                </div>
                <div class="text-[10px] text-on-surface-variant/80 font-semibold mt-2">{{ $t('reports.totalStockUnitsDesc') }}</div>
              </div>

              <div class="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant shadow-sm select-none relative overflow-hidden">
                <div class="flex justify-between items-start">
                  <div>
                    <span class="text-[10px] font-mono font-bold uppercase tracking-widest text-on-surface-variant">{{ $t('reports.lowStockItems') }}</span>
                    <p class="text-2xl font-black font-mono text-tertiary leading-tight mt-1">{{ lowStockItemsCount }}</p>
                  </div>
                  <AlertTriangle class="w-5 h-5 text-tertiary/70 shrink-0" />
                </div>
                <div class="text-[10px] text-tertiary/90 font-semibold mt-2">{{ $t('reports.lowStockThresholdDesc') }}</div>
              </div>

              <div class="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant shadow-sm select-none relative overflow-hidden">
                <div class="flex justify-between items-start">
                  <div>
                    <span class="text-[10px] font-mono font-bold uppercase tracking-widest text-on-surface-variant">{{ $t('reports.inventoryValuation') }}</span>
                    <p class="text-2xl font-black font-mono text-on-surface leading-tight mt-1">{{ formatCurrency(totalInventoryValuation, currency) }}</p>
                  </div>
                  <TrendingUp class="w-5 h-5 text-outline/70 shrink-0" />
                </div>
                <div class="text-[10px] text-on-surface-variant/80 font-semibold mt-2">{{ $t('reports.inventoryValuationDesc') }}</div>
              </div>

            </div>

            <!-- Inventory Table -->
            <div class="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm flex flex-col overflow-hidden">
              <div class="p-4 bg-surface-container-low border-b border-outline-variant select-none">
                <span class="text-xs font-mono font-bold uppercase tracking-wide text-on-surface-variant">{{ $t('reports.currentValuationLedger') }}</span>
              </div>
              
              <div class="overflow-x-auto">
                <table class="w-full text-left text-xs select-none">
                  <thead class="bg-[#f0f3f0] text-[10px] font-mono uppercase font-bold text-on-surface-variant border-b border-outline-variant select-none">
                    <tr>
                      <th class="p-4 pl-6">{{ $t('inventory.productName') }}</th>
                      <th class="p-4">{{ $t('inventory.category') }}</th>
                      <th class="p-4 text-center">{{ $t('inventory.stockLevel') }}</th>
                      <th class="p-4 text-right">{{ $t('inventory.costPrice') }}</th>
                      <th class="p-4 text-right">{{ $t('inventory.sellingPrice') }}</th>
                      <th class="p-4 text-right">{{ $t('reports.stockValue') }}</th>
                      <th class="p-4 text-center pr-6">{{ $t('customers.tableStatus') }}</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-surface-variant">
                    <tr 
                      v-for="p in paginatedProductsList" 
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
                        {{ $t('reports.noProductsFoundCatalog') }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Inventory Report Pagination Footer (15 items per page) -->
              <div class="p-4 bg-surface-container-lowest border-t border-outline-variant flex flex-col sm:flex-row justify-between items-center gap-4 select-none">
                <div class="text-xs text-on-surface-variant font-medium">
                  {{ $t('inventory.showingEntries', {
                    start: productsList.length === 0 ? 0 : (inventoryCurrentPage - 1) * inventoryItemsPerPage + 1,
                    end: Math.min(inventoryCurrentPage * inventoryItemsPerPage, productsList.length),
                    total: productsList.length
                  }) }}
                </div>

                <div class="flex flex-wrap items-center gap-2 font-sans text-xs">
                  <div class="flex items-center gap-1">
                    <button 
                      :disabled="inventoryCurrentPage === 1"
                      @click="inventoryCurrentPage = 1"
                      class="w-7 h-7 rounded border border-outline-variant flex items-center justify-center hover:bg-surface-container-high transition-colors disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer bg-white"
                      title="First Page"
                    >
                      <ChevronsLeft class="w-3.5 h-3.5 text-on-surface-variant" />
                    </button>
                    <button 
                      :disabled="inventoryCurrentPage === 1"
                      @click="inventoryCurrentPage = Math.max(1, inventoryCurrentPage - 1)"
                      class="w-7 h-7 rounded border border-outline-variant flex items-center justify-center hover:bg-surface-container-high transition-colors disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer bg-white"
                      title="Previous Page"
                    >
                      <ChevronLeft class="w-3.5 h-3.5 text-on-surface-variant" />
                    </button>
                  </div>

                  <span class="px-2 font-mono font-bold text-on-surface">Page {{ inventoryCurrentPage }} of {{ inventoryTotalPages }}</span>

                  <div class="flex items-center gap-1">
                    <button 
                      :disabled="inventoryCurrentPage === inventoryTotalPages"
                      @click="inventoryCurrentPage = Math.min(inventoryTotalPages, inventoryCurrentPage + 1)"
                      class="w-7 h-7 rounded border border-outline-variant flex items-center justify-center hover:bg-surface-container-high transition-colors disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer bg-white"
                      title="Next Page"
                    >
                      <ChevronRight class="w-3.5 h-3.5 text-on-surface-variant" />
                    </button>
                    <button 
                      :disabled="inventoryCurrentPage === inventoryTotalPages"
                      @click="inventoryCurrentPage = inventoryTotalPages"
                      class="w-7 h-7 rounded border border-outline-variant flex items-center justify-center hover:bg-surface-container-high transition-colors disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer bg-white"
                      title="Last Page"
                    >
                      <ChevronsRight class="w-3.5 h-3.5 text-on-surface-variant" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <!-- OPTION B: RESTOCK REPORT -->
          <template v-else-if="inventoryReportType === 'restock'">
            <!-- Restock Quick Metrics -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
              
              <div class="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant shadow-sm select-none relative overflow-hidden">
                <div class="flex justify-between items-start">
                  <div>
                    <span class="text-[10px] font-mono font-bold uppercase tracking-widest text-on-surface-variant">{{ $t('reports.restockLogEntries') }}</span>
                    <p class="text-2xl font-black font-mono text-primary leading-tight mt-1">{{ filteredStockMovements.length }}</p>
                  </div>
                  <RefreshCw class="w-5 h-5 text-primary/70 shrink-0" />
                </div>
                <div class="text-[10px] text-on-surface-variant/80 font-semibold mt-2">{{ $t('reports.totalStockAdditionsRecorded') }}</div>
              </div>

              <div class="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant shadow-sm select-none relative overflow-hidden">
                <div class="flex justify-between items-start">
                  <div>
                    <span class="text-[10px] font-mono font-bold uppercase tracking-widest text-on-surface-variant">{{ $t('reports.totalUnitsRestocked') }}</span>
                    <p class="text-2xl font-black font-mono text-emerald-600 leading-tight mt-1">{{ totalRestockQuantity }}</p>
                  </div>
                  <Package class="w-5 h-5 text-emerald-600/70 shrink-0" />
                </div>
                <div class="text-[10px] text-emerald-700/80 font-semibold mt-2">{{ $t('reports.cumulativeStockAdded') }}</div>
              </div>

              <div class="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant shadow-sm select-none relative overflow-hidden">
                <div class="flex justify-between items-start">
                  <div>
                    <span class="text-[10px] font-mono font-bold uppercase tracking-widest text-on-surface-variant">{{ $t('reports.restockValuation') }}</span>
                    <p class="text-2xl font-black font-mono text-on-surface leading-tight mt-1">{{ formatCurrency(totalRestockValuation, currency) }}</p>
                  </div>
                  <TrendingUp class="w-5 h-5 text-outline/70 shrink-0" />
                </div>
                <div class="text-[10px] text-on-surface-variant/80 font-semibold mt-2">{{ $t('reports.monetaryValueEntries') }}</div>
              </div>

            </div>

            <!-- Restock Movements Table -->
            <div class="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm flex flex-col overflow-hidden">
              <div class="p-4 bg-surface-container-low border-b border-outline-variant select-none flex justify-between items-center">
                <span class="text-xs font-mono font-bold uppercase tracking-wide text-on-surface-variant">{{ $t('reports.stockMovementsAuditHistory') }}</span>
                <span class="text-[11px] font-mono text-outline font-semibold">Range: {{ fromDate }} to {{ toDate }} (Filter: {{ movementTypeFilter }})</span>
              </div>
              
              <div class="overflow-x-auto">
                <table class="w-full text-left text-xs select-none">
                  <thead class="bg-[#f0f3f0] text-[10px] font-mono uppercase font-bold text-on-surface-variant border-b border-outline-variant select-none">
                    <tr>
                      <th class="p-4 pl-6">{{ $t('reports.timestamp') }}</th>
                      <th class="p-4">{{ $t('inventory.productName') }}</th>
                      <th class="p-4 text-center">{{ $t('reports.movementType') }}</th>
                      <th class="p-4 text-center">{{ $t('inventory.quantity') }}</th>
                      <th class="p-4 text-right">{{ $t('inventory.costPrice') }}</th>
                      <th class="p-4 text-right">{{ $t('inventory.sellingPrice') }}</th>
                      <th class="p-4 text-left pr-6">{{ $t('reports.addedCreatedBy') }}</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-surface-variant">
                    <tr 
                      v-for="sm in paginatedStockMovements" 
                      :key="sm.id" 
                      class="hover:bg-surface-container-high/60 transition-all font-sans text-sm"
                    >
                      <td class="p-4 pl-6 font-mono text-xs text-on-surface-variant">
                        {{ formatDateTime(sm.createdAt) }}
                      </td>
                      <td class="p-4">
                        <span class="font-bold text-on-surface block">{{ sm.productName || 'Product' }}</span>
                      </td>
                      <td class="p-4 text-center">
                        <span 
                          class="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-bold rounded-full border"
                          :class="getMovementTypeBadgeClass(sm.type)"
                        >
                          {{ (sm.type || 'PURCHASE').toUpperCase() }}
                        </span>
                      </td>
                      <td class="p-4 text-center font-mono font-bold" :class="sm.type === 'DAMAGED' || sm.type === 'SALE' ? 'text-error' : 'text-emerald-600'">
                        {{ sm.type === 'DAMAGED' || sm.type === 'SALE' ? '-' : '+' }}{{ sm.quantity }}
                      </td>
                      <td class="p-4 text-right font-mono text-on-surface-variant">
                        {{ formatCurrency(sm.costPrice || 0, currency) }}
                      </td>
                      <td class="p-4 text-right font-mono font-bold text-primary">
                        {{ formatCurrency(sm.sellingPrice || 0, currency) }}
                      </td>
                      <td class="p-4 text-left pr-6">
                        <span class="font-semibold text-on-surface block">{{ sm.createdByName || 'System / Admin' }}</span>
                      </td>
                    </tr>
                    <tr v-if="filteredStockMovements.length === 0">
                      <td colspan="7" class="p-8 text-center text-on-surface-variant font-medium">
                        {{ isLoadingMovements ? $t('common.loading') : $t('reports.noStockMovementsMatch') }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Restock Report Pagination Footer (15 items per page) -->
              <div class="p-4 bg-surface-container-lowest border-t border-outline-variant flex flex-col sm:flex-row justify-between items-center gap-4 select-none">
                <div class="text-xs text-on-surface-variant font-medium">
                  {{ $t('inventory.showingEntries', {
                    start: filteredStockMovements.length === 0 ? 0 : (restockCurrentPage - 1) * restockItemsPerPage + 1,
                    end: Math.min(restockCurrentPage * restockItemsPerPage, filteredStockMovements.length),
                    total: filteredStockMovements.length
                  }) }}
                </div>

                <div class="flex flex-wrap items-center gap-2 font-sans text-xs">
                  <div class="flex items-center gap-1">
                    <button 
                      :disabled="restockCurrentPage === 1"
                      @click="restockCurrentPage = 1"
                      class="w-7 h-7 rounded border border-outline-variant flex items-center justify-center hover:bg-surface-container-high transition-colors disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer bg-white"
                      title="First Page"
                    >
                      <ChevronsLeft class="w-3.5 h-3.5 text-on-surface-variant" />
                    </button>
                    <button 
                      :disabled="restockCurrentPage === 1"
                      @click="restockCurrentPage = Math.max(1, restockCurrentPage - 1)"
                      class="w-7 h-7 rounded border border-outline-variant flex items-center justify-center hover:bg-surface-container-high transition-colors disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer bg-white"
                      title="Previous Page"
                    >
                      <ChevronLeft class="w-3.5 h-3.5 text-on-surface-variant" />
                    </button>
                  </div>

                  <span class="px-2 font-mono font-bold text-on-surface">Page {{ restockCurrentPage }} of {{ restockTotalPages }}</span>

                  <div class="flex items-center gap-1">
                    <button 
                      :disabled="restockCurrentPage === restockTotalPages"
                      @click="restockCurrentPage = Math.min(restockTotalPages, restockCurrentPage + 1)"
                      class="w-7 h-7 rounded border border-outline-variant flex items-center justify-center hover:bg-surface-container-high transition-colors disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer bg-white"
                      title="Next Page"
                    >
                      <ChevronRight class="w-3.5 h-3.5 text-on-surface-variant" />
                    </button>
                    <button 
                      :disabled="restockCurrentPage === restockTotalPages"
                      @click="restockCurrentPage = restockTotalPages"
                      class="w-7 h-7 rounded border border-outline-variant flex items-center justify-center hover:bg-surface-container-high transition-colors disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer bg-white"
                      title="Last Page"
                    >
                      <ChevronsRight class="w-3.5 h-3.5 text-on-surface-variant" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </template>

        <!-- SUPPLIERS REPORT CATEGORY CONTENT -->
        <template v-else-if="reportCategory === 'suppliers'">
          <!-- Quick Metrics (3 columns) -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
            
            <div class="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant shadow-sm select-none relative overflow-hidden">
              <div class="flex justify-between items-start">
                <div>
                  <span class="text-[10px] font-mono font-bold uppercase tracking-widest text-on-surface-variant">{{ $t('reports.totalSuppliers') }}</span>
                  <p class="text-2xl font-black font-mono text-primary leading-tight mt-1">{{ totalSuppliers }}</p>
                </div>
                <Users class="w-5 h-5 text-primary/70 shrink-0" />
              </div>
              <div class="text-[10px] text-on-surface-variant/80 font-semibold mt-2">{{ $t('reports.totalRegisteredMerchantsDesc') }}</div>
            </div>

            <div class="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant shadow-sm select-none relative overflow-hidden">
              <div class="flex justify-between items-start">
                <div>
                  <span class="text-[10px] font-mono font-bold uppercase tracking-widest text-on-surface-variant">{{ $t('reports.activeAccounts') }}</span>
                  <p class="text-2xl font-black font-mono text-primary leading-tight mt-1">{{ activeSuppliers }}</p>
                </div>
                <UserCheck class="w-5 h-5 text-primary/70 shrink-0" />
              </div>
              <div class="text-[10px] text-primary/80 font-semibold mt-2">{{ $t('reports.activeVendorSupplyChannels') }}</div>
            </div>

            <div class="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant shadow-sm select-none relative overflow-hidden">
              <div class="flex justify-between items-start">
                <div>
                  <span class="text-[10px] font-mono font-bold uppercase tracking-widest text-on-surface-variant">{{ $t('reports.outstandingLiabilities') }}</span>
                  <p class="text-2xl font-black font-mono text-tertiary leading-tight mt-1">{{ formatCurrency(totalOutstandingBalance, currency) }}</p>
                </div>
                <CreditCard class="w-5 h-5 text-tertiary/70 shrink-0" />
              </div>
              <div class="text-[10px] text-tertiary/95 font-semibold mt-2">{{ $t('reports.totalPayablesAccruedDesc') }}</div>
            </div>

          </div>

          <!-- Suppliers Table -->
          <div class="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm flex flex-col overflow-hidden">
            <div class="p-4 bg-surface-container-low border-b border-outline-variant select-none">
              <span class="text-xs font-mono font-bold uppercase tracking-wide text-on-surface-variant">{{ $t('reports.consolidatedSupplierPayables') }}</span>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs select-none">
                <thead class="bg-[#f0f3f0] text-[10px] font-mono uppercase font-bold text-on-surface-variant border-b border-outline-variant select-none">
                  <tr>
                    <th class="p-4 pl-6">{{ $t('suppliers.tableSupplier') }}</th>
                    <th class="p-4">{{ $t('suppliers.tableContactPerson') }}</th>
                    <th class="p-4">{{ $t('suppliers.tableContact') }}</th>
                    <th class="p-4">{{ $t('suppliers.tableCategory') }}</th>
                    <th class="p-4 text-right">{{ $t('suppliers.tableBalance') }}</th>
                    <th class="p-4 text-center pr-6">{{ $t('customers.tableStatus') }}</th>
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
                      {{ $t('reports.noSuppliersFound') }}
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
import { api } from '../services/api';
import JengaLoader from '../components/common/JengaLoader.vue';
import type { Transaction, StockMovement } from '../models/types';
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
  CreditCard,
  Ban,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  RefreshCw,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
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

// Active Filters state
const reportCategory = ref<'sales' | 'inventory' | 'suppliers'>('sales');
const exportFormat = ref<'PDF' | 'EXCEL' | 'CSV'>('PDF');
const fromDate = ref(getTodayString());
const toDate = ref(getTodayString());
const statusFilter = ref<'ALL' | 'PAID' | 'UNPAID' | 'VOID' | 'PARTIALLY_PAID'>('ALL');
const searchQuery = ref('');

// Sidebar layout state for Sales
const reportType = ref<'sales' | 'payments' | 'audit'>('sales');

const transactionsHistory = computed(() => vm.transactionsHistory.value);
const currency = computed(() => vm.settings.value.currency);

// Inventory Report Type state ('all' | 'restock')
const inventoryReportType = ref<'all' | 'restock'>('all');
const movementTypeFilter = ref<string>('ALL');
const stockMovementsList = ref<StockMovement[]>([]);
const isLoadingMovements = ref(false);

const isReportLoading = computed(() => {
  if (reportCategory.value === 'sales') {
    return vm.isFetchingSales.value;
  }
  if (reportCategory.value === 'inventory') {
    return inventoryReportType.value === 'all' ? vm.isFetchingProducts.value : isLoadingMovements.value;
  }
  if (reportCategory.value === 'suppliers') {
    return vm.isFetchingSuppliers.value;
  }
  return false;
});

const loadingLabel = computed(() => {
  if (reportCategory.value === 'sales') return 'Fetching Sales & Profit Reports';
  if (reportCategory.value === 'inventory') return 'Fetching Inventory Status Reports';
  if (reportCategory.value === 'suppliers') return 'Fetching Supplier Overview Reports';
  return 'Loading Report Data';
});

const loadingSublabel = computed(() => {
  if (reportCategory.value === 'sales') return 'Querying /api/sales for transaction metrics & net profits...';
  if (reportCategory.value === 'inventory') return 'Querying /api/products for catalog stock levels...';
  if (reportCategory.value === 'suppliers') return 'Querying /api/suppliers for supplier ledger...';
  return 'Please wait while analytical data is compiled...';
});

const filteredStockMovements = computed(() => {
  if (movementTypeFilter.value === 'ALL') {
    return stockMovementsList.value;
  }
  return stockMovementsList.value.filter(sm => {
    return (sm.type || '').toUpperCase() === movementTypeFilter.value.toUpperCase();
  });
});

const totalRestockQuantity = computed(() => {
  return filteredStockMovements.value.reduce((acc, sm) => acc + (Number(sm.quantity) || 0), 0);
});

const totalRestockValuation = computed(() => {
  return filteredStockMovements.value.reduce((acc, sm) => {
    const price = sm.costPrice || sm.sellingPrice || 0;
    return acc + ((Number(sm.quantity) || 0) * price);
  }, 0);
});

const fetchStockMovements = async () => {
  const branchId = localStorage.getItem('branchId');
  if (!branchId || branchId === 'null' || branchId === 'undefined') return;
  isLoadingMovements.value = true;
  try {
    const res = await api.get<StockMovement[]>(`/api/products/stock-movements?storeBranchId=${branchId}&startDate=${fromDate.value}&endDate=${toDate.value}`);
    stockMovementsList.value = res || [];
  } catch (err) {
    console.error('Failed to fetch stock movements:', err);
    stockMovementsList.value = [];
  } finally {
    isLoadingMovements.value = false;
  }
};

const formatDateTime = (dateStr?: string) => {
  if (!dateStr) return '-';
  try {
    return new Date(dateStr).toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    return dateStr;
  }
};

const getMovementTypeBadgeClass = (type: string) => {
  const t = (type || '').toUpperCase();
  if (t === 'PURCHASE' || t === 'IN' || t === 'ADD') {
    return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
  } else if (t === 'DAMAGED') {
    return 'bg-error/10 text-error border-error/20';
  } else if (t === 'ADJUSTMENT') {
    return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
  } else if (t === 'TRANSFER') {
    return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
  } else if (t === 'RETURN') {
    return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
  } else if (t === 'SALE' || t === 'OUT') {
    return 'bg-slate-500/10 text-slate-600 border-slate-500/20';
  }
  return 'bg-primary/10 text-primary border-primary/20';
};

const applyFilters = () => {
  inventoryCurrentPage.value = 1;
  restockCurrentPage.value = 1;
  if (reportCategory.value === 'sales') {
    vm.fetchSalesHistory(fromDate.value, toDate.value);
  } else if (reportCategory.value === 'inventory') {
    if (inventoryReportType.value === 'all') {
      vm.fetchProducts();
    } else {
      fetchStockMovements();
    }
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

watch(inventoryReportType, () => {
  if (reportCategory.value === 'inventory') {
    applyFilters();
  }
});

// Helper to check if sale status represents PAID status only
const isPaidOnlyStatus = (status?: string) => {
  if (!status) return true;
  const s = status.toUpperCase();
  return s === 'PAID' || s === 'SUCCESS' || s === 'COMPLETED';
};

// Dynamic filtering for Sales report
const filteredTransactions = computed(() => {
  let list = transactionsHistory.value;
  if (fromDate.value) {
    list = list.filter(t => t.date >= fromDate.value);
  }
  if (toDate.value) {
    list = list.filter(t => t.date <= toDate.value);
  }
  if (statusFilter.value !== 'ALL') {
    list = list.filter(t => {
      const st = (t.status || 'PAID').toUpperCase();
      if (statusFilter.value === 'PAID') return st === 'PAID' || st === 'SUCCESS' || st === 'COMPLETED';
      if (statusFilter.value === 'UNPAID') return st === 'UNPAID';
      if (statusFilter.value === 'VOID') return st === 'VOID' || st === 'REVERSED';
      if (statusFilter.value === 'PARTIALLY_PAID') return st === 'PARTIALLY_PAID' || st === 'PARTIAL';
      return true;
    });
  }
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim();
    list = list.filter(t => 
      (t.id && t.id.toLowerCase().includes(q)) ||
      (t.refCode && t.refCode.toLowerCase().includes(q)) ||
      (t.cashierName && t.cashierName.toLowerCase().includes(q)) ||
      (t.customerName && t.customerName.toLowerCase().includes(q)) ||
      (t.customerCode && t.customerCode.toLowerCase().includes(q)) ||
      (t.paymentMethod && t.paymentMethod.toLowerCase().includes(q))
    );
  }
  return list;
});

const resolvedHistory = computed(() => {
  return filteredTransactions.value;
});

// Revenue: Sum of all sales (Invoice items) for PAID items only
const totalInvoiced = computed(() => {
  return filteredTransactions.value
    .filter(t => isPaidOnlyStatus(t.status))
    .reduce((acc, t) => {
      if (t.items && t.items.length > 0) {
        return acc + t.items.reduce((itemSum, item) => itemSum + ((item.quantity * item.product.price) - item.discount), 0);
      }
      return acc + Math.max(0, t.total);
    }, 0);
});

const totalUnpaid = computed(() => {
  return filteredTransactions.value
    .filter(t => (t.status || '').toUpperCase() === 'UNPAID')
    .reduce((acc, t) => acc + Math.max(0, t.total), 0);
});

const totalVoided = computed(() => {
  return filteredTransactions.value
    .filter(t => {
      const st = (t.status || '').toUpperCase();
      return st === 'VOID' || st === 'REVERSED' || t.total < 0;
    })
    .reduce((acc, t) => acc + Math.abs(t.total), 0);
});

const getTransactionCost = (txn: Transaction) => {
  if (!txn.items || txn.items.length === 0) return Math.max(0, txn.total * 0.70);
  return txn.items.reduce((sum, item) => {
    let unitCost = item.product?.cost || 0;
    if (!unitCost && item.product?.id) {
      const found = vm.products.value.find(p => p.id === item.product.id);
      if (found && found.cost) unitCost = found.cost;
    }
    if (!unitCost && item.product?.wholesalePrice) {
      unitCost = item.product.wholesalePrice;
    }
    if (!unitCost && item.product?.price) {
      // Estimated Cost of Goods Sold (70% of retail price) if item cost is unpopulated
      unitCost = item.product.price * 0.70;
    }
    return sum + (unitCost * item.quantity);
  }, 0);
};

const getTransactionProfit = (txn: Transaction) => {
  if ((txn.status || '').toUpperCase() === 'VOID') return 0;
  const cost = getTransactionCost(txn);
  return txn.total - cost;
};

const totalProfit = computed(() => {
  return filteredTransactions.value
    .filter(t => isPaidOnlyStatus(t.status))
    .reduce((acc, t) => acc + getTransactionProfit(t), 0);
});

const totalByMethod = (method: string) => {
  return filteredTransactions.value
    .filter(t => {
      const isMethodMatch = t.paymentMethod.toLowerCase() === method.toLowerCase() ||
        (method.toLowerCase() === 'cash' && t.paymentMethod.toUpperCase() === 'CASH') ||
        (method.toLowerCase() === 'm-pesa' && (t.paymentMethod.toUpperCase() === 'MOBILE' || t.paymentMethod.toUpperCase() === 'M-PESA')) ||
        (method.toLowerCase() === 'card' && t.paymentMethod.toUpperCase() === 'CARD') ||
        (method.toLowerCase() === 'credit' && (t.paymentMethod.toUpperCase() === 'CREDIT' || t.paymentMethod.toUpperCase() === 'ON CREDIT'));
      return isMethodMatch && isPaidOnlyStatus(t.status);
    })
    .reduce((acc, t) => acc + Math.max(0, t.total), 0);
};

// Inventory report computed fields & pagination (15 items per page)
const inventoryCurrentPage = ref(1);
const inventoryItemsPerPage = 15;
const restockCurrentPage = ref(1);
const restockItemsPerPage = 15;

const productsList = computed(() => vm.products.value);

const paginatedProductsList = computed(() => {
  const start = (inventoryCurrentPage.value - 1) * inventoryItemsPerPage;
  return productsList.value.slice(start, start + inventoryItemsPerPage);
});

const inventoryTotalPages = computed(() => {
  return Math.ceil(productsList.value.length / inventoryItemsPerPage) || 1;
});

const paginatedStockMovements = computed(() => {
  const start = (restockCurrentPage.value - 1) * restockItemsPerPage;
  return filteredStockMovements.value.slice(start, start + restockItemsPerPage);
});

const restockTotalPages = computed(() => {
  return Math.ceil(filteredStockMovements.value.length / restockItemsPerPage) || 1;
});

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
  `).join('<td style="width: 20px; border: none;"></td>');

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
    </head>
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
    </body>
    </html>
  `;

  const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
};

const exportToPDF = (title: string, metadata: string, kpis: { label: string, value: string }[], headers: string[], rows: any[][]) => {
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
      </head>
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
      </body>
    </html>
  `;

  const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!iframeDoc) {
    showToast('Failed to initialize print frame.', 'error');
    document.body.removeChild(iframe);
    return;
  }

  iframeDoc.write(html);
  iframeDoc.close();

  setTimeout(() => {
    if (iframe.contentWindow) {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    }
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
    title = 'Sales Operations Report';
    const dateRangeStr = (fromDate.value || toDate.value) 
      ? `Date Range: ${fromDate.value || 'Start'} to ${toDate.value || 'Today'}` 
      : 'All Time';
    metadata = `${dateRangeStr} | Generated by Sarah K.`;
    filename = `JENGA-SALES-OPERATIONS-REPORT-${dateStr}`;

    headers = ['Reference No.', 'Cashier', 'Customer', 'Timestamp', 'Payment Method', 'Invoice Sum', 'Profit / Loss', 'Discount', 'Ref Code', 'Status'];
    rows = resolvedHistory.value.map(t => [
      t.id,
      t.cashierName || 'N/A',
      t.customerName ? `${t.customerName} (${t.customerCode || ''})` : 'Walk-in Customer',
      t.date,
      t.paymentMethod,
      formatCurrency(t.total, currency.value),
      (getTransactionProfit(t) >= 0 ? '+' : '') + formatCurrency(getTransactionProfit(t), currency.value),
      `-${formatCurrency(t.discount, currency.value)}`,
      t.refCode || 'N/A',
      (t.status || 'PAID').toUpperCase()
    ]);

    kpis = [
      { label: 'Realized Revenue (Paid)', value: formatCurrency(totalInvoiced.value, currency.value) },
      { label: 'Unpaid Receivables', value: formatCurrency(totalUnpaid.value, currency.value) },
      { label: 'Voided / Reversals', value: formatCurrency(totalVoided.value, currency.value) },
      { label: 'Gross Profit / Loss', value: `${totalProfit.value >= 0 ? '+' : ''}${formatCurrency(totalProfit.value, currency.value)}` }
    ];

  } else if (reportCategory.value === 'inventory') {
    if (inventoryReportType.value === 'restock') {
      title = 'Restock & Stock Movement History Report';
      metadata = `Date Range: ${fromDate.value} to ${toDate.value} | Generated by Admin`;
      filename = `JENGA-RESTOCK-REPORT-${dateStr}`;

      headers = ['Date & Time', 'Product Name', 'Movement Type', 'Quantity', 'Cost Price', 'Selling Price', 'Added / Created By'];
      rows = filteredStockMovements.value.map(sm => [
        formatDateTime(sm.createdAt),
        sm.productName || 'Product',
        (sm.type || 'PURCHASE').toUpperCase(),
        `+${sm.quantity}`,
        formatCurrency(sm.costPrice || 0, currency.value),
        formatCurrency(sm.sellingPrice || 0, currency.value),
        sm.createdByName || sm.createdById || 'System / Admin'
      ]);

      kpis = [
        { label: 'Restock Log Entries', value: String(filteredStockMovements.value.length) },
        { label: 'Total Units Restocked', value: String(totalRestockQuantity.value) },
        { label: 'Restock Valuation', value: formatCurrency(totalRestockValuation.value, currency.value) }
      ];
    } else {
      title = 'Inventory Valuation Status Report';
      metadata = `Current Catalog Snapshot | Generated by Admin`;
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
    }

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
  vm.lastTransaction.value = txn;
  router.push('/receipt');
};
</script>
