import { useEffect, useState } from 'react';
import Navbar_Propietario from '../../../common/layouts/Navbar_Propietario.jsx';
import Buscador from '../../../common/components/Buscador.jsx';
import Pagination from '../../../common/layouts/Pagination.jsx';
import FiltroDesplegable from '../../../common/components/FiltroDesplegable.jsx';
import LugarCard from './src/components/ABMLugarCard.jsx';
import './src/assets/abm_lugares.css';
import FormularioLugar from './src/components/FormularioLugar.jsx';
import LugaresServices from '../src/api/LugaresServices.js';
import SuccessAlert from '../../../common/layouts/SuccessAlert.jsx';
import Breadcrumbs from "../../../common/layouts/Breadcrumbs";
import ModalError from "../../../common/layouts/ModalError.jsx"


const TipoFormulario = {
  NONE: 0,
  CREATE: 1,
  EDIT: 2,
  DELETE: 3
};

const abm_lugar = () => {

  const initializableNewLugar = () => ({
    id: 0,
    nombreLugar: "",
    imagen: null,
    estrellas: 0,
    direccion: "",
    descripcion: "",
    localidad: { id: "", nombreLocalidad: "" },
    tipoLugar: { id: "", nombreTipoLugar: "" },
    caracteristicas: [],
    serviciosSoportados: [],
    eventosSoportados: [],
    capacidad: 0,
    precioLugar: 0
  });

  const [newLugar, setNewLugar] = useState(initializableNewLugar());
  const [tipoFormulario, setTipoFormulario] = useState(TipoFormulario.NONE);
  const [tittleForm, setTittleForm] = useState("");
  const [showFormulario, setShowFormulario] = useState(false);
  const [filtro, setFiltro] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);
  const [cantidadMostrar, setCantidadMostrar] = useState(6);
  const [lugares, setLugares] = useState([]);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [tipoSeleccionado, setTipoSeleccionado] = useState('');
  const [estrellaSeleccionada, setEstrellaSeleccionada] = useState('');
  const [provinciaSeleccionada, setProvinciaSeleccionada] = useState(null);
  const [localidadSeleccionada, setLocalidadSelecionada] = useState(null);
  const [localidades, setLocalidades] = useState([]);
  const [capacidad, setCapacidad] = useState(0);
  const [precioMinimo, setPrecioMinimo] = useState(0);
  const [precioMaximo, setPrecioMaximo] = useState(100000);
  const [provincias, setProvincias] = useState([]);
  const [tiposLugar, setTiposLugar] = useState([]);
  const [refreshData, setRefreshData] = useState(false);
  const [mostrarAlerta, setMostrarAlerta] = useState(false);
  const [mensajeAlerta, setMensajeAlerta] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Instancia del servicio
  const lugaresServices = LugaresServices();

  const errorFunction = (error) => {
    console.error("Error cargando lugares:", error);

        const mensajeError =
          error?.response?.data?.message ||
          error.message ||
          "Ocurrió un error inesperado al cargar lugares.";

        setErrorMessage(mensajeError);

        setTimeout(() => setShowErrorModal(true), 200);
  }

  const handleCloseErrorModal = () => {
    setShowErrorModal(false);
    setErrorMessage('');

  };

  // Cargar datos iniciales desde la API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const dtoMisLugares = await lugaresServices.getMisLugares();
        const lugaresAdaptados = dtoMisLugares.map(l => ({
          id: l.id,
          nombreLugar: l.nombre,
          direccion: l.direccion,
          tipoLugar: l.tipoLugar?.nombre ?? '',
          localidad: l.localidad?.nombre ?? '',
          precioLugar: l.precioLugar ?? { precio: 0 },
          estrellas: l.rating ?? 0,
          descripcion: l.descripcion,
          capacidad: l.capacidad,
          imagen: l.imagen,
          serviciosSoportados: l.servicioSoportados?.map(tipoSer => ({
            id: tipoSer.id,
            nombreTipoServicio: tipoSer.nombre
          })) ?? [],
          eventosSoportados: l.eventoSoportados?.map(tipoEv => ({
            id: tipoEv.id,
            nombreTipoEvento: tipoEv.nombre
          })) ?? [],
          caracteristicas: l.caracteristicas?.map(car => ({
            id: car.id,
            nombreCaracteristica: car.nombre
          })) ?? [],
          fechaBaja: l.fechaHoraBaja
        }));
        console.log(lugaresAdaptados);
        setLugares(lugaresAdaptados);
      } catch (error) {
        errorFunction(error);
      }
    };

    const fetchProvincias = async () => {
      try {
        const provinciasEntidad = await lugaresServices.obtenerProvincias();
        const provinciasAdaptadas = provinciasEntidad.map(p => ({
          id: p.id,
          nombreProvincia: p.nombre,
          localidades: p.dtosLocalidad.map(loc => ({
            id: loc.id,
            nombreLocalidad: loc.nombre
          }))
        }));
        setProvincias(provinciasAdaptadas);
      } catch (error) {
        errorFunction(error);
      }
      
    };

    const fetchTiposLugar = async () => {
      try {
        const tipos = await lugaresServices.obtenerDtosTipoLugar();
        setTiposLugar(tipos.map(t => ({
          id: t.id,
          nombreTipoLugar: t.nombre
        })));
      } catch (error) {
        errorFunction(error);
      }
      
    };

    fetchData();
    fetchProvincias();
    fetchTiposLugar();
  }, [refreshData]);

  // Manejar localidades según la provincia seleccionada
  const handleLocalidades = (provinciaNombre) => {
    setProvinciaSeleccionada(provinciaNombre);
    const provincia = provincias.find(p => p.nombreProvincia === provinciaNombre);
    setLocalidades(provincia ? provincia.localidades.map(d => d.nombreLocalidad) : []);
    setLocalidadSelecionada(null);
  };

  // Notificación
  const mostrarNotificacion = (mensaje) => {
    setMensajeAlerta(mensaje);
    setMostrarAlerta(true);
    setTimeout(() => setMostrarAlerta(false), 3000);
  };

  // Clicks de acción
  const handleClick = (titulo, lugar, tipoForm) => {
    setNewLugar(lugar);
    setTittleForm(titulo);
    setTipoFormulario(tipoForm);
    setShowFormulario(true);
  };

  const handleClickBajaLugar =  (lugar, tipoForm) => {
    // Lógica para manejar la baja del servicio
    const id = lugar.id;
    const isActivo = !lugar.fechaBaja; // Si no tiene fecha de baja, está activo
    setNewLugar(lugar);
    setTipoFormulario(tipoForm);
    setShowFormulario(true);
    console.log(`Dar de baja el lugar con ID: ${id}, actualmente : ${isActivo ? 'activo' : 'inactivo'}`); 
   
  };

  // Renderizar cards
  const renderLugarCard = (lugar) => (
    <LugarCard
      key={lugar.id}
      lugar={lugar}
      handleModificarLugar={() => handleClick('Modificar lugar', lugar, TipoFormulario.EDIT)}
      handleBajaLugar={() => handleClickBajaLugar(lugar, TipoFormulario.DELETE)}
    />
  );

  // Filtrado
  const lugaresFiltrados = lugares.filter((lugar) => {
    const texto = filtro.toLowerCase();
    const coincideTexto = lugar.nombreLugar.toLowerCase().includes(texto);
    const coincideTipoLugar = tipoSeleccionado === '' || tipoSeleccionado === lugar.tipoLugar;
    const coincideEstrellas =
      estrellaSeleccionada === '' ||
      (lugar.estrellas >= Number(estrellaSeleccionada) &&
        (Number(estrellaSeleccionada) === 5 ? lugar.estrellas <= 5 : lugar.estrellas < Number(estrellaSeleccionada) + 1));
    const coincideLocalidad = !localidadSeleccionada || localidadSeleccionada === lugar.localidad;
    const coincideRangoPrecio = lugar.precioLugar >= precioMinimo && lugar.precioLugar <= precioMaximo;
    const coincideCapacidad = lugar.capacidad >= capacidad;

    return coincideTexto && coincideTipoLugar && coincideEstrellas && coincideLocalidad && coincideRangoPrecio &&  coincideCapacidad;
  });

  // Paginación
  const totalItems = lugaresFiltrados.length;
  const totalPaginas = Math.ceil(totalItems / cantidadMostrar);
  const inicio = (paginaActual - 1) * cantidadMostrar;
  const fin = inicio + cantidadMostrar;
  const lugaresPaginados = lugaresFiltrados.slice(inicio, fin);

  return (
    <>
      <Navbar_Propietario />
      <div className="abm-lugar-contenedor">
        <div className="breadcrumbs">
          <Breadcrumbs/>
        </div>
        <h2 className="titulo-abm-lugar"><strong>Mis Lugares</strong></h2>

        <div className="abm-lugar-contenedor-buscador">
          <Buscador placeholder="Buscar por nombre del lugar" onChange={setFiltro} />
          <div className="abm-lugar-contenedor-botones">
            <button className="abm-lugar-btn-filtros" onClick={() => setMostrarFiltros(!mostrarFiltros)}>Filtros</button>
            <button className="abm-lugar-btn-nuevo" onClick={() => handleClick('Publicá tu lugar', initializableNewLugar(), TipoFormulario.CREATE)}>Nuevo Lugar</button>
            <SuccessAlert mensaje={mensajeAlerta} mostrar={mostrarAlerta} onClose={() => setMostrarAlerta(false)} />
          </div>
        </div>

        {mostrarFiltros && (
          <div className="abm-lugar-filtros-panel">
            <FiltroDesplegable label="Tipo de lugar" opciones={tiposLugar.map(t => t.nombreTipoLugar)} valorSeleccionado={tipoSeleccionado} onCambio={setTipoSeleccionado} />
            <FiltroDesplegable label="Cantidad de Estrellas" opciones={[1, 2, 3, 4, 5]} valorSeleccionado={estrellaSeleccionada} onCambio={setEstrellaSeleccionada} />
            <FiltroDesplegable label="Provincia" opciones={provincias.map(p => p.nombreProvincia)} valorSeleccionado={provinciaSeleccionada} onCambio={handleLocalidades} />
            <FiltroDesplegable disabled={!provinciaSeleccionada} label="Localidad" opciones={localidades} valorSeleccionado={localidadSeleccionada} onCambio={setLocalidadSelecionada} />
          </div>
        )}

        <div className="abm-lugares-lista">
          {lugaresPaginados.length > 0 ? lugaresPaginados.map(renderLugarCard) : <p className="mensaje-vacio-lugar">No se encontró ningún lugar</p>}
        </div>

        {showFormulario && (
          <FormularioLugar
            show={showFormulario}
            onHide={() => setShowFormulario(false)}
            tittle={tittleForm}
            tipoFormulario={tipoFormulario}
            lugar={newLugar}
            refreshData={setRefreshData}
            onNotificar={mostrarNotificacion}
          />
        )}

        <Pagination
          className="paginador"
          paginaActual={paginaActual}
          totalPaginas={totalPaginas}
          setPaginaActual={setPaginaActual}
          inicio={inicio}
          fin={fin}
          totalItems={totalItems}
          cantidadMostrar={cantidadMostrar}
          setCantidadMostrar={setCantidadMostrar}
        />
      </div>

      <ModalError
                titulo="Error al cargar lugares"
                mensaje={errorMessage}
                mostrar={showErrorModal}
                onCerrar={handleCloseErrorModal}
              />
    </>
  );
};

export default abm_lugar;
