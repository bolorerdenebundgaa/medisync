```typescript
import { Routes } from '@angular/router';
import { StoreComponent } from './components/store.component';
import { CartComponent } from './components/cart.component';
import { CheckoutComponent } from './components/checkout.component';

export const storeRoutes: Routes = [
  { path: '', component: StoreComponent },
  { path: 'cart', component: CartComponent },
  { path: 'checkout', component: CheckoutComponent }
];
```