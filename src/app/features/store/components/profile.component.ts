import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { WebAuthService } from '../../../core/auth/services/web-auth.service';

@Component({
  selector: 'app-profile',
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
      <h1 class="text-2xl font-bold mb-4">My Profile</h1>
      
      <mat-card>
        <mat-card-content>
          <form [formGroup]="profileForm" (ngSubmit)="onSubmit()" class="flex flex-col gap-4">
            <mat-form-field>
              <mat-label>Full Name</mat-label>
              <input matInput formControlName="fullName" required>
            </mat-form-field>

            <mat-form-field>
              <mat-label>Email</mat-label>
              <input matInput formControlName="email" readonly>
            </mat-form-field>

            <mat-form-field>
              <mat-label>Phone</mat-label>
              <input matInput formControlName="phone">
            </mat-form-field>

            <mat-form-field>
              <mat-label>Shipping Address</mat-label>
              <textarea matInput formControlName="shippingAddress" rows="3"></textarea>
            </mat-form-field>

            <div class="flex justify-end">
              <button mat-raised-button color="primary" type="submit" 
                      [disabled]="!profileForm.valid || profileForm.pristine">
                Save Changes
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  userId: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: WebAuthService
  ) {
    this.profileForm = this.fb.group({
      fullName: ['', Validators.required],
      email: [{ value: '', disabled: true }],
      phone: [''],
      shippingAddress: ['']
    });
  }

  ngOnInit() {
    this.authService.getCurrentUser().subscribe(user => {
      if (user) {
        this.userId = user.id;
        this.profileForm.patchValue({
          fullName: user.full_name,
          email: user.email
        });
      }
    });
  }

  onSubmit() {
    if (this.profileForm.valid && this.userId) {
      this.authService.updateProfile(this.userId, {
        full_name: this.profileForm.get('fullName')?.value,
        phone: this.profileForm.get('phone')?.value,
        shipping_address: this.profileForm.get('shippingAddress')?.value
      }).subscribe();
    }
  }
}