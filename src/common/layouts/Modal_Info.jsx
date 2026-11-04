
    
import '../../assets/ModalMensajes.css'


export default function Modal_Info({ titulo, mensaje, mostrar, onEntendido }) {
  if (!mostrar) return null

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onEntendido()
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

        .info-modal {
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

        .info-icon {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 32px;
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
          justify-content: center;
        }

        .entendido-btn {
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

        .entendido-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4);
        }

        .entendido-btn:active {
          transform: translateY(0);
        }

        /* Responsive */
        @media (max-width: 480px) {
          .info-modal {
            margin: 20px;
            width: calc(100% - 40px);
          }

          .modal-content {
            padding: 40px 24px 24px;
          }

          .info-icon {
            width: 64px;
            height: 64px;
            margin-bottom: 24px;
          }

          .info-emoji {
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

          .entendido-btn {
            padding: 12px 24px;
            font-size: 14px;
            min-width: 120px;
          }
        }
      `}</style>

      <div className="modal-overlay" onClick={handleOverlayClick}>
        <div className="info-modal">
          <div className="modal-content">
            <div className="info-icon">
              <div className="info-emoji">ℹ️</div>
            </div>

            <h2 className="modal-title">{titulo}</h2>

            <p className="modal-message">{mensaje}</p>

            <div className="modal-actions">
              <button className="entendido-btn" onClick={onEntendido}>
                Entendido
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
