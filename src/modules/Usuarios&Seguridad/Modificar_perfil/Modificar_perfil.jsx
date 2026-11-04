import { useState, useEffect } from "react"
import { User, Camera } from "lucide-react"
import './src/assets/Modificar_perfil.css'
import Navbar_Organizador from '../../../common/layouts/Navbar_Organizador';
import Navbar_Prestador from '../../../common/layouts/Navbar_Prestador';
import Navbar_Propietario from '../../../common/layouts/Navbar_Propietario';
import Navbar_Administrador from '../../../common/layouts/Navbar_Administrador';
import ModalError from '../../../common/layouts/ModalError';
import ModalExito from '../../../common/layouts/ModalAccionExito';
import ModalConfirmar from '../../../common/layouts/ModalConfirmarEditar';
import Breadcrumbs from '../../../common/layouts/Breadcrumbs';
import DOMINIO from '../../../common/API';
import * as Utils from '../../../common/Utils';



export default function ProfileEditor() {
  const [profileData, setProfileData] = useState({
    id: "",
    nombre: "",
    apellido: "",
    dia: "1",
    mes: "Enero",
    año: "2000",
    genero: "",
    email: "",
    username: "",
    profileImage: "",
    contraseñaActual: "",
    contraseñaNueva: "",
    repetirContrasena: "",
    alias: "",
    cbu: ""
  })

  const [errors, setErrors] = useState({})
  const [modalError, setModalError] = useState(false);
  const [modalConfirmar, setModalConfirmar] = useState(false);
  const [modalExito, setModalExito] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  const meses = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ]

  function getMesNumero(mesNombre) {
    switch (mesNombre) {
      case 'Enero':
        return 1;
      case 'Febrero':
        return 2;
      case 'Marzo':
        return 3;
      case 'Abril':
        return 4;
      case 'Mayo':
        return 5;
      case 'Junio':
        return 6;
      case 'Julio':
        return 7;
      case 'Agosto':
        return 8;
      case 'Septiembre':
        return 9;
      case 'Octubre':
        return 10;
      case 'Noviembre':
        return 11;
      case 'Diciembre':
        return 12;
      default:
        return 0; // o algún valor por defecto si el mes no coincide
    }

  }

  function getMesNombre(mesNumero) {
    switch (mesNumero) {
      case 1:
        return 'Enero';
      case 2:
        return 'Febrero';
      case 3:
        return 'Marzo';
      case 4:
        return 'Abril';
      case 5:
        return 'Mayo';
      case 6:
        return 'Junio';
      case 7:
        return 'Julio';
      case 8:
        return 'Agosto';
      case 9:
        return 'Septiembre';
      case 10:
        return 'Octubre';
      case 11:
        return 'Noviembre';
      case 12:
        return 'Diciembre';
      default:
        return ''; // o null si preferís indicar que no hay coincidencia
    }
  }


  const años = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        let token = localStorage.getItem("token")
        if (!token) {

        }

        const response = await fetch(`${DOMINIO}/api/seguridad/usuarios/perfil`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          }
        })

        if (response.ok) {
          setProfileData(await response.json())
        }
      }
      catch (error) {
        console.error("Error uploading image:", error)
        setMensaje("No se ha podido cargar el perfil")
        setModalError(true);
      }

    }

    fetchUserData();
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    if (name === "cbu") {
      // Solo permitir hasta 22 dígitos, solo enteros positivos
      const cleanValue = value.replace(/[^0-9]/g, "").slice(0, 22);
      setProfileData((prev) => ({
        ...prev,
        [name]: cleanValue,
      }));
    } else {
      setProfileData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Convertir a Base64
    const toBase64 = (file) =>
      new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(file) // Lee como DataURL (base64)
        reader.onload = () => resolve(reader.result)
        reader.onerror = (error) => reject(error)
      })

    try {
      const base64Image = await toBase64(file)

      // Previsualizar al instante
      setProfileData((prev) => ({
        ...prev,
        profileImage: base64Image,
      }))

    } catch (error) {
      console.error("Error uploading image:", error)
      setErrors({ image: "Error al subir la imagen" })

    }

  }


  const validateForm = () => {
    const newErrors = {}

    if (!profileData.nombre.trim()) {
      newErrors.nombre = "El nombre es requerido"
    }
    if (!profileData.apellido.trim()) {
      newErrors.apellido = "El apellido es requerido"
    }
    if (!profileData.email.trim()) {
      newErrors.email = "El email es requerido"
    } else if (!/\S+@\S+\.\S+/.test(profileData.email)) {
      newErrors.email = "Email no válido"
    }
    if (!profileData.contraseñaActual.trim()) {
      newErrors.contraseñaActual = "La contraseña actual es requerida para guardar cambios"
    }
    if (profileData.contraseñaNueva && profileData.contraseñaNueva !== profileData.repetirContrasena) {
      newErrors.repetirContrasena = "Las contraseñas no coinciden"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSaveChanges = async () => {
    setModalConfirmar(false);
    try {
      let token = localStorage.getItem("token")
      if (!token) {

      }

      const response = await fetch(`${DOMINIO}/api/seguridad/usuarios/perfil`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileData)
      })

      if (response.ok) {
        setTitulo("Perfil actualizado")
        setMensaje("El perfil ha sido actualizado correctamente")
        setModalExito(true);
      }
      else {
        setTitulo("Error");
        setMensaje(await response.text());
        setModalError(true);
        return
      }
    }
    catch (error) {
      setTitulo("Error");
      setMensaje("No se ha podido actualizar el perfil")
      setModalError(true);
    }

  }

  const getDiasDelMes = (mes, año) => {
    const mesIndex = meses.indexOf(mes)
    const añoNum = Number.parseInt(año)
    const diasEnMes = new Date(añoNum, mesIndex + 1, 0).getDate()
    return Array.from({ length: diasEnMes }, (_, i) => i + 1)
  }

  return (
    <>
      <div className="profile-editor-container">
        {/* Profile Header */}
        {Utils.getLoggedUser().rol == "Organizador" ?
          <Navbar_Organizador /> :
          Utils.getLoggedUser().rol == "Prestador" ?
            <Navbar_Prestador /> :
            Utils.getLoggedUser().rol == "Propietario" ?
              <Navbar_Propietario /> :
              Utils.getLoggedUser().rol == "Admin" ?
                <Navbar_Administrador /> :
                <Navbar_Organizador />
        }
        <Breadcrumbs />
        <div className="profile-editor-main">
          <div className="profile-editor-card">
            <div className="profile-editor-header">
              <div className="profile-editor-header-content">
                <User size={24} className="profile-editor-header-icon" />
                <h1 className="profile-editor-title">Mi Perfil</h1>
              </div>
            </div>

            <div className="profile-editor-content">
              {errors.general && (
                <div style={{ color: "red", marginBottom: "1rem", textAlign: "center" }}>{errors.general}</div>
              )}

              <div className="profile-editor-grid">
                {/* Profile Image Section */}
                <div className="profile-image-section">
                  <div className="profile-image-container">
                    <div className="profile-image-placeholder">
                      {profileData.profileImage ? (
                        <img
                          src={profileData.profileImage || "/placeholder.svg"}
                          alt="Profile"
                          style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }}
                        />
                      ) : (
                        <User size={48} className="profile-image-icon" />
                      )}
                    </div>
                    <label className="profile-image-upload-btn">
                      <Camera size={16} style={{ color: "white" }} />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="profile-image-upload-input"
                      />
                    </label>
                  </div>

                  <div className="profile-user-info">
                    <p className="profile-username-label">{profileData.nombre}</p>
                    <p className="profile-email-text">{profileData.email || "correo@ejemplo.com"}</p>
                  </div>
                  {/*
                <button type="button" className="profile-modify-image-btn">
                  Modificar imagen de perfil
                </button>
                */}
                </div>

                {/* Form Fields Section */}
                <div className="profile-form-section">
                  {/* Configuración de perfil */}
                  <div>
                    <h2 className="profile-section-title">Informacion personal</h2>

                    {/* Nombre y Apellido */}
                    <div className="profile-field-group">
                      <label className="profile-field-label">Nombre y Apellido</label>
                      <div className="profile-name-grid">
                        <div>
                          <input
                            type="text"
                            name="nombre"
                            value={profileData.nombre}
                            onChange={handleInputChange}
                            className={`profile-input ${errors.nombre ? "error" : ""}`}
                            disabled={loading}
                          />
                          {errors.nombre && <span className="profile-error-text">{errors.nombre}</span>}
                        </div>
                        <div>
                          <input
                            type="text"
                            name="apellido"
                            value={profileData.apellido}
                            onChange={handleInputChange}
                            className={`profile-input ${errors.apellido ? "error" : ""}`}
                            disabled={loading}
                          />
                          {errors.apellido && <span className="profile-error-text">{errors.apellido}</span>}
                        </div>
                      </div>
                    </div>

                    {/* Fecha nacimiento */}
                    <div className="profile-field-group">
                      <label className="profile-field-label">Fecha nacimiento</label>
                      <div className="profile-birthdate-grid">
                        <select
                          name="dia"
                          value={profileData.dia}
                          onChange={handleInputChange}
                          className="profile-select"
                          disabled={loading}
                        >
                          {getDiasDelMes(profileData.mes, profileData.año).map((dia) => (
                            <option key={dia} value={dia}>
                              {dia}
                            </option>
                          ))}
                        </select>
                        <select
                          name="mes"
                          value={getMesNombre(profileData.mes)}
                          onChange={(e) => {
                            setProfileData((prev) => ({
                              ...prev,
                              mes: getMesNumero(e.target.value),
                            }))
                          }}
                          className="profile-select"
                          disabled={loading}
                        >
                          {meses.map((mes, index) => (
                            <option key={index} value={mes}>
                              {mes}
                            </option>
                          ))}
                        </select>
                        <select
                          name="año"
                          value={profileData.año}
                          onChange={handleInputChange}
                          className="profile-select"
                          disabled={loading}
                        >
                          {años.map((año) => (
                            <option key={año} value={año}>
                              {año}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Género */}
                    <div className="profile-field-group">
                      <label className="profile-field-label">Género</label>
                      <div className="profile-radio-group">
                        <label className="profile-radio-item">
                          <input
                            type="radio"
                            name="genero"
                            value="Mujer"
                            checked={profileData.genero === "Mujer"}
                            onChange={handleInputChange}
                            className="profile-radio-input"
                            disabled={loading}
                          />
                          <span>Mujer</span>
                        </label>
                        <label className="profile-radio-item">
                          <input
                            type="radio"
                            name="genero"
                            value="Hombre"
                            checked={profileData.genero === "Hombre"}
                            onChange={handleInputChange}
                            className="profile-radio-input"
                            disabled={loading}
                          />
                          <span>Hombre</span>
                        </label>
                        {/*
                        <label className="profile-radio-item">
                          <input
                            type="radio"
                            name="genero"
                            value="Otro"
                            checked={profileData.genero === "Otro"}
                            onChange={handleInputChange}
                            className="profile-radio-input"
                            disabled={loading}
                          />
                          <span>Otro</span>
                        </label>
                        */}
                      </div>
                    </div>
                  </div>

                  {/* Configuración de la cuenta */}
                  <div>
                    <h2 className="profile-section-title">Configuración de la cuenta</h2>
                    <div className="profile-account-grid">
                      <div>
                        <label className="profile-field-label">Correo electrónico</label>
                        <input
                          type="email"
                          name="email"
                          value={profileData.email}
                          onChange={handleInputChange}
                          placeholder="Correo electrónico"
                          className={`profile-input ${errors.email ? "error" : ""}`}
                          disabled
                          readonly="true"
                        />
                        {errors.email && <span className="profile-error-text">{errors.email}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Datos bancarios*/}
                  <div>
                    <h2 className="profile-section-title">Informacion Bancaria</h2>
                    <div className="profile-account-grid">
                      <div>
                        <label className="profile-field-label">Alias</label>
                        <input
                          type="text"
                          name="alias"
                          value={profileData.alias}
                          onChange={handleInputChange}
                          placeholder="Alias"
                          className={`profile-input`}
                        />
                      </div>

                      <div>
                        <label className="profile-field-label">CBU</label>
                        <input
                          type="number"
                          min={0}
                          name="cbu"
                          value={profileData.cbu}
                          onChange={handleInputChange}
                          placeholder="CBU"
                          className={`profile-input`}
                        />
                        <div style={{ textAlign: 'right', fontSize: '0.9em', color: '#888', marginTop: '2px' }}>
                          {profileData.cbu ? `${profileData.cbu.toString().length}` : '0'}/22
                        </div>
                        {profileData.cbu && profileData.cbu.toString().length === 22 && (
                          <div style={{ color: '#d32f2f', fontSize: '0.85em', textAlign: 'right' }}>
                            Máximo 22 dígitos permitidos
                          </div>
                        )}
                      </div>

                    </div>
                  </div>

                  {/* Configuración de contraseña */}
                  <div>
                    <h2 className="profile-section-title">Actualizar contraseña</h2>

                    <div className="profile-password-grid">
                      <div>
                        <label className="profile-field-label">Contraseña Actual</label>
                        <input
                          type="password"
                          placeholder=""
                          className="profile-input"
                          value={profileData.contraseñaActual}
                          onChange={(e) => {
                            setProfileData((prev) => ({
                              ...prev,
                              contraseñaActual: e.target.value,
                            }))
                          }} />
                      </div>
                      <div>
                        <label className="profile-field-label">Contraseña nueva</label>
                        <input
                          type="password"
                          name="contraseñaNueva"
                          value={profileData.contraseñaNueva}
                          onChange={handleInputChange}
                          className={`profile-input ${errors.contraseñaNueva ? "error" : ""}`}
                          disabled={loading}
                        />
                        {errors.contraseñaNueva && <span className="profile-error-text">{errors.contraseñaNueva}</span>}
                      </div>

                      <div>
                        <label className="profile-field-label">Repetir contraseña nueva</label>
                        <input
                          type="password"
                          name="repetirContrasena"
                          value={profileData.repetirContrasena}
                          onChange={handleInputChange}
                          className={`profile-input ${errors.repetirContrasena ? "error" : ""}`}
                          disabled={loading}
                        />
                        {errors.repetirContrasena && (
                          <span className="profile-error-text">{errors.repetirContrasena}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Botón Guardar cambios */}
                  <div className="profile-save-section">
                    <button type="button" onClick={() => setModalConfirmar(true)} disabled={loading} className="profile-save-btn">
                      {loading ? "Guardando..." : "Guardar cambios"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ModalError mostrar={modalError} titulo={"Error"} mensaje={mensaje} onCerrar={() => { setModalError(false) }} />
      <ModalExito mostrar={modalExito} titulo={titulo} mensaje={mensaje} onAceptar={() => { setModalExito(false) }} />
      <ModalConfirmar mostrar={modalConfirmar} titulo={"Actualizar perfil"} mensaje={"Esta seguro que desea actualizar el perfil?"} accion={"Confirmar"} onConfirmar={handleSaveChanges} onCancelar={() => { setModalConfirmar(false) }} />
    </>
  )
}
