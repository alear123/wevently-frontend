import { useNavigate } from "react-router-dom"


export default function DetalleReserva({ ocultar, reserva }) {


  return (
    <>
      <div className="modal-body">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-body">
              {/* Datos Generales */}
              <div className="detail-section mb-3">
                <h6 className="fw-bold mb-2">Informacion General</h6>
                <div className="detail-content">
                  <div className="detail-item">Nombre del cliente: {reserva?.cliente}</div>
                  <div className="detail-item">Nombre del evento: {reserva?.evento}</div>
                  <div className="detail-item">Fecha: {reserva?.fecha}</div>
                </div>
              </div>

              {/* Descripción */}
              <div className="detail-section mb-3">
                <h6 className="fw-bold mb-2">Descripción</h6>
                <div className="detail-content">
                  <div className="detail-item">Nombre del servicio: {reserva?.servicio}</div>
                  <div className="detail-item">Descripción: {reserva?.descripcion}</div>
                  <div className="detail-item">
                    <label htmlFor="comentarios" style={{ display: "block", marginBottom: "4px" }}>
                      Comentarios:
                    </label>
                    {reserva?.aclaraciones}
                  </div>
                </div>
              </div>

              {/* Costos */}
              <div className="detail-section mb-3">
                <h6 className="fw-bold mb-2">Presupuesto</h6>

                <div className="detail-content">
                  <div className="detail-item">
                    <label htmlFor="comentarios">Seña: $ </label>
                    {reserva?.seña}
                  </div>
                  <div className="detail-item">
                    <label htmlFor="comentarios">Total: $ </label>
                    {reserva?.total}
                  </div>

                </div>
              </div>
            </div>
            <div className="action-buttons">
              <button className="btn-1 btn-next-1" onClick={ocultar}>
                Continuar
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
