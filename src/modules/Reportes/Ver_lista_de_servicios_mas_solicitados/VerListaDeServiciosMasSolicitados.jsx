import { useState, useEffect, useMemo, useRef } from 'react';
import Navbar_Administrador from '../../../common/layouts/Navbar_Administrador';
import ReportesBar from '../src/components/ReportesBar';
import { useReportesModal } from '../src/ReportesModalContext';
import { useLocation, useNavigate } from 'react-router-dom';
import ModalError from '../../../common/layouts/ModalError';
// import ModalInfo from '../../../common/layouts/Modal_Info';
// import FiltroDesplegable from '../../../common/components/FiltroDesplegable';
import Pagination from '../../../common/layouts/Pagination';
// Migrado a generador genérico
import { generarPDFServiciosMasSolicitados } from '../src/pdf/generarPDFServicios';
import { getServiciosMasSolicitados, getFiltrosServiciosMasSolicitados, getTopProvinciasGlobal, getTopServiciosGlobal } from '../src/api/reportesApi';
import { toYMD, validarRangoFechas as validarRangoCentral } from '../src/utils/fechas';

import FiltrosReporte from '../src/components/FiltrosReporte';
import useSort from '../../Usuarios&Seguridad/Configuraciones/src/hooks/useSort';
import './src/assets/VerListaDeServiciosMasSolicitados.css';
import '../Visualizar_cantidad_de_usuarios_activos/src/assets/Reporte.css';
import '../../Usuarios&Seguridad/Configuraciones/Localidades/src/assets/Localidades.css';
import '../src/assets/FiltrosReporte.css';
import '../src/assets/BotónFlotante.css'

import { getLoggedUser } from '../../../common/Utils';
import TopProvinciasGlobal from './src/components/TopProvinciasGlobal';
import TopServiciosGlobal from './src/components/TopServiciosGlobal';
import ServiciosStatsCards from './src/components/ServiciosStatsCards';
import ServiciosChart from './src/components/ServiciosChart';

export default function VerListaDeServiciosMasSolicitados() {
  const { showReportesModal } = useReportesModal ? useReportesModal() : { showReportesModal: () => { } };
  const location = useLocation();
  const navigate = useNavigate();

  // Helper: parsea 'YYYY-MM-DD' en horario local (evita corrimiento por UTC)
  const parseFechaLocal = (str) => {
    if (!str || typeof str !== 'string') return null;
    const [y, m, d] = str.split('-').map(Number);
    if (!y || !m || !d) return null;
    return new Date(y, m - 1, d, 0, 0, 0, 0);
  };

  // =============== Estado filtros ubicaciones (carga asincrónica simulada) ===============
  const [provincias, setProvincias] = useState([]); // [{id,nombre}]
  const [localidades, setLocalidades] = useState([]); // listado completo de localidades filtrable
  const [provincia, setProvincia] = useState(null); // id o null (Todas)
  const [localidad, setLocalidad] = useState(null); // id o null (Todas)
  const [cargandoProvincias, setCargandoProvincias] = useState(false);
  const [cargandoLocalidades, setCargandoLocalidades] = useState(false);
  const filtrosLoadedRef = useRef(false);

  const STORAGE_FILTROS_KEY = 'reportes:servicios:filtros';
  const [fechaDesde, setFechaDesde] = useState(null);
  const [fechaHasta, setFechaHasta] = useState(null);
  const [fechasInicializadas, setFechasInicializadas] = useState(false);
  const [mostrarError, setMostrarError] = useState(false);
  const [mensajeError, setMensajeError] = useState('');
  // Info modal removido: usamos mensaje inline en la tabla cuando no hay datos
  const [cargando, setCargando] = useState(false);
  const [datosReporte, setDatosReporte] = useState(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const [cantidadMostrar, setCantidadMostrar] = useState(10);
  // Datos base (sin búsqueda)
  const serviciosFiltradosBase = useMemo(() => {
    if (!datosReporte || !datosReporte.resumen) return [];
    return datosReporte.resumen;
  }, [datosReporte]);

  // Ordenamiento reutilizando useSort (persistencia opcional con storageKey)
  const { sortedItems, sortConfig, handleSort } = useSort(serviciosFiltradosBase, { storageKey: 'reportes:serviciosmas:sort', resetPage: () => setPaginaActual(1) });

  // Paginación
  const totalPaginas = Math.ceil(sortedItems.length / cantidadMostrar) || 1;
  const inicio = (paginaActual - 1) * cantidadMostrar;
  const fin = inicio + cantidadMostrar;
  const itemsToShow = sortedItems.slice(inicio, fin);

  const validarRangoFechas = () => validarRangoCentral(fechaDesde, fechaHasta);

  // Inicializar fechas desde query params (?desde=YYYY-MM-DD&hasta=YYYY-MM-DD)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const d = params.get('desde');
    const h = params.get('hasta');
    if (d && h) {
      const fd = parseFechaLocal(d);
      const fh = parseFechaLocal(h);
      if (fd && fh) {
        setFechaDesde(fd);
        setFechaHasta(fh);
        setFechasInicializadas(true);
      } else {
        setFechasInicializadas(false);
      }
    } else {
      setFechasInicializadas(false);
    }
  }, [location.search]);

  // Consumimos backend real para filtros y datos

  // ======================= Fetch Simulado (reemplazar por llamadas reales) =======================
  // Carga filtros desde backend (provincias y localidades)
  useEffect(() => {
    let mounted = true;
    const cargarFiltros = async () => {
      setCargandoProvincias(true);
      try {
        const data = await getFiltrosServiciosMasSolicitados();
        if (!mounted) return;
        setProvincias(Array.isArray(data) ? data : []);
        // aplanar localidades y anotar provinciaId para filtrado
        const flatLocs = (Array.isArray(data) ? data : []).flatMap(p => (p.localidades || []).map(l => ({ ...l, provinciaId: p.id })));
        setLocalidades(flatLocs);

        // Validar valores guardados en storage contra datos actuales
        if (provincia != null && !data.find(p => p.id === provincia)) {
          setProvincia(null);
        }
        if (localidad != null) {
          const pertenece = flatLocs.find(l => l.id === localidad && (provincia == null || l.provinciaId === provincia));
          if (!pertenece) setLocalidad(null);
        }
      } catch (e) {
        if (!mounted) return;
        setProvincias([]);
        setLocalidades([]);
        setMostrarError(true);
        setMensajeError(e?.status === 401
          ? 'Sesión expirada o sin permisos para cargar filtros. Iniciá sesión nuevamente.'
          : 'No se pudieron cargar los filtros de provincias/localidades.');
      } finally {
        if (mounted) setCargandoProvincias(false);
      }
    };
    cargarFiltros();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ======================= Persistencia filtros (provincia/localidad) =======================
  // Leer al montar antes de fetch
  useEffect(() => {
    if (filtrosLoadedRef.current) return;
    filtrosLoadedRef.current = true;
    try {
      const raw = localStorage.getItem(STORAGE_FILTROS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed) {
          if (parsed.provinciaId !== undefined) setProvincia(parsed.provinciaId);
          if (parsed.localidadId !== undefined) setLocalidad(parsed.localidadId);
        }
      }
    } catch { /* noop */ }
  }, []);

  // Guardar en cambios
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_FILTROS_KEY, JSON.stringify({ provinciaId: provincia, localidadId: localidad }));
    } catch { /* noop */ }
  }, [provincia, localidad]);

  // Validar localidad al cambiar provincia (sin llamadas extra)
  useEffect(() => {
    setCargandoLocalidades(true);
    try {
      if (localidad != null) {
        const listaFiltrada = localidades.filter(l => provincia ? l.provinciaId === provincia : true);
        if (!listaFiltrada.find(l => l.id === localidad)) {
          setLocalidad(null);
        }
      }
    } finally {
      setCargandoLocalidades(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provincia, localidades]);

  // Si la provincia vuelve a 'Todas', garantizar que localidad también sea 'Todas'
  useEffect(() => {
    if (provincia == null && localidad != null) {
      setLocalidad(null);
    }
  }, [provincia, localidad]);

  const cargarDatos = async () => {
    if (!fechaDesde || !fechaHasta) return;
    const valid = validarRangoFechas();
    if (!valid.esValido) return;
    setCargando(true);
    setMostrarError(false);
    try {
      const apiResp = await getServiciosMasSolicitados({
        desde: fechaDesde,
        hasta: fechaHasta,
        provinciaId: provincia ?? null,
        localidadId: localidad ?? null
      });
      // Mapear respuesta del backend a la estructura usada por la UI/PDF
      const resumen = Array.isArray(apiResp)
        ? apiResp.map(item => ({ servicio: item.nombreTipoServicio, cantidad: item.cantidad }))
        : [];
      const res = { resumen };
      setDatosReporte(res);
      setPaginaActual(1);
      // Si no hay datos, lo indicamos con el mensaje inline de la tabla (sin popup)
    } catch (e) {
      setMostrarError(true);
      setMensajeError(e?.status === 401
        ? 'Sesión expirada o sin permisos para ver este reporte. Iniciá sesión nuevamente.'
        : 'Ocurrió un problema al cargar los datos...');
    } finally {
      setCargando(false);
    }
  };

  // Cargar datos cuando las fechas quedan listas
  useEffect(() => { cargarDatos(); /* eslint-disable-next-line */ }, [fechaDesde, fechaHasta, provincia, localidad]);

  const handleBuscar = cargarDatos; // mantener referencia por si se agrega un botón

  const [isPdfMode, setIsPdfMode] = useState(false);

  // Generar PDF usando generador centralizado
  const handleDescargarReporte = async () => {
    if (!datosReporte || !datosReporte.resumen?.length) {
      setMostrarError(true);
      setMensajeError('No hay datos para exportar');
      return;
    }
    try {
      setCargando(true);
      setIsPdfMode(true);

      // Wait for re-render and canvas update
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Capture charts as images
      const globalStatsEl = document.getElementById('global-stats-section');
      const filteredStatsEl = document.getElementById('filtered-stats-section');

      let globalStatsImg = null;
      let filteredStatsImg = null;

      if (globalStatsEl) {
        const canvas = await import('html2canvas').then(m => m.default(globalStatsEl, { scale: 2, useCORS: true }));
        globalStatsImg = canvas.toDataURL('image/png');
      }

      if (filteredStatsEl) {
        const canvas = await import('html2canvas').then(m => m.default(filteredStatsEl, { scale: 2, useCORS: true }));
        filteredStatsImg = canvas.toDataURL('image/png');
      }

      const normaliza = f => (f instanceof Date ? f : new Date(typeof f === 'string' ? f : ''));
      const usuarioEmail = (getLoggedUser() || {}).email || 'usuario@demo.com';

      await generarPDFServiciosMasSolicitados({
        datos: datosReporte, // No need to pass global stats as text anymore since we have the image
        rango: { desde: normaliza(fechaDesde), hasta: normaliza(fechaHasta) },
        usuario: usuarioEmail,
        images: {
          globalStats: globalStatsImg,
          filteredStats: filteredStatsImg
        }
      });
    } catch (e) {
      console.error(e);
      setMostrarError(true);
      setMensajeError('Error al generar PDF');
    } finally {
      setIsPdfMode(false);
      setCargando(false);
    }
  };

  if (!fechasInicializadas) {
    return (
      <>
        <Navbar_Administrador />
        <ReportesBar onSolicitarRango={() => showReportesModal()} />
        <div className='reporte-container'>
          <div className='reporte-content'>
            <div className='reporte-header'>
              <h1 className='reporte-titulo'>Reporte de servicios más solicitados</h1>
              <p className='reporte-subtitulo'>Identificá los servicios con mayor demanda en el período consultado.</p>
            </div>
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#666' }}>
              <p>No se recibieron fechas. Abrí "Mis Reportes" y seleccioná un rango.</p>
              <button onClick={() => showReportesModal()} style={{ marginTop: 16, padding: '10px 22px', background: '#2433FF', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer' }}>Seleccionar rango</button>
            </div>
          </div>
        </div>
      </>
    );
  }

  const validacion = validarRangoFechas();

  return (
    <>
      <Navbar_Administrador />
      <ReportesBar onSolicitarRango={() => showReportesModal()} />
      <div className='reporte-container'>
        <div className='reporte-content'>
          <div className='reporte-header'>
            <h1 className='reporte-titulo'>Reporte de servicios más solicitados</h1>

            <p className='reporte-subtitulo'>Identificá los servicios con mayor demanda en el período consultado.</p>
          </div>

          {/* Global Stats Section */}
          <div className="global-stats-section" id="global-stats-section" style={{ display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <TopProvinciasGlobal />
            <TopServiciosGlobal showLabels={isPdfMode} />
          </div>

          {datosReporte && validacion.esValido && (
            <div className='rango-info-container'>
              <div className='rango-info'>
                <span className='rango-texto'>
                  Mostrando datos desde {fechaDesde.toLocaleDateString('es-AR')} hasta {fechaHasta.toLocaleDateString('es-AR')}
                </span>
              </div>
            </div>
          )}

          {/* Barra de filtros completa (fecha desde/hasta + aplicar + provincia/localidad) */}
          <div className='reporte-chart-section' style={{ marginTop: 8 }}>
            <div className='tabla-reporte-container' style={{ padding: '16px 16px 12px', marginBottom: 0 }}>
              <h3 className='chart-titulo' style={{ margin: '0 0 14px', fontWeight: 600 }}>Servicios</h3>
              <div className='servicios-filtros' style={{ width: '100%' }}>

                {/* Provincia */}
                <div className='filtro-item filtro-provincia'>
                  <label style={{ fontSize: 11, fontWeight: 600, color: '#374151', marginBottom: 4, letterSpacing: .5 }}>Provincia</label>
                  <select
                    className='loc-select-provincia'
                    style={{ height: 44 }}
                    disabled={cargandoProvincias || cargando}
                    value={provincia ?? ''}
                    onChange={e => {
                      const value = e.target.value;
                      if (value === '') { setProvincia(null); setLocalidad(null); return; }
                      const id = Number(value);
                      setProvincia(Number.isNaN(id) ? null : id);
                      setLocalidad(null); // reset localidad al cambiar provincia
                    }}
                  >
                    <option value=''>Todas</option>
                    {provincias.map(p => <option key={p.id} value={p.id} title={p.nombre}>{p.nombre}</option>)}
                  </select>
                </div>
                {/* Localidad */}
                <div className='filtro-item filtro-localidad'>
                  <label style={{ fontSize: 11, fontWeight: 600, color: '#374151', marginBottom: 4, letterSpacing: .5 }}>
                    Localidad
                    {provincia == null && (
                      <span className='tooltip-wrapper' style={{ marginLeft: 4 }}>
                        <span className='tooltip-badge'>i</span>
                        <span className='tooltip-content'>
                          <span className='tooltip-arrow'></span>
                          Selecciona una provincia
                        </span>
                      </span>
                    )}
                  </label>
                  <div>
                    <select
                      className='loc-select-provincia loc-select-localidad'
                      style={{ height: 44 }}
                      aria-disabled={provincia == null}
                      disabled={cargandoLocalidades || cargandoProvincias || cargando}
                      value={localidad ?? ''}
                      onChange={e => {
                        if (provincia == null) return; // bloquear cambio si provincia es "Todas"
                        const value = e.target.value;
                        if (value === '') { setLocalidad(null); return; }
                        const id = Number(value);
                        setLocalidad(Number.isNaN(id) ? null : id);
                      }}
                    >
                      <option value=''>Todas</option>
                      {localidades
                        .filter(l => provincia ? l.provinciaId === provincia : true)
                        .map(l => (
                          <option key={l.id} value={l.id} title={l.nombre}>{l.nombre}</option>
                        ))}
                    </select>
                  </div>
                </div>
                {/* Fechas + aplicar (compacto) */}
                <div className='reporte-servicios-fechas-box filtro-fechas'>
                  <div className='reporte-servicios-fechas'>
                    <FiltrosReporte
                      fechaDesde={fechaDesde}
                      fechaHasta={fechaHasta}
                      onFiltrosChange={({ fechaDesde: fd, fechaHasta: fh }) => {
                        if (fd) setFechaDesde(fd);
                        if (fh) setFechaHasta(fh);
                      }}
                      onAplicarFiltros={cargarDatos}
                      validacion={validacion}
                      cargando={cargando}
                      modoCompacto={true}
                    />
                  </div>
                </div>
              </div>


              {/* Filtered Stats & Chart */}
              {datosReporte && datosReporte.resumen && (
                <div className="filtered-stats-section" id="filtered-stats-section" style={{ marginTop: '20px' }}>
                  <ServiciosStatsCards data={datosReporte.resumen} />
                  <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                    <ServiciosChart data={datosReporte.resumen} showLabels={isPdfMode} />
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
        {datosReporte && (
          <button
            className='btn-descargar-flotante'
            onClick={handleDescargarReporte}
            disabled={cargando}
          >
            Descargar reporte
          </button>
        )}

        {/* Modales */}
        <ModalError
          mostrar={mostrarError}
          mensaje={mensajeError}
          onCerrar={() => {
            // Si el mensaje es por "No hay datos para exportar", sólo cerrar el modal
            if (mensajeError === 'No hay datos para exportar') {
              setMostrarError(false);
            } else {
              navigate('/');
            }
          }}
        />
      </div> {/* cierre reporte-container */}
    </>
  );
}