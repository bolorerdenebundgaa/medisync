import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';

import { SettingsService } from '../../services/settings.service';

@Component({
  selector: 'app-settings-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatSnackBarModule,
    MatDividerModule
  ],
  template: `
    <div class="container mx-auto p-4">
      <mat-card>
        <mat-card-header>
          <mat-card-title>System Settings</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="settingsForm" (ngSubmit)="saveSettings()" class="flex flex-col gap-4">
            <!-- Commission Settings -->
            <div class="mb-6">
              <h3 class="text-lg font-semibold mb-4">Referee Commission Settings</h3>
              <mat-form-field class="w-full">
                <mat-label>Commission Percentage</mat-label>
                <input matInput type="number" formControlName="referee_commission_percentage"
                       min="0" max="100" step="0.01">
                <mat-hint>Enter percentage between 0 and 100</mat-hint>
                <mat-error *ngIf="settingsForm.get('referee_commission_percentage')?.hasError('required')">
                  Commission percentage is required
                </mat-error>
                <mat-error *ngIf="settingsForm.get('referee_commission_percentage')?.hasError('min') || 
                                settingsForm.get('referee_commission_percentage')?.hasError('max')">
                  Commission percentage must be between 0 and 100
                </mat-error>
              </mat-form-field>

              <div class="text-sm text-gray-600 mt-2">
                Example: For a sale of $100, referee will earn 
                ${{calculateCommission(100)}} at current rate.
              </div>
            </div>

            <mat-divider></mat-divider>

            <!-- VAT Settings -->
            <div class="my-6">
              <h3 class="text-lg font-semibold mb-4">VAT Settings</h3>
              <mat-form-field class="w-full">
                <mat-label>VAT Percentage</mat-label>
                <input matInput type="number" formControlName="vat_percentage"
                       min="0" max="100" step="0.01">
                <mat-hint>Enter percentage between 0 and 100</mat-hint>
                <mat-error *ngIf="settingsForm.get('vat_percentage')?.hasError('required')">
                  VAT percentage is required
                </mat-error>
                <mat-error *ngIf="settingsForm.get('vat_percentage')?.hasError('min') || 
                                settingsForm.get('vat_percentage')?.hasError('max')">
                  VAT percentage must be between 0 and 100
                </mat-error>
              </mat-form-field>

              <div class="text-sm text-gray-600 mt-2">
                Example calculation for $100 sale:
                <ul class="list-disc list-inside mt-1">
                  <li>Product Total: $100.00</li>
                  <li>VAT ({{settingsForm.get('vat_percentage')?.value}}%): 
                    ${{calculateVAT(100)}}</li>
                  <li>Grand Total: ${{calculateTotal(100)}}</li>
                </ul>
              </div>
            </div>

            <div class="flex justify-end mt-4">
              <button mat-raised-button color="primary" type="submit"
                      [disabled]="!settingsForm.valid || !settingsForm.dirty">
                Save Settings
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `
})
export class SettingsManagementComponent implements OnInit {
  settingsForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private settingsService: SettingsService,
    private snackBar: MatSnackBar
  ) {
    this.settingsForm = this.fb.group({
      referee_commission_percentage: ['', [
        Validators.required,
        Validators.min(0),
        Validators.max(100)
      ]],
      vat_percentage: ['', [
        Validators.required,
        Validators.min(0),
        Validators.max(100)
      ]]
    });
  }

  ngOnInit(): void {
    this.loadSettings();
  }

  loadSettings(): void {
    this.settingsService.getSettings().subscribe(settings => {
      this.settingsForm.patchValue({
        referee_commission_percentage: settings.referee_commission_percentage,
        vat_percentage: settings.vat_percentage
      });
      this.settingsForm.markAsPristine();
    });
  }

  saveSettings(): void {
    if (this.settingsForm.valid && this.settingsForm.dirty) {
      this.settingsService.updateSettings(this.settingsForm.value).subscribe({
        next: () => {
          this.snackBar.open('Settings updated successfully', 'Close', { duration: 3000 });
          this.settingsForm.markAsPristine();
        },
        error: (error) => {
          this.snackBar.open(error.message || 'Error updating settings', 'Close', { duration: 3000 });
        }
      });
    }
  }

  calculateCommission(amount: number): string {
    const commission = amount * (this.settingsForm.get('referee_commission_percentage')?.value || 0) / 100;
    return commission.toFixed(2);
  }

  calculateVAT(amount: number): string {
    const vat = amount * (this.settingsForm.get('vat_percentage')?.value || 0) / 100;
    return vat.toFixed(2);
  }

  calculateTotal(amount: number): string {
    const vat = parseFloat(this.calculateVAT(amount));
    return (amount + vat).toFixed(2);
  }
}
