// src/index.js
import dotenv from 'dotenv';
import app from './app.js';  // Usamos import para traer la aplicación Express
import './database.js';      // Conexión a la base de datos
import cors from 'cors';

dotenv.config();  // Cargar variables de entorno desde .env

//Usar cors/// NO TOCAR QUE SI NO NO FUNCIONA NA

app.use(cors({
    origin: '*', // Permitir todas las orígenes, puedes restringirlo a tu dominio específico
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));


// Iniciar el servidor
async function main() {
  const port = app.get('port');
  await app.listen(port);
  console.log('El servidor se está ejecutando en el puerto:', port);
}

main();
