<template>
  <div class="flex flex-col gap-6 w-full animate-fade-in font-sans relative select-none pb-20">
    <!-- Toast Notification -->
    <Toast 
      v-if="toastMessage"
      :message="toastMessage" 
      :type="toastType" 
      :onClose="() => toastMessage = null" 
    />

    <!-- MODULE HEADER -->
    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shadow-xs">
            <component :is="submoduleIcon" class="w-5 h-5" />
          </div>
          <div>
            <div class="flex items-center gap-1.5">
              <span class="text-[10px] font-mono font-bold text-on-surface-variant uppercase tracking-wider">{{ $t('finance.title') }} /</span>
              <span class="text-[10px] font-mono font-bold text-primary uppercase tracking-wider">{{ submoduleTitle }}</span>
            </div>
            <h1 class="text-2xl md:text-3xl font-black text-primary tracking-tight">{{ submoduleTitle }}</h1>
            <p class="text-xs md:text-sm text-on-surface-variant font-medium mt-0.5">
              {{ submoduleSubtitle }}
            </p>
          </div>
        </div>
      </div>

      <!-- Quick Actions Header Buttons -->
      <div class="flex flex-wrap items-center gap-2.5 shrink-0">
        <!-- Active Period Pill -->
        <div 
          v-if="currentPeriod"
          class="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface-container-lowest border border-outline-variant shadow-xs text-xs font-semibold text-on-surface"
        >
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span class="text-on-surface-variant font-mono text-[11px] uppercase">{{ $t('finance.fiscalPeriodLabel') }}</span>
          <span class="font-bold font-mono text-primary">{{ currentPeriod.name }}</span>
        </div>

        <!-- Refresh Button -->
        <button 
          @click="refreshActiveTab"
          :disabled="isLoading"
          class="h-10 px-3.5 rounded-xl border border-outline-variant text-on-surface hover:bg-surface-container-high active:scale-[0.98] font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all bg-white shadow-xs disabled:opacity-50"
          :title="$t('common.refresh')"
        >
          <RotateCw class="w-3.5 h-3.5" :class="isLoading ? 'animate-spin text-primary' : ''" />
          <span class="hidden sm:inline">{{ $t('common.refresh') }}</span>
        </button>

        <!-- Export Statement / CSV -->
        <button 
          @click="handleExportCurrentView"
          class="h-10 px-3.5 rounded-xl border border-outline-variant text-on-surface hover:bg-surface-container-high active:scale-[0.98] font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all bg-white shadow-xs"
          :title="$t('common.export')"
        >
          <Download class="w-3.5 h-3.5" />
          <span>{{ $t('common.export') }}</span>
        </button>

        <!-- New Journal Entry Action -->
        <button 
          v-if="userRole === 'ADMIN' || userRole === 'SUPER_ADMIN' || vm.hasPermission('finance:new_journal_entry')"
          @click="openNewJournalModal"
          class="h-10 px-4 rounded-xl bg-primary text-on-primary hover:bg-opacity-95 active:scale-[0.98] font-bold text-xs flex items-center gap-2 cursor-pointer transition-all shadow-sm"
        >
          <PlusCircle class="w-4 h-4" />
          <span>{{ $t('finance.newJournalEntry') }}</span>
        </button>

        <!-- Add Custom Account Action -->
        <button 
          v-if="userRole === 'ADMIN' || userRole === 'SUPER_ADMIN' || vm.hasPermission('finance:add_account')"
          @click="openAddAccountModal"
          class="h-10 px-4 rounded-xl bg-surface-container text-on-surface border border-outline-variant hover:bg-surface-container-high active:scale-[0.98] font-bold text-xs flex items-center gap-2 cursor-pointer transition-all shadow-xs"
        >
          <Plus class="w-4 h-4 text-primary" />
          <span>{{ $t('finance.addAccount') }}</span>
        </button>
      </div>
    </div>

    <!-- MAIN SUBMODULE CONTENT CONTAINER -->
    <div class="relative min-h-[500px]">
      <!-- Loading Overlay -->
      <JengaLoader 
        v-if="isLoading" 
        overlay 
        size="lg" 
        :label="$t('common.loading')" 
        sublabel="Compiling accounts, double-entry vouchers, and ledgers" 
      />

      <!-- ========================================================================= -->
      <!-- SUBMODULE 1: FINANCIAL STATEMENTS & REPORTS -->
      <!-- ========================================================================= -->
      <div v-if="activeSubmodule === 'statements'" class="space-y-6">
        <!-- Statement Sub-Tabs & Filter Toolbar -->
        <div class="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <!-- Sub-Report Selector -->
          <div class="flex items-center gap-1.5 p-1 bg-surface-container-low border border-outline-variant rounded-xl shrink-0">
            <button 
              @click="switchStatementType('pnl')"
              class="px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
              :class="statementType === 'pnl' ? 'bg-primary text-on-primary shadow-xs' : 'text-on-surface-variant hover:bg-surface-container-high'"
            >
              <TrendingUp class="w-3.5 h-3.5" />
              <span>{{ $t('finance.incomeStatementPnl') }}</span>
            </button>
            <button 
              @click="switchStatementType('balance-sheet')"
              class="px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
              :class="statementType === 'balance-sheet' ? 'bg-primary text-on-primary shadow-xs' : 'text-on-surface-variant hover:bg-surface-container-high'"
            >
              <Scale class="w-3.5 h-3.5" />
              <span>{{ $t('finance.balanceSheet') }}</span>
            </button>
            <button 
              @click="switchStatementType('trial-balance')"
              class="px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
              :class="statementType === 'trial-balance' ? 'bg-primary text-on-primary shadow-xs' : 'text-on-surface-variant hover:bg-surface-container-high'"
            >
              <CheckCircle2 class="w-3.5 h-3.5" />
              <span>{{ $t('finance.trialBalance') }}</span>
            </button>
          </div>

          <!-- Date Filters & Branch Filter -->
          <div class="flex flex-wrap items-center gap-3">
            <!-- Period Presets for P&L -->
            <div v-if="statementType === 'pnl'" class="flex items-center gap-1">
              <button 
                v-for="preset in ['this_month', 'last_month', 'this_quarter', 'this_year']" 
                :key="preset"
                @click="applyDatePreset(preset)"
                class="px-2.5 py-1.5 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer"
                :class="activePreset === preset ? 'bg-primary/10 border-primary text-primary' : 'bg-surface border-outline-variant text-on-surface-variant hover:bg-surface-container'"
              >
                {{ formatPresetLabel(preset) }}
              </button>
            </div>

            <!-- Start Date / End Date (P&L) or As-Of Date (Balance Sheet & Trial Balance) -->
            <template v-if="statementType === 'pnl'">
              <div class="flex items-center gap-1.5">
                <span class="text-[11px] font-mono font-bold text-on-surface-variant uppercase">{{ $t('reports.fromDate') }}</span>
                <input 
                  type="date" 
                  v-model="statementStartDate" 
                  class="h-9 px-2.5 bg-surface-container-low border border-outline-variant rounded-lg text-xs font-bold text-on-surface outline-none"
                />
              </div>
              <div class="flex items-center gap-1.5">
                <span class="text-[11px] font-mono font-bold text-on-surface-variant uppercase">{{ $t('reports.toDate') }}</span>
                <input 
                  type="date" 
                  v-model="statementEndDate" 
                  class="h-9 px-2.5 bg-surface-container-low border border-outline-variant rounded-lg text-xs font-bold text-on-surface outline-none"
                />
              </div>
            </template>
            <template v-else>
              <div class="flex items-center gap-1.5">
                <span class="text-[11px] font-mono font-bold text-on-surface-variant uppercase">{{ $t('finance.asOf') }}</span>
                <input 
                  type="date" 
                  v-model="statementAsOfDate" 
                  class="h-9 px-2.5 bg-surface-container-low border border-outline-variant rounded-lg text-xs font-bold text-on-surface outline-none"
                />
              </div>
            </template>

            <!-- Submit Button -->
            <button 
              @click="loadStatements"
              class="h-9 px-4 rounded-lg bg-primary text-on-primary font-bold text-xs flex items-center gap-1.5 hover:bg-opacity-90 active:scale-95 cursor-pointer transition-all shadow-xs"
            >
              <Activity class="w-3.5 h-3.5" />
              <span>{{ $t('reports.applyFilters') }}</span>
            </button>
          </div>
        </div>

        <!-- STATEMENT VIEW A: INCOME STATEMENT (P&L) -->
        <div v-if="statementType === 'pnl'" class="space-y-6">
          <!-- P&L Header Summary Cards -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant shadow-xs">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{{ $t('finance.grossRevenue') }}</span>
                <div class="p-2 rounded-xl bg-primary/10 text-primary">
                  <Coins class="w-4 h-4" />
                </div>
              </div>
              <div class="mt-3">
                <div class="text-2xl font-black font-mono text-primary">{{ formatCurrency(incomeStatement?.grossRevenue || 0) }}</div>
                <div class="text-[11px] text-on-surface-variant mt-0.5">{{ $t('finance.grossRevenueDesc') }}</div>
              </div>
            </div>

            <div class="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant shadow-xs">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{{ $t('finance.grossProfit') }}</span>
                <div class="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
                  <TrendingUp class="w-4 h-4" />
                </div>
              </div>
              <div class="mt-3">
                <div class="text-2xl font-black font-mono text-emerald-600">{{ formatCurrency(incomeStatement?.grossProfit || 0) }}</div>
                <div class="text-[11px] text-emerald-700 font-semibold mt-0.5">
                  Margin: {{ calculateMargin(incomeStatement?.grossProfit, incomeStatement?.netRevenue) }}%
                </div>
              </div>
            </div>

            <div class="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant shadow-xs">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{{ $t('finance.operatingExpenses') }}</span>
                <div class="p-2 rounded-xl bg-amber-500/10 text-amber-600">
                  <Receipt class="w-4 h-4" />
                </div>
              </div>
              <div class="mt-3">
                <div class="text-2xl font-black font-mono text-amber-600">{{ formatCurrency(incomeStatement?.totalExpenses || 0) }}</div>
                <div class="text-[11px] text-on-surface-variant mt-0.5">{{ $t('finance.operatingExpensesDesc') }}</div>
              </div>
            </div>

            <div class="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant shadow-xs">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{{ $t('finance.netIncome') }}</span>
                <div class="p-2 rounded-xl" :class="(incomeStatement?.netIncome || 0) >= 0 ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'">
                  <DollarSign class="w-4 h-4" />
                </div>
              </div>
              <div class="mt-3">
                <div 
                  class="text-2xl font-black font-mono"
                  :class="(incomeStatement?.netIncome || 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'"
                >
                  {{ (incomeStatement?.netIncome || 0) >= 0 ? '+' : '' }}{{ formatCurrency(incomeStatement?.netIncome || 0) }}
                </div>
                <div class="text-[11px] font-semibold mt-0.5" :class="(incomeStatement?.netIncome || 0) >= 0 ? 'text-emerald-700' : 'text-rose-700'">
                  Net Margin: {{ calculateMargin(incomeStatement?.netIncome, incomeStatement?.netRevenue) }}%
                </div>
              </div>
            </div>
          </div>

          <!-- Formal P&L Statement Sheet -->
          <div class="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-sm overflow-hidden">
            <div class="p-5 bg-surface-container-low border-b border-outline-variant flex justify-between items-center">
              <div>
                <h3 class="text-sm font-black text-on-surface uppercase tracking-wide">{{ $t('finance.incomeStatementPnl') }}</h3>
                <p class="text-xs text-on-surface-variant mt-0.5">For the period from {{ statementStartDate }} to {{ statementEndDate }}</p>
              </div>
              <span class="text-xs font-mono font-bold text-primary px-2.5 py-1 rounded-full bg-primary/10">Currency: {{ incomeStatement?.currency || 'TZS' }}</span>
            </div>

            <div class="p-6 divide-y divide-outline-variant/60 font-sans text-sm">
              <!-- 1. Operating Revenue -->
              <div class="pb-5 space-y-2">
                <div class="flex justify-between items-center font-bold text-xs uppercase tracking-wider text-primary">
                  <span>{{ $t('finance.operatingRevenues') }}</span>
                  <span>{{ $t('customers.amount') }}</span>
                </div>
                <div 
                  v-for="line in (incomeStatement?.operatingRevenueLines || [])" 
                  :key="line.accountCode"
                  class="flex justify-between items-center py-1 text-on-surface hover:bg-surface-container-low/50 px-2 rounded-lg"
                >
                  <span class="font-medium flex items-center gap-2">
                    <span class="font-mono text-xs text-on-surface-variant">{{ line.accountCode }}</span>
                    <span>{{ line.accountName }}</span>
                  </span>
                  <span class="font-mono font-semibold">{{ formatCurrency(line.amount) }}</span>
                </div>
                <div v-if="!incomeStatement?.operatingRevenueLines?.length" class="text-xs text-on-surface-variant py-1 px-2 italic">
                  No revenue transactions recorded for this period.
                </div>
                <div class="flex justify-between items-center pt-2 border-t border-outline-variant/30 text-xs font-bold text-on-surface-variant">
                  <span>{{ $t('finance.grossOperatingSales') }}</span>
                  <span class="font-mono">{{ formatCurrency(incomeStatement?.grossRevenue || 0) }}</span>
                </div>
                <div v-if="(incomeStatement?.salesDiscounts || 0) > 0" class="flex justify-between items-center text-xs text-rose-600">
                  <span>{{ $t('finance.salesDiscounts') }}</span>
                  <span class="font-mono">-{{ formatCurrency(incomeStatement?.salesDiscounts || 0) }}</span>
                </div>
                <div class="flex justify-between items-center pt-1 font-bold text-on-surface bg-surface-container-low/60 px-3 py-2 rounded-xl">
                  <span>{{ $t('finance.netRevenue') }}</span>
                  <span class="font-mono text-base font-black text-primary">{{ formatCurrency(incomeStatement?.netRevenue || 0) }}</span>
                </div>
              </div>

              <!-- 2. Cost of Goods Sold -->
              <div class="py-5 space-y-2">
                <div class="flex justify-between items-center font-bold text-xs uppercase tracking-wider text-amber-700">
                  <span>{{ $t('finance.cogs') }}</span>
                  <span>{{ $t('customers.amount') }}</span>
                </div>
                <div 
                  v-for="line in (incomeStatement?.cogsLines || [])" 
                  :key="line.accountCode"
                  class="flex justify-between items-center py-1 text-on-surface hover:bg-surface-container-low/50 px-2 rounded-lg"
                >
                  <span class="font-medium flex items-center gap-2">
                    <span class="font-mono text-xs text-on-surface-variant">{{ line.accountCode }}</span>
                    <span>{{ line.accountName }}</span>
                  </span>
                  <span class="font-mono font-semibold text-amber-700">{{ formatCurrency(line.amount) }}</span>
                </div>
                <div class="flex justify-between items-center pt-1 font-bold text-on-surface bg-amber-500/10 px-3 py-2 rounded-xl text-amber-900">
                  <span>{{ $t('finance.totalCogs') }}</span>
                  <span class="font-mono text-sm font-black">{{ formatCurrency(incomeStatement?.costOfGoodsSold || 0) }}</span>
                </div>
                <div class="flex justify-between items-center pt-2 font-bold text-on-surface bg-emerald-500/10 px-3 py-2 rounded-xl text-emerald-900">
                  <span>{{ $t('finance.grossProfit') }}</span>
                  <span class="font-mono text-base font-black text-emerald-700">{{ formatCurrency(incomeStatement?.grossProfit || 0) }}</span>
                </div>
              </div>

              <!-- 3. Operating Expenses -->
              <div class="py-5 space-y-2">
                <div class="flex justify-between items-center font-bold text-xs uppercase tracking-wider text-on-surface-variant">
                  <span>{{ $t('finance.operatingExpenses') }}</span>
                  <span>{{ $t('customers.amount') }}</span>
                </div>
                <div 
                  v-for="line in (incomeStatement?.expenseLines || [])" 
                  :key="line.accountCode"
                  class="flex justify-between items-center py-1 text-on-surface hover:bg-surface-container-low/50 px-2 rounded-lg"
                >
                  <span class="font-medium flex items-center gap-2">
                    <span class="font-mono text-xs text-on-surface-variant">{{ line.accountCode }}</span>
                    <span>{{ line.accountName }}</span>
                  </span>
                  <span class="font-mono font-semibold text-rose-600">{{ formatCurrency(line.amount) }}</span>
                </div>
                <div v-if="!incomeStatement?.expenseLines?.length" class="text-xs text-on-surface-variant py-1 px-2 italic">
                  No operating expenses recorded for this period.
                </div>
                <div class="flex justify-between items-center pt-1 font-bold text-on-surface bg-surface-container-low/60 px-3 py-2 rounded-xl">
                  <span>{{ $t('finance.totalOperatingExpenses') }}</span>
                  <span class="font-mono text-sm font-black text-rose-600">{{ formatCurrency(incomeStatement?.totalExpenses || 0) }}</span>
                </div>
              </div>

              <!-- 4. Other Income & Expenses (if any) -->
              <div v-if="(incomeStatement?.otherIncome || 0) > 0 || (incomeStatement?.otherExpenses || 0) > 0" class="py-5 space-y-2">
                <div class="flex justify-between items-center font-bold text-xs uppercase tracking-wider text-on-surface-variant">
                  <span>{{ $t('finance.otherIncomeExpenses') }}</span>
                  <span>{{ $t('customers.amount') }}</span>
                </div>
                <div v-if="(incomeStatement?.otherIncome || 0) > 0" class="flex justify-between items-center py-1 px-2 text-emerald-700">
                  <span>{{ $t('finance.otherNonOperatingIncome') }}</span>
                  <span class="font-mono font-semibold">+{{ formatCurrency(incomeStatement?.otherIncome || 0) }}</span>
                </div>
                <div v-if="(incomeStatement?.otherExpenses || 0) > 0" class="flex justify-between items-center py-1 px-2 text-rose-700">
                  <span>{{ $t('finance.otherNonOperatingExpenses') }}</span>
                  <span class="font-mono font-semibold">-{{ formatCurrency(incomeStatement?.otherExpenses || 0) }}</span>
                </div>
              </div>

              <!-- 5. Net Income / Loss Final Line -->
              <div class="pt-6">
                <div 
                  class="flex justify-between items-center p-4 rounded-2xl border text-lg font-black"
                  :class="(incomeStatement?.netIncome || 0) >= 0 
                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-900' 
                    : 'bg-rose-500/15 border-rose-500/30 text-rose-900'"
                >
                  <div class="flex items-center gap-2">
                    <CheckCircle2 v-if="(incomeStatement?.netIncome || 0) >= 0" class="w-6 h-6 text-emerald-600" />
                    <AlertCircle v-else class="w-6 h-6 text-rose-600" />
                    <span>{{ (incomeStatement?.netIncome || 0) >= 0 ? $t('finance.netProfit') : $t('finance.netLoss') }}</span>
                  </div>
                  <span class="font-mono text-2xl" :class="(incomeStatement?.netIncome || 0) >= 0 ? 'text-emerald-700' : 'text-rose-700'">
                    {{ formatCurrency(incomeStatement?.netIncome || 0) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- STATEMENT VIEW B: BALANCE SHEET -->
        <div v-else-if="statementType === 'balance-sheet'" class="space-y-6">
          <!-- Balance Sheet Header Status Banner -->
          <div 
            class="p-4 rounded-2xl border flex items-center justify-between shadow-xs select-none"
            :class="balanceSheet?.balanced ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'"
          >
            <div class="flex items-center gap-3">
              <div 
                class="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-sm"
                :class="balanceSheet?.balanced ? 'bg-emerald-600' : 'bg-rose-600'"
              >
                <Scale class="w-5 h-5" />
              </div>
              <div>
                <h4 class="font-black text-sm">
                  {{ balanceSheet?.balanced ? $t('finance.equationBalanced') : $t('finance.equationDiscrepancy') }}
                </h4>
                <p class="text-xs opacity-90 mt-0.5">
                  {{ $t('finance.assets') }} ({{ formatCurrency(balanceSheet?.totalAssets || 0) }}) = {{ $t('finance.liabilitiesEquity') }} ({{ formatCurrency(balanceSheet?.totalLiabilitiesAndEquity || 0) }})
                </p>
              </div>
            </div>

            <div class="text-right font-mono">
              <span class="text-[10px] uppercase font-bold tracking-wider block opacity-75">{{ $t('finance.asOf') }}</span>
              <span class="text-sm font-bold">{{ statementAsOfDate }}</span>
            </div>
          </div>

          <!-- Assets vs Liabilities & Equity 2-Column Grid -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Left Column: ASSETS -->
            <div class="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-sm overflow-hidden flex flex-col justify-between">
              <div>
                <div class="p-4 bg-surface-container-low border-b border-outline-variant flex justify-between items-center">
                  <h3 class="text-sm font-black text-primary uppercase tracking-wide flex items-center gap-2">
                    <Building2 class="w-4 h-4" />
                    <span>{{ $t('finance.assets') }}</span>
                  </h3>
                  <span class="text-xs font-mono font-bold text-primary">{{ formatCurrency(balanceSheet?.totalAssets || 0) }}</span>
                </div>

                <div class="p-5 space-y-5 text-xs font-sans">
                  <!-- Non-Current Assets (Fixed & Long Term) -->
                  <div class="space-y-2">
                    <div class="font-bold uppercase tracking-wider text-on-surface-variant flex justify-between">
                      <span>{{ $t('finance.nonCurrentAssets') }}</span>
                      <span>{{ $t('suppliers.tableBalance') }}</span>
                    </div>
                    <div 
                      v-for="item in (balanceSheet?.nonCurrentAssets || [])" 
                      :key="item.accountCode"
                      class="flex justify-between items-center py-1 text-on-surface hover:bg-surface-container-low px-2 rounded-lg"
                    >
                      <span class="flex items-center gap-2 font-medium">
                        <span class="font-mono text-[11px] text-on-surface-variant">{{ item.accountCode }}</span>
                        <span>{{ item.accountName }}</span>
                      </span>
                      <span class="font-mono font-semibold">{{ formatCurrency(item.balance) }}</span>
                    </div>
                    <div v-if="!balanceSheet?.nonCurrentAssets?.length" class="text-on-surface-variant italic px-2">
                      No fixed assets recorded.
                    </div>
                    <div class="flex justify-between items-center pt-1 font-bold text-on-surface bg-surface-container-low/60 px-3 py-1.5 rounded-lg">
                      <span>{{ $t('finance.totalNonCurrentAssets') }}</span>
                      <span class="font-mono text-primary">{{ formatCurrency(balanceSheet?.totalNonCurrentAssets || 0) }}</span>
                    </div>
                  </div>

                  <!-- Current Assets (Liquid) -->
                  <div class="space-y-2">
                    <div class="font-bold uppercase tracking-wider text-on-surface-variant flex justify-between">
                      <span>{{ $t('finance.currentAssets') }}</span>
                      <span>{{ $t('suppliers.tableBalance') }}</span>
                    </div>
                    <div 
                      v-for="item in displayedCurrentAssets" 
                      :key="item.accountCode"
                      class="flex justify-between items-center py-1 text-on-surface hover:bg-surface-container-low px-2 rounded-lg"
                    >
                      <span class="flex items-center gap-2 font-medium">
                        <span class="font-mono text-[11px] text-on-surface-variant">{{ item.accountCode }}</span>
                        <span>{{ item.accountName }}</span>
                      </span>
                      <span class="font-mono font-semibold">{{ formatCurrency(item.balance) }}</span>
                    </div>
                    <div class="flex justify-between items-center pt-1 font-bold text-on-surface bg-surface-container-low/60 px-3 py-1.5 rounded-lg">
                      <span>{{ $t('finance.totalCurrentAssets') }}</span>
                      <span class="font-mono text-primary">{{ formatCurrency(balanceSheet?.totalCurrentAssets || 0) }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Total Assets Footer -->
              <div class="p-4 bg-primary/10 border-t border-primary/20 flex justify-between items-center font-black text-sm text-primary">
                <span>{{ $t('finance.totalAssets') }}</span>
                <span class="font-mono text-xl">{{ formatCurrency(balanceSheet?.totalAssets || 0) }}</span>
              </div>
            </div>

            <!-- Right Column: LIABILITIES & EQUITY -->
            <div class="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-sm overflow-hidden flex flex-col justify-between">
              <div>
                <div class="p-4 bg-surface-container-low border-b border-outline-variant flex justify-between items-center">
                  <h3 class="text-sm font-black text-amber-700 uppercase tracking-wide flex items-center gap-2">
                    <ShieldCheck class="w-4 h-4" />
                    <span>{{ $t('finance.liabilitiesEquity') }}</span>
                  </h3>
                  <span class="text-xs font-mono font-bold text-amber-700">{{ formatCurrency(balanceSheet?.totalLiabilitiesAndEquity || 0) }}</span>
                </div>

                <div class="p-5 space-y-5 text-xs font-sans">
                  <!-- Non-Current Liabilities -->
                  <div class="space-y-2" v-if="(balanceSheet?.nonCurrentLiabilities?.length || 0) > 0">
                    <div class="font-bold uppercase tracking-wider text-amber-800 flex justify-between">
                      <span>{{ $t('finance.nonCurrentLiabilities') }}</span>
                      <span>{{ $t('suppliers.tableBalance') }}</span>
                    </div>
                    <div 
                      v-for="item in (balanceSheet?.nonCurrentLiabilities || [])" 
                      :key="item.accountCode"
                      class="flex justify-between items-center py-1 text-on-surface hover:bg-surface-container-low px-2 rounded-lg"
                    >
                      <span class="flex items-center gap-2 font-medium">
                        <span class="font-mono text-[11px] text-on-surface-variant">{{ item.accountCode }}</span>
                        <span>{{ item.accountName }}</span>
                      </span>
                      <span class="font-mono font-semibold">{{ formatCurrency(item.balance) }}</span>
                    </div>
                    <div class="flex justify-between items-center pt-1 font-bold text-on-surface bg-surface-container-low/60 px-3 py-1.5 rounded-lg">
                      <span>{{ $t('finance.totalNonCurrentLiabilities') }}</span>
                      <span class="font-mono">{{ formatCurrency(balanceSheet?.totalNonCurrentLiabilities || 0) }}</span>
                    </div>
                  </div>

                  <!-- Current Liabilities -->
                  <div class="space-y-2">
                    <div class="font-bold uppercase tracking-wider text-amber-800 flex justify-between">
                      <span>{{ $t('finance.currentLiabilities') }}</span>
                      <span>{{ $t('suppliers.tableBalance') }}</span>
                    </div>
                    <div 
                      v-for="item in displayedCurrentLiabilities" 
                      :key="item.accountCode"
                      class="flex justify-between items-center py-1 text-on-surface hover:bg-surface-container-low px-2 rounded-lg"
                    >
                      <span class="flex items-center gap-2 font-medium">
                        <span class="font-mono text-[11px] text-on-surface-variant">{{ item.accountCode }}</span>
                        <span>{{ item.accountName }}</span>
                      </span>
                      <span class="font-mono font-semibold text-amber-700">{{ formatCurrency(item.balance) }}</span>
                    </div>
                    <div class="flex justify-between items-center pt-1 font-bold text-on-surface bg-amber-500/10 px-3 py-1.5 rounded-lg text-amber-900">
                      <span>{{ $t('finance.totalCurrentLiabilities') }}</span>
                      <span class="font-mono">{{ formatCurrency(balanceSheet?.totalCurrentLiabilities || 0) }}</span>
                    </div>
                  </div>

                  <!-- Total Liabilities Subtotal -->
                  <div class="flex justify-between items-center pt-1 font-bold text-on-surface bg-surface-container-low px-3 py-1.5 rounded-lg">
                    <span>{{ $t('finance.totalLiabilities') }}</span>
                    <span class="font-mono font-black">{{ formatCurrency(balanceSheet?.totalLiabilities || 0) }}</span>
                  </div>

                  <!-- Equity Section -->
                  <div class="space-y-2 pt-2 border-t border-outline-variant/40">
                    <div class="font-bold uppercase tracking-wider text-purple-800 flex justify-between">
                      <span>{{ $t('finance.totalEquity') }}</span>
                      <span>{{ $t('suppliers.tableBalance') }}</span>
                    </div>
                    <div 
                      v-for="item in displayedEquityLines" 
                      :key="item.accountCode"
                      class="flex justify-between items-center py-1 text-on-surface hover:bg-surface-container-low px-2 rounded-lg"
                    >
                      <span class="flex items-center gap-2 font-medium">
                        <span class="font-mono text-[11px] text-on-surface-variant">{{ item.accountCode }}</span>
                        <span>{{ item.accountName }}</span>
                      </span>
                      <span class="font-mono font-semibold">{{ formatCurrency(item.balance) }}</span>
                    </div>
                    <div class="flex justify-between items-center py-1 px-2" :class="(balanceSheet?.currentPeriodNetIncome || 0) >= 0 ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'">
                      <span class="font-medium">{{ $t('finance.currentPeriodNetIncome') }}</span>
                      <span class="font-mono">{{ formatCurrency(balanceSheet?.currentPeriodNetIncome || 0) }}</span>
                    </div>
                    <div class="flex justify-between items-center pt-1 font-bold text-purple-950 bg-purple-500/10 px-3 py-1.5 rounded-lg">
                      <span>{{ $t('finance.totalEquity') }}</span>
                      <span class="font-mono font-black text-purple-800">{{ formatCurrency(balanceSheet?.totalEquity || 0) }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Total Liabilities & Equity Footer -->
              <div class="p-4 bg-amber-500/15 border-t border-amber-500/20 flex justify-between items-center font-black text-sm text-amber-950">
                <span>{{ $t('finance.totalLiabilitiesEquity') }}</span>
                <span class="font-mono text-xl">{{ formatCurrency(balanceSheet?.totalLiabilitiesAndEquity || 0) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- STATEMENT VIEW C: TRIAL BALANCE -->
        <div v-else-if="statementType === 'trial-balance'" class="space-y-6">
          <div class="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-sm overflow-hidden">
            <div class="p-5 bg-surface-container-low border-b border-outline-variant flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 class="text-sm font-black text-on-surface uppercase tracking-wide flex items-center gap-2">
                  <CheckCircle2 class="w-4 h-4 text-emerald-600" />
                  <span>{{ $t('finance.trialBalance') }}</span>
                </h3>
                <p class="text-xs text-on-surface-variant mt-0.5">As of {{ statementAsOfDate }} • Ensuring double-entry equality across all active accounts</p>
              </div>

              <div class="flex items-center gap-3">
                <span 
                  class="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold font-mono rounded-full border"
                  :class="trialBalance?.balanced ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20' : 'bg-rose-500/10 text-rose-700 border-rose-500/20'"
                >
                  <span class="w-2 h-2 rounded-full" :class="trialBalance?.balanced ? 'bg-emerald-500' : 'bg-rose-500'"></span>
                  {{ trialBalance?.balanced ? $t('finance.balanced') : $t('finance.discrepancy') }}
                </span>
              </div>
            </div>

            <!-- Table -->
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs select-none">
                <thead class="bg-[#f0f3f0] text-[10px] font-mono uppercase font-bold text-on-surface-variant border-b border-outline-variant">
                  <tr>
                    <th class="p-3.5 pl-5">{{ $t('finance.accountCode') }}</th>
                    <th class="p-3.5">{{ $t('finance.accountName') }}</th>
                    <th class="p-3.5">{{ $t('customers.tableType') }}</th>
                    <th class="p-3.5">{{ $t('inventory.category') }}</th>
                    <th class="p-3.5 text-right">{{ $t('finance.debit') }} (TZS)</th>
                    <th class="p-3.5 text-right pr-5">{{ $t('finance.credit') }} (TZS)</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-surface-variant">
                  <tr 
                    v-for="item in (trialBalance?.accounts || [])" 
                    :key="item.accountId"
                    class="hover:bg-surface-container-high/60 transition-colors"
                  >
                    <td class="p-3.5 pl-5 font-mono font-bold text-primary">{{ item.accountCode }}</td>
                    <td class="p-3.5 font-bold text-on-surface">{{ item.accountName }}</td>
                    <td class="p-3.5">
                      <span class="px-2 py-0.5 rounded text-[10px] font-bold" :class="getAccountTypeBadgeClass(item.accountType)">
                        {{ item.accountType }}
                      </span>
                    </td>
                    <td class="p-3.5 font-mono text-[11px] text-on-surface-variant">{{ formatCategoryName(item.accountCategory) }}</td>
                    <td class="p-3.5 text-right font-mono font-semibold" :class="item.netDebit > 0 ? 'text-on-surface' : 'text-on-surface-variant/40'">
                      {{ item.netDebit > 0 ? formatCurrency(item.netDebit) : '-' }}
                    </td>
                    <td class="p-3.5 text-right pr-5 font-mono font-semibold" :class="item.netCredit > 0 ? 'text-on-surface' : 'text-on-surface-variant/40'">
                      {{ item.netCredit > 0 ? formatCurrency(item.netCredit) : '-' }}
                    </td>
                  </tr>
                  <tr v-if="!trialBalance?.accounts?.length">
                    <td colspan="6" class="p-8 text-center text-on-surface-variant font-medium">
                      No ledger balances found for trial balance calculation.
                    </td>
                  </tr>
                </tbody>
                <!-- Total Row -->
                <tfoot class="bg-surface-container-low border-t-2 border-outline-variant font-black text-xs">
                  <tr>
                    <td colspan="4" class="p-4 pl-5 uppercase tracking-wider text-on-surface">TOTAL SUMMARY (BALANCED)</td>
                    <td class="p-4 text-right font-mono text-sm text-primary">{{ formatCurrency(trialBalance?.totalDebit || 0) }}</td>
                    <td class="p-4 text-right pr-5 font-mono text-sm text-primary">{{ formatCurrency(trialBalance?.totalCredit || 0) }}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- ========================================================================= -->
      <!-- SUBMODULE 2: CHART OF ACCOUNTS (COA) -->
      <!-- ========================================================================= -->
      <div v-else-if="activeSubmodule === 'accounts'" class="space-y-6">
        <!-- COA Summary Cards -->
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          <div 
            v-for="t in (['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE'] as const)" 
            :key="t"
            @click="coaTypeFilter = coaTypeFilter === t ? 'ALL' : t"
            class="p-4 rounded-2xl border transition-all cursor-pointer shadow-xs"
            :class="coaTypeFilter === t 
              ? 'bg-primary-container/25 border-primary ring-2 ring-primary/30' 
              : 'bg-surface-container-lowest border-outline-variant hover:border-primary/40'"
          >
            <div class="flex justify-between items-center">
              <span class="text-[11px] font-mono font-bold uppercase" :class="getTypeTextColor(t)">{{ t }}</span>
              <span class="text-xs font-black font-mono px-2 py-0.5 rounded-full bg-surface-container-high">
                {{ accounts.filter(a => a.accountType === t).length }}
              </span>
            </div>
            <div class="text-xs font-bold text-on-surface mt-2 truncate">{{ getTypeLabel(t) }}</div>
          </div>
        </div>

        <!-- Filter & Search Toolbar -->
        <div class="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <!-- Search Bar -->
          <div class="relative flex-1 max-w-md">
            <Search class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/60" />
            <input 
              v-model="coaSearchQuery"
              type="text" 
              placeholder="Search by code (e.g. 1010) or account name..."
              class="w-full h-10 pl-10 pr-4 bg-surface-container-low border border-outline-variant rounded-xl text-xs font-medium outline-none focus:border-primary transition-all"
            />
          </div>

          <!-- Type Filter Tabs -->
          <div class="flex flex-wrap items-center gap-1.5 text-xs">
            <button 
              v-for="opt in ['ALL', 'ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE']"
              :key="opt"
              @click="coaTypeFilter = opt"
              class="px-3 py-1.5 rounded-lg font-bold border transition-colors cursor-pointer text-[11px]"
              :class="coaTypeFilter === opt ? 'bg-primary text-on-primary border-primary' : 'bg-surface border-outline-variant text-on-surface-variant hover:bg-surface-container'"
            >
              {{ opt }}
            </button>
          </div>
        </div>

        <!-- Accounts Table -->
        <div class="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-sm overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs select-none">
              <thead class="bg-[#f0f3f0] text-[10px] font-mono uppercase font-bold text-on-surface-variant border-b border-outline-variant">
                <tr>
                  <th class="p-4 pl-5">{{ $t('finance.accountCode') }}</th>
                  <th class="p-4">{{ $t('finance.accountName') }}</th>
                  <th class="p-4">{{ $t('customers.tableType') }}</th>
                  <th class="p-4">{{ $t('inventory.category') }}</th>
                  <th class="p-4 text-center">Class</th>
                  <th class="p-4 text-center">{{ $t('customers.tableStatus') }}</th>
                  <th class="p-4 text-right pr-5">{{ $t('customers.tableActions') }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-surface-variant">
                <tr 
                  v-for="acc in filteredAccounts" 
                  :key="acc.id"
                  class="hover:bg-surface-container-high/50 transition-colors"
                >
                  <td class="p-4 pl-5 font-mono font-black text-sm text-primary">{{ acc.code }}</td>
                  <td class="p-4">
                    <div class="font-bold text-on-surface text-sm">{{ acc.name }}</div>
                    <div v-if="acc.description" class="text-[11px] text-on-surface-variant mt-0.5 line-clamp-1">{{ acc.description }}</div>
                    <div v-if="acc.parentName" class="text-[10px] text-primary font-medium mt-0.5">Parent: {{ acc.parentName }}</div>
                  </td>
                  <td class="p-4">
                    <span class="px-2.5 py-0.5 rounded text-[10px] font-bold" :class="getAccountTypeBadgeClass(acc.accountType)">
                      {{ acc.accountType }}
                    </span>
                  </td>
                  <td class="p-4 font-mono text-[11px] text-on-surface-variant">{{ formatCategoryName(acc.accountCategory) }}</td>
                  <td class="p-4 text-center">
                    <span 
                      class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                      :class="acc.system ? 'bg-surface-container-high text-on-surface-variant' : 'bg-primary/10 text-primary border border-primary/20'"
                    >
                      {{ acc.system ? 'System' : 'Custom' }}
                    </span>
                  </td>
                  <td class="p-4 text-center">
                    <span 
                      class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold"
                      :class="acc.active ? 'bg-emerald-500/10 text-emerald-700' : 'bg-rose-500/10 text-rose-700'"
                    >
                      {{ acc.active ? $t('common.active') : $t('common.inactive') }}
                    </span>
                  </td>
                  <td class="p-4 text-right pr-5">
                    <button 
                      @click="drillDownToLedger(acc.id)"
                      class="px-2.5 py-1 rounded-lg bg-surface-container hover:bg-primary hover:text-white text-on-surface text-xs font-bold transition-colors cursor-pointer border border-outline-variant"
                      title="View Transaction Ledger Statement"
                    >
                      Ledger Statement &rarr;
                    </button>
                  </td>
                </tr>
                <tr v-if="filteredAccounts.length === 0">
                  <td colspan="7" class="p-8 text-center text-on-surface-variant font-medium">
                    No chart of accounts found matching your filter criteria.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ========================================================================= -->
      <!-- SUBMODULE 3: GENERAL LEDGER & JOURNALS -->
      <!-- ========================================================================= -->
      <div v-else-if="activeSubmodule === 'journal'" class="space-y-6">
        <!-- Filters Header -->
        <div class="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="flex flex-wrap items-center gap-3">
            <!-- Date range -->
            <div class="flex items-center gap-1.5">
              <span class="text-[11px] font-mono font-bold text-on-surface-variant uppercase">{{ $t('reports.fromDate') }}</span>
              <input 
                type="date" 
                v-model="journalStartDate" 
                class="h-9 px-2.5 bg-surface-container-low border border-outline-variant rounded-lg text-xs font-bold text-on-surface outline-none"
              />
            </div>
            <div class="flex items-center gap-1.5">
              <span class="text-[11px] font-mono font-bold text-on-surface-variant uppercase">{{ $t('reports.toDate') }}</span>
              <input 
                type="date" 
                v-model="journalEndDate" 
                class="h-9 px-2.5 bg-surface-container-low border border-outline-variant rounded-lg text-xs font-bold text-on-surface outline-none"
              />
            </div>

            <button 
              @click="loadJournalEntries(0)"
              class="h-9 px-4 rounded-lg bg-primary text-on-primary font-bold text-xs flex items-center gap-1.5 hover:bg-opacity-90 active:scale-95 cursor-pointer transition-all shadow-xs"
            >
              <Search class="w-3.5 h-3.5" />
              <span>Search Entries</span>
            </button>
          </div>

          <div class="text-xs text-on-surface-variant font-mono font-semibold">
            Total Entries: <strong class="text-primary">{{ journalPagination.totalElements }}</strong>
          </div>
        </div>

        <!-- Journal Entries List Table -->
        <div class="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-sm overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs select-none">
              <thead class="bg-[#f0f3f0] text-[10px] font-mono uppercase font-bold text-on-surface-variant border-b border-outline-variant">
                <tr>
                  <th class="p-4 pl-5">Entry #</th>
                  <th class="p-4">{{ $t('receipt.date') }}</th>
                  <th class="p-4">Source / Ref Type</th>
                  <th class="p-4">{{ $t('customers.notes') }}</th>
                  <th class="p-4">{{ $t('topNav.branch') }}</th>
                  <th class="p-4 text-right">{{ $t('finance.debit') }}</th>
                  <th class="p-4 text-right">{{ $t('finance.credit') }}</th>
                  <th class="p-4 text-center">{{ $t('customers.tableStatus') }}</th>
                  <th class="p-4 text-right pr-5">Voucher</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-surface-variant">
                <tr 
                  v-for="je in journalEntries" 
                  :key="je.id"
                  @click="openVoucherModal(je)"
                  class="hover:bg-surface-container-high/60 transition-colors cursor-pointer"
                >
                  <td class="p-4 pl-5 font-mono font-bold text-primary">{{ je.entryNumber }}</td>
                  <td class="p-4 font-mono text-on-surface-variant">{{ je.entryDate }}</td>
                  <td class="p-4">
                    <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-surface-container-high text-on-surface">
                      {{ je.referenceType }}
                    </span>
                  </td>
                  <td class="p-4 font-bold text-on-surface max-w-xs truncate">{{ je.description }}</td>
                  <td class="p-4 text-on-surface-variant">{{ je.branchName || 'Main' }}</td>
                  <td class="p-4 text-right font-mono font-bold text-emerald-600">{{ formatCurrency(je.totalDebit) }}</td>
                  <td class="p-4 text-right font-mono font-bold text-blue-600">{{ formatCurrency(je.totalCredit) }}</td>
                  <td class="p-4 text-center">
                    <span 
                      class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold"
                      :class="je.status === 'POSTED' ? 'bg-emerald-500/10 text-emerald-700' : 'bg-rose-500/10 text-rose-700'"
                    >
                      {{ je.status }}
                    </span>
                  </td>
                  <td class="p-4 text-right pr-5">
                    <button 
                      @click.stop="openVoucherModal(je)"
                      class="p-1.5 rounded-lg text-primary hover:bg-primary-container transition-colors"
                      title="View Voucher Breakdown"
                    >
                      <Eye class="w-4 h-4" />
                    </button>
                  </td>
                </tr>
                <tr v-if="journalEntries.length === 0">
                  <td colspan="9" class="p-8 text-center text-on-surface-variant font-medium">
                    No journal entries found for the selected date range.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination Footer -->
          <div class="p-4 bg-surface-container-lowest border-t border-outline-variant flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-sans">
            <div class="text-on-surface-variant">
              Showing {{ journalEntries.length === 0 ? 0 : journalPagination.page * journalPagination.size + 1 }} to 
              {{ Math.min((journalPagination.page + 1) * journalPagination.size, journalPagination.totalElements) }} of {{ journalPagination.totalElements }} entries
            </div>

            <div class="flex items-center gap-2">
              <button 
                :disabled="journalPagination.page === 0"
                @click="loadJournalEntries(journalPagination.page - 1)"
                class="px-3 py-1.5 rounded-lg border border-outline-variant bg-surface hover:bg-surface-container-high disabled:opacity-40 cursor-pointer font-bold"
              >
                Previous
              </button>
              <span class="font-mono font-bold px-2">Page {{ journalPagination.page + 1 }} of {{ Math.max(1, journalPagination.totalPages) }}</span>
              <button 
                :disabled="journalPagination.page >= journalPagination.totalPages - 1"
                @click="loadJournalEntries(journalPagination.page + 1)"
                class="px-3 py-1.5 rounded-lg border border-outline-variant bg-surface hover:bg-surface-container-high disabled:opacity-40 cursor-pointer font-bold"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ========================================================================= -->
      <!-- SUBMODULE 4: ACCOUNT STATEMENT (DRILL-DOWN) -->
      <!-- ========================================================================= -->
      <div v-else-if="activeSubmodule === 'ledger'" class="space-y-6">
        <!-- Account & Date Selector Toolbar -->
        <div class="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div class="flex flex-wrap items-center gap-4 flex-1">
            <!-- Account Dropdown -->
            <div class="flex flex-col gap-1 min-w-[280px]">
              <label class="text-[10px] font-mono font-bold text-on-surface-variant uppercase tracking-wider">Select Account</label>
              <select 
                v-model="selectedLedgerAccountId"
                @change="loadAccountStatement"
                class="h-10 px-3 bg-surface-container-low border border-outline-variant rounded-xl text-xs font-bold text-on-surface outline-none cursor-pointer"
              >
                <option value="" disabled>-- Choose an Account --</option>
                <option v-for="a in accounts" :key="a.id" :value="a.id">
                  {{ a.code }} - {{ a.name }} ({{ a.accountType }})
                </option>
              </select>
            </div>

            <!-- Date Range -->
            <div class="flex flex-col gap-1">
              <label class="text-[10px] font-mono font-bold text-on-surface-variant uppercase tracking-wider">{{ $t('reports.fromDate') }}</label>
              <input 
                type="date" 
                v-model="ledgerStartDate" 
                class="h-10 px-3 bg-surface-container-low border border-outline-variant rounded-xl text-xs font-bold text-on-surface outline-none"
              />
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-[10px] font-mono font-bold text-on-surface-variant uppercase tracking-wider">{{ $t('reports.toDate') }}</label>
              <input 
                type="date" 
                v-model="ledgerEndDate" 
                class="h-10 px-3 bg-surface-container-low border border-outline-variant rounded-xl text-xs font-bold text-on-surface outline-none"
              />
            </div>

            <div class="flex flex-col gap-1 justify-end pt-4">
              <button 
                @click="loadAccountStatement"
                class="h-10 px-5 rounded-xl bg-primary text-on-primary font-bold text-xs flex items-center gap-1.5 hover:bg-opacity-90 active:scale-95 cursor-pointer shadow-xs"
              >
                <Search class="w-3.5 h-3.5" />
                <span>Load Statement</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Ledger Statement Report View -->
        <div v-if="accountStatement" class="space-y-6">
          <!-- Summary Cards -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant shadow-xs">
              <span class="text-[10px] font-mono font-bold text-on-surface-variant uppercase tracking-wider">{{ $t('cashMovements.openingBalance') }}</span>
              <p class="text-xl font-black font-mono text-on-surface mt-1.5">{{ formatCurrency(accountStatement.openingBalance) }}</p>
              <p class="text-[10px] text-on-surface-variant mt-1">Balance as of {{ accountStatement.startDate }}</p>
            </div>

            <div class="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant shadow-xs">
              <span class="text-[10px] font-mono font-bold text-emerald-700 uppercase tracking-wider">{{ $t('finance.debits') }}</span>
              <p class="text-xl font-black font-mono text-emerald-600 mt-1.5">{{ formatCurrency(accountStatement.totalDebit) }}</p>
              <p class="text-[10px] text-emerald-700 mt-1">Cumulative debits posted</p>
            </div>

            <div class="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant shadow-xs">
              <span class="text-[10px] font-mono font-bold text-blue-700 uppercase tracking-wider">{{ $t('finance.credits') }}</span>
              <p class="text-xl font-black font-mono text-blue-600 mt-1.5">{{ formatCurrency(accountStatement.totalCredit) }}</p>
              <p class="text-[10px] text-blue-700 mt-1">Cumulative credits posted</p>
            </div>

            <div class="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant shadow-xs">
              <span class="text-[10px] font-mono font-bold text-primary uppercase tracking-wider">{{ $t('cashMovements.closingBalance') }}</span>
              <p class="text-xl font-black font-mono text-primary mt-1.5">{{ formatCurrency(accountStatement.closingBalance) }}</p>
              <p class="text-[10px] text-primary mt-1">Ending ledger balance</p>
            </div>
          </div>

          <!-- Transaction Movements Table -->
          <div class="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-sm overflow-hidden">
            <div class="p-4 bg-surface-container-low border-b border-outline-variant flex justify-between items-center">
              <div>
                <h3 class="text-sm font-black text-on-surface uppercase tracking-wide">
                  {{ accountStatement.accountCode }} - {{ accountStatement.accountName }}
                </h3>
                <p class="text-xs text-on-surface-variant mt-0.5">
                  Ledger Statement from {{ accountStatement.startDate }} to {{ accountStatement.endDate }}
                </p>
              </div>
              <span class="px-2.5 py-1 rounded text-xs font-bold" :class="getAccountTypeBadgeClass(accountStatement.accountType)">
                {{ accountStatement.accountType }}
              </span>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs select-none">
                <thead class="bg-[#f0f3f0] text-[10px] font-mono uppercase font-bold text-on-surface-variant border-b border-outline-variant">
                  <tr>
                    <th class="p-3.5 pl-5">{{ $t('receipt.date') }}</th>
                    <th class="p-3.5">Entry #</th>
                    <th class="p-3.5">{{ $t('customers.tableType') }}</th>
                    <th class="p-3.5">{{ $t('customers.notes') }}</th>
                    <th class="p-3.5">{{ $t('topNav.branch') }}</th>
                    <th class="p-3.5 text-right">{{ $t('finance.debit') }} (+)</th>
                    <th class="p-3.5 text-right">{{ $t('finance.credit') }} (-)</th>
                    <th class="p-3.5 text-right pr-5">Running Balance</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-surface-variant">
                  <!-- Opening Balance Row -->
                  <tr class="bg-surface-container-low/40 font-bold text-xs">
                    <td class="p-3 pl-5 font-mono text-on-surface-variant">{{ accountStatement.startDate }}</td>
                    <td colspan="4" class="p-3 text-on-surface uppercase tracking-wider text-[11px]">OPENING BALANCE BROUGHT FORWARD</td>
                    <td class="p-3 text-right font-mono">-</td>
                    <td class="p-3 text-right font-mono">-</td>
                    <td class="p-3 text-right pr-5 font-mono font-black text-primary">{{ formatCurrency(accountStatement.openingBalance) }}</td>
                  </tr>

                  <!-- Transactions -->
                  <tr 
                    v-for="(t, idx) in accountStatement.transactions" 
                    :key="idx"
                    class="hover:bg-surface-container-high/50 transition-colors"
                  >
                    <td class="p-3.5 pl-5 font-mono text-on-surface-variant">{{ t.entryDate }}</td>
                    <td class="p-3.5 font-mono font-bold text-primary">{{ t.entryNumber }}</td>
                    <td class="p-3.5">
                      <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-surface-container-high text-on-surface">
                        {{ t.referenceType }}
                      </span>
                    </td>
                    <td class="p-3.5 font-medium text-on-surface">{{ t.description }}</td>
                    <td class="p-3.5 text-on-surface-variant">{{ t.branchName || 'Main' }}</td>
                    <td class="p-3.5 text-right font-mono font-semibold" :class="t.debit > 0 ? 'text-emerald-600 font-bold' : 'text-on-surface-variant/40'">
                      {{ t.debit > 0 ? formatCurrency(t.debit) : '-' }}
                    </td>
                    <td class="p-3.5 text-right font-mono font-semibold" :class="t.credit > 0 ? 'text-blue-600 font-bold' : 'text-on-surface-variant/40'">
                      {{ t.credit > 0 ? formatCurrency(t.credit) : '-' }}
                    </td>
                    <td class="p-3.5 text-right pr-5 font-mono font-bold text-on-surface">
                      {{ formatCurrency(t.runningBalance) }}
                    </td>
                  </tr>

                  <tr v-if="!accountStatement.transactions?.length">
                    <td colspan="8" class="p-6 text-center text-on-surface-variant italic">
                      No transaction entries recorded for this account during this period.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div v-else class="p-12 text-center text-on-surface-variant bg-surface-container-lowest rounded-2xl border border-outline-variant">
          <BookOpen class="w-12 h-12 text-outline-variant mx-auto mb-3" />
          <h4 class="text-base font-bold text-on-surface">Select an Account to View Ledger Statement</h4>
          <p class="text-xs text-on-surface-variant mt-1">Choose any Chart of Account from the dropdown above to inspect debit and credit movements.</p>
        </div>
      </div>

      <!-- ========================================================================= -->
      <!-- SUBMODULE 5: FINANCIAL PERIODS -->
      <!-- ========================================================================= -->
      <div v-else-if="activeSubmodule === 'periods'" class="space-y-6">
        <!-- Active Period Card -->
        <div class="p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div class="flex items-start gap-4">
            <div class="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
              <CalendarCheck class="w-6 h-6" />
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="text-xs font-mono uppercase font-bold text-emerald-700 px-2 py-0.5 rounded bg-emerald-500/10">Active Period</span>
                <h3 class="text-xl font-black text-on-surface font-mono">{{ currentPeriod?.name || $t('common.loading') }}</h3>
              </div>
              <p class="text-xs text-on-surface-variant mt-1">
                Duration: <strong class="font-mono text-on-surface">{{ currentPeriod?.startDate }}</strong> to <strong class="font-mono text-on-surface">{{ currentPeriod?.endDate }}</strong>
              </p>
              <p class="text-xs text-on-surface-variant/80 mt-0.5">
                New sales and manual journal entries will be posted to this open period.
              </p>
            </div>
          </div>

          <div v-if="currentPeriod && currentPeriod.status === 'OPEN'">
            <button 
              @click="openClosePeriodConfirmModal"
              class="px-5 py-2.5 rounded-xl bg-amber-600 text-white font-bold text-xs hover:bg-amber-700 active:scale-95 transition-all shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <Lock class="w-4 h-4" />
              <span>{{ $t('finance.closePeriod') }}</span>
            </button>
          </div>
        </div>

        <!-- All Periods History -->
        <div class="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-sm overflow-hidden">
          <div class="p-4 bg-surface-container-low border-b border-outline-variant">
            <h3 class="text-sm font-black text-on-surface uppercase tracking-wide">Fiscal Periods Audit History</h3>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs select-none">
              <thead class="bg-[#f0f3f0] text-[10px] font-mono uppercase font-bold text-on-surface-variant border-b border-outline-variant">
                <tr>
                  <th class="p-4 pl-5">Period Name</th>
                  <th class="p-4">{{ $t('reports.fromDate') }}</th>
                  <th class="p-4">{{ $t('reports.toDate') }}</th>
                  <th class="p-4 text-center">{{ $t('customers.tableStatus') }}</th>
                  <th class="p-4">Closed At</th>
                  <th class="p-4 pr-5">Closed By</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-surface-variant">
                <tr 
                  v-for="p in periods" 
                  :key="p.id"
                  class="hover:bg-surface-container-high/50 transition-colors"
                >
                  <td class="p-4 pl-5 font-mono font-bold text-sm text-primary">{{ p.name }}</td>
                  <td class="p-4 font-mono text-on-surface-variant">{{ p.startDate }}</td>
                  <td class="p-4 font-mono text-on-surface-variant">{{ p.endDate }}</td>
                  <td class="p-4 text-center">
                    <span 
                      class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold"
                      :class="p.status === 'OPEN' ? 'bg-emerald-500/10 text-emerald-700' : 'bg-gray-500/10 text-gray-700'"
                    >
                      <span class="w-1.5 h-1.5 rounded-full" :class="p.status === 'OPEN' ? 'bg-emerald-500' : 'bg-gray-500'"></span>
                      {{ p.status }}
                    </span>
                  </td>
                  <td class="p-4 font-mono text-xs text-on-surface-variant">
                    {{ p.closedAt ? new Date(p.closedAt).toLocaleString() : '-' }}
                  </td>
                  <td class="p-4 pr-5 text-on-surface font-medium">{{ p.closedByName || '-' }}</td>
                </tr>
                <tr v-if="periods.length === 0">
                  <td colspan="6" class="p-8 text-center text-on-surface-variant font-medium">
                    No financial periods recorded yet.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- MODAL 1: NEW BALANCED JOURNAL ENTRY MODAL -->
    <!-- ========================================================================= -->
    <Modal 
      :isOpen="showNewJournalModal" 
      title="Create Manual Journal Entry (Double-Entry)" 
      :onClose="() => showNewJournalModal = false"
      maxWidth="max-w-4xl"
    >
      <div class="flex flex-col gap-5 p-2 font-sans select-none text-xs">
        <!-- Header Information -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-surface-container-low p-4 rounded-xl border border-outline-variant">
          <div class="flex flex-col gap-1.5">
            <label class="font-mono font-bold text-on-surface-variant uppercase text-[10px]">Entry Date</label>
            <input 
              type="date" 
              v-model="newJournal.entryDate" 
              class="h-10 px-3 bg-surface-container-lowest border border-outline-variant rounded-xl text-xs font-bold text-on-surface outline-none"
            />
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="font-mono font-bold text-on-surface-variant uppercase text-[10px]">Reference Type</label>
            <select 
              v-model="newJournal.referenceType"
              class="h-10 px-3 bg-surface-container-lowest border border-outline-variant rounded-xl text-xs font-bold text-on-surface outline-none cursor-pointer"
            >
              <option value="MANUAL">MANUAL ADJUSTMENT</option>
              <option value="EXPENSE">DIRECT EXPENSE</option>
              <option value="TRANSFER">INTER-ACCOUNT TRANSFER</option>
              <option value="DEPRECIATION">DEPRECIATION</option>
              <option value="OPENING">OPENING BALANCE</option>
            </select>
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="font-mono font-bold text-on-surface-variant uppercase text-[10px]">Description Memo</label>
            <input 
              type="text" 
              v-model="newJournal.description" 
              placeholder="e.g. Monthly store rent prepayment..."
              class="h-10 px-3 bg-surface-container-lowest border border-outline-variant rounded-xl text-xs font-medium text-on-surface outline-none"
            />
          </div>
        </div>

        <!-- Double Entry Lines Table -->
        <div class="space-y-3">
          <div class="flex justify-between items-center">
            <span class="font-mono font-bold text-on-surface uppercase text-[11px]">Voucher Line Items (Debits & Credits)</span>
            <button 
              @click="addJournalLine"
              class="px-3 py-1.5 rounded-lg bg-primary/10 text-primary font-bold text-xs hover:bg-primary/20 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Plus class="w-3.5 h-3.5" />
              <span>Add Line</span>
            </button>
          </div>

          <div class="border border-outline-variant rounded-xl overflow-hidden">
            <table class="w-full text-left text-xs">
              <thead class="bg-[#f0f3f0] text-[10px] font-mono uppercase font-bold text-on-surface-variant border-b border-outline-variant">
                <tr>
                  <th class="p-3 pl-4">Account</th>
                  <th class="p-3 w-36 text-right">Debit Amount</th>
                  <th class="p-3 w-36 text-right">Credit Amount</th>
                  <th class="p-3">Line Memo</th>
                  <th class="p-3 w-12 text-center">Action</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-surface-variant bg-surface-container-lowest">
                <tr v-for="(line, idx) in newJournal.lines" :key="idx">
                  <td class="p-2 pl-4">
                    <select 
                      v-model="line.accountId"
                      class="w-full h-9 px-2 bg-surface-container-low border border-outline-variant rounded-lg text-xs font-bold text-on-surface outline-none cursor-pointer"
                    >
                      <option value="" disabled>-- Select Account --</option>
                      <option v-for="a in accounts" :key="a.id" :value="a.id">
                        {{ a.code }} - {{ a.name }} ({{ a.accountType }})
                      </option>
                    </select>
                  </td>
                  <td class="p-2">
                    <input 
                      type="number" 
                      min="0"
                      step="any"
                      v-model.number="line.debit"
                      @input="onDebitInput(line)"
                      placeholder="0.00"
                      class="w-full h-9 px-2 text-right font-mono font-bold text-emerald-600 bg-surface-container-low border border-outline-variant rounded-lg text-xs outline-none"
                    />
                  </td>
                  <td class="p-2">
                    <input 
                      type="number" 
                      min="0"
                      step="any"
                      v-model.number="line.credit"
                      @input="onCreditInput(line)"
                      placeholder="0.00"
                      class="w-full h-9 px-2 text-right font-mono font-bold text-blue-600 bg-surface-container-low border border-outline-variant rounded-lg text-xs outline-none"
                    />
                  </td>
                  <td class="p-2">
                    <input 
                      type="text" 
                      v-model="line.description" 
                      placeholder="Optional memo..."
                      class="w-full h-9 px-2 bg-surface-container-low border border-outline-variant rounded-lg text-xs outline-none"
                    />
                  </td>
                  <td class="p-2 text-center">
                    <button 
                      :disabled="newJournal.lines.length <= 2"
                      @click="removeJournalLine(idx)"
                      class="p-1.5 text-on-surface-variant hover:text-error rounded transition-colors disabled:opacity-30 cursor-pointer"
                    >
                      <Trash2 class="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Live Balancing Status Footer -->
        <div class="p-4 rounded-xl border flex flex-col sm:flex-row justify-between items-center gap-4"
          :class="isJournalBalanced ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-rose-500/10 border-rose-500/30'"
        >
          <div class="flex items-center gap-3">
            <CheckCircle2 v-if="isJournalBalanced" class="w-5 h-5 text-emerald-600" />
            <AlertCircle v-else class="w-5 h-5 text-rose-600" />
            <div>
              <span class="font-bold text-xs" :class="isJournalBalanced ? 'text-emerald-900' : 'text-rose-900'">
                {{ isJournalBalanced ? 'Voucher is Perfectly Balanced' : `Discrepancy: ${formatCurrency(journalDifference)}` }}
              </span>
              <p class="text-[10px] text-on-surface-variant mt-0.5">
                Total Debits MUST equal Total Credits to maintain bookkeeping integrity.
              </p>
            </div>
          </div>

          <div class="flex items-center gap-6 font-mono text-xs">
            <div>
              <span class="text-[10px] text-on-surface-variant uppercase block">Total Debits</span>
              <span class="font-black text-emerald-600 text-sm">{{ formatCurrency(totalJournalDebits) }}</span>
            </div>
            <div>
              <span class="text-[10px] text-on-surface-variant uppercase block">Total Credits</span>
              <span class="font-black text-blue-600 text-sm">{{ formatCurrency(totalJournalCredits) }}</span>
            </div>
          </div>
        </div>

        <!-- Modal Actions -->
        <div class="flex justify-end items-center gap-3 pt-2">
          <button 
            @click="showNewJournalModal = false"
            class="px-4 py-2.5 rounded-xl border border-outline-variant hover:bg-surface-container text-on-surface font-bold text-xs cursor-pointer transition-all"
          >
            {{ $t('common.cancel') }}
          </button>
          <button 
            :disabled="!isJournalBalanced || totalJournalDebits <= 0 || isSubmittingJournal"
            @click="submitNewJournalEntry"
            class="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs hover:bg-opacity-90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all shadow-sm flex items-center gap-1.5"
          >
            <RotateCw v-if="isSubmittingJournal" class="w-3.5 h-3.5 animate-spin" />
            <Check v-else class="w-3.5 h-3.5" />
            <span>{{ isSubmittingJournal ? 'Posting to GL...' : $t('finance.postJournalEntry') }}</span>
          </button>
        </div>
      </div>
    </Modal>

    <!-- ========================================================================= -->
    <!-- MODAL 2: ADD NEW CUSTOM CHART OF ACCOUNT -->
    <!-- ========================================================================= -->
    <Modal 
      :isOpen="showAddAccountModal" 
      title="Create Custom Chart of Account" 
      :onClose="() => showAddAccountModal = false"
      maxWidth="max-w-lg"
    >
      <div class="flex flex-col gap-4 p-2 font-sans select-none text-xs">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="flex flex-col gap-1.5">
            <label class="font-mono font-bold text-on-surface-variant uppercase text-[10px]">{{ $t('customers.customerTypeRequired') }}</label>
            <select 
              v-model="newAccount.accountType"
              @change="onAccountTypeChange"
              class="h-10 px-3 bg-surface-container-low border border-outline-variant rounded-xl text-xs font-bold text-on-surface outline-none cursor-pointer"
            >
              <option value="ASSET">ASSET</option>
              <option value="LIABILITY">LIABILITY</option>
              <option value="EQUITY">EQUITY</option>
              <option value="REVENUE">REVENUE</option>
              <option value="EXPENSE">EXPENSE</option>
            </select>
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="font-mono font-bold text-on-surface-variant uppercase text-[10px]">Account Category</label>
            <select 
              v-model="newAccount.accountCategory"
              class="h-10 px-3 bg-surface-container-low border border-outline-variant rounded-xl text-xs font-bold text-on-surface outline-none cursor-pointer"
            >
              <option v-for="cat in availableCategories" :key="cat" :value="cat">
                {{ formatCategoryName(cat) }}
              </option>
            </select>
          </div>
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="font-mono font-bold text-on-surface-variant uppercase text-[10px]">{{ $t('finance.accountName') }} *</label>
          <input 
            type="text" 
            v-model="newAccount.name" 
            placeholder="e.g. Logistics & Transport Expense"
            class="h-10 px-3 bg-surface-container-low border border-outline-variant rounded-xl text-xs font-bold text-on-surface outline-none"
          />
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="font-mono font-bold text-on-surface-variant uppercase text-[10px]">Description Memo (Optional)</label>
          <textarea 
            v-model="newAccount.description" 
            rows="2"
            placeholder="Brief purpose or classification notes for this account..."
            class="p-3 bg-surface-container-low border border-outline-variant rounded-xl text-xs font-medium text-on-surface outline-none resize-none"
          ></textarea>
        </div>

        <!-- Automatic Code & Hierarchy Note -->
        <div class="p-3 bg-primary/5 rounded-xl border border-primary/10 flex items-start gap-2.5 text-primary">
          <ShieldCheck class="w-4 h-4 shrink-0 mt-0.5" />
          <span class="text-[11px] font-medium leading-relaxed">
            The account code and group hierarchy are automatically assigned by the accounting system based on the selected account type.
          </span>
        </div>

        <div class="flex justify-end items-center gap-3 pt-2">
          <button 
            @click="showAddAccountModal = false"
            class="px-4 py-2.5 rounded-xl border border-outline-variant hover:bg-surface-container text-on-surface font-bold text-xs cursor-pointer transition-all"
          >
            {{ $t('common.cancel') }}
          </button>
          <button 
            :disabled="!newAccount.name || isSubmittingAccount"
            @click="submitNewAccount"
            class="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs hover:bg-opacity-90 active:scale-95 disabled:opacity-50 cursor-pointer transition-all shadow-sm flex items-center gap-1.5"
          >
            <RotateCw v-if="isSubmittingAccount" class="w-3.5 h-3.5 animate-spin" />
            <Plus v-else class="w-3.5 h-3.5" />
            <span>{{ isSubmittingAccount ? $t('common.loading') : $t('finance.addAccount') }}</span>
          </button>
        </div>
      </div>
    </Modal>

    <!-- ========================================================================= -->
    <!-- MODAL 3: JOURNAL ENTRY VOUCHER DETAIL BREAKDOWN -->
    <!-- ========================================================================= -->
    <Modal 
      :isOpen="showVoucherModal" 
      :title="`Journal Voucher ${selectedJournal?.entryNumber || ''}`" 
      :onClose="() => showVoucherModal = false"
      maxWidth="max-w-2xl"
    >
      <div v-if="selectedJournal" class="flex flex-col gap-4 p-2 font-sans select-none text-xs">
        <div class="p-4 bg-surface-container-low rounded-xl border border-outline-variant grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span class="text-[10px] font-mono uppercase text-on-surface-variant font-bold block">Entry Date</span>
            <span class="font-bold font-mono text-on-surface">{{ selectedJournal.entryDate }}</span>
          </div>
          <div>
            <span class="text-[10px] font-mono uppercase text-on-surface-variant font-bold block">Reference Source</span>
            <span class="font-bold font-mono text-primary">{{ selectedJournal.referenceType }}</span>
          </div>
          <div>
            <span class="text-[10px] font-mono uppercase text-on-surface-variant font-bold block">{{ $t('customers.tableStatus') }}</span>
            <span class="font-bold text-emerald-600">{{ selectedJournal.status }}</span>
          </div>
          <div>
            <span class="text-[10px] font-mono uppercase text-on-surface-variant font-bold block">Posted By</span>
            <span class="font-bold text-on-surface">{{ selectedJournal.postedByName || 'System / Admin' }}</span>
          </div>
          <div class="col-span-2 sm:col-span-4 pt-2 border-t border-outline-variant/40">
            <span class="text-[10px] font-mono uppercase text-on-surface-variant font-bold block">Description Memo</span>
            <span class="font-medium text-on-surface">{{ selectedJournal.description }}</span>
          </div>
        </div>

        <div class="border border-outline-variant rounded-xl overflow-hidden">
          <table class="w-full text-left text-xs">
            <thead class="bg-[#f0f3f0] text-[10px] font-mono uppercase font-bold text-on-surface-variant border-b border-outline-variant">
              <tr>
                <th class="p-3 pl-4">Account</th>
                <th class="p-3">{{ $t('topNav.branch') }}</th>
                <th class="p-3 text-right">{{ $t('finance.debit') }} (TZS)</th>
                <th class="p-3 text-right pr-4">{{ $t('finance.credit') }} (TZS)</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-surface-variant bg-surface-container-lowest">
              <tr v-for="(line, idx) in selectedJournal.lines" :key="idx">
                <td class="p-3 pl-4">
                  <span class="font-mono font-bold text-primary">{{ line.accountCode }}</span> - <span class="font-bold text-on-surface">{{ line.accountName }}</span>
                  <div v-if="line.description" class="text-[10px] text-on-surface-variant">{{ line.description }}</div>
                </td>
                <td class="p-3 text-on-surface-variant">{{ line.branchName || 'Main' }}</td>
                <td class="p-3 text-right font-mono font-bold text-emerald-600">{{ line.debit > 0 ? formatCurrency(line.debit) : '-' }}</td>
                <td class="p-3 text-right pr-4 font-mono font-bold text-blue-600">{{ line.credit > 0 ? formatCurrency(line.credit) : '-' }}</td>
              </tr>
            </tbody>
            <tfoot class="bg-surface-container-low border-t-2 border-outline-variant font-black text-xs">
              <tr>
                <td colspan="2" class="p-3 pl-4 uppercase">Total Voucher Amount</td>
                <td class="p-3 text-right font-mono text-emerald-600">{{ formatCurrency(selectedJournal.totalDebit) }}</td>
                <td class="p-3 text-right pr-4 font-mono text-blue-600">{{ formatCurrency(selectedJournal.totalCredit) }}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div class="flex justify-end pt-2">
          <button 
            @click="showVoucherModal = false"
            class="px-5 py-2 rounded-xl bg-primary text-on-primary font-bold text-xs cursor-pointer"
          >
            {{ $t('receipt.close') }}
          </button>
        </div>
      </div>
    </Modal>

    <!-- ========================================================================= -->
    <!-- MODAL 4: CLOSE FINANCIAL PERIOD CONFIRMATION -->
    <!-- ========================================================================= -->
    <Modal 
      :isOpen="showClosePeriodModal" 
      title="Confirm Fiscal Period Closing" 
      :onClose="() => showClosePeriodModal = false"
      maxWidth="max-w-md"
    >
      <div class="flex flex-col gap-4 p-2 font-sans select-none text-xs">
        <div class="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-3">
          <AlertTriangle class="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 class="font-bold text-amber-900 text-sm">Important Accounting Action</h4>
            <p class="text-xs text-amber-800 leading-relaxed mt-1">
              Closing period <strong class="font-mono">{{ currentPeriod?.name }}</strong> will permanently lock entries for this date range and roll forward retained earnings into the next period.
            </p>
          </div>
        </div>

        <p class="text-on-surface-variant leading-relaxed">
          Are you sure you want to finalize and close period <strong>{{ currentPeriod?.name }}</strong> ({{ currentPeriod?.startDate }} to {{ currentPeriod?.endDate }})?
        </p>

        <div class="flex justify-end items-center gap-3 pt-2">
          <button 
            @click="showClosePeriodModal = false"
            class="px-4 py-2.5 rounded-xl border border-outline-variant hover:bg-surface-container text-on-surface font-bold text-xs cursor-pointer transition-all"
          >
            {{ $t('common.cancel') }}
          </button>
          <button 
            :disabled="isClosingPeriod"
            @click="confirmClosePeriod"
            class="px-5 py-2.5 rounded-xl bg-amber-600 text-white font-bold text-xs hover:bg-amber-700 active:scale-95 disabled:opacity-50 cursor-pointer transition-all shadow-sm flex items-center gap-1.5"
          >
            <RotateCw v-if="isClosingPeriod" class="w-3.5 h-3.5 animate-spin" />
            <Lock v-else class="w-3.5 h-3.5" />
            <span>{{ isClosingPeriod ? 'Closing Period...' : 'Yes, Finalize & Close' }}</span>
          </button>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import Toast from '../components/common/Toast.vue';
import Modal from '../components/common/Modal.vue';
import JengaLoader from '../components/common/JengaLoader.vue';
import { financeService } from '../services/financeService';
import { useAppViewModel } from '../viewmodels/useAppViewModel';
import { formatCurrency } from '../models/mockData';
import { t } from '../i18n';
import type {
  ChartOfAccount,
  AccountType,
  AccountCategory,
  CreateChartOfAccountRequest,
  FinancialPeriod,
  JournalEntry,
  CreateJournalEntryRequest,
  TrialBalanceReport,
  IncomeStatementReport,
  BalanceSheetReport,
  AccountLedgerStatementReport
} from '../models/types';
import {
  Landmark,
  FileSpreadsheet,
  Layers,
  BookOpen,
  CalendarCheck,
  RotateCw,
  Download,
  PlusCircle,
  Plus,
  Search,
  Scale,
  TrendingUp,
  Receipt,
  DollarSign,
  Coins,
  ShieldCheck,
  Building2,
  CheckCircle2,
  AlertCircle,
  Eye,
  Trash2,
  Lock,
  AlertTriangle,
  Activity,
  Check
} from 'lucide-vue-next';

const router = useRouter();
const route = useRoute();
const vm = useAppViewModel();
const { userRole } = vm;

// State Variables
const activeSubmodule = ref<'statements' | 'accounts' | 'journal' | 'ledger' | 'periods'>('statements');
const statementType = ref<'pnl' | 'balance-sheet' | 'trial-balance'>('pnl');
const isLoading = ref(false);
const toastMessage = ref<string | null>(null);
const toastType = ref<'success' | 'error'>('success');

const submoduleTitle = computed(() => {
  switch (activeSubmodule.value) {
    case 'statements': return t('finance.financialStatements');
    case 'accounts': return t('finance.chartOfAccounts');
    case 'journal': return t('finance.generalLedgerJournals');
    case 'ledger': return t('finance.accountStatement');
    case 'periods': return t('finance.fiscalPeriods');
    default: return t('finance.title');
  }
});

const submoduleSubtitle = computed(() => {
  switch (activeSubmodule.value) {
    case 'statements': return 'Income statement (P&L), balance sheet, and trial balance verification reports.';
    case 'accounts': return 'Catalog of master asset, liability, equity, revenue, and expense accounts.';
    case 'journal': return 'Double-entry journal vouchers, automatic audit trail, and manual adjustments.';
    case 'ledger': return 'Detailed transaction ledger and running balance drill-down by account.';
    case 'periods': return 'Fiscal periods management, closing status, and year-end reconciliation.';
    default: return 'Double-entry bookkeeping, general ledger, chart of accounts, and financial statements.';
  }
});

const submoduleIcon = computed(() => {
  switch (activeSubmodule.value) {
    case 'statements': return FileSpreadsheet;
    case 'accounts': return Layers;
    case 'journal': return BookOpen;
    case 'ledger': return Search;
    case 'periods': return CalendarCheck;
    default: return Landmark;
  }
});

const switchStatementType = (type: 'pnl' | 'balance-sheet' | 'trial-balance') => {
  statementType.value = type;
  loadStatements();
};

const selectSubmodule = (sub: 'statements' | 'accounts' | 'journal' | 'ledger' | 'periods') => {
  activeSubmodule.value = sub;
  router.replace({ query: { ...route.query, tab: sub } });
  if (sub === 'statements') {
    loadStatements();
  } else if (sub === 'accounts' && accounts.value.length === 0) {
    loadAccounts();
  } else if (sub === 'journal' && journalEntries.value.length === 0) {
    loadJournalEntries(0);
  } else if (sub === 'periods' && periods.value.length === 0) {
    loadPeriods();
  }
};

watch(() => route.query.tab, (newTab) => {
  if (newTab && typeof newTab === 'string') {
    const valid = ['statements', 'accounts', 'journal', 'ledger', 'periods'];
    if (valid.includes(newTab)) {
      activeSubmodule.value = newTab as any;
      if (newTab === 'journal' && journalEntries.value.length === 0) loadJournalEntries(0);
      if (newTab === 'periods' && periods.value.length === 0) loadPeriods();
    }
  }
}, { immediate: true });

// Statements State
const activePreset = ref('this_month');
const now = new Date();
const currentYear = now.getFullYear();
const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
const statementStartDate = ref(`${currentYear}-${currentMonth}-01`);
const statementEndDate = ref(now.toISOString().slice(0, 10));
const statementAsOfDate = ref(now.toISOString().slice(0, 10));

const incomeStatement = ref<IncomeStatementReport | null>(null);
const balanceSheet = ref<BalanceSheetReport | null>(null);
const trialBalance = ref<TrialBalanceReport | null>(null);

// Chart of Accounts State
const accounts = ref<ChartOfAccount[]>([]);
const coaTypeFilter = ref<string>('ALL');
const coaSearchQuery = ref('');
const showAddAccountModal = ref(false);
const isSubmittingAccount = ref(false);
const newAccount = ref<CreateChartOfAccountRequest>({
  name: '',
  accountType: 'EXPENSE',
  accountCategory: 'OPERATING_EXPENSE',
  description: ''
});

// Journal Entries State
const journalStartDate = ref(`${currentYear}-${currentMonth}-01`);
const journalEndDate = ref(now.toISOString().slice(0, 10));
const journalEntries = ref<JournalEntry[]>([]);
const journalPagination = ref({ page: 0, size: 15, totalElements: 0, totalPages: 0 });
const showNewJournalModal = ref(false);
const isSubmittingJournal = ref(false);
const showVoucherModal = ref(false);
const selectedJournal = ref<JournalEntry | null>(null);

const newJournal = ref<CreateJournalEntryRequest>({
  entryDate: now.toISOString().slice(0, 10),
  referenceType: 'MANUAL',
  description: '',
  lines: [
    { accountId: '', debit: 0, credit: 0, description: '' },
    { accountId: '', debit: 0, credit: 0, description: '' }
  ]
});

// Account Ledger Statement State
const selectedLedgerAccountId = ref<string>('');
const ledgerStartDate = ref(`${currentYear}-${currentMonth}-01`);
const ledgerEndDate = ref(now.toISOString().slice(0, 10));
const accountStatement = ref<AccountLedgerStatementReport | null>(null);

// Financial Periods State
const currentPeriod = ref<FinancialPeriod | null>(null);
const periods = ref<FinancialPeriod[]>([]);
const showClosePeriodModal = ref(false);
const isClosingPeriod = ref(false);

// ==========================================
// COMPUTED PROPERTIES
// ==========================================

const filteredAccounts = computed(() => {
  return accounts.value.filter(a => {
    const matchesType = coaTypeFilter.value === 'ALL' || a.accountType === coaTypeFilter.value;
    const query = coaSearchQuery.value.toLowerCase().trim();
    const matchesQuery = !query || 
      a.code.toLowerCase().includes(query) || 
      a.name.toLowerCase().includes(query) || 
      (a.description && a.description.toLowerCase().includes(query));
    return matchesType && matchesQuery;
  });
});

const availableCategories = computed<AccountCategory[]>(() => {
  const type = newAccount.value.accountType;
  if (type === 'ASSET') return ['CURRENT_ASSET', 'NON_CURRENT_ASSET'];
  if (type === 'LIABILITY') return ['CURRENT_LIABILITY', 'NON_CURRENT_LIABILITY'];
  if (type === 'EQUITY') return ['EQUITY'];
  if (type === 'REVENUE') return ['OPERATING_REVENUE', 'OTHER_INCOME'];
  if (type === 'EXPENSE') return ['OPERATING_EXPENSE', 'COST_OF_GOODS_SOLD', 'TAX_EXPENSE', 'OTHER_EXPENSE'];
  return [];
});

const displayedCurrentAssets = computed(() => {
  const lines = [...(balanceSheet.value?.currentAssets || [])];
  const defaults = [
    { accountCode: '1010', accountName: 'Cash on Hand (Till / Drawer)' },
    { accountCode: '1020', accountName: 'Bank / Mobile Money Clearing' },
    { accountCode: '1030', accountName: 'Accounts Receivable (Debtors)' },
    { accountCode: '1040', accountName: 'Inventory / Stock on Hand' }
  ];
  
  defaults.forEach(def => {
    if (!lines.some(l => l.accountCode === def.accountCode)) {
      lines.push({
        accountCode: def.accountCode,
        accountName: def.accountName,
        balance: 0
      });
    }
  });
  
  return lines.sort((a, b) => a.accountCode.localeCompare(b.accountCode));
});

const displayedCurrentLiabilities = computed(() => {
  const lines = [...(balanceSheet.value?.currentLiabilities || [])];
  const defaults = [
    { accountCode: '2010', accountName: 'Accounts Payable (Suppliers)' },
    { accountCode: '2020', accountName: 'VAT / Sales Tax Payable' }
  ];
  
  defaults.forEach(def => {
    if (!lines.some(l => l.accountCode === def.accountCode)) {
      lines.push({
        accountCode: def.accountCode,
        accountName: def.accountName,
        balance: 0
      });
    }
  });
  
  return lines.sort((a, b) => a.accountCode.localeCompare(b.accountCode));
});

const displayedEquityLines = computed(() => {
  const lines = [...(balanceSheet.value?.equityLines || [])];
  
  if (!lines.some(l => l.accountCode === '3010')) {
    lines.push({
      accountCode: '3010',
      accountName: "Owner's Capital",
      balance: 0
    });
  }
  
  if (!lines.some(l => l.accountCode === '3020')) {
    const retainedBal = balanceSheet.value?.retainedEarnings || 0;
    lines.push({
      accountCode: '3020',
      accountName: 'Retained Earnings',
      balance: retainedBal
    });
  }
  
  return lines.sort((a, b) => a.accountCode.localeCompare(b.accountCode));
});

const totalJournalDebits = computed(() => {
  return newJournal.value.lines.reduce((sum, l) => sum + (Number(l.debit) || 0), 0);
});

const totalJournalCredits = computed(() => {
  return newJournal.value.lines.reduce((sum, l) => sum + (Number(l.credit) || 0), 0);
});

const journalDifference = computed(() => {
  return Math.abs(totalJournalDebits.value - totalJournalCredits.value);
});

const isJournalBalanced = computed(() => {
  return totalJournalDebits.value > 0 && Math.abs(totalJournalDebits.value - totalJournalCredits.value) < 0.001;
});

// ==========================================
// API DATA LOADERS
// ==========================================

const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
  toastMessage.value = msg;
  toastType.value = type;
};

const loadCurrentPeriod = async () => {
  try {
    const cp = await financeService.getCurrentPeriod();
    if (cp) currentPeriod.value = cp;
  } catch (err) {
    console.warn('Failed to load current financial period:', err);
  }
};

const loadPeriods = async () => {
  try {
    const list = await financeService.getFinancialPeriods();
    periods.value = list || [];
  } catch (err) {
    console.error('Failed to load financial periods:', err);
  }
};

const loadAccounts = async () => {
  try {
    const list = await financeService.getChartOfAccounts(false);
    accounts.value = list || [];
  } catch (err: any) {
    showToast(err.message || 'Failed to load chart of accounts', 'error');
  }
};

const loadStatements = async () => {
  isLoading.value = true;
  try {
    if (statementType.value === 'pnl') {
      const report = await financeService.getIncomeStatement({
        startDate: statementStartDate.value,
        endDate: statementEndDate.value
      });
      incomeStatement.value = report;
    } else if (statementType.value === 'balance-sheet') {
      const report = await financeService.getBalanceSheet({
        asOfDate: statementAsOfDate.value
      });
      balanceSheet.value = report;
    } else if (statementType.value === 'trial-balance') {
      const report = await financeService.getTrialBalance({
        asOfDate: statementAsOfDate.value
      });
      trialBalance.value = report;
    }
  } catch (err: any) {
    showToast(err.message || 'Failed to generate financial statement', 'error');
  } finally {
    isLoading.value = false;
  }
};

const loadJournalEntries = async (page = 0) => {
  isLoading.value = true;
  try {
    const res = await financeService.getJournalEntries({
      startDate: journalStartDate.value,
      endDate: journalEndDate.value,
      page,
      size: 15
    });
    journalEntries.value = res.content || [];
    journalPagination.value = {
      page: res.number,
      size: res.size,
      totalElements: res.totalElements,
      totalPages: res.totalPages
    };
  } catch (err: any) {
    showToast(err.message || 'Failed to load journal entries', 'error');
  } finally {
    isLoading.value = false;
  }
};

const loadAccountStatement = async () => {
  if (!selectedLedgerAccountId.value) return;
  isLoading.value = true;
  try {
    const res = await financeService.getAccountStatement(selectedLedgerAccountId.value, {
      startDate: ledgerStartDate.value,
      endDate: ledgerEndDate.value
    });
    accountStatement.value = res;
  } catch (err: any) {
    showToast(err.message || 'Failed to load account ledger statement', 'error');
  } finally {
    isLoading.value = false;
  }
};

const refreshActiveTab = () => {
  loadCurrentPeriod();
  if (activeSubmodule.value === 'statements') loadStatements();
  else if (activeSubmodule.value === 'accounts') loadAccounts();
  else if (activeSubmodule.value === 'journal') loadJournalEntries(0);
  else if (activeSubmodule.value === 'ledger') loadAccountStatement();
  else if (activeSubmodule.value === 'periods') loadPeriods();
};

// ==========================================
// ACTIONS & HANDLERS
// ==========================================

const applyDatePreset = (preset: string) => {
  activePreset.value = preset;
  const d = new Date();
  if (preset === 'this_month') {
    statementStartDate.value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
    statementEndDate.value = d.toISOString().slice(0, 10);
  } else if (preset === 'last_month') {
    const prev = new Date(d.getFullYear(), d.getMonth() - 1, 1);
    const lastDayPrev = new Date(d.getFullYear(), d.getMonth(), 0);
    statementStartDate.value = prev.toISOString().slice(0, 10);
    statementEndDate.value = lastDayPrev.toISOString().slice(0, 10);
  } else if (preset === 'this_quarter') {
    const qStartMonth = Math.floor(d.getMonth() / 3) * 3;
    const qStart = new Date(d.getFullYear(), qStartMonth, 1);
    statementStartDate.value = qStart.toISOString().slice(0, 10);
    statementEndDate.value = d.toISOString().slice(0, 10);
  } else if (preset === 'this_year') {
    statementStartDate.value = `${d.getFullYear()}-01-01`;
    statementEndDate.value = d.toISOString().slice(0, 10);
  }
  loadStatements();
};

const formatPresetLabel = (preset: string) => {
  if (preset === 'this_month') return t('dashboard.thisMonth');
  if (preset === 'last_month') return 'Last Month';
  if (preset === 'this_quarter') return 'This Quarter';
  if (preset === 'this_year') return t('dashboard.thisYear');
  return preset;
};

const openAddAccountModal = () => {
  newAccount.value = {
    name: '',
    accountType: 'EXPENSE',
    accountCategory: 'OPERATING_EXPENSE',
    description: ''
  };
  showAddAccountModal.value = true;
};

const onAccountTypeChange = () => {
  const cats = availableCategories.value;
  if (cats.length > 0) newAccount.value.accountCategory = cats[0];
};

const submitNewAccount = async () => {
  if (!newAccount.value.name.trim()) return;
  isSubmittingAccount.value = true;
  try {
    const created = await financeService.createAccount(newAccount.value);
    showToast(`Account '${created.code} - ${created.name}' created successfully`, 'success');
    showAddAccountModal.value = false;
    await loadAccounts();
  } catch (err: any) {
    showToast(err.message || 'Failed to create account', 'error');
  } finally {
    isSubmittingAccount.value = false;
  }
};

const drillDownToLedger = (accountId: string) => {
  selectedLedgerAccountId.value = accountId;
  activeSubmodule.value = 'ledger';
  loadAccountStatement();
};

const openNewJournalModal = () => {
  newJournal.value = {
    entryDate: new Date().toISOString().slice(0, 10),
    referenceType: 'MANUAL',
    description: '',
    lines: [
      { accountId: accounts.value[0]?.id || '', debit: 0, credit: 0, description: '' },
      { accountId: accounts.value[1]?.id || '', debit: 0, credit: 0, description: '' }
    ]
  };
  showNewJournalModal.value = true;
};

const addJournalLine = () => {
  newJournal.value.lines.push({
    accountId: accounts.value[0]?.id || '',
    debit: 0,
    credit: 0,
    description: ''
  });
};

const removeJournalLine = (idx: number) => {
  if (newJournal.value.lines.length > 2) {
    newJournal.value.lines.splice(idx, 1);
  }
};

const onDebitInput = (line: any) => {
  if (line.debit > 0) line.credit = 0;
};

const onCreditInput = (line: any) => {
  if (line.credit > 0) line.debit = 0;
};

const submitNewJournalEntry = async () => {
  if (!isJournalBalanced.value) {
    showToast('Debit and credit totals must balance exactly before posting', 'error');
    return;
  }
  isSubmittingJournal.value = true;
  try {
    const validLines = newJournal.value.lines
      .filter(l => (l.debit || 0) > 0 || (l.credit || 0) > 0)
      .map(l => ({
        accountId: l.accountId,
        debit: Number(l.debit) || 0,
        credit: Number(l.credit) || 0,
        description: l.description || newJournal.value.description
      }));

    await financeService.createJournalEntry({
      ...newJournal.value,
      lines: validLines
    });

    showToast('Journal voucher posted to general ledger successfully', 'success');
    showNewJournalModal.value = false;
    await loadJournalEntries(0);
  } catch (err: any) {
    showToast(err.message || 'Failed to post journal entry', 'error');
  } finally {
    isSubmittingJournal.value = false;
  }
};

const openVoucherModal = async (je: JournalEntry) => {
  try {
    const full = await financeService.getJournalEntryById(je.id);
    selectedJournal.value = full;
    showVoucherModal.value = true;
  } catch (err: any) {
    showToast('Failed to load voucher lines: ' + err.message, 'error');
  }
};

const openClosePeriodConfirmModal = () => {
  showClosePeriodModal.value = true;
};

const confirmClosePeriod = async () => {
  if (!currentPeriod.value) return;
  isClosingPeriod.value = true;
  try {
    const closed = await financeService.closePeriod(currentPeriod.value.id);
    showToast(`Fiscal Period '${closed.name}' closed and locked successfully`, 'success');
    showClosePeriodModal.value = false;
    await loadCurrentPeriod();
    await loadPeriods();
  } catch (err: any) {
    showToast(err.message || 'Failed to close period', 'error');
  } finally {
    isClosingPeriod.value = false;
  }
};

const handleExportCurrentView = () => {
  window.print();
};

// ==========================================
// FORMATTING HELPERS
// ==========================================

const calculateMargin = (profit?: number, revenue?: number): string => {
  if (!profit || !revenue || revenue <= 0) return '0.0';
  return ((profit / revenue) * 100).toFixed(1);
};

const getAccountTypeBadgeClass = (type?: AccountType | string) => {
  switch (type) {
    case 'ASSET':
      return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20';
    case 'LIABILITY':
      return 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20';
    case 'EQUITY':
      return 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/20';
    case 'REVENUE':
      return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20';
    case 'EXPENSE':
      return 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20';
    default:
      return 'bg-gray-500/10 text-gray-700';
  }
};

const getTypeTextColor = (type: AccountType) => {
  switch (type) {
    case 'ASSET': return 'text-blue-700';
    case 'LIABILITY': return 'text-amber-700';
    case 'EQUITY': return 'text-purple-700';
    case 'REVENUE': return 'text-emerald-700';
    case 'EXPENSE': return 'text-rose-700';
  }
};

const getTypeLabel = (type: AccountType) => {
  switch (type) {
    case 'ASSET': return 'Assets (1000s)';
    case 'LIABILITY': return 'Liabilities (2000s)';
    case 'EQUITY': return 'Equity (3000s)';
    case 'REVENUE': return 'Revenue (4000s)';
    case 'EXPENSE': return 'Expenses (5000s+)';
  }
};

const formatCategoryName = (cat?: AccountCategory | string) => {
  if (!cat) return '-';
  return String(cat).replace(/_/g, ' ');
};

// Lifecycle initialization
onMounted(async () => {
  await loadCurrentPeriod();
  await loadAccounts();
  await loadStatements();
});
</script>

<style scoped>
@media print {
  nav, header, button, .no-print {
    display: none !important;
  }
}
</style>
