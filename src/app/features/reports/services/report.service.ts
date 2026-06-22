import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ReportResponse } from '../models/report.model';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private api = `${environment.apiUrl}/reports`;

  constructor(private http: HttpClient) { }

  getDashboardReport(fromDate?: string, toDate?: string): Observable<ReportResponse> {
    let params = new HttpParams();
    if (fromDate && toDate) {
      params = params.set('fromDate', fromDate);
      params = params.set('toDate', toDate);
    }
    return this.http.get<ReportResponse>(`${this.api}/dashboard`, { params });
  }
}
