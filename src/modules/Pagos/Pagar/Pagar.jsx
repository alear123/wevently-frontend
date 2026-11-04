/*NOTAS IMPORTANTES: LEER ‼️
    Antes de levantar tenes que ejecutar en la consola: 
        npm install @mercadopago/sdk-react 
    Luego de ejecutar el package.json en la dependencias debe quedar:
        "@mercadopago/sdk-react": "^1.0.4"
    
    Ahora lo unico que tenemos disponible como medio de pago son las tarjetas porque el galperin se puso la gorra y la 
    redireccion de mercado pago para que el usuario pague necesita que la aplicacion este desplegada pues no hay forma de desarrollar
    esa funcion en desarrollo, unicamente en produccion.

    La estructura que debe tener un elemento a pagar es (se me ocurrio asi):
    public class datosReserva {
        nombre: String
        idReserva: Long
        id: int //este es el id del lugar o el servicio en nuestra base de datos para que si el pago funciona puedas crear la reserva
        descripcion: String (es descripcion para los servicios o se guarda la ubicacion cdo es un lugar asi podemos estandarizar)
        nombreComprador: String
        apellidoComprador: String
        telefonoComprador: double
        emailComprador: String
        fechaReserva: date
        reseniaGeneral: float (la estrellita con 4,7 por ejemplo)
        cantidadResenia: int (cantidad de veces q la gente puntuo el servicio/lugar)


    Esto es lo viene del back para los apgos con tarjeta  {
        "id": "1340676827",
        "status": "APPROVED",
        "externalReference": null, ---> esto para algunos tipos de pago sirve y pa otros no
        "approvalUrl": null,
        "errorMessage": null,
        "description": "Reserva de Catering malisimo para el 16/09/2025",
        "installments": 1,
        "transaction_amount": 2000,
        "payment_method_id": "debmaster",
        "currency_id": "ARS",
        "date_created": "2025-08-23T10:54:04.681-04:00",
        "date_approved": "2025-08-23T10:54:05.481-04:00",
        "status_detail": "accredited",
        "net_received_amount": 1918,
        "fee_amount": 82, ------------> Mercado pago se queda con aprox el 4.1% de lo que cobramos, mas abajo explico esto
        "payer_email": "test_user_80507629@testuser.com", ------> esto es asi xq estaba testeando
        "payer_name": "null null" ------> esto es asi xq estaba testeando
    }

    MANEJO DE COMISIONES EN MERCADO PAGO:
    Para checkout API mercado apgo nos cobra para cada tipo de pago una comision mas el IVA (independientemente del monto)
    - Tarjeta de credito: 3.99% + IVA = 4.1% -> 0.11% de iva
    - Tarjeta de debito: 2.89% + IVA =  3.5% -> 0,61% de iva
    - Plata en tu cuenta de mp: 2.89% + IVA =  3.5%

    Por lo tanto tenemos 2 formas de encarar el tema de definri el precio a cobrar:
    - Trasladar la comision al cliente
        por ejemplo si queremos cobrar 2000$ (lo q estuve usando para probar)
        deberiamos hacer algo asi:
        montodeseado= 2000
        comisionMP = 0.041
        montoAcobrar = montodeseado /(1 - comisionMP)

    - Absorber la comision
        siguiendo el ejemplo anterior deberiamos hacer:
        montodeseado= 2000
        comisionMP = 0.041
        montoRecibido = montodeseado * (1 - comisionMP)

    Otro tema que no nos compete mucho xq ya es decision del usuario pero si usas
    tarjeta de credito y elegis cuotas con interes todo ese excedente se lo queda MP y aparte
    nos cobran la comision a nosotros
    Por ejemplo: suponiendo q seguimos cobrando 2000$ 
    - Cuotas con interes:
        - cliente paga en 9 cuotas: 3410,80
        - nosotros recibimos: 1918 (estariamos recibiendo un 95.5% del motno original)
        - mercadopago se queda con: 1492,80 (interesCliente: 1410,80$  + la comision q nos cobran: 82$ )
    - Cuotas sin interes (promos que ofrezcamos):
        -cliente paga: 2000$
        - nosotros recibimos: 1836
        - mercado pago nos desceunta aparte de la comision el costo financiero
    - Cuotas sin interes promocional
        - cliente paga 2000
        - nosotros recibimos: 1918
        - mercado pago nos subsidia el costo financiero

    COSAS PENDIENTES:
        - Actualizar los mensajes de error, info y aviso en la HU
        - En el metodo manejarResultadoPago hay que crear la reserva, se me habia ocurrido:
            Hacer un endpoint en el pagar al cual yo aca en el front junto los datos del resultado del pago + los datos de la reserva y se lo paso y lo arma pero esto desde el controller del pago o habria que usar el 
            controller del evento? PENDIENTE DE CHARLARLO
        - cambiar la publick key de testeo por la produccion cdo funcione todo OK -> la public key de producción quedara comentada
        - RESUELTO: ver porque el card antes del pasarle al backedn no setea los valores del form -> se seteaba el prop null, no el mock
        - RESUELTO: manejarResultadoPago, hacer: manejar bien los posibles pagos que pueda devolver MP, adaptarlo
        - opcional: Usar el "tiempoAcreditacion" para indicar en el mensaje cuanto puede tardar en aprobarse el apgo a un usuario
        - RETRASADO: Ver como manejar bien el tema de los webhooks y avisarle al usuario q todo salio ok -> no se puede hacer hasta que despleguemos
        - Terminar de configurar bien lo que son las URL de exito, error y pendiente tanto en front como en back para la wallet de mercado pago una vez despleguemos
    */


import { initMercadoPago, Wallet, CardPayment } from '@mercadopago/sdk-react';
import ModalAccionExito from '../../../common/layouts/ModalAccionExito';
import Modal_Error from '../../../common/layouts/ModalError';
import Modal_Info from '../../../common/layouts/Modal_Info';
import React, { useState, useEffect } from 'react';
import Public_Key from './src/api/Public_Key';
import ResumenPago from './src/components/ResumenPago';
import {
    crearPreferenciaMercadoPago,
    procesarPagoConToken,
    obtenerMediosDePagoDisponibles,
    confirmarReserva
} from './src/api/API_Back';
import './src/assets/Pagar.css';

export default function Pagar({
    datosReserva,
    monto,
    onPagoExitoso,
    OnPagoError,
    onCancelar
}) {

    const datosReservaPrueba = {
        nombre: 'Empresa Catering Premium S.A.',
        idReserva: 12,
        id: 1,
        descripcion: 'Servicio completo de catering para evento corporativo',
        nombreComprador: 'Maria',
        apellidoComprador: 'Becerra',
        telefonoComprador: '2634789002',
        emailComprador: 'e@gmail.com',
        fechaReserva: '16/09/2025',
        reseniaGeneral: '4,7',
        cantidadResenia: '25 reseñas',
        CUIT: '20-475676345-4',
        tipoFactura: 'A'
    };

    const datosFinales = datosReserva; //   datosReservaPrueba
    
    //estados para medios de pago
    const [mediosPagoDisponibles, setMediosPagoDisponibles] = useState([])
    const [metodoPagoSeleccionado, setMetodoPagoSeleccionado] = useState(null)
    const [cargando, setCargando] = useState(false)
    const [preferenceId, setPreferenceId] = useState(null)
    
    //estados para modales
    const [showExito, setShowExito] = useState(false)
    const [exitoTitulo, setExitoTitulo] = useState('')
    const [exitoMensaje, setExitoMensaje] = useState('')

    const [showError, setShowError] = useState(false)
    const [errorTitulo, setErrorTitulo] = useState('')
    const [errorMensaje, setErrorMensaje] = useState('')

    const [showInfo, setShowInfo] = useState(false)
    const [infoTitulo, setInfoTitulo] = useState('')
    const [infoMensaje, setInfoMensaje] = useState('')

    const [urlPruebas, setUrlPruebas] = useState('');
    const [urlProduccion, setUrlProduccion] = useState('');

    const [pagoExitosoResultado, setPagoExitosoResultado] = useState(null)


    //para manejar modales
    const manejarExito = (titulo, mensaje) => {
        setExitoTitulo(titulo)
        setExitoMensaje(mensaje)
        setShowExito(true)
    }

    const manejarError = (titulo, mensaje) => {
        setErrorTitulo(titulo)
        setErrorMensaje(mensaje)
        setShowError(true)
    } 

    const manejarInfo = (titulo, mensaje) => {
        setInfoTitulo(titulo)
        setInfoMensaje(mensaje)
        setShowInfo(true)
    }

    useEffect(() => {
        initMercadoPago(Public_Key, {locale: 'es-AR'});
        cargarMediosPago();
    }, []);

    const cargarMediosPago = async () => {
        try {
            setCargando(true)
            console.log('Cargando medios de pago...');
            
            const medios = await obtenerMediosDePagoDisponibles();
            console.log('Medios de pago obtenidos:', medios);

            const mediosVisibles = medios.filter(m => m.esVisible === true);

            setMediosPagoDisponibles(mediosVisibles);
            if (mediosVisibles.length > 0) {
                setMetodoPagoSeleccionado('tarjeta');
                console.log('Método seleccionado por defecto: tarjeta');
            } else {
                setMetodoPagoSeleccionado('mercadopago');
                console.log('Método seleccionado por defecto: mercadoPago');
            }
        } catch (error) {
            console.error('Error cargando medios de pago:', error);
            manejarError('Error', error.message || 'Error cargando métodos de pago disponibles');
        } finally {
            setCargando(false);
        }
    }

    //las preferencias son para el wallet/ q el usuario pueda pagar en mercado pago 
    const crearPreferencia = async () => {
        try {
            setCargando(true)
            console.log('se esta creando la preferencia de MercadoPago...');

            const datosPreferencia = {
                amount: monto,
                title: `Reserva de ${datosFinales.nombre || 'Evento'}`,
                description: `Reserva para el ${datosFinales.fechaReserva}`,
                payerEmail: datosFinales.emailComprador,
                payerName: datosFinales.nombreComprador,
                payerSurname: datosFinales.apellidoComprador,
                payerPhone: datosFinales.telefonoComprador,
                id: datosFinales.id,
                fechaReserva: datosFinales.fechaReserva,
                successUrl: 'http://localhost:5173/ExitoPago', //actualizar al deployar
                failureUrl: 'http://localhost:5173/FalloPago',
                pendingUrl: 'http://localhost:5173/PendientePago'
            }

            console.log('Datos preferencia:', datosPreferencia);

            const respuesta = await crearPreferenciaMercadoPago(datosPreferencia);
            setUrlPruebas(respuesta.sandBoxInitPoint);
            setUrlProduccion(respuesta.initPoint);
            
            if (respuesta.status === 'SUCCESS') {
                setPreferenceId(respuesta.preferenceId)
                console.log('Preferencia creada exitosamente:', respuesta.preferenceId);
            } else {
                throw new Error(respuesta.message || 'Error creando preferencia')
            }

        } catch (error) {
            console.error('Error creando preferencia:', error)
            manejarError(
                'Error preparando el pago', 
                error.message || 'No se pudo preparar el método de pago de MercadoPago'
            )
        } finally {
            setCargando(false)
        }
    }

    const armarDTO = (resultado) => {
        const DatosReservaDTO = {
                idReserva: Number(datosFinales.idReserva),
                externalReference: resultado.externalReference,
                approvalUrl: resultado.approvalUrl,
                idPago: resultado.id,
                paymentMethodId: resultado.payment_method_id,
                transactionAmount: resultado.transaction_amount,
                netReceivedAmount: resultado.net_received_amount,
                feeAmount: resultado.fee_amount,
                dateCreated: resultado.date_created,
                dateApproved: resultado.date_approved,
                nombreComprador: datosFinales.nombreComprador,
                apellidoComprador: datosFinales.apellidoComprador,
                telefonoComprador: datosFinales.telefonoComprador,
                mailComprador: datosFinales.emailComprador,
                cuitComprador: datosFinales.cuit, //cheaquear cdo el ale lo haga
                tipoFactura: datosFinales.tipoFactura
            };

        return DatosReservaDTO;
    };

    const efectivizarReserva = async (DatosReservaDTO) => {           
        await confirmarReserva(DatosReservaDTO);
    };

    const manejarResultadoPago = (resultado) => {
        console.log('Resultado del pago:', resultado);
        console.log('status_detail recibido:', resultado.status_detail);


        if (resultado.status === 'APPROVED') {
            efectivizarReserva(armarDTO(resultado));
            manejarExito('¡Pago aprobado exitosamente!', 'Tu reserva ha sido confirmada');
            setPagoExitosoResultado(armarDTO(resultado));

        } else if(resultado.status_detail === 'pending_contingency') {
            manejarInfo('Pendiente de pago', 'El pago no pudo ser procesado por un problema con tu banco, intenta nuevamente o contacta a la entidad bancaria.');
        } else if(resultado.status_detail === 'cc_rejected_call_for_authorize') {
            manejarError('Pago rechazado', 'El pago no pudo ser procesado porque necesitas autorización por parte de tu entidad bancaria.');
        } else if(resultado.status_detail === 'cc_rejected_bad_filled_security_code') {
            manejarError('Pago rechazado', 'Rechazado por código de seguridad inválido.');
        } else if(resultado.status_detail === 'cc_rejected_bad_filled_date'){
            manejarError('Pago rechazado', 'Rechazado debido a un problema de fecha de vencimiento de tu tarjeta.');
        } else if (resultado.status_detail === 'cc_rejected_insufficient_amount') {
            manejarError('Pago rechazado', 'El pago no pudo ser procesado por falta de fondos, intenta con otra tarjeta.');
        } else {
            manejarError('Pago rechazado', 'El pago no pudo ser procesado. Por favor, verifica tus datos e intenta nuevamente.');
        }
    }

    const mediosVisibles = mediosPagoDisponibles.filter(m => m.esVisible === true);
    const hayTarjetaDisponible = mediosVisibles.length > 0;
    const hayMercadoPagoDisponible = false; //desactivamos la redireccion a MP xq no desplegamos 

    //para el form de las tarjetas
    const cardPaymentConfig = {
        initialization: {
            amount: monto,
            
        },
        customization: {
            paymentMethods: {
                types: {
                    included: hayTarjetaDisponible ? ['credit_card', 'debit_card'] : []
                }
            },
            visual: {
                style: {
                    theme: 'default'
                }
            }
        },
        locale: 'es-AR',
        callbacks: {
            onReady: () => {
                console.log('CardPayment ready');
            },
            onSubmit: ({ selectedPaymentMethod, formData }) => {
                console.log('CardPayment submitted:', selectedPaymentMethod, formData);
                return new Promise((resolve, reject) => {
                    resolve();
                });
            },
            onError: (error) => {
                console.error('CardPayment error:', error);
                manejarError('Error en el pago', 'Hubo un problema procesando tu tarjeta');
            },
        },
    };

    //para el wallet de MercadoPago
    const walletConfig = {
    initialization: {
        preferenceId: preferenceId,
        redirectMode: 'blank', 
    },
    customization: {
        texts: {
            valueProp: 'smart_option',
        },
        visual: {
            buttonBackground: 'blue',
            borderRadius: '8px',
            valuePropColor: 'blue',
            hideValueProp: false,
        }
    },
    callbacks: {
        onReady: () => {
            console.log('Wallet listo y configurado');
        },
        onSubmit: () => {
            console.log('Wallet onSubmit triggered - el usuario sera redirigido');
            return new Promise((resolve) => {
                console.log('Wallet submit procesado - redireccion iniciada');
                resolve();
            });
        },
        onError: (error) => {
            console.error('Wallet error:', error);
            manejarError('Error en Wallet', 'Hubo un problema con el Wallet de MercadoPago');
        }
    },
}
    
    if (cargando && !metodoPagoSeleccionado) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <span className="loading-text">Cargando métodos de pago...</span>
            </div>
        )
    }

    return (
        <>
            <div className="pagar-container">
                <h2 className="pagar-title">
                    P A G A R
                </h2>

                {/* info */}
                <ResumenPago 
                    monto={monto}
                    datosFinales={datosFinales}
                />

                <div className="payment-selector">
                    <div className="payment-tabs">
                        {hayMercadoPagoDisponible && (
                            <button
                                className={`payment-tab ${metodoPagoSeleccionado === 'mercadopago' ? 'active-mercadopago' : ''}`}
                                onClick={async () => {
                                    console.log('🔄 Seleccionando Wallet MercadoPago')
                                    setMetodoPagoSeleccionado('mercadopago')
                                    if (!preferenceId) {
                                        try {
                                            await crearPreferencia();
                                        } catch (error) {
                                            console.error('Error preparando Wallet:', error);
                                        }
                                    }
                                }}
                            >
                                Mercado Pago
                            </button>
                        )}
                        
                        {hayTarjetaDisponible && (
                            <button
                                className={`payment-tab ${metodoPagoSeleccionado === 'tarjeta' ? 'active-tarjeta' : ''}`}
                                onClick={() => {
                                    console.log('Seleccionando Tarjeta')
                                    setMetodoPagoSeleccionado('tarjeta')
                                }}
                            >
                                Tarjeta
                            </button>
                        )}
                    </div>
                </div>

                {/* vista wallet*/}
                {metodoPagoSeleccionado === 'mercadopago' && hayMercadoPagoDisponible && (
                    <div className="mercadopago-container">
                        <div className="mercadopago-content">
                            <div className="mercadopago-icon">
                                <svg fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                </svg>
                            </div>
                            <h3 className="mercadopago-title">
                                Mercado Pago
                            </h3>
                            <p className="mercadopago-description">
                                Paga de forma rápida y segura con tu cuenta de Mercado Pago
                            </p>
                            <p className="mercadopago-amount">
                                Monto a pagar: <strong>${monto}</strong>
                            </p>
                        </div>

                        {/* redireccionna mp */}
                        {preferenceId ? (
                            <div style={{ marginTop: '24px' }}>
                                <Wallet 
                                    initialization={walletConfig.initialization}
                                    customization={walletConfig.customization}
                                    onReady={walletConfig.callbacks.onReady}
                                    onSubmit={walletConfig.callbacks.onSubmit}
                                    onError={walletConfig.callbacks.onError}
                                />
                                
                                <div className="mercadopago-info" style={{ marginTop: '16px' }}>
                                    Serás redirigido a Mercado Pago para completar el pago
                                </div>
                            </div>
                        ) : cargando ? (
                            <div className="mercadopago-loading">
                                <div className="mercadopago-loading-spinner"></div>
                                <span className="mercadopago-loading-text">
                                    Preparando Wallet...
                                </span>
                            </div>
                        ) : (
                            <div className="mercadopago-error">
                                Error preparando Wallet. Intenta nuevamente.
                                <br />
                                <button 
                                    className="mercadopago-retry-button"
                                    onClick={async () => {
                                        console.log('Reintentando crear preferencia para Wallet...');
                                        try {
                                            await crearPreferencia();
                                        } catch (error) {
                                            console.error('Error en retry:', error);
                                        }
                                    }}
                                >
                                    Reintentar
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* tarjeta*/}
                {metodoPagoSeleccionado === 'tarjeta' && hayTarjetaDisponible && (
                    <div className="tarjeta-container">
                        <div className='cardpayment-container'>
                            <CardPayment
                                initialization={cardPaymentConfig.initialization}
                                customization={cardPaymentConfig.customization}
                                onSubmit={(formData) => {
                                    console.log('Datos completos del formulario:', formData);

                                    return new Promise(async (resolve, reject) => {
                                        try {
                                            setCargando(true);

                                            const paymentData = {
                                                token: formData.token,
                                                issuer_id: formData.issuer_id,
                                                payment_method_id: formData.payment_method_id,
                                                transaction_amount: Number(formData.transaction_amount),
                                                installments: Number(formData.installments),
                                                description: `Reserva de ${datosFinales.nombre} para el ${datosFinales.fechaReserva}`,

                                                payer: {
                                                    email: formData.payer.email,
                                                    first_name: datosFinales.nombreComprador,
                                                    last_name: datosFinales.apellidoComprador,
                                                    identification: {
                                                        type: formData.payer.identification.type,
                                                        number: formData.payer.identification.number
                                                    }
                                                }
                                            };

                                            console.log('Datos enviados al backend:', paymentData);
                                            const resultado = await procesarPagoConToken(paymentData);
                                            console.log('Respuesta del backend:', resultado);
                                            manejarResultadoPago(resultado);
                                            resolve();

                                        } catch (error) {
                                            console.error('Error:', error);
                                            manejarError('Error en el pago', error.message);
                                            reject();
                                        } finally {
                                            setCargando(false);
                                        }
                                    });
                                }}
                                onReady={() => console.log('CardPayment listo')}
                                onError={(error) => {
                                    console.error('Error en CardPayment:', error);
                                    manejarError('Error', 'Problema con los datos de la tarjeta');
                                }}
                            />
                        </div>
                        <div className="tarjeta-actions">
                            <button
                                className="tarjeta-cancel-button"
                                onClick={onCancelar}
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                )}

                {!hayTarjetaDisponible && !hayMercadoPagoDisponible && (
                    <div className="no-payment-methods">
                        No hay métodos de pago disponibles en este momento.
                    </div>
                )}
            </div>
            
            {/* Modales */}
            <ModalAccionExito
                titulo={exitoTitulo}
                mensaje={exitoMensaje}
                mostrar={showExito}
                onAceptar={() => {
                    setShowExito(false);
                    if (pagoExitosoResultado) {
                        onPagoExitoso(pagoExitosoResultado);
                        setPagoExitosoResultado(null); 
                    }
                }}
            />

            <Modal_Error
                titulo={errorTitulo}
                mensaje={errorMensaje}
                mostrar={showError}
                onCerrar={() => setShowError(false)}
            />

            <Modal_Info
                titulo={infoTitulo}
                mensaje={infoMensaje}
                mostrar={showInfo}
                onEntendido={() => setShowInfo(false)}
            />
        </>
    )
}