import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Client } from '../models/client.model';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private readonly API_URL = `${environment.apiUrl}/clients`;

  constructor(private http: HttpClient) {}

  searchClients(term: string): Observable<Client[]> {
    const params = new HttpParams().set('search', term);
    return this.http.get<{success: boolean; data: Client[]}>(`${this.API_URL}/search`, { params })
      .pipe(map(response => response.data));
  }

  getClient(id: string): Observable<Client> {
    return this.http.get<{success: boolean; data: Client}>(`${this.API_URL}/${id}`)
      .pipe(map(response => response.data));
  }

  createClient(client: Partial<Client>): Observable<Client> {
    return this.http.post<{success: boolean; data: Client}>(`${this.API_URL}/create`, client)
      .pipe(map(response => response.data));
  }

  updateClient(id: string, updates: Partial<Client>): Observable<Client> {
    return this.http.post<{success: boolean; data: Client}>(`${this.API_URL}/update`, { id, updates })
      .pipe(map(response => response.data));
  }

  getClientPrescriptions(id: string): Observable<any[]> {
    return this.http.get<{success: boolean; data: any[]}>(`${this.API_URL}/${id}/prescriptions`)
      .pipe(map(response => response.data));
  }
}
