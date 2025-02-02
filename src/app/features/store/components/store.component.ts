import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { Product } from '../../../models/product.model';
import { InventoryService } from '../../../services/inventory.service';
import { CartService } from '../../../services/cart.service';
import { CategoryService } from '../../../services/category.service';
import { ProductCardComponent } from './product-card.component';

@Component({
  selector: 'app-store',
  standalone: true,
  imports: [
    CommonModule, 
    MatCardModule, 
    MatButtonModule,
    MatTabsModule,
    ProductCardComponent
  ],
  template: `
    <div class="container mx-auto p-4">
      <mat-tab-group>
        <mat-tab label="All Products">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <app-product-card
              *ngFor="let product of products"
              [product]="product"
              (onAddToCart)="addToCart($event)"
              (onWishlist)="addToWishlist($event)">
            </app-product-card>
          </div>
        </mat-tab>
        <mat-tab *ngFor="let category of categories" [label]="category.name">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <app-product-card
              *ngFor="let product of getProductsByCategory(category.id)"
              [product]="product"
              (onAddToCart)="addToCart($event)"
              (onWishlist)="addToWishlist($event)">
            </app-product-card>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `
})
export class StoreComponent implements OnInit {
  products: Product[] = [];
  categories: any[] = [];

  constructor(
    private inventoryService: InventoryService,
    private cartService: CartService,
    private categoryService: CategoryService
  ) {}

  ngOnInit() {
    this.loadProducts();
    this.loadCategories();
  }

  loadProducts() {
    this.inventoryService.getProducts().subscribe({
      next: (products) => {
        console.log('Loaded products:', products);
        this.products = products;
      },
      error: (error) => {
        console.error('Error loading products:', error);
      }
    });
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        console.log('Loaded categories:', categories);
        this.categories = categories;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      }
    });
  }

  getProductsByCategory(categoryId: string): Product[] {
    return this.products.filter(product => product.category_id === categoryId);
  }

  addToCart(product: Product) {
    this.cartService.addToCart(product);
  }

  addToWishlist(product: Product) {
    console.log('Add to wishlist:', product);
  }
}