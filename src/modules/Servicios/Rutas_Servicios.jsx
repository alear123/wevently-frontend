import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import BuscarServicios from './buscar_servicios/buscar_servicios.jsx'
import VerDetalleServicio from './VerDetalleServicio.jsx/VerDetalleServicio.jsx';
import ABMServicio from './ABM_servicio/abm_servicio.jsx';
import IniciarChat from './chatear/IniciarChat.jsx';
import ConfiguracionesPrestadorHome from "./ConfiguracionesPrestador/ConfiguracionesPrestadorHome.jsx"
import ProtectedRoute from '../../context/ProtectedRoute.jsx'
import { PermisosProvider } from "../../context/PermisosContext.jsx";
import Login_y_register from '../Usuarios&Seguridad/Login_y_register/Login_y_register.jsx'
import Mis_prestaciones from './Mis_reservaciones/Mis_prestaciones.jsx';

export default function Rutas_Servicios() {
  return (
    <PermisosProvider>
      <Routes>
        {/* Rutas públicas */}
        <Route path="Login_y_register/ConfiguracionesPrestador" element={<Login_y_register />} />

        <Route
          path="/buscar-servicios"
          element={
              <BuscarServicios />
          }
          caseSensitive={false}
        />

        {/* Rutas protegidas */}
        <Route
          path="Inicio/mis-servicios"
          element={
            <ProtectedRoute>
              <ABMServicio />
            </ProtectedRoute>
          }
          caseSensitive={false}
        />

        <Route
          path="/buscar-servicios/ver-detalle-servicio/:idServicio"
          element={
              <VerDetalleServicio />
          }
          caseSensitive={false}
        />

        <Route
          path="Inicio/mis-servicios/ver-detalle-servicio/:idServicio"
          element={
              <VerDetalleServicio />
          }
          caseSensitive={false}
        />

        <Route
          path="/ver-detalle-servicio"
          element={
              <VerDetalleServicio />
          }
          caseSensitive={false}
        />

        <Route
          path="/chatear"
          element={
            <ProtectedRoute>
              <IniciarChat />
            </ProtectedRoute>
          }
          caseSensitive={false}
        />

        <Route
          path="Inicio/mis-prestaciones"
          element={
            <ProtectedRoute>
              <Mis_prestaciones />
            </ProtectedRoute>
          }
          caseSensitive={false}
        />

        <Route
          path="/ConfiguracionesPrestador"
          element={
            <ProtectedRoute>
              <ConfiguracionesPrestadorHome />
            </ProtectedRoute>
          }
          caseSensitive={false}
        />
      </Routes>
    </PermisosProvider>
  );
}
//<Route path='buscar-servicios/detalle-Servicio/:servicioId' element={<DetalleEvento />}/> esta ruta va a ser para acceder al detalle del servicio
