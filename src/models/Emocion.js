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
        createdAt: 'fechaCreacion'
    },
    // Transforma el documento al convertirlo a JSON
    toJSON: {
        transform: function(doc, ret) {
            ret.id = ret._id;  // Copia `_id` a `id`
            delete ret._id;     // Elimina `_id`
            delete ret.__v;     // Elimina la versión
            return ret;
        }
    }
});

export default model('Emocion', emocionSchema);