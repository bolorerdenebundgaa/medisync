import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { AdminAuthService } from '../services/admin-auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-register',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-100">
      <mat-card class="w-full max-w-md p-6">
        <mat-card-header>
          <mat-card-title>Admin Registration</mat-card-title>
          <mat-card-subtitle>Create new admin account</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <form (ngSubmit)="onSubmit()" #registerForm="ngForm" class="flex flex-col gap-4">
            <mat-form-field>
              <mat-label>Full Name</mat-label>
              <input matInput [(ngModel)]="fullName" name="fullName" required>
            </mat-form-field>

            <mat-form-field>
              <mat-label>Email</mat-label>
              <input matInput type="email" [(ngModel)]="email" name="email" required>
            </mat-form-field>
            
            <mat-form-field>
              <mat-label>Password</mat-label>
              <input matInput type="password" [(ngModel)]="password" name="password" required>
            </mat-form-field>

            <button mat-raised-button color="primary" type="submit">Register</button>
            
            <div class="text-center mt-4">
              <a mat-button routerLink="/admin/login">Already have an account? Login</a>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `
})
export class AdminRegisterComponent {
  email: string = '';
  password: string = '';
  fullName: string = '';

  constructor(
    private authService: AdminAuthService,
    private router: Router
  ) {}

  async onSubmit() {
    if (this.email && this.password && this.fullName) {
      await this.authService.register(this.email, this.password, this.fullName);
    }
  }
}