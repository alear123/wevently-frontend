import { Route, Routes } from 'react-router-dom';
import GestionarEventos from './gestionar_eventos/gestionar_eventos.jsx';
import Contrataciones from './gestionar_eventos/contrataciones/contrataciones.jsx';
import ProtectedRoute from '../../context/ProtectedRoute.jsx'
import { PermisosProvider } from "../../context/PermisosContext.jsx";

const Rutas_Eventos = () => {
  return (
    <PermisosProvider>
      <Routes>
        <Route
          path="Inicio/mis-eventos"
          element={
            <ProtectedRoute>
              <GestionarEventos />
            </ProtectedRoute>
          }
          caseSensitive={false}
        />

        <Route
          path="Inicio/mis-eventos/contrataciones/:eventoId"
          element={
            <ProtectedRoute>
              <Contrataciones />
            </ProtectedRoute>
          }
          caseSensitive={false}
        />
      </Routes>
    </PermisosProvider>
  );
};

export default Rutas_Eventos;