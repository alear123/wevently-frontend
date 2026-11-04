import servicioImg1 from '../assets/servicioImg1.jpg';
import servicioImg2 from '../assets/servicioImg2.jpg';
import servicioImg3 from '../assets/servicioImg3.jpg';
import servicioImg4 from '../assets/servicioImg4.jpg';

const Servicios = [
    {
      id: 1,
      nombreServicio: 'Servicio Técnico para eventos Lavalle',
      estrellas: 4.5,
      tipoServicio: 'Iluminación y sonido',
      descripcion: 'Servicio de sonido e iluminación para eventos',
      imagen: [servicioImg1],
      departamentos: [
        { id: 46, nombreLocalidad: "San Salvador de Jujuy" },
        { id: 47, nombreLocalidad: "Palpalá" },
        { id: 48, nombreLocalidad: "Libertador General San Martín" },
        { id: 49, nombreLocalidad: "Perico" },
        { id: 50, nombreLocalidad: "Tilcara" }
      ]
    },
    {
      id: 2,
      nombreServicio: 'Fotografía Godoy',
      estrellas: 4.4,
      tipoServicio: 'Fotografía',
      descripcion: 'Servicio de fotografía',
      imagen: [servicioImg2],
      departamentos: [
        { id: 61, nombreLocalidad: "Mendoza" },
        { id: 62, nombreLocalidad: "San Rafael" },
        { id: 63, nombreLocalidad: "Godoy Cruz" },
        { id: 64, nombreLocalidad: "Luján de Cuyo" },
        { id: 65, nombreLocalidad: "Guaymallén" }
      ]
    },
    {
      id: 3,
      nombreServicio: 'Servicio de decoración',
      estrellas: 4.5,
      tipoServicio: 'Decoración',
      descripcion: 'Servicio de decoración para eventos',
      imagen: [servicioImg3],
      departamentos: [
        { id: 86, nombreLocalidad: "San Juan" },
        { id: 87, nombreLocalidad: "Rawson" },
        { id: 88, nombreLocalidad: "Chimbas" },
        { id: 89, nombreLocalidad: "Rivadavia" },
        { id: 90, nombreLocalidad: "Pocito" }
      ]
    },
    {
      id: 4,
      nombreServicio: 'Catering Maipú',
      estrellas: 4.0,
      tipoServicio: 'Catering',
      descripcion: 'Servicio de catering',
      imagen: [servicioImg4],
      departamentos: [
        { id: 46, nombreLocalidad: "San Salvador de Jujuy" },
        { id: 47, nombreLocalidad: "Palpalá" },
        { id: 48, nombreLocalidad: "Libertador General San Martín" },
        { id: 49, nombreLocalidad: "Perico" },
        { id: 50, nombreLocalidad: "Tilcara" }
      ]
    },
    {
      id: 5,
      nombreServicio: 'Servicio Técnico para eventos Lavalle 2',
      estrellas: 1,
      tipoServicio: 'Iluminación y sonido',
      descripcion: 'Servicio de sonido e iluminación para eventos',
      imagen: [servicioImg1],
      departamentos: [
        { id: 76, nombreLocalidad: "Viedma" },
        { id: 77, nombreLocalidad: "General Roca" },
        { id: 78, nombreLocalidad: "San Carlos de Bariloche" },
        { id: 79, nombreLocalidad: "Cipolletti" },
        { id: 80, nombreLocalidad: "Villa Regina" }
      ]
    },
    {
      id: 6,
      nombreServicio: 'Fotografía Godoy 2',
      estrellas: 2,
      tipoServicio: 'Fotografía',
      descripcion: 'Servicio de fotografía',
      imagen: [servicioImg2],
      departamentos: [
        { id: 86, nombreLocalidad: "San Juan" },
        { id: 87, nombreLocalidad: "Rawson" },
        { id: 88, nombreLocalidad: "Chimbas" },
        { id: 89, nombreLocalidad: "Rivadavia" },
        { id: 90, nombreLocalidad: "Pocito" }
      ]
    },
    {
      id: 7,
      nombreServicio: 'Servicio de decoración 2',
      estrellas: 3,
      tipoServicio: 'Decoración',
      descripcion: 'Servicio de decoración para eventos',
      imagen: [servicioImg3],
      departamentos: [
        { id: 76, nombreLocalidad: "Viedma" },
        { id: 77, nombreLocalidad: "General Roca" },
        { id: 78, nombreLocalidad: "San Carlos de Bariloche" },
        { id: 79, nombreLocalidad: "Cipolletti" },
        { id: 80, nombreLocalidad: "Villa Regina" }
      ]
    },
    {
      id: 8,
      nombreServicio: 'Catering Maipú 2',
      estrellas: 5,
      tipoServicio: 'Catering',
      descripcion: 'Servicio de catering',
      imagen: [servicioImg4],
      departamentos: [
        { id: 61, nombreLocalidad: "Mendoza" },
        { id: 62, nombreLocalidad: "San Rafael" },
        { id: 63, nombreLocalidad: "Godoy Cruz" },
        { id: 64, nombreLocalidad: "Luján de Cuyo" },
        { id: 65, nombreLocalidad: "Guaymallén" }
      ]
    },
]

export default Servicios;