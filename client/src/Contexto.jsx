import { createContext } from "react"

// Crea el contexto global de la app y permite compartir datos (tokens, username) entre todos los componentes sin necesidad de pasar props manualmente.
const Contexto = createContext()

export default Contexto