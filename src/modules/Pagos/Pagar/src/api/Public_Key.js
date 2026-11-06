// Public key de MercadoPago (no es secreta: se usa en el navegador).
// Se configura con VITE_MP_PUBLIC_KEY; por defecto usa la key de testeo (sandbox).
const Public_Key = import.meta.env.VITE_MP_PUBLIC_KEY ?? 'TEST-c3e21a1b-8798-4bbf-9a10-5285b97a19a4';

export default Public_Key;
