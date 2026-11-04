const Provincias = [
  {
    id: 1,
    nombreProvincia: "Buenos Aires",
    departamentos: [
      { id: 1, nombreLocalidad: "La Plata" },
      { id: 2, nombreLocalidad: "Mar del Plata" },
      { id: 3, nombreLocalidad: "Bahía Blanca" },
      { id: 4, nombreLocalidad: "Tandil" },
      { id: 5, nombreLocalidad: "San Nicolás" }
    ]
  },
  {
    id: 2,
    nombreProvincia: "Ciudad Autónoma de Buenos Aires",
    departamentos: [
      { id: 6, nombreLocalidad: "Palermo" },
      { id: 7, nombreLocalidad: "Recoleta" },
      { id: 8, nombreLocalidad: "Belgrano" },
      { id: 9, nombreLocalidad: "Almagro" },
      { id: 10, nombreLocalidad: "Caballito" }
    ]
  },
  {
    id: 3,
    nombreProvincia: "Catamarca",
    departamentos: [
      { id: 11, nombreLocalidad: "San Fernando del Valle de Catamarca" },
      { id: 12, nombreLocalidad: "Andalgalá" },
      { id: 13, nombreLocalidad: "Belén" },
      { id: 14, nombreLocalidad: "Tinogasta" },
      { id: 15, nombreLocalidad: "Santa María" }
    ]
  },
  {
    id: 4,
    nombreProvincia: "Chaco",
    departamentos: [
      { id: 16, nombreLocalidad: "Resistencia" },
      { id: 17, nombreLocalidad: "Presidencia Roque Sáenz Peña" },
      { id: 18, nombreLocalidad: "Villa Ángela" },
      { id: 19, nombreLocalidad: "Charata" },
      { id: 20, nombreLocalidad: "Machagai" }
    ]
  },
  {
    id: 5,
    nombreProvincia: "Chubut",
    departamentos: [
      { id: 21, nombreLocalidad: "Rawson" },
      { id: 22, nombreLocalidad: "Trelew" },
      { id: 23, nombreLocalidad: "Comodoro Rivadavia" },
      { id: 24, nombreLocalidad: "Esquel" },
      { id: 25, nombreLocalidad: "Puerto Madryn" }
    ]
  },
  {
    id: 6,
    nombreProvincia: "Córdoba",
    departamentos: [
      { id: 26, nombreLocalidad: "Córdoba" },
      { id: 27, nombreLocalidad: "Villa María" },
      { id: 28, nombreLocalidad: "Río Cuarto" },
      { id: 29, nombreLocalidad: "Carlos Paz" },
      { id: 30, nombreLocalidad: "Alta Gracia" }
    ]
  },
  {
    id: 7,
    nombreProvincia: "Corrientes",
    departamentos: [
      { id: 31, nombreLocalidad: "Corrientes" },
      { id: 32, nombreLocalidad: "Goya" },
      { id: 33, nombreLocalidad: "Paso de los Libres" },
      { id: 34, nombreLocalidad: "Mercedes" },
      { id: 35, nombreLocalidad: "Curuzú Cuatiá" }
    ]
  },
  {
    id: 8,
    nombreProvincia: "Entre Ríos",
    departamentos: [
      { id: 36, nombreLocalidad: "Paraná" },
      { id: 37, nombreLocalidad: "Concordia" },
      { id: 38, nombreLocalidad: "Gualeguaychú" },
      { id: 39, nombreLocalidad: "Villaguay" },
      { id: 40, nombreLocalidad: "La Paz" }
    ]
  },
  {
    id: 9,
    nombreProvincia: "Formosa",
    departamentos: [
      { id: 41, nombreLocalidad: "Formosa" },
      { id: 42, nombreLocalidad: "Clorinda" },
      { id: 43, nombreLocalidad: "Pirané" },
      { id: 44, nombreLocalidad: "El Colorado" },
      { id: 45, nombreLocalidad: "Laguna Blanca" }
    ]
  },
  {
    id: 10,
    nombreProvincia: "Jujuy",
    departamentos: [
      { id: 46, nombreLocalidad: "San Salvador de Jujuy" },
      { id: 47, nombreLocalidad: "Palpalá" },
      { id: 48, nombreLocalidad: "Libertador General San Martín" },
      { id: 49, nombreLocalidad: "Perico" },
      { id: 50, nombreLocalidad: "Tilcara" }
    ]
  },
  {
    id: 11,
    nombreProvincia: "La Pampa",
    departamentos: [
      { id: 51, nombreLocalidad: "Santa Rosa" },
      { id: 52, nombreLocalidad: "General Pico" },
      { id: 53, nombreLocalidad: "Toay" },
      { id: 54, nombreLocalidad: "Realicó" },
      { id: 55, nombreLocalidad: "Victorica" }
    ]
  },
  {
    id: 12,
    nombreProvincia: "La Rioja",
    departamentos: [
      { id: 56, nombreLocalidad: "La Rioja" },
      { id: 57, nombreLocalidad: "Chilecito" },
      { id: 58, nombreLocalidad: "Aimogasta" },
      { id: 59, nombreLocalidad: "Chamical" },
      { id: 60, nombreLocalidad: "Chepes" }
    ]
  },
  {
    id: 13,
    nombreProvincia: "Mendoza",
    departamentos: [
      { id: 61, nombreLocalidad: "Mendoza" },
      { id: 62, nombreLocalidad: "San Rafael" },
      { id: 63, nombreLocalidad: "Godoy Cruz" },
      { id: 64, nombreLocalidad: "Luján de Cuyo" },
      { id: 65, nombreLocalidad: "Guaymallén" }
    ]
  },
  {
    id: 14,
    nombreProvincia: "Misiones",
    departamentos: [
      { id: 66, nombreLocalidad: "Posadas" },
      { id: 67, nombreLocalidad: "Oberá" },
      { id: 68, nombreLocalidad: "Eldorado" },
      { id: 69, nombreLocalidad: "Puerto Iguazú" },
      { id: 70, nombreLocalidad: "Leandro N. Alem" }
    ]
  },
  {
    id: 15,
    nombreProvincia: "Neuquén",
    departamentos: [
      { id: 71, nombreLocalidad: "Neuquén" },
      { id: 72, nombreLocalidad: "San Martín de los Andes" },
      { id: 73, nombreLocalidad: "Cutral Có" },
      { id: 74, nombreLocalidad: "Plottier" },
      { id: 75, nombreLocalidad: "Zapala" }
    ]
  },
  {
    id: 16,
    nombreProvincia: "Río Negro",
    departamentos: [
      { id: 76, nombreLocalidad: "Viedma" },
      { id: 77, nombreLocalidad: "General Roca" },
      { id: 78, nombreLocalidad: "San Carlos de Bariloche" },
      { id: 79, nombreLocalidad: "Cipolletti" },
      { id: 80, nombreLocalidad: "Villa Regina" }
    ]
  },
  {
    id: 17,
    nombreProvincia: "Salta",
    departamentos: [
      { id: 81, nombreLocalidad: "Salta" },
      { id: 82, nombreLocalidad: "Orán" },
      { id: 83, nombreLocalidad: "Tartagal" },
      { id: 84, nombreLocalidad: "Metán" },
      { id: 85, nombreLocalidad: "Cafayate" }
    ]
  },
  {
    id: 18,
    nombreProvincia: "San Juan",
    departamentos: [
      { id: 86, nombreLocalidad: "San Juan" },
      { id: 87, nombreLocalidad: "Rawson" },
      { id: 88, nombreLocalidad: "Chimbas" },
      { id: 89, nombreLocalidad: "Rivadavia" },
      { id: 90, nombreLocalidad: "Pocito" }
    ]
  },
  {
    id: 19,
    nombreProvincia: "San Luis",
    departamentos: [
      { id: 91, nombreLocalidad: "San Luis" },
      { id: 92, nombreLocalidad: "Villa Mercedes" },
      { id: 93, nombreLocalidad: "Merlo" },
      { id: 94, nombreLocalidad: "La Punta" },
      { id: 95, nombreLocalidad: "Justo Daract" }
    ]
  },
  {
    id: 20,
    nombreProvincia: "Santa Cruz",
    departamentos: [
      { id: 96, nombreLocalidad: "Río Gallegos" },
      { id: 97, nombreLocalidad: "Caleta Olivia" },
      { id: 98, nombreLocalidad: "El Calafate" },
      { id: 99, nombreLocalidad: "Puerto Deseado" },
      { id: 100, nombreLocalidad: "Las Heras" }
    ]
  },
  {
    id: 21,
    nombreProvincia: "Santa Fe",
    departamentos: [
      { id: 101, nombreLocalidad: "Rosario" },
      { id: 102, nombreLocalidad: "Santa Fe" },
      { id: 103, nombreLocalidad: "Rafaela" },
      { id: 104, nombreLocalidad: "Reconquista" },
      { id: 105, nombreLocalidad: "Venado Tuerto" }
    ]
  },
  {
    id: 22,
    nombreProvincia: "Santiago del Estero",
    departamentos: [
      { id: 106, nombreLocalidad: "Santiago del Estero" },
      { id: 107, nombreLocalidad: "La Banda" },
      { id: 108, nombreLocalidad: "Termas de Río Hondo" },
      { id: 109, nombreLocalidad: "Añatuya" },
      { id: 110, nombreLocalidad: "Frías" }
    ]
  },
  {
    id: 23,
    nombreProvincia: "Tierra del Fuego",
    departamentos: [
      { id: 111, nombreLocalidad: "Ushuaia" },
      { id: 112, nombreLocalidad: "Río Grande" },
      { id: 113, nombreLocalidad: "Tolhuin" },
      { id: 114, nombreLocalidad: "Puerto Almanza" },
      { id: 115, nombreLocalidad: "San Sebastián" }
    ]
  },
  {
    id: 24,
    nombreProvincia: "Tucumán",
    departamentos: [
      { id: 116, nombreLocalidad: "San Miguel de Tucumán" },
      { id: 117, nombreLocalidad: "Tafí Viejo" },
      { id: 118, nombreLocalidad: "Yerba Buena" },
      { id: 119, nombreLocalidad: "Concepción" },
      { id: 120, nombreLocalidad: "Monteros" }
    ]
  }
];

export default Provincias;
