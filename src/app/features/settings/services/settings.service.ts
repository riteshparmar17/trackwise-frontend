import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private api = `${environment.apiUrl}/settings`;

  constructor(private http: HttpClient) { }

  getProfile() {
    return this.http.get(`${this.api}/profile`);
  }

  updateProfile(payload: { name: string }) {
    return this.http.put(`${this.api}/profile`, payload);
  }

}
