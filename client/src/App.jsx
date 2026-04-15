import { useContext } from 'react'
import Contexto from './context/Contexto'
import Login from './components/Login'
import Feed from './components/Feed'

function App() {
  const { token, setToken, setUsername, username } = useContext(Contexto)

  function cerrarSesion() {
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    setToken(null)
    setUsername(null)
  }

  return !token ? <Login /> : (
    <div className="app">
      <header className="app-header">
        <h1>Instagram Planner</h1>
        <div className="header-right">
          <span>@{username}</span>
          <button onClick={cerrarSesion}>Cerrar sesión</button>
        </div>
      </header>
      <Feed />
    </div>
  )
}

export default App