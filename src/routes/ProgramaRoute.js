import * as ctr from "../controllers/programaController.js";
import express from 'express'
const router = express.Router()

///api/programa
router.route('/all').get(ctr.getProgramas);
router.route('/select').get(ctr.selectPrograma)
router.route('/buscar/:parametro/:filtro').get(ctr.buscarProgramas)

router.route('/postall').get(ctr.establecerTodosLosProgramas)

router.route('/:idPrograma').get(ctr.getPrograma);

router.route('/').post(ctr.createPrograma)

export default router