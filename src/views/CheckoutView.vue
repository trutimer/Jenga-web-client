<template>
  <div class="flex-1 flex flex-col p-6 gap-4 overflow-hidden font-sans border-t border-outline-variant select-none -mx-margin-page h-[calc(100vh-64px)] bg-surface-container-lowest">
    
    <!-- TOP SECTION: Search & Catalog browser -->
      
      <!-- Scan Barcode search component -->
      <div class="flex gap-4 shrink-0">
        <form @submit.prevent="handleQuerySearch" class="flex-1 relative">
          <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <QrCode class="w-5 h-5 text-primary" />
          </div>
          <input 
            type="text"
            v-model="searchQuery"
            placeholder="Scan barcode or type name to search catalog..."
            class="block w-full pl-12 pr-4 py-4 bg-surface rounded-xl border border-outline-variant text-base focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-sm placeholder-on-surface-variant font-medium outline-none"
          />
        </form>
        <button 
          type="button"
          @click="showBrowse = !showBrowse"
          class="px-6 py-4 rounded-xl font-bold text-sm transition-all flex items-center gap-2 border cursor-pointer"
          :class="showBrowse 
            ? 'bg-primary text-on-primary border-primary' 
            : 'bg-surface-container text-on-surface hover:bg-surface-container-high border-outline-variant'"
        >
          <Grid class="w-4 h-4" />
          <span>Browse Grid</span>
        </button>
      </div>

      <!-- Conditional Catalog Quick-Grids -->
      <div v-if="showBrowse" class="bg-surface-container-low rounded-xl p-4 border border-outline-variant/60 flex flex-col gap-3 shrink-0 h-44 overflow-y-auto">
        <div class="flex justify-between items-center pb-2 border-b border-outline-variant/30">
          <h4 class="text-xs font-mono font-bold uppercase tracking-wider text-on-surface-variant">Tap Catalog Tiles to Add</h4>
          <span class="text-[10px] font-mono text-outline font-semibold">({{ filteredProducts.length }} items formatted)</span>
        </div>
        <div class="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-8 gap-3">
          <button
            v-for="p in filteredProducts"
            :key="p.id"
            type="button"
            :disabled="p.stock === 0"
            @click="addProductToCart(p)"
            class="p-2.5 rounded-lg border text-left cursor-pointer transition-all flex flex-col justify-between h-14"
            :class="p.stock === 0 
              ? 'border-outline-variant/30 opacity-40 bg-surface-container cursor-not-allowed' 
              : 'border-outline-variant hover:border-primary bg-surface-container-lowest hover:shadow-sm'"
          >
            <p class="text-xs font-bold text-on-surface truncate w-full leading-tight">{{ p.name }}</p>
            <div class="flex justify-between items-center w-full mt-1">
              <span class="text-[10px] text-outline font-semibold">Stock: {{ p.stock }}</span>
              <span class="text-[10.5px] font-mono font-black text-primary">{{ formatCurrency(p.price, currency) }}</span>
            </div>
          </button>
        </div>
      </div>

    <!-- BOTTOM SECTION: Cart & Checkout Actions -->
    <div class="flex-1 flex gap-4 overflow-hidden">
      
      <!-- Cart Listing Container -->
      <div class="w-2/3 bg-surface rounded-xl border border-outline-variant flex flex-col overflow-hidden shadow-sm">
        <!-- Custom Grid Table Header -->
        <div class="grid grid-cols-12 gap-4 p-4 bg-surface-container-low border-b border-outline-variant text-[11px] font-mono font-bold text-on-surface-variant uppercase tracking-wider">
          <div class="col-span-5">Product Details</div>
          <div class="col-span-3 text-center">Quantity</div>
          <div class="col-span-2 text-right">Unit Price</div>
          <div class="col-span-2 text-right">Total</div>
        </div>

        <!-- Cart Table Body -->
        <div class="flex-1 overflow-y-auto bg-surface-container-lowest divide-y divide-surface-variant">
          <div v-if="cart.length === 0" class="h-full w-full flex flex-col justify-center items-center p-8 text-center bg-surface-container-lowest/50 text-outline">
            <AlertCircle class="w-12 h-12 text-outline-variant mb-4 stroke-[1.5px]" />
            <h4 class="text-sm font-bold text-on-surface mb-1">Cart is Empty</h4>
            <p class="text-xs text-on-surface-variant max-w-sm">Scan barcode codes or click tiles from the Quick-Browse grid above to draft active purchases.</p>
          </div>
          <div 
            v-else
            v-for="item in cart"
            :key="item.product.id"
            class="grid grid-cols-12 gap-4 p-4 items-center hover:bg-surface-container/20 group transition-all"
          >
            <!-- Name detail column -->
            <div class="col-span-5 flex items-center gap-3">
              <button 
                @click="removeLineItem(item.product.id)"
                class="text-error opacity-80 group-hover:opacity-100 hover:bg-error-container hover:text-on-error-container p-1 rounded-lg transition-colors cursor-pointer"
                title="Remove product"
              >
                <Trash2 class="w-4 h-4" />
              </button>
              <div class="min-w-0">
                <p class="text-sm font-bold text-on-surface truncate leading-tight">{{ item.product.name }}</p>
                <span class="text-[10px] font-mono font-semibold text-on-surface-variant">BAR: {{ item.product.barcode }}</span>
              </div>
            </div>

            <!-- Quantity adjust column -->
            <div class="col-span-3 flex justify-center items-center gap-2">
              <button 
                type="button"
                @click="updateQuantity(item.product.id, -1)"
                class="w-8 h-8 rounded-lg bg-surface-container border border-outline-variant/40 flex items-center justify-center hover:bg-surface-container-high text-on-surface-variant cursor-pointer transition-colors"
              >
                <Minus class="w-3.5 h-3.5 stroke-[3px]" />
              </button>
              <span class="font-mono text-sm font-black w-8 text-center">{{ item.quantity }}</span>
              <button 
                type="button"
                @click="updateQuantity(item.product.id, 1)"
                class="w-8 h-8 rounded-lg bg-surface-container border border-outline-variant/40 flex items-center justify-center hover:bg-surface-container-high text-on-surface-variant cursor-pointer transition-colors"
              >
                <Plus class="w-3.5 h-3.5 stroke-[3px]" />
              </button>
            </div>

            <!-- Pricing column -->
            <div class="col-span-2 flex flex-col items-end justify-center">
              <span class="font-mono text-xs font-semibold text-on-surface">
                {{ formatCurrency(getItemPrice(item), currency) }}
              </span>
              <button 
                v-if="item.product.wholesalePrice !== undefined && item.product.wholesalePrice !== null"
                type="button"
                @click="togglePriceType(item)"
                class="mt-1 px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase transition-all border cursor-pointer select-none"
                :class="item.isWholesale 
                  ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100' 
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'"
              >
                {{ item.isWholesale ? 'Wholesale' : 'Retail' }}
              </button>
              <span 
                v-else
                class="mt-1 px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase bg-gray-100 text-gray-400 border border-gray-200 select-none cursor-default"
              >
                Retail Only
              </span>
            </div>

            <!-- Line Total column -->
            <div class="col-span-2 text-right font-mono text-sm font-black text-primary">
              {{ formatCurrency((getItemPrice(item) - item.discount) * item.quantity, currency) }}
            </div>
          </div>
        </div>
      </div>

      <!-- RIGHT PANEL: Summary and checkout actions -->
      <aside class="w-1/3 bg-surface-container-lowest flex flex-col shrink-0 font-sans border border-outline-variant rounded-xl overflow-hidden shadow-sm">
      <div class="flex-1 p-6 flex flex-col gap-6 overflow-y-auto">
        
        <!-- Subtotal metadata details -->
        <div class="flex flex-col gap-2 pb-4 border-b border-outline-variant/60">
          <div class="flex justify-between items-center text-sm font-semibold text-on-surface-variant">
            <span>Subtotal ({{ cartItemsCount }} items)</span>
            <span class="font-mono text-on-surface font-bold">{{ formatCurrency(subtotal, currency) }}</span>
          </div>
          <div class="flex justify-between items-center text-sm font-semibold text-tertiary">
            <span>Discounts</span>
            <span class="font-mono font-bold">-{{ formatCurrency(discount, currency) }}</span>
          </div>
          <div class="flex justify-between items-center text-sm font-semibold text-on-surface-variant">
            <span>Tax (18% VAT Incl.)</span>
            <span class="font-mono text-on-surface font-bold">{{ formatCurrency(tax, currency) }}</span>
          </div>
          <div class="flex justify-between items-end pt-2 mt-1 border-t border-outline-variant/40">
            <span class="text-base font-black uppercase tracking-tight text-on-surface">Total Invoice</span>
            <span class="text-xl font-black text-primary font-mono tracking-tight">
              {{ formatCurrency(total, currency) }}
            </span>
          </div>
        </div>

        <!-- Payment Methods switcher panel -->
        <div class="flex flex-col gap-1.5">
          <h3 class="text-[11px] font-mono font-bold text-on-surface-variant uppercase tracking-widest">Select Method</h3>
          <div class="grid grid-cols-3 gap-2">
            <!-- Cash button -->
            <button 
              type="button"
              @click="selectPaymentMethod('Cash')"
              class="rounded-xl p-3.5 flex flex-col items-center justify-center gap-1.5 transition-all text-center h-10 cursor-pointer border-2"
              :class="paymentMethod === 'Cash' 
                ? 'bg-primary text-on-primary border-primary shadow-md shadow-primary/10' 
                : 'bg-surface-container-lowest text-on-surface border-outline-variant hover:border-primary/50'"
            >
              <span class="text-xs font-bold">Cash</span>
            </button>

            <!-- On Credit button -->
            <button 
              type="button"
              @click="selectPaymentMethod('On Credit')"
              class="rounded-xl p-3.5 flex flex-col items-center justify-center gap-1.5 transition-all text-center h-10 cursor-pointer border-2"
              :class="paymentMethod === 'On Credit' 
                ? 'bg-primary text-on-primary border-primary shadow-md shadow-primary/10' 
                : 'bg-surface-container-lowest text-on-surface border-outline-variant hover:border-primary/50'"
            >
              <span class="text-xs font-bold">On Credit</span>
            </button>

            <!-- M-Pesa mobile money button -->
            <button 
              type="button"
              @click="selectPaymentMethod('M-Pesa')"
              class="rounded-xl p-3.5 flex flex-col items-center justify-center gap-1.5 transition-all text-center h-10 cursor-pointer border-2"
              :class="paymentMethod === 'M-Pesa' 
                ? 'bg-primary text-on-primary border-primary shadow-md shadow-primary/10' 
                : 'bg-surface-container-lowest text-on-surface border-outline-variant hover:border-primary/50'"
            >
              <span class="text-xs font-bold">M-Pesa</span>
            </button>
          </div>

          <!-- Customer Banner for On Credit -->
          <div v-if="paymentMethod === 'On Credit'" class="mt-2 p-3 rounded-xl bg-surface-container border border-primary/30 flex flex-col gap-2">
            <div v-if="selectedCustomer" class="flex justify-between items-start">
              <div>
                <div class="flex items-center gap-2">
                  <UserCheck class="w-4 h-4 text-primary shrink-0" />
                  <span class="text-xs font-bold text-on-surface">{{ selectedCustomer.displayName || selectedCustomer.companyName || `${selectedCustomer.firstName || ''} ${selectedCustomer.lastName || ''}`.trim() }}</span>
                  <span class="text-[10px] font-mono bg-primary/10 text-primary px-1.5 py-0.5 rounded font-bold">{{ selectedCustomer.code || 'CUST' }}</span>
                </div>
                <div class="text-[11px] text-on-surface-variant font-mono mt-1 space-y-0.5">
                  <div>Credit Limit: <span class="font-bold text-on-surface">{{ formatCurrency(selectedCustomer.creditLimit || 0, currency) }}</span></div>
                  <div>Outstanding: <span class="font-bold text-amber-600">{{ formatCurrency(selectedCustomer.outstandingBalance || 0, currency) }}</span></div>
                  <div>Available Credit: <span class="font-bold" :class="((selectedCustomer.creditLimit || 0) - (selectedCustomer.outstandingBalance || 0)) >= total ? 'text-success' : 'text-error'">{{ formatCurrency((selectedCustomer.creditLimit || 0) - (selectedCustomer.outstandingBalance || 0), currency) }}</span></div>
                </div>
              </div>
              <button 
                type="button" 
                @click="openCustomerPicker" 
                class="px-2.5 py-1 text-[11px] font-bold text-primary bg-surface hover:bg-surface-container-high rounded-lg border border-primary/30 transition-all cursor-pointer"
              >
                Change
              </button>
            </div>
            <div v-else class="flex justify-between items-center py-1">
              <span class="text-xs font-semibold text-error flex items-center gap-1.5">
                <AlertCircle class="w-4 h-4" /> No customer selected
              </span>
              <button 
                type="button" 
                @click="openCustomerPicker" 
                class="px-3 py-1.5 text-xs font-bold text-on-primary bg-primary hover:bg-primary/95 rounded-lg transition-all cursor-pointer shadow-xs"
              >
                Select Customer
              </button>
            </div>
          </div>
        </div>

        <!-- Cash Simulator panel -->
        <div class="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant/60 flex flex-col gap-4 mt-auto">
          <div>
            <label class="block text-[11px] font-mono font-bold text-on-surface-variant uppercase tracking-wider mb-2">
              {{ paymentMethod === 'Cash' ? 'Amount Cash Received' : 'Integrated Gateway Total' }}
            </label>
            
            <div class="relative">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-on-surface-variant">
                {{ currency === 'TZS' ? 'TZS' : currency === 'USD' ? '$' : '€' }}
              </span>
              <input 
                type="number"
                :disabled="paymentMethod !== 'Cash'"
                v-model="customCashInput"
                :placeholder="formatCurrencyWithoutSymbol(total, currency)"
                class="w-full bg-surface pl-14 pr-4 py-3.5 rounded-lg border-2 border-primary text-lg font-black text-on-surface focus:outline-none focus:ring-0 text-right font-mono"
              />
            </div>
          </div>

          <!-- Change Due summary -->
          <div class="mt-1 p-3.5 bg-primary-container/15 rounded-lg flex justify-between items-center border border-primary-container/20">
            <span class="text-sm font-semibold text-primary">Change Due</span>
            <span class="text-xl font-black text-primary font-mono select-all">
              {{ formatCurrency(changeDue, currency) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Action controls footer -->
      <div class="p-4 sm:p-5 bg-surface border-t border-outline-variant shrink-0">
        <div class="flex items-center gap-3">
          <!-- Hold Button -->
          <button 
            type="button" 
            @click="handleHold"
            :disabled="cart.length === 0"
            class="h-12 px-4 bg-surface-container text-on-surface font-bold text-xs rounded-xl hover:bg-surface-variant transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 shrink-0 border border-outline-variant/60"
          >
            <Pause class="w-4 h-4 stroke-[2.5px]" />
            <span>Hold</span>
          </button>

          <!-- Complete Sale & Print Button -->
          <button 
            type="button"
            @click="handleCompleteSale"
            :disabled="cart.length === 0"
            class="flex-1 h-12 bg-primary text-on-primary rounded-xl text-sm font-bold hover:bg-primary/95 active:scale-[0.99] transition-all flex items-center justify-center gap-2.5 shadow-md shadow-primary/15 cursor-pointer disabled:opacity-50"
          >
            <CheckCircle class="w-5 h-5 stroke-[2.5px]" />
            <span>Complete Sale & Print</span>
          </button>
        </div>
      </div>
      </aside>
    </div>
  </div>

  <!-- Stock Warning Modal -->
  <Modal 
    :isOpen="showStockModal" 
    :title="stockModalTitle" 
    :onClose="() => showStockModal = false"
    maxWidth="max-w-md"
  >
    <div class="flex flex-col items-center text-center p-2 space-y-4">
      <div class="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600 animate-pulse">
        <AlertCircle class="w-8 h-8 stroke-[2px]" />
      </div>
      
      <div class="space-y-2">
        <h4 class="text-md font-bold text-on-surface">Verification Alert</h4>
        <p class="text-xs text-on-surface-variant leading-relaxed">
          {{ stockModalMessage }}
        </p>
      </div>
    </div>
    
    <template #footer>
      <button 
        @click="showStockModal = false" 
        class="w-full py-3 bg-primary text-on-primary hover:bg-opacity-95 rounded-xl transition-all font-bold text-xs cursor-pointer border-0 shadow-md shadow-primary/15 text-white"
      >
        Acknowledge
      </button>
    </template>
  </Modal>

  <!-- Open Shift Modal for Cashiers -->
  <Modal 
    :isOpen="vm.userRole.value === 'CASHIER' && vm.currentShift.value === null" 
    title="Open Shift" 
    :onClose="() => {}"
    maxWidth="max-w-sm"
  >
    <div class="flex flex-col space-y-4">
      <div class="space-y-2 text-center pb-2">
        <h4 class="text-md font-bold text-on-surface">Start Register Session</h4>
        <p class="text-xs text-on-surface-variant leading-relaxed">
          You must declare your starting cash float before processing any sales.
        </p>
      </div>
      <div class="space-y-2">
        <label class="text-[11px] font-mono font-bold text-on-surface-variant uppercase tracking-wider">Opening Cash ({{ currency }})</label>
        <input 
          type="number" 
          v-model="openingCashInput"
          placeholder="e.g. 50000"
          class="w-full bg-surface-container border border-outline-variant rounded-lg p-3.5 text-lg text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-mono text-center font-black shadow-inner"
        />
      </div>
    </div>
    
    <template #footer>
      <button 
        @click="handleOpenShift" 
        :disabled="isOpeningShift || !openingCashInput"
        class="w-full py-3.5 bg-primary text-on-primary hover:bg-opacity-95 active:scale-95 rounded-xl transition-all font-bold text-sm cursor-pointer border-0 shadow-lg shadow-primary/20 text-white disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ isOpeningShift ? 'Opening...' : 'Open Shift' }}
      </button>
    </template>
  </Modal>

  <!-- Customer Selection Modal for Credit Sales -->
  <Modal 
    :isOpen="showCustomerPickerModal" 
    title="Select Customer for Credit Sale" 
    :onClose="() => showCustomerPickerModal = false"
    maxWidth="max-w-xl"
  >
    <div class="flex flex-col gap-4">
      <div class="relative">
        <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/50 w-4 h-4" />
        <input 
          type="text" 
          v-model="customerSearchQuery"
          placeholder="Search customer by name, code, phone, or TIN..."
          class="w-full pl-10 pr-4 py-2.5 bg-surface rounded-xl border border-outline-variant text-xs font-medium focus:border-primary focus:outline-none text-on-surface"
        />
      </div>

      <div class="flex justify-between items-center text-xs text-on-surface-variant px-1 font-mono">
        <span>Required Amount: <strong class="text-primary font-bold">{{ formatCurrency(total, currency) }}</strong></span>
        <span>Available Customers: {{ filteredCustomers.length }}</span>
      </div>

      <div class="max-h-80 overflow-y-auto space-y-2 pr-1">
        <div v-if="isLoadingCustomers" class="p-8 text-center text-xs text-on-surface-variant">
          Loading customers...
        </div>
        <div v-else-if="filteredCustomers.length === 0" class="p-8 text-center text-xs text-on-surface-variant">
          No active customers found matching "{{ customerSearchQuery }}".
        </div>
        <div 
          v-else
          v-for="c in filteredCustomers" 
          :key="c.id"
          class="p-3.5 rounded-xl border transition-all flex justify-between items-center gap-3"
          :class="((c.creditLimit || 0) - (c.outstandingBalance || 0)) >= total
            ? 'border-outline-variant hover:border-primary/60 bg-surface'
            : 'border-error/30 bg-error/5 opacity-80'"
        >
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold text-on-surface truncate">
                {{ c.displayName || c.companyName || `${c.firstName || ''} ${c.lastName || ''}`.trim() }}
              </span>
              <span class="text-[10px] font-mono bg-surface-container-high px-1.5 py-0.5 rounded font-bold text-on-surface-variant">
                {{ c.code || 'CUST' }}
              </span>
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-full" :class="c.customerType === 'COMPANY' ? 'bg-secondary/10 text-secondary' : 'bg-primary/10 text-primary'">
                {{ c.customerType }}
              </span>
            </div>
            <div class="text-[11px] text-on-surface-variant font-mono mt-1 flex flex-wrap gap-x-4 gap-y-0.5">
              <span>Phone: {{ c.phone || 'N/A' }}</span>
              <span>Limit: {{ formatCurrency(c.creditLimit || 0, currency) }}</span>
              <span>Available: <strong :class="((c.creditLimit || 0) - (c.outstandingBalance || 0)) >= total ? 'text-success' : 'text-error'">{{ formatCurrency((c.creditLimit || 0) - (c.outstandingBalance || 0), currency) }}</strong></span>
            </div>
          </div>

          <button 
            type="button"
            @click="selectCustomerForCredit(c)"
            class="px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all shrink-0"
            :class="((c.creditLimit || 0) - (c.outstandingBalance || 0)) >= total
              ? 'bg-primary text-on-primary hover:bg-primary/95 shadow-xs'
              : 'bg-error/20 text-error hover:bg-error/30'"
          >
            {{ ((c.creditLimit || 0) - (c.outstandingBalance || 0)) >= total ? 'Select' : 'Exceeded' }}
          </button>
        </div>
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAppViewModel } from '../viewmodels/useAppViewModel';
import { showToast } from '../services/toastService';
import { customerService } from '../services/customerService';
import { useBarcodeScanner, playPOSSound } from '../composables/useBarcodeScanner';
import type { Product, CartItem, Transaction, Customer } from '../models/types';
import { formatCurrency, formatCurrencyWithoutSymbol } from '../models/mockData';
import Modal from '../components/common/Modal.vue';
import { 
  Trash2, 
  Minus, 
  Plus, 
  QrCode, 
  CheckCircle, 
  Smartphone, 
  Coins, 
  X, 
  Pause, 
  Printer, 
  AlertCircle,
  Grid,
  UserCheck,
  Search
} from 'lucide-vue-next';

const vm = useAppViewModel();

const cart = ref<(CartItem & { isWholesale?: boolean })[]>([]);

const getItemPrice = (item: CartItem & { isWholesale?: boolean }) => {
  if (item.isWholesale && item.product.wholesalePrice !== undefined && item.product.wholesalePrice !== null) {
    return item.product.wholesalePrice;
  }
  return item.product.price;
};

const togglePriceType = (item: CartItem & { isWholesale?: boolean }) => {
  item.isWholesale = !item.isWholesale;
};
const showStockModal = ref(false);
const stockModalTitle = ref('');
const stockModalMessage = ref('');

const triggerStockWarning = (title: string, message: string) => {
  stockModalTitle.value = title;
  stockModalMessage.value = message;
  showStockModal.value = true;
};
const searchQuery = ref('');
const showBrowse = ref(true);
const paymentMethod = ref<'Cash' | 'On Credit' | 'M-Pesa'>('Cash');
const customCashInput = ref('');

// Customer Selection State for Credit Sales
const selectedCustomer = ref<Customer | null>(null);
const showCustomerPickerModal = ref<boolean>(false);
const customerSearchQuery = ref<string>('');
const availableCustomers = ref<Customer[]>([]);
const isLoadingCustomers = ref<boolean>(false);

const openCustomerPicker = async () => {
  showCustomerPickerModal.value = true;
  isLoadingCustomers.value = true;
  try {
    const res = await customerService.getAllCustomers({ size: 100 });
    availableCustomers.value = (res.content || []).filter(c => c.status === 'ACTIVE');
  } catch (err: any) {
    showToast(err.message || 'Failed to fetch customers', 'error');
  } finally {
    isLoadingCustomers.value = false;
  }
};

const filteredCustomers = computed(() => {
  const q = customerSearchQuery.value.trim().toLowerCase();
  if (!q) return availableCustomers.value;
  return availableCustomers.value.filter(c => 
    (c.displayName && c.displayName.toLowerCase().includes(q)) ||
    (c.companyName && c.companyName.toLowerCase().includes(q)) ||
    (c.firstName && c.firstName.toLowerCase().includes(q)) ||
    (c.lastName && c.lastName.toLowerCase().includes(q)) ||
    (c.code && c.code.toLowerCase().includes(q)) ||
    (c.phone && c.phone.includes(q)) ||
    (c.tinNumber && c.tinNumber.includes(q))
  );
});

const selectCustomerForCredit = (customer: Customer) => {
  const avail = (customer.creditLimit || 0) - (customer.outstandingBalance || 0);
  if (total.value > avail) {
    showToast(`Credit limit exceeded! Available credit: ${formatCurrency(avail, currency.value)}, Sale total: ${formatCurrency(total.value, currency.value)}.`, 'error');
    return;
  }

  selectedCustomer.value = customer;
  showCustomerPickerModal.value = false;
  showToast(`Selected customer: ${customer.displayName || customer.companyName || customer.firstName}`, 'success');
};

const products = computed(() => vm.products.value);
const currency = computed(() => vm.settings.value.currency);

const openingCashInput = ref('');
const isOpeningShift = ref(false);

const handleOpenShift = async () => {
  const amount = parseFloat(openingCashInput.value);
  if (isNaN(amount) || amount < 0) {
    showToast('Please enter a valid positive amount', 'error');
    return;
  }
  isOpeningShift.value = true;
  const success = await vm.openShift(amount);
  isOpeningShift.value = false;
  if (success) {
    openingCashInput.value = '';
  }
};

onMounted(() => {
  vm.fetchProducts();
});

const handleBarcodeScan = (scannedCode: string) => {
  const code = scannedCode.trim();
  if (!code) return;

  const matched = products.value.find(
    p => p.barcode === code || p.id === code || p.barcode?.toLowerCase() === code.toLowerCase()
  );

  if (matched) {
    addProductToCart(matched);
    showToast(`Scanned: ${matched.name}`, 'success');
  } else {
    playPOSSound('error');
    showToast(`No product found for barcode: "${code}"`, 'error');
  }
};

// Global 2D Barcode Scanner integration (Model X11 / Siyuanchuang Electronics)
useBarcodeScanner({
  onScan: (scannedCode) => {
    handleBarcodeScan(scannedCode);
  },
  enableAudioFeedback: true,
});

const handleQuerySearch = () => {
  const query = searchQuery.value.trim().toLowerCase();
  if (!query) return;

  const matched = products.value.find(
    p => p.barcode === query || p.id === query || p.name.toLowerCase().includes(query)
  );

  if (matched) {
    addProductToCart(matched);
    searchQuery.value = '';
  } else {
    showToast(`No product matched for: "${searchQuery.value}"`, 'error');
  }
};

const addProductToCart = (product: Product) => {
  if (product.stock === 0) {
    triggerStockWarning('Product Out of Stock', `Warning: "${product.name}" is currently Out of Stock!`);
    return;
  }

  const existing = cart.value.find(item => item.product.id === product.id);
  if (existing) {
    const step = (product.unitOfMeasure === 'LTR' || product.unitOfMeasure === 'KG') ? 0.25 : 1;
    if (existing.quantity + step > product.stock) {
      triggerStockWarning('Stock Limit Exceeded', `Cannot sell more than the available stock of ${product.stock} units.`);
      return;
    }
    existing.quantity = Number((existing.quantity + step).toFixed(2));
  } else {
    cart.value.push({ product, quantity: 1, discount: 0 });
  }
};

const updateQuantity = (productId: string, val: number) => {
  const item = cart.value.find(it => it.product.id === productId);
  if (!item) return;

  const isFractional = item.product.unitOfMeasure === 'LTR' || item.product.unitOfMeasure === 'KG';
  const step = isFractional ? 0.25 : 1;
  const minQty = isFractional ? 0.25 : 1;

  const change = val * step;
  const newQty = Number((item.quantity + change).toFixed(2));

  if (newQty < minQty) {
    removeLineItem(productId);
    return;
  }

  if (newQty > item.product.stock) {
    triggerStockWarning('Stock Limit Exceeded', `Cannot sell more than the available stock of ${item.product.stock} units.`);
    return;
  }

  item.quantity = newQty;
};

const removeLineItem = (productId: string) => {
  cart.value = cart.value.filter(it => it.product.id !== productId);
};

const clearCart = () => {
  if (cart.value.length > 0 && window.confirm("Are you sure you want to cancel and clear the active cart?")) {
    cart.value = [];
    customCashInput.value = '';
    selectedCustomer.value = null;
  }
};

const cartItemsCount = computed(() => cart.value.reduce((ac, it) => ac + it.quantity, 0));

const subtotal = computed(() => {
  return cart.value.reduce((acc, item) => acc + (getItemPrice(item) * item.quantity), 0);
});

const discount = computed(() => {
  return cart.value.reduce((acc, item) => acc + (item.discount * item.quantity), 0);
});

const tax = computed(() => {
  const taxableAmount = Math.max(0, subtotal.value - discount.value);
  return (taxableAmount * 0.18) / 1.18;
});

const total = computed(() => {
  return Math.max(0, subtotal.value - discount.value);
});

const quickCashOptions = computed(() => {
  if (currency.value === 'USD') {
    const val = Math.ceil(total.value / 2600);
    return [val, val + 5, val + 10, val + 20];
  }
  if (currency.value === 'EUR') {
    const val = Math.ceil(total.value / 2800);
    return [val, val + 5, val + 10, val + 20];
  }
  const currentPrice = Math.ceil(total.value / 1000) * 1000;
  return [currentPrice, currentPrice + 1000, currentPrice + 5000, currentPrice + 10000];
});

const cashReceivedValueTransformed = computed(() => {
  const parsed = parseFloat(customCashInput.value) || 0;
  if (parsed > 0) {
    if (currency.value === 'USD') return parsed * 2600;
    if (currency.value === 'EUR') return parsed * 2800;
    return parsed;
  }
  return total.value;
});

const changeDue = computed(() => {
  return Math.max(0, cashReceivedValueTransformed.value - total.value);
});

const selectPaymentMethod = (method: 'Cash' | 'On Credit' | 'M-Pesa') => {
  paymentMethod.value = method;
  if (method === 'Cash') {
    customCashInput.value = '';
  } else if (method === 'On Credit') {
    customCashInput.value = '0';
    if (!selectedCustomer.value) {
      openCustomerPicker();
    }
  } else {
    customCashInput.value = formatCurrencyWithoutSymbol(total.value, currency.value);
  }
};

const handleCompleteSale = () => {
  if (cart.value.length === 0) {
    showToast("Active cart is empty! Please scan or select products to continue.", 'error');
    return;
  }

  if (paymentMethod.value === 'On Credit') {
    if (!selectedCustomer.value) {
      showToast("Please select a customer for On Credit sale.", 'error');
      openCustomerPicker();
      return;
    }
    const avail = (selectedCustomer.value.creditLimit || 0) - (selectedCustomer.value.outstandingBalance || 0);
    if (total.value > avail) {
      showToast(`Sale total (${formatCurrency(total.value, currency.value)}) exceeds customer available credit limit (${formatCurrency(avail, currency.value)}).`, 'error');
      return;
    }
  }

  if (paymentMethod.value === 'Cash' && cashReceivedValueTransformed.value < total.value) {
    showToast("Insufficient cash received. Please collect accurate invoice fees.", 'error');
    return;
  }

  const finalItems: CartItem[] = cart.value.map(item => {
    const activePrice = getItemPrice(item);
    return {
      product: {
        ...item.product,
        price: activePrice
      },
      quantity: item.quantity,
      discount: item.discount
    };
  });

  const orderData: Transaction = {
    id: `RC-${Math.floor(10000 + Math.random() * 90000)}`,
    date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) + `, ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}`,
    items: finalItems,
    subtotal: subtotal.value,
    discount: discount.value,
    tax: tax.value,
    total: total.value,
    paymentMethod: paymentMethod.value,
    amountReceived: paymentMethod.value === 'On Credit' ? 0 : cashReceivedValueTransformed.value,
    changeDue: paymentMethod.value === 'On Credit' ? 0 : changeDue.value,
    customerId: paymentMethod.value === 'On Credit' ? selectedCustomer.value?.id : undefined,
    customerName: paymentMethod.value === 'On Credit' ? (selectedCustomer.value?.displayName || selectedCustomer.value?.companyName || selectedCustomer.value?.firstName) : undefined,
    refCode: paymentMethod.value === 'M-Pesa' 
      ? `RK${Math.floor(10 + Math.random() * 89)}ZLQ${Math.floor(10 + Math.random() * 89)}M`
      : paymentMethod.value === 'On Credit'
        ? `CR-${Math.floor(100000 + Math.random() * 900000)}`
        : undefined
  };

  vm.handleTransactionCompleted(orderData);
};

const handleHold = () => {
  if (cart.value.length > 0) {
    alert("Transaction placed on Hold successfully.");
  }
};

const alertReceiptGuide = () => {
  alert("Simulation setup. Complete transaction to generate valid receipts.");
};

const filteredProducts = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  const list = !q 
    ? [...products.value] 
    : products.value.filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));

  return list.sort((a, b) => {
    const aHasNoBarcode = !a.barcode || !a.barcode.trim();
    const bHasNoBarcode = !b.barcode || !b.barcode.trim();
    if (aHasNoBarcode && !bHasNoBarcode) return -1;
    if (!aHasNoBarcode && bHasNoBarcode) return 1;
    return 0;
  });
});
</script>
