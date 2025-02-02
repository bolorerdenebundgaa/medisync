import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { InventoryTransferService, InventoryTransfer } from '../../../services/inventory-transfer.service';
import { BranchService } from '../../../services/branch.service';
import { InventoryService } from '../../../services/inventory.service';
import { TransferFormComponent } from './transfer-form.component';

@Component({
  selector: 'app-transfer-list',
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
        <h1 class="text-2xl font-bold">Inventory Transfers</h1>
        <button mat-raised-button color="primary" (click)="openTransferForm()">
          <mat-icon>add</mat-icon>
          New Transfer
        </button>
      </div>

      <mat-card>
        <mat-card-content>
          <table mat-table [dataSource]="transfers" class="w-full">
            <ng-container matColumnDef="fromBranch">
              <th mat-header-cell *matHeaderCellDef>From Branch</th>
              <td mat-cell *matCellDef="let transfer">
                {{transfer.from_branch?.name}}
              </td>
            </ng-container>

            <ng-container matColumnDef="toBranch">
              <th mat-header-cell *matHeaderCellDef>To Branch</th>
              <td mat-cell *matCellDef="let transfer">
                {{transfer.to_branch?.name}}
              </td>
            </ng-container>

            <ng-container matColumnDef="product">
              <th mat-header-cell *matHeaderCellDef>Product</th>
              <td mat-cell *matCellDef="let transfer">
                {{transfer.product?.name}}
              </td>
            </ng-container>

            <ng-container matColumnDef="quantity">
              <th mat-header-cell *matHeaderCellDef>Quantity</th>
              <td mat-cell *matCellDef="let transfer">
                {{transfer.quantity}}
              </td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let transfer">
                <span [ngClass]="{
                  'text-yellow-600': transfer.status === 'pending',
                  'text-blue-600': transfer.status === 'in_transit',
                  'text-green-600': transfer.status === 'completed',
                  'text-red-600': transfer.status === 'cancelled'
                }">
                  {{transfer.status | titlecase}}
                </span>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let transfer">
                <button mat-icon-button color="primary" 
                        [disabled]="transfer.status !== 'pending'"
                        (click)="updateStatus(transfer, 'in_transit')">
                  <mat-icon>local_shipping</mat-icon>
                </button>
                <button mat-icon-button color="accent"
                        [disabled]="transfer.status !== 'in_transit'"
                        (click)="processTransfer(transfer)">
                  <mat-icon>check_circle</mat-icon>
                </button>
                <button mat-icon-button color="warn"
                        [disabled]="transfer.status !== 'pending'"
                        (click)="updateStatus(transfer, 'cancelled')">
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
export class TransferListComponent implements OnInit {
  transfers: InventoryTransfer[] = [];
  displayedColumns = ['fromBranch', 'toBranch', 'product', 'quantity', 'status', 'actions'];

  constructor(
    private transferService: InventoryTransferService,
    private branchService: BranchService,
    private inventoryService: InventoryService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadTransfers();
  }

  loadTransfers() {
    this.transferService.getTransfers().subscribe(transfers => {
      this.transfers = transfers;
    });
  }

  openTransferForm() {
    this.branchService.getBranches().subscribe(branches => {
      this.inventoryService.getProducts().subscribe(products => {
        const dialogRef = this.dialog.open(TransferFormComponent, {
          width: '500px',
          data: { branches, products }
        });

        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            this.transferService.createTransfer(result).subscribe({
              next: () => {
                this.loadTransfers();
                this.snackBar.open('Transfer created successfully', 'Close', { duration: 3000 });
              }
            });
          }
        });
      });
    });
  }

  updateStatus(transfer: InventoryTransfer, status: InventoryTransfer['status']) {
    this.transferService.updateTransferStatus(transfer.id, status).subscribe({
      next: () => this.loadTransfers()
    });
  }

  processTransfer(transfer: InventoryTransfer) {
    this.transferService.processTransfer(transfer.id).subscribe({
      next: () => this.loadTransfers()
    });
  }
}