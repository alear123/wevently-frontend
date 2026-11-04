import lugarImagen from '../assets/lugarImagen.png';

const Lugares = [
  {
    id: 1,
    nombreLugar: 'Bodega Penedo',
    estrellas: 4.5, //hardcodeado
    direccion: "Ruta 7",
    tipoLugar: { id: 1, nombreTipoLugar: "Bodega"},
    descripcion: 'Bodega para eventos',
    capacidad: 100,
    imagen: [lugarImagen],
    localidad: { id: 64, nombreLocalidad: "Luján de Cuyo" },
    precioLugar: {id: 5, precio: 98766}
  },

  {
    id: 2,
    nombreLugar: 'Quinta Luján',
    estrellas: 3, //hardcodeado
    direccion: "Ruta 3",
    tipoLugar: { id: 2, nombreTipoLugar: "Quinta"},
    descripcion: 'Quinta para eventos',
    capacidad: 50,
    imagen: [lugarImagen],
    localidad: { id: 64, nombreLocalidad: "Luján de Cuyo" },
    precioLugar: {id: 6, precio: 98765}
  },

  {
    id: 3,
    nombreLugar: 'Museo Municipal de Arte Moderno Mendoza',
    estrellas: 4, //hardcodeado
    direccion: "Plaza independencia",
    tipoLugar: { id: 3, nombreTipoLugar: "Museo"},
    descripcion: 'Bodega para eventos',
    capacidad: 30,
    imagen: [lugarImagen],
    localidad: { id: 61, nombreLocalidad: "Mendoza"},
    precioLugar: {id: 7, precio: 87621}
  },

  {
    id: 4,
    nombreLugar: 'Teatro Jujuy',
    estrellas: 4.5, //hardcodeado
    direccion: "Calle 1",
    tipoLugar: { id: 4, nombreTipoLugar: "Teatro"},
    descripcion: 'Bodega para eventos',
    capacidad: 120,
    imagen: [lugarImagen],
    localidad: { id: 46, nombreLocalidad: "San Salvador de Jujuy" },
    precioLugar: {id: 8, precio: 33568}
    
  },

  {
    id: 5,
    nombreLugar: 'Bodega A16',
    estrellas: 4.5, //hardcodeado
    direccion: "Calle 1",
    tipoLugar: { id: 1, nombreTipoLugar: "Bodega"},
    descripcion: 'Bodega para eventos',
    capacidad: 60,
    imagen: [lugarImagen],
    localidad: { id: 64, nombreLocalidad: "Luján de Cuyo" },
    precioLugar: {id: 9, precio: 88129}
    
  },

  {
    id: 6,
    nombreLugar: 'Quinta Luján 2',
    estrellas: 3, //hardcodeado
    direccion: "Calle 1",
    tipoLugar: { id: 2, nombreTipoLugar: "Quinta"},
    descripcion: 'Quinta para eventos',
    capacidad: 130,
    imagen: [lugarImagen],
    localidad: { id: 64, nombreLocalidad: "Luján de Cuyo" },
    precioLugar: {id: 10, precio: 76548}
    
  },

  {
    id: 7,
    nombreLugar: 'Museo de Mendoza',
    estrellas: 4, //hardcodeado
    direccion: "Calle 1",
    tipoLugar: { id: 3, nombreTipoLugar: "Museo"},
    descripcion: 'Bodega para eventos',
    capacidad: 80,
    imagen: [lugarImagen],
    localidad: { id: 61, nombreLocalidad: "Mendoza"},
    precioLugar: {id: 11, precio: 53456}
    
  },

  {
    id: 8,
    nombreLugar: 'Teatro Jujuy Capital',
    estrellas: 4.5, //hardcodeado
    direccion: "Calle 1",
    tipoLugar: { id: 4, nombreTipoLugar: "Teatro"},
    descripcion: 'Bodega para eventos',
    capacidad: 90,
    imagen: [lugarImagen],
    localidad: { id: 46, nombreLocalidad: "San Salvador de Jujuy" },
    precioLugar: {id: 12, precio: 91218}
  }
  
];

export default Lugares;