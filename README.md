# Wevently · Frontend

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-7-CA4245?logo=reactrouter&logoColor=white)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5-7952B3?logo=bootstrap&logoColor=white)
![MercadoPago](https://img.shields.io/badge/Pagos-MercadoPago-00B1EA?logo=mercadopago&logoColor=white)

Interfaz web de **Wevently**, una plataforma para organizar eventos que conecta a **organizadores** con **propietarios de lugares** y **prestadores de servicios**. Desde la app se pueden crear eventos, buscar y reservar lugares y servicios, chatear en tiempo real con los prestadores, pagar con MercadoPago y consultar reportes.

> Proyecto final de la carrera **Ingeniería en Sistemas – UTN Facultad Regional Mendoza**, desarrollado en equipo.
> Backend: [wevently-backend](https://github.com/alear123/wevently-backend)

---

## Funcionalidades

- **Cuenta**: registro, login, perfil y recuperación de contraseña en 4 pasos (email → código → nueva contraseña → éxito).
- **Eventos**: crear, editar y cancelar eventos; ver el lugar y los servicios contratados para cada uno.
- **Lugares y Servicios**: búsqueda con filtros, detalle, ABM para propietarios/prestadores y reseñas.
- **Reservas y pagos**: flujo guiado *detalle → formulario de reserva → medio de pago → pago* con los componentes de MercadoPago (`Wallet` y `CardPayment`).
- **Chat en tiempo real** entre organizador y prestador, con propuestas de precio y sonidos de mensaje.
- **Notificaciones** en vivo por WebSocket.
- **Reportes** con gráficos (Chart.js) exportables a PDF.
- **Backups**: pantalla de administración para programar, deshabilitar y restaurar backups.
- **Permisos por ruta**: el menú y las rutas se habilitan según los permisos del usuario.

---

## Stack

| Área | Tecnologías |
|---|---|
| Core | React 19, Vite 6, React Router 7 |
| UI | Bootstrap 5, React-Bootstrap, Font Awesome, Lucide, React Icons |
| Formularios | Formik + Yup, React Select, React Datepicker, React Dropzone |
| Tiempo real | STOMP.js + SockJS |
| Pagos | `@mercadopago/sdk-react` |
| Reportes | Chart.js (`react-chartjs-2`), jsPDF + AutoTable, html2pdf |
| HTTP | Fetch / Axios |
| Calidad | ESLint 9 |

---

## Arquitectura

La app está organizada **por módulos de negocio**, alineados con los dominios del backend. Cada módulo tiene sus pantallas, sus componentes, su capa de API y su propio archivo de rutas:

```
src/
├── App.jsx              # Router principal: combina las rutas de cada módulo
├── api/                 # servicios compartidos (permisos, etc.)
├── common/
│   ├── API.js           # URL base del backend (lee VITE_API_URL)
│   ├── components/      # componentes reutilizables
│   └── layouts/         # navbar, sidebar, modales, páginas de error
├── context/
│   ├── PermisosContext.jsx  # carga los permisos del usuario
│   └── ProtectedRoute.jsx   # exige token y valida permiso por ruta
└── modules/
    ├── Usuarios&Seguridad/  # login/registro, perfil, recuperar contraseña, configuraciones
    ├── Eventos/             # gestionar eventos y contrataciones
    ├── Lugares/             # buscar, detalle, ABM, mis reservaciones
    ├── Servicios/           # buscar, detalle, ABM, chat
    ├── Pagos/               # reservar, elegir medio de pago, pagar
    ├── Reportes/            # gráficos y exportación a PDF
    └── Backups/             # ABM de backups
```

Dentro de cada módulo: `Pantalla.jsx` + `src/api` (llamadas al backend) + `src/components` + `src/assets`.

**Autenticación y permisos**

1. Al hacer login, el backend devuelve un **JWT** que se guarda en `localStorage` y se envía como `Authorization: Bearer <token>`.
2. `PermisosContext` pide al backend las rutas habilitadas para el usuario.
3. `ProtectedRoute` redirige al login si no hay token y muestra *Acceso denegado* si la ruta no está permitida (soporta rutas con parámetros, p. ej. `/evento/:id`).

**Tiempo real**: el hook `useNotificaciones` abre una conexión STOMP sobre SockJS a `/ws-notifications` y se suscribe al canal del usuario; el chat usa `/ws-chat`.

---

## Mi participación

Trabajé como desarrollador full stack (frontend + backend) en:

- **Login y registro** (`modules/Usuarios&Seguridad/Login_y_register`).
- **ABM completo de Eventos** (`modules/Eventos/gestionar_eventos`): listado, alta, edición, cancelación y vista de contrataciones.
- **Flujo de reserva**: desde el detalle del lugar/servicio hasta el formulario de reserva (`modules/Pagos/Reservar`), dejando los datos listos para la pantalla de pago.
- **Módulo de Backups** (`modules/Backups`).

---

## Cómo correrlo

### Requisitos

- Node.js 18 o superior
- El [backend](https://github.com/alear123/wevently-backend) corriendo (por defecto en `http://localhost:8080`)

### Pasos

```bash
git clone https://github.com/alear123/wevently-frontend.git
cd wevently-frontend
npm install

cp .env.example .env   # opcional: cambiar URL del backend o public key de MercadoPago
npm run dev
```

La app queda en `http://localhost:5173`.

### Variables de entorno

| Variable | Default | Descripción |
|---|---|---|
| `VITE_API_URL` | `http://localhost:8080` | URL base del backend (REST y WebSocket) |
| `VITE_MP_PUBLIC_KEY` | key de sandbox | Public key de MercadoPago |

### Scripts

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo con hot reload |
| `npm run build` | Build de producción en `dist/` |
| `npm run preview` | Sirve el build localmente |
| `npm run lint` | Análisis estático con ESLint |

---

## Equipo

Alejandro Arce · Enzo Silva · Iván Duga · Marcio Palazzo · Cristian Rosales
