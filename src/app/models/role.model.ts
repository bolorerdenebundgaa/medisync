export interface Role {
  id: string;
  name: string;
  description: string;
  created_at: Date;
}

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  created_at: Date;
}

export interface UserRole {
  id: string;
  user_id: string;
  role_id: string;
  branch_id?: string;
  created_at: Date;
}