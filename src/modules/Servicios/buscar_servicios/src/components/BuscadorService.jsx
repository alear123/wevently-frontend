import { useState } from "react";

export default function Buscador({
  placeholder = "Buscar",
  value,
  onChange,
  onBuscar,
  filtrarMientrasEscribes = true,
}) {
  const [localValue, setLocalValue] = useState("");

  // Decide qué valor mostrar en el input
  const inputValue = filtrarMientrasEscribes ? value : localValue;

  const handleInputChange = (e) => {
    const texto = e.target.value;
    if (filtrarMientrasEscribes) {
      onChange(texto);
    } else {
      setLocalValue(texto);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && onBuscar) {
      e.preventDefault();
      onBuscar(filtrarMientrasEscribes ? value : localValue);
    }
  };

  const handleSearchClick = () => {
    if (onBuscar) {
      onBuscar(filtrarMientrasEscribes ? value : localValue);
    }
  };

  return (
    <div style={{ width: "100%", maxWidth: "850px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          background: "#ffffffff",
          borderRadius: "9.5px",
          padding: "3px 20px",
          boxSizing: "border-box",
          border: "1px solid #7A7A7A",
        }}
      >
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          maxLength={50}
          style={{
            border: "none",
            background: "transparent",
            outline: "none",
            fontSize: "1.4rem",
            flex: 1,
            color: "#333",
          }}
        />
        <span
          style={{
            fontSize: "1.4rem",
            color: "#555",
            marginLeft: "8px",
            cursor: "pointer",
          }}
          onClick={handleSearchClick}
        >
          <i className="fas fa-search"></i>
        </span>
      </div>
    </div>
  );
}
