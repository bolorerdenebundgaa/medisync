import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '../../environments/environment';

const API_URL = environment.apiUrl;

export interface InventoryAnalytics {
  totalProducts: number;
  totalValue: number;
  lowStockItems: number;
  outOfStockItems: number;
  turnoverRate: number;
  topProducts: {
    id: string;
    name: string;
    quantity: number;
    value: number;
  }[];
  stockLevels: {
    date: string;
    quantity: number;
    value: number;
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class InventoryAnalyticsService {
  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {}

  getInventoryAnalytics(branchId?: string): Observable<InventoryAnalytics> {
    const url = `${API_URL}/admin/inventory/analytics.php${branchId ? `?branch_id=${branchId}` : ''}`;
    return this.http.get<any>(url).pipe(
      map(response => {
        if (!response.success) throw new Error(response.message);
        return response.data;
      }),
      catchError(error => {
        console.error('Error loading analytics:', error);
        this.snackBar.open('Error loading analytics', 'Close', { duration: 3000 });
        throw error;
      })
    );
  }

  getProductPerformance(productId: string): Observable<any> {
    return this.http.get<any>(`${API_URL}/admin/inventory/product-performance.php?id=${productId}`).pipe(
      map(response => {
        if (!response.success) throw new Error(response.message);
        return response.data;
      }),
      catchError(error => {
        console.error('Error loading product performance:', error);
        this.snackBar.open('Error loading product performance', 'Close', { duration: 3000 });
        throw error;
      })
    );
  }

  getStockMovementHistory(productId: string, startDate: Date, endDate: Date): Observable<any[]> {
    return this.http.get<any>(`${API_URL}/admin/inventory/stock-movement.php`, {
      params: {
        product_id: productId,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString()
      }
    }).pipe(
      map(response => {
        if (!response.success) throw new Error(response.message);
        return response.data;
      }),
      catchError(error => {
        console.error('Error loading stock movement:', error);
        this.snackBar.open('Error loading stock movement', 'Close', { duration: 3000 });
        throw error;
      })
    );
  }

  getForecastedDemand(productId: string): Observable<any> {
    return this.http.get<any>(`${API_URL}/admin/inventory/forecast.php?id=${productId}`).pipe(
      map(response => {
        if (!response.success) throw new Error(response.message);
        return response.data;
      }),
      catchError(error => {
        console.error('Error loading forecast:', error);
        this.snackBar.open('Error loading forecast', 'Close', { duration: 3000 });
        throw error;
      })
    );
  }
}