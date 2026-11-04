import { useState } from 'react'
//import './App.css'

function MsjExito() {
  const [count, setCount] = useState(0)

  return (

    <>
        <div className="modal fade" id="successModal" tabIndex={-1}>
    <div className="modal-dialog">
      <div className="modal-content text-center">
        <div className="modal-body py-4">
          <div className="mb-3">
            <i
              className="bi bi-check-circle-fill text-success"
              style={{ fontSize: "4rem" }}
            />
          </div>
          <h4 className="modal-title mb-2">¡Grupo añadido!</h4>
          <p className="text-muted" id="successMessage">
            El grupo se ha agregado con éxito
          </p>
        </div>
        <div className="modal-footer justify-content-center">
          <button
            type="button"
            className="btn btn-aceptar"
            data-bs-dismiss="modal"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  </div>
</>

  )
}

export default MsjExito
