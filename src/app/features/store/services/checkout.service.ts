import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { CartItem } from '../../../services/cart.service';

interface ShippingInfo {
  fullName: string;
  email: string;
  phone: string;
  address: string;
}

interface Order {
  items: CartItem[];
  shipping: ShippingInfo;
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {
  processOrder(order: Order): Observable<any> {
    // Simulate order processing
    console.log('Processing order:', order);
    return of({ success: true, orderId: Math.random().toString(36).substr(2, 9) });
  }
}