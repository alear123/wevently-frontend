import { useState } from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import './App.css'
import Rutas_Usuarios from './modules/Usuarios&Seguridad/Rutas_Usuarios';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js'; // <- para que funcionen los modales, dropdowns, etc.
import Rutas_Backups from './modules/Backups/Rutas_Backups';
import Rutas_Eventos from './modules/Eventos/Rutas_Eventos';
import Rutas_Lugares from './modules/Lugares/Rutas_Lugares';
import Rutas_Pagos from './modules/Pagos/Rutas_Pagos';
import Rutas_Reportes from './modules/Reportes/Rutas_Reportes';
import Rutas_Servicios from './modules/Servicios/Rutas_Servicios';
import Footer from "./common/layouts/Footer.jsx";
import { ReportesModalProvider } from "./modules/Reportes/src/ReportesModalContext";


function App() {
  return (
    <div
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
    >
      <BrowserRouter>
        <ReportesModalProvider>
          <div style={{ flex: 1 }}>
            <Rutas_Usuarios />
            <Rutas_Backups />
            <Rutas_Eventos />
            <Rutas_Lugares />
            <Rutas_Pagos />
            <Rutas_Reportes />
            <Rutas_Servicios />
          </div>
          <Footer />
        </ReportesModalProvider>
      </BrowserRouter>
    </div>
  );
}

export default App
