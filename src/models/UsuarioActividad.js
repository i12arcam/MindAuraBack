import { Schema, model } from 'mongoose';

const usuarioActividadSchema = new Schema({
    usuario_id: {
        type: String,
        ref: 'Usuario',
        required: true
    },
    recurso_id: {
        type: Schema.Types.ObjectId,
        ref: 'Recurso',
        required: true
    },
    estado: {
        type: String,
        required: true,
        enum: ['en_progreso', 'completada'],
        default: 'en_progreso'
    },
    fecha_inicio: {
        type: Date,
        default: Date.now
    },
    fecha_finalizacion: {
        type: Date,
        default: null
    }
}, {
    timestamps: false, 
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
usuarioActividadSchema.index({ usuario_id: 1, recurso_id: 1 }, { unique: true });

export default model('UsuarioActividad', usuarioActividadSchema);