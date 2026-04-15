import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import Contexto from './context/Contexto.jsx'
import './index.css'

function Main() {
  const [token, setToken] = useState(localStorage.getItem('token') || null)
  const [username, setUsername] = useState(localStorage.getItem('username') || null)

  return (
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