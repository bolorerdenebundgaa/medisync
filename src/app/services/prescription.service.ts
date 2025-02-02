import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface PrescriptionItem {
  product_id: string;
  quantity: number;
  directions: string;
}

export interface Prescription {
  id: string;
  client_id: string;
  referee_id: string;
  branch_id: string;
  items: PrescriptionItem[];
  status: 'active' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface PrescriptionCreateRequest {
  client_id: string;
  items: PrescriptionItem[];
}

export interface PrescriptionResponse {
  success: boolean;
  data: Prescription;
}

export interface PrescriptionListResponse {
  success: boolean;
  data: Prescription[];
}

@Injectable({
  providedIn: 'root'
})
export class PrescriptionService {
  private readonly API_URL = `${environment.apiUrl}/prescriptions`;

  constructor(private http: HttpClient) {}

  createPrescription(prescription: PrescriptionCreateRequest): Observable<Prescription> {
    return this.http.post<PrescriptionResponse>(`${this.API_URL}/create`, prescription)
      .pipe(map(response => response.data));
  }

  getPrescription(id: string): Observable<Prescription> {
    return this.http.get<PrescriptionResponse>(`${this.API_URL}/${id}`)
      .pipe(map(response => response.data));
  }

  updateStatus(id: string, status: Prescription['status']): Observable<Prescription> {
    return this.http.post<PrescriptionResponse>(`${this.API_URL}/update-status`, { id, status })
      .pipe(map(response => response.data));
  }

  getActivePrescriptions(clientId?: string): Observable<Prescription[]> {
    let url = `${this.API_URL}/active`;
    if (clientId) {
      url += `?client_id=${clientId}`;
    }
    return this.http.get<PrescriptionListResponse>(url)
      .pipe(map(response => response.data));
  }

  getRefereeStatistics(): Observable<any> {
    return this.http.get<{success: boolean; data: any}>(`${this.API_URL}/referee-stats`)
      .pipe(map(response => response.data));
  }

  searchPrescriptions(params: {
    client_id?: string;
    referee_id?: string;
    branch_id?: string;
    status?: Prescription['status'];
    start_date?: string;
    end_date?: string;
  }): Observable<Prescription[]> {
    return this.http.get<PrescriptionListResponse>(`${this.API_URL}/search`, { params })
      .pipe(map(response => response.data));
  }

  completePrescription(id: string): Observable<Prescription> {
    return this.http.post<PrescriptionResponse>(`${this.API_URL}/complete`, { id })
      .pipe(map(response => response.data));
  }

  cancelPrescription(id: string, reason: string): Observable<Prescription> {
    return this.http.post<PrescriptionResponse>(`${this.API_URL}/cancel`, { id, reason })
      .pipe(map(response => response.data));
  }

  getPrescriptionHistory(clientId: string): Observable<Prescription[]> {
    return this.http.get<PrescriptionListResponse>(`${this.API_URL}/history/${clientId}`)
      .pipe(map(response => response.data));
  }

  getRefereePrescriptions(): Observable<Prescription[]> {
    return this.http.get<PrescriptionListResponse>(`${this.API_URL}/referee`)
      .pipe(map(response => response.data));
  }
}
