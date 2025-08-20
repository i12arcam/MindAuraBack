import * as ctr from "../controllers/usuarioRecursoController.js";
import express from 'express';
const router = express.Router();

///api/recursoUsuario
router.route('/estado/:usuarioId/:recursoId').get(ctr.getEstadoRecurso);
router.route('/setVisto/:usuarioId/:recursoId').post(ctr.setRecursoVisto);
router.route('/iniciar/:usuarioId/:recursoId').put(ctr.iniciarRecurso);
router.route('/completar/:usuarioId/:recursoId').put(ctr.completarRecurso);
router.route('/historial/:usuarioId').get(ctr.getHistorialRecursos);

export default router;