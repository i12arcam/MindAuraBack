import { Schema, model } from 'mongoose';

const usuarioSchema = new Schema({
    firebase_uid: {  // ID único de Firebase (clave para vincular)
        type: String,
        required: true,
        unique: true
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
        required: true
    }
}, {
    timestamps: {
        createdAt: 'fecha_creacion',
        updatedAt: 'fecha_actualizacion'
    }
});

export default model('Usuario', usuarioSchema);