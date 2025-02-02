import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '../../environments/environment';
import { BranchInventory } from '../models/branch.model';

export interface InventoryResponse {
  success: boolean;
  data?: BranchInventory[];
  message?: string;
}

export interface TransactionHistoryResponse {
  success: boolean;
  data?: {
    transactions: InventoryTransaction[];
    current_inventory: BranchInventory[];
  };
  message?: string;
}

export interface InventoryTransaction {
  id: string;
  branch_id: string;
  product_id: string;
  product_name: string;
  transaction_type: 'in' | 'out' | 'transfer' | 'adjustment';
  quantity: number;
  reference_type: string;
  reference_id: string;
  notes?: string;
  created_by: string;
  created_by_name: string;
  created_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private readonly API_URL = environment.apiUrl;
  private inventorySubject = new BehaviorSubject<BranchInventory[]>([]);
  inventory$ = this.inventorySubject.asObservable();

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {}

  getBranchInventory(branchId: string): Observable<BranchInventory[]> {
    return this.http.get<InventoryResponse>(
      `${this.API_URL}/admin/inventory/branch/list.php?branch_id=${branchId}`
    ).pipe(
      map((response: InventoryResponse) => {
        if (!response.success) throw new Error(response.message);
        this.inventorySubject.next(response.data || []);
        return response.data || [];
      }),
      catchError((error: { message?: string }) => {
        console.error('Error fetching branch inventory:', error);
        this.snackBar.open(error.message || 'Error fetching inventory', 'Close', { duration: 3000 });
        return throwError(() => error);
      })
    );
  }

  addStock(branchId: string, productId: string, quantity: number, notes?: string): Observable<BranchInventory[]> {
    return this.http.post<InventoryResponse>(
      `${this.API_URL}/admin/inventory/branch/add-stock.php`,
      {
        branch_id: branchId,
        product_id: productId,
        quantity,
        notes
      }
    ).pipe(
      map((response: InventoryResponse) => {
        if (!response.success) throw new Error(response.message);
        this.inventorySubject.next(response.data || []);
        this.snackBar.open('Stock added successfully', 'Close', { duration: 3000 });
        return response.data || [];
      }),
      catchError((error: { message?: string }) => {
        console.error('Error adding stock:', error);
        this.snackBar.open(error.message || 'Error adding stock', 'Close', { duration: 3000 });
        return throwError(() => error);
      })
    );
  }

  removeStock(branchId: string, productId: string, quantity: number, notes?: string): Observable<BranchInventory[]> {
    return this.http.post<InventoryResponse>(
      `${this.API_URL}/admin/inventory/branch/remove-stock.php`,
      {
        branch_id: branchId,
        product_id: productId,
        quantity,
        notes
      }
    ).pipe(
      map((response: InventoryResponse) => {
        if (!response.success) throw new Error(response.message);
        this.inventorySubject.next(response.data || []);
        this.snackBar.open('Stock removed successfully', 'Close', { duration: 3000 });
        return response.data || [];
      }),
      catchError((error: { message?: string }) => {
        console.error('Error removing stock:', error);
        this.snackBar.open(error.message || 'Error removing stock', 'Close', { duration: 3000 });
        return throwError(() => error);
      })
    );
  }

  transferStock(
    fromBranchId: string,
    toBranchId: string,
    productId: string,
    quantity: number,
    notes?: string
  ): Observable<{
    source_inventory: BranchInventory[];
    destination_inventory: BranchInventory[];
  }> {
    return this.http.post<{
      success: boolean;
      message?: string;
      data?: {
        source_inventory: BranchInventory[];
        destination_inventory: BranchInventory[];
      };
    }>(
      `${this.API_URL}/admin/inventory/branch/transfer-stock.php`,
      {
        from_branch_id: fromBranchId,
        to_branch_id: toBranchId,
        product_id: productId,
        quantity,
        notes
      }
    ).pipe(
      map((response: { 
        success: boolean;
        message?: string;
        data?: {
          source_inventory: BranchInventory[];
          destination_inventory: BranchInventory[];
        };
      }) => {
        if (!response.success) throw new Error(response.message);
        if (!response.data) throw new Error('No data received');
        
        // Update inventory if we're viewing the source branch
        const currentBranch = this.inventorySubject.value[0]?.branch_id;
        if (currentBranch === fromBranchId) {
          this.inventorySubject.next(response.data.source_inventory);
        } else if (currentBranch === toBranchId) {
          this.inventorySubject.next(response.data.destination_inventory);
        }

        this.snackBar.open('Stock transferred successfully', 'Close', { duration: 3000 });
        return response.data;
      }),
      catchError((error: { message?: string }) => {
        console.error('Error transferring stock:', error);
        this.snackBar.open(error.message || 'Error transferring stock', 'Close', { duration: 3000 });
        return throwError(() => error);
      })
    );
  }

  getTransactionHistory(
    branchId: string,
    productId?: string,
    startDate?: string,
    endDate?: string
  ): Observable<{
    transactions: InventoryTransaction[];
    current_inventory: BranchInventory[];
  }> {
    let url = `${this.API_URL}/admin/inventory/branch/transaction-history.php?branch_id=${branchId}`;
    if (productId) url += `&product_id=${productId}`;
    if (startDate) url += `&start_date=${startDate}`;
    if (endDate) url += `&end_date=${endDate}`;

    return this.http.get<TransactionHistoryResponse>(url).pipe(
      map((response: TransactionHistoryResponse) => {
        if (!response.success) throw new Error(response.message);
        if (!response.data) throw new Error('No data received');
        return response.data;
      }),
      catchError((error: { message?: string }) => {
        console.error('Error fetching transaction history:', error);
        this.snackBar.open(error.message || 'Error fetching history', 'Close', { duration: 3000 });
        return throwError(() => error);
      })
    );
  }

  getCurrentInventory(): BranchInventory[] {
    return this.inventorySubject.value;
  }

  watchInventory(): Observable<BranchInventory[]> {
    return this.inventory$;
  }
}
