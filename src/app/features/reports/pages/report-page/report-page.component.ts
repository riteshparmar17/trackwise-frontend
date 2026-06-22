import { Component, ElementRef, HostListener, ViewChild, viewChild } from '@angular/core';
import { ReportResponse } from '../../models/report.model';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ReportService } from '../../services/report.service';
import { CommonModule } from '@angular/common';
import { dateRangeValidator } from '../../../../shared/validators/date-range.validator';
import { ReportExportService } from '../../services/report-export.service';

@Component({
  selector: 'app-report-page',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './report-page.component.html',
  styleUrl: './report-page.component.css'
})
export class ReportPageComponent {
  report?: ReportResponse;
  loading: boolean = false;
  form: FormGroup;
  exportMenuOpen: boolean = false;
  showFilters: boolean = false;
  isMobile: boolean = window.innerWidth < 768;

  @ViewChild('exportDropdown')
  exportDropdown!: ElementRef;

  constructor(
    private fb: FormBuilder,
    private reportService: ReportService,
    private reportExportService: ReportExportService
  ) {
    this.form = this.fb.group({
      fromDate: [''],
      toDate: ['']
    }, {
      validators: dateRangeValidator()
    });
  }

  ngOnInit(): void {
    this.loadReport();
  }

  resetFilter(): void {
    this.form.reset();
    this.loadReport();
  }

  loadReport(): void {
    this.loading = true;
    const { fromDate, toDate } = this.form.value;
    this.reportService
      .getDashboardReport(fromDate, toDate)
      .subscribe({
        next: (res: any) => {
          this.report = res?.data;
          this.loading = false;
        },
        error: (err) => {
          this.loading = false;
        }
      });
  }

  applyFilter(): void {
    this.loadReport();
    if (this.isMobile) {
      this.showFilters = false;
    }
  }


  toggleExport(): void {
    this.exportMenuOpen = !this.exportMenuOpen;
  }

  toggleExportMenu(): void {
    this.exportMenuOpen = !this.exportMenuOpen;
  }

  @HostListener('window:resize')
  onResize(): void {
    this.isMobile = window.innerWidth < 768;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.exportMenuOpen) {
      return;
    }
    const clickedInside = this.exportDropdown?.nativeElement.contains(event.target);
    if (!clickedInside) {
      this.exportMenuOpen = false;
    }
  }

  exportToExcel(): void {
    this.exportMenuOpen = false;
    this.reportExportService.exportExcel(this.report);
  }

  exportToPdf(): void {
    this.exportMenuOpen = false;
    this.reportExportService.exportPdf(this.report);
  }

  hasKms(): boolean {
    return !!this.report?.kmsByMonth?.length;
  }

  hasExpenses(): boolean {
    return !!this.report?.expenseByCategory?.length;
  }
}
