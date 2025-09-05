// routes/UsuarioRegistrosRoutes.js
import * as ctr from "../controllers/usuarioRegistrosController.js";
import express from 'express';
const router = express.Router();

///api/usuarioRegistros
router.route('/registrar').post(ctr.registrarAccion);
router.route('/usuario/:usuario_id').get(ctr.obtenerRegistrosUsuario);
router.route('/reiniciar').put(ctr.reiniciarContador);

export default router;