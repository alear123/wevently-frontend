import React, { useEffect, useState, useMemo } from 'react';
import Navbar_Administrador from '../../../../common/layouts/Navbar_Administrador';
// Modal genérico compartido ABM
//import ModalAM from '../src/components/ModalAM.jsx';
import ModalAM from './src/components/ModalAM.jsx';
import Pagination from '../../../../common/layouts/Pagination';
import Breadcrumbs from '../../../../common/layouts/Breadcrumbs';
// Buscador compartido con estilos unificados
import Buscador from '../../../../common/components/Buscador.jsx';
import ModalConfirmarEliminar from '../../../../common/layouts/ModalConfirmarEliminar';
import ModalAccionExito from '../../../../common/layouts/ModalAccionExito';
import Modal_Error from '../../../../common/layouts/ModalError';
// Tabla ABM y skeleton compartidos
import TablaABM from '../src/components/TablaABM.jsx';
import ABMTableSkeleton from '../src/components/ABMTableSkeleton.jsx';
// CampoFecha (componente específico existente)
import CampoFecha from './src/components/CampoFecha';
// Hook de ordenamiento reutilizable
import useSort from '../src/hooks/useSort';
// Estilos compartidos ABM (el CSS local viejo queda implícitamente deprecado)
import '../src/assets/abm-shared.css';
// Estilos locales para ParametroComision (no tocar abm-shared.css)
import './src/assets/parametros.css';

import {
    obtenerDisponibles,
    crearNuevo,
    actualizarUno,
    darDeBajaUno
} from './src/api/ParametroComisionAPI';

const ParametroComision = () => {
    // Lista de parámetros (renombrado para evitar shadowing con nombre del componente)
    const [parametros, setParametros] = useState([]);
    const [editId, setEditId] = useState(null); // id del item a editar
    const [eliminarId, setEliminarId] = useState(null); // id del item a eliminar

    const [busqueda, setBusqueda] = useState('');
    const [showModal, setShowModal] = useState(false); // único modal (crear/editar)
    const [paginaActual, setPaginaActual] = useState(1);
    const [cantidadMostrar, setCantidadMostrar] = useState(10);
    const [showEliminarModal, setShowEliminarModal] = useState(false);

    const [cargando, setCargando] = useState(true);

    const [showExito, setShowExito] = useState(false);
    const [exitoTitulo, setExitoTitulo] = useState('');
    const [exitoMensaje, setExitoMensaje] = useState('');

    const [showError, setShowError] = useState(false);
    const [errorTitulo, setErrorTitulo] = useState('');
    const [errorMensaje, setErrorMensaje] = useState('');

    useEffect(() => {
        console.log('el componente parametro comision se montoo');
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            setCargando(true);
            const response = await obtenerDisponibles();
            console.log('rta recibida del back: ', response);
            if(Array.isArray(response)) {
                setParametros(response);
            } else {
                console.log('la rta no es un array', response);
                setParametros([]);
            }
        } catch (error) {
            console.log('error al cargar los datos: ', error);
            manejarError('Error de carga', 'Por favor, actualiza la página.');
        } finally {
            setCargando(false);
        }
    };
    
    const cerrarModal = () => {
        setShowModal(false);
        setEditId(null);
    };

    const cerrarModalEliminar = () => {
        setShowEliminarModal(false);
        setEliminarId(null);
    };

    const manejarExito = (titulo, mensaje) => {
        setExitoTitulo(titulo);
        setExitoMensaje(mensaje);
        setShowExito(true);
    };

    const formatearFechaAmigable = (fecha) => {
        if (!fecha) return '';
        
        try {
            const fechaObj = new Date(fecha);
            return fechaObj.toLocaleDateString('es-AR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });
        } catch (error) {
            return fecha;
        }
    };

    const manejarError = (titulo, mensaje) => {
        let mensajeFormateado = mensaje;
        
        const regexFechaISO = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/g;
        const regexFechaCompleta = /(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s+\w+\s+\d{1,2}\s+\d{4}\s+\d{2}:\d{2}:\d{2}\s+GMT[+-]\d{4}\s+\([^)]+\)/g;
        
        mensajeFormateado = mensajeFormateado.replace(regexFechaISO, (match) => {
            return formatearFechaAmigable(match);
        });
        
        mensajeFormateado = mensajeFormateado.replace(regexFechaCompleta, (match) => {
            return formatearFechaAmigable(match);
        });
        
        setErrorTitulo(titulo);
        setErrorMensaje(mensajeFormateado);
        setShowError(true);
    };

    const convertirADate = (fecha) => {
        if (!fecha) return null;
        if (fecha instanceof Date) return fecha;
        return new Date(fecha);
    };

    const formatearFecha = (fecha) => {
    if (!fecha) return '';
    
    let fechaObj;
    if (fecha instanceof Date) {
        fechaObj = fecha;
    } else {
        fechaObj = new Date(fecha);
    }
    
    if (isNaN(fechaObj.getTime())) {
        return '';
    }
    
    const año = fechaObj.getFullYear();
    const mes = String(fechaObj.getMonth() + 1).padStart(2, '0');
    const dia = String(fechaObj.getDate()).padStart(2, '0');
    
    return `${año}-${mes}-${dia}T00:00:00`;
};

const formatearFechaHasta = (fecha) => {
    if (!fecha) return '';
    
    let fechaObj;
    if (fecha instanceof Date) {
        fechaObj = fecha;
    } else {
        fechaObj = new Date(fecha);
    }
    
    if (isNaN(fechaObj.getTime())) {
        return '';
    }

    const año = fechaObj.getFullYear();
    const mes = String(fechaObj.getMonth() + 1).padStart(2, '0');
    const dia = String(fechaObj.getDate()).padStart(2, '0');
    
    return `${año}-${mes}-${dia}T23:59:59`;
};

    // Filtrado memoizado (solo activos: descarta baja lógica con cualquiera de los campos fechaHoraBaja / fechaBaja)
    const parametrosFiltrados = useMemo(() => (
        parametros
            .filter(p => !p.fechaHoraBaja && !p.fechaBaja)
            .filter(p => {
                if (!busqueda.trim()) return true;
                const texto = busqueda.toLowerCase();
                return (
                    String(p.comisionLugar ?? '').toLowerCase().includes(texto) ||
                    String(p.comisionServicio ?? '').toLowerCase().includes(texto) ||
                    String(p.descripcion ?? '').toLowerCase().includes(texto) ||
                    String(p.fechaDesde ?? '').toLowerCase().includes(texto) ||
                    String(p.fechaHasta ?? '').toLowerCase().includes(texto)
                );
            })
    ), [parametros, busqueda]);

    // Ordenamiento reutilizable
    const { sortConfig, sortedItems: sortedParametros, handleSort } = useSort(parametrosFiltrados, { resetPage: () => setPaginaActual(1), storageKey: 'sort:parametrosComision' });

    // Paginación
    const inicio = (paginaActual - 1) * cantidadMostrar;
    const fin = inicio + cantidadMostrar;
    const totalItems = sortedParametros.length;
    const totalPaginas = Math.ceil(totalItems / cantidadMostrar);
    const parametrosPagina = sortedParametros.slice(inicio, fin);

    const itemAEditar = parametros.find(p => p.id === editId);
    const itemAEliminar = parametros.find(p => p.id === eliminarId);

    const verificarSolapamientoFechas = (parametros, nuevaDesde, nuevaHasta, idActual = null) => {
        const desdeNueva = convertirADate(nuevaDesde);
        const hastaNueva = convertirADate(nuevaHasta);

        if (!desdeNueva || !hastaNueva) return false;

        return parametros.some(p => {
            if (p.fechaBaja || p.fechaHoraBaja) return false;

            if (idActual && p.id === idActual) return false;

            const desdeExistente = convertirADate(p.fechaDesde);
            const hastaExistente = convertirADate(p.fechaHasta);

            if (!desdeExistente || !hastaExistente) return false;

            return (
                desdeNueva <= hastaExistente &&
                hastaNueva >= desdeExistente
            );
        });
    };

    const handleSave = async (datos) => {
        try {
            console.log('🔍 Datos recibidos en handleSave:', datos);
            const existeItem = verificarSolapamientoFechas(parametros, datos.fechaDesde, datos.fechaHasta);
            if (existeItem) {
                const fechaDesdeFormateada = formatearFechaAmigable(datos.fechaDesde);
                const fechaHastaFormateada = formatearFechaAmigable(datos.fechaHasta);
                throw new Error(`Ya existe una comisión activa para el rango de fechas ${fechaDesdeFormateada} a ${fechaHastaFormateada}`);
            }

            const nuevoItem = {
                comisionLugar: parseFloat(datos.comisionLugar),
                comisionServicio: parseFloat(datos.comisionServicio),
                descripcion: datos.descripcion || '',
                fechaDesde: formatearFecha(datos.fechaDesde),
                fechaHasta: formatearFechaHasta(datos.fechaHasta),
                fechaBaja: null
            };

            console.log('📤 Datos formateados para enviar al backend:', nuevoItem);


            const ElementoNuevo = await crearNuevo(nuevoItem);
            if(ElementoNuevo) {
                setParametros(prev => [...prev, ElementoNuevo]);
                return true;
            }
            return false;
        } catch (error) {
            console.log('Error al crearla', error);
            manejarError('Error al crear la comisión', error.message || 'Ocurrió un error al crear la comisión, reintenta nuevamente.')
            throw error; 
        }
    };

    const handleEdit = async (idParametroComision, datos) => {
        try {
            const existeItem = verificarSolapamientoFechas(parametros, datos.fechaDesde, datos.fechaHasta, idParametroComision);
            if (existeItem) {
                const fechaDesdeFormateada = formatearFechaAmigable(datos.fechaDesde);
                const fechaHastaFormateada = formatearFechaAmigable(datos.fechaHasta);
                throw new Error(`Ya existe una comisión activa para el rango de fechas: ${fechaDesdeFormateada} a ${fechaHastaFormateada}`);
            }

            const itemActual = parametros.find(p => p.id === idParametroComision);
            if(!itemActual){
                throw new Error('Parametro comisión no encontrado');
            }

            const entidadCompleta = {
                id: itemActual.id,
                comisionLugar: parseFloat(datos.comisionLugar), 
                comisionServicio: parseFloat(datos.comisionServicio),
                descripcion: datos.descripcion || '',
                fechaDesde: formatearFecha(datos.fechaDesde),
                fechaHasta: formatearFecha(datos.fechaHasta)
            };

            const resultado = await actualizarUno(idParametroComision, entidadCompleta);

            if (resultado) {
                setParametros(prev =>
                    prev.map(p =>
                        p.id === idParametroComision
                            ? {
                                ...p, 
                                comisionLugar: parseFloat(datos.comisionLugar),
                                comisionServicio: parseFloat(datos.comisionServicio),
                                descripcion: datos.descripcion || '',
                                fechaDesde: formatearFecha(datos.fechaDesde),
                                fechaHasta: formatearFecha(datos.fechaHasta)
                            }
                            : p
                    )
                );
                return true;
            }
            return false;
        } catch (error) {
            console.error('error al actualizar el parametro: ', error);
            manejarError('Error al actualizar los datos', error.message || 'Ocurrió un error al actualizar el parametro comisión, reintenta nuevamente');
            throw error;
        }
    };

    const handleEliminarClick = (id) => {
        setEliminarId(id);
        setShowEliminarModal(true);
    };

    const handleDelete = async (idParametroComision) => {
        try {
            await darDeBajaUno(idParametroComision);
            cargarDatos();
            return true;
        } catch (error) {
            console.error('error al eliminar el parametro comisión: ', error);
            manejarError('Error al eliminar', error.message || 'Ocurrió un error al eliminar el parametro comisión, reintenta nuevamente');
            throw error;
        }
    };

    // Columnas para TablaABM (sortable donde tiene sentido)
    const columnasTabla = useMemo(() => ([
        { key: 'comisionLugar', header: 'Lugar (%)', sortable: true },
        { key: 'comisionServicio', header: 'Servicio (%)', sortable: true },
        {
            key: 'fechaDesde',
            header: 'Fecha alta',
            sortable: true,
            render: (item) => {
                if (!item.fechaDesde) return '-';
                return typeof item.fechaDesde === 'string'
                    ? item.fechaDesde.split('T')[0]
                    : item.fechaDesde.toISOString().split('T')[0];
            }
        },
        {
            key: 'fechaHasta',
            header: 'Fecha vigencia',
            sortable: true,
            render: (item) => {
                if (!item.fechaHasta) return '-';
                return typeof item.fechaHasta === 'string'
                    ? item.fechaHasta.split('T')[0]
                    : item.fechaHasta.toISOString().split('T')[0];
            }
        },
        { key: 'descripcion', header: 'Descripción' }
    ]), []);

    const textoModal = {
        crear: {
            titulo: "Nuevo parámetro comisión",
            subtitulo: "Añadir parámetro comisión",
            descripcion: "Completa los campos de la nueva comisión."
        },
        editar: {
            titulo: "Editar parámetro comisión",
            subtitulo: "Modificar parámetro comisión",
            descripcion: "Actualiza las características del parámetro comisión."
        }
    };

    const camposModal = [
        {
            nombre: "comisionServicio",
            label: "Porcentaje servicio * (solo dígitos numéricos)",
            tipo: "text",
            placeholder: "0.0",
            requerido: true,
            validacion: (valor) => {
                const valorString = typeof valor === 'string' ? valor : String(valor);
            
                if (!valorString || (typeof valor === 'string' && !valor.trim())) {
                    return 'El porcentaje es requerido';
                }

                const regex = /^(\d{1,3})(\.\d*)?$/;
                if (!regex.test(valorString)) return 'Solo se permiten números y un punto decimal';

                if (!valorString.endsWith('.')) {
                    const nro = parseFloat(valorString);
                    if (isNaN(nro) || nro < 0 || nro > 100) return 'El porcentaje debe estar entre 0 y 100';
                }
                
                return '';
            }
        },
        {
            nombre: "comisionLugar",
            label: "Porcentaje lugar * (solo dígitos numéricos)",
            tipo: "text",
            placeholder: "0.0",
            requerido: true,
            validacion: (valor) => {
                const valorString = typeof valor === 'string' ? valor : String(valor);
            
                if (!valorString || (typeof valor === 'string' && !valor.trim())) {
                    return 'El porcentaje es requerido';
                }

                const regex = /^(\d{1,3})(\.\d*)?$/;
                if (!regex.test(valorString)) return 'Solo se permiten números y un punto decimal';

                if (!valorString.endsWith('.')) {
                    const nro = parseFloat(valorString);
                    if (isNaN(nro) || nro < 0 || nro > 100) return 'El porcentaje debe estar entre 0 y 100';
                }

                return '';
            }
        },
        {
            nombre: "descripcion",
            label: "Descripción (opcional)",
            tipo: "text",
            placeholder: "descripción opcional",
            requerido: false,
            maxLength: 50
        },
        {
            nombre: "fechaDesde",
            label: "Fecha de alta *",
            tipo: "component",
            componente: CampoFecha,
            placeholder: "Selecciona una fecha de inicio",
            requerido: true,
            validacion: (valor) => {
                if (!valor) return 'La fecha es requerida';
                if (typeof valor === 'string' && !valor.trim()) return 'La fecha es requerida';

                const fecha = valor instanceof Date ? valor : new Date(valor);
                const hoy = new Date();
                hoy.setHours(0, 0, 0, 0);

                return '';
            }
        },
        {
            nombre: "fechaHasta",
            label: "Fecha de finalización *",
            tipo: "component",
            componente: CampoFecha,
            placeholder: "Selecciona una fecha de fin",
            // minDate puede depender de la fechaDesde actual del formulario; ModalAM resolve si es función
            minDate: function(valores) { return valores && valores.fechaDesde ? valores.fechaDesde : null; },
            requerido: true,
            validacion: (valor) => {
                if (!valor) return 'La fecha es requerida';
                if (typeof valor === 'string' && !valor.trim()) return 'La fecha es requerida';

                const fecha = valor instanceof Date ? valor : new Date(valor);
                const hoy = new Date();
                hoy.setHours(0, 0, 0, 0);

                return '';
            }
        }
    ];

    const validacionPersonalizadaFechas = (valores) => {
        const fechaDesde = valores.fechaDesde;
        const fechaHasta = valores.fechaHasta;

        if (fechaDesde && fechaHasta) {
            const desde = new Date(fechaDesde);
            const hasta = new Date(fechaHasta);

            if (desde >= hasta) {
                return 'La fecha de finalización debe ser posterior a la fecha de alta';
            }
        }
        return null;
    };

    return (
        <>
            <Navbar_Administrador />
            <div className="abm-page">
                <div className="container-fluid py-2">
                    <Breadcrumbs />
                </div>
                <div className="abm-card">
                    <h1 className="page-title">Parámetros de comisión</h1>
                    <div className="abm-controls">
                        <Buscador
                            placeholder="Buscar comisión"
                            value={busqueda}
                            onChange={texto => { setBusqueda(texto); setPaginaActual(1); }}
                            filtrarMientrasEscribes={true}
                            useSharedStyles={true}
                        />
                        <button
                            type="button"
                            className="abm-primary-btn"
                            onClick={() => { setEditId(null); setShowModal(true); }}
                        >
                            Agregar parámetro
                        </button>
                    </div>
                    <p style={{ marginTop: 0, marginBottom: '12px', color: '#6b7280', fontWeight: 500 }}>
                        Gestiona las comisiones vigentes por lugares y servicios.
                    </p>
                    {cargando ? (
                        <div className="table-container"><div className="table-scroll"><ABMTableSkeleton columns={5} rows={6} showActions={true} /></div></div>
                    ) : parametros.length === 0 ? (
                        <div className="table-container"><div className="table-scroll" style={{padding:'32px 16px', textAlign:'center', color:'#6b7280'}}>No hay parámetros de comisión cargados.</div></div>
                    ) : parametrosFiltrados.length === 0 ? (
                        <div className="table-container"><div className="table-scroll" style={{padding:'32px 16px', textAlign:'center', color:'#6b7280'}}>No hay resultados que coincidan con la búsqueda.</div></div>
                    ) : (
                        <TablaABM
                            items={parametrosPagina}
                            columns={columnasTabla}
                            onModificar={(item) => { setEditId(item.id); setShowModal(true); }}
                            onEliminar={(item) => handleEliminarClick(item.id)}
                            sortConfig={sortConfig}
                            onSort={handleSort}
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
                    item={editId ? itemAEditar : null}
                    onClose={cerrarModal}
                    onSave={async (datos) => {
                        try {
                            if (editId) {
                                const ok = await handleEdit(editId, datos);
                                if (ok) manejarExito('Comisión modificada', 'La comisión se modificó correctamente.');
                            } else {
                                const ok = await handleSave(datos);
                                if (ok) manejarExito('Comisión creada', 'La comisión se creó correctamente.');
                            }
                        } catch (error) {
                            console.error('Error en guardado modal:', error);
                        } finally {
                            cerrarModal();
                        }
                    }}
                        overlayClassName="parametro-modal"
                    textos={textoModal}
                    campos={camposModal}
                    validacionPersonalizada={validacionPersonalizadaFechas}
                />
            )}
            <ModalConfirmarEliminar
                titulo="Eliminar comisión"
                mensaje={`¿Estás seguro que deseas eliminar la comisión (servicio: ${itemAEliminar?.comisionServicio ?? ''}% | lugar: ${itemAEliminar?.comisionLugar ?? ''}%)?`}
                mostrar={showEliminarModal}
                onCancelar={cerrarModalEliminar}
                onConfirmar={async () => {
                    try {
                        await handleDelete(eliminarId);
                        cerrarModalEliminar();
                        manejarExito('Comisión eliminada', 'La comisión se eliminó correctamente.');
                    } catch (error) {
                        cerrarModalEliminar();
                        manejarError('Error al eliminar la comisión', error.message || 'No se pudo eliminar la comisión, intenta nuevamente');
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

export default ParametroComision;