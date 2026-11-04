import { useEffect, useState, useMemo, useCallback } from "react";
import Navbar_Propietario from '../../../common/layouts/Navbar_Propietario'
import Breadcrumbs from '../../../common/layouts/Breadcrumbs';
import ModalAccionExito from '../../../common/layouts/ModalAccionExito';
import Modal_Error from '../../../common/layouts/ModalError';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartBar, faMoneyBillWave, faStar, faCalendarCheck } from '@fortawesome/free-solid-svg-icons';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, Filler);
import ReportesBar from '../src/components/ReportesBar';
import { useReportesModal } from '../src/ReportesModalContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { getSolicitudesXlugar } from "../src/api/reportesApi";
import { getLoggedUser } from "../../../common/Utils";
import GraficoBarras from './src/components/GraficoBarras';
import GraficoLinealReseñas from './src/components/GraficoLinealReseñas';
import FiltroTipo from './src/components/FiltroTipo';
import FiltrosReporte from "./src/components/FiltrosReporte";
import TablaReporte from "./src/components/TablaReporte";
import './src/assets/Reporte.css';
import TarjetaResumen from "./src/components/TarjetaResumen";
import solicitudesPorLugarPDF from '../src/pdf/solicitudesPorLugarPDF';

// Validación robusta de fechas
function validarRangoFechas(fechaDesde, fechaHasta) {
    if (!fechaDesde || !fechaHasta) {
        return { esValido: false, mensaje: "Debe elegir ambas fechas" };
    }
    if (fechaDesde > fechaHasta) {
        return { esValido: false, mensaje: "La fecha desde no puede ser mayor a la fecha hasta" };
    }
    const hoy = new Date();
    hoy.setHours(23, 59, 59, 999);
    if (fechaDesde > hoy || fechaHasta > hoy) {
        return { esValido: false, mensaje: "No se pueden elegir fechas futuras" };
    }
    return { esValido: true };
}

// Mapeo de emojis a Font Awesome icons
function mapearIcono(emoji) {
    const iconMap = {
        '📊': <FontAwesomeIcon icon={faChartBar} style={{ fontSize: '24px', color: '#2433ff' }} />,
        '💵': <FontAwesomeIcon icon={faMoneyBillWave} style={{ fontSize: '24px', color: '#2433ff' }} />,
        '⭐': <FontAwesomeIcon icon={faStar} style={{ fontSize: '24px', color: '#2433ff' }} />
    };
    return iconMap[emoji] || emoji;
}

export default function VisualizarSolicitudesPorLugar() {
    const [datos, setDatos] = useState(null);
    const [fechaDesde, setFechaDesde] = useState(null);
    const [fechaHasta, setFechaHasta] = useState(null);
    const [lugarSeleccionado, setLugarSeleccionado] = useState(null);
    const [cargando, setCargando] = useState(false);
    const [generandoPDF, setGenerandoPDF] = useState(false);
    const [showExito, setShowExito] = useState(false);
    const [exitoMensaje, setExitoMensaje] = useState("");
    const [showError, setShowError] = useState(false);
    const [errorMensaje, setErrorMensaje] = useState("");
    const [mostrarPopupInicial, setMostrarPopupInicial] = useState(false);
    const [fechasInicializadas, setFechasInicializadas] = useState(false);
    const [error, setError] = useState(null);

    const location = useLocation();
    const navigate = useNavigate();
    const { showReportesModal } = useReportesModal ? useReportesModal() : { showReportesModal: () => { } };

    function parseFechaLocal(fechaStr) {
        if (!fechaStr) return null;
        const [y, m, d] = fechaStr.split('-');
        return new Date(Number(y), Number(m) - 1, Number(d), 0, 0, 0, 0);
    }

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
            fetchDatos(desde, hasta);
        } else {
            setMostrarPopupInicial(false);
        }
    }, [location.search]);

    const fetchDatos = async (desde = null, hasta = null) => {
        if (desde > hasta) return;
        setCargando(true);
        setError(null);
        try {
            const resp = await getSolicitudesXlugar({
                desde: desde || fechaDesde,
                hasta: hasta || fechaHasta
            });
            console.log('Respuesta:', resp);
            setDatos(resp);

            // Setear automáticamente el primer lugar cuando lleguen los datos
            if (resp?.lugares && resp.lugares.length > 0) {
                setLugarSeleccionado(resp.lugares[0].nombreLugar);
            }
        } catch (e) {
            setError(e);
            setErrorMensaje(e.message || "Error al cargar los datos.");
            setShowError(true);
        } finally {
            setCargando(false);
        }
    };

    const handleFiltrosChange = ({ fechaDesde: desde, fechaHasta: hasta }) => {
        if (desde !== undefined) setFechaDesde(desde);
        if (hasta !== undefined) setFechaHasta(hasta);
    };

    const handleFiltrar = () => {
        fetchDatos();
    };

    const lugaresDisponibles = useMemo(() => {
        if (!datos?.lugares || !Array.isArray(datos.lugares)) return [];
        return datos.lugares.map(l => l.nombreLugar);
    }, [datos]);

    // Agrupa los datos para gráfico/tabla
    const datosAgrupados = useMemo(() => {
        if (!datos?.lugares || !lugarSeleccionado) return null;
        const sel = datos.lugares.find(l => l.nombreLugar === lugarSeleccionado);
        if (!sel) return [];
        return sel.cantidadReservas.map(est => ({
            estadoReserva: est.estadoReserva,
            cantidad: est.cantidadReservas
        }));
    }, [datos, lugarSeleccionado]);

    // Resumen de lugar seleccionado
    const resumenLugarSel = useMemo(() => {
        if (!lugarSeleccionado || !datos?.lugares) return [];
        const sel = datos.lugares.find(l => l.nombreLugar === lugarSeleccionado);
        return sel?.resumen || [];
    }, [datos, lugarSeleccionado]);

    // Tabla de estados/cantidades del lugar seleccionado
    const cantidadesTabla = useMemo(() => {
        if (!lugarSeleccionado || !datos?.lugares) return [];
        const sel = datos.lugares.find(l => l.nombreLugar === lugarSeleccionado);
        return sel?.cantidadReservas || [];
    }, [datos, lugarSeleccionado]);

    // Tendencia de reseñas del lugar seleccionado
    const tendenciaReseñas = useMemo(() => {
        if (!lugarSeleccionado || !datos?.lugares) return [];
        const sel = datos.lugares.find(l => l.nombreLugar === lugarSeleccionado);
        if (!sel?.tendenciaReseñas) return [];

        // Return all entries, including those with 0 reviews or 0 average
        return sel.tendenciaReseñas;
    }, [datos, lugarSeleccionado]);

    const validacion = validarRangoFechas(fechaDesde, fechaHasta);

    // Determinar si se puede descargar el PDF
    const puedeDescargarPDF = useMemo(() => {
        // Si está cargando, generando PDF, o no hay datos, no permitir
        if (generandoPDF || cargando || !datos || !lugarSeleccionado) return false;

        // Verificar que tenga datos para mostrar
        return datosAgrupados && datosAgrupados.length > 0;
    }, [generandoPDF, cargando, datos, lugarSeleccionado, datosAgrupados]);

    // PDF
    const handleDescargarReporte = async () => {
        try {
            setGenerandoPDF(true);

            // Esperar a que se rendericen las etiquetas en los gráficos
            await new Promise(resolve => setTimeout(resolve, 300));

            let filtroTexto = lugarSeleccionado || "Todos los lugares";

            await solicitudesPorLugarPDF({
                titulo: 'Solicitudes por lugar',
                subtitulo: `Desde ${fechaDesde.toLocaleDateString('es-AR')} hasta ${fechaHasta.toLocaleDateString('es-AR')}`,
                usuario: getLoggedUser()?.email || '',
                fechaDesde: fechaDesde || null,
                fechaHasta: fechaHasta || null,
                filtroTexto,
                resumenArr: resumenLugarSel
            });
        } catch (e) {
            setErrorMensaje("Por favor, reintenta en unos segundos o contacta al soporte");
            setShowError(true);
        } finally {
            setGenerandoPDF(false);
        }
    };

    if (!fechasInicializadas && !mostrarPopupInicial) {
        return (
            <>
                <Navbar_Propietario />
                <div className="reporte-container">
                    <div className="reporte-content">
                        <Breadcrumbs />
                        <div className="reporte-header">
                            <h1 className="reporte-titulo">Solicitudes por lugar</h1>
                            <p className="reporte-subtitulo">
                                Visualiza la tasa de ocupación, ingresos y cantidad de reservas por cada lugar o el total de tus espacios.
                            </p>
                        </div>
                        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
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
                <Navbar_Propietario />
                <div className="reporte-container">
                    <div className="error-container">
                        <p>Error al cargar los datos: {error.message}</p>
                        <button onClick={fetchDatos} className="btn-reintentar">
                            Reintentar
                        </button>
                    </div>
                </div>
            </>
        );
    }

    // Mostrar mensaje cuando no hay datos disponibles (usuario nuevo sin lugares)
    if (fechasInicializadas && !cargando && (!datos?.lugares || datos.lugares.length === 0)) {
        return (
            <>
                <Navbar_Propietario />
                <ReportesBar onSolicitarRango={() => showReportesModal()} />
                <div className="reporte-container">
                    <div className="reporte-content">
                        <Breadcrumbs />
                        <div className="reporte-header">
                            <h1 className="reporte-titulo">Solicitudes por lugar</h1>
                            <p className="reporte-subtitulo">
                                Visualiza la tasa de ocupación, ingresos y cantidad de reservas por cada lugar o el total de tus espacios.
                            </p>
                        </div>
                        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#666' }}>
                            <div style={{
                                marginBottom: '20px'
                            }}>
                                <FontAwesomeIcon
                                    icon={faCalendarCheck}
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
                                Todavía no tenés lugares registrados o no hay solicitudes en el período seleccionado.
                            </p>
                            <p style={{
                                fontSize: '14px',
                                color: '#999',
                                marginBottom: '30px'
                            }}>
                                Una vez que registres tus lugares y recibas solicitudes, podrás ver tus estadísticas aquí.
                            </p>
                            <button
                                onClick={() => navigate(-1)}
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
                                Volver
                            </button>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar_Propietario />
            <ReportesBar onSolicitarRango={() => showReportesModal()} />
            <div className="reporte-container">
                <div className="reporte-content">
                    <Breadcrumbs />
                    <div className="reporte-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                        <div>
                            <h1 className="reporte-titulo">Solicitudes por lugar</h1>
                            <p className="reporte-subtitulo">
                                Visualiza la tasa de ocupación, ingresos y cantidad de reservas por cada lugar
                            </p>
                        </div>
                        <div className="chart-filtros">
                            <div className="filtro-above">
                                <div className="filtro-label-above">Lugares</div>
                                <FiltroTipo
                                    tiposDisponibles={lugaresDisponibles}
                                    tipoSeleccionado={lugarSeleccionado}
                                    onChange={setLugarSeleccionado}
                                    compact={true}
                                />
                            </div>
                            <div className="filtro-above filtro-fechas">
                                <div className="filtro-label-above">Fechas</div>
                                <FiltrosReporte
                                    fechaDesde={fechaDesde}
                                    fechaHasta={fechaHasta}
                                    onFiltrosChange={handleFiltrosChange}
                                    onAplicarFiltros={handleFiltrar}
                                    validacion={validacion}
                                    cargando={cargando}
                                    modoCompacto={true}
                                />
                            </div>
                        </div>
                    </div>

                    {datos && validacion.esValido && (
                        <div className="rango-info-container">
                            <div className="rango-info">
                                <span className="rango-texto">
                                    Mostrando datos desde {fechaDesde && fechaDesde.toLocaleDateString('es-AR')} hasta {fechaHasta && fechaHasta.toLocaleDateString('es-AR')}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Info resumen del lugar */}
                    {lugarSeleccionado && resumenLugarSel.length > 0 && (
                        <div id="tarjetas-resumen-container" style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', marginTop: 24 }}>
                            {resumenLugarSel.map(item =>
                                <TarjetaResumen
                                    key={item.descripcion}
                                    valorResumen={item.valor}
                                    icono={mapearIcono(item.icono)}
                                    titulocabecera={item.descripcion}
                                    descripcionInformativa={``}
                                />
                            )}
                        </div>
                    )}

                    <div className="reporte-chart-section">
                        <div className="chart-header">
                            <h3 className="chart-titulo">Gráfico de reservas por estado</h3>
                        </div>
                        <div className="reporte-chart-container" id="grafico-barras-container">
                            {cargando ? (
                                <div className="loading">Cargando gráfico...</div>
                            ) : datosAgrupados && datosAgrupados.length > 0 ? (
                                <GraficoBarras
                                    datos={datosAgrupados.map(d => ({
                                        label: (function mapEstado(e) {
                                            if (!e) return 'Otros';
                                            const key = String(e).toLowerCase();
                                            if (key.includes('confirm') || key.includes('complet')) return 'Completadas';
                                            if (key.includes('parcial') || key.includes('pend')) return 'Pendientes';
                                            if (key.includes('cancel')) return 'Canceladas';
                                            return e;
                                        })(d.estadoReserva),
                                        cantidad: d.cantidad
                                    }))}
                                    titulo={`Cantidad de reservas por estado (${lugarSeleccionado || 'Lugar'})`}
                                    labelDataset="Reservas"
                                    tipoAgrupacion="estado"
                                    backgroundColor={['#68d391', '#ffd166', '#ef476f']}
                                    borderColor={['#23623b', '#e1bc29', '#c61c31']}
                                    height={330}
                                    mostrarLeyenda={false}
                                    mostrarTitulo={false}
                                    mostrarEtiquetas={generandoPDF}
                                    formatoTooltip={{
                                        label: ctx => `${ctx.dataset.label}: ${ctx.formattedValue}`,
                                        title: ctx => `Estado: ${ctx[0].label}`
                                    }}
                                />
                            ) : (
                                <div className="grafico-sin-datos">
                                    <p>No hay datos para el rango/lugar seleccionado.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Gráfico de tendencia de reseñas */}
                    {lugarSeleccionado && (
                        <div className="reporte-chart-section" style={{ marginTop: 32 }}>
                            <div className="chart-header">
                                <h3 className="chart-titulo">Tendencia de reseñas</h3>
                            </div>
                            <div className="reporte-chart-container" id="grafico-lineal-container">
                                {cargando ? (
                                    <div className="loading">Cargando gráfico...</div>
                                ) : tendenciaReseñas.length > 0 ? (
                                    <GraficoLinealReseñas
                                        datos={tendenciaReseñas}
                                        getLabel={(item) => {
                                            const [year, month, day] = item.fecha.split('-');
                                            return `${day}/${month}/${year}`;
                                        }}
                                        getValor={(item) => item.promedioEstrellas}
                                        labelDataset="Promedio de estrellas"
                                        yMax={5}
                                        mostrarEtiquetas={generandoPDF}
                                        tooltipCallbacks={{
                                            label: (context) => `Promedio: ${context.formattedValue} ⭐`,
                                            title: (context) => `Fecha: ${context[0].label}`,
                                            afterLabel: (context) => {
                                                const dataPoint = tendenciaReseñas[context.dataIndex];
                                                return `Reseñas: ${dataPoint.cantidadReseñas}`;
                                            }
                                        }}
                                    />
                                ) : (

                                    <div className="grafico-sin-datos">
                                        <p>No hay reseñas disponibles para este lugar en el rango seleccionado.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}


                </div>
                <button
                    className="btn-descargar-flotante"
                    onClick={handleDescargarReporte}
                    disabled={!puedeDescargarPDF}
                    title={!puedeDescargarPDF ? "No hay datos disponibles para descargar" : "Descargar PDF"}
                >
                    {generandoPDF ? "Generando..." : "Descargar reporte"}
                </button>
                {/* Modals */}
                <ModalAccionExito
                    titulo="¡Éxito!"
                    mensaje={exitoMensaje}
                    mostrar={showExito}
                    onAceptar={() => setShowExito(false)}
                />
                <Modal_Error
                    titulo="Error"
                    mensaje={errorMensaje}
                    mostrar={showError}
                    onCerrar={() => setShowError(false)}
                />
            </div>
        </>
    );
}
