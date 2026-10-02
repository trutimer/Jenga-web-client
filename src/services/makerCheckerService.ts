import { api } from './api';
import type {
  StoreApprovalPolicy,
  StoreApprovalPolicyUpdateRequest,
  MakerCheckerRequest,
  MakerCheckerAction,
  MakerCheckerStatus,
  MakerCheckerDecisionRequest,
  PageResponse
} from '../models/types';

export const makerCheckerService = {
  /**
   * Fetch all configured approval policies for the current store
   */
  async getPolicies(): Promise<StoreApprovalPolicy[]> {
    return api.get<StoreApprovalPolicy[]>('/api/maker-checker/policies');
  },

  /**
   * Update an approval policy for a specific action type (Admin only)
   */
  async updatePolicy(
    actionType: MakerCheckerAction,
    payload: StoreApprovalPolicyUpdateRequest
  ): Promise<StoreApprovalPolicy> {
    return api.put<StoreApprovalPolicy>(`/api/maker-checker/policies/${actionType}`, payload);
  },

  /**
   * Fetch pending approval requests for current store / branch
   */
  async getPendingRequests(branchId?: string): Promise<MakerCheckerRequest[]> {
    let url = '/api/maker-checker/requests/pending';
    if (branchId) {
      url += `?branchId=${encodeURIComponent(branchId)}`;
    }
    return api.get<MakerCheckerRequest[]>(url);
  },

  /**
   * Search approval requests history with pagination and filters
   */
  async searchRequests(params: {
    branchId?: string;
    actionType?: MakerCheckerAction;
    status?: MakerCheckerStatus;
    page?: number;
    size?: number;
  } = {}): Promise<PageResponse<MakerCheckerRequest>> {
    const query = new URLSearchParams();
    if (params.branchId) query.append('branchId', params.branchId);
    if (params.actionType) query.append('actionType', params.actionType);
    if (params.status) query.append('status', params.status);
    query.append('page', String(params.page ?? 0));
    query.append('size', String(params.size ?? 20));

    return api.get<PageResponse<MakerCheckerRequest>>(`/api/maker-checker/requests?${query.toString()}`);
  },

  /**
   * Approve a pending maker-checker request (Checker decision)
   */
  async approveRequest(id: string, notes?: string): Promise<MakerCheckerRequest> {
    const body: MakerCheckerDecisionRequest = notes ? { notes } : {};
    return api.post<MakerCheckerRequest>(`/api/maker-checker/requests/${id}/approve`, body);
  },

  /**
   * Reject a pending maker-checker request with required reason
   */
  async rejectRequest(id: string, reason: string): Promise<MakerCheckerRequest> {
    const body: MakerCheckerDecisionRequest = { reason };
    return api.post<MakerCheckerRequest>(`/api/maker-checker/requests/${id}/reject`, body);
  },

  /**
   * Cancel a pending request by maker
   */
  async cancelRequest(id: string): Promise<MakerCheckerRequest> {
    return api.post<MakerCheckerRequest>(`/api/maker-checker/requests/${id}/cancel`);
  }
};
