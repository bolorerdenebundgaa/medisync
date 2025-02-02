import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '../../environments/environment';
import { WebUser, Cart, CartItem, Review, Wishlist } from '../models/ecommerce.model';

const API_URL = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class EcommerceService {
  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {}

  getCurrentUser(): Observable<WebUser | null> {
    return this.http.get<any>(`${API_URL}/auth/user.php`).pipe(
      map(response => response.success ? response.data : null)
    );
  }

  getCart(): Observable<Cart | null> {
    return this.http.get<any>(`${API_URL}/cart/get.php`).pipe(
      map(response => response.success ? response.data : null),
      catchError(error => {
        console.error('Error loading cart:', error);
        this.snackBar.open('Error loading cart', 'Close', { duration: 3000 });
        throw error;
      })
    );
  }

  getProductReviews(productId: string): Observable<Review[]> {
    return this.http.get<any>(`${API_URL}/store/reviews.php?product_id=${productId}`).pipe(
      map(response => {
        if (!response.success) throw new Error(response.message);
        return response.data;
      }),
      catchError(error => {
        console.error('Error loading reviews:', error);
        this.snackBar.open('Error loading reviews', 'Close', { duration: 3000 });
        throw error;
      })
    );
  }

  addReview(productId: string, rating: number, comment?: string): Observable<void> {
    return this.http.post<any>(`${API_URL}/store/reviews/add.php`, {
      product_id: productId,
      rating,
      comment
    }).pipe(
      map(response => {
        if (!response.success) throw new Error(response.message);
        this.snackBar.open('Review added successfully', 'Close', { duration: 3000 });
      }),
      catchError(error => {
        console.error('Error adding review:', error);
        this.snackBar.open('Error adding review', 'Close', { duration: 3000 });
        throw error;
      })
    );
  }

  getWishlist(): Observable<Wishlist | null> {
    return this.http.get<any>(`${API_URL}/wishlist/get.php`).pipe(
      map(response => response.success ? response.data : null),
      catchError(error => {
        console.error('Error loading wishlist:', error);
        this.snackBar.open('Error loading wishlist', 'Close', { duration: 3000 });
        throw error;
      })
    );
  }
}