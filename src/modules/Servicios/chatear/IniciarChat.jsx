import { use, useEffect, useState, useRef } from "react";
import { Navigate, useParams, useNavigate, useSearchParams } from "react-router-dom"
import "./assets/chat.css";
import Navbar_Organizador from "../../../common/layouts/Navbar_Organizador";
import Navbar_Prestador from "../../../common/layouts/Navbar_Prestador";
import Breadcrumbs from "../../../common/layouts/Breadcrumbs";
import Propuesta from "./components/Propuesta";
import ModalConfimarEditar from "../../../common/layouts/ModalConfirmarEditar";
import ModalConfirmarEliminar from "../../../common/layouts/ModalConfirmarEliminar";
import ModalAccionExito from "../../../common/layouts/ModalAccionExito";
import ModalError from "../../../common/layouts/ModalError";
import { useChat } from "./Api/chat-api";
import sentSound from "../../../assets/sent_message.mp3";
import icono_propuesta from "../../../assets/propuesta.png";
import NuevaPropuesta from './components/NuevaPropuesta'
import { stringify } from "postcss";
import { getLoggedUser } from "../../../common/Utils";

export default function IniciarChat() {
    const [searchParams] = useSearchParams();
    const id_chat = searchParams.get("id");
    const sentMessageSound = new Audio(sentSound);
    const bottomRef = useRef(null);
    const [accion, setAccion] = useState("")

    const navigate = useNavigate();
    // Respuestas automáticas hardcodeadas
    const { usuarioLogueado,
        chat,
        getChat,
        setChat,
        sendMessage,
        setTexto,
        texto,
        isProposalExpanded, 
        setIsProposalExpanded,
        nuevaPropuesta,
        setNuevaPropuesta,
        propuesta,
        setPropuesta,
        enviarPropuesta,
        aceptarPropuesta,
        rechazarPropuesta,
        eliminarPropuesta,
        mostrarExito,
        setMostrarExito,
        handleAceptarExito,
        mostrarError,
        setMostrarError,
        titulo,
        setTitulo,
        mensaje,
        setMensaje,
        confirmarAceptar,
        setConfirmarAceptar,
        confirmarRechazar,
        setConfirmarRechazar
    } = useChat();

    const handleCerrar = () => { setNuevaPropuesta(false) }

    useEffect(() => {
        const fetchChat = async () => {
            await getChat(id_chat);
            console.log(chat);
        };
        fetchChat();
    }, [id_chat]);

    useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [chat?.mensajes]);


    const handleAbrirPropuesta = () => {
        if (chat?.dtoPropuesta) {
            setNuevaPropuesta(true);
        } else {
            console.warn("No hay propuesta en el chat");
        }
    };


    const handleEnviar = () => {
        if (texto.trim() !== "") {
            sentMessageSound.currentTime = 0; // Reinicia el sonido si se dispara varias veces seguidas
            sentMessageSound.play().catch((err) => {
                console.warn("No se pudo reproducir el sonido:", err);
            });
            setTexto("")
            setChat(prevChat => ({
                ...prevChat, // conservar el destinatario
                mensajes: [...prevChat.mensajes, { texto: texto, fecha: new Date(), esEntrante: false }]
            }));

            const dtoMensaje = { texto: texto, esEntrante: false, chatId: chat.idChat }
            //enviarMensaje(dtoMensaje)
            sendMessage(dtoMensaje)
        }
    };


    const handleCancelar = () => {
        setConfirmarAceptar(false);
        setConfirmarRechazar(false);
    };



    const [handleConfirmarAccion, setHandleConfirmarAccion] = useState(() => () => { })
    const handleConfirmarRechazar = () => {
        setConfirmarRechazar(false);
        setIsProposalExpanded(false);

    }

    return (
        <>
            {(getLoggedUser().rol == 'Prestador' ? <Navbar_Prestador/> : <Navbar_Organizador/>)}
            <Breadcrumbs />
            <div className="container-fluid px-4 pb-4">
                <div className="row justify-content-center">
                    <div className="col-12 col-md-8 col-lg-6">
                        <div className="card chat-card">
                            {/* Chat Header */}
                            <div className="card-header bg-white border-bottom">
                                <div className="d-flex align-items-center">
                                    <div className="avatar me-3" style={{backgroundColor: "#d1d5db"}}>
                                        {/*  <span className="avatar-text">E1</span>*/}
                                        {chat?.destinatario?.foto ?
                                            <img
                                                style={{
                                                    width: "100%",
                                                    height: "100%",
                                                    borderRadius: "100%"
                                                }}
                                                src={chat?.destinatario?.foto || "/images/user-placeholder.png"}
                                                alt="Foto"
                                            />
                                            :
                                            <div class="user-icon" data-bs-toggle="dropdown" aria-expanded="false"><i class="fas fa-user"></i></div>
                                        }
                                    </div>
                                    <h5 className="mb-0">{`${chat?.destinatario?.nombre} ${chat?.destinatario?.apellido}` || ""}</h5>
                                </div>
                            </div>

                            {/* Chat Body */}
                            <div className="card-body">
                                <ul className="messages-container mb-4" style={{ listStyle: "none", padding: 0 }}>
                                    {chat?.mensajes.map((msg, index) => {
                                        return (
                                            <li key={index}>
                                                <div className={`message-row mb-3 ${!msg.esEntrante ? "" : "justify-content-end"}`}>
                                                    <div className={`message ${msg.esEntrante ? "incoming" : "outgoing"}`}>
                                                        <div>{msg.texto}</div>
                                                        {/*<i className={`${!msg.esEntrante ? "bi bi-check2 tick-icon" : ""}`}></i> */}
                                                    </div>
                                                </div>
                                            </li>
                                        );
                                    })}
                                    {chat?.dtoPropuesta && chat?.dtoPropuesta.mostrar &&

                                        <li>
                                            <div className={`message ${usuarioLogueado.rol === "Prestador" ? "outgoing" : "incoming"} proposal-card position-relative mb-4`} id="proposalCard">
                                                <button
                                                    className="btn btn-sm btn-outline-secondary position-absolute top-0 end-0 m-2"
                                                    onClick={() => setIsProposalExpanded(true)}
                                                >
                                                    <i className="fas fa-chevron-down"></i>
                                                </button>

                                                <div className="mb-3">
                                                    <h6 className="fw-bold">Propuesta #{chat?.dtoPropuesta.numero}</h6>
                                                    <p className="text-muted small mb-0">
                                                        {chat?.dtoPropuesta.descripcion}
                                                    </p>
                                                </div>
                                            </div>
                                        </li>
                                    }
                                    <div ref={bottomRef} />
                                </ul>

                                {/* Input */}
                                <div className="message-input-container">

                                    <div className="d-flex align-items-center gap-2">
                                        {usuarioLogueado.rol == "Prestador" ?
                                            <button className="btn btn-outline-secondary btn-sm" onClick={() => setNuevaPropuesta(true)}>
                                                <img src={icono_propuesta} style={{ "height": "30px" }}></img>
                                            </button>
                                            :
                                            null
                                        }
                                        <div className="flex-fill">
                                            <input
                                                type="text"
                                                className="form-control message-input"
                                                placeholder="Escribe un mensaje..."
                                                value={texto}
                                                onChange={(e) => setTexto(e.target.value)}
                                                onKeyDown={(e) => e.key === "Enter" && handleEnviar()}
                                            />
                                        </div>
                                        <button className="btn btn-outline-secondary btn-sm" onClick={handleEnviar}>
                                            <i className="fas fa-paper-plane"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modales */}
            <NuevaPropuesta mostrar={nuevaPropuesta} onCerrar={handleCerrar} onCancelar={handleCerrar} infoPropuesta={chat?.dtoPropuesta} onEnviar={enviarPropuesta} />
            <Propuesta mostrar={isProposalExpanded}
                onAceptar={() => {
                    setTitulo("Aceptar propuesta?")
                    setMensaje("¿Estás seguro de que deseas aceptar la propuesta?")
                    setIsProposalExpanded(false);
                    setConfirmarAceptar(true);
                    setHandleConfirmarAccion(
                        () =>
                            () => {
                                aceptarPropuesta()

                            }
                    )
                }}
                onRechazar={() => {
                    setIsProposalExpanded(false);
                    setConfirmarRechazar(true);
                    setTitulo("Rechazar propuesta")
                    setMensaje("¿Estás seguro de que deseas rechazar la propuesta?")
                    setHandleConfirmarAccion(
                        () =>
                            () => {
                                rechazarPropuesta()
                            }

                    )
                }}
                infoPropuesta={chat?.dtoPropuesta}
                usuario={usuarioLogueado}
                onCerrar={() => { setIsProposalExpanded(false) }}
                onEliminar={
                    () => {
                        setIsProposalExpanded(false);
                        setConfirmarRechazar(true);
                        setTitulo("Eliminar propuesta")
                        setMensaje("¿Estás seguro de que deseas eliminar la propuesta enviada?")
                        setHandleConfirmarAccion(
                            () =>
                                () => {
                                    eliminarPropuesta()
                                })
                    }
                } />

            <ModalConfimarEditar
                mostrar={confirmarAceptar}
                titulo={titulo}
                mensaje={mensaje}
                accion="Aceptar"
                onCancelar={handleCancelar}
                onConfirmar={handleConfirmarAccion}
            />
            <ModalConfirmarEliminar
                mostrar={confirmarRechazar}
                titulo={titulo}
                mensaje={mensaje}
                accion={accion}
                onCancelar={handleCancelar}
                onConfirmar={handleConfirmarAccion}
            />
            <ModalAccionExito
                titulo={titulo} 
                mensaje={mensaje}
                mostrar={mostrarExito}
                onAceptar={handleAceptarExito} 
            // 
            />
            <ModalError
                titulo={titulo} 
                mensaje={mensaje} 
                mostrar={mostrarError}
                onCerrar={() => setMostrarError(false)} />
        </>
    );
}
