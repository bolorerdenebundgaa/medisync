import { Routes } from '@angular/router';
import { BranchManagementComponent } from './components/branch-management.component';
import { UserManagementComponent } from './components/user-management.component';
import { SettingsComponent } from './components/settings.component';
import { CategoryManagementComponent } from './components/category-management.component';

export const adminRoutes: Routes = [
  { path: 'branches', component: BranchManagementComponent },
  { path: 'users', component: UserManagementComponent },
  { path: 'categories', component: CategoryManagementComponent },
  { path: 'general', component: SettingsComponent },
  { path: '', redirectTo: 'general', pathMatch: 'full' }
];