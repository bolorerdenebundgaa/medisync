import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { CategoryFormComponent } from './category-form.component';
import { CategoryService } from '../../admin/services/category.service';

@Component({
  selector: 'app-category-management',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule
  ],
  template: `
    <div class="container mx-auto p-4">
      <div class="flex justify-between items-center mb-4">
        <h1 class="text-2xl font-bold">Category Management</h1>
        <button mat-raised-button color="primary" (click)="openCategoryForm()">
          <mat-icon>add</mat-icon>
          Add Category
        </button>
      </div>

      <mat-card>
        <mat-card-content>
          <table mat-table [dataSource]="categories" class="w-full">
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Name</th>
              <td mat-cell *matCellDef="let category">{{category.name}}</td>
            </ng-container>

            <ng-container matColumnDef="description">
              <th mat-header-cell *matHeaderCellDef>Description</th>
              <td mat-cell *matCellDef="let category">{{category.description}}</td>
            </ng-container>

            <ng-container matColumnDef="parent">
              <th mat-header-cell *matHeaderCellDef>Parent Category</th>
              <td mat-cell *matCellDef="let category">
                {{getParentCategoryName(category.parent_id)}}
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let category">
                <button mat-icon-button color="primary" (click)="openCategoryForm(category)">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button color="warn" (click)="deleteCategory(category)">
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
export class CategoryManagementComponent implements OnInit {
  categories: any[] = [];
  displayedColumns = ['name', 'description', 'parent', 'actions'];

  constructor(
    private categoryService: CategoryService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe(categories => {
      this.categories = categories;
    });
  }

  openCategoryForm(category?: any) {
    const dialogRef = this.dialog.open(CategoryFormComponent, {
      width: '500px',
      data: {
        category,
        categories: this.categories.filter(c => c.id !== category?.id)
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadCategories();
      }
    });
  }

  deleteCategory(category: any) {
    if (confirm(`Are you sure you want to delete "${category.name}"?`)) {
      this.categoryService.deleteCategory(category.id).subscribe(() => {
        this.loadCategories();
      });
    }
  }

  getParentCategoryName(parentId: string): string {
    if (!parentId) return '-';
    const parent = this.categories.find(c => c.id === parentId);
    return parent ? parent.name : '-';
  }
}