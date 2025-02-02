import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Branch } from '../models/branch.model';

const API_URL = 'https://medisync.solutions/api';

@Injectable({
  providedIn: 'root'
})
export class BranchService {
  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {}

  getBranches(): Observable<Branch[]> {
    return this.http.get<any>(`${API_URL}/admin/branches/list.php`).pipe(
      map(response => {
        if (!response.success) throw new Error(response.message);
        return response.data || [];
      }),
      catchError(error => {
        console.error('Error loading branches:', error);
        this.snackBar.open('Error loading branches', 'Close', { duration: 3000 });
        throw error;
      })
    );
  }

  createBranch(branch: Partial<Branch>): Observable<Branch> {
    return this.http.post<any>(`${API_URL}/admin/branches/create.php`, branch).pipe(
      map(response => {
        if (!response.success) throw new Error(response.message);
        this.snackBar.open('Branch created successfully', 'Close', { duration: 3000 });
        return response.data;
      }),
      catchError(error => {
        console.error('Error creating branch:', error);
        this.snackBar.open(error.message || 'Error creating branch', 'Close', { duration: 3000 });
        throw error;
      })
    );
  }

  updateBranch(branch: Partial<Branch>): Observable<Branch> {
    return this.http.put<any>(`${API_URL}/admin/branches/update.php`, branch).pipe(
      map(response => {
        if (!response.success) throw new Error(response.message);
        this.snackBar.open('Branch updated successfully', 'Close', { duration: 3000 });
        return response.data;
      }),
      catchError(error => {
        console.error('Error updating branch:', error);
        this.snackBar.open(error.message || 'Error updating branch', 'Close', { duration: 3000 });
        throw error;
      })
    );
  }

  deleteBranch(id: string): Observable<void> {
    return this.http.delete<any>(`${API_URL}/admin/branches/delete.php`, { body: { id } }).pipe(
      map(response => {
        if (!response.success) throw new Error(response.message);
        this.snackBar.open('Branch deleted successfully', 'Close', { duration: 3000 });
      }),
      catchError(error => {
        console.error('Error deleting branch:', error);
        this.snackBar.open(error.message || 'Error deleting branch', 'Close', { duration: 3000 });
        throw error;
      })
    );
  }

  setEcommerceBase(id: string): Observable<void> {
    return this.http.put<any>(`${API_URL}/admin/branches/set-ecommerce-base.php`, { id }).pipe(
      map(response => {
        if (!response.success) throw new Error(response.message);
        this.snackBar.open('Branch set as ecommerce base successfully', 'Close', { duration: 3000 });
      }),
      catchError(error => {
        console.error('Error setting ecommerce base:', error);
        this.snackBar.open(error.message || 'Error setting ecommerce base', 'Close', { duration: 3000 });
        throw error;
      })
    );
  }
}