import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Product } from '../models/product.model';
import { environment } from '../../environments/environment';

const API_URL = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {}

  getWishlist(userId: string): Observable<Product[]> {
    return this.http.get<any>(`${API_URL}/wishlist/get.php?user_id=${userId}`).pipe(
      map(response => {
        if (!response.success) throw new Error(response.message);
        return response.data.items.map((item: any) => item.product);
      }),
      catchError(error => {
        console.error('Error loading wishlist:', error);
        this.snackBar.open('Error loading wishlist', 'Close', { duration: 3000 });
        throw error;
      })
    );
  }

  addToWishlist(userId: string, productId: string): Observable<void> {
    return this.http.post<any>(`${API_URL}/wishlist/add.php`, {
      user_id: userId,
      product_id: productId
    }).pipe(
      map(response => {
        if (!response.success) throw new Error(response.message);
        this.snackBar.open('Added to wishlist', 'Close', { duration: 3000 });
      }),
      catchError(error => {
        console.error('Error adding to wishlist:', error);
        this.snackBar.open('Error adding to wishlist', 'Close', { duration: 3000 });
        throw error;
      })
    );
  }

  removeFromWishlist(userId: string, itemId: string): Observable<void> {
    return this.http.post<any>(`${API_URL}/wishlist/remove.php`, {
      user_id: userId,
      item_id: itemId
    }).pipe(
      map(response => {
        if (!response.success) throw new Error(response.message);
        this.snackBar.open('Removed from wishlist', 'Close', { duration: 3000 });
      }),
      catchError(error => {
        console.error('Error removing from wishlist:', error);
        this.snackBar.open('Error removing from wishlist', 'Close', { duration: 3000 });
        throw error;
      })
    );
  }
}