import { ref } from 'vue';
import { api } from '../services/api';
import { showToast } from '../services/toastService';
import type { AppUser, UserCreateRequest, StoreBranch } from '../models/types';

export function useUserViewModel() {
  const users = ref<AppUser[]>([]);
  const branches = ref<StoreBranch[]>([]);
  const isLoading = ref(false);

  const fetchUsers = async () => {
    isLoading.value = true;
    try {
      const response = await api.get<any>('/api/users');
      // The backend returns a Page<UserViewModel>, so users are in response.content
      users.value = response?.content || [];
    } catch (err: any) {
      console.error('Failed to fetch users:', err);
      showToast('Failed to load users: ' + (err.message || 'Server error'), 'error');
    } finally {
      isLoading.value = false;
    }
  };

  const fetchUserById = async (id: string): Promise<AppUser | null> => {
    isLoading.value = true;
    try {
      const user = await api.get<AppUser>(`/api/users/${id}`);
      return user || null;
    } catch (err: any) {
      console.error('Failed to fetch user details:', err);
      showToast('Failed to load user details.', 'error');
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  const fetchBranches = async () => {
    const storeId = localStorage.getItem('storeId');
    if (!storeId || storeId === 'null') return;
    
    try {
      const response = await api.get<StoreBranch[]>(`/api/stores/${storeId}/branches`);
      branches.value = response || [];
    } catch (err: any) {
      console.error('Failed to fetch branches:', err);
      showToast('Failed to load branches', 'error');
    }
  };

  const createUser = async (request: UserCreateRequest): Promise<boolean> => {
    try {
      await api.post('/api/users', request);
      showToast('User created successfully', 'success');
      await fetchUsers();
      return true;
    } catch (err: any) {
      console.error('Failed to create user:', err);
      showToast('Failed to create user: ' + (err.message || 'Server error'), 'error');
      return false;
    }
  };

  const blockUser = async (id: string): Promise<boolean> => {
    try {
      await api.post(`/api/users/${id}/block`, {});
      showToast('User deactivated successfully', 'success');
      await fetchUsers();
      return true;
    } catch (err: any) {
      console.error('Failed to deactivate user:', err);
      showToast('Failed to deactivate user: ' + (err.message || 'Server error'), 'error');
      return false;
    }
  };

  const unblockUser = async (id: string): Promise<boolean> => {
    try {
      await api.post(`/api/users/${id}/unblock`, {});
      showToast('User activated successfully', 'success');
      await fetchUsers();
      return true;
    } catch (err: any) {
      console.error('Failed to activate user:', err);
      showToast('Failed to activate user: ' + (err.message || 'Server error'), 'error');
      return false;
    }
  };

  const deleteUser = async (id: string): Promise<boolean> => {
    try {
      await api.delete(`/api/users/${id}`);
      showToast('User deleted successfully', 'success');
      await fetchUsers();
      return true;
    } catch (err: any) {
      console.error('Failed to delete user:', err);
      showToast('Failed to delete user: ' + (err.message || 'Server error'), 'error');
      return false;
    }
  };

  return {
    users,
    branches,
    isLoading,
    fetchUsers,
    fetchUserById,
    fetchBranches,
    createUser,
    blockUser,
    unblockUser,
    deleteUser
  };
}
