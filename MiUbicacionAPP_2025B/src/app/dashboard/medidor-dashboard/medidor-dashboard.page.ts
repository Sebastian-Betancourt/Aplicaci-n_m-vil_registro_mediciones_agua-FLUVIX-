// src/app/dashboard/medidor-dashboard/medidor-dashboard.page.ts
import { Component, signal, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { createClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

interface Medicion {
  id: string;
  fotoMedidor: string;
  fotoFachada: string;
  lat: number;
  lng: number;
  valor: number;
  observaciones?: string;
  createdAt: string;
  mapsLink: string;
}

@Component({
  selector: 'app-medidor-dashboard',
  standalone: true,
  templateUrl: './medidor-dashboard.page.html',
  styleUrls: ['./medidor-dashboard.page.scss'],
  imports: [IonicModule, CommonModule, RouterModule, FormsModule]
})
export class MedidorDashboardPage implements OnInit {

  mediciones = signal<Medicion[]>([]);
  userId = localStorage.getItem('userId');
  userName: string | null = null; // <-- AQUI DEBE IR
  fotoMedidorFile: File | null = null;
  fotoFachadaFile: File | null = null;
  valorMedidor: number | null = null;
  observaciones: string = '';
  lat: number | null = null;
  lng: number | null = null;

  private supabase = createClient(environment.supabaseUrl, environment.supabaseAnonKey);

  constructor(private router: Router) {}

  ngOnInit() {
    this.userName = localStorage.getItem('userName'); // <-- ahora sí funciona
    this.loadMediciones();
  }

  // ---------------- CARGAR MEDICIONES ----------------
  async loadMediciones() {
    if (!this.userId) return;

    const { data, error } = await this.supabase
      .from('mediciones')
      .select('*')
      .eq('user_id', this.userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error al cargar mediciones:', error.message);
      return;
    }

    const mapped = (data as any[]).map(item => ({
      id: item.id,
      fotoMedidor: item.foto_medidor,
      fotoFachada: item.foto_fachada,
      lat: item.lat,
      lng: item.lng,
      valor: item.medidor_value,
      observaciones: item.observaciones,
      createdAt: item.created_at,
      mapsLink: `https://www.google.com/maps?q=${item.lat},${item.lng}`
    }));

    this.mediciones.set(mapped);
  }

  // ---------------- LOGOUT ----------------
  logout() {
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');
    this.router.navigate(['/home']);
  }

  // ---------------- USAR CÁMARA: FOTO MEDIDOR ----------------
  async tomarFotoMedidor() {
    const image = await Camera.getPhoto({
      quality: 80,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Prompt
    });

    const blob = await fetch(image.dataUrl!).then(r => r.blob());
    this.fotoMedidorFile = new File([blob], `medidor-${Date.now()}.jpg`, { type: 'image/jpeg' });
  }

  // ---------------- USAR CÁMARA: FOTO FACHADA ----------------
  async tomarFotoFachada() {
    const image = await Camera.getPhoto({
      quality: 80,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Prompt
    });

    const blob = await fetch(image.dataUrl!).then(r => r.blob());
    this.fotoFachadaFile = new File([blob], `fachada-${Date.now()}.jpg`, { type: 'image/jpeg' });
  }

  // ---------------- SUBIR FOTO DESDE GALERÍA ----------------
  onFotoMedidorChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) this.fotoMedidorFile = input.files[0];
  }

  onFotoFachadaChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) this.fotoFachadaFile = input.files[0];
  }

  // ---------------- GEOLOCALIZACIÓN ----------------
  async obtenerUbicacion() {
    return new Promise<{lat: number, lng: number}>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        err => reject(err)
      );
    });
  }

  // ---------------- REGISTRAR MEDICIÓN ----------------
  async registrarMedicion() {
    if (!this.valorMedidor || !this.fotoMedidorFile || !this.fotoFachadaFile) {
      alert('Completa todos los campos y selecciona fotos.');
      return;
    }

    try {
      const coords = await this.obtenerUbicacion();
      this.lat = coords.lat;
      this.lng = coords.lng;

      const fotoMedidorName = `${crypto.randomUUID()}-${this.fotoMedidorFile.name}`;
      const fotoFachadaName = `${crypto.randomUUID()}-${this.fotoFachadaFile.name}`;

      const { error: fotoMedidorError } = await this.supabase.storage
        .from('photos')
        .upload(fotoMedidorName, this.fotoMedidorFile);

      const { error: fotoFachadaError } = await this.supabase.storage
        .from('photos')
        .upload(fotoFachadaName, this.fotoFachadaFile);

      if (fotoMedidorError || fotoFachadaError) {
        alert('Error al subir las fotos');
        return;
      }

      const fotoMedidorUrl = this.supabase.storage.from('photos').getPublicUrl(fotoMedidorName).data.publicUrl;
      const fotoFachadaUrl = this.supabase.storage.from('photos').getPublicUrl(fotoFachadaName).data.publicUrl;

      const { error } = await this.supabase.from('mediciones').insert([{
        id: crypto.randomUUID(),
        user_id: this.userId,
        medidor_value: this.valorMedidor,
        observaciones: this.observaciones,
        foto_medidor: fotoMedidorUrl,
        foto_fachada: fotoFachadaUrl,
        lat: this.lat,
        lng: this.lng
      }]);

      if (error) {
        alert('Error al registrar medición');
        return;
      }

      alert('Medición registrada con éxito!');

      this.valorMedidor = null;
      this.observaciones = '';
      this.fotoMedidorFile = null;
      this.fotoFachadaFile = null;

      await this.loadMediciones();

    } catch (err) {
      alert('Error al obtener ubicación');
    }
  }
  modalOpen = false;
imagenSeleccionada: string | null = null;

abrirImagen(url: string) {
  this.imagenSeleccionada = url;
  this.modalOpen = true;
}

cerrarModal() {
  this.modalOpen = false;
  this.imagenSeleccionada = null;
}
  
}
