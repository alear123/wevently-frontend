import {use, useEffect, useState} from 'react';
import ABMServiceCard from './src/components/ABMServiceCard';
import Navbar_Prestador from '../../../common/layouts/Navbar_Prestador.jsx';
import Buscador from '../../../common/components/Buscador.jsx';
import Pagination from '../../../common/layouts/Pagination.jsx';
import FiltroDesplegable from '../../../common/components/FiltroDesplegable.jsx';
import './src/assets/abm_servicio.css'
import { TipoFormulario } from './src/components/TipoFormulario.js';
import FormularioServicio from './src/components/FormularioServicio.jsx';
import serviciosServices from "../src/api/serviciosServices.js";
import SuccessAlert from '../../../common/layouts/SuccessAlert.jsx';
import Breadcrumbs from "../../../common/layouts/Breadcrumbs";
import ModalError from '../../../common/layouts/ModalError.jsx';

//hay que cambiar "departamentos" por "localidades" en todo el codigo
const abm_servicio = () => {
  
  const initializableNewService =( ) => {
    return {
      id: 0,
      nombreServicio: '',
      tipoServicio: { id: '', nombreTipoServicio: '' },
      descripcion: '',
      imagen: null,
      areaCobertura: [{ id: '', nombreLocalidad: '' }]
    }
  }

  // el nuevo  se va a pasar como prop al formulario
  const [newService, setNewService] = useState(initializableNewService());
  const [tipoFormulario, setTipoFormulario] = useState(TipoFormulario.NONE);
  const [tittleForm, setTittleForm] = useState('');
  const [showFormulario,setShowFormulario] = useState(false);
  const [filtro, setFiltro] = useState(''); // Texto del buscador
  const [paginaActual, setPaginaActual] = useState(1); // Página actual para paginación
  const [cantidadMostrar, setCantidadMostrar] = useState(6); // Cantidad de servicios por página
  const [mostrarFiltros, setMostrarFiltros] = useState(false); //Muestra los filtros si es true
  const [tipoSeleccionado, setTipoSeleccionado]= useState(''); //Cambia cuando se elige un tipo en el filtro
  const [estrellaSeleccionada, setEstrellaSeleccionada]= useState(''); //Cambia cuando se elige una estrella en el filtro
  const [provinciaSeleccionada, SetProvinciaSeleccionada] = useState(null); // Cambia cuando se selecciona una provincia en el filtro
  const [localidadSeleccionada, setLocalidadSelecionada] = useState(null); // Cambia cuando se selecciona una localidad en el filtro
  const [localidades, setLocalidades] = useState([])
  const [provincias,setProvincias] = useState([]);; // Extraer solo los nombres de las provincias del mock
  const [servicio, setServicio] = useState([]); //Estado para manejar la lista de servicios
  const [tiposServicio, setTiposServicio] = useState([]) // Lista de tipos de servicio para el filtro
  const [refreshData, setRefreshData] = useState(false);
  const [mostrarAlerta, setMostrarAlerta] = useState(false);
  const [mensajeAlerta, setMensajeAlerta] = useState('');

  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleCloseErrorModal = () => {
    setShowErrorModal(false);
    setErrorMessage('');

  };

  const errorFunction = (error) => {
    console.error("Error al cargar servicios:", error);

        const mensajeError =
          error?.response?.data?.message ||
          error.message ||
          "Ocurrió un error inesperado al cargar servicios.";

        setErrorMessage(mensajeError);

        setTimeout(() => setShowErrorModal(true), 200);
  }

  //Función para manejar la lista de servicios
  // Cargar los lugares desde la API
  useEffect(() => {
    
    const fetchServicios = async () => {
      try {
        const dtoMisServicios = await serviciosServices().getMyServices();

        // Normalizar DTO → objeto que el componente puede usar fácil
        const serviciosAdaptados = dtoMisServicios.map(s => ({
          id: s.id,
          nombreServicio: s.nombre,
          tipoServicio: s.tipoServicio?.nombre ?? '', // extrae el nombre
          estrellas: s.rating ?? 0, // lo tratamos como “estrellas”
          descripcion: s.descripcion,
          imagen: s.imagen,
          localidades: s.areaCobertura.map(loc => ({
            id: loc.id,
            nombreLocalidad: loc.nombre
          })),
          fechaBaja: s.fechaHoraBaja // Si tiene fecha de baja, no está activo
        }));

          setServicio(serviciosAdaptados);
      } catch (error) {
        errorFunction(error);
      }
      
    };
    
    fetchServicios();
      
  }, [refreshData]);

  useEffect(() => {// Obtener provincias desde la API
    const fetchProvincias = async () => {
      try {
        const provinciasEntidad = await serviciosServices().obtenerProvincias();
        // Normalizar objeto que el componente puede usar fácil
        const provincias = provinciasEntidad.map(l => ({
          id: l.id,
          nombreProvincia: l.nombre,
          localidades: l.dtosLocalidad.map(loc => ({
            id: loc.id,
            nombreLocalidad: loc.nombre
          }))
        }));
        setProvincias(provincias)
      } catch (error) {
        errorFunction(error);
      }
      
    };

    // Obtener Tipos lugares desde la api
    const fetchDtoTiposServicio = async () => {
      try {
        const dtosTipoServicioEntidad = await serviciosServices().obtenerDtosTipoServicio();
        // Normalizar objeto que el componente puede usar fácil
        const tiposServicio = dtosTipoServicioEntidad.map(dto => ({
          id: dto.id,
          nombreTipoServicio: dto.nombre
        }));
        setTiposServicio(tiposServicio)
      } catch (error) {
        errorFunction(error);
      }
      
    };
    fetchProvincias(); 
    fetchDtoTiposServicio(); 
  }, []);

  // Seleccionar localidades a partir de una provincia seleccionada en el filtro
  const handleLocalidades = (provinciaNombre) => {
    SetProvinciaSeleccionada(provinciaNombre);
    const provincia = provincias.find(p => p.nombreProvincia === provinciaNombre); // Busca en el mock la provincia con el nombreSelecionado
    setLocalidades(provincia ? provincia.localidades.map(d => d.nombreLocalidad) : []);
    setLocalidadSelecionada(null); //resetear localidad al cambiar de provincia
  }

  // Función para manejar las notificaciones
  const mostrarNotificacion = (mensaje) => {
    console.log(mensaje)
    setMensajeAlerta(mensaje);
    setMostrarAlerta(true);
    setTimeout(() => setMostrarAlerta(false), 3000); // Se oculta a los 3s
    console.log("Mostrar alerta habilitado")
  };

  // Renderizar ServiceCard con la función de edición
  const renderABMServiceCard = (servicio) => (
    <ABMServiceCard 
      key={servicio.id} 
      servicio={servicio}
      setServicio={setServicio}
      handleModificarServicio={() => handleClick('Modificar servicio', servicio, TipoFormulario.EDIT)}
      handleBajaServicio={() => handleClickBajaServicio( servicio, TipoFormulario.DELETE)}
    />
  );

  const handleClickBajaServicio = (service, tipoForm) => {
    // Lógica para manejar la baja del servicio
    const id = service.id;
    const isActivo = !service.fechaBaja; // Si no tiene fecha de baja, está activo
    setNewService(service);
    setTipoFormulario(tipoForm);
    setShowFormulario(true);
    console.log(`Dar de baja el servicio con ID: ${id}, actualmente activo: ${isActivo}`);
    
  }
  
  // Abre el formulario en el modo correspondiente (crear, modificar, eliminar)
  const handleClick = (newTittle, service, tipoForm ) => {
    setNewService(service);
    setTittleForm(newTittle);
    setTipoFormulario(tipoForm);
    setShowFormulario(true); 
  }

  // Lógica de filtrado
  const serviciosFiltrados = servicio.filter((servicio) => {
    const texto = filtro.toLowerCase();

    const coincideTexto =
      servicio.nombreServicio.toLowerCase().includes(texto)

    const coincideTipoServicio =
      tipoSeleccionado === '' || tipoSeleccionado === servicio.tipoServicio;

    const coincideEstrellas =
      estrellaSeleccionada === '' ||
      (
        servicio.estrellas >= Number(estrellaSeleccionada) &&
        (Number(estrellaSeleccionada) === 5
          ? servicio.estrellas <= 5
          : servicio.estrellas < Number(estrellaSeleccionada) + 1)
      );

    const coincideLocalidad =
      !localidadSeleccionada || servicio.localidades.some(d => d.nombreLocalidad === localidadSeleccionada);

    return coincideTexto && coincideTipoServicio && coincideEstrellas && coincideLocalidad;

  });

  // Lógica de paginación

  const totalItems = serviciosFiltrados.length; // Total de eventos luego del filtrado
  const totalPaginas = Math.ceil(totalItems / cantidadMostrar); // Total de páginas
  const inicio = (paginaActual - 1) * cantidadMostrar; // Primer índice de la página actual
  const fin = inicio + cantidadMostrar; // Último índice
  const serviciosPaginados = serviciosFiltrados.slice(inicio, fin); // Eventos a mostrar en la página actual

  return (
    <>
        <Navbar_Prestador/>
        <div className="abm-servicio-contenedor"> 
          <div className="breadcrumbs">
            <Breadcrumbs/>
          </div>
          <h2 className="titulo-abm-servicio"><strong>Mis Servicios</strong></h2>
            <div className="abm-servicio-contenedor-buscador">
              <Buscador
                placeholder="Buscar por nombre del servicio"
                onChange={setFiltro}/>
            
              <div className="abm-servicio-contenedor-botones">
                <button
                  className="abm-servicio-btn-filtros"
                  onClick={() => setMostrarFiltros(!mostrarFiltros)}
                >
                  Filtros
                </button>

                <button
                  className="abm-servicio-btn-nuevo"
                  onClick={() => handleClick('Publicá tu servicio', initializableNewService() ,TipoFormulario.CREATE)}
                >
                  Nuevo Servicio
                </button>
                  <SuccessAlert 
                    mensaje={mensajeAlerta} 
                    mostrar={mostrarAlerta} 
                    onClose={() => setMostrarAlerta(false)} 
                  />

              </div>
            </div>

            {/* Filtros visibles solo cuando mostrarFiltros = true */}
            {mostrarFiltros && (
              <div className="abm-filtros-panel">
                  <FiltroDesplegable
                    className="abm-filtro-desplegable"
                    label="Tipo de servicio"
                    opciones={tiposServicio.map(t => t.nombreTipoServicio)}
                    valorSeleccionado={tipoSeleccionado}
                    onCambio={setTipoSeleccionado}
                  />
                  <FiltroDesplegable
                    className="abm-filtroDesplegable"
                    label="Cantidad de Estrellas"
                    opciones={[ 1, 2, 3, 4, 5]}
                    valorSeleccionado={estrellaSeleccionada}
                    onCambio={setEstrellaSeleccionada}
                  />
                  <FiltroDesplegable
                      className="abm-filtroDesplegable"
                      label="Seleccionar Provincia"
                      opciones={provincias.map(p => p.nombreProvincia)}
                      valorSeleccionado={provinciaSeleccionada}
                      onCambio={handleLocalidades}
                  />
                  <FiltroDesplegable
                      className="abm-filtroDesplegable"
                      disabled = {(provinciaSeleccionada == null)}
                      label="Seleccionar Localidad"
                      opciones={localidades}
                      valorSeleccionado={localidadSeleccionada}
                      onCambio={setLocalidadSelecionada}
                  />
              </div>
            )}

            {/* Lista de servicios */}
            <div className="abm-servicios-lista">
              {serviciosPaginados.length > 0 ? (
                serviciosPaginados.map(renderABMServiceCard) // Renderizar los servicios filtrados y paginados
              ) : (
                <p className="mensaje-vacio">No se encontró ningún servicio</p>
              )}
            </div>

           {/* Formulario para crear o modificar un servicio */}
            {showFormulario && (
            <div className="abm-servicio-formulario">
              <FormularioServicio
                show={showFormulario}
                onHide={() => setShowFormulario(false)}
                tittle={tittleForm}
                tipoFormulario={tipoFormulario}
                service={newService}
                refreshData={setRefreshData}
                onNotificar={mostrarNotificacion}
              />
            </div>
          )}

          
            
            {/* Paginación */}
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
            titulo="Error al cargar servicios"
            mensaje={errorMessage}
            mostrar={showErrorModal}
            onCerrar={handleCloseErrorModal}
          />
    </>
  )

}
export default abm_servicio
