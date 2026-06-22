export interface ReportStats {
    totalKms: number;
    totalSpent: number;
    totalHst: number;
    totalDrives: number;
    incompleteDrives: number;
}

export interface KmsByMonth {
    year: number;
    month: string;
    trips: number;
    totalKms: number;
}

export interface ExpenseByCategory {
    category: string;
    count: number;
    hst: number;
    total: number;
}

export interface ReportResponse {
    stats: ReportStats;
    kmsByMonth: KmsByMonth[];
    expenseByCategory: ExpenseByCategory[];
    recentDrives: any[];
    recentExpenses: any[];
}