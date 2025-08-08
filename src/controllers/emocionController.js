import Emocion from '../models/Emocion.js';
import asyncHandler from 'express-async-handler';

// OBTENER TODAS LAS EMOCIONES DE UN USUARIO
export const getEmociones = asyncHandler(async (req, res) => {
    try {
        const usuarioId = req.params.usuarioId; // Obtener el ID del usuario de los parámetros de la ruta
        
        if (!usuarioId) {
            return res.status(400).json({ message: "Se requiere el ID del usuario" });
        }

        const emociones = await Emocion.find({ usuario: usuarioId });
        
        if (emociones.length === 0) {
            return res.status(404).json({ message: "No se encontraron emociones para este usuario" });
        }

        res.status(200).json(emociones);
    } catch (error) {
        res.status(500).json({ 
            message: "Error al obtener las emociones",
            error: error.message 
        });
    }
});

// OBTENER LAS EMOCIONES DE UN USUARIO EN EL ÚLTIMO MES
export const getRecentEmociones = asyncHandler(async (req, res) => {
    try {
        const usuarioId = req.params.usuarioId;
        
        if (!usuarioId) {
            return res.status(400).json({ message: "Se requiere el ID del usuario" });
        }

        // Calcular la fecha de hace un mes
        const unMesAtras = new Date();
        unMesAtras.setMonth(unMesAtras.getMonth() - 1);

        // Buscar emociones del usuario creadas en el último mes
        const emociones = await Emocion.find({
            usuario: usuarioId,
            fecha_creacion: { $gte: unMesAtras } // $gte = greater than or equal to
        }).sort({ fecha_creacion: -1 }); // Ordenar de más reciente a más antigua

        if (emociones.length === 0) {
            return res.status(404).json({ 
                message: "No se encontraron emociones para este usuario en el último mes",
                periodo: `Desde ${unMesAtras.toISOString()} hasta ahora`
            });
        }

        res.status(200).json(emociones);
    } catch (error) {
        res.status(500).json({ 
            message: "Error al obtener las emociones recientes",
            error: error.message 
        });
    }
});

// CREAR UNA EMOCION
export const createEmocion = asyncHandler(async (req, res) => {
    // Nota: usuario es en realidad el id del usuario
    const { titulo, descripcion, etiquetas, usuario } = req.body;
    
    // Validación básica
    if (!titulo || !descripcion || !etiquetas || !usuario) {
        return res.status(400).json({ message: "Faltan campos requeridos" });
    }
    
    try {
        
        // Crear nueva Emocion
        const nuevaEmocion = await Emocion.create({
            titulo,
            descripcion,
            etiquetas: etiquetas,
            usuario
        });

        console.log("Emocion guardada:", nuevaEmocion);

        res.status(201).json(nuevaEmocion);


    } catch (error) {
        console.error("Error en creación de Emocion:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
});