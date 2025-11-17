import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

// Importar componentes standalone
import { HomePage } from './home/home.page';
import { AdminDashboardPage } from '../app/dashboard/admin-dashboard/admin-dashboard.page';
import { MedidorDashboardPage } from '../app/dashboard/medidor-dashboard/medidor-dashboard.page';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomePage },
  { path: 'admin-dashboard', component: AdminDashboardPage },
  { path: 'medidor-dashboard', component: MedidorDashboardPage },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
