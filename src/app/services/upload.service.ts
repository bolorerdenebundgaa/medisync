import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '../../environments/environment';

const API_URL = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {}

  uploadImage(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('image', file);

    return this.http.post<any>(`${API_URL}/upload/image.php`, formData).pipe(
      map(response => {
        if (!response.success) throw new Error(response.message);
        return response.url;
      }),
      catchError(error => {
        console.error('Error uploading image:', error);
        this.snackBar.open('Error uploading image', 'Close', { duration: 3000 });
        throw error;
      })
    );
  }
}