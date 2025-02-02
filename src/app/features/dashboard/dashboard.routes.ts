import { Routes } from '@angular/router';
import { PermissionGuard } from '../../core/guards/permission.guard';
import { AdminDashboardComponent } from './components/admin-dashboard.component';
import { RefereeDashboardComponent } from './components/referee-dashboard.component';
import { PosDashboardComponent } from './components/pos-dashboard.component';

export const dashboardRoutes: Routes = [
  {
    path: 'admin',
    component: AdminDashboardComponent,
    canActivate: [PermissionGuard],
    data: { permission: 'dashboard:admin' }
  },
  {
    path: 'referee',
    component: RefereeDashboardComponent,
    canActivate: [PermissionGuard],
    data: { permission: 'dashboard:referee' }
  },
  {
    path: 'pos',
    component: PosDashboardComponent,
    canActivate: [PermissionGuard],
    data: { permission: 'dashboard:pos' }
  }
];