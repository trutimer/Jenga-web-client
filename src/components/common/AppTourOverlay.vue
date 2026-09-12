<template>
  <Teleport to="body">
    <div 
      v-if="isTourActive && currentStep && isAllowedRoute && isStoreAdminOrManager"
      class="fixed inset-0 z-[9999] overflow-hidden select-none font-sans pointer-events-auto"
    >
      <!-- SVG Spotlight Mask Overlay: Cuts a 100% crystal-clear, unblurred transparent window over the spotlighted feature -->
      <svg 
        class="fixed inset-0 w-full h-full z-10 pointer-events-auto transition-opacity duration-300"
        @click="skipTour"
      >
        <defs>
          <mask id="tour-spotlight-mask">
            <!-- White reveals the dimmed background -->
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            <!-- Black punches a 100% transparent hole with rounded corners so the feature is crystal clear -->
            <rect 
              v-if="hasTarget && targetBox"
              :x="targetBox.left - 8"
              :y="targetBox.top - 8"
              :width="targetBox.width + 16"
              :height="targetBox.height + 16"
              rx="16"
              ry="16"
              fill="black"
            />
          </mask>
        </defs>

        <!-- Dimmed backdrop with light, soft 38% opacity (NO blur!) -->
        <rect 
          x="0" 
          y="0" 
          width="100%" 
          height="100%" 
          fill="rgba(15, 23, 42, 0.38)" 
          mask="url(#tour-spotlight-mask)" 
        />
      </svg>

      <!-- Crisp Spotlight Boundary Frame (Around target element) -->
      <div 
        v-if="hasTarget && targetBox"
        class="fixed transition-all duration-300 ease-out pointer-events-none rounded-2xl ring-2 ring-primary ring-offset-2 ring-offset-transparent shadow-xl z-15"
        :style="{
          top: `${targetBox.top - 8}px`,
          left: `${targetBox.left - 8}px`,
          width: `${targetBox.width + 16}px`,
          height: `${targetBox.height + 16}px`
        }"
      >
        <!-- Subtle pulsing accent border -->
        <div class="absolute inset-0 rounded-2xl border-2 border-primary/90"></div>
      </div>

      <!-- Floating Card (Anchored to Target or Centered) -->
      <div 
        ref="cardRef"
        class="fixed z-20 transition-all duration-300 ease-out pointer-events-auto"
        :style="cardStyle"
      >
        <div class="w-[92vw] sm:w-[440px] max-w-[460px] bg-surface-container-lowest border border-outline-variant/90 rounded-2xl shadow-2xl p-5 sm:p-6 flex flex-col gap-4 relative overflow-hidden">
          <!-- Top Accent Gradient Line -->
          <div class="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-emerald-500 to-indigo-500"></div>

          <!-- Header: Category Badge & Step Counter -->
          <div class="flex items-center justify-between pt-1">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shadow-inner">
                <component :is="resolvedIcon" class="w-4 h-4 stroke-[2.2px]" />
              </div>
              <span class="text-[11px] font-mono font-black uppercase tracking-wider text-primary px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20">
                {{ $t(currentStep.badgeKey) }}
              </span>
            </div>

            <div class="flex items-center gap-2">
              <span class="text-xs font-mono font-bold text-on-surface-variant">
                {{ $t('tour.stepOf', { current: currentStepIndex + 1, total: totalSteps }) }}
              </span>
              <button 
                @click="skipTour"
                class="text-outline hover:text-on-surface p-1 rounded-lg hover:bg-surface-container transition-colors cursor-pointer"
                :title="$t('tour.skipTour')"
              >
                <X class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- Body: Title and Description -->
          <div class="space-y-2">
            <h3 class="text-lg font-black text-on-surface tracking-tight leading-snug">
              {{ $t(currentStep.titleKey) }}
            </h3>
            <p class="text-xs sm:text-sm text-on-surface-variant leading-relaxed font-normal">
              {{ $t(currentStep.descKey) }}
            </p>
          </div>

          <!-- Tab switch indicator badge if step switched tabs -->
          <div 
            v-if="currentStep.tab" 
            class="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-surface-container border border-outline-variant/40 text-[11px] font-mono text-on-surface-variant"
          >
            <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Tab: <strong class="text-on-surface font-bold capitalize">{{ currentStep.tab }}</strong></span>
          </div>

          <!-- Step Dots Navigation -->
          <div class="flex items-center justify-center gap-1.5 py-1">
            <button
              v-for="(_, index) in totalSteps"
              :key="index"
              @click="jumpToStep(index)"
              class="transition-all rounded-full cursor-pointer"
              :class="index === currentStepIndex 
                ? 'w-6 h-2 bg-primary' 
                : 'w-2 h-2 bg-outline-variant/60 hover:bg-outline'"
              :title="`Step ${index + 1}`"
            ></button>
          </div>

          <!-- Footer Actions -->
          <div class="flex items-center justify-between pt-2 border-t border-outline-variant/50">
            <button 
              @click="skipTour"
              class="text-xs font-bold text-on-surface-variant/80 hover:text-on-surface transition-colors cursor-pointer py-2 px-1"
            >
              {{ $t('tour.skipTour') }}
            </button>

            <div class="flex items-center gap-2">
              <button 
                v-if="!isFirstStep"
                @click="prevStep"
                class="px-3.5 py-2 rounded-xl text-xs font-bold text-on-surface-variant hover:bg-surface-container border border-outline-variant/60 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <ChevronLeft class="w-4 h-4" />
                <span>{{ $t('tour.previous') }}</span>
              </button>

              <!-- If last step in dashboard, offer Explore Settings option -->
              <button 
                v-if="isLastStep && activeTourType === 'dashboard'"
                @click="navigateToSettingsTour"
                class="px-3 py-2 rounded-xl text-xs font-bold bg-secondary/15 text-secondary border border-secondary/30 hover:bg-secondary/25 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Sliders class="w-3.5 h-3.5" />
                <span>{{ $t('tour.exploreSettings') }}</span>
              </button>

              <button 
                @click="nextStep"
                class="px-4 py-2 rounded-xl text-xs font-bold bg-primary text-on-primary hover:bg-opacity-90 active:scale-95 shadow-md shadow-primary/20 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>{{ isLastStep ? $t('tour.finish') : $t('tour.next') }}</span>
                <ChevronRight v-if="!isLastStep" class="w-4 h-4" />
                <Check v-else class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import { useAppTour } from '../../composables/useAppTour';
import { 
  Sparkles, 
  Activity, 
  Calendar, 
  TrendingUp, 
  LayoutDashboard, 
  HandCoins, 
  Boxes, 
  CheckCircle2, 
  Sliders, 
  Store, 
  Globe, 
  Landmark, 
  Printer, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Check 
} from 'lucide-vue-next';

const iconMap: Record<string, any> = {
  Sparkles,
  Activity,
  Calendar,
  TrendingUp,
  LayoutDashboard,
  HandCoins,
  Boxes,
  CheckCircle2,
  Sliders,
  Store,
  Globe,
  Landmark,
  Printer
};

const route = useRoute();
const { 
  isTourActive, 
  currentStepIndex, 
  activeTourType, 
  currentStep, 
  totalSteps, 
  isFirstStep, 
  isLastStep, 
  isStoreAdminOrManager,
  nextStep, 
  prevStep, 
  jumpToStep, 
  skipTour, 
  finishTour,
  navigateToSettingsTour
} = useAppTour();

const cardRef = ref<HTMLElement | null>(null);
const targetBox = ref<{ top: number; left: number; width: number; height: number } | null>(null);

const isAllowedRoute = computed(() => {
  return route.path === '/dashboard' || route.path.startsWith('/dashboard') ||
         route.path === '/settings' || route.path.startsWith('/settings');
});

const hasTarget = computed(() => {
  return !!currentStep.value?.target;
});

const resolvedIcon = computed(() => {
  if (!currentStep.value) return Sparkles;
  return iconMap[currentStep.value.iconName] || Sparkles;
});

const updateTargetRect = async () => {
  if (!isTourActive.value || !currentStep.value) {
    targetBox.value = null;
    return;
  }

  if (!currentStep.value.target) {
    targetBox.value = null;
    return;
  }

  await nextTick();

  // Retry lookup a few times to allow DOM transitions or tab switching to finish rendering
  let attempts = 0;
  const findElement = () => {
    if (!currentStep.value?.target) return;
    const el = document.querySelector(currentStep.value.target);
    if (el) {
      const rect = el.getBoundingClientRect();
      targetBox.value = {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height
      };
      
      // Auto-scroll element into view smoothly if not in viewport
      const isInViewport = (
        rect.top >= 80 &&
        rect.bottom <= (window.innerHeight - 100)
      );

      if (!isInViewport) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => {
          const updatedRect = el.getBoundingClientRect();
          targetBox.value = {
            top: updatedRect.top,
            left: updatedRect.left,
            width: updatedRect.width,
            height: updatedRect.height
          };
        }, 350);
      }
    } else if (attempts < 6) {
      attempts++;
      setTimeout(findElement, 100);
    } else {
      targetBox.value = null;
    }
  };

  findElement();
};

// Calculate tooltip positioning
const cardStyle = computed(() => {
  const isMobile = window.innerWidth < 640;
  const cardWidth = isMobile ? window.innerWidth * 0.92 : 440;
  const cardHeight = 260; // Estimated height

  if (!hasTarget.value || !targetBox.value || currentStep.value?.placement === 'center') {
    return {
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)'
    };
  }

  const box = targetBox.value;
  const placement = currentStep.value?.placement || 'bottom';
  let top = 0;
  let left = 0;

  if (placement === 'bottom') {
    top = box.top + box.height + 16;
    left = box.left + (box.width / 2) - (cardWidth / 2);

    // If bottom clips off screen, flip to top
    if (top + cardHeight > window.innerHeight - 20) {
      top = Math.max(20, box.top - cardHeight - 16);
    }
  } else if (placement === 'top') {
    top = box.top - cardHeight - 16;
    left = box.left + (box.width / 2) - (cardWidth / 2);

    // If top clips off screen, flip to bottom
    if (top < 20) {
      top = box.top + box.height + 16;
    }
  } else if (placement === 'right') {
    left = box.left + box.width + 16;
    top = box.top + (box.height / 2) - (cardHeight / 2);

    // If right clips off screen, flip to bottom
    if (left + cardWidth > window.innerWidth - 20) {
      left = Math.max(16, box.left);
      top = box.top + box.height + 16;
    }
  } else if (placement === 'left') {
    left = box.left - cardWidth - 16;
    top = box.top + (box.height / 2) - (cardHeight / 2);

    // If left clips off screen, flip to bottom
    if (left < 20) {
      left = Math.max(16, box.left);
      top = box.top + box.height + 16;
    }
  }

  // Constrain horizontally within window
  left = Math.max(16, Math.min(window.innerWidth - cardWidth - 16, left));
  // Constrain vertically within window
  top = Math.max(20, Math.min(window.innerHeight - cardHeight - 20, top));

  return {
    top: `${top}px`,
    left: `${left}px`
  };
});

// Watch for step changes and tour toggle
watch([isTourActive, currentStepIndex], () => {
  if (isTourActive.value) {
    setTimeout(updateTargetRect, 80);
  }
});

// Watch route changes: close tour if user navigates away from allowed views
watch(() => route.path, (newPath) => {
  if (!isAllowedRoute.value && isTourActive.value) {
    skipTour();
  }
});

// Keyboard controls (ArrowRight = next, ArrowLeft = back, Esc = skip)
const handleKeydown = (e: KeyboardEvent) => {
  if (!isTourActive.value) return;

  if (e.key === 'Escape') {
    skipTour();
  } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
    nextStep();
  } else if (e.key === 'ArrowLeft') {
    prevStep();
  }
};

const handleWindowEvents = () => {
  if (isTourActive.value) {
    updateTargetRect();
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
  window.addEventListener('resize', handleWindowEvents);
  window.addEventListener('scroll', handleWindowEvents, true);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
  window.removeEventListener('resize', handleWindowEvents);
  window.removeEventListener('scroll', handleWindowEvents, true);
});
</script>
