import { useEffect, useState, useMemo } from "react";
import useSort from "../src/hooks/useSort";
import { humanizeEnum, formatMonto, formatTiempoSegundos, chipClassEstadoProveedor, chipClassVisible } from '../src/utils/formatters.js';
import Navbar_Administrador from "../../../../common/layouts/Navbar_Administrador";
import Pagination from '../../../../common/layouts/Pagination';
import Breadcrumbs from '../../../../common/layouts/Breadcrumbs';
import ModalAccionExito from '../../../../common/layouts/ModalAccionExito';
import Modal_Error from '../../../../common/layouts/ModalError';
import Buscador from '../../../../common/components/Buscador';
//import ModalAM from '../src/components/ModalAM.jsx';
import ModalAM from './src/components/ModalAM.jsx'
import TablaABM from '../src/components/TablaABM.jsx';
// Usamos ahora la versión compartida de FiltroTipo
import FiltroTipo from '../src/components/FiltroTipo.jsx';
import '../src/assets/abm-shared.css';
import './src/assets/Medios.css'; /* quedarán sólo overrides necesarios */

import {
    obtenerMediosDisponibles,
    cambiarVisibilidadMedio,
    sincronizarConProveedor
} from './src/api/mediosDePagoAPI';

//hasta q funcione el backend
import { mediosDePagoMockAPI } from './src/api/MockMediosDePago';

export default function MediosDePago() {

    const[MediosDePago, setMediosDePago] = useState([]); //esperar a ver como conecot con el back
    const[cargando, setCargando] = useState(true);
    const[sincronizando, setSincronizando] = useState(false);
    // Ordenamiento (hook reutilizable)
    const [paginaActual, setPaginaActual] = useState(1);
    const [cantidadMostrar, setCantidadMostrar] = useState(10);
    const { sortConfig, sortedItems: sortedItemsBase, handleSort } = useSort([], { }); // inicial placeholder, se recalcula más abajo

    const[busqueda, setBusqueda] = useState('');
    const [tipoFiltro, setTipoFiltro] = useState('Todos');

    const[editId, setEditId] = useState(null);
    const[eliminarId, setEliminarId] = useState(null);

    const[showExito, setShowExito] = useState(false);
    const[exitoTitulo, setExitoTitulo] = useState('');
    const[exitoMensaje, setExitoMensaje] = useState('');

    const[showError, setShowError] = useState(false);
    const[errorTitulo, setErrorTitulo] = useState('');
    const[errorMensaje, setErrorMensaje] = useState('');

    const tiposDisponibles = [...new Set(MediosDePago.map(medio => medio.tipo))].sort();

    useEffect(() => {
        cargarMedios(true);
    }, []);
    
    const cargarMedios = async() => {
        setCargando(true);
        try {
            //const resultado = await mediosDePagoMockAPI.obtenerMediosDisponibles();
            const resultado = await obtenerMediosDisponibles();
            if(resultado.success){
                setMediosDePago(resultado.data);
            } else {
                manejarError('Error al cargar los medios', resultado.error);
            }
        } catch (error) {
            manejarError('Error al cargar los medios', error.message);
        } finally {
            setCargando(false);
        }
    };



    const cerrarModalEditar = () => {
        setEditId(null);
    }


    const manejarExito = (titulo, mensaje) => {
        setExitoTitulo(titulo);
        setExitoMensaje(mensaje);
        setShowExito(true);
    }

    const manejarError = (titulo, mensaje) => {
        setErrorTitulo(titulo);
        setErrorMensaje(mensaje);
        setShowError(true);
    } 

    const ItemFiltradosBase = MediosDePago.filter(p => {
    
        const cumpleBusqueda = !busqueda.trim() || [
            p.nombre,
            p.tipo,
            p.estado,
            p.montoMax,
            p.montoMin
        ].some(campo => 
            String(campo || '').toLowerCase().includes(busqueda.toLowerCase())
        );

        const cumpleTipo = tipoFiltro === 'Todos' || p.tipo === tipoFiltro;

        return cumpleBusqueda && cumpleTipo;
    });

    const manejarCambioTipo = (nuevoTipo) => {
        setTipoFiltro(nuevoTipo);
        setPaginaActual(1); 
    };

    const { sortConfig: mediosSortConfig, sortedItems: mediosOrdenados, handleSort: handleSortMedios } = useSort(ItemFiltradosBase, { resetPage: () => setPaginaActual(1), storageKey: 'sort:mediosPago' });
    const ItemFiltrados = mediosOrdenados;

    const inicio = (paginaActual -1) *cantidadMostrar;
    const fin = inicio + cantidadMostrar;

    const totalItems = ItemFiltrados.length;
    const totalPaginas = Math.ceil(totalItems / cantidadMostrar);

    const ItemsPaginas = ItemFiltrados.slice(inicio, fin);


    const itemAEditar = MediosDePago.find(p => p.id == editId);
    const itemAEliminar = MediosDePago.find(p => p.id === eliminarId);


    const manejarSincronizacion = async() => {
        setSincronizando(true);
        try {
            //const resultado = await mediosDePagoMockAPI.sincronizarConProveedor();
            const resultado = await sincronizarConProveedor();

            if(resultado.success){
                await cargarMedios();
                manejarExito('Sincronización exitosa', 'Los medios de pago se sincronizaron exitosamente con el proveedor');
            } else {
                manejarError('Error en la sincronización', resultado.error)
            }
        } catch (error) {
            manejarError('Error en la sincronización', 
                error.message || 'No se pudo sincronizar con el proveedor idk'
            );
        } finally {
            setSincronizando(false);
        }
    };

    const handleEdit = async(id, datos) => {
        try {
            //const resultado = await mediosDePagoMockAPI.cambiarVisibilidadMedio(id);
            const resultado = await cambiarVisibilidadMedio(id);
            
            if(resultado.success) {
                setMediosDePago(prev => 
                    prev.map(medio => medio.id === id ? resultado.data : medio)
                );
                return resultado.data;
            }else {
                throw new Error(resultado.error);
            }
        } catch (error) {
            throw error;
        }
       
    };

    //props para la tabla
    const columnasTabla = useMemo(() => ([
        { key: 'nombre', header: 'Nombre', sortable: true },
        { key: 'tipo', header: 'Tipo', sortable: true, render: i => humanizeEnum(i.tipo) },
        { key: 'estado', header: 'Estado proveedor', sortable: true, render: i => (
            <span className={chipClassEstadoProveedor(i.estado)}>{i.estado}</span>
        ) },
        { key: 'esVisible', header: 'Visible', sortable: true, render: i => (
            <span className={chipClassVisible(i.esVisible)}>{i.esVisible ? 'Sí' : 'No'}</span>
        ) },
        { key: 'montoMax', header: 'Monto máximo', sortable: true, render: i => formatMonto(i.montoMax) },
        { key: 'montoMin', header: 'Monto mínimo', sortable: true, render: i => formatMonto(i.montoMin) }
    ]), []);

    const toggleSort = handleSortMedios;

    const textoModal = {
        editar: {
            titulo: "Editar medio",
            subtitulo: "Modificar la visibilidad del medio",
            descripcion: "Actualiza la visibilidad del medio de pago para los compradores"
        }
    };


    const camposModal = [
        {
            nombre: "nombre",
            label: "Nombre",
            tipo: "text",
            placeholder: "Nombre del medio",
            requerido: false,
            soloLectura: true
        },
        {
            nombre: "esVisible",
            label: "Visibilidad para compradores",
            tipo: "switch", //aca deberia ser un tipo pildora/interruptor booleano
            requerido: false,
            soloLectura: false

        },
        {
            nombre: "tipo",
            label: "Tipo",
            tipo: "text",
            placeholder: "Tipo de medio",
            requerido: false,
            soloLectura: true,
            formatValue: (valor) => valor?.replace(/_/g, ' ')
        },
        {
            nombre: "estado",
            label: "Estado en proveedor",
            tipo: "text",
            placeholder: "Estado del medio",
            requerido: false,
            soloLectura: true
        },
        {
            nombre: "montoMax",
            label: "Monto máximo",
            tipo: "text",
            placeholder: "Monto máximo",
            requerido: false,
            soloLectura: true,
            formatValue: (valor) => formatMonto(valor)
        },
        {
            nombre: "montoMin",
            label: "Monto mínimo",
            tipo: "text",
            placeholder: "Monto mínimo",
            requerido: false,
            soloLectura: true,
            formatValue: (valor) => formatMonto(valor)
        },
        {
            nombre: "tiempoAcreditacion",
            label: "Tiempo de acreditación",
            tipo: "text",
            placeholder: "Tiempo de acreditación",
            requerido: false,
            soloLectura: true,
            formatValue: (valor) => formatTiempoSegundos(valor)
        }
    ];

    const LoaderTabla = () => (
        <div className="table-container">
            <div className="table-scroll">
                <table className="abm-skeleton-table">
                    <tbody>
                        {Array.from({ length: 6 }).map((_,i) => (
                            <tr className="abm-skeleton-row" key={i}>
                                {Array.from({ length: 7 }).map((__,c) => (
                                    <td className="abm-skeleton-cell" key={c}>
                                        <span className={`abm-skel-bar ${c % 3 === 0 ? 'short' : ''}`}></span>
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <>
            <Navbar_Administrador />
                        <div className="abm-page">
                            <div className="container-fluid py-2"><Breadcrumbs /></div>
                            <div className="abm-card">
                                <h1 className="page-title">Medios de pago</h1>
                                <div className="abm-controls" style={{ alignItems:'stretch' }}>
                                    <div className="search-container">
                                        <Buscador
                                            placeholder="Buscar medio"
                                            value={busqueda}
                                            onChange={texto => { setBusqueda(texto); setPaginaActual(1); }}
                                            useSharedStyles={true}
                                        />
                                    </div>
                                    <FiltroTipo
                                        tiposDisponibles={tiposDisponibles}
                                        tipoSeleccionado={tipoFiltro}
                                        onChange={manejarCambioTipo}
                                        maxLength={18}
                                        compact={true}
                                        showTooltip={true}
                                    />
                                    <button
                                        type="button"
                                        className="abm-outline-btn medio-sync"
                                        onClick={manejarSincronizacion}
                                        disabled={sincronizando}
                                    >
                                        {sincronizando ? 'Sincronizando...' : 'Sincronizar con proveedor'}
                                    </button>
                                </div>
                                <p style={{ marginTop:0, marginBottom:'12px', color:'#6b7280', fontWeight:500 }}>Gestiona los medios de pago disponibles para los compradores.</p>
                                {cargando ? (
                                    <LoaderTabla />
                                ) : (
                                    <div className="table-container">
                                        <div className="table-scroll">
                                            <TablaABM
                                                items={ItemsPaginas}
                                                columns={columnasTabla}
                                                onModificar={item => setEditId(item.id)}
                                                onEliminar={false}
                                                sortConfig={mediosSortConfig}
                                                onSort={toggleSort}
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
                                {!cargando && ItemsPaginas.length === 0 && (
                                    <div className="abm-empty" style={{ marginTop:'12px' }}>
                                        {busqueda ? 'No se encontraron medios que coincidan con la búsqueda.' : 'No hay medios de pago disponibles. Sincroniza con el proveedor.'}
                                    </div>
                                )}
                            </div>
                        </div>
            
                        {editId !== null && itemAEditar && (
                            <ModalAM
                                modo="editar"
                                item={itemAEditar}
                                onClose={cerrarModalEditar}
                                onSave={async (datos) => {
                                    try {
                                        await handleEdit(editId, datos);
                                        cerrarModalEditar();
                                        manejarExito(
                                            'Medio de pago modificado',
                                            `Se actualizó correctamente la visibilidad del medio "${itemAEditar.nombre}" para los compradores`
                                        );
                                    } catch (error) {
                                        cerrarModalEditar();
                                        manejarError(
                                            'Error al modificar el medio de pago',
                                            error.message || 'No se pudo modificar la visibilidad, intenta nuevamente'
                                        );
                                    }
                                }}
                                textos={textoModal}
                                campos={camposModal}
                            />
                        )}

            <ModalAccionExito
                titulo={exitoTitulo}
                mensaje={exitoMensaje}
                mostrar={showExito}
                onAceptar={()=> setShowExito(false)}
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