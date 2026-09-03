<template>
  <div v-if="transaction" class="bg-surface-dim min-h-[calc(100vh-140px)] w-full flex flex-col md:flex-row items-center md:items-start justify-center p-6 md:p-8 gap-8 text-on-surface select-none font-sans overflow-y-auto rounded-xl">
    
    <!-- RECEIPT PAPER CONTAINER -->
    <div class="relative flex-shrink-0 w-full max-w-[400px] drop-shadow-xl animate-fade-up">
      <!-- Top edge curve -->
      <div class="w-full h-3 bg-surface-container-lowest rounded-t-xl"></div>
      
      <!-- Thermal text paper body -->
      <div class="bg-surface-container-lowest px-8 py-6 flex flex-col gap-5 font-mono text-xs text-on-surface-variant">
        
        <!-- Header -->
        <div class="flex flex-col items-center text-center gap-1.5">
          <Store class="w-8 h-8 text-on-surface stroke-[2px]" />
          <h1 class="text-md font-bold text-on-surface uppercase tracking-tight">{{ settings.name }} Jenga</h1>
          <div class="flex flex-col text-[10px] opacity-90 font-mono leading-relaxed mt-1">
            <p>{{ settings.physicalAddress }}</p>
            <p>TIN: {{ settings.tin }}</p>
            <p>Tel: {{ settings.phone }}</p>
          </div>
        </div>

        <div class="border-b-2 border-dashed border-outline-variant w-full"></div>

        <!-- Metadata ledger -->
        <div class="flex flex-col gap-1 w-full text-[10.5px]">
          <div class="flex justify-between w-full">
            <span>{{ $t('receipt.receiptNo') }}</span>
            <span class="text-on-surface font-black">{{ transaction.id }}</span>
          </div>
          <div class="flex justify-between w-full">
            <span>{{ $t('receipt.date') }}</span>
            <span class="text-on-surface font-bold">{{ transaction.date }}</span>
          </div>
          <div class="flex justify-between w-full">
            <span>{{ $t('receipt.cashier') }}</span>
            <span class="text-on-surface font-bold">{{ transaction.cashierName || 'Sarah K.' }}</span>
          </div>
          <div v-if="transaction.customerName" class="flex justify-between w-full">
            <span>{{ $t('receipt.customer') }}</span>
            <span class="text-on-surface font-bold">{{ transaction.customerName }} <span v-if="transaction.customerCode" class="text-[9px]">({{ transaction.customerCode }})</span></span>
          </div>
          <div v-if="transaction.status" class="flex justify-between w-full items-center mt-1">
            <span>{{ $t('receipt.status') }}</span>
            <span class="px-2 py-0.5 rounded text-[9.5px] font-black uppercase"
              :class="transaction.status === 'PAID' || transaction.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-800' : (transaction.status === 'UNPAID' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800')"
            >
              {{ transaction.status }}
            </span>
          </div>
        </div>

        <div class="border-b-2 border-dashed border-outline-variant w-full"></div>

        <!-- Table column headers -->
        <div class="flex justify-between w-full font-black text-on-surface uppercase pb-1 select-none text-[10.5px]">
          <span class="w-10">{{ $t('receipt.qty') }}</span>
          <span class="flex-1 text-left">{{ $t('receipt.item') }}</span>
          <span class="text-right">{{ $t('receipt.price') }}</span>
        </div>

        <!-- Cart items loops -->
        <div class="flex flex-col gap-3 w-full text-[10.5px]">
          <div v-for="item in transaction.items" :key="item.product.id" class="flex justify-between w-full items-start">
            <span class="w-10 font-bold">{{ item.quantity }}x</span>
            <div class="flex-1 flex flex-col leading-tight pr-2">
              <span class="text-on-surface font-bold text-wrap">{{ item.product.name }}</span>
              <span class="text-[9px] opacity-85 mt-0.5">
                @ {{ formatCurrency(item.product.price, settings.currency) }}
              </span>
            </div>
            <span class="text-right text-on-surface font-black">
              {{ formatCurrencyWithoutSymbol((item.product.price - item.discount) * item.quantity, settings.currency) }}
            </span>
          </div>
        </div>

        <div class="border-b-2 border-dashed border-outline-variant w-full pt-1"></div>

        <!-- Subtotals & Totals layout -->
        <div class="flex flex-col gap-1.5 w-full pt-1 text-[10.5px]">
          <div class="flex justify-between w-full">
            <span>{{ $t('receipt.subtotal') }}</span>
            <span class="text-on-surface font-bold">
              {{ formatCurrencyWithoutSymbol(transaction.subtotal, settings.currency) }}
            </span>
          </div>
          
          <div v-if="transaction.discount > 0" class="flex justify-between w-full text-tertiary">
            <span>{{ $t('receipt.discounts') }}</span>
            <span>
              -{{ formatCurrencyWithoutSymbol(transaction.discount, settings.currency) }}
            </span>
          </div>

          <div class="flex justify-between w-full">
            <span>{{ $t('receipt.taxVat') }}</span>
            <span class="text-on-surface font-bold">
              {{ formatCurrencyWithoutSymbol(transaction.tax, settings.currency) }}
            </span>
          </div>
          
          <div class="flex justify-between w-full items-center pt-3 pb-1">
            <span class="text-sm font-black text-on-surface uppercase tracking-tight">{{ $t('receipt.total') }}</span>
            <span class="text-lg font-black text-on-surface font-mono">
              {{ formatCurrency(transaction.total, settings.currency) }}
            </span>
          </div>
        </div>

        <div class="border-b-2 border-dashed border-outline-variant w-full pt-2"></div>

        <!-- Payment receipt confirmation -->
        <div class="flex flex-col gap-1.5 w-full text-center text-[10.5px] py-1 bg-surface-container-low/40 rounded">
          <p class="font-bold text-on-surface">{{ $t('receipt.paidVia', { method: transaction.paymentMethod }) }}</p>
          <p v-if="transaction.refCode" class="font-mono text-[9.5px] bg-white border border-outline-variant/30 py-0.5 px-2 mx-auto rounded font-black">
            {{ $t('receipt.ref', { code: transaction.refCode }) }}
          </p>
          <p v-else class="font-mono text-[9.5px] opacity-85">{{ $t('receipt.cashDrawerValidated') }}</p>
        </div>

        <!-- Footer Receipt Greeting and Barcodes -->
        <div class="flex flex-col items-center gap-4 pt-4">
          <p class="text-center font-bold text-on-surface uppercase tracking-wider text-[11px]">
            {{ $t('receipt.thankYou') }}
          </p>
          
          <!-- Fake Thermal Barcode Bars -->
          <div class="h-10 w-4/5 flex items-center justify-between opacity-85 select-none my-1">
            <div class="h-full w-1.5 bg-on-surface"></div>
            <div class="h-full w-2.5 bg-on-surface"></div>
            <div class="h-full w-1 bg-on-surface"></div>
            <div class="h-full w-3.5 bg-on-surface"></div>
            <div class="h-full w-1 bg-on-surface"></div>
            <div class="h-full w-1 bg-on-surface"></div>
            <div class="h-full w-2.5 bg-on-surface"></div>
            <div class="h-full w-4 bg-on-surface"></div>
            <div class="h-full w-1 bg-on-surface"></div>
            <div class="h-full w-2 bg-on-surface"></div>
            <div class="h-full w-1.5 bg-on-surface"></div>
            <div class="h-full w-3 bg-on-surface"></div>
            <div class="h-full w-1 bg-on-surface"></div>
            <div class="h-full w-2.5 bg-on-surface"></div>
            <div class="h-full w-1 bg-on-surface"></div>
          </div>
          
          <p class="text-[10px] tracking-widest font-mono select-all">884920193847</p>
        </div>
      </div>

      <!-- Bottom edge curve simulating tear -->
      <div class="w-full h-4 bg-surface-container-lowest rounded-b-xl"></div>
    </div>

    <!-- RIGHT PANEL: ACTIONS CARD -->
    <div class="flex flex-col gap-4 w-full max-w-[280px]">
      <div class="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/50 flex flex-col gap-4 shadow-md animate-fade-up">
        <h2 class="text-md font-bold text-on-surface mb-2 font-sans">{{ $t('receipt.receiptActions') }}</h2>
        
        <!-- Action: Print -->
        <button 
          type="button"
          @click="handlePrint"
          class="w-full h-12 py-3 flex items-center justify-center gap-2 bg-primary hover:bg-opacity-95 text-on-primary font-bold text-sm rounded-lg transition-colors shadow-sm cursor-pointer border-0 text-white"
        >
          <Printer class="w-4 h-4" />
          <span>{{ $t('receipt.printReceipt') }}</span>
        </button>

        <!-- Action: PDF -->
        <button 
          type="button"
          @click="handleSavePdf"
          class="w-full h-12 py-3 flex items-center justify-center gap-2 bg-surface-container-high hover:bg-surface-variant text-on-surface font-bold text-sm rounded-lg transition-colors border border-outline-variant/50 cursor-pointer"
        >
          <FileText class="w-4 h-4" />
          <span>{{ $t('receipt.savePdf') }}</span>
        </button>

        <!-- Action: Reprint -->
        <button 
          type="button"
          @click="alertReprint"
          class="w-full h-12 py-3 flex items-center justify-center gap-2 bg-surface-container-high hover:bg-surface-variant text-on-surface font-bold text-sm rounded-lg transition-colors border border-outline-variant/50 cursor-pointer"
        >
          <RotateCcw class="w-4 h-4" />
          <span>{{ $t('receipt.reprintDocket') }}</span>
        </button>

        <div class="h-px w-full bg-outline-variant/30 my-2"></div>

        <!-- Action: Return -->
        <button 
          type="button"
          @click="router.back()"
          class="w-full h-12 py-3 flex items-center justify-center gap-2 hover:bg-error-container text-error hover:text-on-error-container font-extrabold text-sm rounded-lg transition-colors cursor-pointer bg-transparent border-0"
        >
          <XCircle class="w-4 h-4" />
          <span>{{ $t('receipt.closePreview') }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAppViewModel } from '../viewmodels/useAppViewModel';
import { formatCurrency, formatCurrencyWithoutSymbol } from '../models/mockData';
import { t } from '../i18n';
import { 
  Printer, 
  FileText, 
  RotateCcw, 
  XCircle, 
  Store 
} from 'lucide-vue-next';

const vm = useAppViewModel();
const router = useRouter();

const transaction = computed(() => vm.lastTransaction.value);
const settings = computed(() => vm.settings.value);

onMounted(() => {
  if (!transaction.value) {
    console.warn('ReceiptView - No transaction found, redirecting to /checkout');
    router.replace('/checkout');
  }
});

const handlePrint = () => {
  alert(t('receipt.printQueueAlert'));
};

const handleSavePdf = () => {
  if (transaction.value) {
    alert(t('receipt.savePdfAlert', { id: transaction.value.id }));
  }
};

const alertReprint = () => {
  alert(t('receipt.reprintAlert'));
};
</script>
