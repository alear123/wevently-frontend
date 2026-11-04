import { useState } from "react";
//import './App.css'
import FiltroTipo from "../../src/components/FiltroTipo";
import Grupo from "./Grupo";
import NuevoGrupo from "./NuevoGrupo";
import ModalAñadirPermiso from "./ModalAñadirPermiso";
import ModalEditarPermiso from "./ModalEditarPermiso";
import ModalConfirmarAccionEliminar from "./ModalConfirmarAccionEliminar";
import MsjExito from "./MsjExito";

function Body() {
  // Ejemplo de grupos, reemplazá por tu fuente real de datos
  const grupos = [
    "Todos",
    "Configuraciones",
    "Eventos",
    "Lugares",
    "Seguridad",
    "Servicios",
  ];
  const [grupoSeleccionado, setGrupoSeleccionado] = useState("Todos");

  return (
    <>
      <link
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css"
        rel="stylesheet"
      />
      <link
        href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css"
        rel="stylesheet"
      />
      {/* Main Content */}
      <main className="container-fluid py-4 flex-grow-1">
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <a href="#">Configuraciones</a>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              ABM Permisos
            </li>
          </ol>
        </nav>
        {/* Page Header */}
        <div className="row mb-4">
          <div className="col">
            <h1 className="page-title">ABM Permisos</h1>
            <p className="page-description">
              Gestionar los permisos de acceso a pantallas en el sistema
            </p>
          </div>
        </div>
        {/* Actions Bar */}
        <div className="row mb-4">
          <div className="col-md-6">
            <button
              className="btn btn-nuevo"
              onClick={() => {
                /* openNewGroupModal() */
              }}
            >
              Nuevo Grupo
            </button>
          </div>
          <div className="col-md-6 d-flex justify-content-end">
            <FiltroTipo
              tiposDisponibles={grupos}
              tipoSeleccionado={grupoSeleccionado}
              onChange={setGrupoSeleccionado}
              maxLength={18}
              compact={true}
              showTooltip={true}
              className="filtro-corto"
            />
          </div>
        </div>
        {/* Permissions Sections */}
        <div className="row">
          <div className="col-12">
            <Grupo grupoSeleccionado={grupoSeleccionado} />
          </div>
        </div>
      </main>
      {/* Footer */}
      <footer className="footer">
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-6">
              <p className="mb-0">© 2025 Wevently</p>
            </div>
            <div className="col-md-6 text-md-end">
              <a href="#" className="me-3">
                Términos
              </a>
              <a href="#">Política de privacidad</a>
            </div>
          </div>
        </div>
      </footer>
      {/* Modal for New Group */}
      <NuevoGrupo />
      {/* Modal for Add Permission to Group */}
      <ModalAñadirPermiso />
      {/* Modal for Edit Permission */}
      <ModalEditarPermiso />
      {/* Success Modal */}
      <MsjExito />
      {/* Delete Confirmation Modal */}
      <ModalConfirmarAccionEliminar />
    </>
  );
}

export default Body;
