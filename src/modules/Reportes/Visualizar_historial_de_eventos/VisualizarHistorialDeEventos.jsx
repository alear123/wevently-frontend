import React, { useState, useEffect, useMemo } from 'react';
import Navbar_Organizador from '../../../common/layouts/Navbar_Organizador';
import TarjetaResumen from './src/components/TarjetaResumen';
import GraficoBarras from './src/components/GraficoBarras';
import TarjetaEvento from './src/components/TarjetaEvento';
import ReportesBar from '../src/components/ReportesBar';
import ModalError from '../../../common/layouts/ModalError';
import Buscador from '../../../common/components/Buscador';
import Pagination from '../../../common/layouts/Pagination';
import FiltrosReporte from '../src/components/FiltrosReporte';
import { getHistorialDeEventos } from '../src/api/reportesApi';
import { useReportesModal } from '../src/ReportesModalContext';
import { generarPDFHistorialEventos } from '../src/pdf/generarPDFHistorialEventos';
import { getLoggedUser } from '../../../common/Utils';
import { useLocation, useNavigate } from 'react-router-dom';
import './src/assets/Reporte.css';
import './src/assets/TarjetaEvento.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGift, faCity, faHandshake, faMoneyBillWave, faCalendar } from "@fortawesome/free-solid-svg-icons";


const mapeoIconos = {
    '🥳': 'faGift',
    '🏙️': 'faCity',
    '🤝': 'faHandshake',
    '💸': 'faMoneyBillWave'
};

export default function VisualizarHistorialDeEventos() {
    const [datosOriginales, setDatosOriginales] = useState(null);
    const [cargando, setCargando] = useState(false);
    const [generandoPdf, setGenerandoPdf] = useState(false);
    const [error, setError] = useState(null);
    const [fechasInicializadas, setFechasInicializadas] = useState(false);
    const [fechaDesde, setFechaDesde] = useState(null);
    const [fechaHasta, setFechaHasta] = useState(null);

    // Buscador y paginación
    const [busqueda, setBusqueda] = useState('');
    const [paginaActual, setPaginaActual] = useState(1);
    const [cantidadMostrar, setCantidadMostrar] = useState(6);

    const [showError, setShowError] = useState(false);
    const [errorTitulo, setErrorTitulo] = useState('');
    const [errorMensaje, setErrorMensaje] = useState('');

    const { showReportesModal } = useReportesModal ? useReportesModal() : { showReportesModal: () => {} };
    const location = useLocation();
    const navigate = useNavigate();

    const tituloReporte = 'Historial de eventos';
    const subtituloReporte = 'Visualizá el resumen de tus eventos y gastos del período seleccionado';

    // Manejar errores
    const manejarError = (titulo, mensaje) => {
        setErrorTitulo(titulo);
        setErrorMensaje(mensaje);
        setShowError(true);
    };

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const desdeParam = params.get('desde');
        const hastaParam = params.get('hasta');
        if (desdeParam && hastaParam) {
            const d = new Date(desdeParam + 'T00:00:00');
            const h = new Date(hastaParam + 'T00:00:00');
            setFechaDesde(d);
            setFechaHasta(h);
            setFechasInicializadas(true);
            cargarDatosConFechas(d, h);
        } else {
            setFechasInicializadas(false);
        }
    }, [location.search]);

    const cargarDatosConFechas = async (desde, hasta) => {
        if (desde > hasta) return;
        setCargando(true);
        setError(null);
        try {
            const datos = await getHistorialDeEventos({ desde, hasta });
            // Transformar emojis a iconos de Font Awesome en el resumen
            const resumenTransformado = datos.resumen?.map(item => ({
                ...item,
                icono: mapeoIconos[item.icono] || item.icono
            })) || [];
            setDatosOriginales({
                ...datos,
                resumen: resumenTransformado
            });
        } catch (err) {
            setError(err);
            manejarError('Error al cargar datos', err.message || 'No se pudieron cargar los datos del historial');
        } finally {
            setCargando(false);
        }
    };

    const obtenerMailUsuario = () => {
        const usuario = getLoggedUser();
        return usuario?.email || 'usuario@demo.com';
    };

    const handleDescargarReporte = async () => {
        if (!datosOriginales || generandoPdf) return;
        try {
            setGenerandoPdf(true);
            await generarPDFHistorialEventos({
                datos: {
                    resumen: datosOriginales.resumen || [],
                    eventos: datosGraficoProcesados
                },
                rango: { desde: fechaDesde, hasta: fechaHasta },
                usuario: obtenerMailUsuario(),
            });
        } catch (e) {
            manejarError('Error al generar PDF', e.message || 'Intente nuevamente');
        } finally {
            setGenerandoPdf(false);
        }
    };

    const handleCrearEvento = () => {
        navigate('/Inicio/mis-eventos');
    };

    const handleIrDetalleEvento = (id) => {
        navigate('/Inicio/mis-eventos');
    };

    // Selector de fechas
    const handleFiltroFechas = (nuevosFiltros) => {
        if (nuevosFiltros.fechaDesde) setFechaDesde(nuevosFiltros.fechaDesde);
        if (nuevosFiltros.fechaHasta) setFechaHasta(nuevosFiltros.fechaHasta);
    };
    const handleAplicarFiltros = () => {
        if (fechaDesde && fechaHasta) cargarDatosConFechas(fechaDesde, fechaHasta);
    };

    // Procesar datos
    const resumenNormalizado = datosOriginales?.resumen || [];
    const eventos = datosOriginales?.eventos || [];
    const hayEventos = eventos.length > 0;

    // Buscador + paginación
    const eventosFiltrados = useMemo(
        () =>
            eventos.filter(ev =>
                Object.values(ev).some(val =>
                    String(val ?? '').toLowerCase().includes(busqueda.toLowerCase())
                )
            ),
        [busqueda, eventos]
    );
    const totalPaginas = Math.ceil(eventosFiltrados.length / cantidadMostrar) || 1;
    const eventosPaginados = eventosFiltrados.slice(
        (paginaActual - 1) * cantidadMostrar,
        paginaActual * cantidadMostrar
    );
    useEffect(() => { setPaginaActual(1); }, [busqueda, cantidadMostrar]);

    // Gráfico de barras
    const datosGraficoProcesados = eventosFiltrados.map(evento => ({
        label: evento.nombreEvento,
        valor: evento.totalGastado || 0,
        fecha: evento.fecha,
        evento: evento
    }));

    const rangoTexto = `Mostrando datos desde ${fechaDesde ? fechaDesde.toLocaleDateString('es-AR') : ''} hasta ${fechaHasta ? fechaHasta.toLocaleDateString('es-AR') : ''}`;

    // Renderizado
    if (!fechasInicializadas) {
        return (
            <>
                <Navbar_Organizador />
                <ReportesBar onSolicitarRango={() => showReportesModal()} />
                <div className="reporte-container">
                    <div className='reporte-content'>
                        <div className='reporte-header'>
                            <h1 className="reporte-titulo">{tituloReporte}</h1>
                            <p className="reporte-subtitulo">{subtituloReporte}</p>
                        </div>
                        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#666' }}>
                            <p>No se recibieron fechas. Volvé a abrir "Mis Reportes" y seleccioná un rango.</p>
                            <button
                                onClick={() => navigate(-1)}
                                style={{
                                    marginTop: 16,
                                    padding: '10px 22px',
                                    background: '#2433FF',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: 10,
                                    cursor: 'pointer'
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

    if (error) {
        return (
            <>
                <Navbar_Organizador />
                <ReportesBar onSolicitarRango={() => showReportesModal()} />
                <div className="reporte-container">
                    <div className="error-container">
                        <p>Error al cargar los datos: {error.message}</p>
                        <button
                            onClick={() => cargarDatosConFechas(fechaDesde, fechaHasta)}
                            className="btn-reintentar"
                        >
                            Reintentar
                        </button>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar_Organizador />
            <ReportesBar onSolicitarRango={() => showReportesModal()} />
            <div className='reporte-container'>
                <div className='reporte-content'>
                    <div className='reporte-header'>
                        <h1 className="reporte-titulo">{tituloReporte}</h1>
                        <p className="reporte-subtitulo">{subtituloReporte}</p>
                    </div>

                    <div className="rango-info-container">
                        <div className='rango-info'>
                            <span className="rango-texto">{rangoTexto}</span>
                        </div>
                    </div>

                    <div className='reporte-resumen-container'>
                        {resumenNormalizado.map((item, idx) => (
                            <TarjetaResumen
                                key={idx}
                                titulocabecera={item.periodo}
                                valorResumen={item.valor}
                                icono={item.icono}
                                descripcionInformativa={item.descripcion}
                            />
                        ))}
                    </div>

                    {cargando ? (
                        <div className="loading-container" style={{
                            textAlign: 'center',
                            padding: '60px 20px'
                        }}>
                            <p>Cargando datos...</p>
                        </div>
                    ) : !hayEventos ? (
                        <div className="sin-eventos-container">
                            <div className="sin-eventos-content">
                                <div className="sin-eventos-icono">
                                    <FontAwesomeIcon icon={faCalendar} size="2x" />
                                </div>
                                <h3 className="sin-eventos-titulo">
                                    No tenés eventos en este período
                                </h3>
                                <p className="sin-eventos-descripcion">
                                    Creá tu primer evento para comenzar a visualizar tu historial
                                </p>
                                <button
                                    className="btn-crear-evento"
                                    onClick={handleCrearEvento}
                                >
                                    Nuevo evento
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className='reporte-chart-section'>
                                <div className="chart-header" style={{ display: 'flex', alignItems: 'center' }}>
                                    <h3 className="chart-titulo" style={{ flex: 1 }}>Total gastado por evento</h3>
                                    <FiltrosReporte
                                        fechaDesde={fechaDesde}
                                        fechaHasta={fechaHasta}
                                        onFiltrosChange={handleFiltroFechas}
                                        onAplicarFiltros={handleAplicarFiltros}
                                        cargando={cargando}
                                        modoCompacto
                                    />
                                </div>
                                <div className='reporte-chart-container'>
                                    <GraficoBarras
                                        datos={datosGraficoProcesados}
                                        titulo=""
                                        labelDataset="Gasto total"
                                        mostrarTitulo={false}
                                        formatoTooltip={{
                                            title: function (context) {
                                                const item = datosGraficoProcesados[context[0].dataIndex];
                                                const fecha = new Date(item.fecha);
                                                return `${item.label} - ${fecha.toLocaleDateString('es-AR')}`;
                                            },
                                            label: function (context) {
                                                const valor = context.parsed.y;
                                                return `Total gastado: $${valor.toLocaleString('es-AR', {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2
                                                })}`;
                                            }
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="eventos-lista-container">
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '30px 0 10px 0' }}>
                                            <div style={{ maxWidth: 500, marginBottom: 18 }}>
                                                <Buscador
                                                    placeholder="Buscar evento..."
                                                    value={busqueda}
                                                    onChange={setBusqueda}
                                                    width={350}
                                                    useSharedStyles={true}
                                                />
                                            </div>
                                            <button
                                                className="btn-crear-evento"
                                                style={{ marginLeft: 20, minWidth: 100, marginBottom: 18 }}
                                                onClick={handleCrearEvento}
                                            >
                                                Crear evento
                                            </button>
                                        </div>
                                <h3 className="eventos-lista-titulo">Eventos del período</h3>
                                <div className="eventos-grid">
                                    {eventosPaginados.map(evento => (
                                        <TarjetaEvento
                                            key={evento.idEvento}
                                            evento={evento}
                                            onClick={() => handleIrDetalleEvento(evento.idEvento)}
                                        />
                                    ))}
                                </div>
                                <Pagination
                                    paginaActual={paginaActual}
                                    totalPaginas={totalPaginas}
                                    setPaginaActual={setPaginaActual}
                                    inicio={(paginaActual - 1) * cantidadMostrar}
                                    fin={Math.min(paginaActual * cantidadMostrar, eventosFiltrados.length)}
                                    totalItems={eventosFiltrados.length}
                                    cantidadMostrar={cantidadMostrar}
                                    setCantidadMostrar={setCantidadMostrar}
                                />
                            </div>
                        </>
                    )}
                </div>

                {hayEventos && (
                    <button
                        className="btn-descargar-flotante"
                        onClick={handleDescargarReporte}
                        disabled={cargando || generandoPdf}
                    >
                        {generandoPdf ? 'Generando PDF...' : 'Descargar reporte'}
                    </button>
                )}
            </div>
            <ModalError
                titulo={errorTitulo}
                mensaje={errorMensaje}
                mostrar={showError}
                onCerrar={() => setShowError(false)}
            />
        </>
    );
}