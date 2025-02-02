import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { CartService, CartItem } from '../../../services/cart.service';
import { CheckoutService } from '../services/checkout.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule
  ],
  template: `
    <div class="container mx-auto p-4">
      <h1 class="text-2xl font-bold mb-4">Checkout</h1>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Order Summary -->
        <mat-card>
          <mat-card-header>
            <mat-card-title>Order Summary</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="space-y-2">
              <div *ngFor="let item of cartItems" class="flex justify-between py-2 border-b">
                <span>{{item.name}} ({{item.quantity}})</span>
                <span>\${{item.price * item.quantity}}</span>
              </div>
              <div class="flex justify-between font-bold pt-2">
                <span>Total</span>
                <span>\${{getTotal()}}</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Shipping Form -->
        <mat-card>
          <mat-card-header>
            <mat-card-title>Shipping Information</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <form [formGroup]="shippingForm" class="flex flex-col gap-4">
              <mat-form-field>
                <mat-label>Full Name</mat-label>
                <input matInput formControlName="fullName" required>
              </mat-form-field>

              <mat-form-field>
                <mat-label>Email</mat-label>
                <input matInput type="email" formControlName="email" required>
              </mat-form-field>

              <mat-form-field>
                <mat-label>Phone</mat-label>
                <input matInput formControlName="phone" required>
              </mat-form-field>

              <mat-form-field>
                <mat-label>Address</mat-label>
                <textarea matInput formControlName="address" rows="3" required></textarea>
              </mat-form-field>
            </form>
          </mat-card-content>
          <mat-card-actions align="end">
            <button mat-button (click)="router.navigate(['/cart'])">Back to Cart</button>
            <button mat-raised-button color="primary" 
                    [disabled]="!shippingForm.valid || cartItems.length === 0"
                    (click)="placeOrder()">
              Place Order
            </button>
          </mat-card-actions>
        </mat-card>
      </div>
    </div>
  `
})
export class CheckoutComponent implements OnInit {
  cartItems: CartItem[] = [];
  shippingForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private cartService: CartService,
    private checkoutService: CheckoutService,
    private snackBar: MatSnackBar,
    public router: Router
  ) {
    this.shippingForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      address: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.cartService.getCartItems().subscribe(items => {
      this.cartItems = items;
      if (items.length === 0) {
        this.router.navigate(['/cart']);
      }
    });
  }

  getTotal(): number {
    return this.cartItems.reduce((total, item) => 
      total + (item.price * item.quantity), 0
    );
  }

  placeOrder() {
    if (this.shippingForm.valid) {
      const order = {
        items: this.cartItems,
        shipping: this.shippingForm.value,
        total: this.getTotal()
      };

      this.checkoutService.processOrder(order).subscribe({
        next: () => {
          this.cartService.clearCart();
          this.snackBar.open('Order placed successfully!', 'Close', { duration: 3000 });
          this.router.navigate(['/']);
        },
        error: (error) => {
          console.error('Error placing order:', error);
          this.snackBar.open('Error placing order', 'Close', { duration: 3000 });
        }
      });
    }
  }
}