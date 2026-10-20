import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  error: string = '';
  form: FormGroup;
  showPassword: boolean = false;
  isSubmitting: boolean = false;

  constructor(
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private toastService: ToastService
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      remember: [false]
    });
  }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      if (params.get('sessionExpired') === 'true') {
        this.error = 'Your session has expired. Please log in again.';

        void this.router.navigate([], {
          relativeTo: this.route,
          queryParams: {
            sessionExpired: null
          },
          queryParamsHandling: 'merge',
          replaceUrl: true
        });
      }
    });
  }

  get email() {
    return this.form.get('email');
  }

  get password() {
    return this.form.get('password');
  }

  onSubmit() {
    if (this.isSubmitting) {
      return;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.isSubmitting = true;
    this.error = '';
    const { email, password } = this.form.value;
    this.auth.login({ email, password }).subscribe({
      next: (res: any) => {
        this.auth.saveToken(res);
        if (!this.auth.getAccessToken() || !this.auth.getRefreshToken()) {
          this.error = "Login success, but the authentication tokens could not be saved."
          this.isSubmitting = false;
          return;
        }
        this.toastService.success(`Welcome back, ${res?.data?.user?.name}`);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.error = err?.error?.message || 'Unable to log in. Please try again.';
        this.isSubmitting = false;
      }
    });
  }
}