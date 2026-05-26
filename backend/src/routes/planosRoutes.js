
const express = require('express');
const router = express.Router();
const planosController = require('../controllers/planosController');
const authMiddleware = require('../middleware/authMiddleware');
const verificarCargo = require('../middleware/verificarCargo');

router.get('/', authMiddleware, planosController.listarPlanos)

router.post('/', authMiddleware, verificarCargo('Responsavel Tecnico', 'Administrador'), planosController.criarPlanos)

router.patch('/:id/autorizar', verificarCargo('Responsavel Tecnico', 'Administrador'), authMiddleware, planosController.autorizarPlano)

module.exports = router

