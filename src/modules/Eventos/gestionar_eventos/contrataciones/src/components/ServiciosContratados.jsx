import { FaClipboardList, FaRegMoneyBillAlt } from 'react-icons/fa';
import ServicioCard from '../components/ServicioCard';
import Buscador from '../../../../../../common/components/Buscador.jsx';
import { useState } from 'react';
import FiltroDesplegable from '../../../../../../common/components/FiltroDesplegable.jsx'; 
import { useNavigate } from 'react-router-dom';
  

const ServiciosContratados = ({ servicios = [] , ResenaActiva , idEvento}) => {
  const [busqueda, setBusqueda] = useState("");
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("");
  const categorias = Array.from(new Set(servicios.map(s => s.categoria)));
  const total = servicios.reduce((acc, s) => acc + Number(String(s.precio).replace(/[^0-9.]/g, "")), 0);

  const navigate = useNavigate();

  const handleBuscarServicios = () => {
    navigate(`/buscar-servicios`,{ state: { } });
  };


  const serviciosFiltrados = servicios.filter(s =>
    s.nombre.toLowerCase().includes(busqueda.toLowerCase()) &&
    (categoriaSeleccionada === "" || s.categoria === categoriaSeleccionada)
  );

  if (!Array.isArray(servicios) || servicios.length === 0) {
    return (
      <>
        <p>Aún no tienes servicios contratados</p>
        <button 
          className="btn-servicios" 
          onClick={handleBuscarServicios}>
          Buscar servicios
        </button>
      </>
    );
  }

return (
  <div className="servicios-lista-1">
    <div className="servicios-titulo">
      <FaClipboardList className="icono-lista" />
      <span>Servicios contratados</span>
    </div>

    {/* Buscador arriba */}
    <div className="buscador-superior">
      <Buscador
        placeholder="Buscar por nombre del servicio..."
        value={busqueda}
        onChange={setBusqueda}
      />
    </div>

    <div className="servicios-barra">
      <div className="servicios-total">
        <FaRegMoneyBillAlt className="icono-dinero" />
        <span>Total contratado: ${total.toLocaleString('es-AR')}</span>
      </div>

      <div className="filtros-container">
        {/*<div className="filtro-desplegable">
          <FiltroDesplegable
            label="Categoría"
            opciones={categorias}
            valorSeleccionado={categoriaSeleccionada}
            onCambio={setCategoriaSeleccionada}
          />
        </div>*/}
      </div>
    </div>

    {serviciosFiltrados.map((servicio, i) => (
      <ServicioCard key={i} servicio={servicio} ResenaActiva={ResenaActiva} idEvento={idEvento}/>
    ))}
  </div>
);

};

export default ServiciosContratados;