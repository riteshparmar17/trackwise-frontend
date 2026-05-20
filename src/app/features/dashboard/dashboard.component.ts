import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [RouterModule, CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {

  totalKm: number = 1200;
  totalDrives: number = 45;
  incomplete: number = 3;
  totalSpent: number = 540;

  recentDrives: { logDate: string; purpose: string; distanceKm: number | null }[] = [
    { logDate: '2026-04-01', purpose: 'Client Meeting', distanceKm: 120 },
    { logDate: '2026-04-02', purpose: 'Site Visit', distanceKm: null },
    { logDate: '2026-04-03', purpose: 'Team Outing', distanceKm: 80 }
  ];

  constructor(private router: Router) { }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this.router.navigate(['/login']);
  }

}
