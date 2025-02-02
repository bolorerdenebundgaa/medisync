import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <mat-card class="h-full">
      <img mat-card-image [src]="product.image_url || 'assets/default-product.jpg'"
           [alt]="product.name"
           class="h-48 w-full object-cover">
      
      <mat-card-content class="p-4">
        <h3 class="text-lg font-semibold mb-2">{{product.name}}</h3>
        <p class="text-gray-600 text-sm mb-2 line-clamp-2">{{product.description}}</p>
        
        <div class="flex justify-between items-center">
          <span class="text-lg font-bold">{{product.price | currency}}</span>
          
          <div class="space-x-2">
            <button mat-icon-button 
                    *ngIf="showWishlist"
                    (click)="onWishlist.emit(product)"
                    [color]="isInWishlist ? 'warn' : ''">
              <mat-icon>{{isInWishlist ? 'favorite' : 'favorite_border'}}</mat-icon>
            </button>
            
            <button mat-raised-button 
                    color="primary"
                    [disabled]="!product.is_active"
                    (click)="onAddToCart.emit(product)">
              {{addToCartText}}
            </button>
          </div>
        </div>

        <div *ngIf="showStock" class="mt-2">
          <span [class]="getStockClass()">
            {{getStockText()}}
          </span>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    :host {
      display: block;
    }
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})
export class ProductCardComponent {
  @Input() product!: Product;
  @Input() showWishlist = true;
  @Input() showStock = false;
  @Input() isInWishlist = false;
  @Input() stockLevel?: number;
  @Input() addToCartText = 'Add to Cart';

  @Output() onAddToCart = new EventEmitter<Product>();
  @Output() onWishlist = new EventEmitter<Product>();

  getStockClass(): string {
    if (!this.showStock || this.stockLevel === undefined) return '';

    if (this.stockLevel <= 0) {
      return 'text-red-600';
    } else if (this.stockLevel <= 5) {
      return 'text-orange-600';
    } else {
      return 'text-green-600';
    }
  }

  getStockText(): string {
    if (!this.showStock || this.stockLevel === undefined) return '';

    if (this.stockLevel <= 0) {
      return 'Out of Stock';
    } else if (this.stockLevel <= 5) {
      return `Low Stock (${this.stockLevel})`;
    } else {
      return `In Stock (${this.stockLevel})`;
    }
  }
}
