import { Routes } from '@angular/router';

export const EXPENSES_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () => import('./pages/expense-list/expense-list.component').then(m => m.ExpenseListComponent)
    },
    {
        path: 'add',
        loadComponent: () => import('./pages/add-expense/add-expense.component').then(m => m.AddExpenseComponent)
    },
    {
        path: 'edit/:id',
        loadComponent: () => import('./pages/edit-expense/edit-expense.component').then(m => m.EditExpenseComponent)
    }
];