// src/app/services/photo.service.ts
import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource, Photo as CameraPhoto } from '@capacitor/camera';
import { Filesystem, Directory, ReadFileResult } from '@capacitor/filesystem';
import { Platform } from '@ionic/angular';
import { Geolocation } from '@capacitor/geolocation';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root',
})
export class PhotoService {

  constructor(
    private platform: Platform,
    private supabase: SupabaseService
  ) {}

  // ============================================================
  // TOMAR FOTO + UBICACIÓN + SUBIR STORAGE + GUARDAR EN BD
  // ============================================================
  public async addNewToGallery() {
    // 1) Tomar foto
    const capturedPhoto = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      quality: 90,
    });

    // 2) Geolocalización
    let latitude: number | null = null;
    let longitude: number | null = null;
    let mapsLink: string | null = null;

    try {
      const pos = await Geolocation.getCurrentPosition({ enableHighAccuracy: true });
      latitude = pos.coords.latitude;
      longitude = pos.coords.longitude;

      mapsLink = `https://www.google.com/maps/@${latitude},${longitude}`;
    } catch (e) {
      console.warn('⚠ No se pudo obtener ubicación', e);
    }

    // 3) Convertir a Base64
    const base64Data = await this.readAsBase64(capturedPhoto);
    const fileName = `${new Date().getTime()}.jpeg`;

    // 4) Guardar archivo local temporal
    await Filesystem.writeFile({
      path: fileName,
      data: base64Data.split(',')[1], 
      directory: Directory.Data,
    });

    // 5) Subir imagen a Supabase Storage
    let publicUrl: string | null = null;

    try {
      publicUrl = await this.uploadToSupabase(fileName, base64Data);
    } catch (err) {
      console.error('❌ Error subiendo a storage', err);
    }

    if (!publicUrl) publicUrl = '';

    // 6) Registrar metadata en BD
    try {
      const { error } = await this.supabase.client
        .from('photos')
        .insert({
          file_path: fileName,
          storage_url: publicUrl,
          latitude,
          longitude,
          maps_link: mapsLink,
        });

      if (error) console.error('❌ Error insertando metadata', error);
    } catch (err) {
      console.error('❌ Error supabase insert', err);
    }
  }

  // ============================================================
  // SUBIR A SUPABASE STORAGE
  // ============================================================
  private async uploadToSupabase(fileName: string, base64Data: string): Promise<string> {
    const blob = this.dataURLtoBlob(base64Data);
    const filePath = `public/${fileName}`;

    const { data, error } = await this.supabase.client.storage
      .from('photos')
      .upload(filePath, blob, { upsert: true });

    if (error) {
      throw error;
    }

    const { data: urlData } = this.supabase.client.storage
      .from('photos')
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  }

  private dataURLtoBlob(dataurl: string): Blob {
    const arr = dataurl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    const bstr = atob(arr[1]);
    const u8arr = new Uint8Array(bstr.length);

    for (let i = 0; i < bstr.length; i++) {
      u8arr[i] = bstr.charCodeAt(i);
    }

    return new Blob([u8arr], { type: mime });
  }

  // ============================================================
  // LEER FOTO BASE64
  // ============================================================
  private async readAsBase64(cameraPhoto: CameraPhoto): Promise<string> {
    if (this.platform.is('hybrid')) {
      const filePath = cameraPhoto.path ?? cameraPhoto.webPath;

      try {
        const file: ReadFileResult = await Filesystem.readFile({ path: filePath! });
        return `data:image/jpeg;base64,${file.data}`;
      } catch {
        const response = await fetch(cameraPhoto.webPath!);
        const blob = await response.blob();
        return await this.convertBlobToBase64(blob);
      }
    } else {
      const response = await fetch(cameraPhoto.webPath!);
      const blob = await response.blob();
      return await this.convertBlobToBase64(blob);
    }
  }

  private convertBlobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  }

  // ============================================================
  // 🔥 CARGAR SOLO FOTOS DESDE LA BASE DE DATOS DE SUPABASE
  // ============================================================
  public async getPhotosFromDatabase(): Promise<UserPhoto[]> {
    const { data, error } = await this.supabase.client
      .from('photos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("❌ Error cargando fotos BD:", error);
      return [];
    }

    return data.map(item => ({
      filepath: item.file_path,
      storageUrl: item.storage_url,
      latitude: item.latitude,
      longitude: item.longitude,
      mapsLink: item.maps_link,
      createdAt: item.created_at
    }));
  }

  // ============================================================
  // EXPORTAR .TXT
  // ============================================================
  public downloadPhotoLocationsTxt() {
    let txtContent = '';

    // Aquí se debe usar getPhotosFromDatabase, no lista local
    txtContent += 'Fotos Registradas en Supabase:\n\n';

    const generate = async () => {
      const photos = await this.getPhotosFromDatabase();

      photos.forEach(photo => {
        txtContent += `Foto: ${photo.filepath}, Lat: ${photo.latitude}, Lng: ${photo.longitude}, Link: ${photo.mapsLink}\n`;
      });

      const blob = new Blob([txtContent], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');

      a.href = url;
      a.download = 'photo_locations.txt';
      a.click();

      window.URL.revokeObjectURL(url);
    };

    generate();
  }
}

// ============================================================
// INTERFAZ
// ============================================================
export interface UserPhoto {
  filepath: string;
  storageUrl?: string;
  latitude?: number | null;
  longitude?: number | null;
  mapsLink?: string | null;
  createdAt?: string;
}
