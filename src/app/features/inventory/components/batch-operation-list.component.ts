import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { InventoryBatchService, BatchOperation } from '../../../services/inventory-batch.service';
import { BranchService } from '../../../services/branch.service';
import { InventoryService } from '../../../services/inventory.service';
import { BatchOperationFormComponent } from './batch-operation-form.component';

@Component({
  selector: 'app-batch-operation-list',
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
      <div class="flex justify-between items-center mb-4">
        <h1 class="text-2xl font-bold">Batch Operations</h1>
        <button mat-raised-button color="primary" (click)="openBatchForm()">
          <mat-icon>add</mat-icon>
          New Operation
        </button>
      </div>

      <mat-card>
        <mat-card-content>
          <table mat-table [dataSource]="operations" class="w-full">
            <ng-container matColumnDef="type">
              <th mat-header-cell *matHeaderCellDef>Type</th>
              <td mat-cell *matCellDef="let op">{{op.type | titlecase}}</td>
            </ng-container>

            <ng-container matColumnDef="branch">
              <th mat-header-cell *matHeaderCellDef>Branch</th>
              <td mat-cell *matCellDef="let op">{{op.branch?.name}}</td>
            </ng-container>

            <ng-container matColumnDef="items">
              <th mat-header-cell *matHeaderCellDef>Items</th>
              <td mat-cell *matCellDef="let op">{{op.items?.length || 0}}</td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let op">
                <span [ngClass]="{
                  'text-yellow-600': op.status === 'pending',
                  'text-blue-600': op.status === 'in_progress',
                  'text-green-600': op.status === 'completed',
                  'text-red-600': op.status === 'cancelled'
                }">
                  {{op.status | titlecase}}
                </span>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let op">
                <button mat-icon-button color="primary"
                        [disabled]="op.status !== 'pending'"
                        (click)="processBatch(op)">
                  <mat-icon>play_arrow</mat-icon>
                </button>
                <button mat-icon-button color="warn"
                        [disabled]="op.status !== 'pending'"
                        (click)="cancelBatch(op)">
                  <mat-icon>cancel</mat-icon>
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
export class BatchOperationListComponent implements OnInit {
  operations: BatchOperation[] = [];
  displayedColumns = ['type', 'branch', 'items', 'status', 'actions'];

  constructor(
    private batchService: InventoryBatchService,
    private branchService: BranchService,
    private inventoryService: InventoryService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadOperations();
  }

  loadOperations() {
    this.batchService.getBatchOperations().subscribe(operations => {
      this.operations = operations;
    });
  }

  openBatchForm() {
    this.branchService.getBranches().subscribe(branches => {
      this.inventoryService.getProducts().subscribe(products => {
        const dialogRef = this.dialog.open(BatchOperationFormComponent, {
          width: '800px',
          data: { branches, products }
        });

        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            this.batchService.createBatchOperation(result).subscribe({
              next: () => {
                this.loadOperations();
                this.snackBar.open('Batch operation created', 'Close', { duration: 3000 });
              }
            });
          }
        });
      });
    });
  }

  processBatch(operation: BatchOperation) {
    this.batchService.processBatchOperation(operation.id).subscribe({
      next: () => this.loadOperations()
    });
  }

  cancelBatch(operation: BatchOperation) {
    // TODO: Implement cancel functionality
    this.snackBar.open('Cancel functionality coming soon', 'Close', { duration: 3000 });
  }
}