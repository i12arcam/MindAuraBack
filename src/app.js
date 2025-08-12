import express from 'express';
import cors from 'cors';
import session from 'express-session';
import 'dotenv/config'; // Carga las variables del .env a process.env

const app = express();

// Configuración sesión
app.use(session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false
    
}));
// Configuración cors
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE']
};
app.use(cors(corsOptions));

// Middlewares
app.use(express.json());

// Rutas
import userRoutes from './routes/UsuarioRoutes.js';
import consejoRoutes from './routes/ConsejoRoutes.js';
import emocionRoutes from './routes/EmocionRoute.js';
import recursoRoutes from './routes/RecursoRoute.js';
import metaRoutes from './routes/MetaRoute.js';
import actividadRoutes from './routes/UsuarioActividadRoute.js';

app.use('/api/user', userRoutes);
app.use('/api/consejo', consejoRoutes);
app.use('/api/emocion', emocionRoutes);
app.use('/api/recurso', recursoRoutes);
app.use('/api/meta', metaRoutes);
app.use('/api/actividad', actividadRoutes);

app.use(express.static('public'));

// Verifica que la sesión funciona en cada petición que se hace
app.use((req, res, next) => {
    console.log(req.session); // Verifica si la sesión se está inicializando correctamente
    next();
});

// Exporta la aplicación
export default app;
