import { Component } from '@angular/core';
import { Expense } from '../../models/expense.model';
import { EXPENSE_CATEGORIES } from '../../constant/expense-categories';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ExpenseService } from '../../services/expense.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MAX_RECEIPT_SIZE, RECEIPT_ALLOWED_TYPES } from '../../constant/file-types';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../../shared/services/toast.service';

@Component({
  selector: 'app-edit-expense',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './edit-expense.component.html',
  styleUrl: './edit-expense.component.css'
})
export class EditExpenseComponent {
  loading: boolean = false;
  expense?: Expense;
  selectedFile?: File;
  categories = EXPENSE_CATEGORIES;
  form: FormGroup;
  previewUrl: string | null = null;

  constructor(
    private fb: FormBuilder,
    private expenseService: ExpenseService,
    private route: ActivatedRoute,
    private router: Router,
    private toastService: ToastService
  ) {
    this.form = this.fb.group({
      date: ['', Validators.required],
      category: ['', Validators.required],
      vendor: ['', Validators.required],
      totalAmount: ['', [Validators.required, Validators.min(0.1)]],
      taxAmount: [{ value: 0, disabled: true }],
      preTaxAmount: [{ value: 0, disabled: true }],
      notes: ['']
    });
  }

  get date() {
    return this.form.get('date');
  }

  get category() {
    return this.form.get('category');
  }

  get vendor() {
    return this.form.get('vendor');
  }

  get totalAmount() {
    return this.form.get('totalAmount');
  }

  get taxAmount() {
    return this.form.get('taxAmount');
  }

  ngOnInit(): void {
    const expenseId = this.route.snapshot.paramMap.get('id');
    if (!expenseId) {
      this.toastService.error('Invalid expense ID');
      return;
    }
    this.loadExpense(expenseId);
    this.form.get('totalAmount')?.valueChanges.subscribe(value => {
      this.calculateAmounts(value);
    });
  }

  loadExpense(id: string): void {
    this.expenseService
      .getExpenseById(id)
      .subscribe({
        next: (res) => {
          this.expense = res.data;
          this.form.patchValue({
            date: this.expense?.date?.split('T')[0],
            category: this.expense?.category,
            vendor: this.expense?.vendor,
            totalAmount: this.expense?.totalAmount,
            taxAmount: this.expense?.taxAmount,
            preTaxAmount: this.expense?.preTaxAmount,
            notes: this.expense?.notes
          });
        },
        error: (err) => {
          this.toastService.error(err.error?.message || 'Failed to load expenes');
        }
      });
  }

  onSelectedFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) {
      return;
    }
    const file = input.files[0];

    if (!RECEIPT_ALLOWED_TYPES.includes(file.type)) {
      this.toastService.error('Invalid file type. Only JPG, PNG, WEBP, HEIC and HEIF files are allowed.');
      input.value = '';
      return;
    }

    if (file.size > MAX_RECEIPT_SIZE) {
      this.toastService.error('File size must be less than 10MB.');
      input.value = '';
      return;
    }

    this.selectedFile = file;
    this.previewUrl = URL.createObjectURL(file);
  }

  removeSelectedFile(): void {
    this.selectedFile = undefined;
    if (this.previewUrl) {
      URL.revokeObjectURL(this.previewUrl);
    }
    this.previewUrl = null;
  }

  deleteReceipt(): void {
    if (!this.expense?._id) {
      return;
    }

    this.expenseService
      .deleteReceipt(this.expense._id)
      .subscribe({
        next: () => {
          if (this.expense) {
            this.expense.receipt = undefined;
            this.toastService.info('Receipt deleted successfully');
          }
        },
        error: (err) => {
          this.toastService.error(err.error?.message || 'Failed to remove receipt');
        }
      });
  }

  onSubmit(): void {
    if (!this.expense?._id) {
      return;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const payLoad = this.form.getRawValue();
    this.loading = true;
    this.expenseService
      .updateExpense(this.expense._id, payLoad, this.selectedFile)
      .subscribe({
        next: (res) => {
          if (res.receiptUploaded === false) {
            this.toastService.warning('Expense updated successfully. Receipt upload failed.');
          } else {
            this.toastService.success('Expense updated successfully.');
          }
          this.router.navigate(['/expenses']);
        },
        error: (err) => {
          this.toastService.error(err?.error?.message || 'Failed to create expense');
          this.loading = false;
        }
      });
  }

  calculateAmounts(value: Number): void {
    const total = Number(value);
    if (!total || total <= 0) {
      this.form.patchValue({
        taxAmount: 0,
        preTaxAmount: 0
      }, {
        emitEvent: false
      });
      return;
    }
    const preTaxAmount = Number((total / 1.13).toFixed(2));
    const taxAmount = Number((total - preTaxAmount).toFixed(2));
    this.form.patchValue({
      taxAmount,
      preTaxAmount
    }, {
      emitEvent: false
    });
  }

}
