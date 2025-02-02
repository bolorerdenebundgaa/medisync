import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';

import { UserWithRoles, UserRoleDetails } from '../../models/user.model';
import { Branch } from '../../models/branch.model';
import { UserRole } from '../../models/role.model';

export interface EditUserRolesDialogData {
  user: UserWithRoles;
  branches: Branch[];
}

export interface RoleAssignment {
  role: UserRole;
  branchId?: string;
}

@Component({
  selector: 'app-edit-user-roles-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatChipsModule,
    MatIconModule
  ],
  template: `
    <div class="p-4">
      <h2 mat-dialog-title class="text-xl font-bold mb-4">
        Edit Roles - {{data.user.full_name}}
      </h2>

      <mat-dialog-content>
        <!-- Current Roles -->
        <div class="mb-4">
          <h3 class="text-lg font-semibold mb-2">Current Roles</h3>
          <mat-chip-listbox>
            <mat-chip *ngFor="let role of data.user.roles" 
                     [removable]="true" 
                     (removed)="removeRole(role)">
              {{role.role_name}}
              <span *ngIf="role.branch_name">({{role.branch_name}})</span>
              <mat-icon matChipRemove>cancel</mat-icon>
            </mat-chip>
          </mat-chip-listbox>
        </div>

        <!-- Add New Role -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <mat-form-field>
            <mat-label>Role</mat-label>
            <mat-select [(ngModel)]="newRole.role">
              <mat-option *ngFor="let role of availableRoles" [value]="role">
                {{role | titlecase}}
              </mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field *ngIf="showBranchSelection()">
            <mat-label>Branch</mat-label>
            <mat-select [(ngModel)]="newRole.branchId">
              <mat-option *ngFor="let branch of data.branches" [value]="branch.id">
                {{branch.name}}
              </mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        <div class="flex justify-end mt-4">
          <button mat-raised-button color="primary" 
                  [disabled]="!canAddRole()"
                  (click)="addRole()">
            Add Role
          </button>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="cancel()">Cancel</button>
        <button mat-raised-button color="primary" (click)="save()">Save</button>
      </mat-dialog-actions>
    </div>
  `
})
export class EditUserRolesDialogComponent {
  availableRoles = Object.values(UserRole);
  newRole: RoleAssignment = {
    role: null as unknown as UserRole,
    branchId: undefined
  };

  removedRoles: UserRoleDetails[] = [];
  addedRoles: RoleAssignment[] = [];

  constructor(
    public dialogRef: MatDialogRef<EditUserRolesDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EditUserRolesDialogData
  ) {}

  showBranchSelection(): boolean {
    return this.newRole.role && this.newRole.role !== UserRole.ADMIN;
  }

  canAddRole(): boolean {
    if (!this.newRole.role) return false;
    if (this.newRole.role === UserRole.ADMIN) return true;
    return !!this.newRole.branchId;
  }

  addRole(): void {
    if (!this.canAddRole()) return;

    // Check if role already exists
    const exists = this.data.user.roles.some(r => 
      r.role_name === this.newRole.role && 
      r.branch_id === this.newRole.branchId
    );

    if (!exists) {
      this.addedRoles.push({ ...this.newRole });
      
      // Add to user's roles for display
      this.data.user.roles.push({
        role_id: this.newRole.role,
        role_name: this.newRole.role,
        branch_id: this.newRole.branchId,
        branch_name: this.data.branches.find(b => b.id === this.newRole.branchId)?.name,
        assigned_at: new Date(),
        assigned_by: 'current_user', // This will be set by the backend
        is_active: true
      });
    }

    // Reset form
    this.newRole = {
      role: null as unknown as UserRole,
      branchId: undefined
    };
  }

  removeRole(role: UserRoleDetails): void {
    // Add to removed roles list
    this.removedRoles.push(role);

    // Remove from user's roles
    const index = this.data.user.roles.findIndex(r => 
      r.role_name === role.role_name && 
      r.branch_id === role.branch_id
    );
    if (index > -1) {
      this.data.user.roles.splice(index, 1);
    }

    // Remove from added roles if it was just added
    const addedIndex = this.addedRoles.findIndex(r => 
      r.role === role.role_name && 
      r.branchId === role.branch_id
    );
    if (addedIndex > -1) {
      this.addedRoles.splice(addedIndex, 1);
    }
  }

  cancel(): void {
    this.dialogRef.close();
  }

  save(): void {
    this.dialogRef.close({
      added: this.addedRoles,
      removed: this.removedRoles
    });
  }
}
