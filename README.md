Aplicación Móvil – Registro de Mediciones de Agua (Ionic + Supabase)

Este proyecto consiste en el desarrollo de una aplicación móvil construida con Ionic + Angular, cuyo objetivo es digitalizar el proceso de toma de lecturas de medidores de agua en el Distrito Metropolitano de Quito.
La aplicación permite capturar, validar y almacenar mediciones de forma segura utilizando servicios en la nube como Supabase.

**Funcionalidades Principales**                              
Captura de Evidencia
Cada medición incluye:
Fotografía del medidor de agua.
Fotografía de la fachada de la vivienda.
Evidencia visual almacenada en Supabase Storage.

**Registro Automático de Ubicación**
Obtención de coordenadas GPS (latitud y longitud) utilizando los sensores nativos del dispositivo.

Generación automática de un enlace a Google Maps para validar visualmente el punto donde se tomó la lectura.


Datos de la Medición
Cada registro incluye:
Lectura actual del medidor.
Observaciones opcionales.
Usuario responsable del registro.


Perfiles y Permisos de Usuario
Medidor
Puede iniciar sesión.
Registrar nuevas mediciones con fotos y ubicación.
Visualizar únicamente sus propios registros gracias a políticas RLS de Supabase.

Administrador
Puede visualizar todos los registros realizados por todos los medidores.
Accede a fotos, coordenadas, enlaces de ubicación y detalles completos.


Backend – Supabase
Este proyecto utiliza:
Postgres + RLS → almacenamiento seguro de datos con políticas por usuario.
Supabase Storage → almacenamiento de fotos de medidor y fotos de fachada.

<img width="470" height="282" alt="image" src="https://github.com/user-attachments/assets/636f8fde-500c-420d-bbf6-504c2ee101f3" />


Instalación y Ejecución
npm install (Descarga de todo lo necesario)
ionic serve (Ver localmente)
ionic cap build android (Creación carpeta adorid para usar en android studio)

Login
<img width="1023" height="568" alt="image" src="https://github.com/user-attachments/assets/5e6b118c-b808-41ed-9308-9bfd770f23b4" />

Medidor interfaz: 
<img width="1023" height="721" alt="image" src="https://github.com/user-attachments/assets/de427c8f-e6e8-4387-ae48-c98c155adc25" />

Lleando todos los datos se guarda el registro
<img width="1020" height="713" alt="image" src="https://github.com/user-attachments/assets/27863639-04e9-410c-ac2e-e24ed51476e0" />
<img width="1023" height="712" alt="image" src="https://github.com/user-attachments/assets/6c9ba512-b483-4c38-aab8-a46990274dc8" />

Como otro medidor
<img width="1023" height="730" alt="image" src="https://github.com/user-attachments/assets/0cddbd94-119a-4690-baab-3dffdaa5c248" />
<img width="1015" height="718" alt="image" src="https://github.com/user-attachments/assets/0458714e-d56d-4b53-8f45-9c366f3bec26" />
<img width="640" height="704" alt="image" src="https://github.com/user-attachments/assets/dc58db8c-2c68-4d59-9afb-2b4f8b781309" />

Administrador interfaz: 
Credenciales
admin@gmail.com
admin123
<img width="1010" height="734" alt="image" src="https://github.com/user-attachments/assets/4f7ec480-d2bf-400b-9ef6-ae058b9179ed" />
<img width="1023" height="515" alt="image" src="https://github.com/user-attachments/assets/98f2838f-c980-4582-9aad-c3db7be06c70" />




