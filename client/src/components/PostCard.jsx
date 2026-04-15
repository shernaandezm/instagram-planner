import { useState, useContext } from "react"
import Contexto from "../context/Contexto"

function PostCard({ post, index, onDragStart, onDragOver, onDrop, onDelete }) {
  let { token } = useContext(Contexto)

  let [editando, setEditando] = useState(false)
  let [caption, setCaption] = useState(post.caption)

  function guardarCaption() {
    fetch(import.meta.env.VITE_API_URL + "/posts/" + post._id, {
      method: "PATCH",
      headers: {
        "Authorization": "Bearer " + token,
        "Content-type": "application/json"
      },
      body: JSON.stringify({ caption })
    })
    .then(respuesta => {
      if (respuesta.status === 204) {
        setEditando(false)
      }
    })
  }

  return (
    <div
      className="post-card"
      draggable
      onDragStart={() => onDragStart(index)}
      onDragOver={onDragOver}
      onDrop={() => onDrop(index)}
    >
      <div className="post-image-wrapper">
        <img
          src={import.meta.env.VITE_API_URL + post.imageUrl}
          alt={post.caption}
        />
        <button className="delete-btn" onClick={() => onDelete(post._id)}>
          ✕
        </button>
      </div>

      <div className="post-caption">
        {editando ? (
          <div className="caption-edit">
            <textarea
              value={caption}
              onChange={evento => setCaption(evento.target.value)}
            />
            <div className="caption-actions">
              <button onClick={guardarCaption}>Guardar</button>
              <button onClick={() => setEditando(false)}>Cancelar</button>
            </div>
          </div>
        ) : (
          <div className="caption-view" onClick={() => setEditando(true)}>
            <p>{caption || "Añadir pie de foto..."}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default PostCard