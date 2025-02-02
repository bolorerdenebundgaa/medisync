import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { Role, Permission } from '../../../models/role.model';
import { RoleService } from '../../../services/role.service';

@Component({
  selector: 'app-permission-management',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule
  ],
  template: `
    <h2 mat-dialog-title>Manage Permissions for {{data.name}}</h2>
    <form [formGroup]="permissionForm" (ngSubmit)="onSubmit()">
      <mat-dialog-content>
        <div class="flex flex-col gap-4">
          <mat-form-field>
            <mat-label>Permissions</mat-label>
            <mat-select formControlName="permissions" multiple>
              <mat-option *ngFor="let permission of availablePermissions" [value]="permission.id">
                {{permission.resource}}: {{permission.action}}
              </mat-option>
            </mat-select>
          </mat-form-field>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button type="button" (click)="dialogRef.close()">Cancel</button>
        <button mat-raised-button color="primary" type="submit">
          Save
        </button>
      </mat-dialog-actions>
    </form>
  `
})
export class PermissionManagementComponent implements OnInit {
  permissionForm: FormGroup;
  availablePermissions: Permission[] = [];

  constructor(
    private fb: FormBuilder,
    private roleService: RoleService,
    public dialogRef: MatDialogRef<PermissionManagementComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Role
  ) {
    this.permissionForm = this.fb.group({
      permissions: [[]]
    });
  }

  ngOnInit() {
    // Load available permissions
    this.roleService.getPermissions().subscribe(permissions => {
      this.availablePermissions = permissions;
      
      // Set current permissions
      const currentPermissionIds = this.data.permissions?.map(p => p.id) || [];
      this.permissionForm.patchValue({
        permissions: currentPermissionIds
      });
    });
  }

  onSubmit() {
    const permissionIds = this.permissionForm.value.permissions;
    this.dialogRef.close(permissionIds);
  }
}