import React from 'react';
import '../../../src/assets/abm-shared.css';

export default function TablaABM_Provincia({
  items = [],
  columns = [],
  onModificar,
  onEliminar,
  onDarDeAlta,
  sortConfig = null,
  onSort = null,
}) {
  const getSortIcon = (columnKey) => {
    if (!sortConfig || sortConfig.key !== columnKey) return '↕';
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  return (
    <table className="abm-table">
      <thead>
        <tr>
          {columns.map((col) => (
            <th
              key={col.key}
              onClick={col.sortable && onSort ? () => onSort(col.key) : undefined}
              style={{ cursor: col.sortable ? 'pointer' : 'default' }}
            >
              {col.header}
              {col.sortable && onSort && (
                <span style={{ marginLeft: 6, fontSize: '.8em', opacity: 0.6 }}>
                  {getSortIcon(col.key)}
                </span>
              )}
            </th>
          ))}
          <th style={{ width: '180px', textAlign: 'center' }}>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => {
          const estaDadaDeBaja = item.fechaHoraBaja !== null;
          return (
            <tr key={item.id}>
              {columns.map((col) => (
                <td key={col.key}>{item[col.key]}</td>
              ))}
              <td style={{ textAlign: 'center' }}>
                <div className="actions">
                  {estaDadaDeBaja ? (
                    <>
                      <button
                        className="abm-action-btn edit"
                        onClick={() => onModificar && onModificar(item)}
                        disabled
                        title="No se puede modificar una provincia dada de baja"
                      >
                        Modificar
                      </button>
                      <button
                        className="abm-action-btn activate"
                        onClick={() => onDarDeAlta && onDarDeAlta(item)}
                        title="Dar de alta provincia"
                      >
                        Dar de alta
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="abm-action-btn edit"
                        onClick={() => onModificar && onModificar(item)}
                      >
                        Modificar
                      </button>
                      <button
                        className="abm-action-btn delete"
                        onClick={() => onEliminar && onEliminar(item)}
                      >
                        Dar de baja
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
