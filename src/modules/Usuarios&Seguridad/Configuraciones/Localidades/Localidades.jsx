import { useState, useEffect, useMemo } from "react";
import useSort from "../src/hooks/useSort";
import Navbar_Administrador from "../../../../common/layouts/Navbar_Administrador";
import Breadcrumbs from "../../../../common/layouts/Breadcrumbs";
import ModalConfirmarEliminar from '../../../../common/layouts/ModalConfirmarEliminar';
import ModalConfirmarEditar from '../../../../common/layouts/ModalConfirmarEditar.jsx';
import ModalAccionExito from '../../../../common/layouts/ModalAccionExito';
import Modal_Error from '../../../../common/layouts/ModalError';
import Buscador from '../../../../common/components/Buscador';
import Paginacion from '../../../../common/layouts/Pagination';
import ModalAM from '../src/components/ModalAM';
//import TablaABM from '../src/components/TablaABM';
import TablaABM_Localidad from "./src/components/TablaABM.jsx";
import ABMTableSkeleton from '../src/components/ABMTableSkeleton.jsx';
import FiltroTipo from '../src/components/FiltroTipo.jsx';
import '../src/assets/abm-shared.css';
import './src/assets/Localidades.css'; // reducido: solo estilos no cubiertos por shared

import {
    obtenerDisponibles,
    crearNuevo,
    actualizarUno,
    SetearProvincia,
    darDeBajaUno,
    darDeBajaLocalidad,
    darDeAltaLocalidad
} from './src/api/API_Localidades';

export default function Localidades() {
    // Estados principales
    const [provincias, setProvincias] = useState([]);
    const [localidades, setLocalidades] = useState([]);
    const [cargando, setCargando] = useState(true);

    // Estados UI
    const [editId, setEditId] = useState(null);
    const [busqueda, setBusqueda] = useState('');
    const [provinciaSeleccionada, setProvinciaSeleccionada] = useState('Todos');
    const [showModal, setShowModal] = useState(false);
    const [paginaActual, setPaginaActual] = useState(1);
    const [cantidadMostrar, setCantidadMostrar] = useState(10);
    const [eliminarId, setEliminarId] = useState(null);
    const [showEliminarModal, setShowEliminarModal] = useState(false);
    const [recuperarId, setRecuperarId] = useState(null);
    const [showRecuperarModal, setShowRecuperarModal] = useState(false);

    // Estados de mensajes
    const [showExito, setShowExito] = useState(false);
    const [exitoTitulo, setExitoTitulo] = useState('');
    const [exitoMensaje, setExitoMensaje] = useState('');
    const [showError, setShowError] = useState(false);
    const [errorTitulo, setErrorTitulo] = useState('');
    const [errorMensaje, setErrorMensaje] = useState('');

    // Helpers
    const transformarDatos = (provinciasData) => {
        const localidadesPlanas = [];
        const provinciasLimpias = [];
        provinciasData.forEach(provincia => {
            provinciasLimpias.push({
                id: provincia.id,
                nombre: provincia.nombre,
                fechaHoraAlta: provincia.fechaHoraAlta,
                fechaHoraBaja: provincia.fechaHoraBaja
            });
            provincia.localidades.forEach(localidad => {
                localidadesPlanas.push({
                    id: localidad.id,
                    nombre: localidad.nombre,
                    fechaHoraAlta: localidad.fechaHoraAlta,
                    fechaHoraBaja: localidad.fechaHoraBaja,
                    nombreProvincia: provincia.nombre,
                    idProvincia: provincia.id
                });
            });
        });
        return { provinciasLimpias, localidadesPlanas };
    };

    const cargarDatos = async () => {
        try {
            setCargando(true);
            const response = await obtenerDisponibles();
            console.log("viene del back: ", response);
            if (Array.isArray(response)) {
                const { provinciasLimpias, localidadesPlanas } = transformarDatos(response);
                setProvincias(provinciasLimpias);
                setLocalidades(localidadesPlanas);
            } else {
                setProvincias([]);
                setLocalidades([]);
                manejarError('Error de datos', 'La respuesta del servidor no tiene el formato esperado.');
            }
        } catch (error) {
            manejarError('Error de carga', 'No se pudieron cargar los datos. Por favor, actualiza la página.');
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => { cargarDatos(); }, []);

    // Ordenamiento y filtrado
    const [internalSort, setInternalSort] = useState({ key: null, direction: null });

    // Muestra todas (activas e inactivas)
    const localidadesFiltradas = useMemo(() => (
        localidades.filter(loc => {
            const coincideNombre = loc.nombre.toLowerCase().includes(busqueda.toLowerCase());
            const esTodos = provinciaSeleccionada === 'Todos' || provinciaSeleccionada === 'Todas' || provinciaSeleccionada === '' || provinciaSeleccionada == null;
            const coincideProvincia = esTodos ? true : (loc.idProvincia === Number(provinciaSeleccionada));
            return coincideNombre && coincideProvincia;
        })
    ), [localidades, busqueda, provinciaSeleccionada]);

    const { sortConfig, sortedItems: localidadesOrdenadas, handleSort } = useSort(localidadesFiltradas, {
        initialKey: internalSort.key,
        initialDirection: internalSort.direction,
        resetPage: () => setPaginaActual(1),
        storageKey: 'sort:localidades'
    });

    // Paginación
    const totalItems = localidadesOrdenadas.length;
    const totalPaginas = Math.ceil(totalItems / cantidadMostrar);
    const inicio = (paginaActual - 1) * cantidadMostrar;
    const fin = inicio + cantidadMostrar;
    const localidadesPagina = localidadesOrdenadas.slice(inicio, fin);

    //provincias activas para el selector
    const provinciasActivas = provincias.filter(p => !p.fechaHoraBaja);
    const tiposProvincias = provinciasActivas.map(p => ({ valor: String(p.id), etiqueta: p.nombre }));

    // CRUD lógica
    const handleSave = async (data) => {
        try {
            const provincia = provincias.find(p => p.id === parseInt(data.provincia));
            if (!provincia) throw new Error('Provincia no encontrada');
            const existeLocalidad = localidades.some(loc =>
                loc.nombre.toLowerCase() === data.nombre.toLowerCase() &&
                loc.idProvincia === provincia.id &&
                !loc.fechaHoraBaja
            );
            if (existeLocalidad) {
                throw new Error(`Ya existe la localidad "${data.nombre}" en la provincia ${provincia.nombre}`);
            }
            const entidadCompleta = {
                fechaHoraAlta: new Date().toISOString(),
                fechaHoraBaja: null,
                nombre: data.nombre.trim()
            };
            const nuevaLocalidad = await crearNuevo(entidadCompleta);
            await SetearProvincia(provincia.id, nuevaLocalidad.id);
            await cargarDatos();
            return nuevaLocalidad;
        } catch (error) {
            throw error;
        }
    };

    const handleEdit = async (data) => {
        try {
            const localidadActual = localidades.find(loc => loc.id === editId);
            if (!localidadActual) throw new Error('Localidad no encontrada');
            const provincia = provincias.find(p => p.id === parseInt(data.provincia));
            if (!provincia) throw new Error('Provincia no encontrada');
            const existeLocalidad = localidades.some(loc =>
                loc.nombre.toLowerCase() === data.nombre.toLowerCase() &&
                loc.idProvincia === provincia.id &&
                loc.id !== localidadActual.id &&
                !loc.fechaHoraBaja
            );
            if (existeLocalidad) {
                throw new Error(`Ya existe la localidad "${data.nombre}" en la provincia ${provincia.nombre}`);
            }
            const entidadCompleta = {
                id: localidadActual.id,
                nombre: data.nombre.trim(),
                fechaHoraAlta: localidadActual.fechaHoraAlta,
                fechaHoraBaja: localidadActual.fechaHoraBaja
            };
            const localidadActualizada = await actualizarUno(localidadActual.id, entidadCompleta);
            if (localidadActual.idProvincia !== provincia.id) {
                await SetearProvincia(provincia.id, localidadActualizada.id);
            }
            await cargarDatos();
            return localidadActualizada;
        } catch (error) {
            throw error;
        }
    };

    // Baja y alta lógica
    const handleEliminarClick = (localidad) => {
        setEliminarId(localidad);
        setShowEliminarModal(true);
    };
    const handleAltaClick = (localidad) => {
        setRecuperarId(localidad);
        setShowRecuperarModal(true);
    };
    // Confirmar baja (usa tu API)
    const handleDelete = async (id) => {
        try {
            const resultado = await darDeBajaLocalidad(id);
            setShowEliminarModal(false);
            if (resultado.exitoso) manejarExito('Localidad dada de baja', resultado.mensaje);
            else manejarError('No se puede dar de baja', resultado?.mensaje || resultado?.error || 'No se pudo completar la baja.');
            await cargarDatos();
        } catch (error) {
            setShowEliminarModal(false);
            manejarError('Error', error.message || 'No se pudo dar de baja la localidad.');
        }
    };
    // Confirmar alta (usa tu API)
    const handleAlta = async (id) => {
        try {
            await darDeAltaLocalidad(id);
            setShowRecuperarModal(false);
            manejarExito('Localidad dada de alta', 'La localidad se habilitó correctamente.');
            await cargarDatos();
        } catch (error) {
            setShowRecuperarModal(false);
            manejarError('Error', error.message || 'No se pudo dar de alta la localidad.');
        }
    };

    // Mensajes éxito/error
    const manejarExito = (titulo, mensaje) => { setExitoTitulo(titulo); setExitoMensaje(mensaje); setShowExito(true); };
    const manejarError = (titulo, mensaje) => { setErrorTitulo(titulo); setErrorMensaje(mensaje); setShowError(true); };

    const localidadParaEditar = editId ? localidades.find(loc => loc.id === editId) : null;

    // Modal AM: campos
    const camposModal = useMemo(() => [
        // igual que antes
        {
            nombre: 'nombre',
            label: 'Nombre *',
            placeholder: 'Nombre localidad',
            requerido: true,
            validacion: v => {
                if (!v?.trim()) return 'Campo requerido';
                if (v.trim().length < 2) return 'Mínimo 2 caracteres';
                if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(v)) return 'Solo letras y espacios';
                return '';
            },
            autofocus: true
        },
        {
            nombre: 'provincia',
            label: 'Provincia *',
            tipo: 'select',
            placeholder: 'Selecciona provincia',
            requerido: true,
            opciones: provinciasActivas.map(p => ({ valor: p.id, etiqueta: p.nombre })),
            validacion: v => (!v ? 'Selecciona una provincia' : '')
        }
    ], [provinciasActivas]);

    const textosModal = {
        crear: { titulo: 'Nueva localidad', subtitulo: 'Añadir localidad', descripcion: 'Agrega el nombre y provincia de la localidad' },
        editar: { titulo: 'Modificar localidad', subtitulo: 'Editar localidad', descripcion: 'Cambia el nombre o la provincia de la localidad' }
    };

    const validacionDuplicados = valores => {
        const provinciaId = parseInt(valores.provincia);
        if (!provinciaId) return '';
        const nombreLower = valores.nombre?.trim().toLowerCase();
        if (!nombreLower) return '';
        const duplicado = localidades.some(loc =>
            loc.nombre.toLowerCase() === nombreLower &&
            loc.idProvincia === provinciaId &&
            !loc.fechaHoraBaja &&
            (!editId || loc.id !== editId)
        );
        if (duplicado) {
            const provName = provincias.find(p => p.id === provinciaId)?.nombre || 'la provincia seleccionada';
            return `Ya existe la localidad "${valores.nombre}" en la provincia ${provName}`;
        }
        return '';
    };

    // Render tabla
    const renderTabla = () => {
        if (cargando) return <ABMTableSkeleton columns={2} rows={6} showActions={true} />;
        if (!cargando && localidades.length === 0)
            return <div className="table-container"><div className="table-scroll" style={{padding:'32px 16px', textAlign:'center', color:'#6b7280'}}>No hay localidades registradas todavía.</div></div>;
        if (!cargando && localidadesFiltradas.length === 0)
            return <div className="table-container"><div className="table-scroll" style={{padding:'32px 16px', textAlign:'center', color:'#6b7280'}}>No hay resultados que coincidan con la búsqueda o filtro.</div></div>;

        return (
            <div className="table-container">
                <div className="table-scroll">
                    <TablaABM_Localidad
                        items={localidadesPagina}
                        columns={[
                            { key: 'nombre', header: 'Nombre', sortable: true },
                            { key: 'nombreProvincia', header: 'Provincia', sortable: true }
                        ]}
                        onModificar={item => { if (!item.fechaHoraBaja) { setEditId(item.id); setShowModal(true); } }}
                        onEliminar={handleEliminarClick}
                        onDarDeAlta={handleAltaClick}
                        sortConfig={sortConfig}
                        onSort={handleSort}
                    />
                </div>
            </div>
        );
    };

    return (
        <>
            <Navbar_Administrador />
            <div className="abm-page">
                <div className="container-fluid py-2">
                    <Breadcrumbs />
                </div>
                <div className="abm-card">
                    <h1 className="page-title">Gestionar localidades</h1>
                    <div className="abm-controls">
                        <div className="search-container">
                            <Buscador
                                placeholder="Buscar localidad"
                                value={busqueda}
                                onChange={texto => { setBusqueda(texto); setPaginaActual(1); }}
                                useSharedStyles={true}
                            />
                        </div>
                        <FiltroTipo
                            tiposDisponibles={tiposProvincias}
                            tipoSeleccionado={provinciaSeleccionada}
                            onChange={nuevo => { setProvinciaSeleccionada(nuevo); setPaginaActual(1); }}
                            maxLength={18}
                            compact={true}
                            showTooltip={true}
                            className="loc-filtro-provincia"
                        />
                        <button
                            type="button"
                            className="abm-primary-btn"
                            onClick={() => setShowModal(true)}
                        >
                            Nueva localidad
                        </button>
                    </div>
                    <p style={{ marginTop: 0, marginBottom: '12px', color:'#6b7280', fontWeight:500 }}>Gestionar todas las localidades aceptadas en el sistema.</p>
                    {renderTabla()}
                    <div className="abm-pagination">
                        <Paginacion
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
                    modo={editId ? 'editar' : 'crear'}
                    item={editId && localidadParaEditar ? { nombre: localidadParaEditar.nombre, provincia: localidadParaEditar.idProvincia } : null}
                    campos={camposModal}
                    textos={textosModal}
                    validacionPersonalizada={validacionDuplicados}
                    onClose={() => { setShowModal(false); setEditId(null); }}
                    onSave={async (data) => {
                        try {
                            if (editId) {
                                await handleEdit(data);
                                manejarExito('Localidad modificada', `La localidad se modificó correctamente a "${data.nombre}".`);
                            } else {
                                await handleSave(data);
                                manejarExito('Localidad creada', `La localidad "${data.nombre}" se creó correctamente.`);
                            }
                            setShowModal(false);
                            setEditId(null);
                        } catch (error) {
                            manejarError(editId ? 'Error al modificar la localidad' : 'Error al crear localidad', error.message || 'No se pudo completar la acción. Intenta nuevamente.');
                        }
                    }}
                />
            )}
            {/* Confirmación DAR DE BAJA */}
            <ModalConfirmarEditar
                titulo="Dar de baja localidad"
                mensaje={eliminarId ? `¿Estás seguro que deseas dar de baja "${eliminarId.nombre}"?` : ''}
                mostrar={showEliminarModal}
                accion="Dar de baja"
                onCancelar={() => { setShowEliminarModal(false); setEliminarId(null); }}
                onConfirmar={async () => {
                    await handleDelete(eliminarId.id);
                    setShowEliminarModal(false);
                }}
            />
            {/* Confirmación DAR DE ALTA */}
            <ModalConfirmarEditar
                titulo="Dar de alta localidad"
                mensaje={recuperarId ? `¿Estás seguro que deseas dar de alta nuevamente "${recuperarId.nombre}"?` : ''}
                mostrar={showRecuperarModal}
                accion="Dar de alta"
                onCancelar={() => { setShowRecuperarModal(false); setRecuperarId(null); }}
                onConfirmar={async () => {
                    await handleAlta(recuperarId.id);
                    setShowRecuperarModal(false);
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
}