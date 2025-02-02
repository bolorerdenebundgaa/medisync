export enum UserRole {
  ADMIN = 'admin',
  SALES = 'sales',
  REFEREE = 'referee'
}

export interface Role {
  id: string;
  name: UserRole;
  description: string;
  permissions: Permission[];
  created_at?: Date;
  updated_at?: Date;
}

export enum Permission {
  // Admin Permissions
  MANAGE_BRANCHES = 'manage_branches',
  MANAGE_USERS = 'manage_users',
  MANAGE_ROLES = 'manage_roles',
  MANAGE_PRODUCTS = 'manage_products',
  MANAGE_INVENTORY = 'manage_inventory',
  MANAGE_SETTINGS = 'manage_settings',
  VIEW_ALL_BRANCHES = 'view_all_branches',
  VIEW_ALL_REPORTS = 'view_all_reports',

  // Branch-specific Permissions
  VIEW_BRANCH = 'view_branch',
  MANAGE_BRANCH_INVENTORY = 'manage_branch_inventory',
  MANAGE_BRANCH_USERS = 'manage_branch_users',
  MANAGE_BRANCH_CLIENTS = 'manage_branch_clients',
  MANAGE_BRANCH_REFEREES = 'manage_branch_referees',
  VIEW_BRANCH_REPORTS = 'view_branch_reports',

  // Sales Permissions
  CREATE_SALE = 'create_sale',
  VIEW_PRODUCTS = 'view_products',
  VIEW_INVENTORY = 'view_inventory',
  VIEW_CLIENTS = 'view_clients',
  MANAGE_CLIENTS = 'manage_clients',

  // Referee Permissions
  VIEW_REFERRALS = 'view_referrals',
  CREATE_REFERRAL = 'create_referral',
  VIEW_COMMISSION = 'view_commission'
}

export const DEFAULT_ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: [
    Permission.MANAGE_BRANCHES,
    Permission.MANAGE_USERS,
    Permission.MANAGE_ROLES,
    Permission.MANAGE_PRODUCTS,
    Permission.MANAGE_INVENTORY,
    Permission.MANAGE_SETTINGS,
    Permission.VIEW_ALL_BRANCHES,
    Permission.VIEW_ALL_REPORTS
  ],
  [UserRole.SALES]: [
    Permission.VIEW_BRANCH,
    Permission.VIEW_PRODUCTS,
    Permission.VIEW_INVENTORY,
    Permission.CREATE_SALE,
    Permission.VIEW_CLIENTS,
    Permission.MANAGE_CLIENTS,
    Permission.VIEW_BRANCH_REPORTS
  ],
  [UserRole.REFEREE]: [
    Permission.VIEW_BRANCH,
    Permission.VIEW_PRODUCTS,
    Permission.VIEW_INVENTORY,
    Permission.VIEW_REFERRALS,
    Permission.CREATE_REFERRAL,
    Permission.VIEW_COMMISSION,
    Permission.VIEW_CLIENTS,
    Permission.MANAGE_CLIENTS
  ]
};

export interface RoleResponse {
  success: boolean;
  data?: Role[];
  message?: string;
}

export interface RoleState {
  roles: Role[];
  lastUpdated?: Date;
}

export interface UserRoleAssignment {
  user_id: string;
  role_id: string;
  branch_id?: string;
  assigned_by: string;
  assigned_at: Date;
  is_active: boolean;
}

export interface RolePermissionCheck {
  hasPermission: boolean;
  requiredPermissions: Permission[];
  userPermissions: Permission[];
  missingPermissions: Permission[];
}
