import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, RouterModule, MatTabsModule, MatIconModule],
  template: `
    <div class="container mx-auto p-4">
      <mat-tab-group>
        <mat-tab label="Products">
          <router-outlet></router-outlet>
        </mat-tab>
        <mat-tab label="Batch Operations">
          <router-outlet></router-outlet>
        </mat-tab>
        <mat-tab label="Alerts">
          <router-outlet></router-outlet>
        </mat-tab>
        <mat-tab label="Transfers">
          <router-outlet></router-outlet>
        </mat-tab>
      </mat-tab-group>
    </div>
  `
})
export class InventoryManagementComponent {}