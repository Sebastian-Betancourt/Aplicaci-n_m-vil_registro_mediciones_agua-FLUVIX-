import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { createClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';

// Ionic standalone components
import { 
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonItem, IonLabel, IonInput, IonButton
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  imports: [
    CommonModule,
    FormsModule,

    // Ionic components usados en el HTML
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    IonItem, IonLabel, IonInput, IonButton
  ]
})
export class HomePage implements OnInit {

  // Formularios
  showLogin = true;

  email = '';
  password = '';
  name = '';

  private supabase = createClient(environment.supabaseUrl, environment.supabaseAnonKey);

  constructor(private router: Router) {}

  ngOnInit() {
    const storedId = localStorage.getItem('userId');
    const storedRole = localStorage.getItem('userRole');

    if (storedId && storedRole) {
      if (storedRole === 'admin') {
        this.router.navigate(['/admin-dashboard']);
      } else if (storedRole === 'medidor') {
        this.router.navigate(['/medidor-dashboard']);
      }
    }
  }

  toggleForm() {
    this.showLogin = !this.showLogin;
    this.email = '';
    this.password = '';
    this.name = '';
  }

  // LOGIN
  async login() {
    if (!this.email || !this.password) {
      alert('Completa correo y contraseña');
      return;
    }

    const { data: user, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('email', this.email)
      .eq('password', this.password)
      .single();

    if (error || !user) {
      alert('Usuario o contraseña incorrectos');
      return;
    }

    localStorage.setItem('userId', user.id);
    localStorage.setItem('userRole', user.role);
    localStorage.setItem('userName', user.name);

    if (user.role === 'admin') {
      this.router.navigate(['/admin-dashboard']);
    } else {
      this.router.navigate(['/medidor-dashboard']);
    }
  }

  // REGISTRO
  async register() {
    if (!this.name || !this.email || !this.password) {
      alert('Completa todos los campos');
      return;
    }

    const { error } = await this.supabase
      .from('users')
      .insert([{
        id: crypto.randomUUID(),
        name: this.name,
        email: this.email,
        password: this.password,
        role: 'medidor'
      }]);

    if (error) {
      alert('Error al registrar: ' + error.message);
      return;
    }

    alert('Registro exitoso. Ahora puedes iniciar sesión.');
    this.toggleForm();
  }
}
