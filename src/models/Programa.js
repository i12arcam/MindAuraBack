import { Schema, model, Types } from 'mongoose';

const programaSchema = new Schema({
    titulo: {
        type: String,
        required: true
    },
    descripcion: {  // Añadido como campo útil aunque no estaba en RI5
        type: String,
        required: false
    },
    categoria: {
        type: String,
        required: true
    },
    recursos: [{
        type: Schema.Types.ObjectId, 
        ref: 'Recurso',
        required: true,
        validate: {
            validator: function(value) {
                return value.length > 0;
            },
            message: 'Un programa debe tener al menos un recurso'
        }
    }]
},
{
    timestamps: {
        createdAt: 'fecha_creacion',
        updatedAt: 'fecha_actualizacion'
    }
});

export default model('Programa', programaSchema);