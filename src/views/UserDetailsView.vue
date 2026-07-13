<template>
  <div class="flex flex-col gap-6 font-sans">
    <!-- Header with Back Button -->
    <div class="flex items-center gap-4">
      <button 
        @click="router.push('/users')"
        class="w-10 h-10 bg-surface-container-low border border-outline-variant rounded-xl flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface transition-colors cursor-pointer shadow-sm"
      >
        <ArrowLeft class="w-5 h-5" />
      </button>
      <div>
        <h1 class="text-2xl font-black text-on-surface tracking-tight">User Details</h1>
        <p class="text-sm text-on-surface-variant mt-1">Detailed profile and system access</p>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="py-12 flex justify-center">
      <div class="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>

    <!-- User Profile Card -->
    <div v-else-if="user" class="grid grid-cols-1 md:grid-cols-3 gap-6">
      
      <!-- Left Column: Profile Summary -->
      <div class="md:col-span-1 flex flex-col gap-6">
        <div class="bg-surface rounded-2xl border border-outline-variant p-6 flex flex-col items-center text-center shadow-sm">
          <div class="w-24 h-24 rounded-full bg-primary-container flex items-center justify-center mb-4 relative">
            <UserIcon class="w-10 h-10 text-primary" />
            <div 
              class="absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-surface"
              :class="user.active ? 'bg-success' : 'bg-error'"
              :title="user.active ? 'Active' : 'Blocked'"
            ></div>
          </div>
          <h2 class="text-xl font-bold text-on-surface">{{ user.fullName }}</h2>
          <p class="text-sm text-on-surface-variant mt-1">{{ user.role.replace('_', ' ') }}</p>
          
          <div class="w-full mt-6 flex flex-col gap-3">
            <div class="flex items-center gap-3 p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/50">
              <Phone class="w-4 h-4 text-on-surface-variant shrink-0" />
              <span class="text-sm text-on-surface font-medium">{{ user.phone }}</span>
            </div>
            <div class="flex items-center gap-3 p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/50">
              <Store class="w-4 h-4 text-on-surface-variant shrink-0" />
              <span class="text-sm text-on-surface font-medium">{{ branchName || 'No Branch Assigned' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Additional Details -->
      <div class="md:col-span-2 flex flex-col gap-6">
        <div class="bg-surface rounded-2xl border border-outline-variant p-6 shadow-sm">
          <h3 class="text-base font-bold text-on-surface mb-6 flex items-center gap-2">
            <ShieldCheck class="w-5 h-5 text-primary" />
            System Details
          </h3>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div class="flex flex-col gap-1.5">
              <span class="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Account ID</span>
              <span class="text-sm font-mono text-on-surface bg-surface-container-lowest px-3 py-2 rounded-lg border border-outline-variant/50 truncate">{{ user.id }}</span>
            </div>
            <div class="flex flex-col gap-1.5">
              <span class="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Store ID</span>
              <span class="text-sm font-mono text-on-surface bg-surface-container-lowest px-3 py-2 rounded-lg border border-outline-variant/50 truncate">{{ user.storeId || 'N/A' }}</span>
            </div>
            <div class="flex flex-col gap-1.5">
              <span class="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Created At</span>
              <span class="text-sm text-on-surface">{{ formatDate(user.createdAt) }}</span>
            </div>
            <div class="flex flex-col gap-1.5">
              <span class="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Last Login</span>
              <span class="text-sm text-on-surface">{{ user.lastLoginAt ? formatDate(user.lastLoginAt) : 'Never logged in' }}</span>
            </div>
          </div>
        </div>
        
        <!-- Activity Log Placeholder -->
        <div class="bg-surface rounded-2xl border border-outline-variant p-6 shadow-sm flex-1 flex flex-col">
          <h3 class="text-base font-bold text-on-surface mb-4 flex items-center gap-2">
            <History class="w-5 h-5 text-primary" />
            Recent Activity
          </h3>
          <div class="flex-1 flex flex-col items-center justify-center p-8 text-center bg-surface-container-lowest rounded-xl border border-dashed border-outline-variant">
            <History class="w-8 h-8 text-on-surface-variant/30 mb-2" />
            <p class="text-sm text-on-surface-variant font-medium">Activity logs are not available for this user.</p>
          </div>
        </div>
      </div>
      
    </div>

    <!-- Error State -->
    <div v-else class="py-12 flex flex-col items-center justify-center text-center bg-surface rounded-2xl border border-outline-variant">
      <div class="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center text-error mb-4">
        <UserIcon class="w-8 h-8" />
      </div>
      <h3 class="text-lg font-bold text-on-surface">User Not Found</h3>
      <p class="text-sm text-on-surface-variant mt-2 max-w-sm">The user you are looking for does not exist or you do not have permission to view their profile.</p>
      <button 
        @click="router.push('/users')"
        class="mt-6 px-6 py-2.5 bg-primary text-on-primary rounded-xl font-bold text-sm hover:bg-opacity-95 transition-colors cursor-pointer"
      >
        Return to Users
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ArrowLeft, User as UserIcon, Phone, Store, ShieldCheck, History } from 'lucide-vue-next';
import { useUserViewModel } from '../viewmodels/useUserViewModel';
import type { AppUser } from '../models/types';

const route = useRoute();
const router = useRouter();
const { fetchUserById, fetchBranches, branches, isLoading } = useUserViewModel();

const user = ref<AppUser | null>(null);

const branchName = computed(() => {
  if (!user.value || !user.value.branchId) return '';
  const branch = branches.value.find(b => b.id === user.value?.branchId);
  return branch ? branch.name : user.value.branchId;
});

onMounted(async () => {
  const userId = route.params.id as string;
  if (userId) {
    const fetchedUser = await fetchUserById(userId);
    if (fetchedUser) {
      user.value = fetchedUser;
      // We also need branches to display the branch name properly
      if (branches.value.length === 0) {
        await fetchBranches();
      }
    }
  }
});

const formatDate = (isoString: string) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date);
};
</script>
