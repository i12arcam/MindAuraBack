import * as ctr from "../controllers/emocionController.js";
import express from 'express'
const router = express.Router()

// Todas las emociones trabajan con emociones de usuarios, aunque no se mencione expresamente
// en el nombre de las funciones.

///api/emocion
router.route('/:usuarioId').get(ctr.getEmociones);
router.route('/:usuarioId').get(ctr.getRecentEmociones);
router.route('/').post(ctr.createEmocion)

export default router