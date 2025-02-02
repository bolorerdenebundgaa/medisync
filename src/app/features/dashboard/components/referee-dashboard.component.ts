import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { NgChartsModule } from 'ng2-charts';
import { DashboardService } from '../services/dashboard.service';

@Component({
  selector: 'app-referee-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, NgChartsModule],
  template: `
    <div class="container mx-auto p-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <mat-card>
          <mat-card-content class="p-4">
            <h2 class="text-lg font-bold mb-2">Total Referrals</h2>
            <p class="text-3xl font-bold text-blue-600">{{totalReferrals}}</p>
            <p class="text-sm text-gray-600">All time referrals</p>
          </mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-content class="p-4">
            <h2 class="text-lg font-bold mb-2">Total Earnings</h2>
            <p class="text-3xl font-bold text-purple-600">
              {{totalEarnings | currency}}
            </p>
            <p class="text-sm text-gray-600">All time earnings</p>
          </mat-card-content>
        </mat-card>
      </div>

      <mat-card class="mt-4">
        <mat-card-content>
          <canvas baseChart
            [data]="monthlyData"
            [options]="chartOptions"
            [type]="'line'">
          </canvas>
        </mat-card-content>
      </mat-card>
    </div>
  `
})
export class RefereeDashboardComponent implements OnInit {
  totalReferrals = 0;
  totalEarnings = 0;
  monthlyData: any;
  chartOptions = {
    responsive: true,
    maintainAspectRatio: false
  };

  constructor(private dashboardService: DashboardService) {}

  ngOnInit() {
    this.dashboardService.getRefereeStats().subscribe(stats => {
      this.totalReferrals = stats.totalReferrals;
      this.totalEarnings = stats.totalEarnings;
    });

    this.dashboardService.getRefereeMonthlyPerformance().subscribe(data => {
      this.monthlyData = {
        labels: data.map(d => d.month),
        datasets: [{
          label: 'Commission',
          data: data.map(d => d.commission),
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1
        }]
      };
    });
  }
}