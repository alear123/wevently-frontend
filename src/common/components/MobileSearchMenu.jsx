export default function MobileSearchMenu() {
  return (
    <div className="d-md-none bg-light p-3">
      <div className="row">
        <div className="col-6">
          <button className="btn btn-outline-primary w-100">
            <i className="fas fa-map-marker-alt me-2"></i>Buscar lugares
          </button>
        </div>
        <div className="col-6">
          <button className="btn btn-outline-primary w-100">
            <i className="fas fa-camera me-2"></i>Buscar servicios
          </button>
        </div>
      </div>
    </div>
  );
}
