import { Component, HostListener } from '@angular/core';
import { Expense } from '../../models/expense.model';
import { EXPENSE_CATEGORIES } from '../../constant/expense-categories';
import { ExpenseService } from '../../services/expense.service';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ToastService } from '../../../../shared/services/toast.service';
import { dateRangeValidator } from '../../../../shared/validators/date-range.validator';

@Component({
  selector: 'app-expense-list',
  imports: [CommonModule, FormsModule, RouterModule, ConfirmDialogComponent, ReactiveFormsModule],
  templateUrl: './expense-list.component.html',
  styleUrl: './expense-list.component.css'
})
export class ExpenseListComponent {
  expenses: Expense[] = [];
  loading: boolean = false;
  selectedExpenseId: string = '';
  categories = EXPENSE_CATEGORIES;
  expenseFilterForm: FormGroup;
  showFilters: boolean = false;
  isMobile: boolean = window.innerWidth < 768;
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 10;
  summary = {
    totalEntries: 0,
    totalAmount: 0,
    totalTax: 0
  };
  sortBy: string = 'date';
  sortOrder: 'asc' | 'desc' = 'desc';

  constructor(
    private expenseService: ExpenseService,
    private toastService: ToastService,
    private fb: FormBuilder
  ) {
    this.expenseFilterForm = this.fb.group({
      fromDate: [''],
      toDate: [''],
      category: ['']
    }, {
      validators: dateRangeValidator()
    });
  }


  ngOnInit(): void {
    this.loadExpenses();
  }

  loadExpenses(page = 1): void {
    const { fromDate, toDate, category } = this.expenseFilterForm.value;
    const filters = {
      fromDate,
      toDate,
      category,
      page,
      limit: this.pageSize,
      sortBy: this.sortBy,
      sortOrder: this.sortOrder
    };

    this.loading = true;

    this.expenseService
      .getFilteredExpenses(filters)
      .subscribe({
        next: (res) => {
          this.expenses = res.data.items;
          this.summary = res.data.summary;
          this.summary.totalEntries = res.data.meta.total;
          this.currentPage = res.data.meta.page;
          this.totalPages = res.data.meta.totalPages;
          this.loading = false;
        },
        error: (err) => {
          this.toastService.error(err?.error?.message || 'Failed to load expenses');
          this.loading = false;
        }
      });
  }

  applyFilters(): void {
    this.loadExpenses(1);
    if (this.isMobile) {
      this.showFilters = false;
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    this.isMobile = window.innerWidth < 768;
  }

  resetFilters(): void {
    this.expenseFilterForm.reset({
      fromDate: '',
      toDate: '',
      category: ''
    });
    this.loadExpenses(1);
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.loadExpenses(this.currentPage - 1);
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.loadExpenses(this.currentPage + 1);
    }
  }

  startEntry(): number {
    return ((this.currentPage - 1) * this.pageSize) + 1;
  }

  endEntry(): number {
    return Math.min(this.currentPage * this.pageSize, this.summary.totalEntries);
  }

  openDeleteModal(expenseId: string): void {
    this.selectedExpenseId = expenseId;
  }

  confirmDeleteExpense(): void {
    if (!this.selectedExpenseId) {
      return;
    }

    this.expenseService
      .deleteExpense(this.selectedExpenseId)
      .subscribe({
        next: () => {
          this.loadExpenses(this.currentPage);
          this.toastService.success('Expense log removed successfully.');
        },
        error: (err) => {
          this.toastService.error(err?.error?.message || 'Failed to delete expense');
        }
      });
  }

  sort(column: string): void {
    if (this.sortBy === column) {
      this.sortOrder =
        this.sortOrder === 'asc'
          ? 'desc'
          : 'asc';
    } else {
      this.sortBy = column;
      this.sortOrder = 'asc';
    }
    this.currentPage = 1;
    this.loadExpenses();
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
