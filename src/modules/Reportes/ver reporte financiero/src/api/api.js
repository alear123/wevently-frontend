import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from "react-router-dom"
import * as Utils from '../../../../../common/Utils'
import dominio from '../../../../../common/API'



export const useReporteFinanciero = () => {

    const [ingresos, setIngresos] = useState([])
    /*
        { año: 2022, mes: 1, ingresos: 32000 }, { año: 2022, mes: 2, ingresos: 29500 },
        { año: 2022, mes: 3, ingresos: 40200 }, { año: 2022, mes: 4, ingresos: 37800 },
        { año: 2022, mes: 5, ingresos: 41000 }, { año: 2022, mes: 6, ingresos: 43000 },
        { año: 2022, mes: 7, ingresos: 39000 }, { año: 2022, mes: 8, ingresos: 41000 },
        { año: 2022, mes: 9, ingresos: 42000 }, { año: 2022, mes: 10, ingresos: 45000 },
        { año: 2022, mes: 11, ingresos: 47000 }, { año: 2022, mes: 12, ingresos: 48000 },

        // 2023
        { año: 2023, mes: 1, ingresos: 40200 }, { año: 2023, mes: 2, ingresos: 35000 },
        { año: 2023, mes: 3, ingresos: 47000 }, { año: 2023, mes: 4, ingresos: 39000 },
        { año: 2023, mes: 5, ingresos: 43500 }, { año: 2023, mes: 6, ingresos: 45500 },
        { año: 2023, mes: 7, ingresos: 42800 }, { año: 2023, mes: 8, ingresos: 44600 },
        { año: 2023, mes: 9, ingresos: 46000 }, { año: 2023, mes: 10, ingresos: 49000 },
        { año: 2023, mes: 11, ingresos: 50500 }, { año: 2023, mes: 12, ingresos: 52000 },

        // 2024
        { año: 2024, mes: 1, ingresos: 45250 }, { año: 2024, mes: 2, ingresos: 38900 },
        { año: 2024, mes: 3, ingresos: 52100 }, { año: 2024, mes: 4, ingresos: 41750 },
        { año: 2024, mes: 5, ingresos: 48000 }, { año: 2024, mes: 6, ingresos: 55200 },
        { año: 2024, mes: 7, ingresos: 49800 }, { año: 2024, mes: 8, ingresos: 53500 },
        { año: 2024, mes: 9, ingresos: 0 }, { año: 2024, mes: 10, ingresos: 0 },
        { año: 2024, mes: 11, ingresos: 0 }, { año: 2024, mes: 12, ingresos: 0 },

        // 2025 parcial
        { año: 2025, mes: 1, ingresos: 47000 }, { año: 2025, mes: 2, ingresos: 42000 },
        { año: 2025, mes: 3, ingresos: 53000 },
    ]);
    */
    const [texto, setTexto] = useState("");
    //Para manejar los modales de exito y error
    const [titulo, setTitulo] = useState("");
    const [mensaje, setMensaje] = useState("");
    const [mostrarExito, setMostrarExito] = useState(false);
    const [mostrarError, setMostrarError] = useState(false);
    const usuarioLogueado = Utils.getLoggedUser();
    const [confirmarAceptar, setConfirmarAceptar] = useState(false);
    const [confirmarRechazar, setConfirmarRechazar] = useState(false);
    const [tiposEventos, setTiposEventos] = useState([]);


    const getIngresos = async (desde, hasta, tipoEvento) => {
        try {
            const response = await fetch(
                `${dominio}/api/reportes/financiero/obtener?desde=${desde}&hasta=${hasta}&tipo=${tipoEvento}`,
                {
                    method: "GET",

                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );

            if (!response.ok) {
                setTitulo("Error")
                let msg = await response.text();
                if (response.status === 401) {
                    msg = "No tiene permisos para realizar esta acción";
                }
                setMensaje(msg);
                setMostrarError(true);
                return;
            }

            const data = await response.json(); // ← acá obtenés el array de JSON
            setIngresos(data); // ← lo guardás en el estado
            if(data.total === 0){
                setTitulo("Error");
                setMensaje("No se encontraron ingresos en el período seleccionado.");
                setMostrarError(true);
            }

        } catch (error) {
            setTitulo("Error");
            setMensaje('No se ha podido establecer una conexión con el servidor, intente más tarde');
            setMostrarError(true);
        }
    };

    const getTipoDeEventos = async () => {
        try {
            const response = await fetch(
                `${dominio}/api/tipo-de-evento`,
                {
                    method: "GET",

                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );

            if (!response.ok) {
                setTitulo("Error")
                let msg = await response.text();
                if (response.status === 401) {
                    msg = "No tiene permisos para realizar esta acción";
                }
                setMensaje(msg);
                setMostrarError(true);
                return;
            }
            const data = await response.json();
            setTiposEventos(data)
        }
        catch (error) {
            setTitulo("Error");
            setMensaje('No se ha podido establecer una conexión con el servidor, intente más tarde');
            setMostrarError(true);
        }
    }

    return { getIngresos, ingresos, getTipoDeEventos, tiposEventos, titulo, mensaje, mostrarError, setMostrarError, setTitulo, setMensaje };

}


