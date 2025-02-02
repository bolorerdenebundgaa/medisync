import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AuthService } from '../../../core/auth/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

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
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  createBatchOperation(operation: Partial<BatchOperation>): Observable<BatchOperation> {
    return from(
      this.authService.supabase.rpc('create_batch_operation', {
        p_operation: operation,
        p_items: operation.items
      })
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data as BatchOperation;
      }),
      catchError(error => {
        console.error('Error creating batch operation:', error);
        this.snackBar.open('Error creating batch operation', 'Close', { duration: 3000 });
        throw error;
      })
    );
  }

  getBatchOperations(): Observable<BatchOperation[]> {
    return from(
      this.authService.supabase
        .from('batch_operations')
        .select('*')
        .order('created_at', { ascending: false })
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data as BatchOperation[];
      }),
      catchError(error => {
        console.error('Error loading batch operations:', error);
        this.snackBar.open('Error loading batch operations', 'Close', { duration: 3000 });
        throw error;
      })
    );
  }

  processBatchOperation(id: string): Observable<void> {
    return from(
      this.authService.supabase.rpc('process_batch_operation', {
        p_operation_id: id
      })
    ).pipe(
      map(({ error }) => {
        if (error) throw error;
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