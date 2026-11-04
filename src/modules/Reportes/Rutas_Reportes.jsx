import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import VisualizarVistasPorLugar from './Visualizar_vistas_por_lugar/VisualizarVistasPorLugar';

import VerListaDeServiciosMasSolicitados from './Ver_lista_de_servicios_mas_solicitados/VerListaDeServiciosMasSolicitados';
import VisualizarCantidadUsuariosActivos from './Visualizar_cantidad_de_usuarios_activos/VisualizarCantidadUsuariosActivos';
import ProtectedRoute from '../../context/ProtectedRoute.jsx'
import { PermisosProvider } from "../../context/PermisosContext.jsx";
import VisualizarVistasPorServicio from './Visualizar_vistas_por_servicio/VisualizarVistasPorServicio.jsx';
import Ver_reporte_financiero from './ver reporte financiero/Ver_reporte_financiero.jsx';
import VisualizarSolicitudesPorLugar from './Visualizar_solicitudes_por_lugar/VisualizarSolicitudesPorLugar.jsx';
import VisualizarHistorialDeEventos from './Visualizar_historial_de_eventos/VisualizarHistorialDeEventos.jsx';

export default function Rutas_Reportes() {
  return (
    <PermisosProvider>
      <Routes>
        <Route
          path="/reportes/usuariosactivos"
          element={
            <ProtectedRoute>
              <VisualizarCantidadUsuariosActivos />
            </ProtectedRoute>
          }
          caseSensitive={false}
        />
        <Route
          path="/reportes/servicios-mas-solicitados"
          element={
            <ProtectedRoute>
              <VerListaDeServiciosMasSolicitados />
            </ProtectedRoute>
          }
          caseSensitive={false}
        />
        {/*<Route path="/administracion/permisos" element={<AbmPermisos />} /> */}
        <Route
          path='/reportes/vistas-por-lugar'
          element={
            <ProtectedRoute>
              <VisualizarVistasPorLugar />
            </ProtectedRoute>
          }
          caseSensitive={false}
        />
        <Route
          path='/reportes/vistas-por-servicio'
          element={
            <ProtectedRoute>
              <VisualizarVistasPorServicio />
            </ProtectedRoute>
          }
          caseSensitive={false}
        />
        <Route
          path='/reportes/reporte-financiero'
          element={
            <ProtectedRoute>
              <Ver_reporte_financiero />
            </ProtectedRoute>
          }
          caseSensitive={false}
        />

        <Route
          path='/reportes/solicitudes-por-lugar'
          element={
            <ProtectedRoute>
              <VisualizarSolicitudesPorLugar />
            </ProtectedRoute>
          }
          caseSensitive={false}
        />

        <Route
          path='/reportes/historial-de-eventos'
          element={
            <ProtectedRoute>
              <VisualizarHistorialDeEventos />
            </ProtectedRoute>
          }
          caseSensitive={false}
        />
      </Routes>
    </PermisosProvider>
  );
}

