import { useState, useEffect } from 'react'
import Navbar_Administrador from '../../../../common/layouts/Navbar_Administrador'
import ModalAccionExito from '../../../../common/layouts/ModalAccionExito'
import ModalError from '../../../../common/layouts/ModalError'
import Grupo from './components/Grupo'
import NuevoGrupo from './components/NuevoGrupo'
import Breadcrumbs from '../../../../common/layouts/Breadcrumbs'
import Pagination from '../../../../common/layouts/Pagination'
import dominio from '../../../../common/API'
import FiltroTipo from "../src/components/FiltroTipo.jsx";
// Hoja de estilos unificada para botones y layout ABM
import "../src/assets/abm-shared.css";


export default function ABM_Permisos() {

  const [mostrarModal, setMostrarModal] = useState(true);
  const [gruposMostrados, setGruposMostrados] = useState([]);
  const [gruposTodos, setGruposTodos] = useState([]);
  const [page, setPage] = useState();
  const [cantidadMostrar, setCantidadMostrar] = useState(10);
  
  const [grupoSeleccionado, setGrupoSeleccionado] = useState("Todos");

  const [titulo, setTitulo] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [modalExito, setModalExito] = useState(false);
  const [modalError, setModalError] = useState(false);

  const onCerrar = () => {
    setMostrarModal(false);
    setModalError(false);
    setModalExito(false);
  };



  async function fetchGrupos(nroPagina) {
    try {
      const response = await fetch(`${dominio}/api/seguridad/grupos/get?page=${nroPagina - 1}&size=${cantidadMostrar}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json", // importante para JSON
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error('No se ha podido establecer una conexion con el servidor, intente mas tarde');
      }
      const resp = await response.json();
      setGruposMostrados(resp.content);
      setGruposTodos(resp.content);
      setPage(resp);
    }
    catch (error) {
      setTitulo("Error")
      setMensaje(error.message)
      setModalError(true);

    }
  }

  useEffect(() => {
    fetchGrupos(1);


  }, [cantidadMostrar])

  function setCantidadItems(cantidad) {
    setCantidadMostrar(cantidad);
  }

  function filtrar(nombreGrupo) {
    if (nombreGrupo && nombreGrupo !== "Todos") {
      setGruposMostrados(
        gruposTodos.filter((grupo) => grupo.nombre === nombreGrupo)
      );
      return;
    }
    setGruposMostrados(gruposTodos);
  }


  return (
    <>
      <Navbar_Administrador />
      {/* Main Content */}
      <div className="abm-page">
        <main className="container-fluid py-4 flex-grow-1">
          {/* Breadcrumb */}
          <Breadcrumbs />
          {/* Page Header */}
          <div className="abm-card">
            <div className="row mb-4">
              <div className="col">
                <h1 className="page-title">ABM Permisos</h1>
                <p className="page-description">
                  Gestionar los permisos de acceso a pantallas y APIs del
                  sistema
                </p>
              </div>
            </div>
            {/* Actions Bar */}
            <div className="row mb-4 align-items-center">
              <div className="col-auto">
                <NuevoGrupo />
              </div>
              <div className="col d-flex justify-content-end">
                <FiltroTipo
                  tiposDisponibles={gruposTodos.map((g) => g.nombre)}
                  tipoSeleccionado={grupoSeleccionado}
                  onChange={(nuevo) => {
                    setGrupoSeleccionado(nuevo);
                    filtrar(nuevo);
                  }}
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
                {gruposMostrados.map((grupo) => {
                  return <Grupo key={grupo.id} grupo={grupo} />;
                })}
              </div>
            </div>

            <Pagination
              inicio={page ? page.number * page.size : 0}
              fin={page ? page.number * page.size + page.numberOfElements : 0}
              totalItems={page ? page.totalElements : 0}
              setCantidadMostrar={setCantidadItems}
              paginaActual={page ? page.number + 1 : 0}
              setPaginaActual={fetchGrupos}
              totalPaginas={page ? page.totalPages : 1}
            />
          </div>
        </main>
      </div>

      <ModalAccionExito
        mostrar={modalExito}
        titulo={titulo}
        mensaje={mensaje}
        onAceptar={onCerrar}
      />
      <ModalError
        mostrar={modalError}
        titulo={titulo}
        mensaje={mensaje}
        onCerrar={onCerrar}
      />
    </>
  );
}

