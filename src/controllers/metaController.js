import Meta from '../models/Meta.js';
import asyncHandler from 'express-async-handler';

// OBTENER TODAS LAS METAS DE UN USUARIO
export const getMetas = asyncHandler(async (req, res) => {
    try {
        const usuarioId = req.params.usuarioId;
        
        if (!usuarioId) {
            return res.status(400).json({ message: "Se requiere el ID del usuario" });
        }

        const metas = await Meta.find({ usuario: usuarioId });
        
        if (metas.length === 0) {
            return res.status(404).json({ message: "No se encontraron metas para este usuario" });
        }

        res.status(200).json(metas);
    } catch (error) {
        res.status(500).json({ 
            message: "Error al obtener las metas",
            error: error.message 
        });
    }
});

// OBTENER LAS METAS ACTIVAS DE UN USUARIO (no completadas)
export const getMetasActivas = asyncHandler(async (req, res) => {
    try {
        const usuarioId = req.params.usuarioId;
        
        if (!usuarioId) {
            return res.status(400).json({ message: "Se requiere el ID del usuario" });
        }

        const metas = await Meta.find({
            usuario: usuarioId,
            estado: { $eq: 'en_progreso' } // $eq = equal
        }).sort({ fecha_inicio: -1 });

        if (metas.length === 0) {
            return res.status(404).json({ 
                message: "No se encontraron metas activas para este usuario"
            });
        }
        console.log(metas)
        res.status(200).json(metas);
    } catch (error) {
        res.status(500).json({ 
            message: "Error al obtener las metas activas",
            error: error.message 
        });
    }
});
// OBTENER LAS METAS COMPLETADAS DE UN USUARIO
export const getMetasCompletadas = asyncHandler(async (req, res) => {
    try {
        const usuarioId = req.params.usuarioId;
        
        if (!usuarioId) {
            return res.status(400).json({ message: "Se requiere el ID del usuario" });
        }

        const metas = await Meta.find({
            usuario: usuarioId,
            estado: { $eq: 'completada' } // $eq = equal
        }).sort({ fecha_inicio: -1 });

        if (metas.length === 0) {
            return res.status(404).json({ 
                message: "No se encontraron metas completadas para este usuario"
            });
        }
        console.log(metas)
        res.status(200).json(metas);
    } catch (error) {
        res.status(500).json({ 
            message: "Error al obtener las metas completadas",
            error: error.message 
        });
    }
});
// OBTENER LAS METAS CANCELADAS DE UN USUARIO
export const getMetasCanceladas = asyncHandler(async (req, res) => {
    try {
        const usuarioId = req.params.usuarioId;
        
        if (!usuarioId) {
            return res.status(400).json({ message: "Se requiere el ID del usuario" });
        }

        const metas = await Meta.find({
            usuario: usuarioId,
            estado: { $eq: 'cancelada' } // $eq = equal
        }).sort({ fecha_inicio: -1 });

        if (metas.length === 0) {
            return res.status(404).json({ 
                message: "No se encontraron metas canceladas para este usuario"
            });
        }
        console.log(metas)
        res.status(200).json(metas);
    } catch (error) {
        res.status(500).json({ 
            message: "Error al obtener las metas canceladas",
            error: error.message 
        });
    }
});

// CREAR UNA NUEVA META
export const createMeta = asyncHandler(async (req, res) => {
    console.log("ola")
    const { 
        titulo, 
        descripcion, 
        diasDuracion, 
        dificultad,
        estado,
        usuario 
    } = req.body;
    
    // Validación de campos requeridos
    if (!titulo || !descripcion || !diasDuracion || !dificultad || !estado || !usuario) {
        return res.status(400).json({ message: "Faltan campos requeridos" });
    }
    
    try {
        // Crear nueva Meta
        const nuevaMeta = await Meta.create({
            titulo,
            descripcion,
            diasDuracion,
            dificultad,
            estado,
            usuario
            // fecha_inicio se establece automáticamente por el modelo
            // fecha_fin solo es requerida si estado es 'completada'
        });

        res.status(201).json(nuevaMeta);

    } catch (error) {
        console.error("Error en creación de Meta:", error);
        res.status(500).json({ 
            message: "Error interno del servidor",
            error: error.message 
        });
    }
});

// INCREMENTAR DÍAS COMPLETADOS DE UNA META
export const incrementarDiasCompletados = asyncHandler(async (req, res) => {

    const { id } = req.params;

    try {
        const meta = await Meta.findById(id);
        if (!meta) {
            return res.status(404).json({ message: "Meta no encontrada" });
        }

        // Verificar que no se exceda la duración total
        if (meta.diasCompletados >= meta.diasDuracion) {
            return res.status(400).json({ message: "La meta ya ha sido completada" });
        }

        meta.diasCompletados += 1;
        
        // Si se alcanza la duración total, marcar como completada
        if (meta.diasCompletados === meta.diasDuracion) {
            meta.estado = 'completada';
            meta.fechaFin = new Date();
        }

        await meta.save();

        res.status(200).json(meta);
    } catch (error) {
        res.status(500).json({ 
            message: "Error al actualizar el progreso de la meta",
            error: error.message 
        });
    }
});

// CANCELAR META
export const cancelarMeta = asyncHandler(async (req, res) => {

    const { id } = req.params;

    try {
        const meta = await Meta.findById(id);
        if (!meta) {
            return res.status(404).json({ message: "Meta no encontrada" });
        }
        
        meta.estado = 'cancelada';       

        await meta.save();

        res.status(200).json(meta);
    } catch (error) {
        res.status(500).json({ 
            message: "Error al actualizar el progreso de la meta",
            error: error.message 
        });
    }
});

// RANUDAR META (previamente cancelada)
export const reanudarMeta = asyncHandler(async (req, res) => {

    const { id } = req.params;

    try {
        const meta = await Meta.findById(id);
        if (!meta) {
            return res.status(404).json({ message: "Meta no encontrada" });
        }
        if(meta.estado == 'cancelada'){
            meta.estado = 'en_progreso'; 
        }

        await meta.save();

        res.status(200).json(meta);
    } catch (error) {
        res.status(500).json({ 
            message: "Error al actualizar el progreso de la meta",
            error: error.message 
        });
    }
});

// ELIMINAR UNA META
export const deleteMeta = asyncHandler(async (req, res) => {
    const { id } = req.params;

    try {
        const metaEliminada = await Meta.findByIdAndDelete(id);
        
        if (!metaEliminada) {
            return res.status(404).json({ message: "Meta no encontrada" });
        }

        res.status(200).json({ 
            message: "Meta eliminada correctamente",
            meta: metaEliminada 
        });
    } catch (error) {
        res.status(500).json({ 
            message: "Error al eliminar la meta",
            error: error.message 
        });
    }
});