
import '../../assets/ModalMensajes.css'
import { useState } from 'react';


export default function ModalConfirmarDescargar({ titulo, mensaje, mostrar, onCancelar, onConfirmar }) {
  if (!mostrar) return null

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onCancelar()
    }
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

        .confirm-download-modal {
          background: white;
          border-radius: 16px;
          max-width: 420px;
          width: 90%;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          animation: modalSlideIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
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
          text-align: center;
        }

        .download-icon {
          width: 56px;
          height: 56px;
          background: #eff6ff; /* azul muy claro */
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
          border: 1px solid #dbeafe;
        }
        .download-svg {
          width: 28px;
          height: 28px;
          stroke: #1d4ed8; /* azul principal */
          stroke-width: 2.2;
          stroke-linecap: round;
          stroke-linejoin: round;
          fill: none;
        }

        .modal-title {
          font-size: 24px;
          font-weight: 600;
          color: #111827;
          margin-bottom: 12px;
          line-height: 1.3;
        }

        .modal-message {
          color: #6b7280;
          font-size: 16px;
          line-height: 1.5;
          margin-bottom: 40px;
          max-width: 320px;
          margin-left: auto;
          margin-right: auto;
        }

        .modal-actions {
          display: flex;
          gap: 12px;
          justify-content: center;
        }

        .cancel-btn {
          background: #f3f4f6;
          color: #374151;
          border: none;
          padding: 14px 24px;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          min-width: 100px;
          border: 2px solid #e5e7eb;
        }

        .cancel-btn:hover {
          background: #e5e7eb;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .cancel-btn:active {
          transform: translateY(0);
        }

        .download-btn {
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
          border: none;
          padding: 14px 24px;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          min-width: 100px;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .download-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4);
        }

        .download-btn:active {
          transform: translateY(0);
        }

        /* Responsive */
        @media (max-width: 480px) {
          .confirm-download-modal {
            margin: 20px;
            width: calc(100% - 40px);
          }

          .modal-content {
            padding: 40px 24px 24px;
          }

          .warning-icon {
            width: 64px;
            height: 64px;
            margin-bottom: 24px;
          }

          .warning-emoji {
            font-size: 28px;
          }

          .modal-title {
            font-size: 20px;
            margin-bottom: 8px;
          }

          .modal-message {
            font-size: 14px;
            margin-bottom: 32px;
          }

          .modal-actions {
            flex-direction: column;
            gap: 8px;
          }

          .cancel-btn,
          .download-btn {
            padding: 12px 20px;
            font-size: 14px;
            width: 100%;
          }
        }
      `}</style>

      <div className="modal-overlay" onClick={handleOverlayClick}>
        <div className="confirm-download-modal">
          <div className="modal-content">
            <div className="download-icon" aria-hidden="true">
              <svg className="download-svg" viewBox="0 0 24 24" focusable="false">
                <path d="M12 4v10" />
                <path d="M6 10l6 6 6-6" />
                <path d="M4 20h16" />
              </svg>
            </div>

            <h2 className="modal-title">{titulo}</h2>

            <p className="modal-message">{mensaje}</p>

            <div className="modal-actions">
              <button className="cancel-btn" onClick={onCancelar}>
                Cancelar
              </button>
              <button className="download-btn" onClick={onConfirmar}>
                Descargar
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
