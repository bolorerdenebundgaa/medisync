import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { RoleService } from '../../../services/role.service';
import { BranchService } from '../../../services/branch.service';
import { Role } from '../../../models/role.model';
import { Branch } from '../../../models/branch.model';

@Component({
  selector: 'app-role-assignment',
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
    <h2 mat-dialog-title>Assign Roles to {{data.email}}</h2>
    <form [formGroup]="assignmentForm" (ngSubmit)="onSubmit()">
      <mat-dialog-content>
        <div class="flex flex-col gap-4">
          <mat-form-field>
            <mat-label>Roles</mat-label>
            <mat-select formControlName="roles" multiple>
              <mat-option *ngFor="let role of availableRoles" [value]="role.id">
                {{role.name}}
              </mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field>
            <mat-label>Branch</mat-label>
            <mat-select formControlName="branch">
              <mat-option [value]="null">No Branch</mat-option>
              <mat-option *ngFor="let branch of availableBranches" [value]="branch.id">
                {{branch.name}}
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
export class RoleAssignmentComponent implements OnInit {
  assignmentForm: FormGroup;
  availableRoles: Role[] = [];
  availableBranches: Branch[] = [];

  constructor(
    private fb: FormBuilder,
    private roleService: RoleService,
    private branchService: BranchService,
    public dialogRef: MatDialogRef<RoleAssignmentComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.assignmentForm = this.fb.group({
      roles: [[]],
      branch: [null]
    });
  }

  ngOnInit() {
    // Load roles
    this.roleService.getRoles().subscribe(roles => {
      this.availableRoles = roles;
      
      // Set current roles
      const currentRoleIds = this.data.roles?.map((r: Role) => r.id) || [];
      this.assignmentForm.patchValue({
        roles: currentRoleIds
      });
    });

    // Load branches
    this.branchService.getBranches().subscribe(branches => {
      this.availableBranches = branches;
      
      // Set current branch
      if (this.data.branch) {
        this.assignmentForm.patchValue({
          branch: this.data.branch.id
        });
      }
    });
  }

  onSubmit() {
    if (this.assignmentForm.valid) {
      this.dialogRef.close({
        roleIds: this.assignmentForm.value.roles,
        branchId: this.assignmentForm.value.branch
      });
    }
  }
}