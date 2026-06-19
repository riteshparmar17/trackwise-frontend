import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Drive } from '../../models/drive.model';
import { DriveService } from '../../services/drive.service';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ToastService } from '../../../../shared/services/toast.service';

declare const bootstrap: any;

@Component({
  selector: 'app-drive-list',
  imports: [CommonModule, ReactiveFormsModule, RouterModule, ConfirmDialogComponent],
  templateUrl: './drive-list.component.html',
  styleUrl: './drive-list.component.css'
})
export class DriveListComponent {
  drives: Drive[] = [];
  loading: boolean = false;
  error: string = '';
  totalKM: number = 0;
  filterForm: FormGroup;
  selectedDriveId: string = '';
  page: number = 1;
  limit: number = 10;
  totalPages: number = 0;
  totalEntries: number = 0;
  sortBy: string = 'date';
  sortOrder: 'asc' | 'desc' = 'desc';

  constructor(
    private driveService: DriveService,
    private router: Router,
    private fb: FormBuilder,
    private toastService: ToastService
  ) {
    this.filterForm = this.fb.group({
      from: [''],
      to: ['']
    });
  }

  ngOnInit(): void {
    this.loadDrives();
  }

  addDrive() {
    this.router.navigate(['/drives/add']);
  }

  editDrive(id: string) {
    this.router.navigate(['/drives/edit', id]);
  }

  loadDrives(page = 1): void {

    if (page < 1) return;
    if (this.totalPages && page > this.totalPages) return;

    this.loading = true;
    const { from, to } = this.filterForm.value;

    this.driveService.getFilteredDrives(from, to, page, this.limit, this.sortBy, this.sortOrder).subscribe({
      next: (res) => {
        this.drives = res.data.items || [];
        this.totalPages = res.data.meta.totalPages || 0;
        this.page = res.data.meta.page || 1;
        this.totalKM = res.data.meta.totalKM;
        this.totalEntries = res.data.meta.total;
        this.loading = false;
      },
      error: (err) => {
        this.toastService.error(err?.error?.message || 'Failed to load drives');
        this.loading = false;
      }
    });
  }

  get hasData(): boolean {
    return this.drives && this.drives.length > 0;
  }

  resetFilters(): void {
    this.filterForm.reset();
    this.page = 1;
    this.totalPages = 0;
    this.loadDrives(1);
  }

  changeSort(column: string): void {
    if (this.sortBy === column) {
      this.sortOrder =
        this.sortOrder === 'asc'
          ? 'desc'
          : 'asc';
    } else {
      this.sortBy = column;
      this.sortOrder = 'asc';
    }
    this.page = 1;
    this.loadDrives();
  }

  get startEntry(): number {
    if (!this.totalEntries) return 0;
    return (this.page - 1) * this.limit + 1;
  }

  get endEntry(): number {
    return Math.min(this.page * this.limit, this.totalEntries);
  }

  deleteDrive(): void {
    if (!this.selectedDriveId) {
      return;
    }
    this.driveService.deleteDrive(this.selectedDriveId).subscribe({
      next: () => {
        this.loadDrives(this.page);
        this.toastService.success('Drive log removed successfully.');
      },
      error: (err) => {
        this.toastService.error(err?.error?.message || 'Failed to delete drive')
      }
    });
  }

  openDeleteModal(id: string) {
    this.selectedDriveId = id;
    const modal = new bootstrap.Modal(document.getElementById('deleteDriveModal')!);
    modal.show();
  }

  getSortIcon(column: string): string {
    if (this.sortBy !== column) {
      return '↕';
    }
    return this.sortOrder === 'asc'
      ? '▲'
      : '▼';
  }

}