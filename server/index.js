import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import { leerPosts, crearPost, borrarPost, actualizarCaption, reordenarPosts, buscarUsuario } from "./db.js";
import multer from "multer";
import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

// Configuración de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Multer config - sube los archivos directamente a Cloudinary
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "instagram_planner",
    allowed_formats: ["jpg", "jpeg", "png", "gif", "webp", "mp4", "mov", "avi"],
    resource_type: "auto" // detecta automáticamente si es imagen o vídeo
  }
});

const upload = multer({ storage });

// Middleware: verifica que el token JWT es válido
async function verificar(peticion, respuesta, siguiente) {
  if (!peticion.headers.authorization) {
    return respuesta.status(403).json({ error: "Token requerido" });
  }

  let [, token] = peticion.headers.authorization.split(" ");

  try {
    let datos = jwt.verify(token, process.env.SECRET);
    peticion.usuario = datos.id;
    siguiente();
  } catch (e) {
    return respuesta.status(403).json({ error: "Token inválido" });
  }
}

const servidor = express();

servidor.use(cors({ origin: process.env.CLIENT_URL }));
servidor.use(express.json());

// Iniciar sesión
servidor.post("/login", async (peticion, respuesta) => {
  let { usuario, password } = peticion.body;

  if (!usuario?.trim() || !password?.trim()) {
    return respuesta.status(403).json({ error: "Datos incompletos" });
  }

  try {
    let posibleUsuario = await buscarUsuario(usuario);

    if (!posibleUsuario) {
      return respuesta.status(403).json({ error: "Usuario no encontrado" });
    }

    let coincide = await bcrypt.compare(password, posibleUsuario.password);

    if (!coincide) {
      return respuesta.status(401).json({ error: "Contraseña incorrecta" });
    }

    let token = jwt.sign({ id: posibleUsuario._id }, process.env.SECRET);
    respuesta.json({ token, usuario: posibleUsuario.usuario });

  } catch (e) {
    respuesta.status(500).json({ error: "Error en el servidor" });
  }
});

// A partir de aquí todas las rutas requieren token validado
servidor.use(verificar);

// Obtener posts del usuario
servidor.get("/posts", async (peticion, respuesta) => {
  try {
    let posts = await leerPosts(peticion.usuario);
    respuesta.json(posts);
  } catch (e) {
    respuesta.status(500).json({ error: "Error en el servidor" });
  }
});

// Crear post con uno o varios archivos - las URLs las devuelve Cloudinary
servidor.post("/posts", upload.array("archivos", 10), async (peticion, respuesta) => {
  try {
    if (!peticion.files || peticion.files.length === 0) {
      return respuesta.status(400).json({ error: "Debes subir al menos un archivo" });
    }

    let { caption } = peticion.body;
    let archivos = peticion.files.map(f => f.path); // URL de Cloudinary
    let usuario = new ObjectId(peticion.usuario);

    let id = await crearPost({ archivos, caption, usuario, order: 0 });

    respuesta.json({ id });
  } catch (e) {
    respuesta.status(500).json({ error: "Error en el servidor" });
  }
});

// Reordenar posts
servidor.patch("/posts/reorder", async (peticion, respuesta) => {
  try {
    await reordenarPosts(peticion.body.posts, peticion.usuario);
    respuesta.sendStatus(204);
  } catch (e) {
    respuesta.status(500).json({ error: "Error en el servidor" });
  }
});

// Actualizar pie de foto de un post
servidor.patch("/posts/:id", async (peticion, respuesta, siguiente) => {
  try {
    let { existe, cambio } = await actualizarCaption(peticion.params.id, peticion.body.caption, peticion.usuario);

    if (cambio) return respuesta.sendStatus(204);
    if (existe) return respuesta.json({ info: "no se actualizó el recurso" });
    siguiente();

  } catch (e) {
    respuesta.status(500).json({ error: "Error en el servidor" });
  }
});

// Eliminar post verificando que pertenece al usuario
servidor.delete("/posts/:id", async (peticion, respuesta, siguiente) => {
  try {
    let cantidad = await borrarPost(peticion.params.id, peticion.usuario);
    if (cantidad) return respuesta.sendStatus(204);
    siguiente();
  } catch (e) {
    respuesta.status(500).json({ error: "Error al eliminar el elemento" });
  }
});

// Captura de errores generales
servidor.use((error, peticion, respuesta, siguiente) => {
  respuesta.status(400).json({ error: "Error en la petición" });
});

// Captura de rutas que no existen
servidor.use((peticion, respuesta) => {
  respuesta.status(404).json({ error: "Recurso no encontrado" });
});

servidor.listen(process.env.PORT);