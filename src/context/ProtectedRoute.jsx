// src/guards/ProtectedRoute.jsx
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import AccesoDenegado from "../common/layouts/AccesoDenegado";
import { usePermisos } from "./PermisosContext";
import { obtenerPermisosUsuario } from "../api/services";

export default function ProtectedRoute({ children }) {
  const { tienePermiso, permisos } = usePermisos();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/Login_y_register", { replace: true });
    }
  }, [navigate]);

  if (Array.isArray(permisos) && permisos.length > 0 && !tienePermiso(location.pathname)) {
    return <AccesoDenegado />;
  }

  return children;
}
