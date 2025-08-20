import { Schema, model } from 'mongoose';

const usuarioRecursoSchema = new Schema({
    usuarioId: {
        type: String,
        ref: 'Usuario',
        required: true
    },
    recursoId: {
        type: Schema.Types.ObjectId,
        ref: 'Recurso',
        required: true
    },
    estado: {
        type: String,
        required: true,
        enum: ['en_progreso', 'completado', 'visto'],
        default: 'en_progreso'
    }
}, {
    timestamps: { 
        createdAt: 'fechaInicio'
    },
    versionKey: false,  
    toJSON: {
        transform: function(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            return ret;
        }
    }
});

// Índice compuesto para evitar duplicados de usuario-recurso
usuarioRecursoSchema.index({ usuarioId: 1, recursoId: 1 }, { unique: true });

export default model('UsuarioRecurso', usuarioRecursoSchema);