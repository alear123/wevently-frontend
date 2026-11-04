import { useState, useEffect, useRef, useCallback } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
export const useNotificaciones = () => {
    const [notificaciones, setNotificaciones] = useState([]);
    const [cantidadNoLeidas, setCantidadNoLeidas] = useState(0);
    const [conectado, setConectado] = useState(false);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState(null);
    const clienteStomp = useRef(null);
    const [paginaActual, setPaginaActual] = useState(0);
    const [hayMas, setHayMas] = useState(true);

    const obtenerTokenAuth = () => {
        return localStorage.getItem('token')
    };

    const decodificarToken = (tok) => {
        try {
            const base64Url = tok.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                window.atob(base64)
                    .split('')
                    .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
            );
            return JSON.parse(jsonPayload);
        } catch (error) {
            console.error('Error decodificando JWT:', error);
            return null;
        }
    };


    const obtenerIdentificadorUsuario = () => {
        const token = obtenerTokenAuth();
        if (!token) return null;
        try {
            const payload = decodificarToken(token);
            console.log("el token decodificado es: ", payload);
            //const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.sub; //aca esta el mail del usuariopara hacer el puente en el websocket
        } catch (e) {
            return null;
        }
    };

    const conectarWebSocket = useCallback(() => {
    const token = obtenerTokenAuth();
    const userEmail = obtenerIdentificadorUsuario(); 
    
    if (!token || !userEmail) {
        console.warn('No hay token o email disponible para WebSocket');
        return;
    }

    try {
        clienteStomp.current = new Client({
            webSocketFactory: () => new SockJS('http://localhost:8080/ws-notifications'),
            connectHeaders: {
                Authorization: `Bearer ${token}`
            },
            debug: (str) => {
                console.log('STOMP Debug:', str);
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        clienteStomp.current.onConnect = (frame) => {
            setConectado(true);
            setError(null);
            console.log('WebSocket conectado exitosamente');
            
            clienteStomp.current.subscribe(
                `/user/${userEmail}/ws-notifications`,
                (mensaje) => {
                    try {
                        const notificacion = JSON.parse(mensaje.body);
                        console.log('Nueva notificación recibida:', notificacion);
                        
                        setNotificaciones(anterior => {
                            const existente = anterior.find(n => n.id === notificacion.id);

                            if (!existente) {
                                return [notificacion, ...anterior];
                            }

                            if (existente.leida && !notificacion.leida) {
                                return anterior.map(n => n.id === notificacion.id ? notificacion : n);
                            }

                            if (!existente.leida && notificacion.leida) {
                                return anterior.map(n => n.id === notificacion.id ? notificacion : n);
                            }

                            return anterior.map(n => n.id === notificacion.id ? notificacion : n);
                        });
                        cargarContadorNoLeidas();
                        mostrarToastNotificacion(notificacion);
                    } catch (err) {
                        console.error('Error procesando notificación:', err);
                    }
                }
            );
        };

        clienteStomp.current.onStompError = (frame) => {
            console.error('Error STOMP:', frame.headers['message']);
            console.error('Detalles:', frame.body);
            setConectado(false);
            setError('Error de conexión STOMP');
        };

        clienteStomp.current.onWebSocketError = (error) => {
            console.error('Error WebSocket:', error);
            setConectado(false);
            setError('Error de conexión');
        };

        clienteStomp.current.onDisconnect = () => {
            console.log('WebSocket desconectado');
            setConectado(false);
        };

        clienteStomp.current.activate();

    } catch (err) {
        console.error('Error configurando WebSocket:', err);
        setError('Error de configuración');
    }
}, []);


    const cargarNotificaciones = useCallback(async (pagina = 0, soloNoLeidas = false) => {
        setCargando(true);
        setError(null);

        try {
            const token = obtenerTokenAuth();
            if (!token) throw new Error('No hay token de autenticación');

            const response = await fetch(
                `/api/notificaciones/mias?page=${pagina}&size=20&soloNoLeidas=${soloNoLeidas}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (!response.ok) {
                throw new Error('Error al cargar notificaciones');
            }

            const datos = await response.json();

            if (pagina === 0) {
                setNotificaciones(datos.content || []);
            } else {
                setNotificaciones(anteriores => [...anteriores, ...(datos.content || [])]);
            }

            setHayMas(!datos.last);
            setPaginaActual(pagina);
        } catch (err) {
            console.error('Error cargando notificaciones:', err);
            setError('Error al cargar las notificaciones. Por favor, revisá tu conexión o intentá nuevamente más tarde');
        } finally {
            setCargando(false);
        }
    }, []);


    const cargarContadorNoLeidas = useCallback(async () => {
        try {
            const token = obtenerTokenAuth();
            if (!token) return;

            const response = await fetch('/api/notificaciones/count', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const datos = await response.json();
                setCantidadNoLeidas(datos.count || 0);
            }
        } catch (err) {
            console.error('Error cargando contador:', err);
        }
    }, []);


    const marcarComoLeida = useCallback(async (idNotificacion) => {
        try {
            const token = obtenerTokenAuth();
            if (!token) throw new Error('No hay token de autenticación, flaco');

            const response = await fetch(`/api/notificaciones/${idNotificacion}/leer`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                setNotificaciones(anteriores =>
                    anteriores.map(n =>
                        n.id === idNotificacion ? { ...n, leida: true } : n
                    )
                );
                setCantidadNoLeidas(anteriores => Math.max(0, anteriores - 1));
            }
        } catch (err) {
            console.error('Error marcando como leída:', err);
        }
    }, []);

    const marcarTodasComoLeidas = useCallback(async () => {
        try {
            const token = obtenerTokenAuth();
            if (!token) throw new Error('No hay token de autenticación');

            console.log("estoy por llamar al back pa, teaviso si se hace bien")
            const response = await fetch('/api/notificaciones/leer-todas', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                console.log("se leyeron todas ok pa")
                setNotificaciones(anteriores => anteriores.map(n => ({ ...n, leida: true })));
                setCantidadNoLeidas(0);
            }
        } catch (err) {
            console.error('Error marcando todas como leídas:', err);
        }
    }, []);

    const eliminarNotificacion = useCallback(async (idNotificacion) => {
        try {
            const token = obtenerTokenAuth();
            if (!token) throw new Error('No hay token de autenticación');

            const response = await fetch(`/api/notificaciones/baja/${idNotificacion}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                setNotificaciones(anteriores => anteriores.filter(n => n.id !== idNotificacion));
                setCantidadNoLeidas(anteriores => {
                    const notificacion = notificaciones.find(n => n.id === idNotificacion);
                    return notificacion && !notificacion.leida ? Math.max(0, anteriores - 1) : anteriores;
                });
            }
        } catch (err) {
            console.error('Error eliminando notificación:', err);
        }
    }, [notificaciones]);


    const cargarMas = useCallback(() => {
        if (!cargando && hayMas) {
            cargarNotificaciones(paginaActual + 1);
        }
    }, [cargando, hayMas, paginaActual, cargarNotificaciones]);

    const mostrarToastNotificacion = (notificacion) => {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(notificacion.titulo, {
                body: notificacion.resumen,
                icon: '/favicon.ico'
            });
        }
    };

    // cdo se carga el componente esto es lo q carga 1ero
    useEffect(() => {
        cargarNotificaciones(0);
        cargarContadorNoLeidas();
        conectarWebSocket();

        return () => {
            if (clienteStomp.current && clienteStomp.current.connected) {
                clienteStomp.current.deactivate();
            }
        };
    }, [cargarNotificaciones, cargarContadorNoLeidas, conectarWebSocket]);

    return {
        notificaciones,
        cantidadNoLeidas,
        conectado,
        cargando,
        error,
        marcarComoLeida,
        marcarTodasComoLeidas,
        eliminarNotificacion,
        cargarMas,
        hayMas,
        reintentar: () => cargarNotificaciones(0)
    };
};
