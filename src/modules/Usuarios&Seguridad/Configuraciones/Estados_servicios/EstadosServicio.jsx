import React, { useState, useEffect, useMemo } from 'react';
import Navbar_Administrador from '../../../../common/layouts/Navbar_Administrador';
import ModalAM from '../src/components/ModalAM.jsx';
import Pagination from '../../../../common/layouts/Pagination';
import Breadcrumbs from '../../../../common/layouts/Breadcrumbs';
// Migramos al Buscador compartido para estilos unificados
import Buscador from '../../../../common/components/Buscador.jsx';
import ModalConfirmarEliminar from '../../../../common/layouts/ModalConfirmarEliminar';
import ModalAccionExito from '../../../../common/layouts/ModalAccionExito';
import Modal_Error from '../../../../common/layouts/ModalError';
import TablaABM from '../src/components/TablaABM.jsx';
import useSort from '../src/hooks/useSort';
import ABMTableSkeleton from '../src/components/ABMTableSkeleton.jsx';
// CSS reducido de este módulo (solo modales / popup / switches)
import './src/assets/EstadosServicios.css';
// Estilos compartidos ABM
import '../src/assets/abm-shared.css';

import {
    obtenerEstadosServiciosDisponibles,
    actualizarEstadoServicio,
    darDeBajaEstado,
    crearEstadoServicio
} from './src/api/estadosServicio';

const EstadosServicio = () => {
    const [EstadosServicios, setEstadosServicios] = useState([]);
    
    const [cargando, setcargando] = useState(true);
    
    const [editId, setEditId] = useState(null);
    const [eliminarId, seteliminarId] = useState(null);
    
    const [showModal, setShowModal] = useState(false);
    
    const [busqueda, setBusqueda] = useState('');
    const [paginaActual, setPaginaActual] = useState(1);
    const [cantidadMostrar, setCantidadMostrar] = useState(10);  
    const [showEliminarModal, setShowEliminarModal] = useState(false);
    
    
    
    //modales
    const [showExito, setShowExito] = useState(false);
    const [exitoTitulo, setExitoTitulo] = useState('');
    const [exitoMensaje, setExitoMensaje] = useState('');

    const [showError, setShowError] = useState(false);
    const [errorTitulo, setErrorTitulo] = useState('');
    const [errorMensaje, setErrorMensaje] = useState('');

    useEffect(() => {
        console.log('el componente estadoserv se montó');
        cargarEstadosServicios();
    }, []);

    const cargarEstadosServicios = async () => {
        try {
            setcargando(true);
            const response = await obtenerEstadosServiciosDisponibles();
            console.log('rta recibida del back: ', response);
            
            if (Array.isArray(response)) {
                setEstadosServicios(response);
            } else {
                console.error('La respuesta no es un array:', response);
                setEstadosServicios([]);
            }
        } catch (error) {
            console.error('Error al cargar estados:', error);
            manejarError('Error de carga', 'No se pudieron cargar los estados de servicio.');
            setEstadosServicios([]);
        } finally {
            setcargando(false);
        }
    };

    const [sortConfigState, setSortConfigState] = useState({ key: null, direction: null });

    const inicio = (paginaActual - 1) * cantidadMostrar;
    const fin = inicio + cantidadMostrar;

    const EstadosServicioFiltrados = EstadosServicios
        .filter(p => !p.fechaHoraBaja)
        .filter(p => p.nombre && p.nombre.toLowerCase().includes(busqueda.toLowerCase()));

    // Hook de ordenamiento reutilizable
    const { sortConfig, sortedItems: EstadosServicioOrdenados, handleSort } = useSort(EstadosServicioFiltrados, { initialKey: sortConfigState.key, initialDirection: sortConfigState.direction, resetPage: () => setPaginaActual(1), storageKey: 'sort:estadosServicio' });

    const totalItems = EstadosServicioFiltrados.length;
    const totalPaginas = Math.ceil(totalItems / cantidadMostrar);

    const estadosPagina = EstadosServicioOrdenados.slice(inicio, fin);

    const mostrarOpciones = [3, 5, 10];
    if (!mostrarOpciones.includes(EstadosServicios.length)) {
        mostrarOpciones.push(EstadosServicios.length);
    }

    const estadoAEditar = EstadosServicios.find(p => p.id === editId);
    const estadoAEliminar = EstadosServicios.find(p => p.id === eliminarId); 

    //crear nuevo estado
    const handleSave = async (datos) => {
        try {
            const nombre = datos.nombre.trim();
            
            const existeEstado = EstadosServicios.some(
                p => p.nombre && p.nombre.toLowerCase() === nombre.toLowerCase() && !p.fechaHoraBaja
            );
            
            if (existeEstado) {
                throw new Error('Ya existe un estado con ese nombre.');
            }

            const entidadCompleta = {
                nombre: nombre,
                fechaHoraAlta: new Date().toISOString(),
                fechaHoraBaja: null
            };

            const nuevoEstado = await crearEstadoServicio(entidadCompleta);
            
            setEstadosServicios(prev => [...prev, nuevoEstado]);
            
            return nombre;
        } catch (error) {
            console.error('Error al crear estado:', error);
            throw error;
        }
    };

    //modificar estado existente
    const handleEdit = async (idEstado, datos) => {
        try {
            const nombre = datos.nombre.trim();
            
            const existeEstado = EstadosServicios.some(
                p => p.nombre && p.nombre.toLowerCase() === nombre.toLowerCase() &&
                !p.fechaHoraBaja && 
                p.id !== idEstado
            );
            
            if (existeEstado) {
                throw new Error('Ya existe un estado con ese nombre.');
            }

            const estadoActual = EstadosServicios.find(p => p.id === idEstado);
            if (!estadoActual) {
                throw new Error('Estado no encontrado.');
            }

            const entidadCompleta = {
                id: estadoActual.id,
                nombre: nombre,
                fechaHoraAlta: estadoActual.fechaHoraAlta,
                fechaHoraBaja: estadoActual.fechaHoraBaja
            };

            await actualizarEstadoServicio(idEstado, entidadCompleta);

            setEstadosServicios(prev =>
                prev.map(p =>
                    p.id === idEstado
                        ? { ...p, nombre: nombre }
                        : p
                )
            );
            
            return nombre;
        } catch (error) {
            console.error('Error al actualizar estado:', error);
            throw error;
        }
    };

    const handleEliminarClick = (id) => {
        seteliminarId(id);
        setShowEliminarModal(true);
    };

    const handleDelete = async (idEstado) => {
        try {
            await darDeBajaEstado(idEstado);
            
            setEstadosServicios(prev =>
                prev.map(p =>
                    p.id === idEstado
                        ? { ...p, fechaHoraBaja: new Date().toISOString() }
                        : p
                )
            );
        } catch (error) {
            console.error('Error al eliminar estado:', error);
            throw error;
        }
    };

    //props
    const columnasTabla = useMemo(() => ([
        { key: 'nombre', header: 'Nombre', sortable: true }
    ]), []);

    const textoModal = {
        crear: {
            titulo: "Nuevo Estado",
            subtitulo: "Agregar",
            descripcion: "Ingresa el nombre del estado que pueden tener los servicios."
        },
        editar: {
            titulo: "Editar Estado",
            subtitulo: "Modificar",
            descripcion: "Actualiza el nombre del estado que tendrán los servicios."
        }
    };

    const camposModal = [
        {
            nombre: "nombre", 
            label: "Nombre *",
            tipo: "text",
            placeholder: "Nombre del estado",
            requerido: true,
            validacion: (valor) => {
                if (!valor.trim()) return 'El nombre es requerido';
                if (valor.trim().length < 2) return 'Debe tener al menos 2 caracteres';
                if (valor.trim().length > 50) return 'Máximo 50 caracteres';
                if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{2,}$/.test(valor)) return 'Solo letras y espacios';
                return '';
            }
        }
    ];

    //manejar modales
    const cerrarModalCrear = () => {
        setShowModal(false);
    };

    const cerrarModalEditar = () => {
        setEditId(null);
    };

    const cerrarModalEliminar = () => {
        setShowEliminarModal(false);
        seteliminarId(null);
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

        if (cargando) {
            return (
                <>
                    <Navbar_Administrador />
                    <div className="abm-page">
                        <div className="container-fluid py-2">
                            <Breadcrumbs />
                        </div>
                        <div className="abm-card">
                            <h1 className="page-title">Estados servicios</h1>
                            <div className="table-container" style={{marginTop:'12px'}}>
                                <ABMTableSkeleton columns={1} rows={6} showActions={true} />
                            </div>
                        </div>
                    </div>
                </>
            );
        }

        return (
          <>
            <Navbar_Administrador />
            <div className="abm-page">
              <div className="container-fluid py-2">
                <Breadcrumbs />
              </div>
              <div className="abm-card">
                <h1 className="page-title">Estados servicios</h1>
                <div className="abm-controls">
                  <div className="search-container">
                    <Buscador
                      placeholder="Buscar estado"
                      value={busqueda}
                      onChange={(texto) => {
                        setBusqueda(texto);
                        setPaginaActual(1);
                      }}
                      filtrarMientrasEscribes={true}
                      useSharedStyles={true}
                    />
                  </div>
                  <button
                    type="button"
                    className="abm-primary-btn"
                    onClick={() => setShowModal(true)}
                  >
                    Agregar estado servicio
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
                  Gestionar los estados de servicios aceptados en el sistema.
                </p>
                <div className="table-container">
                  <div className="table-scroll">
                    {EstadosServicios.length === 0 ? (
                      <ABMTableSkeleton
                        columns={1}
                        rows={6}
                        showActions={true}
                      />
                    ) : EstadosServicioFiltrados.length === 0 ? (
                      <div
                        style={{
                          padding: "32px 16px",
                          textAlign: "center",
                          color: "#6b7280",
                        }}
                      >
                        No hay resultados que coincidan con la búsqueda.
                      </div>
                    ) : (
                      <TablaABM
                        items={estadosPagina}
                        columns={columnasTabla}
                        onModificar={(item) => setEditId(item.id)}
                        onEliminar={(item) => handleEliminarClick(item.id)}
                        sortConfig={sortConfig}
                        onSort={handleSort}
                      />
                    )}
                  </div>
                </div>
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
                    mostrarSelector={false}
                  />
                </div>
              </div>
            </div>

            {showModal && (
              <ModalAM
                modo="crear"
                item={null}
                onClose={cerrarModalCrear}
                onSave={async (datos) => {
                  try {
                    const nombreCreado = await handleSave(datos);
                    cerrarModalCrear();
                    manejarExito(
                      "Estado creado",
                      `El estado "${nombreCreado}" se creó correctamente.`
                    );
                  } catch (error) {
                    cerrarModalCrear();
                    manejarError(
                      "Error al crear el estado",
                      error.message ||
                        "No se pudo crear el estado. Intenta nuevamente."
                    );
                  }
                }}
                classNamePrefix="estado"
                textos={textoModal}
                campos={camposModal}
              />
            )}

            {editId !== null && estadoAEditar && (
              <ModalAM
                modo="editar"
                item={estadoAEditar}
                onClose={cerrarModalEditar}
                onSave={async (datos) => {
                  try {
                    const nombreModificado = await handleEdit(editId, datos);
                    cerrarModalEditar();
                    manejarExito(
                      "Estado modificado",
                      `El estado se modificó correctamente a "${nombreModificado}".`
                    );
                  } catch (error) {
                    cerrarModalEditar();
                    manejarError(
                      "Error al modificar el estado",
                      error.message ||
                        "No se pudo modificar el estado. Intenta nuevamente."
                    );
                  }
                }}
                classNamePrefix="estado"
                textos={textoModal}
                campos={camposModal}
              />
            )}

            <ModalConfirmarEliminar
              titulo="Eliminar estado"
              mensaje={`¿Estás seguro que deseas eliminar "${
                estadoAEliminar?.nombre || ""
              }"?`}
              mostrar={showEliminarModal}
              onCancelar={cerrarModalEliminar}
              onConfirmar={async () => {
                try {
                  await handleDelete(eliminarId);
                  cerrarModalEliminar();
                  manejarExito(
                    "Estado eliminado",
                    "El estado se eliminó correctamente."
                  );
                } catch (error) {
                  cerrarModalEliminar();
                  manejarError(
                    "Error al eliminar el estado",
                    error.message ||
                      "No se pudo eliminar el estado. Intenta nuevamente."
                  );
                }
              }}
            />

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
};


export default EstadosServicio;