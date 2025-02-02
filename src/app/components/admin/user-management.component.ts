import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';

import { UserService, User, UserWithRoles } from '../../services/user.service';
import { EditUserRolesDialogComponent } from './edit-user-roles-dialog.component';
import { CreateUserDialogComponent } from './create-user-dialog.component';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    MatChipsModule,
    MatTooltipModule
  ],
  template: `
    <div class="container mx-auto p-4">
      <div class="flex justify-between items-center mb-4">
        <h1 class="text-2xl font-bold">User Management</h1>
        <button mat-raised-button color="primary" (click)="openCreateUserDialog()">
          <mat-icon>add</mat-icon>
          Add User
        </button>
      </div>

      <table mat-table [dataSource]="users" class="w-full">
        <!-- Full Name Column -->
        <ng-container matColumnDef="full_name">
          <th mat-header-cell *matHeaderCellDef>Name</th>
          <td mat-cell *matCellDef="let user">{{user.full_name}}</td>
        </ng-container>

        <!-- Email Column -->
        <ng-container matColumnDef="email">
          <th mat-header-cell *matHeaderCellDef>Email</th>
          <td mat-cell *matCellDef="let user">{{user.email}}</td>
        </ng-container>

        <!-- Role Column -->
        <ng-container matColumnDef="role">
          <th mat-header-cell *matHeaderCellDef>Role</th>
          <td mat-cell *matCellDef="let user">
            <mat-chip-list>
              <mat-chip>{{user.role}}</mat-chip>
            </mat-chip-list>
          </td>
        </ng-container>

        <!-- Status Column -->
        <ng-container matColumnDef="status">
          <th mat-header-cell *matHeaderCellDef>Status</th>
          <td mat-cell *matCellDef="let user">
            <mat-chip [color]="user.is_active ? 'primary' : 'warn'" selected>
              {{user.is_active ? 'Active' : 'Inactive'}}
            </mat-chip>
          </td>
        </ng-container>

        <!-- Actions Column -->
        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef>Actions</th>
          <td mat-cell *matCellDef="let user">
            <button mat-icon-button [matTooltip]="'Edit Roles'"
                    (click)="openEditRolesDialog(user)">
              <mat-icon>edit</mat-icon>
            </button>
            <button mat-icon-button [matTooltip]="'Reset Password'"
                    (click)="resetPassword(user)">
              <mat-icon>lock_reset</mat-icon>
            </button>
            <button mat-icon-button [matTooltip]="user.is_active ? 'Deactivate' : 'Activate'"
                    (click)="toggleUserStatus(user)"
                    [color]="user.is_active ? 'warn' : 'primary'">
              <mat-icon>{{user.is_active ? 'person_off' : 'person'}}</mat-icon>
            </button>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
      </table>
    </div>
  `
})
export class UserManagementComponent implements OnInit {
  users: UserWithRoles[] = [];
  displayedColumns = ['full_name', 'email', 'role', 'status', 'actions'];

  constructor(
    private userService: UserService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  private loadUsers(): void {
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
      },
      error: (error) => {
        this.snackBar.open(error.message || 'Error loading users', 'Close', { duration: 3000 });
      }
    });
  }

  openCreateUserDialog(): void {
    const dialogRef = this.dialog.open(CreateUserDialogComponent, {
      width: '500px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.userService.createUser(result).subscribe({
          next: () => {
            this.snackBar.open('User created successfully', 'Close', { duration: 3000 });
            this.loadUsers();
          },
          error: (error) => {
            this.snackBar.open(error.message || 'Error creating user', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }

  openEditRolesDialog(user: UserWithRoles): void {
    const dialogRef = this.dialog.open(EditUserRolesDialogComponent, {
      width: '500px',
      data: { user }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.userService.updateUserRole(user.id, result.role).subscribe({
          next: () => {
            this.snackBar.open('User roles updated successfully', 'Close', { duration: 3000 });
            this.loadUsers();
          },
          error: (error) => {
            this.snackBar.open(error.message || 'Error updating user roles', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }

  resetPassword(user: UserWithRoles): void {
    if (confirm(`Are you sure you want to reset the password for ${user.full_name}?`)) {
      this.userService.resetPassword(user.id).subscribe({
        next: () => {
          this.snackBar.open('Password reset email sent', 'Close', { duration: 3000 });
        },
        error: (error) => {
          this.snackBar.open(error.message || 'Error resetting password', 'Close', { duration: 3000 });
        }
      });
    }
  }

  toggleUserStatus(user: UserWithRoles): void {
    const newStatus = !user.is_active;
    const action = newStatus ? 'activate' : 'deactivate';

    if (confirm(`Are you sure you want to ${action} ${user.full_name}?`)) {
      this.userService.updateUser(user.id, { is_active: newStatus }).subscribe({
        next: () => {
          this.snackBar.open(`User ${action}d successfully`, 'Close', { duration: 3000 });
          this.loadUsers();
        },
        error: (error) => {
          this.snackBar.open(error.message || `Error ${action}ing user`, 'Close', { duration: 3000 });
        }
      });
    }
  }
}
