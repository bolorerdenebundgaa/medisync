import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Product } from '../models/product.model';

export interface CartItem {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  image_url?: string;
}

export interface Cart {
  id: string;
  items: CartItem[];
  subtotal: number;
  vat_amount: number;
  total: number;
}

export interface CartResponse {
  success: boolean;
  message?: string;
  data: Cart;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly API_URL = `${environment.apiUrl}/cart`;
  
  private cartSubject = new BehaviorSubject<Cart | null>(null);
  cart$ = this.cartSubject.asObservable();

  private itemCountSubject = new BehaviorSubject<number>(0);
  itemCount$ = this.itemCountSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadCart();
  }

  private loadCart(): void {
    this.getCart().subscribe({
      next: (cart) => {
        this.cartSubject.next(cart);
        this.updateItemCount(cart);
      },
      error: () => {
        this.cartSubject.next(null);
        this.itemCountSubject.next(0);
      }
    });
  }

  private updateItemCount(cart: Cart | null): void {
    const count = cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;
    this.itemCountSubject.next(count);
  }

  getCart(): Observable<Cart> {
    return this.http.get<CartResponse>(`${this.API_URL}/get.php`)
      .pipe(
        map(response => {
          if (!response.success) {
            throw new Error(response.message || 'Failed to get cart');
          }
          return response.data;
        })
      );
  }

  addToCart(productId: string, quantity: number): Observable<CartItem> {
    return this.http.post<{success: boolean; data: CartItem}>(`${this.API_URL}/add.php`, {
      product_id: productId,
      quantity
    }).pipe(
      map(response => {
        if (!response.success) {
          throw new Error('Failed to add item to cart');
        }
        this.loadCart(); // Refresh cart data
        return response.data;
      })
    );
  }

  updateQuantity(itemId: string, quantity: number): Observable<CartItem> {
    return this.http.post<{success: boolean; data: CartItem}>(`${this.API_URL}/update.php`, {
      item_id: itemId,
      quantity
    }).pipe(
      map(response => {
        if (!response.success) {
          throw new Error('Failed to update quantity');
        }
        this.loadCart(); // Refresh cart data
        return response.data;
      })
    );
  }

  removeFromCart(itemId: string): Observable<void> {
    return this.http.post<{success: boolean}>(`${this.API_URL}/remove.php`, {
      item_id: itemId
    }).pipe(
      map(response => {
        if (!response.success) {
          throw new Error('Failed to remove item from cart');
        }
        this.loadCart(); // Refresh cart data
      })
    );
  }

  clearCart(): Observable<void> {
    return this.http.post<{success: boolean}>(`${this.API_URL}/clear.php`, {})
      .pipe(
        map(response => {
          if (!response.success) {
            throw new Error('Failed to clear cart');
          }
          this.cartSubject.next(null);
          this.itemCountSubject.next(0);
        })
      );
  }

  getItemCount(): number {
    return this.itemCountSubject.value;
  }

  getSubtotal(): number {
    return this.cartSubject.value?.subtotal || 0;
  }

  getVatAmount(): number {
    return this.cartSubject.value?.vat_amount || 0;
  }

  getTotal(): number {
    return this.cartSubject.value?.total || 0;
  }

  hasItems(): boolean {
    return (this.cartSubject.value?.items.length || 0) > 0;
  }

  getItemQuantity(productId: string): number {
    const item = this.cartSubject.value?.items.find(i => i.product_id === productId);
    return item?.quantity || 0;
  }

  isProductInCart(productId: string): boolean {
    return this.cartSubject.value?.items.some(item => item.product_id === productId) || false;
  }
}
