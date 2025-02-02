import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Product } from '../../../models/product.model';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  template: `
    <h2 mat-dialog-title>{{data ? 'Edit' : 'Add'}} Product</h2>
    <form [formGroup]="productForm" (ngSubmit)="onSubmit()">
      <mat-dialog-content>
        <div class="flex flex-col gap-4">
          <mat-form-field>
            <mat-label>SKU</mat-label>
            <input matInput formControlName="sku" required>
          </mat-form-field>

          <mat-form-field>
            <mat-label>Name</mat-label>
            <input matInput formControlName="name" required>
          </mat-form-field>

          <mat-form-field>
            <mat-label>Description</mat-label>
            <textarea matInput formControlName="description" rows="3"></textarea>
          </mat-form-field>

          <mat-form-field>
            <mat-label>Price</mat-label>
            <input matInput type="number" formControlName="price" required>
          </mat-form-field>

          <mat-form-field>
            <mat-label>Quantity</mat-label>
            <input matInput type="number" formControlName="quantity" required>
          </mat-form-field>

          <mat-form-field>
            <mat-label>Photo URL</mat-label>
            <input matInput formControlName="photo_url">
          </mat-form-field>

          <h3 class="text-lg font-semibold mt-4">Product Properties</h3>

          <mat-form-field>
            <mat-label>Ingredients (comma-separated)</mat-label>
            <textarea matInput formControlName="ingredients" rows="2"></textarea>
          </mat-form-field>

          <mat-form-field>
            <mat-label>Dosage</mat-label>
            <textarea matInput formControlName="dosage"></textarea>
          </mat-form-field>

          <mat-form-field>
            <mat-label>Storage Instructions</mat-label>
            <textarea matInput formControlName="storage_instructions"></textarea>
          </mat-form-field>

          <mat-form-field>
            <mat-label>Usage Instructions</mat-label>
            <textarea matInput formControlName="usage_instructions"></textarea>
          </mat-form-field>

          <mat-form-field>
            <mat-label>Warnings (comma-separated)</mat-label>
            <textarea matInput formControlName="warnings" rows="2"></textarea>
          </mat-form-field>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button type="button" (click)="dialogRef.close()">Cancel</button>
        <button mat-raised-button color="primary" type="submit" [disabled]="!productForm.valid">
          Save
        </button>
      </mat-dialog-actions>
    </form>
  `
})
export class ProductFormComponent {
  productForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ProductFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Product | null
  ) {
    this.productForm = this.fb.group({
      sku: [data?.sku || '', Validators.required],
      name: [data?.name || '', Validators.required],
      description: [data?.description || ''],
      price: [data?.price || 0, [Validators.required, Validators.min(0)]],
      quantity: [data?.quantity || 0, [Validators.required, Validators.min(0)]],
      photo_url: [data?.photo_url || ''],
      ingredients: [data?.properties?.ingredients?.join(', ') || ''],
      dosage: [data?.properties?.dosage || ''],
      storage_instructions: [data?.properties?.storage_instructions || ''],
      usage_instructions: [data?.properties?.usage_instructions || ''],
      warnings: [data?.properties?.warnings?.join(', ') || '']
    });
  }

  onSubmit() {
    if (this.productForm.valid) {
      const formValue = this.productForm.value;
      const product: Product = {
        ...this.data,
        ...formValue,
        properties: {
          ingredients: formValue.ingredients.split(',').map((i: string) => i.trim()).filter(Boolean),
          dosage: formValue.dosage,
          storage_instructions: formValue.storage_instructions,
          usage_instructions: formValue.usage_instructions,
          warnings: formValue.warnings.split(',').map((w: string) => w.trim()).filter(Boolean)
        }
      };
      
      // Remove form-only fields
      delete (product as any).ingredients;
      delete (product as any).dosage;
      delete (product as any).storage_instructions;
      delete (product as any).usage_instructions;
      delete (product as any).warnings;

      this.dialogRef.close(product);
    }
  }
}