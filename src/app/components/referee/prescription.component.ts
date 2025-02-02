import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { PrescriptionService } from '../../services/prescription.service';
import { ClientService } from '../../services/client.service';
import { ProductService } from '../../services/product.service';
import { BranchService } from '../../services/branch.service';
import { Client } from '../../models/client.model';
import { Product } from '../../models/product.model';
import { Branch } from '../../models/branch.model';

@Component({
  selector: 'app-prescription',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatTableModule,
    MatIconModule,
    MatAutocompleteModule,
    MatSnackBarModule,
    MatDialogModule
  ],
  template: `
    <div class="container mx-auto p-4">
      <!-- Client Search/Create Section -->
      <mat-card class="mb-4">
        <mat-card-header>
          <mat-card-title>Client Information</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <mat-form-field>
              <mat-label>Search Client</mat-label>
              <input matInput [formControl]="clientSearchControl" 
                     [matAutocomplete]="clientAuto">
              <mat-autocomplete #clientAuto="matAutocomplete"
                              [displayWith]="displayClient"
                              (optionSelected)="onClientSelected($event)">
                <mat-option *ngFor="let client of filteredClients" [value]="client">
                  {{client.full_name}} ({{client.phone || client.email}})
                </mat-option>
              </mat-autocomplete>
            </mat-form-field>

            <button mat-raised-button color="primary" 
                    *ngIf="!selectedClient && !showClientForm"
                    (click)="showClientForm = true">
              Create New Client
            </button>
          </div>

          <!-- New Client Form -->
          <form *ngIf="showClientForm" [formGroup]="clientForm" (ngSubmit)="createClient()"
                class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <mat-form-field>
              <mat-label>Full Name</mat-label>
              <input matInput formControlName="full_name">
            </mat-form-field>

            <mat-form-field>
              <mat-label>Phone</mat-label>
              <input matInput formControlName="phone">
            </mat-form-field>

            <mat-form-field>
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email">
            </mat-form-field>

            <mat-form-field>
              <mat-label>Address</mat-label>
              <textarea matInput formControlName="address"></textarea>
            </mat-form-field>

            <div class="col-span-2 flex justify-end gap-2">
              <button mat-button type="button" (click)="showClientForm = false">
                Cancel
              </button>
              <button mat-raised-button color="primary" type="submit"
                      [disabled]="!clientForm.valid">
                Create Client
              </button>
            </div>
          </form>

          <!-- Selected Client Info -->
          <div *ngIf="selectedClient" class="mt-4 p-4 bg-gray-50 rounded">
            <div class="flex justify-between items-start">
              <div>
                <h3 class="text-lg font-semibold">{{selectedClient.full_name}}</h3>
                <p *ngIf="selectedClient.phone">Phone: {{selectedClient.phone}}</p>
                <p *ngIf="selectedClient.email">Email: {{selectedClient.email}}</p>
                <p *ngIf="selectedClient.address">Address: {{selectedClient.address}}</p>
              </div>
              <button mat-icon-button (click)="clearSelectedClient()">
                <mat-icon>close</mat-icon>
              </button>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Prescription Items -->
      <mat-card *ngIf="selectedClient" class="mb-4">
        <mat-card-header>
          <mat-card-title>Prescription Items</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <!-- Add Item Form -->
          <form [formGroup]="itemForm" (ngSubmit)="addItem()"
                class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <mat-form-field>
              <mat-label>Search Product</mat-label>
              <input matInput [formControl]="productSearchControl"
                     [matAutocomplete]="productAuto">
              <mat-autocomplete #productAuto="matAutocomplete"
                              [displayWith]="displayProduct"
                              (optionSelected)="onProductSelected($event)">
                <mat-option *ngFor="let product of filteredProducts" [value]="product">
                  {{product.name}} ({{product.sku}})
                </mat-option>
              </mat-autocomplete>
            </mat-form-field>

            <mat-form-field>
              <mat-label>Quantity</mat-label>
              <input matInput type="number" formControlName="quantity">
            </mat-form-field>

            <mat-form-field class="col-span-2">
              <mat-label>Directions</mat-label>
              <textarea matInput formControlName="directions"></textarea>
            </mat-form-field>

            <div class="col-span-4 flex justify-end">
              <button mat-raised-button color="primary" type="submit"
                      [disabled]="!itemForm.valid">
                Add Item
              </button>
            </div>
          </form>

          <!-- Items Table -->
          <table mat-table [dataSource]="prescriptionItems" class="w-full">
            <ng-container matColumnDef="product">
              <th mat-header-cell *matHeaderCellDef>Product</th>
              <td mat-cell *matCellDef="let item">{{item.product.name}}</td>
            </ng-container>

            <ng-container matColumnDef="quantity">
              <th mat-header-cell *matHeaderCellDef>Quantity</th>
              <td mat-cell *matCellDef="let item">{{item.quantity}}</td>
            </ng-container>

            <ng-container matColumnDef="directions">
              <th mat-header-cell *matHeaderCellDef>Directions</th>
              <td mat-cell *matCellDef="let item">{{item.directions}}</td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let item; let i = index">
                <button mat-icon-button color="warn" (click)="removeItem(i)">
                  <mat-icon>delete</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
        </mat-card-content>
      </mat-card>

      <!-- Save Prescription -->
      <div class="flex justify-end">
        <button mat-raised-button color="primary" 
                [disabled]="!canSavePrescription()"
                (click)="savePrescription()">
          Save Prescription
        </button>
      </div>
    </div>
  `
})
export class PrescriptionComponent implements OnInit {
  clientSearchControl = this.fb.control('');
  productSearchControl = this.fb.control('');
  filteredClients: Client[] = [];
  filteredProducts: Product[] = [];
  selectedClient: Client | null = null;
  showClientForm = false;
  prescriptionItems: any[] = [];
  displayedColumns = ['product', 'quantity', 'directions', 'actions'];

  clientForm = this.fb.group({
    full_name: ['', Validators.required],
    phone: [''],
    email: ['', Validators.email],
    address: ['']
  });

  itemForm = this.fb.group({
    product: [null, Validators.required],
    quantity: [1, [Validators.required, Validators.min(1)]],
    directions: ['', Validators.required]
  });

  private searchClients$ = new Subject<string>();
  private searchProducts$ = new Subject<string>();

  constructor(
    private fb: FormBuilder,
    private prescriptionService: PrescriptionService,
    private clientService: ClientService,
    private productService: ProductService,
    private branchService: BranchService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // Setup client search
    this.searchClients$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => this.clientService.searchClients(term))
    ).subscribe(clients => {
      this.filteredClients = clients;
    });

    // Setup product search
    this.searchProducts$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => this.productService.searchProducts(term))
    ).subscribe(products => {
      this.filteredProducts = products;
    });

    // Subscribe to search input changes
    this.clientSearchControl.valueChanges.subscribe(value => {
      if (typeof value === 'string') {
        this.searchClients$.next(value);
      }
    });

    this.productSearchControl.valueChanges.subscribe(value => {
      if (typeof value === 'string') {
        this.searchProducts$.next(value);
      }
    });
  }

  displayClient(client: Client): string {
    return client ? `${client.full_name} (${client.phone || client.email})` : '';
  }

  displayProduct(product: Product): string {
    return product ? `${product.name} (${product.sku})` : '';
  }

  onClientSelected(event: any): void {
    this.selectedClient = event.option.value;
    this.showClientForm = false;
  }

  onProductSelected(event: any): void {
    this.itemForm.patchValue({ product: event.option.value });
  }

  createClient(): void {
    if (this.clientForm.valid) {
      this.clientService.createClient(this.clientForm.value).subscribe(client => {
        this.selectedClient = client;
        this.showClientForm = false;
        this.clientForm.reset();
        this.snackBar.open('Client created successfully', 'Close', { duration: 3000 });
      });
    }
  }

  clearSelectedClient(): void {
    this.selectedClient = null;
    this.clientSearchControl.setValue('');
    this.prescriptionItems = [];
  }

  addItem(): void {
    if (this.itemForm.valid) {
      this.prescriptionItems.push(this.itemForm.value);
      this.itemForm.reset({ quantity: 1 });
      this.productSearchControl.setValue('');
    }
  }

  removeItem(index: number): void {
    this.prescriptionItems.splice(index, 1);
  }

  canSavePrescription(): boolean {
    return !!this.selectedClient && this.prescriptionItems.length > 0;
  }

  savePrescription(): void {
    if (!this.canSavePrescription()) return;

    const prescription = {
      client_id: this.selectedClient!.id,
      items: this.prescriptionItems.map(item => ({
        product_id: item.product.id,
        quantity: item.quantity,
        directions: item.directions
      }))
    };

    this.prescriptionService.createPrescription(prescription).subscribe(() => {
      this.snackBar.open('Prescription saved successfully', 'Close', { duration: 3000 });
      this.clearForm();
    });
  }

  private clearForm(): void {
    this.selectedClient = null;
    this.clientSearchControl.setValue('');
    this.prescriptionItems = [];
    this.itemForm.reset({ quantity: 1 });
    this.productSearchControl.setValue('');
  }
}
