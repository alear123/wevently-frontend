import { useState, useEffect, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import dominio from "../../../../../common/API";
import ModalAccionExito from "../../../../../common/layouts/ModalAccionExito";
import ModalError from "../../../../../common/layouts/ModalError";
import "../../src/assets/abm-shared.css";

function NuevoGrupo() {
  const [showModal, setShowModal] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  let [allPermissions, setAllPermissions] = useState([]);
  const [lastCheckedId, setLastCheckedId] = useState(null);

  const NombreDelGrupo = useRef();
  const Descripcion = useRef();

  //Variables para manejar modales de mensajes
  let [titulo, setTitulo] = useState("");
  let [mensaje, setMensaje] = useState("");
  let [modalExito, setModalExito] = useState(false);
  let [modalError, setModalError] = useState(false);

  // Bloquear scroll del body y enfocar el modal al abrir
  const modalRef = useRef(null);
  useEffect(() => {
    if (!showModal) return;
    document.body.classList.add("abm-no-scroll");
    setTimeout(() => {
      modalRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      modalRef.current?.focus?.();
    }, 0);
    return () => {
      document.body.classList.remove("abm-no-scroll");
    };
  }, [showModal]);

  // Selección múltiple con shift (refactor para mantener shiftKey sin depender de click programático)
  function togglePermission(permId, shiftPressed) {
    const idx = filteredPermissions.findIndex(p => p.id === permId);
    if (shiftPressed && lastCheckedId !== null) {
      const lastIdx = filteredPermissions.findIndex(p => p.id === lastCheckedId);
      if (lastIdx !== -1 && idx !== -1) {
        const [start, end] = [Math.min(lastIdx, idx), Math.max(lastIdx, idx)];
        const rangeIds = filteredPermissions.slice(start, end + 1).map(p => p.id);
        const clickedSelected = selectedPermissions.includes(permId);
        setSelectedPermissions(prev => {
          if (clickedSelected) {
            return prev.filter(id => !rangeIds.includes(id));
          } else {
            return Array.from(new Set([...prev, ...rangeIds]));
          }
        });
        setLastCheckedId(permId);
        return;
      }
    }
    setSelectedPermissions(prev => prev.includes(permId) ? prev.filter(id => id !== permId) : [...prev, permId]);
    setLastCheckedId(permId);
  }

  useEffect(() => {
    async function fetchPermissions() {
      const response = await fetch(dominio + "/api/seguridad/permisos", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) throw new Error("Error al obtener usuarios");
      setAllPermissions(await response.json());
    }
    fetchPermissions();
  }, []);

  async function crearGrupo() {
    const dtoGrupo = {
      nombre: NombreDelGrupo.current.value,
      descripcion: Descripcion.current.value,
      permisos: selectedPermissions,
    };

    try {
      const response = await fetch(dominio + "/api/seguridad/grupos/nuevo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // importante para JSON
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(dtoGrupo),
      });

      if (response.ok) {
        setTitulo("¡Grupo añadido!");
        setMensaje(`El grupo ${dtoGrupo.nombre} ha sido añadido con exito`);
        setShowModal(false);
        setModalExito(true);
        return;
      }

      setTitulo("Error!");
      setMensaje(response.text());
      setShowModal(false);
      setModalError(true);
    } catch (error) {
      setTitulo("Error!");
      setMensaje(
        "Se ha producido un error al intentar comunicarse con el servidor, reintente mas tarde"
      );
      setShowModal(false);
      setModalError(true);
    }
  }

  function cerrar() {
    setModalError(false);
    setModalExito(false);
  }

  const filteredPermissions = allPermissions.filter(
    (perm) =>
      (perm.ruta?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (perm.descripcion?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

 return (
  <>
    <div className="col-md-6">
      <button className="abm-primary-btn" onClick={() => setShowModal(true)}>
        Nuevo Grupo
      </button>
    </div>

    {showModal && (
      <div
        className="abm-modal-overlay page-scroll"
        role="dialog"
        aria-modal="true"
        onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
      >
        <div ref={modalRef} className="abm-modal-shell" style={{ maxWidth: 640 }} tabIndex={-1}>
          <button type="button" className="abm-modal-close" aria-label="Cerrar" onClick={() => setShowModal(false)} />
          <div className="modal-header" style={{ borderBottom: "1px solid #e5e7eb", marginBottom: 12 }}>
            <h5 className="modal-title">Crear Nuevo Grupo de Permisos</h5>
          </div>
          <div className="abm-modal-body">
            <form>
              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Nombre del Grupo</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ej: Administradores"
                    ref={NombreDelGrupo}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Descripción</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Descripción del grupo"
                    ref={Descripcion}
                  />
                </div>
              </div>

              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <label className="form-label mb-0">Seleccionar Permisos Existentes</label>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span className="selected-count">{selectedPermissions.length} seleccionados</span>
                    {selectedPermissions.length > 0 && (
                      <button
                        type="button"
                        title="Deseleccionar todos"
                        style={{ background: "none", border: "none", color: "#ff3b3b", fontSize: 20, cursor: "pointer", marginLeft: 4, lineHeight: 1, padding: 0, width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.2s" }}
                        onClick={() => setSelectedPermissions([])}
                        onMouseOver={(e) => (e.currentTarget.style.background = "#ffeaea")}
                        onMouseOut={(e) => (e.currentTarget.style.background = "none")}
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>

                <div className="permissions-search mb-2">
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-search" />
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Buscar permisos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{ width: "auto" }}
                    />
                  </div>
                </div>

                <div className="permissions-list">
                  {filteredPermissions.map((perm) => {
                    const isSelected = selectedPermissions.includes(perm.id);
                    return (
                      <div
                        key={perm.id}
                        className={`permission-item ${isSelected ? "selected" : ""} d-flex align-items-center p-2 border rounded mb-1`}
                        style={{ cursor: "pointer" }}
                        id={perm.id}
                      >
                        <div
                          style={{ display: "flex", alignItems: "center", justifyContent: "flex-start", width: "auto", minWidth: 0, marginRight: 0, gap: 0 }}
                          onClick={(e) => { if (e.target.type !== "checkbox") { togglePermission(perm.id, e.shiftKey); } }}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onClick={(e) => togglePermission(perm.id, e.shiftKey)}
                            onChange={() => {}}
                            style={{ accentColor: "#007bff", width: 18, height: 18, cursor: "pointer", marginRight: 8 }}
                            tabIndex={0}
                          />
                          <span style={{ marginRight: 0 }}>{perm.ruta}</span>
                        </div>
                        <small className="text-muted" style={{ flex: 1 }}>{perm.descripcion}</small>
                        <span className={`permission-method method-${perm.metodoHttp.toLowerCase()}`} style={{ userSelect: "none", marginLeft: 8 }}>
                          {perm.metodoHttp}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </form>
          </div>
          <div className="abm-modal-actions">
            <button type="button" className="abm-action-btn cancel" onClick={() => setShowModal(false)}>
              Cancelar
            </button>
            <button type="button" className="abm-primary-btn" onClick={() => { crearGrupo(); }}>
              Crear Grupo
            </button>
          </div>
        </div>
      </div>
    )}

    <ModalAccionExito
      mostrar={modalExito}
      titulo={titulo}
      mensaje={mensaje}
      onAceptar={cerrar}
    />
    <ModalError
      mostrar={modalError}
      titulo={titulo}
      mensaje={mensaje}
      onCerrar={cerrar}
    />
  </>
);
}
export default NuevoGrupo;
