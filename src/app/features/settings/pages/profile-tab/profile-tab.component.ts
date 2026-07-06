import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SettingsService } from '../../services/settings.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-profile-tab',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './profile-tab.component.html',
  styleUrl: './profile-tab.component.css'
})
export class ProfileTabComponent {
  profileForm!: FormGroup;
  changePasswordForm!: FormGroup;
  loading: boolean = false;
  saving: boolean = false;
  email: string = '';
  originalName: string = '';
  showPassword: boolean = false;

  constructor(
    private fb: FormBuilder,
    private settingsService: SettingsService,
    private toastService: ToastService,
    private authService: AuthService
  ) {
    this.profileForm = this.fb.group({
      name: ['', [Validators.required]]
    });
    this.changePasswordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', Validators.required],
      confirmPassword: ['', Validators.required],
    }, {
      validators: this.passwordsMatchValidator
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
          this.loading = false;
          this.profileForm.patchValue({
            name: res?.data.name
          });
          this.originalName = res?.data.name;
          this.email = res?.data.email;
        },
        error: (err) => {
          this.loading = false;
          this.toastService.error('Failed to load profile');
        }
      });
  }

  hasChanges(): boolean {
    return (
      this.profileForm.value.name?.trim() !== this.originalName
    );
  }

  save(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.settingsService
      .updateProfile(this.profileForm.value)
      .subscribe({
        next: (res: any) => {
          this.originalName = res?.data.name;
          this.toastService.success(res.message || 'Profile updated');
        },
        error: (err) => {
          this.toastService.success(err.error.message || 'Profile update failed');
        }
      });
  }

  getChangePasswordControl() {
    this.changePasswordForm.controls;
  }

  passwordsMatchValidator(form: any) {
    const password = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');
    if (!password || !confirmPassword) return null;
    if (confirmPassword.value === '') return null;
    if (password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ mismatch: true });
    } else {
      const errors = confirmPassword.errors;
      if (errors) {
        delete errors['mismatch'];
        confirmPassword.setErrors(Object.keys(errors).length ? errors : null);
      }
    }
    return null;
  }

  updatePassword(): void {
    if (this.changePasswordForm.invalid) {
      this.changePasswordForm.markAllAsTouched();
      return;
    }

    const payLoad = {
      currentPassword: this.changePasswordForm.value.currentPassword,
      newPassword: this.changePasswordForm.value.newPassword
    };

    this.authService.changePassword(payLoad)
      .subscribe({
        next: (res: any) => {
          this.toastService.success(res?.message);
          this.changePasswordForm.reset();
        },
        error: (err) => {
          this.toastService.error(err?.error?.message || 'Failed to update password');
        }
      });
  }

}
