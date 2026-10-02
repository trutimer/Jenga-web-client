<template>
  <div class="flex flex-col gap-6 w-full animate-fade-in font-sans relative select-none">
    <!-- Toast Notification -->
    <Toast 
      :message="toastMessage" 
      :type="toastType" 
      @close="toastMessage = null" 
    />

    <!-- HEADER BAR -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl md:text-3xl font-black text-primary tracking-tight">{{ $t('suppliers.title') }}</h1>
        <p class="text-sm text-on-surface-variant font-medium mt-1">
          {{ $t('suppliers.subtitle') }}
        </p>
      </div>

      <div class="flex items-center gap-3 shrink-0">
        <button 
          @click="handleExportCSV"
          class="h-11 px-5 rounded-xl border border-outline-variant text-on-surface hover:bg-surface-container-high active:scale-[0.98] font-bold text-sm flex items-center gap-2 cursor-pointer transition-all bg-white"
        >
          <Download class="w-4 h-4" />
          <span>{{ $t('common.export') }}</span>
        </button>
        
        <button 
          v-if="vm.hasPermission('suppliers:create')"
          @click="showAddModal = true"
          class="h-11 px-5 rounded-xl bg-primary text-on-primary hover:bg-opacity-95 active:scale-[0.98] font-bold text-sm flex items-center gap-2 cursor-pointer transition-all shadow-sm"
        >
          <Plus class="w-4 h-4" />
          <span>{{ $t('suppliers.addNewSupplier') }}</span>
        </button>
      </div>
    </div>

    <!-- SEARCH & FILTERS CONTAINER -->
    <div class="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant flex flex-col md:flex-row items-center gap-4 shadow-xs">
      <div class="relative w-full md:flex-1">
        <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/50 w-5 h-5" />
        <input 
          type="text"
          v-model="searchQuery"
          :placeholder="$t('suppliers.searchPlaceholder')"
          class="w-full h-11 pl-11 pr-4 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:border-primary text-sm transition-all text-on-surface placeholder:text-on-surface-variant/40"
        />
      </div>

      <div class="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
        <!-- Category Dropdown -->
        <div class="relative w-full sm:w-44 shrink-0">
          <select
            v-model="selectedCategory"
            class="w-full h-11 px-3.5 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:border-primary text-sm font-semibold appearance-none cursor-pointer text-on-surface"
          >
            <option value="All">{{ $t('suppliers.allCategories') }}</option>
            <option v-for="cat in categoriesList" :key="cat" :value="cat">{{ cat }}</option>
          </select>
          <div class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant/60 text-xs font-bold font-mono">▼</div>
        </div>

        <!-- Status Dropdown -->
        <div class="relative w-full sm:w-36 shrink-0">
          <select
            v-model="selectedStatus"
            class="w-full h-11 px-3.5 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:border-primary text-sm font-semibold appearance-none cursor-pointer text-on-surface"
          >
            <option value="All">{{ $t('suppliers.allStatus') }}</option>
            <option value="Active">{{ $t('common.active') }}</option>
            <option value="Inactive">{{ $t('common.inactive') }}</option>
          </select>
          <div class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant/60 text-xs font-bold font-mono">▼</div>
        </div>

        <!-- Reset Filters button -->
        <button
          v-if="searchQuery || selectedCategory !== 'All' || selectedStatus !== 'All'"
          @click="resetFilters"
          class="h-11 px-4 rounded-xl text-primary border border-primary/20 hover:bg-primary/5 text-sm font-bold flex items-center gap-1.5 cursor-pointer shrink-0 transition-all bg-white"
          :title="$t('suppliers.resetFilters')"
        >
          <FilterIcon class="w-4 h-4" />
          <span>{{ $t('common.reset') }}</span>
        </button>
      </div>
    </div>

    <!-- SUPPLIERS TABLE -->
    <div class="rounded-2xl border border-outline-variant bg-surface-container-lowest overflow-hidden shadow-xs relative min-h-[360px]">
      <JengaLoader 
        v-if="vm.isFetchingSuppliers.value" 
        overlay 
        size="lg" 
        :label="$t('suppliers.loaderTitle')" 
        :sublabel="$t('suppliers.loaderSubtitle')" 
      />
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-surface-container-low border-b border-outline-variant text-[11px] font-mono font-bold text-on-surface-variant uppercase tracking-wider">
              <th class="py-4.5 px-6 min-w-[220px]">{{ $t('suppliers.tableSupplierName') }}</th>
              <th class="py-4.5 px-6 min-w-[150px]">{{ $t('suppliers.tableContactPerson') }}</th>
              <th class="py-4.5 px-6 min-w-[220px]">{{ $t('suppliers.tablePhoneEmail') }}</th>
              <th class="py-4.5 px-6 min-w-[120px]">{{ $t('suppliers.tableCategory') }}</th>
              <th class="py-4.5 px-6 min-w-[160px]">{{ $t('suppliers.tableBalance') }}</th>
              <th class="py-4.5 px-6 min-w-[110px]">{{ $t('suppliers.tableStatus') }}</th>
              <th class="py-4.5 px-6 w-[80px] text-center">{{ $t('suppliers.tableActions') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-outline-variant/60">
            <tr 
              v-for="supplier in paginatedSuppliers"
              :key="supplier.id"
              class="hover:bg-surface-container-low/50 transition-colors duration-150 text-sm align-middle"
            >
              <!-- Supplier Name & Badge -->
              <td class="py-4 px-6">
                <div class="flex items-center gap-3.5">
                  <div class="w-10 h-10 rounded-full border flex items-center justify-center font-bold text-xs shrink-0 select-none shadow-xs" :class="getAvatarColor(supplier.name)">
                    {{ getInitials(supplier.name) }}
                  </div>
                  <div class="min-w-0">
                    <p class="font-bold text-on-surface leading-snug truncate">{{ supplier.name }}</p>
                    <p class="text-[10px] font-mono font-semibold text-on-surface-variant/60 uppercase tracking-widest mt-0.5">{{ supplier.code }}</p>
                  </div>
                </div>
              </td>

              <!-- Contact Person -->
              <td class="py-4 px-6 text-on-surface font-medium">
                {{ supplier.contactPerson }}
              </td>

              <!-- Phone & Email -->
              <td class="py-4 px-6">
                <p class="font-semibold text-on-surface font-mono text-[13px]">{{ supplier.phone }}</p>
                <p class="text-xs text-on-surface-variant/70 mt-0.5 truncate max-w-[200px]" :title="supplier.email">{{ supplier.email }}</p>
              </td>

              <!-- Category Pill -->
              <td class="py-4 px-6">
                <span class="inline-flex items-center px-2.5 py-0.8 rounded-full text-xs font-semibold bg-surface-container-high text-on-surface border border-outline-variant/30 select-none">
                  {{ supplier.category }}
                </span>
              </td>

              <!-- Outstanding Balance -->
              <td class="py-4 px-6 font-mono">
                <div class="flex flex-col">
                  <span class="text-[13px] font-bold" :class="supplier.balance > 100000 ? 'text-error' : 'text-on-surface'">
                    TZS {{ supplier.balance.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
                  </span>
                  <span v-if="supplier.balance > 100000" class="text-[9px] text-error font-extrabold tracking-wider uppercase mt-0.5">
                    {{ $t('suppliers.highBalance') }}
                  </span>
                </div>
              </td>

              <!-- Status badge -->
              <td class="py-4 px-6">
                <span 
                  class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border select-none"
                  :class="supplier.status === 'Active'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-100'
                    : 'bg-surface-container-high text-on-surface-variant/60 border-outline-variant/40'"
                >
                  <span class="w-1.5 h-1.5 rounded-full" :class="supplier.status === 'Active' ? 'bg-emerald-500' : 'bg-on-surface-variant/40'" />
                  <span>{{ supplier.status }}</span>
                </span>
              </td>

              <!-- Actions -->
              <td class="py-4 px-6 text-center">
                <div class="flex items-center justify-center gap-1">
                  <button
                    @click="handleOpenHistoryModal(supplier)"
                    class="p-2 rounded-lg text-on-surface-variant/70 hover:text-primary hover:bg-surface-container-high active:scale-95 transition-all cursor-pointer bg-transparent border-0"
                    :title="$t('suppliers.viewProcurementHistory')"
                  >
                    <FileText class="w-4.5 h-4.5" />
                  </button>

                  <button
                    @click="handleOpenEditModal(supplier)"
                    class="p-2 rounded-lg text-on-surface-variant/70 hover:text-primary hover:bg-surface-container-high active:scale-95 transition-all cursor-pointer bg-transparent border-0"
                    :title="$t('suppliers.editSupplier')"
                  >
                    <Pencil class="w-4.5 h-4.5" />
                  </button>

                  <button
                    @click="handleOpenPayModal(supplier)"
                    class="p-2 rounded-lg text-on-surface-variant/70 hover:text-emerald-600 hover:bg-emerald-50 active:scale-95 transition-all cursor-pointer bg-transparent border-0"
                    :title="$t('suppliers.payBalance')"
                  >
                    <Banknote class="w-4.5 h-4.5" />
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="filteredSuppliers.length === 0">
              <td colSpan="7" class="py-12 px-6 text-center">
                <div class="flex flex-col items-center justify-center gap-2">
                  <AlertCircle class="w-8 h-8 text-on-surface-variant/30" />
                  <p class="text-sm font-bold text-on-surface-variant">{{ $t('suppliers.noSuppliersFound') }}</p>
                  <p class="text-xs text-on-surface-variant/60">{{ $t('suppliers.noSuppliersFoundDesc') }}</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- PAGINATION FOOTER -->
      <div v-if="filteredSuppliers.length > 0" class="py-4 px-6 border-t border-outline-variant bg-surface-container-low flex flex-col sm:flex-row items-center justify-between gap-4 select-none">
        <span class="text-xs font-semibold text-on-surface-variant">
          {{ $t('suppliers.showingCount', {
            from: Math.min(filteredSuppliers.length, (currentPage - 1) * itemsPerPage + 1),
            to: Math.min(filteredSuppliers.length, currentPage * itemsPerPage),
            total: filteredSuppliers.length
          }) }}
        </span>

        <!-- Pagination buttons & Jump to page -->
        <div class="flex flex-wrap items-center gap-2 font-sans">
          <!-- First & Prev Page -->
          <div class="flex items-center gap-1">
            <button 
              :disabled="currentPage === 1"
              @click="currentPage = 1"
              class="w-8 h-8 rounded-lg border border-outline-variant flex items-center justify-center hover:bg-surface-container-high transition-colors disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer bg-white"
              :title="$t('inventory.paginationFirst')"
            >
              <ChevronsLeft class="w-4 h-4 text-on-surface-variant" />
            </button>

            <button 
              :disabled="currentPage === 1"
              @click="currentPage = Math.max(1, currentPage - 1)"
              class="w-8 h-8 rounded-lg border border-outline-variant flex items-center justify-center hover:bg-surface-container-high transition-colors disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer bg-white"
              :title="$t('inventory.paginationPrev')"
            >
              <ChevronLeft class="w-4 h-4 text-on-surface-variant" />
            </button>
          </div>

          <!-- Scrollable Windowed Page Buttons -->
          <div class="flex items-center gap-1 overflow-x-auto max-w-[280px] sm:max-w-[360px] md:max-w-[420px] py-1 px-0.5 no-scrollbar scroll-smooth">
            <template v-for="(pg, idx) in visiblePages" :key="idx">
              <span 
                v-if="pg === '...'" 
                class="w-8 h-8 flex items-center justify-center text-xs font-bold text-on-surface-variant/60 select-none shrink-0"
              >
                ...
              </span>
              <button
                v-else
                @click="currentPage = Number(pg)"
                class="w-8 h-8 rounded-lg border flex items-center justify-center text-xs font-bold transition-all cursor-pointer shrink-0"
                :class="currentPage === pg ? 'bg-primary border-primary text-on-primary shadow-xs' : 'bg-white border-outline-variant text-on-surface hover:bg-surface-container-high'"
              >
                {{ pg }}
              </button>
            </template>
          </div>

          <!-- Next & Last Page -->
          <div class="flex items-center gap-1">
            <button 
              :disabled="currentPage === totalPages"
              @click="currentPage = Math.min(totalPages, currentPage + 1)"
              class="w-8 h-8 rounded-lg border border-outline-variant flex items-center justify-center hover:bg-surface-container-high transition-colors disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer bg-white"
              :title="$t('inventory.paginationNext')"
            >
              <ChevronRight class="w-4 h-4 text-on-surface-variant" />
            </button>

            <button 
              :disabled="currentPage === totalPages"
              @click="currentPage = totalPages"
              class="w-8 h-8 rounded-lg border border-outline-variant flex items-center justify-center hover:bg-surface-container-high transition-colors disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer bg-white"
              :title="$t('inventory.paginationLast')"
            >
              <ChevronsRight class="w-4 h-4 text-on-surface-variant" />
            </button>
          </div>

          <!-- Jump to page input -->
          <div class="flex items-center gap-1.5 ml-2 border-l border-outline-variant/60 pl-3 text-xs text-on-surface-variant">
            <span>{{ $t('inventory.paginationJumpTo') }}</span>
            <input 
              type="number" 
              :min="1" 
              :max="totalPages"
              :value="currentPage"
              @change="handleJumpPage"
              @keyup.enter="handleJumpPage"
              class="w-12 h-8 text-center bg-white border border-outline-variant rounded-lg text-xs font-bold outline-none focus:border-primary text-on-surface font-mono"
            />
            <span>{{ $t('inventory.paginationOfTotal', { total: totalPages }) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL: ADD NEW SUPPLIER -->
    <Modal
      :isOpen="showAddModal"
      @close="showAddModal = false"
      :title="$t('suppliers.addModalTitle')"
      :subtitle="$t('suppliers.addModalSubtitle')"
    >
      <form id="add-supplier-form" @submit.prevent="handleAddSupplier" class="flex flex-col gap-4">
        <!-- Grid for Supplier Name & Contact Person -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- Supplier Name -->
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{{ $t('suppliers.supplierNameRequired') }}</label>
            <input
              type="text"
              required
              v-model="newSupplierName"
              placeholder="E.g. Unilever Tanzania"
              class="h-11 px-3.5 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:border-primary text-sm text-on-surface"
            />
          </div>

          <!-- Contact Person (Optional) -->
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{{ $t('suppliers.contactPerson') }}</label>
            <input
              type="text"
              v-model="newContactPerson"
              placeholder="Contact person name (Optional)"
              class="h-11 px-3.5 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:border-primary text-sm text-on-surface"
            />
          </div>
        </div>

        <!-- Grid for Contact Info -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- Phone -->
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{{ $t('suppliers.phoneNumberRequired') }}</label>
            <input
              type="text"
              required
              v-model="newPhone"
              placeholder="+255..."
              class="h-11 px-3.5 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:border-primary text-sm font-mono text-on-surface"
            />
          </div>

          <!-- Email (Optional) -->
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{{ $t('suppliers.emailAddress') }}</label>
            <input
              type="email"
              v-model="newEmail"
              placeholder="supplier@example.com (Optional)"
              class="h-11 px-3.5 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:border-primary text-sm text-on-surface"
            />
          </div>
        </div>

        <!-- Grid for Category & Initial Outstanding Balance -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- Category Select -->
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{{ $t('suppliers.categoryRequired') }}</label>
            <div class="relative">
              <select
                v-model="newCategory"
                class="w-full h-11 px-3.5 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:border-primary text-sm font-semibold appearance-none cursor-pointer text-on-surface"
              >
                <option value="Beverage">Beverage</option>
                <option value="Wholesale">Wholesale</option>
                <option value="FMCG">FMCG</option>
                <option value="Electronics">Electronics</option>
                <option value="Bakery">Bakery</option>
                <option value="Grocery">Grocery</option>
                <option value="Household">Household</option>
                <option value="Dairy Products">Dairy Products</option>
                <option value="Snacks">Snacks</option>
              </select>
              <div class="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant/60 text-[10px]">▼</div>
            </div>
          </div>

          <!-- Initial Outstanding Balance -->
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{{ $t('suppliers.balanceWithCurrency', { currency: 'TZS' }) }}</label>
            <div class="relative">
              <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold font-mono text-on-surface-variant/50">TZS</span>
              <input
                type="number"
                step="0.01"
                min="0"
                v-model="newBalance"
                placeholder="0.00"
                class="w-full h-11 pl-12 pr-4 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:border-primary text-sm font-mono text-on-surface"
              />
            </div>
          </div>
        </div>
      </form>
      <template #footer>
        <button
          type="button"
          @click="showAddModal = false"
          class="h-11 px-5 rounded-xl border border-outline-variant text-on-surface hover:bg-surface-container-high font-bold text-sm cursor-pointer transition-all active:scale-[0.98] bg-white"
        >
          {{ $t('common.cancel') }}
        </button>
        <button
          type="submit"
          form="add-supplier-form"
          class="h-11 px-6 bg-primary text-on-primary hover:bg-opacity-95 font-bold text-sm rounded-xl cursor-pointer transition-all active:scale-[0.98] shadow-sm border-0"
        >
          {{ $t('suppliers.saveSupplier') }}
        </button>
      </template>
    </Modal>

    <!-- MODAL: PROCUREMENT HISTORY & PAYMENT HISTORY -->
    <Modal
      v-if="selectedSupplierForHistory"
      :isOpen="showHistoryModal"
      @close="showHistoryModal = false"
      :title="selectedSupplierForHistory.name"
      :subtitle="$t('suppliers.historyModalSubtitle', { code: selectedSupplierForHistory.code })"
      maxWidth="max-w-4xl"
    >
      <div class="flex flex-col gap-5">
        <!-- Financial Snapshot Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <!-- Outstanding Balance Card -->
          <div class="p-4 rounded-xl border border-outline-variant/60 bg-surface-container-low/50 flex flex-col justify-between">
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">{{ $t('suppliers.outstandingBalance') }}</span>
              <div class="w-7 h-7 rounded-lg bg-error/10 text-error flex items-center justify-center">
                <Coins class="w-4 h-4" />
              </div>
            </div>
            <div class="mt-2 flex items-baseline justify-between gap-2">
              <span class="text-base font-bold font-mono" :class="selectedSupplierForHistory.balance > 0 ? 'text-error' : 'text-on-surface'">
                TZS {{ selectedSupplierForHistory.balance.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
              </span>
              <button
                v-if="selectedSupplierForHistory.balance > 0"
                @click="openPayModalFromHistory"
                class="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-all active:scale-95 shadow-xs border-0 shrink-0"
              >
                <Banknote class="w-3.5 h-3.5" />
                <span>{{ $t('suppliers.payBalance') }}</span>
              </button>
            </div>
          </div>

          <!-- Total Payments Settled Card -->
          <div class="p-4 rounded-xl border border-outline-variant/60 bg-surface-container-low/50 flex flex-col justify-between">
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">{{ $t('suppliers.totalPaymentsSettled') }}</span>
              <div class="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-700 flex items-center justify-center">
                <CheckCircle2 class="w-4 h-4" />
              </div>
            </div>
            <div class="mt-2">
              <p class="text-base font-bold font-mono text-emerald-800">
                TZS {{ totalCompletedPaymentsAmount.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
              </p>
              <p class="text-[10px] text-on-surface-variant/70 font-semibold mt-0.5">
                {{ paymentHistoryTotal }} {{ $t('suppliers.tabPaymentHistory').toLowerCase() }}
              </p>
            </div>
          </div>

          <!-- Total Orders / Procurement Card -->
          <div class="p-4 rounded-xl border border-outline-variant/60 bg-surface-container-low/50 flex flex-col justify-between">
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">{{ $t('suppliers.totalContractValue') }}</span>
              <div class="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Package class="w-4 h-4" />
              </div>
            </div>
            <div class="mt-2">
              <p class="text-base font-bold font-mono text-primary">
                TZS {{ totalPurchasesAmount.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
              </p>
              <p class="text-[10px] text-on-surface-variant/70 font-semibold mt-0.5">
                {{ purchasesTotalCount }} {{ $t('suppliers.tabProcurementOrders').toLowerCase() }}
              </p>
            </div>
          </div>
        </div>

        <!-- TABS SELECTOR -->
        <div class="flex border-b border-outline-variant">
          <button
            type="button"
            @click="activeHistoryTab = 'PAYMENTS'"
            class="px-4 py-2.5 font-bold text-xs flex items-center gap-2 border-b-2 cursor-pointer transition-colors"
            :class="activeHistoryTab === 'PAYMENTS' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-on-surface-variant hover:text-on-surface'"
          >
            <Banknote class="w-4 h-4" />
            <span>{{ $t('suppliers.tabPaymentHistory') }}</span>
            <span class="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-surface-container-high text-on-surface-variant">
              {{ paymentHistoryTotal }}
            </span>
          </button>
          
          <button
            type="button"
            @click="activeHistoryTab = 'PURCHASES'"
            class="px-4 py-2.5 font-bold text-xs flex items-center gap-2 border-b-2 cursor-pointer transition-colors"
            :class="activeHistoryTab === 'PURCHASES' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-on-surface-variant hover:text-on-surface'"
          >
            <Package class="w-4 h-4" />
            <span>{{ $t('suppliers.tabProcurementOrders') }}</span>
            <span class="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-surface-container-high text-on-surface-variant">
              {{ purchasesTotalCount }}
            </span>
          </button>
        </div>

        <!-- TAB 1: PAYMENT HISTORY TABLE -->
        <div v-if="activeHistoryTab === 'PAYMENTS'" class="relative min-h-[220px]">
          <JengaLoader 
            v-if="isLoadingPaymentHistory" 
            overlay 
            size="md" 
            label="Loading payments..." 
          />

          <div v-if="paymentHistory.length > 0" class="border border-outline-variant rounded-xl overflow-hidden bg-surface-container-lowest">
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs border-collapse">
                <thead>
                  <tr class="bg-surface-container-low border-b border-outline-variant text-[10px] font-mono font-bold text-on-surface-variant uppercase tracking-wider">
                    <th class="py-3 px-3.5">{{ $t('suppliers.paymentNumber') }}</th>
                    <th class="py-3 px-3.5">{{ $t('suppliers.paymentDate') }}</th>
                    <th class="py-3 px-3.5">{{ $t('suppliers.paymentMethod') }}</th>
                    <th class="py-3 px-3.5">{{ $t('suppliers.referenceNumber') }}</th>
                    <th class="py-3 px-3.5">{{ $t('suppliers.tableBalance') }}</th>
                    <th class="py-3 px-3.5 text-center">{{ $t('suppliers.status') }}</th>
                    <th class="py-3 px-3.5">{{ $t('suppliers.paidBy') }}</th>
                    <th class="py-3 px-3.5">{{ $t('suppliers.notes') }}</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-outline-variant/50">
                  <tr v-for="payment in paymentHistory" :key="payment.id" class="hover:bg-surface-container-low/30 transition-colors font-medium text-on-surface align-middle">
                    <td class="py-3 px-3.5 font-bold font-mono text-primary">{{ payment.paymentNumber }}</td>
                    <td class="py-3 px-3.5 font-mono text-[11px] text-on-surface-variant">{{ formatDateTime(payment.paymentDate || payment.createdAt) }}</td>
                    <td class="py-3 px-3.5">
                      <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold bg-surface-container-high border border-outline-variant/40">
                        <component :is="getPaymentMethodIcon(payment.paymentMethod)" class="w-3.5 h-3.5 text-on-surface-variant" />
                        <span>{{ getPaymentMethodLabel(payment.paymentMethod) }}</span>
                      </span>
                    </td>
                    <td class="py-3 px-3.5 font-mono text-[11px] text-on-surface-variant">{{ payment.referenceNumber || '-' }}</td>
                    <td class="py-3 px-3.5 font-bold font-mono text-emerald-700">
                      TZS {{ Number(payment.amount).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
                    </td>
                    <td class="py-3 px-3.5 text-center">
                      <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border select-none" :class="getPaymentStatusBadgeClass(payment.status)">
                        {{ payment.status }}
                      </span>
                    </td>
                    <td class="py-3 px-3.5 text-[11px] text-on-surface-variant">{{ payment.paidByName || '-' }}</td>
                    <td class="py-3 px-3.5 text-[11px] text-on-surface-variant/80 max-w-[160px] truncate" :title="payment.notes || ''">
                      {{ payment.notes || '-' }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Payments Pagination -->
            <div v-if="paymentHistoryTotalPages > 1" class="py-2.5 px-4 border-t border-outline-variant bg-surface-container-low flex items-center justify-between text-xs">
              <span class="text-on-surface-variant font-medium">
                Page {{ paymentHistoryPage + 1 }} of {{ paymentHistoryTotalPages }} ({{ paymentHistoryTotal }} total)
              </span>
              <div class="flex items-center gap-1">
                <button
                  type="button"
                  :disabled="paymentHistoryPage === 0"
                  @click="fetchSupplierPaymentHistory(selectedSupplierForHistory.id, paymentHistoryPage - 1)"
                  class="px-2.5 py-1 rounded-lg border border-outline-variant bg-white disabled:opacity-40 hover:bg-surface-container-high text-xs font-bold cursor-pointer transition-all"
                >
                  Previous
                </button>
                <button
                  type="button"
                  :disabled="paymentHistoryPage >= paymentHistoryTotalPages - 1"
                  @click="fetchSupplierPaymentHistory(selectedSupplierForHistory.id, paymentHistoryPage + 1)"
                  class="px-2.5 py-1 rounded-lg border border-outline-variant bg-white disabled:opacity-40 hover:bg-surface-container-high text-xs font-bold cursor-pointer transition-all"
                >
                  Next
                </button>
              </div>
            </div>
          </div>

          <!-- Empty payments -->
          <div v-else-if="!isLoadingPaymentHistory" class="p-8 border border-dashed border-outline-variant rounded-xl flex flex-col items-center justify-center gap-3 text-center bg-surface-container-lowest">
            <div class="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant/40">
              <Receipt class="w-6 h-6" />
            </div>
            <div>
              <p class="text-sm font-bold text-on-surface">{{ $t('suppliers.noPaymentsFound') }}</p>
              <p class="text-xs text-on-surface-variant/70 mt-0.5">Payments made against outstanding vendor balances will appear here with full ledger audits.</p>
            </div>
            <button
              v-if="selectedSupplierForHistory.balance > 0"
              @click="openPayModalFromHistory"
              class="h-9 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all shadow-xs border-0 mt-1"
            >
              <Banknote class="w-4 h-4" />
              <span>{{ $t('suppliers.recordFirstPayment') }}</span>
            </button>
          </div>
        </div>

        <!-- TAB 2: PROCUREMENT ORDERS TABLE -->
        <div v-if="activeHistoryTab === 'PURCHASES'" class="relative min-h-[220px]">
          <JengaLoader 
            v-if="isLoadingPurchases" 
            overlay 
            size="md" 
            label="Loading purchases..." 
          />

          <div v-if="supplierPurchases.length > 0" class="border border-outline-variant rounded-xl overflow-hidden bg-surface-container-lowest">
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs border-collapse">
                <thead>
                  <tr class="bg-surface-container-low border-b border-outline-variant text-[10px] font-mono font-bold text-on-surface-variant uppercase tracking-wider">
                    <th class="py-3 px-4">PO / Invoice #</th>
                    <th class="py-3 px-4">Date</th>
                    <th class="py-3 px-4 text-center">Items</th>
                    <th class="py-3 px-4">Total Cost</th>
                    <th class="py-3 px-4 text-center">Payment Type</th>
                    <th class="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-outline-variant/50">
                  <tr v-for="po in supplierPurchases" :key="po.id" class="hover:bg-surface-container-low/30 transition-colors font-medium text-on-surface align-middle">
                    <td class="py-3 px-4 font-bold font-mono text-primary">{{ po.id.slice(0, 8).toUpperCase() }}</td>
                    <td class="py-3 px-4 font-mono text-on-surface-variant/85">{{ formatDateTime(po.createdAt) }}</td>
                    <td class="py-3 px-4 text-center font-mono">{{ po.items?.length || 0 }} items</td>
                    <td class="py-3 px-4 font-bold font-mono">TZS {{ Number(po.totalCost || 0).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</td>
                    <td class="py-3 px-4 text-center">
                      <span class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-surface-container-high border border-outline-variant/40">
                        {{ po.paymentType || 'CASH' }}
                      </span>
                    </td>
                    <td class="py-3 px-4 text-center">
                      <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold select-none" :class="getPoStatusClass(po.status)">
                        {{ po.status }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Empty purchases -->
          <div v-else-if="!isLoadingPurchases" class="p-8 border border-dashed border-outline-variant rounded-xl flex flex-col items-center justify-center gap-3 text-center bg-surface-container-lowest">
            <div class="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant/40">
              <Package class="w-6 h-6" />
            </div>
            <div>
              <p class="text-sm font-bold text-on-surface">{{ $t('suppliers.noPurchasesFound') }}</p>
              <p class="text-xs text-on-surface-variant/70 mt-0.5">Purchases recorded for this vendor through product inventory restocks will appear here.</p>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <button
          type="button"
          @click="showHistoryModal = false"
          class="h-10 px-5 rounded-lg bg-primary text-on-primary hover:bg-opacity-95 font-bold text-xs cursor-pointer transition-all active:scale-[0.98] border-0"
        >
          {{ $t('suppliers.closeLogs') }}
        </button>
      </template>
    </Modal>

    <!-- MODAL: EDIT SUPPLIER -->
    <Modal
      v-if="selectedSupplierForEdit"
      :isOpen="showEditModal"
      @close="showEditModal = false"
      :title="$t('suppliers.editModalTitle')"
      :subtitle="$t('suppliers.editModalSubtitle')"
    >
      <form id="edit-supplier-form" @submit.prevent="handleEditSupplier" class="flex flex-col gap-4">
        <!-- Grid for Supplier Name & Contact Person -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- Supplier Name -->
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{{ $t('suppliers.supplierNameRequired') }}</label>
            <input
              type="text"
              required
              v-model="editSupplierName"
              placeholder="Supplier Name"
              class="h-11 px-3.5 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:border-primary text-sm text-on-surface"
            />
          </div>

          <!-- Contact Person (Optional) -->
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{{ $t('suppliers.contactPerson') }}</label>
            <input
              type="text"
              v-model="editContactPerson"
              placeholder="Contact person name (Optional)"
              class="h-11 px-3.5 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:border-primary text-sm text-on-surface"
            />
          </div>
        </div>

        <!-- Grid for Contact Info -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- Phone -->
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{{ $t('suppliers.phoneNumberRequired') }}</label>
            <input
              type="text"
              required
              v-model="editPhone"
              placeholder="Phone number"
              class="h-11 px-3.5 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:border-primary text-sm font-mono text-on-surface"
            />
          </div>

          <!-- Email (Optional) -->
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{{ $t('suppliers.emailAddress') }}</label>
            <input
              type="email"
              v-model="editEmail"
              placeholder="Email address (Optional)"
              class="h-11 px-3.5 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:border-primary text-sm text-on-surface"
            />
          </div>
        </div>

        <!-- Grid for Category & Outstanding Balance -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- Category Select -->
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{{ $t('suppliers.categoryRequired') }}</label>
            <div class="relative">
              <select
                v-model="editCategory"
                class="w-full h-11 px-3.5 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:border-primary text-sm font-semibold appearance-none cursor-pointer text-on-surface"
              >
                <option value="Beverage">Beverage</option>
                <option value="Wholesale">Wholesale</option>
                <option value="FMCG">FMCG</option>
                <option value="Electronics">Electronics</option>
                <option value="Bakery">Bakery</option>
                <option value="Grocery">Grocery</option>
                <option value="Household">Household</option>
                <option value="Dairy Products">Dairy Products</option>
                <option value="Snacks">Snacks</option>
              </select>
              <div class="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant/60 text-[10px]">▼</div>
            </div>
          </div>

          <!-- Outstanding Balance -->
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{{ $t('suppliers.balanceWithCurrency', { currency: 'TZS' }) }}</label>
            <div class="relative">
              <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold font-mono text-on-surface-variant/50">TZS</span>
              <input
                type="number"
                step="0.01"
                min="0"
                v-model="editBalance"
                placeholder="0.00"
                class="w-full h-11 pl-12 pr-4 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:border-primary text-sm font-mono text-on-surface"
              />
            </div>
          </div>
        </div>
      </form>
      <template #footer>
        <button
          type="button"
          @click="showEditModal = false"
          class="h-11 px-5 rounded-xl border border-outline-variant text-on-surface hover:bg-surface-container-high font-bold text-sm cursor-pointer transition-all active:scale-[0.98] bg-white"
        >
          {{ $t('common.cancel') }}
        </button>
        <button
          type="submit"
          form="edit-supplier-form"
          class="h-11 px-6 bg-primary text-on-primary hover:bg-opacity-95 font-bold text-sm rounded-xl cursor-pointer transition-all active:scale-[0.98] shadow-sm border-0"
        >
          {{ $t('suppliers.updateSupplier') }}
        </button>
      </template>
    </Modal>

    <!-- MODAL: PAY OUTSTANDING BALANCE -->
    <Modal
      v-if="selectedSupplierForPay"
      :isOpen="showPayModal"
      @close="showPayModal = false"
      :title="$t('suppliers.payModalTitle')"
      :subtitle="$t('suppliers.payModalSubtitle', { name: selectedSupplierForPay.name })"
      maxWidth="max-w-lg"
    >
      <form id="pay-supplier-form" @submit.prevent="handlePaySupplier" class="flex flex-col gap-4">
        <!-- Outstanding Balance Display -->
        <div class="p-4 rounded-xl border border-outline-variant/60 bg-surface-container-low/50 flex items-center justify-between">
          <div>
            <p class="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">{{ $t('suppliers.currentOutstandingBalance') }}</p>
            <p class="text-xl font-bold font-mono text-error mt-0.5">TZS {{ selectedSupplierForPay.balance.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</p>
          </div>
          <div class="w-10 h-10 rounded-xl bg-error/10 text-error flex items-center justify-center">
            <Coins class="w-5 h-5" />
          </div>
        </div>

        <!-- Payment Amount input -->
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{{ $t('suppliers.paymentAmountRequired', { currency: 'TZS' }) }}</label>
          <div class="relative">
            <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold font-mono text-on-surface-variant/50">TZS</span>
            <input
              type="number"
              step="0.01"
              min="0.01"
              :max="selectedSupplierForPay.balance"
              required
              v-model="paymentAmount"
              placeholder="0.00"
              class="w-full h-11 pl-12 pr-4 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:border-primary text-sm font-mono text-on-surface"
            />
          </div>
          <div class="flex gap-2 mt-1">
            <button
              type="button"
              @click="paymentAmount = String(selectedSupplierForPay.balance)"
              class="px-3 py-1 rounded-lg border border-outline-variant hover:bg-surface-container-high text-xs font-bold cursor-pointer transition-all bg-white"
            >
              {{ $t('suppliers.payFullBalance') }}
            </button>
            <button
              type="button"
              @click="paymentAmount = String((selectedSupplierForPay.balance / 2).toFixed(2))"
              class="px-3 py-1 rounded-lg border border-outline-variant hover:bg-surface-container-high text-xs font-bold cursor-pointer transition-all bg-white"
            >
              {{ $t('suppliers.payHalf') }}
            </button>
          </div>
        </div>

        <!-- Payment Method Selector -->
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{{ $t('suppliers.selectPaymentMethod') }}</label>
          <div class="grid grid-cols-2 gap-2">
            <button
              type="button"
              @click="paymentMethod = 'MOBILE'"
              class="h-11 px-3 rounded-xl border flex items-center gap-2.5 text-xs font-bold transition-all cursor-pointer"
              :class="paymentMethod === 'MOBILE' ? 'border-primary bg-primary/10 text-primary shadow-xs' : 'border-outline-variant bg-white hover:bg-surface-container-high text-on-surface'"
            >
              <Smartphone class="w-4 h-4 shrink-0" />
              <span>{{ $t('suppliers.methodMobile') }}</span>
            </button>

            <button
              type="button"
              @click="paymentMethod = 'BANK_TRANSFER'"
              class="h-11 px-3 rounded-xl border flex items-center gap-2.5 text-xs font-bold transition-all cursor-pointer"
              :class="paymentMethod === 'BANK_TRANSFER' ? 'border-primary bg-primary/10 text-primary shadow-xs' : 'border-outline-variant bg-white hover:bg-surface-container-high text-on-surface'"
            >
              <Building class="w-4 h-4 shrink-0" />
              <span>{{ $t('suppliers.methodBank') }}</span>
            </button>

            <button
              type="button"
              @click="paymentMethod = 'CASH'"
              class="h-11 px-3 rounded-xl border flex items-center gap-2.5 text-xs font-bold transition-all cursor-pointer"
              :class="paymentMethod === 'CASH' ? 'border-primary bg-primary/10 text-primary shadow-xs' : 'border-outline-variant bg-white hover:bg-surface-container-high text-on-surface'"
            >
              <Banknote class="w-4 h-4 shrink-0" />
              <span>{{ $t('suppliers.methodCash') }}</span>
            </button>

            <button
              type="button"
              @click="paymentMethod = 'CARD'"
              class="h-11 px-3 rounded-xl border flex items-center gap-2.5 text-xs font-bold transition-all cursor-pointer"
              :class="paymentMethod === 'CARD' ? 'border-primary bg-primary/10 text-primary shadow-xs' : 'border-outline-variant bg-white hover:bg-surface-container-high text-on-surface'"
            >
              <CreditCard class="w-4 h-4 shrink-0" />
              <span>{{ $t('suppliers.methodCard') }}</span>
            </button>
          </div>
        </div>

        <!-- Cash Details & Shift Selection (if CASH) -->
        <div v-if="paymentMethod === 'CASH'" class="flex flex-col gap-2 p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/60">
          <div v-if="vm.userRole.value !== 'CASHIER'" class="flex flex-col gap-1.5">
            <label class="text-xs font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
              <User class="w-3.5 h-3.5" />
              <span>{{ $t('suppliers.selectCashierShift') }}</span>
            </label>

            <div v-if="isLoadingOpenShifts" class="text-xs text-on-surface-variant flex items-center gap-1.5 py-1">
              <RotateCw class="w-3.5 h-3.5 animate-spin" />
              <span>Checking open shifts...</span>
            </div>

            <select
              v-else-if="openShifts.length > 0"
              v-model="selectedTargetShiftId"
              required
              class="w-full h-11 px-3.5 rounded-xl border border-outline-variant bg-white focus:outline-none focus:border-primary text-xs font-semibold cursor-pointer text-on-surface"
            >
              <option value="" disabled>{{ $t('suppliers.selectCashierShiftPlaceholder') }}</option>
              <option v-for="shift in openShifts" :key="shift.id" :value="shift.id">
                {{ shift.cashierName }} (Till: {{ shift.terminalId || 'MAIN' }}) - Drawer: TZS {{ Number(shift.expectedCash || 0).toLocaleString() }}
              </option>
            </select>

            <div v-else class="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2">
              <AlertTriangle class="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
              <span>{{ $t('suppliers.noOpenShiftsWarning') }}</span>
            </div>

            <p class="text-[11px] text-on-surface-variant/80 mt-1">
              {{ $t('suppliers.nonCashierPendingApprovalNotice') }}
            </p>
          </div>

          <div v-else class="p-2.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-start gap-2">
            <CheckCircle2 class="w-4 h-4 shrink-0 text-blue-600 mt-0.5" />
            <span>{{ $t('suppliers.cashierDirectDeductionNotice') }}</span>
          </div>
        </div>

        <!-- Reference Number -->
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
            {{ $t('suppliers.referenceNumber') }}
            <span class="text-[10px] text-on-surface-variant/60 font-normal lowercase">(optional)</span>
          </label>
          <input
            type="text"
            v-model="paymentReference"
            :placeholder="referencePlaceholder"
            class="h-11 px-3.5 rounded-xl border border-outline-variant bg-white focus:outline-none focus:border-primary text-sm text-on-surface font-mono"
          />
        </div>

        <!-- Notes / Memo -->
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
            {{ $t('suppliers.notes') }}
            <span class="text-[10px] text-on-surface-variant/60 font-normal lowercase">(optional)</span>
          </label>
          <input
            type="text"
            v-model="paymentNotes"
            :placeholder="$t('suppliers.notesPlaceholder')"
            class="h-11 px-3.5 rounded-xl border border-outline-variant bg-white focus:outline-none focus:border-primary text-sm text-on-surface"
          />
        </div>
      </form>
      <template #footer>
        <button
          type="button"
          @click="showPayModal = false"
          class="h-11 px-5 rounded-xl border border-outline-variant text-on-surface hover:bg-surface-container-high font-bold text-sm cursor-pointer transition-all active:scale-[0.98] bg-white"
        >
          {{ $t('common.cancel') }}
        </button>
        <button
          type="submit"
          form="pay-supplier-form"
          :disabled="isSubmittingPayment || (paymentMethod === 'CASH' && vm.userRole.value !== 'CASHIER' && !selectedTargetShiftId)"
          class="h-11 px-6 bg-emerald-600 text-white hover:bg-emerald-700 font-bold text-sm rounded-xl cursor-pointer transition-all active:scale-[0.98] shadow-sm border-0 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <RotateCw v-if="isSubmittingPayment" class="w-4 h-4 animate-spin" />
          <span>{{ isSubmittingPayment ? $t('suppliers.recordingPayment') : $t('suppliers.recordPayment') }}</span>
        </button>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAppViewModel } from '../viewmodels/useAppViewModel';
import type { Supplier } from '../models/types';
import Modal from '../components/common/Modal.vue';
import Toast from '../components/common/Toast.vue';
import JengaLoader from '../components/common/JengaLoader.vue';
import { api } from '../services/api';
import { t } from '../i18n';
import { 
  Search, 
  Filter as FilterIcon, 
  Download, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft,
  ChevronsRight,
  FileText, 
  TrendingUp,
  Coins,
  AlertCircle,
  Pencil,
  Banknote,
  CreditCard,
  Smartphone,
  Building,
  CheckCircle2,
  RotateCw,
  Receipt,
  Package,
  AlertTriangle,
  User
} from 'lucide-vue-next';
import { 
  supplierPaymentService,
  type SupplierPaymentMethod,
  type SupplierPaymentViewModel,
  type SupplierPaymentStatus
} from '../services/supplierPaymentService';

const vm = useAppViewModel();

const searchQuery = ref('');
const selectedCategory = ref('All');
const selectedStatus = ref('All');
const currentPage = ref(1);
const itemsPerPage = 15;

// Modal triggers
const showAddModal = ref(false);
const showHistoryModal = ref(false);
const selectedSupplierForHistory = ref<Supplier | null>(null);

const showEditModal = ref(false);
const selectedSupplierForEdit = ref<Supplier | null>(null);

const editSupplierName = ref('');
const editContactPerson = ref('');
const editPhone = ref('');
const editEmail = ref('');
const editCategory = ref('Beverage');
const editStatus = ref<'Active' | 'Inactive'>('Active');
const editBalance = ref(0);
const editCode = ref('');

const showPayModal = ref(false);
const selectedSupplierForPay = ref<Supplier | null>(null);
const paymentAmount = ref('');
const paymentMethod = ref<SupplierPaymentMethod>('MOBILE');
const paymentReference = ref('');
const paymentNotes = ref('');
const selectedTargetShiftId = ref('');
const openShifts = ref<any[]>([]);
const isLoadingOpenShifts = ref(false);
const isSubmittingPayment = ref(false);

// History modal states
const activeHistoryTab = ref<'PAYMENTS' | 'PURCHASES'>('PAYMENTS');
const paymentHistory = ref<SupplierPaymentViewModel[]>([]);
const paymentHistoryTotal = ref(0);
const paymentHistoryPage = ref(0);
const paymentHistoryTotalPages = ref(1);
const isLoadingPaymentHistory = ref(false);
const supplierPurchases = ref<any[]>([]);
const purchasesTotalCount = ref(0);
const isLoadingPurchases = ref(false);

// Form variables
const newSupplierName = ref('');
const newContactPerson = ref('');
const newPhone = ref('');
const newEmail = ref('');
const newCategory = ref('Beverage');
const newBalance = ref('');
const newStatus = ref<'Active' | 'Inactive'>('Active');

// Toast notifications
const toastMessage = ref<string | null>(null);
const toastType = ref<'success' | 'error'>('success');

const suppliers = computed(() => vm.suppliers.value);

onMounted(() => {
  vm.fetchSuppliers();
});

const showToast = (message: string, type: 'success' | 'error' = 'success') => {
  toastMessage.value = message;
  toastType.value = type;
};

const categoriesList = computed(() => {
  const list = Array.from(new Set(suppliers.value.map(s => s.category).filter(Boolean)));
  return list;
});

const filteredSuppliers = computed(() => {
  return suppliers.value.filter(s => {
    const matchesSearch = 
      (s.name || '').toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      (s.contactPerson || '').toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      (s.phone || '').toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      (s.email || '').toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      (s.code || '').toLowerCase().includes(searchQuery.value.toLowerCase());

    const matchesCategory = selectedCategory.value === 'All' || s.category === selectedCategory.value;
    const matchesStatus = selectedStatus.value === 'All' || s.status === selectedStatus.value;

    return matchesSearch && matchesCategory && matchesStatus;
  });
});

const totalPages = computed(() => Math.ceil(filteredSuppliers.value.length / itemsPerPage) || 1);

const visiblePages = computed(() => {
  const total = totalPages.value;
  const current = currentPage.value;
  const delta = 2;
  
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | string)[] = [];
  const left = current - delta;
  const right = current + delta + 1;

  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= left && i < right)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }

  return pages;
});

const handleJumpPage = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const val = parseInt(target.value, 10);
  if (!isNaN(val)) {
    currentPage.value = Math.max(1, Math.min(totalPages.value, val));
  }
};

const paginatedSuppliers = computed(() => {
  const startIndex = (currentPage.value - 1) * itemsPerPage;
  return filteredSuppliers.value.slice(startIndex, startIndex + itemsPerPage);
});

const resetFilters = () => {
  searchQuery.value = '';
  selectedCategory.value = 'All';
  selectedStatus.value = 'All';
  currentPage.value = 1;
};

const getInitials = (name: string = '') => {
  const parts = (name || '').trim().split(/\s+/);
  if (parts.length >= 2) {
    return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase();
  }
  return ((name || '').substring(0, 2) || '').toUpperCase();
};

const getAvatarColor = (name: string = '') => {
  const colors = [
    'bg-blue-100 text-blue-800 border-blue-200',
    'bg-emerald-100 text-emerald-800 border-emerald-200',
    'bg-rose-100 text-rose-800 border-rose-200',
    'bg-purple-100 text-purple-800 border-purple-200',
    'bg-amber-100 text-amber-800 border-amber-200',
    'bg-teal-100 text-teal-800 border-teal-200',
  ];
  let hash = 0;
  const cleanName = name || '';
  for (let i = 0; i < cleanName.length; i++) {
    hash = cleanName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index] || colors[0];
};

const referencePlaceholder = computed(() => {
  switch (paymentMethod.value) {
    case 'MOBILE':
      return t('suppliers.refPlaceholderMobile');
    case 'BANK_TRANSFER':
      return t('suppliers.refPlaceholderBank');
    case 'CARD':
      return t('suppliers.refPlaceholderCard');
    case 'CASH':
      return t('suppliers.refPlaceholderCash');
    default:
      return '';
  }
});

const totalCompletedPaymentsAmount = computed(() => {
  return paymentHistory.value
    .filter(p => p.status === 'COMPLETED')
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
});

const totalPurchasesAmount = computed(() => {
  return supplierPurchases.value
    .reduce((sum, p) => sum + (Number(p.totalCost) || 0), 0);
});

const getPaymentMethodIcon = (method: SupplierPaymentMethod | string) => {
  switch (method) {
    case 'CASH': return Banknote;
    case 'MOBILE': return Smartphone;
    case 'BANK_TRANSFER': return Building;
    case 'CARD': return CreditCard;
    default: return Coins;
  }
};

const getPaymentMethodLabel = (method: SupplierPaymentMethod | string) => {
  switch (method) {
    case 'CASH': return t('suppliers.methodCash');
    case 'MOBILE': return t('suppliers.methodMobile');
    case 'BANK_TRANSFER': return t('suppliers.methodBank');
    case 'CARD': return t('suppliers.methodCard');
    default: return method;
  }
};

const getPaymentStatusBadgeClass = (status: SupplierPaymentStatus | string) => {
  switch (status) {
    case 'COMPLETED':
      return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    case 'PENDING_APPROVAL':
      return 'bg-amber-50 text-amber-800 border-amber-200';
    case 'REJECTED':
    case 'CANCELLED':
      return 'bg-rose-50 text-rose-800 border-rose-200';
    default:
      return 'bg-surface-container-high text-on-surface-variant border-outline-variant';
  }
};

const formatDateTime = (dateStr?: string | null) => {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateStr;
  }
};

const getPoStatusClass = (status: string) => {
  if (status === 'Received' || status === 'COMPLETED') return 'bg-emerald-50 text-emerald-800 border-emerald-100';
  if (status === 'Pending' || status === 'PENDING') return 'bg-amber-50 text-amber-800 border-amber-100';
  return 'bg-blue-50 text-blue-800 border-blue-100';
};

const fetchOpenShifts = async () => {
  const branchId = localStorage.getItem('branchId') || vm.activeBranchId.value;
  if (!branchId) return;

  isLoadingOpenShifts.value = true;
  try {
    const data = await api.get<any[]>(`/api/shifts/branch/${branchId}`);
    if (Array.isArray(data)) {
      openShifts.value = data.filter((s: any) => s.status === 'OPEN');
      if (openShifts.value.length > 0 && !selectedTargetShiftId.value) {
        selectedTargetShiftId.value = openShifts.value[0].id;
      }
    } else {
      openShifts.value = [];
    }
  } catch (err) {
    console.error('Failed to load open shifts:', err);
    openShifts.value = [];
  } finally {
    isLoadingOpenShifts.value = false;
  }
};

const fetchSupplierPaymentHistory = async (supplierId: string, page: number = 0) => {
  isLoadingPaymentHistory.value = true;
  try {
    const res = await supplierPaymentService.getPaymentsBySupplier(supplierId, page, 10);
    paymentHistory.value = res.content || [];
    paymentHistoryTotal.value = res.totalElements || 0;
    paymentHistoryTotalPages.value = res.totalPages || 1;
    paymentHistoryPage.value = res.number || 0;
  } catch (err) {
    console.error('Failed to fetch supplier payment history:', err);
    paymentHistory.value = [];
  } finally {
    isLoadingPaymentHistory.value = false;
  }
};

const fetchSupplierPurchases = async (supplierId: string) => {
  const branchId = localStorage.getItem('branchId') || vm.activeBranchId.value;
  if (!branchId) return;

  isLoadingPurchases.value = true;
  try {
    const res: any = await api.get(`/api/purchases?branchId=${branchId}&supplierId=${supplierId}&size=50`);
    const rawList: any[] = Array.isArray(res) ? res : (res?.content || []);
    supplierPurchases.value = rawList;
    purchasesTotalCount.value = res?.totalElements || rawList.length;
  } catch (err) {
    console.error('Failed to fetch supplier purchases:', err);
    supplierPurchases.value = [];
  } finally {
    isLoadingPurchases.value = false;
  }
};

const openPayModalFromHistory = () => {
  if (!selectedSupplierForHistory.value) return;
  const sup = selectedSupplierForHistory.value;
  showHistoryModal.value = false;
  handleOpenPayModal(sup);
};

const handleExportCSV = () => {
  try {
    const headers = ['Code', 'Supplier Name', 'Contact Person', 'Phone', 'Email', 'Category', 'Outstanding Balance', 'Status'];
    const rows = filteredSuppliers.value.map(s => [
      s.code,
      s.name,
      s.contactPerson,
      s.phone,
      s.email,
      s.category,
      s.balance.toFixed(2),
      s.status
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.map(val => `"${val}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `suppliers_directory_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(t('suppliers.exportSuccess', { count: filteredSuppliers.value.length }));
  } catch (err) {
    showToast('Failed to export suppliers data', 'error');
  }
};

const handleAddSupplier = async () => {
  if (!newSupplierName.value.trim() || !newPhone.value.trim()) {
    showToast(t('suppliers.fillRequiredFields'), 'error');
    return;
  }

  const numbers = suppliers.value.map(s => {
    const match = s.code.match(/SUP-(\d+)/);
    return match ? parseInt(match[1] || '0', 10) : 0;
  });
  const maxNum = Math.max(...numbers, 0);
  const nextCode = `SUP-${String(maxNum + 1).padStart(4, '0')}`;

  const balanceNum = parseFloat(newBalance.value) || 0;

  try {
    const storeId = localStorage.getItem('storeId');
    if (!storeId) {
      showToast('Error: Store ID is missing. Please log in again.', 'error');
      return;
    }

    const createdVm = await api.post('/api/suppliers', {
      storeId,
      code: nextCode,
      name: newSupplierName.value.trim(),
      contactPerson: newContactPerson.value ? newContactPerson.value.trim() : '',
      phone: newPhone.value.trim(),
      email: newEmail.value ? newEmail.value.trim() : '',
      category: newCategory.value,
      balance: balanceNum,
      status: 'Active'
    });

    const newSupplier: Supplier = {
      id: createdVm.id,
      code: createdVm.code,
      name: createdVm.name,
      contactPerson: createdVm.contactPerson || '',
      phone: createdVm.phone || '',
      email: createdVm.email || '',
      category: createdVm.category || 'Wholesale',
      balance: Number(createdVm.balance) || 0,
      status: 'Active'
    };

    vm.suppliers.value = [newSupplier, ...vm.suppliers.value];
    showToast(t('suppliers.supplierAddedSuccess', { name: newSupplier.name, code: newSupplier.code }));
    
    // Reset form
    newSupplierName.value = '';
    newContactPerson.value = '';
    newPhone.value = '';
    newEmail.value = '';
    newCategory.value = 'Beverage';
    newBalance.value = '';
    newStatus.value = 'Active';
    
    showAddModal.value = false;
  } catch (err: any) {
    showToast('Failed to add supplier: ' + (err.message || err), 'error');
  }
};

const handleOpenHistoryModal = async (supplier: Supplier) => {
  selectedSupplierForHistory.value = supplier;
  activeHistoryTab.value = 'PAYMENTS';
  paymentHistoryPage.value = 0;
  showHistoryModal.value = true;
  await Promise.all([
    fetchSupplierPaymentHistory(supplier.id, 0),
    fetchSupplierPurchases(supplier.id)
  ]);
};

const handleOpenEditModal = (supplier: Supplier) => {
  selectedSupplierForEdit.value = supplier;
  editSupplierName.value = supplier.name;
  editContactPerson.value = supplier.contactPerson;
  editPhone.value = supplier.phone;
  editEmail.value = supplier.email;
  editCategory.value = supplier.category;
  editStatus.value = supplier.status || 'Active';
  editBalance.value = supplier.balance;
  editCode.value = supplier.code;
  showEditModal.value = true;
};

const handleEditSupplier = async () => {
  if (!selectedSupplierForEdit.value) return;
  if (!editSupplierName.value.trim() || !editPhone.value.trim()) {
    showToast(t('suppliers.fillRequiredFields'), 'error');
    return;
  }

  try {
    const storeId = localStorage.getItem('storeId');
    if (!storeId) {
      showToast('Error: Store ID is missing. Please log in again.', 'error');
      return;
    }

    const updatedVm = await api.put(`/api/suppliers/${selectedSupplierForEdit.value.id}`, {
      storeId,
      code: editCode.value,
      name: editSupplierName.value.trim(),
      contactPerson: editContactPerson.value ? editContactPerson.value.trim() : '',
      phone: editPhone.value.trim(),
      email: editEmail.value ? editEmail.value.trim() : '',
      category: editCategory.value,
      balance: editBalance.value,
      status: 'Active'
    });

    const index = vm.suppliers.value.findIndex(s => s.id === selectedSupplierForEdit.value?.id);
    if (index !== -1 && vm.suppliers.value[index]) {
      vm.suppliers.value[index] = {
        id: updatedVm.id,
        code: updatedVm.code,
        name: updatedVm.name,
        contactPerson: updatedVm.contactPerson || '',
        phone: updatedVm.phone || '',
        email: updatedVm.email || '',
        category: updatedVm.category || 'Wholesale',
        balance: Number(updatedVm.balance) || 0,
        status: (updatedVm.status || 'Active') as 'Active' | 'Inactive'
      };
    }

    showToast(t('suppliers.supplierUpdatedSuccess', { name: updatedVm.name }));
    showEditModal.value = false;
  } catch (err: any) {
    showToast('Failed to update supplier: ' + (err.message || err), 'error');
  }
};

const handleOpenPayModal = async (supplier: Supplier) => {
  selectedSupplierForPay.value = supplier;
  paymentAmount.value = '';
  paymentMethod.value = 'MOBILE';
  paymentReference.value = '';
  paymentNotes.value = '';
  selectedTargetShiftId.value = '';
  isSubmittingPayment.value = false;
  showPayModal.value = true;
  await fetchOpenShifts();
};

const handlePaySupplier = async () => {
  if (!selectedSupplierForPay.value) return;
  const payVal = parseFloat(paymentAmount.value) || 0;
  if (payVal <= 0) {
    showToast(t('suppliers.enterValidPaymentAmount'), 'error');
    return;
  }
  if (payVal > selectedSupplierForPay.value.balance) {
    showToast(t('suppliers.paymentExceedsBalance'), 'error');
    return;
  }

  const isCashier = vm.userRole.value === 'CASHIER';
  if (paymentMethod.value === 'CASH' && !isCashier) {
    if (!selectedTargetShiftId.value) {
      showToast('Please select an active cashier shift for cash disbursement.', 'error');
      return;
    }
  }

  const branchId = localStorage.getItem('branchId') || vm.activeBranchId.value || undefined;

  isSubmittingPayment.value = true;
  try {
    const payment = await supplierPaymentService.recordPayment({
      supplierId: selectedSupplierForPay.value.id,
      branchId: branchId,
      shiftId: paymentMethod.value === 'CASH' && !isCashier ? selectedTargetShiftId.value : undefined,
      amount: payVal,
      paymentMethod: paymentMethod.value,
      referenceNumber: paymentReference.value.trim() || undefined,
      notes: paymentNotes.value.trim() || undefined
    });

    const newBal = payment.supplierBalanceAfter !== undefined
      ? Number(payment.supplierBalanceAfter)
      : Math.max(0, selectedSupplierForPay.value.balance - (payment.status === 'COMPLETED' ? payVal : 0));

    const index = vm.suppliers.value.findIndex(s => s.id === selectedSupplierForPay.value?.id);
    if (index !== -1 && vm.suppliers.value[index]) {
      vm.suppliers.value[index] = {
        ...vm.suppliers.value[index],
        balance: newBal
      };
    }

    if (selectedSupplierForHistory.value && selectedSupplierForHistory.value.id === selectedSupplierForPay.value.id) {
      selectedSupplierForHistory.value.balance = newBal;
    }

    if (payment.status === 'PENDING_APPROVAL') {
      showToast(t('suppliers.paymentRecordedPendingApproval', { amount: payVal.toLocaleString() }), 'success');
    } else {
      showToast(t('suppliers.paymentRecordedSuccess', {
        amount: payVal.toLocaleString(),
        name: selectedSupplierForPay.value.name,
        balance: newBal.toLocaleString()
      }), 'success');
    }

    showPayModal.value = false;
    // Also re-fetch suppliers from API to ensure full consistency
    vm.fetchSuppliers();
  } catch (err: any) {
    const errMsg = err.response?.data?.error || err.message || 'Failed to record supplier payment';
    showToast(errMsg, 'error');
  } finally {
    isSubmittingPayment.value = false;
  }
};
</script>
