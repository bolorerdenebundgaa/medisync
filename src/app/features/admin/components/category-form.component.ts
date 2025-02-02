import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { CategoryService } from '../../admin/services/category.service';

@Component({
  selector: 'app-category-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule
  ],
  template: `
    <h2 mat-dialog-title>{{data.category ? 'Edit' : 'Add'}} Category</h2>
    <form [formGroup]="categoryForm" (ngSubmit)="onSubmit()">
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

          <mat-form-field>
            <mat-label>Parent Category</mat-label>
            <mat-select formControlName="parent_id">
              <mat-option [value]="null">None</mat-option>
              <mat-option *ngFor="let category of data.categories" [value]="category.id">
                {{category.name}}
              </mat-option>
            </mat-select>
          </mat-form-field>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button type="button" (click)="dialogRef.close()">Cancel</button>
        <button mat-raised-button color="primary" type="submit" [disabled]="!categoryForm.valid">
          Save
        </button>
      </mat-dialog-actions>
    </form>
  `
})
export class CategoryFormComponent {
  categoryForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private categoryService: CategoryService,
    public dialogRef: MatDialogRef<CategoryFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.categoryForm = this.fb.group({
      name: [data.category?.name || '', Validators.required],
      description: [data.category?.description || ''],
      parent_id: [data.category?.parent_id || null]
    });
  }

  onSubmit() {
    if (this.categoryForm.valid) {
      const category = {
        ...this.data.category,
        ...this.categoryForm.value
      };

      const action = category.id
        ? this.categoryService.updateCategory(category)
        : this.categoryService.createCategory(category);

      action.subscribe(() => {
        this.dialogRef.close(true);
      });
    }
  }
}