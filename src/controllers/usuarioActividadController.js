import UsuarioActividad from '../models/UsuarioActividad.js';
import Recurso from '../models/Recurso.js';
import asyncHandler from 'express-async-handler';
import { Types } from 'mongoose';

// OBTENER ESTADO DE ACTIVIDAD PARA UN USUARIO
export const getEstadoActividad = asyncHandler(async (req, res) => {
    try {
        const { usuarioId, recursoId } = req.params;
        
        const actividadUsuario = await UsuarioActividad.findOne({
            usuario_id: usuarioId,
            recurso_id: recursoId
        });
        
        if (!actividadUsuario) {
            return res.status(404).json("no-iniciada");
        }
        
        res.status(200).json(actividadUsuario.estado);
        
    } catch (error) {
        res.status(500).json({ 
            message: "Error al obtener estado de actividad",
            error: error.message 
        });
    }
});

// INICIAR O REANUDAR UNA ACTIVIDAD (en_progreso)
export const iniciarActividad = asyncHandler(async (req, res) => {
    try {
        const { usuarioId, recursoId } = req.params;
        
        // Verificar si el recurso es una actividad
        const recurso = await Recurso.findById(recursoId);
        if (!recurso || recurso.tipo !== 'actividad') {
            return res.status(400).json({ 
                message: "El recurso no es una actividad válida" 
            });
        }
        
        // Buscar o crear la relación usuario-actividad
        const actividadUsuario = await UsuarioActividad.findOneAndUpdate(
            { usuario_id: usuarioId, recurso_id: recursoId },
            { 
                estado: 'en_progreso',
                $setOnInsert: { fecha_inicio: new Date() } // Solo establece en creación
            },
            { 
                upsert: true,
                new: true,
                setDefaultsOnInsert: true 
            }
        );
        console.log(actividadUsuario);
        
        res.status(200).json(actividadUsuario);
        
    } catch (error) {
        res.status(500).json({ 
            message: "Error al iniciar actividad",
            error: error.message 
        });
    }
});

// COMPLETAR UNA ACTIVIDAD
export const completarActividad = asyncHandler(async (req, res) => {
    try {
        const { usuarioId, recursoId } = req.params;
        
        const actividadUsuario = await UsuarioActividad.findOneAndUpdate(
            { 
                usuario_id: usuarioId, 
                recurso_id: recursoId,
                estado: 'en_progreso' // Solo permite completar si estaba en progreso
            },
            { 
                estado: 'completada',
                fecha_finalizacion: new Date() 
            },
            { new: true }
        );
        
        if (!actividadUsuario) {
            return res.status(404).json({ 
                message: "No se encontró una actividad en progreso para completar" 
            });
        }
        
        res.status(200).json(actividadUsuario);
        
    } catch (error) {
        res.status(500).json({ 
            message: "Error al completar actividad",
            error: error.message 
        });
    }
});

// OBTENER HISTORIAL DE ACTIVIDADES DE UN USUARIO
export const getHistorialActividades = asyncHandler(async (req, res) => {
    try {
        const { usuarioId } = req.params;
        const { estado } = req.query;
        
        let query = { usuario_id: usuarioId };
        if (estado) query.estado = estado;
        
        const actividades = await UsuarioActividad.find(query)
            .populate('recurso_id', 'titulo descripcion dificultad')
            .sort({ fecha_inicio: -1 });
        
        res.status(200).json(actividades);
        
    } catch (error) {
        res.status(500).json({ 
            message: "Error al obtener historial de actividades",
            error: error.message 
        });
    }
});