import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

// Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { PosService } from '../../services/pos.service';
import { 
  PosItem, 
  Customer, 
  Referee, 
  PaymentMethod, 
  PosState,
  SearchResult
} from '../../models/pos.model';

@Component({
  selector: 'app-pos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatAutocompleteModule,
    MatTableModule,
    MatSelectModule,
    MatDividerModule,
    MatSnackBarModule
  ],
  template: `
    <div class="container mx-auto p-4">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Left Column: Product Search and Cart -->
        <div class="md:col-span-2">
          <mat-card>
            <mat-card-header>
              <mat-card-title>Point of Sale</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <!-- Product Search -->
              <mat-form-field class="w-full">
                <mat-label>Search Products</mat-label>
                <input matInput
                       type="text"
                       [(ngModel)]="productSearch"
                       (ngModelChange)="onProductSearchChange($event)"
                       [matAutocomplete]="auto">
                <mat-autocomplete #auto="matAutocomplete" 
                                (optionSelected)="onProductSelected($event)">
                  <mat-option *ngFor="let product of searchResults" [value]="product">
                    {{product.name}} - ${{product.price}}
                  </mat-option>
                </mat-autocomplete>
              </mat-form-field>

              <!-- Cart Table -->
              <table mat-table [dataSource]="state.items" class="w-full mt-4">
                <!-- Name Column -->
                <ng-container matColumnDef="name">
                  <th mat-header-cell *matHeaderCellDef>Product</th>
                  <td mat-cell *matCellDef="let item">{{item.name}}</td>
                </ng-container>

                <!-- Price Column -->
                <ng-container matColumnDef="price">
                  <th mat-header-cell *matHeaderCellDef>Price</th>
                  <td mat-cell *matCellDef="let item">${{item.price}}</td>
                </ng-container>

                <!-- Quantity Column -->
                <ng-container matColumnDef="quantity">
                  <th mat-header-cell *matHeaderCellDef>Quantity</th>
                  <td mat-cell *matCellDef="let item">
                    <button mat-icon-button 
                            (click)="updateQuantity(item, -1)"
                            [disabled]="item.quantity <= 1">
                      <mat-icon>remove</mat-icon>
                    </button>
                    {{item.quantity}}
                    <button mat-icon-button 
                            (click)="updateQuantity(item, 1)"
                            [disabled]="item.quantity >= (item.stock_quantity || 0)">
                      <mat-icon>add</mat-icon>
                    </button>
                  </td>
                </ng-container>

                <!-- Total Column -->
                <ng-container matColumnDef="total">
                  <th mat-header-cell *matHeaderCellDef>Total</th>
                  <td mat-cell *matCellDef="let item">${{item.price * item.quantity}}</td>
                </ng-container>

                <!-- Actions Column -->
                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef></th>
                  <td mat-cell *matCellDef="let item">
                    <button mat-icon-button color="warn" (click)="removeItem(item)">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
              </table>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Right Column: Customer, Payment, and Summary -->
        <div>
          <mat-card>
            <mat-card-content>
              <!-- Customer Search -->
              <mat-form-field class="w-full">
                <mat-label>Search Customer</mat-label>
                <input matInput
                       type="text"
                       [(ngModel)]="customerSearch"
                       (ngModelChange)="onCustomerSearchChange($event)"
                       [matAutocomplete]="customerAuto">
                <mat-autocomplete #customerAuto="matAutocomplete" 
                                (optionSelected)="onCustomerSelected($event)">
                  <mat-option *ngFor="let customer of customerResults" 
                            [value]="customer">
                    {{customer.full_name}}
                  </mat-option>
                </mat-autocomplete>
              </mat-form-field>

              <!-- Referee Search -->
              <mat-form-field class="w-full mt-4">
                <mat-label>Search Referee</mat-label>
                <input matInput
                       type="text"
                       [(ngModel)]="refereeSearch"
                       (ngModelChange)="onRefereeSearchChange($event)"
                       [matAutocomplete]="refereeAuto">
                <mat-autocomplete #refereeAuto="matAutocomplete" 
                                (optionSelected)="onRefereeSelected($event)">
                  <mat-option *ngFor="let referee of refereeResults" 
                            [value]="referee">
                    {{referee.full_name}}
                  </mat-option>
                </mat-autocomplete>
              </mat-form-field>

              <!-- Payment Method -->
              <mat-form-field class="w-full mt-4">
                <mat-label>Payment Method</mat-label>
                <mat-select [(ngModel)]="selectedPaymentMethod"
                          (selectionChange)="onPaymentMethodChange($event)">
                  <mat-option *ngFor="let method of paymentMethods" 
                            [value]="method">
                    {{method.name}}
                  </mat-option>
                </mat-select>
              </mat-form-field>

              <mat-divider class="my-4"></mat-divider>

              <!-- Transaction Summary -->
              <div class="flex justify-between mb-2">
                <span>Subtotal:</span>
                <span>${{getSubtotal()}}</span>
              </div>
              <div class="flex justify-between mb-2">
                <span>VAT ({{state.vatPercentage}}%):</span>
                <span>${{getVatAmount()}}</span>
              </div>
              <div *ngIf="state.selectedReferee" class="flex justify-between mb-2">
                <span>Referral ({{state.referralPercentage}}%):</span>
                <span>${{getReferralAmount()}}</span>
              </div>
              <div class="flex justify-between mb-4 text-lg font-bold">
                <span>Total:</span>
                <span>${{getTotalAmount()}}</span>
              </div>

              <!-- Complete Transaction Button -->
              <button mat-raised-button 
                      color="primary" 
                      class="w-full"
                      [disabled]="!canCompleteTransaction()"
                      (click)="completeTransaction()">
                Complete Transaction
              </button>
            </mat-card-content>
          </mat-card>
        </div>
      </div>
    </div>
  `
})
export class PosComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // Table configuration
  displayedColumns = ['name', 'price', 'quantity', 'total', 'actions'];
  
  // Search inputs
  productSearch = '';
  customerSearch = '';
  refereeSearch = '';
  
  // Search results
  searchResults: PosItem[] = [];
  customerResults: Customer[] = [];
  refereeResults: Referee[] = [];
  paymentMethods: PaymentMethod[] = [];
  
  // Selected payment method
  selectedPaymentMethod?: PaymentMethod;
  
  // Current state
  state: PosState = {
    items: [],
    vatPercentage: 10,
    referralPercentage: 5,
    branchId: 'default-branch'
  };

  constructor(
    public posService: PosService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // Subscribe to state changes
    this.posService.state$.pipe(
      takeUntil(this.destroy$)
    ).subscribe((state: PosState) => {
      this.state = state;
    });

    // Load payment methods
    this.posService.getPaymentMethods().pipe(
      takeUntil(this.destroy$)
    ).subscribe((methods: PaymentMethod[]) => {
      this.paymentMethods = methods;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Product Management
  onProductSearchChange(query: string): void {
    if (query.length >= 2) {
      this.posService.searchProducts(query).pipe(
        takeUntil(this.destroy$)
      ).subscribe((result: SearchResult<PosItem>) => {
        this.searchResults = result.data;
      });
    }
  }

  onProductSelected(event: { option: { value: PosItem } }): void {
    const item = event.option.value;
    this.posService.addItem(item);
    this.productSearch = '';
    this.searchResults = [];
  }

  updateQuantity(item: PosItem, change: number): void {
    this.posService.updateItemQuantity(item.product_id, item.quantity + change);
  }

  removeItem(item: PosItem): void {
    this.posService.removeItem(item.product_id);
  }

  // Customer Management
  onCustomerSearchChange(query: string): void {
    if (query.length >= 2) {
      this.posService.searchCustomers(query).pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      ).subscribe((result: SearchResult<Customer>) => {
        this.customerResults = result.data;
      });
    }
  }

  onCustomerSelected(event: { option: { value: Customer } }): void {
    const customer = event.option.value;
    this.posService.setCustomer(customer);
    this.customerSearch = customer.full_name;
  }

  // Referee Management
  onRefereeSearchChange(query: string): void {
    if (query.length >= 2) {
      this.posService.searchReferees(query).pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      ).subscribe((result: SearchResult<Referee>) => {
        this.refereeResults = result.data;
      });
    }
  }

  onRefereeSelected(event: { option: { value: Referee } }): void {
    const referee = event.option.value;
    this.posService.setReferee(referee);
    this.refereeSearch = referee.full_name;
  }

  // Payment Method Management
  onPaymentMethodChange(event: { value: PaymentMethod }): void {
    this.posService.setPaymentMethod(event.value);
  }

  // Calculation Methods
  getSubtotal(): number {
    return this.state.items.reduce((sum: number, item: PosItem) => sum + (item.price * item.quantity), 0);
  }

  getVatAmount(): number {
    return Number((this.getSubtotal() * this.state.vatPercentage / 100).toFixed(2));
  }

  getReferralAmount(): number {
    return this.state.selectedReferee ? 
      Number((this.getSubtotal() * this.state.referralPercentage / 100).toFixed(2)) : 0;
  }

  getTotalAmount(): number {
    return Number((this.getSubtotal() + this.getVatAmount()).toFixed(2));
  }

  // Transaction Management
  canCompleteTransaction(): boolean {
    return this.state.items.length > 0 && !!this.selectedPaymentMethod;
  }

  completeTransaction(): void {
    this.posService.createTransaction().subscribe({
      next: () => {
        this.resetForm();
      },
      error: (error: { message?: string }) => {
        this.snackBar.open(error.message || 'Transaction failed', 'Close', { duration: 3000 });
      }
    });
  }

  private resetForm(): void {
    this.productSearch = '';
    this.customerSearch = '';
    this.refereeSearch = '';
    this.selectedPaymentMethod = undefined;
    this.searchResults = [];
    this.customerResults = [];
    this.refereeResults = [];
  }
}
