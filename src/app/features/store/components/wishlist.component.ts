import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { WishlistService } from '../../../services/wishlist.service';
import { CartService } from '../../../services/cart.service';
import { WebAuthService } from '../../../core/auth/services/web-auth.service';
import { Product } from '../../../models/product.model';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="container mx-auto p-4">
      <h1 class="text-2xl font-bold mb-4">My Wishlist</h1>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <mat-card *ngFor="let product of wishlistItems">
          <mat-card-content>
            <div class="flex justify-between">
              <div>
                <h3 class="font-bold">{{product.name}}</h3>
                <p class="text-sm text-gray-600">SKU: {{product.sku}}</p>
                <p class="mt-2">{{product.description}}</p>
                <p class="text-lg font-bold mt-2">{{product.price | currency}}</p>
              </div>
              <div class="flex flex-col gap-2">
                <button mat-icon-button color="warn" (click)="removeFromWishlist(product)">
                  <mat-icon>delete</mat-icon>
                </button>
                <button mat-icon-button color="primary" 
                        [disabled]="product.quantity === 0"
                        (click)="addToCart(product)">
                  <mat-icon>add_shopping_cart</mat-icon>
                </button>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card *ngIf="wishlistItems.length === 0" class="col-span-full">
          <mat-card-content class="text-center py-8">
            <mat-icon class="text-6xl text-gray-400">favorite_border</mat-icon>
            <p class="mt-4 text-xl text-gray-600">Your wishlist is empty</p>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `
})
export class WishlistComponent implements OnInit {
  wishlistItems: Product[] = [];
  userId: string = '';

  constructor(
    private wishlistService: WishlistService,
    private cartService: CartService,
    private authService: WebAuthService
  ) {}

  ngOnInit() {
    this.authService.getCurrentUser().subscribe(user => {
      if (user) {
        this.userId = user.id;
        this.loadWishlist();
      }
    });
  }

  loadWishlist() {
    this.wishlistService.getWishlist(this.userId).subscribe(items => {
      this.wishlistItems = items;
    });
  }

  removeFromWishlist(product: Product) {
    this.wishlistService.removeFromWishlist(this.userId, product.id).subscribe(() => {
      this.loadWishlist();
    });
  }

  addToCart(product: Product) {
    this.cartService.addToCart(product);
  }
}