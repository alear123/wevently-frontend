import React, { useEffect, useState, useMemo } from 'react';
import Navbar_Administrador from '../../../../common/layouts/Navbar_Administrador';
import ModalAM from '../src/components/ModalAM.jsx';
import Pagination from '../../../../common/layouts/Pagination';
import Breadcrumbs from '../../../../common/layouts/Breadcrumbs';
// Reemplazamos buscador local por el compartido para unificar estilo
import Buscador from '../../../../common/components/Buscador.jsx';
import ModalConfirmarEliminar from '../../../../common/layouts/ModalConfirmarEliminar';
import ModalAccionExito from '../../../../common/layouts/ModalAccionExito';
import Modal_Error from '../../../../common/layouts/ModalError';
import TablaABM from '../src/components/TablaABM.jsx';
import useSort from '../src/hooks/useSort';
import ABMTableSkeleton from '../src/components/ABMTableSkeleton.jsx';
// Importa estilos compartidos ABM (el CSS específico viejo se deja de usar)
import '../src/assets/abm-shared.css';


import {
    obtenerEstadosDisponibles,
    crearEstado,
    actualizarEstado,
    darDeBajaEstado,
    rehabilitarEstado 
} from './src/api/EstadosBackup';

const EstadosBackup = () => {
    const [EstadosBackup, setEstadosBackup] = useState([]);
    
    const [editId, setEditId] = useState(null);
    const [eliminarId, seteliminarId] = useState(null);
    
    const [busqueda, setBusqueda] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [paginaActual, setPaginaActual] = useState(1);
    // Ajustamos cantidadMostrar default a 5 para alinearse con otros listados
    const [cantidadMostrar, setCantidadMostrar] = useState(5);  
    const [showEliminarModal, setShowEliminarModal] = useState(false);

    const [cargando, setCargando] = useState(true)
    
    const [showExito, setShowExito] = useState(false);
    const [exitoTitulo, setExitoTitulo] = useState('');
    const [exitoMensaje, setExitoMensaje] = useState('');

    const [showError, setShowError] = useState(false);
    const [errorTitulo, setErrorTitulo] = useState('');
    const [errorMensaje, setErrorMensaje] = useState('');

    useEffect(() => {
        console.log('el componente estado backup se montoo');
        cargarEstados();
    }, []);



    const cargarEstados = async () => {
        try {
            setCargando(true);
            const response = await obtenerEstadosDisponibles();
            console.log('rta recibidad del back: ', response);

            if(Array.isArray(response)) {
                setEstadosBackup(response);
            } else {
                console.error('la rta no es un array: ', response);
                setEstadosBackup([]);
            }

        } catch (error) {
            console.error('error al cargar estados', error);
            manejarError('Error de carga', 'No se puedieron cargar los estados :(')
        } finally {
            setCargando(false);
        }
    };


    // Ordenamiento reutilizable
    const [dummy, setDummy] = useState(null); // placeholder por compatibilidad si hiciera falta

    const inicio = (paginaActual - 1) * cantidadMostrar;
    const fin = inicio + cantidadMostrar;


    const EstadosFiltrados = EstadosBackup.filter(p =>
        p.nombre.toLowerCase().includes(busqueda.toLowerCase())
        );

    const { sortConfig, sortedItems: EstadosOrdenados, handleSort } = useSort(EstadosFiltrados, { resetPage: () => setPaginaActual(1), storageKey: 'sort:estadosBackup' });

    const totalItems = EstadosFiltrados.length;
    const totalPaginas = Math.ceil(totalItems / cantidadMostrar);

    const estadosPagina = EstadosOrdenados.slice(inicio, fin);

    const mostrarOpciones = [3, 5, 10];
    if (!mostrarOpciones.includes(EstadosBackup.length)) {
        mostrarOpciones.push(EstadosBackup.length);
    }

    const estadoAEditar = EstadosBackup.find(p => p.id === editId);
    const estadoAEliminar = EstadosBackup.find(p => p.id === eliminarId); 

    //dar de alta
    const handleSave = async (datos) => {
        try {
            const nombre = datos.nombre.trim();

            const existeEstado = EstadosBackup.some(
                p => p.nombre && p.nombre.toLowerCase() === nombre.trim().toLowerCase() && !p.fechaHoraBaja
            );

            if (existeEstado) {
                throw new Error('Ya existe un estado con ese nombre. ')
                /*setErrorTitulo('Error al crear el estado');
                setErrorMensaje('Ya existe un estado con ese nombre.');
                setShowError(true);
                return;*/
            }
            const entidadCompleta = {
                nombre: nombre,
                fechaHoraAlta: new Date().toISOString(),
                fechaHoraBaja: null
            };

            const nuevoEstado = await crearEstado(entidadCompleta);

            setEstadosBackup(prev => [...prev, nuevoEstado]);

            return nombre;
        } catch (error) {
            console.error('Error al crear el estado: ', error);
            manejarError('Error al crear el estado', error.message || 'Ocurrió un error al crear el estado')
            throw error;
        }
    };

    //modificacion
    const handleEdit = async (idEstado, datos) => {
        try {
            const nombre = datos.nombre.trim();

            const existeEstado = EstadosBackup.some(
                p => p.nombre && p.nombre.toLowerCase() === nombre.toLowerCase() &&
                    !p.fechaHoraBaja &&
                    p.id !== idEstado
            );

            if (existeEstado) {
                throw new Error('Ya existe un estado con ese nombre')
                //ver si usar el manejarerror() 
            }

            const estadoActual = EstadosBackup.find(p => p.id === idEstado);
            if(!estadoActual) {
                throw new Error('Estado no encontrado.');
            }

            const entidadCompleta = {
                id: estadoActual.id,
                nombre: nombre,
                fechaHoraAlta: estadoActual.fechaHoraAlta,
                fechaHoraBaja: estadoActual.fechaHoraBaja
            };

            await actualizarEstado(idEstado, entidadCompleta);

            setEstadosBackup(prev =>
                prev.map(p =>
                    p.id === idEstado
                        ? { ...p, nombre: nombre }
                        : p
                )
            );
            return nombre;
        } catch (error) {
            console.error('error al actualizar el estado: ', error);
            manejarError('error al actualizar el estado: ', error.message || 'Ocurrió un error al actualizar el estado');
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

            cargarEstados();
        } catch (error) {
            console.error('error al eliminar el estado: ', error);
            throw error;
        }
    };

    const handleRehabilitar = async (idEstado) => {
    try {
        await rehabilitarEstado(idEstado);
        manejarExito('Estado habilitado', 'El estado fue habilitado correctamente.');
        cargarEstados();
    } catch (error) {
        console.error('Error al habilitar el estado:', error);
        manejarError('Error al habilitar el estado', error.message || 'No se pudo habilitar el estado.');
    }
    };

    
    //props para los modales
   const columnasTabla = useMemo(() => ([
    { key: 'nombre', header: 'Nombre', sortable: true },
    { key: 'fechaHoraBaja', header: 'Estado', render: item => item.fechaHoraBaja ? 'Inactivo' : 'Activo' }
    ]), []);

    const textoModal = {
        crear: {
            titulo: "Nuevo Estado",
            subtitulo: "Agregar",
            descripcion: "Ingresa el nombre del estado que pueden tener los backups."
        },
        editar: {
            titulo: "Editar Estado",
            subtitulo: "Modificar",
            descripcion: "Actualiza el nombre del estado que tendrán los backups."
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
                if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{2,}$/.test(valor)) return 'Solo letras y espacios'
                return '';
            }
        }
    ];

    //para manejar mejor los modales
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
        setShowError(true)
    };

    if(cargando) {
        return (
            <>
                <Navbar_Administrador/>
                <div className='abm-page'>
                    <div className='container-fluid py-2'>
                        <Breadcrumbs/>
                    </div>
                    <div className='abm-card'>
                        <h1 className='page-title'>Estados backup</h1>
                        <div className='table-container' style={{marginTop:'12px'}}>
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
                    <h1 className="page-title">Estados backup</h1>
                    <div className="abm-controls">
                        <div className="search-container">
                            <Buscador
                                placeholder="Buscar estado"
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
                            onClick={() => setShowModal(true)}
                        >
                            Agregar Estado
                        </button>
                    </div>
                    <p style={{ marginTop: 0, marginBottom: '12px', color: '#6b7280', fontWeight: 500 }}>
                        Gestiona los estados que puede tener un backup.
                    </p>
                    <div className="table-container">
                        <div className="table-scroll">
                            {cargando ? (
                                <ABMTableSkeleton columns={1} rows={6} showActions={true} />
                            ) : EstadosBackup.length === 0 ? (
                                <div style={{padding:'32px 16px', textAlign:'center', color:'#6b7280'}}>
                                    No hay estados backup registrados todavía.
                                </div>
                            ) : (
                                <TablaABM
                                    items={estadosPagina}
                                    columns={columnasTabla}
                                    onModificar={(item) => setEditId(item.id)}
                                    onEliminar={(item) => {
                                        if (item.fechaHoraBaja) {
                                            handleRehabilitar(item.id); // si está inactivo, mostramos botón verde "Habilitar"
                                        } else {
                                            handleEliminarClick(item.id); // si está activo, mostramos "Eliminar"
                                        }
                                    }}
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
                            mostrarSelector={true}
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
                            manejarExito('Estado creado', `El estado "${nombreCreado}" se creó correctamente.`);
                        } catch (error) {
                            cerrarModalCrear();
                            manejarError('Error al crear el estado', error.message || 'No se pudo crear el estado. Intenta nuevamente.');
                        }
                    }}
                    classNamePrefix='estado'
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
                            manejarExito('Estado modificado', `El estado se modificó correctamente a "${nombreModificado}".`);
                        } catch (error) {
                            cerrarModalEditar();
                            manejarError('Error al modificar el estado', error.message || 'No se pudo modificiar el estado intenta nuevamente');
                        }
                    }
                    }
                    classNamePrefix='estado'
                    textos={textoModal}
                    campos={camposModal}
                />
            )}
            <ModalConfirmarEliminar
                titulo="Eliminar estado"
                mensaje={`¿Estás seguro que deseas eliminar "${estadoAEliminar?.nombre || ''}"?`}
                mostrar={showEliminarModal}
                onCancelar={cerrarModalEliminar}
                onConfirmar={async () => {
                    try {
                        await handleDelete(eliminarId);
                        cerrarModalEliminar();
                        manejarExito('Estado eliminado', 'El estado se eliminó correctamente.');
                    } catch (error) {
                        cerrarModalEliminar();
                        manejarError('Error al modificar el estado', error.message || 'No se pudo modificiar el estado intenta nuevamente');
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

export default EstadosBackup;