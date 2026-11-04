import { useEffect, useState, useMemo } from "react";
import useSort from "../src/hooks/useSort";
import { formatMonto } from '../src/utils/formatters.js';
import Navbar_Administrador from "../../../../common/layouts/Navbar_Administrador";
import Pagination from '../../../../common/layouts/Pagination';
import Breadcrumbs from '../../../../common/layouts/Breadcrumbs';
import ModalAccionExito from '../../../../common/layouts/ModalAccionExito';
import ModalConfirmarEditar from "../../../../common/layouts/ModalConfirmarEditar.jsx";
import Modal_Error from '../../../../common/layouts/ModalError';
import Buscador from '../../../../common/components/Buscador';
import TablaABM from '../src/components/TablaABM.jsx';
import '../src/assets/abm-shared.css';

import {
    obtenerTranferenciasPendientes,
    confirmarTransferencia
} from "./src/api/TransferenciasAPI.js";

export default function GestionarTransferenciasPendientes() {
    const [transferencias, setTransferencias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [busqueda, setBusqueda] = useState('');
    const [paginaActual, setPaginaActual] = useState(1);
    const [cantidadMostrar, setCantidadMostrar] = useState(10);
    const [transferenciaIdConfirm, setTransferenciaIdConfirm] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorMensaje, setErrorMensaje] = useState('');
    const [successMensaje, setSuccessMensaje] = useState('');

    // Ordenamiento
    const { sortConfig, sortedItems, handleSort } = useSort(
        useMemo(() => transferencias.filter(filtrarTransferencias), [transferencias, busqueda]),
        {
            initialKey: null,
            initialDirection: null,
            locale: 'es',
            sensitivity: 'base',
            resetPage: () => setPaginaActual(1),
            storageKey: 'sort_transferenciasPendientes'
        }
    );

    useEffect(() => {
        cargarTransferencias();
    }, []);

    async function cargarTransferencias() {
        setLoading(true);
        const result = await obtenerTranferenciasPendientes();
        if (result.success) {
            setTransferencias(result.data);
        } else {
            setErrorMensaje('Ocurrió un error al cargar las transferencias pendientes.');
            setShowErrorModal(true);
        }
        setLoading(false);
    }

    function filtrarTransferencias(t) {
        if (!busqueda.trim()) return true;
        const texto = busqueda.trim().toLowerCase();
        return [
            t.nombreOrganizador,
            t.nombrePrestador,
            t.alias,
            t.cbucvu,
            String(t.montoAtransferir),
            t.fechaOperacion
        ].some(campo => campo && String(campo).toLowerCase().includes(texto));
    }

    // Paginación
    const inicio = (paginaActual - 1) * cantidadMostrar;
    const fin = inicio + cantidadMostrar;
    const totalItems = sortedItems.length;
    const totalPaginas = Math.ceil(totalItems / cantidadMostrar);
    const itemsPagina = sortedItems.slice(inicio, fin);

    // Columnas tabla
    const columnasTabla = useMemo(() => [
        { key: 'fechaOperacion', header: 'Fecha operación', sortable: true, render: i => (new Date(i.fechaOperacion)).toLocaleDateString('es-AR') },
        { key: 'nombreOrganizador', header: 'Organizador', sortable: true },
        { key: 'nombrePrestador', header: 'Prestador', sortable: true },
        { key: 'alias', header: 'Alias/CBU/CVU', sortable: true, render: i => i.alias || i.cbucvu || '-' },
        { key: 'montoAtransferir', header: 'Monto a transferir', sortable: true, render: i => formatMonto(i.montoAtransferir) },
        {
            key: 'accion', header: 'Acción', render: i => (
                <button
                    className="abm-action-btn activate"
                    onClick={() => { setTransferenciaIdConfirm(i.idAuditoriaTransaccion); setShowConfirmModal(true); }}
                    disabled={!!i.fechaHoraModificacion}
                >
                    Transferido
                </button>)
        }
    ], []);

    // Confirmar transferencia
    async function confirmar(id) {
        setShowConfirmModal(false);
        const result = await confirmarTransferencia(id);
        if (result.success) {
            setSuccessMensaje('Transferencia confirmada correctamente.');
            setShowSuccessModal(true);
            await cargarTransferencias();
        } else {
            setErrorMensaje('Ha ocurrido un error al guardar. Intente nuevamente más tarde.');
            setShowErrorModal(true);
        }
    }

    return (
        <>
            <Navbar_Administrador />
            <div className="abm-page">
                <div className="container-fluid py-2">
                    <Breadcrumbs />
                    <div className="abm-card">
                        <h1 className="page-title">Transferencias Pendientes</h1>
                        <div className="abm-controls" style={{ alignItems: 'stretch' }}>
                            <div className="search-container">
                                <Buscador
                                    placeholder="Buscar transferencia..."
                                    value={busqueda}
                                    onChange={texto => { setBusqueda(texto); setPaginaActual(1); }}
                                    useSharedStyles
                                />
                            </div>
                        </div>
                        <p style={{ marginTop: 0, marginBottom: '12px', color: '#6b7280', fontWeight: 500 }}>
                            Mira los montos pendientes de transferir a prestadores/propietarios para realizar la operación manualmente.
                        </p>
                        <div className="table-container">
                            {loading
                                ? <div className="abm-empty">Cargando transferencias pendientes...</div>
                                : itemsPagina.length
                                    ? (
                                        <TablaABM
                                            items={itemsPagina}
                                            columns={columnasTabla}
                                            sortConfig={sortConfig}
                                            onSort={handleSort}
                                            actionsColumn={false}
                                        />
                                    )
                                    : (
                                        <div className="abm-empty" style={{ marginTop: '12px' }}>
                                            {busqueda
                                                ? 'No se encontraron transferencias que coincidan con la búsqueda.'
                                                : 'No hay transferencias pendientes.'}
                                        </div>
                                    )
                            }
                        </div>
                        <div className="abm-pagination">
                            <Pagination
                                paginaActual={paginaActual}
                                totalPaginas={totalPaginas}
                                setPaginaActual={setPaginaActual}
                                inicio={inicio + 1}
                                fin={Math.min(fin, totalItems)}
                                totalItems={totalItems}
                                cantidadMostrar={cantidadMostrar}
                                setCantidadMostrar={setCantidadMostrar}
                                mostrarSelector
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de Confirmación */}
            <ModalConfirmarEditar
                titulo="¿Ya hiciste la transferencia manual? "
                mensaje="Esta acción no se puede deshacer"
                mostrar={showConfirmModal}
                accion="Confirmar"
                onCancelar={() => setShowConfirmModal(false)}
                onConfirmar={() => confirmar(transferenciaIdConfirm)}
            />

            {/* Modal de éxito */}
            <ModalAccionExito
                titulo="¡Operación exitosa!"
                mensaje={successMensaje}
                mostrar={showSuccessModal}
                onAceptar={() => setShowSuccessModal(false)}
            />

            {/* Modal de error */}
            <Modal_Error
                titulo="Error"
                mensaje={errorMensaje}
                mostrar={showErrorModal}
                onCerrar={() => setShowErrorModal(false)}
            />
        </>
    );
}