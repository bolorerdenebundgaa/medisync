import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  template: `
    <h2 mat-dialog-title>Add New Client</h2>
    <form [formGroup]="clientForm" (ngSubmit)="onSubmit()">
      <mat-dialog-content>
        <div class="flex flex-col gap-4">
          <mat-form-field>
            <mat-label>Full Name</mat-label>
            <input matInput formControlName="full_name" required>
          </mat-form-field>

          <mat-form-field>
            <mat-label>Phone</mat-label>
            <input matInput formControlName="phone">
          </mat-form-field>

          <mat-form-field>
            <mat-label>Email</mat-label>
            <input matInput type="email" formControlName="email">
          </mat-form-field>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button type="button" (click)="dialogRef.close()">Cancel</button>
        <button mat-raised-button color="primary" type="submit" [disabled]="!clientForm.valid">
          Save
        </button>
      </mat-dialog-actions>
    </form>
  `
})
export class ClientFormComponent {
  clientForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ClientFormComponent>
  ) {
    this.clientForm = this.fb.group({
      full_name: ['', Validators.required],
      phone: [''],
      email: ['', [Validators.email]]
    });
  }

  onSubmit() {
    if (this.clientForm.valid) {
      this.dialogRef.close(this.clientForm.value);
    }
  }
}