import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipModule } from '@angular/material/chips';

import { InventoryHistoryDialogData, InventoryTransaction } from '../../models/branch-inventory.model';

@Component({
  selector: 'app-inventory-history-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatChipModule
  ],
  template: `
    <h2 mat-dialog-title>
      Transaction History - {{data.currentInventory.product_name}}
    </h2>

    <mat-dialog-content>
      <div class="current-stock mb-4">
        <p class="text-lg">
          Current Stock: 
          <span [class]="getStockLevelClass()">
            {{data.currentInventory.quantity}}
          </span>
        </p>
        <p class="text-sm text-gray-600">
          Min: {{data.currentInventory.min_quantity}} 
          <span *ngIf="data.currentInventory.max_quantity">
            | Max: {{data.currentInventory.max_quantity}}
          </span>
        </p>
      </div>

      <table mat-table [dataSource]="data.transactions" class="w-full">
        <!-- Type Column -->
        <ng-container matColumnDef="type">
          <th mat-header-cell *matHeaderCellDef>Type</th>
          <td mat-cell *matCellDef="let transaction">
            <mat-chip [color]="getTypeColor(transaction.type)" selected>
              {{transaction.type | titlecase}}
            </mat-chip>
          </td>
        </ng-container>

        <!-- Quantity Column -->
        <ng-container matColumnDef="quantity">
          <th mat-header-cell *matHeaderCellDef>Quantity</th>
          <td mat-cell *matCellDef="let transaction">
            <span [class]="getQuantityClass(transaction)">
              {{getQuantityPrefix(transaction)}}{{transaction.quantity}}
            </span>
          </td>
        </ng-container>

        <!-- Notes Column -->
        <ng-container matColumnDef="notes">
          <th mat-header-cell *matHeaderCellDef>Notes</th>
          <td mat-cell *matCellDef="let transaction">
            {{transaction.notes || '-'}}
          </td>
        </ng-container>

        <!-- Date Column -->
        <ng-container matColumnDef="date">
          <th mat-header-cell *matHeaderCellDef>Date</th>
          <td mat-cell *matCellDef="let transaction">
            {{transaction.created_at | date:'medium'}}
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
      </table>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Close</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .mat-column-type {
      width: 120px;
    }
    .mat-column-quantity {
      width: 100px;
      text-align: right;
    }
    .mat-column-date {
      width: 180px;
    }
  `]
})
export class InventoryHistoryDialogComponent {
  displayedColumns = ['type', 'quantity', 'notes', 'date'];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: InventoryHistoryDialogData
  ) {}

  getStockLevelClass(): string {
    const { quantity, min_quantity, max_quantity } = this.data.currentInventory;
    
    if (quantity <= 0) {
      return 'text-red-600 font-bold';
    } else if (quantity <= min_quantity) {
      return 'text-orange-600 font-bold';
    } else if (max_quantity && quantity >= max_quantity) {
      return 'text-blue-600 font-bold';
    }
    return 'text-green-600 font-bold';
  }

  getTypeColor(type: string): 'primary' | 'accent' | 'warn' {
    switch (type) {
      case 'in':
        return 'primary';
      case 'out':
        return 'warn';
      case 'transfer':
        return 'accent';
      default:
        return 'primary';
    }
  }

  getQuantityClass(transaction: InventoryTransaction): string {
    return transaction.type === 'out' ? 'text-red-600' : 'text-green-600';
  }

  getQuantityPrefix(transaction: InventoryTransaction): string {
    return transaction.type === 'out' ? '-' : '+';
  }
}
