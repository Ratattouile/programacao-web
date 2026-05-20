const express = require('express')
const router = express.Router()
const lotesController = require('../controllers/lotesController');
const authMiddleware = require('../middleware/authMiddleware');


router.get('/', authMiddleware, lotesController.listarLotes)

router.post('/', authMiddleware, lotesController.criarLotes)

router.post('/:id/dividir', authMiddleware, lotesController.dividirLote)

router.post('/:id/perdas', authMiddleware, lotesController.perdasLote)

module.exports = router


