import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '../../environments/environment';
import { 
  Branch, 
  BranchInventory, 
  BranchUser, 
  BranchClient,
  BranchReferee,
  BranchState,
  BranchResponse,
  BranchInventoryResponse,
  BranchUserResponse,
  BranchClientResponse,
  BranchRefereeResponse
} from '../models/branch.model';
import { Permission } from '../models/role.model';
import { PermissionService } from './permission.service';

@Injectable({
  providedIn: 'root'
})
export class BranchService {
  private readonly API_URL = environment.apiUrl;
  private stateSubject = new BehaviorSubject<BranchState>({
    inventory: [],
    users: [],
    clients: [],
    referees: []
  });

  state$ = this.stateSubject.asObservable();

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private permissionService: PermissionService
  ) {}

  // Branch Management
  getBranches(): Observable<Branch[]> {
    const url = this.permissionService.hasPermission(Permission.VIEW_ALL_BRANCHES)
      ? `${this.API_URL}/admin/branches/list.php`
      : `${this.API_URL}/branches/list.php`;

    return this.http.get<BranchResponse>(url).pipe(
      map((response: BranchResponse) => {
        if (!response.success) throw new Error(response.message);
        return response.data || [];
      }),
      catchError((error: { message?: string }) => {
        console.error('Error fetching branches:', error);
        this.snackBar.open(error.message || 'Error fetching branches', 'Close', { duration: 3000 });
        return throwError(() => error);
      })
    );
  }

  selectBranch(branch: Branch): void {
    if (!this.permissionService.hasBranchAccess(branch.id)) {
      this.snackBar.open('No access to this branch', 'Close', { duration: 3000 });
      return;
    }

    this.permissionService.setSelectedBranch(branch);
    this.loadBranchData(branch.id);
  }

  private loadBranchData(branchId: string): void {
    // Load branch inventory
    if (this.permissionService.canAccessBranchInventory(branchId)) {
      this.getBranchInventory(branchId).subscribe((inventory: BranchInventory[]) => {
        this.updateState({ inventory });
      });
    }

    // Load branch users if has permission
    if (this.permissionService.hasPermission(Permission.MANAGE_BRANCH_USERS)) {
      this.getBranchUsers(branchId).subscribe((users: BranchUser[]) => {
        this.updateState({ users });
      });
    }

    // Load branch clients if has permission
    if (this.permissionService.hasPermission(Permission.VIEW_CLIENTS)) {
      this.getBranchClients(branchId).subscribe((clients: BranchClient[]) => {
        this.updateState({ clients });
      });
    }

    // Load branch referees if has permission
    if (this.permissionService.hasPermission(Permission.VIEW_REFERRALS)) {
      this.getBranchReferees(branchId).subscribe((referees: BranchReferee[]) => {
        this.updateState({ referees });
      });
    }
  }

  // Inventory Management
  getBranchInventory(branchId: string): Observable<BranchInventory[]> {
    return this.http.get<BranchInventoryResponse>(
      `${this.API_URL}/inventory/branch/${branchId}/list.php`
    ).pipe(
      map((response: BranchInventoryResponse) => {
        if (!response.success) throw new Error(response.message);
        return response.data || [];
      }),
      catchError((error: { message?: string }) => {
        console.error('Error fetching branch inventory:', error);
        this.snackBar.open(error.message || 'Error fetching inventory', 'Close', { duration: 3000 });
        return throwError(() => error);
      })
    );
  }

  // User Management
  getBranchUsers(branchId: string): Observable<BranchUser[]> {
    return this.http.get<BranchUserResponse>(
      `${this.API_URL}/admin/branches/${branchId}/users.php`
    ).pipe(
      map((response: BranchUserResponse) => {
        if (!response.success) throw new Error(response.message);
        return response.data || [];
      }),
      catchError((error: { message?: string }) => {
        console.error('Error fetching branch users:', error);
        this.snackBar.open(error.message || 'Error fetching users', 'Close', { duration: 3000 });
        return throwError(() => error);
      })
    );
  }

  // Client Management
  getBranchClients(branchId: string): Observable<BranchClient[]> {
    return this.http.get<BranchClientResponse>(
      `${this.API_URL}/branches/${branchId}/clients.php`
    ).pipe(
      map((response: BranchClientResponse) => {
        if (!response.success) throw new Error(response.message);
        return response.data || [];
      }),
      catchError((error: { message?: string }) => {
        console.error('Error fetching branch clients:', error);
        this.snackBar.open(error.message || 'Error fetching clients', 'Close', { duration: 3000 });
        return throwError(() => error);
      })
    );
  }

  // Referee Management
  getBranchReferees(branchId: string): Observable<BranchReferee[]> {
    return this.http.get<BranchRefereeResponse>(
      `${this.API_URL}/branches/${branchId}/referees.php`
    ).pipe(
      map((response: BranchRefereeResponse) => {
        if (!response.success) throw new Error(response.message);
        return response.data || [];
      }),
      catchError((error: { message?: string }) => {
        console.error('Error fetching branch referees:', error);
        this.snackBar.open(error.message || 'Error fetching referees', 'Close', { duration: 3000 });
        return throwError(() => error);
      })
    );
  }

  // State Management
  private updateState(updates: Partial<BranchState>): void {
    this.stateSubject.next({
      ...this.stateSubject.value,
      ...updates,
      lastUpdated: new Date()
    });
  }

  getCurrentState(): BranchState {
    return this.stateSubject.value;
  }

  watchBranchInventory(): Observable<BranchInventory[]> {
    return this.state$.pipe(map((state: BranchState) => state.inventory));
  }

  watchBranchUsers(): Observable<BranchUser[]> {
    return this.state$.pipe(map((state: BranchState) => state.users));
  }

  watchBranchClients(): Observable<BranchClient[]> {
    return this.state$.pipe(map((state: BranchState) => state.clients));
  }

  watchBranchReferees(): Observable<BranchReferee[]> {
    return this.state$.pipe(map((state: BranchState) => state.referees));
  }
}
