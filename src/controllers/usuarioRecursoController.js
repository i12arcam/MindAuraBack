import UsuarioRecurso from '../models/UsuarioRecurso.js';
import Recurso from '../models/Recurso.js';
import asyncHandler from 'express-async-handler';

// OBTENER ESTADO DE RECURSO PARA UN USUARIO
export const getEstadoRecurso = asyncHandler(async (req, res) => {
    try {
        const { usuarioId, recursoId } = req.params;
        
        const usuarioRecurso = await UsuarioRecurso.findOne({
            usuarioId: usuarioId,
            recursoId: recursoId
        });
        
        if (!usuarioRecurso) {
            return res.status(404).json("no-iniciada");
        }

        console.log(usuarioRecurso.estado)
        
        res.status(200).json(usuarioRecurso.estado);
        
    } catch (error) {
        res.status(500).json({ 
            message: "Error al obtener estado del recurso",
            error: error.message 
        });
    }
});

// ESTABLECER UN RECURSO COMO VISTO
export const setRecursoVisto = asyncHandler(async (req, res) => {
    try {
        const { usuarioId, recursoId } = req.params;

        console.log(req.params);
        
        // Verificar si el recurso existe
        const recurso = await Recurso.findById(recursoId);
        if (!recurso) {
            return res.status(400).json({ 
                message: "El recurso no existe" 
            });
        }
        
        // Buscar o crear la relación usuario-recurso
        const usuarioRecurso = await UsuarioRecurso.findOneAndUpdate(
            { usuarioId: usuarioId, recursoId: recursoId },
            { 
                estado: 'visto',
                $setOnInsert: { fechaInicio: new Date() }
            },
            { 
                upsert: true,
                new: true,
                setDefaultsOnInsert: true 
            }
        );
        
        res.status(200).json(usuarioRecurso);
        
    } catch (error) {
        res.status(500).json({ 
            message: "Error al iniciar recurso",
            error: error.message 
        });
    }
});

// INICIAR O REANUDAR UN RECURSO (en_progreso)
export const iniciarRecurso = asyncHandler(async (req, res) => {
    try {
        const { usuarioId, recursoId } = req.params;
        
        // Verificar si el recurso existe
        const recurso = await Recurso.findById(recursoId);
        if (!recurso) {
            return res.status(400).json({ 
                message: "El recurso no existe" 
            });
        }
        
        // Buscar o crear la relación usuario-recurso
        const usuarioRecurso = await UsuarioRecurso.findOneAndUpdate(
            { usuarioId: usuarioId, recursoId: recursoId },
            { 
                estado: 'en_progreso',
                $setOnInsert: { fechaInicio: new Date() } // Usamos fechaInicio que es el campo del modelo
            },
            { 
                upsert: true,
                new: true,
                setDefaultsOnInsert: true 
            }
        );
        
        res.status(200).json(usuarioRecurso);
        
    } catch (error) {
        res.status(500).json({ 
            message: "Error al iniciar recurso",
            error: error.message 
        });
    }
});

// COMPLETAR UN RECURSO
export const completarRecurso = asyncHandler(async (req, res) => {
    try {
        const { usuarioId, recursoId } = req.params;
        
        const usuarioRecurso = await UsuarioRecurso.findOneAndUpdate(
            { 
                usuarioId: usuarioId, 
                recursoId: recursoId,
                estado: 'en_progreso' // Solo permite completar si estaba en progreso
            },
            { 
                estado: 'completado',
                // No necesitamos fecha_finalizacion ya que el modelo usa timestamps
            },
            { new: true }
        );
        
        if (!usuarioRecurso) {
            return res.status(404).json({ 
                message: "No se encontró un recurso en progreso para completar" 
            });
        }
        
        res.status(200).json(usuarioRecurso);
        
    } catch (error) {
        res.status(500).json({ 
            message: "Error al completar recurso",
            error: error.message 
        });
    }
});

// OBTENER HISTORIAL DE RECURSOS DE UN USUARIO
export const getHistorialRecursos = asyncHandler(async (req, res) => {
    try {
        const { usuarioId } = req.params;
        const { estado } = req.query;
        
        let query = { usuarioId: usuarioId };
        if (estado) query.estado = estado;
        
        const recursos = await UsuarioRecurso.find(query)
            .select('usuarioId recursoId estado fechaInicio') // Solo los campos necesarios
            .sort({ fechaInicio: -1 });
        
        res.status(200).json(recursos);
        
    } catch (error) {
        res.status(500).json({ 
            message: "Error al obtener historial de recursos",
            error: error.message 
        });
    }
});