import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import { leerPosts, crearPost, borrarPost, actualizarCaption, reordenarPosts, buscarUsuario, crearUsuario } from "./db.js"
import multer from "multer";
import path from "path";
import bcrypt from "bcrypt";

// Multer config - configuración de dónde y cómo se guardan los archivos que se suben
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // le da un nombre único a cada archivo, con la extensión original (.jpg,.png..)
  }
});

//Filtro para aceptar sólo imágenes y vídeos
const fileFilter = (req, file, cb) => {
  let tiposPermitidos = /jpeg|jpg|png|gif|webp|mp4|mov|avi/;
  let esValido = tiposPermitidos.test(path.extname(file.originalname).toLowerCase());
  esValido ? cb(null, true) : cb(new Error("Tipo de archivo no permitido"));
}

const upload = multer({ storage, fileFilter });

// Middleware verificar token
async function verificar(peticion, respuesta, siguiente) {
  if (!peticion.headers.authorization) {
    return respuesta.sendStatus(403);
  }

  let [, token] = peticion.headers.authorization.split(" ");

  try {
    let datos = jwt.verify(token, process.env.SECRET);
    peticion.usuario = datos.id;
    siguiente();
  } catch (e) {
    respuesta.sendStatus(403);
  }
}


const servidor = express();

servidor.use(cors());  //permite peticiones desde el frontend
servidor.use(express.json()); // permite leer JSON en el body
servidor.use("/uploads", express.static("uploads")); // sirve los archivos subidos

// Iniciar sesión 
servidor.post("/login", async (peticion, respuesta) => {
  let { usuario, password } = peticion.body;

  if (!usuario || !usuario.trim() || !password || !password.trim()) {
    return respuesta.sendStatus(403);
  }

  try {
    let posibleUsuario = await buscarUsuario(usuario);

    if (!posibleUsuario) {
      return respuesta.sendStatus(403);
    }

    let coincide = await bcrypt.compare(password, posibleUsuario.password);

    if (!coincide) {
      return respuesta.sendStatus(401);
    }

    let token = jwt.sign({ id: posibleUsuario._id }, process.env.SECRET);

    respuesta.json({ token });

  } catch (e) {
    respuesta.status(500);
    respuesta.json({ error: "error en el servidor" });
  }
});

// Registro - Crear nueva cuenta 
servidor.post("/registro", async (peticion, respuesta) => {
  let { usuario, password } = peticion.body;

  if (!usuario || !usuario.trim() || !password || !password.trim()) {
    return respuesta.sendStatus(403);
  }

  try {
    let existe = await buscarUsuario(usuario);

    if (existe) {
      return respuesta.status(400).json({ error: "el usuario ya existe" });
    }

    let hash = await bcrypt.hash(password, 10);
    await crearUsuario({ usuario, password: hash });
    respuesta.sendStatus(201);

  } catch (e) {
    respuesta.status(500);
    respuesta.json({ error: "error en el servidor" });
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
    respuesta.status(500);
    respuesta.json({ error: "error en el servidor" });
  }
});

// Crear post con uno o varios archivos 
servidor.post("/posts", upload.array("archivos", 10), async (peticion, respuesta) => {
  try {
    let { caption } = peticion.body;
    // genera un array con las rutas de todos los archivos subidos
    let archivos = peticion.files.map(f => `/uploads/${f.filename}`);
    let usuario = new ObjectId(peticion.usuario);

    let id = await crearPost({ archivos, caption, usuario, order: 0 });

    respuesta.json({ id });
  } catch (e) {
    respuesta.status(500);
    respuesta.json({ error: "error en el servidor" });
  }
});

// Reordenar posts
servidor.patch("/posts/reorder", async (peticion, respuesta) => {
  try {
    await reordenarPosts(peticion.body.posts, peticion.usuario);
    respuesta.sendStatus(204);
  } catch (e) {
    respuesta.status(500);
    respuesta.json({ error: "error en el servidor" });
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
    respuesta.status(500);
    respuesta.json({ error: "error en el servidor" });
  }
});

// Eliminar post verificando que pertenece al usuario
servidor.delete("/posts/:id", async (peticion, respuesta, siguiente) => {
  try {
    let cantidad = await borrarPost(peticion.params.id, peticion.usuario);
    if (cantidad) return respuesta.sendStatus(204);
    siguiente();
  } catch (e) {
    respuesta.status(500);
    respuesta.json({ error: "error en el servidor" });
  }
});

//Captura de errores generales
servidor.use((error, peticion, respuesta, siguiente) => {
  respuesta.status(400);
  respuesta.json({ error: "error en la petición" });
});

//Captura de rutas que no existen
servidor.use((peticion, respuesta) => {
  respuesta.status(404);
  respuesta.json({ error: "recurso no encontrado" });
});

servidor.listen(process.env.PORT);