import { ref, computed } from 'vue';
import router from '../router';
import { api } from '../services/api';

export interface TourStep {
  id: string;
  target?: string; // CSS selector e.g. '[data-tour="hero-kpis"]', undefined for center modal
  titleKey: string;
  descKey: string;
  badgeKey: string;
  iconName: string;
  tab?: 'summary' | 'collection' | 'stock';
  page: 'dashboard' | 'settings';
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

// Global reactive tour state
const isTourActive = ref(false);
const currentStepIndex = ref(0);
const activeTourType = ref<'dashboard' | 'settings'>('dashboard');

// Tab change listener registered by DashboardView
let tabChangeHandler: ((tab: 'summary' | 'collection' | 'stock') => void) | null = null;

export const registerTabChangeHandler = (handler: (tab: 'summary' | 'collection' | 'stock') => void) => {
  tabChangeHandler = handler;
};

export const unregisterTabChangeHandler = () => {
  tabChangeHandler = null;
};

// Tour Steps Definitions
const DASHBOARD_STEPS: TourStep[] = [
  {
    id: 'welcome',
    target: '[data-tour="dashboard-header"]',
    titleKey: 'tour.welcomeTitle',
    descKey: 'tour.welcomeDesc',
    badgeKey: 'tour.dashboardBadge',
    iconName: 'Sparkles',
    tab: 'summary',
    page: 'dashboard',
    placement: 'bottom'
  },
  {
    id: 'hero-kpis',
    target: '[data-tour="hero-kpis"]',
    titleKey: 'tour.kpiTitle',
    descKey: 'tour.kpiDesc',
    badgeKey: 'tour.summaryTabBadge',
    iconName: 'Activity',
    tab: 'summary',
    page: 'dashboard',
    placement: 'bottom'
  },
  {
    id: 'period-controls',
    target: '[data-tour="period-controls"]',
    titleKey: 'tour.periodTitle',
    descKey: 'tour.periodDesc',
    badgeKey: 'tour.summaryTabBadge',
    iconName: 'Calendar',
    tab: 'summary',
    page: 'dashboard',
    placement: 'bottom'
  },
  {
    id: 'velocity-chart',
    target: '[data-tour="velocity-chart"]',
    titleKey: 'tour.velocityTitle',
    descKey: 'tour.velocityDesc',
    badgeKey: 'tour.summaryTabBadge',
    iconName: 'TrendingUp',
    tab: 'summary',
    page: 'dashboard',
    placement: 'top'
  },
  {
    id: 'dashboard-tabs',
    target: '[data-tour="dashboard-tabs"]',
    titleKey: 'tour.tabsTitle',
    descKey: 'tour.tabsDesc',
    badgeKey: 'tour.dashboardBadge',
    iconName: 'LayoutDashboard',
    tab: 'summary',
    page: 'dashboard',
    placement: 'bottom'
  },
  {
    id: 'collection-cards',
    target: '[data-tour="collection-cards"]',
    titleKey: 'tour.collectionTitle',
    descKey: 'tour.collectionDesc',
    badgeKey: 'tour.collectionTabBadge',
    iconName: 'HandCoins',
    tab: 'collection',
    page: 'dashboard',
    placement: 'bottom'
  },
  {
    id: 'stock-cards',
    target: '[data-tour="stock-cards"]',
    titleKey: 'tour.stockTitle',
    descKey: 'tour.stockDesc',
    badgeKey: 'tour.stockTabBadge',
    iconName: 'Boxes',
    tab: 'stock',
    page: 'dashboard',
    placement: 'bottom'
  },
  {
    id: 'dashboard-finish',
    titleKey: 'tour.dashboardCompleteTitle',
    descKey: 'tour.dashboardCompleteDesc',
    badgeKey: 'tour.dashboardBadge',
    iconName: 'CheckCircle2',
    page: 'dashboard',
    placement: 'center'
  }
];

const SETTINGS_STEPS: TourStep[] = [
  {
    id: 'settings-welcome',
    target: '[data-tour="settings-nav"]',
    titleKey: 'tour.settingsWelcomeTitle',
    descKey: 'tour.settingsWelcomeDesc',
    badgeKey: 'tour.settingsBadge',
    iconName: 'Sliders',
    page: 'settings',
    placement: 'right'
  },
  {
    id: 'settings-profile',
    target: '[data-tour="settings-profile"]',
    titleKey: 'tour.settingsProfileTitle',
    descKey: 'tour.settingsProfileDesc',
    badgeKey: 'tour.settingsBadge',
    iconName: 'Store',
    page: 'settings',
    placement: 'right'
  },
  {
    id: 'settings-defaults',
    target: '[data-tour="settings-defaults"]',
    titleKey: 'tour.settingsDefaultsTitle',
    descKey: 'tour.settingsDefaultsDesc',
    badgeKey: 'tour.settingsBadge',
    iconName: 'Globe',
    page: 'settings',
    placement: 'right'
  },
  {
    id: 'settings-finance',
    target: '[data-tour="settings-finance"]',
    titleKey: 'tour.settingsFinanceTitle',
    descKey: 'tour.settingsFinanceDesc',
    badgeKey: 'tour.settingsBadge',
    iconName: 'Landmark',
    page: 'settings',
    placement: 'right'
  },
  {
    id: 'settings-hardware',
    target: '[data-tour="settings-hardware"]',
    titleKey: 'tour.settingsHardwareTitle',
    descKey: 'tour.settingsHardwareDesc',
    badgeKey: 'tour.settingsBadge',
    iconName: 'Printer',
    page: 'settings',
    placement: 'right'
  },
  {
    id: 'settings-finish',
    titleKey: 'tour.settingsCompleteTitle',
    descKey: 'tour.settingsCompleteDesc',
    badgeKey: 'tour.settingsBadge',
    iconName: 'CheckCircle2',
    page: 'settings',
    placement: 'center'
  }
];

export function useAppTour() {
  const isStoreAdminOrManager = computed(() => {
    const role = (localStorage.getItem('cashierRole') || '').toUpperCase();
    return role === 'ADMIN' || role === 'SUPER_ADMIN' || role === 'MANAGER';
  });

  const activeSteps = computed(() => {
    return activeTourType.value === 'dashboard' ? DASHBOARD_STEPS : SETTINGS_STEPS;
  });

  const currentStep = computed<TourStep | null>(() => {
    if (!isTourActive.value) return null;
    return activeSteps.value[currentStepIndex.value] || null;
  });

  const totalSteps = computed(() => activeSteps.value.length);
  const isFirstStep = computed(() => currentStepIndex.value === 0);
  const isLastStep = computed(() => currentStepIndex.value >= activeSteps.value.length - 1);

  const syncStepState = (step: TourStep) => {
    if (step.tab && tabChangeHandler) {
      tabChangeHandler(step.tab);
    }
  };

  const startTour = (type: 'dashboard' | 'settings' = 'dashboard') => {
    if (!isStoreAdminOrManager.value) return;
    activeTourType.value = type;
    currentStepIndex.value = 0;
    isTourActive.value = true;

    const firstStep = activeSteps.value[0];
    if (firstStep) {
      syncStepState(firstStep);
    }
  };

  const nextStep = () => {
    if (currentStepIndex.value < activeSteps.value.length - 1) {
      currentStepIndex.value++;
      const step = activeSteps.value[currentStepIndex.value];
      if (step) {
        syncStepState(step);
      }
    } else {
      finishTour();
    }
  };

  const prevStep = () => {
    if (currentStepIndex.value > 0) {
      currentStepIndex.value--;
      const step = activeSteps.value[currentStepIndex.value];
      if (step) {
        syncStepState(step);
      }
    }
  };

  const jumpToStep = (index: number) => {
    if (index >= 0 && index < activeSteps.value.length) {
      currentStepIndex.value = index;
      const step = activeSteps.value[index];
      if (step) {
        syncStepState(step);
      }
    }
  };

  const skipTour = () => {
    isTourActive.value = false;
    currentStepIndex.value = 0;
    sessionStorage.removeItem('jenga_tour_pending_poc');
    localStorage.setItem('hasTakenTour', 'true');
  };

  const finishTour = () => {
    isTourActive.value = false;
    currentStepIndex.value = 0;
    sessionStorage.removeItem('jenga_tour_pending_poc');
    localStorage.setItem('hasTakenTour', 'true');
    localStorage.setItem('jenga_tour_completed', 'true');
    api.put('/api/users/tour-status?completed=true').catch(() => {});
  };

  const navigateToSettingsTour = () => {
    finishTour();
    router.push('/settings').then(() => {
      setTimeout(() => {
        startTour('settings');
      }, 400);
    });
  };

  /**
   * Check whether the tour should automatically launch.
   * Checks if user has already taken tour or if tour is queued.
   */
  const checkAndAutoStart = (routePath: string) => {
    if (!isStoreAdminOrManager.value) return;

    // Do not auto-start if already taken
    if (localStorage.getItem('hasTakenTour') === 'true') {
      sessionStorage.removeItem('jenga_tour_pending_poc');
      return;
    }

    const isPending = sessionStorage.getItem('jenga_tour_pending_poc') === 'true';
    if (isPending && (routePath === '/dashboard' || routePath.startsWith('/dashboard'))) {
      sessionStorage.removeItem('jenga_tour_pending_poc');
      setTimeout(() => {
        startTour('dashboard');
      }, 600);
    } else if (isPending && (routePath === '/settings' || routePath.startsWith('/settings'))) {
      sessionStorage.removeItem('jenga_tour_pending_poc');
      setTimeout(() => {
        startTour('settings');
      }, 600);
    }
  };

  return {
    isTourActive,
    currentStepIndex,
    activeTourType,
    currentStep,
    totalSteps,
    isFirstStep,
    isLastStep,
    isStoreAdminOrManager,
    startTour,
    nextStep,
    prevStep,
    jumpToStep,
    skipTour,
    finishTour,
    navigateToSettingsTour,
    checkAndAutoStart
  };
}
