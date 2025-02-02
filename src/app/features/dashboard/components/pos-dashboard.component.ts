import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { DashboardService } from '../services/dashboard.service';

@Component({
  selector: 'app-pos-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatTableModule],
  template: `
    <div class="container mx-auto p-4">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <mat-card>
          <mat-card-content class="p-4">
            <h2 class="text-lg font-bold mb-2">Today's Sales</h2>
            <p class="text-3xl font-bold text-green-600">
              {{todaySales | currency}}
            </p>
            <p class="text-sm text-gray-600">{{todayTransactions}} transactions</p>
          </mat-card-content>
        </mat-card>
      </div>

      <mat-card>
        <mat-card-content>
          <table mat-table [dataSource]="recentTransactions" class="w-full">
            <ng-container matColumnDef="time">
              <th mat-header-cell *matHeaderCellDef>Time</th>
              <td mat-cell *matCellDef="let transaction">
                {{transaction.transaction_time | date:'shortTime'}}
              </td>
            </ng-container>

            <ng-container matColumnDef="id">
              <th mat-header-cell *matHeaderCellDef>Transaction ID</th>
              <td mat-cell *matCellDef="let transaction">
                {{transaction.transaction_id}}
              </td>
            </ng-container>

            <ng-container matColumnDef="items">
              <th mat-header-cell *matHeaderCellDef>Items</th>
              <td mat-cell *matCellDef="let transaction">
                {{transaction.item_count}} items
              </td>
            </ng-container>

            <ng-container matColumnDef="amount">
              <th mat-header-cell *matHeaderCellDef>Amount</th>
              <td mat-cell *matCellDef="let transaction" class="text-green-600">
                {{transaction.transaction_amount | currency}}
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
export class PosDashboardComponent implements OnInit {
  todaySales = 0;
  todayTransactions = 0;
  recentTransactions: any[] = [];
  displayedColumns = ['time', 'id', 'items', 'amount'];

  constructor(private dashboardService: DashboardService) {}

  ngOnInit() {
    this.dashboardService.getSalesStats().subscribe(stats => {
      this.todaySales = stats.todaySales;
      this.todayTransactions = stats.todayTransactions;
    });

    this.dashboardService.getRecentTransactions().subscribe(transactions => {
      this.recentTransactions = transactions;
    });
  }
}