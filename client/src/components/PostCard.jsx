import { useState, useContext } from "react";
import Contexto from "../Contexto";
import PostModal from "./PostModal";

function PostCard({ post, index, onDragStart, onDragOver, onDrop, onDelete, isDragOver }) {
  let { token } = useContext(Contexto);

  let [modalAbierto, setModalAbierto] = useState(false); // controla si el modal está abierto
  let [editando, setEditando] = useState(false);          // controla si el caption está en modo edición
  let [caption, setCaption] = useState(post.caption);     // texto del pie de foto
  let [indice, setIndice] = useState(0);                  // archivo activo en el carrusel

  // Guarda el nuevo caption en la base de datos
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
      if (respuesta.status === 204 || respuesta.status === 200) {
        setEditando(false); // cierra el modo edición
      }
    })
    .catch(() => setEditando(false)); // cierra también si hay error
  }

  // Devuelve la URL del archivo activo — el operador ?. evita errores si archivos es undefined
  function archivoActual() {
    return post.archivos?.[indice] || "";
  }

  // Detecta si el archivo es un vídeo por su URL de Cloudinary
  function esVideo(src) {
    return src.includes("/video/") || src.includes(".mp4") || src.includes(".mov") || src.includes(".avi");
  }

  // stopPropagation evita que el click se propague al div draggable padre,
  // lo que causaría que el modal se volviera a abrir al intentar cerrarlo
  function abrirModal(e) {
    e.stopPropagation()
    setModalAbierto(true)
  }

  function cerrarModal(e) {
    e.stopPropagation()
    setModalAbierto(false)
  }

  return (
    <div
      className={`post_card ${isDragOver ? "drag_over" : ""}`} // drag_over añade feedback visual al arrastrar
      draggable
      onDragStart={() => onDragStart(index)}
      onDragOver={e => onDragOver(e, index)}
      onDrop={() => onDrop(index)}
    >
      <div className="post_image_wrapper">

        {/* muestra vídeo o imagen según el tipo de archivo */}
        {esVideo(post.archivos?.[indice] || "")
          ? <video src={archivoActual()} controls controlsList="nofullscreen" />
          : <img
              src={archivoActual()}
              alt={post.caption}
              onClick={abrirModal}
              loading="lazy" // lazy loading — solo carga la imagen cuando está a punto de aparecer en pantalla
              style={{ cursor: "pointer" }}
            />
        }

        {/* carrusel — solo si el post tiene más de un archivo */}
        {post.archivos?.length > 1 && (
          <>
            <button
              className="carrusel_btn prev"
              onClick={() => setIndice(i => Math.max(0, i - 1))} // no baja de 0
            >‹</button>
            <button
              className="carrusel_btn next"
              onClick={() => setIndice(i => Math.min(post.archivos.length - 1, i + 1))} // no sube del último
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

        {/* botón eliminar — solo visible al hacer hover */}
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
          // click en el caption activa el modo edición
          <div className="caption_view" onClick={() => setEditando(true)}>
            <p>{caption || "Añadir pie de foto..."}</p>
          </div>
        )}
      </div>

      {/* el modal se renderiza con createPortal fuera del árbol del componente
          para evitar problemas de propagación de eventos con el drag & drop */}
      {modalAbierto && <PostModal post={{...post, caption}} onClose={cerrarModal} />}
    </div>
  );
}

export default PostCard;