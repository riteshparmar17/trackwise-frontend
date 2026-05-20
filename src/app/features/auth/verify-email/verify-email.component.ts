import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './verify-email.component.html',
  styleUrl: './verify-email.component.css'
})
export class VerifyEmailComponent {

  view: 'loading' | 'success' | 'error' | 'resend' = 'loading';
  successMessage: string = '';
  error: string = '';  
  form: FormGroup;
    
  constructor(
    private auth: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  get email() {
    return this.form.get('email');
  }

  ngOnInit() { 
    const token = this.route.snapshot.queryParamMap.get('token');
    this.verifyEmail(token);
  }

  verifyEmail(token: string | null) {
    if (!token) {
      this.view = 'error';
      this.error = 'Invalid verification link.';
      return;
    }

    this.auth.verifyEmail(token).subscribe({
      next: (res: any) => {
        this.view = 'success';
        this.successMessage = res.message ||'Email verified successfully! Redirecting to login...';
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err) => {
        this.view = 'error';
        this.error = err?.error?.message || 'Verification failed or expired.';
      }
    });
  }

  showResendForm() { 
    this.error = '';
    this.view = 'resend';
  }

  resend() {
    this.error = '';
    this.successMessage = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const email = this.form.value.email as string;

    this.auth.resendVerification(email).subscribe({
      next: (res: any) => {
        this.successMessage =  res.message || 'Verification email sent successfully!';
        this.error = '';
        this.view = 'success';
        setTimeout(() => this.router.navigate(['/login']), 3000);
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to resend email';
      }
    });
  }
}
