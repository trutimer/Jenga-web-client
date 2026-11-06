import { api } from './api';

export interface ProductCategory {
  id: string;
  storeId?: string;
  storeName?: string;
  name: string;
  code?: string;
  description?: string;
  color?: string;
  icon?: string;
  displayOrder?: number;
  isActive: boolean;
  productCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductCategoryCreateRequest {
  name: string;
  code?: string;
  description?: string;
  color?: string;
  icon?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export interface ProductCategoryUpdateRequest {
  name?: string;
  code?: string;
  description?: string;
  color?: string;
  icon?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export const productCategoryService = {
  /**
   * Fetch categories for the current store/branch
   */
  getCategories: async (params?: {
    activeOnly?: boolean;
    search?: string;
    branchId?: string;
    storeId?: string;
  }): Promise<ProductCategory[]> => {
    const query = new URLSearchParams();
    if (params?.activeOnly !== undefined) query.append('activeOnly', String(params.activeOnly));
    if (params?.search) query.append('search', params.search);
    if (params?.branchId) query.append('branchId', params.branchId);
    if (params?.storeId) query.append('storeId', params.storeId);
    const qs = query.toString();
    return api.get<ProductCategory[]>(`/api/product-categories${qs ? '?' + qs : ''}`);
  },

  /**
   * Get category by ID
   */
  getCategoryById: async (id: string): Promise<ProductCategory> => {
    return api.get<ProductCategory>(`/api/product-categories/${id}`);
  },

  /**
   * Create a new category
   */
  createCategory: async (request: ProductCategoryCreateRequest): Promise<ProductCategory> => {
    return api.post<ProductCategory>('/api/product-categories', request);
  },

  /**
   * Update an existing category
   */
  updateCategory: async (id: string, request: ProductCategoryUpdateRequest): Promise<ProductCategory> => {
    return api.put<ProductCategory>(`/api/product-categories/${id}`, request);
  },

  /**
   * Delete a category
   */
  deleteCategory: async (id: string): Promise<{ message: string }> => {
    return api.delete<{ message: string }>(`/api/product-categories/${id}`);
  },

  /**
   * Reset store categories to defaults
   */
  resetDefaults: async (): Promise<ProductCategory[]> => {
    return api.post<ProductCategory[]>('/api/product-categories/reset-defaults');
  }
};
