// src/app/dashboard/admin-dashboard/admin-dashboard.page.ts
import { Component, signal, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { createClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
import { RouterModule, Router } from '@angular/router';

interface Medicion {
  id: string;
  fotoMedidor?: string | null;
  fotoFachada?: string | null;
  lat?: number | null;
  lng?: number | null;
  valor?: number | null;
  observaciones?: string | null;
  createdAt?: string | null;
  mapsLink?: string | null;
  user?: string | null; // nombre del medidor (si existe)
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  templateUrl: './admin-dashboard.page.html',
  styleUrls: ['./admin-dashboard.page.scss'],
  imports: [
    IonicModule,
    CommonModule,
    RouterModule,
    FormsModule
  ]
})
export class AdminDashboardPage implements OnInit {
  mediciones = signal<Medicion[]>([]);
  searchText: string = '';

  private supabase = createClient(environment.supabaseUrl, environment.supabaseAnonKey);

  constructor(private router: Router) {}

  ngOnInit() {
    this.loadMediciones();
  }

  // Carga todas las mediciones (intenta traer también el nombre desde users)
  async loadMediciones() {
    const { data, error } = await this.supabase
      .from('mediciones')
      .select(`
        *,
        users ( id, name )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error al cargar mediciones:', error.message);
      return;
    }

    const mapped = (data as any[]).map(item => ({
      id: item.id,
      fotoMedidor: item.foto_medidor ?? null,
      fotoFachada: item.foto_fachada ?? null,
      lat: item.lat ?? null,
      lng: item.lng ?? null,
      valor: item.medidor_value ?? item.valor ?? null,
      observaciones: item.observaciones ?? null,
      createdAt: item.created_at ?? null,
      mapsLink: (item.lat && item.lng) ? `https://www.google.com/maps?q=${item.lat},${item.lng}` : null,
      user: item.users?.name ?? null
    })) as Medicion[];

    this.mediciones.set(mapped);
  }

  // Getter que devuelve la lista filtrada por searchText
  get filteredMediciones(): Medicion[] {
    const q = (this.searchText || '').trim().toLowerCase();
    if (!q) return this.mediciones();

    return this.mediciones().filter(m => {
      const user = (m.user || '').toString().toLowerCase();
      const obs = (m.observaciones || '').toString().toLowerCase();
      const valor = (m.valor !== undefined && m.valor !== null) ? m.valor.toString() : '';
      return user.includes(q) || obs.includes(q) || valor.includes(q) || (m.id || '').toLowerCase().includes(q);
    });
  }

  logout() {
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    this.router.navigate(['/home']);
  }
}
