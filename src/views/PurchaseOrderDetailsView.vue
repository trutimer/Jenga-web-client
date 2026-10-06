<template>
  <div class="w-full max-w-[1720px] mx-auto py-2 font-sans select-none animate-fade-up px-2 sm:px-4 md:px-6">
    
    <!-- LOADER -->
    <JengaLoader 
      v-if="isLoading" 
      overlay 
      size="lg" 
      label="Loading Purchase Order" 
      sublabel="Fetching procurement voucher and receiving trail..." 
    />

    <!-- ERROR STATE -->
    <div v-else-if="!po" class="p-12 text-center bg-surface-container-lowest border border-outline-variant rounded-2xl max-w-lg mx-auto my-12">
      <AlertCircle class="w-12 h-12 text-error mx-auto mb-3" />
      <h2 class="text-lg font-bold text-on-surface mb-1">Purchase Order Not Found</h2>
      <p class="text-xs text-on-surface-variant mb-6">The requested purchase order could not be located or may have been deleted.</p>
      <button 
        type="button"
        @click="router.push('/purchases')"
        class="px-4 py-2 rounded-xl bg-primary text-on-primary font-bold text-xs cursor-pointer border-0"
      >
        {{ $t('purchaseOrders.backToOrders') }}
      </button>
    </div>

    <!-- MAIN VIEW (WEB SCREEN - HIDDEN ON PRINT) -->
    <div v-else class="space-y-6 no-print print:hidden">

      <!-- TOP HEADER ACTION BAR -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-outline-variant/60">
        <div class="flex items-center gap-3">
          <button 
            type="button"
            @click="router.push('/purchases')"
            class="p-2 rounded-xl bg-surface-container-low hover:bg-surface-container border border-outline-variant text-on-surface-variant transition-colors cursor-pointer"
            :title="$t('purchaseOrders.backToOrders')"
          >
            <ArrowLeft class="w-5 h-5" />
          </button>
          <div>
            <div class="flex items-center gap-2.5 flex-wrap">
              <h1 class="text-xl sm:text-2xl font-black text-on-surface tracking-tight font-mono">
                {{ po.poNumber || ('#' + po.id.slice(0, 8)) }}
              </h1>
              <!-- Status Badge -->
              <span 
                class="px-2.5 py-1 rounded-full text-xs font-bold uppercase inline-flex items-center gap-1.5 font-sans"
                :class="getStatusBadgeClass(po.status)"
              >
                <span v-if="po.status === 'PENDING_APPROVAL'" class="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                <span>{{ formatStatusLabel(po.status) }}</span>
              </span>
            </div>
            <p class="text-xs text-on-surface-variant font-medium mt-0.5">
              Created on {{ formatDateTime(po.createdAt) }} by <strong class="text-on-surface">{{ po.createdByName || 'Staff' }}</strong>
            </p>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-wrap items-center gap-2.5 self-end sm:self-auto">
          <!-- Refresh -->
          <button 
            type="button"
            @click="fetchPoDetails"
            class="p-2 rounded-xl border border-outline hover:bg-surface-container-low text-on-surface-variant transition-colors cursor-pointer bg-surface-container-lowest"
            title="Refresh Order"
          >
            <RotateCw :class="['w-4 h-4', isRefreshing ? 'animate-spin text-primary' : '']" />
          </button>

          <!-- Print Voucher -->
          <button 
            type="button"
            @click="handlePrint"
            class="h-9 px-3.5 rounded-xl border border-outline hover:bg-surface-container-low text-on-surface font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer bg-surface-container-lowest shadow-xs"
          >
            <Printer class="w-3.5 h-3.5 text-on-surface-variant" />
            <span>{{ $t('purchaseOrders.printVoucher') }}</span>
          </button>

          <!-- Submit Draft (If Draft) -->
          <button 
            v-if="po.status === 'DRAFT' && canSubmitPo"
            type="button"
            @click="handleSubmitForApproval"
            :disabled="isProcessingAction"
            class="h-9 px-4 rounded-xl bg-primary text-on-primary font-bold text-xs hover:bg-primary/90 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50 border-0"
          >
            <Send class="w-3.5 h-3.5" />
            <span>{{ $t('purchaseOrders.submitDraftBtn') }}</span>
          </button>

          <!-- Receive Goods (If Approved or Partially Received) -->
          <button 
            v-if="(po.status === 'APPROVED' || po.status === 'PARTIALLY_RECEIVED') && canReceivePo"
            type="button"
            @click="showReceiveModal = true"
            class="h-9 px-4.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95 border-0"
          >
            <PackageCheck class="w-4 h-4" />
            <span>{{ $t('purchaseOrders.receiveGoodsBtn') }}</span>
          </button>

          <!-- Cancel PO (If Draft, Approved, Partially Received) -->
          <button 
            v-if="(po.status === 'DRAFT' || po.status === 'APPROVED' || po.status === 'PENDING_APPROVAL') && canEditPo"
            type="button"
            @click="handleCancelPo"
            :disabled="isProcessingAction"
            class="h-9 px-3 rounded-xl border border-error/30 hover:bg-error/10 text-error font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer bg-transparent disabled:opacity-50"
          >
            <XCircle class="w-3.5 h-3.5" />
            <span>{{ $t('purchaseOrders.cancelPoBtn') }}</span>
          </button>

          <!-- Delete Draft (Draft only) -->
          <button 
            v-if="po.status === 'DRAFT' && canEditPo"
            type="button"
            @click="handleDeleteDraft"
            :disabled="isProcessingAction"
            class="h-9 px-3 rounded-xl border border-error/30 hover:bg-error/10 text-error font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer bg-transparent disabled:opacity-50"
          >
            <Trash2 class="w-3.5 h-3.5" />
            <span>{{ $t('purchaseOrders.deleteDraftBtn') }}</span>
          </button>
        </div>
      </div>

      <!-- LIFECYCLE PROGRESS STEPPER -->
      <div class="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-4 sm:p-5 shadow-xs">
        <div class="grid grid-cols-1 sm:grid-cols-4 gap-4 relative">
          <!-- Step 1: Draft -->
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-emerald-500/15 text-emerald-600 font-bold flex items-center justify-center shrink-0">
              <Check class="w-4 h-4 stroke-[3]" />
            </div>
            <div>
              <span class="text-xs font-bold text-on-surface block">{{ $t('purchaseOrders.timelineDraft') }}</span>
              <span class="text-[10px] text-outline font-mono">{{ formatDateTime(po.createdAt) }}</span>
            </div>
          </div>

          <!-- Step 2: Submitted -->
          <div class="flex items-center gap-3">
            <div 
              class="w-8 h-8 rounded-full font-bold flex items-center justify-center shrink-0"
              :class="po.status !== 'DRAFT' ? 'bg-emerald-500/15 text-emerald-600' : 'bg-surface-container text-outline'"
            >
              <Check v-if="po.status !== 'DRAFT'" class="w-4 h-4 stroke-[3]" />
              <span v-else class="text-xs">2</span>
            </div>
            <div>
              <span class="text-xs font-bold block" :class="po.status !== 'DRAFT' ? 'text-on-surface' : 'text-outline'">
                {{ $t('purchaseOrders.timelineSubmitted') }}
              </span>
              <span class="text-[10px] text-outline font-mono">
                {{ po.status !== 'DRAFT' ? 'Submitted' : 'Pending submit' }}
              </span>
            </div>
          </div>

          <!-- Step 3: Approved / Rejected -->
          <div class="flex items-center gap-3">
            <div 
              class="w-8 h-8 rounded-full font-bold flex items-center justify-center shrink-0"
              :class="po.status === 'REJECTED' 
                ? 'bg-error/15 text-error' 
                : (isApprovedOrBeyond ? 'bg-emerald-500/15 text-emerald-600' : (po.status === 'PENDING_APPROVAL' ? 'bg-amber-500/15 text-amber-600' : 'bg-surface-container text-outline'))"
            >
              <X v-if="po.status === 'REJECTED'" class="w-4 h-4 stroke-[3]" />
              <Check v-else-if="isApprovedOrBeyond" class="w-4 h-4 stroke-[3]" />
              <Clock v-else-if="po.status === 'PENDING_APPROVAL'" class="w-4 h-4" />
              <span v-else class="text-xs">3</span>
            </div>
            <div>
              <span class="text-xs font-bold block" :class="isApprovedOrBeyond ? 'text-on-surface' : (po.status === 'REJECTED' ? 'text-error' : 'text-outline')">
                {{ po.status === 'REJECTED' ? $t('purchaseOrders.statusRejected') : $t('purchaseOrders.timelineApproved') }}
              </span>
              <span class="text-[10px] text-outline font-mono">
                {{ po.approvedByName ? 'By ' + po.approvedByName : (po.status === 'PENDING_APPROVAL' ? 'Awaiting Checker' : '--') }}
              </span>
            </div>
          </div>

          <!-- Step 4: Goods Received -->
          <div class="flex items-center gap-3">
            <div 
              class="w-8 h-8 rounded-full font-bold flex items-center justify-center shrink-0"
              :class="po.status === 'RECEIVED' 
                ? 'bg-emerald-500/15 text-emerald-600' 
                : (po.status === 'PARTIALLY_RECEIVED' ? 'bg-purple-500/15 text-purple-600' : 'bg-surface-container text-outline')"
            >
              <Check v-if="po.status === 'RECEIVED'" class="w-4 h-4 stroke-[3]" />
              <Boxes v-else-if="po.status === 'PARTIALLY_RECEIVED'" class="w-4 h-4" />
              <span v-else class="text-xs">4</span>
            </div>
            <div>
              <span class="text-xs font-bold block" :class="po.status === 'RECEIVED' ? 'text-on-surface' : (po.status === 'PARTIALLY_RECEIVED' ? 'text-purple-700' : 'text-outline')">
                {{ po.status === 'PARTIALLY_RECEIVED' ? $t('purchaseOrders.statusPartiallyReceived') : $t('purchaseOrders.timelineReceived') }}
              </span>
              <span class="text-[10px] text-outline font-mono">
                {{ po.status === 'RECEIVED' ? 'Complete' : (po.status === 'PARTIALLY_RECEIVED' ? 'Partial' : 'Awaiting arrival') }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- MAKER-CHECKER DECISION CARD (When Pending Approval) -->
      <div 
        v-if="po.status === 'PENDING_APPROVAL'" 
        class="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
      >
        <div class="flex items-start gap-3.5">
          <div class="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
            <ShieldAlert class="w-5 h-5" />
          </div>
          <div>
            <h4 class="text-sm font-bold text-amber-950">
              {{ $t('purchaseOrders.makerCheckerNotice') }}
            </h4>
            <p class="text-xs text-amber-900 mt-0.5 leading-relaxed max-w-2xl font-medium">
              {{ $t('purchaseOrders.makerCheckerPendingNotice') }}
            </p>
          </div>
        </div>

        <!-- Checker Decision Actions (Admin or Manager) -->
        <div v-if="canUserApprove" class="flex items-center gap-2.5 shrink-0 self-end md:self-center">
          <button 
            type="button"
            @click="openDecisionModal('REJECT')"
            :disabled="isProcessingAction"
            class="px-3.5 py-2 rounded-xl bg-surface-container-lowest hover:bg-error/10 text-error border border-error/30 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
          >
            <X class="w-3.5 h-3.5" />
            <span>{{ $t('purchaseOrders.rejectPoBtn') }}</span>
          </button>

          <button 
            type="button"
            @click="openDecisionModal('APPROVE')"
            :disabled="isProcessingAction"
            class="px-4.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-all active:scale-95 border-0"
          >
            <Check class="w-3.5 h-3.5 stroke-[2.5]" />
            <span>{{ $t('purchaseOrders.approvePoBtn') }}</span>
          </button>
        </div>
      </div>

      <!-- MAKER-CHECKER APPROVED / REJECTED BANNER -->
      <div 
        v-else-if="po.approvedByName || po.status === 'REJECTED'"
        class="p-4 rounded-xl border flex items-center gap-3 text-xs"
        :class="po.status === 'REJECTED' ? 'bg-error/10 border-error/25 text-error' : 'bg-emerald-500/10 border-emerald-500/25 text-emerald-900'"
      >
        <CheckCircle2 v-if="po.status !== 'REJECTED'" class="w-5 h-5 text-emerald-600 shrink-0" />
        <AlertCircle v-else class="w-5 h-5 text-error shrink-0" />
        <div class="leading-relaxed">
          <span v-if="po.status === 'REJECTED'" class="font-bold">
            Order Rejected. {{ po.notes ? 'Reason: ' + po.notes : '' }}
          </span>
          <span v-else class="font-medium">
            Authorized by <strong>{{ po.approvedByName }}</strong>. Goods are cleared to be received into stock.
          </span>
        </div>
      </div>

      <!-- KEY METADATA SUMMARY CARDS (GRID 3) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        
        <!-- Card 1: Supplier Info -->
        <div class="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/60 shadow-xs space-y-2">
          <span class="text-[10px] font-bold font-mono uppercase text-outline block">
            {{ $t('purchaseOrders.supplierInformation') }}
          </span>
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-lg bg-primary-container/20 text-primary flex items-center justify-center shrink-0">
              <Truck class="w-4 h-4" />
            </div>
            <div class="min-w-0">
              <p class="font-bold text-sm text-on-surface truncate">{{ po.supplierName || 'Direct / Walk-in Supplier' }}</p>
              <p class="text-xs text-on-surface-variant mt-0.5">Payment: <strong class="uppercase text-primary">{{ po.paymentType }}</strong></p>
            </div>
          </div>
        </div>

        <!-- Card 2: Branch & Delivery -->
        <div class="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/60 shadow-xs space-y-2">
          <span class="text-[10px] font-bold font-mono uppercase text-outline block">Delivery & Destination</span>
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-lg bg-primary-container/20 text-primary flex items-center justify-center shrink-0">
              <Building2 class="w-4 h-4" />
            </div>
            <div class="min-w-0">
              <p class="font-bold text-sm text-on-surface truncate">{{ po.branchName || 'Main Branch' }}</p>
              <p class="text-xs text-on-surface-variant mt-0.5">
                Expected: <strong class="font-mono text-on-surface">{{ po.expectedDeliveryDate || 'Not specified' }}</strong>
              </p>
            </div>
          </div>
        </div>

        <!-- Card 3: Financial Summary -->
        <div class="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/60 shadow-xs space-y-2">
          <span class="text-[10px] font-bold font-mono uppercase text-outline block">Estimated Total Cost</span>
          <div class="flex items-center justify-between">
            <span class="text-xl sm:text-2xl font-black text-primary font-mono select-all">
              {{ formatCurrency(po.totalEstimatedCost, currency) }}
            </span>
            <span class="text-xs font-mono font-bold text-outline">
              {{ po.items.length }} {{ po.items.length === 1 ? 'line item' : 'line items' }}
            </span>
          </div>
          <div v-if="po.totalActualCost" class="text-xs text-emerald-700 font-semibold font-mono">
            Actual Billed Cost: {{ formatCurrency(po.totalActualCost, currency) }}
          </div>
        </div>

      </div>

      <!-- ITEMS ORDERED & RECEIVING CHECKLIST TABLE -->
      <div class="border border-outline-variant rounded-2xl overflow-hidden shadow-xs bg-surface-container-lowest">
        <div class="p-4 border-b border-outline-variant/60 flex items-center justify-between">
          <h3 class="text-sm font-bold text-on-surface uppercase tracking-tight flex items-center gap-2">
            <Boxes class="w-4 h-4 text-primary" />
            <span>{{ $t('purchaseOrders.itemsOrderedTable') }}</span>
          </h3>
          <span class="text-xs font-mono font-semibold text-outline">
            Total Ordered: {{ totalOrderedUnits }} pcs • Total Received: {{ totalReceivedUnits }} pcs
          </span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-[13px]">
            <thead class="bg-surface-container-low text-on-surface-variant font-mono text-[10px] uppercase border-b border-outline-variant select-none">
              <tr>
                <th class="p-3.5 pl-4 font-bold min-w-[200px]">Product</th>
                <th class="p-3.5 text-center font-bold">Unit Cost</th>
                <th class="p-3.5 text-center font-bold">{{ $t('purchaseOrders.wholesaleCol') }}</th>
                <th class="p-3.5 text-center font-bold">Ordered</th>
                <th class="p-3.5 text-center font-bold">Received</th>
                <th class="p-3.5 text-center font-bold">Remaining</th>
                <th class="p-3.5 text-right font-bold">Line Total</th>
                <th class="p-3.5 text-center font-bold">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 font-sans">
              <tr 
                v-for="item in po.items" 
                :key="item.id || item.productId"
                class="hover:bg-surface-container-low/50 transition-colors"
              >
                <!-- Product -->
                <td class="p-3.5 pl-4">
                  <span class="font-bold text-on-surface block">{{ item.productName }}</span>
                  <div class="flex items-center gap-2 text-xs text-outline font-mono mt-0.5">
                    <span>{{ item.barcode || item.sku || 'No SKU' }}</span>
                  </div>
                  <span v-if="item.notes" class="text-xs text-outline italic block mt-0.5">
                    Note: {{ item.notes }}
                  </span>
                </td>

                <!-- Unit Cost -->
                <td class="p-3.5 text-center font-mono font-semibold text-on-surface">
                  {{ formatCurrencyWithoutSymbol(item.unitCost, currency) }}
                </td>

                <!-- Wholesale Column -->
                <td class="p-3.5 text-center">
                  <span 
                    v-if="item.isWholesale" 
                    class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-primary/10 text-primary border border-primary/20"
                  >
                    <span>Yes</span>
                    <span v-if="(item.conversionFactor || 1) > 1" class="font-mono text-[10px] text-primary/80">
                      (x{{ item.conversionFactor }})
                    </span>
                  </span>
                  <span 
                    v-else 
                    class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-surface-container text-outline"
                  >
                    No
                  </span>
                </td>

                <!-- Ordered Qty -->
                <td class="p-3.5 text-center font-mono font-bold text-on-surface">
                  <div>{{ item.quantityOrdered }} {{ item.isWholesale && (item.conversionFactor || 1) > 1 ? 'packs' : 'pcs' }}</div>
                  <div v-if="item.isWholesale && (item.conversionFactor || 1) > 1" class="text-[10px] font-normal text-outline">
                    ({{ item.quantityOrdered * (item.conversionFactor || 1) }} pcs)
                  </div>
                </td>

                <!-- Received Qty -->
                <td class="p-3.5 text-center font-mono font-bold text-emerald-700">
                  <div>{{ item.quantityReceived || 0 }} {{ item.isWholesale && (item.conversionFactor || 1) > 1 ? 'packs' : 'pcs' }}</div>
                  <div v-if="item.isWholesale && (item.conversionFactor || 1) > 1 && (item.quantityReceived || 0) > 0" class="text-[10px] font-normal text-emerald-600/80">
                    ({{ (item.quantityReceived || 0) * (item.conversionFactor || 1) }} pcs)
                  </div>
                </td>

                <!-- Remaining Qty -->
                <td class="p-3.5 text-center font-mono font-bold" :class="item.remainingQuantity > 0 ? 'text-amber-700' : 'text-outline'">
                  <div>{{ item.remainingQuantity !== undefined ? item.remainingQuantity : (item.quantityOrdered - (item.quantityReceived || 0)) }} {{ item.isWholesale && (item.conversionFactor || 1) > 1 ? 'packs' : 'pcs' }}</div>
                  <div v-if="item.isWholesale && (item.conversionFactor || 1) > 1" class="text-[10px] font-normal text-outline">
                    ({{ (item.remainingQuantity !== undefined ? item.remainingQuantity : (item.quantityOrdered - (item.quantityReceived || 0))) * (item.conversionFactor || 1) }} pcs)
                  </div>
                </td>

                <!-- Line Total -->
                <td class="p-3.5 text-right font-mono font-black text-on-surface select-all">
                  {{ formatCurrencyWithoutSymbol(item.totalCost || (item.quantityOrdered * item.unitCost), currency) }}
                </td>

                <!-- Line Fulfillment Status -->
                <td class="p-3.5 text-center">
                  <span 
                    v-if="(item.quantityReceived || 0) >= item.quantityOrdered"
                    class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 uppercase"
                  >
                    Fulfilled
                  </span>
                  <span 
                    v-else-if="(item.quantityReceived || 0) > 0"
                    class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-700 border border-purple-500/20 uppercase"
                  >
                    Partial
                  </span>
                  <span 
                    v-else
                    class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-surface-container text-outline uppercase"
                  >
                    Pending
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- RECEIVE GOODS MODAL -->
      <Modal 
        :isOpen="showReceiveModal" 
        :onClose="() => showReceiveModal = false"
        :title="$t('purchaseOrders.receiveModalTitle')"
        :subtitle="$t('purchaseOrders.receiveModalSubtitle')"
        maxWidth="max-w-2xl"
      >
        <div class="space-y-4">
          <div class="flex items-center justify-between pb-2 border-b border-outline-variant/60">
            <span class="text-xs font-bold text-outline uppercase">Verify Received Quantities</span>
            <button 
              type="button"
              @click="handleReceiveAllRemaining"
              class="text-xs font-bold text-primary hover:underline cursor-pointer bg-transparent border-0"
            >
              {{ $t('purchaseOrders.receiveAllRemaining') }}
            </button>
          </div>

          <div class="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            <div 
              v-for="item in receiveItemsState" 
              :key="item.productId"
              class="p-3 rounded-xl bg-surface-container-low border border-outline-variant/60 flex items-center justify-between gap-3 text-xs"
            >
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2">
                  <span class="font-bold text-on-surface block truncate">{{ item.productName }}</span>
                  <span 
                    v-if="item.isWholesale" 
                    class="px-1.5 py-0.5 rounded text-[10px] bg-primary/10 text-primary font-bold inline-flex items-center gap-0.5 shrink-0"
                  >
                    Wholesale
                    <span v-if="(item.conversionFactor || 1) > 1" class="font-mono text-[9px]">(x{{ item.conversionFactor }})</span>
                  </span>
                </div>
                <span class="text-[11px] text-outline font-mono">
                  Ordered: {{ item.ordered }} {{ item.isWholesale && (item.conversionFactor || 1) > 1 ? 'packs' : 'pcs' }} • Received: {{ item.alreadyReceived }} • Remaining: {{ item.remaining }}
                </span>
                <span 
                  v-if="item.isWholesale && (item.conversionFactor || 1) > 1 && item.receiveNow > 0" 
                  class="block text-[11px] text-emerald-600 font-semibold mt-0.5"
                >
                  &rarr; Adds {{ item.receiveNow * (item.conversionFactor || 1) }} pcs to stock inventory
                </span>
              </div>

              <!-- Input for Receiving Quantity -->
              <div class="flex items-center gap-2 shrink-0">
                <span class="text-[11px] font-bold text-on-surface-variant">Receive Now:</span>
                <input 
                  type="number"
                  v-model.number="item.receiveNow"
                  min="0"
                  :max="item.remaining"
                  class="w-20 text-center font-mono font-bold text-xs bg-surface-container-lowest border border-outline-variant rounded-lg py-1.5 px-2 outline-none focus:border-primary text-on-surface"
                />
                <span class="text-xs font-mono text-outline">{{ item.isWholesale && (item.conversionFactor || 1) > 1 ? 'packs' : 'pcs' }}</span>
              </div>
            </div>
          </div>
        </div>

        <template #footer>
          <button 
            type="button"
            @click="showReceiveModal = false"
            class="px-4 py-2 rounded-lg border border-outline text-xs font-bold text-on-surface-variant hover:bg-surface-container-high cursor-pointer bg-transparent"
          >
            {{ $t('common.cancel') }}
          </button>

          <button 
            type="button"
            @click="handleConfirmReceive"
            :disabled="isProcessingAction || !hasValidReceiveQuantities"
            class="px-4.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-40 border-0"
          >
            <RotateCw v-if="isProcessingAction" class="w-3.5 h-3.5 animate-spin" />
            <PackageCheck v-else class="w-3.5 h-3.5" />
            <span>{{ isProcessingAction ? 'Receiving...' : $t('purchaseOrders.confirmReceiveBtn') }}</span>
          </button>
        </template>
      </Modal>

      <!-- CHECKER DECISION MODAL (Approve / Reject) -->
      <Modal 
        :isOpen="showDecisionModal" 
        :onClose="() => showDecisionModal = false"
        :title="decisionType === 'APPROVE' ? $t('purchaseOrders.approvePoBtn') : $t('purchaseOrders.rejectPoBtn')"
        maxWidth="max-w-md"
      >
        <div class="space-y-4 text-xs font-sans">
          <p class="text-on-surface-variant font-medium leading-relaxed">
            <span v-if="decisionType === 'APPROVE'">
              Are you sure you want to approve Purchase Order <strong>{{ po.poNumber }}</strong> for <strong>{{ formatCurrency(po.totalEstimatedCost, currency) }}</strong>?
            </span>
            <span v-else>
              Please provide a specific reason for rejecting Purchase Order <strong>{{ po.poNumber }}</strong>. The maker will be notified.
            </span>
          </p>

          <!-- Notes (If approve) -->
          <div v-if="decisionType === 'APPROVE'" class="space-y-1">
            <label class="text-[11px] font-mono font-bold uppercase text-outline block">
              {{ $t('purchaseOrders.approvalNotes') }}
            </label>
            <textarea 
              v-model="decisionText"
              rows="3"
              :placeholder="$t('purchaseOrders.approvalNotesPlaceholder')"
              class="w-full bg-surface-container-low p-2.5 rounded-xl border border-outline-variant text-xs outline-none focus:border-primary resize-none font-medium"
            />
          </div>

          <!-- Reason (If reject - mandatory) -->
          <div v-else class="space-y-1">
            <label class="text-[11px] font-mono font-bold uppercase text-outline block">
              {{ $t('purchaseOrders.rejectionReason') }}
            </label>
            <textarea 
              v-model="decisionText"
              rows="3"
              required
              :placeholder="$t('purchaseOrders.rejectionReasonPlaceholder')"
              class="w-full bg-surface-container-low p-2.5 rounded-xl border border-outline-variant text-xs outline-none focus:border-primary resize-none font-medium"
            />
          </div>
        </div>

        <template #footer>
          <button 
            type="button"
            @click="showDecisionModal = false"
            class="px-4 py-2 rounded-lg border border-outline text-xs font-bold text-on-surface-variant hover:bg-surface-container-high cursor-pointer bg-transparent"
          >
            {{ $t('common.cancel') }}
          </button>

          <button 
            type="button"
            @click="handleConfirmDecision"
            :disabled="isProcessingAction || (decisionType === 'REJECT' && !decisionText.trim())"
            class="px-4 py-2 rounded-lg font-bold text-xs text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-40 border-0"
            :class="decisionType === 'APPROVE' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-error hover:bg-error/90'"
          >
            <RotateCw v-if="isProcessingAction" class="w-3.5 h-3.5 animate-spin" />
            <span>{{ decisionType === 'APPROVE' ? 'Confirm Approval' : 'Confirm Rejection' }}</span>
          </button>
        </template>
      </Modal>

      <!-- CANCEL PURCHASE ORDER MODAL -->
      <Modal 
        :isOpen="showCancelModal" 
        :onClose="() => { showCancelModal = false; cancelReason = ''; }"
        :title="$t('purchaseOrders.cancelPoBtn') || 'Cancel Purchase Order'"
        maxWidth="max-w-md"
      >
        <div class="space-y-4 text-xs font-sans">
          <!-- Warning banner -->
          <div class="p-3.5 rounded-xl bg-error/10 border border-error/25 flex items-start gap-3">
            <div class="w-8 h-8 rounded-lg bg-error/15 flex items-center justify-center shrink-0 text-error mt-0.5">
              <AlertTriangle class="w-4 h-4" />
            </div>
            <div class="space-y-1">
              <span class="font-bold text-on-surface block text-xs">
                Cancel Purchase Order {{ po.poNumber }}?
              </span>
              <p class="text-on-surface-variant text-[11px] leading-relaxed">
                This will cancel the order and mark it as void.
                <span v-if="po.paymentType === 'CASH'">
                  Any reserved register funds will automatically be released back to the cashier shift drawer.
                </span>
              </p>
            </div>
          </div>

          <!-- Quick order summary pill -->
          <div class="p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/60 flex items-center justify-between text-[11px]">
            <span class="text-outline font-medium">Order Total:</span>
            <span class="font-mono font-bold text-on-surface">{{ formatCurrency(po.totalEstimatedCost, currency) }}</span>
          </div>

          <!-- Reason input -->
          <div class="space-y-1.5">
            <label class="text-[11px] font-mono font-bold uppercase text-outline block">
              Reason for Cancellation <span class="text-error">*</span>
            </label>
            <textarea 
              v-model="cancelReason"
              rows="3"
              required
              placeholder="e.g. Supplier out of stock, vendor cannot fulfill, duplicate order..."
              class="w-full bg-surface-container-low p-2.5 rounded-xl border border-outline-variant text-xs outline-none focus:border-error focus:ring-1 focus:ring-error resize-none font-medium text-on-surface transition-all placeholder:text-outline/60"
            />
          </div>
        </div>

        <template #footer>
          <button 
            type="button"
            @click="showCancelModal = false"
            class="px-4 py-2 rounded-lg border border-outline text-xs font-bold text-on-surface-variant hover:bg-surface-container-high cursor-pointer bg-transparent transition-colors"
          >
            Keep Order
          </button>

          <button 
            type="button"
            @click="handleConfirmCancel"
            :disabled="isProcessingAction || !cancelReason.trim()"
            class="px-4.5 py-2 rounded-lg bg-error hover:bg-error/90 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-40 border-0 transition-colors"
          >
            <RotateCw v-if="isProcessingAction" class="w-3.5 h-3.5 animate-spin" />
            <XCircle v-else class="w-3.5 h-3.5" />
            <span>{{ isProcessingAction ? 'Cancelling...' : 'Confirm Cancellation' }}</span>
          </button>
        </template>
      </Modal>

      <!-- DELETE DRAFT MODAL -->
      <Modal 
        :isOpen="showDeleteModal" 
        :onClose="() => showDeleteModal = false"
        title="Delete Draft Purchase Order"
        maxWidth="max-w-md"
      >
        <div class="space-y-4 text-xs font-sans">
          <div class="p-3.5 rounded-xl bg-error/10 border border-error/25 flex items-start gap-3">
            <div class="w-8 h-8 rounded-lg bg-error/15 flex items-center justify-center shrink-0 text-error mt-0.5">
              <Trash2 class="w-4 h-4" />
            </div>
            <div class="space-y-1">
              <span class="font-bold text-on-surface block text-xs">
                Permanently delete draft {{ po.poNumber }}?
              </span>
              <p class="text-on-surface-variant text-[11px] leading-relaxed">
                This action is permanent and cannot be undone. Any reserved cash will be returned immediately to the active shift register.
              </p>
            </div>
          </div>
        </div>

        <template #footer>
          <button 
            type="button"
            @click="showDeleteModal = false"
            class="px-4 py-2 rounded-lg border border-outline text-xs font-bold text-on-surface-variant hover:bg-surface-container-high cursor-pointer bg-transparent transition-colors"
          >
            {{ $t('common.cancel') }}
          </button>

          <button 
            type="button"
            @click="handleConfirmDelete"
            :disabled="isProcessingAction"
            class="px-4.5 py-2 rounded-lg bg-error hover:bg-error/90 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-40 border-0 transition-colors"
          >
            <RotateCw v-if="isProcessingAction" class="w-3.5 h-3.5 animate-spin" />
            <Trash2 v-else class="w-3.5 h-3.5" />
            <span>{{ isProcessingAction ? 'Deleting...' : 'Delete Draft' }}</span>
          </button>
        </template>
      </Modal>

    </div>
    
    <!-- EMBEDDED PROFESSIONAL PRINT VOUCHER DOCUMENT (RENDERED EXCLUSIVELY ON PRINT / CTRL+P) -->
    <div v-if="po" class="hidden print:block w-full text-black bg-white font-sans text-xs">
      <!-- 1. CORPORATE HEADER -->
      <div class="flex justify-between items-start border-b-[3px] border-[#f4511e] pb-3 mb-4">
        <div class="max-w-[58%]">
          <div class="text-[9px] font-bold tracking-wider uppercase text-[#f4511e] flex items-center gap-1.5 mb-1">
            <span class="w-1.5 h-1.5 rounded-full bg-[#f4511e] inline-block"></span>
            <span>Official Procurement Voucher</span>
          </div>
          <h1 class="text-xl font-black text-[#f4511e] tracking-tight leading-tight">
            {{ displayStoreName }}
          </h1>
          <p class="text-[10.5px] text-black leading-snug mt-1">
            <strong>TIN:</strong> {{ storeSettings?.tin || '100-200-300' }} &nbsp;•&nbsp; <strong>Branch:</strong> {{ displayBranchName }}<br>
            {{ storeSettings?.physicalAddress || 'Dar es Salaam, Tanzania' }}<br>
            Phone: {{ storeSettings?.phone || '+255 700 000 000' }} &nbsp;•&nbsp; Email: {{ storeSettings?.email || 'procurement@jengapos.com' }}
          </p>
        </div>

        <div class="text-right">
          <span class="inline-block px-2 py-0.5 bg-[#f4511e] text-white text-[9px] font-black uppercase tracking-wider rounded mb-1">
            PURCHASE ORDER
          </span>
          <h2 class="text-lg font-black text-[#f4511e] tracking-tight">PO VOUCHER</h2>
          <div class="font-mono text-xs font-black text-black mt-0.5">
            {{ po.poNumber || ('#' + po.id.slice(0, 8)) }}
          </div>
          <div class="mt-1">
            <span 
              class="px-2 py-0.5 rounded text-[9.5px] font-black uppercase inline-block border"
              :class="getStatusBadgeClass(po.status)"
            >
              {{ formatStatusLabel(po.status) }}
            </span>
          </div>
        </div>
      </div>

      <!-- 2. 2-COLUMN PARTIES GRID -->
      <div class="grid grid-cols-2 gap-3 mb-3">
        <!-- VENDOR / SUPPLIER -->
        <div class="border border-slate-300 rounded-md p-2.5 bg-slate-50">
          <div class="text-[8.5px] font-black uppercase tracking-wider text-[#f4511e] border-b border-[#f4511e] pb-1 mb-1.5">
            Vendor / Supplier Information
          </div>
          <div class="text-[13px] font-black text-black">
            {{ currentSupplier?.name || po.supplierName || 'General Vendor' }}
          </div>
          <div class="text-[10.5px] text-black mt-0.5">
            Category: <strong>{{ currentSupplier?.category || 'General Merchandise' }}</strong>
          </div>
          <div class="text-[10.5px] text-black">
            Phone: <strong>{{ currentSupplier?.phone || 'N/A' }}</strong>
          </div>
          <div class="text-[10.5px] text-black">
            Email: {{ currentSupplier?.email || 'N/A' }}
          </div>
          <div class="text-[10.5px] text-black">
            Address: {{ (currentSupplier as any)?.address || (currentSupplier as any)?.physicalAddress || 'N/A' }}
          </div>
        </div>

        <!-- RECEIVING LOCATION -->
        <div class="border border-slate-300 rounded-md p-2.5 bg-slate-50">
          <div class="text-[8.5px] font-black uppercase tracking-wider text-[#f4511e] border-b border-[#f4511e] pb-1 mb-1.5">
            Receiving Branch & Destination
          </div>
          <div class="text-[13px] font-black text-black">
            {{ displayBranchName }}
          </div>
          <div class="text-[10.5px] text-black mt-0.5">
            Store: <strong>{{ displayStoreName }}</strong>
          </div>
          <div class="text-[10.5px] text-black">
            Delivery Location: {{ storeSettings?.physicalAddress || 'Dar es Salaam, Tanzania' }}
          </div>
          <div class="text-[10.5px] text-black">
            Expected Date: <strong>{{ po.expectedDeliveryDate || 'Not Specified' }}</strong>
          </div>
          <div class="text-[10.5px] text-black">
            Payment Method: <strong>{{ po.paymentType || 'CREDIT' }}</strong>
          </div>
        </div>
      </div>

      <!-- 3. ORDER META BAR -->
      <div class="grid grid-cols-4 gap-2 bg-[#fff8f5] border border-[#f4511e] rounded-md p-2 mb-3 font-sans">
        <div>
          <div class="text-[8.5px] font-bold uppercase tracking-wider text-[#f4511e]">Order Date</div>
          <div class="font-mono text-[10.5px] font-black text-black">{{ formatDateTime(po.createdAt) }}</div>
        </div>
        <div>
          <div class="text-[8.5px] font-bold uppercase tracking-wider text-[#f4511e]">Expected Delivery</div>
          <div class="font-mono text-[10.5px] font-black text-black">{{ po.expectedDeliveryDate || 'N/A' }}</div>
        </div>
        <div>
          <div class="text-[8.5px] font-bold uppercase tracking-wider text-[#f4511e]">Payment Terms</div>
          <div class="font-mono text-[10.5px] font-black text-black">{{ po.paymentType || 'CREDIT' }}</div>
        </div>
        <div>
          <div class="text-[8.5px] font-bold uppercase tracking-wider text-[#f4511e]">Total Ordered</div>
          <div class="font-mono text-[10.5px] font-black text-black">{{ totalOrderedUnits }} pcs</div>
        </div>
      </div>

      <!-- 4. ITEMS TABLE -->
      <div class="border border-[#f4511e] rounded-md overflow-hidden mb-3">
        <table class="w-full text-left border-collapse text-[11px]">
          <thead class="bg-[#f4511e] text-white text-[9px] uppercase font-bold tracking-wider">
            <tr>
              <th class="p-2 text-center w-8 text-white">#</th>
              <th class="p-2 text-white">Item Description / Code</th>
              <th class="p-2 text-center w-24 text-white">Qty Ordered</th>
              <th class="p-2 text-right w-28 text-white">Unit Cost ({{ currency }})</th>
              <th class="p-2 text-right w-32 text-white">Line Total ({{ currency }})</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200">
            <tr v-for="(item, idx) in po.items" :key="item.id || item.productId" class="even:bg-slate-50">
              <td class="p-2 text-center font-mono text-black font-bold">{{ idx + 1 }}</td>
              <td class="p-2">
                <span class="font-black text-black block">{{ item.productName }}</span>
                <span class="text-[9.5px] font-mono text-black">
                  {{ item.barcode || item.sku || 'No SKU' }}
                  <span v-if="item.isWholesale"> • Wholesale</span>
                  <span v-if="item.notes"> • Note: {{ item.notes }}</span>
                </span>
              </td>
              <td class="p-2 text-center font-mono font-black text-black">{{ item.quantityOrdered }} pcs</td>
              <td class="p-2 text-right font-mono text-black">{{ formatCurrencyWithoutSymbol(item.unitCost, currency) }}</td>
              <td class="p-2 text-right font-mono font-black text-black">
                {{ formatCurrencyWithoutSymbol(item.totalCost || (item.quantityOrdered * item.unitCost), currency) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 5. SUMMARY & NOTES -->
      <div class="flex justify-between items-start gap-3 mb-4">
        <div class="w-[56%] border border-slate-300 border-l-[3.5px] border-l-[#f4511e] rounded-md p-2.5 bg-slate-50">
          <div class="text-[8.5px] font-black uppercase tracking-wider text-[#f4511e] mb-1">
            Instructions & Terms
          </div>
          <p class="text-[10px] text-black leading-snug">
            {{ po.notes || 'Please reference this Purchase Order number on all delivery notes and commercial invoices. Goods supplied must strictly match agreed specifications.' }}
          </p>
        </div>

        <div class="w-[40%] border border-slate-300 rounded-md bg-slate-50 overflow-hidden text-[10.5px]">
          <div class="flex justify-between p-2 border-b border-slate-200 text-black">
            <span>Items Ordered:</span>
            <span class="font-mono font-black text-black">{{ po.items.length }} line items</span>
          </div>
          <div class="flex justify-between p-2 border-b border-slate-200 text-black">
            <span>Total Quantities:</span>
            <span class="font-mono font-black text-black">{{ totalOrderedUnits }} units</span>
          </div>
          <div class="flex justify-between p-2.5 bg-[#fff3e0] border-t-2 border-[#f4511e] font-bold text-black text-xs">
            <span>Estimated Total:</span>
            <span class="font-mono font-black text-[#f4511e] text-sm">
              {{ formatCurrency(po.totalEstimatedCost, currency) }}
            </span>
          </div>
        </div>
      </div>

      <!-- 6. SIGNATURE BLOCKS -->
      <div class="grid grid-cols-3 gap-3 mb-4">
        <div class="border border-slate-300 rounded-md p-2.5 bg-white min-h-[85px] flex flex-col justify-between">
          <span class="text-[8.5px] font-black uppercase tracking-wider text-[#f4511e] border-b border-slate-100 pb-1">Prepared By (Maker)</span>
          <div class="border-b border-dashed border-slate-400 my-2"></div>
          <div class="flex justify-between text-[9.5px] font-bold text-black">
            <span>{{ po.createdByName || 'Procurement Officer' }}</span>
            <span class="text-[8.5px] font-normal text-black">{{ formatDateTime(po.createdAt) }}</span>
          </div>
        </div>

        <div class="border border-slate-300 rounded-md p-2.5 bg-white min-h-[85px] flex flex-col justify-between">
          <span class="text-[8.5px] font-black uppercase tracking-wider text-[#f4511e] border-b border-slate-100 pb-1">Authorized By (Checker)</span>
          <div class="border-b border-dashed border-slate-400 my-2"></div>
          <div class="flex justify-between text-[9.5px] font-bold text-black">
            <span>{{ po.approvedByName || (po.status === 'APPROVED' || po.status === 'RECEIVED' ? 'Authorized Manager' : 'Pending Authorization') }}</span>
            <span class="text-[8.5px] font-normal text-black">{{ po.status === 'APPROVED' || po.status === 'RECEIVED' ? 'Approved' : 'Sign & Stamp' }}</span>
          </div>
        </div>

        <div class="border border-slate-300 rounded-md p-2.5 bg-white min-h-[85px] flex flex-col justify-between">
          <span class="text-[8.5px] font-black uppercase tracking-wider text-[#f4511e] border-b border-slate-100 pb-1">Received At Store</span>
          <div class="border-b border-dashed border-slate-400 my-2"></div>
          <div class="flex justify-between text-[9.5px] font-bold text-black">
            <span>Store Receiver</span>
            <span class="text-[8.5px] font-normal text-black">Date: ____________</span>
          </div>
        </div>
      </div>

      <!-- 7. FOOTER -->
      <div class="border-t-[1.5px] border-[#f4511e] pt-2 flex justify-between items-center text-[8.5px] text-black">
        <div>
          PO Reference ID: #{{ po.id }} &nbsp;•&nbsp; Official Commercial Procurement Authorization
        </div>
        <div class="font-bold text-black">
          Powered by <span class="text-[#f4511e] font-black">Jenga</span> Enterprise POS
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAppViewModel } from '../viewmodels/useAppViewModel';
import { purchaseOrderService } from '../services/purchaseOrderService';
import { makerCheckerService } from '../services/makerCheckerService';
import { showToast } from '../services/toastService';
import { formatCurrency, formatCurrencyWithoutSymbol } from '../models/mockData';
import { printPurchaseOrderVoucher } from '../utils/purchaseOrderVoucherGenerator';
import Modal from '../components/common/Modal.vue';
import JengaLoader from '../components/common/JengaLoader.vue';
import type { PurchaseOrder, PurchaseOrderStatus } from '../models/types';
import {
  ArrowLeft,
  RotateCw,
  Printer,
  Send,
  PackageCheck,
  XCircle,
  Trash2,
  Check,
  X,
  Clock,
  Boxes,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Truck,
  Building2
} from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();
const vm = useAppViewModel();

const poId = computed(() => route.params.id as string);
const po = ref<PurchaseOrder | null>(null);
const isLoading = ref<boolean>(true);
const isRefreshing = ref<boolean>(false);
const isProcessingAction = ref<boolean>(false);

const currency = computed(() => vm.settings.value?.currency || 'TZS');
const userRole = computed(() => vm.userRole.value || 'CASHIER');
const currentUserId = computed(() => vm.userId.value || '');

// Permissions
const isOwnerOrAdmin = computed(() => userRole.value === 'ADMIN' || userRole.value === 'SUPER_ADMIN');
const canViewPo = computed(() => isOwnerOrAdmin.value || vm.hasPermission('purchase_order:view') || vm.hasPermission('purchase_order:create'));
const canEditPo = computed(() => isOwnerOrAdmin.value || vm.hasPermission('purchase_order:edit') || vm.hasPermission('purchase_order:create'));
const canSubmitPo = computed(() => isOwnerOrAdmin.value || vm.hasPermission('purchase_order:submit') || vm.hasPermission('purchase_order:create'));
const canReceivePo = computed(() => isOwnerOrAdmin.value || vm.hasPermission('purchase_order:receive'));

const storeSettings = computed(() => vm.settings.value);
const currentSupplier = computed(() => {
  if (!po.value?.supplierId) return null;
  return vm.suppliers.value.find(s => s.id === po.value?.supplierId) || null;
});

const displayStoreName = computed(() => {
  if (po.value?.storeName) return po.value.storeName;
  const sName = vm.settings.value?.name;
  if (sName && sName !== 'Loading Branch...') return sName;
  return localStorage.getItem('storeName') || 'Jenga Store';
});

const displayBranchName = computed(() => {
  if (po.value?.branchName) return po.value.branchName;
  const lBranch = localStorage.getItem('branchName');
  if (lBranch) return lBranch;
  const sName = vm.settings.value?.name;
  if (sName && sName !== 'Loading Branch...') return sName;
  return 'Main Store Branch';
});

// Modals
const showReceiveModal = ref<boolean>(false);
const showDecisionModal = ref<boolean>(false);
const decisionType = ref<'APPROVE' | 'REJECT'>('APPROVE');
const decisionText = ref<string>('');
const showCancelModal = ref<boolean>(false);
const cancelReason = ref<string>('');
const showDeleteModal = ref<boolean>(false);

// Receive items state
interface ReceiveItemRow {
  productId: string;
  productName: string;
  ordered: number;
  alreadyReceived: number;
  remaining: number;
  isWholesale?: boolean;
  conversionFactor?: number;
  receiveNow: number;
}
const receiveItemsState = ref<ReceiveItemRow[]>([]);

const isApprovedOrBeyond = computed(() => {
  if (!po.value) return false;
  return ['APPROVED', 'PARTIALLY_RECEIVED', 'RECEIVED'].includes(po.value.status);
});

const canUserApprove = computed(() => {
  if (!po.value || po.value.status !== 'PENDING_APPROVAL') return false;
  return isOwnerOrAdmin.value || vm.hasPermission('maker_checker:approve');
});

const totalOrderedUnits = computed(() => {
  if (!po.value) return 0;
  return po.value.items.reduce((sum, item) => sum + (Number(item.quantityOrdered) || 0), 0);
});

const totalReceivedUnits = computed(() => {
  if (!po.value) return 0;
  return po.value.items.reduce((sum, item) => sum + (Number(item.quantityReceived) || 0), 0);
});

const hasValidReceiveQuantities = computed(() => {
  return receiveItemsState.value.some(item => item.receiveNow > 0);
});

const getStatusBadgeClass = (status: PurchaseOrderStatus) => {
  switch (status) {
    case 'DRAFT': return 'bg-surface-container text-outline border border-outline-variant';
    case 'PENDING_APPROVAL': return 'bg-amber-500/15 text-amber-700 border border-amber-500/30';
    case 'APPROVED': return 'bg-blue-500/15 text-blue-700 border border-blue-500/30';
    case 'PARTIALLY_RECEIVED': return 'bg-purple-500/15 text-purple-700 border border-purple-500/30';
    case 'RECEIVED': return 'bg-emerald-500/15 text-emerald-700 border border-emerald-500/30';
    case 'REJECTED':
    case 'CANCELLED': return 'bg-error/15 text-error border border-error/30';
    default: return 'bg-surface-container text-on-surface-variant';
  }
};

const formatStatusLabel = (status: PurchaseOrderStatus) => {
  switch (status) {
    case 'DRAFT': return 'Draft';
    case 'PENDING_APPROVAL': return 'Pending Approval';
    case 'APPROVED': return 'Approved';
    case 'PARTIALLY_RECEIVED': return 'Partially Received';
    case 'RECEIVED': return 'Received';
    case 'REJECTED': return 'Rejected';
    case 'CANCELLED': return 'Cancelled';
    default: return status;
  }
};

const formatDateTime = (dateStr?: string | null) => {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? dateStr : `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
};

const fetchPoDetails = async () => {
  if (!poId.value) return;
  isRefreshing.value = true;
  try {
    const data = await purchaseOrderService.getPurchaseOrderById(poId.value);
    po.value = data;

    // Initialize receive items state
    receiveItemsState.value = data.items.map(item => {
      const ordered = Number(item.quantityOrdered) || 0;
      const already = Number(item.quantityReceived) || 0;
      const remaining = Math.max(0, ordered - already);
      return {
        productId: item.productId,
        productName: item.productName,
        ordered,
        alreadyReceived: already,
        remaining,
        isWholesale: !!item.isWholesale,
        conversionFactor: Number(item.conversionFactor) || 1,
        receiveNow: remaining // default to receiving all remaining
      };
    });
  } catch (err: any) {
    showToast(err.message || 'Failed to load purchase order', 'error');
  } finally {
    isLoading.value = false;
    isRefreshing.value = false;
  }
};

const handleSubmitForApproval = async () => {
  if (!po.value) return;
  if (po.value.paymentType === 'CREDIT' && !po.value.supplierId) {
    showToast('Cannot submit for approval: A supplier is required for credit purchase orders.', 'error');
    return;
  }
  isProcessingAction.value = true;
  try {
    const updated = await purchaseOrderService.submitForApproval(po.value.id);
    po.value = updated;
    showToast('Purchase Order submitted for approval!', 'success');
  } catch (err: any) {
    showToast(err.message || 'Failed to submit purchase order', 'error');
  } finally {
    isProcessingAction.value = false;
  }
};

const handleReceiveAllRemaining = () => {
  receiveItemsState.value.forEach(item => {
    item.receiveNow = item.remaining;
  });
};

const handleConfirmReceive = async () => {
  if (!po.value) return;
  isProcessingAction.value = true;
  try {
    const itemsToReceive = receiveItemsState.value
      .filter(i => i.receiveNow > 0)
      .map(i => ({
        productId: i.productId,
        receivedQuantity: i.receiveNow
      }));

    if (itemsToReceive.length === 0) {
      showToast('Please specify quantities to receive.', 'error');
      return;
    }

    const updated = await purchaseOrderService.receiveGoods(po.value.id, {
      items: itemsToReceive
    });

    po.value = updated;
    showReceiveModal.value = false;
    showToast('Goods received successfully! Inventory stock has been updated.', 'success');
    
    // Refresh products in app viewModel so catalog shows new stock
    vm.fetchProducts();
    fetchPoDetails();
  } catch (err: any) {
    showToast(err.message || 'Failed to record received goods', 'error');
  } finally {
    isProcessingAction.value = false;
  }
};

const handleCancelPo = () => {
  if (!po.value) return;
  cancelReason.value = '';
  showCancelModal.value = true;
};

const handleConfirmCancel = async () => {
  if (!po.value || !cancelReason.value.trim()) return;

  isProcessingAction.value = true;
  try {
    const updated = await purchaseOrderService.cancelPurchaseOrder(po.value.id, cancelReason.value.trim());
    po.value = updated;
    showCancelModal.value = false;
    showToast('Purchase order cancelled successfully.', 'info');
  } catch (err: any) {
    showToast(err.message || 'Failed to cancel purchase order', 'error');
  } finally {
    isProcessingAction.value = false;
  }
};

const handleDeleteDraft = () => {
  if (!po.value) return;
  showDeleteModal.value = true;
};

const handleConfirmDelete = async () => {
  if (!po.value) return;

  isProcessingAction.value = true;
  try {
    await purchaseOrderService.deleteDraft(po.value.id);
    showDeleteModal.value = false;
    showToast('Draft purchase order deleted successfully.', 'success');
    router.push('/purchases');
  } catch (err: any) {
    showToast(err.message || 'Failed to delete draft', 'error');
  } finally {
    isProcessingAction.value = false;
  }
};

const openDecisionModal = (type: 'APPROVE' | 'REJECT') => {
  decisionType.value = type;
  decisionText.value = '';
  showDecisionModal.value = true;
};

const handleConfirmDecision = async () => {
  if (!po.value) return;
  isProcessingAction.value = true;
  try {
    // Find the maker-checker pending request for this PO
    const pendingRequests = await makerCheckerService.getPendingRequests();
    const targetReq = pendingRequests.find(r => r.entityId === po.value?.id || r.requestNumber === po.value?.poNumber);

    if (decisionType.value === 'APPROVE') {
      if (targetReq) {
        await makerCheckerService.approveRequest(targetReq.id, decisionText.value || undefined);
      } else {
        // Fallback: direct submit/approval
        await purchaseOrderService.submitForApproval(po.value.id);
      }
      showToast('Purchase Order approved successfully!', 'success');
    } else {
      if (!targetReq) {
        throw new Error('Maker-Checker request record not found for rejection');
      }
      await makerCheckerService.rejectRequest(targetReq.id, decisionText.value);
      showToast('Purchase Order rejected.', 'info');
    }

    showDecisionModal.value = false;
    fetchPoDetails();
  } catch (err: any) {
    showToast(err.message || 'Failed to process decision', 'error');
  } finally {
    isProcessingAction.value = false;
  }
};

const handlePrint = () => {
  if (!po.value) return;
  printPurchaseOrderVoucher(po.value, currentSupplier.value, storeSettings.value);
};

onMounted(() => {
  fetchPoDetails();
  if (!vm.settings.value?.name || vm.settings.value.name === 'Loading Branch...') {
    vm.fetchSettings();
  }
  if (vm.suppliers.value.length === 0) {
    vm.fetchSuppliers();
  }
});
</script>
