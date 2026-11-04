  import React, { useState, useEffect } from 'react';
  import { FaStar } from 'react-icons/fa';
  import SuccessAlert from '../../common/layouts/SuccessAlert'

const API_URL = "http://localhost:8080/api/resena";

const FormularioResena = ({ tipo, id,idEvento }) => {
  const [estrellas, setEstrellas] = useState(0);
  const [comentario, setComentario] = useState('');
  const [editando, setEditando] = useState(false);
  const [resena, setResena] = useState(null);
  const [loading, setLoading] = useState(true);
  console.log("id evento en la reseña:",idEvento)

  //  Estado para la alerta
  const [mensajeAlerta, setMensajeAlerta] = useState('');
  const [mostrarAlerta, setMostrarAlerta] = useState(false);

  const token = localStorage.getItem("token");

  const mostrarMensaje = (texto) => {
    setMensajeAlerta(texto);
    setMostrarAlerta(true);
  };

  const fetchResena = async () => {
    try {
      const response = await fetch(`${API_URL}/getResenaPorUsuario`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ tipo, id }),
      });

      if (!response.ok) {
        if (response.status === 404) {
          setResena(null);
          setEditando(true);
        }
        return;
      }

      const text = await response.text();
      if (!text) {
        setResena(null);
        setEditando(true);
        return;
      }

      const data = JSON.parse(text);
      setResena(data);
      setEstrellas(data.rating || 0);
      setComentario(data.comentario || "");
      setEditando(false);
    } catch (error) {
      console.error("Error al obtener reseña:", error);
    } finally {
      setLoading(false);
    }
  };

  /** Crear o actualizar reseña */
  const handleGuardar = async () => {
    if (estrellas === 0 || comentario.trim() === "") {
      mostrarMensaje("Por favor completa la calificación y el comentario.");
      return;
    }

    const dto = { tipo, id, descripcion: comentario, estrellas,idEvento };

    try {
      const url = resena ? `${API_URL}/update/${resena.id}` : `${API_URL}/crear`;
      const method = resena ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(dto),
      });

      if (response.ok) {
        const data = await response.json();
        setResena(data);
        setEstrellas(data.rating || 0);
        setComentario(data.comentario || "");
        setEditando(false);
        mostrarMensaje(resena ? "Reseña actualizada con éxito" : "Reseña guardada con éxito");
      } else {
        const errorMsg = await response.text();
        console.error("Error al guardar reseña:", errorMsg);
        mostrarMensaje("Error al guardar la reseña.");
      }
    } catch (error) {
      console.error("Error al enviar reseña:", error);
      mostrarMensaje("Error de red al guardar reseña.");
    }
  };


const handleEliminar = async () => {
  if (!resena) return;

  try {
    const response = await fetch(`${API_URL}/delete/${resena.id}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}` },
    });

    if (response.ok) {
      // ✅ Limpiamos el estado local
      setResena(null);
      setEstrellas(0);
      setComentario("");
      setEditando(true);
      mostrarMensaje("Reseña eliminada correctamente");
    } else {
      console.error("Error al eliminar reseña:", response.status);
      mostrarMensaje("No se pudo eliminar la reseña.");
    }
  } catch (error) {
    console.error("Error de red al eliminar reseña:", error);
    mostrarMensaje("Error de red al eliminar la reseña.");
  }
};


  const handleEditar = () => setEditando(true);
  const handleCancelar = () => {
    if (resena) {
      setEstrellas(resena.rating);
      setComentario(resena.comentario);
      setEditando(false);
    } else {
      setEstrellas(0);
      setComentario("");
    }
  };

  useEffect(() => {
    fetchResena();
  }, [tipo, id]);

  if (loading) return <p>Cargando reseña...</p>;

  const mostrarFormularioEdicion = editando || !resena;
  const mostrarReseñaExistente = resena && !editando;

  return (
    <div className="resena-box-form">
      {/*  Alerta de éxito */}
      <SuccessAlert
        mensaje={mensajeAlerta}
        mostrar={mostrarAlerta}
        onClose={() => setMostrarAlerta(false)}
      />

      <style>{`
        .resena-box-form {
          background-color: #f9f9f9;
          padding: 1.5rem;
          border-radius: 14px;
          border: 1.5px solid #d1d5db;
          max-width: 400px;
          display: flex;
          flex-direction: column;
          position: relative;
        }
        .resena-box-form h3 {
          margin-top: 0;
          font-size: 1.4rem;
          margin-bottom: 0.5rem;
          color: #555;
        }
        .resena-box-form .estrellas {
          display: flex;
          gap: 0.3rem;
          margin-bottom: 1rem;
        }
        .resena-box-form .estrella-interactiva {
          cursor: pointer;
          transition: transform 0.1s;
        }
        .resena-box-form .estrella-interactiva:hover {
          transform: scale(1.1);
        }
        .textarea {
          width: 100%;
          min-height: 80px;
          border-radius: 8px;
          padding: 0.8rem;
          border: 1px solid #ccc;
          margin-bottom: 1rem;
        }
        .resena-buttons {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        button {
          padding: 8px 16px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.9rem;
          color: white;
        }
        .btn-guardar { background-color: #10b981; }
        .btn-editar { background-color: #2563eb; }
        .btn-eliminar { background-color: #dc3545; }
        .btn-cancelar { background-color: #6b7280; }
      `}</style>

      <h3>Mi reseña sobre este {tipo.toLowerCase()}</h3>

      {mostrarReseñaExistente ? (
        <>
          <div className="estrellas">
            {[1, 2, 3, 4, 5].map((i) => (
              <FaStar key={i} color={i <= estrellas ? "#f5c518" : "#ccc"} size={20} />
            ))}
          </div>
          <p>{comentario}</p>
          <div className="resena-buttons">
            <button className="btn-editar" onClick={handleEditar}>Editar</button>
            <button className="btn-eliminar" onClick={handleEliminar}>Eliminar</button>
          </div>
        </>
      ) : (
        <>
          <div className="estrellas">
            {[1, 2, 3, 4, 5].map((i) => (
              <FaStar
                key={i}
                color={i <= estrellas ? "#f5c518" : "#ccc"}
                size={20}
                className="estrella-interactiva"
                onClick={() => setEstrellas(i)}
              />
            ))}
          </div>
          <textarea
            className="textarea"
            placeholder="Escribe tu opinión..."
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
          />
          <div className="resena-buttons">
            <button className="btn-guardar" onClick={handleGuardar}>
              {resena ? "Actualizar" : "Guardar"}
            </button>
            {resena && (
              <button className="btn-cancelar" onClick={handleCancelar}>
                Cancelar
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default FormularioResena;