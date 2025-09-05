import { verificarLogro } from '../utils/verificadorLogros.js'
import UsuarioRegistros from '../models/UsuarioRegistros.js';
import asyncHandler from 'express-async-handler';

// Lista de eventos válidos para validación
const EVENTOS_VALIDOS = [
    'registrar_emocion',
    'visualizar_articulo', 
    'visualizar_video',
    'completar_actividad',
    'iniciar_sesion',
    'completar_programa',
    'incrementar_meta'
];

export const registrarAccion = asyncHandler(async (req, res) => {
    const { usuarioId, evento } = req.body;

    console.log("Registrar Accion Usuario: " + usuarioId)
    console.log("Registrar Accion Evento: " + evento)

    // Validaciones
    if (!usuarioId || !evento) {
        res.status(400);
        throw new Error('Faltan campos obligatorios');
    }

    if (!EVENTOS_VALIDOS.includes(evento)) {
        res.status(400);
        throw new Error(`Evento no válido. Eventos permitidos: ${EVENTOS_VALIDOS.join(', ')}`);
    }

    // 1. Registrar acción en contadores
    const registro = await UsuarioRegistros.findOneAndUpdate(
        { usuarioId },
        { 
            $inc: { [`registros.${evento}`]: 1 },
            $setOnInsert: { usuarioId }
        },
        { upsert: true, new: true }
    );

    // 2. Verificar logro
    const nuevoContador = registro.registros[evento];
    const logroDesbloqueado = await verificarLogro(usuarioId, evento, nuevoContador);

    // 3. Responder SOLO con el logro
    res.status(200).json({
        nuevoLogro: (logroDesbloqueado != null),
        logro: logroDesbloqueado
    });
});

// OBTENER REGISTROS ACCIONES USUARIO
export const obtenerRegistrosUsuario = asyncHandler(async (req, res) => {
    const { usuario_id } = req.params;

    const registro = await UsuarioRegistros.findOne({ usuario_id });

    if (!registro) {
        res.status(404);
        throw new Error('No se encontraron registros para este usuario');
    }

    res.status(200).json({
        success: true,
        data: {
            usuario_id: registro.usuario_id,
            registros: registro.registros,
            fecha_actualizacion: registro.updatedAt
        }
    });
});

// REINICIAR CONTADORES USUARIO
export const reiniciarContador = asyncHandler(async (req, res) => {
    const { usuario_id, evento } = req.body;

    if (!usuario_id || !evento) {
        res.status(400);
        throw new Error('Faltan campos obligatorios: usuario_id y evento');
    }

    if (!EVENTOS_VALIDOS.includes(evento)) {
        res.status(400);
        throw new Error(`Evento no válido. Eventos permitidos: ${EVENTOS_VALIDOS.join(', ')}`);
    }

    const registro = await UsuarioRegistros.findOneAndUpdate(
        { usuario_id },
        { $set: { [`registros.${evento}`]: 0 } },
        { new: true }
    );

    if (!registro) {
        res.status(404);
        throw new Error('Usuario no encontrado');
    }

    res.status(200).json({
        success: true,
        message: `Contador de ${evento} reiniciado a 0`,
        data: {
            usuario_id: registro.usuario_id,
            [evento]: registro.registros[evento]
        }
    });
});
