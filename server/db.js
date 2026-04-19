import dotenv from "dotenv";
dotenv.config();

// conectar con MongoDB 
import { MongoClient, ObjectId } from "mongodb"; 
// URL de conexión guardada en .env
const urlMongo = process.env.MONGO_URL;

// Abrir conexión nueva con MongoDB
function conectar() {
  return MongoClient.connect(urlMongo);
}

//Función buscar usuario por su nombre en la colección users
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
        if (conexion) conexion.close(); // siempre cierra la conexión al terminar
      });
  });
}

// Crear usuario - Inserta un nuevo usuario en la colección users
export function crearUsuario(objUsuario) {
  return new Promise((ok, ko) => {
    let conexion = null;
    conectar()
      .then(objConexion => {
        conexion = objConexion;
        let coleccion = conexion.db("instagram_planner").collection("users");
        return coleccion.insertOne(objUsuario);
      })
      .then(({ insertedId }) => ok(insertedId)) // devuelve el id del usuario creado
      .catch(() => ko({ error: "error en bbdd" }))
      .finally(() => {
        if (conexion) conexion.close();
      });
  });
}


// Obtiene todos los posts del usuario ordenados por el campo order
export function leerPosts(idUsuario) {
  return new Promise((ok, ko) => {
    let conexion = null;
    conectar()
      .then(objConexion => {
        conexion = objConexion;
        let coleccion = conexion.db("instagram_planner").collection("posts");
        // convierte idUsuario a ObjectId para que coincida con el tipo en MongoDB
        return coleccion.find({ usuario: new ObjectId(idUsuario) }).sort({ order: -1 }).toArray();
      }) 
      .then(posts => ok(posts))
      .catch(() => ko({ error: "error en bbdd" }))
      .finally(() => {
        if (conexion) conexion.close();
      });
  });
}

// Inserta un nuevo post en la colección posts
export function crearPost(objPost) {
  return new Promise((ok, ko) => {
    let conexion = null;
    conectar()
      .then(objConexion => {
        conexion = objConexion;
        let coleccion = conexion.db("instagram_planner").collection("posts");
        return coleccion.insertOne(objPost);
      })
      .then(({ insertedId }) => ok(insertedId)) // devuelve el id del post creado
      .catch(() => ko({ error: "error en bbdd" }))
      .finally(() => {
        if (conexion) conexion.close();
      });
  });
}

// Elimina un post por su id, verificando que pertenece al usuario
export function borrarPost(idPost, idUsuario) {
  return new Promise((ok, ko) => {
    let conexion = null;
    conectar()
      .then(objConexion => {
        conexion = objConexion;
        let coleccion = conexion.db("instagram_planner").collection("posts");
        return coleccion.deleteOne({ _id: new ObjectId(idPost), usuario: new ObjectId(idUsuario)});
      })
      .then(({ deletedCount }) => ok(deletedCount)) // devuelve 1 si se borró, 0 si no existía
      .catch(() => ko({ error: "error en bbdd" }))
      .finally(() => {
        if (conexion) conexion.close();
      });
  });
}

// Actualiza el pie de foto de un post, verificando que pertenece al usuario
export function actualizarCaption(idPost, nuevoCaption, idUsuario) {
  return new Promise((ok, ko) => {
    let conexion = null;
    conectar()
      .then(objConexion => {
        conexion = objConexion;
        let coleccion = conexion.db("instagram_planner").collection("posts");
        return coleccion.updateOne(
          { _id: new ObjectId(idPost), usuario: new ObjectId(idUsuario) },
          { $set: { caption: nuevoCaption } } // $set actualiza solo el campo caption
        );
      })
      .then(({ modifiedCount, matchedCount }) => ok({
        existe: matchedCount, // 1 si el post existe
        cambio: modifiedCount // 1 si se modificó, 0 si el caption era igual
      }))
      .catch(() => ko({ error: "error en bbdd" }))
      .finally(() => {
        if (conexion) conexion.close();
      });
  });
}

// Actualiza el campo order de cada post para guardar el nuevo orden del feed
export function reordenarPosts(posts, idUsuario) {
  return new Promise((ok, ko) => {
    let conexion = null;
    conectar()
      .then(objConexion => {
        conexion = objConexion;
        let coleccion = conexion.db("instagram_planner").collection("posts");
        // crea una operación de actualización por cada post del array
        let operaciones = posts.map(p =>
          coleccion.updateOne(
            { _id: new ObjectId(p._id), usuario: new ObjectId(idUsuario) },
            { $set: { order: p.order } }
          )
        );
        return Promise.all(operaciones); // ejecuta todas las operaciones a la vez
      })
      .then(() => ok())
      .catch(() => ko({ error: "error en bbdd" }))
      .finally(() => {
        if (conexion) conexion.close();
      });
  });
}