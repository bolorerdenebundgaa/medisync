import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-create-user-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCheckboxModule
  ],
  template: `
    <h2 mat-dialog-title>Create New User</h2>
    
    <mat-dialog-content>
      <form [formGroup]="form" class="flex flex-col gap-4">
        <mat-form-field>
          <mat-label>Full Name</mat-label>
          <input matInput formControlName="full_name" required>
          <mat-error *ngIf="form.get('full_name')?.hasError('required')">
            Full name is required
          </mat-error>
        </mat-form-field>

        <mat-form-field>
          <mat-label>Email</mat-label>
          <input matInput type="email" formControlName="email" required>
          <mat-error *ngIf="form.get('email')?.hasError('required')">
            Email is required
          </mat-error>
          <mat-error *ngIf="form.get('email')?.hasError('email')">
            Please enter a valid email address
          </mat-error>
        </mat-form-field>

        <mat-form-field>
          <mat-label>Password</mat-label>
          <input matInput type="password" formControlName="password" required>
          <mat-error *ngIf="form.get('password')?.hasError('required')">
            Password is required
          </mat-error>
          <mat-error *ngIf="form.get('password')?.hasError('minlength')">
            Password must be at least 8 characters
          </mat-error>
        </mat-form-field>

        <mat-form-field>
          <mat-label>Role</mat-label>
          <mat-select formControlName="role" required>
            <mat-option *ngFor="let role of availableRoles" [value]="role.value">
              {{role.label}}
            </mat-option>
          </mat-select>
          <mat-error *ngIf="form.get('role')?.hasError('required')">
            Role is required
          </mat-error>
        </mat-form-field>

        <mat-form-field>
          <mat-label>Branch</mat-label>
          <mat-select formControlName="branch_id">
            <mat-option [value]="null">None</mat-option>
            <mat-option *ngFor="let branch of availableBranches" [value]="branch.id">
              {{branch.name}}
            </mat-option>
          </mat-select>
        </mat-form-field>

        <mat-checkbox formControlName="is_active" class="mt-2">
          Active
        </mat-checkbox>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-raised-button color="primary" 
              [disabled]="!form.valid"
              (click)="save()">
        Create
      </button>
    </mat-dialog-actions>
  `
})
export class CreateUserDialogComponent {
  form: FormGroup;
  
  availableRoles = [
    { value: 'admin', label: 'Administrator' },
    { value: 'manager', label: 'Manager' },
    { value: 'staff', label: 'Staff' },
    { value: 'referee', label: 'Referee' }
  ];

  availableBranches = [
    { id: '1', name: 'Main Branch' },
    { id: '2', name: 'Branch 2' }
  ];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CreateUserDialogComponent>
  ) {
    this.form = this.fb.group({
      full_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      role: ['', Validators.required],
      branch_id: [null],
      is_active: [true]
    });
  }

  save(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }
}
