import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

import { InventoryTransaction } from '../../services/inventory.service';
import { BranchInventory } from '../../models/branch.model';

export interface InventoryHistoryDialogData {
  transactions: InventoryTransaction[];
  currentInventory: BranchInventory;
}

@Component({
  selector: 'app-inventory-history-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule
  ],
  template: `
    <div class="p-4">
      <h2 mat-dialog-title class="text-xl font-bold mb-4">
        Transaction History - {{data.currentInventory.product_name}}
      </h2>

      <mat-dialog-content>
        <!-- Current Status Card -->
        <mat-card class="mb-4">
          <mat-card-content>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div class="text-sm text-gray-600">Current Quantity</div>
                <div class="text-lg font-semibold">{{data.currentInventory.quantity}}</div>
              </div>
              <div>
                <div class="text-sm text-gray-600">Min Quantity</div>
                <div class="text-lg font-semibold">{{data.currentInventory.min_quantity}}</div>
              </div>
              <div>
                <div class="text-sm text-gray-600">Max Quantity</div>
                <div class="text-lg font-semibold">{{data.currentInventory.max_quantity}}</div>
              </div>
              <div>
                <div class="text-sm text-gray-600">Reorder Point</div>
                <div class="text-lg font-semibold">{{data.currentInventory.reorder_point}}</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Transactions Table -->
        <table mat-table [dataSource]="data.transactions" class="w-full">
          <ng-container matColumnDef="created_at">
            <th mat-header-cell *matHeaderCellDef>Date</th>
            <td mat-cell *matCellDef="let item">
              {{item.created_at | date:'medium'}}
            </td>
          </ng-container>

          <ng-container matColumnDef="transaction_type">
            <th mat-header-cell *matHeaderCellDef>Type</th>
            <td mat-cell *matCellDef="let item">
              <span [ngClass]="{
                'text-green-600': item.transaction_type === 'in',
                'text-red-600': item.transaction_type === 'out',
                'text-blue-600': item.transaction_type === 'transfer',
                'text-yellow-600': item.transaction_type === 'adjustment'
              }">
                {{item.transaction_type | titlecase}}
              </span>
            </td>
          </ng-container>

          <ng-container matColumnDef="quantity">
            <th mat-header-cell *matHeaderCellDef>Quantity</th>
            <td mat-cell *matCellDef="let item">
              <span [ngClass]="{
                'text-green-600': item.transaction_type === 'in',
                'text-red-600': item.transaction_type === 'out'
              }">
                {{item.transaction_type === 'in' ? '+' : ''}}{{item.quantity}}
              </span>
            </td>
          </ng-container>

          <ng-container matColumnDef="reference_type">
            <th mat-header-cell *matHeaderCellDef>Reference</th>
            <td mat-cell *matCellDef="let item">
              {{item.reference_type}}
            </td>
          </ng-container>

          <ng-container matColumnDef="created_by_name">
            <th mat-header-cell *matHeaderCellDef>Created By</th>
            <td mat-cell *matCellDef="let item">
              {{item.created_by_name}}
            </td>
          </ng-container>

          <ng-container matColumnDef="notes">
            <th mat-header-cell *matHeaderCellDef>Notes</th>
            <td mat-cell *matCellDef="let item">
              {{item.notes}}
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="close()">Close</button>
      </mat-dialog-actions>
    </div>
  `
})
export class InventoryHistoryDialogComponent {
  displayedColumns = [
    'created_at',
    'transaction_type',
    'quantity',
    'reference_type',
    'created_by_name',
    'notes'
  ];

  constructor(
    public dialogRef: MatDialogRef<InventoryHistoryDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: InventoryHistoryDialogData
  ) {}

  close(): void {
    this.dialogRef.close();
  }
}
