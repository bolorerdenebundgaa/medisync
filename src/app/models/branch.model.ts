export interface Branch {
  id: string;
  name: string;
  address: string;
  phone?: string;
  email?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface BranchInventory {
  id: string;
  branch_id: string;
  product_id: string;
  quantity: number;
  min_quantity: number;
  max_quantity: number;
  reorder_point: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface BranchUser {
  id: string;
  branch_id: string;
  user_id: string;
  role_id: string;
  is_active: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface BranchClient {
  id: string;
  branch_id: string;
  client_id: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface BranchReferee {
  id: string;
  branch_id: string;
  referee_id: string;
  commission_rate: number;
  is_active: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface BranchState {
  currentBranch?: Branch;
  inventory: BranchInventory[];
  users: BranchUser[];
  clients: BranchClient[];
  referees: BranchReferee[];
  lastUpdated?: Date;
}

export interface BranchResponse {
  success: boolean;
  data?: Branch[];
  message?: string;
}

export interface BranchInventoryResponse {
  success: boolean;
  data?: BranchInventory[];
  message?: string;
}

export interface BranchUserResponse {
  success: boolean;
  data?: BranchUser[];
  message?: string;
}

export interface BranchClientResponse {
  success: boolean;
  data?: BranchClient[];
  message?: string;
}

export interface BranchRefereeResponse {
  success: boolean;
  data?: BranchReferee[];
  message?: string;
}
