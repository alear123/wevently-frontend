import { useState, useMemo,useEffect } from "react";
import useSort from '../../Usuarios&Seguridad/Configuraciones/src/hooks/useSort';
import { formatDias, formatBytes, parseHumanSize } from '../../Usuarios&Seguridad/Configuraciones/src/utils/formatters.js';
import Header from '../../../common/layouts/Navbar_Administrador.jsx';
import Buscador from '../../../common/components/Buscador';
import Pagination from '../../../common/layouts/Pagination.jsx';
import ModalConfirmarEliminar from '../../../common/layouts/ModalConfirmarEliminar.jsx';
import SuccessAlert from '../../../common/layouts/SuccessAlert.jsx';
import ModalConfirmarDescarga from '../../../common/layouts/ModalConfirmarDescarga.jsx';
import ModalConfirmarRestauracion from "../../../common/layouts/ModalConfimarRestauracion.jsx";
import ModalAccionExito from "../../../common/layouts/ModalAccionExito.jsx";
import Modal_Error from '../../../common/layouts/ModalError.jsx';
import Breadcrumbs from '../../../common/layouts/Breadcrumbs.jsx';
// Componentes genéricos de configuraciones
import ModalAM from '../../Usuarios&Seguridad/Configuraciones/src/components/ModalAM.jsx';
import TablaABM from '../../Usuarios&Seguridad/Configuraciones/src/components/TablaABM.jsx';
// Estilos ABM compartidos
import '../../Usuarios&Seguridad/Configuraciones/src/assets/abm-shared.css';
import 'react-datepicker/dist/react-datepicker.css';
import DatePicker from 'react-datepicker';
import { getBackups,createBackup,cancelarBackup,eliminarBackup,descargarBackup,restaurarBackup,updateBackup,rehabilitarBackup   } from "./src/api/ABMBackupsApi.js";


const ABMBackups = () => {
  // Opciones del filtro desplegable de estado
  const statusOptions = ["ACTIVA","INACTIVA"]
  const [mostrarError, setMostrarError] = useState(false);
  const [mensajeError, setMensajeError] = useState("");
  const [tituloError, setTituloError] = useState("Error");

  const mostrarModalError = (titulo, mensaje) => {
    setTituloError(titulo);
    setMensajeError(mensaje);
    setMostrarError(true);
  };

  const cargarBackups = async () => {
    try {
      const data = await getBackups();
      const adaptados = data.map(b => ({
        id: b.idBackup,
        nombre: b.nombre,
        creado: b.fechaProgramada ? b.fechaProgramada.split("T")[0] : "",
        estado: b.estado || "PENDIENTE",
        retencionDias: b.retencion,
        frecuencia: b.frecuencia || "—",
        backupsFisicos: b.backupsfisicos?.map(f => ({
          id: f.idBF,
          nombre: f.nombreBF,
          creado: f.fechaHoraBF ? f.fechaHoraBF.split("T")[0] : "",
          estado: f.estadoBF,
          tamañoMB: f.tamañoBF
        })) || []
      }));
      setBackups(adaptados);
    } catch (err) {
      console.error("Error cargando backups:", err);
    }
  };
  // Estados para los filtros
  const [filtro, setFiltro] = useState("") // Texto del buscador
  const [paginaActual, setPaginaActual] = useState(1) // Página actual para paginación
  const [estadoSeleccionado, setEstadoSeleccionado] = useState("")
  const [fechaDesde, setFechaDesde] = useState("")
  const [fechaHasta, setFechaHasta] = useState("")
  const [cantidadMostrar, setCantidadMostrar] = useState(10) // Cantidad de items a mostrar por página
  const [backups, setBackups] = useState([]); // Estado para los backups
  const [selectsRestaurar, setSelectsRestaurar] = useState({});

  useEffect(() => {
    cargarBackups();
  }, []);

  const backupsPorConfiguracion = useMemo(() => {
    const grupos = {};
    backups.forEach(b => {
      const clave = b.nombre; // ⚠️ cambiá esto a b.idConfiguracionBackup si tenés ese campo
      if (!grupos[clave]) grupos[clave] = [];
      grupos[clave].push(b);
    });
    // Ordenar cada grupo por fecha descendente
    Object.keys(grupos).forEach(k => {
      grupos[k].sort((a, b) => new Date(b.creado) - new Date(a.creado));
    });
    return grupos;
  }, [backups]);

  // ModalAM (crear / editar)
  const [modalBackup, setModalBackup] = useState({ mostrar:false, modo:'crear', item:null });

  // Confirmaciones (reutilizamos las existentes para cancelar / eliminar / descargar)

  const [mostrarAlertaCrear, setMostrarAlertaCrear] = useState(false)
  const [mensajeAlertaCrear, setMensajeAlertaCrear] = useState("")

  // Filtrado de backups (previo a ordenamiento)
  const backupsFiltrados = backups.filter((backup) => {
    const texto = filtro.toLowerCase()
    const coincideTexto = backup.nombre.toLowerCase().includes(texto)
    const coincideEstado = estadoSeleccionado === "" || backup.estado === estadoSeleccionado
    const fechaCreacion = new Date(backup.creado) // Convertir la fecha de creación a un objeto Date
    const dentroDeRango =
      (!fechaDesde || new Date(fechaDesde) <= fechaCreacion) && (!fechaHasta || fechaCreacion <= new Date(fechaHasta))
    return coincideTexto && coincideEstado && dentroDeRango
  })

  // Ordenamiento reutilizable (ciclo asc -> desc -> neutral) con persistencia
  const { sortConfig, sortedItems: backupsOrdenados, handleSort } = useSort(backupsFiltrados, { resetPage: () => setPaginaActual(1), storageKey: 'sort:backups' });

  // Paginación
  const totalItems = backupsOrdenados.length // Total de backups luego del filtrado y ordenamiento
  const totalPaginas = Math.ceil(totalItems / cantidadMostrar) // Total de páginas
  const inicio = (paginaActual - 1) * cantidadMostrar // Primer índice de la página actual
  const fin = inicio + cantidadMostrar // Último índice
  const backupsPaginados = backupsOrdenados.slice(inicio, fin) // backups a mostrar en la página actual

  // Estado para el modal de confirmación de eliminación
  const [mostrarModalCancelar, setMostrarModalCancelar] = useState(false)
  const [backupACancelar, setBackupACancelar] = useState(null)
  // Estado para mostrar la alerta de elimiación
  const [mostrarAlertaCancelar, setMostrarAlertaCancelar] = useState(false)
  const [mensajeAlertaCancelar, setMensajeAlertaCancelar] = useState("")

  // Funciones para manejar la eliminación de backups
  const handleCancelarClick = (backup) => {
    setBackupACancelar(backup)
    setMostrarModalCancelar(true)
  }

  // Funciones para manejar la confirmación y cancelación de eliminación
  const handleConfirmarCancelar = async () => {
    if (!backupACancelar) return;

    try {
      const backupActualizado = await cancelarBackup(backupACancelar.id);

      await cargarBackups();

      setMostrarModalCancelar(false);
      setBackupACancelar(null);
      setMostrarAlertaCancelar(true);
      setMensajeAlertaCancelar(`Backup "${backupActualizado.nombre}" cancelado exitosamente.`);
    } catch (error) {
      console.error("Error cancelando backup:", error);
      mostrarModalError("Error al cargar backups", "No se pudieron cargar los backups. Por favor, intenta nuevamente.")
    }
  };


  const handleCancelarCancelar = () => {
    setBackupACancelar(null)
    setMostrarModalCancelar(false)
  }

  // Estado para el modal de confirmación de Descarga
  const [mostrarModalDescarga, setMostrarModalDescarga] = useState(false)
  const [backupADescargar, setBackupADescargar] = useState(null)
  const [mostrarAlertaDescarga, setMostrarAlertaDescarga] = useState(false)
  const [mensajeAlertaDescarga, setMensajeAlertaDescarga] = useState("")

  const handleDescargaClick = (backup) => {
    setBackupADescargar(backup)
    setMostrarModalDescarga(true)
  }

  const handleConfirmarDescarga = async () => {
    if (backupADescargar) {
      try {
        await descargarBackup(backupADescargar.id);
        setMostrarModalDescarga(false);
        setMostrarAlertaDescarga(true);
        setMensajeAlertaDescarga(`Backup "${backupADescargar.nombre}" descargado exitosamente.`);
      } catch (error) {
        console.error("Error descargando backup:", error);
        alert("No se pudo descargar el backup. Ver consola para más detalles.");
      }
    }
  };

  const handleCancelarDescarga = () => {
    setBackupADescargar(null)
    setMostrarModalDescarga(false)
  }

  const handleRehabilitarClick = async (backup) => {
    try {
      await rehabilitarBackup(backup.id);
      await cargarBackups();
      setMensajeExito(`Backup "${backup.nombre}" rehabilitado exitosamente.`);
      setMostrarModalExito(true);
    } catch (error) {
      console.error("Error rehabilitando backup:", error);
      mostrarModalError("Error rehabilitando backup", "Ocurrió un problema al rehabilitar el backup. Intentalo más tarde.");
    }
  };

  // Funciones para manejar la creación de nuevo backup
  const handleNuevoBackupClick = () => {
    setModalBackup({ mostrar:true, modo:'crear', item:null });
  };

  const [mostrarModalEliminar, setMostrarModalEliminar] = useState(false)
  const [backupAEliminar, setBackupAEliminar] = useState(null)
  const [mostrarAlertaEliminar, setMostrarAlertaEliminar] = useState(false)
  const [mensajeAlertaEliminar, setMensajeAlertaEliminar] = useState("")
  // Estado para mostrar modal de éxito al rehabilitar
  const [mostrarModalExito, setMostrarModalExito] = useState(false);
  const [mensajeExito, setMensajeExito] = useState("");

  const handleEliminarClick = (backup) => {
    setBackupAEliminar(backup)
    setMostrarModalEliminar(true)
  }

  const handleConfirmarEliminar = async  () => {
    if (!backupAEliminar) return;

    try {
      await eliminarBackup(backupAEliminar.id);

      // Actualizar el estado local
      setBackups((prev) => prev.filter((b) => b.id !== backupAEliminar.id));

      setBackupAEliminar(null);
      setMostrarModalEliminar(false);
      setMostrarAlertaEliminar(true);
      setMensajeAlertaEliminar(`Backup "${backupAEliminar.nombre}" eliminado exitosamente.`);
    } catch (error) {
      console.error("Error eliminando backup:", error);
      mostrarModalError("Error eliminando backup", "Ocurrió un problema al eliminar el backup. Intentalo más tarde.");
    }
  }

  const handleCancelarEliminar = () => {
    setBackupAEliminar(null)
    setMostrarModalEliminar(false)
  }

  const handleModificarClick = (backup) => {
    // Adaptamos item para ModalAM (retencion como número y fechaProgramada ya ISO)
    setModalBackup({ mostrar:true, modo:'editar', item: { ...backup, retencion: backup.retencionDias } });
  };

  // Campos usados por ModalAM
  const camposBackup = useMemo(() => [
    {
      nombre: 'nombre',
      label: 'Nombre *',
      placeholder: 'Ej: Semanal',
      requerido: true,
      validacion: (v) => {
        if (!v?.trim()) return 'Campo requerido';
        const len = v.trim().length;
        if (len < 3 || len > 15) return 'Entre 3 y 15 caracteres';
        return '';
      }
    },
    {
      nombre: 'retencion',
      label: 'Retención (días) *',
      tipo: 'number',
      placeholder: 'Ej: 30',
      requerido: true,
      validacion: (v) => {
        if (v === '' || v === null || v === undefined) return 'Campo requerido';
        const n = Number(v);
        if (Number.isNaN(n) || n <= 0) return 'Debe ser un número > 0';
        return '';
      }
    },
    {
      nombre: 'frecuencia',
      label: 'Frecuencia *',
      tipo: 'select',
      opciones: [
        { valor: 'DIARIO', label: 'Diario' },
        { valor: 'SEMANAL', label: 'Semanal' },
        { valor: 'MENSUAL', label: 'Mensual' }
      ],
      requerido: modalBackup.modo === 'crear',
      disabled: modalBackup.modo === 'editar',
      validacion: (v) => modalBackup.modo === 'crear' ? (!v ? 'Seleccione una frecuencia' : '') : ''
    },
    {
      nombre: 'fechaProgramada',
      label: 'Programar para *',
      tipo: 'component',
      requerido: modalBackup.modo === 'crear', 
      disabled: modalBackup.modo === 'editar',
      componente: function DatePickerField({ value, onChange }) {
        const selected = value ? new Date(value) : null;
        const minDate = new Date(Date.now() + 24*60*60*1000);
        return (
          <DatePicker
            selected={selected}
            onChange={(d) => onChange(d ? d.toISOString().split('T')[0] : '')}
            dateFormat="dd/MM/yyyy"
            minDate={minDate}
            placeholderText="Seleccionar fecha"
            className="form-control abm-pill-input"
            disabled={modalBackup.modo === 'editar'}
          />
        );
      },
      validacion: (v) => modalBackup.modo === 'crear' 
      ? (!v ? 'Seleccione una fecha' : new Date(v) <= new Date() ? 'Debe ser posterior a hoy' : '') 
      : ''
  }
], [modalBackup.modo]);

  const onSaveBackup = async (datos) => {
  try {
    if (modalBackup.modo === "crear") {
      const dto = {
        nombre: datos.nombre.trim(),
        retencion: Number(datos.retencion),
        fechaProgramada: `${datos.fechaProgramada}T00:00:00`,
        frecuencia: datos.frecuencia,
      };

      await createBackup(dto);

      await cargarBackups(); // 🔄 recargar backups
      setMensajeAlertaCrear(`Backup "${dto.nombre}" creado exitosamente.`);
      setMostrarAlertaCrear(true);
      setModalBackup({ mostrar: false, modo: 'crear', item: null });
    } else if (modalBackup.modo === "editar" && modalBackup.item) {
          const dto = {
      nombre: datos.nombre.trim(),
      retencion: Number(datos.retencion)
    };

      await updateBackup(modalBackup.item.id, dto);

      await cargarBackups(); // 🔄 recargar backups
      setMensajeAlertaCrear(`Backup "${dto.nombre}" modificado exitosamente.`);
      setMostrarAlertaCrear(true);
      setModalBackup({ mostrar: false, modo: 'crear', item: null });
    }
  } catch (error) {
    console.error("Error al guardar backup:", error);
    mostrarModalError("Error guardando backup", "Ocurrió un problema al guardar el backup. Intentalo más tarde.");
  }
};



  const onCloseModalBackup = () => setModalBackup({ mostrar:false, modo:'crear', item:null });


  const [mostrarAlertaRestaurar, setMostrarAlertaRestaurar] = useState(false);
  const [mensajeAlertaRestaurar, setMensajeAlertaRestaurar] = useState("");
  const [mostrarModalRestaurar, setMostrarModalRestaurar] = useState(false);
  const [backupARestaurar, setBackupARestaurar] = useState(null);

  const handleRestaurarClick = (backup) => {
    setBackupARestaurar(backup);
    setMostrarModalRestaurar(true);
  };

  const handleConfirmarRestaurar = async () => {
    if (!backupARestaurar) return;
    try {
      setMostrarModalRestaurar(false);
      await restaurarBackup(backupARestaurar.id);
      //setMostrarAlertaRestaurar(true);
      //setMensajeAlertaRestaurar(      `Backup "${backupARestaurar.nombre}" restaurado correctamente. ` +
      //`La aplicación se reiniciará automáticamente.`);
      setTimeout(() => {
        window.location.reload(); // O recargar solo los backups
      }, 100);
    } catch (error) {
      console.error("Error restaurando backup:", error);
      mostrarModalError("Error restaurando backup", "Ocurrió un problema al restaurar el backup. Intentalo más tarde.");
    } finally {
      setBackupARestaurar(null);
    }
  };

  const handleCancelarRestaurar = () => {
    setBackupARestaurar(null);
    setMostrarModalRestaurar(false);
  };


  // Columnas para TablaABM
  const columnas = useMemo(() => [     
    { key:'nombre', header:'Nombre', sortable:true },
    { key:'creado', header:'Fecha programada', sortable:true },
    { key:'estado', header:'Estado', sortable:true, render: (item) => {
        const base = item.estado.toLowerCase();
        const cls = base.includes('pendiente') ? 'method-put' : base.includes('inactiva') ? 'method-delete' : base.includes('completado') ? 'method-post' : 'method-get';
        return <span className={`permission-method ${cls}`} style={{ fontSize: '.65rem' }}>{item.estado}</span>;
      } },
  { key:'retencionDias', header:'Retención', sortable:true, render: (item) => formatDias(item.retencionDias) },
  {
  key: 'frecuencia',
  header: 'Frecuencia',
  sortable: true,
  render: (item) => (
    <span
      className="permission-method method-gray"
      style={{ fontSize: '.65rem' }}
    >
      {item.frecuencia}
    </span>
  )
}

  ], []);

  const accionesCol = {
  header: 'Acciones',
  render: (item) => (
    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
      {item.estado.toUpperCase() === 'ACTIVA' && (
        <button
          className="abm-action-btn cancel"
          onClick={() => handleCancelarClick(item)}
          title="Cancelar"
        >
          Cancelar
        </button>
      )}
      {item.estado.toUpperCase() === 'INACTIVA' && (
        <button
          className="abm-action-btn rehabilitar"
          onClick={() => handleRehabilitarClick(item)}
          title="Rehabilitar"
        >
          Rehabilitar
        </button>
      )}
      {item.estado.toUpperCase() === 'ACTIVA' && (
        <button
          className="abm-action-btn edit"
          onClick={() => handleModificarClick(item)}
          title="Modificar"
        >
          Modificar
        </button>
      )}

      {/* Select para restaurar backup físico */}
      <select
        className="form-control"
        style={{ width: 'auto', fontSize: '.75rem', marginLeft: '8px' }}
        value={selectsRestaurar[item.id] || ""}
        onChange={(e) => {
          const valor = e.target.value;
          const seleccionado = item.backupsFisicos?.find(b => b.id === Number(valor));

          if (seleccionado && seleccionado.estado === "COMPLETADO") {
            handleRestaurarClick({
              id: seleccionado.id,
              nombre: item.nombre,
              fecha: seleccionado.creado,
            });
            setSelectsRestaurar(prev => ({ ...prev, [item.id]: "" }));
          } else if (seleccionado) {
            mostrarModalError("Error restaurando backup", "Solo se pueden restaurar backups completados.");
            setSelectsRestaurar(prev => ({ ...prev, [item.id]: "" }));
          }
        }}
      >
        <option value="" disabled>Seleccionar backup físico a restaurar</option>
        {item.backupsFisicos?.length > 0 ? (
          item.backupsFisicos.map(b => (
            <option key={b.id} value={b.id}>
              {`${b.creado} - ${b.estado}`}
            </option>
          ))
        ) : (
          <option disabled>No hay backups físicos</option>
        )}
      </select>
    </div>
  )
};


  // Eliminado modal de filtros, se usan filtros inline

  const labelStyle = { fontSize: '.70rem', fontWeight: 600, marginBottom: 4, color:'#374151', letterSpacing:.3 }; 



  return (
    <>
    <Header />
    <div className="abm-page">
      <div className="container-fluid py-2">
        <Breadcrumbs />
      </div>
      <div className="abm-card">
        {/* Estilos locales MINIMOS: alinear todos los filtros en una única fila sin que el buscador se expanda */}
        <style>{`
          .abm-controls.backups-controls { justify-content:flex-start; flex-wrap:nowrap; gap:16px; overflow-x:auto; }
          /* Buscador (izquierda) */
          .backups-search { flex:0 0 auto; width:260px; margin-top:22px; }
          .backups-search .search-container { flex:none !important; width:100% !important; max-width:100% !important; min-width:0 !important; }
          .backups-search .search-input { height:44px; padding:12px 40px 12px 16px; border-radius:14px; }
          /* Grupo derecha */
          .backups-right-group { margin-left:auto; display:flex; flex-wrap:nowrap; gap:16px; align-items:flex-end; }
          .backups-right-group .abm-inline-field { display:flex; flex-direction:column; gap:4px; flex:0 0 auto; }
          .backups-right-group .compact-date { width:170px; }
          .backups-right-group .estado { width:140px; }
          .backups-right-group .acciones { width:auto; }
          /* Aumentamos ligeramente el tamaño de las etiquetas de los filtros derechOS */
          .backups-right-group label { font-size:.8rem; font-weight:600; color:#374151; }
          .backups-right-group .abm-pill-input, .backups-right-group .react-datepicker-wrapper input.abm-pill-input { height:44px; }
          .backups-right-group .react-datepicker-wrapper { flex:0 0 auto; }
          /* Botón de descarga con SVG */
          .download-icon-btn .abm-download-svg { width:16px; height:16px; stroke:#ffffff; stroke-width:2.1; stroke-linecap:round; stroke-linejoin:round; fill:none; }
          .download-icon-btn:disabled .abm-download-svg { stroke:#d1d5db; }
          /* Responsive: si el ancho no alcanza, permitir scroll horizontal antes que wrap */
          @media (max-width: 960px){
            .abm-controls.backups-controls { gap:12px; }
          }
          @media (max-width: 760px){
            .backups-right-group { gap:12px; }
          }
          @media (max-width: 640px){
            .abm-controls.backups-controls { flex-wrap:wrap; }
            .backups-right-group { margin-left:0; flex-wrap:wrap; }
            .backups-search { width:100%; }
          }
        `}</style>

        <h1 className="page-title">Gestionar backups</h1>
        <div className="abm-controls backups-controls">
          <div className="abm-inline-field backups-search" style={{display:'flex', flexDirection:'column', justifyContent:'flex-end'}}>
            <Buscador
              placeholder="Buscar backup"
              value={filtro}
              onChange={(txt)=>{ setFiltro(txt); setPaginaActual(1); }}
              filtrarMientrasEscribes={true}
              useSharedStyles={true}
              width={260}
            />
          </div>
          <div className="backups-right-group">
            <div className="abm-inline-field compact-date">
              <label>Fecha desde</label>
              <DatePicker
                selected={fechaDesde ? new Date(fechaDesde) : null}
                onChange={(d)=>{ setFechaDesde(d? d.toISOString().split('T')[0]: ''); setPaginaActual(1); }}
                dateFormat='dd/MM/yyyy'
                placeholderText='Seleccionar'
                className='form-control'
                isClearable
              />
            </div>
            <div className="abm-inline-field compact-date">
              <label>Fecha hasta</label>
              <DatePicker
                selected={fechaHasta ? new Date(fechaHasta) : null}
                onChange={(d)=>{ setFechaHasta(d? d.toISOString().split('T')[0]: ''); setPaginaActual(1); }}
                dateFormat='dd/MM/yyyy'
                placeholderText='Seleccionar'
                className='form-control'
                isClearable
                minDate={fechaDesde ? new Date(fechaDesde) : undefined}
              />
            </div>
            <div className="abm-inline-field estado">
              <label>Estado</label>
              <select
                className='form-control'
                value={estadoSeleccionado}
                onChange={(e)=>{ setEstadoSeleccionado(e.target.value); setPaginaActual(1); }}
              >
                <option value="">Todos</option>
                {statusOptions.map(op => <option key={op} value={op}>{op}</option>)}
              </select>
            </div>
            <div className="abm-inline-field acciones" style={{ minWidth:120 }}>
              <label style={{ visibility:'hidden' }}>_</label>
              <button className="abm-primary-btn" onClick={handleNuevoBackupClick} style={{ whiteSpace:'nowrap' }}>Nuevo Backup</button>
            </div>
          </div>
        </div>
        <p style={{ marginTop:0, marginBottom:'12px', color:'#6b7280', fontWeight:500 }}>Administrar los backups programados y su estado.</p>
        <TablaABM
          items={backupsPaginados}
          columns={columnas}
          actionsColumn={accionesCol}
          sortConfig={sortConfig}
          onSort={handleSort}
        />
        <div className="abm-pagination">
          <Pagination
            paginaActual={paginaActual}
            totalPaginas={totalPaginas}
            setPaginaActual={setPaginaActual}
            inicio={inicio}
            fin={fin}
            totalItems={totalItems}
            cantidadMostrar={cantidadMostrar}
            setCantidadMostrar={setCantidadMostrar}
            mostrarSelector={true}
          />
        </div>
      </div>
    </div>
      <ModalConfirmarEliminar
        titulo="Cancelar backup?"
        mensaje={`¿Estás seguro que querés cancelar "${backupACancelar?.nombre}"?`}
        mostrar={mostrarModalCancelar}
        onCancelar={handleCancelarCancelar}
        onConfirmar={handleConfirmarCancelar}
      />
      <ModalConfirmarDescarga
        titulo="¿Descargar backup?"
        mensaje="¿Estás seguro que querés descargar este backup?"
        mostrar={mostrarModalDescarga}
        onCancelar={handleCancelarDescarga}
        onConfirmar={handleConfirmarDescarga}
      />
      {/*<ModalConfirmarEliminar
        titulo="¿Eliminar backup?"
        mensaje={`¿Estás seguro que querés eliminar el backup "${backupAEliminar?.nombre}"?`}
        mostrar={mostrarModalEliminar}
        onCancelar={handleCancelarEliminar}
        onConfirmar={handleConfirmarEliminar}
      />*/}
      {modalBackup.mostrar && (
        <ModalAM
          mostrar={modalBackup.mostrar}
            modo={modalBackup.modo}
            item={modalBackup.item}
            campos={camposBackup}
            textos={{
              crear:{ titulo:'Backups', subtitulo:'Nuevo BackUp', descripcion:'Complete los datos para programar un backup'},
              editar:{ titulo:'Backups', subtitulo:'Editar BackUp', descripcion:'Modifique los datos del backup'}
            }}
            onClose={onCloseModalBackup}
            onSave={onSaveBackup}
        />
      )}
      {/* Modal de filtros eliminado; filtros inline */}
      <SuccessAlert
        mensaje={mensajeAlertaCancelar}
        mostrar={mostrarAlertaCancelar}
        onClose={() => setMostrarAlertaCancelar(false)
        }
      />
      <SuccessAlert
        mensaje={mensajeAlertaDescarga}
        mostrar={mostrarAlertaDescarga}
        onClose={() => setMostrarAlertaDescarga(false)}
      />
      <SuccessAlert
        mensaje={mensajeAlertaCrear}
        mostrar={mostrarAlertaCrear}
        onClose={() => setMostrarAlertaCrear(false)}
      />
      <SuccessAlert
        mensaje={mensajeAlertaEliminar}
        mostrar={mostrarAlertaEliminar}
        onClose={() => setMostrarAlertaEliminar(false)}
      />
      <SuccessAlert
        mensaje={mensajeAlertaRestaurar}
        mostrar={mostrarAlertaRestaurar}
        onClose={() => setMostrarAlertaRestaurar(false)}
      />
      <ModalConfirmarRestauracion
        titulo="¿Restaurar backup?"
        mensaje={`¿Estás seguro que querés restaurar el backup "${backupARestaurar?.nombre}"?\nEsto reemplazará los datos actuales del sistema.`}
        mostrar={mostrarModalRestaurar}
        onCancelar={handleCancelarRestaurar}
        onConfirmar={handleConfirmarRestaurar}
      />
      <Modal_Error
        titulo={tituloError}
        mensaje={mensajeError}
        mostrar={mostrarError}
        onCerrar={() => setMostrarError(false)}
      />
      <ModalAccionExito
        titulo="Éxito"
        mensaje={mensajeExito}
        mostrar={mostrarModalExito}
        onAceptar={() => setMostrarModalExito(false)}
      />
    </>
  )
}

export default ABMBackups