import { useState, useEffect, useMemo } from 'react';
import Navbar_Administrador from '../../../../common/layouts/Navbar_Administrador';
import Breadcrumbs from '../../../../common/layouts/Breadcrumbs';
import Pagination from '../../../../common/layouts/Pagination';
import ModalAccionExito from '../../../../common/layouts/ModalAccionExito';
import ModalError from '../../../../common/layouts/ModalError';
import ModalConfirmarEliminar from '../../../../common/layouts/ModalConfirmarEliminar';
import Buscador from '../../../../common/components/Buscador.jsx';
import TablaABM from '../src/components/TablaABM.jsx';
// Reemplazamos ModalAM por un modal específico para Roles con lógica dinámica de pantalla de inicio
import ModalRol from './components/ModalRol.jsx';
import '../src/assets/abm-shared.css';
import {
  cambiarEstadoRol,
  eliminarRol,
  getRoles,
  crearRol,
  editarRol,
  getGrupos,
  getPantallasInicioPosibles
} from './api/RolesApi';

export default function ABM_Roles() {
  const [roles, setRoles] = useState([]); // listado visible
  const [grupos, setGrupos] = useState([]); // grupos disponibles
  const [pantallasInicioMap, setPantallasInicioMap] = useState({}); // cache pantallas por grupos seleccionados

  // UI state
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);
  const [cantidadPorPagina, setCantidadPorPagina] = useState(10);

  // Modal unificado (crear / editar)
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showEliminarModal, setShowEliminarModal] = useState(false);
  const [accionEstado, setAccionEstado] = useState(null); // 'eliminar' | 'activar' | 'desactivar'
  const [rolTarget, setRolTarget] = useState(null);

  // Feedback
  const [showExito, setShowExito] = useState(false);
  const [exitoTitulo, setExitoTitulo] = useState('');
  const [exitoMensaje, setExitoMensaje] = useState('');
  const [showError, setShowError] = useState(false);
  const [errorTitulo, setErrorTitulo] = useState('');
  const [errorMensaje, setErrorMensaje] = useState('');

  // Backend pagination meta (si se quiere mantener compat)
  const [totalItems, setTotalItems] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(1);

  // Cargar grupos de permisos
  useEffect(() => {
    (async () => {
      try {
        const gruposData = await getGrupos();
        setGrupos(gruposData || []);
      } catch (e) {
        setErrorTitulo('Error');
        setErrorMensaje('No se pudieron cargar los grupos.');
        setShowError(true);
      }
    })();
  }, []);

  // Cargar roles cada vez que cambian filtros o paginación
  useEffect(() => {
    (async () => {
      try {
        const rolesData = await getRoles(paginaActual, cantidadPorPagina, filtroEstado, busqueda);
        setRoles(rolesData.content || []);
        setTotalItems(rolesData.totalElements || rolesData.content?.length || 0);
        setTotalPaginas(rolesData.totalPages || 1);
      } catch (e) {
        setErrorTitulo('Error');
        setErrorMensaje('No se pudieron cargar los roles.');
        setShowError(true);
      }
    })();
  }, [paginaActual, cantidadPorPagina, filtroEstado, busqueda]);

  // Resetear a primera página cuando cambian los filtros
  useEffect(() => { setPaginaActual(1); }, [busqueda, filtroEstado]);

  // Calcular inicio y fin para paginación visual
  const inicio = (paginaActual - 1) * cantidadPorPagina;
  const fin = Math.min(inicio + cantidadPorPagina, totalItems);

  // Columnas para la tabla reutilizable
  const columnas = useMemo(() => ([
    {
      key: 'nombre', header: 'Rol', render: (r) => (
        <span style={{ fontWeight: 600 }}>
          {r.nombre}
          {r.tienePrivilegios && <span title="Rol con privilegios" style={{ marginLeft: 6, color: '#FFD700' }}>⭐</span>}
        </span>
      )
    },
    { key: 'descripcion', header: 'Descripción', render: (r) => <span style={{ color: '#6b7280', fontSize: '.85rem' }}>{r.descripcion || '-'}</span> },
    { key: 'activo', header: 'Estado', render: (r) => (
      <span className={`chip ${r.activo ? 'chip--ok' : 'chip--off'}`}>{r.activo ? 'Activo' : 'Inactivo'}</span>
    )},
    { key: 'gruposIds', header: 'Grupos', render: (r) => (
      <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
        {r.gruposIds?.length ? r.gruposIds.map(id => {
          const g = grupos.find(gp => gp.id === id);
          return <span key={id} className="chip chip--neutral" style={{ fontSize:'.60rem' }}>{g ? g.nombre : id}</span>
        }) : '-'}
      </div>
    )},
    { key: 'cantidadUsuarios', header: 'Usuarios', render: r => r.cantidadUsuarios ?? '-' },
    { key: 'fechaHoraAlta', header: 'Creación', render: r => r.fechaHoraAlta ? new Date(r.fechaHoraAlta).toLocaleDateString('es-AR') : '-' }
  ]), [grupos]);

  const rolAEditar = roles.find(r => r.id === editId);

  // Eliminado uso de ModalAM para este caso específico según requerimiento (no genérico)

  const abrirCrear = () => { setEditId(null); setShowModal(true); };
  const abrirEditar = (rol) => { setEditId(rol.id); setShowModal(true); };
  const cerrarModal = () => { setShowModal(false); setEditId(null); };

  const manejarExito = (titulo, mensaje) => { setExitoTitulo(titulo); setExitoMensaje(mensaje); setShowExito(true); };
  const manejarError = (titulo, mensaje) => { setErrorTitulo(titulo); setErrorMensaje(mensaje); setShowError(true); };

  const recargarRoles = async () => {
    try {
      const rolesData = await getRoles(paginaActual, cantidadPorPagina, filtroEstado, busqueda);
      setRoles(rolesData.content || []);
      setTotalItems(rolesData.totalElements || rolesData.content?.length || 0);
      setTotalPaginas(rolesData.totalPages || 1);
    } catch (e) {
      manejarError('Error', 'No se pudieron recargar los roles.');
    }
  };

  const onSaveRol = async (datos) => {
    try {
      const dto = {
        nombre: datos.nombre?.trim(),
        descripcion: datos.descripcion || '',
        activo: datos.activo ?? true,
        tienePrivilegios: datos.tienePrivilegios ?? false,
        gruposIds: datos.gruposIds || [],
        pantallaInicio: datos.pantallaInicio || ''
      };
      if (editId) {
        await editarRol(editId, dto);
        manejarExito('Rol editado', 'El rol se editó correctamente.');
      } else {
        await crearRol(dto);
        manejarExito('Rol creado', 'El rol se creó correctamente.');
      }
      cerrarModal();
      await recargarRoles();
    } catch (e) {
      console.error(e);
      manejarError('Error', e.message || 'No se pudo guardar el rol.');
    }
  };

  const confirmarAccion = (rol, accion) => {
    setRolTarget(rol); setAccionEstado(accion); setShowEliminarModal(true);
  };

  const ejecutarAccion = async () => {
    if (!rolTarget) return;
    try {
      if (accionEstado === 'eliminar') {
        const res = await eliminarRol(rolTarget.id);
        if (!res.ok) throw new Error('No se pudo eliminar');
        manejarExito('Rol eliminado', 'El rol se eliminó correctamente.');
      } else {
        const nuevoEstado = accionEstado === 'activar';
        const res = await cambiarEstadoRol(rolTarget.id, nuevoEstado);
        if (!res.ok) throw new Error('No se pudo cambiar el estado');
        manejarExito(nuevoEstado ? 'Rol activado' : 'Rol desactivado', nuevoEstado ? 'El rol se activó correctamente.' : 'El rol se desactivó correctamente.');
      }
      setShowEliminarModal(false);
      await recargarRoles();
    } catch (e) {
      manejarError('Error', e.message || 'Acción no completada.');
      setShowEliminarModal(false);
    }
  };

  return (
    <>
      <Navbar_Administrador />
      <div className="abm-page">
        <div className="container-fluid py-2">
          <Breadcrumbs />
        </div>
        <div className="abm-card">
          <h1 className="page-title">Roles de Usuario</h1>
          <div
            className="abm-controls"
            style={{ alignItems: "flex-end", gap: 16 }}
          >
            <div
              style={{ display: "flex", gap: 12, flexWrap: "wrap", flex: 1 }}
            >
              <Buscador
                placeholder="Buscar roles..."
                value={busqueda}
                onChange={(t) => setBusqueda(t)}
                filtrarMientrasEscribes={true}
                useSharedStyles={true}
              />
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="search-input"
                style={{ maxWidth: 220 }}
              >
                <option value="">Todos los estados</option>
                <option value="true">Activos</option>
                <option value="false">Inactivos</option>
              </select>
            </div>
            <button className="abm-primary-btn" onClick={abrirCrear}>
              Agregar rol
            </button>
          </div>
          <p
            style={{
              marginTop: 0,
              marginBottom: "12px",
              color: "#6b7280",
              fontWeight: 500,
            }}
          >
            Gestionar roles de usuario y asignar grupos de permisos.
          </p>
          {roles.length === 0 ? (
            <div className="table-container">
              <div
                className="table-scroll"
                style={{
                  padding: "32px 16px",
                  textAlign: "center",
                  color: "#6b7280",
                }}
              >
                No hay roles cargados.
              </div>
            </div>
          ) : (
            <TablaABM
              items={roles}
              columns={columnas}
              actionsColumn={{
                render: (r) => (
                  <div className="actions" style={{ gap: 8 }}>
                    <button
                      className="abm-action-btn edit"
                      onClick={() => abrirEditar(r)}
                    >
                      Editar
                    </button>
                    {r.activo ? (
                      <button
                        className="abm-action-btn deactivate"
                        onClick={() => confirmarAccion(r, "desactivar")}
                      >
                        Desactivar
                      </button>
                    ) : (
                      <button
                        className="abm-action-btn activate"
                        onClick={() => confirmarAccion(r, "activar")}
                      >
                        Activar
                      </button>
                    )}
                    <button
                      className="abm-action-btn delete"
                      onClick={() => confirmarAccion(r, "eliminar")}
                    >
                      Eliminar
                    </button>
                  </div>
                ),
              }}
            />
          )}
          <div className="abm-pagination">
            <Pagination
              paginaActual={paginaActual}
              totalPaginas={totalPaginas}
              setPaginaActual={setPaginaActual}
              inicio={inicio}
              fin={fin}
              totalItems={totalItems}
              cantidadMostrar={cantidadPorPagina}
              setCantidadMostrar={setCantidadPorPagina}
              mostrarSelector={true}
            />
          </div>
        </div>
      </div>

      {showModal && (
        <ModalRol
          modo={editId ? "editar" : "crear"}
          mostrar={showModal}
          rol={rolAEditar || null}
          grupos={grupos}
          onClose={cerrarModal}
          onSave={onSaveRol}
        />
      )}

      <ModalConfirmarEliminar
        titulo={
          accionEstado === "eliminar"
            ? "Eliminar rol"
            : accionEstado === "activar"
            ? "Activar rol"
            : "Desactivar rol"
        }
        mensaje={
          rolTarget
            ? accionEstado === "eliminar"
              ? `¿Seguro que deseas eliminar el rol "${rolTarget.nombre}"?`
              : accionEstado === "activar"
              ? `¿Seguro que deseas activar el rol "${rolTarget.nombre}"?`
              : `¿Seguro que deseas desactivar el rol "${rolTarget.nombre}"?`
            : ""
        }
        mostrar={showEliminarModal}
        accion={
          accionEstado === "eliminar"
            ? "Eliminar"
            : accionEstado === "activar"
            ? "Activar"
            : "Desactivar"
        }
        onCancelar={() => setShowEliminarModal(false)}
        onConfirmar={ejecutarAccion}
      />

      <ModalAccionExito
        titulo={exitoTitulo}
        mensaje={exitoMensaje}
        mostrar={showExito}
        onAceptar={() => setShowExito(false)}
      />
      <ModalError
        titulo={errorTitulo}
        mensaje={errorMensaje}
        mostrar={showError}
        onCerrar={() => setShowError(false)}
      />
    </>
  );
}
