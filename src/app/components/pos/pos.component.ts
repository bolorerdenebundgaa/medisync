import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-pos',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  template: `
    <div class="container mx-auto p-4">
      <h1 class="text-2xl font-bold mb-4">Point of Sale</h1>
      <mat-card>
        <mat-card-content>
          <p>POS system coming soon...</p>
        </mat-card-content>
      </mat-card>
    </div>
  `
})
export class PosComponent {}