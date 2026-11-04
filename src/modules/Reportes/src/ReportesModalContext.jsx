import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import SeleccionarReporteModal from "./components/SeleccionarReporteModal";
import { useNavigate } from "react-router-dom";
import { getLoggedUser } from "../../../common/Utils";
import { reportDefinitions, normalizarRol } from "./reportesConfig";

const ReportesModalContext = createContext();

export function useReportesModal() {
  return useContext(ReportesModalContext);
}

export function ReportesModalProvider({ children }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  // Usuario y rol normalizado reutilizando config compartida
  const rawUser = getLoggedUser() || {};
  const rolNormalizado = normalizarRol(rawUser.rol);

  // Incluir todos los reportes del rol (aunque no estén implementados) para mostrarlos como deshabilitados
  const reportesDisponibles = reportDefinitions.filter((r) => {
    if (!rolNormalizado) return false;
    return r.roles.some(role => role.toLowerCase() === rolNormalizado.toLowerCase());
  });

  // Log de depuración (eliminar en producción si se prefiere)
  if (open) {
  }

  const showReportesModal = useCallback(() => {
    setOpen(true);
  }, []);

  const hideReportesModal = useCallback(() => {
    setOpen(false);
  }, []);

  const handleSeleccionarReporte = ({ reporte, fechaDesde, fechaHasta }) => {
    setOpen(false);
    const def = reportDefinitions.find((d) => d.value === reporte);
    if (def) {
      navigate(`${def.path}?desde=${fechaDesde}&hasta=${fechaHasta}`);
    } else {
      console.warn("[ReportesModal] reporte sin ruta mapeada:", reporte);
    }
  };

  // Bloquear scroll cuando el modal está abierto
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  return (
    <ReportesModalContext.Provider value={{ showReportesModal, hideReportesModal, reportDefinitions, rol: rolNormalizado }}>
      {children}
      {createPortal(
        open ? (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.55)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 3500,
              padding: "32px 16px",
            }}
          >
            <div
              onMouseDown={(e) => e.stopPropagation()}
              style={{
                maxWidth: 520,
                width: "100%",
                animation: "reportesModalIn .25s ease",
              }}
            >
              <SeleccionarReporteModal
                open={open}
                onClose={hideReportesModal}
                reportesDisponibles={reportesDisponibles}
                onSeleccionar={handleSeleccionarReporte}
              />
            </div>
            <style>{`
              @keyframes reportesModalIn {from {opacity:0; transform:translateY(8px) scale(.97)} to {opacity:1; transform:translateY(0) scale(1)}}
            `}</style>
          </div>
        ) : null,
        document.body
      )}
    </ReportesModalContext.Provider>
  );
}
