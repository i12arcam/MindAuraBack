import { Schema, model } from 'mongoose';

const usuarioRegistrosSchema = new Schema({
    usuarioId: {
        type: String,
        ref: 'Usuario',
        required: true,
        unique: true  // Un registro por usuario
    },
    registros: {
        registrar_emocion: { type: Number, default: 0 },
        visualizar_articulo: { type: Number, default: 0 },
        visualizar_video: { type: Number, default: 0 },
        completar_actividad: { type: Number, default: 0 },
        iniciar_sesion: { type: Number, default: 0 },
        completar_programa: { type: Number, default: 0 },
        incrementar_meta: { type: Number, default: 0 },
    }
}, {
    versionKey: false
});

export default model('UsuarioRegistros', usuarioRegistrosSchema);