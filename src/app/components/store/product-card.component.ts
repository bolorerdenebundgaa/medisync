import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../models/product.model';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  template: `
    <div class="bg-white rounded-lg shadow-md overflow-hidden">
      <div class="p-4">
        <h3 class="text-lg font-semibold mb-2">{{product.name}}</h3>
        <p class="text-gray-600 text-sm mb-2">{{product.description}}</p>
        <div class="flex justify-between items-center">
          <span class="text-lg font-bold">${{product.price}}</span>
          <div class="space-x-2">
            <button mat-icon-button (click)="onWishlist.emit(product)">
              <mat-icon>favorite_border</mat-icon>
            </button>
            <button 
              mat-raised-button 
              color="primary"
              [disabled]="product.quantity === 0"
              (click)="onAddToCart.emit(product)">
              {{product.quantity === 0 ? 'Out of Stock' : 'Add to Cart'}}
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProductCardComponent {
  @Input() product!: Product;
  @Output() onAddToCart = new EventEmitter<Product>();
  @Output() onWishlist = new EventEmitter<Product>();
}