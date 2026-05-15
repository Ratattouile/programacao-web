
const express = require('express');
const router = express.Router();
const planosController = require('../controllers/planosController');


router.get('/', planosController.listarPlanos)

router.post('/', planosController.criarPlanos)

router.patch('/:id/autorizar', planosController.autorizarPlano)



module.exports = router

