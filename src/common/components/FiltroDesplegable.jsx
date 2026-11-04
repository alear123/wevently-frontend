import React from 'react';
const FiltroDesplegable = ({ label, opciones, valorSeleccionado, onCambio }) => {
  const styles = {
    contenedor: {
      margin: '0 10px 15px 0',
      display: 'flex',
      flexDirection: 'column',
      minWidth: '180px',
    },
    etiqueta: {
      marginBottom: '6px',
      fontSize: '14px',
      fontWeight: '600',
      color: '#333',
    },
    select: {
      padding: '10px',
      borderRadius: '6px',
      border: '1px solid #ccc',
      backgroundColor: '#fff',
      fontSize: '14px',
      color: '#333',
      cursor: 'pointer',
      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
      transition: 'border-color 0.2s ease',
    },
  };

  return (
    <div style={styles.contenedor}>
      <label style={styles.etiqueta}>{label}</label>
      <select
        value={valorSeleccionado}
        onChange={(e) => onCambio(e.target.value)}
        style={styles.select}
      >
        <option value="">Todos</option>
        {opciones.map((opcion) => (
          <option key={opcion} value={opcion}>
            {opcion}
          </option>
        ))}
      </select>
    </div>
  );
};

export default FiltroDesplegable;
