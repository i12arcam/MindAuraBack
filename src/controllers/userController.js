import Usuario from '../models/Usuario.js';
import asyncHandler from 'express-async-handler';
import bcrypt from 'bcrypt';
const saltRounds = 10;

// GET ALL USERS
export const getUsers = asyncHandler(async (req, res) => {
    try {
        const users = await Usuario.find({});
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET SINGLE USER
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

// CREATE USER
export const createUser = asyncHandler(async (req, res) => {
    const { nombre, email, contraseña } = req.body;
    
    try {
        // Verificar si el usuario ya existe
        const usuarioExistente = await Usuario.findOne({ email });
        if (usuarioExistente) {
            console.log("Usuario existente:", usuarioExistente);
            return res.status(409).json({ message: "Este email ya está registrado" });
        }

        // Validar contraseña
        if (!contraseña) {
            console.log("Contraseña no proporcionada");
            return res.status(400).json({ message: "Contraseña no proporcionada" });
        }

        // Cifrar contraseña
        const contraseña_hashed = await bcrypt.hash(contraseña, saltRounds);

        // Crear nuevo usuario
        const newUser = new Usuario({
            nombre,
            email,
            contraseña: contraseña_hashed
        });

        await newUser.save();
        console.log("Usuario guardado:", newUser);

        res.status(201).json(newUser);
    } catch (error) {
        console.error("Error al crear usuario:", error);
        res.status(500).json({ message: error.message });
    }
});

// LOGIN USER
export const loginUser = asyncHandler(async (req, res) => {
    const { email, contraseña } = req.body;
    
    try {
        const usuario = await Usuario.findOne({ email });
        if (!usuario) {
            return res.status(404).json({ message: 'Credenciales incorrectas' });
        }

        const contraseñaValida = await bcrypt.compare(contraseña, usuario.contraseña);
        if (!contraseñaValida) {
            return res.status(401).json({ message: 'Credenciales incorrectas' });
        }

        res.status(200).json(usuario);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// UPDATE USER PROFILE
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

// UPDATE PASSWORD
export const modifyPassword = asyncHandler(async (req, res) => {
    const { contraseña } = req.body;
    
    try {
        if (!contraseña) {
            return res.status(400).json({ 
                message: "Contraseña no proporcionada" 
            });
        }

        const contraseña_hashed = await bcrypt.hash(contraseña, saltRounds);
        const usuario = await Usuario.findByIdAndUpdate(
            req.params.id,
            { contraseña: contraseña_hashed },
            { new: true }
        );

        if (!usuario) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        res.status(200).json({ 
            message: 'Contraseña actualizada correctamente',
            usuario
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});