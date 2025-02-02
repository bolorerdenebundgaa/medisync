import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';

import { UserService } from '../../services/user.service';
import { EditUserRolesDialogComponent } from './edit-user-roles-dialog.component';
import { BranchService } from '../../services/branch.service';
import { PermissionService } from '../../services/permission.service';
import { User, UserWithRoles, UserRegistrationRequest, UserRoleUpdateRequest, UserRoleDetails } from '../../models/user.model';
import { Branch } from '../../models/branch.model';
import { UserRole, Permission } from '../../models/role.model';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatTableModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    MatChipsModule,
    MatMenuModule
  ],
  template: `
    <div class="container mx-auto p-4">
      <!-- Create User Form -->
      <mat-card class="mb-4">
        <mat-card-header>
          <mat-card-title>Create New User</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="userForm" (ngSubmit)="createUser()" class="flex flex-col gap-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <mat-form-field>
                <mat-label>Full Name</mat-label>
                <input matInput formControlName="full_name">
              </mat-form-field>

              <mat-form-field>
                <mat-label>Email</mat-label>
                <input matInput type="email" formControlName="email">
              </mat-form-field>

              <mat-form-field>
                <mat-label>Password</mat-label>
                <input matInput type="password" formControlName="password">
              </mat-form-field>

              <mat-form-field>
                <mat-label>Phone</mat-label>
                <input matInput formControlName="phone">
              </mat-form-field>

              <mat-form-field>
                <mat-label>Role</mat-label>
                <mat-select formControlName="role_id">
                  <mat-option *ngFor="let role of availableRoles" [value]="role.id">
                    {{role.name}}
                  </mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field *ngIf="showBranchSelection()">
                <mat-label>Branch</mat-label>
                <mat-select formControlName="branch_id">
                  <mat-option *ngFor="let branch of branches" [value]="branch.id">
                    {{branch.name}}
                  </mat-option>
                </mat-select>
              </mat-form-field>
            </div>

            <div class="flex justify-end">
              <button mat-raised-button color="primary" type="submit" 
                      [disabled]="!userForm.valid">
                Create User
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>

      <!-- Users Table -->
      <mat-card>
        <mat-card-header>
          <mat-card-title>Users</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <table mat-table [dataSource]="users" class="w-full">
            <ng-container matColumnDef="full_name">
              <th mat-header-cell *matHeaderCellDef>Name</th>
              <td mat-cell *matCellDef="let user">{{user.full_name}}</td>
            </ng-container>

            <ng-container matColumnDef="email">
              <th mat-header-cell *matHeaderCellDef>Email</th>
              <td mat-cell *matCellDef="let user">{{user.email}}</td>
            </ng-container>

            <ng-container matColumnDef="roles">
              <th mat-header-cell *matHeaderCellDef>Roles</th>
              <td mat-cell *matCellDef="let user">
                <mat-chip-listbox>
                  <mat-chip *ngFor="let role of user.roles">
                    {{role.role_name}}
                    <span *ngIf="role.branch_name">({{role.branch_name}})</span>
                  </mat-chip>
                </mat-chip-listbox>
              </td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let user">
                <span [class]="user.is_active ? 'text-green-600' : 'text-red-600'">
                  {{user.is_active ? 'Active' : 'Inactive'}}
                </span>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let user">
                <button mat-icon-button [matMenuTriggerFor]="menu">
                  <mat-icon>more_vert</mat-icon>
                </button>
                <mat-menu #menu="matMenu">
                  <button mat-menu-item (click)="editRoles(user)">
                    <mat-icon>edit</mat-icon>
                    <span>Edit Roles</span>
                  </button>
                  <button mat-menu-item (click)="toggleStatus(user)">
                    <mat-icon>{{user.is_active ? 'block' : 'check_circle'}}</mat-icon>
                    <span>{{user.is_active ? 'Deactivate' : 'Activate'}}</span>
                  </button>
                  <button mat-menu-item (click)="resetPassword(user)">
                    <mat-icon>lock_reset</mat-icon>
                    <span>Reset Password</span>
                  </button>
                </mat-menu>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
        </mat-card-content>
      </mat-card>
    </div>
  `
})
export class UserManagementComponent implements OnInit {
  userForm: FormGroup;
  users: UserWithRoles[] = [];
  branches: Branch[] = [];
  availableRoles = Object.values(UserRole).map(role => ({
    id: role,
    name: role.charAt(0).toUpperCase() + role.slice(1)
  }));
  displayedColumns = ['full_name', 'email', 'roles', 'status', 'actions'];

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private branchService: BranchService,
    private permissionService: PermissionService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.userForm = this.fb.group({
      full_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      phone: [''],
      role_id: ['', Validators.required],
      branch_id: ['']
    });

    // Add branch validation for non-admin roles
    this.userForm.get('role_id')?.valueChanges.subscribe((role: string) => {
      const branchControl = this.userForm.get('branch_id');
      if (role !== UserRole.ADMIN) {
        branchControl?.setValidators(Validators.required);
      } else {
        branchControl?.clearValidators();
      }
      branchControl?.updateValueAndValidity();
    });
  }

  ngOnInit(): void {
    this.loadUsers();
    this.loadBranches();
  }

  private loadUsers(): void {
    this.userService.getUsers().subscribe((users: UserWithRoles[]) => {
      this.users = users;
    });
  }

  private loadBranches(): void {
    this.branchService.getBranches().subscribe((branches: Branch[]) => {
      this.branches = branches;
    });
  }

  showBranchSelection(): boolean {
    const roleId = this.userForm.get('role_id')?.value;
    return roleId && roleId !== UserRole.ADMIN;
  }

  createUser(): void {
    if (this.userForm.valid) {
      const userData: UserRegistrationRequest = {
        ...this.userForm.value
      };

      this.userService.createUser(userData).subscribe(() => {
        this.userForm.reset();
        this.loadUsers();
      });
    }
  }

  editRoles(user: UserWithRoles): void {
    const dialogRef = this.dialog.open(EditUserRolesDialogComponent, {
      width: '600px',
      data: {
        user: { ...user },
        branches: this.branches
      }
    });

    dialogRef.afterClosed().subscribe((result?: { 
      added: { role: string; branchId?: string }[];
      removed: UserRoleDetails[];
    }) => {
      if (result) {
        const roleUpdates: UserRoleUpdateRequest = {
          user_id: user.id,
          role_updates: {
            add: result.added.map(role => ({
              role_id: role.role,
              branch_id: role.branchId
            })),
            remove: result.removed.map(role => ({
              role_id: role.role_id,
              branch_id: role.branch_id
            }))
          }
        };

        this.userService.updateUserRoles(roleUpdates).subscribe();
      }
    });
  }

  toggleStatus(user: UserWithRoles): void {
    this.userService.updateUser({
      id: user.id,
      updates: {
        is_active: !user.is_active
      }
    }).subscribe(() => {
      this.loadUsers();
    });
  }

  resetPassword(user: UserWithRoles): void {
    const newPassword = Math.random().toString(36).slice(-8);
    this.userService.resetPassword(user.id, newPassword).subscribe(() => {
      this.snackBar.open(`New password: ${newPassword}`, 'Copy', { duration: 10000 });
    });
  }
}
