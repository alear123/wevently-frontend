import checkImg from "../../assets/logo_confirmacion.png";
import React, { useEffect } from "react";

export default function SuccessAlert({ mensaje, mostrar, onClose }) {
  useEffect(() => {
    if (mostrar) {
      const timer = setTimeout(onClose, 5000);
      return () => clearTimeout(timer);
    }
  }, [mostrar, onClose]);

  if (!mostrar) return null;

  return (
    <div
      style={{
        position: "fixed",
        left: "50%",
        bottom: "90px",
        transform: "translateX(-50%)",
        border: "2px solid #222",
        borderRadius: "20px",
        padding: "8px 20px",
        display: "flex",
        alignItems: "center",
        background: "#fff",
        minWidth: "260px",
        maxWidth: "90vw",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        fontFamily: "inherit",
        zIndex: 9999,
      }}
    >
      <span
        style={{
          background: "#10b981",
          borderRadius: "50%",
          width: "24px",
          height: "24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginRight: "10px",
        }}
      >
        <img
          src={checkImg}
          alt="check"
          style={{
            width: "18px",
            height: "18px",
            display: "block",
          }}
        />
      </span>
      <span
        style={{
          color: "#10b981",
          fontWeight: "bold",
          fontSize: "1rem",
          flex: 1,
        }}
      >
        {mensaje}
      </span>
      <button
        onClick={onClose}
        style={{
          border: "2px solid #222",
          borderRadius: "50%",
          width: "18px",
          height: "18px",
          aspectRatio: "1",
          background: "#fff",
          color: "#222",
          fontWeight: "bold",
          fontSize: "1rem",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginLeft: "10px",
          overflow: "hidden",
          lineHeight: "1",
          padding: "0",
          marginTop: "2px",
        }}
        aria-label="Cerrar"
      >
        <span style={{ marginTop: "-3px" }}>×</span>
      </button>
    </div>
  );
}
