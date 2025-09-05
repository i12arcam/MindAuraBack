import * as ctr from "../controllers/recursoController.js";
import express from 'express'
const router = express.Router()

///api/recurso
router.route('/all').get(ctr.getRecursos);
router.route('/').post(ctr.createRecurso)
router.route('/:id').put(ctr.updateRecurso)
router.route('/:id').delete(ctr.deleteRecurso)

router.route('/select').get(ctr.selectRecurso)
router.route('/buscar/:parametro/:filtro').get(ctr.buscarRecursos)

router.route('/postall').get(ctr.establecerTodosLosRecursos)

router.route('/:idRecurso').get(ctr.getRecurso);

export default router