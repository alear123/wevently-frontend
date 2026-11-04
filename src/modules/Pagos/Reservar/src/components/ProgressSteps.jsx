import React, { useState } from "react";
import Propuesta from "../../../../Servicios/chatear/components/Propuesta"; // 👈 Ajustá la ruta a tu archivo

const ProgressSteps = ({ currentStep, onClickTuSeleccion }) => {
  const steps = [
    { number: 1, label: "Tu selección" },
    { number: 2, label: "Tus datos" },
    { number: 3, label: "Terminar reserva" }
  ];

  return (
    <>
      <style>{`
        .progress-container {
          margin-top:2rem;
          margin-bottom: 0;
        }
        .progress-steps {
          display: flex !important;
          align-items: center !important;
          justify-content: space-between !important;
          margin-bottom: 1rem;
        }
        .progress-step {
          display: flex;
          align-items: center !important;
        }
        .progress-step-circle {
          width: 2rem;
          height: 2rem;
          border-radius: 50%;
          display: flex;
          align-items: center !important;
          justify-content: center !important;
          font-size: 0.9rem;
          font-weight: 600;
          color: white;
          transition: background-color 0.3s ease;
        }
        .completed {
          background-color: #10b981;
        }
        .current {
          background-color: #10b981;
          box-shadow: 0 0 8px rgba(16,185,129,0.6);
        }
        .pending {
          background-color: #d1d5db;
          color: #6b7280;
        }
        .progress-step-text {
          margin-left: 0.5rem;
          font-size: 0.9rem;
          text-decoration: none;
          transition: color 0.3s ease;
        }
        .progress-step-text.completed {
          color: #000;
        }
        .progress-step-text.current {
          color: #111827;
          font-weight: 600;
        }
        .progress-step-text.pending {
          color: #7b7b7bff;
        }
        .progress-line {
          flex: 1 !important;
          height: 2px;
          margin: 0 1rem;
          transition: background-color 0.3s ease;
        }
        .line-completed {
          background-color: #10b981;
        }
        .line-pending {
          background-color: #d1d5db;
        }
      `}</style>

      <div className="progress-container">
        <div className="progress-steps">
          {steps.map((step, index) => {
            const status =
              step.number < currentStep
                ? "completed"
                : step.number === currentStep
                  ? "current"
                  : "pending";

            return (
              <React.Fragment key={step.number}>
                <div className="progress-step">
                  <div
                    className={`progress-step-circle ${status}`}
                    onClick={() => step.number === 1 ? onClickTuSeleccion(true) : onClickTuSeleccion(false)}
                  >
                    {status === "completed" ? "✓" : step.number}
                  </div>
                  <span className={`progress-step-text`}>
                    {step.label}
                  </span>
                </div>

                {index < steps.length - 1 && (
                  <div
                    className={`progress-line ${step.number < currentStep
                        ? "line-completed"
                        : "line-pending"
                      }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

    </>
  );
};

export default ProgressSteps;
