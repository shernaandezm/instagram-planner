import { useState, useContext } from "react";
import Contexto from "../Contexto";
import PostModal from "./PostModal";

function PostCard({ post, index, onDragStart, onDragOver, onDrop, onDelete, isDragOver }) {
  let { token } = useContext(Contexto);

  let [modalAbierto, setModalAbierto] = useState(false);
  let [editando, setEditando] = useState(false);
  let [caption, setCaption] = useState(post.caption);
  let [indice, setIndice] = useState(0);

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
        setEditando(false);
      }
    });
  }

  function archivoActual() {
    return post.archivos?.[indice] || "";
  }

  function esVideo(src) {
    return src.includes("/video/") || src.includes(".mp4") || src.includes(".mov") || src.includes(".avi");
  }

  function abrirModal(e) {
    e.stopPropagation() // evita que el click se propague al div padre
    setModalAbierto(true)
  }

  function cerrarModal(e) {
    e.stopPropagation() // evita que el click se propague al div padre
    setModalAbierto(false)
  }

  return (
    <div
      className={`post_card ${isDragOver ? "drag_over" : ""}`}
      draggable
      onDragStart={() => onDragStart(index)}
      onDragOver={e => onDragOver(e, index)}
      onDrop={() => onDrop(index)}
    >
      <div className="post_image_wrapper">

        {esVideo(post.archivos?.[indice] || "")
          ? <video src={archivoActual()} controls />
          : <img
              src={archivoActual()}
              alt={post.caption}
              onClick={abrirModal}
              loading="lazy"
              style={{ cursor: "pointer" }}
            />
        }

        {post.archivos?.length > 1 && (
          <>
            <button
              className="carrusel_btn prev"
              onClick={() => setIndice(i => Math.max(0, i - 1))}
            >‹</button>
            <button
              className="carrusel_btn next"
              onClick={() => setIndice(i => Math.min(post.archivos.length - 1, i + 1))}
            >›</button>
            <div className="carrusel_dots">
              {post.archivos.map((_, i) => (
                <span
                  key={i}
                  className={i === indice ? "dot active" : "dot"}
                  onClick={() => setIndice(i)}
                />
              ))}
            </div>
          </>
        )}

        <button className="delete_btn" onClick={() => onDelete(post._id)}>✕</button>
      </div>

      <div className="post_caption">
        {editando ? (
          <div className="caption_edit">
            <textarea
              value={caption}
              onChange={evento => setCaption(evento.target.value)}
            />
            <div className="caption_actions">
              <button onClick={guardarCaption}>Guardar</button>
              <button onClick={() => setEditando(false)}>Cancelar</button>
            </div>
          </div>
        ) : (
          <div className="caption_view" onClick={() => setEditando(true)}>
            <p>{caption || "Añadir pie de foto..."}</p>
          </div>
        )}
      </div>

      {/* el modal recibe cerrarModal para que el stopPropagation funcione */}
      {modalAbierto && <PostModal post={post} onClose={cerrarModal} />}
    </div>
  );
}

export default PostCard;