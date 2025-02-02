import { Routes } from '@angular/router';
import { AdminAuthGuard } from './core/guards/admin-auth.guard';
import { WebAuthGuard } from './core/guards/web-auth.guard';
import { LoginComponent } from './core/auth/components/login.component';
import { WebLoginComponent } from './features/store/components/web-login.component';
import { WebRegisterComponent } from './features/store/components/web-register.component';
import { ForgotPasswordComponent } from './features/store/components/forgot-password.component';
import { StoreComponent } from './features/store/components/store.component';
import { CartComponent } from './features/store/components/cart.component';
import { ProductDetailComponent } from './features/store/components/product-detail.component';
import { ProfileComponent } from './features/store/components/profile.component';
import { WishlistComponent } from './features/store/components/wishlist.component';
import { OrdersComponent } from './features/store/components/orders.component';

export const routes: Routes = [
  // Public routes
  { path: '', redirectTo: '/store', pathMatch: 'full' },
  { path: 'admin/login', component: LoginComponent },
  { path: 'login', component: WebLoginComponent },
  { path: 'register', component: WebRegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'store', component: StoreComponent },
  { path: 'product/:id', component: ProductDetailComponent },
  { path: 'cart', component: CartComponent },
  
  // Protected web user routes
  { path: 'profile', component: ProfileComponent, canActivate: [WebAuthGuard] },
  { path: 'wishlist', component: WishlistComponent, canActivate: [WebAuthGuard] },
  { path: 'orders', component: OrdersComponent, canActivate: [WebAuthGuard] },
  
  // Protected admin routes
  { 
    path: 'admin',
    canActivate: [AdminAuthGuard],
    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('./features/dashboard/dashboard.module').then(m => m.DashboardModule)
      },
      {
        path: 'settings',
        loadChildren: () => import('./features/admin/admin.module').then(m => m.AdminModule)
      }
    ]
  },
  { 
    path: 'inventory',
    loadChildren: () => import('./features/inventory/inventory.module').then(m => m.InventoryModule),
    canActivate: [AdminAuthGuard]
  },
  {
    path: 'pos',
    loadChildren: () => import('./features/pos/pos.module').then(m => m.PosModule),
    canActivate: [AdminAuthGuard]
  }
];