import * as ctr from "../controllers/consejoController.js";
import express from 'express'
const router = express.Router()

///api/consejo
router.route('/').get(ctr.getConsejos)
router.route('/select').get(ctr.selectConsejo)
router.route('/postall').get(ctr.establecerTodosLosConsejos)
router.route('/:id').get(ctr.getConsejo)
router.route('/').post(ctr.createConsejo)

export default router