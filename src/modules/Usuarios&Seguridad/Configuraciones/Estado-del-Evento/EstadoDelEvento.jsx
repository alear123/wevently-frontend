import { useState, useEffect, useMemo } from "react";
import useSort from "../src/hooks/useSort";
import Navbar_Administrador from "../../../../common/layouts/Navbar_Administrador.jsx";
import Breadcrumbs from "../../../../common/layouts/Breadcrumbs.jsx";
import Buscador from "../../../../common/components/Buscador.jsx";
import TablaABM from "../src/components/TablaABM.jsx";
import ModalAM from "../src/components/ModalAM.jsx";
import ModalConfirmarEliminar from "../../../../common/layouts/ModalConfirmarEliminar.jsx";
import ModalAccionExito from "../../../../common/layouts/ModalAccionExito.jsx";
import "../src/assets/abm-shared.css";
import Pagination from "../../../../common/layouts/Pagination.jsx";
import Modal_Error from "../../../../common/layouts/ModalError.jsx";
import {
  getEstadosEvento,
  crearEstadoEvento,
  modificarEstadoEvento,
  darDeBajaEstadoEvento,
  habilitarEstadoEvento,
} from "./src/api/estadoEventoApi";

export default function EstadoDelEvento() {
  // Estado de items
  const [items, setItems] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [mostrarAgregar, setMostrarAgregar] = useState(false);
  const [mostrarModificar, setMostrarModificar] = useState(false);
  const [mostrarEliminar, setMostrarEliminar] = useState(false);
  const [itemSeleccionado, setItemSeleccionado] = useState(null);
  const [mostrarSuccess, setMostrarSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [successTitle, setSuccessTitle] = useState("");
  const [mostrarError, setMostrarError] = useState(false);
  const [errorTitulo, setErrorTitulo] = useState("");
  const [errorMensaje, setErrorMensaje] = useState("");

  useEffect(() => {
    getEstadosEvento()
      .then((data) => {
        setItems(Array.isArray(data) ? data : data.content);
      })
      .catch(() => setItems([]));
  }, []);

  // Filtrado
  const itemsFiltrados = useMemo(() => (
    items.filter((item) =>
      item.nombre.toLowerCase().includes(busqueda.toLowerCase())
    )
  ), [items, busqueda]);

  // Ordenamiento mediante hook
  const { sortConfig, sortedItems: itemsOrdenados, handleSort } = useSort(itemsFiltrados, { resetPage: () => setPaginaActual(1), storageKey: 'sort:estadoEvento' });

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
      const nuevo = await crearEstadoEvento(nombre);
      setItems([...items, nuevo]);
      setMostrarAgregar(false);
      setSuccessTitle("¡Éxito!");
      setSuccessMsg("Estado agregado exitosamente");
      setMostrarSuccess(true);
    } catch (e) {
      setErrorTitulo("Error");
      setErrorMensaje(e.message || "Ocurrió un error inesperado");
      setMostrarError(true);
    }
  };

  const handleModificar = (item) => {
    setItemSeleccionado(item);
    setMostrarModificar(true);
  };

  const handleGuardarModificado = async (nuevoNombre) => {
    try {
      const actualizado = await modificarEstadoEvento(
        itemSeleccionado.id,
        nuevoNombre
      );
      setItems(
        items.map((it) => (it.id === actualizado.id ? actualizado : it))
      );
      setMostrarModificar(false);
      setSuccessTitle("¡Éxito!");
      setSuccessMsg("Estado modificado exitosamente");
      setMostrarSuccess(true);
    } catch (e) {
      setErrorTitulo("Error al modificar");
      setErrorMensaje(e.message || "No se pudo modificar el estado");
      setMostrarError(true);
    }
  };

  const handleDarDeBaja = (item) => {
    setItemSeleccionado(item);
    setMostrarEliminar(true);
  };

  const handleConfirmarBaja = async () => {
  try {
    const resultado = await darDeBajaEstadoEvento(itemSeleccionado.id);

    // Actualizamos el estado en el listado sin eliminarlo
    setItems(
      items.map((it) => 
        it.id === itemSeleccionado.id ? { ...it, fechaBaja: new Date().toISOString() } : it
      )
    );

    setMostrarEliminar(false);
    setSuccessTitle("¡Éxito!");
    setSuccessMsg(resultado.mensaje || "Estado dado de baja correctamente");
    setMostrarSuccess(true);
  } catch (e) {
    setErrorTitulo("Error al dar de baja");
    setErrorMensaje(e.message || "No se pudo dar de baja el estado");
    setMostrarError(true);
  }
};


  const handleHabilitar = async (item) => {
    try {
      const resultado = await habilitarEstadoEvento(item.id);
      // Actualiza el listado, por ejemplo volviendo a cargar o modificando el estado local:
      setItems(
        items.map((it) => (it.id === item.id ? resultado : it))
      );
      setSuccessTitle("¡Éxito!");
      setSuccessMsg(resultado.mensaje || "Estado habilitado correctamente");
      setMostrarSuccess(true);
    } catch (e) {
      setErrorTitulo("Error al habilitar");
      setErrorMensaje(e.message || "No se pudo habilitar el estado");
      setMostrarError(true);
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
          <h1 className="page-title">Estado del evento</h1>
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
              Agregar Estado
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
            Gestionar los estados del evento aceptados en el sistema.
          </p>
          {items.length === 0 ? (
            <div className="table-container">
              <div
                className="table-scroll"
                style={{
                  padding: "32px 16px",
                  textAlign: "center",
                  color: "#6b7280",
                }}
              >
                No hay estados registrados todavía.
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
                  columns={[
                    { key: "nombre", header: "Nombre", sortable: true },
                    {
                      key: "estado",
                      header: "Estado",
                      render: (item) =>
                        item.fechaBaja ? (
                          <span style={{ fontWeight: 600 }}>Inactivo</span>
                        ) : (
                          <span style={{  fontWeight: 600 }}>Activo</span>
                        ),
                    },
                  ]}
                  onModificar={handleModificar}
                  onEliminar={(item) => {
                  if (item.fechaBaja != null || item.fechaHoraBaja != null) {
                    handleHabilitar(item);
                  } else {
                    setItemSeleccionado(item);
                    setMostrarEliminar(true);
                  }
                }}
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
            placeholder:
              "ejemplo: creado, en espera, realizado, cancelado, etc",
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
            titulo: "Nuevo Estado",
            subtitulo: "Agregar",
            descripcion: "Ingrese el nombre del estado",
          },
          editar: {
            titulo: "Editar Estado",
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
            titulo: "Editar Estado",
            subtitulo: "Modificar",
            descripcion: "Actualice el nombre del estado",
          },
          crear: {
            titulo: "Nuevo Estado",
            subtitulo: "Agregar",
            descripcion: "Ingrese el nombre",
          },
        }}
        onSave={(datos) => handleGuardarModificado(datos.nombre)}
        onClose={() => setMostrarModificar(false)}
      />
      <ModalConfirmarEliminar
        titulo="¿Dar de baja este estado?"
        mensaje={`¿Estás seguro que deseas dar de baja "${
          itemSeleccionado?.nombre || ""
        }"?`}
        mostrar={mostrarEliminar}
        onCancelar={() => setMostrarEliminar(false)}
        onConfirmar={handleConfirmarBaja} // <-- cambiamos la función
      />
      <ModalAccionExito
        titulo={successTitle}
        mensaje={successMsg}
        mostrar={mostrarSuccess}
        onAceptar={() => setMostrarSuccess(false)}
      />
      <Modal_Error
        titulo={errorTitulo}
        mensaje={errorMensaje}
        mostrar={mostrarError}
        onCerrar={() => setMostrarError(false)}
      />
    </>
  );
}
