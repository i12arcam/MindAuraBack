import { Schema, model } from 'mongoose';

const logroSchema = new Schema({
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
    dificultad : {
        type: String,
        required: true
    },
    estado : {
        type: String,
        required: true
    }
},
{
    timestamps: { 
        createdAt: 'fecha_creacion'
    }
});


export default model('Logro', logroSchema);