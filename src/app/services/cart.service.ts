import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Product } from '../models/product.model';
import { environment } from '../../environments/environment';
import { map } from 'rxjs/operators';

const API_URL = environment.apiUrl;

export interface CartItem extends Product {
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems = new BehaviorSubject<CartItem[]>([]);
  private guestCartId: string | null = null;

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {
    this.guestCartId = this.getGuestCartId();
  }

  private getGuestCartId(): string {
    let cartId = localStorage.getItem('guest_cart_id');
    if (!cartId) {
      cartId = 'guest_' + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('guest_cart_id', cartId);
    }
    return cartId;
  }

  loadCart() {
    if (!this.guestCartId) return;

    this.http.get<any>(`${API_URL}/cart/get.php`, {
      params: { guest_cart_id: this.guestCartId }
    }).subscribe({
      next: (response) => {
        if (response.success) {
          this.cartItems.next(response.data.items || []);
        } else {
          console.error('Error loading cart:', response.message);
          this.cartItems.next([]);
        }
      },
      error: (error) => {
        console.error('Error loading cart:', error);
        this.cartItems.next([]);
      }
    });
  }

  getCartItems(): Observable<CartItem[]> {
    return this.cartItems.asObservable();
  }

  getCartItemCount(): Observable<number> {
    return this.cartItems.pipe(
      map(items => items.reduce((total, item) => total + (item.quantity || 0), 0))
    );
  }

  addToCart(product: Product) {
    if (!this.guestCartId) return;

    this.http.post<any>(`${API_URL}/cart/add.php`, {
      product_id: product.id,
      quantity: 1,
      guest_cart_id: this.guestCartId
    }).subscribe({
      next: (response) => {
        if (response.success) {
          this.loadCart();
          this.snackBar.open('Added to cart', 'Close', { duration: 2000 });
        } else {
          console.error('Error adding to cart:', response.message);
          this.snackBar.open('Error adding to cart', 'Close', { duration: 3000 });
        }
      },
      error: (error) => {
        console.error('Error adding to cart:', error);
        this.snackBar.open('Error adding to cart', 'Close', { duration: 3000 });
      }
    });
  }

  removeFromCart(productId: string) {
    if (!this.guestCartId) return;

    this.http.post<any>(`${API_URL}/cart/remove.php`, {
      product_id: productId,
      guest_cart_id: this.guestCartId
    }).subscribe({
      next: (response) => {
        if (response.success) {
          this.loadCart();
          this.snackBar.open('Removed from cart', 'Close', { duration: 2000 });
        } else {
          console.error('Error removing from cart:', response.message);
          this.snackBar.open('Error removing from cart', 'Close', { duration: 3000 });
        }
      },
      error: (error) => {
        console.error('Error removing from cart:', error);
        this.snackBar.open('Error removing from cart', 'Close', { duration: 3000 });
      }
    });
  }

  clearCart() {
    if (!this.guestCartId) return;

    this.http.post<any>(`${API_URL}/cart/clear.php`, {
      guest_cart_id: this.guestCartId
    }).subscribe({
      next: (response) => {
        if (response.success) {
          this.loadCart();
          this.snackBar.open('Cart cleared', 'Close', { duration: 2000 });
        } else {
          console.error('Error clearing cart:', response.message);
          this.snackBar.open('Error clearing cart', 'Close', { duration: 3000 });
        }
      },
      error: (error) => {
        console.error('Error clearing cart:', error);
        this.snackBar.open('Error clearing cart', 'Close', { duration: 3000 });
      }
    });
  }
}