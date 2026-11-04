"use client"

export default function ModalTerminosCondiciones({ mostrar, onCerrar }) {
  if (!mostrar) return null

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onCerrar()
  }

  return (
    <>
      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(8px);
        }

        .info-modal {
          background: white;
          border-radius: 16px;
          max-width: 500px;
          width: 90%;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          animation: modalSlideIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          overflow: hidden;
        }

        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: scale(0.8) translateY(-40px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .modal-content {
          padding: 48px 32px 32px;
          display: flex;
          flex-direction: column;
          height: 100%;
          overflow-y: auto; /* 👈 permite scrollear todo el contenido */
          scrollbar-width: thin;
          scrollbar-color: #d1d5db #f3f4f6;
        }

        .modal-content::-webkit-scrollbar {
          width: 8px;
        }

        .modal-content::-webkit-scrollbar-track {
          background: #f3f4f6;
          border-radius: 10px;
        }

        .modal-content::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 10px;
        }

        .modal-content::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }

        .modal-header {
          text-align: center;
          flex-shrink: 0;
          margin-bottom: 24px;
        }

        .info-icon {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
          box-shadow: 0 8px 32px rgba(59, 130, 246, 0.3);
        }

        .info-emoji {
          color: white;
          font-size: 36px;
          font-weight: bold;
        }

        .modal-title {
          font-size: 24px;
          font-weight: 600;
          color: #111827;
          line-height: 1.3;
        }

        .modal-message {
          color: #6b7280;
          font-size: 14px;
          line-height: 1.6;
          text-align: left;
          padding-right: 12px;
        }

        .modal-message p {
          margin-bottom: 16px;
        }

        .modal-message p:last-child {
          margin-bottom: 0;
        }

        .modal-message strong {
          color: #111827;
          font-weight: 600;
        }

        .modal-actions {
          display: flex;
          justify-content: center;
          margin-top: 32px;
          flex-shrink: 0;
        }

        .cerrar-btn {
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
          border: none;
          padding: 14px 32px;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          min-width: 140px;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .cerrar-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4);
        }

        .cerrar-btn:active {
          transform: translateY(0);
        }

        @media (max-width: 480px) {
          .info-modal {
            max-height: 85vh;
            margin: 20px;
          }

          .modal-content {
            padding: 32px 24px 24px;
          }

          .info-icon {
            width: 64px;
            height: 64px;
            margin-bottom: 20px;
          }

          .info-emoji {
            font-size: 28px;
          }

          .modal-title {
            font-size: 20px;
          }

          .modal-message {
            font-size: 13px;
            line-height: 1.5;
          }

          .modal-message p {
            margin-bottom: 12px;
          }

          .cerrar-btn {
            padding: 12px 24px;
            font-size: 14px;
            min-width: 120px;
          }
        }
      `}</style>

      <div className="modal-overlay" onClick={handleOverlayClick}>
        <div className="info-modal">
          <div className="modal-content">
            <div className="modal-header">
              <div className="info-icon">
                <div className="info-emoji">📄</div>
              </div>
              <h2 className="modal-title">Términos y Condiciones</h2>
            </div>

            <div className="modal-message">
              <p>
                <strong>1. ACEPTACIÓN DE LOS TÉRMINOS:</strong> Al acceder y utilizar la plataforma Wevently, el usuario
                acepta quedar obligado por los presentes Términos y Condiciones, así como por nuestra Política de
                Privacidad.
              </p>

              <p>
                <strong>2. NATURALEZA DEL SERVICIO:</strong> Wevently es una plataforma digital que actúa como
                intermediario entre organizadores de eventos y proveedores independientes.
              </p>

              <p>
                <strong>3. REGISTRO Y CUENTAS:</strong> Para utilizar los servicios de la plataforma, el usuario deberá
                crear una cuenta, proporcionando información precisa y actualizada.
              </p>

              <p>
                <strong>4. FUNCIONAMIENTO DE LA PLATAFORMA:</strong> Los organizadores podrán buscar y contratar lugares
                y servicios disponibles en la plataforma.
              </p>

              <p>
                <strong>5. RELACIÓN ENTRE LAS PARTES:</strong> Wevently no es parte de ningún contrato entre el
                organizador y el proveedor.
              </p>

              <p>
                <strong>6. PAGOS Y COMISIONES:</strong> Los pagos se realizan mediante medios electrónicos gestionados
                por Wevently o por terceros autorizados.
              </p>

              <p>
                <strong>7. CANCELACIONES Y POLÍTICAS DE REEMBOLSO:</strong> En caso de que el organizador cancele un
                evento que ya tenga contrataciones de servicios o de lugar previamente pagadas, se aplicarán las
                políticas vigentes.
              </p>

              <p>
                <strong>8. CALIFICACIONES Y RESEÑAS:</strong> Los usuarios podrán dejar comentarios y calificaciones
                sobre su experiencia en la plataforma.
              </p>

              <p>
                <strong>9. USO PERMITIDO:</strong> El usuario se compromete a utilizar la plataforma conforme a la ley,
                la moral, el orden público y los presentes Términos y Condiciones.
              </p>

              <p>
                <strong>10. LIMITACIÓN DE RESPONSABILIDAD:</strong> En ningún caso Wevently será responsable por daños
                derivados de los servicios ofrecidos por terceros.
              </p>

              <p>
                <strong>11. PROPIEDAD INTELECTUAL:</strong> Todo el contenido de la plataforma es propiedad de Wevently
                o cuenta con las licencias correspondientes.
              </p>

              <p>
                <strong>12. MODIFICACIONES:</strong> Wevently se reserva el derecho de modificar estos Términos y
                Condiciones en cualquier momento.
              </p>

              <p>
                <strong>13. LEY APLICABLE Y JURISDICCIÓN:</strong> Estos Términos se rigen por las leyes de la República
                Argentina.
              </p>
            </div>

            <div className="modal-actions">
              <button className="cerrar-btn" onClick={onCerrar}>
                Entendido
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
