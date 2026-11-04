// src/pages/Ver_reporte_financiero.jsx
import React, { useState, useMemo, useRef, useEffect } from "react";
import GraficoIngresos from "./src/components/GraficoIngresos";
import html2pdf from "html2pdf.js";
import "./src/assets/reporte-styles.css"; // estilos custom (ruta ajustable)
import * as Utils from "../../../common/Utils.js"; // ajustá la ruta según tu proyecto
import Navbar_Prestador from "../../../common/layouts/Navbar_Prestador.jsx";
import Navbar_Propietario from "../../../common/layouts/Navbar_Propietario.jsx";
import Breadcrumbs from "../../../common/layouts/Breadcrumbs.jsx";
import { useReporteFinanciero } from "./src/api/api.js";
import { useLocation } from "react-router-dom";
import ReportesBar from "../src/components/ReportesBar.jsx";
import '../Visualizar_cantidad_de_usuarios_activos/src/assets/Reporte.css';
import { getLoggedUser } from "../../../common/Utils";
import ModalError from "../../../common/layouts/ModalError.jsx";
import GraficoTorta from "../src/components/GraficoTorta.jsx";
import GraficoLineal from "../src/components/GraficoLineal.jsx";
import TarjetaResumen from '../Visualizar_cantidad_de_usuarios_activos/src/components/TarjetaResumen.jsx';
import logo from '../../../assets/logo_wevently.png';

function useQuery() {
    return new URLSearchParams(useLocation().search);
}
// MOCK en formato B: { año, mes, ingresos }


const MONTH_LABELS = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const COLOR_PALETTE = [
    "#7c3aed", "#06b6d4", "#f97316", "#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#6366f1"
];

export default function Ver_reporte_financiero() {
    const { getIngresos, ingresos, getTipoDeEventos, tiposEventos, titulo, mensaje, mostrarError, setMostrarError, setTitulo, setMensaje } = useReporteFinanciero()
    const [rawData, setRawData] = useState([]);

    const [datosGraficoTorta, setDatosGraficoTorta] = useState([]);
    const [datosGraficoLineal, setDatosGraficoLineal] = useState([]);

    useEffect(() => {
        setRawData(ingresos.ingresosMensuales || []);
        setDatosGraficoTorta(ingresos.distribucionTiposEventos || []);
        setDatosGraficoLineal(ingresos.distribucionPorFecha || []);
    }, [ingresos]);

    const query = useQuery();
    const urlDesde = query.get("desde");
    const urlHasta = query.get("hasta");
    const hoy = new Date();
    const day = String(hoy.getDate()).padStart(2, '0');
    const month = String(hoy.getMonth() + 1).padStart(2, '0');
    const year = hoy.getFullYear();
    const fechaActual = `${year}-${month}-${day}`;
    const fechaInicio = `${year}-01-01`;
    const [fromDate, setFromDate] = useState(urlDesde ?? fechaInicio);
    const [toDate, setToDate] = useState(urlHasta ?? fechaActual);
    const [period, setPeriod] = useState("mensual"); // 'mensual' | 'trimestral' | 'anual'
    const [typeFilter, setTypeFilter] = useState("Todos");
    const [tiposdeEventos, setTiposDeEventos] = useState([])
    const [availableYears, setAvailableYears] = useState([]);
    const [selectedYears, setSelectedYears] = useState([]);

    const [visibleRows, setVisibleRows] = useState(12); // número inicial de filas mostradas
    const ROW_CHUNK = 12; // cuantas filas agrega cada "Ver más"

    const reportRef = useRef(null);

    useEffect(() => {
        getTipoDeEventos();
    }, []);

    useEffect(() => {
        setTiposDeEventos(tiposEventos);
    }, [tiposEventos]);

    useEffect(() => {
        const years = Array.from(new Set(rawData.map(r => r.año))).sort((a, b) => a - b);
        setAvailableYears(years);
        setSelectedYears(years.slice()); // por defecto todos seleccionados
    }, [rawData]);

    // parse helpers
    const parseDateFromYearMonth = (y, m) => new Date(y, m - 1, 1);
    const parseInputFromDate = str => {
        if (!str) return null;
        const [y, mm] = str.split("-").map(Number);
        return new Date(y, mm - 1, 1); // primer día del mes
    };

    const parseInputToDate = str => {
        if (!str) return null;
        const [y, mm] = str.split("-").map(Number);
        return new Date(y, mm, 0); // último día del mes
    };


    const filteredData = useMemo(() => {
        const from = parseInputFromDate(fromDate);
        const to = parseInputToDate(toDate);

        if (to) { to.setMonth(to.getMonth() + 1); to.setDate(0); }

        return rawData.filter(r => {
            const d = parseDateFromYearMonth(r.año, r.mes);
            if (from && d < from) return false;
            if (to && d > to) return false;
            if (typeFilter !== "Todos") {
                // placeholder por si agregás tipo en rawData
            }
            return true;
        });
    }, [rawData, fromDate, toDate, typeFilter]);

    const { labels, datasets } = useMemo(() => {
        const years = selectedYears.slice().sort((a, b) => a - b);
        if (years.length === 0) return { labels: [], datasets: [] };

        // construir months array por año
        const monthlyByYear = {};
        years.forEach(y => monthlyByYear[y] = new Array(12).fill(0));
        filteredData.forEach(r => {
            if (years.includes(r.año)) {
                const idx = Math.max(0, Math.min(11, r.mes - 1));
                monthlyByYear[r.año][idx] += r.ingresos;
            }
        });

        if (period === "mensual") {
            const labels = MONTH_LABELS;
            const datasets = years.map((y, idx) => ({
                label: `${y}`,
                data: monthlyByYear[y],
                backgroundColor: COLOR_PALETTE[idx % COLOR_PALETTE.length],
                borderColor: COLOR_PALETTE[idx % COLOR_PALETTE.length],
                borderWidth: 1,
                borderRadius: 6,
                borderSkipped: false,
            }));
            return { labels, datasets };
        }

        if (period === "trimestral") {
            const labels = ["Q1", "Q2", "Q3", "Q4"];
            const datasets = years.map((y, idx) => {
                const m = monthlyByYear[y];
                const quarters = [
                    m[0] + m[1] + m[2],
                    m[3] + m[4] + m[5],
                    m[6] + m[7] + m[8],
                    m[9] + m[10] + m[11],
                ];
                return {
                    label: `${y}`,
                    data: quarters,
                    backgroundColor: COLOR_PALETTE[idx % COLOR_PALETTE.length],
                    borderColor: COLOR_PALETTE[idx % COLOR_PALETTE.length],
                    borderWidth: 1,
                    borderRadius: 6,
                    borderSkipped: false,
                };
            });
            return { labels, datasets };
        }

        // anual
        if (period === "anual") {
            const labels = years.map(y => `${y}`);
            const datasets = [{
                label: "Total anual",
                data: years.map(y => monthlyByYear[y].reduce((a, b) => a + b, 0)),
                backgroundColor: COLOR_PALETTE[0],
                borderColor: COLOR_PALETTE[0],
                borderWidth: 1,
                borderRadius: 6,
                borderSkipped: false,
            }];
            return { labels, datasets };
        }

        return { labels: [], datasets: [] };
    }, [filteredData, selectedYears, period]);

    // Table rows construidas para periodo seleccionado (lista plana)
    const tableRows = useMemo(() => {
        const rows = [];
        const years = selectedYears.slice().sort((a, b) => a - b);
        if (period === "mensual") {
            years.forEach(y => {
                for (let mi = 0; mi < 12; mi++) {
                    const val = filteredData.find(r => r.año === y && r.mes === mi + 1)?.ingresos ?? 0;
                    rows.push({ periodo: MONTH_LABELS[mi], año: y, ingresos: val });
                }
            });
        } else if (period === "trimestral") {
            years.forEach(y => {
                for (let qi = 0; qi < 4; qi++) {
                    const monthsIdx = [qi * 3, qi * 3 + 1, qi * 3 + 2];
                    const val = monthsIdx.map(mi => filteredData.find(r => r.año === y && r.mes === mi + 1)?.ingresos ?? 0).reduce((a, b) => a + b, 0);
                    rows.push({ periodo: `Q${qi + 1}`, año: y, ingresos: val });
                }
            });
        } else if (period === "anual") {
            years.forEach(y => {
                const val = Array.from({ length: 12 }).reduce((acc, _, mi) => acc + (filteredData.find(r => r.año === y && r.mes === mi + 1)?.ingresos ?? 0), 0);
                rows.push({ periodo: `${y}`, año: y, ingresos: val });
            });
        }
        return rows;
    }, [filteredData, selectedYears, period]);

    const toggleYear = y => {
        setSelectedYears(prev => prev.includes(y) ? prev.filter(v => v !== y) : [...prev, y]);
    };

    const applyFiltersResetVisible = () => {
        setVisibleRows(ROW_CHUNK);
        // si tuvieras que recargar desde API, hacelo aquí (fetch...)
    };

    // Ver más / ver menos (comportamiento expandir)
    const handleShowMore = () => setVisibleRows(prev => Math.min(prev + ROW_CHUNK, tableRows.length));
    const handleShowLess = () => setVisibleRows(ROW_CHUNK);

    // Export PDF
    // Export PDF
    const handleDownload = () => {
        const report = reportRef.current;
        if (!report) return;

        const container = document.createElement("div");
        container.style.padding = "12px";
        container.style.background = "white";

        const now = new Date();
        const header = document.createElement("div");
        header.style.marginBottom = "10px";
        header.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center;">
            
            <!-- Columna izquierda -->
            <div>
                <h3 style="margin:0 0 6px 0; font-weight: bold;">Reporte Financiero</h3>
                <div style="font-size:1.0rem;color:#444; margin-bottom:15px">
                Visualiza ingresos históricos por período
                </div>
                <div style="font-size:0.8rem;color:#000000">
                Generado por: ${Utils.getLoggedUser?.().email ?? "usuario"}
                </div>
                <div style="font-size:0.8rem;color:#000000">
                Fecha de Generación: ${now.toLocaleDateString()} ${now.toLocaleTimeString()}
                </div>
            </div>

            <!-- Imagen a la derecha -->
            <img src=${logo} 
                alt="Logo" 
                style="height:100px; object-fit:contain;" />
        </div>
        `;

        container.appendChild(header);

        // ----------------------------------------------------
        // ✔ Capturar TODOS los canvas del reporte
        // ----------------------------------------------------
        const canvasList = report.querySelectorAll("canvas");

        canvasList.forEach((canvas, index) => {
            try {
                const img = document.createElement("img");
                img.src = canvas.toDataURL("image/png");
                img.style.width = "100%";
                img.style.margin = "10px 0";
                img.style.display = "block";

                const title = document.createElement("h4");
                title.textContent = `Gráfico ${index + 1}`;
                title.style.margin = "10px 0 5px 0";
                title.style.fontSize = "14px";

                container.appendChild(title);
                container.appendChild(img);
            } catch (err) {
                console.warn("Error al capturar un canvas:", err);
            }
        });

        // ----------------------------------------------------
        // ✔ Agregar tabla completa
        // ----------------------------------------------------
        const tableNode = report.querySelector("table");
        if (tableNode) {
            const clonedTable = tableNode.cloneNode(true);
            clonedTable.style.marginTop = "20px";
            container.appendChild(clonedTable);
        }

        // ----------------------------------------------------
        // PDF OPTIONS
        // ----------------------------------------------------
        const opt = {
            margin: [10, 10, 10, 10],
            filename: "reporte-financiero.pdf",
            image: { type: "jpeg", quality: 1 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        };

        html2pdf().set(opt).from(container).save();
    };


    function parseFechaLocal(fechaStr) {
        if (!fechaStr) return null;
        const [y, m, d] = fechaStr.split('-');
        return new Date(Number(y), Number(m) - 1, Number(d), 0, 0, 0, 0);
    }

    function fechaToDDMMYYYY(fechaStr) {
        const date = parseFechaLocal(fechaStr);
        if (!date || isNaN(date.getTime())) return '';
        return date.toLocaleDateString('es-AR');
    }

    return (
        <>
            {(getLoggedUser()?.rol === 'Prestador' ? <Navbar_Prestador /> : <Navbar_Propietario />)}
            <ReportesBar onSolicitarRango={() => showReportesModal()} />

            <div className="container my-4">
                <Breadcrumbs />
                <div className='reporte-header'>
                    <h1 className="reporte-titulo">Reporte Financiero</h1>
                    <p className="reporte-subtitulo">Visualiza ingresos históricos por período</p>
                </div>
                <div className="rango-info-container">
                    <div className='rango-info'>
                        <span className="rango-texto">Mostrando datos desde {fromDate ? fechaToDDMMYYYY(fromDate) : ''} hasta {toDate ? fechaToDDMMYYYY(toDate) : ''}</span>
                    </div>
                </div>
                <div style={{ marginBottom: "3vh", marginTop: "3vh" }}>
                    <TarjetaResumen
                        titulocabecera="Ingresos Totales"
                        valorResumen={`$${ingresos.total ? ingresos.total : 0}`}
                        descripcionInformativa="Total de ingresos recaudados en el período seleccionado"
                        icono="dinero"
                        colorIcono="#2433FF"
                    />
                </div>
                <div className="card shadow-sm border-0 p-3 mb-3 modern-card">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                        <div>
                            <h2 className="h5 mb-0"></h2>
                            <small className="text-muted"></small>
                        </div>
                    </div>

                    {/* Filters (Bootstrap grid, look moderno) */}
                    <div className="row g-3 align-items-end">
                        <div className="col-md-4">
                            <label className="form-label fw-semibold">Tipo de evento</label>
                            <select className="form-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
                                <option>Todos</option>
                                {tiposdeEventos.map(tipo =>
                                    <option>{tipo.nombre}</option>
                                )}
                            </select>
                        </div>

                        <div className="col-md-2">
                            <label className="form-label fw-semibold">Fecha desde</label>
                            <input className="form-control" type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} />
                        </div>

                        <div className="col-md-2">
                            <label className="form-label fw-semibold">Fecha hasta</label>
                            <input className="form-control"
                                type="date"
                                value={toDate}
                                onChange={e => {
                                    setToDate(e.target.value);
                                    if (e.target.value < fromDate) {
                                        setTitulo("Error");
                                        setMensaje("La fecha Hasta debe ser mayor que la fecha Desde")
                                        setMostrarError(true);
                                    }
                                }} />
                        </div>

                        <div className="col-md-2">
                            <label className="form-label fw-semibold">Período</label>
                            <select className="form-select" value={period} onChange={e => setPeriod(e.target.value)}>
                                <option value="mensual">Mensual</option>
                                <option value="trimestral">Trimestral</option>
                                <option value="anual">Anual</option>
                            </select>
                        </div>

                        <div className="col-md-2 d-grid">
                            <button className="btn btn-primary" style={{ backgroundColor: "#2433FF", borderColor: '#2433FF' }} onClick={() => { applyFiltersResetVisible(); getIngresos(fromDate, toDate, typeFilter) }}>
                                <i className="bi bi-funnel-fill me-1"></i> Aplicar
                            </button>
                        </div>
                    </div>

                    {/* Years selection */}
                    <div className="mt-3 d-flex flex-wrap gap-2 align-items-center">
                        <strong className="me-2">Años:</strong>
                        <div className="d-flex gap-2 flex-wrap">
                            {availableYears.map(y => (
                                <div className="form-check" key={y}>
                                    <input className="form-check-input" type="checkbox" id={`y-${y}`} checked={selectedYears.includes(y)} onChange={() => toggleYear(y)} />
                                    <label className="form-check-label" htmlFor={`y-${y}`}>{y}</label>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Report content */}
                <div ref={reportRef} className="card shadow-sm border-0 p-3 modern-card">
                    <div className="mb-3">
                        <h3 className="h6 mb-2">Ingresos por período</h3>
                    </div>

                    <div className="mb-4">
                        <GraficoIngresos labels={labels} datasets={datasets} />
                    </div>
                    <div class="container">
                        <div className="row" style={{ marginTop: "3vh" }}>
                            <div className="col-12 col-sm-12 col-md-6 " style={{ maxWidth: "100%" }} >
                                <GraficoTorta
                                    titulo="Distribucion por Tipo de Evento"
                                    datos={ingresos.distribucionTipoEvento || []}
                                />
                            </div>
                            <div className="col-12 col-sm-12 col-md-6" style={{ maxWidth: "100%" }}>

                                <GraficoLineal
                                    titulo="Ingresos por fecha"
                                    datos={ingresos.distribucionPorFecha} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <button
                className='btn-descargar-flotante'
                onClick={handleDownload}
            //disabled={cargando}
            >
                Descargar reporte
            </button>
            <ModalError
                titulo={titulo}
                mensaje={mensaje}
                mostrar={mostrarError}
                onCerrar={() => setMostrarError(false)} />
        </>
    );
}
