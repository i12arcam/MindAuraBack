import { Schema, model } from 'mongoose';

const emocionSchema = new Schema({
    titulo: {
        type: String,
        required: true,
        trim: true
    },
    descripcion: {
        type: String,
        required: true,
        trim: true
    },
    etiquetas: {
        type: [String],
        required: true
    },
    usuario: { 
        type: String, 
        ref: 'Usuario', 
        required: true,
        index: true // Índice para búsquedas rápidas
    }
},
{
    timestamps: { 
        createdAt: 'fecha_creacion'
    }
});

export default model('Emocion', emocionSchema);