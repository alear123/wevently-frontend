import React from "react";

export default function Pagination({
  paginaActual,
  totalPaginas,
  setPaginaActual,
  inicio,
  fin,
  totalItems,
  cantidadMostrar,
  setCantidadMostrar,
  mostrarSelector = true,
}) {
  return (
    <div className="pagination-bar d-flex justify-content-between align-items-center w-100">
      <style>{`
        /* Desktop: que "Mostrar: [select]" quede centrado en la barra */
        .pagination-info {
          display: contents; /* sus hijos se comportan como si fueran hijos directos del contenedor */
        }
        .page-size {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-left: auto;   /* centra el elemento en el contenedor flex */
          margin-right: auto;  /* centra el elemento en el contenedor flex */
          width: auto;
        }

        /* Select personalizado */
        .custom-select-wrapper {
          position: relative;
          display: inline-block;
        }
        .custom-select {
          -webkit-appearance: none;
          -moz-appearance: none;
          appearance: none;
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 6px 32px 6px 12px; /* espacio para la flecha */
          font-size: 1rem;
          line-height: 1.2;
          outline: none;
          box-shadow: none;
          background-image: none;
          min-width: 56px;
        }
        .custom-select:focus {
          border-color: #3b82f6;
        }
        /* Flecha del select */
        .custom-select-wrapper::after {
          content: '';
          position: absolute;
          top: 50%;
          right: 10px; /* posición consistente */
          width: 0;
          height: 0;
          pointer-events: none;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 6px solid #888;
          transform: translateY(-50%);
        }

        /* Botones de paginación */
        .pagination .page-link {
          border-radius: 10px;
        }

        /* Mobile */
        @media (max-width: 576px) {
          .pagination-bar {
            flex-direction: column !important;
            align-items: center !important;
            gap: 12px;
          }

          /* En mobile: "Mostrando..." y "Mostrar: [select]" juntos y centrados */
          .pagination-info {
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            gap: 12px;
            width: 100%;
            flex-wrap: wrap; /* por si no entra todo en una sola línea */
            text-align: center;
          }
          .pagination-summary {
            width: auto;
            margin: 0;
          }
          .page-size {
            margin: 0; /* no centrado absoluto; se alinea junto al texto */
            width: auto; /* no ocupar todo el ancho */
          }
          .page-size .custom-select {
            width: auto;     /* ajusta al contenido */
            min-width: 56px;
            font-size: 0.95rem;
            padding: 6px 28px 6px 10px; /* mantiene espacio para la flecha */
          }

          /* Paginación centrada y compacta */
          nav .pagination {
            flex-wrap: wrap;
            justify-content: center;
            gap: 6px;
          }
          nav .pagination .page-item {
            margin: 0;
          }
          nav .pagination .page-link {
            padding: 6px 10px;
            min-width: 36px;
            min-height: 36px;
            line-height: 1.1;
            border-radius: 10px !important;
          }
        }
      `}</style>

      {/* Desktop: hijos directos del contenedor; Mobile: se agrupan vía .pagination-info */}
      <div className="pagination-info">
        <div className="pagination-summary text-muted">
          Mostrando {totalItems === 0 ? 0 : inicio + 1} a{" "}
          {totalItems === 0 ? 0 : Math.min(fin, totalItems)} de {totalItems}
        </div>

        {mostrarSelector && (
          <div className="page-size">
            <span className="text-muted">Mostrar:</span>
            <div className="custom-select-wrapper">
              <select
                className="custom-select"
                value={cantidadMostrar}
                onChange={(e) => {
                  setCantidadMostrar(Number(e.target.value));
                  setPaginaActual(1);
                }}
                aria-label="Cantidad por página"
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="15">15</option>
              </select>
            </div>
          </div>
        )}
      </div>

      <nav aria-label="Paginación">
        <ul className="pagination pagination-sm mb-0">
          <li className={`page-item ${paginaActual === 1 ? "disabled" : ""}`}>
            <button
              className="page-link"
              onClick={() => setPaginaActual(1)}
              aria-label="Primera página"
            >
              <span aria-hidden="true">&laquo;&laquo;</span>
            </button>
          </li>
          <li className={`page-item ${paginaActual === 1 ? "disabled" : ""}`}>
            <button
              className="page-link"
              onClick={() => setPaginaActual(paginaActual - 1)}
              aria-label="Anterior"
            >
              <span aria-hidden="true">&laquo;</span>
            </button>
          </li>

          {(() => {
            const maxVisible = 5; // cantidad máxima de botones visibles
            const pages = [];
            let start = Math.max(1, paginaActual - Math.floor(maxVisible / 2));
            let end = Math.min(totalPaginas, start + maxVisible - 1);

            // reajusta si estamos al final
            if (end - start < maxVisible - 1) {
              start = Math.max(1, end - maxVisible + 1);
            }

            // primera página + "..."
            if (start > 1) {
              pages.push(
                <li key={1} className="page-item">
                  <button className="page-link" onClick={() => setPaginaActual(1)}>1</button>
                </li>
              );
              if (start > 2) {
                pages.push(<li key="start-ellipsis" className="page-item disabled"><span className="page-link">…</span></li>);
              }
            }

            // rango visible
            for (let i = start; i <= end; i++) {
              pages.push(
                <li key={i} className={`page-item ${paginaActual === i ? "active" : ""}`}>
                  <button className="page-link" onClick={() => setPaginaActual(i)}>{i}</button>
                </li>
              );
            }

            // última página + "..."
            if (end < totalPaginas) {
              if (end < totalPaginas - 1) {
                pages.push(<li key="end-ellipsis" className="page-item disabled"><span className="page-link">…</span></li>);
              }
              pages.push(
                <li key={totalPaginas} className="page-item">
                  <button className="page-link" onClick={() => setPaginaActual(totalPaginas)}>{totalPaginas}</button>
                </li>
              );
            }

            return pages;
          })()}

          <li
            className={`page-item ${
              paginaActual === totalPaginas ? "disabled" : ""
            }`}
          >
            <button
              className="page-link"
              onClick={() => setPaginaActual(paginaActual + 1)}
              aria-label="Siguiente"
            >
              <span aria-hidden="true">&raquo;</span>
            </button>
          </li>
          <li
            className={`page-item ${
              paginaActual === totalPaginas ? "disabled" : ""
            }`}
          >
            <button
              className="page-link"
              onClick={() => setPaginaActual(totalPaginas)}
              aria-label="Última página"
            >
              <span aria-hidden="true">&raquo;&raquo;</span>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}
