<template>
  <div class="flex flex-col gap-6 w-full animate-fade-in font-sans relative select-none pb-20">
    <!-- Toast Feedback -->
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
            <component :is="activeTabIcon" class="w-5 h-5" />
          </div>
          <div>
            <div class="flex items-center gap-1.5">
              <span class="text-[10px] font-mono font-bold text-on-surface-variant uppercase tracking-wider">{{ $t('warehouses.title') }} /</span>
              <span class="text-[10px] font-mono font-bold text-primary uppercase tracking-wider">{{ activeTabLabel }}</span>
            </div>
            <h1 class="text-2xl md:text-3xl font-black text-primary tracking-tight">{{ activeTabLabel }}</h1>
            <p class="text-xs md:text-sm text-on-surface-variant font-medium mt-0.5">
              {{ $t('warehouses.subtitle') }}
            </p>
          </div>
        </div>
      </div>

      <!-- Quick Actions Header Buttons -->
      <div class="flex flex-wrap items-center gap-2.5 shrink-0">
        <!-- Refresh Button -->
        <button 
          @click="loadAllData"
          :disabled="isLoading"
          class="h-10 px-3.5 rounded-xl border border-outline-variant text-on-surface hover:bg-surface-container-high active:scale-[0.98] font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all bg-white shadow-xs disabled:opacity-50"
          :title="$t('common.refresh')"
        >
          <RotateCw class="w-3.5 h-3.5" :class="isLoading ? 'animate-spin text-primary' : ''" />
          <span class="hidden sm:inline">{{ $t('common.refresh') }}</span>
        </button>

        <!-- Record Consumption Button -->
        <button
          v-if="canConsume"
          @click="openConsumptionModal()"
          class="h-10 px-3.5 rounded-xl border border-outline-variant text-on-surface hover:bg-surface-container-high active:scale-[0.98] font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all bg-white shadow-xs"
        >
          <UtensilsCrossed class="w-3.5 h-3.5 text-primary" />
          <span>{{ $t('warehouses.recordConsumptionBtn') }}</span>
        </button>

        <!-- New Transfer Button -->
        <button
          v-if="canTransfer"
          @click="openTransferModal()"
          class="h-10 px-3.5 rounded-xl border border-outline-variant text-on-surface hover:bg-surface-container-high active:scale-[0.98] font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all bg-white shadow-xs"
        >
          <ArrowLeftRight class="w-3.5 h-3.5 text-primary" />
          <span>{{ $t('warehouses.quickTransferBtn') }}</span>
        </button>

        <!-- Add Location Button (Admin Only) -->
        <button 
          v-if="canManageLocations"
          @click="openAddLocationModal"
          class="h-10 px-4 rounded-xl bg-primary text-white hover:opacity-95 active:scale-[0.98] font-bold text-xs flex items-center gap-2 cursor-pointer transition-all shadow-sm border-0"
        >
          <Plus class="w-4 h-4" />
          <span>{{ $t('warehouses.addLocationBtn') }}</span>
        </button>
      </div>
    </div>

    <!-- ============================================================= -->
    <!-- TAB 1: LOCATIONS & STOCK                                      -->
    <!-- ============================================================= -->
    <div v-if="activeTab === 'locations'" class="space-y-6">
      <!-- KPI Overview Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Total Storage Nodes -->
        <div class="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant shadow-xs flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
              {{ $t('warehouses.kpiTotalLocations') }}
            </span>
            <div class="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Warehouse class="w-4 h-4" />
            </div>
          </div>
          <div class="mt-3">
            <span class="text-2xl font-black font-mono text-on-surface">
              {{ locations.length }}
            </span>
            <span class="text-[11px] text-on-surface-variant block mt-0.5">
              {{ warehouseCount }} Warehouses • {{ branchStockCount }} Branch Stocks
            </span>
          </div>
        </div>

        <!-- Store-Wide Stock Valuation -->
        <div class="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant shadow-xs flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
              {{ $t('warehouses.kpiTotalValuation') }}
            </span>
            <div class="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <Coins class="w-4 h-4" />
            </div>
          </div>
          <div class="mt-3">
            <span class="text-2xl font-black font-mono text-emerald-600 truncate block">
              TZS {{ totalStockValuation.toLocaleString() }}
            </span>
            <span class="text-[11px] text-on-surface-variant block mt-0.5">
              Consolidated across all physical storage nodes
            </span>
          </div>
        </div>

        <!-- In-Transit Valuation -->
        <div class="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant shadow-xs flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
              {{ $t('warehouses.kpiInTransitValuation') }}
            </span>
            <div class="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Truck class="w-4 h-4" />
            </div>
          </div>
          <div class="mt-3">
            <span class="text-2xl font-black font-mono text-amber-600 truncate block">
              TZS {{ inTransitValuation.toLocaleString() }}
            </span>
            <span class="text-[11px] text-on-surface-variant block mt-0.5">
              {{ inTransitTransfersCount }} active shipments on the road
            </span>
          </div>
        </div>

        <!-- Active Branches Served -->
        <div class="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant shadow-xs flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
              Store Branches
            </span>
            <div class="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <Store class="w-4 h-4" />
            </div>
          </div>
          <div class="mt-3">
            <span class="text-2xl font-black font-mono text-on-surface">
              {{ branches.length }}
            </span>
            <span class="text-[11px] text-on-surface-variant block mt-0.5">
              Commercial retail outlets & POS points
            </span>
          </div>
        </div>
      </div>

      <!-- Locations List / Cards -->
      <div class="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-xs p-5 space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-outline-variant/60">
          <div>
            <h3 class="text-base font-black text-on-surface">All Physical Storage Locations</h3>
            <p class="text-xs text-on-surface-variant font-medium">Warehouses, retail shelf locations, and dedicated branch storerooms</p>
          </div>

          <div class="flex items-center gap-2">
            <div class="relative w-full sm:w-64">
              <Search class="w-4 h-4 text-outline absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input 
                type="text"
                v-model="locationSearch"
                placeholder="Search locations..."
                class="w-full bg-surface-container-low pl-9 pr-3 py-1.5 border border-outline-variant rounded-xl text-xs outline-none focus:border-primary text-on-surface font-semibold"
              />
            </div>
          </div>
        </div>

        <div v-if="filteredLocations.length === 0" class="py-12 text-center text-on-surface-variant">
          <Warehouse class="w-12 h-12 mx-auto text-outline mb-2 stroke-[1.5]" />
          <p class="text-sm font-bold text-on-surface">No locations found</p>
          <p class="text-xs mt-1">Try adjusting your search query or add a new location.</p>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div 
            v-for="loc in filteredLocations" 
            :key="loc.id"
            class="p-4 rounded-xl border border-outline-variant hover:border-primary/50 transition-all bg-surface-container-lowest shadow-xs flex flex-col justify-between gap-4"
          >
            <!-- Card Header -->
            <div class="space-y-2">
              <div class="flex items-start justify-between gap-2">
                <div class="flex items-center gap-2.5">
                  <div class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    :class="loc.locationType === 'WAREHOUSE' ? 'bg-indigo-500/10 text-indigo-600' : 'bg-emerald-500/10 text-emerald-600'">
                    <Warehouse v-if="loc.locationType === 'WAREHOUSE'" class="w-4.5 h-4.5" />
                    <Store v-else class="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h4 class="text-sm font-black text-on-surface leading-tight">{{ loc.name }}</h4>
                    <span v-if="loc.code" class="text-[10px] font-mono font-bold text-outline uppercase">{{ loc.code }}</span>
                  </div>
                </div>

                <span 
                  class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border shrink-0"
                  :class="getLocationTypeBadgeClass(loc.locationType)"
                >
                  {{ getLocationTypeShort(loc.locationType) }}
                </span>
              </div>

              <!-- Address & Serving Rules -->
              <p class="text-xs text-on-surface-variant line-clamp-1">
                {{ loc.address || 'Physical inventory storage unit' }}
              </p>

              <div class="pt-2 border-t border-outline-variant/50 text-[11px] font-medium text-on-surface-variant">
                <span v-if="loc.locationType === 'WAREHOUSE'" class="inline-flex items-center gap-1">
                  <Truck class="w-3.5 h-3.5 text-primary" />
                  <span>{{ loc.servesAllBranches ? 'Serves: All Store Branches' : `Serves: ${loc.servedBranchIds?.length || 0} branches` }}</span>
                </span>
                <span v-else class="inline-flex items-center gap-1">
                  <Store class="w-3.5 h-3.5 text-emerald-600" />
                  <span>Linked Branch: <strong>{{ loc.storeBranchName || 'Main' }}</strong></span>
                </span>
              </div>
            </div>

            <!-- Card Actions -->
            <div class="pt-3 border-t border-outline-variant/60 flex items-center justify-between gap-2">
              <button
                @click="openStockDrawer(loc)"
                class="px-3 py-1.5 rounded-lg border border-outline-variant text-on-surface hover:bg-surface-container font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer bg-transparent"
              >
                <Boxes class="w-3.5 h-3.5 text-primary" />
                <span>{{ $t('warehouses.viewStock') }}</span>
              </button>

              <div class="flex items-center gap-1">
                <button
                  v-if="canTransfer"
                  @click="openTransferModal(loc)"
                  class="p-1.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer border-0 bg-transparent"
                  title="Transfer stock from here"
                >
                  <ArrowLeftRight class="w-4 h-4" />
                </button>
                <button
                  v-if="canManageLocations"
                  @click="openEditLocationModal(loc)"
                  class="p-1.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer border-0 bg-transparent"
                  title="Edit Location"
                >
                  <Pencil class="w-4 h-4" />
                </button>
                <button
                  v-if="canManageLocations && loc.locationType !== 'BRANCH_DEFAULT'"
                  @click="handleDeleteLocation(loc)"
                  class="p-1.5 rounded-lg text-outline hover:text-error hover:bg-error/10 transition-colors cursor-pointer border-0 bg-transparent"
                  title="Delete Location"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ============================================================= -->
    <!-- TAB 2: STOCK TRANSFERS                                        -->
    <!-- ============================================================= -->
    <div v-else-if="activeTab === 'transfers'" class="space-y-4">
      <div class="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-xs p-5 space-y-4">
        <!-- Transfer Filters Toolbar -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-outline-variant/60">
          <!-- Status Filter Tabs -->
          <div class="flex items-center gap-1.5 overflow-x-auto">
            <button
              v-for="st in transferStatuses"
              :key="st.id"
              @click="transferFilterStatus = st.id"
              class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border-0 whitespace-nowrap"
              :class="transferFilterStatus === st.id 
                ? 'bg-primary text-white shadow-xs' 
                : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'"
            >
              <span>{{ st.label }}</span>
            </button>
          </div>

          <button
            v-if="canTransfer"
            @click="openTransferModal()"
            class="h-9 px-4 rounded-xl bg-primary text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs hover:opacity-95 border-0 shrink-0"
          >
            <Plus class="w-4 h-4" />
            <span>{{ $t('warehouses.quickTransferBtn') }}</span>
          </button>
        </div>

        <!-- Transfers Table -->
        <div v-if="filteredTransfers.length === 0" class="py-16 text-center text-on-surface-variant">
          <Truck class="w-12 h-12 mx-auto text-outline mb-2 stroke-[1.5]" />
          <p class="text-sm font-bold text-on-surface">No stock transfers found</p>
          <p class="text-xs mt-1">Initiate a transfer to move products between storage nodes.</p>
        </div>

        <div v-else class="overflow-x-auto border border-outline-variant rounded-xl bg-surface-container-lowest">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="bg-surface-container-low border-b border-outline-variant text-[10px] font-mono font-bold uppercase tracking-wider text-on-surface-variant">
                <th class="py-3 px-4">Transfer #</th>
                <th class="py-3 px-3">Route (From → To)</th>
                <th class="py-3 px-3">Status</th>
                <th class="py-3 px-3 text-right">Items</th>
                <th class="py-3 px-3 text-right">Total Value</th>
                <th class="py-3 px-3">Initiated By</th>
                <th class="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-outline-variant/50 font-medium">
              <tr v-for="tr in filteredTransfers" :key="tr.id" class="hover:bg-surface-container-low/40 transition-colors">
                <td class="py-3 px-4 font-mono font-bold text-on-surface">
                  {{ tr.transferNumber }}
                </td>
                <td class="py-3 px-3">
                  <div class="flex items-center gap-1.5 font-bold text-on-surface">
                    <span class="truncate max-w-[120px]">{{ tr.sourceLocationName }}</span>
                    <ArrowRight class="w-3.5 h-3.5 text-outline shrink-0" />
                    <span class="truncate max-w-[120px] text-emerald-700">{{ tr.destinationLocationName }}</span>
                  </div>
                </td>
                <td class="py-3 px-3">
                  <span 
                    class="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border"
                    :class="getStatusBadgeClass(tr.status)"
                  >
                    {{ formatTransferStatus(tr.status) }}
                  </span>
                </td>
                <td class="py-3 px-3 text-right font-mono font-bold text-on-surface-variant">
                  {{ tr.items?.length || 0 }} SKUs
                </td>
                <td class="py-3 px-3 text-right font-mono font-bold text-primary">
                  TZS {{ tr.totalCostValue?.toLocaleString() || 0 }}
                  <span
                    v-if="tr.status === 'PARTIALLY_RECEIVED' && tr.remainingCostValue !== undefined"
                    class="text-[10px] font-mono text-purple-600 block"
                  >
                    TZS {{ tr.remainingCostValue.toLocaleString() }} left
                  </span>
                </td>
                <td class="py-3 px-3 text-on-surface-variant">
                  <span class="block truncate max-w-[120px]">{{ tr.initiatedByName }}</span>
                  <span class="text-[10px] font-mono text-outline block">{{ formatDate(tr.createdAt) }}</span>
                </td>
                <td class="py-3 px-4 text-center">
                  <div class="inline-flex items-center gap-1">
                    <button
                      @click="openTransferDetails(tr)"
                      class="px-2.5 py-1 rounded-lg border border-outline-variant text-[11px] font-bold text-on-surface hover:bg-surface-container transition-colors cursor-pointer bg-transparent"
                    >
                      Details
                    </button>
                    <button
                      v-if="tr.status === 'IN_TRANSIT' || tr.status === 'PARTIALLY_RECEIVED'"
                      @click="openTransferDetails(tr)"
                      class="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[11px] font-bold hover:bg-emerald-700 transition-colors cursor-pointer border-0"
                    >
                      {{ tr.status === 'PARTIALLY_RECEIVED' ? 'Receive Rest' : 'Receive' }}
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ============================================================= -->
    <!-- TAB 3: MOVEMENT LEDGER                                        -->
    <!-- ============================================================= -->
    <div v-else-if="activeTab === 'ledger'" class="space-y-4">
      <div class="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-xs p-5 space-y-4">
        <!-- Ledger Header & Filter Toolbar -->
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-outline-variant/60">
          <div>
            <h3 class="text-base font-black text-on-surface">{{ $t('warehouses.ledgerTitle') }}</h3>
            <p class="text-xs text-on-surface-variant font-medium">{{ $t('warehouses.ledgerSubtitle') }}</p>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <!-- Date Filter Presets -->
            <select 
              v-model="ledgerDateRange"
              @change="fetchLedger"
              class="px-3 py-1.5 rounded-xl border border-outline-variant bg-surface-container-low text-xs font-semibold text-on-surface outline-none focus:border-primary"
            >
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
            </select>

            <!-- Location Filter -->
            <select 
              v-model="ledgerLocationFilter"
              @change="fetchLedger"
              class="px-3 py-1.5 rounded-xl border border-outline-variant bg-surface-container-low text-xs font-semibold text-on-surface outline-none focus:border-primary"
            >
              <option value="">All Locations</option>
              <option v-for="l in locations" :key="l.id" :value="l.id">
                {{ l.name }}
              </option>
            </select>

            <!-- Movement Type Filter -->
            <select 
              v-model="ledgerTypeFilter"
              @change="fetchLedger"
              class="px-3 py-1.5 rounded-xl border border-outline-variant bg-surface-container-low text-xs font-semibold text-on-surface outline-none focus:border-primary"
            >
              <option value="">All Movement Types</option>
              <option value="PURCHASE">PURCHASE (+ Inbound)</option>
              <option value="TRANSFER_IN">TRANSFER_IN (+ Inbound)</option>
              <option value="TRANSFER_OUT">TRANSFER_OUT (- Outbound)</option>
              <option value="SALE">SALE (- Sale)</option>
              <option value="INTERNAL_USE">INTERNAL_USE (- Usage)</option>
              <option value="DAMAGED">DAMAGED (- Writeoff)</option>
              <option value="ADJUSTMENT">ADJUSTMENT (Correction)</option>
            </select>

            <!-- Export CSV -->
            <button
              @click="exportLedgerCsv"
              class="px-3 py-1.5 rounded-xl border border-outline-variant hover:bg-surface-container font-bold text-xs text-on-surface flex items-center gap-1.5 transition-colors cursor-pointer bg-white"
            >
              <Download class="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        <!-- Ledger Data Table -->
        <div v-if="ledgerMovements.length === 0" class="py-16 text-center text-on-surface-variant">
          <ScrollText class="w-12 h-12 mx-auto text-outline mb-2 stroke-[1.5]" />
          <p class="text-sm font-bold text-on-surface">No ledger entries found</p>
          <p class="text-xs mt-1">No stock movements recorded matching your criteria.</p>
        </div>

        <div v-else class="overflow-x-auto border border-outline-variant rounded-xl bg-surface-container-lowest">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="bg-surface-container-low border-b border-outline-variant text-[10px] font-mono font-bold uppercase tracking-wider text-on-surface-variant">
                <th class="py-3 px-3">Timestamp</th>
                <th class="py-3 px-2">Type</th>
                <th class="py-3 px-3">Product</th>
                <th class="py-3 px-3">Location & Counterpart</th>
                <th class="py-3 px-2 text-right">Qty Change</th>
                <th class="py-3 px-3 text-center">Running Balance</th>
                <th class="py-3 px-2 text-right">Unit Cost</th>
                <th class="py-3 px-3 text-right">Value Impact</th>
                <th class="py-3 px-3">Actor</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-outline-variant/50 font-medium">
              <tr v-for="m in ledgerMovements" :key="m.id" class="hover:bg-surface-container-low/40 transition-colors">
                <td class="py-2.5 px-3 font-mono text-[11px] text-on-surface-variant whitespace-nowrap">
                  {{ formatDate(m.createdAt) }}
                </td>
                <td class="py-2.5 px-2">
                  <span 
                    class="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider border"
                    :class="getMovementTypeBadgeClass(m.type)"
                  >
                    {{ m.type }}
                  </span>
                </td>
                <td class="py-2.5 px-3">
                  <span class="font-bold text-on-surface block truncate max-w-[180px]">{{ m.productName }}</span>
                </td>
                <td class="py-2.5 px-3 text-[11px]">
                  <span class="font-bold text-on-surface block">{{ m.locationName || m.branchName || '-' }}</span>
                  <span v-if="m.counterpartLocationName" class="text-primary font-mono block">
                    ⇄ {{ m.counterpartLocationName }}
                  </span>
                </td>
                <td class="py-2.5 px-2 text-right font-mono font-bold" :class="isPositiveMovement(m.type) ? 'text-emerald-600' : 'text-error'">
                  {{ isPositiveMovement(m.type) ? '+' : '-' }}{{ Math.abs(m.quantity) }}
                </td>
                <td class="py-2.5 px-3 text-center font-mono text-[11px]">
                  <span v-if="m.balanceBefore !== undefined && m.balanceAfter !== undefined" class="inline-flex items-center gap-1 font-bold">
                    <span class="text-outline">{{ m.balanceBefore }}</span>
                    <ArrowRight class="w-3 h-3 text-outline" />
                    <span class="text-primary">{{ m.balanceAfter }}</span>
                  </span>
                  <span v-else class="text-outline">-</span>
                </td>
                <td class="py-2.5 px-2 text-right font-mono text-on-surface-variant">
                  TZS {{ (m.unitCost || m.costPrice || 0).toLocaleString() }}
                </td>
                <td class="py-2.5 px-3 text-right font-mono font-bold" :class="isPositiveMovement(m.type) ? 'text-emerald-600' : 'text-on-surface-variant'">
                  TZS {{ ((m.quantity || 0) * (m.unitCost || m.costPrice || 0)).toLocaleString() }}
                </td>
                <td class="py-2.5 px-3 text-[11px] text-on-surface-variant truncate max-w-[120px]">
                  {{ m.createdByName || '-' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ============================================================= -->
    <!-- TAB 4: INTERNAL CONSUMPTION                                   -->
    <!-- ============================================================= -->
    <div v-else-if="activeTab === 'consumption'" class="space-y-4">
      <div class="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-xs p-5 space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-outline-variant/60">
          <div>
            <h3 class="text-base font-black text-on-surface">{{ $t('warehouses.consumptionTitle') }}</h3>
            <p class="text-xs text-on-surface-variant font-medium">{{ $t('warehouses.consumptionSubtitle') }}</p>
          </div>

          <button
            v-if="canConsume"
            @click="openConsumptionModal()"
            class="h-9 px-4 rounded-xl bg-primary text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs hover:opacity-95 border-0 shrink-0"
          >
            <Plus class="w-4 h-4" />
            <span>{{ $t('warehouses.recordConsumptionBtn') }}</span>
          </button>
        </div>

        <!-- Recent Consumptions Table -->
        <div v-if="consumptionList.length === 0" class="py-16 text-center text-on-surface-variant">
          <UtensilsCrossed class="w-12 h-12 mx-auto text-outline mb-2 stroke-[1.5]" />
          <p class="text-sm font-bold text-on-surface">No internal consumption recorded yet</p>
          <p class="text-xs mt-1">Record kitchen usage, packaging, or staff supplies to debit inventory expense.</p>
        </div>

        <div v-else class="overflow-x-auto border border-outline-variant rounded-xl bg-surface-container-lowest">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="bg-surface-container-low border-b border-outline-variant text-[10px] font-mono font-bold uppercase tracking-wider text-on-surface-variant">
                <th class="py-3 px-3">Date / Time</th>
                <th class="py-3 px-3">Location</th>
                <th class="py-3 px-3">Product Item</th>
                <th class="py-3 px-2 text-right">Quantity</th>
                <th class="py-3 px-3">Reason / Category</th>
                <th class="py-3 px-3 text-right">Total Cost Value</th>
                <th class="py-3 px-3">Recorded By</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-outline-variant/50 font-medium">
              <tr v-for="c in consumptionList" :key="c.movementId" class="hover:bg-surface-container-low/40">
                <td class="py-2.5 px-3 font-mono text-[11px] text-on-surface-variant">
                  {{ formatDate(c.createdAt) }}
                </td>
                <td class="py-2.5 px-3 font-bold text-on-surface">
                  {{ c.locationName }}
                </td>
                <td class="py-2.5 px-3 font-bold text-primary">
                  {{ c.productName }}
                </td>
                <td class="py-2.5 px-2 text-right font-mono font-bold text-error">
                  -{{ c.consumedQuantity }}
                </td>
                <td class="py-2.5 px-3">
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-800 border border-amber-500/20">
                    {{ c.reason || 'Operational Usage' }}
                  </span>
                </td>
                <td class="py-2.5 px-3 text-right font-mono font-bold text-on-surface">
                  TZS {{ c.totalCostValuation?.toLocaleString() || 0 }}
                </td>
                <td class="py-2.5 px-3 text-on-surface-variant">
                  {{ c.recordedByName }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ============================================================= -->
    <!-- MODALS & DRAWERS                                              -->
    <!-- ============================================================= -->
    <!-- 1. Add / Edit Location Modal -->
    <LocationFormModal 
      :isOpen="showLocationModal"
      :location="selectedLocation"
      :branches="branches"
      @close="showLocationModal = false; selectedLocation = null"
      @saved="onLocationSaved"
    />

    <!-- 2. Location Stock Drawer / Modal -->
    <LocationStockModal 
      :isOpen="showStockModal"
      :location="selectedLocation"
      @close="showStockModal = false; selectedLocation = null"
      @transfer="openTransferModal"
    />

    <!-- 3. Stock Transfer Modal (Wizard) -->
    <StockTransferModal 
      :isOpen="showTransferModal"
      :locations="locations"
      :allProducts="vm.products.value"
      :initialSourceLocation="transferSourceLocation"
      @close="showTransferModal = false; transferSourceLocation = null"
      @created="onTransferCreated"
    />

    <!-- 4. Stock Transfer Details Modal -->
    <StockTransferDetailsModal 
      :isOpen="showTransferDetailsModal"
      :transfer="selectedTransfer"
      @close="showTransferDetailsModal = false; selectedTransfer = null"
      @updated="onTransferUpdated"
    />

    <!-- 5. Internal Consumption Modal -->
    <InternalConsumptionModal 
      :isOpen="showConsumptionModal"
      :locations="locations"
      :allProducts="vm.products.value"
      @close="showConsumptionModal = false"
      @consumed="onConsumptionRecorded"
    />

    <!-- 6. Bus Delivery Animation Modal (Dispatch & Receive) -->
    <StockTransferSuccessModal 
      :isOpen="showSuccessModal"
      :mode="successModalMode"
      :transfer="successModalTransfer"
      @close="showSuccessModal = false; successModalTransfer = null"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { 
  Warehouse, 
  Boxes, 
  ArrowLeftRight, 
  ScrollText, 
  UtensilsCrossed, 
  Plus, 
  RotateCw, 
  Coins, 
  Truck, 
  Store, 
  Search, 
  Pencil, 
  Trash2, 
  ArrowRight, 
  Download 
} from 'lucide-vue-next';
import Toast from '../components/common/Toast.vue';
import LocationFormModal from '../components/warehouse/LocationFormModal.vue';
import LocationStockModal from '../components/warehouse/LocationStockModal.vue';
import StockTransferModal from '../components/warehouse/StockTransferModal.vue';
import StockTransferDetailsModal from '../components/warehouse/StockTransferDetailsModal.vue';
import InternalConsumptionModal from '../components/warehouse/InternalConsumptionModal.vue';
import StockTransferSuccessModal from '../components/warehouse/StockTransferSuccessModal.vue';

import type { 
  InventoryLocation, 
  StockTransfer, 
  StockMovement, 
  InternalConsumptionResponse, 
  StoreBranchInfo, 
  LocationType, 
  StockTransferStatus, 
  StockMovementType 
} from '../models/types';
import { warehouseService } from '../services/warehouseService';
import { useAppViewModel } from '../viewmodels/useAppViewModel';
import { t } from '../i18n';

const route = useRoute();
const router = useRouter();
const vm = useAppViewModel();

// Permissions & Role Access
const canManageLocations = computed(() => 
  vm.userRole.value === 'ADMIN' || vm.userRole.value === 'SUPER_ADMIN' || vm.hasPermission('location:create') || vm.hasPermission('location:edit')
);

const canTransfer = computed(() => 
  vm.userRole.value === 'ADMIN' || vm.userRole.value === 'SUPER_ADMIN' || vm.hasPermission('stock_transfer:create')
);

const canConsume = computed(() => 
  vm.userRole.value === 'ADMIN' || vm.userRole.value === 'SUPER_ADMIN' || vm.hasPermission('inventory:consume')
);

// State
const activeTab = ref<'locations' | 'transfers' | 'ledger' | 'consumption'>('locations');
const isLoading = ref(false);
const toastMessage = ref<string | null>(null);
const toastType = ref<'success' | 'error' | 'info'>('success');

// Data Lists
const locations = ref<InventoryLocation[]>([]);
const branches = ref<StoreBranchInfo[]>([]);
const transfers = ref<StockTransfer[]>([]);
const ledgerMovements = ref<StockMovement[]>([]);
const consumptionList = ref<InternalConsumptionResponse[]>([]);

// Filter States
const locationSearch = ref('');
const transferFilterStatus = ref<string>('ALL');
const ledgerDateRange = ref('7days');
const ledgerLocationFilter = ref('');
const ledgerTypeFilter = ref<StockMovementType | ''>('');

// Modals State
const showLocationModal = ref(false);
const showStockModal = ref(false);
const showTransferModal = ref(false);
const showTransferDetailsModal = ref(false);
const showConsumptionModal = ref(false);
const showSuccessModal = ref(false);
const successModalMode = ref<'dispatch' | 'receive'>('dispatch');
const successModalTransfer = ref<StockTransfer | null>(null);

const selectedLocation = ref<InventoryLocation | null>(null);
const transferSourceLocation = ref<InventoryLocation | null>(null);
const selectedTransfer = ref<StockTransfer | null>(null);

const activeTabLabel = computed(() => {
  switch (activeTab.value) {
    case 'locations': return t('warehouses.tabLocations');
    case 'transfers': return t('warehouses.tabTransfers');
    case 'ledger': return t('warehouses.tabLedger');
    case 'consumption': return t('warehouses.tabConsumption');
    default: return 'Warehouses & Logistics';
  }
});

const activeTabIcon = computed(() => {
  switch (activeTab.value) {
    case 'locations': return Warehouse;
    case 'transfers': return ArrowLeftRight;
    case 'ledger': return ScrollText;
    case 'consumption': return UtensilsCrossed;
    default: return Warehouse;
  }
});

// Watch URL query for tab changes from sidebar submenus
watch(() => route.query.tab, (tabVal) => {
  if (tabVal && ['locations', 'transfers', 'ledger', 'consumption'].includes(tabVal as string)) {
    activeTab.value = tabVal as any;
  } else {
    activeTab.value = 'locations';
  }
}, { immediate: true });

const switchTab = (tabId: string) => {
  activeTab.value = tabId as any;
  router.replace({ path: '/warehouses', query: { tab: tabId } });
};

// Data Loading
const loadAllData = async () => {
  isLoading.value = true;
  try {
    const [locs, brs] = await Promise.all([
      warehouseService.getLocations(),
      warehouseService.getBranches()
    ]);
    locations.value = locs;
    branches.value = brs;

    // Load transfers & ledger
    await Promise.all([
      fetchTransfers(),
      fetchLedger()
    ]);
  } catch (err: any) {
    console.error('Failed to load warehouse data:', err);
    showToast(err.message || 'Failed to load warehouse data', 'error');
  } finally {
    isLoading.value = false;
  }
};

const fetchTransfers = async () => {
  try {
    const res = await warehouseService.getTransfers({ size: 50 });
    transfers.value = res.content || [];
  } catch (err) {
    console.error('Failed to fetch transfers:', err);
  }
};

const fetchLedger = async () => {
  try {
    const today = new Date();
    let startDate: string | undefined;
    if (ledgerDateRange.value === 'today') {
      startDate = today.toISOString().slice(0, 10);
    } else if (ledgerDateRange.value === 'yesterday') {
      const y = new Date(today);
      y.setDate(today.getDate() - 1);
      startDate = y.toISOString().slice(0, 10);
    } else if (ledgerDateRange.value === '7days') {
      const d = new Date(today);
      d.setDate(today.getDate() - 7);
      startDate = d.toISOString().slice(0, 10);
    } else if (ledgerDateRange.value === '30days') {
      const d = new Date(today);
      d.setDate(today.getDate() - 30);
      startDate = d.toISOString().slice(0, 10);
    }

    const res = await warehouseService.getInventoryLedger({
      locationId: ledgerLocationFilter.value || undefined,
      type: ledgerTypeFilter.value || undefined,
      startDate,
      size: 50
    });
    ledgerMovements.value = res.content || [];
  } catch (err) {
    console.error('Failed to fetch ledger:', err);
  }
};

onMounted(() => {
  loadAllData();
});

// Computed Metrics
const warehouseCount = computed(() => 
  locations.value.filter(l => l.locationType === 'WAREHOUSE').length
);

const branchStockCount = computed(() => 
  locations.value.filter(l => l.locationType !== 'WAREHOUSE').length
);

const totalStockValuation = computed(() => {
  // Aggregate approximate valuation from products
  return vm.products.value.reduce((sum, p) => sum + ((p.stock || 0) * (p.cost || 0)), 0);
});

const inTransitValuation = computed(() => 
  transfers.value
    .filter(t => t.status === 'IN_TRANSIT' || t.status === 'PARTIALLY_RECEIVED')
    .reduce((sum, t) => sum + (t.remainingCostValue ?? t.totalCostValue ?? 0), 0)
);

const inTransitTransfersCount = computed(() => 
  transfers.value.filter(t => t.status === 'IN_TRANSIT' || t.status === 'PARTIALLY_RECEIVED').length
);

// Location Filtered List
const filteredLocations = computed(() => {
  if (!locationSearch.value.trim()) return locations.value;
  const q = locationSearch.value.toLowerCase().trim();
  return locations.value.filter(l => 
    l.name.toLowerCase().includes(q) ||
    (l.code && l.code.toLowerCase().includes(q)) ||
    (l.address && l.address.toLowerCase().includes(q))
  );
});

// Transfers Status Filter
const transferStatuses = [
  { id: 'ALL', label: 'All Transfers' },
  { id: 'IN_TRANSIT', label: 'In Transit' },
  { id: 'PARTIALLY_RECEIVED', label: 'Partially Received' },
  { id: 'PENDING_APPROVAL', label: 'Pending Approval' },
  { id: 'COMPLETED', label: 'Completed' },
  { id: 'CANCELLED', label: 'Cancelled' }
];

const filteredTransfers = computed(() => {
  if (transferFilterStatus.value === 'ALL') return transfers.value;
  return transfers.value.filter(t => t.status === transferFilterStatus.value);
});

// Modal Handlers
const openAddLocationModal = () => {
  selectedLocation.value = null;
  showLocationModal.value = true;
};

const openEditLocationModal = (loc: InventoryLocation) => {
  selectedLocation.value = loc;
  showLocationModal.value = true;
};

const openStockDrawer = (loc: InventoryLocation) => {
  selectedLocation.value = loc;
  showStockModal.value = true;
};

const openTransferModal = (sourceLoc?: InventoryLocation) => {
  transferSourceLocation.value = sourceLoc || null;
  showStockModal.value = false;
  showTransferModal.value = true;
};

const openTransferDetails = (tr: StockTransfer) => {
  selectedTransfer.value = tr;
  showTransferDetailsModal.value = true;
};

const openConsumptionModal = (loc?: InventoryLocation) => {
  showConsumptionModal.value = true;
};

const handleDeleteLocation = async (loc: InventoryLocation) => {
  if (!confirm(`Are you sure you want to delete ${loc.name}? Locations with active stock or in-transit transfers cannot be deleted.`)) {
    return;
  }
  try {
    await warehouseService.deleteLocation(loc.id);
    locations.value = locations.value.filter(l => l.id !== loc.id);
    showToast(t('warehouses.locationDeletedSuccess'), 'success');
  } catch (err: any) {
    showToast(err.message || 'Failed to delete location', 'error');
  }
};

const onLocationSaved = (saved: InventoryLocation) => {
  const idx = locations.value.findIndex(l => l.id === saved.id);
  if (idx >= 0) {
    locations.value[idx] = saved;
    showToast(t('warehouses.locationUpdatedSuccess'), 'success');
  } else {
    locations.value.push(saved);
    showToast(t('warehouses.locationCreatedSuccess'), 'success');
  }
};

const onTransferCreated = (created: StockTransfer) => {
  transfers.value.unshift(created);
  fetchLedger();
  vm.fetchProducts().catch(() => {});
  // Open Delivery Bus Animation in Dispatch Mode
  successModalTransfer.value = created;
  successModalMode.value = 'dispatch';
  showSuccessModal.value = true;
};

const onTransferUpdated = (updated: StockTransfer) => {
  const idx = transfers.value.findIndex(t => t.id === updated.id);
  if (idx >= 0) {
    transfers.value[idx] = updated;
  }
  showTransferDetailsModal.value = false;
  selectedTransfer.value = null;
  fetchLedger();
  warehouseService.getLocations().then(locs => { locations.value = locs; }).catch(() => {});
  vm.fetchProducts().catch(() => {});

  if (updated.status === 'COMPLETED' || updated.status === 'PARTIALLY_RECEIVED') {
    // Open Delivery Bus Animation in Receive Mode (Arrived / Partial or Full)
    successModalTransfer.value = updated;
    successModalMode.value = 'receive';
    showSuccessModal.value = true;
  } else if (updated.status === 'CANCELLED') {
    showToast(t('warehouses.transferCancelledSuccess') || 'Stock transfer cancelled', 'info');
  } else {
    showToast(t('warehouses.transferConfirmedSuccess'), 'success');
  }
};

const onConsumptionRecorded = (res: InternalConsumptionResponse) => {
  consumptionList.value.unshift(res);
  showToast(t('warehouses.consumptionSuccess'), 'success');
  fetchLedger();
};

const exportLedgerCsv = () => {
  if (ledgerMovements.value.length === 0) return;
  const headers = ['Timestamp', 'Type', 'Product', 'Location', 'Counterpart', 'QtyChange', 'BalanceBefore', 'BalanceAfter', 'UnitCost', 'Valuation', 'Actor'];
  const rows = ledgerMovements.value.map(m => [
    m.createdAt || '',
    m.type,
    `"${(m.productName || '').replace(/"/g, '""')}"`,
    `"${(m.locationName || m.branchName || '').replace(/"/g, '""')}"`,
    `"${(m.counterpartLocationName || '').replace(/"/g, '""')}"`,
    m.quantity,
    m.balanceBefore ?? '',
    m.balanceAfter ?? '',
    m.unitCost || m.costPrice || 0,
    (m.quantity || 0) * (m.unitCost || m.costPrice || 0),
    `"${(m.createdByName || '').replace(/"/g, '""')}"`
  ]);
  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `inventory_movement_ledger_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Utilities & Formatting
const showToast = (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
  toastMessage.value = msg;
  toastType.value = type;
};

const getLocationTypeShort = (type?: LocationType) => {
  switch (type) {
    case 'WAREHOUSE': return 'Central WH';
    case 'BRANCH_DEFAULT': return 'Branch Stock';
    case 'BRANCH_WAREHOUSE': return 'Storeroom';
    default: return 'Location';
  }
};

const getLocationTypeBadgeClass = (type?: LocationType) => {
  switch (type) {
    case 'WAREHOUSE': return 'bg-indigo-500/10 text-indigo-700 border-indigo-500/30';
    case 'BRANCH_DEFAULT': return 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30';
    case 'BRANCH_WAREHOUSE': return 'bg-amber-500/10 text-amber-700 border-amber-500/30';
    default: return 'bg-surface-container text-on-surface-variant border-outline-variant';
  }
};

const formatTransferStatus = (st: StockTransferStatus) => {
  switch (st) {
    case 'IN_TRANSIT': return 'In Transit';
    case 'PARTIALLY_RECEIVED': return 'Partially Received';
    case 'PENDING_APPROVAL': return 'Pending Approval';
    case 'COMPLETED': return 'Completed';
    case 'CANCELLED': return 'Cancelled';
    case 'REJECTED': return 'Rejected';
    default: return st;
  }
};

const getStatusBadgeClass = (st: StockTransferStatus) => {
  switch (st) {
    case 'IN_TRANSIT': return 'bg-amber-500/10 text-amber-700 border-amber-500/30';
    case 'PARTIALLY_RECEIVED': return 'bg-purple-500/10 text-purple-700 border-purple-500/30';
    case 'PENDING_APPROVAL': return 'bg-blue-500/10 text-blue-700 border-blue-500/30';
    case 'COMPLETED': return 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30';
    case 'CANCELLED': return 'bg-error/10 text-error border-error/30';
    case 'REJECTED': return 'bg-error/10 text-error border-error/30';
    default: return 'bg-surface-container text-on-surface-variant border-outline-variant';
  }
};

const getMovementTypeBadgeClass = (type: StockMovementType) => {
  switch (type) {
    case 'PURCHASE': return 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30';
    case 'TRANSFER_IN': return 'bg-blue-500/10 text-blue-700 border-blue-500/30';
    case 'TRANSFER_OUT': return 'bg-purple-500/10 text-purple-700 border-purple-500/30';
    case 'SALE': return 'bg-orange-500/10 text-orange-700 border-orange-500/30';
    case 'INTERNAL_USE': return 'bg-amber-500/10 text-amber-700 border-amber-500/30';
    case 'DAMAGED': return 'bg-error/10 text-error border-error/30';
    default: return 'bg-surface-container text-on-surface-variant border-outline-variant';
  }
};

const isPositiveMovement = (type: StockMovementType) => {
  return ['PURCHASE', 'TRANSFER_IN', 'ADJUSTMENT_IN', 'RETURN'].includes(type);
};

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
};
</script>
