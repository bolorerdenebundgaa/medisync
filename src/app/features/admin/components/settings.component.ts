import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminSettingsService } from '../services/admin-settings.service';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  template: `
    <div class="container mx-auto p-4">
      <h2 class="text-2xl font-bold mb-4">Global Settings</h2>
      
      <form [formGroup]="settingsForm" (ngSubmit)="saveSettings()" class="space-y-4">
        <mat-form-field class="w-full">
          <mat-label>VAT Percentage</mat-label>
          <input matInput type="number" formControlName="vat_percentage">
          <mat-hint>Enter VAT percentage (e.g., 5 for 5%)</mat-hint>
        </mat-form-field>

        <mat-form-field class="w-full">
          <mat-label>Referral Commission Percentage</mat-label>
          <input matInput type="number" formControlName="referral_percentage">
          <mat-hint>Enter referral commission percentage</mat-hint>
        </mat-form-field>

        <mat-form-field class="w-full">
          <mat-label>Maintenance Fee Percentage</mat-label>
          <input matInput type="number" formControlName="maintenance_percentage">
          <mat-hint>Enter maintenance fee percentage</mat-hint>
        </mat-form-field>

        <div class="flex justify-end">
          <button mat-raised-button color="primary" type="submit" 
                  [disabled]="!settingsForm.valid || settingsForm.pristine">
            Save Settings
          </button>
        </div>
      </form>
    </div>
  `
})
export class SettingsComponent implements OnInit {
  settingsForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private settingsService: AdminSettingsService
  ) {
    this.settingsForm = this.fb.group({
      vat_percentage: ['', [Validators.required, Validators.min(0), Validators.max(100)]],
      referral_percentage: ['', [Validators.required, Validators.min(0), Validators.max(100)]],
      maintenance_percentage: ['', [Validators.required, Validators.min(0), Validators.max(100)]]
    });
  }

  ngOnInit() {
    this.loadSettings();
  }

  loadSettings() {
    this.settingsService.getSettings().subscribe(settings => {
      this.settingsForm.patchValue(settings);
      this.settingsForm.markAsPristine();
    });
  }

  saveSettings() {
    if (this.settingsForm.valid) {
      this.settingsService.updateSettings(this.settingsForm.value).subscribe();
    }
  }
}