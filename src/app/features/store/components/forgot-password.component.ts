import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { WebAuthService } from '../../../core/auth/services/web-auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-100">
      <mat-card class="w-full max-w-md p-6">
        <mat-card-header>
          <mat-card-title>Reset Password</mat-card-title>
          <mat-card-subtitle>
            Enter your email address and we'll send you instructions to reset your password.
          </mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="resetForm" (ngSubmit)="onSubmit()" class="flex flex-col gap-4">
            <mat-form-field>
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" required>
              <mat-error *ngIf="resetForm.get('email')?.hasError('required')">
                Email is required
              </mat-error>
              <mat-error *ngIf="resetForm.get('email')?.hasError('email')">
                Please enter a valid email address
              </mat-error>
            </mat-form-field>

            <button mat-raised-button color="primary" type="submit" 
                    [disabled]="resetForm.invalid || isSubmitting">
              {{ isSubmitting ? 'Sending...' : 'Send Reset Instructions' }}
            </button>
            
            <div class="text-center mt-4">
              <a mat-button routerLink="/login">Back to Login</a>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `
})
export class ForgotPasswordComponent {
  resetForm: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private authService: WebAuthService
  ) {
    this.resetForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit() {
    if (this.resetForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      const { email } = this.resetForm.value;
      
      this.authService.requestPasswordReset(email).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.resetForm.reset();
        },
        error: () => {
          this.isSubmitting = false;
        }
      });
    }
  }
}