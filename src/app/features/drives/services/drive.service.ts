import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Drive } from '../models/drive.model';
import { Observable } from 'rxjs/internal/Observable';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DriveService {
  private api = `${environment.apiUrl}/drives`;

  constructor(private http: HttpClient) { }

  getAllDrives(): Observable<Drive[]> {
    return this.http
      .get<{ success: boolean; message: string; data: Drive[] }>(`${this.api}/getDrives`)
      .pipe(map((res) => res.data));
  };

  getDriveById(id: string): Observable<Drive> {
    return this.http
      .get<{ success: boolean; message: string; data: Drive }>(`${this.api}/getDriveById/${id}`)
      .pipe(map((res) => res.data));
  };

  getFilteredDrives(from: string, to: string, page: number, limit: number, sortBy: string, sortOrder: 'asc' | 'desc'):
    Observable<{
      success: boolean;
      data: {
        items: Drive[];
        meta: {
          total: number;
          page: number;
          totalPages: number;
          totalKM: number;
        };
      };
    }> {

    let params = new HttpParams();

    if (from) params = params.set('from', from);
    if (to) params = params.set('to', to);
    params = params.set('page', page);
    params = params.set('limit', limit);
    params = params.set('sortBy', sortBy);
    params = params.set('sortOrder', sortOrder);
    return this.http.get<any>(`${this.api}/getFilteredDrives`, { params });
  };

  createDrive(data: any): Observable<Drive> {
    return this.http.post<Drive>(`${this.api}/createDrive`, data);
  };

  updateDrive(id: string, data: any): Observable<Drive> {
    return this.http.put<Drive>(`${this.api}/updateDrive/${id}`, data);
  };

  deleteDrive(id: string): Observable<any> {
    return this.http.delete(`${this.api}/deleteDrive/${id}`);
  };
}
