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
import { generateSalt, hashPasswordWithSalt } from '@/utils/cryptoAuth';

export const BASE_URL = (import.meta.env.VITE_API_URL as string) || (import.meta.env.PROD ? 'https://jenga-api.sintax.tz' : 'http://localhost:9090');

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

  const method = (options.method || 'GET').toUpperCase();

  // ------------ 1MS LOCAL-FIRST DESKTOP INTERCEPTORS ------------ //
  if (isElectron() && branchId) {

    // A. ALWAYS process POS Checkout Sales POST locally first in 0ms (Local-First Sync Architecture)
    if (method === 'POST' && (endpoint === '/api/sales' || endpoint === '/api/v1/sales') && !endpoint.includes('/reverse')) {
      console.log('[Local-First API] Processing POS sale locally in 0ms...');
      const bodyObj = options.body ? JSON.parse(options.body as string) : {};
      const offlineRes = await processOfflineSale(bodyObj, branchId, token || '');
      return offlineRes as any;
    }


    // B. ALWAYS check Local SQLite for Active Shift FIRST when retrieving current shift
    if (method === 'GET' && (endpoint.includes('/shifts') || endpoint.includes('/cashier-shifts'))) {
      const cashierId = localStorage.getItem('userId') || localStorage.getItem('cashierId') || '';
      try {
        const cachedShift = await (window as any).ipcRenderer.invoke('db:get-active-shift', { branchId, cashierId });
        if (cachedShift && cachedShift.status === 'OPEN') {
          // Trigger silent background refresh of shift balances if online
          if (typeof navigator !== 'undefined' && navigator.onLine) {
            fetch(`${BASE_URL}${finalEndpoint}`, { headers }).then(r => r.json()).then(async data => {
              if (data && data.status === 'OPEN') {
                try {
                  await (window as any).ipcRenderer.invoke('db:save-shift', { shift: data });
                } catch (e) {}
              }
            }).catch(() => {});

          }
          return cachedShift as T;
        }
      } catch (e) {
        console.warn('Failed to query local active shift:', e);
      }
    }

    // C. Instant 0ms Offline Shortcut for any other endpoint if network is disconnected
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      return handleOfflineFallback<T>(endpoint, options, branchId, token);
    }
  }

  // Network request timeout for Electron mode (60 seconds for large product catalogues on WAN internet APIs)
  const controller = new AbortController();
  const timeoutId = isElectron() ? setTimeout(() => controller.abort(), 60000) : null;


  const mergedSignal = options.signal || controller.signal;

  try {
    const response = await fetch(`${BASE_URL}${finalEndpoint}`, {
      ...options,
      headers,
      signal: mergedSignal
    });

    if (timeoutId) clearTimeout(timeoutId);

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

    // Cache products / customers / active shift in SQLite when online in Electron
    if (isElectron() && branchId) {
      if (method === 'GET') {
        if (endpoint.includes('/products')) {
          const prods = Array.isArray(data) ? data : data?.content || [];
          if (prods.length > 0) cacheBranchProducts(branchId, prods);
        } else if (endpoint.includes('/customers')) {
          const custs = Array.isArray(data) ? data : data?.content || [];
          if (custs.length > 0) cacheBranchCustomers(branchId, custs);
        } else if (endpoint.includes('/shifts/') || endpoint.includes('/cashier-shifts')) {
          if (data && data.status === 'OPEN') {
            (window as any).ipcRenderer.invoke('db:save-shift', { shift: data });
          }
        }
      } else if (method === 'POST') {
        if ((endpoint.includes('/shifts/') || endpoint.includes('/cashier-shifts')) && endpoint.includes('open') && data) {
          (window as any).ipcRenderer.invoke('db:save-shift', { shift: data });
        }
      }
    }

    // Cache successful auth response with salted password hash
    if (isElectron() && branchId && endpoint.includes('/auth/login') && data?.user && data?.accessToken) {
      try {
        const bodyObj = options.body ? JSON.parse(options.body as string) : {};
        if (bodyObj.password) {
          const salt = generateSalt();
          hashPasswordWithSalt(bodyObj.password, salt).then((hash) => {
            cacheAuthCredentials(data.user, data.accessToken, branchId, hash, salt);
          }).catch((err) => {
            console.error('Failed to hash password for offline caching:', err);
          });
        }
      } catch (_) {}
    }

    return data as T;
  } catch (err: any) {
    if (timeoutId) clearTimeout(timeoutId);

    // If Network Error or Abort occurs in Electron Desktop mode, handle offline fallback
    if (isElectron() && (err?.name === 'AbortError' || err instanceof TypeError || err.message?.includes('fetch') || err.message?.includes('NetworkError') || err.message?.includes('Failed to fetch') || err.message?.includes('aborted'))) {
      return handleOfflineFallback<T>(endpoint, options, branchId, token);
    }

    throw err;
  }
}

async function handleOfflineFallback<T>(
  endpoint: string,
  options: ApiOptions,
  branchId: string | null,
  token: string | null
): Promise<T> {
  const isGet = !options.method || options.method === 'GET';
  const isPost = options.method === 'POST';

  if (!branchId) {
    throw new Error('No active store branch ID selected for offline operation');
  }

  // 1. Offline GET Fallbacks
  if (isGet) {
    if (endpoint.includes('/products')) {
      console.log('[Offline API] Querying products from local SQLite...');
      const urlObj = new URL(endpoint.startsWith('http') ? endpoint : `http://dummy.local${endpoint}`);
      const page = parseInt(urlObj.searchParams.get('page') || '0', 10);
      const size = parseInt(urlObj.searchParams.get('size') || '50', 10);
      const search = urlObj.searchParams.get('search') || urlObj.searchParams.get('query') || '';

      const paginatedRes = await getCachedPaginatedProducts(branchId, page, size, search);
      return (endpoint.includes('page=') || endpoint.includes('size='))
        ? paginatedRes as any
        : paginatedRes.content as any;
    }

    if (endpoint.includes('/customers')) {
      console.log('[Offline API] Fetching customers from local SQLite...');
      const cachedCusts = await getCachedBranchCustomers(branchId);
      if (cachedCusts.length > 0) {
        return (endpoint.includes('page=') || endpoint.includes('size='))
          ? { content: cachedCusts, totalElements: cachedCusts.length, totalPages: 1 } as any
          : cachedCusts as any;
      }
    }

    // Active Cashier Shift GET Fallback (Prevents forcing cashier to re-open open shift)
    if (endpoint.includes('/shifts') || endpoint.includes('/cashier-shifts')) {
      console.log('[Offline API] Fetching active cashier shift from local SQLite...');
      const cashierId = localStorage.getItem('userId') || localStorage.getItem('cashierId') || '';
      const cachedShift = await (window as any).ipcRenderer.invoke('db:get-active-shift', { branchId, cashierId });
      if (cachedShift) {
        return cachedShift as T;
      }
      return null as any;
    }
  }

  // 2. Offline Sales / Shifts / Money Movements POST Handlers
  if (isPost) {
    const bodyObj = options.body ? JSON.parse(options.body as string) : {};

    if ((endpoint === '/api/sales' || endpoint === '/api/v1/sales') && !endpoint.includes('/reverse')) {
      console.log('[Offline API] Saving sale to local SQLite outbox...');
      const offlineRes = await processOfflineSale(bodyObj, branchId, token || '');
      return offlineRes as any;
    }


    if (endpoint.includes('/shifts/open') || endpoint.includes('/cashier-shifts/open')) {
      showToast('Internet connection is required to open a new register shift. Please connect to the internet.', 'error');
      throw new Error('Internet connection is required to open a new register shift.');
    }

    if (endpoint.includes('/shifts/close') || endpoint.includes('/close')) {
      showToast('Internet connection is required to close register shift and log out. Please connect to the internet.', 'error');
      throw new Error('Internet connection is required to close register shift.');
    }

    if (endpoint.includes('/cash-movements')) {
      console.log('[Offline API] Recording money movement in SQLite outbox...');
      const res = await processOfflineMoneyMovement(bodyObj, branchId, token || '');
      showToast('Offline Mode: Cash movement saved locally and queued for sync', 'success');
      return res as any;
    }

    if (endpoint.includes('/auth/login') && (bodyObj.username || bodyObj.phone)) {
      console.log('[Offline API] Attempting offline authentication fallback...');
      const identifier = bodyObj.phone || bodyObj.username || '';
      const inputPassword = bodyObj.password || '';

      if (!inputPassword) {
        showToast('Password is required for offline sign in', 'error');
        throw new Error('Password is required for offline sign in');
      }

      const cached = await getCachedAuth(identifier, branchId);
      if (!cached || !cached.passwordHash || !cached.passwordSalt) {
        showToast('Offline credentials not found. Please connect to the internet to sign in first.', 'error');
        throw new Error('Offline credentials not found');
      }

      const computedHash = await hashPasswordWithSalt(inputPassword, cached.passwordSalt);
      if (computedHash !== cached.passwordHash) {
        showToast('Invalid phone number or password', 'error');
        throw new Error('Invalid phone number or password');
      }

      // Check if cashier has an open shift cached in local SQLite
      const cachedShift = await (window as any).ipcRenderer.invoke('db:get-active-shift', { branchId, cashierId: cached.user.id });
      if (!cachedShift || cachedShift.status !== 'OPEN') {
        showToast('Internet connection is required to open a register shift before selling.', 'error');
        throw new Error('Internet connection is required to open a register shift before selling.');
      }

      showToast('Offline Mode: Authenticated using cached credentials', 'success');
      return {
        user: cached.user,
        accessToken: cached.token,
        tokenType: 'Bearer',
        offline: true
      } as any;
    }

  }

  // 3. Online-Only Admin Actions (Product adding/editing, user management)
  if (!isGet) {
    showToast('Internet connection is required to create or modify products, users, or store settings.', 'error');
  }

  throw new Error('Offline operation not supported for this route');
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
  patch: <T = any>(endpoint: string, body?: any, options?: ApiOptions) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    }),
  delete: <T = any>(endpoint: string, options?: ApiOptions) =>
    apiRequest<T>(endpoint, { ...options, method: 'DELETE' }),
};
