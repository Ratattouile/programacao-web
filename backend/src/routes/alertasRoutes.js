
const express = require('express');
const router = express.Router();
const alertasController = require('../controllers/alertasController');
const authMiddleware = require('../middleware/authMiddleware');
const verificarCargo = require('../middleware/verificarCargo');

router.get('/', authMiddleware, alertasController.listarAlertas)

router.patch('/:id/resolver', authMiddleware, verificarCargo('Técnico', 'Responsavel Tecnico', 'Administrador'), alertasController.resolverAlerta);

router.patch('/:id/ignorar', authMiddleware, verificarCargo('Técnico', 'Responsavel Tecnico', 'Administrador'), alertasController.ignorarAlerta)



module.exports = router

