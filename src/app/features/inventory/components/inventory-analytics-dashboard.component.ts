import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgChartsModule } from 'ng2-charts';
import { InventoryAnalyticsService, InventoryAnalytics } from '../services/inventory-analytics.service';
import { BranchService } from '../../../services/branch.service';
import { Branch } from '../../../models/branch.model';

@Component({
  selector: 'app-inventory-analytics-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    NgChartsModule
  ],
  template: `
    <div class="container mx-auto p-4">
      <h1 class="text-2xl font-bold mb-4">Inventory Analytics</h1>

      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <mat-card>
          <mat-card-content>
            <div class="flex items-center justify-between">
              <div>
                <p class="text-gray-600">Total Products</p>
                <h3 class="text-2xl font-bold">{{analytics?.summary?.total_products || 0}}</h3>
              </div>
              <mat-icon class="text-blue-500">inventory_2</mat-icon>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-content>
            <div class="flex items-center justify-between">
              <div>
                <p class="text-gray-600">Low Stock</p>
                <h3 class="text-2xl font-bold text-yellow-600">
                  {{analytics?.summary?.low_stock_products || 0}}
                </h3>
              </div>
              <mat-icon class="text-yellow-500">warning</mat-icon>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-content>
            <div class="flex items-center justify-between">
              <div>
                <p class="text-gray-600">Out of Stock</p>
                <h3 class="text-2xl font-bold text-red-600">
                  {{analytics?.summary?.out_of_stock_products || 0}}
                </h3>
              </div>
              <mat-icon class="text-red-500">error</mat-icon>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-content>
            <div class="flex items-center justify-between">
              <div>
                <p class="text-gray-600">Active Products</p>
                <h3 class="text-2xl font-bold text-green-600">
                  {{analytics?.summary?.active_products || 0}}
                </h3>
              </div>
              <mat-icon class="text-green-500">check_circle</mat-icon>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Product Performance Table -->
      <mat-card class="mb-6">
        <mat-card-header>
          <mat-card-title>Product Performance</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="overflow-x-auto">
            <table class="min-w-full">
              <thead>
                <tr>
                  <th class="text-left p-3">Product</th>
                  <th class="text-right p-3">Current Stock</th>
                  <th class="text-right p-3">Total Sold</th>
                  <th class="text-right p-3">Turnover Rate</th>
                  <th class="text-center p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let product of analytics?.products || []" 
                    class="border-t hover:bg-gray-50">
                  <td class="p-3">
                    <div>
                      <p class="font-medium">{{product.name}}</p>
                      <p class="text-sm text-gray-500">SKU: {{product.sku}}</p>
                    </div>
                  </td>
                  <td class="p-3 text-right">
                    <span [ngClass]="{
                      'text-red-600': product.current_stock === 0,
                      'text-yellow-600': product.current_stock <= 10,
                      'text-green-600': product.current_stock > 10
                    }">
                      {{product.current_stock}}
                    </span>
                  </td>
                  <td class="p-3 text-right">{{product.total_sold}}</td>
                  <td class="p-3 text-right">
                    {{product.turnover_rate | number:'1.2-2'}}
                  </td>
                  <td class="p-3 text-center">
                    <button mat-icon-button color="primary" 
                            (click)="generateForecast(product.id)"
                            matTooltip="Generate Forecast">
                      <mat-icon>trending_up</mat-icon>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `
})
export class InventoryAnalyticsDashboardComponent implements OnInit {
  analytics: InventoryAnalytics | null = null;
  selectedBranch: Branch | null = null;

  constructor(
    private analyticsService: InventoryAnalyticsService,
    private branchService: BranchService
  ) {}

  ngOnInit() {
    this.loadBranch();
  }

  private loadBranch() {
    this.branchService.getBranches().subscribe(branches => {
      if (branches.length > 0) {
        this.selectedBranch = branches[0];
        this.loadAnalytics();
      }
    });
  }

  private loadAnalytics() {
    if (this.selectedBranch) {
      this.analyticsService.getInventoryAnalytics(this.selectedBranch.id)
        .subscribe(analytics => {
          this.analytics = analytics;
        });
    }
  }

  generateForecast(productId: string) {
    if (this.selectedBranch) {
      this.analyticsService.generateForecast(productId, this.selectedBranch.id)
        .subscribe(() => {
          this.loadAnalytics();
        });
    }
  }
}