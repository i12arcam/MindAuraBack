import * as ctr from "../controllers/metaController.js";
import express from 'express'
const router = express.Router()

// Todas las metas trabajan con metas de usuarios, aunque no se mencione expresamente
// en el nombre de las funciones.

///api/meta
router.route('/usuario/:usuarioId').get(ctr.getMetas); // Obtener todas las metas de un usuario

router.route('/activas/:usuarioId').get(ctr.getMetasActivas); // Obtener metas activas (no completadas) de un usuario
router.route('/completadas/:usuarioId').get(ctr.getMetasCompletadas); // Obtener metas completadas de un usuario
router.route('/canceladas/:usuarioId').get(ctr.getMetasCanceladas); // Obtener metas canceladas de un usuario

router.route('/').post(ctr.createMeta); // Crear una nueva meta

router.route('/progreso/:id').put(ctr.incrementarDiasCompletados); // Incrementar días completados de una meta
router.route('/cancelar/:id').put(ctr.cancelarMeta); // Cancelar Meta
router.route('/reanudar/:id').put(ctr.reanudarMeta); // Reanudar Meta

router.route('/:id').delete(ctr.deleteMeta); // Eliminar una meta

export default router