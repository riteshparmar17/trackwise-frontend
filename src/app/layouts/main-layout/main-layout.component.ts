import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbCollapseModule, NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { ToastComponent } from '../../shared/components/toast/toast.component';
import { SettingsService } from '../../features/settings/services/settings.service';
import { filter } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-main-layout',
  imports: [FormsModule, ReactiveFormsModule, CommonModule, RouterModule, NgbCollapseModule, NgbDropdownModule, ToastComponent],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css'
})
export class MainLayoutComponent {
  isNavbarCollapsed = true;
  currentUser = {
    firstName: 'Ritesh',
    email: 'ritesh@example.com'
  };
  loading: boolean = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private settingsService: SettingsService
  ) { 
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.isNavbarCollapsed = true;
      });
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.loading = true;
    this.settingsService
      .getProfile()
      .subscribe({
        next: (res: any) => {
          this.currentUser.firstName = res?.data.name
          this.currentUser.email = res?.data.email;
          this.loading = false;
        },
        error: (err) => {
          this.loading = false;
        }
      });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
