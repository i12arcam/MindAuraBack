import Emocion from '../models/Emocion.js';
import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';

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
export const getAllEmociones = asyncHandler(async (req, res) => {
    try {
        const usuarioId = req.params.usuarioId;
        
        if (!usuarioId) {
            return res.status(400).json({ message: "Se requiere el ID del usuario" });
        }

        // Buscar emociones del usuario creadas en el último mes
        const emociones = await Emocion.find({
            usuario: usuarioId
        }).sort({ fechaCreacion: -1 }); // Ordenar de más reciente a más antigua

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

// FILTRADO EMOCIONES HISTORIAL
export const getHistorialEmociones = asyncHandler(async (req, res) => {
    try {
        const usuarioId = req.params.usuarioId;
        
        if (!usuarioId) {
            return res.status(400).json({ message: "Se requiere el ID del usuario" });
        }

        const unMesAtras = new Date();
        unMesAtras.setMonth(unMesAtras.getMonth() - 1);

        // Primero verifiquemos si hay datos
        const existeEmociones = await Emocion.exists({ usuario: usuarioId });
        if (!existeEmociones) {
            return res.status(404).json({ 
                message: "No se encontraron emociones para este usuario",
                periodo: {
                    inicio: unMesAtras.toISOString(),
                    fin: new Date().toISOString()
                }
            });
        }

        // Agrupamos por la primera etiqueta (asumiendo que es el tipo principal)
        const emocionesAgrupadas = await Emocion.aggregate([
            {
                $match: {
                    usuario: usuarioId,
                    fechaCreacion: { $gte: unMesAtras }
                }
            },
            {
                $unwind: "$etiquetas" // Descomponemos el array de etiquetas
            },
            {
                $group: {
                    _id: "$etiquetas", // Agrupamos por cada etiqueta
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    tipo: "$_id",
                    count: 1,
                    _id: 0
                }
            }
        ]);

        console.log("Datos agrupados:", emocionesAgrupadas);

        // Filtramos solo las emociones básicas
        const emocionesBase = ["Alegria", "Tristeza", "Miedo", "Ira"];
        const resultado = emocionesBase.map(emocion => {
            const encontrada = emocionesAgrupadas.find(e => e.tipo === emocion);
            return {
                tipo: emocion,
                count: encontrada ? encontrada.count : 0
            };
        });

        console.log("Resultado final:", resultado);

        res.status(200).json({
            emociones: resultado,
            periodo: {
                inicio: unMesAtras.toISOString(),
                fin: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error("Error detallado:", error);
        res.status(500).json({ 
            message: "Error al obtener el historial de emociones",
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
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
            etiquetas,
            usuario
        });

        console.log("Emocion guardada:", nuevaEmocion);

        res.status(201).json(nuevaEmocion);


    } catch (error) {
        console.error("Error en creación de Emocion:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
});