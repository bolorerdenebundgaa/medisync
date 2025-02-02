import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { CartService, CartItem } from '../../services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    CommonModule, 
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatListModule
  ],
  template: `
    <div class="container mx-auto p-4">
      <h1 class="text-2xl font-bold mb-4">Shopping Cart</h1>
      <mat-card>
        <mat-card-content>
          <mat-list *ngIf="cartItems.length > 0; else emptyCart">
            <mat-list-item *ngFor="let item of cartItems">
              <span matListItemTitle>{{item.name}}</span>
              <span matListItemLine>
                Quantity: {{item.quantity}} × ${{item.price}}
              </span>
              <span matListItemMeta>
                ${{item.price * item.quantity}}
                <button mat-icon-button color="warn" (click)="removeItem(item.id)">
                  <mat-icon>delete</mat-icon>
                </button>
              </span>
            </mat-list-item>
            <mat-list-item>
              <span matListItemTitle class="font-bold">Total</span>
              <span matListItemMeta class="font-bold">${{getTotal()}}</span>
            </mat-list-item>
          </mat-list>
          <ng-template #emptyCart>
            <p class="text-center py-4">Your cart is empty</p>
          </ng-template>
        </mat-card-content>
        <mat-card-actions *ngIf="cartItems.length > 0" align="end">
          <button mat-button color="warn" (click)="clearCart()">Clear Cart</button>
          <button mat-raised-button color="primary" (click)="checkout()">
            Checkout
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

  checkout() {
    // TODO: Implement checkout functionality
    console.log('Checkout:', this.cartItems);
  }
}