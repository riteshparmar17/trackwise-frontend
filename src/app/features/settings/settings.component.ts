import { Component } from '@angular/core';
import { ProfileTabComponent } from "./pages/profile-tab/profile-tab.component";
import { CommonModule } from '@angular/common';
import { LookupSectionComponent } from './pages/lookup-section/lookup-section.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { LookupService } from './services/lookup.service';
import { ToastService } from '../../shared/services/toast.service';
import * as bootstrap from 'bootstrap';


@Component({
  selector: 'app-settings',
  imports: [ProfileTabComponent, CommonModule, LookupSectionComponent, ConfirmDialogComponent],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent {
  activeTab: 'profile' | 'lookups' = 'profile';
  selectedLookup: any = null;
  refreshTrigger = 0;

  constructor(
    private lookupService: LookupService,
    private toastService: ToastService
  ) { }

  setTab(tab: any): void {
    this.activeTab = tab;
  }

  onDeleteLookup(item: any): void {
    this.selectedLookup = item;
    const modalEl = document.getElementById('deleteLookupModal');
    const modal = new bootstrap.Modal(modalEl!);
    modal.show();
  }

  deleteLookup(): void {
    if (!this.selectedLookup) {
      return;
    }

    this.lookupService
      .deleteLookup(this.selectedLookup?._id)
      .subscribe({
        next: (res: any) => {
          this.toastService.success(`${this.selectedLookup.type} deleted successfully`);
          this.selectedLookup = null;
          this.refreshTrigger++;
        },
        error: (err) => {
          this.selectedLookup = null;
          this.toastService.error(err?.error.message || `Failed to delete ${this.selectedLookup.type}`)
        }
      });
    const modalEl = document.getElementById('deleteLookupModal');
    const modal = bootstrap.Modal.getInstance(modalEl!);
    modal?.hide();
  }
}
