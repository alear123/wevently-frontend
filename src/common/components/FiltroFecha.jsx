// src/components/FiltroFecha.jsx
import React from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const FiltroFecha = ({ fechaDesde, setFechaDesde, fechaHasta, setFechaHasta }) => {
  const contenedor = {
    display: "flex",
    gap: "20px",
    margin: "0 10px 15px 0",
    minWidth: "220px", // Igual que FiltroDesplegable
    width: "100%", // Ocupa todo el espacio disponible
  }

  const item = {
    display: "flex",
    flexDirection: "column",
    flex: 1,
  }

  const label = {
    marginBottom: "6px",
    fontSize: "14px",
    fontWeight: "600",
    color: "#333",
  }

  const inputEstilos = {
    width: "100%",
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "14px",
    color: "#333",
    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
    height: "40px", // Igual que el select de FiltroDesplegable
  }

  return (
    <>
      <style jsx>{`
        /* DatePicker Styles */
        :global(.filtro-select) {
          width: 100% !important;
          padding: 10px !important;
          border: 1px solid #ccc !important;
          border-radius: 6px !important;
          font-size: 14px !important;
          color: #333 !important;
          background: white !important;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05) !important;
          height: 40px !important;
          box-sizing: border-box !important;
          transition: border-color 0.2s, box-shadow 0.2s !important;
        }

        :global(.filtro-select:focus) {
          outline: none !important;
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
        }

        /* Personalizar el calendario del DatePicker */
        :global(.react-datepicker) {
          border: 1px solid #d1d5db !important;
          border-radius: 8px !important;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1) !important;
          font-family: inherit !important;
        }

        :global(.react-datepicker__header) {
          background: #f9fafb !important;
          border-bottom: 1px solid #e5e7eb !important;
          border-radius: 8px 8px 0 0 !important;
        }

        :global(.react-datepicker__current-month) {
          color: #1f2937 !important;
          font-weight: 600 !important;
        }

        :global(.react-datepicker__day-name) {
          color: #6b7280 !important;
          font-weight: 500 !important;
        }

        :global(.react-datepicker__day) {
          color: #374151 !important;
          border-radius: 6px !important;
        }

        :global(.react-datepicker__day:hover) {
          background: #f3f4f6 !important;
          border-radius: 6px !important;
        }

        :global(.react-datepicker__day--selected) {
          background: #3b82f6 !important;
          color: white !important;
          border-radius: 6px !important;
        }

        :global(.react-datepicker__day--in-selecting-range) {
          background: #dbeafe !important;
          color: #1e40af !important;
          border-radius: 6px !important;
        }

        :global(.react-datepicker__day--in-range) {
          background: #dbeafe !important;
          color: #1e40af !important;
          border-radius: 6px !important;
        }

        :global(.react-datepicker__day--range-start) {
          background: #3b82f6 !important;
          color: white !important;
          border-radius: 6px !important;
        }

        :global(.react-datepicker__day--range-end) {
          background: #3b82f6 !important;
          color: white !important;
          border-radius: 6px !important;
        }

        :global(.react-datepicker__day--disabled) {
          color: #d1d5db !important;
          cursor: not-allowed !important;
        }

        :global(.react-datepicker__navigation) {
          border: none !important;
          background: none !important;
        }

        :global(.react-datepicker__navigation:hover) {
          background: #f3f4f6 !important;
          border-radius: 4px !important;
        }

        :global(.react-datepicker__triangle) {
          border-bottom-color: #f9fafb !important;
        }

        :global(.react-datepicker__triangle::before) {
          border-bottom-color: #d1d5db !important;
        }
      `}</style>

      <div style={contenedor}>
        <div style={item}>
          <label style={label}>Fecha desde</label>
          <DatePicker
            selected={fechaDesde}
            onChange={(date) => setFechaDesde(date)}
            dateFormat="dd/MM/yyyy"
            placeholderText="Seleccionar fecha"
            maxDate={fechaHasta}
            style={inputEstilos}
            className="filtro-select"
          />
        </div>
        <div style={item}>
          <label style={label}>Fecha hasta</label>
          <DatePicker
            selected={fechaHasta}
            onChange={(date) => setFechaHasta(date)}
            dateFormat="dd/MM/yyyy"
            placeholderText="Seleccionar fecha"
            minDate={fechaDesde}
            style={inputEstilos}
            className="filtro-select"
          />
        </div>
      </div>
    </>
  )
}

export default FiltroFecha