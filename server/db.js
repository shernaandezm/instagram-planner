import dotenv from "dotenv";
dotenv.config();

import { MongoClient, ObjectId } from "mongodb";

const urlMongo = process.env.MONGO_URL;

function conectar() {
  return MongoClient.connect(urlMongo);
}


//Buscar usuario
export function buscarUsuario(nombreUsuario) {
  return new Promise((ok, ko) => {
    let conexion = null;
    conectar()
      .then(objConexion => {
        conexion = objConexion;
        let coleccion = conexion.db("instagram_planner").collection("users");
        return coleccion.findOne({ usuario: nombreUsuario });
      })
      .then(usuario => ok(usuario))
      .catch(() => ko({ error: "error en bbdd" }))
      .finally(() => {
        if (conexion) conexion.close();
      });
  });
}

// Crear usuario
export function crearUsuario(objUsuario) {
  return new Promise((ok, ko) => {
    let conexion = null;
    conectar()
      .then(objConexion => {
        conexion = objConexion;
        let coleccion = conexion.db("instagram_planner").collection("users");
        return coleccion.insertOne(objUsuario);
      })
      .then(({ insertedId }) => ok(insertedId))
      .catch(() => ko({ error: "error en bbdd" }))
      .finally(() => {
        if (conexion) conexion.close();
      });
  });
}


//Recibir posts guardados
export function leerPosts(idUsuario) {
  return new Promise((ok, ko) => {
    let conexion = null;
    conectar()
      .then(objConexion => {
        conexion = objConexion;
        let coleccion = conexion.db("instagram_planner").collection("posts");
        return coleccion.find({ usuario: idUsuario }).sort({ order: 1 }).toArray();
      })
      .then(posts => ok(posts))
      .catch(() => ko({ error: "error en bbdd" }))
      .finally(() => {
        if (conexion) conexion.close();
      });
  });
}

//Crear nuevos posts
export function crearPost(objPost) {
  return new Promise((ok, ko) => {
    let conexion = null;
    conectar()
      .then(objConexion => {
        conexion = objConexion;
        let coleccion = conexion.db("instagram_planner").collection("posts");
        return coleccion.insertOne(objPost);
      })
      .then(({ insertedId }) => ok(insertedId))
      .catch(() => ko({ error: "error en bbdd" }))
      .finally(() => {
        if (conexion) conexion.close();
      });
  });
}

export function borrarPost(idPost, idUsuario) {
  return new Promise((ok, ko) => {
    let conexion = null;
    conectar()
      .then(objConexion => {
        conexion = objConexion;
        let coleccion = conexion.db("instagram_planner").collection("posts");
        return coleccion.deleteOne({ _id: new ObjectId(idPost), usuario: idUsuario });
      })
      .then(({ deletedCount }) => ok(deletedCount))
      .catch(() => ko({ error: "error en bbdd" }))
      .finally(() => {
        if (conexion) conexion.close();
      });
  });
}

export function actualizarCaption(idPost, nuevoCaption, idUsuario) {
  return new Promise((ok, ko) => {
    let conexion = null;
    conectar()
      .then(objConexion => {
        conexion = objConexion;
        let coleccion = conexion.db("instagram_planner").collection("posts");
        return coleccion.updateOne(
          { _id: new ObjectId(idPost), usuario: idUsuario },
          { $set: { caption: nuevoCaption } }
        );
      })
      .then(({ modifiedCount, matchedCount }) => ok({
        existe: matchedCount,
        cambio: modifiedCount
      }))
      .catch(() => ko({ error: "error en bbdd" }))
      .finally(() => {
        if (conexion) conexion.close();
      });
  });
}

export function reordenarPosts(posts, idUsuario) {
  return new Promise((ok, ko) => {
    let conexion = null;
    conectar()
      .then(objConexion => {
        conexion = objConexion;
        let coleccion = conexion.db("instagram_planner").collection("posts");
        let operaciones = posts.map(p =>
          coleccion.updateOne(
            { _id: new ObjectId(p._id), usuario: idUsuario },
            { $set: { order: p.order } }
          )
        );
        return Promise.all(operaciones);
      })
      .then(() => ok())
      .catch(() => ko({ error: "error en bbdd" }))
      .finally(() => {
        if (conexion) conexion.close();
      });
  });
}