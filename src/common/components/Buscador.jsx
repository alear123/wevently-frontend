import { useState } from "react";

export default function Buscador({
  placeholder = "Buscar",
  value,
  onChange,
  onBuscar,
  filtrarMientrasEscribes = true,
  useSharedStyles = false,
  width,
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

  if (useSharedStyles) {
    const styleWrapper = {};
    if (width) {
      styleWrapper.maxWidth = typeof width === 'number' ? width + 'px' : width;
      styleWrapper.width = '100%';
    }
    return (
      <div className="search-container" style={styleWrapper}>
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          maxLength={50}
          className="search-input"
        />
        <span className="search-icon" onClick={handleSearchClick}>
          <i className="fas fa-search"></i>
        </span>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", maxWidth: 400 }}>
      <style>
        {`
          .buscador-contenedor {
            display: flex;
            align-items: center;
            background: #e0e0e0;
            border-radius: 24px;
            padding: 6px 18px;
            box-sizing: border-box;
          }
          .buscador-input {
            border: none;
            background: transparent;
            outline: none;
            font-size: 1.4rem;
            flex: 1;
            color: #333;
            min-width: 0;
          }
          .buscador-icono {
            font-size: 1.4rem;
            color: #555;
            margin-left: 8px;
            cursor: pointer;
            flex-shrink: 0;
          }
          @media (max-width: 480px) {
            .buscador-contenedor {
              padding: 4px 8px;
            }
            .buscador-input {
              font-size: 1rem;
            }
            .buscador-icono {
              font-size: 1.1rem;
            }
          }
        `}
      </style>
      <div className="buscador-contenedor">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          maxLength={50}
          className="buscador-input"
        />
        <span className="buscador-icono" onClick={handleSearchClick}>
          <i className="fas fa-search"></i>
        </span>
      </div>
    </div>
  );
}
