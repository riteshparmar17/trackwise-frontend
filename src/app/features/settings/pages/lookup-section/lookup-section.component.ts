import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { LookupService } from '../../services/lookup.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-lookup-section',
  imports: [CommonModule, FormsModule],
  templateUrl: './lookup-section.component.html',
  styleUrl: './lookup-section.component.css'
})
export class LookupSectionComponent implements OnInit, OnChanges {
  @Input() title!: string;
  @Input() type!: 'purpose' | 'category' | 'vendor';
  @Input() refreshTrigger: any = 0;
  @Output() deleteRequested = new EventEmitter<any>();

  items: any[] = [];
  newValue = '';
  editingId: string | null = null;
  editingName = '';
  selectedLookup: any | null = null;

  constructor(
    private lookupService: LookupService,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.lookupService
      .getLookupsByType(this.type)
      .subscribe({
        next: (res: any) => {
          this.items = res.data;
        },
        error: (err) => {
          this.toastService.error(err?.error.message || 'Lookup data load failed');
        }
      });
  }

  addLookup(): void {
    if (!this.newValue.trim()) {
      return;
    }

    this.lookupService
      .createLookup(this.type, this.newValue)
      .subscribe({
        next: (res: any) => {
          this.toastService.success(`New ${this.type} - ${this.newValue} created successfully`);
          this.newValue = '';
          this.loadData();
        },
        error: (err) => {
          this.toastService.error(err?.error.message || `Failed to create new ${this.type}`)
        }
      });
  }

  startEdit(item: any): void {
    this.editingId = item._id;
    this.editingName = item.name;
  }

  cancelEdit(): void {
    this.editingId = null;
    this.editingName = '';
  }

  saveLookup(item: any): void {
    if (!this.editingName.trim()) {
      return;
    }

    this.lookupService
      .updateLookup(item._id, this.editingName)
      .subscribe({
        next: (res: any) => {
          this.toastService.success(`${item.type} updated successfully`);
          this.editingId = null;
          this.loadData();
        },
        error: (err) => {
          this.toastService.error(err?.error.message || `Failed to update ${item.type}`)
        }
      });
  }

  openDelete(item: any): void {
    this.deleteRequested.emit(item);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['refreshTrigger']) {
      this.loadData();
    }
  }

}
