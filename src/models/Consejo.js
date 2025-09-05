import { Schema, model } from 'mongoose';

const consejoSchema = new Schema({
    titulo: {
        type: String,
        required: true
    },
    contenido: {
        type: String,
        required: true
    },
    etiquetas: {
        type: [String],
        required: true
    }
},
{
    timestamps: { 
        createdAt: 'fecha_creacion'
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

export default model('Consejo', consejoSchema);