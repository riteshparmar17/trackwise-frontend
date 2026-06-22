import { Component } from '@angular/core';
import { Drive } from '../../models/drive.model';
import { PURPOSE_OPTIONS } from '../../constant/purpose-option';
import { DriveService } from '../../services/drive.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../../shared/services/toast.service';
import { kmRangeValidator } from '../../../../shared/validators/km-range.validator';

@Component({
  selector: 'app-edit-drive',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './edit-drive.component.html',
  styleUrl: './edit-drive.component.css'
})
export class EditDriveComponent {
  loading: boolean = false;
  drive?: Drive;
  purposes = PURPOSE_OPTIONS;
  distancePreview: number = 0;
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private driveService: DriveService,
    private toastService: ToastService
  ) {
    this.form = this.fb.group({
      startKM: [0],
      endKM: ['', Validators.required],
      purpose: [''],
      notes: ['']
    }, {
      validators: kmRangeValidator()
    });
  }

  ngOnInit(): void {
    const driveId = this.route.snapshot.paramMap.get('id');
    if (!driveId) {
      this.toastService.error('Invalid drive ID');
      return;
    }
    this.driveService.getDriveById(driveId).subscribe({
      next: (data) => {
        this.drive = data;
        this.form.patchValue({
          startKM: this.drive?.startKM,
          endKM: this.drive?.endKM || '',
          purpose: this.drive?.purpose,
          notes: this.drive?.notes
        });
        this.updateDistancePreview();
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Failed to load drive details');
      }
    });

  }

  updateDistancePreview() {
    this.form.get('endKM')?.valueChanges.subscribe(value => {
      const endKM = Number(value);
      const startKM = Number(this.drive?.startKM);
      if (endKM >= startKM) {
        this.distancePreview = endKM - startKM;
      } else {
        this.distancePreview = 0;
      }
    });
  }

  onSubmit() {
    if (!this.drive) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const endKM = Number(this.form.get('endKM')?.value);

    this.loading = true;
    const updateData = {
      endKM: endKM,
      totalKM: Number(this.form.get('endKM')?.value) - Number(this.drive?.startKM),
      purpose: this.form.get('purpose')?.value,
      notes: this.form.get('notes')?.value
    };

    this.driveService.updateDrive(this.drive._id!, updateData).subscribe({
      next: () => {
        this.loading = false;
        this.toastService.success('Drive log updated successfully');
        this.router.navigate(['/drives']);
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Failed to update drive log');
        this.loading = false;
      }
    });
  }

  get endKM() {
    return this.form.get('endKM');
  }

}
