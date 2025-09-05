import express from 'express';
import * as ctr from '../controllers/logroController.js';

const router = express.Router();

///api/logros
router.route('/usuario/:usuarioId').get(ctr.obtenerLogrosUsuario);
router.route('/postall').get(ctr.establecerTodosLosLogros);

export default router;