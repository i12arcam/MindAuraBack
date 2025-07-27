import Usuario from '../models/Usuario.js';
import asyncHandler from 'express-async-handler';

// OBTENER TODOS LOS USUARIOS
export const getUsers = asyncHandler(async (req, res) => {
    try {
        const users = await Usuario.find({});
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// OBTENER UN USUARIO
export const getUser = asyncHandler(async (req, res) => {
    console.log("Entrando a getUser");
    console.log("ID solicitado:", req.params.id);
    try {
        const user = await Usuario.findById(req.params.id);
        if (user) {
            res.status(200).json(user);
        } else {
            res.status(404).json({ message: "Usuario no encontrado" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// CREAR USUARIO
export const createUser = asyncHandler(async (req, res) => {
    console.log(req.body);
    const { firebaseUID, nombre, email, metodo_autenticacion } = req.body;
    
    // Validación básica
    if (!firebaseUID || !nombre || !email) {
        return res.status(400).json({ message: "Faltan campos requeridos" });
    }
    
    try {
        // Verificar si el UID ya existe (usuario ya registrado)
        const existeUsuarioId = await Usuario.findById(firebaseUID);
        if (existeUsuarioId) {
            return res.status(409).json({ message: "El usuario ya está registrado" });
        }

        // Verificación 2: Comprobar si el email ya existe (independientemente del UID)
        const existeUsuarioEmail = await Usuario.findOne({ email });
        if (existeUsuarioEmail) {
            return res.status(409).json({ message: "El email ya está registrado por otro usuario" });
        }

        // Crear nuevo usuario (el _id será el firebaseUID)
        const nuevoUsuario = await Usuario.create({
            _id: firebaseUID,
            nombre,
            email,
            metodo_autenticacion: metodo_autenticacion || null
        });

        console.log("Usuario guardado:", nuevoUsuario);

        res.status(201).json(nuevoUsuario);


    } catch (error) {
        console.error("Error en creación de usuario:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
});

// ACTUALIZAR PERFIL USUARIO
export const modifyUser = asyncHandler(async (req, res) => {
    const { nombre, email } = req.body;

    try {
        if (!nombre || !email) {
            return res.status(400).json({ 
                message: "Se requieren nombre y email para actualizar el usuario" 
            });
        }

        const usuario = await Usuario.findByIdAndUpdate(
            req.params.id,
            { nombre, email },
            { new: true }
        );

        if (!usuario) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        res.status(200).json({ 
            message: 'Perfil actualizado correctamente', 
            usuario 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});