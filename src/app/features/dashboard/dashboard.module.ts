import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { NgChartsModule } from 'ng2-charts';
import { dashboardRoutes } from './dashboard.routes';
import { DashboardService } from './services/dashboard.service';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(dashboardRoutes),
    MatCardModule,
    MatIconModule,
    NgChartsModule
  ],
  providers: [DashboardService]
})
export class DashboardModule { }