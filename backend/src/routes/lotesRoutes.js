const express = require('express')
const router = express.Router()
const lotesController = require('../controllers/lotesController');
const authMiddleware = require('../middleware/authMiddleware');
const verificarCargo = require('../middleware/verificarCargo');


router.get('/', authMiddleware, lotesController.listarLotes)

router.post('/', authMiddleware, verificarCargo('Responsavel Tecnico', 'Administrador'), lotesController.criarLotes)

router.post('/:id/dividir', authMiddleware, verificarCargo('Responsavel Tecnico', 'Administrador'), lotesController.dividirLote)

router.post('/:id/perdas', authMiddleware, verificarCargo('Técnico', 'Responsavel Tecnico', 'Administrador'), lotesController.perdasLote)

module.exports = router


