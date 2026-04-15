import { useState, useContext } from "react"
import Contexto from "../context/Contexto"

function AddPost({ posts, setPosts }) {
  let { token } = useContext(Contexto)

  let [imagen, setImagen] = useState(null)
  let [caption, setCaption] = useState("")
  let [preview, setPreview] = useState(null)
  let [cargando, setCargando] = useState(false)

  function handleImagen(evento) {
    let file = evento.target.files[0]
    if (file) {
      setImagen(file)
      setPreview(URL.createObjectURL(file))
    }
  }

  return (
    <div className="add-post">
      <form onSubmit={evento => {
        evento.preventDefault()
        if (!imagen) return

        setCargando(true)

        let formData = new FormData()
        formData.append("image", imagen)
        formData.append("caption", caption)

        fetch(import.meta.env.VITE_API_URL + "/posts", {
          method: "POST",
          headers: { "Authorization": "Bearer " + token },
          body: formData
        })
        .then(respuesta => respuesta.json())
        .then(({ id }) => {
          setPosts([...posts, {
            _id: id,
            imageUrl: preview,
            caption,
            order: posts.length
          }])
          setImagen(null)
          setCaption("")
          setPreview(null)
          setCargando(false)
        })
        .catch(() => setCargando(false))
      }}>
        <div className="add-post-preview">
          {preview
            ? <img src={preview} alt="preview" />
            : <label htmlFor="image-input" className="upload-placeholder">
                + Añadir imagen
              </label>
          }
          <input
            id="image-input"
            type="file"
            accept="image/*"
            onChange={handleImagen}
            style={{ display: "none" }}
          />
        </div>
        {preview && (
          <>
            <textarea
              placeholder="Escribe un pie de foto..."
              value={caption}
              onChange={evento => setCaption(evento.target.value)}
            />
            <button type="submit" disabled={cargando}>
              {cargando ? "Subiendo..." : "Publicar"}
            </button>
          </>
        )}
      </form>
    </div>
  )
}

export default AddPost