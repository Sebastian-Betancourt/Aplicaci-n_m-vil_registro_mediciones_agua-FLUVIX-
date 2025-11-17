import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then(m => m.HomePage)
  },  {
    path: 'admin-dashboard',
    loadComponent: () => import('./dashboard/admin-dashboard/admin-dashboard.page').then( m => m.AdminDashboardPage)
  },
  {
    path: 'medidor-dashboard',
    loadComponent: () => import('./dashboard/medidor-dashboard/medidor-dashboard.page').then( m => m.MedidorDashboardPage)
  }

];