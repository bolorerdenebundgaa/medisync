import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [RouterModule, MatSidenavModule, MatListModule, MatIconModule],
  template: `
    <mat-sidenav-container class="h-screen">
      <mat-sidenav mode="side" opened class="p-4 w-64">
        <h2 class="text-xl font-bold mb-4">Admin Dashboard</h2>
        <mat-nav-list>
          <a mat-list-item routerLink="settings" routerLinkActive="bg-gray-100">
            <mat-icon matListItemIcon>settings</mat-icon>
            <span matListItemTitle>Global Settings</span>
          </a>
          <a mat-list-item routerLink="payment-settings" routerLinkActive="bg-gray-100">
            <mat-icon matListItemIcon>payment</mat-icon>
            <span matListItemTitle>Payment Settings</span>
          </a>
          <a mat-list-item routerLink="branches" routerLinkActive="bg-gray-100">
            <mat-icon matListItemIcon>store</mat-icon>
            <span matListItemTitle>Branch Management</span>
          </a>
          <a mat-list-item routerLink="users" routerLinkActive="bg-gray-100">
            <mat-icon matListItemIcon>people</mat-icon>
            <span matListItemTitle>User Management</span>
          </a>
        </mat-nav-list>
      </mat-sidenav>
      <mat-sidenav-content class="p-4">
        <router-outlet></router-outlet>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `
})
export class AdminDashboardComponent {}