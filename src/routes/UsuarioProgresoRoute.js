// routes/UsuarioProgresoRoutes.js
import * as ctr from "../controllers/usuarioProgresoController.js";
import express from 'express';
const router = express.Router();

///api/usuarioProgreso
router.route('/sumarxp').post(ctr.otorgarXP);
router.route('/obtenerxp/:usuarioId').get(ctr.obtenerXP);

export default router;