import React, { useState, useEffect } from "react";
import Pagination from "../../../../common/layouts/Pagination.jsx";
import Navbar_Administrador from "../../../../common/layouts/Navbar_Administrador.jsx";
import Breadcrumbs from "../../../../common/layouts/Breadcrumbs.jsx";
import Buscador from "../../../../common/components/Buscador.jsx";
import "./assets/Configuraciones.css"; // Importa el nuevo CSS
import { Link, useSearchParams, useLocation } from "react-router-dom";

export default function ConfiguracionesHome() {
  // Query params (page, search, size) para persistir estado al volver atrás
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  // Estado inicial derivado de query params (lazy init para evitar recomputar)
  const initialBusqueda = searchParams.get('search') || "";
  const initialPage = parseInt(searchParams.get('page') || '1', 10) || 1;
  const initialSize = parseInt(searchParams.get('size') || '10', 10) || 10;
  const configuracionesItems = [
    {
      id: 2,
      titulo: "Gestionar Provincias",
      icono: "fa-map",
      ruta: "/configuraciones/provincias",
    },
    {
      id: 3,
      titulo: "Gestionar Localidades",
      icono: "fa-city",
      ruta: "/configuraciones/localidades",
    },
    {
      id: 4,
      titulo: "Gestionar Tipos de Eventos",
      icono: "fa-calendar",
      ruta: "/configuraciones/tipo-de-evento",
    },
    {
      id: 5,
      titulo: "Gestionar Tipos de Servicio",
      icono: "fa-screwdriver-wrench",
      ruta: "/configuraciones/tipo-de-servicio",
    },
    {
      id: 6,
      titulo: "Gestionar Tipos de Lugar",
      icono: "fa-location-dot",
      ruta: "/configuraciones/tipo-de-lugar",
    },
    {
      id: 7,
      titulo: "Gestionar Características de Lugares",
      icono: "fa-building",
      ruta: "/configuraciones/caracteristicas-del-lugar",
    },
    {
      id: 8,
      titulo: "Gestionar Estados de Evento",
      icono: "fa-flag-checkered",
      ruta: "/configuraciones/estado-del-evento",
    },
    {
      id: 9,
      titulo: "Administrar Medios de Pago",
      icono: "fa-credit-card",
      ruta: "/configuraciones/MediosDePago",
    },
    {
      id: 10,
      titulo: "Gestionar Estados de Servicio",
      icono: "fa-bolt",
      ruta: "/configuraciones/estadoServicio",
    },
    {
      id: 11,
      titulo: "Gestionar Estados de Backup",
      icono: "fa-database",
      ruta: "/configuraciones/estadosBackup",
    },
    {
      id: 12,
      titulo: "Gestionar Parámetro de comisión",
      icono: "fa-percentage",
      ruta: "/configuraciones/parametroComision",
    },
    {
      id: 13,
      titulo: "Administrar Backups",
      icono: "fa-cloud-upload-alt",
      ruta: "/configuraciones/ABMBackups",
    },
    {
      id: 14,
      titulo: "Administrar Permisos",
      icono: "fa-key",
      ruta: "/configuraciones/permisos",
    },
    {
      id: 15,
      titulo: "Administrar Roles",
      icono: "fa-user",
      ruta: "/configuraciones/roles",
    },
    {
      id: 16,
      titulo: "Gestionar transferencias pendientes",
      icono: "fa-money-bill-transfer",
      ruta: "/configuraciones/transferencias-pendientes",
    }
  ];

  // Estado para cantidad de ítems a mostrar
  const [cantidadMostrar, setCantidadMostrar] = useState(initialSize);
  const [paginaActual, setPaginaActual] = useState(initialPage);
  const [busqueda, setBusqueda] = useState(initialBusqueda);

  const itemsFiltrados = configuracionesItems.filter((item) =>
    item.titulo.toLowerCase().includes(busqueda.toLowerCase())
  );

  // Cálculo de paginación
  const totalPaginas = Math.ceil(itemsFiltrados.length / cantidadMostrar) || 1;
  const inicio = (paginaActual - 1) * cantidadMostrar;
  const fin = inicio + cantidadMostrar;
  const itemsToShow = itemsFiltrados.slice(inicio, fin);

  // Si la búsqueda o cantidadMostrar reduce el total de páginas, clamp de página
  useEffect(() => {
    if (paginaActual > totalPaginas) {
      setPaginaActual(totalPaginas);
    }
  }, [totalPaginas, paginaActual]);

  // Sincronizar estados relevantes con query params (reemplaza entrada actual, no añade historial extra)
  useEffect(() => {
    const params = {};
    if (busqueda) params.search = busqueda;
    if (paginaActual > 1) params.page = String(paginaActual);
    if (cantidadMostrar !== 10) params.size = String(cantidadMostrar);
    setSearchParams(params, { replace: true });
  }, [busqueda, paginaActual, cantidadMostrar, setSearchParams]);


  return (
    <>
      <Navbar_Administrador />
      <div className="container-fluid">
        {/* Breadcrumb */}
        <div className="container-fluid py-2">
          <Breadcrumbs />
        </div>

        {/* Header */}
        <div className="container-fluid configuraciones-header">
          <h1 className="h2 fw-bold text-dark mb-2">Configuraciones</h1>
          <p className="text-muted mb-4">
            Clickea sobre alguna opción para editar los parámetros del sistema.
          </p>
          {/* Buscador */}
          <div className="mb-3 buscador-configuraciones">
            <Buscador
              placeholder="Buscar configuración..."
              value={busqueda}
              onChange={(texto) => {
                setBusqueda(texto);
                setPaginaActual(1);
              }}
              filtrarMientrasEscribes={true}
              useSharedStyles={true}
            />
          </div>
          {/* Lista de configuraciones en dos columnas */}
          <div className="row g-3">
            {itemsToShow.map((item) => {
              const qs = searchParams.toString();
              const to = qs ? `${item.ruta}?${qs}` : item.ruta;
              return (
              <div key={item.id} className="col-12 col-md-6 mb-3">
                <Link to={to} style={{ textDecoration: "none" }}>
                  <div className="configuracion-item">
                    <div className="configuracion-card-body d-flex align-items-center">
                      <span className="configuracion-icon"><i className={`fas ${item.icono}`}></i></span>
                      <h5 className="configuracion-title">{item.titulo}</h5>
                    </div>
                  </div>
                </Link>
              </div>
            )})}
          </div>

          {/* Paginación */}
          <div className="d-flex justify-content-between align-items-center mt-4">
            <Pagination
              paginaActual={paginaActual}
              totalPaginas={totalPaginas}
              setPaginaActual={setPaginaActual}
              inicio={inicio}
              fin={fin}
              totalItems={itemsFiltrados.length}
              cantidadMostrar={cantidadMostrar}
              setCantidadMostrar={setCantidadMostrar}
            />
          </div>
        </div>
      </div>
    </>
  );
}
