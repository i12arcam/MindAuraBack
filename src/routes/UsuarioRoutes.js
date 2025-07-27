import * as ctr from "../controllers/usuarioController.js";
import express from 'express'
const router = express.Router()

///api/user
router.route('/').get(ctr.getUsers)
router.route('/:id').get(ctr.getUser)
router.route('/').post(ctr.createUser)
router.route('/modifyProfile/:id').put(ctr.modifyUser)

export default router