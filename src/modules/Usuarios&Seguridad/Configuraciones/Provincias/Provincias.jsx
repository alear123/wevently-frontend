//No se muestra el nombre de las provincias en la tabla 
import React, { useEffect, useState, useMemo } from 'react';
import useSort from '../src/hooks/useSort';
import Navbar_Administrador from '../../../../common/layouts/Navbar_Administrador';
import './src/assets/Provincia.css'; // quedará solo para estilos residuales si hacen falta
// Reemplazamos modal local por ModalAM compartido
//import ModalAM from '../src/components/ModalAM.jsx';
import ModalAM_Provincia from './src/components/ModalAM.jsx'
import Pagination from '../../../../common/layouts/Pagination';
import Breadcrumbs from '../../../../common/layouts/Breadcrumbs';
import Buscador from '../../../../common/components/Buscador.jsx';
import ModalConfirmarEditar from '../../../../common/layouts/ModalConfirmarEditar.jsx';
import ModalConfirmarRestauracion from '../../../../common/layouts/ModalConfimarRestauracion.jsx';
import ModalConfirmarEliminar from '../../../../common/layouts/ModalConfirmarEliminar';
import ModalAccionExito from '../../../../common/layouts/ModalAccionExito';
import Modal_Error from '../../../../common/layouts/ModalError';
// Reemplazamos tabla local por la genérica TablaABM
//import TablaABM from '../src/components/TablaABM.jsx';
import TablaABM_Provincia from './src/components/TablaABM.jsx';
import ABMTableSkeleton from '../src/components/ABMTableSkeleton.jsx';


import {
    obtenerDisponibles,
    crearNuevo,
    actualizarUno,
    darDeBajaUno,
    darDeAltaUno
} from './src/api/API_Provincias';

const Provincias = () => {
    const [provincias, setProvincias] = useState([]);
    const [editId, setEditId] = useState(null);
    const [busqueda, setBusqueda] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [paginaActual, setPaginaActual] = useState(1);
    const [cantidadMostrar, setCantidadMostrar] = useState(10);
    const [showEliminarModal, setShowEliminarModal] = useState(false);
    const [showAltaModal, setShowAltaModal] = useState(false);
    const [accionId, setAccionId] = useState(null);

    const [showExito, setShowExito] = useState(false);
    const [exitoTitulo, setExitoTitulo] = useState('');
    const [exitoMensaje, setExitoMensaje] = useState('');

    const [showError, setShowError] = useState(false);
    const [errorTitulo, setErrorTitulo] = useState('');
    const [errorMensaje, setErrorMensaje] = useState('');

    // Filtrado: mostrar TODAS las provincias (activas e inactivas)
    const provinciasFiltradas = useMemo(
    () => provincias.filter(p => p.nombre.toLowerCase().includes(busqueda.toLowerCase())),
    [provincias, busqueda]
);

    const { sortConfig, sortedItems: sortedProvincias, handleSort } = useSort(provinciasFiltradas, { 
        resetPage: () => setPaginaActual(1), 
        storageKey: 'sort:provincias' 
    });

    const inicio = (paginaActual - 1) * cantidadMostrar;
    const fin = inicio + cantidadMostrar;

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            const response = await obtenerDisponibles();
            console.log("rta recibida del back: ", response);
            if (Array.isArray(response)) {
                setProvincias(response);
            } else {
                setProvincias([]);
            }
        } catch (error) {
            console.error('Error al cargar datos: ', error);
            manejarError('Error de carga', 'Por favor, actualiza la página.');
        }
    };

    const totalItems = sortedProvincias.length;
    const totalPaginas = Math.ceil(totalItems / cantidadMostrar);
    const provinciasPagina = sortedProvincias.slice(inicio, fin);

    // Alta
    const handleSave = async (nombre) => {
        try {
            const existeProvincia = provincias.some(
                p => p.nombre.toLowerCase() === nombre.trim().toLowerCase() && !p.fechaHoraBaja
            );
            if (existeProvincia) {
                throw new Error('Ya existe una provincia con ese nombre');
            }

            const entidadCompleta = {
                nombre: nombre.trim(),
                fechaHoraAlta: new Date().toISOString(),
                fechaHoraBaja: null
            };

            const nuevaProvincia = await crearNuevo(entidadCompleta);
            setProvincias([...provincias, nuevaProvincia]);
        } catch (error) {
            console.error('Error al crear provincia: ', error);
            manejarError('Error al crear provincia', error.message || 'Ocurrió un error al crearla');
            throw error;
        }
    };

    // Modificación
    const handleEdit = async (idProvincia, nombre) => {
        try {
            const nombreTrimmed = nombre.trim();
            const existeEntidad = provincias.some(
                p => p.nombre && p.nombre.toLowerCase() === nombreTrimmed.toLowerCase()
                    && !p.fechaHoraBaja && p.id !== idProvincia
            );

            if (existeEntidad) {
                throw new Error('Ya existe una provincia con ese nombre');
            }

            const entidadActual = provincias.find(p => p.id === idProvincia);
            if (!entidadActual) {
                throw new Error('Provincia no encontrada');
            }

            const entidadCompleta = {
                id: entidadActual.id,
                nombre: nombreTrimmed,
                fechaHoraAlta: entidadActual.fechaHoraAlta,
                fechaHoraBaja: entidadActual.fechaHoraBaja
            };

            await actualizarUno(idProvincia, entidadCompleta);
            setProvincias(prev =>
                prev.map(p => p.id === idProvincia ? { ...p, nombre: nombreTrimmed } : p)
            );
        } catch (error) {
            console.error('Error al actualizar provincia: ', error);
            manejarError('Error al actualizar provincia', error.message || 'Ocurrió un error al actualizarla');
            throw error;
        }
    };

    const handleEliminarClick = (idProvincia) => {
        // Al abrir la confirmación de eliminación, cerramos el modal de edición/creación
        setShowModal(false);
        setAccionId(idProvincia);
        setShowEliminarModal(true);
    };

    const handleAltaClick = (idProvincia) => {
        // Al abrir la confirmación de alta, cerramos el modal de edición/creación
        setShowModal(false);
        setAccionId(idProvincia);
        setShowAltaModal(true);
    };

    // NUEVO: Dar de baja con manejo de respuesta del backend
    const handleDelete = async (idProvincia) => {
        try {
            const resultado = await darDeBajaUno(idProvincia);

            if (resultado.exitoso) {
                // Éxito: actualizar localmente
                cargarDatos();
                cerrarModalEliminar();
                manejarExito('Provincia dada de baja', resultado.mensaje);
            } else {
                // Conflicto: la provincia tiene localidades activas
                cerrarModalEliminar();
                manejarError(
                    'No se puede dar de baja',
                    resultado.mensaje || 'La provincia está siendo utilizada'
                );
            }
        } catch (error) {
            cerrarModalEliminar();
            console.error('Error al dar de baja: ', error);
            manejarError('Error al dar de baja', error.message || 'Ocurrió un error inesperado');
        }
    };

    // NUEVO: Dar de alta
    const handleAlta = async (idProvincia) => {
        try {
            await darDeAltaUno(idProvincia);
            cargarDatos();
            cerrarModalAlta();
            manejarExito('Provincia dada de alta', 'La provincia se habilitó correctamente');
        } catch (error) {
            cerrarModalAlta();
            console.error('Error al dar de alta: ', error);
            manejarError('Error al dar de alta', error.message || 'Ocurrió un error inesperado');
        }
    };

    const cerrarModal = (e) => {
        if (e) e.stopPropagation();
        setShowModal(false);
        setEditId(null);
    };

    const cerrarModalEliminar = () => {
        setShowEliminarModal(false);
        setAccionId(null);
    };

    const cerrarModalAlta = () => {
        setShowAltaModal(false);
        setAccionId(null);
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

    const provinciaAccion = provincias.find(p => p.id === accionId);
    const provinciaAEditar = provincias.find(p => p.id === editId);

    const textosModal = {
        crear: {
            titulo: 'Nueva provincia',
            subtitulo: 'Agregar',
            descripcion: 'Ingresa el nombre de la provincia'
        },
        editar: {
            titulo: 'Editar provincia',
            subtitulo: 'Modificar',
            descripcion: 'Actualiza el nombre de la provincia'
        }
    };

    const columnas = useMemo(() => ([
        { key: 'nombre', header: 'Nombre', sortable: true }
    ]), []);

    return (
        <>
            <Navbar_Administrador />
            <div className="abm-page">
                <div className="container-fluid py-2">
                    <Breadcrumbs />
                </div>
                <div className="abm-card">
                    <h1 className="page-title">Gestionar provincias</h1>
                    <div className="abm-controls">
                        <div className="search-container">
                            <Buscador
                                placeholder="Buscar provincia"
                                value={busqueda}
                                onChange={texto => {
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
                            onClick={() => {
                                setShowEliminarModal(false);
                                setShowAltaModal(false);
                                setShowModal(true);
                            }}
                        >
                            Agregar provincia
                        </button>
                    </div>
                    <p style={{ marginTop: 0, marginBottom: '12px', color: '#6b7280', fontWeight: 500 }}>
                        Gestionar todas las provincias aceptadas en el sistema.
                    </p>
                    {provincias.length === 0 ? (
                        <div className="table-container">
                            <div className="table-scroll">
                                <ABMTableSkeleton columns={1} rows={6} showActions={true} />
                            </div>
                        </div>
                    ) : provinciasFiltradas.length === 0 ? (
                        <div className="table-container">
                            <div className="table-scroll" style={{ padding: '32px 16px', textAlign: 'center', color: '#6b7280' }}>
                                No hay resultados que coincidan con la búsqueda.
                            </div>
                        </div>
                    ) : (
                        <div className="table-container">
                            <div className="table-scroll">
                                <TablaABM_Provincia
                                    items={provinciasPagina}
                                    columns={columnas}
                                    onModificar={(item) => { 
                                        if (!item.fechaHoraBaja) {
                                            // Al abrir el modal de edición, cerramos cualquier confirmación
                                            setShowEliminarModal(false);
                                            setShowAltaModal(false);
                                            setEditId(item.id); 
                                            setShowModal(true); 
                                        }
                                    }}
                                    onEliminar={(item) => handleEliminarClick(item.id)}
                                    onDarDeAlta={(item) => handleAltaClick(item.id)}
                                    sortConfig={sortConfig}
                                    onSort={handleSort}
                                />
                            </div>
                        </div>
                    )}
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

            {showModal && (
                <ModalAM_Provincia
                    modo={editId ? 'editar' : 'crear'}
                    item={editId ? provinciaAEditar : null}
                    textos={textosModal}
                    onClose={cerrarModal}
                    onSave={async (datos) => {
                        const nombre = datos.nombre;
                        try {
                            if (editId) {
                                await handleEdit(editId, nombre);
                                manejarExito('Provincia modificada', `La provincia se modificó correctamente a "${nombre}".`);
                            } else {
                                await handleSave(nombre);
                                manejarExito('Provincia creada', `La provincia "${nombre}" se creó correctamente.`);
                            }
                        } catch (error) {
                            manejarError(
                                editId ? 'Error al modificar provincia' : 'Error al crear provincia',
                                error.message || 'Ocurrió un error.'
                            );
                        } finally {
                            cerrarModal();
                        }
                    }}
                />
            )}

            <ModalConfirmarEditar
                titulo="Dar de baja provincia"
                mensaje={`¿Estás seguro que deseas dar de baja "${provinciaAccion?.nombre || ''}"?`}
                mostrar={showEliminarModal}
                accion="Dar de baja"
                onCancelar={cerrarModalEliminar}
                onConfirmar={() => handleDelete(accionId)}
            />

            <ModalConfirmarEditar
                titulo="Dar de alta provincia"
                mensaje={`¿Estás seguro que deseas habilitar nuevamente "${provinciaAccion?.nombre || ''}"?`}
                mostrar={showAltaModal}
                accion="Dar de alta"
                onCancelar={cerrarModalAlta}
                onConfirmar={() => handleAlta(accionId)}
            />


            <ModalAccionExito
                titulo={exitoTitulo}
                mensaje={exitoMensaje}
                mostrar={showExito}
                onAceptar={() => {
                    setShowExito(false);      
                    setErrorTitulo('');       
                    setErrorMensaje('');      
                    setShowError(false);      
                }}
            />

            <Modal_Error
                titulo={errorTitulo}
                mensaje={errorMensaje}
                mostrar={showError}
                onCerrar={() => {
                    setShowError(false);
                    setErrorTitulo('');
                    setErrorMensaje('');
                }}
            />
        </>
    );
};

export default Provincias;