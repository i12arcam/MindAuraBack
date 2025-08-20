import { Schema, model } from 'mongoose';

const usuarioSchema = new Schema({
    _id: {
        type: String, 
        required: true
    },
    nombre: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    metodo_autenticacion: {  // 'google' o 'email' (para saber cómo inició sesión)
        type: String,
        required: false
    }
}, {
    timestamps: {
        createdAt: 'fecha_creacion',
        updatedAt: 'fecha_actualizacion'
    },
    _id: false, 
    versionKey: false 
});

export default model('Usuario', usuarioSchema);