import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-register',
  imports: [FormsModule, RouterModule, ReactiveFormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {

  message: string = '';
  error: string = '';
  form: FormGroup;

  constructor(
    private auth: AuthService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required]
    });
  }

  get name() {
    return this.form.get('name');
  }

  get email() {
    return this.form.get('email');
  }

  get password() {
    return this.form.get('password');
  }

  get confirmPassword() {
    return this.form.get('confirmPassword');
  }

  onSubmit() {

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { name, email, password } = this.form.value;

    this.auth.register({ name, email, password }).subscribe({
      next: (res) => {
        this.message = 'Please verify your account.';
        this.error = '';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err) => {
        this.error = err.error.message || 'Registration failed';
        this.message = '';
      }
    });
  }

}
