const express = require('express');
const router = express.Router();
const plantasController = require('../controllers/plantasController');
const authMiddleware = require('../middleware/authMiddleware');
const verificarCargo = require('../middleware/verificarCargo');

router.get('/', authMiddleware, plantasController.listarPlantas);

router.get('/:id', authMiddleware, plantasController.obterPlanta);

router.post('/', authMiddleware, verificarCargo('Responsavel Tecnico', 'Administrador'), plantasController.criarPlanta);

router.put('/:id', authMiddleware, verificarCargo('Responsavel Tecnico', 'Administrador'), plantasController.atualizarPlanta);

router.delete('/:id', authMiddleware, verificarCargo('Administrador'), plantasController.eliminarPlanta);

module.exports = router;