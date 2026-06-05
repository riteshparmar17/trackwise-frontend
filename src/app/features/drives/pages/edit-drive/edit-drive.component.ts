import { Component } from '@angular/core';
import { Drive } from '../../models/drive.model';
import { PURPOSE_OPTIONS } from '../../constant/purpose-option';
import { DriveService } from '../../services/drive.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-edit-drive',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './edit-drive.component.html',
  styleUrl: './edit-drive.component.css'
})
export class EditDriveComponent {
  loading: boolean = false;
  error: string = '';
  drive?: Drive;
  purposes = PURPOSE_OPTIONS;
  distancePreview: number = 0;
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private driveService: DriveService
  ) {
    this.form = this.fb.group({
      endKM: ['', Validators.required],
      purpose: [''],
      notes: ['']
    });
  }

  ngOnInit(): void {
    const driveId = this.route.snapshot.paramMap.get('id');
    if (!driveId) {
      this.error = 'Invalid drive ID';
      return;
    }
    this.driveService.getDriveById(driveId).subscribe({
      next: (data) => {
        this.drive = data;
        this.form.patchValue({
          endKM: this.drive?.endKM || '',
          purpose: this.drive?.purpose,
          notes: this.drive?.notes
        });
        this.updateDistancePreview();
      },
      error: () => {
        this.error = 'Failed to load drive details';
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
    if (endKM < this.drive.startKM) {
      this.error = 'End KM cannot be less than Start KM';
      return;
    }

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
        this.router.navigate(['/drives']);
      },
      error: () => {
        this.error = 'Failed to update drive';
        this.loading = false;
      }
    });
  }

  get endKM() {
    return this.form.get('endKM');
  }

}
