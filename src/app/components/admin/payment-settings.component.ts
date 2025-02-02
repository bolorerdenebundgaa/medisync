import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { PaymentMethodService } from '../../services/payment-method.service';
import {
  PaymentMethodConfig,
  PaymentMethodType,
  PaymentMethodState
} from '../../models/payment-method.model';

@Component({
  selector: 'app-payment-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDividerModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  template: `
    <div class="container mx-auto p-4">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Payment Methods</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <!-- Add New Payment Method Button -->
          <button mat-raised-button 
                  color="primary" 
                  class="mb-4"
                  (click)="openAddMethodDialog()">
            <mat-icon>add</mat-icon>
            Add Payment Method
          </button>

          <!-- Payment Methods List -->
          <div class="grid gap-4">
            <mat-card *ngFor="let method of state?.methods" class="p-4">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-4">
                  <mat-icon>{{getMethodIcon(method.type)}}</mat-icon>
                  <div>
                    <h3 class="text-lg font-semibold">{{method.name}}</h3>
                    <p class="text-gray-600">{{method.type}}</p>
                  </div>
                </div>
                <div class="flex items-center gap-4">
                  <mat-slide-toggle
                    [checked]="method.enabled"
                    (change)="toggleMethod(method)"
                    color="primary">
                    {{method.enabled ? 'Enabled' : 'Disabled'}}
                  </mat-slide-toggle>
                  <button mat-icon-button 
                          [matMenuTriggerFor]="menu"
                          aria-label="Method settings">
                    <mat-icon>more_vert</mat-icon>
                  </button>
                  <mat-menu #menu="matMenu">
                    <button mat-menu-item (click)="editMethod(method)">
                      <mat-icon>edit</mat-icon>
                      <span>Edit</span>
                    </button>
                    <button mat-menu-item 
                            (click)="setDefaultMethod(method.id)"
                            [disabled]="!method.enabled">
                      <mat-icon>star</mat-icon>
                      <span>Set as Default</span>
                    </button>
                    <mat-divider></mat-divider>
                    <button mat-menu-item 
                            (click)="deleteMethod(method.id)"
                            color="warn">
                      <mat-icon>delete</mat-icon>
                      <span>Delete</span>
                    </button>
                  </mat-menu>
                </div>
              </div>

              <!-- Processor Configuration -->
              <div *ngIf="method.processorConfig" class="mt-4">
                <mat-divider></mat-divider>
                <div class="grid grid-cols-2 gap-4 mt-4">
                  <mat-form-field *ngIf="method.processorConfig.apiKey">
                    <mat-label>API Key</mat-label>
                    <input matInput
                           type="password"
                           [(ngModel)]="method.processorConfig.apiKey"
                           (blur)="updateProcessorConfig(method)">
                  </mat-form-field>
                  <mat-form-field *ngIf="method.processorConfig.merchantId">
                    <mat-label>Merchant ID</mat-label>
                    <input matInput
                           [(ngModel)]="method.processorConfig.merchantId"
                           (blur)="updateProcessorConfig(method)">
                  </mat-form-field>
                  <mat-form-field *ngIf="method.processorConfig.endpoint">
                    <mat-label>API Endpoint</mat-label>
                    <input matInput
                           [(ngModel)]="method.processorConfig.endpoint"
                           (blur)="updateProcessorConfig(method)">
                  </mat-form-field>
                </div>
              </div>
            </mat-card>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `
})
export class PaymentSettingsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  state?: PaymentMethodState;
  availableTypes = Object.values(PaymentMethodType);

  constructor(
    private paymentMethodService: PaymentMethodService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.paymentMethodService.state$
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        this.state = state;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getMethodIcon(type: PaymentMethodType): string {
    switch (type) {
      case PaymentMethodType.CASH:
        return 'payments';
      case PaymentMethodType.CREDIT_CARD:
        return 'credit_card';
      case PaymentMethodType.DEBIT_CARD:
        return 'credit_card';
      case PaymentMethodType.MOBILE_PAYMENT:
        return 'smartphone';
      case PaymentMethodType.BANK_TRANSFER:
        return 'account_balance';
      case PaymentMethodType.CRYPTO:
        return 'currency_bitcoin';
      default:
        return 'payment';
    }
  }

  toggleMethod(method: PaymentMethodConfig): void {
    this.paymentMethodService.updateMethod({
      methodId: method.id,
      updates: { enabled: !method.enabled }
    }).subscribe();
  }

  setDefaultMethod(methodId: string): void {
    this.paymentMethodService.setDefaultMethod(methodId).subscribe();
  }

  deleteMethod(methodId: string): void {
    if (confirm('Are you sure you want to delete this payment method?')) {
      this.paymentMethodService.deleteMethod(methodId).subscribe();
    }
  }

  updateProcessorConfig(method: PaymentMethodConfig): void {
    this.paymentMethodService.updateMethod({
      methodId: method.id,
      updates: { processorConfig: method.processorConfig }
    }).subscribe();
  }

  openAddMethodDialog(): void {
    // TODO: Implement add method dialog
    const newMethod: Omit<PaymentMethodConfig, 'id'> = {
      name: 'New Method',
      type: PaymentMethodType.CASH,
      enabled: false
    };
    this.paymentMethodService.addMethod(newMethod).subscribe();
  }

  editMethod(method: PaymentMethodConfig): void {
    // TODO: Implement edit method dialog
    console.log('Edit method:', method);
  }
}
