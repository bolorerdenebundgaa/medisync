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
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { PosService } from '../../services/pos.service';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-pos',
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
    MatSnackBarModule
  ],
  template: `
    <div class="container mx-auto p-4">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Point of Sale</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <!-- Product Search -->
          <div class="mb-4">
            <mat-form-field class="w-full">
              <mat-label>Search Products</mat-label>
              <input matInput [formControl]="searchControl" 
                     [matAutocomplete]="auto">
              <mat-autocomplete #auto="matAutocomplete"
                              [displayWith]="displayProduct"
                              (optionSelected)="onProductSelected($event)">
                <mat-option *ngFor="let product of searchResults" [value]="product">
                  {{product.name}} - {{product.price | currency}}
                </mat-option>
              </mat-autocomplete>
            </mat-form-field>
          </div>

          <!-- Cart Table -->
          <table mat-table [dataSource]="cartItems" class="w-full">
            <!-- Product Column -->
            <ng-container matColumnDef="product">
              <th mat-header-cell *matHeaderCellDef>Product</th>
              <td mat-cell *matCellDef="let item">{{item.name}}</td>
            </ng-container>

            <!-- Price Column -->
            <ng-container matColumnDef="price">
              <th mat-header-cell *matHeaderCellDef>Price</th>
              <td mat-cell *matCellDef="let item">{{item.price | currency}}</td>
            </ng-container>

            <!-- Quantity Column -->
            <ng-container matColumnDef="quantity">
              <th mat-header-cell *matHeaderCellDef>Quantity</th>
              <td mat-cell *matCellDef="let item; let i = index">
                <button mat-icon-button (click)="decreaseQuantity(i)">
                  <mat-icon>remove</mat-icon>
                </button>
                {{item.quantity}}
                <button mat-icon-button (click)="increaseQuantity(i)">
                  <mat-icon>add</mat-icon>
                </button>
              </td>
            </ng-container>

            <!-- Total Column -->
            <ng-container matColumnDef="total">
              <th mat-header-cell *matHeaderCellDef>Total</th>
              <td mat-cell *matCellDef="let item">{{item.price * item.quantity | currency}}</td>
            </ng-container>

            <!-- Actions Column -->
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

          <!-- Totals -->
          <div class="mt-4 text-right">
            <p class="text-lg">Subtotal: {{subtotal | currency}}</p>
            <p class="text-lg">VAT ({{vatRate}}%): {{vatAmount | currency}}</p>
            <p class="text-xl font-bold">Total: {{total | currency}}</p>
          </div>

          <!-- Actions -->
          <div class="mt-4 flex justify-end space-x-2">
            <button mat-raised-button color="warn" (click)="clearCart()">
              Clear Cart
            </button>
            <button mat-raised-button color="primary" 
                    [disabled]="!cartItems.length"
                    (click)="checkout()">
              Checkout
            </button>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `
})
export class PosComponent implements OnInit {
  searchControl = this.fb.control('');
  searchResults: Product[] = [];
  cartItems: any[] = [];
  displayedColumns = ['product', 'price', 'quantity', 'total', 'actions'];
  vatRate = 15;

  private searchProducts$ = new Subject<string>();

  constructor(
    private fb: FormBuilder,
    private posService: PosService,
    private productService: ProductService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.setupProductSearch();
  }

  private setupProductSearch(): void {
    this.searchProducts$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => this.productService.searchProducts(term))
    ).subscribe(products => {
      this.searchResults = products;
    });

    this.searchControl.valueChanges.subscribe(value => {
      if (typeof value === 'string') {
        this.searchProducts$.next(value);
      }
    });
  }

  displayProduct(product: Product): string {
    return product ? `${product.name} - ${product.price}` : '';
  }

  onProductSelected(event: any): void {
    const product = event.option.value;
    const existingItem = this.cartItems.find(item => item.id === product.id);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      this.cartItems.push({
        ...product,
        quantity: 1
      });
    }

    this.searchControl.setValue('');
  }

  increaseQuantity(index: number): void {
    this.cartItems[index].quantity += 1;
  }

  decreaseQuantity(index: number): void {
    if (this.cartItems[index].quantity > 1) {
      this.cartItems[index].quantity -= 1;
    }
  }

  removeItem(index: number): void {
    this.cartItems.splice(index, 1);
  }

  clearCart(): void {
    this.cartItems = [];
  }

  get subtotal(): number {
    return this.cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  get vatAmount(): number {
    return this.subtotal * (this.vatRate / 100);
  }

  get total(): number {
    return this.subtotal + this.vatAmount;
  }

  checkout(): void {
    if (this.cartItems.length === 0) return;

    this.posService.createSale({
      items: this.cartItems.map(item => ({
        product_id: item.id,
        quantity: item.quantity,
        unit_price: item.price
      })),
      subtotal: this.subtotal,
      vat_amount: this.vatAmount,
      total_amount: this.total
    }).subscribe({
      next: () => {
        this.snackBar.open('Sale completed successfully', 'Close', { duration: 3000 });
        this.clearCart();
      },
      error: (error) => {
        this.snackBar.open(error.message || 'Error processing sale', 'Close', { duration: 3000 });
      }
    });
  }
}
