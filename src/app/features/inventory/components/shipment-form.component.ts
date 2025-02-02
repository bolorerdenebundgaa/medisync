import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { Product, Shipment } from '../../../models/product.model';
import { InventoryService } from '../services/inventory.service';

@Component({
  selector: 'app-shipment-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  template: `
    <h2 mat-dialog-title>{{data.shipment ? 'Edit' : 'New'}} Shipment</h2>
    <mat-dialog-content>
      <form [formGroup]="shipmentForm" class="flex flex-col gap-4">
        <mat-form-field>
          <mat-label>Product</mat-label>
          <mat-select formControlName="product_id" required>
            <mat-option *ngFor="let product of data.products" [value]="product.id">
              {{product.name}}
            </mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field>
          <mat-label>Origin Country</mat-label>
          <input matInput formControlName="origin_country" required>
        </mat-form-field>

        <mat-form-field>
          <mat-label>Destination Country</mat-label>
          <input matInput formControlName="destination_country" required>
        </mat-form-field>

        <mat-form-field>
          <mat-label>Quantity</mat-label>
          <input matInput type="number" formControlName="quantity" required>
        </mat-form-field>

        <mat-form-field>
          <mat-label>Tracking Number</mat-label>
          <input matInput formControlName="tracking_number">
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
          <mat-label>Estimated Arrival</mat-label>
          <input matInput [matDatepicker]="estimatedPicker" formControlName="estimated_arrival">
          <mat-datepicker-toggle matSuffix [for]="estimatedPicker"></mat-datepicker-toggle>
          <mat-datepicker #estimatedPicker></mat-datepicker>
        </mat-form-field>

        <mat-form-field *ngIf="shipmentForm.get('status')?.value === 'delivered'">
          <mat-label>Actual Arrival</mat-label>
          <input matInput [matDatepicker]="actualPicker" formControlName="actual_arrival">
          <mat-datepicker-toggle matSuffix [for]="actualPicker"></mat-datepicker-toggle>
          <mat-datepicker #actualPicker></mat-datepicker>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="dialogRef.close()">Cancel</button>
      <button mat-raised-button color="primary" 
              (click)="save()"
              [disabled]="!shipmentForm.valid">
        Save
      </button>
    </mat-dialog-actions>
  `
})
export class ShipmentFormComponent {
  shipmentForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private inventoryService: InventoryService,
    public dialogRef: MatDialogRef<ShipmentFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { shipment?: Shipment; products: Product[] }
  ) {
    this.shipmentForm = this.fb.group({
      product_id: [data.shipment?.product_id || '', Validators.required],
      origin_country: [data.shipment?.origin_country || '', Validators.required],
      destination_country: [data.shipment?.destination_country || '', Validators.required],
      quantity: [data.shipment?.quantity || 0, [Validators.required, Validators.min(1)]],
      tracking_number: [data.shipment?.tracking_number || ''],
      status: [data.shipment?.status || 'pending', Validators.required],
      estimated_arrival: [data.shipment?.estimated_arrival || null],
      actual_arrival: [data.shipment?.actual_arrival || null]
    });
  }

  save() {
    if (this.shipmentForm.valid) {
      const shipment = {
        ...this.shipmentForm.value,
        id: this.data.shipment?.id
      };

      const action = this.data.shipment
        ? this.inventoryService.updateShipment(shipment)
        : this.inventoryService.createShipment(shipment);

      action.subscribe({
        next: () => {
          this.dialogRef.close(true);
        },
        error: (error) => {
          console.error('Error saving shipment:', error);
        }
      });
    }
  }
}