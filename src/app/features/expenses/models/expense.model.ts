export interface Receipt {
    publicId: string;
    url: string;
    originalName: string;
}

export interface Expense {
    _id: string;
    date: string;
    category: string;
    vendor: string;
    totalAmount: number;
    taxAmount: number;
    preTaxAmount: number;
    notes: string;
    receipt?: Receipt;
    createdAt: string;
    updatedAt: string;
}

export interface ExpenseSummary {
    totalAmount: number;
    totalEntries: number;
}

export interface ExpenseFilterResponse {
    items: Expense[];
    summary: ExpenseSummary;
    meta: {
        total: number;
        page: number;
        totalPages: number;
    };
}