const express = require('express');
const router = express.Router();
const tarefasController = require('../controllers/tarefasController');
const authMiddleware = require('../middleware/authMiddleware');
const verificarCargo = require('../middleware/verificarCargo');

router.get('/', authMiddleware, tarefasController.listarTarefas);

router.post('/', authMiddleware, verificarCargo('Responsavel Tecnico', 'Administrador'), tarefasController.criarTarefas);

router.patch('/:id/executar', authMiddleware, verificarCargo('Técnico', 'Responsavel Tecnico', 'Administrador'), tarefasController.executarTarefa);

module.exports = router


