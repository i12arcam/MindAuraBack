import { Schema, model } from 'mongoose';

const usuarioSchema = new Schema({
    nombre: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    contraseña: {
        type: String,
        required: true
    }
},
{
    timestamps: { 
        createdAt: 'fecha_creacion',
        updatedAt: 'fecha_actualizacion'
    }
});

export default model('Usuario', usuarioSchema);