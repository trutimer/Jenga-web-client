<template>
  <div
    :class="[
      'font-sans flex select-none transition-all duration-300',
      fullScreen ? 'fixed inset-0 z-50 bg-surface/85 backdrop-blur-md flex-col items-center justify-center p-6' : '',
      overlay ? 'absolute inset-0 z-30 bg-surface-container-lowest/80 backdrop-blur-xs flex-col items-center justify-center p-6 rounded-xl' : '',
      !fullScreen && !overlay && compact ? 'inline-flex items-center gap-2' : '',
      !fullScreen && !overlay && !compact ? 'flex-col items-center justify-center p-4' : ''
    ]"
  >
    <!-- Outer Graphic Wrapper with Ambient Radial Glow -->
    <div class="relative flex items-center justify-center shrink-0">
      <!-- Background Ambient Radial Glow -->
      <div 
        class="absolute rounded-full bg-primary/20 animate-jenga-glow pointer-events-none"
        :style="{
          width: `${graphicDimensions * 1.3}px`,
          height: `${graphicDimensions * 1.3}px`
        }"
      />

      <!-- Jenga SVG Graphic -->
      <svg
        :width="graphicDimensions"
        :height="graphicDimensions"
        viewBox="0 0 512 512"
        xmlns="http://www.w3.org/2000/svg"
        class="relative z-10 overflow-visible drop-shadow-md"
      >
        <defs>
          <linearGradient id="jengaOrangeTop" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FF7A1A" />
            <stop offset="100%" stop-color="#F4511E" />
          </linearGradient>
          <linearGradient id="jengaOrangeMid" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FFB347" />
            <stop offset="100%" stop-color="#FF8C1A" />
          </linearGradient>
          <linearGradient id="jengaDark" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#223446" />
            <stop offset="100%" stop-color="#122131" />
          </linearGradient>
          <linearGradient id="jengaShimmer" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="rgba(255,255,255,0)" />
            <stop offset="50%" stop-color="rgba(255,255,255,0.4)" />
            <stop offset="100%" stop-color="rgba(255,255,255,0)" />
          </linearGradient>
        </defs>

        <!-- Base Ground Shadow Ellipse -->
        <ellipse
          cx="250"
          cy="425"
          rx="120"
          ry="22"
          fill="#122131"
          class="animate-jenga-shadow"
        />

        <!-- Bottom Block (Dark Navy Base) -->
        <g class="animate-jenga-base">
          <polygon
            points="170,360 250,400 330,360 330,255 250,220 250,320 210,340 170,320"
            fill="url(#jengaDark)"
            stroke="#2C435A"
            stroke-width="2"
            stroke-linejoin="round"
          />
        </g>

        <!-- Left Arm Block (Middle Orange) -->
        <g class="animate-jenga-arm">
          <polygon
            points="90,240 170,205 170,280 90,315"
            fill="url(#jengaOrangeMid)"
            stroke="#FFB347"
            stroke-width="1.5"
            stroke-linejoin="round"
          />
        </g>

        <!-- Middle Block (Middle Orange) -->
        <g class="animate-jenga-mid">
          <polygon
            points="250,220 330,255 330,180 250,145 250,220"
            fill="url(#jengaOrangeMid)"
            stroke="#FFD180"
            stroke-width="1.5"
            stroke-linejoin="round"
          />
        </g>

        <!-- Top Block (Bright Orange Top) -->
        <g class="animate-jenga-top">
          <polygon
            points="170,145 250,105 330,145 330,70 250,30 170,70"
            fill="url(#jengaOrangeTop)"
            stroke="#FFA726"
            stroke-width="2"
            stroke-linejoin="round"
          />
        </g>
      </svg>
    </div>

    <!-- Text Labels Area -->
    <div
      v-if="label || sublabel"
      :class="[
        'flex flex-col text-center animate-fade-up',
        compact ? 'items-start text-left' : 'items-center mt-3.5 space-y-1'
      ]"
    >
      <div v-if="label" class="flex items-center gap-1.5 font-bold text-on-surface tracking-tight text-sm md:text-base">
        <span>{{ label }}</span>
        <!-- Animated Dot Wave -->
        <span class="inline-flex items-center gap-0.5 text-primary">
          <span class="animate-pulse duration-700">.</span>
          <span class="animate-pulse duration-700 delay-150">.</span>
          <span class="animate-pulse duration-700 delay-300">.</span>
        </span>
      </div>

      <p v-if="sublabel" class="text-xs text-on-surface-variant max-w-xs font-medium leading-relaxed">
        {{ sublabel }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    size?: 'sm' | 'md' | 'lg' | 'xl' | number;
    label?: string;
    sublabel?: string;
    overlay?: boolean;
    fullScreen?: boolean;
    compact?: boolean;
  }>(),
  {
    size: 'md',
    label: undefined,
    sublabel: undefined,
    overlay: false,
    fullScreen: false,
    compact: false,
  }
);

const graphicDimensions = computed(() => {
  if (typeof props.size === 'number') {
    return props.size;
  }
  switch (props.size) {
    case 'sm':
      return 36;
    case 'md':
      return 64;
    case 'lg':
      return 96;
    case 'xl':
      return 128;
    default:
      return 64;
  }
});
</script>
