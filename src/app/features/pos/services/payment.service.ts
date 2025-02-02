import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from '../../../core/auth/services/auth.service';

interface PaymentIntentResponse {
  clientSecret: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  constructor(private authService: AuthService) {}

  createPaymentIntent(amount: number): Observable<PaymentIntentResponse> {
    return from(
      this.authService.getSupabase().functions.invoke('create-payment-intent', {
        body: { amount: Math.round(amount * 100) }
      })
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        if (!data) throw new Error('Invalid response from payment service');
        return { clientSecret: data.clientSecret };
      })
    );
  }
}