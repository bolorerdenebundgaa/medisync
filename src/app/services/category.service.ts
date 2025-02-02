import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '../../environments/environment';

const API_URL = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {}

  getCategories(): Observable<any[]> {
    return this.http.get<any>(`${API_URL}/admin/categories/list.php`).pipe(
      map(response => {
        if (!response.records) return [];
        return response.records;
      }),
      catchError(error => {
        console.error('Error loading categories:', error);
        this.snackBar.open('Error loading categories', 'Close', { duration: 3000 });
        throw error;
      })
    );
  }

  createCategory(category: any): Observable<any> {
    return this.http.post<any>(`${API_URL}/admin/categories/create.php`, category).pipe(
      map(response => {
        if (!response.success) throw new Error(response.message);
        this.snackBar.open('Category created successfully', 'Close', { duration: 3000 });
        return response.data;
      }),
      catchError(error => {
        console.error('Error creating category:', error);
        this.snackBar.open('Error creating category', 'Close', { duration: 3000 });
        throw error;
      })
    );
  }

  updateCategory(category: any): Observable<any> {
    return this.http.put<any>(`${API_URL}/admin/categories/update.php`, category).pipe(
      map(response => {
        if (!response.success) throw new Error(response.message);
        this.snackBar.open('Category updated successfully', 'Close', { duration: 3000 });
        return response.data;
      }),
      catchError(error => {
        console.error('Error updating category:', error);
        this.snackBar.open('Error updating category', 'Close', { duration: 3000 });
        throw error;
      })
    );
  }

  deleteCategory(id: string): Observable<void> {
    return this.http.delete<any>(`${API_URL}/admin/categories/delete.php`, { body: { id } }).pipe(
      map(response => {
        if (!response.success) throw new Error(response.message);
        this.snackBar.open('Category deleted successfully', 'Close', { duration: 3000 });
      }),
      catchError(error => {
        console.error('Error deleting category:', error);
        this.snackBar.open('Error deleting category', 'Close', { duration: 3000 });
        throw error;
      })
    );
  }
}