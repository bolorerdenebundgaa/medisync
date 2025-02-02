[Previous content remains the same...]

## Store Components

### ProductListComponent
```typescript
// src/app/components/store/product-list.component.ts
@Component({
  selector: 'app-product-list',
  standalone: true
})
```
Features:
- Grid/list view toggle
- Category filtering
- Search functionality
- Pagination
- Sort options
- Quick add to cart

### ProductDetailsComponent
```typescript
// src/app/components/store/product-details.component.ts
@Component({
  selector: 'app-product-details',
  standalone: true
})
```
Features:
- Product images
- Detailed description
- Price information
- Stock availability
- Add to cart/wishlist
- Related products

### CartComponent
```typescript
// src/app/components/store/cart.component.ts
@Component({
  selector: 'app-cart',
  standalone: true
})
```
Features:
- Item list with quantities
- Price calculations
- VAT display
- Quantity adjustments
- Remove items
- Checkout process

### CheckoutComponent
```typescript
// src/app/components/store/checkout.component.ts
@Component({
  selector: 'app-checkout',
  standalone: true
})
```
Features:
- Shipping address
- Payment method selection
- Order summary
- Terms acceptance
- Order placement

## Inventory Components

### InventoryManagementComponent
```typescript
// src/app/components/inventory/inventory-management.component.ts
@Component({
  selector: 'app-inventory-management',
  standalone: true
})
```
Features:
- Stock levels view
- Low stock alerts
- Add/remove stock
- Transfer between branches
- Transaction history
- Batch operations

### ProductManagementComponent
```typescript
// src/app/components/admin/product-management.component.ts
@Component({
  selector: 'app-product-management',
  standalone: true
})
```
Features:
- Product CRUD operations
- Category management
- Image upload
- Price management
- Stock alerts config
- Bulk operations

## Store Services

### ProductService
```typescript
// src/app/services/product.service.ts
@Injectable({
  providedIn: 'root'
})
```
Methods:
```typescript
getProducts(params: ProductSearchParams): Observable<PagedResult<Product>>
getProduct(id: string): Observable<Product>
createProduct(product: ProductCreateRequest): Observable<Product>
updateProduct(id: string, updates: Partial<Product>): Observable<Product>
deleteProduct(id: string): Observable<void>
```

### CartService
```typescript
// src/app/services/cart.service.ts
@Injectable({
  providedIn: 'root'
})
```
Methods:
```typescript
getCart(): Observable<Cart>
addToCart(productId: string, quantity: number): Observable<CartItem>
updateQuantity(itemId: string, quantity: number): Observable<CartItem>
removeFromCart(itemId: string): Observable<void>
clearCart(): Observable<void>
```

### OrderService
```typescript
// src/app/services/order.service.ts
@Injectable({
  providedIn: 'root'
})
```
Methods:
```typescript
placeOrder(order: OrderCreateRequest): Observable<Order>
getOrders(): Observable<Order[]>
getOrder(id: string): Observable<Order>
cancelOrder(id: string): Observable<Order>
```

### WishlistService
```typescript
// src/app/services/wishlist.service.ts
@Injectable({
  providedIn: 'root'
})
```
Methods:
```typescript
getWishlist(): Observable<WishlistItem[]>
addToWishlist(productId: string): Observable<WishlistItem>
removeFromWishlist(productId: string): Observable<void>
```

## Store Models

### Product Models
```typescript
// src/app/models/product.model.ts
export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  category_id: string;
  price: number;
  image_url: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductSearchParams {
  category_id?: string;
  search?: string;
  page?: number;
  limit?: number;
  sort?: 'name' | 'price' | 'created_at';
  order?: 'asc' | 'desc';
}
```

### Cart Models
```typescript
// src/app/models/cart.model.ts
export interface Cart {
  id: string;
  items: CartItem[];
  subtotal: number;
  vat_amount: number;
  total: number;
}

export interface CartItem {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}
```

### Order Models
```typescript
// src/app/models/order.model.ts
export interface Order {
  id: string;
  user_id: string;
  branch_id: string;
  status: OrderStatus;
  subtotal: number;
  vat_amount: number;
  shipping_fee: number;
  total_amount: number;
  shipping_address: string;
  payment_method: string;
  payment_status: PaymentStatus;
  items: OrderItem[];
  created_at: string;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'completed' | 'failed';
```

## Store State Management

### Cart State
```typescript
// src/app/services/cart.service.ts
private cartSubject = new BehaviorSubject<Cart | null>(null);
cart$ = this.cartSubject.asObservable();

private itemCountSubject = new BehaviorSubject<number>(0);
itemCount$ = this.itemCountSubject.asObservable();
```

### Product Filtering
```typescript
// src/app/services/product.service.ts
private filterSubject = new BehaviorSubject<ProductSearchParams>({});
filter$ = this.filterSubject.asObservable();

private productsSubject = new BehaviorSubject<PagedResult<Product>>({
  items: [],
  total: 0,
  page: 1,
  limit: 10
});
products$ = this.productsSubject.asObservable();
```

## Store Routes
```typescript
// src/app/app.routes.ts
const routes: Routes = [
  {
    path: 'store',
    children: [
      {
        path: '',
        component: ProductListComponent
      },
      {
        path: 'product/:id',
        component: ProductDetailsComponent
      },
      {
        path: 'cart',
        component: CartComponent
      },
      {
        path: 'checkout',
        component: CheckoutComponent,
        canActivate: [AuthGuard]
      }
    ]
  }
];
```

[Previous content remains the same...]
