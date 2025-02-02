import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { NgChartsModule } from 'ng2-charts';
import { DashboardService } from '../services/dashboard.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, NgChartsModule],
  template: `
    <div class="container mx-auto p-4">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <mat-card>
          <mat-card-content class="p-4">
            <h2 class="text-lg font-bold mb-2">System Maintenance</h2>
            <p class="text-3xl font-bold text-blue-600">
              {{maintenanceFee | currency}}
            </p>
            <p class="text-sm text-gray-600">Monthly fee (1% of sales)</p>
          </mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-content class="p-4">
            <h2 class="text-lg font-bold mb-2">Total Sales</h2>
            <p class="text-3xl font-bold text-green-600">
              {{totalSales | currency}}
            </p>
            <p class="text-sm text-gray-600">Current month</p>
          </mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-content class="p-4">
            <h2 class="text-lg font-bold mb-2">YTD Maintenance</h2>
            <p class="text-3xl font-bold text-purple-600">
              {{ytdMaintenance | currency}}
            </p>
            <p class="text-sm text-gray-600">Year to date</p>
          </mat-card-content>
        </mat-card>
      </div>

      <mat-card class="mb-4">
        <mat-card-content>
          <canvas baseChart
            [data]="monthlySalesData"
            [options]="chartOptions"
            [type]="'line'">
          </canvas>
        </mat-card-content>
      </mat-card>
    </div>
  `
})
export class AdminDashboardComponent implements OnInit {
  maintenanceFee = 0;
  totalSales = 0;
  ytdMaintenance = 0;
  monthlySalesData: any;
  chartOptions = {
    responsive: true,
    maintainAspectRatio: false
  };

  constructor(private dashboardService: DashboardService) {}

  ngOnInit() {
    this.dashboardService.getMaintenanceStats().subscribe(stats => {
      this.maintenanceFee = stats.monthlyFee;
      this.totalSales = stats.totalSales;
      this.ytdMaintenance = stats.ytdMaintenance;
    });

    this.dashboardService.getMonthlySales().subscribe(data => {
      this.monthlySalesData = {
        labels: data.map(d => d.month),
        datasets: [{
          label: 'Sales ($)',
          data: data.map(d => d.amount),
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1
        }]
      };
    });
  }
}