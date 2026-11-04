import { Routes, Route } from "react-router-dom";
import ConfiguracionesHome from "./src/ConfiguracionesHome";
import Provincias from "./Provincias/Provincias";
import Localidades from "./Localidades/Localidades";
import ParametroComision from "./Parametro_comision/ParametroComision";
import MediosDePago from "./MediosDePago/MediosDePago";
import ABM_Permisos from "./Permisos/ABM_Permisos";
import ABM_Roles from "./Roles/ABM_Roles";
import TipoDeEvento from "./Tipo-de-Evento/TipoDeEvento";
import TipoDeServicio from "./Tipo-de-Servicio/TipoDeServicio";
import TipoDeLugar from "./Tipo-de-Lugar/TipoDeLugar";
import CaracteristicasDelLugar from "./Caracteristicas-del-Lugar/CaracteristicasDelLugar";
import EstadoDelEvento from "./Estado-del-Evento/EstadoDelEvento";
import EstadosServicio from "./Estados_servicios/EstadosServicio";
import EstadosBackup from "./Estados_backup/EstadosBackup";
import ABMBackups from "../../Backups/ABM Backups/ABMBackups";
import ProtectedRoute from "../../../context/ProtectedRoute";
import { PermisosProvider } from "../../../context/PermisosContext";
import GestionarTransferenciasPendientes from "./Gestionar_transferencias_pendientes/GestionarTransferenciasPendientes";

export default function Rutas_Configuraciones() {
  return (
    <PermisosProvider>
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <ConfiguracionesHome />
            </ProtectedRoute>
          }
        />

        <Route
          path="provincias"
          element={
            <ProtectedRoute>
              <Provincias />
            </ProtectedRoute>
          }
          caseSensitive={false}
        />

        <Route
          path="localidades"
          element={
            <ProtectedRoute>
              <Localidades />
            </ProtectedRoute>
          }
          caseSensitive={false}
        />

        <Route
          path="parametroComision"
          element={
            <ProtectedRoute>
              <ParametroComision />
            </ProtectedRoute>
          }
          caseSensitive={false}
        />

        <Route
          path="estadosBackup"
          element={
            <ProtectedRoute>
              <EstadosBackup />
            </ProtectedRoute>
          }
          caseSensitive={false}
        />

        <Route
          path="mediosDePago"
          element={
            <ProtectedRoute>
              <MediosDePago />
            </ProtectedRoute>
          }
          caseSensitive={false}
        />

        <Route
          path="estadoServicio"
          element={
            <ProtectedRoute>
              <EstadosServicio />
            </ProtectedRoute>
          }
          caseSensitive={false}
        />

        <Route
          path="permisos"
          element={
            <ProtectedRoute>
              <ABM_Permisos />
            </ProtectedRoute>
          }
          caseSensitive={false}
        />

        <Route
          path="roles"
          element={
            <ProtectedRoute>
              <ABM_Roles />
            </ProtectedRoute>
          }
          caseSensitive={false}
        />

        <Route
          path="tipo-de-evento"
          element={
            <ProtectedRoute>
              <TipoDeEvento />
            </ProtectedRoute>
          }
          caseSensitive={false}
        />

        <Route
          path="tipo-de-servicio"
          element={
            <ProtectedRoute>
              <TipoDeServicio />
            </ProtectedRoute>
          }
          caseSensitive={false}
        />

        <Route
          path="tipo-de-lugar"
          element={
            <ProtectedRoute>
              <TipoDeLugar />
            </ProtectedRoute>
          }
          caseSensitive={false}
        />

        <Route
          path="caracteristicas-del-lugar"
          element={
            <ProtectedRoute>
              <CaracteristicasDelLugar />
            </ProtectedRoute>
          }
          caseSensitive={false}
        />

        <Route
          path="estado-del-evento"
          element={
            <ProtectedRoute>
              <EstadoDelEvento />
            </ProtectedRoute>
          }
          caseSensitive={false}
        />

        <Route
          path="backups"
          element={
            <ProtectedRoute>
              <ABMBackups />
            </ProtectedRoute>
          }
          caseSensitive={false}
        />
        <Route
          path="transferencias-pendientes"
          element={
            <ProtectedRoute>
              <GestionarTransferenciasPendientes />
            </ProtectedRoute>
          }
          caseSensitive={false}
        />
      </Routes>
    </PermisosProvider>
  );
}
