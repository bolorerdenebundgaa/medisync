export interface Branch {
  id: string;
  name: string;
  location: string;
  is_ecommerce_base: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface BranchInventory {
  branch_id: string;
  product_id: string;
  quantity: number;
  min_quantity: number;
  max_quantity: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface InventoryTransfer {
  id: string;
  from_branch_id: string;
  to_branch_id: string;
  product_id: string;
  quantity: number;
  status: 'pending' | 'in_transit' | 'completed' | 'cancelled';
  notes?: string;
  created_at?: Date;
  updated_at?: Date;
}