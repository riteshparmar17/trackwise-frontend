import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LookupService {
  private api = `${environment.apiUrl}/lookups`;

  constructor(private http: HttpClient) { }

  getLookupsByType(type: string): Observable<any> {
    return this.http.get(`${this.api}?type=${type}`);
  }

  createLookup(type: string, name: string): Observable<any> {
    return this.http.post(`${this.api}`, { type, name });
  }

  updateLookup(id: string, name: string): Observable<any> {
    return this.http.put(`${this.api}/${id}`, { name });
  }

  deleteLookup(id: string): Observable<any> {
    return this.http.delete(`${this.api}/${id}`);
  }
}
