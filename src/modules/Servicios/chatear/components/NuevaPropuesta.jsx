import '../assets/chat.css'
import { useEffect, useState } from "react";
import ModalConfimarEditar from "../../../../common/layouts/ModalConfirmarEditar";
import ModalConfirmarEliminar from "../../../../common/layouts/ModalConfirmarEliminar";
import ModalError from "../../../../common/layouts/ModalError";

export default function NuevaPropuesta({ mostrar, onCerrar, onEnviar, onCancelar, infoPropuesta }) {
    const [comentarios, setComentarios] = useState("");
    const [monto, setMonto] = useState(0);
    const [seña, setSeña] = useState(0);
    const [total, setTotal] = useState(0);
    const [comisiones, setComisiones] = useState(0);
    const [titulo, setTitulo] = useState("");
    const [mensaje, setMensaje] = useState("");
    const [mostrarExito, setMostrarExito] = useState(false);
    const [mostrarError, setMostrarError] = useState(false);


    if (!mostrar) return null;

    return (
        <>
            <div className="modal fade show d-block" id="proposalModal">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header" style={{ marginBottom: "0" }}>
                            <h5 className="modal-title">Detalles de la Propuesta</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" onClick={onCerrar}></button>
                        </div>
                        <div className="modal-body">
                            {/* Datos Generales */}
                            <div className="detail-section mb-3">
                                <h6 className="fw-bold mb-2">Informacion General</h6>
                                <div className="detail-content">
                                    <div className="detail-item">Nombre del cliente: {infoPropuesta?.cliente}</div>
                                    <div className="detail-item">Nombre del evento: {infoPropuesta?.evento}</div>
                                    <div className="detail-item">Fecha: {infoPropuesta?.fecha}</div>
                                </div>
                            </div>

                            {/* Descripción */}
                            <div className="detail-section mb-3">
                                <h6 className="fw-bold mb-2">Descripción</h6>
                                <div className="detail-content">
                                    <div className="detail-item">Nombre del servicio: {infoPropuesta?.servicio}</div>
                                    <div className="detail-item">Descripción: {infoPropuesta?.descripcion}</div>
                                    <div className="detail-item">
                                        <label htmlFor="comentarios" style={{ display: "block", marginBottom: "4px" }}>
                                            Comentarios:
                                        </label>
                                        <textarea
                                            style={{ width: "100%", border: "none" }}
                                            id="comentarios"
                                            value={comentarios}
                                            onChange={(e) => setComentarios(e.target.value)}
                                            rows={6}

                                            className="textarea-detalle"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Costos */}
                            <div className="detail-section mb-3">
                                <h6 className="fw-bold mb-2">Presupuesto</h6>

                                <div className="detail-content">
                                    {/*
                                    <div className="detail-item">
                                        <label htmlFor="comentarios">Seña: $ </label>
                                        <input
                                            style={{ width: "auto", border: "none" }}
                                            id="comentarios"
                                            type="number"
                                            value={seña}
                                            onChange={(e) => setSeña(Number(e.target.value))}
                                            className="input-detalle"
                                        />
                                    </div>
                                    */}
                                    <div className="detail-item">
                                        <label htmlFor="comentarios">Monto: $</label>
                                        <input
                                            style={{ width: "auto", border: "none" }}
                                            id="comentarios"
                                            type="number"
                                            value={monto}
                                            onChange={(e) => {
                                                setMonto(Number(e.target.value));
                                                setComisiones(((infoPropuesta?.comision ? infoPropuesta?.comision : 0) * Number(e.target.value)).toFixed(2));
                                                setTotal(Number(e.target.value) - (infoPropuesta?.comision ? infoPropuesta?.comision : 0) * Number(e.target.value))

                                            }}
                                            className="input-detalle"
                                        />
                                    </div>
                                    <div className="detail-item">
                                        <label htmlFor="comentarios">Comisiones: - $</label>
                                        {comisiones}
                                    </div>
                                    <div className="detail-item">
                                        <label htmlFor="comentarios">Recibiras en total: $</label>
                                        {total}
                                    </div>

                                </div>
                            </div>
                        </div>
                        <div className="modal-footer" style={{ display: 'flex', alignSelf: 'center' }}>
                            <button
                                type="button"
                                className="btn btn-primary "
                                onClick={() => {
                                    if (Number(monto) <= 0) {
                                        setTitulo("Error");
                                        setMensaje("El monto debe ser mayor a 0");
                                        setMostrarError(true);
                                        return;
                                    }
                                    setSeña(0);
                                    setTotal(0);
                                    setComentarios("");
                                    onEnviar({
                                        comentario: comentarios,
                                        seña: seña,
                                        total: monto
                                    })
                                }}>
                                Enviar
                            </button>
                            <button type="button" className="btn btn-danger btn-sm" data-bs-dismiss="modal" onClick={onCancelar}>
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <ModalError mostrar={mostrarError} titulo={titulo} mensaje={mensaje} onCerrar={() => { setMostrarError(false) }} />

        </>
    )
}