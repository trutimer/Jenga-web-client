<template>
  <div class="w-full max-w-[1720px] mx-auto py-2 font-sans select-none animate-fade-up px-2 sm:px-4 md:px-6">
    
    <!-- HEADER SECTION -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 bg-surface">
      <div>
        <h1 class="text-[32px] font-bold text-on-surface tracking-tight leading-tight">{{ $t('inventory.title') }}</h1>
        <p class="text-sm text-on-surface-variant mt-1">{{ $t('inventory.subtitle') }}</p>
      </div>
      
      <!-- ACTION BUTTONS -->
      <div class="flex items-center gap-3">
        <button 
          @click="handleRefresh"
          :disabled="vm.isFetchingProducts.value || isFetchingInactive"
          class="h-10 px-3.5 rounded-lg border border-outline hover:bg-surface-container-low text-on-surface-variant font-medium text-sm flex items-center gap-2 transition-all cursor-pointer shadow-sm text-center bg-surface-container-lowest disabled:opacity-60"
          :title="$t('inventory.refreshCatalog')"
        >
          <RotateCw :class="['w-4 h-4 text-on-surface-variant', (vm.isFetchingProducts.value || isFetchingInactive) ? 'animate-spin text-primary' : '']" />
          <span>{{ $t('common.refresh') }}</span>
        </button>

        <button 
          v-if="vm.hasPermission('inventory:create')"
          @click="showImportModal = true"
          class="h-10 px-4 rounded-lg border border-outline hover:bg-surface-container-low text-on-surface-variant font-medium text-sm flex items-center gap-2 transition-all cursor-pointer shadow-sm text-center bg-surface-container-lowest"
        >
          <Upload class="w-4 h-4 text-on-surface-variant" />
          <span>{{ $t('inventory.bulkImport') }}</span>
        </button>
        
        <button 
          v-if="vm.hasPermission('inventory:create')"
          @click="showAddModal = true"
          class="h-10 px-4.5 rounded-lg font-bold text-sm text-white flex items-center gap-2 transition-all cursor-pointer shadow-sm text-center border-0 bg-primary text-on-primary"
        >
          <Plus class="w-4.5 h-4.5 text-on-primary" />
          <span>{{ $t('inventory.addProduct') }}</span>
        </button>
      </div>
    </div>

    <!-- MAIN INVENTORY WORKBENCH (FULL WIDTH) -->
    <div class="w-full space-y-4 border-t border-outline-variant/50 pt-4">
      
      <!-- 1. TOP FILTER TOOLBAR (SEARCH & FILTERS BUTTON ONLY) -->
      <div class="bg-surface-container-lowest p-2.5 sm:p-3 rounded-2xl border border-outline-variant/60 shadow-xs flex items-center justify-between gap-3">
        <!-- Search Input -->
        <div class="relative flex-1 max-w-md sm:max-w-lg">
          <Search class="w-4 h-4 text-outline absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input 
            type="text"
            v-model="productNameSearch"
            @input="currentPage = 1"
            :placeholder="$t('inventory.searchProductPlaceholder')"
            class="w-full bg-surface-container-low pl-9 pr-8 py-2 border border-outline-variant rounded-xl text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-semibold placeholder:text-outline text-on-surface"
          />
          <button 
            v-if="productNameSearch"
            type="button"
            @click="productNameSearch = ''; currentPage = 1"
            class="absolute right-2.5 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface cursor-pointer bg-transparent border-0 p-1"
          >
            <X class="w-3.5 h-3.5" />
          </button>
        </div>

        <!-- "Filters" Button opening side panel -->
        <button 
          type="button"
          @click="showFilterDrawer = true"
          class="h-9 px-4 rounded-xl border text-xs font-bold font-sans flex items-center gap-2 transition-all cursor-pointer shadow-xs shrink-0"
          :class="activePanelFiltersCount > 0 
            ? 'bg-primary text-white border-primary shadow-sm hover:opacity-95' 
            : 'bg-surface-container-low border-outline-variant/60 text-on-surface hover:bg-surface-container hover:border-outline'"
          title="Open filters"
        >
          <SlidersHorizontal class="w-3.5 h-3.5" />
          <span>{{ $t('inventory.filters') }}</span>
          <span 
            v-if="activePanelFiltersCount > 0" 
            class="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-black bg-white text-primary"
          >
            {{ activePanelFiltersCount }}
          </span>
        </button>
      </div>

      <!-- 2. ACTIVE FILTER BADGES ROW (WHEN ACTIVE) -->
      <div v-if="hasActiveFilters" class="flex flex-wrap items-center justify-between gap-2 text-sm select-none py-1 px-1">
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-xs text-on-surface-variant font-bold uppercase tracking-wider">{{ $t('inventory.activeFilterOverlays') }}</span>
          
          <!-- Catalog Mode Badge -->
          <div 
            v-if="showInactive" 
            class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-error/10 text-error rounded-full text-xs font-bold border border-error/30 animate-fade-in"
          >
            <EyeOff class="w-3 h-3 stroke-[2.5px]" />
            <span>{{ $t('inventory.catalogInactiveBadge') }}</span>
            <button 
              @click="toggleShowInactive(false)"
              class="text-error/70 hover:text-error cursor-pointer ml-0.5 bg-transparent border-0"
              :title="$t('inventory.showActiveProducts')"
            >
              <X class="w-3 h-3 stroke-[2.5px]" />
            </button>
          </div>

          <div 
            v-if="productNameSearch.trim()" 
            class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-surface-container text-on-surface-variant rounded-full text-xs font-bold border border-outline-variant/50"
          >
            <span>{{ $t('inventory.searchFilterBadge', { query: productNameSearch }) }}</span>
            <button 
              @click="productNameSearch = ''; currentPage = 1"
              class="text-outline hover:text-on-surface-variant cursor-pointer ml-0.5 bg-transparent border-0"
            >
              <X class="w-3 h-3 stroke-[2.5px]" />
            </button>
          </div>

          <div 
            v-for="cat in selectedCategories" 
            :key="cat" 
            class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-surface-container text-on-surface-variant rounded-full text-xs font-bold border border-outline-variant/50"
          >
            <span>{{ $t('inventory.categoryFilterBadge', { cat }) }}</span>
            <button 
              @click="toggleCategory(cat)"
              class="text-outline hover:text-on-surface-variant cursor-pointer ml-0.5 bg-transparent border-0"
            >
              <X class="w-3 h-3 stroke-[2.5px]" />
            </button>
          </div>

          <div 
            v-if="stockStatus !== 'All'" 
            class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-surface-container text-on-surface-variant rounded-full text-xs font-bold border border-outline-variant/50"
          >
            <span>{{ $t('inventory.statusFilterBadge', { status: stockStatus }) }}</span>
            <button 
              @click="selectStockStatus('All')"
              class="text-outline hover:text-on-surface-variant cursor-pointer ml-0.5 bg-transparent border-0"
            >
              <X class="w-3 h-3 stroke-[2.5px]" />
            </button>
          </div>

          <div 
            v-for="sup in selectedSuppliers" 
            :key="sup" 
            class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-surface-container text-on-surface-variant rounded-full text-xs font-bold border border-outline-variant/50"
          >
            <span class="truncate max-w-[120px]">{{ $t('inventory.supplierFilterBadge', { sup }) }}</span>
            <button 
              @click="toggleSupplier(sup)"
              class="text-outline hover:text-on-surface-variant cursor-pointer ml-0.5 bg-transparent border-0"
            >
              <X class="w-3 h-3 stroke-[2.5px]" />
            </button>
          </div>

          <button 
            @click="handleResetFilters"
            class="text-xs text-primary hover:underline font-bold cursor-pointer bg-transparent border-0 ml-1"
          >
            {{ $t('inventory.resetFilters') }}
          </button>
        </div>

        <span class="text-xs font-mono font-medium text-outline">
          Showing {{ filteredProducts.length }} {{ filteredProducts.length === 1 ? 'product' : 'products' }}
        </span>
      </div>

        <!-- Inactive Mode Notice Banner -->
        <div v-if="showInactive" class="p-3.5 bg-amber-500/10 border border-amber-500/25 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900 font-medium animate-fade-in">
          <div class="flex items-center gap-2.5">
            <AlertTriangle class="w-4.5 h-4.5 text-amber-600 shrink-0" />
            <div>
              <span class="font-bold block text-[13px] text-amber-950">{{ $t('inventory.inactiveNoticeTitle') }}</span>
              <span class="text-amber-800 text-[11.5px]">{{ $t('inventory.inactiveNoticeDesc') }}</span>
            </div>
          </div>
          <button 
            type="button"
            @click="toggleShowInactive(false)" 
            class="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-900 font-bold text-xs cursor-pointer border border-amber-500/30 transition-all self-start sm:self-auto shrink-0"
          >
            {{ $t('inventory.showActiveProducts') }}
          </button>
        </div>

        <!-- TABLE CONTAINER CARD -->
        <div class="border border-outline-variant rounded-xl overflow-hidden shadow-sm bg-surface-container-lowest relative min-h-[360px]">
          <!-- Jenga Logo Loading Visual Overlay -->
          <JengaLoader 
            v-if="vm.isFetchingProducts.value || isFetchingInactive" 
            overlay 
            size="lg" 
            :label="showInactive ? $t('inventory.loaderFetchingInactive') : $t('inventory.loaderFetchingProducts')" 
            :sublabel="showInactive ? $t('inventory.loaderArchivedItems') : $t('inventory.loaderSyncingCatalog')" 
          />

          <div class="overflow-x-auto w-full">
            <table class="w-full text-left border-collapse text-[13px] select-all">
            <thead class="bg-surface-container-lowest border-b border-outline-variant text-on-surface-variant font-mono text-[11px] uppercase select-none">
              <tr>
                <th class="px-3 py-3.5 pl-4 w-10 text-center">
                  <div class="w-[18px] h-[18px] rounded border border-outline flex items-center justify-center cursor-pointer bg-surface-container-lowest" />
                </th>
                <th class="px-3.5 py-3.5 font-bold min-w-[200px]">{{ $t('inventory.tableProductNameBarcode') }}</th>
                <th class="px-3.5 py-3.5 font-bold">{{ $t('inventory.tableCategory') }}</th>
                <th class="px-3.5 py-3.5 text-center font-bold">{{ $t('inventory.tableQty') }}</th>
                <th class="px-3.5 py-3.5 text-center font-bold">{{ $t('inventory.tableCost', { currency }) }}</th>
                <th class="px-3.5 py-3.5 text-center font-bold">{{ $t('inventory.tablePrice', { currency }) }}</th>
                <th class="px-3.5 py-3.5 text-center font-bold">{{ $t('inventory.tableWholesale', { currency }) }}</th>
                <th class="px-3.5 py-3.5 text-center font-bold">{{ $t('inventory.tableExpiryDate') }}</th>
                <th class="px-3.5 py-3.5 text-center font-bold">{{ $t('inventory.tableActions') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr 
                v-for="p in paginatedProducts" 
                :key="p.id" 
                class="hover:bg-surface-container-low transition-all font-sans"
                :class="p.stock === 0 || showInactive ? 'opacity-85 bg-surface-container/40 text-outline' : ''"
              >
                <!-- Checkbox -->
                <td class="px-3 py-3 text-center select-none">
                  <div class="w-[18px] h-[18px] rounded border border-outline flex items-center justify-center cursor-pointer bg-surface-container-lowest" />
                </td>

                <!-- Product Name & SKU Barcode -->
                <td class="px-3.5 py-3">
                  <div class="flex items-center gap-1.5 flex-wrap">
                    <span 
                      class="font-semibold text-on-surface block leading-snug"
                      :class="p.stock === 0 || showInactive ? 'text-outline/90' : ''"
                    >
                      {{ p.name }}
                    </span>
                    <span 
                      v-if="showInactive"
                      class="px-1.5 py-0.2 rounded text-[10px] font-bold bg-error/10 text-error border border-error/20 uppercase shrink-0"
                    >
                      {{ $t('inventory.inactiveTag') }}
                    </span>
                  </div>
                  <span class="font-mono text-xs text-outline block mt-0.5">{{ p.barcode || p.sku || $t('inventory.noBarcode') }}</span>
                </td>

                <!-- Category -->
                <td class="px-3.5 py-3 text-on-surface-variant font-medium text-xs">
                  {{ p.category }}
                </td>

                <!-- Quantity (QTY) -->
                <td class="px-3.5 py-3 text-center select-none">
                  <span 
                    class="px-2.5 py-1 rounded-full text-xs font-bold font-mono"
                    :class="p.stock === 0 ? 'bg-error-container text-error' : (p.stock <= p.minStock ? 'bg-warning-container text-warning' : 'bg-primary-container text-on-primary-container')"
                  >
                    {{ p.stock }}
                  </span>
                </td>

                <!-- Cost -->
                <td class="px-3.5 py-3 text-center font-mono select-all">
                  <span class="text-[13px] text-on-surface-variant block font-semibold">{{ formatCurrencyWithoutSymbol(p.cost, currency) }}</span>
                </td>

                <!-- Price -->
                <td class="px-3.5 py-3 text-center font-mono select-all">
                  <span 
                    class="text-[14px] block font-extrabold"
                    :class="p.stock === 0 ? 'text-outline' : 'text-primary'"
                  >
                    {{ formatCurrencyWithoutSymbol(p.price, currency) }}
                  </span>
                </td>

                <!-- Wholesale Price -->
                <td class="px-3.5 py-3 text-center font-mono select-all">
                  <span class="text-[13px] text-on-surface-variant block font-semibold">
                    {{ p.wholesalePrice ? formatCurrencyWithoutSymbol(p.wholesalePrice, currency) : 'N/A' }}
                  </span>
                </td>

                <!-- Expiry Date -->
                <td class="px-3.5 py-3 text-center font-mono select-all">
                  <div class="flex flex-col items-center gap-1">
                    <span class="text-[13px] text-on-surface-variant block font-semibold">
                      {{ p.expiryDate ? new Date(p.expiryDate).toLocaleDateString() : 'N/A' }}
                    </span>
                    <span 
                      v-if="getProductStatus(p) === 'Expired'"
                      class="px-2 py-0.5 rounded text-[10px] font-bold bg-error-container text-error uppercase"
                    >
                      {{ $t('inventory.expiredTag') }}
                    </span>
                    <span 
                      v-else-if="getProductStatus(p) === 'Soon to expire'"
                      class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 uppercase"
                    >
                      {{ $t('inventory.soonToExpireTag') }}
                    </span>
                  </div>
                </td>

                <!-- Actions -->
                <td class="px-3.5 py-3 text-center select-none whitespace-nowrap">
                  <div class="flex items-center justify-center gap-2">
                    <button 
                      v-if="vm.hasPermission('inventory:edit')"
                      @click.stop="openEditModal(p)"
                      class="p-1.5 hover:bg-surface-container rounded-lg text-on-surface-variant hover:text-on-primary-container transition-colors cursor-pointer border-0 bg-transparent"
                      :title="$t('inventory.editProductTooltip')"
                    >
                      <Pencil class="w-4.5 h-4.5" />
                    </button>
                    <button 
                      v-if="!showInactive && vm.hasPermission('inventory:edit')"
                      @click.stop="openRestockModal(p)"
                      class="p-1.5 hover:bg-surface-container rounded-lg text-on-surface-variant hover:text-on-primary-container transition-colors cursor-pointer border-0 bg-transparent"
                      :title="$t('inventory.restockTooltip')"
                    >
                      <PlusCircle class="w-4.5 h-4.5" />
                    </button>
                    <button 
                      v-if="!showInactive && (vm.hasPermission('inventory:delete') || vm.hasPermission('inventory:edit'))"
                      @click.stop="confirmDeleteProduct(p)"
                      class="p-1.5 hover:bg-error-container/30 rounded-lg text-on-surface-variant hover:text-error transition-colors cursor-pointer border-0 bg-transparent"
                      :title="$t('inventory.deleteProductTooltip')"
                    >
                      <Trash2 class="w-4.5 h-4.5" />
                    </button>
                  </div>
                </td>
              </tr>

              <tr v-if="filteredProducts.length === 0">
                <td colSpan="9" class="py-20 text-center select-none text-outline">
                  <ImageOff class="w-10 h-10 mx-auto text-outline-variant mb-2 stroke-[1.5px]" />
                  <p class="font-medium">{{ $t('inventory.noRowsMatch') }}</p>
                  <button 
                    @click="handleResetFilters"
                    class="text-sm font-semibold underline mt-1 cursor-pointer bg-transparent border-0 text-primary"
                  >
                    {{ $t('inventory.clearActiveFilters') }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          </div>

          <!-- BOTTOM PAGINATION CONTROLLER CARD -->
          <div class="p-4 bg-surface-container-lowest border-t border-outline-variant/50 flex flex-col sm:flex-row justify-between items-center gap-4 select-none">
            <div class="text-sm text-on-surface-variant font-medium">
              {{ $t('inventory.paginationShowing', {
                from: filteredProducts.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1,
                to: Math.min(currentPage * itemsPerPage, filteredProducts.length),
                total: filteredProducts.length
              }) }}
            </div>

            <!-- Pagination buttons & Jump to page -->
            <div class="flex flex-wrap items-center gap-2 font-sans">
              <!-- First & Prev Page -->
              <div class="flex items-center gap-1">
                <button 
                  :disabled="currentPage === 1"
                  @click="currentPage = 1"
                  class="w-8 h-8 rounded border border-outline-variant flex items-center justify-center hover:bg-surface-container-low transition-colors disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer bg-surface-container-lowest"
                  :title="$t('inventory.paginationFirst')"
                >
                  <ChevronsLeft class="w-4 h-4 text-on-surface-variant" />
                </button>

                <button 
                  :disabled="currentPage === 1"
                  @click="currentPage = Math.max(1, currentPage - 1)"
                  class="w-8 h-8 rounded border border-outline-variant flex items-center justify-center hover:bg-surface-container-low transition-colors disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer bg-surface-container-lowest"
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
                    class="w-8 h-8 rounded border flex items-center justify-center text-xs font-bold transition-all cursor-pointer shrink-0"
                    :class="currentPage === pg ? 'bg-primary border-primary text-on-primary shadow-xs' : 'bg-surface-container-lowest border-outline-variant text-on-surface-variant hover:bg-surface-container-low'"
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
                  class="w-8 h-8 rounded border border-outline-variant flex items-center justify-center hover:bg-surface-container-low transition-colors disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer bg-surface-container-lowest"
                  :title="$t('inventory.paginationNext')"
                >
                  <ChevronRight class="w-4 h-4 text-on-surface-variant" />
                </button>

                <button 
                  :disabled="currentPage === totalPages"
                  @click="currentPage = totalPages"
                  class="w-8 h-8 rounded border border-outline-variant flex items-center justify-center hover:bg-surface-container-low transition-colors disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer bg-surface-container-lowest"
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
                  class="w-12 h-8 text-center bg-surface-container-low border border-outline-variant rounded text-xs font-bold outline-none focus:border-primary text-on-surface font-mono"
                />
                <span>{{ $t('inventory.paginationOfTotal', { total: totalPages }) }}</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      <!-- SLIDE-OVER FILTER DRAWER (SHEET) -->
      <Transition name="drawer">
        <div v-if="showFilterDrawer" class="fixed inset-0 z-50 overflow-hidden font-sans">
          <!-- Backdrop -->
          <div 
            class="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity" 
            @click="showFilterDrawer = false"
          ></div>

          <div class="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div class="w-screen max-w-md bg-surface-container-lowest shadow-2xl border-l border-outline-variant flex flex-col justify-between drawer-content">
              
              <!-- Drawer Header -->
              <div class="p-5 border-b border-outline-variant/50 flex items-center justify-between">
                <div class="flex items-center gap-2.5">
                  <div class="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <SlidersHorizontal class="w-4 h-4" />
                  </div>
                  <div>
                    <h3 class="text-base font-bold text-on-surface">{{ $t('inventory.filters') }}</h3>
                    <p class="text-xs text-on-surface-variant">Filter products by multiple criteria</p>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <button 
                    v-if="hasActiveFilters"
                    @click="handleResetFilters"
                    class="text-xs font-bold text-primary hover:underline cursor-pointer bg-transparent border-0 px-2 py-1"
                  >
                    {{ $t('inventory.resetFilters') }}
                  </button>
                  <button 
                    @click="showFilterDrawer = false"
                    class="w-8 h-8 rounded-lg hover:bg-surface-container-low text-outline hover:text-on-surface flex items-center justify-center cursor-pointer transition-colors border-0 bg-transparent"
                  >
                    <X class="w-5 h-5" />
                  </button>
                </div>
              </div>

              <!-- Drawer Scrollable Body -->
              <div class="p-5 overflow-y-auto space-y-6 flex-1">
                
                <!-- FILTER 1: CATALOG VISIBILITY (ACTIVE / INACTIVE) -->
                <div class="space-y-3">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-bold text-outline uppercase tracking-wider">{{ $t('inventory.catalogVisibility') }}</span>
                    <span 
                      v-if="!showInactive"
                      class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-primary/10 text-primary border border-primary/20"
                    >
                      {{ $t('inventory.activeCount', { count: vm.products.value.length }) }}
                    </span>
                    <span 
                      v-else
                      class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-error/10 text-error border border-error/20"
                    >
                      {{ $t('inventory.inactiveCount', { count: inactiveProducts.length }) }}
                    </span>
                  </div>

                  <div 
                    @click="toggleShowInactive(!showInactive)" 
                    class="flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer select-none"
                    :class="showInactive ? 'bg-error/5 border-error/30 text-error' : 'bg-surface-container-low border-outline-variant text-on-surface hover:bg-surface-container'"
                  >
                    <div class="flex items-center gap-2.5">
                      <div 
                        class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        :class="showInactive ? 'bg-error/15 text-error' : 'bg-surface-container-high text-on-surface-variant'"
                      >
                        <EyeOff v-if="showInactive" class="w-4 h-4" />
                        <Eye v-else class="w-4 h-4" />
                      </div>
                      <div>
                        <p class="text-xs font-bold">{{ showInactive ? $t('inventory.inactiveProducts') : $t('inventory.activeProducts') }}</p>
                        <p class="text-[11px] text-on-surface-variant/80 mt-0.5">
                          {{ showInactive ? $t('inventory.deactivatedItems') : $t('inventory.liveCatalogItems') }}
                        </p>
                      </div>
                    </div>
                    
                    <div 
                      class="w-9 h-5 rounded-full transition-colors relative p-0.5 flex items-center shrink-0"
                      :class="showInactive ? 'bg-error' : 'bg-surface-container-highest'"
                    >
                      <div 
                        class="w-4 h-4 rounded-full bg-white shadow-xs transition-transform duration-200"
                        :class="showInactive ? 'translate-x-4' : 'translate-x-0'"
                      />
                    </div>
                  </div>
                </div>

                <!-- FILTER 2: STOCK STATUS -->
                <div class="space-y-2.5">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-bold text-outline uppercase tracking-wider">{{ $t('inventory.stockStatus') }}</span>
                    <span v-if="stockStatus !== 'All'" class="text-[11px] font-mono font-bold text-primary">Filtered</span>
                  </div>
                  <div class="grid grid-cols-2 gap-2">
                    <button 
                      v-for="st in stockStatuses" 
                      :key="st.value" 
                      type="button"
                      @click="selectStockStatus(st.value)"
                      class="px-3 py-2 rounded-xl text-xs font-semibold border transition-all text-left flex items-center justify-between cursor-pointer"
                      :class="stockStatus === st.value 
                        ? 'border-primary bg-primary/10 text-primary font-bold shadow-xs' 
                        : 'border-outline-variant/60 bg-surface-container-low text-on-surface-variant hover:border-outline'"
                    >
                      <div class="flex items-center gap-1.5 truncate">
                        <span 
                          class="w-2 h-2 rounded-full shrink-0" 
                          :class="st.value === 'In Stock' 
                            ? 'bg-emerald-500' 
                            : (st.value === 'Low Stock' 
                              ? 'bg-amber-500' 
                              : (st.value === 'Out of Stock' || st.value === 'Expired' 
                                ? 'bg-rose-500' 
                                : 'bg-outline-variant'))"
                        ></span>
                        <span class="truncate">{{ st.label }}</span>
                      </div>
                      <Check v-if="stockStatus === st.value" class="w-3.5 h-3.5 text-primary shrink-0" />
                    </button>
                  </div>
                </div>

                <!-- FILTER 3: CATEGORIES -->
                <div class="space-y-2.5">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-bold text-outline uppercase tracking-wider">{{ $t('inventory.category') }}</span>
                    <div class="flex items-center gap-2">
                      <button 
                        v-if="selectedCategories.length > 0"
                        @click="selectedCategories = []; currentPage = 1"
                        class="text-[11px] text-outline hover:text-primary cursor-pointer bg-transparent border-0"
                      >
                        Clear
                      </button>
                      <span 
                        v-if="selectedCategories.length > 0" 
                        class="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-primary/10 text-primary"
                      >
                        {{ selectedCategories.length }}
                      </span>
                    </div>
                  </div>

                  <!-- Category Search within drawer -->
                  <div class="relative">
                    <Search class="w-3.5 h-3.5 text-outline absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input 
                      type="text" 
                      v-model="categorySearch" 
                      placeholder="Filter categories..." 
                      class="w-full bg-surface-container-low pl-8 pr-2 py-1.5 border border-outline-variant rounded-lg text-xs outline-none text-on-surface focus:border-primary font-medium"
                    />
                  </div>

                  <div class="space-y-2 max-h-52 overflow-y-auto pr-1">
                    <label 
                      v-for="cat in filteredCategoriesList" 
                      :key="cat" 
                      class="flex items-center justify-between p-2 rounded-xl bg-surface-container-low hover:bg-surface-container border border-outline-variant/40 cursor-pointer text-xs font-semibold text-on-surface-variant"
                    >
                      <div class="flex items-center gap-2 min-w-0">
                        <div 
                          @click="toggleCategory(cat)"
                          class="w-4 h-4 rounded border flex items-center justify-center transition-all shrink-0"
                          :class="selectedCategories.includes(cat) ? 'border-primary bg-primary text-white' : 'border-outline bg-surface-container-lowest text-transparent'"
                        >
                          <Check v-if="selectedCategories.includes(cat)" class="w-3 h-3 stroke-[3px]" />
                        </div>
                        <span class="truncate">{{ cat }}</span>
                      </div>
                      <span class="text-[10px] font-mono text-outline font-bold">({{ countByCategory[cat] || 0 }})</span>
                    </label>
                    <span v-if="filteredCategoriesList.length === 0" class="text-[11px] text-outline italic block text-center py-2">
                      No categories found
                    </span>
                  </div>
                </div>

                <!-- FILTER 4: SUPPLIERS -->
                <div class="space-y-2.5">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-bold text-outline uppercase tracking-wider">{{ $t('inventory.supplier') }}</span>
                    <button 
                      v-if="selectedSuppliers.length > 0"
                      @click="selectedSuppliers = []; currentPage = 1"
                      class="text-[11px] text-outline hover:text-primary cursor-pointer bg-transparent border-0"
                    >
                      Clear ({{ selectedSuppliers.length }})
                    </button>
                  </div>

                  <div class="relative">
                    <Search class="w-3.5 h-3.5 text-outline absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input 
                      type="text"
                      v-model="supplierSearch"
                      :placeholder="$t('inventory.findSupplierPlaceholder')"
                      class="w-full bg-surface-container-low pl-8 pr-2 py-1.5 border border-outline-variant rounded-lg text-xs outline-none text-on-surface focus:border-primary"
                    />
                  </div>

                  <div class="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    <label 
                      v-for="sup in suppliersList" 
                      :key="sup" 
                      class="flex items-center gap-2.5 p-2 rounded-xl bg-surface-container-low hover:bg-surface-container border border-outline-variant/40 cursor-pointer text-xs font-semibold text-on-surface-variant"
                    >
                      <div 
                        @click="toggleSupplier(sup)"
                        class="w-4 h-4 rounded border flex items-center justify-center transition-all shrink-0"
                        :class="selectedSuppliers.includes(sup) ? 'border-primary bg-primary text-white' : 'border-outline bg-surface-container-lowest text-transparent'"
                      >
                        <Check v-if="selectedSuppliers.includes(sup)" class="w-3 h-3 stroke-[3px]" />
                      </div>
                      <span class="truncate">{{ sup }}</span>
                    </label>
                    <span v-if="suppliersList.length === 0" class="text-[11px] text-outline italic block text-center py-2">
                      {{ $t('inventory.noSuppliersMatch') }}
                    </span>
                  </div>
                </div>

              </div>

              <!-- Drawer Footer -->
              <div class="p-4 border-t border-outline-variant/50 bg-surface-container-low flex items-center gap-3">
                <button 
                  type="button"
                  @click="handleResetFilters"
                  :disabled="!hasActiveFilters"
                  class="flex-1 py-2.5 rounded-xl border border-outline-variant text-xs font-bold text-on-surface-variant hover:bg-surface-container transition-colors disabled:opacity-40 cursor-pointer bg-surface"
                >
                  {{ $t('inventory.resetFilters') }}
                </button>
                <button 
                  type="button"
                  @click="showFilterDrawer = false"
                  class="flex-1 py-2.5 rounded-xl bg-primary text-white text-xs font-bold transition-all hover:opacity-95 shadow-xs cursor-pointer border-0"
                >
                  Show {{ filteredProducts.length }} Products
                </button>
              </div>

            </div>
          </div>
        </div>
      </Transition>

    <!-- MODAL 1: ADD PRODUCT FORM -->
    <div v-if="showAddModal" class="fixed inset-0 bg-surface-container-highest/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div class="w-full max-w-lg bg-surface-container-lowest rounded-xl shadow-xl border border-outline-variant/50 overflow-hidden font-sans">
        <div class="px-6 py-4.5 border-b border-outline-variant/50 flex justify-between items-center">
          <h2 class="text-[17px] font-bold text-on-surface">{{ $t('inventory.addProductModalTitle') }}</h2>
          <button 
            @click="showAddModal = false"
            class="text-outline hover:text-on-surface-variant cursor-pointer bg-transparent border-0"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <form @submit.prevent="handleAddProduct" class="p-6 space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="flex flex-col gap-1.5 col-span-2">
              <label class="text-xs font-bold text-on-surface-variant uppercase tracking-widest">{{ $t('inventory.productDisplayTitle') }}</label>
              <input 
                type="text"
                required
                v-model="newProdName"
                :placeholder="$t('inventory.productTitlePlaceholder')"
                class="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-sm font-medium outline-none text-on-surface focus:border-primary focus:ring-1 focus:ring-primary/20"
              />
            </div>

            <!-- Barcode SKU Code (Left) & Wholesale Barcode (Right) -->
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-bold text-on-surface-variant uppercase tracking-widest">{{ $t('inventory.barcodeSkuCode') }}</label>
              <input 
                type="text"
                v-model="newProdBarcode"
                :placeholder="$t('inventory.barcodePlaceholder')"
                class="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-sm font-mono outline-none text-on-surface focus:border-primary focus:ring-1 focus:ring-primary/20"
              />
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-bold text-on-surface-variant uppercase tracking-widest">{{ $t('inventory.wholesaleBarcode') }}</label>
              <input 
                type="text"
                v-model="newProdWholesaleBarcode"
                :placeholder="$t('inventory.wholesaleBarcodePlaceholder')"
                class="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-sm font-mono outline-none text-on-surface focus:border-primary focus:ring-1 focus:ring-primary/20"
              />
            </div>

            <!-- Buy Cost & Retail Selling Price -->
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-bold text-on-surface-variant uppercase tracking-widest">{{ $t('inventory.buyCostWhole', { currency }) }}</label>
              <input 
                type="number"
                step="0.01"
                required
                v-model="newProdCost"
                :placeholder="$t('inventory.costPricePlaceholder')"
                class="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-sm outline-none font-mono text-on-surface focus:border-primary"
              />
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-bold text-on-surface-variant uppercase tracking-widest">{{ $t('inventory.retailSellingPrice', { currency }) }}</label>
              <input 
                type="number"
                step="0.01"
                required
                v-model="newProdPrice"
                :placeholder="$t('inventory.sellingPricePlaceholder')"
                class="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-sm outline-none font-mono text-on-surface focus:border-primary"
              />
            </div>

            <!-- Wholesale Price & Product Size on the SAME row -->
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                {{ $t('inventory.wholesalePrice', { currency }) }}
                <span v-if="newProdConversionFactor && Number(newProdConversionFactor) > 1" class="text-error">*</span>
              </label>
              <input 
                type="number"
                step="0.01"
                v-model="newProdWholesalePrice"
                :placeholder="$t('inventory.wholesalePricePlaceholder')"
                class="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-sm outline-none font-mono text-on-surface focus:border-primary"
              />
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-bold text-on-surface-variant uppercase tracking-widest">{{ $t('inventory.productSizeUnitsPack') }}</label>
              <input 
                type="number"
                min="1"
                v-model="newProdConversionFactor"
                :placeholder="$t('inventory.productSizePlaceholder')"
                class="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-sm outline-none font-mono text-on-surface focus:border-primary"
              />
            </div>

            <!-- Initial Stock Units & Minimum Stock Alert on the SAME row -->
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-bold text-on-surface-variant uppercase tracking-widest">{{ $t('inventory.initialStockUnits') }}</label>
              <input 
                type="number"
                required
                min="1"
                v-model="newProdStock"
                :placeholder="$t('inventory.initialStockPlaceholder')"
                class="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-sm outline-none font-mono text-on-surface focus:border-primary"
              />
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-bold text-on-surface-variant uppercase tracking-widest">{{ $t('inventory.minStockAlert') }}</label>
              <input 
                type="number"
                required
                min="1"
                v-model="newProdMinStock"
                :placeholder="$t('inventory.minStockPlaceholder')"
                class="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-sm outline-none font-mono text-on-surface focus:border-primary"
              />
            </div>

            <!-- Payment Method & Unit of Measure on the SAME row -->
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-bold text-on-surface-variant uppercase tracking-widest">{{ $t('inventory.paymentMethod') }}</label>
              <select 
                v-model="newProdPaymentMethod"
                required
                class="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-sm font-medium outline-none text-on-surface cursor-pointer focus:border-primary focus:ring-1 focus:ring-primary/20"
              >
                <option value="CASH">{{ $t('inventory.cashPayout') }}</option>
                <option value="ONCREDIT">{{ $t('inventory.onCreditPayment') }}</option>
                <option value="BANK_TRANSFER">{{ $t('inventory.bankTransfer') }}</option>
                <option value="MOBILE_TRANSFER">{{ $t('inventory.mobileTransfer') }}</option>
              </select>
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-bold text-on-surface-variant uppercase tracking-widest">{{ $t('inventory.unitOfMeasure') }}</label>
              <select 
                v-model="newProdUnitOfMeasure"
                required
                class="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-sm font-medium outline-none text-on-surface cursor-pointer focus:border-primary focus:ring-1 focus:ring-primary/20"
              >
                <option value="PCS">{{ $t('inventory.pcs') }}</option>
                <option value="KG">{{ $t('inventory.kg') }}</option>
                <option value="LTR">{{ $t('inventory.ltr') }}</option>
              </select>
            </div>

            <!-- Expiry Date -->
            <div class="flex flex-col gap-1.5 col-span-2 sm:col-span-1">
              <label class="text-xs font-bold text-on-surface-variant uppercase tracking-widest">{{ $t('inventory.expiryDate') }}</label>
              <input 
                type="date"
                v-model="newProdExpiryDate"
                class="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-sm font-medium outline-none text-on-surface focus:border-primary focus:ring-1 focus:ring-primary/20"
              />
            </div>

            <!-- Category Segment (Left) & Assigned Supplier (Right) -->
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-bold text-on-surface-variant uppercase tracking-widest">{{ $t('inventory.categorySegment') }}</label>
              <select 
                v-model="newProdCategory"
                class="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-sm font-medium outline-none text-on-surface cursor-pointer focus:border-primary focus:ring-1 focus:ring-primary/20"
              >
                <option value="Snacks">{{ $t('inventory.snacks') }}</option>
                <option value="Beverages">{{ $t('inventory.beverages') }}</option>
                <option value="Dairy Products">{{ $t('inventory.dairyFresh') }}</option>
                <option value="Household">{{ $t('inventory.household') }}</option>
                <option value="Grocery">Grocery</option>
                <option value="Bakery">Bakery</option>
              </select>
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-bold text-on-surface-variant uppercase tracking-widest">{{ $t('inventory.assignedSupplier') }}</label>
              <select 
                v-model="newProdSupplier"
                class="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-sm font-medium outline-none text-on-surface cursor-pointer focus:border-primary focus:ring-1 focus:ring-primary/20"
              >
                <option value="">{{ $t('inventory.selectSupplierOptional') }}</option>
                <option v-for="sup in filteredAddSuppliers" :key="sup.id" :value="sup.name">
                  {{ sup.name }} <template v-if="sup.category">({{ sup.category }})</template>
                </option>
              </select>
            </div>
          </div>

          <div class="flex justify-end gap-3 pt-4 border-t border-outline-variant/50">
            <button 
              type="button"
              @click="showAddModal = false"
              class="px-4.5 py-2.5 rounded-lg border border-outline font-bold hover:bg-surface-container-low text-xs cursor-pointer text-on-surface-variant text-center bg-surface-container-lowest"
            >
              {{ $t('common.cancel') }}
            </button>
            <button 
              type="submit"
              class="px-5 py-2.5 rounded-lg font-bold text-xs text-white transition-all cursor-pointer text-center border-0 shadow-sm bg-primary text-on-primary"
            >
              {{ $t('inventory.saveProductRecord') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- MODAL 2: BULK IMPORT FORM -->
    <div v-if="showImportModal" class="fixed inset-0 bg-surface-container-highest/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div class="w-full max-w-xl bg-surface-container-lowest rounded-xl shadow-xl border border-outline-variant/50 overflow-hidden font-sans">
        <div class="px-6 py-4.5 border-b border-outline-variant/50 flex justify-between items-center">
          <h2 class="text-[17px] font-bold text-on-surface">{{ $t('inventory.bulkImportTitle') }}</h2>
          <button 
            @click="showImportModal = false"
            class="text-outline hover:text-on-surface-variant cursor-pointer bg-transparent border-0"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <form @submit.prevent="handleBulkImport" class="p-6 space-y-4">
          <div class="p-4 bg-primary-container border border-primary/20 rounded-xl">
            <h4 class="text-xs font-bold text-primary uppercase tracking-wide mb-1">{{ $t('inventory.bulkImportGuideHeader') }}</h4>
            <p class="text-xs text-primary leading-normal">
              {{ $t('inventory.bulkImportGuideDesc') }}<br />
              <code class="font-mono bg-surface-container-lowest/60 px-1 py-0.5 rounded font-semibold text-[11px]">{{ $t('inventory.bulkImportCsvFormat') }}</code>
            </p>
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-bold text-on-surface-variant uppercase tracking-widest">{{ $t('inventory.csvRawDatastream') }}</label>
            <textarea 
              rows="7"
              required
              v-model="rawCsvText"
              placeholder="Premium Cashews,847229,Beverages,1500,2800,45,15,Unga Tanzania Group&#10;Safari Drink Premium,99281,Beverages,900,1400,120,20,Tanzania Bottlers Ltd"
              class="w-full bg-surface-container-low border border-outline-variant rounded-lg p-3 font-mono text-xs outline-none text-on-surface focus:border-primary"
            />
          </div>

          <div class="flex justify-end gap-3 pt-4 border-t border-outline-variant/50">
            <button 
              type="button"
              @click="showImportModal = false"
              class="px-4.5 py-2.5 rounded-lg border border-outline font-bold hover:bg-surface-container-low text-xs cursor-pointer text-on-surface-variant bg-surface-container-lowest"
            >
              {{ $t('common.cancel') }}
            </button>
            <button 
              type="submit"
              class="px-5 py-2.5 rounded-lg font-bold text-xs text-white transition-all cursor-pointer border-0 shadow-sm bg-primary text-on-primary"
            >
              {{ $t('inventory.processBulkImport') }}
            </button>
          </div>
        </form>
      </div>
    </div>

  </div>

  <!-- MODAL 3: EDIT PRODUCT FORM -->
  <Modal 
    :isOpen="showEditModal" 
    :title="$t('inventory.editProductModalTitle')" 
    :subtitle="$t('inventory.editProductModalSubtitle')" 
    :onClose="() => showEditModal = false"
    maxWidth="max-w-lg"
  >
    <form @submit.prevent="handleEditProduct" class="space-y-4">
      <div class="grid grid-cols-2 gap-4">
        <!-- Product Display Title -->
        <div class="flex flex-col gap-1.5 col-span-2">
          <label class="text-xs font-bold text-on-surface-variant uppercase tracking-widest">{{ $t('inventory.productDisplayTitle') }}</label>
          <input 
            type="text"
            required
            v-model="editProdName"
            :placeholder="$t('inventory.productTitlePlaceholder')"
            class="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-sm font-medium outline-none text-on-surface focus:border-primary focus:ring-1 focus:ring-primary/20"
          />
        </div>

        <!-- Barcode SKU Code (Left) & Wholesale Barcode (Right) -->
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-bold text-on-surface-variant uppercase tracking-widest">{{ $t('inventory.barcodeSkuCode') }}</label>
          <input 
            type="text"
            v-model="editProdBarcode"
            :placeholder="$t('inventory.barcodePlaceholder')"
            class="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-sm font-mono outline-none text-on-surface focus:border-primary focus:ring-1 focus:ring-primary/20"
          />
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-bold text-on-surface-variant uppercase tracking-widest">{{ $t('inventory.wholesaleBarcode') }}</label>
          <input 
            type="text"
            v-model="editProdWholesaleBarcode"
            :placeholder="$t('inventory.wholesaleBarcodePlaceholder')"
            class="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-sm font-mono outline-none text-on-surface focus:border-primary focus:ring-1 focus:ring-primary/20"
          />
        </div>

        <!-- Buy Cost & Retail Selling Price -->
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-bold text-on-surface-variant uppercase tracking-widest">{{ $t('inventory.buyCostWhole', { currency }) }}</label>
          <input 
            type="number"
            step="0.01"
            required
            v-model="editProdCost"
            :placeholder="$t('inventory.costPricePlaceholder')"
            class="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-sm outline-none font-mono text-on-surface focus:border-primary"
          />
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-bold text-on-surface-variant uppercase tracking-widest">{{ $t('inventory.retailSellingPrice', { currency }) }}</label>
          <input 
            type="number"
            step="0.01"
            required
            v-model="editProdPrice"
            :placeholder="$t('inventory.sellingPricePlaceholder')"
            class="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-sm outline-none font-mono text-on-surface focus:border-primary"
          />
        </div>

        <!-- Wholesale Price & Product Size on the SAME row -->
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-bold text-on-surface-variant uppercase tracking-widest">
            {{ $t('inventory.wholesalePrice', { currency }) }}
            <span v-if="editProdConversionFactor && Number(editProdConversionFactor) > 1" class="text-error">*</span>
          </label>
          <input 
            type="number"
            step="0.01"
            v-model="editProdWholesalePrice"
            :placeholder="$t('inventory.wholesalePricePlaceholder')"
            class="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-sm outline-none font-mono text-on-surface focus:border-primary"
          />
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-bold text-on-surface-variant uppercase tracking-widest">{{ $t('inventory.productSizeUnitsPack') }}</label>
          <input 
            type="number"
            min="1"
            v-model="editProdConversionFactor"
            :placeholder="$t('inventory.productSizePlaceholder')"
            class="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-sm outline-none font-mono text-on-surface focus:border-primary"
          />
        </div>

        <!-- Minimum Stock Alert & Expiry Date on the SAME row -->
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-bold text-on-surface-variant uppercase tracking-widest">{{ $t('inventory.minStockAlert') }}</label>
          <input 
            type="number"
            v-model="editProdMinStock"
            :placeholder="$t('inventory.minStockPlaceholder')"
            class="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-sm outline-none font-mono text-on-surface focus:border-primary"
          />
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-bold text-on-surface-variant uppercase tracking-widest">{{ $t('inventory.expiryDate') }}</label>
          <input 
            type="date"
            v-model="editProdExpiryDate"
            class="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-sm font-medium outline-none text-on-surface focus:border-primary focus:ring-1 focus:ring-primary/20"
          />
        </div>

        <!-- Unit of Measure -->
        <div class="flex flex-col gap-1.5 col-span-2">
          <label class="text-xs font-bold text-on-surface-variant uppercase tracking-widest">{{ $t('inventory.unitOfMeasure') }}</label>
          <select 
            v-model="editProdUnitOfMeasure"
            required
            class="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-sm font-medium outline-none text-on-surface cursor-pointer focus:border-primary focus:ring-1 focus:ring-primary/20"
          >
            <option value="PCS">{{ $t('inventory.pcs') }}</option>
            <option value="KG">{{ $t('inventory.kg') }}</option>
            <option value="LTR">{{ $t('inventory.ltr') }}</option>
          </select>
        </div>

        <!-- Category Segment (Left) & Assigned Supplier (Right) -->
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-bold text-on-surface-variant uppercase tracking-widest">{{ $t('inventory.categorySegment') }}</label>
          <select 
            v-model="editProdCategory"
            class="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-sm font-medium outline-none text-on-surface cursor-pointer focus:border-primary focus:ring-1 focus:ring-primary/20"
          >
            <option value="Snacks">{{ $t('inventory.snacks') }}</option>
            <option value="Beverages">{{ $t('inventory.beverages') }}</option>
            <option value="Dairy Products">{{ $t('inventory.dairyFresh') }}</option>
            <option value="Household">{{ $t('inventory.household') }}</option>
            <option value="Grocery">Grocery</option>
            <option value="Bakery">Bakery</option>
          </select>
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-bold text-on-surface-variant uppercase tracking-widest">{{ $t('inventory.assignedSupplier') }}</label>
          <select 
            v-model="editProdSupplier"
            class="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-sm font-medium outline-none text-on-surface cursor-pointer focus:border-primary focus:ring-1 focus:ring-primary/20"
          >
            <option value="">{{ $t('inventory.selectSupplierOptional') }}</option>
            <option v-for="sup in filteredEditSuppliers" :key="sup.id" :value="sup.name">
              {{ sup.name }} <template v-if="sup.category">({{ sup.category }})</template>
            </option>
          </select>
        </div>
      </div>

      <div class="flex justify-end gap-3 pt-4 border-t border-outline-variant/50">
        <button 
          type="button"
          @click="showEditModal = false"
          class="px-4.5 py-2.5 rounded-lg border border-outline font-bold hover:bg-surface-container-low text-xs cursor-pointer text-on-surface-variant text-center bg-surface-container-lowest"
        >
          {{ $t('common.cancel') }}
        </button>
        <button 
          type="submit"
          class="px-5 py-2.5 rounded-lg font-bold text-xs text-white transition-all cursor-pointer text-center border-0 shadow-sm bg-primary text-on-primary"
        >
          {{ $t('common.saveChanges') }}
        </button>
      </div>
    </form>
  </Modal>

  <!-- MODAL 4: RESTOCK PRODUCT FORM -->
  <Modal 
    :isOpen="showRestockModal" 
    :title="restockType === 'DAMAGED' ? $t('inventory.restockDamagedTitle') : $t('inventory.restockTitle')" 
    :subtitle="restockType === 'DAMAGED' ? $t('inventory.restockDamagedSubtitle') : $t('inventory.restockSubtitle')" 
    :onClose="closeRestockModal"
    maxWidth="max-w-md"
  >
    <form @submit.prevent="handleRestockProduct" class="space-y-4 relative min-h-[320px]" v-if="restockingProduct">
      <!-- Jenga Logo Loading Visual Overlay on restock submit -->
      <JengaLoader 
        v-if="isRestocking" 
        overlay 
        size="md" 
        :label="restockType === 'DAMAGED' ? $t('inventory.restockDamagedTitle') : $t('inventory.restockTitle')" 
        :sublabel="restockType === 'DAMAGED' ? $t('inventory.loaderArchivedItems') : $t('inventory.loaderSyncingCatalog')" 
      />

      <div class="space-y-4">
        <div class="bg-surface-container-low p-4.5 rounded-xl border border-outline-variant/50 space-y-2">
          <div class="flex justify-between text-sm">
            <span class="text-on-surface-variant font-medium">{{ $t('inventory.productNameLabel') }}</span>
            <span class="font-bold text-on-surface">{{ restockingProduct.name }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-on-surface-variant font-medium">{{ $t('inventory.currentStockLevelLabel') }}</span>
            <span class="font-mono font-bold text-on-surface bg-surface-container-high px-2 py-0.5 rounded text-xs">{{ restockingProduct.stock }} {{ $t('common.units') }}</span>
          </div>
          <div v-if="restockType === 'DAMAGED'" class="flex justify-between text-sm pt-1 border-t border-outline-variant/30">
            <span class="text-on-surface-variant font-medium">{{ $t('inventory.unitBuyingPriceLabel') }}</span>
            <span class="font-mono font-bold text-on-surface">{{ formatCurrency(restockingProduct.cost || 0, currency) }}</span>
          </div>
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-bold text-on-surface-variant uppercase tracking-widest">
            {{ restockType === 'DAMAGED' ? $t('inventory.unitsDamagedToDeduct') : $t('inventory.newStockUnitsToAdd') }}
          </label>
          <input 
            type="number"
            min="1"
            v-model="restockQty"
            :disabled="isRestocking"
            :placeholder="restockType === 'DAMAGED' ? 'E.g. 5' : 'E.g. 50'"
            class="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2.5 text-sm font-mono outline-none text-on-surface focus:border-primary focus:ring-1 focus:ring-primary/20 disabled:opacity-50"
          />
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-bold text-on-surface-variant uppercase tracking-widest">{{ $t('inventory.restockTypeReason') }}</label>
          <select 
            v-model="restockType"
            :disabled="isRestocking"
            class="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2.5 text-sm font-medium outline-none text-on-surface cursor-pointer focus:border-primary focus:ring-1 focus:ring-primary/20 disabled:opacity-50"
          >
            <option value="PURCHASE">{{ $t('inventory.restockPurchase') }}</option>
            <option value="ADJUSTMENT">{{ $t('inventory.restockAdjustment') }}</option>
            <option value="RETURN">{{ $t('inventory.restockReturn') }}</option>
            <option value="DAMAGED">{{ $t('inventory.restockDamaged') }}</option>
          </select>
        </div>

        <!-- Notes / Reason - Shown for DAMAGED and ADJUSTMENT -->
        <div v-if="restockType === 'DAMAGED' || restockType === 'ADJUSTMENT'" class="flex flex-col gap-1.5">
          <label class="text-xs font-bold text-on-surface-variant uppercase tracking-widest">
            {{ restockType === 'DAMAGED' ? $t('inventory.damageReasonNotes') : $t('inventory.adjustmentReasonNotes') }}
          </label>
          <input 
            type="text"
            v-model="restockNotes"
            :disabled="isRestocking"
            :placeholder="restockType === 'DAMAGED' ? $t('inventory.damageNotesPlaceholder') : $t('inventory.adjustmentNotesPlaceholder')"
            class="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2.5 text-sm outline-none text-on-surface focus:border-primary focus:ring-1 focus:ring-primary/20 disabled:opacity-50"
          />
        </div>

        <!-- Loss Warning Banner when DAMAGED is selected -->
        <div v-if="restockType === 'DAMAGED' && restockingProduct" class="p-3 bg-error/10 border border-error/20 rounded-xl text-xs text-error flex items-start gap-2.5">
          <AlertTriangle class="w-4 h-4 shrink-0 mt-0.5" />
          <div class="space-y-0.5">
            <span class="font-bold block">{{ $t('inventory.damagedLossWarningTitle') }}</span>
            <span class="leading-relaxed text-[11.5px]">
              {{ $t('inventory.damagedLossWarningDesc', {
                qty: Number(restockQty) || 0,
                amount: formatCurrency(((Number(restockQty) || 0) * (restockingProduct.cost || 0)), currency)
              }) }}
            </span>
          </div>
        </div>

        <!-- Payment Method - Only when restockType is PURCHASE -->
        <div v-if="restockType === 'PURCHASE'" class="flex flex-col gap-1.5">
          <label class="text-xs font-bold text-on-surface-variant uppercase tracking-widest">{{ $t('inventory.paymentMethod') }}</label>
          <select 
            v-model="restockPaymentMethod"
            :disabled="isRestocking"
            class="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2.5 text-sm font-medium outline-none text-on-surface cursor-pointer focus:border-primary focus:ring-1 focus:ring-primary/20 disabled:opacity-50"
          >
            <option value="CASH">{{ $t('inventory.cashPayout') }}</option>
            <option value="ONCREDIT">{{ $t('inventory.onCreditPayment') }}</option>
            <option value="BANK_TRANSFER">{{ $t('inventory.bankTransfer') }}</option>
            <option value="MOBILE_TRANSFER">{{ $t('inventory.mobileTransfer') }}</option>
          </select>
        </div>

        <!-- Supplier Dropdown (Optional) - Only when restockType is PURCHASE -->
        <div v-if="restockType === 'PURCHASE'" class="flex flex-col gap-1.5">
          <label class="text-xs font-bold text-on-surface-variant uppercase tracking-widest">{{ $t('inventory.selectSupplierOptional') }}</label>
          <select 
            v-model="restockSupplierId"
            :disabled="isRestocking"
            class="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2.5 text-sm font-medium outline-none text-on-surface cursor-pointer focus:border-primary focus:ring-1 focus:ring-primary/20 disabled:opacity-50"
          >
            <option value="">{{ $t('inventory.selectSupplierOptional') }}</option>
            <option v-for="sup in filteredRestockSuppliers" :key="sup.id" :value="sup.id">
              {{ sup.name }} <template v-if="sup.category">({{ sup.category }})</template>
            </option>
          </select>
        </div>

        <div class="flex justify-end gap-3 pt-4 border-t border-outline-variant/50">
          <button 
            type="button"
            :disabled="isRestocking"
            @click="closeRestockModal"
            class="px-4.5 py-2.5 rounded-lg border border-outline font-bold hover:bg-surface-container-low text-xs cursor-pointer text-on-surface-variant text-center bg-surface-container-lowest disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ $t('common.cancel') }}
          </button>
          <button 
            type="button"
            @click="handleRestockProduct"
            :disabled="isRestocking"
            class="px-5 py-2.5 rounded-lg font-bold text-xs text-white transition-all cursor-pointer text-center border-0 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            :class="restockType === 'DAMAGED' ? 'bg-error hover:bg-error/90 text-on-error' : 'bg-primary text-on-primary'"
          >
            <RotateCw v-if="isRestocking" class="w-3.5 h-3.5 animate-spin text-white" />
            <span>{{ isRestocking ? $t('common.processing') : (restockType === 'DAMAGED' ? $t('inventory.writeOffDamagedBtn') : $t('inventory.addToStockBtn')) }}</span>
          </button>
        </div>
      </div>
    </form>
  </Modal>

  <!-- DELETE PRODUCT CONFIRMATION MODAL -->
  <Modal
    :isOpen="showDeleteModal"
    :onClose="() => showDeleteModal = false"
    :title="$t('inventory.deleteProductModalTitle')"
    :subtitle="$t('inventory.deleteProductModalSubtitle')"
    maxWidth="max-w-md"
  >
    <div class="space-y-4">
      <div class="p-4 rounded-xl bg-error-container/20 border border-error/30 flex items-start gap-3">
        <AlertTriangle class="w-6 h-6 text-error shrink-0 mt-0.5" />
        <div>
          <h4 class="text-sm font-bold text-error">{{ $t('common.warning') }}</h4>
          <p class="text-xs text-on-surface-variant mt-1">
            {{ $t('inventory.deleteWarningText', { name: productToDelete?.name || '', barcode: productToDelete?.barcode || 'N/A' }) }}
          </p>
        </div>
      </div>

      <p class="text-xs text-on-surface-variant leading-relaxed">
        {{ $t('inventory.deleteWarningDesc') }}
      </p>

      <div class="flex justify-end gap-3 pt-4 border-t border-outline-variant/50">
        <button 
          type="button"
          @click="showDeleteModal = false"
          :disabled="isDeleting"
          class="px-4.5 py-2.5 rounded-lg border border-outline font-bold hover:bg-surface-container-low text-xs cursor-pointer text-on-surface-variant bg-surface-container-lowest"
        >
          {{ $t('common.cancel') }}
        </button>
        <button 
          type="button"
          @click="handleDeleteProduct"
          :disabled="isDeleting"
          class="px-5 py-2.5 rounded-lg font-bold text-xs text-white transition-all cursor-pointer border-0 shadow-sm bg-error hover:bg-error/90 disabled:opacity-50 flex items-center gap-1.5"
        >
          <Trash2 v-if="!isDeleting" class="w-4 h-4" />
          <span>{{ isDeleting ? $t('inventory.deletingBtn') : $t('inventory.deleteProductBtn') }}</span>
        </button>
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useAppViewModel } from '../viewmodels/useAppViewModel';
import { showToast } from '../services/toastService';
import { useBarcodeScanner } from '../composables/useBarcodeScanner';
import type { Product } from '../models/types';
import { formatCurrency, formatCurrencyWithoutSymbol } from '../models/mockData';
import { api } from '../services/api';
import Modal from '../components/common/Modal.vue';
import JengaLoader from '../components/common/JengaLoader.vue';
import { t } from '../i18n';
import { 
  Plus, 
  Upload, 
  ImageOff, 
  Search, 
  X, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft,
  ChevronsRight,
  Check,
  Pencil,
  PlusCircle,
  Trash2,
  AlertTriangle,
  RotateCw,
  Eye,
  EyeOff,
  SlidersHorizontal
} from 'lucide-vue-next';

const route = useRoute();
const vm = useAppViewModel();

const categories = ref<any[]>([]);

// Filter States
const productNameSearch = ref('');
const selectedCategories = ref<string[]>([]);
const stockStatus = ref<string>('All');
const supplierSearch = ref('');
const selectedSuppliers = ref<string[]>([]);
const showAllCategories = ref(false);

// Smart Filter & Drawer States
const showFilterDrawer = ref(false);
const categorySearch = ref('');

// Pagination
const currentPage = ref(1);
const itemsPerPage = 15;

// Add Modal States
const showAddModal = ref(false);
const newProdName = ref('');
const newProdBarcode = ref('');
const newProdCategory = ref('Snacks');
const newProdCost = ref('');
const newProdPrice = ref('');
const newProdWholesalePrice = ref('');
const newProdWholesaleBarcode = ref('');
const newProdConversionFactor = ref('');
const newProdUnitOfMeasure = ref<'PCS' | 'KG' | 'LTR'>('PCS');
const newProdStock = ref('');
const newProdMinStock = ref('');
const newProdSupplier = ref('');
const newProdExpiryDate = ref('');
const newProdPaymentMethod = ref<'CASH' | 'ONCREDIT' | 'BANK_TRANSFER' | 'MOBILE_TRANSFER'>('CASH');

// Import Modal States
const showImportModal = ref(false);
const rawCsvText = ref('');

// Inactive Products & Catalog Toggle State
const showInactive = ref(false);
const inactiveProducts = ref<Product[]>([]);
const hasFetchedInactive = ref(false);
const isFetchingInactive = ref(false);

const formatDateForInput = (dateStr?: string | null): string => {
  if (!dateStr) return '';
  const str = String(dateStr).trim();
  if (!str) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
  const d = new Date(str);
  if (isNaN(d.getTime())) return str.slice(0, 10);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const mapApiProduct = (p: any): Product => {
  let statusType: 'In Stock' | 'Low Stock' | 'Out of Stock' | 'Soon to expire' | 'Expired' = 'In Stock';
  const stockNum = Number(p.stock) || 0;
  const formattedExpiry = formatDateForInput(p.expiryDate);
  if (formattedExpiry) {
    const exp = new Date(formattedExpiry);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const diffMs = exp.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) {
      statusType = 'Expired';
    } else if (diffDays <= 90) {
      statusType = 'Soon to expire';
    }
  }
  const reorderLvl = p.reorderLevel !== undefined && p.reorderLevel !== null ? Number(p.reorderLevel) : 0;
  if (statusType === 'In Stock') {
    if (stockNum === 0) {
      statusType = 'Out of Stock';
    } else if (reorderLvl > 0 && stockNum <= reorderLvl) {
      statusType = 'Low Stock';
    }
  }
  return {
    id: p.id,
    name: p.name,
    barcode: p.barcode || '',
    category: p.categoryName || p.category || 'General',
    cost: Number(p.costPrice || p.cost) || 0,
    price: Number(p.sellingPrice || p.price) || 0,
    stock: stockNum,
    minStock: reorderLvl,
    status: statusType,
    supplier: p.supplierName || p.supplier || '',
    sku: p.sku || '',
    wholesalePrice: p.wholesalePrice ? Number(p.wholesalePrice) : undefined,
    unitOfMeasure: p.unitOfMeasure || p.UnitOfMeasure || undefined,
    expiryDate: formattedExpiry || undefined,
    wholesaleBarcode: p.wholesaleBarcode || undefined,
    conversionFactor: p.conversionFactor ? Number(p.conversionFactor) : undefined,
    categoryName: p.categoryName || p.category || 'General',
    supplierName: p.supplierName || p.supplier || '',
    isActive: p.isActive !== false,
  };
};

const fetchInactiveProducts = async (force: boolean = false) => {
  if (hasFetchedInactive.value && !force) return;
  const branchId = localStorage.getItem('branchId');
  if (!branchId || branchId === 'null' || branchId === 'undefined') return;

  isFetchingInactive.value = true;
  try {
    const productsData = await api.get<any>(`/api/products/inactive?storeBranchId=${branchId}`);
    const productsList: any[] = Array.isArray(productsData) ? productsData : (productsData?.content || []);

    if (productsList && Array.isArray(productsList)) {
      inactiveProducts.value = productsList.map(mapApiProduct);
      hasFetchedInactive.value = true;
    }
  } catch (err: any) {
    console.error('Failed to fetch inactive products:', err);
    showToast('Failed to load inactive products: ' + (err.message || err), 'error');
  } finally {
    isFetchingInactive.value = false;
  }
};

const toggleShowInactive = async (val?: boolean) => {
  const nextVal = typeof val === 'boolean' ? val : !showInactive.value;
  if (showInactive.value === nextVal) return;
  showInactive.value = nextVal;
  currentPage.value = 1;

  if (showInactive.value && !hasFetchedInactive.value) {
    await fetchInactiveProducts();
  }
};

const handleRefresh = async () => {
  if (showInactive.value) {
    await fetchInactiveProducts(true);
  } else {
    await vm.fetchProducts();
  }
};

const products = computed(() => showInactive.value ? inactiveProducts.value : vm.products.value);
const currency = computed(() => vm.settings.value.currency);

onMounted(async () => {
  if (route.query.status && typeof route.query.status === 'string') {
    stockStatus.value = route.query.status;
  }
  try {
    const catsData = await api.get('/api/product-categories');
    categories.value = catsData || [];
  } catch (err) {
    console.error('Failed to load categories:', err);
  }
  vm.fetchProducts();
  vm.fetchSuppliers().catch(err => console.error('Failed to fetch suppliers in background:', err));
});

const isCategoryMatch = (productCat: string, supplierCat: string): boolean => {
  if (!productCat || !supplierCat) return false;
  const p = productCat.trim().toLowerCase();
  const s = supplierCat.trim().toLowerCase();
  
  if (p === s) return true;
  
  const pBase = p.endsWith('s') ? p.slice(0, -1) : p;
  const sBase = s.endsWith('s') ? s.slice(0, -1) : s;
  if (pBase === sBase) return true;

  if (p.includes(sBase) || s.includes(pBase)) return true;

  return false;
};

const filteredAddSuppliers = computed(() => {
  const allSups = vm.suppliers.value || [];
  if (!allSups.length) return [];
  const selectedCat = (newProdCategory.value || '').trim();
  if (!selectedCat) return allSups;

  return allSups.filter(s => isCategoryMatch(selectedCat, s.category || ''));
});

const filteredEditSuppliers = computed(() => {
  const allSups = vm.suppliers.value || [];
  if (!allSups.length) return [];
  const selectedCat = (editProdCategory.value || '').trim();
  if (!selectedCat) return allSups;

  const matching = allSups.filter(s => isCategoryMatch(selectedCat, s.category || ''));

  if (editProdSupplier.value) {
    const existsInMatching = matching.some(s => s.name.toLowerCase() === editProdSupplier.value.toLowerCase());
    if (!existsInMatching) {
      const existingSup = allSups.find(s => s.name.toLowerCase() === editProdSupplier.value.toLowerCase());
      if (existingSup) {
        return [existingSup, ...matching];
      }
    }
  }
  return matching;
});

watch(newProdCategory, () => {
  if (newProdSupplier.value) {
    const isStillValid = filteredAddSuppliers.value.some(s => s.name.toLowerCase() === newProdSupplier.value.toLowerCase());
    if (!isStillValid) {
      newProdSupplier.value = '';
    }
  }
});

watch(() => route.query.status, (newStatus) => {
  if (newStatus && typeof newStatus === 'string') {
    stockStatus.value = newStatus;
  }
});

const countByCategory = computed(() => {
  const counts: Record<string, number> = {};
  products.value.forEach(p => {
    counts[p.category] = (counts[p.category] || 0) + 1;
  });
  return counts;
});

const uniqueCategories = computed(() => {
  return Array.from(new Set(products.value.map(p => p.category)));
});

const extraCategories = computed(() => {
  const baseList = ['Beverages', 'Snacks', 'Dairy Products', 'Household'];
  return uniqueCategories.value.filter(c => !baseList.includes(c));
});

const filteredCategoriesList = computed(() => {
  const q = categorySearch.value.trim().toLowerCase();
  if (!q) return uniqueCategories.value;
  return uniqueCategories.value.filter(c => c.toLowerCase().includes(q));
});

const activePanelFiltersCount = computed(() => {
  let count = 0;
  if (selectedCategories.value.length) count += selectedCategories.value.length;
  if (stockStatus.value !== 'All') count++;
  if (selectedSuppliers.value.length) count += selectedSuppliers.value.length;
  if (showInactive.value) count++;
  return count;
});

const totalActiveFiltersCount = computed(() => {
  let count = activePanelFiltersCount.value;
  if (productNameSearch.value.trim()) count++;
  return count;
});

const hasActiveFilters = computed(() => totalActiveFiltersCount.value > 0);

const suppliersList = computed(() => {
  const list = Array.from(new Set(products.value.map(p => p.supplier).filter(Boolean))) as string[];
  return list.filter(sup => sup.toLowerCase().includes(supplierSearch.value.toLowerCase()));
});

const toggleCategory = (cat: string) => {
  if (selectedCategories.value.includes(cat)) {
    selectedCategories.value = selectedCategories.value.filter(c => c !== cat);
  } else {
    selectedCategories.value.push(cat);
  }
  currentPage.value = 1;
};

const toggleSupplier = (sup: string) => {
  if (selectedSuppliers.value.includes(sup)) {
    selectedSuppliers.value = selectedSuppliers.value.filter(s => s !== sup);
  } else {
    selectedSuppliers.value.push(sup);
  }
  currentPage.value = 1;
};

const selectStockStatus = (status: string) => {
  stockStatus.value = status;
  currentPage.value = 1;
};

const handleResetFilters = () => {
  productNameSearch.value = '';
  selectedCategories.value = [];
  stockStatus.value = 'All';
  selectedSuppliers.value = [];
  supplierSearch.value = '';
  categorySearch.value = '';
  showInactive.value = false;
  currentPage.value = 1;
};

const getProductStatus = (p: Product): string => {
  if (p.expiryDate) {
    const exp = new Date(p.expiryDate);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const diffMs = exp.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return 'Expired';
    if (diffDays <= 90) return 'Soon to expire';
  }
  if (p.stock === 0) return 'Out of Stock';
  if (p.stock <= p.minStock) return 'Low Stock';
  return 'In Stock';
};

const filteredProducts = computed(() => {
  const search = productNameSearch.value.trim().toLowerCase();
  return products.value.filter(p => {
    const matchesName = !search || 
      p.name.toLowerCase().includes(search) ||
      (p.barcode && p.barcode.toLowerCase().includes(search)) ||
      (p.sku && p.sku.toLowerCase().includes(search));
    const matchesCategory = selectedCategories.value.length === 0 || selectedCategories.value.includes(p.category);
    
    let matchesStock = true;
    const currentStatus = getProductStatus(p);

    if (stockStatus.value === 'In Stock') {
      matchesStock = p.stock > p.minStock && currentStatus !== 'Expired';
    } else if (stockStatus.value === 'Low Stock') {
      matchesStock = p.stock > 0 && p.stock <= p.minStock && currentStatus !== 'Expired';
    } else if (stockStatus.value === 'Out of Stock') {
      matchesStock = p.stock === 0;
    } else if (stockStatus.value === 'Soon to expire') {
      matchesStock = currentStatus === 'Soon to expire';
    } else if (stockStatus.value === 'Expired') {
      matchesStock = currentStatus === 'Expired';
    }

    const matchesSupplier = selectedSuppliers.value.length === 0 || selectedSuppliers.value.includes(p.supplier || '');

    return matchesName && matchesCategory && matchesStock && matchesSupplier;
  });
});

const totalPages = computed(() => Math.ceil(filteredProducts.value.length / itemsPerPage) || 1);

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

const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return filteredProducts.value.slice(start, start + itemsPerPage);
});

const handleAddProduct = async () => {
  if (!newProdName.value || !newProdCost.value || !newProdPrice.value || !newProdStock.value || !newProdMinStock.value) {
    showToast('Please fill out all required fields', 'error');
    return;
  }

  const priceNum = parseFloat(newProdPrice.value);
  const costNum = parseFloat(newProdCost.value);
  const stockNum = parseInt(newProdStock.value);
  const minStockNum = parseInt(newProdMinStock.value);

  if (isNaN(stockNum) || stockNum <= 0) {
    showToast('Initial Stock Units must be a valid number greater than zero', 'error');
    return;
  }

  if (isNaN(minStockNum) || minStockNum <= 0) {
    showToast('Minimum Stock Alert must be a valid number greater than zero', 'error');
    return;
  }

  const newSizeVal = newProdConversionFactor.value ? parseInt(String(newProdConversionFactor.value).trim()) : 0;
  const newWholesaleStr = String(newProdWholesalePrice.value || '').trim();
  const hasNewWholesalePrice = newWholesaleStr !== '' && !isNaN(parseFloat(newWholesaleStr));

  if (newSizeVal > 1 && !hasNewWholesalePrice) {
    showToast('Wholesale Price is mandatory when Product Size is specified.', 'error');
    return;
  }

  try {
    const branchId = localStorage.getItem('branchId');
    if (!branchId) {
      showToast('Error: Store branch ID is missing. Please log in again.', 'error');
      return;
    }

    let cat = categories.value.find(c => c.name.toLowerCase() === newProdCategory.value.toLowerCase());
    if (!cat) {
      cat = await api.post('/api/product-categories', { name: newProdCategory.value });
      categories.value.push(cat);
    }

    const payload: any = {
      name: newProdName.value,
      barcode: newProdBarcode.value && newProdBarcode.value.trim() ? newProdBarcode.value.trim() : null,
      sku: `SKU-${Date.now().toString().slice(-6)}`,
      categoryId: cat.id,
      storeBranchId: branchId,
      costPrice: costNum,
      sellingPrice: priceNum,
      reorderLevel: minStockNum,
      stock: stockNum,
      isActive: true,
      UnitOfMeasure: newProdUnitOfMeasure.value,
      expiryDate: newProdExpiryDate.value || undefined,
      paymentType: newProdPaymentMethod.value
    };

    if (newProdSupplier.value) {
      const selectedSup = vm.suppliers.value.find(s => s.name.toLowerCase() === newProdSupplier.value.toLowerCase());
      if (selectedSup) {
        payload.supplierId = selectedSup.id;
      }
    }

    if (hasNewWholesalePrice) {
      payload.wholesalePrice = parseFloat(newWholesaleStr);
    }

    if (newProdWholesaleBarcode.value && newProdWholesaleBarcode.value.trim() !== '') {
      payload.wholesaleBarcode = newProdWholesaleBarcode.value.trim();
    }

    if (newSizeVal > 0) {
      payload.conversionFactor = newSizeVal;
    }

    const createdVm = await api.post('/api/products', payload);

    const newProduct: Product = {
      id: createdVm.id,
      name: createdVm.name,
      barcode: createdVm.barcode || '',
      category: createdVm.categoryName || 'General',
      cost: Number(createdVm.costPrice) || 0,
      price: Number(createdVm.sellingPrice) || 0,
      stock: Number(createdVm.stock) || 0,
      minStock: createdVm.reorderLevel != null ? Number(createdVm.reorderLevel) : 0,
      status: Number(createdVm.stock) === 0 ? 'Out of Stock' : ((createdVm.reorderLevel != null && Number(createdVm.reorderLevel) > 0 && Number(createdVm.stock) <= Number(createdVm.reorderLevel)) ? 'Low Stock' : 'In Stock'),
      supplier: newProdSupplier.value || '',
      wholesalePrice: createdVm.wholesalePrice ? Number(createdVm.wholesalePrice) : undefined,
      wholesaleBarcode: createdVm.wholesaleBarcode || newProdWholesaleBarcode.value || undefined,
      conversionFactor: createdVm.conversionFactor ? Number(createdVm.conversionFactor) : undefined,
      unitOfMeasure: createdVm.unitOfMeasure || createdVm.UnitOfMeasure || newProdUnitOfMeasure.value,
      expiryDate: formatDateForInput(createdVm.expiryDate || newProdExpiryDate.value) || undefined
    };

    vm.products.value = [newProduct, ...vm.products.value];
    showAddModal.value = false;
    showToast(t('toasts.productAddedSuccess'), 'success');

    // Reset
    newProdName.value = '';
    newProdBarcode.value = '';
    newProdCategory.value = 'Snacks';
    newProdCost.value = '';
    newProdPrice.value = '';
    newProdWholesalePrice.value = '';
    newProdWholesaleBarcode.value = '';
    newProdConversionFactor.value = '';
    newProdUnitOfMeasure.value = 'PCS';
    newProdStock.value = '20';
    newProdMinStock.value = '10';
    newProdSupplier.value = '';
    newProdExpiryDate.value = '';
    newProdPaymentMethod.value = 'CASH';
  } catch (err: any) {
    showToast('Failed to add product: ' + (err.message || err), 'error');
  }
};

const handleBulkImport = async () => {
  if (!rawCsvText.value.trim()) return;

  try {
    const vms = await api.postRaw('/api/products/bulk', rawCsvText.value);
    const addedProducts: Product[] = vms.map((vm: any) => {
      const impStock = Number(vm.stock) || 0;
      const impMinStock = vm.reorderLevel != null ? Number(vm.reorderLevel) : 0;
      return {
        id: vm.id,
        name: vm.name,
        barcode: vm.barcode || '',
        category: vm.categoryName || 'General',
        cost: Number(vm.costPrice) || 0,
        price: Number(vm.sellingPrice) || 0,
        stock: impStock,
        minStock: impMinStock,
        status: impStock === 0 ? 'Out of Stock' : (impMinStock > 0 && impStock <= impMinStock ? 'Low Stock' : 'In Stock'),
        supplier: vm.supplierName || vm.supplier || ''
      };
    });

    if (addedProducts.length > 0) {
      vm.products.value = [...addedProducts, ...vm.products.value];
      alert(`Successfully imported ${addedProducts.length} items to database!`);
      showImportModal.value = false;
      rawCsvText.value = '';
    } else {
      showToast('Could not find any readable rows. Please check the CSV format.', 'error');
    }
  } catch (err: any) {
    showToast('An error occurred while importing products: ' + (err.message || err), 'error');
  }
};

const stockStatuses = computed(() => [
  { label: t('inventory.allStock'), value: 'All' },
  { label: t('inventory.inStock'), value: 'In Stock' },
  { label: t('inventory.lowStock'), value: 'Low Stock', highlight: true },
  { label: t('inventory.outOfStock'), value: 'Out of Stock' },
  { label: t('inventory.soonToExpire'), value: 'Soon to expire', highlight: true },
  { label: t('inventory.expired'), value: 'Expired', highlight: true }
]);

// Edit Modal States
const showEditModal = ref(false);
const editingProduct = ref<Product | null>(null);
const editProdName = ref('');
const editProdBarcode = ref('');
const editProdCategory = ref('Snacks');
const editProdCost = ref('');
const editProdPrice = ref('');
const editProdWholesalePrice = ref('');
const editProdWholesaleBarcode = ref('');
const editProdConversionFactor = ref('');
const editProdUnitOfMeasure = ref<'PCS' | 'KG' | 'LTR'>('PCS');
const editProdMinStock = ref('10');
const editProdSupplier = ref('');
const editProdExpiryDate = ref('');

// Restock Modal States
const showRestockModal = ref(false);
const isRestocking = ref(false);
const restockingProduct = ref<Product | null>(null);
const restockQty = ref('');
const restockNotes = ref('');
const restockType = ref<'PURCHASE' | 'ADJUSTMENT' | 'RETURN' | 'DAMAGED'>('PURCHASE');
const restockPaymentMethod = ref<'CASH' | 'ONCREDIT' | 'BANK_TRANSFER' | 'MOBILE_TRANSFER'>('CASH');
const restockSupplierId = ref<string>('');

const filteredRestockSuppliers = computed(() => {
  const allSups = vm.suppliers.value || [];
  if (!allSups.length || !restockingProduct.value) return allSups;
  const selectedCat = (restockingProduct.value.category || '').trim();
  if (!selectedCat) return allSups;

  return allSups.filter(s => isCategoryMatch(selectedCat, s.category || ''));
});

// Global 2D Barcode Scanner integration
useBarcodeScanner({
  onScan: (scannedCode) => {
    if (showAddModal.value) {
      newProdBarcode.value = scannedCode;
      showToast(`Barcode scanned into field: "${scannedCode}"`, 'success');
    } else if (showEditModal.value) {
      editProdBarcode.value = scannedCode;
      showToast(`Barcode scanned into field: "${scannedCode}"`, 'success');
    } else {
      showToast(`Scanned product barcode: "${scannedCode}"`, 'success');
    }
  },
  enableAudioFeedback: true,
});

// Edit Modal Actions
const openEditModal = (p: Product) => {
  editingProduct.value = p;
  editProdName.value = p.name;
  editProdBarcode.value = p.barcode;
  editProdCategory.value = p.category;
  editProdCost.value = p.cost.toString();
  editProdPrice.value = p.price.toString();
  editProdWholesalePrice.value = p.wholesalePrice ? p.wholesalePrice.toString() : '';
  editProdWholesaleBarcode.value = p.wholesaleBarcode || '';
  editProdConversionFactor.value = p.conversionFactor ? p.conversionFactor.toString() : '';
  editProdUnitOfMeasure.value = p.unitOfMeasure || 'PCS';
  editProdMinStock.value = p.minStock.toString();
  editProdSupplier.value = p.supplier;
  editProdExpiryDate.value = formatDateForInput(p.expiryDate);
  showEditModal.value = true;
};

const handleEditProduct = async () => {
  if (!editingProduct.value) return;
  if (!editProdName.value || !editProdCost.value || !editProdPrice.value) {
    showToast('Please fill out all required fields', 'error');
    return;
  }

  const priceNum = parseFloat(editProdPrice.value);
  const costNum = parseFloat(editProdCost.value);
  const minStockNum = parseInt(editProdMinStock.value) || 10;

  const editSizeVal = editProdConversionFactor.value ? parseInt(String(editProdConversionFactor.value).trim()) : 0;
  const editWholesaleStr = String(editProdWholesalePrice.value || '').trim();
  const hasEditWholesalePrice = editWholesaleStr !== '' && !isNaN(parseFloat(editWholesaleStr));

  if (editSizeVal > 1 && !hasEditWholesalePrice) {
    showToast('Wholesale Price is mandatory when Product Size is specified.', 'error');
    return;
  }

  try {
    let cat = categories.value.find(c => c.name.toLowerCase() === editProdCategory.value.toLowerCase());
    if (!cat) {
      cat = await api.post('/api/product-categories', { name: editProdCategory.value });
      categories.value.push(cat);
    }

    const payload: any = {
      id: editingProduct.value.id,
      name: editProdName.value,
      barcode: editProdBarcode.value && editProdBarcode.value.trim() ? editProdBarcode.value.trim() : null,
      sku: editingProduct.value.sku || `SKU-${Date.now().toString().slice(-6)}`,
      categoryId: cat.id,
      costPrice: costNum,
      sellingPrice: priceNum,
      reorderLevel: minStockNum,
      stock: editingProduct.value.stock,
      isActive: true,
      UnitOfMeasure: editProdUnitOfMeasure.value,
      expiryDate: editProdExpiryDate.value || undefined
    };

    if (hasEditWholesalePrice) {
      payload.wholesalePrice = parseFloat(editWholesaleStr);
    }

    if (editProdWholesaleBarcode.value && editProdWholesaleBarcode.value.trim() !== '') {
      payload.wholesaleBarcode = editProdWholesaleBarcode.value.trim();
    }

    if (editSizeVal > 0) {
      payload.conversionFactor = editSizeVal;
    }

    const updatedVm = await api.put(`/api/products/${editingProduct.value.id}`, payload);

    if (showInactive.value) {
      const inactIndex = inactiveProducts.value.findIndex(p => p.id === editingProduct.value?.id);
      if (inactIndex !== -1) {
        const existingProduct = inactiveProducts.value[inactIndex]!;
        inactiveProducts.value[inactIndex] = {
          ...existingProduct,
          name: updatedVm.name,
          barcode: updatedVm.barcode || '',
          category: updatedVm.categoryName || 'General',
          cost: Number(updatedVm.costPrice) || 0,
          price: Number(updatedVm.sellingPrice) || 0,
          minStock: updatedVm.reorderLevel != null ? Number(updatedVm.reorderLevel) : 0,
          supplier: editProdSupplier.value || '',
          sku: updatedVm.sku || '',
          wholesalePrice: updatedVm.wholesalePrice ? Number(updatedVm.wholesalePrice) : undefined,
          wholesaleBarcode: updatedVm.wholesaleBarcode || editProdWholesaleBarcode.value || undefined,
          conversionFactor: updatedVm.conversionFactor ? Number(updatedVm.conversionFactor) : undefined,
          unitOfMeasure: updatedVm.unitOfMeasure || updatedVm.UnitOfMeasure || editProdUnitOfMeasure.value,
          expiryDate: formatDateForInput(updatedVm.expiryDate || editProdExpiryDate.value) || undefined
        };
      }
    } else {
      const index = vm.products.value.findIndex(p => p.id === editingProduct.value?.id);
      if (index !== -1) {
        const existingProduct = vm.products.value[index]!;
        const updatedReorder = updatedVm.reorderLevel != null ? Number(updatedVm.reorderLevel) : 0;
        const updatedStock = Number(updatedVm.stock) || 0;
        vm.products.value[index] = {
          ...existingProduct,
          name: updatedVm.name,
          barcode: updatedVm.barcode || '',
          category: updatedVm.categoryName || 'General',
          cost: Number(updatedVm.costPrice) || 0,
          price: Number(updatedVm.sellingPrice) || 0,
          minStock: updatedReorder,
          status: updatedStock === 0 ? 'Out of Stock' : (updatedReorder > 0 && updatedStock <= updatedReorder ? 'Low Stock' : 'In Stock'),
          supplier: editProdSupplier.value || '',
          sku: updatedVm.sku || '',
          wholesalePrice: updatedVm.wholesalePrice ? Number(updatedVm.wholesalePrice) : undefined,
          wholesaleBarcode: updatedVm.wholesaleBarcode || editProdWholesaleBarcode.value || undefined,
          conversionFactor: updatedVm.conversionFactor ? Number(updatedVm.conversionFactor) : undefined,
          unitOfMeasure: updatedVm.unitOfMeasure || updatedVm.UnitOfMeasure || editProdUnitOfMeasure.value,
          expiryDate: formatDateForInput(updatedVm.expiryDate || editProdExpiryDate.value) || undefined
        };
      }
    }

    showEditModal.value = false;
    showToast(t('toasts.productUpdatedSuccess'), 'success');
  } catch (err: any) {
    showToast('Failed to update product: ' + (err.message || err), 'error');
  }
};

// Restock Modal Actions
const closeRestockModal = () => {
  if (!isRestocking.value) {
    showRestockModal.value = false;
  }
};

const openRestockModal = (p: Product) => {
  restockingProduct.value = p;
  restockQty.value = '';
  restockNotes.value = '';
  restockType.value = 'PURCHASE';
  restockPaymentMethod.value = 'CASH';
  restockSupplierId.value = '';
  isRestocking.value = false;
  showRestockModal.value = true;
};

const handleRestockProduct = async () => {
  if (!restockingProduct.value || isRestocking.value) return;
  const rawQtyStr = String(restockQty.value ?? '').trim();
  if (!rawQtyStr) {
    showToast(
      restockType.value === 'DAMAGED' 
        ? 'Please enter the number of damaged units to write off' 
        : 'Please enter the stock units quantity', 
      'error'
    );
    return;
  }
  const addedQty = parseInt(rawQtyStr);
  if (isNaN(addedQty) || addedQty <= 0) {
    showToast('Stock units must be a valid number greater than zero', 'error');
    return;
  }

  if (restockType.value === 'DAMAGED') {
    if (addedQty > restockingProduct.value.stock) {
      showToast(`Cannot write off ${addedQty} units: current stock is only ${restockingProduct.value.stock}`, 'error');
      return;
    }
    if (!restockingProduct.value.cost || restockingProduct.value.cost <= 0) {
      showToast(`Product '${restockingProduct.value.name}' has no valid buying price (cost price). A cost price is required to book the financial loss.`, 'error');
      return;
    }
  }

  isRestocking.value = true;
  try {
    const payload: any = {
      type: restockType.value,
      quantity: addedQty
    };

    if (restockNotes.value && restockNotes.value.trim()) {
      payload.notes = restockNotes.value.trim();
    }

    if (restockType.value === 'PURCHASE') {
      payload.paymentType = restockPaymentMethod.value;
      if (restockSupplierId.value) {
        payload.supplierId = restockSupplierId.value;
      }
    }

    await api.post(`/api/products/${restockingProduct.value.id}/stock-movement`, payload);

    const index = vm.products.value.findIndex(p => p.id === restockingProduct.value?.id);
    if (index !== -1) {
      const existingProduct = vm.products.value[index]!;
      const isDeduction = restockType.value === 'DAMAGED';
      const change = isDeduction ? -addedQty : addedQty;
      const newStock = Math.max(0, existingProduct.stock + change);
      vm.products.value[index] = {
        ...existingProduct,
        stock: newStock,
        status: newStock === 0 ? 'Out of Stock' : (newStock <= existingProduct.minStock ? 'Low Stock' : 'In Stock')
      };
    }

    showToast(
      restockType.value === 'DAMAGED' 
        ? t('toasts.damagedStockSuccess')
        : t('toasts.stockAddedSuccess'), 
      'success'
    );

    await vm.fetchProducts();

    showRestockModal.value = false;
  } catch (err: any) {
    showToast('Failed to submit stock movement: ' + (err.message || err), 'error');
  } finally {
    isRestocking.value = false;
  }
};

// Delete Modal State
const showDeleteModal = ref(false);
const productToDelete = ref<Product | null>(null);
const isDeleting = ref(false);

const confirmDeleteProduct = (p: Product) => {
  productToDelete.value = p;
  showDeleteModal.value = true;
};

const handleDeleteProduct = async () => {
  if (!productToDelete.value || !productToDelete.value.id) return;
  isDeleting.value = true;
  try {
    await api.delete(`/api/products/${productToDelete.value.id}`);
    showToast(t('toasts.productDeletedSuccess'), 'success');
    showDeleteModal.value = false;
    productToDelete.value = null;
    await vm.fetchProducts();
    if (hasFetchedInactive.value) {
      await fetchInactiveProducts(true);
    }
  } catch (err: any) {
    console.error('Failed to delete product:', err);
    showToast(err.message || 'Failed to delete product', 'error');
  } finally {
    isDeleting.value = false;
  }
};
</script>

<style scoped>
.drawer-enter-active,
.drawer-leave-active {
  transition: opacity 0.25s ease;
}

.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}

.drawer-enter-active .drawer-content,
.drawer-leave-active .drawer-content {
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.drawer-enter-from .drawer-content,
.drawer-leave-to .drawer-content {
  transform: translateX(100%);
}
</style>

