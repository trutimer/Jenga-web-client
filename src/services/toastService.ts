import { ref } from 'vue';

export const toastMessage = ref<string | null>(null);
export const toastType = ref<'success' | 'error' | 'info'>('error');

export const showToast = (message: string, type: 'success' | 'error' | 'info' = 'error') => {
  toastMessage.value = message;
  toastType.value = type;
};

export const clearToast = () => {
  toastMessage.value = null;
};
