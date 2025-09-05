import { calcularXPparaNivel, calcularXP } from '../utils/gestorXp.js';
import UsuarioProgreso from '../models/UsuarioProgreso.js';
import asyncHandler from 'express-async-handler';

// Función para otorgar XP (maneja TODO lo relacionado con XP)
export const otorgarXP = asyncHandler(async (req, res) => {
    console.log("Registrar XP:", req.body);
    const { usuarioId, evento, dificultad, duracion } = req.body;
    
    // 1. Calcular XP ganado
    const xpGanado = calcularXP(evento, dificultad, duracion);
    
    // 2. Obtener progreso actual del usuario
    const progreso = await UsuarioProgreso.findOne({ usuarioId });
    
    // 3. Actualizar nivel y XP
    const datosNivel = await actualizarNivelYXP(progreso, usuarioId, xpGanado);

    console.log(datosNivel);
    
    // 4. Retornar todos los datos relacionados con XP
    res.status(200).json({
        nivel: datosNivel.nivel,
        nuevoNivel: datosNivel.subioNivel
    });
});

// Función para actualizar nivel y XP
const actualizarNivelYXP = async (progreso, usuarioId, xpGanada) => {
    let nivelActual, xpNivelActual, xpSiguienteNivel, subioNivel = false;

    if (!progreso) {
        // Crear nuevo progreso si no existe
        xpSiguienteNivel = calcularXPparaNivel(1);
        const nuevoProgreso = await UsuarioProgreso.create({
            usuarioId,
            xpTotal: xpGanada,
            xpNivelActual: xpGanada,
            xpSiguienteNivel,
            nivel: 1
        });
        
        return { 
            nivel: 1, 
            subioNivel: true // Primer nivel siempre cuenta como subida
        };
    }

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
        subioNivel = true; // Marcamos que hubo al menos un aumento de nivel
    }

    // Actualizar en base de datos
    await UsuarioProgreso.findOneAndUpdate(
        { usuarioId },
        {
            xpTotal: progreso.xpTotal + xpGanada,
            nivel: nivelActual,
            xpNivelActual,
            xpSiguienteNivel,
            ultimaActividad: new Date()
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