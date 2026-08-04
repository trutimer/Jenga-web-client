import { showToast } from './toastService';
import {
  isElectron,
  cacheBranchProducts,
  getCachedBranchProducts,
  getCachedPaginatedProducts,
  cacheBranchCustomers,
  getCachedBranchCustomers,
  processOfflineSale,
  processOfflineOpenShift,
  processOfflineCloseShift,
  processOfflineMoneyMovement,
  cacheAuthCredentials,
  getCachedAuth
} from './offlineSalesService';


// const BASE_URL = 'https://jenga-api.sintax.tz';
export const BASE_URL = 'http://localhost:9090';

export interface ApiOptions extends RequestInit {
  suppressToast?: boolean;
}

// Sync Base URL configuration to Electron Main Process background sync worker
if (isElectron()) {
  try {
    const token = localStorage.getItem('accessToken') || '';
    (window as any).ipcRenderer.invoke('sync:set-config', { apiBaseUrl: BASE_URL, token });
  } catch (err) {
    console.error('Failed to configure sync worker:', err);
  }
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> {
  const token = localStorage.getItem('accessToken');
  const headers = new Headers(options.headers);

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
    if (isElectron()) {
      (window as any).ipcRenderer.invoke('sync:set-config', { token });
    }
  }

  // Set default Content-Type to application/json if there is a body and it is not already set
  if (options.body && !headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  let finalEndpoint = endpoint;
  const branchId = localStorage.getItem('branchId');
  if (branchId && branchId !== 'null' && branchId !== 'undefined' && branchId.trim() !== '') {
    if (!finalEndpoint.includes('storeBranchId=')) {
      // Exclude auth routes and store list endpoints
      if (!finalEndpoint.startsWith('/api/auth') && !finalEndpoint.endsWith('/branches')) {
        const separator = finalEndpoint.includes('?') ? '&' : '?';
        finalEndpoint += `${separator}storeBranchId=${encodeURIComponent(branchId)}`;
      }
    }
  }

  try {
    const response = await fetch(`${BASE_URL}${finalEndpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = errorText;
      try {
        const parsed = JSON.parse(errorText);
        if (parsed) {
          if (typeof parsed.error === 'string' && parsed.error.trim() !== '' && parsed.error !== 'Bad Request' && parsed.error !== 'Internal Server Error') {
            errorMessage = parsed.error;
          } else if (typeof parsed.message === 'string' && parsed.message.trim() !== '') {
            errorMessage = parsed.message;
          } else if (parsed.errors && Array.isArray(parsed.errors) && parsed.errors.length > 0) {
            const firstErr = parsed.errors[0];
            errorMessage = typeof firstErr === 'string' ? firstErr : (firstErr.defaultMessage || firstErr.message || JSON.stringify(firstErr));
          } else if (typeof parsed.error === 'string') {
            errorMessage = parsed.error;
          }
        }
      } catch {
        if (!errorMessage) {
          errorMessage = `Request failed with status ${response.status}`;
        }
      }
      if (!options.suppressToast) {
        showToast(errorMessage, 'error');
      }
      throw new Error(errorMessage);
    }

    if (response.status === 204) {
      return null as any;
    }

    const data = await response.json();

    // Cache products / customers in SQLite when online in Electron
    if (isElectron() && branchId && (options.method === 'GET' || !options.method)) {
      if (endpoint.includes('/products')) {
        const prods = Array.isArray(data) ? data : data?.content || [];
        if (prods.length > 0) cacheBranchProducts(branchId, prods);
      } else if (endpoint.includes('/customers')) {
        const custs = Array.isArray(data) ? data : data?.content || [];
        if (custs.length > 0) cacheBranchCustomers(branchId, custs);
      }
    }

    // Cache successful auth response
    if (isElectron() && branchId && endpoint.includes('/auth/login') && data?.user && data?.accessToken) {
      cacheAuthCredentials(data.user, data.accessToken, branchId);
    }

    return data as T;
  } catch (err: any) {
    // If Network Error occurs in Electron Desktop mode, process offline logic
    if (isElectron() && (err instanceof TypeError || err.message?.includes('fetch') || err.message?.includes('NetworkError') || err.message?.includes('Failed to fetch'))) {
      const isGet = !options.method || options.method === 'GET';
      const isPost = options.method === 'POST';

      // 1. Offline GET Fallbacks
      if (isGet && branchId) {
        if (endpoint.includes('/products')) {
          console.log('[Offline API] Network unavailable. Querying products from local SQLite...');
          const urlObj = new URL(endpoint.startsWith('http') ? endpoint : `http://dummy.local${endpoint}`);
          const page = parseInt(urlObj.searchParams.get('page') || '0', 10);
          const size = parseInt(urlObj.searchParams.get('size') || '50', 10);
          const search = urlObj.searchParams.get('search') || urlObj.searchParams.get('query') || '';

          const paginatedRes = await getCachedPaginatedProducts(branchId, page, size, search);
          showToast('Offline Mode: Displaying locally cached products', 'success');
          return (endpoint.includes('page=') || endpoint.includes('size='))
            ? paginatedRes as any
            : paginatedRes.content as any;
        }

        if (endpoint.includes('/customers')) {
          console.log('[Offline API] Network unavailable. Fetching customers from local SQLite...');
          const cachedCusts = await getCachedBranchCustomers(branchId);
          if (cachedCusts.length > 0) {
            showToast('Offline Mode: Displaying locally cached customers', 'success');
            return (endpoint.includes('page=') || endpoint.includes('size='))
              ? { content: cachedCusts, totalElements: cachedCusts.length, totalPages: 1 } as any
              : cachedCusts as any;
          }
        }
      }

      // 2. Offline Sales / Shifts / Money Movements POST Handlers
      if (isPost && branchId) {
        const bodyObj = options.body ? JSON.parse(options.body as string) : {};

        if (endpoint.includes('/sales')) {
          console.log('[Offline API] Network unavailable. Saving sale to local SQLite outbox...');
          const offlineRes = await processOfflineSale(bodyObj, branchId, token || '');
          showToast('Offline Mode: Sale completed and queued for silent sync', 'success');
          return offlineRes as any;
        }

        if (endpoint.includes('/cashier-shifts/open')) {
          console.log('[Offline API] Network unavailable. Opening shift locally in SQLite...');
          const res = await processOfflineOpenShift(bodyObj, branchId, token || '');
          showToast('Offline Mode: Register shift opened locally', 'success');
          return res as any;
        }

        if (endpoint.includes('/cashier-shifts/') && endpoint.includes('/close')) {
          console.log('[Offline API] Network unavailable. Closing shift locally in SQLite...');
          const parts = endpoint.split('/');
          const shiftId = parts[parts.indexOf('cashier-shifts') + 1] || bodyObj.id;
          const cashierId = localStorage.getItem('userId') || '';
          const res = await processOfflineCloseShift(shiftId, bodyObj.actualCash || 0, bodyObj.notes || '', branchId, cashierId, token || '');
          showToast('Offline Mode: Register shift closed locally and queued for sync', 'success');
          return res as any;
        }

        if (endpoint.includes('/cash-movements')) {
          console.log('[Offline API] Network unavailable. Recording money movement in SQLite outbox...');
          const res = await processOfflineMoneyMovement(bodyObj, branchId, token || '');
          showToast('Offline Mode: Cash movement saved locally and queued for sync', 'success');
          return res as any;
        }

        if (endpoint.includes('/auth/login') && bodyObj.username) {
          console.log('[Offline API] Attempting offline authentication fallback...');
          const cached = await getCachedAuth(bodyObj.username, branchId);
          if (cached) {
            showToast('Offline Mode: Authenticated using cached credentials', 'success');
            return {
              user: cached.user,
              accessToken: cached.token,
              tokenType: 'Bearer',
              offline: true
            } as any;
          }
        }
      }

      // 3. Online-Only Admin Actions (Product adding/editing, user management)
      if (!isGet) {
        showToast('Internet connection is required to create or modify products, users, or store settings.', 'error');
      }
    }

    throw err;
  }
}

export const api = {
  get: <T = any>(endpoint: string, options?: ApiOptions) =>
    apiRequest<T>(endpoint, { ...options, method: 'GET' }),
  post: <T = any>(endpoint: string, body?: any, options?: ApiOptions) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),
  postRaw: <T = any>(endpoint: string, body: string, contentType: string = 'text/plain', options?: ApiOptions) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'POST',
      body,
      headers: {
        'Content-Type': contentType,
        ...(options?.headers || {})
      }
    }),
  put: <T = any>(endpoint: string, body?: any, options?: ApiOptions) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }),
  delete: <T = any>(endpoint: string, options?: ApiOptions) =>
    apiRequest<T>(endpoint, { ...options, method: 'DELETE' }),
};
