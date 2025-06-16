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
    categoria: {
        type: String,
        required: true
    },
    dias_duracion: {  // Duración en días (RI6)
        type: Number,
        required: true,
        min: 1
    },
    dias_completados: {  // Progreso (días completados)
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
    fecha_inicio : {
        type: Date,
        required: true,
        default: Date.now
    },
    fecha_fin : {
        type: Date,
        required: function() {
            return this.estado === 'completada'; // Obligatorio solo si está completada
        }
    },
    usuario: { 
        type: Schema.Types.ObjectId, 
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

// Validación: end_date debe ser >= start_date
metaSchema.path('fecha_fin').validate(function(value) {
    return value >= this.fecha_inicio;
}, 'La fecha de fin no puede ser anterior a la de inicio');

export default model('Meta', metaSchema);