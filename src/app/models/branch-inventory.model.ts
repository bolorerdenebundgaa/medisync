export interface BranchInventory {
  id: string;
  branch_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  min_quantity: number;
  max_quantity?: number;
  created_at: string;
  updated_at: string;
}

export interface InventoryTransaction {
  id: string;
  branch_id: string;
  product_id: string;
  type: 'in' | 'out' | 'transfer' | 'adjustment';
  quantity: number;
  reference_type?: string;
  reference_id?: string;
  notes?: string;
  created_by: string;
  created_at: string;
}

export interface InventoryTransfer {
  id: string;
  source_branch_id: string;
  destination_branch_id: string;
  product_id: string;
  quantity: number;
  status: 'pending' | 'completed' | 'cancelled';
  notes?: string;
  created_by: string;
  created_at: string;
  completed_at?: string;
}

export interface InventoryAlert {
  id: string;
  branch_id: string;
  product_id: string;
  type: 'low_stock' | 'out_of_stock' | 'over_stock';
  threshold: number;
  current_quantity: number;
  created_at: string;
  resolved_at?: string;
}

export interface BatchOperation {
  id: string;
  branch_id: string;
  type: 'stock_update' | 'transfer' | 'adjustment';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  items: {
    product_id: string;
    quantity: number;
    notes?: string;
  }[];
  created_by: string;
  created_at: string;
  completed_at?: string;
  error_message?: string;
}

export interface InventoryHistoryDialogData {
  currentInventory: BranchInventory;
  transactions: InventoryTransaction[];
}
