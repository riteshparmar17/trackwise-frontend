import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { Expense } from '../models/expense.model';

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  private api = `${environment.apiUrl}/expenses`;

  constructor(private http: HttpClient) { }

  getExpenses(): Observable<any> {
    return this.http.get(`${this.api}/getExpenses`);
  }

  getExpenseById(id: string): Observable<any> {
    return this.http.get(`${this.api}/getExpenseById/${id}`);
  }

  createExpense(expenseData: any, receipt?: File): Observable<any> {
    const formData = new FormData();

    Object.keys(expenseData).forEach(key => {
      if (expenseData[key] !== null && expenseData[key] !== undefined) {
        formData.append(key, expenseData[key]);
      }
    });

    if (receipt) {
      formData.append('receipt', receipt);
    }

    return this.http.post(`${this.api}/createExpense`, formData);
  }

  updateExpense(id: string, expenseData: any, receipt?: File): Observable<any> {
    const formData = new FormData();
    Object.keys(expenseData).forEach(key => {
      if (expenseData[key] !== null && expenseData[key] !== undefined) {
        formData.append(key, expenseData[key]);
      }
    });
    if (receipt) {
      formData.append('receipt', receipt);
    }
    return this.http.put(`${this.api}/updateExpense/${id}`, formData);
  }

  deleteExpense(id: string): Observable<any> {
    return this.http.delete(`${this.api}/deleteExpense/${id}`);
  }

  getFilteredExpenses(filters: any): Observable<any> {
    let params = new HttpParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== '' && filters[key] !== undefined) {
        params = params.set(key, filters[key]);
      }
    });
    return this.http.get(`${this.api}/getFilteredExpenses/`, { params });
  }

  deleteReceipt(id: string): Observable<any> {
    return this.http.delete(`${this.api}/deleteReceipt/${id}`);
  }

}
