import 'dotenv/config'; // Carga .env automáticamente desde la raíz
import mongoose from 'mongoose';
import app from './app.js';

const PORT = process.env.PORT || 5000;

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('MongoDB conectado');
        app.listen(PORT, () => {
            console.log(`Servidor en http://localhost:${PORT}`);
        });
    })
    .catch(err => {
        console.error('Error de conexión:', err.message);
        process.exit(1);
    });