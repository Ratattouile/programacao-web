const express = require('express')
const router = express.Router()
const lotesController = require('../controllers/lotesController');


router.get('/', lotesController.listarLotes)

router.post('/', lotesController.criarLotes)

router.post('/:id/dividir', lotesController.dividirLote)

router.post('/:id/perdas', lotesController.perdasLote)

module.exports = router


