import { api } from './api';

export type SupplierPaymentMethod = 'CASH' | 'MOBILE' | 'BANK_TRANSFER' | 'CARD';
export type SupplierPaymentStatus = 'COMPLETED' | 'PENDING_APPROVAL' | 'REJECTED' | 'CANCELLED';

export interface SupplierPaymentCreateRequest {
  supplierId: string;
  branchId?: string;
  shiftId?: string;
  amount: number;
  paymentMethod: SupplierPaymentMethod;
  referenceNumber?: string;
  notes?: string;
}

export interface SupplierPaymentViewModel {
  id: string;
  paymentNumber: string;
  supplierId: string;
  supplierName: string;
  supplierBalanceBefore?: number;
  supplierBalanceAfter?: number;
  branchId?: string;
  branchName?: string;
  paidById?: string;
  paidByName?: string;
  shiftId?: string;
  amount: number;
  paymentMethod: SupplierPaymentMethod;
  referenceNumber?: string;
  status: SupplierPaymentStatus;
  postedToGl?: boolean;
  postedAt?: string;
  financialPeriodId?: string;
  notes?: string;
  paymentDate?: string;
  createdAt?: string;
}

export interface PaginatedSupplierPayments {
  content: SupplierPaymentViewModel[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export const supplierPaymentService = {
  /**
   * Record debt payment to a supplier
   * Uses dedicated backend endpoint: POST /api/supplier-payments
   */
  recordPayment: async (request: SupplierPaymentCreateRequest): Promise<SupplierPaymentViewModel> => {
    return api.post<SupplierPaymentViewModel>('/api/supplier-payments', request);
  },

  /**
   * Get payment history for a specific supplier
   * Uses dedicated backend endpoint: GET /api/supplier-payments/supplier/{supplierId}
   */
  getPaymentsBySupplier: async (
    supplierId: string,
    page: number = 0,
    size: number = 10
  ): Promise<PaginatedSupplierPayments> => {
    return api.get<PaginatedSupplierPayments>(`/api/supplier-payments/supplier/${supplierId}?page=${page}&size=${size}`);
  },

  /**
   * Get specific payment by ID
   */
  getPaymentById: async (id: string): Promise<SupplierPaymentViewModel> => {
    return api.get<SupplierPaymentViewModel>(`/api/supplier-payments/${id}`);
  },

  /**
   * Search / filter payments across branches and suppliers
   */
  getAllPayments: async (params?: {
    branchId?: string;
    supplierId?: string;
    status?: SupplierPaymentStatus;
    startDate?: string;
    endDate?: string;
    page?: number;
    size?: number;
  }): Promise<PaginatedSupplierPayments> => {
    const query = new URLSearchParams();
    if (params?.branchId) query.append('branchId', params.branchId);
    if (params?.supplierId) query.append('supplierId', params.supplierId);
    if (params?.status) query.append('status', params.status);
    if (params?.startDate) query.append('startDate', params.startDate);
    if (params?.endDate) query.append('endDate', params.endDate);
    if (params?.page !== undefined) query.append('page', String(params.page));
    if (params?.size !== undefined) query.append('size', String(params.size));
    const qs = query.toString();
    return api.get<PaginatedSupplierPayments>(`/api/supplier-payments${qs ? '?' + qs : ''}`);
  }
};
