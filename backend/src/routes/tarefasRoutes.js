const express = require('express');
const router = express.Router();
const tarefasController = require('../controllers/tarefasController');




router.get('/', tarefasController.listarTarefas);

router.post('/', tarefasController.criarTarefas);


router.patch('/:id/executar', tarefasController.executarTarefa);


module.exports = router


