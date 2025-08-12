import * as ctr from "../controllers/recursoController.js";
import express from 'express'
const router = express.Router()

///api/recurso
router.route('/all').get(ctr.getRecursos);
router.route('/select').get(ctr.selectRecurso)
router.route('/buscar/:parametro/:filtro').get(ctr.buscarRecursos)

router.route('/postall').get(ctr.establecerTodosLosRecursos)

router.route('/:idRecurso').get(ctr.getRecurso);

router.route('/').post(ctr.createRecurso)

export default router