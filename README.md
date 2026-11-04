# Wevently - Frontend

## 📋 Descripción

Wevently Frontend es una aplicación web moderna construida con **React 19** y **Vite**, que proporciona una interfaz de usuario intuitiva y responsiva para la gestión completa de eventos. Permite a los usuarios organizar eventos, buscar y reservar lugares, contratar servicios, realizar pagos y gestionar todas las operaciones relacionadas con eventos de manera eficiente.

El proyecto implementa una **arquitectura modular por funcionalidades**, con comunicación en tiempo real mediante WebSockets, integración completa con MercadoPago, sistema de chat, y reportes analíticos visuales.

---

## 🚀 Stack Tecnológico

### Core

- **React 19.1.0** - Biblioteca principal para construcción de interfaces
- **Vite 6.3.5** - Build tool ultra-rápido con Hot Module Replacement (HMR)
- **React Router DOM 7.7.1** - Enrutamiento y navegación SPA
- **JavaScript (ES6+)** - Lenguaje de programación con características modernas

### UI Framework & Styling

- **Bootstrap 5.3.7** - Framework CSS para diseño responsivo
- **React Bootstrap 2.10.10** - Componentes Bootstrap para React
- **Tailwind CSS 4.1.12** - Utility-first CSS framework
- **Lucide React 0.534.0** - Biblioteca de iconos modernos
- **React Icons 5.5.0** - Colección extensa de iconos
- **FontAwesome 7.1.0** - Iconos vectoriales adicionales

### Formularios y Validación

- **Formik 2.4.6** - Gestión de formularios complejos
- **Yup 1.7.0** - Validación de esquemas para formularios
- **React Select 5.10.2** - Componente select avanzado
- **React Datepicker 8.4.0** - Selector de fechas intuitivo

### Comunicación en Tiempo Real

- **@stomp/stompjs 7.1.1** - Cliente STOMP para WebSocket
- **sockjs-client 1.6.1** - Cliente WebSocket con fallback
- **Axios 1.11.0** - Cliente HTTP para APIs REST

### Pagos

- **@mercadopago/sdk-react 1.0.6** - Integración oficial de MercadoPago

### Visualización de Datos

- **Chart.js 4.5.0** - Gráficos interactivos
- **react-chartjs-2 5.3.0** - Wrapper de Chart.js para React

### Generación de Documentos

- **jsPDF 2.5.1** - Generación de PDFs en el navegador
- **jspdf-autotable 3.5.28** - Tablas para PDFs
- **html2canvas 1.4.1** - Captura de elementos HTML
- **html2pdf.js 0.12.1** - Conversión HTML a PDF

### Upload de Archivos

- **Dropzone 6.0.0-beta.2** - Drag & drop de archivos
- **react-dropzone 14.3.8** - Componente React para uploads

### Utilidades

- **React Shadow 20.6.0** - Aislamiento de estilos con Shadow DOM

### Desarrollo

- **ESLint 9.25.0** - Linter para calidad de código
- **eslint-plugin-react-hooks 5.2.0** - Reglas para React Hooks
- **eslint-plugin-react-refresh 0.4.19** - HMR para React
- **@vitejs/plugin-react 4.4.1** - Plugin React para Vite
- **Plop 4.0.1** - Generador de código y scaffolding
- **PostCSS 8.5.6** - Transformación de CSS
- **Autoprefixer 10.4.21** - Prefijos CSS automáticos

---

## 🏗️ Arquitectura del Proyecto

### Estructura de Directorios

```
Wevently-React/
├── public/                          # Archivos estáticos públicos
│   └── assets/                      # Imágenes, logos, iconos
│
├── src/                             # Código fuente principal
│   ├── api/                         # Configuración de APIs y servicios HTTP
│   │   └── axios-config.js          # Configuración centralizada de Axios
│   │
│   ├── assets/                      # Recursos estáticos (CSS, imágenes globales)
│   │   ├── styles/                  # Estilos globales
│   │   └── images/                  # Imágenes del proyecto
│   │
│   ├── common/                      # Componentes y utilidades compartidas
│   │   ├── components/              # Componentes reutilizables
│   │   │   ├── Buscador.jsx         # Componente de búsqueda
│   │   │   ├── Filtros.jsx          # Sistema de filtros
│   │   │   ├── Paginacion.jsx       # Componente de paginación
│   │   │   └── Loading.jsx          # Indicadores de carga
│   │   │
│   │   ├── layouts/                 # Layouts base de la aplicación
│   │   │   ├── Navbar.jsx           # Barra de navegación principal
│   │   │   ├── Footer.jsx           # Pie de página
│   │   │   ├── Sidebar.jsx          # Menú lateral
│   │   │   └── Modal.jsx            # Modal genérico
│   │   │
│   │   └── API.js                   # URL base del backend
│   │
│   ├── context/                     # Contextos globales de React
│   │   ├── AuthContext.jsx          # Contexto de autenticación
│   │   ├── ThemeContext.jsx         # Contexto de tema
│   │   └── NotificationContext.jsx  # Contexto de notificaciones
│   │
│   ├── modules/                     # Módulos funcionales de la aplicación
│   │   │
│   │   ├── Usuarios&Seguridad/      # Autenticación y gestión de usuarios
│   │   │   ├── Login_y_register/
│   │   │   │   ├── Login_y_register.jsx
│   │   │   │   └── src/
│   │   │   │       ├── components/
│   │   │   │       │   ├── LoginForm.jsx
│   │   │   │       │   ├── RegisterForm.jsx
│   │   │   │       │   └── RecuperarPassword.jsx
│   │   │   │       ├── api/
│   │   │   │       │   └── authService.js
│   │   │   │       └── assets/
│   │   │   │
│   │   │   ├── Modificar_perfil/
│   │   │   │   └── Modificar_perfil.jsx
│   │   │   │
│   │   │   ├── Gestionar_notificaciones/
│   │   │   │   └── NotificationDropdown.jsx
│   │   │   │
│   │   │   ├── Configuraciones/
│   │   │   │   └── Rutas_Configuraciones.jsx
│   │   │   │
│   │   │   └── Rutas_Usuarios.jsx
│   │   │
│   │   ├── Eventos/                 # Gestión de eventos
│   │   │   ├── gestionar_eventos/
│   │   │   │   ├── gestionar_eventos.jsx
│   │   │   │   ├── src/
│   │   │   │   │   ├── components/
│   │   │   │   │   │   ├── EventoCard.jsx
│   │   │   │   │   │   ├── FormularioNuevoEvento.jsx
│   │   │   │   │   │   ├── DetalleEvento.jsx
│   │   │   │   │   │   └── ListaEventos.jsx
│   │   │   │   │   ├── api/
│   │   │   │   │   │   └── eventoService.js
│   │   │   │   │   └── assets/
│   │   │   │   │
│   │   │   │   └── contrataciones/
│   │   │   │       └── src/
│   │   │   │           ├── components/
│   │   │   │           │   ├── ContrataciónCard.jsx
│   │   │   │           │   └── DetalleContratacion.jsx
│   │   │   │           └── assets/
│   │   │   │
│   │   │   ├── src/
│   │   │   │   ├── components/
│   │   │   │   └── api/
│   │   │   │
│   │   │   └── Rutas_Eventos.jsx
│   │   │
│   │   ├── Lugares/                 # Gestión de lugares
│   │   │   ├── buscar_lugares/
│   │   │   │   ├── buscar_lugares.jsx
│   │   │   │   └── src/
│   │   │   │       ├── components/
│   │   │   │       │   ├── LugarCard.jsx
│   │   │   │       │   ├── FiltrosLugar.jsx
│   │   │   │       │   ├── MapaLugares.jsx
│   │   │   │       │   └── ListaLugares.jsx
│   │   │   │       ├── api/
│   │   │   │       │   └── lugarService.js
│   │   │   │       └── assets/
│   │   │   │
│   │   │   ├── VerDetalleLugar/
│   │   │   │   ├── VerDetalleLugar.jsx
│   │   │   │   └── src/
│   │   │   │       ├── components/
│   │   │   │       │   ├── GaleriaImagenes.jsx
│   │   │   │       │   ├── InformacionLugar.jsx
│   │   │   │       │   ├── CalendarioDisponibilidad.jsx
│   │   │   │       │   ├── ReseñasLugar.jsx
│   │   │   │       │   └── CaracteristicasLugar.jsx
│   │   │   │       └── assets/
│   │   │   │
│   │   │   ├── ABM_lugar/
│   │   │   │   ├── ABM_lugar.jsx
│   │   │   │   └── src/
│   │   │   │       ├── components/
│   │   │   │       │   ├── FormularioLugar.jsx
│   │   │   │       │   ├── UploadImagenes.jsx
│   │   │   │       │   └── ConfiguracionPrecio.jsx
│   │   │   │       └── assets/
│   │   │   │
│   │   │   ├── Mis_reservaciones/
│   │   │   │   ├── Mis_reservaciones.jsx
│   │   │   │   └── src/
│   │   │   │       ├── components/
│   │   │   │       │   └── ReservacionCard.jsx
│   │   │   │       └── assets/
│   │   │   │
│   │   │   ├── ConfiguracionesPropietario/
│   │   │   │   ├── ConfiguracionesPropietarioHome.jsx
│   │   │   │   └── src/
│   │   │   │       └── assets/
│   │   │   │
│   │   │   ├── src/
│   │   │   │   └── components/
│   │   │   │
│   │   │   └── Rutas_Lugares.jsx
│   │   │
│   │   ├── Servicios/               # Gestión de servicios
│   │   │   ├── buscar_servicios/
│   │   │   │   ├── buscar_servicios.jsx
│   │   │   │   └── src/
│   │   │   │       ├── components/
│   │   │   │       │   ├── ServicioCard.jsx
│   │   │   │       │   ├── FiltrosServicio.jsx
│   │   │   │       │   └── ListaServicios.jsx
│   │   │   │       └── api/
│   │   │   │
│   │   │   ├── VerDetalleServicio.jsx/
│   │   │   │   ├── VerDetalleServicio.jsx
│   │   │   │   └── src/
│   │   │   │       ├── components/
│   │   │   │       │   ├── InformacionServicio.jsx
│   │   │   │       │   ├── ReseñasServicio.jsx
│   │   │   │       │   └── PortfolioServicio.jsx
│   │   │   │       └── assets/
│   │   │   │
│   │   │   ├── ABM_servicio/
│   │   │   │   ├── abm_servicio.jsx
│   │   │   │   └── src/
│   │   │   │       └── components/
│   │   │   │           └── FormularioServicio.jsx
│   │   │   │
│   │   │   ├── chatear/
│   │   │   │   ├── IniciarChat.jsx
│   │   │   │   └── src/
│   │   │   │       ├── components/
│   │   │   │       │   ├── ChatWindow.jsx
│   │   │   │       │   ├── MensajeItem.jsx
│   │   │   │       │   ├── PropuestaCard.jsx
│   │   │   │       │   └── InputMensaje.jsx
│   │   │   │       └── api/
│   │   │   │           └── chatService.js
│   │   │   │
│   │   │   ├── Mis_reservaciones/
│   │   │   │   └── Mis_prestaciones.jsx
│   │   │   │
│   │   │   ├── ConfiguracionesPrestador/
│   │   │   │   └── ConfiguracionesPrestadorHome.jsx
│   │   │   │
│   │   │   └── Rutas_Servicios.jsx
│   │   │
│   │   ├── Pagos/                   # Procesamiento de pagos
│   │   │   ├── Reservar/
│   │   │   │   ├── Reservar.jsx
│   │   │   │   └── src/
│   │   │   │       ├── components/
│   │   │   │       │   ├── ResumenReserva.jsx
│   │   │   │       │   ├── FormularioDatos.jsx
│   │   │   │       │   └── SeleccionFecha.jsx
│   │   │   │       └── assets/
│   │   │   │
│   │   │   ├── Pagar/
│   │   │   │   ├── Pagar.jsx
│   │   │   │   └── src/
│   │   │   │       ├── components/
│   │   │   │       │   ├── ElegirMedioPago.jsx
│   │   │   │       │   ├── VistaMercadoPago.jsx
│   │   │   │       │   ├── CardFormMP.jsx
│   │   │   │       │   ├── DescargarFactura.jsx
│   │   │   │       │   └── ConfirmacionPago.jsx
│   │   │   │       ├── api/
│   │   │   │       │   └── pagoService.js
│   │   │   │       └── assets/
│   │   │   │
│   │   │   └── Rutas_Pagos.jsx
│   │   │
│   │   ├── Reportes/                # Reportes y analytics
│   │   │   ├── ver reporte financiero/
│   │   │   │   └── Ver_reporte_financiero.jsx
│   │   │   │
│   │   │   ├── Visualizar_cantidad_de_usuarios_activos/
│   │   │   │   └── VisualizarCantidadUsuariosActivos.jsx
│   │   │   │
│   │   │   ├── Visualizar_historial_de_eventos/
│   │   │   │   └── VisualizarHistorialDeEventos.jsx
│   │   │   │
│   │   │   ├── Visualizar_solicitudes_por_lugar/
│   │   │   │   └── VisualizarSolicitudesPorLugar.jsx
│   │   │   │
│   │   │   ├── Visualizar_vistas_por_lugar/
│   │   │   │   └── VisualizarVistasPorLugar.jsx
│   │   │   │
│   │   │   ├── Visualizar_vistas_por_servicio/
│   │   │   │   └── VisualizarVistasPorServicio.jsx
│   │   │   │
│   │   │   ├── Ver_lista_de_servicios_mas_solicitados/
│   │   │   │   └── VerListaDeServiciosMasSolicitados.jsx
│   │   │   │
│   │   │   ├── src/
│   │   │   │   ├── ReportesModalContext.jsx
│   │   │   │   └── reportesConfig.js
│   │   │   │
│   │   │   └── Rutas_Reportes.jsx
│   │   │
│   │   └── Backups/                 # Gestión de backups
│   │       ├── ABM Backups/
│   │       │   ├── ABMBackups.jsx
│   │       │   └── src/
│   │       │       └── api/
│   │       │
│   │       ├── src/
│   │       │   ├── components/
│   │       │   └── api/
│   │       │
│   │       └── Rutas_Backups.jsx
│   │
│   ├── App.jsx                      # Componente principal de la aplicación
│   ├── App.css                      # Estilos globales de la aplicación
│   ├── main.jsx                     # Punto de entrada de React
│   └── index.css                    # Estilos base
│
├── .env                             # Variables de entorno (no versionado)
├── .gitignore                       # Archivos ignorados por Git
├── eslint.config.js                 # Configuración de ESLint
├── vite.config.js                   # Configuración de Vite
├── package.json                     # Dependencias y scripts
└── README.md                        # Este archivo
```

### Patrón de Arquitectura

El proyecto implementa una **arquitectura modular por funcionalidades**:

#### 1. Módulos Independientes
Cada módulo (`Usuarios`, `Eventos`, `Lugares`, etc.) es autónomo y contiene:
- **Componentes específicos** del módulo
- **Servicios de API** propios
- **Estilos** particulares
- **Rutas** específicas

#### 2. Componentes Compartidos
- Ubicados en `/src/common/`
- Reutilizables en múltiples módulos
- Incluyen layouts, componentes UI y utilidades

#### 3. Gestión de Estado
- **Context API** para estado global (Auth, Theme, Notifications)
- **Local State** con `useState` para estado de componente
- **localStorage** para persistencia de datos del cliente

#### 4. Routing
- React Router DOM 7 con rutas anidadas
- Cada módulo define sus propias rutas
- Rutas protegidas con autenticación

---

## 🚀 Instalación y Configuración

### Prerrequisitos

**Software Requerido:**
- **Node.js 18.x** (específicamente, >=18 <19 según engines)
- **npm 9+** o **yarn 1.22+**
- **Git** para control de versiones

**Verificación:**
```bash
node --version   # Debe ser 18.x
npm --version    # 9 o superior
```

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/MarcioPal/Wevently-React.git
cd Wevently-React

# Instalar dependencias
npm install

# O con yarn
yarn install
```

### Variables de Entorno

Crear archivo `.env` en la raíz del proyecto:

```env
# API Backend
VITE_API_BASE_URL=http://localhost:8080
VITE_API_TIMEOUT=10000

# MercadoPago
VITE_MERCADOPAGO_PUBLIC_KEY=TEST-your-public-key

# WebSocket
VITE_WS_URL=http://localhost:8080/ws-notifications

# Configuración de la App
VITE_APP_NAME=Wevently
VITE_APP_VERSION=1.0.0
VITE_ENVIRONMENT=development

# Configuración de Uploads
VITE_MAX_FILE_SIZE=15728640
VITE_ALLOWED_FILE_TYPES=image/jpeg,image/png,image/jpg
```

**Nota:** Las variables deben tener el prefijo `VITE_` para ser accesibles en el código.

### Scripts Disponibles

```bash
# Desarrollo - Servidor con hot reload
npm run dev
# Acceso: http://localhost:5173

# Producción - Build optimizado
npm run build

# Preview - Servir build de producción localmente
npm run preview

# Linting - Verificar calidad de código
npm run lint

# Linting con fix - Corregir errores automáticamente
npm run lint -- --fix
```

### Configuración del Backend

Asegúrate de que el backend esté ejecutándose en `http://localhost:8080` o actualiza la URL en `src/common/API.js`:

```javascript
// src/common/API.js
const dominio = "http://localhost:8080"
export default dominio;
```

---

## 📱 Módulos de la Aplicación

### 👤 Usuarios & Seguridad

**Funcionalidades:**
- **Autenticación**
  - Login con email y contraseña
  - Registro de nuevos usuarios
  - Recuperación de contraseña por email
  - Logout
  
- **Gestión de Perfil**
  - Visualizar perfil del usuario
  - Editar datos personales
  - Cambiar foto de perfil
  - Actualizar contraseña
  
- **Notificaciones**
  - Notificaciones en tiempo real
  - Badge con contador
  - Dropdown de notificaciones
  - Marcar como leído
  
- **Configuraciones**
  - Preferencias de usuario
  - Configuración de privacidad
  - Gestión de permisos

**Componentes Principales:**
- `Login_y_register.jsx` - Pantalla de login/registro
- `Modificar_perfil.jsx` - Edición de perfil
- `NotificationDropdown.jsx` - Dropdown de notificaciones

**Navegación:**
- `/login` - Página de login
- `/register` - Página de registro
- `/perfil` - Perfil del usuario
- `/configuraciones` - Configuraciones

---

### 🎪 Eventos

**Funcionalidades:**
- **Gestión de Eventos**
  - Crear nuevos eventos
  - Editar eventos existentes
  - Listar eventos del usuario
  - Ver detalles completos
  - Eliminar eventos
  
- **Contrataciones**
  - Contratar lugares para eventos
  - Contratar servicios
  - Ver contrataciones activas
  - Gestionar estado de contrataciones
  
- **Estados de Evento**
  - Borrador
  - Publicado
  - En curso
  - Finalizado
  - Cancelado

**Componentes Principales:**
- `gestionar_eventos.jsx` - Panel principal de eventos
- `EventoCard.jsx` - Tarjeta de evento individual
- `FormularioNuevoEvento.jsx` - Formulario de creación
- `DetalleEvento.jsx` - Vista detallada
- `ContrataciónCard.jsx` - Tarjeta de contratación

**Navegación:**
- `/eventos` - Lista de eventos
- `/eventos/nuevo` - Crear evento
- `/eventos/:id` - Detalle de evento
- `/eventos/:id/editar` - Editar evento
- `/eventos/:id/contrataciones` - Contrataciones del evento

---

### 📍 Lugares

**Funcionalidades:**
- **Búsqueda y Exploración**
  - Buscar lugares por nombre
  - Filtrar por provincia y localidad
  - Filtrar por tipo de lugar
  - Filtrar por capacidad
  - Filtrar por características
  - Vista en lista o grid
  
- **Detalle de Lugar**
  - Galería de imágenes
  - Información completa
  - Calendario de disponibilidad
  - Características y servicios
  - Reseñas de usuarios
  - Ubicación en mapa
  
- **Gestión (Propietarios)**
  - Publicar nuevos lugares
  - Editar lugares existentes
  - Configurar precios por tipo de evento
  - Subir imágenes
  - Gestionar disponibilidad
  
- **Reservaciones**
  - Ver reservaciones recibidas
  - Aceptar/rechazar reservaciones
  - Ver historial de reservaciones

**Componentes Principales:**
- `buscar_lugares.jsx` - Buscador de lugares
- `LugarCard.jsx` - Tarjeta de lugar
- `VerDetalleLugar.jsx` - Vista detallada
- `ABM_lugar.jsx` - Alta/Baja/Modificación
- `Mis_reservaciones.jsx` - Panel de reservaciones
- `CalendarioDisponibilidad.jsx` - Calendario interactivo
- `GaleriaImagenes.jsx` - Galería de fotos

**Navegación:**
- `/lugares` - Búsqueda de lugares
- `/lugares/:id` - Detalle de lugar
- `/lugares/nuevo` - Publicar lugar
- `/lugares/:id/editar` - Editar lugar
- `/mis-lugares` - Lugares del propietario
- `/mis-reservaciones` - Reservaciones recibidas

---

### 🛠️ Servicios

**Funcionalidades:**
- **Búsqueda de Servicios**
  - Buscar por nombre
  - Filtrar por tipo de servicio
  - Filtrar por precio
  - Ver portfolio
  
- **Detalle de Servicio**
  - Información completa
  - Galería de trabajos previos
  - Reseñas y calificaciones
  - Precios y paquetes
  
- **Chat en Tiempo Real**
  - Comunicación directa con prestadores
  - WebSocket para mensajes instantáneos
  - Envío de propuestas comerciales
  - Aceptar/rechazar propuestas
  - Historial de conversaciones
  
- **Gestión (Prestadores)**
  - Publicar servicios
  - Editar información
  - Subir portfolio
  - Gestionar solicitudes

**Componentes Principales:**
- `buscar_servicios.jsx` - Buscador de servicios
- `ServicioCard.jsx` - Tarjeta de servicio
- `VerDetalleServicio.jsx` - Vista detallada
- `abm_servicio.jsx` - Gestión de servicios
- `IniciarChat.jsx` - Chat en tiempo real
- `ChatWindow.jsx` - Ventana de chat
- `PropuestaCard.jsx` - Tarjeta de propuesta
- `Mis_prestaciones.jsx` - Panel del prestador

**Navegación:**
- `/servicios` - Búsqueda de servicios
- `/servicios/:id` - Detalle de servicio
- `/servicios/nuevo` - Publicar servicio
- `/servicios/:id/editar` - Editar servicio
- `/chat/:id` - Chat con prestador
- `/mis-servicios` - Servicios del prestador

**Integración WebSocket:**
```javascript
// Conexión al chat
const socket = new SockJS('http://localhost:8080/ws-notifications');
const stompClient = Stomp.over(socket);

stompClient.connect({ Authorization: `Bearer ${token}` }, () => {
  stompClient.subscribe('/topic/chat/123', (message) => {
    const nuevoMensaje = JSON.parse(message.body);
    // Actualizar UI
  });
});
```

---

### 💳 Pagos

**Funcionalidades:**
- **Proceso de Reserva**
  - Selección de fecha y horario
  - Resumen de la reserva
  - Cálculo de totales
  - Formulario de datos del cliente
  
- **Métodos de Pago**
  - **Redirección a MercadoPago**
    - Usuario es redirigido a MP
    - Paga en plataforma externa
    - Retorno automático con resultado
    
  - **Card Form (Pago con Tarjeta)**
    - Pago sin salir del sitio
    - Formulario de tarjeta integrado
    - Tokenización segura
    - Procesamiento instantáneo
  
- **Facturación**
  - Generación automática de facturas
  - Descarga en PDF
  - Detalle de items
  - Información fiscal

**Componentes Principales:**
- `Reservar.jsx` - Proceso de reserva
- `ResumenReserva.jsx` - Resumen y totales
- `Pagar.jsx` - Pantalla de pago
- `ElegirMedioPago.jsx` - Selección de medio
- `VistaMercadoPago.jsx` - Redirección a MP
- `CardFormMP.jsx` - Formulario de tarjeta
- `ConfirmacionPago.jsx` - Confirmación de pago
- `DescargarFactura.jsx` - Generación de PDF

**Navegación:**
- `/reservar/:tipoId/:id` - Iniciar reserva
- `/pagar/:reservaId` - Realizar pago
- `/pago/success` - Pago exitoso
- `/pago/failure` - Pago fallido
- `/pago/pending` - Pago pendiente
- `/factura/:id` - Descargar factura

**Integración MercadoPago:**

```javascript
import { initMercadoPago, CardPayment } from '@mercadopago/sdk-react';

// Inicializar SDK
initMercadoPago('YOUR_PUBLIC_KEY');

// Card Form
<CardPayment
  initialization={{
    amount: totalAmount,
    payer: { email: userEmail }
  }}
  onSubmit={async (formData) => {
    // Enviar al backend
    const response = await axios.post('/api/pagos/procesar-pago', formData);
    return response.data;
  }}
/>
```

---

### 📊 Reportes

**Funcionalidades:**
- **Reportes Financieros**
  - Ingresos por período
  - Comisiones generadas
  - Gráficos de evolución
  - Exportación a PDF
  
- **Métricas de Usuarios**
  - Usuarios activos por período
  - Nuevos registros
  - Tasa de retención
  
- **Analytics de Lugares**
  - Vistas por lugar
  - Solicitudes de reserva
  - Tasa de conversión
  - Lugares más populares
  
- **Analytics de Servicios**
  - Vistas por servicio
  - Servicios más solicitados
  - Ranking de prestadores
  
- **Historial de Eventos**
  - Eventos por usuario
  - Estados de eventos
  - Timeline de eventos

**Componentes Principales:**
- `Ver_reporte_financiero.jsx` - Reporte financiero
- `VisualizarCantidadUsuariosActivos.jsx` - Usuarios activos
- `VisualizarVistasPorLugar.jsx` - Analytics lugares
- `VisualizarVistasPorServicio.jsx` - Analytics servicios
- `VisualizarHistorialDeEventos.jsx` - Historial eventos
- `VerListaDeServiciosMasSolicitados.jsx` - Top servicios

**Navegación:**
- `/reportes` - Dashboard de reportes
- `/reportes/financiero` - Reporte financiero
- `/reportes/usuarios` - Usuarios activos
- `/reportes/lugares` - Analytics lugares
- `/reportes/servicios` - Analytics servicios
- `/reportes/eventos` - Historial eventos

**Visualización con Chart.js:**
```javascript
import { Line, Bar, Pie } from 'react-chartjs-2';

<Line
  data={{
    labels: ['Ene', 'Feb', 'Mar', 'Abr'],
    datasets: [{
      label: 'Ingresos',
      data: [12000, 19000, 15000, 25000]
    }]
  }}
  options={{ responsive: true }}
/>
```

---

### 🔧 Backups

**Funcionalidades:**
- **Gestión de Backups**
  - Crear backup manual
  - Configurar backups automáticos
  - Descargar backups
  - Restaurar desde backup
  - Eliminar backups antiguos
  
- **Configuración**
  - Frecuencia (diaria, semanal, mensual)
  - Retención de backups
  - Notificaciones
  - Estado de backups

**Componentes Principales:**
- `ABMBackups.jsx` - Gestión de backups

**Navegación:**
- `/backups` - Panel de backups
- `/backups/nuevo` - Crear backup
- `/backups/configuracion` - Configurar automáticos

---

## 🎨 Sistema de Estilos

### Bootstrap 5

El proyecto utiliza **Bootstrap 5.3.7** como framework CSS principal:

```jsx
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

// Componentes de React Bootstrap
import { Container, Row, Col, Card, Button, Modal } from 'react-bootstrap';

<Container>
  <Row>
    <Col md={6}>
      <Card>
        <Card.Body>
          <Card.Title>Título</Card.Title>
          <Card.Text>Contenido</Card.Text>
          <Button variant="primary">Acción</Button>
        </Card.Body>
      </Card>
    </Col>
  </Row>
</Container>
```

### Tailwind CSS

Integración de **Tailwind CSS 4** para utility classes:

```jsx
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
  <h2 className="text-2xl font-bold text-gray-800">Título</h2>
  <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
    Acción
  </button>
</div>
```

### CSS Modules (Opcional)

Para estilos con alcance de componente:

```css
/* Component.module.css */
.container {
  padding: 20px;
  background-color: #f5f5f5;
}

.title {
  font-size: 24px;
  color: #333;
}
```

```jsx
import styles from './Component.module.css';

<div className={styles.container}>
  <h2 className={styles.title}>Título</h2>
</div>
```

### Responsive Design

El proyecto implementa diseño **Mobile First**:

```css
/* Mobile (default) */
.container {
  padding: 10px;
}

/* Tablet */
@media (min-width: 768px) {
  .container {
    padding: 20px;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .container {
    padding: 30px;
  }
}
```

**Breakpoints Bootstrap:**
- **xs**: < 576px
- **sm**: ≥ 576px
- **md**: ≥ 768px
- **lg**: ≥ 992px
- **xl**: ≥ 1200px
- **xxl**: ≥ 1400px

---

## 🔗 Integración con Backend

### Configuración de Axios

```javascript
// api/axios-config.js
import axios from 'axios';
import dominio from '../common/API';

const api = axios.create({
  baseURL: dominio,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para agregar token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### Servicios de API

Cada módulo tiene sus propios servicios:

```javascript
// modules/Eventos/src/api/eventoService.js
import api from '../../../../api/axios-config';

export const eventoService = {
  
  // Obtener todos los eventos
  getAll: async (page = 0, size = 10) => {
    const response = await api.get(`/api/eventos?page=${page}&size=${size}`);
    return response.data;
  },
  
  // Obtener por ID
  getById: async (id) => {
    const response = await api.get(`/api/eventos/${id}`);
    return response.data;
  },
  
  // Crear evento
  create: async (eventoData) => {
    const response = await api.post('/api/eventos', eventoData);
    return response.data;
  },
  
  // Actualizar evento
  update: async (id, eventoData) => {
    const response = await api.put(`/api/eventos/${id}`, eventoData);
    return response.data;
  },
  
  // Eliminar evento
  delete: async (id) => {
    const response = await api.delete(`/api/eventos/${id}`);
    return response.data;
  }
};
```

### Uso en Componentes

```jsx
import { useState, useEffect } from 'react';
import { eventoService } from './api/eventoService';

function ListaEventos() {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchEventos = async () => {
      try {
        setLoading(true);
        const data = await eventoService.getAll();
        setEventos(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEventos();
  }, []);
  
  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      {eventos.map(evento => (
        <div key={evento.id}>{evento.nombre}</div>
      ))}
    </div>
  );
}
```

---

## 🔒 Gestión de Autenticación

### Context de Autenticación

```javascript
// context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('authToken'));
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (token) {
      // Verificar token y cargar usuario
      loadUser();
    } else {
      setLoading(false);
    }
  }, [token]);
  
  const login = async (credentials) => {
    const response = await api.post('/api/seguridad/usuarios/login', credentials);
    const { token, ...userData } = response.data;
    
    localStorage.setItem('authToken', token);
    setToken(token);
    setUser(userData);
  };
  
  const logout = () => {
    localStorage.removeItem('authToken');
    setToken(null);
    setUser(null);
  };
  
  const loadUser = async () => {
    try {
      const response = await api.get('/api/seguridad/usuarios/perfil');
      setUser(response.data);
    } catch (error) {
      logout();
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
```

### Rutas Protegidas

```jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children, requiredRole }) {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Cargando...</div>;
  
  if (!user) return <Navigate to="/login" />;
  
  if (requiredRole && !user.roles.includes(requiredRole)) {
    return <Navigate to="/" />;
  }
  
  return children;
}

// Uso
<Route path="/admin" element={
  <ProtectedRoute requiredRole="ROLE_ADMIN">
    <AdminPanel />
  </ProtectedRoute>
} />
```

---

## 🧪 Testing y Calidad

### ESLint

Configuración en `eslint.config.js`:

```javascript
export default [
  { ignores: ['dist'] },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
]
```

### Estándares de Código

```javascript
// ✅ Buenas prácticas

// 1. Componentes funcionales con hooks
function MiComponente({ prop1, prop2 }) {
  const [state, setState] = useState(initialValue);
  
  useEffect(() => {
    // Side effects
  }, [dependencies]);
  
  return <div>{/* JSX */}</div>;
}

// 2. Destructuring de props
function Card({ title, description, image }) {
  return (
    <div className="card">
      <img src={image} alt={title} />
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

// 3. Naming conventions
const handleClick = () => {}; // Handlers: handleXxx
const isLoading = true;       // Booleans: is/has/should
const userList = [];          // Arrays: xxxList o xxxs

// 4. Async/await para operaciones asíncronas
const fetchData = async () => {
  try {
    const response = await api.get('/data');
    setData(response.data);
  } catch (error) {
    console.error(error);
  }
};
```

---

## 🚀 Deployment

### Build de Producción

```bash
# Generar build optimizado
npm run build

# El build se genera en la carpeta 'dist/'
```

**Optimizaciones incluidas:**
- Minificación de JavaScript
- Tree shaking (eliminación de código no usado)
- Code splitting automático
- Compresión de assets
- Source maps para debugging

### Variables de Entorno por Ambiente

```bash
# Desarrollo (.env.development)
VITE_API_BASE_URL=http://localhost:8080
VITE_MERCADOPAGO_PUBLIC_KEY=TEST-xxx

# Producción (.env.production)
VITE_API_BASE_URL=https://api.wevently.com
VITE_MERCADOPAGO_PUBLIC_KEY=APP_USR-xxx
```

### Despliegue en Vercel

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy a producción
vercel --prod
```

### Despliegue en Netlify

```bash
# Crear archivo netlify.toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## 🐛 Debugging y Troubleshooting

### Problemas Comunes

#### 1. Error de CORS

```
Access to fetch at 'http://localhost:8080/api/...' has been blocked by CORS
```

**Solución:** Configurar proxy en `vite.config.js`:

```javascript
export default defineConfig({
  server: {
    proxy: {
      '/api': 'http://localhost:8080'
    }
  }
})
```

#### 2. WebSocket no conecta

```
WebSocket connection failed
```

**Solución:** Verificar configuración en `vite.config.js`:

```javascript
server: {
  proxy: {
    '/ws-notifications': {
      target: 'http://localhost:8080',
      ws: true
    }
  }
}
```

#### 3. MercadoPago no inicializa

```
MercadoPago is not defined
```

**Solución:** Verificar que la public key esté configurada:

```javascript
import { initMercadoPago } from '@mercadopago/sdk-react';

initMercadoPago(import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY);
```

#### 4. Imágenes no cargan

**Solución:** Usar rutas correctas para assets:

```jsx
// ❌ Incorrecto
<img src="./image.png" />

// ✅ Correcto
import image from './assets/image.png';
<img src={image} />

// O usar public folder
<img src="/assets/image.png" />
```

### React DevTools

Instalar extensión de navegador:
- [Chrome](https://chrome.google.com/webstore/detail/react-developer-tools)
- [Firefox](https://addons.mozilla.org/en-US/firefox/addon/react-devtools/)

---

## 📝 Contribución

### Flujo de Trabajo Git

```bash
# 1. Actualizar main
git checkout main
git pull origin main

# 2. Crear rama develop si no existe
git checkout -b develop

# 3. Crear feature branch desde develop
git checkout -b feature/nueva-funcionalidad

# 4. Hacer cambios y commits
git add .
git commit -m "feat: agregar nueva funcionalidad X"

# 5. Push de la rama
git push origin feature/nueva-funcionalidad

# 6. Mergear a develop (cuando funcione)
git checkout develop
git merge feature/nueva-funcionalidad

# 7. Mergear a main (para producción)
git checkout main
git merge develop
git push origin main
```

### Estándares de Commit (Sugerido)

```
feat: nueva funcionalidad
fix: corrección de bug
docs: cambios en documentación
style: formateo, estilos CSS
refactor: refactorización de código
test: agregar tests
chore: cambios en build, dependencias
perf: mejoras de rendimiento
```

### Checklist Pre-Commit

- [ ] El código compila sin errores: `npm run build`
- [ ] ESLint sin errores: `npm run lint`
- [ ] Componentes responsive probados
- [ ] No hay console.log innecesarios
- [ ] Funciona en Chrome, Firefox, Safari
- [ ] Documentación actualizada si es necesario

---

## 📦 Browser Support

**Navegadores Soportados:**
- **Chrome** 90+
- **Firefox** 88+
- **Safari** 14+
- **Edge** 90+

**Características requeridas:**
- ES6+ support
- CSS Grid
- Flexbox
- WebSocket
- LocalStorage

---

## 👥 Equipo de Desarrollo

- **Alejandro Arce** - Desarrollador Full Stack
- **Enzo Silva** - Desarrollador Full Stack
- **Iván Duga** - Desarrollador Full Stack
- **Marcio Palazzo** - Arquitecto de Software / Tech Lead
- **Cristian Rosales** - Desarrollador Full Stack

---

## 🔗 Enlaces Útiles

### Documentación Oficial
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [React Router](https://reactrouter.com)
- [Bootstrap Documentation](https://getbootstrap.com)

### Librerías Principales
- [MercadoPago React SDK](https://www.mercadopago.com.ar/developers/es/docs/sdks-library/client-side/react-installation)
- [Chart.js Documentation](https://www.chartjs.org)
- [Formik Documentation](https://formik.org)
- [Axios Documentation](https://axios-http.com)

### Herramientas
- [React DevTools](https://react.dev/learn/react-developer-tools)
- [Vite Plugins](https://vitejs.dev/plugins/)
- [ESLint Rules](https://eslint.org/docs/rules/)

### Recursos del Proyecto
- [Repositorio Backend](https://github.com/MarcioPal/Wevently-back)
- [Repositorio Frontend](https://github.com/MarcioPal/Wevently-React)


---

**Versión:** 1.0.0  
**Última actualización:** Diciembre 2025  
**React:** 19.1.0  
**Vite:** 6.3.5  
**Node:** 18.x
