import * as ctr from "../controllers/usuarioProgramaController.js";
import express from 'express';
import asyncHandler from 'express-async-handler';

const router = express.Router();

///api/programaUsuario
router.post('/iniciar/:usuarioId/:programaId/:totalRecursos', asyncHandler(ctr.iniciarPrograma));
router.put('/:usuarioId/:programaId/:posicion/:estado', asyncHandler(ctr.actualizarEstadoRecurso));
router.get('/historial/:usuarioId', asyncHandler(ctr.getHistorialProgramas)); 

router.get('/:usuarioId/:programaId', asyncHandler(ctr.obtenerProgramaUsuario));

export default router;