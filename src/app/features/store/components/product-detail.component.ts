import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Product } from '../../../models/product.model';
import { InventoryService } from '../../../services/inventory.service';
import { CartService } from '../../../services/cart.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="container mx-auto p-4">
      <div class="max-w-4xl mx-auto">
        <mat-card *ngIf="product">
          <mat-card-content>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
              <!-- Product Image -->
              <div class="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                <img [src]="product.photo_url || 'assets/default.jpg'" 
                     [alt]="product.name"
                     class="max-h-full max-w-full object-contain">
              </div>

              <!-- Product Info -->
              <div class="space-y-4">
                <h1 class="text-3xl font-bold">{{product.name}}</h1>
                <p class="text-gray-600">SKU: {{product.sku}}</p>
                <p class="text-xl font-bold">\${{product.price}}</p>
                
                <div class="space-y-2">
                  <p class="text-gray-700">{{product.description}}</p>
                  
                  <div *ngIf="product.properties" class="space-y-4 mt-6">
                    <div *ngIf="product.properties.ingredients?.length">
                      <h3 class="font-semibold">Ingredients:</h3>
                      <ul class="list-disc list-inside">
                        <li *ngFor="let ingredient of product.properties.ingredients">
                          {{ingredient}}
                        </li>
                      </ul>
                    </div>

                    <div *ngIf="product.properties.dosage">
                      <h3 class="font-semibold">Dosage:</h3>
                      <p>{{product.properties.dosage}}</p>
                    </div>

                    <div *ngIf="product.properties.storage_instructions">
                      <h3 class="font-semibold">Storage Instructions:</h3>
                      <p>{{product.properties.storage_instructions}}</p>
                    </div>

                    <div *ngIf="product.properties.usage_instructions">
                      <h3 class="font-semibold">Usage Instructions:</h3>
                      <p>{{product.properties.usage_instructions}}</p>
                    </div>

                    <div *ngIf="product.properties.warnings?.length">
                      <h3 class="font-semibold text-red-600">Warnings:</h3>
                      <ul class="list-disc list-inside text-red-600">
                        <li *ngFor="let warning of product.properties.warnings">
                          {{warning}}
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div class="flex gap-4 mt-6">
                  <button mat-raised-button 
                          color="primary"
                          [disabled]="product.quantity === 0"
                          (click)="addToCart(product)">
                    {{product.quantity === 0 ? 'Out of Stock' : 'Add to Cart'}}
                  </button>
                  <button mat-icon-button 
                          color="accent"
                          (click)="addToWishlist(product)">
                    <mat-icon>favorite_border</mat-icon>
                  </button>
                </div>

                <p [class.text-red-600]="product.quantity === 0"
                   [class.text-yellow-600]="product.quantity <= 10"
                   [class.text-green-600]="product.quantity > 10">
                  {{product.quantity === 0 ? 'Out of Stock' : product.quantity + ' in stock'}}
                </p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Loading state -->
        <div *ngIf="!product" class="flex justify-center items-center h-64">
          <p class="text-gray-500">Loading product...</p>
        </div>
      </div>
    </div>
  `
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;

  constructor(
    private route: ActivatedRoute,
    private inventoryService: InventoryService,
    private cartService: CartService
  ) {}

  ngOnInit() {
    const productId = this.route.snapshot.params['id'];
    if (productId) {
      this.inventoryService.getProduct(productId).subscribe({
        next: (product) => {
          console.log('Loaded product:', product);
          this.product = product;
        },
        error: (error) => {
          console.error('Error loading product:', error);
        }
      });
    }
  }

  addToCart(product: Product) {
    this.cartService.addToCart(product);
  }

  addToWishlist(product: Product) {
    console.log('Add to wishlist:', product);
  }
}