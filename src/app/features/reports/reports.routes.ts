import { Routes } from "@angular/router";

export const REPORTS_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () => import('./pages/report-page/report-page.component').then(m => m.ReportPageComponent)
    },
];