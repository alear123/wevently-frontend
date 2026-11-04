import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Rutas_Configuraciones from './Configuraciones/Rutas_Configuraciones';
import RecuperarContrasena from "./Recuperar-Contraseña/RecuperarContraseña";
import Login_y_register from './Login_y_register/Login_y_register.jsx';
import ModificarPerfil from './Modificar_perfil/Modificar_perfil.jsx'
import Inicio from './Login_y_register/src/components/Inicio.jsx'
import ProtectedRoute from '../../context/ProtectedRoute.jsx'
import { PermisosProvider } from "../../context/PermisosContext.jsx";

export default function Rutas_Usuarios() {
  return (
    <PermisosProvider>
      <Routes>
        {/* Rutas públicas (sin protección) */}
        <Route path="Login_y_register/" element={<Login_y_register />} />
        <Route path="recuperar-contraseña" element={<RecuperarContrasena />} />

        {/* Rutas protegidas */}
        <Route
          path="configuraciones/*"
          element={
              <Rutas_Configuraciones />
          }
          caseSensitive={false}
        />

        <Route
          path="Inicio/mi-perfil"
          element={
            <ProtectedRoute>
              <ModificarPerfil />
            </ProtectedRoute>
          }
          caseSensitive={false}
        />

        <Route
          path="inicio"
          element={
              <Inicio />
          }
          caseSensitive={false}
        />
      </Routes>
    </PermisosProvider>

  );
}

