import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { loadStripe } from '@stripe/stripe-js';
import { PaymentService } from '../services/payment.service';
import { environment } from '../../../../environments/environment';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-checkout-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <h2 mat-dialog-title>Complete Payment</h2>
    <mat-dialog-content>
      <div class="p-4">
        <div class="mb-4">
          <h3 class="text-lg font-bold">Order Summary</h3>
          <p class="text-xl">Total: {{formatPrice(data.total)}}</p>
        </div>

        <div class="grid grid-cols-1 gap-4">
          <button mat-raised-button color="primary" 
                  (click)="processCashPayment()"
                  [disabled]="processing">
            <mat-icon>payments</mat-icon>
            Pay with Cash
          </button>

          <button mat-raised-button color="accent" 
                  (click)="processCardPayment()"
                  [disabled]="processing">
            <mat-icon>credit_card</mat-icon>
            Pay with Card
          </button>

          <div *ngIf="processing" class="flex justify-center">
            <mat-spinner diameter="24"></mat-spinner>
          </div>
        </div>

        <div id="payment-element" class="mt-4" *ngIf="showStripeElement"></div>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button 
              (click)="dialogRef.close()"
              [disabled]="processing">
        Cancel
      </button>
    </mat-dialog-actions>
  `
})
export class CheckoutDialogComponent {
  processing = false;
  showStripeElement = false;

  constructor(
    public dialogRef: MatDialogRef<CheckoutDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { total: number },
    private paymentService: PaymentService
  ) {}

  formatPrice(price: number): string {
    return `$${price.toFixed(2)}`;
  }

  processCashPayment() {
    this.processing = true;
    setTimeout(() => {
      this.processing = false;
      this.dialogRef.close({ type: 'cash', status: 'completed' });
    }, 1000);
  }

  async processCardPayment() {
    this.processing = true;
    this.showStripeElement = true;

    try {
      const stripe = await loadStripe(environment.stripe.publishableKey);
      if (!stripe) throw new Error('Stripe failed to load');

      const response = await firstValueFrom(
        this.paymentService.createPaymentIntent(this.data.total)
      );

      if (!response?.clientSecret) {
        throw new Error('Failed to create payment intent');
      }

      const { error: paymentError } = await stripe.confirmPayment({
        elements: await stripe.elements({
          clientSecret: response.clientSecret,
          appearance: {
            theme: 'stripe'
          }
        }),
        confirmParams: {
          return_url: window.location.href
        }
      });

      if (paymentError) {
        throw paymentError;
      }

      this.dialogRef.close({ type: 'card', status: 'completed' });
    } catch (error) {
      console.error('Payment failed:', error);
      this.dialogRef.close({ type: 'card', status: 'failed', error });
    } finally {
      this.processing = false;
      this.showStripeElement = false;
    }
  }
}