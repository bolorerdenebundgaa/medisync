import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Product } from '../models/product.model';

export interface WishlistItem {
  id: string;
  product_id: string;
  product_name: string;
  price: number;
  image_url: string;
  added_at: string;
}

export interface WishlistResponse {
  success: boolean;
  message?: string;
  data: WishlistItem[];
}

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  private readonly API_URL = `${environment.apiUrl}/wishlist`;
  
  private wishlistItemsSubject = new BehaviorSubject<WishlistItem[]>([]);
  wishlistItems$ = this.wishlistItemsSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadWishlist();
  }

  private loadWishlist(): void {
    this.loadingSubject.next(true);
    this.getWishlist().subscribe({
      next: (items) => {
        this.wishlistItemsSubject.next(items);
        this.loadingSubject.next(false);
      },
      error: () => {
        this.wishlistItemsSubject.next([]);
        this.loadingSubject.next(false);
      }
    });
  }

  getWishlist(): Observable<WishlistItem[]> {
    return this.http.get<WishlistResponse>(`${this.API_URL}/get.php`)
      .pipe(
        map(response => {
          if (!response.success) {
            throw new Error(response.message || 'Failed to get wishlist');
          }
          return response.data;
        })
      );
  }

  addToWishlist(productId: string): Observable<WishlistItem> {
    return this.http.post<{success: boolean; data: WishlistItem}>(`${this.API_URL}/add.php`, {
      product_id: productId
    }).pipe(
      map(response => {
        if (!response.success) {
          throw new Error('Failed to add item to wishlist');
        }
        const currentItems = this.wishlistItemsSubject.value;
        this.wishlistItemsSubject.next([...currentItems, response.data]);
        return response.data;
      })
    );
  }

  removeFromWishlist(productId: string): Observable<void> {
    return this.http.post<{success: boolean}>(`${this.API_URL}/remove.php`, {
      product_id: productId
    }).pipe(
      map(response => {
        if (!response.success) {
          throw new Error('Failed to remove item from wishlist');
        }
        const currentItems = this.wishlistItemsSubject.value;
        this.wishlistItemsSubject.next(
          currentItems.filter(item => item.product_id !== productId)
        );
      })
    );
  }

  isInWishlist(productId: string): boolean {
    return this.wishlistItemsSubject.value.some(item => item.product_id === productId);
  }

  getWishlistCount(): number {
    return this.wishlistItemsSubject.value.length;
  }

  clearWishlist(): void {
    this.wishlistItemsSubject.next([]);
  }

  refreshWishlist(): void {
    this.loadWishlist();
  }

  getWishlistItemsByCategory(categoryId: string): WishlistItem[] {
    return this.wishlistItemsSubject.value.filter(item => {
      // Assuming each item has a category_id property
      // You might need to adjust this based on your actual data structure
      return (item as any).category_id === categoryId;
    });
  }

  moveToCart(productId: string): Observable<void> {
    return this.http.post<{success: boolean}>(`${this.API_URL}/move-to-cart.php`, {
      product_id: productId
    }).pipe(
      map(response => {
        if (!response.success) {
          throw new Error('Failed to move item to cart');
        }
        // Remove item from wishlist after successful move to cart
        const currentItems = this.wishlistItemsSubject.value;
        this.wishlistItemsSubject.next(
          currentItems.filter(item => item.product_id !== productId)
        );
      })
    );
  }
}
