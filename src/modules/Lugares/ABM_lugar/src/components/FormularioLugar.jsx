import  { useEffect, useState } from "react"
import { TipoFormulario } from "./TipoFormulario.js"
import * as Yup from "yup"
import { Modal, Form, Button } from "react-bootstrap"
import { useFormik } from "formik"
import { useDropzone } from "react-dropzone"
import "./formulario-lugar.css"
import LugaresServices from "../../../src/api/LugaresServices.js"
import serviciosServices from "../../../../Servicios/src/api/serviciosServices.js"
import ModalError from "../../../../../common/layouts/ModalError.jsx"
import ModalDarDeBaja from "../../../../../common/layouts/ModalDarDeBaja.jsx"


const FormularioLugar = ({ show, onHide, tittle, tipoFormulario, lugar, refreshData, onNotificar }) => {
  const [preview, setPreview] = useState([])
  const [localidadesSeleccionadas, setLocalidadesSeleccionadas] = useState([])
  const [serviciosSoportados, setServiciosSoportados] = useState([]);
  const [eventosSoportados, setEventosSoportados] = useState([]);
  const [caracteristicasSoportadas, setCaracteristicasSoportadas] = useState([]);
  const [tiposLugar, setTiposLugar] = useState([]);
  const [provinciasSeleccionables, setProvinciasSeleccionables] = useState([]);
  
  const [provinciaEncontrada, setProvinciaEncontrada] = useState(null);

  const [errorMessage, setErrorMessage] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);

 const handleCloseErrorModal = () => {
    setShowErrorModal(false);
    setErrorMessage('');

  };

  // Efecto para cargar datos cuando se abre el modal en modo edición
  // Falta adaptar a lugar

  // Validaciones Yup
  const validationSchema = () =>
    Yup.object().shape({
      nombreLugar: Yup.string()
      .required("El nombre es obligatorio")
      .min(3, "Mínimo 3 caracteres")
      .max(50, "Máximo 50 caracteres")
      .trim()
      .matches(/^(?!\s+$).+$/, "El nombre no puede estar vacío o contener solo espacios"),

      direccion: Yup.string()
      .required("La dirección es obligatoria")
      .min(5, "Mínimo 15 caracteres")
      .max(100, "Máximo 100 caracteres")
      .trim()
      .matches(/^(?!\s+$).+$/, "La dirección no puede estar vacía o contener solo espacios"),
      descripcion: Yup.string().required("La descripción es obligatoria")
      .min(15, "Mínimo 15 caracteres")
      .max(150, "Máximo 150 caracteres")
      .trim()
      .matches(/^(?!\s+$).+$/, "La descripción no puede estar vacía o contener solo espacios"),
      capacidad: Yup.number()
        .required("La capacidad es obligatoria")
        .positive("Debe ser un número positivo")
        .max(9999, "La capacidad no puede superar los 9999"),
      precioLugar: Yup.number()
      .required("El precio es obligatorio")
      .positive("Debe ser mayor a 0")
      .max(1000000, "El precio no puede superar los 1000000"),
      tipoLugar: Yup.object({
        id: Yup.number().required(),
        nombreTipoLugar: Yup.string().required(),
      }).required("El tipo de lugar es obligatorio"),
      imagenes: Yup.array().min(1, "Debe subir al menos una imagen").max(5, "No puede subir más de 5 imágenes"),
      localidad: Yup.object({
        id: Yup.number().required(),
        nombreLocalidad: Yup.string().required(),
      }).required("La localidad es obligatoria"),
      serviciosSoportados: Yup.array().min(1, "Selecciona al menos un servicio"),
      eventosSoportados: Yup.array().min(1, "Selecciona al menos un evento"),
      características: Yup.array()
    })
  
    
  // Formik
  const formik = useFormik({
    initialValues: {
      id: lugar?.id || null,
      nombreLugar: lugar?.nombreLugar || "",
      direccion: lugar?.direccion || "",
      descripcion: lugar?.descripcion || "",
      capacidad: lugar?.capacidad || "",
      precioLugar: lugar?.precioLugar || "",
      tipoLugar: lugar?.tipoLugar || { id: "", nombreTipoLugar: "" },
      imagenes: lugar?.imagenes || [],
      localidad: lugar?.localidad || { id: "", nombreLocalidad: "" },
      serviciosSoportados: lugar?.serviciosSoportados || [],
      eventosSoportados: lugar?.eventosSoportados || [],
      caracteristicas: lugar?.caracteristicas || [],
    },
    validationSchema: validationSchema(),
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: (values) => {
      handleSaveUpdate(values)
      console.log("Formulario lugar enviado:", values)
    },
  })

  // Efecto para cargar provincias, tipos de servicio y características desde la API
  useEffect(() => { 
    const fetchProvincias = async () => {
      try {
        const provinciasEntidad = await LugaresServices().obtenerProvincias();
        // Normalizar objeto que el componente puede usar fácil
        const provincias = provinciasEntidad.map(l => ({
          id: l.id,
          nombreProvincia: l.nombre,
          localidades: l.dtosLocalidad.map(loc => ({
            id: loc.id,
            nombreLocalidad: loc.nombre
        }))
      }));
      setProvinciasSeleccionables(provincias)
      } catch (error) {
        console.error("Error al obtener provincias:", error);
      }
    };
     
    const fetchTiposServicio = async () => {
      try {
        const dtosTipoServicioEntidad = await serviciosServices().obtenerDtosTipoServicio();
        console.log(dtosTipoServicioEntidad);
        // Normalizar objeto que el componente puede usar fácil
        const tiposServicio = dtosTipoServicioEntidad.map(dto => ({
          id: dto.id,
          nombreTipoServicio: dto.nombre
      }));
      setServiciosSoportados(tiposServicio)
    
      } catch (error) {
        console.error("Error al obtener tipos de servicio:", error);
      }
    };

    const fetchCaracteristicas = async () => {
      try {
        const dtoCaracteristicas = await LugaresServices().getCaracteristicas();
        console.log(dtoCaracteristicas);
        // Normalizar objeto que el componente puede usar fácil
        const caracteristicas = dtoCaracteristicas.map(dto => ({
          id: dto.id,
          nombreCaracteristica: dto.nombre
      }));
      setCaracteristicasSoportadas(caracteristicas)
    
      } catch (error) {
        console.error("Error al obtener características:", error);
      }
    };

    const fetchTipoEvento = async () => {
      try {
        const dtoTiposEvento = await LugaresServices().getTiposEvento();
        console.log(dtoTiposEvento);
        // Normalizar objeto que el componente puede usar fácil
        const tiposEvento = dtoTiposEvento.map(dto => ({
          id: dto.id,
          nombreTipoEvento: dto.nombre
      }));
      setEventosSoportados(tiposEvento)
    
      } catch (error) {
        console.error("Error al obtener tipos de evento:", error);
      }
    };

    const fetchTiposLugar = async () => {
      const tipos = await LugaresServices().obtenerDtosTipoLugar();
      setTiposLugar(tipos.map(t => ({
        id: t.id,
        nombreTipoLugar: t.nombre
      })));
    };
    

    fetchTipoEvento();
    fetchTiposLugar();
    fetchCaracteristicas();
    fetchTiposServicio();
    fetchProvincias();
  }, [lugar]);



  useEffect(() => {
  if (tipoFormulario === TipoFormulario.EDIT && lugar) {
    console.log("Editando lugar:", lugar)

    const localidadNombre = lugar.localidad ?? null;
    const provincia = provinciasSeleccionables.find((p) =>
      p.localidades.some((l) => l.nombreLocalidad === localidadNombre)
    )
    if (localidadNombre) {
      if (provincia) {
        setProvinciaEncontrada(provincia)
      }
    }

    console.log(provincia)
    // Actualizar valores iniciales de Formik
    
    // Normalizamos los arrays a IDs
    const serviciosIds = lugar.serviciosSoportados?.map(s => s.id) || [];
    const eventosIds = lugar.eventosSoportados?.map(e => e.id) || [];
    const caracteristicasIds = lugar.caracteristicas?.map(c => c.id) || [];
    const localidad = provincia?.localidades.find(l => l.nombreLocalidad === localidadNombre) || { id: "", nombreLocalidad: "" };
    const tipoLugar = tiposLugar.find(t => t.nombreTipoLugar === lugar.tipoLugar) || { id: "", nombreTipoLugar: "" };

    formik.setFieldValue("serviciosSoportados", serviciosIds);
    formik.setFieldValue("eventosSoportados", eventosIds);
    formik.setFieldValue("caracteristicas", caracteristicasIds);
    formik.setFieldValue("tipoLugar", tipoLugar);
    formik.setFieldValue("localidad", localidad);

    
  }
}, [tipoFormulario, lugar, provinciasSeleccionables])


  // Llamada a la api para obtener provincias y localidades
  const handleProvinciaChange = (e) => {
    const provinciaId = parseInt(e.target.value)
    const provincia = provinciasSeleccionables.find((p) => p.id === provinciaId)
    if (provincia) {
      setLocalidadesSeleccionadas(provincia.localidades)
    } else {
      setLocalidadesSeleccionadas([])
    }
  }


  // Función para convertir archivos a Base64
  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  // Función para guardar o actualizar lugar
  const handleSaveUpdate = async (values) => {
    try {
      const isNewLugar = !values.id;

      // Convertir imágenes a base64
      const base64Images = await Promise.all(
        (values.imagenes || []).map((file) =>
          file instanceof File ? toBase64(file) : file
        )
      );

      // Construir DTO según backend
      const lugarDto = {
        id: values.id || null,
        nombre: values.nombreLugar,
        direccion: values.direccion,
        tipoLugarId: values.tipoLugar.id,
        localidadId: values.localidad.id,
        precioLugar: parseFloat(values.precioLugar),
        descripcion: values.descripcion,
        capacidad: parseInt(values.capacidad),
        imagenesBase64: base64Images,
        serviciosSoportadosIds: (values.serviciosSoportados || []),
        eventosSoportadosIds: (values.eventosSoportados || []),
        caracteristicasId: (values.caracteristicas || []),
      };

      let data;
      if (isNewLugar) {
        console.log(lugarDto)
        data = await LugaresServices().crearLugar(lugarDto);
        console.log("Lugar creado:", data);
        refreshData(prev => !prev);
        onNotificar("Lugar creado exitosamente");
      } else {
        data = await LugaresServices().modificarLugar(lugarDto);
        console.log("Lugar actualizado:", data);
        refreshData(prev => !prev);
        onNotificar("Lugar actualizado exitosamente");
      }

      onHide();
    } catch (error) {
      console.error("Error al guardar/actualizar lugar:", error);

      const mensajeError =
        error?.response?.data?.message ||
        error.message ||
        "Ocurrió un error inesperado al guardar el lugar.";

      setErrorMessage(mensajeError);
      
      setTimeout(() => setShowErrorModal(true), 200); //
    }
  };

  // Función para dar de baja o habilitar un lugar
  const handleBajaLogica = async (lugar) => {
    if (!lugar) return;

    const id = lugar.id;
    const isActivo = !lugar.fechaBaja;
    
    try {
      const data = await LugaresServices().bajaLogicaLugar(id);
      console.log("Baja lógica exitosa:", data);
      onHide(); // cerrar modal si se estaba usando
      refreshData(prev => !prev);
      
      if (isActivo) {
        onNotificar("Lugar dado de baja exitosamente");
      } else {
        onNotificar("Lugar dado de alta exitosamente");
        
      }
    } catch (error) {
      console.error("Error al dar de baja/habilitar lugar:", error);

      const mensajeError =
        error?.response?.data?.message ||
        error.message ||
        "Ocurrió un error inesperado al cambiar el estado del lugar.";

      setErrorMessage(mensajeError);

      setTimeout(() => setShowErrorModal(true), 200); //
    }
  };


  // Dropzone
    const { getRootProps, getInputProps } = useDropzone({
      accept: {
        'image/jpeg': ['.jpg', '.jpeg'],
        'image/png': ['.png'],
        'image/webp': ['.webp']
      },
      multiple: true,
      onDrop: async (files) => {
        // Validar formato y dimensiones
        const validFiles = [];
  
        for (const file of files) {
          const isValid = await validarImagen(file);
          if (isValid) {
            validFiles.push(file);
          } else {
            const mensajeError = `La imagen "${file.name}" no cumple los requisitos (solo se permiten los formatos JPG, PNG o WEBP, y  tamaño entre 800x600px y 3840x2160px).`;
            setErrorMessage(mensajeError);
            setTimeout(() => setShowErrorModal(true), 200);
          }
        }
  
        // Continuar solo con las válidas
        if (validFiles.length > 0) {
          const currentImages = formik.values.imagenes || [];
          const newImages = [...currentImages, ...validFiles].slice(0, 5);
  
          formik.setFieldValue("imagenes", newImages);
  
          const currentPreviews = preview || [];
          const newPreviews = validFiles.map((file) =>
            Object.assign(file, { preview: URL.createObjectURL(file) })
          );
          const allPreviews = [...currentPreviews, ...newPreviews].slice(0, 5);
  
          setPreview(allPreviews);
        }
      },
    });
  
    // Validar formato y dimensiones de la imagen
    const validarImagen = (file) => {
      return new Promise((resolve) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) return resolve(false);
  
        const img = new Image();
        img.onload = () => {
          const { width, height } = img;
          const isWithinRange =
            width >= 800 && height >= 600 && width <= 3840 && height <= 2160;
          resolve(isWithinRange);
        };
        img.onerror = () => resolve(false);
        img.src = URL.createObjectURL(file);
      });
    };

  return (
    <>
      
      {tipoFormulario == TipoFormulario.DELETE ? (
              <>{/* Modal para eliminar*/}
                <ModalDarDeBaja
                            titulo={`¿Deseás ${!lugar?.fechaBaja ? 'dar de baja' : 'habilitar'} este lugar?`}
                            mensaje={`Lugar: "${lugar?.nombreLugar}"`}
                            mostrar={true}
                            accion={!lugar?.fechaBaja ? 'Dar de baja' : 'Habilitar'}
                            onCancelar={onHide}
                            onConfirmar={() => handleBajaLogica(lugar)}
                          />
              </>
            ) : 
       (
        <Modal show={show} onHide={onHide} centered backdrop="static" className="modal-xl">
          <Modal.Header closeButton>
            <Modal.Title>{tittle}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={formik.handleSubmit} className="form-container">
              {/* Nombre */}
              <Form.Group>
                <Form.Label>Nombre del lugar</Form.Label>
                <Form.Control
                  name="nombreLugar"
                  type="text"
                  value={formik.values.nombreLugar}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  disabled= {tipoFormulario == TipoFormulario.EDIT}
                  isInvalid={tipoFormulario == TipoFormulario.CREATE ? (formik.touched.nombreLugar && !!formik.errors.nombreLugar): false}
                />
                <Form.Control.Feedback type="invalid">
                  {formik.errors.nombreLugar}
                </Form.Control.Feedback>
              </Form.Group>

              {/* Capacidad */}
              <Form.Group>
                <Form.Label>Capacidad</Form.Label>
                <Form.Control
                  type="number"
                  name="capacidad"
                  value={formik.values.capacidad}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  isInvalid={formik.touched.capacidad && !!formik.errors.capacidad}
                />
                <Form.Control.Feedback type="invalid">
                  {formik.errors.capacidad}
                </Form.Control.Feedback>
              </Form.Group> 

              {/* Tipo de lugar */}
              <Form.Group>
                <Form.Label>Tipo de lugar</Form.Label>
                <Form.Select
                  value={formik.values.tipoLugar?.id || ""} 
                  onChange={(e) => {
                    const selected = tiposLugar.find(
                      (t) => t.id === Number(e.target.value)
                    );
                    formik.setFieldValue(
                      "tipoLugar",
                      selected || { id: "", nombreTipoLugar: "" }
                    );
                  }}
                  disabled= {tipoFormulario == TipoFormulario.EDIT}
                  isInvalid={tipoFormulario == TipoFormulario.CREATE ? (formik.touched.tipoLugar && Boolean(formik.errors.tipoLugar)): false}
                >

                  {tipoFormulario == TipoFormulario.CREATE ? (<option value="">-- Selecciona un tipo --</option>) : (
                                      <option value="">{lugar.tipoLugar || "No se encontró tipo"}</option>
                                    )
                  }
                  
                  {tiposLugar.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nombreTipoLugar}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              {/* Precio */}
              <Form.Group className="formulario-lugar-precio">
                <Form.Label>Precio por día</Form.Label>
                <Form.Control
                  type="number"
                  name="precioLugar"
                  value={formik.values.precioLugar}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  isInvalid={formik.touched.precioLugar && !!formik.errors.precioLugar}
                />
                <Form.Control.Feedback type="invalid">
                  {formik.errors.precioLugar}
                </Form.Control.Feedback>
              </Form.Group>
              
              {/* Descripción */}
              <Form.Group controlId="formDescripcion">
                <Form.Label>Descripción</Form.Label>
                <Form.Control
                  name="descripcion"
                  as="textarea"  
                  rows={4}
                  value={formik.values.descripcion}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  isInvalid={formik.touched.descripcion && Boolean(formik.errors.descripcion)}
                />
                <Form.Control.Feedback type="invalid">
                  {formik.errors.descripcion}
                </Form.Control.Feedback>
              </Form.Group>

              {/* Provincia */}
              <Form.Group>
                <Form.Label>Provincia</Form.Label>
                <Form.Select
                  onChange={(e) => {
                    handleProvinciaChange(e)
                    formik.setFieldValue("localidad", null)
                  }}
                  disabled= {tipoFormulario == TipoFormulario.EDIT}
                >
                  {tipoFormulario == TipoFormulario.CREATE ? (<option value="">-- Selecciona una provincia --</option>) : (
                                      <option value="">{provinciaEncontrada?.nombreProvincia || "No se encontró provincia"}</option>
                                    )
                                    }
                  {provinciasSeleccionables.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombreProvincia}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              {/* Localidad */}
              <Form.Group>
                <Form.Label>Localidad</Form.Label>
                <Form.Select
                  value={formik.values.localidad?.id || ""}
                  onChange={(e) => {
                    const selected = localidadesSeleccionadas.find(
                      (l) => l.id === Number(e.target.value)
                    );
                    formik.setFieldValue(
                      "localidad",
                      selected || { id: "", nombreLocalidad: "" }
                    );
                  }}
                  disabled={localidadesSeleccionadas.length === 0 || tipoFormulario == TipoFormulario.EDIT}
                >
                  {tipoFormulario == TipoFormulario.CREATE ? (<option value="">-- Selecciona una localidad --</option>) : (
                                      <option value="">{lugar.localidad}</option>
                                    )
                  }
                  
                  {localidadesSeleccionadas.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.nombreLocalidad}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              
              {/* Dirección */}
              <Form.Group>
                <Form.Label>Dirección</Form.Label>
                <Form.Control
                  name="direccion"
                  value={formik.values.direccion}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  disabled= {tipoFormulario == TipoFormulario.EDIT}
                  isInvalid={formik.touched.direccion && !!formik.errors.direccion}
                />
                <Form.Control.Feedback type="invalid">
                  {formik.errors.direccion}
                </Form.Control.Feedback>
              </Form.Group>

              {/* Checklist Servicios */}
              <Form.Group className="form-group">
                <Form.Label>Servicios soportados</Form.Label>
                <div className="checkbox-list">
                  {serviciosSoportados.map((s) => {
                    const checked = formik.values.serviciosSoportados?.includes(s.id)
                    return (
                      <div key={s.id} className="form-check">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              formik.setFieldValue("serviciosSoportados", [...(formik.values.serviciosSoportados || []), s.id])
                            } else {
                              formik.setFieldValue("serviciosSoportados",formik.values.serviciosSoportados.filter((id) =>id !== s.id))
                            }
                          }}
                          className="form-check-input"
                        />
                        <label className="form-check-label">{s.nombreTipoServicio}</label>
                      </div>
                    )
                  })}
                </div>
              </Form.Group>

              {/* Checklist Eventos */}
              <Form.Group className="form-group">
                <Form.Label>Eventos soportados</Form.Label>
                <div className="checkbox-list">
                  {eventosSoportados.map((ev) => {
                    const checked = formik.values.eventosSoportados?.includes(ev.id)
                    return (
                      <div key={ev.id} className="form-check">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              formik.setFieldValue("eventosSoportados", [...(formik.values.eventosSoportados || []), ev.id])
                            } else {
                              formik.setFieldValue("eventosSoportados",formik.values.eventosSoportados.filter((id) =>id !== ev.id))
                            }
                          }}
                          className="form-check-input"
                        />
                        <label className="form-check-label">{ev.nombreTipoEvento}</label>
                      </div>
                    )
                  })}
                </div>
              </Form.Group>

              {/* Checklist características */}
              <Form.Group className="form-group">
                <Form.Label>Características</Form.Label>
                <div className="checkbox-list">
                  {caracteristicasSoportadas.map((car) => {
                    const checked = formik.values.caracteristicas?.includes(car.id)
                    return (
                      <div key={car.id} className="form-check">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              formik.setFieldValue("caracteristicas", [...(formik.values.caracteristicas || []), car.id])
                            } else {
                              formik.setFieldValue("caracteristicas", formik.values.caracteristicas.filter((id) => id !== car.id)
                              )
                            }
                          }}
                          className="form-check-input"
                        />
                        <label className="form-check-label">{car.nombreCaracteristica}</label>
                      </div>
                    )
                  })}
                </div>
              </Form.Group>


              {/* Dropzone */}
              <div className="upload-section">
                <h3 className="section-title">Agregar imágenes</h3>

                <div
                  {...getRootProps()}
                  className={`dropzone ${formik.touched.imagenes && formik.errors.imagenes ? "error" : ""}`}
                >
                  <input {...getInputProps()} />
                  <div className="dropzone-content">
                    <div className="dropzone-icon">+</div>
                    <p className="dropzone-text">Subí tu imagen</p>
                  </div>
                </div>

                {formik.touched.imagenes && formik.errors.imagenes && (
                  <div className="upload-error">Formato no soportado</div>
                )}

                {preview.length > 0 && (
                  <>
                    <div className="uploaded-images-title">Imágenes subidas</div>
                    <div className="preview-container">
                      {preview.map((file, i) => (
                        <div key={i} className="preview-item">
                          <img src={file.preview || "/placeholder.svg"} alt="preview" className="preview-image" />
                          <button
                            type="button"
                            className="remove-image-btn"
                            onClick={() => {
                              const newPreview = preview.filter((_, index) => index !== i)
                              const newImages = formik.values.imagenes.filter((_, index) => index !== i)
                              setPreview(newPreview)
                              formik.setFieldValue("imagenes", newImages)
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>



            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={onHide}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={!formik.isValid}
              onClick={formik.handleSubmit}
            >
              Guardar
            </Button>
          </Modal.Footer>
        </Modal>
      )}

      <ModalError
          titulo="Error en el registro"
          mensaje={errorMessage}
          mostrar={showErrorModal}
          onCerrar={handleCloseErrorModal}
        />
    </>
  )
}

export default FormularioLugar
