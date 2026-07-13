<template>
  <div class="flex flex-col gap-6 font-sans">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-black text-on-surface tracking-tight">User Management</h1>
        <p class="text-sm text-on-surface-variant mt-1">Manage system access and roles</p>
      </div>
      <button 
        @click="showCreateModal = true"
        class="h-10 px-4 bg-primary text-on-primary rounded-xl flex items-center justify-center font-bold text-sm hover:bg-opacity-90 transition-all cursor-pointer shadow-sm border-0 gap-2"
      >
        <PlusCircle class="w-4 h-4" />
        <span>Add User</span>
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading && users.length === 0" class="py-12 flex justify-center">
      <div class="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>

    <!-- Users Table -->
    <div v-else class="bg-surface rounded-2xl border border-outline-variant overflow-hidden shadow-sm">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-surface-container-lowest border-b border-outline-variant text-xs uppercase tracking-wider text-on-surface-variant font-bold">
              <th class="p-4 px-5">Name & Role</th>
              <th class="p-4 px-5">Phone</th>
              <th class="p-4 px-5">Status</th>
              <th class="p-4 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-outline-variant/50">
            <tr v-if="users.length === 0">
              <td colspan="4" class="p-8 text-center text-on-surface-variant">No users found.</td>
            </tr>
            <tr 
              v-for="user in users" 
              :key="user.id"
              class="hover:bg-surface-container-lowest/50 transition-colors"
            >
              <td class="p-4 px-5">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-full bg-primary-container flex items-center justify-center shrink-0">
                    <UserIcon class="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <div class="font-bold text-on-surface text-sm">{{ user.fullName }}</div>
                    <div class="text-xs text-on-surface-variant">{{ user.role.replace('_', ' ') }}</div>
                  </div>
                </div>
              </td>
              <td class="p-4 px-5">
                <span class="text-sm text-on-surface">{{ user.phone }}</span>
              </td>
              <td class="p-4 px-5">
                <span 
                  class="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold"
                  :class="user.active ? 'bg-success/10 text-success' : 'bg-error/10 text-error'"
                >
                  {{ user.active ? 'Active' : 'Blocked' }}
                </span>
              </td>
              <td class="p-4 px-5">
                <div class="flex items-center justify-end gap-2">
                  <button 
                    @click="router.push(`/users/${user.id}`)"
                    class="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    title="View details"
                    :disabled="user.id === userId"
                  >
                    <Eye class="w-4 h-4" />
                  </button>
                  <button 
                    @click="confirmToggleStatus(user)"
                    class="p-2 text-on-surface-variant hover:text-warning hover:bg-surface-container rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    :title="user.active ? 'Deactivate user' : 'Activate user'"
                    :disabled="user.id === userId"
                  >
                    <Power class="w-4 h-4" />
                  </button>
                  <button 
                    @click="confirmDelete(user)"
                    class="p-2 text-on-surface-variant hover:text-error hover:bg-error-container/50 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Delete user"
                    :disabled="user.id === userId"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create User Modal -->
    <Modal 
      :isOpen="showCreateModal" 
      title="Create New User" 
      :onClose="() => showCreateModal = false"
      maxWidth="max-w-lg"
    >
      <div class="flex flex-col gap-4 p-2">
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Full Name</label>
          <input 
            v-model="newUser.fullName"
            type="text" 
            placeholder="John Doe"
            class="w-full h-11 px-4 bg-surface-container-lowest border border-outline-variant rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          />
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Phone</label>
          <input 
            v-model="newUser.phone"
            type="text" 
            placeholder="+255..."
            class="w-full h-11 px-4 bg-surface-container-lowest border border-outline-variant rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          />
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Role</label>
          <select 
            v-model="newUser.role"
            class="w-full h-11 px-4 bg-surface-container-lowest border border-outline-variant rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all appearance-none"
          >
            <option v-if="userRole === 'SUPER_ADMIN'" value="ADMIN">Admin</option>
            <option value="MANAGER">Manager</option>
            <option value="CASHIER">Cashier</option>
          </select>
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Assign Branch</label>
          <select 
            v-model="newUser.branchId"
            class="w-full h-11 px-4 bg-surface-container-lowest border border-outline-variant rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all appearance-none"
          >
            <option value="" disabled>Select a branch</option>
            <option v-for="branch in branches" :key="branch.id" :value="branch.id">
              {{ branch.name }}
            </option>
          </select>
        </div>
      </div>
      <template #footer>
        <button 
          @click="showCreateModal = false" 
          class="flex-1 py-3 text-sm font-bold text-on-surface-variant hover:bg-surface-container rounded-xl transition-all border border-outline-variant bg-transparent cursor-pointer"
        >
          Cancel
        </button>
        <button 
          @click="handleCreateUser" 
          :disabled="isSubmitting || !newUser.fullName || !newUser.phone || !newUser.branchId"
          class="flex-1 py-3 bg-primary text-on-primary hover:bg-opacity-95 rounded-xl transition-all font-bold text-sm cursor-pointer border-0 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="isSubmitting">Creating...</span>
          <span v-else>Create User</span>
        </button>
      </template>
    </Modal>

    <!-- Confirmation Modal: Toggle Status -->
    <Modal 
      :isOpen="showToggleModal" 
      :title="selectedUser?.active ? 'Deactivate User' : 'Activate User'" 
      :onClose="() => showToggleModal = false"
      maxWidth="max-w-sm"
    >
      <div class="p-2 text-center text-sm text-on-surface-variant">
        Are you sure you want to {{ selectedUser?.active ? 'deactivate' : 'activate' }} 
        <span class="font-bold text-on-surface">{{ selectedUser?.fullName }}</span>?
        <p v-if="selectedUser?.active" class="mt-2 text-xs text-error">They will no longer be able to log in.</p>
      </div>
      <template #footer>
        <button 
          @click="showToggleModal = false" 
          class="flex-1 py-2.5 text-sm font-bold text-on-surface-variant hover:bg-surface-container rounded-xl transition-all border border-outline-variant bg-transparent cursor-pointer"
        >
          Cancel
        </button>
        <button 
          @click="handleToggleStatus" 
          class="flex-1 py-2.5 rounded-xl transition-all font-bold text-sm cursor-pointer border-0 shadow-sm text-white"
          :class="selectedUser?.active ? 'bg-warning' : 'bg-success'"
        >
          {{ selectedUser?.active ? 'Deactivate' : 'Activate' }}
        </button>
      </template>
    </Modal>

    <!-- Confirmation Modal: Delete -->
    <Modal 
      :isOpen="showDeleteModal" 
      title="Delete User" 
      :onClose="() => showDeleteModal = false"
      maxWidth="max-w-sm"
    >
      <div class="p-2 text-center text-sm text-on-surface-variant">
        Are you sure you want to permanently delete 
        <span class="font-bold text-on-surface">{{ selectedUser?.fullName }}</span>?
        <p class="mt-2 text-xs text-error">This action cannot be undone.</p>
      </div>
      <template #footer>
        <button 
          @click="showDeleteModal = false" 
          class="flex-1 py-2.5 text-sm font-bold text-on-surface-variant hover:bg-surface-container rounded-xl transition-all border border-outline-variant bg-transparent cursor-pointer"
        >
          Cancel
        </button>
        <button 
          @click="handleDeleteUser" 
          class="flex-1 py-2.5 bg-error hover:bg-opacity-95 text-white rounded-xl transition-all font-bold text-sm cursor-pointer border-0 shadow-sm"
        >
          Delete
        </button>
      </template>
    </Modal>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { PlusCircle, User as UserIcon, Eye, Trash2, Power } from 'lucide-vue-next';
import Modal from '../components/common/Modal.vue';
import { useUserViewModel } from '../viewmodels/useUserViewModel';
import { useAppViewModel } from '../viewmodels/useAppViewModel';
import type { AppUser, UserCreateRequest, UserRole } from '../models/types';

const router = useRouter();
const { users, branches, isLoading, fetchUsers, fetchBranches, createUser, blockUser, unblockUser, deleteUser } = useUserViewModel();
const { userRole, userId } = useAppViewModel();

const showCreateModal = ref(false);
const showToggleModal = ref(false);
const showDeleteModal = ref(false);
const isSubmitting = ref(false);
const selectedUser = ref<AppUser | null>(null);

const newUser = reactive<UserCreateRequest>({
  fullName: '',
  phone: '',
  role: 'CASHIER' as UserRole,
  branchId: '',
  storeId: localStorage.getItem('storeId') || undefined
});

onMounted(async () => {
  await fetchUsers();
  await fetchBranches();
});

const handleCreateUser = async () => {
  if (!newUser.fullName || !newUser.phone || !newUser.branchId) return;
  isSubmitting.value = true;
  
  const requestPayload = { ...newUser };
  
  const success = await createUser(requestPayload);
  if (success) {
    showCreateModal.value = false;
    // reset form
    newUser.fullName = '';
    newUser.phone = '';
    newUser.role = 'CASHIER';
    newUser.branchId = '';
  }
  isSubmitting.value = false;
};

const confirmToggleStatus = (user: AppUser) => {
  selectedUser.value = user;
  showToggleModal.value = true;
};

const handleToggleStatus = async () => {
  if (!selectedUser.value) return;
  const success = selectedUser.value.active 
    ? await blockUser(selectedUser.value.id)
    : await unblockUser(selectedUser.value.id);
  
  if (success) {
    showToggleModal.value = false;
  }
};

const confirmDelete = (user: AppUser) => {
  selectedUser.value = user;
  showDeleteModal.value = true;
};

const handleDeleteUser = async () => {
  if (!selectedUser.value) return;
  const success = await deleteUser(selectedUser.value.id);
  if (success) {
    showDeleteModal.value = false;
  }
};
</script>
