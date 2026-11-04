import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import ABMBackups from './ABM Backups/ABMBackups.jsx';
import ProtectedRoute from '../../context/ProtectedRoute.jsx'
import { PermisosProvider } from "../../context/PermisosContext.jsx";

export default function Rutas_Backups() {
  return (
    <PermisosProvider>
      <Routes>
        <Route
          path="configuraciones/ABMBackups"
          element={
            <ProtectedRoute>
              <ABMBackups />
            </ProtectedRoute>
          }
          caseSensitive={false}
        />
      </Routes>
    </PermisosProvider>
  );
}

