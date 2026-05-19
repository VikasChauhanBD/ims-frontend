// src/services/inventoryService.ts
/**
 * Inventory Service - Handle all inventory-related API calls
 */
import api from './api';
import {
  InventoryAsset,
  InventoryAssetListItem,
  InventoryFilterParams,
  PaginatedResponse,
  UpdateEmailRequest,
} from '../types/inventory';

const INVENTORY_BASE = '/inventory-assets';

export const inventoryService = {
  /**
   * Get all inventory assets with optional filters
   */
  getAssets: (filters?: InventoryFilterParams): Promise<PaginatedResponse<InventoryAssetListItem>> => {
    const params = new URLSearchParams();
    
    if (filters?.category) params.append('category', filters.category);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.claimed !== undefined) params.append('claimed', String(filters.claimed));
    if (filters?.pending !== undefined) params.append('pending', String(filters.pending));
    if (filters?.assigned !== undefined) params.append('assigned', String(filters.assigned));
    if (filters?.search) params.append('search', filters.search);
    if (filters?.page) params.append('page', String(filters.page));
    if (filters?.page_size) params.append('page_size', String(filters.page_size));

    return api.get(`${INVENTORY_BASE}/`, { params }).then((res) => res.data);
  },

  /**
   * Get single inventory asset details
   */
  getAsset: (id: string): Promise<InventoryAsset> => {
    return api.get(`${INVENTORY_BASE}/${id}/`).then((res) => res.data);
  },

  /**
   * Get current user's inventory
   */
  getMyInventory: (page: number = 1): Promise<PaginatedResponse<InventoryAsset>> => {
    return api
      .get(`${INVENTORY_BASE}/my_inventory/`, { params: { page, page_size: 1000 } })
      .then((res) => res.data);
  },

  /**
   * Get assigned inventory (admin only)
   */
  getAssignedInventory: (page: number = 1): Promise<PaginatedResponse<InventoryAsset>> => {
    return api
      .get(`${INVENTORY_BASE}/assigned_inventory/`, { params: { page } })
      .then((res) => res.data);
  },

  /**
   * Get pending claims (admin only)
   */
  getPendingClaims: (page: number = 1): Promise<PaginatedResponse<InventoryAsset>> => {
    return api
      .get(`${INVENTORY_BASE}/pending_claims/`, { params: { page } })
      .then((res) => res.data);
  },

  /**
   * Update assigned email and send claim mail
   */
  updateAssignedEmail: (
    id: string,
    data: UpdateEmailRequest
  ): Promise<{ asset: InventoryAsset; email_sent: boolean; email_result: any }> => {
    return api
      .patch(`${INVENTORY_BASE}/${id}/update_email/`, data)
      .then((res) => res.data);
  },

  /**
   * Send claim mail for an asset
   */
  sendClaimMail: (id: string): Promise<{ success: boolean; message: string; details: any }> => {
    return api
      .post(`${INVENTORY_BASE}/${id}/send_claim_mail/`)
      .then((res) => res.data);
  },

  /**
   * Claim an inventory asset
   */
  claimDevice: (id: string): Promise<{ message: string; asset: InventoryAsset }> => {
    return api
      .post(`${INVENTORY_BASE}/${id}/claim/`)
      .then((res) => res.data);
  },

  /**
   * Bulk import CSV file
   */
  bulkImportCSV: (
    file: File,
    category?: string
  ): Promise<{ success: boolean; message: string; results: any }> => {
    const formData = new FormData();
    formData.append('file', file);
    if (category) {
      formData.append('category', category);
    }

    return api
      .post(`${INVENTORY_BASE}/bulk_import/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then((res) => res.data);
  },
};

export default inventoryService;
