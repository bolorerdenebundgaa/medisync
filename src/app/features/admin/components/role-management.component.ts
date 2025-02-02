import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Role } from '../../../models/role.model';
import { RoleService } from '../../../services/role.service';
import { RoleFormComponent } from './role-form.component';
import { PermissionManagementComponent } from './permission-management.component';

@Component({
  selector: 'app-role-management',
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
        <h1 class="text-2xl font-bold">Role Management</h1>
        <button mat-raised-button color="primary" (click)="openRoleForm()">
          <mat-icon>add</mat-icon>
          Add Role
        </button>
      </div>

      <mat-card>
        <mat-card-content>
          <table mat-table [dataSource]="roles" class="w-full">
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Name</th>
              <td mat-cell *matCellDef="let role">{{role.name}}</td>
            </ng-container>

            <ng-container matColumnDef="description">
              <th mat-header-cell *matHeaderCellDef>Description</th>
              <td mat-cell *matCellDef="let role">{{role.description}}</td>
            </ng-container>

            <ng-container matColumnDef="permissions">
              <th mat-header-cell *matHeaderCellDef>Permissions</th>
              <td mat-cell *matCellDef="let role">
                <button mat-button color="primary" (click)="managePermissions(role)">
                  Manage Permissions
                </button>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let role">
                <button mat-icon-button color="primary" 
                        [disabled]="role.name === 'admin'"
                        (click)="openRoleForm(role)">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button color="warn" 
                        [disabled]="role.name === 'admin'"
                        (click)="deleteRole(role)">
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
export class RoleManagementComponent implements OnInit {
  roles: Role[] = [];
  displayedColumns = ['name', 'description', 'permissions', 'actions'];

  constructor(
    private roleService: RoleService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadRoles();
  }

  loadRoles() {
    this.roleService.getRoles().subscribe(roles => {
      this.roles = roles;
    });
  }

  openRoleForm(role?: Role) {
    const dialogRef = this.dialog.open(RoleFormComponent, {
      width: '500px',
      data: role || null
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const action = result.id
          ? this.roleService.updateRole(result)
          : this.roleService.createRole(result);

        action.subscribe({
          next: () => {
            this.loadRoles();
            this.snackBar.open(
              `Role ${result.id ? 'updated' : 'created'} successfully`,
              'Close',
              { duration: 3000 }
            );
          }
        });
      }
    });
  }

  managePermissions(role: Role) {
    const dialogRef = this.dialog.open(PermissionManagementComponent, {
      width: '500px',
      data: role
    });

    dialogRef.afterClosed().subscribe(permissionIds => {
      if (permissionIds) {
        this.roleService.updateRolePermissions(role.id, permissionIds).subscribe({
          next: () => {
            this.loadRoles();
            this.snackBar.open('Permissions updated successfully', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }

  deleteRole(role: Role) {
    if (confirm(`Are you sure you want to delete the role "${role.name}"?`)) {
      this.roleService.deleteRole(role.id).subscribe({
        next: () => {
          this.loadRoles();
          this.snackBar.open('Role deleted successfully', 'Close', { duration: 3000 });
        }
      });
    }
  }
}