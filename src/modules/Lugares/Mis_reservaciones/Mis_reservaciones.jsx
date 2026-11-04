import React, { useEffect, useState } from 'react';
import './src/assets/Mis_reservaciones.css';
import Navbar_Propietario from '../../../common/layouts/Navbar_Propietario.jsx';
import ReservacionCard from './src/components/ReservacionCard.jsx' // Importa el nuevo componente
import Pagination from '../../../common/layouts/Pagination.jsx';
import FiltroDesplegable from '../../../common/components/FiltroDesplegable.jsx';
import Buscador from '../../../common/components/Buscador.jsx';
import FiltroFecha from '../../../common/components/FiltroFecha.jsx';
import { TbTent } from "react-icons/tb"; 
import LugaresServices from '../src/api/LugaresServices.js';
import Breadcrumbs from "../../../common/layouts/Breadcrumbs";

  // Opciones para los filtros desplegables
  const estadosReservacion = ['Pendiente', 'Realizado', 'Cancelado'];


const Mis_reservaciones = () => {
	const [fechaDesde, setFechaDesde] = useState(null); // Estado para la fecha desde
	const [fechaHasta, setFechaHasta] = useState(null); // Estado para la fecha hasta
	const [estadoSeleccionado, setEstadoSeleccionado] = useState(''); // Estado para el estado de la reservación seleccionado
	const [busqueda, setBusqueda] = useState(''); // Estado para la búsqueda
	const [paginaActual, setPaginaActual] = useState(1);
	const [itemsPorPagina, setItemsPorPagina] = useState(10);
	const [misReservas, setMisReservas] = useState([]); // Estado para las reservaciones
	const [nombresLugares, setNombresLugares] = useState([]);
	const [nombreLugarSeleccionado, setNombreLugarSeleccionado] = useState('');
	const [estadosReservacionOptions, setEstadosReservacionOptions] = useState([]);
	const [mostrarFiltros, setMostrarFiltros] = useState(false);
	// Obtener las reservas
	useEffect(() => {
		const fetchReservas = async () => {
			try{
				const dtoMisReservas = await LugaresServices().getMisReservas();
				const misReservasFormateadas = dtoMisReservas.map(r => ({
					id: r.id,
					nombreEvento: r.nombreEvento ?? '',
					nombreLugar: r.nombreLugar ?? '',
					nombreTipoEvento: r.nombreTipoEvento ?? '',
					nombreTipoLugar: r.nombreTipoLugar ?? '',
					estadoReserva: r.estadoReserva ?? '',
					precioReserva: r.precioReserva ?? 0,
					capacidad: r.capacidad ?? 0,
					imagen: r.imagen ,
					fechaReserva: r.fechaReserva ? new Date(r.fechaReserva) : null,
				}));
				let ReservasFiltradas = misReservasFormateadas;
				if (misReservasFormateadas.some(r => r.estadoReserva === "PARCIAL")) {
					// Filtrar "PARCIAL"
					ReservasFiltradas = misReservasFormateadas.filter(r => r.estadoReserva !== "PARCIAL");
				}
				setMisReservas(ReservasFiltradas);

			} catch (error) {
				console.error("Error al obtener las reservaciones:", error);
			}
		}

		fetchReservas();
	}, []);

	// Obtener los nombres de los lugares para el filtro
	

	useEffect(() => {
		const cargarNombresLugares = async () => {
			try {
				const nombres = await LugaresServices().getMisNombresLugar();
				// El back devuelve un array de strings, los formateamos para el dropdown
				const nombresFormateados = nombres.map(nombre => ({
				label: nombre, 
				value: nombre
				}));
				setNombresLugares(nombresFormateados);
			} catch (error) {
				console.error("Error cargando nombres de lugares:", error);
			}
		};

		const cargarNombreEstadosReserva = async () => {
			try {
				const estadosReservas = await LugaresServices().getNombresEstadoReserva();
				const estadosFiltrados = estadosReservas.filter(
					e => e !== "PARCIAL" && e !== "EN_CHAT"
				);
				setEstadosReservacionOptions(estadosFiltrados);
			} catch (error) {
				console.error("Error cargando estados:", error);
			}
		};
		cargarNombreEstadosReserva();
		cargarNombresLugares();
	}, []);

	// Filtro principal
	const filtrarReservaciones = () => {
		return misReservas.filter(reservacion => {
		
		const fechaReservacion = reservacion.fechaReserva; 
		
		// Filtro por nombre del lugar
		const cumpleNombreLugar = !nombreLugarSeleccionado ||
			reservacion.nombreLugar === nombreLugarSeleccionado;
		
		
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
		
		
		return cumpleFechaDesde && cumpleFechaHasta && cumpleNombreLugar && cumpleEstado  && cumpleBusqueda;
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
			<Navbar_Propietario />

			<div className="reservaciones-contenedor">
				<div className="reservaciones-breadcrumbs">
					<Breadcrumbs />
				</div>

				<h1 className="reservaciones-titulo"><strong>Mis reservaciones</strong></h1>

				{/* Contenedor del buscador y botón */}
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

					{/* Filtro por nombre de lugar */}
					<div className="reservaciones-filtro-grupo">

					<FiltroDesplegable
						label = "Nombre del lugar"
						opciones={nombresLugares.map(n => n.value)}
						valorSeleccionado={nombreLugarSeleccionado}
						onCambio={setNombreLugarSeleccionado}
					/>
					</div>

					{/* Filtro por estado */}
					<div className="reservaciones-filtro-grupo">
					<FiltroDesplegable
						label = "Estado"
						opciones={estadosReservacionOptions}
						valorSeleccionado={estadoSeleccionado}
						onCambio={setEstadoSeleccionado}
					/>
					</div>
				</div>
				)}

				{/* Lista de reservaciones */}
				<div className="reservaciones-lista">
					{reservacionesPaginadas.length > 0 ? (
						reservacionesPaginadas.map((reservacion) => (
						<ReservacionCard key={reservacion.id} reserva={reservacion} />
						))
					) : (
						<p className="mensaje-vacio">No se encontró ninguna reserva</p>
					)}
				</div>

				{/* Paginador */}
				<div className="reservaciones-paginador">
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

export default Mis_reservaciones;