import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

    const authService = inject(AuthService);
    const router = inject(Router);
    const token = authService.getAccessToken();
    const isRefreshRequest = req.url.includes('/auth/refresh-token');
    const excludedEndpoints = [
        '/auth/login',
        '/auth/register',
        '/auth/refresh-token',
        '/auth/forgot-password',
        '/auth/reset-password',
        '/auth/verify-email',
        '/auth/resend-verification'
    ];
    const isExcludedRequest = excludedEndpoints.some(endpoint => req.url.includes(endpoint));
    const authReq = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;
    return next(authReq).pipe(
        catchError(error => {
            if (!(error instanceof HttpErrorResponse) ||
                error.status !== 401 ||
                isRefreshRequest ||
                isExcludedRequest) {
                return throwError(() => error);
            }

            if (!authService.getRefreshToken()) {
                expireSession();
                return throwError(() => error);
            }

            return authService.refreshAccessToken().pipe(
                switchMap(newAccessToken => {
                    const retryRequest = req.clone({ setHeaders: { Authorization: `Bearer ${newAccessToken}` } });
                    return next(retryRequest);
                }),
                catchError(refreshError => {
                    if (refreshError.status === 401) {
                        expireSession();
                    }
                    return throwError(() => refreshError);
                })
            );
        })
    );

    function expireSession() {
        authService.logout();
        void router.navigate(['/login'], { queryParams: { sessionExpired: 'true' }, replaceUrl: true });
    }
};


