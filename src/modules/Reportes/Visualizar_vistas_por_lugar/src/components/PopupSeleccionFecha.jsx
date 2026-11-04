import React from "react";
import {useState, useEffect} from "react";
import '../assets/Popup.css';
import '../assets/Reporte.css';

export default function PopupSeleccionFecha({
    onSeleccionarFechas,
    onCancelar
}) {

    const [fechaDesde, setFechaDesde] = useState(null);
    const [fechaHasta, setFechaHasta] = useState(null);
    const [errores, setErrores] = useState({});

    const validarCampos = (desde, hasta) => {
        const nuevosErrores ={};

        if(!desde) {
            nuevosErrores.fechaDesde = 'Debe elegir ambas fechas';
        }

        if(!hasta) {
            nuevosErrores.fechaHasta = 'Debe elegir ambas fechas';
        }

        if(desde && hasta) {
            const fechaDesdeObj = new Date(desde);
            const fechaHastaObj = new Date(hasta);

            if(fechaDesdeObj> fechaHastaObj) {
                nuevosErrores.rango = 'La fecha hasta no peude ser amyor a fecha desde';
                nuevosErrores.fechaDesde = true;
                nuevosErrores.fechaHasta = true;
            }
        }

        //para validar fechas futuras
        const hoy = new Date();
        hoy.setHours(23, 59, 59, 999);

        if(desde) {
            const fechaDesdeObj = new Date(desde + 'T00:00:00');
            if(fechaDesdeObj > hoy) {
                nuevosErrores.fechaDesde = 'No se puede elegir una fecha futura';
            }
        }

        if(hasta){
            const fechaHastaObj = new Date(hasta + 'T00:00:00');
            if(fechaHastaObj > hoy) {
                nuevosErrores.fechaHasta = 'no se puede elegir una fecha futura';
            }
        }

        return nuevosErrores;
    };

    useEffect(() => {
        if(fechaDesde || fechaHasta) { //actualizar esto en el otro reporte
            const nuevosErrores = validarCampos(fechaDesde, fechaHasta);
            setErrores(nuevosErrores);
        }
    }, [fechaDesde, fechaHasta]);

    const validarYProcesar = () => {
        const nuevosErrores = validarCampos(fechaDesde, fechaHasta);

        if(Object.keys(nuevosErrores).length === 0) {
            const fechaDesdeObj = new Date(fechaDesde + 'T00:00:00');
            const fechaHastaObj = new Date(fechaHasta + 'T23:59:59');

            onSeleccionarFechas({
                fechaDesde: fechaDesdeObj,
                fechaHasta: fechaHastaObj
            });
        }
    };

    const handleFechaDesdeChange = (e) => {
        const fechaSeleccionada = e.target.value;

        if(fechaSeleccionada) {
            const fechaObj = new Date(fechaSeleccionada + 'T00:00:00');
            const hoy = new Date();
            hoy.setHours(23, 59, 59, 999);

            if(fechaObj > hoy) {
                return;
            }
        }
        setFechaDesde(fechaSeleccionada);
    };

    const handleFechaHastaChange = (e) => {
        const fechaSeleccionada = e.target.value;

        if(fechaSeleccionada) {
            const fechaObj = new Date(fechaSeleccionada + 'T00:00:00');
            const hoy = new Date();
            hoy.setHours(23, 59, 59, 999);

            if(fechaObj > hoy) {
                return;
            }
        }
        setFechaHasta(fechaSeleccionada);
    };

    const esBotonGenerarHabilitado = () => {
        return fechaDesde && fechaHasta && Object.keys(errores).length === 0;
    };

    const obtenerFechaMaxima = () => {
        const hoy = new Date();
        const anio = hoy.getFullYear();
        const mes = String(hoy.getMonth() +1).padStart(2, '0');
        const dia = String(hoy.getDate()).padStart(2, '0');
        return `${anio}-${mes}-${dia}`;

    };

    return (
  <div className="popup-overlay">
    <div className="popup-content">
      <div className="popup-header">
        <div className="popup-icon">
          <span>i</span>
        </div>
        <h3>Info del reporte</h3>
        <button className="pop-up-close" onClick={onCancelar}>×</button>
      </div>

      <h4>Selecciona la fecha</h4>
      <p>La fecha elegida sirve para generar el reporte</p>

      <div className="popup-field">
        <label className="popup-label">Fecha desde</label>
        <input
          type="date"
          value={fechaDesde || ''}
          onChange={handleFechaDesdeChange}
          max={obtenerFechaMaxima()}
          className={`parametro-datepicker ${errores.fechaDesde ? 'error' : ''}`}
          placeholder="Seleccione fecha"
        />
        {errores.fechaDesde && typeof errores.fechaDesde === 'string' && (
          <span className="popup-error">{errores.fechaDesde}</span>
        )}
      </div>

      <div className="popup-field" style={{ marginBottom: errores.rango ? '8px' : '24px' }}>
        <label className="popup-label">Fecha hasta</label>
        <input
          type="date"
          value={fechaHasta || ''}
          onChange={handleFechaHastaChange}
          min={fechaDesde}
          max={obtenerFechaMaxima()}
          className={`parametro-datepicker ${errores.fechaHasta ? 'error' : ''}`}
          placeholder="Seleccione fecha"
        />
        {errores.fechaHasta && typeof errores.fechaHasta === 'string' && (
          <span className="popup-error">{errores.fechaHasta}</span>
        )}
      </div>

      {errores.rango && (
        <div className="popup-field">
          <span className="popup-error">{errores.rango}</span>
        </div>
      )}

      <div className="popup-buttons">
        <button className="cancelar" onClick={onCancelar}>Cancelar</button>
        <button
          className={`generar ${!esBotonGenerarHabilitado() ? 'disabled' : ''}`}
          onClick={validarYProcesar}
          disabled={!esBotonGenerarHabilitado()}
        >
          Generar
        </button>
      </div>
    </div>
  </div>
);
}