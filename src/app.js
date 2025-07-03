// src/app.js
import express from 'express';  // Usamos import para traer express
import cors from 'cors';
import session from 'express-session';

const app = express();

//NUEVO
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false
    
}));
const corsOptions = { 
    origin: 'http://localhost:3000',
    credentials: true
}
app.use(cors(corsOptions));

// Configura el puerto
app.set('port', process.env.PORT || 3000);

// Middlewares
app.use(express.json());
//app.use(bodyParser.json());


// Rutas
import userRoutes from './routes/UsuarioRoutes.js';  // Importa las rutas usando import

app.use('/api/user', userRoutes);

app.use(express.static('public'));

//NUEVO
// Verificación de la configuración de la sesión
app.use((req, res, next) => {
    //console.log(req.session); // Verifica si la sesión se está inicializando correctamente
    next();
});
//NUEVO

// Exporta la aplicación
export default app;  // Usamos export default para exportar el app
