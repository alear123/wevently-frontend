// src/context/PermisosContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { obtenerPermisosUsuario } from "../api/services";

const PermisosContext = createContext();

export function PermisosProvider({ children }) {
  const [permisos, setPermisos] = useState(null);

  useEffect(() => {
    async function cargarPermisos() {
      try {
        const rutas = await obtenerPermisosUsuario()  //["/configuraciones", "/chatear"] //await obtenerPermisosUsuario();
        setPermisos(rutas);
      }
      catch (error) {
        setPermisos([""])
      }
    }
    cargarPermisos();
  }, []);

  const tienePermiso = (ruta) => {
    const limpiaRuta = ruta.startsWith('/') ? ruta.slice(1) : ruta;
    if(permisos.includes(ruta)) return true;
    // Recorre todos los permisos hasta encontrar coincidencia
    for (const permiso of permisos) {
      const regex = new RegExp(
        '^' + permiso.replace(/^\/+/, '').replace(/:\w+/g, '[^/]+') + '$',
        'i'
      );

      if (regex.test(limpiaRuta)) {
        return true; 
      }
    }

    return false; 
  };


  return (
    <PermisosContext.Provider value={{ permisos, tienePermiso }}>
      {children}
    </PermisosContext.Provider>
  );
}

export function usePermisos() {
  return useContext(PermisosContext);
}
