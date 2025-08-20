import { Schema, model } from 'mongoose';

const programaSchema = new Schema({
    titulo: {
        type: String,
        required: true
    },
    descripcion: { 
        type: String,
        required: false
    },
    categoria: {
        type: String,
        required: true
    },
    etiquetas: {
        type: [String]
    },
    recursos: {
        type: [{
            type: Schema.Types.ObjectId, 
            ref: 'Recurso',
            required: true
        }],
        validate: {
            validator: function(arr) {
                return arr && arr.length > 0;  // Valida que el array no esté vacío
            },
            message: 'Un programa debe tener al menos un recurso'
        }
    }
},
{
    timestamps: {
        createdAt: 'fecha_creacion',
        updatedAt: 'fecha_actualizacion'
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

export default model('Programa', programaSchema);