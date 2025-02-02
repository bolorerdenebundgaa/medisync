import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '../../environments/environment';
import {
  PaymentMethodConfig,
  PaymentMethodState,
  PaymentMethodUpdateRequest,
  PaymentMethodResponse,
  PaymentMethodType
} from '../models/payment-method.model';

@Injectable({
  providedIn: 'root'
})
export class PaymentMethodService {
  private readonly API_URL = environment.apiUrl;
  private stateSubject = new BehaviorSubject<PaymentMethodState>({
    methods: [],
    lastUpdated: new Date()
  });

  state$ = this.stateSubject.asObservable();

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {
    this.loadPaymentMethods();
  }

  private loadPaymentMethods(): void {
    this.http.get<PaymentMethodResponse>(`${this.API_URL}/admin/payment-methods/list.php`)
      .pipe(
        tap(response => {
          if (response.success && response.data) {
            this.stateSubject.next({
              methods: response.data,
              lastUpdated: new Date()
            });
          }
        }),
        catchError(error => {
          console.error('Error loading payment methods:', error);
          this.snackBar.open('Error loading payment methods', 'Close', { duration: 3000 });
          return throwError(() => error);
        })
      ).subscribe();
  }

  getEnabledMethods(): Observable<PaymentMethodConfig[]> {
    return this.state$.pipe(
      map(state => state.methods.filter(method => method.enabled))
    );
  }

  updateMethod(request: PaymentMethodUpdateRequest): Observable<PaymentMethodResponse> {
    return this.http.post<PaymentMethodResponse>(
      `${this.API_URL}/admin/payment-methods/update.php`,
      request
    ).pipe(
      tap(response => {
        if (response.success && response.data) {
          const currentState = this.stateSubject.value;
          const updatedMethods = currentState.methods.map(method =>
            method.id === request.methodId
              ? { ...method, ...request.updates }
              : method
          );
          this.stateSubject.next({
            ...currentState,
            methods: updatedMethods,
            lastUpdated: new Date()
          });
          this.snackBar.open('Payment method updated successfully', 'Close', { duration: 3000 });
        }
      }),
      catchError(error => {
        console.error('Error updating payment method:', error);
        this.snackBar.open(error.error?.message || 'Error updating payment method', 'Close', { duration: 3000 });
        return throwError(() => error);
      })
    );
  }

  addMethod(method: Omit<PaymentMethodConfig, 'id'>): Observable<PaymentMethodResponse> {
    return this.http.post<PaymentMethodResponse>(
      `${this.API_URL}/admin/payment-methods/create.php`,
      method
    ).pipe(
      tap(response => {
        if (response.success && response.data) {
          const currentState = this.stateSubject.value;
          this.stateSubject.next({
            ...currentState,
            methods: [...currentState.methods, ...response.data],
            lastUpdated: new Date()
          });
          this.snackBar.open('Payment method added successfully', 'Close', { duration: 3000 });
        }
      }),
      catchError(error => {
        console.error('Error adding payment method:', error);
        this.snackBar.open(error.error?.message || 'Error adding payment method', 'Close', { duration: 3000 });
        return throwError(() => error);
      })
    );
  }

  deleteMethod(methodId: string): Observable<PaymentMethodResponse> {
    return this.http.delete<PaymentMethodResponse>(
      `${this.API_URL}/admin/payment-methods/delete.php?id=${methodId}`
    ).pipe(
      tap(response => {
        if (response.success) {
          const currentState = this.stateSubject.value;
          this.stateSubject.next({
            ...currentState,
            methods: currentState.methods.filter(method => method.id !== methodId),
            lastUpdated: new Date()
          });
          this.snackBar.open('Payment method deleted successfully', 'Close', { duration: 3000 });
        }
      }),
      catchError(error => {
        console.error('Error deleting payment method:', error);
        this.snackBar.open(error.error?.message || 'Error deleting payment method', 'Close', { duration: 3000 });
        return throwError(() => error);
      })
    );
  }

  setDefaultMethod(methodId: string): Observable<PaymentMethodResponse> {
    return this.http.post<PaymentMethodResponse>(
      `${this.API_URL}/admin/payment-methods/set-default.php`,
      { methodId }
    ).pipe(
      tap(response => {
        if (response.success) {
          const currentState = this.stateSubject.value;
          this.stateSubject.next({
            ...currentState,
            defaultMethod: methodId,
            lastUpdated: new Date()
          });
          this.snackBar.open('Default payment method updated', 'Close', { duration: 3000 });
        }
      }),
      catchError(error => {
        console.error('Error setting default payment method:', error);
        this.snackBar.open(error.error?.message || 'Error setting default payment method', 'Close', { duration: 3000 });
        return throwError(() => error);
      })
    );
  }

  getAvailablePaymentTypes(): PaymentMethodType[] {
    return Object.values(PaymentMethodType);
  }
}
