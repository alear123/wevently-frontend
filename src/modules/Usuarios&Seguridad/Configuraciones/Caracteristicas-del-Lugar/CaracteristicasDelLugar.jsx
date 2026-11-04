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
import {
  getCaracteristicasLugar,
  crearCaracteristicaLugar,
  modificarCaracteristicaLugar,
  eliminarCaracteristicaLugar,
} from "./src/api/caracteristicaLugarApi";

export default function CaracteristicasDelLugar() {
  const [items, setItems] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [mostrarAgregar, setMostrarAgregar] = useState(false);
  const [mostrarModificar, setMostrarModificar] = useState(false);
  const [mostrarEliminar, setMostrarEliminar] = useState(false);
  const [itemSeleccionado, setItemSeleccionado] = useState(null);
  const [mostrarSuccess, setMostrarSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [successTitle, setSuccessTitle] = useState("");

  useEffect(() => {
    getCaracteristicasLugar()
      .then((data) => {
        // Si la API devuelve { content: [...] }
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

  // Ordenamiento reutilizando hook
  const { sortConfig, sortedItems: itemsOrdenados, handleSort } = useSort(itemsFiltrados, { resetPage: () => setPaginaActual(1), storageKey: 'sort:caracteristicasLugar' });

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
      const nuevo = await crearCaracteristicaLugar(nombre);
      setItems([...items, nuevo]);
      setMostrarAgregar(false);
      setSuccessTitle("¡Éxito!");
      setSuccessMsg("Característica agregada exitosamente");
      setMostrarSuccess(true);
    } catch (e) {
      alert(e.message);
    }
  };

  const handleModificar = (item) => {
    setItemSeleccionado(item);
    setMostrarModificar(true);
  };

  const handleGuardarModificado = async (nuevoNombre) => {
    try {
      const actualizado = await modificarCaracteristicaLugar(
        itemSeleccionado.id,
        nuevoNombre
      );
      setItems(
        items.map((it) => (it.id === actualizado.id ? actualizado : it))
      );
      setMostrarModificar(false);
      setSuccessTitle("¡Éxito!");
      setSuccessMsg("Característica modificada exitosamente");
      setMostrarSuccess(true);
    } catch (e) {
      alert(e.message);
    }
  };

  const handleEliminar = (item) => {
    setItemSeleccionado(item);
    setMostrarEliminar(true);
  };

  const handleConfirmarEliminar = async () => {
    try {
      await eliminarCaracteristicaLugar(itemSeleccionado.id);
      setItems(items.filter((it) => it.id !== itemSeleccionado.id));
      setMostrarEliminar(false);
      setSuccessTitle("¡Éxito!");
      setSuccessMsg("Característica eliminada exitosamente");
      setMostrarSuccess(true);
    } catch (e) {
      alert(e.message);
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
          <h1 className="page-title">Características del lugar</h1>
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
              Agregar Característica
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
            Gestionar las características del lugar aceptados en el sistema.
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
            placeholder: "ejemplo: piscina, wifi, patio, etc",
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
            titulo: "Nueva Característica",
            subtitulo: "Agregar",
            descripcion: "Ingrese el nombre de la característica",
          },
          editar: {
            titulo: "Editar Característica",
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
            titulo: "Editar Característica",
            subtitulo: "Modificar",
            descripcion: "Actualice el nombre de la característica",
          },
          crear: {
            titulo: "Nueva Característica",
            subtitulo: "Agregar",
            descripcion: "Ingrese el nombre",
          },
        }}
        onSave={(datos) => handleGuardarModificado(datos.nombre)}
        onClose={() => setMostrarModificar(false)}
      />
      <ModalConfirmarEliminar
        titulo="¿Eliminar esta característica?"
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
    </>
  );
}
