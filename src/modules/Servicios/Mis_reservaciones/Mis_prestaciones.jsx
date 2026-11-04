import './src/assets/Mis_prestaciones.css';
import Navbar_Prestador from '../../../common/layouts/Navbar_Prestador.jsx';
import PrestacionCard from './src/components/PrestacionCard.jsx' 
import Pagination from '../../../common/layouts/Pagination.jsx';
import FiltroDesplegable from '../../../common/components/FiltroDesplegable.jsx';
import Buscador from '../../../common/components/Buscador.jsx';
import FiltroFecha from '../../../common/components/FiltroFecha.jsx';
import LugaresServices from '../../Lugares/src/api/LugaresServices.js';
import serviciosServices from '../src/api/serviciosServices.js';
import Breadcrumbs from "../../../common/layouts/Breadcrumbs.jsx";
import { useState, useEffect } from 'react';

const Mis_prestaciones = () => {
	const [fechaDesde, setFechaDesde] = useState(null); // Estado para la fecha desde
	const [fechaHasta, setFechaHasta] = useState(null); // Estado para la fecha hasta
	const [estadoSeleccionado, setEstadoSeleccionado] = useState(''); // Estado para el estado de la reservación seleccionado
	const [busqueda, setBusqueda] = useState(''); // Estado para la búsqueda
	const [paginaActual, setPaginaActual] = useState(1);
	const [itemsPorPagina, setItemsPorPagina] = useState(10);
	const [misReservas, setMisReservas] = useState([]); // Estado para las reservaciones
	const [nombreServicios, setNombresServicios] = useState([]);
	const [nombreServicioSeleccionado, setNombreServicioSeleccionado] = useState('');
	const [estadosReservacionOptions, setEstadosReservacionOptions] = useState([]);
	const [mostrarFiltros, setMostrarFiltros] = useState(false);
	
	// Obtener las reservas
	useEffect(() => {
		const fetchReservas = async () => {
			try{
				const dtoMisReservas = await serviciosServices().getMisReservas();
				const misReservasFormateadas = dtoMisReservas.map(r => ({
					id: r.id,
					nombreEvento: r.nombreEvento ?? '',
					nombreServicio: r.nombreServicio ?? '',
					nombreTipoEvento: r.nombreTipoEvento ?? '',
					nombreTipoServicio: r.nombreTipoServicio ?? '',
					estadoReserva: r.estadoReserva ?? '',
					precioReserva: r.precioReserva ?? 0,
					capacidad: r.capacidad ?? 0,
					imagen: r.imagen ,
					idChat: r.idChat ?? null,
					fechaReserva: r.fechaReserva ? new Date(r.fechaReserva) : null,
				}));
				setMisReservas(misReservasFormateadas);

			} catch (error) {
				console.error("Error al obtener las reservaciones:", error);
			}
		}

		fetchReservas();
	}, []);

	

	useEffect(() => {
		const cargarNombresServicios = async () => {
			try {
				const nombres = await serviciosServices().getMisNombresServicio();
				// El back devuelve un array de strings, los formateamos para el dropdown
				const nombresFormateados = nombres.map(nombre => ({
				label: nombre, 
				value: nombre
				}));
				setNombresServicios(nombresFormateados);
			} catch (error) {
				console.error("Error cargando nombres de servicios:", error);
			}
		};

		const cargarNombreEstadosReserva = async () => {
			try {
				const estadosReservas = await LugaresServices().getNombresEstadoReserva();
				let estadosFiltrados = estadosReservas;
				if (estadosReservas.includes("PARCIAL")) {
					// Filtrar "PARCIAL"
					estadosFiltrados = estadosReservas.filter(e => e !== "PARCIAL");
				}
				setEstadosReservacionOptions(estadosFiltrados);
			} catch (error) {
				console.error("Error cargando estados:", error);
			}
		};
		cargarNombreEstadosReserva();
		cargarNombresServicios();
	}, []);

	
	// Filtro principal
	const filtrarReservaciones = () => {
		return misReservas.filter(reservacion => {
		
		const fechaReservacion = reservacion.fechaReserva; 
		
		// Filtro por nombre del lugar
		const cumpleNombreServicio = !nombreServicioSeleccionado ||
			reservacion.nombreServicio === nombreServicioSeleccionado;
		
		
		// Comparaciones por fecha
		const cumpleFechaDesde = !fechaDesde || fechaReservacion >= fechaDesde;
		const cumpleFechaHasta = !fechaHasta || fechaReservacion <= fechaHasta;

		
		// Filtro por estado
		const cumpleEstado = !estadoSeleccionado ||
			reservacion.estadoReserva === estadoSeleccionado;
		
		// Filtro por búsqueda (nombre evento o lugar)
		const cumpleBusqueda = !busqueda ||
			reservacion.nombreEvento?.toLowerCase().includes(busqueda.toLowerCase()) ||
			reservacion.nombreLugar?.toLowerCase().includes(busqueda.toLowerCase());
		
		
		return cumpleFechaDesde && cumpleFechaHasta && cumpleNombreServicio && cumpleEstado  && cumpleBusqueda;
		});
	};

	const reservacionesFiltradas = filtrarReservaciones();
	console.log("Reservaciones filtradas:", reservacionesFiltradas);
		// Obtener las reservaciones paginadas
	const reservacionesPaginadas = reservacionesFiltradas.slice(
		(paginaActual - 1) * itemsPorPagina,
		paginaActual * itemsPorPagina
	);


	return (
		<>
			<Navbar_Prestador />

			<div className="reservaciones-contenedor">
				<div className="prestaciones-breadcrumbs">
				<Breadcrumbs />
				</div>

				<h1 className="reservaciones-titulo"><strong>Mis prestaciones</strong></h1>

				{/* Contenedor del buscador y botón de filtros */}
				<div className="reservaciones-buscador-contenedor">
				<div className="reservaciones-buscador">
					<Buscador placeholder="Buscar por nombre de reserva" onChange={setBusqueda} />
				</div>
				<button
					className="reservaciones-btn-filtros"
					onClick={() => setMostrarFiltros(!mostrarFiltros)}
				>
					Filtros
				</button>
				</div>

				{/* Panel de filtros */}
				{mostrarFiltros && (
				<div className="filtros-panel-1">
					{/* Filtro de fechas */}
					<div className="filtro-fecha">
					<FiltroFecha
						fechaDesde={fechaDesde}
						setFechaDesde={setFechaDesde}
						fechaHasta={fechaHasta}
						setFechaHasta={setFechaHasta}
					/>
					</div>

					{/* Filtro por nombre del servicio */}
					<div className="reservaciones-filtro-grupo">
					<FiltroDesplegable
						label="Nombre del servicio"
						opciones={nombreServicios.map(n => n.value)}
						valorSeleccionado={nombreServicioSeleccionado}
						onCambio={setNombreServicioSeleccionado}
					/>
					</div>

					{/* Filtro por estado */}
					<div className="reservaciones-filtro-grupo">
					<FiltroDesplegable
						label="Estado"
						opciones={estadosReservacionOptions}
						valorSeleccionado={estadoSeleccionado}
						onCambio={setEstadoSeleccionado}
					/>
					</div>
				</div>
				)}

				{/* Lista de prestaciones */}
				<div className="prestaciones-lista">
					{reservacionesPaginadas.length > 0 ? (
						reservacionesPaginadas.map((reservacion) => (
						<PrestacionCard key={reservacion.id} reserva={reservacion} />
						))
					) : (
						<p className="mensaje-vacio">No se encontró ninguna prestación</p>
					)}
				</div>

				{/* Paginador */}
				<div className="prestaciones-paginador">
				<Pagination
					paginaActual={paginaActual}
					totalPaginas={Math.ceil(reservacionesFiltradas.length / itemsPorPagina)}
					setPaginaActual={setPaginaActual}
					inicio={(paginaActual - 1) * itemsPorPagina}
					fin={paginaActual * itemsPorPagina}
					totalItems={reservacionesFiltradas.length}
					cantidadMostrar={itemsPorPagina}
					setCantidadMostrar={setItemsPorPagina}
				/>
				</div>
			</div>
			</>
	);
	};

export default Mis_prestaciones;