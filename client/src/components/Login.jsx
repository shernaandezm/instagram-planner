import { useState, useContext } from "react"
import Contexto from "../context/Contexto"

function Login() {
  let { setToken, setUsername } = useContext(Contexto)

  let [usuario, setUsuario] = useState("")
  let [password, setPassword] = useState("")
  let [esRegistro, setEsRegistro] = useState(false)
  let [error, setError] = useState("")

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Instagram Planner</h1>
        <h2>{esRegistro ? "Crear cuenta" : "Iniciar sesión"}</h2>

        <form onSubmit={evento => {
          evento.preventDefault()
          setError("")

          let url = esRegistro ? "/registro" : "/login"

          fetch(import.meta.env.VITE_API_URL + url, {
            method: "POST",
            body: JSON.stringify({ usuario, password }),
            headers: { "Content-type": "application/json" }
          })
          .then(respuesta => {
            if (respuesta.status === 200) return respuesta.json()
            if (respuesta.status === 201) {
              setEsRegistro(false)
              setError("Usuario creado, ahora inicia sesión")
              throw null
            }
            throw respuesta.status
          })
          .then(({ token, usuario: nombreUsuario }) => {
            localStorage.setItem("token", token)
            localStorage.setItem("username", nombreUsuario)
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
          <button type="submit">
            {esRegistro ? "Registrarse" : "Entrar"}
          </button>
        </form>

        <p className="toggle-auth" onClick={() => {
          setEsRegistro(!esRegistro)
          setError("")
        }}>
          {esRegistro ? "¿Ya tienes cuenta? Inicia sesión" : "¿No tienes cuenta? Regístrate"}
        </p>
      </div>
    </div>
  )
}

export default Login