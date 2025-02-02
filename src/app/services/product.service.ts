import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  category_id: string;
  category_name?: string;
  price: number;
  image_url: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductSearchParams {
  category_id?: string;
  search?: string;
  page?: number;
  limit?: number;
  sort?: 'name' | 'price' | 'created_at';
  order?: 'asc' | 'desc';
  branch_id?: string;
}

export interface ProductResponse {
  success: boolean;
  message?: string;
  data: Product;
}

export interface ProductListResponse {
  success: boolean;
  data: {
    items: Product[];
    total: number;
    page: number;
    limit: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly API_URL = `${environment.apiUrl}/products`;
  
  private productsSubject = new BehaviorSubject<Product[]>([]);
  products$ = this.productsSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();

  constructor(private http: HttpClient) {}

  searchProducts(term: string, branchId?: string): Observable<Product[]> {
    const params = new HttpParams()
      .set('search', term)
      .set('branch_id', branchId || '');

    return this.http.get<ProductListResponse>(`${this.API_URL}/read.php`, { params })
      .pipe(
        map(response => {
          if (!response.success) {
            throw new Error('Failed to search products');
          }
          return response.data.items;
        })
      );
  }

  getProducts(params: ProductSearchParams = {}): Observable<{
    items: Product[];
    total: number;
    page: number;
    limit: number;
  }> {
    this.loadingSubject.next(true);

    return this.http.get<ProductListResponse>(`${this.API_URL}/read.php`, { params })
      .pipe(
        map(response => {
          if (!response.success) {
            throw new Error('Failed to get products');
          }
          this.productsSubject.next(response.data.items);
          this.loadingSubject.next(false);
          return response.data;
        })
      );
  }

  getProduct(id: string): Observable<Product> {
    return this.http.get<ProductResponse>(`${this.API_URL}/read_one.php?id=${id}`)
      .pipe(
        map(response => {
          if (!response.success) {
            throw new Error(response.message || 'Failed to get product');
          }
          return response.data;
        })
      );
  }

  createProduct(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Observable<Product> {
    return this.http.post<ProductResponse>(`${this.API_URL}/create.php`, product)
      .pipe(
        map(response => {
          if (!response.success) {
            throw new Error(response.message || 'Failed to create product');
          }
          const products = this.productsSubject.value;
          this.productsSubject.next([...products, response.data]);
          return response.data;
        })
      );
  }

  updateProduct(id: string, updates: Partial<Product>): Observable<Product> {
    return this.http.post<ProductResponse>(`${this.API_URL}/update.php`, { id, ...updates })
      .pipe(
        map(response => {
          if (!response.success) {
            throw new Error(response.message || 'Failed to update product');
          }
          const products = this.productsSubject.value;
          const index = products.findIndex(p => p.id === id);
          if (index !== -1) {
            products[index] = response.data;
            this.productsSubject.next([...products]);
          }
          return response.data;
        })
      );
  }

  deleteProduct(id: string): Observable<void> {
    return this.http.post<{success: boolean; message?: string}>(`${this.API_URL}/delete.php`, { id })
      .pipe(
        map(response => {
          if (!response.success) {
            throw new Error(response.message || 'Failed to delete product');
          }
          const products = this.productsSubject.value;
          this.productsSubject.next(products.filter(p => p.id !== id));
        })
      );
  }

  uploadImage(id: string, file: File): Observable<string> {
    const formData = new FormData();
    formData.append('id', id);
    formData.append('image', file);

    return this.http.post<{success: boolean; data: string}>(`${this.API_URL}/upload-image.php`, formData)
      .pipe(
        map(response => {
          if (!response.success) {
            throw new Error('Failed to upload image');
          }
          return response.data;
        })
      );
  }

  getBranchProducts(branchId: string): Observable<Product[]> {
    return this.http.get<ProductListResponse>(`${this.API_URL}/branch-products.php?branch_id=${branchId}`)
      .pipe(
        map(response => {
          if (!response.success) {
            throw new Error('Failed to get branch products');
          }
          return response.data.items;
        })
      );
  }
}
