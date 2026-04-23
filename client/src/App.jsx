import { useContext, useState } from 'react';
import Contexto from './Contexto';
import Login from './components/Login';
import Feed from './components/Feed';
import Splash from './components/Splash';

function App() {
  // Accede al token y al nombre de usuario del contexto global
  const { token, setToken, setUsername, username } = useContext(Contexto);
  let [splashVisible, setSplashVisible] = useState(!localStorage.getItem('token')); // muestra el splash solo si no hay sesión activa

  // Elimina el token y el usuario de localStorage y resetea el estado global para volver al login
  function cerrarSesion() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setToken(null);
    setUsername(null);
  }

  // Muestra el splash antes del login
  if (splashVisible) {
    return <Splash onFinish={() => setSplashVisible(false)} />;
  }

  // Si no hay token muestra el login, si hay token muestra el feed
  return !token ? <Login /> : (
    <div className="app">
      <header className="app_header">
        <img src="/logo.svg" alt="logo" className="header_logo" />
        <h1 className="header_titulo">Instagram Planner</h1>
        <div className="header_usuario">
          <span>@{username}</span>
          <button onClick={cerrarSesion}>Cerrar sesión</button>
        </div>
      </header>
      <main className="app_main">
        <Feed />
      </main>
    </div>
  );
}

export default App;