// models/UsuarioProgreso.js
import { Schema, model } from 'mongoose';

const UsuarioProgresoSchema = new Schema({
    usuarioId: {
        type: String,
        ref: 'User',
        required: true,
        unique: true
    },
    nivel: {
        type: Number,
        default: 1,
        min: 1
    },
    xpNivelActual: {
        type: Number,
        default: 0,
        min: 0
    },
    xpSiguienteNivel: {
        type: Number,
        default: 100,
        min: 0
    },
    streak: {
        type: Number,
        default: 0,
        min: 0
    },
    ultimaActividad: {
        type: Date,
        default: Date.now
    },
    xpTotal: {
        type: Number,
        default: 0,
        min: 0
    }
}, {
    toJSON: {
        transform: function(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            return ret;
        }
    }
});

export default model('UsuarioProgreso', UsuarioProgresoSchema);