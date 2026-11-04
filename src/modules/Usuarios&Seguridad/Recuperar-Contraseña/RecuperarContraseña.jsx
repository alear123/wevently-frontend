import { useState } from "react";
import Navbar from "../../../common/layouts/Navbar.jsx";
import "./src/assets/RecuperarContraseña.css";
import PasoEmail from "./src/components/PasoEmail.jsx";
import PasoCodigo from "./src/components/PasoCodigo.jsx";
import PasoNuevaPass from "./src/components/PasoNuevaPass.jsx";
import PasoExito from "./src/components/PasoExito.jsx";

export default function RecuperarContraseña() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [codigo, setCodigo] = useState("");
  const [intentos, setIntentos] = useState(0);

  return (
    <>
      <Navbar />
      {step === 1 && (
        <PasoEmail
          email={email}
          setEmail={setEmail}
          onSuccess={() => setStep(2)}
        />
      )}
      {step === 2 && (
        <PasoCodigo
          email={email}
          codigo={codigo}
          setCodigo={setCodigo}
          intentos={intentos}
          setIntentos={setIntentos}
          onSuccess={() => setStep(3)}
          onRestart={() => setStep(1)}
        />
      )}
      {step === 3 && (
        <PasoNuevaPass
          email={email}
          codigo={codigo}
          onSuccess={() => setStep(4)}
        />
      )}
      {step === 4 && <PasoExito />}
    </>
  );
}
