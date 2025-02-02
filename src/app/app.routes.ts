import { Routes } from '@angular/router';
import { Permission } from './models/role.model';
import { PermissionGuard } from './guards/permission.guard';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'admin/users',
    loadComponent: () => import('./components/admin/user-management.component')
      .then(m => m.UserManagementComponent),
    canActivate: [AuthGuard, PermissionGuard],
    data: {
      permissions: [Permission.MANAGE_USERS]
    }
  },
  {
    path: 'inventory',
    loadComponent: () => import('./components/inventory/inventory-management.component')
      .then(m => m.InventoryManagementComponent),
    canActivate: [AuthGuard, PermissionGuard],
    data: {
      permissions: [Permission.MANAGE_BRANCH_INVENTORY]
    }
  },
  {
    path: 'pos',
    loadComponent: () => import('./components/pos/pos.component')
      .then(m => m.PosComponent),
    canActivate: [AuthGuard, PermissionGuard],
    data: {
      permissions: [Permission.CREATE_SALE]
    }
  },
  {
    path: 'store',
    loadComponent: () => import('./components/store/store.component')
      .then(m => m.StoreComponent)
  },
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () => import('./components/auth/login.component')
          .then(m => m.LoginComponent)
      }
    ]
  },
  {
    path: '',
    redirectTo: 'store',
    pathMatch: 'full'
  }
];
