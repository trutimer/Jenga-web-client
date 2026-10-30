<template>
  <div v-if="isOpen" class="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in font-sans">
    <div class="bg-surface-container-lowest rounded-3xl border border-outline-variant/80 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animate-scale-up relative">
      
      <!-- Top Close Button -->
      <button 
        type="button"
        @click="handleClose" 
        class="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-surface-container-high/70 hover:bg-surface-container-highest text-on-surface-variant flex items-center justify-center transition-colors cursor-pointer border-0"
        title="Close"
      >
        <X class="w-4 h-4" />
      </button>

      <!-- 1. VEHICLE ANIMATION STAGE -->
      <div class="relative w-full h-52 bg-gradient-to-b from-[#0B132B] via-[#1C2541] to-[#111827] overflow-hidden flex flex-col justify-end select-none">
        
        <!-- Ambient highway glow & corridor banner -->
        <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(244,81,30,0.18),transparent_70%)] pointer-events-none"></div>
        <div class="absolute top-3 left-6 flex items-center gap-2 text-[10px] font-mono tracking-widest text-primary/90 uppercase font-bold">
          <span class="w-2 h-2 rounded-full bg-primary animate-ping"></span>
          <span>{{ mode === 'dispatch' ? 'Logistics Highway • In-Transit' : 'Destination Warehouse • Arrived' }}</span>
        </div>

        <!-- Speed streaks (only active in dispatch mode) -->
        <div v-if="mode === 'dispatch'" class="absolute inset-0 pointer-events-none overflow-hidden opacity-35">
          <div class="speed-line speed-line-1"></div>
          <div class="speed-line speed-line-2"></div>
          <div class="speed-line speed-line-3"></div>
        </div>

        <!-- Destination Landmark Pillar (Receive mode: Truck stops here) -->
        <div v-if="mode === 'receive'" class="absolute right-5 bottom-8 z-10 flex flex-col items-center animate-fade-in">
          <div class="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/25 animate-pulse">
            <CheckCircle2 class="w-5 h-5" />
          </div>
          <div class="w-1 h-8 bg-emerald-500/40 rounded-full mt-1"></div>
          <span class="text-[9px] font-mono font-bold text-emerald-400 uppercase tracking-widest mt-0.5">STORE</span>
        </div>

        <!-- THE JENGA DELIVERY TRUCK -->
        <div 
          class="relative z-10 w-full flex justify-center pb-1 transition-all"
          :class="mode === 'dispatch' ? 'truck-dispatch-container' : 'truck-receive-container'"
        >
          <!-- Truck Suspension & Vibration Wrapper -->
          <div :class="mode === 'dispatch' ? 'truck-cruising' : 'truck-stopping'">
            <svg class="w-80 sm:w-96 h-auto overflow-visible drop-shadow-2xl" viewBox="0 0 350 115" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <!-- Jenga Orange Cab Gradient -->
                <linearGradient id="truckOrangeGrad" x1="220" y1="20" x2="310" y2="80" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stop-color="#FF7A1A" />
                  <stop offset="60%" stop-color="#F4511E" />
                  <stop offset="100%" stop-color="#D84315" />
                </linearGradient>

                <!-- Cargo Container Body Gradient -->
                <linearGradient id="containerGrad" x1="30" y1="12" x2="225" y2="76" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stop-color="#FFFFFF" />
                  <stop offset="60%" stop-color="#F8FAFC" />
                  <stop offset="100%" stop-color="#E2E8F0" />
                </linearGradient>

                <!-- Windshield Tint -->
                <linearGradient id="truckGlassGrad" x1="250" y1="28" x2="295" y2="56" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stop-color="#1E293B" />
                  <stop offset="100%" stop-color="#0F172A" />
                </linearGradient>

                <!-- Headlight Soft Forward Beam -->
                <linearGradient id="truckLightBeam" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stop-color="#FEF08A" stop-opacity="0.6" />
                  <stop offset="45%" stop-color="#FEF08A" stop-opacity="0.2" />
                  <stop offset="100%" stop-color="#FEF08A" stop-opacity="0" />
                </linearGradient>
              </defs>

              <!-- Forward Light Beam projecting from headlights onto road -->
              <polygon points="314,64 470,36 470,110 314,75" fill="url(#truckLightBeam)" />

              <!-- Undercarriage Chassis Frame & Components -->
              <rect x="35" y="74" width="270" height="8" rx="2" fill="#1E293B" />
              <!-- Battery Box & Fuel Tank between wheels -->
              <rect x="125" y="74" width="55" height="11" rx="3" fill="#334155" stroke="#1E293B" stroke-width="1" />
              <line x1="143" y1="74" x2="143" y2="85" stroke="#64748B" stroke-width="1.5" />
              <line x1="162" y1="74" x2="162" y2="85" stroke="#64748B" stroke-width="1.5" />
              <!-- Mudflaps behind rear wheel -->
              <rect x="66" y="76" width="3.5" height="16" rx="1" fill="#0F172A" />

              <!-- CARGO BOX (Container) -->
              <!-- Main box body -->
              <rect x="36" y="14" width="188" height="62" rx="4" fill="url(#containerGrad)" stroke="#94A3B8" stroke-width="1.5" />
              
              <!-- Container corrugated vertical panel stripes -->
              <line x1="68" y1="14" x2="68" y2="76" stroke="#E2E8F0" stroke-width="1.5" />
              <line x1="100" y1="14" x2="100" y2="76" stroke="#E2E8F0" stroke-width="1.5" />
              <line x1="132" y1="14" x2="132" y2="76" stroke="#E2E8F0" stroke-width="1.5" />
              <line x1="164" y1="14" x2="164" y2="76" stroke="#E2E8F0" stroke-width="1.5" />
              <line x1="196" y1="14" x2="196" y2="76" stroke="#E2E8F0" stroke-width="1.5" />

              <!-- Container top & bottom heavy-duty aluminum border trim -->
              <rect x="36" y="14" width="188" height="4" fill="#CBD5E1" />
              <rect x="36" y="72" width="188" height="4" fill="#94A3B8" />

              <!-- Container Rear Rollup Door Locking Bar & Hinges -->
              <line x1="39" y1="16" x2="39" y2="74" stroke="#64748B" stroke-width="2" />
              <rect x="36" y="24" width="4" height="4" fill="#475569" />
              <rect x="36" y="62" width="4" height="4" fill="#475569" />

              <!-- Container Rear Red Taillight -->
              <rect 
                x="34" 
                y="64" 
                width="3" 
                height="10" 
                rx="1" 
                fill="#EF4444" 
                :class="mode === 'receive' ? 'brake-light-active' : ''" 
              />

              <!-- Jenga Branding on Cargo Box -->
              <g transform="translate(60, 26)">
                <!-- Jenga Official Logo Image -->
                <image href="/logo.svg" x="0" y="4" width="30" height="30" />

                <!-- Prominent Typography -->
                <text x="36" y="20" fill="#F4511E" font-size="14" font-family="system-ui, -apple-system, sans-serif" font-weight="900" letter-spacing="1.5">
                  JENGA
                </text>
                <text x="36" y="31" fill="#1E293B" font-size="7.5" font-family="system-ui, -apple-system, sans-serif" font-weight="800" letter-spacing="1">
                  EXPRESS DELIVERY
                </text>
              </g>

              <!-- CAB (Driver Front Cabin) -->
              <!-- Aerodynamic Roof Fairing / Deflector (seamlessly matches container height) -->
              <path d="M 224 14 L 224 28 L 260 28 Z" fill="url(#truckOrangeGrad)" />

              <!-- Cab Body Outline -->
              <path 
                d="M 224 28 
                   L 262 28 
                   Q 275 28 285 38 
                   L 302 54 
                   Q 308 60 308 66 
                   L 308 76 
                   L 224 76 Z" 
                fill="url(#truckOrangeGrad)" 
              />

              <!-- Cab Windshield & Side Window -->
              <path 
                d="M 235 34 
                   L 262 34 
                   Q 272 34 280 42 
                   L 294 54 
                   Q 296 56 292 56 
                   L 235 56 Z" 
                fill="url(#truckGlassGrad)" 
                stroke="#122131" 
                stroke-width="1.5" 
              />

              <!-- Windshield Window Reflection -->
              <polygon points="242,36 260,36 248,54 242,54" fill="white" opacity="0.16" />

              <!-- Driver Silhouette -->
              <circle cx="260" cy="44" r="5" fill="#475569" opacity="0.85" />
              <path d="M 253 54 Q 260 48 267 54 L 267 56 L 253 56 Z" fill="#334155" opacity="0.85" />

              <!-- Side Door Seam Line & Chrome Handle -->
              <line x1="233" y1="34" x2="233" y2="74" stroke="#D84315" stroke-width="1.5" />
              <rect x="238" y="59" width="6" height="2" rx="0.5" fill="#FFFFFF" />

              <!-- Side-view Mirror -->
              <rect x="296" y="44" width="3" height="12" rx="1" fill="#1E293B" />
              <line x1="290" y1="48" x2="296" y2="48" stroke="#1E293B" stroke-width="1.5" />

              <!-- Front Radiator Grille -->
              <rect x="302" y="60" width="6" height="12" rx="1.5" fill="#1E293B" />
              <line x1="303" y1="63" x2="307" y2="63" stroke="#64748B" stroke-width="1" />
              <line x1="303" y1="66" x2="307" y2="66" stroke="#64748B" stroke-width="1" />
              <line x1="303" y1="69" x2="307" y2="69" stroke="#64748B" stroke-width="1" />

              <!-- Front Headlight LED Cluster -->
              <rect x="304" y="60" width="5" height="6" rx="1" fill="#FEF08A" />
              <circle cx="306.5" cy="63" r="1.5" fill="white" />

              <!-- Front Bumper -->
              <rect x="304" y="72" width="7" height="6" rx="1.5" fill="#0F172A" />

              <!-- Curved Wheel Well Arches -->
              <path d="M 68 80 A 18 18 0 0 1 106 80 Z" fill="#0B132B" />
              <path d="M 248 80 A 18 18 0 0 1 286 80 Z" fill="#0B132B" />

              <!-- REAR WHEEL: Firmly placed at center (87, 82) -->
              <g transform="translate(87, 82)">
                <!-- Outer Rubber Tire -->
                <circle cx="0" cy="0" r="15" fill="#1E293B" stroke="#0F172A" stroke-width="2.5" />
                <!-- Alloy Rim Base -->
                <circle cx="0" cy="0" r="9.5" fill="#CBD5E1" />
                
                <!-- Rotating Alloy Rim Spokes (Native SVG Transform = 100% stable in all browsers) -->
                <g>
                  <animateTransform 
                    v-if="mode === 'dispatch'"
                    attributeName="transform" 
                    type="rotate" 
                    from="0" 
                    to="360" 
                    dur="0.35s" 
                    repeatCount="indefinite" 
                  />
                  <animateTransform 
                    v-else
                    attributeName="transform" 
                    type="rotate" 
                    from="0" 
                    to="1080" 
                    dur="1.5s" 
                    repeatCount="1" 
                    fill="freeze"
                    calcMode="spline"
                    keyTimes="0; 1"
                    keySplines="0.16 1 0.3 1"
                  />
                  <!-- 4-Spoke Alloy Pattern -->
                  <line x1="0" y1="-8.5" x2="0" y2="8.5" stroke="#334155" stroke-width="2" />
                  <line x1="-8.5" y1="0" x2="8.5" y2="0" stroke="#334155" stroke-width="2" />
                  <line x1="-6" y1="-6" x2="6" y2="6" stroke="#475569" stroke-width="1.5" />
                  <line x1="-6" y1="6" x2="6" y2="-6" stroke="#475569" stroke-width="1.5" />
                  <!-- Hub Center -->
                  <circle cx="0" cy="0" r="3.5" fill="#F4511E" />
                </g>
              </g>

              <!-- FRONT WHEEL: Firmly placed at center (267, 82) -->
              <g transform="translate(267, 82)">
                <!-- Outer Rubber Tire -->
                <circle cx="0" cy="0" r="15" fill="#1E293B" stroke="#0F172A" stroke-width="2.5" />
                <!-- Alloy Rim Base -->
                <circle cx="0" cy="0" r="9.5" fill="#CBD5E1" />
                
                <!-- Rotating Alloy Rim Spokes (Native SVG Transform = 100% stable in all browsers) -->
                <g>
                  <animateTransform 
                    v-if="mode === 'dispatch'"
                    attributeName="transform" 
                    type="rotate" 
                    from="0" 
                    to="360" 
                    dur="0.35s" 
                    repeatCount="indefinite" 
                  />
                  <animateTransform 
                    v-else
                    attributeName="transform" 
                    type="rotate" 
                    from="0" 
                    to="1080" 
                    dur="1.5s" 
                    repeatCount="1" 
                    fill="freeze"
                    calcMode="spline"
                    keyTimes="0; 1"
                    keySplines="0.16 1 0.3 1"
                  />
                  <!-- 4-Spoke Alloy Pattern -->
                  <line x1="0" y1="-8.5" x2="0" y2="8.5" stroke="#334155" stroke-width="2" />
                  <line x1="-8.5" y1="0" x2="8.5" y2="0" stroke="#334155" stroke-width="2" />
                  <line x1="-6" y1="-6" x2="6" y2="6" stroke="#475569" stroke-width="1.5" />
                  <line x1="-6" y1="6" x2="6" y2="-6" stroke="#475569" stroke-width="1.5" />
                  <!-- Hub Center -->
                  <circle cx="0" cy="0" r="3.5" fill="#F4511E" />
                </g>
              </g>
            </svg>
          </div>
        </div>

        <!-- HIGHWAY / ROAD PAVEMENT -->
        <div class="relative w-full h-7 bg-[#182230] border-t-2 border-[#334155] flex items-center overflow-hidden">
          <!-- Scrolling Road Markings -->
          <div 
            class="w-[200%] h-1 road-markings"
            :class="mode === 'dispatch' ? 'road-moving-fast' : 'road-coming-to-stop'"
          ></div>
        </div>
      </div>

      <!-- 2. DIALOG BODY: STATUS & TRANSFER DETAILS -->
      <div class="p-6 sm:p-7 flex flex-col gap-5">
        
        <!-- Header & Badges -->
        <div class="flex flex-col items-center text-center space-y-2">
          <!-- Status Pill -->
          <span 
            class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider shadow-xs"
            :class="mode === 'dispatch' 
              ? 'bg-amber-500/10 text-amber-700 border border-amber-500/30' 
              : isPartialReceive
                ? 'bg-purple-500/10 text-purple-700 border border-purple-500/30'
                : 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/30'"
          >
            <Clock v-if="mode === 'dispatch'" class="w-3.5 h-3.5 animate-spin" />
            <CheckCircle2 v-else class="w-3.5 h-3.5" :class="isPartialReceive ? 'text-purple-600' : 'text-emerald-600'" />
            <span>
              {{ mode === 'dispatch' ? 'Dispatched • In-Transit' : isPartialReceive ? 'Partially Received • Remainder In-Transit' : 'Delivered & Confirmed' }}
            </span>
          </span>

          <!-- Title -->
          <h3 class="text-2xl font-black text-on-surface tracking-tight leading-tight">
            {{ mode === 'dispatch' ? 'Stock Dispatched Successfully!' : isPartialReceive ? 'Partial Stock Received!' : 'Stock Received & Confirmed!' }}
          </h3>

          <!-- Subtitle / Context -->
          <p class="text-xs sm:text-sm text-on-surface-variant max-w-sm leading-relaxed">
            <template v-if="mode === 'dispatch'">
              Transfer <strong class="text-on-surface">{{ transfer?.transferNumber || 'ST-LOG' }}</strong> has departed and is currently in transit.
            </template>
            <template v-else-if="isPartialReceive">
              Confirmed items from transfer <strong class="text-on-surface">{{ transfer?.transferNumber || 'ST-LOG' }}</strong> have been added to destination stock. Unreceived items remain in transit.
            </template>
            <template v-else>
              Transfer <strong class="text-on-surface">{{ transfer?.transferNumber || 'ST-LOG' }}</strong> has arrived safely and is now recorded in destination inventory.
            </template>
          </p>
        </div>

        <!-- Route & Inventory Card -->
        <div v-if="transfer" class="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/70 space-y-3">
          <!-- Route path -->
          <div class="flex items-center justify-between text-xs font-semibold gap-2">
            <div class="flex items-center gap-1.5 text-on-surface truncate min-w-0">
              <Warehouse class="w-4 h-4 text-primary shrink-0" />
              <span class="truncate">{{ transfer.sourceLocationName || 'Origin Warehouse' }}</span>
            </div>
            <ArrowRight class="w-4 h-4 text-outline shrink-0" />
            <div class="flex items-center gap-1.5 text-emerald-700 font-bold truncate min-w-0">
              <Store class="w-4 h-4 shrink-0" />
              <span class="truncate">{{ transfer.destinationLocationName || 'Destination Store' }}</span>
            </div>
          </div>

          <!-- Manifest Metrics -->
          <div class="pt-2.5 border-t border-outline-variant/50 flex items-center justify-between text-xs font-mono">
            <span class="text-on-surface-variant font-medium">
              {{ transfer.items?.length || 1 }} line item(s) transferred
            </span>
            <span class="font-bold text-primary">
              TZS {{ (isPartialReceive ? (transfer.receivedCostValue ?? transfer.totalCostValue ?? 0) : (transfer.totalCostValue || 0)).toLocaleString() }}
            </span>
          </div>
          <div
            v-if="isPartialReceive && transfer.remainingCostValue !== undefined"
            class="flex items-center justify-between text-[11px] font-mono text-purple-700"
          >
            <span>Remaining in transit:</span>
            <span class="font-bold">TZS {{ transfer.remainingCostValue.toLocaleString() }}</span>
          </div>
        </div>

        <!-- 3. ACTIONS: USER CONTROLS ("OK" / "CLOSE") -->
        <div class="flex items-center justify-center pt-1">
          <button 
            type="button"
            @click="handleClose"
            class="w-full sm:w-auto min-w-[200px] h-12 px-6 bg-primary text-white rounded-xl font-bold hover:bg-opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/25 cursor-pointer border-0 text-sm"
          >
            <Check class="w-4 h-4 stroke-[2.5]" />
            <span>OK, Got It</span>
          </button>
        </div>

      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { 
  X, 
  Check, 
  CheckCircle2, 
  Clock, 
  Warehouse, 
  Store, 
  ArrowRight 
} from 'lucide-vue-next';
import type { StockTransfer } from '../../models/types';

const props = defineProps<{
  isOpen: boolean;
  mode: 'dispatch' | 'receive';
  transfer?: StockTransfer | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const isPartialReceive = computed(
  () => props.mode === 'receive' && props.transfer?.status === 'PARTIALLY_RECEIVED'
);

const handleClose = () => {
  emit('close');
};
</script>

<style scoped>
/* 1. DISPATCH MODE: Truck accelerates onto highway & stays in steady cruising motion */
.truck-dispatch-container {
  animation: truckDepartEntry 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
}

@keyframes truckDepartEntry {
  0% {
    transform: translateX(-120px) scale(0.96);
    opacity: 0.6;
  }
  60% {
    transform: translateX(10px) scale(1);
    opacity: 1;
  }
  100% {
    transform: translateX(0px) scale(1);
    opacity: 1;
  }
}

/* Highway driving chassis vibration/micro-bounce */
.truck-cruising {
  animation: truckDriveSuspension 0.4s ease-in-out infinite alternate;
}

@keyframes truckDriveSuspension {
  0% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-1.5px) rotate(0.15deg);
  }
  100% {
    transform: translateY(0.5px) rotate(-0.1deg);
  }
}

/* 2. RECEIVE MODE: Truck glides in and decelerates smoothly to destination */
.truck-receive-container {
  animation: truckArrivalBraking 1.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes truckArrivalBraking {
  0% {
    transform: translateX(-160px);
  }
  65% {
    transform: translateX(8px);
  }
  85% {
    transform: translateX(-2px);
  }
  100% {
    transform: translateX(0px);
  }
}

/* Chassis brake nose dip then level out */
.truck-stopping {
  animation: truckBrakeDip 1.5s cubic-bezier(0.16, 1, 0.3, 1) forwards, truckIdle 2s ease-in-out 1.5s infinite alternate;
}

@keyframes truckBrakeDip {
  0% {
    transform: rotate(0deg) translateY(0);
  }
  30% {
    transform: rotate(0.8deg) translateY(1.2px);
  }
  75% {
    transform: rotate(-0.3deg) translateY(-0.4px);
  }
  100% {
    transform: rotate(0deg) translateY(0);
  }
}

@keyframes truckIdle {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(-0.6px);
  }
}

/* 3. ROAD DASHES ANIMATION */
.road-markings {
  background-image: repeating-linear-gradient(
    90deg,
    #ffffff 0px,
    #ffffff 22px,
    transparent 22px,
    transparent 44px
  );
}

.road-moving-fast {
  animation: roadScroll 0.4s linear infinite;
}

@keyframes roadScroll {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-44px);
  }
}

.road-coming-to-stop {
  animation: roadDecelerate 1.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes roadDecelerate {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-176px);
  }
}

/* 4. BRAKE LIGHT GLOW */
.brake-light-active {
  animation: brakeGlow 1.5s ease-out forwards;
}

@keyframes brakeGlow {
  0%, 70% {
    filter: drop-shadow(0 0 10px rgba(239, 68, 68, 1));
    fill: #ff2a2a;
  }
  100% {
    filter: drop-shadow(0 0 3px rgba(239, 68, 68, 0.4));
    fill: #ef4444;
  }
}

/* 5. SPEED STREAKS FOR DISPATCH */
.speed-line {
  position: absolute;
  height: 1.5px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.7), transparent);
  animation: streakMove 0.75s linear infinite;
}

.speed-line-1 {
  top: 25%;
  width: 90px;
  animation-delay: 0s;
}

.speed-line-2 {
  top: 50%;
  width: 140px;
  animation-delay: 0.25s;
}

.speed-line-3 {
  top: 72%;
  width: 110px;
  animation-delay: 0.45s;
}

@keyframes streakMove {
  0% {
    transform: translateX(420px);
    opacity: 0;
  }
  30% {
    opacity: 0.8;
  }
  100% {
    transform: translateX(-140px);
    opacity: 0;
  }
}
</style>