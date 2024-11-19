const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

// Crear la instancia de la aplicación
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Configuración de la conexión a MongoDB
const mongoURI = "mongodb://localhost:27017/admin";

mongoose.connect(mongoURI)
    .then(() => {
        console.log('Conectado a MongoDB');
    })
    .catch(err => {
        console.error('Error de conexión a MongoDB:', err);
        process.exit(1);
    });

// Definir el esquema y modelo de 'usuarios'
const usuarioSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    telefono: { type: String, required: true },
    correo: { type: String, required: true, unique: true },
});

const Usuario = mongoose.model("Usuario", usuarioSchema);

// Ruta para obtener todos los usuarios
app.get('/usuarios', async (req, res) => {
    try {
        const usuarios = await Usuario.find();
        res.json(usuarios);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los usuarios' });
    }
});

// Ruta para insertar un nuevo usuario
app.post('/usuarios', async (req, res) => {
    const { nombre, telefono, correo } = req.body;

    if (!nombre || !telefono || !correo) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    try {
        const nuevoUsuario = new Usuario({ nombre, telefono, correo });
        await nuevoUsuario.save();
        res.status(201).json({ message: 'Usuario insertado', usuario: nuevoUsuario });
    } catch (error) {
        res.status(500).json({ error: 'Error al insertar el usuario', detalles: error.message });
    }
});

// Ruta para actualizar un usuario por su nombre
app.put('/usuarios/:nombre', async (req, res) => {
    const { nombre } = req.params;
    const { telefono, correo } = req.body;

    try {
        const usuarioActualizado = await Usuario.findOneAndUpdate(
            { nombre },
            { ...(telefono && { telefono }), ...(correo && { correo }) },
            { new: true }
        );

        if (!usuarioActualizado) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json({ message: 'Usuario actualizado', usuario: usuarioActualizado });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar el usuario', detalles: error.message });
    }
});

// Ruta para eliminar un usuario por su correo
app.delete('/usuarios/:correo', async (req, res) => {
    const { correo } = req.params;

    try {
        const usuarioEliminado = await Usuario.findOneAndDelete({ correo });
        if (!usuarioEliminado) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        res.json({ message: 'Usuario eliminado', usuario: usuarioEliminado });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar el usuario', detalles: error.message });
    }
});

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor en funcionamiento en el puerto ${PORT}`);
});
