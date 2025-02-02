import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { InventoryAlertService, StockAlert } from '../../../services/inventory-alert.service';

@Component({
  selector: 'app-alert-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="container mx-auto p-4">
      <h1 class="text-2xl font-bold mb-4">Inventory Alerts</h1>

      <mat-card>
        <mat-card-content>
          <table mat-table [dataSource]="alerts" class="w-full">
            <ng-container matColumnDef="type">
              <th mat-header-cell *matHeaderCellDef>Type</th>
              <td mat-cell *matCellDef="let alert">
                <span [ngClass]="{
                  'text-yellow-600': alert.type === 'low_stock',
                  'text-red-600': alert.type === 'out_of_stock',
                  'text-orange-600': alert.type === 'expiring_soon',
                  'text-red-800': alert.type === 'expired'
                }">
                  {{alert.type | titlecase}}
                </span>
              </td>
            </ng-container>

            <ng-container matColumnDef="branch">
              <th mat-header-cell *matHeaderCellDef>Branch</th>
              <td mat-cell *matCellDef="let alert">{{alert.branch?.name}}</td>
            </ng-container>

            <ng-container matColumnDef="product">
              <th mat-header-cell *matHeaderCellDef>Product</th>
              <td mat-cell *matCellDef="let alert">{{alert.product?.name}}</td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let alert">
                <span [ngClass]="{
                  'text-red-600': alert.status === 'active',
                  'text-yellow-600': alert.status === 'acknowledged',
                  'text-green-600': alert.status === 'resolved'
                }">
                  {{alert.status | titlecase}}
                </span>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let alert">
                <button mat-icon-button color="primary"
                        [disabled]="alert.status !== 'active'"
                        (click)="acknowledgeAlert(alert)">
                  <mat-icon>visibility</mat-icon>
                </button>
                <button mat-icon-button color="accent"
                        [disabled]="alert.status === 'resolved'"
                        (click)="resolveAlert(alert)">
                  <mat-icon>check_circle</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
        </mat-card-content>
      </mat-card>
    </div>
  `
})
export class AlertListComponent implements OnInit {
  alerts: StockAlert[] = [];
  displayedColumns = ['type', 'branch', 'product', 'status', 'actions'];

  constructor(
    private alertService: InventoryAlertService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadAlerts();
  }

  loadAlerts() {
    this.alertService.getActiveAlerts().subscribe(alerts => {
      this.alerts = alerts;
    });
  }

  acknowledgeAlert(alert: StockAlert) {
    this.alertService.acknowledgeAlert(alert.id).subscribe({
      next: () => this.loadAlerts()
    });
  }

  resolveAlert(alert: StockAlert) {
    this.alertService.resolveAlert(alert.id).subscribe({
      next: () => this.loadAlerts()
    });
  }
}