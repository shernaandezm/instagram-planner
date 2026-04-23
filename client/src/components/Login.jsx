import { useState, useContext } from "react"
import Contexto from "../Contexto"

function Login() {
  // Accede a las funciones del contexto global para guardar el token y el usuario
  let { setToken, setUsername } = useContext(Contexto)

  // Estados del formulario
  let [usuario, setUsuario] = useState("")
  let [password, setPassword] = useState("")
  let [error, setError] = useState("")

  return (
    <div className="login_container">
      <div className="login_box">
        <img src="/logo.svg" alt="logo" className="login_logo" />
        <h1>Instagram Planner</h1>
        <h2>Iniciar sesión</h2>

        <form onSubmit={evento => {
          evento.preventDefault()
          setError("")

          fetch(import.meta.env.VITE_API_URL + "/login", { // lee la variable de entorno del .env
            method: "POST",
            body: JSON.stringify({ usuario, password }),
            headers: { "Content-type": "application/json" }
          })
          .then(respuesta => {
            if (respuesta.status === 200) return respuesta.json()
            throw respuesta.status // si no es 200 lo captura el .catch
          })
          .then(({ token, usuario: nombreUsuario }) => {
            // guarda el token y el usuario en localStorage para persistir la sesión
            localStorage.setItem("token", token)
            localStorage.setItem("username", nombreUsuario)
            // actualiza el contexto global — la app pasa al feed
            setToken(token)
            setUsername(nombreUsuario)
          })
          .catch(e => {
            if (e) setError("Usuario o contraseña incorrectos")
          })
        }}>
          <input
            type="text"
            value={usuario}
            onChange={evento => setUsuario(evento.target.value)}
            placeholder="Usuario"
          />
          <input
            type="password"
            value={password}
            onChange={evento => setPassword(evento.target.value)}
            placeholder="Contraseña"
          />
          {error && <p className="error">{error}</p>}
          <button type="submit">Entrar</button>
        </form>
      </div>
    </div>
  )
}

export default Login