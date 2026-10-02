<template>
  <div class="p-6 md:p-8 max-w-7xl mx-auto font-sans min-h-screen pb-20">
    <!-- Header Banner -->
    <div class="mb-8 bg-surface-container-low border border-outline-variant rounded-2xl p-6 md:p-8 shadow-xs relative overflow-hidden">
      <div class="absolute -right-10 -bottom-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
      
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        <div class="max-w-2xl">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-3">
            <HelpCircle class="w-3.5 h-3.5" />
            <span>{{ $t('help.centerBadge') }}</span>
          </div>
          <h1 class="text-2xl md:text-3xl font-extrabold text-on-surface tracking-tight leading-tight mb-2">
            {{ $t('help.title') }}
          </h1>
          <p class="text-on-surface-variant text-sm md:text-base leading-relaxed">
            {{ $t('help.subtitle') }}
          </p>
        </div>

        <!-- Support Badge / Quick AI Trigger -->
        <div class="flex flex-wrap items-center gap-3 shrink-0">
          <button 
            @click="openAiDrawer"
            class="px-4 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-sm hover:opacity-95 transition-all shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <Sparkles class="w-4 h-4 text-on-primary" />
            <span>{{ $t('help.askJengaAi') }}</span>
          </button>
        </div>
      </div>

      <!-- Search Input -->
      <div class="mt-6 relative max-w-2xl">
        <Search class="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/60" />
        <input 
          v-model="searchQuery"
          type="text"
          :placeholder="$t('help.searchPlaceholder')"
          class="w-full pl-11 pr-10 py-3.5 bg-surface border border-outline-variant rounded-xl text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-xs"
        />
        <button 
          v-if="searchQuery" 
          @click="searchQuery = ''"
          class="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
        >
          <X class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- Main View Switcher Tabs -->
    <div class="flex items-center gap-2 border-b border-outline-variant mb-6 pb-2 overflow-x-auto">
      <button 
        @click="activeMainTab = 'all'"
        class="px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2"
        :class="activeMainTab === 'all' ? 'bg-primary text-on-primary shadow-xs' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/40'"
      >
        <BookOpen class="w-4 h-4" />
        <span>{{ $t('help.tabAll') }}</span>
      </button>

      <button 
        @click="activeMainTab = 'faq'"
        class="px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2"
        :class="activeMainTab === 'faq' ? 'bg-primary text-on-primary shadow-xs' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/40'"
      >
        <HelpCircle class="w-4 h-4" />
        <span>{{ $t('help.tabFaq') }}</span>
        <span class="px-1.5 py-0.5 text-xs rounded-full" :class="activeMainTab === 'faq' ? 'bg-white/20 text-white' : 'bg-surface-container-high text-on-surface-variant'">
          {{ totalFilteredFaqs }}
        </span>
      </button>

      <button 
        @click="activeMainTab = 'sop'"
        class="px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2"
        :class="activeMainTab === 'sop' ? 'bg-primary text-on-primary shadow-xs' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/40'"
      >
        <FileText class="w-4 h-4" />
        <span>{{ $t('help.tabSop') }}</span>
        <span class="px-1.5 py-0.5 text-xs rounded-full" :class="activeMainTab === 'sop' ? 'bg-white/20 text-white' : 'bg-surface-container-high text-on-surface-variant'">
          {{ sopDocuments.length }}
        </span>
      </button>
    </div>

    <!-- Section: SOP PDF Downloads -->
    <section v-if="activeMainTab === 'all' || activeMainTab === 'sop'" class="mb-10">
      <div class="flex items-center justify-between gap-4 mb-4">
        <div>
          <h2 class="text-lg font-bold text-on-surface flex items-center gap-2">
            <FileText class="w-5 h-5 text-primary" />
            <span>{{ $t('help.sopSectionTitle') }}</span>
          </h2>
          <p class="text-xs text-on-surface-variant mt-0.5">
            {{ $t('help.sopSectionSubtitle') }}
          </p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div 
          v-for="sop in sopDocuments" 
          :key="sop.id"
          class="p-5 rounded-2xl bg-surface-container-low border border-outline-variant hover:border-primary/40 transition-all duration-200 flex flex-col justify-between gap-4 group hover:shadow-sm"
        >
          <div class="flex items-start gap-4">
            <div class="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-on-primary transition-colors">
              <FileSpreadsheet class="w-6 h-6" />
            </div>
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-surface-container-high border border-outline-variant text-on-surface-variant">
                  {{ sop.version }}
                </span>
                <span class="text-xs text-on-surface-variant font-medium">
                  {{ sop.fileSize }}
                </span>
              </div>
              <h3 class="text-base font-bold text-on-surface group-hover:text-primary transition-colors leading-snug">
                {{ sop.title }}
              </h3>
              <p class="text-xs text-on-surface-variant mt-1.5 leading-relaxed line-clamp-2">
                {{ sop.description }}
              </p>
            </div>
          </div>

          <div class="flex items-center justify-between gap-3 pt-3 border-t border-outline-variant/60">
            <span class="text-xs font-semibold text-on-surface-variant/70 flex items-center gap-1">
              <CheckCircle2 class="w-3.5 h-3.5 text-success" />
              <span>{{ $t('help.verifiedDoc') }}</span>
            </span>

            <div class="flex items-center gap-2">
              <a 
                :href="sop.downloadUrl"
                target="_blank"
                class="px-3 py-1.5 rounded-lg border border-outline-variant text-xs font-bold text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors flex items-center gap-1.5"
              >
                <Eye class="w-3.5 h-3.5" />
                <span>{{ $t('help.preview') }}</span>
              </a>
              <a 
                :href="sop.downloadUrl"
                :download="sop.fileName"
                class="px-3.5 py-1.5 rounded-lg bg-primary text-on-primary text-xs font-bold hover:opacity-95 transition-opacity shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Download class="w-3.5 h-3.5" />
                <span>{{ $t('help.downloadPdf') }}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Section: FAQ Categories & Accordion -->
    <section v-if="activeMainTab === 'all' || activeMainTab === 'faq'" class="mb-10">
      <div class="flex items-center justify-between gap-4 mb-4">
        <div>
          <h2 class="text-lg font-bold text-on-surface flex items-center gap-2">
            <HelpCircle class="w-5 h-5 text-primary" />
            <span>{{ $t('help.faqSectionTitle') }}</span>
          </h2>
          <p class="text-xs text-on-surface-variant mt-0.5">
            {{ $t('help.faqSectionSubtitle') }}
          </p>
        </div>
      </div>

      <!-- FAQ Category Chips Filter -->
      <div class="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        <button 
          v-for="cat in faqCategories"
          :key="cat.id"
          @click="selectedCategory = cat.id"
          class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2"
          :class="selectedCategory === cat.id ? 'bg-surface-container-highest text-primary border border-primary/30 shadow-xs' : 'bg-surface-container-low border border-outline-variant text-on-surface-variant hover:bg-surface-variant/40'"
        >
          <component :is="cat.icon" class="w-3.5 h-3.5" />
          <span>{{ cat.label }}</span>
        </button>
      </div>

      <!-- FAQ Results / Accordion List -->
      <div v-if="filteredFaqGroups.length === 0" class="p-12 text-center bg-surface-container-low border border-outline-variant rounded-2xl">
        <HelpCircle class="w-10 h-10 text-on-surface-variant/40 mx-auto mb-3" />
        <h3 class="text-base font-bold text-on-surface mb-1">{{ $t('help.noFaqFoundTitle') }}</h3>
        <p class="text-xs text-on-surface-variant max-w-md mx-auto mb-4">{{ $t('help.noFaqFoundDesc') }}</p>
        <button @click="resetSearch" class="px-4 py-2 rounded-xl bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-colors">
          {{ $t('help.clearFilters') }}
        </button>
      </div>

      <div v-else class="space-y-6">
        <div v-for="group in filteredFaqGroups" :key="group.id" class="space-y-3">
          <!-- Category Group Header -->
          <div class="flex items-center gap-2.5 border-b border-outline-variant pb-2">
            <component :is="group.icon" class="w-5 h-5 text-primary" />
            <h3 class="text-base font-bold text-on-surface">{{ group.label }}</h3>
            <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant ml-auto">
              {{ group.items.length }} {{ $t('help.questionsCount') }}
            </span>
          </div>

          <!-- Question Cards -->
          <div class="space-y-2.5">
            <div 
              v-for="item in group.items" 
              :key="item.id"
              class="border border-outline-variant rounded-xl bg-surface-container-low transition-all duration-200 overflow-hidden"
              :class="expandedFaqs[item.id] ? 'ring-1 ring-primary/30 border-primary/40 bg-surface' : 'hover:border-outline-variant/80'"
            >
              <button 
                @click="toggleFaq(item.id)"
                class="w-full p-4 text-left flex items-center justify-between gap-4 cursor-pointer"
              >
                <span class="text-sm font-bold text-on-surface leading-snug">{{ item.question }}</span>
                <ChevronDown 
                  class="w-4 h-4 text-on-surface-variant transition-transform duration-200 shrink-0" 
                  :class="expandedFaqs[item.id] ? 'rotate-180 text-primary' : ''"
                />
              </button>

              <div 
                v-if="expandedFaqs[item.id]" 
                class="px-4 pb-4 pt-1 text-xs md:text-sm text-on-surface-variant leading-relaxed border-t border-outline-variant/40 animate-fade-in space-y-2"
              >
                <div v-html="item.answer"></div>
                <div v-if="item.navPath" class="mt-3 p-2.5 rounded-lg bg-primary/5 border border-primary/10 flex items-center gap-2 text-xs text-primary font-medium">
                  <Navigation class="w-3.5 h-3.5 shrink-0" />
                  <span><strong>{{ $t('help.navPathLabel') }}:</strong> {{ item.navPath }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Support Contact Footer Card -->
    <div class="p-6 md:p-8 rounded-2xl bg-surface-container-high border border-outline-variant flex flex-col md:flex-row items-center justify-between gap-6">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-2xl bg-primary text-on-primary flex items-center justify-center shrink-0 shadow-sm">
          <Headphones class="w-6 h-6" />
        </div>
        <div>
          <h3 class="text-base font-bold text-on-surface">{{ $t('help.needMoreHelpTitle') }}</h3>
          <p class="text-xs text-on-surface-variant mt-0.5 max-w-md">{{ $t('help.needMoreHelpDesc') }}</p>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-4 w-full md:w-auto">
        <a 
          href="mailto:support@mainbranch.co" 
          class="px-4 py-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface font-bold text-xs hover:bg-surface-variant/50 transition-colors flex items-center justify-center gap-2 flex-1 md:flex-initial"
        >
          <Mail class="w-4 h-4 text-primary" />
          <span>support@mainbranch.co</span>
        </a>
        <a 
          href="tel:+255712345678" 
          class="px-4 py-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface font-bold text-xs hover:bg-surface-variant/50 transition-colors flex items-center justify-center gap-2 flex-1 md:flex-initial"
        >
          <Phone class="w-4 h-4 text-primary" />
          <span>+255 712 345 678</span>
        </a>
      </div>
    </div>
    <!-- Jenga AI Assistant Drawer -->
    <JengaAiDrawer 
      :is-open="showAiDrawer" 
      @close="showAiDrawer = false" 
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import JengaAiDrawer from '../components/dashboard/JengaAiDrawer.vue';
import { 
  HelpCircle, 
  Search, 
  X, 
  Sparkles, 
  BookOpen, 
  FileText, 
  FileSpreadsheet, 
  Download, 
  Eye, 
  CheckCircle2, 
  ChevronDown, 
  Navigation, 
  Headphones, 
  Mail, 
  Phone,
  Landmark,
  CreditCard,
  Package,
  BarChart3,
  Users,
  Settings,
  Layers
} from 'lucide-vue-next';
import { t } from '../i18n';

const searchQuery = ref('');
const activeMainTab = ref<'all' | 'faq' | 'sop'>('all');
const selectedCategory = ref('all');
const expandedFaqs = ref<Record<string, boolean>>({});
const showAiDrawer = ref(false);

const openAiDrawer = () => {
  showAiDrawer.value = true;
};

const toggleFaq = (id: string) => {
  expandedFaqs.value[id] = !expandedFaqs.value[id];
};

const resetSearch = () => {
  searchQuery.value = '';
  selectedCategory.value = 'all';
};

// Downloadable SOP Documents Metadata
const sopDocuments = computed(() => [
  {
    id: 'sop-discrepancy',
    title: t('help.sop1Title'),
    description: t('help.sop1Desc'),
    fileSize: '1.2 MB',
    version: 'v2.3.0',
    fileName: 'JENGA_POS_Shift_Discrepancy_SOP.pdf',
    downloadUrl: '/docs/JENGA_POS_Shift_Discrepancy_SOP.pdf'
  },
  {
    id: 'sop-eod',
    title: t('help.sop2Title'),
    description: t('help.sop2Desc'),
    fileSize: '980 KB',
    version: 'v2.3.0',
    fileName: 'JENGA_POS_End_of_Day_Reconciliation_Guide.pdf',
    downloadUrl: '/docs/JENGA_POS_End_of_Day_Reconciliation_Guide.pdf'
  },
  {
    id: 'sop-inventory',
    title: t('help.sop3Title'),
    description: t('help.sop3Desc'),
    fileSize: '1.1 MB',
    version: 'v2.3.0',
    fileName: 'JENGA_POS_Inventory_and_Stock_Control_SOP.pdf',
    downloadUrl: '/docs/JENGA_POS_Inventory_and_Stock_Control_SOP.pdf'
  },
  {
    id: 'sop-manual',
    title: t('help.sop4Title'),
    description: t('help.sop4Desc'),
    fileSize: '1.5 MB',
    version: 'v2.3.0',
    fileName: 'JENGA_POS_User_Manual_and_Quick_Start.pdf',
    downloadUrl: '/docs/JENGA_POS_User_Manual_and_Quick_Start.pdf'
  }
]);

// FAQ Categories
const faqCategories = computed(() => [
  { id: 'all', label: t('help.catAll'), icon: Layers },
  { id: 'pos', label: t('help.catPos'), icon: CreditCard },
  { id: 'inventory', label: t('help.catInventory'), icon: Package },
  { id: 'finance', label: t('help.catFinance'), icon: Landmark },
  { id: 'reports', label: t('help.catReports'), icon: BarChart3 },
  { id: 'customers', label: t('help.catCustomers'), icon: Users },
  { id: 'settings', label: t('help.catSettings'), icon: Settings }
]);

// Raw FAQ Content items
const allFaqGroups = computed(() => [
  {
    id: 'pos',
    label: t('help.catPos'),
    icon: CreditCard,
    items: [
      {
        id: 'pos-1',
        question: t('help.faqPos1Q'),
        answer: t('help.faqPos1A'),
        navPath: 'POS Checkout -> Start Register Session'
      },
      {
        id: 'pos-2',
        question: t('help.faqPos2Q'),
        answer: t('help.faqPos2A'),
        navPath: 'POS Checkout -> Payment Method -> On Credit'
      },
      {
        id: 'pos-3',
        question: t('help.faqPos3Q'),
        answer: t('help.faqPos3A'),
        navPath: 'POS Checkout -> End Register Shift -> Declare Cash Drawer'
      }
    ]
  },
  {
    id: 'inventory',
    label: t('help.catInventory'),
    icon: Package,
    items: [
      {
        id: 'inv-1',
        question: t('help.faqInv1Q'),
        answer: t('help.faqInv1A'),
        navPath: 'Inventory & Purchases -> Inventory -> Add Product'
      },
      {
        id: 'inv-2',
        question: t('help.faqInv2Q'),
        answer: t('help.faqInv2A'),
        navPath: 'Inventory & Purchases -> Inventory -> Restock / Adjustments'
      },
      {
        id: 'inv-3',
        question: t('help.faqInv3Q'),
        answer: t('help.faqInv3A'),
        navPath: 'Inventory & Purchases -> Purchases -> Receive Stock'
      }
    ]
  },
  {
    id: 'finance',
    label: t('help.catFinance'),
    icon: Landmark,
    items: [
      {
        id: 'fin-1',
        question: t('help.faqFin1Q'),
        answer: t('help.faqFin1A'),
        navPath: 'Top Navigation / Shift Bar -> Cash Movements'
      },
      {
        id: 'fin-2',
        question: t('help.faqFin2Q'),
        answer: t('help.faqFin2A'),
        navPath: 'Dashboard -> Shift Till Audit & Discrepancies'
      },
      {
        id: 'fin-3',
        question: t('help.faqFin3Q'),
        answer: t('help.faqFin3A'),
        navPath: 'Finance & Accounts -> Financial Statements -> Consolidate EOD'
      }
    ]
  },
  {
    id: 'reports',
    label: t('help.catReports'),
    icon: BarChart3,
    items: [
      {
        id: 'rep-1',
        question: t('help.faqRep1Q'),
        answer: t('help.faqRep1A'),
        navPath: 'Reports -> Export CSV / PDF'
      },
      {
        id: 'rep-2',
        question: t('help.faqRep2Q'),
        answer: t('help.faqRep2A'),
        navPath: 'Dashboard -> Inventory Command Center -> Stock Runway (DSI)'
      }
    ]
  },
  {
    id: 'customers',
    label: t('help.catCustomers'),
    icon: Users,
    items: [
      {
        id: 'cust-1',
        question: t('help.faqCust1Q'),
        answer: t('help.faqCust1A'),
        navPath: 'Customers -> Record Debt Payment'
      },
      {
        id: 'cust-2',
        question: t('help.faqCust2Q'),
        answer: t('help.faqCust2A'),
        navPath: 'Customers -> Edit Customer -> Credit Limit'
      }
    ]
  },
  {
    id: 'settings',
    label: t('help.catSettings'),
    icon: Settings,
    items: [
      {
        id: 'set-1',
        question: t('help.faqSet1Q'),
        answer: t('help.faqSet1A'),
        navPath: 'Top Navigation -> Switch Branch'
      },
      {
        id: 'set-2',
        question: t('help.faqSet2Q'),
        answer: t('help.faqSet2A'),
        navPath: 'User Management -> Add User'
      }
    ]
  }
]);

// Filtered FAQ Groups
const filteredFaqGroups = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  const category = selectedCategory.value;

  return allFaqGroups.value
    .filter(group => category === 'all' || group.id === category)
    .map(group => {
      const items = group.items.filter(item => {
        if (!query) return true;
        return (
          item.question.toLowerCase().includes(query) ||
          item.answer.toLowerCase().includes(query)
        );
      });
      return { ...group, items };
    })
    .filter(group => group.items.length > 0);
});

const totalFilteredFaqs = computed(() => {
  return filteredFaqGroups.value.reduce((acc, g) => acc + g.items.length, 0);
});
</script>
