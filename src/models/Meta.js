import { Schema, model } from 'mongoose';

const metaSchema = new Schema({
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
    diasDuracion: {  // Duración en días (RI6)
        type: Number,
        required: true,
        min: 1
    },
    diasCompletados: {  // Progreso (días completados)
        type: Number,
        default: 0,
        min: 0
    },
    dificultad : {
        type: String,
        required: true
    },
    estado : {
        type: String,
        required: true
    },
    fechaInicio : {
        type: Date,
        required: true,
        default: Date.now
    },
    fechaFin : {
        type: Date,
        required: function() {
            return this.estado === 'completada'; // Obligatorio solo si está completada
        }
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
        updatedAt: 'fechaActualizacion'
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

// Validación: end_date debe ser >= start_date
metaSchema.path('fechaFin').validate(function(value) {
    return value >= this.fechaInicio;
}, 'La fecha de fin no puede ser anterior a la de inicio');

export default model('Meta', metaSchema);