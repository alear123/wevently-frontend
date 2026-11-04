import { useState, useEffect, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import dominio from "../../../../../common/API";
import ModalExito from "../../../../../common/layouts/ModalAccionExito";
import ModalError from "../../../../../common/layouts/ModalError";
import "../../src/assets/abm-shared.css";

function ModalAñadirPermiso({ grupo, mostrar, onCancelar, onAñadir }) {
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [allPermissions, setAllPermissions] = useState([]);
  const [activeTab, setActiveTab] = useState("existentes");
  const [lastCheckedId, setLastCheckedId] = useState(null);

  // Manejo de modales de feedback
  const titulo = useRef("");
  const mensaje = useRef("");
  const [modalExito, setModalExito] = useState(false);
  const [modalError, setModalError] = useState(false);

  // Agregar nuevo permiso (manual)
  const rutaRef = useRef("");
  const metodoRef = useRef("");
  const descripcionRef = useRef("");

  // Scroll lock + focus modal al abrir
  const modalRef = useRef(null);
  useEffect(() => {
    if (!mostrar) return;
    document.body.classList.add("abm-no-scroll");
    setTimeout(() => {
      modalRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      modalRef.current?.focus?.();
    }, 0);
    return () => {
      document.body.classList.remove("abm-no-scroll");
    };
  }, [mostrar]);

  // Cargar permisos disponibles
  useEffect(() => {
    async function fetchPermissions() {
      try {
        const response = await fetch(dominio + "/api/seguridad/permisos");
        if (!response.ok) {
          titulo.current = "Error!";
          mensaje.current = await response.text();
          setModalError(true);
          return;
        }
        setAllPermissions(await response.json());
      } catch (error) {
        titulo.current = "Error!";
        mensaje.current =
          "Se ha producido un error al intentar comunicarse con el servidor, reintente mas tarde";
        setModalError(true);
      }
    }
    fetchPermissions();
  }, []);

  function onAceptar() {
    setModalExito(false);
    setModalError(false);
  }

  async function nuevoPermiso() {
    try {
      const dtoPermiso = {
        ruta: rutaRef.current.value,
        metodoHttp: metodoRef.current.value,
        descripcion: descripcionRef.current.value,
      };

      const response = await fetch(
        `${dominio}/api/seguridad/grupos/permiso/agregar?grupo=${grupo.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(dtoPermiso),
        }
      );

      if (response.ok) {
        titulo.current = "¡Grupo actualizado!";
        mensaje.current = `Se ha registrado el permiso exitosamente!`;
        setModalExito(true);
        return;
      }

      titulo.current = "Error!";
      mensaje.current = await response.text();
      setModalError(true);
    } catch (error) {
      titulo.current = "Error!";
      mensaje.current = error.message
        ? error.message
        : "Se ha producido un error al intentar comunicarse con el servidor, reintente mas tarde";
      setModalError(true);
    }
  }

  async function añadirPermisos() {
    try {
      if (selectedPermissions.length === 0)
        throw new Error("Debe seleccionar por lo menos un permiso");
      const response = await fetch(
        `${dominio}/api/seguridad/grupos/permisos/agregar?grupo=${grupo.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(selectedPermissions),
        }
      );

      if (response.ok) {
        titulo.current = "¡Grupo actualizado!";
        mensaje.current = `Se han añadido los permisos exitosamente!`;
        setModalExito(true);
        return;
      }

      titulo.current = "Error!";
      mensaje.current = await response.text();
      setModalError(true);
    } catch (error) {
      titulo.current = "Error!";
      mensaje.current = error.message
        ? error.message
        : "Se ha producido un error al intentar comunicarse con el servidor, reintente mas tarde";
      setModalError(true);
    }
  }

  const filteredPermissions = allPermissions.filter(
    (perm) =>
      (perm.ruta || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (perm.descripcion || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Selección múltiple con shift (alineado a NuevoGrupo)
  function togglePermission(permId, shiftPressed) {
    const idx = filteredPermissions.findIndex((p) => p.id === permId);
    if (shiftPressed && lastCheckedId !== null) {
      const lastIdx = filteredPermissions.findIndex((p) => p.id === lastCheckedId);
      if (lastIdx !== -1 && idx !== -1) {
        const [start, end] = [Math.min(lastIdx, idx), Math.max(lastIdx, idx)];
        const rangeIds = filteredPermissions.slice(start, end + 1).map((p) => p.id);
        const clickedSelected = selectedPermissions.includes(permId);
        setSelectedPermissions((prev) => {
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
    setSelectedPermissions((prev) =>
      prev.includes(permId) ? prev.filter((id) => id !== permId) : [...prev, permId]
    );
    setLastCheckedId(permId);
  }

  return (
    <>
      {mostrar && (
        <div
          className="abm-modal-overlay page-scroll"
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) onCancelar?.();
          }}
        >
          <div ref={modalRef} className="abm-modal-shell" style={{ maxWidth: 640 }} tabIndex={-1}>
            <button type="button" className="abm-modal-close" aria-label="Cerrar" onClick={onCancelar}></button>

            <div className="modal-header" style={{ borderBottom: "1px solid #e5e7eb", marginBottom: 12 }}>
              <h5>Añadir Permiso al Grupo</h5>
            </div>

            <div className="abm-modal-body">
              <ul className="nav nav-tabs mb-3" id="permissionTabs" role="tablist">
                <li className="nav-item" role="presentation">
                  <button
                    className={`nav-link ${activeTab === "existentes" ? "active" : ""}`}
                    onClick={() => setActiveTab("existentes")}
                  >
                    Permisos Existentes
                  </button>
                </li>
                <li className="nav-item" role="presentation">
                  <button
                    className={`nav-link ${activeTab === "manual" ? "active" : ""}`}
                    onClick={() => setActiveTab("manual")}
                  >
                    Agregar Manualmente
                  </button>
                </li>
              </ul>

              <div className="tab-content" id="permissionTabsContent">
                <div className={`tab-pane fade ${activeTab === "existentes" ? "show active" : ""}`} id="existing-permissions" role="tabpanel">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <label className="form-label mb-0" style={{ userSelect: "none" }}>
                      Seleccionar Permisos Existentes
                    </label>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span className="selected-count">{selectedPermissions.length} seleccionados</span>
                      {selectedPermissions.length > 0 && (
                        <button
                          type="button"
                          title="Deseleccionar todos"
                          style={{
                            background: "none",
                            border: "none",
                            color: "#ff3b3b",
                            fontSize: 20,
                            cursor: "pointer",
                            marginLeft: 4,
                            lineHeight: 1,
                            padding: 0,
                            width: 28,
                            height: 28,
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "background 0.2s",
                          }}
                          onClick={() => setSelectedPermissions([])}
                          onMouseOver={(e) => (e.currentTarget.style.background = "#ffeaea")}
                          onMouseOut={(e) => (e.currentTarget.style.background = "none")}
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="input-group mb-3">
                    <span className="input-group-text">
                      <i className="bi bi-search" />
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      id="addPermissionSearch"
                      placeholder="Buscar permisos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{ width: "auto" }}
                    />
                  </div>

                  <div className="permissions-list" id="addPermissionsList">
                    {filteredPermissions.map((perm) => {
                      const isSelected = selectedPermissions.includes(perm.id);
                      return (
                        <div
                          key={perm.id}
                          className={`permission-item ${isSelected ? "selected" : ""}`}
                          style={{ display: "flex", alignItems: "center", cursor: "pointer" }}
                          onClick={(e) => {
                            if (e.target.type !== "checkbox") togglePermission(perm.id, e.shiftKey);
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 40, height: 40, minWidth: 40, minHeight: 40, cursor: "pointer", marginRight: 12 }}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onClick={(e) => togglePermission(perm.id, e.shiftKey)}
                              onChange={() => {}}
                              style={{ accentColor: "#007bff", width: 18, height: 18, cursor: "pointer" }}
                              tabIndex={0}
                            />
                          </div>
                          <label style={{ flex: 1, marginBottom: 0, userSelect: "none" }}>
                            <div className="permission-route">{perm.ruta}</div>
                            <small className="text-muted">{perm.descripcion || ""}</small>
                          </label>
                          <span className={`permission-method method-${(perm.metodoHttp || "").toLowerCase()}`} style={{ userSelect: "none" }}>
                            {perm.metodoHttp}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className={`tab-pane fade ${activeTab === "manual" ? "show active" : ""}`} id="manual-permission" role="tabpanel">
                  <form id="manualPermissionForm">
                    <div className="mb-3">
                      <label className="form-label">Ruta</label>
                      <input type="text" className="form-control" id="manualRoute" required placeholder="/api/ruta" ref={rutaRef} />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Método HTTP</label>
                      <select className="form-select" id="manualMethod" required ref={metodoRef}>
                        <option value="GET">GET</option>
                        <option value="POST">POST</option>
                        <option value="PUT">PUT</option>
                        <option value="DELETE">DELETE</option>
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Descripción (opcional)</label>
                      <input type="text" className="form-control" id="manualDescription" placeholder="Descripción del permiso" ref={descripcionRef} />
                    </div>
                  </form>
                </div>
              </div>
            </div>

            <div className="abm-modal-actions">
              <button type="button" className="abm-action-btn cancel" onClick={onCancelar}>Cancelar</button>
              <button
                type="button"
                className="abm-primary-btn"
                onClick={() => {
                  if (activeTab === "existentes") {
                    añadirPermisos();
                  } else {
                    nuevoPermiso();
                  }
                  const permis = allPermissions.filter((perm) => selectedPermissions.includes(perm.id));
                  onAñadir?.(permis);
                }}
              >
                Añadir
              </button>
            </div>
          </div>
        </div>
      )}

      <ModalExito mostrar={modalExito} titulo={titulo.current} mensaje={mensaje.current} onAceptar={onAceptar} />
      <ModalError mostrar={modalError} titulo={titulo.current} mensaje={mensaje.current} onCerrar={onAceptar} />
    </>
  );
}

export default ModalAñadirPermiso;
