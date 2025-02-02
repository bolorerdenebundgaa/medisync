import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { Shipment, Distribution } from '../../../models/product.model';
import { InventoryService } from '../services/inventory.service';

@Component({
  selector: 'app-distribution-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule
  ],
  template: `
    <h2 mat-dialog-title>{{data.distribution ? 'Edit' : 'New'}} Distribution</h2>
    <mat-dialog-content>
      <form [formGroup]="distributionForm" class="flex flex-col gap-4">
        <mat-form-field>
          <mat-label>Branch</mat-label>
          <mat-select formControlName="branch_id" required>
            <mat-option value="branch-1">Branch 1</mat-option>
            <mat-option value="branch-2">Branch 2</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field>
          <mat-label>Quantity</mat-label>
          <input matInput type="number" formControlName="quantity" required>
          <mat-hint *ngIf="data.shipment">
            Available: {{getAvailableQuantity()}}
          </mat-hint>
        </mat-form-field>

        <mat-form-field>
          <mat-label>Status</mat-label>
          <mat-select formControlName="status" required>
            <mat-option value="pending">Pending</mat-option>
            <mat-option value="in_transit">In Transit</mat-option>
            <mat-option value="delivered">Delivered</mat-option>
            <mat-option value="cancelled">Cancelled</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field>
          <mat-label>Notes</mat-label>
          <textarea matInput formControlName="notes" rows="3"></textarea>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="dialogRef.close()">Cancel</button>
      <button mat-raised-button color="primary" 
              (click)="save()"
              [disabled]="!distributionForm.valid">
        Save
      </button>
    </mat-dialog-actions>
  `
})
export class DistributionFormComponent {
  distributionForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private inventoryService: InventoryService,
    public dialogRef: MatDialogRef<DistributionFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { 
      distribution?: Distribution; 
      shipment?: Shipment;
    }
  ) {
    this.distributionForm = this.fb.group({
      branch_id: [data.distribution?.branch_id || '', Validators.required],
      quantity: [
        data.distribution?.quantity || 0, 
        [
          Validators.required, 
          Validators.min(1),
          Validators.max(this.getAvailableQuantity())
        ]
      ],
      status: [data.distribution?.status || 'pending', Validators.required],
      notes: [data.distribution?.notes || '']
    });
  }

  getAvailableQuantity(): number {
    if (!this.data.shipment) return 0;
    // TODO: Calculate remaining quantity after existing distributions
    return this.data.shipment.quantity;
  }

  save() {
    if (this.distributionForm.valid) {
      const distribution = {
        ...this.distributionForm.value,
        id: this.data.distribution?.id,
        shipment_id: this.data.shipment?.id
      };

      const action = this.data.distribution
        ? this.inventoryService.updateDistribution(distribution)
        : this.inventoryService.createDistribution(distribution);

      action.subscribe({
        next: () => {
          this.dialogRef.close(true);
        },
        error: (error) => {
          console.error('Error saving distribution:', error);
        }
      });
    }
  }
}