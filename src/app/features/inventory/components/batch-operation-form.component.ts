import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Product } from '../../../models/product.model';
import { Branch } from '../../../models/branch.model';
import { BatchOperation } from '../../../services/inventory-batch.service';

@Component({
  selector: 'app-batch-operation-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <h2 mat-dialog-title>{{data.operation ? 'Edit' : 'New'}} Batch Operation</h2>
    <form [formGroup]="batchForm" (ngSubmit)="onSubmit()">
      <mat-dialog-content>
        <div class="flex flex-col gap-4">
          <mat-form-field>
            <mat-label>Type</mat-label>
            <mat-select formControlName="type" required>
              <mat-option value="adjustment">Stock Adjustment</mat-option>
              <mat-option value="stocktake">Stock Take</mat-option>
              <mat-option value="expiry_check">Expiry Check</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field>
            <mat-label>Branch</mat-label>
            <mat-select formControlName="branchId" required>
              <mat-option *ngFor="let branch of data.branches" [value]="branch.id">
                {{branch.name}}
              </mat-option>
            </mat-select>
          </mat-form-field>

          <div formArrayName="items" class="space-y-4">
            <div *ngFor="let item of items.controls; let i=index" 
                 [formGroupName]="i"
                 class="flex gap-4 items-start">
              <mat-form-field class="flex-grow">
                <mat-label>Product</mat-label>
                <mat-select formControlName="productId" required>
                  <mat-option *ngFor="let product of data.products" [value]="product.id">
                    {{product.name}} ({{product.sku}})
                  </mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field>
                <mat-label>New Quantity</mat-label>
                <input matInput type="number" formControlName="newQuantity" required>
              </mat-form-field>

              <mat-form-field>
                <mat-label>Reason</mat-label>
                <input matInput formControlName="reason">
              </mat-form-field>

              <button mat-icon-button color="warn" type="button" 
                      (click)="removeItem(i)"
                      [disabled]="items.length === 1">
                <mat-icon>remove_circle</mat-icon>
              </button>
            </div>
          </div>

          <button mat-button color="primary" type="button" (click)="addItem()">
            <mat-icon>add</mat-icon>
            Add Item
          </button>

          <mat-form-field>
            <mat-label>Notes</mat-label>
            <textarea matInput formControlName="notes" rows="3"></textarea>
          </mat-form-field>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button type="button" (click)="dialogRef.close()">Cancel</button>
        <button mat-raised-button color="primary" type="submit" 
                [disabled]="!batchForm.valid">
          Save
        </button>
      </mat-dialog-actions>
    </form>
  `
})
export class BatchOperationFormComponent {
  batchForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<BatchOperationFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      operation?: BatchOperation;
      branches: Branch[];
      products: Product[];
    }
  ) {
    this.batchForm = this.fb.group({
      type: ['adjustment', Validators.required],
      branchId: ['', Validators.required],
      notes: [''],
      items: this.fb.array([])
    });

    if (data.operation) {
      this.batchForm.patchValue(data.operation);
      data.operation.items.forEach(item => this.addItem(item));
    } else {
      this.addItem();
    }
  }

  get items() {
    return this.batchForm.get('items') as FormArray;
  }

  addItem(item?: any) {
    this.items.push(this.fb.group({
      productId: [item?.productId || '', Validators.required],
      currentQuantity: [item?.currentQuantity || 0],
      newQuantity: [item?.newQuantity || 0, [Validators.required, Validators.min(0)]],
      reason: [item?.reason || '']
    }));
  }

  removeItem(index: number) {
    this.items.removeAt(index);
  }

  onSubmit() {
    if (this.batchForm.valid) {
      const operation = {
        ...this.data.operation,
        ...this.batchForm.value,
        status: 'pending'
      };
      this.dialogRef.close(operation);
    }
  }
}