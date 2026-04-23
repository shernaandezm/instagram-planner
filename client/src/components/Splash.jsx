import { useEffect, useState } from "react";

function Splash({ onFinish }) {
  let [saliendo, setSaliendo] = useState(false);

  useEffect(() => {
    // después de 1.8s empieza la animación de salida
    let timer1 = setTimeout(() => setSaliendo(true), 1800);
    // después de 2.4s llama a onFinish para mostrar el login
    let timer2 = setTimeout(() => onFinish(), 2400);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
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