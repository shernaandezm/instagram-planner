import { useEffect, useState } from "react";

function Splash({ onFinish }) {
  let [saliendo, setSaliendo] = useState(false); // controla si la animación de salida está activa

  useEffect(() => {
    setTimeout(() => setSaliendo(true), 1800);  // después de 1.8s empieza la animación de salida
    setTimeout(() => onFinish(), 2400);          // después de 2.4s muestra el login o el feed
  }, []);

  return (
    <div className={`splash_container ${saliendo ? "splash_saliendo" : ""}`}>
      <img
        src="/logo.svg"
        alt="logo"
        className="splash_logo"
      />
      <h1 className="splash_titulo">Instagram Planner</h1>
    </div>
  );
}

export default Splash;