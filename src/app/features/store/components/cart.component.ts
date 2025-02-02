import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { CartService, CartItem } from '../../../services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatDividerModule
  ],
  template: `
    <div class="container mx-auto p-4">
      <h1 class="text-2xl font-bold mb-4">Shopping Cart</h1>
      <mat-card>
        <mat-card-content>
          <mat-list *ngIf="cartItems.length > 0; else emptyCart">
            <mat-list-item *ngFor="let item of cartItems">
              <div class="flex justify-between items-center w-full">
                <div>
                  <h3 class="font-bold">{{item.name}}</h3>
                  <p class="text-sm text-gray-600">
                    Quantity: {{item.quantity}} × {{item.price | currency}}
                  </p>
                </div>
                <div class="flex items-center gap-4">
                  <span class="font-bold">{{item.price * item.quantity | currency}}</span>
                  <button mat-icon-button color="warn" (click)="removeItem(item.id)">
                    <mat-icon>delete</mat-icon>
                  </button>
                </div>
              </div>
            </mat-list-item>

            <mat-divider></mat-divider>

            <mat-list-item>
              <div class="flex justify-between w-full">
                <span class="font-bold">Total</span>
                <span class="font-bold">{{getTotal() | currency}}</span>
              </div>
            </mat-list-item>
          </mat-list>

          <ng-template #emptyCart>
            <div class="text-center py-8">
              <mat-icon class="text-6xl text-gray-400">shopping_cart</mat-icon>
              <p class="mt-4 text-xl text-gray-600">Your cart is empty</p>
              <button mat-raised-button color="primary" routerLink="/store" class="mt-4">
                Continue Shopping
              </button>
            </div>
          </ng-template>
        </mat-card-content>

        <mat-card-actions *ngIf="cartItems.length > 0" align="end" class="p-4">
          <button mat-button color="warn" (click)="clearCart()">
            Clear Cart
          </button>
          <button mat-raised-button color="primary" routerLink="/checkout">
            Proceed to Checkout
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
  `
})
export class CartComponent implements OnInit {
  cartItems: CartItem[] = [];

  constructor(private cartService: CartService) {}

  ngOnInit() {
    this.cartService.getCartItems().subscribe(items => {
      this.cartItems = items;
    });
  }

  removeItem(productId: string) {
    this.cartService.removeFromCart(productId);
  }

  clearCart() {
    this.cartService.clearCart();
  }

  getTotal(): number {
    return this.cartItems.reduce((total, item) => 
      total + (item.price * item.quantity), 0
    );
  }
}