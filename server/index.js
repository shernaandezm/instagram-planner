import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import { leerPosts, crearPost, borrarPost, actualizarCaption, reordenarPosts, buscarUsuario, crearUsuario } from "./db.js"
import multer from "multer";
import path from "path";
import bcrypt from "bcrypt";

// Multer config
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // le da un nombre único a cada archivo, con la extensión original (.jpg,.png..)
  }
});
const upload = multer({ storage });

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

// Crear usuario admin por defecto
bcrypt.hash("admin123", 10).then(hash => {
  buscarUsuario("admin").then(existe => {
    if (!existe) {
      crearUsuario({ usuario: "admin", password: hash })
      console.log("Usuario admin creado")
    }
  })
})

const servidor = express();

servidor.use(cors());
servidor.use(express.json());
servidor.use("/uploads", express.static("uploads"));

// Login
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

// Registro
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

servidor.use(verificar);

// Obtener posts
servidor.get("/posts", async (peticion, respuesta) => {
  try {
    let posts = await leerPosts(peticion.usuario);
    respuesta.json(posts);
  } catch (e) {
    respuesta.status(500);
    respuesta.json({ error: "error en el servidor" });
  }
});

// Crear post
servidor.post("/posts", upload.single("image"), async (peticion, respuesta) => {
  try {
    let { caption } = peticion.body;
    let imageUrl = `/uploads/${peticion.file.filename}`;
    let usuario = peticion.usuario;

    let id = await crearPost({ imageUrl, caption, usuario });

    respuesta.json({ id });
  } catch (e) {
    respuesta.status(500);
    respuesta.json({ error: "error en el servidor" });
  }
});

// Actualizar caption
servidor.patch("/posts/:id", async (peticion, respuesta, siguiente) => {
  try {
    let { existe, cambio } = await actualizarCaption(peticion.params.id, peticion.body.caption, peticion.usuario);

    if (cambio) {
      return respuesta.sendStatus(204);
    }

    if (existe) {
      return respuesta.json({ info: "no se actualizó el recurso" });
    }

    siguiente();

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

// Borrar post
servidor.delete("/posts/:id", async (peticion, respuesta, siguiente) => {
  try {
    let cantidad = await borrarPost(peticion.params.id, peticion.usuario);

    if (cantidad) {
      return respuesta.sendStatus(204);
    }

    siguiente();

  } catch (e) {
    respuesta.status(500);
    respuesta.json({ error: "error en el servidor" });
  }
});

servidor.use((error, peticion, respuesta, siguiente) => {
  respuesta.status(400);
  respuesta.json({ error: "error en la petición" });
});

servidor.use((peticion, respuesta) => {
  respuesta.status(404);
  respuesta.json({ error: "recurso no encontrado" });
});

servidor.listen(process.env.PORT);