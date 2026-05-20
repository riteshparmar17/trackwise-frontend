import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private api = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) { }

  register(data: any) {
    return this.http.post(`${this.api}/register`, data);
  }

  login(data: any) {
    return this.http.post(`${this.api}/login`, data);
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  forgotPassword(data: any) {
    return this.http.post(`${this.api}/forgot-password`, data);
  }

  resetPassword(data: any) {
    return this.http.post(`${this.api}/reset-password`, data);
  }

  saveToken(res: any) {
    localStorage.setItem('access_token', res.data.accessToken);
    localStorage.setItem('refresh_token', res.data.refreshToken);
  }

  getAccessToken() {
    return localStorage.getItem('access_token');
  }

  getRefreshToken() {
    return localStorage.getItem('refresh_token');
  }

  isLoggedIn() {
    return !!this.getAccessToken();
  }

  verifyEmail(token: string) {
    return this.http.get(`${this.api}/verify-email`, { params: { token } });
  }

  resendVerification(email: string) {
    return this.http.post(`${this.api}/resend-verification`, { email });
  }

}
