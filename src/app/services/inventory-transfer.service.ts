import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { MatSnackBar } from '@angular/material/snack-bar';

const API_URL = environment.apiUrl;

export interface InventoryTransfer {
  id: string;
  fromBranchId: string;
  toBranchId: string;
  productId: string;
  quantity: number;
  status: 'pending' | 'in_transit' | 'completed' | 'cancelled';
  notes?: string;
}

@Injectable({
  providedIn: 'root'
})
export class InventoryTransferService {
  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {}

  createTransfer(transfer: Partial<InventoryTransfer>): Observable<InventoryTransfer> {
    return this.http.post<any>(`${API_URL}/admin/inventory/transfers/create.php`, transfer).pipe(
      map(response => {
        if (!response.success) throw new Error(response.message);
        return response.data;
      }),
      catchError(error => {
        console.error('Error creating transfer:', error);
        this.snackBar.open('Error creating transfer', 'Close', { duration: 3000 });
        throw error;
      })
    );
  }

  getTransfers(): Observable<InventoryTransfer[]> {
    return this.http.get<any>(`${API_URL}/admin/inventory/transfers/list.php`).pipe(
      map(response => {
        if (!response.success) throw new Error(response.message);
        return response.data;
      }),
      catchError(error => {
        console.error('Error loading transfers:', error);
        this.snackBar.open('Error loading transfers', 'Close', { duration: 3000 });
        throw error;
      })
    );
  }

  updateTransferStatus(id: string, status: InventoryTransfer['status']): Observable<void> {
    return this.http.post<any>(`${API_URL}/admin/inventory/transfers/update-status.php`, { id, status }).pipe(
      map(response => {
        if (!response.success) throw new Error(response.message);
        this.snackBar.open('Transfer status updated', 'Close', { duration: 3000 });
      }),
      catchError(error => {
        console.error('Error updating transfer status:', error);
        this.snackBar.open('Error updating transfer status', 'Close', { duration: 3000 });
        throw error;
      })
    );
  }

  processTransfer(id: string): Observable<void> {
    return this.http.post<any>(`${API_URL}/admin/inventory/transfers/process.php`, { id }).pipe(
      map(response => {
        if (!response.success) throw new Error(response.message);
        this.snackBar.open('Transfer processed successfully', 'Close', { duration: 3000 });
      }),
      catchError(error => {
        console.error('Error processing transfer:', error);
        this.snackBar.open('Error processing transfer', 'Close', { duration: 3000 });
        throw error;
      })
    );
  }
}