import { calcularXPparaNivel, calcularXP } from '../utils/gestorXp.js';
import UsuarioProgreso from '../models/UsuarioProgreso.js';
import asyncHandler from 'express-async-handler';

// Función para otorgar XP (maneja TODO lo relacionado con XP)
export const otorgarXP = asyncHandler(async (req, res) => {
    const { usuarioId, evento, dificultad, duracion } = req.body;

    // 1. Obtener o crear progreso actual del usuario
    let progreso = await UsuarioProgreso.findOne({ usuarioId });
    
    // 2. Validar y actualizar la racha (y crear progreso si no existe)
    const { rachaActualizada, progresoActualizado } = await actualizarRacha(progreso, usuarioId);
    
    // 3. Si no existía progreso, usar el recién creado
    if (!progreso) {
        progreso = progresoActualizado;
    }
    
    // 4. Calcular XP ganado (usando la racha actualizada)
    const xpGanado = calcularXP(evento, dificultad, duracion, rachaActualizada);
    
    // 5. Actualizar nivel y XP
    const datosNivel = await actualizarNivelYXP(progreso, usuarioId, xpGanado, rachaActualizada);

    console.log(datosNivel);
    
    // 6. Retornar todos los datos relacionados con XP
    res.status(200).json({
        nivel: datosNivel.nivel,
        nuevoNivel: datosNivel.subioNivel,
        racha: rachaActualizada
    });
});

// Función para validar y actualizar la racha
const actualizarRacha = async (progreso, usuarioId) => {
    const ahora = new Date();
    const hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
    
    if (!progreso) {
        // Si no existe progreso, crear uno nuevo con racha = 1
        const nuevoProgreso = await UsuarioProgreso.create({
            usuarioId,
            racha: 1,
            ultimaActividad: ahora,
            xpTotal: 0,
            xpNivelActual: 0,
            xpSiguienteNivel: calcularXPparaNivel(1),
            nivel: 1
        });
        return { 
            rachaActualizada: 1, 
            progresoActualizado: nuevoProgreso 
        };
    }

    const ultimaActividad = new Date(progreso.ultimaActividad);
    const ultimoDiaActividad = new Date(ultimaActividad.getFullYear(), ultimaActividad.getMonth(), ultimaActividad.getDate());
    
    const diferenciaDias = Math.floor((hoy - ultimoDiaActividad) / (1000 * 60 * 60 * 24));
    
    let nuevaRacha = progreso.racha;
    
    if (diferenciaDias === 0) {
        // Mismo día: mantener la racha actual (no sumar)
        return { 
            rachaActualizada: progreso.racha, 
            progresoActualizado: progreso 
        };
    } else if (diferenciaDias === 1) {
        // Día siguiente: incrementar racha
        nuevaRacha = progreso.racha + 1;
    } else if (diferenciaDias >= 2) {
        // Más de 1 día de diferencia: resetear racha a 1
        nuevaRacha = 1;
    }
    
    // Actualizar solo la racha y última actividad
    await UsuarioProgreso.findOneAndUpdate(
        { usuarioId },
        {
            racha: nuevaRacha,
            ultimaActividad: ahora
        }
    );
    
    // Actualizar el objeto progreso localmente para reflejar los cambios
    progreso.racha = nuevaRacha;
    progreso.ultimaActividad = ahora;
    
    return { 
        rachaActualizada: nuevaRacha, 
        progresoActualizado: progreso 
    };
};

// Función para actualizar nivel y XP (modificada)
const actualizarNivelYXP = async (progreso, usuarioId, xpGanada, racha) => {
    let nivelActual, xpNivelActual, xpSiguienteNivel;

    // Guardar nivel anterior para detectar cambios
    const nivelAnterior = progreso.nivel;
    
    xpNivelActual = progreso.xpNivelActual + xpGanada;
    nivelActual = progreso.nivel;
    xpSiguienteNivel = progreso.xpSiguienteNivel;

    // Verificar si sube de nivel
    while (xpNivelActual >= xpSiguienteNivel) {
        xpNivelActual -= xpSiguienteNivel;
        nivelActual += 1;
        xpSiguienteNivel = calcularXPparaNivel(nivelActual);
    }

    // Actualizar en base de datos
    await UsuarioProgreso.findOneAndUpdate(
        { usuarioId },
        {
            xpTotal: progreso.xpTotal + xpGanada,
            nivel: nivelActual,
            xpNivelActual,
            xpSiguienteNivel,
            racha: racha,
            ultimaActividad: progreso.ultimaActividad // Mantener la misma fecha
        }
    );

    return { 
        nivel: nivelActual, 
        subioNivel: nivelActual > nivelAnterior
    };
};

// OBTENER ESTADO DE RECURSO PARA UN USUARIO
export const obtenerXP = asyncHandler(async (req, res) => {
    try {
        const { usuarioId } = req.params;
        
        const usuarioProgreso = await UsuarioProgreso.findOne({
            usuarioId: usuarioId
        });
        
        if (!usuarioProgreso) {
            return res.status(404).json("No existe todavía");
        }
        
        res.status(200).json(usuarioProgreso);
        
    } catch (error) {
        res.status(500).json({ 
            message: "Error al obtener estado del recurso",
            error: error.message 
        });
    }
});