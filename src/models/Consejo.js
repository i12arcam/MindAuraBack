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
    }
});

export default model('Consejo', consejoSchema);