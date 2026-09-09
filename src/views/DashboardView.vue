<template>
  <div class="max-w-7xl mx-auto space-y-6 pb-24 animate-fade-up font-sans">
    <!-- ========================================== -->
    <!-- TIER 1: EXECUTIVE HEADER & ACTION BAR      -->
    <!-- ========================================== -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface-container-lowest py-3.5 px-5 rounded-2xl border border-outline-variant/60 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 shadow-inner">
          <Activity class="w-5 h-5 text-primary" />
        </div>
        <div>
          <!-- <h2 class="text-xl sm:text-2xl font-black text-on-surface tracking-tight">{{ $t('dashboard.title') }}</h2> -->
          <p class="text-xs font-semibold text-on-surface-variant mt-0.5">{{ branchDisplayName }} • {{ formattedDate }}</p>
        </div>
      </div>

      <!-- Compact Tab Pill (Summary / Collection / Stock) -->
      <div class="flex items-center bg-surface-container-high/60 p-1 rounded-xl border border-outline-variant/40 text-xs font-bold shadow-inner">
        <button 
          @click="activeMainTab = 'summary'"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer select-none"
          :class="activeMainTab === 'summary' ? 'bg-surface text-primary shadow-xs font-black' : 'text-on-surface-variant hover:text-on-surface'"
        >
          <LayoutDashboard class="w-3.5 h-3.5" />
          <span>{{ $t('dashboard2.tabSummary') }}</span>
        </button>

        <button 
          @click="activeMainTab = 'collection'"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer select-none relative"
          :class="activeMainTab === 'collection' ? 'bg-surface text-primary shadow-xs font-black' : 'text-on-surface-variant hover:text-on-surface'"
        >
          <HandCoins class="w-3.5 h-3.5" />
          <span>{{ $t('dashboard2.tabCollection') }}</span>
          <span v-if="riskDebtors.length > 0 || highRiskAmount > 0" class="w-2 h-2 rounded-full bg-rose-500 ring-2 ring-surface animate-pulse"></span>
        </button>

        <button 
          @click="activeMainTab = 'stock'"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer select-none relative"
          :class="activeMainTab === 'stock' ? 'bg-surface text-primary shadow-xs font-black' : 'text-on-surface-variant hover:text-on-surface'"
        >
          <Boxes class="w-3.5 h-3.5" />
          <span>{{ $t('dashboard2.tabStockInventory') }}</span>
          <span v-if="deadStock.count > 0" class="w-2 h-2 rounded-full bg-amber-500 ring-2 ring-surface"></span>
        </button>
      </div>

      <!-- Controls -->
      <div class="flex items-center gap-2.5">
        <!-- Period Selector -->
        <div class="flex items-center bg-surface-container-high/60 p-1 rounded-xl border border-outline-variant/40 text-xs font-bold font-mono">
          <button 
            v-for="p in periods" 
            :key="p.key"
            @click="setPeriod(p.key)"
            class="px-2.5 py-1.5 rounded-lg transition-all cursor-pointer"
            :class="selectedPeriod === p.key ? 'bg-surface text-primary shadow-xs font-black' : 'text-on-surface-variant hover:text-on-surface'"
          >
            {{ p.label }}
          </button>
        </div>

        <!-- Refresh Button -->
        <button 
          @click="fetchData"
          :disabled="isLoading"
          class="p-2 rounded-xl border border-outline-variant/60 bg-surface-container-low hover:bg-surface-container text-on-surface-variant hover:text-primary transition-colors cursor-pointer shadow-xs"
          :title="$t('common.retry')"
        >
          <RefreshCw class="w-4 h-4" :class="isLoading ? 'animate-spin text-primary' : ''" />
        </button>
      </div>
    </div>

    <!-- ========================================== -->
    <!-- TAB 1: SUMMARY (DASHBOARD OVERVIEW)        -->
    <!-- ========================================== -->
    <div v-if="activeMainTab === 'summary'" class="space-y-6">
      <!-- ========================================== -->
      <!-- TIER 2: 4 HERO KPI CARDS (FINANCIAL PULSE) -->
      <!-- ========================================== -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <!-- KPI 1: Realized Gross Profit & Margin % (The Profitability Engine) -->
      <div class="bg-surface-container-lowest rounded-xl p-3.5 sm:p-4 border border-outline-variant/60 shadow-sm relative overflow-hidden flex flex-col justify-between group hover:border-emerald-500 transition-all duration-300">
        <div class="absolute -right-6 -top-6 w-16 h-16 bg-emerald-500/10 rounded-full blur-lg pointer-events-none group-hover:scale-125 transition-transform"></div>
        <div class="flex justify-between items-center mb-1.5 relative z-10">
          <span class="text-[11px] font-mono font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
            {{ $t('dashboard2.grossProfit') }}
          </span>
          <span 
            class="px-2 py-0.5 rounded-full text-[9px] font-mono font-black uppercase tracking-wider shadow-xs"
            :class="grossMarginPercent >= 20 ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : grossMarginPercent >= 10 ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20' : 'bg-rose-500/10 text-rose-600 border border-rose-500/20'"
          >
            {{ $t('dashboard2.grossMarginBadge', { percent: grossMarginPercent }) }}
          </span>
        </div>
        <div class="relative z-10">
          <div class="text-lg sm:text-xl lg:text-lg xl:text-xl 2xl:text-2xl font-black font-mono tracking-tight text-emerald-600 amount-kpi truncate">
            {{ formatCurrency(grossProfitAmount, currency) }}
          </div>
          <div class="flex items-center text-[11px] text-on-surface-variant font-medium mt-1 gap-1">
            <span class="font-mono text-[10px] text-outline truncate">
              {{ $t('dashboard2.cogsCost', { amount: formatCurrency(cogsAmount, currency) }) }}
            </span>
          </div>
        </div>
      </div>

      <!-- KPI 2: Sales Revenue & Store Traffic (Average Basket / Volume) -->
      <div class="bg-surface-container-lowest rounded-xl p-3.5 sm:p-4 border border-outline-variant/60 shadow-sm relative overflow-hidden flex flex-col justify-between group hover:border-primary transition-all duration-300">
        <div class="flex justify-between items-center mb-1.5">
          <span class="text-[11px] font-mono font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
            <ShoppingCart class="w-3.5 h-3.5 text-primary" />
            {{ $t('dashboard2.salesTraffic') }}
          </span>
          <span class="px-2 py-0.5 rounded-full text-[9px] font-mono font-black uppercase tracking-wider shadow-xs bg-primary/10 text-primary border border-primary/20">
            {{ $t('dashboard2.receiptsCountBadge', { count: transactionsCount }) }}
          </span>
        </div>
        <div>
          <div class="text-lg sm:text-xl lg:text-lg xl:text-xl 2xl:text-2xl font-black font-mono text-on-surface tracking-tight amount-kpi truncate">
            {{ formatCurrency(totalPeriodSales, currency) }}
          </div>
          <div class="flex items-center justify-between text-[11px] text-on-surface-variant font-medium mt-1">
            <span class="font-bold text-on-surface truncate">
              {{ $t('dashboard2.avgBasketFooter', { amount: formatCurrency(avgTicketAmount, currency) }) }}
            </span>
          </div>
        </div>
      </div>

      <!-- KPI 3: Net Cashflow Pulse -->
      <div class="bg-surface-container-lowest rounded-xl p-3.5 sm:p-4 border border-outline-variant/60 shadow-sm relative overflow-hidden flex flex-col justify-between group hover:border-primary transition-all duration-300">
        <div class="flex justify-between items-center mb-1.5 relative z-10">
          <span class="text-[11px] font-mono font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full" :class="isSurplus ? 'bg-emerald-500' : 'bg-rose-500'"></span>
            {{ $t('dashboard2.netCashflow') }}
          </span>
          <span 
            class="px-2 py-0.5 rounded-full text-[9px] font-mono font-black uppercase tracking-wider shadow-xs"
            :class="isSurplus ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-600 border border-rose-500/20'"
          >
            {{ isSurplus ? $t('dashboard2.cashSurplus') : $t('dashboard2.cashDeficit') }}
          </span>
        </div>
        <div class="relative z-10">
          <div 
            class="text-lg sm:text-xl lg:text-lg xl:text-xl 2xl:text-2xl font-black font-mono tracking-tight amount-kpi truncate"
            :class="isSurplus ? 'text-emerald-600' : 'text-rose-600'"
          >
            {{ formatCurrency(netCashflowAmount, currency) }}
          </div>
          <div class="flex items-center text-[11px] text-on-surface-variant font-medium mt-1 gap-1">
            <span class="font-mono text-[10px] text-outline truncate">
              In: {{ formatCurrency(totalPeriodSales + debtorsCollected, currency) }} • Out: {{ formatCurrency(payOutAmount + purchasesTotal, currency) }}
            </span>
          </div>
        </div>
      </div>

      <!-- KPI 4: Cash in Drawer / On Hand -->
      <div class="bg-surface-container-lowest rounded-xl p-3.5 sm:p-4 border border-outline-variant/60 shadow-sm relative overflow-hidden flex flex-col justify-between group hover:border-amber-500 transition-all duration-300">
        <div class="flex justify-between items-center mb-1.5">
          <span class="text-[11px] font-mono font-bold uppercase tracking-wider text-on-surface-variant">{{ $t('dashboard2.cashOnHand') }}</span>
          <span class="p-1.5 rounded-lg bg-amber-500/10 text-amber-600">
            <Banknote class="w-4 h-4 stroke-[2.2px]" />
          </span>
        </div>
        <div>
          <div class="text-lg sm:text-xl lg:text-lg xl:text-xl 2xl:text-2xl font-black font-mono text-on-surface tracking-tight amount-kpi truncate">
            {{ formatCurrency(cashOnHandAmount, currency) }}
          </div>
          <div class="flex items-center justify-between text-[11px] text-on-surface-variant font-medium mt-1 gap-1.5 flex-wrap">
            <div class="flex items-center gap-1.5">
              <span class="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>{{ $t('dashboard2.activeRegistersCount', { count: activeRegistersCount }) }}</span>
            </div>
            <!-- Till Discrepancy Indicator / Audit Trigger -->
            <button 
              v-if="closedShiftsCount > 0 || tillDiscrepancy !== 0"
              @click.stop="showTillAuditModal = true"
              class="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1"
              :class="tillDiscrepancy < 0 
                ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 border border-rose-500/20' 
                : tillDiscrepancy > 0 
                  ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 border border-amber-500/20' 
                  : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 border border-emerald-500/20'"
              :title="$t('dashboard2.inspectTillAudit')"
            >
              <AlertTriangle v-if="tillDiscrepancy !== 0" class="w-2.5 h-2.5 shrink-0" />
              <CheckCircle2 v-else class="w-2.5 h-2.5 shrink-0 text-emerald-600" />
              <span>
                {{ tillDiscrepancy < 0 
                  ? $t('dashboard2.tillShortageBadge', { amount: formatCurrency(Math.abs(tillDiscrepancy), currency) }) 
                  : tillDiscrepancy > 0 
                    ? $t('dashboard2.tillOverageBadge', { amount: formatCurrency(tillDiscrepancy, currency) }) 
                    : $t('dashboard2.tillBalanced') }}
              </span>
            </button>
            <span v-else class="text-[9px] font-mono text-outline">
              {{ $t('dashboard2.tillBalanced') }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- ========================================== -->
    <!-- TIER 3: FULL-WIDTH FINANCIAL VELOCITY CHART -->
    <!-- ========================================== -->
    <div class="w-full bg-surface-container-lowest rounded-2xl border border-outline-variant/60 shadow-sm p-5 sm:p-6 flex flex-col justify-between">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <!-- <h3 class="text-base sm:text-lg font-black text-on-surface tracking-tight">{{ $t('dashboard2.financialVelocity') }}</h3> -->
            <h3 class="text-base text-on-surface-variant font-medium tracking-tight">{{ selectedPeriodLabel }} cashflow streams velocity</h3>
          </div>

          <!-- Chart Stream Toggles -->
          <div class="flex flex-wrap items-center gap-1.5 bg-surface-container-low p-1 rounded-xl border border-outline-variant/40 text-[11px] font-mono font-bold">
            <button 
              @click="activeStream = 'ALL'" 
              class="px-2.5 py-1 rounded-lg transition-all cursor-pointer"
              :class="activeStream === 'ALL' ? 'bg-surface text-on-surface font-black shadow-xs' : 'text-on-surface-variant hover:text-on-surface'"
            >
              {{ $t('dashboard2.allStreams') }}
            </button>
            <button 
              @click="activeStream = 'SALES'" 
              class="px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1"
              :class="activeStream === 'SALES' ? 'bg-primary text-on-primary font-black shadow-xs' : 'text-on-surface-variant hover:text-primary'"
            >
              <span class="w-1.5 h-1.5 rounded-full bg-primary" :class="activeStream === 'SALES' ? 'bg-white' : ''"></span>
              {{ $t('dashboard2.salesRevenue') }}
            </button>
            <button 
              @click="activeStream = 'COLLECTIONS'" 
              class="px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1"
              :class="activeStream === 'COLLECTIONS' ? 'bg-emerald-600 text-white font-black shadow-xs' : 'text-on-surface-variant hover:text-emerald-600'"
            >
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500" :class="activeStream === 'COLLECTIONS' ? 'bg-white' : ''"></span>
              {{ $t('dashboard2.debtCollections') }}
            </button>
            <button 
              @click="activeStream = 'EXPENSES'" 
              class="px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1"
              :class="activeStream === 'EXPENSES' ? 'bg-rose-600 text-white font-black shadow-xs' : 'text-on-surface-variant hover:text-rose-600'"
            >
              <span class="w-1.5 h-1.5 rounded-full bg-rose-500" :class="activeStream === 'EXPENSES' ? 'bg-white' : ''"></span>
              {{ $t('dashboard2.pettyExpenses') }}
            </button>
          </div>
        </div>

        <!-- SVG Financial Curve Canvas -->
        <div class="relative w-full h-[260px] sm:h-[300px] lg:h-[320px] select-none mt-2">
          <!-- Y-Axis Labels -->
          <div class="absolute left-0 top-0 bottom-6 w-14 sm:w-16 flex flex-col justify-between text-[10px] sm:text-[11px] font-mono text-on-surface-variant select-none pointer-events-none pr-2 text-right">
            <span v-for="(lbl, idx) in chartYLabels" :key="idx" class="truncate">{{ formatCurrency(lbl, currency) }}</span>
          </div>

          <!-- Chart Area -->
          <div class="absolute inset-0 left-16 sm:left-20">
            <!-- Grid Lines -->
            <div class="absolute inset-0 flex flex-col justify-between pb-6 select-none opacity-30 pointer-events-none">
              <div class="w-full border-t border-outline-variant/40 h-0"></div>
              <div class="w-full border-t border-outline-variant/40 h-0"></div>
              <div class="w-full border-t border-outline-variant/40 h-0"></div>
              <div class="w-full border-t border-outline-variant/40 h-0"></div>
              <div class="w-full border-t border-outline h-0"></div>
            </div>

            <!-- SVG Curves -->
            <svg 
              class="absolute inset-0 w-full h-[calc(100%-24px)] overflow-visible cursor-crosshair"
              preserveAspectRatio="none"
              viewBox="0 0 100 100"
              @mousemove="handleChartHover"
              @mouseleave="activeHoverIndex = null"
            >
              <defs>
                <linearGradient id="salesGrad" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stop-color="#F4511E" stop-opacity="0.22"></stop>
                  <stop offset="100%" stop-color="#F4511E" stop-opacity="0.0"></stop>
                </linearGradient>
                <linearGradient id="collGrad" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stop-color="#10b981" stop-opacity="0.20"></stop>
                  <stop offset="100%" stop-color="#10b981" stop-opacity="0.0"></stop>
                </linearGradient>
                <linearGradient id="expGrad" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stop-color="#f43f5e" stop-opacity="0.18"></stop>
                  <stop offset="100%" stop-color="#f43f5e" stop-opacity="0.0"></stop>
                </linearGradient>
              </defs>

              <!-- Hover Vertical Crosshair Line -->
              <line
                v-if="hoveredPoint"
                :x1="hoveredPoint.x"
                y1="0"
                :x2="hoveredPoint.x"
                y2="100"
                stroke="#94A3B8"
                class="opacity-60"
                stroke-width="1.5"
                stroke-dasharray="3 3"
                vector-effect="non-scaling-stroke"
              />

              <!-- Sales Stream Area & Line -->
              <template v-if="activeStream === 'ALL' || activeStream === 'SALES'">
                <path fill="url(#salesGrad)" :d="salesAreaPath" class="transition-all duration-300 ease-out"></path>
                <path 
                  fill="none" 
                  :d="salesLinePath" 
                  stroke="#F4511E" 
                  stroke-width="2.5" 
                  stroke-linecap="round" 
                  stroke-linejoin="round"
                  vector-effect="non-scaling-stroke" 
                  class="transition-all duration-300 ease-out"
                ></path>
              </template>

              <!-- Debt Collections Stream Area & Line -->
              <template v-if="activeStream === 'ALL' || activeStream === 'COLLECTIONS'">
                <path fill="url(#collGrad)" :d="collectionsAreaPath" class="transition-all duration-300 ease-out"></path>
                <path 
                  fill="none" 
                  :d="collectionsLinePath" 
                  stroke="#10b981" 
                  stroke-width="2.2" 
                  stroke-linecap="round" 
                  stroke-linejoin="round"
                  vector-effect="non-scaling-stroke" 
                  class="transition-all duration-300 ease-out"
                ></path>
              </template>

              <!-- Petty Expenses Stream Line & Optional Area -->
              <template v-if="activeStream === 'ALL' || activeStream === 'EXPENSES'">
                <path 
                  v-if="activeStream === 'EXPENSES'" 
                  fill="url(#expGrad)" 
                  :d="expensesAreaPath" 
                  class="transition-all duration-300 ease-out"
                ></path>
                <path 
                  fill="none" 
                  :d="expensesLinePath" 
                  stroke="#f43f5e" 
                  stroke-width="2" 
                  stroke-dasharray="6 4" 
                  stroke-linecap="round" 
                  stroke-linejoin="round"
                  vector-effect="non-scaling-stroke" 
                  class="transition-all duration-300 ease-out"
                ></path>
              </template>
            </svg>

            <!-- Interactive Hover Indicators (Crisp circular HTML rings, never distorted by SVG) -->
            <div 
              v-if="hoveredPoint" 
              class="absolute inset-0 w-full h-[calc(100%-24px)] pointer-events-none z-30"
            >
              <!-- Sales Indicator Dot -->
              <div 
                v-if="activeStream === 'ALL' || activeStream === 'SALES'"
                class="absolute w-3 h-3 rounded-full bg-white border-[2.5px] border-[#F4511E] shadow-md shadow-[#F4511E]/40 ring-4 ring-[#F4511E]/20 -translate-x-1/2 -translate-y-1/2 transition-transform duration-75"
                :style="{ left: `${hoveredPoint.x}%`, top: `${hoveredPoint.salesY}%` }"
              ></div>

              <!-- Collections Indicator Dot -->
              <div 
                v-if="activeStream === 'ALL' || activeStream === 'COLLECTIONS'"
                class="absolute w-3 h-3 rounded-full bg-white border-[2.5px] border-emerald-500 shadow-md shadow-emerald-500/40 ring-4 ring-emerald-500/20 -translate-x-1/2 -translate-y-1/2 transition-transform duration-75"
                :style="{ left: `${hoveredPoint.x}%`, top: `${hoveredPoint.collY}%` }"
              ></div>

              <!-- Expenses Indicator Dot -->
              <div 
                v-if="activeStream === 'ALL' || activeStream === 'EXPENSES'"
                class="absolute w-3 h-3 rounded-full bg-white border-[2.5px] border-rose-500 shadow-md shadow-rose-500/40 ring-4 ring-rose-500/20 -translate-x-1/2 -translate-y-1/2 transition-transform duration-75"
                :style="{ left: `${hoveredPoint.x}%`, top: `${hoveredPoint.expY}%` }"
              ></div>
            </div>

            <!-- Sleek Floating Crosshair Tooltip -->
            <div
              v-if="hoveredPoint"
              class="absolute z-40 bg-slate-900/95 text-white backdrop-blur-md rounded-xl p-3 shadow-2xl border border-slate-700/60 pointer-events-none transition-all duration-75 min-w-[210px]"
              :style="{
                left: `${Math.max(16, Math.min(84, hoveredPoint.x))}%`,
                top: `${Math.max(8, Math.min(60, Math.min(hoveredPoint.salesY, hoveredPoint.collY, hoveredPoint.expY)))}%`,
                transform: 'translate(-50%, -115%)'
              }"
            >
              <div class="flex items-center justify-between pb-2 mb-2 border-b border-slate-700/60 font-mono text-[11px]">
                <span class="font-bold text-slate-200 uppercase tracking-wider">{{ hoveredPoint.label }}</span>
                <span class="text-slate-400 text-[10px]">{{ hoveredPoint.date }}</span>
              </div>

              <div class="space-y-1.5 font-mono text-xs">
                <div v-if="activeStream === 'ALL' || activeStream === 'SALES'" class="flex items-center justify-between gap-3">
                  <span class="flex items-center gap-1.5 text-slate-300">
                    <span class="w-2 h-2 rounded-full bg-[#F4511E]"></span>
                    Sales:
                  </span>
                  <span class="font-bold text-white">{{ formatCurrency(hoveredPoint.salesRevenue, currency) }}</span>
                </div>

                <div v-if="activeStream === 'ALL' || activeStream === 'COLLECTIONS'" class="flex items-center justify-between gap-3">
                  <span class="flex items-center gap-1.5 text-slate-300">
                    <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
                    Collections:
                  </span>
                  <span class="font-bold text-emerald-400">{{ formatCurrency(hoveredPoint.debtCollections, currency) }}</span>
                </div>

                <div v-if="activeStream === 'ALL' || activeStream === 'EXPENSES'" class="flex items-center justify-between gap-3">
                  <span class="flex items-center gap-1.5 text-slate-300">
                    <span class="w-2 h-2 rounded-full bg-rose-400"></span>
                    Expenses:
                  </span>
                  <span class="font-bold text-rose-400">{{ formatCurrency(hoveredPoint.pettyExpenses, currency) }}</span>
                </div>

                <!-- Net Cashflow Indicator -->
                <div class="pt-1.5 mt-1 border-t border-slate-800 flex items-center justify-between gap-3 text-[11px]">
                  <span class="text-slate-400 font-semibold">Net Cashflow:</span>
                  <span 
                    class="font-black"
                    :class="hoveredPoint.netCashflow >= 0 ? 'text-emerald-400' : 'text-rose-400'"
                  >
                    {{ hoveredPoint.netCashflow >= 0 ? '+' : '' }}{{ formatCurrency(hoveredPoint.netCashflow, currency) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- X-Axis Labels -->
            <div class="absolute bottom-0 left-0 right-0 h-6 select-none pointer-events-none">
              <span 
                v-for="(pt, idx) in chartPoints" 
                :key="idx"
                class="absolute text-[10px] sm:text-[11px] font-mono font-bold transition-all pt-1 select-none"
                :class="[
                  activeHoverIndex === idx ? 'text-primary font-black scale-110' : 'text-on-surface-variant',
                  idx === 0 ? 'text-left' : idx === chartPoints.length - 1 ? 'text-right' : 'text-center'
                ]"
                :style="{
                  left: idx === 0 ? '0%' : idx === chartPoints.length - 1 ? '100%' : `${pt.x}%`,
                  transform: idx === 0 ? 'translateX(0%)' : idx === chartPoints.length - 1 ? 'translateX(-100%)' : 'translateX(-50%)'
                }"
              >
                {{ pt.label }}
              </span>
            </div>
          </div>
        </div>

        <!-- Inflow vs Outflow Footer Pills -->
        <div class="mt-8 pt-4 border-t border-outline-variant/40 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div class="flex flex-wrap items-center gap-4">
            <span class="flex items-center gap-1.5 font-bold text-on-surface">
              <span class="w-2.5 h-2.5 rounded-full bg-primary"></span>
              Sales: {{ formatCurrency(totalPeriodSales, currency) }}
            </span>
            <span class="flex items-center gap-1.5 font-bold text-emerald-600">
              <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              Profit: {{ formatCurrency(grossProfitAmount, currency) }} ({{ grossMarginPercent }}%)
            </span>
            <span class="flex items-center gap-1.5 font-bold text-emerald-600">
              <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              Collections: {{ formatCurrency(debtorsCollected, currency) }}
            </span>
            <span class="flex items-center gap-1.5 font-bold text-rose-600">
              <span class="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              Expenses: {{ formatCurrency(payOutAmount, currency) }}
            </span>
          </div>
          <span class="text-on-surface-variant font-semibold">{{ $t('dashboard.verifiedLedger') }}</span>
        </div>
      </div>

      <!-- ========================================== -->
      <!-- TIER 4: PAYMENT CHANNELS & PETTY CASH RADAR -->
      <!-- ========================================== -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Payment Channels Breakdown -->
        <div class="bg-surface-container-lowest rounded-2xl border border-outline-variant/60 shadow-sm p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between pb-3 border-b border-outline-variant/40 mb-4">
              <div>
                <h3 class="text-base font-black text-on-surface tracking-tight">{{ $t('dashboard2.paymentChannels') }}</h3>
                <p class="text-xs text-on-surface-variant">Collections distribution across settlement methods</p>
              </div>
              <span class="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-surface-container-high text-on-surface-variant">
                {{ selectedPeriodLabel }}
              </span>
            </div>
            
            <div class="space-y-3.5">
              <!-- Channel: Cash in Till -->
              <div>
                <div class="flex justify-between text-xs font-mono font-bold mb-1.5">
                  <span class="text-on-surface flex items-center gap-2">
                    <span class="w-2.5 h-2.5 rounded-full bg-primary"></span>
                    {{ $t('dashboard2.cashInTill') }}
                  </span>
                  <span>{{ formatCurrency(paymentBreakdown.cash.amount, currency) }} ({{ channelPercentages.cash }}%)</span>
                </div>
                <div class="w-full bg-surface-container-high rounded-full h-2">
                  <div class="bg-primary h-2 rounded-full transition-all duration-500" :style="{ width: `${channelPercentages.cash}%` }"></div>
                </div>
              </div>

              <!-- Channel: Mobile Money (M-Pesa) -->
              <div>
                <div class="flex justify-between text-xs font-mono font-bold mb-1.5">
                  <span class="text-on-surface flex items-center gap-2">
                    <span class="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                    {{ $t('dashboard2.mpesaMobile') }}
                  </span>
                  <span>{{ formatCurrency(paymentBreakdown.mobile.amount, currency) }} ({{ channelPercentages.mobile }}%)</span>
                </div>
                <div class="w-full bg-surface-container-high rounded-full h-2">
                  <div class="bg-blue-500 h-2 rounded-full transition-all duration-500" :style="{ width: `${channelPercentages.mobile}%` }"></div>
                </div>
              </div>

              <!-- Channel: Card Terminal -->
              <div>
                <div class="flex justify-between text-xs font-mono font-bold mb-1.5">
                  <span class="text-on-surface flex items-center gap-2">
                    <span class="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                    {{ $t('dashboard2.cardTerminal') }}
                  </span>
                  <span>{{ formatCurrency(paymentBreakdown.card.amount, currency) }} ({{ channelPercentages.card }}%)</span>
                </div>
                <div class="w-full bg-surface-container-high rounded-full h-2">
                  <div class="bg-purple-500 h-2 rounded-full transition-all duration-500" :style="{ width: `${channelPercentages.card}%` }"></div>
                </div>
              </div>

              <!-- Channel: Credit Invoices -->
              <div>
                <div class="flex justify-between text-xs font-mono font-bold mb-1.5">
                  <span class="text-on-surface flex items-center gap-2">
                    <span class="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    {{ $t('dashboard2.creditInvoices') }}
                  </span>
                  <span>{{ formatCurrency(paymentBreakdown.credit.amount, currency) }} ({{ channelPercentages.credit }}%)</span>
                </div>
                <div class="w-full bg-surface-container-high rounded-full h-2">
                  <div class="bg-amber-500 h-2 rounded-full transition-all duration-500" :style="{ width: `${channelPercentages.credit}%` }"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Mini Petty Cash Movement Radar -->
        <div class="bg-surface-container-lowest rounded-2xl border border-outline-variant/60 shadow-sm p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between pb-3 border-b border-outline-variant/40 mb-4">
              <div>
                <h3 class="text-base font-black text-on-surface tracking-tight">{{ $t('dashboard2.pettyCashRadar') }}</h3>
                <p class="text-xs text-on-surface-variant">Store till adjustments and cash drawer movements</p>
              </div>
              <button 
                @click="openCashMovementModal"
                class="text-xs font-bold font-mono text-primary hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>+ Move Cash</span>
              </button>
            </div>

            <div class="grid grid-cols-3 gap-3 text-center font-mono mb-4">
              <div class="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <span class="text-[10px] text-emerald-800 font-bold block uppercase tracking-wider">{{ $t('dashboard2.payIn') }}</span>
                <span class="text-sm sm:text-base font-black text-emerald-600 mt-1 block">+{{ formatCurrency(payInAmount, currency) }}</span>
              </div>
              <div class="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <span class="text-[10px] text-rose-800 font-bold block uppercase tracking-wider">{{ $t('dashboard2.payOut') }}</span>
                <span class="text-sm sm:text-base font-black text-rose-600 mt-1 block">-{{ formatCurrency(payOutAmount, currency) }}</span>
              </div>
              <div class="p-3 rounded-xl bg-surface-container-low border border-outline-variant/40">
                <span class="text-[10px] text-on-surface-variant font-bold block uppercase tracking-wider">{{ $t('dashboard2.cashDrop') }}</span>
                <span class="text-sm sm:text-base font-black text-on-surface mt-1 block">-{{ formatCurrency(cashDropAmount, currency) }}</span>
              </div>
            </div>
          </div>

          <div class="p-3 rounded-xl bg-surface-container-low border border-outline-variant/30 flex items-center justify-between text-xs font-mono">
            <span class="text-on-surface-variant">Net Cash Movement:</span>
            <span class="font-black" :class="(payInAmount - payOutAmount - cashDropAmount) >= 0 ? 'text-emerald-600' : 'text-rose-600'">
              {{ (payInAmount - payOutAmount - cashDropAmount) >= 0 ? '+' : '' }}{{ formatCurrency(payInAmount - payOutAmount - cashDropAmount, currency) }}
            </span>
          </div>
        </div>
      </div>

    </div>

    <!-- ========================================== -->
    <!-- TAB 2: COLLECTION COMMAND CENTER           -->
    <!-- ========================================== -->
    <div v-else-if="activeMainTab === 'collection'" class="space-y-6">
      <!-- HERO CARDS: COLLECTION RATE, MONEY TO COLLECT, MONEY OWED -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Card 1: Collection Rate -->
        <div class="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/60 shadow-sm relative overflow-hidden flex flex-col justify-between group hover:border-primary transition-all">
          <div class="flex justify-between items-center mb-3">
            <span class="text-xs font-mono font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
              <Percent class="w-4 h-4 text-primary" />
              {{ $t('dashboard2.collectionRate') }}
            </span>
            <span 
              class="px-2 py-0.5 rounded-full text-[10px] font-mono font-black uppercase tracking-wider"
              :class="collectionRate >= 75 ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : (collectionRate >= 50 ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20' : 'bg-rose-500/10 text-rose-600 border border-rose-500/20')"
            >
              {{ collectionRate >= 75 ? 'Healthy Flow' : (collectionRate >= 50 ? 'Moderate' : 'Needs Action') }}
            </span>
          </div>

          <div>
            <div class="flex items-baseline gap-2">
              <span class="text-2xl sm:text-3xl lg:text-2xl xl:text-3xl font-black font-mono tracking-tight amount-hero" :class="collectionRate >= 75 ? 'text-emerald-600' : 'text-on-surface'">
                {{ collectionRate }}%
              </span>
              <span class="text-xs font-mono text-on-surface-variant">{{ $t('dashboard2.collectionRateDesc') }}</span>
            </div>

            <!-- Progress bar -->
            <div class="w-full bg-surface-container-high rounded-full h-2.5 mt-3 overflow-hidden">
              <div 
                class="h-full rounded-full transition-all duration-700 ease-out"
                :class="collectionRate >= 75 ? 'bg-emerald-500' : (collectionRate >= 50 ? 'bg-amber-500' : 'bg-rose-500')"
                :style="{ width: `${Math.min(collectionRate, 100)}%` }"
              ></div>
            </div>

            <div class="flex justify-between items-center text-[11px] font-mono mt-3 pt-2.5 border-t border-outline-variant/40 text-on-surface-variant">
              <span>Collected: <strong class="text-emerald-600 font-black">{{ formatCurrency(amountCollected, currency) }}</strong></span>
              <span>Due: <strong class="text-on-surface font-black">{{ formatCurrency(amountDue, currency) }}</strong></span>
            </div>
          </div>
        </div>

        <!-- Card 2: Money you need to collect (Accounts Receivable / Debtors) -->
        <div class="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/60 shadow-sm relative overflow-hidden flex flex-col justify-between group hover:border-primary transition-all">
          <div>
            <div class="flex justify-between items-center mb-2">
              <span class="text-xs font-mono font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
                <Users class="w-4 h-4 text-primary" />
                {{ $t('dashboard2.moneyToCollect') }}
              </span>
              <button 
                @click="openCollectPaymentModal" 
                class="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-mono font-black shadow-xs cursor-pointer transition-colors"
              >
                + {{ $t('dashboard2.collect') }}
              </button>
            </div>
            <div class="text-xl sm:text-2xl lg:text-xl xl:text-2xl 2xl:text-3xl font-black font-mono text-on-surface tracking-tight mt-1 amount-hero truncate">
              {{ formatCurrency(moneyToCollect.total, currency) }}
            </div>
          </div>

          <!-- Sub-buckets: Due Today, Due this Week, Overdue -->
          <div class="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-outline-variant/40 text-center font-mono">
            <div class="bg-surface-container-low p-2 rounded-xl border border-outline-variant/30">
              <p class="text-[10px] uppercase font-bold text-on-surface-variant truncate">{{ $t('dashboard2.dueToday') }}</p>
              <p class="text-xs font-black text-on-surface mt-0.5 truncate">{{ formatCurrency(moneyToCollect.dueToday, currency) }}</p>
            </div>
            <div class="bg-surface-container-low p-2 rounded-xl border border-outline-variant/30">
              <p class="text-[10px] uppercase font-bold text-on-surface-variant truncate">{{ $t('dashboard2.dueThisWeek') }}</p>
              <p class="text-xs font-black text-amber-700 mt-0.5 truncate">{{ formatCurrency(moneyToCollect.dueThisWeek, currency) }}</p>
            </div>
            <div class="bg-rose-500/10 p-2 rounded-xl border border-rose-500/20">
              <p class="text-[10px] uppercase font-bold text-rose-700 truncate">{{ $t('dashboard2.overdue') }}</p>
              <p class="text-xs font-black text-rose-600 mt-0.5 truncate">{{ formatCurrency(moneyToCollect.overdue, currency) }}</p>
            </div>
          </div>
        </div>

        <!-- Card 3: Money store owner owes (Accounts Payable / Suppliers) -->
        <div class="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/60 shadow-sm relative overflow-hidden flex flex-col justify-between group hover:border-purple-500 transition-all">
          <div>
            <div class="flex justify-between items-center mb-2">
              <span class="text-xs font-mono font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
                <Truck class="w-4 h-4 text-purple-700" />
                {{ $t('dashboard2.moneyOwedSuppliers') }}
              </span>
              <button 
                @click="openPaySupplierModal()"
                class="px-2.5 py-1 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface text-[10px] font-mono font-bold border border-outline-variant/60 shadow-xs cursor-pointer transition-colors"
              >
                {{ $t('dashboard2.balanceDue') }}
              </button>
            </div>
            <div class="text-xl sm:text-2xl lg:text-xl xl:text-2xl 2xl:text-3xl font-black font-mono text-purple-700 tracking-tight mt-1 amount-hero truncate">
              {{ formatCurrency(moneyOwedSuppliers.total, currency) }}
            </div>
          </div>

          <!-- Sub-buckets for Suppliers: Due Today, Due this Week, Overdue -->
          <div class="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-outline-variant/40 text-center font-mono">
            <div class="bg-surface-container-low p-2 rounded-xl border border-outline-variant/30">
              <p class="text-[10px] uppercase font-bold text-on-surface-variant truncate">{{ $t('dashboard2.dueToday') }}</p>
              <p class="text-xs font-black text-on-surface mt-0.5">{{ formatCurrency(moneyOwedSuppliers.dueToday, currency) }}</p>
            </div>
            <div class="bg-surface-container-low p-2 rounded-xl border border-outline-variant/30">
              <p class="text-[10px] uppercase font-bold text-on-surface-variant truncate">{{ $t('dashboard2.dueThisWeek') }}</p>
              <p class="text-xs font-black text-purple-700 mt-0.5">{{ formatCurrency(moneyOwedSuppliers.dueThisWeek, currency) }}</p>
            </div>
            <div class="bg-amber-500/10 p-2 rounded-xl border border-amber-500/20">
              <p class="text-[10px] uppercase font-bold text-amber-800 truncate">{{ $t('dashboard2.overdue') }}</p>
              <p class="text-xs font-black text-amber-700 mt-0.5">{{ formatCurrency(moneyOwedSuppliers.overdue, currency) }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- SPOTLIGHT: CLICKABLE HIGH RISK MONEY BANNER (WHEN RISK DEBTORS EXIST) -->
      <div 
        v-if="hasRiskMoney"
        @click="showRiskDebtorsModal = true"
        class="bg-gradient-to-r from-rose-500/15 via-rose-500/10 to-amber-500/10 rounded-2xl p-5 border border-rose-500/30 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer hover:border-rose-500/60 hover:shadow-md transition-all group"
      >
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-600 shrink-0 group-hover:scale-105 transition-transform">
            <AlertOctagon class="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h3 class="text-base font-black text-rose-950 tracking-tight">{{ $t('dashboard2.riskMoneyTitle') }}</h3>
              <span class="px-2 py-0.5 rounded-full bg-rose-600 text-white font-mono font-black text-[10px] tracking-wider uppercase shadow-xs">
                ACTION REQUIRED
              </span>
            </div>
            <p class="text-xs text-rose-900/80 mt-1">
              {{ $t('dashboard2.riskMoneyDesc') }} • <strong>{{ displayedRiskDebtors.length }} customer{{ displayedRiskDebtors.length === 1 ? '' : 's' }}</strong> flagged with delayed settlements.
            </p>
          </div>
        </div>

        <div class="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div class="text-left sm:text-right">
            <span class="text-xs font-mono font-bold text-rose-800 block uppercase">Total at Risk</span>
            <span class="text-lg sm:text-xl lg:text-lg xl:text-xl 2xl:text-2xl font-mono font-black text-rose-600 amount-kpi truncate">{{ formatCurrency(displayedRiskAmount, currency) }}</span>
          </div>
          <button 
            type="button"
            class="px-4 py-2.5 rounded-xl bg-rose-600 group-hover:bg-rose-700 text-white text-xs font-black font-mono shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
          >
            <span>Inspect Risk</span>
            <ArrowRight class="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>

      <!-- HEALTHY PORTFOLIO BANNER (WHEN NO RISK MONEY) -->
      <div 
        v-else
        class="bg-gradient-to-r from-emerald-500/15 via-emerald-500/10 to-teal-500/10 rounded-2xl p-5 border border-emerald-500/30 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-600 shrink-0">
            <ShieldCheck class="w-6 h-6" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h3 class="text-base font-black text-emerald-950 tracking-tight">Credit Portfolio in Good Standing</h3>
              <span class="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-mono font-black text-[10px] tracking-wider uppercase shadow-xs">
                HEALTHY PORTFOLIO
              </span>
            </div>
            <p class="text-xs text-emerald-900/80 mt-1">
              No overdue or high-risk debtors detected across your store ledger. All customer settlements are up to date.
            </p>
          </div>
        </div>

        <div class="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div class="text-left sm:text-right">
            <span class="text-xs font-mono font-bold text-emerald-800 block uppercase">Total at Risk</span>
            <span class="text-lg sm:text-xl lg:text-lg xl:text-xl 2xl:text-2xl font-mono font-black text-emerald-600 amount-kpi truncate">{{ formatCurrency(0, currency) }}</span>
          </div>
          <div class="px-3 py-2 rounded-xl bg-emerald-600/15 text-emerald-700 text-xs font-black font-mono flex items-center gap-1.5 shrink-0">
            <CheckCircle2 class="w-4 h-4" />
            <span>All Clear</span>
          </div>
        </div>
      </div>

      <!-- DEBT AGING SCHEDULE (CURRENT, WEEKS, MONTHS, 60+ DAYS) -->
      <div class="bg-surface-container-lowest rounded-2xl border border-outline-variant/60 shadow-sm p-5 sm:p-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-outline-variant/40 mb-5">
          <div>
            <h3 class="text-base font-black text-on-surface tracking-tight">{{ $t('dashboard2.debtAging') }}</h3>
            <p class="text-xs text-on-surface-variant">Aging schedule across customer invoices & credit receivables</p>
          </div>
          <div class="text-xs font-mono text-on-surface-variant flex items-center gap-2">
            <span>Total Receivables:</span>
            <strong class="text-on-surface font-black truncate">{{ formatCurrency(moneyToCollect.total, currency) }}</strong>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Bucket 1: Current (0-7d) -->
          <div class="p-4 rounded-xl bg-surface-container-low border border-outline-variant/40 flex flex-col justify-between">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-mono font-bold text-emerald-700 flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                {{ $t('dashboard2.currentAging') }}
              </span>
              <span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-700 font-bold">Safe</span>
            </div>
            <div class="text-base sm:text-lg lg:text-base xl:text-lg 2xl:text-xl font-black font-mono text-on-surface amount-compact truncate">
              {{ formatCurrency(debtAging.current.amount, currency) }}
            </div>
            <div class="text-[11px] font-mono text-on-surface-variant mt-2 pt-2 border-t border-outline-variant/30 flex justify-between">
              <span>Healthy terms</span>
              <span>{{ moneyToCollect.total > 0 ? Math.round((debtAging.current.amount / moneyToCollect.total) * 100) : 0 }}%</span>
            </div>
          </div>

          <!-- Bucket 2: 8-30 Days (Weeks) -->
          <div class="p-4 rounded-xl bg-surface-container-low border border-outline-variant/40 flex flex-col justify-between">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-mono font-bold text-amber-700 flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-amber-500"></span>
                {{ $t('dashboard2.days8to30') }}
              </span>
              <span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-700 font-bold">Watch</span>
            </div>
            <div class="text-base sm:text-lg lg:text-base xl:text-lg 2xl:text-xl font-black font-mono text-amber-700 amount-compact truncate">
              {{ formatCurrency(debtAging.days8to30.amount, currency) }}
            </div>
            <div class="text-[11px] font-mono text-on-surface-variant mt-2 pt-2 border-t border-outline-variant/30 flex justify-between">
              <span>Grace period</span>
              <span>{{ moneyToCollect.total > 0 ? Math.round((debtAging.days8to30.amount / moneyToCollect.total) * 100) : 0 }}%</span>
            </div>
          </div>

          <!-- Bucket 3: 31-60 Days (Months) -->
          <div class="p-4 rounded-xl bg-surface-container-low border border-orange-500/30 flex flex-col justify-between">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-mono font-bold text-orange-700 flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-orange-500"></span>
                {{ $t('dashboard2.days31to60') }}
              </span>
              <span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-700 font-bold">Overdue</span>
            </div>
            <div class="text-base sm:text-lg lg:text-base xl:text-lg 2xl:text-xl font-black font-mono text-orange-700 amount-compact truncate">
              {{ formatCurrency(debtAging.days31to60.amount, currency) }}
            </div>
            <div class="text-[11px] font-mono text-on-surface-variant mt-2 pt-2 border-t border-outline-variant/30 flex justify-between">
              <span>Send reminder</span>
              <span>{{ moneyToCollect.total > 0 ? Math.round((debtAging.days31to60.amount / moneyToCollect.total) * 100) : 0 }}%</span>
            </div>
          </div>

          <!-- Bucket 4: 60+ Days (Severe Risk) -->
          <div 
            @click="showRiskDebtorsModal = true"
            class="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex flex-col justify-between cursor-pointer hover:border-rose-500/60 transition-colors group"
          >
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-mono font-bold text-rose-700 flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-rose-600 animate-ping"></span>
                {{ $t('dashboard2.days60plus') }}
              </span>
              <span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-600 text-white font-bold">High Risk</span>
            </div>
            <div class="text-base sm:text-lg lg:text-base xl:text-lg 2xl:text-xl font-black font-mono text-rose-600 amount-compact truncate">
              {{ formatCurrency(debtAging.days60plus.amount, currency) }}
            </div>
            <div class="text-[11px] font-mono text-rose-800 mt-2 pt-2 border-t border-rose-500/20 flex justify-between items-center">
              <span class="font-bold underline group-hover:text-rose-950">Inspect debtors</span>
              <span>{{ moneyToCollect.total > 0 ? Math.round((debtAging.days60plus.amount / moneyToCollect.total) * 100) : 0 }}%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- BOTTOM ROW OF COLLECTION TAB: TOP DEBTORS & TOP CREDITORS SIDE-BY-SIDE -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Debtors Spotlight (Fast Collect) -->
        <div class="bg-surface-container-lowest rounded-2xl border border-outline-variant/60 shadow-sm p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between pb-3 border-b border-outline-variant/40 mb-4">
              <div>
                <h3 class="text-base font-black text-on-surface tracking-tight">{{ $t('dashboard2.debtorsSpotlight') }}</h3>
                <p class="text-xs text-on-surface-variant">{{ $t('dashboard2.topDebtorsDesc') }}</p>
              </div>
              <button 
                @click="router.push('/customers')"
                class="text-xs font-bold font-mono text-primary hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>{{ $t('dashboard2.viewAllCustomers') }}</span>
                <ArrowRight class="w-3.5 h-3.5" />
              </button>
            </div>

            <!-- Debtors Listing -->
            <div class="space-y-3">
              <template v-if="topDebtors.length > 0">
                <div 
                  v-for="deb in topDebtors" 
                  :key="deb.id"
                  class="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/40 flex items-center justify-between gap-3 hover:border-primary/50 transition-colors"
                >
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center gap-2">
                      <span class="text-xs font-black text-on-surface truncate">{{ deb.name }}</span>
                      <span v-if="deb.code" class="text-[10px] font-mono px-1.5 py-0.2 rounded bg-surface-container-high text-on-surface-variant">{{ deb.code }}</span>
                    </div>
                    <p class="text-[11px] font-mono text-on-surface-variant truncate mt-0.5">{{ deb.phone || 'No phone' }}</p>
                    <div v-if="deb.creditLimit > 0" class="w-full bg-surface-container-high rounded-full h-1.5 mt-2">
                      <div 
                        class="h-1.5 rounded-full"
                        :class="deb.outstandingBalance > deb.creditLimit ? 'bg-rose-500' : 'bg-primary'"
                        :style="{ width: `${Math.min(Math.round((deb.outstandingBalance / deb.creditLimit) * 100), 100)}%` }"
                      ></div>
                    </div>
                  </div>

                  <div class="text-right shrink-0">
                    <span class="text-xs font-mono font-black text-rose-600 block">{{ formatCurrency(deb.outstandingBalance, currency) }}</span>
                    <button 
                      @click="openCollectForCustomer(deb)"
                      class="mt-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold font-mono shadow-xs cursor-pointer transition-colors"
                    >
                      {{ $t('dashboard2.collect') }}
                    </button>
                  </div>
                </div>
              </template>
              <template v-else>
                <div class="py-8 text-center text-xs text-on-surface-variant font-mono">
                  <CheckCircle2 class="w-6 h-6 text-emerald-500 mx-auto mb-1.5" />
                  <span>{{ $t('dashboard2.noDebtors') }}</span>
                </div>
              </template>
            </div>
          </div>
        </div>

        <!-- Creditors Spotlight (Payables) -->
        <div class="bg-surface-container-lowest rounded-2xl border border-outline-variant/60 shadow-sm p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between pb-3 border-b border-outline-variant/40 mb-4">
              <div>
                <h3 class="text-base font-black text-on-surface tracking-tight">{{ $t('dashboard2.creditorsSpotlight') }}</h3>
                <p class="text-xs text-on-surface-variant">{{ $t('dashboard2.topCreditorsDesc') }}</p>
              </div>
              <button 
                @click="router.push('/suppliers')"
                class="text-xs font-bold font-mono text-primary hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>{{ $t('dashboard2.viewAllSuppliers') }}</span>
                <ArrowRight class="w-3.5 h-3.5" />
              </button>
            </div>

            <div class="space-y-3">
              <template v-if="topCreditors.length > 0">
                <div 
                  v-for="cred in topCreditors" 
                  :key="cred.id"
                  class="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/40 flex items-center justify-between gap-3 hover:border-purple-500/50 transition-colors"
                >
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center gap-2">
                      <span class="text-xs font-black text-on-surface truncate">{{ cred.name }}</span>
                      <span class="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-500/10 text-purple-700 font-bold">{{ cred.category }}</span>
                    </div>
                    <p class="text-[11px] font-mono text-on-surface-variant truncate mt-0.5">
                      {{ cred.contactPerson ? `${cred.contactPerson} • ` : '' }}{{ cred.phone || 'No phone' }}
                    </p>
                  </div>

                  <div class="text-right shrink-0">
                    <span class="text-xs font-mono font-black text-purple-700 block">{{ formatCurrency(cred.balance, currency) }}</span>
                    <button 
                      @click="openPaySupplierModal(cred)"
                      class="mt-1 px-2.5 py-1 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface text-[10px] font-bold font-mono border border-outline-variant/60 shadow-xs cursor-pointer transition-colors"
                    >
                      {{ $t('dashboard2.balanceDue') }}
                    </button>
                  </div>
                </div>
              </template>
              <template v-else>
                <div class="py-8 text-center text-xs text-on-surface-variant font-mono">
                  <CheckCircle2 class="w-6 h-6 text-emerald-500 mx-auto mb-1.5" />
                  <span>{{ $t('dashboard2.noCreditors') }}</span>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ========================================== -->
    <!-- TAB 3: STOCK & INVENTORY COMMAND CENTER   -->
    <!-- ========================================== -->
    <div v-else-if="activeMainTab === 'stock'" class="space-y-6">
      <!-- CAPITAL INVENTORY VALUATION HERO CARDS -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Capital at Cost -->
        <div class="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/60 shadow-sm relative overflow-hidden flex flex-col justify-between group hover:border-primary transition-all">
          <div class="flex justify-between items-center mb-2">
            <span class="text-xs font-mono font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
              <Banknote class="w-4 h-4 text-primary" />
              {{ $t('dashboard2.capitalInventory') }}
            </span>
            <span class="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-mono font-black uppercase">At Cost</span>
          </div>
          <div>
            <div class="text-lg sm:text-xl lg:text-lg xl:text-xl 2xl:text-2xl font-black font-mono text-on-surface tracking-tight amount-kpi truncate">
              {{ formatCurrency(inventoryTotalCapital, currency) }}
            </div>
            <p class="text-xs text-on-surface-variant mt-1">Total tied working capital across branch stock</p>
          </div>
        </div>

        <!-- Potential Sales Revenue -->
        <div class="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/60 shadow-sm relative overflow-hidden flex flex-col justify-between group hover:border-emerald-500 transition-all">
          <div class="flex justify-between items-center mb-2">
            <span class="text-xs font-mono font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
              <TrendingUp class="w-4 h-4 text-emerald-600" />
              {{ $t('dashboard2.potentialRevenue') }}
            </span>
            <span class="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-mono font-black uppercase">Retail Value</span>
          </div>
          <div>
            <div class="text-lg sm:text-xl lg:text-lg xl:text-xl 2xl:text-2xl font-black font-mono text-emerald-600 tracking-tight amount-kpi truncate">
              {{ formatCurrency(inventoryPotentialRevenue, currency) }}
            </div>
            <p class="text-xs text-on-surface-variant mt-1">Expected turnover at current catalog selling prices</p>
          </div>
        </div>

        <!-- Unrealized Margin -->
        <div class="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/60 shadow-sm relative overflow-hidden flex flex-col justify-between group hover:border-purple-500 transition-all">
          <div class="flex justify-between items-center mb-2">
            <span class="text-xs font-mono font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
              <Sparkles class="w-4 h-4 text-purple-600" />
              {{ $t('dashboard2.unrealizedProfit') }}
            </span>
            <span class="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-700 text-[10px] font-mono font-black uppercase">Projected Gain</span>
          </div>
          <div>
            <div class="text-lg sm:text-xl lg:text-lg xl:text-xl 2xl:text-2xl font-black font-mono text-purple-700 tracking-tight amount-kpi truncate">
              {{ formatCurrency(inventoryUnrealizedProfit, currency) }}
            </div>
            <p class="text-xs text-on-surface-variant mt-1">
              Projected margin: <strong>{{ inventoryTotalCapital > 0 ? Math.round((inventoryUnrealizedProfit / inventoryTotalCapital) * 100) : 0 }}%</strong> markup on cost
            </p>
          </div>
        </div>

        <!-- Stock Runway (Days Sales of Inventory / DSI) -->
        <div class="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/60 shadow-sm relative overflow-hidden flex flex-col justify-between group hover:border-blue-500 transition-all">
          <div class="flex justify-between items-center mb-2">
            <span class="text-xs font-mono font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
              <Hourglass class="w-4 h-4 text-blue-600" />
              {{ $t('dashboard2.stockRunway') }}
            </span>
            <span 
              class="px-2 py-0.5 rounded-full text-[10px] font-mono font-black uppercase shadow-xs"
              :class="stockRunwayStatus === 'CRITICAL_LOW' 
                ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20' 
                : stockRunwayStatus === 'OPTIMAL_LEAN' 
                  ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' 
                  : stockRunwayStatus === 'HEALTHY_BALANCED'
                    ? 'bg-blue-500/10 text-blue-600 border border-blue-500/20'
                    : stockRunwayStatus === 'OVERSTOCKED'
                      ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                      : 'bg-surface-container text-on-surface-variant'"
            >
              {{ stockRunwayStatus === 'CRITICAL_LOW' ? $t('dashboard2.runwayCritical') : stockRunwayStatus === 'OPTIMAL_LEAN' ? $t('dashboard2.runwayOptimal') : stockRunwayStatus === 'HEALTHY_BALANCED' ? $t('dashboard2.runwayHealthy') : stockRunwayStatus === 'OVERSTOCKED' ? $t('dashboard2.runwayOverstocked') : $t('dashboard2.runwayStagnant') }}
            </span>
          </div>
          <div>
            <div class="text-lg sm:text-xl lg:text-lg xl:text-xl 2xl:text-2xl font-black font-mono text-on-surface tracking-tight amount-kpi truncate">
              {{ stockRunwayDays > 0 ? $t('dashboard2.daysRunway', { days: stockRunwayDays }) : '—' }}
            </div>
            <p class="text-xs text-on-surface-variant mt-1">
              {{ stockDailyCogs > 0 ? $t('dashboard2.dailyBurnRate', { amount: formatCurrency(stockDailyCogs, currency) }) : $t('dashboard2.stockRunwayDesc') }}
            </p>
          </div>
        </div>
      </div>

      <!-- VELOCITY SPECTRUM: FAST MOVING, SLOW MOVING, DEAD STOCK -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Fast Moving -->
        <div class="bg-surface-container-lowest rounded-2xl p-5 border border-emerald-500/30 shadow-sm flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-mono font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                {{ $t('dashboard2.fastMoving') }}
              </span>
              <span class="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 font-mono font-black text-[10px]">
                {{ fastMovingStock.count }} products
              </span>
            </div>
            <div class="text-lg sm:text-xl lg:text-lg xl:text-xl 2xl:text-2xl font-black font-mono text-emerald-600 tracking-tight amount-kpi truncate">
              {{ formatCurrency(fastMovingStock.capital, currency) }}
            </div>
            <p class="text-xs text-on-surface-variant mt-1">{{ $t('dashboard2.fastMovingDesc') }}</p>
          </div>
          <div class="mt-4 pt-3 border-t border-outline-variant/30 flex justify-between items-center text-xs font-mono text-on-surface-variant">
            <span>Share of capital:</span>
            <strong class="text-emerald-700 font-bold">{{ fastMovingStock.percent }}%</strong>
          </div>
        </div>

        <!-- Slow Moving -->
        <div class="bg-surface-container-lowest rounded-2xl p-5 border border-amber-500/30 shadow-sm flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-mono font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-amber-500"></span>
                {{ $t('dashboard2.slowMoving') }}
              </span>
              <span class="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 font-mono font-black text-[10px]">
                {{ slowMovingStock.count }} products
              </span>
            </div>
            <div class="text-lg sm:text-xl lg:text-lg xl:text-xl 2xl:text-2xl font-black font-mono text-amber-700 tracking-tight amount-kpi truncate">
              {{ formatCurrency(slowMovingStock.capital, currency) }}
            </div>
            <p class="text-xs text-on-surface-variant mt-1">{{ $t('dashboard2.slowMovingDesc') }}</p>
          </div>
          <div class="mt-4 pt-3 border-t border-outline-variant/30 flex justify-between items-center text-xs font-mono text-on-surface-variant">
            <span>Share of capital:</span>
            <strong class="text-amber-800 font-bold">{{ slowMovingStock.percent }}%</strong>
          </div>
        </div>

        <!-- Dead Stock -->
        <div class="bg-surface-container-lowest rounded-2xl p-5 border border-rose-500/30 shadow-sm flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-mono font-bold uppercase tracking-wider text-rose-700 flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-rose-600 animate-ping"></span>
                {{ $t('dashboard2.deadStock') }}
              </span>
              <span class="px-2 py-0.5 rounded-full bg-rose-600 text-white font-mono font-black text-[10px]">
                {{ deadStock.count }} products
              </span>
            </div>
            <div class="text-lg sm:text-xl lg:text-lg xl:text-xl 2xl:text-2xl font-black font-mono text-rose-600 tracking-tight amount-kpi truncate">
              {{ formatCurrency(deadStock.capital, currency) }}
            </div>
            <p class="text-xs text-rose-900/80 mt-1">{{ $t('dashboard2.deadStockDesc') }}</p>
          </div>
          <div class="mt-4 pt-3 border-t border-rose-500/20 flex justify-between items-center text-xs font-mono text-rose-800">
            <span>Trapped capital:</span>
            <strong class="font-black">{{ deadStock.percent }}%</strong>
          </div>
        </div>
      </div>

      <!-- SPOTLIGHT: DEAD STOCK PROMINENT BANNER -->
      <div 
        @click="showDeadStockModal = true"
        class="bg-gradient-to-r from-rose-500/15 via-rose-500/10 to-amber-500/10 rounded-2xl p-5 border border-rose-500/30 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer hover:border-rose-500/60 hover:shadow-md transition-all group"
      >
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-600 shrink-0 group-hover:scale-105 transition-transform">
            <AlertTriangle class="w-6 h-6 text-rose-600 animate-bounce" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h3 class="text-base font-black text-rose-950 tracking-tight">{{ $t('dashboard2.deadStockSpotlightTitle') }}</h3>
              <span class="px-2 py-0.5 rounded-full bg-rose-600 text-white font-mono font-black text-[10px] tracking-wider uppercase shadow-xs">
                CAPITAL TRAP
              </span>
            </div>
            <p class="text-xs text-rose-900/80 mt-1">
              {{ $t('dashboard2.deadStockSpotlightDesc', { amount: formatCurrency(deadStock.capital, currency), count: deadStock.count }) }}
            </p>
          </div>
        </div>

        <div class="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div class="text-left sm:text-right">
            <span class="text-xs font-mono font-bold text-rose-800 block uppercase">Dormant Capital</span>
            <span class="text-lg sm:text-xl lg:text-lg xl:text-xl 2xl:text-2xl font-mono font-black text-rose-600 amount-kpi truncate">{{ formatCurrency(deadStock.capital, currency) }}</span>
          </div>
          <button 
            type="button"
            class="px-4 py-2.5 rounded-xl bg-rose-600 group-hover:bg-rose-700 text-white text-xs font-black font-mono shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
          >
            <span>{{ $t('dashboard2.viewDeadStockBtn') }}</span>
            <ArrowRight class="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>

      <!-- SMART INVENTORY ADVISORY & RECOMMENDATIONS -->
      <div class="bg-surface-container-lowest rounded-2xl border border-outline-variant/60 shadow-sm p-5 sm:p-6">
        <div class="flex items-center justify-between pb-3 border-b border-outline-variant/40 mb-4">
          <div class="flex items-center gap-2">
            <Sparkles class="w-4 h-4 text-primary" />
            <h3 class="text-base font-black text-on-surface tracking-tight">{{ $t('dashboard2.inventoryAdvisory') }}</h3>
          </div>
          <span class="text-xs font-mono text-on-surface-variant">Automated Recommendations</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-4 gap-4">
          <div 
            v-for="(rec, rIdx) in inventoryRecommendations" 
            :key="rIdx"
            class="p-4 rounded-xl border flex flex-col justify-between transition-all"
            :class="rec.type === 'DISCOUNT_DORMANT' 
              ? 'bg-rose-500/5 border-rose-500/20 hover:border-rose-500/40' 
              : (rec.type === 'STOP_REORDER' 
                ? 'bg-amber-500/5 border-amber-500/20 hover:border-amber-500/40' 
                : (rec.type === 'REPLENISH_FAST' 
                  ? 'bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/40' 
                  : 'bg-primary/5 border-primary/20 hover:border-primary/40'))"
          >
            <div>
              <div class="flex items-center justify-between mb-2">
                <span 
                  class="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider"
                  :class="rec.priority === 'HIGH' ? 'bg-rose-600 text-white' : (rec.priority === 'MEDIUM' ? 'bg-amber-500/20 text-amber-800 dark:text-amber-300 font-bold' : 'bg-surface-container-high text-on-surface-variant')"
                >
                  {{ rec.priority }} PRIORITY
                </span>
                <span class="text-[10px] font-mono font-bold text-on-surface-variant">
                  {{ rec.count }} {{ rec.title.includes('Runway') || rec.actionLabel.includes('Runway') ? 'days' : 'items' }}
                </span>
              </div>
              <h4 class="text-xs font-black text-on-surface tracking-tight">{{ rec.title }}</h4>
              <p class="text-xs text-on-surface-variant mt-1.5 leading-relaxed">{{ rec.description }}</p>
            </div>

            <button 
              @click="rec.type === 'DISCOUNT_DORMANT' || rec.type === 'STOP_REORDER' ? (showDeadStockModal = true) : router.push('/inventory')"
              class="mt-4 w-full py-2 rounded-lg font-mono font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              :class="rec.type === 'DISCOUNT_DORMANT' ? 'bg-rose-600 hover:bg-rose-700 text-white' : (rec.type === 'REPLENISH_FAST' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-surface-container-high hover:bg-surface-container-highest text-on-surface border border-outline-variant/40')"
            >
              <span>{{ rec.actionLabel }}</span>
              <ArrowRight class="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      <!-- TIER 5 PRODUCT SAFEGUARD LINKAGE -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Top Selling Products in Stock Tab -->
        <div class="lg:col-span-2 bg-surface-container-lowest rounded-2xl border border-outline-variant/60 shadow-sm overflow-hidden flex flex-col">
          <div class="p-4 border-b border-outline-variant/40 flex justify-between items-center bg-surface-container-low/60">
            <div class="flex items-center gap-2">
              <ShoppingBag class="w-4 h-4 text-primary" />
              <h3 class="text-sm font-black text-on-surface">{{ $t('dashboard2.topSellingProducts') }}</h3>
            </div>
            <button 
              @click="router.push('/top-selling-products')"
              class="text-primary text-xs font-bold hover:underline cursor-pointer flex items-center gap-1 font-mono"
            >
              <span>{{ $t('dashboard2.viewCatalog') }}</span>
              <ArrowRight class="w-3.5 h-3.5" />
            </button>
          </div>

          <div class="divide-y divide-outline-variant/30">
            <template v-if="topSellingProducts.length > 0">
              <div 
                v-for="(prod, idx) in topSellingProducts" 
                :key="idx"
                class="p-4 flex items-center justify-between hover:bg-surface-container-low/40 transition-colors"
              >
                <div class="flex items-center gap-3 min-w-0">
                  <div class="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center font-mono font-black text-xs text-primary shrink-0">
                    #{{ idx + 1 }}
                  </div>
                  <div class="min-w-0">
                    <p class="text-xs font-black text-on-surface truncate">{{ prod.name }}</p>
                    <p class="text-[10px] font-mono text-on-surface-variant">{{ $t('dashboard2.unitsSold', { count: prod.quantity }) }}</p>
                  </div>
                </div>
                <div class="text-right shrink-0">
                  <span class="text-xs font-mono font-black text-primary">{{ formatCurrency(prod.revenue, currency) }}</span>
                </div>
              </div>
            </template>
            <template v-else>
              <div class="py-8 text-center text-xs text-on-surface-variant font-mono">
                <span>{{ $t('dashboard.noSalesToday') }}</span>
              </div>
            </template>
          </div>
        </div>

        <!-- Stock Safeguard -->
        <div class="bg-surface-container-lowest rounded-2xl border border-outline-variant/60 shadow-sm p-5 flex flex-col justify-between">
          <h3 class="text-sm font-black text-on-surface mb-3 flex items-center gap-1.5">
            <ShieldAlert class="w-4 h-4 text-amber-600" />
            {{ $t('dashboard2.stockSafeguard') }}
          </h3>

          <div class="space-y-2.5">
            <button 
              @click="router.push({ path: '/inventory', query: { status: 'Low Stock' } })"
              class="w-full p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 hover:border-amber-500/40 flex items-center justify-between text-left transition-all cursor-pointer group"
            >
              <div class="flex items-center gap-2.5">
                <AlertTriangle class="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
                <span class="text-xs font-bold text-amber-900">{{ $t('dashboard2.lowStock') }}</span>
              </div>
              <span class="text-sm font-black font-mono text-amber-700">{{ inventoryAlerts.lowStockCount }}</span>
            </button>

            <button 
              @click="router.push({ path: '/inventory', query: { status: 'Out of Stock' } })"
              class="w-full p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 hover:border-rose-500/40 flex items-center justify-between text-left transition-all cursor-pointer group"
            >
              <div class="flex items-center gap-2.5">
                <AlertCircle class="w-4 h-4 text-rose-600 group-hover:scale-110 transition-transform" />
                <span class="text-xs font-bold text-rose-900">{{ $t('dashboard2.outOfStock') }}</span>
              </div>
              <span class="text-sm font-black font-mono text-rose-700">{{ inventoryAlerts.outOfStockCount }}</span>
            </button>

            <button 
              @click="router.push({ path: '/inventory', query: { status: 'Soon to expire' } })"
              class="w-full p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 hover:border-purple-500/40 flex items-center justify-between text-left transition-all cursor-pointer group"
            >
              <div class="flex items-center gap-2.5">
                <Clock class="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" />
                <span class="text-xs font-bold text-purple-900">{{ $t('dashboard2.expiringSoon') }}</span>
              </div>
              <span class="text-sm font-black font-mono text-purple-700">{{ inventoryAlerts.soonToExpireCount }}</span>
            </button>
          </div>

          <button 
            @click="router.push('/inventory')"
            class="mt-3 w-full py-2 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-bold text-xs font-mono border border-outline-variant/60 transition-colors text-center cursor-pointer"
          >
            {{ $t('dashboard.receiveStock') }}
          </button>
        </div>
      </div>
    </div>

    <!-- ========================================== -->
    <!-- MODALS: QUICK FINANCIAL ACTIONS            -->
    <!-- ========================================== -->

    <!-- Modal A: Quick Customer Payment -->
    <div v-if="paymentModalOpen" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div class="bg-surface-container-lowest rounded-2xl max-w-md w-full border border-outline-variant shadow-2xl p-6 animate-fade-up">
        <div class="flex items-center justify-between pb-3 border-b border-outline-variant/40 mb-4">
          <h3 class="text-base font-black text-on-surface">{{ $t('dashboard2.recordPaymentTitle') }}</h3>
          <button @click="paymentModalOpen = false" class="text-on-surface-variant hover:text-on-surface cursor-pointer">
            <X class="w-5 h-5" />
          </button>
        </div>

        <form @submit.prevent="submitCustomerPayment" class="space-y-4">
          <div>
            <label class="text-xs font-bold font-mono text-on-surface-variant block mb-1">{{ $t('dashboard2.customerLabel') }}</label>
            <select 
              v-model="paymentForm.customerId" 
              required
              class="w-full bg-surface-container-low border border-outline-variant rounded-xl p-2.5 text-xs font-bold text-on-surface outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="" disabled>Select a customer</option>
              <option v-for="c in customersList" :key="c.id" :value="c.id">
                {{ c.displayName || c.firstName }} (Balance: {{ formatCurrency(c.outstandingBalance || 0, currency) }})
              </option>
            </select>
          </div>

          <div>
            <label class="text-xs font-bold font-mono text-on-surface-variant block mb-1">
              {{ $t('dashboard2.amountLabel', { currency: currency }) }}
            </label>
            <input 
              v-model.number="paymentForm.amount"
              type="number"
              min="1"
              step="any"
              required
              class="w-full bg-surface-container-low border border-outline-variant rounded-xl p-2.5 text-xs font-mono font-bold text-on-surface outline-none focus:ring-1 focus:ring-primary"
              placeholder="0.00"
            />
          </div>

          <div>
            <label class="text-xs font-bold font-mono text-on-surface-variant block mb-1">{{ $t('dashboard2.paymentMethodLabel') }}</label>
            <select 
              v-model="paymentForm.paymentMethod"
              required
              class="w-full bg-surface-container-low border border-outline-variant rounded-xl p-2.5 text-xs font-bold text-on-surface outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="CASH">Cash</option>
              <option value="MOBILE_MONEY">M-Pesa / Mobile Money</option>
              <option value="CARD">Bank Card POS</option>
              <option value="BANK_TRANSFER">Bank Transfer</option>
            </select>
          </div>

          <div>
            <label class="text-xs font-bold font-mono text-on-surface-variant block mb-1">{{ $t('dashboard2.referenceLabel') }}</label>
            <input 
              v-model="paymentForm.referenceNumber"
              type="text"
              class="w-full bg-surface-container-low border border-outline-variant rounded-xl p-2.5 text-xs font-mono text-on-surface outline-none focus:ring-1 focus:ring-primary"
              placeholder="e.g. MPESA-TXN-12345"
            />
          </div>

          <div class="flex items-center justify-end gap-2.5 pt-3 border-t border-outline-variant/40">
            <button 
              type="button" 
              @click="paymentModalOpen = false"
              class="px-4 py-2 rounded-xl bg-surface-container-high text-on-surface font-bold text-xs cursor-pointer"
            >
              {{ $t('dashboard2.cancel') }}
            </button>
            <button 
              type="submit"
              :disabled="isSubmittingPayment"
              class="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <Coins class="w-3.5 h-3.5" />
              <span>{{ $t('dashboard2.savePayment') }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal B: Quick Cash Movement -->
    <div v-if="movementModalOpen" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div class="bg-surface-container-lowest rounded-2xl max-w-md w-full border border-outline-variant shadow-2xl p-6 animate-fade-up">
        <div class="flex items-center justify-between pb-3 border-b border-outline-variant/40 mb-4">
          <h3 class="text-base font-black text-on-surface">{{ $t('dashboard2.recordCashMovementTitle') }}</h3>
          <button @click="movementModalOpen = false" class="text-on-surface-variant hover:text-on-surface cursor-pointer">
            <X class="w-5 h-5" />
          </button>
        </div>

        <form @submit.prevent="submitCashMovement" class="space-y-4">
          <div>
            <label class="text-xs font-bold font-mono text-on-surface-variant block mb-1">{{ $t('dashboard2.movementTypeLabel') }}</label>
            <div class="grid grid-cols-3 gap-2">
              <button 
                type="button"
                @click="movementForm.type = 'PAY_IN'"
                class="p-2.5 rounded-xl border text-xs font-mono font-bold text-center cursor-pointer transition-all"
                :class="movementForm.type === 'PAY_IN' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-surface-container-low border-outline-variant/60 text-on-surface'"
              >
                PAY IN
              </button>
              <button 
                type="button"
                @click="movementForm.type = 'PAY_OUT'"
                class="p-2.5 rounded-xl border text-xs font-mono font-bold text-center cursor-pointer transition-all"
                :class="movementForm.type === 'PAY_OUT' ? 'bg-rose-600 text-white border-rose-600' : 'bg-surface-container-low border-outline-variant/60 text-on-surface'"
              >
                PAY OUT
              </button>
              <button 
                type="button"
                @click="movementForm.type = 'CASH_DROP'"
                class="p-2.5 rounded-xl border text-xs font-mono font-bold text-center cursor-pointer transition-all"
                :class="movementForm.type === 'CASH_DROP' ? 'bg-purple-600 text-white border-purple-600' : 'bg-surface-container-low border-outline-variant/60 text-on-surface'"
              >
                SAFE DROP
              </button>
            </div>
          </div>

          <div>
            <label class="text-xs font-bold font-mono text-on-surface-variant block mb-1">
              {{ $t('dashboard2.amountLabel', { currency: currency }) }}
            </label>
            <input 
              v-model.number="movementForm.amount"
              type="number"
              min="1"
              step="any"
              required
              class="w-full bg-surface-container-low border border-outline-variant rounded-xl p-2.5 text-xs font-mono font-bold text-on-surface outline-none focus:ring-1 focus:ring-primary"
              placeholder="0.00"
            />
          </div>

          <div>
            <label class="text-xs font-bold font-mono text-on-surface-variant block mb-1">{{ $t('dashboard2.reasonLabel') }}</label>
            <input 
              v-model="movementForm.reason"
              type="text"
              required
              class="w-full bg-surface-container-low border border-outline-variant rounded-xl p-2.5 text-xs text-on-surface outline-none focus:ring-1 focus:ring-primary"
              placeholder="e.g. Branch cleaning supplies or safe skim"
            />
          </div>

          <div class="flex items-center justify-end gap-2.5 pt-3 border-t border-outline-variant/40">
            <button 
              type="button" 
              @click="movementModalOpen = false"
              class="px-4 py-2 rounded-xl bg-surface-container-high text-on-surface font-bold text-xs cursor-pointer"
            >
              {{ $t('dashboard2.cancel') }}
            </button>
            <button 
              type="submit"
              :disabled="isSubmittingMovement"
              class="px-5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-black text-xs shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <ArrowLeftRight class="w-3.5 h-3.5" />
              <span>{{ $t('dashboard2.saveMovement') }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ========================================== -->
    <!-- MODAL C: RISK DEBTORS INSPECTION MODAL     -->
    <!-- ========================================== -->
    <div v-if="showRiskDebtorsModal" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div class="bg-surface-container-lowest rounded-2xl max-w-2xl w-full border border-outline-variant shadow-2xl p-6 animate-fade-up max-h-[85vh] flex flex-col">
        <div class="flex items-center justify-between pb-3 border-b border-outline-variant/40 mb-4 shrink-0">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-600 flex items-center justify-center">
              <AlertOctagon class="w-4 h-4" />
            </div>
            <div>
              <h3 class="text-base font-black text-on-surface">{{ $t('dashboard2.riskDebtorsTableTitle') }}</h3>
              <p class="text-xs text-on-surface-variant">
                Total at Risk: <strong class="text-rose-600 font-mono font-bold">{{ formatCurrency(displayedRiskAmount, currency) }}</strong> across {{ displayedRiskDebtors.length }} customer account{{ displayedRiskDebtors.length === 1 ? '' : 's' }}
              </p>
            </div>
          </div>
          <button @click="showRiskDebtorsModal = false" class="text-on-surface-variant hover:text-on-surface cursor-pointer p-1 rounded-lg">
            <X class="w-5 h-5" />
          </button>
        </div>

        <div class="overflow-y-auto flex-1 pr-1 space-y-2">
          <template v-if="displayedRiskDebtors.length > 0">
            <table class="w-full text-left text-xs font-mono border-collapse">
              <thead>
                <tr class="border-b border-outline-variant/40 text-on-surface-variant font-bold text-[11px] uppercase tracking-wider">
                  <th class="pb-2">{{ $t('dashboard2.customerCol') }}</th>
                  <th class="pb-2 text-right">{{ $t('dashboard2.amountOwedCol') }}</th>
                  <th class="pb-2 text-center">{{ $t('dashboard2.daysOverdueCol') }}</th>
                  <th class="pb-2 text-right">{{ $t('dashboard2.actionCol') }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-outline-variant/20">
                <tr v-for="debtor in displayedRiskDebtors" :key="debtor.customerId" class="hover:bg-surface-container-low transition-colors">
                  <td class="py-3 font-sans">
                    <div class="font-black text-on-surface text-xs">{{ debtor.customerName }}</div>
                    <div class="text-[11px] font-mono text-on-surface-variant">{{ debtor.phone || 'No phone' }} • Due: {{ debtor.oldestDueDate || 'Overdue' }}</div>
                  </td>
                  <td class="py-3 text-right font-mono font-black text-rose-600">
                    {{ formatCurrency(debtor.amount, currency) }}
                  </td>
                  <td class="py-3 text-center">
                    <span 
                      class="px-2 py-0.5 rounded-full text-[10px] font-mono font-black uppercase"
                      :class="debtor.daysOverdue >= 60 ? 'bg-rose-600 text-white' : 'bg-amber-500/20 text-amber-800'"
                    >
                      {{ debtor.daysOverdue }} days
                    </span>
                  </td>
                  <td class="py-3 text-right">
                    <button 
                      @click="showRiskDebtorsModal = false; openCollectForCustomer({ id: debtor.customerId, name: debtor.customerName, outstandingBalance: debtor.amount })"
                      class="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold font-mono shadow-xs cursor-pointer transition-colors"
                    >
                      {{ $t('dashboard2.collectNow') }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </template>
          <template v-else>
            <div class="py-12 text-center text-xs text-on-surface-variant font-mono">
              <CheckCircle2 class="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <span>{{ $t('dashboard2.noRiskDebtors') }}</span>
            </div>
          </template>
        </div>

        <div class="flex items-center justify-end pt-4 border-t border-outline-variant/40 mt-4 shrink-0">
          <button 
            @click="showRiskDebtorsModal = false"
            class="px-4 py-2 rounded-xl bg-surface-container-high text-on-surface font-bold text-xs cursor-pointer"
          >
            {{ $t('dashboard2.cancel') }}
          </button>
        </div>
      </div>
    </div>

    <!-- ========================================== -->
    <!-- MODAL D: DEAD STOCK PRODUCTS INSPECTOR     -->
    <!-- ========================================== -->
    <div v-if="showDeadStockModal" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div class="bg-surface-container-lowest rounded-2xl max-w-3xl w-full border border-outline-variant shadow-2xl p-6 animate-fade-up max-h-[85vh] flex flex-col">
        <div class="flex items-center justify-between pb-3 border-b border-outline-variant/40 mb-4 shrink-0">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-600 flex items-center justify-center">
              <Boxes class="w-4 h-4" />
            </div>
            <div>
              <h3 class="text-base font-black text-on-surface">{{ $t('dashboard2.deadStockModalTitle') }}</h3>
              <p class="text-xs text-on-surface-variant">Products with zero sales activity in the last 60+ days</p>
            </div>
          </div>
          <button @click="showDeadStockModal = false" class="text-on-surface-variant hover:text-on-surface cursor-pointer p-1 rounded-lg">
            <X class="w-5 h-5" />
          </button>
        </div>

        <div class="overflow-y-auto flex-1 pr-1 space-y-2">
          <template v-if="deadStockProducts.length > 0">
            <table class="w-full text-left text-xs font-mono border-collapse">
              <thead>
                <tr class="border-b border-outline-variant/40 text-on-surface-variant font-bold text-[11px] uppercase tracking-wider">
                  <th class="pb-2">{{ $t('dashboard2.productCol') }}</th>
                  <th class="pb-2 text-center">{{ $t('dashboard2.qtyCol') }}</th>
                  <th class="pb-2 text-right">{{ $t('dashboard2.costCol') }}</th>
                  <th class="pb-2 text-right">{{ $t('dashboard2.capitalTiedCol') }}</th>
                  <th class="pb-2 text-center">{{ $t('dashboard2.dormantCol') }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-outline-variant/20">
                <tr v-for="item in deadStockProducts" :key="item.id" class="hover:bg-surface-container-low transition-colors">
                  <td class="py-3 font-sans">
                    <div class="font-black text-on-surface text-xs">{{ item.name }}</div>
                    <div class="text-[11px] font-mono text-on-surface-variant">{{ item.category || 'General' }} • SKU: {{ item.sku || 'N/A' }}</div>
                  </td>
                  <td class="py-3 text-center font-mono font-bold text-on-surface">
                    {{ item.quantity }}
                  </td>
                  <td class="py-3 text-right font-mono text-on-surface-variant">
                    {{ formatCurrency(item.costPrice, currency) }}
                  </td>
                  <td class="py-3 text-right font-mono font-black text-rose-600">
                    {{ formatCurrency(item.capitalTiedUp, currency) }}
                  </td>
                  <td class="py-3 text-center">
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-mono font-black bg-rose-500/15 text-rose-700">
                      {{ item.daysDormant }}+ days
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </template>
          <template v-else>
            <div class="py-12 text-center text-xs text-on-surface-variant font-mono">
              <CheckCircle2 class="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <span>{{ $t('dashboard2.noDeadStock') }}</span>
            </div>
          </template>
        </div>

        <div class="flex items-center justify-between pt-4 border-t border-outline-variant/40 mt-4 shrink-0">
          <div class="text-xs font-mono text-on-surface-variant">
            Total Dead Capital: <strong class="text-rose-600 font-black">{{ formatCurrency(deadStock.capital, currency) }}</strong>
          </div>
          <div class="flex items-center gap-2">
            <button 
              @click="showDeadStockModal = false; router.push('/inventory')"
              class="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-black text-xs font-mono shadow-xs cursor-pointer"
            >
              Open Inventory Management
            </button>
            <button 
              @click="showDeadStockModal = false"
              class="px-4 py-2 rounded-xl bg-surface-container-high text-on-surface font-bold text-xs cursor-pointer"
            >
              {{ $t('dashboard2.cancel') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ========================================== -->
    <!-- MODAL: CASHIER TILL DISCREPANCIES AUDIT    -->
    <!-- ========================================== -->
    <div v-if="showTillAuditModal" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div class="bg-surface-container-lowest rounded-2xl max-w-2xl w-full p-6 border border-outline-variant/60 shadow-xl max-h-[90vh] flex flex-col">
        <div class="flex justify-between items-center pb-4 border-b border-outline-variant/40 shrink-0">
          <div class="flex items-center gap-2.5">
            <div class="p-2 rounded-xl bg-amber-500/10 text-amber-600">
              <Banknote class="w-5 h-5" />
            </div>
            <div>
              <h3 class="text-base font-black text-on-surface">{{ $t('dashboard2.tillAuditModalTitle') }}</h3>
              <p class="text-xs text-on-surface-variant font-medium">{{ $t('dashboard2.tillAuditSummary') }}</p>
            </div>
          </div>
          <button @click="showTillAuditModal = false" class="text-on-surface-variant hover:text-on-surface cursor-pointer p-1 rounded-lg">
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Metric Summary Chips -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-4 shrink-0">
          <div class="bg-surface-container-low p-3 rounded-xl border border-outline-variant/30">
            <div class="text-[10px] font-mono uppercase text-on-surface-variant font-bold">{{ $t('dashboard2.netTillDiscrepancy') }}</div>
            <div 
              class="text-base font-mono font-black mt-0.5"
              :class="tillDiscrepancy < 0 ? 'text-rose-600' : tillDiscrepancy > 0 ? 'text-amber-600' : 'text-emerald-600'"
            >
              {{ tillDiscrepancy < 0 ? '-' : tillDiscrepancy > 0 ? '+' : '' }}{{ formatCurrency(Math.abs(tillDiscrepancy), currency) }}
            </div>
          </div>
          <div class="bg-surface-container-low p-3 rounded-xl border border-outline-variant/30">
            <div class="text-[10px] font-mono uppercase text-on-surface-variant font-bold">{{ $t('dashboard2.totalShortages') }}</div>
            <div class="text-base font-mono font-black text-rose-600 mt-0.5">
              -{{ formatCurrency(tillTotalShortages, currency) }}
            </div>
          </div>
          <div class="bg-surface-container-low p-3 rounded-xl border border-outline-variant/30">
            <div class="text-[10px] font-mono uppercase text-on-surface-variant font-bold">{{ $t('dashboard2.totalOverages') }}</div>
            <div class="text-base font-mono font-black text-amber-600 mt-0.5">
              +{{ formatCurrency(tillTotalOverages, currency) }}
            </div>
          </div>
          <div class="bg-surface-container-low p-3 rounded-xl border border-outline-variant/30">
            <div class="text-[10px] font-mono uppercase text-on-surface-variant font-bold">{{ $t('dashboard2.closedShiftsCount', { count: closedShiftsCount }) }}</div>
            <div class="text-base font-mono font-black text-on-surface mt-0.5">
              {{ closedShiftsCount }}
            </div>
          </div>
        </div>

        <!-- Closed Shifts Table -->
        <div class="overflow-y-auto flex-1 min-h-0 border border-outline-variant/40 rounded-xl">
          <table class="w-full text-left text-xs font-mono">
            <thead class="bg-surface-container-low text-[10px] uppercase text-on-surface-variant font-bold border-b border-outline-variant/40 sticky top-0">
              <tr>
                <th class="p-3">Cashier & Terminal</th>
                <th class="p-3 text-right">{{ $t('dashboard2.expectedCash') }}</th>
                <th class="p-3 text-right">{{ $t('dashboard2.actualCash') }}</th>
                <th class="p-3 text-right">{{ $t('dashboard2.discrepancy') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-outline-variant/30 text-on-surface">
              <tr v-if="closedShiftsList.length === 0">
                <td colspan="4" class="p-6 text-center text-on-surface-variant">
                  {{ $t('dashboard2.noClosedShifts') }}
                </td>
              </tr>
              <tr v-for="shift in closedShiftsList" :key="shift.shiftId" class="hover:bg-surface-container-low/50">
                <td class="p-3">
                  <div class="font-bold text-on-surface">{{ shift.cashierName }}</div>
                  <div class="text-[10px] text-outline flex items-center gap-1 mt-0.5">
                    <span>{{ shift.terminalId }}</span>
                    <span v-if="shift.closedAt">• {{ formatTime(shift.closedAt) }}</span>
                  </div>
                  <div v-if="shift.notes" class="text-[10px] text-on-surface-variant italic mt-1 bg-surface-container-high/40 p-1 rounded">
                    "{{ shift.notes }}"
                  </div>
                </td>
                <td class="p-3 text-right font-medium text-on-surface-variant">
                  {{ formatCurrency(shift.expectedCash, currency) }}
                </td>
                <td class="p-3 text-right font-medium text-on-surface">
                  {{ formatCurrency(shift.actualCash, currency) }}
                </td>
                <td class="p-3 text-right">
                  <span 
                    class="px-2 py-0.5 rounded font-black text-[10px]"
                    :class="shift.discrepancy < 0 
                      ? 'bg-rose-500/10 text-rose-600' 
                      : shift.discrepancy > 0 
                        ? 'bg-amber-500/10 text-amber-600' 
                        : 'bg-emerald-500/10 text-emerald-600'"
                  >
                    {{ shift.discrepancy < 0 ? '-' : shift.discrepancy > 0 ? '+' : '' }}{{ formatCurrency(Math.abs(shift.discrepancy), currency) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="flex justify-end pt-4 border-t border-outline-variant/40 mt-4 shrink-0">
          <button 
            @click="showTillAuditModal = false"
            class="px-4 py-2 rounded-xl bg-surface-container-high hover:bg-surface-container text-on-surface font-bold text-xs cursor-pointer"
          >
            {{ $t('dashboard2.cancel') }}
          </button>
        </div>
      </div>
    </div>

    <!-- ========================================== -->
    <!-- MODAL: PAY SUPPLIER OUTSTANDING BALANCE    -->
    <!-- ========================================== -->
    <Modal
      v-if="selectedSupplierForPay"
      :isOpen="showPaySupplierModal"
      :onClose="() => showPaySupplierModal = false"
      @close="showPaySupplierModal = false"
      :title="$t('suppliers.payModalTitle')"
      :subtitle="$t('suppliers.payModalSubtitle', { name: selectedSupplierForPay.name })"
    >
      <form id="pay-supplier-dashboard-form" @submit.prevent="handlePaySupplier" class="flex flex-col gap-4">
        <!-- Supplier Selector if multiple creditors have balance -->
        <div v-if="creditorSuppliers.length > 1" class="flex flex-col gap-1.5">
          <label class="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
            {{ $t('suppliers.supplierNameRequired') }}
          </label>
          <select
            v-model="selectedSupplierIdForPay"
            @change="onSupplierSelectChange"
            class="w-full h-11 px-3.5 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:border-primary text-xs font-bold text-on-surface cursor-pointer"
          >
            <option v-for="sup in creditorSuppliers" :key="sup.id" :value="sup.id">
              {{ sup.name }} — {{ currency }} {{ Number(sup.balance).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
            </option>
          </select>
        </div>

        <!-- Outstanding Balance Display -->
        <div class="p-4 rounded-xl border border-outline-variant/60 bg-surface-container-low/50">
          <div class="flex items-center justify-between">
            <p class="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">{{ $t('suppliers.currentOutstandingBalance') }}</p>
            <span v-if="selectedSupplierForPay.category" class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-700 font-bold">
              {{ selectedSupplierForPay.category }}
            </span>
          </div>
          <p class="text-xl font-bold font-mono text-error mt-1">
            {{ currency }} {{ Number(selectedSupplierForPay.balance).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
          </p>
        </div>

        <!-- Payment Amount input -->
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{{ $t('suppliers.paymentAmountRequired', { currency }) }}</label>
          <div class="relative">
            <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold font-mono text-on-surface-variant/50">{{ currency }}</span>
            <input
              type="number"
              step="0.01"
              min="0.01"
              :max="selectedSupplierForPay.balance"
              required
              v-model="supplierPaymentAmount"
              placeholder="0.00"
              class="w-full h-11 pl-14 pr-4 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:border-primary text-sm font-mono text-on-surface"
            />
          </div>
          <div class="flex gap-2 mt-1">
            <button
              type="button"
              @click="supplierPaymentAmount = String(selectedSupplierForPay.balance)"
              class="px-3 py-1 rounded-lg border border-outline-variant hover:bg-surface-container-high text-xs font-bold cursor-pointer transition-all bg-white text-on-surface"
            >
              {{ $t('suppliers.payFullBalance') }}
            </button>
            <button
              type="button"
              @click="supplierPaymentAmount = String((selectedSupplierForPay.balance / 2).toFixed(2))"
              class="px-3 py-1 rounded-lg border border-outline-variant hover:bg-surface-container-high text-xs font-bold cursor-pointer transition-all bg-white text-on-surface"
            >
              {{ $t('suppliers.payHalf') }}
            </button>
          </div>
        </div>
      </form>

      <template #footer>
        <button
          type="button"
          @click="showPaySupplierModal = false"
          class="h-11 px-5 rounded-xl border border-outline-variant text-on-surface hover:bg-surface-container-high font-bold text-sm cursor-pointer transition-all active:scale-[0.98] bg-white"
        >
          {{ $t('dashboard2.cancel') }}
        </button>
        <button
          type="submit"
          form="pay-supplier-dashboard-form"
          :disabled="isSubmittingSupplierPay"
          class="h-11 px-6 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl cursor-pointer transition-all active:scale-[0.98] shadow-sm border-0 flex items-center gap-2"
        >
          <RefreshCw v-if="isSubmittingSupplierPay" class="w-4 h-4 animate-spin" />
          <span>{{ $t('suppliers.recordPayment') }}</span>
        </button>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import {
  Activity,
  Banknote,
  Coins,
  ArrowLeftRight,
  ShoppingCart,
  Users,
  Truck,
  ShoppingBag,
  ShieldAlert,
  AlertTriangle,
  AlertCircle,
  Clock,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  X,
  LayoutDashboard,
  HandCoins,
  Boxes,
  Sparkles,
  AlertOctagon,
  Percent,
  TrendingUp,
  ShieldCheck,
  Hourglass
} from 'lucide-vue-next';
import { useAppViewModel } from '../viewmodels/useAppViewModel';
import { formatCurrency } from '../models/mockData';
import { financeService } from '../services/financeService';
import { customerService } from '../services/customerService';
import { showToast } from '../services/toastService';
import { t, currentLocale } from '../i18n';
import Modal from '../components/common/Modal.vue';
import { api } from '../services/api';
import type {
  CashflowOverview,
  Customer,
  Supplier,
  AgingBucket,
  StockVelocityBucket,
  RiskDebtorItem,
  DeadStockProductItem,
  ShiftAuditItem,
  TillDiscrepancyOverview
} from '../models/types';

const vm = useAppViewModel();
const router = useRouter();

const activeMainTab = ref<'summary' | 'collection' | 'stock'>('summary');
const showRiskDebtorsModal = ref(false);
const showDeadStockModal = ref(false);
const showTillAuditModal = ref(false);
const showPaySupplierModal = ref(false);
const selectedSupplierForPay = ref<Supplier | null>(null);
const selectedSupplierIdForPay = ref<string>('');
const supplierPaymentAmount = ref<string>('');
const isSubmittingSupplierPay = ref(false);

const selectedPeriod = ref('today');
const activeStream = ref<'ALL' | 'SALES' | 'COLLECTIONS' | 'EXPENSES'>('ALL');
const isLoading = ref(false);
const cashflowData = ref<CashflowOverview | null>(null);

const customersList = ref<Customer[]>([]);
const paymentModalOpen = ref(false);
const isSubmittingPayment = ref(false);
const paymentForm = ref({
  customerId: '',
  amount: 0,
  paymentMethod: 'CASH' as any,
  referenceNumber: '',
  notes: ''
});

const movementModalOpen = ref(false);
const isSubmittingMovement = ref(false);
const movementForm = ref({
  type: 'PAY_OUT',
  amount: 0,
  reason: ''
});

const periods = [
  { key: 'today', label: 'Today' },
  { key: '7days', label: '7 Days' },
  { key: 'month', label: 'This Month' },
  { key: 'year', label: 'This Year' }
];

const currency = computed(() => vm.settings.value.currency || 'TZS');
const branchDisplayName = computed(() => {
  return localStorage.getItem('branchName') || 'Store Branch';
});

const setPeriod = (period: string) => {
  selectedPeriod.value = period;
  fetchData();
};

const selectedPeriodLabel = computed(() => {
  const p = periods.find(item => item.key === selectedPeriod.value);
  return p ? p.label : 'Period';
});

onMounted(() => {
  vm.fetchSettings();
  fetchData();
  fetchCustomersForDropdown();
  vm.fetchSuppliers();
});

watch(() => vm.activeBranchId.value, () => {
  fetchData();
  fetchCustomersForDropdown();
  vm.fetchSuppliers();
});

const fetchData = async () => {
  const branchId = vm.activeBranchId.value || localStorage.getItem('branchId');
  if (!branchId || branchId === 'null' || branchId === 'undefined') {
    return;
  }
  isLoading.value = true;
  try {
    const res = await financeService.getCashflowOverview(branchId, selectedPeriod.value);
    if (res) {
      cashflowData.value = res;
    }
  } catch (err) {
    console.error('Failed to load cashflow overview:', err);
  } finally {
    isLoading.value = false;
  }
};

const fetchCustomersForDropdown = async () => {
  const branchId = vm.activeBranchId.value || localStorage.getItem('branchId') || undefined;
  try {
    const res = await customerService.getAllCustomers({ branchId, size: 100 });
    if (res && res.content) {
      customersList.value = res.content;
    }
  } catch (e) {
    console.warn('Failed to load customers for modal:', e);
  }
};

// Computed Financial Metrics
const netCashflowAmount = computed(() => Number(cashflowData.value?.netCashflow) || 0);
const isSurplus = computed(() => (cashflowData.value?.netCashflowStatus || 'SURPLUS') === 'SURPLUS');
const totalPeriodSales = computed(() => Number(cashflowData.value?.sales?.totalSales) || 0);
const grossProfitAmount = computed(() => Number(cashflowData.value?.sales?.grossProfit) || 0);
const grossMarginPercent = computed(() => Number(cashflowData.value?.sales?.grossMarginPercent) || 0);
const cogsAmount = computed(() => Number(cashflowData.value?.sales?.cogs) || Math.max(0, totalPeriodSales.value - grossProfitAmount.value));
const transactionsCount = computed(() => Number(cashflowData.value?.sales?.transactionsCount) || 0);
const avgTicketAmount = computed(() => Number(cashflowData.value?.sales?.avgTicket) || (transactionsCount.value > 0 ? Math.round(totalPeriodSales.value / transactionsCount.value) : 0));
const cashOnHandAmount = computed(() => Number(cashflowData.value?.cashOnHand) || 0);
const activeRegistersCount = computed(() => Number(cashflowData.value?.activeShiftsCount) || 0);

// Till Discrepancies & Shift Audit
const tillOverview = computed(() => cashflowData.value?.tillDiscrepancies);
const tillDiscrepancy = computed(() => Number(tillOverview.value?.netDiscrepancy) || 0);
const tillTotalShortages = computed(() => Number(tillOverview.value?.totalShortages) || 0);
const tillTotalOverages = computed(() => Number(tillOverview.value?.totalOverages) || 0);
const closedShiftsCount = computed(() => Number(tillOverview.value?.closedShiftsCount) || 0);
const closedShiftsList = computed(() => tillOverview.value?.recentShifts || []);

const debtorsTotal = computed(() => Number(cashflowData.value?.debtors?.totalOutstanding) || 0);
const debtorsCollected = computed(() => Number(cashflowData.value?.debtors?.collectedInPeriod) || 0);
const overdueCount = computed(() => Number(cashflowData.value?.debtors?.overdueCount) || 0);
const topDebtors = computed(() => cashflowData.value?.debtors?.topDebtors || []);

const creditorsTotal = computed(() => Number(cashflowData.value?.creditors?.totalPayables) || 0);
const purchasesTotal = computed(() => Number(cashflowData.value?.creditors?.purchasesInPeriod) || 0);
const tradeGapAmount = computed(() => Number(cashflowData.value?.creditors?.netTradeGap) || 0);
const topCreditors = computed(() => cashflowData.value?.creditors?.topCreditors || []);

const payInAmount = computed(() => Number(cashflowData.value?.cashMovements?.payIn) || 0);
const payOutAmount = computed(() => Number(cashflowData.value?.cashMovements?.payOut) || 0);
const cashDropAmount = computed(() => Number(cashflowData.value?.cashMovements?.cashDrop) || 0);

// Collection Intelligence & Debt Schedule
const collectionIntel = computed(() => cashflowData.value?.collection);
const collectionRate = computed(() => {
  if (collectionIntel.value?.collectionRate !== undefined) {
    return Number(collectionIntel.value.collectionRate);
  }
  const collected = debtorsCollected.value;
  const due = debtorsTotal.value + collected;
  return due > 0 ? Math.round((collected / due) * 100) : 100;
});
const amountCollected = computed(() => {
  return collectionIntel.value?.amountCollected !== undefined 
    ? Number(collectionIntel.value.amountCollected) 
    : debtorsCollected.value;
});
const amountDue = computed(() => {
  return collectionIntel.value?.amountDue !== undefined 
    ? Number(collectionIntel.value.amountDue) 
    : (debtorsTotal.value + debtorsCollected.value);
});
const moneyToCollect = computed(() => {
  const intel = collectionIntel.value?.moneyToCollect;
  const masterTotal = debtorsTotal.value;
  return {
    total: masterTotal > 0 ? masterTotal : (Number(intel?.total) || 0),
    dueToday: Number(intel?.dueToday) || 0,
    dueThisWeek: Number(intel?.dueThisWeek) || 0,
    overdue: intel?.overdue !== undefined ? Math.min(Number(intel.overdue), masterTotal > 0 ? masterTotal : Number(intel.overdue)) : masterTotal,
    debtorsCount: intel?.debtorsCount || topDebtors.value.length
  };
});
const moneyOwedSuppliers = computed(() => {
  return collectionIntel.value?.moneyOwedSuppliers || {
    total: creditorsTotal.value,
    dueToday: 0,
    dueThisWeek: 0,
    overdue: creditorsTotal.value,
    creditorsCount: topCreditors.value.length,
    topCreditors: topCreditors.value
  };
});

const debtAging = computed<{
  current: AgingBucket;
  days8to30: AgingBucket;
  days31to60: AgingBucket;
  days60plus: AgingBucket;
  riskAmount: number;
  highRiskAmount: number;
}>(() => {
  const raw = collectionIntel.value?.debtAging;
  const getBucket = (b: any): AgingBucket => {
    if (!b) return { amount: 0, count: 0 };
    if (typeof b === 'number') return { amount: b, count: 0 };
    return {
      amount: Number(b.amount) || 0,
      count: Number(b.count) || 0
    };
  };
  return {
    current: getBucket(raw?.current),
    days8to30: getBucket(raw?.days8to30),
    days31to60: getBucket(raw?.days31to60),
    days60plus: getBucket(raw?.days60plus),
    riskAmount: Number(raw?.riskAmount) || 0,
    highRiskAmount: Number(raw?.highRiskAmount) || 0
  };
});
const riskDebtors = computed<RiskDebtorItem[]>(() => collectionIntel.value?.riskDebtors || []);
const riskAmount = computed(() => Number(debtAging.value.riskAmount) || 0);
const highRiskAmount = computed(() => Number(debtAging.value.highRiskAmount) || 0);

// Comprehensive reconciliation for risk debtors:
// 1. If backend provided riskDebtors, use them.
// 2. If backend riskDebtors is empty but topDebtors has customers with outstanding balances, fallback to them.
const displayedRiskDebtors = computed<RiskDebtorItem[]>(() => {
  if (riskDebtors.value.length > 0) {
    return riskDebtors.value;
  }
  if (topDebtors.value && topDebtors.value.length > 0) {
    return topDebtors.value
      .filter((td: any) => (Number(td.outstandingBalance) || 0) > 0)
      .map((td: any) => ({
        customerId: td.id,
        customerName: td.name || 'Customer',
        phone: td.phone || '',
        amount: Number(td.outstandingBalance) || 0,
        daysOverdue: 30,
        oldestDueDate: 'Overdue'
      }));
  }
  return [];
});

// Mathematically coupled risk amount:
// If there are NO debtors to collect, the risk amount MUST be 0.
const displayedRiskAmount = computed(() => {
  if (displayedRiskDebtors.value.length === 0) {
    return 0;
  }
  if (highRiskAmount.value > 0) return highRiskAmount.value;
  if (riskAmount.value > 0) return riskAmount.value;
  if (moneyToCollect.value?.overdue && Number(moneyToCollect.value.overdue) > 0) {
    return Number(moneyToCollect.value.overdue);
  }
  return displayedRiskDebtors.value.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
});

const hasRiskMoney = computed(() => {
  return displayedRiskDebtors.value.length > 0 && displayedRiskAmount.value > 0;
});

// Stock & Capital Valuation Intelligence
const inventoryIntel = computed(() => cashflowData.value?.inventoryValuation);
const inventoryTotalCapital = computed(() => Number(inventoryIntel.value?.totalCapital) || 0);
const inventoryPotentialRevenue = computed(() => Number(inventoryIntel.value?.potentialRevenue) || 0);
const inventoryUnrealizedProfit = computed(() => Number(inventoryIntel.value?.unrealizedProfit) || 0);
const fastMovingStock = computed<StockVelocityBucket>(() => inventoryIntel.value?.fastMoving || { capital: 0, count: 0, percent: 0 });
const slowMovingStock = computed<StockVelocityBucket>(() => inventoryIntel.value?.slowMoving || { capital: 0, count: 0, percent: 0 });
const deadStock = computed<StockVelocityBucket>(() => inventoryIntel.value?.deadStock || { capital: 0, count: 0, percent: 0 });
const deadStockProducts = computed<DeadStockProductItem[]>(() => inventoryIntel.value?.deadStockProducts || []);
const stockRunwayDays = computed(() => Number(inventoryIntel.value?.stockRunwayDays) || 0);
const stockDailyCogs = computed(() => Number(inventoryIntel.value?.dailyCogs) || 0);
const stockRunwayStatus = computed(() => inventoryIntel.value?.runwayStatus || 'STAGNANT');

interface FormattedRecommendation {
  type: 'DISCOUNT_DORMANT' | 'STOP_REORDER' | 'REPLENISH_FAST' | 'GENERAL';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  description: string;
  count: number;
  actionLabel: string;
}

const inventoryRecommendations = computed<FormattedRecommendation[]>(() => {
  const list = inventoryIntel.value?.recommendations || [];
  if (list.length === 0) {
    return [
      {
        type: 'DISCOUNT_DORMANT',
        priority: 'HIGH',
        title: 'Liquidate Dormant Stock',
        description: 'Consider discounting dormant products by 15-20% to liquidate trapped capital.',
        count: deadStock.value.count,
        actionLabel: 'Inspect Dormant Items'
      },
      {
        type: 'STOP_REORDER',
        priority: 'HIGH',
        title: 'Halt Inactive Reorders',
        description: 'Stop reordering products that have recorded zero sales over the past 60 days.',
        count: deadStock.value.count,
        actionLabel: 'View Inactive Products'
      },
      {
        type: 'REPLENISH_FAST',
        priority: 'MEDIUM',
        title: 'Reorder Critical Stock',
        description: 'Ensure fast moving products have a safe 14-day stock buffer to avoid stockouts.',
        count: fastMovingStock.value.count,
        actionLabel: 'Check Fast Movers'
      },
      {
        type: 'GENERAL',
        priority: stockRunwayStatus.value === 'CRITICAL_LOW' ? 'HIGH' : (stockRunwayStatus.value === 'OVERSTOCKED' ? 'MEDIUM' : 'LOW'),
        title: stockRunwayStatus.value === 'CRITICAL_LOW' 
          ? 'Stockout Risk Alert' 
          : (stockRunwayStatus.value === 'OVERSTOCKED' ? 'Excess Inventory Runway' : 'Inventory Runway Health'),
        description: stockRunwayDays.value > 0 
          ? `Current inventory provides ~${stockRunwayDays.value} days of runway at active burn rate. Maintain optimal replenishment cycles.`
          : 'Monitor product sales velocity to optimize replenishment cycles and prevent stockouts.',
        count: stockRunwayDays.value > 0 ? stockRunwayDays.value : fastMovingStock.value.count,
        actionLabel: 'Audit Stock Runway'
      }
    ];
  }

  const seenTitles = new Set<string>();

  const mapped: FormattedRecommendation[] = list.map((recStr) => {
    const lower = recStr.toLowerCase();
    
    // 1. Runway checks must come first to prevent "slow stock" matching "low stock"
    const isCriticalRunway = lower.includes('critical inventory runway') || lower.includes('stockout') || (lower.includes('runway') && lower.includes('critical'));
    const isOverstockedRunway = lower.includes('high stock runway') || lower.includes('overstock') || (lower.includes('runway') && (lower.includes('slow') || lower.includes('liquidity')));
    const isGeneralRunway = lower.includes('runway');
    
    // 2. Dormant & Stop Reorders
    const isDiscount = lower.includes('discount') || lower.includes('liquidate');
    const isStop = lower.includes('stop reorder') || lower.includes('inactive');
    
    // 3. Replenishment & Low Stock (strictly excluding 'slow stock')
    const hasLowStockPhrase = lower.includes('low stock') && !lower.includes('slow stock');
    const isReplenish = lower.includes('replenish') || lower.includes('reorder threshold') || hasLowStockPhrase;

    let type: FormattedRecommendation['type'] = 'GENERAL';
    let priority: FormattedRecommendation['priority'] = 'MEDIUM';
    let title = 'Inventory Advisory';
    let count = 0;
    let actionLabel = 'Review Inventory';

    if (isCriticalRunway) {
      type = 'GENERAL';
      priority = 'HIGH';
      title = 'Stockout Risk Alert';
      count = stockRunwayDays.value;
      actionLabel = 'Audit Stock Runway';
    } else if (isOverstockedRunway) {
      type = 'GENERAL';
      priority = 'MEDIUM';
      title = 'Excess Inventory Runway';
      count = stockRunwayDays.value;
      actionLabel = 'Audit Working Capital';
    } else if (isGeneralRunway) {
      type = 'GENERAL';
      priority = 'LOW';
      title = 'Inventory Runway Health';
      count = stockRunwayDays.value;
      actionLabel = 'Audit Runway';
    } else if (isDiscount) {
      type = 'DISCOUNT_DORMANT';
      priority = 'HIGH';
      title = 'Liquidate Dormant Stock';
      count = deadStock.value.count;
      actionLabel = 'Inspect Dormant Items';
    } else if (isStop) {
      type = 'STOP_REORDER';
      priority = 'HIGH';
      title = 'Halt Inactive Reorders';
      count = deadStock.value.count;
      actionLabel = 'View Inactive Items';
    } else if (isReplenish) {
      type = 'REPLENISH_FAST';
      priority = 'HIGH';
      title = 'Reorder Critical Stock';
      count = inventoryAlerts.value.lowStockCount || fastMovingStock.value.count;
      actionLabel = 'View Low Stock';
    }

    // Deduplicate titles if any duplicate occurs
    if (seenTitles.has(title)) {
      if (title === 'Reorder Critical Stock') {
        title = 'Protect Fast Movers';
        actionLabel = 'Check Fast Movers';
      } else if (title === 'Liquidate Dormant Stock') {
        title = 'Dormant Capital Relief';
      } else {
        title = `${title} (Follow-Up)`;
      }
    }
    seenTitles.add(title);

    return {
      type,
      priority,
      title,
      description: recStr,
      count,
      actionLabel
    };
  });

  // If 3 items are present, add the missing 4th pillar to complete the 2x2 grid
  if (mapped.length === 3) {
    const hasRunway = mapped.some(m => m.title.includes('Runway') || m.title.includes('Stockout'));
    const hasReplenish = mapped.some(m => m.title.includes('Reorder') || m.title.includes('Fast Movers'));
    const hasDormant = mapped.some(m => m.title.includes('Dormant') || m.title.includes('Discount'));

    if (!hasRunway) {
      mapped.push({
        type: 'GENERAL',
        priority: stockRunwayStatus.value === 'CRITICAL_LOW' ? 'HIGH' : (stockRunwayStatus.value === 'OVERSTOCKED' ? 'MEDIUM' : 'LOW'),
        title: stockRunwayStatus.value === 'CRITICAL_LOW' 
          ? 'Stockout Risk Alert' 
          : (stockRunwayStatus.value === 'OVERSTOCKED' ? 'Excess Inventory Runway' : 'Inventory Runway Health'),
        description: stockRunwayDays.value > 0 
          ? `Current inventory provides ~${stockRunwayDays.value} days of runway at active burn rate. Maintain optimal replenishment cycles.`
          : 'Monitor daily turnover and burn rate to optimize replenishment and prevent stockouts.',
        count: stockRunwayDays.value > 0 ? stockRunwayDays.value : fastMovingStock.value.count,
        actionLabel: 'Audit Stock Runway'
      });
    } else if (!hasReplenish) {
      mapped.push({
        type: 'REPLENISH_FAST',
        priority: 'MEDIUM',
        title: 'Protect Fast Movers',
        description: 'Ensure high velocity items have an adequate safety stock buffer to satisfy demand.',
        count: fastMovingStock.value.count,
        actionLabel: 'Check Fast Movers'
      });
    } else if (!hasDormant) {
      mapped.push({
        type: 'DISCOUNT_DORMANT',
        priority: 'HIGH',
        title: 'Liquidate Dormant Stock',
        description: 'Consider discounting dormant stock to free up cash liquidity.',
        count: deadStock.value.count,
        actionLabel: 'Inspect Dormant Items'
      });
    }
  }

  return mapped;
});

const paymentBreakdown = computed(() => {
  return cashflowData.value?.paymentBreakdown || {
    cash: { amount: 0, count: 0 },
    mobile: { amount: 0, count: 0 },
    card: { amount: 0, count: 0 },
    credit: { amount: 0, count: 0 }
  };
});

const channelPercentages = computed(() => {
  const c = Number(paymentBreakdown.value.cash.amount) || 0;
  const m = Number(paymentBreakdown.value.mobile.amount) || 0;
  const d = Number(paymentBreakdown.value.card.amount) || 0;
  const cr = Number(paymentBreakdown.value.credit.amount) || 0;
  const total = c + m + d + cr;
  if (total === 0) return { cash: 0, mobile: 0, card: 0, credit: 0 };
  return {
    cash: Math.round((c / total) * 100),
    mobile: Math.round((m / total) * 100),
    card: Math.round((d / total) * 100),
    credit: Math.round((cr / total) * 100)
  };
});

const topSellingProducts = computed(() => cashflowData.value?.topSellingProducts || []);
const inventoryAlerts = computed(() => {
  return cashflowData.value?.inventoryAlerts || {
    lowStockCount: 0,
    outOfStockCount: 0,
    soonToExpireCount: 0
  };
});

// Chart & SVG Visuals
const velocityTrends = computed(() => {
  const backendList = cashflowData.value?.velocityTrends;
  if (backendList && backendList.length > 0) {
    return backendList;
  }
  // If backend is still loading or returned an empty array, generate standard timeline intervals
  if (selectedPeriod.value === 'today') {
    const hours = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'];
    const todayStr = new Date().toISOString().split('T')[0];
    return hours.map(h => ({
      label: h,
      date: todayStr,
      salesRevenue: 0,
      debtCollections: 0,
      pettyExpenses: 0,
      netCashflow: 0
    }));
  } else if (selectedPeriod.value === 'month') {
    return [
      { label: 'W1 (1-7)', date: 'W1', salesRevenue: 0, debtCollections: 0, pettyExpenses: 0, netCashflow: 0 },
      { label: 'W2 (8-14)', date: 'W2', salesRevenue: 0, debtCollections: 0, pettyExpenses: 0, netCashflow: 0 },
      { label: 'W3 (15-21)', date: 'W3', salesRevenue: 0, debtCollections: 0, pettyExpenses: 0, netCashflow: 0 },
      { label: 'W4 (22-28)', date: 'W4', salesRevenue: 0, debtCollections: 0, pettyExpenses: 0, netCashflow: 0 },
      { label: 'W5 (29+)', date: 'W5', salesRevenue: 0, debtCollections: 0, pettyExpenses: 0, netCashflow: 0 }
    ];
  } else if (selectedPeriod.value === 'year') {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map(m => ({
      label: m,
      date: m,
      salesRevenue: 0,
      debtCollections: 0,
      pettyExpenses: 0,
      netCashflow: 0
    }));
  } else {
    // 7 Days
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map(d => ({
      label: d,
      date: d,
      salesRevenue: 0,
      debtCollections: 0,
      pettyExpenses: 0,
      netCashflow: 0
    }));
  }
});

const chartMax = computed(() => {
  const vals: number[] = [];
  velocityTrends.value.forEach(t => {
    vals.push(Number(t.salesRevenue) || 0);
    vals.push(Number(t.debtCollections) || 0);
    vals.push(Number(t.pettyExpenses) || 0);
  });
  const defaultFloor = currency.value === 'USD' ? 500 : 50000;
  const max = Math.max(...vals, defaultFloor);
  const order = Math.pow(10, Math.floor(Math.log10(max)));
  const normalized = max / order;
  let ceilNormalized = 10;
  if (normalized <= 1.2) ceilNormalized = 1.2;
  else if (normalized <= 1.5) ceilNormalized = 1.5;
  else if (normalized <= 2) ceilNormalized = 2;
  else if (normalized <= 3) ceilNormalized = 3;
  else if (normalized <= 4) ceilNormalized = 4;
  else if (normalized <= 5) ceilNormalized = 5;
  else if (normalized <= 6) ceilNormalized = 6;
  else if (normalized <= 8) ceilNormalized = 8;
  return ceilNormalized * order;
});

const chartYLabels = computed(() => {
  const m = chartMax.value;
  return [m, m * 0.75, m * 0.5, m * 0.25, 0];
});

const chartPoints = computed(() => {
  const list = velocityTrends.value;
  const max = chartMax.value;
  const N = list.length;
  return list.map((item, i) => {
    const x = N > 1 ? (i / (N - 1)) * 100 : 50;
    const sVal = Number(item.salesRevenue) || 0;
    const cVal = Number(item.debtCollections) || 0;
    const eVal = Number(item.pettyExpenses) || 0;

    // Baseline sits at y = 92 (cleanly visible above bottom axis and never clipped).
    // Maximum value reaches y = 10 (leaves 10% headroom at top).
    // Effective vertical range = 82%
    const scaleY = 82;
    const baselineY = 92;
    const calcY = (val: number) => {
      if (val <= 0 || max <= 0) return baselineY;
      const ratio = Math.min(val / max, 1);
      return baselineY - ratio * scaleY;
    };

    return {
      x,
      salesY: calcY(sVal),
      collY: calcY(cVal),
      expY: calcY(eVal),
      label: item.label,
      date: item.date,
      salesRevenue: sVal,
      debtCollections: cVal,
      pettyExpenses: eVal,
      netCashflow: Number(item.netCashflow) || 0
    };
  });
});

// Monotone Cubic Spline (Fritsch-Carlson algorithm)
// Prevents overshooting, oscillations, and dips below zero
const buildMonotonePath = (pts: any[], yKey: 'salesY' | 'collY' | 'expY'): string => {
  if (!pts || pts.length === 0) return '';
  if (pts.length === 1) return `M ${pts[0].x.toFixed(2)} ${pts[0][yKey].toFixed(2)}`;
  if (pts.length === 2) {
    return `M ${pts[0].x.toFixed(2)} ${pts[0][yKey].toFixed(2)} L ${pts[1].x.toFixed(2)} ${pts[1][yKey].toFixed(2)}`;
  }

  const n = pts.length;
  const xs = pts.map((p) => p.x);
  const ys = pts.map((p) => p[yKey]);

  // 1. Compute secant differences
  const dxs: number[] = [];
  const deltas: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    const xCurr = xs[i] ?? 0;
    const xNext = xs[i + 1] ?? 0;
    const yCurr = ys[i] ?? 0;
    const yNext = ys[i + 1] ?? 0;
    const dx = xNext - xCurr;
    dxs.push(dx);
    deltas.push(dx === 0 ? 0 : (yNext - yCurr) / dx);
  }

  // 2. Compute slopes at points ensuring monotonicity
  const m: number[] = new Array(n).fill(0);
  m[0] = deltas[0] ?? 0;
  m[n - 1] = deltas[n - 2] ?? 0;

  for (let i = 1; i < n - 1; i++) {
    const dPrev = deltas[i - 1] ?? 0;
    const dNext = deltas[i] ?? 0;
    // If consecutive slopes change sign or either is 0 (extremum or flat plateau), slope is 0
    if (dPrev * dNext <= 0) {
      m[i] = 0;
    } else {
      // Harmonic mean prevents overshoot
      m[i] = (2 * dPrev * dNext) / (dPrev + dNext);
    }
  }

  // 3. Construct cubic Bezier curve
  let path = `M ${(xs[0] ?? 0).toFixed(2)} ${(ys[0] ?? 0).toFixed(2)}`;
  for (let i = 0; i < n - 1; i++) {
    const dx = dxs[i] ?? 0;
    const xNext = xs[i + 1] ?? 0;
    const yNext = ys[i + 1] ?? 0;
    const xCurr = xs[i] ?? 0;
    const yCurr = ys[i] ?? 0;
    const mCurr = m[i] ?? 0;
    const mNext = m[i + 1] ?? 0;

    const cp1x = xCurr + dx / 3;
    const cp1y = yCurr + (mCurr * dx) / 3;
    const cp2x = xNext - dx / 3;
    const cp2y = yNext - (mNext * dx) / 3;

    path += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${xNext.toFixed(2)} ${yNext.toFixed(2)}`;
  }
  return path;
};

const buildMonotoneAreaPath = (pts: any[], yKey: 'salesY' | 'collY' | 'expY'): string => {
  if (!pts || pts.length === 0) return '';
  const line = buildMonotonePath(pts, yKey);
  if (!line) return '';
  const last = pts[pts.length - 1];
  const first = pts[0];
  if (!last || !first) return '';
  return `${line} L ${last.x.toFixed(2)} 100 L ${first.x.toFixed(2)} 100 Z`;
};

const salesLinePath = computed(() => buildMonotonePath(chartPoints.value, 'salesY'));
const salesAreaPath = computed(() => buildMonotoneAreaPath(chartPoints.value, 'salesY'));

const collectionsLinePath = computed(() => buildMonotonePath(chartPoints.value, 'collY'));
const collectionsAreaPath = computed(() => buildMonotoneAreaPath(chartPoints.value, 'collY'));

const expensesLinePath = computed(() => buildMonotonePath(chartPoints.value, 'expY'));
const expensesAreaPath = computed(() => buildMonotoneAreaPath(chartPoints.value, 'expY'));

const activeHoverIndex = ref<number | null>(null);
const hoveredPoint = computed(() => {
  if (activeHoverIndex.value === null) return null;
  return chartPoints.value[activeHoverIndex.value] || null;
});

const handleChartHover = (event: MouseEvent) => {
  const svg = event.currentTarget as SVGSVGElement;
  if (!svg) return;
  const rect = svg.getBoundingClientRect();
  const mouseX = ((event.clientX - rect.left) / rect.width) * 100;
  let closest = 0;
  let minDiff = Infinity;
  chartPoints.value.forEach((pt, idx) => {
    const diff = Math.abs(pt.x - mouseX);
    if (diff < minDiff) {
      minDiff = diff;
      closest = idx;
    }
  });
  activeHoverIndex.value = closest;
};

const formattedDate = computed(() => {
  const locale = currentLocale.value === 'sw' ? 'sw-TZ' : 'en-US';
  return new Date().toLocaleDateString(locale, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
});

const formatTime = (isoStr?: string) => {
  if (!isoStr) return '';
  try {
    const d = new Date(isoStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return isoStr;
  }
};

// Quick Action Modal Triggers
const openCollectPaymentModal = () => {
  paymentForm.value = {
    customerId: '',
    amount: 0,
    paymentMethod: 'CASH',
    referenceNumber: '',
    notes: ''
  };
  paymentModalOpen.value = true;
};

const openCollectForCustomer = (debtor: any) => {
  paymentForm.value = {
    customerId: debtor.id,
    amount: debtor.outstandingBalance,
    paymentMethod: 'CASH',
    referenceNumber: '',
    notes: `Settlement for ${debtor.name}`
  };
  paymentModalOpen.value = true;
};

const submitCustomerPayment = async () => {
  const branchId = vm.activeBranchId.value || localStorage.getItem('branchId') || '';
  if (!paymentForm.value.customerId || paymentForm.value.amount <= 0) {
    showToast('Please specify valid customer and amount', 'error');
    return;
  }
  isSubmittingPayment.value = true;
  try {
    await customerService.recordPayment({
      customerId: paymentForm.value.customerId,
      branchId,
      amount: paymentForm.value.amount,
      paymentMethod: paymentForm.value.paymentMethod,
      referenceNumber: paymentForm.value.referenceNumber,
      notes: paymentForm.value.notes
    });
    showToast(t('dashboard2.paymentRecordedSuccess'), 'success');
    paymentModalOpen.value = false;
    await fetchData();
  } catch (err: any) {
    showToast(err.message || 'Failed to record payment', 'error');
  } finally {
    isSubmittingPayment.value = false;
  }
};

const openCashMovementModal = () => {
  movementForm.value = {
    type: 'PAY_OUT',
    amount: 0,
    reason: ''
  };
  movementModalOpen.value = true;
};

const submitCashMovement = async () => {
  if (movementForm.value.amount <= 0 || !movementForm.value.reason.trim()) {
    showToast('Please specify valid amount and reason', 'error');
    return;
  }
  isSubmittingMovement.value = true;
  try {
    const res = await vm.createCashMovement(movementForm.value.type, movementForm.value.amount, movementForm.value.reason);
    if (res.success) {
      movementModalOpen.value = false;
      await fetchData();
    }
  } catch (err: any) {
    showToast(err.message || 'Failed to record cash movement', 'error');
  } finally {
    isSubmittingMovement.value = false;
  }
};

// ==========================================
// Supplier Debt Settlement Handlers
// ==========================================
const creditorSuppliers = computed<Supplier[]>(() => {
  const map = new Map<string, Supplier>();
  
  // 1. From vm.suppliers (active suppliers from DB)
  (vm.suppliers.value || []).forEach((s) => {
    if (Number(s.balance) > 0) {
      map.set(s.id, { ...s, balance: Number(s.balance) });
    }
  });

  // 2. Supplement with any creditors returned in dashboard cashflow data
  (topCreditors.value || []).forEach((c: any) => {
    if (Number(c.balance) > 0 && !map.has(c.id)) {
      map.set(c.id, {
        id: c.id,
        code: c.code || (c.id ? c.id.slice(0, 6).toUpperCase() : 'SUP'),
        name: c.name || 'Supplier',
        contactPerson: c.contactPerson || '',
        phone: c.phone || '',
        email: c.email || '',
        category: c.category || 'Wholesale',
        balance: Number(c.balance) || 0,
        status: (c.status || 'Active') as 'Active' | 'Inactive'
      });
    }
  });

  return Array.from(map.values()).sort((a, b) => b.balance - a.balance);
});

const openPaySupplierModal = (targetCred?: any) => {
  let target: Supplier | null = null;
  if (targetCred) {
    target = creditorSuppliers.value.find((s) => s.id === targetCred.id) ||
             (vm.suppliers.value || []).find((s) => s.id === targetCred.id) ||
             {
               id: targetCred.id,
               code: targetCred.code || (targetCred.id ? targetCred.id.slice(0, 6).toUpperCase() : 'SUP'),
               name: targetCred.name || 'Supplier',
               contactPerson: targetCred.contactPerson || '',
               phone: targetCred.phone || '',
               email: targetCred.email || '',
               category: targetCred.category || 'Wholesale',
               balance: Number(targetCred.balance) || 0,
               status: (targetCred.status || 'Active') as 'Active' | 'Inactive'
             };
  } else {
    // Top card "Money You Owe suppliers"
    if (creditorSuppliers.value.length > 0) {
      target = creditorSuppliers.value[0] || null;
    }
  }

  if (!target || target.balance <= 0) {
    showToast(t('dashboard2.noCreditors') || 'No outstanding supplier balance to pay.', 'info');
    return;
  }

  selectedSupplierForPay.value = target;
  selectedSupplierIdForPay.value = target.id;
  supplierPaymentAmount.value = String(target.balance);
  showPaySupplierModal.value = true;
};

const onSupplierSelectChange = () => {
  const found = creditorSuppliers.value.find((s) => s.id === selectedSupplierIdForPay.value);
  if (found) {
    selectedSupplierForPay.value = found;
    supplierPaymentAmount.value = String(found.balance);
  }
};

const handlePaySupplier = async () => {
  if (!selectedSupplierForPay.value) return;
  const payVal = parseFloat(supplierPaymentAmount.value) || 0;
  if (payVal <= 0) {
    showToast(t('suppliers.enterValidPaymentAmount'), 'error');
    return;
  }
  if (payVal > selectedSupplierForPay.value.balance) {
    showToast(t('suppliers.paymentExceedsBalance'), 'error');
    return;
  }

  const newBalance = Math.max(0, selectedSupplierForPay.value.balance - payVal);
  isSubmittingSupplierPay.value = true;

  try {
    const storeId = localStorage.getItem('storeId');
    if (!storeId) {
      showToast('Error: Store ID is missing. Please log in again.', 'error');
      return;
    }

    const updatedSupplier = await api.put<any>(`/api/suppliers/${selectedSupplierForPay.value.id}`, {
      storeId,
      code: selectedSupplierForPay.value.code || 'SUP',
      name: selectedSupplierForPay.value.name,
      contactPerson: selectedSupplierForPay.value.contactPerson || '',
      phone: selectedSupplierForPay.value.phone || '',
      email: selectedSupplierForPay.value.email || '',
      category: selectedSupplierForPay.value.category || 'Wholesale',
      balance: newBalance,
      status: selectedSupplierForPay.value.status || 'Active'
    });

    const index = vm.suppliers.value.findIndex((s) => s.id === selectedSupplierForPay.value?.id);
    if (index !== -1 && vm.suppliers.value[index]) {
      vm.suppliers.value[index] = {
        ...vm.suppliers.value[index],
        balance: Number(updatedSupplier?.balance ?? newBalance)
      };
    }

    showToast(t('suppliers.paymentRecordedSuccess', {
      amount: payVal.toLocaleString(),
      name: updatedSupplier?.name || selectedSupplierForPay.value.name,
      balance: newBalance.toLocaleString()
    }));

    showPaySupplierModal.value = false;
    await fetchData();
  } catch (err: any) {
    showToast('Failed to record payment: ' + (err.message || err), 'error');
  } finally {
    isSubmittingSupplierPay.value = false;
  }
};
</script>
