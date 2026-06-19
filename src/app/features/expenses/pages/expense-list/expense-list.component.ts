import { Component } from '@angular/core';
import { Expense } from '../../models/expense.model';
import { EXPENSE_CATEGORIES } from '../../constant/expense-categories';
import { ExpenseService } from '../../services/expense.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ToastService } from '../../../../shared/services/toast.service';

@Component({
  selector: 'app-expense-list',
  imports: [CommonModule, FormsModule, RouterModule, ConfirmDialogComponent],
  templateUrl: './expense-list.component.html',
  styleUrl: './expense-list.component.css'
})
export class ExpenseListComponent {
  expenses: Expense[] = [];
  loading: boolean = false;
  selectedExpenseId: string = '';
  categories = EXPENSE_CATEGORIES;
  from = '';
  to = '';
  category: string = '';
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
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    this.loadExpenses();
  }

  loadExpenses(page = 1): void {
    const filters = {
      from: this.from,
      to: this.to,
      category: this.category,
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
  }

  resetFilters(): void {
    this.from = '';
    this.to = '';
    this.category = '';
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
