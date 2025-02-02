import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { ProductCardComponent } from './product-card.component';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { WishlistService } from '../../services/wishlist.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-store',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatGridListModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    ProductCardComponent
  ],
  template: `
    <div class="container mx-auto p-4">
      <!-- Filters -->
      <div class="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <mat-form-field>
          <mat-label>Search Products</mat-label>
          <input matInput [formControl]="searchControl" placeholder="Search...">
        </mat-form-field>

        <mat-form-field>
          <mat-label>Category</mat-label>
          <mat-select [formControl]="categoryControl">
            <mat-option value="">All Categories</mat-option>
            <mat-option *ngFor="let category of categories" [value]="category.id">
              {{category.name}}
            </mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field>
          <mat-label>Sort By</mat-label>
          <mat-select [formControl]="sortControl">
            <mat-option value="name_asc">Name (A-Z)</mat-option>
            <mat-option value="name_desc">Name (Z-A)</mat-option>
            <mat-option value="price_asc">Price (Low to High)</mat-option>
            <mat-option value="price_desc">Price (High to Low)</mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      <!-- Products Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <app-product-card
          *ngFor="let product of products"
          [product]="product"
          [isInWishlist]="isInWishlist(product.id)"
          [showWishlist]="true"
          [showStock]="true"
          [stockLevel]="getStockLevel(product.id)"
          (onAddToCart)="addToCart($event)"
          (onWishlist)="toggleWishlist($event)">
        </app-product-card>
      </div>

      <!-- Empty State -->
      <div *ngIf="products.length === 0" class="text-center py-12">
        <mat-icon class="text-6xl text-gray-400">inventory_2</mat-icon>
        <p class="text-xl text-gray-600 mt-4">No products found</p>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center">
        <mat-spinner></mat-spinner>
      </div>
    </div>
  `
})
export class StoreComponent implements OnInit {
  products: Product[] = [];
  categories: any[] = [];
  wishlistItems: Set<string> = new Set();
  loading = false;

  searchControl = new FormControl('');
  categoryControl = new FormControl('');
  sortControl = new FormControl('name_asc');

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private wishlistService: WishlistService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadWishlist();
    this.setupFilters();
  }

  private loadCategories(): void {
    // Load categories from your CategoryService
    // For now using mock data
    this.categories = [
      { id: '1', name: 'Category 1' },
      { id: '2', name: 'Category 2' }
    ];
  }

  private loadWishlist(): void {
    this.wishlistService.getWishlist().subscribe(items => {
      this.wishlistItems = new Set(items.map(item => item.product_id));
    });
  }

  private setupFilters(): void {
    // Combine all filters
    const filters$ = [
      this.searchControl.valueChanges.pipe(debounceTime(300), distinctUntilChanged()),
      this.categoryControl.valueChanges,
      this.sortControl.valueChanges
    ];

    // Subscribe to filter changes
    this.loadProducts();
  }

  private loadProducts(): void {
    this.loading = true;
    const [sort, order] = this.sortControl.value?.split('_') || ['name', 'asc'];

    this.productService.getProducts({
      search: this.searchControl.value || '',
      category_id: this.categoryControl.value || '',
      sort: sort as any,
      order: order as any
    }).subscribe({
      next: (response) => {
        this.products = response.items;
        this.loading = false;
      },
      error: () => {
        this.snackBar.open('Error loading products', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  isInWishlist(productId: string): boolean {
    return this.wishlistItems.has(productId);
  }

  getStockLevel(productId: string): number {
    // Get stock level from your inventory service
    // For now returning mock data
    return Math.floor(Math.random() * 20);
  }

  addToCart(product: Product): void {
    this.cartService.addToCart(product.id, 1).subscribe({
      next: () => {
        this.snackBar.open('Added to cart', 'Close', { duration: 3000 });
      },
      error: () => {
        this.snackBar.open('Error adding to cart', 'Close', { duration: 3000 });
      }
    });
  }

  toggleWishlist(product: Product): void {
    if (this.isInWishlist(product.id)) {
      this.wishlistService.removeFromWishlist(product.id).subscribe({
        next: () => {
          this.wishlistItems.delete(product.id);
          this.snackBar.open('Removed from wishlist', 'Close', { duration: 3000 });
        },
        error: () => {
          this.snackBar.open('Error updating wishlist', 'Close', { duration: 3000 });
        }
      });
    } else {
      this.wishlistService.addToWishlist(product.id).subscribe({
        next: () => {
          this.wishlistItems.add(product.id);
          this.snackBar.open('Added to wishlist', 'Close', { duration: 3000 });
        },
        error: () => {
          this.snackBar.open('Error updating wishlist', 'Close', { duration: 3000 });
        }
      });
    }
  }
}
