import { Routes } from '@angular/router';

export const DRIVES_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () => import('./pages/drive-list/drive-list.component').then(m => m.DriveListComponent)
    },
    {
        path: 'add',
        loadComponent: () => import('./pages/add-drive/add-drive.component').then(m => m.AddDriveComponent)
    },
    {
        path: 'edit/:id',
        loadComponent: () => import('./pages/edit-drive/edit-drive.component').then(m => m.EditDriveComponent)
    }
];