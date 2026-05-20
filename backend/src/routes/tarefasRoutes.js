const express = require('express');
const router = express.Router();
const tarefasController = require('../controllers/tarefasController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, tarefasController.listarTarefas);

router.post('/', authMiddleware, tarefasController.criarTarefas);

router.patch('/:id/executar', authMiddleware, tarefasController.executarTarefa);

module.exports = router


