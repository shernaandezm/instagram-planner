import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import Contexto from "./Contexto"
import './index.css'

function Main() {
  // estado global del usuario - se inicializa con lo que haya en localStorage. Si el usuario cierra y vuelve a abrir el navegador sigue logueado, si no, pasa a null.
  const [token, setToken] = useState(localStorage.getItem('token') || null)
  const [username, setUsername] = useState(localStorage.getItem('username') || null)

  return (// hace que token, setToken, username y setUsername estén disponibles en todos los componentes de la app sin pasar props
    <Contexto.Provider value={{ token, setToken, username, setUsername }}>
      <App />
    </Contexto.Provider>
  ) 
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Main />
  </StrictMode>
)