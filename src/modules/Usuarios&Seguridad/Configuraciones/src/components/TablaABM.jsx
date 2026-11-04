import React from "react";
import "../assets/abm-shared.css";

/*
  TablaABM ahora soporta columnas dinámicas.
  Props:
   - items: array de objetos
   - columns: [{ key, header, render?(item) }]
   - onModificar(item), onEliminar(item) (si no se provee una columna custom de acciones)
   - actionsColumn?: false | { header?: string, render?: (item)=>ReactNode }
*/
export default function TablaABM({
  items = [],
  columns = [{ key: 'nombre', header: 'Nombre' }],
  onModificar,
  onEliminar,
  actionsColumn,
  sortConfig, // {key, direction}
  onSort // function(key)
}) {
  const showDefaultActions = actionsColumn !== false;
  const actionsHeader = actionsColumn?.header || 'Acciones';
  const customActionsRender = actionsColumn?.render;

  return (
    <div className="table-container">
      <div className="table-scroll">
        <table className="abm-table">
          <thead>
            <tr>
              {columns.map(col => {
                const isSortable = col.sortable && onSort;
                const isActive = isSortable && sortConfig?.key === col.key;
                const ariaSort = isActive ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none';
                return (
                  <th
                    key={col.key}
                    className={isSortable ? 'sortable' : undefined}
                    onClick={isSortable ? () => onSort(col.key) : undefined}
                    aria-sort={isSortable ? ariaSort : undefined}
                    scope="col"
                  >
                    <span style={{ display:'inline-flex', alignItems:'center' }}>
                      {col.header}
                      {isSortable && (
                        (() => {
                          let symbol = '↕';
                          let stateClass = 'neutral';
                          if (isActive) {
                            if (sortConfig.direction === 'asc') { symbol = '▲'; stateClass = 'asc'; }
                            else if (sortConfig.direction === 'desc') { symbol = '▼'; stateClass = 'desc'; }
                          }
                          return (
                            <span
                              className={`sort-icon ${stateClass}`}
                              aria-hidden="true"
                            >{symbol}</span>
                          );
                        })()
                      )}
                    </span>
                  </th>
                );
              })}
              {showDefaultActions && <th>{actionsHeader}</th>}
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr>
                <td colSpan={columns.length + (showDefaultActions ? 1 : 0)} style={{ textAlign:'center', padding:'1.25rem', color:'#666', fontSize:'.9rem' }}>
                  No hay registros para mostrar
                </td>
              </tr>
            )}
            {items.map(item => (
              <tr key={item.id}>
                {columns.map(col => (
                  <td key={col.key}>
                    {col.render ? col.render(item) : item[col.key]}
                  </td>
                ))}
                {showDefaultActions && (
                  <td>
                    {customActionsRender ? (
                      customActionsRender(item)
                    ) : (
                      <div className="actions">
                        {onModificar && (
                          <button
                            className="abm-action-btn edit"
                            onClick={() => onModificar(item)}
                          >Modificar</button>
                        )}
                        {onEliminar && (
                      (item.fechaHoraBaja != null || item.fechaBaja != null) ? (
                        <button
                          className="abm-action-btn enable"
                          style={{ backgroundColor: '#16a34a', color: 'white' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onEliminar && onEliminar({ ...item, esHabilitar: true });
                          }}
                        >
                          Habilitar
                        </button>
                      ) : (
                        <button
                          className="abm-action-btn delete"
                          style={{ backgroundColor: '#dc2626', color: 'white' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onEliminar && onEliminar(item);
                          }}
                        >
                          Eliminar
                        </button>
                      )

                    )}


                      </div>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
