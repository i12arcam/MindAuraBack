import { Schema, model } from 'mongoose';

const recursoSchema = new Schema({
    titulo: {
        type: String,
        required: true
    },
    descripcion: {
        type: String,
        required: false
    },
    fecha_creacion: {
        type: Date,
        default: Date.now
    },
    autor: {
        type: String,
        required: false
    },
    categoria: {
        type: String
    },
    etiquetas: {
        type: [String]
    },
    duracion: {
        type: Number
    },
    enlace_contenido: {
        type: String,
        required: true
    },
    tipo: {
        type: String,
        required: true,
        enum: ['articulo', 'video', 'actividad']
    },
    dificultad: {
        type: String,
        required: function() {
            return this.tipo === 'actividad';
        },
        enum: ['baja', 'media', 'alta'],
        default: null
    },
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
            delete ret.__v;     // Elimina la versión (opcional)
            return ret;
        }
    }
});

export default model('Recurso', recursoSchema);