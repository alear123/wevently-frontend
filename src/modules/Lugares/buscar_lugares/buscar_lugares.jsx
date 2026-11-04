import BuscadorService from '../../Servicios/buscar_servicios/src/components/BuscadorService.jsx';
import Pagination from '../../../common/layouts/Pagination.jsx';
import Navbar_Organizador from '../../../common/layouts/Navbar_Organizador.jsx';
import Navbar_Administrador from '../../../common/layouts/Navbar_Administrador.jsx';
import Navbar_Prestador from '../../../common/layouts/Navbar_Prestador.jsx';
import Navbar_Propietario from '../../../common/layouts/Navbar_Propietario.jsx';
import Navbar from '../../../common/layouts/Navbar.jsx';
import LugarCard from "./src/components/LugarCard.jsx"
import { useState } from 'react';
import './src/assets/buscar_lugares.css';
import FiltroDesplegable from "../../../common/components/FiltroDesplegable.jsx";
import tiposLugarMock from "../buscar_lugares/src/api/TiposLugar.js"
import { useEffect } from 'react';
import lugaresServices from "../src/api/LugaresServices.js"
import { getLoggedUser } from '../../../common/Utils.js';

const buscar_lugares = () => {
  const [filtro, setFiltro] = useState(''); // Texto del buscador
  const [paginaActual, setPaginaActual] = useState(1); // Página actual para paginación
  const [cantidadMostrar, setCantidadMostrar] = useState(6); // Cantidad de servicios por página
  const [lugares, setLugares] = useState([]); // Lista de lugares
  const [mostrarFiltros, setMostrarFiltros] = useState(false); //Muestra los filtros si es true
  const [tipoSeleccionado, setTipoSeleccionado]= useState(''); //Cambia cuando se elige un tipo en el filtro
  const [estrellaSeleccionada, setEstrellaSeleccionada]= useState(''); //Cambia cuando se elige una estrella en el filtro
  const [provinciaSeleccionada, SetProvinciaSeleccionada] = useState(null); // Cambia cuando se selecciona una provincia en el filtro
  const [localidadSeleccionada, setLocalidadSelecionada] = useState(null); // Cambia cuando se selecciona una localidad en el filtro
  const [localidades, setLocalidades] = useState([])
  const [provincias,setProvincias] = useState([]);
  const [capacidad, setCapacidad]= useState(0); // Se utiliza para guardar la capacidad ingresada por el ususario
  const [precioMinimo, setPrecioMinimo] = useState(0); // Se utiliza para guardar el precio mínimo ingresado por el usuario
  const [precioMaximo, setPrecioMaximo] = useState(100000); // Se utiliza para guardar el precio máximo ingresado por el usuario
  const [tiposLugar, setTiposLugar] = useState([]);

  // Cargar los lugares desde la API
  useEffect(() => {
    const fetchLugares = async () => {
      const dtoLugares = await lugaresServices().obtenerDtoLugares();

      // Normalizar DTO → objeto que el componente puede usar fácil
      const lugaresAdaptados = dtoLugares.map(l => ({
        id: l.id,
        nombreLugar: l.nombre,
        direccion: l.direccion,
        tipoLugar: l.tipoLugar?.nombre ?? '', // extrae el nombre
        localidad: l.localidad?.nombre ?? '', // extrae el nombre
        precioLugar: l.precioLugar ?? 0,
        estrellas: l.rating ?? 0, // lo tratamos como “estrellas”
        descripcion: l.descripcion,
        capacidad: l.capacidad, 
        imagen: l.imagen
      }));

        setLugares(lugaresAdaptados);
    };
    // Obtener provincias desde la API
    const fetchProvincias = async () => {
      const provinciasEntidad = await lugaresServices().obtenerProvincias();
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
    const fetchDtoTiposLugar = async () => {
      const dtosTipoLugarEntidad = await lugaresServices().obtenerDtosTipoLugar();
      console.log(dtosTipoLugarEntidad);
      // Normalizar objeto que el componente puede usar fácil
      const tiposLugar = dtosTipoLugarEntidad.map(dto => ({
        id: dto.id,
        nombreTipoLugar: dto.nombre
      }));
      setTiposLugar(tiposLugar)
    };

    fetchLugares();
    fetchProvincias(); 
    fetchDtoTiposLugar();   
  }, []);
  
 //console.log(JSON.stringify(tiposLugar, null, 2));
  //console.log(JSON.stringify(provincias, null, 2));
  // Debug para ver los dtos en consola
  //console.log(JSON.stringify(lugares, null, 2));

  
 



  //Seleccionar localidades a partir de una provincia seleccionada en el filtro
  const handleLocalidades = (provinciaNombre) => {
    SetProvinciaSeleccionada(provinciaNombre);
    const provincia = provincias.find(p => p.nombreProvincia === provinciaNombre); // Busca en el mock la provincia con el nombreSelecionado
    setLocalidades(provincia ? provincia.localidades.map(d => d.nombreLocalidad) : []);
    setLocalidadSelecionada(null); //resetear localidad al cambiar de provincia
  }

  // Renderizar LugarCard con la función de edición
  const renderLugarCard = (lugar) => (
    <LugarCard 
      key={lugar.id} 
      lugar={lugar}
      setLugares={setLugares}
    />
  );

  // Lógica de filtrado
  const lugaresFiltrados = lugares.filter((lugar) => {
    const texto = filtro.toLowerCase();

    const coincideTexto =
      lugar.nombreLugar.toLowerCase().includes(texto) 
    
    const coincideTipoLugar =
      tipoSeleccionado === '' || tipoSeleccionado === lugar.tipoLugar;
    
    const coincideEstrellas =
      estrellaSeleccionada === '' ||
      (
        lugar.estrellas >= Number(estrellaSeleccionada) &&
        (Number(estrellaSeleccionada) === 5
          ? lugar.estrellas <= 5
          : lugar.estrellas < Number(estrellaSeleccionada) + 1)
      );
    const coincideLocalidad =
      !localidadSeleccionada || localidadSeleccionada === lugar.localidad;

    const coincideRangoPrecio =
      lugar.precioLugar >= precioMinimo &&  lugar.precioLugar <= precioMaximo;

    const coincideCapacidad =
      lugar.capacidad >= capacidad;

    return coincideTexto && coincideTipoLugar && coincideEstrellas && coincideLocalidad && coincideRangoPrecio && coincideCapacidad;

  });

  // Lógica de paginación

  const totalItems = lugaresFiltrados.length; // Total de eventos luego del filtrado
  const totalPaginas = Math.ceil(totalItems / cantidadMostrar); // Total de páginas
  const inicio = (paginaActual - 1) * cantidadMostrar; // Primer índice de la página actual
  const fin = inicio + cantidadMostrar; // Último índice
  const lugaresPaginados = lugaresFiltrados.slice(inicio, fin); // Eventos a mostrar en la página actual

  return (
    <>
      <div className="buscar-lugar-contenedor-total">
        {localStorage.getItem("token") 
        ? (getLoggedUser().rol == 'Admin' ? <Navbar_Administrador/> : (getLoggedUser().rol == 'Prestador' ? <Navbar_Prestador/> : (getLoggedUser().rol == 'Propietario' ? <Navbar_Propietario/> : <Navbar_Organizador/>))) //aca poner el coso
        : (<Navbar/>
        )}

        <div className="buscar-lugar-contenedor">
          <h1 className="buscar-lugar-banner">Encontrá los mejores Lugares para tu evento</h1>
          <div className="buscar-lugar-contenedor-buscador">
            <BuscadorService 
              placeholder="Buscar por nombre del lugar"
              onChange={setFiltro}
            />
            <div className="buscar-lugar-contenedor-button">
              <button
                className="buscar-lugar-boton-filtros"
                onClick={() => setMostrarFiltros(!mostrarFiltros)}
              >
                Filtros
              </button>
            </div>
          </div>
          {/* Filtros visibles solo cuando mostrarFiltros = true */}
          {mostrarFiltros && (
            <div className="buscar-lugar-filtros-panel">
                <FiltroDesplegable
                  className="buscar-lugar-filtro-desplegable"
                  label="Tipo de lugar"
                  opciones={tiposLugar.map( tipoLugar => tipoLugar.nombreTipoLugar)}
                  valorSeleccionado={tipoSeleccionado}
                  onCambio={setTipoSeleccionado}
                />
                
                <FiltroDesplegable
                  className="buscar-lugar-filtro-desplegable"
                  label="Cantidad de Estrellas"
                  opciones={[ 1, 2, 3, 4, 5]}
                  valorSeleccionado={estrellaSeleccionada}
                  onCambio={setEstrellaSeleccionada}
                />

                <div className='buscar-lugar-input'>
                  <p 
                    style={{
                        marginBottom: '6px',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#333'}
                    }>Capacidad</p>
                  <input 
                      className='buscar-lugar-filtro-capacidad'
                      type='number'
                      min='1'
                      max='9999'
                      placeholder='Ingresá la capacidad'
                      value={capacidad}
                      onChange={(e) => {
                        let value = Number(e.target.value);
                        if (value < 1) value = 1;
                        if (value > 9999) value = 9999;
                        setCapacidad(value);
                      }}
                  />
                </div>
                
                <div className='buscar-lugar-input'>
                    <p 
                        style={{
                            marginBottom: '6px',
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#333'}
                        }>Rango de Precio</p>
                    <input 
                        className='buscar-lugar-filtro-rango-minimo'
                        type='number'
                        min='0'
                        max={precioMaximo-1}
                        placeholder='Mínimo'
                        value={precioMinimo}
                        onChange={(e) => {
                          let value = Number(e.target.value);
                          if (value < 0) value = 0;
                          if (value >= precioMaximo) value = precioMaximo - 1; 
                          setPrecioMinimo(value);
                        }}
                    />
                    
                    <input 
                        className='buscar-lugar-filtro-rango-maximo'
                        type='number'
                        min={precioMinimo+1}
                        max='1000000'
                        placeholder='Máximo'
                        value={precioMaximo}
                        onChange={(e) => {
                          let value = Number(e.target.value);
                          if (value <= precioMinimo) value = precioMinimo + 1;
                          if (value > 1000000) value = 1000000;
                          setPrecioMaximo(value);
                        }}
                    />
                </div>

                <FiltroDesplegable
                    className="buscar-lugar-filtro-desplegable"
                    label="Seleccionar Provincia"
                    opciones={provincias.map(p =>p.nombreProvincia)}
                    valorSeleccionado={provinciaSeleccionada}
                    onCambio={handleLocalidades}
                />
                <FiltroDesplegable
                    className="buscar-lugar-filtro-desplegable"
                    disabled = {(provinciaSeleccionada == null)}
                    label="Seleccionar Localidad"
                    opciones={localidades}
                    valorSeleccionado={localidadSeleccionada}
                    onCambio={setLocalidadSelecionada}
                />
            </div>
          )}

          {/* Lista de lugares */}
          <div className="lugares-lista">
            {lugaresPaginados.length > 0 ? (
              lugaresPaginados.map(renderLugarCard) // Renderizar los lugares filtrados y paginados
            ) : (
              <p className="mensaje-vacio">No se encontró ningún lugar</p>
            )}
          </div>
        </div>
        <div className='contenedor-paginador'>
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
  );
};
export default buscar_lugares
