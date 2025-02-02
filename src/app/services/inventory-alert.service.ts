import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
const API_URL = 'https://medisync.solutions/api';

export interface StockAlert {
  id: string;
  branchId: string;
  productId: string;
  type: 'low_stock' | 'out_of_stock' | 'expiring_soon' | 'expired';
  threshold?: number;
  status: 'active' | 'acknowledged' | 'resolved';
  createdAt: Date;
  updatedAt: Date;
}
@Injectable({
  providedIn: 'root'
})
export class InventoryAlertService {
  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {}

  getActiveAlerts(): Observable<StockAlert[]> {
    return this.http.get<any>(`${API_URL}/admin/inventory/alerts.php`).pipe(
      map(response => {
        if (!response.success) throw new Error(response.message);
        return response.data;
      }),
      catchError(error => {
        console.error('Error loading alerts:', error);
        this.snackBar.open('Error loading alerts', 'Close', { duration: 3000 });
        throw error;
      })
    );
  }

  acknowledgeAlert(id: string): Observable<void> {
    return this.http.post<any>(`${API_URL}/admin/inventory/acknowledge-alert.php`, { id }).pipe(
      map(response => {
        if (!response.success) throw new Error(response.message);
        this.snackBar.open('Alert acknowledged', 'Close', { duration: 3000 });
      }),
      catchError(error => {
        console.error('Error acknowledging alert:', error);
        this.snackBar.open('Error acknowledging alert', 'Close', { duration: 3000 });
        throw error;
      })
    );
  }

  resolveAlert(id: string): Observable<void> {
    return this.http.post<any>(`${API_URL}/admin/inventory/resolve-alert.php`, { id }).pipe(
      map(response => {
        if (!response.success) throw new Error(response.message);
        this.snackBar.open('Alert resolved', 'Close', { duration: 3000 });
      }),
      catchError(error => {
        console.error('Error resolving alert:', error);
        this.snackBar.open('Error resolving alert', 'Close', { duration: 3000 });
        throw error;
      })
    );
  }
}