import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatSidenavModule } from '@angular/material/sidenav';
import { AuthService } from './core/auth/services/auth.service';
import { WebAuthService } from './core/auth/services/web-auth.service';
import { CartService } from './services/cart.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
    MatMenuModule,
    MatDividerModule,
    MatSidenavModule
  ],
  template: `
    <mat-toolbar color="primary" class="sticky top-0 z-50">
      <div class="container mx-auto px-4 flex justify-between items-center">
        <!-- Logo -->
        <a routerLink="/" class="text-white no-underline flex items-center">
          <span class="text-xl font-bold">MediSync</span>
        </a>

        <!-- Desktop Navigation -->
        <nav class="hidden md:flex items-center gap-4">
          <a mat-button routerLink="/store" routerLinkActive="bg-primary-600">
            <mat-icon>store</mat-icon>
            Store
          </a>

          <!-- Admin Navigation -->
          <ng-container *ngIf="auth.user$ | async">
            <a mat-button routerLink="/inventory" routerLinkActive="bg-primary-600">
              <mat-icon>inventory_2</mat-icon>
              Inventory
            </a>
            
            <a mat-button routerLink="/pos" routerLinkActive="bg-primary-600">
              <mat-icon>point_of_sale</mat-icon>
              POS
            </a>

            <button mat-button [matMenuTriggerFor]="adminMenu">
              <mat-icon>settings</mat-icon>
              Settings
            </button>
            <mat-menu #adminMenu="matMenu">
              <a mat-menu-item routerLink="/admin/settings/branches">
                <mat-icon>store</mat-icon>
                Branches
              </a>
              <a mat-menu-item routerLink="/admin/settings/categories">
                <mat-icon>category</mat-icon>
                Categories
              </a>
              <a mat-menu-item routerLink="/admin/settings/users">
                <mat-icon>people</mat-icon>
                Users
              </a>
              <a mat-menu-item routerLink="/admin/settings/general">
                <mat-icon>settings</mat-icon>
                General
              </a>
            </mat-menu>
          </ng-container>

          <!-- Cart (for web users) -->
          <ng-container *ngIf="!(auth.user$ | async)">
            <a mat-button routerLink="/cart" [matBadge]="cartItemCount$ | async" matBadgeColor="accent">
              <mat-icon>shopping_cart</mat-icon>
              Cart
            </a>
          </ng-container>

          <!-- User Menu -->
          <ng-container *ngIf="webAuth.user$ | async as user">
            <button mat-button [matMenuTriggerFor]="userMenu">
              <mat-icon>person</mat-icon>
              {{ user.full_name }}
            </button>
            <mat-menu #userMenu="matMenu">
              <a mat-menu-item routerLink="/profile">
                <mat-icon>account_circle</mat-icon>
                Profile
              </a>
              <a mat-menu-item routerLink="/orders">
                <mat-icon>receipt</mat-icon>
                Orders
              </a>
              <a mat-menu-item routerLink="/wishlist">
                <mat-icon>favorite</mat-icon>
                Wishlist
              </a>
              <mat-divider></mat-divider>
              <button mat-menu-item (click)="logout()">
                <mat-icon>logout</mat-icon>
                Logout
              </button>
            </mat-menu>
          </ng-container>

          <!-- Auth Buttons -->
          <ng-container *ngIf="!(auth.user$ | async) && !(webAuth.user$ | async)">
            <a mat-button routerLink="/admin/login">
              <mat-icon>admin_panel_settings</mat-icon>
              Admin
            </a>
            <a mat-button routerLink="/login">
              <mat-icon>login</mat-icon>
              Login
            </a>
          </ng-container>
        </nav>

        <!-- Mobile Menu Button -->
        <button mat-icon-button class="md:hidden" (click)="mobileMenuOpen = !mobileMenuOpen">
          <mat-icon>{{ mobileMenuOpen ? 'close' : 'menu' }}</mat-icon>
        </button>
      </div>
    </mat-toolbar>

    <!-- Mobile Navigation -->
    <div *ngIf="mobileMenuOpen" 
         class="md:hidden fixed inset-0 z-40 bg-black bg-opacity-50"
         (click)="mobileMenuOpen = false">
      <div class="absolute right-0 top-0 h-full w-64 bg-white shadow-lg"
           (click)="$event.stopPropagation()">
        <div class="flex flex-col h-full">
          <div class="p-4 flex flex-col gap-2">
            <a mat-button routerLink="/store" (click)="mobileMenuOpen = false">
              <mat-icon>store</mat-icon>
              Store
            </a>

            <!-- Admin Navigation -->
            <ng-container *ngIf="auth.user$ | async">
              <mat-divider></mat-divider>
              <a mat-button routerLink="/inventory" (click)="mobileMenuOpen = false">
                <mat-icon>inventory_2</mat-icon>
                Inventory
              </a>
              <a mat-button routerLink="/pos" (click)="mobileMenuOpen = false">
                <mat-icon>point_of_sale</mat-icon>
                POS
              </a>
              <a mat-button routerLink="/admin/settings/branches" (click)="mobileMenuOpen = false">
                <mat-icon>store</mat-icon>
                Branches
              </a>
              <a mat-button routerLink="/admin/settings/categories" (click)="mobileMenuOpen = false">
                <mat-icon>category</mat-icon>
                Categories
              </a>
              <a mat-button routerLink="/admin/settings/users" (click)="mobileMenuOpen = false">
                <mat-icon>people</mat-icon>
                Users
              </a>
              <a mat-button routerLink="/admin/settings/general" (click)="mobileMenuOpen = false">
                <mat-icon>settings</mat-icon>
                Settings
              </a>
            </ng-container>

            <!-- Web User Navigation -->
            <ng-container *ngIf="webAuth.user$ | async">
              <mat-divider></mat-divider>
              <a mat-button routerLink="/profile" (click)="mobileMenuOpen = false">
                <mat-icon>account_circle</mat-icon>
                Profile
              </a>
              <a mat-button routerLink="/orders" (click)="mobileMenuOpen = false">
                <mat-icon>receipt</mat-icon>
                Orders
              </a>
              <a mat-button routerLink="/wishlist" (click)="mobileMenuOpen = false">
                <mat-icon>favorite</mat-icon>
                Wishlist
              </a>
            </ng-container>

            <!-- Cart -->
            <ng-container *ngIf="!(auth.user$ | async)">
              <mat-divider></mat-divider>
              <a mat-button routerLink="/cart" (click)="mobileMenuOpen = false">
                <mat-icon [matBadge]="cartItemCount$ | async" matBadgeColor="accent">
                  shopping_cart
                </mat-icon>
                Cart
              </a>
            </ng-container>

            <!-- Auth Buttons -->
            <ng-container *ngIf="!(auth.user$ | async) && !(webAuth.user$ | async)">
              <mat-divider></mat-divider>
              <a mat-button routerLink="/admin/login" (click)="mobileMenuOpen = false">
                <mat-icon>admin_panel_settings</mat-icon>
                Admin Login
              </a>
              <a mat-button routerLink="/login" (click)="mobileMenuOpen = false">
                <mat-icon>login</mat-icon>
                Store Login
              </a>
            </ng-container>

            <!-- Logout -->
            <ng-container *ngIf="(auth.user$ | async) || (webAuth.user$ | async)">
              <mat-divider></mat-divider>
              <button mat-button (click)="logout(); mobileMenuOpen = false">
                <mat-icon>logout</mat-icon>
                Logout
              </button>
            </ng-container>
          </div>
        </div>
      </div>
    </div>

    <router-outlet></router-outlet>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
    }
    .mat-toolbar {
      position: sticky;
      top: 0;
      z-index: 1000;
    }
    .bg-primary-600 {
      background: rgba(255,255,255,0.1);
    }
  `]
})
export class AppComponent {
  mobileMenuOpen = false;
  cartItemCount$ = this.cartService.getCartItemCount();

  constructor(
    public auth: AuthService,
    public webAuth: WebAuthService,
    private cartService: CartService
  ) {
    this.cartService.loadCart();
  }

  logout() {
    if (this.auth.user$) {
      this.auth.signOut();
    } else {
      this.webAuth.signOut().subscribe();
    }
    this.mobileMenuOpen = false;
  }
}