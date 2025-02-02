import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Product } from '../models/product.model';
import { environment } from '../../environments/environment';

const API_URL = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {}

  getProducts(): Observable<Product[]> {
    return this.http.get<any>(`${API_URL}/products/read.php`).pipe(
      map(response => {
        console.log('Raw API Response:', response); // Debug log
        if (!response.records) {
          console.warn('No records found in response');
          return [];
        }
        return response.records.map((item: any) => ({
          id: item.id,
          name: item.name,
          sku: item.sku,
          description: item.description || '',
          price: parseFloat(item.price) || 0,
          quantity: parseInt(item.quantity) || 0,
          category_id: item.category_id || null,
          photo_url: item.photo_url || '',
          properties: {
            ingredients: item.ingredients ? JSON.parse(item.ingredients) : [],
            dosage: item.dosage || '',
            storage_instructions: item.storage_instructions || '',
            usage_instructions: item.usage_instructions || '',
            warnings: item.warnings ? JSON.parse(item.warnings) : []
          }
        }));
      }),
      catchError(error => {
        console.error('Error loading products:', error);
        console.error('Error details:', {
          status: error.status,
          message: error.message,
          error: error.error
        });
        this.snackBar.open('Error loading products', 'Close', { duration: 3000 });
        return of([]); // Return empty array instead of throwing
      })
    );
  }

  getProduct(id: string): Observable<Product> {
    return this.http.get<any>(`${API_URL}/products/read.php?id=${id}`).pipe(
      map(response => {
        if (!response.records || !response.records.length) {
          throw new Error('Product not found');
        }
        const item = response.records[0];
        return {
          id: item.id,
          name: item.name,
          sku: item.sku,
          description: item.description || '',
          price: parseFloat(item.price) || 0,
          quantity: parseInt(item.quantity) || 0,
          photo_url: item.photo_url || '',
          properties: {
            ingredients: item.ingredients ? JSON.parse(item.ingredients) : [],
            dosage: item.dosage || '',
            storage_instructions: item.storage_instructions || '',
            usage_instructions: item.usage_instructions || '',
            warnings: item.warnings ? JSON.parse(item.warnings) : []
          }
        };
      }),
      catchError(error => {
        console.error('Error loading product:', error);
        this.snackBar.open('Error loading product', 'Close', { duration: 3000 });
        throw error;
      })
    );
  }

  createProduct(product: Partial<Product>): Observable<Product> {
    return this.http.post<any>(`${API_URL}/products/create.php`, product).pipe(
      map(response => {
        if (!response.success) throw new Error(response.message);
        this.snackBar.open('Product created successfully', 'Close', { duration: 3000 });
        return response.data;
      }),
      catchError(error => {
        console.error('Error creating product:', error);
        this.snackBar.open('Error creating product', 'Close', { duration: 3000 });
        throw error;
      })
    );
  }

  updateProduct(product: Partial<Product>): Observable<Product> {
    return this.http.put<any>(`${API_URL}/products/update.php`, product).pipe(
      map(response => {
        if (!response.success) throw new Error(response.message);
        this.snackBar.open('Product updated successfully', 'Close', { duration: 3000 });
        return response.data;
      }),
      catchError(error => {
        console.error('Error updating product:', error);
        this.snackBar.open('Error updating product', 'Close', { duration: 3000 });
        throw error;
      })
    );
  }

  deleteProduct(id: string): Observable<void> {
    return this.http.delete<any>(`${API_URL}/products/delete.php`, { body: { id } }).pipe(
      map(response => {
        if (!response.success) throw new Error(response.message);
        this.snackBar.open('Product deleted successfully', 'Close', { duration: 3000 });
      }),
      catchError(error => {
        console.error('Error deleting product:', error);
        this.snackBar.open('Error deleting product', 'Close', { duration: 3000 });
        throw error;
      })
    );
  }
}