
# 🐾 **Amigos Peludos - Sistema de Gestión de Mascotas para Adopción**

Amigos Peludos es una aplicación web desarrollada con Angular 20 que permite administrar mascotas disponibles para adopción dentro de un refugio. El sistema reúne funciones para visitantes y administradores, integrando listados de animales, detalles individuales, formularios de alta, gestión de donaciones, notificaciones y un módulo completo para solicitudes de adopción.

El proyecto combina una interfaz clara y moderna con un backend simulado mediante JSON Server, permitiendo mantener una base actualizada de mascotas, usuarios, favoritos, solicitudes y comentarios del refugio.


---

# **Esta pensado para dos perfiles:**

 
---

##  **Características Principales**

###  👤 Usuarios adoptantes

El sistema ofrece a los adoptantes una experiencia fluida y organizada:
* Catálogo general de mascotas con datos principales.
* Acceso al detalle individual de cada animal.
* Panel para gestionar información personal.
* Sección de favoritos para guardar mascotas de interés.
* Realización de donaciones con diferentes métodos de pago.
* Recepción de notificaciones internas.
* Navegación rápida y dinámica entre vistas.

# **Interfaz y experiencia de usuario**
*La plataforma se diseñó pensando en la comodidad del usuario:*

* UI moderna, clara y responsiva, adaptable a distintos dispositivos.
* Navegación fluida, sin recargas innecesarias de página.
* Indicadores visuales, loaders y mensajes de estado para guiar al usuario durante las acciones.

 # **Administración del refugio**

El área administrativa permite gestionar la operación completa del sistema:

* Alta, baja y edición de animales.
* Registro de animales adoptados o dados de baja.
* Administración de comentarios sobre el refugio.
* Control completo de solicitudes de adopción.
* Acceso al historial de donaciones.
* Emisión y administración de notificaciones.
* Navegación organizada bajo un panel diseñado para eficiencia.
 **El acceso al panel se realiza mediante credenciales predefinidas:**

DNI: admin
Contraseña: admin1234!


## **Algunas de las tecnologias que usamos son:**
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

##  **Cómo instalarlo?**

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
# Instalar JSON Server globalmente (si no lo tienes)
npm install -g json-server

# Iniciar JSON Server en el puerto 3000
json-server --watch database/db.json --port 3000
```

### 4. Iniciar Angular

```bash
ng serve -o
```

---

##  **Y ya casi estamos**

* Entrá a `http://localhost:4200`
* Crea una cuenta
* o utiliza las credenciales de admin proporcionadas
* Disfruta del proyecto


## 📁 **Como esta formada la estructura del Proyecto**

```bash
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
    │   │   ├── donations/               # Gestión de donaciones
    │   │   ├── footer/                  # Pie de página
    │   │   ├── header/                  # Encabezado de navegación
    │   │   ├── img-upload/              # Subida de imágenes
    │   │   ├── registro/                # Registro de usuarios
    │   │   └── user/                    # Funcionalidades del usuario
    │
    │   ├── guards/                       # Protección de rutas
    │   │   └── admin-guard.ts
    │
    │   ├── login/                        # Inicio de sesión
    │   ├── models/                       # Modelos de datos TypeScript
    │   ├── page/                         # Páginas principales
    │   └── services/                     # Servicios de la aplicación
    │
    ├── assets/                           # Recursos estáticos
    └── environments/                     # Configuración de entornos
```

El diseño esta basado en lo siguiente:

* Componentes: Estructura principal de la UI, reutilizables y organizados por funcionalidades.
* Servicios: Lógica de negocio y conexión con la API.
* Modelos: Tipos e interfaces TypeScript para manejar datos de forma tipada.
* Ruteo declarativo: Navegación definida mediante app.routes.ts.
* Formularios reactivos: Manejo de formularios con validaciones y control desde TypeScript.

##  **Algunas de las API y Servicios que consume la aplicacion**

###  PetsService
* getPets(): Observable<Pet[]>
* getPet(id: string): Observable<Pet>
* createPet(data: Pet): Observable<Pet>
* updatePet(id: string, data: Pet): Observable<Pet>
* deletePet(id: string): Observable<void>


###  SolicitudesService
* create(animalId, dni, mensaje, extraDatos)
* listByUser(dni)
* getById(id)
* listAll()
* fetchUserRequestForAnimal(animalId, dni)
* cambiarEstado(id, estado, comentarios?)
* delete(id)


###  UserService (Favoritos + Perfil + Notificaciones)
* addFavorite(petId: string)
* removeFavorite(petId: string)
* getFavorites(): string[]
* updateProfile(partial: Partial<UserProfile>)
* pushNotification(message: string)
* markAsRead(id: string)
* clearNotifications()

###  CommentService
* getCommentsByPet(petId: string)
* addComment(comment)
* deleteComment(id)


###  DonationService
* createDonation(data)
* getDonations()


### Primera Versión entregada el 20/11/25
**Contiene:**
* CRUD de mascotas
* Rutas y navegación
* Formularios reactivos
* Sistema de Auth


---
## **Licencia**

Proyecto académico para la materia Laboratorio IV UTN Mar del plata 2025.

## 📬 Contacto

* Equipo de Desarrollo: AmigosPeludos
* Email: amigospeludos@gmail.com
* Link del proyecto : https://github.com/FrancoBruntz/-AmigosPeludos-.git
* Documentación Tecnica: Pedir al equipo tecnico
---


