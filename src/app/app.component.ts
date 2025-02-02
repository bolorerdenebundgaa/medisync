import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';

import { AuthService } from './services/auth.service';
import { CartService } from './services/cart.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatBadgeModule
  ],
  template: `
    <mat-toolbar color="primary" class="flex justify-between">
      <div class="flex items-center">
        <button mat-icon-button [matMenuTriggerFor]="menu">
          <mat-icon>menu</mat-icon>
        </button>
        <span class="ml-2">MediSync</span>
      </div>

      <div class="flex items-center gap-4">
        <!-- Cart Icon -->
        <button mat-icon-button routerLink="/cart" *ngIf="isLoggedIn">
          <mat-icon [matBadge]="cartItemCount$ | async" matBadgeColor="warn">
            shopping_cart
          </mat-icon>
        </button>

        <!-- User Menu -->
        <button mat-icon-button [matMenuTriggerFor]="userMenu" *ngIf="isLoggedIn">
          <mat-icon>account_circle</mat-icon>
        </button>

        <!-- Login Button -->
        <button mat-button routerLink="/login" *ngIf="!isLoggedIn">
          Login
        </button>
      </div>
    </mat-toolbar>

    <!-- Main Menu -->
    <mat-menu #menu="matMenu">
      <button mat-menu-item routerLink="/store">
        <mat-icon>store</mat-icon>
        <span>Store</span>
      </button>
      <button mat-menu-item routerLink="/pos" *ngIf="hasRole('staff')">
        <mat-icon>point_of_sale</mat-icon>
        <span>POS</span>
      </button>
      <button mat-menu-item routerLink="/inventory" *ngIf="hasRole('staff')">
        <mat-icon>inventory_2</mat-icon>
        <span>Inventory</span>
      </button>
      <button mat-menu-item routerLink="/admin" *ngIf="hasRole('admin')">
        <mat-icon>admin_panel_settings</mat-icon>
        <span>Admin</span>
      </button>
    </mat-menu>

    <!-- User Menu -->
    <mat-menu #userMenu="matMenu">
      <button mat-menu-item routerLink="/profile">
        <mat-icon>person</mat-icon>
        <span>Profile</span>
      </button>
      <button mat-menu-item routerLink="/orders">
        <mat-icon>receipt_long</mat-icon>
        <span>Orders</span>
      </button>
      <button mat-menu-item routerLink="/wishlist">
        <mat-icon>favorite</mat-icon>
        <span>Wishlist</span>
      </button>
      <button mat-menu-item (click)="logout()">
        <mat-icon>logout</mat-icon>
        <span>Logout</span>
      </button>
    </mat-menu>

    <main class="p-4">
      <router-outlet></router-outlet>
    </main>
  `
})
export class AppComponent implements OnInit {
  cartItemCount$ = this.cartService.itemCount$;

  constructor(
    private authService: AuthService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    if (this.isLoggedIn) {
      this.cartService.loadCart();
    }
  }

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  hasRole(role: string): boolean {
    return this.authService.hasRole(role);
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        // Router navigation will be handled by the auth interceptor
      },
      error: (error) => {
        console.error('Logout failed:', error);
      }
    });
  }
}
