<template>
  <div class="w-full max-w-[1720px] mx-auto py-2 font-sans select-none animate-fade-up px-2 sm:px-4 md:px-6">
    
    <!-- HEADER SECTION -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 bg-surface">
      <div>
        <div class="flex items-center gap-3">
          <h1 class="text-[30px] font-bold text-on-surface tracking-tight leading-tight">Purchases & Invoices</h1>
          <span class="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-primary/10 text-primary border border-primary/20">
            {{ totalPurchasesCount }} records
          </span>
        </div>
        <p class="text-sm text-on-surface-variant mt-1">
          Review stock purchases, verify supplier invoices, and safely process purchase returns & reversals.
        </p>
      </div>

      <!-- ACTION BUTTONS -->
      <div class="flex items-center gap-3">
        <button 
          @click="fetchPurchases"
          :disabled="isLoading"
          class="h-10 px-3.5 rounded-lg border border-outline hover:bg-surface-container-low text-on-surface-variant font-medium text-sm flex items-center gap-2 transition-all cursor-pointer shadow-sm bg-surface-container-lowest disabled:opacity-60"
          title="Refresh Purchases"
        >
          <RotateCw :class="['w-4 h-4 text-on-surface-variant', isLoading ? 'animate-spin text-primary' : '']" />
          <span>Refresh</span>
        </button>

        <button 
          @click="router.push('/inventory')"
          class="h-10 px-4 rounded-lg border border-outline hover:bg-surface-container-low text-on-surface-variant font-medium text-sm flex items-center gap-2 transition-all cursor-pointer shadow-sm bg-surface-container-lowest"
        >
          <Package class="w-4 h-4 text-on-surface-variant" />
          <span>Product Catalog</span>
        </button>
      </div>
    </div>

    <!-- KPI SUMMARY CARDS -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <!-- Total Purchases -->
      <div class="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/60 shadow-xs flex items-center gap-3.5">
        <div class="w-11 h-11 rounded-xl bg-primary-container/25 text-primary flex items-center justify-center shrink-0">
          <ShoppingBag class="w-5 h-5" />
        </div>
        <div class="min-w-0 flex-1">
          <span class="text-[11px] font-bold uppercase tracking-wider text-outline block">Total Purchases</span>
          <p class="text-lg font-black text-on-surface truncate mt-0.5 font-mono">
            {{ formatCurrency(summaryTotalCost, currency) }}
          </p>
          <span class="text-[11px] text-on-surface-variant/75 block mt-0.5">{{ totalPurchasesCount }} orders logged</span>
        </div>
      </div>

      <!-- Cash Purchases -->
      <div class="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/60 shadow-xs flex items-center gap-3.5">
        <div class="w-11 h-11 rounded-xl bg-emerald-500/15 text-emerald-700 flex items-center justify-center shrink-0">
          <Coins class="w-5 h-5" />
        </div>
        <div class="min-w-0 flex-1">
          <span class="text-[11px] font-bold uppercase tracking-wider text-outline block">Cash Settled</span>
          <p class="text-lg font-black text-emerald-700 truncate mt-0.5 font-mono">
            {{ formatCurrency(summaryCashCost, currency) }}
          </p>
          <span class="text-[11px] text-on-surface-variant/75 block mt-0.5">Paid via register/cashier</span>
        </div>
      </div>

      <!-- Credit / Supplier Debt -->
      <div class="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/60 shadow-xs flex items-center gap-3.5">
        <div class="w-11 h-11 rounded-xl bg-amber-500/15 text-amber-700 flex items-center justify-center shrink-0">
          <CreditCard class="w-5 h-5" />
        </div>
        <div class="min-w-0 flex-1">
          <span class="text-[11px] font-bold uppercase tracking-wider text-outline block">On-Credit Purchases</span>
          <p class="text-lg font-black text-amber-800 truncate mt-0.5 font-mono">
            {{ formatCurrency(summaryCreditCost, currency) }}
          </p>
          <span class="text-[11px] text-on-surface-variant/75 block mt-0.5">Payable debt to suppliers</span>
        </div>
      </div>

      <!-- Total Returns / Reversals -->
      <div class="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/60 shadow-xs flex items-center gap-3.5">
        <div class="w-11 h-11 rounded-xl bg-error/15 text-error flex items-center justify-center shrink-0">
          <Undo2 class="w-5 h-5" />
        </div>
        <div class="min-w-0 flex-1">
          <span class="text-[11px] font-bold uppercase tracking-wider text-outline block">Returned / Reversed</span>
          <p class="text-lg font-black text-error truncate mt-0.5 font-mono">
            {{ formatCurrency(summaryReturnedAmount, currency) }}
          </p>
          <span class="text-[11px] text-on-surface-variant/75 block mt-0.5">{{ summaryReturnedQty }} units written back</span>
        </div>
      </div>
    </div>

    <!-- FILTERS AND SEARCH ROW -->
    <div class="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/60 shadow-xs mb-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
      <!-- Search Input -->
      <div class="relative flex-1 max-w-md">
        <Search class="w-4 h-4 text-outline absolute left-3 top-1/2 -translate-y-1/2" />
        <input 
          type="text"
          v-model="searchQuery"
          @input="currentPage = 1"
          placeholder="Search by invoice ID, product name, supplier..."
          class="w-full bg-surface-container-low pl-9 pr-8 py-2 border border-outline-variant rounded-lg text-xs outline-none focus:border-primary transition-all font-semibold placeholder:text-outline text-on-surface"
        />
        <button 
          v-if="searchQuery"
          type="button"
          @click="searchQuery = ''; currentPage = 1"
          class="absolute right-2.5 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface cursor-pointer bg-transparent border-0"
        >
          <X class="w-3.5 h-3.5" />
        </button>
      </div>

      <!-- Filter Controls -->
      <div class="flex flex-wrap items-center gap-2.5">
        <!-- Date Preset Filter -->
        <div class="flex items-center gap-1.5 bg-surface-container-low px-3 py-1 rounded-lg border border-outline-variant">
          <Calendar class="w-3.5 h-3.5 text-outline shrink-0" />
          <span class="text-[11px] font-bold uppercase text-outline">Date:</span>
          <select 
            v-model="datePreset" 
            @change="handleDatePresetChange"
            class="bg-transparent text-xs font-bold text-on-surface outline-none cursor-pointer border-0"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="7days">Last 7 Days</option>
            <option value="month">This Month</option>
            <option value="custom">Custom Range</option>
          </select>
          <span v-if="datePreset !== 'all' && datePreset !== 'custom' && startDate" class="text-[10px] font-mono text-primary font-bold hidden sm:inline-block border-l border-outline-variant/60 pl-1.5">
            {{ startDate === endDate ? startDate : `${startDate} to ${endDate}` }}
          </span>
        </div>

        <!-- Custom Start & End Date Inputs -->
        <div v-if="datePreset === 'custom'" class="flex items-center gap-2">
          <div class="flex items-center gap-1.5 bg-surface-container-low px-2.5 py-1 rounded-lg border border-outline-variant">
            <span class="text-[10px] font-bold uppercase text-outline">From:</span>
            <input 
              type="date" 
              v-model="startDate" 
              @change="() => { currentPage = 1; fetchPurchases(); }"
              class="bg-transparent text-xs font-mono font-semibold text-on-surface outline-none border-0 cursor-pointer"
            />
          </div>
          <div class="flex items-center gap-1.5 bg-surface-container-low px-2.5 py-1 rounded-lg border border-outline-variant">
            <span class="text-[10px] font-bold uppercase text-outline">To:</span>
            <input 
              type="date" 
              v-model="endDate" 
              @change="() => { currentPage = 1; fetchPurchases(); }"
              class="bg-transparent text-xs font-mono font-semibold text-on-surface outline-none border-0 cursor-pointer"
            />
          </div>
        </div>

        <!-- Status Filter -->
        <div class="flex items-center gap-1.5 bg-surface-container-low px-3 py-1 rounded-lg border border-outline-variant">
          <span class="text-[11px] font-bold uppercase text-outline">Status:</span>
          <select 
            v-model="statusFilter" 
            @change="() => { currentPage = 1; fetchPurchases(); }"
            class="bg-transparent text-xs font-bold text-on-surface outline-none cursor-pointer border-0"
          >
            <option value="ALL">All Statuses</option>
            <option value="COMPLETED">Completed</option>
            <option value="PARTIALLY_RETURNED">Partially Returned</option>
            <option value="REVERSED">Reversed</option>
          </select>
        </div>

        <!-- Supplier Filter -->
        <div class="flex items-center gap-1.5 bg-surface-container-low px-3 py-1 rounded-lg border border-outline-variant">
          <span class="text-[11px] font-bold uppercase text-outline">Supplier:</span>
          <select 
            v-model="supplierFilter" 
            @change="() => { currentPage = 1; fetchPurchases(); }"
            class="bg-transparent text-xs font-bold text-on-surface outline-none cursor-pointer border-0 max-w-[140px] truncate"
          >
            <option value="">All Suppliers</option>
            <option v-for="sup in suppliers" :key="sup.id" :value="sup.id">
              {{ sup.name }}
            </option>
          </select>
        </div>

        <!-- Reset Button -->
        <button 
          v-if="searchQuery || statusFilter !== 'ALL' || supplierFilter || datePreset !== 'all' || startDate || endDate"
          @click="resetFilters"
          class="px-2.5 py-1.5 rounded-lg text-xs font-bold text-primary hover:bg-primary/10 transition-colors cursor-pointer border-0 bg-transparent flex items-center gap-1"
        >
          <RotateCcw class="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>
    </div>

    <!-- PURCHASES TABLE CARD -->
    <div class="border border-outline-variant rounded-xl overflow-hidden shadow-sm bg-surface-container-lowest relative min-h-[380px]">
      <JengaLoader 
        v-if="isLoading" 
        overlay 
        size="lg" 
        label="Loading Purchases" 
        sublabel="Fetching supplier purchase invoices & on-hand inventory levels..." 
      />

      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-[13px]">
          <thead class="bg-surface-container-lowest border-b border-outline-variant text-on-surface-variant font-mono text-[11px] uppercase select-none">
            <tr>
              <th class="px-4 py-3.5 font-bold">Invoice / ID</th>
              <th class="px-3.5 py-3.5 font-bold">Date & Time</th>
              <th class="px-3.5 py-3.5 font-bold min-w-[200px]">Product & Quantity</th>
              <th class="px-3.5 py-3.5 font-bold">Supplier</th>
              <th class="px-3.5 py-3.5 text-center font-bold">Payment</th>
              <th class="px-3.5 py-3.5 text-center font-bold">Total Cost ({{ currency }})</th>
              <th class="px-3.5 py-3.5 text-center font-bold">Stock on Hand</th>
              <th class="px-3.5 py-3.5 text-center font-bold">Status</th>
              <th class="px-3.5 py-3.5 text-center font-bold min-w-[120px]">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr 
              v-for="p in paginatedPurchases" 
              :key="p.id" 
              class="hover:bg-surface-container-low transition-all font-sans"
              :class="p.status === 'REVERSED' ? 'bg-error/5 opacity-85' : ''"
            >
              <!-- Invoice / ID -->
              <td class="px-4 py-3 font-mono">
                <span class="font-bold text-primary block">#{{ p.id.slice(0, 8) }}</span>
                <span class="text-[10px] text-outline block truncate max-w-[110px]" :title="p.id">{{ p.id }}</span>
              </td>

              <!-- Date & Time -->
              <td class="px-3.5 py-3 text-on-surface-variant text-xs font-medium whitespace-nowrap">
                {{ formatDateTime(p.createdAt) }}
              </td>

              <!-- Product & Quantity -->
              <td class="px-3.5 py-3">
                <div v-if="getFirstItem(p)">
                  <div class="flex items-center gap-1.5 flex-wrap">
                    <span class="font-bold text-on-surface">{{ getFirstItem(p)?.productName }}</span>
                    <span v-if="p.items.length > 1" class="px-1.5 py-0.2 rounded text-[10px] font-bold bg-surface-container text-on-surface-variant">
                      +{{ p.items.length - 1 }} more
                    </span>
                  </div>
                  <div class="flex items-center gap-2 text-xs text-on-surface-variant mt-0.5">
                    <span class="font-semibold">{{ getFirstItem(p)?.quantity }} pcs</span>
                    <span>•</span>
                    <span class="font-mono">@ {{ formatCurrencyWithoutSymbol(getFirstItem(p)?.unitCost || 0, currency) }}</span>
                  </div>
                </div>
                <span v-else class="text-outline italic text-xs">No items</span>
              </td>

              <!-- Supplier -->
              <td class="px-3.5 py-3 text-on-surface-variant text-xs font-semibold">
                {{ p.supplierName || 'Direct Purchase' }}
              </td>

              <!-- Payment Method -->
              <td class="px-3.5 py-3 text-center">
                <span 
                  class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase inline-flex items-center gap-1"
                  :class="getPaymentBadgeClass(p.paymentType)"
                >
                  <Coins v-if="p.paymentType === 'CASH'" class="w-3 h-3" />
                  <CreditCard v-else-if="p.paymentType === 'CREDIT'" class="w-3 h-3" />
                  <Landmark v-else class="w-3 h-3" />
                  <span>{{ p.paymentType || 'CASH' }}</span>
                </span>
              </td>

              <!-- Total Cost -->
              <td class="px-3.5 py-3 text-center font-mono select-all">
                <span class="text-[14px] font-bold text-on-surface block">
                  {{ formatCurrencyWithoutSymbol(p.totalCost, currency) }}
                </span>
                <span v-if="p.returnedAmount && p.returnedAmount > 0" class="text-[10px] text-error font-semibold block">
                  -{{ formatCurrencyWithoutSymbol(p.returnedAmount, currency) }} ref.
                </span>
              </td>

              <!-- Stock on Hand Status -->
              <td class="px-3.5 py-3 text-center font-mono">
                <template v-if="getFirstItem(p)">
                  <div class="flex flex-col items-center gap-0.5">
                    <span 
                      class="px-2 py-0.5 rounded text-xs font-bold"
                      :class="getStockBadgeClass(getFirstItem(p)!)"
                    >
                      {{ getFirstItem(p)?.currentStock }} units
                    </span>
                    <span 
                      v-if="(getFirstItem(p)?.currentStock ?? 0) < (getFirstItem(p)?.quantity ?? 0)" 
                      class="text-[10px] text-amber-700 font-semibold"
                      title="Some units were sold at POS"
                    >
                      {{ (getFirstItem(p)?.quantity ?? 0) - (getFirstItem(p)?.currentStock ?? 0) }} sold
                    </span>
                  </div>
                </template>
                <span v-else class="text-outline text-xs">--</span>
              </td>

              <!-- Status -->
              <td class="px-3.5 py-3 text-center">
                <span 
                  class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase inline-block font-sans"
                  :class="getStatusBadgeClass(p.status)"
                >
                  {{ formatStatusLabel(p.status) }}
                </span>
              </td>

              <!-- Actions -->
              <td class="px-3.5 py-3 text-center select-none whitespace-nowrap">
                <div class="flex items-center justify-center gap-1.5">
                  <!-- View Details Button -->
                  <button 
                    @click="openDetailsModal(p)"
                    class="p-1.5 hover:bg-surface-container rounded-lg text-on-surface-variant hover:text-primary transition-colors cursor-pointer border-0 bg-transparent"
                    title="View Purchase Details"
                  >
                    <Eye class="w-4 h-4" />
                  </button>

                  <!-- Return / Reverse Button -->
                  <button 
                    @click="openReversalModal(p)"
                    :disabled="isReverseDisabled(p)"
                    class="px-2 py-1 rounded-lg text-xs font-bold transition-all border-0 flex items-center gap-1 cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed"
                    :class="isReverseDisabled(p) 
                      ? 'bg-surface-container text-outline' 
                      : 'bg-error/10 text-error hover:bg-error/20 active:scale-95'"
                    :title="getReverseButtonTooltip(p)"
                  >
                    <Undo2 class="w-3.5 h-3.5" />
                    <span>Reverse</span>
                  </button>
                </div>
              </td>
            </tr>

            <!-- Empty State -->
            <tr v-if="filteredPurchases.length === 0 && !isLoading">
              <td colspan="9" class="py-16 text-center select-none text-outline">
                <ShoppingBag class="w-10 h-10 mx-auto text-outline-variant mb-2 stroke-[1.5px]" />
                <p class="font-bold text-sm text-on-surface">No purchase invoices found</p>
                <p class="text-xs text-on-surface-variant mt-0.5">Purchases recorded during product restock will appear here.</p>
                <button 
                  v-if="searchQuery || statusFilter !== 'ALL' || supplierFilter"
                  @click="resetFilters"
                  class="text-xs font-bold text-primary underline mt-2 cursor-pointer bg-transparent border-0"
                >
                  Clear search & filter settings
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- PAGINATION CONTROLLER -->
      <div class="p-4 bg-surface-container-lowest border-t border-outline-variant/50 flex flex-col sm:flex-row justify-between items-center gap-4 select-none">
        <div class="text-xs text-on-surface-variant font-medium">
          Showing {{ filteredPurchases.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1 }} to
          {{ Math.min(currentPage * itemsPerPage, filteredPurchases.length) }} of {{ filteredPurchases.length }} purchases
        </div>

        <div class="flex items-center gap-1.5 font-sans">
          <button 
            :disabled="currentPage === 1"
            @click="currentPage = 1"
            class="w-8 h-8 rounded border border-outline-variant flex items-center justify-center hover:bg-surface-container-low transition-colors disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer bg-surface-container-lowest"
            title="First Page"
          >
            <ChevronsLeft class="w-4 h-4 text-on-surface-variant" />
          </button>

          <button 
            :disabled="currentPage === 1"
            @click="currentPage = Math.max(1, currentPage - 1)"
            class="w-8 h-8 rounded border border-outline-variant flex items-center justify-center hover:bg-surface-container-low transition-colors disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer bg-surface-container-lowest"
            title="Previous Page"
          >
            <ChevronLeft class="w-4 h-4 text-on-surface-variant" />
          </button>

          <span class="text-xs font-bold px-3 text-on-surface font-mono">
            Page {{ currentPage }} of {{ totalPages || 1 }}
          </span>

          <button 
            :disabled="currentPage === totalPages || totalPages === 0"
            @click="currentPage = Math.min(totalPages, currentPage + 1)"
            class="w-8 h-8 rounded border border-outline-variant flex items-center justify-center hover:bg-surface-container-low transition-colors disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer bg-surface-container-lowest"
            title="Next Page"
          >
            <ChevronRight class="w-4 h-4 text-on-surface-variant" />
          </button>

          <button 
            :disabled="currentPage === totalPages || totalPages === 0"
            @click="currentPage = totalPages"
            class="w-8 h-8 rounded border border-outline-variant flex items-center justify-center hover:bg-surface-container-low transition-colors disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer bg-surface-container-lowest"
            title="Last Page"
          >
            <ChevronsRight class="w-4 h-4 text-on-surface-variant" />
          </button>
        </div>
      </div>
    </div>

    <!-- 1. PURCHASE DETAILS / VIEW MODAL -->
    <Modal 
      :isOpen="showDetailsModal" 
      :onClose="() => showDetailsModal = false"
      title="Purchase Invoice Details"
      subtitle="Complete breakdown of purchased stock items and financial settlement"
      maxWidth="max-w-2xl"
    >
      <div v-if="selectedPurchase" class="space-y-5">
        <!-- Top Info Header Box -->
        <div class="p-4 rounded-xl bg-surface-container-low border border-outline-variant/60 flex flex-wrap justify-between items-center gap-3 text-xs">
          <div>
            <span class="text-[10px] font-bold uppercase text-outline block">Invoice Reference</span>
            <span class="font-mono font-bold text-sm text-primary">#{{ selectedPurchase.id }}</span>
          </div>
          <div>
            <span class="text-[10px] font-bold uppercase text-outline block">Date & Time</span>
            <span class="font-semibold text-on-surface">{{ formatDateTime(selectedPurchase.createdAt) }}</span>
          </div>
          <div>
            <span class="text-[10px] font-bold uppercase text-outline block">Payment Method</span>
            <span 
              class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase inline-block"
              :class="getPaymentBadgeClass(selectedPurchase.paymentType)"
            >
              {{ selectedPurchase.paymentType || 'CASH' }}
            </span>
          </div>
          <div>
            <span class="text-[10px] font-bold uppercase text-outline block">Invoice Status</span>
            <span 
              class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase inline-block"
              :class="getStatusBadgeClass(selectedPurchase.status)"
            >
              {{ formatStatusLabel(selectedPurchase.status) }}
            </span>
          </div>
        </div>

        <!-- Supplier & Branch Info -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div class="p-3 rounded-xl border border-outline-variant/60 bg-surface-container-lowest">
            <span class="text-[10px] font-bold uppercase text-outline block mb-1">Supplier</span>
            <p class="font-bold text-on-surface text-sm">{{ selectedPurchase.supplierName || 'Direct / Walk-in Supplier' }}</p>
          </div>
          <div class="p-3 rounded-xl border border-outline-variant/60 bg-surface-container-lowest">
            <span class="text-[10px] font-bold uppercase text-outline block mb-1">Store Branch</span>
            <p class="font-bold text-on-surface text-sm">{{ selectedPurchase.branchName || 'Main Branch' }}</p>
          </div>
        </div>

        <!-- Items Table -->
        <div>
          <span class="text-xs font-bold text-on-surface uppercase tracking-wider block mb-2">Purchased Items Breakdown</span>
          <div class="border border-outline-variant rounded-xl overflow-hidden">
            <table class="w-full text-left text-xs border-collapse">
              <thead class="bg-surface-container-low text-on-surface-variant font-mono text-[10px] uppercase border-b border-outline-variant">
                <tr>
                  <th class="p-2.5 font-bold">Product</th>
                  <th class="p-2.5 text-center font-bold">Qty</th>
                  <th class="p-2.5 text-center font-bold">Unit Cost</th>
                  <th class="p-2.5 text-center font-bold">Total</th>
                  <th class="p-2.5 text-center font-bold">Stock on Shelf</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-for="item in selectedPurchase.items" :key="item.id" class="hover:bg-surface-container-low">
                  <td class="p-2.5 font-bold text-on-surface">{{ item.productName }}</td>
                  <td class="p-2.5 text-center font-mono font-bold">{{ item.quantity }}</td>
                  <td class="p-2.5 text-center font-mono">{{ formatCurrencyWithoutSymbol(item.unitCost, currency) }}</td>
                  <td class="p-2.5 text-center font-mono font-bold text-primary">{{ formatCurrencyWithoutSymbol(item.quantity * item.unitCost, currency) }}</td>
                  <td class="p-2.5 text-center font-mono">
                    <span 
                      class="px-2 py-0.5 rounded text-[11px] font-bold"
                      :class="getStockBadgeClass(item)"
                    >
                      {{ item.currentStock }} pcs
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Reversal / Return History Banner (If previously returned) -->
        <div v-if="selectedPurchase.returnedQuantity && selectedPurchase.returnedQuantity > 0" class="p-3.5 rounded-xl bg-error/10 border border-error/20 text-xs">
          <div class="flex items-center gap-2 text-error font-bold mb-1.5">
            <Undo2 class="w-4 h-4" />
            <span>Return & Reversal Record</span>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
            <div>
              <span class="text-[10px] text-outline block">Returned Qty:</span>
              <span class="font-bold text-error">{{ selectedPurchase.returnedQuantity }} units</span>
            </div>
            <div>
              <span class="text-[10px] text-outline block">Refunded Amount:</span>
              <span class="font-bold text-error">{{ formatCurrency(selectedPurchase.returnedAmount || 0, currency) }}</span>
            </div>
            <div>
              <span class="text-[10px] text-outline block">Reversed Date:</span>
              <span class="text-on-surface">{{ formatDateTime(selectedPurchase.reversedAt) }}</span>
            </div>
            <div>
              <span class="text-[10px] text-outline block">Authorized By:</span>
              <span class="text-on-surface font-sans font-semibold">{{ selectedPurchase.reversedByName || 'Admin' }}</span>
            </div>
          </div>
          <div v-if="selectedPurchase.reversalReason" class="mt-2 text-xs text-on-surface font-sans pt-2 border-t border-error/20">
            <strong>Reason:</strong> {{ selectedPurchase.reversalReason }}
          </div>
        </div>
      </div>

      <template #footer>
        <button 
          @click="showDetailsModal = false"
          class="px-4 py-2 rounded-lg border border-outline text-xs font-bold text-on-surface-variant hover:bg-surface-container-high transition-colors cursor-pointer bg-transparent"
        >
          Close
        </button>
        <button 
          v-if="selectedPurchase && !isReverseDisabled(selectedPurchase)"
          @click="showDetailsModal = false; openReversalModal(selectedPurchase)"
          class="px-4 py-2 rounded-lg bg-error text-white text-xs font-bold hover:bg-error/90 transition-colors flex items-center gap-1.5 cursor-pointer border-0 shadow-sm"
        >
          <Undo2 class="w-3.5 h-3.5" />
          <span>Return / Reverse This Purchase</span>
        </button>
      </template>
    </Modal>

    <!-- 2. PURCHASE REVERSAL / RETURN MODAL -->
    <Modal 
      :isOpen="showReversalModal" 
      :onClose="() => showReversalModal = false"
      title="Return / Reverse Purchase"
      subtitle="Reverse purchase order, return inventory to supplier, and process financial refund"
      maxWidth="max-w-xl"
    >
      <div v-if="selectedPurchase && activeItem" class="space-y-4">
        
        <!-- 1. Purchase Context Header -->
        <div class="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/60 text-xs">
          <span class="text-[10px] font-bold uppercase tracking-wider text-outline block mb-2">Purchase Context</span>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <span class="text-outline text-[10px] block">Invoice ID</span>
              <span class="font-mono font-bold text-primary">#{{ selectedPurchase.id.slice(0, 8) }}</span>
            </div>
            <div>
              <span class="text-outline text-[10px] block">Supplier</span>
              <span class="font-bold text-on-surface truncate block">{{ selectedPurchase.supplierName || 'Direct' }}</span>
            </div>
            <div>
              <span class="text-outline text-[10px] block">Payment Method</span>
              <span class="font-bold" :class="selectedPurchase.paymentType === 'CREDIT' ? 'text-amber-700' : 'text-emerald-700'">
                {{ selectedPurchase.paymentType || 'CASH' }}
              </span>
            </div>
            <div>
              <span class="text-outline text-[10px] block">Unit Cost</span>
              <span class="font-mono font-bold text-on-surface">{{ formatCurrency(activeItem.unitCost, currency) }}</span>
            </div>
          </div>
          <div class="mt-2.5 pt-2 border-t border-outline-variant/40 flex items-center justify-between text-xs">
            <span class="text-on-surface-variant">Product: <strong class="text-on-surface">{{ activeItem.productName }}</strong></span>
            <span class="font-mono text-outline">Purchased: {{ activeItem.quantity }} pcs</span>
          </div>
        </div>

        <!-- 2. The Consumed Stock Protection Notice -->
        <!-- Scenario A: Full stock on hand -->
        <div 
          v-if="remainingPurchasedQty <= activeItem.currentStock && activeItem.currentStock > 0"
          class="p-3.5 bg-emerald-500/10 border border-emerald-500/25 rounded-xl text-xs text-emerald-900 font-medium flex items-center gap-2.5"
        >
          <CheckCircle2 class="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Full stock available for reversal (<strong>{{ activeItem.currentStock }} units</strong> on hand).</span>
        </div>

        <!-- Scenario B: Partial stock consumed / sold at POS -->
        <div 
          v-else-if="activeItem.currentStock > 0 && activeItem.currentStock < remainingPurchasedQty"
          class="p-3.5 bg-amber-500/10 border border-amber-500/25 rounded-xl text-xs text-amber-900 font-medium flex items-start gap-2.5"
        >
          <AlertTriangle class="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p class="font-bold text-amber-950">⚠️ Stock Consumption Notice</p>
            <p class="mt-0.5 text-amber-900 leading-relaxed">
              <strong>{{ remainingPurchasedQty - activeItem.currentStock }} units</strong> have already been sold to customers at the POS.
              Only <strong>{{ activeItem.currentStock }} units</strong> remain on hand. You can return up to <strong>{{ maxReturnable }} units</strong> to prevent negative inventory.
            </p>
          </div>
        </div>

        <!-- Scenario C: Zero stock on hand -->
        <div 
          v-else
          class="p-3.5 bg-error/10 border border-error/25 rounded-xl text-xs text-error font-medium flex items-start gap-2.5"
        >
          <AlertCircle class="w-5 h-5 text-error shrink-0 mt-0.5" />
          <div>
            <p class="font-bold">⛔ Stock Fully Depleted</p>
            <p class="mt-0.5 leading-relaxed">
              All purchased units have already been sold to customers. There is 0 stock on hand, so items cannot be returned without causing negative inventory.
            </p>
          </div>
        </div>

        <!-- 3. Quantity Input & Slider -->
        <div class="space-y-2.5 pt-1">
          <div class="flex items-center justify-between">
            <label class="text-xs font-bold text-on-surface uppercase tracking-wide">
              Units to Return
            </label>
            <button 
              type="button"
              @click="returnQuantity = maxReturnable"
              :disabled="maxReturnable <= 0"
              class="text-xs font-bold text-primary hover:underline cursor-pointer bg-transparent border-0 disabled:opacity-40"
            >
              Return Max Available ({{ maxReturnable }})
            </button>
          </div>

          <div class="flex items-center gap-3">
            <input 
              type="number"
              v-model.number="returnQuantity"
              :min="1"
              :max="maxReturnable"
              :disabled="maxReturnable <= 0"
              class="w-32 bg-surface-container-low px-3.5 py-2.5 border border-outline-variant rounded-xl text-sm font-bold font-mono outline-none focus:border-primary transition-all text-on-surface"
              placeholder="Qty"
            />
            <input 
              type="range"
              v-model.number="returnQuantity"
              :min="1"
              :max="maxReturnable || 1"
              :disabled="maxReturnable <= 0"
              class="flex-1 accent-primary cursor-pointer disabled:opacity-40"
            />
          </div>
          <span v-if="returnQuantity > maxReturnable" class="text-xs text-error font-bold block">
            Quantity exceeds maximum available returnable stock ({{ maxReturnable }} units).
          </span>
        </div>

        <!-- 4. Real-Time Settlement Preview -->
        <div class="p-4 rounded-xl bg-surface-container-low border border-outline-variant/60 space-y-2.5 text-xs">
          <span class="text-[10px] font-bold uppercase tracking-wider text-outline block">Settlement & Ledger Preview</span>
          
          <!-- Stock Deduction -->
          <div class="flex items-center justify-between">
            <span class="text-on-surface-variant font-medium">Stock Deduction:</span>
            <span class="font-mono font-bold text-error">
              -{{ returnQuantity || 0 }} units 
              <span class="text-on-surface-variant font-normal font-sans text-[11px]">
                (New stock on hand: {{ Math.max(0, activeItem.currentStock - (returnQuantity || 0)) }})
              </span>
            </span>
          </div>

          <!-- Refund Calculation -->
          <div class="flex items-center justify-between">
            <span class="text-on-surface-variant font-medium">Refund Calculation:</span>
            <span class="font-mono font-bold text-on-surface">
              {{ returnQuantity || 0 }} pcs × {{ formatCurrencyWithoutSymbol(activeItem.unitCost, currency) }} = 
              <strong class="text-primary font-black">{{ formatCurrency(calculatedRefundAmount, currency) }}</strong>
            </span>
          </div>

          <!-- Money Destination -->
          <div class="flex items-start justify-between gap-4 pt-1.5 border-t border-outline-variant/40">
            <span class="text-on-surface-variant font-medium shrink-0">Money Destination:</span>
            <span class="text-right font-bold text-xs" :class="selectedPurchase.paymentType === 'CREDIT' ? 'text-amber-800' : 'text-emerald-800'">
              {{ moneyDestinationText }}
            </span>
          </div>
        </div>

        <!-- 5. Reason Dropdown -->
        <div class="space-y-1.5">
          <label class="text-xs font-bold text-on-surface uppercase tracking-wide">
            Reason for Return / Reversal
          </label>
          <select 
            v-model="selectedReason"
            class="w-full bg-surface-container-low px-3.5 py-2.5 border border-outline-variant rounded-xl text-xs font-semibold outline-none focus:border-primary transition-all text-on-surface cursor-pointer"
          >
            <option value="Clerical entry mistake">Clerical entry mistake</option>
            <option value="Defective goods returned to supplier">Defective goods returned to supplier</option>
            <option value="Expired products delivered">Expired products delivered</option>
            <option value="Wrong items delivered">Wrong items delivered</option>
            <option value="Supplier overcharge / pricing dispute">Supplier overcharge / pricing dispute</option>
            <option value="Customer cancelled order / overstock">Customer cancelled order / overstock</option>
            <option value="Other">Other (Custom explanation)</option>
          </select>

          <!-- Custom Reason Text Input -->
          <textarea 
            v-if="selectedReason === 'Other'"
            v-model="customReason"
            rows="2"
            placeholder="Please specify the reason for this reversal..."
            class="w-full mt-1.5 bg-surface-container-low p-2.5 border border-outline-variant rounded-xl text-xs outline-none focus:border-primary transition-all text-on-surface"
          />
        </div>

      </div>

      <template #footer>
        <button 
          @click="showReversalModal = false"
          :disabled="isSubmittingReturn"
          class="px-4 py-2.5 rounded-lg border border-outline text-xs font-bold text-on-surface-variant hover:bg-surface-container-high transition-colors cursor-pointer bg-transparent"
        >
          Cancel
        </button>
        <button 
          @click="handleConfirmReturn"
          :disabled="isSubmittingReturn || maxReturnable <= 0 || !returnQuantity || returnQuantity <= 0 || returnQuantity > maxReturnable"
          class="px-5 py-2.5 rounded-lg bg-error text-white text-xs font-bold hover:bg-error/90 transition-all flex items-center gap-2 cursor-pointer border-0 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <RotateCw v-if="isSubmittingReturn" class="w-3.5 h-3.5 animate-spin" />
          <Undo2 v-else class="w-3.5 h-3.5" />
          <span>{{ isSubmittingReturn ? 'Processing...' : `Confirm Return & Refund (${formatCurrency(calculatedRefundAmount, currency)})` }}</span>
        </button>
      </template>
    </Modal>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAppViewModel } from '../viewmodels/useAppViewModel';
import { showToast } from '../services/toastService';
import { api } from '../services/api';
import Modal from '../components/common/Modal.vue';
import JengaLoader from '../components/common/JengaLoader.vue';
import type { Purchase, PurchaseItem, Supplier } from '../models/types';
import { formatCurrency, formatCurrencyWithoutSymbol } from '../models/mockData';
import {
  ShoppingBag,
  RotateCw,
  Search,
  X,
  Package,
  Coins,
  CreditCard,
  Landmark,
  Undo2,
  Eye,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Calendar,
  RotateCcw
} from 'lucide-vue-next';

const router = useRouter();
const vm = useAppViewModel();

const currency = computed(() => vm.settings.value?.currency || 'TZS');

// State
const purchases = ref<Purchase[]>([]);
const suppliers = ref<Supplier[]>([]);
const isLoading = ref(false);

// Filters
const searchQuery = ref('');
const statusFilter = ref('ALL');
const supplierFilter = ref('');
const datePreset = ref<string>('all');
const startDate = ref<string>('');
const endDate = ref<string>('');
const currentPage = ref(1);
const itemsPerPage = 15;

const handleDatePresetChange = () => {
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  
  if (datePreset.value === 'all') {
    startDate.value = '';
    endDate.value = '';
  } else if (datePreset.value === 'today') {
    startDate.value = todayStr;
    endDate.value = todayStr;
  } else if (datePreset.value === 'yesterday') {
    const yest = new Date(now);
    yest.setDate(yest.getDate() - 1);
    const yestStr = `${yest.getFullYear()}-${String(yest.getMonth() + 1).padStart(2, '0')}-${String(yest.getDate()).padStart(2, '0')}`;
    startDate.value = yestStr;
    endDate.value = yestStr;
  } else if (datePreset.value === '7days') {
    const d7 = new Date(now);
    d7.setDate(d7.getDate() - 7);
    const d7Str = `${d7.getFullYear()}-${String(d7.getMonth() + 1).padStart(2, '0')}-${String(d7.getDate()).padStart(2, '0')}`;
    startDate.value = d7Str;
    endDate.value = todayStr;
  } else if (datePreset.value === 'month') {
    const monthStartStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    startDate.value = monthStartStr;
    endDate.value = todayStr;
  }
  
  currentPage.value = 1;
  fetchPurchases();
};

// Details Modal
const showDetailsModal = ref(false);
const selectedPurchase = ref<Purchase | null>(null);

// Reversal Modal
const showReversalModal = ref(false);
const returnQuantity = ref<number>(1);
const selectedReason = ref<string>('Clerical entry mistake');
const customReason = ref<string>('');
const isSubmittingReturn = ref<boolean>(false);

// Helper to safely get first item
const getFirstItem = (p: Purchase): PurchaseItem | null => {
  return p.items && p.items.length > 0 ? (p.items[0] ?? null) : null;
};

// Computed Active Item in selected purchase
const activeItem = computed<PurchaseItem | null>(() => {
  if (!selectedPurchase.value || !selectedPurchase.value.items || selectedPurchase.value.items.length === 0) {
    return null;
  }
  return selectedPurchase.value.items[0] ?? null;
});

// Remaining purchased units that haven't been returned yet
const remainingPurchasedQty = computed(() => {
  if (!activeItem.value || !selectedPurchase.value) return 0;
  const alreadyReturned = selectedPurchase.value.returnedQuantity || 0;
  return Math.max(0, activeItem.value.quantity - alreadyReturned);
});

// Maximum units available to return without causing negative inventory
const maxReturnable = computed(() => {
  if (!activeItem.value) return 0;
  const stockOnHand = activeItem.value.currentStock || 0;
  return Math.max(0, Math.min(remainingPurchasedQty.value, stockOnHand));
});

// Calculated refund amount based on current return quantity
const calculatedRefundAmount = computed(() => {
  if (!activeItem.value) return 0;
  const qty = Number(returnQuantity.value || 0);
  return qty * activeItem.value.unitCost;
});

// Description of financial destination
const moneyDestinationText = computed(() => {
  if (!selectedPurchase.value) return '';
  const refundStr = formatCurrency(calculatedRefundAmount.value, currency.value);
  if (selectedPurchase.value.paymentType === 'CREDIT') {
    return `Supplier Debt Balance reduced by ${refundStr}`;
  }
  return `Automatic PAY_IN into Register #1 (+${refundStr})`;
});

// Filtered Purchases list
const filteredPurchases = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  return purchases.value.filter(p => {
    // 1. Status Filter
    if (statusFilter.value !== 'ALL' && p.status !== statusFilter.value) {
      return false;
    }
    // 2. Supplier Filter
    if (supplierFilter.value && p.supplierId !== supplierFilter.value) {
      return false;
    }
    // 3. Date Range Filter (defense-in-depth & instant local filtering)
    if (startDate.value || endDate.value) {
      if (p.createdAt) {
        const itemDate = new Date(p.createdAt);
        if (startDate.value) {
          const start = new Date(startDate.value + 'T00:00:00');
          if (itemDate < start) return false;
        }
        if (endDate.value) {
          const end = new Date(endDate.value + 'T23:59:59.999');
          if (itemDate > end) return false;
        }
      }
    }
    // 4. Search Query
    if (query) {
      const matchId = p.id.toLowerCase().includes(query);
      const matchSupplier = (p.supplierName || '').toLowerCase().includes(query);
      const matchProduct = p.items?.some(i => i.productName.toLowerCase().includes(query));
      if (!matchId && !matchSupplier && !matchProduct) {
        return false;
      }
    }
    return true;
  });
});

// Pagination
const totalPages = computed(() => Math.ceil(filteredPurchases.value.length / itemsPerPage));
const paginatedPurchases = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return filteredPurchases.value.slice(start, start + itemsPerPage);
});

// KPI Aggregations
const totalPurchasesCount = computed(() => filteredPurchases.value.length);
const summaryTotalCost = computed(() => {
  return filteredPurchases.value.reduce((sum, p) => sum + (Number(p.totalCost) || 0), 0);
});
const summaryCashCost = computed(() => {
  return filteredPurchases.value
    .filter(p => p.paymentType === 'CASH' || p.paymentType === 'TRANSFER')
    .reduce((sum, p) => sum + (Number(p.totalCost) || 0), 0);
});
const summaryCreditCost = computed(() => {
  return filteredPurchases.value
    .filter(p => p.paymentType === 'CREDIT')
    .reduce((sum, p) => sum + (Number(p.totalCost) || 0), 0);
});
const summaryReturnedAmount = computed(() => {
  return filteredPurchases.value.reduce((sum, p) => sum + (Number(p.returnedAmount) || 0), 0);
});
const summaryReturnedQty = computed(() => {
  return filteredPurchases.value.reduce((sum, p) => sum + (Number(p.returnedQuantity) || 0), 0);
});

// Fetch Purchases from backend
const fetchPurchases = async () => {
  const branchId = localStorage.getItem('branchId');
  if (!branchId || branchId === 'null' || branchId === 'undefined') return;

  isLoading.value = true;
  try {
    let url = `/api/purchases?branchId=${branchId}&size=200`;
    if (statusFilter.value && statusFilter.value !== 'ALL') {
      url += `&status=${encodeURIComponent(statusFilter.value)}`;
    }
    if (supplierFilter.value) {
      url += `&supplierId=${encodeURIComponent(supplierFilter.value)}`;
    }
    if (startDate.value && endDate.value && startDate.value === endDate.value) {
      url += `&date=${encodeURIComponent(startDate.value)}`;
    } else {
      if (startDate.value) {
        url += `&startDate=${encodeURIComponent(startDate.value)}`;
      }
      if (endDate.value) {
        url += `&endDate=${encodeURIComponent(endDate.value)}`;
      }
    }

    const data = await api.get<any>(url);
    const rawList: any[] = Array.isArray(data) ? data : (data?.content || []);
    purchases.value = rawList.map(p => ({
      id: p.id,
      branchId: p.branchId,
      branchName: p.branchName || '',
      supplierId: p.supplierId,
      supplierName: p.supplierName || '',
      totalCost: Number(p.totalCost) || 0,
      paymentType: p.paymentType || 'CASH',
      status: p.status || 'COMPLETED',
      returnedQuantity: p.returnedQuantity != null ? Number(p.returnedQuantity) : 0,
      returnedAmount: p.returnedAmount != null ? Number(p.returnedAmount) : 0,
      reversedAt: p.reversedAt,
      reversedById: p.reversedById,
      reversedByName: p.reversedByName,
      reversalReason: p.reversalReason,
      createdAt: p.createdAt,
      items: (p.items || []).map((item: any) => ({
        id: item.id,
        productId: item.productId,
        productName: item.productName || 'Unknown Product',
        quantity: Number(item.quantity) || 0,
        unitCost: Number(item.unitCost) || 0,
        currentStock: Number(item.currentStock) || 0,
        maxReturnableQuantity: Number(item.maxReturnableQuantity) || 0,
        isWholesale: !!item.isWholesale
      }))
    }));
  } catch (err: any) {
    console.error('Failed to load purchases:', err);
    showToast('Failed to load purchases: ' + (err.message || err), 'error');
  } finally {
    isLoading.value = false;
  }
};

// Fetch Suppliers for dropdown
const fetchSuppliers = async () => {
  const storeId = localStorage.getItem('storeId');
  if (!storeId || storeId === 'null' || storeId === 'undefined') return;
  try {
    const data = await api.get<any>(`/api/suppliers?storeId=${storeId}&size=1000`);
    const list: any[] = Array.isArray(data) ? data : (data?.content || []);
    suppliers.value = list;
  } catch (err) {
    console.error('Failed to load suppliers:', err);
  }
};

// Actions
const resetFilters = () => {
  searchQuery.value = '';
  statusFilter.value = 'ALL';
  supplierFilter.value = '';
  datePreset.value = 'all';
  startDate.value = '';
  endDate.value = '';
  currentPage.value = 1;
  fetchPurchases();
};

const openDetailsModal = (purchase: Purchase) => {
  selectedPurchase.value = purchase;
  showDetailsModal.value = true;
};

const openReversalModal = (purchase: Purchase) => {
  selectedPurchase.value = purchase;
  selectedReason.value = 'Clerical entry mistake';
  customReason.value = '';

  const item = getFirstItem(purchase);
  if (item) {
    const stockOnHand = item.currentStock || 0;
    const remainingPurchased = Math.max(0, item.quantity - (purchase.returnedQuantity || 0));
    const available = Math.max(0, Math.min(remainingPurchased, stockOnHand));
    returnQuantity.value = available > 0 ? available : 1;
  } else {
    returnQuantity.value = 1;
  }

  showReversalModal.value = true;
};

const handleConfirmReturn = async () => {
  if (!selectedPurchase.value || !activeItem.value) return;
  const qty = Number(returnQuantity.value || 0);
  if (qty <= 0) {
    showToast('Please specify a return quantity greater than zero.', 'error');
    return;
  }
  if (qty > maxReturnable.value) {
    showToast(`Return quantity exceeds maximum available units on shelf (${maxReturnable.value} units).`, 'error');
    return;
  }

  const reason = selectedReason.value === 'Other'
    ? (customReason.value.trim() || 'Purchase return / reversal')
    : selectedReason.value;

  isSubmittingReturn.value = true;
  try {
    const res = await api.post(`/api/purchases/${selectedPurchase.value.id}/return`, {
      returnQuantity: qty,
      reason
    });
    showToast(res.message || 'Purchase returned successfully', 'success');
    showReversalModal.value = false;
    await fetchPurchases();
    vm.fetchProducts().catch(() => {});
  } catch (err: any) {
    console.error('Failed to reverse purchase:', err);
    showToast(err.message || 'Failed to reverse purchase', 'error');
  } finally {
    isSubmittingReturn.value = false;
  }
};

// Check if reverse button should be disabled on a row
const isReverseDisabled = (p: Purchase): boolean => {
  if (p.status === 'REVERSED') return true;
  const item = getFirstItem(p);
  if (!item) return true;
  const stockOnHand = item.currentStock || 0;
  const remainingPurchased = item.quantity - (p.returnedQuantity || 0);
  return Math.min(remainingPurchased, stockOnHand) <= 0;
};

const getReverseButtonTooltip = (p: Purchase): string => {
  if (p.status === 'REVERSED') return 'Purchase has already been fully reversed';
  const item = getFirstItem(p);
  if (!item) return 'No items in purchase';
  if ((item.currentStock || 0) <= 0) return 'No stock remaining on hand to return';
  return 'Return / reverse purchased stock';
};

// Styling helpers
const formatDateTime = (dateStr?: string | null) => {
  if (!dateStr) return 'N/A';
  try {
    return new Date(dateStr).toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateStr;
  }
};

const formatStatusLabel = (status: string) => {
  switch (status) {
    case 'COMPLETED': return 'Completed';
    case 'PARTIALLY_RETURNED': return 'Partially Returned';
    case 'REVERSED': return 'Reversed';
    default: return status;
  }
};

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'COMPLETED':
      return 'bg-emerald-100 text-emerald-800 border border-emerald-300';
    case 'PARTIALLY_RETURNED':
      return 'bg-amber-100 text-amber-800 border border-amber-300';
    case 'REVERSED':
      return 'bg-error/15 text-error border border-error/30';
    default:
      return 'bg-surface-container text-on-surface-variant';
  }
};

const getPaymentBadgeClass = (type?: string) => {
  switch (type) {
    case 'CREDIT':
      return 'bg-amber-500/15 text-amber-800 border border-amber-500/30';
    case 'TRANSFER':
      return 'bg-blue-500/15 text-blue-800 border border-blue-500/30';
    case 'CASH':
    default:
      return 'bg-emerald-500/15 text-emerald-800 border border-emerald-500/30';
  }
};

const getStockBadgeClass = (item: PurchaseItem) => {
  if (item.currentStock <= 0) {
    return 'bg-error-container text-error font-mono';
  }
  if (item.currentStock < item.quantity) {
    return 'bg-amber-100 text-amber-900 font-mono';
  }
  return 'bg-primary-container/40 text-primary font-mono';
};

onMounted(() => {
  fetchPurchases();
  fetchSuppliers();
});
</script>
