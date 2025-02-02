import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { Product } from '../../models/product.model';
import { InventoryService } from '../../services/inventory.service';
import { CartService } from '../../services/cart.service';
import { ProductCardComponent } from './product-card.component';

@Component({
  selector: 'app-store',
  standalone: true,
  imports: [
    CommonModule, 
    MatCardModule, 
    MatButtonModule,
    MatSnackBarModule,
    ProductCardComponent
  ],
  template: `
    <div class="container mx-auto p-4">
      <h1 class="text-2xl font-bold mb-4">Wellness Products</h1>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <app-product-card
          *ngFor="let product of products"
          [product]="product"
          (onAddToCart)="addToCart($event)"
          (onWishlist)="addToWishlist($event)">
        </app-product-card>
      </div>
    </div>
  `
})
export class StoreComponent implements OnInit {
  products: Product[] = [];

  constructor(
    private inventoryService: InventoryService,
    private cartService: CartService
  ) {}

  ngOnInit() {
    this.inventoryService.getProducts('default-branch')
      .subscribe(products => this.products = products);
  }

  addToCart(product: Product) {
    this.cartService.addToCart(product);
  }

  addToWishlist(product: Product) {
    // TODO: Implement wishlist functionality
    console.log('Add to wishlist:', product);
  }
}