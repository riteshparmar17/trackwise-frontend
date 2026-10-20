import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { catchError, finalize, Observable, map, shareReplay, throwError } from 'rxjs';

interface AuthResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface TokenResponse {
  accessToken: string;
  refreshToken?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private api = `${environment.apiUrl}/auth`;
  private refreshRequest$: Observable<string> | null = null;

  constructor(private http: HttpClient) { }

  register(data: any) {
    return this.http.post(`${this.api}/register`, data);
  }

  login(data: any) {
    return this.http.post<AuthResponse<any>>(`${this.api}/login`, data);
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('trackwise_last_activity');
  }

  forgotPassword(data: any) {
    return this.http.post(`${this.api}/forgot-password`, data);
  }

  resetPassword(data: any) {
    return this.http.post(`${this.api}/reset-password`, data);
  }

  changePassword(data: any) {
    return this.http.patch(`${this.api}/change-password`, data);
  }

  saveToken(res: any) {
    const accessToken = res?.data?.accessToken;
    const refreshToken = res?.data?.refreshToken;
    if (accessToken) {
      localStorage.setItem('access_token', accessToken);
    }
    if (refreshToken) {
      localStorage.setItem('refresh_token', refreshToken);
    }
    if (accessToken && refreshToken) {
      localStorage.setItem('trackwise_last_activity', Date.now().toString());
    }
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

  isAccessTokenExpired(): boolean {
    const token = this.getAccessToken();
    if (!token) {
      return true;
    }
    try {
      const payload = token.split('.')[1];
      if (!payload) {
        return true;
      }
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const paddedBase64 = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
      const decoded = JSON.parse(atob(paddedBase64));
      if (typeof decoded.exp !== 'number') {
        return true;
      }
      const expiresAt = decoded.exp * 1000;
      const safeWindow = 60 * 1000;
      return Date.now() >= expiresAt - safeWindow;
    } catch (error) {
      return true;
    }
  }

  refreshAccessToken(): Observable<string> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      this.logout();
      return throwError(() => new Error('No refresh token available.'));
    }

    if (this.refreshRequest$) {
      return this.refreshRequest$;
    }

    this.refreshRequest$ = this.http.post<AuthResponse<TokenResponse>>(`${this.api}/refresh-token`, { refreshToken })
      .pipe(
        map(res => {
          const accessToken = res?.data?.accessToken;
          if (!accessToken) {
            throw new Error('The server did not return an access token.');
          }
          localStorage.setItem('access_token', accessToken);
          return accessToken;
        }),
        catchError(error => {
          if (error.status === 401) {
            this.logout();
          }
          return throwError(() => error);
        }),
        finalize(() => { this.refreshRequest$ = null }),
        shareReplay({
          bufferSize: 1,
          refCount: false
        })
      );
    return this.refreshRequest$;
  }


  verifyEmail(token: string) {
    return this.http.get(`${this.api}/verify-email`, { params: { token } });
  }

  resendVerification(email: string) {
    return this.http.post(`${this.api}/resend-verification`, { email });
  }

}
