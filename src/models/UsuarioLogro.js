import { Schema, model } from 'mongoose';

const usuarioLogroSchema = new Schema({
    usuarioId: {
        type: String,
        ref: 'User',
        required: true
    },
    logroId: {
        type: Schema.Types.ObjectId,
        ref: 'Logro',
        required: true
    },
    rarezaActual: {
        type: String,
        enum: ['HIERRO', 'BRONCE', 'PLATA', 'ORO', 'PLATINO', 'DIAMANTE'],
        default: 'HIERRO'
    }
}, {
    timestamps: true
});

// Índice compuesto para evitar duplicados
usuarioLogroSchema.index({ usuarioId: 1, logroId: 1 }, { unique: true });

export default model('UsuarioLogro', usuarioLogroSchema);