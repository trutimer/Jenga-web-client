<template>
  <div class="relative font-sans" ref="dropdownRef">
    <!-- Bell Trigger Button -->
    <button
      @click="toggleDropdown"
      class="relative p-2.5 hover:bg-surface-container rounded-full transition-colors flex items-center justify-center cursor-pointer text-on-surface-variant hover:text-on-surface"
      :class="isOpen ? 'bg-surface-container text-primary' : ''"
      title="Notifications & Alerts"
      type="button"
    >
      <Bell class="w-5 h-5 stroke-[2px]" :class="hasUnread ? 'text-on-surface' : ''" />

      <!-- Unread Counter Badge -->
      <span
        v-if="badgeText"
        class="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-error text-white font-mono text-[10px] font-black rounded-full flex items-center justify-center border-2 border-surface shadow-xs animate-scale-in select-none"
      >
        {{ badgeText }}
      </span>
    </button>

    <!-- Backdrop for click outside -->
    <div
      v-if="isOpen"
      @click="isOpen = false"
      class="fixed inset-0 z-40"
    ></div>

    <!-- Dropdown Panel -->
    <div
      v-if="isOpen"
      class="absolute right-0 top-full mt-2.5 w-84 sm:w-96 max-w-[calc(100vw-2rem)] bg-surface rounded-2xl border border-outline-variant shadow-2xl z-50 flex flex-col overflow-hidden animate-fade-down max-h-[85vh]"
    >
      <!-- Header -->
      <div class="p-4 border-b border-outline-variant/60 bg-surface-container-lowest/80 backdrop-blur-sm flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-primary-container/30 text-primary flex items-center justify-center">
            <BellRing class="w-4 h-4" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h3 class="text-sm font-black text-on-surface tracking-tight">Notifications</h3>
              <span
                v-if="unreadCount > 0"
                class="px-2 py-0.2 bg-primary/10 text-primary border border-primary/20 text-[10px] font-mono font-bold rounded-full"
              >
                {{ unreadCount }} new
              </span>
            </div>
            <p class="text-[11px] text-on-surface-variant font-medium">Store administrator & manager alerts</p>
          </div>
        </div>

        <!-- Mark All as Read Button -->
        <button
          v-if="unreadCount > 0"
          @click="handleMarkAllAsRead"
          :disabled="isActionLoading"
          class="text-[11px] font-bold text-primary hover:text-primary/80 hover:underline flex items-center gap-1 cursor-pointer transition-colors disabled:opacity-50"
          title="Mark all notifications as read"
        >
          <CheckCheck class="w-3.5 h-3.5" />
          <span>Mark all read</span>
        </button>
      </div>

      <!-- Filter Tabs -->
      <div class="px-4 pt-2.5 pb-2 bg-surface-container-lowest border-b border-outline-variant/40 flex items-center gap-2 text-xs">
        <button
          @click="setFilter(false)"
          class="px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5"
          :class="!unreadOnlyFilter ? 'bg-primary text-on-primary shadow-xs' : 'text-on-surface-variant hover:bg-surface-container'"
        >
          <span>All</span>
          <span class="text-[10px] font-mono opacity-80" v-if="notifications.length">({{ notifications.length }})</span>
        </button>

        <button
          @click="setFilter(true)"
          class="px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5"
          :class="unreadOnlyFilter ? 'bg-primary text-on-primary shadow-xs' : 'text-on-surface-variant hover:bg-surface-container'"
        >
          <span>Unread</span>
          <span
            v-if="unreadCount > 0"
            class="text-[10px] font-mono px-1.5 py-0.2 rounded-full"
            :class="unreadOnlyFilter ? 'bg-white/20 text-white' : 'bg-error text-white'"
          >
            {{ unreadCount }}
          </span>
        </button>

        <button
          @click="refreshInbox"
          class="ml-auto p-1.5 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-lg transition-colors cursor-pointer"
          title="Refresh notifications"
        >
          <RefreshCw class="w-3.5 h-3.5" :class="isLoading ? 'animate-spin text-primary' : ''" />
        </button>
      </div>

      <!-- Notifications List Area -->
      <div class="overflow-y-auto max-h-[55vh] divide-y divide-outline-variant/40 bg-surface">
        <!-- Loading State -->
        <div v-if="isLoading && notifications.length === 0" class="py-12 flex flex-col items-center justify-center gap-2 text-on-surface-variant">
          <Loader2 class="w-6 h-6 animate-spin text-primary" />
          <span class="text-xs font-semibold">Loading notifications...</span>
        </div>

        <!-- Empty State -->
        <div
          v-else-if="filteredNotifications.length === 0"
          class="py-12 px-6 flex flex-col items-center justify-center text-center gap-3"
        >
          <div class="w-12 h-12 rounded-2xl bg-surface-container-high flex items-center justify-center text-on-surface-variant">
            <Inbox class="w-6 h-6 stroke-[1.5px]" />
          </div>
          <div>
            <h4 class="text-xs font-bold text-on-surface">
              {{ unreadOnlyFilter ? 'No Unread Notifications' : 'Inbox is Clean' }}
            </h4>
            <p class="text-[11px] text-on-surface-variant mt-0.5 max-w-[220px]">
              {{ unreadOnlyFilter ? 'You have caught up with all active alerts.' : 'No alerts have been dispatched for your account.' }}
            </p>
          </div>
        </div>

        <!-- Notification Item Card -->
        <div
          v-for="item in filteredNotifications"
          :key="item.recipientId"
          class="p-3.5 hover:bg-surface-container-low/70 transition-colors flex flex-col gap-2 relative group"
          :class="isItemUnread(item) ? 'bg-primary/5' : 'bg-surface'"
        >
          <!-- Top Row: Icon, Priority Chip, Branch, Time, Unread Dot -->
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-2 min-w-0">
              <!-- Type Icon -->
              <div
                class="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                :class="getTypeIconClass(item.type, item.priority)"
              >
                <component :is="getTypeIcon(item.type)" class="w-4 h-4" />
              </div>

              <!-- Priority Badge -->
              <span
                class="px-2 py-0.5 rounded text-[9px] font-mono font-extrabold uppercase tracking-wider shrink-0"
                :class="getPriorityBadgeClass(item.priority)"
              >
                {{ item.priority || 'NORMAL' }}
              </span>

              <!-- Branch Tag -->
              <span
                v-if="item.branchName"
                class="text-[10px] text-on-surface-variant/80 font-semibold truncate max-w-[100px]"
                :title="item.branchName"
              >
                • {{ item.branchName }}
              </span>
            </div>

            <!-- Time & Unread Status -->
            <div class="flex items-center gap-1.5 shrink-0">
              <span class="text-[10px] font-medium text-on-surface-variant">
                {{ formatRelativeTime(item.createdAt) }}
              </span>
              <span
                v-if="isItemUnread(item)"
                class="w-2 h-2 rounded-full bg-primary ring-2 ring-primary/20 shrink-0"
                title="Unread alert"
              ></span>
            </div>
          </div>

          <!-- Middle Row: Title & Message -->
          <div class="pl-9 pr-1">
            <h4
              class="text-xs tracking-tight"
              :class="isItemUnread(item) ? 'font-bold text-on-surface' : 'font-semibold text-on-surface/80'"
            >
              {{ item.title }}
            </h4>
            <p 
              class="text-[11px] font-normal mt-0.5 leading-relaxed"
              :class="isItemUnread(item) ? 'text-on-surface-variant' : 'text-on-surface-variant/70'"
            >
              {{ item.message }}
            </p>
          </div>

          <!-- Bottom Row Actions -->
          <div class="pl-9 pr-1 pt-1 flex items-center justify-between text-[11px]">
            <!-- Action URL (if present) -->
            <div>
              <button
                v-if="item.actionUrl"
                @click="handleActionNavigate(item)"
                class="text-primary font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View Details</span>
                <ArrowRight class="w-3 h-3" />
              </button>
            </div>

            <!-- Item Controls: Mark Read & Dismiss -->
            <div class="flex items-center gap-3 ml-auto opacity-80 group-hover:opacity-100 transition-opacity">
              <button
                v-if="isItemUnread(item)"
                @click="handleMarkRead(item.recipientId)"
                class="text-on-surface-variant hover:text-primary flex items-center gap-1 cursor-pointer font-medium"
                title="Mark as read"
              >
                <Check class="w-3 h-3" />
                <span>Mark read</span>
              </button>

              <button
                @click="handleArchive(item.recipientId)"
                class="text-on-surface-variant hover:text-error flex items-center gap-1 cursor-pointer font-medium"
                title="Dismiss notification"
              >
                <Trash2 class="w-3 h-3" />
                <span>Dismiss</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="p-3 bg-surface-container-lowest border-t border-outline-variant/60 flex items-center justify-between text-xs text-on-surface-variant font-medium">
        <span class="text-[11px] font-mono">
          Total: <strong class="text-on-surface">{{ notifications.length }}</strong>
        </span>
        <button
          @click="isOpen = false"
          class="font-bold text-primary hover:underline cursor-pointer text-[11px]"
        >
          Close Panel
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useNotificationViewModel } from '../../viewmodels/useNotificationViewModel';
import type { NotificationType, NotificationPriority, NotificationInboxItem } from '../../models/types';
import {
  Bell,
  BellRing,
  Check,
  CheckCheck,
  Trash2,
  Inbox,
  RefreshCw,
  Loader2,
  ArrowRight,
  ShieldAlert,
  Clock,
  UserCheck,
  Sparkles,
  Megaphone,
  AlertTriangle,
  AlertOctagon,
  Info
} from 'lucide-vue-next';

const router = useRouter();
const vm = useNotificationViewModel();

const {
  unreadCount,
  badgeText,
  hasUnread,
  notifications,
  isLoading,
  isActionLoading,
  unreadOnlyFilter,
  fetchUnreadCount,
  fetchNotifications,
  markAsRead,
  markAllAsRead,
  archiveNotification,
  startPolling,
  stopPolling,
  formatRelativeTime
} = vm;

const isOpen = ref(false);
const dropdownRef = ref<HTMLElement | null>(null);

const isItemUnread = (item: NotificationInboxItem): boolean => {
  if (item.isRead !== undefined) return !item.isRead;
  if ((item as any).read !== undefined) return !(item as any).read;
  return !item.readAt;
};

const filteredNotifications = computed(() => {
  if (unreadOnlyFilter.value) {
    return notifications.value.filter((n) => isItemUnread(n));
  }
  return notifications.value;
});

const toggleDropdown = async () => {
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    await fetchNotifications(true);
  }
};

const setFilter = async (unreadOnly: boolean) => {
  unreadOnlyFilter.value = unreadOnly;
  await fetchNotifications(true);
};

const refreshInbox = async () => {
  await fetchNotifications(true);
};

const handleMarkRead = async (recipientId: string) => {
  await markAsRead(recipientId);
};

const handleMarkAllAsRead = async () => {
  await markAllAsRead();
};

const handleArchive = async (recipientId: string) => {
  await archiveNotification(recipientId);
};

const handleActionNavigate = async (item: NotificationInboxItem) => {
  if (isItemUnread(item)) {
    await markAsRead(item.recipientId);
  }
  isOpen.value = false;
  if (item.actionUrl) {
    if (item.actionUrl.startsWith('http://') || item.actionUrl.startsWith('https://')) {
      window.open(item.actionUrl, '_blank');
    } else {
      router.push(item.actionUrl);
    }
  }
};

const getTypeIcon = (type: NotificationType) => {
  switch (type) {
    case 'FRAUD_ALERT':
      return ShieldAlert;
    case 'LICENSE_EXPIRATION':
      return Clock;
    case 'CASHIER_ACTIVITY':
      return UserCheck;
    case 'SYSTEM_UPDATE':
      return Sparkles;
    case 'GENERAL_ANNOUNCEMENT':
      return Megaphone;
    default:
      return Info;
  }
};

const getTypeIconClass = (type: NotificationType, priority: NotificationPriority) => {
  if (priority === 'CRITICAL' || type === 'FRAUD_ALERT') {
    return 'bg-error-container/40 text-error';
  }
  if (priority === 'HIGH' || type === 'LICENSE_EXPIRATION') {
    return 'bg-amber-100 text-amber-800';
  }
  if (type === 'CASHIER_ACTIVITY') {
    return 'bg-emerald-100 text-emerald-800';
  }
  return 'bg-primary-container/40 text-primary';
};

const getPriorityBadgeClass = (priority: NotificationPriority) => {
  switch (priority) {
    case 'CRITICAL':
      return 'bg-error/15 text-error border border-error/30';
    case 'HIGH':
      return 'bg-amber-500/15 text-amber-800 border border-amber-500/30';
    case 'LOW':
      return 'bg-surface-container-high text-on-surface-variant border border-outline-variant';
    case 'NORMAL':
    default:
      return 'bg-primary-container/50 text-primary border border-primary/20';
  }
};

onMounted(() => {
  startPolling(30000);
});

onUnmounted(() => {
  stopPolling();
});
</script>
