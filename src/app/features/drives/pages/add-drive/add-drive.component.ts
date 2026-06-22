import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { DriveService } from '../../services/drive.service';
import { PURPOSE_OPTIONS } from '../../constant/purpose-option';
import { ToastService } from '../../../../shared/services/toast.service';
import { kmRangeValidator } from '../../../../shared/validators/km-range.validator';


@Component({
  selector: 'app-add-drive',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './add-drive.component.html',
  styleUrl: './add-drive.component.css'
})
export class AddDriveComponent {
  loading: boolean = false;
  error: string = '';
  purposes = PURPOSE_OPTIONS;
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private driveService: DriveService,
    private router: Router,
    private toastService: ToastService
  ) {
    this.form = this.fb.group({
      date: ['', Validators.required],
      startKM: ['', Validators.required],
      endKM: [''],
      purpose: ['Business', Validators.required],
      notes: ['']
    }, {
      validators: kmRangeValidator()
    });
  }
  get date() {
    return this.form.get('date');
  }

  get startKM() {
    return this.form.get('startKM');
  }

  get endKM() {
    return this.form.get('endKM');
  }

  get purpose() {
    return this.form.get('purpose');
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.driveService.createDrive(this.form.value).subscribe({
      next: (res) => {
        this.toastService.success('Drive log created successfully');
        this.router.navigate(['/drives']);
      },
      error: (err) => {
        this.toastService.error(err?.error?.message || 'Failed to create drive');
        this.loading = false;
      }
    });
  }
}
