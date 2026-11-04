import '../assets/chat.css'
import { useEffect, useState } from "react";
import ModalConfimarEditar from "../../../../common/layouts/ModalConfirmarEditar";
import ModalConfirmarEliminar from "../../../../common/layouts/ModalConfirmarEliminar";

export default function Propuesta({ mostrar, onCerrar, onAceptar, onRechazar, onEliminar, infoPropuesta, usuario }) {


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
                                        {infoPropuesta?.aclaraciones}
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
                                        {infoPropuesta?.seña}
                                    </div>
                                    */}
                                    <div className="detail-item">
                                        <label htmlFor="comentarios">Total: $ </label>
                                        {infoPropuesta?.total}
                                    </div>

                                </div>
                            </div>
                        </div>
                        <div className="modal-footer" style={{ display: 'flex', alignSelf: 'center' }}>
                            {usuario.rol == "Organizador" ?
                                <>
                                    <button
                                        type="button"
                                        className="btn btn-primary "
                                        onClick={onAceptar}
                                    >
                                        Aceptar
                                    </button>
                                    <button type="button" className="btn btn-danger btn-sm" data-bs-dismiss="modal" onClick={onRechazar}>
                                        Rechazar
                                    </button>
                                </>
                                : <button
                                    type="button"
                                    className="btn btn-danger btn-sm "
                                    onClick= {onEliminar}
                                >
                                    Eliminar
                                </button>
                            }
                        </div>
                    </div>
                </div>
            </div>

        </>
    )
}