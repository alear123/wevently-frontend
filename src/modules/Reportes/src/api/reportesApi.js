// API central de reportes
// Futuro: añadir manejo de tokens / headers comunes / retry logic, etc.

import BASE_URL from '../../../../common/API';
import { toYMD } from '../utils/fechas';

async function handleResponse(resp) {
  if (!resp.ok) {
    const text = await resp.text().catch(()=> '');
    const err = new Error(text || `Error ${resp.status}`);
    err.status = resp.status;
    throw err;
  }
  return resp.json();
}

export async function getFiltrosServiciosMasSolicitados() {
  const url = `${BASE_URL}/api/reportes/serviciosMasSolicitados/filtros`;
  const resp = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
  });
  return handleResponse(resp);
}

export async function getServiciosMasSolicitados({ desde, hasta, provinciaId, localidadId }) {
  const d = toYMD(desde);
  const h = toYMD(hasta);
  const params = new URLSearchParams();
  if (provinciaId) params.append('provinciaId', provinciaId);
  if (localidadId) params.append('localidadId', localidadId);
  if (d) params.append('desde', d);
  if (h) params.append('hasta', h);
  const url = `${BASE_URL}/api/reportes/serviciosMasSolicitados?${params.toString()}`;
  const resp = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
  });
  return handleResponse(resp);
}

export async function getUsuariosActivos({ desde, hasta }) {
  const d = toYMD(desde); 
  const h = toYMD(hasta);

  console.log("estoy por mandar estas fechas al back:", d, h)
  //me devuelve un dia menos del elegido en fechaHasta el back nose q onda 
  
  const params = new URLSearchParams();
  if (d) params.append('fechaDesde', d);
  if (h) params.append('fechaHasta', h);


  const url = `${BASE_URL}/api/reportes/CantidadUsuariosActivos/obtener?${params.toString()}`;
  
  const resp = await fetch(url, { 
    method: 'GET',  
    headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem("token")}`
      }, 
    }
  );
  
  
  return handleResponse(resp);
}


export async function getVistasXLugar({ desde, hasta }) {
  const d = toYMD(desde); 
  const h = toYMD(hasta);

  console.log("estoy por mandar estas fechas al back:", d, h)
  
  const params = new URLSearchParams();
  if (d) params.append('fechaDesde', d);
  if (h) params.append('fechaHasta', h);


  const url = `${BASE_URL}/api/reportes/vistasPorLugar/obtener?${params.toString()}`;
  
  const resp = await fetch(url, { 
    method: 'GET',  
    headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem("token")}`
      }, 
    }
  );
  
  return handleResponse(resp);
}


export async function getVistasXServicio({ desde, hasta }) {
  const d = toYMD(desde); 
  const h = toYMD(hasta);

  console.log("estoy por mandar estas fechas al back:", d, h)
  
  const params = new URLSearchParams();
  if (d) params.append('fechaDesde', d);
  if (h) params.append('fechaHasta', h);


  const url = `${BASE_URL}/api/reportes/vistasPorServicio/obtener?${params.toString()}`;
  
  const resp = await fetch(url, { 
    method: 'GET',  
    headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem("token")}`
      }, 
    }
  );
  
  return handleResponse(resp);
}

export async function getSolicitudesXlugar({desde, hasta}) {
  const d = toYMD(desde); 
  const h = toYMD(hasta);

  console.log("estoy por mandar estas fechas al back:", d, h)
  
  const params = new URLSearchParams();
  if (d) params.append('fechaDesde', d);
  if (h) params.append('fechaHasta', h);


  const url = `${BASE_URL}/api/reportes/solicitudesPorLugar/obtener?${params.toString()}`;
  
  const respuesta = await fetch(url, { 
    method: 'GET',  
    headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem("token")}`
      }, 
    }
  );
  
  return handleResponse(respuesta);
}

export async function getHistorialDeEventos({desde, hasta}) {
  const d = toYMD(desde); 
  const h = toYMD(hasta);

  console.log("estoy por mandar estas fechas al back:", d, h)
  
  const params = new URLSearchParams();
  if (d) params.append('fechaDesde', d);
  if (h) params.append('fechaHasta', h);


  const url = `${BASE_URL}/api/reportes/historial-de-eventos/obtener?${params.toString()}`;
  
  const respuesta = await fetch(url, { 
    method: 'GET',  
    headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem("token")}`
      }, 
    }
  );
  
  return handleResponse(respuesta);
}
// Punto de extensión: otras funciones getXReport...

export async function getTopProvinciasGlobal() {
  const url = `${BASE_URL}/api/reportes/serviciosMasSolicitados/global/provincias`;
  const resp = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
  });
  const data = await handleResponse(resp);
  console.log('Top Provincias Global Data:', data);
  return data;
}

export async function getTopServiciosGlobal() {
  const url = `${BASE_URL}/api/reportes/serviciosMasSolicitados/global/servicios`;
  const resp = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
  });
  const data = await handleResponse(resp);
  console.log('Top Servicios Global Data:', data);
  return data;
}
