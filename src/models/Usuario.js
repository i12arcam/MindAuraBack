import { Schema, model } from 'mongoose';

const usuarioSchema = new Schema({
    _id: {
        type: String,  // Cambia de ObjectId a String
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
    _id: false,  // Importante: desactiva el _id automático
    versionKey: false // Elimina el campo __v
});

export default model('Usuario', usuarioSchema);