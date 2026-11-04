import React from 'react'
import { TipoFormulario } from './TipoFormulario.js'
import * as Yup from 'yup'
import { Modal, Form, Button } from 'react-bootstrap'
import { useFormik } from 'formik'
import { useDropzone } from 'react-dropzone'
import serviciosServices from '../../../../Servicios/src/api/serviciosServices.js'
import "./formulario-servicio.css"
import { useEffect, useState } from 'react'
import ModalDarDeBaja from "../../../../../common/layouts/ModalDarDeBaja.jsx"
import ModalError from '../../../../../common/layouts/ModalError.jsx'


const FormularioServicio = ({ show, onHide, tittle, tipoFormulario, service, refreshData, onNotificar }) => {
  const [preview, setPreview] = React.useState([]);
  // Función para guardar las localidades que el usuario puede elegir dependiendo de la provincia
  const [localidadesSeleccionadas, setLocalidadesSeleccionadas] = React.useState([]);

  const [provincias, setProvincias] = useState([]); // Obtener las provincias 
  const [tiposServicio, setTiposServicio] = useState([]); // Obtener los tipos de servicio
  const [provinciaEncontrada, setProvinciaEncontrada] = useState(null); // Provincia encontrada al editar
  const [errorMessage, setErrorMessage] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);

 const handleCloseErrorModal = () => {
    setShowErrorModal(false);
    setErrorMessage('');

  };


  //const [tipoServicioEncontrado, setTipoServicioEncontrado] = useState(""); // Tipo de servicio encontrado al editar
  
  useEffect(() => { 
    const fetchProvincias = async () => {
      try {
        const provinciasEntidad = await serviciosServices().obtenerProvincias();
        // Normalizar objeto que el componente puede usar fácil
        const provincias = provinciasEntidad.map(l => ({
          id: l.id,
          nombreProvincia: l.nombre,
          localidades: l.dtosLocalidad.map(loc => ({
            id: loc.id,
            nombreLocalidad: loc.nombre
        }))
      }));
      setProvincias(provincias)
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
      setTiposServicio(tiposServicio)
    
      } catch (error) {
        console.error("Error al obtener tipos de servicio:", error);
      }
    };
    fetchProvincias();
    fetchTiposServicio();
    
  }, [service]);

  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    tipoServicio: "",
    localidades: [],
    provinciaNombre: ""
  });

  useEffect(() => {
  if (
    tipoFormulario === TipoFormulario.EDIT ) {
    console.log("Ejecutando useEffect de edición...");
    
    const area = service.localidades || [];
    console.log("Área de cobertura del servicio:", area);
    let provinciaId = "";

    // Buscar el id del tipo de servicio
    const tipoServicio = tiposServicio.find(t => t.nombreTipoServicio === service.tipoServicio);
  

    console.log("Tipo de servicio:", tipoServicio);

    if (area.length > 0) {
      console.log("Buscando provincia para la localidad:", area[0]);
      console.log("Lista de provincias:", provincias);
      const localidadId = area[0].id;
      const provincia = provincias.find(p =>
        p.localidades.some(l => l.id === localidadId)
      );

      if (provincia) {
        provinciaId = provincia.id;
        setProvinciaEncontrada(provincia);
        setLocalidadesSeleccionadas(provincia.localidades);
      }
    }

    // Actualizar campos del formulario
    setFormData({
      nombreServicio: service.nombreServicio || "",
      descripcion: service.descripcion || "",
      tipoServicio: service.tipoServicio || "",
      localidades: area.map(loc => loc.id),
      provinciaNombre: provinciaEncontrada?.nombreProvincia || ""
    });

    // Marcar localidades seleccionadas
    formik.setFieldValue("areaCobertura", area.map(loc => loc.id));
    formik.setFieldValue("tipoServicio",tipoServicio || { id: '', nombreTipoServicio: '' });

  }
}, [tipoFormulario, service, provincias, tiposServicio]);

  // Manejar el cambio de provincia
  const handleProvinciaChange = (e) => {
    const provinciaId = parseInt(e.target.value); // Obtener el ID de la provincia seleccionada
    const provincia = provincias.find(p => p.id === provinciaId); // Buscar la provincia en el array
    if (provincia) {  // Si se encuentra la provincia, actualizar las localidades seleccionadas
      setLocalidadesSeleccionadas(provincia.localidades); }
    else {
      setLocalidadesSeleccionadas([]); // Si no se encuentra, limpiar las localidades seleccionadas
    }
  };

  // Esquema de validación
  const validationSchema = () => Yup.object().shape({
    nombreServicio: Yup.string().required("El nombre es obligatorio").min(3, "Mínimo 3 caracteres").max(50, "Máximo 50 caracteres"),

    descripcion: Yup.string().required("La descripción es obligatoria").min(15, "Mínimo 15 caracteres").max(150, "Máximo 150 caracteres"),

    tipoServicio: Yup.object({
      id: Yup.number().required("Selecciona un tipo de servicio"),
      nombreTipoServicio: Yup.string().required(),
    }).required("El tipo de servicio es obligatorio"),

    imagenes: Yup.array().min(1, "Debes subir al menos una imagen").max(5, "No puede subir más de 5 imágenes"),
    
    areaCobertura: Yup.array().min(1, "Selecciona al menos una localidad de cobertura").required(""),
  });

  // Función para guardar o actualizar
  const handleSaveUpdate = async (values) => {
  try {
    const isNewService = !values.id;

    // Convertir imágenes a base64
    const base64Images = await Promise.all(
      (values.imagenes || []).map((file) =>
        file instanceof File ? toBase64(file) : file
      )
    );

    // Construir el DTO
    const servicioDto = {
      id: values.id || null,
      nombre: values.nombreServicio,
      descripcion: values.descripcion,
      tipoServicioId: values.tipoServicio.id,     
      areaCoberturaIds: values.areaCobertura,     // [{ id, nombreLocalidad }]
      imagenesBase64: base64Images, // Array de imágenes en base64
    };

    let data;
    if (isNewService) {
      data = await serviciosServices().crearServicio(servicioDto);
      console.log("Servicio creado:", data);
      refreshData(prevState => !prevState)
      onNotificar("Servicio publicado exitosamente");
    } else {
      data = await serviciosServices().modificarServicio(servicioDto);
      console.log("Servicio actualizado:", data);
      refreshData(prevState => !prevState)
      onNotificar("Servicio actualizado exitosamente");
    }

    onHide();
  } catch (error) {
    console.error("Error al guardar/actualizar servicio:", error);

      const mensajeError =
        error?.response?.data?.message ||
        error.message ||
        "Ocurrió un error inesperado al guardar el servicio.";

      setErrorMessage(mensajeError);
      
      setTimeout(() => setShowErrorModal(true), 200);
  }
};

  // Función para dar de baja o habilitar el servicio
  const handleBajaLogica = async (servicio) => {
    if (!servicio) return;
    
    const id = servicio.id;
    const isActivo = !servicio.fechaBaja;
    try {
      const data = await serviciosServices().bajaLogicaServicio(id); // Llamada a la API
      console.log("Baja lógica exitosa:", data);
      onHide(); // cerrar modal si se estaba usando
      refreshData(prevState => !prevState)
      isActivo ? onNotificar("Servicio dado de baja exitosamente") : (onNotificar("Servicio dado de alta exitosamente"))
      
    } catch (error) {
      console.error("Error al dar de baja/habilitar servicio:", error);

      const mensajeError =
        error?.response?.data?.message ||
        error.message ||
        "Ocurrió un error inesperado al cambiar el estado del servicio.";

      setErrorMessage(mensajeError);

      setTimeout(() => setShowErrorModal(true), 200);
    }
  };

  // Formik
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      id: service?.id || null,
      nombreServicio: service?.nombreServicio || "",
      descripcion: service?.descripcion || "",
      tipoServicio: service?.tipoServicio || { id: '', nombreTipoServicio: '' },
      imagenes: service?.imagenes || [],
      areaCobertura: service?.areaCobertura || [{ id: '', nombreLocalidad: '' }]
    },
    validationSchema: validationSchema(),
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: (values) => {
      handleSaveUpdate(values);
      console.log("Formulario enviado con valores:", values);
    }
  });


  // Convertir archivo a base64
  const toBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

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
                      titulo={`¿Deseás ${!service?.fechaBaja ? 'dar de baja' : 'habilitar'} este servicio?`}
                      mensaje={`Servicio: "${service?.nombreServicio}"`}
                      mostrar={true}
                      accion={!service?.fechaBaja ? 'Dar de baja' : 'Habilitar'}
                      onCancelar={onHide}
                      onConfirmar={() => handleBajaLogica(service)}
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
              <Form.Group controlId="formNombreServicio">
                <Form.Label>Nombre del servicio</Form.Label>
                <Form.Control
                  name="nombreServicio"
                  type="text"
                  value={formik.values.nombreServicio}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  disabled= {tipoFormulario == TipoFormulario.EDIT}
                  isInvalid={tipoFormulario == TipoFormulario.CREATE ? (formik.touched.nombreServicio && Boolean(formik.errors.nombreServicio)) : false}
                />
                <Form.Control.Feedback type="invalid">
                  {formik.errors.nombreServicio}
                </Form.Control.Feedback>
              </Form.Group>

              {/* Tipo de servicio */}
              <Form.Group controlId="formTipoServicio">
              <Form.Label>Tipo de servicio</Form.Label>
              <Form.Select
                name="tipoServicio"
                value={formik.values.tipoServicio.id || ""}
                onChange={(e) => {
                  const selected = tiposServicio.find(
                    (t) => t.id === Number(e.target.value)
                  );
                  formik.setFieldValue(
                    "tipoServicio",
                    selected || { id: "", nombreTipoServicio: "" }
                  );
                }}
                onBlur={formik.handleBlur}
                disabled={tipoFormulario == TipoFormulario.EDIT}
                isInvalid={
                  tipoFormulario == TipoFormulario.CREATE
                    ? formik.touched.tipoServicio &&
                      Boolean(formik.errors.tipoServicio)
                    : false
                }
              >
                {tipoFormulario == TipoFormulario.CREATE ? (
                  <option value="">-- Selecciona un tipo --</option>
                ) : (
                  <option value="">
                    {service?.tipoServicio?.nombreTipoServicio ??
                      service?.tipoServicio ??
                      "No se encontró tipo"}
                  </option>
                )}

                {tiposServicio.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nombreTipoServicio}
                  </option>
                ))}
              </Form.Select>

              {formik.touched.tipoServicio && formik.errors.tipoServicio && (
                <div className="error-text">{formik.errors.tipoServicio}</div>
              )}
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
                  isInvalid={formik.touched.descripcion && Boolean(formik.errors.descripcion)
                  }
                />
                <Form.Control.Feedback type="invalid">
                  {formik.errors.descripcion}
                </Form.Control.Feedback>
              </Form.Group>

              {/* Seleccionar una provincia para obtener los departamentos de la misma */}
              <Form.Group controlId="formProvincia">
                <Form.Label>Provincia</Form.Label>
                <Form.Select
                  name="provincia"
                  onChange={(e) => {
                    handleProvinciaChange(e); // Actualizar las localidades al cambiar la provincia
                    formik.setFieldValue("areaCobertura", []); // Limpiar las localidades seleccionadas en el formulario
                  }}
                  disabled = {tipoFormulario == TipoFormulario.EDIT}
                >
                  {tipoFormulario == TipoFormulario.CREATE ? (<option value="">-- Selecciona una provincia --</option>) : (
                    <option value="">{provinciaEncontrada?.nombreProvincia || "No se encontró provincia"}</option>
                  )
                  }
                  {provincias.map((provincia) => (
                    <option key={provincia.id} value={provincia.id}>{provincia.nombreProvincia}</option>
                  ))}
                </Form.Select>
              </Form.Group>

              {/* Localidades de la provincia seleccionada */}
              <Form.Group controlId="formLocalidades">
                <Form.Label>Localidades</Form.Label>
                <div className="checkbox-list">
                  {localidadesSeleccionadas.map((localidad) => {
                    const isChecked = formik.values.areaCobertura?.includes(localidad.id); // ahora solo IDs

                    return (
                      <div key={localidad.id} className="form-check">
                        <input
                          type="checkbox"
                          id={`loc-${localidad.id}`}
                          className="form-check-input"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              formik.setFieldValue("areaCobertura", [...(formik.values.areaCobertura || []),localidad.id,]);
                            } else {
                              formik.setFieldValue("areaCobertura",formik.values.areaCobertura.filter((id) => id !== localidad.id)
                              );
                            }
                          }}
                          onBlur={formik.handleBlur}
                        />
                        <label htmlFor={`loc-${localidad.id}`} className="form-check-label">
                          {localidad.nombreLocalidad}
                        </label>
                      </div>
                    );
                  })}
                </div>
                {formik.touched.areaCobertura && formik.errors.areaCobertura && (
                  <div className="error-text">{formik.errors.areaCobertura}</div>
                )}
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
            <Button variant="secondary" onClick={onHide}>Cancelar</Button>
            <Button variant="primary" type="submit" disabled={!formik.isValid} onClick={formik.handleSubmit}>Guardar</Button>
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

export default FormularioServicio
