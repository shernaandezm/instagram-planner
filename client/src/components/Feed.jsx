import { useState, useEffect, useContext } from "react"
import Contexto from "../context/Contexto"
import PostCard from "./PostCard"
import AddPost from "./AddPost"

function Feed() {
  let { token } = useContext(Contexto)

  let [posts, setPosts] = useState([])
  let [draggedIndex, setDraggedIndex] = useState(null)

  useEffect(() => {
    fetch(import.meta.env.VITE_API_URL + "/posts", {
      headers: { "Authorization": "Bearer " + token }
    })
    .then(respuesta => respuesta.json())
    .then(posts => setPosts(posts))
  }, [])

  function borrarPost(id) {
    fetch(import.meta.env.VITE_API_URL + "/posts/" + id, {
      method: "DELETE",
      headers: { "Authorization": "Bearer " + token }
    })
    .then(respuesta => {
      if (respuesta.status === 204) {
        setPosts(posts.filter(p => p._id !== id))
      }
    })
  }

  function handleDragStart(index) {
    setDraggedIndex(index)
  }

  function handleDragOver(evento) {
    evento.preventDefault()
  }

  function handleDrop(index) {
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
    <div className="feed-container">
      <AddPost setPosts={setPosts} posts={posts} />
      <div className="feed-grid">
        {posts.map((post, index) => (
          <PostCard
            key={post._id}
            post={post}
            index={index}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDelete={borrarPost}
          />
        ))}
      </div>
    </div>
  )
}

export default Feed