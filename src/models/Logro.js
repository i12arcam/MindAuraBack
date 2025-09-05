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
    evento: { // Tipo de evento al que el logro está asociado
        type: String,
        required: true
    }
});

export default model('Logro', logroSchema);