import { useEffect, useState, useMemo, useCallback } from "react";
import Navbar_Prestador from "../../../common/layouts/Navbar_Prestador";
import Breadcrumbs from '../../../common/layouts/Breadcrumbs';
import ModalAccionExito from '../../../common/layouts/ModalAccionExito';
import Modal_Error from '../../../common/layouts/ModalError';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faConciergeBell } from '@fortawesome/free-solid-svg-icons';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

import ReportesBar from '../src/components/ReportesBar';
import { useReportesModal } from '../src/ReportesModalContext';
import { useLocation, useNavigate } from 'react-router-dom';
import FiltrosReporte from './src/components/FiltrosReporte';
import FiltroTipo from './src/components/FiltroTipo';
import GraficoLineal from '../src/components/GraficoLineal';
import TablaReporte from './src/components/TablaReporte';
import TarjetaResumen from '../Visualizar_cantidad_de_usuarios_activos/src/components/TarjetaResumen';
import { getVistasXServicio } from '../src/api/reportesApi';
import { getLoggedUser } from "../../../common/Utils";
import generarPdfVistasPorServicio from '../src/pdf/vistasPorServicioPDF';
import './src/assets/Reporte.css';
import '../Visualizar_cantidad_de_usuarios_activos/src/assets/Reporte1.css';

export default function VisualizarVistasPorServicio() {
    const [datosReporte, setDatosReporte] = useState([]);
    const [paginaActual, setPaginaActual] = useState(1);
    const [tipoFiltro, setTipoFiltro] = useState('Todos');
    const [tipoAgrupacion, setTipoAgrupacion] = useState('dia');

    const [mostrarPopupInicial, setMostrarPopupInicial] = useState(false);
    const [fechasInicializadas, setFechasInicializadas] = useState(false);
    const [fechaDesde, setFechaDesde] = useState(null);
    const [fechaHasta, setFechaHasta] = useState(null);

    const [showExito, setShowExito] = useState(false);
    const [exitoTitulo, setExitoTitulo] = useState('');
    const [exitoMensaje, setExitoMensaje] = useState('');
    const [showError, setShowError] = useState(false);
    const [errorTitulo, setErrorTitulo] = useState('');
    const [errorMensaje, setErrorMensaje] = useState('');
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState(null);

    const [provinciaSeleccionada, setProvinciaSeleccionada] = useState('Todos');
    const [localidadSeleccionada, setLocalidadSeleccionada] = useState('Todos');
    const [servicioSeleccionado, setServicioSeleccionado] = useState('Todos');
    const [mostrarTabla, setMostrarTabla] = useState(false);

    const provinciasDisponibles = useMemo(() => {
        if (!Array.isArray(datosReporte)) return ['Todos'];
        const set = new Set(datosReporte.map(d => d.provincia).filter(Boolean));
        return ['Todos', ...Array.from(set).sort()];
    }, [datosReporte]);

    const localidadesDisponibles = useMemo(() => {
        if (!Array.isArray(datosReporte)) return ['Todos'];
        let filtered = datosReporte;
        if (provinciaSeleccionada && provinciaSeleccionada !== 'Todos') {
            filtered = filtered.filter(d => d.provincia === provinciaSeleccionada);
        }
        const localidadesSet = new Set();
        filtered.forEach(servicio => {
            if (Array.isArray(servicio.localidad)) {
                servicio.localidad.forEach(loc => {
                    if (loc.nombreLocalidad) {
                        localidadesSet.add(loc.nombreLocalidad);
                    }
                });
            }
        });
        return ['Todos', ...Array.from(localidadesSet).sort()];
    }, [datosReporte, provinciaSeleccionada]);

    const serviciosDisponibles = useMemo(() => {
        if (!Array.isArray(datosReporte)) return ['Todos'];
        let arr = datosReporte;
        if (provinciaSeleccionada && provinciaSeleccionada !== 'Todos') {
            arr = arr.filter(d => d.provincia === provinciaSeleccionada);
        }
        if (localidadSeleccionada && localidadSeleccionada !== 'Todos') {
            arr = arr.filter(d =>
                Array.isArray(d.localidad) &&
                d.localidad.some(loc => loc.nombreLocalidad === localidadSeleccionada)
            );
        }
        const set = new Set(arr.map(d => d.nombreServicio).filter(Boolean));
        return ['Todos', ...Array.from(set).sort()];
    }, [datosReporte, provinciaSeleccionada, localidadSeleccionada]);

    useEffect(() => {
        if (!Array.isArray(datosReporte) || datosReporte.length === 0) return;
        const firstItem = datosReporte[0];
        const firstServicio = firstItem.nombreServicio;
        const names = datosReporte.map(d => d.nombreServicio);
        if (!servicioSeleccionado || servicioSeleccionado === 'Todos' || !names.includes(servicioSeleccionado)) {
            setServicioSeleccionado(firstServicio);
            setTipoFiltro(firstServicio);
        }
    }, [datosReporte]);

    const agruparDatos = useCallback((datosServicios, tipo, esFiltroIndividual = false) => {
        if (!Array.isArray(datosServicios) || datosServicios.length === 0) return [];
        if (esFiltroIndividual && tipo === 'dia' && datosServicios.length === 1) {
            const servicio = datosServicios[0];
            return (servicio.datos || []).map(d => ({
                fecha: d.fecha,
                cantidad: Number(d.cantidad || 0),
                servicios: servicio.nombreServicio,
                tipoAgrupacion: tipo
            }));
        }
        const acumulador = {};
        datosServicios.forEach(servicio => {
            if (!Array.isArray(servicio.datos)) return;
            servicio.datos.forEach(d => {
                const fechaStr = d.fecha;
                const cantidad = Number(d.cantidad || 0);
                let key = fechaStr;
                if (tipo === 'semana') {
                    const dt = new Date(fechaStr + 'T00:00:00');
                    const day = dt.getDay();
                    const diff = (day + 6) % 7;
                    const monday = new Date(dt);
                    monday.setDate(dt.getDate() - diff);
                    key = monday.toISOString().slice(0, 10);
                } else if (tipo === 'mes') {
                    key = fechaStr.slice(0, 7);
                }
                if (!acumulador[key]) {
                    acumulador[key] = {
                        fecha: key,
                        cantidad: 0,
                        servicios: new Set()
                    };
                }
                acumulador[key].cantidad += cantidad;
                acumulador[key].servicios.add(servicio.nombreServicio);
            });
        });
        const result = Object.values(acumulador).map(r => ({
            fecha: r.fecha,
            cantidad: r.cantidad,
            servicios: Array.from(r.servicios).sort().join(', '),
            tipoAgrupacion: tipo
        }));
        result.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
        return result;
    }, []);

    const datosFiltradosParaMostrar = useMemo(() => {
        if (!Array.isArray(datosReporte) || datosReporte.length === 0) return [];
        let arr = [...datosReporte];
        if (provinciaSeleccionada && provinciaSeleccionada !== 'Todos') {
            arr = arr.filter(d => d.provincia === provinciaSeleccionada);
        }
        if (localidadSeleccionada && localidadSeleccionada !== 'Todos') {
            arr = arr.filter(d =>
                Array.isArray(d.localidad) &&
                d.localidad.some(loc => loc.nombreLocalidad === localidadSeleccionada)
            );
        }
        if (servicioSeleccionado && servicioSeleccionado !== 'Todos') {
            arr = arr.filter(d => d.nombreServicio === servicioSeleccionado);
        }
        if (arr.length === 0) return [];
        const esFiltroIndividual = servicioSeleccionado && servicioSeleccionado !== 'Todos';
        return agruparDatos(arr, tipoAgrupacion, esFiltroIndividual);
    }, [datosReporte, provinciaSeleccionada, localidadSeleccionada, servicioSeleccionado, tipoAgrupacion, agruparDatos]);

    const handleProvinciaChange = (valor) => {
        setProvinciaSeleccionada(valor);
        setLocalidadSeleccionada('Todos');
        setServicioSeleccionado('Todos');
        setPaginaActual(1);
    };

    const handleLocalidadChange = (valor) => {
        setLocalidadSeleccionada(valor);
        setServicioSeleccionado('Todos');
        setPaginaActual(1);
    };

    const handleServicioChange = (valor) => {
        setServicioSeleccionado(valor);
        setTipoFiltro(valor);
        setPaginaActual(1);
    };

    // Obtener los datos del servicio seleccionado
    const servicioSeleccionadoData = useMemo(() => {
        if (!Array.isArray(datosReporte) || datosReporte.length === 0) return null;
        if (servicioSeleccionado === 'Todos') return null;

        // Filtrar por provincia y localidad primero
        let arr = [...datosReporte];
        if (provinciaSeleccionada && provinciaSeleccionada !== 'Todos') {
            arr = arr.filter(d => d.provincia === provinciaSeleccionada);
        }
        if (localidadSeleccionada && localidadSeleccionada !== 'Todos') {
            arr = arr.filter(d =>
                Array.isArray(d.localidad) &&
                d.localidad.some(loc => loc.nombreLocalidad === localidadSeleccionada)
            );
        }

        return arr.find(d => d.nombreServicio === servicioSeleccionado) || null;
    }, [datosReporte, servicioSeleccionado, provinciaSeleccionada, localidadSeleccionada]);

    // Datos de comisiones diarias del servicio seleccionado con agrupación
    const datosComisionesDiarias = useMemo(() => {
        if (!servicioSeleccionadoData?.cantidadContrataciones?.comisionesDiarias) return [];

        const comisionesCrudas = servicioSeleccionadoData.cantidadContrataciones.comisionesDiarias;

        // Si es por día, devolver directamente
        if (tipoAgrupacion === 'dia') {
            return comisionesCrudas.map(item => ({
                fecha: item.fecha,
                cantidad: Number(item.cantidad || 0),
                label: item.fecha
            }));
        }

        // Agrupar por semana o mes
        const acumulador = {};
        comisionesCrudas.forEach(item => {
            const fechaStr = item.fecha;
            const cantidad = Number(item.cantidad || 0);
            let key = fechaStr;

            if (tipoAgrupacion === 'semana') {
                const dt = new Date(fechaStr + 'T00:00:00');
                const day = dt.getDay();
                const diff = (day + 6) % 7;
                const monday = new Date(dt);
                monday.setDate(dt.getDate() - diff);
                key = monday.toISOString().slice(0, 10);
            } else if (tipoAgrupacion === 'mes') {
                key = fechaStr.slice(0, 7) + '-01'; // Primer día del mes
            }

            if (!acumulador[key]) {
                acumulador[key] = {
                    fecha: key,
                    cantidad: 0
                };
            }
            acumulador[key].cantidad += cantidad;
        });

        const result = Object.values(acumulador).map(r => ({
            fecha: r.fecha,
            cantidad: r.cantidad,
            label: r.fecha
        }));

        result.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
        return result;
    }, [servicioSeleccionadoData, tipoAgrupacion]);

    // Resumen de contrataciones y dinero ganado
    const resumenContrataciones = useMemo(() => {
        if (!servicioSeleccionadoData?.cantidadContrataciones) {
            return { cantidadContrataciones: 0, dineroGanado: 0 };
        }
        return {
            cantidadContrataciones: servicioSeleccionadoData.cantidadContrataciones.cantidadContrataciones || 0,
            dineroGanado: Number(servicioSeleccionadoData.cantidadContrataciones.dineroGanado || 0).toFixed(2)
        };
    }, [servicioSeleccionadoData]);

    const tituloReporte = 'Vistas por servicio';
    const subtituloReporte = fechaDesde && fechaHasta
        ? `Desde ${fechaDesde.toLocaleDateString('es-AR')} hasta ${fechaHasta.toLocaleDateString('es-AR')}`
        : 'Cantidad de visitas que recibió tu/s servicios';
    const tituloTabla = 'Visualizaciones';

    // Título dinámico del gráfico según la agrupación
    const tituloGrafico = useMemo(() => {
        const tipoTexto = tipoAgrupacion === 'dia' ? 'diarias' : tipoAgrupacion === 'semana' ? 'semanales' : 'mensuales';
        return `Cantidad de visualizaciones ${tipoTexto} - ${servicioSeleccionado}`;
    }, [tipoAgrupacion, servicioSeleccionado]);

    function parseFechaLocal(fechaStr) {
        if (!fechaStr) return null;
        const [y, m, d] = fechaStr.split('-');
        return new Date(Number(y), Number(m) - 1, Number(d), 0, 0, 0, 0);
    }
    const location = useLocation();
    const navigate = useNavigate();
    const { showReportesModal } = useReportesModal ? useReportesModal() : { showReportesModal: () => { } };

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const desdeParam = params.get('desde');
        const hastaParam = params.get('hasta');
        if (desdeParam && hastaParam) {
            const desde = parseFechaLocal(desdeParam);
            const hasta = parseFechaLocal(hastaParam);
            setFechaDesde(desde);
            setFechaHasta(hasta);
            setFechasInicializadas(true);
            cargarDatosConfechas(desde, hasta);
        } else {
            setMostrarPopupInicial(false);
        }
    }, [location.search]);

    const cargarDatosConfechas = async (desde, hasta) => {
        if (desde > hasta) return;
        setCargando(true);
        setError(null);
        try {
            const formatearFecha = (fecha) => {
                const anio = fecha.getFullYear();
                const mes = String(fecha.getMonth() + 1).padStart(2, '0');
                const dia = String(fecha.getDate()).padStart(2, '0');
                return `${anio}-${mes}-${dia}`;
            };
            const parametros = {
                desde: formatearFecha(desde),
                hasta: formatearFecha(hasta)
            };
            const datos = await getVistasXServicio({ desde: parametros.desde, hasta: parametros.hasta });
            console.log(datos);
            // Normalización adaptada a la estructura del backend
            const normalized = Array.isArray(datos) ? datos : [];

            setDatosReporte(normalized);
        } catch (error) {
            setError(error);
            manejarError('Ups! Algo salió mal.', error.message || 'Tranqui, somos nosotros no hiciste nada mal');
        } finally {
            setCargando(false);
        }
    };

    const cargarDatos = () => {
        if (fechaDesde && fechaHasta) cargarDatosConfechas(fechaDesde, fechaHasta);
    };

    const manejarExito = (titulo, mensaje) => {
        setExitoTitulo(titulo);
        setExitoMensaje(mensaje);
        setShowExito(true);
    };
    const manejarError = (titulo, mensaje) => {
        setErrorTitulo(titulo);
        setErrorMensaje(mensaje);
        setShowError(true);
    };

    const handleSeleccionFechasIniciales = ({ fechaDesde: desde, fechaHasta: hasta }) => {
        setFechaDesde(desde);
        setFechaHasta(hasta);
        setFechasInicializadas(true);
        setMostrarPopupInicial(false);
        cargarDatosConfechas(desde, hasta);
    };
    const handleFiltrosChange = (nuevosFiltros) => {
        if (nuevosFiltros.fechaDesde) setFechaDesde(nuevosFiltros.fechaDesde);
        if (nuevosFiltros.fechaHasta) setFechaHasta(nuevosFiltros.fechaHasta);
    };
    const handleCancelarPopupInicial = () => setMostrarPopupInicial(false);

    const validarRangoFechas = () => {
        if (!fechaDesde || !fechaHasta) {
            return {
                esValido: false,
                mensaje: 'Debe elegir ambas fechas'
            };
        }
        if (fechaDesde > fechaHasta) {
            return {
                esValido: false,
                mensaje: 'La fecha desde no puede ser mayor a la fecha hasta'
            };
        }
        const hoy = new Date(); hoy.setHours(23, 59, 59, 999);
        if (fechaDesde > hoy || fechaHasta > hoy) {
            return {
                esValido: false,
                mensaje: 'No se pueden elegir fechas futuras'
            };
        }
        return { esValido: true };
    };

    const handleDescargarReporte = async () => {
        try {
            let filtroTexto = 'Todos los servicios';
            if (servicioSeleccionado && servicioSeleccionado !== 'Todos') filtroTexto = servicioSeleccionado;
            else if (localidadSeleccionada && localidadSeleccionada !== 'Todos') filtroTexto = `Localidad: ${localidadSeleccionada}`;
            else if (provinciaSeleccionada && provinciaSeleccionada !== 'Todos') filtroTexto = `Provincia: ${provinciaSeleccionada}`;

            await generarPdfVistasPorServicio({
                titulo: tituloReporte,
                subtitulo: subtituloReporte,
                usuario: (getLoggedUser().email || ''),
                fechaDesde,
                fechaHasta,
                filtroTexto,
                agrupacion: tipoAgrupacion,
                datosTabla: datosFiltradosParaMostrar,
                // Información adicional para el PDF
                tieneServicioSeleccionado: servicioSeleccionado && servicioSeleccionado !== 'Todos',
                resumenContrataciones: resumenContrataciones,
                servicioSeleccionado: servicioSeleccionado
            });
        } catch (e) {
            manejarError('Error al generar el PDF.', e.message || 'Por favor, inténtalo de nuevo.');
        } finally {
            setCargando(false);
        }
    };

    if (!fechasInicializadas) {
        return (
            <>
                <Navbar_Prestador />
                <ReportesBar onSolicitarRango={() => showReportesModal()} />
                <div className="reporte-container">
                    <div className="reporte-content">
                        <Breadcrumbs />
                        <div className="reporte-header">
                            <h1 className="reporte-titulo">{tituloReporte}</h1>
                            <p className="reporte-subtitulo">{subtituloReporte}</p>
                        </div>
                        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#666' }}>
                            <p>No se recibieron fechas. Volvé a abrir "Mis Reportes" y seleccioná un rango.</p>
                            <button
                                onClick={() => navigate(-1)}
                                style={{ marginTop: 16, padding: '10px 22px', background: '#2433FF', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer' }}
                            >Volver</button>
                        </div>
                    </div>
                </div>
            </>
        );
    }
    if (!fechasInicializadas && !mostrarPopupInicial) {
        return (
            <>
                <Navbar_Prestador />
                <div className="reporte-container">
                    <div className="reporte-content">
                        <Breadcrumbs />
                        <div className="reporte-header">
                            <h1 className="reporte-titulo">{tituloReporte}</h1>
                            <p className="reporte-subtitulo">{subtituloReporte}</p>
                        </div>
                        <div style={{
                            textAlign: 'center',
                            padding: '40px 20px'
                        }}>
                            <p style={{ marginBottom: '20px', color: '#666' }}>
                                Es necesario seleccionar un rango de fechas para generar el reporte.
                            </p>
                            <button
                                onClick={() => setMostrarPopupInicial(true)}
                                style={{
                                    padding: '12px 24px',
                                    backgroundColor: '#2433ff',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '10px',
                                    fontSize: '14px',
                                    cursor: 'pointer',
                                    fontWeight: '500'
                                }}
                            >
                                Seleccionar fechas
                            </button>
                        </div>
                    </div>
                </div>
            </>
        );
    }
    if (error) {
        return (
            <>
                <Navbar_Prestador />
                <div className="reporte-container">
                    <div className="error-container">
                        <p>Error al cargar los datos: {error.message}</p>
                        <button onClick={cargarDatos} className="btn-reintentar">
                            Reintentar
                        </button>
                    </div>
                </div>
            </>
        );
    }

    const validacion = validarRangoFechas();

    // Mostrar mensaje cuando no hay servicios disponibles (usuario nuevo sin servicios)
    if (fechasInicializadas && !cargando && Array.isArray(datosReporte) && datosReporte.length === 0 && validacion.esValido) {
        return (
            <>
                <Navbar_Prestador />
                <ReportesBar onSolicitarRango={() => showReportesModal()} />
                <div className="reporte-container">
                    <div className="reporte-content">
                        <Breadcrumbs />
                        <div className="reporte-header">
                            <h1 className="reporte-titulo">{tituloReporte}</h1>
                            <p className="reporte-subtitulo">{subtituloReporte}</p>
                        </div>
                        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#666' }}>
                            <div style={{
                                marginBottom: '20px'
                            }}>
                                <FontAwesomeIcon
                                    icon={faConciergeBell}
                                    style={{
                                        fontSize: '64px',
                                        color: '#2433FF',
                                        opacity: 0.3
                                    }}
                                />
                            </div>
                            <h3 style={{
                                fontSize: '20px',
                                fontWeight: '600',
                                marginBottom: '12px',
                                color: '#333'
                            }}>
                                No hay información disponible
                            </h3>
                            <p style={{
                                fontSize: '15px',
                                marginBottom: '8px',
                                maxWidth: '500px',
                                margin: '0 auto 24px'
                            }}>
                                Todavía no tenés servicios registrados o no hay visualizaciones en el período seleccionado.
                            </p>
                            <p style={{
                                fontSize: '14px',
                                color: '#999',
                                marginBottom: '30px'
                            }}>
                                Publica tus servicios GRATIS y empieza a ver tus estadísticas aquí.
                            </p>
                            <button
                                onClick={() => navigate('/Inicio/mis-servicios')}
                                style={{
                                    marginTop: 10,
                                    padding: '12px 24px',
                                    background: '#2433FF',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: 10,
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '500'
                                }}
                            >
                                Crear servicio
                            </button>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar_Prestador />
            <ReportesBar onSolicitarRango={() => showReportesModal()} />
            <div className="reporte-container">
                <div className="reporte-content">
                    <Breadcrumbs />
                    <div className="reporte-header">
                        <h1 className="reporte-titulo">{tituloReporte}</h1>
                        <p className="reporte-subtitulo">{subtituloReporte}</p>
                    </div>
                    {datosReporte && validacion.esValido && (
                        <div className="rango-info-container">
                            <div className="rango-info">
                                <span className="rango-texto">
                                    Mostrando datos desde {fechaDesde && fechaDesde.toLocaleDateString('es-AR')} hasta {fechaHasta && fechaHasta.toLocaleDateString('es-AR')}
                                </span>
                            </div>
                        </div>
                    )}

                    <div className="chart-filtros">
                        {/* Grupo 1: Filtros geográficos */}
                        <div className="filtro-above">
                            <div className="filtro-label-above">Provincia</div>
                            <FiltroTipo
                                tiposDisponibles={provinciasDisponibles}
                                tipoSeleccionado={provinciaSeleccionada}
                                onChange={handleProvinciaChange}
                                compact={true}
                            />
                        </div>

                        <div className="filtro-above">
                            <div className="filtro-label-above">Localidad</div>
                            <FiltroTipo
                                tiposDisponibles={localidadesDisponibles}
                                tipoSeleccionado={localidadSeleccionada}
                                onChange={handleLocalidadChange}
                                compact={true}
                            />
                        </div>

                        <div className="filtro-above">
                            <div className="filtro-label-above">Servicio</div>
                            <FiltroTipo
                                tiposDisponibles={serviciosDisponibles}
                                tipoSeleccionado={servicioSeleccionado}
                                onChange={handleServicioChange}
                                compact={true}
                            />
                        </div>

                        {/* Grupo 2: Agrupación */}
                        <div className="filtro-above">
                            <div className="filtro-label-above">Agrupación</div>
                            <div className="agrupacion-btns-wrapper">
                                {['dia', 'semana', 'mes'].map(tipo => (
                                    <button
                                        key={tipo}
                                        className={`btn-filtro-grafico ${tipoAgrupacion === tipo ? 'activo' : ''}`}
                                        onClick={() => setTipoAgrupacion(tipo)}
                                        disabled={cargando}
                                    >
                                        {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Grupo 3: Fechas */}
                        <div className="filtro-above filtro-fechas">
                            <div className="filtro-label-above">Fechas</div>
                            <FiltrosReporte
                                fechaDesde={fechaDesde}
                                fechaHasta={fechaHasta}
                                onFiltrosChange={handleFiltrosChange}
                                onAplicarFiltros={cargarDatos}
                                validacion={validacion}
                                cargando={cargando}
                                modoCompacto={true}
                            />
                        </div>
                    </div>

                    {/* Resumen de contrataciones y dinero ganado - solo si hay un servicio seleccionado */}
                    {servicioSeleccionado && servicioSeleccionado !== 'Todos' && (
                        <div className="vca-resumen-container" id="resumen-contrataciones-pdf" style={{ marginTop: '30px' }}>
                            <TarjetaResumen
                                titulocabecera="Contrataciones Totales"
                                valorResumen={resumenContrataciones.cantidadContrataciones}
                                descripcionInformativa={`Total de contrataciones de ${servicioSeleccionado}`}
                                icono="contratacion"
                                colorIcono="#2433FF"
                            />
                            <TarjetaResumen
                                titulocabecera="Dinero Ganado"
                                valorResumen={`$${resumenContrataciones.dineroGanado}`}
                                descripcionInformativa={`Ganancias generadas por ${servicioSeleccionado}`}
                                icono="dinero"
                                colorIcono="#10b981"
                            />
                        </div>
                    )}
                    {Array.isArray(datosReporte) && datosReporte.length > 0 && (
                        <div className="reporte-chart-section" id="grafico-visualizaciones-pdf">
                            <div className="chart-header">
                                <h3 className="chart-titulo">{tituloGrafico}</h3>

                            </div>
                            <div className="reporte-chart-container">
                                {cargando ? (
                                    <div className="loading">Cargando gráfico...</div>
                                ) : datosFiltradosParaMostrar && datosFiltradosParaMostrar.length > 0 ? (
                                    <GraficoLineal
                                        datos={datosFiltradosParaMostrar}
                                        titulo={tituloGrafico}
                                        labelDataset={`Visualizaciones ${tipoAgrupacion === 'dia' ? 'diarias' : tipoAgrupacion === 'semana' ? 'semanales' : 'mensuales'}`}
                                        mostrarLeyenda={true}
                                        mostrarTitulo={false}
                                    />
                                ) : (
                                    <div className="grafico-sin-datos">
                                        <p>No hay datos para el rango seleccionado</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Tabla opcional con toggle */}
                    {mostrarTabla && datosFiltradosParaMostrar && datosFiltradosParaMostrar.length > 0 && (
                        <div className="reporte-table-container">
                            <TablaReporte
                                datos={datosFiltradosParaMostrar}
                                tituloTabla={tituloTabla}
                                tipoAgrupacion={tipoAgrupacion}
                            />
                        </div>
                    )}

                    {/* Gráfico de comisiones diarias - solo si hay un servicio seleccionado */}
                    {servicioSeleccionado && servicioSeleccionado !== 'Todos' && datosComisionesDiarias.length > 0 && (
                        <div className="reporte-chart-section" id="grafico-ganancias-pdf" style={{ marginTop: '30px' }}>
                            <div className="chart-header">
                                <h3 className="chart-titulo">
                                    Ganancias {tipoAgrupacion === 'dia' ? 'Diarias' : tipoAgrupacion === 'semana' ? 'Semanales' : 'Mensuales'} - {servicioSeleccionado}
                                </h3>
                            </div>
                            <div className="reporte-chart-container">
                                <GraficoLineal
                                    datos={datosComisionesDiarias}
                                    titulo={`Ganancias ${tipoAgrupacion === 'dia' ? 'Diarias' : tipoAgrupacion === 'semana' ? 'Semanales' : 'Mensuales'}`}
                                    labelDataset={`Ganancias ${tipoAgrupacion === 'dia' ? 'Diarias' : tipoAgrupacion === 'semana' ? 'Semanales' : 'Mensuales'} ($)`}
                                    borderColor="#10b981"
                                    backgroundColor="rgba(16, 185, 129, 0.1)"
                                    height={300}
                                    mostrarTitulo={false}
                                    tooltipCallbacks={{
                                        label: (ctx) =>
                                            ctx?.parsed?.y !== undefined
                                                ? `Ganancias: $${ctx.parsed.y}`
                                                : ''
                                    }}
                                />
                            </div>
                        </div>
                    )}

                </div>
                {datosFiltradosParaMostrar && datosFiltradosParaMostrar.length > 0 && (
                    <button
                        className="btn-descargar-flotante"
                        onClick={handleDescargarReporte}
                        disabled={cargando}
                    >
                        {cargando ? 'Generando...' : 'Descargar reporte'}
                    </button>
                )}
            </div>
            <ModalAccionExito
                titulo={exitoTitulo}
                mensaje={exitoMensaje}
                mostrar={showExito}
                onAceptar={() => setShowExito(false)}
            />
            <Modal_Error
                titulo={errorTitulo}
                mensaje={errorMensaje}
                mostrar={showError}
                onCerrar={() => setShowError(false)}
            />
        </>
    );
}
