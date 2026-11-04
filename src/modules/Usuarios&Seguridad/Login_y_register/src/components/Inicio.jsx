import React, { useEffect, useState } from "react";
import InicioPrestador from "../../../../Servicios/ConfiguracionesPrestador/ConfiguracionesPrestadorHome";
import InicioPropietario from "../../../../Lugares/ConfiguracionesPropietario/ConfiguracionesPropietarioHome";
import InicioOrganizador from "../../../../Lugares/buscar_lugares/buscar_lugares";
import InicioAdmin from "../../../Configuraciones/Rutas_Configuraciones"
import { getLoggedUser } from "../../../../../common/Utils";

const Inicio = () => {
  const [user, setUser] = useState({ email: "", rol: "" });

  useEffect(() => {
    const data = getLoggedUser();
    if (data) {
      setUser({
        email: data.email,
        rol: data.rol?.charAt(0).toUpperCase() + data.rol?.slice(1).toLowerCase(),
      });
    }
  }, []);

  if (!user.rol) {
    return <div>Cargando...</div>;
  }

  switch (user.rol) {
    case "Organizador":
      return <InicioOrganizador />;
    case "Propietario":
      return <InicioPropietario />;
    case "Prestador":
      return <InicioPrestador />;
    case "Admin":
      return <InicioAdmin/>
    default:
      return <InicioOrganizador />;
  }
};

export default Inicio;
