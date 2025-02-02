import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { Product } from '../../../models/product.model';
import { InventoryService } from '../services/inventory.service';
import { ProductFormComponent } from './product-form.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <div class="container mx-auto p-4">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold">Products</h2>
        <button mat-raised-button color="primary" (click)="openProductForm()">
          <mat-icon>add</mat-icon>
          Add Product
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <mat-card *ngFor="let product of products">
          <mat-card-content>
            <div class="flex justify-between">
              <div>
                <h3 class="font-bold">{{product.name}}</h3>
                <p class="text-sm text-gray-600">SKU: {{product.sku}}</p>
                <p class="mt-2">{{product.description}}</p>
                <p class="text-lg font-bold mt-2">{{product.price | currency}}</p>
                <p [ngClass]="{
                  'text-red-600': product.quantity === 0,
                  'text-yellow-600': product.quantity <= 10,
                  'text-green-600': product.quantity > 10
                }">
                  Stock: {{product.quantity}}
                </p>
              </div>
              <div>
                <button mat-icon-button color="primary" (click)="openProductForm(product)">
                  <mat-icon>edit</mat-icon>
                </button>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];

  constructor(
    private inventoryService: InventoryService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.inventoryService.getProducts().subscribe(products => {
      this.products = products;
    });
  }

  openProductForm(product?: Product) {
    const dialogRef = this.dialog.open(ProductFormComponent, {
      width: '500px',
      data: product
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadProducts();
      }
    });
  }
}