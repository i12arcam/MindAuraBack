import UsuarioPrograma from '../models/UsuarioPrograma.js';
import asyncHandler from 'express-async-handler';

// INICIAR PROGRAMA
export const iniciarPrograma = asyncHandler(async (req, res) => {
    const { usuarioId, programaId, totalRecursos } = req.params;

    console.log(totalRecursos);

    const numRecursos = Math.max(0, parseInt(totalRecursos) || 0);

    if(numRecursos > 20) {
        return res.status(401).json(["No puede haber programas de más de 20 recursos."]); 
    }

    // Crear relación con array inicializado
    const nuevoPrograma = new UsuarioPrograma({
        usuarioId,
        programaId,
        estadosRecursos: new Array(numRecursos).fill('no-iniciado'),
        progreso: 0
    });

    await nuevoPrograma.save();
    res.status(201).json(nuevoPrograma);
});

// ACTUALIZAR ESTADO RECURSO
export const actualizarEstadoRecurso = asyncHandler(async (req, res) => {
    const { usuarioId, programaId, posicion, estado } = req.params;

    const programa = await UsuarioPrograma.findOne({ usuarioId, programaId });
    if (!programa) return res.status(404).json({ message: "Programa no iniciado" });

    // Actualizar estado específico
    programa.estadosRecursos[posicion] = estado;
    
    // Calcular nuevo progreso
    if(estado == 'completado') {
        const completados = programa.estadosRecursos.filter(e => e === 'completado').length;
        programa.progreso = Math.round((completados / programa.estadosRecursos.length) * 100);
        programa.fechaUltimoAcceso = new Date();
    }
    
    await programa.save();
    res.status(200).json(programa);
});

// OBTENER PROGRAMA USUARIO
export const obtenerProgramaUsuario = asyncHandler(async (req, res) => {
    console.log(req.params);
    const { usuarioId, programaId } = req.params;

    const programa = await UsuarioPrograma.findOne({ usuarioId, programaId });
    if (!programa) return res.status(200).json(null); // No existe relación aún

    res.status(200).json(programa);
});

// OBTENER HISTORIAL PROGRAMAS USUARIO
export const getHistorialProgramas = asyncHandler(async (req, res) => {
    try {
        const { usuarioId } = req.params;
        const { estado } = req.query;

        let query = { usuarioId: usuarioId };
        
        // Filtrar por estado si se proporciona
        if (estado) {
            if (estado === 'completado') {
                query.progreso = { $eq: 100 };
            } else if (estado === 'en_progreso') {
                query.progreso = { $lt: 100, $gt: 0 };
            } else if (estado === 'no-iniciado') {
                query.progreso = { $eq: 0 };
            } 
        }
        
        const programasUsuario = await UsuarioPrograma.find(query)
            .select('usuarioId programaId progreso fechaInicio fechaUltimoAcceso estadosRecursos')
            .sort({ fechaUltimoAcceso: -1 }) // Ordenar por último acceso

        if (!programasUsuario || programasUsuario.length === 0) {
            return res.status(200).json([]); // Devuelve array vacío si no hay programas
        }

        res.status(200).json(programasUsuario);
        
    } catch (error) {
        res.status(500).json({ 
            message: "Error al obtener programas del usuario",
            error: error.message 
        });
    }
});