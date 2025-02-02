import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '../../environments/environment';
import {
  PosState,
  PosItem,
  Customer,
  Referee,
  PaymentMethod,
  PosTransaction,
  SearchResult
} from '../models/pos.model';

const API_URL = environment.apiUrl;

const DEFAULT_STATE: PosState = {
  items: [],
  vatPercentage: 10, // Default VAT percentage
  referralPercentage: 5, // Default referral commission
  branchId: 'default-branch'
};

@Injectable({
  providedIn: 'root'
})
export class PosService {
  private stateSubject = new BehaviorSubject<PosState>(DEFAULT_STATE);
  state$ = this.stateSubject.asObservable();

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {}

  // Product Management
  searchProducts(query: string): Observable<SearchResult<PosItem>> {
    return this.http.get<SearchResult<PosItem>>(`${API_URL}/products/search.php`, {
      params: { query }
    }).pipe(
      catchError(error => {
        this.snackBar.open('Error searching products', 'Close', { duration: 3000 });
        return throwError(() => error);
      })
    );
  }

  addItem(item: PosItem): void {
    const currentState = this.stateSubject.value;
    const existingItem = currentState.items.find(i => i.product_id === item.product_id);

    if (existingItem) {
      if (existingItem.quantity + 1 > (existingItem.stock_quantity || 0)) {
        this.snackBar.open('Insufficient stock', 'Close', { duration: 3000 });
        return;
      }
      existingItem.quantity += 1;
      this.stateSubject.next({
        ...currentState,
        items: [...currentState.items]
      });
    } else {
      if (item.stock_quantity && item.quantity > item.stock_quantity) {
        this.snackBar.open('Insufficient stock', 'Close', { duration: 3000 });
        return;
      }
      this.stateSubject.next({
        ...currentState,
        items: [...currentState.items, { ...item, quantity: 1 }]
      });
    }
  }

  updateItemQuantity(productId: string, quantity: number): void {
    const currentState = this.stateSubject.value;
    const item = currentState.items.find(i => i.product_id === productId);

    if (item) {
      if (quantity > (item.stock_quantity || 0)) {
        this.snackBar.open('Insufficient stock', 'Close', { duration: 3000 });
        return;
      }
      item.quantity = quantity;
      this.stateSubject.next({
        ...currentState,
        items: [...currentState.items]
      });
    }
  }

  removeItem(productId: string): void {
    const currentState = this.stateSubject.value;
    this.stateSubject.next({
      ...currentState,
      items: currentState.items.filter(item => item.product_id !== productId)
    });
  }

  // Customer Management
  searchCustomers(query: string): Observable<SearchResult<Customer>> {
    return this.http.get<SearchResult<Customer>>(`${API_URL}/admin/customers/search.php`, {
      params: { query }
    }).pipe(
      catchError(error => {
        this.snackBar.open('Error searching customers', 'Close', { duration: 3000 });
        return throwError(() => error);
      })
    );
  }

  setCustomer(customer: Customer | undefined): void {
    this.stateSubject.next({
      ...this.stateSubject.value,
      selectedCustomer: customer
    });
  }

  // Referee Management
  searchReferees(query: string): Observable<SearchResult<Referee>> {
    return this.http.get<SearchResult<Referee>>(`${API_URL}/admin/referees/search.php`, {
      params: { query }
    }).pipe(
      catchError(error => {
        this.snackBar.open('Error searching referees', 'Close', { duration: 3000 });
        return throwError(() => error);
      })
    );
  }

  setReferee(referee: Referee | undefined): void {
    this.stateSubject.next({
      ...this.stateSubject.value,
      selectedReferee: referee
    });
  }

  // Payment Methods
  getPaymentMethods(): Observable<PaymentMethod[]> {
    return this.http.get<SearchResult<PaymentMethod>>(`${API_URL}/pos/payment-methods.php`).pipe(
      map(response => response.data),
      catchError(error => {
        this.snackBar.open('Error loading payment methods', 'Close', { duration: 3000 });
        return throwError(() => error);
      })
    );
  }

  setPaymentMethod(method: PaymentMethod): void {
    this.stateSubject.next({
      ...this.stateSubject.value,
      paymentMethod: method
    });
  }

  // Transaction Processing
  createTransaction(): Observable<{ success: boolean; message: string }> {
    const state = this.stateSubject.value;
    
    if (!state.items.length) {
      return throwError(() => new Error('No items in cart'));
    }

    if (!state.paymentMethod) {
      return throwError(() => new Error('Payment method not selected'));
    }

    const subtotal = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const vatAmount = (subtotal * state.vatPercentage) / 100;
    const referralAmount = state.selectedReferee ? 
      (subtotal * state.referralPercentage) / 100 : 0;

    const transaction: PosTransaction = {
      items: state.items,
      customer_id: state.selectedCustomer?.id,
      referee_id: state.selectedReferee?.id,
      payment_method: state.paymentMethod.id,
      subtotal,
      vat_amount: vatAmount,
      referral_amount: referralAmount,
      total_amount: subtotal + vatAmount,
      branch_id: state.branchId
    };

    return this.http.post<{ success: boolean; message: string }>(
      `${API_URL}/pos/create-sale.php`,
      transaction
    ).pipe(
      tap(response => {
        if (response.success) {
          this.resetState();
          this.snackBar.open('Transaction completed successfully', 'Close', { duration: 3000 });
        }
      }),
      catchError(error => {
        this.snackBar.open(error.error?.message || 'Transaction failed', 'Close', { duration: 3000 });
        return throwError(() => error);
      })
    );
  }

  // State Management
  resetState(): void {
    this.stateSubject.next(DEFAULT_STATE);
  }

  getSubtotal(): number {
    return this.stateSubject.value.items.reduce(
      (sum, item) => sum + (item.price * item.quantity),
      0
    );
  }

  getVatAmount(): number {
    return (this.getSubtotal() * this.stateSubject.value.vatPercentage) / 100;
  }

  getReferralAmount(): number {
    return this.stateSubject.value.selectedReferee ?
      (this.getSubtotal() * this.stateSubject.value.referralPercentage) / 100 : 0;
  }

  getTotalAmount(): number {
    return this.getSubtotal() + this.getVatAmount();
  }
}
