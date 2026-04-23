import { useState, useEffect, useContext } from "react"
import Contexto from "../Contexto"
import PostCard from "./PostCard"
import AddPost from "./AddPost"

function Feed() {
  let { token } = useContext(Contexto)

  let [posts, setPosts] = useState([])
  let [draggedIndex, setDraggedIndex] = useState(null)   // índice del post que se está arrastrando
  let [dragOverIndex, setDragOverIndex] = useState(null) // índice del post sobre el que se arrastra
  let [notificacion, setNotificacion] = useState("")     // mensaje de éxito o error al borrar

  // carga los posts al montar el componente
  useEffect(() => {
    if (!token) return

    fetch(import.meta.env.VITE_API_URL + "/posts", {
      headers: { Authorization: "Bearer " + token }
    })
      .then(res => {
        if (!res.ok) throw new Error("Error al cargar posts")
        return res.json()
      })
      .then(posts => setPosts(posts))
      .catch(err => console.error(err))
  }, []) // array vacío — se ejecuta solo una vez al montar el componente

  function borrarPost(id) {
    if (!window.confirm("¿Seguro que quieres eliminar este post?")) return

    fetch(import.meta.env.VITE_API_URL + "/posts/" + id, {
      method: "DELETE",
      headers: { "Authorization": "Bearer " + token }
    })
    .then(res => {
      if (res.status === 204) {
        setPosts(prev => prev.filter(p => p._id !== id)) // elimina el post del array sin recargar
        setNotificacion("Post eliminado correctamente")
        setTimeout(() => setNotificacion(""), 3000) // oculta la notificación a los 3s
      }
    })
    .catch(() => setNotificacion("No se pudo eliminar el post"))
  }

  function handleDragStart(index) {
    setDraggedIndex(index) // guarda qué post se empieza a arrastrar
  }

  function handleDragOver(evento, index) {
    evento.preventDefault() // necesario para que el navegador permita soltar el elemento
    setDragOverIndex(index) // guarda sobre qué post está pasando para el feedback visual
  }

  function handleDrop(index) {
    setDragOverIndex(null)
    if (draggedIndex === null || draggedIndex === index) return // si se suelta en el mismo sitio no hace nada

    let reordenados = [...posts]                              // copia el array para no mutar el estado
    let [movido] = reordenados.splice(draggedIndex, 1)       // extrae el post arrastrado
    reordenados.splice(index, 0, movido)                     // lo inserta en la nueva posición

    let conOrden = reordenados.map((p, i) => ({ ...p, order: i })) // actualiza el campo order de cada post
    setPosts(conOrden)   // actualiza el estado visual
    setDraggedIndex(null)

    // persiste el nuevo orden en la base de datos
    fetch(import.meta.env.VITE_API_URL + "/posts/reorder", {
      method: "PATCH",
      headers: {
        "Authorization": "Bearer " + token,
        "Content-type": "application/json"
      },
      body: JSON.stringify({ posts: conOrden.map(p => ({ _id: p._id, order: p.order })) })
    })
  }

  return (
    <>
      {/* mensaje que aparece brevemente al eliminar un post */}
      {notificacion && <div className="notificacion">{notificacion}</div>}

      <div className="feed_layout">
        <div className="feed_grid_wrapper">
          {posts.length === 0 ? (
            <div className="feed_vacio">
              <img src="/logo.svg" alt="logo" className="feed_vacio_logo" />
              <p>Tu feed está vacío</p>
              <p>Añade tu primera publicación para empezar a planificar tu Instagram</p>
            </div>
          ) : (
            <div className="feed_grid">
              {posts.map((post, index) => (
                <PostCard
                  key={post._id}
                  post={post}
                  index={index}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onDelete={borrarPost}
                  isDragOver={dragOverIndex === index} // prop para el feedback visual del drag
                />
              ))}
            </div>
          )}
        </div>
        <div className="feed_sidebar">
          <AddPost setPosts={setPosts} posts={posts} />
        </div>
      </div>
    </>
  );
}

export default Feed