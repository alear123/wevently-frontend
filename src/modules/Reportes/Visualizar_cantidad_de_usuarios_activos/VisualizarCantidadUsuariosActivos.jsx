import React, { useState, useEffect, useMemo } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import Navbar_Administrador from '../../../common/layouts/Navbar_Administrador';
import TarjetaResumen from './src/components/TarjetaResumen';
import GraficoBarras from '../src/components/GraficoBarras';
import GraficoTorta from '../src/components/GraficoTorta';
import GraficoLineal from '../src/components/GraficoLineal';
import FiltrosReporte from '../src/components/FiltrosReporte';
import TablaReporte from './src/components/TablaReporte';
import { obtenerDatosUsuariosActivos } from './src/api/API_Conexion_Back';
import { getUsuariosActivos } from '../src/api/reportesApi';
import ModalError from '../../../common/layouts/ModalError';
import ReportesBar from '../src/components/ReportesBar';
import { useReportesModal } from '../src/ReportesModalContext';
import { generarPDFUsuariosActivos } from '../src/pdf/generarPDFUsuarios';
import { toYMD, validarRangoFechas as validarRangoCentral } from '../src/utils/fechas';
import { getLoggedUser } from '../../../common/Utils';
import './src/assets/Reporte1.css';
import '../src/assets/FiltrosReporte.css';
import '../src/assets/BotónFlotante.css'
import { useLocation, useNavigate } from 'react-router-dom';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

function parseFechaLocal(fechaStr) {
    if (!fechaStr) return null;
    const [y, m, d] = fechaStr.split('-');
    return new Date(Number(y), Number(m) - 1, Number(d), 0, 0, 0, 0);
}

function fechaToDDMMYYYY(fechaStr) {
    const date = parseFechaLocal(fechaStr);
    if (!date || isNaN(date.getTime())) return '';
    return date.toLocaleDateString('es-AR');
}

export default function VisualizarCantidadUsuariosActivos() {
    const [datosOriginales, setDatosOriginales] = useState(null);
    const [cargando, setCargando] = useState(false);
    const [generandoPdf, setGenerandoPdf] = useState(false);
    const [error, setError] = useState(null);
    const [mostrarTabla, setMostrarTabla] = useState(false);

    const [fechasInicializadas, setFechasInicializadas] = useState(false);
    const [fechaDesde, setFechaDesde] = useState(null);
    const [fechaHasta, setFechaHasta] = useState(null);
    const [tipoAgrupacion, setTipoAgrupacion] = useState('dia');
    const [showError, setShowError] = useState(false);
    const [errorTitulo, setErrorTitulo] = useState('');
    const [errorMensaje, setErrorMensaje] = useState('');
    const { showReportesModal } = useReportesModal ? useReportesModal() : { showReportesModal: () => { } };

    const tituloReporte = 'Reporte de usuarios activos';
    const subtituloReporte = 'Podés identificar tendencias, picos e información financiera.';
    const tituloTabla = tipoAgrupacion === 'mes' ? 'Cantidad de usuarios activos' : 'Cantidad de usuarios activos';

    const manejarError = (titulo, mensaje) => {
        setErrorTitulo(titulo);
        setErrorMensaje(mensaje);
        setShowError(true);
    };

    const location = useLocation();
    const navigate = useNavigate();

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

    const USE_MOCK = false;

    const cargarDatosConFechas = async (desde, hasta, agrupacion = tipoAgrupacion) => {
        if (desde > hasta) return;
        setCargando(true);
        setError(null);
        try {
            let datos;
            if (USE_MOCK) {
                datos = await obtenerDatosUsuariosActivos({
                    fechaDesde: toYMD(desde),
                    fechaHasta: toYMD(hasta),
                    agrupacion,
                });
            } else {
                datos = await getUsuariosActivos({ desde, hasta });

            }
            setDatosOriginales(datos);
            console.log("datos q vienen del back", datos);
        } catch (err) {
            setError(err);
        } finally {
            setCargando(false);
        }
    };
    function agruparPor(arr, tipo) {
        if (!arr.length) return [];
        let desdeDate = parseFechaLocal(toYMD(fechaDesde));
        let hastaDate = parseFechaLocal(toYMD(fechaHasta));
        hastaDate.setHours(23, 59, 59, 999);
        arr = arr.filter(item => {
            const fechaItem = parseFechaLocal(item.fecha);
            return fechaItem >= desdeDate && fechaItem <= hastaDate;
        });

        if (tipo === 'dia') return arr;

        let grupos = {};
        arr.forEach(item => {
            const fecha = parseFechaLocal(item.fecha);
            let clave, label;
            if (tipo === 'semana') {
                const dia = fecha.getDay();
                const diff = dia === 0 ? -6 : 1 - dia;
                const inicioSemana = new Date(fecha);
                inicioSemana.setDate(fecha.getDate() + diff);
                clave = toYMD(inicioSemana);
                label = inicioSemana.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });
            } else if (tipo === 'mes') {
                clave = `${fecha.getFullYear()}-${(fecha.getMonth() + 1).toString().padStart(2, '0')}`;
                label = `${(fecha.getMonth() + 1).toString().padStart(2, '0')}/${fecha.getFullYear()}`;
            }
            if (!grupos[clave]) grupos[clave] = { clave, label, cantidad: 0, fechas: [] };
            grupos[clave].cantidad += item.cantidad;
            grupos[clave].fechas.push(item.fecha);
        });

        const clavesValidas = Object.keys(grupos).filter(clave => {
            if (tipo === 'semana') {
                const semanaDate = parseFechaLocal(clave);
                return semanaDate <= hastaDate && semanaDate <= hastaDate && semanaDate >= desdeDate;
            }
            if (tipo === 'mes') {
                const [anio, mes] = clave.split('-');
                const primerDia = new Date(anio, mes - 1, 1);
                const ultimoDia = new Date(anio, mes, 0);
                return (ultimoDia >= desdeDate && primerDia <= hastaDate);
            }
            return true;
        });

        return clavesValidas.map(k => ({
            fecha: tipo === 'dia' ? k
                : tipo === 'semana' ? k
                    : k + '-01', // 'YYYY-MM-01'
            cantidad: grupos[k].cantidad,
            label: grupos[k].label,
            fechaTermino: tipo === 'mes'
                ? grupos[k].fechas.sort().slice(-1)[0]
                : tipo === 'semana'
                    ? grupos[k].fechas.sort().slice(-1)[0]
                    : k
        })).sort((a, b) => parseFechaLocal(a.fecha) - parseFechaLocal(b.fecha));
    }


    const datosGraficoNormalizados = useMemo(() => {
        if (!datosOriginales?.datosGrafico) return [];
        let desdeDate = parseFechaLocal(toYMD(fechaDesde));
        //incluye el día completo hasta las 23:59 para asegurar el match final
        let hastaDate = parseFechaLocal(toYMD(fechaHasta));
        hastaDate.setHours(23, 59, 59, 999);


        const arr = datosOriginales.datosGrafico
            .filter(item => {
                const current = parseFechaLocal(item.fechaIngreso);
                return current >= desdeDate && current <= hastaDate;
            })
            .map(item => ({
                fecha: item.fechaIngreso,
                cantidad: item.cantidadIngresos,
                label: fechaToDDMMYYYY(item.fechaIngreso),
            }));

        console.log("datos normalizados", agruparPor(arr, tipoAgrupacion));
        return agruparPor(arr, tipoAgrupacion);
    }, [datosOriginales, fechaDesde, fechaHasta, tipoAgrupacion]);

    const handleCambioAgrupacion = (nuevaAgrupacion) => setTipoAgrupacion(nuevaAgrupacion);

    const cargarDatos = async () => {
        if (fechaDesde && fechaHasta) await cargarDatosConFechas(fechaDesde, fechaHasta);
    };

    const toInputString = (fecha) => {
        if (!fecha) return '';
        if (typeof fecha === 'string') return fecha;
        if (fecha instanceof Date && !isNaN(fecha)) {
            const anio = fecha.getFullYear();
            const mes = String(fecha.getMonth() + 1).padStart(2, '0');
            const dia = String(fecha.getDate()).padStart(2, '0');
            return `${anio}-${mes}-${dia}`;
        }
        return '';
    };

    const handleFiltrosChange = (nuevosFiltros) => {
        let changed = false;
        let nuevoDesde = fechaDesde;
        let nuevoHasta = fechaHasta;
        if (nuevosFiltros.fechaDesde) {
            setFechaDesde(nuevosFiltros.fechaDesde);
            nuevoDesde = nuevosFiltros.fechaDesde;
            changed = true;
        }
        if (nuevosFiltros.fechaHasta) {
            setFechaHasta(nuevosFiltros.fechaHasta);
            nuevoHasta = nuevosFiltros.fechaHasta;
            changed = true;
        }
        if (nuevosFiltros.tipoAgrupacion) setTipoAgrupacion(nuevosFiltros.tipoAgrupacion);
        if (changed) {
            try {
                const last = JSON.parse(localStorage.getItem('reportes:lastRange')) || {};
                const reporte = last.reporte || 'usuariosactivos';
                const activeRange = '';
                localStorage.setItem('reportes:lastRange', JSON.stringify({
                    reporte,
                    fechaDesde: toInputString(nuevoDesde),
                    fechaHasta: toInputString(nuevoHasta),
                    activeRange,
                }));
            } catch (e) { /* ignore */ }
        }
    };

    const obtenerAgrupacionesDisponibles = () => {
        if (!fechaDesde || !fechaHasta) return ['dia'];
        const diffTime = Math.abs(fechaHasta - fechaDesde);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const agrupaciones = ['dia'];
        if (diffDays >= 7) agrupaciones.push('semana');
        if (diffDays >= 30) agrupaciones.push('mes');
        return agrupaciones;
    };

    const obtenerMailUsuario = () => {
        const usuario = getLoggedUser();
        return usuario.email;
    };

    const resumenNormalizado = datosOriginales?.resumenPeriodo ?? datosOriginales?.resumenPeriodos ?? [];

    const handleDescargarReporte = async () => {
        if (!datosOriginales || generandoPdf) return;
        try {
            setGenerandoPdf(true);
            // Esperar a que el estado se actualice y los gráficos se re-rendericen con las etiquetas
            await new Promise(resolve => setTimeout(resolve, 1500));

            const normaliza = f => (f instanceof Date ? f : new Date(typeof f === 'string' ? f : ''));
            await generarPDFUsuariosActivos({
                datos: {
                    resumenPeriodo: resumenNormalizado,
                    datosGrafico: datosGraficoNormalizados
                },
                rango: { desde: normaliza(fechaDesde), hasta: normaliza(fechaHasta) },
                tipoAgrupacion,
                agrupacionesDisponibles: obtenerAgrupacionesDisponibles(),
                usuario: obtenerMailUsuario(),
            });
        } catch (e) {
            manejarError('Error al generar PDF', e.message || 'Intente nuevamente');
        } finally {
            setGenerandoPdf(false);
        }
    };

    // Tarjetas resumen totales
    const totalContrataciones =
        (datosOriginales?.contratacionesLugares?.cantidadContrataciones || 0) +
        (datosOriginales?.contratacionesServicios?.cantidadContrataciones || 0);

    const totalDineroGanado =
        ((datosOriginales?.contratacionesLugares?.dineroGanado || 0) +
            (datosOriginales?.contratacionesServicios?.dineroGanado || 0)).toFixed(2);

    // Comisiones diarias
    const datosComisionesLugares = (datosOriginales?.contratacionesLugares?.comisionesDiarias || []).map(e => ({
        fecha: e.fecha,
        cantidad: e.cantidad,
        label: fechaToDDMMYYYY(e.fecha),
    }));

    const datosComisionesServicios = (datosOriginales?.contratacionesServicios?.comisionesDiarias || []).map(e => ({
        fecha: e.fecha,
        cantidad: e.cantidad,
        label: fechaToDDMMYYYY(e.fecha),
    }));

    // Proporción torta de contrataciones
    const datosProporcionContrataciones = datosOriginales?.proporcionContrataciones || [];

    // Top medios de pagos
    const datosMediosPago = datosOriginales?.topMedios || [];

    const validarRango = () => validarRangoCentral(fechaDesde, fechaHasta);

    const rangoTexto = `Mostrando datos desde ${fechaDesde ? fechaDesde.toLocaleDateString('es-AR') : ''} hasta ${fechaHasta ? fechaHasta.toLocaleDateString('es-AR') : ''}`;
    const mensajeFinanciero = `Esto fue lo que paso monetariamente desde ${fechaDesde ? fechaDesde.toLocaleDateString('es-AR') : ''} hasta ${fechaHasta ? fechaHasta.toLocaleDateString('es-AR') : ''}`;

    if (!fechasInicializadas) {
        return (
            <>
                <Navbar_Administrador />
                <ReportesBar onSolicitarRango={() => showReportesModal()} />
                <div className="reporte-container">
                    <div className='reporte-content'>
                        <div className='reporte-header'>
                            <h1 className="reporte-titulo">{tituloReporte}</h1>
                            <p className="reporte-subtitulo">{subtituloReporte}</p>
                        </div>
                        <div className="vca-no-dates-container">
                            <p>No se recibieron fechas. Volvé a abrir “Mis Reportes” y seleccioná un rango.</p>
                            <button
                                onClick={() => navigate(-1)}
                                className="vca-btn-back"
                            >Volver</button>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <Navbar_Administrador />
                <ReportesBar onSolicitarRango={() => showReportesModal()} />
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

    const validacion = validarRango();

    return (
        <>
            <Navbar_Administrador />
            <ReportesBar onSolicitarRango={() => showReportesModal()} />
            <div className='reporte-container'>
                <div className='reporte-content'>
                    <div className="reporte-top-section">
                        <div className='reporte-header'>
                            <h1 className="reporte-titulo">{tituloReporte}</h1>
                            <p className="reporte-subtitulo">{subtituloReporte}</p>
                        </div>
                        <div className='filtro-above filtro-fechas'>
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
                    {resumenNormalizado.length > 0 && (
                        <div className='vca-resumen-container'>
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
                    )}
                    <div className="rango-info-container">
                        <div className='rango-info'>
                            <span className="rango-texto">{rangoTexto}</span>
                        </div>
                    </div>
                    <div className={`chart-and-table-wrapper ${mostrarTabla ? 'with-table' : ''}`}>
                        <div className='chart-section-wrapper'>
                            <div className='reporte-chart-section'>
                                <div className="chart-header">
                                    <h3 className="chart-titulo">Cantidad de usuarios activos</h3>
                                    <div className="chart-filtros">
                                        <div className="agrupacion-btns">
                                            <div className="filtro-label-above">Agrupación</div>
                                            <div className='agrupacion-btn-wrapper'>
                                                {obtenerAgrupacionesDisponibles().map(tipo => (
                                                    <button
                                                        key={tipo}
                                                        className={`btn-filtro-grafico ${tipoAgrupacion === tipo ? 'activo' : ''}`}
                                                        onClick={() => handleCambioAgrupacion(tipo)}
                                                        disabled={cargando}
                                                    >
                                                        {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                    </div>
                                    <button
                                        className={`btn-toggle-tabla ${mostrarTabla ? 'active' : ''}`}
                                        onClick={() => setMostrarTabla(!mostrarTabla)}
                                    >
                                        {mostrarTabla ? 'Ocultar tabla' : 'Ver tabla'}
                                    </button>

                                </div>
                                <div className='reporte-chart-container'>
                                    {cargando ? (
                                        <div className="loading">Cargando gráfico...</div>
                                    ) : datosGraficoNormalizados.length > 0 ? (
                                        <GraficoLineal
                                            datos={datosGraficoNormalizados}
                                            titulo=""
                                            labelDataset={`Usuarios activos ${tipoAgrupacion === 'dia' ? 'diarios' : tipoAgrupacion === 'semana' ? 'semanales' : 'mensuales'}`}
                                            tipoAgrupacion={tipoAgrupacion}
                                            rangoFechas={{ desde: fechaDesde, hasta: fechaHasta }}
                                            mostrarTitulo={false}
                                        />
                                    ) : (
                                        <div className="grafico-sin-datos">
                                            <p>No hay datos disponibles para el rango seleccionado</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {mostrarTabla && datosGraficoNormalizados.length > 0 && (
                            <div className='table-section-wrapper'>
                                <div className='reporte-table-container vca-table-container'>
                                    <TablaReporte
                                        datos={datosGraficoNormalizados}
                                        tipoAgrupacion={tipoAgrupacion}
                                        tituloTabla={tituloTabla}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="rango-info-container">
                        <div className='rango-info'>
                            <span className="rango-texto">{mensajeFinanciero}</span>
                        </div>
                    </div>

                    {/* Bloque doble: Gráfico Pastel + Tarjetas resumen (contrataciones/dinero) */}
                    <div className="vca-double-card">
                        <div className="vca-double-left">
                            <GraficoTorta
                                datos={datosProporcionContrataciones}
                                titulo="Proporción de contrataciones"
                                height={310}
                                mostrarTitulo={true}
                                mostrarLeyenda={true}
                                mostrarEtiquetas={generandoPdf}
                            />
                        </div>
                        <div className="vca-double-right">
                            <TarjetaResumen
                                titulocabecera="Contrataciones Totales"
                                valorResumen={totalContrataciones}
                                descripcionInformativa="Suma de lugares y servicios"
                                icono="contratacion"
                                colorIcono="#2433FF"
                            />
                            <TarjetaResumen
                                titulocabecera="Dinero Ganado"
                                valorResumen={totalDineroGanado}
                                descripcionInformativa="Comisiones totales generadas"
                                icono="dinero"
                                colorIcono="#2433FF"
                            />
                        </div>
                    </div>

                    {/* Gráficos comisiones diarias (lugares y servicios) en tarjetas iguales */}
                    <div className="vca-comisiones-row">
                        <div className="vca-card-comision">
                            <GraficoLineal
                                datos={datosComisionesLugares}
                                titulo="Comisiones Diarias (Lugares)"
                                labelDataset="Lugares"
                                height={240}
                                tooltipCallbacks={{
                                    label: (ctx) =>
                                        ctx?.parsed?.y !== undefined
                                            ? `Lugares: $${ctx.parsed.y}`
                                            : ''
                                }}
                            />
                        </div>
                        <div className="vca-card-comision">
                            <GraficoLineal
                                datos={datosComisionesServicios}
                                titulo="Comisiones Diarias (Servicios)"
                                labelDataset="Servicios"
                                height={240}
                                tooltipCallbacks={{
                                    label: (ctx) =>
                                        ctx?.parsed?.y !== undefined
                                            ? `Servicios: $${ctx.parsed.y}`
                                            : ''
                                }}
                            />
                        </div>
                    </div>

                    {/* Barras de medios de pago */}
                    <div className="grafico-barras-medios-wrapper vca-bar-medios-card">
                        <GraficoBarras
                            datos={datosMediosPago}
                            titulo="Medios de pago más utilizados"
                            labelDataset="Veces Usado"
                            height={320}
                            mostrarTitulo={true}
                            mostrarEtiquetas={generandoPdf}
                        />
                    </div>
                </div>

                {
                    datosGraficoNormalizados.length > 0 && (
                        <button
                            className="btn-descargar-flotante"
                            onClick={handleDescargarReporte}
                            disabled={cargando || generandoPdf}
                        >
                            {generandoPdf ? 'Generando PDF...' : 'Descargar reporte'}
                        </button>
                    )
                }
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
