import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Permission, UserRole, DEFAULT_ROLE_PERMISSIONS } from '../models/role.model';
import { UserWithRoles, UserPermissionContext, UserRoleDetails } from '../models/user.model';
import { Branch } from '../models/branch.model';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  private currentUserSubject = new BehaviorSubject<UserWithRoles | null>(null);
  private selectedBranchSubject = new BehaviorSubject<Branch | null>(null);

  constructor() {}

  setCurrentUser(user: UserWithRoles | null): void {
    this.currentUserSubject.next(user);
  }

  setSelectedBranch(branch: Branch | null): void {
    this.selectedBranchSubject.next(branch);
  }

  getCurrentUser(): UserWithRoles | null {
    return this.currentUserSubject.value;
  }

  getSelectedBranch(): Branch | null {
    return this.selectedBranchSubject.value;
  }

  hasPermission(requiredPermissions: Permission | Permission[]): boolean {
    const user = this.currentUserSubject.value;
    if (!user) return false;

    const permissions = Array.isArray(requiredPermissions) 
      ? requiredPermissions 
      : [requiredPermissions];

    return permissions.every(permission => user.permissions.includes(permission));
  }

  hasRole(role: UserRole): boolean {
    const user = this.currentUserSubject.value;
    if (!user) return false;

    return user.roles.some((r: UserRoleDetails) => r.role_name === role && r.is_active);
  }

  hasBranchAccess(branchId: string): boolean {
    const user = this.currentUserSubject.value;
    if (!user) return false;

    // Admins have access to all branches
    if (this.hasRole(UserRole.ADMIN)) return true;

    return user.roles.some((r: UserRoleDetails) => r.branch_id === branchId && r.is_active);
  }

  canAccessBranchInventory(branchId: string): boolean {
    return this.hasPermission(Permission.VIEW_INVENTORY) && 
           this.hasBranchAccess(branchId);
  }

  canManageBranchInventory(branchId: string): boolean {
    return this.hasPermission(Permission.MANAGE_BRANCH_INVENTORY) && 
           this.hasBranchAccess(branchId);
  }

  canCreateSale(branchId: string): boolean {
    return this.hasPermission(Permission.CREATE_SALE) && 
           this.hasBranchAccess(branchId);
  }

  canManageClients(branchId: string): boolean {
    return this.hasPermission(Permission.MANAGE_CLIENTS) && 
           this.hasBranchAccess(branchId);
  }

  canCreateReferral(branchId: string): boolean {
    return this.hasPermission(Permission.CREATE_REFERRAL) && 
           this.hasBranchAccess(branchId);
  }

  getRolePermissions(role: UserRole): Permission[] {
    return DEFAULT_ROLE_PERMISSIONS[role] || [];
  }

  getUserBranches(): Branch[] {
    const user = this.currentUserSubject.value;
    if (!user) return [];

    // Admins can see all branches
    if (this.hasRole(UserRole.ADMIN)) {
      return user.branches;
    }

    // Filter branches based on active roles
    const branchIds = user.roles
      .filter((r: UserRoleDetails) => r.is_active && r.branch_id)
      .map((r: UserRoleDetails) => r.branch_id as string);

    return user.branches.filter((branch: Branch) => branchIds.includes(branch.id));
  }

  checkPermissionContext(context: UserPermissionContext): boolean {
    const { user, branch, requiredPermissions } = context;

    // Check if user has all required permissions
    const hasPermissions = requiredPermissions.every(permission => 
      user.permissions.includes(permission)
    );

    if (!hasPermissions) return false;

    // If branch-specific check is needed
    if (branch) {
      // Admins have access to all branches
      if (user.roles.some((r: UserRoleDetails) => r.role_name === UserRole.ADMIN && r.is_active)) {
        return true;
      }

      // Check if user has an active role in the branch
      return user.roles.some((r: UserRoleDetails) => 
        r.branch_id === branch.id && 
        r.is_active
      );
    }

    return true;
  }

  watchPermission(permission: Permission): Observable<boolean> {
    return this.currentUserSubject.pipe(
      map((user: UserWithRoles | null) => user?.permissions.includes(permission) || false)
    );
  }

  watchBranchAccess(branchId: string): Observable<boolean> {
    return this.currentUserSubject.pipe(
      map((user: UserWithRoles | null) => {
        if (!user) return false;
        if (this.hasRole(UserRole.ADMIN)) return true;
        return user.roles.some((r: UserRoleDetails) => r.branch_id === branchId && r.is_active);
      })
    );
  }
}
