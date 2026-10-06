import { api } from './api';
import type {
  PurchaseOrder,
  PurchaseOrderCreateRequest,
  PurchaseOrderUpdateRequest,
  PurchaseOrderReceiveRequest,
  PurchaseOrderStatus,
  PageResponse
} from '../models/types';

export const purchaseOrderService = {
  /**
   * Search and filter purchase orders with pagination
   */
  async searchPurchaseOrders(params: {
    branchId?: string;
    supplierId?: string;
    status?: PurchaseOrderStatus;
    date?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    size?: number;
  } = {}): Promise<PageResponse<PurchaseOrder>> {
    const query = new URLSearchParams();
    if (params.branchId) query.append('branchId', params.branchId);
    if (params.supplierId) query.append('supplierId', params.supplierId);
    if (params.status && (params.status as string) !== 'ALL') query.append('status', params.status);
    if (params.date) query.append('date', params.date);
    if (params.startDate) query.append('startDate', params.startDate);
    if (params.endDate) query.append('endDate', params.endDate);
    query.append('page', String(params.page ?? 0));
    query.append('size', String(params.size ?? 20));

    return api.get<PageResponse<PurchaseOrder>>(`/api/purchase-orders?${query.toString()}`);
  },

  /**
   * Fetch a single purchase order by ID with line items
   */
  async getPurchaseOrderById(id: string): Promise<PurchaseOrder> {
    return api.get<PurchaseOrder>(`/api/purchase-orders/${id}`);
  },

  /**
   * Create a new draft purchase order
   */
  async createDraft(payload: PurchaseOrderCreateRequest): Promise<PurchaseOrder> {
    return api.post<PurchaseOrder>('/api/purchase-orders', payload);
  },

  /**
   * Update an existing draft purchase order
   */
  async updateDraft(id: string, payload: PurchaseOrderUpdateRequest): Promise<PurchaseOrder> {
    return api.put<PurchaseOrder>(`/api/purchase-orders/${id}`, payload);
  },

  /**
   * Delete a draft purchase order
   */
  async deleteDraft(id: string): Promise<{ message: string }> {
    return api.delete<{ message: string }>(`/api/purchase-orders/${id}`);
  },

  /**
   * Submit a draft purchase order for Maker-Checker approval
   */
  async submitForApproval(id: string): Promise<PurchaseOrder> {
    return api.post<PurchaseOrder>(`/api/purchase-orders/${id}/submit`);
  },

  /**
   * Receive goods for an approved or partially received purchase order
   */
  async receiveGoods(id: string, payload: PurchaseOrderReceiveRequest): Promise<PurchaseOrder> {
    return api.post<PurchaseOrder>(`/api/purchase-orders/${id}/receive`, payload);
  },

  /**
   * Cancel a purchase order with reason
   */
  async cancelPurchaseOrder(id: string, reason?: string): Promise<PurchaseOrder> {
    return api.post<PurchaseOrder>(`/api/purchase-orders/${id}/cancel`, {
      reason: reason || 'Cancelled by user'
    });
  }
};
