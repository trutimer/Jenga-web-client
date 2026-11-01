<template>
  <aside
    class="showcase-root hidden lg:flex lg:w-1/2 xl:w-[55%] relative overflow-hidden flex-col justify-between p-10 xl:p-14 select-none border-r transition-colors duration-300"
    :class="[
      canvasMode === 'ink' ? 'theme-ink border-slate-800' : 'theme-paper border-slate-200/90',
      { 'is-paused': isEffectivelyPaused }
    ]"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
    @focusin="isFocused = true"
    @focusout="isFocused = false"
    @keydown.left.prevent="prevSlide"
    @keydown.right.prevent="nextSlide"
  >
    <!-- Subtle Architectural Dot-Matrix Grid -->
    <div class="showcase-grid absolute inset-0 pointer-events-none" aria-hidden="true"></div>

    <!-- Soft Radial Edge Vignette for Depth -->
    <div class="showcase-vignette absolute inset-0 pointer-events-none" aria-hidden="true"></div>

    <!-- Top Technical Header Bar -->
    <header class="relative z-10 flex items-center justify-between gap-4">
      <div class="flex items-center gap-2.5">
        <span class="relative flex h-2.5 w-2.5">
          <span
            v-if="!isEffectivelyPaused"
            class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"
          ></span>
          <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
        </span>
        <span class="font-mono text-xs font-bold tracking-widest uppercase sc-text-ink">
          0{{ activeIndex + 1 }} / 0{{ slides.length }}
        </span>
        <span class="sc-divider-dot" aria-hidden="true"></span>
        <span class="font-mono text-xs font-semibold tracking-wider uppercase sc-text-muted">
          {{ currentSlide.tag }}
        </span>
      </div>

      <div class="flex items-center gap-2">
        <!-- Subtle Pause Badge on Hover / Focus -->
        <span
          v-if="isHovered || isFocused"
          class="px-2.5 py-1 rounded-md font-mono text-xs font-semibold sc-badge transition-opacity"
        >
          {{ $t('auth.showcase.paused') }}
        </span>

        <!-- Monochrome Paper / Ink Canvas Switcher -->
        <button
          type="button"
          @click="toggleCanvasMode"
          class="px-2.5 py-1 rounded-lg font-mono text-xs font-semibold sc-badge hover:opacity-80 transition-all cursor-pointer flex items-center gap-1.5"
          :title="canvasMode === 'paper' ? $t('auth.showcase.canvasInk') : $t('auth.showcase.canvasPaper')"
        >
          <span
            class="w-2 h-2 rounded-full border"
            :style="{
              backgroundColor: canvasMode === 'paper' ? '#0f172a' : '#f8fafc',
              borderColor: canvasMode === 'paper' ? '#0f172a' : '#f8fafc'
            }"
          ></span>
          <span>{{ canvasMode === 'paper' ? $t('auth.showcase.canvasInk') : $t('auth.showcase.canvasPaper') }}</span>
        </button>
      </div>
    </header>

    <!-- Center 2D Animated Schematic Stage (Mounted only on >=1024px viewports) -->
    <div class="relative z-10 flex-1 flex items-center justify-center my-4 min-h-[300px]">
      <!-- Subtle Corner Registration Crosshairs -->
      <span class="reg-mark top-2 left-2" aria-hidden="true">+</span>
      <span class="reg-mark top-2 right-2" aria-hidden="true">+</span>
      <span class="reg-mark bottom-2 left-2" aria-hidden="true">+</span>
      <span class="reg-mark bottom-2 right-2" aria-hidden="true">+</span>

      <Transition name="showcase-scene" mode="out-in">
        <!-- =============================================================== -->
        <!-- SLIDE 1: WAREHOUSE & MULTI-BRANCH STOCK TRANSFERS               -->
        <!-- =============================================================== -->
        <svg
          v-if="isDesktopViewport && currentSlide.id === 'stock-network'"
          key="scene-stock-network"
          viewBox="0 0 600 390"
          class="w-full max-w-[580px] h-auto max-h-[410px]"
          fill="none"
          aria-hidden="true"
          focusable="false"
        >
          <!-- Monochrome Conduit Base Tracks -->
          <path
            d="M300 124 V178 M112 178 H488 M112 178 V238 M300 178 V238 M488 178 V238"
            class="sc-stroke-line"
            stroke-width="2"
          />
          <!-- Inter-Branch Direct Transfer Bridges -->
          <path d="M174 306 H238 M362 306 H426" class="sc-stroke-line" stroke-width="1.8" />

          <!-- Jenga Orange Active Flow Lines (Minimal Primary Accent) -->
          <path
            d="M300 124 V178 M112 178 H488 M112 178 V238 M300 178 V238 M488 178 V238"
            stroke="#F4511E"
            stroke-width="2"
            class="anim-dash"
          />
          <path
            d="M174 306 H238 M362 306 H426"
            stroke="#F4511E"
            stroke-width="2"
            class="anim-dash-reverse"
          />

          <!-- Animated Orange Stock Parcels (Warehouse -> Branches) -->
          <g class="pkt-wh-left">
            <rect x="-5" y="-5" width="10" height="10" rx="2.5" fill="#F4511E" />
          </g>
          <g class="pkt-wh-center">
            <rect x="-5" y="-5" width="10" height="10" rx="2.5" fill="#F4511E" />
          </g>
          <g class="pkt-wh-right">
            <rect x="-5" y="-5" width="10" height="10" rx="2.5" fill="#F4511E" />
          </g>

          <!-- Animated Orange Stock Parcels (Branch <-> Branch Peer Rebalancing) -->
          <g class="pkt-peer-1">
            <circle cx="0" cy="0" r="4.5" fill="#F4511E" />
          </g>
          <g class="pkt-peer-2">
            <circle cx="0" cy="0" r="4.5" fill="#F4511E" />
          </g>

          <!-- TOP: 2D Central Warehouse (Monochrome Black & White) -->
          <g>
            <!-- Pitched Warehouse Roof -->
            <polygon
              points="196,52 300,16 404,52"
              class="sc-fill-card sc-stroke-ink"
              stroke-width="2.2"
              stroke-linejoin="round"
            />
            <!-- Roof Louver Vent -->
            <line x1="282" y1="36" x2="318" y2="36" class="sc-stroke-ink" stroke-width="1.8" stroke-linecap="round" />
            <line x1="288" y1="42" x2="312" y2="42" class="sc-stroke-muted" stroke-width="1.5" stroke-linecap="round" />

            <!-- Warehouse Main Structure -->
            <rect
              x="208"
              y="52"
              width="184"
              height="72"
              rx="4"
              class="sc-fill-card sc-stroke-ink"
              stroke-width="2.2"
            />

            <!-- Left Storage Rack & Stacked Crates -->
            <rect x="222" y="88" width="20" height="16" rx="1.5" class="sc-fill-sub sc-stroke-ink" stroke-width="1.6" />
            <rect x="245" y="88" width="20" height="16" rx="1.5" class="sc-fill-sub sc-stroke-ink" stroke-width="1.6" />
            <rect x="233" y="70" width="20" height="16" rx="1.5" class="sc-fill-sub sc-stroke-ink" stroke-width="1.6" />
            <line x1="218" y1="106" x2="270" y2="106" class="sc-stroke-ink" stroke-width="2" />

            <!-- Center Header Tag -->
            <text x="300" y="72" text-anchor="middle" font-size="12" font-family="monospace" font-weight="700" class="sc-text-svg-ink">
              WAREHOUSE
            </text>
            <text x="300" y="87" text-anchor="middle" font-size="12" font-family="monospace" class="sc-text-svg-muted">
              HQ-01
            </text>

            <!-- Right Loading Dock Shutter -->
            <rect x="336" y="76" width="42" height="48" rx="2" class="sc-fill-sub sc-stroke-ink" stroke-width="1.8" />
            <line x1="336" y1="86" x2="378" y2="86" class="sc-stroke-ink" stroke-width="1.3" />
            <line x1="336" y1="96" x2="378" y2="96" class="sc-stroke-ink" stroke-width="1.3" />
            <line x1="336" y1="106" x2="378" y2="106" class="sc-stroke-ink" stroke-width="1.3" />

            <!-- Central Dispatch Port -->
            <circle cx="300" cy="124" r="5.5" fill="#F4511E" />
          </g>

          <!-- BOTTOM: 3 Monochrome 2D Retail Branches -->
          <!-- Branch 01 (Left) -->
          <g>
            <circle cx="112" cy="238" r="6" stroke="#F4511E" stroke-width="1.6" class="ring-pulse" />
            <!-- Awning -->
            <polygon
              points="46,258 58,242 166,242 178,258"
              class="sc-fill-sub sc-stroke-ink"
              stroke-width="2"
              stroke-linejoin="round"
            />
            <line x1="86" y1="242" x2="82" y2="258" class="sc-stroke-ink" stroke-width="1.5" />
            <line x1="112" y1="242" x2="112" y2="258" class="sc-stroke-ink" stroke-width="1.5" />
            <line x1="138" y1="242" x2="142" y2="258" class="sc-stroke-ink" stroke-width="1.5" />
            <!-- Storefront Body -->
            <rect x="52" y="258" width="120" height="82" rx="4" class="sc-fill-card sc-stroke-ink" stroke-width="2" />
            <text x="64" y="278" font-size="12" font-family="monospace" font-weight="700" class="sc-text-svg-ink">
              BRANCH 01
            </text>
            <!-- Display Window with Stock Level Bars -->
            <rect x="64" y="288" width="62" height="38" rx="2" class="sc-fill-sub sc-stroke-ink" stroke-width="1.4" />
            <rect x="72" y="306" width="8" height="14" class="sc-fill-ink" />
            <rect x="85" y="298" width="8" height="22" class="sc-fill-ink" />
            <rect x="98" y="302" width="8" height="18" class="sc-fill-ink" />
            <rect x="111" y="294" width="8" height="26" fill="#F4511E" class="bar-breathe" />
            <!-- Shop Door -->
            <rect x="136" y="294" width="24" height="46" rx="1.5" class="sc-fill-sub sc-stroke-ink" stroke-width="1.6" />
            <circle cx="154" cy="318" r="1.8" class="sc-fill-ink" />
          </g>

          <!-- Branch 02 (Center) -->
          <g>
            <circle cx="300" cy="238" r="6" stroke="#F4511E" stroke-width="1.6" class="ring-pulse-delay-1" />
            <polygon
              points="234,258 246,242 354,242 366,258"
              class="sc-fill-sub sc-stroke-ink"
              stroke-width="2"
              stroke-linejoin="round"
            />
            <line x1="274" y1="242" x2="270" y2="258" class="sc-stroke-ink" stroke-width="1.5" />
            <line x1="300" y1="242" x2="300" y2="258" class="sc-stroke-ink" stroke-width="1.5" />
            <line x1="326" y1="242" x2="330" y2="258" class="sc-stroke-ink" stroke-width="1.5" />
            <rect x="240" y="258" width="120" height="82" rx="4" class="sc-fill-card sc-stroke-ink" stroke-width="2" />
            <text x="252" y="278" font-size="12" font-family="monospace" font-weight="700" class="sc-text-svg-ink">
              BRANCH 02
            </text>
            <rect x="252" y="288" width="62" height="38" rx="2" class="sc-fill-sub sc-stroke-ink" stroke-width="1.4" />
            <rect x="260" y="300" width="8" height="20" class="sc-fill-ink" />
            <rect x="273" y="308" width="8" height="12" class="sc-fill-ink" />
            <rect x="286" y="296" width="8" height="24" class="sc-fill-ink" />
            <rect x="299" y="293" width="8" height="27" fill="#F4511E" class="bar-breathe" />
            <rect x="324" y="294" width="24" height="46" rx="1.5" class="sc-fill-sub sc-stroke-ink" stroke-width="1.6" />
            <circle cx="342" cy="318" r="1.8" class="sc-fill-ink" />
          </g>

          <!-- Branch 03 (Right) -->
          <g>
            <circle cx="488" cy="238" r="6" stroke="#F4511E" stroke-width="1.6" class="ring-pulse-delay-2" />
            <polygon
              points="422,258 434,242 542,242 554,258"
              class="sc-fill-sub sc-stroke-ink"
              stroke-width="2"
              stroke-linejoin="round"
            />
            <line x1="462" y1="242" x2="458" y2="258" class="sc-stroke-ink" stroke-width="1.5" />
            <line x1="488" y1="242" x2="488" y2="258" class="sc-stroke-ink" stroke-width="1.5" />
            <line x1="514" y1="242" x2="518" y2="258" class="sc-stroke-ink" stroke-width="1.5" />
            <rect x="428" y="258" width="120" height="82" rx="4" class="sc-fill-card sc-stroke-ink" stroke-width="2" />
            <text x="440" y="278" font-size="12" font-family="monospace" font-weight="700" class="sc-text-svg-ink">
              BRANCH 03
            </text>
            <rect x="440" y="288" width="62" height="38" rx="2" class="sc-fill-sub sc-stroke-ink" stroke-width="1.4" />
            <rect x="448" y="305" width="8" height="15" class="sc-fill-ink" />
            <rect x="461" y="297" width="8" height="23" class="sc-fill-ink" />
            <rect x="474" y="303" width="8" height="17" class="sc-fill-ink" />
            <rect x="487" y="295" width="8" height="25" fill="#F4511E" class="bar-breathe" />
            <rect x="512" y="294" width="24" height="46" rx="1.5" class="sc-fill-sub sc-stroke-ink" stroke-width="1.6" />
            <circle cx="530" cy="318" r="1.8" class="sc-fill-ink" />
          </g>

          <!-- Ground Baseline -->
          <line x1="34" y1="340" x2="566" y2="340" class="sc-stroke-line" stroke-width="1.5" />
        </svg>

        <!-- =============================================================== -->
        <!-- SLIDE 2: JENGA AI ASSISTANT (ANALYSIS, SUPPORT, REPORTS, TASKS) -->
        <!-- =============================================================== -->
        <svg
          v-else-if="isDesktopViewport && currentSlide.id === 'ai-assistant'"
          key="scene-ai-assistant"
          viewBox="0 0 600 390"
          class="w-full max-w-[580px] h-auto max-h-[410px]"
          fill="none"
          aria-hidden="true"
          focusable="false"
        >
          <!-- Incoming & 4-Way Outgoing Monochrome Conduits -->
          <line x1="176" y1="195" x2="232" y2="195" class="sc-stroke-line" stroke-width="2" />
          <path
            d="M316 195 H348 M348 58 V332 M348 58 H378 M348 149 H378 M348 241 H378 M348 332 H378"
            class="sc-stroke-line"
            stroke-width="2"
          />

          <!-- Active Jenga Orange Neural Filaments -->
          <line x1="176" y1="195" x2="232" y2="195" stroke="#F4511E" stroke-width="2.2" class="anim-dash" />
          <path
            d="M316 195 H348 M348 58 V332 M348 58 H378 M348 149 H378 M348 241 H378 M348 332 H378"
            stroke="#F4511E"
            stroke-width="2"
            class="anim-dash"
          />

          <!-- Traveling Prompt & Dispatch Pulses -->
          <g class="ai-pkt-in">
            <circle cx="0" cy="0" r="4.5" fill="#F4511E" />
          </g>
          <g class="ai-pkt-out-1">
            <circle cx="0" cy="0" r="4" fill="#F4511E" />
          </g>
          <g class="ai-pkt-out-2">
            <circle cx="0" cy="0" r="4" fill="#F4511E" />
          </g>
          <g class="ai-pkt-out-3">
            <circle cx="0" cy="0" r="4" fill="#F4511E" />
          </g>
          <g class="ai-pkt-out-4">
            <circle cx="0" cy="0" r="4" fill="#F4511E" />
          </g>

          <!-- LEFT: Natural-Language Store Prompt Card -->
          <g>
            <rect x="24" y="126" width="152" height="138" rx="10" class="sc-fill-card sc-stroke-ink" stroke-width="2.2" />
            <!-- Window Dots & Header -->
            <circle cx="40" cy="141" r="2.5" class="sc-fill-ink" />
            <circle cx="50" cy="141" r="2.5" class="sc-stroke-ink" stroke-width="1.4" />
            <text x="162" y="145" text-anchor="end" font-size="12" font-family="monospace" font-weight="700" class="sc-text-svg-muted">
              PROMPT
            </text>
            <line x1="24" y1="154" x2="176" y2="154" class="sc-stroke-line" stroke-width="1.4" />

            <!-- Input Query Box -->
            <rect x="36" y="166" width="128" height="54" rx="6" class="sc-fill-sub sc-stroke-ink" stroke-width="1.5" />
            <text x="45" y="186" font-size="12" font-family="monospace" font-weight="700" class="sc-text-svg-ink">
              ASK JENGA AI
            </text>
            <line x1="45" y1="202" x2="128" y2="202" class="sc-stroke-ink" stroke-width="2" stroke-linecap="round" />
            <!-- Blinking Orange Cursor -->
            <line x1="135" y1="194" x2="135" y2="209" stroke="#F4511E" stroke-width="2.2" stroke-linecap="round" class="ai-cursor-blink" />

            <!-- Send Action Button -->
            <line x1="38" y1="240" x2="96" y2="240" class="sc-stroke-line" stroke-width="1.6" stroke-linecap="round" />
            <rect x="114" y="230" width="50" height="20" rx="5" fill="#F4511E" />
            <path d="M132 240 H145 M141 236 L146 240 L141 244" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
          </g>

          <!-- CENTER: Jenga AI Neural Core -->
          <g>
            <!-- Rotating Precision Orbit Ring -->
            <circle cx="274" cy="195" r="56" class="sc-stroke-line ai-orbit-spin" stroke-width="1.5" stroke-dasharray="6 6" />
            <!-- Expanding Orange Neural Pulse -->
            <circle cx="274" cy="195" r="42" stroke="#F4511E" stroke-width="1.8" class="ring-pulse" />

            <!-- AI Processor Housing -->
            <rect x="232" y="153" width="84" height="84" rx="18" class="sc-fill-card sc-stroke-ink" stroke-width="2.4" />
            <rect x="242" y="163" width="64" height="64" rx="12" class="sc-fill-sub sc-stroke-ink" stroke-width="1.5" />

            <!-- Primary Orange 4-Point AI Sparkle Emblem -->
            <path
              d="M274 171 L279.5 185.5 L294 191 L279.5 196.5 L274 211 L268.5 196.5 L254 191 L268.5 185.5 Z"
              fill="#F4511E"
              class="ai-star-breathe"
            />
            <!-- Secondary Monochrome Micro-Sparkle -->
            <path
              d="M293 169 L294.6 172.8 L298.4 174.4 L294.6 176 L293 179.8 L291.4 176 L287.6 174.4 L291.4 172.8 Z"
              class="sc-fill-ink"
            />

            <text x="274" y="274" text-anchor="middle" font-size="12" font-family="monospace" font-weight="700" class="sc-text-svg-ink">
              JENGA AI
            </text>
          </g>

          <!-- RIGHT: 4 Capability Output Modules -->
          <!-- 1. ANALYSIS (Margins, Sales & Runways) -->
          <g class="ai-card-1">
            <rect x="378" y="22" width="200" height="72" rx="9" class="sc-fill-card sc-stroke-ink" stroke-width="2" />
            <rect x="378" y="22" width="5" height="72" rx="2.5" fill="#F4511E" />
            <rect x="392" y="34" width="42" height="48" rx="6" class="sc-fill-sub sc-stroke-ink" stroke-width="1.4" />
            <!-- Rising Bars + Orange Trend Line -->
            <rect x="399" y="64" width="6" height="11" class="sc-fill-ink" />
            <rect x="409" y="57" width="6" height="18" class="sc-fill-ink" />
            <rect x="419" y="49" width="6" height="26" class="sc-fill-ink" />
            <polyline points="399,59 411,51 425,41" stroke="#F4511E" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" />
            <text x="444" y="52" font-size="12" font-family="monospace" font-weight="700" class="sc-text-svg-ink">
              ANALYSIS
            </text>
            <text x="444" y="70" font-size="12" font-family="sans-serif" class="sc-text-svg-muted">
              Margins &amp; trends
            </text>
          </g>

          <!-- 2. SUPPORT (Guided Store Copilot) -->
          <g class="ai-card-2">
            <rect x="378" y="113" width="200" height="72" rx="9" class="sc-fill-card sc-stroke-ink" stroke-width="2" />
            <rect x="378" y="113" width="5" height="72" rx="2.5" fill="#F4511E" />
            <rect x="392" y="125" width="42" height="48" rx="6" class="sc-fill-sub sc-stroke-ink" stroke-width="1.4" />
            <!-- Minimalist Chat Bubble -->
            <path d="M400 137 H426 V155 H411 L404 161 V155 H400 Z" class="sc-fill-card sc-stroke-ink" stroke-width="1.5" stroke-linejoin="round" />
            <line x1="406" y1="144" x2="420" y2="144" stroke="#F4511E" stroke-width="2" stroke-linecap="round" />
            <line x1="406" y1="149" x2="416" y2="149" class="sc-stroke-ink" stroke-width="1.5" stroke-linecap="round" />
            <text x="444" y="143" font-size="12" font-family="monospace" font-weight="700" class="sc-text-svg-ink">
              SUPPORT
            </text>
            <text x="444" y="161" font-size="12" font-family="sans-serif" class="sc-text-svg-muted">
              24/7 store guidance
            </text>
          </g>

          <!-- 3. REPORTS (Instant P&L & Executive Summaries) -->
          <g class="ai-card-3">
            <rect x="378" y="205" width="200" height="72" rx="9" class="sc-fill-card sc-stroke-ink" stroke-width="2" />
            <rect x="378" y="205" width="5" height="72" rx="2.5" fill="#F4511E" />
            <rect x="392" y="217" width="42" height="48" rx="6" class="sc-fill-sub sc-stroke-ink" stroke-width="1.4" />
            <!-- Folded Executive Report Sheet -->
            <path d="M402 225 H419 L425 231 V257 H402 Z" class="sc-fill-card sc-stroke-ink" stroke-width="1.5" stroke-linejoin="round" />
            <line x1="407" y1="237" x2="420" y2="237" class="sc-stroke-ink" stroke-width="1.5" />
            <line x1="407" y1="243" x2="417" y2="243" class="sc-stroke-line" stroke-width="1.5" />
            <line x1="407" y1="250" x2="420" y2="250" stroke="#F4511E" stroke-width="2" />
            <text x="444" y="235" font-size="12" font-family="monospace" font-weight="700" class="sc-text-svg-ink">
              REPORTS
            </text>
            <text x="444" y="253" font-size="12" font-family="sans-serif" class="sc-text-svg-muted">
              Instant P&amp;L &amp; KPIs
            </text>
          </g>

          <!-- 4. TASK EXECUTION (Autonomous Store Actions) -->
          <g class="ai-card-4">
            <rect x="378" y="296" width="200" height="72" rx="9" class="sc-fill-card sc-stroke-ink" stroke-width="2" />
            <rect x="378" y="296" width="5" height="72" rx="2.5" fill="#F4511E" />
            <rect x="392" y="308" width="42" height="48" rx="6" class="sc-fill-sub sc-stroke-ink" stroke-width="1.4" />
            <!-- Task Execution Verified Check -->
            <circle cx="413" cy="332" r="11" class="sc-fill-card sc-stroke-ink" stroke-width="1.5" />
            <polyline points="407,332 411.5,336.5 419.5,327.5" stroke="#F4511E" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
            <text x="444" y="326" font-size="12" font-family="monospace" font-weight="700" class="sc-text-svg-ink">
              TASK RUNNER
            </text>
            <text x="444" y="344" font-size="12" font-family="sans-serif" class="sc-text-svg-muted">
              Execute POs &amp; tasks
            </text>
          </g>
        </svg>

        <!-- =============================================================== -->
        <!-- SLIDE 3: MULTI-DEVICE ECOSYSTEM (DESKTOP, TABLET & MOBILE)      -->
        <!-- =============================================================== -->
        <svg
          v-else-if="isDesktopViewport && currentSlide.id === 'multi-device'"
          key="scene-multi-device"
          viewBox="0 0 600 390"
          class="w-full max-w-[580px] h-auto max-h-[410px]"
          fill="none"
          aria-hidden="true"
          focusable="false"
        >
          <!-- Top Cloud / Real-time Sync Hub -->
          <rect x="214" y="24" width="172" height="36" rx="18" class="sc-fill-card sc-stroke-ink" stroke-width="2" />
          <circle cx="236" cy="42" r="4.5" fill="#F4511E" />
          <text x="308" y="46" text-anchor="middle" font-size="12" font-family="monospace" font-weight="700" class="sc-text-svg-ink">
            UNIFIED SYNC
          </text>

          <!-- Top & Bottom Sync Conduits -->
          <path d="M300 60 V86 M136 86 H510 M136 86 V116 M352 86 V146 M510 86 V132" class="sc-stroke-line" stroke-width="1.8" />
          <path d="M300 60 V86 M136 86 H510 M136 86 V116 M352 86 V146 M510 86 V132" stroke="#F4511E" stroke-width="1.8" class="anim-dash" />

          <!-- Bottom Unified Bus -->
          <line x1="136" y1="334" x2="510" y2="334" class="sc-stroke-line" stroke-width="2" />
          <line x1="136" y1="334" x2="510" y2="334" stroke="#F4511E" stroke-width="2" class="anim-dash" />
          <g class="sync-runner">
            <circle cx="136" cy="334" r="5" fill="#F4511E" />
          </g>

          <!-- 1. DESKTOP POS TERMINAL (Left) -->
          <g>
            <!-- Monitor Frame -->
            <rect x="36" y="116" width="200" height="136" rx="8" class="sc-fill-card sc-stroke-ink" stroke-width="2.2" />
            <rect x="46" y="126" width="180" height="110" rx="3" class="sc-fill-sub sc-stroke-ink" stroke-width="1.5" />

            <!-- POS Product Tiles (2x3) -->
            <rect x="54" y="135" width="32" height="26" rx="2.5" class="sc-fill-card sc-stroke-ink" stroke-width="1.4" />
            <rect x="92" y="135" width="32" height="26" rx="2.5" class="sc-fill-card sc-stroke-ink" stroke-width="1.4" />
            <rect x="54" y="167" width="32" height="26" rx="2.5" class="sc-fill-card sc-stroke-ink" stroke-width="1.4" />
            <rect x="92" y="167" width="32" height="26" rx="2.5" class="sc-fill-card" stroke="#F4511E" stroke-width="2" />
            <rect x="54" y="199" width="70" height="28" rx="2.5" class="sc-fill-card sc-stroke-ink" stroke-width="1.4" />

            <!-- Right Receipt Column inside POS Screen -->
            <rect x="132" y="135" width="86" height="92" rx="3" class="sc-fill-card sc-stroke-ink" stroke-width="1.4" />
            <line x1="140" y1="148" x2="206" y2="148" class="sc-stroke-ink" stroke-width="1.8" />
            <line x1="140" y1="160" x2="192" y2="160" class="sc-stroke-line" stroke-width="1.6" />
            <line x1="140" y1="172" x2="200" y2="172" class="sc-stroke-line" stroke-width="1.6" />
            <line x1="140" y1="184" x2="184" y2="184" class="sc-stroke-line" stroke-width="1.6" />
            <rect x="140" y="204" width="70" height="15" rx="3" fill="#F4511E" />

            <!-- Monitor Stand -->
            <path d="M116 252 L108 284 H164 L156 252" class="sc-fill-sub sc-stroke-ink" stroke-width="2" />
            <line x1="88" y1="284" x2="184" y2="284" class="sc-stroke-ink" stroke-width="2.5" stroke-linecap="round" />

            <!-- Spine Drop -->
            <line x1="136" y1="284" x2="136" y2="334" class="sc-stroke-line" stroke-width="1.8" />
            <circle cx="136" cy="334" r="5" class="sc-fill-card" stroke="#F4511E" stroke-width="2.2" />
            <text x="136" y="360" text-anchor="middle" font-size="12" font-family="monospace" font-weight="700" class="sc-text-svg-ink">
              DESKTOP POS
            </text>
          </g>

          <!-- 2. COUNTER TABLET (Center) -->
          <g>
            <rect x="272" y="146" width="160" height="118" rx="10" class="sc-fill-card sc-stroke-ink" stroke-width="2.2" />
            <rect x="283" y="157" width="138" height="96" rx="4" class="sc-fill-sub sc-stroke-ink" stroke-width="1.4" />
            <!-- Tablet Header & Inventory Rows -->
            <line x1="293" y1="171" x2="365" y2="171" class="sc-stroke-ink" stroke-width="2" />
            <circle cx="406" cy="171" r="4.5" fill="#F4511E" class="dev-ping" />
            <rect x="293" y="183" width="118" height="18" rx="3" class="sc-fill-card sc-stroke-ink" stroke-width="1.3" />
            <rect x="293" y="207" width="118" height="18" rx="3" class="sc-fill-card sc-stroke-ink" stroke-width="1.3" />
            <line x1="301" y1="192" x2="358" y2="192" class="sc-stroke-ink" stroke-width="1.5" />
            <line x1="301" y1="216" x2="348" y2="216" class="sc-stroke-ink" stroke-width="1.5" />
            <line x1="382" y1="192" x2="401" y2="192" stroke="#F4511E" stroke-width="2" />
            <line x1="352" y1="264" x2="352" y2="334" class="sc-stroke-line" stroke-width="1.8" />
            <circle cx="352" cy="334" r="5" class="sc-fill-card" stroke="#F4511E" stroke-width="2.2" />
            <text x="352" y="360" text-anchor="middle" font-size="12" font-family="monospace" font-weight="700" class="sc-text-svg-ink">
              TABLET
            </text>
          </g>

          <!-- 3. MOBILE COMPANION (Right) -->
          <g>
            <rect x="462" y="132" width="96" height="152" rx="13" class="sc-fill-card sc-stroke-ink" stroke-width="2.2" />
            <!-- Earpiece -->
            <line x1="498" y1="143" x2="522" y2="143" class="sc-stroke-ink" stroke-width="2" stroke-linecap="round" />
            <!-- Screen -->
            <rect x="472" y="152" width="76" height="116" rx="4" class="sc-fill-sub sc-stroke-ink" stroke-width="1.4" />
            <!-- Live Orange Sparkline -->
            <polyline
              points="480,202 494,193 506,198 522,178 538,169"
              stroke="#F4511E"
              stroke-width="2.2"
              fill="none"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <circle cx="538" cy="169" r="3.8" fill="#F4511E" class="dev-ping" />
            <!-- Mobile Metric Cards -->
            <rect x="480" y="214" width="60" height="18" rx="3" class="sc-fill-card sc-stroke-ink" stroke-width="1.2" />
            <rect x="480" y="238" width="60" height="18" rx="3" class="sc-fill-card sc-stroke-ink" stroke-width="1.2" />
            <line x1="487" y1="223" x2="524" y2="223" class="sc-stroke-ink" stroke-width="1.5" />
            <line x1="487" y1="247" x2="516" y2="247" class="sc-stroke-line" stroke-width="1.5" />

            <line x1="510" y1="284" x2="510" y2="334" class="sc-stroke-line" stroke-width="1.8" />
            <circle cx="510" cy="334" r="5" class="sc-fill-card" stroke="#F4511E" stroke-width="2.2" />
            <text x="510" y="360" text-anchor="middle" font-size="12" font-family="monospace" font-weight="700" class="sc-text-svg-ink">
              MOBILE
            </text>
          </g>
        </svg>

        <!-- =============================================================== -->
        <!-- SLIDE 4: REAL-TIME ALERTS & OPERATIONAL GUARDRAILS              -->
        <!-- =============================================================== -->
        <svg
          v-else-if="isDesktopViewport && currentSlide.id === 'smart-alerts'"
          key="scene-smart-alerts"
          viewBox="0 0 600 390"
          class="w-full max-w-[580px] h-auto max-h-[410px]"
          fill="none"
          aria-hidden="true"
          focusable="false"
        >
          <!-- Left: Watchtower Radar Hub -->
          <circle cx="110" cy="195" r="68" class="sc-stroke-line" stroke-width="1.4" stroke-dasharray="5 5" />
          <circle cx="110" cy="195" r="42" class="sc-fill-card sc-stroke-ink" stroke-width="2.2" />
          <circle cx="110" cy="195" r="42" stroke="#F4511E" stroke-width="1.8" class="ring-pulse" />

          <!-- Minimalist 2D Bell Icon -->
          <path
            d="M110 174 C99 174 94 182 94 193 V202 L88 208 H132 L126 202 V193 C126 182 121 174 110 174 Z"
            class="sc-fill-sub sc-stroke-ink"
            stroke-width="2"
            stroke-linejoin="round"
          />
          <path d="M105 213 C107 217 113 217 115 213" stroke="#F4511E" stroke-width="2.4" stroke-linecap="round" />
          <circle cx="124" cy="177" r="5" fill="#F4511E" />

          <!-- Signal Distribution Spine -->
          <path
            d="M152 195 H202 M202 52 V338 M202 52 H232 M202 123 H232 M202 195 H232 M202 266 H232 M202 338 H232"
            class="sc-stroke-line"
            stroke-width="1.8"
          />
          <line x1="152" y1="195" x2="202" y2="195" stroke="#F4511E" stroke-width="2.2" class="anim-dash" />

          <!-- Right: 5 Sequentially Spotlighted Monochrome Event Cards -->
          <!-- Card 1: Low Stock -->
          <g class="alert-seq-1">
            <rect x="234" y="24" width="328" height="56" rx="8" class="sc-fill-card sc-stroke-ink" stroke-width="1.8" />
            <rect x="234" y="24" width="6" height="56" rx="3" fill="#F4511E" />
            <rect x="252" y="38" width="28" height="28" rx="6" class="sc-fill-sub sc-stroke-ink" stroke-width="1.5" />
            <path d="M259 48 L266 44 L273 48 V56 L266 60 L259 56 Z" class="sc-stroke-ink" stroke-width="1.5" />
            <text x="292" y="48" font-size="12" font-family="monospace" font-weight="700" class="sc-text-svg-ink">
              LOW STOCK • REORDER ALERT
            </text>
            <text x="292" y="66" font-size="12" font-family="sans-serif" class="sc-text-svg-muted">
              Minimum shelf threshold reached (4 left)
            </text>
          </g>

          <!-- Card 2: Cashier Shift Open/Close -->
          <g class="alert-seq-2">
            <rect x="234" y="95" width="328" height="56" rx="8" class="sc-fill-card sc-stroke-ink" stroke-width="1.8" />
            <rect x="234" y="95" width="6" height="56" rx="3" fill="#F4511E" />
            <rect x="252" y="109" width="28" height="28" rx="6" class="sc-fill-sub sc-stroke-ink" stroke-width="1.5" />
            <circle cx="266" cy="123" r="7" class="sc-stroke-ink" stroke-width="1.5" />
            <polyline points="266,119 266,123 269,125" class="sc-stroke-ink" stroke-width="1.5" />
            <text x="292" y="119" font-size="12" font-family="monospace" font-weight="700" class="sc-text-svg-ink">
              CASHIER SHIFT • REG #01
            </text>
            <text x="292" y="137" font-size="12" font-family="sans-serif" class="sc-text-svg-muted">
              Shift opened &amp; opening cash float verified
            </text>
          </g>

          <!-- Card 3: Shift Discrepancy -->
          <g class="alert-seq-3">
            <rect x="234" y="167" width="328" height="56" rx="8" class="sc-fill-card sc-stroke-ink" stroke-width="1.8" />
            <rect x="234" y="167" width="6" height="56" rx="3" fill="#F4511E" />
            <rect x="252" y="181" width="28" height="28" rx="6" class="sc-fill-sub sc-stroke-ink" stroke-width="1.5" />
            <polygon points="266,187 274,201 258,201" class="sc-stroke-ink" stroke-width="1.5" stroke-linejoin="round" />
            <text x="292" y="191" font-size="12" font-family="monospace" font-weight="700" class="sc-text-svg-ink">
              SHIFT DISCREPANCY FLAGGED
            </text>
            <text x="292" y="209" font-size="12" font-family="sans-serif" class="sc-text-svg-muted">
              Closing drawer variance logged for review
            </text>
          </g>

          <!-- Card 4: Product Modification -->
          <g class="alert-seq-4">
            <rect x="234" y="238" width="328" height="56" rx="8" class="sc-fill-card sc-stroke-ink" stroke-width="1.8" />
            <rect x="234" y="238" width="6" height="56" rx="3" fill="#F4511E" />
            <rect x="252" y="252" width="28" height="28" rx="6" class="sc-fill-sub sc-stroke-ink" stroke-width="1.5" />
            <line x1="260" y1="272" x2="272" y2="260" class="sc-stroke-ink" stroke-width="1.8" stroke-linecap="round" />
            <text x="292" y="262" font-size="12" font-family="monospace" font-weight="700" class="sc-text-svg-ink">
              PRODUCT CATALOG MODIFIED
            </text>
            <text x="292" y="280" font-size="12" font-family="sans-serif" class="sc-text-svg-muted">
              Selling price &amp; stock audit trail recorded
            </text>
          </g>

          <!-- Card 5: Purchase Order -->
          <g class="alert-seq-5">
            <rect x="234" y="310" width="328" height="56" rx="8" class="sc-fill-card sc-stroke-ink" stroke-width="1.8" />
            <rect x="234" y="310" width="6" height="56" rx="3" fill="#F4511E" />
            <rect x="252" y="324" width="28" height="28" rx="6" class="sc-fill-sub sc-stroke-ink" stroke-width="1.5" />
            <polyline points="260,338 264,342 273,333" stroke="#F4511E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            <text x="292" y="334" font-size="12" font-family="monospace" font-weight="700" class="sc-text-svg-ink">
              PURCHASE ORDER • #PO-2048
            </text>
            <text x="292" y="352" font-size="12" font-family="sans-serif" class="sc-text-svg-muted">
              Supplier restock approved &amp; received
            </text>
          </g>
        </svg>

        <!-- =============================================================== -->
        <!-- SLIDE 5: RAPID BARCODE CHECKOUT & OFFLINE CONTINUITY            -->
        <!-- =============================================================== -->
        <svg
          v-else-if="isDesktopViewport && currentSlide.id === 'rapid-pos'"
          key="scene-rapid-pos"
          viewBox="0 0 600 390"
          class="w-full max-w-[580px] h-auto max-h-[410px]"
          fill="none"
          aria-hidden="true"
          focusable="false"
        >
          <!-- Left: Viewfinder Corner Brackets -->
          <path d="M46 116 V98 H64 M196 98 H214 V116 M46 274 V292 H64 M196 292 H214 V274" class="sc-stroke-ink" stroke-width="2" stroke-linecap="round" />

          <!-- Product Barcode Label Card -->
          <rect x="60" y="114" width="140" height="162" rx="10" class="sc-fill-card sc-stroke-ink" stroke-width="2.2" />
          <text x="130" y="138" text-anchor="middle" font-size="12" font-family="monospace" font-weight="700" class="sc-text-svg-muted">
            SKU-890412
          </text>

          <!-- Crisp Monochrome Barcode Bars -->
          <g class="sc-stroke-ink">
            <line x1="80" y1="152" x2="80" y2="226" stroke-width="3" />
            <line x1="88" y1="152" x2="88" y2="226" stroke-width="1.5" />
            <line x1="95" y1="152" x2="95" y2="226" stroke-width="2.5" />
            <line x1="104" y1="152" x2="104" y2="226" stroke-width="1.5" />
            <line x1="112" y1="152" x2="112" y2="226" stroke-width="3.2" />
            <line x1="121" y1="152" x2="121" y2="226" stroke-width="1.5" />
            <line x1="128" y1="152" x2="128" y2="226" stroke-width="2.4" />
            <line x1="137" y1="152" x2="137" y2="226" stroke-width="1.5" />
            <line x1="145" y1="152" x2="145" y2="226" stroke-width="3" />
            <line x1="154" y1="152" x2="154" y2="226" stroke-width="1.8" />
            <line x1="162" y1="152" x2="162" y2="226" stroke-width="2.8" />
            <line x1="171" y1="152" x2="171" y2="226" stroke-width="1.5" />
            <line x1="179" y1="152" x2="179" y2="226" stroke-width="3" />
          </g>
          <text x="130" y="252" text-anchor="middle" font-size="12" font-family="monospace" font-weight="700" class="sc-text-svg-ink">
            8 901240 5021
          </text>

          <!-- Sweeping Orange Laser Scan Line -->
          <g class="laser-sweep">
            <line x1="48" y1="189" x2="212" y2="189" stroke="#F4511E" stroke-width="2.8" stroke-linecap="round" />
          </g>

          <!-- Center Checkout Signal Conduit -->
          <line x1="214" y1="195" x2="342" y2="195" class="sc-stroke-line" stroke-width="2" />
          <line x1="214" y1="195" x2="342" y2="195" stroke="#F4511E" stroke-width="2.2" class="anim-dash" />
          <rect x="242" y="181" width="72" height="28" rx="14" class="sc-fill-card sc-stroke-ink" stroke-width="1.6" />
          <text x="278" y="199" text-anchor="middle" font-size="12" font-family="monospace" font-weight="700" class="sc-text-svg-ink">
            0.02s
          </text>

          <!-- Right: 2D Thermal Receipt & Locked Register Drawer -->
          <g class="receipt-eject">
            <!-- Serrated Receipt Top -->
            <polygon
              points="378,56 388,48 398,56 408,48 418,56 428,48 438,56 448,48 458,56 468,48 478,56 488,48 498,56 508,48 518,56 518,192 378,192"
              class="sc-fill-card sc-stroke-ink"
              stroke-width="2"
              stroke-linejoin="round"
            />
            <text x="448" y="80" text-anchor="middle" font-size="12" font-family="monospace" font-weight="700" class="sc-text-svg-ink">
              JENGA RECEIPT
            </text>
            <line x1="396" y1="94" x2="500" y2="94" class="sc-stroke-line" stroke-width="1.5" stroke-dasharray="3 3" />
            <line x1="396" y1="112" x2="468" y2="112" class="sc-stroke-ink" stroke-width="1.8" />
            <line x1="482" y1="112" x2="500" y2="112" class="sc-stroke-ink" stroke-width="1.8" />
            <line x1="396" y1="128" x2="454" y2="128" class="sc-stroke-line" stroke-width="1.8" />
            <line x1="482" y1="128" x2="500" y2="128" class="sc-stroke-line" stroke-width="1.8" />
            <line x1="396" y1="150" x2="500" y2="150" stroke="#F4511E" stroke-width="2.4" />
            <text x="396" y="172" font-size="12" font-family="monospace" font-weight="700" class="sc-text-svg-ink">
              PAID • TZS
            </text>
          </g>

          <!-- Register Chassis & Locked Cash Drawer -->
          <rect x="344" y="186" width="208" height="62" rx="8" class="sc-fill-sub sc-stroke-ink" stroke-width="2.2" />
          <line x1="366" y1="186" x2="530" y2="186" class="sc-stroke-ink" stroke-width="3.2" />
          <text x="448" y="222" text-anchor="middle" font-size="12" font-family="monospace" font-weight="700" class="sc-text-svg-ink">
            OFFLINE-READY • SYNCED
          </text>

          <rect x="356" y="248" width="184" height="54" rx="6" class="sc-fill-card sc-stroke-ink" stroke-width="2.2" />
          <circle cx="448" cy="275" r="9" class="sc-fill-sub" stroke="#F4511E" stroke-width="2.2" />
          <circle cx="448" cy="275" r="3" fill="#F4511E" />
        </svg>

        <!-- =============================================================== -->
        <!-- SLIDE 6: DOUBLE-ENTRY ACCOUNTING & MAKER-CHECKER GOVERNANCE     -->
        <!-- =============================================================== -->
        <svg
          v-else-if="isDesktopViewport && currentSlide.id === 'double-entry'"
          key="scene-double-entry"
          viewBox="0 0 600 390"
          class="w-full max-w-[580px] h-auto max-h-[410px]"
          fill="none"
          aria-hidden="true"
          focusable="false"
        >
          <!-- Top: Maker -> Checker Dual Approval Gate -->
          <rect x="166" y="26" width="268" height="82" rx="10" class="sc-fill-card sc-stroke-ink" stroke-width="2.2" />
          <rect x="184" y="44" width="94" height="46" rx="6" class="sc-fill-sub sc-stroke-ink" stroke-width="1.6" />
          <text x="231" y="71" text-anchor="middle" font-size="12" font-family="monospace" font-weight="700" class="sc-text-svg-ink">
            MAKER
          </text>

          <!-- Orange Governance Arrow -->
          <line x1="278" y1="67" x2="322" y2="67" stroke="#F4511E" stroke-width="2.2" class="anim-dash" />
          <polygon points="322,67 314,62 314,72" fill="#F4511E" />

          <rect x="322" y="44" width="94" height="46" rx="6" class="sc-fill-sub sc-stroke-ink" stroke-width="1.6" />
          <text x="369" y="71" text-anchor="middle" font-size="12" font-family="monospace" font-weight="700" class="sc-text-svg-ink">
            CHECKER ✓
          </text>

          <circle cx="300" cy="108" r="5" fill="#F4511E" />

          <!-- Symmetric Accounting Split Filaments -->
          <path d="M300 108 V148 L166 176 V204 M300 148 L434 176 V204" class="sc-stroke-line" stroke-width="2" />
          <path d="M300 108 V148 L166 176 V204 M300 148 L434 176 V204" stroke="#F4511E" stroke-width="2" class="anim-dash" />

          <!-- Mirror-Symmetric Orange Ledger Pulses -->
          <g class="ledger-pkt-left">
            <circle cx="0" cy="0" r="5" fill="#F4511E" />
          </g>
          <g class="ledger-pkt-right">
            <circle cx="0" cy="0" r="5" fill="#F4511E" />
          </g>

          <!-- Left Ledger Column: DEBIT (DR) -->
          <rect x="68" y="204" width="196" height="114" rx="8" class="sc-fill-card sc-stroke-ink" stroke-width="2.2" />
          <text x="88" y="230" font-size="12" font-family="monospace" font-weight="700" class="sc-text-svg-ink">
            DEBIT (DR)
          </text>
          <line x1="88" y1="242" x2="244" y2="242" class="sc-stroke-line" stroke-width="1.4" />
          <line x1="88" y1="262" x2="196" y2="262" class="sc-stroke-ink" stroke-width="1.8" />
          <line x1="214" y1="262" x2="244" y2="262" class="sc-stroke-ink" stroke-width="1.8" />
          <line x1="88" y1="280" x2="180" y2="280" class="sc-stroke-line" stroke-width="1.8" />
          <line x1="214" y1="280" x2="244" y2="280" class="sc-stroke-line" stroke-width="1.8" />
          <line x1="88" y1="298" x2="244" y2="298" stroke="#F4511E" stroke-width="2.2" />

          <!-- Right Ledger Column: CREDIT (CR) -->
          <rect x="336" y="204" width="196" height="114" rx="8" class="sc-fill-card sc-stroke-ink" stroke-width="2.2" />
          <text x="356" y="230" font-size="12" font-family="monospace" font-weight="700" class="sc-text-svg-ink">
            CREDIT (CR)
          </text>
          <line x1="356" y1="242" x2="512" y2="242" class="sc-stroke-line" stroke-width="1.4" />
          <line x1="356" y1="262" x2="464" y2="262" class="sc-stroke-ink" stroke-width="1.8" />
          <line x1="482" y1="262" x2="512" y2="262" class="sc-stroke-ink" stroke-width="1.8" />
          <line x1="356" y1="280" x2="448" y2="280" class="sc-stroke-line" stroke-width="1.8" />
          <line x1="482" y1="280" x2="512" y2="280" class="sc-stroke-line" stroke-width="1.8" />
          <line x1="356" y1="298" x2="512" y2="298" stroke="#F4511E" stroke-width="2.2" />

          <!-- Precision Equilibrium Beam & Orange Fulcrum -->
          <line x1="166" y1="318" x2="166" y2="344" class="sc-stroke-ink" stroke-width="2" />
          <line x1="434" y1="318" x2="434" y2="344" class="sc-stroke-ink" stroke-width="2" />
          <line x1="146" y1="344" x2="454" y2="344" class="sc-stroke-ink" stroke-width="2.4" stroke-linecap="round" />
          <polygon points="300,346 288,368 312,368" fill="#F4511E" />
        </svg>
      </Transition>
    </div>

    <!-- Bottom Caption & Interactive Slide Controls -->
    <footer class="relative z-10 max-w-xl">
      <Transition name="showcase-caption" mode="out-in">
        <div :key="activeIndex" class="min-h-[96px]">
          <h2 class="text-2xl xl:text-3xl font-black tracking-tight leading-snug sc-text-ink">
            {{ currentSlide.title }}
          </h2>
          <p class="text-sm xl:text-base font-medium mt-2 leading-relaxed sc-text-muted">
            {{ currentSlide.description }}
          </p>
        </div>
      </Transition>

      <!-- Segmented Progress Bars + Prev / Next Buttons -->
      <div class="flex items-center gap-4 mt-6">
        <div
          class="flex-1 grid gap-2"
          :style="{ gridTemplateColumns: `repeat(${slides.length}, minmax(0, 1fr))` }"
          role="tablist"
          aria-label="Feature slides"
        >
          <button
            v-for="(slide, idx) in slides"
            :key="slide.id"
            type="button"
            role="tab"
            :aria-selected="activeIndex === idx"
            :aria-label="`${idx + 1}. ${slide.title}`"
            @click="goToSlide(idx)"
            class="group py-2 cursor-pointer focus:outline-none"
          >
            <span class="block w-full h-1.5 rounded-full overflow-hidden sc-progress-track">
              <!-- Completed Past Slide -->
              <span
                v-if="idx < activeIndex"
                class="block h-full w-full bg-primary rounded-full"
              ></span>
              <!-- Currently Playing Slide (Pure GPU scaleX CSS Animation, Zero JS Timers) -->
              <span
                v-else-if="idx === activeIndex && !prefersReducedMotion"
                :key="`${activeIndex}-${cycleKey}`"
                class="block h-full w-full bg-primary rounded-full progress-active-fill"
                @animationend="handleSlideComplete"
              ></span>
              <!-- Reduced-Motion Static Active Indicator -->
              <span
                v-else-if="idx === activeIndex && prefersReducedMotion"
                class="block h-full w-full bg-primary rounded-full"
              ></span>
            </span>
          </button>
        </div>

        <div class="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            @click="prevSlide"
            :aria-label="$t('auth.showcase.prevSlide')"
            class="w-8 h-8 rounded-lg sc-nav-btn flex items-center justify-center transition-all cursor-pointer active:scale-95"
          >
            <ChevronLeft class="w-4 h-4" />
          </button>
          <button
            type="button"
            @click="nextSlide"
            :aria-label="$t('auth.showcase.nextSlide')"
            class="w-8 h-8 rounded-lg sc-nav-btn flex items-center justify-center transition-all cursor-pointer active:scale-95"
          >
            <ChevronRight class="w-4 h-4" />
          </button>
        </div>
      </div>
    </footer>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { ChevronLeft, ChevronRight } from 'lucide-vue-next';
import { t } from '../../i18n';

const props = withDefaults(
  defineProps<{
    paused?: boolean;
  }>(),
  {
    paused: false
  }
);

const STORAGE_CANVAS_KEY = 'jenga_login_canvas';

const readInitialCanvas = (): 'paper' | 'ink' => {
  try {
    const saved = localStorage.getItem(STORAGE_CANVAS_KEY);
    if (saved === 'ink' || saved === 'paper') return saved;
  } catch {
    // Ignore storage access errors in restricted contexts
  }
  return 'paper';
};

const canvasMode = ref<'paper' | 'ink'>(readInitialCanvas());
const activeIndex = ref(0);
const cycleKey = ref(0);
const isHovered = ref(false);
const isFocused = ref(false);
const isTabHidden = ref(false);
const isDesktopViewport = ref(typeof window !== 'undefined' ? window.innerWidth >= 1024 : true);
const prefersReducedMotion = ref(false);

const slides = computed(() => [
  {
    id: 'stock-network',
    tag: t('auth.showcase.s1Tag'),
    title: t('auth.showcase.s1Title'),
    description: t('auth.showcase.s1Desc')
  },
  {
    id: 'ai-assistant',
    tag: t('auth.showcase.aiTag'),
    title: t('auth.showcase.aiTitle'),
    description: t('auth.showcase.aiDesc')
  },
  {
    id: 'multi-device',
    tag: t('auth.showcase.s2Tag'),
    title: t('auth.showcase.s2Title'),
    description: t('auth.showcase.s2Desc')
  },
  {
    id: 'smart-alerts',
    tag: t('auth.showcase.s3Tag'),
    title: t('auth.showcase.s3Title'),
    description: t('auth.showcase.s3Desc')
  },
  {
    id: 'rapid-pos',
    tag: t('auth.showcase.s4Tag'),
    title: t('auth.showcase.s4Title'),
    description: t('auth.showcase.s4Desc')
  },
  {
    id: 'double-entry',
    tag: t('auth.showcase.s5Tag'),
    title: t('auth.showcase.s5Title'),
    description: t('auth.showcase.s5Desc')
  }
]);

const currentSlide = computed(() => slides.value[activeIndex.value] ?? slides.value[0]!);

const isEffectivelyPaused = computed(() => {
  return (
    props.paused ||
    isHovered.value ||
    isFocused.value ||
    isTabHidden.value ||
    !isDesktopViewport.value ||
    prefersReducedMotion.value
  );
});

const toggleCanvasMode = () => {
  canvasMode.value = canvasMode.value === 'paper' ? 'ink' : 'paper';
  try {
    localStorage.setItem(STORAGE_CANVAS_KEY, canvasMode.value);
  } catch {
    // Ignore storage write errors
  }
};

const goToSlide = (idx: number) => {
  const total = slides.value.length;
  activeIndex.value = ((idx % total) + total) % total;
  cycleKey.value += 1;
};

const nextSlide = () => {
  goToSlide(activeIndex.value + 1);
};

const prevSlide = () => {
  goToSlide(activeIndex.value - 1);
};

const handleSlideComplete = () => {
  if (!isEffectivelyPaused.value) {
    nextSlide();
  }
};

let desktopMql: MediaQueryList | null = null;
let motionMql: MediaQueryList | null = null;

const onDesktopMediaChange = (e: MediaQueryListEvent) => {
  isDesktopViewport.value = e.matches;
};

const onMotionMediaChange = (e: MediaQueryListEvent) => {
  prefersReducedMotion.value = e.matches;
};

const onVisibilityChange = () => {
  isTabHidden.value = document.hidden;
};

onMounted(() => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    desktopMql = window.matchMedia('(min-width: 1024px)');
    isDesktopViewport.value = desktopMql.matches;
    desktopMql.addEventListener('change', onDesktopMediaChange);

    motionMql = window.matchMedia('(prefers-reduced-motion: reduce)');
    prefersReducedMotion.value = motionMql.matches;
    motionMql.addEventListener('change', onMotionMediaChange);
  }
  if (typeof document !== 'undefined') {
    isTabHidden.value = document.hidden;
    document.addEventListener('visibilitychange', onVisibilityChange);
  }
});

onUnmounted(() => {
  desktopMql?.removeEventListener('change', onDesktopMediaChange);
  motionMql?.removeEventListener('change', onMotionMediaChange);
  if (typeof document !== 'undefined') {
    document.removeEventListener('visibilitychange', onVisibilityChange);
  }
});
</script>

<style scoped>
/* ==========================================================================
   Scoped Monochrome + Surgical Orange Tokens (Zero Global Bleed)
   ========================================================================== */
.theme-paper {
  --sc-bg: #f8fafc;
  --sc-card: #ffffff;
  --sc-sub: #f1f5f9;
  --sc-ink: #0f172a;
  --sc-muted: #475569;
  --sc-line: #cbd5e1;
  --sc-grid: #cbd5e1;
  --sc-track: #e2e8f0;
  background-color: var(--sc-bg);
}

.theme-ink {
  --sc-bg: #0b1118;
  --sc-card: #111a24;
  --sc-sub: #182433;
  --sc-ink: #f8fafc;
  --sc-muted: #94a3b8;
  --sc-line: #334155;
  --sc-grid: #1e293b;
  --sc-track: #1e293b;
  background-color: var(--sc-bg);
}

.showcase-grid {
  background-image: radial-gradient(var(--sc-grid) 1.15px, transparent 1.15px);
  background-size: 22px 22px;
  opacity: 0.65;
}

.showcase-vignette {
  background: radial-gradient(circle at 50% 48%, transparent 48%, var(--sc-bg) 100%);
  opacity: 0.72;
}

.sc-text-ink {
  color: var(--sc-ink);
}
.sc-text-muted {
  color: var(--sc-muted);
}
.sc-divider-dot {
  width: 4px;
  height: 4px;
  border-radius: 9999px;
  background-color: var(--sc-line);
}
.sc-badge {
  background-color: var(--sc-card);
  color: var(--sc-muted);
  border: 1px solid var(--sc-line);
}
.sc-nav-btn {
  background-color: var(--sc-card);
  color: var(--sc-ink);
  border: 1px solid var(--sc-line);
}
.sc-nav-btn:hover {
  border-color: #f4511e;
  color: #f4511e;
}
.sc-progress-track {
  background-color: var(--sc-track);
}

.reg-mark {
  position: absolute;
  font-family: var(--font-mono);
  font-size: 14px;
  line-height: 1;
  color: var(--sc-line);
  pointer-events: none;
}

/* SVG Color Helpers */
.sc-fill-card {
  fill: var(--sc-card);
}
.sc-fill-sub {
  fill: var(--sc-sub);
}
.sc-fill-ink {
  fill: var(--sc-ink);
}
.sc-stroke-ink {
  stroke: var(--sc-ink);
}
.sc-stroke-muted {
  stroke: var(--sc-muted);
}
.sc-stroke-line {
  stroke: var(--sc-line);
}
.sc-text-svg-ink {
  fill: var(--sc-ink);
}
.sc-text-svg-muted {
  fill: var(--sc-muted);
}

/* ==========================================================================
   GPU-Composited Keyframes (transform, opacity, stroke-dashoffset ONLY)
   ========================================================================== */
@keyframes progressScale {
  from {
    transform: scaleX(0);
  }
  to {
    transform: scaleX(1);
  }
}

.progress-active-fill {
  transform-origin: left center;
  will-change: transform;
  animation: progressScale 6800ms linear forwards;
}

@keyframes dashFlow {
  from {
    stroke-dashoffset: 56;
  }
  to {
    stroke-dashoffset: 0;
  }
}

@keyframes dashFlowReverse {
  from {
    stroke-dashoffset: 0;
  }
  to {
    stroke-dashoffset: 56;
  }
}

/* Slide 1: Warehouse -> Branch & Inter-Branch Parcels */
@keyframes pktWhLeft {
  0% {
    transform: translate(300px, 124px);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  38% {
    transform: translate(300px, 178px);
  }
  72% {
    transform: translate(112px, 178px);
  }
  92% {
    transform: translate(112px, 234px);
    opacity: 1;
  }
  100% {
    transform: translate(112px, 238px);
    opacity: 0;
  }
}

@keyframes pktWhCenter {
  0%,
  16% {
    transform: translate(300px, 124px);
    opacity: 0;
  }
  26% {
    opacity: 1;
  }
  84% {
    transform: translate(300px, 234px);
    opacity: 1;
  }
  100% {
    transform: translate(300px, 238px);
    opacity: 0;
  }
}

@keyframes pktWhRight {
  0%,
  20% {
    transform: translate(300px, 124px);
    opacity: 0;
  }
  30% {
    opacity: 1;
  }
  52% {
    transform: translate(300px, 178px);
  }
  80% {
    transform: translate(488px, 178px);
  }
  94% {
    transform: translate(488px, 234px);
    opacity: 1;
  }
  100% {
    transform: translate(488px, 238px);
    opacity: 0;
  }
}

@keyframes pktPeer1 {
  0%,
  32% {
    transform: translate(174px, 306px);
    opacity: 0;
  }
  42% {
    opacity: 1;
  }
  88% {
    transform: translate(236px, 306px);
    opacity: 1;
  }
  100% {
    transform: translate(240px, 306px);
    opacity: 0;
  }
}

@keyframes pktPeer2 {
  0%,
  48% {
    transform: translate(362px, 306px);
    opacity: 0;
  }
  58% {
    opacity: 1;
  }
  92% {
    transform: translate(424px, 306px);
    opacity: 1;
  }
  100% {
    transform: translate(428px, 306px);
    opacity: 0;
  }
}

@keyframes pulseRing {
  0%,
  65% {
    transform: scale(0.75);
    opacity: 0;
  }
  80% {
    opacity: 0.9;
  }
  100% {
    transform: scale(2.15);
    opacity: 0;
  }
}

@keyframes barBreathe {
  0%,
  100% {
    opacity: 0.78;
  }
  50% {
    opacity: 1;
  }
}

/* Slide 2: Multi-Device Sync */
@keyframes syncRunner {
  0% {
    transform: translateX(0px);
    opacity: 0;
  }
  12% {
    opacity: 1;
  }
  88% {
    opacity: 1;
  }
  100% {
    transform: translateX(374px);
    opacity: 0;
  }
}

@keyframes devPing {
  0%,
  100% {
    transform: scale(0.92);
    opacity: 0.45;
  }
  50% {
    transform: scale(1.22);
    opacity: 1;
  }
}

/* Slide 3: 5-Card Alert Spotlight Sequence */
@keyframes alertSpotlight1 {
  0%,
  18% {
    opacity: 1;
    transform: translateX(8px);
  }
  22%,
  100% {
    opacity: 0.44;
    transform: translateX(0px);
  }
}
@keyframes alertSpotlight2 {
  0%,
  18% {
    opacity: 0.44;
    transform: translateX(0px);
  }
  22%,
  38% {
    opacity: 1;
    transform: translateX(8px);
  }
  42%,
  100% {
    opacity: 0.44;
    transform: translateX(0px);
  }
}
@keyframes alertSpotlight3 {
  0%,
  38% {
    opacity: 0.44;
    transform: translateX(0px);
  }
  42%,
  58% {
    opacity: 1;
    transform: translateX(8px);
  }
  62%,
  100% {
    opacity: 0.44;
    transform: translateX(0px);
  }
}
@keyframes alertSpotlight4 {
  0%,
  58% {
    opacity: 0.44;
    transform: translateX(0px);
  }
  62%,
  78% {
    opacity: 1;
    transform: translateX(8px);
  }
  82%,
  100% {
    opacity: 0.44;
    transform: translateX(0px);
  }
}
@keyframes alertSpotlight5 {
  0%,
  78% {
    opacity: 0.44;
    transform: translateX(0px);
  }
  82%,
  97% {
    opacity: 1;
    transform: translateX(8px);
  }
  100% {
    opacity: 0.44;
    transform: translateX(0px);
  }
}

/* Slide 4: Barcode Laser & Receipt Feed */
@keyframes laserSweep {
  0%,
  100% {
    transform: translateY(-34px);
    opacity: 0.55;
  }
  50% {
    transform: translateY(34px);
    opacity: 1;
  }
}

@keyframes receiptEject {
  0%,
  100% {
    transform: translateY(8px);
  }
  55%,
  85% {
    transform: translateY(-4px);
  }
}

/* Slide 5: Double-Entry Symmetric Pulses */
@keyframes ledgerSplitLeft {
  0% {
    transform: translate(300px, 108px);
    opacity: 0;
  }
  15% {
    opacity: 1;
  }
  45% {
    transform: translate(300px, 148px);
  }
  75% {
    transform: translate(166px, 176px);
  }
  92% {
    transform: translate(166px, 202px);
    opacity: 1;
  }
  100% {
    transform: translate(166px, 206px);
    opacity: 0;
  }
}

@keyframes ledgerSplitRight {
  0% {
    transform: translate(300px, 108px);
    opacity: 0;
  }
  15% {
    opacity: 1;
  }
  45% {
    transform: translate(300px, 148px);
  }
  75% {
    transform: translate(434px, 176px);
  }
  92% {
    transform: translate(434px, 202px);
    opacity: 1;
  }
  100% {
    transform: translate(434px, 206px);
    opacity: 0;
  }
}

/* Animation Utility Bindings */
@keyframes aiCursorBlink {
  0%,
  49% {
    opacity: 1;
  }
  50%,
  100% {
    opacity: 0.15;
  }
}

@keyframes aiOrbitSpin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes aiStarBreathe {
  0%,
  100% {
    transform: scale(0.94);
    opacity: 0.9;
  }
  50% {
    transform: scale(1.08);
    opacity: 1;
  }
}

@keyframes aiPktIn {
  0% {
    transform: translate(176px, 195px);
    opacity: 0;
  }
  12% {
    opacity: 1;
  }
  34% {
    transform: translate(232px, 195px);
    opacity: 1;
  }
  40%,
  100% {
    transform: translate(236px, 195px);
    opacity: 0;
  }
}

@keyframes aiPktOut1 {
  0%,
  30% {
    transform: translate(316px, 195px);
    opacity: 0;
  }
  38% {
    opacity: 1;
  }
  54% {
    transform: translate(348px, 195px);
  }
  78% {
    transform: translate(348px, 58px);
  }
  92% {
    transform: translate(378px, 58px);
    opacity: 1;
  }
  100% {
    transform: translate(382px, 58px);
    opacity: 0;
  }
}

@keyframes aiPktOut2 {
  0%,
  36% {
    transform: translate(316px, 195px);
    opacity: 0;
  }
  44% {
    opacity: 1;
  }
  58% {
    transform: translate(348px, 195px);
  }
  80% {
    transform: translate(348px, 149px);
  }
  94% {
    transform: translate(378px, 149px);
    opacity: 1;
  }
  100% {
    transform: translate(382px, 149px);
    opacity: 0;
  }
}

@keyframes aiPktOut3 {
  0%,
  42% {
    transform: translate(316px, 195px);
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  64% {
    transform: translate(348px, 195px);
  }
  82% {
    transform: translate(348px, 241px);
  }
  95% {
    transform: translate(378px, 241px);
    opacity: 1;
  }
  100% {
    transform: translate(382px, 241px);
    opacity: 0;
  }
}

@keyframes aiPktOut4 {
  0%,
  48% {
    transform: translate(316px, 195px);
    opacity: 0;
  }
  56% {
    opacity: 1;
  }
  68% {
    transform: translate(348px, 195px);
  }
  86% {
    transform: translate(348px, 332px);
  }
  96% {
    transform: translate(378px, 332px);
    opacity: 1;
  }
  100% {
    transform: translate(382px, 332px);
    opacity: 0;
  }
}

@keyframes aiCardHighlight1 {
  0%,
  25% {
    opacity: 1;
    transform: translateX(6px);
  }
  30%,
  100% {
    opacity: 0.56;
    transform: translateX(0px);
  }
}
@keyframes aiCardHighlight2 {
  0%,
  25% {
    opacity: 0.56;
    transform: translateX(0px);
  }
  30%,
  50% {
    opacity: 1;
    transform: translateX(6px);
  }
  55%,
  100% {
    opacity: 0.56;
    transform: translateX(0px);
  }
}
@keyframes aiCardHighlight3 {
  0%,
  50% {
    opacity: 0.56;
    transform: translateX(0px);
  }
  55%,
  75% {
    opacity: 1;
    transform: translateX(6px);
  }
  80%,
  100% {
    opacity: 0.56;
    transform: translateX(0px);
  }
}
@keyframes aiCardHighlight4 {
  0%,
  75% {
    opacity: 0.56;
    transform: translateX(0px);
  }
  80%,
  98% {
    opacity: 1;
    transform: translateX(6px);
  }
  100% {
    opacity: 0.56;
    transform: translateX(0px);
  }
}

.ai-cursor-blink {
  animation: aiCursorBlink 1.1s steps(1) infinite;
}
.ai-orbit-spin {
  transform-box: fill-box;
  transform-origin: center;
  animation: aiOrbitSpin 20s linear infinite;
}
.ai-star-breathe {
  transform-box: fill-box;
  transform-origin: center;
  animation: aiStarBreathe 2.4s ease-in-out infinite;
}
.ai-pkt-in {
  will-change: transform, opacity;
  animation: aiPktIn 3.2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}
.ai-pkt-out-1 {
  will-change: transform, opacity;
  animation: aiPktOut1 3.2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}
.ai-pkt-out-2 {
  will-change: transform, opacity;
  animation: aiPktOut2 3.2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}
.ai-pkt-out-3 {
  will-change: transform, opacity;
  animation: aiPktOut3 3.2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}
.ai-pkt-out-4 {
  will-change: transform, opacity;
  animation: aiPktOut4 3.2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}
.ai-card-1 {
  will-change: transform, opacity;
  animation: aiCardHighlight1 6.4s ease-in-out infinite;
}
.ai-card-2 {
  will-change: transform, opacity;
  animation: aiCardHighlight2 6.4s ease-in-out infinite;
}
.ai-card-3 {
  will-change: transform, opacity;
  animation: aiCardHighlight3 6.4s ease-in-out infinite;
}
.ai-card-4 {
  will-change: transform, opacity;
  animation: aiCardHighlight4 6.4s ease-in-out infinite;
}

.anim-dash {
  stroke-dasharray: 7 7;
  animation: dashFlow 1.8s linear infinite;
}
.anim-dash-reverse {
  stroke-dasharray: 6 7;
  animation: dashFlowReverse 2.2s linear infinite;
}
.pkt-wh-left {
  will-change: transform, opacity;
  animation: pktWhLeft 3.4s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}
.pkt-wh-center {
  will-change: transform, opacity;
  animation: pktWhCenter 3.4s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}
.pkt-wh-right {
  will-change: transform, opacity;
  animation: pktWhRight 3.4s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}
.pkt-peer-1 {
  will-change: transform, opacity;
  animation: pktPeer1 3.4s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}
.pkt-peer-2 {
  will-change: transform, opacity;
  animation: pktPeer2 3.4s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}
.ring-pulse {
  transform-box: fill-box;
  transform-origin: center;
  animation: pulseRing 3.4s ease-out infinite;
}
.ring-pulse-delay-1 {
  transform-box: fill-box;
  transform-origin: center;
  animation: pulseRing 3.4s ease-out infinite 0.35s;
}
.ring-pulse-delay-2 {
  transform-box: fill-box;
  transform-origin: center;
  animation: pulseRing 3.4s ease-out infinite 0.55s;
}
.bar-breathe {
  animation: barBreathe 2.4s ease-in-out infinite;
}
.sync-runner {
  will-change: transform, opacity;
  animation: syncRunner 2.8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}
.dev-ping {
  transform-box: fill-box;
  transform-origin: center;
  animation: devPing 2.4s ease-in-out infinite;
}
.alert-seq-1 {
  will-change: transform, opacity;
  animation: alertSpotlight1 6.8s ease-in-out infinite;
}
.alert-seq-2 {
  will-change: transform, opacity;
  animation: alertSpotlight2 6.8s ease-in-out infinite;
}
.alert-seq-3 {
  will-change: transform, opacity;
  animation: alertSpotlight3 6.8s ease-in-out infinite;
}
.alert-seq-4 {
  will-change: transform, opacity;
  animation: alertSpotlight4 6.8s ease-in-out infinite;
}
.alert-seq-5 {
  will-change: transform, opacity;
  animation: alertSpotlight5 6.8s ease-in-out infinite;
}
.laser-sweep {
  will-change: transform, opacity;
  animation: laserSweep 2.1s ease-in-out infinite;
}
.receipt-eject {
  will-change: transform;
  animation: receiptEject 3s ease-in-out infinite;
}
.ledger-pkt-left {
  will-change: transform, opacity;
  animation: ledgerSplitLeft 2.8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}
.ledger-pkt-right {
  will-change: transform, opacity;
  animation: ledgerSplitRight 2.8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}

/* Global Pause & Reduced Motion Enforcement */
.is-paused *,
.is-paused .progress-active-fill {
  animation-play-state: paused !important;
}

@media (prefers-reduced-motion: reduce) {
  .showcase-root * {
    animation: none !important;
    transition: none !important;
  }
}

/* Smooth Vue Slide Transitions */
.showcase-scene-enter-active,
.showcase-scene-leave-active {
  transition: opacity 0.28s ease, transform 0.28s cubic-bezier(0.22, 1, 0.36, 1);
}
.showcase-scene-enter-from {
  opacity: 0;
  transform: translateX(14px);
}
.showcase-scene-leave-to {
  opacity: 0;
  transform: translateX(-14px);
}

.showcase-caption-enter-active,
.showcase-caption-leave-active {
  transition: opacity 0.22s ease, transform 0.22s ease;
}
.showcase-caption-enter-from {
  opacity: 0;
  transform: translateY(6px);
}
.showcase-caption-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
