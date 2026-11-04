import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Mis_reservaciones from './Mis_reservaciones/Mis_reservaciones';
import BuscarLugares from './buscar_lugares/buscar_lugares'
import ABMLugar from './ABM_lugar/ABM_lugar';
import VerDetalleLugar from './VerDetalleLugar/VerDetalleLugar';
import ConfiguracionesPropietarioHome from "./ConfiguracionesPropietario/ConfiguracionesPropietarioHome"
import Login_y_register from '../Usuarios&Seguridad/Login_y_register/Login_y_register.jsx'
import ProtectedRoute from '../../context/ProtectedRoute.jsx'
import { PermisosProvider } from "../../context/PermisosContext.jsx";

export default function Rutas_Lugares() {
  return (
    <PermisosProvider>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<BuscarLugares />} />
        <Route path="/buscar-lugares" element={<BuscarLugares />} />
        <Route path="Login_y_register/buscar-lugares" element={<Login_y_register />} />

        {/* Rutas protegidas */}
        <Route
          path="/ver-detalle-lugar/:idLugar"
          element={
              <VerDetalleLugar />
          }
          caseSensitive={false}
        />

        <Route
          path="Inicio/mis-lugares/ver-detalle-lugar/:idLugar"
          element={
              <VerDetalleLugar />
          }
          caseSensitive={false}
        />

        <Route
          path="/buscar-lugares/ver-detalle-lugar/:idLugar"
          element={
              <VerDetalleLugar />
          }
          caseSensitive={false}
        />

        <Route
          path="Inicio/mis-reservaciones"
          element={
            <ProtectedRoute>
              <Mis_reservaciones />
            </ProtectedRoute>
          }
          caseSensitive={false}
        />

        <Route
          path="/mis-lugares"
          element={
            <ProtectedRoute>
              <ABMLugar />
            </ProtectedRoute>
          }
          caseSensitive={false}
        />

        <Route
          path="Inicio/mis-lugares"
          element={
            <ProtectedRoute>
              <ABMLugar />
            </ProtectedRoute>
          }
          caseSensitive={false}
        />

        <Route
          path="/ConfiguracionesPropietario"
          element={
            <ProtectedRoute>
              <ConfiguracionesPropietarioHome />
            </ProtectedRoute>
          }
          caseSensitive={false}
        />

        <Route
          path="/Login_y_register/ConfiguracionesPropietario"
          element={
            <ProtectedRoute>
              <ConfiguracionesPropietarioHome />
            </ProtectedRoute>
          }
          caseSensitive={false}
        />
      </Routes>
    </PermisosProvider>
  );
}

