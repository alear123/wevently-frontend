import { useState, useEffect, useMemo } from "react";
import useSort from "../src/hooks/useSort";
import Navbar_Administrador from "../../../../common/layouts/Navbar_Administrador.jsx";
import Breadcrumbs from "../../../../common/layouts/Breadcrumbs.jsx";
import Buscador from "../../../../common/components/Buscador.jsx";
import TablaABM from "../src/components/TablaABM.jsx";
import ABMTableSkeleton from "../src/components/ABMTableSkeleton.jsx";
import ModalAM from "../src/components/ModalAM.jsx";
import ModalConfirmarEliminar from "../../../../common/layouts/ModalConfirmarEliminar.jsx";
import ModalAccionExito from "../../../../common/layouts/ModalAccionExito.jsx";
import "../src/assets/abm-shared.css";
import Pagination from "../../../../common/layouts/Pagination.jsx";
import ModalError from "../../../../common/layouts/ModalError.jsx"

import {
  getTiposServicio,
  crearTipoServicio,
  modificarTipoServicio,
  eliminarTipoServicio,
} from "./src/api/tipoServicioApi";

export default function TipoDeServicio() {
  const [items, setItems] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [mostrarAgregar, setMostrarAgregar] = useState(false);
  const [mostrarModificar, setMostrarModificar] = useState(false);
  const [mostrarEliminar, setMostrarEliminar] = useState(false);
  const [itemSeleccionado, setItemSeleccionado] = useState(null);
  const [mostrarSuccess, setMostrarSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [successTitle, setSuccessTitle] = useState("");

  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleCloseErrorModal = () => {
    setShowErrorModal(false);
    setErrorMessage('');

  };

  const errorFunction = (error) => {
    console.error("Error en apartado tipo de servicio:", error);

        const mensajeError =
          error?.response?.data?.message ||
          error.message ||
          "Ocurrió un error inesperado.";

        setErrorMessage(mensajeError);

        setTimeout(() => setShowErrorModal(true), 200);
  }

  useEffect(() => {
    getTiposServicio()
      .then(setItems)
      .catch(() => setItems([]));
  }, []);

  // Filtrado
  const itemsFiltrados = useMemo(() => (
    items.filter((item) =>
      item.nombre.toLowerCase().includes(busqueda.toLowerCase())
    )
  ), [items, busqueda]);

  // Ordenamiento via hook
  const { sortConfig, sortedItems: itemsOrdenados, handleSort } = useSort(itemsFiltrados, { resetPage: () => setPaginaActual(1), storageKey: 'sort:tipoServicio' });

  // Paginación simple (sin selector)
  const [paginaActual, setPaginaActual] = useState(1);
   const [cantidadMostrar, setCantidadMostrar] = useState(5);
  const totalPaginas = Math.ceil(itemsFiltrados.length / cantidadMostrar);
  const inicio = (paginaActual - 1) * cantidadMostrar;
  const fin = inicio + cantidadMostrar;
  const itemsToShow = itemsOrdenados.slice(inicio, fin);

  // Handlers
  const handleAgregar = async (nombre) => {
    try {
      const nuevo = await crearTipoServicio(nombre);
      setItems([...items, nuevo]);
      setMostrarAgregar(false);
      setSuccessTitle("¡Éxito!");
      setSuccessMsg("Tipo de servicio agregado exitosamente");
      setMostrarSuccess(true);
    } catch (e) {
      errorFunction(e);
    }
  };

  const handleModificar = (item) => {
    setItemSeleccionado(item);
    setMostrarModificar(true);
  };

  const handleGuardarModificado = async (nuevoNombre) => {
    try {
      const actualizado = await modificarTipoServicio(
        itemSeleccionado.id,
        nuevoNombre
      );
      setItems(
        items.map((it) => (it.id === actualizado.id ? actualizado : it))
      );
      setMostrarModificar(false);
      setSuccessTitle("¡Éxito!");
      setSuccessMsg("Tipo de servicio modificado exitosamente");
      setMostrarSuccess(true);
    } catch (e) {
      errorFunction(e);
    }
  };

  const handleEliminar = (item) => {
    setItemSeleccionado(item);
    setMostrarEliminar(true);
  };

  const handleConfirmarEliminar = async () => {
    try {
      await eliminarTipoServicio(itemSeleccionado.id);
      setItems(items.filter((it) => it.id !== itemSeleccionado.id));
      setMostrarEliminar(false);
      setSuccessTitle("¡Éxito!");
      setSuccessMsg("Tipo de servicio eliminado exitosamente");
      setMostrarSuccess(true);
    } catch (e) {
      errorFunction(e);
    }
  };

  return (
    <>
      <Navbar_Administrador />
      <div className="abm-page">
        <div className="container-fluid py-2">
          <Breadcrumbs />
        </div>
        <div className="abm-card">
          <h1 className="page-title">Tipo de Servicio</h1>
          <div className="abm-controls">
            <div className="search-container">
              <Buscador
                placeholder="Buscar"
                value={busqueda}
                onChange={setBusqueda}
                filtrarMientrasEscribes={true}
                useSharedStyles={true}
              />
            </div>
            <button
              className="abm-primary-btn"
              onClick={() => setMostrarAgregar(true)}
            >
              Agregar Tipo de Servicio
            </button>
          </div>
          <p
            style={{
              marginTop: 0,
              marginBottom: "12px",
              color: "#6b7280",
              fontWeight: 500,
            }}
          >
            Gestionar los tipos de servicios aceptados en el sistema.
          </p>
          {items.length === 0 ? (
            <div className="table-container">
              <div className="table-scroll">
                <ABMTableSkeleton columns={1} rows={6} showActions={true} />
              </div>
            </div>
          ) : itemsFiltrados.length === 0 ? (
            <div className="table-container">
              <div
                className="table-scroll"
                style={{
                  padding: "32px 16px",
                  textAlign: "center",
                  color: "#6b7280",
                }}
              >
                No hay resultados que coincidan con la búsqueda.
              </div>
            </div>
          ) : (
            <TablaABM
              items={itemsToShow}
              columns={[{ key: "nombre", header: "Nombre", sortable: true }]}
              onModificar={handleModificar}
              onEliminar={handleEliminar}
              sortConfig={sortConfig}
              onSort={handleSort}
            />
          )}
          <div className="abm-pagination">
            <Pagination
              paginaActual={paginaActual}
              totalPaginas={totalPaginas}
              setPaginaActual={setPaginaActual}
              inicio={inicio}
              fin={fin}
              totalItems={itemsFiltrados.length}
              cantidadMostrar={cantidadMostrar}
              setCantidadMostrar={setCantidadMostrar}
              mostrarSelector={true}
            />
          </div>
        </div>
      </div>
      <ModalAM
        mostrar={mostrarAgregar}
        modo="crear"
        campos={[
          {
            nombre: "nombre",
            label: "Nombre *",
            placeholder: "ejemplo: catering, sonido, etc",
            requerido: true,
            validacion: (v) =>
              !v.trim()
                ? "Campo requerido"
                : v.trim().length < 2
                ? "Mínimo 2 caracteres"
                : "",
          },
        ]}
        textos={{
          crear: {
            titulo: "Nuevo Tipo de Servicio",
            subtitulo: "Agregar",
            descripcion: "Ingrese el nombre del tipo de servicio",
          },
          editar: {
            titulo: "Editar Tipo de Servicio",
            subtitulo: "Modificar",
            descripcion: "Actualice el nombre",
          },
        }}
        onSave={(datos) => handleAgregar(datos.nombre)}
        onClose={() => setMostrarAgregar(false)}
      />
      <ModalAM
        mostrar={mostrarModificar}
        modo="editar"
        item={itemSeleccionado}
        campos={[
          {
            nombre: "nombre",
            label: "Nombre *",
            placeholder: "Nombre",
            requerido: true,
            validacion: (v) =>
              !v.trim()
                ? "Campo requerido"
                : v.trim().length < 2
                ? "Mínimo 2 caracteres"
                : "",
          },
        ]}
        textos={{
          editar: {
            titulo: "Editar Tipo de Servicio",
            subtitulo: "Modificar",
            descripcion: "Actualice el nombre del tipo de servicio",
          },
          crear: {
            titulo: "Nuevo Tipo de Servicio",
            subtitulo: "Agregar",
            descripcion: "Ingrese el nombre",
          },
        }}
        onSave={(datos) => handleGuardarModificado(datos.nombre)}
        onClose={() => setMostrarModificar(false)}
      />
      <ModalConfirmarEliminar
        titulo="¿Eliminar este tipo de servicio?"
        mensaje={`¿Estás seguro que deseas eliminar "${
          itemSeleccionado?.nombre || ""
        }"?`}
        mostrar={mostrarEliminar}
        onCancelar={() => setMostrarEliminar(false)}
        onConfirmar={handleConfirmarEliminar}
      />
      <ModalAccionExito
        titulo={successTitle}
        mensaje={successMsg}
        mostrar={mostrarSuccess}
        onAceptar={() => setMostrarSuccess(false)}
      />
      <ModalError
        titulo="Error"
        mensaje={errorMessage}
        mostrar={showErrorModal}
        onCerrar={handleCloseErrorModal}
      />

    </>
  );
}
