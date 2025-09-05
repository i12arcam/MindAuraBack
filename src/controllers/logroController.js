import asyncHandler from 'express-async-handler';
import Logro from '../models/Logro.js';
import UsuarioLogro from '../models/UsuarioLogro.js';
import { todosLosLogros } from '../data/listaLogrosApp.js';
import { generarTituloConRareza } from '../utils/verificadorLogros.js'

// Obtener todos los logros de un usuario
export const obtenerLogrosUsuario = asyncHandler(async (req, res) => {
    try {
        const { usuarioId } = req.params;

        const logrosUsuario = await UsuarioLogro.find({ usuarioId })
            .populate('logroId')
            .exec();

        // Formatear la respuesta para que coincida con el modelo del frontend
        const logrosFormateados = logrosUsuario.map(logroUsuario => ({
            titulo: generarTituloConRareza(logroUsuario.logroId.titulo, logroUsuario.rarezaActual),
            descripcion: logroUsuario.logroId.descripcion,
            evento: logroUsuario.logroId.evento,
            rareza: logroUsuario.rarezaActual
        }));

        res.status(200).json(logrosFormateados); // Devuelve directamente el array de logros

    } catch (error) {
        console.error('Error al obtener logros del usuario:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener los logros del usuario',
            error: error.message
        });
    }
});

// Establecer todos los logros base en la base de datos
export const establecerTodosLosLogros = asyncHandler(async (req, res) => {
    try {
        // Eliminar logros existentes
        await Logro.deleteMany({});
        
        // Insertar los nuevos logros
        const result = await Logro.insertMany(todosLosLogros);

        res.status(201).json({
            success: true,
            message: `Base de datos actualizada con ${result.length} logros`,
            data: {
                logrosInsertados: result.length
            }
        });

    } catch (error) {
        console.error('Error al actualizar logros:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar la base de logros',
            error: error.message
        });
    }
});
