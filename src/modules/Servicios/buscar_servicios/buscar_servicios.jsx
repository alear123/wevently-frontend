import BuscadorService from './src/components/BuscadorService.jsx';
import Pagination from '../../../common/layouts/Pagination.jsx';
import Navbar_Organizador from '../../../common/layouts/Navbar_Organizador.jsx';
import Navbar_Administrador from '../../../common/layouts/Navbar_Administrador.jsx';
import Navbar_Prestador from '../../../common/layouts/Navbar_Prestador.jsx';
import Navbar_Propietario from '../../../common/layouts/Navbar_Propietario.jsx';
import Navbar from '../../../common/layouts/Navbar.jsx';
import ServiceCard from "./src/components/ServiceCard.jsx"
import { useState } from 'react';
import './src/assets/buscar_servicios.css';
import FiltroDesplegable from "../../../common/components/FiltroDesplegable.jsx";
import serviciosServices from "../src/api/serviciosServices.js";
import { useEffect } from 'react';
import { getLoggedUser } from '../../../common/Utils.js';


const buscar_servicios = () => {
  const [filtro, setFiltro] = useState(''); // Texto del buscador
  const [paginaActual, setPaginaActual] = useState(1); // Página actual para paginación
  const [cantidadMostrar, setCantidadMostrar] = useState(6); // Cantidad de servicios por página
  const [servicio, setServicio] = useState([]); // Lista de servicios
  const [mostrarFiltros, setMostrarFiltros] = useState(false); //Muestra los filtros si es true
  const [tipoSeleccionado, setTipoSeleccionado] = useState(''); //Cambia cuando se elige un tipo en el filtro
  const [estrellaSeleccionada, setEstrellaSeleccionada] = useState(''); //Cambia cuando se elige una estrella en el filtro
  const [provinciaSeleccionada, SetProvinciaSeleccionada] = useState(null); // Cambia cuando se selecciona una provincia en el filtro
  const [localidadSeleccionada, setLocalidadSelecionada] = useState(null); // Cambia cuando se selecciona una localidad en el filtro
  const [localidades, setLocalidades] = useState([])
  const [provincias, setProvincias] = useState([]) // Lista de provincias para el filtro
  const [tiposServicio, setTiposServicio] = useState([]) // Lista de tipos de servicio para el filtro


  // Cargar los lugares desde la API
  useEffect(() => {
    const fetchServicios = async () => {
      const dtoServicios = await serviciosServices().obtenerDtosServicio();

      // Normalizar DTO → objeto que el componente puede usar fácil
      const serviciosAdaptados = dtoServicios.map(s => ({
        id: s.id,
        nombreServicio: s.nombre,
        tipoServicio: s.tipoServicio?.nombre ?? '', // extrae el nombre
        estrellas: s.rating ?? 0, // lo tratamos como “estrellas”
        descripcion: s.descripcion,
        imagen: s.imagen,
        localidades: s.areaCobertura.map(loc => ({
          id: loc.id,
          nombreLocalidad: loc.nombre
        }))
      }));

        setServicio(serviciosAdaptados);
    };
    // Obtener provincias desde la API
    const fetchProvincias = async () => {
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
    };

    // Obtener Tipos lugares desde la api
    const fetchDtoTiposServicio = async () => {
      const dtosTipoServicioEntidad = await serviciosServices().obtenerDtosTipoServicio();
      console.log(dtosTipoServicioEntidad);
      // Normalizar objeto que el componente puede usar fácil
      const tiposServicio = dtosTipoServicioEntidad.map(dto => ({
        id: dto.id,
        nombreTipoServicio: dto.nombre
      }));
      setTiposServicio(tiposServicio)
    };

    fetchServicios();
    fetchProvincias(); 
    fetchDtoTiposServicio();   
  }, []);

 console.log(servicio,null, 2);
  //Seleccionar localidades a partir de una provincia seleccionada en el filtro
  const handleLocalidades = (provinciaNombre) => {
    SetProvinciaSeleccionada(provinciaNombre);
    const provincia = provincias.find(p => p.nombreProvincia === provinciaNombre); // Busca en el mock la provincia con el nombreSelecionado
    setLocalidades(provincia ? provincia.localidades.map(d => d.nombreLocalidad) : []);
    setLocalidadSelecionada(null); //resetear localidad al cambiar de provincia
  }

  // Renderizar ServiceCard con la función de edición
  const renderServiceCard = (servicio) => (
    <ServiceCard
      key={servicio.id}
      servicio={servicio}
      setServicio={setServicio}
    />
  );

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
      <div className="contenedorTotal">
        {localStorage.getItem("token")
          ? (getLoggedUser().rol == 'Admin' ? <Navbar_Administrador/> : (getLoggedUser().rol == 'Prestador' ? <Navbar_Prestador/> : (getLoggedUser().rol == 'Propietario' ? <Navbar_Propietario/> : <Navbar_Organizador/>))) //aca poner el coso
          : (<Navbar />
          )}
        <div className="buscarServiciosContainer">
          <h1 className="bannerServicios">Encontrá los mejores Servicios para tu evento</h1>
          <div className="contenedorBuscador">
            <BuscadorService
              placeholder="Buscar por nombre del servicio"
              onChange={setFiltro} />
            <div className="contenedorButton">
              <button
                className="btnFiltros"
                onClick={() => setMostrarFiltros(!mostrarFiltros)}
              >
                Filtros
              </button>
            </div>
          </div>
          {/* Filtros visibles solo cuando mostrarFiltros = true */}
          {mostrarFiltros && (
            <div className="filtrosPanel">
              <FiltroDesplegable
                className="filtro-desplegable"
                label="Tipo de servicio"
                opciones={tiposServicio.map(t => t.nombreTipoServicio)}
                valorSeleccionado={tipoSeleccionado}
                onCambio={setTipoSeleccionado}
              />
              <FiltroDesplegable
                className="filtroDesplegable"
                label="Cantidad de Estrellas"
                opciones={[1, 2, 3, 4, 5]}
                valorSeleccionado={estrellaSeleccionada}
                onCambio={setEstrellaSeleccionada}
              />
              <FiltroDesplegable
                className="filtroDesplegable"
                label="Seleccionar Provincia"
                opciones={provincias.map(p => p.nombreProvincia)}
                valorSeleccionado={provinciaSeleccionada}
                onCambio={handleLocalidades}
              />
              <FiltroDesplegable
                className="filtroDesplegable"
                disabled={(provinciaSeleccionada == null)}
                label="Seleccionar Localidad"
                opciones={localidades}
                valorSeleccionado={localidadSeleccionada}
                onCambio={setLocalidadSelecionada}
              />
            </div>
          )}

          {/* Lista de servicios */}
          <div className="serviciosLista">
            {serviciosPaginados.length > 0 ? (
              serviciosPaginados.map(renderServiceCard) // Renderizar los servicios filtrados y paginados
            ) : (
              <p className="mensaje-vacio">No se encontró ningún servicio</p>
            )}
          </div>
        </div>
        <div className="contenedor-paginador">
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
      </div>
    </>
  )
}

export default buscar_servicios
