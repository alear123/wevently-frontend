import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from "react-router-dom"
import * as Utils from '../../../../common/Utils'
import dominio from '../../../../common/API'
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import ReceivedMessageSound from '../../../../assets/receivedMessage.mp3'


export const useChat = () => {

  const [chat, setChat] = useState({
    idChat: null,
    destinatario: null,
    mensajes: [],
    dtoPropuesta: {}
  });
  const [texto, setTexto] = useState("");
  //Para manejar los modales de exito y error
  const [titulo, setTitulo] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [mostrarExito, setMostrarExito] = useState(false);
  const [mostrarError, setMostrarError] = useState(false);
  const clienteStomp = useRef(null);
  const [conectado, setConectado] = useState(false); // nuevo estado
  const receivedMessageSound = new Audio(ReceivedMessageSound);
  const usuarioLogueado = Utils.getLoggedUser();
  const [nuevaPropuesta, setNuevaPropuesta] = useState(false);
  const [mostrarPropuesta, setMostrarPropuesta] = useState(false);
  const [propuesta, setPropuesta] = useState();
  const [confirmarAceptar, setConfirmarAceptar] = useState(false);
  const [confirmarRechazar, setConfirmarRechazar] = useState(false);
  const [isProposalExpanded, setIsProposalExpanded] = useState(false);
  const [handleAceptarExito, setHandleAceptarExito] = useState(() => () => { setMostrarExito(false) })
  const navigate = useNavigate();


  const getChat = async (id) => {
    try {
      const response = await fetch(`${dominio}/api/chat?id=${id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json", // importante para JSON
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (!response.ok) {
        setTitulo("Error")
        setMensaje(response.content)
        if (response.status == 401) {
          setMensaje("No tiene permisos para realizar esta accion")
        }
        setMostrarError(true);
        return;
      }
      const resp = await response.json();
      let mensajess = resp.mensajes
      setChat({
        idChat: resp.idChat,
        destinatario: resp.destinatario,
        mensajes: resp.mensajes || [], // renombramos chats a mensajes
        dtoPropuesta: resp.dtoPropuesta
      });

    }
    catch (error) {
      setTitulo("Error")
      setMensaje('No se ha podido establecer una conexion con el servidor, intente mas tarde')
      setMostrarError(true);

    }
  }



  const conectarWebSocket = useCallback(() => {
    try {
      // Declarar userEmail correctamente
      const userEmail = Utils.getUserEmailByToken(localStorage.getItem("token"));
      const receivedMessage = new Audio(receivedMessageSound);

      clienteStomp.current = new Client({
        webSocketFactory: () => new SockJS(`${dominio}/ws-chat`),
        connectHeaders: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        debug: (str) => console.log('STOMP Debug:', str),
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
      });

      clienteStomp.current.onConnect = () => {
        setConectado(true);
        console.log('WebSocket conectado exitosamente');
        console.log("SUSCRIBIENDO A : " + `/user/${userEmail}/queue/mensajes`)
        clienteStomp.current.subscribe(
          `/user/${userEmail}/queue/mensajes`,
          (mensaje) => {
            try {
              const nuevo = JSON.parse(mensaje.body);
              setChat(prev => ({
                ...prev,
                mensajes: [...prev.mensajes, nuevo],
              }));

              receivedMessageSound.currentTime = 0; // Reinicia el sonido si se dispara varias veces seguidas
              receivedMessageSound.play().catch((err) => {
                console.warn("No se pudo reproducir el sonido:", err);
              });
            } catch (err) {
              console.error('Error procesando notificación:', err);
              setTitulo("Error");
              setMensaje("Se produjo un error procesando los mensajes");
              setMostrarError(true);
            }
          }
        );

        clienteStomp.current.subscribe(
          `/user/${userEmail}/queue/propuestas`,
          (mensaje) => {
            try {
              console.log(JSON.parse(mensaje.body))
              setChat(prev => ({
                ...prev,
                dtoPropuesta: JSON.parse(mensaje.body)
              }));

              receivedMessageSound.currentTime = 0; // Reinicia el sonido si se dispara varias veces seguidas
              receivedMessageSound.play().catch((err) => {
                console.warn("No se pudo reproducir el sonido:", err);
              });
              console.log("RESPUESTA: " + JSON.parse(mensaje.body))
            } catch (err) {
              console.error('Error procesando PROPUESTA:', err);
              setTitulo("Error");
              setMensaje("Se produjo un error procesando los mensajes");
              setMostrarError(true);
            }
          }
        );
      };

      clienteStomp.current.onStompError = (frame) => {
        console.error('Error STOMP:', frame.headers['message']);
        console.error('Detalles:', frame.body);
        setConectado(false);
      };

      clienteStomp.current.onWebSocketError = (error) => {
        console.error('Error WebSocket:', error);
        setConectado(false);
      };

      clienteStomp.current.onDisconnect = () => {
        console.log('WebSocket desconectado');
        setConectado(false);
      };

      clienteStomp.current.activate();
    } catch (err) {
      console.error('Error configurando WebSocket:', err);
    }
  }, [dominio]);



  const sendMessage = (mensaje) => {
    try {
      if (!clienteStomp.current || !conectado) {
        console.error("No hay conexión WebSocket");
        return;
      }

      // Usar publish en lugar de send
      clienteStomp.current.publish({
        destination: "/app/mensajes/nuevo",
        body: JSON.stringify(mensaje),
      });

      setTexto(""); // limpiar el input después de enviar
    } catch (error) {
      setTitulo("Error");
      setMensaje(error.message);
      setMostrarError(true);
    }
  };

  useEffect(() => {
    conectarWebSocket();

    return () => {
      if (clienteStomp.current && clienteStomp.current.connected) {
        clienteStomp.current.deactivate();
      }
    };
  }, [conectarWebSocket]);

  const enviarPropuesta = async (dtoPropuesta) => {
    try {

      if (dtoPropuesta.comentario == "" || dtoPropuesta.comentario == null) {
        setTitulo("Error")
        setMensaje("Debe incluir un comentario en la descripcion de la propuesta");
        setNuevaPropuesta(false)
        setMostrarError(true)
        return;

      }
      const response = await fetch(`${dominio}/api/chat/propuesta?chatId=${chat.idChat}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json", // importante para JSON
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(dtoPropuesta)

        }
      );
      if (!response.ok) {
        setTitulo("Error")
        setMensaje(response.text())
        setNuevaPropuesta(false);
        setMostrarError(true);
        return;
      }
      setNuevaPropuesta(false);
      let data = await response.json();
      setChat(prev => ({
        ...prev,
        dtoPropuesta: data
      }));
      setPropuesta(data);
      console.log(propuesta)
      setTitulo("Propuesta enviada");
      setMensaje("La propuesta ha sido enviada con exito")
      setMostrarExito(true);

    }
    catch (error) {
      setTitulo("Error")
      setMensaje('No se ha podido establecer una conexion con el servidor, intente mas tarde')
      setNuevaPropuesta(false);
      setMostrarError(true);

    }
  }

  const rechazarPropuesta = async () => {
    try {
      setConfirmarRechazar(false);
      setChat(prev => ({
        ...prev,
        dtoPropuesta: {
          ...prev.dtoPropuesta,
          mostrar: false,   // << la propiedad que querés actualizar
        }
      }));
      const response = await fetch(`${dominio}/api/chat/propuestas/eliminar?id=${chat?.idChat}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json", // importante para JSON
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        setChat(prev => ({
          ...prev,
          dtoPropuesta: {
            ...prev.dtoPropuesta,
            mostrar: true,
          }
        }));
        setTitulo("Error")
        setMensaje(response.content ? response.content : "No se ha podido completar la accion debido a un error en el servidor")
        setMostrarError(true);
        return;
      }
      setChat(prev => ({
        ...prev,
        dtoPropuesta: null
      }));
      setTitulo("Propuesta rechazada")
      setMensaje("La propuesta ha sido rechazada correctamente")
      setMostrarExito(true);
    }
    catch (error) {
      setTitulo("Error")
      setMensaje('No se ha podido establecer una conexion con el servidor, intente mas tarde')
      setMostrarError(true);

    }
  }

  const aceptarPropuesta = async () => {
    try {
      setConfirmarAceptar(false);
      setChat(prev => ({
        ...prev,
        dtoPropuesta: {
          ...prev.dtoPropuesta,
          mostrar: false,
        }
      }));

      const response = await fetch(`${dominio}/api/chat/propuestas/aceptar?id=${chat?.idChat}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json", // importante para JSON
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        setChat(prev => ({
          ...prev,
          dtoPropuesta: {
            ...prev.dtoPropuesta,
            mostrar: true,
          }
        }));
        setTitulo("Error")
        setMensaje(response.content ? response.content : "No se ha podido completar la accion debido a un error en el servidor")
        setMostrarError(true);
        return;
      }
      setConfirmarAceptar(false);
      setIsProposalExpanded(false);
      setTitulo("Propuesta Aceptada")
      setMensaje("La propuesta ha sido aceptada con exito")
      const id = await response.text();
      setHandleAceptarExito(() => {
        return () => {
          setMostrarExito(false);
          navigate("/reservar?id="+ id);
        };
      }); setMostrarExito(true);
      setChat(prev => ({
        ...prev,
        dtoPropuesta: {
          ...prev.dtoPropuesta,
          comentario: "",
          seña: 0,
          monto: 0,
          mostrar: false,
        }
      }));

    }
    catch (error) {
      setTitulo("Error")
      setMensaje('No se ha podido establecer una conexion con el servidor, intente mas tarde')
      setMostrarError(true);

    }
  }

  const eliminarPropuesta = async () => {
    try {
      setConfirmarRechazar(false);

      const response = await fetch(`${dominio}/api/chat/propuestas/eliminar?id=${chat?.idChat}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json", // importante para JSON
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        setChat(prev => ({
          ...prev,
          dtoPropuesta: {
            ...prev.dtoPropuesta,
            mostrar: true,
          }
        }));
        setTitulo("Error")
        setMensaje(response.content ? response.content : "No se ha podido completar la accion debido a un error en el servidor")
        setMostrarError(true);
        return;
      }
      setChat(prev => ({
        ...prev,
        dtoPropuesta: {
          ...prev.dtoPropuesta,
          aclaraciones: "",
          seña: 0,
          total: 0,
          mostrar: false,
        }
      }));
      setIsProposalExpanded(false);
      setTitulo("Propuesta Eliminada")
      setMensaje("La propuesta ha sido eliminada correctamente")
      setMostrarExito(true);
    }
    catch (error) {
      setTitulo("Error")
      setMensaje('No se ha podido establecer una conexion con el servidor, intente mas tarde')
      setMostrarError(true);

    }
  }

  return { usuarioLogueado, chat, getChat, setChat, sendMessage, setTexto, texto, isProposalExpanded, setIsProposalExpanded, nuevaPropuesta, setNuevaPropuesta, propuesta, setPropuesta, enviarPropuesta, aceptarPropuesta, rechazarPropuesta, eliminarPropuesta, mostrarExito, setMostrarExito, handleAceptarExito, mostrarError, setMostrarError, titulo, setTitulo, mensaje, setMensaje, confirmarAceptar, setConfirmarAceptar, confirmarRechazar, setConfirmarRechazar };

}


