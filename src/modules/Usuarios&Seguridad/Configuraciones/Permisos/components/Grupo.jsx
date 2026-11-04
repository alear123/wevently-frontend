import { useState, useRef, useEffect } from "react";
import ModalAñadirPermiso from "./ModalAñadirPermiso";
import ModalEditarPermiso from "./ModalEditarPermiso";
import ModalConfirmarEliminar from "../../../../../common/layouts/ModalConfirmarEliminar";
import ModalExito from "../../../../../common/layouts/ModalAccionExito";
import dominio from "../../../../../common/API";
import Buscador from "../../../../../common/components/Buscador";
import "../../src/assets/abm-shared.css";
import FiltroTipo from "../../src/components/FiltroTipo.jsx";
import { MdImportantDevices } from "react-icons/md";
//import './App.css'

function Grupo({ grupo }) {
  const [añadirPermiso, setAñadirPermiso] = useState(false);
  const [editarPermiso, setEditarPermiso] = useState(false);
  const [mostrarConfirmarEliminar, setMostrarConfirmarEliminar] =
    useState(false);
  const [mostrarExito, setMostrarExito] = useState(false);
  const [permisos, setPermisos] = useState(
    grupo.permisos ? grupo.permisos : []
  );
  //Filtrar dentro de un grupo
  const [filtro, setFiltro] = useState("Todos");
  const tiposPermiso = Array.from(
    new Set(permisos.map((p) => p.tipoPermiso))
  ).filter(Boolean);
  // Esto te da ["PANTALLA", "API"] si existen ambos
  const metodos = ["GET", "POST", "PUT", "DELETE"];
  // Construimos opciones: "Todos", "Pantallas", encabezado "API" (no clickable), y luego métodos
  const opcionesFiltro = [
    { etiqueta: "Todos", valor: "Todos" },
    ...(tiposPermiso.includes("PANTALLA")
      ? [{ etiqueta: "Pantallas", valor: "PANTALLA" }]
      : []),
    // Header API solo si existen permisos API
    ...(tiposPermiso.includes("API")
      ? [{ etiqueta: "API", valor: "API_HEADER", isHeader: true, disabled: true }]
      : []),
    ...(tiposPermiso.includes("API")
      ? metodos.map((m) => ({ etiqueta: m, valor: m }))
      : []),
  ];

  const [mostrarGrupo, setMostrarGrupo] = useState(true);
  const [expanded, setExpanded] = useState(false);
  // Para búsqueda (debe declararse antes del useEffect que la usa como dependencia)
  const [busqueda, setBusqueda] = useState("");

  // Para animación de colapso/expansión
  const contentRef = useRef(null); // mide el alto interno
  const [collapseHeight, setCollapseHeight] = useState(0);

  // Recalcula altura cuando cambia el contenido visible o el estado expanded
  useEffect(() => {
    if (contentRef.current) {
      requestAnimationFrame(() => {
        const h = contentRef.current.scrollHeight;
        setCollapseHeight(h);
      });
    }
  }, [expanded, permisos, busqueda]);

  // Para selección múltiple
  const [selectedPermisos, setSelectedPermisos] = useState([]);
  const [mostrarConfirmarQuitarMultiples, setMostrarConfirmarQuitarMultiples] =
    useState(false);

  // (busqueda ya declarado arriba)

  // Para selección con shift
  const [lastCheckedId, setLastCheckedId] = useState(null);

  //Variables para manejar modales
  let titulo = useRef("");
  let mensaje = useRef("");
  let onConfirmar = useRef();
  let onAceptar = useRef();

  //Variables Modal Editar permiso
  let idPermiso = useRef(0);
  let permisoRef = useRef({});

  function btnCancelar() {
    setAñadirPermiso(false);
    setEditarPermiso(false);
    setMostrarConfirmarEliminar(false);
    setMostrarExito(false);
    setMostrarConfirmarQuitarMultiples(false);
  }

  function onAceptarBaja() {
    setMostrarExito(false);
    setMostrarGrupo(false);
  }

  function onAñadir(perm) {
    setAñadirPermiso(false);
    setMostrarExito(false);
    setPermisos([...permisos, ...perm]);
  }

  async function darBajaGrupo() {
    try {
      const response = await fetch(
        `${dominio}/api/seguridad/grupos/baja?id=${grupo.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error(
          "No se ha podido establecer una conexion con el servidor, intente mas tarde"
        );
      }
      setMostrarConfirmarEliminar(false);
      titulo.current = "Exito";
      mensaje.current = `El grupo ${grupo.nombre} fue dado de baja exitosamente`;
      onAceptar.current = onAceptarBaja;
      setMostrarExito(true);
    } catch (error) {
      titulo.current = "Error";
      mensaje.current = error.message;
      setModalError(true);
    }
  }

  async function quitarPermiso() {
    try {
      const response = await fetch(
        `${dominio}/api/seguridad/grupos/permiso/quitar?grupo=${grupo.id}&permiso=${idPermiso.current}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error(
          "No se ha podido establecer una conexion con el servidor, intente mas tarde"
        );
      }
      setMostrarConfirmarEliminar(false);
      // Quitar de la lista visual
      setPermisos((prev) => prev.filter((permiso) => permiso.id !== idPermiso.current));
      // Asegurar que se remueva de la selección múltiple si estaba seleccionado
      setSelectedPermisos((prev) => prev.filter((id) => id !== idPermiso.current));
      titulo.current = "Exito";
      mensaje.current = `El permiso fue quitado exitosamente`;
      onAceptar.current = btnCancelar;
      setMostrarExito(true);
    } catch (error) {
      titulo.current = "Error";
      mensaje.current = error.message;
      setModalError(true);
    }
  }

  // Seleccionar/deseleccionar permisos con soporte Shift (alineado con NuevoGrupo / ModalAñadirPermiso)
  function togglePermission(permId, shiftPressed) {
    const idx = permisosFiltrados.findIndex((p) => p.id === permId);
    if (shiftPressed && lastCheckedId !== null) {
      const lastIdx = permisosFiltrados.findIndex((p) => p.id === lastCheckedId);
      if (lastIdx !== -1 && idx !== -1) {
        const [start, end] = [Math.min(lastIdx, idx), Math.max(lastIdx, idx)];
        const rangeIds = permisosFiltrados.slice(start, end + 1).map((p) => p.id);
        const clickedSelected = selectedPermisos.includes(permId);
        setSelectedPermisos((prev) => {
          if (clickedSelected) {
            return prev.filter((id) => !rangeIds.includes(id));
          } else {
            return Array.from(new Set([...prev, ...rangeIds]));
          }
        });
        setLastCheckedId(permId);
        return;
      }
    }
    setSelectedPermisos((prev) =>
      prev.includes(permId)
        ? prev.filter((id) => id !== permId)
        : [...prev, permId]
    );
    setLastCheckedId(permId);
  }


  // Seleccionar/deseleccionar todos los permisos filtrados
  function toggleSeleccionarTodos() {
    const idsFiltrados = permisosFiltrados.map((p) => p.id);
    const todosSeleccionados = idsFiltrados.every((id) =>
      selectedPermisos.includes(id)
    );
    if (todosSeleccionados) {
      setSelectedPermisos((prev) =>
        prev.filter((id) => !idsFiltrados.includes(id))
      );
    } else {
      setSelectedPermisos((prev) =>
        Array.from(new Set([...prev, ...idsFiltrados]))
      );
    }
  }

  // Quitar varios permisos
  async function quitarPermisosSeleccionados() {
    try {
      const response = await fetch(
        `${dominio}/api/seguridad/grupos/permisos/quitar-multiple?grupo=${grupo.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(selectedPermisos),
        }
      );
      if (!response.ok) {
        throw new Error(
          "No se ha podido establecer una conexion con el servidor, intente mas tarde"
        );
      }
      setPermisos(
        permisos.filter((permiso) => !selectedPermisos.includes(permiso.id))
      );
      setSelectedPermisos([]);
      titulo.current = "Exito";
      mensaje.current = `Los permisos fueron quitados exitosamente`;
      onAceptar.current = btnCancelar;
      setMostrarExito(true);
    } catch (error) {
      titulo.current = "Error";
      mensaje.current = error.message;
      setModalError(true);
    }
    setMostrarConfirmarQuitarMultiples(false);
  }

  // Filtrar permisos según búsqueda
  // Deduplicar por id por si llegan duplicados desde el backend o por cambios de filtro
  const permisosUnicos = Array.from(
    new Map(permisos.map((p) => [p.id, p])).values()
  );

  const permisosFiltrados = permisosUnicos
    .filter(
      (permiso) =>
        (permiso.ruta?.toLowerCase() || "").includes(busqueda.toLowerCase()) ||
        (permiso.descripcion?.toLowerCase() || "").includes(
          busqueda.toLowerCase()
        )
    )
    .filter((permiso) => {
      if (filtro === "Todos") return true;
      // Pantallas: solo tipo PANTALLA y método GET
      if (filtro === "PANTALLA")
        return permiso.tipoPermiso === "PANTALLA" && permiso.metodoHttp === "GET";
      // Elegir método: incluye tanto rutas de API como Pantallas con ese método
      if (metodos.includes(filtro)) return permiso.metodoHttp === filtro;
      return true;
    });

  if (!mostrarGrupo) return null;

  return (
    <>
      <div className="permissions-section">
        <div className="section-header" style={{ alignItems: "flex-end" }}>
          <div style={{ display: "flex", alignItems: "center", flex: 1 }}>
            <h2 className="section-title" style={{ marginBottom: 0 }}>
              {grupo.nombre}
            </h2>
          </div>
          <div
            className="section-actions"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginLeft: "auto",
            }}
          >
            <button
              className="abm-primary-btn"
              onClick={() => setAñadirPermiso(true)}
            >
              Añadir
            </button>
            <button
              className="abm-action-btn delete"
              onClick={() => {
                titulo.current = "Eliminar grupo";
                mensaje.current = `¿Esta seguro que desea dar de baja el grupo de permisos ${grupo.nombre}?`;
                onConfirmar.current = darBajaGrupo;
                setMostrarConfirmarEliminar(true);
              }}
            >
              Dar de baja
            </button>
            <button
              className="abm-outline-btn"
              onClick={() => setExpanded((prev) => !prev)}
            >
              {expanded ? "Ocultar permisos" : "Ver permisos"}
            </button>
          </div>
        </div>

        {/* Fila de controles: SIEMPRE afuera del colapsable */}
        {expanded && (
          <div
            className="d-flex align-items-center gap-2 mb-3"
            style={{ marginTop: 8, paddingLeft: 16 }}
          >
            <div
              style={{ width: "220px", minWidth: "120px", maxWidth: "100%" }}
            >
              <Buscador
                placeholder="Buscar permiso..."
                value={busqueda}
                onChange={setBusqueda}
                useSharedStyles={true}
              />
            </div>
            <button
              className="abm-outline-btn"
              type="button"
              style={{ whiteSpace: "nowrap", flexShrink: 0 }}
              onClick={toggleSeleccionarTodos}
            >
              {permisosFiltrados.length > 0 &&
              permisosFiltrados.every((p) => selectedPermisos.includes(p.id))
                ? "Deseleccionar todos"
                : "Seleccionar todos"}
            </button>
            {selectedPermisos.length > 0 && (
              <button
                className="abm-action-btn delete"
                type="button"
                style={{ whiteSpace: "nowrap", flexShrink: 0 }}
                onClick={() => {
                  titulo.current = "Quitar permisos";
                  mensaje.current = `¿Está seguro que desea quitar los permisos seleccionados del grupo ${grupo.nombre}?`;
                  setMostrarConfirmarQuitarMultiples(true);
                }}
              >
                Quitar ({selectedPermisos.length})
              </button>
            )}
            <div style={{ flex: 1 }} />
            <FiltroTipo
              tiposDisponibles={opcionesFiltro}
              tipoSeleccionado={filtro}
              onChange={setFiltro}
              maxLength={18}
              compact={true}
              showTooltip={true}
              className="filtro-corto"
            />
          </div>
        )}

        {/* SOLO la lista de permisos va dentro del colapsable */}
        <div
          className={`permissions-collapse ${expanded ? "expanded" : ""}`}
          aria-hidden={!expanded}
          style={{
            minHeight: expanded ? 120 : 0,
            height:
              expanded && permisosFiltrados.length > 10
                ? collapseHeight
                : expanded
                ? "auto"
                : 0,
            transition: "height 0.3s, min-height 0.3s",
          }}
        >
          <div ref={contentRef}>
            <div
              className="permissions-table"
              style={{
                maxHeight: permisosFiltrados.length > 10 ? "520px" : "none",
                overflowY: permisosFiltrados.length > 10 ? "auto" : "visible",
              }}
            >
              {permisosFiltrados.map((permiso) => (
                <div
                  className={`permission-row ${
                    selectedPermisos.includes(permiso.id) ? "selected" : ""
                  }`}
                  key={permiso.id}
                  style={{ display: "flex", alignItems: "center" }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 32,
                      height: 32,
                      minWidth: 32,
                      minHeight: 32,
                      cursor: "pointer",
                      marginRight: 8,
                    }}
                    onClick={(e) => {
                      if (e.target.type !== "checkbox") {
                        togglePermission(permiso.id, e.shiftKey);
                      }
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedPermisos.includes(permiso.id)}
                      onClick={(e) => togglePermission(permiso.id, e.shiftKey)}
                      onChange={() => {}}
                      style={{
                        accentColor: "#007bff",
                        width: 18,
                        height: 18,
                        cursor: "pointer",
                      }}
                      tabIndex={0}
                    />
                  </div>
                  <div
                    className="permission-route"
                    style={{ display: "flex", alignItems: "center", flex: 1 }}
                  >
                    <span
                      className={`permission-method method-${permiso.metodoHttp.toLowerCase()}`}
                    >
                      {permiso.metodoHttp}
                    </span>
                    <span style={{ marginLeft: 8 }}>{permiso.ruta}</span>
                  </div>
                  <div className="d-flex gap-2">
                    <button
                      className="abm-action-btn edit"
                      onClick={() => {
                        permisoRef.current = permiso;
                        setEditarPermiso(true);
                      }}
                    >
                      Modificar
                    </button>
                    <button
                      className="abm-action-btn delete"
                      onClick={() => {
                        titulo.current = "Quitar permiso";
                        mensaje.current = `¿Esta seguro que desea quitar este permiso del grupo ${grupo.nombre}?`;
                        idPermiso.current = permiso.id;
                        onConfirmar.current = quitarPermiso;
                        setMostrarConfirmarEliminar(true);
                      }}
                    >
                      Quitar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <ModalAñadirPermiso
          mostrar={añadirPermiso}
          onCancelar={btnCancelar}
          grupo={grupo}
          onAñadir={onAñadir}
        />
        <ModalEditarPermiso
          mostrar={editarPermiso}
          onCancelar={btnCancelar}
          permiso={permisoRef.current}
        />
        <ModalConfirmarEliminar
          mostrar={mostrarConfirmarEliminar}
          titulo={titulo.current}
          mensaje={mensaje.current}
          onCancelar={btnCancelar}
          onConfirmar={onConfirmar.current}
        />
        <ModalConfirmarEliminar
          mostrar={mostrarConfirmarQuitarMultiples}
          titulo={titulo.current}
          mensaje={mensaje.current}
          onCancelar={btnCancelar}
          onConfirmar={quitarPermisosSeleccionados}
        />
        <ModalExito
          mostrar={mostrarExito}
          titulo={titulo.current}
          mensaje={mensaje.current}
          onAceptar={onAceptar.current}
        />
      </div>
    </>
  );
}
export default Grupo;
