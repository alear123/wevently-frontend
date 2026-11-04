import React from 'react';
import '../assets/abm-shared.css';

/* Skeleton reutilizable para tablas ABM
   Props:
    - columns: cantidad de columnas de datos (sin contar Acciones)
    - rows: cantidad de filas skeleton
    - showActions: si la tabla real tendría columna de acciones
*/
export default function ABMTableSkeleton({ columns = 5, rows = 6, showActions = true }) {
  const totalCols = columns + (showActions ? 1 : 0);
  return (
    <div className="table-container">
      <div className="table-scroll">
        <table className="abm-skeleton-table">
          <thead>
            <tr>
              {Array.from({ length: totalCols }).map((_, i) => (
                <th key={i} style={{ height: '14px', padding: '12px 16px' }}>&nbsp;</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, r) => (
              <tr className="abm-skeleton-row" key={r}>
                {Array.from({ length: totalCols }).map((__, c) => (
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
}
