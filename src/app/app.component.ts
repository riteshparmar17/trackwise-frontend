import { Component, HostListener } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from './services/auth.service';
import { catchError, EMPTY, finalize } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'trackwise-frontend';
  private sessionCheckInProgress = false;
  private readonly inactivityLimit = 30 * 60 * 1000;
  private readonly lastActivityKey = "trackwise_last_activity";

  constructor(
    private authService: AuthService,
    private router: Router) { }

  ngOnInit(): void {
    this.checkSession();
  }

  @HostListener('document:visibilitychange')
  onVisibilityChange(): void {
    if (document.visibilityState === 'visible') {
      this.checkSession();
    }
  }

  @HostListener('document:click')
  @HostListener('document:keydown')
  @HostListener('document:touchstart')
  onUserActivity(): void {
    if (document.visibilityState === 'visible' && this.authService.getAccessToken()) {
      const lastActivity = this.getLastActivity();
      if (lastActivity && Date.now() - lastActivity >= this.inactivityLimit) {
        this.expireSession();
        return;
      }
      localStorage.setItem(this.lastActivityKey, Date.now().toString());
    }
  }

  checkSession(): void {
    const accessToken = this.authService.getAccessToken();
    const refreshToken = this.authService.getRefreshToken();
    if (!accessToken && !refreshToken) {
      localStorage.removeItem(this.lastActivityKey);
      return;
    }

    const lastActivity = this.getLastActivity();
    if (!lastActivity) {
      localStorage.setItem(this.lastActivityKey, Date.now().toString());
    } else if (Date.now() - lastActivity >= this.inactivityLimit) {
      this.expireSession();
      return;
    }

    if (accessToken && !this.authService.isAccessTokenExpired()) {
      return
    }

    if (!refreshToken) {
      this.expireSession();
    }

    if (this.sessionCheckInProgress) {
      return;
    }

    this.sessionCheckInProgress = true;
    this.authService.refreshAccessToken()
      .pipe(
        catchError(error => {
          if (error.status === 401) {
            this.expireSession();
          }
          return EMPTY;
        }),
        finalize(() => {
          this.sessionCheckInProgress = false;
        })
      ).subscribe();
  }

  private getLastActivity(): number {
    const value = localStorage.getItem(this.lastActivityKey);
    const timestamp = Number(value);

    return value && Number.isFinite(timestamp) && timestamp > 0 ? timestamp : 0;
  }

  expireSession(): void {
    this.authService.logout();
    localStorage.removeItem(this.lastActivityKey);
    void this.router.navigate(['/login'], { queryParams: { sessionExpires: 'true' }, replaceUrl: true });
  }
}
