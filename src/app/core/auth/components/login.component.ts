import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
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
          <mat-card-title>Admin Login</mat-card-title>
          <mat-card-subtitle>Inventory Management System</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <div class="flex justify-end mb-4">
            <button mat-button color="primary" (click)="showRegister = !showRegister">
              {{ showRegister ? 'Back to Login' : 'Register New Admin' }}
            </button>
          </div>

          <!-- Registration Form -->
          <form *ngIf="showRegister" [formGroup]="registerForm" (ngSubmit)="onRegister()" class="flex flex-col gap-4">
            <mat-form-field>
              <mat-label>Full Name</mat-label>
              <input matInput formControlName="fullName" required>
            </mat-form-field>

            <mat-form-field>
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" required>
            </mat-form-field>
            
            <mat-form-field>
              <mat-label>Password</mat-label>
              <input matInput type="password" formControlName="password" required>
              <mat-hint>Minimum 6 characters</mat-hint>
            </mat-form-field>

            <button mat-raised-button color="primary" type="submit" [disabled]="registerForm.invalid">
              Register
            </button>
          </form>

          <!-- Login Form -->
          <form *ngIf="!showRegister" (ngSubmit)="onSubmit()" #loginForm="ngForm" class="flex flex-col gap-4">
            <mat-form-field>
              <mat-label>Email</mat-label>
              <input matInput type="email" [(ngModel)]="email" name="email" required>
            </mat-form-field>
            
            <mat-form-field>
              <mat-label>Password</mat-label>
              <input matInput type="password" [(ngModel)]="password" name="password" required>
            </mat-form-field>

            <button mat-raised-button color="primary" type="submit">Login</button>
          </form>

          <div class="mt-6 text-center text-sm text-gray-600">
            <p>Demo Credentials:</p>
            <p>Email: admin&#64;example.com</p>
            <p>Password: admin123</p>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `
})
export class LoginComponent {
  showRegister = false;
  email: string = '';
  password: string = '';
  registerForm: FormGroup;

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
    // Check if already logged in as admin
    const token = localStorage.getItem('admin_auth_token');
    if (token) {
      this.router.navigate(['/admin/dashboard']);
    }
  }

  onSubmit() {
    if (this.email && this.password) {
      this.authService.signIn(this.email, this.password).subscribe({
        error: (error) => console.error('Login error:', error)
      });
    }
  }

  onRegister() {
    if (this.registerForm.valid) {
      const { email, password, fullName } = this.registerForm.value;
      this.authService.register(email, password, fullName).subscribe({
        next: () => {
          this.showRegister = false;
          this.registerForm.reset();
        },
        error: (error: Error) => console.error('Registration error:', error)
      });
    }
  }
}