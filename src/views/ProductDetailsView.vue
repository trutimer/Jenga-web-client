<template>
  <div class="w-full max-w-[1720px] mx-auto py-2 font-sans select-none animate-fade-up px-2 sm:px-4 md:px-6 pb-20">
    
    <!-- 1. HEADER SECTION & NAVIGATION -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
      <div class="flex items-center gap-3.5">
        <button 
          @click="router.push('/inventory')"
          class="w-10 h-10 bg-surface-container-low border border-outline-variant rounded-xl flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface-container transition-all cursor-pointer shadow-xs shrink-0"
          :title="$t('productDetail.backToInventory')"
        >
          <ArrowLeft class="w-5 h-5" />
        </button>

        <div>
          <!-- Breadcrumb navigation -->
          <div class="flex items-center gap-2 text-xs font-semibold text-on-surface-variant mb-1">
            <span class="hover:text-primary cursor-pointer transition-colors" @click="router.push('/inventory')">
              {{ $t('productDetail.breadcrumbCatalog') }}
            </span>
            <ChevronRight class="w-3.5 h-3.5 text-outline" />
            <span class="text-primary font-bold truncate max-w-[240px] sm:max-w-md">
              {{ product?.name || $t('productDetail.title') }}
            </span>
          </div>

          <div class="flex items-center gap-3 flex-wrap">
            <h1 class="text-2xl sm:text-3xl font-black text-on-surface tracking-tight leading-tight">
              {{ product ? product.name : $t('productDetail.title') }}
            </h1>

            <!-- Status Badges -->
            <template v-if="product">
              <span 
                v-if="getStockStatusLabel(product)"
                class="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono border"
                :class="getStockStatusBadgeClass(product)"
              >
                {{ getStockStatusLabel(product) }}
              </span>

              <span 
                v-if="product.isActive === false" 
                class="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-error/10 text-error border border-error/20"
              >
                {{ $t('productDetail.inactiveStatus') }}
              </span>
            </template>
          </div>
        </div>
      </div>

      <!-- Quick Action Buttons -->
      <div class="flex flex-wrap items-center gap-2.5 self-stretch md:self-auto">
        <button 
          v-if="vm.hasPermission('inventory:edit') || vm.hasPermission('inventory:restock')"
          @click="openRestockModal"
          class="h-10 px-4 rounded-xl border border-primary/30 bg-primary/10 hover:bg-primary/15 text-primary font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-xs"
          :title="$t('productDetail.restockProduct')"
        >
          <PlusCircle class="w-4 h-4" />
          <span>{{ $t('productDetail.restockProduct') }}</span>
        </button>

        <button 
          v-if="vm.hasPermission('inventory:edit')"
          @click="openEditModal"
          class="h-10 px-4 rounded-xl font-bold text-xs text-white flex items-center gap-2 transition-all cursor-pointer shadow-xs border-0 bg-primary text-on-primary hover:opacity-95"
          :title="$t('productDetail.editProduct')"
        >
          <Pencil class="w-4 h-4" />
          <span>{{ $t('productDetail.editProduct') }}</span>
        </button>
      </div>
    </div>

    <!-- LOADING STATE -->
    <div v-if="isLoading && !product" class="py-24 flex flex-col items-center justify-center relative min-h-[420px]">
      <JengaLoader 
        size="lg" 
        :label="$t('common.loading')" 
        :sublabel="$t('productDetail.subtitle')" 
      />
    </div>

    <!-- PRODUCT NOT FOUND STATE -->
    <div v-else-if="!product" class="p-12 text-center bg-surface-container-lowest rounded-2xl border border-outline-variant my-8 shadow-sm">
      <PackageOpen class="w-16 h-16 mx-auto text-outline mb-4 stroke-[1.5px]" />
      <h3 class="text-xl font-black text-on-surface">{{ $t('productDetail.productNotFound') }}</h3>
      <p class="text-sm text-on-surface-variant mt-2 max-w-md mx-auto">{{ $t('productDetail.productNotFoundDesc') }}</p>
      <button 
        @click="router.push('/inventory')"
        class="mt-6 px-5 py-2.5 rounded-xl bg-primary text-white font-bold text-xs cursor-pointer border-0 shadow-sm hover:opacity-95"
      >
        {{ $t('productDetail.backToInventory') }}
      </button>
    </div>

    <!-- MAIN PRODUCT DETAIL CONTENT -->
    <div v-else class="space-y-6">

      <!-- 2. COLLECTION & PERFORMANCE SUMMARY (KPI OVERVIEW) -->
      <div class="space-y-2.5">
        <div class="flex items-center justify-between">
          <span class="text-xs font-mono font-bold uppercase tracking-widest text-on-surface-variant flex items-center gap-1.5">
            <Coins class="w-4 h-4 text-primary" />
            <span>{{ $t('productDetail.collectionSummary') }}</span>
          </span>
          <span class="text-[11px] font-mono font-medium text-outline">
            {{ productSales.length }} {{ $t('productDetail.totalSalesTransactions', { count: productSales.length }) }}
          </span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
          <!-- Total Revenue -->
          <div class="bg-surface-container-lowest rounded-2xl border border-outline-variant/80 p-4 shadow-xs flex flex-col justify-between hover:border-primary/40 transition-all">
            <div class="flex justify-between items-start">
              <span class="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider truncate">{{ $t('productDetail.totalRevenue') }}</span>
              <span class="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600">
                <TrendingUp class="w-4 h-4" />
              </span>
            </div>
            <div class="mt-3">
              <span class="text-lg sm:text-xl font-black text-emerald-600 font-mono tracking-tight block truncate amount-compact">
                <AnimatedNumber :value="collectionMetrics.totalRevenue" :format="(v) => formatCurrency(v, currency)" />
              </span>
              <span class="text-[11px] text-on-surface-variant font-medium mt-1 block truncate">
                {{ collectionMetrics.salesCount }} {{ $t('productDetail.totalSalesTransactions', { count: collectionMetrics.salesCount }) }}
              </span>
            </div>
          </div>

          <!-- Total Units Sold -->
          <div class="bg-surface-container-lowest rounded-2xl border border-outline-variant/80 p-4 shadow-xs flex flex-col justify-between hover:border-primary/40 transition-all">
            <div class="flex justify-between items-start">
              <span class="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider truncate">{{ $t('productDetail.totalUnitsSold') }}</span>
              <span class="p-1.5 rounded-lg bg-primary/10 text-primary">
                <ShoppingBag class="w-4 h-4" />
              </span>
            </div>
            <div class="mt-3">
              <div class="flex items-baseline gap-1">
                <span class="text-lg sm:text-xl font-black text-on-surface font-mono tracking-tight block truncate amount-compact">
                  <AnimatedNumber :value="collectionMetrics.totalSoldQty" />
                </span>
                <span class="text-xs font-semibold text-on-surface-variant">{{ product.unitOfMeasure || 'PCS' }}</span>
              </div>
              <span class="text-[11px] text-on-surface-variant font-medium mt-1 block truncate">
                {{ $t('productDetail.retailVolumeDesc') }}
              </span>
            </div>
          </div>

          <!-- Realized Gross Profit -->
          <div class="bg-surface-container-lowest rounded-2xl border border-outline-variant/80 p-4 shadow-xs flex flex-col justify-between hover:border-primary/40 transition-all">
            <div class="flex justify-between items-start">
              <span class="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider truncate">{{ $t('productDetail.grossProfit') }}</span>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-black font-mono bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                {{ $t('productDetail.profitMarginBadge', { margin: collectionMetrics.grossMarginPct.toFixed(1) }) }}
              </span>
            </div>
            <div class="mt-3">
              <span 
                class="text-lg sm:text-xl font-black font-mono tracking-tight block truncate amount-compact"
                :class="collectionMetrics.grossProfit >= 0 ? 'text-emerald-600' : 'text-error'"
              >
                <AnimatedNumber :value="collectionMetrics.grossProfit" :format="(v) => formatCurrency(v, currency)" />
              </span>
              <span class="text-[11px] text-on-surface-variant font-medium mt-1 block truncate">
                {{ $t('productDetail.profitMarginBadge', { margin: collectionMetrics.grossMarginPct.toFixed(1) }) }}
              </span>
            </div>
          </div>

          <!-- Total Restock Purchases -->
          <div class="bg-surface-container-lowest rounded-2xl border border-outline-variant/80 p-4 shadow-xs flex flex-col justify-between hover:border-primary/40 transition-all">
            <div class="flex justify-between items-start">
              <span class="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider truncate">{{ $t('productDetail.totalPurchasesCost') }}</span>
              <span class="p-1.5 rounded-lg bg-blue-500/10 text-blue-600">
                <Truck class="w-4 h-4" />
              </span>
            </div>
            <div class="mt-3">
              <span class="text-lg sm:text-xl font-black text-on-surface font-mono tracking-tight block truncate amount-compact">
                <AnimatedNumber :value="collectionMetrics.totalPurchasesCost" :format="(v) => formatCurrency(v, currency)" />
              </span>
              <span class="text-[11px] text-on-surface-variant font-medium mt-1 block truncate">
                {{ $t('productDetail.unitsInboundDesc', { qty: collectionMetrics.totalInboundQty }) }}
              </span>
            </div>
          </div>

          <!-- Inventory Asset Value (At Cost) -->
          <div class="bg-surface-container-lowest rounded-2xl border border-outline-variant/80 p-4 shadow-xs flex flex-col justify-between hover:border-primary/40 transition-all">
            <div class="flex justify-between items-start">
              <span class="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider truncate">{{ $t('productDetail.inventoryAssetValue') }}</span>
              <span class="p-1.5 rounded-lg bg-amber-500/10 text-amber-600">
                <Boxes class="w-4 h-4" />
              </span>
            </div>
            <div class="mt-3">
              <span class="text-lg sm:text-xl font-black text-primary font-mono tracking-tight block truncate amount-compact">
                <AnimatedNumber :value="collectionMetrics.inventoryAssetValue" :format="(v) => formatCurrency(v, currency)" />
              </span>
              <span class="text-[11px] text-on-surface-variant font-medium mt-1 block truncate">
                {{ $t('productDetail.potentialRetailValue', { val: formatCurrency(collectionMetrics.potentialRetailValue, currency) }) }}
              </span>
            </div>
          </div>

          <!-- Damaged Stock Loss -->
          <div class="bg-surface-container-lowest rounded-2xl border border-outline-variant/80 p-4 shadow-xs flex flex-col justify-between hover:border-primary/40 transition-all">
            <div class="flex justify-between items-start">
              <span class="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider truncate">{{ $t('productDetail.damagedStockLoss') }}</span>
              <span class="p-1.5 rounded-lg bg-error/10 text-error">
                <AlertOctagon class="w-4 h-4" />
              </span>
            </div>
            <div class="mt-3">
              <span 
                class="text-lg sm:text-xl font-black font-mono tracking-tight block truncate amount-compact"
                :class="collectionMetrics.damagedLossCost > 0 ? 'text-error' : 'text-on-surface-variant/60'"
              >
                <AnimatedNumber :value="collectionMetrics.damagedLossCost" :format="(v) => formatCurrency(v, currency)" />
              </span>
              <span class="text-[11px] text-on-surface-variant font-medium mt-1 block truncate">
                {{ $t('productDetail.damagedUnitsDesc', { qty: collectionMetrics.damagedUnits }) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 3. PRODUCT ESSENTIAL DETAILS & PRICING SPECIFICATIONS (BENTO CARDS) -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <!-- CARD A: PRODUCT SPECIFICATIONS & METADATA -->
        <div class="bg-surface-container-lowest rounded-2xl border border-outline-variant p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between pb-3.5 border-b border-outline-variant/60 mb-4">
              <h3 class="text-sm font-bold text-on-surface flex items-center gap-2">
                <Package class="w-4.5 h-4.5 text-primary" />
                <span>{{ $t('productDetail.productInfo') }}</span>
              </h3>
              <span class="px-2 py-0.5 rounded-md text-[11px] font-bold bg-surface-container text-on-surface-variant border border-outline-variant/50">
                {{ product.category || 'General' }}
              </span>
            </div>

            <div class="space-y-3.5 text-xs">
              <!-- Barcode & SKU -->
              <div class="flex items-center justify-between py-1">
                <span class="font-bold text-on-surface-variant uppercase tracking-wider text-[11px]">{{ $t('productDetail.barcode') }}</span>
                <span class="font-mono font-bold text-on-surface bg-surface-container-low px-2.5 py-1 rounded-lg border border-outline-variant/60 select-all">
                  {{ product.barcode || $t('productDetail.notSpecified') }}
                </span>
              </div>

              <!-- SKU Code -->
              <div class="flex items-center justify-between py-1">
                <span class="font-bold text-on-surface-variant uppercase tracking-wider text-[11px]">{{ $t('productDetail.sku') }}</span>
                <span class="font-mono text-on-surface-variant bg-surface-container-low px-2.5 py-1 rounded-lg border border-outline-variant/60 select-all">
                  {{ product.sku || '-' }}
                </span>
              </div>

              <!-- Wholesale Barcode -->
              <div v-if="product.wholesaleBarcode" class="flex items-center justify-between py-1">
                <span class="font-bold text-on-surface-variant uppercase tracking-wider text-[11px]">{{ $t('productDetail.wholesaleBarcode') }}</span>
                <span class="font-mono text-on-surface-variant bg-surface-container-low px-2.5 py-1 rounded-lg border border-outline-variant/60 select-all">
                  {{ product.wholesaleBarcode }}
                </span>
              </div>

              <!-- Unit of Measure -->
              <div class="flex items-center justify-between py-1">
                <span class="font-bold text-on-surface-variant uppercase tracking-wider text-[11px]">{{ $t('productDetail.unitOfMeasure') }}</span>
                <span class="font-semibold text-on-surface px-2 py-0.5 rounded bg-surface-container">
                  {{ product.unitOfMeasure || 'PCS' }}
                </span>
              </div>

              <!-- Conversion Factor / Pack Size -->
              <div v-if="product.conversionFactor" class="flex items-center justify-between py-1">
                <span class="font-bold text-on-surface-variant uppercase tracking-wider text-[11px]">{{ $t('productDetail.conversionFactor') }}</span>
                <span class="font-mono font-bold text-primary">
                  {{ $t('productDetail.conversionFactorDesc', { factor: product.conversionFactor }) }}
                </span>
              </div>

              <!-- Expiry Date -->
              <div class="flex items-center justify-between py-1 border-t border-outline-variant/40 pt-2.5">
                <span class="font-bold text-on-surface-variant uppercase tracking-wider text-[11px]">{{ $t('productDetail.expiryDate') }}</span>
                <div class="flex items-center gap-2">
                  <span class="font-mono font-semibold text-on-surface">
                    {{ product.expiryDate ? new Date(product.expiryDate).toLocaleDateString() : $t('productDetail.notSpecified') }}
                  </span>
                  <span 
                    v-if="product.expiryDate" 
                    class="px-2 py-0.5 rounded text-[10px] font-bold uppercase"
                    :class="getExpiryBadgeClass(product.expiryDate)"
                  >
                    {{ getExpiryBadgeLabel(product.expiryDate) }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Supplier Box -->
          <div class="mt-4 pt-3.5 border-t border-outline-variant/60 bg-surface-container-low/60 -mx-5 -mb-5 p-4 rounded-b-2xl">
            <div class="flex items-center justify-between mb-2">
              <span class="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
                <Building2 class="w-3.5 h-3.5 text-primary" />
                <span>{{ $t('productDetail.supplier') }}</span>
              </span>
              <span class="text-xs font-bold text-on-surface">
                {{ product.supplier || product.supplierName || $t('productDetail.noSupplierAssigned') }}
              </span>
            </div>

            <!-- Supplier Contact Details if mapped -->
            <div v-if="matchedSupplier" class="space-y-1 text-xs text-on-surface-variant mt-2 pt-2 border-t border-outline-variant/40">
              <div v-if="matchedSupplier.contactPerson" class="flex items-center justify-between">
                <span>{{ $t('productDetail.supplierContact') }}:</span>
                <span class="font-semibold text-on-surface">{{ matchedSupplier.contactPerson }}</span>
              </div>
              <div v-if="matchedSupplier.phone" class="flex items-center justify-between">
                <span>{{ $t('productDetail.supplierPhone') }}:</span>
                <a :href="'tel:' + matchedSupplier.phone" class="font-mono text-primary font-bold hover:underline">
                  {{ matchedSupplier.phone }}
                </a>
              </div>
              <div v-if="matchedSupplier.email" class="flex items-center justify-between">
                <span>{{ $t('productDetail.supplierEmail') }}:</span>
                <a :href="'mailto:' + matchedSupplier.email" class="font-mono text-primary hover:underline truncate max-w-[160px]">
                  {{ matchedSupplier.email }}
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- CARD B: CURRENT PRODUCT PRICES & PROFIT MARGINS -->
        <div class="bg-surface-container-lowest rounded-2xl border border-outline-variant p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between pb-3.5 border-b border-outline-variant/60 mb-4">
              <h3 class="text-sm font-bold text-on-surface flex items-center gap-2">
                <Tag class="w-4.5 h-4.5 text-primary" />
                <span>{{ $t('productDetail.pricingTitle') }}</span>
              </h3>
              <span class="px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-primary-container text-on-primary-container">
                {{ currency }}
              </span>
            </div>

            <!-- Price Tier Grid -->
            <div class="grid grid-cols-2 gap-3 mb-4">
              <!-- Retail Price -->
              <div class="p-3 bg-surface-container-low rounded-xl border border-outline-variant/60 flex flex-col justify-between">
                <span class="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">{{ $t('productDetail.retailPrice') }}</span>
                <span class="text-base sm:text-lg font-black font-mono text-primary mt-1.5 amount-compact">
                  {{ formatCurrency(product.price, currency) }}
                </span>
              </div>

              <!-- Cost / Buying Price -->
              <div class="p-3 bg-surface-container-low rounded-xl border border-outline-variant/60 flex flex-col justify-between">
                <span class="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">{{ $t('productDetail.costPrice') }}</span>
                <span class="text-base sm:text-lg font-black font-mono text-on-surface mt-1.5 amount-compact">
                  {{ formatCurrency(product.cost, currency) }}
                </span>
              </div>
            </div>

            <!-- Wholesale Price (if set) -->
            <div class="p-3 bg-surface-container-low/70 rounded-xl border border-outline-variant/40 flex items-center justify-between text-xs mb-4">
              <span class="font-bold text-on-surface-variant uppercase tracking-wider text-[11px]">{{ $t('productDetail.wholesalePrice') }}</span>
              <span class="font-mono font-bold text-on-surface">
                {{ product.wholesalePrice ? formatCurrency(product.wholesalePrice, currency) : $t('productDetail.priceNotConfigured') }}
              </span>
            </div>

            <!-- Unit Gross Profit & Margins Breakdown -->
            <div class="space-y-2.5 text-xs pt-1">
              <div class="flex items-center justify-between">
                <span class="text-on-surface-variant font-medium">{{ $t('productDetail.unitGrossProfit') }}</span>
                <span class="font-mono font-black" :class="pricingAnalysis.unitProfit >= 0 ? 'text-emerald-600' : 'text-error'">
                  {{ formatCurrency(pricingAnalysis.unitProfit, currency) }}
                </span>
              </div>

              <div class="flex items-center justify-between">
                <span class="text-on-surface-variant font-medium">{{ $t('productDetail.retailMarginPct') }}</span>
                <span class="font-mono font-bold" :class="pricingAnalysis.marginPct >= 20 ? 'text-emerald-600' : 'text-amber-600'">
                  {{ pricingAnalysis.marginPct.toFixed(1) }}%
                </span>
              </div>

              <div class="flex items-center justify-between">
                <span class="text-on-surface-variant font-medium">{{ $t('productDetail.markupPct') }}</span>
                <span class="font-mono font-bold text-on-surface">
                  {{ pricingAnalysis.markupPct.toFixed(1) }}%
                </span>
              </div>

              <div v-if="product.wholesalePrice" class="flex items-center justify-between">
                <span class="text-on-surface-variant font-medium">{{ $t('productDetail.wholesaleMarginPct') }}</span>
                <span class="font-mono font-bold text-on-surface">
                  {{ pricingAnalysis.wholesaleMarginPct.toFixed(1) }}%
                </span>
              </div>
            </div>
          </div>

          <!-- Visual Margin Breakdown Bar -->
          <div class="mt-4 pt-3 border-t border-outline-variant/50">
            <div class="flex items-center justify-between text-[11px] font-mono mb-1.5">
              <span class="text-on-surface-variant font-semibold">{{ $t('productDetail.costShare') }}: {{ pricingAnalysis.costPct.toFixed(0) }}%</span>
              <span class="text-emerald-600 font-bold">{{ $t('productDetail.profitShare') }}: {{ pricingAnalysis.marginPct.toFixed(0) }}%</span>
            </div>
            <div class="w-full h-3 bg-surface-container-high rounded-full overflow-hidden flex shadow-inner">
              <div 
                class="h-full bg-outline-variant transition-all duration-500" 
                :style="{ width: `${Math.min(100, Math.max(0, pricingAnalysis.costPct))}%` }" 
                :title="'Cost Share: ' + pricingAnalysis.costPct.toFixed(1) + '%'"
              />
              <div 
                class="h-full bg-emerald-500 transition-all duration-500" 
                :style="{ width: `${Math.min(100, Math.max(0, pricingAnalysis.marginPct))}%` }" 
                :title="'Profit Margin: ' + pricingAnalysis.marginPct.toFixed(1) + '%'"
              />
            </div>
          </div>
        </div>

        <!-- CARD C: STOCK HEALTH & INVENTORY LEVELS -->
        <div class="bg-surface-container-lowest rounded-2xl border border-outline-variant p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between pb-3.5 border-b border-outline-variant/60 mb-4">
              <h3 class="text-sm font-bold text-on-surface flex items-center gap-2">
                <Layers class="w-4.5 h-4.5 text-primary" />
                <span>{{ $t('productDetail.stockHealthTitle') }}</span>
              </h3>
              <span class="text-xs font-mono font-bold text-on-surface-variant">
                {{ product.stock }} / {{ product.minStock }} min
              </span>
            </div>

            <!-- Current Stock Big Numbers -->
            <div class="p-4 rounded-xl bg-surface-container-low border border-outline-variant/60 flex items-center justify-between mb-4">
              <div>
                <span class="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant block">{{ $t('productDetail.currentStock') }}</span>
                <div class="flex items-baseline gap-2 mt-1">
                  <span 
                    class="text-3xl font-black font-mono tracking-tight"
                    :class="product.stock === 0 ? 'text-error' : (product.stock <= product.minStock ? 'text-warning' : 'text-primary')"
                  >
                    {{ product.stock }}
                  </span>
                  <span class="text-xs font-bold text-on-surface-variant">{{ product.unitOfMeasure || 'PCS' }}</span>
                </div>
              </div>

              <div class="text-right">
                <span class="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant block">{{ $t('productDetail.reorderLevel') }}</span>
                <span class="text-lg font-black font-mono text-on-surface mt-1 block">
                  {{ product.minStock }}
                </span>
              </div>
            </div>

            <!-- Health Meter & Progress -->
            <div class="space-y-2 mb-4">
              <div class="flex items-center justify-between text-xs font-medium">
                <span class="text-on-surface-variant">{{ $t('productDetail.safetyStockStatus') }}</span>
                <span 
                  class="font-mono font-bold"
                  :class="stockRatioPct >= 100 ? 'text-emerald-600' : (stockRatioPct > 0 ? 'text-amber-600' : 'text-error')"
                >
                  {{ $t('productDetail.stockHealthRatio', { pct: stockRatioPct.toFixed(0) }) }}
                </span>
              </div>
              <div class="w-full h-2.5 bg-surface-container-high rounded-full overflow-hidden shadow-inner">
                <div 
                  class="h-full transition-all duration-500 rounded-full"
                  :class="product.stock === 0 ? 'bg-error' : (product.stock <= product.minStock ? 'bg-amber-500' : 'bg-emerald-500')"
                  :style="{ width: `${Math.min(100, Math.max(5, stockRatioPct))}%` }"
                />
              </div>
            </div>

            <!-- Advisory Notice / Alert based on status -->
            <div 
              v-if="getStockAdvisoryMessage(product)"
              class="p-3 rounded-xl border text-xs flex items-center gap-2.5"
              :class="getStockAdvisoryClass(product)"
            >
              <component :is="getStockAdvisoryIcon(product)" class="w-4.5 h-4.5 shrink-0" />
              <span class="font-medium leading-tight">{{ getStockAdvisoryMessage(product) }}</span>
            </div>
          </div>

          <!-- POS Quick Action Link -->
          <div class="mt-4 pt-3.5 border-t border-outline-variant/60 flex items-center justify-between">
            <button 
              @click="router.push('/checkout')"
              class="w-full py-2.5 px-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer border border-outline-variant/60"
            >
              <CreditCard class="w-4 h-4" />
              <span>{{ $t('productDetail.viewInPos') }}</span>
            </button>
          </div>
        </div>

      </div>

      <!-- 4. INTERACTIVE WORKBENCH TABS (STOCK MOVEMENTS, SALES, PURCHASES, BARCODE) -->
      <div class="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-sm overflow-hidden">
        
        <!-- Tab Navigation Header -->
        <div class="flex items-center border-b border-outline-variant px-4 sm:px-6 pt-3 overflow-x-auto gap-2 bg-surface-container-low/40">
          <button 
            @click="activeTab = 'movements'"
            class="px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap"
            :class="activeTab === 'movements' ? 'border-primary text-primary bg-surface-container-lowest rounded-t-xl shadow-xs' : 'border-transparent text-on-surface-variant hover:text-on-surface'"
          >
            <History class="w-4 h-4" />
            <span>{{ $t('productDetail.tabStockMovements') }}</span>
            <span class="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold" :class="activeTab === 'movements' ? 'bg-primary/10 text-primary' : 'bg-surface-container text-on-surface-variant'">
              {{ filteredStockMovements.length }}
            </span>
          </button>

          <button 
            @click="activeTab = 'sales'"
            class="px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap"
            :class="activeTab === 'sales' ? 'border-primary text-primary bg-surface-container-lowest rounded-t-xl shadow-xs' : 'border-transparent text-on-surface-variant hover:text-on-surface'"
          >
            <Receipt class="w-4 h-4" />
            <span>{{ $t('productDetail.tabSales') }}</span>
            <span class="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold" :class="activeTab === 'sales' ? 'bg-primary/10 text-primary' : 'bg-surface-container text-on-surface-variant'">
              {{ productSales.length }}
            </span>
          </button>

          <button 
            @click="activeTab = 'purchases'"
            class="px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap"
            :class="activeTab === 'purchases' ? 'border-primary text-primary bg-surface-container-lowest rounded-t-xl shadow-xs' : 'border-transparent text-on-surface-variant hover:text-on-surface'"
          >
            <Truck class="w-4 h-4" />
            <span>{{ $t('productDetail.tabPurchases') }}</span>
            <span class="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold" :class="activeTab === 'purchases' ? 'bg-primary/10 text-primary' : 'bg-surface-container text-on-surface-variant'">
              {{ productPurchases.length }}
            </span>
          </button>
        </div>

        <!-- TAB CONTENT AREA -->
        <div class="p-4 sm:p-6">

          <!-- TAB 1: STOCK MOVEMENTS LEDGER AUDIT -->
          <div v-if="activeTab === 'movements'" class="space-y-4">
            <!-- Filter Bar for Movements -->
            <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div class="flex items-center gap-2 flex-wrap">
                <button 
                  v-for="type in movementTypeFilters"
                  :key="type.key"
                  @click="selectedMovementType = type.key"
                  class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border"
                  :class="selectedMovementType === type.key 
                    ? 'bg-primary text-white border-primary shadow-xs' 
                    : 'bg-surface-container-low border-outline-variant text-on-surface-variant hover:bg-surface-container'"
                >
                  {{ type.label }}
                </button>
              </div>

              <!-- Search movements -->
              <div class="relative max-w-xs">
                <Search class="w-3.5 h-3.5 text-outline absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input 
                  type="text"
                  v-model="movementSearch"
                  :placeholder="$t('common.search')"
                  class="w-full bg-surface-container-low pl-8.5 pr-3 py-1.5 border border-outline-variant rounded-xl text-xs outline-none focus:border-primary text-on-surface"
                />
              </div>
            </div>

            <!-- Movements Table -->
            <div class="border border-outline-variant/80 rounded-xl overflow-hidden shadow-xs">
              <div class="overflow-x-auto w-full">
                <table class="w-full text-left border-collapse text-[13px]">
                  <thead class="bg-surface-container-low border-b border-outline-variant text-on-surface-variant font-mono text-[11px] uppercase">
                    <tr>
                      <th class="px-4 py-3 font-bold">{{ $t('productDetail.colDateTime') }}</th>
                      <th class="px-4 py-3 font-bold">{{ $t('productDetail.colType') }}</th>
                      <th class="px-4 py-3 text-center font-bold">{{ $t('productDetail.colQty') }}</th>
                      <th class="px-4 py-3 font-bold">{{ $t('productDetail.colReference') }}</th>
                      <th class="px-4 py-3 text-right font-bold">{{ $t('productDetail.colRate') }}</th>
                      <th class="px-4 py-3 font-bold">{{ $t('productDetail.colUser') }}</th>
                      <th class="px-4 py-3 font-bold">{{ $t('productDetail.colNotes') }}</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-outline-variant/40 font-sans">
                    <tr 
                      v-for="sm in paginatedStockMovements" 
                      :key="sm.id" 
                      class="hover:bg-surface-container-low/70 transition-colors"
                    >
                      <!-- Date & Time -->
                      <td class="px-4 py-3 font-mono text-xs text-on-surface whitespace-nowrap">
                        {{ formatDateTime(sm.createdAt) }}
                      </td>

                      <!-- Movement Type Badge -->
                      <td class="px-4 py-3 whitespace-nowrap">
                        <span 
                          class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border"
                          :class="getMovementTypeBadgeClass(sm.type)"
                        >
                          <component :is="getMovementTypeIcon(sm.type)" class="w-3.5 h-3.5" />
                          <span>{{ formatMovementType(sm.type) }}</span>
                        </span>
                      </td>

                      <!-- Quantity Change (+/-) -->
                      <td class="px-4 py-3 text-center font-mono font-black text-sm whitespace-nowrap">
                        <span :class="isMovementInbound(sm.type) ? 'text-emerald-600' : 'text-error'">
                          {{ isMovementInbound(sm.type) ? '+' : '-' }}{{ Math.abs(sm.quantity) }}
                        </span>
                      </td>

                      <!-- Reference # -->
                      <td class="px-4 py-3 font-mono text-xs text-primary select-all whitespace-nowrap">
                        {{ sm.referenceId || sm.id?.slice(0, 8).toUpperCase() || '-' }}
                      </td>

                      <!-- Unit Rate -->
                      <td class="px-4 py-3 text-right font-mono text-xs text-on-surface select-all whitespace-nowrap">
                        {{ sm.sellingPrice ? formatCurrency(sm.sellingPrice, currency) : (sm.costPrice ? formatCurrency(sm.costPrice, currency) : '-') }}
                      </td>

                      <!-- Recorded By -->
                      <td class="px-4 py-3 text-xs text-on-surface-variant font-medium whitespace-nowrap">
                        {{ sm.createdByName || sm.createdById || '-' }}
                      </td>

                      <!-- Notes -->
                      <td class="px-4 py-3 text-xs text-on-surface-variant max-w-xs truncate" :title="(sm as any).notes || '-'">
                        {{ (sm as any).notes || '-' }}
                      </td>
                    </tr>

                    <!-- Empty State -->
                    <tr v-if="filteredStockMovements.length === 0">
                      <td colspan="7" class="py-16 text-center text-on-surface-variant select-none">
                        <Inbox class="w-10 h-10 mx-auto text-outline mb-2 stroke-[1.5px]" />
                        <p class="font-bold text-sm text-on-surface">{{ $t('productDetail.noMovementsFound') }}</p>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Pagination Footer -->
              <div v-if="filteredStockMovements.length > movementItemsPerPage" class="p-3 bg-surface-container-low border-t border-outline-variant/60 flex items-center justify-between text-xs">
                <span class="text-on-surface-variant font-mono">
                  Showing {{ ((movementPage - 1) * movementItemsPerPage) + 1 }} to {{ Math.min(movementPage * movementItemsPerPage, filteredStockMovements.length) }} of {{ filteredStockMovements.length }}
                </span>
                <div class="flex items-center gap-1.5">
                  <button 
                    @click="movementPage = Math.max(1, movementPage - 1)" 
                    :disabled="movementPage === 1"
                    class="px-2.5 py-1 rounded bg-surface-container hover:bg-surface-container-high disabled:opacity-40 cursor-pointer font-bold"
                  >
                    {{ $t('common.back') }}
                  </button>
                  <span class="font-mono font-bold px-2">{{ movementPage }}</span>
                  <button 
                    @click="movementPage = movementPage + 1" 
                    :disabled="movementPage * movementItemsPerPage >= filteredStockMovements.length"
                    class="px-2.5 py-1 rounded bg-surface-container hover:bg-surface-container-high disabled:opacity-40 cursor-pointer font-bold"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- TAB 2: RECENT SALES TABLE -->
          <div v-else-if="activeTab === 'sales'" class="space-y-4">
            <div class="flex items-center justify-between">
              <p class="text-xs text-on-surface-variant">{{ $t('productDetail.salesSubtitle') }}</p>
              <span class="text-xs font-mono font-bold text-outline">
                {{ productSales.length }} {{ $t('productDetail.totalSalesTransactions', { count: productSales.length }) }}
              </span>
            </div>

            <div class="border border-outline-variant/80 rounded-xl overflow-hidden shadow-xs">
              <div class="overflow-x-auto w-full">
                <table class="w-full text-left border-collapse text-[13px]">
                  <thead class="bg-surface-container-low border-b border-outline-variant text-on-surface-variant font-mono text-[11px] uppercase">
                    <tr>
                      <th class="px-4 py-3 font-bold">{{ $t('productDetail.colReceiptNo') }}</th>
                      <th class="px-4 py-3 font-bold">{{ $t('productDetail.colSaleDate') }}</th>
                      <th class="px-4 py-3 text-center font-bold">{{ $t('productDetail.colQtySold') }}</th>
                      <th class="px-4 py-3 text-right font-bold">{{ $t('productDetail.colUnitPrice') }}</th>
                      <th class="px-4 py-3 text-right font-bold">{{ $t('productDetail.colDiscount') }}</th>
                      <th class="px-4 py-3 text-right font-bold">{{ $t('productDetail.colSaleTotal') }}</th>
                      <th class="px-4 py-3 text-center font-bold">{{ $t('productDetail.colPaymentMethod') }}</th>
                      <th class="px-4 py-3 font-bold">{{ $t('productDetail.colCustomer') }}</th>
                      <th class="px-4 py-3 font-bold">{{ $t('productDetail.colCashier') }}</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-outline-variant/40 font-sans">
                    <tr 
                      v-for="s in paginatedSales" 
                      :key="s.id" 
                      class="hover:bg-surface-container-low/70 transition-colors"
                    >
                      <!-- Receipt Ref -->
                      <td class="px-4 py-3 font-mono font-bold text-xs text-primary select-all whitespace-nowrap">
                        {{ s.refCode || s.id?.slice(0, 8).toUpperCase() || '-' }}
                      </td>

                      <!-- Date -->
                      <td class="px-4 py-3 font-mono text-xs text-on-surface whitespace-nowrap">
                        {{ s.date ? new Date(s.date).toLocaleDateString() : '-' }}
                      </td>

                      <!-- Qty Sold -->
                      <td class="px-4 py-3 text-center font-mono font-bold text-on-surface whitespace-nowrap">
                        {{ s.itemQuantity }}
                      </td>

                      <!-- Unit Price -->
                      <td class="px-4 py-3 text-right font-mono text-xs text-on-surface select-all whitespace-nowrap">
                        {{ formatCurrency(s.itemPrice, currency) }}
                      </td>

                      <!-- Discount -->
                      <td class="px-4 py-3 text-right font-mono text-xs text-amber-600 select-all whitespace-nowrap">
                        {{ s.itemDiscount > 0 ? formatCurrency(s.itemDiscount, currency) : '-' }}
                      </td>

                      <!-- Line Total -->
                      <td class="px-4 py-3 text-right font-mono font-black text-xs text-emerald-600 select-all whitespace-nowrap">
                        {{ formatCurrency(s.lineTotal, currency) }}
                      </td>

                      <!-- Payment Method -->
                      <td class="px-4 py-3 text-center whitespace-nowrap">
                        <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-surface-container-high text-on-surface-variant border border-outline-variant/60">
                          {{ s.paymentMethod }}
                        </span>
                      </td>

                      <!-- Customer -->
                      <td class="px-4 py-3 text-xs text-on-surface whitespace-nowrap">
                        {{ s.customerName || $t('productDetail.walkInCustomer') }}
                      </td>

                      <!-- Cashier -->
                      <td class="px-4 py-3 text-xs text-on-surface-variant whitespace-nowrap">
                        {{ s.cashierName || '-' }}
                      </td>
                    </tr>

                    <tr v-if="productSales.length === 0">
                      <td colspan="9" class="py-16 text-center text-on-surface-variant select-none">
                        <ShoppingBag class="w-10 h-10 mx-auto text-outline mb-2 stroke-[1.5px]" />
                        <p class="font-bold text-sm text-on-surface">{{ $t('productDetail.noSalesFound') }}</p>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Sales Pagination Footer -->
              <div v-if="productSales.length > salesItemsPerPage" class="p-3 bg-surface-container-low border-t border-outline-variant/60 flex items-center justify-between text-xs">
                <span class="text-on-surface-variant font-mono">
                  Showing {{ ((salesPage - 1) * salesItemsPerPage) + 1 }} to {{ Math.min(salesPage * salesItemsPerPage, productSales.length) }} of {{ productSales.length }}
                </span>
                <div class="flex items-center gap-1.5">
                  <button 
                    @click="salesPage = Math.max(1, salesPage - 1)" 
                    :disabled="salesPage === 1"
                    class="px-2.5 py-1 rounded bg-surface-container hover:bg-surface-container-high disabled:opacity-40 cursor-pointer font-bold"
                  >
                    {{ $t('common.back') }}
                  </button>
                  <span class="font-mono font-bold px-2">{{ salesPage }}</span>
                  <button 
                    @click="salesPage = salesPage + 1" 
                    :disabled="salesPage * salesItemsPerPage >= productSales.length"
                    class="px-2.5 py-1 rounded bg-surface-container hover:bg-surface-container-high disabled:opacity-40 cursor-pointer font-bold"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- TAB 3: PURCHASES & RESTOCK ORDERS -->
          <div v-else-if="activeTab === 'purchases'" class="space-y-4">
            <div class="flex items-center justify-between">
              <p class="text-xs text-on-surface-variant">{{ $t('productDetail.purchasesSubtitle') }}</p>
              <span class="text-xs font-mono font-bold text-outline">
                {{ productPurchases.length }} records
              </span>
            </div>

            <div class="border border-outline-variant/80 rounded-xl overflow-hidden shadow-xs">
              <div class="overflow-x-auto w-full">
                <table class="w-full text-left border-collapse text-[13px]">
                  <thead class="bg-surface-container-low border-b border-outline-variant text-on-surface-variant font-mono text-[11px] uppercase">
                    <tr>
                      <th class="px-4 py-3 font-bold">{{ $t('productDetail.colPoRef') }}</th>
                      <th class="px-4 py-3 font-bold">{{ $t('productDetail.colPoDate') }}</th>
                      <th class="px-4 py-3 font-bold">{{ $t('productDetail.colSupplier') }}</th>
                      <th class="px-4 py-3 text-center font-bold">{{ $t('productDetail.colQtyReceived') }}</th>
                      <th class="px-4 py-3 text-right font-bold">{{ $t('productDetail.colUnitCost') }}</th>
                      <th class="px-4 py-3 text-right font-bold">{{ $t('productDetail.colPoTotal') }}</th>
                      <th class="px-4 py-3 text-center font-bold">{{ $t('productDetail.colPaymentType') }}</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-outline-variant/40 font-sans">
                    <tr 
                      v-for="p in productPurchases" 
                      :key="p.id" 
                      class="hover:bg-surface-container-low/70 transition-colors"
                    >
                      <td class="px-4 py-3 font-mono font-bold text-xs text-primary select-all whitespace-nowrap">
                        {{ p.id?.slice(0, 8).toUpperCase() || '-' }}
                      </td>
                      <td class="px-4 py-3 font-mono text-xs text-on-surface whitespace-nowrap">
                        {{ formatDateTime(p.createdAt) }}
                      </td>
                      <td class="px-4 py-3 text-xs text-on-surface font-semibold whitespace-nowrap">
                        {{ p.supplierName || '-' }}
                      </td>
                      <td class="px-4 py-3 text-center font-mono font-bold text-on-surface whitespace-nowrap">
                        +{{ p.itemQuantity }}
                      </td>
                      <td class="px-4 py-3 text-right font-mono text-xs text-on-surface select-all whitespace-nowrap">
                        {{ formatCurrency(p.itemUnitCost, currency) }}
                      </td>
                      <td class="px-4 py-3 text-right font-mono font-black text-xs text-on-surface select-all whitespace-nowrap">
                        {{ formatCurrency(p.itemTotalCost, currency) }}
                      </td>
                      <td class="px-4 py-3 text-center whitespace-nowrap">
                        <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-surface-container-high text-on-surface-variant border border-outline-variant/60">
                          {{ p.paymentType }}
                        </span>
                      </td>
                    </tr>

                    <tr v-if="productPurchases.length === 0">
                      <td colspan="7" class="py-16 text-center text-on-surface-variant select-none">
                        <Truck class="w-10 h-10 mx-auto text-outline mb-2 stroke-[1.5px]" />
                        <p class="font-bold text-sm text-on-surface">{{ $t('productDetail.noPurchasesFound') }}</p>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>

    <!-- 5. EDIT PRODUCT MODAL -->
    <Modal
      :isOpen="showEditModal"
      :title="$t('inventory.editProductModalTitle')"
      :subtitle="$t('inventory.editProductModalSubtitle')"
      :onClose="() => showEditModal = false"
      maxWidth="max-w-xl"
    >
      <div v-if="product" class="space-y-4 text-xs font-sans">
        <!-- Product Name -->
        <div class="space-y-1.5">
          <label class="font-bold text-on-surface">{{ $t('inventory.productDisplayTitle') }}</label>
          <input 
            type="text"
            v-model="editForm.name"
            class="w-full p-2.5 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface font-semibold text-xs outline-none focus:border-primary"
          />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <!-- Retail Price -->
          <div class="space-y-1.5">
            <label class="font-bold text-on-surface">{{ $t('inventory.retailSellingPrice', { currency }) }}</label>
            <input 
              type="number"
              v-model="editForm.price"
              class="w-full p-2.5 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface font-mono font-bold text-xs outline-none focus:border-primary"
            />
          </div>

          <!-- Cost Price -->
          <div class="space-y-1.5">
            <label class="font-bold text-on-surface">{{ $t('inventory.buyCostWhole', { currency }) }}</label>
            <input 
              type="number"
              v-model="editForm.cost"
              class="w-full p-2.5 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface font-mono font-bold text-xs outline-none focus:border-primary"
            />
          </div>

          <!-- Wholesale Price -->
          <div class="space-y-1.5">
            <label class="font-bold text-on-surface">{{ $t('inventory.wholesalePrice', { currency }) }}</label>
            <input 
              type="number"
              v-model="editForm.wholesalePrice"
              class="w-full p-2.5 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface font-mono font-bold text-xs outline-none focus:border-primary"
            />
          </div>

          <!-- Reorder Level (Min Stock) -->
          <div class="space-y-1.5">
            <label class="font-bold text-on-surface">{{ $t('inventory.minStockAlert') }}</label>
            <input 
              type="number"
              v-model="editForm.minStock"
              class="w-full p-2.5 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface font-mono font-bold text-xs outline-none focus:border-primary"
            />
          </div>

          <!-- Barcode -->
          <div class="space-y-1.5">
            <label class="font-bold text-on-surface">{{ $t('inventory.barcodeSkuCode') }}</label>
            <input 
              type="text"
              v-model="editForm.barcode"
              class="w-full p-2.5 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface font-mono text-xs outline-none focus:border-primary"
            />
          </div>

          <!-- Wholesale Barcode -->
          <div class="space-y-1.5">
            <label class="font-bold text-on-surface">{{ $t('inventory.wholesaleBarcode') }}</label>
            <input 
              type="text"
              v-model="editForm.wholesaleBarcode"
              class="w-full p-2.5 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface font-mono text-xs outline-none focus:border-primary"
            />
          </div>

          <!-- Category -->
          <div class="space-y-1.5">
            <label class="font-bold text-on-surface">{{ $t('inventory.categorySegment') }}</label>
            <input 
              type="text"
              v-model="editForm.category"
              class="w-full p-2.5 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface text-xs outline-none focus:border-primary"
            />
          </div>

          <!-- Unit of Measure -->
          <div class="space-y-1.5">
            <label class="font-bold text-on-surface">{{ $t('inventory.unitOfMeasure') }}</label>
            <select 
              v-model="editForm.unitOfMeasure"
              class="w-full p-2.5 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface text-xs outline-none focus:border-primary cursor-pointer font-semibold"
            >
              <option value="PCS">{{ $t('inventory.pcs') }}</option>
              <option value="KG">{{ $t('inventory.kg') }}</option>
              <option value="LTR">{{ $t('inventory.ltr') }}</option>
            </select>
          </div>

          <!-- Conversion Factor -->
          <div class="space-y-1.5">
            <label class="font-bold text-on-surface">{{ $t('inventory.productSizeUnitsPack') }}</label>
            <input 
              type="number"
              v-model="editForm.conversionFactor"
              placeholder="e.g. 24"
              class="w-full p-2.5 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface font-mono text-xs outline-none focus:border-primary"
            />
          </div>

          <!-- Expiry Date -->
          <div class="space-y-1.5">
            <label class="font-bold text-on-surface">{{ $t('inventory.expiryDate') }}</label>
            <input 
              type="date"
              v-model="editForm.expiryDate"
              class="w-full p-2.5 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface font-mono text-xs outline-none focus:border-primary"
            />
          </div>
        </div>
      </div>

      <template #footer>
        <button 
          @click="showEditModal = false"
          :disabled="isSubmitting"
          class="px-4 py-2 rounded-xl border border-outline-variant text-on-surface-variant font-bold text-xs cursor-pointer hover:bg-surface-container"
        >
          {{ $t('common.cancel') }}
        </button>
        <button 
          @click="handleSaveEdit"
          :disabled="isSubmitting"
          class="px-5 py-2 rounded-xl bg-primary text-white font-bold text-xs cursor-pointer border-0 shadow-xs hover:opacity-95 flex items-center gap-2"
        >
          <RotateCw v-if="isSubmitting" class="w-3.5 h-3.5 animate-spin" />
          <span>{{ isSubmitting ? $t('common.processing') : $t('common.saveChanges') }}</span>
        </button>
      </template>
    </Modal>

    <!-- 6. RESTOCK / STOCK MOVEMENT MODAL -->
    <Modal
      :isOpen="showRestockModal"
      :title="restockType === 'DAMAGED' ? $t('inventory.restockDamagedTitle') : $t('inventory.restockTitle')"
      :subtitle="product?.name"
      :onClose="() => showRestockModal = false"
      maxWidth="max-w-lg"
    >
      <div v-if="product" class="space-y-4 text-xs font-sans">
        <!-- Movement Type Selector -->
        <div class="space-y-1.5">
          <label class="font-bold text-on-surface">{{ $t('productDetail.colType') }}</label>
          <div class="grid grid-cols-3 gap-2">
            <button 
              type="button"
              v-for="tOpt in [
                { key: 'ADJUSTMENT', label: 'Adjustment' },
                { key: 'RETURN', label: 'Return' },
                { key: 'DAMAGED', label: 'Damaged (Loss)' }
              ]"
              :key="tOpt.key"
              @click="restockType = tOpt.key as any"
              class="p-2 rounded-xl border font-bold text-center text-xs transition-all cursor-pointer"
              :class="restockType === tOpt.key 
                ? (tOpt.key === 'DAMAGED' ? 'bg-error text-white border-error shadow-xs' : 'bg-primary text-white border-primary shadow-xs') 
                : 'bg-surface-container-low border-outline-variant text-on-surface-variant hover:bg-surface-container'"
            >
              {{ tOpt.label }}
            </button>
          </div>
        </div>

        <!-- Quantity Input -->
        <div class="space-y-1.5">
          <label class="font-bold text-on-surface">
            {{ restockType === 'DAMAGED' ? 'Units to Write-off (Loss) *' : 'Units to Add to Stock *' }}
          </label>
          <div class="relative">
            <input 
              type="number"
              v-model="restockQty"
              placeholder="e.g. 50"
              min="1"
              class="w-full p-2.5 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface font-mono font-bold text-xs outline-none focus:border-primary"
            />
            <span class="absolute right-3 top-1/2 -translate-y-1/2 text-outline font-bold">
              {{ product.unitOfMeasure || 'PCS' }}
            </span>
          </div>
        </div>

        <!-- Notes / Reason -->
        <div class="space-y-1.5">
          <label class="font-bold text-on-surface">{{ $t('common.notes') }}</label>
          <textarea 
            v-model="restockNotes"
            rows="2"
            placeholder="Reason for movement or reference notes..."
            class="w-full p-2.5 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface text-xs outline-none focus:border-primary resize-none"
          ></textarea>
        </div>
      </div>

      <template #footer>
        <button 
          @click="showRestockModal = false"
          :disabled="isSubmitting"
          class="px-4 py-2 rounded-xl border border-outline-variant text-on-surface-variant font-bold text-xs cursor-pointer hover:bg-surface-container"
        >
          {{ $t('common.cancel') }}
        </button>
        <button 
          @click="handleSaveRestock"
          :disabled="isSubmitting"
          class="px-5 py-2 rounded-xl font-bold text-xs text-white cursor-pointer border-0 shadow-xs flex items-center gap-2"
          :class="restockType === 'DAMAGED' ? 'bg-error hover:bg-error/90' : 'bg-primary hover:opacity-95'"
        >
          <RotateCw v-if="isSubmitting" class="w-3.5 h-3.5 animate-spin" />
          <span>{{ isSubmitting ? $t('common.processing') : (restockType === 'DAMAGED' ? 'Record Damaged Loss' : 'Update Stock') }}</span>
        </button>
      </template>
    </Modal>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAppViewModel } from '../viewmodels/useAppViewModel';
import { formatCurrency, formatCurrencyWithoutSymbol } from '../models/mockData';
import { api } from '../services/api';
import { showToast } from '../services/toastService';
import { t } from '../i18n';
import type { Product, StockMovement, Supplier } from '../models/types';
import Modal from '../components/common/Modal.vue';
import JengaLoader from '../components/common/JengaLoader.vue';
import AnimatedNumber from '../components/common/AnimatedNumber.vue';
import { 
  ArrowLeft, 
  ChevronRight, 
  RotateCw, 
  Pencil, 
  PlusCircle, 
  Tag, 
  TrendingUp, 
  Layers, 
  ShoppingBag, 
  Coins, 
  Boxes, 
  Truck, 
  Building2, 
  AlertOctagon, 
  AlertTriangle, 
  CheckCircle2, 
  Package, 
  PackageOpen, 
  History, 
  Receipt, 
  Search, 
  Inbox, 
  CreditCard, 
  SlidersHorizontal, 
  RotateCcw, 
  ArrowDownRight, 
  ArrowUpRight 
} from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();
const vm = useAppViewModel();

const productId = computed(() => String(route.params.id || ''));
const currency = computed(() => vm.settings.value.currency || 'TZS');

const isLoading = ref(true);
const isSubmitting = ref(false);
const activeTab = ref<'movements' | 'sales' | 'purchases'>('movements');

// Local Product & Records
interface ProductSummary {
  productId: string;
  productName: string;
  totalRevenue: number;
  totalSoldQuantity: number;
  totalSalesCount: number;
  totalPurchasesCost: number;
  totalInboundQuantity: number;
  grossProfit: number;
  grossMarginPercent: number;
  currentStock: number;
  inventoryAssetValue: number;
  potentialRetailValue: number;
  damagedUnits: number;
  damagedLossCost: number;
}

const product = ref<Product | null>(null);
const productSummary = ref<ProductSummary | null>(null);
const stockMovements = ref<StockMovement[]>([]);
const productSales = ref<any[]>([]);
const productPurchases = ref<any[]>([]);

// Movements filter states
const selectedMovementType = ref<string>('ALL');
const movementSearch = ref<string>('');
const movementPage = ref(1);
const movementItemsPerPage = 12;

// Sales pagination
const salesPage = ref(1);
const salesItemsPerPage = 12;

// Modals
const showEditModal = ref(false);
const showRestockModal = ref(false);

const editForm = ref({
  name: '',
  price: '',
  cost: '',
  wholesalePrice: '',
  minStock: '',
  barcode: '',
  wholesaleBarcode: '',
  category: '',
  unitOfMeasure: 'PCS',
  conversionFactor: '',
  expiryDate: ''
});

const restockType = ref<'ADJUSTMENT' | 'RETURN' | 'DAMAGED'>('ADJUSTMENT');
const restockQty = ref('');
const restockNotes = ref('');

const movementTypeFilters = [
  { key: 'ALL', label: 'All Movements' },
  { key: 'PURCHASE', label: 'Inbound Restocks' },
  { key: 'SALE', label: 'Sales Outbound' },
  { key: 'ADJUSTMENT', label: 'Adjustments' },
  { key: 'RETURN', label: 'Returns' },
  { key: 'DAMAGED', label: 'Damaged Losses' }
];

// Matched Supplier
const matchedSupplier = computed(() => {
  if (!product.value) return null;
  const sName = product.value.supplier || product.value.supplierName || '';
  if (!sName) return null;
  return vm.suppliers.value.find(s => s.name.toLowerCase() === sName.toLowerCase() || s.id === sName) || null;
});

// Pricing Analysis Computed
const pricingAnalysis = computed(() => {
  const p = product.value;
  if (!p) return { unitProfit: 0, marginPct: 0, markupPct: 0, wholesaleMarginPct: 0, costPct: 50 };
  const cost = Number(p.cost) || 0;
  const price = Number(p.price) || 0;
  const wholesale = Number(p.wholesalePrice) || 0;

  const unitProfit = price - cost;
  const marginPct = price > 0 ? (unitProfit / price) * 100 : 0;
  const markupPct = cost > 0 ? (unitProfit / cost) * 100 : 0;
  const wholesaleMarginPct = wholesale > 0 ? ((wholesale - cost) / wholesale) * 100 : 0;
  const costPct = price > 0 ? (cost / price) * 100 : 50;

  return {
    unitProfit,
    marginPct,
    markupPct,
    wholesaleMarginPct,
    costPct
  };
});

// Stock Ratio % of Min Stock
const stockRatioPct = computed(() => {
  if (!product.value || !product.value.minStock) return 100;
  return ((product.value.stock || 0) / product.value.minStock) * 100;
});

// Collection & Financial Metrics Computed
const collectionMetrics = computed(() => {
  // If dedicated summary API has arrived, use high-precision backend aggregates
  if (productSummary.value) {
    return {
      totalRevenue: Number(productSummary.value.totalRevenue) || 0,
      totalSoldQty: Number(productSummary.value.totalSoldQuantity) || 0,
      salesCount: Number(productSummary.value.totalSalesCount) || 0,
      totalPurchasesCost: Number(productSummary.value.totalPurchasesCost) || 0,
      totalInboundQty: Number(productSummary.value.totalInboundQuantity) || 0,
      grossProfit: Number(productSummary.value.grossProfit) || 0,
      grossMarginPct: Number(productSummary.value.grossMarginPercent) || 0,
      inventoryAssetValue: Number(productSummary.value.inventoryAssetValue) || 0,
      potentialRetailValue: Number(productSummary.value.potentialRetailValue) || 0,
      damagedUnits: Number(productSummary.value.damagedUnits) || 0,
      damagedLossCost: Number(productSummary.value.damagedLossCost) || 0
    };
  }

  // Graceful fallback from local state
  const p = product.value;
  const cost = Number(p?.cost) || 0;
  const price = Number(p?.price) || 0;
  const currentStock = Number(p?.stock) || 0;

  // 1. Sales metrics
  let totalRevenue = 0;
  let totalSoldQty = 0;
  const salesCount = productSales.value.length;

  for (const s of productSales.value) {
    totalRevenue += Number(s.lineTotal) || 0;
    totalSoldQty += Number(s.itemQuantity) || 0;
  }

  // 2. Purchases metrics
  let totalPurchasesCost = 0;
  let totalInboundQty = 0;
  for (const po of productPurchases.value) {
    totalPurchasesCost += Number(po.itemTotalCost) || 0;
    totalInboundQty += Number(po.itemQuantity) || 0;
  }

  // Also include PURCHASE stock movements if purchases list is empty
  if (productPurchases.value.length === 0) {
    const purchaseMovements = stockMovements.value.filter(sm => (sm.type || '').toUpperCase() === 'PURCHASE');
    for (const sm of purchaseMovements) {
      totalInboundQty += Number(sm.quantity) || 0;
      totalPurchasesCost += (Number(sm.quantity) || 0) * (Number(sm.costPrice) || cost);
    }
  }

  // 3. Gross Profit
  const cogsSold = totalSoldQty * cost;
  const grossProfit = totalRevenue - cogsSold;
  const grossMarginPct = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

  // 4. Asset Value
  const inventoryAssetValue = currentStock * cost;
  const potentialRetailValue = currentStock * price;

  // 5. Damaged loss
  let damagedUnits = 0;
  const damagedMovements = stockMovements.value.filter(sm => (sm.type || '').toUpperCase() === 'DAMAGED');
  for (const dm of damagedMovements) {
    damagedUnits += Math.abs(Number(dm.quantity) || 0);
  }
  const damagedLossCost = damagedUnits * cost;

  return {
    totalRevenue,
    totalSoldQty,
    salesCount,
    totalPurchasesCost,
    totalInboundQty,
    grossProfit,
    grossMarginPct,
    inventoryAssetValue,
    potentialRetailValue,
    damagedUnits,
    damagedLossCost
  };
});

// Filtered Stock Movements
const filteredStockMovements = computed(() => {
  let list = stockMovements.value;
  if (selectedMovementType.value !== 'ALL') {
    list = list.filter(sm => (sm.type || '').toUpperCase() === selectedMovementType.value);
  }
  if (movementSearch.value.trim()) {
    const q = movementSearch.value.trim().toLowerCase();
    list = list.filter(sm => 
      (sm.referenceId || '').toLowerCase().includes(q) ||
      (sm.createdByName || '').toLowerCase().includes(q) ||
      ((sm as any).notes || '').toLowerCase().includes(q)
    );
  }
  return list;
});

const paginatedStockMovements = computed(() => {
  const start = (movementPage.value - 1) * movementItemsPerPage;
  return filteredStockMovements.value.slice(start, start + movementItemsPerPage);
});

// Paginated Sales
const paginatedSales = computed(() => {
  const start = (salesPage.value - 1) * salesItemsPerPage;
  return productSales.value.slice(start, start + salesItemsPerPage);
});

// Fetch Main Product & Associated Data
const fetchData = async () => {
  const id = productId.value;
  if (!id) return;
  isLoading.value = true;

  try {
    const branchId = localStorage.getItem('branchId');

    // 1. Fetch / Find Product
    let foundProd: Product | null = null;
    if (vm.products.value && vm.products.value.length > 0) {
      foundProd = vm.products.value.find(p => p.id === id) || null;
    }

    try {
      const prodApiData = await api.get<any>(`/api/products/${id}`);
      if (prodApiData && prodApiData.id) {
        foundProd = {
          id: prodApiData.id,
          name: prodApiData.name,
          barcode: prodApiData.barcode || '',
          category: prodApiData.categoryName || prodApiData.category || 'General',
          cost: Number(prodApiData.costPrice || prodApiData.cost) || 0,
          price: Number(prodApiData.sellingPrice || prodApiData.price) || 0,
          stock: Number(prodApiData.stock) || 0,
          minStock: Number(prodApiData.reorderLevel ?? prodApiData.minStock) || 0,
          status: (prodApiData.status || 'In Stock') as any,
          supplier: prodApiData.supplierName || prodApiData.supplier || '',
          sku: prodApiData.sku || '',
          wholesalePrice: prodApiData.wholesalePrice ? Number(prodApiData.wholesalePrice) : undefined,
          wholesaleBarcode: prodApiData.wholesaleBarcode || undefined,
          conversionFactor: prodApiData.conversionFactor ? Number(prodApiData.conversionFactor) : undefined,
          unitOfMeasure: prodApiData.unitOfMeasure || prodApiData.UnitOfMeasure || 'PCS',
          expiryDate: prodApiData.expiryDate || undefined,
          isActive: prodApiData.isActive !== false
        };
      }
    } catch (_) {
      // If single GET fails, fallback to catalog
      if (!foundProd) {
        await vm.fetchProducts();
        foundProd = vm.products.value.find(p => p.id === id) || null;
      }
    }

    product.value = foundProd;

    // 2. Concurrently fetch dedicated product-level APIs (high performance, no filtering on frontend)
    const [summaryRes, movementsRes, salesRes, purchasesRes] = await Promise.allSettled([
      api.get<ProductSummary>(`/api/products/${id}/summary`),
      api.get<StockMovement[]>(`/api/products/${id}/stock-movements`),
      api.get<any[]>(`/api/products/${id}/sales`),
      api.get<any[]>(`/api/products/${id}/purchases`)
    ]);

    // Summary aggregate
    if (summaryRes.status === 'fulfilled' && summaryRes.value) {
      productSummary.value = summaryRes.value;
    }

    // Product-specific stock movements
    if (movementsRes.status === 'fulfilled' && Array.isArray(movementsRes.value)) {
      stockMovements.value = movementsRes.value;
    } else {
      stockMovements.value = [];
    }

    // Product-specific sales items
    if (salesRes.status === 'fulfilled' && Array.isArray(salesRes.value)) {
      productSales.value = salesRes.value.map(s => ({
        id: s.id,
        saleId: s.saleId,
        date: s.saleDate,
        refCode: s.customerCode || s.saleId?.slice(0, 8).toUpperCase() || s.id?.slice(0, 8).toUpperCase(),
        itemQuantity: Number(s.quantity) || 0,
        itemPrice: Number(s.unitPrice) || 0,
        itemDiscount: Number(s.discountPercent) || 0,
        lineTotal: Number(s.subtotal) || 0,
        paymentMethod: s.paymentMethod || 'CASH',
        customerName: s.customerName || null,
        cashierName: s.cashierName || null,
        status: s.status || 'PAID',
        isWholesale: s.isWholesale || false
      }));
    } else {
      productSales.value = [];
    }

    // Product-specific purchases items
    if (purchasesRes.status === 'fulfilled' && Array.isArray(purchasesRes.value)) {
      productPurchases.value = purchasesRes.value.map(po => ({
        id: po.id,
        purchaseId: po.purchaseId,
        refCode: po.purchaseId?.slice(0, 8).toUpperCase() || po.id?.slice(0, 8).toUpperCase(),
        createdAt: po.purchaseDate,
        supplierName: po.supplierName || '',
        paymentType: po.paymentType || 'CASH',
        itemQuantity: Number(po.quantity) || 0,
        itemUnitCost: Number(po.unitCost) || 0,
        itemTotalCost: Number(po.totalCost) || (Number(po.quantity) * Number(po.unitCost)) || 0,
        status: po.status || 'COMPLETED',
        isWholesale: po.isWholesale || false
      }));
    } else {
      productPurchases.value = [];
    }

  } catch (err: any) {
    console.error('Failed to load product details:', err);
    showToast(err.message || 'Failed to load product details', 'error');
  } finally {
    isLoading.value = false;
  }
};

// Edit Modal Actions
const openEditModal = () => {
  if (!product.value) return;
  const p = product.value;
  editForm.value = {
    name: p.name,
    price: String(p.price || ''),
    cost: String(p.cost || ''),
    wholesalePrice: p.wholesalePrice ? String(p.wholesalePrice) : '',
    minStock: String(p.minStock ?? ''),
    barcode: p.barcode || '',
    wholesaleBarcode: p.wholesaleBarcode || '',
    category: p.category || '',
    unitOfMeasure: p.unitOfMeasure || 'PCS',
    conversionFactor: p.conversionFactor ? String(p.conversionFactor) : '',
    expiryDate: p.expiryDate ? p.expiryDate.slice(0, 10) : ''
  };
  showEditModal.value = true;
};

const handleSaveEdit = async () => {
  if (!product.value) return;
  const p = product.value;
  isSubmitting.value = true;

  try {
    const payload: any = {
      id: p.id,
      name: editForm.value.name.trim(),
      costPrice: parseFloat(editForm.value.cost) || 0,
      sellingPrice: parseFloat(editForm.value.price) || 0,
      reorderLevel: parseFloat(editForm.value.minStock) || 0,
      stock: p.stock,
      barcode: editForm.value.barcode.trim() || null,
      wholesaleBarcode: editForm.value.wholesaleBarcode.trim() || null,
      categoryName: editForm.value.category.trim() || 'General',
      UnitOfMeasure: editForm.value.unitOfMeasure,
      unitOfMeasure: editForm.value.unitOfMeasure,
      expiryDate: editForm.value.expiryDate || undefined,
      isActive: true
    };

    if (editForm.value.wholesalePrice) {
      payload.wholesalePrice = parseFloat(editForm.value.wholesalePrice);
    }
    if (editForm.value.conversionFactor) {
      payload.conversionFactor = parseFloat(editForm.value.conversionFactor);
    }

    const updated = await api.put(`/api/products/${p.id}`, payload);

    // Update local product ref
    product.value = {
      ...p,
      name: updated.name || payload.name,
      price: Number(updated.sellingPrice || payload.sellingPrice),
      cost: Number(updated.costPrice || payload.costPrice),
      minStock: Number(updated.reorderLevel ?? payload.reorderLevel),
      barcode: updated.barcode || payload.barcode || '',
      wholesaleBarcode: updated.wholesaleBarcode || payload.wholesaleBarcode || '',
      category: updated.categoryName || payload.categoryName,
      unitOfMeasure: updated.unitOfMeasure || payload.unitOfMeasure,
      wholesalePrice: updated.wholesalePrice ? Number(updated.wholesalePrice) : undefined,
      conversionFactor: updated.conversionFactor ? Number(updated.conversionFactor) : undefined,
      expiryDate: updated.expiryDate || payload.expiryDate
    };

    // Update vm.products global state
    const idx = vm.products.value.findIndex(item => item.id === p.id);
    if (idx !== -1 && product.value) {
      vm.products.value[idx] = { ...product.value };
    }

    showToast(t('productDetail.editSuccess'), 'success');
    showEditModal.value = false;
  } catch (err: any) {
    showToast(err.message || 'Failed to update product', 'error');
  } finally {
    isSubmitting.value = false;
  }
};

// Restock Modal Actions
const openRestockModal = () => {
  restockType.value = 'ADJUSTMENT';
  restockQty.value = '';
  restockNotes.value = '';
  showRestockModal.value = true;
};

const handleSaveRestock = async () => {
  if (!product.value) return;
  const p = product.value;
  const qtyNum = parseFloat(restockQty.value);

  if (isNaN(qtyNum) || qtyNum <= 0) {
    showToast('Please enter a valid stock quantity', 'error');
    return;
  }

  if (restockType.value === 'DAMAGED' && qtyNum > p.stock) {
    showToast(`Cannot write off ${qtyNum} units: current stock is only ${p.stock}`, 'error');
    return;
  }

  isSubmitting.value = true;
  try {
    const payload: any = {
      type: restockType.value,
      quantity: qtyNum,
      notes: restockNotes.value.trim() || undefined
    };

    const res: any = await api.post(`/api/products/${p.id}/stock-movement`, payload);

    if (res?.status === 'PENDING_APPROVAL') {
      showToast(res.message || 'Stock adjustment submitted for Store Owner/Admin approval.', 'info');
      showRestockModal.value = false;
      return;
    }

    // Locally update product stock
    const isDeduction = restockType.value === 'DAMAGED';
    const delta = isDeduction ? -qtyNum : qtyNum;
    const newStock = Math.max(0, p.stock + delta);

    product.value = {
      ...p,
      stock: newStock,
      status: newStock === 0 ? 'Out of Stock' : (newStock <= p.minStock ? 'Low Stock' : 'In Stock')
    };

    // Update in vm.products
    const idx = vm.products.value.findIndex(item => item.id === p.id);
    if (idx !== -1 && product.value) {
      vm.products.value[idx] = { ...product.value };
    }

    showToast(t('productDetail.restockSuccess'), 'success');
    showRestockModal.value = false;

    // Refresh stock movements in background
    fetchData();
  } catch (err: any) {
    showToast('Failed to record stock movement: ' + (err.message || err), 'error');
  } finally {
    isSubmitting.value = false;
  }
};

// Formatting & Helper functions
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
  } catch (_) {
    return dateStr;
  }
};

const getStockStatusBadgeClass = (p: Product) => {
  if (p.stock === 0) return 'bg-error-container text-error border-error/30';
  if (p.stock <= p.minStock) return 'bg-warning-container text-warning border-warning/30';
  return 'bg-primary-container text-on-primary-container border-primary/20';
};

const getStockStatusLabel = (p: Product) => {
  if (p.stock === 0) return t('productDetail.stockStatusOut');
  if (p.stock <= p.minStock) return t('productDetail.stockStatusLow');
  return null;
};

const getExpiryBadgeClass = (expiryDateStr: string) => {
  const exp = new Date(expiryDateStr);
  const now = new Date();
  const diffDays = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return 'bg-error/15 text-error border border-error/30';
  if (diffDays <= 90) return 'bg-amber-500/15 text-amber-600 border border-amber-500/30';
  return 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/30';
};

const getExpiryBadgeLabel = (expiryDateStr: string) => {
  const exp = new Date(expiryDateStr);
  const now = new Date();
  const diffDays = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return t('productDetail.expiredDaysAgo', { days: Math.abs(diffDays) });
  if (diffDays <= 90) return t('productDetail.daysRemaining', { days: diffDays });
  return t('productDetail.validDate');
};

const getStockAdvisoryClass = (p: Product) => {
  if (p.stock === 0) return 'bg-error/10 text-error border-error/30';
  if (p.stock <= p.minStock) return 'bg-amber-500/10 text-amber-900 border-amber-500/30';
  return 'bg-emerald-500/10 text-emerald-900 border-emerald-500/30';
};

const getStockAdvisoryIcon = (p: Product) => {
  if (p.stock === 0) return AlertOctagon;
  if (p.stock <= p.minStock) return AlertTriangle;
  return CheckCircle2;
};

const getStockAdvisoryMessage = (p: Product) => {
  if (p.stock === 0) return t('productDetail.stockStatusOut');
  if (p.stock <= p.minStock) return t('productDetail.stockStatusLow');
  return null;
};

const isMovementInbound = (type?: string) => {
  const t = (type || '').toUpperCase();
  return t === 'PURCHASE' || t === 'IN' || t === 'RETURN';
};

const formatMovementType = (type?: string) => {
  const t = (type || '').toUpperCase();
  if (t === 'PURCHASE') return 'Restock Inflow';
  if (t === 'SALE') return 'Sale Outbound';
  if (t === 'DAMAGED') return 'Damaged Loss';
  if (t === 'ADJUSTMENT') return 'Adjustment';
  if (t === 'RETURN') return 'Return';
  return t || 'Movement';
};

const getMovementTypeBadgeClass = (type?: string) => {
  const t = (type || '').toUpperCase();
  if (t === 'PURCHASE') return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
  if (t === 'SALE') return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
  if (t === 'DAMAGED') return 'bg-error/10 text-error border-error/20';
  if (t === 'ADJUSTMENT') return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
  if (t === 'RETURN') return 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20';
  return 'bg-surface-container text-on-surface-variant border-outline-variant';
};

const getMovementTypeIcon = (type?: string) => {
  const t = (type || '').toUpperCase();
  if (t === 'PURCHASE') return ArrowDownRight;
  if (t === 'SALE') return ArrowUpRight;
  if (t === 'DAMAGED') return AlertOctagon;
  if (t === 'ADJUSTMENT') return SlidersHorizontal;
  if (t === 'RETURN') return RotateCcw;
  return Layers;
};

onMounted(() => {
  vm.fetchCurrentUserPermissions().catch(() => {});
  fetchData();
  if (vm.suppliers.value.length === 0) {
    vm.fetchSuppliers();
  }
});
</script>

<style scoped>
@media print {
  body * {
    visibility: hidden;
  }
  #printable-barcode-card, #printable-barcode-card * {
    visibility: visible;
  }
  #printable-barcode-card {
    position: fixed;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    box-shadow: none !important;
    border: 1px solid #000 !important;
  }
}
</style>
