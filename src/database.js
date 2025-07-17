import mongoose from 'mongoose';

const { connect, connection } = mongoose;

const URI = process.env.MONGODB_URI; // Obligatorio (sin default hardcodeado).

if (!URI) {
  throw new Error('La variable MONGODB_URI no está definida en .env');
}

connect(URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Conexión a MongoDB Atlas establecida'))
  .catch((error) => {
    console.error('Error de conexión:', error.message);
    process.exit(1); // Detiene la aplicación si hay error.
  });

connection.on('error', (error) => {
  console.error('Error después de conectar:', error);
});