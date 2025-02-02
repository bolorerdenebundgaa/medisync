import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from '../../../services/user.service';
import { UserFormComponent } from './user-form.component';
import { RoleAssignmentComponent } from './role-assignment.component';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule
  ],
  template: `
    <div class="container mx-auto">
      <div class="flex justify-between items-center mb-4">
        <h1 class="text-2xl font-bold">User Management</h1>
        <button mat-raised-button color="primary" (click)="openUserForm()">
          <mat-icon>add</mat-icon>
          Add User
        </button>
      </div>

      <mat-card>
        <mat-card-content>
          <table mat-table [dataSource]="users" class="w-full">
            <ng-container matColumnDef="email">
              <th mat-header-cell *matHeaderCellDef>Email</th>
              <td mat-cell *matCellDef="let user">{{user.email}}</td>
            </ng-container>

            <ng-container matColumnDef="full_name">
              <th mat-header-cell *matHeaderCellDef>Full Name</th>
              <td mat-cell *matCellDef="let user">{{user.metadata?.full_name}}</td>
            </ng-container>

            <ng-container matColumnDef="roles">
              <th mat-header-cell *matHeaderCellDef>Roles</th>
              <td mat-cell *matCellDef="let user">
                <div class="flex gap-1">
                  <span *ngFor="let role of user.roles" 
                        class="px-2 py-1 text-xs rounded bg-blue-100 text-blue-800">
                    {{role.name}}
                  </span>
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="branch">
              <th mat-header-cell *matHeaderCellDef>Branch</th>
              <td mat-cell *matCellDef="let user">{{user.branch?.name || '-'}}</td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let user">
                <button mat-icon-button color="primary" 
                        [disabled]="user.email === 'admin@example.com'"
                        (click)="openUserForm(user)">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button color="accent" 
                        [disabled]="user.email === 'admin@example.com'"
                        (click)="manageRoles(user)">
                  <mat-icon>security</mat-icon>
                </button>
                <button mat-icon-button color="warn" 
                        [disabled]="user.email === 'admin@example.com'"
                        (click)="deleteUser(user)">
                  <mat-icon>delete</mat-icon>
                </button>
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
  users: any[] = [];
  displayedColumns = ['email', 'full_name', 'roles', 'branch', 'actions'];

  constructor(
    private userService: UserService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.userService.getUsers().subscribe(users => {
      this.users = users;
    });
  }

  openUserForm(user?: any) {
    const dialogRef = this.dialog.open(UserFormComponent, {
      width: '500px',
      data: user || null
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (user) {
          // TODO: Implement user update
          this.snackBar.open('User update not implemented yet', 'Close', { duration: 3000 });
        } else {
          this.userService.createUser(result).subscribe({
            next: () => {
              this.loadUsers();
              this.snackBar.open('User created successfully', 'Close', { duration: 3000 });
            }
          });
        }
      }
    });
  }

  manageRoles(user: any) {
    const dialogRef = this.dialog.open(RoleAssignmentComponent, {
      width: '500px',
      data: user
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.userService.updateUserRoles(
          user.id,
          result.roleIds,
          result.branchId
        ).subscribe({
          next: () => {
            this.loadUsers();
            this.snackBar.open('User roles updated successfully', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }

  deleteUser(user: any) {
    if (confirm(`Are you sure you want to delete the user "${user.email}"?`)) {
      this.userService.deleteUser(user.id).subscribe({
        next: () => {
          this.loadUsers();
          this.snackBar.open('User deleted successfully', 'Close', { duration: 3000 });
        }
      });
    }
  }
}