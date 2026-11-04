import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Reservar from "./Reservar/Reservar"
import ElegirMedioPago from "./Reservar/ElegirMedioPago/ElegirMedioPago"
import DescargarFactura from './Reservar/ElegirMedioPago/DescargarFactura/DescargarFactura';
import Pagar from './Pagar/Pagar';
import ExitoPago from './Pagar/src/components/ExitoPago';
import FalloPago from './Pagar/src/components/FalloPago';
import PendientePago from './Pagar/src/components/PendientePago';
import ProtectedRoute from '../../context/ProtectedRoute.jsx'
import { PermisosProvider } from "../../context/PermisosContext.jsx";

export default function Rutas_Pagos() {
  return (
    <PermisosProvider>
      <Routes>
        <Route
          path="Reservar"
          element={
            <ProtectedRoute>
              <Reservar />
            </ProtectedRoute>
          }
          caseSensitive={false}
        />

        <Route
          path="/MedioPago"
          element={
            <ProtectedRoute>
              <ElegirMedioPago />
            </ProtectedRoute>
          }
          caseSensitive={false}
        />

        <Route
          path="DescargarFactura"
          element={
            <ProtectedRoute>
              <DescargarFactura />
            </ProtectedRoute>
          }
          caseSensitive={false}
        />

        <Route
          path="ExitoPago"
          element={
            <ProtectedRoute>
              <ExitoPago />
            </ProtectedRoute>
          }
          caseSensitive={false}
        />

        <Route
          path="FalloPago"
          element={
            <ProtectedRoute>
              <FalloPago />
            </ProtectedRoute>
          }
          caseSensitive={false}
        />

        <Route
          path="PendientePago"
          element={
            <ProtectedRoute>
              <PendientePago />
            </ProtectedRoute>
          }
          caseSensitive={false}
        />
      </Routes>
    </PermisosProvider>
  );
}

