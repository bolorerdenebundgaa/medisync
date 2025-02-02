import { Component, OnInit } from '@angular/core';
import { Product } from '../../../models/product.model';

@Component({
  selector: 'app-pos',
  template: `
    <div class="container mx-auto p-4">
      <h1 class="text-2xl font-bold mb-4">Point of Sale</h1>
      <!-- Add your POS UI here -->
    </div>
  `
})
export class PosComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];

  ngOnInit() {
    // Initialize component
  }

  private filterProducts(value: string): void {
    const filterValue = value.toLowerCase();
    this.filteredProducts = this.products.filter((product: Product) => 
      product.name.toLowerCase().includes(filterValue) ||
      product.sku.toLowerCase().includes(filterValue)
    );
  }
}