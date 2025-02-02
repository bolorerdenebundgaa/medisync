import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface UserWithRoles extends User {
  roles: string[];
  permissions: string[];
  branches: string[];
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  branch_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserResponse {
  success: boolean;
  message?: string;
  data: UserWithRoles[] | UserWithRoles;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly API_URL = `${environment.apiUrl}/admin/users`;
  
  private usersSubject = new BehaviorSubject<UserWithRoles[]>([]);
  users$ = this.usersSubject.asObservable();

  constructor(private http: HttpClient) {}

  getUsers(): Observable<UserWithRoles[]> {
    return this.http.get<UserResponse>(`${this.API_URL}/list.php`).pipe(
      map((response: UserResponse) => {
        if (!response.success) throw new Error(response.message);
        const users = Array.isArray(response.data) ? response.data : [response.data];
        this.usersSubject.next(users);
        return users;
      })
    );
  }

  getUser(id: string): Observable<UserWithRoles> {
    return this.http.get<UserResponse>(`${this.API_URL}/read.php?id=${id}`).pipe(
      map((response: UserResponse) => {
        if (!response.success) throw new Error(response.message);
        const user = Array.isArray(response.data) ? response.data[0] : response.data;
        if (!user) throw new Error('User not found');
        return user;
      })
    );
  }

  createUser(user: Omit<User, 'id' | 'created_at' | 'updated_at'>): Observable<UserWithRoles> {
    return this.http.post<UserResponse>(`${this.API_URL}/create.php`, user).pipe(
      map((response: UserResponse) => {
        if (!response.success) throw new Error(response.message);
        const newUser = Array.isArray(response.data) ? response.data[0] : response.data;
        if (!newUser) throw new Error('Failed to create user');
        const users = this.usersSubject.value;
        this.usersSubject.next([...users, newUser]);
        return newUser;
      })
    );
  }

  updateUser(id: string, updates: Partial<User>): Observable<UserWithRoles> {
    return this.http.post<UserResponse>(`${this.API_URL}/update.php`, { id, ...updates }).pipe(
      map((response: UserResponse) => {
        if (!response.success) throw new Error(response.message);
        const updatedUser = Array.isArray(response.data) ? response.data[0] : response.data;
        if (!updatedUser) throw new Error('Failed to update user');
        const users = this.usersSubject.value;
        const index = users.findIndex(u => u.id === id);
        if (index !== -1) {
          users[index] = updatedUser;
          this.usersSubject.next([...users]);
        }
        return updatedUser;
      })
    );
  }

  updateUserRole(id: string, role: string): Observable<UserWithRoles> {
    return this.http.post<UserResponse>(`${this.API_URL}/update-role.php`, { id, role }).pipe(
      map((response: UserResponse) => {
        if (!response.success) throw new Error(response.message);
        const updatedUser = Array.isArray(response.data) ? response.data[0] : response.data;
        if (!updatedUser) throw new Error('Failed to update user role');
        const users = this.usersSubject.value;
        const index = users.findIndex(u => u.id === id);
        if (index !== -1) {
          users[index] = updatedUser;
          this.usersSubject.next([...users]);
        }
        return updatedUser;
      })
    );
  }

  deleteUser(id: string): Observable<void> {
    return this.http.post<{success: boolean; message?: string}>(`${this.API_URL}/delete.php`, { id }).pipe(
      map(response => {
        if (!response.success) throw new Error(response.message);
        const users = this.usersSubject.value;
        this.usersSubject.next(users.filter(u => u.id !== id));
      })
    );
  }

  resetPassword(id: string): Observable<void> {
    return this.http.post<{success: boolean; message?: string}>(`${this.API_URL}/reset-password.php`, { id }).pipe(
      map(response => {
        if (!response.success) throw new Error(response.message);
      })
    );
  }
}
