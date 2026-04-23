import { useState, useContext } from "react";
import { createPortal } from "react-dom";
import Contexto from "../Contexto";

function PostModal({ post, onClose }) {
  let { username } = useContext(Contexto); // para mostrar el nombre de usuario en el modal
  let [indice, setIndice] = useState(0);   // archivo activo en el carrusel del modal

  // Devuelve la URL del archivo activo
  function archivoActual() {
    return post.archivos[indice];
  }

  // Detecta si el archivo es un vídeo por su URL de Cloudinary
  function esVideo(src) {
    return src.includes("/video/") || src.includes(".mp4") || src.includes(".mov") || src.includes(".avi");
  }

  // createPortal renderiza el modal fuera del árbol de PostCard, directamente en el body
  // Esto evita que los clicks del modal se propaguen al div draggable padre y vuelvan a abrirlo
  return createPortal(
    <div className="modal_overlay" onClick={onClose}>

      {/* stopPropagation evita que el click dentro del modal cierre el overlay */}
      <div className="modal_content" onClick={e => e.stopPropagation()}>

        <div className="modal_media">
          {/* muestra vídeo o imagen según el tipo de archivo */}
          {esVideo(post.archivos[indice])
            ? <video src={archivoActual()} controls />
            : <img src={archivoActual()} alt={post.caption} loading="lazy" />
          }

          {/* carrusel — solo si el post tiene más de un archivo */}
          {post.archivos.length > 1 && (
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
        </div>

        <div className="modal_info">
          <div className="modal_header">
            <div className="modal_usuario">
              <div className="modal_avatar">📷</div>
              <span>@{username}</span>
            </div>
            <button className="modal_close" onClick={onClose}>✕</button>
          </div>
          <div className="modal_caption">
            <p>{post.caption || "Sin pie de foto"}</p>
          </div>
        </div>

      </div>
    </div>,
    document.body // monta el modal directamente en el body
  );
}

export default PostModal;