import React, { useState } from "react"

const CalendarPicker = ({ reservedDates = [], selectedDate, onSelect,disabled = false }) => {
  const today = new Date()
  // Normalizar la fecha de hoy para comparación (sin horas)
  const todayNormalized = new Date(today.getFullYear(), today.getMonth(), today.getDate())

  const [currentMonth, setCurrentMonth] = useState(selectedDate?.getMonth() ?? today.getMonth())
  const [currentYear, setCurrentYear] = useState(selectedDate?.getFullYear() ?? today.getFullYear())

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const startDay = new Date(currentYear, currentMonth, 1).getDay()

  const isSameDay = (date1, date2) =>
    date1?.getDate() === date2?.getDate() &&
    date1?.getMonth() === date2?.getMonth() &&
    date1?.getFullYear() === date2?.getFullYear()

  const isReserved = (day) =>
    reservedDates.some(
      (resDate) =>
        resDate.getDate() === day && resDate.getMonth() === currentMonth && resDate.getFullYear() === currentYear,
    )

  // Nueva función para verificar si una fecha es anterior a hoy
  const isPastDate = (day) => {
    const dateObj = new Date(currentYear, currentMonth, day)
    return dateObj < todayNormalized
  }

  // Función para verificar si una fecha no es seleccionable (pasada o reservada)
  const isDisabled = (day) => {
    return isPastDate(day) || isReserved(day)
  }

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear((prev) => prev - 1)
    } else {
      setCurrentMonth((prev) => prev - 1)
    }
  }

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear((prev) => prev + 1)
    } else {
      setCurrentMonth((prev) => prev + 1)
    }
  }

  const monthNames = [
    "enero",
    "febrero",
    "marzo",
    "abril",
    "mayo",
    "junio",
    "julio",
    "agosto",
    "septiembre",
    "octubre",
    "noviembre",
    "diciembre",
  ]

  const styles = {
    calendarPicker: {
      fontFamily: "inherit",
      border: "1px solid #d1d5db",
      borderRadius: "8px",
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
      background: "white",
      overflow: "hidden",
      minWidth: "270px",
      margin: "0 auto",
      display: "block",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "16px",
      background: "#f9fafb",
      borderBottom: "1px solid #e5e7eb",
      fontWeight: "600",
      color: "#1f2937",
      fontSize: "14px",
    },
    navButton: {
      background: "none",
      border: "none",
      fontSize: "18px",
      color: "#6b7280",
      cursor: "pointer",
      padding: "4px 8px",
      borderRadius: "4px",
      transition: "background-color 0.2s",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "32px",
      height: "32px",
    },
    weekdays: {
      display: "grid",
      gridTemplateColumns: "repeat(7, 1fr)",
      background: "#f9fafb",
      borderBottom: "1px solid #e5e7eb",
    },
    weekday: {
      textAlign: "center",
      padding: "12px 4px",
      fontSize: "12px",
      fontWeight: "500",
      color: "#6b7280",
      textTransform: "uppercase",
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(7, 1fr)",
      padding: "8px",
      gap: "2px",
    },
    day: {
      textAlign: "center",
      padding: "8px 4px",
      borderRadius: "6px",
      cursor: "pointer",
      transition: "all 0.2s",
      fontSize: "14px",
      color: "#374151",
      minHeight: "32px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: "400",
    },
    dayHover: {
      backgroundColor: "#f3f4f6",
    },
    selected: {
      backgroundColor: "#3b82f6",
      color: "white",
      fontWeight: "600",
    },
    disabled: {
      backgroundColor: "#f9fafb",
      color: "#d1d5db",
      cursor: "not-allowed",
    },
    pastDate: {
      backgroundColor: "#f9fafb",
      color: "#d1d5db",
      cursor: "not-allowed",
      textDecoration: "line-through",
    },
    reserved: {
      backgroundColor: "#fef2f2",
      color: "#dc2626",
      cursor: "not-allowed",
    },
    empty: {
      backgroundColor: "transparent",
      cursor: "default",
    },
  }

  const generateCalendar = () => {
    const calendar = []

    // Días vacíos al inicio
    for (let i = 0; i < startDay; i++) {
      calendar.push(<div key={`empty-${i}`} style={{ ...styles.day, ...styles.empty }} />)
    }

    // Días del mes
    for (let day = 1; day <= daysInMonth; day++) {
      const dateObj = new Date(currentYear, currentMonth, day)
      const reserved = isReserved(day)
      const pastDate = isPastDate(day)
      const disabled = isDisabled(day)
      const isDayDisabled = disabled || isDisabled(day) 
      const selected = isSameDay(dateObj, selectedDate)

      let dayStyle = {
        ...styles.day,
      }

      // Aplicar estilos según el estado
      if (selected) {
        dayStyle = { ...dayStyle, ...styles.selected }
      } else if (pastDate) {
        dayStyle = { ...dayStyle, ...styles.pastDate }
      } else if (reserved) {
        dayStyle = { ...dayStyle, ...styles.reserved }
      }

      let displayContent = day
      if (reserved) {
        displayContent = "×"
      } else if (pastDate) {
        displayContent = day
      }

      calendar.push(
        <div
          key={day}
          style={dayStyle}
          onClick={() => !disabled && onSelect(dateObj)}
          onMouseEnter={(e) => {
            if (!disabled && !selected) {
              e.target.style.backgroundColor = styles.dayHover.backgroundColor
            }
          }}
          onMouseLeave={(e) => {
            if (!disabled && !selected) {
              e.target.style.backgroundColor = "transparent"
            }
          }}
          title={pastDate ? "Fecha no disponible (pasada)" : reserved ? "Fecha reservada" : ""}
        >
          {displayContent}
        </div>,
      )
    }

    return calendar
  }

  return (
    <>
      <style jsx>{`
        .nav-button:hover {
          background-color: #f3f4f6 !important;
        }
      `}</style>
      <div style={styles.calendarPicker}>
        <div style={styles.header}>
          <button style={styles.navButton} className="nav-button" onClick={handlePrevMonth}>
            ‹
          </button>
          <span>
            {monthNames[currentMonth]} de {currentYear}
          </span>
          <button style={styles.navButton} className="nav-button" onClick={handleNextMonth}>
            ›
          </button>
        </div>

        <div style={styles.weekdays}>
          {["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"].map((d, i) => (
            <div key={i} style={styles.weekday}>
              {d}
            </div>
          ))}
        </div>

        <div style={styles.grid}>{generateCalendar()}</div>
      </div>
    </>
  )
}

export default CalendarPicker