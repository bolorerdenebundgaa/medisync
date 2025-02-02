import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AuthService } from '../../../core/auth/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

export interface InventoryTransfer {
  id: string;
  fromBranchId: string;
  toBranchId: string;
  productId: string;
  quantity: number;
  status: 'pending' | 'in_transit' | 'completed' | 'cancelled';
  notes?: string;
}

@Injectable({
  providedIn: 'root'
})
export class InventoryTransferService {
  constructor(
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  createTransfer(transfer: Partial<InventoryTransfer>): Observable<InventoryTransfer> {
    return from(
      this.authService.supabase
        .from('inventory_transfers')
        .insert(transfer)
        .select()
        .single()
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data as InventoryTransfer;
      }),
      catchError(error => {
        console.error('Error creating transfer:', error);
        this.snackBar.open('Error creating transfer', 'Close', { duration: 3000 });
        throw error;
      })
    );
  }

  getTransfers(): Observable<InventoryTransfer[]> {
    return from(
      this.authService.supabase
        .from('inventory_transfers')
        .select('*')
        .order('created_at', { ascending: false })
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data as InventoryTransfer[];
      }),
      catchError(error => {
        console.error('Error loading transfers:', error);
        this.snackBar.open('Error loading transfers', 'Close', { duration: 3000 });
        throw error;
      })
    );
  }

  processTransfer(id: string): Observable<void> {
    return from(
      this.authService.supabase.rpc('process_inventory_transfer', {
        p_transfer_id: id
      })
    ).pipe(
      map(({ error }) => {
        if (error) throw error;
        this.snackBar.open('Transfer processed successfully', 'Close', { duration: 3000 });
      }),
      catchError(error => {
        console.error('Error processing transfer:', error);
        this.snackBar.open('Error processing transfer', 'Close', { duration: 3000 });
        throw error;
      })
    );
  }
}