import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { InventoryService, InventoryTransaction } from '../../services/inventory.service';
import { BranchService } from '../../services/branch.service';
import { PermissionService } from '../../services/permission.service';
import { Branch, BranchInventory } from '../../models/branch.model';
import { Permission } from '../../models/role.model';
import { InventoryHistoryDialogComponent } from './inventory-history-dialog.component';

@Component({
  selector: 'app-inventory-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatTableModule,
    MatSelectModule,
    MatDialogModule,
    MatSnackBarModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  template: `
    <div class="container mx-auto p-4">
      <!-- Branch Selection -->
      <mat-card class="mb-4">
        <mat-card-content>
          <mat-form-field class="w-full">
            <mat-label>Select Branch</mat-label>
            <mat-select [(ngModel)]="selectedBranchId" (selectionChange)="onBranchChange($event)">
              <mat-option *ngFor="let branch of branches" [value]="branch.id">
                {{branch.name}}
              </mat-option>
            </mat-select>
          </mat-form-field>
        </mat-card-content>
      </mat-card>

      <!-- Inventory Actions -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <mat-card>
          <mat-card-header>
            <mat-card-title>Add Stock</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="flex flex-col gap-4">
              <mat-form-field>
                <mat-label>Product ID</mat-label>
                <input matInput [(ngModel)]="addStockForm.productId">
              </mat-form-field>
              <mat-form-field>
                <mat-label>Quantity</mat-label>
                <input matInput type="number" [(ngModel)]="addStockForm.quantity">
              </mat-form-field>
              <mat-form-field>
                <mat-label>Notes</mat-label>
                <textarea matInput [(ngModel)]="addStockForm.notes"></textarea>
              </mat-form-field>
              <button mat-raised-button color="primary" 
                      [disabled]="!canAddStock()"
                      (click)="addStock()">
                Add Stock
              </button>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-header>
            <mat-card-title>Remove Stock</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="flex flex-col gap-4">
              <mat-form-field>
                <mat-label>Product ID</mat-label>
                <input matInput [(ngModel)]="removeStockForm.productId">
              </mat-form-field>
              <mat-form-field>
                <mat-label>Quantity</mat-label>
                <input matInput type="number" [(ngModel)]="removeStockForm.quantity">
              </mat-form-field>
              <mat-form-field>
                <mat-label>Notes</mat-label>
                <textarea matInput [(ngModel)]="removeStockForm.notes"></textarea>
              </mat-form-field>
              <button mat-raised-button color="warn" 
                      [disabled]="!canRemoveStock()"
                      (click)="removeStock()">
                Remove Stock
              </button>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-header>
            <mat-card-title>Transfer Stock</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="flex flex-col gap-4">
              <mat-form-field>
                <mat-label>Product ID</mat-label>
                <input matInput [(ngModel)]="transferStockForm.productId">
              </mat-form-field>
              <mat-form-field>
                <mat-label>Destination Branch</mat-label>
                <mat-select [(ngModel)]="transferStockForm.toBranchId">
                  <mat-option *ngFor="let branch of branches" 
                            [value]="branch.id"
                            [disabled]="branch.id === selectedBranchId">
                    {{branch.name}}
                  </mat-option>
                </mat-select>
              </mat-form-field>
              <mat-form-field>
                <mat-label>Quantity</mat-label>
                <input matInput type="number" [(ngModel)]="transferStockForm.quantity">
              </mat-form-field>
              <mat-form-field>
                <mat-label>Notes</mat-label>
                <textarea matInput [(ngModel)]="transferStockForm.notes"></textarea>
              </mat-form-field>
              <button mat-raised-button color="accent" 
                      [disabled]="!canTransferStock()"
                      (click)="transferStock()">
                Transfer Stock
              </button>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Inventory Table -->
      <mat-card>
        <mat-card-header>
          <mat-card-title>Current Inventory</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <table mat-table [dataSource]="inventory" class="w-full">
            <ng-container matColumnDef="product_name">
              <th mat-header-cell *matHeaderCellDef>Product</th>
              <td mat-cell *matCellDef="let item">{{item.product_name}}</td>
            </ng-container>

            <ng-container matColumnDef="quantity">
              <th mat-header-cell *matHeaderCellDef>Quantity</th>
              <td mat-cell *matCellDef="let item">{{item.quantity}}</td>
            </ng-container>

            <ng-container matColumnDef="min_quantity">
              <th mat-header-cell *matHeaderCellDef>Min Quantity</th>
              <td mat-cell *matCellDef="let item">{{item.min_quantity}}</td>
            </ng-container>

            <ng-container matColumnDef="max_quantity">
              <th mat-header-cell *matHeaderCellDef>Max Quantity</th>
              <td mat-cell *matCellDef="let item">{{item.max_quantity}}</td>
            </ng-container>

            <ng-container matColumnDef="reorder_point">
              <th mat-header-cell *matHeaderCellDef>Reorder Point</th>
              <td mat-cell *matCellDef="let item">{{item.reorder_point}}</td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let item">
                <button mat-icon-button (click)="viewHistory(item)">
                  <mat-icon>history</mat-icon>
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
export class InventoryManagementComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Branch selection
  branches: Branch[] = [];
  selectedBranchId: string = '';

  // Inventory data
  inventory: BranchInventory[] = [];
  displayedColumns = ['product_name', 'quantity', 'min_quantity', 'max_quantity', 'reorder_point', 'actions'];

  // Form models
  addStockForm = {
    productId: '',
    quantity: 0,
    notes: ''
  };

  removeStockForm = {
    productId: '',
    quantity: 0,
    notes: ''
  };

  transferStockForm = {
    productId: '',
    toBranchId: '',
    quantity: 0,
    notes: ''
  };

  constructor(
    private inventoryService: InventoryService,
    private branchService: BranchService,
    private permissionService: PermissionService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    // Load available branches
    this.branchService.getBranches().pipe(
      takeUntil(this.destroy$)
    ).subscribe((branches: Branch[]) => {
      this.branches = branches;
      if (branches.length > 0) {
        this.selectedBranchId = branches[0].id;
        this.loadInventory();
      }
    });

    // Subscribe to inventory updates
    this.inventoryService.watchInventory().pipe(
      takeUntil(this.destroy$)
    ).subscribe((inventory: BranchInventory[]) => {
      this.inventory = inventory;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onBranchChange(event: { value: string }): void {
    this.loadInventory();
  }

  private loadInventory(): void {
    if (this.selectedBranchId) {
      this.inventoryService.getBranchInventory(this.selectedBranchId).subscribe();
    }
  }

  canAddStock(): boolean {
    return this.permissionService.hasPermission(Permission.MANAGE_BRANCH_INVENTORY) &&
           this.selectedBranchId !== '' &&
           this.addStockForm.productId !== '' &&
           this.addStockForm.quantity > 0;
  }

  canRemoveStock(): boolean {
    return this.permissionService.hasPermission(Permission.MANAGE_BRANCH_INVENTORY) &&
           this.selectedBranchId !== '' &&
           this.removeStockForm.productId !== '' &&
           this.removeStockForm.quantity > 0;
  }

  canTransferStock(): boolean {
    return this.permissionService.hasPermission(Permission.MANAGE_BRANCH_INVENTORY) &&
           this.selectedBranchId !== '' &&
           this.transferStockForm.productId !== '' &&
           this.transferStockForm.toBranchId !== '' &&
           this.transferStockForm.quantity > 0;
  }

  addStock(): void {
    if (!this.canAddStock()) return;

    this.inventoryService.addStock(
      this.selectedBranchId,
      this.addStockForm.productId,
      this.addStockForm.quantity,
      this.addStockForm.notes
    ).subscribe(() => {
      this.addStockForm = { productId: '', quantity: 0, notes: '' };
    });
  }

  removeStock(): void {
    if (!this.canRemoveStock()) return;

    this.inventoryService.removeStock(
      this.selectedBranchId,
      this.removeStockForm.productId,
      this.removeStockForm.quantity,
      this.removeStockForm.notes
    ).subscribe(() => {
      this.removeStockForm = { productId: '', quantity: 0, notes: '' };
    });
  }

  transferStock(): void {
    if (!this.canTransferStock()) return;

    this.inventoryService.transferStock(
      this.selectedBranchId,
      this.transferStockForm.toBranchId,
      this.transferStockForm.productId,
      this.transferStockForm.quantity,
      this.transferStockForm.notes
    ).subscribe(() => {
      this.transferStockForm = { productId: '', toBranchId: '', quantity: 0, notes: '' };
    });
  }

  viewHistory(item: BranchInventory): void {
    this.inventoryService.getTransactionHistory(
      this.selectedBranchId,
      item.product_id
    ).subscribe((history: { transactions: InventoryTransaction[]; current_inventory: BranchInventory[] }) => {
      this.dialog.open(InventoryHistoryDialogComponent, {
        width: '900px',
        data: {
          transactions: history.transactions,
          currentInventory: item
        }
      });
    });
  }
}
