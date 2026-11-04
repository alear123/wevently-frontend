import { useState, useEffect, useRef } from "react";
import ModalExito from "../../../../../common/layouts/ModalAccionExito";
import ModalError from "../../../../../common/layouts/ModalError";
import dominio from "../../../../../common/API";
import "../../src/assets/abm-shared.css";

function ModalEditarPermiso({ permiso, mostrar, onCancelar }) {
  // Estados para modales de mensaje
  const [titulo, setTitulo] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [modalExito, setModalExito] = useState(false);
  const [modalError, setModalError] = useState(false);

  // Estados para los campos del formulario
  const [ruta, setRuta] = useState("");
  const [metodo, setMetodo] = useState("");
  const [descripcion, setDescripcion] = useState("");

  // Scroll lock + focus modal
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

  // Sincronizar estado con la prop permiso cada vez que cambia
  useEffect(() => {
    if (permiso) {
      setRuta(permiso.ruta || "");
      setMetodo(permiso.metodoHttp ? permiso.metodoHttp : "GET");
      setDescripcion(permiso.descripcion || "");
    }
  }, [permiso]);

  // Cierra los modales de éxito/error
  function handleCerrar() {
    setModalExito(false);
    setModalError(false);
  }

  // Función para guardar cambios
  async function editar() {
    try {
      const response = await fetch(
        `${dominio}/api/seguridad/permisos/actualizar/${permiso.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            ruta: ruta,
            metodoHttp: metodo,
            descripcion: descripcion,
          }),
        }
      );

      if (response.ok) {
        setTitulo("¡Permiso actualizado!");
        setMensaje("Se han guardado los cambios exitosamente.");
        setModalExito(true);
        onCancelar();
        return;
      }
      onCancelar();
      const errorMsg = await response.text();
      setTitulo("¡Error!");
      setMensaje(errorMsg || "No se pudo actualizar el permiso.");
      setModalError(true);
    } catch (error) {
      onCancelar();
      setTitulo("¡Error!");
      setMensaje(error?.message || "Error al comunicarse con el servidor. Intente más tarde.");
      setModalError(true);
    }
  }

  if (!mostrar) {
    return (
      <>
        <ModalExito mostrar={modalExito} titulo={titulo} mensaje={mensaje} onAceptar={handleCerrar} />
        <ModalError mostrar={modalError} titulo={titulo} mensaje={mensaje} onCerrar={handleCerrar} />
      </>
    );
  }

  return (
    <>
      <div
        className="abm-modal-overlay page-scroll"
        role="dialog"
        aria-modal="true"
        onClick={(e) => { if (e.target === e.currentTarget) onCancelar?.(); }}
      >
        <div ref={modalRef} className="abm-modal-shell" style={{ maxWidth: 640 }} tabIndex={-1}>
          <button type="button" className="abm-modal-close" aria-label="Cerrar" onClick={onCancelar} />
          <div className="modal-header" style={{ borderBottom: "1px solid #e5e7eb", marginBottom: 12 }}>
            <h5 className="modal-title">Modificar Permiso</h5>
          </div>

          <div className="abm-modal-body">
            <form id="editPermissionForm">
              <div className="mb-3">
                <label className="form-label">Ruta</label>
                <input type="text" className="form-control" value={ruta} onChange={(e) => setRuta(e.target.value)} />
              </div>
              <div className="mb-3">
                <label className="form-label">Método HTTP</label>
                <select className="form-select" value={metodo} onChange={(e) => setMetodo(e.target.value)}>
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="DELETE">DELETE</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">Descripción (opcional)</label>
                <input type="text" className="form-control" placeholder="Descripción del permiso" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
              </div>
            </form>
          </div>

          <div className="abm-modal-actions">
            <button type="button" className="abm-action-btn cancel" onClick={onCancelar}>Cancelar</button>
            <button type="button" className="abm-primary-btn" onClick={editar}>Guardar Cambios</button>
          </div>
        </div>
      </div>

      <ModalExito mostrar={modalExito} titulo={titulo} mensaje={mensaje} onAceptar={handleCerrar} />
      <ModalError mostrar={modalError} titulo={titulo} mensaje={mensaje} onCerrar={handleCerrar} />
    </>
  );
}

export default ModalEditarPermiso;
