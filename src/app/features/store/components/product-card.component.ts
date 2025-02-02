import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { Product } from '../../../models/product.model';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule
  ],
  template: `
    <mat-card class="h-full flex flex-col">
      <a [routerLink]="['/product', product.id]" class="block">
        <img [src]="product.photo_url || 'assets/default.jpg'" 
             [alt]="product.name"
             class="w-full h-48 object-cover">
        
        <mat-card-content class="p-4">
          <h3 class="text-lg font-bold">{{product.name}}</h3>
          <p class="text-sm text-gray-600">SKU: {{product.sku}}</p>
          <p class="mt-2 text-gray-700 line-clamp-2">{{product.description}}</p>
          <p class="mt-2 text-xl font-bold">\${{product.price}}</p>
          <p [class.text-red-600]="product.quantity === 0"
             [class.text-yellow-600]="product.quantity <= 10"
             [class.text-green-600]="product.quantity > 10"
             class="text-sm">
            {{product.quantity === 0 ? 'Out of Stock' : product.quantity + ' in stock'}}
          </p>
        </mat-card-content>
      </a>

      <mat-card-actions class="p-4 mt-auto">
        <div class="flex justify-between items-center">
          <button mat-icon-button color="accent" (click)="onWishlist.emit(product)">
            <mat-icon>favorite_border</mat-icon>
          </button>
          <button mat-raised-button color="primary"
                  [disabled]="product.quantity === 0"
                  (click)="onAddToCart.emit(product)">
            {{product.quantity === 0 ? 'Out of Stock' : 'Add to Cart'}}
          </button>
        </div>
      </mat-card-actions>
    </mat-card>
  `
})
export class ProductCardComponent {
  @Input() product!: Product;
  @Output() onAddToCart = new EventEmitter<Product>();
  @Output() onWishlist = new EventEmitter<Product>();
}