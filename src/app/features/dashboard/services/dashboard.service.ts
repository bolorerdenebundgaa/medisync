import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
const API_URL = 'https://medisync.solutions/api';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {}

  // Admin Dashboard Methods
  getLowStockAlerts(): Observable<any[]> {
    return this.http.get<any>(`${API_URL}/admin/dashboard/low-stock-alerts.php`).pipe(
      map(response => {
        if (!response.success) throw new Error(response.message);
        return response.data;
      }),
      catchError(error => {
        console.error('Error loading low stock alerts:', error);
        this.snackBar.open('Error loading alerts', 'Close', { duration: 3000 });
        throw error;
      })
    );
  }

  getMonthlySales(): Observable<any[]> {
    return this.http.get<any>(`${API_URL}/admin/dashboard/monthly-sales.php`).pipe(
      map(response => {
        if (!response.success) throw new Error(response.message);
        return response.data;
      })
    );
  }

  getBranchSales(): Observable<any[]> {
    return this.http.get<any>(`${API_URL}/admin/dashboard/branch-sales.php`).pipe(
      map(response => {
        if (!response.success) throw new Error(response.message);
        return response.data;
      })
    );
  }

  getMaintenanceStats(): Observable<any> {
    return this.http.get<any>(`${API_URL}/admin/dashboard/maintenance-stats.php`).pipe(
      map(response => {
        if (!response.success) throw new Error(response.message);
        return response.data;
      })
    );
  }

  getReferralStats(): Observable<any> {
    return this.http.get<any>(`${API_URL}/admin/dashboard/referral-stats.php`).pipe(
      map(response => {
        if (!response.success) throw new Error(response.message);
        return response.data;
      })
    );
  }

  // Referee Dashboard Methods
  getRefereeStats(): Observable<any> {
    return this.http.get<any>(`${API_URL}/admin/dashboard/referee-stats.php`).pipe(
      map(response => {
        if (!response.success) throw new Error(response.message);
        return response.data;
      })
    );
  }

  getRefereeMonthlyPerformance(): Observable<any[]> {
    return this.http.get<any>(`${API_URL}/admin/dashboard/referee-monthly-performance.php`).pipe(
      map(response => {
        if (!response.success) throw new Error(response.message);
        return response.data;
      })
    );
  }

  getRecentReferrals(): Observable<any[]> {
    return this.http.get<any>(`${API_URL}/admin/dashboard/recent-referrals.php`).pipe(
      map(response => {
        if (!response.success) throw new Error(response.message);
        return response.data;
      })
    );
  }

  // POS Dashboard Methods
  getSalesStats(): Observable<any> {
    return this.http.get<any>(`${API_URL}/admin/dashboard/sales-stats.php`).pipe(
      map(response => {
        if (!response.success) throw new Error(response.message);
        return response.data;
      })
    );
  }

  getSalesTrend(): Observable<any[]> {
    return this.http.get<any>(`${API_URL}/admin/dashboard/sales-trend.php`).pipe(
      map(response => {
        if (!response.success) throw new Error(response.message);
        return response.data;
      })
    );
  }

  getRecentTransactions(): Observable<any[]> {
    return this.http.get<any>(`${API_URL}/admin/dashboard/recent-transactions.php`).pipe(
      map(response => {
        if (!response.success) throw new Error(response.message);
        return response.data;
      })
    );
  }
}