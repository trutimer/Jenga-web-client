import { ref, watch, onUnmounted, computed, type Ref, type ComputedRef } from 'vue';
import { formatCurrency } from '../models/mockData';

export interface AnimatedNumberOptions {
  duration?: number; // Duration in milliseconds (default: 750)
  easing?: (t: number) => number;
}

/**
 * Exponential Ease-Out curve for snappy, natural decelerating animations
 */
function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

/**
 * Animates any numeric value smoothly across real-time updates at 60/120fps.
 *
 * @param source Getter function returning the target number
 * @param options Animation duration and easing function
 * @returns Ref<number> that animates smoothly toward the target value
 */
export function useAnimatedNumber(
  source: () => number,
  options: AnimatedNumberOptions = {}
): Ref<number> {
  const duration = options.duration ?? 750;
  const easing = options.easing ?? easeOutExpo;

  const current = ref<number>(Number(source()) || 0);
  let animationFrameId: number | null = null;
  let isFirstRun = true;

  watch(
    source,
    (newVal) => {
      const target = Number(newVal) || 0;
      const start = current.value;

      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }

      // If initial value or unchanged, set immediately without sluggish delay
      if (isFirstRun) {
        isFirstRun = false;
        if (start === 0 && target !== 0) {
          // Animate initial load smoothly
        } else {
          current.value = target;
          return;
        }
      }

      if (start === target || duration <= 0) {
        current.value = target;
        return;
      }

      const startTime = performance.now();

      const tick = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = easing(progress);

        current.value = start + (target - start) * eased;

        if (progress < 1) {
          animationFrameId = requestAnimationFrame(tick);
        } else {
          current.value = target;
          animationFrameId = null;
        }
      };

      animationFrameId = requestAnimationFrame(tick);
    },
    { immediate: true }
  );

  onUnmounted(() => {
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
  });

  return current;
}

/**
 * Returns a computed formatted currency string that smoothly counts up/down.
 */
export function useAnimatedCurrency(
  source: () => number,
  currencySource: Ref<string> | (() => string),
  options: AnimatedNumberOptions = {}
): ComputedRef<string> {
  const animatedNumber = useAnimatedNumber(source, options);
  return computed(() => {
    const curr = (typeof currencySource === 'function' ? currencySource() : currencySource.value) as 'TZS' | 'USD' | 'EUR';
    return formatCurrency(Math.round(animatedNumber.value), curr);
  });
}
