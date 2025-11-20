
# 🐾 **Amigos Peludos - Sistema de Gestión de Mascotas para Adopción**

Aplicación web desarrollada en Angular para gestionar mascotas disponibles para adopción, incluyendo listado, detalle y carga de nuevas mascotas.

---

## 📚 **Tabla de Contenidos**

* Sobre el Proyecto
* Características
* Tecnologías Utilizadas
* Requisitos Previos
* Instalación
* Uso
* Estructura del Proyecto
* Arquitectura
* API y Servicios
* Roadmap
* Licencia
* Contacto

---

##  **Sobre el Proyecto**

**Amigos Peludos** es una aplicación web desarrollada con **Angular 20** que permite registrar, listar y visualizar mascotas disponibles para adopción. Sistema pensado para un refugio de mascotas.
 Incluye vistas para:

* ver el catálogo de mascotas
* ver los detalles de una mascota
* agregar nuevas mascotas mediante un formulario reactivo
* realizar donaciones
* ver comentarios del refugio
* sistema de notificaciones

El objetivo es brindar una experiencia clara y ágil para mantener actualizada la base de mascotas.

---

##  **Características Principales**

###  Adoptantes (uso general)

* Listado de mascotas con datos principales
* Detalle completo de cada mascota
* Control de sus datos personales
* Listado de mascotas favoritas
* Donaciones con distintos metodos de pago
* Sistema de notificaciones
* Navegación fluida entre las vistas

###  Administradores 

* Carga de animales / Edicion de animales
* Alta y baja de animales
* Historial de animales adoptados / dados de baja
* Gestion de comentarios sobre el refugio
* Sistema de notificaciones
* Gestion de solicitudes de adopcion
* Historial de donaciones
* Navegación fluida entre las vistas

###  Funcionalidades Técnicas

* Formularios reactivos con validaciones
* Ruteo completo con parámetros
* Servicio centralizado para API REST
* Manejo de errores
* Simulación de backend con JSON Server

---

## **Tecnologías Utilizadas**

### Front-end

* **Angular 20** 
* **TypeScript**
* **Angular Router**
* **Reactive Forms**
* **RxJS**

### Back-end (Simulado)

* **JSON Server**

### Herramientas

* **Angular CLI**
* **VS Code**
* **Node.js**

---

##  **Requisitos Previos**

* Node.js 18+
* npm 8+
* Angular CLI 17+
* JSON Server instalado globalmente

---

##  **Instalación**

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/amigos-peludos.git
cd amigos-peludos
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Iniciar JSON Server

```bash
json-server --watch database/db.json --port 3000
```

### 4. Iniciar Angular

```bash
ng serve -o
```

---

##  **Uso**

* Entrá a `http://localhost:4200`
* Navegá por el catálogo de mascotas
* Consultá el detalle de cada una
* Agregá nuevas mascotas desde “Agregar mascota”

## Acceso como Administrador

1. Inicia sesión con credenciales de administrador:
* Email: agus@gmail.com
* Contraseña: hola123
2. Accede al panel de administración
3. Crea eventos, gestiona descuentos y visualiza estadísticas

 --- 

## 📁 **Estructura del Proyecto**

TuProyecto/
├── public/                              # Archivos públicos
│   └── favicon.ico
│
└── src/
    ├── index.html                       # HTML principal
    ├── main.ts                          # Punto de entrada de Angular
    ├── styles.css                       # Estilos globales
    │
    ├── app/
    │   ├── app.ts                       # Componente raíz
    │   ├── app.html                     # Template principal
    │   ├── app.css                      # Estilos del componente raíz
    │   ├── app.config.ts                # Configuración de la app
    │   ├── app.routes.ts                # Definición de rutas
    │   └── app.spec.ts                  # Tests del componente raíz
    │
    │   ├── auth/                        # Servicios de autenticación
    │   │   ├── auth-service.ts
    │   │   └── auth-service.spec.ts
    │
    │   ├── component/                   # Componentes reutilizables
    │   │   ├── comentarios/             # Comentarios de usuarios
    │   │   │   ├── comentarios.ts
    │   │   │   ├── comentarios.html
    │   │   │   ├── comentarios.css
    │   │   │   └── comentarios.spec.ts
    │   │   │
    │   │   ├── donations/               # Gestión de donaciones
    │   │   │   ├── donation-details/    # Detalle de donación
    │   │   │   ├── donation-form/       # Formulario de donación
    │   │   │   ├── donation-list/       # Lista de donaciones
    │   │   │   └── my-donations/        # Donaciones del usuario
    │   │   │
    │   │   ├── footer/                  # Pie de página
    │   │   ├── header/                  # Encabezado de navegación
    │   │   ├── img-upload/              # Subida de imágenes
    │   │   └── registro/                # Registro de usuarios
    │   │
    │   │   └── user/                     # Funcionalidades del usuario
    │   │       ├── user.service.ts       # Servicio del usuario
    │   │       ├── favorites/            # Favoritos del usuario
    │   │       ├── notifications/        # Notificaciones
    │   │       └── profile/              # Perfil del usuario
    │
    │   ├── guards/                       # Protección de rutas
    │   │   └── admin-guard.ts
    │
    │   ├── login/                        # Inicio de sesión
    │   │   ├── login.ts
    │   │   ├── login.html
    │   │   ├── login.css
    │   │   └── login.spec.ts
    │
    │   ├── models/                       # Modelos de datos TypeScript
    │   │   ├── comentarios.ts
    │   │   ├── donation.ts
    │   │   ├── notificacion.ts
    │   │   ├── pets.ts
    │   │   ├── solicitud.ts
    │   │   └── user.ts
    │
    │   ├── page/                         # Páginas principales
    │   │   ├── adopcion/                 # Gestión de solicitudes de adopción
    │   │   │   ├── admin-request/
    │   │   │   ├── request-details/
    │   │   │   ├── request-form/
    │   │   │   └── request-list/
    │   │   │
    │   │   ├── details/                  # Detalle de mascota
    │   │   ├── form/                     # Formulario general
    │   │   ├── home/                     # Página principal
    │   │   ├── list/                     # Lista de mascotas
    │   │   └── refugio/                  # Información del refugio
    │
    │   └── services/                     # Servicios de la aplicación
    │       ├── comentarioservice.ts
    │       ├── donationsservice.ts
    │       ├── favorite.service.ts
    │       ├── notificacionservice.ts
    │       ├── petsservice.ts
    │       └── solicitudesservice.ts
    │
    ├── assets/                           # Recursos estáticos (imágenes)
    │   ├── adoptado.webp
    │   ├── amor.jpg
    │   ├── animales.png
    │   ├── cuidado.jpg
    │   ├── cuidados.jpg
    │   ├── familia.png
    │   ├── fondo.webp
    │   ├── imgrefugio.webp
    │   └── logo1.png
    │
    └── environments/                     # Configuración de entornos
        ├── environment.ts
        └── environment.development.ts


---

##  **Arquitectura**

Patrón basado en:

* Componentes: Estructura principal de la UI, reutilizables y organizados por funcionalidades.
* Servicios: Lógica de negocio y conexión con la API.
* Modelos: Tipos e interfaces TypeScript para manejar datos de forma tipada.
* Ruteo declarativo: Navegación definida mediante app.routes.ts.
* Formularios reactivos: Manejo de formularios con validaciones y control desde TypeScript.

Flujo:

```
Componentes ↔ Servicios ↔ JSON Server
         ↓              ↓
     Modelos        Formularios
```

---

##  **API y Servicios**

### MascotasService

* `getMascotas()`
* `getMascotaById(id)`
* `addMascota(mascota)`
* `updateMascota(mascota)`
* `deleteMascota(id)`

---

## **Roadmap**

### Versión actual (1.0)

* CRUD de mascotas
* Rutas y navegación
* Formularios reactivos
* Sistema de Auth


### Próximas funcionalidades

* 
* 
* 
* 

---

## **Licencia**

Proyecto académico para la materia Laboratorio IV UTN Mar del plata 2025.

---

## 📬 Contacto

Equipo de Desarrollo: AmigosPeludos
Email: amigospeludos@gmail.com
Link del proyecto

---