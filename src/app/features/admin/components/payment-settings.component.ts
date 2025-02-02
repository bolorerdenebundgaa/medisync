import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PaymentSettingsService } from '../services/payment-settings.service';

@Component({
  selector: 'app-payment-settings',
  template: `
    <div class="container mx-auto p-4">
      <h2 class="text-2xl font-bold mb-4">Payment Settings</h2>
      
      <form [formGroup]="paymentForm" (ngSubmit)="saveSettings()" class="space-y-4">
        <div class="bg-white p-4 rounded-lg shadow mb-4">
          <h3 class="text-lg font-semibold mb-2">Stripe Settings</h3>
          <mat-form-field class="w-full">
            <mat-label>Stripe Public Key</mat-label>
            <input matInput formControlName="stripe_public_key">
          </mat-form-field>

          <mat-form-field class="w-full">
            <mat-label>Stripe Secret Key</mat-label>
            <input matInput type="password" formControlName="stripe_secret_key">
          </mat-form-field>

          <mat-slide-toggle formControlName="stripe_enabled" class="mb-4">
            Enable Stripe Payments
          </mat-slide-toggle>
        </div>

        <div class="bg-white p-4 rounded-lg shadow mb-4">
          <h3 class="text-lg font-semibold mb-2">Cash Settings</h3>
          <mat-slide-toggle formControlName="cash_enabled" class="mb-4">
            Enable Cash Payments
          </mat-slide-toggle>
        </div>

        <div class="flex justify-end">
          <button mat-raised-button color="primary" type="submit" 
                  [disabled]="!paymentForm.valid || paymentForm.pristine">
            Save Settings
          </button>
        </div>
      </form>
    </div>
  `
})
export class PaymentSettingsComponent implements OnInit {
  paymentForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private paymentSettingsService: PaymentSettingsService
  ) {
    this.paymentForm = this.fb.group({
      stripe_public_key: ['', Validators.required],
      stripe_secret_key: ['', Validators.required],
      stripe_enabled: [false],
      cash_enabled: [true]
    });
  }

  ngOnInit() {
    this.loadSettings();
  }

  loadSettings() {
    this.paymentSettingsService.getPaymentSettings().subscribe(settings => {
      this.paymentForm.patchValue(settings);
      this.paymentForm.markAsPristine();
    });
  }

  saveSettings() {
    if (this.paymentForm.valid) {
      this.paymentSettingsService.updatePaymentSettings(this.paymentForm.value).subscribe();
    }
  }
}