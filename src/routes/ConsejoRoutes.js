import * as ctr from "../controllers/consejoController.js";
import express from 'express'
const router = express.Router()

///api/consejo
router.route('/all').get(ctr.getConsejos)
router.route('/').post(ctr.createConsejo)
router.route('/:id').put(ctr.updateConsejo)
router.route('/:id').delete(ctr.deleteConsejo)


router.route('/select').get(ctr.selectConsejo)
router.route('/postall').get(ctr.establecerTodosLosConsejos)
router.route('/:id').get(ctr.getConsejo)

export default router