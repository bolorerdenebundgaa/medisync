import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { MatSnackBar } from '@angular/material/snack-bar';

const API_URL = environment.apiUrl;

export interface BatchOperation {
  id: string;
  type: 'adjustment' | 'stocktake' | 'expiry_check';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  branchId: string;
  notes?: string;
  items: BatchOperationItem[];
}

export interface BatchOperationItem {
  productId: string;
  currentQuantity: number;
  newQuantity: number;
  reason?: string;
}

@Injectable({
  providedIn: 'root'
})
export class InventoryBatchService {
  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {}

  createBatchOperation(operation: Partial<BatchOperation>): Observable<BatchOperation> {
    return this.http.post<any>(`${API_URL}/admin/inventory/batch-operations/create.php`, operation).pipe(
      map(response => {
        if (!response.success) throw new Error(response.message);
        return response.data;
      }),
      catchError(error => {
        console.error('Error creating batch operation:', error);
        this.snackBar.open('Error creating batch operation', 'Close', { duration: 3000 });
        throw error;
      })
    );
  }

  getBatchOperations(): Observable<BatchOperation[]> {
    return this.http.get<any>(`${API_URL}/admin/inventory/batch-operations/list.php`).pipe(
      map(response => {
        if (!response.success) throw new Error(response.message);
        return response.data;
      }),
      catchError(error => {
        console.error('Error loading batch operations:', error);
        this.snackBar.open('Error loading batch operations', 'Close', { duration: 3000 });
        throw error;
      })
    );
  }

  processBatchOperation(id: string): Observable<void> {
    return this.http.post<any>(`${API_URL}/admin/inventory/batch-operations/process.php`, { id }).pipe(
      map(response => {
        if (!response.success) throw new Error(response.message);
        this.snackBar.open('Batch operation processed successfully', 'Close', { duration: 3000 });
      }),
      catchError(error => {
        console.error('Error processing batch operation:', error);
        this.snackBar.open('Error processing batch operation', 'Close', { duration: 3000 });
        throw error;
      })
    );
  }
}