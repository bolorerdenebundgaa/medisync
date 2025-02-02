import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BranchService } from '../services/branch.service';

@Component({
  selector: 'app-branch-settings',
  template: `
    <div class="container mx-auto p-4">
      <h2 class="text-2xl font-bold mb-4">Branch Settings: {{branchName}}</h2>
      
      <form [formGroup]="settingsForm" (ngSubmit)="saveSettings()" class="space-y-4">
        <div class="bg-white p-4 rounded-lg shadow mb-4">
          <h3 class="text-lg font-semibold mb-2">Inventory Settings</h3>
          
          <mat-form-field class="w-full">
            <mat-label>Low Stock Threshold</mat-label>
            <input matInput type="number" formControlName="low_stock_threshold">
            <mat-hint>Alert when stock falls below this level</mat-hint>
          </mat-form-field>

          <mat-form-field class="w-full">
            <mat-label>Reorder Point</mat-label>
            <input matInput type="number" formControlName="reorder_point">
            <mat-hint>Stock level that triggers reorder</mat-hint>
          </mat-form-field>

          <mat-form-field class="w-full">
            <mat-label>Maximum Stock Level</mat-label>
            <input matInput type="number" formControlName="max_stock_level">
            <mat-hint>Maximum allowed stock level</mat-hint>
          </mat-form-field>
        </div>

        <div class="bg-white p-4 rounded-lg shadow mb-4">
          <h3 class="text-lg font-semibold mb-2">Operating Hours</h3>
          
          <div formArrayName="operating_hours" class="space-y-4">
            <div *ngFor="let day of operatingHours.controls; let i=index" 
                 [formGroupName]="i" 
                 class="flex items-center gap-4">
              <span class="w-24">{{getDayName(i)}}</span>
              
              <mat-slide-toggle formControlName="is_closed">
                Closed
              </mat-slide-toggle>

              <ng-container *ngIf="!day.get('is_closed')?.value">
                <mat-form-field>
                  <mat-label>Open Time</mat-label>
                  <input matInput type="time" formControlName="open_time">
                </mat-form-field>

                <mat-form-field>
                  <mat-label>Close Time</mat-label>
                  <input matInput type="time" formControlName="close_time">
                </mat-form-field>
              </ng-container>
            </div>
          </div>
        </div>

        <div class="flex justify-end">
          <button mat-raised-button color="primary" type="submit" 
                  [disabled]="!settingsForm.valid || settingsForm.pristine">
            Save Settings
          </button>
        </div>
      </form>
    </div>
  `
})
export class BranchSettingsComponent implements OnInit {
  branchId!: string;
  branchName = '';
  settingsForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private branchService: BranchService
  ) {
    this.settingsForm = this.fb.group({
      low_stock_threshold: [10, [Validators.required, Validators.min(0)]],
      reorder_point: [20, [Validators.required, Validators.min(0)]],
      max_stock_level: [100, [Validators.required, Validators.min(0)]],
      operating_hours: this.fb.array([
        ...Array(7).fill(null).map(() => this.createDayForm())
      ])
    });
  }

  ngOnInit() {
    this.branchId = this.route.snapshot.params['id'];
    this.loadBranchSettings();
  }

  private createDayForm() {
    return this.fb.group({
      is_closed: [false],
      open_time: ['09:00'],
      close_time: ['17:00']
    });
  }

  get operatingHours() {
    return this.settingsForm.get('operating_hours') as FormArray;
  }

  getDayName(index: number): string {
    return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][index];
  }

  loadBranchSettings() {
    this.branchService.getBranchSettings(this.branchId).subscribe(settings => {
      if (settings) {
        this.settingsForm.patchValue(settings);
      }
    });
  }

  saveSettings() {
    if (this.settingsForm.valid) {
      this.branchService.updateBranchSettings(
        this.branchId,
        this.settingsForm.value
      ).subscribe();
    }
  }
}