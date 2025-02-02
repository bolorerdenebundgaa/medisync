import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { OrderService } from '../services/order.service';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  created_at: string;
  status: string;
  total_amount: number;
  items: OrderItem[];
}

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule
  ],
  template: `
    <div class="container mx-auto p-4">
      <h1 class="text-2xl font-bold mb-4">My Orders</h1>
      
      <div class="space-y-4">
        <mat-card *ngFor="let order of orders">
          <mat-card-content>
            <div class="flex justify-between items-start">
              <div>
                <p class="text-sm text-gray-600">Order #{{order.id}}</p>
                <p class="text-sm text-gray-600">{{order.created_at | date:'medium'}}</p>
                <span [ngClass]="{
                  'text-green-600': order.status === 'completed',
                  'text-blue-600': order.status === 'processing',
                  'text-red-600': order.status === 'cancelled'
                }">
                  {{order.status}}
                </span>
              </div>
              <div class="text-right">
                <p class="font-bold">{{order.total_amount | currency}}</p>
                <p class="text-sm text-gray-600">{{(order.items || []).length}} items</p>
              </div>
            </div>

            <mat-divider class="my-4"></mat-divider>

            <div class="space-y-2">
              <div *ngFor="let item of order.items" class="flex justify-between">
                <span>{{item.name}} × {{item.quantity}}</span>
                <span>{{item.price * item.quantity | currency}}</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card *ngIf="orders.length === 0">
          <mat-card-content class="text-center py-8">
            <mat-icon class="text-6xl text-gray-400">receipt_long</mat-icon>
            <p class="mt-4 text-xl text-gray-600">No orders yet</p>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `
})
export class OrdersComponent implements OnInit {
  orders: Order[] = [];

  constructor(private orderService: OrderService) {}

  ngOnInit() {
    this.orderService.getOrders().subscribe(orders => {
      this.orders = orders;
    });
  }
}