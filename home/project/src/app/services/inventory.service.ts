import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Observable, from, throwError, forkJoin } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { Product } from '../models/product.model';
import { environment } from '../../environments/environment';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private supabase: SupabaseClient;

  constructor(private snackBar: MatSnackBar) {
    this.supabase = createClient(
      environment.supabase.url,
      environment.supabase.key
    );
  }

  getProducts(): Observable<Product[]> {
    return from(
      this.supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
    ).pipe(
      switchMap(({ data: products, error }) => {
        if (error) throw error;
        if (!products?.length) return from([[]]);

        return forkJoin(
          products.map(product =>
            from(
              this.supabase
                .from('product_properties')
                .select('*')
                .eq('product_id', product.id)
                .single()
            ).pipe(
              map(({ data: properties }) => ({
                ...product,
                properties: properties || null
              }))
            )
          )
        );
      }),
      catchError(error => {
        console.error('Error loading products:', error);
        this.snackBar.open('Error loading products', 'Close', { duration: 3000 });
        return throwError(() => error);
      })
    );
  }

  createProduct(product: Partial<Product>): Observable<Product> {
    const { properties, ...productData } = product;
    
    return from(
      this.supabase
        .from('products')
        .insert(productData)
        .select()
        .single()
    ).pipe(
      switchMap(({ data: newProduct, error }) => {
        if (error) throw error;
        
        if (properties) {
          return from(
            this.supabase
              .from('product_properties')
              .insert({ ...properties, product_id: newProduct.id })
              .select()
              .single()
          ).pipe(
            map(({ data: props }) => ({
              ...newProduct,
              properties: props
            }))
          );
        }
        
        return from([newProduct]);
      }),
      catchError(error => {
        console.error('Error creating product:', error);
        this.snackBar.open('Error creating product', 'Close', { duration: 3000 });
        return throwError(() => error);
      })
    );
  }

  updateProduct(product: Partial<Product>): Observable<Product> {
    if (!product.id) {
      return throwError(() => new Error('Product ID is required for update'));
    }

    const { properties, ...productData } = product;
    
    return from(
      this.supabase
        .from('products')
        .update(productData)
        .eq('id', product.id)
        .select()
        .single()
    ).pipe(
      switchMap(({ data: updatedProduct, error }) => {
        if (error) throw error;
        
        if (properties) {
          return from(
            this.supabase
              .from('product_properties')
              .upsert({ ...properties, product_id: product.id })
              .select()
              .single()
          ).pipe(
            map(({ data: props }) => ({
              ...updatedProduct,
              properties: props
            }))
          );
        }
        
        return from([updatedProduct]);
      }),
      catchError(error => {
        console.error('Error updating product:', error);
        this.snackBar.open('Error updating product', 'Close', { duration: 3000 });
        return throwError(() => error);
      })
    );
  }

  deleteProduct(id: string): Observable<void> {
    return from(
      this.supabase
        .from('products')
        .delete()
        .eq('id', id)
    ).pipe(
      map(({ error }) => {
        if (error) throw error;
      }),
      catchError(error => {
        console.error('Error deleting product:', error);
        this.snackBar.open('Error deleting product', 'Close', { duration: 3000 });
        return throwError(() => error);
      })
    );
  }
}