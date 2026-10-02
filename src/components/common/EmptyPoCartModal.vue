<template>
  <Modal 
    :isOpen="isOpen" 
    :onClose="onClose"
    :title="$t('poCart.emptyModalTitle')"
    maxWidth="max-w-md"
  >
    <div class="py-4 px-2 text-center flex flex-col items-center select-none font-sans">
      <!-- Icon illustration circle -->
      <div class="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-4 shadow-xs">
        <ShoppingCart class="w-8 h-8 stroke-[1.8]" />
      </div>

      <h3 class="text-base font-bold text-on-surface tracking-tight mb-2">
        {{ $t('poCart.emptyCartHeading') }}
      </h3>

      <p class="text-xs text-on-surface-variant leading-relaxed max-w-sm font-medium mb-6">
        {{ $t('poCart.emptyCartDescription') }}
      </p>

      <!-- Step instruction box -->
      <div class="w-full p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/60 text-left text-xs space-y-2 mb-2">
        <div class="flex items-start gap-2.5">
          <span class="w-5 h-5 rounded-full bg-primary/15 text-primary font-mono font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">1</span>
          <span class="text-on-surface-variant font-medium">{{ $t('poCart.step1Instruction') }}</span>
        </div>
        <div class="flex items-start gap-2.5">
          <span class="w-5 h-5 rounded-full bg-primary/15 text-primary font-mono font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">2</span>
          <span class="text-on-surface-variant font-medium">{{ $t('poCart.step2Instruction') }}</span>
        </div>
        <div class="flex items-start gap-2.5">
          <span class="w-5 h-5 rounded-full bg-primary/15 text-primary font-mono font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">3</span>
          <span class="text-on-surface-variant font-medium">{{ $t('poCart.step3Instruction') }}</span>
        </div>
      </div>
    </div>

    <template #footer>
      <button 
        type="button"
        @click="onClose"
        class="px-4 py-2 rounded-lg border border-outline text-xs font-bold text-on-surface-variant hover:bg-surface-container-high transition-colors cursor-pointer bg-transparent"
      >
        {{ $t('common.close') }}
      </button>

      <button 
        type="button"
        @click="handleGoToCatalog"
        class="px-4.5 py-2 rounded-lg bg-primary text-on-primary text-xs font-bold hover:bg-primary/90 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95 border-0"
      >
        <Package class="w-4 h-4" />
        <span>{{ $t('poCart.browseCatalogBtn') }}</span>
      </button>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { ShoppingCart, Package } from 'lucide-vue-next';
import Modal from './Modal.vue';

const props = defineProps<{
  isOpen: boolean;
  onClose: () => void;
}>();

const router = useRouter();

const handleGoToCatalog = () => {
  props.onClose();
  router.push('/inventory');
};
</script>
