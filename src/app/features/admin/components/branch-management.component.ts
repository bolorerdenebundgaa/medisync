import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { Branch } from '../../../models/branch.model';
import { BranchService } from '../../../services/branch.service';
import { BranchFormComponent } from './branch-form.component';

@Component({
  selector: 'app-branch-management',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule
  ],
  template: `
    <div class="container mx-auto p-4">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-bold">Branch Management</h2>
        <button mat-raised-button color="primary" (click)="openBranchForm()">
          <mat-icon>add</mat-icon>
          Add Branch
        </button>
      </div>

      <mat-card>
        <mat-card-content>
          <table mat-table [dataSource]="branches" class="w-full">
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Name</th>
              <td mat-cell *matCellDef="let branch">{{branch.name}}</td>
            </ng-container>

            <ng-container matColumnDef="location">
              <th mat-header-cell *matHeaderCellDef>Location</th>
              <td mat-cell *matCellDef="let branch">{{branch.location}}</td>
            </ng-container>

            <ng-container matColumnDef="is_ecommerce_base">
              <th mat-header-cell *matHeaderCellDef>eCommerce Base</th>
              <td mat-cell *matCellDef="let branch">
                <mat-icon *ngIf="branch.is_ecommerce_base" color="primary">check_circle</mat-icon>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let branch">
                <button mat-icon-button color="primary" (click)="openBranchForm(branch)">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button color="accent" 
                        [disabled]="branch.is_ecommerce_base"
                        (click)="setAsEcommerceBase(branch)">
                  <mat-icon>store</mat-icon>
                </button>
                <button mat-icon-button color="warn" 
                        [disabled]="branch.is_ecommerce_base"
                        (click)="deleteBranch(branch)">
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
export class BranchManagementComponent implements OnInit {
  branches: Branch[] = [];
  displayedColumns = ['name', 'location', 'is_ecommerce_base', 'actions'];

  constructor(
    private branchService: BranchService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadBranches();
  }

  loadBranches() {
    this.branchService.getBranches().subscribe(branches => {
      this.branches = branches;
    }, error => {
      console.error('Error loading branches:', error);
    });
  }

  openBranchForm(branch?: Branch) {
    const dialogRef = this.dialog.open(BranchFormComponent, {
      width: '500px',
      data: branch || null
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const action = result.id
          ? this.branchService.updateBranch(result)
          : this.branchService.createBranch(result);

        action.subscribe(() => this.loadBranches());
      }
    });
  }

  setAsEcommerceBase(branch: Branch) {
    if (confirm(`Set "${branch.name}" as the eCommerce base branch?`)) {
      this.branchService.setEcommerceBase(branch.id).subscribe(() => {
        this.loadBranches();
      });
    }
  }

  deleteBranch(branch: Branch) {
    if (confirm(`Are you sure you want to delete "${branch.name}"?`)) {
      this.branchService.deleteBranch(branch.id).subscribe(() => {
        this.loadBranches();
      });
    }
  }
}