import React, { useState } from "react";
import Pagination from "../../../common/layouts/Pagination.jsx";
import Navbar_Prestador from "../../../common/layouts/Navbar_Prestador.jsx";
import Breadcrumbs from "../../../common/layouts/Breadcrumbs.jsx";
import Buscador from "../../../common/components/Buscador.jsx";
import "./src/assets/ConfiguracionesPrestadorHome.css"; 
import { Link } from "react-router-dom";
export default function ConfiguracionesPrestadorHome() {
  const configuracionesItems = [
    {
      id: 2,
      titulo: "Publicá tu servicio",
      icono: "fa-camera",
      ruta: "mis-servicios",
    },

    {
      id: 3,
      titulo: "Mis prestaciones",
      icono: "fa-calendar-days",
      ruta: "mis-prestaciones",
    },
  ];

  // Estado para cantidad de ítems a mostrar
  const [cantidadMostrar, setCantidadMostrar] = useState(10);
  const [paginaActual, setPaginaActual] = useState(1);
  const [busqueda, setBusqueda] = useState("");

  const itemsFiltrados = configuracionesItems.filter((item) =>
    item.titulo.toLowerCase().includes(busqueda.toLowerCase())
  );

  // Cálculo de paginación
  const totalPaginas = Math.ceil(itemsFiltrados.length / cantidadMostrar);
  const inicio = (paginaActual - 1) * cantidadMostrar;
  const fin = inicio + cantidadMostrar;
  const itemsToShow = itemsFiltrados.slice(inicio, fin);


  return (
    <>
      <Navbar_Prestador />
      <div className="container-fluid">
        {/* Breadcrumb */}
        <div className="container-fluid py-2">
          <Breadcrumbs />
        </div>

        {/* Header */}
        <div className="container-fluid configuraciones-header">
          <h1 className="h2 fw-bold text-dark mb-2">Bienvenido, Prestador</h1>
          <p className="text-muted mb-4">
            Aquí podés administrar tus servicios, reservas y configuraciones.
          </p>
          {/* Buscador */}
          <div className="mb-3 buscador-configuraciones-prestador ">
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
            {itemsToShow.map((item) => (
              <div key={item.id} className="col-12 col-md-6 mb-3">
                <Link to={item.ruta} style={{ textDecoration: "none" }}>
                  <div className="configuracion-item-prestador ">
                    <div className="configuracion-card-body d-flex align-items-center">
                      <span className="configuracion-icon-prestador "><i className={`fas ${item.icono}`}></i></span>
                      <h5 className="configuracion-title-prestador ">{item.titulo}</h5>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
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
