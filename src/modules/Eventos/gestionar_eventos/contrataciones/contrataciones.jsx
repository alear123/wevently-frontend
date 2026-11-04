import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Navbar_Organizador from '../../../../common/layouts/Navbar_Organizador.jsx';
import './src/assets/contrataciones.css';
import eventoImg from '../../gestionar_eventos/src/assets/evento_default.jpeg'; 
import LugarCard from './src/components/LugarCard.jsx';
import ServiciosContratados from './src/components/ServiciosContratados.jsx';
import Breadcrumbs from '../../../../common/layouts/Breadcrumbs.jsx';
import { useLocation } from 'react-router-dom';
import {obtenerLugar} from '../src/api/misEventosApi.js';
import {obtenerServiciosContratados} from '../src/api/misEventosApi.js';
import Modal_Error from "../../../../common/layouts/ModalError.jsx";

const Contrataciones = () => {
  const location = useLocation();
  const [evento, setEvento] = useState(location.state?.evento || null);
  const [vistaActual, setVistaActual] = useState('lugar');
  const [lugar, setLugar] = useState(null);
  const [cargandoLugar, setCargandoLugar] = useState(false);
  const [errorLugar, setErrorLugar] = useState(null);
  const [servicios, setServicios] = useState([]);
  const [cargandoServicios, setCargandoServicios] = useState(false);
  const [errorServicios, setErrorServicios] = useState(null);
  const [mostrarError, setMostrarError] = useState(false);
  const [mensajeError, setMensajeError] = useState("");

  const mostrarModalError = (mensaje) => {
    setMensajeError(mensaje);
    setMostrarError(true);
  };

  useEffect(() => {
  if (evento?.id) {
    const fetchLugar = async () => {
      try {
        setCargandoLugar(true);
        const dto = await obtenerLugar(evento.id);

        if (!dto) { // el backend devolvió null
          setLugar(null);
          return;
        }

        // 👇 Adaptamos DTO del backend al formato que LugarCard espera
        const lugarAdaptado = {
          id:dto.id,
          nombre: dto.nombre,
          imagenes: dto.imagenes || [],
          direccion: dto.direccion,
          descripcion: dto.descripcion,
          puntuacion: dto.rating, // renombrado
          resenas: new Array(dto.cantReviews).fill({}), // simulamos array vacío con cantidad
          serviciosIncluidos: dto.caracteristicas || [],
          contacto: {
            telefono: dto.telefono,
            email: dto.email,
          },
          capacidad: dto.capacidad,
          precio: dto.precio,
          tipoLugar: dto.tipo, // renombrado
          miResena: null, // esto depende si guardás la reseña del usuario aparte
        };

        setLugar(lugarAdaptado);
      } catch (err) {
        console.error("Error al obtener lugar:", err);
        setErrorLugar("No se pudo cargar el lugar");
        mostrarModalError("No se pudieron cargar los datos del lugar. " + (err.message || ""));
      } finally {
        setCargandoLugar(false);
      }
    };

    fetchLugar();
  }
}, [evento]);


  useEffect(() => {
    if (!evento?.id) return;

    const fetchServicios = async () => {
      try {
        setCargandoServicios(true);
        setErrorServicios(null);

        const dtoServicios = await obtenerServiciosContratados(evento.id);

        // Mapear DTO -> estructura que espera ServiciosContratados
        const serviciosAdaptados = dtoServicios.map(s => ({
          id: s.id,
          nombre: s.nombre,
          descripcion: s.descripcion,
          estado: s.estado,
          tipo: s.tipo,
          precio: typeof s.precio === "number" ? s.precio : parseFloat(s.precio || 0),
          puntuacion: s.puntuacion ?? 0,
          cantidadResenas: s.cantidadResenas ?? 0,
          fechaContratacion: s.fechaContratacion ? s.fechaContratacion : null,
          duracion: s.duracion ?? null,
          proveedor: s.proveedor,
          idChat: s.idChat ?? null,
          miResena: null, 
        }));

        setServicios(serviciosAdaptados);
      } catch (err) {
        console.error("Error al obtener servicios contratados:", err);
        setErrorServicios("No se pudieron cargar los servicios contratados");
        mostrarModalError("No se pudieron cargar los servicios contratados. " + (err.message || ""));
      } finally {
        setCargandoServicios(false);
      }
    };

    fetchServicios();
  }, [evento]);

  if (!evento) return <p>Cargando...</p>;

  return (
    <>
    <Navbar_Organizador />
    <div className='contenedor-2'>
      <div className="contenedor-contrataciones">
        <Breadcrumbs />
        <div className="toggle-vistas-1">
          <button onClick={() => setVistaActual('lugar')} className={vistaActual === 'lugar' ? 'activo' : ''}>
            Lugar
          </button>
          <button onClick={() => setVistaActual('servicios')} className={vistaActual === 'servicios' ? 'activo' : ''}>
            Servicios
          </button>
        </div>

        {vistaActual === "lugar" && (
            <>
              {cargandoLugar && <p>Cargando lugar...</p>}
              {errorLugar && <p style={{ color: "red" }}>{errorLugar}</p>}
              {!cargandoLugar && !errorLugar && (
                <LugarCard lugar={lugar} ResenaActiva={evento.estado === "Realizado"} idEvento={evento?.id}/>
              )}
            </>
          )}

          {vistaActual === "servicios" && (
            <>
              {cargandoServicios && <p>Cargando servicios...</p>}
              {errorServicios && <p style={{ color: "red" }}>{errorServicios}</p>}
              {!cargandoServicios && !errorServicios && (
                <ServiciosContratados servicios={servicios} ResenaActiva={evento.estado === "Realizado"} idEvento={evento?.id}/>
              )}
            </>
          )}
      </div>
      <Modal_Error
        titulo="Ocurrió un error"
        mensaje={mensajeError}
        mostrar={mostrarError}
        onCerrar={() => setMostrarError(false)}
      />
    </div>
    </>
  );
};
export default Contrataciones;
