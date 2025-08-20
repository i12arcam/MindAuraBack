import { Schema, model } from 'mongoose';

const usuarioProgramaSchema = new Schema({
    usuarioId: {
        type: String,
        ref: 'Usuario', 
        required: true
    },
    programaId: {
        type: Schema.Types.ObjectId,
        ref: 'Programa',
        required: true
    },
    progreso: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
        default: 0
    },
    estadosRecursos: [{
        type: String,
        enum: ['no-iniciado', 'en_progreso', 'completado'],
        default: 'no-iniciado'
    }],
    fechaInicio: {
        type: Date,
        default: Date.now
    },
    fechaUltimoAcceso: {
        type: Date,
        default: Date.now
    }
}, {
    versionKey: false,
    toJSON: {
        transform: function(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            return ret;
        }
    }
});

// Índice compuesto para evitar duplicados de usuario-programa
usuarioProgramaSchema.index({ usuarioId: 1, programaId: 1 }, { unique: true });

export default model('UsuarioPrograma', usuarioProgramaSchema);