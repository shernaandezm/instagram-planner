import { useState, useEffect, useContext } from "react"
import Contexto from "../Contexto"
import PostCard from "./PostCard"
import AddPost from "./AddPost"

function Feed() {
  let { token } = useContext(Contexto)

  let [posts, setPosts] = useState([])
  let [draggedIndex, setDraggedIndex] = useState(null)
  let [dragOverIndex, setDragOverIndex] = useState(null)
  let [notificacion, setNotificacion] = useState("")
  let [cargando, setCargando] = useState(true) // muestra mensaje mientras el servidor responde

  useEffect(() => {
    if (!token) return

    fetch(import.meta.env.VITE_API_URL + "/posts", {
      headers: { Authorization: "Bearer " + token }
    })
      .then(res => {
        if (!res.ok) throw new Error("Error al cargar posts")
        return res.json()
      })
      .then(posts => {
        setPosts(posts)
        setCargando(false)
      })
      .catch(err => {
        console.error(err)
        setCargando(false)
      })
  }, [])

  function borrarPost(id) {
    if (!window.confirm("¿Seguro que quieres eliminar este post?")) return

    fetch(import.meta.env.VITE_API_URL + "/posts/" + id, {
      method: "DELETE",
      headers: { "Authorization": "Bearer " + token }
    })
    .then(res => {
      if (res.status === 204) {
        setPosts(prev => prev.filter(p => p._id !== id))
        setNotificacion("Post eliminado correctamente")
        setTimeout(() => setNotificacion(""), 3000)
      }
    })
    .catch(() => setNotificacion("No se pudo eliminar el post"))
  }

  function handleDragStart(index) {
    setDraggedIndex(index)
  }

  function handleDragOver(evento, index) {
    evento.preventDefault()
    setDragOverIndex(index)
  }

  function handleDrop(index) {
    setDragOverIndex(null)
    if (draggedIndex === null || draggedIndex === index) return

    let reordenados = [...posts]
    let [movido] = reordenados.splice(draggedIndex, 1)
    reordenados.splice(index, 0, movido)

    let conOrden = reordenados.map((p, i) => ({ ...p, order: i }))
    setPosts(conOrden)
    setDraggedIndex(null)

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
      {/* notificación que aparece al eliminar un post */}
      {notificacion && <div className="notificacion">{notificacion}</div>}

      <div className="feed_layout">
        <div className="feed_grid_wrapper">
          {cargando ? (
            // mensaje mientras el servidor de Render arranca
            <div className="feed_cargando">
              <img src="/logo.svg" alt="logo" className="feed_vacio_logo" />
              <p>Conectando con el servidor...</p>
            </div>
          ) : posts.length === 0 ? (
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
                  isDragOver={dragOverIndex === index}
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