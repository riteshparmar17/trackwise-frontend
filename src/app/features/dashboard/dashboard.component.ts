import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ReportResponse } from '../reports/models/report.model';
import { ReportService } from '../reports/services/report.service';

@Component({
  selector: 'app-dashboard',
  imports: [RouterModule, CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {

  data?: ReportResponse;
  loading: boolean = false;

  constructor(
    private router: Router,
    private reportService: ReportService
  ) { }

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading = true;
    this.reportService.getDashboardReport()
      .subscribe({
        next: (res: any) => {
          this.data = res?.data;
          this.loading = false;
        },
        error: (err) => {
          this.loading = false;
        }
      });
  }

  getDriveStatus(drive: any): string {
    return drive.endKM ? 'Completed' : 'Incomplete';
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this.router.navigate(['/login']);
  }

}
