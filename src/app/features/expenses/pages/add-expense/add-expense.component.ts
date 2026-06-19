import { Component } from '@angular/core';
import { EXPENSE_CATEGORIES } from '../../constant/expense-categories';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ExpenseService } from '../../services/expense.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MAX_RECEIPT_SIZE, RECEIPT_ALLOWED_TYPES } from '../../constant/file-types';
import { ToastService } from '../../../../shared/services/toast.service';

@Component({
  selector: 'app-add-expense',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './add-expense.component.html',
  styleUrl: './add-expense.component.css'
})
export class AddExpenseComponent {
  loading: boolean = false;
  selectedFile?: File;
  categories = EXPENSE_CATEGORIES;
  form: FormGroup;
  previewUrl: string | null = null;

  constructor(
    private fb: FormBuilder,
    private expenseService: ExpenseService,
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

  ngOnInit(): void {
    this.form.get('totalAmount')?.valueChanges.subscribe(value => {
      this.calculateAmounts(value);
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

  onFileSelected(event: Event): void {
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

  removeReceipt(): void {
    this.selectedFile = undefined;
    if (this.previewUrl) {
      URL.revokeObjectURL(this.previewUrl);
    }
    this.previewUrl = null;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    const payLoad = this.form.getRawValue();
    this.expenseService
      .createExpense(payLoad, this.selectedFile)
      .subscribe({
        next: (res) => {
          if (res.receiptUploaded === false) {
            this.toastService.warning('Expense saved successfully. Receipt upload failed. You can upload it lated from edit expense option.');
          } else {
            this.toastService.success('Expense created successfully.');
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
