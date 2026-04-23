import { useState, useContext } from "react";
import Contexto from "../Contexto";

function AddPost({ posts, setPosts }) {
  let { token } = useContext(Contexto);

  let [imagenes, setImagenes] = useState([]);
  let [caption, setCaption] = useState("");
  let [previews, setPreviews] = useState([]);
  let [cargando, setCargando] = useState(false);
  let [indicePreview, setIndicePreview] = useState(0);
  let [errorSubida, setErrorSubida] = useState(""); // mensaje de error si falla la subida

  // Convierte los archivos seleccionados en URLs locales para mostrar la preview
  function handleImagen(evento) {
    let files = Array.from(evento.target.files);
    if (files.length > 0) {
      setImagenes(files);
      setPreviews(files.map(f => URL.createObjectURL(f)));
      setIndicePreview(0);
      setErrorSubida(""); // limpia el error al seleccionar nuevas imágenes
    }
  }

  // Reordena las imágenes usando drag & drop en las miniaturas
  // Mueve tanto el archivo original como su preview para mantenerlos sincronizados
  function moverImagen(desde, hasta) {
    let nuevasImagenes = [...imagenes];
    let nuevasPreviews = [...previews];
    let [imgMovida] = nuevasImagenes.splice(desde, 1);
    let [prevMovida] = nuevasPreviews.splice(desde, 1);
    nuevasImagenes.splice(hasta, 0, imgMovida);
    nuevasPreviews.splice(hasta, 0, prevMovida);
    setImagenes(nuevasImagenes);
    setPreviews(nuevasPreviews);
    setIndicePreview(hasta);
  }

  // Envía el post al servidor con los archivos y el pie de foto
  function handleSubmit(evento) {
    evento.preventDefault();
    if (imagenes.length === 0) return;

    setCargando(true);
    setErrorSubida("");

    // FormData permite enviar archivos junto con texto en una misma petición
    let formData = new FormData();
    imagenes.forEach(file => formData.append("archivos", file));
    formData.append("caption", caption);

    fetch(import.meta.env.VITE_API_URL + "/posts", {
      method: "POST",
      headers: { "Authorization": "Bearer " + token },
      body: formData
    })
    .then(respuesta => respuesta.json())
    .then(() => {
      return fetch(import.meta.env.VITE_API_URL + "/posts", {
        headers: { Authorization: "Bearer " + token }
      });
    })
    .then(res => res.json())
    .then(posts => {
      setPosts(posts);
      setImagenes([]);
      setCaption("");
      setPreviews([]);
      setIndicePreview(0);
      setCargando(false);
    })
    .catch(() => {
      // muestra un mensaje de error si falla la subida
      setErrorSubida("Error al subir el post, inténtalo de nuevo");
      setCargando(false);
    });
  }

  return (
    <div className="add_post">
      <form onSubmit={handleSubmit}>
        <div className="add_post_preview">
          {previews.length > 0 ? (
            <>
              {/* muestra el archivo activo — imagen o vídeo según el tipo */}
              {imagenes[indicePreview]?.type.startsWith("video/")
                ? <video src={previews[indicePreview]} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <img src={previews[indicePreview]} alt="preview" />
              }

              {/* botones para navegar entre las previews si hay más de una imagen */}
              {previews.length > 1 && (
                <>
                  <button type="button" className="carrusel_btn prev"
                    onClick={() => setIndicePreview(i => Math.max(0, i - 1))}>‹</button>
                  <button type="button" className="carrusel_btn next"
                    onClick={() => setIndicePreview(i => Math.min(previews.length - 1, i + 1))}>›</button>
                </>
              )}
            </>
          ) : (
            // placeholder que actúa como botón para abrir el selector de archivos
            <label htmlFor="image-input" className="upload_placeholder">
              + Añadir nueva publicación
            </label>
          )}
          {/* input oculto — se activa al hacer click en el label */}
          <input
            id="image-input"
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={handleImagen}
            style={{ display: "none" }}
          />
        </div>

        {/* miniaturas arrastrables para reordenar las imágenes antes de publicar */}
        {previews.length > 1 && (
          <div className="preview_thumbnails">
            {previews.map((src, i) => (
              <div
                key={i}
                className={`thumbnail ${i === indicePreview ? "active" : ""}`}
                draggable
                onDragStart={e => e.dataTransfer.setData("desde", i)}
                onDragOver={e => e.preventDefault()}
                onDrop={e => moverImagen(Number(e.dataTransfer.getData("desde")), i)}
                onClick={() => setIndicePreview(i)}
              >
                <img src={src} alt={`imagen ${i + 1}`} />
              </div>
            ))}
          </div>
        )}

        {previews.length > 0 && (
          <>
            <textarea
              placeholder="Escribe un pie de foto..."
              value={caption}
              onChange={evento => setCaption(evento.target.value)}
            />
            {/* mensaje de error si falla la subida */}
            {errorSubida && <p className="error">{errorSubida}</p>}
            <button type="submit" disabled={cargando}>
              {cargando ? "Subiendo..." : "Publicar"}
            </button>
          </>
        )}
      </form>
    </div>
  );
}

export default AddPost;