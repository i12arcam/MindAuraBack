import * as ctr from "../controllers/programaController.js";
import express from 'express'
const router = express.Router()

///api/programa
router.route('/all').get(ctr.getProgramas);
router.route('/').post(ctr.createPrograma)
router.route('/:id').put(ctr.updatePrograma)
router.route('/:id').delete(ctr.deletePrograma)

router.route('/select').get(ctr.selectPrograma)
router.route('/buscar/:parametro/:filtro').get(ctr.buscarProgramas)

router.route('/postall').get(ctr.establecerTodosLosProgramas)

router.route('/:idPrograma').get(ctr.getPrograma);

export default router