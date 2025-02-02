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
export class PaymentService {
  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {}

  createPaymentIntent(amount: number): Observable<{ clientSecret: string }> {
    return this.http.post<any>(`${API_URL}/payments/create-intent.php`, { amount }).pipe(
      map(response => {
        if (!response.success) throw new Error(response.message);
        return { clientSecret: response.data.client_secret };
      }),
      catchError(error => {
        console.error('Error creating payment intent:', error);
        this.snackBar.open('Error processing payment', 'Close', { duration: 3000 });
        throw error;
      })
    );
  }
}