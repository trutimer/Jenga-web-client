import { api } from './api';
import type {
  InventoryLocation,
  InventoryLocationCreateRequest,
  InventoryLocationUpdateRequest,
  LocationStock,
  StockTransfer,
  StockTransferCreateRequest,
  StockTransferConfirmRequest,
  StockTransferStatus,
  InternalConsumptionRequest,
  InternalConsumptionResponse,
  StockMovement,
  StockMovementType,
  PageResponse,
  StoreBranchInfo
} from '../models/types';

export const warehouseService = {
  // ==========================================
  // INVENTORY LOCATIONS
  // ==========================================

  /**
   * Fetch all inventory locations (warehouses & branch stock locations) for current store
   */
  async getLocations(storeId?: string): Promise<InventoryLocation[]> {
    const query = storeId ? `?storeId=${encodeURIComponent(storeId)}` : '';
    return api.get<InventoryLocation[]>(`/api/inventory-locations${query}`);
  },

  /**
   * Get single location details by ID
   */
  async getLocationById(id: string): Promise<InventoryLocation> {
    return api.get<InventoryLocation>(`/api/inventory-locations/${encodeURIComponent(id)}`);
  },

  /**
   * Get all stock items and on-hand/reserved quantities at a specific location
   */
  async getLocationStock(id: string): Promise<LocationStock[]> {
    return api.get<LocationStock[]>(`/api/inventory-locations/${encodeURIComponent(id)}/stock`);
  },

  /**
   * Create a new standalone warehouse or branch backroom location
   */
  async createLocation(
    payload: InventoryLocationCreateRequest,
    storeId?: string
  ): Promise<InventoryLocation> {
    const query = storeId ? `?storeId=${encodeURIComponent(storeId)}` : '';
    return api.post<InventoryLocation>(`/api/inventory-locations${query}`, payload);
  },

  /**
   * Update an existing location's metadata
   */
  async updateLocation(
    id: string,
    payload: InventoryLocationUpdateRequest
  ): Promise<InventoryLocation> {
    return api.put<InventoryLocation>(`/api/inventory-locations/${encodeURIComponent(id)}`, payload);
  },

  /**
   * Update served branch access list for a standalone warehouse
   */
  async updateServedBranches(
    id: string,
    servedBranchIds: string[]
  ): Promise<InventoryLocation> {
    return api.put<InventoryLocation>(`/api/inventory-locations/${encodeURIComponent(id)}/served-branches`, {
      servedBranchIds
    });
  },

  /**
   * Update location-specific reorder alert threshold for a product
   */
  async updateReorderLevel(
    id: string,
    productId: string,
    reorderLevel: number
  ): Promise<LocationStock> {
    return api.put<LocationStock>(`/api/inventory-locations/${encodeURIComponent(id)}/reorder-levels`, {
      productId,
      reorderLevel
    });
  },

  /**
   * Soft-delete an empty inactive location
   */
  async deleteLocation(id: string): Promise<void> {
    return api.delete(`/api/inventory-locations/${encodeURIComponent(id)}`);
  },

  // ==========================================
  // STOCK TRANSFERS
  // ==========================================

  /**
   * Fetch paginated list of stock transfers with optional location & status filters
   */
  async getTransfers(params: {
    storeId?: string;
    locationId?: string;
    status?: StockTransferStatus;
    page?: number;
    size?: number;
  } = {}): Promise<PageResponse<StockTransfer>> {
    const query = new URLSearchParams();
    if (params.storeId) query.append('storeId', params.storeId);
    if (params.locationId) query.append('locationId', params.locationId);
    if (params.status) query.append('status', params.status);
    query.append('page', String(params.page ?? 0));
    query.append('size', String(params.size ?? 20));

    return api.get<PageResponse<StockTransfer>>(`/api/stock-transfers?${query.toString()}`);
  },

  /**
   * Get single stock transfer details by ID including item line details
   */
  async getTransferById(id: string): Promise<StockTransfer> {
    return api.get<StockTransfer>(`/api/stock-transfers/${encodeURIComponent(id)}`);
  },

  /**
   * Initiate / create a stock transfer (1-step or 2-step)
   */
  async createTransfer(payload: StockTransferCreateRequest): Promise<StockTransfer> {
    return api.post<StockTransfer>('/api/stock-transfers', payload);
  },

  /**
   * Confirm physical receipt of a stock transfer at destination location
   */
  async confirmTransfer(
    id: string,
    payload?: StockTransferConfirmRequest
  ): Promise<StockTransfer> {
    return api.post<StockTransfer>(
      `/api/stock-transfers/${encodeURIComponent(id)}/confirm`,
      payload || {}
    );
  },

  /**
   * Cancel an in-transit or pending stock transfer (releases reserved inventory)
   */
  async cancelTransfer(id: string, reason: string = 'Cancelled by user'): Promise<StockTransfer> {
    return api.post<StockTransfer>(
      `/api/stock-transfers/${encodeURIComponent(id)}/cancel?reason=${encodeURIComponent(reason)}`
    );
  },

  // ==========================================
  // INTERNAL INVENTORY CONSUMPTION
  // ==========================================

  /**
   * Record internal usage/consumption (kitchen prep, supplies, packaging, etc.)
   */
  async recordConsumption(
    payload: InternalConsumptionRequest
  ): Promise<InternalConsumptionResponse> {
    return api.post<InternalConsumptionResponse>('/api/inventory/consume', payload);
  },

  // ==========================================
  // INVENTORY MOVEMENT LEDGER
  // ==========================================

  /**
   * Query unified chronological stock movement ledger with running balances
   */
  async getInventoryLedger(params: {
    storeId?: string;
    branchId?: string;
    locationId?: string;
    productId?: string;
    type?: StockMovementType;
    transferId?: string;
    date?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    size?: number;
  } = {}): Promise<PageResponse<StockMovement>> {
    const query = new URLSearchParams();
    if (params.storeId) query.append('storeId', params.storeId);
    if (params.branchId) query.append('branchId', params.branchId);
    if (params.locationId) query.append('locationId', params.locationId);
    if (params.productId) query.append('productId', params.productId);
    if (params.type) query.append('type', params.type);
    if (params.transferId) query.append('transferId', params.transferId);
    if (params.date) query.append('date', params.date);
    if (params.startDate) query.append('startDate', params.startDate);
    if (params.endDate) query.append('endDate', params.endDate);
    query.append('page', String(params.page ?? 0));
    query.append('size', String(params.size ?? 20));

    return api.get<PageResponse<StockMovement>>(`/api/inventory-ledger?${query.toString()}`);
  },

  // ==========================================
  // STORE BRANCHES
  // ==========================================

  /**
   * Get store branches for mapping and served-branch configurations
   */
  async getBranches(storeId?: string, status?: string): Promise<StoreBranchInfo[]> {
    const query = new URLSearchParams();
    if (storeId) query.append('storeId', storeId);
    if (status) query.append('status', status);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return api.get<StoreBranchInfo[]>(`/api/branches${qs}`);
  }
};
