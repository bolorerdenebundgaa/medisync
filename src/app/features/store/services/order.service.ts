import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '../../../../environments/environment';

const API_URL = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {}

  getOrders(): Observable<any[]> {
    return this.http.get<any>(`${API_URL}/store/orders.php`).pipe(
      map(response => {
        if (!response.success) throw new Error(response.message);
        return response.data;
      }),
      catchError(error => {
        console.error('Error loading orders:', error);
        this.snackBar.open('Error loading orders', 'Close', { duration: 3000 });
        throw error;
      })
    );
  }

  getOrder(id: string): Observable<any> {
    return this.http.get<any>(`${API_URL}/store/orders.php?id=${id}`).pipe(
      map(response => {
        if (!response.success) throw new Error(response.message);
        return response.data;
      }),
      catchError(error => {
        console.error('Error loading order:', error);
        this.snackBar.open('Error loading order', 'Close', { duration: 3000 });
        throw error;
      })
    );
  }
}