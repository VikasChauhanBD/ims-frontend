// src/types/inventory.ts
/**
 * Inventory-related TypeScript types
 */

export type InventoryCategory = 'pc' | 'laptop' | 'headphone' | 'connector' | 'mobile';

export type InventoryStatus = 'available' | 'assigned' | 'pending_claim' | 'claimed' | 'retired';

export type ConditionType = 'new' | 'excellent' | 'good' | 'fair' | 'poor';

export interface InventoryAsset {
  id: string;
  category: InventoryCategory;
  category_display: string;
  asset_name: string;
  serial_number: string;
  assigned_person_name: string;
  assigned_email: string | null;
  desk_number: string | null;
  assigned_user: string | null;
  assigned_user_details: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    full_name: string;
  } | null;
  assigned_date: string | null;
  assigned_by: string;
  purchase_date: string | null;
  quantity: number;
  status: InventoryStatus;
  status_display: string;
  condition: ConditionType;
  claimed: boolean;
  pending_claim: boolean;
  mail_sent: boolean;
  mail_sent_at: string | null;
  acknowledged: boolean;
  acknowledged_at: string | null;
  remarks: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface InventoryAssetListItem {
  id: string;
  category: InventoryCategory;
  category_display: string;
  asset_name: string;
  serial_number: string;
  assigned_person_name: string;
  assigned_email: string | null;
  desk_number: string | null;
  assigned_user: string | null;
  assigned_user_name: string | null;
  assigned_date: string | null;
  status: InventoryStatus;
  status_display: string;
  condition: ConditionType;
  claimed: boolean;
  pending_claim: boolean;
  mail_sent: boolean;
  created_at: string;
}

export interface InventoryFilterParams {
  category?: InventoryCategory;
  status?: InventoryStatus;
  claimed?: boolean;
  pending?: boolean;
  assigned?: boolean;
  search?: string;
  page?: number;
  page_size?: number;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface InventoryStats {
  total: number;
  claimed: number;
  pending: number;
  by_category: Record<InventoryCategory, number>;
}

export interface SendClaimEmailRequest {
  asset_id: string;
}

export interface UpdateEmailRequest {
  assigned_email: string;
  desk_number?: string;
}

export interface ClaimDeviceRequest {
  asset_id: string;
}

export interface DeviceConfiguration {
  [key: string]: any;
}
