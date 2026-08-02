import { showToast } from './toastService';

const BASE_URL = 'https://jenga-api.sintax.tz';
// const BASE_URL = 'http://localhost:9090';

export interface ApiOptions extends RequestInit {
  suppressToast?: boolean;
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> {
  const token = localStorage.getItem('accessToken');
  const headers = new Headers(options.headers);

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
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

  return response.json() as Promise<T>;
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
