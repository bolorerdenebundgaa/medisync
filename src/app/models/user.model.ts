import { UserRole, Permission } from './role.model';
import { Branch } from './branch.model';

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  is_active: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface UserWithRoles extends User {
  roles: UserRoleDetails[];
  permissions: Permission[];
  branches: Branch[];
}

export interface UserRoleDetails {
  role_id: string;
  role_name: UserRole;
  branch_id?: string;
  branch_name?: string;
  assigned_at: Date;
  assigned_by: string;
  is_active: boolean;
}

export interface UserState {
  currentUser?: UserWithRoles;
  selectedBranch?: Branch;
  lastUpdated?: Date;
}

export interface UserResponse {
  success: boolean;
  data?: User[];
  message?: string;
}

export interface UserLoginRequest {
  email: string;
  password: string;
}

export interface UserLoginResponse {
  success: boolean;
  data?: {
    user: UserWithRoles;
    token: string;
    branches: Branch[];
  };
  message?: string;
}

export interface UserRegistrationRequest {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  role_id: string;
  branch_id?: string;
}

export interface UserUpdateRequest {
  id: string;
  updates: {
    email?: string;
    full_name?: string;
    phone?: string;
    is_active?: boolean;
  };
}

export interface UserRoleUpdateRequest {
  user_id: string;
  role_updates: {
    add?: {
      role_id: string;
      branch_id?: string;
    }[];
    remove?: {
      role_id: string;
      branch_id?: string;
    }[];
  };
}

export interface UserBranchAccess {
  user_id: string;
  branch_id: string;
  role_id: string;
  access_level: 'read' | 'write' | 'admin';
  granted_by: string;
  granted_at: Date;
  revoked_at?: Date;
  is_active: boolean;
}

export interface UserBranchAccessRequest {
  user_id: string;
  branch_id: string;
  role_id: string;
  access_level: 'read' | 'write' | 'admin';
}

export interface UserBranchAccessResponse {
  success: boolean;
  data?: UserBranchAccess[];
  message?: string;
}

export interface UserPermissionContext {
  user: UserWithRoles;
  branch?: Branch;
  requiredPermissions: Permission[];
}

export interface UserSessionInfo {
  user: UserWithRoles;
  selectedBranch?: Branch;
  token: string;
  expiresAt: Date;
}
