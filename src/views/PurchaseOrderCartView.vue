<template>
  <div class="w-full max-w-[1720px] mx-auto py-2 font-sans select-none animate-fade-up px-2 sm:px-4 md:px-6">
    
    <!-- HEADER SECTION -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div class="flex items-center gap-3">
        <button 
          type="button"
          @click="router.push('/inventory')"
          class="p-2 rounded-xl bg-surface-container-low hover:bg-surface-container border border-outline-variant text-on-surface-variant transition-colors cursor-pointer"
          :title="$t('poCart.backToCatalog')"
        >
          <ArrowLeft class="w-5 h-5" />
        </button>
        <div>
          <div class="flex items-center gap-3">
            <h1 class="text-2xl sm:text-[28px] font-bold text-on-surface tracking-tight leading-tight">
              {{ $t('poCart.cartTitle') }}
            </h1>
            <span 
              v-if="cartCount > 0"
              class="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-primary/10 text-primary border border-primary/20"
            >
              {{ $t('poCart.itemsCount', { count: cartCount, units: cartTotalUnits }) }}
            </span>
          </div>
          <p class="text-xs sm:text-sm text-on-surface-variant mt-0.5">
            {{ $t('poCart.cartSubtitle') }}
          </p>
        </div>
      </div>

      <!-- Header Actions -->
      <div class="flex items-center gap-2.5 self-end sm:self-auto">
        <button 
          v-if="cartCount > 0"
          type="button"
          @click="handleClearCart"
          class="h-9 px-3 rounded-lg border border-error/30 hover:bg-error/10 text-error font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer bg-transparent"
        >
          <Trash2 class="w-3.5 h-3.5" />
          <span>{{ $t('poCart.clearCart') }}</span>
        </button>

        <button 
          type="button"
          @click="router.push('/inventory')"
          class="h-9 px-3.5 rounded-lg border border-outline hover:bg-surface-container-low text-on-surface-variant font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer bg-surface-container-lowest"
        >
          <Package class="w-3.5 h-3.5" />
          <span>{{ $t('poCart.browseCatalogBtn') }}</span>
        </button>
      </div>
    </div>

    <!-- EMPTY CART STATE -->
    <div 
      v-if="isCartEmpty" 
      class="p-12 text-center bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-xs max-w-xl mx-auto my-12"
    >
      <div class="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto mb-4">
        <ShoppingCart class="w-10 h-10 stroke-[1.8]" />
      </div>
      <h2 class="text-lg font-bold text-on-surface mb-2">
        {{ $t('poCart.emptyCartHeading') }}
      </h2>
      <p class="text-xs text-on-surface-variant leading-relaxed max-w-md mx-auto mb-6">
        {{ $t('poCart.emptyCartDescription') }}
      </p>
      <button 
        type="button"
        @click="router.push('/inventory')"
        class="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs hover:bg-primary/90 transition-all flex items-center gap-2 mx-auto cursor-pointer shadow-sm active:scale-95 border-0"
      >
        <Package class="w-4 h-4" />
        <span>{{ $t('poCart.browseCatalogBtn') }}</span>
      </button>
    </div>

    <!-- ACTIVE CART WORKBENCH (GRID 3:1 on XL+, STACKED ON SMALLER SCREENS) -->
    <div v-else class="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
      
      <!-- TOP / LEFT 2 COLS: LINE ITEMS TABLE -->
      <div class="xl:col-span-2 space-y-4">
        <div class="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-xs overflow-hidden">
          <div class="p-4 border-b border-outline-variant/60 flex items-center justify-between">
            <h3 class="text-sm font-bold text-on-surface uppercase tracking-tight flex items-center gap-2">
              <Boxes class="w-4 h-4 text-primary" />
              <span>Selected Products to Reorder</span>
            </h3>
            <span class="text-xs font-mono text-outline font-semibold">
              {{ cartItems.length }} {{ cartItems.length === 1 ? 'item' : 'items' }}
            </span>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse text-[13px]">
              <thead class="bg-surface-container-low text-on-surface-variant font-mono text-[10px] uppercase border-b border-outline-variant select-none">
                <tr>
                  <th class="p-3.5 pl-4 font-bold min-w-[220px]">Product / Stock</th>
                  <th class="p-3.5 text-center font-bold w-36">Quantity</th>
                  <th class="p-3.5 text-center font-bold w-36">Unit Cost ({{ currency }})</th>
                  <th class="p-3.5 text-right font-bold w-32">Total Cost</th>
                  <th class="p-3.5 text-center font-bold w-12"></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr 
                  v-for="item in cartItems" 
                  :key="item.product.id"
                  class="hover:bg-surface-container-low/50 transition-colors"
                >
                  <!-- Product info & stock on hand -->
                  <td class="p-3.5 pl-4">
                    <div class="flex items-center gap-2 flex-wrap">
                      <span class="font-bold text-on-surface text-sm">{{ item.product.name }}</span>
                      <span 
                        class="px-2 py-0.2 rounded text-[10px] font-mono font-bold"
                        :class="item.product.stock === 0 ? 'bg-error-container text-error' : (item.product.stock <= item.product.minStock ? 'bg-warning-container text-warning' : 'bg-surface-container text-on-surface-variant')"
                      >
                        {{ item.product.stock }} on hand
                      </span>
                    </div>
                    <div class="flex items-center gap-2 text-xs text-outline font-mono mt-0.5">
                      <span>{{ item.product.barcode || item.product.sku || 'No SKU' }}</span>
                      <span>•</span>
                      <span>Category: {{ item.product.category || 'General' }}</span>
                    </div>

                    <!-- Line item optional note -->
                    <div class="mt-2">
                      <input 
                        type="text" 
                        v-model="item.notes"
                        placeholder="Add note for this item (e.g. preferred brand, package size)..."
                        class="w-full bg-surface-container-low px-2.5 py-1 rounded-md text-[11px] border border-outline-variant/60 text-on-surface outline-none focus:border-primary"
                      />
                    </div>
                  </td>

                  <!-- Quantity Stepper -->
                  <td class="p-3.5 text-center">
                    <div class="inline-flex items-center border border-outline-variant rounded-xl bg-surface-container-low overflow-hidden">
                      <button 
                        type="button"
                        @click="decrementQuantity(item.product.id)"
                        :disabled="item.quantity <= 1"
                        class="w-8 h-8 flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors disabled:opacity-40 cursor-pointer bg-transparent border-0"
                      >
                        <Minus class="w-3.5 h-3.5" />
                      </button>
                      <input 
                        type="number"
                        v-model.number="item.quantity"
                        min="1"
                        @change="item.quantity = Math.max(1, item.quantity || 1)"
                        class="w-14 text-center font-mono font-bold text-xs bg-transparent border-0 outline-none text-on-surface"
                      />
                      <button 
                        type="button"
                        @click="incrementQuantity(item.product.id)"
                        class="w-8 h-8 flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors cursor-pointer bg-transparent border-0"
                      >
                        <Plus class="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>

                  <!-- Unit Cost Column (Non-editable / Read-only) -->
                  <td class="p-3.5 text-center font-mono">
                    <div 
                      class="inline-block py-1.5 px-3 rounded-xl bg-surface-container-low border border-outline-variant/60 font-mono font-bold text-xs text-on-surface select-all cursor-default"
                      title="Unit cost is set from catalog cost price and cannot be edited"
                    >
                      {{ formatCurrencyWithoutSymbol(item.unitCost, currency) }}
                    </div>
                    <label class="flex items-center justify-center gap-1 mt-1.5 cursor-pointer">
                      <input 
                        type="checkbox" 
                        v-model="item.isWholesale" 
                        class="w-3 h-3 accent-primary cursor-pointer"
                      />
                      <span class="text-[10px] font-sans font-semibold text-outline">{{ $t('poCart.wholesaleMode') }}</span>
                    </label>
                  </td>

                  <!-- Line Total -->
                  <td class="p-3.5 text-right font-mono font-black text-sm text-primary select-all">
                    {{ formatCurrencyWithoutSymbol(item.quantity * item.unitCost, currency) }}
                  </td>

                  <!-- Remove Action -->
                  <td class="p-3.5 text-center">
                    <button 
                      type="button"
                      @click="removeFromCart(item.product.id)"
                      class="p-1.5 rounded-lg text-outline hover:text-error hover:bg-error/10 transition-colors cursor-pointer border-0 bg-transparent"
                      :title="$t('poCart.removeLineItem')"
                    >
                      <Trash2 class="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- BOTTOM (SMALL SCREENS) / RIGHT 1 COL (XL+): ORDER TERMS & SUBMIT CARDS -->
      <div class="xl:col-span-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-1 gap-6 items-start">
        
        <!-- Order Details Form Card -->
        <div class="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-xs p-5 space-y-4">
          <h3 class="text-sm font-bold text-on-surface uppercase tracking-tight flex items-center gap-2 pb-3 border-b border-outline-variant/60">
            <FileSpreadsheet class="w-4 h-4 text-primary" />
            <span>{{ $t('poCart.supplierDetails') }}</span>
          </h3>

          <!-- Receiving Branch (Readonly/Context) -->
          <div class="space-y-1 text-xs">
            <label class="text-[11px] font-mono font-bold uppercase text-outline block">
              {{ $t('poCart.storeBranch') }}
            </label>
            <div class="p-2.5 bg-surface-container-low rounded-xl border border-outline-variant font-bold text-on-surface flex items-center justify-between">
              <span>{{ currentBranchName }}</span>
              <span class="text-[10px] font-mono font-normal text-outline">Active Branch</span>
            </div>
          </div>

          <!-- Supplier Dropdown -->
          <div class="space-y-1 text-xs">
            <label class="text-[11px] font-mono font-bold uppercase block flex items-center justify-between" :class="paymentType === 'CREDIT' ? 'text-primary' : 'text-outline'">
              <span>
                {{ $t('poCart.selectSupplier') }}
                <span v-if="paymentType === 'CREDIT'" class="text-error font-bold">*</span>
              </span>
              <span v-if="paymentType === 'CREDIT'" class="text-[10px] font-sans font-bold text-error uppercase tracking-wider">
                Required for Credit
              </span>
            </label>
            <select 
              v-model="selectedSupplierId"
              class="w-full p-2.5 rounded-xl border text-xs font-semibold text-on-surface outline-none focus:border-primary cursor-pointer transition-colors"
              :class="isCreditMissingSupplier ? 'bg-error-container/10 border-error ring-1 ring-error/30' : 'bg-surface-container-low border-outline-variant'"
            >
              <option value="" :disabled="paymentType === 'CREDIT'">
                {{ paymentType === 'CREDIT' ? '-- Select a Supplier (Required for Credit) --' : $t('poCart.noSupplier') }}
              </option>
              <option v-for="sup in suppliers" :key="sup.id" :value="sup.id">
                {{ sup.name }} ({{ sup.category || 'Vendor' }})
              </option>
            </select>
            <!-- Warning when credit is chosen without a supplier -->
            <p v-if="isCreditMissingSupplier" class="text-[11px] text-error font-medium flex items-start gap-1.5 mt-1 leading-tight">
              <AlertTriangle class="w-3.5 h-3.5 shrink-0 text-error mt-0.5" />
              <span>{{ $t('poCart.creditSupplierRequiredNotice') }}</span>
            </p>
          </div>

          <!-- Expected Delivery Date -->
          <div class="space-y-1 text-xs">
            <label class="text-[11px] font-mono font-bold uppercase text-outline block">
              {{ $t('poCart.expectedDelivery') }}
            </label>
            <div class="relative flex items-center">
              <Calendar class="w-4 h-4 text-outline absolute left-3 pointer-events-none" />
              <input 
                type="date"
                v-model="expectedDeliveryDate"
                :min="todayDateStr"
                class="w-full bg-surface-container-low pl-9 pr-3 py-2 rounded-xl border border-outline-variant text-xs font-mono font-semibold text-on-surface outline-none focus:border-primary cursor-pointer"
              />
            </div>
          </div>

          <!-- Payment Method -->
          <div class="space-y-1 text-xs">
            <label class="text-[11px] font-mono font-bold uppercase text-outline block">
              {{ $t('poCart.paymentType') }}
            </label>
            <select 
              v-model="paymentType"
              class="w-full bg-surface-container-low p-2.5 rounded-xl border border-outline-variant text-xs font-semibold text-on-surface outline-none focus:border-primary cursor-pointer"
            >
              <option value="CASH" :disabled="isCashDisabled">
                {{ $t('purchases.paymentCash') }}{{ isCashDisabled ? ' (Disabled - No Open Shift)' : '' }}
              </option>
              <option value="TRANSFER">{{ $t('purchases.paymentTransfer') }}</option>
              <option value="CREDIT">{{ $t('purchases.paymentCredit') }}</option>
            </select>
          </div>

          <!-- Cash Disabled Warning Banner (When no open shifts exist for branch) -->
          <div v-if="isCashDisabled" class="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2.5">
            <AlertTriangle class="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span class="leading-relaxed">
              {{ $t('poCart.noOpenShiftsCashDisabled') }}
            </span>
          </div>

          <!-- Cash Funding Shift Selector (If CASH selected) -->
          <div v-else-if="paymentType === 'CASH'" class="flex flex-col gap-2 p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/60">
            <!-- Non-Cashier (Admin / Manager): Must select an open register shift -->
            <div v-if="isNonCashier" class="flex flex-col gap-2">
              <label class="text-[11px] font-mono font-bold uppercase text-on-surface-variant flex items-center justify-between">
                <span class="flex items-center gap-1.5">
                  <User class="w-3.5 h-3.5 text-primary" />
                  <span>{{ $t('poCart.selectFundingShift') }}</span>
                </span>
                <span v-if="isLoadingOpenShifts" class="text-[10px] text-outline font-normal flex items-center gap-1">
                  <RotateCw class="w-3 h-3 animate-spin" /> Checking shifts...
                </span>
              </label>

              <div v-if="isLoadingOpenShifts" class="text-xs text-on-surface-variant flex items-center gap-2 py-1">
                <RotateCw class="w-3.5 h-3.5 animate-spin text-primary" />
                <span>Checking open register shifts...</span>
              </div>

              <select
                v-else-if="openShifts.length > 0"
                v-model="selectedShiftId"
                required
                class="w-full bg-white p-2.5 rounded-xl border border-outline-variant text-xs font-semibold text-on-surface outline-none focus:border-primary cursor-pointer shadow-xs"
              >
                <option value="" disabled>{{ $t('poCart.selectFundingShiftPlaceholder') }}</option>
                <option v-for="shift in openShifts" :key="shift.id" :value="shift.id">
                  {{ shift.cashierName || 'Cashier' }} (Till: {{ shift.terminalId || 'MAIN' }}) — Drawer: {{ currency }} {{ Number(shift.expectedCash || 0).toLocaleString() }}
                </option>
              </select>

              <!-- Selected shift drawer details -->
              <div v-if="selectedShift" class="p-2.5 bg-white rounded-lg border border-outline-variant/40 space-y-1 text-xs">
                <div class="flex items-center justify-between">
                  <span class="text-outline font-medium">Register Cashier:</span>
                  <span class="font-bold text-on-surface">{{ selectedShift.cashierName || 'Cashier' }} ({{ selectedShift.terminalId || 'MAIN' }})</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-outline font-medium">{{ $t('poCart.cashDrawerBalance') }}:</span>
                  <span class="font-bold font-mono" :class="hasInsufficientCash ? 'text-error' : 'text-emerald-700'">
                    {{ formatCurrency(selectedShift.expectedCash || 0, currency) }}
                  </span>
                </div>
              </div>

              <!-- Insufficient cash in drawer warning -->
              <div v-if="hasInsufficientCash" class="p-2.5 rounded-lg bg-error-container/20 border border-error/30 text-error text-xs flex items-start gap-2">
                <AlertTriangle class="w-4 h-4 shrink-0 text-error mt-0.5" />
                <span class="leading-relaxed">
                  {{ $t('poCart.insufficientShiftCash', { 
                    available: formatCurrency(selectedShift?.expectedCash || 0, currency), 
                    required: formatCurrency(cartTotalCost, currency) 
                  }) }}
                </span>
              </div>
            </div>

            <!-- Cashier User Paying Cash -->
            <div v-else class="p-2.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-start gap-2">
              <CheckCircle2 class="w-4 h-4 shrink-0 text-blue-600 mt-0.5" />
              <div class="leading-relaxed">
                <span>{{ $t('poCart.cashierDirectShiftNotice') }}</span>
                <div v-if="vm.currentShift.value" class="mt-1 font-mono text-[11px] font-semibold text-blue-800">
                  Drawer Balance: {{ formatCurrency(vm.currentShift.value.expectedCash || 0, currency) }}
                </div>
              </div>
            </div>
          </div>

          <!-- General Notes -->
          <div class="space-y-1 text-xs">
            <label class="text-[11px] font-mono font-bold uppercase text-outline block">
              Notes & Instructions
            </label>
            <textarea 
              v-model="orderNotes"
              rows="3"
              :placeholder="$t('poCart.notesPlaceholder')"
              class="w-full bg-surface-container-low p-2.5 rounded-xl border border-outline-variant text-xs text-on-surface outline-none focus:border-primary resize-none font-medium"
            />
          </div>
        </div>

        <!-- Total Cost & Checkout Actions Card -->
        <div class="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-xs p-5 space-y-4">
          <div class="space-y-1.5 pb-4 border-b border-outline-variant/60">
            <span class="text-[11px] font-bold uppercase tracking-wider text-outline block">
              {{ $t('poCart.estimatedTotal') }}
            </span>
            <div class="flex items-baseline justify-between">
              <span class="text-2xl font-black text-primary font-mono select-all">
                {{ formatCurrency(cartTotalCost, currency) }}
              </span>
              <span class="text-xs font-mono font-bold text-outline">
                {{ cartCount }} items
              </span>
            </div>
          </div>

          <div class="p-3 bg-surface-container-low rounded-xl border border-outline-variant/60 text-xs text-on-surface-variant flex items-start gap-2.5">
            <ShieldCheck class="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <span class="leading-relaxed text-[11px]">
              Submitting for approval routes through the store's configured Maker-Checker dual authorization policy.
            </span>
          </div>

          <!-- Submission Buttons -->
          <div class="space-y-2 pt-1">
            <!-- Submit for Approval (Primary) -->
            <button 
              type="button"
              @click="handleSubmitOrder(true)"
              :disabled="isSubmitting || isSubmitDisabled"
              class="w-full py-3 px-4 rounded-xl bg-primary text-on-primary font-bold text-sm hover:bg-primary/90 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed border-0"
              :title="submitDisabledReason"
            >
              <RotateCw v-if="isSubmitting" class="w-4 h-4 animate-spin" />
              <Send v-else class="w-4 h-4" />
              <span>{{ isSubmitting ? 'Processing...' : $t('poCart.submitApproval') }}</span>
            </button>

            <!-- Save as Draft (Secondary) -->
            <button 
              type="button"
              @click="handleSubmitOrder(false)"
              :disabled="isSubmitting || isSubmitDisabled"
              class="w-full py-2.5 px-4 rounded-xl border border-outline hover:bg-surface-container-low text-on-surface font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer bg-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              :title="submitDisabledReason"
            >
              <FileDown class="w-3.5 h-3.5" />
              <span>{{ $t('poCart.saveAsDraft') }}</span>
            </button>

            <!-- Disabled warning explanation below buttons -->
            <p v-if="submitDisabledReason" class="text-[11px] text-center text-error font-medium px-1 leading-tight">
              {{ submitDisabledReason }}
            </p>
          </div>
        </div>

      </div>

    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAppViewModel } from '../viewmodels/useAppViewModel';
import { usePurchaseOrderCart } from '../composables/usePurchaseOrderCart';
import { purchaseOrderService } from '../services/purchaseOrderService';
import { api } from '../services/api';
import { showToast } from '../services/toastService';
import { formatCurrency, formatCurrencyWithoutSymbol } from '../models/mockData';
import type { PurchasePaymentType, PurchaseOrderCreateRequest, CashierShift } from '../models/types';
import { 
  ArrowLeft, 
  ShoppingCart, 
  Package, 
  Trash2, 
  Plus, 
  Minus, 
  Calendar, 
  FileSpreadsheet, 
  Send, 
  FileDown, 
  RotateCw, 
  ShieldCheck,
  Boxes,
  User,
  AlertTriangle,
  CheckCircle2
} from 'lucide-vue-next';

const router = useRouter();
const vm = useAppViewModel();
const poCart = usePurchaseOrderCart();

const { 
  cartItems, 
  cartCount, 
  cartTotalUnits, 
  cartTotalCost, 
  isCartEmpty, 
  incrementQuantity, 
  decrementQuantity, 
  removeFromCart, 
  clearCart 
} = poCart;

const currency = computed(() => vm.settings.value?.currency || 'TZS');
const suppliers = computed(() => vm.suppliers.value || []);
const currentBranchName = computed(() => {
  return localStorage.getItem('branchName') || 'Main Store Branch';
});

// Role & Permission Checks
const userRole = computed(() => vm.userRole.value);
const isNonCashier = computed(() => ['ADMIN', 'MANAGER', 'SUPER_ADMIN'].includes(userRole.value || ''));
const isOwnerOrAdmin = computed(() => userRole.value === 'ADMIN' || userRole.value === 'SUPER_ADMIN');
const canCreatePo = computed(() => isOwnerOrAdmin.value || vm.hasPermission('purchase_order:create'));
const canSubmitPo = computed(() => isOwnerOrAdmin.value || vm.hasPermission('purchase_order:submit') || vm.hasPermission('purchase_order:create'));

// Shifts for cash payment funding
const openShifts = ref<CashierShift[]>([]);
const isLoadingOpenShifts = ref<boolean>(false);
const selectedShiftId = ref<string>('');

const selectedShift = computed(() => {
  return openShifts.value.find(s => s.id === selectedShiftId.value) || null;
});

// Cash Gating: If non-cashier has 0 open shifts, CASH is disabled. If cashier has no open shift, CASH is disabled.
const isCashDisabled = computed(() => {
  if (isNonCashier.value) {
    return !isLoadingOpenShifts.value && openShifts.value.length === 0;
  }
  // Cashier role: must have their own active open shift
  return !vm.currentShift.value;
});

// Balance validation
const hasInsufficientCash = computed(() => {
  if (paymentType.value !== 'CASH') return false;
  if (isNonCashier.value) {
    if (!selectedShift.value) return false;
    const available = Number(selectedShift.value.expectedCash ?? 0);
    return available < cartTotalCost.value;
  } else {
    // Cashier
    if (!vm.currentShift.value) return true;
    const available = Number(vm.currentShift.value.expectedCash ?? 0);
    return available < cartTotalCost.value;
  }
});

// Balance & supplier validation
const isCreditMissingSupplier = computed(() => {
  return paymentType.value === 'CREDIT' && !selectedSupplierId.value;
});

// Submit button gating
const isSubmitDisabled = computed(() => {
  if (!canCreatePo.value) return true;
  if (cartItems.value.length === 0) return true;
  if (isCreditMissingSupplier.value) return true;
  if (paymentType.value === 'CASH') {
    if (isCashDisabled.value) return true;
    if (isNonCashier.value && !selectedShiftId.value) return true;
    if (hasInsufficientCash.value) return true;
  }
  return false;
});

const submitDisabledReason = computed(() => {
  if (!canCreatePo.value) {
    return 'Permission denied: You do not have permission to create purchase orders.';
  }
  if (cartItems.value.length === 0) return 'Your cart is empty.';
  if (isCreditMissingSupplier.value) {
    return 'Supplier is required for credit purchase orders. Please select a supplier.';
  }
  if (paymentType.value === 'CASH') {
    if (isCashDisabled.value) {
      return isNonCashier.value 
        ? 'Cash payment is unavailable: No open register shifts found for this branch.'
        : 'Cash payment is unavailable: You do not have an active open register shift.';
    }
    if (isNonCashier.value && !selectedShiftId.value) {
      return 'Please select an open register shift to fund this cash purchase order.';
    }
    if (hasInsufficientCash.value) {
      return `Selected register drawer has insufficient cash to cover this order (${formatCurrency(cartTotalCost.value, currency.value)}).`;
    }
  }
  return '';
});

// Form state
const selectedSupplierId = ref<string>('');
const paymentType = ref<PurchasePaymentType>('CASH');
const orderNotes = ref<string>('');
const isSubmitting = ref<boolean>(false);

const today = new Date();
const todayDateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
const expectedDeliveryDate = ref<string>(todayDateStr);

const fetchOpenShifts = async () => {
  const branchId = localStorage.getItem('branchId') || (vm.activeBranchId.value ?? '');
  if (!branchId) return;

  isLoadingOpenShifts.value = true;
  try {
    const data = await api.get<any[]>(`/api/shifts/branch/${branchId}?status=OPEN`);
    if (Array.isArray(data)) {
      openShifts.value = data.filter((s: any) => s.status === 'OPEN');
    } else {
      openShifts.value = [];
    }
  } catch (err) {
    console.error('Failed to load open shifts with status param, trying fallback:', err);
    try {
      const fallback = await api.get<any[]>(`/api/shifts/branch/${branchId}`);
      if (Array.isArray(fallback)) {
        openShifts.value = fallback.filter((s: any) => s.status === 'OPEN');
      } else {
        openShifts.value = [];
      }
    } catch {
      openShifts.value = [];
    }
  } finally {
    isLoadingOpenShifts.value = false;

    // Automatically manage shift selection & payment type fallback
    if (openShifts.value.length > 0) {
      if (!selectedShiftId.value || !openShifts.value.some(s => s.id === selectedShiftId.value)) {
        selectedShiftId.value = openShifts.value[0]?.id || '';
      }
    } else {
      selectedShiftId.value = '';
      if (paymentType.value === 'CASH' && isNonCashier.value) {
        paymentType.value = 'TRANSFER';
      }
    }
  }
};

watch(() => vm.activeBranchId.value, () => {
  fetchOpenShifts();
});

watch(paymentType, (newVal) => {
  if (newVal === 'CASH' && isCashDisabled.value) {
    showToast('Cash payment is unavailable: No open register shifts found for this branch.', 'info');
    paymentType.value = 'TRANSFER';
  }
});

const handleClearCart = () => {
  if (confirm('Are you sure you want to remove all items from your Purchase Order cart?')) {
    clearCart();
  }
};

const handleSubmitOrder = async (submitForApproval: boolean) => {
  if (!canCreatePo.value) {
    showToast('Permission denied: You do not have permission to create purchase orders.', 'error');
    return;
  }

  if (submitForApproval && !canSubmitPo.value) {
    showToast('Permission denied: You do not have permission to submit purchase orders for approval.', 'error');
    return;
  }

  if (cartItems.value.length === 0) {
    showToast('Your cart is empty. Add products before creating a purchase order.', 'error');
    return;
  }

  const branchId = localStorage.getItem('branchId') || (vm.activeBranchId.value ?? '');
  if (!branchId) {
    showToast('No active branch selected. Please select a branch first.', 'error');
    return;
  }

  // Pre-submission validation for CREDIT payment
  if (paymentType.value === 'CREDIT' && !selectedSupplierId.value) {
    showToast('A supplier must be selected for credit purchase orders.', 'error');
    return;
  }

  // Pre-submission validation for CASH payment
  if (paymentType.value === 'CASH') {
    if (isNonCashier.value) {
      if (openShifts.value.length === 0) {
        showToast('Cash payment is not available: No active open register shift found for this branch.', 'error');
        return;
      }
      if (!selectedShiftId.value) {
        showToast('Please select an active cashier shift to fund this cash purchase order.', 'error');
        return;
      }
      if (hasInsufficientCash.value) {
        const available = formatCurrency(selectedShift.value?.expectedCash ?? 0, currency.value);
        const required = formatCurrency(cartTotalCost.value, currency.value);
        showToast(`The selected cashier shift drawer only has ${available}, but this order requires ${required}.`, 'error');
        return;
      }
    } else {
      if (!vm.currentShift.value) {
        showToast('You do not have an active open register shift to fund this cash purchase order.', 'error');
        return;
      }
      if ((vm.currentShift.value.expectedCash ?? 0) < cartTotalCost.value) {
        const available = formatCurrency(vm.currentShift.value.expectedCash ?? 0, currency.value);
        const required = formatCurrency(cartTotalCost.value, currency.value);
        showToast(`Your register drawer only has ${available}, but this order requires ${required}.`, 'error');
        return;
      }
    }
  }

  isSubmitting.value = true;
  try {
    const payload: PurchaseOrderCreateRequest = {
      storeBranchId: branchId,
      supplierId: selectedSupplierId.value || undefined,
      paymentType: paymentType.value,
      expectedDeliveryDate: expectedDeliveryDate.value || undefined,
      notes: orderNotes.value || undefined,
      cashierShiftId: (paymentType.value === 'CASH' && isNonCashier.value) ? selectedShiftId.value : undefined,
      items: cartItems.value.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
        unitCost: item.unitCost,
        isWholesale: item.isWholesale,
        notes: item.notes || undefined
      }))
    };

    // 1. Create Draft
    const createdPo = await purchaseOrderService.createDraft(payload);

    // 2. If user chose Submit for Approval, call submit endpoint
    let finalPo = createdPo;
    if (submitForApproval) {
      finalPo = await purchaseOrderService.submitForApproval(createdPo.id);
    }

    // 3. Clear cart on success
    clearCart();

    showToast(
      submitForApproval 
        ? `Purchase Order ${finalPo.poNumber} submitted for approval!` 
        : `Draft Purchase Order ${finalPo.poNumber} created!`,
      'success'
    );

    // 4. Navigate directly to dedicated PO Details screen
    router.push(`/purchases/orders/${finalPo.id}`);
  } catch (err: any) {
    showToast(err.message || 'Failed to create purchase order', 'error');
  } finally {
    isSubmitting.value = false;
  }
};

onMounted(async () => {
  if (!isOwnerOrAdmin.value && !vm.hasPermission('purchase_order:create') && !vm.hasPermission('purchase_order:view')) {
    showToast('Permission denied: You cannot access Purchase Order creation.', 'error');
    router.replace('/inventory');
    return;
  }
  if (suppliers.value.length === 0) {
    vm.fetchSuppliers();
  }
  await fetchOpenShifts();
});
</script>
