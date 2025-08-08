import * as ctr from "../controllers/usuarioActividadController.js";
import express from 'express';
const router = express.Router();

///api/actividad
router.route('/estado/:usuarioId/:recursoId').get(ctr.getEstadoActividad);
router.route('/iniciar/:usuarioId/:recursoId').post(ctr.iniciarActividad);
router.route('/completar/:usuarioId/:recursoId').put(ctr.completarActividad);
router.route('/historial/:usuarioId').get(ctr.getHistorialActividades);

export default router;