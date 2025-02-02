import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Role } from '../../../models/role.model';

@Component({
  selector: 'app-role-form',
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
    <h2 mat-dialog-title>{{data ? 'Edit' : 'Add'}} Role</h2>
    <form [formGroup]="roleForm" (ngSubmit)="onSubmit()">
      <mat-dialog-content>
        <div class="flex flex-col gap-4">
          <mat-form-field>
            <mat-label>Name</mat-label>
            <input matInput formControlName="name" required>
          </mat-form-field>

          <mat-form-field>
            <mat-label>Description</mat-label>
            <textarea matInput formControlName="description" rows="3"></textarea>
          </mat-form-field>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button type="button" (click)="dialogRef.close()">Cancel</button>
        <button mat-raised-button color="primary" type="submit" [disabled]="!roleForm.valid">
          Save
        </button>
      </mat-dialog-actions>
    </form>
  `
})
export class RoleFormComponent {
  roleForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<RoleFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Role | null
  ) {
    this.roleForm = this.fb.group({
      name: [data?.name || '', [Validators.required, Validators.pattern('[a-z_]+')]],
      description: [data?.description || '']
    });

    if (data?.name === 'admin') {
      this.roleForm.get('name')?.disable();
    }
  }

  onSubmit() {
    if (this.roleForm.valid) {
      const role: Partial<Role> = {
        ...this.data,
        ...this.roleForm.value
      };
      this.dialogRef.close(role);
    }
  }
}