import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Injectable({
  providedIn: 'root'
})
export class ReportExportService {

  exportExcel(report: any): void {

    const summarySheet = XLSX.utils.json_to_sheet([
      {
        'Total KMs': report.stats.totalKms,
        'Total Spent': report.stats.totalSpent,
        'Total HST': report.stats.totalHst
      }
    ]);

    const kmsSheet = XLSX.utils.json_to_sheet(
      report.kmsByMonth.map((item: any) => ({
        Year: item.year,
        Month: item.month,
        Trips: item.trips,
        'Total KMs': item.totalKms
      }))
    );

    const expenseSheet = XLSX.utils.json_to_sheet(
      report.expenseByCategory.map((item: any) => ({
        Category: item.category,
        Count: item.count,
        'Total HST': item.hst,
        'Total Amount': item.total
      }))
    );

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      summarySheet,
      'Summary'
    );

    XLSX.utils.book_append_sheet(
      workbook,
      kmsSheet,
      'KMs By Month'
    );

    XLSX.utils.book_append_sheet(
      workbook,
      expenseSheet,
      'Expenses By Category'
    );

    const excelBuffer = XLSX.write(
      workbook,
      {
        bookType: 'xlsx',
        type: 'array'
      }
    );

    const blob = new Blob(
      [excelBuffer],
      {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      }
    );

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `trackwise-report-${Date.now()}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

  }

  exportPdf(report: any): void {
    const pdf = new jsPDF();
    pdf.setFontSize(18);
    pdf.text('TrackWise Report', 14, 20);
    pdf.setFontSize(11);
    pdf.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);
    autoTable(pdf, {
      startY: 40,
      head: [['Metric', 'Value']],
      body: [
        ['Total KMs', report.stats.totalKms],
        ['Total Spent', report.stats.totalSpent],
        ['Total HST', report.stats.totalHst]
      ]
    });

    autoTable(pdf, {
      startY: (pdf as any).lastAutoTable.finalY + 15,
      head: [['Year', 'Month', 'Trips', 'Total KMs']],
      body: report.kmsByMonth.map((item: any) => [
        item.year,
        item.month,
        item.trips,
        item.totalKms
      ])
    });

    autoTable(pdf, {
      startY: (pdf as any).lastAutoTable.finalY + 15,
      head: [['Category', 'Count', 'Total HST', 'Total Amount']],
      body: report.expenseByCategory.map((item: any) => [
        item.category,
        item.count,
        item.hst,
        item.total
      ])
    });

    pdf.save(
      `trackwise-report-${new Date().getTime()}.pdf`
    );
  }
}
