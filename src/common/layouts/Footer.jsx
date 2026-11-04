export default function Footer() {
  return (
    <>
      <footer className="footer-custom">
        <div className="container-fluid">
          <div className="row align-items-center">
            <div className="col-md-6">
              <p className="mb-0 text-start">© 2025 Wevently</p>
            </div>
            <div className="col-md-6 text-end">
              <a href="#" className="me-3 text-light text-decoration-none">
                Términos
              </a>
              <a href="#" className="text-light text-decoration-none">
                Política de privacidad
              </a>
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        .footer-custom {
          background-color: #212529; /* similar a bg-dark */
          color: #ffffff;
          padding-top: 2rem;
          padding-bottom: 2rem;
          margin-top:0;
        }

        .text-light {
          color: #266cb1ff;
        }

        .text-decoration-none {
          text-decoration: none;
        }

        .text-decoration-none:hover {
          text-decoration: underline;
        }

        .text-start {
          text-align: left;
        }

        .text-end {
          text-align: right;
        }

        .me-3 {
          margin-right: 1rem;
        }

        .mb-0 {
          margin-bottom: 0;
        }

        .container-fluid {
          width: 100%;
          padding-left: 1rem;
          padding-right: 1rem;
        }

        .row {
          display: flex;
          flex-wrap: wrap;
        }

        .col-md-6 {
          flex: 0 0 50%;
          max-width: 50%;
        }

        .align-items-center {
          align-items: center;
        }
      `}</style>
    </>
  );
}
