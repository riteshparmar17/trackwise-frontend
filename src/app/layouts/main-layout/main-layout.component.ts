import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbCollapseModule, NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { ToastComponent } from '../../shared/components/toast/toast.component';

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

  constructor(private router: Router, private authService: AuthService) { }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
