import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { Branch } from '../../../models/branch.model';
import { Product } from '../../../models/product.model';
import { InventoryTransfer } from '../../../services/inventory-transfer.service';

@Component({
  selector: 'app-transfer-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule
  ],
  template: `
    <h2 mat-dialog-title>{{data.transfer ? 'Edit' : 'New'}} Transfer</h2>
    <form [formGroup]="transferForm" (ngSubmit)="onSubmit()">
      <mat-dialog-content>
        <div class="flex flex-col gap-4">
          <mat-form-field>
            <mat-label>From Branch</mat-label>
            <mat-select formControlName="fromBranchId" required>
              <mat-option *ngFor="let branch of data.branches" [value]="branch.id">
                {{branch.name}}
              </mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field>
            <mat-label>To Branch</mat-label>
            <mat-select formControlName="toBranchId" required>
              <mat-option *ngFor="let branch of data.branches" [value]="branch.id">
                {{branch.name}}
              </mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field>
            <mat-label>Product</mat-label>
            <mat-select formControlName="productId" required>
              <mat-option *ngFor="let product of data.products" [value]="product.id">
                {{product.name}} ({{product.sku}})
              </mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field>
            <mat-label>Quantity</mat-label>
            <input matInput type="number" formControlName="quantity" required>
          </mat-form-field>

          <mat-form-field>
            <mat-label>Notes</mat-label>
            <textarea matInput formControlName="notes" rows="3"></textarea>
          </mat-form-field>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button type="button" (click)="dialogRef.close()">Cancel</button>
        <button mat-raised-button color="primary" type="submit" 
                [disabled]="!transferForm.valid || transferForm.pristine">
          Save
        </button>
      </mat-dialog-actions>
    </form>
  `
})
export class TransferFormComponent {
  transferForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<TransferFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      transfer?: InventoryTransfer;
      branches: Branch[];
      products: Product[];
    }
  ) {
    this.transferForm = this.fb.group({
      fromBranchId: ['', Validators.required],
      toBranchId: ['', Validators.required],
      productId: ['', Validators.required],
      quantity: ['', [Validators.required, Validators.min(1)]],
      notes: ['']
    });

    if (data.transfer) {
      this.transferForm.patchValue(data.transfer);
    }
  }

  onSubmit() {
    if (this.transferForm.valid) {
      const transfer = {
        ...this.data.transfer,
        ...this.transferForm.value,
        status: 'pending'
      };
      this.dialogRef.close(transfer);
    }
  }
}