"use client"

import { useState } from "react"

const Carousel = ({ images = [], height = 300 }) => {
  const [currentIndex, setCurrentIndex] = useState(0)

  const prevImage = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const nextImage = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  const arrowStyle = {
    width: "45px",
    height: "45px",
    borderRadius: "50%",
    border: "1px solid rgba(148,163,184,0.3)",
    background: "white",
    cursor: "pointer",
    zIndex: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
    margin: 0,
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
  }

  const arrowIcon = (direction) => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {direction === "left" ? <path d="M15 18l-6-6 6-6" /> : <path d="M9 6l6 6-6 6" />}
    </svg>
  )

  return (
    <div style={{ width: "100%" }}>
      {/* Carrusel */}
      <div
        className="carousel-wrapper"
        style={{
          position: "relative",
          width: "100%",
          height: `${height}px`,
          display: "flex",
          alignItems: "center",
          overflow: "hidden",
          borderRadius: "20px",
        }}
      >
        {/* Flecha izquierda */}
        <button style={{ ...arrowStyle, left: "15px" }} onClick={prevImage}>
          {arrowIcon("left")}
        </button>

        {/* Imagen */}
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#f0f0f0",
          }}
        >
          <img
            src={images[currentIndex] || "/placeholder.svg"}
            alt={`Imagen ${currentIndex + 1}`}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              borderRadius: "20px",
              transition: "all 0.5s ease",
            }}
          />
        </div>

        {/* Flecha derecha */}
        <button style={{ ...arrowStyle, right: "15px" }} onClick={nextImage}>
          {arrowIcon("right")}
        </button>
      </div>

      {/* Indicadores */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "8px",
          marginTop: "12px",
        }}
      >
        {images.map((_, index) => (
          <span
            key={index}
            onClick={() => setCurrentIndex(index)}
            style={{
              width: currentIndex === index ? "12px" : "8px",
              height: currentIndex === index ? "12px" : "8px",
              borderRadius: "50%",
              background: currentIndex === index ? "#3b82f6" : "rgba(148,163,184,0.4)",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
          />
        ))}
      </div>
    </div>
  )
}

export default Carousel
